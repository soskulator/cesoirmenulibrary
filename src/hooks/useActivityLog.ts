import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useActivityLog() {
  const { user } = useAuth();

  const logActivity = useCallback(async (
    activityType: string,
    itemName: string,
    itemCategory?: string
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('staff_activity_log')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          item_name: itemName,
          item_category: itemCategory,
        });

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user]);

  return { logActivity };
}
