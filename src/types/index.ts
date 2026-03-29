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

export interface SearchParams {
  country: string;
  city: string;
  domain: string;
  deepSearch: boolean;
}

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
