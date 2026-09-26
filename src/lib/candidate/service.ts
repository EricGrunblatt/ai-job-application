import { ericGrunblattProfile } from "@/lib/candidate/profile";
import prisma from "@/lib/db/prisma";
import type { CandidateProfile } from "@/types/candidate";

function normalizeProfile(profile: CandidateProfile): CandidateProfile {
  return {
    ...ericGrunblattProfile,
    ...profile,
    skills: profile.skills?.length ? profile.skills : ericGrunblattProfile.skills,
    targetRoles: profile.targetRoles?.length ? profile.targetRoles : ericGrunblattProfile.targetRoles,
    preferredLocations: profile.preferredLocations?.length
      ? profile.preferredLocations
      : ericGrunblattProfile.preferredLocations,
    companyExperiences: profile.companyExperiences?.length
      ? profile.companyExperiences
      : ericGrunblattProfile.companyExperiences,
    education: profile.education?.length ? profile.education : ericGrunblattProfile.education,
  };
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  try {
    const candidate = await prisma.candidate.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (candidate?.profileData && typeof candidate.profileData === "object") {
      return normalizeProfile(candidate.profileData as unknown as CandidateProfile);
    }
  } catch (error) {
    console.warn("Falling back to seeded profile because Prisma is unavailable.", error);
  }

  return ericGrunblattProfile;
}

export async function saveCandidateProfile(profile: CandidateProfile): Promise<CandidateProfile> {
  const nextProfile = normalizeProfile(profile);

  try {
    const existing = await prisma.candidate.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (existing) {
      const updated = await prisma.candidate.update({
        where: { id: existing.id },
        data: {
          firstName: nextProfile.firstName,
          lastName: nextProfile.lastName,
          email: nextProfile.email,
          phone: nextProfile.phone ?? null,
          city: nextProfile.city ?? null,
          state: nextProfile.state ?? null,
          country: nextProfile.country ?? null,
          linkedInUrl: nextProfile.linkedInUrl ?? null,
          githubUrl: nextProfile.githubUrl ?? null,
          portfolioUrl: nextProfile.portfolioUrl ?? null,
          summary: nextProfile.summary ?? null,
          remotePreference: nextProfile.remotePreference ?? null,
          willingnessToRelocate: nextProfile.willingnessToRelocate ?? null,
          minimumSalary: nextProfile.minimumSalary ?? null,
          preferredSalary: nextProfile.preferredSalary ?? null,
          targetRoles: nextProfile.targetRoles,
          preferredLocations: nextProfile.preferredLocations,
          profileData: nextProfile as any,
        },
      });

      return normalizeProfile((updated.profileData as unknown as CandidateProfile) ?? nextProfile);
    }

    const created = await prisma.candidate.create({
      data: {
        firstName: nextProfile.firstName,
        lastName: nextProfile.lastName,
        email: nextProfile.email,
        phone: nextProfile.phone ?? null,
        city: nextProfile.city ?? null,
        state: nextProfile.state ?? null,
        country: nextProfile.country ?? null,
        linkedInUrl: nextProfile.linkedInUrl ?? null,
        githubUrl: nextProfile.githubUrl ?? null,
        portfolioUrl: nextProfile.portfolioUrl ?? null,
        summary: nextProfile.summary ?? null,
        remotePreference: nextProfile.remotePreference ?? null,
        willingnessToRelocate: nextProfile.willingnessToRelocate ?? null,
        minimumSalary: nextProfile.minimumSalary ?? null,
        preferredSalary: nextProfile.preferredSalary ?? null,
        targetRoles: nextProfile.targetRoles,
        preferredLocations: nextProfile.preferredLocations,
        profileData: nextProfile as any,
      },
    });

    return normalizeProfile((created.profileData as unknown as CandidateProfile) ?? nextProfile);
  } catch (error) {
    console.warn("Prisma profile save unavailable; returning in-memory profile.", error);
    return nextProfile;
  }
}
