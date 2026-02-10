"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Helpdesk Pro</h1>
          <p className="text-gray-500 mt-2">Sign in to your dashboard.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Email</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest ml-1">Password</label>
            <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">New here? <Link href="/register" className="text-blue-600 font-bold hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
}
