import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'lead_admin' | 'admin' | 'employee';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  isAdmin: boolean;
  isLeadAdmin: boolean;
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
      const [{ data: adminData }, { data: leadAdminData }] = await Promise.all([
        supabase.rpc('is_admin', { _user_id: userId }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'lead_admin' }),
      ]);

      return {
        isAdmin: Boolean(adminData),
        isLeadAdmin: Boolean(leadAdminData),
      };
    } catch {
      console.error('Error checking admin permissions');
      return { isAdmin: false, isLeadAdmin: false };
    }
  };

  const refreshRole = async () => {
    if (!user) return;

    const [userRole, flags] = await Promise.all([
      fetchUserRole(user.id),
      fetchAdminFlags(user.id),
    ]);

    setRole(userRole);
    setIsAdmin(flags.isAdmin);
    setIsLeadAdmin(flags.isLeadAdmin);
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
            ]).then(([userRole, flags]) => {
              setRole(userRole);
              setIsAdmin(flags.isAdmin);
              setIsLeadAdmin(flags.isLeadAdmin);
            });
          }, 0);
        } else {
          setRole(null);
          setIsAdmin(false);
          setIsLeadAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        Promise.all([
          fetchUserRole(session.user.id),
          fetchAdminFlags(session.user.id),
        ]).then(([userRole, flags]) => {
          setRole(userRole);
          setIsAdmin(flags.isAdmin);
          setIsLeadAdmin(flags.isLeadAdmin);
        });
      } else {
        setRole(null);
        setIsAdmin(false);
        setIsLeadAdmin(false);
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
