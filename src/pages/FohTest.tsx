import { useState, useMemo, useEffect, useCallback } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useTestQuestions } from '@/hooks/useTestQuestions';
import { getCategoryLabel, getCategoryColor, FohTestQuestion, TestType } from '@/data/fohTestData';
import { getTestDisplayName, getTestSubtitle } from '@/utils/testDisplayNames';
import { useQuizScores } from '@/hooks/useQuizScores';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  ArrowLeft,
  ClipboardList,
  Medal,
  Target,
  Clock,
  Loader2,
  Users,
  UserCheck,
  AlertTriangle,
  Send,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AnsweredQuestion {
  questionId: number;
  questionText: string;
  correctAnswer: string;
  userAnswer: string | number;
  isCorrect: boolean;
  aiFeedback?: string;
}

export default function FohTestPage() {
  usePageTitle("Test");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlTestType = searchParams.get('type') || null;
  const [selectedTestType, setSelectedTestType] = useState<string | null>(urlTestType);
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{isCorrect: boolean; feedback: string} | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  
  const { saveQuizScore } = useQuizScores();
  const { testConfig, isLoading: isLoadingQuestions, usingFallback, hasNoQuestions, buildTestQuestions, fetchAndBuildFresh } = useTestQuestions(selectedTestType);
  const { user, isServerAssistant, hasBeverageAccess, isAdmin, isLeadAdmin } = useAuth();

  // Redirect Server Assistants trying to access the service_staff test
  useEffect(() => {
    if (isServerAssistant && urlTestType === 'service_staff') {
      navigate('/foh-test?type=server_assistant', { replace: true });
    }
  }, [isServerAssistant, urlTestType, navigate]);

  // Shuffle questions for the test
  const [shuffledQuestions, setShuffledQuestions] = useState<FohTestQuestion[]>([]);

  const startTest = async () => {
    if (!selectedTestType) return;
    
    // Always fetch fresh from DB to ensure edited questions are synced
    let finalQuestions = await fetchAndBuildFresh();
    if (finalQuestions.length === 0 && !hasNoQuestions) {
      // Fallback to cached data if fresh fetch fails
      finalQuestions = buildTestQuestions();
    }
    setShuffledQuestions(finalQuestions);
    setTestStarted(true);
    setCurrentIndex(0);
    setAnsweredQuestions([]);
    setShowResult(false);
    setEvaluationResult(null);
    setStartTime(new Date());
    setEndTime(null);
    setAttemptId(null);
    setSkippedQuestions(new Set());

    // Create a new test attempt in the database
    if (user) {
      try {
        const { data, error } = await supabase
          .from('foh_test_attempts')
          .insert({
            user_id: user.id,
            total_questions: finalQuestions.length,
            test_type: selectedTestType
          })
          .select('id')
          .single();

        if (!error && data) {
          setAttemptId(data.id);
        }
      } catch (err) {
        console.error('Error creating test attempt:', err);
      }
    }
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  // Simple fallback evaluation helper (moved up for use in submitShortAnswer)

  // Simple fallback evaluation
  const fallbackEvaluation = (userAnswer: string, correctAnswer: string): boolean => {
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedCorrect = correctAnswer.toLowerCase().trim();
    
    // Extract key words (words with 3+ characters)
    const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'with', 'this', 'that'];
    const extractKeywords = (text: string): string[] => {
      return text
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length >= 3 && !stopWords.includes(word));
    };
    
    const correctKeywords = extractKeywords(normalizedCorrect);
    const userKeywords = extractKeywords(normalizedUser);
    
    if (correctKeywords.length === 0) {
      return normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect);
    }
    
    let matchCount = 0;
    for (const keyword of correctKeywords) {
      if (normalizedUser.includes(keyword)) {
        matchCount++;
      }
    }
    
    return (matchCount / correctKeywords.length) >= 0.5;
  };

  const submitMultipleChoice = async () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const userAnswerText = currentQuestion.options?.[selectedAnswer] || String(selectedAnswer);
    const feedback = isCorrect ? 'Correct answer selected' : 'Incorrect answer selected';

    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: selectedAnswer,
      isCorrect,
      aiFeedback: feedback
    }]);

    // Save answer to database
    if (attemptId && user) {
      try {
        const { error } = await supabase.from('foh_test_answers').insert({
          attempt_id: attemptId,
          question_id: String((currentQuestion as any)._dbId || currentQuestion.id),
          question_text: currentQuestion.question,
          correct_answer: currentQuestion.correctAnswer,
          user_answer: userAnswerText,
          is_correct: isCorrect,
          ai_feedback: feedback
        });
        if (error) {
          console.error('Error saving answer to database:', error);
        }
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }

    // Move to next question or show results
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
      setEvaluationResult(null);
    } else {
      setEndTime(new Date());
      setShowResult(true);
    }
  };

  const submitShortAnswer = async () => {
    if (!currentQuestion || !shortAnswer.trim()) return;

    setIsEvaluating(true);
    let isCorrect = false;
    let feedback = '';

    try {
      const { data, error } = await supabase.functions.invoke('evaluate-answer', {
        body: { 
          userAnswer: shortAnswer.trim(), 
          correctAnswer: currentQuestion.correctAnswer, 
          question: currentQuestion.question 
        }
      });

      if (error) throw error;

      isCorrect = data.isCorrect;
      feedback = data.feedback || (data.isCorrect ? 'Good answer!' : 'Not quite right');
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Fallback to simple keyword matching
      isCorrect = fallbackEvaluation(shortAnswer.trim(), currentQuestion.correctAnswer);
      feedback = isCorrect ? 'Answer matches key concepts' : 'Answer does not match expected response';
    } finally {
      setIsEvaluating(false);
    }

    setEvaluationResult({ isCorrect, feedback });

    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      correctAnswer: currentQuestion.correctAnswer,
      userAnswer: shortAnswer.trim(),
      isCorrect,
      aiFeedback: feedback
    }]);

    // Save answer to database
    if (attemptId && user) {
      try {
        const { error } = await supabase.from('foh_test_answers').insert({
          attempt_id: attemptId,
          question_id: String((currentQuestion as any)._dbId || currentQuestion.id),
          question_text: currentQuestion.question,
          correct_answer: currentQuestion.correctAnswer,
          user_answer: shortAnswer.trim(),
          is_correct: isCorrect,
          ai_feedback: feedback
        });
        if (error) {
          console.error('Error saving answer to database:', error);
        }
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }
  };

  const proceedToNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
      setEvaluationResult(null);
    } else {
      setEndTime(new Date());
      setShowResult(true);
    }
  };

  const score = useMemo(() => {
    const correct = answeredQuestions.filter(q => q.isCorrect).length;
    return {
      correct,
      incorrect: answeredQuestions.length - correct,
      total: shuffledQuestions.length,
      percentage: shuffledQuestions.length > 0 ? Math.round((correct / shuffledQuestions.length) * 100) : 0
    };
  }, [answeredQuestions, shuffledQuestions.length]);

  // Save score when test is complete (full or early submission) and notify lead admins
  useEffect(() => {
    if (showResult && shuffledQuestions.length > 0) {
      const quizType = selectedTestType ?? 'foh-service';
      saveQuizScore(quizType, score.correct, score.total);

      // Update the test attempt with final score and notify lead admins
      if (attemptId && user) {
        const updateAndNotify = async () => {
          try {
            // Update the attempt
            const { error: updateError } = await supabase
              .from('foh_test_attempts')
              .update({
                completed_at: new Date().toISOString(),
                score: score.correct,
                total_questions: score.total,
                percentage: score.percentage
              })
              .eq('id', attemptId);

            if (updateError) {
              console.error('Error updating attempt:', updateError);
              return;
            }

            // Notify lead admins via email
            const { error: notifyError } = await supabase.functions.invoke('notify-test-complete', {
              body: {
                attemptId,
                employeeName: user.user_metadata?.full_name || null,
                employeeEmail: user.email,
                testType: selectedTestType,
                score: score.correct,
                totalQuestions: score.total,
                percentage: score.percentage
              }
            });

            if (notifyError) {
              console.error('Error notifying lead admins:', notifyError);
            }
          } catch (err) {
            console.error('Error in test completion:', err);
          }
        };

        updateAndNotify();
      }
    }
  }, [showResult, shuffledQuestions.length, score.correct, score.total, score.percentage, saveQuizScore, attemptId, user, selectedTestType]);

  const getTimeSpent = () => {
    if (!startTime || !endTime) return '0 min';
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreGrade = (percentage: number) => {
    const passingScore = testConfig?.passing_score ?? 70;
    if (percentage >= passingScore + 20) return { grade: 'A', label: 'Excellent!', color: 'text-sage' };
    if (percentage >= passingScore + 10) return { grade: 'B', label: 'Great Job!', color: 'text-gold' };
    if (percentage >= passingScore) return { grade: 'C', label: 'Passed', color: 'text-copper' };
    if (percentage >= passingScore - 10) return { grade: 'D', label: 'Needs Improvement', color: 'text-orange-500' };
    return { grade: 'F', label: 'Study Required', color: 'text-destructive' };
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShortAnswer('');
    setAnsweredQuestions([]);
    setShowResult(false);
    setEvaluationResult(null);
    setStartTime(null);
    setEndTime(null);
    setAttemptId(null);
    setShowConfirmEnd(false);
    setSkippedQuestions(new Set());
  };

  // Skip question — append to the end of the queue
  const skipQuestion = () => {
    if (!currentQuestion) return;
    const currentQIndex = currentIndex;
    // Move this question to the end
    setShuffledQuestions(prev => {
      const updated = [...prev];
      const [skipped] = updated.splice(currentQIndex, 1);
      updated.push(skipped);
      return updated;
    });
    setSkippedQuestions(prev => new Set(prev).add(currentQuestion.id));
    // Reset input state for next question (index stays the same since array shifted)
    setSelectedAnswer(null);
    setShortAnswer('');
    setEvaluationResult(null);
  };

  // Submit test early — unanswered questions count as incorrect
  const submitTestEarly = useCallback(() => {
    setEndTime(new Date());
    setShowResult(true);
    setShowConfirmEnd(false);
  }, []);

  const goBack = () => {
    if (testStarted) {
      resetTest();
    } else {
      setSelectedTestType(null);
    }
  };

  // Results screen with scoreboard
  if (showResult) {
    const gradeInfo = getScoreGrade(score.percentage);
    const unansweredCount = shuffledQuestions.length - answeredQuestions.length;
    const isPartialSubmission = unansweredCount > 0;
    const showScoreDetails = isAdmin || isLeadAdmin;

    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-3xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gold" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                {getTestDisplayName(selectedTestType!, testConfig?.test_name)} Complete!
              </h1>
              {showScoreDetails ? (
                <p className={cn("text-xl sm:text-2xl font-bold", gradeInfo.color)}>
                  {gradeInfo.label}
                </p>
              ) : (
                <p className="text-base sm:text-lg text-muted-foreground">
                  Your test has been submitted for review
                </p>
              )}
              {isPartialSubmission && (
                <p className="text-xs text-muted-foreground mt-2">
                  {answeredQuestions.length} of {shuffledQuestions.length} questions answered · {unansweredCount} unanswered counted as incorrect
                </p>
              )}
            </div>

            {/* Employee view: Pending review message */}
            {!showScoreDetails && (
              <Card className="mb-6">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-6 h-6 text-copper" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Pending Manager Review</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Your answers have been submitted. A manager will review your test and you'll receive your results via email once the review is complete.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin view: Full scoreboard */}
            {showScoreDetails && (
              <>
                <Card className="mb-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-burgundy to-burgundy/80 p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-burgundy-foreground/80 text-sm">Your Score</p>
                        <p className="text-4xl sm:text-5xl font-bold">{score.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-6xl sm:text-7xl font-bold", gradeInfo.color)}>
                          {gradeInfo.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-sage/10 rounded-lg">
                        <Check className="w-6 h-6 text-sage mx-auto mb-1" />
                        <p className="text-2xl font-bold text-sage">{score.correct}</p>
                        <p className="text-xs text-muted-foreground">Correct</p>
                      </div>
                      <div className="text-center p-3 bg-destructive/10 rounded-lg">
                        <X className="w-6 h-6 text-destructive mx-auto mb-1" />
                        <p className="text-2xl font-bold text-destructive">{score.incorrect}</p>
                        <p className="text-xs text-muted-foreground">Incorrect</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Target className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-2xl font-bold">{score.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-2xl font-bold">{getTimeSpent()}</p>
                        <p className="text-xs text-muted-foreground">Time</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={score.percentage} className="h-3" />
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card className="mb-6">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Medal className="w-5 h-5 text-copper" />
                      Performance by Category
                    </h3>
                    <div className="space-y-3">
                      {Array.from(new Set(shuffledQuestions.map(q => q.category))).map(cat => {
                        const catQuestions = shuffledQuestions.filter(q => q.category === cat);
                        const catAnswered = answeredQuestions.filter(a => {
                          const q = shuffledQuestions.find(sq => sq.id === a.questionId);
                          return q?.category === cat;
                        });
                        const catCorrect = catAnswered.filter(a => a.isCorrect).length;
                        const catPercentage = catQuestions.length > 0 ? Math.round((catCorrect / catQuestions.length) * 100) : 0;
                        return (
                          <div key={cat} className="flex items-center gap-3">
                            <Badge className={cn(getCategoryColor(cat), "w-24 sm:w-32 justify-center text-xs capitalize")}>
                              {getCategoryLabel(cat).split(' ')[0]}
                            </Badge>
                            <div className="flex-1">
                              <Progress value={catPercentage} className="h-2" />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {catCorrect}/{catQuestions.length}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Question Review */}
                <Card className="mb-6">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-burgundy" />
                      Question Review
                    </h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                      {answeredQuestions.map((aq, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg border-l-4 text-sm",
                            aq.isCorrect
                              ? "bg-sage/5 border-sage"
                              : "bg-destructive/5 border-destructive"
                          )}
                        >
                          <div className="flex items-start gap-2 mb-1">
                            {aq.isCorrect ? (
                              <Check className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                            )}
                            <p className="font-medium text-foreground">{aq.questionText}</p>
                          </div>
                          <div className="ml-6 space-y-1">
                            <p className="text-xs">
                              <span className="text-muted-foreground">Your answer: </span>
                              <span className={aq.isCorrect ? "text-sage" : "text-destructive"}>
                                {typeof aq.userAnswer === 'number'
                                  ? shuffledQuestions.find(q => q.id === aq.questionId)?.options?.[aq.userAnswer] ?? String(aq.userAnswer)
                                  : aq.userAnswer}
                              </span>
                            </p>
                            {!aq.isCorrect && (
                              <p className="text-xs">
                                <span className="text-muted-foreground">Correct answer: </span>
                                <span className="text-foreground">{aq.correctAnswer}</span>
                              </p>
                            )}
                            {aq.aiFeedback && !aq.isCorrect && (
                              <p className="text-xs text-muted-foreground italic">{aq.aiFeedback}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="burgundy" onClick={startTest} className="h-11">
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake Test
              </Button>
              <Button variant="outline" asChild className="h-11">
                <Link to="/quiz">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Tests
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // No test type selected — redirect to quiz hub
  if (!selectedTestType) {
    navigate('/quiz', { replace: true });
    return null;
  }

  // Test start screen
  if (!testStarted) {
    if (isLoadingQuestions) {
      return (
        <Layout>
          <div className="container py-12 max-w-2xl px-4">
            <LoadingSpinner message="Loading test questions..." />
          </div>
        </Layout>
      );
    }

    // No questions available for non-legacy test types
    if (hasNoQuestions) {
      return (
        <Layout>
          <div className="container py-12 max-w-2xl px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-3">No Questions Assigned</h1>
            <p className="text-muted-foreground text-sm mb-6">
              No questions have been assigned to this test yet. Please contact your admin.
            </p>
            <Button variant="outline" asChild>
              <Link to="/quiz">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Link>
            </Button>
          </div>
        </Layout>
      );
    }

    // Use testConfig for display info, with sensible fallbacks
    const totalQuestions = testConfig?.total_questions ?? (selectedTestType === 'server_assistant' ? 23 : 69);
    const testName = getTestDisplayName(selectedTestType!, testConfig?.test_name);
    const timeLimitMin = testConfig?.time_limit_minutes;
    const estMinutes = timeLimitMin ?? (selectedTestType === 'server_assistant' ? 20 : 45);
    const passingScore = testConfig?.passing_score ?? 70;

    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-burgundy" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {testName}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {getTestSubtitle(selectedTestType!, testConfig?.test_name)}
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-4">Test Overview</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-burgundy">{totalQuestions}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-copper">
                    {timeLimitMin ? `${timeLimitMin}` : `~${estMinutes}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeLimitMin ? 'Min Limit' : 'Min Est.'}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-sage">{passingScore}%</p>
                  <p className="text-xs text-muted-foreground">To Pass</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-sage/10 rounded-lg border border-sage/20">
                <p className="text-xs text-sage-foreground">
                  <strong>AI-Powered Grading:</strong> Short answers are automatically evaluated - you don't need verbatim answers, just demonstrate understanding of the key concepts.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="burgundy" size="lg" onClick={startTest} className="h-12 px-8">
              Start Test
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12">
              <Link to="/quiz">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Tests
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Active test
  return (
    <Layout>
      <div className="container py-4 sm:py-6 md:py-8 max-w-2xl px-3 sm:px-4">
        {/* Progress Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {shuffledQuestions.length}
            </span>
            <div className="flex gap-3">
              <span className="text-sage">✓ {answeredQuestions.filter(a => a.isCorrect).length}</span>
              <span className="text-destructive">✗ {answeredQuestions.filter(a => !a.isCorrect).length}</span>
            </div>
          </div>
          <Progress value={(answeredQuestions.length / shuffledQuestions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-4 sm:p-6">
                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn(getCategoryColor(currentQuestion.category), "text-xs")}>
                      {getCategoryLabel(currentQuestion.category)}
                    </Badge>
                    {skippedQuestions.has(currentQuestion.id) && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-500/30 bg-amber-500/10">
                        Previously Skipped
                      </Badge>
                    )}
                  </div>

                  {/* Question */}
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold mb-6">
                    {currentQuestion.question}
                  </h2>

                  {/* Multiple Choice Options */}
                  {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedAnswer(idx)}
                          className={cn(
                            "w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all",
                            selectedAnswer === idx
                              ? "border-burgundy bg-burgundy/10"
                              : "border-border hover:border-burgundy/50 hover:bg-muted/50"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <span className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium",
                              selectedAnswer === idx
                                ? "border-burgundy bg-burgundy text-white"
                                : "border-muted-foreground"
                            )}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm sm:text-base">{option}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short Answer Input */}
                  {currentQuestion.type === 'short_answer' && (
                    <div className="space-y-4">
                      <Input
                        placeholder="Type your answer..."
                        value={shortAnswer}
                        onChange={(e) => setShortAnswer(e.target.value)}
                        className="h-12"
                        disabled={isEvaluating || evaluationResult !== null}
                      />
                      
                      {/* Show evaluation result */}
                      {evaluationResult && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-lg border-l-4",
                            evaluationResult.isCorrect 
                              ? "bg-sage/10 border-sage" 
                              : "bg-destructive/10 border-destructive"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {evaluationResult.isCorrect ? (
                              <Check className="w-5 h-5 text-sage" />
                            ) : (
                              <X className="w-5 h-5 text-destructive" />
                            )}
                            <p className={cn(
                              "font-medium",
                              evaluationResult.isCorrect ? "text-sage" : "text-destructive"
                            )}>
                              {evaluationResult.isCorrect ? 'Correct!' : 'Incorrect'}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{evaluationResult.feedback}</p>
                          <div className="pt-2 border-t border-border/50">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Expected Answer:</p>
                            <p className="text-sm">{currentQuestion.correctAnswer}</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Skip button - only show if question hasn't been answered yet */}
                {evaluationResult === null && (
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={skipQuestion}
                    disabled={isEvaluating}
                    title="Skip and come back later"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                )}
                {currentQuestion.type === 'multiple_choice' ? (
                  <Button
                    variant="burgundy"
                    className="flex-1 h-11"
                    onClick={submitMultipleChoice}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : evaluationResult === null ? (
                  <Button
                    variant="burgundy"
                    className="flex-1 h-11"
                    onClick={submitShortAnswer}
                    disabled={shortAnswer.trim().length < 2 || isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="burgundy"
                    className="flex-1 h-11"
                    onClick={proceedToNext}
                  >
                    {currentIndex < shuffledQuestions.length - 1 ? 'Next Question' : 'See Results'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Submit Test Early Button */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            onClick={() => setShowConfirmEnd(true)} 
            size="sm" 
            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Send className="w-4 h-4 mr-1" />
            Submit Test
          </Button>
        </div>

        {/* Confirm Early Submission Dialog */}
        <AlertDialog open={showConfirmEnd} onOpenChange={setShowConfirmEnd}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gold" />
                Submit Test Early?
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You have answered <strong>{answeredQuestions.length}</strong> of <strong>{shuffledQuestions.length}</strong> questions.
                </p>
                {answeredQuestions.length < shuffledQuestions.length && (
                  <p className="text-destructive">
                    The remaining {shuffledQuestions.length - answeredQuestions.length} unanswered questions will be marked as incorrect.
                  </p>
                )}
                <p>This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Test</AlertDialogCancel>
              <AlertDialogAction 
                onClick={submitTestEarly}
                className="bg-burgundy hover:bg-burgundy/90"
              >
                Submit Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
