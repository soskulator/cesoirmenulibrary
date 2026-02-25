// Lazy image resolution — uses Vite's URL pattern so images are only fetched when rendered
const img = (path: string) => new URL(`../assets/${path}`, import.meta.url).href;

// Map menu item IDs to their images
export const dishImages: Record<string, string> = {
  // Crudo et Tartare
  'crudo-1': img('dishes/burrata-salad.jpg'),
  'crudo-2': img('dishes/tuna-tartare.jpg'),
  'crudo-3': img('dishes/steak-tartare.jpg'),
  'crudo-4': img('dishes/ceviche.jpg'),
  'crudo-5': img('dishes/hamachi-crudo.jpg'),

  // Appetizers (Petites Assiettes)
  'app-1': img('dishes/french-onion-soup.jpg'),
  'app-2': img('dishes/escargots.jpg'),
  'app-3': img('dishes/foie-gras-terrine.jpg'),
  'app-4': img('dishes/caesar-salad.jpg'),
  'app-5': img('dishes/frisee-lardons.jpg'),

  // Fruits de Mer (Seafood)
  'fdm-1': img('dishes/plateau-fruits-mer.jpg'),
  'fdm-2': img('dishes/oysters.jpg'),
  'fdm-3': img('dishes/moule-frites.jpg'),
  'fdm-4': img('dishes/seared-scallops.jpg'),
  'fdm-5': img('dishes/dover-sole.jpg'),
  'fdm-6': img('dishes/roasted-branzino.jpg'),
  'fdm-7': img('dishes/bouillabaisse.jpg'),
  'fdm-8': img('dishes/chilean-sea-bass.jpg'),

  // Pasta & Risotto
  'pasta-1': img('dishes/lobster-spaghetti.jpg'),
  'pasta-2': img('dishes/wild-mushroom-ravioli.jpg'),
  'pasta-3': img('dishes/lamb-bolognese.jpg'),
  'pasta-4': img('dishes/linguine-vongole.jpg'),
  'pasta-5': img('dishes/risotto.jpg'),

  // Entrees (From the Charcoal Grill)
  'ent-1': img('dishes/wagyu-tomahawk.jpg'),
  'ent-2': img('dishes/wagyu-tomahawk.jpg'),
  'ent-3': img('dishes/wagyu-tomahawk.jpg'),
  'ent-4': img('dishes/wagyu-tomahawk.jpg'),
  'ent-5': img('dishes/rack-of-lamb.jpg'),
  'ent-6': img('dishes/roasted-chicken.jpg'),
  'ent-7': img('dishes/duck-cassoulet.jpg'),
  'ent-8': img('dishes/charred-octopus.jpg'),

  // Desserts (new pastry menu)
  'des-1': img('dishes/mille-feuille.jpg'),
  'des-2': img('dishes/chocolate-entremet.jpg'),
  'des-3': img('dishes/creme-brulee-lavender.jpg'),
  'des-4': img('dishes/the-pear-dessert.jpg'),
  'des-5': img('dishes/pistachio-ice-cream.jpg'),
  'des-6': img('dishes/fig-tart.jpg'),
  'des-7': img('dishes/citrus-pistachio-tart.jpg'),
  'des-8': img('dishes/ice-cream-sorbet.jpg'),

  // Sides
  'side-1': img('dishes/pommes-frites.jpg'),
  'side-2': img('dishes/fingerling-potatoes.jpg'),
  'side-3': img('dishes/creamy-spinach.jpg'),
  'side-4': img('dishes/haricots-verts.jpg'),
  'side-5': img('dishes/roasted-mushrooms.jpg'),
  'side-6': img('dishes/seasonal-vegetables.jpg'),

  // Specials
  'spec-1': img('dishes/plateau-fruits-mer.jpg'),
  'spec-2': img('dishes/dover-sole.jpg'),
  'spec-3': img('dishes/wagyu-tomahawk.jpg'),
  'spec-4': img('dishes/roasted-branzino.jpg'),
  'spec-5': img('dishes/oysters.jpg'),
  'spec-6': img('dishes/charcuterie-board.jpg'),

  // Wines - Original
  'wine-1': img('drinks/wine-moet-imperial.jpg'),
  'wine-2': img('drinks/wine-laurent-perrier.jpg'),
  'wine-3': img('drinks/wine-sancerre.jpg'),
  'wine-4': img('drinks/wine-chablis.png'),
  'wine-5': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-6': img('drinks/wine-kathryn-hall.jpg'),
  'wine-7': img('drinks/wine-sancerre-rose-abbaye.jpg'),
  'wine-8': img('drinks/wine-dom-perignon.jpg'),
  'wine-9': img('drinks/wine-ace-of-spades.jpg'),
  'wine-10': img('drinks/wine-krug.jpg'),
  'wine-11': img('drinks/wine-quintessa-rutherford.webp'),
  'wine-12': img('drinks/wine-inniskillin-icewine.png'),

  // Wines - Sparkling (By the Glass)
  'wine-13': img('drinks/wine-moet-imperial.jpg'),
  'wine-14': img('drinks/wine-veuve-clicquot.jpg'),
  'wine-15': img('drinks/wine-dom-perignon.jpg'),
  'wine-16': img('drinks/wine-krug.jpg'),
  'wine-17': img('drinks/wine-ace-of-spades.jpg'),
  'wine-18': img('drinks/wine-la-gioiosa-prosecco.jpg'),

  // Wines - Champagne (By the Bottle)
  'wine-19': img('drinks/wine-ruinart-blanc.jpg'),
  'wine-20': img('drinks/wine-laurent-perrier.jpg'),
  'wine-21': img('drinks/wine-laurent-perrier.jpg'),
  'wine-22': img('drinks/wine-laurent-perrier-rose.jpg'),
  'wine-23': img('drinks/wine-laurent-perrier.jpg'),
  'wine-24': img('drinks/wine-laurent-perrier-rose.jpg'),
  'wine-25': img('drinks/wine-laurent-perrier.jpg'),
  'wine-26': img('drinks/wine-ruinart-blanc.jpg'),

  // Wines - Other Sparkling
  'wine-27': img('drinks/wine-laurent-perrier.jpg'),
  'wine-28': img('drinks/wine-laurent-perrier.jpg'),
  'wine-29': img('drinks/wine-laurent-perrier.jpg'),
  'wine-30': img('drinks/wine-ferghettina-rose.png'),
  'wine-31': img('drinks/wine-laurent-perrier.jpg'),

  // Wines - White (By the Glass)
  'wine-32': img('drinks/wine-sancerre.jpg'),
  'wine-33': img('drinks/wine-chablis.png'),
  'wine-34': img('drinks/wine-cloudy-bay.png'),
  'wine-35': img('drinks/wine-chablis.png'),
  'wine-36': img('drinks/wine-cakebread-chardonnay.jpg'),
  'wine-37': img('drinks/wine-cloudy-bay.png'),

  // Wines - White (By the Bottle)
  'wine-38': img('drinks/wine-sancerre.jpg'),
  'wine-39': img('drinks/wine-chablis.png'),
  'wine-40': img('drinks/wine-provence-rose.jpg'),

  // Wines - Rosé
  'wine-41': img('drinks/wine-stoller-rose.jpg'),
  'wine-42': img('drinks/wine-scalabrone-rose.jpg'),
  'wine-43': img('drinks/wine-orange-pullus.jpg'),
  'wine-44': img('drinks/wine-blackbird-rose.jpg'),

  // Wines - Red (By the Glass)
  'wine-45': img('drinks/wine-chateau-margaux.png'),
  'wine-46': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-47': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-48': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-49': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-50': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-51': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-52': img('drinks/wine-laboure-roi-pinot.jpg'),
  'wine-53': img('drinks/wine-catena-alta-malbec.jpg'),

  // Wines - Dessert
  'wine-54': img('drinks/wine-inniskillin-icewine.png'),
  'wine-55': img('drinks/wine-inniskillin-icewine.png'),
  'wine-56': img('drinks/wine-inniskillin-icewine.png'),
  'wine-57': img('drinks/wine-inniskillin-icewine.png'),
  'wine-58': img('drinks/wine-inniskillin-icewine.png'),
  'wine-59': img('drinks/wine-inniskillin-icewine.png'),

  // Spirits - Vodka
  'spirit-1': img('drinks/spirit-grey-goose.png'),
  'spirit-2': img('drinks/spirit-titos.jpg'),
  'spirit-3': img('drinks/spirit-chopin-potato.png'),
  'spirit-4': img('drinks/spirit-truman-vodka.png'),
  'spirit-5': img('drinks/spirit-zubrowka.png'),
  'spirit-6': img('drinks/spirit-beluga-noble.jpg'),
  'spirit-7': img('drinks/spirit-beluga-gold.png'),

  // Spirits - Gin
  'spirit-8': img('drinks/spirit-no3-gin.png'),
  'spirit-9': img('drinks/spirit-botanist.jpg'),
  'spirit-10': img('drinks/spirit-empress1908.webp'),
  'spirit-11': img('drinks/spirit-hendricks.png'),
  'spirit-12': img('drinks/spirit-mare.jpg'),
  'spirit-13': img('drinks/spirit-nordes.jpg'),
  'spirit-14': img('drinks/spirit-monkey47.png'),
  'spirit-15': img('drinks/spirit-tanqueray10.jpg'),

  // Spirits - Rum
  'spirit-16': img('drinks/spirit-bacardi-superior.jpg'),
  'spirit-17': img('drinks/spirit-brugal-anejo.jpg'),
  'spirit-18': img('drinks/spirit-sailor-jerry.jpg'),
  'spirit-19': img('drinks/spirit-kraken.jpg'),
  'spirit-20': img('drinks/spirit-diplomatico.png'),
  'spirit-21': img('drinks/spirit-zacapa23.jpg'),
  'spirit-22': img('drinks/spirit-eldorado15.jpg'),
  'spirit-23': img('drinks/spirit-zacapa-xo.jpg'),
  'spirit-24': img('drinks/spirit-foursquare-convocation.jpg'),
  'spirit-25': img('drinks/spirit-brugal-maestro.jpg'),

  // Spirits - Tequila
  'spirit-26': img('drinks/spirit-dobel-diamante.png'),
  'spirit-27': img('drinks/spirit-tromba-blanco.jpg'),
  'spirit-28': img('drinks/spirit-tromba-reposado.jpg'),
  'spirit-29': img('drinks/spirit-g4-blanco.png'),
  'spirit-30': img('drinks/spirit-mijenta-blanco.png'),
  'spirit-31': img('drinks/spirit-tromba-anejo.jpg'),
  'spirit-32': img('drinks/spirit-centenario-anejo.png'),
  'spirit-33': img('drinks/spirit-g4-blanco.png'),
  'spirit-34': img('drinks/spirit-g4-reposado.png'),
  'spirit-35': img('drinks/spirit-lalo.png'),
  'spirit-36': img('drinks/spirit-g4-blanco.png'),
  'spirit-37': img('drinks/spirit-g4-blanco.png'),
  'spirit-38': img('drinks/spirit-clase-azul.png'),
  'spirit-39': img('drinks/spirit-g4-blanco.png'),
  'spirit-40': img('drinks/spirit-clase-azul.png'),
  'spirit-41': img('drinks/spirit-g4-blanco.png'),
  'spirit-42': img('drinks/spirit-clase-azul.png'),
  'spirit-43': img('drinks/spirit-clase-azul.png'),
  'spirit-44': img('drinks/spirit-clase-azul.png'),
  'spirit-45': img('drinks/spirit-clase-azul.png'),
  'spirit-46': img('drinks/spirit-clase-azul.png'),

  // Spirits - Mezcal
  'spirit-47': img('drinks/spirit-del-maguey-vida.jpg'),
  'spirit-48': img('drinks/spirit-del-maguey-vida.jpg'),
  'spirit-49': img('drinks/spirit-del-maguey-vida.jpg'),
  'spirit-50': img('drinks/spirit-del-maguey-vida.jpg'),
  'spirit-51': img('drinks/spirit-del-maguey-vida.jpg'),
  'spirit-52': img('drinks/spirit-del-maguey-vida.jpg'),

  // Spirits - Scotch
  'spirit-53': img('drinks/spirit-johnnie-blue.png'),
  'spirit-54': img('drinks/spirit-yamazaki12.jpg'),
  'spirit-55': img('drinks/spirit-yamazaki12.jpg'),
  'spirit-56': img('drinks/spirit-balvenie12.png'),
  'spirit-57': img('drinks/spirit-lagavulin8.png'),
  'spirit-58': img('drinks/spirit-macallan12.png'),
  'spirit-59': img('drinks/spirit-oban14.jpg'),
  'spirit-60': img('drinks/spirit-talisker10.png'),
  'spirit-61': img('drinks/spirit-hibiki-harmony.png'),
  'spirit-62': img('drinks/spirit-macallan12.png'),
  'spirit-63': img('drinks/spirit-balvenie12.png'),
  'spirit-64': img('drinks/spirit-yamazaki12.jpg'),
  'spirit-65': img('drinks/spirit-caol-ila12.jpg'),
  'spirit-66': img('drinks/spirit-balvenie12.png'),
  'spirit-67': img('drinks/spirit-dalmore15.jpg'),
  'spirit-68': img('drinks/spirit-balvenie12.png'),
  'spirit-69': img('drinks/spirit-johnnie-blue.png'),
  'spirit-70': img('drinks/spirit-arran18-new.png'),
  'spirit-71': img('drinks/spirit-dalmore-cigar.jpg'),
  'spirit-72': img('drinks/spirit-balvenie12.png'),
  'spirit-73': img('drinks/spirit-macallan18.jpg'),
  'spirit-74': img('drinks/spirit-macallan18.jpg'),

  // Spirits - Bourbon
  'spirit-75': img('drinks/spirit-woodford.jpg'),
  'spirit-76': img('drinks/spirit-woodford.jpg'),
  'spirit-77': img('drinks/spirit-woodford.jpg'),
  'spirit-78': img('drinks/spirit-woodford.jpg'),
  'spirit-79': img('drinks/spirit-woodford.jpg'),
  'spirit-80': img('drinks/spirit-woodford.jpg'),
  'spirit-81': img('drinks/spirit-woodford.jpg'),
  'spirit-82': img('drinks/spirit-four-roses.jpg'),
  'spirit-83': img('drinks/spirit-old-forester1920.jpg'),
  'spirit-84': img('drinks/spirit-woodford.jpg'),
  'spirit-85': img('drinks/spirit-woodford.jpg'),
  'spirit-86': img('drinks/spirit-woodford.jpg'),
  'spirit-87': img('drinks/spirit-woodford.jpg'),
  'spirit-88': img('drinks/spirit-woodford.jpg'),
  'spirit-89': img('drinks/spirit-woodford.jpg'),

  // Spirits - Rye & Other Whiskeys
  'spirit-90': img('drinks/spirit-crown-royal.png'),
  'spirit-91': img('drinks/spirit-woodford.jpg'),
  'spirit-92': img('drinks/spirit-woodford.jpg'),
  'spirit-93': img('drinks/spirit-woodford.jpg'),
  'spirit-94': img('drinks/spirit-woodford.jpg'),
  'spirit-95': img('drinks/spirit-woodford.jpg'),
  'spirit-96': img('drinks/spirit-woodford.jpg'),

  // Spirits - Cordials
  'spirit-97': img('drinks/spirit-amaro-montenegro.png'),
  'spirit-98': img('drinks/spirit-remy-vsop.png'),
  'spirit-99': img('drinks/spirit-campari.jpg'),
  'spirit-100': img('drinks/spirit-disaronno.jpg'),
  'spirit-101': img('drinks/spirit-fernet-branca.jpg'),
  'spirit-102': img('drinks/spirit-frangelico.png'),
  'spirit-103': img('drinks/spirit-lillet-blanc.jpg'),
  'spirit-104': img('drinks/spirit-lillet-blanc.jpg'),
  'spirit-105': img('drinks/spirit-remy-vsop.png'),
  'spirit-106': img('drinks/spirit-remy-vsop.png'),
  'spirit-107': img('drinks/spirit-remy-vsop.png'),
  'spirit-108': img('drinks/spirit-remy-vsop.png'),
  'spirit-109': img('drinks/spirit-remy-vsop.png'),
  'spirit-110': img('drinks/spirit-grand-marnier.webp'),
  'spirit-111': img('drinks/spirit-remy-vsop.png'),
  'spirit-112': img('drinks/spirit-remy-vsop.png'),
  'spirit-113': img('drinks/spirit-remy-vsop.png'),
  'spirit-114': img('drinks/spirit-remy-vsop.png'),
  'spirit-115': img('drinks/spirit-louisxiii.jpg'),

  // Cocktails
  'cocktail-1': img('drinks/cocktail-espresso-martini-new.jpg'),
  'cocktail-2': img('drinks/cocktail-moscow-mule.jpg'),
  'cocktail-3': img('drinks/cocktail-old-fashioned-new.jpg'),
  'cocktail-4': img('drinks/cocktail-manhattan.jpg'),
  'cocktail-5': img('drinks/cocktail-negroni.jpg'),
  'cocktail-6': img('drinks/cocktail-margarita.jpg'),
  'cocktail-7': img('drinks/cocktail-aperol-spritz.jpg'),
  'cocktail-8': img('drinks/cocktail-whiskey-sour.jpg'),
  'cocktail-9': img('drinks/cocktail-cosmopolitan.jpg'),
  'cocktail-10': img('drinks/cocktail-mojito.jpg'),
  'cocktail-11': img('drinks/cocktail-vodka-martini.jpg'),
  'cocktail-12': img('drinks/cocktail-boulevardier.jpg'),
  'cocktail-13': img('drinks/cocktail-irish-coffee.jpg'),
  'cocktail-14': img('drinks/cocktail-daiquiri.jpg'),
  'cocktail-15': img('drinks/cocktail-pisco-sour.jpg'),
};

/**
 * Get image for a dish. Prioritizes database URL if provided and valid.
 * @param itemId - The item ID to look up in static images
 * @param dbImageUrl - Optional database image URL (takes priority if valid)
 */
export const getDishImage = (itemId: string, dbImageUrl?: string): string | undefined => {
  // If a valid database URL is provided, use it
  if (dbImageUrl && dbImageUrl !== '/placeholder.svg' && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  // Otherwise fall back to static images
  return dishImages[itemId];
};

// Items that have unique, verified images (not fallbacks from other products)
// Wine items with unique bottle images
const uniqueWineImages = new Set([
  'wine-1', 'wine-2', 'wine-3', 'wine-4', 'wine-5', 'wine-6', 'wine-7', 
  'wine-8', 'wine-9', 'wine-10', 'wine-11', 'wine-12',
  'wine-13', 'wine-14', 'wine-15', 'wine-16', 'wine-17', 'wine-18',
  'wine-19', 'wine-22', 'wine-24', 'wine-30',
  'wine-34', 'wine-36', 'wine-37', 'wine-40', 'wine-41', 'wine-42', 'wine-43', 'wine-44', 'wine-53',
]);

// Spirit items with unique bottle images  
const uniqueSpiritImages = new Set([
  'spirit-1', 'spirit-2', 'spirit-3', 'spirit-4', 'spirit-5', 'spirit-6', 'spirit-7',
  'spirit-8', 'spirit-9', 'spirit-10', 'spirit-11', 'spirit-12', 'spirit-13', 'spirit-14', 'spirit-15',
  'spirit-16', 'spirit-17', 'spirit-18', 'spirit-19', 'spirit-20', 'spirit-21', 'spirit-22', 'spirit-23', 'spirit-24', 'spirit-25',
  'spirit-26', 'spirit-27', 'spirit-28', 'spirit-29', 'spirit-30', 'spirit-31', 'spirit-32', 'spirit-34', 'spirit-35',
  'spirit-40', 'spirit-47', 
  'spirit-53', 'spirit-56', 'spirit-57', 'spirit-58', 'spirit-59', 'spirit-60', 'spirit-61', 
  'spirit-65', 'spirit-67', 'spirit-69', 'spirit-70', 'spirit-71', 'spirit-73',
  'spirit-81', 'spirit-82', 'spirit-83',
  'spirit-90',
  'spirit-97', 'spirit-99', 'spirit-100', 'spirit-101', 'spirit-102', 'spirit-103', 'spirit-110', 'spirit-115',
]);

// All food items have unique images
const uniqueFoodImages = new Set([
  'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8', 'app-9', 'app-10',
  'ent-1', 'ent-2', 'ent-3', 'ent-4', 'ent-5', 'ent-6', 'ent-7', 'ent-8', 'ent-9',
  'des-1', 'des-2', 'des-3',
  'side-1', 'side-2', 'side-3', 'side-4', 'side-5', 'side-6',
  'spec-1', 'spec-2', 'spec-3', 'spec-4', 'spec-5', 'spec-6',
]);

// Cocktails all have unique images
const uniqueCocktailImages = new Set([
  'cocktail-1', 'cocktail-2', 'cocktail-3', 'cocktail-4', 'cocktail-5',
  'cocktail-6', 'cocktail-7', 'cocktail-8', 'cocktail-9', 'cocktail-10',
  'cocktail-11', 'cocktail-12', 'cocktail-13', 'cocktail-14', 'cocktail-15',
]);

/**
 * Check if an item has a unique, verified image (not a fallback from another product)
 * Use this to avoid showing duplicate/inherited images in lists
 */
export const hasUniqueImage = (itemId: string): boolean => {
  return uniqueWineImages.has(itemId) || 
         uniqueSpiritImages.has(itemId) || 
         uniqueFoodImages.has(itemId) ||
         uniqueCocktailImages.has(itemId);
};

/**
 * Get image only if the item has a unique verified image
 * Prioritizes database URL if provided and valid.
 * @param itemId - The item ID to check
 * @param dbImageUrl - Optional database image URL (takes priority if valid)
 */
export const getUniqueImage = (itemId: string, dbImageUrl?: string): string | undefined => {
  // If a valid database URL is provided, use it (DB images are always unique)
  if (dbImageUrl && dbImageUrl !== '/placeholder.svg' && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  // Otherwise check if static image is unique
  if (hasUniqueImage(itemId)) {
    return dishImages[itemId];
  }
  return undefined;
};
