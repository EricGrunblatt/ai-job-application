import type { CandidateProfile } from "@/types/candidate";
import type { Job } from "@/types/job";

export interface JobMatchSummary {
  jobId: string;
  meetsHardRequirements: boolean;
  salaryMatch: boolean;
  locationMatch: boolean;
  roleMatch: boolean;
  matchedSkills: string[];
  partialMatches: string[];
  gaps: string[];
  reasons: string[];
  skillMatchScore: number;
}

function normalizeSkillName(value: string): string {
  return value.trim().toLowerCase();
}

function candidateSkillSet(profile: CandidateProfile): Set<string> {
  return new Set(profile.skills.map((skill) => normalizeSkillName(skill.name)));
}

export function calculateSkillMatchScore(profile: CandidateProfile, job: Job): number {
  const profileSkills = candidateSkillSet(profile);
  const relevantSkills = [...new Set(job.requiredSkills.concat(job.preferredSkills).map((skill) => normalizeSkillName(skill)))];

  if (relevantSkills.length === 0) {
    return 0;
  }

  const matchedSkillCount = relevantSkills.filter((skill) => profileSkills.has(skill)).length;
  return Math.round((matchedSkillCount / relevantSkills.length) * 100);
}

export function salaryRangeOverlaps(jobRange: { min: number; max: number }, filterMin: number, filterMax: number): boolean {
  return Math.max(jobRange.min, filterMin) <= Math.min(jobRange.max, filterMax);
}

function titleMatches(profile: CandidateProfile, job: Job): boolean {
  const target = profile.targetRoles.map((role) => normalizeSkillName(role));
  const jobTitle = normalizeSkillName(job.title);

  return target.some((role) => jobTitle.includes(role) || role.includes(jobTitle));
}

function locationMatches(profile: CandidateProfile, job: Job): boolean {
  const preferred = profile.preferredLocations.map((location) => location.toLowerCase());
  const jobLocation = job.location.join(" ").toLowerCase();

  if (job.remotePolicy === "remote") return true;
  if (preferred.some((location) => jobLocation.includes(location))) return true;
  return job.location.some((location) => location.toLowerCase().includes("remote"));
}

function salaryMatches(profile: CandidateProfile, job: Job): boolean {
  const minimum = profile.minimumSalary ?? 0;
  const salary = job.salary;

  if (!salary) return true;
  if (!salary.min && !salary.max) return true;
  const floor = salary.min ?? 0;
  const ceiling = salary.max ?? salary.min ?? 0;

  return ceiling >= minimum || floor >= minimum;
}

export function matchJobToProfile(profile: CandidateProfile, job: Job): JobMatchSummary {
  const profileSkills = candidateSkillSet(profile);
  const jobSkills = job.requiredSkills.concat(job.preferredSkills).map((skill) => skill.toLowerCase());
  const matchedSkills = jobSkills.filter((skill) => profileSkills.has(skill.toLowerCase()));
  const partialMatches = jobSkills.filter((skill) => !profileSkills.has(skill.toLowerCase()) && skill.length > 2).slice(0, 3);
  const skillMatchScore = calculateSkillMatchScore(profile, job);

  const roleMatch = titleMatches(profile, job);
  const locationMatch = locationMatches(profile, job);
  const salaryMatch = salaryMatches(profile, job);
  const meetsHardRequirements = roleMatch && locationMatch && salaryMatch && matchedSkills.length > 0;

  const gaps: string[] = [];
  if (!roleMatch) gaps.push("Role fit is not strongly aligned with your target titles.");
  if (!locationMatch) gaps.push("Location or remote policy does not align with your preferences.");
  if (!salaryMatch) gaps.push("Salary is below your minimum target.");
  if (matchedSkills.length === 0) gaps.push("No direct skill overlap found with the required skills.");

  const reasons: string[] = [];
  if (roleMatch) reasons.push("The role aligns with one of your target job families.");
  if (locationMatch) reasons.push("The location/remote policy fits your preferences.");
  if (salaryMatch) reasons.push("The salary meets or exceeds your minimum target.");
  if (matchedSkills.length > 0) reasons.push(`Strong alignment with your skill set: ${matchedSkills.slice(0, 4).join(", ")}.`);

  if (reasons.length === 0) {
    reasons.push("This opportunity may still be worth review, but there is not yet strong evidence from your profile.");
  }

  return {
    jobId: job.id,
    meetsHardRequirements,
    salaryMatch,
    locationMatch,
    roleMatch,
    matchedSkills: [...new Set(matchedSkills)],
    partialMatches: [...new Set(partialMatches)],
    gaps,
    reasons,
    skillMatchScore,
  };
}
