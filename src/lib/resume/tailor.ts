import type { CandidateProfile, CandidateFact } from "@/types/candidate";
import type { Job } from "@/types/job";

export type TailoredResumeBullet = {
  sourceFactIds: string[];
  text: string;
  metrics?: string[];
};

export type TailoredResumeExperience = {
  company: string;
  role: string;
  dates: string;
  bullets: TailoredResumeBullet[];
};

export type TailoredResume = {
  professionalSummary: string;
  skills: string[];
  experience: TailoredResumeExperience[];
};

export type TailoredResumeValidation = {
  valid: boolean;
  errors: string[];
};

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase();
}

function skillMatches(profile: CandidateProfile, job: Job) {
  const profileSkillNames = new Set(profile.skills.map((skill) => normalizeSkill(skill.name)));
  const relevantSkills = [...new Set([...job.requiredSkills, ...job.preferredSkills].map((skill) => normalizeSkill(skill)))];

  return relevantSkills.filter((skill) => profileSkillNames.has(skill));
}

function pickRelevantFacts(profile: CandidateProfile, job: Job): CandidateFact[] {
  const matchedSkillNames = new Set(skillMatches(profile, job));

  return profile.candidateFacts
    .filter((fact) => fact.verified)
    .filter((fact) => {
      const factSkills = fact.skills.map((skill) => normalizeSkill(skill));
      return factSkills.some((skill) => matchedSkillNames.has(skill));
    })
    .slice(0, 6);
}

function buildProfessionalSummary(profile: CandidateProfile, job: Job) {
  const relevant = skillMatches(profile, job);
  const highlight = relevant.slice(0, 4).join(", ") || "platform engineering and developer enablement";

  return `Software engineer with experience building ${highlight} systems, improving release governance, and enabling teams to ship faster with more reliable delivery workflows.`;
}

function experienceFromFacts(facts: CandidateFact[]) {
  if (!facts.length) {
    return [];
  }

  return facts.reduce<Array<TailoredResumeExperience>>((acc, fact) => {
    const existing = acc.find((entry) => entry.company === fact.company && entry.role === fact.role);

    if (existing) {
      existing.bullets.push({
        sourceFactIds: [fact.id],
        text: fact.text,
        metrics: fact.metrics,
      });
      return acc;
    }

    acc.push({
      company: fact.company || "Previous employer",
      role: fact.role || "Engineer",
      dates: "Recent role",
      bullets: [{
        sourceFactIds: [fact.id],
        text: fact.text,
        metrics: fact.metrics,
      }],
    });
    return acc;
  }, []);
}

export function tailorResumeForJob({
  profile,
  job,
}: {
  profile: CandidateProfile;
  job: Job;
}): TailoredResume {
  const matchedSkills = skillMatches(profile, job);
  const facts = pickRelevantFacts(profile, job);

  return {
    professionalSummary: buildProfessionalSummary(profile, job),
    skills: matchedSkills.length ? matchedSkills : profile.skills.map((skill) => skill.name).slice(0, 12),
    experience: experienceFromFacts(facts),
  };
}

export function validateTailoredResume(
  resume: TailoredResume,
  profile: CandidateProfile,
): TailoredResumeValidation {
  const errors: string[] = [];

  if (!resume.professionalSummary || resume.professionalSummary.trim().length < 20) {
    errors.push("Professional summary is missing or too short.");
  }

  if (!resume.skills.length) {
    errors.push("No skills were selected for the tailored resume.");
  }

  if (!resume.experience.length) {
    errors.push("No experience entries were selected for the tailored resume.");
  }

  const validFactIds = new Set(profile.candidateFacts.filter((fact) => fact.verified).map((fact) => fact.id));

  for (const experience of resume.experience) {
    if (!experience.company || !experience.role) {
      errors.push("Each experience entry must include a company and role.");
    }

    for (const bullet of experience.bullets) {
      if (!bullet.text || !bullet.text.trim()) {
        errors.push("Every bullet must include text.");
      }

      if (!bullet.sourceFactIds.length) {
        errors.push("Every bullet must reference at least one verified fact ID.");
      }

      for (const factId of bullet.sourceFactIds) {
        if (!validFactIds.has(factId)) {
          errors.push(`Bullet references unknown fact ID: ${factId}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
