"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Vault } from "lucide-react";

export default function CustomerHeader({ name }) {
  return (
    <header className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <Vault className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">ArcVault</p>
            <p className="text-sm font-medium text-slate-800">{name ? `Signed in as ${name}` : "Customer Portal"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            My Requests
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
