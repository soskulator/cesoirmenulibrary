import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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
  ArrowRight,
  Wine,
  Martini,
  GlassWater,
  UtensilsCrossed,
  Crown,
  Activity,
  TrendingUp,
  RefreshCw,
  Loader2,
  Trophy,
} from 'lucide-react';
import { menuItems, categories } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';

const adminSections = [
  {
    title: 'Quiz Builder',
    description: 'Manage questions, tests & assignments',
    icon: Brain,
    path: '/admin/quiz-builder',
    badge: null as string | null,
    disabled: false,
  },
  {
    title: 'User Management',
    description: 'Staff accounts, invitations & roles',
    icon: Users,
    path: '/admin/users',
    badge: null as string | null,
    disabled: false,
  },
  {
    title: 'Staff Scoring',
    description: 'Performance tracking & leaderboard',
    icon: Trophy,
    path: '/admin/scoring',
    badge: null as string | null,
    disabled: false,
  },
  {
    title: 'Dashboard',
    description: 'Menu items, categories & daily focus',
    icon: Database,
    path: '/admin/dashboard',
    badge: null as string | null,
    disabled: false,
  },
  {
    title: 'Assets & Design',
    description: 'Upload logos, images & brand assets',
    icon: Image,
    path: '/admin/assets',
    badge: null as string | null,
    disabled: false,
  },
];

const getMenuStats = () => {
  const wines = menuItems.filter(item => item.categoryId === 'wine');
  const spirits = menuItems.filter(item => item.categoryId === 'spirits');
  const cocktails = menuItems.filter(item => item.categoryId === 'cocktails');
  const foodItems = menuItems.filter(item =>
    !['wine', 'spirits', 'cocktails'].includes(item.categoryId)
  );

  return {
    wines: wines.length,
    spirits: spirits.length,
    cocktails: cocktails.length,
    foodItems: foodItems.length,
  };
};

export default function AdminPage() {
  usePageTitle("Admin Panel");
  const { user, isAdmin, isLeadAdmin, fullName, loading: authLoading } = useAuth();
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

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMinTimeElapsed(true), 300); return () => clearTimeout(t); }, []);

  if (authLoading || !minTimeElapsed) {
    return (
      <Layout>
        <div className="container py-8 px-4 max-w-5xl">
          <LoadingSpinner message="Checking permissions…" />
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
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-1">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Logged in as {fullName || user.email}
                </p>
              </div>
            </div>
            {isLeadAdmin && (
              <Button
                variant="outline"
                size="icon"
                className="border-jade/30 hover:bg-jade/10 hover:text-jade flex-shrink-0 mt-1"
                onClick={handleSyncMenuData}
                disabled={isSyncing || isMenuLoading}
                title="Sync Menu Data"
              >
                {isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Wines', value: stats.wines, icon: Wine, color: 'rose', trend: TrendingUp },
            { label: 'Spirits', value: stats.spirits, icon: Martini, color: 'amber', trend: Activity },
            { label: 'Cocktails', value: stats.cocktails, icon: GlassWater, color: 'cyan', trend: Activity },
            { label: 'Food Items', value: stats.foodItems, icon: UtensilsCrossed, color: 'emerald', trend: TrendingUp },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 border-${stat.color}-200/50 dark:border-${stat.color}-800/50`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}-500`} />
                    <stat.trend className={`w-3 h-3 sm:w-4 sm:h-4 text-${stat.color}-400`} />
                  </div>
                  <p className={`text-2xl sm:text-3xl font-serif font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Management Sections */}
        <h2 className="font-serif text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Management Sections</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {adminSections.map((section, index) => (
            <motion.div
              key={section.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link to={section.path}>
                <Card className="h-full hover:shadow-card-hover transition-all hover:-translate-y-1 group active:scale-[0.98]">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors">
                        <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-copper" />
                      </div>
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
            </motion.div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
