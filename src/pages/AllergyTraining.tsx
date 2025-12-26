import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ChefHat,
  Utensils,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AllergenType, getAllergenById, menuItems, categories } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';

// Training dish data structure
interface TrainingIngredient {
  id: string;
  name: string;
  allergens: AllergenType[];
  removable: boolean;
}

interface TrainingDish {
  id: string;
  name: string;
  image: string;
  description: string;
  categoryId: string;
  ingredients: TrainingIngredient[];
}

// Parse ingredients from ingredientsText and map allergens
const parseIngredients = (ingredientsText: string, allergens: AllergenType[]): TrainingIngredient[] => {
  const ingredientNames = ingredientsText.split(',').map(i => i.trim()).filter(Boolean);
  
  // Simple heuristic: distribute allergens based on ingredient keywords
  const allergenKeywords: Record<AllergenType, string[]> = {
    gluten: ['bread', 'crouton', 'pasta', 'flour', 'bun', 'brioche', 'puff', 'panko', 'baguette', 'crostini', 'tempura', 'spaghetti', 'ravioli', 'gnocchi'],
    dairy: ['butter', 'cream', 'cheese', 'parmesan', 'gruyère', 'burrata', 'beurre', 'mascarpone', 'crème', 'milk'],
    egg: ['egg', 'aioli', 'mayo', 'mayonnaise', 'hollandaise', 'béarnaise'],
    nuts: ['almond', 'hazelnut', 'pistachio', 'walnut', 'pine nut', 'pecan', 'cashew'],
    shellfish: ['lobster', 'shrimp', 'scallop', 'crab', 'mussel', 'clam', 'oyster', 'octopus'],
    fish: ['salmon', 'tuna', 'anchovy', 'branzino', 'bass', 'sole', 'fish'],
    soy: ['soy', 'miso', 'tofu', 'edamame'],
    sesame: ['sesame', 'tahini'],
    allium: ['onion', 'garlic', 'shallot', 'leek', 'chive', 'scallion'],
    nightshade: ['tomato', 'pepper', 'potato', 'eggplant', 'paprika', 'chili']
  };

  return ingredientNames.map((name, index) => {
    const lowerName = name.toLowerCase();
    const ingredientAllergens: AllergenType[] = [];
    
    // Check which allergens this ingredient might contain
    allergens.forEach(allergen => {
      const keywords = allergenKeywords[allergen] || [];
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        ingredientAllergens.push(allergen);
      }
    });
    
    // Determine if removable (main proteins are typically not removable)
    const isMainProtein = ['beef', 'chicken', 'duck', 'lamb', 'pork', 'salmon', 'tuna', 'scallop', 'lobster', 'octopus', 'branzino', 'sole', 'bass', 'foie gras'].some(p => lowerName.includes(p));
    const isBaseItem = index === 0 || lowerName.includes('base') || isMainProtein;
    
    return {
      id: `ing-${index}`,
      name: name,
      allergens: ingredientAllergens,
      removable: !isBaseItem
    };
  });
};

// Convert menu items to training dishes (excluding beverages)
const foodCategories = ['appetizers', 'entrees', 'desserts', 'sides', 'specials'];
const trainingDishes: TrainingDish[] = menuItems
  .filter(item => foodCategories.includes(item.categoryId) && item.isPublished)
  .map(item => ({
    id: item.id,
    name: item.name,
    image: getDishImage(item.id) || '/placeholder.svg',
    description: item.shortDescription,
    categoryId: item.categoryId,
    ingredients: parseIngredients(item.ingredientsText, item.allergens)
  }));

// Allergen icon component
const AllergenIcon = ({ allergenId, size = 'md' }: { allergenId: AllergenType; size?: 'sm' | 'md' }) => {
  const allergen = getAllergenById(allergenId);
  if (!allergen) return null;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-destructive/10 text-destructive",
        size === 'sm' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'
      )}
      title={allergen.name}
    >
      {allergen.icon}
    </span>
  );
};

export default function AllergyTrainingPage() {
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [omittedIngredients, setOmittedIngredients] = useState<Set<string>>(new Set());
  const [previousAllergens, setPreviousAllergens] = useState<Set<AllergenType>>(new Set());

  const selectedDish = useMemo(() => 
    trainingDishes.find(d => d.id === selectedDishId) || null, 
    [selectedDishId]
  );

  // Get available categories from dishes
  const availableCategories = useMemo(() => {
    const cats = new Set(trainingDishes.map(d => d.categoryId));
    return categories.filter(c => cats.has(c.id));
  }, []);

  // Filter dishes based on search and category
  const filteredDishes = useMemo(() => {
    let dishes = trainingDishes;
    
    if (selectedCategory !== 'all') {
      dishes = dishes.filter(dish => dish.categoryId === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      dishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query) ||
        dish.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }
    
    return dishes;
  }, [searchQuery, selectedCategory]);

  // Calculate current allergens based on active ingredients
  const currentAllergens = useMemo(() => {
    if (!selectedDish) return new Set<AllergenType>();
    
    const activeAllergens = new Set<AllergenType>();
    selectedDish.ingredients.forEach(ingredient => {
      if (!omittedIngredients.has(ingredient.id)) {
        ingredient.allergens.forEach(allergen => activeAllergens.add(allergen));
      }
    });
    return activeAllergens;
  }, [selectedDish, omittedIngredients]);

  // Calculate safe allergens (allergens NOT present in dish)
  const safeAllergens = useMemo(() => {
    const allAllergenTypes: AllergenType[] = ['gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'fish', 'soy', 'sesame', 'allium', 'nightshade'];
    return allAllergenTypes.filter(a => !currentAllergens.has(a));
  }, [currentAllergens]);

  // Handle dish selection
  const handleSelectDish = (dishId: string) => {
    setSelectedDishId(dishId);
    setOmittedIngredients(new Set());
    
    // Set initial allergens for this dish
    const dish = trainingDishes.find(d => d.id === dishId);
    if (dish) {
      const initialAllergens = new Set<AllergenType>();
      dish.ingredients.forEach(ing => {
        ing.allergens.forEach(a => initialAllergens.add(a));
      });
      setPreviousAllergens(initialAllergens);
    }
  };

  // Handle ingredient toggle
  const handleToggleIngredient = (ingredientId: string, ingredient: TrainingIngredient) => {
    const wasOmitted = omittedIngredients.has(ingredientId);
    
    setOmittedIngredients(prev => {
      const newSet = new Set(prev);
      if (wasOmitted) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });

    // Check if removing this ingredient clears any allergens
    if (!wasOmitted && ingredient.allergens.length > 0) {
      // Calculate what allergens will be after this toggle
      const newOmitted = new Set(omittedIngredients);
      newOmitted.add(ingredientId);
      
      const remainingAllergens = new Set<AllergenType>();
      selectedDish?.ingredients.forEach(ing => {
        if (!newOmitted.has(ing.id)) {
          ing.allergens.forEach(a => remainingAllergens.add(a));
        }
      });

      // Find allergens that were just cleared
      ingredient.allergens.forEach(allergen => {
        if (!remainingAllergens.has(allergen)) {
          const allergenInfo = getAllergenById(allergen);
          toast.success(
            `Dish is now ${allergenInfo?.name || allergen}-Free!`,
            {
              icon: <Sparkles className="w-4 h-4 text-sage" />,
              description: `Removed ${ingredient.name} which contained ${allergenInfo?.name || allergen}`,
            }
          );
        }
      });
    }
  };

  return (
    <Layout>
      <div className="container py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-copper/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-copper" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Allergy Training Module</h1>
              <p className="text-muted-foreground">
                Learn how to modify dishes to accommodate guest allergies
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Left Column - Dish Selection */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedCategory === 'all' && "bg-copper hover:bg-copper/90"
                )}
                onClick={() => setSelectedCategory('all')}
              >
                All ({trainingDishes.length})
              </Badge>
              {availableCategories.map(cat => {
                const count = trainingDishes.filter(d => d.categoryId === cat.id).length;
                return (
                  <Badge
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedCategory === cat.id && "bg-copper hover:bg-copper/90"
                    )}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name} ({count})
                  </Badge>
                );
              })}
            </div>

            {/* Dish Count */}
            <p className="text-sm text-muted-foreground">
              Showing {filteredDishes.length} dish{filteredDishes.length !== 1 ? 'es' : ''}
            </p>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredDishes.map((dish) => (
                <motion.div
                  key={dish.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all overflow-hidden",
                      selectedDishId === dish.id 
                        ? "ring-2 ring-copper border-copper" 
                        : "hover:border-copper/50"
                    )}
                    onClick={() => handleSelectDish(dish.id)}
                  >
                    <div className="flex gap-3 p-3">
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{dish.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {dish.description}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {Array.from(new Set(dish.ingredients.flatMap(i => i.allergens))).slice(0, 4).map(a => (
                            <AllergenIcon key={a} allergenId={a} size="sm" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column - Interactive Workbench */}
          <div>
            {selectedDish ? (
              <motion.div
                key={selectedDish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Dish Header */}
                <Card className="overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={selectedDish.image} 
                      alt={selectedDish.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="font-serif text-2xl font-bold text-foreground">
                        {selectedDish.name}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedDish.description}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Dynamic Allergy Status */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Contains - Red Zone */}
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <XCircle className="w-5 h-5" />
                        Contains Allergens
                        <Badge variant="destructive" className="ml-auto">
                          {currentAllergens.size}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatePresence mode="popLayout">
                        {currentAllergens.size > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Array.from(currentAllergens).map(allergenId => {
                              const allergen = getAllergenById(allergenId);
                              return (
                                <motion.div
                                  key={allergenId}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  layout
                                >
                                  <Badge 
                                    variant="destructive" 
                                    className="text-sm py-1 px-3"
                                  >
                                    <span className="mr-1">{allergen?.icon}</span>
                                    {allergen?.name}
                                  </Badge>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-muted-foreground text-sm italic"
                          >
                            All allergens cleared!
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>

                  {/* Safe For - Green Zone */}
                  <Card className="border-sage/30 bg-sage/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sage">
                        <CheckCircle2 className="w-5 h-5" />
                        Safe For
                        <Badge variant="sage" className="ml-auto">
                          {safeAllergens.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AnimatePresence mode="popLayout">
                        <div className="flex flex-wrap gap-2">
                          {safeAllergens.map(allergenId => {
                            const allergen = getAllergenById(allergenId);
                            return (
                              <motion.div
                                key={allergenId}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                layout
                              >
                                <Badge 
                                  variant="sage" 
                                  className="text-sm py-1 px-3"
                                >
                                  <span className="mr-1">{allergen?.icon}</span>
                                  {allergen?.name}
                                </Badge>
                              </motion.div>
                            );
                          })}
                        </div>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>

                {/* Ingredient Modifiers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-copper" />
                      Ingredient Modifiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedDish.ingredients.map((ingredient) => {
                      const isOmitted = omittedIngredients.has(ingredient.id);
                      
                      return (
                        <motion.div
                          key={ingredient.id}
                          layout
                          className={cn(
                            "flex items-center gap-4 p-3 rounded-lg border transition-all",
                            isOmitted 
                              ? "bg-muted/50 border-muted opacity-60" 
                              : "bg-card border-border",
                            !ingredient.removable && "opacity-80"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium",
                                isOmitted && "line-through text-muted-foreground"
                              )}>
                                {ingredient.name}
                              </span>
                              {!ingredient.removable && (
                                <Badge variant="outline" className="text-xs">
                                  Core
                                </Badge>
                              )}
                            </div>
                            {ingredient.allergens.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {ingredient.allergens.map(allergenId => {
                                  const allergen = getAllergenById(allergenId);
                                  return (
                                    <Badge 
                                      key={allergenId}
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        isOmitted && "opacity-50"
                                      )}
                                    >
                                      {allergen?.icon} {allergen?.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          {ingredient.removable ? (
                            <div className="flex items-center gap-2">
                              <Label 
                                htmlFor={ingredient.id} 
                                className={cn(
                                  "text-sm",
                                  isOmitted ? "text-destructive" : "text-muted-foreground"
                                )}
                              >
                                {isOmitted ? 'Omitted' : 'Omit'}
                              </Label>
                              <Switch
                                id={ingredient.id}
                                checked={isOmitted}
                                onCheckedChange={() => handleToggleIngredient(ingredient.id, ingredient)}
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              Cannot remove
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Training Tips */}
                <Card className="bg-copper/5 border-copper/20">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-copper shrink-0" />
                      <div>
                        <h3 className="font-semibold text-copper mb-1">
                          Training Tips
                        </h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Toggle "Omit" to see how removing ingredients affects allergen status</li>
                          <li>• <strong>Core ingredients</strong> cannot be removed from the dish</li>
                          <li>• Always confirm with kitchen before promising allergen modifications</li>
                          <li>• Watch for cross-contact risks even when ingredients are omitted</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* Empty State */
              <Card className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">
                    Select a Dish
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a dish from the menu on the left to start practicing 
                    allergen modifications.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}