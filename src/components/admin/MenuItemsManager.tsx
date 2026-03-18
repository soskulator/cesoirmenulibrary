import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MenuItem, AllergenType } from '@/data/menuData';
import { DbCategory } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuItemEditDialog } from '@/components/admin/MenuItemEditDialog';
import {
  Search, Plus, Edit, Loader2, FileText, CheckSquare, XSquare,
} from 'lucide-react';

const ALLERGEN_COLORS: Record<string, string> = {
  gluten: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  dairy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  egg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  nuts: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  shellfish: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  fish: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  soy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  sesame: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  allium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  nightshade: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

interface MenuItemsManagerProps {
  items: MenuItem[];
  categories: DbCategory[];
  isLoading: boolean;
  onUpdate: (id: string, updates: Partial<MenuItem>) => Promise<boolean>;
  onAdd: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MenuItem | null>;
  onBulkUpdate: (ids: string[], updates: Partial<MenuItem>) => Promise<boolean>;
  onRefresh: () => Promise<void>;
}

export function MenuItemsManager({
  items, categories, isLoading, onUpdate, onAdd, onBulkUpdate, onRefresh,
}: MenuItemsManagerProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = `${c.icon} ${c.name}`; });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      result = result.filter(i => i.categoryId === categoryFilter);
    }
    if (publishedFilter === 'published') {
      result = result.filter(i => i.isPublished);
    } else if (publishedFilter === 'unpublished') {
      result = result.filter(i => !i.isPublished);
    }
    return result;
  }, [items, search, categoryFilter, publishedFilter]);

  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkPublish = async (publish: boolean) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    await onBulkUpdate([...selectedIds], { isPublished: publish });
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleTogglePublished = async (item: MenuItem) => {
    await onUpdate(item.id, { isPublished: !item.isPublished });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="bg-card shadow-card">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terra-cotta/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-terra-cotta" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Menu Items</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{items.length} total items</CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-terra-cotta hover:bg-terra-cotta/90 text-white"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50 border">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={bulkLoading}
                  onClick={() => handleBulkPublish(true)}
                >
                  <CheckSquare className="w-3.5 h-3.5 mr-1" /> Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  disabled={bulkLoading}
                  onClick={() => handleBulkPublish(false)}
                >
                  <XSquare className="w-3.5 h-3.5 mr-1" /> Unpublish
                </Button>
                {bulkLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-[600px]">
              <ScrollArea className="h-full">
                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {filtered.map(item => (
                    <div key={item.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleOne(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingItem(item)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{categoryMap[item.categoryId] || item.categoryId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Switch
                            checked={item.isPublished}
                            onCheckedChange={() => handleTogglePublished(item)}
                            className="scale-75 origin-left"
                          />
                          <span className="text-[10px] text-muted-foreground">{item.isPublished ? 'Published' : 'Draft'}</span>
                        </div>
                        {item.allergens.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.allergens.map(a => (
                              <Badge key={a} variant="outline" className={`text-[9px] px-1.5 py-0 ${ALLERGEN_COLORS[a] || ''}`}>
                                {a}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">
                          <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-center">Published</TableHead>
                        <TableHead>Allergens</TableHead>
                        <TableHead className="w-[60px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggleOne(item.id)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                                {item.imageUrl && item.imageUrl !== '/placeholder.svg' ? (
                                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-muted-foreground/10" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.shortDescription}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{categoryMap[item.categoryId] || item.categoryId}</TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={item.isPublished}
                              onCheckedChange={() => handleTogglePublished(item)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {item.allergens.length > 0 ? item.allergens.map(a => (
                                <Badge key={a} variant="outline" className={`text-[10px] px-1.5 py-0 ${ALLERGEN_COLORS[a] || ''}`}>
                                  {a}
                                </Badge>
                              )) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}>
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No items found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Showing {filtered.length} of {items.length} items
                </p>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <MenuItemEditDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={open => !open && setEditingItem(null)}
        onSave={onUpdate}
        mode="edit"
      />

      {/* Add Dialog */}
      <MenuItemEditDialog
        item={null}
        open={isAdding}
        onOpenChange={setIsAdding}
        onSave={onUpdate}
        onAdd={onAdd}
        mode="add"
      />
    </>
  );
}
