import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getEntities } from "../../utils/localStorage";
import { STORAGE_KEYS } from "../../utils/localStorage";
import { USER_ROLES, ROUTES } from "../../utils/constants";
import { resetAllData } from "../../utils/resetData";
import { forceInitTestData } from "../../utils/testInit";

/**
 * Login Component
 * @returns {JSX.Element} - Component
 */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Get users from localStorage
    const users = getEntities(STORAGE_KEYS.USERS);

    // Find user by username and password
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Login the user
      login(user);

      // Redirect based on role
      const redirectPath =
        user.role === USER_ROLES.DOCTOR
          ? ROUTES.DOCTOR.DASHBOARD
          : ROUTES.RECEPTIONIST.DASHBOARD;

      navigate(redirectPath);
    } else {
      setError("Invalid username or password");
    }

    setLoading(false);
  };

  const handleReset = () => {
    resetAllData();
    setResetMessage("Data reset successful! You can now try logging in again.");
    setTimeout(() => setResetMessage(""), 5000);
  };

  const handleForceInit = () => {
    forceInitTestData();
    setResetMessage(
      "Test users forced initialization successful! Try logging in with the demo credentials."
    );
    setTimeout(() => setResetMessage(""), 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Clinic Management
            </h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
                {resetMessage}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2 px-4 flex justify-center"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="mt-6 bg-indigo-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">
                Demo Login Credentials
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="bg-white p-2 rounded border border-gray-200">
                  <p className="font-medium text-gray-700">Doctor:</p>
                  <p>Username: doctor1</p>
                  <p>Password: demo123</p>
                </div>
                <div className="bg-white p-2 rounded border border-gray-200">
                  <p className="font-medium text-gray-700">Receptionist:</p>
                  <p>Username: reception1</p>
                  <p>Password: demo123</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 underline hover:text-gray-700 mr-4"
              >
                Having trouble? Reset application data
              </button>
              <button
                type="button"
                onClick={handleForceInit}
                className="text-xs text-gray-500 underline hover:text-gray-700"
              >
                Force initialize test users
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
