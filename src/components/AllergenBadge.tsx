import { AllergenType, getAllergenById } from '@/data/menuTypes';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AllergenBadgeProps {
  allergenId: AllergenType;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const allergenVariantMap: Record<AllergenType, string> = {
  gluten: 'allergen-gluten',
  dairy: 'allergen-dairy',
  egg: 'allergen-egg',
  nuts: 'allergen-nuts',
  shellfish: 'allergen-shellfish',
  fish: 'allergen-fish',
  soy: 'allergen-soy',
  sesame: 'allergen-sesame',
  allium: 'allergen-allium',
  nightshade: 'allergen-nightshade',
};

export function AllergenBadge({ allergenId, showIcon = true, size = 'default', className }: AllergenBadgeProps) {
  const allergen = getAllergenById(allergenId);
  if (!allergen) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge
      variant={allergenVariantMap[allergenId] as any}
      className={cn(sizeClasses[size], className)}
    >
      {showIcon && <span className="mr-1">{allergen.icon}</span>}
      {allergen.name}
    </Badge>
  );
}

interface AllergenListProps {
  allergens: AllergenType[];
  showIcons?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AllergenList({ allergens, showIcons = true, size = 'default', className }: AllergenListProps) {
  if (!allergens.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {allergens.map((id) => (
        <AllergenBadge key={id} allergenId={id} showIcon={showIcons} size={size} />
      ))}
    </div>
  );
}
