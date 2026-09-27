import type { Job } from "@/types/job";

import { sampleJobs } from "@/lib/jobs/sample";

import { searchJobs, type JobSearchCriteria } from "./search";

export interface JobSource {
  search(criteria: JobSearchCriteria): Promise<Job[]>;
}

export class DemoJobSource implements JobSource {
  async search(criteria: JobSearchCriteria): Promise<Job[]> {
    return searchJobs(criteria, sampleJobs);
  }
}
