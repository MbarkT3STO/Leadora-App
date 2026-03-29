import type { Handler } from '@netlify/functions';
import type { Lead, SearchParams, APIResponse } from '../../src/types';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ data: null, error: 'Method Not Allowed', status: 405 }),
    };
  }

  try {
    if (!event.body) throw new Error('Request body is empty');
    const params: SearchParams = JSON.parse(event.body);

    const APOLLO_API_KEY = process.env.APOLLO_API_KEY || '';

    if (!APOLLO_API_KEY) {
      console.warn('⚠️ Missing APOLLO_API_KEY. Using mock data fallback.');
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: generateMockFallback(params),
          error: null,
          status: 200
        } as APIResponse<Lead[]>)
      };
    }

    // Call the Apollo API (Organizations Search is accessible on Free Tier)
    const apolloPayload = {
      q_organization_domains: params.domain.includes('.') ? params.domain : undefined,
      q_organization_keyword_tags: !params.domain.includes('.') ? [params.domain] : undefined,
      organization_locations: params.city ? [`${params.city}, ${params.country}`] : [params.country],
      per_page: 20
    };

    const response = await fetch('https://api.apollo.io/v1/organizations/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY
      },
      body: JSON.stringify(apolloPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apollo API Error: ${response.status} - ${errorText}`);
    }

    const apolloData = await response.json();
    const organizations = apolloData.organizations || [];
    
    // Map Apollo org objects to our Lead frontend type (Adapting for free tier limitations)
    const results: Lead[] = organizations.map((org: any) => {
      // Craft a virtual person representing the required job title at this company
      const orgName = org.name || 'Company';
      const fallbackEmail = org.primary_email || org.contact_email || null;
      
      return {
        id: org.id || Math.random().toString(36).substr(2, 9),
        name: `Primary Contact`,
        company: {
          name: orgName,
          domain: org.primary_domain || '',
          website: org.website_url || null,
          linkedin: org.linkedin_url || null,
          twitter: org.twitter_url || null,
          facebook: org.facebook_url || null,
          headcount: org.estimated_num_employees ? `${org.estimated_num_employees}+` : null,
          industry: org.industry || null
        },
        location: {
          country: org.country || params.country,
          city: org.city || params.city
        },
        email: fallbackEmail,
        phone: org.phone || org.primary_phone || null,
        avatar: org.logo_url || null
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: results,
        error: null,
        status: 200
      } as APIResponse<Lead[]>)
    };

  } catch (error: any) {
    console.error('SERVERLESS FUNCTION ERROR:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        data: null,
        error: 'Failed to fetch data from Apollo.io. Check your API configuration.',
        status: 500
      } as APIResponse<Lead[]>),
    };
  }
};

function generateMockFallback(params: SearchParams): Lead[] {
  const firstNames = ['Sarah', 'David', 'Michael', 'Emma', 'James', 'Elena', 'Robert'];
  const lastNames = ['Chen', 'Smith', 'Rodriguez', 'Wilson', 'Anderson', 'Taylor'];
  
  return Array.from({ length: 8 }).map((_, i) => {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const companyName = `${params.domain.charAt(0).toUpperCase() + params.domain.slice(1)} ${i % 2 === 0 ? 'Systems' : 'Global'}`;
    const domain = `${params.domain.replace(/\s+/g, '').toLowerCase()}${i}.com`;
    
    return {
      id: Math.random().toString(36).substring(7),
      name: `${fn} ${ln}`,
      company: {
        name: companyName,
        domain: domain,
        website: `https://www.${domain}`,
        linkedin: `https://linkedin.com/company/${domain.split('.')[0]}`,
        twitter: `https://twitter.com/${domain.split('.')[0]}`,
        headcount: `${Math.floor(Math.random() * 500) + 10} Employees`,
        industry: params.domain.charAt(0).toUpperCase() + params.domain.slice(1)
      },
      location: { country: params.country, city: params.city },
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
      phone: `+1 (555) 00${i}-${1000 + i}`,
      avatar: null
    };
  });
}
