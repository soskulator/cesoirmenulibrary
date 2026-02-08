import { useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';
import { getUniqueImage } from '@/data/dishImages';
import { ArrowLeft, GlassWater, ChevronDown, Loader2 } from 'lucide-react';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
import { LazyImage } from '@/components/LazyImage';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

// Spirit category icons
import vodkaIcon from '@/assets/categories/spirits-vodka-icon.png';
import ginIcon from '@/assets/categories/spirits-gin-icon.png';
import rumIcon from '@/assets/categories/spirits-rum-icon.png';
import tequilaIcon from '@/assets/categories/spirits-tequila-icon.png';
import mezcalIcon from '@/assets/categories/spirits-mezcal-icon.png';
import scotchIcon from '@/assets/categories/spirits-scotch-icon.png';
import bourbonIcon from '@/assets/categories/spirits-bourbon-icon.png';
import ryeIcon from '@/assets/categories/spirits-rye-icon.png';
import cordialsIcon from '@/assets/categories/spirits-cordials-icon.png';

const spiritCategoryIcons: Record<string, string> = {
  vodka: vodkaIcon,
  gin: ginIcon,
  rum: rumIcon,
  tequila: tequilaIcon,
  mezcal: mezcalIcon,
  scotch: scotchIcon,
  bourbon: bourbonIcon,
  rye: ryeIcon,
  cordials: cordialsIcon,
};

// Spirit categories with French names
const spiritCategories = {
  vodka: {
    title: 'Vodka',
    subtitle: 'Pur & Élégant',
    description: 'Crystal-clear spirits of exceptional purity, from France to Poland to Russia',
    ids: ['spirit-1', 'spirit-2', 'spirit-3', 'spirit-4', 'spirit-5', 'spirit-6', 'spirit-7'],
  },
  gin: {
    title: 'Gin',
    subtitle: 'Botanique & Aromatique',
    description: 'Artisanal gins featuring botanicals from around the world',
    ids: ['spirit-8', 'spirit-9', 'spirit-10', 'spirit-11', 'spirit-12', 'spirit-13', 'spirit-14', 'spirit-15'],
  },
  rum: {
    title: 'Rum',
    subtitle: 'Canne & Côte',
    description: 'Caribbean and Latin American rums from the finest sugarcane',
    ids: ['spirit-16', 'spirit-17', 'spirit-18', 'spirit-19', 'spirit-20', 'spirit-21', 'spirit-22', 'spirit-23', 'spirit-24', 'spirit-25'],
  },
  tequila: {
    title: 'Tequila',
    subtitle: "Esprit d'Agave",
    description: 'Premium 100% Blue Weber Agave tequilas from Mexico',
    ids: [
      'spirit-26', 'spirit-27', 'spirit-28', 'spirit-29', 'spirit-30', 'spirit-31', 'spirit-32',
      'spirit-33', 'spirit-34', 'spirit-35', 'spirit-36', 'spirit-37', 'spirit-38', 'spirit-39',
      'spirit-40', 'spirit-41', 'spirit-42', 'spirit-43', 'spirit-44', 'spirit-45', 'spirit-46'
    ],
  },
  mezcal: {
    title: 'Mezcal',
    subtitle: 'Fumé & Terreux',
    description: 'Artisanal Oaxacan mezcals with distinctive smoke and terroir',
    ids: ['spirit-47', 'spirit-48', 'spirit-49', 'spirit-50', 'spirit-51', 'spirit-52'],
  },
  scotch: {
    title: 'Scotch',
    subtitle: 'Malt & Héritage',
    description: 'Single malts and blends from Scotland\'s legendary distilleries',
    ids: [
      'spirit-53', 'spirit-54', 'spirit-55', 'spirit-56', 'spirit-57', 'spirit-58', 'spirit-59',
      'spirit-60', 'spirit-61', 'spirit-62', 'spirit-63', 'spirit-64', 'spirit-65', 'spirit-66',
      'spirit-67', 'spirit-68', 'spirit-69', 'spirit-70', 'spirit-71', 'spirit-72', 'spirit-73', 'spirit-74'
    ],
  },
  bourbon: {
    title: 'Bourbon',
    subtitle: 'Riche & Robuste',
    description: 'Kentucky\'s finest bourbons, from small batch to premium aged',
    ids: [
      'spirit-75', 'spirit-76', 'spirit-77', 'spirit-78', 'spirit-79', 'spirit-80', 'spirit-81',
      'spirit-82', 'spirit-83', 'spirit-84', 'spirit-85', 'spirit-86', 'spirit-87', 'spirit-88', 'spirit-89'
    ],
  },
  rye: {
    title: 'Rye & Other Whiskeys',
    subtitle: 'Boisé & Épicé',
    description: 'Spicy ryes, smooth Canadian, and Irish whiskeys',
    ids: ['spirit-90', 'spirit-91', 'spirit-92', 'spirit-93', 'spirit-94', 'spirit-95', 'spirit-96'],
  },
  cordials: {
    title: 'Cordials',
    subtitle: 'La Touche Finale',
    description: 'Liqueurs, amari, and digestifs to complete the evening',
    ids: [
      'spirit-97', 'spirit-98', 'spirit-99', 'spirit-100', 'spirit-101', 'spirit-102', 'spirit-103',
      'spirit-104', 'spirit-105', 'spirit-106', 'spirit-107', 'spirit-108', 'spirit-109', 'spirit-110',
      'spirit-111', 'spirit-112', 'spirit-113', 'spirit-114', 'spirit-115'
    ],
  },
};

const categoryOrder = ['vodka', 'gin', 'rum', 'tequila', 'mezcal', 'scotch', 'bourbon', 'rye', 'cordials'] as const;

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

export default function SpiritsPage() {
  usePageTitle("Spirits");
  const [selectedSpirit, setSelectedSpirit] = useState<MenuItem | null>(null);
  const [openCategories, setOpenCategories] = useState<string[]>(['vodka']);
  
  const { items: menuItems, isLoading } = useMenuItems();
  const spirits = menuItems.filter((item) => item.categoryId === 'spirits' && item.isPublished);

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
                <GlassWater className="w-8 h-8 text-copper" />
              </motion.div>

              <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal tracking-tight">
                Spirits
              </h1>
              <p className="text-xl md:text-2xl text-charcoal/50 font-serif italic mt-2">
                Les Spiritueux
              </p>
              <p className="text-charcoal/60 mt-4 max-w-xl mx-auto">
                An exceptional collection of fine spirits from around the world
              </p>
            </div>
          </div>
        </motion.header>

        {/* Spirit Categories Accordion */}
        <div className="px-6 pb-24">
          <div className="max-w-4xl mx-auto space-y-4">
            {categoryOrder.map((categoryKey, categoryIndex) => {
              const category = spiritCategories[categoryKey];
              const categorySpirits = category.ids
                .map((id) => spirits.find((s) => s.id === id))
                .filter(Boolean);

              if (categorySpirits.length === 0) return null;

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
                      <div className={`p-2 rounded-xl transition-all duration-300 overflow-hidden ${open ? 'bg-copper/10 scale-110' : 'bg-copper/5 group-hover:bg-copper/10 group-hover:scale-105'}`}>
                        <img src={spiritCategoryIcons[categoryKey]} alt={category.title} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="text-left">
                        <h2 className={`font-serif text-xl md:text-2xl font-bold transition-colors duration-300 ${open ? 'text-copper' : 'text-charcoal group-hover:text-copper'}`}>
                          {category.title}
                        </h2>
                        <p className="text-charcoal/50 text-sm mt-0.5 font-serif italic">
                          {category.subtitle} • {categorySpirits.length} selections
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
                          
                          {/* Spirit Cards Grid with Cascade Animation */}
                          <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-3"
                          >
                            {categorySpirits.map((spirit, index) => {
                              if (!spirit) return null;
                              const image = getUniqueImage(spirit.id, spirit.imageUrl);

                              return (
                                <motion.div
                                  key={spirit.id}
                                  variants={item}
                                  custom={index}
                                  onClick={() => setSelectedSpirit(spirit)}
                                  className="group relative bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                >
                                  <div className="flex items-stretch gap-4 p-4 min-h-[88px]">
                                    {/* Spirit Image - Only render if unique image exists */}
                                    {image ? (
                                      <div className="relative w-14 h-18 md:w-16 md:h-20 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 rounded-xl flex items-center justify-center">
                                        <LazyImage
                                          src={image}
                                          alt={spirit.name}
                                          className="w-auto h-full max-h-16 md:max-h-18 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                          containerClassName="w-full h-full flex items-center justify-center"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-14 md:w-16 flex-shrink-0" />
                                    )}

                                    {/* Spirit Details */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <h3 className="font-serif text-base md:text-lg font-semibold text-charcoal group-hover:text-copper transition-colors line-clamp-1">
                                        {spirit.name}
                                      </h3>
                                      <p className="text-sm text-copper/80 font-medium mt-0.5 line-clamp-1">
                                        {spirit.shortDescription}
                                      </p>
                                      <p className="text-charcoal/50 text-xs md:text-sm leading-relaxed mt-1 line-clamp-2">
                                        {spirit.longDescription}
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
              Our bartenders are happy to assist with recommendations
            </p>
            <Button variant="outline" asChild className="border-copper text-copper hover:bg-copper hover:text-background">
              <Link to="/categories/spirits">
                <GlassWater className="w-4 h-4 mr-2" />
                Study Spirits Flashcards
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Spirit Detail Modal */}
      <BeverageSplashModal
        item={selectedSpirit}
        isOpen={!!selectedSpirit}
        onClose={() => setSelectedSpirit(null)}
        type="spirit"
      />
    </Layout>
  );
}
