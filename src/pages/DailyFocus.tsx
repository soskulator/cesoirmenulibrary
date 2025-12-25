import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenList } from '@/components/AllergenBadge';
import { dailyFocus, getMenuItemById, getCategoryById } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { Star, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DailyFocusPage() {
  const navigate = useNavigate();
  const focusItems = dailyFocus.menuItemIds
    .map(id => getMenuItemById(id))
    .filter(Boolean);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Today's Focus
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{today}</span>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <Card className="mb-8 bg-gradient-to-r from-burgundy/5 to-gold/5 border-none">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              These are today's featured items. Make sure you can confidently describe each dish, 
              its ingredients, allergens, and key selling points before your shift.
            </p>
          </CardContent>
        </Card>

        {/* Focus Items */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {focusItems.map((menuItem, index) => {
            const category = getCategoryById(menuItem!.categoryId);
            const dishImage = getDishImage(menuItem!.id);
            return (
              <motion.div key={menuItem!.id} variants={item}>
                <Card variant="elevated" className="overflow-hidden">
                  {/* Dish Image */}
                  {dishImage && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={dishImage} 
                        alt={menuItem!.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                      <Badge variant="gold" className="absolute top-4 left-4">
                        Focus #{index + 1}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {!dishImage && (
                          <div className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center">
                            <span className="text-2xl">{category?.icon || '🍽️'}</span>
                          </div>
                        )}
                        <div>
                          {!dishImage && (
                            <Badge variant="gold" className="mb-1">
                              Focus #{index + 1}
                            </Badge>
                          )}
                          <CardTitle className="text-2xl">
                            {menuItem!.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {category?.name} • {category?.nameFrench}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="burgundy-outline" 
                        size="sm" 
                        onClick={() => navigate(`/flashcards?item=${menuItem!.id}`)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Study
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Description */}
                    <div>
                      <p className="text-muted-foreground">
                        {menuItem!.longDescription}
                      </p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Ingredients */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-burgundy mb-2">
                          Key Ingredients
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {menuItem!.ingredientsText}
                        </p>
                      </div>

                      {/* Selling Points */}
                      <div className="p-4 bg-gold/5 rounded-lg">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-2">
                          Selling Points
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {menuItem!.sellingPointsText}
                        </p>
                      </div>
                    </div>

                    {/* Allergens */}
                    {menuItem!.allergens.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-destructive mb-2">
                          Contains Allergens
                        </h4>
                        <AllergenList allergens={menuItem!.allergens} />
                      </div>
                    )}

                    {/* Quick Quiz */}
                    {menuItem!.questions.length > 0 && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Quick Check: Can you answer these?
                        </h4>
                        <ul className="space-y-2">
                          {menuItem!.questions.slice(0, 2).map((q) => (
                            <li key={q.id} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 mt-0.5 text-burgundy shrink-0" />
                              <span className="text-muted-foreground">{q.prompt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Actions */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to test your knowledge?
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              variant="burgundy" 
              size="lg" 
              onClick={() => navigate('/quiz')}
            >
              Start Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/flashcards')}
            >
              Study All Cards
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
