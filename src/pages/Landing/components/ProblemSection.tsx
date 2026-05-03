import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { X, Check } from "lucide-react";

const problems = [
  "Patients wait 45+ minutes with zero updates",
  "Prescription notes lost in paper stacks",
  "No way to track patient visit history",
  "Front desk overwhelmed managing appointments",
  "Walk-in chaos disrupts scheduled patients",
];

const solutions = [
  "Patients track their queue position from anywhere",
  "Digital prescriptions saved instantly to patient records",
  "Full visit history searchable in seconds",
  "Queue auto-manages itself — no manual coordination",
  "Smart token system eliminates chaos at reception",
];

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#070710] py-28 px-6 md:px-16">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-4">The Problem</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Running a clinic shouldn't feel like{" "}
            <span className="text-white/40">firefighting every day.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old Way */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-red-500/5 border border-red-500/15 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg">The Old Way</h3>
            </div>
            <div className="space-y-4">
              {problems.map((problem, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-white/55 text-sm leading-relaxed">{problem}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* New Way */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-teal-400/20 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-teal-400" />
              </div>
              <h3 className="text-white font-bold text-lg">The QuickCare Way</h3>
            </div>
            <div className="space-y-4">
              {solutions.map((solution, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <Check className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                  <p className="text-white/80 text-sm leading-relaxed">{solution}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
