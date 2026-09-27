import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import PDFDocument from "pdfkit";

import type { CandidateProfile } from "@/types/candidate";
import type { Job } from "@/types/job";

export type ResumePdfInput = {
  profile: CandidateProfile;
  job: Job;
  outputDir?: string;
  fileName?: string;
};

export type ResumePdfResult = {
  format: "pdf";
  fileName: string;
  filePath: string;
  url: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "resume";
}

function buildResumeSections(profile: CandidateProfile, job: Job) {
  const relevantFacts = profile.candidateFacts.filter((fact) => fact.verified).slice(0, 4);

  return {
    header: `${profile.firstName} ${profile.lastName}`,
    subheader: [profile.city, profile.state, profile.country].filter(Boolean).join(", ") || "Remote-ready candidate",
    contact: [profile.email, profile.phone].filter(Boolean).join(" | "),
    links: [profile.linkedInUrl, profile.githubUrl].filter(Boolean).join(" | "),
    summary: profile.summary || "Software engineer focused on platform reliability, developer experience, and automation.",
    targetRole: `Target role: ${job.title}`,
    company: `Company: ${job.company}`,
    location: `Location: ${job.location.join(", ") || "Not specified"}`,
    remotePolicy: `Remote policy: ${job.remotePolicy}`,
    relevantFacts,
    skills: [...new Set(profile.skills.map((skill) => skill.name))].slice(0, 18),
  };
}

export async function generateResumePdfPreview({
  profile,
  job,
  outputDir = join(process.cwd(), "public", "generated"),
  fileName,
}: ResumePdfInput): Promise<ResumePdfResult> {
  await mkdir(outputDir, { recursive: true });

  const resolvedFileName = fileName || `${slugify(job.company)}-${slugify(job.title)}.pdf`;
  const filePath = join(outputDir, resolvedFileName);

  const sections = buildResumeSections(profile, job);
  const doc = new PDFDocument({ size: "LETTER", margin: 48 });

  await new Promise<void>((resolve, reject) => {
    const stream = createWriteStream(filePath);

    stream.on("finish", () => resolve());
    stream.on("error", reject);

    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(22).text(sections.header, { align: "left" });
    doc.font("Helvetica").fontSize(10).text(sections.subheader);
    doc.text(sections.contact);
    doc.text(sections.links);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(12).text(sections.targetRole);
    doc.text(sections.company);
    doc.text(sections.location);
    doc.text(sections.remotePolicy);
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(13).text("Summary");
    doc.font("Helvetica").fontSize(11).text(sections.summary, { align: "left" });
    doc.moveDown();

    doc.font("Helvetica-Bold").fontSize(13).text("Selected experience");
    sections.relevantFacts.forEach((fact) => {
      doc.font("Helvetica-Bold").fontSize(11).text(fact.role || "Role");
      doc.font("Helvetica").fontSize(10).text(fact.text, { align: "left" });

      if (fact.metrics.length) {
        doc.text(`Metrics: ${fact.metrics.join("; ")}`);
      }

      if (fact.skills.length) {
        doc.text(`Skills: ${fact.skills.join(", ")}`);
      }

      doc.moveDown(0.4);
    });

    doc.moveDown();
    doc.font("Helvetica-Bold").fontSize(13).text("Core skills");
    doc.font("Helvetica").fontSize(10).text(sections.skills.join(", "));

    doc.end();
  });

  return {
    format: "pdf",
    fileName: resolvedFileName,
    filePath,
    url: `/generated/${resolvedFileName}`,
  };
}
