// app/(app)/layout.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Ticket, BookOpen, Settings, LogOut, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get user organization membership
  const { data: member } = await supabase
    .from('org_members')
    .select('*, orgs(name)')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col p-6 bg-gray-50/50 transition-all">
        <div className="mb-10 px-2">
          <div className="text-xl font-black tracking-tight text-blue-600">Helpdesk Pro</div>
          {member ? (
            <div className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">{member.orgs.name}</div>
          ) : (
            <div className="text-[10px] uppercase font-bold text-orange-400 mt-1 tracking-widest italic">Personal Account</div>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
            <LayoutDashboard size={18} /> Overview
          </Link>
          
          {member && (
            <>
              <Link href="/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                <Ticket size={18} /> Tickets
              </Link>
              <Link href="/kb" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                <BookOpen size={18} /> Articles
              </Link>
            </>
          )}

          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
            <Settings size={18} /> Settings
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {user.email?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black truncate">{user.user_metadata.full_name || user.email}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase">{member?.role || 'Guest'}</div>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
    </div>
  );
}