import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import { buildResumeSections, generateResumePdfPreview } from "../src/lib/resume/pdf";

test("generateResumePdfPreview creates a PDF file for review", async () => {
  const outputDir = join(tmpdir(), `resume-pdf-test-${Date.now()}`);

  const result = await generateResumePdfPreview({
    profile: ericGrunblattProfile,
    job: sampleJob,
    outputDir,
    fileName: "test-resume.pdf",
  });

  assert.equal(result.format, "pdf");
  assert.match(result.url, /\.pdf$/i);
  await access(result.filePath);
});

test("buildResumeSections uses a reference-style resume structure with categorized skills", () => {
  const sections = buildResumeSections(
    {
      ...ericGrunblattProfile,
      resumeReferenceText: "Eric Grunblatt\nSkills\nLanguages: Java, Python, JavaScript, TypeScript\nExperience\nGEICO Tech — Senior Software Engineer",
    },
    sampleJob,
  );

  assert.ok(sections.skills.length > 0);
  assert.ok(
    sections.skills.some((entry) =>
      entry.category.toLowerCase().includes("language") || entry.category.includes("Languages"),
    ),
  );
  assert.ok(sections.experience.some((entry) => entry.company.includes("GEICO")));
  assert.ok(sections.experience.some((entry) => entry.title.includes("Senior Software Engineer")));
  assert.ok((sections.referenceTemplate ?? "").includes("Eric Grunblatt"));
  assert.ok(sections.skills.length > 0 && sections.skills.every((entry) => entry.names.length > 0));
});
