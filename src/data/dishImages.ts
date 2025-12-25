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

// Drink images - Wines
import wineMoetImperial from '@/assets/drinks/wine-moet-imperial.jpg';
import wineLaurentPerrier from '@/assets/drinks/wine-laurent-perrier.jpg';
import wineSancerre from '@/assets/drinks/wine-sancerre.jpg';
import wineChablis from '@/assets/drinks/wine-chablis.png';
import wineLaboureRoi from '@/assets/drinks/wine-laboure-roi-pinot.jpg';
import wineDomPerignon from '@/assets/drinks/wine-dom-perignon.jpg';
import wineAceOfSpades from '@/assets/drinks/wine-ace-of-spades.jpg';
import wineKrug from '@/assets/drinks/wine-krug.jpg';
import wineQuintessa from '@/assets/drinks/wine-quintessa-rutherford.webp';
import wineKathrynHall from '@/assets/drinks/wine-kathryn-hall.jpg';
import wineSancerreRose from '@/assets/drinks/wine-sancerre-rose.jpg';
import wineInniskillin from '@/assets/drinks/wine-inniskillin-icewine.png';

// Drink images - Spirits
import spiritGreyGoose from '@/assets/drinks/spirit-grey-goose.png';
import spiritBelugaGold from '@/assets/drinks/spirit-beluga-gold.png';
import spiritHendricks from '@/assets/drinks/spirit-hendricks.png';
import spiritMonkey47 from '@/assets/drinks/spirit-monkey47.png';
import spiritDiplomatico from '@/assets/drinks/spirit-diplomatico.png';
import spiritZacapa23 from '@/assets/drinks/spirit-zacapa23.jpg';
import spiritClaseAzul from '@/assets/drinks/spirit-clase-azul.png';
import spiritMacallan18 from '@/assets/drinks/spirit-macallan18.jpg';
import spiritYamazaki12 from '@/assets/drinks/spirit-yamazaki12.jpg';
import spiritJohnnieBlue from '@/assets/drinks/spirit-johnnie-blue.png';
import spiritWoodford from '@/assets/drinks/spirit-woodford.jpg';
import spiritLouisXIII from '@/assets/drinks/spirit-louisxiii.jpg';

// Drink images - Cocktails
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
  'wine-1': wineMoetImperial, // Moët Chandon Impérial Brut
  'wine-2': wineLaurentPerrier, // Laurent-Perrier Brut
  'wine-3': wineSancerre, // Domaine Fouassier Sancerre
  'wine-4': wineChablis, // Moillard Chablis
  'wine-5': wineLaboureRoi, // Labouré-Roi Bourgogne Pinot Noir
  'wine-6': wineKathrynHall, // Baca Kathryn Hall Cabernet
  'wine-7': wineSancerreRose, // Domaine Roc de l'Abbaye Sancerre Rosé
  'wine-8': wineDomPerignon, // Dom Pérignon Brut
  'wine-9': wineAceOfSpades, // Armand de Brignac Brut Gold
  'wine-10': wineKrug, // Krug Grand Cuvée
  'wine-11': wineInniskillin, // Quintessa Rutherford / Inniskillin Icewine

  // Spirits
  'spirit-1': spiritGreyGoose, // Grey Goose
  'spirit-2': spiritBelugaGold, // Beluga Gold
  'spirit-3': spiritHendricks, // Hendrick's Gin
  'spirit-4': spiritMonkey47, // Monkey 47 Gin
  'spirit-5': spiritDiplomatico, // Diplomatico Reserva Exclusiva
  'spirit-6': spiritZacapa23, // Zacapa 23
  'spirit-7': spiritClaseAzul, // Clase Azul Reposado
  'spirit-8': spiritMacallan18, // Macallan 18
  'spirit-9': spiritYamazaki12, // Yamazaki 12
  'spirit-10': spiritJohnnieBlue, // Johnnie Walker Blue Label
  'spirit-11': spiritWoodford, // Woodford Reserve
  'spirit-12': spiritLouisXIII, // Louis XIII Cognac

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
