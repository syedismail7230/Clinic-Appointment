import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, Mail } from "lucide-react";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();

  return (
    <>
      {/* Final CTA */}
      <section ref={ref} className="bg-[#070710] py-28 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative bg-gradient-to-b from-teal-500/15 via-teal-500/5 to-transparent border border-teal-500/20 rounded-3xl p-12 md:p-20 text-center overflow-hidden"
          >
            {/* Blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-teal-400/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-500/10 blur-3xl rounded-full" />

            <div className="relative">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-16 h-16 bg-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-8"
              >
                <Activity className="w-9 h-9 text-[#070710]" />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Ready to modernize
                <br />your clinic?
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
                Join clinics across India who have eliminated paper queues and upgraded to a seamless digital experience for their patients.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  id="footer-get-started"
                  onClick={() => navigate('/onboard')}
                  className="group flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-[#070710] font-bold text-base px-10 py-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(45,212,191,0.3)]"
                >
                  Start Free Trial — ₹999/mo
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="mailto:hello@quickcare.in"
                  className="flex items-center gap-2 text-white/60 hover:text-white text-base transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Contact us
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#070710] border-t border-white/5 py-10 px-6 md:px-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-400 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#070710]" />
            </div>
            <span className="text-white font-bold">QuickCare</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-white/35 text-sm">
            <a href="/app" className="hover:text-white transition-colors">Patient App</a>
            <a href="/admin" className="hover:text-white transition-colors">Clinic Login</a>
            <a href="/onboard" className="hover:text-white transition-colors">Get Started</a>
            <a href="mailto:hello@quickcare.in" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-white/20 text-sm">© 2025 QuickCare. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
