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
  { id: 'appetizers', name: 'Appetizers', nameFrench: 'Les Entrées', sortOrder: 1, icon: '🦪' },
  { id: 'entrees', name: 'Entrées', nameFrench: 'Les Plats', sortOrder: 2, icon: '🥩' },
  { id: 'desserts', name: 'Desserts', nameFrench: 'Les Desserts', sortOrder: 3, icon: '🍫' },
  { id: 'sides', name: 'Sides', nameFrench: 'Les Accompagnements', sortOrder: 4, icon: '🍟' },
  { id: 'specials', name: 'Specials', nameFrench: 'Les Spécialités', sortOrder: 5, icon: '👨‍🍳' },
];

export const menuItems: MenuItem[] = [
  // APPETIZERS
  {
    id: 'app-1',
    categoryId: 'appetizers',
    name: 'French Onion Soup',
    shortDescription: 'Oxtail broth, Gruyère, crouton, shallot crumble',
    longDescription: 'A luxurious, elevated take on the classic French onion soup. Sweet onions are slowly caramelized until deeply golden, then simmered in a rich, house-made 24-hour oxtail broth. Finished with a toasted house crouton, topped with melted Gruyère cheese and shallot crumble.',
    ingredientsText: 'Vidalia onions, oxtail broth (roasted oxtails, mirepoix, Cognac, red wine, thyme, tomato paste, bay leaf), Gruyère cheese, brioche crouton, shallot crumble',
    prepNotes: 'Oxtail broth made 24-hour roasted. Onions slow-caramelized for natural sweetness. Gruyère broiled until golden. Crouton toasted à la minute.',
    sellingPointsText: '24-hour roasted oxtail broth • Slow-caramelized onions • Imported Gruyère • Gluten-free modification available (no crouton)',
    imageUrl: '/placeholder.svg',
    allergens: ['gluten', 'dairy', 'allium'],
    questions: [
      { id: 'q1', type: 'selling', prompt: 'What makes our French Onion Soup special?', answer: '24-hour roasted oxtail broth makes it darker, richer, and more savory than standard onion soup.' },
      { id: 'q2', type: 'allergy', prompt: 'Can this be made gluten-free?', answer: 'Yes, without the brioche crouton. The soup itself is gluten-free.' },
      { id: 'q3', type: 'quiz', prompt: 'What is the broth made from?', answer: '24-hour roasted oxtail broth with Cognac and red wine' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-2',
    categoryId: 'appetizers',
    name: 'Escargots',
    shortDescription: 'Garlic-Pernod butter, flaky puff dome',
    longDescription: 'Tender French escargot gently braised with shallots, garlic, white Burgundy, thyme, and bay leaf, then finished with butter for a rich, velvety flavor. Served with a flaky puff pastry dome.',
    ingredientsText: 'French escargot, shallots, garlic, white Burgundy, thyme, bay leaf, butter, puff pastry',
    prepNotes: 'Escargot texture should be soft and tender, never rubbery. Garlic is slow-cooked for sweet, soft flavor. Presented with additional compound butter.',
    sellingPointsText: 'Classic French preparation • Soft, sweet garlic • White Burgundy braised • Flaky puff dome',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'gluten', 'allium'],
    questions: [
      { id: 'q4', type: 'selling', prompt: 'How are the escargots prepared?', answer: 'Braised in white Burgundy with soft, sweet garlic and finished with butter.' },
      { id: 'q5', type: 'allergy', prompt: 'Can this be made without gluten?', answer: 'We can serve without the puff pastry dome, but it changes the presentation.' },
      { id: 'q6', type: 'quiz', prompt: 'What wine is used in the braise?', answer: 'White Burgundy' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-3',
    categoryId: 'appetizers',
    name: 'Steak Tartare',
    shortDescription: 'Dijon, cornichons, shallots, quail egg yolk, onion ash',
    longDescription: 'Hand-cut prime USDA beef tenderloin mixed with shallots, capers, cornichons, chives, Dijon, Worcestershire, a touch of Tabasco, and finished with wild garlic mayo. Served with crispy French baguette crostini and pickled shallots.',
    ingredientsText: 'Prime USDA beef tenderloin, shallots, capers, cornichons, chives, Dijon, Worcestershire, Tabasco, wild garlic mayo, quail egg yolk, French baguette crostini, pickled shallots, onion ash',
    prepNotes: 'Classic French-style tartare — clean, elegant, not overly seasoned. Confit egg yolk adds silky richness. Gluten-free presentation possible without crostini.',
    sellingPointsText: 'Hand-cut prime beef • Wild garlic mayo • Confit quail egg yolk • Classic French preparation',
    imageUrl: '/placeholder.svg',
    allergens: ['egg', 'dairy', 'allium', 'gluten', 'fish'],
    questions: [
      { id: 'q7', type: 'selling', prompt: 'What grade of beef is used?', answer: 'Prime USDA beef tenderloin, hand-cut' },
      { id: 'q8', type: 'allergy', prompt: 'Can this be made gluten-free?', answer: 'Yes, without the crostini. The tartare itself is gluten-free.' },
      { id: 'q9', type: 'quiz', prompt: 'What adds acidity to balance the dish?', answer: 'Pickled shallots and cornichons' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-4',
    categoryId: 'appetizers',
    name: 'Seared Scallops',
    shortDescription: 'Miso brown butter, king mushrooms, sunchokes',
    longDescription: 'Perfectly seared day-boat scallops, caramelized to a golden crust while staying tender and sweet inside. Finished with a rich, nutty miso brown butter bringing toasted hazelnut notes and deep savory umami. Paired with pan-roasted king mushrooms and roasted sunchokes.',
    ingredientsText: 'Day-boat scallops, white miso, brown butter, king mushrooms, sunchokes, olive oil, salt',
    prepNotes: 'Scallops must be caramelized golden, never overcooked. Miso brown butter adds toasty, nutty, deeply savory sauce. King mushrooms add meaty texture.',
    sellingPointsText: 'Day-boat scallops • Miso brown butter • Pan-roasted king mushrooms • Naturally sweet sunchokes',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'dairy', 'soy'],
    questions: [
      { id: 'q10', type: 'selling', prompt: 'What makes the sauce special?', answer: 'Miso brown butter gives a toasty, nutty, deeply savory sauce with umami depth.' },
      { id: 'q11', type: 'allergy', prompt: 'Does this contain shellfish?', answer: 'Yes, scallops are shellfish.' },
      { id: 'q12', type: 'quiz', prompt: 'What gives the dish its umami depth?', answer: 'White miso in the brown butter' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-5',
    categoryId: 'appetizers',
    name: 'Foie Gras Terrine',
    shortDescription: 'Fig mostarda, brûlée brioche, pistachio-pine nut crumble, port gelée',
    longDescription: 'Whole lobes of foie gras gently seasoned, shaped, and slowly cooked until perfectly smooth and luxurious. Served with fig mostarda (black mission figs with Pinot Noir vinegar, port, mustard seeds), ruby port gelée, pistachio-pine nut crumble, and caramelized brûlée brioche.',
    ingredientsText: 'Foie gras (fatty duck liver), fig mostarda (black mission figs, Pinot Noir vinegar, port, mustard seeds, thyme, Dijon), port gelée, pistachios, pine nuts, brioche, sugar',
    prepNotes: 'Terrine slices like soft butter. Fig Mostarda is sweet-tart, not spicy. Port Gelée adds wine aromatics. Brioche is brûléed with caramelized sugar crust.',
    sellingPointsText: 'Silky terrine texture • Fig mostarda • Pistachio-pine nut crumble • Ruby port gelée',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'gluten', 'egg', 'nuts'],
    questions: [
      { id: 'q13', type: 'selling', prompt: 'What accompaniments come with the foie gras?', answer: 'Fig mostarda, ruby port gelée, pistachio-pine nut crumble, and brûlée brioche.' },
      { id: 'q14', type: 'allergy', prompt: 'What nuts are in this dish?', answer: 'Pistachio and pine nuts in the crumble.' },
      { id: 'q15', type: 'quiz', prompt: 'What is fig mostarda?', answer: 'Black mission figs simmered with Pinot Noir vinegar, port, mustard seeds, thyme, and Dijon' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-6',
    categoryId: 'appetizers',
    name: 'Tuna Tartare',
    shortDescription: 'Avocado, mango, tempura crown, citrus-honey vinaigrette',
    longDescription: 'Sushi-grade tuna finely diced and folded with avocado, mango, cucumber, radish, green onion, and cilantro. Dressed in citrus-honey vinaigrette. Finished with tempura crunch crown, sesame, and crispy shallots.',
    ingredientsText: 'Sushi-grade tuna, avocado, mango, cucumber, radish, green onion, cilantro, citrus-honey vinaigrette, tempura crunch, sesame, crispy shallots, micro cilantro, edible flowers',
    prepNotes: 'Flavor is fresh, clean, vibrant — not spicy unless guest requests heat. Arrives shaped in ring mold. Mango adds subtle sweetness.',
    sellingPointsText: 'Sushi-grade tuna • Citrus-honey vinaigrette • Tempura crunch crown • Beautiful ring mold presentation',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'sesame', 'allium', 'gluten'],
    questions: [
      { id: 'q16', type: 'selling', prompt: 'What makes this tartare unique?', answer: 'Bright citrus-honey vinaigrette with mango, tempura crunch crown, and beautiful ring mold presentation.' },
      { id: 'q17', type: 'allergy', prompt: 'Can this be made gluten-free?', answer: 'Yes, without the tempura crunch crown.' },
      { id: 'q18', type: 'quiz', prompt: 'What provides the texture contrast?', answer: 'Silky tuna + creamy avocado + crunchy tempura and crispy shallots' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-7',
    categoryId: 'appetizers',
    name: 'Moule Frites',
    shortDescription: 'PEI mussels, white wine sauce, garlic, cherry tomato, crispy frites',
    longDescription: '18-22 PEI mussels in a rich coastal-style broth of shallots, fennel, leeks, garlic, Calabrian chili, white wine, and clam stock. Finished with butter and cream for silky texture. Served with crispy french fries.',
    ingredientsText: 'PEI mussels, shallots, fennel, leeks, garlic, Calabrian chili, white wine, clam stock, butter, cream, lemon, french fries',
    prepNotes: 'Not overly spicy — Calabrian chili provides gentle background heat. Very rich and smooth. Excellent for dipping bread.',
    sellingPointsText: '18-22 PEI mussels • Calabrian chili warmth • Fennel & leek sweetness • Crispy frites',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'dairy', 'allium', 'nightshade'],
    questions: [
      { id: 'q19', type: 'selling', prompt: 'How many mussels are served?', answer: '18-22 PEI mussels per order' },
      { id: 'q20', type: 'allergy', prompt: 'Is this dish spicy?', answer: 'No, Calabrian chili provides gentle background heat, not overly spicy.' },
      { id: 'q21', type: 'quiz', prompt: 'What stock is used in the broth?', answer: 'Clam stock' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-8',
    categoryId: 'appetizers',
    name: 'Burrata Salad',
    shortDescription: 'Florida heirloom tomato, basil oil, pistachio crumb, fig, aged balsamic',
    longDescription: 'Creamy burrata paired with peak-season Florida heirloom tomatoes. Finished with vibrant basil oil (blanched fresh basil for deep emerald green), Sicilian pistachio crumb, fresh fig, and aged balsamic.',
    ingredientsText: 'Burrata, Florida heirloom tomatoes, basil oil, Sicilian pistachios, panko, fresh fig, aged balsamic, olive oil, salt',
    prepNotes: 'Basil oil is bright, aromatic, and herbaceous. Pistachio crumb adds texture. Fresh fig + aged balsamic give sweet-tart contrast.',
    sellingPointsText: 'Creamy burrata • Peak-season heirloom tomatoes • Sicilian pistachio crumb • Fresh fig',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'nuts', 'gluten'],
    questions: [
      { id: 'q22', type: 'selling', prompt: 'What type of tomatoes are used?', answer: 'Peak-season Florida heirloom tomatoes' },
      { id: 'q23', type: 'allergy', prompt: 'What nuts are in this dish?', answer: 'Sicilian pistachios in the crumb topping.' },
      { id: 'q24', type: 'quiz', prompt: 'How is the basil oil made?', answer: 'Fresh basil is blanched and shocked in ice water to preserve color, then blended with oil' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-9',
    categoryId: 'appetizers',
    name: 'Caesar Salad',
    shortDescription: 'Baby gem, shaved parmesan, pangrattato, smoky dressing',
    longDescription: 'Baby gem lettuce with house-made Caesar dressing (egg yolks, garlic, anchovy, Dijon, lemon juice, red wine vinegar, Parmesan, olive oil). Topped with shaved Parmesan and savory pangrattato.',
    ingredientsText: 'Baby gem lettuce, egg yolks, garlic, anchovy, Dijon mustard, lemon juice, red wine vinegar, Parmesan, olive oil, Worcestershire, pangrattato (toasted baguette, garlic, capers, anchovy, herbs)',
    prepNotes: 'Not shy on anchovy — classic umami depth. Very creamy and full-bodied. Made fresh in small batches.',
    sellingPointsText: 'House-made dressing • Classic umami depth • Savory pangrattato • Fresh baby gem',
    imageUrl: '/placeholder.svg',
    allergens: ['egg', 'dairy', 'fish', 'allium', 'gluten'],
    questions: [
      { id: 'q25', type: 'selling', prompt: 'What makes our Caesar special?', answer: 'House-made dressing with classic anchovy umami depth, creamy and full-bodied.' },
      { id: 'q26', type: 'allergy', prompt: 'Does this contain fish?', answer: 'Yes, anchovy in the dressing and pangrattato.' },
      { id: 'q27', type: 'quiz', prompt: 'What is pangrattato?', answer: 'Savory Italian-style seasoned breadcrumb with garlic, capers, anchovy, and herbs' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'app-10',
    categoryId: 'appetizers',
    name: 'Charred Octopus',
    shortDescription: 'Smokey romesco, chorizo, fingerling potatoes, olives niçoise',
    longDescription: 'Slow-braised octopus in white wine, aromatics, herbs, garlic, and lemon peel, then chilled and finished on the grill for a gently charred edge. Served with smoky romesco, chorizo, fingerling potatoes, and niçoise olives.',
    ingredientsText: 'Octopus, white wine, garlic, lemon peel, thyme, bay leaf, chorizo, fingerling potatoes, niçoise olives, romesco (charred red peppers, tomatoes, almonds, hazelnuts, garlic confit, smoked paprika)',
    prepNotes: 'Texture is tender, not chewy — slow braise ensures refined mouthfeel. Cooked slowly and cooled in broth. Final grill adds light smokiness.',
    sellingPointsText: 'Tender slow-braised • Light char from grill • Smoky romesco • Spanish chorizo',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'allium', 'nuts', 'gluten', 'nightshade'],
    questions: [
      { id: 'q28', type: 'selling', prompt: 'How is the octopus prepared?', answer: 'Slow-braised until tender, then finished on the grill for light smokiness.' },
      { id: 'q29', type: 'allergy', prompt: 'What nuts are in romesco?', answer: 'Almonds and hazelnuts.' },
      { id: 'q30', type: 'quiz', prompt: 'What gives romesco its smoky flavor?', answer: 'Charred red peppers and smoked paprika' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // ENTREES
  {
    id: 'ent-1',
    categoryId: 'entrees',
    name: 'Lobster Spaghetti',
    shortDescription: 'Whole lobster, cherry tomato, Calabrian chilis, lobster bisque',
    longDescription: 'Luxurious pasta featuring whole lobster, split and served both in sauce and on top. Spaghetti tossed with cherry tomatoes, Calabrian chilis, and sweet peas, finished with house-made lobster bisque (roasted shells, leeks, fennel, Cognac, cream).',
    ingredientsText: 'Whole lobster, spaghetti, cherry tomatoes, Calabrian chili, sweet peas, lobster bisque (roasted lobster shells, leeks, fennel, shallots, garlic, Cognac, white wine, cream)',
    prepNotes: 'Made with whole lobster — a true showpiece. Cherry tomatoes add sweetness/acidity. Calabrian chilis bring gentle heat. Bisque is velvety and Cognac-scented.',
    sellingPointsText: 'Whole lobster • House-made bisque • Cherry tomato brightness • Sweet peas',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'dairy', 'gluten', 'allium', 'nightshade'],
    questions: [
      { id: 'q31', type: 'selling', prompt: 'What makes this pasta special?', answer: 'Made with whole lobster, not just tail or claw — a true showpiece dish coated in velvety lobster bisque.' },
      { id: 'q32', type: 'allergy', prompt: 'Is this dish spicy?', answer: 'Calabrian chilis bring gentle heat, not overpowering. Can be omitted on request.' },
      { id: 'q33', type: 'quiz', prompt: 'What gives the bisque its aroma?', answer: 'Cognac and roasted lobster shells' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-2',
    categoryId: 'entrees',
    name: 'Wild Mushroom Ravioli',
    shortDescription: 'Gorgonzola-truffle cream, walnut, pangrattato',
    longDescription: 'House-made ravioli filled with earthy forest mushrooms and herbs. Thin, delicate pasta finished with gorgonzola-truffle cream sauce (fresh truffle, gorgonzola, cream, white wine, shallots, thyme, rosemary). Topped with toasted walnuts and pangrattato.',
    ingredientsText: 'House-made pasta, wild mushrooms, herbs, gorgonzola, fresh truffle, cream, white wine, shallots, thyme, rosemary, walnuts, pangrattato',
    prepNotes: 'Ravioli are house-made with deep, earthy filling. Sauce combines gorgonzola + fresh truffle. Both walnuts and pangrattato for layered texture.',
    sellingPointsText: 'House-made pasta • Fresh truffle • Gorgonzola cream • Toasted walnuts',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'nuts', 'gluten', 'allium', 'egg'],
    questions: [
      { id: 'q34', type: 'selling', prompt: 'What is in the sauce?', answer: 'Gorgonzola-truffle cream with fresh truffle, aromatic and luxurious.' },
      { id: 'q35', type: 'allergy', prompt: 'What nuts are in this dish?', answer: 'Walnuts as a topping.' },
      { id: 'q36', type: 'quiz', prompt: 'What provides the textural contrast?', answer: 'Toasted walnuts and pangrattato (seasoned breadcrumbs)' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-3',
    categoryId: 'entrees',
    name: 'Bouillabaisse',
    shortDescription: 'Lobster, prawns, snapper, clams, saffron broth, rouille',
    longDescription: 'Refined Provençal-style seafood stew with poached lobster, Josper-grilled prawns, olive-oil confit snapper, and steamed clams. Served in crystal-clear saffron shellfish broth (lobster stock, fennel, leek, saffron, tomato, white wine, Pernod). Accompanied by traditional rouille.',
    ingredientsText: 'Lobster, prawns, snapper, clams, saffron, lobster stock, fennel, leek, tomato, white wine, Pernod, rouille (potato, saffron, garlic, egg yolk, olive oil)',
    prepNotes: 'Light, aromatic, elegant — not a heavy stew. Broth is clarified for purity and depth. Each seafood cooked individually and precisely. Rouille is creamy, garlicky, gently warm.',
    sellingPointsText: 'Crystal-clear saffron broth • Multiple seafood preparations • Traditional rouille • Elegant presentation',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'fish', 'dairy', 'egg', 'allium', 'nightshade'],
    questions: [
      { id: 'q37', type: 'selling', prompt: 'What seafood is included?', answer: 'Poached lobster, Josper-grilled prawns, olive-oil confit snapper, and steamed clams.' },
      { id: 'q38', type: 'allergy', prompt: 'Can guests with shellfish allergies have this?', answer: 'No, this dish contains multiple shellfish and cross-contact is unavoidable.' },
      { id: 'q39', type: 'quiz', prompt: 'What is rouille?', answer: 'A traditional Provençal sauce of potato, saffron, garlic, and olive oil emulsified with egg yolk' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-4',
    categoryId: 'entrees',
    name: 'Chilean Sea Bass',
    shortDescription: 'Leek fondue, caviar beurre blanc, baby fennel',
    longDescription: 'Crisp-skinned sea bass pan-seared to golden perfection over buttery leek fondue (slow-cooked leeks with cream, white wine, lemon). Finished with caviar beurre blanc — rich sauce with premium caviar, salmon roe, and chives for luxurious, briny pop.',
    ingredientsText: 'Chilean sea bass, leeks, cream, white wine, lemon, shallots, butter, vinegar, caviar, salmon roe, chives, baby fennel',
    prepNotes: 'Sea bass has crisp skin and moist, tender flesh. Leek fondue adds buttery sweetness. Caviar beurre blanc gives silky richness and gentle salinity.',
    sellingPointsText: 'Crisp-skinned • Buttery leek fondue • Premium caviar beurre blanc • Elegant French seafood',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'dairy', 'allium'],
    questions: [
      { id: 'q40', type: 'selling', prompt: 'What makes this dish luxurious?', answer: 'Caviar beurre blanc with premium caviar and salmon roe for an elegant, briny finish.' },
      { id: 'q41', type: 'allergy', prompt: 'What dairy is in this dish?', answer: 'Butter and cream in the leek fondue and beurre blanc sauce.' },
      { id: 'q42', type: 'quiz', prompt: 'What is leek fondue?', answer: 'Slow-cooked leeks finished with cream, white wine, and lemon for silky sweetness' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-5',
    categoryId: 'entrees',
    name: 'Crispy Skin Salmon',
    shortDescription: 'Fingerling potatoes, creamed spinach, French yellow curry',
    longDescription: 'Beautifully crisp skin-on salmon with golden crackling skin and tender flesh. Served with buttery fingerling potatoes and silky creamed spinach. Finished with French Yellow Curry Sauce — aromatic curry with Madras curry, turmeric, coconut milk, cream, kaffir lime, and preserved lemon.',
    ingredientsText: 'Salmon, fingerling potatoes, spinach, cream, butter, shallots, garlic, ginger, Thai chili, Madras curry, turmeric, fish fumet, coconut milk, kaffir lime, preserved lemon',
    prepNotes: 'Salmon is crisp-skinned, moist, and delicate. French yellow curry is aromatic, elegant, mild — not spicy, more floral and citrusy.',
    sellingPointsText: 'Crisp golden skin • French yellow curry • Kaffir lime brightness • Creamed spinach',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'dairy', 'allium', 'nightshade'],
    questions: [
      { id: 'q43', type: 'selling', prompt: 'What is the French yellow curry like?', answer: 'Aromatic, elegant, and mild — not spicy, more floral and citrusy with kaffir lime and preserved lemon.' },
      { id: 'q44', type: 'allergy', prompt: 'Does this contain coconut?', answer: 'Yes, the curry sauce contains coconut milk.' },
      { id: 'q45', type: 'quiz', prompt: 'What makes the curry sauce French-inspired?', answer: 'Light, floral approach with wine, cream, kaffir lime, and preserved lemon — not a heavy Thai curry' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-6',
    categoryId: 'entrees',
    name: 'Rack of Lamb',
    shortDescription: 'Porcini-crusted Colorado lamb, oxtail jus, saffron risotto',
    longDescription: 'Premium Colorado rack of lamb rubbed with fragrant porcini mushroom crust, roasted over charcoal in the Josper oven. Paired with silky oxtail jus, cherry tomato confit, and creamy saffron risotto.',
    ingredientsText: 'Colorado rack of lamb, porcini mushroom crust, oxtail jus, cherry tomato confit, saffron risotto (arborio rice, saffron, shallots, white wine, Parmesan, butter)',
    prepNotes: 'Colorado lamb is mild, tender, without strong gaminess. Porcini crust gives earthy depth. Josper oven adds smokiness. Oxtail jus is rich and glossy.',
    sellingPointsText: 'Colorado lamb • Porcini crust • Josper charcoal roasted • Saffron risotto',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium'],
    questions: [
      { id: 'q46', type: 'selling', prompt: 'How is the lamb prepared?', answer: 'Porcini-crusted and roasted over charcoal in the Josper oven for smokiness and perfect caramelization.' },
      { id: 'q47', type: 'allergy', prompt: 'Is there beef in this dish?', answer: 'Yes, the oxtail jus contains beef.' },
      { id: 'q48', type: 'quiz', prompt: 'What adds smokiness to the lamb?', answer: 'The Josper charcoal oven' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-7',
    categoryId: 'entrees',
    name: 'Roasted Chicken',
    shortDescription: 'Truffle jus, romesco, garlic confit, roasted potatoes',
    longDescription: 'Beautifully roasted half chicken with crisp golden skin and tender, juicy meat. Finished with rich truffle jus, smoky romesco (charred peppers, almonds, hazelnuts, smoked paprika), creamed spinach, roasted potatoes, and whole garlic confit.',
    ingredientsText: 'Half chicken, truffle jus, romesco (charred red peppers, tomatoes, almonds, hazelnuts, garlic confit, smoked paprika, vinegar), creamed spinach, roasted potatoes, garlic confit (baby garlic, thyme, bay, lemon zest)',
    prepNotes: 'Chicken is crispy-skinned, juicy, roasted to order. Truffle jus gives luxurious finish. Garlic confit is sweet and buttery, not sharp.',
    sellingPointsText: 'Crispy golden skin • Rich truffle jus • Smoky romesco • Sweet garlic confit',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium', 'nuts', 'gluten', 'nightshade'],
    questions: [
      { id: 'q49', type: 'selling', prompt: 'What accompaniments come with the chicken?', answer: 'Truffle jus, smoky romesco, creamed spinach, roasted potatoes, and sweet garlic confit.' },
      { id: 'q50', type: 'allergy', prompt: 'What nuts are in romesco?', answer: 'Almonds and hazelnuts.' },
      { id: 'q51', type: 'quiz', prompt: 'What is garlic confit?', answer: 'Whole baby garlic heads slow-poached in oil with thyme, bay, and lemon zest until soft and sweet' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-8',
    categoryId: 'entrees',
    name: 'Duck Confit Cassoulet',
    shortDescription: 'Bean cassoulet, pancetta, pork ragout, sausage, pangrattato',
    longDescription: 'Classic French country dish with creamy cannellini beans simmered with pancetta, garlic, thyme, and bay. Enriched with deep pork ragù (slow-braised pork shoulder, chicken stock, white wine, tomatoes). Topped with crispy duck confit leg, seared sausages, and toasted pangrattato.',
    ingredientsText: 'Duck confit leg, cannellini beans, pancetta, garlic, thyme, bay leaf, pork ragù (pork shoulder, chicken stock, white wine, tomatoes), Toulouse sausage, Italian sausage, pangrattato, parsley, chives',
    prepNotes: 'Traditional French preparation — hearty but refined, not greasy. Duck confit is tender inside, crispy outside. Beans are creamy, deeply seasoned.',
    sellingPointsText: 'Crispy duck confit • Slow-cooked pork ragù • Two sausage varieties • Toasted pangrattato',
    imageUrl: '/placeholder.svg',
    allergens: ['gluten', 'allium'],
    questions: [
      { id: 'q52', type: 'selling', prompt: 'What makes this cassoulet special?', answer: 'Crispy duck confit leg, slow-cooked pork ragù, two sausage varieties, and creamy beans — a hearty but refined French classic.' },
      { id: 'q53', type: 'allergy', prompt: 'What meat is in this dish?', answer: 'Duck, pork (pancetta, shoulder, and sausages).' },
      { id: 'q54', type: 'quiz', prompt: 'What protein forms the base of the ragù?', answer: 'Slow-braised pork shoulder' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ent-9',
    categoryId: 'entrees',
    name: 'Lamb Bolognese',
    shortDescription: 'House-made pappardelle, ground lamb ragù, Parmesan',
    longDescription: 'Rich, slow-simmered lamb bolognese made with ground lamb and house-made ragù alla bolognese. Served over wide, silky house-made pappardelle, finished with freshly grated Parmesan.',
    ingredientsText: 'Ground lamb, house-made pappardelle, ragù (tomato, wine, aromatics, herbs), Parmesan, olive oil',
    prepNotes: 'Ragù is slow-cooked for depth and richness. Ground lamb gives warm, aromatic, slightly sweet profile. Pappardelle is house-made, soft and silky.',
    sellingPointsText: 'House-made pappardelle • Slow-cooked lamb ragù • Freshly grated Parmesan',
    imageUrl: '/placeholder.svg',
    allergens: ['gluten', 'dairy', 'allium', 'egg'],
    questions: [
      { id: 'q55', type: 'selling', prompt: 'What makes this pasta special?', answer: 'Slow-cooked lamb ragù with house-made pappardelle — warm, aromatic, and comforting.' },
      { id: 'q56', type: 'allergy', prompt: 'Does the pasta contain egg?', answer: 'Yes, house-made fresh pasta contains egg.' },
      { id: 'q57', type: 'quiz', prompt: 'What shape is the pasta?', answer: 'Wide, silky pappardelle' },
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
      { id: 'q58', type: 'selling', prompt: 'What makes our crème brûlée special?', answer: 'Madagascar vanilla bean, farm-fresh cream, torched to order' },
      { id: 'q59', type: 'allergy', prompt: 'Is this gluten-free?', answer: 'Yes, naturally gluten-free' },
      { id: 'q60', type: 'quiz', prompt: 'What type of vanilla do we use?', answer: 'Madagascar vanilla bean' },
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
      { id: 'q61', type: 'selling', prompt: 'What is Tarte Tatin?', answer: 'An upside-down apple tart, a French accident that became a classic' },
      { id: 'q62', type: 'allergy', prompt: 'Does this contain gluten?', answer: 'Yes, the puff pastry contains wheat flour' },
      { id: 'q63', type: 'quiz', prompt: 'What is Calvados?', answer: 'Apple brandy from the Normandy region of France' },
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
      { id: 'q64', type: 'selling', prompt: 'What chocolate do we use?', answer: '70% Valrhona dark chocolate from France' },
      { id: 'q65', type: 'allergy', prompt: 'Does this contain nuts?', answer: 'No nuts in the recipe, but prepared in a kitchen that handles nuts' },
      { id: 'q66', type: 'quiz', prompt: 'What percentage is the chocolate?', answer: '70% cacao' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // SIDES
  {
    id: 'side-1',
    categoryId: 'sides',
    name: 'Pommes Frites',
    shortDescription: 'Hand-cut French fries with optional truffle upgrade',
    longDescription: 'Hand-cut Kennebec potato fries, double-fried for crispy exterior and fluffy interior. Finished with fleur de sel. Optional truffle oil upgrade available.',
    ingredientsText: 'Kennebec potatoes, vegetable oil, fleur de sel, optional truffle oil',
    prepNotes: 'Double-fried: blanch at 325°F, finish at 375°F. Season immediately with fleur de sel.',
    sellingPointsText: 'Hand-cut Kennebec • Double-fried technique • Fleur de sel finish • Truffle upgrade +$10',
    imageUrl: '/placeholder.svg',
    allergens: [],
    questions: [
      { id: 'q67', type: 'selling', prompt: 'What makes these fries special?', answer: 'Hand-cut Kennebec potatoes, double-fried for crispy exterior and fluffy interior.' },
      { id: 'q68', type: 'allergy', prompt: 'Are the fries gluten-free?', answer: 'Yes, the fries are naturally gluten-free.' },
      { id: 'q69', type: 'quiz', prompt: 'What is the truffle upgrade?', answer: 'Truffle oil finish for an additional $10' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'side-2',
    categoryId: 'sides',
    name: 'Fingerling Potatoes',
    shortDescription: 'Roasted fingerling potatoes with herbs',
    longDescription: 'Small fingerling potatoes roasted until golden with crispy edges and fluffy centers. Finished with fresh herbs, olive oil, and sea salt.',
    ingredientsText: 'Fingerling potatoes, olive oil, fresh herbs (thyme, rosemary), garlic, sea salt, black pepper',
    prepNotes: 'Roasted at high heat until golden and crispy. Tossed with fresh herbs just before serving.',
    sellingPointsText: 'Crispy edges • Fluffy centers • Fresh herb finish • Naturally gluten-free',
    imageUrl: '/placeholder.svg',
    allergens: ['allium'],
    questions: [
      { id: 'q70', type: 'selling', prompt: 'How are the potatoes prepared?', answer: 'Roasted until golden with crispy edges and fluffy centers, finished with fresh herbs.' },
      { id: 'q71', type: 'allergy', prompt: 'Are these potatoes gluten-free?', answer: 'Yes, naturally gluten-free.' },
      { id: 'q72', type: 'quiz', prompt: 'What herbs are used?', answer: 'Fresh thyme and rosemary' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'side-3',
    categoryId: 'sides',
    name: 'Creamy Spinach',
    shortDescription: 'Silky, savory creamed spinach',
    longDescription: 'Fresh spinach wilted and finished in a silky cream sauce with a touch of nutmeg. Rich, savory, and the perfect accompaniment to any protein.',
    ingredientsText: 'Fresh spinach, heavy cream, butter, shallots, garlic, nutmeg, salt, white pepper',
    prepNotes: 'Spinach wilted quickly to retain color. Cream sauce should coat but not drown the spinach.',
    sellingPointsText: 'Fresh spinach • Silky cream sauce • Hint of nutmeg • Classic French preparation',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium'],
    questions: [
      { id: 'q73', type: 'selling', prompt: 'What makes our creamed spinach special?', answer: 'Fresh spinach in a silky cream sauce with a hint of nutmeg — classic French preparation.' },
      { id: 'q74', type: 'allergy', prompt: 'Does this contain dairy?', answer: 'Yes, cream and butter.' },
      { id: 'q75', type: 'quiz', prompt: 'What spice gives the subtle warmth?', answer: 'Nutmeg' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'side-4',
    categoryId: 'sides',
    name: 'Haricots Verts',
    shortDescription: 'French green beans with shallot butter',
    longDescription: 'Tender French green beans blanched until bright and crisp-tender, then tossed with shallot butter and finished with fleur de sel.',
    ingredientsText: 'French green beans (haricots verts), butter, shallots, fleur de sel, black pepper',
    prepNotes: 'Blanched until bright green and crisp-tender. Tossed in shallot butter just before service.',
    sellingPointsText: 'Crisp-tender • Shallot butter • French preparation • Fleur de sel finish',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium'],
    questions: [
      { id: 'q76', type: 'selling', prompt: 'What are haricots verts?', answer: 'Thin, tender French green beans — more delicate than regular green beans.' },
      { id: 'q77', type: 'allergy', prompt: 'Does this contain dairy?', answer: 'Yes, butter is used in the preparation.' },
      { id: 'q78', type: 'quiz', prompt: 'What adds the subtle allium flavor?', answer: 'Shallot butter' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'side-5',
    categoryId: 'sides',
    name: 'Roasted Mushrooms',
    shortDescription: 'Assorted mushrooms with herbs and garlic',
    longDescription: 'A medley of roasted mushrooms including cremini, shiitake, and oyster varieties. Finished with fresh herbs, garlic, and a touch of sherry.',
    ingredientsText: 'Cremini mushrooms, shiitake mushrooms, oyster mushrooms, olive oil, butter, garlic, fresh thyme, sherry, sea salt',
    prepNotes: 'High-heat roasting for caramelization. Deglazed with sherry. Fresh herbs added at the end.',
    sellingPointsText: 'Mushroom medley • Sherry finish • Fresh herbs • Earthy and savory',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium'],
    questions: [
      { id: 'q79', type: 'selling', prompt: 'What varieties of mushrooms are included?', answer: 'Cremini, shiitake, and oyster mushrooms.' },
      { id: 'q80', type: 'allergy', prompt: 'Does this contain dairy?', answer: 'Yes, butter is used in the roasting.' },
      { id: 'q81', type: 'quiz', prompt: 'What adds the aromatic finish?', answer: 'Sherry and fresh thyme' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'side-6',
    categoryId: 'sides',
    name: 'Seasonal Vegetables',
    shortDescription: 'Chef\'s selection of market vegetables',
    longDescription: 'A rotating selection of the finest seasonal vegetables, prepared simply to showcase their natural flavors. Ask your server for today\'s selection.',
    ingredientsText: 'Seasonal vegetables (varies), olive oil, butter, fresh herbs, sea salt',
    prepNotes: 'Preparation varies by vegetable selection. Ask kitchen for current preparation method.',
    sellingPointsText: 'Peak-season produce • Simple preparation • Changes daily • Chef\'s selection',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy'],
    questions: [
      { id: 'q82', type: 'selling', prompt: 'What vegetables are available today?', answer: 'Ask your server — it changes based on the best seasonal produce available.' },
      { id: 'q83', type: 'allergy', prompt: 'Can this be made dairy-free?', answer: 'Yes, prepared with olive oil instead of butter.' },
      { id: 'q84', type: 'quiz', prompt: 'How are the vegetables prepared?', answer: 'Simply, to showcase their natural flavors — method varies by vegetable' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },

  // SPECIALS
  {
    id: 'spec-1',
    categoryId: 'specials',
    name: 'Plateau de Fruits de Mer',
    shortDescription: 'Oysters, whole lobster, crab legs, prawns, tuna tartare, ceviche, crudo',
    longDescription: 'An impressive seafood tower featuring ice-chilled oysters (East & West coast), whole lobster, crab legs, large prawns, tuna tartare, ceviche, and crudo. Served with green apple mignonette, citrus granita, and classic accompaniments.',
    ingredientsText: 'Oysters, whole lobster, crab legs, prawns, tuna tartare, snapper ceviche, hamachi crudo, green apple mignonette, citrus granita, cocktail sauce, lemon',
    prepNotes: 'Seafood must be pristine and ice-cold. Arrange on tiered tower. Check all shellfish before service.',
    sellingPointsText: 'Impressive presentation • Multiple seafood varieties • Perfect for sharing • Fresh from Atlantic, Mediterranean & Florida waters',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'fish'],
    questions: [
      { id: 'q85', type: 'selling', prompt: 'What is included in the seafood plateau?', answer: 'Oysters, whole lobster, crab legs, large prawns, tuna tartare, ceviche, and crudo.' },
      { id: 'q86', type: 'allergy', prompt: 'Is there any cooked seafood on the plateau?', answer: 'The lobster and prawns can be cooked; oysters, tartare, ceviche, and crudo are raw.' },
      { id: 'q87', type: 'quiz', prompt: 'Where does our seafood come from?', answer: 'Atlantic, Mediterranean, and coastal Florida waters' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'spec-2',
    categoryId: 'specials',
    name: 'Whole Dover Sole',
    shortDescription: 'Whole fish, sauce vierge, baby potatoes',
    longDescription: 'Whole Dover sole, prized for its fine, tender, melt-in-your-mouth texture. Served with Sauce Vierge — a bright Provençal relish of vine-ripened tomatoes, shallots, garlic, fresh herbs, citrus, and smoked olive oil. Accompanied by baby potatoes.',
    ingredientsText: 'Whole Dover sole, sauce vierge (vine-ripened tomatoes, shallots, garlic, basil, coriander, smoked olive oil, citrus, peppadews), baby potatoes',
    prepNotes: 'Dover sole is delicate — gentle cooking. Sauce Vierge is warm, not cooked, keeping tomatoes fresh. Sweet drop peppers add sweetness.',
    sellingPointsText: 'Prized Dover sole • Provençal sauce vierge • Melt-in-your-mouth texture • Elegant tableside presentation',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'allium', 'nightshade'],
    questions: [
      { id: 'q88', type: 'selling', prompt: 'What makes Dover sole special?', answer: 'Prized for its fine, tender, melt-in-your-mouth texture — one of the most elegant fish.' },
      { id: 'q89', type: 'allergy', prompt: 'What is in the sauce?', answer: 'Sauce Vierge: tomatoes, shallots, garlic, fresh herbs, citrus, and smoked olive oil.' },
      { id: 'q90', type: 'quiz', prompt: 'What is sauce vierge?', answer: 'A warm (not cooked) Provençal relish that keeps the tomatoes fresh and vibrant' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'spec-3',
    categoryId: 'specials',
    name: 'Wagyu Tomahawk for Two',
    shortDescription: '38oz Wagyu tomahawk with choice of sauce',
    longDescription: 'An impressive 38-ounce Carrara Farms Wagyu tomahawk steak, perfect for two. Grilled in our Josper charcoal oven for deep smokiness and perfect caramelization. Choice of sauce: Bordelaise, Au Poivre, Béarnaise, or Sauce Périgordine (+$10).',
    ingredientsText: 'Carrara Farms Wagyu tomahawk (38oz), house steak seasoning, choice of sauce',
    prepNotes: 'Rest 30 min before cooking. Josper oven for perfect char. Rest after cooking. Slice tableside.',
    sellingPointsText: 'Carrara Farms Wagyu • 38oz for two • Josper charcoal grilled • Tableside presentation',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'allium', 'egg'],
    questions: [
      { id: 'q91', type: 'selling', prompt: 'What makes this steak special?', answer: 'Carrara Farms Wagyu, 38 ounces, grilled in our Josper charcoal oven with tableside presentation.' },
      { id: 'q92', type: 'allergy', prompt: 'What allergens are in the sauces?', answer: 'All sauces contain dairy and allium. Béarnaise also contains egg.' },
      { id: 'q93', type: 'quiz', prompt: 'What is Sauce Périgordine?', answer: 'A classic French sauce with black truffles and Madeira — the premium upgrade (+$10)' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'spec-4',
    categoryId: 'specials',
    name: 'Roasted Branzino',
    shortDescription: 'Whole fish, olive & tomato relish, artichoke purée, bomba rice',
    longDescription: 'Whole branzino roasted until the skin is crisp and flesh is moist and flaky. Served with Mediterranean-style tomato relish (slow-sweated onions, shallots, cherry tomatoes, olives, capers), smooth artichoke purée, and bomba rice.',
    ingredientsText: 'Whole branzino, olive & tomato relish (onions, shallots, garlic, cherry tomatoes, olives, capers, herbs, red wine vinegar), artichoke purée, bomba rice, fennel pollen',
    prepNotes: 'Branzino is light, mild, flaky with crispy skin. Relish is savory, slightly tangy. Artichoke purée is silky and earthy.',
    sellingPointsText: 'Whole fish presentation • Crispy skin • Mediterranean relish • Served over bomba rice',
    imageUrl: '/placeholder.svg',
    allergens: ['fish', 'allium', 'nightshade'],
    questions: [
      { id: 'q94', type: 'selling', prompt: 'How is the branzino prepared?', answer: 'Whole-roasted until the skin is crisp and the flesh is moist and flaky.' },
      { id: 'q95', type: 'allergy', prompt: 'What is in the relish?', answer: 'Mediterranean-style with tomatoes, olives, and capers — contains allium and nightshade.' },
      { id: 'q96', type: 'quiz', prompt: 'What provides the creamy element?', answer: 'Smooth artichoke purée' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'spec-5',
    categoryId: 'specials',
    name: 'Ice Chilled Oysters',
    shortDescription: 'Selection of 6 East or West Coast oysters',
    longDescription: 'Half dozen pristine oysters, either East Coast or West Coast selection. Served ice-chilled with champagne apple mignonette, preserved lemon, and pink peppercorn foam.',
    ingredientsText: 'Oysters (East or West coast), green apple mignonette (green apple, shallot, Champagne vinegar, apple cider vinegar, honey, chervil), preserved lemon, pink peppercorn foam',
    prepNotes: 'Oysters must be pristine and ice-cold. Green apple mignonette is bright and crisp. Pink peppercorn foam is floral, not spicy.',
    sellingPointsText: 'Daily fresh selection • Green apple mignonette • Pink peppercorn foam • East or West coast choice',
    imageUrl: '/placeholder.svg',
    allergens: ['shellfish', 'allium', 'soy'],
    questions: [
      { id: 'q97', type: 'selling', prompt: 'What comes with the oysters?', answer: 'Green apple mignonette, preserved lemon, and pink peppercorn foam.' },
      { id: 'q98', type: 'allergy', prompt: 'Is the foam spicy?', answer: 'No, pink peppercorns are floral and fragrant, not spicy.' },
      { id: 'q99', type: 'quiz', prompt: 'What is in the green apple mignonette?', answer: 'Diced green apple, shallot, Champagne vinegar, apple cider vinegar, honey, and chervil' },
    ],
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: 'spec-6',
    categoryId: 'specials',
    name: 'Charcuterie Board',
    shortDescription: 'Cured meats, cheese selection, olives, fig compote, bistro bread',
    longDescription: 'A curated selection of house-selected cured meats and artisan cheeses. Accompanied by olives, fig compote, and fresh bistro bread.',
    ingredientsText: 'Selection of cured meats (prosciutto, salami, coppa), artisan cheeses, Niçoise olives, fig compote, bistro bread',
    prepNotes: 'Allow meats and cheeses to come to room temperature before service. Fig compote should be at room temp.',
    sellingPointsText: 'Curated selection • Artisan cheeses • House-made fig compote • Perfect for sharing',
    imageUrl: '/placeholder.svg',
    allergens: ['dairy', 'gluten'],
    questions: [
      { id: 'q100', type: 'selling', prompt: 'What is included on the board?', answer: 'Curated cured meats, artisan cheeses, olives, fig compote, and fresh bistro bread.' },
      { id: 'q101', type: 'allergy', prompt: 'Can this be made gluten-free?', answer: 'We can serve without the bread, but it changes the presentation.' },
      { id: 'q102', type: 'quiz', prompt: 'How should the board be served?', answer: 'Meats and cheeses at room temperature for best flavor' },
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
