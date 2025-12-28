import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Trophy, TrendingUp, Target, Medal, User, AlertCircle } from 'lucide-react';

interface QuizScore {
  id: string;
  user_id: string;
  quiz_type: string;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
  user_email?: string;
  user_name?: string;
}

interface StaffPerformance {
  user_id: string;
  user_email: string;
  user_name: string | null;
  totalQuizzes: number;
  avgScore: number;
  bestScore: number;
  lastActivity: string;
}

const quizTypeLabels: Record<string, string> = {
  menu: 'Menu Quiz',
  wine: 'Wine Quiz',
  spirits: 'Spirits Quiz',
  cocktails: 'Cocktails Quiz',
  allergy: 'Allergy Quiz',
};

export function QuizPerformanceDashboard() {
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      // Try to fetch quiz scores - the table may not exist yet
      const { data: scoresData, error: scoresError } = await supabase
        .from('quiz_scores' as 'profiles') // Type cast to avoid TS error
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(100);

      if (scoresError) {
        // Check if table doesn't exist
        if (scoresError.message.includes('does not exist') || scoresError.code === '42P01') {
          setTableExists(false);
          return;
        }
        throw scoresError;
      }

      if (!scoresData || scoresData.length === 0) {
        setScores([]);
        setStaffPerformance([]);
        return;
      }

      // Type cast the data
      const typedData = scoresData as unknown as QuizScore[];

      // Get unique user IDs
      const userIds = [...new Set(typedData.map(s => s.user_id))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { email: p.email, name: p.full_name }])
      );

      // Enrich scores with user info
      const enrichedScores = typedData.map(score => ({
        ...score,
        user_email: profilesMap.get(score.user_id)?.email || 'Unknown',
        user_name: profilesMap.get(score.user_id)?.name || null,
      }));

      setScores(enrichedScores);

      // Calculate staff performance
      const performanceMap = new Map<string, {
        scores: number[];
        lastActivity: string;
        email: string;
        name: string | null;
      }>();

      enrichedScores.forEach(score => {
        const existing = performanceMap.get(score.user_id);
        if (existing) {
          existing.scores.push(score.percentage);
          if (new Date(score.completed_at) > new Date(existing.lastActivity)) {
            existing.lastActivity = score.completed_at;
          }
        } else {
          performanceMap.set(score.user_id, {
            scores: [score.percentage],
            lastActivity: score.completed_at,
            email: score.user_email || 'Unknown',
            name: score.user_name || null,
          });
        }
      });

      const performance: StaffPerformance[] = Array.from(performanceMap.entries()).map(
        ([userId, data]) => ({
          user_id: userId,
          user_email: data.email,
          user_name: data.name,
          totalQuizzes: data.scores.length,
          avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          bestScore: Math.round(Math.max(...data.scores)),
          lastActivity: data.lastActivity,
        })
      );

      // Sort by average score descending
      performance.sort((a, b) => b.avgScore - a.avgScore);
      setStaffPerformance(performance);
    } catch (error) {
      console.error('Error fetching quiz scores:', error);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-copper" />
            Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading scores...</p>
        </CardContent>
      </Card>
    );
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-copper" />
            Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Quiz performance tracking is being set up. The database tables are being created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-copper" />
            Staff Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staffPerformance.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No quiz scores recorded yet. Scores will appear as staff complete quizzes.
            </p>
          ) : (
            <div className="space-y-4">
              {staffPerformance.slice(0, 5).map((staff, index) => (
                <div
                  key={staff.user_id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 flex justify-center">
                    {getMedalIcon(index) || (
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-copper/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-copper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {staff.user_name || staff.user_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {staff.totalQuizzes} quizzes completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getScoreColor(staff.avgScore)}`}>
                      {staff.avgScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Performance Table */}
      {staffPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-copper" />
              Detailed Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead className="text-center">Quizzes</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-center">Best Score</TableHead>
                    <TableHead className="text-right">Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffPerformance.map((staff) => (
                    <TableRow key={staff.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-copper" />
                          </div>
                          <span className="truncate max-w-[150px]">
                            {staff.user_name || staff.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{staff.totalQuizzes}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={staff.avgScore}
                            className="h-2 w-16"
                          />
                          <span className={`text-sm font-medium ${getScoreColor(staff.avgScore)}`}>
                            {staff.avgScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${getScoreColor(staff.bestScore)}`}>
                          {staff.bestScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(staff.lastActivity), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recent Quiz Attempts */}
      {scores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-copper" />
              Recent Quiz Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {scores.slice(0, 20).map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-copper" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {score.user_name || score.user_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quizTypeLabels[score.quiz_type] || score.quiz_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getScoreColor(score.percentage)}`}>
                        {score.score}/{score.total_questions}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(score.completed_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
