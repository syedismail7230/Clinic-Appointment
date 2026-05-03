import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-[#070710]">
      {/* Animated background gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#070710]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">QuickCare</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-white/60 hover:text-white text-sm transition-colors">Features</a>
          <a href="#pricing" className="text-white/60 hover:text-white text-sm transition-colors">Pricing</a>
          <a href="#faq" className="text-white/60 hover:text-white text-sm transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="text-white/70 hover:text-white text-sm transition-colors px-4 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/onboard')}
            className="bg-teal-400 hover:bg-teal-300 text-[#070710] text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 md:py-24">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-teal-400 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          Now live across India · Built for modern clinics
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-white leading-[1.08] tracking-tight max-w-4xl"
        >
          Your Patients Deserve{" "}
          <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Better Than
          </span>{" "}
          a Waiting Room.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed"
        >
          QuickCare gives your clinic a live digital queue, smart prescriptions, and a complete patient record system — all in one place. Setup takes 2 minutes.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            id="hero-get-started"
            onClick={() => navigate('/onboard')}
            className="group flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-[#070710] font-bold text-base px-8 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(45,212,191,0.3)]"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#features"
            className="flex items-center gap-2 text-white/70 hover:text-white text-base font-medium transition-colors"
          >
            See how it works
            <ChevronDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {["No hardware needed", "Cancel anytime", "Works on any phone"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-white/40 text-sm">
              <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {badge}
            </div>
          ))}
        </motion.div>

        {/* Animated Queue Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 w-full max-w-2xl mx-auto"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Live Queue</p>
                <p className="text-white font-bold text-lg">Shree Krishna Clinic</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Live
              </div>
            </div>
            <div className="space-y-3">
              {[
                { token: "A-01", name: "Ravi Kumar", status: "In Consultation", active: true },
                { token: "A-02", name: "Priya Sharma", status: "Waiting · ~5 min", active: false },
                { token: "A-03", name: "Mohammed Ali", status: "Waiting · ~12 min", active: false },
              ].map((item) => (
                <div
                  key={item.token}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${item.active
                      ? "bg-teal-400/10 border border-teal-400/30"
                      : "bg-white/3 border border-white/5"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${item.active ? "bg-teal-400 text-[#070710]" : "bg-white/10 text-white/60"
                      }`}>
                      {item.token}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${item.active ? "text-white" : "text-white/70"}`}>{item.name}</p>
                      <p className={`text-xs ${item.active ? "text-teal-400" : "text-white/35"}`}>{item.status}</p>
                    </div>
                  </div>
                  {item.active && (
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
