import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Star, QrCode, Activity, ChevronRight, X, FileText, Navigation, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from "motion/react";
import { api } from "@/lib/api";

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PatientHome() {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }

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

  const sortedClinics = useMemo(() => {
    let result = clinics.map(clinic => {
      if (userCoords && clinic.lat && clinic.lng) {
        const dist = calculateDistance(userCoords.lat, userCoords.lng, clinic.lat, clinic.lng);
        return { ...clinic, currentDistance: dist };
      }
      return { ...clinic, currentDistance: Infinity };
    });

    if (searchTerm) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by distance if available, otherwise original order
    return result.sort((a, b) => (a.currentDistance || Infinity) - (b.currentDistance || Infinity));
  }, [clinics, searchTerm, userCoords]);

  const handleScan = (result: any[]) => {
    if (result && result.length > 0) {
      const code = result[0].rawValue?.trim();
      console.log("Scanned QR Code:", code);
      let clinicId = null;

      if (code.includes('/clinic/')) {
        const parts = code.split('/clinic/');
        clinicId = parts[1].split('/')[0].split('?')[0];
      } else if (code.includes('?clinic=')) {
        const urlParams = new URLSearchParams(code.split('?')[1]);
        clinicId = urlParams.get('clinic');
      } else {
        clinicId = code; // try treating the raw text as an ID
      }

      console.log("Extracted clinicId:", clinicId);
      console.log("Available clinics:", clinics);

      if (clinicId && clinics.some(c => c.id === clinicId || c.tenant_id === clinicId)) {
        // If it matched a tenant_id, find the first clinic for that tenant
        const matchedClinic = clinics.find(c => c.id === clinicId) || clinics.find(c => c.tenant_id === clinicId);
        console.log("Navigating to clinic:", matchedClinic.id);
        navigate(`/clinic/${matchedClinic.id}`);
      } else {
        console.warn("Invalid clinic QR code or clinic not loaded. clinicId:", clinicId);
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
          center={userCoords ? [userCoords.lat, userCoords.lng] : [12.9716, 77.5946]} 
          zoom={13} 
          zoomControl={false}
          className="w-full h-full"
        >
          {userCoords && <MapUpdater center={[userCoords.lat, userCoords.lng]} />}
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {sortedClinics.map((clinic) => (
            <Marker key={clinic.id} position={[clinic.lat || 12.9716, clinic.lng || 77.5946]}>
              <Popup>
                <div className="font-semibold">{clinic.name}</div>
                <div className="text-xs text-gray-500">{clinic.address}</div>
              </Popup>
            </Marker>
          ))}
          {userCoords && (
             <Marker 
              position={[userCoords.lat, userCoords.lng]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5)"></div>`,
                iconSize: [15, 15],
                iconAnchor: [7, 7]
              })}
             />
          )}
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
            {sortedClinics.map((clinic, index) => (
              <div 
                key={clinic.id} 
                className={`flex items-center justify-between p-4 bg-white border rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-[0.98] relative ${index === 0 && userCoords ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-100'}`}
                onClick={() => navigate(`/clinic/${clinic.id}`)}
              >
                {index === 0 && userCoords && (
                  <div className="absolute -top-2 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Zap className="w-2.5 h-2.5" /> NEAREST TO YOU
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{clinic.name}</h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span>{clinic.address}</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5 text-blue-600 font-medium">
                        <Navigation className="w-3 h-3" />
                        {clinic.currentDistance !== Infinity ? `${clinic.currentDistance.toFixed(1)} km` : clinic.distance}
                      </div>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
            {sortedClinics.length === 0 && (
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
