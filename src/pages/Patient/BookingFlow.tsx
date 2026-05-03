import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, User, Phone, ShieldCheck, CalendarDays } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addQueueItem, getQueue } from "@/lib/store";
import { api } from "@/lib/api";

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { doctorId: string, slot: string, date?: string } | null;
  
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await api.get(`/clinics/${id}`);
        setClinic(data);
      } catch (error) {
        console.error('Failed to fetch clinic:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!clinic || !state) {
    return <div className="p-6 text-center">Invalid booking session</div>;
  }

  const doctor = clinic.doctors?.find((d: any) => d.id === state.doctorId);
  if (!doctor) return <div className="p-6 text-center">Doctor not found</div>;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone.length >= 10) {
      setIsSubmitting(true);
      setError("");
      try {
        await api.post("/auth/otp/send", { phone });
        setStep("otp");
      } catch (err: any) {
        setError("Failed to send OTP. Please try again.");
        console.error("OTP send failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVerifyAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) {
      setIsSubmitting(true);
      setError("");
      
      try {
        // Verify OTP with real API
        const authRes = await api.post("/auth/otp/verify", { phone, code: otp });
        
        // Store the patient token temporarily for this session
        const patientToken = authRes.token;
        
        // Add to queue
        const queueId = `q${Date.now()}`;
        
        await addQueueItem({
          id: queueId,
          patientName: name,
          phone: phone,
          status: "waiting",
          doctor: doctor.name,
          time: state.slot,
          waitTime: "15 mins",
          prescription: "",
          tenantId: clinic.tenant_id
        });

        // Persist booking info to localStorage so confirmation page survives refresh
        const bookingData = {
          ...state,
          name,
          phone,
          queueId,
          clinicId: id,
          tenantId: clinic.tenant_id,
          bookedAt: new Date().toISOString()
        };
        localStorage.setItem(`booking_${id}`, JSON.stringify(bookingData));

        navigate(`/clinic/${id}/confirmation`, { 
          state: { ...state, name, phone, queueId },
          replace: true
        });
      } catch (err: any) {
        setError("Invalid OTP. Please check the code and try again.");
        console.error('Booking failed:', err);
        setIsSubmitting(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setError("");
    try {
      await api.post("/auth/otp/send", { phone });
    } catch (err) {
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <button onClick={() => step === 'otp' ? setStep('details') : navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors mr-3">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold truncate">Confirm Booking</h1>
      </div>

      <div className="flex-1 px-6 py-4 flex flex-col">
        {/* Booking Summary Card */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{doctor.name}</h3>
              <p className="text-gray-500">{clinic.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium bg-white p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              {state.date ? format(parseISO(state.date), 'MMM d, yyyy') : 'Today'}
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="text-black font-bold">
              {state.slot}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        {step === "details" ? (
          <form onSubmit={handleSendOtp} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Patient Details</h2>
            
            <div className="space-y-5 flex-1">
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input 
                    autoFocus
                    placeholder="Full Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="pl-12 h-14 text-lg rounded-xl bg-gray-50 border-transparent focus:border-black focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="relative flex">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 font-medium border-r border-gray-300 pr-2">+91</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="Mobile Number" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="pl-[5.5rem] h-14 text-lg rounded-xl bg-gray-50 border-transparent focus:border-black focus:bg-white transition-colors"
                    required
                    pattern="[0-9]{10,}"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 ml-1">We'll send a code to verify your number.</p>
              </div>
            </div>

            <div className="mt-8 pb-6">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg rounded-xl font-bold"
                disabled={!name || phone.length < 10 || isSubmitting}
              >
                {isSubmitting ? "Sending Code..." : "Continue"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndBook} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4">
            <div className="flex-1 flex flex-col items-center justify-center -mt-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-black" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter Code</h2>
              <p className="text-gray-500 text-center mb-2 text-lg">
                Sent to +91 {phone}
              </p>
              <p className="text-gray-400 text-center mb-8 text-sm">
                Check server console for the OTP code
              </p>
              
              <Input 
                autoFocus
                type="number"
                placeholder="0000" 
                value={otp} 
                onChange={e => setOtp(e.target.value.slice(0, 4))}
                className="h-16 w-48 text-center text-3xl tracking-[0.5em] rounded-xl font-mono bg-gray-50 border-transparent focus:border-black focus:bg-white transition-colors"
                required
              />
              
              <button type="button" className="mt-6 text-black font-bold hover:underline" onClick={handleResendOtp}>
                Resend Code
              </button>
            </div>
            
            <div className="pb-6">
              <Button 
                type="submit" 
                className="w-full h-14 text-lg rounded-xl font-bold"
                disabled={otp.length !== 4 || isSubmitting}
              >
                {isSubmitting ? "Confirming..." : "Verify & Book"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
