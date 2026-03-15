"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import db from "@/lib/db";

async function getRequestOrigin() {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return null;
  }

  return `${protocol}://${host}`;
}

export async function submitRequestAction(_, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Please sign in to submit a request." };
  }

  if (session.user.role !== "CUSTOMER") {
    return { error: "Only customer accounts can submit tickets." };
  }

  const sourceValue = formData.get("source");
  const messageValue = formData.get("message");

  const source = typeof sourceValue === "string" ? sourceValue : "";
  const message = typeof messageValue === "string" ? messageValue.trim() : "";

  if (!source) {
    return { error: "Please select a source." };
  }

  if (message.length < 50) {
    return { error: "Message must be at least 50 characters." };
  }

  if (message.length > 1500) {
    return { error: "Message cannot exceed 1500 characters." };
  }

  const request = await db.request.create({
    data: {
      source,
      rawMessage: message,
      userId: session.user.id,
    },
  });

  const origin = await getRequestOrigin();

  if (origin) {
    try {
      await fetch(`${origin}/api/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: request.id }),
        cache: "no-store",
      });
    } catch (error) {
      console.error("Failed to call processing pipeline", error);
    }
  }

  return { success: true, ticketRef: request.id };
}