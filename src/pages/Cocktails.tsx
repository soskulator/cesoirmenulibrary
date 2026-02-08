import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getDishImage } from '@/data/dishImages';
import { ArrowLeft, Martini, Sparkles, Star, Clock, ChevronDown, Wine as WineGlass, Loader2 } from 'lucide-react';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
import { LazyImage } from '@/components/LazyImage';

// Cocktail style classification
const cocktailStyles = {
  classic: {
    title: 'Classic Cocktails',
    subtitle: 'Les Classiques',
    description: 'Time-honored recipes perfected over generations',
    icon: Clock,
    ids: [
      'cocktail-1', 'cocktail-2', 'cocktail-3', 'cocktail-4', 'cocktail-5',
      'cocktail-6', 'cocktail-7', 'cocktail-8', 'cocktail-9', 'cocktail-10',
      'cocktail-11', 'cocktail-12', 'cocktail-13', 'cocktail-14', 'cocktail-15'
    ],
  },
  signature: {
    title: 'Signature Cocktails',
    subtitle: 'Nos Créations',
    description: 'Our bartenders\' unique interpretations and house specialties',
    icon: Star,
    ids: [
      'signature-cocktail-1', 'signature-cocktail-2', 'signature-cocktail-3',
      'signature-cocktail-4', 'signature-cocktail-5', 'signature-cocktail-6',
      'signature-cocktail-7'
    ],
  },
};

const styleOrder = ['classic', 'signature'] as const;

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

export default function CocktailsPage() {
  usePageTitle("Cocktails");
  const [selectedCocktail, setSelectedCocktail] = useState<MenuItem | null>(null);
  const [openStyles, setOpenStyles] = useState<string[]>(['classic']);
  
  // Get menu items from database
  const { items: menuItems, isLoading } = useMenuItems();
  
  // Get all cocktail items
  const cocktails = menuItems.filter((item) => item.categoryId === 'cocktails' && item.isPublished);

  const toggleStyle = (styleKey: string) => {
    setOpenStyles(prev => 
      prev.includes(styleKey) 
        ? prev.filter(s => s !== styleKey)
        : [...prev, styleKey]
    );
  };

  const isOpen = (styleKey: string) => openStyles.includes(styleKey);

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
                <Martini className="w-8 h-8 text-copper" />
              </motion.div>
              
              <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal tracking-tight">
                Cocktails
              </h1>
              <p className="text-xl md:text-2xl text-charcoal/50 font-serif italic mt-2">
                Les Cocktails
              </p>
              <p className="text-charcoal/60 mt-4 max-w-xl mx-auto">
                Expertly crafted cocktails from classic recipes to signature creations
              </p>
            </div>
          </div>
        </motion.header>

        {/* Cocktail Styles Accordion */}
        <div className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-4">
            {styleOrder.map((styleKey, styleIndex) => {
              const style = cocktailStyles[styleKey];
              const StyleIcon = style.icon;
              const styleCocktails = style.ids
                .map((id) => cocktails.find((c) => c.id === id))
                .filter(Boolean);

              if (styleCocktails.length === 0) return null;

              const open = isOpen(styleKey);

              return (
                <motion.div
                  key={styleKey}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: styleIndex * 0.1 }}
                  className="overflow-hidden"
                >
                  {/* Style Header Button */}
                  <button
                    onClick={() => toggleStyle(styleKey)}
                    className={`w-full flex items-center justify-between p-5 md:p-6 rounded-2xl transition-all duration-300 group border
                      ${open 
                        ? 'bg-copper/10 border-copper/30 shadow-lg' 
                        : 'bg-background/60 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-copper/20 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 ${open ? 'bg-copper/20 scale-110' : 'bg-copper/5 group-hover:bg-copper/10 group-hover:scale-105'}`}>
                        <StyleIcon className={`w-6 h-6 transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal/50 group-hover:text-copper'}`} />
                      </div>
                      <div className="text-left">
                        <h2 className={`font-serif text-xl md:text-2xl font-bold transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal group-hover:text-copper'}`}>
                          {style.title}
                        </h2>
                        <p className="text-charcoal/50 text-sm mt-0.5 font-serif italic">
                          {style.subtitle} • {styleCocktails.length} cocktails
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

                  {/* Style Content - Animated Dropdown */}
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
                            {style.description}
                          </p>
                          
                          {/* Cocktail Cards Grid with Cascade Animation */}
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                          >
                            {styleCocktails.map((cocktail, index) => {
                              if (!cocktail) return null;
                              const image = getDishImage(cocktail.id);

                              return (
                                <motion.div
                                  key={cocktail.id}
                                  variants={item}
                                  custom={index}
                                  onClick={() => setSelectedCocktail(cocktail)}
                                  className="group relative bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-stretch gap-4 p-4 min-h-[120px]">
                                    {/* Cocktail Image */}
                                    {image ? (
                                      <div className="relative w-16 h-24 md:w-20 md:h-28 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 rounded-xl flex items-center justify-center">
                                        <LazyImage
                                          src={image}
                                          alt={cocktail.name}
                                          className="w-auto h-full max-h-20 md:max-h-24 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                          containerClassName="w-full h-full flex items-center justify-center"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-16 md:w-20 flex-shrink-0 flex items-center justify-center">
                                        <Martini className="w-8 h-8 text-copper/30" />
                                      </div>
                                    )}

                                    {/* Cocktail Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal group-hover:text-copper transition-colors line-clamp-1">
                                        {cocktail.name}
                                      </h3>
                                      <p className="text-sm text-copper/80 font-medium mt-0.5 line-clamp-1">
                                        {cocktail.shortDescription}
                                      </p>
                                      
                                      {/* History/Description - truncated */}
                                      <p className="text-charcoal/60 text-xs md:text-sm leading-relaxed mt-2 line-clamp-2">
                                        {cocktail.longDescription}
                                      </p>

                                      {/* Glassware hint from prepNotes */}
                                      {cocktail.prepNotes && (
                                        <p className="text-charcoal/40 text-xs mt-1 line-clamp-1 italic">
                                          {cocktail.prepNotes.split('.')[0]}
                                        </p>
                                      )}
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
              Our bartenders are happy to customize any cocktail to your taste
            </p>
            <Button variant="outline" asChild className="border-copper text-copper hover:bg-copper hover:text-background">
              <Link to="/cocktail-flashcards">
                <Martini className="w-4 h-4 mr-2" />
                Study Cocktail Flashcards
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Cocktail Detail Modal */}
      <BeverageSplashModal
        item={selectedCocktail}
        isOpen={!!selectedCocktail}
        onClose={() => setSelectedCocktail(null)}
        type="cocktail"
      />
    </Layout>
  );
}
