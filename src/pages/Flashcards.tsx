import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { FlashCard } from '@/components/FlashCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  categories, 
  menuItems, 
  allergens, 
  AllergenType,
  getMenuItemById,
  filterByAllergen,
  searchMenuItems 
} from '@/data/menuData';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  X,
  Check,
  RotateCcw,
  Shuffle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FlashcardsPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialItem = searchParams.get('item') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [excludeAllergens, setExcludeAllergens] = useState<AllergenType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownItems, setKnownItems] = useState<Set<string>>(new Set());
  const [reviewItems, setReviewItems] = useState<Set<string>>(new Set());

  // Filter items
  const filteredItems = useMemo(() => {
    let items = menuItems.filter((i) => i.isPublished);

    if (selectedCategory) {
      items = items.filter((i) => i.categoryId === selectedCategory);
    }

    if (searchQuery) {
      items = searchMenuItems(searchQuery).filter((i) => i.isPublished);
      if (selectedCategory) {
        items = items.filter((i) => i.categoryId === selectedCategory);
      }
    }

    if (excludeAllergens.length > 0) {
      items = filterByAllergen(items, excludeAllergens);
    }

    return items;
  }, [selectedCategory, searchQuery, excludeAllergens]);

  useEffect(() => {
    if (!initialItem) return;
    const idx = filteredItems.findIndex((i) => i.id === initialItem);
    if (idx >= 0) setCurrentIndex(idx);
  }, [initialItem, filteredItems]);

  useEffect(() => {
    if (filteredItems.length === 0) return;
    if (currentIndex >= filteredItems.length) {
      setCurrentIndex(filteredItems.length - 1);
    }
  }, [currentIndex, filteredItems.length]);

  const currentItem = filteredItems[currentIndex];

  const goToNext = () => {
    if (currentIndex < filteredItems.length - 1) {
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

    setKnownItems((prev) => new Set(prev).add(currentItem.id));
    setReviewItems((prev) => {
      const next = new Set(prev);
      next.delete(currentItem.id);
      return next;
    });
    goToNext();
  };

  const markForReview = () => {
    if (!currentItem) return;

    setReviewItems((prev) => new Set(prev).add(currentItem.id));
    setKnownItems((prev) => {
      const next = new Set(prev);
      next.delete(currentItem.id);
      return next;
    });
    goToNext();
  };

  const shuffle = () => {
    if (filteredItems.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredItems.length);
    setCurrentIndex(randomIndex);
  };

  const resetProgress = () => {
    setKnownItems(new Set());
    setReviewItems(new Set());
    setCurrentIndex(0);
  };

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
                <Badge variant="burgundy" className="ml-1 sm:ml-2 text-xs">
                  {excludeAllergens.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? "burgundy" : "secondary"}
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
                variant={selectedCategory === cat.id ? "burgundy" : "secondary"}
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
              ✓ {knownItems.size}
            </span>
            <span className="text-gold">
              ↻ {reviewItems.size}
            </span>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={shuffle} className="h-8 px-2 sm:px-3">
              <Shuffle className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Shuffle</span>
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
                <FlashCard 
                  item={currentItem} 
                  showPrepNotes={true}
                  onSwipeLeft={goToNext}
                  onSwipeRight={goToPrev}
                  className={cn(
                    knownItems.has(currentItem.id) && "ring-2 ring-sage",
                    reviewItems.has(currentItem.id) && "ring-2 ring-gold"
                  )}
                />
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

        {/* Navigation */}
        {currentItem && (
          <div className="mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3">
            {/* Arrow Navigation */}
            <div className="flex justify-between items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-5 h-5 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex >= filteredItems.length - 1}
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base active:scale-95 transition-transform"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5 sm:ml-1" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 sm:gap-4 justify-center">
              <Button
                variant="burgundy-outline"
                size="sm"
                onClick={markForReview}
                className="flex-1 max-w-xs h-10 sm:h-12 text-xs sm:text-base active:scale-95 transition-transform"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">Need to Review</span>
                <span className="sm:hidden">Review</span>
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={markAsKnown}
                className="flex-1 max-w-xs h-10 sm:h-12 text-xs sm:text-base active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                <span className="hidden sm:inline">I Know This</span>
                <span className="sm:hidden">Know It</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
