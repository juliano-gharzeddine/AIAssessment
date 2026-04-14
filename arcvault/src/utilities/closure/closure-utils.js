import db from "@/lib/db";

async function execute(query, params = []) {
  try {
    return await db.$queryRawUnsafe(query, ...params);
  } catch (error) {
    console.error("Failed to execute closure dashboard query", error);
    return [];
  }
}

export async function get_closure_dashboard(employee_id, is_admin) {
  const results = await execute(`CALL sp_get_closure_dashboard(?, ?)`, [
    employee_id,
    is_admin ? 1 : 0,
  ]);

  return {
    stats: results?.[0]?.[0] || {},
    projects: results?.[1] || [],
    forms: results?.[2] || [],
    assignees: results?.[3] || [],
  };
}
