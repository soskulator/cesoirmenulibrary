import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AllergenList, AllergenBadge } from '@/components/AllergenBadge';
import { 
  menuItems, 
  allergens, 
  AllergenType, 
  getAllergenById,
  getCategoryById 
} from '@/data/menuData';
import { AlertTriangle, Check, X, Printer, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Filter out spirits from allergen checking - spirits only track dairy allergens
// Most distilled spirits are naturally free of common food allergens
const getAllergenRelevantItems = () => {
  return menuItems.filter(item => 
    item.isPublished && 
    item.categoryId !== 'spirits'
  );
};

export default function AllergyCheckPage() {
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAllergens, setExpandedAllergens] = useState<string[]>([]);

  const toggleExpanded = (allergenId: string) => {
    setExpandedAllergens(prev =>
      prev.includes(allergenId)
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  // Get only food/cocktail items (exclude spirits)
  const allergenRelevantItems = useMemo(() => getAllergenRelevantItems(), []);

  const toggleAllergen = (id: AllergenType) => {
    setSelectedAllergens(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  // Items that contain ANY of the selected allergens
  const itemsWithAllergens = useMemo(() => {
    if (selectedAllergens.length === 0) return [];
    return allergenRelevantItems.filter(item =>
      item.allergens.some(a => selectedAllergens.includes(a))
    );
  }, [selectedAllergens, allergenRelevantItems]);

  // Items that are SAFE (don't contain any selected allergens)
  const safeItems = useMemo(() => {
    if (selectedAllergens.length === 0) return allergenRelevantItems;
    return allergenRelevantItems.filter(item =>
      !item.allergens.some(a => selectedAllergens.includes(a))
    );
  }, [selectedAllergens, allergenRelevantItems]);

  // Search filter
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

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold">Guest Allergy Check</h1>
              <p className="text-muted-foreground">
                Quick reference for allergen-free dining options
              </p>
            </div>
          </div>
        </div>

        {/* Allergen Selection */}
        <Card className="mb-8 no-print">
          <CardHeader>
            <CardTitle className="text-lg">Guest's Allergens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Select all allergens the guest needs to avoid:
            </p>
            <div className="flex flex-wrap gap-2">
              {allergens.map((allergen) => (
                <Button
                  key={allergen.id}
                  variant={selectedAllergens.includes(allergen.id) ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => toggleAllergen(allergen.id)}
                  className="transition-all"
                >
                  <span className="mr-1">{allergen.icon}</span>
                  {allergen.name}
                  {selectedAllergens.includes(allergen.id) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
            {selectedAllergens.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAllergens([])}
                className="mt-4"
              >
                Clear all
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Print Header (only visible when printing) */}
        <div className="hidden print:block mb-8">
          <h1 className="font-serif text-2xl font-bold mb-2">Ce Soir - Allergen-Safe Menu</h1>
          <p className="text-sm">
            Guest allergies: {selectedAllergens.map(a => getAllergenById(a)?.name).join(', ') || 'None selected'}
          </p>
          <p className="text-xs text-muted-foreground">
            Printed on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Results */}
        {selectedAllergens.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Safe Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-sage" />
                  <h2 className="font-serif text-xl font-semibold">
                    Safe to Order
                  </h2>
                  <Badge variant="sage">{filteredSafeItems.length}</Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-4 no-print">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search safe items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
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
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="print-card"
                      >
                        <Card className="border-sage/30 bg-sage/5">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{category?.icon}</span>
                              <div className="flex-1">
                                <h3 className="font-semibold">{item.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.shortDescription}
                                </p>
                                {item.allergens.length > 0 && (
                                  <div className="mt-2">
                                    <AllergenList
                                      allergens={item.allergens}
                                      size="sm"
                                      showIcons={false}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Items to Avoid */}
            <div className="no-print">
              <div className="flex items-center gap-2 mb-4">
                <X className="w-5 h-5 text-destructive" />
                <h2 className="font-serif text-xl font-semibold">
                  Contains Selected Allergens
                </h2>
                <Badge variant="destructive">{itemsWithAllergens.length}</Badge>
              </div>

              <div className="space-y-3">
                {itemsWithAllergens.map((item) => {
                  const category = getCategoryById(item.categoryId);
                  const matchingAllergens = item.allergens.filter(a =>
                    selectedAllergens.includes(a)
                  );
                  return (
                    <Card key={item.id} className="border-destructive/30 bg-destructive/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg opacity-50">{category?.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-muted-foreground">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground/70">
                              {item.shortDescription}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {matchingAllergens.map((a) => (
                                <AllergenBadge
                                  key={a}
                                  allergenId={a}
                                  size="sm"
                                />
                              ))}
                            </div>
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
          /* No allergens selected - show all items by allergen */
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">
              All Items by Allergen
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Note: Spirits are excluded from allergen tracking. Most distilled spirits are naturally free of common food allergens.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allergens.map((allergen) => {
                const itemsWithThis = allergenRelevantItems.filter(i =>
                  i.allergens.includes(allergen.id)
                );
                const isExpanded = expandedAllergens.includes(allergen.id);
                const previewCount = 5;
                const hasMore = itemsWithThis.length > previewCount;
                
                return (
                  <Collapsible 
                    key={allergen.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleExpanded(allergen.id)}
                  >
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors">
                          <CardTitle className="text-base flex items-center gap-2">
                            <span>{allergen.icon}</span>
                            {allergen.name}
                            <Badge variant="secondary" className="ml-auto">
                              {itemsWithThis.length}
                            </Badge>
                            <ChevronDown 
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )} 
                            />
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CardContent className="pt-0">
                        {itemsWithThis.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic">
                            No items contain this allergen
                          </p>
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
                              <p className="text-xs text-copper mt-2 cursor-pointer hover:underline">
                                +{itemsWithThis.length - previewCount} more items
                              </p>
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
                <h3 className="font-semibold text-amber-800 mb-1">
                  Cross-Contact Warning
                </h3>
                <p className="text-sm text-amber-700">
                  Our kitchen handles all major allergens. While we take precautions, 
                  we cannot guarantee a completely allergen-free environment. Please 
                  inform guests with severe allergies that cross-contact is possible.
                  Always confirm with the kitchen for guests with life-threatening allergies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
