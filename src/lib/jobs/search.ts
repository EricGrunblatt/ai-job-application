import type { Job } from "@/types/job";

export type JobSearchCriteria = {
  roles?: string[];
  locations?: string[];
  minimumBaseSalary?: number;
  remotePolicy?: "remote" | "hybrid" | "onsite" | "unknown";
  preferredSkills?: string[];
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

export function searchJobs(criteria: JobSearchCriteria, jobs: Job[]): Job[] {
  const roles = (criteria.roles ?? []).map(normalizeText).filter(Boolean);
  const locations = (criteria.locations ?? []).map(normalizeText).filter(Boolean);
  const preferredSkills = (criteria.preferredSkills ?? []).map(normalizeText).filter(Boolean);
  const minimumBaseSalary = criteria.minimumBaseSalary ?? 0;

  return jobs
    .filter((job) => {
      const title = normalizeText(job.title);
      const haystack = `${title} ${job.company} ${job.description}`.toLowerCase();
      const roleMatch = roles.length === 0 || roles.some((role) => haystack.includes(role) || title.includes(role));

      const locationMatch = locations.length === 0 || job.location.some((location) => {
        const normalizedLocation = normalizeText(location);
        return locations.some((locationQuery) => normalizedLocation.includes(locationQuery) || locationQuery.includes(normalizedLocation));
      });

      const remotePolicyMatch = !criteria.remotePolicy || job.remotePolicy === criteria.remotePolicy || criteria.remotePolicy === "unknown";

      const salaryFloor = job.salary?.min ?? job.salary?.max ?? 0;
      const salaryMatch = salaryFloor >= minimumBaseSalary || minimumBaseSalary === 0;

      const preferredSkillMatch = preferredSkills.length === 0 || preferredSkills.some((skill) => {
        const skillText = normalizeText(skill);
        return job.requiredSkills.some((value) => normalizeText(value).includes(skillText) || skillText.includes(normalizeText(value)))
          || job.preferredSkills.some((value) => normalizeText(value).includes(skillText) || skillText.includes(normalizeText(value)))
          || haystack.includes(skillText);
      });

      return roleMatch && locationMatch && remotePolicyMatch && salaryMatch && preferredSkillMatch;
    })
    .sort((a, b) => {
      const aSalary = a.salary?.min ?? a.salary?.max ?? 0;
      const bSalary = b.salary?.min ?? b.salary?.max ?? 0;
      return bSalary - aSalary;
    });
}
