import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar as CalendarIcon, LogOut, Activity, UserSquare2, Settings, Clock, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import QueueView from "./QueueView";
import AppointmentsView from "./AppointmentsView";
import PatientsView from "./PatientsView";
import SettingsView from "./SettingsView";
import ScheduleView from "./ScheduleView";

export default function ClinicDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"queue" | "appointments" | "patients" | "schedule" | "settings">("queue");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">QuickCare</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-white border-r md:min-h-screen flex-col absolute md:static z-40 h-[calc(100vh-73px)] md:h-auto top-[73px]`}>
        <div className="hidden md:flex p-6 border-b items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">QuickCare</h1>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <Button 
            variant={activeTab === "queue" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => handleTabChange("queue")}
          >
            <Users className="w-5 h-5 mr-3" />
            Live Queue
          </Button>
          <Button 
            variant={activeTab === "appointments" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => handleTabChange("appointments")}
          >
            <CalendarIcon className="w-5 h-5 mr-3" />
            Appointments
          </Button>
          <Button 
            variant={activeTab === "patients" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => handleTabChange("patients")}
          >
            <UserSquare2 className="w-5 h-5 mr-3" />
            Patients
          </Button>
          <Button 
            variant={activeTab === "schedule" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => handleTabChange("schedule")}
          >
            <Clock className="w-5 h-5 mr-3" />
            Schedule
          </Button>
          <Button 
            variant={activeTab === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => handleTabChange("settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t mt-auto bg-white">
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => navigate("/admin")}>
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 overflow-y-auto ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
        {activeTab === "queue" && <QueueView />}
        {activeTab === "appointments" && <AppointmentsView />}
        {activeTab === "patients" && <PatientsView />}
        {activeTab === "schedule" && <ScheduleView />}
        {activeTab === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
