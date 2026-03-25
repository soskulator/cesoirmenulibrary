import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MenuItem } from '@/data/menuTypes';

interface DietaryBadgeProps {
  type: 'vegetarian' | 'vegan';
  size?: 'sm' | 'default';
  className?: string;
}

const config = {
  vegetarian: { label: 'V', full: 'Vegetarian', icon: '🥬' },
  vegan: { label: 'VE', full: 'Vegan', icon: '🌱' },
};

export function DietaryBadge({ type, size = 'default', className }: DietaryBadgeProps) {
  const c = config[type];
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center rounded-full font-semibold bg-jade/10 text-jade border border-jade/20',
              size === 'sm' ? 'text-[9px] px-1.5 py-0.5 gap-0.5' : 'text-[10px] px-2 py-0.5 gap-1',
              className,
            )}
            aria-label={c.full}
          >
            <span className={size === 'sm' ? 'text-[10px]' : 'text-xs'}>{c.icon}</span>
            {c.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{c.full}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Renders V / VE badges for a menu item based on its allergens array. */
export function DietaryBadges({ item, size = 'default', className }: { item: MenuItem; size?: 'sm' | 'default'; className?: string }) {
  const isVegetarian = item.allergens.includes('vegetarian');
  const isVegan = item.allergens.includes('vegan');
  if (!isVegetarian && !isVegan) return null;

  return (
    <span className={cn('inline-flex gap-1', className)}>
      {isVegetarian && <DietaryBadge type="vegetarian" size={size} />}
      {isVegan && <DietaryBadge type="vegan" size={size} />}
    </span>
  );
}
