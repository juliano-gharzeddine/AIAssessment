"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, Repeat, ShieldCheck, Building2, ClipboardList, Vault } from "lucide-react";
import { useMemo, useState } from "react";

const ICONS = {
  regulator: ShieldCheck,
  department: Building2,
  queue: ClipboardList,
};

// Utility to get absolute base url
function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default function Sidebar({ title, subtitle, items = [], footer }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(false);

  const currentPath = useMemo(() => {
    const query = searchParams?.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  function isItemActive(item) {
    if (typeof item.isActive === "function") {
      return item.isActive({ pathname, search: searchParams });
    }
    return currentPath === item.href;
  }

  // Helper to reliably build auth callback URL
  function getCallbackUrl(path) {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return `${baseUrl}${path}`;
  }

  return (
    <aside
      className={`${collapsed ? "w-24" : "w-80"} sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white/95 p-4 text-slate-800 shadow-[12px_0_32px_rgba(15,23,42,0.05)] backdrop-blur-md transition-[width] duration-150`}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="mb-5 self-start rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-4 text-white shadow-lg shadow-blue-200/60">
        <h2 className={`font-semibold tracking-tight ${collapsed ? "flex justify-center" : ""}`}>
          {collapsed ? <Vault className="h-6 w-6" /> : title}
        </h2>
        {!collapsed && <p className="mt-1 text-xs text-blue-100">{subtitle}</p>}
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = isItemActive(item);
          const ItemIcon = ICONS[item.icon] ?? ClipboardList;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <ItemIcon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </span>
              {!collapsed && item.count != null && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
        {!collapsed && footer}

        <button
          onClick={() => signOut({ callbackUrl: getCallbackUrl("/login?switch=1") })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-100"
        >
          <Repeat className="h-4 w-4" /> {!collapsed && "Switch Account"}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: getCallbackUrl("/login") })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" /> {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
