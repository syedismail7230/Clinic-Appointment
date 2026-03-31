import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CLINICS } from "@/lib/mockData";

export default function ScheduleView() {
  const clinicDoctors = MOCK_CLINICS[0].doctors;
  const [selectedDoctor, setSelectedDoctor] = useState(clinicDoctors[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Mock state for availability: { [doctorId_date]: ["09:00 AM", "09:30 AM"] }
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [newTime, setNewTime] = useState("");

  const currentKey = `${selectedDoctor}_${selectedDate}`;
  const currentSlots = availability[currentKey] || [];

  const handleAddSlot = () => {
    if (!newTime) return;
    
    // Format time to AM/PM for consistency
    const [hours, minutes] = newTime.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const formattedTime = `${formattedHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    if (!currentSlots.includes(formattedTime)) {
      setAvailability({
        ...availability,
        [currentKey]: [...currentSlots, formattedTime].sort((a, b) => {
          // Simple sort logic for AM/PM times
          const timeA = new Date(`1970/01/01 ${a}`);
          const timeB = new Date(`1970/01/01 ${b}`);
          return timeA.getTime() - timeB.getTime();
        })
      });
    }
    setNewTime("");
  };

  const handleRemoveSlot = (timeToRemove: string) => {
    setAvailability({
      ...availability,
      [currentKey]: currentSlots.filter(t => t !== timeToRemove)
    });
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    alert("Availability saved successfully!");
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
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6">
              <Input 
                type="time" 
                className="w-40"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <Button onClick={handleAddSlot} variant="secondary">
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
