import Link from "next/link";
import { HeadsetIcon } from "@/components/icons";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="rounded-2xl bg-blue-100 p-4 text-blue-600 shadow-sm">
          <HeadsetIcon className="h-10 w-10" />
        </div>
        <p className="mt-6 text-sm font-semibold tracking-[0.18em] text-slate-500">ARCVAULT</p>
        <h1 className="mt-3 text-5xl font-bold text-slate-900">Smart support, routed right.</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">AI-powered customer support intake and triage for modern B2B SaaS teams.</p>
        <Link href="/submit" className="mt-10 rounded-lg bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-600">
          Submit a Request
        </Link>
      </section>
    </main>
  );
}
