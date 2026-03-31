import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, FileText, Calendar, Clock, Pill, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useQueue } from "@/lib/store";

export default function PatientRecords() {
  const navigate = useNavigate();
  const queue = useQueue();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "records">("phone");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter queue items that are completed and match the phone number
  const records = queue.filter(q => q.status === 'completed' && q.phone === phone);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 10) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep("otp");
      }, 800);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setStep("records");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => step === 'otp' ? setStep('phone') : navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-xl font-bold">My Medical Records</h1>
      </div>

      <div className="p-4 flex-1 max-w-md w-full mx-auto flex flex-col">
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="mt-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Find Records</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter your registered phone number</label>
            <div className="flex flex-col gap-4">
              <Input 
                type="tel" 
                placeholder="e.g. 555-0123" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-14 text-lg rounded-xl bg-white"
                required
                pattern="[0-9]{10,}"
              />
              <Button type="submit" className="h-14 text-lg rounded-xl font-bold" disabled={isSubmitting || phone.length < 10}>
                {isSubmitting ? "Sending Code..." : "Get OTP"}
              </Button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-8 flex-1 flex flex-col items-center animate-in fade-in slide-in-from-right-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-10 h-10 text-black" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Code</h2>
            <p className="text-gray-500 text-center mb-8 text-lg">
              Sent to +1 {phone}
            </p>
            
            <Input 
              autoFocus
              type="number"
              placeholder="0000" 
              value={otp} 
              onChange={e => setOtp(e.target.value.slice(0, 4))}
              className="h-16 w-48 text-center text-3xl tracking-[0.5em] rounded-xl font-mono bg-white border-gray-200 focus:border-black transition-colors"
              required
            />
            
            <button type="button" className="mt-6 text-black font-bold hover:underline">
              Resend Code
            </button>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg rounded-xl font-bold mt-8"
              disabled={otp.length !== 4 || isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify & View Records"}
            </Button>
          </form>
        )}

        {step === "records" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="font-semibold text-gray-900 mb-2">Past Consultations</h2>
            
            {records.length > 0 ? (
              records.map(record => (
                <Card key={record.id} className="overflow-hidden border-none shadow-sm">
                  <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString()}</span> {/* Using current date as mock */}
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{record.time}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Doctor</p>
                      <p className="font-medium">{record.doctor}</p>
                    </div>
                    
                    {record.prescription && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Doctor's Notes</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-lg border">{record.prescription}</p>
                      </div>
                    )}

                    {record.medicines && record.medicines.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          <Pill className="w-4 h-4" /> Prescribed Medicines
                        </p>
                        <div className="space-y-2">
                          {record.medicines.map((med, idx) => (
                            <div key={idx} className="bg-white border rounded-lg p-3 text-sm">
                              <div className="font-semibold text-gray-900 mb-1">{med.medicineName} <span className="text-gray-500 font-normal">({med.dosage})</span></div>
                              <div className="grid grid-cols-2 gap-2 text-gray-600 mt-2">
                                <div><span className="text-gray-400 text-xs block">Time</span>{med.time}</div>
                                <div><span className="text-gray-400 text-xs block">Frequency</span>{med.frequency}</div>
                                <div className="col-span-2"><span className="text-gray-400 text-xs block">Duration</span>{med.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!record.prescription && (!record.medicines || record.medicines.length === 0)) && (
                      <p className="text-sm text-gray-500 italic">No prescription details recorded for this visit.</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No records found for this number.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
