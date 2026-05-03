import { motion, useInView, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "How long does setup take?",
    a: "Under 2 minutes. Register your clinic, complete payment, and you're done. We automatically create your clinic profile, your admin account, and generate your patient QR code. No IT help needed.",
  },
  {
    q: "Do I need to buy any hardware or equipment?",
    a: "Absolutely not. QuickCare runs 100% in the web browser on any device you already own — a desktop computer, a tablet, or a smartphone. Print the QR code on paper and stick it at your reception. That's it.",
  },
  {
    q: "Is my patient data safe and private?",
    a: "Yes. Your clinic's data is completely isolated from other clinics on the platform. Patient records are stored securely in an encrypted database. We never sell, share, or access your data.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime. There are no long-term contracts or cancellation fees. If you cancel, your subscription remains active until the end of the billing period.",
  },
  {
    q: "Does it work for clinics with multiple doctors?",
    a: "Yes! You can add as many doctors as your clinic has. Each doctor gets their own profile and time slot configuration. Patients can choose which doctor they want to see during booking.",
  },
  {
    q: "What happens if the internet goes down at my clinic?",
    a: "The patient queue data is stored in the cloud, so if your connection drops briefly, it syncs back up when restored. We recommend keeping a mobile data connection as a backup at reception.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="bg-[#070710] py-28 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Questions? We've got{" "}
            <span className="text-white/40">answers.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`border rounded-2xl overflow-hidden transition-colors cursor-pointer ${
                openIndex === i
                  ? "border-teal-500/30 bg-teal-500/5"
                  : "border-white/8 bg-white/3 hover:border-white/15"
              }`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <div className="flex items-center justify-between p-6 gap-4">
                <h3 className="text-white font-semibold text-base">{faq.q}</h3>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                  openIndex === i
                    ? "border-teal-400/50 bg-teal-400/10 rotate-45"
                    : "border-white/15 bg-white/5"
                }`}>
                  <Plus className={`w-4 h-4 transition-colors ${openIndex === i ? "text-teal-400" : "text-white/50"}`} />
                </div>
              </div>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-white/55 text-sm leading-relaxed px-6 pb-6">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
