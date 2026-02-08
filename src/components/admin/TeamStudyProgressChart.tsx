import { useEffect, useState, forwardRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { BarChart3, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EmployeeScore {
  userId: string;
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
  const [employeeToRemove, setEmployeeToRemove] = useState<EmployeeScore | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

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
        .map(([oderId, userData]) => ({
          userId: oderId,
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

  const handleRemoveEmployee = async () => {
    if (!employeeToRemove) return;

    setIsRemoving(true);
    try {
      // Delete quiz scores for this user
      const { error: scoresError } = await supabase
        .from('quiz_scores')
        .delete()
        .eq('user_id', employeeToRemove.userId);

      if (scoresError) throw scoresError;

      // Delete study progress for this user
      await supabase
        .from('study_progress')
        .delete()
        .eq('user_id', employeeToRemove.userId);

      // Delete staff activity log for this user
      await supabase
        .from('staff_activity_log')
        .delete()
        .eq('user_id', employeeToRemove.userId);

      toast({
        title: 'Employee Removed',
        description: `${employeeToRemove.name}'s data has been removed from the system.`,
      });

      // Refresh the data
      setData(prev => prev.filter(e => e.userId !== employeeToRemove.userId));
      setEmployeeToRemove(null);
    } catch (error: any) {
      console.error('Error removing employee:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove employee data.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
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
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
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
    <>
      <Card>
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
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
            <>
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
              
              {/* Employee list with remove option */}
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Manage Employees</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {data.map((employee) => (
                    <div 
                      key={employee.userId} 
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => setEmployeeToRemove(employee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Remove Employee Confirmation Dialog */}
      <AlertDialog open={!!employeeToRemove} onOpenChange={() => setEmployeeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all quiz scores, study progress, and activity logs for{' '}
              <strong>{employeeToRemove?.name}</strong> ({employeeToRemove?.email}).
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveEmployee}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Employee'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
