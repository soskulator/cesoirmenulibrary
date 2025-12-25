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
  ChefHat
} from 'lucide-react';
import { categories, menuItems, dailyFocus, getMenuItemById } from '@/data/menuData';

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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-burgundy/5 via-transparent to-gold/5" />
        <div className="container py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="gold" className="mb-4">
              <ChefHat className="w-3 h-3 mr-1" />
              Staff Training Portal
            </Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
              Bienvenue to{' '}
              <span className="text-burgundy">Ce Soir</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Master the menu, delight the guests. Your comprehensive guide to every dish, 
              ingredient, and story behind our French bistro cuisine.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="burgundy" size="lg" asChild>
                <Link to="/flashcards">
                  Start Training
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="burgundy-outline" size="lg" asChild>
                <Link to="/categories">
                  Browse Menu
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
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
