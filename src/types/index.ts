export interface Lead {
  id: string;
  name: string; // The person's name or contact label
  company: {
    name: string;
    domain: string;
    website: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    facebook?: string | null;
    headcount?: string | null;
    industry?: string | null;
  };
  location: {
    country: string;
    city: string;
  };
  email: string | null;
  phone: string | null;
  avatar: string | null;
  sources: string[];
}

export interface EnrichmentData {
  domain: string;
  techStack: string[];
  companyType: string | null;
  foundedYear: string | null;
  revenue: string | null;
  description: string | null;
  logoUrl: string | null;
  crunchbase: string | null;
  alexa_rank: number | null;
  tags: string[];
}

export interface SearchParams {
  country: string;
  city: string;
  domain: string;
  deepSearch: boolean;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  salary?: string | null;
  descriptionSnippet: string;
  url: string;
  postedAt: string;
  source: string;
  tags?: string[];
}

export interface JobSearchParams {
  country: string;
  city: string;
  domain: string;
  keywords: string;
}

export type SearchMode = 'LEADS' | 'JOBS';

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
