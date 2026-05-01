import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, MapPin, Clock, Activity, FileText } from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { useQueue } from "@/lib/store";
import { api } from "@/lib/api";

export default function Confirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { doctorId: string, slot: string, name: string, phone: string, date?: string, queueId?: string } | null;
  
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const queue = useQueue(clinic?.tenant_id);
  const myQueueItem = queue.find(q => q.id === state?.queueId);

  const [waitTime, setWaitTime] = useState(15);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await api.get(`/clinics/${id}`);
        setClinic(data);
      } catch (error) {
        console.error('Failed to fetch clinic:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  useEffect(() => {
    // Simulate real-time wait time updates
    const interval = setInterval(() => {
      setWaitTime(prev => Math.max(0, prev - 1));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-16 text-center">Loading...</div>;
  if (!clinic || !state) {
    return <div className="p-6 text-center">Booking not found</div>;
  }

  const doctor = clinic.doctors?.find((d: any) => d.id === state.doctorId);
  if (!doctor) return <div className="p-6 text-center">Doctor not found</div>;

  const bookingDate = state.date ? parseISO(state.date) : new Date();
  const dateText = isToday(bookingDate) ? "Today" : format(bookingDate, 'MMM d, yyyy');

  // Calculate queue stats
  let currentConsultingToken = "--";
  let turnsRemaining = 0;
  
  if (myQueueItem) {
    const doctorQueue = queue.filter(q => q.doctor === doctor.name);
    const inConsultation = doctorQueue.find(q => q.status === 'in-consultation');
    if (inConsultation) {
      currentConsultingToken = inConsultation.token;
    }
    
    const myIndex = doctorQueue.findIndex(q => q.id === myQueueItem.id);
    if (myIndex !== -1) {
      // Count waiting patients before me
      turnsRemaining = doctorQueue.slice(0, myIndex).filter(q => q.status === 'waiting').length;
      if (inConsultation) turnsRemaining += 1; // Add the one currently in consultation
    }
  }

  const renderStatusHeader = () => {
    if (!myQueueItem) {
      return (
        <>
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Confirmed</h1>
          <p className="text-lg text-gray-600 font-medium">Token #A-42</p>
        </>
      );
    }

    if (myQueueItem.status === 'completed') {
      return (
        <>
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-500">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Consultation Finished</h1>
          <p className="text-lg text-gray-600 font-medium">Hope you feel better soon!</p>
        </>
      );
    }

    if (myQueueItem.status === 'in-consultation') {
      return (
        <>
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-500">
            <Activity className="w-12 h-12 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Consultation Started</h1>
          <p className="text-lg text-gray-600 font-medium">Please proceed to the doctor's room.</p>
        </>
      );
    }

    return (
      <>
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl animate-in zoom-in duration-500">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">You are in clinic</h1>
        <p className="text-lg text-gray-600 font-medium">Token #{myQueueItem.token}</p>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Top Status Area */}
      <div className="relative z-10 pt-16 pb-8 px-6 flex flex-col items-center justify-center text-center">
        {renderStatusHeader()}
      </div>

      {/* Bottom Sheet Area */}
      <div className="relative z-10 mt-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-6" />
        
        <div className="px-6 pb-8 space-y-6">
          
          {myQueueItem?.status === 'completed' && (myQueueItem.prescription || (myQueueItem.medicines && myQueueItem.medicines.length > 0)) ? (
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-blue-900">Your Prescription</h2>
              </div>
              
              {myQueueItem.medicines && myQueueItem.medicines.length > 0 && (
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                    <thead className="text-xs text-blue-800 uppercase bg-blue-100/50 border-b border-blue-200">
                      <tr>
                        <th className="px-3 py-2 font-medium">Sl No.</th>
                        <th className="px-3 py-2 font-medium">Medicine</th>
                        <th className="px-3 py-2 font-medium">Dosage</th>
                        <th className="px-3 py-2 font-medium">Time</th>
                        <th className="px-3 py-2 font-medium">Frequency</th>
                        <th className="px-3 py-2 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {myQueueItem.medicines.map((med, index) => (
                        <tr key={med.id} className="bg-white/50">
                          <td className="px-3 py-2 text-center text-blue-900">{index + 1}</td>
                          <td className="px-3 py-2 font-medium text-blue-900">{med.medicineName}</td>
                          <td className="px-3 py-2 text-blue-800">{med.dosage}</td>
                          <td className="px-3 py-2 text-blue-800">{med.time}</td>
                          <td className="px-3 py-2 text-blue-800">{med.frequency}</td>
                          <td className="px-3 py-2 text-blue-800">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {myQueueItem.prescription && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-blue-900 mb-1">Additional Notes:</h3>
                  <p className="text-blue-800 whitespace-pre-wrap">{myQueueItem.prescription}</p>
                </div>
              )}
            </div>
          ) : myQueueItem?.status === 'waiting' || myQueueItem?.status === 'booked' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Currently Consulting</h2>
                <div className="text-3xl font-bold text-black">{currentConsultingToken}</div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Turns Remaining</h2>
                <div className="text-3xl font-bold text-black">{turnsRemaining}</div>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center flex justify-center items-center gap-2">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estimated Wait:</h2>
                <div className="text-2xl font-bold text-black">{waitTime} min</div>
              </div>
            </div>
          ) : null}

          {/* Details List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1 border-b border-gray-100 pb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Time</p>
                <p className="font-bold text-xl text-gray-900">{dateText}, {state.slot}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1 border-b border-gray-100 pb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-bold text-xl text-gray-900">{doctor.name}</p>
                <p className="text-gray-500 font-medium">{doctor.specialty}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Clinic</p>
                <p className="font-bold text-xl text-gray-900">{clinic.name}</p>
                <p className="text-gray-500 font-medium">{clinic.address}</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-14 text-lg rounded-xl font-bold mt-4"
            onClick={() => navigate('/')}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
