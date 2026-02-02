import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole | AppRole[];
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, role, isAdmin, isLeadAdmin, hasBeverageAccess } = useAuth();
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
    // Redirect to auth page, preserving the intended destination
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements if specified
  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    const hasRequiredRole = requiredRoles.some((r) => {
      if (r === 'lead_admin') return isLeadAdmin;
      if (r === 'admin') return isAdmin; // isAdmin includes lead_admin
      // For beverage-related roles, check if user has any of these roles
      if (['server', 'bartender', 'employee'].includes(r)) {
        // If user is server_assistant, they don't have access to beverage pages
        return hasBeverageAccess;
      }
      if (r === 'server_assistant') return true; // All authenticated users can access SA content
      return role === r;
    });

    if (!hasRequiredRole) {
      // Redirect to home if user doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
