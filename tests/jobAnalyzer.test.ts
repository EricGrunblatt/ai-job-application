import test from "node:test";
import assert from "node:assert/strict";

import { analyzeJobDescription } from "../src/lib/ai/services/jobAnalyzer";

test("analyzeJobDescription extracts normalized job data from raw description text", async () => {
  const result = await analyzeJobDescription({
    source: "example",
    company: "Example Company",
    url: "https://example.com/jobs/platform-engineer",
    description: `
      Senior Platform Engineer
      Remote - United States
      Full-time
      Salary: $180,000 - $220,000

      We are looking for a senior platform engineer to build developer tooling and improve CI/CD.

      Requirements:
      - 5+ years of software engineering experience
      - Strong experience with Kubernetes, AWS, Terraform, and GitHub Actions
      - Experience with observability tools such as Prometheus and Grafana
      - Excellent communication skills

      Responsibilities:
      - Design reliable infrastructure for internal developer platforms
      - Automate release and deployment workflows across multiple environments
      - Improve observability, incident response, and platform uptime
    `,
  });

  assert.equal(result.title, "Senior Platform Engineer");
  assert.equal(result.company, "Example Company");
  assert.equal(result.remotePolicy, "remote");
  assert.equal(result.employmentType, "full_time");
  assert.ok(Array.isArray(result.requiredSkills));
  assert.ok(result.requiredSkills.some((skill) => skill.toLowerCase().includes("kubernetes")));
  assert.ok(result.responsibilities.length >= 2);
  assert.ok(result.salary?.min !== undefined);
});
