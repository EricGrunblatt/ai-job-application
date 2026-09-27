import test from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import { generateResumePdfPreview } from "../src/lib/resume/pdf";

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
