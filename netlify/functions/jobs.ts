import type { Handler } from '@netlify/functions';
import type { Job, JobSearchParams, APIResponse } from '../../src/types';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ data: null, error: 'Method Not Allowed', status: 405 }),
    };
  }

  try {
    if (!event.body) throw new Error('Request body is empty');
    const params: JobSearchParams = JSON.parse(event.body);

    console.log('MAX scouring for jobs:', params);

    const ADZUNA_ID = process.env.ADZUNA_APP_ID || '';
    const ADZUNA_KEY = process.env.ADZUNA_APP_KEY || '';

    // Parallel fetch from all available real-world sources
    const results = await Promise.allSettled([
      fetchArbeitnow(params),
      fetchRemotive(params),
      (ADZUNA_ID && ADZUNA_KEY) ? fetchAdzuna(params, ADZUNA_ID, ADZUNA_KEY) : Promise.resolve([]),
      (params.country?.toLowerCase() === 'united states' || params.country?.toLowerCase() === 'usa') ? fetchUSAJobs(params) : Promise.resolve([])
    ]);

    let allJobs: Job[] = [];
    results.forEach(res => {
      if (res.status === 'fulfilled') allJobs = [...allJobs, ...res.value];
    });

    // Final sorting and filtering
    allJobs = allJobs.slice(0, 100);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: allJobs,
        error: allJobs.length === 0 ? 'No job offers found after scouring all sources. Try broadening your keywords.' : null,
        status: 200
      } as APIResponse<Job[]>)
    };

  } catch (error: any) {
    console.error('SERVERLESS JOBS ERROR:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ data: null, error: 'Failed to scour job sites.', status: 500 }),
    };
  }
};

async function fetchAdzuna(params: JobSearchParams, id: string, key: string): Promise<Job[]> {
  try {
    // Adzuna supports multiple countries: us, gb, ca, au, etc.
    const countryMap: { [key: string]: string } = { 'united states': 'us', 'usa': 'us', 'united kingdom': 'gb', 'uk': 'gb', 'canada': 'ca' };
    const countryCode = countryMap[params.country.toLowerCase()] || 'us';
    
    const query = encodeURIComponent(params.keywords || params.domain || 'job');
    const location = encodeURIComponent(params.city || '');
    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${id}&app_key=${key}&results_per_page=20&what=${query}&where=${location}`;
    
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    
    return (data.results || []).map((j: any) => ({
      id: `adzuna-${j.id}`,
      title: j.title.replace(/<[^>]*>/g, ''),
      companyName: j.company.display_name,
      location: j.location.display_name,
      salary: j.salary_min ? `${j.salary_min} - ${j.salary_max}` : 'Competitive',
      descriptionSnippet: j.description.substring(0, 180) + '...',
      url: j.redirect_url,
      postedAt: 'Live',
      source: 'Adzuna Hub',
      tags: [j.category.label, 'Verified']
    }));
  } catch (e) {
    console.error('Adzuna Error:', e);
    return [];
  }
}

async function fetchUSAJobs(params: JobSearchParams): Promise<Job[]> {
  try {
    // Public search of USAJobs (limited without Host key, but we can try)
    const query = params.keywords || params.domain || '';
    const res = await fetch(`https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(query)}&LocationName=${encodeURIComponent(params.city || '')}`, {
      headers: { 'User-Agent': 'Leadora-App' } // USAJobs sometimes requires a host header, this might fail without a real key
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.SearchResult?.SearchResultItems || []).map((item: any) => {
      const j = item.MatchedObjectDescriptor;
      return {
        id: `usajobs-${j.PositionID}`,
        title: j.PositionTitle,
        companyName: j.OrganizationName,
        location: j.PositionLocation[0]?.LocationName || 'USA',
        salary: `${j.PositionRemuneration[0]?.MinimumRange} - ${j.PositionRemuneration[0]?.MaximumRange}`,
        descriptionSnippet: j.UserArea?.Details?.JobSummary?.substring(0, 180) + '...',
        url: j.PositionURI,
        postedAt: 'Government Scoured',
        source: 'USAJobs',
        tags: [j.JobCategory[0]?.Name, 'Public Sector']
      };
    });
  } catch (e) {
    console.error('USAJobs Error:', e);
    return [];
  }
}

async function fetchArbeitnow(params: JobSearchParams): Promise<Job[]> {
  try {
    const res = await fetch(`https://www.arbeitnow.com/api/job-board-api`);
    if (!res.ok) return [];
    const data = await res.json();
    const query = params.keywords || params.domain || '';
    return (data.data || [])
      .filter((rj: any) => {
        const matchesCountry = !params.country || rj.location.toLowerCase().includes(params.country.toLowerCase());
        const loc = rj.location.toLowerCase();
        const matchesCity = !params.city || loc.includes(params.city.toLowerCase());
        const matchesKeyword = !query || rj.title.toLowerCase().includes(query.toLowerCase());
        return matchesCountry && (matchesCity || !params.city) && matchesKeyword; // Fuzzy city
      })
      .map((rj: any) => ({
        id: `arbeit-${rj.slug}`,
        title: rj.title,
        companyName: rj.company_name,
        location: rj.location,
        descriptionSnippet: rj.description.replace(/<[^>]*>/g, '').substring(0, 180) + '...',
        url: rj.url,
        postedAt: 'Recently Scoured',
        source: 'Arbeitnow',
        tags: rj.tags || []
      }));
  } catch (e) { return []; }
}

async function fetchRemotive(params: JobSearchParams): Promise<Job[]> {
  try {
    const query = params.keywords || params.domain || '';
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || [])
      .filter((rj: any) => {
         const loc = rj.candidate_required_location || '';
         const matchesCountry = !params.country || loc.toLowerCase().includes(params.country.toLowerCase()) || loc.toLowerCase() === 'anywhere';
         return matchesCountry;
      })
      .map((rj: any) => ({
        id: `remotive-${rj.id}`,
        title: rj.title,
        companyName: rj.company_name,
        location: rj.candidate_required_location || 'Remote',
        salary: rj.salary || null,
        descriptionSnippet: rj.description.replace(/<[^>]*>/g, '').substring(0, 180) + '...',
        url: rj.url,
        postedAt: 'Remote Global',
        source: 'Remotive Hub',
        tags: [rj.category, 'Remote']
      }));
  } catch (e) { return []; }
}
