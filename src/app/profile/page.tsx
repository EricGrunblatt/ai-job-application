"use client";

import { useEffect, useState } from "react";
import type {
  CandidateProfile,
  CompanyExperience,
  ExperienceBullet,
  RemotePreference,
  WorkRole,
} from "@/types/candidate";
import {
  createEmptyCertificationEntry,
  createEmptyCompanyExperience,
  createEmptyEducationEntry,
  createEmptyExperienceBullet,
  createEmptyProjectEntry,
  createEmptyWorkRole,
} from "@/lib/candidate/profile";

function formatRemotePreference(value?: RemotePreference) {
  switch (value) {
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";
    case "onsite":
      return "On-site";
    case "open":
    default:
      return "Open to Work";
  }
}

function formatDisplayDate(value?: string) {
  if (!value) return "Unknown";

  const safeDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(safeDate.getTime())) return value;

  return safeDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getCompanyDateRange(company: CompanyExperience) {
  if (!company.roles.length) return null;

  const validStarts = company.roles
    .map((role) => role.startDate)
    .filter((date): date is string => Boolean(date));

  const validEnds = company.roles
    .filter((role) => !role.current)
    .map((role) => role.endDate)
    .filter((date): date is string => Boolean(date));

  if (!validStarts.length) return null;

  const earliestStart = validStarts.reduce((min, current) => (current < min ? current : min));
  const latestEnd = validEnds.length
    ? validEnds.reduce((max, current) => (current > max ? current : max))
    : undefined;
  const hasCurrentRole = company.roles.some((role) => role.current);

  return `${formatDisplayDate(earliestStart)} — ${hasCurrentRole ? "Present" : formatDisplayDate(latestEnd)}`;
}

function parseList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [skillDraft, setSkillDraft] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((response) => response.json())
      .then((data) => setProfile(data))
      .catch((error) => {
        console.error("Failed to fetch profile", error);
      });
  }, []);

  if (!profile) {
    return (
      <main className="profile-page">
        <div className="profile-shell">
          <div className="profile-body">
            <p className="profile-summary">Loading profile…</p>
          </div>
        </div>
      </main>
    );
  }

  const saveProfile = async (nextProfile: CandidateProfile) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextProfile),
      });

      if (!response.ok) {
        throw new Error("Profile save failed");
      }

      const savedProfile = (await response.json()) as CandidateProfile;
      setProfile(savedProfile);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = async () => {
    if (isEditing && profile) {
      await saveProfile(profile);
    }

    setIsEditing((current) => !current);
  };

  const addSkillDraft = () => {
    if (!profile) return;

    const nextValue = skillDraft.trim();
    if (!nextValue) {
      setSkillDraft("");
      return;
    }

    const newSkills = nextValue
      .split(/[\s,]+/)
      .map((skill) => skill.trim())
      .filter(Boolean)
      .filter((skill) => !profile.skills.some((entry) => entry.name.toLowerCase() === skill.toLowerCase()));

    if (!newSkills.length) {
      setSkillDraft("");
      return;
    }

    updateProfile(
      "skills",
      [...profile.skills, ...newSkills.map((name) => ({ name, category: "Custom" }))],
    );
    setSkillDraft("");
  };

  const removeSkill = (skillName: string) => {
    if (!profile) return;
    updateProfile(
      "skills",
      profile.skills.filter((skill) => skill.name !== skillName),
    );
  };

  const updateProfile = <K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) => {
    setProfile((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateCompany = (companyIndex: number, updates: Partial<CompanyExperience>) => {
    setProfile((current) => {
      if (!current) return current;

      const nextCompanies = current.companyExperiences.map((company, index) =>
        index === companyIndex ? { ...company, ...updates } : company,
      );

      return {
        ...current,
        companyExperiences: nextCompanies,
        workExperiences: nextCompanies,
      };
    });
  };

  const updateRole = (companyIndex: number, roleIndex: number, updates: Partial<WorkRole>) => {
    setProfile((current) => {
      if (!current) return current;

      const nextCompanies = current.companyExperiences.map((company, companyPosition) => {
        if (companyPosition !== companyIndex) return company;

        return {
          ...company,
          roles: company.roles.map((role, rolePosition) =>
            rolePosition === roleIndex ? { ...role, ...updates } : role,
          ),
        };
      });

      return {
        ...current,
        companyExperiences: nextCompanies,
        workExperiences: nextCompanies,
      };
    });
  };

  const addCompany = () => {
    if (!profile) return;

    const nextCompanies = [...profile.companyExperiences, createEmptyCompanyExperience()];
    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const removeCompany = (companyIndex: number) => {
    if (!profile) return;

    const nextCompanies = profile.companyExperiences.filter((_, index) => index !== companyIndex);
    if (!nextCompanies.length) {
      nextCompanies.push(createEmptyCompanyExperience());
    }

    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const addRole = (companyIndex: number) => {
    if (!profile) return;

    const nextCompanies = profile.companyExperiences.map((company, index) => {
      if (index !== companyIndex) return company;
      return {
        ...company,
        roles: [...company.roles, createEmptyWorkRole()],
      };
    });

    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const removeRole = (companyIndex: number, roleIndex: number) => {
    if (!profile) return;

    const nextCompanies = profile.companyExperiences.map((company, index) => {
      if (index !== companyIndex) return company;

      const nextRoles = company.roles.filter((_, currentIndex) => currentIndex !== roleIndex);
      return {
        ...company,
        roles: nextRoles.length ? nextRoles : [createEmptyWorkRole()],
      };
    });

    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const addBullet = (companyIndex: number, roleIndex: number) => {
    if (!profile) return;

    const nextCompanies = profile.companyExperiences.map((company, index) => {
      if (index !== companyIndex) return company;

      return {
        ...company,
        roles: company.roles.map((role, currentRoleIndex) => {
          if (currentRoleIndex !== roleIndex) return role;
          return {
            ...role,
            bullets: [...role.bullets, createEmptyExperienceBullet()],
          };
        }),
      };
    });

    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const removeBullet = (companyIndex: number, roleIndex: number, bulletIndex: number) => {
    if (!profile) return;

    const nextCompanies = profile.companyExperiences.map((company, index) => {
      if (index !== companyIndex) return company;

      return {
        ...company,
        roles: company.roles.map((role, currentRoleIndex) => {
          if (currentRoleIndex !== roleIndex) return role;

          const nextBullets = role.bullets.filter((_, currentBulletIndex) => currentBulletIndex !== bulletIndex);
          return {
            ...role,
            bullets: nextBullets.length ? nextBullets : [createEmptyExperienceBullet()],
          };
        }),
      };
    });

    updateProfile("companyExperiences", nextCompanies);
    updateProfile("workExperiences", nextCompanies);
  };

  const updateBullet = (
    companyIndex: number,
    roleIndex: number,
    bulletIndex: number,
    updates: Partial<ExperienceBullet>,
  ) => {
    setProfile((current) => {
      if (!current) return current;

      const nextCompanies = current.companyExperiences.map((company, companyPosition) => {
        if (companyPosition !== companyIndex) return company;

        return {
          ...company,
          roles: company.roles.map((role, rolePosition) => {
            if (rolePosition !== roleIndex) return role;

            return {
              ...role,
              bullets: role.bullets.map((bullet, bulletPosition) =>
                bulletPosition === bulletIndex ? { ...bullet, ...updates } : bullet,
              ),
            };
          }),
        };
      });

      return {
        ...current,
        companyExperiences: nextCompanies,
        workExperiences: nextCompanies,
      };
    });
  };

  const addEducation = () => {
    if (!profile) return;
    updateProfile("education", [...profile.education, createEmptyEducationEntry()]);
  };

  const removeEducation = (index: number) => {
    if (!profile) return;
    const nextEducation = profile.education.filter((_, currentIndex) => currentIndex !== index);
    updateProfile("education", nextEducation.length ? nextEducation : [createEmptyEducationEntry()]);
  };

  const addProject = () => {
    if (!profile) return;
    updateProfile("projects", [...profile.projects, createEmptyProjectEntry()]);
  };

  const removeProject = (index: number) => {
    if (!profile) return;
    const nextProjects = profile.projects.filter((_, currentIndex) => currentIndex !== index);
    updateProfile("projects", nextProjects.length ? nextProjects : [createEmptyProjectEntry()]);
  };

  const addCertification = () => {
    if (!profile) return;
    updateProfile("certifications", [...profile.certifications, createEmptyCertificationEntry()]);
  };

  const removeCertification = (index: number) => {
    if (!profile) return;
    const nextCertifications = profile.certifications.filter((_, currentIndex) => currentIndex !== index);
    updateProfile("certifications", nextCertifications.length ? nextCertifications : [createEmptyCertificationEntry()]);
  };

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

          <div className="profile-actions">
            <button
              type="button"
              className="profile-action-toggle"
              onClick={handleEditToggle}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : isEditing ? "Done editing" : "Edit profile"}
            </button>
            <div className="profile-badges">
              <span className="profile-badge">{formatRemotePreference(profile.remotePreference)}</span>
              <span className="profile-badge">{profile.targetRoles[0] ?? "Open to opportunities"}</span>
            </div>
          </div>
        </header>

        <div className="profile-body">
          {isEditing ? (
            <>
              <section className="profile-grid">
                <div className="profile-card">
                  <h2>Summary</h2>
                  <textarea
                    className="editor-textarea"
                    value={profile.summary ?? ""}
                    onChange={(event) => updateProfile("summary", event.target.value)}
                  />
                </div>

                <div className="profile-card">
                  <h2>Resume reference</h2>
                  <textarea
                    className="editor-textarea"
                    value={profile.resumeReferenceText ?? ""}
                    onChange={(event) => updateProfile("resumeReferenceText", event.target.value)}
                    placeholder="Paste your existing resume or a format reference here. The app will use this as the template baseline for tailored resumes."
                  />
                </div>

                <div className="profile-card">
                  <h2>Preferences</h2>
                  <div className="editor-grid">
                    <label className="editor-field">
                      <span>Work style</span>
                      <select
                        value={profile.remotePreference ?? "open"}
                        onChange={(event) =>
                          updateProfile("remotePreference", event.target.value as RemotePreference)
                        }
                      >
                        <option value="open">Open to Work</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
                      </select>
                    </label>
                    <label className="editor-field">
                      <span>Salary floor</span>
                      <input
                        type="number"
                        value={profile.minimumSalary ?? 0}
                        onChange={(event) => updateProfile("minimumSalary", Number(event.target.value))}
                      />
                    </label>
                    <label className="editor-field editor-field-wide">
                      <span>Target roles</span>
                      <input
                        value={profile.targetRoles.join(", ")}
                        onChange={(event) =>
                          updateProfile("targetRoles", parseList(event.target.value))
                        }
                      />
                    </label>
                    <label className="editor-field editor-field-wide">
                      <span>Preferred locations</span>
                      <input
                        value={profile.preferredLocations.join(", ")}
                        onChange={(event) =>
                          updateProfile("preferredLocations", parseList(event.target.value))
                        }
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="profile-card" style={{ marginBottom: "24px" }}>
                <h2>Core skills</h2>
                <div className="skill-editor">
                  {profile.skills.map((skill) => (
                    <span key={`${skill.category}-${skill.name}`} className="skill-tag">
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${skill.name}`}
                        onClick={() => removeSkill(skill.name)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className="skill-input"
                    value={skillDraft}
                    placeholder="Add a skill"
                    onChange={(event) => setSkillDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (["Enter", ",", "Tab", " "].includes(event.key)) {
                        event.preventDefault();
                        addSkillDraft();
                      }
                    }}
                    onBlur={addSkillDraft}
                  />
                </div>
              </section>

              <section style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>Experience</h2>
                  <button type="button" className="inline-action-button" onClick={addCompany}>+ Add company</button>
                </div>
                <div className="experience-stack">
                  {profile.companyExperiences.map((company, companyIndex) => (
                    <div key={`${company.company}-${companyIndex}`} className="company-card">
                      <div className="company-header">
                        <div className="company-editor-group">
                          <label className="editor-field company-name-field">
                            <span>Company</span>
                            <input
                              value={company.company}
                              onChange={(event) =>
                                updateCompany(companyIndex, { company: event.target.value })
                              }
                            />
                          </label>
                          <label className="editor-field company-location-field">
                            <span>Location</span>
                            <input
                              value={company.location ?? ""}
                              onChange={(event) =>
                                updateCompany(companyIndex, { location: event.target.value })
                              }
                            />
                          </label>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="company-date-range">{getCompanyDateRange(company)}</span>
                          <button type="button" className="inline-action-button small" onClick={() => removeCompany(companyIndex)}>Remove</button>
                        </div>
                      </div>

                      <div className="role-stack">
                        {company.roles.map((role, roleIndex) => (
                          <div key={`${company.company}-${role.title}-${roleIndex}`} className="role-card">
                            <div className="role-header editable-role-header">
                              <label className="editor-field role-title-field">
                                <span>Title</span>
                                <input
                                  value={role.title}
                                  onChange={(event) =>
                                    updateRole(companyIndex, roleIndex, { title: event.target.value })
                                  }
                                />
                              </label>
                              <label className="editor-field role-date-field">
                                <span>Start</span>
                                <input
                                  type="date"
                                  value={role.startDate ?? ""}
                                  onChange={(event) =>
                                    updateRole(companyIndex, roleIndex, { startDate: event.target.value })
                                  }
                                />
                              </label>
                              <label className="editor-field role-date-field">
                                <span>End</span>
                                <input
                                  type="date"
                                  value={role.endDate ?? ""}
                                  onChange={(event) => {
                                    const nextEndDate = event.target.value || undefined;
                                    updateRole(companyIndex, roleIndex, {
                                      endDate: nextEndDate,
                                      current: !nextEndDate,
                                    });
                                  }}
                                />
                              </label>
                              <label className="checkbox-field">
                                <input
                                  type="checkbox"
                                  checked={Boolean(role.current)}
                                  onChange={(event) =>
                                    updateRole(companyIndex, roleIndex, {
                                      current: event.target.checked,
                                      endDate: event.target.checked ? undefined : role.endDate,
                                    })
                                  }
                                />
                                <span>Current</span>
                              </label>
                            </div>

                            <div className="bullet-editor-list">
                              {role.bullets.map((bullet, bulletIndex) => (
                                <div key={`${company.company}-${role.title}-bullet-${bulletIndex}`} className="bullet-editor">
                                  <label className="editor-field">
                                    <span>Achievement</span>
                                    <textarea
                                      value={bullet.text}
                                      onChange={(event) =>
                                        updateBullet(companyIndex, roleIndex, bulletIndex, {
                                          text: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="editor-field">
                                    <span>Metrics</span>
                                    <input
                                      value={(bullet.metrics ?? []).join(", ")}
                                      onChange={(event) =>
                                        updateBullet(companyIndex, roleIndex, bulletIndex, {
                                          metrics: parseList(event.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="editor-field">
                                    <span>Skills</span>
                                    <input
                                      value={(bullet.skills ?? []).join(", ")}
                                      onChange={(event) =>
                                        updateBullet(companyIndex, roleIndex, bulletIndex, {
                                          skills: parseList(event.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                  <div className="stack-actions">
                                    <button type="button" className="inline-action-button small" onClick={() => addBullet(companyIndex, roleIndex)}>+ Add achievement</button>
                                    <button type="button" className="inline-action-button small danger" onClick={() => removeBullet(companyIndex, roleIndex, bulletIndex)}>Remove achievement</button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="stack-actions" style={{ marginTop: "16px" }}>
                              <button type="button" className="inline-action-button small" onClick={() => addRole(companyIndex)}>+ Add role</button>
                              <button type="button" className="inline-action-button small danger" onClick={() => removeRole(companyIndex, roleIndex)}>Remove role</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="profile-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0 }}>Education</h2>
                  <button type="button" className="inline-action-button" onClick={addEducation}>+ Add education</button>
                </div>
                <div className="education-stack edit-education-list">
                  {profile.education.map((edu, index) => (
                    <div key={`${edu.school}-${index}`} className="education-item">
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" className="inline-action-button small danger" onClick={() => removeEducation(index)}>Remove</button>
                      </div>
                      <label className="editor-field">
                        <span>School</span>
                        <input
                          value={edu.school}
                          onChange={(event) => {
                            const nextEducation = [...profile.education];
                            nextEducation[index] = { ...edu, school: event.target.value };
                            updateProfile("education", nextEducation);
                          }}
                        />
                      </label>
                      <label className="editor-field">
                        <span>Degree</span>
                        <input
                          value={edu.degree}
                          onChange={(event) => {
                            const nextEducation = [...profile.education];
                            nextEducation[index] = { ...edu, degree: event.target.value };
                            updateProfile("education", nextEducation);
                          }}
                        />
                      </label>
                      <label className="editor-field">
                        <span>Major</span>
                        <input
                          value={edu.major ?? ""}
                          onChange={(event) => {
                            const nextEducation = [...profile.education];
                            nextEducation[index] = { ...edu, major: event.target.value };
                            updateProfile("education", nextEducation);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section className="profile-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0 }}>Projects</h2>
                  <button type="button" className="inline-action-button" onClick={addProject}>+ Add project</button>
                </div>
                <div className="education-stack edit-education-list">
                  {profile.projects.map((project, index) => (
                    <div key={`${project.name || "project"}-${index}`} className="education-item">
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" className="inline-action-button small danger" onClick={() => removeProject(index)}>Remove</button>
                      </div>
                      <label className="editor-field">
                        <span>Name</span>
                        <input
                          value={project.name}
                          onChange={(event) => {
                            const nextProjects = [...profile.projects];
                            nextProjects[index] = { ...project, name: event.target.value };
                            updateProfile("projects", nextProjects);
                          }}
                        />
                      </label>
                      <label className="editor-field">
                        <span>Description</span>
                        <textarea
                          value={project.description ?? ""}
                          onChange={(event) => {
                            const nextProjects = [...profile.projects];
                            nextProjects[index] = { ...project, description: event.target.value };
                            updateProfile("projects", nextProjects);
                          }}
                        />
                      </label>
                      <label className="editor-field">
                        <span>Technologies</span>
                        <input
                          value={(project.technologies ?? []).join(", ")}
                          onChange={(event) => {
                            const nextProjects = [...profile.projects];
                            nextProjects[index] = { ...project, technologies: parseList(event.target.value) };
                            updateProfile("projects", nextProjects);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>

              <section className="profile-card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <h2 style={{ margin: 0 }}>Certifications</h2>
                  <button type="button" className="inline-action-button" onClick={addCertification}>+ Add certification</button>
                </div>
                <div className="education-stack edit-education-list">
                  {profile.certifications.map((certification, index) => (
                    <div key={`${certification.name || "cert"}-${index}`} className="education-item">
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" className="inline-action-button small danger" onClick={() => removeCertification(index)}>Remove</button>
                      </div>
                      <label className="editor-field">
                        <span>Name</span>
                        <input
                          value={certification.name}
                          onChange={(event) => {
                            const nextCertifications = [...profile.certifications];
                            nextCertifications[index] = { ...certification, name: event.target.value };
                            updateProfile("certifications", nextCertifications);
                          }}
                        />
                      </label>
                      <label className="editor-field">
                        <span>Issuer</span>
                        <input
                          value={certification.issuer ?? ""}
                          onChange={(event) => {
                            const nextCertifications = [...profile.certifications];
                            nextCertifications[index] = { ...certification, issuer: event.target.value };
                            updateProfile("certifications", nextCertifications);
                          }}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
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
                      <span className="preference-value">
                        {formatRemotePreference(profile.remotePreference)}
                      </span>
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
                    <div key={`${company.company}-${company.location ?? "location"}`} className="company-card">
                      <div className="company-header">
                        <h3 className="company-name">{company.company}</h3>
                        <div className="company-meta-row">
                          {company.location ? <span className="company-location">{company.location}</span> : null}
                          {getCompanyDateRange(company) ? (
                            <span className="company-date-range">{getCompanyDateRange(company)}</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="role-stack">
                        {company.roles.map((role) => (
                          <div key={`${company.company}-${role.title}`} className="role-card">
                            <div className="role-header">
                              <h4 className="role-title">{role.title}</h4>
                              <span className="role-dates">
                                {formatDisplayDate(role.startDate)} — {role.current ? "Present" : formatDisplayDate(role.endDate)}
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
            </>
          )}
        </div>
      </div>
    </main>
  );
}
