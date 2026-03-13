"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogoutIcon, MenuIcon } from "@/components/icons";
import { useState } from "react";

export default function Sidebar({ title, subtitle, items = [], footer }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-20" : "w-72"} sticky top-0 flex h-screen flex-col bg-slate-900 p-4 text-white transition-all duration-200`}>
      <button onClick={() => setCollapsed((v) => !v)} className="mb-4 self-start rounded-lg p-2 hover:bg-white/10">
        <MenuIcon className="h-4 w-4" />
      </button>
      <div className="mb-8 px-2">
        <h2 className="font-semibold">{collapsed ? "AV" : title}</h2>
        {!collapsed && <p className="text-xs text-slate-300">{subtitle}</p>}
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${pathname === item.href ? "bg-blue-500 text-white" : "text-slate-200 hover:bg-white/10"}`}>
            <span>{collapsed ? item.shortLabel ?? item.label[0] : item.label}</span>
            {!collapsed && item.count != null && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{item.count}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
        {!collapsed && footer}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
        >
          <LogoutIcon className="h-4 w-4" /> {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
