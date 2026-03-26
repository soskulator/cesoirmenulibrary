import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { AllergenList } from '@/components/AllergenBadge';
import { DietaryBadges } from '@/components/DietaryBadge';
import { categories, getCategoryById, MenuItem } from '@/data/menuTypes';
import { getMenuItemsByCategory } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getDishImage } from '@/data/dishImages';
import { getCategoryIcon } from '@/data/categoryIcons';
import { ArrowLeft, CreditCard, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

// Minimalistic category icon illustrations
import crudoIcon from '@/assets/categories/crudo-icon.png';
import appetizersIcon from '@/assets/categories/appetizers-icon.png';
import fruitsDeMerIcon from '@/assets/categories/fruits-de-mer-icon.png';
import pastaIcon from '@/assets/categories/pasta-icon.png';
import entreesIcon from '@/assets/categories/entrees-icon.png';
import sidesIcon from '@/assets/categories/sides-icon.png';
import dessertsIcon from '@/assets/categories/desserts-icon.png';
import saucesIcon from '@/assets/categories/sauces-icon.png';

// Illustrated category images for drinks (keep existing)
import wineIllustrated from '@/assets/categories/wine-illustrated.jpg';
import spiritsIllustrated from '@/assets/categories/spirits-illustrated.jpg';
import cocktailsIllustrated from '@/assets/categories/cocktails-illustrated.jpg';

// Map category IDs to minimalistic icons (food) or illustrated images (drinks)
const categoryIcons: Record<string, { icon?: string; illustrated?: string; isFood: boolean }> = {
  'crudo': { icon: crudoIcon, isFood: true },
  'appetizers': { icon: appetizersIcon, isFood: true },
  'fruits-de-mer': { icon: fruitsDeMerIcon, isFood: true },
  'pasta': { icon: pastaIcon, isFood: true },
  'entrees': { icon: entreesIcon, isFood: true },
  'desserts': { icon: dessertsIcon, isFood: true },
  'sides': { icon: sidesIcon, isFood: true },
  'sauces': { icon: saucesIcon, isFood: true },
  'wine': { illustrated: wineIllustrated, isFood: false },
  'spirits': { illustrated: spiritsIllustrated, isFood: false },
  'cocktails': { illustrated: cocktailsIllustrated, isFood: false },
};

// Spirit subcategories with their IDs
const spiritSubcategories = {
  vodka: {
    title: 'Vodka',
    subtitle: 'Pur & Élégant',
    ids: ['spirit-1', 'spirit-2', 'spirit-3', 'spirit-4', 'spirit-5', 'spirit-6', 'spirit-7'],
  },
  gin: {
    title: 'Gin',
    subtitle: 'Botanique & Aromatique',
    ids: ['spirit-8', 'spirit-9', 'spirit-10', 'spirit-11', 'spirit-12', 'spirit-13', 'spirit-14', 'spirit-15'],
  },
  rum: {
    title: 'Rum',
    subtitle: 'Canne & Côte',
    ids: ['spirit-16', 'spirit-17', 'spirit-18', 'spirit-19', 'spirit-20', 'spirit-21', 'spirit-22', 'spirit-23', 'spirit-24', 'spirit-25'],
  },
  tequila: {
    title: 'Tequila',
    subtitle: "Esprit d'Agave",
    ids: [
      'spirit-26', 'spirit-27', 'spirit-28', 'spirit-29', 'spirit-30', 'spirit-31', 'spirit-32',
      'spirit-33', 'spirit-34', 'spirit-35', 'spirit-36', 'spirit-37', 'spirit-38', 'spirit-39',
      'spirit-40', 'spirit-41', 'spirit-42', 'spirit-43', 'spirit-44', 'spirit-45', 'spirit-46'
    ],
  },
  mezcal: {
    title: 'Mezcal',
    subtitle: 'Fumé & Terreux',
    ids: ['spirit-47', 'spirit-48', 'spirit-49', 'spirit-50', 'spirit-51', 'spirit-52'],
  },
  scotch: {
    title: 'Scotch',
    subtitle: 'Malt & Héritage',
    ids: [
      'spirit-53', 'spirit-54', 'spirit-55', 'spirit-56', 'spirit-57', 'spirit-58', 'spirit-59',
      'spirit-60', 'spirit-61', 'spirit-62', 'spirit-63', 'spirit-64', 'spirit-65', 'spirit-66',
      'spirit-67', 'spirit-68', 'spirit-69', 'spirit-70', 'spirit-71', 'spirit-72', 'spirit-73', 'spirit-74'
    ],
  },
  bourbon: {
    title: 'Bourbon',
    subtitle: 'Riche & Robuste',
    ids: [
      'spirit-75', 'spirit-76', 'spirit-77', 'spirit-78', 'spirit-79', 'spirit-80', 'spirit-81',
      'spirit-82', 'spirit-83', 'spirit-84', 'spirit-85', 'spirit-86', 'spirit-87', 'spirit-88', 'spirit-89'
    ],
  },
  rye: {
    title: 'Rye & Other Whiskeys',
    subtitle: 'Boisé & Épicé',
    ids: ['spirit-90', 'spirit-91', 'spirit-92', 'spirit-93', 'spirit-94', 'spirit-95', 'spirit-96'],
  },
  cordials: {
    title: 'Cordials & Liqueurs',
    subtitle: 'La Touche Finale',
    ids: [
      'spirit-97', 'spirit-98', 'spirit-99', 'spirit-100', 'spirit-101', 'spirit-102', 'spirit-103',
      'spirit-104', 'spirit-105', 'spirit-106', 'spirit-107', 'spirit-108', 'spirit-109', 'spirit-110',
      'spirit-111', 'spirit-112', 'spirit-113', 'spirit-114', 'spirit-115'
    ],
  },
};

// Sauce subcategories with their IDs
const baseSauceSubcategories = {
  oyster: {
    title: 'Oyster Accompaniments',
    subtitle: 'Les Huîtres',
    ids: ['sauce-9', 'sauce-10', 'sauce-11'],
  },
  steak: {
    title: 'Steak Sauces',
    subtitle: 'Pour les Viandes',
    ids: ['sauce-16', 'sauce-17', 'sauce-18', 'sauce-19'],
  },
  house: {
    title: 'House Sauces & Condiments',
    subtitle: 'Condiments de la Maison',
    ids: ['sauce-1', 'sauce-2', 'sauce-3', 'sauce-4', 'sauce-5', 'sauce-6', 'sauce-7', 'sauce-8', 'sauce-12', 'sauce-13', 'sauce-14', 'sauce-15'],
  },
};

// Build dynamic subcategories that include any DB-added sauce items not in the hardcoded lists
const buildSauceSubcategories = (allSauceItems: MenuItem[]) => {
  const assignedIds = new Set([
    ...baseSauceSubcategories.oyster.ids,
    ...baseSauceSubcategories.steak.ids,
    ...baseSauceSubcategories.house.ids,
  ]);
  const unassignedIds = allSauceItems
    .filter(item => !assignedIds.has(item.id))
    .map(item => item.id);

  return {
    oyster: baseSauceSubcategories.oyster,
    steak: {
      ...baseSauceSubcategories.steak,
      ids: [...baseSauceSubcategories.steak.ids, ...unassignedIds],
    },
    house: baseSauceSubcategories.house,
  };
};

const sauceSubcategoryOrder = ['oyster', 'steak', 'house'] as const;

const subcategoryOrder = ['vodka', 'gin', 'rum', 'tequila', 'mezcal', 'scotch', 'bourbon', 'rye', 'cordials'] as const;

// Smoother animation variants for mobile
const pageTransition = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      staggerChildren: 0.03,
      delayChildren: 0
    }
  }
};

const cascadeButton = {
  hidden: { 
    opacity: 0, 
    y: 16,
    scale: 0.95
  },
  show: (i: number) => ({
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      delay: i * 0.03,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    }
  })
};

const itemReveal = {
  hidden: { 
    opacity: 0, 
    x: -12,
    scale: 0.98
  },
  show: (i: number) => ({
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      duration: 0.15,
      delay: i * 0.02,
      ease: 'easeOut' as const
    }
  }),
  exit: {
    opacity: 0,
    x: -8,
    transition: { duration: 0.2 }
  }
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const
    }
  }
};
export default function CategoriesPage() {
  usePageTitle("Menu Categories");
  const { categoryId } = useParams();
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);
  
  // Get menu items from database
  const { items: menuItems, isLoading } = useMenuItems();

  // Show single category if specified
  if (categoryId) {
    const category = getCategoryById(categoryId);
    const items = menuItems.filter(item => item.categoryId === categoryId && item.isPublished);
    if (!category) {
      return <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <span className="text-6xl mb-4">🍽️</span>
            <h1 className="font-serif text-2xl text-charcoal mb-2">Category not found</h1>
            <Button variant="link" asChild className="text-copper">
              <Link to="/categories">Back to categories</Link>
            </Button>
          </div>
        </Layout>;
    }

    // Special handling for spirits and sauces categories with subcategories
    const isSpirits = categoryId === 'spirits';
    const isSauces = categoryId === 'sauces';
    const sauceSubcategories = isSauces ? buildSauceSubcategories(items) : baseSauceSubcategories;

    const toggleSubcategory = (key: string) => {
      setExpandedSubcategory(expandedSubcategory === key ? null : key);
    };

    return <Layout>
        {/* Background - Category Icon */}
        <div className="fixed inset-0 -z-10 bg-cream">
          {getCategoryIcon(category.id) ? <div className="absolute inset-0 flex items-center justify-center">
              <img src={getCategoryIcon(category.id)} alt="" className="w-full h-full object-contain opacity-30 scale-110" />
            </div> : <img src={bayfrontSketch} alt="" className="w-full h-full object-cover opacity-[0.08]" />}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/40 to-cream/90" />
        </div>

        <div className="min-h-screen">
          {/* Breadcrumb */}
          <nav className="container pt-4 mb-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span> / </span>
            <Link to="/categories" className="hover:text-foreground transition-colors">Menu</Link>
            <span> / </span>
            <span className="text-foreground">{category.name}</span>
          </nav>
          {/* Elegant Header */}
          <motion.header 
            className="pt-6 pb-8 md:pb-12 px-6" 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="max-w-5xl mx-auto">
              <Link to="/categories" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors duration-100 mb-6 md:mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-150" />
                <span className="text-sm tracking-wide uppercase">All Categories</span>
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0, ease: 'easeOut' }}
              >
                <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
                  {category.name}
                </h1>
                <p className="text-xl md:text-2xl text-charcoal/50 font-serif italic mt-1">
                  {category.nameFrench}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="text-sm text-charcoal/60 tracking-wide">
                    {items.length} {isSpirits ? 'spirits' : categoryId === 'wine' ? 'wines' : categoryId === 'cocktails' ? 'cocktails' : categoryId === 'sauces' ? 'sauces' : 'dishes'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-charcoal/30" />
                  <Button variant="ghost" size="sm" asChild className="text-copper hover:text-copper-light hover:bg-copper/5 -ml-2 transition-all duration-150">
                    <Link to={`/flashcards?category=${categoryId}`}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Study Flashcards
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.header>

          {/* Spirits with Cascade Subcategory Buttons */}
          {isSpirits ? (
            <div className="px-6 pb-24">
              <div className="max-w-5xl mx-auto">
                {/* Cascade Subcategory Buttons */}
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
                  initial="hidden"
                  animate="show"
                  variants={pageTransition}
                >
                  {subcategoryOrder.map((subcatKey, index) => {
                    const subcat = spiritSubcategories[subcatKey];
                    const subcatItems = subcat.ids
                      .map((id) => items.find((i) => i.id === id))
                      .filter(Boolean);
                    
                    if (subcatItems.length === 0) return null;
                    
                    const isExpanded = expandedSubcategory === subcatKey;
                    
                    return (
                      <motion.button
                        key={subcatKey}
                        custom={index}
                        variants={cascadeButton}
                        onClick={() => toggleSubcategory(subcatKey)}
                        className={`
                          relative overflow-hidden rounded-2xl p-4 text-left
                          border transition-all duration-150 ease-out
                          ${isExpanded 
                            ? 'bg-copper text-white border-copper shadow-lg shadow-copper/20 scale-[1.02]' 
                            : 'bg-white/80 backdrop-blur-sm text-charcoal border-charcoal/10 hover:border-copper/30 hover:bg-white hover:shadow-md'
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-serif font-semibold text-base md:text-lg truncate transition-colors duration-100 ${isExpanded ? 'text-white' : 'text-charcoal'}`}>
                              {subcat.title}
                            </h3>
                            <p className={`text-xs md:text-sm font-serif italic mt-0.5 truncate transition-colors duration-100 ${isExpanded ? 'text-white/80' : 'text-copper'}`}>
                              {subcatItems.length} spirits
                            </p>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                          >
                            <ChevronDown className={`w-5 h-5 shrink-0 ml-2 transition-colors duration-100 ${isExpanded ? 'text-white' : 'text-charcoal/40'}`} />
                          </motion.div>
                        </div>
                        
                        {/* Subtle glow effect when expanded */}
                        {isExpanded && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-copper-light/20 to-transparent pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Expanded Subcategory Items */}
                <AnimatePresence mode="wait">
                  {expandedSubcategory && (
                    <motion.section
                      key={expandedSubcategory}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.15, delay: 0, ease: 'easeOut' }}
                        className="pb-8"
                      >
                        {/* Subcategory Header */}
                        <div className="mb-6 pb-3 border-b border-charcoal/10">
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                            {spiritSubcategories[expandedSubcategory as keyof typeof spiritSubcategories].title}
                          </h2>
                          <p className="text-copper font-serif italic text-base mt-1">
                            {spiritSubcategories[expandedSubcategory as keyof typeof spiritSubcategories].subtitle}
                          </p>
                        </div>

                        {/* Items Grid */}
                        <div className="space-y-2 md:space-y-3">
                          {spiritSubcategories[expandedSubcategory as keyof typeof spiritSubcategories].ids
                            .map((id) => items.find((i) => i.id === id))
                            .filter(Boolean)
                            .map((menuItem, idx) => {
                              if (!menuItem) return null;
                              const dishImage = getDishImage(menuItem.id, menuItem.imageUrl);
                              return (
                                <motion.div 
                                  key={menuItem.id}
                                  custom={idx}
                                  variants={itemReveal}
                                  initial="hidden"
                                  animate="show"
                                  exit="exit"
                                >
                                  <Link to={`/flashcards?item=${menuItem.id}`} className="group block">
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-charcoal/5 hover:bg-white hover:shadow-lg hover:border-copper/20 transition-all duration-150 ease-out active:scale-[0.99]">
                                      {/* Image */}
                                      <div className="w-12 h-14 md:w-16 md:h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-copper/5 to-cream/50 flex items-center justify-center">
                                        {dishImage ? (
                                          <img 
                                            src={dishImage} 
                                            alt={menuItem.name} 
                                            className="w-auto h-full max-h-12 md:max-h-18 object-contain group-hover:scale-102 transition-transform duration-150 drop-shadow-sm" 
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl">
                                            🥃
                                          </div>
                                        )}
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal group-hover:text-copper transition-colors duration-100 truncate">
                                          {menuItem.name}
                                        </h3>
                                        <p className="text-xs md:text-sm text-copper font-medium mt-0.5 line-clamp-1">
                                          {menuItem.shortDescription}
                                        </p>
                                      </div>

                                      {/* Arrow */}
                                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-charcoal/20 group-hover:text-copper group-hover:translate-x-1 transition-all duration-150 shrink-0" />
                                    </div>
                                  </Link>
                                </motion.div>
                              );
                            })}
                        </div>
                      </motion.div>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* Hint when no subcategory selected */}
                <AnimatePresence>
                  {!expandedSubcategory && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, delay: 0.1 }}
                      className="text-center text-charcoal/40 font-serif italic mt-4"
                    >
                      Tap a category to explore spirits
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : isSauces ? (
            <div className="px-6 pb-24">
              <div className="max-w-5xl mx-auto">
                {/* Sauce Subcategory Buttons */}
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8"
                  initial="hidden"
                  animate="show"
                  variants={pageTransition}
                >
                  {sauceSubcategoryOrder.map((subcatKey, index) => {
                    const subcat = sauceSubcategories[subcatKey];
                    const subcatItems = subcat.ids
                      .map((id) => items.find((i) => i.id === id))
                      .filter(Boolean);
                    
                    if (subcatItems.length === 0) return null;
                    
                    const isExpanded = expandedSubcategory === subcatKey;
                    
                    return (
                      <motion.button
                        key={subcatKey}
                        custom={index}
                        variants={cascadeButton}
                        onClick={() => toggleSubcategory(subcatKey)}
                        className={`
                          relative overflow-hidden rounded-2xl p-4 text-left
                          border transition-all duration-150 ease-out
                          ${isExpanded 
                            ? 'bg-copper text-white border-copper shadow-lg shadow-copper/20 scale-[1.02]' 
                            : 'bg-white/80 backdrop-blur-sm text-charcoal border-charcoal/10 hover:border-copper/30 hover:bg-white hover:shadow-md'
                          }
                        `}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-serif font-semibold text-base md:text-lg truncate transition-colors duration-100 ${isExpanded ? 'text-white' : 'text-charcoal'}`}>
                              {subcat.title}
                            </h3>
                            <p className={`text-xs md:text-sm font-serif italic mt-0.5 truncate transition-colors duration-100 ${isExpanded ? 'text-white/80' : 'text-copper'}`}>
                              {subcat.subtitle} • {subcatItems.length} sauces
                            </p>
                          </div>
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                          >
                            <ChevronDown className={`w-5 h-5 shrink-0 ml-2 transition-colors duration-100 ${isExpanded ? 'text-white' : 'text-charcoal/40'}`} />
                          </motion.div>
                        </div>
                        
                        {isExpanded && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-copper-light/20 to-transparent pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.1 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Expanded Sauce Subcategory Items */}
                <AnimatePresence mode="wait">
                  {expandedSubcategory && (
                    <motion.section
                      key={expandedSubcategory}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.15, delay: 0, ease: 'easeOut' }}
                        className="pb-8"
                      >
                        <div className="mb-6 pb-3 border-b border-charcoal/10">
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                            {sauceSubcategories[expandedSubcategory as keyof typeof sauceSubcategories].title}
                          </h2>
                          <p className="text-copper font-serif italic text-base mt-1">
                            {sauceSubcategories[expandedSubcategory as keyof typeof sauceSubcategories].subtitle}
                          </p>
                        </div>

                        <div className="space-y-2 md:space-y-3">
                          {sauceSubcategories[expandedSubcategory as keyof typeof sauceSubcategories].ids
                            .map((id) => items.find((i) => i.id === id))
                            .filter(Boolean)
                            .map((menuItem, idx) => {
                              if (!menuItem) return null;
                              const dishImage = getDishImage(menuItem.id, menuItem.imageUrl);
                              const pairedDish = menuItem.shortDescription.includes('—') 
                                ? menuItem.shortDescription.split('—').pop()?.trim() 
                                : null;
                              return (
                                <motion.div 
                                  key={menuItem.id}
                                  custom={idx}
                                  variants={itemReveal}
                                  initial="hidden"
                                  animate="show"
                                  exit="exit"
                                >
                                  <Link to={`/flashcards?item=${menuItem.id}`} className="group block">
                                    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-charcoal/5 hover:bg-white hover:shadow-lg hover:border-copper/20 transition-all duration-150 ease-out active:scale-[0.99]">
                                      <div className="w-12 h-14 md:w-16 md:h-20 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-copper/5 to-cream/50 flex items-center justify-center">
                                        {dishImage ? (
                                          <img src={dishImage} alt={menuItem.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-150" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl">🫗</div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal group-hover:text-copper transition-colors duration-100 truncate">
                                          {menuItem.name}
                                        </h3>
                                        {pairedDish && (
                                          <p className="text-xs md:text-sm text-copper font-medium mt-0.5 line-clamp-1">
                                            Served with: {pairedDish}
                                          </p>
                                        )}
                                        {menuItem.allergens.length > 0 && (
                                          <div className="mt-1">
                                            <AllergenList allergens={menuItem.allergens} size="sm" showIcons={false} />
                                          </div>
                                        )}
                                      </div>
                                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-charcoal/20 group-hover:text-copper group-hover:translate-x-1 transition-all duration-150 shrink-0" />
                                    </div>
                                  </Link>
                                </motion.div>
                              );
                            })}
                        </div>
                      </motion.div>
                    </motion.section>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!expandedSubcategory && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, delay: 0.1 }}
                      className="text-center text-charcoal/40 font-serif italic mt-4"
                    >
                      Tap a category to explore sauces
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Regular Menu Items - Clean List */
            <motion.div variants={container} initial="hidden" animate="show" className="px-6 pb-24">
              <div className="max-w-4xl mx-auto space-y-3">
                {items.map((menuItem, idx) => {
                  const dishImage = getDishImage(menuItem.id, menuItem.imageUrl);
                  return (
                    <motion.div 
                      key={menuItem.id} 
                      custom={idx}
                      variants={item}
                    >
                      <Link to={`/flashcards?item=${menuItem.id}`} className="group block">
                        <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-charcoal/5 hover:bg-white hover:shadow-lg hover:border-charcoal/10 transition-all duration-150 active:scale-[0.99]">
                          {/* Image */}
                          <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 bg-cream">
                            {dishImage ? (
                              <img 
                                src={dishImage} 
                                alt={menuItem.name} 
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-150" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                🍽️
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-base md:text-xl font-semibold text-charcoal group-hover:text-copper transition-colors duration-100">
                              {menuItem.name}
                            </h3>
                            <p className="text-sm text-charcoal/60 line-clamp-1 mt-0.5">
                              {menuItem.shortDescription}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <DietaryBadges item={menuItem} size="sm" />
                              {menuItem.allergens.filter(a => a !== 'vegetarian' && a !== 'vegan').length > 0 && (
                                <AllergenList allergens={menuItem.allergens.filter(a => a !== 'vegetarian' && a !== 'vegan')} size="sm" showIcons={false} />
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-charcoal/20 group-hover:text-copper group-hover:translate-x-1 transition-all duration-150 shrink-0" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </Layout>;
  }

  // Show all categories - Artistic Grid
  return <Layout>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-cream">
        <img src={bayfrontSketch} alt="" className="w-full h-full object-cover opacity-[0.08]" />
      </div>

      <div className="min-h-screen">
        {/* Minimal Header */}
        <motion.header className="pt-12 md:pt-14 pb-12 md:pb-6 px-6 text-center" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.2
      }}>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal tracking-tight">
            The Menu
          </h1>
          <p className="text-charcoal/50 mt-3 text-lg font-serif italic">Explore our menu categories</p>
        </motion.header>

        {/* Categories Grid - Elegant Button Style */}
        <motion.div variants={container} initial="hidden" animate="show" className="px-4 sm:px-6 pb-24">
          <div className="max-w-2xl lg:max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-3">
            {categories.map((category) => {
              const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
              const categoryData = categoryIcons[category.id];
              const isDarkCategory = ['wine', 'spirits', 'cocktails'].includes(category.id);
              const hasMinimalistIcon = categoryData?.icon;
              
              return (
                <motion.div key={category.id} variants={item}>
                  <Link to={`/categories/${category.id}`} className="group block h-full">
                    {/* Food categories with minimalistic icons - Opaque button style */}
                    {hasMinimalistIcon ? (
                      <div className="relative overflow-hidden rounded-2xl h-36 sm:h-44 lg:h-32 bg-cream border border-charcoal/8 transition-all duration-150 hover:shadow-lg hover:border-copper/30 hover:bg-cream-dark/30">
                        {/* Minimalistic Icon - Semi-transparent in corner */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-28 sm:w-36 lg:w-28 h-28 sm:h-36 lg:h-28 opacity-40 group-hover:opacity-60 transition-opacity duration-150">
                          <img 
                            src={categoryData.icon} 
                            alt="" 
                            className="w-full h-full object-contain group-hover:scale-102 transition-transform duration-150" 
                          />
                        </div>
                        
                        {/* Subtle gradient from left for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-transparent" />

                        {/* Text Content - Left Aligned */}
                        <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-5 lg:p-4">
                          <h2 className="font-serif text-lg sm:text-2xl lg:text-xl font-bold text-charcoal group-hover:text-copper transition-colors duration-100">
                            {category.name}
                          </h2>
                          <p className="font-serif italic text-xs sm:text-sm lg:text-xs mt-0.5 text-copper/80">
                            {category.nameFrench}
                          </p>

                          {/* Count */}
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-[10px] sm:text-xs tracking-wide uppercase text-charcoal/50">
                              {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                            </span>
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-charcoal/30 group-hover:text-copper group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drinks and other categories with illustrated backgrounds */
                      <div className={`relative overflow-hidden rounded-2xl h-36 sm:h-44 lg:h-32 border transition-all duration-150 hover:shadow-xl ${
                        isDarkCategory 
                          ? 'border-charcoal/20 hover:border-charcoal/40' 
                          : 'border-charcoal/10 hover:border-copper/30'
                      }`}>
                        {/* Background Image - Illustrated Style */}
                        {categoryData?.illustrated && (
                          <img 
                            src={categoryData.illustrated} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-150" 
                          />
                        )}
                        
                        {/* Subtle Gradient Overlay */}
                        <div className={`absolute inset-0 transition-all duration-150 ${
                          isDarkCategory
                            ? 'bg-gradient-to-r from-charcoal/70 via-charcoal/30 to-transparent'
                            : 'bg-gradient-to-r from-cream/80 via-cream/40 to-transparent'
                        }`} />

                        {/* Text Content - Left Aligned */}
                        <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-5 lg:p-4">
                          <h2 className={`font-serif text-lg sm:text-2xl lg:text-xl font-bold drop-shadow-sm transition-colors duration-100 ${
                            isDarkCategory
                              ? 'text-white group-hover:text-copper-light'
                              : 'text-charcoal group-hover:text-copper'
                          }`}>
                            {category.name}
                          </h2>
                          <p className={`font-serif italic text-xs sm:text-sm lg:text-xs mt-0.5 ${
                            isDarkCategory ? 'text-white/70' : 'text-copper'
                          }`}>
                            {category.nameFrench}
                          </p>

                          {/* Count */}
                          <div className="mt-2 flex items-center gap-1">
                            <span className={`text-[10px] sm:text-xs tracking-wide uppercase ${
                              isDarkCategory ? 'text-white/60' : 'text-charcoal/50'
                            }`}>
                              {itemCount} {category.id === 'wine' ? 'wines' : category.id === 'cocktails' ? 'cocktails' : category.id === 'spirits' ? 'spirits' : category.id === 'sauces' ? 'sauces' : 'items'}
                            </span>
                            <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-all ${
                              isDarkCategory 
                                ? 'text-white/40 group-hover:text-copper-light' 
                                : 'text-charcoal/30 group-hover:text-copper'
                            }`} />
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>;
}