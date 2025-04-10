import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { USER_ROLES, ROUTES } from "../../utils/constants";

const Header = () => {
  const { currentUser, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Define navigation items based on user role
  const navigationItems = currentUser
    ? hasRole(USER_ROLES.DOCTOR)
      ? [
          { name: "Dashboard", path: ROUTES.DOCTOR.DASHBOARD },
          { name: "Appointments", path: ROUTES.DOCTOR.APPOINTMENTS },
          { name: "Prescriptions", path: ROUTES.DOCTOR.PRESCRIPTIONS },
          { name: "Patients", path: ROUTES.DOCTOR.PATIENTS },
        ]
      : [
          { name: "Dashboard", path: ROUTES.RECEPTIONIST.DASHBOARD },
          { name: "Appointments", path: ROUTES.RECEPTIONIST.APPOINTMENTS },
          { name: "Waiting Room", path: ROUTES.RECEPTIONIST.WAITING_ROOM },
          { name: "Patients", path: ROUTES.RECEPTIONIST.PATIENTS },
        ]
    : [];

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  ClinicPro
                </span>
              </Link>
            </div>
          </div>

          {currentUser && (
            <>
              {/* Desktop navigation */}
              <div className="hidden md:flex items-center">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="ml-6 flex items-center">
                  <div className="flex items-center mr-4">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-gray-800">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {hasRole(USER_ROLES.DOCTOR) ? "Doctor" : "Receptionist"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {currentUser.name}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {hasRole(USER_ROLES.DOCTOR) ? "Doctor" : "Receptionist"}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
