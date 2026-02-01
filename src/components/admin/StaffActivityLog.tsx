import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, 
  GraduationCap, 
  BookOpen, 
  User, 
  AlertCircle,
  Trophy,
  ClipboardCheck
} from 'lucide-react';

interface UnifiedActivity {
  id: string;
  user_id: string;
  activity_type: 'test_completed' | 'flashcard_known' | 'quiz_completed';
  item_name: string;
  score?: number;
  percentage?: number;
  total_questions?: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export function StaffActivityLog() {
  const [activities, setActivities] = useState<UnifiedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setError(null);
      
      // Fetch quiz scores (food, wine, spirits quizzes)
      const { data: quizScores, error: quizError } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(30);

      if (quizError) throw quizError;

      // Fetch FOH test attempts (completed ones)
      const { data: fohAttempts, error: fohError } = await supabase
        .from('foh_test_attempts')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (fohError) throw fohError;

      // Fetch flashcards marked as known
      const { data: studyProgress, error: studyError } = await supabase
        .from('study_progress')
        .select('*')
        .eq('is_known', true)
        .order('studied_at', { ascending: false })
        .limit(30);

      if (studyError) throw studyError;

      // Get all unique user IDs
      const allUserIds = new Set<string>();
      quizScores?.forEach(q => allUserIds.add(q.user_id));
      fohAttempts?.forEach(a => allUserIds.add(a.user_id));
      studyProgress?.forEach(p => allUserIds.add(p.user_id));

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', Array.from(allUserIds));

      const profilesMap = new Map(
        (profiles || []).map(p => [p.id, { email: p.email, name: p.full_name }])
      );

      // Transform and combine all activities
      const allActivities: UnifiedActivity[] = [];

      // Add quiz scores
      quizScores?.forEach(score => {
        const profile = profilesMap.get(score.user_id);
        const quizLabels: Record<string, string> = {
          food: 'Food Quiz',
          wine: 'Wine Quiz',
          spirits: 'Spirits Quiz',
          allergy: 'Allergy Quiz',
          cocktails: 'Cocktails Quiz',
        };
        
        allActivities.push({
          id: `quiz-${score.id}`,
          user_id: score.user_id,
          activity_type: 'quiz_completed',
          item_name: quizLabels[score.quiz_type] || `${score.quiz_type} Quiz`,
          score: score.score,
          percentage: score.percentage,
          total_questions: score.total_questions,
          created_at: score.completed_at,
          user_email: profile?.email,
          user_name: profile?.name,
        });
      });

      // Add FOH test attempts
      fohAttempts?.forEach(attempt => {
        const profile = profilesMap.get(attempt.user_id);
        const testLabels: Record<string, string> = {
          service_staff: 'Server/Bartender Test',
          'foh-service': 'Server/Bartender Test',
          service_assistant: 'Server Assistant Test',
          'foh-sa': 'Server Assistant Test',
        };
        
        allActivities.push({
          id: `foh-${attempt.id}`,
          user_id: attempt.user_id,
          activity_type: 'test_completed',
          item_name: testLabels[attempt.test_type] || attempt.test_type,
          score: attempt.score || 0,
          percentage: attempt.percentage || 0,
          total_questions: attempt.total_questions || 0,
          created_at: attempt.completed_at!,
          user_email: profile?.email,
          user_name: profile?.name,
        });
      });

      // Add flashcard study progress
      studyProgress?.forEach(progress => {
        const profile = profilesMap.get(progress.user_id);
        
        allActivities.push({
          id: `study-${progress.id}`,
          user_id: progress.user_id,
          activity_type: 'flashcard_known',
          item_name: progress.menu_item_name,
          created_at: progress.studied_at,
          user_email: profile?.email,
          user_name: profile?.name,
        });
      });

      // Sort by date (most recent first)
      allActivities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Take top 50
      setActivities(allActivities.slice(0, 50));
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: UnifiedActivity['activity_type']) => {
    switch (type) {
      case 'test_completed':
        return <GraduationCap className="w-4 h-4" />;
      case 'quiz_completed':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'flashcard_known':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getActivityBadge = (activity: UnifiedActivity) => {
    switch (activity.activity_type) {
      case 'test_completed':
        return (
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {getActivityIcon(activity.activity_type)}
            <span className="ml-1">Test</span>
          </Badge>
        );
      case 'quiz_completed':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {getActivityIcon(activity.activity_type)}
            <span className="ml-1">Quiz</span>
          </Badge>
        );
      case 'flashcard_known':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {getActivityIcon(activity.activity_type)}
            <span className="ml-1">Mastered</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreDisplay = (activity: UnifiedActivity) => {
    if (activity.activity_type === 'flashcard_known') return null;
    
    if (activity.percentage !== undefined) {
      const color = activity.percentage >= 80 
        ? 'text-green-600 dark:text-green-400' 
        : activity.percentage >= 60 
          ? 'text-yellow-600 dark:text-yellow-400'
          : 'text-red-600 dark:text-red-400';
      
      return (
        <div className={`flex items-center gap-1 ${color}`}>
          <Trophy className="w-3 h-3" />
          <span className="text-xs font-medium">
            {Math.round(activity.percentage)}%
            {activity.score !== undefined && activity.total_questions !== undefined && (
              <span className="text-muted-foreground ml-1">
                ({activity.score}/{activity.total_questions})
              </span>
            )}
          </span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-copper" />
            Staff Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-copper" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-copper" />
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-copper" />
          Staff Activity Log
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tests completed, quizzes taken, and flashcards mastered
        </p>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No activity recorded yet. Activity will appear as staff complete tests and study flashcards.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-copper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {activity.user_name || activity.user_email || 'Unknown User'}
                      </span>
                      {getActivityBadge(activity)}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-muted-foreground truncate">
                        {activity.item_name}
                      </span>
                      {getScoreDisplay(activity)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
