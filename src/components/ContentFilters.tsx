import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export type FilterTab = 'all' | 'food' | 'drinks' | 'tests';

export interface CategoryPill {
  id: string;
  name: string;
  count?: number;
}

interface ContentFiltersProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  categories: CategoryPill[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSearch?: boolean;
}

export function ContentFilters({
  activeTab,
  onTabChange,
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  showSearch = true,
}: ContentFiltersProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="sticky top-0 z-20 bg-cream border-b border-border/50 pb-4">
      {/* Tab Bar and Search */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as FilterTab)}>
          <TabsList className="bg-muted/50 h-10">
            <TabsTrigger value="all" className="px-4 data-[state=active]:bg-white data-[state=active]:text-copper">
              All
            </TabsTrigger>
            <TabsTrigger value="food" className="px-4 data-[state=active]:bg-white data-[state=active]:text-copper">
              Food
            </TabsTrigger>
            <TabsTrigger value="drinks" className="px-4 data-[state=active]:bg-white data-[state=active]:text-copper">
              Drinks
            </TabsTrigger>
            <TabsTrigger value="tests" className="px-4 data-[state=active]:bg-white data-[state=active]:text-copper">
              Tests
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {showSearch && (
          <div className="flex items-center gap-2">
            {isSearchOpen ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-48 h-9 bg-white"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setIsSearchOpen(false);
                    onSearchChange('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === null
                  ? 'bg-copper text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-copper text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                {cat.name}
                {cat.count !== undefined && (
                  <span className="ml-1 opacity-70">({cat.count})</span>
                )}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      )}
    </div>
  );
}
