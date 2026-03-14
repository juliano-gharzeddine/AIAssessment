"use client";

import { useActionState, useMemo, useState } from "react";
import { submitRequestAction } from "@/app/submit/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SOURCE_LABELS } from "@/lib/labels";

const initialState = {};

export default function SubmitForm({ user }) {
  const [state, action, pending] = useActionState(submitRequestAction, initialState);
  const [message, setMessage] = useState("");
  const maxLength = 1500;
  const length = message.length;
  const lengthColor = useMemo(() => (length < 50 ? "text-red-500" : "text-emerald-600"), [length]);

  if (state?.success) {
    return (
      <Card className="mx-auto max-w-3xl rounded-3xl border border-slate-200 p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Request submitted</h2>
        <p className="mt-2 text-slate-600">We'll get back to you shortly.</p>
        <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Ticket reference: <span className="font-semibold">{state.ticketRef}</span>
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl rounded-3xl border border-slate-200 p-8">
      <form action={action} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input value={user.name ?? ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input value={user.email ?? ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Source</label>
          <Select name="source" defaultValue="WEB_FORM" required className="rounded-xl bg-slate-50">
            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Message</label>
          <Textarea
            name="message"
            required
            minLength={50}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={maxLength}
            className="min-h-44 rounded-2xl bg-slate-50"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-xs ${lengthColor}`}>{length}/50 minimum characters</p>
            <p className="text-xs text-slate-500">{length}/{maxLength} max characters</p>
            {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          </div>
        </div>

        <Button type="submit" disabled={pending} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
          {pending ? "Submitting..." : "Submit request"}
        </Button>
      </form>
    </Card>
  );
}
