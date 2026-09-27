import test from "node:test";
import assert from "node:assert/strict";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import { generateCoverLetter } from "../src/lib/ai/services/coverLetter";
import { generateCoverLetterPdfPreview, generateResumePdfPreview } from "../src/lib/resume/pdf";

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

test("final preview pdfs can be generated from edited resume and cover letter content", async () => {
  const resumePreview = await generateResumePdfPreview({
    profile: ericGrunblattProfile,
    job: sampleJob,
    resumeDraft: {
      professionalSummary: "Updated summary for final review.",
      skills: ["CI/CD", "GitHub Actions", "Platform Engineering"],
      experience: [
        {
          company: "GEICO Tech",
          role: "Senior Software Engineer",
          dates: "2024 - Present",
          bullets: [{ text: "Updated summary item for final review." }],
        },
      ],
    },
    fileName: "review-resume.pdf",
  });

  const coverLetterPreview = await generateCoverLetterPdfPreview({
    profile: ericGrunblattProfile,
    job: sampleJob,
    coverLetterText: "Updated cover letter text for final review.",
    fileName: "review-cover-letter.pdf",
  });

  assert.equal(resumePreview.format, "pdf");
  assert.equal(coverLetterPreview.format, "pdf");
  assert.match(resumePreview.url, /review-resume\.pdf$/);
  assert.match(coverLetterPreview.url, /review-cover-letter\.pdf$/);
});
