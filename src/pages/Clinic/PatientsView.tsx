import { useState, useEffect, useMemo } from "react";
import { Search, Phone, History, Pill, User, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { format, parseISO } from "date-fns";

/* ── helpers ── */
function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function fmtDate(str: string) {
  if (!str) return "—";
  try { return format(parseISO(str), "MMM d, yyyy"); } catch { return str; }
}

export default function PatientsView() {
  const [patients, setPatients]               = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory]   = useState<{ appointments: any[]; queueHistory: any[] }>({ appointments: [], queueHistory: [] });
  const [loadingHistory, setLoadingHistory]   = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.get("/patients");
        setPatients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // ── Deduplicate by phone on the frontend (group, keep max visits + latest date) ──
  const deduped = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of patients) {
      const key = p.phone;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...p });
      } else {
        // keep the higher visit count
        existing.totalVisits = Math.max(existing.totalVisits ?? 1, p.totalVisits ?? 1);
        // keep the most recent last_visit
        if (p.last_visit && (!existing.last_visit || p.last_visit > existing.last_visit)) {
          existing.last_visit = p.last_visit;
          existing.name       = p.name; // prefer latest name as well
        }
      }
    }
    return Array.from(map.values());
  }, [patients]);

  const filtered = deduped.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const handleViewHistory = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const data = await api.get(`/patients/${encodeURIComponent(patient.phone)}/history`);
      setPatientHistory(data);
    } catch {
      setPatientHistory({ appointments: [], queueHistory: [] });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-[#0a0a0a]">Patient Directory</h2>
          <p className="text-[13px] text-[#999] mt-0.5">
            {deduped.length} patient{deduped.length !== 1 ? "s" : ""} on record
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#aaa]" />
          <input
            className="h-9 pl-9 pr-3 w-64 rounded-lg border border-[#e5e5e5] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[#bbb]"
            placeholder="Search by name or phone…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Patient", "Contact", "Last Visit", "Visits", ""].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-[#bbb] ${i === 4 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f8f8f8]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[13px] text-[#bbb]">Loading patients…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <User className="w-8 h-8 text-[#ddd] mx-auto mb-3" />
                    <p className="text-[13px] text-[#bbb]">No patients found.</p>
                  </td>
                </tr>
              ) : filtered.map(patient => (
                <tr key={patient.id} className="hover:bg-[#fafafa] transition-colors">
                  {/* patient */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {initials(patient.name)}
                      </div>
                      <span className="font-medium text-[#0a0a0a]">{patient.name}</span>
                    </div>
                  </td>
                  {/* contact */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-[#888] text-[13px]">
                      <Phone className="w-3 h-3 shrink-0" />
                      {patient.phone}
                    </div>
                  </td>
                  {/* last visit */}
                  <td className="px-5 py-4 text-[13px] text-[#888]">
                    {fmtDate(patient.last_visit)}
                  </td>
                  {/* visits */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-semibold text-[#555] bg-[#f0f0f0] border border-[#e5e5e5] px-2 py-0.5 rounded-full">
                      {patient.totalVisits ?? 1} visit{(patient.totalVisits ?? 1) !== 1 ? "s" : ""}
                    </span>
                  </td>
                  {/* action */}
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleViewHistory(patient)}
                      className="text-[12px] font-medium text-[#888] hover:text-black transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <FileText className="w-3.5 h-3.5" /> History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Patient history modal ── */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient History">
        {selectedPatient && (
          <div className="space-y-5 max-w-2xl w-full">
            {/* Patient header */}
            <div className="flex items-center gap-4 bg-[#f8f8f8] border border-[#f0f0f0] p-4 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white text-sm font-bold">
                {initials(selectedPatient.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#0a0a0a]">{selectedPatient.name}</h3>
                <p className="text-[13px] text-[#aaa] flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {selectedPatient.phone}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#0a0a0a]">{selectedPatient.totalVisits ?? 1}</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">Total Visits</div>
              </div>
            </div>

            {/* History */}
            {loadingHistory ? (
              <div className="text-center py-8 text-[13px] text-[#bbb]">Loading history…</div>
            ) : (patientHistory.appointments.length > 0 || patientHistory.queueHistory.length > 0) ? (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#aaa] flex items-center gap-1.5">
                  <History className="w-3 h-3" /> Visit Timeline
                </p>
                {patientHistory.appointments.map((apt: any) => (
                  <div key={apt.id} className="border border-[#f0f0f0] rounded-xl p-4 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#bbb]" />
                        <span className="text-[13px] font-semibold text-[#222]">{fmtDate(apt.date)}</span>
                        {apt.time && <span className="text-[12px] text-[#aaa]">at {apt.time}</span>}
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${apt.status === "completed" ? "bg-[#f0f0f0] text-[#888]" : "bg-black text-white"}`}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.doctor && (
                      <div className="flex items-center gap-1.5 text-[12px] text-[#888]">
                        <User className="w-3 h-3" /> {apt.doctor}
                      </div>
                    )}
                    {apt.notes && (
                      <div className="bg-[#f8f8f8] rounded-lg p-3 text-[12px] text-[#555]">
                        <span className="font-medium text-[#333]">Notes: </span>{apt.notes}
                      </div>
                    )}
                    {apt.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {apt.tags.map((t: string) => (
                          <span key={t} className="text-[10px] bg-[#f0f0f0] text-[#777] px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    {apt.medicines?.length > 0 && (
                      <div className="border-t border-[#f0f0f0] pt-2 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-2">
                          <Pill className="w-3 h-3" /> Medicines
                        </div>
                        <div className="space-y-1">
                          {apt.medicines.map((med: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-[12px]">
                              <span className="text-[#ccc]">{i + 1}.</span>
                              <span className="font-medium text-[#333]">{med.medicineName}</span>
                              <span className="text-[#aaa]">{med.dosage}</span>
                              <span className="text-[#ccc]">·</span>
                              <span className="text-[#888]">{med.frequency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Queue history not in appointments */}
                {patientHistory.queueHistory
                  .filter(q => !patientHistory.appointments.some(a => a.phone === q.phone && a.date === q.date && a.doctor === q.doctor))
                  .map((q: any) => (
                    <div key={q.id} className="border border-dashed border-[#e5e5e5] rounded-xl p-4 bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#ccc]" />
                          <span className="text-[13px] font-semibold text-[#222]">{fmtDate(q.date)}</span>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded bg-[#f0f0f0] text-[#888]">completed</span>
                      </div>
                      {q.doctor && <div className="text-[12px] text-[#aaa] flex items-center gap-1.5"><User className="w-3 h-3" />{q.doctor}</div>}
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[#e5e5e5] rounded-xl bg-[#fafafa]">
                <History className="w-8 h-8 text-[#e0e0e0] mx-auto mb-2" />
                <p className="text-[13px] text-[#bbb]">No visit history found for this patient.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
