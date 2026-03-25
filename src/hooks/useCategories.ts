import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { categories as staticCategories } from '@/data/menuTypes';

export interface DbCategory {
  id: string;
  name: string;
  name_french: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCategories(data);
        setIsInitialized(true);
      } else {
        // Return static categories as fallback
        const staticAsCats: DbCategory[] = staticCategories.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          name_french: cat.nameFrench || '',
          icon: cat.icon,
          sort_order: index,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        setCategories(staticAsCats);
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static
      const staticAsCats: DbCategory[] = staticCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        name_french: cat.nameFrench || '',
        icon: cat.icon,
        sort_order: index,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setCategories(staticAsCats);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeFromStatic = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const dbCategories = staticCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        name_french: cat.nameFrench || '',
        icon: cat.icon,
        sort_order: index,
        is_active: true,
      }));

      const { error } = await supabase
        .from('menu_categories')
        .upsert(dbCategories, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Categories Synced',
        description: `${staticCategories.length} categories synced to database.`,
      });

      await fetchCategories();
    } catch (error) {
      console.error('Error initializing categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to sync categories.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategories, toast]);

  const updateCategory = useCallback(async (id: string, updates: Partial<DbCategory>) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Category Updated',
        description: 'Category has been updated.',
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchCategories, toast]);

  const addCategory = useCallback(async (category: Omit<DbCategory, 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .insert(category);

      if (error) throw error;

      toast({
        title: 'Category Added',
        description: 'New category has been added.',
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchCategories, toast]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Category Deleted',
        description: 'Category has been removed.',
      });

      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchCategories, toast]);

  const reorderCategories = useCallback(async (reorderedCategories: DbCategory[]) => {
    try {
      const updates = reorderedCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        name_french: cat.name_french,
        icon: cat.icon,
        sort_order: index,
        is_active: cat.is_active,
      }));

      const { error } = await supabase
        .from('menu_categories')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      setCategories(reorderedCategories.map((cat, index) => ({
        ...cat,
        sort_order: index,
      })));

      toast({
        title: 'Order Updated',
        description: 'Category order has been saved.',
      });

      return true;
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    isInitialized,
    fetchCategories,
    initializeFromStatic,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
