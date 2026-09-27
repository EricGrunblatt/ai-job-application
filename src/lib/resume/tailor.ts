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

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
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
    .map((fact) => {
      const factText = normalizeText(`${fact.text} ${fact.skills.join(" ")}`);
      const factSkillMatches = fact.skills
        .map((skill) => normalizeSkill(skill))
        .filter((skill) => matchedSkillNames.has(skill)).length;
      const jobWordMatches = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])]
        .map((skill) => skill.toLowerCase())
        .filter((skill) => factText.includes(skill.toLowerCase())).length;

      return { fact, score: factSkillMatches + jobWordMatches };
    })
    .filter(({ fact, score }) => fact.skills.some((skill) => matchedSkillNames.has(normalizeSkill(skill))) || score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ fact }) => fact);
}

function buildProfessionalSummary(profile: CandidateProfile, job: Job) {
  const relevant = skillMatches(profile, job);
  const highlight = relevant.slice(0, 4).join(", ") || "platform engineering and developer enablement";
  const jobKeywords = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])]
    .filter((keyword) => keyword && relevant.some((skill) => normalizeSkill(skill) === normalizeSkill(keyword)))
    .slice(0, 4);
  const keywordPhrase = jobKeywords.length ? jobKeywords.join(", ") : highlight;

  return `Software engineer with hands-on experience in ${keywordPhrase}, release governance, and developer platform optimization. Experienced in ${job.title}, CI/CD workflows, deployment automation, and platform reliability across high-scale engineering environments.`;
}

function prioritizeKeywordText(text: string, job: Job) {
  const keywordTerms = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])]
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword && text.toLowerCase().includes(keyword.toLowerCase()));

  if (!keywordTerms.length) {
    return text;
  }

  const topKeywords = keywordTerms.slice(0, 3).join(", ");
  return `${topKeywords}: ${text}`;
}

function experienceFromFacts(facts: CandidateFact[], job: Job) {
  if (!facts.length) {
    return [];
  }

  return facts.reduce<Array<TailoredResumeExperience>>((acc, fact) => {
    const existing = acc.find((entry) => entry.company === fact.company && entry.role === fact.role);
    const optimizedText = prioritizeKeywordText(fact.text, job);

    if (existing) {
      existing.bullets.push({
        sourceFactIds: [fact.id],
        text: optimizedText,
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
        text: optimizedText,
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
  const jobSkillPriority = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])];
  const sortedSkills = [...new Set(matchedSkills.map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1)))].sort((a, b) => {
    const aWeight = jobSkillPriority.findIndex((skill) => normalizeSkill(skill) === normalizeSkill(a));
    const bWeight = jobSkillPriority.findIndex((skill) => normalizeSkill(skill) === normalizeSkill(b));
    return (aWeight === -1 ? Number.MAX_SAFE_INTEGER : aWeight) - (bWeight === -1 ? Number.MAX_SAFE_INTEGER : bWeight);
  });

  return {
    professionalSummary: buildProfessionalSummary(profile, job),
    skills: sortedSkills.length ? sortedSkills : profile.skills.map((skill) => skill.name).slice(0, 12),
    experience: experienceFromFacts(facts, job),
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
