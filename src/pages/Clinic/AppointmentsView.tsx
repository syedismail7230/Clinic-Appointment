import { useState } from "react";
import { Search, Filter, FileText, Clock, User, Tag, History, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Calendar } from "@/components/ui/calendar";
import { MOCK_APPOINTMENTS } from "@/lib/mockData";

export default function AppointmentsView() {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const doctors = ["All", ...Array.from(new Set(appointments.map(a => a.doctor)))];
  
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';

  const filteredAppointments = appointments.filter(a => {
    const matchDate = a.date === selectedDateStr;
    const matchDoctor = selectedDoctor === "All" || a.doctor === selectedDoctor;
    const matchSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.phone.includes(searchTerm);
    return matchDate && matchDoctor && matchSearch;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const updateStatus = (id: string, newStatus: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'waiting': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
      case 'in-consultation': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Consult</Badge>;
      case 'booked': return <Badge variant="outline" className="text-gray-600">Booked</Badge>;
      case 'arrived': return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">Arrived</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'no-show': return <Badge variant="destructive">No-Show</Badge>;
      case 'cancelled': return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-500">Manage bookings, patient records, and schedules.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              className="pl-9 bg-white h-10 rounded-lg" 
              placeholder="Search patient or phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-white border rounded-lg px-3 h-10 shadow-sm">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <select 
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-32"
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
            >
              {doctors.map(doc => <option key={doc} value={doc}>{doc}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Sidebar: Calendar */}
        <Card className="lg:col-span-4 xl:col-span-3 border-none shadow-sm p-4 h-fit">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Select Date
            </h3>
          </div>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-none"
            />
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Appointments</span>
                <span className="font-semibold">{filteredAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">
                  {filteredAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Waiting</span>
                <span className="font-semibold text-yellow-600">
                  {filteredAppointments.filter(a => a.status === 'waiting').length}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Content: Appointments List */}
        <Card className="lg:col-span-8 xl:col-span-9 border-none shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">
              {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select a date'}
            </h3>
            <Badge variant="secondary" className="bg-white">
              {filteredAppointments.length} Bookings
            </Badge>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Patient</th>
                  <th className="px-6 py-4 font-medium">Doctor</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <CalendarDays className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-base font-medium text-gray-900">No appointments</p>
                        <p className="text-sm">There are no bookings for this date.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {apt.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apt.patientName}</div>
                      <div className="text-gray-500 text-xs">{apt.phone}</div>
                      {apt.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {apt.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{apt.doctor}</td>
                    <td className="px-6 py-4">
                      <select 
                        className="text-sm border-gray-200 rounded-md shadow-sm focus:ring-primary focus:border-primary px-2 py-1.5 bg-white"
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                      >
                        <option value="booked">Booked</option>
                        <option value="arrived">Arrived</option>
                        <option value="waiting">Waiting</option>
                        <option value="in-consultation">In Consultation</option>
                        <option value="completed">Completed</option>
                        <option value="no-show">No-Show</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="mt-1.5">{getStatusBadge(apt.status)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setSelectedPatient(apt)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Patient Record">
        {selectedPatient && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedPatient.patientName}</h3>
                <p className="text-gray-500">{selectedPatient.phone}</p>
              </div>
              {getStatusBadge(selectedPatient.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Clock className="w-4 h-4 mr-1" /> Appointment
                </div>
                <p className="font-medium">{selectedPatient.date} at {selectedPatient.time}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <User className="w-4 h-4 mr-1" /> Doctor
                </div>
                <p className="font-medium">{selectedPatient.doctor}</p>
              </div>
            </div>

            <div>
              <h4 className="flex items-center font-semibold text-gray-900 mb-2">
                <Tag className="w-4 h-4 mr-2 text-black" /> Tags
              </h4>
              <div className="flex gap-2 flex-wrap">
                {selectedPatient.tags.length > 0 ? selectedPatient.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="rounded-md">{tag}</Badge>
                )) : <span className="text-sm text-gray-500">No tags added.</span>}
                <Button variant="outline" size="sm" className="h-6 text-xs border-dashed rounded-md">
                  + Add Tag
                </Button>
              </div>
            </div>

            <div>
              <h4 className="flex items-center font-semibold text-gray-900 mb-2">
                <FileText className="w-4 h-4 mr-2 text-black" /> Current Notes
              </h4>
              <textarea 
                className="w-full min-h-[100px] p-3 text-sm border rounded-xl focus:ring-2 focus:ring-black outline-none bg-gray-50"
                defaultValue={selectedPatient.notes}
                placeholder="Add consultation notes here..."
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" className="rounded-lg">Save Notes</Button>
              </div>
            </div>

            <div>
              <h4 className="flex items-center font-semibold text-gray-900 mb-3">
                <History className="w-4 h-4 mr-2 text-black" /> Patient History
              </h4>
              <div className="space-y-3">
                {selectedPatient.history.length > 0 ? selectedPatient.history.map((record: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-black pl-4 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{record.date}</span>
                      <span className="text-xs text-gray-500">{record.doctor}</span>
                    </div>
                    <p className="text-sm text-gray-600">{record.notes || record.diagnosis}</p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 italic">No previous visit history found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
