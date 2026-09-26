import type { EmploymentType, Job, JobSalary, RemotePolicy, Seniority } from "@/types/job";

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : String(item ?? "").trim()))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeRemotePolicy(value: unknown): RemotePolicy {
  const remote = String(value ?? "").trim().toLowerCase();

  if (["remote", "remote-only", "remote only"].includes(remote)) return "remote";
  if (["hybrid"].includes(remote)) return "hybrid";
  if (["onsite", "on-site", "in-person", "office"].includes(remote)) return "onsite";

  return "unknown";
}

function normalizeEmploymentType(value: unknown): EmploymentType | undefined {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["full_time", "full-time", "full time", "fulltime"].includes(normalized)) return "full_time";
  if (["part_time", "part-time", "part time"].includes(normalized)) return "part_time";
  if (["contract", "contractor"].includes(normalized)) return "contract";
  if (["internship", "intern"].includes(normalized)) return "internship";
  if (["temporary"].includes(normalized)) return "temporary";

  return normalized ? (normalized as EmploymentType) : undefined;
}

function normalizeSeniority(value: unknown): Seniority | undefined {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["intern", "internship"].includes(normalized)) return "intern";
  if (["entry", "junior", "associate"].includes(normalized)) return "entry";
  if (["mid", "mid-level", "mid level"].includes(normalized)) return "mid";
  if (["senior", "sr"].includes(normalized)) return "senior";
  if (["lead", "team lead"].includes(normalized)) return "lead";
  if (["principal", "staff"].includes(normalized)) return "principal";

  return normalized ? (normalized as Seniority) : undefined;
}

function normalizeSalary(value: unknown): JobSalary | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const salary = value as Record<string, unknown>;
  const min = typeof salary.min === "number" ? salary.min : Number(salary.min ?? "");
  const max = typeof salary.max === "number" ? salary.max : Number(salary.max ?? "");

  if (!Number.isFinite(min) && !Number.isFinite(max)) {
    return undefined;
  }

  return {
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
    currency: typeof salary.currency === "string" ? salary.currency : undefined,
    period: typeof salary.period === "string" ? (salary.period as JobSalary["period"]) : undefined,
  };
}

export function normalizeJob(raw: Record<string, unknown>): Job {
  const location = asStringArray(raw.location);
  const requiredSkills = asStringArray(raw.requiredSkills);
  const preferredSkills = asStringArray(raw.preferredSkills);
  const responsibilities = asStringArray(raw.responsibilities);

  const normalized: Job = {
    id: String(raw.id ?? crypto.randomUUID()),
    source: String(raw.source ?? "unknown"),
    sourceJobId: typeof raw.sourceJobId === "string" ? raw.sourceJobId : undefined,
    url: typeof raw.url === "string" ? raw.url : undefined,
    company: String(raw.company ?? "Unknown Company").trim(),
    title: String(raw.title ?? "Untitled Role").trim(),
    description: String(raw.description ?? "").trim(),
    location: location.length ? location : ["Unknown location"],
    remotePolicy: normalizeRemotePolicy(raw.remotePolicy ?? raw.location),
    employmentType: normalizeEmploymentType(raw.employmentType),
    seniority: normalizeSeniority(raw.seniority),
    salary: normalizeSalary(raw.salary),
    requiredSkills,
    preferredSkills,
    responsibilities,
    publishedAt:
      typeof raw.publishedAt === "string" || raw.publishedAt instanceof Date
        ? new Date(raw.publishedAt as string | Date).toISOString()
        : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
  };

  return normalized;
}
