import { useEffect, useRef, useState } from "react";

const widgetOrigin = "https://crm.zawrindustries.com";

export default function SupportWidget() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const sendPageContext = () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    let snippet = "";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) snippet += `Description: ${metaDesc.getAttribute("content") ?? ""}\n`;

    const headings = Array.from(document.querySelectorAll("h1, h2"))
      .slice(0, 5)
      .map((heading) => (heading as HTMLElement).innerText.trim())
      .filter(Boolean);
    if (headings.length > 0) snippet += `Headings: ${headings.join(" | ")}`;

    iframe.contentWindow.postMessage(
      {
        type: "page-context",
        url: window.location.href,
        title: document.title,
        snippet: snippet.substring(0, 500),
      },
      "*",
    );
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== widgetOrigin) return;

      if (event.data === "widget-open") {
        setIsExpanded(true);
      } else if (event.data === "widget-close") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const timer = window.setTimeout(() => {
      sendPageContext();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isExpanded]);

  useEffect(() => {
    const onRouteChange = () => {
      if (isExpanded) sendPageContext();
    };

    window.addEventListener("popstate", onRouteChange);
    return () => window.removeEventListener("popstate", onRouteChange);
  }, [isExpanded]);

  return (
    <div
      className="fixed z-999999 overflow-hidden bg-[#121214] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition-all duration-300 ease-in-out"
      style={{
        bottom: isExpanded ? "24px" : "20px",
        right: isExpanded ? "24px" : "20px",
        width: isExpanded ? "380px" : "64px",
        height: isExpanded ? "560px" : "64px",
        borderRadius: isExpanded ? "16px" : "50%",
        boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <iframe
        ref={iframeRef}
        src={`${widgetOrigin}/widget/support`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
          colorScheme: "dark",
          display: "block",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
        onLoad={sendPageContext}
        title="Zawr Support"
      />

      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label="Open support chat"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "#000",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}