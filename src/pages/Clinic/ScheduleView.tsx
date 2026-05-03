import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

export default function ScheduleView() {
  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [newTime, setNewTime] = useState("");

  // Doctor management
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '' });
  const [addingDoctor, setAddingDoctor] = useState(false);

  const fetchDoctors = async () => {
    try {
      const doctors = await api.get('/admin/doctors');
      setClinicDoctors(doctors);
      if (doctors.length > 0 && !selectedDoctor) {
        setSelectedDoctor(doctors[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchSlots = async () => {
    try {
      const slots = await api.get('/admin/slots');
      const grouped: Record<string, string[]> = {};
      for (const slot of slots) {
        const dateKey = slot.date || 'recurring';
        const key = `${slot.doctor_id}_${dateKey}`;
        if (!grouped[key]) grouped[key] = [];
        if (!grouped[key].includes(slot.slot_time)) grouped[key].push(slot.slot_time);
      }
      Object.keys(grouped).forEach(k => {
        grouped[k].sort();
      });
      setAvailability(grouped);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchDoctors(), fetchSlots()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Show date-specific slots, falling back to recurring slots
  const dateKey = `${selectedDoctor}_${selectedDate}`;
  const recurringKey = `${selectedDoctor}_recurring`;
  const currentSlots = availability[dateKey] || availability[recurringKey] || [];

  const handleAddSlot = async () => {
    if (!newTime || !selectedDoctor) return;
    
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
          [dateKey]: [...(prev[dateKey] || []), formattedTime].sort()
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
        [dateKey]: (prev[dateKey] || []).filter(t => t !== timeToRemove)
      }));
    } catch (error) {
      console.error('Failed to remove slot:', error);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name) return;
    setAddingDoctor(true);
    try {
      await api.post('/admin/doctors', {
        name: newDoctor.name,
        specialty: newDoctor.specialty
      });
      await fetchDoctors();
      setIsAddDoctorOpen(false);
      setNewDoctor({ name: '', specialty: '' });
    } catch (error) {
      console.error('Failed to add doctor:', error);
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleRemoveDoctor = async (doctorId: string) => {
    if (!confirm('Are you sure? This will also delete all their slots.')) return;
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      if (selectedDoctor === doctorId) {
        setSelectedDoctor('');
      }
      await fetchDoctors();
      await fetchSlots();
    } catch (error) {
      console.error('Failed to remove doctor:', error);
    }
  };


  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Availability</h2>
        <p className="text-gray-500">Manage doctors, schedules, and appointment slots.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Select Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Doctor</label>
                <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setIsAddDoctorOpen(true)}>
                  <UserPlus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              {clinicDoctors.length > 0 ? (
                <div className="space-y-2">
                  {clinicDoctors.map(doc => (
                    <div 
                      key={doc.id} 
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${selectedDoctor === doc.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setSelectedDoctor(doc.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.specialty || 'General'}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveDoctor(doc.id); }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Remove doctor"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed rounded-lg text-sm text-gray-500">
                  No doctors yet. Add one to get started.
                </div>
              )}
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
                disabled={!selectedDoctor}
              />
              <Button onClick={handleAddSlot} variant="secondary" className="w-full sm:w-auto" disabled={!selectedDoctor || !newTime}>
                <Plus className="w-4 h-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {!selectedDoctor ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl border-gray-200 bg-gray-50">
                <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900">Select a doctor</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a doctor from the left panel to manage their slots.</p>
              </div>
            ) : currentSlots.length > 0 ? (
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

      {/* Add Doctor Modal */}
      <Modal isOpen={isAddDoctorOpen} onClose={() => setIsAddDoctorOpen(false)} title="Add Doctor">
        <div className="space-y-4 max-w-md w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
            <Input 
              placeholder="e.g. Dr. Sarah Wilson"
              value={newDoctor.name}
              onChange={e => setNewDoctor({...newDoctor, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <select
              className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              value={newDoctor.specialty}
              onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})}
            >
              <option value="">Select specialty...</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Neurologist">Neurologist</option>
              <option value="ENT Specialist">ENT Specialist</option>
              <option value="Ophthalmologist">Ophthalmologist</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Dentist">Dentist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsAddDoctorOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDoctor} disabled={!newDoctor.name || addingDoctor}>
              {addingDoctor ? 'Adding...' : 'Add Doctor'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
