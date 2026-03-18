import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllergenModifications } from '@/hooks/useAllergenModifications';
import { useMenuItems } from '@/hooks/useMenuItems';
import { allergens, AllergenType, getAllergenById } from '@/data/menuData';
import { DbCategory } from '@/hooks/useCategories';
import { AlertTriangle, Search, Grid3x3, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BEVERAGE_CATEGORIES = ['wine', 'spirits', 'cocktails'];

interface AllergyManagementProps {
  categories: DbCategory[];
}

export function AllergyManagement({ categories }: AllergyManagementProps) {
  const [tab, setTab] = useState('matrix');

  return (
    <Card className="bg-card shadow-card">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="font-serif text-lg sm:text-xl">Allergy Management</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage allergens and modification guides for staff
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="matrix" className="gap-2 text-xs sm:text-sm">
              <Grid3x3 className="w-3.5 h-3.5" />
              Allergen Matrix
            </TabsTrigger>
            <TabsTrigger value="modifications" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Modification Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matrix">
            <AllergenMatrix categories={categories} />
          </TabsContent>
          <TabsContent value="modifications">
            <ModificationGuide categories={categories} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ============ ALLERGEN MATRIX ============

function AllergenMatrix({ categories }: { categories: DbCategory[] }) {
  const { items, isLoading, updateItem } = useMenuItems();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const foodItems = useMemo(() => {
    let filtered = items.filter(i => !BEVERAGE_CATEGORIES.includes(i.categoryId) && i.isPublished);
    if (categoryFilter !== 'all') filtered = filtered.filter(i => i.categoryId === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [items, categoryFilter, search]);

  const foodCats = useMemo(
    () => categories.filter(c => !BEVERAGE_CATEGORIES.includes(c.id)),
    [categories]
  );

  const handleToggle = useCallback(async (itemId: string, allergen: AllergenType, currentAllergens: AllergenType[]) => {
    const has = currentAllergens.includes(allergen);
    const updated = has
      ? currentAllergens.filter(a => a !== allergen)
      : [...currentAllergens, allergen];
    const ok = await updateItem(itemId, { allergens: updated });
    if (ok) {
      toast.success(`Allergen ${has ? 'removed' : 'added'}`);
    }
  }, [updateItem]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {foodCats.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-h-[500px]">
      <ScrollArea className="h-full max-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold sticky left-0 bg-card min-w-[180px]">Menu Item</th>
                {allergens.map(a => (
                  <th key={a.id} className="p-2 text-center min-w-[50px]" title={a.name}>
                    <span className="text-base">{a.icon}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {foodItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-2 font-medium sticky left-0 bg-card">{item.name}</td>
                  {allergens.map(a => {
                    const has = item.allergens.includes(a.id);
                    return (
                      <td key={a.id} className="p-2 text-center">
                        <Checkbox
                          checked={has}
                          onCheckedChange={() => handleToggle(item.id, a.id, item.allergens)}
                          className={cn(has && 'border-destructive data-[state=checked]:bg-destructive')}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {foodItems.length === 0 && (
                <tr>
                  <td colSpan={allergens.length + 1} className="p-8 text-center text-muted-foreground">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}

// ============ MODIFICATION GUIDE ============

function ModificationGuide({ categories }: { categories: DbCategory[] }) {
  const { items, isLoading: menuLoading } = useMenuItems();
  const { modifications, isLoading: modsLoading, upsertModification, getModification } = useAllergenModifications();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const itemsWithAllergens = useMemo(() => {
    let filtered = items.filter(
      i => !BEVERAGE_CATEGORIES.includes(i.categoryId) && i.isPublished && i.allergens.length > 0
    );
    if (categoryFilter !== 'all') filtered = filtered.filter(i => i.categoryId === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [items, categoryFilter, search]);

  const foodCats = useMemo(
    () => categories.filter(c => !BEVERAGE_CATEGORIES.includes(c.id)),
    [categories]
  );

  const isLoading = menuLoading || modsLoading;

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {foodCats.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-2">
          {itemsWithAllergens.map(item => (
            <ModificationCard
              key={item.id}
              itemId={item.id}
              itemName={item.name}
              itemAllergens={item.allergens}
              getModification={getModification}
              upsertModification={upsertModification}
            />
          ))}
          {itemsWithAllergens.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No items with allergens found</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ModificationCard({
  itemId,
  itemName,
  itemAllergens,
  getModification,
  upsertModification,
}: {
  itemId: string;
  itemName: string;
  itemAllergens: AllergenType[];
  getModification: (menuItemId: string, allergenType: string) => any;
  upsertModification: (menuItemId: string, allergenType: string, canRemove: boolean, notes: string) => Promise<boolean>;
}) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3">{itemName}</h4>
        <div className="space-y-3">
          {itemAllergens.map(allergenId => {
            const allergen = getAllergenById(allergenId);
            if (!allergen) return null;
            const mod = getModification(itemId, allergenId);
            return (
              <ModificationRow
                key={allergenId}
                itemId={itemId}
                allergenId={allergenId}
                allergenName={allergen.name}
                allergenIcon={allergen.icon}
                canRemove={mod?.can_remove ?? false}
                notes={mod?.substitution_notes ?? ''}
                onSave={upsertModification}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ModificationRow({
  itemId,
  allergenId,
  allergenName,
  allergenIcon,
  canRemove,
  notes,
  onSave,
}: {
  itemId: string;
  allergenId: string;
  allergenName: string;
  allergenIcon: string;
  canRemove: boolean;
  notes: string;
  onSave: (menuItemId: string, allergenType: string, canRemove: boolean, notes: string) => Promise<boolean>;
}) {
  const [localCanRemove, setLocalCanRemove] = useState(canRemove);
  const [localNotes, setLocalNotes] = useState(notes);
  const [saving, setSaving] = useState(false);

  const isDirty = localCanRemove !== canRemove || localNotes !== notes;

  const handleSave = async () => {
    setSaving(true);
    await onSave(itemId, allergenId, localCanRemove, localNotes);
    setSaving(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-md bg-background/50">
      <div className="flex items-center gap-2 min-w-[140px]">
        <span>{allergenIcon}</span>
        <span className="text-sm font-medium">{allergenName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={localCanRemove}
          onCheckedChange={setLocalCanRemove}
          className="data-[state=checked]:bg-jade"
        />
        <span className="text-xs text-muted-foreground">
          {localCanRemove ? 'Can remove' : 'Cannot remove'}
        </span>
      </div>
      <div className="flex-1">
        <Input
          placeholder="Substitution notes..."
          value={localNotes}
          onChange={e => setLocalNotes(e.target.value)}
          className="text-sm h-8"
        />
      </div>
      {isDirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? '...' : 'Save'}
        </button>
      )}
    </div>
  );
}
