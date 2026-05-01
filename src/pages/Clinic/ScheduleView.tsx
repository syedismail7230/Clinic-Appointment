import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ScheduleView() {
  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  // Real state from backend: { [doctorId_date]: ["09:00 AM", ...] }
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [newTime, setNewTime] = useState("");

  const fetchScheduleAndDoctors = async () => {
      try {
        setLoading(true);
        const [clinics, slots] = await Promise.all([
          api.get('/clinics'),
          api.get('/admin/slots')
        ]);
        
        if (clinics.length > 0) {
          const docs = clinics[0].doctors || [];
          setClinicDoctors(docs);
          if (docs.length > 0 && !selectedDoctor) setSelectedDoctor(docs[0].id);
        }
        
        // Group slots by doctor and date
        const grouped: Record<string, string[]> = {};
        for (const slot of slots) {
          // If a slot has no date, we can treat it as recurring, but for this view, we map it exactly as it came from the DB
          const dateKey = slot.date || new Date().toISOString().split('T')[0]; // fallback
          const key = `${slot.doctor_id}_${dateKey}`;
          if (!grouped[key]) grouped[key] = [];
          if (!grouped[key].includes(slot.slot_time)) grouped[key].push(slot.slot_time);
        }
        
        // Sort individual time lists
        Object.keys(grouped).forEach(k => {
          grouped[k].sort();
        });
        
        setAvailability(grouped);
      } catch (error) {
        console.error('Failed to fetch schedule data:', error);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchScheduleAndDoctors();
  }, []);

  const currentKey = `${selectedDoctor}_${selectedDate}`;
  const currentSlots = availability[currentKey] || [];

  const handleAddSlot = async () => {
    if (!newTime) return;
    
    // Format time to AM/PM for consistency
    const [hours, minutes] = newTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const formattedTime = `${formattedHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    if (!currentSlots.includes(formattedTime)) {
      try {
        await api.post('/admin/slots', {
          doctor_id: selectedDoctor,
          slot_time: formattedTime,
          date: selectedDate
        });
        
        setAvailability(prev => ({
          ...prev,
          [currentKey]: [...(prev[currentKey] || []), formattedTime].sort()
        }));
      } catch (error) {
        console.error('Failed to add slot:', error);
      }
    }
    setNewTime("");
  };

  const handleRemoveSlot = async (timeToRemove: string) => {
    try {
      await api.delete('/admin/slots', {
        doctor_id: selectedDoctor,
        slot_time: timeToRemove,
        date: selectedDate
      });
      
      setAvailability(prev => ({
        ...prev,
        [currentKey]: prev[currentKey].filter(t => t !== timeToRemove)
      }));
    } catch (error) {
      console.error('Failed to remove slot:', error);
    }
  };


  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Availability</h2>
        <p className="text-gray-500">Manage schedules and appointment slots for doctors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Select Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
              <select
                className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
              >
                {clinicDoctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  type="date" 
                  className="pl-9"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Available Slots</CardTitle>
            <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">Live Synced</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <Input 
                type="time" 
                className="w-full sm:w-40"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <Button onClick={handleAddSlot} variant="secondary" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {currentSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentSlots.map(slot => (
                  <div key={slot} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {slot}
                    </div>
                    <button 
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 bg-gray-50">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900">No slots configured</h3>
                <p className="text-sm text-gray-500 mt-1">Add time slots for this date to allow bookings.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
