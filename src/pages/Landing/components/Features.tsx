import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Smartphone, ClipboardList, Users, BarChart3, QrCode, Zap } from "lucide-react";

const features = [
  {
    icon: Zap,
    color: "teal",
    tag: "Core",
    title: "Live Digital Queue",
    description:
      "Patients join the queue by scanning a QR code at your reception — or from their phone before they even arrive. They track their position in real-time and get called when it's their turn.",
    highlights: ["Real-time position updates", "No app download needed", "Auto-generated token numbers"],
  },
  {
    icon: ClipboardList,
    color: "indigo",
    tag: "Clinical",
    title: "Smart Prescriptions",
    description:
      "Write prescriptions digitally during the consultation. Add medicines, dosage, and instructions. Everything is saved to the patient's record automatically and can be printed instantly.",
    highlights: ["Structured medicine fields", "Auto-saved to patient history", "One-click print"],
  },
  {
    icon: Users,
    color: "emerald",
    tag: "Records",
    title: "Complete Patient History",
    description:
      "Every patient who walks through your door builds a rich medical profile. Track visits, prescriptions, doctors seen, and notes — all searchable by name or phone number.",
    highlights: ["Full visit timeline", "Search by name or phone", "Cross-appointment notes"],
  },
  {
    icon: BarChart3,
    color: "violet",
    tag: "Management",
    title: "Appointment Management",
    description:
      "Schedule future appointments alongside your live walk-in queue. See your day at a glance — who's booked, who's waiting, and who's been seen.",
    highlights: ["Calendar view", "Booked vs walk-in tracking", "Doctor-wise scheduling"],
  },
  {
    icon: QrCode,
    color: "amber",
    tag: "Onboarding",
    title: "Instant Patient Onboarding",
    description:
      "Print one QR code and stick it at your reception. Patients scan it, enter their name and phone, and they're in the queue. Zero friction, zero training needed.",
    highlights: ["No account required for patients", "SMS confirmation", "Works on any phone"],
  },
  {
    icon: Smartphone,
    color: "rose",
    tag: "Multi-device",
    title: "Works on Any Screen",
    description:
      "QuickCare runs entirely in the browser. Use it on your desktop at the clinic, your phone at home, or a tablet at reception. Nothing to install, ever.",
    highlights: ["Browser-based, no install", "Mobile-optimized", "Multiple doctors supported"],
  },
];

const colorMap: Record<string, string> = {
  teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400 bg-teal-400/10",
  indigo: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 text-indigo-400 bg-indigo-400/10",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400 bg-emerald-400/10",
  violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400 bg-violet-400/10",
  amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400 bg-amber-400/10",
  rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400 bg-rose-400/10",
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="bg-[#070710] py-28 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Everything your clinic needs.{" "}
            <span className="text-white/40">Nothing it doesn't.</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
            One subscription. Every tool your front desk and doctors need to run a smooth, modern practice.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color].split(" ");
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative bg-gradient-to-b ${colors[0]} ${colors[1]} border ${colors[2]} rounded-2xl p-7 group hover:scale-[1.02] transition-transform`}
              >
                <div className={`w-10 h-10 ${colors[4]} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${colors[3]}`} />
                </div>
                <div className={`inline-block text-[10px] font-bold uppercase tracking-widest ${colors[3]} bg-white/5 border border-white/10 px-2 py-1 rounded-full mb-3`}>
                  {feature.tag}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.highlights.map((h, j) => (
                    <li key={j} className="flex items-center gap-2 text-white/60 text-xs">
                      <svg className={`w-3.5 h-3.5 ${colors[3]} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
