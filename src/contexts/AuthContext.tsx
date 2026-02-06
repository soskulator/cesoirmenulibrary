import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'lead_admin' | 'admin' | 'employee' | 'server' | 'bartender' | 'server_assistant';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  isLeadAdmin: boolean;
  isServerAssistant: boolean;
  hasBeverageAccess: boolean;
  fullName: string | null;
  hasPermission: (permissionKey: string) => boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLeadAdmin, setIsLeadAdmin] = useState(false);
  const [isServerAssistant, setIsServerAssistant] = useState(false);
  const [hasBeverageAccess, setHasBeverageAccess] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile');
        return null;
      }
      
      return data?.full_name ?? null;
    } catch {
      console.error('Error in fetchUserProfile');
      return null;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching role');
        return null;
      }
      
      return data?.role as AppRole | null;
    } catch {
      console.error('Error in fetchUserRole');
      return null;
    }
  };

  const fetchAdminFlags = async (userId: string) => {
    try {
      const [{ data: adminData }, { data: leadAdminData }, { data: beverageData }] = await Promise.all([
        supabase.rpc('is_admin', { _user_id: userId }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'lead_admin' }),
        supabase.rpc('has_beverage_access', { _user_id: userId }),
      ]);

      return {
        isAdmin: Boolean(adminData),
        isLeadAdmin: Boolean(leadAdminData),
        hasBeverageAccess: Boolean(beverageData),
      };
    } catch {
      console.error('Error checking admin permissions');
      return { isAdmin: false, isLeadAdmin: false, hasBeverageAccess: false };
    }
  };

  const computeRoleFlags = (userRole: AppRole | null, flags: { isAdmin: boolean; isLeadAdmin: boolean; hasBeverageAccess: boolean }) => {
    const isServerAssistant = userRole === 'server_assistant';
    const hasBeverageAccess = isServerAssistant ? false : flags.hasBeverageAccess;
    return { isServerAssistant, hasBeverageAccess };
  };

  const fetchRolePermissions = async (userRole: AppRole | null) => {
    if (!userRole) { setRolePermissions({}); return; }
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key, is_enabled')
        .eq('role', userRole);
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data || []).forEach(p => { map[p.permission_key] = p.is_enabled; });
      setRolePermissions(map);
    } catch {
      console.error('Error fetching role permissions');
      setRolePermissions({});
    }
  };

  const hasPermission = (permissionKey: string): boolean => {
    if (isAdmin || isLeadAdmin) return true; // admins bypass
    if (!role) return false;
    return rolePermissions[permissionKey] ?? true; // default allowed if no row
  };

  const refreshRole = async () => {
    if (!user) return;

    const [userRole, flags, name] = await Promise.all([
      fetchUserRole(user.id),
      fetchAdminFlags(user.id),
      fetchUserProfile(user.id),
    ]);

    const roleFlags = computeRoleFlags(userRole, flags);

    setRole(userRole);
    setIsAdmin(flags.isAdmin);
    setIsLeadAdmin(flags.isLeadAdmin);
    setIsServerAssistant(roleFlags.isServerAssistant);
    setHasBeverageAccess(roleFlags.hasBeverageAccess);
    setFullName(name);
    await fetchRolePermissions(userRole);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer backend calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            Promise.all([
              fetchUserRole(session.user.id),
              fetchAdminFlags(session.user.id),
              fetchUserProfile(session.user.id),
            ]).then(([userRole, flags, name]) => {
              const roleFlags = computeRoleFlags(userRole, flags);
              setRole(userRole);
              setIsAdmin(flags.isAdmin);
              setIsLeadAdmin(flags.isLeadAdmin);
              setIsServerAssistant(roleFlags.isServerAssistant);
              setHasBeverageAccess(roleFlags.hasBeverageAccess);
              setFullName(name);
              fetchRolePermissions(userRole);
            });
          }, 0);
        } else {
          setRole(null);
          setIsAdmin(false);
          setIsLeadAdmin(false);
          setIsServerAssistant(false);
          setHasBeverageAccess(false);
          setFullName(null);
          setRolePermissions({});
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Wait for role fetch to complete BEFORE setting loading to false
        const [userRole, flags, name] = await Promise.all([
          fetchUserRole(session.user.id),
          fetchAdminFlags(session.user.id),
          fetchUserProfile(session.user.id),
        ]);
        const roleFlags = computeRoleFlags(userRole, flags);
        setRole(userRole);
        setIsAdmin(flags.isAdmin);
        setIsLeadAdmin(flags.isLeadAdmin);
        setIsServerAssistant(roleFlags.isServerAssistant);
        setHasBeverageAccess(roleFlags.hasBeverageAccess);
        setFullName(name);
        await fetchRolePermissions(userRole);
      } else {
        setRole(null);
        setIsAdmin(false);
        setIsLeadAdmin(false);
        setIsServerAssistant(false);
        setHasBeverageAccess(false);
        setFullName(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setIsAdmin(false);
    setIsLeadAdmin(false);
    setIsServerAssistant(false);
    setHasBeverageAccess(false);
    setFullName(null);
    setRolePermissions({});
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAdmin,
        isLeadAdmin,
        isServerAssistant,
        hasBeverageAccess,
        fullName,
        hasPermission,
        signIn,
        signUp,
        signOut,
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
