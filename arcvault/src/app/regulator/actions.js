"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function routeRecordAction({ recordId, departmentId, reviewerId }) {
  await db.processedRecord.update({
    where: { id: recordId },
    data: {
      status: "MANUALLY_ROUTED",
      departmentId,
      reviewedAt: new Date(),
      reviewedById: reviewerId,
    },
  });

  revalidatePath("/regulator");
}
