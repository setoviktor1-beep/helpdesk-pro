// app/(app)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  
  // 1. Fetch tickets stats
  const { data: tickets } = await supabase.from('tickets').select('status, priority');
  
  const stats = {
    open: tickets?.filter(t => t.status === 'open').length || 0,
    in_progress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    urgent: tickets?.filter(t => t.priority === 'urgent').length || 0,
  };

  return (
    <div className="p-10 space-y-10 max-w-6xl mx-auto">
      <header>
        <h1 className="text-4xl font-black tracking-tight">Overview</h1>
        <p className="text-gray-500 mt-2">Real-time support operations status.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80">Open Tickets</div>
          <div className="text-5xl font-black mt-2">{stats.open}</div>
        </div>
        <div className="p-8 rounded-[2rem] bg-gray-900 text-white shadow-xl shadow-gray-900/20">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80">In Progress</div>
          <div className="text-5xl font-black mt-2">{stats.in_progress}</div>
        </div>
        <div className="p-8 rounded-[2rem] bg-red-50 text-red-600 border border-red-100">
          <div className="text-[10px] uppercase font-black tracking-widest opacity-80 text-red-400">Urgent Priority</div>
          <div className="text-5xl font-black mt-2">{stats.urgent}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-6">
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Recent Activity</h2>
          <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 text-center text-gray-400 font-medium italic">
            Audit logs will appear here as you perform actions.
          </div>
        </section>
        
        <section className="space-y-6">
          <h2 className="text-2xl font-black">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 transition-all text-left group">
              <div className="font-black text-gray-900 group-hover:text-blue-600">New Ticket</div>
              <div className="text-xs text-gray-400 font-bold mt-1">Manual entry</div>
            </button>
            <button className="p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 transition-all text-left group">
              <div className="font-black text-gray-900 group-hover:text-blue-600">Add Article</div>
              <div className="text-xs text-gray-400 font-bold mt-1">Write to KB</div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
