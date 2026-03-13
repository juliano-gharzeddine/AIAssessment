import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegulatorPage() {
  const session = await auth();

  if (!session || session.user.role !== "REGULATOR") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900">Regulator Dashboard</h1>
      <p className="text-gray-500 mt-1">Review and route flagged requests</p>
    </div>
  );
}