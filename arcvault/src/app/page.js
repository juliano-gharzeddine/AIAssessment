import Link from "next/link";
import { History, Mail, MessageCircle, ShieldCheck, ArrowRight, Vault } from "lucide-react";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { SOURCE_LABELS, STATUS_LABELS, CATEGORY_LABELS } from "@/lib/labels";
import { decodeHtmlEntities } from "@/lib/utils";
import CustomerHeader from "@/components/CustomerHeader";


function getCustomerStatus(record) {
  if (!record) return "PENDING";
  if (record.status === "RESOLVED") return "RESOLVED";
  return "PENDING";
}

function getPortalHref(role) {
  if (role === "REGULATOR") return "/regulator";
  if (role === "DEPARTMENT") return "/department";
  if (role === "CUSTOMER") return "/";
  return "/";
}

function StatusBadge({ status }) {
  const tone = status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{STATUS_LABELS[status] ?? status}</span>;
}

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === "CUSTOMER") {
    const requests = await db.request.findMany({
      where: { userId: session.user.id },
      include: { processedRecord: true },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });

    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <CustomerHeader name={session.user.name} />
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {session.user.name}</h1>
            <p className="mt-2 text-slate-600">Track your submitted requests and submit new issues anytime.</p>
            <Link href="/submit" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Submit New Request
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Your Requests</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-slate-600">{SOURCE_LABELS[request.source] ?? request.source}</p>
                    <StatusBadge status={getCustomerStatus(request.processedRecord)} />
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{decodeHtmlEntities(request.rawMessage).slice(0, 140)}{decodeHtmlEntities(request.rawMessage).length > 140 ? "..." : ""}</p>
                  <p className="mt-2 text-xs text-slate-500">Submitted {new Date(request.submittedAt).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {request.processedRecord
                      ? `${CATEGORY_LABELS[request.processedRecord.category] ?? request.processedRecord.category} • ${STATUS_LABELS[getCustomerStatus(request.processedRecord)] ?? getCustomerStatus(request.processedRecord)}`
                      : "Processing..."}
                  </p>
                </div>
              ))}
              {!requests.length && <p className="px-6 py-8 text-sm text-slate-500">You haven't submitted any requests yet.</p>}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2"><div className="rounded-lg bg-blue-600 p-1.5 text-white"><Vault size={20} /></div><span className="text-xl font-bold tracking-tight text-slate-900">ARCVAULT</span></div>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href={getPortalHref(session.user.role)} className="text-sm font-medium text-slate-600 hover:text-blue-600">Portal</Link>
                {session.user.role === "CUSTOMER" ? (<Link href="/submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Submit a Ticket</Link>) : null}
              </>
            ) : (
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600">Sign In</Link>
            )}
            <Link href="#contact" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">Contact Us</Link>
          </div>
        </div>
      </nav>
      <main>
        <section className="bg-white border-b border-slate-200 pt-20 pb-24"><div className="mx-auto max-w-4xl px-6 text-center"><h1 className="text-5xl font-extrabold tracking-tight text-slate-900">The Standard for <span className="text-blue-600">B2B Support.</span></h1><p className="mt-6 text-xl leading-relaxed text-slate-600">ArcVault was founded in 2021 with a simple mission: to bridge the gap between complex enterprise software and the people who keep it running.</p><div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{session?.user?.role === "CUSTOMER" ? (<Link href="/submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700">Submit a Ticket<ArrowRight size={16} /></Link>) : null}{session?.user ? (
          <Link href={getPortalHref(session.user.role)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">Portal</Link>
        ) : (
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">Sign In</Link>
        )}</div></div></section>
        <section className="mx-auto max-w-5xl px-6 py-20"><div className="grid gap-12 md:grid-cols-2"><div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100"><History className="text-blue-600 mb-4" size={32} /><h2 className="text-2xl font-bold mb-3">Our History</h2><p className="text-slate-600 leading-relaxed">Starting as a specialized internal tool for engineering teams, ArcVault evolved into a full-scale triage platform. We’ve processed millions of high-stakes requests for the world's leading SaaS providers.</p></div><div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100"><ShieldCheck className="text-blue-600 mb-4" size={32} /><h2 className="text-2xl font-bold mb-3">Enterprise DNA</h2><p className="text-slate-600 leading-relaxed">Reliability isn't a feature; it's our foundation. Our systems are built to handle SOC2 compliance and high-availability requirements out of the box.</p></div></div></section>
        <section id="contact" className="mx-auto max-w-5xl px-6 pb-24"><div className="rounded-[2rem] bg-blue-600 p-10 md:p-16 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"><div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50"></div><div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10"><div className="max-w-md"><h2 className="text-4xl font-bold">Need Support?</h2><p className="mt-4 text-blue-100 text-lg leading-relaxed">Our dedicated enterprise team is ready to assist you. Whether it's a technical hurdle or a billing inquiry, we've got you covered.</p></div><div className="flex flex-col gap-4 w-full md:w-auto"><Link href="mailto:support@arcvault.com" className="flex items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-600 transition hover:bg-blue-50 hover:-translate-y-0.5"><Mail size={20} />Email Support</Link><button className="flex items-center justify-center gap-3 rounded-xl bg-blue-700 border border-blue-400 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-800"><MessageCircle size={20} />Open Live Chat</button>{session?.user?.role === "CUSTOMER" ? (<Link href="/submit" className="flex items-center justify-center gap-3 rounded-xl bg-blue-500 border border-blue-300 px-8 py-4 text-lg font-bold text-white transition hover:bg-blue-400">Submit a Ticket</Link>) : null}</div></div></div></section>
      </main>
    </div>
  );
}
