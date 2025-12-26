import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { menuItems, MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { ArrowLeft, Wine, Sparkles, MapPin } from 'lucide-react';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

// Wine region classification
const wineRegions = {
  champagne: {
    title: 'Champagne',
    subtitle: 'Maison de Champagne',
    description: 'Prestigious sparkling wines from the historic Champagne region of France',
    icon: Sparkles,
  },
  french: {
    title: 'French Wines',
    subtitle: 'Vins de France',
    description: 'Classic selections from Burgundy, Loire Valley, and beyond',
    icon: Wine,
  },
  italian: {
    title: 'Italian Wines',
    subtitle: 'Vini Italiani',
    description: 'Distinguished wines from the vineyards of Italy',
    icon: Wine,
  },
  newWorld: {
    title: 'New World Wines',
    subtitle: 'Nouveau Monde',
    description: 'Bold expressions from California, Canada, and emerging wine regions',
    icon: MapPin,
  },
};

// Classify wines by region
const classifyWine = (wine: typeof menuItems[0]) => {
  const name = wine.name.toLowerCase();
  const desc = wine.shortDescription.toLowerCase();
  const ingredients = wine.ingredientsText.toLowerCase();
  
  // Champagne
  if (ingredients.includes('champagne') || desc.includes('champagne')) {
    return 'champagne';
  }
  
  // Italian wines
  if (ingredients.includes('italy') || 
      name.includes('brunello') || 
      name.includes('sassicaia') || 
      name.includes('tignanello') ||
      name.includes('barolo') ||
      name.includes('chianti') ||
      name.includes('amarone')) {
    return 'italian';
  }
  
  // French wines (non-Champagne)
  if (ingredients.includes('france') || 
      ingredients.includes('burgundy') || 
      ingredients.includes('loire') ||
      ingredients.includes('bordeaux') ||
      name.includes('sancerre') ||
      name.includes('chablis') ||
      name.includes('bourgogne') ||
      name.includes('chateau')) {
    return 'french';
  }
  
  // New World (California, Canada, Argentina, Chile, Australia, etc.)
  if (ingredients.includes('california') || 
      ingredients.includes('napa') ||
      ingredients.includes('canada') ||
      ingredients.includes('argentina') ||
      ingredients.includes('chile') ||
      ingredients.includes('australia') ||
      ingredients.includes('new zealand')) {
    return 'newWorld';
  }
  
  // Default to French for unclassified European wines
  return 'french';
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function WineListPage() {
  const [selectedWine, setSelectedWine] = useState<MenuItem | null>(null);
  
  // Get all wine items
  const wines = menuItems.filter((item) => item.categoryId === 'wine' && item.isPublished);
  
  // Group wines by region
  const winesByRegion = wines.reduce((acc, wine) => {
    const region = classifyWine(wine);
    if (!acc[region]) acc[region] = [];
    acc[region].push(wine);
    return acc;
  }, {} as Record<string, typeof wines>);

  // Order regions
  const regionOrder = ['champagne', 'french', 'italian', 'newWorld'] as const;

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

        {/* Wine Sections by Region */}
        <div className="px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-16">
            {regionOrder.map((regionKey) => {
              const regionWines = winesByRegion[regionKey];
              if (!regionWines || regionWines.length === 0) return null;
              
              const region = wineRegions[regionKey];
              const RegionIcon = region.icon;

              return (
                <motion.section
                  key={regionKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Region Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-copper/10">
                      <RegionIcon className="w-6 h-6 text-copper" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                        {region.title}
                      </h2>
                      <p className="text-charcoal/50 font-serif italic">
                        {region.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-charcoal/60 mb-6 pl-16">
                    {region.description}
                  </p>

                  {/* Wine Cards */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-4"
                  >
                    {regionWines.map((wine) => (
                      <motion.div
                        key={wine.id}
                        variants={item}
                        onClick={() => setSelectedWine(wine)}
                        className="group relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Wine Image */}
                          <div className="relative w-32 md:w-36 h-44 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 flex items-center justify-center p-4">
                            {getDishImage(wine.id) ? (
                              <img
                                src={getDishImage(wine.id)}
                                alt={wine.name}
                                className="w-auto h-full max-h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Wine className="w-12 h-12 text-copper/30" />
                              </div>
                            )}
                          </div>

                          {/* Wine Details */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-copper transition-colors">
                                  {wine.name}
                                </h3>
                                <p className="text-sm text-copper font-medium mt-1">
                                  {wine.shortDescription}
                                </p>
                              </div>
                            </div>

                            <p className="text-charcoal/70 text-sm leading-relaxed mb-4 line-clamp-3">
                              {wine.longDescription}
                            </p>

                            {/* Grape/Region Info */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/50">
                              <span className="px-2 py-1 bg-charcoal/5 rounded-full">
                                {wine.ingredientsText.split('•')[0].trim()}
                              </span>
                              {wine.ingredientsText.split('•')[1] && (
                                <span className="px-2 py-1 bg-copper/10 text-copper rounded-full">
                                  {wine.ingredientsText.split('•')[1].trim()}
                                </span>
                              )}
                            </div>

                            {/* Selling Points */}
                            {wine.sellingPointsText && (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-xs text-charcoal/50 italic">
                                  {wine.sellingPointsText}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
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
              <Link to="/categories/wine">
                <Wine className="w-4 h-4 mr-2" />
                View Full Wine Category
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
