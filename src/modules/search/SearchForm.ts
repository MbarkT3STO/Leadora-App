import type { SearchParams } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateSearch } from '../../utils/validators';

export class SearchForm {
  private container: HTMLElement | null = null;
  private onSubmitCallback: (params: SearchParams) => void;
  private history: SearchParams[] = [];

  constructor(onSubmit: (params: SearchParams) => void) {
    this.onSubmitCallback = onSubmit;
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem('leadora_history');
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (e) {
      this.history = [];
    }
  }

  private saveHistory(params: SearchParams) {
    // Keep only unique searches, max 5
    const key = `${params.domain}|${params.country}|${params.city}`.toLowerCase();
    this.history = [
      params,
      ...this.history.filter(p => `${p.domain}|${p.country}|${p.city}`.toLowerCase() !== key)
    ].slice(0, 5);

    localStorage.setItem('leadora_history', JSON.stringify(this.history));
    this.renderHistory();
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
            <div class="hs-deep-search-toggle">
              <label class="hs-switch">
                <input type="checkbox" id="deepSearch" name="deepSearch">
                <span class="hs-slider round"></span>
              </label>
              <div class="hs-toggle-labels">
                <span class="hs-toggle-title">Deep Search Mode</span>
                <span class="hs-toggle-desc">Scour deeper web sources (takes longer)</span>
              </div>
            </div>
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

        <div id="hs-recent-searches" class="hs-recent-searches">
          ${this.getHistoryHtml()}
        </div>
      </section>
    `;
  }

  private getHistoryHtml(): string {
    if (this.history.length === 0) return '';
    
    return `
      <span class="hs-history-label">Recent:</span>
      <div class="hs-history-list" id="hs-history-list">
        ${this.history.map((p, i) => `
          <button class="hs-history-chip" data-index="${i}" title="${p.domain} in ${p.country}">
            ${p.domain}${p.city ? ` (${p.city})` : ''}
          </button>
        `).join('')}
        <button id="hs-clear-history" class="hs-history-clear" title="Clear all history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  }

  private renderHistory() {
    const historyContainer = this.container?.querySelector('#hs-recent-searches');
    if (historyContainer) {
      historyContainer.innerHTML = this.getHistoryHtml();
    }
  }

  attachEvents(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const form = this.container.querySelector('#hs-search-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      const chip = target.closest('.hs-history-chip') as HTMLButtonElement;
      if (chip) {
        const index = parseInt(chip.getAttribute('data-index') || '0');
        const params = this.history[index];
        this.fillFormAndSubmit(params);
        return;
      }

      const clearBtn = target.closest('#hs-clear-history');
      if (clearBtn) {
        this.history = [];
        localStorage.removeItem('leadora_history');
        this.renderHistory();
      }
    });
  }

  private fillFormAndSubmit(params: SearchParams) {
    if (!this.container) return;
    const form = this.container.querySelector('#hs-search-form') as HTMLFormElement;
    if (!form) return;

    (form.querySelector('#domain') as HTMLInputElement).value = params.domain;
    (form.querySelector('#country') as HTMLInputElement).value = params.country;
    (form.querySelector('#city') as HTMLInputElement).value = params.city;

    this.handleSubmit(new Event('submit'), form);
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
      domain: (formData.get('domain') as string) || '',
      deepSearch: form.querySelector('#deepSearch') ? (form.querySelector('#deepSearch') as HTMLInputElement).checked : false
    };

    const validation = validateSearch(params);
    
    if (!validation.valid && errorEl) {
      errorEl.textContent = validation.message || 'Invalid input';
      errorEl.classList.add('shake');
      setTimeout(() => errorEl.classList.remove('shake'), 400);
      return;
    }

    this.saveHistory(params);
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
