import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { TeamStudyProgressChart } from '@/components/admin/TeamStudyProgressChart';
import { MenuItemEditDialog } from '@/components/admin/MenuItemEditDialog';
import { 
  Crown,
  FileText,
  Database as DatabaseIcon,
  Calendar,
  Upload,
  Plus,
  Search,
  GripVertical,
  Download,
  File,
  ArrowLeft,
  Wine,
  Martini,
  GlassWater,
  UtensilsCrossed,
  Edit,
  Trash2,
  Check,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { categories, MenuItem } from '@/data/menuData';

export default function LeadAdminDashboard() {
  const { user, isLeadAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Menu items from database
  const { 
    items: menuItems, 
    isLoading: menuLoading, 
    isInitialized,
    initializeFromStatic,
    updateItem,
    deleteItem,
    fetchItems
  } = useMenuItems();
  
  // Menu Management state
  const [menuTab, setMenuTab] = useState('food');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Daily Focus state
  const [focusSearchQuery, setFocusSearchQuery] = useState('');
  const [selectedFocusItems, setSelectedFocusItems] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isLeadAdmin) {
      navigate('/admin');
      toast({
        title: 'Access Denied',
        description: 'You need Lead Admin permissions to access this page.',
        variant: 'destructive',
      });
    }
  }, [authLoading, user, isLeadAdmin, navigate, toast]);

  // Filter menu items by tab
  const filteredMenuItems = useMemo(() => {
    let items: MenuItem[] = [];
    
    switch (menuTab) {
      case 'food':
        items = menuItems.filter(item => 
          !['wine-list', 'spirits', 'cocktails'].includes(item.categoryId)
        );
        break;
      case 'wines':
        items = menuItems.filter(item => item.categoryId === 'wine');
        break;
      case 'cocktails':
        items = menuItems.filter(item => item.categoryId === 'cocktails');
        break;
      case 'spirits':
        items = menuItems.filter(item => item.categoryId === 'spirits');
        break;
    }
    
    if (menuSearchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        item.shortDescription.toLowerCase().includes(menuSearchQuery.toLowerCase())
      );
    }
    
    return items;
  }, [menuTab, menuSearchQuery]);

  // Filter for daily focus searchable list
  const focusFilteredItems = useMemo(() => {
    if (!focusSearchQuery) return menuItems.slice(0, 20);
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(focusSearchQuery.toLowerCase())
    ).slice(0, 20);
  }, [focusSearchQuery]);

  const toggleFocusItem = (itemId: string) => {
    setSelectedFocusItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSaveDailyFocus = () => {
    toast({
      title: 'Daily Focus Saved',
      description: `${selectedFocusItems.length} items selected for today's focus.`,
    });
  };

  const handleCSVUpload = () => {
    toast({
      title: 'Coming Soon',
      description: 'CSV import functionality will be available soon.',
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="bg-admin-bg min-h-screen">
          <div className="container py-8 max-w-6xl">
            <p className="text-muted-foreground">Checking permissions…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !isLeadAdmin) return null;

  return (
    <Layout>
      <div className="bg-admin-bg min-h-screen">
        <div className="container px-4 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Button 
              variant="ghost" 
              asChild 
              className="mb-3 sm:mb-4 text-muted-foreground hover:text-foreground -ml-2"
            >
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-terra-cotta to-soft-clay flex items-center justify-center shadow-lg flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Lead Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground truncate">
                  Manage menu, categories & analytics
                </p>
              </div>
            </div>
          </div>

          {/* Management Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            
            {/* 1. Menu Management Center */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card className="bg-card shadow-card h-full">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-terra-cotta/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-terra-cotta" />
                    </div>
                    <div className="flex items-center gap-2">
                      {!isInitialized && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={initializeFromStatic}
                          disabled={menuLoading}
                          className="text-xs sm:text-sm"
                        >
                          {menuLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                          )}
                          Sync to DB
                        </Button>
                      )}
                      <Button size="sm" className="bg-terra-cotta hover:bg-terra-cotta/90 text-white text-xs sm:text-sm">
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Menu Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {isInitialized ? (
                      <span className="text-jade">✓ Synced to database</span>
                    ) : (
                      'Click "Sync to DB" to enable persistent storage'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <Tabs value={menuTab} onValueChange={setMenuTab} className="mb-4">
                    <TabsList className="w-full grid grid-cols-4 h-auto p-1">
                      <TabsTrigger value="food" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        <span>Food</span>
                      </TabsTrigger>
                      <TabsTrigger value="wines" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <Wine className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        <span>Wines</span>
                      </TabsTrigger>
                      <TabsTrigger value="cocktails" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <Martini className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        <span>Cocktails</span>
                      </TabsTrigger>
                      <TabsTrigger value="spirits" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <GlassWater className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                        <span>Spirits</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <ScrollArea className="h-[200px]">
                    {menuLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredMenuItems.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{item.shortDescription}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-destructive"
                                disabled={deletingId === item.id}
                                onClick={async () => {
                                  if (!isInitialized) {
                                    toast({
                                      title: 'Sync Required',
                                      description: 'Please sync menu to database first.',
                                      variant: 'destructive',
                                    });
                                    return;
                                  }
                                  setDeletingId(item.id);
                                  await deleteItem(item.id);
                                  setDeletingId(null);
                                }}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Showing {Math.min(8, filteredMenuItems.length)} of {filteredMenuItems.length} items
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 2. Category Manager */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-card shadow-card h-full">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-soft-clay/20 flex items-center justify-center flex-shrink-0">
                      <DatabaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-soft-clay" />
                    </div>
                    <Button size="sm" variant="outline" className="border-soft-clay/30 text-soft-clay hover:bg-soft-clay/10 text-xs sm:text-sm">
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Add Category
                    </Button>
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Category Manager</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Organize and reorder categories</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">Drag to reorder categories</p>
                  <ScrollArea className="h-[260px] sm:h-[280px]">
                    <div className="space-y-1.5 sm:space-y-2">
                      {categories.map((category, index) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-move active:bg-muted"
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-lg sm:text-xl">{category.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{category.name}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{category.nameFrench}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                            {menuItems.filter(m => m.categoryId === category.id).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* 3. Daily Focus Editor */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card shadow-card h-full">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-jade/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-jade" />
                    </div>
                    <Badge variant="outline" className="border-jade/30 text-jade text-[10px] sm:text-xs">
                      {selectedFocusItems.length} Selected
                    </Badge>
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Daily Focus Editor</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select items for daily focus page</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="relative mb-3 sm:mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu items..."
                      value={focusSearchQuery}
                      onChange={(e) => setFocusSearchQuery(e.target.value)}
                      className="pl-10 h-10 text-sm"
                    />
                  </div>
                  
                  <ScrollArea className="h-[160px] sm:h-[180px] mb-3 sm:mb-4">
                    <div className="space-y-1">
                      {focusFilteredItems.map((item) => {
                        const isSelected = selectedFocusItems.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleFocusItem(item.id)}
                            className={`flex items-center gap-2 sm:gap-3 p-2.5 rounded-lg cursor-pointer transition-colors active:scale-[0.98] ${
                              isSelected 
                                ? 'bg-jade/10 border border-jade/30' 
                                : 'bg-muted/50 hover:bg-muted active:bg-muted'
                            }`}
                          >
                            <Checkbox 
                              checked={isSelected}
                              className="border-jade data-[state=checked]:bg-jade data-[state=checked]:border-jade w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-jade flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  <Button 
                    onClick={handleSaveDailyFocus}
                    className="w-full bg-jade hover:bg-jade/90 text-white h-10 sm:h-11 text-sm"
                  >
                    Save Daily Focus
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* 4. Bulk Operations (CSV Import) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card shadow-card h-full">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-copper/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Bulk Operations</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Import menu items from CSV</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="mb-3 sm:mb-4">
                    <Button variant="link" className="p-0 h-auto text-terra-cotta text-xs sm:text-sm">
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Download CSV Template
                    </Button>
                  </div>
                  
                  <div
                    onClick={handleCSVUpload}
                    className="border-2 border-dashed border-muted rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-terra-cotta/50 hover:bg-terra-cotta/5 active:bg-terra-cotta/10 transition-colors"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <File className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      Drop CSV file here
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                      or tap to browse
                    </p>
                  </div>
                  
                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-[10px] sm:text-xs text-amber-700">
                      <strong>Note:</strong> CSV import requires database storage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Analytics Section - Full Width */}
          <Separator className="my-6 sm:my-8" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-serif text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              Analytics: Team Study Progress
            </h2>
            <TeamStudyProgressChart />
          </motion.div>

          {/* Edit Dialog */}
          <MenuItemEditDialog
            item={editingItem}
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            onSave={updateItem}
          />
        </div>
      </div>
    </Layout>
  );
}
