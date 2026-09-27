import type { CandidateProfile } from "@/types/candidate";

export function createEmptyExperienceBullet() {
  return {
    text: "",
    metrics: [],
    skills: [],
  };
}

export function createEmptyWorkRole() {
  return {
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    current: false,
    bullets: [createEmptyExperienceBullet()],
  };
}

export function createEmptyCompanyExperience() {
  return {
    company: "",
    location: "",
    roles: [createEmptyWorkRole()],
  };
}

export function createEmptyEducationEntry() {
  return {
    school: "",
    degree: "",
    major: "",
    graduationDate: "",
    gpa: undefined,
    location: "",
  };
}

export function createEmptyProjectEntry() {
  return {
    name: "",
    description: "",
    technologies: [],
    outcomes: [],
    url: "",
  };
}

export function createEmptyCertificationEntry() {
  return {
    name: "",
    issuer: "",
    issuedDate: "",
    expiryDate: "",
  };
}

export function createEmptyCandidateProfile(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  const id = overrides.id ?? "candidate-blank";

  return {
    id,
    firstName: overrides.firstName ?? "",
    lastName: overrides.lastName ?? "",
    email: overrides.email ?? "",
    phone: overrides.phone ?? "",
    city: overrides.city ?? "",
    state: overrides.state ?? "",
    country: overrides.country ?? "",
    linkedInUrl: overrides.linkedInUrl ?? "",
    githubUrl: overrides.githubUrl ?? "",
    portfolioUrl: overrides.portfolioUrl ?? "",
    summary: overrides.summary ?? "",
    resumeReferenceText: overrides.resumeReferenceText ?? "",
    remotePreference: overrides.remotePreference ?? "open",
    willingnessToRelocate: overrides.willingnessToRelocate ?? false,
    minimumSalary: overrides.minimumSalary ?? 0,
    preferredSalary: overrides.preferredSalary ?? 0,
    targetRoles: overrides.targetRoles ?? [],
    preferredLocations: overrides.preferredLocations ?? [],
    skills: overrides.skills ?? [],
    workExperiences: overrides.workExperiences ?? [createEmptyCompanyExperience()],
    companyExperiences: overrides.companyExperiences ?? [createEmptyCompanyExperience()],
    education: overrides.education ?? [createEmptyEducationEntry()],
    projects: overrides.projects ?? [createEmptyProjectEntry()],
    certifications: overrides.certifications ?? [createEmptyCertificationEntry()],
    candidateFacts: overrides.candidateFacts ?? [],
    preferences: overrides.preferences ?? {
      employmentTypes: [],
      industriesToPrefer: [],
      industriesToExclude: [],
      seniorityPreferences: [],
      desiredTechnologies: [],
      locations: [],
      preferredRemotePolicy: "open",
      maxCommuteMiles: 0,
      notes: "",
    },
  };
}

export const ericGrunblattProfile: CandidateProfile = {
  id: "candidate-eric-grunblatt",
  firstName: "Eric",
  lastName: "Grunblatt",
  email: "ericgrunblatt@gmail.com",
  phone: "(201) 669-2041",
  city: "Mahwah",
  state: "NJ",
  country: "USA",
  linkedInUrl: "https://www.linkedin.com/in/eric-grunblatt/",
  githubUrl: "https://github.com/EricGrunblatt",
  summary:
    "Senior software engineer focused on platform engineering, CI/CD, release governance, and observability with experience building enterprise developer tooling and large-scale migration programs.",
  resumeReferenceText:
    "Eric Grunblatt\nSkills\nLanguages: Java, Python, JavaScript, TypeScript, SQL, HTML/CSS\nPlatforms & DevOps: Azure DevOps, GitHub Actions, Git, CI/CD\nObservability & Monitoring: Grafana, Prometheus, Grafana Loki, PromQL, LogQL, Splunk\nFrameworks & Databases: Node.js, Express.js, React.js, Vue.js, MySQL, MongoDB\nCloud & Tools: Google Cloud Platform, REST APIs, Linux/Unix\nExperience\nGEICO Tech — Senior Software Engineer\nGEICO Tech — Software Engineer II\nGEICO Tech — Software Engineer I\nRevelwood Solutions — Full Stack JavaScript Intern\nEducation\nStony Brook University\nBachelor of Science: Computer Science",
  remotePreference: "open",
  willingnessToRelocate: false,
  minimumSalary: 180000,
  preferredSalary: 220000,
  targetRoles: [
    "Senior Software Engineer",
    "Platform Engineer",
    "Senior DevOps Engineer",
    "Software Engineer",
    "Full Stack Engineer",
  ],
  preferredLocations: ["Remote - United States", "New York", "New Jersey"],
  skills: [
    { name: "Java", category: "Languages" },
    { name: "Python", category: "Languages" },
    { name: "JavaScript", category: "Languages" },
    { name: "TypeScript", category: "Languages" },
    { name: "SQL", category: "Languages" },
    { name: "HTML/CSS", category: "Languages" },
    { name: "Azure DevOps", category: "Platforms & DevOps" },
    { name: "GitHub Actions", category: "Platforms & DevOps" },
    { name: "Git", category: "Platforms & DevOps" },
    { name: "CI/CD", category: "Platforms & DevOps" },
    { name: "Grafana", category: "Observability & Monitoring" },
    { name: "Prometheus", category: "Observability & Monitoring" },
    { name: "Grafana Loki", category: "Observability & Monitoring" },
    { name: "PromQL", category: "Observability & Monitoring" },
    { name: "LogQL", category: "Observability & Monitoring" },
    { name: "Splunk", category: "Observability & Monitoring" },
    { name: "Node.js", category: "Frameworks & Databases" },
    { name: "Express.js", category: "Frameworks & Databases" },
    { name: "React.js", category: "Frameworks & Databases" },
    { name: "Vue.js", category: "Frameworks & Databases" },
    { name: "MySQL", category: "Frameworks & Databases" },
    { name: "MongoDB", category: "Frameworks & Databases" },
    { name: "Google Cloud Platform", category: "Cloud & Tools" },
    { name: "REST APIs", category: "Cloud & Tools" },
    { name: "Linux/Unix", category: "Cloud & Tools" },
  ],
  workExperiences: [
    {
      company: "GEICO Tech",
      location: "United States",
      roles: [
        {
          title: "Senior Software Engineer",
          startDate: "2026-07-01",
          current: true,
          bullets: [
            {
              text: "Architected a standardized CI/CD foundation that gave the organization reusable GitHub-based workflows for thousands of engineers and applications.",
              metrics: ["Standardized workflows across the engineering org"],
              skills: ["CI/CD standardization", "GitHub workflow design", "Platform engineering"],
            },
            {
              text: "Built a deployment model that supported up to four environments with policy checks, release controls, and post-deployment verification at every stage.",
              metrics: ["Four-environment delivery model"],
              skills: ["Deployment automation", "Release governance", "Environment orchestration"],
            },
            {
              text: "Created dependency-aware deployment orchestration for complex applications and monorepos so downstream releases only advanced after upstream work was validated.",
              metrics: ["Improved release sequencing for multi-service delivery"],
              skills: ["Monorepo release orchestration", "Deployment sequencing", "Platform design"],
            },
          ],
        },
        {
          title: "Software Engineer II",
          startDate: "2025-07-01",
          endDate: "2026-06-30",
          bullets: [
            {
              text: "Developed a release governance platform that enforced internal deployment policies across Azure DevOps and GitHub, covering more than 15,000 deployment pipelines.",
              metrics: ["Governed 15,000+ deployment pipelines"],
              skills: ["Azure DevOps", "GitHub deployment protection", "Release governance"],
            },
            {
              text: "Automated onboarding and validation so teams could self-serve deployment setup without manual review, reducing setup time from 30 minutes to zero and driving adoption from 10% to 100%.",
              metrics: ["Cut onboarding from 30 minutes to zero", "Raised adoption from 10% to 100%"],
              skills: ["Developer enablement", "Workflow automation", "Platform self-service"],
            },
            {
              text: "Partnered with platform, security, and application teams to improve release reliability and standardize deployment governance across the organization.",
              metrics: ["Improved governance and release consistency"],
              skills: ["Stakeholder collaboration", "Deployment reliability", "Governance"],
            },
          ],
        },
        {
          title: "Software Engineer I",
          startDate: "2024-03-01",
          endDate: "2025-06-30",
          bullets: [
            {
              text: "Developed and supported GEICO's enterprise observability platform using Grafana Loki and Prometheus to enable a broad migration away from Splunk.",
              metrics: ["Enabled large-scale observability migration across the org"],
              skills: ["Grafana Loki", "Prometheus", "Observability platform", "Splunk migration"],
            },
            {
              text: "Led migration work for more than 2,000 Splunk queries, 300 dashboards, and 500 alerts using LogQL and PromQL, improving performance and reducing operational friction.",
              metrics: ["2,000 queries migrated", "300 dashboards updated", "500 alerts remapped"],
              skills: ["LogQL", "PromQL", "Dashboard migration", "Alert migration"],
            },
            {
              text: "Facilitated weekly observability office hours for six months, coaching teams on migration strategy and best practices for groups spanning thousands of engineers.",
              metrics: ["Three office-hours sessions each week for six months"],
              skills: ["Observability enablement", "Best-practice coaching", "Developer education"],
            },
          ],
        },
      ],
    },
    {
      company: "Revelwood Solutions",
      location: "United States",
      roles: [
        {
          title: "Full Stack JavaScript Intern",
          startDate: "2022-06-01",
          endDate: "2022-08-31",
          bullets: [
            {
              text: "Built internal web tools in JavaScript and TypeScript, including a Google Sheets extension that automated outbound email workflows.",
              metrics: ["Automated internal email workflows"],
              skills: ["JavaScript", "TypeScript", "jQuery", "Google Sheets automation"],
            },
            {
              text: "Maintained and improved production applications built with Vue.js, Express.js, and MySQL that supported a large internal user base.",
              metrics: ["Supported a large production user base"],
              skills: ["Vue.js", "Express.js", "MySQL", "Production support"],
            },
          ],
        },
      ],
    },
  ],
  companyExperiences: [
    {
      company: "GEICO Tech",
      location: "United States",
      roles: [
        {
          title: "Senior Software Engineer",
          startDate: "2026-07-01",
          current: true,
          bullets: [
            {
              text: "Architected a standardized CI/CD foundation that gave the organization reusable GitHub-based workflows for thousands of engineers and applications.",
              metrics: ["Standardized workflows across the engineering org"],
              skills: ["CI/CD standardization", "GitHub workflow design", "Platform engineering"],
            },
            {
              text: "Built a deployment model that supported up to four environments with policy checks, release controls, and post-deployment verification at every stage.",
              metrics: ["Four-environment delivery model"],
              skills: ["Deployment automation", "Release governance", "Environment orchestration"],
            },
            {
              text: "Created dependency-aware deployment orchestration for complex applications and monorepos so downstream releases only advanced after upstream work was validated.",
              metrics: ["Improved release sequencing for multi-service delivery"],
              skills: ["Monorepo release orchestration", "Deployment sequencing", "Platform design"],
            },
          ],
        },
        {
          title: "Software Engineer II",
          startDate: "2025-07-01",
          endDate: "2026-06-30",
          bullets: [
            {
              text: "Developed a release governance platform that enforced internal deployment policies across Azure DevOps and GitHub, covering more than 15,000 deployment pipelines.",
              metrics: ["Governed 15,000+ deployment pipelines"],
              skills: ["Azure DevOps", "GitHub deployment protection", "Release governance"],
            },
            {
              text: "Automated onboarding and validation so teams could self-serve deployment setup without manual review, reducing setup time from 30 minutes to zero and driving adoption from 10% to 100%.",
              metrics: ["Cut onboarding from 30 minutes to zero", "Raised adoption from 10% to 100%"],
              skills: ["Developer enablement", "Workflow automation", "Platform self-service"],
            },
            {
              text: "Partnered with platform, security, and application teams to improve release reliability and standardize deployment governance across the organization.",
              metrics: ["Improved governance and release consistency"],
              skills: ["Stakeholder collaboration", "Deployment reliability", "Governance"],
            },
          ],
        },
        {
          title: "Software Engineer I",
          startDate: "2024-03-01",
          endDate: "2025-06-30",
          bullets: [
            {
              text: "Developed and supported GEICO's enterprise observability platform using Grafana Loki and Prometheus to enable a broad migration away from Splunk.",
              metrics: ["Enabled large-scale observability migration across the org"],
              skills: ["Grafana Loki", "Prometheus", "Observability platform", "Splunk migration"],
            },
            {
              text: "Led migration work for more than 2,000 Splunk queries, 300 dashboards, and 500 alerts using LogQL and PromQL, improving performance and reducing operational friction.",
              metrics: ["2,000 queries migrated", "300 dashboards updated", "500 alerts remapped"],
              skills: ["LogQL", "PromQL", "Dashboard migration", "Alert migration"],
            },
            {
              text: "Facilitated weekly observability office hours for six months, coaching teams on migration strategy and best practices for groups spanning thousands of engineers.",
              metrics: ["Three office-hours sessions each week for six months"],
              skills: ["Observability enablement", "Best-practice coaching", "Developer education"],
            },
          ],
        },
      ],
    },
    {
      company: "Revelwood Solutions",
      location: "United States",
      roles: [
        {
          title: "Full Stack JavaScript Intern",
          startDate: "2022-06-01",
          endDate: "2022-08-31",
          bullets: [
            {
              text: "Built internal web tools in JavaScript and TypeScript, including a Google Sheets extension that automated outbound email workflows.",
              metrics: ["Automated internal email workflows"],
              skills: ["JavaScript", "TypeScript", "jQuery", "Google Sheets automation"],
            },
            {
              text: "Maintained and improved production applications built with Vue.js, Express.js, and MySQL that supported a large internal user base.",
              metrics: ["Supported a large production user base"],
              skills: ["Vue.js", "Express.js", "MySQL", "Production support"],
            },
          ],
        },
      ],
    },
  ],
  education: [
    {
      school: "Stony Brook University",
      degree: "Bachelor of Science",
      major: "Computer Science",
      graduationDate: "2023-05-01",
      gpa: 3.58,
      location: "Stony Brook, NY",
    },
  ],
  projects: [],
  certifications: [],
  candidateFacts: [
    {
      id: "geico-release-platform-001",
      company: "GEICO Tech",
      role: "Senior Software Engineer",
      text: "Architected a standardized CI/CD pipeline framework in partnership with the Paved Road team, establishing consistent, reusable GitHub-based workflows for thousands of engineers and applications across the organization.",
      metrics: [],
      skills: ["CI/CD", "GitHub", "Platform Engineering", "Automation"],
      verified: true,
    },
    {
      id: "geico-release-platform-002",
      company: "GEICO Tech",
      role: "Senior Software Engineer",
      text: "Developed a standardized CD architecture supporting deployments across up to four environments with policy validation, artifact deployment, post-deployment testing, release creation, and change request procedures.",
      metrics: ["4 environments"],
      skills: ["Continuous Delivery", "Deployment Automation", "Release Engineering"],
      verified: true,
    },
    {
      id: "geico-release-platform-003",
      company: "GEICO Tech",
      role: "Software Engineer II",
      text: "Developed a release governance platform enforcing internal deployment policies across Azure DevOps and GitHub, validating over 15,000 deployment pipelines through Azure DevOps Pipeline Decorators and GitHub Deployment Protection Rules.",
      metrics: ["15,000 deployment pipelines"],
      skills: ["Azure DevOps", "GitHub", "Deployment Policy", "Platform Engineering"],
      verified: true,
    },
    {
      id: "geico-release-platform-004",
      company: "GEICO Tech",
      role: "Software Engineer II",
      text: "Automated onboarding and validation workflows, eliminating manual platform reviews and configuration, reducing onboarding effort from 30 minutes to 0 and increasing adoption from 10% to 100% of eligible pipelines.",
      metrics: ["30 minutes to 0", "10% to 100% adoption"],
      skills: ["Automation", "Developer Experience", "Workflow Design"],
      verified: true,
    },
    {
      id: "geico-observability-001",
      company: "GEICO Tech",
      role: "Software Engineer I",
      text: "Developed and supported GEICO's enterprise observability platform leveraging Grafana Loki and Prometheus, enabling organization-wide migration from Splunk across thousands of engineers.",
      metrics: ["thousands of engineers"],
      skills: ["Grafana Loki", "Prometheus", "Observability", "Splunk Migration"],
      verified: true,
    },
    {
      id: "geico-observability-002",
      company: "GEICO Tech",
      role: "Software Engineer I",
      text: "Partnered with engineering teams to migrate over 2,000 Splunk queries, 300 dashboards, and 500 alerts using LogQL and PromQL while improving query performance and observability efficiency.",
      metrics: ["2,000 Splunk queries", "300 dashboards", "500 alerts"],
      skills: ["LogQL", "PromQL", "Migration", "Observability"],
      verified: true,
    },
    {
      id: "revelwood-intern-001",
      company: "Revelwood Solutions",
      role: "Full Stack JavaScript Intern",
      text: "Developed internal web applications using JavaScript, TypeScript, and jQuery, including a Google Sheets extension for automated email workflows.",
      metrics: [],
      skills: ["JavaScript", "TypeScript", "jQuery", "Google Sheets", "Automation"],
      verified: true,
    },
    {
      id: "revelwood-intern-002",
      company: "Revelwood Solutions",
      role: "Full Stack JavaScript Intern",
      text: "Maintained and enhanced production applications built with Vue.js, Express.js, and MySQL supporting thousands of users.",
      metrics: ["thousands of users"],
      skills: ["Vue.js", "Express.js", "MySQL", "Production Support"],
      verified: true,
    },
  ],
  preferences: {
    employmentTypes: ["full_time"],
    industriesToPrefer: ["Fintech", "Insurance", "Technology", "Platform Engineering"],
    industriesToExclude: [],
    seniorityPreferences: ["senior", "staff"],
    desiredTechnologies: [
      "CI/CD",
      "Java",
      "AWS",
      "Kubernetes",
      "Observability",
      "Developer Platforms",
      "GitHub",
      "Terraform",
    ],
    locations: ["Remote - United States", "New York", "New Jersey"],
    preferredRemotePolicy: "remote",
    maxCommuteMiles: 50,
    notes: "Open to remote and hybrid roles with a strong preference for platform, devops, or software engineering work.",
  },
};
