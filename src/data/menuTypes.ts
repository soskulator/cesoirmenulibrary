// Lightweight module: types, constants, and utilities that DON'T depend on the
// 5 000-line menuItems array.  Import from here instead of menuData.ts whenever
// you don't need the full item catalogue — this keeps the initial JS bundle small.

export type AllergenType = 
  | 'gluten' 
  | 'dairy' 
  | 'egg' 
  | 'nuts' 
  | 'shellfish' 
  | 'fish' 
  | 'soy' 
  | 'sesame' 
  | 'allium' 
  | 'nightshade'
  | 'vegetarian'
  | 'vegan';

export interface Allergen {
  id: AllergenType;
  name: string;
  icon: string;
  commonName: string;
  /** Dietary tags use inverted logic: an item marked with 'vegan' IS vegan (positive), unlike allergens where the mark means the item CONTAINS the allergen (negative). */
  isDietary?: boolean;
}

export interface Question {
  id: string;
  type: 'selling' | 'allergy' | 'quiz';
  prompt: string;
  answer: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  ingredientsText: string;
  prepNotes: string;
  sellingPointsText: string;
  imageUrl: string;
  allergens: AllergenType[];
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  nameFrench: string;
  sortOrder: number;
  icon: string;
}

export interface DailyFocus {
  date: string;
  menuItemIds: string[];
}

export const allergens: Allergen[] = [
  { id: 'gluten', name: 'Gluten', icon: '🌾', commonName: 'Wheat/Gluten' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', commonName: 'Milk/Dairy' },
  { id: 'egg', name: 'Egg', icon: '🥚', commonName: 'Eggs' },
  { id: 'nuts', name: 'Tree Nuts', icon: '🥜', commonName: 'Nuts' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐', commonName: 'Shellfish' },
  { id: 'fish', name: 'Fish', icon: '🐟', commonName: 'Fish' },
  { id: 'soy', name: 'Soy', icon: '🫘', commonName: 'Soy' },
  { id: 'sesame', name: 'Sesame', icon: '⚪', commonName: 'Sesame' },
  { id: 'allium', name: 'Allium', icon: '🧅', commonName: 'Onion/Garlic' },
  { id: 'nightshade', name: 'Nightshade', icon: '🍅', commonName: 'Tomato/Pepper' },
];

export const categories: Category[] = [
  { id: 'crudo', name: 'Crudo et Tartare', nameFrench: 'Raw & Cured Preparations', sortOrder: 1, icon: '🍣' },
  { id: 'appetizers', name: 'Petites Assiettes', nameFrench: 'Small Plates & Salads', sortOrder: 2, icon: '🥗' },
  { id: 'fruits-de-mer', name: 'Fruits de Mer', nameFrench: 'Seafood Selections', sortOrder: 3, icon: '🦪' },
  { id: 'pasta', name: 'Pasta & Risotto', nameFrench: 'House-Made Pasta & Risotto', sortOrder: 4, icon: '🍝' },
  { id: 'entrees', name: 'From the Grill', nameFrench: 'Prime Cuts & Roasts', sortOrder: 5, icon: '🔥' },
  { id: 'sides', name: 'Accompaniments', nameFrench: 'Seasonal Sides', sortOrder: 6, icon: '🥔' },
  { id: 'desserts', name: 'Desserts', nameFrench: 'Pastry Selections', sortOrder: 7, icon: '🍰' },
  { id: 'sauces', name: 'Les Sauces', nameFrench: 'House Sauces & Condiments', sortOrder: 8, icon: '🫗' },
  { id: 'wine', name: 'Wine', nameFrench: 'Curated Wine Selection', sortOrder: 9, icon: '🍷' },
  { id: 'spirits', name: 'Spirits', nameFrench: 'Premium Spirits', sortOrder: 10, icon: '🥃' },
  { id: 'cocktails', name: 'Cocktails', nameFrench: 'Craft Cocktails', sortOrder: 11, icon: '🍸' },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getAllergenById = (id: AllergenType): Allergen | undefined => {
  return allergens.find(a => a.id === id);
};
