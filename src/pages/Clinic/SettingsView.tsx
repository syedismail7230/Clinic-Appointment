import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Building, FileText, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsView() {
  const [profile, setProfile] = useState({ 
    name: '', 
    address: '', 
    maps_link: '',
    logo_url: '',
    gst_number: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await api.get('/admin/clinic');
        setProfile({ 
          name: data.name || '', 
          address: data.address || '',
          maps_link: data.maps_link || '',
          logo_url: data.logo_url || '',
          gst_number: data.gst_number || ''
        });
      } catch (error) {
        console.error('Failed to fetch clinic settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/admin/clinic', profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update clinic settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading settings...</div>;

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Clinic Settings</h2>
        <p className="text-gray-500">Manage your clinic profile and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Clinic Profile */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Clinic Profile</CardTitle>
            <CardDescription>Update your clinic's public information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input 
                  id="clinicName" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                  placeholder="e.g. Downtown Medical Center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={profile.address} 
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                  placeholder="e.g. 123 Main St, Metro City"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5" /> Location</CardTitle>
            <CardDescription>Help patients find your clinic on the map.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapsLink">Google Maps Link</Label>
              <Input 
                id="mapsLink" 
                value={profile.maps_link} 
                onChange={(e) => setProfile({ ...profile, maps_link: e.target.value })} 
                placeholder="e.g. https://maps.google.com/?q=..."
              />
              <p className="text-xs text-gray-500">
                Open Google Maps, search for your clinic, click "Share" → "Copy Link" and paste it here.
              </p>
            </div>
            {profile.maps_link && (
              <a 
                href={profile.maps_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <MapPin className="w-3.5 h-3.5" /> Open in Google Maps
              </a>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Branding</CardTitle>
            <CardDescription>Customize your clinic's appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Clinic Logo URL</Label>
              <Input 
                id="logoUrl" 
                value={profile.logo_url} 
                onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })} 
                placeholder="e.g. https://yoursite.com/logo.png"
              />
              <p className="text-xs text-gray-500">
                Provide a URL to your clinic's logo image. This will appear on patient-facing pages.
              </p>
            </div>
            {profile.logo_url && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border">
                <img 
                  src={profile.logo_url} 
                  alt="Clinic Logo" 
                  className="w-16 h-16 object-contain rounded-lg border bg-white"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-sm text-gray-600">Logo preview</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Business Details</CardTitle>
            <CardDescription>Tax and regulatory information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input 
                id="gstNumber" 
                value={profile.gst_number} 
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value.toUpperCase() })} 
                placeholder="e.g. 22AAAAA0000A1Z5"
                maxLength={15}
              />
              <p className="text-xs text-gray-500">
                Your 15-digit GSTIN. This will appear on invoices and receipts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button className="h-11 px-6" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
