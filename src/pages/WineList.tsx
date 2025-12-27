import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { menuItems, MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { ArrowLeft, Wine, Sparkles, GlassWater } from 'lucide-react';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
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

export default function WineListPage() {
  const [selectedWine, setSelectedWine] = useState<MenuItem | null>(null);
  
  // Get all wine items
  const wines = menuItems.filter((item) => item.categoryId === 'wine' && item.isPublished);

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

        {/* Wine Sections by Category */}
        <div className="px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-16">
            {categoryOrder.map((categoryKey) => {
              const category = wineCategories[categoryKey];
              const CategoryIcon = category.icon;
              const categoryWines = category.ids
                .map((id) => wines.find((w) => w.id === id))
                .filter(Boolean);

              if (categoryWines.length === 0) return null;

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
                    <div className="flex items-center gap-3 mb-2">
                      <CategoryIcon className="w-6 h-6 text-copper" />
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                        {category.title}
                      </h2>
                    </div>
                    <p className="text-copper font-serif italic text-lg">
                      {category.subtitle}
                    </p>
                    <p className="text-charcoal/60 mt-2">
                      {category.description}
                    </p>
                  </div>

                  {/* Wine Cards */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-3"
                  >
                    {categoryWines.map((wine) => {
                      if (!wine) return null;
                      const image = getDishImage(wine.id);

                      return (
                        <motion.div
                          key={wine.id}
                          variants={item}
                          onClick={() => setSelectedWine(wine)}
                          className="group relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-center gap-4 p-4">
                            {/* Wine Image */}
                            <div className="relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 rounded-xl flex items-center justify-center">
                              {image ? (
                                <img
                                  src={image}
                                  alt={wine.name}
                                  className="w-auto h-full max-h-20 md:max-h-22 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Wine className="w-8 h-8 text-copper/30" />
                                </div>
                              )}
                            </div>

                            {/* Wine Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-copper transition-colors">
                                {wine.name}
                              </h3>
                              <p className="text-sm text-copper font-medium mt-0.5">
                                {wine.shortDescription}
                              </p>
                              <p className="text-charcoal/60 text-xs md:text-sm leading-relaxed mt-2 line-clamp-2">
                                {wine.longDescription}
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
