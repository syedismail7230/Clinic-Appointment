/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";
import LandingPage from "./pages/Landing";
import PatientHome from "./pages/Patient/Home";
import ClinicView from "./pages/Patient/ClinicView";
import BookingFlow from "./pages/Patient/BookingFlow";
import Confirmation from "./pages/Patient/Confirmation";
import PatientRecords from "./pages/Patient/Records";
import ClinicLogin from "./pages/Clinic/Login";
import ClinicDashboard from "./pages/Clinic/Dashboard";
import PlatformAdminDashboard from "./pages/PlatformAdmin/Dashboard";
import DemoQR from "./pages/DemoQR";
import Onboarding from "./pages/Clinic/Onboarding";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Marketing Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Patient App Routes (public) */}
        <Route path="/app" element={<PatientHome />} />
        <Route path="/clinic/:id" element={<ClinicView />} />
        <Route path="/clinic/:id/book" element={<BookingFlow />} />
        <Route path="/clinic/:id/confirmation" element={<Confirmation />} />
        <Route path="/records" element={<PatientRecords />} />

        {/* Clinic Admin Routes (protected) */}
        <Route path="/admin" element={<ClinicLogin />} />
        <Route path="/admin/dashboard" element={
          <AuthGuard requiredRole={["admin", "root"]}>
            <ClinicDashboard />
          </AuthGuard>
        } />

        {/* Platform Admin Routes (protected — root only) */}
        <Route path="/platform-admin" element={
          <AuthGuard requiredRole="root">
            <PlatformAdminDashboard />
          </AuthGuard>
        } />

        {/* Onboarding (public) */}
        <Route path="/onboard" element={<Onboarding />} />

        {/* Demo QR Route */}
        <Route path="/demo-qr" element={<DemoQR />} />
      </Routes>
    </Router>
  );
}
