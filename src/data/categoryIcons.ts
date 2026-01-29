import appetizersIcon from '@/assets/icons/appetizers-icon.png';
import entreesIcon from '@/assets/icons/entrees-icon.png';
import dessertsIcon from '@/assets/icons/desserts-icon.png';
import sidesIcon from '@/assets/icons/sides-icon.png';
import specialsIcon from '@/assets/icons/specials-icon.png';
import wineIcon from '@/assets/icons/wine-icon.png';
import spiritsIcon from '@/assets/icons/spirits-icon.png';
import cocktailsIcon from '@/assets/icons/cocktails-icon.png';

export const categoryIcons: Record<string, string> = {
  // New category structure
  crudo: appetizersIcon, // Using appetizers icon for crudo (raw dishes)
  appetizers: appetizersIcon,
  'fruits-de-mer': specialsIcon, // Using specials icon for seafood
  pasta: entreesIcon, // Using entrees icon for pasta
  entrees: entreesIcon,
  sides: sidesIcon,
  desserts: dessertsIcon,
  wine: wineIcon,
  spirits: spiritsIcon,
  cocktails: cocktailsIcon,
  // Legacy support
  specials: specialsIcon,
};

export const getCategoryIcon = (categoryId: string): string | undefined => {
  return categoryIcons[categoryId];
};
