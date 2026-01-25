import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fohTestQuestions, getCategoryLabel, getCategoryColor, FohTestQuestion } from '@/data/fohTestData';
import { useQuizScores } from '@/hooks/useQuizScores';
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
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AnsweredQuestion {
  questionId: number;
  userAnswer: string | number;
  isCorrect: boolean;
}

export default function FohTestPage() {
  const [testStarted, setTestStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  
  const { saveQuizScore } = useQuizScores();

  // Shuffle questions for the test
  const [shuffledQuestions, setShuffledQuestions] = useState<FohTestQuestion[]>([]);

  const startTest = () => {
    const shuffled = [...fohTestQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setTestStarted(true);
    setCurrentIndex(0);
    setAnsweredQuestions([]);
    setShowResult(false);
    setStartTime(new Date());
    setEndTime(null);
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  const submitAnswer = () => {
    if (!currentQuestion) return;

    let isCorrect = false;
    let userAnswer: string | number = '';

    if (currentQuestion.type === 'multiple_choice') {
      if (selectedAnswer === null) return;
      userAnswer = selectedAnswer;
      isCorrect = selectedAnswer === currentQuestion.correctIndex;
    } else {
      if (!shortAnswer.trim()) return;
      userAnswer = shortAnswer.trim();
      // For short answers, we'll show both answers and let user self-evaluate
      // But for automatic scoring, we do a simple comparison
      const normalizedUser = shortAnswer.toLowerCase().trim();
      const normalizedCorrect = currentQuestion.correctAnswer.toLowerCase().trim();
      isCorrect = normalizedUser.includes(normalizedCorrect.substring(0, 20)) || 
                  normalizedCorrect.includes(normalizedUser.substring(0, 20));
    }

    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      userAnswer,
      isCorrect
    }]);

    // Move to next question or show results
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
      setShowResult(false);
    } else {
      setEndTime(new Date());
      setShowResult(true);
    }
  };

  const markAsCorrect = () => {
    // Allow user to mark short answer as correct
    if (!currentQuestion) return;
    
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      userAnswer: shortAnswer.trim(),
      isCorrect: true
    }]);

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
    } else {
      setEndTime(new Date());
      setShowResult(true);
    }
  };

  const markAsIncorrect = () => {
    if (!currentQuestion) return;
    
    setAnsweredQuestions(prev => [...prev, {
      questionId: currentQuestion.id,
      userAnswer: shortAnswer.trim(),
      isCorrect: false
    }]);

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShortAnswer('');
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

  // Save score when test is complete
  useEffect(() => {
    if (showResult && answeredQuestions.length === shuffledQuestions.length && shuffledQuestions.length > 0) {
      saveQuizScore('foh', score.correct, score.total);
    }
  }, [showResult, answeredQuestions.length, shuffledQuestions.length, score.correct, score.total, saveQuizScore]);

  const getTimeSpent = () => {
    if (!startTime || !endTime) return '0 min';
    const diff = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', label: 'Excellent!', color: 'text-sage' };
    if (percentage >= 80) return { grade: 'B', label: 'Great Job!', color: 'text-gold' };
    if (percentage >= 70) return { grade: 'C', label: 'Good', color: 'text-copper' };
    if (percentage >= 60) return { grade: 'D', label: 'Needs Improvement', color: 'text-orange-500' };
    return { grade: 'F', label: 'Study Required', color: 'text-destructive' };
  };

  const resetTest = () => {
    setTestStarted(false);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShortAnswer('');
    setAnsweredQuestions([]);
    setShowResult(false);
    setStartTime(null);
    setEndTime(null);
  };

  // Results screen with scoreboard
  if (showResult) {
    const gradeInfo = getScoreGrade(score.percentage);

    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-3xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Trophy Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gold" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">FoH Test Complete!</h1>
              <p className={cn("text-xl sm:text-2xl font-bold", gradeInfo.color)}>
                {gradeInfo.label}
              </p>
            </div>

            {/* Scoreboard Card */}
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
                  {(['service', 'menu', 'drinks', 'operations', 'general'] as const).map(cat => {
                    const catQuestions = shuffledQuestions.filter(q => q.category === cat);
                    const catAnswered = answeredQuestions.filter(a => {
                      const q = shuffledQuestions.find(sq => sq.id === a.questionId);
                      return q?.category === cat;
                    });
                    const catCorrect = catAnswered.filter(a => a.isCorrect).length;
                    const catPercentage = catQuestions.length > 0 ? Math.round((catCorrect / catQuestions.length) * 100) : 0;

                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <Badge className={cn(getCategoryColor(cat), "w-24 sm:w-32 justify-center text-xs")}>
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

  // Test start screen
  if (!testStarted) {
    const categoryCount = {
      service: fohTestQuestions.filter(q => q.category === 'service').length,
      menu: fohTestQuestions.filter(q => q.category === 'menu').length,
      drinks: fohTestQuestions.filter(q => q.category === 'drinks').length,
      operations: fohTestQuestions.filter(q => q.category === 'operations').length,
      general: fohTestQuestions.filter(q => q.category === 'general').length,
    };

    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 text-burgundy" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">FoH Test_beta</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Front of House Comprehensive Test
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-4">Test Overview</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-burgundy">{fohTestQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Total Questions</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-copper">~30</p>
                  <p className="text-xs text-muted-foreground">Minutes Est.</p>
                </div>
              </div>

              <h3 className="text-sm font-medium mb-3">Categories Covered:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryCount).map(([cat, count]) => (
                  <Badge key={cat} className={cn(getCategoryColor(cat as FohTestQuestion['category']), "text-xs")}>
                    {getCategoryLabel(cat as FohTestQuestion['category'])} ({count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="burgundy" size="lg" onClick={startTest} className="h-12 px-8">
              Start Test
              <ArrowRight className="w-5 h-5 ml-2" />
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
                  <Badge className={cn(getCategoryColor(currentQuestion.category), "mb-3 text-xs")}>
                    {getCategoryLabel(currentQuestion.category)}
                  </Badge>

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
                      />
                      
                      {/* Show correct answer for comparison */}
                      {shortAnswer.trim() && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Correct Answer:</p>
                          <p className="text-sm text-foreground">{currentQuestion.correctAnswer}</p>
                          <p className="text-xs text-muted-foreground mt-3">
                            Compare your answer and mark it accordingly:
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {currentQuestion.type === 'multiple_choice' ? (
                  <Button
                    variant="burgundy"
                    className="flex-1 h-11"
                    onClick={submitAnswer}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 h-11 border-destructive text-destructive hover:bg-destructive hover:text-white"
                      onClick={markAsIncorrect}
                      disabled={!shortAnswer.trim()}
                    >
                      <X className="w-5 h-5 mr-2" />
                      Incorrect
                    </Button>
                    <Button
                      variant="success"
                      className="flex-1 h-11"
                      onClick={markAsCorrect}
                      disabled={!shortAnswer.trim()}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Correct
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* End Test Button */}
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={resetTest} size="sm" className="text-xs">
            <X className="w-4 h-4 mr-1" />
            End Test
          </Button>
        </div>
      </div>
    </Layout>
  );
}
