import { useEffect, useState, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmployeeScore {
  name: string;
  email: string;
  score: number;
  lastActive: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: EmployeeScore;
  }>;
}

const CustomTooltip = forwardRef<HTMLDivElement, CustomTooltipProps>(
  ({ active, payload }, ref) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div ref={ref} className="bg-card border border-border rounded-lg shadow-lg p-3 sm:p-4 min-w-[160px] sm:min-w-[180px] max-w-[200px]">
          <p className="font-serif font-semibold text-foreground text-sm sm:text-base mb-0.5 sm:mb-1 truncate">{data.name}</p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 truncate">{data.email}</p>
          <div className="flex items-center justify-between border-t border-border pt-1.5 sm:pt-2">
            <span className="text-xs sm:text-sm text-muted-foreground">Avg Score</span>
            <span className="font-bold text-terra-cotta text-sm sm:text-base">{data.score}%</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">Last Active</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(data.lastActive), { addSuffix: true })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  }
);

CustomTooltip.displayName = 'CustomTooltip';

export function TeamStudyProgressChart() {
  const [data, setData] = useState<EmployeeScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const { data: scoresData, error: scoresError } = await supabase
        .from('quiz_scores')
        .select('*')
        .order('completed_at', { ascending: false });

      if (scoresError) {
        if (scoresError.message.includes('does not exist') || scoresError.code === '42P01') {
          setTableExists(false);
          return;
        }
        throw scoresError;
      }

      if (!scoresData || scoresData.length === 0) {
        setData([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(scoresData.map(s => s.user_id))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { email: p.email, name: p.full_name }])
      );

      // Aggregate by user
      const userScores = new Map<string, { 
        scores: number[]; 
        lastActive: string;
        email: string;
        name: string | null;
      }>();

      scoresData.forEach(score => {
        const existing = userScores.get(score.user_id);
        const profile = profilesMap.get(score.user_id);
        
        if (existing) {
          existing.scores.push(score.percentage);
          if (new Date(score.completed_at) > new Date(existing.lastActive)) {
            existing.lastActive = score.completed_at;
          }
        } else {
          userScores.set(score.user_id, {
            scores: [score.percentage],
            lastActive: score.completed_at,
            email: profile?.email || 'Unknown',
            name: profile?.name || null,
          });
        }
      });

      // Convert to chart data
      const chartData: EmployeeScore[] = Array.from(userScores.entries())
        .map(([_, userData]) => ({
          name: userData.name || userData.email.split('@')[0],
          email: userData.email,
          score: Math.round(userData.scores.reduce((a, b) => a + b, 0) / userData.scores.length),
          lastActive: userData.lastActive,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10 employees

      setData(chartData);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'hsl(18, 58%, 52%)'; // terra-cotta
    if (score >= 60) return 'hsl(24, 55%, 65%)'; // soft-clay
    return 'hsl(30, 12%, 70%)'; // muted
  };

  if (loading) {
    return (
      <Card className="bg-card shadow-card overflow-hidden">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-terra-cotta" />
            Team Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-xs sm:text-sm">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tableExists) {
    return (
      <Card className="bg-card shadow-card overflow-hidden">
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-terra-cotta" />
            Team Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-amber-50 text-amber-700">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="text-xs sm:text-sm">
              Test tracking is being set up. Chart will display once staff complete tests.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-card overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <CardTitle className="font-serif text-lg sm:text-xl flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-terra-cotta flex-shrink-0" />
          Employee Study Scores
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Average test performance by team member
        </p>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {data.length === 0 ? (
          <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-xs sm:text-sm text-center px-4">
              No test scores recorded yet.<br />
              Scores will appear as staff complete tests.
            </p>
          </div>
        ) : (
          <div className="h-[280px] sm:h-[350px] w-full -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
              >
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tickFormatter={(value) => `${value}%`}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={70}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
                <Bar 
                  dataKey="score" 
                  radius={[0, 4, 4, 0]}
                  maxBarSize={24}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
