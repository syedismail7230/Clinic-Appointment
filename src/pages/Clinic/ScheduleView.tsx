import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { api } from "@/lib/api";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ScheduleView() {
  const [clinicDoctors, setClinicDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate]   = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading]             = useState(true);
  const [availability, setAvailability]   = useState<Record<string, string[]>>({});
  const [newTime, setNewTime]             = useState("");
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctor, setNewDoctor]         = useState({ name: "", specialty: "" });
  const [addingDoctor, setAddingDoctor]   = useState(false);

  const fetchDoctors = async () => {
    try {
      const doctors = await api.get("/admin/doctors");
      setClinicDoctors(doctors);
      if (doctors.length > 0 && !selectedDoctor) setSelectedDoctor(doctors[0].id);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async () => {
    try {
      const slots = await api.get("/admin/slots");
      const grouped: Record<string, string[]> = {};
      for (const slot of slots) {
        const dateKey = slot.date || "recurring";
        const key = `${slot.doctor_id}_${dateKey}`;
        if (!grouped[key]) grouped[key] = [];
        if (!grouped[key].includes(slot.slot_time)) grouped[key].push(slot.slot_time);
      }
      Object.keys(grouped).forEach(k => { grouped[k].sort(); });
      setAvailability(grouped);
    } catch (err) { console.error(err); }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchDoctors(), fetchSlots()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const dateKey     = `${selectedDoctor}_${selectedDate}`;
  const recurringKey = `${selectedDoctor}_recurring`;
  const currentSlots = availability[dateKey] || availability[recurringKey] || [];

  const handleAddSlot = async () => {
    if (!newTime || !selectedDoctor) return;
    const [h, m] = newTime.split(":");
    const hour   = parseInt(h, 10);
    const ampm   = hour >= 12 ? "PM" : "AM";
    const fmtH   = (hour % 12 || 12).toString().padStart(2, "0");
    const formatted = `${fmtH}:${m} ${ampm}`;
    if (!currentSlots.includes(formatted)) {
      try {
        await api.post("/admin/slots", { doctor_id: selectedDoctor, slot_time: formatted, date: selectedDate });
        setAvailability(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), formatted].sort() }));
      } catch (err) { console.error(err); }
    }
    setNewTime("");
  };

  const handleRemoveSlot = async (t: string) => {
    try {
      await api.delete("/admin/slots", { doctor_id: selectedDoctor, slot_time: t, date: selectedDate });
      setAvailability(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter(s => s !== t) }));
    } catch (err) { console.error(err); }
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name) return;
    setAddingDoctor(true);
    try {
      await api.post("/admin/doctors", newDoctor);
      await fetchDoctors();
      setIsAddDoctorOpen(false);
      setNewDoctor({ name: "", specialty: "" });
    } catch (err) { console.error(err); } finally { setAddingDoctor(false); }
  };

  const handleRemoveDoctor = async (id: string) => {
    if (!confirm("Remove this doctor and all their slots?")) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      if (selectedDoctor === id) setSelectedDoctor("");
      await fetchDoctors();
      await fetchSlots();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-[#0a0a0a]">Schedule</h2>
        <p className="text-[13px] text-[#999] mt-0.5">Manage doctors and available appointment slots</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ── Left: doctors + date ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa]">Doctors</span>
              <button
                onClick={() => setIsAddDoctorOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#555] hover:text-black transition-colors"
              >
                <UserPlus className="w-3 h-3" /> Add
              </button>
            </div>
            {clinicDoctors.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-[#bbb]">No doctors yet. Add one to get started.</div>
            ) : (
              <div className="divide-y divide-[#f8f8f8]">
                {clinicDoctors.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors group ${selectedDoctor === doc.id ? "bg-[#f8f8f8]" : "hover:bg-[#fafafa]"}`}
                  >
                    {/* avatar with active indicator */}
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${selectedDoctor === doc.id ? "bg-black text-white" : "bg-[#f0f0f0] text-[#555]"}`}>
                        {initials(doc.name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-semibold truncate ${selectedDoctor === doc.id ? "text-[#0a0a0a]" : "text-[#444]"}`}>
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-[#aaa]">{doc.specialty || "General"}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemoveDoctor(doc.id); }}
                      className="opacity-0 group-hover:opacity-100 text-[#ccc] hover:text-red-500 p-1 rounded transition-all"
                      title="Remove doctor"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date picker */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">Date</label>
            <input
              type="date"
              className="w-full h-9 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── Right: slots ── */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#f0f0f0] flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa]">Available Slots</span>
            <span className="text-[10px] font-semibold text-[#aaa] bg-[#f5f5f5] border border-[#ebebeb] px-2 py-0.5 rounded">Live Synced</span>
          </div>

          <div className="p-5">
            {/* Add slot row */}
            <div className="flex gap-2 mb-5">
              <input
                type="time"
                className="h-9 flex-1 max-w-[140px] rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-40 disabled:cursor-not-allowed"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                disabled={!selectedDoctor}
              />
              <button
                onClick={handleAddSlot}
                disabled={!selectedDoctor || !newTime}
                className="h-9 px-4 rounded-lg bg-black text-white text-[12px] font-semibold flex items-center gap-1.5 hover:bg-[#222] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" /> Add Slot
              </button>
            </div>

            {/* Slot grid */}
            {!selectedDoctor ? (
              <div className="text-center py-14 border-2 border-dashed border-[#ebebeb] rounded-xl">
                <Clock className="w-7 h-7 text-[#e0e0e0] mx-auto mb-2" />
                <p className="text-[12px] text-[#bbb]">Select a doctor to manage their slots.</p>
              </div>
            ) : currentSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentSlots.map(slot => (
                  <div
                    key={slot}
                    className="flex items-center gap-2 bg-[#f5f5f5] border border-[#ebebeb] rounded-lg px-3 py-2 group hover:border-[#d0d0d0] transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#aaa]" />
                    <span className="text-[13px] font-semibold text-[#333]">{slot}</span>
                    <button
                      onClick={() => handleRemoveSlot(slot)}
                      className="text-[#ccc] hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-14 border-2 border-dashed border-[#ebebeb] rounded-xl">
                <Clock className="w-7 h-7 text-[#e0e0e0] mx-auto mb-2" />
                <p className="text-[13px] font-medium text-[#bbb]">No slots configured</p>
                <p className="text-[12px] text-[#ccc] mt-1">Add a time slot above to allow patient bookings.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Doctor modal ── */}
      <Modal isOpen={isAddDoctorOpen} onClose={() => setIsAddDoctorOpen(false)} title="Add Doctor">
        <div className="space-y-4 max-w-sm w-full">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-1.5">Doctor Name</label>
            <Input
              placeholder="e.g. Dr. Sarah Wilson"
              value={newDoctor.name}
              onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-1.5">Specialty</label>
            <select
              className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black"
              value={newDoctor.specialty}
              onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
            >
              <option value="">Select specialty…</option>
              {["General Physician","Cardiologist","Dermatologist","Pediatrician","Orthopedic","Neurologist","ENT Specialist","Ophthalmologist","Gynecologist","Dentist","Psychiatrist","Other"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setIsAddDoctorOpen(false)} className="h-9 px-4 rounded-lg border border-[#e5e5e5] text-sm text-[#555] hover:bg-[#f5f5f5] transition-colors">Cancel</button>
            <button
              onClick={handleAddDoctor}
              disabled={!newDoctor.name || addingDoctor}
              className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40"
            >
              {addingDoctor ? "Adding…" : "Add Doctor"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
