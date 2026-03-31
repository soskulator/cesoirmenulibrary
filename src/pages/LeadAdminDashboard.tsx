import { useState, useEffect, useMemo, useRef } from 'react'; 
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMenuItems } from '@/hooks/useMenuItems';
// WeeklyFocusManager now handles daily focus directly
import { useCategories, DbCategory } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MenuItemsManager } from '@/components/admin/MenuItemsManager';
import { MenuItemEditDialog } from '@/components/admin/MenuItemEditDialog';
import { PhotoGallery } from '@/components/admin/PhotoGallery';
import { WeeklyFocusManager } from '@/components/admin/WeeklyFocusManager';
import { AllergyManagement } from '@/components/admin/AllergyManagement';
import { MenuIngredientEditor } from '@/components/admin/MenuIngredientEditor';
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
  Loader2,
  BookOpen,
  CalendarDays,
  BarChart2,
  FolderOpen,
  ShieldAlert,
  Link as LinkIcon
} from 'lucide-react';
import { MenuItem } from '@/data/menuTypes';
import { cn } from '@/lib/utils';

export default function LeadAdminDashboard() {
  usePageTitle("Dashboard");
  const { user, isLeadAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Menu items from database
  const { 
    items: menuItems, 
    isLoading: menuLoading, 
    isInitialized,
    initializeFromStatic,
    addItem,
    updateItem,
    deleteItem,
    bulkUpdate,
    fetchItems
  } = useMenuItems();
  
  // Daily Focus now managed by WeeklyFocusManager component
  
  // Categories from database
  const {
    categories,
    isLoading: categoriesLoading,
    isInitialized: categoriesInitialized,
    initializeFromStatic: initializeCategories,
    updateCategory,
    addCategory,
    deleteCategory,
  } = useCategories();
  
  // Menu Management state
  const [activeTab, setActiveTab] = useState<'menu' | 'ingredients' | 'training' | 'schedule' | 'data'>('menu');
  const [menuTab, setMenuTab] = useState<'food' | 'wines' | 'cocktails' | 'spirits'>('food');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  
  // Category editing state
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id: '',
    name: '',
    name_french: '',
    icon: '🍽️',
  });
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [quickStats, setQuickStats] = useState<{
    testsThisWeek: number;
    avgScore: number;
    activeToday: number;
    neverTested: number;
  } | null>(null);

  useEffect(() => {
    const fetchQuickStats = async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { data: attempts },
        { data: sessions },
        { data: profiles },
        { data: testedUsers },
      ] = await Promise.all([
        supabase
          .from('foh_test_attempts')
          .select('percentage')
          .not('completed_at', 'is', null)
          .gte('completed_at', weekAgo.toISOString()),
        supabase
          .from('user_sessions')
          .select('user_id')
          .gte('session_start', today.toISOString()),
        supabase
          .from('profiles')
          .select('id'),
        supabase
          .from('foh_test_attempts')
          .select('user_id')
          .not('completed_at', 'is', null),
      ]);

      const avg = attempts?.length
        ? Math.round(
            attempts.reduce(
              (s, a) => s + (a.percentage || 0), 0
            ) / attempts.length
          )
        : 0;

      const testedIds = new Set(
        (testedUsers || []).map(t => t.user_id)
      );
      const neverTested = (profiles || []).filter(
        p => !testedIds.has(p.id)
      ).length;

      const activeIds = new Set(
        (sessions || []).map(s => s.user_id)
      );

      setQuickStats({
        testsThisWeek: attempts?.length || 0,
        avgScore: avg,
        activeToday: activeIds.size,
        neverTested,
      });
    };
    fetchQuickStats();
  }, []);


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

  // Define beverage category IDs (wine, spirits, cocktails)
  const beverageCategoryIds = ['wine', 'spirits', 'cocktails'];
  
  // Filter menu items by tab
  const filteredMenuItems = useMemo(() => {
    let items: MenuItem[] = [];
    
    switch (menuTab) {
      case 'food':
        items = menuItems.filter(item => 
          !beverageCategoryIds.includes(item.categoryId)
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
  }, [menuTab, menuSearchQuery, menuItems]);

  // Handle photo assignment - updates DB and refreshes items
  const handleAssignPhoto = async (itemId: string, photoUrl: string): Promise<boolean> => {
    const success = await updateItem(itemId, { imageUrl: photoUrl });
    if (success) {
      // Refresh to ensure UI updates
      await fetchItems();
    }
    return success;
  };
  
  // Category dialog handlers
  const openAddCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryFormData({ id: '', name: '', name_french: '', icon: '🍽️' });
    setIsAddingCategory(true);
  };

  const openEditCategoryDialog = (category: DbCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      id: category.id,
      name: category.name,
      name_french: category.name_french,
      icon: category.icon,
    });
    setIsAddingCategory(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name.trim()) return;
    
    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: categoryFormData.name,
        name_french: categoryFormData.name_french,
        icon: categoryFormData.icon,
      });
    } else {
      const newId = categoryFormData.id.trim() || categoryFormData.name.toLowerCase().replace(/\s+/g, '-');
      await addCategory({
        id: newId,
        name: categoryFormData.name,
        name_french: categoryFormData.name_french,
        icon: categoryFormData.icon,
        sort_order: categories.length,
        is_active: true,
      });
    }
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);
    await deleteCategory(id);
    setDeletingCategoryId(null);
  };

  // CSV file input ref
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCSV, setIsUploadingCSV] = useState(false);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingCSV(true);
    
    try {
      // Upload to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('admin-assets')
        .upload(`csv/${fileName}`, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('admin-assets')
        .getPublicUrl(data.path);
      
      toast({
        title: 'CSV Uploaded Successfully',
        description: `${file.name} has been uploaded. Processing will be available soon.`,
      });
      
      // TODO: Parse CSV and import menu items
      console.log('CSV uploaded to:', urlData.publicUrl);
    } catch (error: any) {
      console.error('CSV upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingCSV(false);
      // Reset input
      if (csvInputRef.current) {
        csvInputRef.current.value = '';
      }
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `name,category,shortDescription,longDescription,ingredients,allergens,sellingPoints,question1,answer1,question2,answer2
"French Onion Soup","appetizers","Classic caramelized onion soup with Gruyère crouton","Our signature French onion soup features Vidalia onions slowly caramelized for 4 hours in beef stock, finished with a toasted baguette and melted Gruyère cheese.","Vidalia onions, beef stock, fresh thyme, baguette, Gruyère cheese, butter","gluten,dairy,allium","House-made stock • 4-hour caramelized onions • Imported Gruyère","What makes our French onion soup special?","Our onions are caramelized for 4 hours to develop deep, rich flavor.","Is it gluten-free?","The soup itself is gluten-free, but the traditional crouton contains gluten. We can serve without the crouton upon request."`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'menu-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({
      title: 'Template Downloaded',
      description: 'Check your downloads folder for menu-import-template.csv',
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

          {/* ── Header ── */}
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

            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-terra-cotta to-soft-clay flex items-center justify-center shadow-lg flex-shrink-0">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  Lead Admin Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Menu · Training · Schedule · Data
                </p>
              </div>
            </div>

            {/* ── Quick Stats Strip ── */}
            {quickStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Tests This Week', value: quickStats.testsThisWeek, color: 'text-copper' },
                  { label: 'Avg Score', value: `${quickStats.avgScore}%`, color: quickStats.avgScore >= 70 ? 'text-jade' : 'text-destructive' },
                  { label: 'Active Today', value: quickStats.activeToday, color: 'text-copper' },
                  { label: 'Never Tested', value: quickStats.neverTested, color: quickStats.neverTested > 0 ? 'text-destructive' : 'text-jade' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-card border border-border p-3 text-center shadow-sm">
                    <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Main Tabs ── */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'menu' | 'ingredients' | 'training' | 'schedule' | 'data')}
          >
            <TabsList className="grid grid-cols-5 w-full mb-6 h-auto p-1">
              <TabsTrigger value="menu" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-[11px] sm:text-sm">
                <FolderOpen className="w-4 h-4" />
                <span>Menu</span>
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-[11px] sm:text-sm">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden sm:inline">Menu Editor</span>
                <span className="sm:hidden">Editor</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-[11px] sm:text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Training</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-[11px] sm:text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>Schedule</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex flex-col sm:flex-row items-center gap-1 py-2 text-[11px] sm:text-sm">
                <BarChart2 className="w-4 h-4" />
                <span>Data</span>
              </TabsTrigger>
            </TabsList>

            {/* ════════════ MENU TAB ════════════ */}
            <TabsContent value="menu" className="space-y-6 mt-0">

              {/* Full Menu Editor */}
              <MenuItemsManager
                items={menuItems}
                categories={categories}
                isLoading={menuLoading}
                onUpdate={updateItem}
                onAdd={addItem}
                onBulkUpdate={bulkUpdate}
                onRefresh={fetchItems}
              />

              {/* Menu Management Card — item list with tabs + search */}
              <Card className="bg-card shadow-card">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-terra-cotta/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-terra-cotta" />
                    </div>
                    <div className="flex items-center gap-2">
                      {!isInitialized && (
                        <Button size="sm" variant="outline" onClick={initializeFromStatic} disabled={menuLoading} className="text-xs sm:text-sm">
                          {menuLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                          Sync to DB
                        </Button>
                      )}
                      <Button size="sm" className="bg-terra-cotta hover:bg-terra-cotta/90 text-white text-xs sm:text-sm" onClick={() => setIsAddingItem(true)}>
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Menu Items</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {isInitialized ? <span className="text-jade">✓ Synced to database</span> : 'Click "Sync to DB" to enable persistent storage'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <Tabs value={menuTab} onValueChange={(val) => setMenuTab(val as 'food' | 'wines' | 'cocktails' | 'spirits')} className="mb-4">
                    <TabsList className="w-full grid grid-cols-4 h-auto p-1">
                      <TabsTrigger value="food" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5 sm:w-3 sm:h-3" /><span>Food</span>
                      </TabsTrigger>
                      <TabsTrigger value="wines" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <Wine className="w-3.5 h-3.5 sm:w-3 sm:h-3" /><span>Wines</span>
                      </TabsTrigger>
                      <TabsTrigger value="cocktails" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <Martini className="w-3.5 h-3.5 sm:w-3 sm:h-3" /><span>Cocktails</span>
                      </TabsTrigger>
                      <TabsTrigger value="spirits" className="text-[10px] sm:text-xs py-2 px-1 sm:px-2 flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1">
                        <GlassWater className="w-3.5 h-3.5 sm:w-3 sm:h-3" /><span>Spirits</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search items..." value={menuSearchQuery} onChange={(e) => setMenuSearchQuery(e.target.value)} className="pl-10" />
                  </div>

                  <ScrollArea className="h-[400px]">
                    {menuLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-2 pr-3">
                        {filteredMenuItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                                {item.imageUrl && item.imageUrl !== '/placeholder.svg' ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted-foreground/10">
                                    <span className="text-xs text-muted-foreground">—</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.shortDescription}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item)}>
                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                disabled={deletingId === item.id}
                                onClick={async () => {
                                  if (!isInitialized) {
                                    toast({ title: 'Sync Required', description: 'Please sync menu to database first.', variant: 'destructive' });
                                    return;
                                  }
                                  setDeletingId(item.id);
                                  await deleteItem(item.id);
                                  setDeletingId(null);
                                }}
                              >
                                {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <p className="text-xs text-muted-foreground mt-3 text-center">{filteredMenuItems.length} items</p>
                </CardContent>
              </Card>

              {/* Category Manager + Photo Gallery side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                {/* Category Manager */}
                <Card className="bg-card shadow-card">
                  <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-soft-clay/20 flex items-center justify-center flex-shrink-0">
                        <DatabaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-soft-clay" />
                      </div>
                      <div className="flex items-center gap-2">
                        {!categoriesInitialized && (
                          <Button size="sm" variant="outline" onClick={initializeCategories} disabled={categoriesLoading} className="text-xs sm:text-sm">
                            {categoriesLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}
                            Sync
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="border-soft-clay/30 text-soft-clay hover:bg-soft-clay/10 text-xs sm:text-sm" onClick={openAddCategoryDialog}>
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="font-serif text-lg sm:text-xl">Categories</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {categoriesInitialized ? <span className="text-jade">✓ {categories.length} categories</span> : 'Click "Sync" to enable persistent storage'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      {categoriesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        categories.map((category) => (
                          <div key={category.id} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-move" />
                            <span className="text-lg sm:text-xl">{category.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">{category.name}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{category.name_french}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] sm:text-xs flex-shrink-0">
                              {menuItems.filter(m => m.categoryId === category.id).length}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditCategoryDialog(category)}>
                                <Edit className="w-3 h-3 text-muted-foreground" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" disabled={deletingCategoryId === category.id} onClick={() => handleDeleteCategory(category.id)}>
                                {deletingCategoryId === category.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Gallery */}
                <PhotoGallery menuItems={menuItems} onAssignPhoto={handleAssignPhoto} />
              </div>
            </TabsContent>

            {/* ════════════ MENU EDITOR TAB ════════════ */}
            <TabsContent value="ingredients" className="space-y-6 mt-0">
              <MenuIngredientEditor />
            </TabsContent>

            {/* ════════════ TRAINING TAB ════════════ */}
            <TabsContent value="training" className="space-y-6 mt-0">
              <AllergyManagement categories={categories} />
            </TabsContent>

            {/* ════════════ SCHEDULE TAB ════════════ */}
            <TabsContent value="schedule" className="space-y-6 mt-0">
              <WeeklyFocusManager menuItems={menuItems} categories={categories} />
            </TabsContent>

            {/* ════════════ DATA TAB ════════════ */}
            <TabsContent value="data" className="space-y-6 mt-0">
              {/* Bulk Operations (CSV Import) */}
              <Card className="bg-card shadow-card">
                <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-copper/10 flex items-center justify-center">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
                  </div>
                  <CardTitle className="font-serif text-lg sm:text-xl">Bulk Operations</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Import menu items from CSV</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />

                  <div className="mb-3 sm:mb-4">
                    <Button variant="link" className="p-0 h-auto text-terra-cotta text-xs sm:text-sm" onClick={downloadCSVTemplate}>
                      <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Download CSV Template
                    </Button>
                  </div>

                  <div
                    onClick={() => !isUploadingCSV && csvInputRef.current?.click()}
                    className={`border-2 border-dashed border-muted rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-terra-cotta/50 hover:bg-terra-cotta/5 active:bg-terra-cotta/10 transition-colors ${isUploadingCSV ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted/80 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      {isUploadingCSV ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-terra-cotta animate-spin" /> : <File className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      {isUploadingCSV ? 'Uploading...' : 'Drop CSV file here'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">or tap to browse</p>
                  </div>

                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-jade/10 border border-jade/30">
                    <p className="text-[10px] sm:text-xs text-jade-dark">
                      <strong>✓ Ready:</strong> CSV uploads enabled via Lovable Cloud.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* ── Dialogs (always rendered) ── */}
          <MenuItemEditDialog
            item={editingItem}
            open={!!editingItem}
            onOpenChange={(open) => !open && setEditingItem(null)}
            onSave={updateItem}
            mode="edit"
          />

          <MenuItemEditDialog
            item={null}
            open={isAddingItem}
            onOpenChange={setIsAddingItem}
            onSave={updateItem}
            onAdd={addItem}
            mode="add"
          />

          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {!editingCategory && (
                  <div className="space-y-2">
                    <Label>Category ID</Label>
                    <Input value={categoryFormData.id} onChange={(e) => setCategoryFormData({ ...categoryFormData, id: e.target.value })} placeholder="e.g., appetizers (auto-generated if empty)" />
                    <p className="text-xs text-muted-foreground">Leave empty to auto-generate from name</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} placeholder="e.g., Appetizers" />
                </div>
                <div className="space-y-2">
                  <Label>French Name</Label>
                  <Input value={categoryFormData.name_french} onChange={(e) => setCategoryFormData({ ...categoryFormData, name_french: e.target.value })} placeholder="e.g., Entrées" />
                </div>
                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input value={categoryFormData.icon} onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })} placeholder="e.g., 🍽️" className="text-2xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
                <Button onClick={handleSaveCategory} disabled={!categoryFormData.name.trim()} className="bg-soft-clay hover:bg-soft-clay/90">
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}
