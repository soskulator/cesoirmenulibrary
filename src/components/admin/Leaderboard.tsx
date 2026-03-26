import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Calendar,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  userId: string;
  userName: string;
  email: string;
  totalScore: number;
  totalQuestions: number;
  averagePercentage: number;
  testsCompleted: number;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
}

export function Leaderboard() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [loading, setLoading] = useState(true);
  const [quizScores, setQuizScores] = useState<any[]>([]);
  const [fohAttempts, setFohAttempts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileData>>({});

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    if (period === 'weekly') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(0); // All time
    }

    try {
      // Fetch quiz scores
      let quizQuery = supabase
        .from('quiz_scores')
        .select('*')
        .order('completed_at', { ascending: false });
      
      if (period !== 'all') {
        quizQuery = quizQuery.gte('completed_at', startDate.toISOString());
      }
      
      const { data: quizData } = await quizQuery;
      setQuizScores(quizData || []);

      // Fetch FOH test attempts
      let fohQuery = supabase
        .from('foh_test_attempts')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });
      
      if (period !== 'all') {
        fohQuery = fohQuery.gte('completed_at', startDate.toISOString());
      }
      
      const { data: fohData } = await fohQuery;
      setFohAttempts(fohData || []);

      // Get unique user IDs
      const userIds = new Set<string>();
      quizData?.forEach(q => userIds.add(q.user_id));
      fohData?.forEach(a => userIds.add(a.user_id));

      // Fetch profiles
      if (userIds.size > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', Array.from(userIds));
        
        const profileMap: Record<string, ProfileData> = {};
        profileData?.forEach(p => {
          profileMap[p.id] = p;
        });
        setProfiles(profileMap);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate leaderboard entries
  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    const userStats: Record<string, {
      totalScore: number;
      totalQuestions: number;
      testsCompleted: number;
    }> = {};

    // Process quiz scores
    quizScores.forEach(score => {
      if (!userStats[score.user_id]) {
        userStats[score.user_id] = { totalScore: 0, totalQuestions: 0, testsCompleted: 0 };
      }
      userStats[score.user_id].totalScore += score.score;
      userStats[score.user_id].totalQuestions += score.total_questions;
      userStats[score.user_id].testsCompleted += 1;
    });

    // Process FOH attempts
    fohAttempts.forEach(attempt => {
      if (!userStats[attempt.user_id]) {
        userStats[attempt.user_id] = { totalScore: 0, totalQuestions: 0, testsCompleted: 0 };
      }
      userStats[attempt.user_id].totalScore += attempt.score || 0;
      userStats[attempt.user_id].totalQuestions += attempt.total_questions || 0;
      userStats[attempt.user_id].testsCompleted += 1;
    });

    // Build leaderboard
    return Object.entries(userStats)
      .map(([userId, stats]) => {
        const profile = profiles[userId];
        return {
          userId,
          userName: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
          email: profile?.email || '',
          totalScore: stats.totalScore,
          totalQuestions: stats.totalQuestions,
          averagePercentage: stats.totalQuestions > 0 
            ? Math.round((stats.totalScore / stats.totalQuestions) * 100) 
            : 0,
          testsCompleted: stats.testsCompleted,
        };
      })
      .filter(entry => entry.testsCompleted > 0)
      .sort((a, b) => b.averagePercentage - a.averagePercentage || b.testsCompleted - a.testsCompleted);
  }, [quizScores, fohAttempts, profiles]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-copper" />;
      case 2: return <Medal className="w-5 h-5 text-silver" />;
      case 3: return <Award className="w-5 h-5 text-bronze" />;
      default: return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-gold/20 via-gold/10 to-transparent border-copper/30';
      case 2: return 'bg-gradient-to-r from-silver/20 via-silver/10 to-transparent border-silver/30';
      case 3: return 'bg-gradient-to-r from-bronze/20 via-bronze/10 to-transparent border-bronze/30';
      default: return 'bg-muted/50';
    }
  };

  return (
    <Card className="bg-card shadow-card">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-copper/10 flex items-center justify-center flex-shrink-0">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
          </div>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="h-8">
              <TabsTrigger value="weekly" className="text-xs px-2 sm:px-3">
                <Calendar className="w-3 h-3 mr-1 hidden sm:inline" />
                Week
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-2 sm:px-3">
                <Calendar className="w-3 h-3 mr-1 hidden sm:inline" />
                Month
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs px-2 sm:px-3">
                <TrendingUp className="w-3 h-3 mr-1 hidden sm:inline" />
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <CardTitle className="font-serif text-lg sm:text-xl">Leaderboard</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Top performers across all tests
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No test results for this period</p>
          </div>
        ) : (
          <ScrollArea className="h-[320px]">
            <div className="space-y-2 pr-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                      getRankBg(rank)
                    )}
                  >
                    <div className="flex-shrink-0 w-7 flex justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{entry.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{entry.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        "font-bold text-lg",
                        rank === 1 ? "text-copper" : 
                        rank === 2 ? "text-silver" : 
                        rank === 3 ? "text-copper" : 
                        "text-foreground"
                      )}>
                        {entry.averagePercentage}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {entry.testsCompleted} test{entry.testsCompleted !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Stats Summary */}
        {!loading && leaderboard.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{leaderboard.length}</p>
                <p className="text-[10px] text-muted-foreground">Participants</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {leaderboard.reduce((acc, e) => acc + e.testsCompleted, 0)}
                </p>
                <p className="text-[10px] text-muted-foreground">Tests Taken</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {Math.round(leaderboard.reduce((acc, e) => acc + e.averagePercentage, 0) / leaderboard.length)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Team Avg</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
