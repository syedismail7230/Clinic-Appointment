import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export default function DemoQR() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await api.get('/clinics');
        setClinics(data);
      } catch (error) {
        console.error('Failed to fetch clinics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  if (loading) return <div className="p-16 text-center text-gray-500">Loading Demo QR Codes...</div>;
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Demo QR Codes</h1>
          <p className="text-gray-600">
            Scan these QR codes with the app's scanner to test the booking flow. 
            You can open this page on another device (like your phone or a second monitor) and scan it with your primary device's camera.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {clinics.map((clinic) => {
            // The scanner logic handles both full URLs containing '/clinic/' and raw clinic IDs.
            // Let's use the raw clinic ID for simplicity, or the full URL.
            const qrValue = `${window.location.origin}/clinic/${clinic.id}`;
            
            return (
              <div key={clinic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{clinic.name}</h2>
                <p className="text-sm text-gray-500 mb-6">{clinic.address}</p>
                
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 mb-4">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="text-xs text-gray-400 font-mono break-all px-4">
                  {qrValue}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
