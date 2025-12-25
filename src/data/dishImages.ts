// Dish images for flashcards
import frenchOnionSoup from '@/assets/dishes/french-onion-soup.jpg';
import escargots from '@/assets/dishes/escargots.jpg';
import steakTartare from '@/assets/dishes/steak-tartare.jpg';
import searedScallops from '@/assets/dishes/seared-scallops.jpg';
import foieGrasTerrine from '@/assets/dishes/foie-gras-terrine.jpg';
import tunaTartare from '@/assets/dishes/tuna-tartare.jpg';
import mouleFrites from '@/assets/dishes/moule-frites.jpg';
import burrataSalad from '@/assets/dishes/burrata-salad.jpg';
import caesarSalad from '@/assets/dishes/caesar-salad.jpg';
import charredOctopus from '@/assets/dishes/charred-octopus.jpg';
import lobsterSpaghetti from '@/assets/dishes/lobster-spaghetti.jpg';
import wildMushroomRavioli from '@/assets/dishes/wild-mushroom-ravioli.jpg';
import bouillabaisse from '@/assets/dishes/bouillabaisse.jpg';
import chileanSeaBass from '@/assets/dishes/chilean-sea-bass.jpg';
import crispySkinSalmon from '@/assets/dishes/crispy-skin-salmon.jpg';
import rackOfLamb from '@/assets/dishes/rack-of-lamb.jpg';
import roastedChicken from '@/assets/dishes/roasted-chicken.jpg';
import duckCassoulet from '@/assets/dishes/duck-cassoulet.jpg';
import lambBolognese from '@/assets/dishes/lamb-bolognese.jpg';
import cremeBrulee from '@/assets/dishes/creme-brulee.jpg';
import tarteTatin from '@/assets/dishes/tarte-tatin.jpg';
import mousseChocolat from '@/assets/dishes/mousse-chocolat.jpg';
import pommesFrites from '@/assets/dishes/pommes-frites.jpg';
import fingerlingPotatoes from '@/assets/dishes/fingerling-potatoes.jpg';
import creamySpinach from '@/assets/dishes/creamy-spinach.jpg';
import haricotsVerts from '@/assets/dishes/haricots-verts.jpg';
import roastedMushrooms from '@/assets/dishes/roasted-mushrooms.jpg';
import seasonalVegetables from '@/assets/dishes/seasonal-vegetables.jpg';
import plateauFruitsMer from '@/assets/dishes/plateau-fruits-mer.jpg';
import doverSole from '@/assets/dishes/dover-sole.jpg';
import wagyuTomahawk from '@/assets/dishes/wagyu-tomahawk.jpg';
import roastedBranzino from '@/assets/dishes/roasted-branzino.jpg';
import oysters from '@/assets/dishes/oysters.jpg';
import charcuterieBoard from '@/assets/dishes/charcuterie-board.jpg';

// Drink images
import champagneMoet from '@/assets/drinks/champagne-moet.jpg';
import champagneDomPerignon from '@/assets/drinks/champagne-dom-perignon.jpg';
import champagneAceOfSpades from '@/assets/drinks/champagne-ace-of-spades.jpg';
import wineCabernet from '@/assets/drinks/wine-cabernet.jpg';
import vodkaGreyGoose from '@/assets/drinks/vodka-grey-goose.jpg';
import tequilaDonJulio from '@/assets/drinks/tequila-don-julio.jpg';
import cognacHennessy from '@/assets/drinks/cognac-hennessy.jpg';
import cocktailFrench75 from '@/assets/drinks/cocktail-french-75.jpg';
import cocktailMartini from '@/assets/drinks/cocktail-martini.jpg';
import cocktailLavenderSpritz from '@/assets/drinks/cocktail-lavender-spritz.jpg';
import cocktailOldFashioned from '@/assets/drinks/cocktail-old-fashioned.jpg';
import cocktailEspressoMartini from '@/assets/drinks/cocktail-espresso-martini.jpg';

// Map menu item IDs to their images
export const dishImages: Record<string, string> = {
  // Appetizers
  'app-1': frenchOnionSoup,
  'app-2': escargots,
  'app-3': steakTartare,
  'app-4': searedScallops,
  'app-5': foieGrasTerrine,
  'app-6': tunaTartare,
  'app-7': mouleFrites,
  'app-8': burrataSalad,
  'app-9': caesarSalad,
  'app-10': charredOctopus,
  
  // Entrees
  'ent-1': lobsterSpaghetti,
  'ent-2': wildMushroomRavioli,
  'ent-3': bouillabaisse,
  'ent-4': chileanSeaBass,
  'ent-5': crispySkinSalmon,
  'ent-6': rackOfLamb,
  'ent-7': roastedChicken,
  'ent-8': duckCassoulet,
  'ent-9': lambBolognese,
  
  // Desserts
  'des-1': cremeBrulee,
  'des-2': tarteTatin,
  'des-3': mousseChocolat,
  
  // Sides
  'side-1': pommesFrites,
  'side-2': fingerlingPotatoes,
  'side-3': creamySpinach,
  'side-4': haricotsVerts,
  'side-5': roastedMushrooms,
  'side-6': seasonalVegetables,
  
  // Specials
  'spec-1': plateauFruitsMer,
  'spec-2': doverSole,
  'spec-3': wagyuTomahawk,
  'spec-4': roastedBranzino,
  'spec-5': oysters,
  'spec-6': charcuterieBoard,

  // Wines
  'wine-1': champagneMoet,
  'wine-2': champagneDomPerignon,
  'wine-3': champagneAceOfSpades,
  'wine-4': wineCabernet,
  'wine-5': champagneMoet, // Laurent-Perrier (using Moet as placeholder)
  'wine-6': champagneDomPerignon, // Krug (using Dom as placeholder)
  'wine-7': wineCabernet, // Chateau Margaux
  'wine-8': wineCabernet, // Opus One
  'wine-9': wineCabernet, // Sassicaia
  'wine-10': wineCabernet, // Brunello
  'wine-11': wineCabernet, // Tignanello

  // Spirits
  'spirit-1': vodkaGreyGoose,
  'spirit-2': vodkaGreyGoose, // Belvedere
  'spirit-3': tequilaDonJulio,
  'spirit-4': tequilaDonJulio, // Clase Azul
  'spirit-5': cognacHennessy,
  'spirit-6': cognacHennessy, // Rémy Martin
  'spirit-7': cognacHennessy, // Louis XIII (using Hennessy)
  'spirit-8': cognacHennessy, // Macallan
  'spirit-9': cognacHennessy, // Johnnie Walker Blue
  'spirit-10': cognacHennessy, // Hibiki
  'spirit-11': cognacHennessy, // Yamazaki
  'spirit-12': cognacHennessy, // Woodford Reserve

  // Cocktails
  'cocktail-1': cocktailFrench75,
  'cocktail-2': cocktailMartini,
  'cocktail-3': cocktailLavenderSpritz,
  'cocktail-4': cocktailOldFashioned, // Smoke & Honey
  'cocktail-5': cocktailMartini, // Vesper
  'cocktail-6': cocktailEspressoMartini,
  'cocktail-7': cocktailOldFashioned, // Sazerac
  'cocktail-8': cocktailLavenderSpritz, // Aperol Spritz
  'cocktail-9': cocktailMartini, // Negroni
  'cocktail-10': cocktailLavenderSpritz, // Elderflower Collins
  'cocktail-11': cocktailOldFashioned, // Manhattan
  'cocktail-12': cocktailMartini, // Boulevardier
  'cocktail-13': cocktailLavenderSpritz, // Hemingway Daiquiri
  'cocktail-14': cocktailOldFashioned, // Vieux Carré
  'cocktail-15': cocktailMartini, // Aviation
};

export const getDishImage = (itemId: string): string | undefined => {
  return dishImages[itemId];
};
