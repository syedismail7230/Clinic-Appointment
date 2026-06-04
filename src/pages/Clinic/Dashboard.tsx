import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar as CalendarIcon, LogOut, Activity,
  UserSquare2, Settings, Clock, Menu, X
} from "lucide-react";
import QueueView from "./QueueView";
import AppointmentsView from "./AppointmentsView";
import PatientsView from "./PatientsView";
import SettingsView from "./SettingsView";
import ScheduleView from "./ScheduleView";

type Tab = "queue" | "appointments" | "patients" | "schedule" | "settings";

const navItems: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "queue",        label: "Live Queue",    icon: Users },
  { id: "appointments", label: "Appointments",  icon: CalendarIcon },
  { id: "patients",     label: "Patients",      icon: UserSquare2 },
  { id: "schedule",     label: "Schedule",      icon: Clock },
  { id: "settings",     label: "Settings",      icon: Settings },
];

export default function ClinicDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("queue");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col md:flex-row">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden bg-[#0a0a0a] px-4 h-14 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-tight text-lg">QuickCare</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white/70 hover:text-white transition-colors p-1"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`
          ${isMobileMenuOpen ? "flex" : "hidden"} md:flex
          w-full md:w-[220px] bg-[#0a0a0a]
          flex-col
          absolute md:static z-40
          h-[calc(100vh-56px)] md:h-auto md:min-h-screen
          top-[56px] md:top-0
        `}
      >
        {/* Logo — desktop only */}
        <div className="hidden md:flex items-center gap-2.5 px-5 h-14 border-b border-white/[0.06]">
          <Activity className="w-5 h-5 text-white" />
          <span className="font-semibold text-white tracking-tight text-lg">QuickCare</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium
                  transition-all duration-150 text-left
                  ${active
                    ? "bg-white text-[#0a0a0a]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom — sign out */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-150 text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main
        className={`
          flex-1 overflow-y-auto
          ${isMobileMenuOpen ? "hidden md:block" : "block"}
        `}
      >
        {/* Per-screen inner padding */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-8">
          {activeTab === "queue"        && <QueueView />}
          {activeTab === "appointments" && <AppointmentsView />}
          {activeTab === "patients"     && <PatientsView />}
          {activeTab === "schedule"     && <ScheduleView />}
          {activeTab === "settings"     && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
