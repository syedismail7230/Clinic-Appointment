import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShieldCheck, CreditCard, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

type Step = "details" | "otp" | "payment" | "success";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [otp, setOtp] = useState("");

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/otp/send", { phone: formData.phone });
      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/otp/verify", { phone: formData.phone, code: otp });
      localStorage.setItem("token", res.token);
      setStep("payment");
    } catch (error) {
      console.error("Invalid OTP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = () => {
    setIsSubmitting(true);
    // Simulate Razorpay payment
    setTimeout(async () => {
      try {
        await api.post("/onboard", formData);
        setStep("success");
      } catch (error) {
        console.error("Onboarding failed:", error);
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Onboarding</h1>
          <p className="text-gray-500 mt-2">Set up your digital clinic in minutes</p>
        </div>

        {step === "details" && (
          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Clinic Name</label>
                  <Input 
                    placeholder="e.g. HealthFirst Clinic" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
                  <Input 
                    type="email"
                    placeholder="contact@clinic.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Phone Number</label>
                  <Input 
                    type="tel"
                    placeholder="10-digit mobile number" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Address</label>
                  <Input 
                    placeholder="Clinic street address" 
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 transition-all mt-4" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Get OTP Verification"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Identity</h2>
              <p className="text-gray-500 mb-8">We've sent a 4-digit code to {formData.phone}</p>
              
              <form onSubmit={handleOtpVerify}>
                <Input 
                  autoFocus
                  type="number"
                  placeholder="0000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.slice(0, 4))}
                  className="h-16 text-center text-3xl tracking-[0.5em] rounded-2xl font-mono bg-gray-50 border-gray-100 mb-8"
                  required
                />
                <Button type="submit" className="w-full h-12 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || otp.length < 4}>
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
                <button type="button" className="mt-4 text-sm text-gray-500 hover:text-blue-600 font-medium">
                  Didn't receive code? Resend
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "payment" && (
          <Card className="border-none shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Monthly Pro Plan</h3>
                    <p className="text-blue-700 text-sm">Full digital platform access</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-900">₹599</span>
                    <p className="text-blue-700 text-xs">/ month</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Real-time Queue Management</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Patient Medical Records</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Custom QR for Booking</li>
                </ul>
              </div>

              <Button onClick={handlePayment} className="w-full h-14 rounded-xl font-bold text-lg bg-black hover:bg-gray-800 transition-all text-white flex items-center justify-center gap-3" disabled={isSubmitting}>
                <CreditCard className="w-5 h-5" />
                {isSubmitting ? "Initiating Razorpay..." : "Pay ₹599 & Start Now"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "success" && (
          <div className="text-center animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your clinic is now live. You can start managing patients and appointments immediately.</p>
            <Button onClick={() => navigate("/admin/dashboard")} className="w-full h-14 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
