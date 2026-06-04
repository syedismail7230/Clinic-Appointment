import { useState, useEffect } from "react";
import { MapPin, Building, FileText, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function SettingsView() {
  const [profile, setProfile] = useState({
    name: "", address: "", maps_link: "", logo_url: "", gst_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const data = await api.get("/admin/clinic");
        setProfile({
          name:       data.name || "",
          address:    data.address || "",
          maps_link:  data.maps_link || "",
          logo_url:   data.logo_url || "",
          gst_number: data.gst_number || "",
        });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchClinic();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/admin/clinic", profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-[13px] text-[#aaa] py-12 text-center">Loading settings…</div>;

  const fieldCls = "w-full h-10 rounded-lg border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#222] focus:outline-none focus:ring-1 focus:ring-black placeholder:text-[#ccc] transition-all";
  const labelCls = "block text-[11px] font-semibold uppercase tracking-widest text-[#aaa] mb-1.5";

  const Section = ({ icon: Icon, title, description, children }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-[#888]" />
          <span className="text-[14px] font-semibold text-[#222]">{title}</span>
        </div>
        <p className="text-[12px] text-[#aaa]">{description}</p>
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl space-y-8">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-[#0a0a0a]">Settings</h2>
        <p className="text-[13px] text-[#999] mt-0.5">Manage your clinic profile and preferences</p>
      </div>

      {/* ── Clinic Profile ── */}
      <Section icon={Building} title="Clinic Profile" description="Your clinic's public-facing information.">
        <div>
          <label className={labelCls}>Clinic Name</label>
          <Input
            className={fieldCls}
            placeholder="e.g. Downtown Medical Center"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
          />
        </div>
        <div>
          <label className={labelCls}>Address</label>
          <Input
            className={fieldCls}
            placeholder="e.g. 123 Main St, Metro City"
            value={profile.address}
            onChange={e => setProfile({ ...profile, address: e.target.value })}
          />
        </div>
      </Section>

      <hr className="border-[#f0f0f0]" />

      {/* ── Location ── */}
      <Section icon={MapPin} title="Location" description="Help patients find your clinic on the map.">
        <div>
          <label className={labelCls}>Google Maps Link</label>
          <Input
            className={fieldCls}
            placeholder="https://maps.google.com/?q=..."
            value={profile.maps_link}
            onChange={e => setProfile({ ...profile, maps_link: e.target.value })}
          />
          <p className="text-[11px] text-[#bbb] mt-1.5">
            Open Google Maps, find your clinic, click Share → Copy Link and paste here.
          </p>
          {profile.maps_link && (
            <a
              href={profile.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#888] hover:text-black mt-2 transition-colors"
            >
              <MapPin className="w-3 h-3" /> Open in Google Maps →
            </a>
          )}
        </div>
      </Section>

      <hr className="border-[#f0f0f0]" />

      {/* ── Branding ── */}
      <Section icon={Building} title="Branding" description="Customise your clinic's appearance on patient-facing pages.">
        <div>
          <label className={labelCls}>Clinic Logo URL</label>
          <Input
            className={fieldCls}
            placeholder="https://yoursite.com/logo.png"
            value={profile.logo_url}
            onChange={e => setProfile({ ...profile, logo_url: e.target.value })}
          />
          {profile.logo_url && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-[#f8f8f8] border border-[#f0f0f0] rounded-xl">
              <img
                src={profile.logo_url}
                alt="Clinic Logo"
                className="w-12 h-12 object-contain rounded-lg border border-[#ebebeb] bg-white"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-[12px] text-[#aaa]">Logo preview</span>
            </div>
          )}
        </div>
      </Section>

      <hr className="border-[#f0f0f0]" />

      {/* ── Business Details ── */}
      <Section icon={FileText} title="Business Details" description="Tax and regulatory information for invoices and receipts.">
        <div>
          <label className={labelCls}>GST Number</label>
          <Input
            className={fieldCls}
            placeholder="e.g. 22AAAAA0000A1Z5"
            value={profile.gst_number}
            onChange={e => setProfile({ ...profile, gst_number: e.target.value.toUpperCase() })}
            maxLength={15}
          />
          <p className="text-[11px] text-[#bbb] mt-1.5">Your 15-digit GSTIN. Appears on invoices and receipts.</p>
        </div>
      </Section>

      <hr className="border-[#f0f0f0]" />

      {/* ── Save ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 rounded-lg bg-black text-white text-sm font-semibold hover:bg-[#222] transition-colors disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save All Changes"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] text-[#666] animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4" /> Settings updated
          </span>
        )}
      </div>
    </div>
  );
}
