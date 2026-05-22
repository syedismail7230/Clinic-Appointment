import { useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, FileText } from "lucide-react";
import { motion } from "motion/react";

const LAST_UPDATED = "22 May 2025";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Service Description" },
  { id: "accounts", title: "Accounts & Registration" },
  { id: "clinic-obligations", title: "Clinic Obligations" },
  { id: "patient-use", title: "Patient Use" },
  { id: "payments", title: "Payments & Subscriptions" },
  { id: "whatsapp", title: "WhatsApp Messaging" },
  { id: "ip", title: "Intellectual Property" },
  { id: "disclaimer", title: "Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "governing-law", title: "Governing Law" },
  { id: "contact", title: "Contact Us" },
];

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070710] font-[Geist,sans-serif]">
      {/* Subtle background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[120px]" />
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
            <div className="inline-flex items-center gap-2 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <FileText className="w-3.5 h-3.5" />
              Legal · Terms
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-white/40 text-sm">
              Last updated:{" "}
              <span className="text-white/60 font-medium">{LAST_UPDATED}</span>
            </p>
            <div className="mt-6 h-px bg-gradient-to-r from-indigo-400/30 via-white/5 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="space-y-14 text-white/65 leading-relaxed text-[15px]"
          >
            {/* Acceptance */}
            <section id="acceptance">
              <h2 className="text-xl font-bold text-white mb-4">
                Acceptance of Terms
              </h2>
              <p>
                These Terms of Service ("Terms") govern your access to and use
                of QuickCare, a clinic management platform provided by
                QuickCare Technologies ("QuickCare", "we", "us", or "our"). By
                accessing or using our website, admin dashboard, or patient
                booking interface, you agree to be bound by these Terms.
              </p>
              <p className="mt-4">
                If you do not agree with any part of these Terms, you must
                discontinue use of the platform immediately. These Terms
                constitute a legally binding agreement between you and
                QuickCare Technologies.
              </p>
            </section>

            {/* Description */}
            <section id="description">
              <h2 className="text-xl font-bold text-white mb-4">
                Service Description
              </h2>
              <p className="mb-4">
                QuickCare provides a Software-as-a-Service (SaaS) platform for
                healthcare clinics in India. Our services include:
              </p>
              <ul className="list-none space-y-2">
                {[
                  "Digital queue management for clinics and patients",
                  "Appointment booking for patients via a public-facing interface",
                  "Patient records and prescription management for authorized clinic staff",
                  "WhatsApp-based OTP verification and transactional notifications",
                  "Real-time queue status updates for patients",
                  "Admin dashboard for clinic owners and staff",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We reserve the right to modify, suspend, or discontinue any
                part of the service at any time with or without notice.
              </p>
            </section>

            {/* Accounts */}
            <section id="accounts">
              <h2 className="text-xl font-bold text-white mb-4">
                Accounts & Registration
              </h2>
              <p className="mb-4">
                To access the clinic admin features, you must register and
                create an account. You agree to:
              </p>
              <ul className="list-none space-y-2">
                {[
                  "Provide accurate, current, and complete registration information",
                  "Maintain the security of your password and account credentials",
                  "Accept responsibility for all activities that occur under your account",
                  "Notify us immediately at hello@quickcare.in of any unauthorized use of your account",
                  "Not share your admin credentials with unauthorized individuals",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that
                violate these Terms without prior notice.
              </p>
            </section>

            {/* Clinic Obligations */}
            <section id="clinic-obligations">
              <h2 className="text-xl font-bold text-white mb-4">
                Clinic Obligations
              </h2>
              <p className="mb-4">
                As a registered clinic administrator, you agree that:
              </p>
              <ul className="list-none space-y-2">
                {[
                  "All patient data entered into the platform is accurate and entered with appropriate patient consent.",
                  "You will comply with applicable Indian healthcare regulations, including those related to patient records and data protection.",
                  "You will not use QuickCare to store or transmit data for any purpose other than legitimate clinical care.",
                  "Medical prescriptions and records entered must only be made by or under the supervision of a licensed medical professional.",
                  "You will ensure that patients have consented to receiving WhatsApp messages before booking them into the queue.",
                  "You are solely responsible for the clinical accuracy of any prescriptions or medical notes entered into the system.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Patient Use */}
            <section id="patient-use">
              <h2 className="text-xl font-bold text-white mb-4">Patient Use</h2>
              <p className="mb-4">
                Patients who use the QuickCare booking interface agree to:
              </p>
              <ul className="list-none space-y-2">
                {[
                  "Provide their real name and active mobile phone number for OTP verification.",
                  "Use the booking system only for genuine appointment needs.",
                  "Not attempt to book appointments fraudulently or on behalf of others without their consent.",
                  "Understand that QuickCare is a queue and scheduling tool only — clinical decisions remain entirely with the treating physician.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Payments */}
            <section id="payments">
              <h2 className="text-xl font-bold text-white mb-4">
                Payments & Subscriptions
              </h2>
              <p className="mb-4">
                Access to QuickCare's clinic admin features requires a paid
                subscription.
              </p>
              <ul className="list-none space-y-2">
                {[
                  "Subscription fees are billed monthly and are non-refundable except where required by law.",
                  "Payments are processed by Razorpay. By completing payment, you also agree to Razorpay's terms.",
                  "We reserve the right to change pricing with 30 days' notice.",
                  "Failure to pay may result in suspension or termination of your clinic account.",
                  "The patient-facing booking interface is free to use for patients.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* WhatsApp */}
            <section id="whatsapp">
              <h2 className="text-xl font-bold text-white mb-4">
                WhatsApp Messaging
              </h2>
              <p className="mb-4">
                QuickCare uses the Meta WhatsApp Business Cloud API to
                communicate with patients. By using the platform, patients and
                clinics acknowledge that:
              </p>
              <ul className="list-none space-y-2 mb-4">
                {[
                  "Patients provide implicit consent to receive WhatsApp messages when entering their phone number into the booking flow.",
                  "Messages sent include OTPs, booking confirmations, and queue status updates only.",
                  "QuickCare does not send promotional or marketing messages via WhatsApp without explicit opt-in.",
                  "QuickCare is not responsible for WhatsApp service outages, delivery failures, or Meta platform changes.",
                  "Clinics must not use the QuickCare platform to send unapproved message types to patients via WhatsApp.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                WhatsApp messaging is governed additionally by Meta's{" "}
                <a
                  href="https://www.whatsapp.com/legal/business-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline"
                >
                  WhatsApp Business Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://www.whatsapp.com/legal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline"
                >
                  WhatsApp Terms of Service
                </a>
                .
              </p>
            </section>

            {/* IP */}
            <section id="ip">
              <h2 className="text-xl font-bold text-white mb-4">
                Intellectual Property
              </h2>
              <p>
                All content on the QuickCare platform — including the software,
                design, logos, trademarks, and brand identity — is the
                exclusive property of QuickCare Technologies and is protected by
                applicable intellectual property laws. You may not copy,
                reproduce, modify, reverse-engineer, or distribute any part of
                the platform without our express written permission.
              </p>
              <p className="mt-4">
                Patient data and clinic data that you submit to the platform
                remains your property. You grant QuickCare a limited license to
                store, process, and display that data solely for the purpose of
                delivering the service.
              </p>
            </section>

            {/* Disclaimer */}
            <section id="disclaimer">
              <h2 className="text-xl font-bold text-white mb-4">Disclaimers</h2>
              <p className="mb-4">
                QuickCare is a{" "}
                <span className="text-white/85 font-semibold">
                  technology platform
                </span>
                , not a healthcare provider. We make no medical recommendations
                and take no responsibility for clinical decisions made using the
                platform.
              </p>
              <div className="bg-white/3 border border-white/10 rounded-xl p-5 text-sm text-white/50">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING
                BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR
                ERROR-FREE.
              </div>
            </section>

            {/* Liability */}
            <section id="liability">
              <h2 className="text-xl font-bold text-white mb-4">
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, QuickCare
                Technologies shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages — including loss of
                data, revenue, goodwill, or business interruption — arising out
                of your use of or inability to use the platform, even if we have
                been advised of the possibility of such damages.
              </p>
              <p className="mt-4">
                Our total liability to you for any claim arising from use of the
                platform shall not exceed the amount you paid us in the 3 months
                preceding the event giving rise to the claim.
              </p>
            </section>

            {/* Termination */}
            <section id="termination">
              <h2 className="text-xl font-bold text-white mb-4">Termination</h2>
              <p>
                Either party may terminate the agreement at any time. You may
                cancel your subscription from your account settings or by
                contacting us. We may terminate or suspend your access
                immediately for violations of these Terms, non-payment, or
                conduct that we believe harms other users or the platform.
              </p>
              <p className="mt-4">
                Upon termination, your right to use the platform ceases
                immediately. We will retain your data for 30 days after
                termination, after which it may be permanently deleted.
              </p>
            </section>

            {/* Governing Law */}
            <section id="governing-law">
              <h2 className="text-xl font-bold text-white mb-4">
                Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of India. Any disputes
                arising from these Terms or your use of QuickCare shall be
                subject to the exclusive jurisdiction of the courts located in
                India. By using the platform, you consent to this jurisdiction.
              </p>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
              <p className="mb-6">
                If you have any questions about these Terms of Service, please
                contact us:
              </p>
              <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-white/35 w-20 shrink-0">Company</span>
                  <span className="text-white/80">QuickCare Technologies</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-white/35 w-20 shrink-0">Email</span>
                  <a
                    href="mailto:legal@quickcare.in"
                    className="text-teal-400 hover:underline"
                  >
                    legal@quickcare.in
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
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigate("/terms")}
              className="hover:text-teal-400 transition-colors"
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
