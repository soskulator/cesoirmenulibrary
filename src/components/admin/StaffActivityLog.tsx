import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  GraduationCap, 
  BookOpen, 
  User, 
  AlertCircle,
  Trophy,
  ClipboardCheck,
  Clock,
  ChevronDown,
  ChevronRight,
  Search,
  PlayCircle
} from 'lucide-react';

interface EmployeeStats {
  user_id: string;
  user_email: string;
  user_name: string | null;
  testsStarted: number;
  testsCompleted: Array<{
    id: string;
    name: string;
    score: number;
    percentage: number;
    total_questions: number;
    completed_at: string;
  }>;
  quizzesCompleted: Array<{
    id: string;
    name: string;
    score: number;
    percentage: number;
    total_questions: number;
    completed_at: string;
  }>;
  flashcardsKnown: Array<{
    id: string;
    item_name: string;
    studied_at: string;
  }>;
  totalActiveTime: number; // in seconds
  lastActive: string | null;
}

export function StaffActivityLog() {
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setError(null);

      // Fetch all profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, { email: p.email, name: p.full_name }])
      );

      // Fetch FOH test attempts (started = all, completed = has completed_at)
      const { data: fohAttempts, error: fohError } = await supabase
        .from('foh_test_attempts')
        .select('*')
        .order('started_at', { ascending: false });

      if (fohError) throw fohError;

      // Fetch quiz scores
      const { data: quizScores, error: quizError } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('completed_at', { ascending: false });

      if (quizError) throw quizError;

      // Fetch flashcards marked as known
      const { data: studyProgress, error: studyError } = await supabase
        .from('study_progress')
        .select('*')
        .eq('is_known', true)
        .order('studied_at', { ascending: false });

      if (studyError) throw studyError;

      // Fetch session data for active time
      const { data: sessions, error: sessionsError } = await supabase
        .from('user_sessions')
        .select('*');

      // Sessions table might not exist yet, handle gracefully
      const sessionsData = sessionsError ? [] : (sessions || []);

      // Aggregate data by employee
      const employeeMap = new Map<string, EmployeeStats>();

      // Initialize with all profiles
      profiles?.forEach(p => {
        employeeMap.set(p.id, {
          user_id: p.id,
          user_email: p.email,
          user_name: p.full_name,
          testsStarted: 0,
          testsCompleted: [],
          quizzesCompleted: [],
          flashcardsKnown: [],
          totalActiveTime: 0,
          lastActive: null,
        });
      });

      const testLabels: Record<string, string> = {
        service_staff: 'Server/Bartender Test',
        'foh-service': 'Server/Bartender Test',
        service_assistant: 'Server Assistant Test',
        'foh-sa': 'Server Assistant Test',
      };

      const quizLabels: Record<string, string> = {
        food: 'Food Quiz',
        wine: 'Wine Quiz',
        spirits: 'Spirits Quiz',
        allergy: 'Allergy Quiz',
        cocktails: 'Cocktails Quiz',
      };

      // Process FOH test attempts
      fohAttempts?.forEach(attempt => {
        const emp = employeeMap.get(attempt.user_id);
        if (!emp) return;

        emp.testsStarted++;

        if (attempt.completed_at) {
          emp.testsCompleted.push({
            id: attempt.id,
            name: testLabels[attempt.test_type] || attempt.test_type,
            score: attempt.score || 0,
            percentage: attempt.percentage || 0,
            total_questions: attempt.total_questions || 0,
            completed_at: attempt.completed_at,
          });

          // Update last active
          if (!emp.lastActive || new Date(attempt.completed_at) > new Date(emp.lastActive)) {
            emp.lastActive = attempt.completed_at;
          }
        }
      });

      // Process quiz scores
      quizScores?.forEach(score => {
        const emp = employeeMap.get(score.user_id);
        if (!emp) return;

        emp.quizzesCompleted.push({
          id: score.id,
          name: quizLabels[score.quiz_type] || `${score.quiz_type} Quiz`,
          score: score.score,
          percentage: score.percentage,
          total_questions: score.total_questions,
          completed_at: score.completed_at,
        });

        if (!emp.lastActive || new Date(score.completed_at) > new Date(emp.lastActive)) {
          emp.lastActive = score.completed_at;
        }
      });

      // Process study progress
      studyProgress?.forEach(progress => {
        const emp = employeeMap.get(progress.user_id);
        if (!emp) return;

        emp.flashcardsKnown.push({
          id: progress.id,
          item_name: progress.menu_item_name,
          studied_at: progress.studied_at,
        });

        if (!emp.lastActive || new Date(progress.studied_at) > new Date(emp.lastActive)) {
          emp.lastActive = progress.studied_at;
        }
      });

      // Process sessions for active time
      sessionsData.forEach((session: any) => {
        const emp = employeeMap.get(session.user_id);
        if (!emp) return;

        emp.totalActiveTime += session.duration_seconds || 0;

        const sessionTime = session.session_end || session.last_heartbeat;
        if (sessionTime && (!emp.lastActive || new Date(sessionTime) > new Date(emp.lastActive))) {
          emp.lastActive = sessionTime;
        }
      });

      // Convert to array and filter out employees with no activity
      const employeeList = Array.from(employeeMap.values())
        .filter(emp => 
          emp.testsStarted > 0 || 
          emp.testsCompleted.length > 0 || 
          emp.quizzesCompleted.length > 0 || 
          emp.flashcardsKnown.length > 0 ||
          emp.totalActiveTime > 0
        )
        .sort((a, b) => {
          // Sort by last active (most recent first)
          if (!a.lastActive && !b.lastActive) return 0;
          if (!a.lastActive) return 1;
          if (!b.lastActive) return -1;
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        });

      setEmployees(employeeList);
    } catch (err) {
      console.error('Error fetching employee stats:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const toggleEmployee = (userId: string) => {
    setExpandedEmployees(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    return (
      emp.user_email.toLowerCase().includes(query) ||
      (emp.user_name && emp.user_name.toLowerCase().includes(query))
    );
  });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-copper" />
            Staff Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-copper" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-copper" />
            Staff Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-copper" />
              Staff Activity Log
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {employees.length} employee{employees.length !== 1 ? 's' : ''} with activity
            </p>
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-3 sm:px-6 pb-3">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchQuery 
                ? 'No employees match your search.' 
                : 'No activity recorded yet. Activity will appear as staff complete tests and study flashcards.'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[320px] pr-2">
            <div className="space-y-2">
              {filteredEmployees.map((emp) => (
                <Collapsible
                  key={emp.user_id}
                  open={expandedEmployees.has(emp.user_id)}
                  onOpenChange={() => toggleEmployee(emp.user_id)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-copper" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-sm truncate">
                          {emp.user_name || emp.user_email}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap mt-0.5">
                          {emp.testsCompleted.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {emp.testsCompleted.length} test{emp.testsCompleted.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {emp.quizzesCompleted.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ClipboardCheck className="w-3 h-3" />
                              {emp.quizzesCompleted.length} quiz{emp.quizzesCompleted.length !== 1 ? 'zes' : ''}
                            </span>
                          )}
                          {emp.flashcardsKnown.length > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {emp.flashcardsKnown.length} mastered
                            </span>
                          )}
                          {emp.totalActiveTime > 0 && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(emp.totalActiveTime)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {emp.lastActive && (
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {formatDistanceToNow(new Date(emp.lastActive), { addSuffix: true })}
                          </span>
                        )}
                        {expandedEmployees.has(emp.user_id) ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="ml-12 mr-2 mt-2 space-y-3 pb-2">
                      {/* Stats Summary */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
                            {emp.testsStarted}
                          </p>
                          <p className="text-xs text-purple-600 dark:text-purple-300">Tests Started</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                            {emp.testsCompleted.length + emp.quizzesCompleted.length}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">Completed</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-green-700 dark:text-green-400">
                            {emp.flashcardsKnown.length}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-300">Mastered</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                            {formatDuration(emp.totalActiveTime)}
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-300">Active Time</p>
                        </div>
                      </div>

                      {/* Tests Completed */}
                      {emp.testsCompleted.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> Tests Completed
                          </p>
                          <div className="space-y-1">
                            {emp.testsCompleted.slice(0, 5).map(test => (
                              <div key={test.id} className="flex items-center justify-between bg-background rounded px-2 py-1.5 text-sm">
                                <span className="truncate">{test.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${getScoreColor(test.percentage)}`}>
                                    {Math.round(test.percentage)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({test.score}/{test.total_questions})
                                  </span>
                                </div>
                              </div>
                            ))}
                            {emp.testsCompleted.length > 5 && (
                              <p className="text-xs text-muted-foreground pl-2">
                                +{emp.testsCompleted.length - 5} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quizzes Completed */}
                      {emp.quizzesCompleted.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <ClipboardCheck className="w-3 h-3" /> Quizzes Completed
                          </p>
                          <div className="space-y-1">
                            {emp.quizzesCompleted.slice(0, 5).map(quiz => (
                              <div key={quiz.id} className="flex items-center justify-between bg-background rounded px-2 py-1.5 text-sm">
                                <span className="truncate">{quiz.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${getScoreColor(quiz.percentage)}`}>
                                    {Math.round(quiz.percentage)}%
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({quiz.score}/{quiz.total_questions})
                                  </span>
                                </div>
                              </div>
                            ))}
                            {emp.quizzesCompleted.length > 5 && (
                              <p className="text-xs text-muted-foreground pl-2">
                                +{emp.quizzesCompleted.length - 5} more
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Flashcards Mastered */}
                      {emp.flashcardsKnown.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Flashcards Mastered
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {emp.flashcardsKnown.slice(0, 10).map(card => (
                              <Badge key={card.id} variant="secondary" className="text-xs">
                                {card.item_name}
                              </Badge>
                            ))}
                            {emp.flashcardsKnown.length > 10 && (
                              <Badge variant="outline" className="text-xs">
                                +{emp.flashcardsKnown.length - 10} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
