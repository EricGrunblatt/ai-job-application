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

### Milestone 3 — Job Model
- [x] Job schema
- [x] Job normalization utilities
- [x] Basic job detail page

### Milestone 4 — Job Description Analyzer
- [ ] OpenAI client
- [ ] Prompt
- [ ] Zod schema
- [ ] Analyzer service
- [ ] /api/jobs/analyze
- [ ] Job analysis UI

### Milestone 5 — Resume Tailoring
- [ ] Candidate/job matching
- [ ] Relevant fact selection
- [ ] Resume content generation
- [ ] Fact IDs on generated content
- [ ] Resume validation
- [ ] Deterministic resume rendering

### Milestone 6 — Cover Letter
- [ ] Cover letter prompt
- [ ] Structured output
- [ ] Validation
- [ ] Rendering
- [ ] Review UI

### Milestone 7 — Application Questions
- [ ] Question extraction
- [ ] Question classification
- [ ] Answer generation
- [ ] Confidence classification
- [ ] Human review flags

### Milestone 8 — Application Review
- [ ] Review dashboard
- [ ] Resume preview/download
- [ ] Cover letter preview/edit
- [ ] Question review/edit flow
- [ ] Explicit approval gate

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
- [ ] JobSource abstraction
- [ ] First supported job source
- [ ] Normalization
- [ ] Deduplication
- [ ] Search UI

### Milestone 11 — Job Matching
- [ ] Candidate/job matching
- [ ] Transparent match reasons
- [ ] Gaps
- [ ] Search result filtering/sorting

### Milestone 12 — Application History
- [ ] Application records
- [ ] Statuses
- [ ] Resume/cover-letter version references
- [ ] Notes
- [ ] Search/filter history

## Notes
- The project is currently in the profile and job-model phase of development.
- This checklist should be treated as the active status tracker for all agents.
- Update it whenever work is started, completed, or changed in scope.
