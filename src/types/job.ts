export type RemotePolicy = "remote" | "hybrid" | "onsite" | "unknown";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "temporary"
  | "unknown";

export type Seniority =
  | "intern"
  | "entry"
  | "mid"
  | "senior"
  | "lead"
  | "principal"
  | "unknown";

export interface JobSalary {
  min?: number;
  max?: number;
  currency?: string;
  period?: "annual" | "hourly" | "monthly" | "unknown";
}

export interface JobRequirement {
  id: string;
  type: "required" | "preferred" | "responsibility";
  text: string;
}

export interface Job {
  id: string;
  source: string;
  sourceJobId?: string;
  url?: string;
  company: string;
  companySummary?: string;
  title: string;
  description: string;
  location: string[];
  remotePolicy: RemotePolicy;
  employmentType?: EmploymentType;
  seniority?: Seniority;
  salary?: JobSalary;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
