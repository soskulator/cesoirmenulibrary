import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LazyImage } from '@/components/LazyImage';
import { cn } from '@/lib/utils';

export interface ContentCardProps {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  categoryColor?: 'copper' | 'sage' | 'burgundy' | 'gold';
  link: string;
  badge?: string;
  rating?: number;
  isFeatured?: boolean;
}

const categoryColors = {
  copper: 'bg-copper/10 text-copper',
  sage: 'bg-sage/10 text-sage',
  burgundy: 'bg-burgundy/10 text-burgundy',
  gold: 'bg-gold/10 text-charcoal',
};

export function ContentCard({
  id,
  title,
  description,
  image,
  category,
  categoryColor = 'copper',
  link,
  badge,
  rating,
  isFeatured,
}: ContentCardProps) {
  return (
    <Link to={link}>
      <Card className={cn(
        'group flex flex-row overflow-hidden border-0 bg-card hover:shadow-elevated transition-all duration-300',
        isFeatured && 'ring-2 ring-copper/20'
      )}>
        {/* Image */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden bg-muted">
          {image ? (
            <LazyImage
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-3xl opacity-30">🍽️</span>
            </div>
          )}
          {isFeatured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-copper text-white text-[10px] px-1.5 py-0.5">
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
          {/* Top row: Title and category badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-serif text-base sm:text-lg font-semibold text-foreground group-hover:text-copper transition-colors truncate">
              {title}
            </h3>
            <Badge className={cn(
              'text-[10px] px-2 py-0.5 flex-shrink-0',
              categoryColors[categoryColor]
            )}>
              {category}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 flex-1">
            {description}
          </p>

          {/* Bottom row: Rating and badge */}
          <div className="flex items-center justify-between mt-2">
            {rating !== undefined && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < rating ? 'fill-copper text-copper' : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            )}
            {badge && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                {badge}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

// Category card variant for displaying menu categories
export interface CategoryCardProps {
  id: string;
  name: string;
  nameFrench: string;
  itemCount: number;
  icon?: string;
  image?: string;
  link: string;
}

export function CategoryCard({
  id,
  name,
  nameFrench,
  itemCount,
  icon,
  image,
  link,
}: CategoryCardProps) {
  return (
    <Link to={link}>
      <Card className="group flex flex-row overflow-hidden border-0 bg-card hover:shadow-elevated transition-all duration-300">
        {/* Image */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden bg-muted">
          {image ? (
            <LazyImage
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-copper/10 to-copper/5">
              <span className="text-4xl">{icon || '🍽️'}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 justify-center min-w-0">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground group-hover:text-copper transition-colors">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground italic">
            {nameFrench}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </Card>
    </Link>
  );
}

// Study mode card variant
export interface StudyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color?: 'copper' | 'sage' | 'charcoal';
}

export function StudyCard({
  title,
  description,
  icon,
  link,
  color = 'copper',
}: StudyCardProps) {
  const colorClasses = {
    copper: 'bg-copper/10 text-copper group-hover:bg-copper group-hover:text-white',
    sage: 'bg-sage/10 text-sage group-hover:bg-sage group-hover:text-white',
    charcoal: 'bg-charcoal/10 text-charcoal group-hover:bg-charcoal group-hover:text-white',
  };

  return (
    <Link to={link}>
      <Card className="group flex flex-row overflow-hidden border-0 bg-card hover:shadow-elevated transition-all duration-300">
        {/* Icon */}
        <div className={cn(
          'w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center transition-colors duration-300',
          colorClasses[color]
        )}>
          <div className="w-10 h-10 sm:w-12 sm:h-12">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 justify-center min-w-0">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-foreground group-hover:text-copper transition-colors">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </Card>
    </Link>
  );
}
