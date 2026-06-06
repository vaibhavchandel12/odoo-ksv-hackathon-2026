import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Map roles to their specific dashboard redirect path
export const getDashboardRedirect = (roleName: string): string => {
  switch (roleName) {
    case 'Admin':
      return '/dashboard/admin';
    case 'Procurement Officer':
      return '/dashboard/procurement';
    case 'Manager':
      return '/dashboard/manager';
    case 'Vendor':
      return '/dashboard/vendor';
    case 'Financer':
      return '/dashboard/financer';
    default:
      return '/login';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2563EB] border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading VendorBridge ERP...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but store the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role.name)) {
    // User is logged in but lacks the role for this route, redirect to their role's dashboard
    const redirectPath = getDashboardRedirect(user.role.name);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
