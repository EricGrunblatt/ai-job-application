import { ericGrunblattProfile } from "@/lib/candidate/profile";
import type { CandidateProfile } from "@/types/candidate";

export async function getCandidateProfile(): Promise<CandidateProfile> {
  return ericGrunblattProfile;
}
