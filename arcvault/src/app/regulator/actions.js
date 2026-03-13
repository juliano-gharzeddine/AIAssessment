"use server";

import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function routeRecordAction({ recordId, departmentId, reviewNotes }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "REGULATOR") return;

  await db.processedRecord.update({
    where: { id: recordId },
    data: {
      status: "MANUALLY_ROUTED",
      departmentId,
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      reviewNotes: reviewNotes?.trim() || null,
    },
  });

  revalidatePath("/regulator");
}
