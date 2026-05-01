import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function ClinicLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/otp/send", { phone });
      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/otp/verify", { phone, code: otp });
      localStorage.setItem("token", res.token);
      
      if (res.user?.role === 'root') {
        navigate("/platform-admin");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Invalid OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Clinic Portal</CardTitle>
          <CardDescription>
            Enter your credentials to manage appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  type="tel" 
                  placeholder="Enter your registered mobile" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                  className="h-12 rounded-xl"
                />
              </div>
              <Button className="w-full h-12 rounded-xl font-bold" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Get Login OTP"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Sent to {phone}</p>
              </div>
              <Input 
                autoFocus
                type="number"
                placeholder="0000"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 4))}
                className="h-16 text-center text-3xl tracking-[0.5em] rounded-2xl font-mono"
                required
              />
              <Button className="w-full h-12 rounded-xl font-bold" type="submit" disabled={loading || otp.length < 4}>
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
              <button 
                type="button" 
                onClick={() => setStep("phone")}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
