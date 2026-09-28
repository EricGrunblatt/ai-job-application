"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createEmptyCandidateProfile } from "@/lib/candidate/profile";
import { parseResumeTextToProfile } from "@/lib/candidate/resumeImport";
import type { CandidateProfile } from "@/types/candidate";

async function extractTextFromPdf(file: File): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${"3.11.174"}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const chunks: string[] = [];

  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    chunks.push(
      content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" "),
    );
  }

  return chunks.join("\n");
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyCandidateProfile());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF resume so the app can extract the profile data accurately.");
      return;
    }

    setFileName(selectedFile.name);
    setError("");
    setIsLoading(true);

    try {
      const extractedText = await extractTextFromPdf(selectedFile);
      const importedProfile = parseResumeTextToProfile(extractedText, profile);
      setProfile(importedProfile);
    } catch (fileError) {
      console.error("Resume PDF parsing failed", fileError);
      setError("The PDF could not be processed. Please try another file or enter the profile information manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Profile could not be saved.");
      }

      router.push("/profile");
    } catch (saveError) {
      console.error("Onboarding profile save failed", saveError);
      setError("Your profile could not be saved yet. Please review and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Onboarding</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create your candidate profile</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Upload your resume PDF. The app will extract the candidate information and fill in your profile so you can review and edit it before you begin searching for jobs.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold">1. Upload a resume PDF</h2>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {isLoading ? "Extracting profile…" : "Choose resume PDF"}
              </button>
              {fileName ? (
                <p className="mt-3 text-sm text-slate-600">Selected file: {fileName}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No PDF selected yet.</p>
              )}
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
              <p className="font-semibold">What happens next</p>
              <ol className="mt-2 list-decimal space-y-2 pl-5">
                <li>The PDF text is extracted and parsed.</li>
                <li>Your contact, skills, roles, and education are filled in.</li>
                <li>You review and correct the profile before continuing.</li>
              </ol>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold">2. Review extracted profile</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">First name</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{profile.firstName || "—"}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Last name</div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">{profile.lastName || "—"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Email</div>
                <div className="mt-1 text-base font-medium text-slate-900">{profile.email || "—"}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Skills detected</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.skills.length ? (
                    profile.skills.slice(0, 12).map((skill) => (
                      <span key={`${skill.category}-${skill.name}`} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                        {skill.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600">No skills detected yet.</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Summary</div>
                <div className="mt-2 text-slate-700">{profile.summary || "No summary imported yet."}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Continue to profile editor
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
