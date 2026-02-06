import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AllergenModification {
  id: string;
  menu_item_id: string;
  allergen_type: string;
  can_remove: boolean;
  substitution_notes: string;
}

export function useAllergenModifications() {
  const [modifications, setModifications] = useState<AllergenModification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchModifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('allergen_modifications')
        .select('*');
      if (error) throw error;
      setModifications((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching allergen modifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModifications();
  }, [fetchModifications]);

  const upsertModification = useCallback(async (
    menuItemId: string,
    allergenType: string,
    canRemove: boolean,
    substitutionNotes: string
  ) => {
    try {
      const { error } = await supabase
        .from('allergen_modifications')
        .upsert(
          {
            menu_item_id: menuItemId,
            allergen_type: allergenType,
            can_remove: canRemove,
            substitution_notes: substitutionNotes,
          } as any,
          { onConflict: 'menu_item_id,allergen_type' }
        );
      if (error) throw error;

      setModifications(prev => {
        const idx = prev.findIndex(
          m => m.menu_item_id === menuItemId && m.allergen_type === allergenType
        );
        const updated: AllergenModification = {
          id: idx >= 0 ? prev[idx].id : '',
          menu_item_id: menuItemId,
          allergen_type: allergenType,
          can_remove: canRemove,
          substitution_notes: substitutionNotes,
        };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [...prev, updated];
      });
      return true;
    } catch (error: any) {
      console.error('Error upserting allergen modification:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Could not save modification.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const getModification = useCallback(
    (menuItemId: string, allergenType: string) =>
      modifications.find(
        m => m.menu_item_id === menuItemId && m.allergen_type === allergenType
      ),
    [modifications]
  );

  return { modifications, isLoading, fetchModifications, upsertModification, getModification };
}
