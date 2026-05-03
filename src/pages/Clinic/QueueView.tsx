import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle2, Activity, Search, UserPlus, MoreVertical, Plus, Trash2, ArrowUpDown, FileText, Pill } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useQueue, updateQueueItem, addQueueItem, PrescriptionItem } from "@/lib/store";
import { api } from "@/lib/api";

type SortField = 'time' | 'token';
type SortDirection = 'asc' | 'desc';

export default function QueueView() {
  const queue = useQueue();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState("");
  const [medicines, setMedicines] = useState<PrescriptionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('token');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: '', phone: '', doctor: '' });
  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await api.get('/admin/doctors');
        setClinicDoctors(doctors);
      } catch (error) {
        try {
          const clinics = await api.get('/clinics');
          if (clinics.length > 0) {
            setClinicDoctors(clinics[0].doctors || []);
          }
        } catch (err) {
          console.error('Failed to fetch doctors:', err);
        }
      }
    };
    fetchDoctors();
  }, []);

  // Get unique doctors from queue for filter
  const queueDoctors = Array.from(new Set(queue.map(q => q.doctor))).filter(Boolean);

  // Filter queue
  const filteredQueue = queue.filter(item => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        item.patientName.toLowerCase().includes(term) ||
        item.phone.includes(term) ||
        item.doctor.toLowerCase().includes(term) ||
        (item.token && item.token.toLowerCase().includes(term))
      );
      if (!matchesSearch) return false;
    }
    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    // Doctor filter
    if (doctorFilter !== 'all' && item.doctor !== doctorFilter) return false;
    return true;
  });

  // Sort
  const sortedQueue = [...filteredQueue].sort((a, b) => {
    if (sortField === 'token') {
      const tokenA = a.token || '';
      const tokenB = b.token || '';
      return sortDir === 'asc' ? tokenA.localeCompare(tokenB) : tokenB.localeCompare(tokenA);
    } else {
      const timeA = a.time || '';
      const timeB = b.time || '';
      return sortDir === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
    }
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'completed') {
      setSelectedPatientId(id);
      setPrescription("");
      setMedicines([]);
    } else {
      await updateQueueItem(id, { status: newStatus });
    }
  };

  const handleCompleteConsultation = async () => {
    if (selectedPatientId) {
      await updateQueueItem(selectedPatientId, { status: 'completed', prescription, medicines });
      setSelectedPatientId(null);
    }
  };

  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now().toString(), medicineName: '', dosage: '', time: '', frequency: '', duration: '' }]);
  };

  const updateMedicine = (id: string, field: keyof PrescriptionItem, value: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleWalkInSubmit = async () => {
    if (!walkInForm.name || !walkInForm.phone || !walkInForm.doctor) return;
    
    await addQueueItem({
      id: `q${Date.now()}`,
      patientName: walkInForm.name,
      phone: walkInForm.phone,
      status: 'waiting',
      doctor: walkInForm.doctor,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      waitTime: '10 mins',
      prescription: '',
      medicines: []
    });
    setIsWalkInModalOpen(false);
    setWalkInForm({ name: '', phone: '', doctor: '' });
  };

  const calculateAvgWait = () => {
    const waitingPatients = queue.filter(q => q.status === 'waiting' || q.status === 'in-consultation');
    if (waitingPatients.length === 0) return '0m';
    const avgMinutes = Math.round(waitingPatients.length * 8);
    return `${avgMinutes}m`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'waiting': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Waiting</Badge>;
      case 'in-consultation': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Consultation</Badge>;
      case 'booked': return <Badge variant="outline" className="text-gray-600">Booked</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Today's Queue</h2>
          <p className="text-gray-500">Manage patient flow and wait times.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-9 bg-white" 
              placeholder="Search patient..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="shrink-0" onClick={() => setIsWalkInModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Walk-in
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Today</h3>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{queue.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Waiting</h3>
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold">{queue.filter(q => q.status === 'waiting').length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{queue.filter(q => q.status === 'completed').length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Avg Wait</h3>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{calculateAvgWait()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="waiting">Waiting</option>
          <option value="in-consultation">In Consultation</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={doctorFilter}
          onChange={e => setDoctorFilter(e.target.value)}
        >
          <option value="all">All Doctors</option>
          {queueDoctors.map(doc => (
            <option key={doc} value={doc}>{doc}</option>
          ))}
        </select>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => toggleSort('token')}
            className={`h-9 px-3 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${sortField === 'token' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Token {sortField === 'token' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('time')}
            className={`h-9 px-3 rounded-lg border text-sm flex items-center gap-1.5 transition-colors ${sortField === 'time' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Time {sortField === 'time' && (sortDir === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Queue List */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Token</th>
                <th className="px-6 py-4 font-medium">Patient</th>
                <th className="px-6 py-4 font-medium">Time / Wait</th>
                <th className="px-6 py-4 font-medium">Doctor</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || doctorFilter !== 'all' 
                      ? 'No patients match your filters.' 
                      : 'No patients in queue today.'}
                  </td>
                </tr>
              ) : sortedQueue.map((item) => (
                <tr key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.token}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.patientName}</div>
                    <div className="text-gray-500 text-xs">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.time}</div>
                    <div className="text-gray-500 text-xs">{item.waitTime} wait</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{item.doctor}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === 'booked' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(item.id, 'waiting')}>Mark Arrived</Button>
                      )}
                      {item.status === 'waiting' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(item.id, 'in-consultation')}>Start Consult</Button>
                      )}
                      {item.status === 'in-consultation' && (
                        <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(item.id, 'completed')}>Complete</Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={() => setViewingPatient(item)}>
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

      {/* Patient Detail Modal (Action button) */}
      <Modal 
        isOpen={!!viewingPatient} 
        onClose={() => setViewingPatient(null)} 
        title="Patient Details"
      >
        {viewingPatient && (
          <div className="space-y-6 max-w-lg w-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewingPatient.patientName}</h3>
                <p className="text-gray-500">{viewingPatient.phone}</p>
              </div>
              {getStatusBadge(viewingPatient.status)}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-xl border text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Token</p>
                <p className="font-bold text-lg">{viewingPatient.token}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Time</p>
                <p className="font-bold text-lg">{viewingPatient.time}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border text-center">
                <p className="text-xs text-gray-500 font-medium mb-1">Doctor</p>
                <p className="font-bold text-sm">{viewingPatient.doctor}</p>
              </div>
            </div>

            {viewingPatient.prescription && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                  <FileText className="w-4 h-4" /> Prescription Notes
                </h4>
                <p className="text-blue-800 text-sm whitespace-pre-wrap">{viewingPatient.prescription}</p>
              </div>
            )}

            {viewingPatient.medicines && viewingPatient.medicines.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
                  <Pill className="w-4 h-4" /> Medicines
                </h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Medicine</th>
                        <th className="px-3 py-2 text-left">Dosage</th>
                        <th className="px-3 py-2 text-left">Frequency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {viewingPatient.medicines.map((med: any, i: number) => (
                        <tr key={med.id || i}>
                          <td className="px-3 py-2 text-gray-500">{i + 1}</td>
                          <td className="px-3 py-2 font-medium">{med.medicineName}</td>
                          <td className="px-3 py-2">{med.dosage}</td>
                          <td className="px-3 py-2">{med.frequency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!viewingPatient.prescription && (!viewingPatient.medicines || viewingPatient.medicines.length === 0) && viewingPatient.status !== 'completed' && (
              <div className="text-center py-6 text-gray-400 text-sm">
                No prescription added yet. Complete the consultation to add medicines and notes.
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Prescription Modal (Complete consultation) */}
      <Modal 
        isOpen={!!selectedPatientId} 
        onClose={() => setSelectedPatientId(null)} 
        title="Complete Consultation"
      >
        <div className="space-y-6 max-w-4xl w-full">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Medicines</label>
              <Button size="sm" variant="outline" onClick={addMedicine} className="h-8">
                <Plus className="w-4 h-4 mr-1" /> Add Medicine
              </Button>
            </div>
            
            {medicines.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 font-medium w-12">Sl No.</th>
                      <th className="px-3 py-2 font-medium">Medicine Name</th>
                      <th className="px-3 py-2 font-medium">Dosage</th>
                      <th className="px-3 py-2 font-medium">Time</th>
                      <th className="px-3 py-2 font-medium">Frequency</th>
                      <th className="px-3 py-2 font-medium">Duration</th>
                      <th className="px-3 py-2 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {medicines.map((med, index) => (
                      <tr key={med.id} className="bg-white">
                        <td className="px-3 py-2 text-center text-gray-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <Input className="h-8 text-sm" placeholder="e.g. Paracetamol" value={med.medicineName} onChange={(e) => updateMedicine(med.id, 'medicineName', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <Input className="h-8 text-sm" placeholder="e.g. 500mg" value={med.dosage} onChange={(e) => updateMedicine(med.id, 'dosage', e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black" value={med.time} onChange={(e) => updateMedicine(med.id, 'time', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Before Food">Before Food</option>
                            <option value="After Food">After Food</option>
                            <option value="Empty Stomach">Empty Stomach</option>
                            <option value="With Food">With Food</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black" value={med.frequency} onChange={(e) => updateMedicine(med.id, 'frequency', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                            <option value="0-1-0 (Afternoon)">0-1-0 (Afternoon)</option>
                            <option value="0-0-1 (Night)">0-0-1 (Night)</option>
                            <option value="1-0-1 (Morning & Night)">1-0-1 (Morning & Night)</option>
                            <option value="1-1-1 (3 times a day)">1-1-1 (3 times a day)</option>
                            <option value="SOS (As needed)">SOS (As needed)</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-gray-200 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black" value={med.duration} onChange={(e) => updateMedicine(med.id, 'duration', e.target.value)}>
                            <option value="">Select...</option>
                            <option value="1 Day">1 Day</option>
                            <option value="3 Days">3 Days</option>
                            <option value="5 Days">5 Days</option>
                            <option value="1 Week">1 Week</option>
                            <option value="2 Weeks">2 Weeks</option>
                            <option value="1 Month">1 Month</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeMedicine(med.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed rounded-xl bg-gray-50 text-gray-500 text-sm">
                No medicines added. Click "Add Medicine" to prescribe.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea 
              className="w-full h-24 p-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
              placeholder="Enter any additional advice or notes here..."
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedPatientId(null)}>Cancel</Button>
            <Button onClick={handleCompleteConsultation}>Save & Complete</Button>
          </div>
        </div>
      </Modal>

      {/* Walk-in Modal */}
      <Modal 
        isOpen={isWalkInModalOpen} 
        onClose={() => setIsWalkInModalOpen(false)} 
        title="Add Walk-in Patient"
      >
        <div className="space-y-4 max-w-md w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <Input placeholder="e.g. John Doe" value={walkInForm.name} onChange={(e) => setWalkInForm({...walkInForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <Input placeholder="e.g. 9876543210" value={walkInForm.phone} onChange={(e) => setWalkInForm({...walkInForm, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={walkInForm.doctor}
              onChange={(e) => setWalkInForm({...walkInForm, doctor: e.target.value})}
            >
              <option value="">Select a doctor...</option>
              {clinicDoctors.map(doc => (
                <option key={doc.id} value={doc.name}>{doc.name} - {doc.specialty}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsWalkInModalOpen(false)}>Cancel</Button>
            <Button onClick={handleWalkInSubmit} disabled={!walkInForm.name || !walkInForm.phone || !walkInForm.doctor}>Add to Queue</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
