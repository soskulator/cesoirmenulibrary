import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, CreditCard, HelpCircle, Star, AlertTriangle, ArrowRight, ArrowDown, MapPin, LogIn, BookOpen, Brain, Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { categories, menuItems, getCategoryById } from '@/data/menuData';
import { getCategoryIcon } from '@/data/categoryIcons';
import { useDailyRotation } from '@/hooks/useDailyRotation';
import { DailyCocktailCard } from '@/components/DailyCocktailCard';
import { getDishImage } from '@/data/dishImages';
import bayfrontSketch from '@/assets/bayfront-fountain-sketch.jpg';
import logoImage from '@/assets/cesoir-logo.png';
const features = [{
  icon: Layers,
  title: 'Browse Menu',
  description: 'Explore all categories and menu items',
  path: '/categories'
}, {
  icon: CreditCard,
  title: 'Flashcards',
  description: 'Study with interactive flip cards',
  path: '/flashcards'
}, {
  icon: HelpCircle,
  title: 'Test Mode',
  description: 'Test your knowledge',
  path: '/quiz'
}, {
  icon: AlertTriangle,
  title: 'Allergy Check',
  description: 'Quick allergen reference',
  path: '/allergy-check'
}];
const container = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};
const item = {
  hidden: {
    opacity: 0,
    y: 30
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};
export default function Index() {
  const {
    user
  } = useAuth();
  const [showTrainingOptions, setShowTrainingOptions] = useState(false);
  
  // Use automatic daily rotation instead of manual selection
  const { foodItems, cocktailOfTheDay, dateString } = useDailyRotation(3, 1);
  
  const {
    scrollY
  } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.85,
      behavior: 'smooth'
    });
  };
  return <Layout>
      {/* Hero Section - Full Screen with White Sketch */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-cream">
        {/* Sketch background image */}
        <div className="absolute inset-0">
          <img 
            src={bayfrontSketch} 
            alt="Bayfront Place Naples Sketch" 
            className="w-full h-full object-cover opacity-20"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1280}
          />
          {/* Subtle gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/30 via-transparent to-cream/40" />
        </div>
        
        <motion.div className="relative z-10 text-center px-6" style={{
        opacity: heroOpacity
      }}>
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 1,
          delay: 0.3
        }} className="mb-6">
            <img src={logoImage} alt="Ce Soir" className="h-32 md:h-36 lg:h-44 w-auto mx-auto drop-shadow-lg" width={530} height={176} decoding="async" />
          </motion.div>
          
          <motion.p className="text-charcoal text-2xl md:text-3xl lg:text-4xl font-serif font-semibold tracking-wide mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.6
        }}>
            Menu Library
          </motion.p>
          
          <motion.div className="flex items-center justify-center gap-2 text-charcoal mb-12" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.8,
          duration: 0.6
        }}>
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-widest uppercase">Naples, Florida</span>
          </motion.div>
          
          <motion.div className="flex flex-col items-center gap-4 justify-center" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 1,
          duration: 0.6
        }}>
            {/* Start Training Button with expanding options */}
            <div className="relative flex flex-col items-center">
              <AnimatePresence>
                {showTrainingOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-3 mb-4"
                  >
                    <Button 
                      size="lg" 
                      className="bg-charcoal text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-charcoal-light hover:shadow-xl transition-all duration-300 group" 
                      asChild
                    >
                      <Link to="/categories">
                        <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Flashcards
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-copper text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-copper-light hover:shadow-xl transition-all duration-300 group" 
                      asChild
                    >
                      <Link to="/quiz">
                        <Brain className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Take Test
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      className="bg-sage text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-sage/80 hover:shadow-xl transition-all duration-300 group" 
                      asChild
                    >
                      <Link to="/allergy">
                        <AlertTriangle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Allergy Center
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button 
                size="lg" 
                className="bg-charcoal text-white font-semibold px-10 py-6 text-base tracking-wide shadow-lg hover:bg-charcoal-light hover:shadow-xl transition-all duration-300"
                onClick={() => setShowTrainingOptions(!showTrainingOptions)}
              >
                {showTrainingOptions ? 'Choose an Option' : 'Start Training'}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-copper text-white font-semibold px-10 py-6 text-base tracking-wide shadow-lg hover:bg-copper-light hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/categories">
                  Explore Menu
                </Link>
              </Button>
              {!user && <Button size="lg" className="bg-white text-charcoal border border-charcoal/20 font-semibold px-10 py-6 text-base tracking-wide shadow-lg hover:bg-cream hover:shadow-xl transition-all duration-300" asChild>
                  <Link to="/auth">
                    <LogIn className="w-5 h-5 mr-2" />
                    Login
                  </Link>
                </Button>}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.button onClick={scrollToContent} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-charcoal/40 hover:text-charcoal/80 transition-colors cursor-pointer" initial={{
        opacity: 0
      }} animate={{
        opacity: 1,
        y: [0, 8, 0]
      }} transition={{
        opacity: {
          delay: 2
        },
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }}>
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* Quick Actions - Minimal Grid */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.8
        }} className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Staff Training Portal
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Master the menu, create positive memories.</p>
          </motion.div>
          
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: "-50px"
        }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(feature => <motion.div key={feature.path} variants={item}>
                <Link to={feature.path}>
                  <Card className="group h-full border-0 bg-card/50 hover:bg-card transition-all duration-500 hover:shadow-elevated">
                    <CardContent className="p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-copper/10 text-copper flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-copper group-hover:text-charcoal transition-all duration-500">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Cocktail of the Day - Featured Section */}
      {cocktailOfTheDay && (
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <h2 className="font-serif text-3xl font-semibold text-center mb-2">Featured Cocktail</h2>
              <p className="text-muted-foreground text-center">Master today's spotlight drink</p>
            </motion.div>
            
            <DailyCocktailCard cocktail={cocktailOfTheDay} dateString={dateString} />
          </div>
        </section>
      )}

      {/* Daily Food Focus - Clean Cards */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.8
        }} className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="w-5 h-5 text-copper" />
                <Badge className="bg-copper/10 text-copper border-0">
                  {new Date().toLocaleDateString('en-US', {
                  weekday: 'long'
                })}
                </Badge>
              </div>
              <h2 className="font-serif text-3xl font-semibold">Today's Food Focus</h2>
              <p className="text-muted-foreground text-sm mt-1">Daily rotating dishes to study</p>
            </div>
            <Button variant="ghost" className="text-copper hover:text-copper-light" asChild>
              <Link to="/daily-focus">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div className="grid gap-6 md:grid-cols-3" variants={container} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: "-50px"
        }}>
            {foodItems.map(menuItem => {
              const category = getCategoryById(menuItem.categoryId);
              const image = getDishImage(menuItem.id);
              return (
                <motion.div key={menuItem.id} variants={item}>
                  <Card className="group border-0 bg-card hover:shadow-elevated transition-all duration-500 overflow-hidden">
                    {image && (
                      <div className="relative h-40 overflow-hidden">
                        <img 
                          src={image} 
                          alt={menuItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                          width={418}
                          height={160}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-copper/90 text-charcoal text-xs">
                          {category?.name || 'Menu Item'}
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                        {menuItem.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {menuItem.shortDescription}
                      </p>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2">
                        {menuItem.ingredientsText}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.8
        }} className="flex items-center justify-between mb-12">
            <h2 className="font-serif text-3xl font-semibold">Menu Categories</h2>
            <Button variant="ghost" className="text-copper hover:text-copper-light" asChild>
              <Link to="/categories">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" variants={container} initial="hidden" whileInView="show" viewport={{
          once: true,
          margin: "-50px"
        }}>
          {categories.slice(0, 3).map(category => {
            const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
            const categoryIcon = getCategoryIcon(category.id);
            return <motion.div key={category.id} variants={item}>
                  <Link to={`/categories/${category.id}`}>
                    <Card className="group border-0 bg-card/50 hover:bg-card hover:shadow-elevated transition-all duration-500 overflow-hidden relative">
                      {/* Background icon */}
                      {categoryIcon && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <img src={categoryIcon} alt="" className="w-full h-full object-cover opacity-10 group-hover:opacity-15 group-hover:scale-110 transition-all duration-500 drop-shadow-sm" loading="lazy" decoding="async" width={418} height={148} />
                          {/* Gradient overlay for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
                        </div>}
                      <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-6">
                          {categoryIcon ? <img src={categoryIcon} alt={category.name} className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" loading="lazy" decoding="async" width={56} height={56} /> : <span className="text-5xl">{category.icon}</span>}
                          <div>
                            <h3 className="font-serif text-2xl font-semibold group-hover:text-copper transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground italic mb-2">
                              {category.nameFrench}
                            </p>
                            <Badge variant="secondary" className="bg-muted">
                              {itemCount} items
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>;
          })}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: "-100px"
        }} transition={{
          duration: 0.8
        }}>
            <Card className="border-0 bg-gradient-to-r from-charcoal to-charcoal-light text-cream overflow-hidden">
              <CardContent className="p-12">
                <div className="grid gap-8 md:grid-cols-4 text-center">
                  <div>
                    <p className="text-5xl font-serif font-bold text-copper">{menuItems.length}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Menu Items</p>
                  </div>
                  <div>
                    <p className="text-5xl font-serif font-bold text-copper">{categories.length}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Categories</p>
                  </div>
                  <div>
                    <p className="text-5xl font-serif font-bold text-copper">10+</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Allergens Tracked</p>
                  </div>
                  <div>
                    <p className="text-5xl font-serif font-bold text-copper">27</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Test Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>;
}