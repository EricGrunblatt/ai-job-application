import test from "node:test";
import assert from "node:assert/strict";

import { ericGrunblattProfile } from "../src/lib/candidate/profile";
import { sampleJob } from "../src/lib/jobs/sample";
import {
  answerApplicationQuestion,
  generateApplicationQuestions,
} from "../src/lib/applications/questions";

test("generateApplicationQuestions produces structured review items from the job and profile", () => {
  const questions = generateApplicationQuestions({
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  assert.ok(questions.length >= 2);
  assert.ok(questions.some((item) => item.question.toLowerCase().includes("ci/cd") || item.question.toLowerCase().includes("release")));
  assert.ok(questions.every((item) => item.confidence !== undefined));
});

test("answerApplicationQuestion flags missing experience instead of inventing it", () => {
  const lowConfidence = answerApplicationQuestion({
    question: "How many years of Kubernetes experience do you have?",
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  assert.equal(lowConfidence.requiresReview, true);
  assert.equal(lowConfidence.answer, null);
  assert.match(lowConfidence.reason ?? "", /Kubernetes|verified/i);

  const highConfidence = answerApplicationQuestion({
    question: "Describe your experience with CI/CD and release governance.",
    profile: ericGrunblattProfile,
    job: sampleJob,
  });

  assert.equal(highConfidence.requiresReview, false);
  assert.ok(highConfidence.answer && highConfidence.answer.length > 50);
});
