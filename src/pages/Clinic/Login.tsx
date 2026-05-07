import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stethoscope, ShieldCheck, ArrowRight, Lock, Phone } from "lucide-react";
import { api } from "@/lib/api";

export default function ClinicLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [method, setMethod] = useState<"otp" | "password">("otp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/otp/send", { phone });
      setStep("otp");
    } catch (err: any) {
      setError("Failed to send OTP. Please try again.");
      console.error("Failed to send OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/otp/verify", { phone, code: otp });
      handleLoginSuccess(res);
    } catch (err: any) {
      setError("Invalid OTP. Please check the code and try again.");
      setOtp("");
      console.error("Invalid OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/login-password", { phone, password });
      handleLoginSuccess(res);
    } catch (err: any) {
      setError("Invalid phone number or password.");
      console.error("Password login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (res: any) => {
    // Check if the user has admin/root access before storing token
    if (res.user?.role === 'root') {
      localStorage.setItem("token", res.token);
      navigate("/platform-admin");
    } else if (res.user?.role === 'admin') {
      localStorage.setItem("token", res.token);
      navigate("/admin/dashboard");
    } else {
      // Not an admin — show error, don't store token
      setError("This account is not registered as a clinic admin. Please use your registered clinic credentials.");
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
            {method === "otp" ? "Login using your registered mobile" : "Login using your phone and password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          {method === "otp" ? (
            step === "phone" ? (
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
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => setMethod("password")}
                    className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                  >
                    <Lock className="w-4 h-4" />
                    Login with Password instead
                  </button>
                </div>
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
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="h-12 rounded-xl"
                />
              </div>
              <Button className="w-full h-12 rounded-xl font-bold" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setMethod("otp")}
                  className="text-sm text-primary font-medium hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                  <Phone className="w-4 h-4" />
                  Login with OTP instead
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

