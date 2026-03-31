import { useState } from "react";
import { Search, Building, MoreVertical, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_TENANTS = [
  { id: "1", name: "City Health Clinic", plan: "Pro", status: "Active", doctors: 5, patients: 1240 },
  { id: "2", name: "Downtown Medical", plan: "Starter", status: "Active", doctors: 1, patients: 320 },
  { id: "3", name: "Westside Pediatrics", plan: "Growth", status: "Suspended", doctors: 3, patients: 850 },
];

export default function TenantsView() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTenants = MOCK_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500">Manage clinics and their platform access.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-10 bg-white" 
              placeholder="Search clinics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Tenant
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Clinic Name</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Doctors</th>
                <th className="px-6 py-4 font-medium">Patients</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{tenant.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tenant.plan}</td>
                  <td className="px-6 py-4">
                    <Badge variant={tenant.status === 'Active' ? 'default' : 'destructive'} className={tenant.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tenant.doctors}</td>
                  <td className="px-6 py-4 text-gray-600">{tenant.patients}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
