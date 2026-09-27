import { createEmptyCandidateProfile } from "@/lib/candidate/profile";
import type { CandidateProfile, CandidateSkill, CompanyExperience, EducationEntry } from "@/types/candidate";

const EMAIL_PATTERN = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const PHONE_PATTERN = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
const TITLE_PATTERN = /(?:^|\s)(Senior|Staff|Principal|Lead|Engineer|Developer|Manager|Director|Analyst|Architect|Associate|Intern)\b/i;
const CITY_PATTERN = /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})\b/;

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").replace(/\s+/g, " ").trim();
}

function splitLines(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractName(cleanText: string): { firstName: string; lastName: string } {
  const firstLine = splitLines(cleanText)[0] ?? "";

  if (!firstLine) {
    return { firstName: "", lastName: "" };
  }

  const parts = firstLine.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  return { firstName: parts[0] ?? "", lastName: "" };
}

function extractSkills(text: string): CandidateSkill[] {
  const skillMatch = text.match(/(?:^|\n)\s*(?:Skills|Core Skills|Technical Skills)\s*:?\s*\n+([\s\S]*?)(?=\n\s*(?:Experience|Work Experience|Education|Projects|Certifications|Summary|Profile)\b|$)/i);
  const listText = skillMatch?.[1] ?? text;

  const candidates = listText
    .split(/[\n,|]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => !/^(?:experience|education|projects|certifications|summary|profile)$/i.test(value))
    .filter((value) => value.length > 1)
    .filter((value) => !/\b(?:jane|doe|acme|corp|company|university|college|software engineer|new york|ny)\b/i.test(value));

  const unique = new Set<string>();
  const skills: CandidateSkill[] = [];

  for (const value of candidates) {
    const normalized = value.replace(/^[•\-\d.\s]+/, "").trim();
    if (!normalized || unique.has(normalized.toLowerCase())) continue;

    unique.add(normalized.toLowerCase());
    skills.push({ name: normalized, category: "Imported" });
  }

  return skills;
}

function extractContactInfo(text: string): { email?: string; phone?: string; city?: string } {
  const emailMatch = text.match(EMAIL_PATTERN);
  const phoneMatch = text.match(PHONE_PATTERN);

  const cityMatch = text.match(CITY_PATTERN) ?? text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2}\b/);

  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    city: cityMatch?.[0],
  };
}

function extractCompanyExperiences(text: string): CompanyExperience[] {
  const lines = splitLines(text);
  const companyExperiences: CompanyExperience[] = [];

  let inExperienceSection = false;
  let currentCompany: CompanyExperience | null = null;
  let currentRole: { title: string; startDate?: string; endDate?: string; current?: boolean; bullets: Array<{ text: string; metrics: string[]; skills: string[] }> } | null = null;

  const flushRole = () => {
    if (currentCompany && currentRole) {
      currentCompany.roles.push({
        title: currentRole.title,
        startDate: currentRole.startDate,
        endDate: currentRole.endDate,
        current: currentRole.current,
        bullets: currentRole.bullets,
      });
    }
  };

  for (const line of lines) {
    const lowered = line.toLowerCase();

    if (/^(skills|education|certifications|projects|summary|profile)/i.test(line)) {
      flushRole();
      currentRole = null;
      inExperienceSection = false;
      continue;
    }

    if (/^experience\b|^work experience\b/i.test(line)) {
      flushRole();
      currentRole = null;
      inExperienceSection = true;
      continue;
    }

    if (!inExperienceSection) {
      continue;
    }

    if (/^\d{4}\s*(?:-|–|to)\s*(?:present|\d{4})$/i.test(line) || /^\d{4}[-/\s]*\d{0,4}$/i.test(line)) {
      if (currentRole) {
        currentRole.startDate = line.includes("present") ? "" : line.split(/(?:-|–|to)/i)[0]?.trim();
        currentRole.endDate = /present/i.test(line) ? undefined : line.split(/(?:-|–|to)/i)[1]?.trim();
        currentRole.current = /present/i.test(line);
      }
      continue;
    }

    if (line.includes(" - ") || line.includes("—") || line.includes("–")) {
      const containsRoleLikeText = line.split(/[-—–]/).some((part) => TITLE_PATTERN.test(part.trim()));
      if (containsRoleLikeText && !/\d/.test(line)) {
        flushRole();

        const [companyCandidate, roleCandidate] = line.split(/[-—–]/).map((value) => value.trim());

        if (companyCandidate && currentCompany && currentCompany.company !== companyCandidate) {
          currentCompany = { company: companyCandidate, roles: [] };
          companyExperiences.push(currentCompany);
        } else if (!currentCompany) {
          currentCompany = { company: companyCandidate || "Unknown Company", roles: [] };
          companyExperiences.push(currentCompany);
        }

        currentRole = {
          title: roleCandidate || companyCandidate,
          bullets: [],
        };

        continue;
      }
    }

    if (TITLE_PATTERN.test(line) && !/\d/.test(line)) {
      if (!currentCompany) {
        currentCompany = { company: "Unknown Company", roles: [] };
        companyExperiences.push(currentCompany);
      }

      flushRole();
      currentRole = { title: line, bullets: [] };
      continue;
    }

    if (currentCompany && currentRole && line.length > 20 && !/^(?:company|location|skills|education)$/i.test(line)) {
      currentRole.bullets.push({
        text: line,
        metrics: [],
        skills: [],
      });
    }

    if (!currentCompany && line && line.length > 2 && !/[0-9]/.test(line) && !/^(?:Skills|Education|Experience|Work Experience)$/i.test(line)) {
      currentCompany = { company: line, roles: [] };
      companyExperiences.push(currentCompany);
    }
  }

  flushRole();

  return companyExperiences.filter((company) => company.company && company.company !== "Unknown Company");
}

function extractEducation(text: string): EducationEntry[] {
  const lines = splitLines(text);
  const education: EducationEntry[] = [];
  let current: Partial<EducationEntry> = {};
  let inEducationSection = false;

  for (const line of lines) {
    const lowered = line.toLowerCase();

    if (/^education\b|^academic background\b/i.test(lowered)) {
      if (current.school || current.degree) {
        education.push({
          school: current.school ?? "",
          degree: current.degree ?? "",
          major: current.major,
          graduationDate: current.graduationDate,
          gpa: current.gpa,
          location: current.location,
        });
      }
      current = {};
      inEducationSection = true;
      continue;
    }

    if (/^(skills|experience|projects|certifications)/i.test(lowered)) {
      if (current.school || current.degree) {
        education.push({
          school: current.school ?? "",
          degree: current.degree ?? "",
          major: current.major,
          graduationDate: current.graduationDate,
          gpa: current.gpa,
          location: current.location,
        });
      }
      current = {};
      inEducationSection = false;
      continue;
    }

    if (!inEducationSection) {
      continue;
    }

    if (!current.school) {
      current.school = line;
      continue;
    }

    if (!current.degree) {
      if (/b\.?s\.?|bachelor|master|phd|associate|certificate/i.test(line)) {
        current.degree = line;
        continue;
      }
    }

    if (!current.major && /[A-Za-z]/.test(line) && !/\d/.test(line) && !/^(?:b\.?s\.?|bachelor|master|phd|associate|certificate)/i.test(line)) {
      current.major = line;
      continue;
    }

    if (/\d{4}/.test(line) && !current.graduationDate) {
      current.graduationDate = line;
    }
  }

  if (current.school || current.degree) {
    education.push({
      school: current.school ?? "",
      degree: current.degree ?? "",
      major: current.major,
      graduationDate: current.graduationDate,
      gpa: current.gpa,
      location: current.location,
    });
  }

  return education.filter((entry) => entry.school || entry.degree);
}

export function parseResumeTextToProfile(text: string, baseProfile: Partial<CandidateProfile> = {}): CandidateProfile {
  const cleaned = text.replace(/\u00a0/g, " ");
  const lines = splitLines(cleaned);
  const parsed = createEmptyCandidateProfile(baseProfile);
  const normalized = normalizeWhitespace(cleaned);
  const fullText = cleaned + "\n" + (baseProfile.resumeReferenceText ?? "");

  const { firstName, lastName } = extractName(cleaned);
  const contact = extractContactInfo(cleaned);
  const skillEntries = extractSkills(cleaned);
  const companies = extractCompanyExperiences(cleaned);
  const educated = extractEducation(cleaned);

  parsed.firstName = baseProfile.firstName ?? firstName;
  parsed.lastName = baseProfile.lastName ?? lastName;
  parsed.email = baseProfile.email ?? contact.email ?? parsed.email;
  parsed.phone = baseProfile.phone ?? contact.phone ?? parsed.phone;
  parsed.city = baseProfile.city ?? contact.city ?? parsed.city;
  parsed.summary = baseProfile.summary ?? lines.slice(0, 3).join(" ");
  parsed.resumeReferenceText = cleaned;
  parsed.skills = skillEntries.length ? skillEntries : parsed.skills;
  parsed.companyExperiences = companies.length ? companies : parsed.companyExperiences;
  parsed.workExperiences = companies.length ? companies : parsed.workExperiences;
  parsed.education = educated.length ? educated : parsed.education;
  parsed.targetRoles = baseProfile.targetRoles ?? ["Software Engineer"];
  parsed.preferredLocations = baseProfile.preferredLocations ?? [];

  if (!parsed.firstName && !parsed.lastName && baseProfile.firstName) {
    parsed.firstName = baseProfile.firstName;
  }

  if (!parsed.lastName && baseProfile.lastName) {
    parsed.lastName = baseProfile.lastName;
  }

  if (baseProfile.id) parsed.id = baseProfile.id;
  if (baseProfile.email) parsed.email = baseProfile.email;

  if (normalized.length > 0 && !parsed.summary) {
    parsed.summary = normalized.slice(0, 220);
  }

  if (baseProfile.skills?.length) {
    parsed.skills = baseProfile.skills;
  }

  if (lines.length > 0 && !parsed.firstName && !parsed.lastName && !/\s/.test(lines[0])) {
    parsed.firstName = lines[0];
  }

  if (!parsed.city && /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(fullText)) {
    const locationMatch = fullText.match(/\b([A-Z][a-z]+,\s*[A-Z]{2})\b/);
    parsed.city = locationMatch?.[1];
  }

  return parsed;
}
