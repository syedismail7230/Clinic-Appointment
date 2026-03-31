import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, FileText, Calendar, Clock, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQueue } from "@/lib/store";

export default function PatientRecords() {
  const navigate = useNavigate();
  const queue = useQueue();
  const [phone, setPhone] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter queue items that are completed and match the phone number
  const records = queue.filter(q => q.status === 'completed' && q.phone === phone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">My Medical Records</h1>
      </div>

      <div className="p-4 flex-1 max-w-md w-full mx-auto">
        <form onSubmit={handleSearch} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter your registered phone number</label>
          <div className="flex gap-2">
            <Input 
              type="tel" 
              placeholder="e.g. 555-0123" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-white"
            />
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </form>

        {hasSearched && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 mb-2">Past Consultations</h2>
            
            {records.length > 0 ? (
              records.map(record => (
                <Card key={record.id} className="overflow-hidden border-none shadow-sm">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString()}</span> {/* Using current date as mock */}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{record.time}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Doctor</p>
                      <p className="font-medium">{record.doctor}</p>
                    </div>
                    
                    {record.prescription && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Doctor's Notes</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border">{record.prescription}</p>
                      </div>
                    )}

                    {record.medicines && record.medicines.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          <Pill className="w-4 h-4" /> Prescribed Medicines
                        </p>
                        <div className="space-y-2">
                          {record.medicines.map((med, idx) => (
                            <div key={idx} className="bg-white border rounded-lg p-3 text-sm">
                              <div className="font-semibold text-gray-900 mb-1">{med.medicineName} <span className="text-gray-500 font-normal">({med.dosage})</span></div>
                              <div className="grid grid-cols-2 gap-2 text-gray-600 mt-2">
                                <div><span className="text-gray-400 text-xs block">Time</span>{med.time}</div>
                                <div><span className="text-gray-400 text-xs block">Frequency</span>{med.frequency}</div>
                                <div className="col-span-2"><span className="text-gray-400 text-xs block">Duration</span>{med.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!record.prescription && (!record.medicines || record.medicines.length === 0)) && (
                      <p className="text-sm text-gray-500 italic">No prescription details recorded for this visit.</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No records found for this number.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
