"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markResolvedAction(recordId) {
  await db.processedRecord.update({
    where: { id: recordId },
    data: { status: "RESOLVED" },
  });

  revalidatePath("/dashboard");
}
