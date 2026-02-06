import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RolePermission {
  id: string;
  role: string;
  permission_key: string;
  is_enabled: boolean;
}

// Human-readable labels for permission keys
export const PERMISSION_LABELS: Record<string, { label: string; group: string }> = {
  'page:categories': { label: 'Menu Categories', group: 'Pages' },
  'page:wine-list': { label: 'Wine List', group: 'Pages' },
  'page:spirits': { label: 'Spirits', group: 'Pages' },
  'page:cocktails': { label: 'Cocktails', group: 'Pages' },
  'page:flashcards': { label: 'Flashcards', group: 'Pages' },
  'page:cocktail-flashcards': { label: 'Cocktail Flashcards', group: 'Pages' },
  'page:daily-focus': { label: 'Daily Focus', group: 'Pages' },
  'page:allergy': { label: 'Allergy Center', group: 'Pages' },
  'test:knowledge-server': { label: 'Bartender/Server Test', group: 'Knowledge Tests' },
  'test:knowledge-sa': { label: 'Server Assistant Test', group: 'Knowledge Tests' },
  'quiz:wine': { label: 'Wine Test', group: 'Menu Tests' },
  'quiz:spirits': { label: 'Spirits Test', group: 'Menu Tests' },
  'quiz:food': { label: 'Food Test', group: 'Menu Tests' },
  'quiz:allergy': { label: 'Allergy Test', group: 'Menu Tests' },
};

export const CONFIGURABLE_ROLES = ['server', 'bartender', 'server_assistant', 'employee'] as const;

export const ROLE_LABELS: Record<string, string> = {
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  employee: 'Employee',
};

export function useRolePermissions() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .order('role')
        .order('permission_key');
      if (error) throw error;
      setPermissions((data as RolePermission[]) ?? []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      toast({ title: 'Error loading permissions', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const togglePermission = useCallback(async (role: string, permissionKey: string, enabled: boolean) => {
    try {
      // Check if row exists
      const existing = permissions.find(p => p.role === role && p.permission_key === permissionKey);
      
      if (existing) {
        const { error } = await supabase
          .from('role_permissions')
          .update({ is_enabled: enabled })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, permission_key: permissionKey, is_enabled: enabled });
        if (error) throw error;
      }

      // Optimistic update
      setPermissions(prev => {
        const idx = prev.findIndex(p => p.role === role && p.permission_key === permissionKey);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], is_enabled: enabled };
          return updated;
        }
        return [...prev, { id: 'temp', role, permission_key: permissionKey, is_enabled: enabled }];
      });

      return true;
    } catch (err) {
      console.error('Error toggling permission:', err);
      toast({ title: 'Failed to update permission', variant: 'destructive' });
      return false;
    }
  }, [permissions, toast]);

  const isPermitted = useCallback((role: string, permissionKey: string): boolean => {
    const perm = permissions.find(p => p.role === role && p.permission_key === permissionKey);
    return perm?.is_enabled ?? true; // default to allowed if no row
  }, [permissions]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return { permissions, isLoading, fetchPermissions, togglePermission, isPermitted };
}
