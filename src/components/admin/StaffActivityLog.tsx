import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Eye, BookOpen, HelpCircle, Wine, Martini, UtensilsCrossed, User, AlertCircle } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  activity_type: string;
  item_name: string;
  item_category: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

const activityIcons: Record<string, typeof Eye> = {
  view: Eye,
  study: BookOpen,
  quiz: HelpCircle,
};

const categoryIcons: Record<string, typeof Wine> = {
  'wine-list': Wine,
  'spirits': Martini,
  'cocktails': Martini,
};

export function StaffActivityLog() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      // Try to fetch activities - the table may not exist yet
      const { data: activityData, error: activityError } = await supabase
        .from('staff_activity_log' as 'profiles') // Type cast to avoid TS error
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) {
        // Check if table doesn't exist
        if (activityError.message.includes('does not exist') || activityError.code === '42P01') {
          setTableExists(false);
          return;
        }
        throw activityError;
      }

      if (!activityData || activityData.length === 0) {
        setActivities([]);
        return;
      }

      // Type cast the data
      const typedData = activityData as unknown as ActivityLogEntry[];

      // Get unique user IDs
      const userIds = [...new Set(typedData.map(a => a.user_id))];

      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Create lookup map
      const profilesMap = new Map(
        (profilesData || []).map(p => [p.id, { email: p.email, name: p.full_name }])
      );

      // Merge activity data with user info
      const enrichedActivities = typedData.map(activity => ({
        ...activity,
        user_email: profilesMap.get(activity.user_id)?.email || 'Unknown',
        user_name: profilesMap.get(activity.user_id)?.name || null,
      }));

      setActivities(enrichedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const Icon = activityIcons[type] || Eye;
    return <Icon className="w-4 h-4" />;
  };

  const getCategoryIcon = (category: string | null) => {
    if (!category) return <UtensilsCrossed className="w-4 h-4" />;
    const Icon = categoryIcons[category] || UtensilsCrossed;
    return <Icon className="w-4 h-4" />;
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'study': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'quiz': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-copper" />
            Staff Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-copper" />
            Staff Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Activity logging is being set up. The database tables are being created.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="w-5 h-5 text-copper" />
          Staff Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No activity recorded yet. Activity will appear as staff view training materials.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-copper/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-copper" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">
                        {activity.user_name || activity.user_email}
                      </span>
                      <Badge className={`text-xs ${getActivityBadgeColor(activity.activity_type)}`}>
                        {getActivityIcon(activity.activity_type)}
                        <span className="ml-1 capitalize">{activity.activity_type}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryIcon(activity.item_category)}
                      <span className="text-sm text-muted-foreground truncate">
                        {activity.item_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
