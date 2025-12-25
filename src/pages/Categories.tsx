import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { AllergenList } from '@/components/AllergenBadge';
import { categories, menuItems, getMenuItemsByCategory, getCategoryById } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { getCategoryIcon } from '@/data/categoryIcons';
import { ArrowLeft, CreditCard, ChevronRight } from 'lucide-react';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  },
};

export default function CategoriesPage() {
  const { categoryId } = useParams();

  // Show single category if specified
  if (categoryId) {
    const category = getCategoryById(categoryId);
    const items = getMenuItemsByCategory(categoryId);

    if (!category) {
      return (
        <Layout>
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <span className="text-6xl mb-4">🍽️</span>
            <h1 className="font-serif text-2xl text-charcoal mb-2">Category not found</h1>
            <Button variant="link" asChild className="text-copper">
              <Link to="/categories">Back to categories</Link>
            </Button>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        {/* Background */}
        <div className="fixed inset-0 -z-10 bg-cream">
          <img 
            src={bayfrontSketch} 
            alt="" 
            className="w-full h-full object-cover opacity-[0.08]"
          />
        </div>

        <div className="min-h-screen">
          {/* Elegant Header */}
          <motion.header 
            className="pt-6 pb-12 px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-4xl mx-auto">
              <Link 
                to="/categories" 
                className="inline-flex items-center gap-2 text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm tracking-wide uppercase">All Categories</span>
              </Link>

              <div className="flex items-start gap-6">
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 shrink-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  {getCategoryIcon(category.id) ? (
                    <img 
                      src={getCategoryIcon(category.id)} 
                      alt={category.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-6xl md:text-7xl">{category.icon}</span>
                  )}
                </motion.div>
                <div className="flex-1">
                  <h1 className="font-serif text-3xl md:text-5xl font-bold text-charcoal tracking-tight">
                    {category.name}
                  </h1>
                  <p className="text-xl md:text-2xl text-charcoal/50 font-serif italic mt-1">
                    {category.nameFrench}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="text-sm text-charcoal/60 tracking-wide">
                      {items.length} dishes
                    </span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/30" />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="text-copper hover:text-copper-light hover:bg-copper/5 -ml-2"
                    >
                      <Link to={`/flashcards?category=${categoryId}`}>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Study Flashcards
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Menu Items - Clean List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="px-6 pb-24"
          >
            <div className="max-w-4xl mx-auto space-y-3">
              {items.map((menuItem) => {
                const dishImage = getDishImage(menuItem.id);
                return (
                  <motion.div key={menuItem.id} variants={item}>
                    <Link 
                      to={`/flashcards?item=${menuItem.id}`}
                      className="group block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-charcoal/5 hover:bg-white hover:shadow-lg hover:border-charcoal/10 transition-all duration-300">
                        {/* Image */}
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0 bg-cream">
                          {dishImage ? (
                            <img 
                              src={dishImage} 
                              alt={menuItem.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🍽️
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg md:text-xl font-semibold text-charcoal group-hover:text-copper transition-colors">
                            {menuItem.name}
                          </h3>
                          <p className="text-sm text-charcoal/60 line-clamp-1 mt-0.5">
                            {menuItem.shortDescription}
                          </p>
                          {menuItem.allergens.length > 0 && (
                            <div className="mt-2">
                              <AllergenList 
                                allergens={menuItem.allergens} 
                                size="sm" 
                                showIcons={false}
                              />
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-charcoal/20 group-hover:text-copper group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Show all categories - Artistic Grid
  return (
    <Layout>
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-cream">
        <img 
          src={bayfrontSketch} 
          alt="" 
          className="w-full h-full object-cover opacity-[0.08]"
        />
      </div>

      <div className="min-h-screen">
        {/* Minimal Header */}
        <motion.header 
          className="pt-12 md:pt-20 pb-12 px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-charcoal tracking-tight">
            The Menu
          </h1>
          <p className="text-charcoal/50 mt-3 text-lg font-serif italic">
            Explore our culinary categories
          </p>
        </motion.header>

        {/* Categories Grid - Artistic Layout */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="px-6 pb-24"
        >
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => {
              const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
              const isLarge = index === 0 || index === 5;
              
              return (
                <motion.div 
                  key={category.id} 
                  variants={item}
                  className={isLarge ? 'col-span-2 md:col-span-1' : ''}
                >
                  <Link 
                    to={`/categories/${category.id}`}
                    className="group block h-full"
                  >
                    <div className={`
                      relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-sm 
                      border border-charcoal/5 hover:border-charcoal/10
                      hover:bg-white hover:shadow-xl
                      transition-all duration-500
                      ${isLarge ? 'p-8 md:p-10' : 'p-6 md:p-8'}
                    `}>
                      {/* Icon */}
                      <motion.div 
                        className={`
                          mb-4 
                          ${isLarge ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12 md:w-14 md:h-14'}
                          group-hover:scale-110 transition-transform duration-500
                        `}
                      >
                        {getCategoryIcon(category.id) ? (
                          <img 
                            src={getCategoryIcon(category.id)} 
                            alt={category.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className={`block ${isLarge ? 'text-6xl md:text-7xl' : 'text-4xl md:text-5xl'}`}>
                            {category.icon}
                          </span>
                        )}
                      </motion.div>

                      {/* Text */}
                      <h2 className={`
                        font-serif font-bold text-charcoal group-hover:text-copper transition-colors duration-300
                        ${isLarge ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'}
                      `}>
                        {category.name}
                      </h2>
                      <p className="text-charcoal/40 font-serif italic mt-1 text-sm md:text-base">
                        {category.nameFrench}
                      </p>

                      {/* Count */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs text-charcoal/50 tracking-widest uppercase">
                          {itemCount} dishes
                        </span>
                        <ChevronRight className="w-4 h-4 text-charcoal/20 group-hover:text-copper group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Decorative Corner */}
                      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-copper/5 group-hover:bg-copper/10 transition-colors duration-500" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
