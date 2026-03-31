import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { MOCK_CLINICS } from "@/lib/mockData";

export default function ClinicView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clinic = MOCK_CLINICS.find(c => c.id === id);
  
  const [selectedDoctor, setSelectedDoctor] = useState(clinic?.doctors[0]?.id);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!clinic) return <div className="p-6 text-center">Clinic not found</div>;

  const doctor = clinic.doctors.find(d => d.id === selectedDoctor);

  const handleContinue = () => {
    if (selectedSlot && selectedDate) {
      navigate(`/clinic/${id}/book`, { 
        state: { 
          doctorId: selectedDoctor, 
          slot: selectedSlot,
          date: format(selectedDate, 'yyyy-MM-dd')
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="p-4 flex items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold truncate">{clinic.name}</h1>
      </div>

      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Choose a Doctor</h2>
        
        <div className="space-y-4 mb-8">
          {clinic.doctors.map(doc => (
            <div 
              key={doc.id}
              className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedDoctor === doc.id ? 'border-black bg-gray-50' : 'border-transparent bg-white hover:bg-gray-50'}`}
              onClick={() => {
                setSelectedDoctor(doc.id);
                setSelectedSlot(null);
              }}
            >
              <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center mr-4 shrink-0">
                <User className="w-7 h-7 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{doc.name}</h3>
                <p className="text-gray-500 text-sm">{doc.specialty}</p>
              </div>
              {selectedDoctor === doc.id && (
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {doctor && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select Date
              </h2>
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-center border border-gray-100">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="bg-transparent"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-bold tracking-tight mb-4">
                  Select Time <span className="text-gray-500 text-base font-normal ml-2">{format(selectedDate, 'MMM d')}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {doctor.availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-4 px-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 border-2
                        ${selectedSlot === slot 
                          ? 'border-black bg-black text-white scale-[1.02] shadow-md' 
                          : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-20">
        <Button 
          className="w-full h-14 text-lg rounded-xl font-bold" 
          disabled={!selectedSlot || !selectedDate}
          onClick={handleContinue}
        >
          {selectedSlot && selectedDate ? `Confirm ${selectedSlot}` : 'Choose date & time'}
        </Button>
      </div>
    </div>
  );
}
