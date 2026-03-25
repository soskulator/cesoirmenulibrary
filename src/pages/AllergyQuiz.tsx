import { useState, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { menuItems, categories, allergens, AllergenType } from '@/data/menuData';
import { useCategoryQuestions } from '@/hooks/useCategoryQuestions';
import { useAllergenModifications } from '@/hooks/useAllergenModifications';
import { useMenuItems } from '@/hooks/useMenuItems';
import { 
  Check, 
  X, 
  Eye, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  AlertTriangle,
  Minus,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AllergyQuizQuestion {
  id: string;
  type?: 'ingredient';
  dishName: string;
  dishId: string;
  allergen: AllergenType;
  allergenName: string;
  allergenIcon: string;
  ingredientsToRemove: string[];
  allIngredients: { name: string; allergens: AllergenType[]; removable: boolean }[];
  prompt?: string;
}

interface ModificationQuizQuestion {
  id: string;
  type: 'modification';
  dishName: string;
  allergenName: string;
  allergenIcon: string;
  canRemove: boolean;
  substitutionNotes: string;
  prompt: string;
  correctAnswer: string;
}

type AnyQuizQuestion = AllergyQuizQuestion | ModificationQuizQuestion;

// Parse ingredients from ingredientsText
const parseIngredients = (ingredientsText: string): { name: string; allergens: AllergenType[]; removable: boolean }[] => {
  const allergenKeywords: Record<AllergenType, string[]> = {
    gluten: ['bread', 'brioche', 'crouton', 'puff pastry', 'crostini', 'baguette', 'flour', 'panko', 'pasta', 'spaghetti', 'ravioli', 'frites', 'tempura'],
    dairy: ['cheese', 'butter', 'cream', 'gruyère', 'parmesan', 'burrata', 'milk', 'mascarpone', 'crème'],
    egg: ['egg', 'yolk', 'mayo', 'mayonnaise', 'aioli'],
    nuts: ['pistachio', 'pine nut', 'almond', 'hazelnut', 'walnut', 'pecan'],
    shellfish: ['lobster', 'scallop', 'shrimp', 'mussel', 'crab', 'clam', 'oyster', 'octopus'],
    fish: ['anchovy', 'tuna', 'salmon', 'branzino', 'sea bass', 'dover sole', 'fish'],
    soy: ['soy', 'miso', 'tofu', 'edamame'],
    sesame: ['sesame'],
    allium: ['onion', 'garlic', 'shallot', 'leek', 'chive', 'scallion', 'green onion'],
    nightshade: ['tomato', 'pepper', 'chili', 'potato', 'paprika', 'eggplant'],
  };

  const ingredients = ingredientsText.split(',').map(ing => ing.trim()).filter(Boolean);
  
  return ingredients.map((ingredient, index) => {
    const ingredientLower = ingredient.toLowerCase();
    const foundAllergens: AllergenType[] = [];
    
    for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
      if (keywords.some(keyword => ingredientLower.includes(keyword))) {
        foundAllergens.push(allergen as AllergenType);
      }
    }
    
    // First few ingredients are typically base ingredients (not removable)
    const removable = index >= 2;
    
    return {
      name: ingredient,
      allergens: foundAllergens,
      removable,
    };
  });
};

// Generate quiz questions
const generateQuestions = (): AllergyQuizQuestion[] => {
  const questions: AllergyQuizQuestion[] = [];
  
  menuItems.filter(item => item.isPublished && item.categoryId !== 'wine' && item.categoryId !== 'spirits' && item.categoryId !== 'cocktails').forEach(item => {
    const parsedIngredients = parseIngredients(item.ingredientsText);
    
    // For each allergen the dish contains, create a question about which ingredients to remove
    item.allergens.forEach(allergen => {
      const ingredientsWithAllergen = parsedIngredients.filter(
        ing => ing.allergens.includes(allergen) && ing.removable
      );
      
      // Only create question if there are removable ingredients for this allergen
      if (ingredientsWithAllergen.length > 0) {
        const allergenInfo = allergens.find(a => a.id === allergen);
        questions.push({
          id: `${item.id}-${allergen}`,
          dishName: item.name,
          dishId: item.id,
          allergen,
          allergenName: allergenInfo?.name || allergen,
          allergenIcon: allergenInfo?.icon || '⚠️',
          ingredientsToRemove: ingredientsWithAllergen.map(ing => ing.name),
          allIngredients: parsedIngredients,
        });
      }
    });
  });
  
  return questions;
};

export default function AllergyQuizPage() {
  usePageTitle("Allergy Quiz");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionLimit, setQuestionLimit] = useState<number | null>(20);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [shuffledQuestions, setShuffledQuestions] = useState<AnyQuizQuestion[]>([]);
  
  // DB allergy questions are available but this quiz format is specialized
  // (ingredient removal), so DB questions are currently informational only
  const { questions: dbAllergyQuestions, isEmpty: dbIsEmpty } = useCategoryQuestions('allergy');
  const { items: dbItems } = useMenuItems();
  const { modifications } = useAllergenModifications();

  const allQuestions = useMemo(() => generateQuestions(), []);

  const modificationQuestions = useMemo((): ModificationQuizQuestion[] => {
    return modifications
      .filter(m => m.substitution_notes?.trim().length > 0)
      .map(m => {
        const item = dbItems.find(i => i.id === m.menu_item_id);
        const allergenInfo = allergens.find(a => a.id === m.allergen_type);
        if (!item || !allergenInfo) return null;

        const prompt = m.can_remove
          ? `A guest has a ${allergenInfo.name} allergy. How do you modify the ${item.name}?`
          : `A guest has a ${allergenInfo.name} allergy and asks about the ${item.name}. What do you tell them?`;

        return {
          id: `mod-${m.id}`,
          type: 'modification' as const,
          dishName: item.name,
          allergenName: allergenInfo.name,
          allergenIcon: allergenInfo.icon,
          canRemove: m.can_remove,
          substitutionNotes: m.substitution_notes,
          prompt,
          correctAnswer: m.substitution_notes,
        };
      })
      .filter(Boolean) as ModificationQuizQuestion[];
  }, [modifications, dbItems]);

  const startQuiz = () => {
    const combined: AnyQuizQuestion[] = [...allQuestions, ...modificationQuestions];
    const shuffled = [...combined].sort(() => Math.random() - 0.5);
    const limited = questionLimit ? shuffled.slice(0, questionLimit) : shuffled;
    setShuffledQuestions(limited);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setSelectedIngredients(new Set());
    setShowAnswer(false);
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient);
      } else {
        newSet.add(ingredient);
      }
      return newSet;
    });
  };

  const checkAnswer = () => {
    if (!currentQuestion || currentQuestion.type === 'modification') return;
    
    const q = currentQuestion as AllergyQuizQuestion;
    const correctIngredients = new Set(q.ingredientsToRemove);
    const isCorrect = 
      selectedIngredients.size === correctIngredients.size &&
      [...selectedIngredients].every(ing => correctIngredients.has(ing));
    
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }
    
    setShowAnswer(true);
  };

  const goToNext = () => {
    setShowAnswer(false);
    setSelectedIngredients(new Set());
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setSelectedIngredients(new Set());
    setShowAnswer(false);
    const combined: AnyQuizQuestion[] = [...allQuestions, ...modificationQuestions];
    setShuffledQuestions(
      [...combined].sort(() => Math.random() - 0.5).slice(0, questionLimit ?? combined.length)
    );
  };

  const progress = shuffledQuestions.length > 0 
    ? ((score.correct + score.incorrect) / shuffledQuestions.length) * 100 
    : 0;

  const isComplete = shuffledQuestions.length > 0 && 
    score.correct + score.incorrect >= shuffledQuestions.length;

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
                Back to Start
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Allergy Test</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Test your knowledge on which ingredients to remove for specific allergies
            </p>
          </div>

          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-3 text-sm sm:text-base">How It Works</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-burgundy">1.</span>
                  <span>You'll see a dish and an allergy to accommodate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-burgundy">2.</span>
                  <span>Select all ingredients that should be removed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-burgundy">3.</span>
                  <span>Check your answer to see if you got it right</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Question Limit Selector */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold mb-3 text-sm sm:text-base">How many questions?</h2>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 30].map(n => (
                  <Button
                    key={n}
                    variant={questionLimit === n ? "burgundy" : "secondary"}
                    size="sm"
                    onClick={() => setQuestionLimit(n)}
                    className="h-8 sm:h-9 text-xs sm:text-sm min-w-[3rem]"
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant={questionLimit === null ? "burgundy" : "secondary"}
                  size="sm"
                  onClick={() => setQuestionLimit(null)}
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  All ({allQuestions.length + modificationQuestions.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
              {questionLimit ? Math.min(questionLimit, allQuestions.length + modificationQuestions.length) : allQuestions.length + modificationQuestions.length} questions
              {modificationQuestions.length > 0 && (
                <span className="block text-copper text-[11px] mt-1">
                  Includes {modificationQuestions.length} modification questions
                </span>
              )}
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
                  {currentQuestion.type === 'modification' ? (
                    // Modification question
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className="bg-copper/10 text-copper text-xs">
                          {(currentQuestion as ModificationQuizQuestion).allergenIcon}{' '}
                          {(currentQuestion as ModificationQuizQuestion).allergenName} Modification
                        </Badge>
                        {!(currentQuestion as ModificationQuizQuestion).canRemove && (
                          <Badge className="bg-destructive/10 text-destructive text-xs">
                            Cannot Remove
                          </Badge>
                        )}
                      </div>
                      <h2 className="font-serif text-lg sm:text-xl font-semibold mb-4">
                        {currentQuestion.prompt}
                      </h2>
                      {showAnswer ? (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "p-4 rounded-lg border-l-4",
                            (currentQuestion as ModificationQuizQuestion).canRemove
                              ? "bg-jade/10 border-jade"
                              : "bg-amber-50 border-amber-400"
                          )}
                        >
                          <p className="text-sm font-medium mb-1 text-muted-foreground">
                            Correct response:
                          </p>
                          <p className="text-sm leading-relaxed">
                            {(currentQuestion as ModificationQuizQuestion).substitutionNotes}
                          </p>
                        </motion.div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-11"
                          onClick={() => setShowAnswer(true)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Answer
                        </Button>
                      )}
                      {showAnswer && (
                        <div className="mt-4 flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 h-10 border-sage text-sage hover:bg-sage/10"
                            onClick={() => {
                              setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
                              goToNext();
                            }}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            I knew this
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-10 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
                              goToNext();
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Still learning
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Existing ingredient-removal UI
                    <>
                      {/* Question Header */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge className="bg-destructive/10 text-destructive text-xs">
                          {currentQuestion.allergenIcon} {currentQuestion.allergenName} Allergy
                        </Badge>
                      </div>

                      <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold mb-2">
                        {currentQuestion.dishName}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4">
                        Select all ingredients to remove for a guest with a <strong>{currentQuestion.allergenName}</strong> allergy:
                      </p>

                      <div className="space-y-2 mb-4">
                        {(currentQuestion as AllergyQuizQuestion).allIngredients.filter(ing => ing.removable).map((ingredient) => {
                          const isSelected = selectedIngredients.has(ingredient.name);
                          const isCorrect = showAnswer && (currentQuestion as AllergyQuizQuestion).ingredientsToRemove.includes(ingredient.name);
                          const isWrong = showAnswer && isSelected && !(currentQuestion as AllergyQuizQuestion).ingredientsToRemove.includes(ingredient.name);
                          const isMissed = showAnswer && !isSelected && (currentQuestion as AllergyQuizQuestion).ingredientsToRemove.includes(ingredient.name);
                          
                          return (
                            <button
                              key={ingredient.name}
                              onClick={() => !showAnswer && toggleIngredient(ingredient.name)}
                              disabled={showAnswer}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                                showAnswer && isCorrect && isSelected && "bg-sage/20 border-sage",
                                showAnswer && isWrong && "bg-destructive/20 border-destructive",
                                showAnswer && isMissed && "bg-gold/20 border-gold",
                                !showAnswer && isSelected && "bg-burgundy/10 border-burgundy",
                                !showAnswer && !isSelected && "bg-muted/50 border-border hover:bg-muted"
                              )}
                            >
                              <span className="text-sm font-medium">{ingredient.name}</span>
                              <div className="flex items-center gap-2">
                                {ingredient.allergens.length > 0 && (
                                  <div className="flex gap-1">
                                    {ingredient.allergens.map(a => {
                                      const allergenInfo = allergens.find(al => al.id === a);
                                      return (
                                        <span key={a} className="text-xs" title={allergenInfo?.name}>
                                          {allergenInfo?.icon}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                                {!showAnswer && (
                                  isSelected ? (
                                    <Minus className="w-4 h-4 text-burgundy" />
                                  ) : (
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                  )
                                )}
                                {showAnswer && isCorrect && isSelected && <Check className="w-4 h-4 text-sage" />}
                                {showAnswer && isWrong && <X className="w-4 h-4 text-destructive" />}
                                {showAnswer && isMissed && <AlertTriangle className="w-4 h-4 text-gold" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {showAnswer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-3 sm:p-4 bg-muted rounded-lg"
                        >
                          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                            Correct ingredients to remove:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(currentQuestion as AllergyQuizQuestion).ingredientsToRemove.map(ing => (
                              <Badge key={ing} variant="secondary" className="text-xs">
                                {ing}
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons — only for ingredient questions */}
              {currentQuestion.type !== 'modification' && (
                <>
                  {!showAnswer ? (
                    <Button
                      variant="burgundy"
                      size="sm"
                      className="w-full h-10 sm:h-12 text-sm"
                      onClick={checkAnswer}
                      disabled={selectedIngredients.size === 0}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Check Answer
                    </Button>
                  ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    variant="burgundy"
                    size="sm"
                    className="w-full h-10 sm:h-12 text-sm"
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
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Reset Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <Button variant="ghost" onClick={resetQuiz} size="sm" className="h-9 text-xs sm:text-sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            End Quiz
          </Button>
        </div>
      </div>
    </Layout>
  );
}
