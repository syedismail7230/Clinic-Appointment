import { useState, useEffect } from "react";
import {
  Users, Clock, CheckCircle2, Activity, Search, UserPlus,
  MoreVertical, Plus, Trash2, FileText, Pill, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useQueue, updateQueueItem, addQueueItem, PrescriptionItem } from "@/lib/store";
import { api } from "@/lib/api";

type SortField = "time" | "token";
type SortDir   = "asc" | "desc";

/* ── helpers ── */
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarBg(_name: string) {
  // deterministic shade from name — stays B&W
  return "bg-[#1a1a1a]";
}

function getLocalDateStr(d: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

/* ── status pill ── */
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    waiting:        "bg-black text-white",
    "in-consultation": "bg-[#222] text-white",
    booked:         "bg-[#f0f0f0] text-[#555] border border-[#ddd]",
    completed:      "bg-transparent text-[#aaa] border border-[#e0e0e0] line-through",
  };
  const labels: Record<string, string> = {
    waiting:        "Waiting",
    "in-consultation": "In Consult",
    booked:         "Booked",
    completed:      "Completed",
  };
  const cls = map[status] ?? "bg-[#f0f0f0] text-[#555]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

/* ── stat item ── */
function StatItem({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 px-5 first:pl-0 border-l first:border-l-0 border-[#e5e5e5]">
      <span className="text-[11px] font-medium text-[#999] uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-bold tracking-tight ${accent ? "text-black" : "text-[#222]"}`}>{value}</span>
    </div>
  );
}

export default function QueueView() {
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateStr());
  const queue = useQueue(undefined, selectedDate);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewingPatient, setViewingPatient]   = useState<any>(null);
  const [prescription, setPrescription]         = useState("");
  const [medicines, setMedicines]               = useState<PrescriptionItem[]>([]);
  const [searchTerm, setSearchTerm]             = useState("");
  const [statusFilter, setStatusFilter]         = useState("all");
  const [doctorFilter, setDoctorFilter]         = useState("all");
  const [sortField, setSortField]               = useState<SortField>("token");
  const [sortDir, setSortDir]                   = useState<SortDir>("asc");
  const [isWalkInOpen, setIsWalkInOpen]         = useState(false);
  const [walkInForm, setWalkInForm]             = useState({ name: "", phone: "", doctor: "" });
  const [clinicDoctors, setClinicDoctors]       = useState<any[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctors = await api.get("/admin/doctors");
        setClinicDoctors(doctors);
      } catch {
        try {
          const clinics = await api.get("/clinics");
          if (clinics.length > 0) setClinicDoctors(clinics[0].doctors || []);
        } catch (err) { console.error(err); }
      }
    };
    fetchDoctors();
  }, []);

  const queueDoctors = Array.from(new Set(queue.map(q => q.doctor))).filter(Boolean);

  const filteredQueue = queue.filter(item => {
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      if (
        !item.patientName.toLowerCase().includes(t) &&
        !item.phone.includes(t) &&
        !item.doctor.toLowerCase().includes(t) &&
        !(item.token ?? "").toLowerCase().includes(t)
      ) return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (doctorFilter !== "all" && item.doctor !== doctorFilter) return false;
    return true;
  });

  const sortedQueue = [...filteredQueue].sort((a, b) => {
    const va = (sortField === "token" ? a.token : a.time) ?? "";
    const vb = (sortField === "token" ? b.token : b.time) ?? "";
    return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const [isAddingWalkIn, setIsAddingWalkIn] = useState(false);
  const [isSavingComplete, setIsSavingComplete] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "completed") {
      setSelectedPatientId(id);
      setPrescription("");
      setMedicines([]);
    } else {
      if (updatingIds.includes(id)) return;
      setUpdatingIds(prev => [...prev, id]);
      try {
        await updateQueueItem(id, { status: newStatus });
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingIds(prev => prev.filter(x => x !== id));
      }
    }
  };

  const handleCompleteConsultation = async () => {
    if (selectedPatientId && !isSavingComplete) {
      setIsSavingComplete(true);
      try {
        await updateQueueItem(selectedPatientId, { status: "completed", prescription, medicines });
        setSelectedPatientId(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSavingComplete(false);
      }
    }
  };

  const addMedicine    = () => setMedicines([...medicines, { id: Date.now().toString(), medicineName: "", dosage: "", time: "", frequency: "", duration: "" }]);
  const updateMedicine = (id: string, field: keyof PrescriptionItem, value: string) => setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: value } : m));
  const removeMedicine = (id: string) => setMedicines(medicines.filter(m => m.id !== id));

  const handleWalkInSubmit = async () => {
    if (!walkInForm.name || !walkInForm.phone || !walkInForm.doctor || isAddingWalkIn) return;
    setIsAddingWalkIn(true);
    try {
      await addQueueItem({
        id: `q${Date.now()}`,
        patientName: walkInForm.name,
        phone: walkInForm.phone,
        status: "waiting",
        doctor: walkInForm.doctor,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        waitTime: "10 mins",
        prescription: "",
        medicines: [],
        date: getLocalDateStr(),
      });
      setIsWalkInOpen(false);
      setWalkInForm({ name: "", phone: "", doctor: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingWalkIn(false);
    }
  };

  const avgWait = () => {
    const active = queue.filter(q => q.status === "waiting" || q.status === "in-consultation");
    return active.length === 0 ? "0m" : `${Math.round(active.length * 8)}m`;
  };

  const selectCls = "h-9 rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black appearance-none pr-8 cursor-pointer";

  return (
    <div className="animate-in fade-in duration-300 space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#0a0a0a]">
            {selectedDate === getLocalDateStr() ? "Today's Queue" : `Queue — ${selectedDate}`}
          </h2>
          <p className="text-[13px] text-[#999] mt-0.5">Real-time patient flow</p>
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
          <button
            onClick={() => setIsWalkInOpen(true)}
            className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium flex items-center gap-2 hover:bg-[#222] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Walk-in
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex items-center bg-white rounded-xl border border-[#e5e5e5] px-5 py-4">
        <StatItem label="Total"       value={queue.length} accent />
        <StatItem label="Waiting"     value={queue.filter(q => q.status === "waiting").length} />
        <StatItem label="In Consult"  value={queue.filter(q => q.status === "in-consultation").length} />
        <StatItem label="Completed"   value={queue.filter(q => q.status === "completed").length} />
        <StatItem label="Avg Wait"    value={avgWait()} />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* date */}
        <div className="relative">
          <input
            type="date"
            className={selectCls}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>

        {/* status */}
        <div className="relative">
          <select className={selectCls} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="booked">Booked</option>
            <option value="waiting">Waiting</option>
            <option value="in-consultation">In Consult</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#aaa] pointer-events-none" />
        </div>

        {/* doctor */}
        <div className="relative">
          <select className={selectCls} value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
            <option value="all">All Doctors</option>
            {queueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#aaa] pointer-events-none" />
        </div>

        {/* sort */}
        <div className="ml-auto flex gap-1.5">
          {(["token", "time"] as SortField[]).map(f => (
            <button
              key={f}
              onClick={() => toggleSort(f)}
              className={`h-9 px-3 rounded-lg border text-[12px] font-semibold uppercase tracking-wide transition-colors ${
                sortField === f
                  ? "bg-black text-white border-black"
                  : "bg-white text-[#999] border-[#e5e5e5] hover:border-[#bbb]"
              }`}
            >
              {f} {sortField === f && (sortDir === "asc" ? "↑" : "↓")}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Token", "Patient", "Time", "Doctor", "Status", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#aaa] ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f5f5]">
              {sortedQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Users className="w-8 h-8 text-[#ddd] mx-auto mb-3" />
                    <p className="text-[13px] text-[#bbb]">
                      {searchTerm || statusFilter !== "all" || doctorFilter !== "all"
                        ? "No patients match the current filters."
                        : selectedDate === getLocalDateStr()
                          ? "Queue is empty for today."
                          : "No patients in queue for this date."}
                    </p>
                  </td>
                </tr>
              ) : sortedQueue.map(item => (
                <tr key={item.id} className="hover:bg-[#fafafa] transition-colors group">
                  {/* token */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-[12px] font-semibold text-[#333] bg-[#f5f5f5] border border-[#e8e8e8] px-2 py-0.5 rounded">
                      {item.token}
                    </span>
                  </td>
                  {/* patient */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarBg(item.patientName)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                        {initials(item.patientName)}
                      </div>
                      <div>
                        <div className="font-medium text-[#0a0a0a]">{item.patientName}</div>
                        <div className="text-[12px] text-[#aaa]">{item.phone}</div>
                      </div>
                    </div>
                  </td>
                  {/* time */}
                  <td className="px-5 py-4">
                    <div className="text-[#333] font-medium">{item.time}</div>
                    <div className="text-[12px] text-[#aaa]">{item.waitTime} est.</div>
                  </td>
                  {/* doctor */}
                  <td className="px-5 py-4 text-[#555] text-[13px]">{item.doctor}</td>
                  {/* status */}
                  <td className="px-5 py-4"><StatusPill status={item.status} /></td>
                  {/* actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {item.status === "booked" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "waiting")}
                          disabled={updatingIds.includes(item.id)}
                          className="text-[12px] font-medium text-[#555] hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {updatingIds.includes(item.id) ? "Marking..." : "Mark Arrived"}
                        </button>
                      )}
                      {item.status === "waiting" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "in-consultation")}
                          disabled={updatingIds.includes(item.id)}
                          className="text-[12px] font-medium text-black hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {updatingIds.includes(item.id) ? "Starting..." : "Start Consult"}
                        </button>
                      )}
                      {item.status === "in-consultation" && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, "completed")}
                          disabled={updatingIds.includes(item.id)}
                          className="text-[12px] font-medium text-black hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {updatingIds.includes(item.id) ? "Completing..." : "Complete"}
                        </button>
                      )}
                      <button
                        onClick={() => setViewingPatient(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ccc] hover:text-[#555] hover:bg-[#f5f5f5] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Patient detail modal ── */}
      <Modal isOpen={!!viewingPatient} onClose={() => setViewingPatient(null)} title="Patient Details">
        {viewingPatient && (
          <div className="space-y-5 max-w-md w-full">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${avatarBg(viewingPatient.patientName)} flex items-center justify-center text-white text-sm font-bold`}>
                {initials(viewingPatient.patientName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">{viewingPatient.patientName}</h3>
                <p className="text-[13px] text-[#aaa]">{viewingPatient.phone}</p>
              </div>
              <div className="ml-auto"><StatusPill status={viewingPatient.status} /></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Token", value: viewingPatient.token },
                { label: "Time",  value: viewingPatient.time },
                { label: "Doctor",value: viewingPatient.doctor },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] mb-1">{label}</p>
                  <p className="font-semibold text-[#222] text-sm break-words">{value}</p>
                </div>
              ))}
            </div>

            {viewingPatient.prescription && (
              <div className="bg-[#f8f8f8] rounded-xl border border-[#ececec] p-4">
                <h4 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </h4>
                <p className="text-[13px] text-[#333] whitespace-pre-wrap">{viewingPatient.prescription}</p>
              </div>
            )}

            {viewingPatient.medicines?.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-3">
                  <Pill className="w-3.5 h-3.5" /> Medicines
                </h4>
                <div className="divide-y divide-[#f0f0f0] border border-[#f0f0f0] rounded-xl overflow-hidden">
                  {viewingPatient.medicines.map((med: any, i: number) => (
                    <div key={med.id || i} className="flex items-center px-4 py-2.5 text-[13px]">
                      <span className="text-[#ccc] w-5 mr-3">{i + 1}.</span>
                      <span className="font-medium text-[#222] flex-1">{med.medicineName}</span>
                      <span className="text-[#999] mr-3">{med.dosage}</span>
                      <span className="text-[#bbb]">{med.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Prescription modal ── */}
      <Modal isOpen={!!selectedPatientId} onClose={() => setSelectedPatientId(null)} title="Complete Consultation">
        <div className="space-y-5 max-w-4xl w-full">
          <div className="flex items-center justify-between">
            <h4 className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Medicines</h4>
            <button
              onClick={addMedicine}
              className="flex items-center gap-1.5 text-[12px] font-medium text-black border border-[#e5e5e5] rounded-lg px-3 py-1.5 hover:bg-[#f5f5f5] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {medicines.length > 0 ? (
            <div className="border border-[#e5e5e5] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-[#f8f8f8] border-b border-[#ececec]">
                    <tr>
                      {["#", "Medicine", "Dosage", "When", "Frequency", "Duration", ""].map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f5]">
                    {medicines.map((med, idx) => (
                      <tr key={med.id} className="bg-white">
                        <td className="px-3 py-2 text-[#ccc] text-center">{idx + 1}</td>
                        <td className="px-3 py-2"><Input className="h-8 text-sm" placeholder="Paracetamol" value={med.medicineName} onChange={e => updateMedicine(med.id, "medicineName", e.target.value)} /></td>
                        <td className="px-3 py-2"><Input className="h-8 text-sm" placeholder="500mg" value={med.dosage} onChange={e => updateMedicine(med.id, "dosage", e.target.value)} /></td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-[#e5e5e5] bg-white px-2 focus:outline-none focus:ring-1 focus:ring-black" value={med.time} onChange={e => updateMedicine(med.id, "time", e.target.value)}>
                            <option value="">Select…</option>
                            <option>Before Food</option><option>After Food</option>
                            <option>Empty Stomach</option><option>With Food</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-[#e5e5e5] bg-white px-2 focus:outline-none focus:ring-1 focus:ring-black" value={med.frequency} onChange={e => updateMedicine(med.id, "frequency", e.target.value)}>
                            <option value="">Select…</option>
                            <option>1-0-0 (Morning)</option><option>0-1-0 (Afternoon)</option>
                            <option>0-0-1 (Night)</option><option>1-0-1 (Morning & Night)</option>
                            <option>1-1-1 (3×/day)</option><option>SOS (As needed)</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select className="h-8 text-sm w-full rounded-md border border-[#e5e5e5] bg-white px-2 focus:outline-none focus:ring-1 focus:ring-black" value={med.duration} onChange={e => updateMedicine(med.id, "duration", e.target.value)}>
                            <option value="">Select…</option>
                            <option>1 Day</option><option>3 Days</option><option>5 Days</option>
                            <option>1 Week</option><option>2 Weeks</option><option>1 Month</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button onClick={() => removeMedicine(med.id)} className="text-[#ccc] hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-[#e5e5e5] rounded-xl text-[#ccc] text-[13px]">
              No medicines added. Click "Add" to prescribe.
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-2">Additional Notes</label>
            <textarea
              className="w-full h-24 p-3 text-sm border border-[#e5e5e5] rounded-xl focus:ring-1 focus:ring-black focus:outline-none resize-none bg-[#fafafa] placeholder:text-[#ccc]"
              placeholder="Additional advice or notes…"
              value={prescription}
              onChange={e => setPrescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setSelectedPatientId(null)} disabled={isSavingComplete} className="h-9 px-4 rounded-lg border border-[#e5e5e5] text-sm text-[#555] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
            <button onClick={handleCompleteConsultation} disabled={isSavingComplete} className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {isSavingComplete ? "Saving..." : "Save & Complete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Walk-in modal ── */}
      <Modal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} title="Add Walk-in Patient">
        <div className="space-y-4 max-w-sm w-full">
          {[
            { label: "Patient Name", field: "name", placeholder: "e.g. John Doe" },
            { label: "Phone Number", field: "phone", placeholder: "e.g. 9876543210" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-1.5">{label}</label>
              <Input
                placeholder={placeholder}
                value={(walkInForm as any)[field]}
                onChange={e => setWalkInForm({ ...walkInForm, [field]: e.target.value })}
              />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-1.5">Doctor</label>
            <select
              className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-3 text-sm text-[#333] focus:outline-none focus:ring-1 focus:ring-black"
              value={walkInForm.doctor}
              onChange={e => setWalkInForm({ ...walkInForm, doctor: e.target.value })}
            >
              <option value="">Select a doctor…</option>
              {clinicDoctors.map(d => <option key={d.id} value={d.name}>{d.name} — {d.specialty}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-[#f0f0f0]">
            <button onClick={() => setIsWalkInOpen(false)} disabled={isAddingWalkIn} className="h-9 px-4 rounded-lg border border-[#e5e5e5] text-sm text-[#555] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Cancel</button>
            <button
              onClick={handleWalkInSubmit}
              disabled={!walkInForm.name || !walkInForm.phone || !walkInForm.doctor || isAddingWalkIn}
              className="h-9 px-4 rounded-lg bg-black text-white text-sm font-medium hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAddingWalkIn ? "Adding..." : "Add to Queue"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
