import appetizersIcon from '@/assets/icons/appetizers-icon.png';
import entreesIcon from '@/assets/icons/entrees-icon.png';
import dessertsIcon from '@/assets/icons/desserts-icon.png';
import sidesIcon from '@/assets/icons/sides-icon.png';
import specialsIcon from '@/assets/icons/specials-icon.png';

export const categoryIcons: Record<string, string> = {
  appetizers: appetizersIcon,
  entrees: entreesIcon,
  desserts: dessertsIcon,
  sides: sidesIcon,
  specials: specialsIcon,
};

export const getCategoryIcon = (categoryId: string): string | undefined => {
  return categoryIcons[categoryId];
};
