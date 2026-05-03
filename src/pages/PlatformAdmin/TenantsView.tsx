import { useState, useEffect } from "react";
import { Search, Building, MoreVertical, Plus, QrCode, ArrowLeft, Users, Stethoscope, Calendar, Activity, ExternalLink, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/modal";

export default function TenantsView() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [selectedQR, setSelectedQR] = useState<{name: string, url: string} | null>(null);
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [newTenantData, setNewTenantData] = useState({ name: "", email: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail View State
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [tenantDetails, setTenantDetails] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

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

  const handleViewTenantDetails = async (id: string) => {
    try {
      setLoading(true);
      const data = await api.get(`/admin/tenants/${id}`);
      setTenantDetails(data);
      setEditForm({
        name: data.clinic?.name || data.name,
        email: data.email,
        phone: data.phone,
        address: data.clinic?.address || '',
        maps_link: data.clinic?.maps_link || '',
        gst_number: data.clinic?.gst_number || '',
        status: data.status,
        plan: data.plan,
        subscription_end: data.subscription_end ? data.subscription_end.split('T')[0] : ''
      });
      setSelectedTenantId(id);
      setView('detail');
    } catch (err) {
      console.error(err);
      alert('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenantDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) return;
    setIsUpdating(true);
    try {
      await api.patch(`/admin/tenants/${selectedTenantId}`, editForm);
      fetchTenantDetails(selectedTenantId);
      fetchTenants(); // update background list silently
      alert('Tenant updated successfully!');
    } catch (err) {
      alert('Failed to update tenant');
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchTenantDetails = async (id: string) => {
    const data = await api.get(`/admin/tenants/${id}`);
    setTenantDetails(data);
  };

  const handleImpersonate = async () => {
    if (!selectedTenantId || !tenantDetails) return;
    const confirmMsg = `Are you sure you want to login as ${tenantDetails.name}? You will be able to manage their clinic.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { token } = await api.post('/admin/impersonate', { tenant_id: selectedTenantId });
      localStorage.setItem('token', token);
      window.location.href = '/admin'; 
    } catch (err) {
      alert('Failed to impersonate clinic');
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'detail' && tenantDetails) {
    return (
      <div className="animate-in fade-in duration-300 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setView('list')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{tenantDetails.name}</h2>
                <Badge variant={tenantDetails.status === 'active' ? 'default' : 'destructive'} className={tenantDetails.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                  {tenantDetails.status}
                </Badge>
              </div>
              <p className="text-gray-500 text-sm mt-1">Tenant ID: {tenantDetails.id}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => handleGenerateQR(tenantDetails.id, tenantDetails.name)}>
              <QrCode className="w-4 h-4 mr-2" /> Show QR
            </Button>
            <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleImpersonate}>
              <LogIn className="w-4 h-4 mr-2" /> Login as Clinic
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <h3 className="font-medium text-sm">Total Doctors</h3>
                <Stethoscope className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{tenantDetails.doctors?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <h3 className="font-medium text-sm">Total Patients</h3>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{tenantDetails.patientsCount}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <h3 className="font-medium text-sm">Appointments (M)</h3>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{tenantDetails.appointmentsCount}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <h3 className="font-medium text-sm">Current Plan</h3>
                <Activity className="w-4 h-4" />
              </div>
              <p className="text-3xl font-bold text-gray-900 capitalize">{tenantDetails.plan}</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Clinic Profile Configuration</h3>
              <form id="tenantEditForm" onSubmit={handleUpdateTenantDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Clinic Name</label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Contact Email</label>
                  <Input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">GST Number</label>
                  <Input value={editForm.gst_number} onChange={(e) => setEditForm({...editForm, gst_number: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <Input value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Google Maps Link</label>
                  <Input value={editForm.maps_link} onChange={(e) => setEditForm({...editForm, maps_link: e.target.value})} placeholder="https://maps.google.com/..." />
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Settings</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Account Status</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Subscription Plan</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    value={editForm.plan}
                    onChange={(e) => setEditForm({...editForm, plan: e.target.value})}
                  >
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Subscription Ends</label>
                  <Input type="date" value={editForm.subscription_end} onChange={(e) => setEditForm({...editForm, subscription_end: e.target.value})} />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for lifetime access.</p>
                </div>
                
                <div className="pt-4 border-t">
                  <Button type="submit" form="tenantEditForm" disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {isUpdating ? "Saving..." : "Save All Changes"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Table */}
        <Card className="border-none shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-white">
            <h3 className="text-lg font-bold text-gray-900">Clinic Doctors</h3>
            <p className="text-gray-500 text-sm">Staff registered under this tenant.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Doctor Name</th>
                  <th className="px-6 py-4 font-medium">Specialty</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y relative">
                {tenantDetails.doctors.length === 0 ? (
                  <tr className="bg-white">
                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500">No doctors registered yet.</td>
                  </tr>
                ) : (
                  tenantDetails.doctors.map((doc: any) => (
                    <tr key={doc.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                      <td className="px-6 py-4 text-gray-600">{doc.specialty || 'General'}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* QR Code Modal (Reused) */}
        <Modal isOpen={!!selectedQR} onClose={() => setSelectedQR(null)} title="Clinic QR Code">
          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-center text-gray-500">Scanning this code allows patients to book appointments instantly.</p>
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
      </div>
    );
  }

  // List View
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
                <tr key={tenant.id} className="bg-white hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleViewTenantDetails(tenant.id)}>
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
                  <td className="px-6 py-4 text-gray-600">{tenant.doctorsCount || 0}</td>
                  <td className="px-6 py-4 text-gray-600">{tenant.patientsCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50 transition-colors" onClick={() => handleGenerateQR(tenant.id, tenant.name)}>
                        <QrCode className="w-3.5 h-3.5 text-blue-600" />
                        View QR
                      </button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={() => handleViewTenantDetails(tenant.id)}>
                        <ExternalLink className="w-4 h-4" />
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
