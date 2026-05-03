import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CreditCard, Settings, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import TenantsView from "./TenantsView";
import SubscriptionsView from "./SubscriptionsView";

export default function PlatformAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"tenants" | "subscriptions" | "settings">("tenants");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">QuickCare Admin</h1>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <Button
            variant={activeTab === "tenants" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "tenants" ? "bg-slate-800 text-white hover:bg-slate-700" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("tenants")}
          >
            <Building2 className="w-5 h-5 mr-3" />
            Tenants (Clinics)
          </Button>
          <Button
            variant={activeTab === "subscriptions" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "subscriptions" ? "bg-slate-800 text-white hover:bg-slate-700" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("subscriptions")}
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Subscriptions
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className={`w-full justify-start ${activeTab === "settings" ? "bg-slate-800 text-white hover:bg-slate-700" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            Platform Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => navigate("/")}>
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "tenants" && <TenantsView />}
        {activeTab === "subscriptions" && <SubscriptionsView />}
        {activeTab === "settings" && <div className="p-6 text-gray-500">Platform Settings (Coming Soon)</div>}
      </main>
    </div>
  );
}
