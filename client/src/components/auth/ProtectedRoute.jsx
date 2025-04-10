import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ROUTES } from "../../utils/constants";

/**
 * Protected Route Component
 * @param {object} props - Component props
 * @param {string} props.requiredRole - Role required to access this route
 * @param {React.ReactNode} props.children - Optional children to render
 * @returns {JSX.Element} - Component
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const { isAuthenticated, currentUser, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user has required role
  if (requiredRole && currentUser.role !== requiredRole) {
    // Redirect to appropriate dashboard
    const dashboardRoute =
      currentUser.role === "doctor"
        ? ROUTES.DOCTOR.DASHBOARD
        : ROUTES.RECEPTIONIST.DASHBOARD;

    return <Navigate to={dashboardRoute} replace />;
  }

  // Render the children if they were provided, otherwise render Outlet
  if (children) {
    return children;
  }

  // Render the protected component
  return <Outlet />;
};

export default ProtectedRoute;
