import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenList } from '@/components/AllergenBadge';
import { categories, menuItems, getMenuItemsByCategory, getCategoryById } from '@/data/menuData';
import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
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
          <div className="container py-12 text-center">
            <h1 className="font-serif text-2xl">Category not found</h1>
            <Button variant="link" asChild className="mt-4">
              <Link to="/categories">Back to categories</Link>
            </Button>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="container py-8">
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link to="/categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Categories
            </Link>
          </Button>

          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-5xl">{category.icon}</span>
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold">
                  {category.name}
                </h1>
                <p className="text-lg text-muted-foreground italic">
                  {category.nameFrench}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Badge variant="secondary">{items.length} items</Badge>
              <Button variant="burgundy" size="sm" asChild>
                <Link to={`/flashcards?category=${categoryId}`}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Study Flashcards
                </Link>
              </Button>
            </div>
          </div>

          {/* Menu Items Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {items.map((menuItem) => (
              <motion.div key={menuItem.id} variants={item}>
                <Link to={`/flashcards?item=${menuItem.id}`}>
                  <Card className="group h-full hover:shadow-card-hover transition-all hover:-translate-y-1">
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center shrink-0">
                          <span className="text-2xl">🍽️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold group-hover:text-burgundy transition-colors truncate">
                            {menuItem.name}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {menuItem.shortDescription}
                          </p>
                          {menuItem.allergens.length > 0 && (
                            <AllergenList 
                              allergens={menuItem.allergens} 
                              size="sm" 
                              showIcons={false}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Layout>
    );
  }

  // Show all categories
  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Menu Categories
          </h1>
          <p className="text-muted-foreground">
            Explore our menu by category
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category) => {
            const itemCount = menuItems.filter(i => i.categoryId === category.id && i.isPublished).length;
            return (
              <motion.div key={category.id} variants={item}>
                <Link to={`/categories/${category.id}`}>
                  <Card className="group h-full hover:shadow-card-hover transition-all hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <span className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                          {category.icon}
                        </span>
                        <h2 className="font-serif text-2xl font-semibold group-hover:text-burgundy transition-colors">
                          {category.name}
                        </h2>
                        <p className="text-muted-foreground italic mb-3">
                          {category.nameFrench}
                        </p>
                        <Badge variant="secondary">
                          {itemCount} items
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View Items
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </Layout>
  );
}
