import { useState, useCallback, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenList } from '@/components/AllergenBadge';
import { getCategoryById, menuItems, MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { useDailyRotation } from '@/hooks/useDailyRotation';
import { DailyCocktailCard } from '@/components/DailyCocktailCard';
import { Star, CreditCard, Calendar, ArrowRight, RefreshCw, Utensils, Wine, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
  usePageTitle("Daily Focus");
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [savedFocusItems, setSavedFocusItems] = useState<MenuItem[]>([]);
  const [savedCocktail, setSavedCocktail] = useState<MenuItem | null>(null);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMinTimeElapsed(true), 300); return () => clearTimeout(t); }, []);
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Fetch saved focus items from database
  useEffect(() => {
    const fetchSavedFocus = async () => {
      try {
        setIsLoadingSaved(true);
        const { data, error } = await supabase
          .from('daily_focus_settings')
          .select('menu_item_ids, cocktail_id, notes')
          .eq('focus_date', today)
          .maybeSingle();

        if (error) throw error;

        if (data && data.menu_item_ids?.length > 0) {
          const items = data.menu_item_ids
            .map(id => menuItems.find(item => item.id === id))
            .filter((item): item is MenuItem => item !== undefined);
          setSavedFocusItems(items);
        }
        // If a cocktail_id is set, find it and override the auto-rotation
        if (data?.cocktail_id) {
          const cocktail = menuItems.find(i => i.id === data.cocktail_id);
          if (cocktail) setSavedCocktail(cocktail);
        }
      } catch (error) {
        console.error('Error fetching saved focus:', error);
      } finally {
        setIsLoadingSaved(false);
      }
    };

    fetchSavedFocus();
  }, [today]);
  
  // Get random focus items on manual refresh
  const getRandomFocusItems = useCallback(() => {
    const publishedItems = menuItems.filter(item => 
      item.isPublished && 
      item.categoryId !== 'cocktails' && 
      item.categoryId !== 'wine' && 
      item.categoryId !== 'spirits'
    );
    const shuffled = [...publishedItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);
  
  const [customFocusItems, setCustomFocusItems] = useState<typeof menuItems | null>(null);
  
  // Use automatic daily rotation as fallback
  const { foodItems: dailyFoodItems, cocktailOfTheDay, dateString } = useDailyRotation(5, 1);
  
  // Priority: saved focus items > custom items > daily rotation
  const focusItems = savedFocusItems.length > 0 
    ? savedFocusItems 
    : customFocusItems || dailyFoodItems;

  const handleRefresh = () => {
    setCustomFocusItems(getRandomFocusItems());
    setRefreshKey(prev => prev + 1);
  };

  if (isLoadingSaved || !minTimeElapsed) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl px-4">
          <LoadingSpinner message="Loading today's focus..." />
        </div>
      </Layout>
    );
  }

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
              <span>{dateString}</span>
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

        {/* Cocktail of the Day Section */}
        {(savedCocktail || cocktailOfTheDay) && (
          <div className="mt-8 sm:mt-10 md:mt-12">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Wine className="w-5 h-5 sm:w-6 sm:h-6 text-copper" />
              <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold">Cocktail of the Day</h2>
            </div>
            <DailyCocktailCard cocktail={(savedCocktail || cocktailOfTheDay)!} dateString={dateString} />
          </div>
        )}

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
              Start Test
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
