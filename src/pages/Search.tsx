import { useState, useMemo } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/data/menuData';
import { Search, UtensilsCrossed, Wine, Martini, GlassWater, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEST: Record<string, string> = {
  crudo: '/categories/crudo',
  appetizers: '/categories/appetizers',
  'fruits-de-mer': '/categories/fruits-de-mer',
  pasta: '/categories/pasta',
  entrees: '/categories/entrees',
  sides: '/categories/sides',
  desserts: '/categories/desserts',
  sauces: '/categories/sauces',
  wine: '/wine-list',
  spirits: '/spirits',
  cocktails: '/cocktails',
};

const CAT_PERMISSION: Record<string, string> = {
  wine: 'page:wine-list',
  spirits: 'page:spirits',
  cocktails: 'page:cocktails',
};

const CAT_ICON: Record<string, typeof Search> = {
  wine: Wine,
  spirits: GlassWater,
  cocktails: Martini,
};

const CAT_COLOR: Record<string, string> = {
  wine: 'text-burgundy',
  spirits: 'text-copper',
  cocktails: 'text-gold',
};

export default function SearchPage() {
  usePageTitle("Search");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { items, isLoading } = useMenuItems();
  const { hasPermission } = useAuth();

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return items.filter(item => {
      if (!item.isPublished) return false;
      const permKey = CAT_PERMISSION[item.categoryId];
      if (permKey && !hasPermission(permKey)) return false;
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortDescription.toLowerCase().includes(q) ||
        item.ingredientsText.toLowerCase().includes(q) ||
        item.sellingPointsText.toLowerCase().includes(q) ||
        item.allergens.some(a => a.toLowerCase().includes(q))
      );
    });
  }, [query, items, hasPermission]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof results> = {};
    results.forEach(item => {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    });
    return map;
  }, [results]);

  return (
    <Layout>
      <div className="container max-w-2xl py-6 sm:py-8 px-3 sm:px-4">

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search dishes, wines, cocktails, spirits..."
            value={query}
            onChange={(e) => setSearchParams(
              e.target.value ? { q: e.target.value } : {}
            )}
            className="pl-9 h-12 text-base"
          />
        </div>

        {/* Empty state - no query */}
        {query.trim().length < 2 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              Type at least 2 characters to search across the entire menu, wine list, cocktails and spirits
            </p>
          </div>
        )}

        {/* No results */}
        {query.trim().length >= 2 && results.length === 0 && !isLoading && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">
              No results for <strong>"{query}"</strong>
            </p>
            <p className="text-xs mt-1 opacity-60">
              Try a dish name, ingredient, or allergen
            </p>
          </div>
        )}

        {/* Results grouped by category */}
        {Object.entries(grouped).map(([catId, catItems]) => {
          const cat = categories.find(c => c.id === catId);
          const dest = DEST[catId] || '/categories';
          const Icon = CAT_ICON[catId] || UtensilsCrossed;
          const color = CAT_COLOR[catId] || 'text-sage';
          return (
            <div key={catId} className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-4 h-4", color)} />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat?.name || catId}
                  <span className="ml-1.5 opacity-60">({catItems.length})</span>
                </h2>
              </div>
              <div className="space-y-2">
                {catItems.map(item => (
                  <Link
                    key={item.id}
                    to={dest}
                    className="group flex items-start justify-between p-3 rounded-xl border border-border hover:border-copper/40 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-medium text-sm group-hover:text-copper transition-colors truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.shortDescription}
                      </p>
                      {item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.allergens.slice(0, 4).map(a => (
                            <Badge
                              key={a}
                              variant="outline"
                              className="text-[9px] px-1 py-0 border-destructive/30 text-destructive/70"
                            >
                              {a}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Result count */}
        {results.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4 pb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        )}
      </div>
    </Layout>
  );
}