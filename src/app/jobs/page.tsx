"use client";

import { useState } from "react";
import { sampleJob } from "@/lib/jobs/sample";

function formatLabel(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function formatDate(value: string | undefined) {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const jobQueue = [
  sampleJob,
  {
    ...sampleJob,
    id: "job-demo-2",
    company: "Signal Forge",
    title: "Senior Site Reliability Engineer",
    description:
      "Lead reliability improvements, observability strategy, and operational automation across production systems in a cloud-native environment.",
    salary: { min: 185000, max: 220000, currency: "USD", period: "annual" },
    requiredSkills: ["Kubernetes", "Observability", "Terraform", "Go"],
    preferredSkills: ["Grafana", "Prometheus", "AWS", "Leadership"],
    publishedAt: "2026-09-20T00:00:00Z",
  },
  {
    ...sampleJob,
    id: "job-demo-3",
    company: "North Harbor",
    title: "DevOps Engineer",
    description:
      "Own CI/CD pipelines, configuration management, and infrastructure reliability for product teams shipping customer-facing services.",
    salary: { min: 145000, max: 180000, currency: "USD", period: "annual" },
    requiredSkills: ["GitHub Actions", "Docker", "AWS", "Linux"],
    preferredSkills: ["Python", "Terraform", "Monitoring"],
    publishedAt: "2026-09-18T00:00:00Z",
  },
];

export default function JobsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [criteria, setCriteria] = useState({
    roles: "Senior Platform Engineer, Senior Software Engineer",
    locations: "Remote - United States",
    remote: "Remote",
    salary: "150000",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchMessage, setLastSearchMessage] = useState("No search run yet");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const currentCriteria = {
    roles: criteria.roles
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    locations: criteria.locations
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    remote: criteria.remote,
    salary: criteria.salary ? `$${Number(criteria.salary).toLocaleString()}+` : "No minimum",
  };

  const allSelected = selectedIds.length === jobQueue.length && jobQueue.length > 0;

  const handleAiSearch = () => {
    setIsSearching(true);
    setLastSearchMessage("AI is scanning for jobs…");
    setCurrentPage(1);

    window.setTimeout(() => {
      setIsSearching(false);
      setLastSearchMessage(`Last AI search: ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`);
    }, 1000);
  };

  const totalPages = Math.max(1, Math.ceil(jobQueue.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedJobs = jobQueue.slice(
    (currentPageSafe - 1) * pageSize,
    currentPageSafe * pageSize,
  );

  const toggleSelect = (jobId: string) => {
    setSelectedIds((current) =>
      current.includes(jobId) ? current.filter((id) => id !== jobId) : [...current, jobId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) => (current.length === jobQueue.length ? [] : jobQueue.map((job) => job.id)));
  };

  const selectedCount = selectedIds.length;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
              Job review queue
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Opportunities</h1>
            <p className="mt-2 text-lg text-slate-600">
              Review matches, decide to apply or pass, and batch-select several roles at once.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Selected: {selectedCount}</div>
            <div>Batch actions ready</div>
          </div>
        </div>

        <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Job search criteria</h2>
            <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
              Editable
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Roles</span>
              <textarea
                value={criteria.roles}
                onChange={(event) => setCriteria((current) => ({ ...current, roles: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="Senior Platform Engineer, Senior Software Engineer"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Locations</span>
              <textarea
                value={criteria.locations}
                onChange={(event) => setCriteria((current) => ({ ...current, locations: event.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="Remote - United States, New York City"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Remote policy</span>
              <select
                value={criteria.remote}
                onChange={(event) => setCriteria((current) => ({ ...current, remote: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
                <option value="Any">Any</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1.5 block">Minimum salary</span>
              <input
                type="number"
                min="0"
                step="5000"
                value={criteria.salary}
                onChange={(event) => setCriteria((current) => ({ ...current, salary: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                placeholder="150000"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold">Roles:</span> {currentCriteria.roles.join(", ") || "Not set"}
            </div>
            <div>
              <span className="font-semibold">Locations:</span> {currentCriteria.locations.join(", ") || "Not set"}
            </div>
            <div>
              <span className="font-semibold">Remote:</span> {currentCriteria.remote}
            </div>
            <div>
              <span className="font-semibold">Minimum salary:</span> {currentCriteria.salary}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleAiSearch}
              disabled={isSearching}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
            >
              {isSearching ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Searching…
                </>
              ) : (
                <>
                  <span className="inline-block h-4 w-4 rounded-full bg-white/20" />
                  Search with AI
                </>
              )}
            </button>

            <div className="text-sm text-slate-600">{lastSearchMessage}</div>
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200" />
              <svg
                viewBox="0 0 16 16"
                className="absolute h-3.5 w-3.5 fill-none stroke-white stroke-[2.5] opacity-0 transition peer-checked:opacity-100"
                aria-hidden="true"
              >
                <path d="M3.5 8.5 6.5 11.5 12.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Select all jobs
          </label>
          <div className="flex gap-2">
            <button className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Skip selected
            </button>
            <button className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
              Apply selected
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <label htmlFor="page-size" className="font-medium">
              Results per page
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(event) => {
                const nextSize = Number(event.target.value);
                setPageSize(nextSize);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-700">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPageSafe === 1}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <span className="min-w-20 text-center font-medium">
              Page {currentPageSafe} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPageSafe === totalPages}
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {paginatedJobs.map((job) => {
            const isSelected = selectedIds.includes(job.id);

            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <span className="relative inline-flex h-5 w-5 items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(job.id)}
                        className="peer sr-only"
                      />
                      <span className="absolute inset-0 rounded-md border border-slate-300 bg-white transition peer-checked:border-sky-600 peer-checked:bg-sky-600 peer-focus-visible:ring-4 peer-focus-visible:ring-sky-200" />
                      <svg
                        viewBox="0 0 16 16"
                        className="absolute h-3.5 w-3.5 fill-none stroke-white stroke-[2.5] opacity-0 transition peer-checked:opacity-100"
                        aria-hidden="true"
                      >
                        <path d="M3.5 8.5 6.5 11.5 12.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    Select
                  </label>

                  <div className="flex gap-2">
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 hover:bg-rose-100">
                      Deny
                    </button>
                    <button className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white hover:bg-emerald-700">
                      Apply
                    </button>
                  </div>
                </div>

                <div className="mb-5 flex items-start justify-between gap-6 border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700">
                      {formatLabel(job.source, "Source")}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{job.title}</h2>
                    <p className="mt-1 text-lg text-slate-600">
                      {job.company} · {job.location.join(", ")}
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                    <div className="font-semibold">{formatLabel(job.remotePolicy, "Unknown")}</div>
                    <div>{formatLabel(job.employmentType, "Unknown")}</div>
                  </div>
                </div>

                <section className="grid gap-6 md:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Salary
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {job.salary?.min && job.salary?.max
                        ? `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`
                        : job.salary?.min
                          ? `$${job.salary.min.toLocaleString()}+`
                          : "Not disclosed"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Seniority
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      {formatLabel(job.seniority, "Not specified")}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Posted
                    </div>
                    <div className="mt-2 text-lg font-semibold">{formatDate(job.publishedAt)}</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Match
                    </div>
                    <div className="mt-2 text-lg font-semibold">Strong fit</div>
                  </div>
                </section>

                <section className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <h3 className="text-lg font-semibold">Why it matches</h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
                      <li>Strong alignment with platform and cloud infrastructure work.</li>
                      <li>Remote-first role with salary above your preferred threshold.</li>
                      <li>Relevant CI/CD and infrastructure tooling overlap.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-lg font-semibold">Required skills</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
