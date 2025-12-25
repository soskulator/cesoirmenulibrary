import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenList } from '@/components/AllergenBadge';
import { dailyFocus, getMenuItemById, getCategoryById, menuItems } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { Star, CreditCard, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get random focus items on refresh
  const getRandomFocusItems = useCallback(() => {
    const publishedItems = menuItems.filter(item => item.isPublished);
    const shuffled = [...publishedItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);
  
  const [customFocusItems, setCustomFocusItems] = useState<typeof menuItems | null>(null);
  
  const focusItems = customFocusItems || dailyFocus.menuItemIds
    .map(id => getMenuItemById(id))
    .filter(Boolean);

  const handleRefresh = () => {
    setCustomFocusItems(getRandomFocusItems());
    setRefreshKey(prev => prev + 1);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <Layout>
      <div className="container py-4 sm:py-6 md:py-8 max-w-4xl px-3 sm:px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                Today's Focus
              </h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRefresh}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-gold/20 active:scale-95 transition-transform"
                aria-label="Refresh daily focus items"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{today}</span>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <Card className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-r from-burgundy/5 to-gold/5 border-none">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <p className="text-center text-muted-foreground text-xs sm:text-sm">
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
          className="space-y-4 sm:space-y-6"
        >
          {focusItems.map((menuItem, index) => {
            const category = getCategoryById(menuItem!.categoryId);
            const dishImage = getDishImage(menuItem!.id);
            return (
              <motion.div key={menuItem!.id} variants={item}>
                <Card variant="elevated" className="overflow-hidden">
                  {/* Dish Image */}
                  {dishImage && (
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                      <img 
                        src={dishImage} 
                        alt={menuItem!.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                      <Badge variant="gold" className="absolute top-2 left-2 sm:top-4 sm:left-4 text-xs">
                        Focus #{index + 1}
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2 p-3 sm:p-4 md:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        {!dishImage && (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream-dark flex items-center justify-center shrink-0">
                            <span className="text-xl sm:text-2xl">{category?.icon || '🍽️'}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          {!dishImage && (
                            <Badge variant="gold" className="mb-1 text-xs">
                              Focus #{index + 1}
                            </Badge>
                          )}
                          <CardTitle className="text-lg sm:text-xl md:text-2xl truncate">
                            {menuItem!.name}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {category?.name} • {category?.nameFrench}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="burgundy-outline" 
                        size="sm" 
                        onClick={() => navigate(`/flashcards?item=${menuItem!.id}`)}
                        className="shrink-0 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      >
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Study</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
                    {/* Description */}
                    <div>
                      <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 sm:line-clamp-none">
                        {menuItem!.longDescription}
                      </p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
                      {/* Ingredients */}
                      <div className="p-2 sm:p-4 bg-muted/50 rounded-lg">
                        <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-burgundy mb-1 sm:mb-2">
                          Key Ingredients
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                          {menuItem!.ingredientsText}
                        </p>
                      </div>

                      {/* Selling Points */}
                      <div className="p-2 sm:p-4 bg-gold/5 rounded-lg">
                        <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-gold mb-1 sm:mb-2">
                          Selling Points
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                          {menuItem!.sellingPointsText}
                        </p>
                      </div>
                    </div>

                    {/* Allergens */}
                    {menuItem!.allergens.length > 0 && (
                      <div>
                        <h4 className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider text-destructive mb-1 sm:mb-2">
                          Contains Allergens
                        </h4>
                        <AllergenList allergens={menuItem!.allergens} />
                      </div>
                    )}

                    {/* Quick Quiz - hidden on mobile */}
                    {menuItem!.questions.length > 0 && (
                      <div className="pt-3 sm:pt-4 border-t border-border hidden sm:block">
                        <h4 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 sm:mb-3">
                          Quick Check: Can you answer these?
                        </h4>
                        <ul className="space-y-1 sm:space-y-2">
                          {menuItem!.questions.slice(0, 2).map((q) => (
                            <li key={q.id} className="flex items-start gap-2 text-xs sm:text-sm">
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-burgundy shrink-0" />
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
        <div className="mt-6 sm:mt-8 md:mt-10 text-center">
          <p className="text-muted-foreground mb-3 sm:mb-4 text-xs sm:text-sm">
            Ready to test your knowledge?
          </p>
          <div className="flex gap-2 sm:gap-4 justify-center">
            <Button 
              variant="burgundy" 
              size="sm"
              className="h-10 sm:h-11 px-4 sm:px-6 text-sm"
              onClick={() => navigate('/quiz')}
            >
              Start Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="h-10 sm:h-11 px-4 sm:px-6 text-sm"
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
