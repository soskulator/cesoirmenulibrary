import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, getAllergenById } from '@/data/menuData';
import { AllergenList } from './AllergenBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlashCardProps {
  item: MenuItem;
  showAllergens?: boolean;
  showPrepNotes?: boolean;
  className?: string;
}

export function FlashCard({ item, showAllergens = true, showPrepNotes = false, className }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setShowDetails(false);
  };

  return (
    <div 
      className={cn("flip-card w-full max-w-md mx-auto cursor-pointer", className)}
      style={{ minHeight: '400px' }}
    >
      <motion.div
        className="flip-card-inner w-full h-full relative"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <Card 
          variant="elevated"
          className="flip-card-front absolute inset-0 p-6 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={handleFlip}
          role="button"
          aria-label={`Flash card for ${item.name}. Click to flip.`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
        >
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="text-center mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Tap to reveal details
              </p>
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">
                {item.name}
              </h2>
              <p className="text-muted-foreground text-lg">
                {item.shortDescription}
              </p>
            </div>

            {/* Image placeholder */}
            <div className="flex-1 flex items-center justify-center my-4">
              <div className="w-32 h-32 rounded-full bg-cream-dark flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
              </div>
            </div>

            {/* Allergens */}
            {showAllergens && item.allergens.length > 0 && (
              <div className="mt-auto pt-4 border-t border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Contains
                </p>
                <AllergenList allergens={item.allergens} size="sm" />
              </div>
            )}
          </div>

          {/* Flip indicator */}
          <div className="absolute bottom-4 right-4 text-muted-foreground">
            <RotateCcw className="w-5 h-5" />
          </div>
        </Card>

        {/* Back of card */}
        <Card 
          variant="elevated"
          className="flip-card-back absolute inset-0 p-6 flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={handleFlip}
          role="button"
          aria-label={`Details for ${item.name}. Click to flip back.`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
        >
          <div className="flex-1 overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                {item.name}
              </h2>
              <p className="text-muted-foreground">
                {item.longDescription}
              </p>
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-burgundy mb-2">
                Ingredients
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.ingredientsText}
              </p>
            </div>

            {/* Selling Points */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">
                Selling Points
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.sellingPointsText}
              </p>
            </div>

            {/* Allergens */}
            {showAllergens && item.allergens.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-2">
                  Allergens
                </h3>
                <AllergenList allergens={item.allergens} size="sm" />
              </div>
            )}

            {/* Prep Notes Toggle */}
            {showPrepNotes && item.prepNotes && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                >
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    Prep Notes (Manager)
                  </span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-lg">
                        {item.prepNotes}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Flip indicator */}
          <div className="absolute bottom-4 right-4 text-muted-foreground">
            <RotateCcw className="w-5 h-5" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
