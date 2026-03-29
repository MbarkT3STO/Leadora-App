import type { Lead, SearchParams, APIResponse } from '../types';

export class ApiService {
  /**
   * Search for leads based on criteria via Netlify Serverless Functions.
   * This safely encapsulates the Apollo API key from regular browser users.
   */
  static async searchLeads(params: SearchParams): Promise<APIResponse<Lead[]>> {
    try {
      const response = await fetch('/.netlify/functions/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Integration error! Status: ${response.status}`);
      }

      // Return the typed payload sent from the serverless function
      return await response.json() as APIResponse<Lead[]>;

    } catch (e) {
      console.error('Frontend ApiService Error:', e);
      return {
        data: null,
        error: 'Failed to contact the search provider. Ensure your API Key is correctly configured.',
        status: 500
      };
    }
  }
}
