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
import { AllergenType, allergens, getAllergenById } from '@/data/menuData';

// Import dish images
import burgerImage from '@/assets/dishes/steak-tartare.jpg';
import salmonImage from '@/assets/dishes/crispy-skin-salmon.jpg';
import pastaImage from '@/assets/dishes/wild-mushroom-ravioli.jpg';
import scallopImage from '@/assets/dishes/seared-scallops.jpg';
import saladImage from '@/assets/dishes/caesar-salad.jpg';

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
  ingredients: TrainingIngredient[];
}

// Mock training dishes with detailed ingredients
const trainingDishes: TrainingDish[] = [
  {
    id: 'burger',
    name: 'Classic Bistro Burger',
    image: burgerImage,
    description: 'House-ground beef patty with aged cheddar, caramelized onions, and truffle aioli on a brioche bun.',
    ingredients: [
      { id: 'b1', name: 'Brioche Bun', allergens: ['gluten', 'dairy', 'egg'], removable: true },
      { id: 'b2', name: 'Beef Patty', allergens: [], removable: false },
      { id: 'b3', name: 'Aged Cheddar', allergens: ['dairy'], removable: true },
      { id: 'b4', name: 'Caramelized Onions', allergens: ['allium'], removable: true },
      { id: 'b5', name: 'Truffle Aioli', allergens: ['egg', 'soy'], removable: true },
      { id: 'b6', name: 'Butter Lettuce', allergens: [], removable: true },
      { id: 'b7', name: 'Tomato', allergens: ['nightshade'], removable: true },
    ],
  },
  {
    id: 'salmon',
    name: 'Pan-Seared Salmon',
    image: salmonImage,
    description: 'Wild-caught salmon with lemon beurre blanc, haricots verts, and fingerling potatoes.',
    ingredients: [
      { id: 's1', name: 'Atlantic Salmon', allergens: ['fish'], removable: false },
      { id: 's2', name: 'Lemon Beurre Blanc', allergens: ['dairy'], removable: true },
      { id: 's3', name: 'Haricots Verts', allergens: [], removable: true },
      { id: 's4', name: 'Fingerling Potatoes', allergens: [], removable: true },
      { id: 's5', name: 'Shallot Garnish', allergens: ['allium'], removable: true },
      { id: 's6', name: 'Herb Oil', allergens: [], removable: true },
    ],
  },
  {
    id: 'pasta',
    name: 'Wild Mushroom Ravioli',
    image: pastaImage,
    description: 'House-made pasta filled with wild mushrooms, in a truffle cream sauce with parmesan.',
    ingredients: [
      { id: 'p1', name: 'Fresh Pasta Dough', allergens: ['gluten', 'egg'], removable: false },
      { id: 'p2', name: 'Wild Mushroom Filling', allergens: [], removable: false },
      { id: 'p3', name: 'Truffle Cream Sauce', allergens: ['dairy'], removable: true },
      { id: 'p4', name: 'Parmesan Cheese', allergens: ['dairy'], removable: true },
      { id: 'p5', name: 'Garlic Butter', allergens: ['dairy', 'allium'], removable: true },
      { id: 'p6', name: 'Fresh Thyme', allergens: [], removable: true },
    ],
  },
  {
    id: 'scallops',
    name: 'Seared Diver Scallops',
    image: scallopImage,
    description: 'U-10 scallops with cauliflower purée, brown butter, capers, and toasted almonds.',
    ingredients: [
      { id: 'sc1', name: 'Diver Scallops', allergens: ['shellfish'], removable: false },
      { id: 'sc2', name: 'Cauliflower Purée', allergens: ['dairy'], removable: true },
      { id: 'sc3', name: 'Brown Butter', allergens: ['dairy'], removable: true },
      { id: 'sc4', name: 'Toasted Almonds', allergens: ['nuts'], removable: true },
      { id: 'sc5', name: 'Capers', allergens: [], removable: true },
      { id: 'sc6', name: 'Lemon Segments', allergens: [], removable: true },
    ],
  },
  {
    id: 'salad',
    name: 'Classic Caesar Salad',
    image: saladImage,
    description: 'Crisp romaine with house-made caesar dressing, parmesan crisps, and garlic croutons.',
    ingredients: [
      { id: 'sa1', name: 'Romaine Lettuce', allergens: [], removable: false },
      { id: 'sa2', name: 'Caesar Dressing', allergens: ['egg', 'dairy', 'fish'], removable: true },
      { id: 'sa3', name: 'Parmesan Crisps', allergens: ['dairy'], removable: true },
      { id: 'sa4', name: 'Garlic Croutons', allergens: ['gluten', 'allium'], removable: true },
      { id: 'sa5', name: 'Anchovy Garnish', allergens: ['fish'], removable: true },
      { id: 'sa6', name: 'Black Pepper', allergens: [], removable: true },
    ],
  },
];

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
  const [omittedIngredients, setOmittedIngredients] = useState<Set<string>>(new Set());
  const [previousAllergens, setPreviousAllergens] = useState<Set<AllergenType>>(new Set());

  const selectedDish = useMemo(() => 
    trainingDishes.find(d => d.id === selectedDishId) || null, 
    [selectedDishId]
  );

  // Filter dishes based on search
  const filteredDishes = useMemo(() => {
    if (!searchQuery) return trainingDishes;
    const query = searchQuery.toLowerCase();
    return trainingDishes.filter(dish =>
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query) ||
      dish.ingredients.some(ing => ing.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

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

            <div className="space-y-3">
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