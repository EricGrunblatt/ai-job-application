import { getCandidateProfile } from "@/lib/candidate/service";

export default async function ProfilePage() {
  const profile = await getCandidateProfile();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-slate-900">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Candidate profile
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          {profile.firstName} {profile.lastName}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
          <span>{profile.email}</span>
          <span>•</span>
          <span>{profile.phone}</span>
          <span>•</span>
          <span>
            {profile.city}, {profile.state}
          </span>
        </div>
      </header>

      <section className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Summary</h2>
          <p className="text-slate-700">{profile.summary}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Preferences</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>Remote preference: {profile.remotePreference ?? "Not specified"}</li>
            <li>Target roles: {profile.targetRoles.join(", ")}</li>
            <li>Preferred locations: {profile.preferredLocations.join(", ")}</li>
            <li>Salary target: ${profile.minimumSalary?.toLocaleString() ?? "n/a"} min</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill) => (
            <span
              key={`${skill.category}-${skill.name}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Experience</h2>
        <div className="space-y-5">
          {profile.workExperiences.map((job, index) => (
            <div key={`${job.company}-${job.title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <p className="text-slate-600">{job.company}</p>
                </div>
                <span className="text-sm text-slate-500">
                  {job.startDate ?? "Unknown"} — {job.current ? "Present" : job.endDate ?? "Unknown"}
                </span>
              </div>
              {job.description ? (
                <p className="mt-3 text-sm text-slate-700">{job.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">Verified facts</h2>
        <div className="space-y-4">
          {profile.candidateFacts.map((fact) => (
            <div key={fact.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{fact.role}</p>
                  <p className="text-sm text-slate-600">{fact.company}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-sm text-slate-700">{fact.text}</p>
              {fact.metrics.length > 0 ? (
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                  {fact.metrics.map((metric) => (
                    <li key={`${fact.id}-${metric}`}>{metric}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Education</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {profile.education.map((edu, index) => (
            <div key={`${edu.school}-${index}`}>
              <p className="font-medium text-slate-900">{edu.school}</p>
              <p className="text-slate-700">
                {edu.degree} {edu.major ? `in ${edu.major}` : ""}
              </p>
              {edu.gpa ? <p className="text-sm text-slate-600">GPA: {edu.gpa}</p> : null}
              {edu.graduationDate ? (
                <p className="text-sm text-slate-600">Graduated: {edu.graduationDate}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
