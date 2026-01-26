import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { menuItems } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { useQuizScores } from '@/hooks/useQuizScores';

import { 
  Check, 
  X, 
  Eye, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  UtensilsCrossed,
  ChefHat,
  Utensils,
  Leaf
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodQuizQuestion {
  id: string;
  itemId: string;
  itemName: string;
  questionType: 'identify' | 'ingredients' | 'selling' | 'knowledge';
  prompt: string;
  answer: string;
  imageUrl?: string;
}

// Food categories (exclude beverages)
const BEVERAGE_CATEGORIES = ['wine', 'spirits', 'cocktails'];

export default function FoodQuizPage() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [quizType, setQuizType] = useState<'all' | 'identify' | 'knowledge'>('all');

  const { saveQuizScore } = useQuizScores();

  // Get food items only
  const foodItems = useMemo(() => 
    menuItems.filter(i => 
      !BEVERAGE_CATEGORIES.includes(i.categoryId) && i.isPublished
    ),
    []
  );

  // Build food-specific questions (max 2 per item)
  const allQuestions: FoodQuizQuestion[] = useMemo(() => {
    const questions: FoodQuizQuestion[] = [];
    
    foodItems.forEach(item => {
      const image = getDishImage(item.id);
      let questionCount = 0;
      
      // Question 1: Dish identification (if image exists)
      if (image && questionCount < 2) {
        questions.push({
          id: `${item.id}-identify`,
          itemId: item.id,
          itemName: item.name,
          questionType: 'identify',
          prompt: 'Identify this dish:',
          answer: `${item.name} - ${item.shortDescription}`,
          imageUrl: image,
        });
        questionCount++;
      }
      
      // Question 2: Ingredients question
      if (item.ingredientsText && questionCount < 2) {
        questions.push({
          id: `${item.id}-ingredients`,
          itemId: item.id,
          itemName: item.name,
          questionType: 'ingredients',
          prompt: `What are the key ingredients in "${item.name}"?`,
          answer: item.ingredientsText,
        });
        questionCount++;
      }
      
      // If we still have room, add selling point
      if (item.sellingPointsText && questionCount < 2) {
        questions.push({
          id: `${item.id}-selling`,
          itemId: item.id,
          itemName: item.name,
          questionType: 'selling',
          prompt: `What are the selling points for "${item.name}"?`,
          answer: item.sellingPointsText,
        });
        questionCount++;
      }
      
      // Add existing custom quiz questions (up to 2 total)
      item.questions.slice(0, 2 - questionCount).forEach(q => {
        if (questionCount < 2) {
          questions.push({
            id: q.id,
            itemId: item.id,
            itemName: item.name,
            questionType: 'knowledge',
            prompt: q.prompt,
            answer: q.answer,
          });
          questionCount++;
        }
      });
    });
    
    // Filter by quiz type
    if (quizType === 'identify') {
      return questions.filter(q => q.questionType === 'identify');
    }
    if (quizType === 'knowledge') {
      return questions.filter(q => q.questionType !== 'identify');
    }
    
    return questions;
  }, [foodItems, quizType]);

  // Shuffle questions
  const [shuffledQuestions, setShuffledQuestions] = useState<FoodQuizQuestion[]>([]);

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

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'identify': return { label: 'Identify', icon: UtensilsCrossed, color: 'bg-copper/10 text-copper' };
      case 'ingredients': return { label: 'Ingredients', icon: Leaf, color: 'bg-jade/10 text-jade' };
      case 'selling': return { label: 'Selling Point', icon: ChefHat, color: 'bg-gold/10 text-gold' };
      default: return { label: 'Knowledge', icon: Utensils, color: 'bg-burgundy/10 text-burgundy' };
    }
  };

  // Quiz complete screen
  if (isComplete) {
    const percentage = Math.round((score.correct / shuffledQuestions.length) * 100);
    
    // Save score to database
    saveQuizScore('food', score.correct, shuffledQuestions.length);
    
    return (
      <Layout>
        <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-sage" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Food Test Complete!</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8">
              You scored {score.correct} out of {shuffledQuestions.length}
            </p>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="bg-jade/10 border-jade/20">
                <CardContent className="p-3 sm:p-6 text-center">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-jade">{score.correct}</p>
                  <p className="text-xs sm:text-sm text-jade">Correct</p>
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
              <p className="text-xl sm:text-2xl font-bold text-sage">{percentage}%</p>
            </div>

            <div className="flex gap-2 sm:gap-4 justify-center">
              <Button variant="burgundy" size="sm" onClick={startQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={resetQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                Change Test Type
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-sage" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Food Test</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Test your knowledge of our menu items
            </p>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <h2 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Select Test Type</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Button
                  variant={quizType === 'all' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('all')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  🍽️ All Questions
                </Button>
                <Button
                  variant={quizType === 'identify' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('identify')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <UtensilsCrossed className="w-3 h-3 mr-1" />
                  Dish ID
                  <Badge variant="cream" className="ml-1 text-[10px]">
                    {foodItems.filter(f => getDishImage(f.id)).length}
                  </Badge>
                </Button>
                <Button
                  variant={quizType === 'knowledge' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('knowledge')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <ChefHat className="w-3 h-3 mr-1" />
                  Food Knowledge
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Food Preview */}
          <Card className="mb-6 sm:mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 p-2">
                {foodItems.slice(0, 12).map(item => {
                  const image = getDishImage(item.id);
                  return (
                    <div key={item.id} className="aspect-square bg-gradient-to-br from-cream to-sage/10 rounded-lg overflow-hidden flex items-center justify-center p-1">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <UtensilsCrossed className="w-6 h-6 text-sage/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
              {allQuestions.length} questions available ({foodItems.length} dishes × 2 max)
            </p>
            <Button 
              variant="burgundy" 
              size="sm"
              onClick={startQuiz}
              disabled={allQuestions.length === 0}
              className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
            >
              Start Food Test
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
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
              <span className="text-jade">✓ {score.correct}</span>
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
              <Card variant="elevated" className="mb-4 sm:mb-6 overflow-hidden">
                {/* Dish Image for Identification Questions */}
                {currentQuestion.questionType === 'identify' && currentQuestion.imageUrl && (
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-cream via-sage/5 to-cream flex items-center justify-center p-4 border-b border-border/50">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Dish" 
                      className="h-full w-full object-cover rounded-lg drop-shadow-lg"
                    />
                  </div>
                )}
                
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Badge className={cn(getTypeInfo(currentQuestion.questionType).color, "text-[10px] sm:text-xs")}>
                      {getTypeInfo(currentQuestion.questionType).label}
                    </Badge>
                    {currentQuestion.questionType !== 'identify' && (
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">
                        {currentQuestion.itemName}
                      </span>
                    )}
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
                        className="p-3 sm:p-4 bg-sage/10 rounded-lg border border-sage/20"
                      >
                        <p className="text-xs sm:text-sm font-medium text-sage mb-1">
                          Answer:
                        </p>
                        <p className="text-sm sm:text-base md:text-lg font-semibold">
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
