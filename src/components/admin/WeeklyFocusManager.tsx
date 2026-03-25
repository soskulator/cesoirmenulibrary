import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday,
} from 'date-fns';
import { MenuItem } from '@/data/menuTypes';
import { DbCategory } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Calendar, ChevronLeft, ChevronRight, Wand2, Loader2, Search, Check, Star,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface DayFocus {
  id?: string;
  focus_date: string;
  menu_item_ids: string[];
  cocktail_id: string | null;
  notes: string | null;
}

interface WeeklyFocusManagerProps {
  menuItems: MenuItem[];
  categories: DbCategory[];
}

const BEVERAGE_CATEGORIES = ['wine', 'spirits', 'cocktails'];
const MAX_FOOD_ITEMS = 5;

export function WeeklyFocusManager({ menuItems, categories }: WeeklyFocusManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekData, setWeekData] = useState<Record<string, DayFocus>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);

  // Modal state
  const [modalSearch, setModalSearch] = useState('');
  const [modalFoodIds, setModalFoodIds] = useState<string[]>([]);
  const [modalCocktailId, setModalCocktailId] = useState<string | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
  [weekStart]);

  const foodItems = useMemo(() =>
    menuItems.filter(i => i.isPublished && !BEVERAGE_CATEGORIES.includes(i.categoryId)),
  [menuItems]);

  const cocktailItems = useMemo(() =>
    menuItems.filter(i => i.isPublished && i.categoryId === 'cocktails'),
  [menuItems]);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  // Fetch week data
  const fetchWeek = useCallback(async (start: Date) => {
    setIsLoading(true);
    const end = endOfWeek(start, { weekStartsOn: 1 });
    try {
      const { data, error } = await supabase
        .from('daily_focus_settings')
        .select('*')
        .gte('focus_date', format(start, 'yyyy-MM-dd'))
        .lte('focus_date', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      const map: Record<string, DayFocus> = {};
      (data || []).forEach((d: any) => {
        map[d.focus_date] = {
          id: d.id,
          focus_date: d.focus_date,
          menu_item_ids: d.menu_item_ids || [],
          cocktail_id: d.cocktail_id || null,
          notes: d.notes || null,
        };
      });
      setWeekData(map);
    } catch (err) {
      console.error('Error fetching week focus:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load week on mount and when changing week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = direction === 'next' ? addWeeks(weekStart, 1) : subWeeks(weekStart, 1);
    setWeekStart(newStart);
    fetchWeek(newStart);
  };

  // Initial load
  useState(() => { fetchWeek(weekStart); });

  // Open modal for a day
  const openDayModal = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = weekData[dateStr];
    setSelectedDay(day);
    setModalFoodIds(existing?.menu_item_ids || []);
    setModalCocktailId(existing?.cocktail_id || null);
    setModalNotes(existing?.notes || '');
    setModalSearch('');
  };

  const closeModal = () => setSelectedDay(null);

  const toggleFoodItem = (id: string) => {
    setModalFoodIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_FOOD_ITEMS) return prev;
      return [...prev, id];
    });
  };

  const filteredFood = useMemo(() => {
    if (!modalSearch) return foodItems;
    const q = modalSearch.toLowerCase();
    return foodItems.filter(i => i.name.toLowerCase().includes(q));
  }, [foodItems, modalSearch]);

  // Save day focus
  const handleSave = async () => {
    if (!user || !selectedDay) return;
    setSaving(true);
    const dateStr = format(selectedDay, 'yyyy-MM-dd');
    const existing = weekData[dateStr];

    try {
      if (existing?.id) {
        const { error } = await supabase
          .from('daily_focus_settings')
          .update({
            menu_item_ids: modalFoodIds,
            cocktail_id: modalCocktailId,
            notes: modalNotes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('daily_focus_settings')
          .upsert({
            focus_date: dateStr,
            menu_item_ids: modalFoodIds,
            cocktail_id: modalCocktailId,
            notes: modalNotes || null,
            created_by: user.id,
          }, { onConflict: 'focus_date' });
        if (error) throw error;
      }

      toast({ title: 'Saved', description: `Focus set for ${format(selectedDay, 'EEEE, MMM d')}` });
      await fetchWeek(weekStart);
      closeModal();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Auto-fill week
  const handleAutoFill = async () => {
    if (!user) return;
    setAutoFilling(true);

    try {
      // Get recently used items (last 2 weeks)
      const twoWeeksAgo = format(subWeeks(weekStart, 2), 'yyyy-MM-dd');
      const { data: recentData } = await supabase
        .from('daily_focus_settings')
        .select('menu_item_ids')
        .gte('focus_date', twoWeeksAgo)
        .lt('focus_date', format(weekStart, 'yyyy-MM-dd'));

      const recentIds = new Set((recentData || []).flatMap((d: any) => d.menu_item_ids || []));

      // Group food items by category
      const byCategory: Record<string, MenuItem[]> = {};
      foodItems.forEach(item => {
        const cat = item.categoryId;
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(item);
      });

      const catKeys = Object.keys(byCategory);
      const usedThisWeek = new Set<string>();
      const upserts: any[] = [];

      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayItems: string[] = [];

        // Pick items distributing across categories, preferring unused
        for (let pick = 0; pick < MAX_FOOD_ITEMS && catKeys.length > 0; pick++) {
          const catIndex = pick % catKeys.length;
          const cat = catKeys[catIndex];
          const available = byCategory[cat].filter(
            item => !usedThisWeek.has(item.id) && !dayItems.includes(item.id)
          );

          // Prefer items not recently used
          const preferred = available.filter(item => !recentIds.has(item.id));
          const pool = preferred.length > 0 ? preferred : available;

          if (pool.length > 0) {
            const randomItem = pool[Math.floor(Math.random() * pool.length)];
            dayItems.push(randomItem.id);
            usedThisWeek.add(randomItem.id);
          }
        }

        // Pick a random cocktail (different each day if possible)
        const availableCocktails = cocktailItems.filter(c => !usedThisWeek.has(c.id));
        const cocktailPool = availableCocktails.length > 0 ? availableCocktails : cocktailItems;
        const cocktail = cocktailPool.length > 0
          ? cocktailPool[Math.floor(Math.random() * cocktailPool.length)]
          : null;
        if (cocktail) usedThisWeek.add(cocktail.id);

        upserts.push({
          focus_date: dateStr,
          menu_item_ids: dayItems,
          cocktail_id: cocktail?.id || null,
          created_by: user.id,
          notes: null,
        });
      }

      const { error } = await supabase
        .from('daily_focus_settings')
        .upsert(upserts as any, { onConflict: 'focus_date' });

      if (error) throw error;

      toast({ title: 'Week Auto-Filled', description: '7 days of focus items generated.' });
      await fetchWeek(weekStart);
    } catch (err: any) {
      console.error('Auto-fill error:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setAutoFilling(false);
    }
  };

  const getItemName = (id: string) => menuItems.find(i => i.id === id)?.name || id;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-card shadow-card">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-jade/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-jade" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Daily Focus Manager</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Plan featured items for each day
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-jade/30 text-jade hover:bg-jade/10"
                onClick={handleAutoFill}
                disabled={autoFilling}
              >
                {autoFilling ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />}
                Auto-Fill Week
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-3 sm:px-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const focus = weekData[dateStr];
                  const hasItems = focus && focus.menu_item_ids.length > 0;
                  const today = isToday(day);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => openDayModal(day)}
                      className={`rounded-lg p-2 sm:p-3 cursor-pointer transition-all min-h-[100px] sm:min-h-[120px] border ${
                        today
                          ? 'border-jade bg-jade/5 ring-1 ring-jade/20'
                          : hasItems
                          ? 'border-terra-cotta/30 bg-terra-cotta/5 hover:bg-terra-cotta/10'
                          : 'border-muted hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] sm:text-xs font-medium ${today ? 'text-jade' : 'text-muted-foreground'}`}>
                          {format(day, 'EEE')}
                        </span>
                        <span className={`text-xs sm:text-sm font-bold ${today ? 'text-jade' : ''}`}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      {hasItems ? (
                        <div className="space-y-0.5">
                          {focus.menu_item_ids.slice(0, 3).map(id => (
                            <p key={id} className="text-[9px] sm:text-[10px] text-foreground truncate leading-tight">
                              {getItemName(id)}
                            </p>
                          ))}
                          {focus.menu_item_ids.length > 3 && (
                            <p className="text-[9px] text-muted-foreground">+{focus.menu_item_ids.length - 3} more</p>
                          )}
                          {focus.cocktail_id && (
                            <div className="flex items-center gap-0.5 mt-1">
                              <Star className="w-2.5 h-2.5 text-copper" />
                              <p className="text-[9px] text-copper truncate">{getItemName(focus.cocktail_id)}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-muted-foreground/50 mt-2">Empty</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Day Focus Modal */}
      <Dialog open={!!selectedDay} onOpenChange={open => !open && closeModal()}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="font-serif text-xl">
              {selectedDay ? `Focus for ${format(selectedDay, 'EEEE, MMMM d')}` : 'Set Focus'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] px-6">
            <div className="space-y-5 pb-4">
              {/* Food Items */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">
                  Food Items ({modalFoodIds.length}/{MAX_FOOD_ITEMS})
                </Label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search food items…"
                    value={modalSearch}
                    onChange={e => setModalSearch(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1 pr-2">
                    {filteredFood.map(item => {
                      const selected = modalFoodIds.includes(item.id);
                      const disabled = !selected && modalFoodIds.length >= MAX_FOOD_ITEMS;
                      return (
                        <div
                          key={item.id}
                          onClick={() => !disabled && toggleFoodItem(item.id)}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            selected
                              ? 'bg-terra-cotta/10 border border-terra-cotta/30'
                              : disabled
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox checked={selected} className="pointer-events-none" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{categoryMap[item.categoryId] || item.categoryId}</p>
                          </div>
                          {selected && <Check className="w-4 h-4 text-terra-cotta flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Cocktail of the Day */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Cocktail of the Day</Label>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-1 pr-2">
                    <div
                      onClick={() => setModalCocktailId(null)}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                        !modalCocktailId ? 'bg-copper/10 border border-copper/30' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox checked={!modalCocktailId} className="pointer-events-none" />
                      <p className="text-xs text-muted-foreground italic">None (auto-rotate)</p>
                    </div>
                    {cocktailItems.map(item => {
                      const selected = modalCocktailId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setModalCocktailId(item.id)}
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            selected ? 'bg-copper/10 border border-copper/30' : 'hover:bg-muted/50'
                          }`}
                        >
                          <Checkbox checked={selected} className="pointer-events-none" />
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          {selected && <Star className="w-3.5 h-3.5 text-copper flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <Label htmlFor="focus-notes" className="text-sm font-semibold mb-2 block">Notes (optional)</Label>
                <Textarea
                  id="focus-notes"
                  placeholder="e.g., New dish — extra attention needed"
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || modalFoodIds.length === 0}
              className="bg-terra-cotta hover:bg-terra-cotta/90"
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : 'Save Focus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
