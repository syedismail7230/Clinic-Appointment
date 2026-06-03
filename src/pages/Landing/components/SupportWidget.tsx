import { useState } from "react";
import { X, MessageSquareText } from "lucide-react";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-[#121214] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.03] active:scale-95"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-400/15 text-teal-400">
            <MessageSquareText className="h-4 w-4" />
          </span>
          Support
        </button>
      ) : (
        <div className="w-[min(92vw,380px)] overflow-hidden rounded-3xl border border-white/10 bg-[#121214] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Support</p>
              <p className="text-xs text-white/45">Customer requests and internal messages</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close support widget"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <iframe
            src="https://crm.zawrindustries.com/widget/support"
            title="Clinic support chatbot"
            className="block w-full border-0"
            style={{ background: "#121214", height: "72vh", minHeight: "550px" }}
            allow="microphone; camera"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}