import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/data/menuTypes';
import { Search, UtensilsCrossed, Wine, Martini, GlassWater, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
  wine: 'text-copper',
  spirits: 'text-copper',
  cocktails: 'text-copper',
};

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-copper/20 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface HeaderSearchProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: 'top' | 'bottom';
}

export function HeaderSearch({ isOpen, onClose, origin = 'top' }: HeaderSearchProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { items } = useMenuItems();
  const { hasPermission } = useAuth();

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (normalizedQuery.length < 2) return [];
    return items.filter((item) => {
      if (!item.isPublished) return false;
      const permKey = CAT_PERMISSION[item.categoryId];
      if (permKey && !hasPermission(permKey)) return false;
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.allergens.some((a) => a.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [normalizedQuery, items, hasPermission]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof results> = {};
    results.forEach((item) => {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    });
    return map;
  }, [results]);

  const handleSelect = (itemId: string) => {
    onClose();
    navigate(`/flashcards?item=${itemId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-[55]"
            onClick={onClose}
          />

          {/* Search Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: origin === 'bottom' ? 40 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: origin === 'bottom' ? 40 : -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              "fixed left-0 right-0 z-[60] bg-background shadow-xl",
              origin === 'bottom'
                ? "bottom-0 border-t border-border pb-[env(safe-area-inset-bottom)]"
                : "top-0 border-b border-border pt-[env(safe-area-inset-top)]"
            )}
          >
            <div className="container max-w-2xl px-3 sm:px-4 py-3 flex flex-col-reverse md:flex-col">
              {/* Input row — renders at bottom on mobile via flex-col-reverse */}
              <div className="relative flex items-center gap-2 mt-2 md:mt-0 md:mb-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={inputRef}
                  autoFocus
                  placeholder="Search dishes, wines, allergens..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-11 text-base flex-1"
                />
                <button
                  onClick={onClose}
                  className="flex-shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Results — renders above input on mobile */}
              <div className="md:mt-2 max-h-[50vh] overflow-y-auto overscroll-contain">
                {normalizedQuery.length < 2 && (
                  <p className="text-center text-xs text-muted-foreground py-8 opacity-60">
                    Type at least 2 characters
                  </p>
                )}

                {normalizedQuery.length >= 2 && results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">
                      No results for <strong>&quot;{query}&quot;</strong>
                    </p>
                    <p className="text-xs mt-1 opacity-60">Try a dish name or allergen</p>
                  </div>
                )}

                {Object.entries(grouped).map(([catId, catItems]) => {
                  const cat = categories.find((c) => c.id === catId);
                  const Icon = CAT_ICON[catId] || UtensilsCrossed;
                  const color = CAT_COLOR[catId] || 'text-sage';

                  return (
                    <div key={catId} className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <Icon className={cn('w-3.5 h-3.5', color)} />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {cat?.name || catId}
                          <span className="ml-1 opacity-60">({catItems.length})</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        {catItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className="group w-full flex items-start justify-between p-2.5 rounded-lg border border-border hover:border-copper/40 hover:bg-muted/50 transition-all text-left"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <p className="font-medium text-sm group-hover:text-copper transition-colors truncate">
                                <Highlight text={item.name} query={normalizedQuery} />
                              </p>
                              {item.shortDescription && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {item.shortDescription}
                                </p>
                              )}
                              {item.allergens.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.allergens.map((a) => (
                                    <Badge
                                      key={a}
                                      variant="outline"
                                      className="text-[9px] px-1 py-0 border-destructive/30 text-destructive/70"
                                    >
                                      <Highlight text={a} query={normalizedQuery} />
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {results.length > 0 && (
                  <p className="text-center text-[10px] text-muted-foreground mt-2 pb-2">
                    {results.length} result{results.length !== 1 ? 's' : ''} · tap to open flashcard
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
