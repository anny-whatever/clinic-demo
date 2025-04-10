import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MedicineProvider } from "./contexts/MedicineContext";
import { PatientProvider } from "./contexts/PatientContext";
import { PrescriptionProvider } from "./contexts/PrescriptionContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import { TimeSlotProvider } from "./contexts/TimeSlotContext";
import { InvoiceProvider } from "./contexts/InvoiceContext";
import { WaitingRoomProvider } from "./contexts/WaitingRoomContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { initializeDemoData } from "./utils/demoData";
import { initializeEnhancedDemoData } from "./utils/enhancedDemoData";
import { USER_ROLES, ROUTES } from "./utils/constants";
import DevToolbar from "./components/DevToolbar";

// Layouts
import Layout from "./components/common/Layout";

// Auth
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/Login";

// Pages
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import Medicines from "./pages/Medicines";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Prescriptions from "./pages/Prescriptions";
import PrescriptionTemplates from "./pages/PrescriptionTemplates";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import WaitingRoom from "./pages/WaitingRoom";
import TimeSlots from "./pages/TimeSlots";

// Components
import UnavailabilityCalendar from "./components/doctor/UnavailabilityCalendar";

// Styles
import "./index.css";

function App() {
  // Initialize demo data on app load
  useEffect(() => {
    // First initialize basic demo data (users, patients, medicines)
    initializeDemoData();

    // Then populate with enhanced data for analytics and reporting
    initializeEnhancedDemoData();
  }, []);

  return (
    <AuthProvider>
      <MedicineProvider>
        <PatientProvider>
          <PrescriptionProvider>
            <AppointmentProvider>
              <TimeSlotProvider>
                <InvoiceProvider>
                  <WaitingRoomProvider>
                    <AnalyticsProvider>
                      <BrowserRouter>
                        <Routes>
                          <Route path="/" element={<Layout />}>
                            {/* Public Routes */}
                            <Route
                              path={ROUTES.LOGIN}
                              element={<LoginPage />}
                            />
                            <Route
                              path="/"
                              element={<Navigate to={ROUTES.LOGIN} replace />}
                            />

                            {/* Protected Routes - Common for any authenticated user */}
                            <Route element={<ProtectedRoute />}>
                              {/* Doctor Routes */}
                              <Route
                                path={ROUTES.DOCTOR.DASHBOARD}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <DoctorDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.APPOINTMENTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <Appointments />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.PATIENTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <Patients />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.PRESCRIPTIONS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <Prescriptions />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.TEMPLATES}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <PrescriptionTemplates />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.UNAVAILABILITY}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <UnavailabilityCalendar />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.DOCTOR.TIME_SLOTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.DOCTOR}
                                  >
                                    <TimeSlots />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Receptionist Routes */}
                              <Route
                                path={ROUTES.RECEPTIONIST.DASHBOARD}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <ReceptionistDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.APPOINTMENTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Appointments />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.PATIENTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Patients />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.WAITING_ROOM}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <WaitingRoom />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.INVOICES}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Billing />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.PAYMENTS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Billing />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.PAYMENT_PLANS}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Billing />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path={ROUTES.RECEPTIONIST.BILLING}
                                element={
                                  <ProtectedRoute
                                    requiredRole={USER_ROLES.RECEPTIONIST}
                                  >
                                    <Billing />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Common Routes (accessible to both roles) */}
                              <Route
                                path={ROUTES.COMMON.MEDICINES}
                                element={<Medicines />}
                              />
                              <Route
                                path={ROUTES.COMMON.ANALYTICS}
                                element={<Analytics />}
                              />
                            </Route>

                            {/* Catch-all - Redirect to login */}
                            <Route
                              path="*"
                              element={<Navigate to={ROUTES.LOGIN} replace />}
                            />
                          </Route>
                        </Routes>
                        <DevToolbar />
                      </BrowserRouter>
                    </AnalyticsProvider>
                  </WaitingRoomProvider>
                </InvoiceProvider>
              </TimeSlotProvider>
            </AppointmentProvider>
          </PrescriptionProvider>
        </PatientProvider>
      </MedicineProvider>
    </AuthProvider>
  );
}

export default App;
