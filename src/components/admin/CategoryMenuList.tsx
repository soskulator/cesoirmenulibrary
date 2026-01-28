import { useState, useMemo } from 'react';
import { MenuItem, categories, Category } from '@/data/menuData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  ChevronDown,
  ImageIcon,
  ImageOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CategoryMenuListProps {
  items: MenuItem[];
  categoryFilter: 'food' | 'wines' | 'cocktails' | 'spirits';
  isInitialized: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function CategoryMenuList({ 
  items, 
  categoryFilter,
  isInitialized,
  onEdit, 
  onDelete 
}: CategoryMenuListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Define which categories belong to which filter
  const beverageCategoryIds = ['wine', 'spirits', 'cocktails'];
  const foodCategoryIds = ['appetizers', 'entrees', 'sides', 'desserts', 'specials'];

  // Get applicable categories based on filter
  const applicableCategories = useMemo(() => {
    switch (categoryFilter) {
      case 'food':
        return categories.filter(c => foodCategoryIds.includes(c.id));
      case 'wines':
        return categories.filter(c => c.id === 'wine');
      case 'cocktails':
        return categories.filter(c => c.id === 'cocktails');
      case 'spirits':
        return categories.filter(c => c.id === 'spirits');
      default:
        return [];
    }
  }, [categoryFilter]);

  // Filter and group items by category
  const groupedItems = useMemo(() => {
    let filteredItems = items;

    // Apply search filter
    if (searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Group by category
    return applicableCategories.map(category => ({
      category,
      items: filteredItems.filter(item => item.categoryId === category.id),
    })).filter(group => group.items.length > 0 || !searchQuery);
  }, [items, searchQuery, applicableCategories]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Expand all by default
  useState(() => {
    setExpandedCategories(new Set(applicableCategories.map(c => c.id)));
  });

  const handleDelete = async (item: MenuItem) => {
    if (!isInitialized) {
      toast({
        title: 'Sync Required',
        description: 'Please sync menu to database first.',
        variant: 'destructive',
      });
      return;
    }
    
    setDeletingId(item.id);
    await onDelete(item.id);
    setDeletingId(null);
  };

  const totalItems = groupedItems.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[340px]">
        <div className="space-y-2 pr-3">
          {groupedItems.map(({ category, items: categoryItems }) => (
            <Collapsible
              key={category.id}
              open={expandedCategories.has(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryItems.length}
                    </Badge>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      expandedCategories.has(category.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="space-y-1.5 mt-1.5 ml-3 border-l-2 border-muted pl-3">
                  {categoryItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No items in this category
                    </p>
                  ) : (
                    categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-background border hover:border-terra-cotta/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Photo thumbnail */}
                          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                            {item.imageUrl && item.imageUrl !== '/placeholder.svg' ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className="w-4 h-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.shortDescription}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item)}
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground text-center">
        {totalItems} items total
      </p>
    </div>
  );
}
