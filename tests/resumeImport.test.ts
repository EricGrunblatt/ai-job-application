import test from "node:test";
import assert from "node:assert/strict";

import { parseResumeTextToProfile } from "../src/lib/candidate/resumeImport";

test("parseResumeTextToProfile extracts core candidate details from resume text", () => {
  const text = `
    Jane Doe
    jane@example.com | (555) 123-4567
    Senior Software Engineer | New York, NY

    Skills
    JavaScript, TypeScript, React, Node.js, SQL, AWS

    Experience
    Acme Corp
    Senior Software Engineer
    2022 - Present
    Built backend services and improved API reliability.

    Education
    Columbia University
    B.S. Computer Science
    2021
  `;

  const parsed = parseResumeTextToProfile(text);

  assert.equal(parsed.firstName, "Jane");
  assert.equal(parsed.lastName, "Doe");
  assert.equal(parsed.email, "jane@example.com");
  assert.equal(parsed.phone, "(555) 123-4567");
  assert.ok(parsed.skills.some((skill) => skill.name === "JavaScript"));
  assert.ok(parsed.skills.some((skill) => skill.name === "React"));
  assert.ok(parsed.companyExperiences[0].company.includes("Acme"));
  assert.ok(parsed.education[0].school.includes("Columbia"));
});
