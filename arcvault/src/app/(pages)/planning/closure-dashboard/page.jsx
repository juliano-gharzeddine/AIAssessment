import { auth } from "@/lib/auth";
import ClosureDashboardClient from "./closure-dashboard-client";
import { get_closure_dashboard } from "@/utilities/closure/closure-utils";

const ADMIN_DEPARTMENTS = new Set(["finance", "contracts", "hr"]);

function isAdminUser(session) {
  const role = String(session?.user?.role || "").toLowerCase();
  const department = String(session?.user?.departmentSlug || "").toLowerCase();

  return role.includes("pa") || role.includes("equivalent") || ADMIN_DEPARTMENTS.has(department);
}

async function getUserRole() {
  const session = await auth();
  return {
    employee_id: session?.user?.id ?? null,
    isPAOrEquicalent: isAdminUser(session),
  };
}

export default async function ClosureDashboardPage() {
  const { employee_id, isPAOrEquicalent } = await getUserRole();
  const data = employee_id
    ? await get_closure_dashboard(employee_id, isPAOrEquicalent)
    : { stats: {}, projects: [], forms: [], assignees: [] };

  return <ClosureDashboardClient {...data} />;
}
