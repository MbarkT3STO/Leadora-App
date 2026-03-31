import type { Handler } from '@netlify/functions';
import type { EnrichmentData, APIResponse } from '../../src/types';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ data: null, error: 'Method Not Allowed', status: 405 }) };
  }

  try {
    if (!event.body) throw new Error('Request body is empty');
    const { domain }: { domain: string } = JSON.parse(event.body);
    if (!domain) throw new Error('domain is required');

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    const [techData, clearbitData] = await Promise.allSettled([
      fetchBuiltWith(cleanDomain),
      fetchClearbit(cleanDomain),
    ]);

    const tech = techData.status === 'fulfilled' ? techData.value : { techStack: [], tags: [] };
    const cb = clearbitData.status === 'fulfilled' ? clearbitData.value : null;

    const result: EnrichmentData = {
      domain: cleanDomain,
      techStack: tech.techStack,
      tags: tech.tags,
      companyType: cb?.type ?? null,
      foundedYear: cb?.foundedYear ?? null,
      revenue: cb?.annualRevenue ?? null,
      description: cb?.description ?? null,
      logoUrl: cb?.logo ?? null,
      crunchbase: cb?.crunchbase ?? null,
      alexa_rank: cb?.alexaUsRank ?? null,
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: result, error: null, status: 200 } as APIResponse<EnrichmentData>),
    };
  } catch (err: any) {
    console.error('Enrich error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ data: null, error: 'Enrichment failed.', status: 500 }),
    };
  }
};

async function fetchBuiltWith(domain: string): Promise<{ techStack: string[]; tags: string[] }> {
  try {
    // BuiltWith free API — no key needed for basic lookup
    const res = await fetch(`https://api.builtwith.com/free1/api.json?DOMAIN=${domain}`, {
      headers: { 'User-Agent': 'Leadora-Enrichment/1.0' }
    });
    if (!res.ok) return fallbackTechDetect(domain);
    const data = await res.json();

    const groups: string[] = [];
    const tags: string[] = [];

    if (data?.groups) {
      for (const group of data.groups) {
        if (group.name) tags.push(group.name);
        if (group.categories) {
          for (const cat of group.categories) {
            if (cat.technologies) {
              for (const tech of cat.technologies) {
                if (tech.name) groups.push(tech.name);
              }
            }
          }
        }
      }
    }

    return groups.length > 0
      ? { techStack: groups.slice(0, 20), tags: tags.slice(0, 6) }
      : fallbackTechDetect(domain);
  } catch {
    return fallbackTechDetect(domain);
  }
}

// Fallback: infer tech from domain/HTML headers via a HEAD request
async function fallbackTechDetect(domain: string): Promise<{ techStack: string[]; tags: string[] }> {
  try {
    const res = await fetch(`https://${domain}`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4000),
    });
    const tech: string[] = [];
    const server = res.headers.get('server');
    const powered = res.headers.get('x-powered-by');
    const via = res.headers.get('via');

    if (server) tech.push(server.split('/')[0]);
    if (powered) tech.push(powered.split(' ')[0]);
    if (via) tech.push('CDN');
    if (res.headers.get('cf-ray')) tech.push('Cloudflare');
    if (res.headers.get('x-vercel-id')) tech.push('Vercel');
    if (res.headers.get('x-amz-cf-id')) tech.push('AWS CloudFront');

    return { techStack: tech.filter(Boolean), tags: [] };
  } catch {
    return { techStack: [], tags: [] };
  }
}

async function fetchClearbit(domain: string): Promise<Record<string, any> | null> {
  try {
    // Clearbit's free company enrichment endpoint
    const res = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY || ''}`,
        'User-Agent': 'Leadora-Enrichment/1.0',
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    return {
      type: d.type,
      foundedYear: d.foundedYear ? String(d.foundedYear) : null,
      annualRevenue: d.metrics?.annualRevenue ? formatRevenue(d.metrics.annualRevenue) : null,
      description: d.description ?? null,
      logo: d.logo ?? null,
      crunchbase: d.crunchbasHandle ? `https://crunchbase.com/organization/${d.crunchbaseHandle}` : null,
      alexaUsRank: d.metrics?.alexaUsRank ?? null,
    };
  } catch {
    return null;
  }
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
