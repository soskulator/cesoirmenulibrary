import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { menuItems, MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { ArrowLeft, Wine } from 'lucide-react';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export default function SpiritsPage() {
  const [selectedSpirit, setSelectedSpirit] = useState<MenuItem | null>(null);
  
  // Get all spirits
  const spirits = menuItems.filter((item) => item.categoryId === 'spirits' && item.isPublished);

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
                <span className="text-3xl">🥃</span>
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

        {/* Spirit Sections by Category */}
        <div className="px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-16">
            {categoryOrder.map((categoryKey) => {
              const category = spiritCategories[categoryKey];
              const categorySpirits = category.ids
                .map((id) => spirits.find((s) => s.id === id))
                .filter(Boolean);

              if (categorySpirits.length === 0) return null;

              return (
                <motion.section
                  key={categoryKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Category Header */}
                  <div className="mb-8 pb-4 border-b border-charcoal/10">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                      {category.title}
                    </h2>
                    <p className="text-copper font-serif italic text-lg mt-1">
                      {category.subtitle}
                    </p>
                    <p className="text-charcoal/60 mt-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Spirit Cards */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-3"
                  >
                    {categorySpirits.map((spirit) => {
                      if (!spirit) return null;
                      const image = getDishImage(spirit.id);

                      return (
                        <motion.div
                          key={spirit.id}
                          variants={item}
                          onClick={() => setSelectedSpirit(spirit)}
                          className="group relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-4 p-4">
                            {/* Spirit Image */}
                            <div className="relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 rounded-xl flex items-center justify-center">
                              {image ? (
                                <img
                                  src={image}
                                  alt={spirit.name}
                                  className="w-auto h-full max-h-20 md:max-h-22 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-2xl">🥃</span>
                                </div>
                              )}
                            </div>

                            {/* Spirit Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1">
                                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-copper transition-colors">
                                  {spirit.name}
                                </h3>
                              </div>
                              <p className="text-sm text-copper font-medium mt-0.5">
                                {spirit.shortDescription}
                              </p>
                              <p className="text-charcoal/60 text-xs md:text-sm leading-relaxed mt-2 line-clamp-2">
                                {spirit.longDescription}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.section>
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
                <Wine className="w-4 h-4 mr-2" />
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
