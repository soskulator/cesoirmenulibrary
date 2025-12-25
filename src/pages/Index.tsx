import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ChefHat,
  MapPin
} from 'lucide-react';
import { categories, menuItems, dailyFocus, getMenuItemById } from '@/data/menuData';
import bayfrontImage from '@/assets/bayfront-naples.jpg';

const features = [
  {
    icon: Layers,
    title: 'Browse Menu',
    description: 'Explore all categories and menu items',
    path: '/categories',
    color: 'bg-burgundy/10 text-burgundy',
  },
  {
    icon: CreditCard,
    title: 'Flashcards',
    description: 'Study with interactive flip cards',
    path: '/flashcards',
    color: 'bg-gold/10 text-gold',
  },
  {
    icon: HelpCircle,
    title: 'Quiz Mode',
    description: 'Test your knowledge',
    path: '/quiz',
    color: 'bg-sage/10 text-sage',
  },
  {
    icon: AlertTriangle,
    title: 'Allergy Check',
    description: 'Quick allergen reference',
    path: '/allergy-check',
    color: 'bg-destructive/10 text-destructive',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Index() {
  const focusItems = dailyFocus.menuItemIds
    .map(id => getMenuItemById(id))
    .filter(Boolean);

  return (
    <Layout>
      {/* Hero Section with Bayfront Naples */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay Effects */}
        <div className="absolute inset-0">
          <img 
            src={bayfrontImage} 
            alt="Bayfront Place Naples" 
            className="w-full h-full object-cover"
          />
          {/* Dark overlay with gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal/90" />
          {/* Copper/Rose-gold accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-copper/20 via-transparent to-rose-gold/10" />
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 bg-texture opacity-30" />
        </div>
        
        <div className="container relative z-10 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Badge className="mb-6 bg-copper/20 text-cream border-copper/40 backdrop-blur-sm">
                <ChefHat className="w-3 h-3 mr-1" />
                Staff Training Portal
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-cream mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Welcome to{' '}
              <span className="text-gradient-gold">Ce Soir</span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-cream/80 mb-4 font-light tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Master the menu, delight the guests. Your comprehensive guide to every dish, 
              ingredient, and story behind our French bistro cuisine.
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center gap-2 text-cream/60 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <MapPin className="w-4 h-4 text-copper" />
              <span className="text-sm tracking-wider">492 Bayfront Pl, 3402 · Naples, Florida</span>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-copper hover:bg-copper-light text-charcoal font-semibold shadow-lg hover:shadow-xl transition-all"
                asChild
              >
                <Link to="/flashcards">
                  Start Training
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-cream/30 text-cream hover:bg-cream/10 backdrop-blur-sm"
                asChild
              >
                <Link to="/categories">
                  Browse Menu
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom fade to blend with next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Daily Focus */}
      <section className="container py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-gold" />
            <h2 className="font-serif text-2xl font-semibold">Today's Focus</h2>
            <Badge variant="gold" className="ml-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {focusItems.map((menuItem) => (
              <Card key={menuItem!.id} className="group hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold truncate">
                        {menuItem!.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {menuItem!.shortDescription}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="link" asChild>
              <Link to="/daily-focus">
                View all focus items
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="container py-12">
        <h2 className="font-serif text-2xl font-semibold mb-6">Quick Actions</h2>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div key={feature.path} variants={item}>
              <Link to={feature.path}>
                <Card className="group h-full hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold mb-1">
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
      </section>

      {/* Categories Preview */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold">Menu Categories</h2>
          <Button variant="link" asChild>
            <Link to="/categories">
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 3).map((category) => {
            const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
            return (
              <Link key={category.id} to={`/categories/${category.id}`}>
                <Card className="group hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{category.icon}</span>
                      <div>
                        <h3 className="font-serif text-xl font-semibold group-hover:text-burgundy transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground italic">
                          {category.nameFrench}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {itemCount} items
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="container py-12">
        <Card className="bg-gradient-to-r from-burgundy to-burgundy-light text-primary-foreground overflow-hidden">
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-4 text-center">
              <div>
                <p className="text-4xl font-serif font-bold">{menuItems.length}</p>
                <p className="text-sm opacity-80">Menu Items</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold">{categories.length}</p>
                <p className="text-sm opacity-80">Categories</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold">10+</p>
                <p className="text-sm opacity-80">Allergens Tracked</p>
              </div>
              <div>
                <p className="text-4xl font-serif font-bold">27</p>
                <p className="text-sm opacity-80">Quiz Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
}
