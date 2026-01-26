import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock, User, ChevronRight, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

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
    }
  };

  const openReviewDialog = async (attempt: TestAttempt) => {
    setSelectedAttempt(attempt);
    await fetchAnswers(attempt.id);
    setReviewDialogOpen(true);
  };

  const handleOverride = async (answerId: string, newIsCorrect: boolean) => {
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
      setReviewDialogOpen(false);
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

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Test Review Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No completed tests to review yet.
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {attempts.map(attempt => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                    onClick={() => openReviewDialog(attempt)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {attempt.user_name || attempt.user_email}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(attempt.completed_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {attempt.score}/{attempt.total_questions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attempt.percentage}%
                        </p>
                      </div>
                      {attempt.is_reviewed ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                          Pending
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Review: {selectedAttempt?.user_name || selectedAttempt?.user_email}
              </span>
              <Badge variant={selectedAttempt?.is_reviewed ? "default" : "secondary"}>
                {selectedAttempt?.is_reviewed ? "Reviewed" : "Pending Review"}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {answers.map((answer, index) => {
                const effectiveResult = getEffectiveResult(answer);
                const wasOverridden = answer.admin_override !== null;
                
                return (
                  <Card key={answer.id} className={`border-l-4 ${
                    effectiveResult ? 'border-l-green-500' : 'border-l-red-500'
                  }`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            Q{index + 1}: {answer.question_text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {wasOverridden && (
                            <Badge variant="outline" className="text-xs">
                              Overridden
                            </Badge>
                          )}
                          {effectiveResult ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Employee's Answer:</p>
                          <p className="p-2 rounded bg-muted/50">{answer.user_answer}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Correct Answer:</p>
                          <p className="p-2 rounded bg-muted/50">{answer.correct_answer}</p>
                        </div>
                      </div>
                      
                      {answer.ai_feedback && (
                        <p className="text-xs text-muted-foreground italic">
                          AI: {answer.ai_feedback}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Textarea
                          placeholder="Add notes (optional)..."
                          value={adminNotes[answer.id] || ''}
                          onChange={(e) => setAdminNotes(prev => ({
                            ...prev,
                            [answer.id]: e.target.value
                          }))}
                          className="h-16 text-xs"
                        />
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant={answer.admin_override === true ? "default" : "outline"}
                            className="text-xs"
                            onClick={() => handleOverride(answer.id, true)}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Correct
                          </Button>
                          <Button
                            size="sm"
                            variant={answer.admin_override === false ? "destructive" : "outline"}
                            className="text-xs"
                            onClick={() => handleOverride(answer.id, false)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Incorrect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
          
          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm">
                <span className="text-muted-foreground">Current Score: </span>
                <span className="font-semibold">
                  {answers.filter(a => getEffectiveResult(a)).length}/{answers.length}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={finalizeReview}>
                  Finalize Review
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
