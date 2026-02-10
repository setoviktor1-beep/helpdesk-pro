// app/(app)/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Building2, PlusCircle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: memberData } = await supabase
        .from('org_members')
        .select('*, orgs(name)')
        .eq('user_id', user.id)
        .maybeSingle();
      setMember(memberData);
    }
    setLoading(false);
  };

  const createOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !user) return;
    setActionLoading(true);

    // 1. Create org
    const { data: org, error: orgError } = await supabase
      .from('orgs')
      .insert({ name: orgName })
      .select()
      .single();

    if (orgError) {
      alert(orgError.message);
      setActionLoading(false);
      return;
    }

    // 2. Add as owner
    const { error: memberError } = await supabase.from('org_members').insert({
      org_id: org.id,
      user_id: user.id,
      role: 'owner'
    });

    if (memberError) {
      alert("Org created, but membership failed: " + memberError.message);
      setActionLoading(false);
      return;
    }

    alert("Organization created successfully!");
    router.refresh(); // Tell Next.js to clear cache
    window.location.href = '/dashboard'; // Force redirect to dashboard
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">Loading settings...</div>;

  return (
    <div className="p-10 space-y-10 max-w-4xl mx-auto font-sans">
      <header>
        <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your identity and workspaces.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-gray-50/50 border border-gray-100 p-8 rounded-3xl">
          <h2 className="text-xs uppercase font-black text-gray-400 tracking-widest mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Email Address</label>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600">{user?.email}</div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1">Full Name</label>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-600">{user?.user_metadata.full_name || 'Not set'}</div>
            </div>
          </div>
        </div>

        {/* Organization Section */}
        <div className="bg-white border-2 border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xs uppercase font-black text-blue-600 tracking-widest mb-6">Workspace</h2>
          
          {member ? (
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Building2 size={32} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{member.orgs.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Membership • {member.role}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-orange-600 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <PlusCircle size={20} />
                <p className="text-sm font-bold">You haven't joined or created an organization yet.</p>
              </div>
              
              <form onSubmit={createOrg} className="flex gap-3">
                <input 
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium" 
                  placeholder="Organization Name (e.g. Acme Support)" 
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  required
                />
                <button 
                  disabled={actionLoading}
                  className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
