import { getCandidateProfile } from "@/lib/candidate/service";

export default async function ProfilePage() {
  const profile = await getCandidateProfile();

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <header className="profile-header">
          <div>
            <p className="profile-kicker">Candidate profile</p>
            <h1 className="profile-name">
              {profile.firstName} {profile.lastName}
            </h1>
            <div className="profile-meta">
              <span>{profile.email}</span>
              <span>•</span>
              <span>{profile.phone}</span>
              <span>•</span>
              <span>
                {profile.city}, {profile.state}
              </span>
            </div>
          </div>

          <div className="profile-badges">
            <span className="profile-badge">{profile.remotePreference ?? "Open to roles"}</span>
            <span className="profile-badge">{profile.targetRoles[0]}</span>
          </div>
        </header>

        <div className="profile-body">
          <section className="profile-grid">
            <div className="profile-card">
              <h2>Summary</h2>
              <p className="profile-summary">{profile.summary}</p>
            </div>

            <div className="profile-card">
              <h2>Preferences</h2>
              <div className="preferences-grid">
                <div className="preference-item">
                  <span className="preference-label">Work style</span>
                  <span className="preference-value">{profile.remotePreference ?? "Not specified"}</span>
                </div>
                <div className="preference-item">
                  <span className="preference-label">Salary floor</span>
                  <span className="preference-value">${profile.minimumSalary?.toLocaleString() ?? "n/a"}</span>
                </div>
                <div className="preference-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="preference-label">Target roles</span>
                  <span className="preference-value">{profile.targetRoles.join(", ")}</span>
                </div>
                <div className="preference-item" style={{ gridColumn: "1 / -1" }}>
                  <span className="preference-label">Preferred locations</span>
                  <span className="preference-value">{profile.preferredLocations.join(", ")}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-card" style={{ marginBottom: "24px" }}>
            <h2>Core skills</h2>
            <div className="skill-list">
              {profile.skills.map((skill) => (
                <span key={`${skill.category}-${skill.name}`} className="skill-chip">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.3rem", fontWeight: 800 }}>Experience</h2>
            <div className="experience-stack">
              {profile.companyExperiences.map((company) => (
                <div key={company.company} className="company-card">
                  <div className="company-header">
                    <h3 className="company-name">{company.company}</h3>
                    {company.location ? <span className="company-location">{company.location}</span> : null}
                  </div>

                  <div className="role-stack">
                    {company.roles.map((role) => (
                      <div key={`${company.company}-${role.title}`} className="role-card">
                        <div className="role-header">
                          <h4 className="role-title">{role.title}</h4>
                          <span className="role-dates">
                            {role.startDate ?? "Unknown"} — {role.current ? "Present" : role.endDate ?? "Unknown"}
                          </span>
                        </div>

                        <ul className="role-bullets">
                          {role.bullets.map((bullet, bulletIndex) => (
                            <li key={`${company.company}-${role.title}-${bulletIndex}`} className="experience-bullet">
                              {bullet.text}
                              {bullet.metrics && bullet.metrics.length > 0 ? (
                                <ul className="metric-list">
                                  {bullet.metrics.map((metric) => (
                                    <li key={`${company.company}-${role.title}-${bulletIndex}-${metric}`}>{metric}</li>
                                  ))}
                                </ul>
                              ) : null}
                              {bullet.skills && bullet.skills.length > 0 ? (
                                <div style={{ marginTop: "10px" }}>
                                  {bullet.skills.map((skill) => (
                                    <span key={`${company.company}-${role.title}-${bulletIndex}-${skill}`} className="skill-inline">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-card">
            <h2>Education</h2>
            <div className="education-stack">
              {profile.education.map((edu, index) => (
                <div key={`${edu.school}-${index}`} className="education-item">
                  <p className="company-name" style={{ marginBottom: "4px" }}>{edu.school}</p>
                  <p className="profile-meta-copy">
                    {edu.degree} {edu.major ? `in ${edu.major}` : ""}
                  </p>
                  {edu.gpa ? <p className="profile-meta-copy">GPA: {edu.gpa}</p> : null}
                  {edu.graduationDate ? (
                    <p className="profile-meta-copy">Graduated: {edu.graduationDate}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
