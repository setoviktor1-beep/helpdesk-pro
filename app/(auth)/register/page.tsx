"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create organization
      const { data: org, error: orgError } = await supabase
        .from('orgs')
        .insert({ name: orgName })
        .select()
        .single();

      if (orgError) {
        alert("Error creating organization: " + orgError.message);
        setLoading(false);
        return;
      }

      // 3. Link user to org as owner
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: org.id,
          user_id: authData.user.id,
          role: 'owner'
        });

      if (memberError) {
        alert("Error linking member: " + memberError.message);
      } else {
        // SUCCESS: Redirect directly to dashboard
        router.push("/dashboard");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight text-blue-600">Helpdesk Pro</h1>
          <p className="text-gray-500 mt-2">Create account and start working instantly.</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Company Name</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" value={orgName} onChange={e => setOrgName(e.target.value)} required placeholder="Acme Inc" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Your Full Name</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="John Doe" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Password</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
            {loading ? "Creating Account..." : "Join Now"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Login</Link></p>
      </div>
    </div>
  );
}