import test from "node:test";
import assert from "node:assert/strict";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import { tailorResumeForJob, validateTailoredResume } from "../src/lib/resume/tailor";

test("tailorResumeForJob selects relevant verified facts and validates them", () => {
  const result = tailorResumeForJob({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  assert.ok(result.professionalSummary.length > 0);
  assert.ok(result.skills.length > 0);
  assert.ok(result.experience.length > 0);
  assert.ok(result.experience.every((entry) => entry.bullets.length > 0));
  assert.ok(result.professionalSummary.toLowerCase().includes("ci/cd") || result.professionalSummary.toLowerCase().includes("platform"));
  assert.ok(result.skills.some((skill) => skill.toLowerCase().includes("ci/cd") || skill.toLowerCase().includes("terraform") || skill.toLowerCase().includes("kubernetes")));

  const validation = validateTailoredResume(result, ericGrunblattProfile);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.errors, []);
});
