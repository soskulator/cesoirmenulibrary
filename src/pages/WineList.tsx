import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getUniqueImage } from '@/data/dishImages';
import { ArrowLeft, Wine, Sparkles, GlassWater, ChevronDown, Loader2 } from 'lucide-react';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
import { LazyImage } from '@/components/LazyImage';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

// Wine categories organized by type
const wineCategories = {
  sparkling: {
    title: 'Sparkling Wines',
    subtitle: 'Vins Mousseux',
    description: 'Champagne and sparkling wines from the world\'s most celebrated regions',
    icon: Sparkles,
    ids: [
      'wine-1', 'wine-2', 'wine-13', 'wine-14', 'wine-15', 'wine-16', 'wine-17', 'wine-18',
      'wine-8', 'wine-9', 'wine-10', 'wine-19', 'wine-20', 'wine-21', 'wine-22', 'wine-23',
      'wine-24', 'wine-25', 'wine-26', 'wine-27', 'wine-28', 'wine-29', 'wine-30', 'wine-31'
    ],
  },
  white: {
    title: 'White Wines',
    subtitle: 'Vins Blancs',
    description: 'Crisp and elegant white wines from France, Italy, and beyond',
    icon: GlassWater,
    ids: [
      'wine-3', 'wine-4', 'wine-32', 'wine-33', 'wine-34', 'wine-35', 'wine-36', 'wine-37',
      'wine-38', 'wine-39'
    ],
  },
  rose: {
    title: 'Rosé Wines',
    subtitle: 'Vins Rosés',
    description: 'Refreshing rosés from Provence to California',
    icon: Wine,
    ids: ['wine-7', 'wine-40', 'wine-41', 'wine-42', 'wine-43', 'wine-44'],
  },
  red: {
    title: 'Red Wines',
    subtitle: 'Vins Rouges',
    description: 'Bold and refined reds from classic wine regions',
    icon: Wine,
    ids: [
      'wine-5', 'wine-6', 'wine-11', 'wine-45', 'wine-46', 'wine-47', 'wine-48', 'wine-49',
      'wine-50', 'wine-51', 'wine-52', 'wine-53'
    ],
  },
  dessert: {
    title: 'Dessert Wines',
    subtitle: 'Vins de Dessert',
    description: 'Sweet wines, ports, and digestifs to finish the evening',
    icon: Sparkles,
    ids: ['wine-12', 'wine-54', 'wine-55', 'wine-56', 'wine-57', 'wine-58', 'wine-59'],
  },
};

const categoryOrder = ['sparkling', 'white', 'rose', 'red', 'dessert'] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export default function WineListPage() {
  usePageTitle("Wine List");
  const [selectedWine, setSelectedWine] = useState<MenuItem | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(['sparkling']);
  
  // Get menu items from database
  const { items: menuItems, isLoading } = useMenuItems();
  
  // Get all wine items
  const wines = menuItems.filter((item) => item.categoryId === 'wine' && item.isPublished);

  const toggleCategory = (categoryKey: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const isOpen = (categoryKey: string) => openCategories.includes(categoryKey);

  return (
    <Layout>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-cream">
        <img
          src={bayfrontSketch}
          alt=""
          className="w-full h-full object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream/90 via-cream/60 to-cream" />
      </div>

      <div className="min-h-screen">
        {/* Header */}
        <motion.header
          className="pt-6 pb-12 px-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-5xl mx-auto">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm tracking-wide uppercase">Back to Menu</span>
            </Link>

            <div className="text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-copper/10 mb-6"
              >
                <Wine className="w-8 h-8 text-copper" />
              </motion.div>
              
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal tracking-tight">
                Wine List
              </h1>
              <p className="text-xl md:text-2xl text-charcoal/50 font-serif italic mt-2">
                La Carte des Vins
              </p>
              <p className="text-charcoal/60 mt-4 max-w-xl mx-auto">
                A curated collection of exceptional wines from the world's most celebrated regions
              </p>
            </div>
          </div>
        </motion.header>

        {/* Wine Categories Accordion */}
        <div className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-4">
            {categoryOrder.map((categoryKey, categoryIndex) => {
              const category = wineCategories[categoryKey];
              const CategoryIcon = category.icon;
              const categoryWines = category.ids
                .map((id) => wines.find((w) => w.id === id))
                .filter(Boolean);

              if (categoryWines.length === 0) return null;

              const open = isOpen(categoryKey);

              return (
                <motion.div
                  key={categoryKey}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  className="overflow-hidden"
                >
                  {/* Category Header Button */}
                  <button
                    onClick={() => toggleCategory(categoryKey)}
                    className={`w-full flex items-center justify-between p-5 md:p-6 rounded-2xl transition-all duration-300 group border
                      ${open 
                        ? 'bg-copper/10 border-copper/30 shadow-lg' 
                        : 'bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-copper/20 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${open ? 'bg-copper/20 scale-110' : 'bg-copper/5 group-hover:bg-copper/10 group-hover:scale-105'}`}>
                        <CategoryIcon className={`w-6 h-6 transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal/50 group-hover:text-copper'}`} />
                      </div>
                      <div className="text-left">
                        <h2 className={`font-serif text-xl md:text-2xl font-bold transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal group-hover:text-copper'}`}>
                          {category.title}
                        </h2>
                        <p className="text-charcoal/50 text-sm mt-0.5 font-serif italic">
                          {category.subtitle} • {categoryWines.length} selections
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className={`p-2 rounded-full transition-colors duration-300 ${open ? 'bg-copper/20' : 'group-hover:bg-copper/10'}`}
                    >
                      <ChevronDown className={`w-5 h-5 transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal/40 group-hover:text-copper'}`} />
                    </motion.div>
                  </button>

                  {/* Category Content - Animated Dropdown */}
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 pb-2">
                          <p className="text-charcoal/60 text-center mb-6 font-serif italic px-4">
                            {category.description}
                          </p>
                          
                          {/* Wine Cards Grid with Cascade Animation */}
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                          >
                            {categoryWines.map((wine, index) => {
                              if (!wine) return null;
                              const image = getUniqueImage(wine.id, wine.imageUrl);

                              return (
                                <motion.div
                                  key={wine.id}
                                  variants={item}
                                  custom={index}
                                  onClick={() => setSelectedWine(wine)}
                                  className="group relative bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-stretch gap-4 p-4 min-h-[88px]">
                                    {/* Wine Image - Only render if unique image exists */}
                                    {image ? (
                                      <div className="relative w-14 h-18 md:w-16 md:h-20 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 rounded-xl flex items-center justify-center">
                                        <LazyImage
                                          src={image}
                                          alt={wine.name}
                                          className="w-auto h-full max-h-16 md:max-h-18 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                          containerClassName="w-full h-full flex items-center justify-center"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-14 md:w-16 flex-shrink-0" />
                                    )}

                                    {/* Wine Details - Flex to fill available space */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal group-hover:text-copper transition-colors line-clamp-1">
                                        {wine.name}
                                      </h3>
                                      <p className="text-sm text-copper/80 font-medium mt-0.5 line-clamp-1">
                                        {wine.shortDescription}
                                      </p>
                                      <p className="text-charcoal/50 text-xs md:text-sm leading-relaxed mt-1 line-clamp-2">
                                        {wine.longDescription}
                                      </p>
                                    </div>

                                    {/* Hover Indicator */}
                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-center">
                                      <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center">
                                        <ChevronDown className="w-4 h-4 text-copper -rotate-90" />
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pb-16 px-6"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-charcoal/5 rounded-3xl">
            <p className="text-charcoal/60 font-serif italic">
              Our sommelier is happy to assist with pairings
            </p>
            <Button variant="outline" asChild className="border-copper text-copper hover:bg-copper hover:text-background">
              <Link to="/flashcards?category=wine">
                <Wine className="w-4 h-4 mr-2" />
                Study Wine Flashcards
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Wine Detail Modal */}
      <BeverageSplashModal
        item={selectedWine}
        isOpen={!!selectedWine}
        onClose={() => setSelectedWine(null)}
        type="wine"
      />
    </Layout>
  );
}
