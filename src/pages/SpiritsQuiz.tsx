import { useState, useMemo, useEffect, useRef } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MenuItem } from '@/data/menuTypes';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getDishImage } from '@/data/dishImages';
import { useCategoryQuestions } from '@/hooks/useCategoryQuestions';
import { useQuizScores } from '@/hooks/useQuizScores';

import { 
  Check, 
  X, 
  Eye, 
  RotateCcw, 
  Trophy,
  ArrowRight,
  Martini,
  GlassWater,
  Grape,
  MapPin,
  FlaskConical,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpiritsQuizQuestion {
  id: string;
  itemId: string;
  itemName: string;
  questionType: 'identify' | 'origin' | 'taste' | 'knowledge' | 'cocktail';
  prompt: string;
  answer: string;
  imageUrl?: string;
  category: 'spirit' | 'cocktail';
}

// Spirit origin classification helper
const getSpiritOrigin = (spirit: MenuItem) => {
  const desc = spirit.longDescription.toLowerCase();
  const name = spirit.name.toLowerCase();
  
  if (name.includes('scotch') || desc.includes('scotland') || desc.includes('scottish') || desc.includes('islay') || desc.includes('speyside')) return 'Scotland';
  if (name.includes('bourbon') || desc.includes('kentucky') || desc.includes('tennessee')) return 'Kentucky, USA';
  if (name.includes('tequila') || name.includes('mezcal') || desc.includes('mexico') || desc.includes('oaxaca') || desc.includes('jalisco')) return 'Mexico';
  if (desc.includes('ireland') || desc.includes('irish')) return 'Ireland';
  if (desc.includes('japan') || name.includes('hibiki') || name.includes('yamazaki')) return 'Japan';
  if (desc.includes('france') || desc.includes('cognac') || desc.includes('french')) return 'France';
  if (desc.includes('russia') || desc.includes('poland') || desc.includes('polish')) return 'Eastern Europe';
  if (desc.includes('caribbean') || desc.includes('jamaica') || desc.includes('cuba') || desc.includes('puerto rico')) return 'Caribbean';
  if (desc.includes('italy') || desc.includes('italian')) return 'Italy';
  if (desc.includes('london') || desc.includes('england') || desc.includes('british')) return 'England';
  return 'Various';
};

// Get tasting notes from description
const getTastingNotes = (item: MenuItem) => {
  const desc = item.longDescription.toLowerCase();
  const notes: string[] = [];
  
  if (desc.includes('smoky') || desc.includes('peat')) notes.push('smoky');
  if (desc.includes('vanilla')) notes.push('vanilla');
  if (desc.includes('caramel')) notes.push('caramel');
  if (desc.includes('honey')) notes.push('honey');
  if (desc.includes('citrus') || desc.includes('orange') || desc.includes('lemon')) notes.push('citrus');
  if (desc.includes('spice') || desc.includes('spicy') || desc.includes('pepper')) notes.push('spiced');
  if (desc.includes('fruit') || desc.includes('berry') || desc.includes('apple')) notes.push('fruity');
  if (desc.includes('oak') || desc.includes('wood')) notes.push('oaky');
  if (desc.includes('floral') || desc.includes('botanical')) notes.push('floral/botanical');
  if (desc.includes('chocolate') || desc.includes('cocoa')) notes.push('chocolate');
  if (desc.includes('coffee') || desc.includes('espresso')) notes.push('coffee');
  if (desc.includes('herbal') || desc.includes('herb')) notes.push('herbal');
  if (desc.includes('bitter')) notes.push('bitter');
  if (desc.includes('sweet')) notes.push('sweet');
  
  return notes.length > 0 ? notes.slice(0, 3).join(', ') : 'complex and balanced';
};

export default function SpiritsQuizPage() {
  usePageTitle("Spirits Quiz");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questionLimit, setQuestionLimit] = useState<number | null>(20);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [quizType, setQuizType] = useState<'all' | 'identify' | 'knowledge' | 'cocktails'>('all');
  const { saveQuizScore } = useQuizScores();

  const { questions: dbQuestions, isLoading: isLoadingDb, isEmpty: dbIsEmpty } = useCategoryQuestions('spirits');
  const { items: allMenuItems } = useMenuItems();

  // Get spirit and cocktail items
  const spirits = useMemo(() => 
    allMenuItems.filter(i => i.categoryId === 'spirits' && i.isPublished),
    [allMenuItems]
  );
  
  const signatureCocktails = useMemo(() => 
    allMenuItems.filter(i => 
      i.categoryId === 'cocktails' && 
      i.isPublished && 
      i.id.startsWith('signature-cocktail')
    ),
    [allMenuItems]
  );

  // Build quiz questions
  const allQuestions: SpiritsQuizQuestion[] = useMemo(() => {
    const questions: SpiritsQuizQuestion[] = [];
    
    // Add DB questions as knowledge questions
    if (!dbIsEmpty) {
      dbQuestions.forEach(dbQ => {
        questions.push({
          id: `db-${dbQ.id}`,
          itemId: '',
          itemName: '',
          questionType: 'knowledge',
          prompt: dbQ.question_text,
          answer: dbQ.correct_answer,
          category: 'spirit',
        });
      });
    }

    // Spirit questions
    spirits.forEach(spirit => {
      const image = getDishImage(spirit.id);
      const origin = getSpiritOrigin(spirit);
      const tastingNotes = getTastingNotes(spirit);
      
      // Bottle identification question
      if (image) {
        questions.push({
          id: `${spirit.id}-identify`,
          itemId: spirit.id,
          itemName: spirit.name,
          questionType: 'identify',
          prompt: 'Identify this bottle:',
          answer: `${spirit.name} - ${spirit.shortDescription}`,
          imageUrl: image,
          category: 'spirit',
        });
      }
      
      // Origin question
      if (origin !== 'Various') {
        questions.push({
          id: `${spirit.id}-origin`,
          itemId: spirit.id,
          itemName: spirit.name,
          questionType: 'origin',
          prompt: `Where is "${spirit.name}" from?`,
          answer: origin,
          category: 'spirit',
        });
      }
      
      // Tasting notes question
      questions.push({
        id: `${spirit.id}-taste`,
        itemId: spirit.id,
        itemName: spirit.name,
        questionType: 'taste',
        prompt: `What are the key tasting notes of "${spirit.name}"?`,
        answer: tastingNotes.charAt(0).toUpperCase() + tastingNotes.slice(1),
        category: 'spirit',
      });
      
      // Add existing questions
      spirit.questions.forEach(q => {
        questions.push({
          id: q.id,
          itemId: spirit.id,
          itemName: spirit.name,
          questionType: 'knowledge',
          prompt: q.prompt,
          answer: q.answer,
          category: 'spirit',
        });
      });
    });
    
    // Signature cocktail questions
    signatureCocktails.forEach(cocktail => {
      // Ingredients question
      questions.push({
        id: `${cocktail.id}-ingredients`,
        itemId: cocktail.id,
        itemName: cocktail.name,
        questionType: 'cocktail',
        prompt: `What are the key ingredients in "${cocktail.name}"?`,
        answer: cocktail.ingredientsText,
        category: 'cocktail',
      });
      
      // Description question
      questions.push({
        id: `${cocktail.id}-describe`,
        itemId: cocktail.id,
        itemName: cocktail.name,
        questionType: 'cocktail',
        prompt: `Describe the "${cocktail.name}" cocktail to a guest.`,
        answer: cocktail.longDescription,
        category: 'cocktail',
      });
      
      // Prep notes question
      if (cocktail.prepNotes) {
        questions.push({
          id: `${cocktail.id}-prep`,
          itemId: cocktail.id,
          itemName: cocktail.name,
          questionType: 'cocktail',
          prompt: `How is the "${cocktail.name}" prepared and garnished?`,
          answer: cocktail.prepNotes,
          category: 'cocktail',
        });
      }
    });
    
    // Filter by quiz type
    if (quizType === 'identify') {
      return questions.filter(q => q.questionType === 'identify');
    }
    if (quizType === 'knowledge') {
      return questions.filter(q => q.questionType !== 'identify' && q.category === 'spirit');
    }
    if (quizType === 'cocktails') {
      return questions.filter(q => q.category === 'cocktail');
    }
    
    return questions;
  }, [spirits, signatureCocktails, quizType, dbQuestions, dbIsEmpty]);

  // Shuffle questions
  const [shuffledQuestions, setShuffledQuestions] = useState<SpiritsQuizQuestion[]>([]);

  const startQuiz = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    const limited = questionLimit ? shuffled.slice(0, questionLimit) : shuffled;
    setShuffledQuestions(limited);
    setQuizStarted(true);
    setCurrentIndex(0);
    setScore({ correct: 0, incorrect: 0 });
    setAnsweredQuestions(new Set());
    setShowAnswer(false);
    scoreSavedRef.current = false;
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
    setShuffledQuestions(
      [...allQuestions].sort(() => Math.random() - 0.5)
    );
  };

  const progress = shuffledQuestions.length > 0 
    ? ((score.correct + score.incorrect) / shuffledQuestions.length) * 100 
    : 0;

  const isComplete = shuffledQuestions.length > 0 && 
    score.correct + score.incorrect >= shuffledQuestions.length;

  const getTypeInfo = (type: string, category?: string) => {
    if (category === 'cocktail') return { label: 'Cocktail', icon: GlassWater, color: 'bg-rose-gold/20 text-rose-gold' };
    switch (type) {
      case 'identify': return { label: 'Identify', icon: Martini, color: 'bg-copper/10 text-copper' };
      case 'origin': return { label: 'Origin', icon: MapPin, color: 'bg-jade/10 text-jade' };
      case 'taste': return { label: 'Tasting', icon: FlaskConical, color: 'bg-burgundy/10 text-burgundy' };
      default: return { label: 'Knowledge', icon: Sparkles, color: 'bg-gold/10 text-gold' };
    }
  };

  // Save score when quiz completes
  const scoreSavedRef = useRef(false);
  useEffect(() => {
    if (isComplete && shuffledQuestions.length > 0 && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      saveQuizScore('spirits', score.correct, shuffledQuestions.length);
    }
  }, [isComplete, score.correct, shuffledQuestions.length, saveQuizScore]);

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
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-copper/20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-copper" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Spirits Test Complete!</h1>
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
              <p className="text-xl sm:text-2xl font-bold text-copper">{percentage}%</p>
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Martini className="w-6 h-6 sm:w-8 sm:h-8 text-copper" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Spirits & Cocktails Test</h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Test your knowledge of spirits, tasting notes, origins, and signature cocktails
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
                  🥃 All Questions
                </Button>
                <Button
                  variant={quizType === 'identify' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('identify')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <Martini className="w-3 h-3 mr-1" />
                  Bottle ID
                  <Badge variant="cream" className="ml-1 text-[10px]">
                    {spirits.filter(s => getDishImage(s.id)).length}
                  </Badge>
                </Button>
                <Button
                  variant={quizType === 'knowledge' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('knowledge')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <FlaskConical className="w-3 h-3 mr-1" />
                  Spirit Knowledge
                </Button>
                <Button
                  variant={quizType === 'cocktails' ? "burgundy" : "secondary"}
                  onClick={() => setQuizType('cocktails')}
                  size="sm"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <GlassWater className="w-3 h-3 mr-1" />
                  Signature Cocktails
                  <Badge variant="cream" className="ml-1 text-[10px]">
                    {signatureCocktails.length}
                  </Badge>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Spirit Preview */}
          <Card className="mb-6 sm:mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 p-2">
                {spirits.slice(0, 12).map(spirit => {
                  const image = getDishImage(spirit.id);
                  return (
                    <div key={spirit.id} className="aspect-[3/4] bg-gradient-to-br from-cream to-copper/5 rounded-lg overflow-hidden flex items-center justify-center p-1">
                      {image ? (
                        <img src={image} alt="" className="h-full w-auto object-contain" />
                      ) : (
                        <Martini className="w-6 h-6 text-copper/30" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Question Limit Selector */}
          <Card className="mb-6 sm:mb-8">
            <CardContent className="p-3 sm:p-4 md:p-6">
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
                  All ({allQuestions.length})
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
              {questionLimit ? Math.min(questionLimit, allQuestions.length) : allQuestions.length} questions available
            </p>
            <Button 
              variant="burgundy" 
              size="sm"
              onClick={startQuiz}
              disabled={allQuestions.length === 0}
              className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
            >
              Start Spirits Test
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
                {/* Bottle Image for Identification Questions */}
                {currentQuestion.questionType === 'identify' && currentQuestion.imageUrl && (
                  <div className="h-48 sm:h-64 bg-gradient-to-br from-cream via-copper/5 to-cream flex items-center justify-center p-4 border-b border-border/50">
                    <img 
                      src={currentQuestion.imageUrl} 
                      alt="Spirit bottle" 
                      className="h-full w-auto object-contain drop-shadow-lg"
                    />
                  </div>
                )}
                
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Badge className={cn(getTypeInfo(currentQuestion.questionType, currentQuestion.category).color, "text-[10px] sm:text-xs")}>
                      {getTypeInfo(currentQuestion.questionType, currentQuestion.category).label}
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
                        className="p-3 sm:p-4 bg-copper/5 rounded-lg border border-copper/20"
                      >
                        <p className="text-xs sm:text-sm font-medium text-copper mb-1">
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
        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={resetQuiz} className="text-muted-foreground">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
    </Layout>
  );
}
