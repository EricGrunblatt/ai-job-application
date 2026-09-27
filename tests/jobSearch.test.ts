import test from "node:test";
import assert from "node:assert/strict";

import { sampleJobs } from "../src/lib/jobs/sample";
import { searchJobs } from "../src/lib/jobs/search";

test("searchJobs filters and ranks jobs by the user criteria", () => {
  const results = searchJobs(
    {
      roles: ["Senior Platform Engineer", "Senior Software Engineer"],
      locations: ["Remote - United States"],
      minimumBaseSalary: 150000,
      remotePolicy: "remote",
      preferredSkills: ["CI/CD", "Observability"],
    },
    sampleJobs,
  );

  assert.ok(results.length >= 1);
  assert.ok(results.every((job) => job.location.some((value) => value.toLowerCase().includes("remote") || value.toLowerCase().includes("united states"))));
  assert.ok(results.every((job) => (job.salary?.min ?? 0) >= 150000 || (job.salary?.max ?? 0) >= 150000));
  assert.ok(results[0]?.title.includes("Platform") || results[0]?.title.includes("Engineer"));
});
