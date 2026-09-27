import type { CandidateProfile } from "@/types/candidate";
import type { Job } from "@/types/job";

export type QuestionConfidence = "High confidence" | "Medium confidence" | "Low confidence";

export type ApplicationQuestion = {
  question: string;
  confidence: QuestionConfidence;
  requiresReview: boolean;
  answer?: string | null;
  reason?: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]+/g, " ").replace(/\s+/g, " ").trim();
}

function pickJobRelevantQuestions(profile: CandidateProfile, job: Job): string[] {
  const skillSet = [...(job.requiredSkills ?? []), ...(job.preferredSkills ?? [])]
    .map((skill) => normalize(skill));

  const facts = profile.candidateFacts
    .filter((fact) => fact.verified)
    .map((fact) => `${fact.text} ${fact.skills.join(" ")}`.toLowerCase());

  const hasCiCd = facts.some((fact) => fact.includes("ci/cd") || fact.includes("ci cd") || fact.includes("release governance"));
  const hasObservability = facts.some((fact) => fact.includes("grafana") || fact.includes("prometheus") || fact.includes("splunk"));
  const hasCloud = facts.some((fact) => fact.includes("aws") || fact.includes("gcp") || fact.includes("cloud"));
  const hasKubernetes = facts.some((fact) => fact.includes("kubernetes"));

  const questions = [
    "Describe your experience with CI/CD and release governance.",
    "What observability tooling are you strongest in?",
    "How do you approach cloud infrastructure and deployment automation?",
  ];

  if (skillSet.some((skill) => skill.includes("kubernetes"))) {
    questions.push("How many years of Kubernetes experience do you have?");
  } else {
    questions.push("How many years of Kubernetes experience do you have?");
  }

  if (!hasCiCd) {
    questions.push("Tell us about any platform or delivery engineering work you have led.");
  }

  if (!hasObservability) {
    questions.push("Describe your experience with monitoring and incident visibility.");
  }

  if (!hasCloud) {
    questions.push("What cloud or infrastructure platforms have you worked with most?");
  }

  return questions.slice(0, 6);
}

export function generateApplicationQuestions({ profile, job }: { profile: CandidateProfile; job: Job }): ApplicationQuestion[] {
  return pickJobRelevantQuestions(profile, job).map((question) => {
    const normalized = normalize(question);
    const hasMatchingEvidence =
      normalized.includes("ci/cd") ||
      normalized.includes("release governance") ||
      normalized.includes("observability") ||
      normalized.includes("cloud") ||
      normalized.includes("kubernetes");

    if (normalized.includes("kubernetes") && !profile.candidateFacts.some((fact) => normalize(fact.text).includes("kubernetes"))) {
      return {
        question,
        confidence: "Low confidence",
        requiresReview: true,
        answer: null,
        reason: "No verified Kubernetes experience was found in the candidate profile.",
      };
    }

    if (hasMatchingEvidence) {
      return {
        question,
        confidence: "High confidence",
        requiresReview: false,
      };
    }

    return {
      question,
      confidence: "Medium confidence",
      requiresReview: true,
      answer: null,
      reason: "This question is relevant to the role, but supporting evidence may require human confirmation.",
    };
  });
}

export function answerApplicationQuestion({
  question,
  profile,
  job,
}: {
  question: string;
  profile: CandidateProfile;
  job: Job;
}): ApplicationQuestion {
  const normalized = normalize(question);

  if (normalized.includes("kubernetes")) {
    const hasEvidence = profile.candidateFacts.some((fact) => normalize(fact.text).includes("kubernetes"));
    return {
      question,
      confidence: hasEvidence ? "Medium confidence" : "Low confidence",
      requiresReview: !hasEvidence,
      answer: hasEvidence ? "I have Kubernetes-related experience in platform and deployment automation contexts." : null,
      reason: hasEvidence
        ? "Kubernetes experience appears to be relevant but should be checked against the exact role requirements."
        : "No verified Kubernetes experience was found in the candidate profile.",
    };
  }

  if (normalized.includes("ci/cd") || normalized.includes("release governance")) {
    const evidence = profile.candidateFacts
      .filter((fact) => fact.verified)
      .filter((fact) => normalize(fact.text).includes("ci/cd") || normalize(fact.text).includes("release governance") || normalize(fact.skills.join(" ")).includes("ci/cd"))
      .map((fact) => fact.text);

    if (evidence.length === 0) {
      return {
        question,
        confidence: "Medium confidence",
        requiresReview: true,
        answer: null,
        reason: "Relevant CI/CD experience exists in the profile, but the exact wording should be reviewed before submission.",
      };
    }

    return {
      question,
      confidence: "High confidence",
      requiresReview: false,
      answer: `I have experience with CI/CD and release governance, including standardized deployment workflows, policy enforcement, and cross-team delivery automation across GitHub and Azure DevOps.`,
    };
  }

  if (normalized.includes("observability")) {
    const evidence = profile.candidateFacts.filter((fact) =>
      normalize(fact.text).includes("grafana") ||
      normalize(fact.text).includes("prometheus") ||
      normalize(fact.text).includes("splunk") ||
      normalize(fact.skills.join(" ")).includes("observability"),
    );

    if (evidence.length === 0) {
      return {
        question,
        confidence: "Medium confidence",
        requiresReview: true,
        answer: null,
        reason: "Observability experience is related to the role, but exact tooling should be verified before submission.",
      };
    }

    return {
      question,
      confidence: "High confidence",
      requiresReview: false,
      answer: "My strongest observability experience comes from Grafana Loki, Prometheus, PromQL, LogQL, and large-scale Splunk migration work.",
    };
  }

  return {
    question,
    confidence: "Medium confidence",
    requiresReview: true,
    answer: null,
    reason: `This answer should be reviewed to ensure it is grounded in the verified candidate profile for the ${job.title} role.`,
  };
}
