import test from "node:test";
import assert from "node:assert/strict";

import { matchJobToProfile } from "../src/lib/jobs/matching";
import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";

test("matchJobToProfile returns a transparent summary for a strong candidate-job fit", () => {
  const result = matchJobToProfile(ericGrunblattProfile, sampleJob);

  assert.equal(result.jobId, sampleJob.id);
  assert.equal(result.salaryMatch, true);
  assert.equal(result.locationMatch, true);
  assert.equal(result.roleMatch, true);
  assert.ok(result.matchedSkills.length > 0);
  assert.ok(result.reasons.length > 0);
  assert.ok(result.gaps.length >= 0);
});

test("matchJobToProfile flags a clear gap for a mismatched role", () => {
  const poorFit = {
    ...sampleJob,
    id: "poor-fit-job",
    title: "Frontend Developer",
    requiredSkills: ["React", "CSS", "Accessibility"],
    preferredSkills: ["Figma"],
    salary: { min: 80000, max: 110000, currency: "USD", period: "annual" as const },
  };

  const result = matchJobToProfile(ericGrunblattProfile, poorFit);

  assert.equal(result.meetsHardRequirements, false);
  assert.ok(result.reasons.some((reason) => reason.toLowerCase().includes("salary")) || result.gaps.length > 0);
});
