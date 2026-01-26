import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { CheckCircle2, XCircle, Clock, User, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestAttempt {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  is_reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  test_type: string;
  user_email?: string;
  user_name?: string;
}

interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  ai_feedback: string | null;
  admin_override: boolean | null;
  admin_notes: string | null;
}

export function FohTestReviewManager() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [savingOverride, setSavingOverride] = useState<string | null>(null);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('foh_test_attempts')
        .select('*')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Fetch user profiles for display names
      const userIds = [...new Set(attemptsData?.map(a => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const enrichedAttempts = attemptsData?.map(attempt => ({
        ...attempt,
        user_email: profileMap.get(attempt.user_id)?.email || 'Unknown',
        user_name: profileMap.get(attempt.user_id)?.full_name || undefined
      })) || [];

      setAttempts(enrichedAttempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      toast.error('Failed to load test attempts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (attemptId: string) => {
    setLoadingAnswers(true);
    try {
      const { data, error } = await supabase
        .from('foh_test_answers')
        .select('*')
        .eq('attempt_id', attemptId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnswers(data || []);
      
      // Initialize admin notes from existing data
      const notes: Record<string, string> = {};
      data?.forEach(answer => {
        if (answer.admin_notes) {
          notes[answer.id] = answer.admin_notes;
        }
      });
      setAdminNotes(notes);
    } catch (error) {
      console.error('Error fetching answers:', error);
      toast.error('Failed to load answers');
    } finally {
      setLoadingAnswers(false);
    }
  };

  const openReviewSheet = async (attempt: TestAttempt) => {
    setSelectedAttempt(attempt);
    setReviewSheetOpen(true);
    await fetchAnswers(attempt.id);
  };

  const handleOverride = async (answerId: string, newIsCorrect: boolean) => {
    setSavingOverride(answerId);
    try {
      const { error } = await supabase
        .from('foh_test_answers')
        .update({
          admin_override: newIsCorrect,
          admin_notes: adminNotes[answerId] || null
        })
        .eq('id', answerId);

      if (error) throw error;

      // Update local state
      setAnswers(prev => prev.map(a => 
        a.id === answerId 
          ? { ...a, admin_override: newIsCorrect, admin_notes: adminNotes[answerId] || null }
          : a
      ));

      toast.success(`Answer marked as ${newIsCorrect ? 'correct' : 'incorrect'}`);
    } catch (error) {
      console.error('Error updating answer:', error);
      toast.error('Failed to update answer');
    } finally {
      setSavingOverride(null);
    }
  };

  const finalizeReview = async () => {
    if (!selectedAttempt || !user) return;

    try {
      // Calculate new score based on overrides
      const newScore = answers.filter(a => 
        a.admin_override !== null ? a.admin_override : a.is_correct
      ).length;
      
      const newPercentage = answers.length > 0 
        ? Math.round((newScore / answers.length) * 100) 
        : 0;

      const { error } = await supabase
        .from('foh_test_attempts')
        .update({
          score: newScore,
          percentage: newPercentage,
          is_reviewed: true,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedAttempt.id);

      if (error) throw error;

      // Update local state
      setAttempts(prev => prev.map(a => 
        a.id === selectedAttempt.id 
          ? { ...a, score: newScore, percentage: newPercentage, is_reviewed: true }
          : a
      ));

      toast.success('Review completed and score updated');
      setReviewSheetOpen(false);
    } catch (error) {
      console.error('Error finalizing review:', error);
      toast.error('Failed to finalize review');
    }
  };

  const getEffectiveResult = (answer: TestAnswer) => {
    if (answer.admin_override !== null) {
      return answer.admin_override;
    }
    return answer.is_correct;
  };

  const getTestTypeLabel = (type: string) => {
    return type === 'server_assistant' ? 'Server Assistant' : 'Service Staff';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3 px-3 sm:px-6">
          <CardTitle className="text-base sm:text-lg font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Test Review Center
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {attempts.length === 0 ? (
            <p className="text-muted-foreground text-xs sm:text-sm text-center py-8">
              No completed tests to review yet.
            </p>
          ) : (
            <ScrollArea className="h-[280px] sm:h-[300px]">
              <div className="space-y-2">
                {attempts.map(attempt => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer active:scale-[0.99]"
                    onClick={() => openReviewSheet(attempt)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">
                          {attempt.user_name || attempt.user_email}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
                          <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(attempt.completed_at!).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{getTestTypeLabel(attempt.test_type)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="font-semibold text-xs sm:text-sm">
                          {attempt.score}/{attempt.total_questions}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {attempt.percentage}%
                        </p>
                      </div>
                      {attempt.is_reviewed ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
                          Pending
                        </Badge>
                      )}
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Review Sheet - Mobile friendly slide-up panel */}
      <Sheet open={reviewSheetOpen} onOpenChange={setReviewSheetOpen}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"} 
          className={isMobile ? "h-[90vh] rounded-t-2xl" : "w-full sm:max-w-xl md:max-w-2xl"}
        >
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-left text-base sm:text-lg">
              <div className="flex flex-col gap-1">
                <span className="truncate">
                  {selectedAttempt?.user_name || selectedAttempt?.user_email}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                    {selectedAttempt && getTestTypeLabel(selectedAttempt.test_type)}
                  </Badge>
                  <Badge variant={selectedAttempt?.is_reviewed ? "default" : "outline"} className="text-[10px] sm:text-xs font-normal">
                    {selectedAttempt?.is_reviewed ? "Reviewed" : "Pending"}
                  </Badge>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="flex-1 py-4" style={{ height: isMobile ? 'calc(90vh - 180px)' : 'calc(100vh - 180px)' }}>
            {loadingAnswers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-3 pr-2">
                {answers.map((answer, index) => {
                  const effectiveResult = getEffectiveResult(answer);
                  const wasOverridden = answer.admin_override !== null;
                  
                  return (
                    <Card key={answer.id} className={`border-l-4 ${
                      effectiveResult ? 'border-l-green-500' : 'border-l-red-500'
                    }`}>
                      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {/* Question header */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-xs sm:text-sm flex-1">
                            Q{index + 1}: {answer.question_text}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {wasOverridden && (
                              <Badge variant="outline" className="text-[10px]">
                                Override
                              </Badge>
                            )}
                            {effectiveResult ? (
                              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Answers comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Employee's Answer:</p>
                            <p className="p-2 rounded bg-muted/50 text-xs sm:text-sm break-words">{answer.user_answer}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Correct Answer:</p>
                            <p className="p-2 rounded bg-muted/50 text-xs sm:text-sm break-words">{answer.correct_answer}</p>
                          </div>
                        </div>
                        
                        {/* AI Feedback */}
                        {answer.ai_feedback && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground italic bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
                            AI: {answer.ai_feedback}
                          </p>
                        )}
                        
                        {/* Admin controls */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t">
                          <Textarea
                            placeholder="Add notes (optional)..."
                            value={adminNotes[answer.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({
                              ...prev,
                              [answer.id]: e.target.value
                            }))}
                            className="h-14 sm:h-12 text-xs flex-1 resize-none"
                          />
                          <div className="flex gap-1.5 sm:flex-col">
                            <Button
                              size="sm"
                              variant={answer.admin_override === true ? "default" : "outline"}
                              className="text-[10px] sm:text-xs flex-1 sm:flex-none h-8"
                              disabled={savingOverride === answer.id}
                              onClick={() => handleOverride(answer.id, true)}
                            >
                              {savingOverride === answer.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Correct
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant={answer.admin_override === false ? "destructive" : "outline"}
                              className="text-[10px] sm:text-xs flex-1 sm:flex-none h-8"
                              disabled={savingOverride === answer.id}
                              onClick={() => handleOverride(answer.id, false)}
                            >
                              {savingOverride === answer.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Wrong
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          
          <SheetFooter className="border-t pt-4 flex-row gap-2">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="text-xs sm:text-sm">
                <span className="text-muted-foreground">Score: </span>
                <span className="font-semibold">
                  {answers.filter(a => getEffectiveResult(a)).length}/{answers.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewSheetOpen(false)} className="text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button size="sm" onClick={finalizeReview} className="text-xs sm:text-sm">
                  Finalize Review
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
