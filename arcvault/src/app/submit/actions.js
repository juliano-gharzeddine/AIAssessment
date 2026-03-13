"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function submitRequestAction(_, formData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in to submit a request." };
  }

  const source = formData.get("source");
  const message = (formData.get("message") || "").trim();

  if (!source) return { error: "Please select a source." };
  if (message.length < 50) return { error: "Message must be at least 50 characters." };

  const request = await db.request.create({
    data: {
      source,
      rawMessage: message,
      userId: session.user.id,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    await fetch(`${baseUrl}/api/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: request.id }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Failed to call processing pipeline", error);
  }

  return { success: true, ticketRef: request.id };
}
