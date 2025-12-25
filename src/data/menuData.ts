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
  | 'nightshade';

export interface Allergen {
  id: AllergenType;
  name: string;
  icon: string;
  commonName: string;
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
  { id: 'appetizers', name: 'Appetizers', nameFrench: 'Les Entrées', sortOrder: 1, icon: '🥗' },
  { id: 'entrees', name: 'Entrées', nameFrench: 'Les Plats', sortOrder: 2, icon: '🍽️' },
  { id: 'desserts', name: 'Desserts', nameFrench: 'Les Desserts', sortOrder: 3, icon: '🍰' },
  { id: 'sides', name: 'Sides', nameFrench: 'Les Accompagnements', sortOrder: 4, icon: '🥔' },
  { id: 'specials', name: 'Specials', nameFrench: 'Les Spécialités', sortOrder: 5, icon: '⭐' },
];

export const menuItems: MenuItem[] = [
  // APPETIZERS
  {
    id: 'app-1',
    categoryId: 'appetizers',
    name: 'French Onion Soup',
    shortDescription: 'Classic caramelized onion soup with Gruyère crouton',
    longDescription: 'Our signature French onion soup features sweet Vidalia onions slowly caramelized for 4 hours in butter and sherry, topped with a house-made brioche crouton and melted Gruyère cheese.',
    ingredientsText: 'Vidalia onions, beef stock, sherry wine, fresh thyme, bay leaf, butter, brioche bread, Gruyère cheese, Parmesan',
    prepNotes: 'Onions caramelized in 2-gallon batches. Check soup temperature before service (must be 165°F+). Croutons toasted à la minute.',
    sellingPointsText: 'House-made stock • 4-hour caramelized onions • Imported Gruyère • Gluten-free modification available (no crouton)',
    imageUrl: '/placeholder.svg',
    allergens: ['gluten', 'dairy', 'allium'],
    questions: [
      { id: 'q1', type: 'selling', prompt: 'What makes our French Onion Soup special?', answer: '4-hour caramelized Vidalia onions, house-made beef stock, imported Gruyère' },
      { id: 'q2', type: 'allergy', prompt: 'Can this be made gluten-free?', answer: 'Yes, without the brioche crouton. The soup itself is gluten-free.' },
      { id: 'q3', type: 'quiz', prompt: 'How long are the onions caramelized?', answer: '4 hours' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-2',
    categoryId: 'appetizers',
    name: 'Escargots de Bourgogne',
    shortDescription: 'Traditional Burgundy snails in garlic-herb butter',
    longDescription: 'Six plump Burgundy snails baked in their shells with our signature compound butter of roasted garlic, fresh parsley, and a touch of Pernod.',
    ingredientsText: 'Burgundy snails, butter, roasted garlic, fresh parsley, shallots, Pernod, lemon juice, sea salt',
    prepNotes: 'Compound butter made fresh daily. Snails should be room temp before baking. Bake at 425°F for 8-10 min until bubbling.',
    sellingPointsText: 'Imported from Burgundy • House compound butter • Classic French preparation • Perfect with Chablis',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'shellfish', 'allium'],
    questions: [
      { id: 'q4', type: 'selling', prompt: 'Where do our snails come from?', answer: 'Imported from Burgundy, France' },
      { id: 'q5', type: 'allergy', prompt: 'Does this contain shellfish?', answer: 'Yes, snails are classified as shellfish/mollusks' },
      { id: 'q6', type: 'quiz', prompt: 'What liquor is in the compound butter?', answer: 'Pernod' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-3',
    categoryId: 'appetizers',
    name: 'Salade Niçoise',
    shortDescription: 'Provençal salad with seared ahi tuna',
    longDescription: 'Fresh mesclun greens topped with seared rare ahi tuna, haricots verts, Niçoise olives, soft-boiled egg, roasted fingerling potatoes, and house-made anchovy vinaigrette.',
    ingredientsText: 'Ahi tuna (sushi grade), mesclun greens, haricots verts, Niçoise olives, soft-boiled egg, fingerling potatoes, grape tomatoes, anchovy, Dijon mustard, red wine vinegar, olive oil',
    prepNotes: 'Tuna seared rare (115°F internal). Eggs boiled 6.5 minutes. Potatoes roasted with herbs. Vinaigrette whisked fresh.',
    sellingPointsText: 'Sushi-grade ahi • Perfect 6.5-minute egg • House vinaigrette • Can be made without egg or anchovy',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'egg', 'nightshade'],
    questions: [
      { id: 'q7', type: 'selling', prompt: 'How is the tuna prepared?', answer: 'Sushi-grade ahi, seared rare' },
      { id: 'q8', type: 'allergy', prompt: 'Can this be made without fish?', answer: 'Yes, but it changes the dish significantly. We can substitute grilled chicken.' },
      { id: 'q9', type: 'quiz', prompt: 'What is in the house vinaigrette?', answer: 'Anchovy, Dijon mustard, red wine vinegar, olive oil' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // ENTREES
  {
    id: 'ent-1',
    categoryId: 'entrees',
    name: 'Coq au Vin',
    shortDescription: 'Braised chicken in Burgundy wine with lardons',
    longDescription: 'Free-range chicken braised for 3 hours in Burgundy wine with pearl onions, cremini mushrooms, thick-cut bacon lardons, and fresh herbs. Served with creamy pommes purée.',
    ingredientsText: 'Free-range chicken, Burgundy wine, bacon lardons, pearl onions, cremini mushrooms, chicken stock, fresh thyme, bay leaf, butter, cream, Yukon gold potatoes',
    prepNotes: 'Chicken braised in batches of 8. Check internal temp (165°F). Sauce should coat back of spoon. Purée made fresh each service.',
    sellingPointsText: 'Free-range chicken • 3-hour braise • Real Burgundy wine • Grandmother\'s recipe',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium'],
    questions: [
      { id: 'q10', type: 'selling', prompt: 'What kind of wine is used?', answer: 'Authentic Burgundy wine from France' },
      { id: 'q11', type: 'allergy', prompt: 'Can this be made dairy-free?', answer: 'The chicken can be served without the pommes purée, but the sauce does contain butter.' },
      { id: 'q12', type: 'quiz', prompt: 'How long is the chicken braised?', answer: '3 hours' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-2',
    categoryId: 'entrees',
    name: 'Steak Frites',
    shortDescription: '12oz dry-aged ribeye with truffle fries',
    longDescription: '12-ounce dry-aged ribeye from local farms, cooked to your preference, served with hand-cut fries tossed in truffle oil and fresh herbs, accompanied by our signature Béarnaise sauce.',
    ingredientsText: 'Dry-aged ribeye, Kennebec potatoes, truffle oil, fresh tarragon, chervil, shallots, white wine vinegar, egg yolks, clarified butter, Maldon sea salt',
    prepNotes: 'Ribeye rested 30 min before cooking. Fries double-fried (blanch 325°F, finish 375°F). Béarnaise made fresh, hold warm max 2 hours.',
    sellingPointsText: '28-day dry-aged • Local farm sourced • Hand-cut fries • House Béarnaise',
    imageUrl: '/placeholder.svg',
    allergens: ['egg', 'dairy', 'allium'],
    questions: [
      { id: 'q13', type: 'selling', prompt: 'How is the steak aged?', answer: '28-day dry-aged, sourced from local farms' },
      { id: 'q14', type: 'allergy', prompt: 'What allergens are in the Béarnaise?', answer: 'Egg yolks and butter (dairy)' },
      { id: 'q15', type: 'quiz', prompt: 'What potatoes are used for the fries?', answer: 'Kennebec potatoes' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-3',
    categoryId: 'entrees',
    name: 'Bouillabaisse',
    shortDescription: 'Provençal seafood stew with saffron rouille',
    longDescription: 'Traditional Marseille-style fisherman\'s stew with fresh mussels, clams, prawns, halibut, and fennel in a saffron-tomato broth. Served with grilled sourdough and house-made rouille.',
    ingredientsText: 'Mussels, clams, prawns, halibut, fish stock, saffron, fennel, tomatoes, garlic, Pernod, olive oil, sourdough bread, egg yolk, garlic, cayenne',
    prepNotes: 'Seafood added in stages (mussels/clams first, fish last). Broth temperature critical. Rouille made fresh daily. Check all shellfish are open before serving.',
    sellingPointsText: 'Daily fresh seafood • House fish stock • Imported saffron • Authentic Marseille recipe',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'fish', 'gluten', 'egg', 'allium', 'nightshade'],
    questions: [
      { id: 'q16', type: 'selling', prompt: 'What seafood is included?', answer: 'Mussels, clams, prawns, and halibut' },
      { id: 'q17', type: 'allergy', prompt: 'Can guests with shellfish allergies have this?', answer: 'No, this dish contains multiple types of shellfish and cross-contact is unavoidable.' },
      { id: 'q18', type: 'quiz', prompt: 'What is rouille?', answer: 'A Provençal sauce of olive oil, garlic, saffron, and cayenne, emulsified with egg yolk' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // DESSERTS
  {
    id: 'des-1',
    categoryId: 'desserts',
    name: 'Crème Brûlée',
    shortDescription: 'Classic vanilla bean custard with caramelized sugar',
    longDescription: 'Silky vanilla bean custard made with Madagascar vanilla, farm-fresh cream, and organic eggs, finished with a perfectly torched caramel crust.',
    ingredientsText: 'Heavy cream, egg yolks, Madagascar vanilla bean, organic cane sugar, pinch of sea salt',
    prepNotes: 'Custards baked in water bath 325°F, 45 min. Chill minimum 4 hours. Brûlée to order (torch evenly, watch for burning).',
    sellingPointsText: 'Madagascar vanilla • Farm-fresh cream • Torched to order • Naturally gluten-free',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'egg'],
    questions: [
      { id: 'q19', type: 'selling', prompt: 'What makes our crème brûlée special?', answer: 'Madagascar vanilla bean, farm-fresh cream, torched to order' },
      { id: 'q20', type: 'allergy', prompt: 'Is this gluten-free?', answer: 'Yes, naturally gluten-free' },
      { id: 'q21', type: 'quiz', prompt: 'What type of vanilla do we use?', answer: 'Madagascar vanilla bean' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'des-2',
    categoryId: 'desserts',
    name: 'Tarte Tatin',
    shortDescription: 'Upside-down caramelized apple tart',
    longDescription: 'A French classic featuring Granny Smith apples caramelized in butter and brown sugar, baked under a buttery puff pastry and inverted to serve. Accompanied by Calvados whipped cream.',
    ingredientsText: 'Granny Smith apples, butter, brown sugar, puff pastry, heavy cream, Calvados brandy, vanilla',
    prepNotes: 'Apples arranged in copper pan. Pastry docked and fitted. Bake 400°F 35-40 min. Flip immediately after resting 5 min. Whipped cream made fresh.',
    sellingPointsText: 'Classic copper pan technique • Calvados cream • Served warm • Pastry made in-house',
    imageUrl: '/placeholder.svg',
    allergens: ['gluten', 'dairy'],
    questions: [
      { id: 'q22', type: 'selling', prompt: 'What is Tarte Tatin?', answer: 'An upside-down apple tart, a French accident that became a classic' },
      { id: 'q23', type: 'allergy', prompt: 'Does this contain gluten?', answer: 'Yes, the puff pastry contains wheat flour' },
      { id: 'q24', type: 'quiz', prompt: 'What is Calvados?', answer: 'Apple brandy from the Normandy region of France' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'des-3',
    categoryId: 'desserts',
    name: 'Mousse au Chocolat',
    shortDescription: 'Dark chocolate mousse with Chantilly cream',
    longDescription: 'Rich and airy dark chocolate mousse made with 70% Valrhona chocolate, folded with fresh whipped cream and served with house-made Chantilly and shaved chocolate.',
    ingredientsText: 'Valrhona dark chocolate (70%), heavy cream, egg whites, sugar, vanilla, pinch of sea salt',
    prepNotes: 'Chocolate tempered before folding. Egg whites whipped to stiff peaks. Fold gently to maintain air. Chill minimum 2 hours.',
    sellingPointsText: '70% Valrhona chocolate • Light and airy • House Chantilly • Naturally gluten-free',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'egg'],
    questions: [
      { id: 'q25', type: 'selling', prompt: 'What chocolate do we use?', answer: '70% Valrhona dark chocolate from France' },
      { id: 'q26', type: 'allergy', prompt: 'Does this contain nuts?', answer: 'No nuts in the recipe, but prepared in a kitchen that handles nuts' },
      { id: 'q27', type: 'quiz', prompt: 'What percentage is the chocolate?', answer: '70% cacao' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
];

export const dailyFocus: DailyFocus = {
  date: new Date().toISOString().split('T')[0],
  menuItemIds: ['app-1', 'ent-1', 'des-1'],
};

export const getMenuItemById = (id: string): MenuItem | undefined => {
  return menuItems.find(item => item.id === id);
};

export const getMenuItemsByCategory = (categoryId: string): MenuItem[] => {
  return menuItems.filter(item => item.categoryId === categoryId && item.isPublished);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

export const getAllergenById = (id: AllergenType): Allergen | undefined => {
  return allergens.find(a => a.id === id);
};

export const searchMenuItems = (query: string): MenuItem[] => {
  const lowerQuery = query.toLowerCase();
  return menuItems.filter(item => 
    item.isPublished && (
      item.name.toLowerCase().includes(lowerQuery) ||
      item.shortDescription.toLowerCase().includes(lowerQuery) ||
      item.ingredientsText.toLowerCase().includes(lowerQuery)
    )
  );
};

export const filterByAllergen = (items: MenuItem[], excludeAllergens: AllergenType[]): MenuItem[] => {
  return items.filter(item => 
    !item.allergens.some(a => excludeAllergens.includes(a))
  );
};
