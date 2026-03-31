import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, QrCode, Activity, ChevronRight, X, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { MOCK_CLINICS } from "@/lib/mockData";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from "motion/react";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PatientHome() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);

  const filteredClinics = MOCK_CLINICS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScan = (result: any[]) => {
    if (result && result.length > 0) {
      const code = result[0].rawValue;
      if (code.includes('/clinic/')) {
        const parts = code.split('/clinic/');
        const clinicId = parts[1].split('/')[0];
        navigate(`/clinic/${clinicId}`);
      } else if (MOCK_CLINICS.some(c => c.id === code)) {
        navigate(`/clinic/${code}`);
      } else {
        alert("Invalid clinic QR code");
      }
      setShowScanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-hidden flex flex-col">
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[12.9716, 77.5946]} // Default to Bangalore coordinates based on the image
          zoom={13} 
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {/* Mock markers for clinics */}
          {filteredClinics.map((clinic, index) => {
            // Generate some mock coordinates near Bangalore center for the demo
            const lat = 12.9716 + (index * 0.01) - 0.005;
            const lng = 77.5946 + (index * 0.01) - 0.005;
            return (
              <Marker key={clinic.id} position={[lat, lng]}>
                <Popup>
                  <div className="font-semibold">{clinic.name}</div>
                  <div className="text-xs text-gray-500">{clinic.address}</div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 p-6 pt-12 flex justify-between items-center">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <Activity className="w-5 h-5 text-black" />
          <span className="font-bold text-lg tracking-tight">QuickCare</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="rounded-full bg-white shadow-sm border-none font-medium"
            onClick={() => navigate('/records')}
          >
            <FileText className="w-4 h-4 mr-2" />
            My Records
          </Button>
        </div>
      </div>

      {/* Bottom Sheet Area */}
      <motion.div 
        className="relative z-10 mt-auto bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
        initial={false}
        animate={{ height: isSheetExpanded ? "70vh" : "180px" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(e, { offset, velocity }) => {
          if (offset.y > 50 || velocity.y > 500) {
            setIsSheetExpanded(false);
          } else if (offset.y < -50 || velocity.y < -500) {
            setIsSheetExpanded(true);
          }
        }}
      >
        {/* Drag Handle Area */}
        <div 
          className="w-full pt-4 pb-2 cursor-grab active:cursor-grabbing flex justify-center"
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
        
        <div className="px-6 mb-6 shrink-0">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Find a clinic</h1>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-black rounded-full" />
            <Input 
              className="w-full pl-10 bg-gray-100 border-none h-14 rounded-xl text-lg font-medium" 
              placeholder="Where to?" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSheetExpanded(true)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-28" style={{ opacity: isSheetExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Clinics</h2>
          <div className="space-y-4">
            {filteredClinics.map(clinic => (
              <div 
                key={clinic.id} 
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]"
                onClick={() => navigate(`/clinic/${clinic.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{clinic.name}</h3>
                    <p className="text-gray-500 text-sm">{clinic.address} • {clinic.distance}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
            {filteredClinics.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No clinics found matching your search.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button for QR Scanner */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <Button 
          size="lg" 
          className="rounded-full shadow-2xl h-14 px-6 bg-black text-white hover:bg-gray-800 font-bold text-lg"
          onClick={() => setShowScanner(true)}
        >
          <QrCode className="w-6 h-6 mr-2" />
          Scan QR
        </Button>
      </div>

      {/* QR Scanner Overlay */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="p-6 pt-12 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold">Scan Clinic QR</h2>
            <button onClick={() => setShowScanner(false)} className="p-2 bg-white/20 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-3xl relative overflow-hidden bg-gray-900">
              <Scanner
                onScan={handleScan}
                onError={(error) => console.error(error)}
              />
            </div>
          </div>
          <div className="p-8 text-center text-white/80">
            <p>Point your camera at the QR code located at the clinic reception to book instantly.</p>
          </div>
        </div>
      )}
    </div>
  );
}
