export interface Lead {
  id: string;
  name: string; // The person's name or contact label
  company: {
    name: string;
    domain: string;
    website: string | null;
  };
  location: {
    country: string;
    city: string;
  };
  email: string | null;
  avatar: string | null;
}

export interface SearchParams {
  country: string;
  city: string;
  domain: string;
}

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
