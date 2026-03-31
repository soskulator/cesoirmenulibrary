import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DishIngredient {
  id: string;
  menu_item_id: string;
  ingredient_name: string;
  is_omittable: boolean;
  omit_note: string | null;
  allergens: string[] | null;
  sort_order: number;
}

export function useDishIngredients(menuItemId?: string) {
  const [ingredients, setIngredients] = useState<DishIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('dish_ingredients')
        .select('id, menu_item_id, ingredient_name, is_omittable, omit_note, allergens, sort_order')
        .order('sort_order', { ascending: true });

      if (menuItemId) {
        query = query.eq('menu_item_id', menuItemId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setIngredients((data ?? []) as DishIngredient[]);
    } catch (err: any) {
      console.error('Error fetching dish ingredients:', err);
      setError(err.message ?? 'Failed to fetch dish ingredients');
    } finally {
      setIsLoading(false);
    }
  }, [menuItemId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ingredients, isLoading, error, refetch };
}

export function useAllDishIngredients() {
  return useDishIngredients(undefined);
}

export function useSaveDishIngredients() {
  const saveIngredients = useCallback(
    async (menuItemId: string, ingredients: Omit<DishIngredient, 'id'>[]) => {
      try {
        // Delete existing rows for this menu item
        const { error: deleteError } = await supabase
          .from('dish_ingredients')
          .delete()
          .eq('menu_item_id', menuItemId);

        if (deleteError) throw deleteError;

        if (ingredients.length > 0) {
          const rows = ingredients.map((ing) => ({
            menu_item_id: menuItemId,
            ingredient_name: ing.ingredient_name,
            is_omittable: ing.is_omittable,
            omit_note: ing.omit_note,
            allergens: ing.allergens,
            sort_order: ing.sort_order,
          }));

          const { error: insertError } = await supabase
            .from('dish_ingredients')
            .insert(rows);

          if (insertError) throw insertError;
        }

        return { error: null };
      } catch (err: any) {
        console.error('Error saving dish ingredients:', err);
        return { error: err.message ?? 'Failed to save dish ingredients' };
      }
    },
    []
  );

  return { saveIngredients };
}
