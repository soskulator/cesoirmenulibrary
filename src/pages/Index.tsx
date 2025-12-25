import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  CreditCard, 
  HelpCircle, 
  Star, 
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  MapPin
} from 'lucide-react';
import { categories, menuItems, dailyFocus, getMenuItemById } from '@/data/menuData';
import bayfrontSketch from '@/assets/bayfront-sketch.jpg';
import logoImage from '@/assets/cesoir-logo.png';
import { OpenTableLogo } from '@/components/OpenTableLogo';

const features = [
  {
    icon: Layers,
    title: 'Browse Menu',
    description: 'Explore all categories and menu items',
    path: '/categories',
  },
  {
    icon: CreditCard,
    title: 'Flashcards',
    description: 'Study with interactive flip cards',
    path: '/flashcards',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Mode',
    description: 'Test your knowledge',
    path: '/quiz',
  },
  {
    icon: AlertTriangle,
    title: 'Allergy Check',
    description: 'Quick allergen reference',
    path: '/allergy-check',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  },
};

export default function Index() {
  const focusItems = dailyFocus.menuItemIds
    .map(id => getMenuItemById(id))
    .filter(Boolean);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.1]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* Hero Section - Full Screen Minimalist */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-charcoal">
        {/* Sketch background image with opacity */}
        <div className="absolute inset-0">
          <img 
            src={bayfrontSketch} 
            alt="Bayfront Place Naples Sketch" 
            className="w-full h-full object-cover opacity-20"
          />
          {/* Copper tint overlay */}
          <div className="absolute inset-0 bg-copper/15 mix-blend-overlay" />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-copper/5 to-charcoal/70" />
        </div>
        
        {/* Animated Pulsing Vignette */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse at center, transparent 0%, transparent 35%, hsl(30 15% 12% / 0.7) 100%)',
              'radial-gradient(ellipse at center, transparent 0%, transparent 45%, hsl(30 15% 12% / 0.85) 100%)',
              'radial-gradient(ellipse at center, transparent 0%, transparent 35%, hsl(30 15% 12% / 0.7) 100%)',
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main Content */}
        <motion.div 
          className="relative z-10 text-center px-6"
          style={{ opacity: heroOpacity }}
        >
          <motion.p 
            className="text-cream/80 text-lg md:text-xl font-light tracking-[0.3em] uppercase mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-10"
          >
            <img 
              src={logoImage} 
              alt="Ce Soir" 
              className="h-24 md:h-32 lg:h-40 mx-auto drop-shadow-2xl"
            />
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center gap-2 text-cream/50 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm tracking-widest uppercase">Naples, Florida</span>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-copper hover:bg-copper-light text-charcoal font-semibold px-8 py-6 text-base tracking-wide shadow-lg"
              asChild
            >
              <Link to="/flashcards">
                Start Training
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="hero-outline"
              className="px-8 py-6 text-base tracking-wide"
              asChild
            >
              <Link to="/categories">
                Explore Menu
              </Link>
            </Button>
          </motion.div>
          
          {/* OpenTable Reviews Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-8"
          >
            <a 
              href="https://www.opentable.com/r/ce-soir-naples" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-cream/60 hover:text-cream transition-colors group"
            >
              <OpenTableLogo className="w-6 h-6" />
              <span className="text-sm tracking-wide">View Reviews</span>
            </a>
          </motion.div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cream/40 hover:text-cream/80 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ 
            opacity: { delay: 2 },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }}
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* Quick Actions - Minimal Grid */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Staff Training Portal
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Master the menu, delight the guests.
            </p>
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div key={feature.path} variants={item}>
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Daily Focus - Clean Cards */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-copper" />
                <Badge className="bg-copper/10 text-copper border-0">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </Badge>
              </div>
              <h2 className="font-serif text-3xl font-semibold">Today's Focus</h2>
            </div>
            <Button variant="ghost" className="text-copper hover:text-copper-light" asChild>
              <Link to="/daily-focus">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div 
            className="grid gap-6 md:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {focusItems.map((menuItem) => (
              <motion.div key={menuItem!.id} variants={item}>
                <Card className="group border-0 bg-card hover:shadow-elevated transition-all duration-500">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                      {menuItem!.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {menuItem!.shortDescription}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <h2 className="font-serif text-3xl font-semibold">Menu Categories</h2>
            <Button variant="ghost" className="text-copper hover:text-copper-light" asChild>
              <Link to="/categories">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
          >
            {categories.slice(0, 3).map((category) => {
              const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
              return (
                <motion.div key={category.id} variants={item}>
                  <Link to={`/categories/${category.id}`}>
                    <Card className="group border-0 bg-card/50 hover:bg-card hover:shadow-elevated transition-all duration-500">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                          <span className="text-5xl">{category.icon}</span>
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
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
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
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Quiz Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
