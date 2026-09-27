import type { Job } from "@/types/job";

const APPLICATION_STORE_KEY = "ai-job-application-records";
let memoryStore: ApplicationRecord[] = [];

export type ApplicationStatus =
  | "DISCOVERED"
  | "SELECTED"
  | "PREPARING"
  | "READY_FOR_REVIEW"
  | "SUBMITTED"
  | "WITHDRAWN"
  | "REJECTED"
  | "INTERVIEWING"
  | "OFFER";

export type ApplicationRecord = {
  id: string;
  status: ApplicationStatus;
  company: string;
  jobTitle: string;
  jobUrl?: string;
  location: string[];
  source?: string;
  resumeText?: string;
  coverLetterText?: string;
  resumePdfUrl?: string;
  coverLetterPdfUrl?: string;
  salaryMin?: number;
  salaryMax?: number;
  approved: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  metadata?: Record<string, unknown>;
};

export function createApplicationRecord(input: {
  id?: string;
  job: Job;
  resumeText?: string;
  coverLetterText?: string;
  resumePdfUrl?: string;
  coverLetterPdfUrl?: string;
  status?: ApplicationStatus;
  approved?: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;
}): ApplicationRecord {
  const now = new Date().toISOString();
  const status = input.status ?? "READY_FOR_REVIEW";

  return {
    id: input.id ?? cryptoRandomId(),
    status,
    company: input.job.company,
    jobTitle: input.job.title,
    jobUrl: input.job.url,
    location: input.job.location ?? [],
    source: input.job.source,
    resumeText: input.resumeText,
    coverLetterText: input.coverLetterText,
    resumePdfUrl: input.resumePdfUrl,
    coverLetterPdfUrl: input.coverLetterPdfUrl,
    salaryMin: input.job.salary?.min,
    salaryMax: input.job.salary?.max,
    approved: input.approved ?? false,
    submittedAt: status === "SUBMITTED" ? now : null,
    createdAt: now,
    updatedAt: now,
    notes: input.notes,
    metadata: input.metadata,
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `app_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readStore(): ApplicationRecord[] {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(APPLICATION_STORE_KEY);
      if (!raw) return memoryStore;

      const parsed = JSON.parse(raw) as ApplicationRecord[];
      memoryStore = Array.isArray(parsed) ? parsed : [];
      return memoryStore;
    } catch {
      return memoryStore;
    }
  }

  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    try {
      const raw = globalThis.localStorage.getItem(APPLICATION_STORE_KEY);
      if (!raw) return memoryStore;

      const parsed = JSON.parse(raw) as ApplicationRecord[];
      memoryStore = Array.isArray(parsed) ? parsed : [];
      return memoryStore;
    } catch {
      return memoryStore;
    }
  }

  return memoryStore;
}

function writeStore(records: ApplicationRecord[]) {
  memoryStore = records;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(APPLICATION_STORE_KEY, JSON.stringify(records));
    } catch {
      // ignore storage write failures; memoryStore remains canonical in non-browser contexts
    }
    return;
  }

  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    try {
      globalThis.localStorage.setItem(APPLICATION_STORE_KEY, JSON.stringify(records));
    } catch {
      // ignore storage write failures; memoryStore remains canonical in non-browser contexts
    }
  }
}

export async function saveApplicationRecord(record: ApplicationRecord): Promise<ApplicationRecord> {
  const existing = readStore();
  const next = existing.some((item) => item.id === record.id)
    ? existing.map((item) => (item.id === record.id ? record : item))
    : [...existing, record];

  writeStore(next);
  return record;
}

export async function listApplicationRecords(): Promise<ApplicationRecord[]> {
  return readStore().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
