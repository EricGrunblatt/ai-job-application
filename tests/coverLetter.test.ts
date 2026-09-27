import test from "node:test";
import assert from "node:assert/strict";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import { generateCoverLetter } from "../src/lib/ai/services/coverLetter";

test("generateCoverLetter produces a role-specific letter grounded in the profile", () => {
  const letter = generateCoverLetter({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  assert.ok(letter.includes("Northstar Labs") || letter.includes("Senior Platform Engineer"));
  assert.ok(letter.includes("GEICO Tech") || letter.includes("CI/CD") || letter.includes("release governance"));
  assert.ok(letter.length > 200);
  assert.ok(!letter.includes("I have been at every company ever"));
});
