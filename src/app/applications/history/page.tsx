"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ApplicationRecord } from "@/lib/applications/service";

export default function ApplicationHistoryPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/applications");
        const payload = (await response.json()) as { ok?: boolean; applications?: ApplicationRecord[] };
        setApplications(payload.applications ?? []);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Application history</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Saved review records</h1>
          </div>
          <Link href="/applications" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Back to dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
            Loading application history…
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
            No applications saved yet. Review a job and save the package to create the first record.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <article key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{application.status}</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{application.jobTitle}</h2>
                    <p className="mt-1 text-lg text-slate-600">{application.company}</p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                      application.approved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {application.approved ? "Approved" : "Awaiting approval"}
                  </span>
                </div>

                <dl className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-500">Created</dt>
                    <dd className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Location</dt>
                    <dd className="mt-1">{application.location.length ? application.location.join(", ") : "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Salary</dt>
                    <dd className="mt-1">
                      {application.salaryMin && application.salaryMax
                        ? `$${application.salaryMin.toLocaleString()} - $${application.salaryMax.toLocaleString()}`
                        : "Not disclosed"}
                    </dd>
                  </div>
                </dl>

                {(application.resumePdfUrl || application.coverLetterPdfUrl) && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {application.resumePdfUrl ? (
                      <a href={application.resumePdfUrl} target="_blank" rel="noreferrer" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">
                        View resume PDF
                      </a>
                    ) : null}
                    {application.coverLetterPdfUrl ? (
                      <a href={application.coverLetterPdfUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        View cover letter PDF
                      </a>
                    ) : null}
                  </div>
                )}

                {application.notes ? (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    {application.notes}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
