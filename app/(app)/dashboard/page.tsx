// app/(app)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { PlusCircle, Building2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Check organization membership
  const { data: member } = await supabase
    .from('org_members')
    .select('*, orgs(name)')
    .eq('user_id', user?.id)
    .maybeSingle();

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center max-w-xl mx-auto space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
          <Building2 size={40} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">Create Organization</h1>
          <p className="text-gray-500 mt-2">To start managing tickets and team members, you need to create your workspace first.</p>
        </div>
        <Link href="/settings" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2">
          <PlusCircle size={20} /> Set Up Organization
        </Link>
      </div>
    );
  }

  // 2. Fetch tickets stats if member exists
  const { data: tickets } = await supabase.from('tickets').select('status, priority');
  const stats = {
    open: tickets?.filter(t => t.status === 'open').length || 0,
    in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    urgent: tickets?.filter(t => t.priority === 'urgent').length || 0,
  };

  return (
    <div className="p-10 space-y-10 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Support Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening at <span className="font-bold text-blue-600">{member.orgs.name}</span>.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80 text-white/70">Open Tickets</div>
          <div className="text-5xl font-black mt-2 tracking-tight">{stats.open}</div>
        </div>
        <div className="p-8 rounded-[2rem] bg-gray-900 text-white shadow-xl shadow-gray-900/20 border border-gray-800">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80 text-gray-400">In Progress</div>
          <div className="text-5xl font-black mt-2 tracking-tight">{stats.in_progress}</div>
        </div>
        <div className="p-8 rounded-[2rem] bg-red-50 text-red-600 border border-red-100">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80 text-red-400">Urgent Action</div>
          <div className="text-5xl font-black mt-2 tracking-tight">{stats.urgent}</div>
        </div>
      </div>
    </div>
  );
}