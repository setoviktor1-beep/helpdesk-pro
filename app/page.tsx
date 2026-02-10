import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-10 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tight text-blue-600">Helpdesk Pro</div>
        <div className="flex items-center gap-8">
          <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Login</Link>
          <Link href="/register" className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <h1 className="text-7xl font-black tracking-tight leading-[0.9] text-gray-900 mb-8">
            Scale your support <br />
            <span className="text-blue-600">without the chaos.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl mb-12 font-medium">
            The multi-tenant helpdesk built for modern B2B teams. Manage tickets, build knowledge bases, and meet SLAs with a tool that works as fast as you do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 group">
              Register Organization <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: <Users className="text-blue-600" />, title: "Multi-tenant", desc: "Isolate customer data perfectly with built-in organization logic." },
            { icon: <Zap className="text-orange-500" />, title: "Realtime", desc: "See agent activity and new ticket messages as they happen." },
            { icon: <ShieldCheck className="text-emerald-500" />, title: "Enterprise RLS", desc: "Data protection enforced at the database level by PostgreSQL." }
          ].map((feat, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-blue-200 transition-all">
              <div className="mb-6 bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-50 text-gray-400 text-sm font-bold uppercase tracking-widest text-center">
        © 2026 Helpdesk Pro B2B. Multi-tenant ready.
      </footer>
    </main>
  );
}
