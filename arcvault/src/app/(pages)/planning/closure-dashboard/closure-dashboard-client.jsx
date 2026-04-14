"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";

const FILTERS = ["ALL PROJECTS", "IN PROGRESS", "CLOSED"];

const statusStyles = {
  "Not Closed": "bg-slate-100 text-slate-700",
  "In Progress": "bg-amber-100 text-amber-700",
  Closed: "bg-emerald-100 text-emerald-700",
};

const instanceStyles = {
  submitted: "bg-emerald-100 text-emerald-700",
  "in progress": "bg-amber-100 text-amber-700",
  "not started": "bg-slate-100 text-slate-700",
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getFormStatus(form) {
  if (!form?.total_assignees) return "Not Started";
  if (Number(form.submitted_count) >= Number(form.total_assignees)) return "Complete";
  if (Number(form.submitted_count) > 0 || Number(form.in_progress_count) > 0) {
    return "In Progress";
  }
  return "Not Started";
}

export default function ClosureDashboardClient({ stats = {}, projects = [], forms = [], assignees = [] }) {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [openProjects, setOpenProjects] = useState({});
  const [openForms, setOpenForms] = useState({});

  const formsByClosure = useMemo(() => {
    return forms.reduce((acc, form) => {
      if (Number(form.can_view) === 0) return acc;
      const key = String(form.closure_id);
      if (!acc[key]) acc[key] = [];
      acc[key].push(form);
      return acc;
    }, {});
  }, [forms]);

  const assigneesByForm = useMemo(() => {
    return assignees.reduce((acc, assignee) => {
      const key = `${assignee.closure_id}:${assignee.form_type_id}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(assignee);
      return acc;
    }, {});
  }, [assignees]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "IN PROGRESS") return projects.filter((p) => p.closure_status === "In Progress");
    if (activeFilter === "CLOSED") return projects.filter((p) => p.closure_status === "Closed");
    return projects;
  }, [activeFilter, projects]);

  return (
    <div className="space-y-6 p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 text-sm md:grid-cols-5">
          {[
            ["Total Projects", stats.total_projects],
            ["Closed", stats.closed_count],
            ["In Progress", stats.in_progress_count],
            ["Not Closed", stats.not_closed_count],
            ["Overall Completion %", `${stats.overall_progress_percentage ?? 0}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition ${
              activeFilter === filter ? "bg-red-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="space-y-4">
        {filteredProjects.map((project) => {
          const projectOpen = openProjects[project.project_id] ?? true;
          const projectForms = formsByClosure[String(project.closure_id)] || [];

          return (
            <article key={project.project_id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenProjects((prev) => ({ ...prev, [project.project_id]: !(prev[project.project_id] ?? true) }))
                    }
                    className="rounded-lg bg-red-600 p-2 text-white"
                  >
                    {projectOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <div>
                    <p className="text-sm font-bold text-red-600">{project.project_code}</p>
                    <p className="text-base font-semibold text-slate-900">{project.project_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    href={`/planning/project/closure/${project.project_id}`}
                  >
                    OPEN CLOSURE ↗
                  </Link>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[project.closure_status] || statusStyles["Not Closed"]}`}>
                    {project.closure_status || "Not Closed"}
                  </span>
                </div>
              </header>

              {projectOpen && (
                <div className="grid gap-6 p-4 lg:grid-cols-[260px,1fr,260px]">
                  <div className="space-y-3 rounded-lg bg-slate-50 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Checklist Status</h4>
                    <p className="text-sm text-slate-700">✅ Done: {project.done_count ?? 0}</p>
                    <p className="text-sm text-slate-700">⏳ WIP: {project.wip_count ?? 0}</p>
                    <p className="text-sm text-slate-700">⚪ Not Started: {project.not_started_count ?? 0}</p>
                    <div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-red-600" style={{ width: `${project.progress_percentage ?? 0}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-600">{project.progress_percentage ?? 0}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Assessment Forms</h4>
                    {projectForms.map((form) => {
                      const formKey = `${project.project_id}:${form.form_type_id}`;
                      const isOpen = openForms[formKey] ?? false;
                      const entries = assigneesByForm[`${form.closure_id}:${form.form_type_id}`] || [];

                      return (
                        <div key={form.form_type_id} className="rounded-md border border-slate-200 bg-white">
                          <button
                            type="button"
                            onClick={() => setOpenForms((prev) => ({ ...prev, [formKey]: !(prev[formKey] ?? false) }))}
                            className="flex w-full items-center justify-between p-3 text-left"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{form.form_type_name}</p>
                              <p className="text-xs text-slate-500">
                                {form.submitted_count ?? 0} / {form.total_assignees ?? 0} submitted
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                                {getFormStatus(form)}
                              </span>
                              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="space-y-2 border-t border-slate-100 p-3">
                              {entries.map((entry) => {
                                const raw = String(entry.instance_status || "not started").toLowerCase();
                                const displayName =
                                  entry.subject_type === "pm_only" ? entry.subject_employee_name : entry.employee_name;

                                return (
                                  <div key={entry.assignee_id} className="flex items-center justify-between gap-3 text-sm">
                                    <div className="flex min-w-0 items-center gap-2">
                                      {entry.employee_picture ? (
                                        <img
                                          src={entry.employee_picture}
                                          alt={displayName}
                                          className="h-8 w-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                                          {initials(displayName)}
                                        </div>
                                      )}
                                      <span className="truncate text-slate-800">{displayName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`rounded-full px-2 py-1 text-xs ${instanceStyles[raw] || instanceStyles["not started"]}`}>
                                        {entry.instance_status || "not_started"}
                                      </span>
                                      {raw === "submitted" && (
                                        <Link href={`/planning/project/closure/${project.project_id}/form/${entry.instance_id}`}>
                                          <Eye size={16} className="text-slate-600" />
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2 rounded-lg bg-slate-50 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Activity History</h4>
                    <div className="flex items-center gap-2">
                      {project.last_modified_by_picture ? (
                        <img
                          src={project.last_modified_by_picture}
                          alt={project.last_modified_by}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {initials(project.last_modified_by || "N/A")}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{project.last_modified_by || "No activity"}</p>
                        <p className="text-xs text-slate-500">{project.last_modified_at || "No recent updates"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
