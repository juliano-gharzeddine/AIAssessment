"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Vault } from "lucide-react";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // fall back for client-side since process.env is not directly accessible.
    return window.location.origin;
  }
  // fallback for SSR (shouldn't be used here but for completeness)
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default function CustomerHeader({ name }) {
  // For client-side, get env via public runtime config or `window.location.origin`
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  function getCallbackUrl(path) {
    // Always produce an absolute URL to comply with next-auth recommendations
    return `${baseUrl}${path}`;
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
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
          <Link href="/#my-requests" className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            My Requests
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: getCallbackUrl("/login?switch=1") })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Switch Account
          </button>
          <button
            onClick={() => signOut({ callbackUrl: getCallbackUrl("/login") })}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
