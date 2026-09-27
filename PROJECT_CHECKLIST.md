# Project Checklist

Use this file as the source of truth for current progress. Update it as work is completed or deferred.

## Status legend
- [ ] Not started
- [ ] In progress
- [x] Completed

## Milestones

### Milestone 1 — Project Foundation
- [x] Initialize Next.js + TypeScript app
- [x] Configure Prisma + PostgreSQL basics
- [x] Create .env.example
- [x] Create AGENTS.md / agent instructions
- [x] Create initial Prisma Candidate schema
- [x] Create candidate profile page
- [x] Verify app runs locally
- [x] Commit the working foundation

### Milestone 2 — Candidate Profile
- [x] Candidate database schema
- [x] Profile UI
- [x] Work experience
- [x] Skills
- [x] Education
- [x] Projects
- [x] Candidate preferences
- [x] Verified accomplishment records
- [x] Dynamic add/remove editing for multiple work experiences, education records, projects, and certifications
- [x] Resume-reference baseline and profile parsing hooks for onboarding

### Milestone 2A — Account Access
- [x] Local auth flow with email/username sign up and sign in
- [x] Session cookie-based login state
- [x] Resume text import and profile autofill from an existing resume
- [ ] OAuth providers (Google/LinkedIn) pending for production rollout

### Milestone 3 — Job Model
- [x] Job schema
- [x] Job normalization utilities
- [x] Basic job detail page

### Milestone 4 — Job Description Analyzer
- [x] OpenAI client
- [x] Prompt
- [x] Zod schema
- [x] Analyzer service
- [x] /api/jobs/analyze
- [x] Job analysis UI

### Milestone 5 — Resume Tailoring
- [x] Candidate/job matching
- [x] Relevant fact selection
- [x] Resume content generation
- [x] Fact IDs on generated content
- [x] Resume validation
- [x] Deterministic resume rendering
- [x] Resume reference and template baseline integration

Status: In progress — the candidate profile and resume-import flow are working, and the next phase is cover-letter generation plus review flow; OAuth remains a later external integration once the core application pipeline is stable.

### Milestone 6 — Cover Letter
- [x] Cover letter prompt
- [x] Structured output
- [x] Validation
- [x] Rendering
- [x] Review UI

### Milestone 7 — Application Questions
- [x] Question extraction
- [x] Question classification
- [x] Answer generation
- [x] Confidence classification
- [x] Human review flags

### Milestone 8 — Application Review
- [x] Review dashboard
- [x] Resume preview/download
- [x] Cover letter preview/edit
- [x] Question review/edit flow
- [x] Explicit approval gate

### Milestone 9 — Browser Automation
- [ ] Playwright service
- [ ] Application adapter abstraction
- [ ] First ATS/site adapter
- [ ] Form inspection
- [ ] Field mapping
- [ ] Resume upload flow
- [ ] Cover letter upload flow
- [ ] Human handoff

### Milestone 10 — Job Sources
- [x] JobSource abstraction
- [x] First supported job source
- [x] Normalization
- [ ] Deduplication
- [x] Search UI

### Milestone 11 — Job Matching
- [x] Candidate/job matching
- [x] Transparent match reasons
- [x] Gaps
- [x] Search result filtering/sorting

### Milestone 12 — Application History
- [x] Application records
- [x] Statuses
- [x] Resume/cover-letter version references
- [x] Notes
- [ ] Search/filter history

## Notes
- The project is currently in the job-discovery and automation-prep phase of development.
- The review flow, cover-letter path, application history, and job-discovery matching are all working and validated.
- Browser automation and deeper ATS integrations remain intentionally deferred until the human-in-the-loop review and approval flow is stable.
- This checklist should be treated as the active status tracker for all agents.
- Update it whenever work is started, completed, or changed in scope.
