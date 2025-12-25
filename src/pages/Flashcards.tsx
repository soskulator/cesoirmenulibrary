import { useState, useMemo } from 'react';
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
    let items = menuItems.filter(i => i.isPublished);
    
    if (selectedCategory) {
      items = items.filter(i => i.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      items = searchMenuItems(searchQuery);
      if (selectedCategory) {
        items = items.filter(i => i.categoryId === selectedCategory);
      }
    }
    
    if (excludeAllergens.length > 0) {
      items = filterByAllergen(items, excludeAllergens);
    }

    // If initial item is specified, find its index
    if (initialItem) {
      const itemIndex = items.findIndex(i => i.id === initialItem);
      if (itemIndex >= 0 && currentIndex === 0) {
        setCurrentIndex(itemIndex);
      }
    }
    
    return items;
  }, [selectedCategory, searchQuery, excludeAllergens, initialItem]);

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
    if (currentItem) {
      setKnownItems(prev => new Set(prev).add(currentItem.id));
      reviewItems.delete(currentItem.id);
      setReviewItems(new Set(reviewItems));
      goToNext();
    }
  };

  const markForReview = () => {
    if (currentItem) {
      setReviewItems(prev => new Set(prev).add(currentItem.id));
      knownItems.delete(currentItem.id);
      setKnownItems(new Set(knownItems));
      goToNext();
    }
  };

  const shuffle = () => {
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
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">
            Study menu items with interactive flash cards
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentIndex(0);
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {excludeAllergens.length > 0 && (
                <Badge variant="burgundy" className="ml-2">
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
        <div className="mb-6 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <span className="text-muted-foreground">
              Card {currentIndex + 1} of {filteredItems.length}
            </span>
            <span className="text-sage">
              ✓ Known: {knownItems.size}
            </span>
            <span className="text-gold">
              ↻ Review: {reviewItems.size}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={shuffle}>
              <Shuffle className="w-4 h-4 mr-1" />
              Shuffle
            </Button>
            <Button variant="ghost" size="sm" onClick={resetProgress}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
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
          <div className="mt-8 space-y-4">
            {/* Arrow Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="lg"
                onClick={goToPrev}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={goToNext}
                disabled={currentIndex >= filteredItems.length - 1}
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="burgundy-outline"
                size="lg"
                onClick={markForReview}
                className="flex-1 max-w-xs"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Need to Review
              </Button>
              <Button
                variant="success"
                size="lg"
                onClick={markAsKnown}
                className="flex-1 max-w-xs"
              >
                <Check className="w-5 h-5 mr-2" />
                I Know This
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
