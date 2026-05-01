import { useState, useEffect } from "react";
import { Search, Building, MoreVertical, Plus, QrCode } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/modal";

export default function TenantsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState<{name: string, url: string} | null>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenantData, setNewTenantData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await api.get('/admin/tenants');
      setTenants(data);
    } catch (error: any) {
      console.error('Failed to fetch tenants:', error);
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401') || error?.message?.includes('Root access required') || error?.message?.includes('403')) {
        window.location.href = '/admin';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/onboard', newTenantData);
      setIsAddingTenant(false);
      setNewTenantData({ name: "", email: "", phone: "" });
      fetchTenants();
    } catch (error) {
      console.error('Failed to add tenant:', error);
      alert('Failed to add clinic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateQR = async (id: string, name: string) => {
    try {
      const { qrUrl } = await api.post(`/admin/tenants/${id}/qr`, {});
      setSelectedQR({ name, url: qrUrl });
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const filteredTenants = tenants.filter(t => 
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
          <Button className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsAddingTenant(true)}>
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
            <tbody className="divide-y relative">
              {loading && (
                 <tr className="bg-white">
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">Loading clinics...</td>
                 </tr>
              )}
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
                  <td className="px-6 py-4 text-gray-600 capitalize">{tenant.plan || 'basic'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'} className={tenant.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100 uppercase text-[10px]' : 'uppercase text-[10px]'}>
                      {tenant.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-600">-</td>
                  <td className="px-6 py-4 text-gray-600">-</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition-colors" onClick={() => handleGenerateQR(tenant.id, tenant.name)}>
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        View QR
                      </button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={!!selectedQR} 
        onClose={() => setSelectedQR(null)} 
        title="Clinic QR Code"
      >
        <div className="flex flex-col items-center justify-center space-y-6">
          <p className="text-center text-gray-500">
            Scanning this code allows patients to book appointments at {selectedQR?.name} instantly.
          </p>
          {selectedQR && (
            <>
              <div className="bg-white p-6 rounded-3xl shadow-inner border-8 border-gray-50">
                <img src={selectedQR.url} alt="Clinic QR" className="w-48 h-48" />
              </div>
              <div className="w-full space-y-3">
                <Button className="w-full h-14 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100" onClick={() => window.open(selectedQR.url, '_blank')}>
                  Download Image
                </Button>
                <Button variant="ghost" className="w-full h-12 rounded-xl font-medium text-gray-500" onClick={() => setSelectedQR(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isAddingTenant}
        onClose={() => setIsAddingTenant(false)}
        title="Onboard New Clinic"
      >
        <form onSubmit={handleAddTenant} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
            <Input 
              required
              placeholder="e.g. City Hospital"
              value={newTenantData.name}
              onChange={(e) => setNewTenantData({...newTenantData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input 
              required
              type="email"
              placeholder="contact@clinic.com"
              value={newTenantData.email}
              onChange={(e) => setNewTenantData({...newTenantData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <Input 
              required
              type="tel"
              placeholder="10-digit number"
              value={newTenantData.phone}
              onChange={(e) => setNewTenantData({...newTenantData, phone: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsAddingTenant(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Adding..." : "Add Clinic"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
