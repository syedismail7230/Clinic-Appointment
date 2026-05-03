import { useState, useEffect } from "react";
import { Building, Phone, Mail, User, CheckCircle2, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";

// Load Razorpay script dynamically
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Onboarding() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    email: "",
    phone: "",
    otp: ""
  });

  const handleSendOTP = async () => {
    if (!formData.name || !formData.clinicName || !formData.email || !formData.phone) {
      setError("Please fill out all fields.");
      return;
    }
    if (formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/otp/send", { phone: formData.phone });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 4) {
      setError("Please enter the 4-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Just verify to ensure phone is theirs before taking money.
      // We don't log them in yet, we just validate the OTP.
      const response = await api.post("/auth/otp/verify", { phone: formData.phone, code: formData.otp });
      if (response.token) {
        setStep(3); // Proceed to payment
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    
    const res = await loadRazorpay();
    if (!res) {
      setError("Failed to load Razorpay SDK. Check your connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const order = await api.post("/payments/create-order", {});

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder', // You should add this to frontend .env
        amount: order.amount,
        currency: order.currency,
        name: "QuickCare Premium",
        description: "Monthly Clinic Subscription",
        image: "https://your-logo-url.com/logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Complete Onboarding on Success
          try {
            setLoading(true);
            const onboardRes = await api.post("/onboard", {
              name: formData.clinicName,
              email: formData.email,
              phone: formData.phone,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (onboardRes.success) {
              setStep(4);
              // Auto login after success
              setTimeout(async () => {
                 // Re-login to get proper token with tenant_id
                 const loginRes = await api.post("/auth/otp/send", { phone: formData.phone });
                 // Note: Ideally we'd return the token directly from /onboard, 
                 // but to keep it simple, we redirect to login page for now.
                 navigate('/admin');
              }, 2000);
            }
          } catch (err: any) {
            setError("Payment verified, but failed to create account: " + err.message);
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#000000",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError("Payment failed: " + response.error.description);
      });
      rzp.open();
      
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold">
            QC
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Partner with QuickCare
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get your clinic up and running in minutes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-none shadow-xl">
          <CardContent className="pt-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-center mb-8">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 1 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
              <div className={`h-1 w-12 ${step >= 2 ? 'bg-black' : 'bg-gray-100'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 2 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
              <div className={`h-1 w-12 ${step >= 3 ? 'bg-black' : 'bg-gray-100'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= 3 ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder="e.g. Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-10" placeholder="e.g. City Care Clinic" value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" className="pl-10" placeholder="e.g. admin@citycare.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="tel" className="pl-10" placeholder="e.g. 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">We will send an OTP to verify this number.</p>
                </div>
                
                <Button className="w-full mt-6 h-11 text-base" onClick={handleSendOTP} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Continue'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center">
                  <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">Verify your phone</h3>
                  <p className="text-sm text-gray-500">We've sent a 4-digit code to +91 {formData.phone}</p>
                </div>
                
                <div>
                  <Input 
                    type="text" 
                    maxLength={4} 
                    className="text-center text-2xl tracking-widest h-14" 
                    placeholder="••••" 
                    value={formData.otp} 
                    onChange={e => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})} 
                  />
                </div>
                
                <Button className="w-full h-11 text-base" onClick={handleVerifyOTP} disabled={loading || formData.otp.length !== 4}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                
                <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 hover:text-black mt-2">
                  Change phone number
                </button>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold">Complete Registration</h3>
                  <p className="text-sm text-gray-500">Start your premium subscription today.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-gray-900">QuickCare Premium</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Billing Cycle</span>
                    <span className="font-medium text-gray-900">Monthly</span>
                  </div>
                  <div className="pt-3 border-t flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">₹1.00</span>
                  </div>
                </div>
                
                <Button className="w-full h-12 text-base bg-[#0b54fc] hover:bg-[#0940c4]" onClick={handlePayment} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay ₹1 & Subscribe'}
                </Button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-4 py-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Welcome to QuickCare!</h3>
                <p className="text-gray-500 mb-6">Your clinic has been registered successfully.</p>
                <p className="text-sm text-gray-400">Redirecting to login portal...</p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
