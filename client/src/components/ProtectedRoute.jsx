import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection component.
 * Redirects to login if unauthenticated, or to Home if unauthorized for specific roles.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuth();

  if (!token || !user) {
    // Save current path for redirect after login? (Optional enhancement)
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If unauthorized, redirect to the default role-based landing or Home page
    return <Navigate to="/" replace />;
  }

  return children;
}
