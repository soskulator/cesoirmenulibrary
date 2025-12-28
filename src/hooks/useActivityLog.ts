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
      // Type cast to avoid TS error since table may not exist in generated types yet
      const { error } = await supabase
        .from('staff_activity_log' as 'profiles')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          item_name: itemName,
          item_category: itemCategory,
        } as never);

      if (error) {
        // Silently fail if table doesn't exist yet
        if (!error.message.includes('does not exist')) {
          console.error('Error logging activity:', error);
        }
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user]);

  return { logActivity };
}
