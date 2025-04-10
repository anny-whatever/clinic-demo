import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Main application layout component
 * @returns {JSX.Element} - Component
 */
const Layout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}

        <main className={`flex-1 ${isAuthenticated ? "md:ml-64" : ""}`}>
          <div
            className={`mx-auto py-6 px-4 sm:px-6 md:px-8 ${
              isAuthenticated ? "max-w-7xl" : ""
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} ClinicPro - Clinic Management System</p>
      </footer>
    </div>
  );
};

export default Layout;
