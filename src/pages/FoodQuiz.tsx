import { useState, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getDishImage } from '@/data/dishImages';
import { useQuizScores } from '@/hooks/useQuizScores';
import { useCategoryQuestions } from '@/hooks/useCategoryQuestions';

import { 
  Check, 
  X, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  UtensilsCrossed,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';

type QuestionFormat = 'write' | 'select' | 'eliminate';

interface FoodQuizQuestion {
  id: string;
  itemId: string;
  itemName: string;
  format: QuestionFormat;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  imageUrl?: string;
}

// Food categories (exclude beverages)
const BEVERAGE_CATEGORIES = ['wine', 'spirits', 'cocktails'];

const MAX_QUESTIONS = 30;

// Helper to shuffle array
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

// Generate wrong options from other menu items
const getWrongOptions = (correct: string, allItems: string[], count: number): string[] => {
  return shuffle(allItems.filter(item => item !== correct)).slice(0, count);
};

export default function FoodQuizPage() {
  usePageTitle("Food Quiz");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { saveQuizScore } = useQuizScores();
  const { questions: dbQuestions, isLoading: isLoadingDb, isEmpty: dbIsEmpty } = useCategoryQuestions('food');
  const { items: allMenuItems } = useMenuItems();

  // Get food items only
  const foodItems = useMemo(() => 
    allMenuItems.filter(i => 
      !BEVERAGE_CATEGORIES.includes(i.categoryId) && i.isPublished
    ),
    [allMenuItems]
  );

  const allDishNames = useMemo(() => foodItems.map(i => i.name), [foodItems]);

  // Build simplified questions - max 30
  const allQuestions: FoodQuizQuestion[] = useMemo(() => {
    const questions: FoodQuizQuestion[] = [];

    // Add DB questions first if available
    if (!dbIsEmpty) {
      dbQuestions.forEach(dbQ => {
        if (dbQ.question_type === 'multiple_choice' && dbQ.options && dbQ.options.length > 0) {
          questions.push({
            id: `db-${dbQ.id}`,
            itemId: '',
            itemName: '',
            format: 'select',
            prompt: dbQ.question_text,
            correctAnswer: dbQ.correct_answer,
            options: dbQ.options,
          });
        } else {
          questions.push({
            id: `db-${dbQ.id}`,
            itemId: '',
            itemName: '',
            format: 'write',
            prompt: dbQ.question_text,
            correctAnswer: dbQ.correct_answer,
          });
        }
      });
    }

    const formats: QuestionFormat[] = ['write', 'select', 'eliminate'];
    
    // Distribute question types evenly
    foodItems.forEach((item, idx) => {
      const image = getDishImage(item.id, item.imageUrl);
      const format = formats[idx % 3];
      
      // Simple identification or knowledge questions
      if (format === 'write') {
        if (image) {
          questions.push({
            id: `${item.id}-write`,
            itemId: item.id,
            itemName: item.name,
            format: 'write',
            prompt: `Name this dish:`,
            correctAnswer: item.name,
            imageUrl: image,
          });
        } else if (item.shortDescription) {
          questions.push({
            id: `${item.id}-write-desc`,
            itemId: item.id,
            itemName: item.name,
            format: 'write',
            prompt: `"${item.shortDescription}" - What dish is this describing?`,
            correctAnswer: item.name,
          });
        }
      } else if (format === 'select') {
        const wrongOptions = getWrongOptions(item.name, allDishNames, 3);
        if (image) {
          questions.push({
            id: `${item.id}-select`,
            itemId: item.id,
            itemName: item.name,
            format: 'select',
            prompt: `Select the correct name for this dish:`,
            correctAnswer: item.name,
            options: shuffle([item.name, ...wrongOptions]),
            imageUrl: image,
          });
        } else if (item.shortDescription) {
          questions.push({
            id: `${item.id}-select-desc`,
            itemId: item.id,
            itemName: item.name,
            format: 'select',
            prompt: `"${item.shortDescription}" - Which dish matches?`,
            correctAnswer: item.name,
            options: shuffle([item.name, ...wrongOptions]),
          });
        }
      } else {
        const wrongOptions = getWrongOptions(item.name, allDishNames, 2);
        if (item.shortDescription || image) {
          questions.push({
            id: `${item.id}-eliminate`,
            itemId: item.id,
            itemName: item.name,
            format: 'eliminate',
            prompt: image 
              ? `Eliminate the dishes that are NOT shown in this image:`
              : `"${item.shortDescription}" - Eliminate the dishes that DON'T match:`,
            correctAnswer: item.name,
            options: shuffle([item.name, ...wrongOptions]),
            imageUrl: image,
          });
        }
      }
    });
    
    // Shuffle and limit to MAX_QUESTIONS
    return shuffle(questions).slice(0, MAX_QUESTIONS);
  }, [foodItems, allDishNames, dbQuestions, dbIsEmpty]);

  const [shuffledQuestions, setShuffledQuestions] = useState<FoodQuizQuestion[]>([]);

  const startQuiz = () => {
    setShuffledQuestions(shuffle(allQuestions));
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setUserAnswer('');
    setSelectedOptions(new Set());
    setShowResult(false);
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  const checkAnswer = () => {
    if (!currentQuestion) return;

    let correct = false;

    if (currentQuestion.format === 'write') {
      // Fuzzy match - check if user answer contains key words
      const normalized = userAnswer.toLowerCase().trim();
      const correctNormalized = currentQuestion.correctAnswer.toLowerCase();
      correct = normalized === correctNormalized || 
                correctNormalized.includes(normalized) ||
                normalized.includes(correctNormalized.split(' ')[0]);
    } else if (currentQuestion.format === 'select') {
      correct = selectedOptions.has(currentQuestion.correctAnswer) && selectedOptions.size === 1;
    } else if (currentQuestion.format === 'eliminate') {
      // User should NOT select the correct answer
      const wrongOptions = currentQuestion.options?.filter(o => o !== currentQuestion.correctAnswer) || [];
      correct = !selectedOptions.has(currentQuestion.correctAnswer) && 
                wrongOptions.every(o => selectedOptions.has(o));
    }

    setIsCorrect(correct);
    setShowResult(true);
    setScore(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
    }));
  };

  const goToNext = () => {
    setShowResult(false);
    setUserAnswer('');
    setSelectedOptions(new Set());
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setUserAnswer('');
    setSelectedOptions(new Set());
    setShowResult(false);
  };

  const toggleOption = (option: string) => {
    const newSet = new Set(selectedOptions);
    if (newSet.has(option)) {
      newSet.delete(option);
    } else {
      if (currentQuestion?.format === 'select') {
        // Single select for 'select' format
        newSet.clear();
      }
      newSet.add(option);
    }
    setSelectedOptions(newSet);
  };

  const progress = shuffledQuestions.length > 0 
    ? ((score.correct + score.incorrect) / shuffledQuestions.length) * 100 
    : 0;

  const isComplete = shuffledQuestions.length > 0 && 
    score.correct + score.incorrect >= shuffledQuestions.length;

  const getFormatInfo = (format: QuestionFormat) => {
    switch (format) {
      case 'write': return { label: 'Write Answer', color: 'bg-copper/10 text-copper' };
      case 'select': return { label: 'Select One', color: 'bg-jade/10 text-jade' };
      case 'eliminate': return { label: 'Eliminate Wrong', color: 'bg-gold/10 text-gold' };
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-jade/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-jade" />
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
              <p className="text-xl sm:text-2xl font-bold text-jade">{percentage}%</p>
            </div>

            <div className="flex gap-2 sm:gap-4 justify-center">
              <Button variant="burgundy" size="sm" onClick={startQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={resetQuiz} className="h-10 sm:h-11 px-4 sm:px-6 text-sm">
                Back to Menu
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-jade/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-jade" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Food Knowledge Test</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Quick test for servers and bartenders
            </p>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-4 text-sm sm:text-base">Test Format</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-copper/10 text-copper text-xs">Write</Badge>
                  <span className="text-sm text-muted-foreground">Type the dish name</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-jade/10 text-jade text-xs">Select</Badge>
                  <span className="text-sm text-muted-foreground">Pick the correct answer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-gold/10 text-gold text-xs">Eliminate</Badge>
                  <span className="text-sm text-muted-foreground">Remove wrong answers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Preview */}
          <Card className="mb-6 sm:mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 p-2">
                {foodItems.slice(0, 12).map(item => {
                  const image = getDishImage(item.id, item.imageUrl);
                  return (
                    <div key={item.id} className="aspect-square bg-gradient-to-br from-cream to-jade/10 rounded-lg overflow-hidden flex items-center justify-center p-1">
                      {image ? (
                        <img src={image} alt="" className="h-full w-full object-cover rounded" />
                      ) : (
                        <UtensilsCrossed className="w-6 h-6 text-jade/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
              {allQuestions.length} questions • ~5 min
            </p>
            <Button 
              variant="burgundy" 
              size="sm"
              onClick={startQuiz}
              disabled={allQuestions.length === 0}
              className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
            >
              Start Test
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
              Question {currentIndex + 1} of {shuffledQuestions.length}
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
                {/* Dish Image */}
                {currentQuestion.imageUrl && (
                  <div className="h-40 sm:h-56 bg-gradient-to-br from-cream via-jade/5 to-cream flex items-center justify-center p-4 border-b border-border/50">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Dish" 
                      className="h-full w-full object-cover rounded-lg drop-shadow-lg"
                    />
                  </div>
                )}
                
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Badge className={cn(getFormatInfo(currentQuestion.format).color, "text-[10px] sm:text-xs")}>
                      {getFormatInfo(currentQuestion.format).label}
                    </Badge>
                  </div>

                  {/* Dish Image */}
                  {currentQuestion.imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                      <img
                        src={currentQuestion.imageUrl}
                        alt="Identify this dish"
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                  )}

                  {/* Question */}
                  <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
                    {currentQuestion.prompt}
                  </h2>

                  {/* Answer Input Based on Format */}
                  {!showResult && (
                    <>
                      {currentQuestion.format === 'write' && (
                        <div className="space-y-3">
                          <Input
                            placeholder="Type your answer..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="text-base"
                            autoFocus
                          />
                        </div>
                      )}

                      {(currentQuestion.format === 'select' || currentQuestion.format === 'eliminate') && currentQuestion.options && (
                        <div className="grid gap-2">
                          {currentQuestion.options.map((option) => (
                            <Button
                              key={option}
                              variant={selectedOptions.has(option) ? "burgundy" : "outline"}
                              className={cn(
                                "justify-start h-auto py-3 px-4 text-left text-sm",
                                selectedOptions.has(option) && currentQuestion.format === 'eliminate' && "line-through opacity-60"
                              )}
                              onClick={() => toggleOption(option)}
                            >
                              {option}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Result Display */}
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-4 rounded-lg border",
                        isCorrect 
                          ? "bg-jade/10 border-jade/30" 
                          : "bg-destructive/10 border-destructive/30"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                          <Check className="w-5 h-5 text-jade" />
                        ) : (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                        <span className={cn("font-semibold", isCorrect ? "text-jade" : "text-destructive")}>
                          {isCorrect ? "Correct!" : "Incorrect"}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Answer: </span>
                        <span className="font-medium">{currentQuestion.correctAnswer}</span>
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-4">
                {!showResult ? (
                  <Button
                    variant="burgundy"
                    size="sm"
                    className="flex-1 h-10 sm:h-12 text-sm"
                    onClick={checkAnswer}
                    disabled={
                      (currentQuestion.format === 'write' && !userAnswer.trim()) ||
                      ((currentQuestion.format === 'select' || currentQuestion.format === 'eliminate') && selectedOptions.size === 0)
                    }
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Submit Answer
                  </Button>
                ) : (
                  <Button
                    variant="burgundy"
                    size="sm"
                    className="flex-1 h-10 sm:h-12 text-sm"
                    onClick={goToNext}
                  >
                    {currentIndex < shuffledQuestions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        See Results
                        <Trophy className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </Layout>
  );
}
