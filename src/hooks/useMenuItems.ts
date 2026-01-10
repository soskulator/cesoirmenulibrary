import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { menuItems as staticMenuItems, MenuItem, AllergenType, Question } from '@/data/menuData';

interface DbMenuItem {
  id: string;
  category_id: string;
  name: string;
  short_description: string;
  long_description: string;
  ingredients_text: string;
  prep_notes: string;
  selling_points_text: string;
  image_url: string;
  allergens: string[];
  questions: Question[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Convert DB format to app format
const dbToMenuItem = (db: DbMenuItem): MenuItem => ({
  id: db.id,
  categoryId: db.category_id,
  name: db.name,
  shortDescription: db.short_description,
  longDescription: db.long_description,
  ingredientsText: db.ingredients_text,
  prepNotes: db.prep_notes,
  sellingPointsText: db.selling_points_text,
  imageUrl: db.image_url,
  allergens: db.allergens as AllergenType[],
  questions: db.questions,
  isPublished: db.is_published,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

// Convert app format to DB format
const menuItemToDb = (item: MenuItem): Omit<DbMenuItem, 'created_at' | 'updated_at'> => ({
  id: item.id,
  category_id: item.categoryId,
  name: item.name,
  short_description: item.shortDescription,
  long_description: item.longDescription,
  ingredients_text: item.ingredientsText,
  prep_notes: item.prepNotes,
  selling_points_text: item.sellingPointsText,
  image_url: item.imageUrl,
  allergens: item.allergens,
  questions: item.questions,
  is_published: item.isPublished,
});

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>(staticMenuItems);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Fetch menu items from database
  const fetchItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data && data.length > 0) {
        // Type assertion for the data since types aren't generated yet
        const typedData = data as unknown as DbMenuItem[];
        setItems(typedData.map(dbToMenuItem));
        setIsInitialized(true);
      } else {
        // No items in DB yet, use static data
        setItems(staticMenuItems);
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fall back to static data
      setItems(staticMenuItems);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize database with static menu data
  const initializeFromStatic = useCallback(async () => {
    setIsLoading(true);
    try {
      const dbItems = staticMenuItems.map(menuItemToDb);
      
      const { error } = await supabase
        .from('menu_items')
        .upsert(dbItems as any, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Menu Initialized',
        description: `${staticMenuItems.length} items synced to database.`,
      });

      await fetchItems();
      setIsInitialized(true);
    } catch (error: any) {
      console.error('Error initializing menu items:', error);
      toast({
        title: 'Initialization Failed',
        description: error.message || 'Could not sync menu to database.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, toast]);

  // Add a new menu item
  const addItem = useCallback(async (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newId = `item-${Date.now()}`;
      const newItem: MenuItem = {
        ...item,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('menu_items')
        .insert(menuItemToDb(newItem) as any);

      if (error) throw error;

      setItems(prev => [...prev, newItem]);
      toast({
        title: 'Item Added',
        description: `${item.name} has been added to the menu.`,
      });
      return newItem;
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Failed to Add Item',
        description: error.message || 'Could not add the menu item.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Update an existing menu item
  const updateItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    try {
      const dbUpdates: Record<string, any> = {};
      
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.shortDescription !== undefined) dbUpdates.short_description = updates.shortDescription;
      if (updates.longDescription !== undefined) dbUpdates.long_description = updates.longDescription;
      if (updates.ingredientsText !== undefined) dbUpdates.ingredients_text = updates.ingredientsText;
      if (updates.prepNotes !== undefined) dbUpdates.prep_notes = updates.prepNotes;
      if (updates.sellingPointsText !== undefined) dbUpdates.selling_points_text = updates.sellingPointsText;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.allergens !== undefined) dbUpdates.allergens = updates.allergens;
      if (updates.questions !== undefined) dbUpdates.questions = updates.questions;
      if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;

      const { error } = await supabase
        .from('menu_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      ));
      
      toast({
        title: 'Item Updated',
        description: 'Menu item has been saved.',
      });
      return true;
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast({
        title: 'Failed to Update',
        description: error.message || 'Could not update the menu item.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Delete a menu item
  const deleteItem = useCallback(async (id: string) => {
    try {
      const item = items.find(i => i.id === id);
      
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Item Deleted',
        description: item ? `${item.name} has been removed.` : 'Item removed.',
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Failed to Delete',
        description: error.message || 'Could not delete the menu item.',
        variant: 'destructive',
      });
      return false;
    }
  }, [items, toast]);

  // Initial fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    isInitialized,
    fetchItems,
    initializeFromStatic,
    addItem,
    updateItem,
    deleteItem,
  };
}
