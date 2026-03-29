import type { SearchParams } from '../types';

export const validateSearch = (params: SearchParams): { valid: boolean; message?: string } => {
  if (!params.domain.trim()) {
    return { valid: false, message: 'Industry/Domain is required' };
  }
  if (!params.country.trim()) {
    return { valid: false, message: 'Country is required' };
  }
  return { valid: true };
};
