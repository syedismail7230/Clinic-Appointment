import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Zap } from "lucide-react";

const included = [
  "Live digital queue for unlimited patients",
  "Digital prescriptions & patient records",
  "Real-time WebSocket updates",
  "Appointment scheduling & calendar",
  "Multi-doctor support",
  "QR code patient onboarding",
  "Patient visit history & search",
  "Clinic settings & branding",
  "Works on any device, no app needed",
  "Email & WhatsApp support",
];

const metrics = [
  { value: "2 min", label: "Setup time" },
  { value: "₹0", label: "Hardware cost" },
  { value: "24/7", label: "Uptime guarantee" },
  { value: "∞", label: "Patients per day" },
];

export default function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  return (
    <section id="pricing" ref={ref} className="bg-[#070710] py-28 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Simple pricing.{" "}
            <span className="text-white/40">No surprises.</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            One flat monthly fee. Everything included. Cancel anytime.
          </p>
        </motion.div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {metrics.map((m, i) => (
            <div key={i} className="bg-white/4 border border-white/8 rounded-2xl p-5 text-center">
              <p className="text-3xl font-black text-teal-400 mb-1">{m.value}</p>
              <p className="text-white/45 text-sm">{m.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative bg-gradient-to-b from-teal-500/10 to-transparent border border-teal-500/25 rounded-3xl p-8 md:p-12 overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-teal-400/15 blur-3xl rounded-full" />

          <div className="relative md:flex items-start justify-between gap-12">
            {/* Left: Price */}
            <div className="mb-10 md:mb-0 shrink-0">
              <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 text-teal-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                <Zap className="w-3 h-3" />
                PREMIUM PLAN
              </div>
              <div className="flex items-start gap-1 mb-2">
                <span className="text-white/60 text-2xl font-bold mt-3">₹</span>
                <span className="text-7xl font-black text-white leading-none">999</span>
                <span className="text-white/40 text-lg mt-auto mb-2">/month</span>
              </div>
              <p className="text-white/45 text-sm mb-8">Per clinic. Unlimited doctors & patients.</p>
              <button
                id="pricing-get-started"
                onClick={() => navigate('/onboard')}
                className="group w-full md:w-auto flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-[#070710] font-bold text-base px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(45,212,191,0.25)]"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-white/30 text-xs mt-4 text-center md:text-left">No credit card required to start</p>
            </div>

            {/* Right: Includes */}
            <div className="flex-1">
              <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-5">Everything included</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-teal-400/15 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-teal-400" />
                    </div>
                    <p className="text-white/65 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
