import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { AllergenList } from './AllergenBadge';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  item: MenuItem;
  showAllergens?: boolean;
  showPrepNotes?: boolean;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

// Category background themes
const categoryBackgrounds: Record<string, string> = {
  appetizers: 'bg-gradient-to-br from-copper/20 via-rose-gold/10 to-cream',
  entrees: 'bg-gradient-to-br from-jade/20 via-jade-light/10 to-cream',
  desserts: 'bg-gradient-to-br from-rose-gold/25 via-copper-light/10 to-cream',
  sides: 'bg-gradient-to-br from-wood/15 via-wood-light/10 to-cream',
  specials: 'bg-gradient-to-br from-gold/20 via-copper/10 to-cream',
};

const categoryAccents: Record<string, string> = {
  appetizers: 'border-copper/30',
  entrees: 'border-jade/30',
  desserts: 'border-rose-gold/30',
  sides: 'border-wood/30',
  specials: 'border-gold/30',
};

const SWIPE_THRESHOLD = 50;

export function FlashCard({ 
  item, 
  showAllergens = true, 
  showPrepNotes = false, 
  className,
  onSwipeLeft,
  onSwipeRight 
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const dishImage = getDishImage(item.id);

  const bgClass = categoryBackgrounds[item.categoryId] || categoryBackgrounds.appetizers;
  const borderClass = categoryAccents[item.categoryId] || categoryAccents.appetizers;

  // Swipe gesture handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleFlip = () => setIsFlipped((prev) => !prev);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check for vertical swipe to flip
    if (Math.abs(offset.y) > SWIPE_THRESHOLD && Math.abs(offset.y) > Math.abs(offset.x)) {
      handleFlip();
    }
    // Check for horizontal swipe to navigate
    else if (Math.abs(offset.x) > SWIPE_THRESHOLD) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <motion.div
      className={cn('flip-card w-full max-w-md mx-auto cursor-pointer select-none touch-none', className)}
      style={{ height: 520, x, y, rotateX, rotateY, perspective: 1000 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      role="button"
      aria-label={`Flash card for ${item.name}. Swipe up/down to flip, left/right to navigate.`}
    >
      <div
        className={cn('flip-card-inner relative w-full h-full', isFlipped && 'flipped')}
        onClick={handleFlip}
        onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
      >
        {/* Front: Image + Name */}
        <div
          className={cn(
            'flip-card-front absolute inset-0 rounded-xl border-2 overflow-hidden shadow-elevated flex flex-col',
            bgClass,
            borderClass
          )}
        >
          {/* Image area */}
          <div className="flex-1 relative">
            {dishImage ? (
              <img
                src={dishImage}
                alt={item.name}
                className="w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-7xl opacity-40">🍽️</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent pointer-events-none" />
          </div>

          {/* Name overlay with larger touch target */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-center min-h-[120px] flex flex-col justify-end">
            <p className="text-xs uppercase tracking-widest text-cream/70 mb-2">
              Swipe up to flip • Swipe left/right to navigate
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-cream drop-shadow-md">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Back: Description */}
        <div
          className={cn(
            'flip-card-back absolute inset-0 rounded-xl border-2 overflow-hidden shadow-elevated p-6 md:p-8 flex flex-col',
            bgClass,
            borderClass
          )}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
            {/* Title */}
            <h2 className="font-serif text-2xl font-semibold text-foreground">{item.name}</h2>
            <p className="text-copper font-medium text-sm">{item.shortDescription}</p>
            <p className="text-muted-foreground leading-relaxed">{item.longDescription}</p>

            {/* Ingredients */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-jade mb-1">Ingredients</h3>
              <p className="text-sm text-muted-foreground">{item.ingredientsText}</p>
            </div>

            {/* Selling Points */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-copper mb-1">Selling Points</h3>
              <p className="text-sm text-muted-foreground">{item.sellingPointsText}</p>
            </div>

            {/* Allergens */}
            {showAllergens && item.allergens.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive mb-1">Allergens</h3>
                <AllergenList allergens={item.allergens} size="sm" />
              </div>
            )}

            {/* Prep Notes */}
            {showPrepNotes && item.prepNotes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Prep Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{item.prepNotes}</p>
              </div>
            )}
          </div>

          {/* Flip hint */}
          <p className="text-xs text-center text-muted-foreground mt-3 min-h-[24px]">
            Swipe down to flip back
          </p>
        </div>
      </div>
    </motion.div>
  );
}
