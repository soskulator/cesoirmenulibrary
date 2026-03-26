import { useEffect, useMemo, useRef, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { FlashCard } from '@/components/FlashCard';
import { BeverageFlashCard } from '@/components/BeverageFlashCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  categories, 
  allergens, 
  AllergenType,
  MenuItem
} from '@/data/menuTypes';
import { menuItems as staticMenuItems, filterByAllergen } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';

import { 
  Search, 
  Filter, 
  X,
  Check,
  RotateCcw,
  Shuffle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useAuth } from '@/contexts/AuthContext';

export default function FlashcardsPage() {
  usePageTitle("Flashcards");
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialItem = searchParams.get('item') || '';

  const { user } = useAuth();
  const { markAsKnown: saveKnown, markForReview: saveReview, isKnown, isStudied, getStats } = useStudyProgress();
  
  // Use database items if available, fall back to static
  const { items: dbMenuItems, isLoading: menuLoading } = useMenuItems();
  const menuItems: MenuItem[] = dbMenuItems.length > 0 ? dbMenuItems : staticMenuItems;

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [excludeAllergens, setExcludeAllergens] = useState<AllergenType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [localKnown, setLocalKnown] = useState<Set<string>>(new Set());
  const [localReview, setLocalReview] = useState<Set<string>>(new Set());

  // Filter items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter((i) => i.isPublished);

    if (selectedCategory) {
      items = items.filter((i) => i.categoryId === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((i) => 
        i.name.toLowerCase().includes(query) ||
        i.shortDescription.toLowerCase().includes(query) ||
        i.longDescription.toLowerCase().includes(query)
      );
    }

    if (excludeAllergens.length > 0) {
      items = filterByAllergen(items, excludeAllergens);
    }

    return items;
  }, [selectedCategory, searchQuery, excludeAllergens, menuItems]);

  useEffect(() => {
    if (!initialItem) return;
    const idx = filteredItems.findIndex((i) => i.id === initialItem);
    if (idx >= 0) setCurrentIndex(idx);
  }, [initialItem, filteredItems]);

  // Resume from first unstudied item
  useEffect(() => {
    if (!user) return;
    if (initialItem) return; // respect deep-link
    if (filteredItems.length === 0) return;
    if (isRandomMode) return;

    const firstUnstudied = filteredItems.findIndex(
      (item) => !isKnown(item.name) && !isStudied(item.name)
    );

    if (firstUnstudied > 0) {
      setCurrentIndex(firstUnstudied);
    }
  }, [filteredItems, user, isKnown, isStudied, initialItem, isRandomMode]);

  useEffect(() => {
    if (filteredItems.length === 0) return;
    if (currentIndex >= filteredItems.length) {
      setCurrentIndex(filteredItems.length - 1);
    }
  }, [currentIndex, filteredItems.length]);

  const currentItem = filteredItems[currentIndex];

  const goToNext = () => {
    if (filteredItems.length === 0) return;
    if (isRandomMode) {
      // Random mode: pick a random card
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      setCurrentIndex(randomIndex);
    } else if (currentIndex < filteredItems.length - 1) {
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

    // Save to database if logged in
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

    // Save to database if logged in
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

  const toggleAllergen = (id: AllergenType) => {
    setExcludeAllergens(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
    setCurrentIndex(0);
  };

  return (
    <Layout>
      <div className="container py-4 sm:py-6 md:py-8 max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-1">Flashcards</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Study menu items with interactive flash cards
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="pl-10 h-9 sm:h-10 text-sm"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              className="h-9 sm:h-10 px-2 sm:px-3"
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {excludeAllergens.length > 0 && (
                <Badge variant="copper" className="ml-1 sm:ml-2 text-xs">
                  {excludeAllergens.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="copper"
              size="sm"
              onClick={() => {
                setSelectedCategory('');
                setCurrentIndex(0);
              }}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="copper"
                size="sm"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                }}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>

          {/* Allergen Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-3">Exclude items containing:</p>
                  <div className="flex flex-wrap gap-2">
                    {allergens.map((allergen) => (
                      <Button
                        key={allergen.id}
                        variant={excludeAllergens.includes(allergen.id) ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => toggleAllergen(allergen.id)}
                      >
                        {allergen.icon} {allergen.name}
                        {excludeAllergens.includes(allergen.id) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="mb-3 sm:mb-4 md:mb-6 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex gap-2 sm:gap-4 flex-wrap">
            <span className="text-muted-foreground">
              {currentIndex + 1}/{filteredItems.length}
            </span>
            <span className="text-sage">
              ✓ {user ? stats.known : localKnown.size}
            </span>
            <span className="text-copper">
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
              {/* Use BeverageFlashCard for wine, spirits, cocktails */}
                {['wine', 'spirits', 'cocktails'].includes(currentItem.categoryId) ? (
                  <BeverageFlashCard 
                    item={currentItem}
                    onSwipeLeft={goToNext}
                    onSwipeRight={goToPrev}
                    className={cn(
                      (localKnown.has(currentItem.id) || isKnown(currentItem.name)) && "ring-2 ring-sage",
                      (localReview.has(currentItem.id) || (isStudied(currentItem.name) && !isKnown(currentItem.name))) && "ring-2 ring-gold"
                    )}
                  />
                ) : (
                  <FlashCard 
                    item={currentItem} 
                    showPrepNotes={true}
                    onSwipeLeft={goToNext}
                    onSwipeRight={goToPrev}
                    className={cn(
                      (localKnown.has(currentItem.id) || isKnown(currentItem.name)) && "ring-2 ring-sage",
                      (localReview.has(currentItem.id) || (isStudied(currentItem.name) && !isKnown(currentItem.name))) && "ring-2 ring-gold"
                    )}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No items match your filters
            </p>
            <Button variant="link" onClick={() => {
              setSelectedCategory('');
              setExcludeAllergens([]);
              setSearchQuery('');
            }}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {currentItem && (
          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 justify-center">
            <Button
              variant="copper-outline"
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
      </div>
    </Layout>
  );
}
