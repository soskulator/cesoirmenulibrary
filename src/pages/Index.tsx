import { useState, useMemo } from 'react';
import { BookOpen, Brain, AlertTriangle, GraduationCap, FileText } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { MainSidebar, MobileBottomNav } from '@/components/MainSidebar';
import { ContentCard, CategoryCard, StudyCard } from '@/components/ContentCard';
import { ContentFilters, FilterTab, CategoryPill } from '@/components/ContentFilters';
import { categories, menuItems, getCategoryById } from '@/data/menuData';
import { getCategoryIcon } from '@/data/categoryIcons';
import { getDishImage } from '@/data/dishImages';
import { useDailyRotation } from '@/hooks/useDailyRotation';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import logoImage from '@/assets/cesoir-logo.png';

// Category images from assets
import appetizersImg from '@/assets/categories/appetizers-illustrated.jpg';
import entreesImg from '@/assets/categories/entrees-illustrated.jpg';
import dessertsImg from '@/assets/categories/desserts-illustrated.jpg';
import sidesImg from '@/assets/categories/sides-illustrated.jpg';
import specialsImg from '@/assets/categories/specials-illustrated.jpg';
import wineImg from '@/assets/categories/wine-illustrated.jpg';
import spiritsImg from '@/assets/categories/spirits-illustrated.jpg';
import cocktailsImg from '@/assets/categories/cocktails-illustrated.jpg';

const categoryImages: Record<string, string> = {
  appetizers: appetizersImg,
  entrees: entreesImg,
  desserts: dessertsImg,
  sides: sidesImg,
  specials: specialsImg,
  wine: wineImg,
  spirits: spiritsImg,
  cocktails: cocktailsImg,
};

// Study modes data
const studyModes = [
  {
    title: 'Flashcards',
    description: 'Study with interactive flip cards',
    icon: <BookOpen className="w-full h-full" />,
    link: '/flashcards',
    color: 'charcoal' as const,
  },
  {
    title: 'Food Quiz',
    description: 'Test your menu knowledge',
    icon: <Brain className="w-full h-full" />,
    link: '/food-quiz',
    color: 'copper' as const,
  },
  {
    title: 'Wine Quiz',
    description: 'Master the wine list',
    icon: <GraduationCap className="w-full h-full" />,
    link: '/wine-quiz',
    color: 'sage' as const,
  },
  {
    title: 'FOH Test',
    description: 'Complete server certification',
    icon: <FileText className="w-full h-full" />,
    link: '/foh-test',
    color: 'copper' as const,
  },
  {
    title: 'Allergy Center',
    description: 'Quick allergen reference',
    icon: <AlertTriangle className="w-full h-full" />,
    link: '/allergy',
    color: 'sage' as const,
  },
];

// Food categories
const foodCategoryIds = ['appetizers', 'entrees', 'desserts', 'sides', 'specials'];
// Drink categories
const drinkCategoryIds = ['wine', 'spirits', 'cocktails'];

export default function Index() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  // Get daily focus items
  const { foodItems: dailyFoodItems } = useDailyRotation(3, 1);

  // Build category pills based on active tab
  const categoryPills: CategoryPill[] = useMemo(() => {
    let filteredCategories = categories;
    
    if (activeTab === 'food') {
      filteredCategories = categories.filter(c => foodCategoryIds.includes(c.id));
    } else if (activeTab === 'drinks') {
      filteredCategories = categories.filter(c => drinkCategoryIds.includes(c.id));
    } else if (activeTab === 'tests') {
      return []; // No category pills for tests
    }

    return filteredCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: menuItems.filter(i => i.categoryId === cat.id && i.isPublished).length,
    }));
  }, [activeTab]);

  // Filter and sort content based on tab, category, and search
  const filteredContent = useMemo(() => {
    // For tests tab, return study modes
    if (activeTab === 'tests') {
      return studyModes.filter(mode =>
        searchQuery === '' ||
        mode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mode.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter categories first
    let relevantCategories = categories;
    if (activeTab === 'food') {
      relevantCategories = categories.filter(c => foodCategoryIds.includes(c.id));
    } else if (activeTab === 'drinks') {
      relevantCategories = categories.filter(c => drinkCategoryIds.includes(c.id));
    }

    // If a specific category is selected, show items from that category
    if (activeCategory) {
      const items = menuItems.filter(item => 
        item.categoryId === activeCategory && 
        item.isPublished &&
        (searchQuery === '' ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return items;
    }

    // Otherwise show categories
    return relevantCategories.filter(cat =>
      searchQuery === '' ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.nameFrench.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, activeCategory, searchQuery]);

  // Check if we're showing menu items or categories
  const isShowingItems = activeCategory !== null && activeTab !== 'tests';
  const isShowingTests = activeTab === 'tests';

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-cream">
        {/* Desktop Sidebar */}
        <MainSidebar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 bg-cream border-b border-border/50 px-4 py-3 flex items-center gap-4">
            <SidebarTrigger className="hidden md:flex" />
            
            {/* Mobile Logo */}
            <div className="md:hidden flex-1">
              <img src={logoImage} alt="Ce Soir" className="h-8" />
            </div>

            {/* Page Title */}
            <h1 className="hidden md:block font-serif text-xl font-semibold text-charcoal">
              Menu Library
            </h1>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 md:p-6 pb-24 md:pb-6">
                {/* Filters */}
                <ContentFilters
                  activeTab={activeTab}
                  onTabChange={(tab) => {
                    setActiveTab(tab);
                    setActiveCategory(null);
                  }}
                  categories={categoryPills}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* Daily Focus Section - Only on "all" tab with no category selected */}
                {activeTab === 'all' && !activeCategory && !searchQuery && dailyFoodItems.length > 0 && (
                  <div className="mb-8">
                    <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">
                      Today's Focus
                    </h2>
                    <div className="space-y-3">
                      {dailyFoodItems.map((item) => {
                        const category = getCategoryById(item.categoryId);
                        const image = getDishImage(item.id);
                        return (
                          <ContentCard
                            key={item.id}
                            id={item.id}
                            title={item.name}
                            description={item.shortDescription}
                            image={image}
                            category={category?.name || 'Menu'}
                            categoryColor="copper"
                            link={`/categories/${item.categoryId}`}
                            isFeatured
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content Grid */}
                <div className="space-y-3">
                  {/* Section Title */}
                  {!isShowingTests && (
                    <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">
                      {isShowingItems
                        ? categories.find(c => c.id === activeCategory)?.name || 'Items'
                        : activeTab === 'food'
                          ? 'Food Categories'
                          : activeTab === 'drinks'
                            ? 'Drink Categories'
                            : 'All Categories'}
                    </h2>
                  )}

                  {isShowingTests && (
                    <h2 className="font-serif text-lg font-semibold text-charcoal mb-3">
                      Study & Tests
                    </h2>
                  )}

                  {/* Render content based on type */}
                  {isShowingTests ? (
                    // Study modes
                    (filteredContent as typeof studyModes).map((mode) => (
                      <StudyCard
                        key={mode.title}
                        title={mode.title}
                        description={mode.description}
                        icon={mode.icon}
                        link={mode.link}
                        color={mode.color}
                      />
                    ))
                  ) : isShowingItems ? (
                    // Menu items
                    (filteredContent as typeof menuItems).map((item) => {
                      const category = getCategoryById(item.categoryId);
                      const image = getDishImage(item.id);
                      return (
                        <ContentCard
                          key={item.id}
                          id={item.id}
                          title={item.name}
                          description={item.shortDescription}
                          image={image}
                          category={category?.name || 'Menu'}
                          categoryColor="copper"
                          link={`/categories/${item.categoryId}`}
                        />
                      );
                    })
                  ) : (
                    // Categories
                    (filteredContent as typeof categories).map((cat) => {
                      const itemCount = menuItems.filter(i => i.categoryId === cat.id && i.isPublished).length;
                      const categoryImage = categoryImages[cat.id];
                      return (
                        <CategoryCard
                          key={cat.id}
                          id={cat.id}
                          name={cat.name}
                          nameFrench={cat.nameFrench}
                          itemCount={itemCount}
                          icon={cat.icon}
                          image={categoryImage}
                          link={`/categories/${cat.id}`}
                        />
                      );
                    })
                  )}

                  {/* Empty state */}
                  {filteredContent.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">No items found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
