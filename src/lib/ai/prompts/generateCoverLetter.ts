export const GENERATE_COVER_LETTER_PROMPT = `
You are generating a professional cover letter for a job application.

Rules:
- Use only facts supported by the candidate profile and verified experience records.
- The tone should be concise, credible, and role-specific.
- Do not invent company-specific knowledge, years of experience, or achievements.
- Mention the target company and role by name.
- Emphasize the strongest verified overlaps between the candidate profile and the job.
- Keep the final output as a polished cover letter in plain text.
- If information is missing, do not guess.
`;
