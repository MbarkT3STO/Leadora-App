import type { SearchParams } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateSearch } from '../../utils/validators';

export class SearchForm {
  private container: HTMLElement | null = null;
  private onSubmitCallback: (params: SearchParams) => void;

  constructor(onSubmit: (params: SearchParams) => void) {
    this.onSubmitCallback = onSubmit;
  }

  render(): string {
    const iconCountry = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const iconCity = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    const iconDomain = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;
    const iconSearch = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    return `
      <section class="hs-search-section">
        <div class="hs-search-header">
          <h2>Find Targeted Leads</h2>
          <p>Instantly discover companies and their decision-makers' emails.</p>
        </div>
        
        <form id="hs-search-form" class="hs-search-form animate-fade-in" novalidate>
          <div class="hs-form-grid">
            ${Input.render({
              id: 'domain',
              label: 'Company Domain/Industry',
              placeholder: 'e.g. software',
              icon: iconDomain,
              required: true
            })}
            ${Input.render({
              id: 'country',
              label: 'Country',
              placeholder: 'e.g. United States',
              icon: iconCountry,
              required: true
            })}
            ${Input.render({
              id: 'city',
              label: 'City (Optional)',
              placeholder: 'e.g. San Francisco',
              icon: iconCity,
              required: false
            })}
          </div>
          
          <div class="hs-form-actions">
            <div id="hs-form-error" class="hs-form-error"></div>
            ${Button.render({
              text: 'Search Leads',
              type: 'submit',
              variant: 'primary',
              icon: iconSearch,
              id: 'submit-search-btn'
            })}
          </div>
        </form>
      </section>
    `;
  }

  attachEvents(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const form = this.container.querySelector('#hs-search-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }
  }

  private handleSubmit(e: Event, form: HTMLFormElement) {
    e.preventDefault();
    
    // Reset errors
    const errorEl = form.querySelector('#hs-form-error');
    if (errorEl) errorEl.textContent = '';

    const formData = new FormData(form);
    const params: SearchParams = {
      country: (formData.get('country') as string) || '',
      city: (formData.get('city') as string) || '',
      domain: (formData.get('domain') as string) || ''
    };

    const validation = validateSearch(params);
    
    if (!validation.valid && errorEl) {
      errorEl.textContent = validation.message || 'Invalid input';
      // Add shake animation class momentarily
      errorEl.classList.add('shake');
      setTimeout(() => errorEl.classList.remove('shake'), 400);
      return;
    }

    this.onSubmitCallback(params);
  }

  setLoading(isLoading: boolean) {
    if (!this.container) return;
    const btn = this.container.querySelector('#submit-search-btn') as HTMLButtonElement | null;
    if (btn) {
      if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;border-width:2px;"></span> Searching Leads...`;
      } else {
        btn.disabled = false;
        btn.innerHTML = `<span class="hs-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>Search Leads`;
      }
    }
  }
}
