"use client";

import { useEffect, useState } from "react";

import { createEmptyCandidateProfile } from "@/lib/candidate/profile";
import type { CandidateProfile } from "@/types/candidate";

export default function SettingsPage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => setProfile(data ?? createEmptyCandidateProfile()))
      .catch(() => setProfile(createEmptyCandidateProfile()));
  }, []);

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-slate-600">Loading settings…</p>
        </div>
      </main>
    );
  }

  const updateProfile = <K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Unable to save profile settings.");
      }
    } catch (error) {
      console.error("Profile settings save failed", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Profile settings</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Personal information</h1>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>First name</span>
            <input
              value={profile.firstName}
              onChange={(event) => updateProfile("firstName", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Last name</span>
            <input
              value={profile.lastName}
              onChange={(event) => updateProfile("lastName", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input
              type="email"
              value={profile.email}
              onChange={(event) => updateProfile("email", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input
              value={profile.phone ?? ""}
              onChange={(event) => updateProfile("phone", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>City</span>
            <input
              value={profile.city ?? ""}
              onChange={(event) => updateProfile("city", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>State</span>
            <input
              value={profile.state ?? ""}
              onChange={(event) => updateProfile("state", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>LinkedIn</span>
            <input
              value={profile.linkedInUrl ?? ""}
              onChange={(event) => updateProfile("linkedInUrl", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>GitHub</span>
            <input
              value={profile.githubUrl ?? ""}
              onChange={(event) => updateProfile("githubUrl", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Portfolio</span>
            <input
              value={profile.portfolioUrl ?? ""}
              onChange={(event) => updateProfile("portfolioUrl", event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-sky-500 focus:outline-none"
            />
          </label>
        </div>
      </div>
    </main>
  );
}
