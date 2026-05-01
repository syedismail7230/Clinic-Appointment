import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function SettingsView() {
  const [profile, setProfile] = useState({ name: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await api.get('/admin/clinic');
        setProfile({ name: data.name || '', address: data.address || '' });
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
    try {
      await api.patch('/admin/clinic', profile);
      alert('Settings updated successfully!');
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
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Clinic Profile</CardTitle>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={profile.address} 
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })} 
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
