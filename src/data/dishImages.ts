// Lazy image resolution — URLs are only resolved when getDishImage() is called
// This prevents Vite from creating module requests for all 170+ images on page load

// Path mapping: item ID → asset path (no URL resolution yet)
const dishImagePaths: Record<string, string> = {
  // Crudo et Tartare
  'crudo-1': 'dishes/burrata-salad.jpg',
  'crudo-2': 'dishes/tuna-tartare.jpg',
  'crudo-3': 'dishes/steak-tartare.jpg',
  'crudo-4': 'dishes/ceviche.jpg',
  'crudo-5': 'dishes/hamachi-crudo.jpg',

  // Appetizers (Petites Assiettes)
  'app-1': 'dishes/french-onion-soup.jpg',
  'app-2': 'dishes/escargots.jpg',
  'app-3': 'dishes/foie-gras-terrine.jpg',
  'app-4': 'dishes/caesar-salad.jpg',
  'app-5': 'dishes/frisee-lardons.jpg',

  // Fruits de Mer (Seafood)
  'fdm-1': 'dishes/plateau-fruits-mer.jpg',
  'fdm-2': 'dishes/oysters.jpg',
  'fdm-3': 'dishes/moule-frites.jpg',
  'fdm-4': 'dishes/seared-scallops.jpg',
  'fdm-5': 'dishes/dover-sole.jpg',
  'fdm-6': 'dishes/roasted-branzino.jpg',
  'fdm-7': 'dishes/bouillabaisse.jpg',
  'fdm-8': 'dishes/chilean-sea-bass.jpg',

  // Pasta & Risotto
  'pasta-1': 'dishes/lobster-spaghetti.jpg',
  'pasta-2': 'dishes/wild-mushroom-ravioli.jpg',
  'pasta-3': 'dishes/lamb-bolognese.jpg',
  'pasta-4': 'dishes/linguine-vongole.jpg',
  'pasta-5': 'dishes/risotto.jpg',

  // Entrees (From the Charcoal Grill)
  'ent-1': 'dishes/wagyu-tomahawk.jpg',
  'ent-2': 'dishes/wagyu-tomahawk.jpg',
  'ent-3': 'dishes/wagyu-tomahawk.jpg',
  'ent-4': 'dishes/wagyu-tomahawk.jpg',
  'ent-5': 'dishes/rack-of-lamb.jpg',
  'ent-6': 'dishes/roasted-chicken.jpg',
  'ent-7': 'dishes/duck-cassoulet.jpg',
  'ent-8': 'dishes/charred-octopus.jpg',

  // Desserts (new pastry menu)
  'des-1': 'dishes/mille-feuille.jpg',
  'des-2': 'dishes/chocolate-entremet.jpg',
  'des-3': 'dishes/creme-brulee-lavender.jpg',
  'des-4': 'dishes/the-pear-dessert.jpg',
  'des-5': 'dishes/pistachio-ice-cream.jpg',
  'des-6': 'dishes/fig-tart.jpg',
  'des-7': 'dishes/citrus-pistachio-tart.jpg',
  'des-8': 'dishes/ice-cream-sorbet.jpg',

  // Sides
  'side-1': 'dishes/pommes-frites.jpg',
  'side-2': 'dishes/fingerling-potatoes.jpg',
  'side-3': 'dishes/creamy-spinach.jpg',
  'side-4': 'dishes/haricots-verts.jpg',
  'side-5': 'dishes/roasted-mushrooms.jpg',
  'side-6': 'dishes/seasonal-vegetables.jpg',

  // Specials
  'spec-1': 'dishes/plateau-fruits-mer.jpg',
  'spec-2': 'dishes/dover-sole.jpg',
  'spec-3': 'dishes/wagyu-tomahawk.jpg',
  'spec-4': 'dishes/roasted-branzino.jpg',
  'spec-5': 'dishes/oysters.jpg',
  'spec-6': 'dishes/charcuterie-board.jpg',

  // Wines - Original
  'wine-1': 'drinks/wine-moet-imperial.jpg',
  'wine-2': 'drinks/wine-laurent-perrier.jpg',
  'wine-3': 'drinks/wine-sancerre.jpg',
  'wine-4': 'drinks/wine-chablis.png',
  'wine-5': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-6': 'drinks/wine-kathryn-hall.jpg',
  'wine-7': 'drinks/wine-sancerre-rose-abbaye.jpg',
  'wine-8': 'drinks/wine-dom-perignon.jpg',
  'wine-9': 'drinks/wine-ace-of-spades.jpg',
  'wine-10': 'drinks/wine-krug.jpg',
  'wine-11': 'drinks/wine-quintessa-rutherford.webp',
  'wine-12': 'drinks/wine-inniskillin-icewine.png',

  // Wines - Sparkling (By the Glass)
  'wine-13': 'drinks/wine-moet-imperial.jpg',
  'wine-14': 'drinks/wine-veuve-clicquot.jpg',
  'wine-15': 'drinks/wine-dom-perignon.jpg',
  'wine-16': 'drinks/wine-krug.jpg',
  'wine-17': 'drinks/wine-ace-of-spades.jpg',
  'wine-18': 'drinks/wine-la-gioiosa-prosecco.jpg',

  // Wines - Champagne (By the Bottle)
  'wine-19': 'drinks/wine-ruinart-blanc.jpg',
  'wine-20': 'drinks/wine-laurent-perrier.jpg',
  'wine-21': 'drinks/wine-laurent-perrier.jpg',
  'wine-22': 'drinks/wine-laurent-perrier-rose.jpg',
  'wine-23': 'drinks/wine-laurent-perrier.jpg',
  'wine-24': 'drinks/wine-laurent-perrier-rose.jpg',
  'wine-25': 'drinks/wine-laurent-perrier.jpg',
  'wine-26': 'drinks/wine-ruinart-blanc.jpg',

  // Wines - Other Sparkling
  'wine-27': 'drinks/wine-laurent-perrier.jpg',
  'wine-28': 'drinks/wine-laurent-perrier.jpg',
  'wine-29': 'drinks/wine-laurent-perrier.jpg',
  'wine-30': 'drinks/wine-ferghettina-rose.png',
  'wine-31': 'drinks/wine-laurent-perrier.jpg',

  // Wines - White (By the Glass)
  'wine-32': 'drinks/wine-sancerre.jpg',
  'wine-33': 'drinks/wine-chablis.png',
  'wine-34': 'drinks/wine-cloudy-bay.png',
  'wine-35': 'drinks/wine-chablis.png',
  'wine-36': 'drinks/wine-cakebread-chardonnay.jpg',
  'wine-37': 'drinks/wine-cloudy-bay.png',

  // Wines - White (By the Bottle)
  'wine-38': 'drinks/wine-sancerre.jpg',
  'wine-39': 'drinks/wine-chablis.png',
  'wine-40': 'drinks/wine-provence-rose.jpg',

  // Wines - Rosé
  'wine-41': 'drinks/wine-stoller-rose.jpg',
  'wine-42': 'drinks/wine-scalabrone-rose.jpg',
  'wine-43': 'drinks/wine-orange-pullus.jpg',
  'wine-44': 'drinks/wine-blackbird-rose.jpg',

  // Wines - Red (By the Glass)
  'wine-45': 'drinks/wine-chateau-margaux.png',
  'wine-46': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-47': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-48': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-49': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-50': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-51': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-52': 'drinks/wine-laboure-roi-pinot.jpg',
  'wine-53': 'drinks/wine-catena-alta-malbec.jpg',

  // Wines - Dessert
  'wine-54': 'drinks/wine-inniskillin-icewine.png',
  'wine-55': 'drinks/wine-inniskillin-icewine.png',
  'wine-56': 'drinks/wine-inniskillin-icewine.png',
  'wine-57': 'drinks/wine-inniskillin-icewine.png',
  'wine-58': 'drinks/wine-inniskillin-icewine.png',
  'wine-59': 'drinks/wine-inniskillin-icewine.png',

  // Spirits - Vodka
  'spirit-1': 'drinks/spirit-grey-goose.png',
  'spirit-2': 'drinks/spirit-titos.jpg',
  'spirit-3': 'drinks/spirit-chopin-potato.png',
  'spirit-4': 'drinks/spirit-truman-vodka.png',
  'spirit-5': 'drinks/spirit-zubrowka.png',
  'spirit-6': 'drinks/spirit-beluga-noble.jpg',
  'spirit-7': 'drinks/spirit-beluga-gold.png',

  // Spirits - Gin
  'spirit-8': 'drinks/spirit-no3-gin.png',
  'spirit-9': 'drinks/spirit-botanist.jpg',
  'spirit-10': 'drinks/spirit-empress1908.webp',
  'spirit-11': 'drinks/spirit-hendricks.png',
  'spirit-12': 'drinks/spirit-mare.jpg',
  'spirit-13': 'drinks/spirit-nordes.jpg',
  'spirit-14': 'drinks/spirit-monkey47.png',
  'spirit-15': 'drinks/spirit-tanqueray10.jpg',

  // Spirits - Rum
  'spirit-16': 'drinks/spirit-bacardi-superior.jpg',
  'spirit-17': 'drinks/spirit-brugal-anejo.jpg',
  'spirit-18': 'drinks/spirit-sailor-jerry.jpg',
  'spirit-19': 'drinks/spirit-kraken.jpg',
  'spirit-20': 'drinks/spirit-diplomatico.png',
  'spirit-21': 'drinks/spirit-zacapa23.jpg',
  'spirit-22': 'drinks/spirit-eldorado15.jpg',
  'spirit-23': 'drinks/spirit-zacapa-xo.jpg',
  'spirit-24': 'drinks/spirit-foursquare-convocation.jpg',
  'spirit-25': 'drinks/spirit-brugal-maestro.jpg',

  // Spirits - Tequila
  'spirit-26': 'drinks/spirit-dobel-diamante.png',
  'spirit-27': 'drinks/spirit-tromba-blanco.jpg',
  'spirit-28': 'drinks/spirit-tromba-reposado.jpg',
  'spirit-29': 'drinks/spirit-g4-blanco.png',
  'spirit-30': 'drinks/spirit-mijenta-blanco.png',
  'spirit-31': 'drinks/spirit-tromba-anejo.jpg',
  'spirit-32': 'drinks/spirit-centenario-anejo.png',
  'spirit-33': 'drinks/spirit-g4-blanco.png',
  'spirit-34': 'drinks/spirit-g4-reposado.png',
  'spirit-35': 'drinks/spirit-lalo.png',
  'spirit-36': 'drinks/spirit-g4-blanco.png',
  'spirit-37': 'drinks/spirit-g4-blanco.png',
  'spirit-38': 'drinks/spirit-clase-azul.png',
  'spirit-39': 'drinks/spirit-g4-blanco.png',
  'spirit-40': 'drinks/spirit-clase-azul.png',
  'spirit-41': 'drinks/spirit-g4-blanco.png',
  'spirit-42': 'drinks/spirit-clase-azul.png',
  'spirit-43': 'drinks/spirit-clase-azul.png',
  'spirit-44': 'drinks/spirit-clase-azul.png',
  'spirit-45': 'drinks/spirit-clase-azul.png',
  'spirit-46': 'drinks/spirit-clase-azul.png',

  // Spirits - Mezcal
  'spirit-47': 'drinks/spirit-del-maguey-vida.jpg',
  'spirit-48': 'drinks/spirit-del-maguey-vida.jpg',
  'spirit-49': 'drinks/spirit-del-maguey-vida.jpg',
  'spirit-50': 'drinks/spirit-del-maguey-vida.jpg',
  'spirit-51': 'drinks/spirit-del-maguey-vida.jpg',
  'spirit-52': 'drinks/spirit-del-maguey-vida.jpg',

  // Spirits - Scotch
  'spirit-53': 'drinks/spirit-johnnie-blue.png',
  'spirit-54': 'drinks/spirit-yamazaki12.jpg',
  'spirit-55': 'drinks/spirit-yamazaki12.jpg',
  'spirit-56': 'drinks/spirit-balvenie12.png',
  'spirit-57': 'drinks/spirit-lagavulin8.png',
  'spirit-58': 'drinks/spirit-macallan12.png',
  'spirit-59': 'drinks/spirit-oban14.jpg',
  'spirit-60': 'drinks/spirit-talisker10.png',
  'spirit-61': 'drinks/spirit-hibiki-harmony.png',
  'spirit-62': 'drinks/spirit-macallan12.png',
  'spirit-63': 'drinks/spirit-balvenie12.png',
  'spirit-64': 'drinks/spirit-yamazaki12.jpg',
  'spirit-65': 'drinks/spirit-caol-ila12.jpg',
  'spirit-66': 'drinks/spirit-balvenie12.png',
  'spirit-67': 'drinks/spirit-dalmore15.jpg',
  'spirit-68': 'drinks/spirit-balvenie12.png',
  'spirit-69': 'drinks/spirit-johnnie-blue.png',
  'spirit-70': 'drinks/spirit-arran18-new.png',
  'spirit-71': 'drinks/spirit-dalmore-cigar.jpg',
  'spirit-72': 'drinks/spirit-balvenie12.png',
  'spirit-73': 'drinks/spirit-macallan18.jpg',
  'spirit-74': 'drinks/spirit-macallan18.jpg',

  // Spirits - Bourbon
  'spirit-75': 'drinks/spirit-woodford.jpg',
  'spirit-76': 'drinks/spirit-woodford.jpg',
  'spirit-77': 'drinks/spirit-woodford.jpg',
  'spirit-78': 'drinks/spirit-woodford.jpg',
  'spirit-79': 'drinks/spirit-woodford.jpg',
  'spirit-80': 'drinks/spirit-woodford.jpg',
  'spirit-81': 'drinks/spirit-woodford.jpg',
  'spirit-82': 'drinks/spirit-four-roses.jpg',
  'spirit-83': 'drinks/spirit-old-forester1920.jpg',
  'spirit-84': 'drinks/spirit-woodford.jpg',
  'spirit-85': 'drinks/spirit-woodford.jpg',
  'spirit-86': 'drinks/spirit-woodford.jpg',
  'spirit-87': 'drinks/spirit-woodford.jpg',
  'spirit-88': 'drinks/spirit-woodford.jpg',
  'spirit-89': 'drinks/spirit-woodford.jpg',

  // Spirits - Rye & Other Whiskeys
  'spirit-90': 'drinks/spirit-crown-royal.png',
  'spirit-91': 'drinks/spirit-woodford.jpg',
  'spirit-92': 'drinks/spirit-woodford.jpg',
  'spirit-93': 'drinks/spirit-woodford.jpg',
  'spirit-94': 'drinks/spirit-woodford.jpg',
  'spirit-95': 'drinks/spirit-woodford.jpg',
  'spirit-96': 'drinks/spirit-woodford.jpg',

  // Spirits - Cordials
  'spirit-97': 'drinks/spirit-amaro-montenegro.png',
  'spirit-98': 'drinks/spirit-remy-vsop.png',
  'spirit-99': 'drinks/spirit-campari.jpg',
  'spirit-100': 'drinks/spirit-disaronno.jpg',
  'spirit-101': 'drinks/spirit-fernet-branca.jpg',
  'spirit-102': 'drinks/spirit-frangelico.png',
  'spirit-103': 'drinks/spirit-lillet-blanc.jpg',
  'spirit-104': 'drinks/spirit-lillet-blanc.jpg',
  'spirit-105': 'drinks/spirit-remy-vsop.png',
  'spirit-106': 'drinks/spirit-remy-vsop.png',
  'spirit-107': 'drinks/spirit-remy-vsop.png',
  'spirit-108': 'drinks/spirit-remy-vsop.png',
  'spirit-109': 'drinks/spirit-remy-vsop.png',
  'spirit-110': 'drinks/spirit-grand-marnier.webp',
  'spirit-111': 'drinks/spirit-remy-vsop.png',
  'spirit-112': 'drinks/spirit-remy-vsop.png',
  'spirit-113': 'drinks/spirit-remy-vsop.png',
  'spirit-114': 'drinks/spirit-remy-vsop.png',
  'spirit-115': 'drinks/spirit-louisxiii.jpg',

  // Cocktails
  'cocktail-1': 'drinks/cocktail-espresso-martini-new.jpg',
  'cocktail-2': 'drinks/cocktail-moscow-mule.jpg',
  'cocktail-3': 'drinks/cocktail-old-fashioned-new.jpg',
  'cocktail-4': 'drinks/cocktail-manhattan.jpg',
  'cocktail-5': 'drinks/cocktail-negroni.jpg',
  'cocktail-6': 'drinks/cocktail-margarita.jpg',
  'cocktail-7': 'drinks/cocktail-aperol-spritz.jpg',
  'cocktail-8': 'drinks/cocktail-whiskey-sour.jpg',
  'cocktail-9': 'drinks/cocktail-cosmopolitan.jpg',
  'cocktail-10': 'drinks/cocktail-mojito.jpg',
  'cocktail-11': 'drinks/cocktail-vodka-martini.jpg',
  'cocktail-12': 'drinks/cocktail-boulevardier.jpg',
  'cocktail-13': 'drinks/cocktail-irish-coffee.jpg',
  'cocktail-14': 'drinks/cocktail-daiquiri.jpg',
  'cocktail-15': 'drinks/cocktail-pisco-sour.jpg',
};

// Cache resolved URLs so each image is only resolved once
const resolvedCache = new Map<string, string>();

function resolveImageUrl(path: string): string {
  let url = resolvedCache.get(path);
  if (!url) {
    url = new URL(`../assets/${path}`, import.meta.url).href;
    resolvedCache.set(path, url);
  }
  return url;
}

// Legacy compat: some code accesses dishImages directly
export const dishImages = new Proxy(dishImagePaths, {
  get(target, prop: string) {
    if (prop in target) {
      return resolveImageUrl(target[prop]);
    }
    return undefined;
  },
});

/**
 * Get image for a dish. Prioritizes database URL if provided and valid.
 */
export const getDishImage = (itemId: string, dbImageUrl?: string): string | undefined => {
  if (dbImageUrl && dbImageUrl !== '/placeholder.svg' && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  const path = dishImagePaths[itemId];
  return path ? resolveImageUrl(path) : undefined;
};

// Items that have unique, verified images (not fallbacks from other products)
const uniqueWineImages = new Set([
  'wine-1', 'wine-2', 'wine-3', 'wine-4', 'wine-5', 'wine-6', 'wine-7', 
  'wine-8', 'wine-9', 'wine-10', 'wine-11', 'wine-12',
  'wine-13', 'wine-14', 'wine-15', 'wine-16', 'wine-17', 'wine-18',
  'wine-19', 'wine-22', 'wine-24', 'wine-30',
  'wine-34', 'wine-36', 'wine-37', 'wine-40', 'wine-41', 'wine-42', 'wine-43', 'wine-44', 'wine-53',
]);

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

const uniqueFoodImages = new Set([
  'app-1', 'app-2', 'app-3', 'app-4', 'app-5', 'app-6', 'app-7', 'app-8', 'app-9', 'app-10',
  'ent-1', 'ent-2', 'ent-3', 'ent-4', 'ent-5', 'ent-6', 'ent-7', 'ent-8', 'ent-9',
  'des-1', 'des-2', 'des-3',
  'side-1', 'side-2', 'side-3', 'side-4', 'side-5', 'side-6',
  'spec-1', 'spec-2', 'spec-3', 'spec-4', 'spec-5', 'spec-6',
]);

const uniqueCocktailImages = new Set([
  'cocktail-1', 'cocktail-2', 'cocktail-3', 'cocktail-4', 'cocktail-5',
  'cocktail-6', 'cocktail-7', 'cocktail-8', 'cocktail-9', 'cocktail-10',
  'cocktail-11', 'cocktail-12', 'cocktail-13', 'cocktail-14', 'cocktail-15',
]);

export const hasUniqueImage = (itemId: string): boolean => {
  return uniqueWineImages.has(itemId) || 
         uniqueSpiritImages.has(itemId) || 
         uniqueFoodImages.has(itemId) ||
         uniqueCocktailImages.has(itemId);
};

export const getUniqueImage = (itemId: string, dbImageUrl?: string): string | undefined => {
  if (dbImageUrl && dbImageUrl !== '/placeholder.svg' && dbImageUrl.startsWith('http')) {
    return dbImageUrl;
  }
  if (hasUniqueImage(itemId)) {
    const path = dishImagePaths[itemId];
    return path ? resolveImageUrl(path) : undefined;
  }
  return undefined;
};
