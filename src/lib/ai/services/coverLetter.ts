import type { CandidateProfile } from "@/types/candidate";
import type { Job } from "@/types/job";

import { coverLetterDraftSchema, type CoverLetterDraft } from "../schemas/coverLetter";

function extractHighlights(profile: CandidateProfile, job: Job): string[] {
  const skills = new Set(job.requiredSkills.concat(job.preferredSkills).map((skill) => skill.toLowerCase()));
  const matchedEntries = profile.workExperiences
    .flatMap((company) => company.roles)
    .flatMap((role) => role.bullets)
    .map((bullet) => ({
      text: bullet.text,
      keywords: bullet.skills?.join(" ") ?? "",
    }))
    .filter(({ text, keywords }) => {
      const haystack = `${text} ${keywords}`.toLowerCase();
      return [...skills].some((skill) => haystack.includes(skill));
    })
    .map(({ text }) => text);

  return Array.from(new Set(matchedEntries)).slice(0, 2);
}

export function buildCoverLetterDraft({
  profile,
  job,
}: {
  profile: CandidateProfile;
  job: Job;
}): CoverLetterDraft {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const primaryCompany = profile.workExperiences[0]?.company ?? "your previous employer";
  const strongestMatches = extractHighlights(profile, job);
  const firstMatch = strongestMatches[0] ?? "standardized CI/CD workflows and release governance systems.";
  const secondMatch = strongestMatches[1] ?? "led observability migration and developer enablement work across platform teams.";
  const sourceFactIds = profile.candidateFacts
    .filter((fact) => fact.verified)
    .filter((fact) => fact.company === primaryCompany || fact.role?.toLowerCase().includes("engineer") || fact.skills.some((skill) => job.requiredSkills.some((required) => required.toLowerCase() === skill.toLowerCase())))
    .map((fact) => fact.id)
    .slice(0, 6);

  const body = [
    `Dear Hiring Team,`,
    ``,
    `I am excited to apply for the ${job.title} role at ${job.company}. My background in software engineering, platform automation, and developer enablement aligns closely with the needs of the team at ${job.company}.`,
    ``,
    `In my work at ${primaryCompany}, I have focused on building and standardizing engineering systems that improve developer productivity and delivery reliability. ${firstMatch} ${secondMatch}`,
    ``,
    `This experience has shaped how I approach platform work: I value clear guardrails, scalable automation, and practical collaboration with product and engineering teams. I would welcome the opportunity to bring that perspective to ${job.company} and help drive a high-quality developer experience while supporting reliable delivery at scale.`,
    ``,
    `Thank you for your time and consideration. I would appreciate the opportunity to discuss how my experience can support ${job.company} and the ${job.title} team.`,
    ``,
    `Sincerely,`,
    fullName,
  ].join("\n");

  return coverLetterDraftSchema.parse({
    subject: `Application for ${job.title}`,
    body,
    sourceFactIds,
  });
}

export function generateCoverLetter({
  profile,
  job,
}: {
  profile: CandidateProfile;
  job: Job;
}): string {
  return buildCoverLetterDraft({ profile, job }).body;
}
