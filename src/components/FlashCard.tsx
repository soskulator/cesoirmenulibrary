import { useState } from 'react';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { AllergenList } from './AllergenBadge';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  item: MenuItem;
  showAllergens?: boolean;
  showPrepNotes?: boolean;
  className?: string;
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

export function FlashCard({ item, showAllergens = true, showPrepNotes = false, className }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const dishImage = getDishImage(item.id);

  const bgClass = categoryBackgrounds[item.categoryId] || categoryBackgrounds.appetizers;
  const borderClass = categoryAccents[item.categoryId] || categoryAccents.appetizers;

  const handleFlip = () => setIsFlipped((prev) => !prev);

  return (
    <div
      className={cn('flip-card w-full max-w-md mx-auto cursor-pointer select-none', className)}
      style={{ height: 520 }}
      onClick={handleFlip}
      onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
      tabIndex={0}
      role="button"
      aria-label={`Flash card for ${item.name}. Click to flip.`}
    >
      <div
        className={cn('flip-card-inner relative w-full h-full', isFlipped && 'flipped')}
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
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-7xl opacity-40">🍽️</span>
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <p className="text-xs uppercase tracking-widest text-cream/70 mb-1">Tap to flip</p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-cream drop-shadow-md">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Back: Description */}
        <div
          className={cn(
            'flip-card-back absolute inset-0 rounded-xl border-2 overflow-hidden shadow-elevated p-6 flex flex-col',
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
          <p className="text-xs text-center text-muted-foreground mt-3">Tap to flip back</p>
        </div>
      </div>
    </div>
  );
}
