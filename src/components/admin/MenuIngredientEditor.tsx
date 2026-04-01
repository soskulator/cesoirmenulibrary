import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useDishIngredients, useSaveDishIngredients, DishIngredient } from '@/hooks/useDishIngredients';
import { categories, allergens as allergenList, getCategoryById } from '@/data/menuTypes';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';

// Categories to exclude from the ingredient editor
const excludedCategories = ['wine', 'spirits', 'cocktails', 'sauces'];

// Only non-dietary allergens for chips
const allergenChips = allergenList.filter(a => !a.isDietary);

interface EditableIngredient {
  tempId: string;
  ingredient_name: string;
  is_omittable: boolean;
  omit_note: string | null;
  allergens: string[] | null;
  sort_order: number;
  menu_item_id: string;
}

function newEmptyIngredient(menuItemId: string, sortOrder: number): EditableIngredient {
  return {
    tempId: `new-${Date.now()}-${Math.random()}`,
    ingredient_name: '',
    is_omittable: false,
    omit_note: null,
    allergens: [],
    sort_order: sortOrder,
    menu_item_id: menuItemId,
  };
}

export function MenuIngredientEditor() {
  const { items: menuItems, isLoading: menuLoading } = useMenuItems();
  const { toast } = useToast();
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Food-only items grouped by category
  const foodItems = useMemo(() => {
    return menuItems.filter(
      item => item.isPublished && !excludedCategories.includes(item.categoryId)
    );
  }, [menuItems]);

  const groupedItems = useMemo(() => {
    const filtered = searchQuery
      ? foodItems.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : foodItems;

    const groups: Record<string, typeof filtered> = {};
    filtered.forEach(item => {
      if (!groups[item.categoryId]) groups[item.categoryId] = [];
      groups[item.categoryId].push(item);
    });
    return groups;
  }, [foodItems, searchQuery]);

  const selectedItem = useMemo(
    () => menuItems.find(i => i.id === selectedDishId),
    [menuItems, selectedDishId]
  );

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Left panel — Dish selector */}
      <Card className="lg:w-80 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-copper" />
            Select Dish
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardHeader>
        <ScrollArea className="h-[500px]">
          <CardContent className="pt-0 space-y-1">
            {Object.entries(groupedItems).map(([catId, items]) => {
              const cat = getCategoryById(catId);
              const isCollapsed = collapsedCategories.has(catId);
              return (
                <div key={catId}>
                  <button
                    onClick={() => toggleCategory(catId)}
                    className="w-full flex items-center gap-2 py-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    <span>{cat?.icon}</span>
                    <span>{cat?.name || catId}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5">{items.length}</Badge>
                  </button>
                  {!isCollapsed && items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedDishId(item.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedDishId === item.id
                          ? 'bg-copper/10 text-copper font-medium border border-copper/20'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              );
            })}
            {Object.keys(groupedItems).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {menuLoading ? 'Loading...' : 'No dishes found'}
              </p>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Right panel — Ingredient editor */}
      <div className="flex-1 min-w-0">
        {selectedItem ? (
          <IngredientEditorPanel item={selectedItem} />
        ) : (
          <Card className="h-full min-h-[400px] flex items-center justify-center">
            <div className="text-center text-muted-foreground space-y-2">
              <UtensilsCrossed className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">Select a dish to edit its ingredients</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function IngredientEditorPanel({ item }: { item: { id: string; name: string; categoryId: string; ingredientsText: string } }) {
  const { ingredients: dbIngredients, isLoading, error, refetch } = useDishIngredients(item.id);
  const { saveIngredients } = useSaveDishIngredients();
  const { toast } = useToast();
  const [localIngredients, setLocalIngredients] = useState<EditableIngredient[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const category = getCategoryById(item.categoryId);

  // Sync DB ingredients to local state when they load or dish changes
  const ingredients: EditableIngredient[] = useMemo(() => {
    if (localIngredients !== null) return localIngredients;
    return dbIngredients.map(ing => ({
      tempId: ing.id,
      ingredient_name: ing.ingredient_name,
      is_omittable: ing.is_omittable,
      omit_note: ing.omit_note,
      allergens: ing.allergens,
      sort_order: ing.sort_order,
      menu_item_id: ing.menu_item_id,
    }));
  }, [dbIngredients, localIngredients]);

  // Reset local state when dish changes
  const [prevItemId, setPrevItemId] = useState(item.id);
  if (item.id !== prevItemId) {
    setPrevItemId(item.id);
    setLocalIngredients(null);
  }

  const updateIngredient = useCallback((tempId: string, updates: Partial<EditableIngredient>) => {
    setLocalIngredients(prev => {
      const list = prev ?? ingredients;
      return list.map(ing => ing.tempId === tempId ? { ...ing, ...updates } : ing);
    });
  }, [ingredients]);

  const removeIngredient = useCallback((tempId: string) => {
    setLocalIngredients(prev => {
      const list = prev ?? ingredients;
      return list.filter(ing => ing.tempId !== tempId).map((ing, i) => ({ ...ing, sort_order: i }));
    });
  }, [ingredients]);

  const addIngredient = useCallback(() => {
    setLocalIngredients(prev => {
      const list = prev ?? ingredients;
      return [...list, newEmptyIngredient(item.id, list.length)];
    });
  }, [ingredients, item.id]);

  const toggleAllergen = useCallback((tempId: string, allergenId: string) => {
    setLocalIngredients(prev => {
      const list = prev ?? ingredients;
      return list.map(ing => {
        if (ing.tempId !== tempId) return ing;
        const current = ing.allergens ?? [];
        const next = current.includes(allergenId)
          ? current.filter(a => a !== allergenId)
          : [...current, allergenId];
        return { ...ing, allergens: next };
      });
    });
  }, [ingredients]);

  // Simple drag reorder
  const moveIngredient = useCallback((fromIdx: number, toIdx: number) => {
    setLocalIngredients(prev => {
      const list = [...(prev ?? ingredients)];
      const [moved] = list.splice(fromIdx, 1);
      list.splice(toIdx, 0, moved);
      return list.map((ing, i) => ({ ...ing, sort_order: i }));
    });
  }, [ingredients]);

  const handleSave = async () => {
    const list = localIngredients ?? ingredients;
    const nonEmpty = list.filter(ing => ing.ingredient_name.trim());
    if (nonEmpty.length === 0 && list.length > 0) {
      toast({ title: 'No ingredients', description: 'Add at least one ingredient name.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const payload = nonEmpty.map((ing, i) => ({
      menu_item_id: item.id,
      ingredient_name: ing.ingredient_name.trim(),
      is_omittable: ing.is_omittable,
      omit_note: ing.is_omittable ? null : (ing.omit_note?.trim() || null),
      allergens: ing.allergens?.length ? ing.allergens : null,
      sort_order: i,
    }));

    const { error } = await saveIngredients(item.id, payload);
    setIsSaving(false);

    if (error) {
      toast({ title: 'Save failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: `Ingredients saved for ${item.name}` });
      setLocalIngredients(null);
      refetch();
    }
  };

  if (isLoading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-copper" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <p className="text-sm text-destructive">Error: {error}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <CardTitle className="font-serif text-lg">{item.name}</CardTitle>
          {category && (
            <Badge className="bg-copper/10 text-copper border-copper/20">
              {category.icon} {category.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Reference text */}
        <div className="rounded-lg bg-muted/50 border border-border p-3 flex-shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Current ingredientsText — for reference only
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.ingredientsText || <em>No ingredients text available</em>}
          </p>
        </div>

        <Separator className="flex-shrink-0" />

        {/* Ingredient rows */}
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-[calc(100vh-28rem)] md:h-[calc(100vh-26rem)]">
            <div className="space-y-3 pr-2 pb-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.tempId}
                  className="rounded-lg border border-border bg-card p-3 space-y-2"
                  draggable
                  onDragStart={() => setDragIdx(idx)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx !== null && dragIdx !== idx) moveIngredient(dragIdx, idx);
                    setDragIdx(null);
                  }}
                  onDragEnd={() => setDragIdx(null)}
                >
                  {/* Row 1: drag handle, name, omit toggle, delete */}
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab flex-shrink-0" />
                    <Input
                      value={ing.ingredient_name}
                      onChange={e => updateIngredient(ing.tempId, { ingredient_name: e.target.value })}
                      placeholder="Ingredient name"
                      className="flex-1 h-8 text-sm"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Switch
                        checked={ing.is_omittable}
                        onCheckedChange={val => updateIngredient(ing.tempId, { is_omittable: val })}
                        className={cn(
                          'data-[state=checked]:bg-jade data-[state=unchecked]:bg-destructive/60'
                        )}
                      />
                      <span className={cn(
                        'text-[11px] font-medium w-16',
                        ing.is_omittable ? 'text-jade' : 'text-destructive'
                      )}>
                        {ing.is_omittable ? 'Can Omit' : "Can't Omit"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeIngredient(ing.tempId)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Row 2: omit note (only if NOT omittable) */}
                  {!ing.is_omittable && (
                    <Input
                      value={ing.omit_note ?? ''}
                      onChange={e => updateIngredient(ing.tempId, { omit_note: e.target.value })}
                      placeholder="Why can't this be removed? (optional)"
                      className="h-7 text-xs bg-destructive/5 border-destructive/20"
                    />
                  )}

                  {/* Row 3: allergen chips */}
                  <div className="flex flex-wrap gap-1">
                    {allergenChips.map(a => {
                      const isActive = (ing.allergens ?? []).includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleAllergen(ing.tempId, a.id)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors',
                            isActive
                              ? 'bg-copper/15 text-copper border-copper/30'
                              : 'bg-muted/50 text-muted-foreground border-transparent hover:border-border'
                          )}
                        >
                          {a.icon} {a.commonName.split('/')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Add + Save */}
        <div className="flex items-center gap-3 pt-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={addIngredient} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Ingredient
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-copper hover:bg-copper/90 text-white gap-1.5 ml-auto"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
