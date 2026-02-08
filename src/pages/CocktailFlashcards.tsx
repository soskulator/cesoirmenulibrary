import { useEffect, useMemo, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { BeverageFlashCard } from '@/components/BeverageFlashCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { menuItems as staticMenuItems, MenuItem } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { 
  Check,
  RotateCcw,
  Shuffle,
  ArrowLeft,
  GlassWater,
  Clock,
  Star,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useAuth } from '@/contexts/AuthContext';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

// Cocktail style classification (same as Cocktails page)
const classifyCocktail = (cocktail: MenuItem) => {
  const id = cocktail.id;
  const name = cocktail.name.toLowerCase();
  
  if (id.startsWith('signature-cocktail')) return 'signature';
  
  const classics = [
    'old fashioned', 'manhattan', 'negroni', 'martini', 'daiquiri',
    'margarita', 'whiskey sour', 'boulevardier', 'pisco sour'
  ];
  
  const specials = [
    'moscow mule', 'aperol spritz', 'cosmopolitan', 'mojito',
    'espresso martini', 'irish coffee', 'vodka martini'
  ];
  
  if (classics.some(c => name.includes(c))) return 'classic';
  if (specials.some(s => name.includes(s))) return 'specials';
  
  return 'classic';
};

const styleInfo = {
  classic: { title: 'Classic', icon: Clock, color: 'bg-copper/20 text-copper' },
  signature: { title: 'Signature', icon: Star, color: 'bg-gold/20 text-gold' },
  specials: { title: 'Special', icon: Sparkles, color: 'bg-sage/20 text-sage' },
};

export default function CocktailFlashcardsPage() {
  usePageTitle("Cocktail Flashcards");
  const { user } = useAuth();
  const { markAsKnown: saveKnown, markForReview: saveReview, isKnown, isStudied, getStats } = useStudyProgress();
  
  // Use database items if available, fall back to static
  const { items: dbMenuItems } = useMenuItems();
  const menuItems: MenuItem[] = dbMenuItems.length > 0 ? dbMenuItems : staticMenuItems;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandomMode, setIsRandomMode] = useState(true);
  const [localKnown, setLocalKnown] = useState<Set<string>>(new Set());
  const [localReview, setLocalReview] = useState<Set<string>>(new Set());
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  // Get all cocktail items
  const allCocktails = useMemo(() => {
    return menuItems.filter((item) => item.categoryId === 'cocktails' && item.isPublished);
  }, [menuItems]);

  // Filter by style if selected
  const filteredCocktails = useMemo(() => {
    if (!selectedStyle) return allCocktails;
    return allCocktails.filter(c => classifyCocktail(c) === selectedStyle);
  }, [allCocktails, selectedStyle]);

  useEffect(() => {
    if (filteredCocktails.length === 0) return;
    if (currentIndex >= filteredCocktails.length) {
      setCurrentIndex(filteredCocktails.length - 1);
    }
  }, [currentIndex, filteredCocktails.length]);

  const currentItem = filteredCocktails[currentIndex];
  const currentStyle = currentItem ? classifyCocktail(currentItem) : 'classic';

  const goToNext = () => {
    if (filteredCocktails.length === 0) return;
    if (isRandomMode) {
      const randomIndex = Math.floor(Math.random() * filteredCocktails.length);
      setCurrentIndex(randomIndex);
    } else if (currentIndex < filteredCocktails.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const markAsKnown = () => {
    if (!currentItem) return;
    if (user) {
      saveKnown(currentItem.name);
    }
    setLocalKnown((prev) => new Set(prev).add(currentItem.id));
    setLocalReview((prev) => {
      const next = new Set(prev);
      next.delete(currentItem.id);
      return next;
    });
    goToNext();
  };

  const markForReview = () => {
    if (!currentItem) return;
    if (user) {
      saveReview(currentItem.name);
    }
    setLocalReview((prev) => new Set(prev).add(currentItem.id));
    setLocalKnown((prev) => {
      const next = new Set(prev);
      next.delete(currentItem.id);
      return next;
    });
    goToNext();
  };

  const toggleRandomMode = () => {
    setIsRandomMode(prev => !prev);
  };

  const resetProgress = () => {
    setLocalKnown(new Set());
    setLocalReview(new Set());
    setCurrentIndex(0);
  };

  const stats = getStats();
  const StyleIcon = styleInfo[currentStyle as keyof typeof styleInfo]?.icon || Clock;

  return (
    <Layout>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-cream">
        <img
          src={bayfrontSketch}
          alt=""
          className="w-full h-full object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/90 via-cream/60 to-cream" />
      </div>

      <div className="container py-4 sm:py-6 md:py-8 max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link
            to="/cocktails"
            className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wide uppercase">Back to Cocktails</span>
          </Link>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-copper/10">
              <GlassWater className="w-6 h-6 text-copper" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold">Cocktail Flashcards</h1>
              <p className="text-muted-foreground text-sm">
                Master recipes, methods & history
              </p>
            </div>
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={selectedStyle === '' ? "burgundy" : "secondary"}
            size="sm"
            onClick={() => {
              setSelectedStyle('');
              setCurrentIndex(0);
            }}
          >
            All ({allCocktails.length})
          </Button>
          {(['classic', 'signature', 'specials'] as const).map((style) => {
            const count = allCocktails.filter(c => classifyCocktail(c) === style).length;
            const info = styleInfo[style];
            const Icon = info.icon;
            return (
              <Button
                key={style}
                variant={selectedStyle === style ? "burgundy" : "secondary"}
                size="sm"
                onClick={() => {
                  setSelectedStyle(style);
                  setCurrentIndex(0);
                }}
              >
                <Icon className="w-3 h-3 mr-1" />
                {info.title} ({count})
              </Button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex gap-2 sm:gap-4 flex-wrap items-center">
            <span className="text-muted-foreground">
              {currentIndex + 1}/{filteredCocktails.length}
            </span>
            {currentItem && (
              <Badge className={cn("text-xs", styleInfo[currentStyle as keyof typeof styleInfo]?.color)}>
                <StyleIcon className="w-3 h-3 mr-1" />
                {styleInfo[currentStyle as keyof typeof styleInfo]?.title}
              </Badge>
            )}
            <span className="text-sage">
              ✓ {user ? stats.known : localKnown.size}
            </span>
            <span className="text-gold">
              ↻ {user ? stats.review : localReview.size}
            </span>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button 
              variant={isRandomMode ? "secondary" : "ghost"} 
              size="sm" 
              onClick={toggleRandomMode} 
              className="h-8 px-2 sm:px-3"
            >
              <Shuffle className={cn("w-4 h-4 sm:mr-1", isRandomMode && "text-copper")} />
              <span className="hidden sm:inline">{isRandomMode ? 'Random ON' : 'Random OFF'}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={resetProgress} className="h-8 px-2 sm:px-3">
              <RotateCcw className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Flash Card */}
        {currentItem ? (
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <BeverageFlashCard 
                  item={currentItem}
                  onSwipeLeft={goToNext}
                  onSwipeRight={goToPrev}
                  className={cn(
                    (localKnown.has(currentItem.id) || isKnown(currentItem.name)) && "ring-2 ring-sage",
                    (localReview.has(currentItem.id) || (isStudied(currentItem.name) && !isKnown(currentItem.name))) && "ring-2 ring-gold"
                  )}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No cocktails found
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {currentItem && (
          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 justify-center">
            <Button
              variant="burgundy-outline"
              size="sm"
              onClick={markForReview}
              className="flex-1 max-w-xs h-11 sm:h-12 text-sm sm:text-base active:scale-95 transition-transform"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Need to Review</span>
              <span className="sm:hidden">Review</span>
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={markAsKnown}
              className="flex-1 max-w-xs h-11 sm:h-12 text-sm sm:text-base active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">I Know This</span>
              <span className="sm:hidden">Know It</span>
            </Button>
          </div>
        )}

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex flex-col items-center gap-4 p-6 bg-charcoal/5 rounded-2xl">
            <p className="text-charcoal/60 font-serif italic text-sm">
              Ready to test your cocktail knowledge?
            </p>
            <Button variant="outline" asChild className="border-copper text-copper hover:bg-copper hover:text-background">
              <Link to="/quiz">
                <BookOpen className="w-4 h-4 mr-2" />
                Take a Test
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
