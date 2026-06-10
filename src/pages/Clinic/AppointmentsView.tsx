import { useState, useEffect } from "react";
import { Search, FileText, Clock, User, Tag, History, CalendarDays, Plus, X, ChevronDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/lib/api";

/* ── helpers ── */
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function fmtDate(str: string) {
  try { return format(parseISO(str), "MMM d, yyyy"); } catch { return str; }
}

/* ── status badge (clickable to cycle) ── */
const STATUS_CYCLE: Record<string, string> = {
  booked: "arrived", arrived: "waiting", waiting: "in-consultation",
  "in-consultation": "completed", completed: "booked", "no-show": "booked", cancelled: "booked",
};
const STATUS_LABEL: Record<string, string> = {
  booked: "Booked", arrived: "Arrived", waiting: "Waiting",
  "in-consultation": "In Consult", completed: "Completed",
  "no-show": "No-Show", cancelled: "Cancelled",
};
const STATUS_CLS: Record<string, string> = {
  booked:          "bg-[#f0f0f0] text-[#666] border border-[#ddd]",
  arrived:         "bg-[#e8e8e8] text-[#444] border border-[#d0d0d0]",
  waiting:         "bg-black text-white",
  "in-consultation": "bg-[#222] text-white",
  completed:       "bg-transparent text-[#aaa] border border-[#e0e0e0] line-through",
  "no-show":       "bg-transparent text-red-400 border border-red-200",
  cancelled:       "bg-transparent text-[#aaa] border border-[#ebebeb]",
};

function StatusBadge({ status, onClick, disabled }: { status: string; onClick?: () => void; disabled?: boolean }) {
  const cls = STATUS_CLS[status] ?? "bg-[#f0f0f0] text-[#666]";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={onClick && !disabled ? "Click to advance status" : undefined}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide transition-opacity ${cls} ${onClick ? "hover:opacity-70 cursor-pointer" : "cursor-default"} ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
    >
      {STATUS_LABEL[status] ?? status}
    </button>
  );
}

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [date, setDate]                 = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editNotes, setEditNotes]       = useState("");
  const [editTags, setEditTags]         = useState<string[]>([]);
  const [newTag, setNewTag]             = useState("");
  const [savingNotes, setSavingNotes]   = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await api.get("/appointments");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const doctors = ["All", ...Array.from(new Set(appointments.map(a => a.doctor)))];
  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";

  const filteredAppointments = appointments
    .filter(a => {
      const matchDate   = a.date === selectedDateStr;
      const matchDoctor = selectedDoctor === "All" || a.doctor === selectedDoctor;
      const matchSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm);
      return matchDate && matchDoctor && matchSearch;
    })
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (updatingIds.includes(id)) return;
    setUpdatingIds(prev => [...prev, id]);
    try {
      await api.patch(`/appointments/${id}`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingIds(prev => prev.filter(x => x !== id));
    }
  };

  const cycleStatus = (apt: any) => updateStatus(apt.id, STATUS_CYCLE[apt.status] ?? "booked");

  const handleSaveNotes = async () => {
    if (!selectedPatient) return;
    setSavingNotes(true);
    try {
      await api.patch(`/appointments/${selectedPatient.id}`, { notes: editNotes, tags: editTags });
      fetchAppointments();
      setSelectedPatient({ ...selectedPatient, notes: editNotes, tags: editTags });
    } catch (err) { console.error(err); } finally { setSavingNotes(false); }
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (t && !editTags.includes(t)) setEditTags([...editTags, t]);
    setNewTag("");
  };

  const openPatientDetail = (apt: any) => {
    setSelectedPatient(apt);
    setEditNotes(apt.notes || "");
    setEditTags(apt.tags || []);
  };

  const selectCls = "h-9 rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black appearance-none pr-8";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#0a0a0a]">Appointments</h2>
          <p className="text-[13px] text-[#999] mt-0.5">Manage bookings and patient records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#aaa]" />
            <input
              className="h-9 pl-9 pr-3 w-52 rounded-lg border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[#bbb]"
              placeholder="Search patient…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select className={selectCls} value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)}>
              {doctors.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#aaa] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: calendar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-3">Select Date</p>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none mx-auto"
            />
          </div>
          <div className="bg-white rounded-xl border border-[#e5e5e5] px-4 py-3 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa]">Quick Stats</p>
            {[
              { label: "Total",     value: filteredAppointments.length },
              { label: "Completed", value: filteredAppointments.filter(a => a.status === "completed").length },
              { label: "Waiting",   value: filteredAppointments.filter(a => a.status === "waiting").length },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-[#888]">{label}</span>
                <span className="font-semibold text-[#222]">{value}</span>
              </div>
            ))}
          </div>
          {filteredAppointments.length === 0 && appointments.length > 0 && (
            <div className="text-[12px] text-[#aaa] text-center border border-dashed border-[#e5e5e5] rounded-xl p-3">
              No appointments on this date.
            </div>
          )}
        </div>

        {/* Right: list */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-xl border border-[#e5e5e5] overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-[#f0f0f0] flex items-center justify-between">
            <span className="font-semibold text-[#222] text-[14px]">
              {date ? format(date, "EEEE, MMMM d, yyyy") : "Select a date"}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa] bg-[#f5f5f5] px-2 py-0.5 rounded">
              {filteredAppointments.length} bookings
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left min-w-[640px]">
              <thead>
                <tr className="border-b border-[#f5f5f5]">
                  {["Time", "Patient", "Doctor", "Status", ""].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#bbb] ${i === 4 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f8f8f8]">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <CalendarDays className="w-8 h-8 text-[#ddd] mx-auto mb-3" />
                      <p className="text-[13px] text-[#bbb]">No appointments for this date.</p>
                    </td>
                  </tr>
                ) : filteredAppointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-4 font-medium text-[#333] whitespace-nowrap">{apt.time}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                          {initials(apt.patientName)}
                        </div>
                        <div>
                          <div className="font-medium text-[#0a0a0a]">{apt.patientName}</div>
                          <div className="text-[12px] text-[#aaa]">{apt.phone}</div>
                          {apt.tags?.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {apt.tags.map((tag: string) => (
                                <span key={tag} className="text-[10px] bg-[#f0f0f0] text-[#777] px-1.5 py-0.5 rounded font-medium">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#666] text-[13px]">{apt.doctor}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={apt.status} onClick={() => cycleStatus(apt)} disabled={updatingIds.includes(apt.id)} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openPatientDetail(apt)}
                        className="text-[12px] font-medium text-[#888] hover:text-black transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Patient record modal ── */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Record">
        {selectedPatient && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-sm">
                {initials(selectedPatient.patientName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">{selectedPatient.patientName}</h3>
                <p className="text-[13px] text-[#aaa]">{selectedPatient.phone}</p>
              </div>
              <div className="ml-auto"><StatusBadge status={selectedPatient.status} /></div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-1">
                  <Clock className="w-3 h-3" /> Appointment
                </div>
                <p className="text-sm font-medium text-[#333]">{fmtDate(selectedPatient.date)} at {selectedPatient.time}</p>
              </div>
              <div className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-1">
                  <User className="w-3 h-3" /> Doctor
                </div>
                <p className="text-sm font-medium text-[#333]">{selectedPatient.doctor}</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">
                <Tag className="w-3 h-3" /> Tags
              </div>
              <div className="flex gap-2 flex-wrap">
                {editTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] bg-[#f0f0f0] text-[#555] px-2 py-1 rounded font-medium">
                    {tag}
                    <button onClick={() => setEditTags(editTags.filter(t => t !== tag))} className="hover:text-red-500 ml-0.5 transition-colors">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    className="h-6 w-24 text-xs px-2 border border-[#e5e5e5] rounded focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Add tag…"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddTag()}
                  />
                  <button onClick={handleAddTag} className="w-6 h-6 flex items-center justify-center border border-dashed border-[#d0d0d0] rounded text-[#aaa] hover:text-black hover:border-black transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">
                <FileText className="w-3 h-3" /> Consultation Notes
              </div>
              <textarea
                className="w-full min-h-[90px] p-3 text-sm border border-[#e5e5e5] rounded-xl focus:ring-1 focus:ring-black outline-none bg-[#fafafa] resize-none placeholder:text-[#ccc]"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add consultation notes…"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="h-8 px-4 rounded-lg bg-black text-white text-[12px] font-medium hover:bg-[#222] transition-colors disabled:opacity-40"
                >
                  {savingNotes ? "Saving…" : "Save Notes & Tags"}
                </button>
              </div>
            </div>

            {/* History */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-3">
                <History className="w-3 h-3" /> Previous Visits
              </div>
              {appointments.filter(a => a.phone === selectedPatient.phone && a.id !== selectedPatient.id).length > 0 ? (
                <div className="space-y-2">
                  {appointments.filter(a => a.phone === selectedPatient.phone && a.id !== selectedPatient.id).map(record => (
                    <div key={record.id} className="flex items-start gap-3 border-l-2 border-[#e5e5e5] pl-4 py-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-[13px] font-semibold text-[#222]">{fmtDate(record.date)}</span>
                          <span className="text-[11px] text-[#aaa]">{record.doctor}</span>
                        </div>
                        <p className="text-[12px] text-[#888]">{record.notes || "No notes recorded"}</p>
                        {record.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {record.tags.map((t: string) => (
                              <span key={t} className="text-[10px] bg-[#f0f0f0] text-[#777] px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#bbb] italic">No previous visit history.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
