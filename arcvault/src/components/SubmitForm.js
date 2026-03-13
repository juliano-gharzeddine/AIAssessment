"use client";

import { useActionState, useMemo, useState } from "react";
import { submitRequestAction } from "@/app/submit/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState = {};

export default function SubmitForm() {
  const [state, action, pending] = useActionState(submitRequestAction, initialState);
  const [message, setMessage] = useState("");
  const length = message.length;
  const lengthColor = useMemo(() => (length < 50 ? "text-red-500" : "text-slate-500"), [length]);

  if (state?.success) {
    return (
      <Card className="mx-auto max-w-2xl p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Request submitted</h2>
        <p className="mt-2 text-slate-600">We'll get back to you shortly.</p>
        <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">Ticket reference: <span className="font-semibold">{state.ticketRef}</span></p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl p-8">
      <form action={action} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Source</label>
          <Select name="source" defaultValue="WEB_FORM" required>
            <option value="EMAIL">Email</option>
            <option value="WEB_FORM">Web Form</option>
            <option value="SUPPORT_PORTAL">Support Portal</option>
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
            className="min-h-44"
          />
          <div className="mt-1 flex items-center justify-between">
            <p className={`text-xs ${lengthColor}`}>{length}/50 minimum characters</p>
            {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
          </div>
        </div>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Submitting..." : "Submit request"}
        </Button>
      </form>
    </Card>
  );
}
