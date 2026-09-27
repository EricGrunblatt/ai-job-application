import test from "node:test";
import assert from "node:assert/strict";

import { createApplicationRecord, listApplicationRecords, saveApplicationRecord } from "../src/lib/applications/service";
import { sampleJob } from "../src/lib/jobs/sample";

test("createApplicationRecord stores the approved review payload with an application status", () => {
  const record = createApplicationRecord({
    job: sampleJob,
    resumeText: "Tailored resume text",
    coverLetterText: "Cover letter text",
    resumePdfUrl: "/generated/final-review-resume.pdf",
    coverLetterPdfUrl: "/generated/final-review-cover-letter.pdf",
    status: "READY_FOR_REVIEW",
    approved: true,
  });

  assert.equal(record.jobTitle, sampleJob.title);
  assert.equal(record.company, sampleJob.company);
  assert.equal(record.status, "READY_FOR_REVIEW");
  assert.equal(record.approved, true);
  assert.match(record.resumePdfUrl ?? "", /final-review-resume\.pdf$/);
  assert.match(record.coverLetterPdfUrl ?? "", /final-review-cover-letter\.pdf$/);
});

test("createApplicationRecord keeps an explicit human approval gate before submission", () => {
  const record = createApplicationRecord({
    job: sampleJob,
    resumeText: "Tailored resume text",
    coverLetterText: "Tailored cover letter",
    approved: false,
  });

  assert.equal(record.status, "READY_FOR_REVIEW");
  assert.equal(record.approved, false);
  assert.equal(record.submittedAt, null);
});

test("saveApplicationRecord and listApplicationRecords keep application history retrievable", async () => {
  const record = createApplicationRecord({
    job: sampleJob,
    resumeText: "Saved resume text",
    coverLetterText: "Saved cover letter",
    approved: true,
    notes: "Ready for review",
  });

  const saved = await saveApplicationRecord(record);
  const all = await listApplicationRecords();

  assert.ok(saved.id);
  assert.ok(all.some((item) => item.id === saved.id));
  assert.equal(all[all.length - 1]?.jobTitle, sampleJob.title);
});
