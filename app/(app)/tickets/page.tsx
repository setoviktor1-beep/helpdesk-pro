// app/(app)/tickets/page.tsx
import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const supabase = createClient();
  
  const { data: tickets } = await supabase
    .from('tickets')
    .select('*, profiles!created_by(full_name)')
    .order('created_at', { ascending: false });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in_progress': return 'bg-gray-900 text-white border-gray-900';
      case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="p-10 space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and respond to customer requests.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
          + New Ticket
        </button>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">Subject</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">Status</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">Priority</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400">Requester</th>
              <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] text-gray-400 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                <td className="px-6 py-5">
                  <Link href={`/tickets/${t.id}`} className="font-bold text-gray-900 group-hover:text-blue-600">{t.subject}</Link>
                  <div className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">{t.id.slice(0, 8)}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(t.status)}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className={`font-bold ${t.priority === 'urgent' ? 'text-red-600' : t.priority === 'high' ? 'text-orange-600' : 'text-gray-500'}`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="font-black text-gray-900">{(t as any).profiles?.full_name || 'System'}</div>
                </td>
                <td className="px-6 py-5 text-right font-bold text-gray-400">
                  {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
            {(!tickets || tickets.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium italic">
                  No tickets found in this organization.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
