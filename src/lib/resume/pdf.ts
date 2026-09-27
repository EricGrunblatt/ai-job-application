import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import PDFDocument from "pdfkit";

import type { CandidateProfile, CompanyExperience } from "@/types/candidate";
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

function formatDateRange(startDate?: string, endDate?: string, current = false) {
  const formatDate = (value?: string) => {
    if (!value) return "";

    const safeDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(safeDate.getTime())) return value;

    return safeDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const start = formatDate(startDate);
  const end = current ? "Present" : formatDate(endDate);

  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

function groupSkillsByCategory(profile: CandidateProfile, job: Job) {
  const categoryMap = new Map<string, string[]>();
  const jobSkillTerms = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])].map((skill) => skill.toLowerCase());

  for (const skill of profile.skills) {
    const category = skill.category || "Additional Skills";
    const values = categoryMap.get(category) ?? [];
    values.push(skill.name);
    categoryMap.set(category, values);
  }

  const orderedEntries = [...categoryMap.entries()].map(([category, names]) => {
    const relevantNames = names.filter((name) => {
      const candidate = name.toLowerCase();
      return jobSkillTerms.some((term) => candidate.includes(term) || term.includes(candidate));
    });

    return {
      category,
      names: relevantNames.length ? relevantNames.slice(0, 6) : names.slice(0, 4),
    };
  });

  return orderedEntries
    .filter((entry) => entry.names.length > 0)
    .sort((a, b) => {
      const order = ["Languages", "Platforms & DevOps", "Observability & Monitoring", "Frameworks & Databases", "Cloud & Tools"];
      return (order.indexOf(a.category) === -1 ? 999 : order.indexOf(a.category)) - (order.indexOf(b.category) === -1 ? 999 : order.indexOf(b.category));
    })
    .slice(0, 5);
}

function pickRelevantExperience(profile: CandidateProfile, job: Job) {
  const normalizedJobSkills = new Set(
    [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])].map((skill) => skill.toLowerCase()),
  );

  const allExperience = profile.workExperiences.flatMap((company) =>
    company.roles.map((role) => ({ company, role })),
  );

  const filtered = allExperience.filter(({ role }) => {
    const roleText = [role.title, ...(role.bullets ?? []).map((bullet) => bullet.text)]
      .join(" ")
      .toLowerCase();

    const hasSkillMatch = [...normalizedJobSkills].some((skill) => roleText.includes(skill));
    return hasSkillMatch || role.title.toLowerCase().includes(job.title.toLowerCase().split(" ")[0] ?? "");
  });

  return filtered.length ? filtered : allExperience.slice(0, 3);
}

export function buildResumeSections(profile: CandidateProfile, job: Job) {
  const experienceEntries = pickRelevantExperience(profile, job);
  const groupedSkills = groupSkillsByCategory(profile, job);

  return {
    name: `${profile.firstName} ${profile.lastName}`,
    contactLine: [
      profile.phone,
      profile.city && profile.state ? `${profile.city}, ${profile.state}` : profile.city ?? profile.state,
      profile.email,
      profile.linkedInUrl,
      profile.githubUrl,
    ].filter(Boolean).join(" ▪ "),
    skills: groupedSkills,
    experience: experienceEntries.map(({ company, role }) => ({
      company: company.company,
      title: role.title,
      location: company.location || role.location || "",
      dateRange: formatDateRange(role.startDate, role.endDate, Boolean(role.current)),
      bullets: role.bullets.map((bullet) => bullet.text),
      teamName: role.location || "",
    })),
    education: profile.education.map((entry) => ({
      school: entry.school,
      location: entry.location,
      degree: entry.degree,
      major: entry.major,
      graduationDate: entry.graduationDate,
      gpa: entry.gpa,
    })),
    referenceTemplate: profile.resumeReferenceText,
    targetJob: job.title,
    targetCompany: job.company,
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

    doc.font("Helvetica-Bold").fontSize(20).text(sections.name, { align: "left" });
    doc.font("Helvetica").fontSize(9).text(sections.contactLine, { align: "left" });
    doc.moveDown(0.35);

    doc.font("Helvetica-Bold").fontSize(12).text("Skills");
    doc.moveDown(0.15);

    const skillEntries = sections.skills.slice(0, 5);
    if (skillEntries.length) {
      skillEntries.forEach(({ category, names }, index) => {
        doc.font("Helvetica-Bold").fontSize(9).text(`${category}: `, { continued: true });
        doc.font("Helvetica").fontSize(9).text(names.join(", "));
        if (index < skillEntries.length - 1) {
          doc.moveDown(0.08);
        }
      });
    }

    doc.moveDown(0.35);
    doc.font("Helvetica-Bold").fontSize(12).text("Experience");

    sections.experience.forEach((experience) => {
      const dateText = experience.dateRange ? ` ${experience.dateRange}` : "";
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").fontSize(10).text(`${experience.company} — ${experience.title}${dateText}`);
      if (experience.location) {
        doc.font("Helvetica").fontSize(9).text(experience.location, { indent: 0 });
      }

      experience.bullets.slice(0, 3).forEach((bullet) => {
        doc.font("Helvetica").fontSize(9).text(`• ${bullet}`);
      });
    });

    if (sections.education.length) {
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(12).text("Education");
      sections.education.forEach((entry) => {
        doc.moveDown(0.2);
        doc.font("Helvetica-Bold").fontSize(10).text(entry.school);
        if (entry.location) {
          doc.font("Helvetica").fontSize(9).text(entry.location);
        }
        if (entry.degree || entry.major) {
          const degreeLine = [entry.degree, entry.major].filter(Boolean).join(": ");
          doc.font("Helvetica").fontSize(9).text(degreeLine);
        }
        if (entry.graduationDate) {
          const graduationText = new Date(`${entry.graduationDate}T00:00:00`).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          doc.font("Helvetica").fontSize(9).text(`Graduated ${graduationText}`);
        }
      });
    }

    doc.end();
  });

  return {
    format: "pdf",
    fileName: resolvedFileName,
    filePath,
    url: `/generated/${resolvedFileName}`,
  };
}
