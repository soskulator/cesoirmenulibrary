import { useState, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAllergenModifications } from '@/hooks/useAllergenModifications';
import { allergens, AllergenType, getCategoryById, isDietaryType } from '@/data/menuTypes';
import { CheckCircle2, AlertTriangle, XCircle, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function AllergenMenuPage() {
  usePageTitle('Allergen Menu');
  const [selected, setSelected] = useState<AllergenType | null>(null);
  const { items } = useMenuItems();
  const { modifications } = useAllergenModifications();

  const foodItems = useMemo(() =>
    items.filter(i =>
      i.isPublished &&
      !['wine', 'spirits', 'cocktails'].includes(i.categoryId)
    ),
    [items]
  );

  const grouped = useMemo(() => {
    if (!selected) return null;

    const safe: typeof foodItems = [];
    const modifiable: typeof foodItems = [];
    const cannot: typeof foodItems = [];

    const isDietary = isDietaryType(selected);

    foodItems.forEach(item => {
      if (isDietary) {
        // Dietary: item tagged with this = safe, not tagged = cannot accommodate
        if (item.allergens.includes(selected)) {
          safe.push(item);
        } else {
          cannot.push(item);
        }
      } else {
        // Allergen: item tagged = contains allergen (check if modifiable)
        const hasAllergen = item.allergens.includes(selected);

        if (!hasAllergen) {
          safe.push(item);
          return;
        }

        const mod = modifications.find(
          m => m.menu_item_id === item.id && m.allergen_type === selected
        );

        if (mod?.can_remove) {
          modifiable.push(item);
        } else {
          cannot.push(item);
        }
      }
    });

    return { safe, modifiable, cannot };
  }, [selected, foodItems, modifications]);

  return (
    <Layout>
      <div className="container max-w-2xl py-6 sm:py-8 px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/allergy"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Allergy Center
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1">
            Per-Allergen Menu
          </h1>
          <p className="text-sm text-muted-foreground">
            Select an allergen or dietary preference to see the full modified menu
          </p>
        </div>

        {/* Allergen & dietary selector */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 mb-8">
          {allergens.map(allergen => {
            const isActive = selected === allergen.id;
            const isDietary = allergen.isDietary;
            return (
              <button
                key={allergen.id}
                onClick={() => setSelected(isActive ? null : allergen.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 transition-all min-h-[4rem]",
                  isActive && isDietary
                    ? "border-jade bg-jade/10 scale-95"
                    : isActive
                    ? "border-copper bg-copper/10 scale-95"
                    : isDietary
                    ? "border-border bg-card hover:border-jade/40"
                    : "border-border bg-card hover:border-copper/40"
                )}
              >
                <span className="text-xl leading-none">{allergen.icon}</span>
                <span className={cn(
                  "text-[9px] font-medium leading-tight text-center",
                  isActive && isDietary ? "text-jade" : isActive ? "text-copper" : "text-muted-foreground"
                )}>
                  {allergen.commonName.split('/')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {!selected && (
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Tap an allergen or dietary preference above to see the filtered menu</p>
          </div>
        )}

        {/* Results */}
        {selected && grouped && (() => {
          const allergenInfo = allergens.find(a => a.id === selected);
          return (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-copper">
                  {allergenInfo?.icon} {allergenInfo?.name} menu — {grouped.modifiable.length} modifiable, {grouped.cannot.length} to avoid
                </p>
              </div>

              {/* Modifiable */}
              {grouped.modifiable.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-copper" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Modifiable ({grouped.modifiable.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {grouped.modifiable.map(item => {
                      const mod = modifications.find(
                        m => m.menu_item_id === item.id && m.allergen_type === selected
                      );
                      const cat = getCategoryById(item.categoryId);
                      return (
                        <Card key={item.id} className="border-copper/30 bg-copper/5">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-base mt-0.5 opacity-60">{cat?.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">{item.name}</p>
                                {mod?.substitution_notes && (
                                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                    {mod.substitution_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Cannot Accommodate */}
              {grouped.cannot.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4 text-destructive" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Cannot Accommodate ({grouped.cannot.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {grouped.cannot.map(item => {
                      const mod = modifications.find(
                        m => m.menu_item_id === item.id && m.allergen_type === selected
                      );
                      const cat = getCategoryById(item.categoryId);
                      return (
                        <Card key={item.id} className="border-destructive/20 bg-destructive/5 opacity-75">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-base mt-0.5 opacity-40">{cat?.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-muted-foreground">{item.name}</p>
                                {mod?.substitution_notes && (
                                  <p className="text-xs text-destructive/70 mt-1 leading-relaxed">
                                    {mod.substitution_notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Safe */}
              {grouped.safe.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-jade" />
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Safe as-is ({grouped.safe.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {grouped.safe.map(item => {
                      const cat = getCategoryById(item.categoryId);
                      return (
                        <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-jade/5 border border-jade/15">
                          <span className="text-sm opacity-50">{cat?.icon}</span>
                          <p className="text-xs font-medium truncate">{item.name}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          );
        })()}
      </div>
    </Layout>
  );
}
