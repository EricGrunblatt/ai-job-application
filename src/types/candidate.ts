export type RemotePreference = "remote" | "hybrid" | "onsite" | "open";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship";

export interface CandidateSkill {
  name: string;
  category: string;
  level?: string;
}

export interface CandidateFact {
  id: string;
  company?: string;
  role?: string;
  text: string;
  metrics: string[];
  skills: string[];
  verified: boolean;
}

export interface WorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  current?: boolean;
}

export interface EducationEntry {
  school: string;
  degree: string;
  major?: string;
  graduationDate?: string;
  gpa?: number;
  location?: string;
}

export interface ProjectEntry {
  name: string;
  description?: string;
  technologies: string[];
  outcomes: string[];
  url?: string;
}

export interface CandidatePreference {
  employmentTypes: EmploymentType[];
  industriesToPrefer: string[];
  industriesToExclude: string[];
  seniorityPreferences: string[];
  desiredTechnologies: string[];
  locations: string[];
  preferredRemotePolicy?: RemotePreference;
  maxCommuteMiles?: number;
  notes?: string;
}

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  summary?: string;
  remotePreference?: RemotePreference;
  willingnessToRelocate?: boolean;
  minimumSalary?: number;
  preferredSalary?: number;
  targetRoles: string[];
  preferredLocations: string[];
  skills: CandidateSkill[];
  workExperiences: WorkExperience[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  certifications: Array<{
    name: string;
    issuer?: string;
    issuedDate?: string;
    expiryDate?: string;
  }>;
  candidateFacts: CandidateFact[];
  preferences?: CandidatePreference;
}
