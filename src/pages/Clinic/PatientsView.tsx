import { useState, useEffect } from "react";
import { Search, FileText, Phone, Calendar, Clock, User, Pill, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

export default function PatientsView() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<{ appointments: any[], queueHistory: any[] }>({ appointments: [], queueHistory: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.get('/patients');
        setPatients(data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleViewHistory = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const data = await api.get(`/patients/${encodeURIComponent(patient.phone)}/history`);
      setPatientHistory(data);
    } catch (error) {
      console.error('Failed to fetch patient history:', error);
      setPatientHistory({ appointments: [], queueHistory: [] });
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Directory</h2>
          <p className="text-gray-500">View and manage patient history.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            className="pl-10 bg-white" 
            placeholder="Search by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Patient Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Last Visit</th>
                <th className="px-6 py-4 font-medium">Total Visits</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {patient.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {patient.last_visit || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{patient.totalVisits}</td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => handleViewHistory(patient)}>
                      <FileText className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No patients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Patient History Modal */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient History">
        {selectedPatient && (
          <div className="space-y-6 max-w-2xl w-full">
            {/* Patient Info Header */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedPatient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h3>
                <p className="text-gray-500 flex items-center gap-2"><Phone className="w-3 h-3" /> {selectedPatient.phone}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{selectedPatient.totalVisits}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Total Visits</div>
              </div>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8 text-gray-400">Loading history...</div>
            ) : (
              <>
                {/* Appointment History */}
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
                    <History className="w-4 h-4" /> Visit History
                  </h4>
                  
                  {patientHistory.appointments.length > 0 || patientHistory.queueHistory.length > 0 ? (
                    <div className="space-y-4">
                      {patientHistory.appointments.map((apt: any) => (
                        <div key={apt.id} className="border rounded-xl p-4 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900">{apt.date}</span>
                              <span className="text-gray-400">at</span>
                              <span className="text-gray-700">{apt.time}</span>
                            </div>
                            <Badge className={apt.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-gray-100 text-gray-600'}>
                              {apt.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                            <User className="w-3 h-3" /> {apt.doctor}
                          </div>
                          
                          {apt.notes && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-2 text-sm text-gray-700">
                              <span className="font-medium text-gray-900">Notes: </span>{apt.notes}
                            </div>
                          )}
                          
                          {apt.tags && apt.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {apt.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{tag}</span>
                              ))}
                            </div>
                          )}

                          {apt.medicines && apt.medicines.length > 0 && (
                            <div className="mt-3 border-t pt-3">
                              <h5 className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-2">
                                <Pill className="w-3 h-3" /> Medicines
                              </h5>
                              <div className="space-y-1">
                                {apt.medicines.map((med: any, i: number) => (
                                  <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="text-gray-400">{i+1}.</span>
                                    <span className="font-medium">{med.medicineName}</span>
                                    <span className="text-gray-400">—</span>
                                    <span>{med.dosage}</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{med.frequency}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show queue history that doesn't have matching appointments */}
                      {patientHistory.queueHistory
                        .filter(q => !patientHistory.appointments.some(a => a.phone === q.phone && a.date === q.date && a.doctor === q.doctor))
                        .map((q: any) => (
                          <div key={q.id} className="border rounded-xl p-4 bg-white border-dashed">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold text-gray-900">{q.date}</span>
                                <span className="text-gray-400">at</span>
                                <span className="text-gray-700">{q.time}</span>
                              </div>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">completed</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-3 h-3" /> {q.doctor}
                            </div>
                            {q.prescription && (
                              <div className="bg-gray-50 rounded-lg p-3 mt-2 text-sm text-gray-700">{q.prescription}</div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-xl bg-gray-50">
                      <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No visit history found for this patient.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
