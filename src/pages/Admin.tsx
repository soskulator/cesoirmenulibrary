import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Database,
  Brain,
  Users, 
  Image,
  Lock,
  ArrowRight,
  Wine,
  Martini,
  GlassWater,
  UtensilsCrossed,
  Shield,
  Crown,
  Activity,
  TrendingUp,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { menuItems, categories } from '@/data/menuData';
import { StaffActivityLog } from '@/components/admin/StaffActivityLog';
import { QuizPerformanceDashboard } from '@/components/admin/QuizPerformanceDashboard';
import { useMenuItems } from '@/hooks/useMenuItems';

const adminSections = [
  {
    title: 'Dashboard',
    description: 'Menu items, categories, CSV import & daily focus',
    icon: Database,
    path: '/admin/dashboard',
    badge: null,
    disabled: false,
  },
  {
    title: 'Quiz Builder',
    description: 'Manage questions, tests & assignments',
    icon: Brain,
    path: '/admin/quiz-builder',
    badge: null,
    disabled: false,
  },
  {
    title: 'Assets & Design',
    description: 'Upload logos, images, and brand assets',
    icon: Image,
    path: '/admin/assets',
    badge: null,
    disabled: false,
  },
  {
    title: 'User Management',
    description: 'Manage admin and staff access',
    icon: Users,
    path: '/admin/users',
    badge: null,
    disabled: false,
  },
];

// Calculate actual stats from menu data
const getMenuStats = () => {
  const wines = menuItems.filter(item => item.categoryId === 'wine');
  const spirits = menuItems.filter(item => item.categoryId === 'spirits');
  const cocktails = menuItems.filter(item => item.categoryId === 'cocktails');
  const foodItems = menuItems.filter(item => 
    !['wine', 'spirits', 'cocktails'].includes(item.categoryId)
  );
  
  const totalQuestions = menuItems.reduce((acc, item) => acc + item.questions.length, 0);
  const uniqueAllergens = new Set(menuItems.flatMap(item => item.allergens));
  
  return {
    totalItems: menuItems.length,
    categories: categories.length,
    wines: wines.length,
    spirits: spirits.length,
    cocktails: cocktails.length,
    foodItems: foodItems.length,
    allergens: uniqueAllergens.size,
    questions: totalQuestions,
  };
};

export default function AdminPage() {
  const { user, isAdmin, isLeadAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const stats = getMenuStats();
  const { fetchItems, isLoading: isMenuLoading } = useMenuItems();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncMenuData = async () => {
    setIsSyncing(true);
    try {
      await fetchItems();
      toast({
        title: 'Menu Data Synced',
        description: 'All training materials now use the latest menu data.',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Could not refresh menu data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You need admin permissions to access this page.',
        variant: 'destructive',
      });
    }
  }, [authLoading, user, isAdmin, navigate, toast]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 px-4 max-w-5xl">
          <p className="text-muted-foreground">Checking permissions…</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) return null;

  return (
    <Layout>
      <div className="py-6 sm:py-8 px-4 max-w-5xl mx-auto w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-copper to-copper-light flex items-center justify-center shadow-lg flex-shrink-0">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold">Admin Center</h1>
                {isLeadAdmin && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Lead Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage menu content, users, and settings
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-200/50 dark:border-rose-800/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <Wine className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-rose-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-rose-600 dark:text-rose-400">{stats.wines}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Wines</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-200/50 dark:border-amber-800/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <Martini className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 dark:text-amber-400">{stats.spirits}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Spirits</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-200/50 dark:border-cyan-800/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <GlassWater className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-cyan-600 dark:text-cyan-400">{stats.cocktails}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Cocktails</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-200/50 dark:border-emerald-800/50">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 dark:text-emerald-400">{stats.foodItems}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Food Items</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions for Lead Admin */}
        {isLeadAdmin && (
          <Card className="mb-6 sm:mb-8 border-copper/30 bg-gradient-to-r from-copper/5 to-transparent">
            <CardHeader className="pb-3 px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
                <CardTitle className="text-base sm:text-lg">Lead Admin Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button asChild variant="outline" size="sm" className="border-copper/30 hover:bg-copper/10 hover:text-copper text-xs sm:text-sm">
                  <Link to="/admin/dashboard">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-copper/30 hover:bg-copper/10 hover:text-copper text-xs sm:text-sm">
                  <Link to="/admin/users">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Invite Staff
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-copper/30 hover:bg-copper/10 hover:text-copper text-xs sm:text-sm">
                  <Link to="/admin/assets">
                    <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Assets
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-jade/30 hover:bg-jade/10 hover:text-jade text-xs sm:text-sm"
                  onClick={handleSyncMenuData}
                  disabled={isSyncing || isMenuLoading}
                >
                  {isSyncing ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  )}
                  Sync Menu
                </Button>
                <Button asChild variant="outline" size="sm" className="border-copper/30 hover:bg-copper/10 hover:text-copper text-xs sm:text-sm">
                  <Link to="/admin/seed-questions">
                    <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Seed Questions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Notice */}
        <Card className="mb-6 sm:mb-8 bg-burgundy/5 border-burgundy/20">
          <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-burgundy flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-burgundy text-sm sm:text-base">Authentication Active</h3>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Logged in as {user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin Sections */}
        <h2 className="font-serif text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Management Sections</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.path + section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              {section.disabled ? (
                <Card className="h-full opacity-60">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                      </div>
                      {section.badge && (
                        <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base sm:text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Link to={section.path}>
                  <Card className="h-full hover:shadow-card-hover transition-all hover:-translate-y-1 group active:scale-[0.98]">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-start justify-between">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors">
                          <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
                        </div>
                        {section.badge && (
                          <Badge variant="gold" className="text-xs">{section.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base sm:text-lg group-hover:text-burgundy transition-colors">
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                      <Button variant="link" className="p-0 h-auto text-burgundy text-sm">
                        Open
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Detailed Stats */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Complete Menu Overview</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-copper">{stats.totalItems}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Items</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-copper">{stats.categories}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Categories</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-copper">{stats.allergens}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Allergen Types</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-serif font-bold text-copper">{stats.questions}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Test Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Dashboards - Lead Admin Only */}
        {isLeadAdmin && (
          <>
            <h2 className="font-serif text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Staff Insights</h2>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StaffActivityLog />
              <QuizPerformanceDashboard />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
