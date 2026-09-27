import OpenAI from "openai";

import { ANALYZE_JOB_PROMPT } from "../prompts/analyzeJob";
import { jobAnalysisSchema, type JobAnalysis } from "../schemas/job";
import { normalizeJob } from "../../jobs/normalize";

export type AnalyzeJobInput = {
  source?: string;
  sourceJobId?: string;
  url?: string;
  company?: string;
  title?: string;
  description: string;
};

const KNOWN_SKILLS = [
  "aws",
  "azure",
  "ci/cd",
  "docker",
  "github actions",
  "gitlab",
  "go",
  "grafana",
  "java",
  "javascript",
  "kubernetes",
  "linux",
  "node.js",
  "observability",
  "platform engineering",
  "postgres",
  "prometheus",
  "python",
  "react",
  "redis",
  "sql",
  "terraform",
  "typescript",
  "vercel",
  "next.js",
  "aws ecs",
  "git",
  "security",
  "sre",
  "devops",
  "cloud",
  "infrastructure",
  "kafka",
  "microservices",
  "machine learning",
  "data engineering",
  "backend",
  "frontend",
  "full stack",
  "api",
  "system design",
];

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function parseSalary(text: string): { min?: number; max?: number; currency?: string; period?: "annual" | "hourly" | "monthly" | "unknown" } | undefined {
  const currencyMatch = text.match(/\$|USD|USD\s*\$|€|£/i);
  const currency = currencyMatch ? (currencyMatch[0].toUpperCase() === "USD" ? "USD" : currencyMatch[0].toUpperCase()) : undefined;

  const salaryCandidate = text.match(/\$\s?([0-9][0-9,]*)\s*(?:-|to|–)\s*\$?\s?([0-9][0-9,]*)/i);
  if (salaryCandidate) {
    const min = Number(salaryCandidate[1].replace(/,/g, ""));
    const max = Number(salaryCandidate[2].replace(/,/g, ""));
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min, max, currency: currency ?? "USD", period: "annual" };
    }
  }

  const minOnly = text.match(/\$\s?([0-9][0-9,]*)\s*(?:\+|minimum|and up|or more)/i);
  if (minOnly) {
    return { min: Number(minOnly[1].replace(/,/g, "")), currency: currency ?? "USD", period: "annual" };
  }

  return undefined;
}

function detectCompany(description: string, fallback: string | undefined): string {
  if (fallback && fallback.trim()) return fallback.trim();

  const patterns = [
    /(?:at|with|join)\s+([A-Z][A-Za-z0-9&.' -]{2,80})(?=\s*(?:\n|$|[–-]))/,
    /(?:company|employer)\s*[:\-]\s*([A-Z][A-Za-z0-9&.' -]{2,80})/,
    /([A-Z][A-Za-z0-9&.' -]{2,80})\s+(?:is hiring|is looking|has an opening)/,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    const candidate = match?.[1]?.trim();
    if (!candidate) continue;

    const lowerCandidate = candidate.toLowerCase();
    if (!/(engineer|developer|analyst|manager|director|architect|scientist|specialist|platform|devops|sre|designer|product)/i.test(lowerCandidate)) {
      return candidate;
    }
  }

  return "Unknown Company";
}

function detectTitle(description: string, fallback: string | undefined): string {
  if (fallback && fallback.trim()) return fallback.trim();

  const lines = description
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine = lines.find((line) => {
    const lower = line.toLowerCase();
    return (
      /engineer|developer|analyst|manager|director|lead|specialist|architect|scientist|associate|platform|devops|sre/i.test(lower) ||
      /software|product|data|security|cloud/i.test(lower)
    ) && line.length <= 120;
  });

  return titleLine ?? "Untitled Role";
}

function detectLocation(description: string): string[] {
  const locationMatches = [
    "remote - united states",
    "remote united states",
    "remote",
    "new york city",
    "new york",
    "san francisco",
    "boston",
    "seattle",
    "washington dc",
    "hybrid",
    "on-site",
    "onsite",
  ];

  const matches = locationMatches.filter((location) => description.toLowerCase().includes(location));
  if (matches.length) {
    return uniqueValues(matches.map((value) => value.replace(/\s+-\s+/g, " - ").replace(/^\w/, (char) => char.toUpperCase())));
  }

  const explicitMatch = description.match(/(?:location|office)\s*[:\-]\s*([^\n]+)/i);
  if (explicitMatch) {
    return uniqueValues([explicitMatch[1].trim()]);
  }

  return ["Unknown location"];
}

function detectRemotePolicy(description: string): "remote" | "hybrid" | "onsite" | "unknown" {
  const lower = description.toLowerCase();
  if (/(remote|remote-only|remote only)/.test(lower)) return "remote";
  if (/hybrid/.test(lower)) return "hybrid";
  if (/(onsite|on-site|in-person|office)/.test(lower)) return "onsite";
  return "unknown";
}

function detectEmploymentType(description: string): JobAnalysis["employmentType"] {
  const lower = description.toLowerCase();
  if (/(full[- ]time|full time)/.test(lower)) return "full_time";
  if (/(part[- ]time|part time)/.test(lower)) return "part_time";
  if (/contract/.test(lower)) return "contract";
  if (/internship|intern/.test(lower)) return "internship";
  if (/temporary/.test(lower)) return "temporary";
  return "unknown";
}

function detectSeniority(description: string): JobAnalysis["seniority"] {
  const lower = description.toLowerCase();
  if (/(principal|staff)/.test(lower)) return "principal";
  if (/(lead|team lead)/.test(lower)) return "lead";
  if (/(sr\.|senior)/.test(lower)) return "senior";
  if (/(mid[- ]level|mid level|mid)/.test(lower)) return "mid";
  if (/(junior|entry|associate)/.test(lower)) return "entry";
  if (/(intern|internship)/.test(lower)) return "intern";
  return "unknown";
}

function parseRequirementsBlock(description: string): string[] {
  const requirementSection = description.split(/(?:requirements?|must haves?|qualifications?)/i)[1];
  if (!requirementSection) return [];

  return requirementSection
    .split(/\n|\r/)
    .map((line) => line.replace(/^[\-•*\d.\s]+/, "").trim())
    .filter((line) => line.length > 0 && line.length < 180)
    .slice(0, 8);
}

function parseResponsibilities(description: string): string[] {
  const responsibilitiesSection = description.split(/(?:responsibilities?|what you will do|you will)/i)[1];
  if (!responsibilitiesSection) {
    return description
      .split(/\n|\r/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && /\b(build|design|lead|improve|own|ensure|support|automate|develop)\b/i.test(line))
      .slice(0, 6);
  }

  return responsibilitiesSection
    .split(/\n|\r/)
    .map((line) => line.replace(/^[\-•*\d.\s]+/, "").trim())
    .filter((line) => line.length > 0 && line.length < 180)
    .slice(0, 8);
}

function findSkills(description: string): { required: string[]; preferred: string[] } {
  const lower = description.toLowerCase();
  const required = uniqueValues(
    KNOWN_SKILLS.filter((skill) => lower.includes(skill.toLowerCase())),
  );

  const preferred = required.filter((skill) => /cloud|devops|platform|observability|infrastructure|security/i.test(skill));

  return {
    required: required.length ? required : ["Infrastructure"],
    preferred: preferred,
  };
}

function buildHeuristicResult(input: AnalyzeJobInput): JobAnalysis {
  const description = input.description.trim();
  const salary = parseSalary(description) ?? undefined;
  const skills = findSkills(description);
  const responsibilities = parseResponsibilities(description);
  const importantQualifications = parseRequirementsBlock(description);

  const rawJob = normalizeJob({
    id: input.sourceJobId ?? crypto.randomUUID(),
    source: input.source ?? "unknown",
    sourceJobId: input.sourceJobId,
    url: input.url,
    company: detectCompany(description, input.company),
    title: detectTitle(description, input.title),
    description,
    location: detectLocation(description),
    remotePolicy: detectRemotePolicy(description),
    employmentType: detectEmploymentType(description),
    seniority: detectSeniority(description),
    salary,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
    responsibilities,
    publishedAt: new Date().toISOString(),
  });

  return jobAnalysisSchema.parse({
    ...rawJob,
    importantQualifications: importantQualifications.length ? importantQualifications : skills.required,
  });
}

async function callOpenAI(input: AnalyzeJobInput): Promise<JobAnalysis> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: ANALYZE_JOB_PROMPT },
      {
        role: "user",
        content: `
          Source: ${input.source ?? "unknown"}
          SourceJobId: ${input.sourceJobId ?? ""}
          URL: ${input.url ?? ""}
          Company: ${input.company ?? ""}
          Title: ${input.title ?? ""}
          Job Description:
          ${input.description}
        `,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned no content.");
  }

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  return jobAnalysisSchema.parse({
    ...parsed,
    source: input.source ?? "unknown",
    sourceJobId: input.sourceJobId ?? null,
    url: input.url ?? null,
    company: typeof parsed.company === "string" ? parsed.company : "Unknown Company",
    title: typeof parsed.title === "string" ? parsed.title : "Untitled Role",
    description: input.description,
    location: Array.isArray(parsed.location) ? parsed.location.filter((value): value is string => typeof value === "string") : [],
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills.filter((value): value is string => typeof value === "string") : [],
    preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills.filter((value): value is string => typeof value === "string") : [],
    responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities.filter((value): value is string => typeof value === "string") : [],
    importantQualifications: Array.isArray(parsed.importantQualifications) ? parsed.importantQualifications.filter((value): value is string => typeof value === "string") : [],
  });
}

export async function analyzeJobDescription(input: AnalyzeJobInput): Promise<JobAnalysis> {
  if (!input?.description || !input.description.trim()) {
    throw new Error("A job description is required.");
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(input);
    } catch (error) {
      console.warn("AI job analysis failed; using heuristic fallback.", error);
    }
  }

  return buildHeuristicResult(input);
}
