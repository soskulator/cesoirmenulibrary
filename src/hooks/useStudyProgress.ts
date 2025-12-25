import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudyProgressItem {
  menu_item_name: string;
  is_known: boolean;
  studied_at: string;
}

export function useStudyProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch progress on mount
  useEffect(() => {
    if (!user) {
      setProgress(new Map());
      setIsLoading(false);
      return;
    }

    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_progress')
        .select('menu_item_name, is_known')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map<string, boolean>();
      (data || []).forEach(item => {
        progressMap.set(item.menu_item_name, item.is_known);
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Error fetching study progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsKnown = useCallback(async (menuItemName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_progress')
        .upsert({
          user_id: user.id,
          menu_item_name: menuItemName,
          is_known: true,
          studied_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,menu_item_name',
        });

      if (error) throw error;

      setProgress(prev => {
        const next = new Map(prev);
        next.set(menuItemName, true);
        return next;
      });
    } catch (error) {
      console.error('Error marking as known:', error);
    }
  }, [user]);

  const markForReview = useCallback(async (menuItemName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_progress')
        .upsert({
          user_id: user.id,
          menu_item_name: menuItemName,
          is_known: false,
          studied_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,menu_item_name',
        });

      if (error) throw error;

      setProgress(prev => {
        const next = new Map(prev);
        next.set(menuItemName, false);
        return next;
      });
    } catch (error) {
      console.error('Error marking for review:', error);
    }
  }, [user]);

  const isKnown = useCallback((menuItemName: string): boolean => {
    return progress.get(menuItemName) === true;
  }, [progress]);

  const isStudied = useCallback((menuItemName: string): boolean => {
    return progress.has(menuItemName);
  }, [progress]);

  const getStats = useCallback(() => {
    let known = 0;
    let review = 0;
    progress.forEach(isKnown => {
      if (isKnown) known++;
      else review++;
    });
    return { known, review, total: progress.size };
  }, [progress]);

  return {
    progress,
    isLoading,
    markAsKnown,
    markForReview,
    isKnown,
    isStudied,
    getStats,
    refresh: fetchProgress,
  };
}
