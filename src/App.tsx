/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PatientHome from "./pages/Patient/Home";
import ClinicView from "./pages/Patient/ClinicView";
import BookingFlow from "./pages/Patient/BookingFlow";
import Confirmation from "./pages/Patient/Confirmation";
import PatientRecords from "./pages/Patient/Records";
import ClinicLogin from "./pages/Clinic/Login";
import ClinicDashboard from "./pages/Clinic/Dashboard";
import PlatformAdminDashboard from "./pages/PlatformAdmin/Dashboard";
import DemoQR from "./pages/DemoQR";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Patient Routes */}
        <Route path="/" element={<PatientHome />} />
        <Route path="/clinic/:id" element={<ClinicView />} />
        <Route path="/clinic/:id/book" element={<BookingFlow />} />
        <Route path="/clinic/:id/confirmation" element={<Confirmation />} />
        <Route path="/records" element={<PatientRecords />} />

        {/* Clinic Admin Routes */}
        <Route path="/admin" element={<ClinicLogin />} />
        <Route path="/admin/dashboard" element={<ClinicDashboard />} />

        {/* Platform Admin Routes */}
        <Route path="/platform" element={<PlatformAdminDashboard />} />

        {/* Demo QR Route */}
        <Route path="/demo-qr" element={<DemoQR />} />
      </Routes>
    </Router>
  );
}
