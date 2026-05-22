import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Shield } from "lucide-react";
import { motion } from "motion/react";

const LAST_UPDATED = "22 May 2025";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "data-collected", title: "Data We Collect" },
  { id: "how-we-use", title: "How We Use Your Data" },
  { id: "sharing", title: "Data Sharing" },
  { id: "whatsapp", title: "WhatsApp & Communications" },
  { id: "retention", title: "Data Retention" },
  { id: "rights", title: "Your Rights" },
  { id: "security", title: "Security" },
  { id: "children", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070710] font-[Geist,sans-serif]">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6 border-b border-white/5 backdrop-blur-sm sticky top-0 bg-[#070710]/80">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#070710]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            QuickCare
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 py-16 lg:py-24 flex gap-16">
        {/* Sidebar TOC — desktop only */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">
              Contents
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-white/40 hover:text-teal-400 text-sm py-1 transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 text-teal-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Shield className="w-3.5 h-3.5" />
              Legal · Privacy
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm">
              Last updated:{" "}
              <span className="text-white/60 font-medium">{LAST_UPDATED}</span>
            </p>
            <div className="mt-6 h-px bg-gradient-to-r from-teal-400/30 via-white/5 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="space-y-14 text-white/65 leading-relaxed text-[15px]"
          >
            {/* Overview */}
            <section id="overview">
              <h2 className="text-xl font-bold text-white mb-4">Overview</h2>
              <p>
                QuickCare ("we", "us", or "our") is a clinic management and
                digital queue platform operated by QuickCare Technologies. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our platform — including
                our website at{" "}
                <span className="text-teal-400">quickcare.zawrindustries.com</span>,
                our clinic-facing admin dashboard, and our patient-facing
                booking interface.
              </p>
              <p className="mt-4">
                By using QuickCare, you agree to the collection and use of
                information in accordance with this policy. If you do not agree,
                please discontinue use of the platform.
              </p>
            </section>

            {/* Data Collected */}
            <section id="data-collected">
              <h2 className="text-xl font-bold text-white mb-4">
                Data We Collect
              </h2>

              <h3 className="text-white/85 font-semibold mb-2">
                From Patients
              </h3>
              <ul className="list-none space-y-2 mb-6">
                {[
                  "Full name",
                  "Mobile phone number (used for OTP verification and WhatsApp notifications)",
                  "Visit history and queue records",
                  "Prescription and medicine records entered by the treating doctor",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-white/85 font-semibold mb-2">
                From Clinic Administrators
              </h3>
              <ul className="list-none space-y-2 mb-6">
                {[
                  "Full name and designation",
                  "Business email address",
                  "Mobile phone number",
                  "Clinic name, address, and GST number",
                  "Payment information (processed securely through Razorpay — we do not store card details)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <h3 className="text-white/85 font-semibold mb-2">
                Automatically Collected
              </h3>
              <ul className="list-none space-y-2">
                {[
                  "Device type and browser information",
                  "IP address and approximate location",
                  "Pages visited and time spent on the platform",
                  "Error logs and performance data",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* How We Use */}
            <section id="how-we-use">
              <h2 className="text-xl font-bold text-white mb-4">
                How We Use Your Data
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-none space-y-2">
                {[
                  "Provide, operate, and maintain the QuickCare platform",
                  "Verify patient identity via OTP sent through WhatsApp",
                  "Send appointment booking confirmations and queue status updates via WhatsApp",
                  "Enable clinic administrators to manage their patient queue and records",
                  "Process payments for clinic subscriptions",
                  "Improve and optimize the platform based on usage patterns",
                  "Respond to support requests and communications",
                  "Comply with applicable laws and regulations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Sharing */}
            <section id="sharing">
              <h2 className="text-xl font-bold text-white mb-4">
                Data Sharing
              </h2>
              <p className="mb-4">
                We do not sell your personal data. We may share your information
                with the following third parties solely to deliver our services:
              </p>
              <div className="space-y-4">
                {[
                  {
                    name: "Supabase",
                    desc: "Our database and backend infrastructure provider. Patient and clinic data is stored on Supabase's servers.",
                  },
                  {
                    name: "Meta (WhatsApp Business Cloud API)",
                    desc: "We use Meta's WhatsApp Business API to send OTPs, booking confirmations, and queue notifications to patients. Messages are routed through Meta's infrastructure.",
                  },
                  {
                    name: "Razorpay",
                    desc: "Our payment processing partner. Payment data is handled directly by Razorpay. We do not store credit or debit card information.",
                  },
                ].map((provider) => (
                  <div
                    key={provider.name}
                    className="bg-white/3 border border-white/8 rounded-xl p-4"
                  >
                    <p className="text-white/90 font-semibold mb-1">
                      {provider.name}
                    </p>
                    <p className="text-white/50 text-sm">{provider.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6">
                We may also disclose information if required by law, court
                order, or to protect the safety and rights of our users or the
                public.
              </p>
            </section>

            {/* WhatsApp */}
            <section id="whatsapp">
              <h2 className="text-xl font-bold text-white mb-4">
                WhatsApp & Communications
              </h2>
              <p className="mb-4">
                QuickCare uses the{" "}
                <span className="text-white/85 font-medium">
                  Meta WhatsApp Business Cloud API
                </span>{" "}
                to send the following categories of messages to patients:
              </p>
              <ul className="list-none space-y-2 mb-6">
                {[
                  "One-Time Passwords (OTPs) for phone number verification",
                  "Appointment and queue booking confirmations",
                  "Real-time queue status updates (e.g., when your turn is approaching)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                By entering your phone number and using the QuickCare booking
                flow, you consent to receive these messages on WhatsApp. These
                are transactional messages only — we do not send unsolicited
                marketing messages. You may contact us to opt out of
                non-essential communications at any time.
              </p>
            </section>

            {/* Retention */}
            <section id="retention">
              <h2 className="text-xl font-bold text-white mb-4">
                Data Retention
              </h2>
              <p>
                We retain your personal data only as long as necessary to provide
                the services described in this policy or as required by law:
              </p>
              <ul className="list-none space-y-2 mt-4">
                {[
                  "Patient visit records are retained for as long as the associated clinic account is active.",
                  "OTP codes are stored in memory only for 5 minutes, then permanently deleted.",
                  "Clinic administrator accounts and associated data are retained for the duration of the subscription plus a 30-day grace period after cancellation.",
                  "Anonymized usage analytics may be retained indefinitely.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Rights */}
            <section id="rights">
              <h2 className="text-xl font-bold text-white mb-4">Your Rights</h2>
              <p className="mb-4">
                Under applicable data protection laws (including India's Digital
                Personal Data Protection Act, 2023), you have the right to:
              </p>
              <ul className="list-none space-y-2">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your personal data (subject to legal obligations)",
                  "Withdraw consent for data processing",
                  "Lodge a complaint with the relevant data protection authority",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us at{" "}
                <a
                  href="mailto:privacy@quickcare.in"
                  className="text-teal-400 hover:underline"
                >
                  privacy@quickcare.in
                </a>
                .
              </p>
            </section>

            {/* Security */}
            <section id="security">
              <h2 className="text-xl font-bold text-white mb-4">Security</h2>
              <p>
                We implement industry-standard security measures to protect your
                personal data, including:
              </p>
              <ul className="list-none space-y-2 mt-4">
                {[
                  "JWT-based authentication with server-side token validation",
                  "Bcrypt password hashing for admin accounts",
                  "Cryptographically random OTP generation",
                  "HTTPS-only data transmission",
                  "Row-level security policies on our database",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                While we take all reasonable precautions, no method of
                electronic transmission or storage is 100% secure. We encourage
                you to use strong passwords and keep your login credentials
                confidential.
              </p>
            </section>

            {/* Children */}
            <section id="children">
              <h2 className="text-xl font-bold text-white mb-4">
                Children's Privacy
              </h2>
              <p>
                QuickCare is not directed to individuals under the age of 13. We
                do not knowingly collect personal data from children. Patients
                under 18 are expected to use the platform under the supervision
                of a parent or guardian. If you believe we have inadvertently
                collected data from a minor, please contact us and we will
                promptly delete it.
              </p>
            </section>

            {/* Changes */}
            <section id="changes">
              <h2 className="text-xl font-bold text-white mb-4">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we do,
                we will revise the "Last updated" date at the top of this page.
                We encourage you to review this page periodically. Continued use
                of the platform after changes are posted constitutes your
                acceptance of the revised policy.
              </p>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
              <p className="mb-6">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or the handling of your data, please reach out:
              </p>
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-white/35 w-20 shrink-0">Company</span>
                  <span className="text-white/80">QuickCare Technologies</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-white/35 w-20 shrink-0">Email</span>
                  <a
                    href="mailto:privacy@quickcare.in"
                    className="text-teal-400 hover:underline"
                  >
                    privacy@quickcare.in
                  </a>
                </div>
                <div className="flex gap-3">
                  <span className="text-white/35 w-20 shrink-0">Website</span>
                  <a
                    href="https://quickcare.zawrindustries.com"
                    className="text-teal-400 hover:underline"
                  >
                    quickcare.zawrindustries.com
                  </a>
                </div>
              </div>
            </section>
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6 md:px-16 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#070710]" />
            </div>
            <span className="text-white font-bold">QuickCare</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-white/35 text-sm">
            <button
              onClick={() => navigate("/privacy")}
              className="hover:text-teal-400 transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <a
              href="mailto:hello@quickcare.in"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} QuickCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
