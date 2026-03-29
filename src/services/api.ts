import type { Lead, Job, SearchParams, JobSearchParams, APIResponse } from '../types';

export class ApiService {
  /**
   * Search for leads based on criteria via Netlify Serverless Functions.
   * This safely encapsulates the Apollo API key from regular browser users.
   */
  static async searchLeads(params: SearchParams): Promise<APIResponse<Lead[]>> {
    try {
      const response = await fetch('/.netlify/functions/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error(`Integration error! Status: ${response.status}`);
      return await response.json() as APIResponse<Lead[]>;

    } catch (e) {
      console.error('Frontend ApiService Error:', e);
      return { data: null, error: 'Failed to contact the search provider.', status: 500 };
    }
  }

  static async searchJobs(params: JobSearchParams): Promise<APIResponse<Job[]>> {
    try {
      const response = await fetch('/.netlify/functions/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) throw new Error(`Jobs Integration error! Status: ${response.status}`);
      return await response.json() as APIResponse<Job[]>;

    } catch (e) {
      console.error('Frontend Jobs API Error:', e);
      return { data: null, error: 'Failed to scour job offers from sources.', status: 500 };
    }
  }
}
