"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Vault } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const safeCallbackUrl = callbackUrl?.startsWith("/") ? callbackUrl : null;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: safeCallbackUrl ?? undefined,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    if (safeCallbackUrl) {
      router.replace(safeCallbackUrl);
      return;
    }

    const res = await fetch("/api/auth/session", { cache: "no-store" });
    const session = await res.json();

    if (session?.user?.role === "REGULATOR") {
      router.replace("/regulator");
    } else if (session?.user?.role === "DEPARTMENT") {
      router.replace("/department");
    } else {
      router.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 pb-8 pt-28">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2 text-white">
            <Vault className="h-5 w-5" />
          </div>
          <p className="text-lg font-semibold tracking-tight text-slate-900">ARCVAULT</p>
        </div>
      </header>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ArcVault</h1>
        <p className="mb-6 mt-2 text-slate-500">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
