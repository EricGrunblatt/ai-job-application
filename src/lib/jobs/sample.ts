import type { Job } from "@/types/job";
import { normalizeJob } from "@/lib/jobs/normalize";

export const sampleJob: Job = normalizeJob({
  id: "job-demo-1",
  source: "greenhouse",
  sourceJobId: "eng-platform-001",
  url: "https://example.com/jobs/platform-engineer",
  company: "Northstar Labs",
  title: "Senior Platform Engineer",
  description:
    "Build and operate developer workflows, infrastructure automation, and deployment standards across cloud and CI/CD systems.",
  location: ["Remote - United States"],
  remotePolicy: "remote",
  employmentType: "full_time",
  seniority: "senior",
  salary: {
    min: 170000,
    max: 210000,
    currency: "USD",
    period: "annual",
  },
  requiredSkills: ["Kubernetes", "AWS", "CI/CD", "Terraform"],
  preferredSkills: ["Observability", "GitHub Actions", "Platform Engineering"],
  responsibilities: [
    "Design and evolve internal developer platforms",
    "Improve deployment and release governance",
    "Partner with product and engineering teams on infrastructure automation",
  ],
  publishedAt: "2026-09-26T00:00:00Z",
});

export const sampleJobs: Job[] = [sampleJob];
