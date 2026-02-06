import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';

// Map route paths to permission keys
const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/categories': 'page:categories',
  '/wine-list': 'page:wine-list',
  '/spirits': 'page:spirits',
  '/cocktails': 'page:cocktails',
  '/flashcards': 'page:flashcards',
  '/cocktail-flashcards': 'page:cocktail-flashcards',
  '/daily-focus': 'page:daily-focus',
  '/allergy': 'page:allergy',
  '/foh-test': 'test:knowledge-server', // resolved dynamically below
  '/wine-quiz': 'quiz:wine',
  '/spirits-quiz': 'quiz:spirits',
  '/food-quiz': 'quiz:food',
  '/allergy-quiz': 'quiz:allergy',
  // Note: '/quiz' is the test hub — accessible to all authenticated users, individual tests are filtered within
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
  permissionKey?: string; // optional explicit override
}

export function ProtectedRoute({ children, requiredRole, permissionKey }: ProtectedRouteProps) {
  const { user, loading, role, isAdmin, isLeadAdmin, hasBeverageAccess, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    const hasRequiredRole = requiredRoles.some((r) => {
      if (r === 'lead_admin') return isLeadAdmin;
      if (r === 'admin') return isAdmin;
      if (['server', 'bartender', 'employee'].includes(r)) {
        return hasBeverageAccess;
      }
      if (r === 'server_assistant') return true;
      return role === r;
    });

    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check DB-driven permission
  const resolvedKey = permissionKey || ROUTE_PERMISSION_MAP[location.pathname];
  if (resolvedKey && !isAdmin && !isLeadAdmin) {
    // For /foh-test, check based on query param
    let effectiveKey = resolvedKey;
    if (location.pathname === '/foh-test') {
      const params = new URLSearchParams(location.search);
      const testType = params.get('type');
      effectiveKey = testType === 'server_assistant' ? 'test:knowledge-sa' : 'test:knowledge-server';
    }
    
    if (!hasPermission(effectiveKey)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
