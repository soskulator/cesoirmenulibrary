import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { menuItems, MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { ArrowLeft, GlassWater, Sparkles, Star, Clock } from 'lucide-react';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';
import { BeverageSplashModal } from '@/components/BeverageSplashModal';

// Cocktail style classification
const cocktailStyles = {
  classic: {
    title: 'Classic Cocktails',
    subtitle: 'Les Classiques',
    description: 'Time-honored recipes perfected over generations',
    icon: Clock,
  },
  signature: {
    title: 'Signature Cocktails',
    subtitle: 'Nos Créations',
    description: 'Our bartenders\' unique interpretations and house specialties',
    icon: Star,
  },
  specials: {
    title: 'Cocktail Specials',
    subtitle: 'Les Spécialités',
    description: 'Refreshing favorites and crowd-pleasers',
    icon: Sparkles,
  },
};

// Classify cocktails by style
const classifyCocktail = (cocktail: typeof menuItems[0]) => {
  const id = cocktail.id;
  const name = cocktail.name.toLowerCase();
  
  // Check if it's a signature cocktail first (by ID prefix)
  if (id.startsWith('signature-cocktail')) return 'signature';
  
  // Classic cocktails - timeless recipes
  const classics = [
    'old fashioned', 'manhattan', 'negroni', 'martini', 'daiquiri',
    'margarita', 'whiskey sour', 'boulevardier', 'pisco sour'
  ];
  
  // Specials - lighter, refreshing
  const specials = [
    'moscow mule', 'aperol spritz', 'cosmopolitan', 'mojito',
    'espresso martini', 'irish coffee', 'vodka martini'
  ];
  
  if (classics.some(c => name.includes(c))) return 'classic';
  if (specials.some(s => name.includes(s))) return 'specials';
  
  // Default based on cocktail type
  return 'classic';
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

export default function CocktailsPage() {
  const [selectedCocktail, setSelectedCocktail] = useState<MenuItem | null>(null);
  
  // Get all cocktail items
  const cocktails = menuItems.filter((item) => item.categoryId === 'cocktails' && item.isPublished);
  
  // Group cocktails by style
  const cocktailsByStyle = cocktails.reduce((acc, cocktail) => {
    const style = classifyCocktail(cocktail);
    if (!acc[style]) acc[style] = [];
    acc[style].push(cocktail);
    return acc;
  }, {} as Record<string, typeof cocktails>);

  // Order styles
  const styleOrder = ['classic', 'signature', 'specials'] as const;

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

        {/* Cocktail Sections by Style */}
        <div className="px-6 pb-24">
          <div className="max-w-5xl mx-auto space-y-16">
            {styleOrder.map((styleKey) => {
              const styleCocktails = cocktailsByStyle[styleKey];
              if (!styleCocktails || styleCocktails.length === 0) return null;
              
              const style = cocktailStyles[styleKey];
              const StyleIcon = style.icon;

              return (
                <motion.section
                  key={styleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Style Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-copper/10">
                      <StyleIcon className="w-6 h-6 text-copper" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal">
                        {style.title}
                      </h2>
                      <p className="text-charcoal/50 font-serif italic">
                        {style.subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-charcoal/60 mb-6 pl-16">
                    {style.description}
                  </p>

                  {/* Cocktail Cards */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid gap-4"
                  >
                    {styleCocktails.map((cocktail) => (
                      <motion.div
                        key={cocktail.id}
                        variants={item}
                        className="group relative bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden hover:border-copper/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCocktail(cocktail)}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Cocktail Image */}
                          <div className="relative w-32 md:w-36 h-44 flex-shrink-0 overflow-hidden bg-gradient-to-br from-copper/5 to-cream/50 flex items-center justify-center p-4">
                            {getDishImage(cocktail.id) ? (
                              <img
                                src={getDishImage(cocktail.id)}
                                alt={cocktail.name}
                                className="w-auto h-full max-h-36 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <GlassWater className="w-12 h-12 text-copper/30" />
                              </div>
                            )}
                          </div>

                          {/* Cocktail Details */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                              <div>
                                <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-copper transition-colors">
                                  {cocktail.name}
                                </h3>
                                <p className="text-sm text-copper font-medium mt-1">
                                  {cocktail.shortDescription}
                                </p>
                              </div>
                            </div>

                            <p className="text-charcoal/70 text-sm leading-relaxed mb-4 line-clamp-3">
                              {cocktail.longDescription}
                            </p>

                            {/* Ingredients */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal/50">
                              <span className="px-2 py-1 bg-charcoal/5 rounded-full">
                                {cocktail.ingredientsText.split(',')[0].trim()}
                              </span>
                            </div>

                            {/* Selling Points */}
                            {cocktail.sellingPointsText && (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-xs text-charcoal/50 italic">
                                  {cocktail.sellingPointsText}
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
              Our bartenders are happy to customize any cocktail to your taste
            </p>
            <Button variant="outline" asChild className="border-copper text-copper hover:bg-copper hover:text-background">
              <Link to="/categories/cocktails">
                <GlassWater className="w-4 h-4 mr-2" />
                View Full Cocktail Category
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
      
      <BeverageSplashModal
        item={selectedCocktail}
        isOpen={!!selectedCocktail}
        onClose={() => setSelectedCocktail(null)}
        type="cocktail"
      />
    </Layout>
  );
}
