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
  HelpCircle
} from 'lucide-react';
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
        <div className="container py-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-gold" />
            </div>
            <h1 className="font-serif text-4xl font-bold mb-4">Quiz Complete!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              You scored {score.correct} out of {shuffledQuestions.length}
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <Card className="bg-sage/10 border-sage/20">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-sage">{score.correct}</p>
                  <p className="text-sm text-sage">Correct</p>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold text-destructive">{score.incorrect}</p>
                  <p className="text-sm text-destructive">Incorrect</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <Progress value={percentage} className="h-4 mb-2" />
              <p className="text-2xl font-bold text-burgundy">{percentage}%</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="burgundy" size="lg" onClick={startQuiz}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="lg" onClick={resetQuiz}>
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
        <div className="container py-12 max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-burgundy" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">Quiz Mode</h1>
            <p className="text-muted-foreground">
              Test your knowledge of menu items, ingredients, and selling points
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Select a Category</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? "burgundy" : "secondary"}
                  onClick={() => setSelectedCategory('')}
                >
                  All Categories
                </Button>
                {categories.map((cat) => {
                  const questionCount = menuItems
                    .filter(i => i.categoryId === cat.id && i.isPublished)
                    .reduce((acc, item) => acc + item.questions.length, 0);
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? "burgundy" : "secondary"}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.icon} {cat.name}
                      <Badge variant="cream" className="ml-2">
                        {questionCount}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {allQuestions.length} questions available
            </p>
            <Button 
              variant="burgundy" 
              size="xl" 
              onClick={startQuiz}
              disabled={allQuestions.length === 0}
            >
              Start Quiz
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Active quiz
  return (
    <Layout>
      <div className="container py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {shuffledQuestions.length}
            </span>
            <div className="flex gap-4">
              <span className="text-sage">✓ {score.correct}</span>
              <span className="text-destructive">✗ {score.incorrect}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
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
              <Card variant="elevated" className="mb-6">
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getTypeLabel(currentQuestion.type).color}>
                      {getTypeLabel(currentQuestion.type).label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentQuestion.menuItemName}
                    </span>
                  </div>

                  {/* Question */}
                  <h2 className="font-serif text-2xl font-semibold mb-6">
                    {currentQuestion.prompt}
                  </h2>

                  {/* Answer */}
                  <AnimatePresence>
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Answer:
                        </p>
                        <p className="text-lg">
                          {currentQuestion.answer}
                        </p>
                      </motion.div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full"
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
                  className="flex gap-4"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleIncorrect}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Got it Wrong
                  </Button>
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-1"
                    onClick={handleCorrect}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Got it Right
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Reset Button */}
        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={resetQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            End Quiz
          </Button>
        </div>
      </div>
    </Layout>
  );
}
