import test from "node:test";
import assert from "node:assert/strict";

import {
  createEmptyCandidateProfile,
  createEmptyCompanyExperience,
  createEmptyEducationEntry,
} from "../src/lib/candidate/profile";

test("profile editing helpers create valid editable defaults", () => {
  const profile = createEmptyCandidateProfile({ firstName: "Test", lastName: "User" });

  assert.equal(profile.firstName, "Test");
  assert.equal(profile.lastName, "User");
  assert.deepEqual(profile.targetRoles, []);
  assert.equal(profile.companyExperiences.length, 1);
  assert.equal(profile.education.length, 1);
  assert.equal(profile.projects.length, 1);
  assert.equal(profile.certifications.length, 1);

  const company = createEmptyCompanyExperience();
  const education = createEmptyEducationEntry();

  assert.equal(company.roles.length, 1);
  assert.equal(company.roles[0].bullets.length, 1);
  assert.equal(education.school, "");
  assert.equal(education.degree, "");
});
