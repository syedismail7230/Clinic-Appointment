import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsView() {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input id="clinicName" defaultValue="City Health Clinic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input id="phone" defaultValue="+1 555-0100" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" defaultValue="123 Medical Center Blvd, Suite 100" />
              </div>
            </div>
            <Button className="mt-4">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>Set your standard operating hours.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Opening Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label>Closing Time</Label>
                <Input type="time" defaultValue="18:00" />
              </div>
            </div>
            <Button className="mt-4">Update Hours</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
