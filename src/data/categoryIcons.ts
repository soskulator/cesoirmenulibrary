import crudoIcon from '@/assets/categories/crudo-icon.png';
import appetizersIcon from '@/assets/categories/appetizers-icon.png';
import fruitsDeMerIcon from '@/assets/categories/fruits-de-mer-icon.png';
import pastaIcon from '@/assets/categories/pasta-icon.png';
import entreesIcon from '@/assets/categories/entrees-icon.png';
import sidesIcon from '@/assets/categories/sides-icon.png';
import dessertsIcon from '@/assets/categories/desserts-icon.png';

export const categoryIcons: Record<string, string> = {
  crudo: crudoIcon,
  appetizers: appetizersIcon,
  'fruits-de-mer': fruitsDeMerIcon,
  pasta: pastaIcon,
  entrees: entreesIcon,
  sides: sidesIcon,
  desserts: dessertsIcon,
};

export const getCategoryIcon = (categoryId: string): string | undefined => {
  return categoryIcons[categoryId];
};
