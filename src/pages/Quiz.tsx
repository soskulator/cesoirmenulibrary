import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { menuItems, categories } from '@/data/menuData';

import { 
  Check, 
  X, 
  Eye, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  HelpCircle,
  Wine,
  Martini,
  AlertTriangle,
  UserCheck,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: string;
  menuItemId: string;
  menuItemName: string;
  type: 'selling' | 'allergy' | 'quiz';
  prompt: string;
  answer: string;
}

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Build questions from menu items
  const allQuestions: QuizQuestion[] = useMemo(() => {
    let items = menuItems.filter(i => i.isPublished);
    if (selectedCategory) {
      items = items.filter(i => i.categoryId === selectedCategory);
    }
    
    return items.flatMap(item => 
      item.questions.map(q => ({
        ...q,
        menuItemId: item.id,
        menuItemName: item.name,
      }))
    );
  }, [selectedCategory]);

  // Shuffle questions
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const startQuiz = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setAnsweredQuestions(new Set());
    setShowAnswer(false);
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  const handleCorrect = () => {
    if (currentQuestion && !answeredQuestions.has(currentQuestion.id)) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
    goToNext();
  };

  const handleIncorrect = () => {
    if (currentQuestion && !answeredQuestions.has(currentQuestion.id)) {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
    goToNext();
  };

  const goToNext = () => {
    setShowAnswer(false);
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setAnsweredQuestions(new Set());
    setShowAnswer(false);
  };

  const progress = shuffledQuestions.length > 0 
    ? ((score.correct + score.incorrect) / shuffledQuestions.length) * 100 
    : 0;

  const isComplete = shuffledQuestions.length > 0 && 
    score.correct + score.incorrect >= shuffledQuestions.length;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'selling': return { label: 'Selling Point', color: 'bg-gold/10 text-gold' };
      case 'allergy': return { label: 'Allergy', color: 'bg-destructive/10 text-destructive' };
      case 'quiz': return { label: 'Knowledge', color: 'bg-burgundy/10 text-burgundy' };
      default: return { label: 'Question', color: 'bg-muted text-muted-foreground' };
    }
  };

  // Quiz complete screen
  if (isComplete) {
    const percentage = Math.round((score.correct / shuffledQuestions.length) * 100);
    
    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gold" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Test Complete!</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
              You scored {score.correct} out of {shuffledQuestions.length}
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-sage/10 border-sage/20">
                <CardContent className="p-3 sm:p-6 text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-sage">{score.correct}</p>
                  <p className="text-xs sm:text-sm text-sage">Correct</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-3 sm:p-6 text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-destructive">{score.incorrect}</p>
                  <p className="text-xs sm:text-sm text-destructive">Incorrect</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 sm:mb-8">
              <Progress value={percentage} className="h-3 sm:h-4 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-burgundy">{percentage}%</p>
            </div>

            <div className="flex gap-2 sm:gap-4 justify-center">
              <Button variant="burgundy" size="sm" onClick={startQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={resetQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                Change Category
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Quiz start screen
  if (!quizStarted) {
    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-burgundy" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Staff Testing Center</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Choose your test category below
            </p>
          </div>

          {/* Primary Tests - Knowledge Tests */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Knowledge Tests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/foh-test?type=service_staff" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-burgundy/10 via-burgundy/5 to-transparent border border-burgundy/20 p-4 transition-all duration-300 hover:border-burgundy/40 hover:shadow-lg hover:shadow-burgundy/10 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center group-hover:bg-burgundy/20 transition-colors">
                      <UserCheck className="w-5 h-5 text-burgundy" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-burgundy transition-colors">Bartender/Server Test</h3>
                      <p className="text-xs text-muted-foreground">Complete service knowledge</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-burgundy group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
              
              <Link to="/foh-test?type=server_assistant" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-copper/10 via-copper/5 to-transparent border border-copper/20 p-4 transition-all duration-300 hover:border-copper/40 hover:shadow-lg hover:shadow-copper/10 hover:-translate-y-0.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors">
                      <Users className="w-5 h-5 text-copper" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-copper transition-colors">Server Assistant Test</h3>
                      <p className="text-xs text-muted-foreground">Essential service skills</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-copper group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Optional Categorized Tests */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Menu Tests (Optional)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Link to="/wine-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-burgundy/10 via-burgundy/5 to-transparent border border-burgundy/20 p-4 transition-all duration-300 hover:border-burgundy/40 hover:shadow-lg hover:shadow-burgundy/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center group-hover:bg-burgundy/20 transition-colors mx-auto mb-2">
                    <Wine className="w-5 h-5 text-burgundy" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-burgundy transition-colors">Wine</h3>
                </div>
              </Link>

              <Link to="/quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sage/10 via-sage/5 to-transparent border border-sage/20 p-4 transition-all duration-300 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center group-hover:bg-sage/20 transition-colors mx-auto mb-2">
                    <HelpCircle className="w-5 h-5 text-sage" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-sage transition-colors">Food</h3>
                </div>
              </Link>

              <Link to="/cocktail-flashcards" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border border-gold/20 p-4 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors mx-auto mb-2">
                    <Martini className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors">Cocktails</h3>
                </div>
              </Link>

              <Link to="/spirits-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-copper/10 via-copper/5 to-transparent border border-copper/20 p-4 transition-all duration-300 hover:border-copper/40 hover:shadow-lg hover:shadow-copper/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors mx-auto mb-2">
                    <Martini className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-copper transition-colors">Spirits</h3>
                </div>
              </Link>
            </div>

            {/* Allergy Test */}
            <Link to="/allergy-quiz" className="group block">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 p-4 transition-all duration-300 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10 hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-destructive transition-colors">Allergy Test</h3>
                    <p className="text-xs text-muted-foreground">Ingredient removal training</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Active quiz
  return (
    <Layout>
      <div className="container py-4 sm:py-6 md:py-8 max-w-2xl px-3 sm:px-4">
        {/* Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between text-xs sm:text-sm mb-2">
            <span className="text-muted-foreground">
              {currentIndex + 1}/{shuffledQuestions.length}
            </span>
            <div className="flex gap-3 sm:gap-4">
              <span className="text-sage">✓ {score.correct}</span>
              <span className="text-destructive">✗ {score.incorrect}</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2" />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="elevated" className="mb-4 sm:mb-6">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Badge className={cn(getTypeLabel(currentQuestion.type).color, "text-[10px] sm:text-xs")}>
                      {getTypeLabel(currentQuestion.type).label}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {currentQuestion.menuItemName}
                    </span>
                  </div>

                  {/* Question */}
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                    {currentQuestion.prompt}
                  </h2>

                  {/* Answer */}
                  <AnimatePresence>
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 sm:p-4 bg-muted rounded-lg"
                      >
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                          Answer:
                        </p>
                        <p className="text-sm sm:text-base md:text-lg">
                          {currentQuestion.answer}
                        </p>
                      </motion.div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full h-10 sm:h-11 text-sm"
                        onClick={() => setShowAnswer(true)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Reveal Answer
                      </Button>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 sm:gap-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 sm:h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs sm:text-sm"
                    onClick={handleIncorrect}
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Got it Wrong</span>
                    <span className="sm:hidden">Wrong</span>
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    className="flex-1 h-10 sm:h-12 text-xs sm:text-sm"
                    onClick={handleCorrect}
                  >
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Got it Right</span>
                    <span className="sm:hidden">Right</span>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Reset Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <Button variant="ghost" onClick={resetQuiz} size="sm" className="h-9 text-xs sm:text-sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            End Test
          </Button>
        </div>
      </div>
    </Layout>
  );
}
