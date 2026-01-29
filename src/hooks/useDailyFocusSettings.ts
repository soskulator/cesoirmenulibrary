import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface DailyFocusSettings {
  id: string;
  focus_date: string;
  menu_item_ids: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useDailyFocusSettings() {
  const [settings, setSettings] = useState<DailyFocusSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchTodaysFocus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('daily_focus_settings')
        .select('*')
        .eq('focus_date', today)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching daily focus:', error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  const saveDailyFocus = useCallback(async (menuItemIds: string[]) => {
    if (!user) return false;

    try {
      setIsSaving(true);

      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('daily_focus_settings')
          .update({ 
            menu_item_ids: menuItemIds,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('daily_focus_settings')
          .insert({
            focus_date: today,
            menu_item_ids: menuItemIds,
            created_by: user.id,
          });

        if (error) throw error;
      }

      toast({
        title: 'Daily Focus Saved',
        description: `${menuItemIds.length} items selected for today's focus.`,
      });

      await fetchTodaysFocus();
      return true;
    } catch (error: any) {
      console.error('Error saving daily focus:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save daily focus.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, settings, today, toast, fetchTodaysFocus]);

  useEffect(() => {
    fetchTodaysFocus();
  }, [fetchTodaysFocus]);

  return {
    settings,
    selectedItemIds: settings?.menu_item_ids || [],
    isLoading,
    isSaving,
    saveDailyFocus,
    fetchTodaysFocus,
  };
}
