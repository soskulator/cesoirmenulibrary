import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/hooks/useCategories';
import { PrintableAllergenMenu } from '@/components/PrintableAllergenMenu';
import { usePageTitle } from '@/hooks/usePageTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AllergenList, AllergenBadge } from '@/components/AllergenBadge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  allergens, 
  categories,
  AllergenType, 
  getAllergenById,
  getCategoryById,
  isDietaryType,
  MenuItem
} from '@/data/menuTypes';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDishIngredients, useAllDishIngredients, DishIngredient } from '@/hooks/useDishIngredients';
import { getDishImage } from '@/data/dishImages';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Printer, 
  Search, 
  ChevronDown, 
  ChefHat,
  CheckCircle2,
  XCircle,
  Sparkles,
  GraduationCap,
  ClipboardCheck,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// ============ ALLERGY TRAINING FUNCTIONALITY ============

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

const allergenKeywords: Record<string, string[]> = {
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

const parseIngredients = (ingredientsText: string, dishAllergens: AllergenType[]): TrainingIngredient[] => {
  const ingredientNames = ingredientsText.split(',').map(i => i.trim()).filter(Boolean);
  
  return ingredientNames.map((name, index) => {
    const lowerName = name.toLowerCase();
    const ingredientAllergens: AllergenType[] = [];
    
    dishAllergens.forEach(allergen => {
      const keywords = allergenKeywords[allergen] || [];
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        ingredientAllergens.push(allergen);
      }
    });
    
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

const foodCategories = ['appetizers', 'entrees', 'desserts', 'sides', 'specials', 'crudo', 'fruits-de-mer', 'pasta'];

// Helper to create training dishes from menu items
const createTrainingDishes = (menuItems: MenuItem[]): TrainingDish[] => {
  return menuItems
    .filter(item => foodCategories.includes(item.categoryId) && item.isPublished)
    .map(item => ({
      id: item.id,
      name: item.name,
      image: getDishImage(item.id, item.imageUrl) || '/placeholder.svg',
      description: item.shortDescription,
      categoryId: item.categoryId,
      ingredients: parseIngredients(item.ingredientsText, item.allergens)
    }));
};

// Helper to group dishes by category
const groupDishesByCategory = (dishes: TrainingDish[]): Record<string, TrainingDish[]> => {
  return dishes.reduce((acc, dish) => {
    if (!acc[dish.categoryId]) {
      acc[dish.categoryId] = [];
    }
    acc[dish.categoryId].push(dish);
    return acc;
  }, {} as Record<string, TrainingDish[]>);
};

// Allergen Icon Component
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

export default function AllergyPage() {
  usePageTitle("Allergy Reference");
  const [activeTab, setActiveTab] = useState('check');
  
  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Allergy Center</h1>
              <p className="text-muted-foreground">
                Guest allergy check and staff training tools
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="check" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Guest Allergy Check
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <GraduationCap className="w-4 h-4" />
              Training Module
            </TabsTrigger>
          </TabsList>

          <TabsContent value="check">
            <AllergyCheckContent />
          </TabsContent>

          <TabsContent value="training">
            <AllergyTrainingContent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// ============ ALLERGY CHECK TAB ============

function AllergyCheckContent() {
  const { items: menuItems, isLoading } = useMenuItems();
  const { categories: dbCategories } = useCategories();

  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [expandedAllergens, setExpandedAllergens] = useState<string[]>([]);

  const toggleExpanded = (allergenId: string) => {
    setExpandedAllergens(prev =>
      prev.includes(allergenId)
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  // Get allergen-relevant items from database menu items
  const allergenRelevantItems = useMemo(() => {
    const beverageCategories = ['wine', 'spirits', 'cocktails'];
    return menuItems.filter(item => 
      item.isPublished && 
      !beverageCategories.includes(item.categoryId)
    );
  }, [menuItems]);

  const toggleAllergen = (id: AllergenType) => {
    setSelectedAllergens(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  // Separate selected into allergens vs dietary
  const selectedDietary = useMemo(() => selectedAllergens.filter(isDietaryType), [selectedAllergens]);
  const selectedRealAllergens = useMemo(() => selectedAllergens.filter(a => !isDietaryType(a)), [selectedAllergens]);

  const itemsWithAllergens = useMemo(() => {
    if (selectedAllergens.length === 0) return [];
    return allergenRelevantItems.filter(item => {
      // Item is unsafe if it CONTAINS any selected real allergen
      const hasAllergen = item.allergens.some(a => selectedRealAllergens.includes(a));
      // Item is unsafe if it LACKS any selected dietary tag
      const missingDietary = selectedDietary.some(d => !item.allergens.includes(d));
      return hasAllergen || missingDietary;
    });
  }, [selectedAllergens, selectedRealAllergens, selectedDietary, allergenRelevantItems]);

  const safeItems = useMemo(() => {
    if (selectedAllergens.length === 0) return allergenRelevantItems;
    return allergenRelevantItems.filter(item => {
      // Safe means: doesn't contain any selected real allergen AND has all selected dietary tags
      const hasNoAllergen = !item.allergens.some(a => selectedRealAllergens.includes(a));
      const hasAllDietary = selectedDietary.every(d => item.allergens.includes(d));
      return hasNoAllergen && hasAllDietary;
    });
  }, [selectedAllergens, selectedRealAllergens, selectedDietary, allergenRelevantItems]);

  const filteredSafeItems = useMemo(() => {
    if (!searchQuery) return safeItems;
    const query = searchQuery.toLowerCase();
    return safeItems.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.shortDescription.toLowerCase().includes(query)
    );
  }, [safeItems, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-3 text-muted-foreground">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link
          to="/allergen-menu"
          className="inline-flex items-center gap-1.5 text-sm text-copper hover:text-copper-dark transition-colors font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Full allergen menu view
        </Link>
      </div>
      <div className="sticky top-[3.75rem] lg:top-[4.5rem] z-20 bg-background/95 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-border mb-4 no-print">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Guest's Allergens & Dietary Preferences — tap to select
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-4">
          {allergens.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen.id);
            const isDietary = allergen.isDietary;
            return (
              <button
                key={allergen.id}
                onClick={() => toggleAllergen(allergen.id)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "gap-1 p-2 rounded-xl border-2 transition-all",
                  "text-center min-h-[52px]",
                  isSelected && isDietary
                    ? "border-jade bg-jade/10 scale-95"
                    : isSelected
                    ? "border-destructive bg-destructive/10 scale-95"
                    : isDietary
                    ? "border-border bg-card hover:border-jade/40 hover:bg-jade/5"
                    : "border-border bg-card hover:border-destructive/40 hover:bg-destructive/5"
                )}
              >
                <span className="text-xl leading-none">
                  {allergen.icon}
                </span>
                <span className={cn(
                  "text-[11px] sm:text-xs font-medium leading-tight",
                  isSelected && isDietary
                    ? "text-jade"
                    : isSelected
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}>
                  {allergen.commonName.split('/')[0]}
                </span>
              </button>
            );
          })}
        </div>
        {selectedAllergens.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">
              {selectedAllergens.length} filter{selectedAllergens.length > 1 ? 's' : ''} selected
            </p>
            <button
              onClick={() => setSelectedAllergens([])}
              className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {selectedAllergens.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Safe Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-sage" />
                <h2 className="font-serif text-xl font-semibold">Safe to Order</h2>
                <Badge variant="sage">{filteredSafeItems.length}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
                <Printer className="w-4 h-4 mr-2" />
                Print Adapted Menu
              </Button>
            </div>

            <div className="relative mb-4 no-print">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search safe items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredSafeItems.length === 0 ? (
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No items match the search
                  </CardContent>
                </Card>
              ) : (
                filteredSafeItems.map((item) => {
                  const category = getCategoryById(item.categoryId);
                  return (
                    <Card key={item.id} className="border-sage/30 bg-sage/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{category?.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.shortDescription}</p>
                            {item.allergens.length > 0 && (
                              <div className="mt-2">
                                <AllergenList allergens={item.allergens} size="sm" showIcons={false} />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Items to Avoid */}
          <div className="no-print">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-5 h-5 text-destructive" />
              <h2 className="font-serif text-xl font-semibold">Cannot Accommodate</h2>
              <Badge variant="destructive">{itemsWithAllergens.length}</Badge>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {itemsWithAllergens.map((item) => {
                const category = getCategoryById(item.categoryId);
                const matchingAllergens = item.allergens.filter(a => selectedAllergens.includes(a));
                return (
                  <Card key={item.id} className="border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg opacity-50">{category?.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-muted-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground/70">{item.shortDescription}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {matchingAllergens.map((a) => (
                              <AllergenBadge key={a} allergenId={a} size="sm" />
                            ))}
                          </div>
                          {(() => {
                            const mods = getModsForItem(item.id, matchingAllergens);
                            const removable = mods.filter(m => m?.can_remove && m?.substitution_notes?.trim());
                            const cannotRemove = mods.filter(m => !m?.can_remove && m?.substitution_notes?.trim());
                            return (
                              <>
                                {(removable.length > 0 || cannotRemove.length > 0) && (
                                  <div className="mt-3 space-y-2">
                                    {removable.map((mod, i) => (
                                      <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-jade/10 border border-jade/20">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-jade mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-jade-dark leading-relaxed">{mod?.substitution_notes}</p>
                                      </div>
                                    ))}
                                    {cannotRemove.map((mod, i) => (
                                      <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-amber-50 border border-amber-200">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-amber-700 leading-relaxed">{mod?.substitution_notes}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <DishIngredientOmitContext itemId={item.id} selectedAllergens={matchingAllergens} />
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* All Items by Allergen */
        <div>
          <h2 className="font-serif text-xl font-semibold mb-4">All Items by Allergen</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Note: Spirits are excluded from allergen tracking.
          </p>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allergens.map((allergen) => {
              const allItemsWithThis = allergenRelevantItems.filter(i => i.allergens.includes(allergen.id));
              const itemsWithThis = categorySearchQuery
                ? allItemsWithThis.filter(item =>
                    item.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
                    item.shortDescription.toLowerCase().includes(categorySearchQuery.toLowerCase())
                  )
                : allItemsWithThis;
              const isExpanded = expandedAllergens.includes(allergen.id);
              const previewCount = 5;
              const hasMore = itemsWithThis.length > previewCount;
              
              return (
                <Collapsible key={allergen.id} open={isExpanded} onOpenChange={() => toggleExpanded(allergen.id)}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span>{allergen.icon}</span>
                          {allergen.name}
                          <Badge variant="secondary" className="ml-auto">{itemsWithThis.length}</Badge>
                          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CardContent className="pt-0">
                      {itemsWithThis.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No items contain this allergen</p>
                      ) : (
                        <>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {itemsWithThis.slice(0, previewCount).map((item) => (
                              <li key={item.id}>• {item.name}</li>
                            ))}
                          </ul>
                          <CollapsibleContent>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="text-sm text-muted-foreground space-y-1"
                                >
                                  {itemsWithThis.slice(previewCount).map((item) => (
                                    <li key={item.id}>• {item.name}</li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </CollapsibleContent>
                          {hasMore && !isExpanded && (
                            <CollapsibleTrigger asChild>
                              <p className="text-xs text-copper mt-2 cursor-pointer hover:underline">
                                +{itemsWithThis.length - previewCount} more items
                              </p>
                            </CollapsibleTrigger>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        </div>
      )}

      {/* Cross-Contact Warning */}
      <Card className="mt-8 bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Cross-Contact Warning</h3>
              <p className="text-sm text-amber-700">
                Our kitchen handles all major allergens. While we take precautions, 
                we cannot guarantee a completely allergen-free environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Printable Adapted Menu (hidden on screen, shown on print) */}
      {selectedAllergens.length > 0 && (
        <PrintableAllergenMenu
          selectedAllergens={selectedAllergens}
          menuItems={menuItems}
          modifications={modifications}
          categories={dbCategories}
        />
      )}
    </div>
  );
}

// ============ ALLERGY TRAINING TAB ============

function AllergyTrainingContent() {
  const { items: menuItems, isLoading } = useMenuItems();
  const { modifications, isLoading: modsLoading } = useAllergenModifications();
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['appetizers']);
  const [omittedIngredients, setOmittedIngredients] = useState<Set<string>>(new Set());

  // Create training dishes from database menu items
  const trainingDishes = useMemo(() => createTrainingDishes(menuItems), [menuItems]);
  
  // Group dishes by category
  const dishesByCategory = useMemo(() => groupDishesByCategory(trainingDishes), [trainingDishes]);

  const selectedDish = useMemo(() => 
    trainingDishes.find(d => d.id === selectedDishId) || null, 
    [trainingDishes, selectedDishId]
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Filter dishes based on search
  const filteredDishesByCategory = useMemo(() => {
    if (!searchQuery) return dishesByCategory;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, TrainingDish[]> = {};
    
    Object.entries(dishesByCategory).forEach(([catId, dishes]) => {
      const matchedDishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query)
      );
      if (matchedDishes.length > 0) {
        filtered[catId] = matchedDishes;
      }
    });
    
    return filtered;
  }, [searchQuery, dishesByCategory]);

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

  // Calculate safe allergens
  const safeAllergens = useMemo(() => {
    const allAllergenTypes: AllergenType[] = ['gluten', 'dairy', 'egg', 'nuts', 'shellfish', 'fish', 'soy', 'sesame', 'allium', 'nightshade'];
    return allAllergenTypes.filter(a => !currentAllergens.has(a));
  }, [currentAllergens]);

  const handleSelectDish = (dishId: string) => {
    setSelectedDishId(dishId);
    setOmittedIngredients(new Set());
  };

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

    if (!wasOmitted && ingredient.allergens.length > 0) {
      const newOmitted = new Set(omittedIngredients);
      newOmitted.add(ingredientId);
      
      const remainingAllergens = new Set<AllergenType>();
      selectedDish?.ingredients.forEach(ing => {
        if (!newOmitted.has(ing.id)) {
          ing.allergens.forEach(a => remainingAllergens.add(a));
        }
      });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-copper" />
        <span className="ml-3 text-muted-foreground">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[350px_1fr] gap-8">
      {/* Left Column - Dish Selection with Category Dropdowns */}
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

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {Object.entries(filteredDishesByCategory).map(([categoryId, dishes]) => {
            const category = categories.find(c => c.id === categoryId);
            const isExpanded = expandedCategories.includes(categoryId);
            
            return (
              <Collapsible 
                key={categoryId} 
                open={isExpanded} 
                onOpenChange={() => toggleCategory(categoryId)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category?.icon}</span>
                          <span className="font-semibold">{category?.name}</span>
                          <Badge variant="secondary" className="text-xs">{dishes.length}</Badge>
                        </div>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3 px-3 space-y-2">
                      {dishes.map((dish) => (
                        <motion.div
                          key={dish.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div 
                            className={cn(
                              "flex gap-3 p-2 rounded-lg cursor-pointer transition-all",
                              selectedDishId === dish.id 
                                ? "bg-copper/10 ring-1 ring-copper" 
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => handleSelectDish(dish.id)}
                          >
                            <img 
                              src={dish.image} 
                              alt={dish.name}
                              className="w-14 h-14 rounded-md object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{dish.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{dish.description}</p>
                              <div className="flex gap-1 mt-1">
                                {Array.from(new Set(dish.ingredients.flatMap(i => i.allergens))).slice(0, 3).map(a => (
                                  <AllergenIcon key={a} allergenId={a} size="sm" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
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
                  <h2 className="font-serif text-2xl font-bold text-foreground">{selectedDish.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDish.description}</p>
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
                    <Badge variant="destructive" className="ml-auto">{currentAllergens.size}</Badge>
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
                              <Badge variant="destructive" className="text-sm py-1 px-3">
                                <span className="mr-1">{allergen?.icon}</span>
                                {allergen?.name}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-sm italic">
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
                    <Badge variant="sage" className="ml-auto">{safeAllergens.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {safeAllergens.map(allergenId => {
                      const allergen = getAllergenById(allergenId);
                      return (
                        <motion.div
                          key={allergenId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          layout
                        >
                          <Badge variant="sage" className="text-sm py-1 px-3">
                            <span className="mr-1">{allergen?.icon}</span>
                            {allergen?.name}
                          </Badge>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ingredient Modifiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-copper" />
                  Ingredient Modifiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDish.ingredients.map((ingredient) => {
                  const isOmitted = omittedIngredients.has(ingredient.id);
                  return (
                    <div
                      key={ingredient.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isOmitted ? "bg-muted/50 border-muted" : "bg-card border-border",
                        !ingredient.removable && "opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", isOmitted ? "bg-muted-foreground" : "bg-sage")} />
                        <div>
                          <span className={cn("font-medium", isOmitted && "line-through text-muted-foreground")}>
                            {ingredient.name}
                          </span>
                          {ingredient.allergens.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {ingredient.allergens.map(a => (
                                <AllergenIcon key={a} allergenId={a} size="sm" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ingredient.removable ? (
                          <>
                            <Label htmlFor={`omit-${ingredient.id}`} className="text-sm text-muted-foreground">
                              Omit
                            </Label>
                            <Switch
                              id={`omit-${ingredient.id}`}
                              checked={isOmitted}
                              onCheckedChange={() => handleToggleIngredient(ingredient.id, ingredient)}
                            />
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Base ingredient</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Admin-Defined Modification Notes */}
            {selectedDish && (() => {
              const dishMods = modifications.filter(m => m.menu_item_id === selectedDish.id);
              if (dishMods.length === 0) return null;
              return (
                <Card className="border-copper/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-copper" />
                      Kitchen Modification Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {dishMods.map(mod => {
                      const allergen = getAllergenById(mod.allergen_type as AllergenType);
                      return (
                        <div key={mod.id || `${mod.menu_item_id}-${mod.allergen_type}`} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                          <span>{allergen?.icon || '⚠️'}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{allergen?.name || mod.allergen_type}</span>
                              <Badge variant={mod.can_remove ? 'sage' : 'destructive'} className="text-[10px]">
                                {mod.can_remove ? 'Can Remove' : 'Cannot Remove'}
                              </Badge>
                            </div>
                            {mod.substitution_notes && (
                              <p className="text-xs text-muted-foreground mt-1">{mod.substitution_notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })()}
          </motion.div>
        ) : (
          <Card className="h-full flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Select a Dish</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a dish from the menu on the left to start practicing allergen modifications.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Small component to show dish_ingredients omittability context per allergen
function DishIngredientOmitContext({ itemId, selectedAllergens }: { itemId: string; selectedAllergens: AllergenType[] }) {
  const { ingredients, isLoading } = useDishIngredients(itemId);

  if (isLoading || ingredients.length === 0) return null;

  // Filter ingredients whose allergens array includes any of the selected allergens
  const matching = ingredients.filter(ing =>
    (ing.allergens ?? []).some(a => selectedAllergens.includes(a as AllergenType))
  );

  if (matching.length === 0) return null;

  const anyOmittable = matching.some(ing => ing.is_omittable);

  return (
    <div className="mt-3 pt-2 border-t border-border/50">
      <p className="text-[11px] font-semibold text-copper mb-1.5">Modifications available:</p>
      <div className="space-y-1">
        {matching.map(ing => (
          <div key={ing.id} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                ing.is_omittable
                  ? 'bg-jade/15 text-jade'
                  : 'bg-destructive/10 text-destructive'
              )}
            >
              {ing.is_omittable ? 'Can Omit' : 'Cannot Omit'}
            </span>
            <span className="text-muted-foreground">{ing.ingredient_name}</span>
          </div>
        ))}
      </div>
      {!anyOmittable && (
        <p className="text-[11px] text-amber-600 mt-1.5">⚠️ No modifications available for this allergen</p>
      )}
    </div>
  );
}