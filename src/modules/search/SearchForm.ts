import type { SearchParams, JobSearchParams, SearchMode } from '../../types';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { validateSearch } from '../../utils/validators';

export class SearchForm {
  private container: HTMLElement | null = null;
  private onSubmitCallback: (mode: SearchMode, params: any) => void;
  private history: SearchParams[] = [];
  private currentMode: SearchMode = 'LEADS';

  constructor(onSubmit: (mode: SearchMode, params: any) => void) {
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
    const iconKeyword = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;

    return `
      <section class="hs-search-section">
        <div class="hs-search-header">
          <h2>Global Lead & Job Intelligence</h2>
          <p>Find companies to target or scoured job offers from across the web.</p>
        </div>

        <div class="hs-search-tabs">
          <button class="hs-tab ${this.currentMode === 'LEADS' ? 'active' : ''}" data-mode="LEADS">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            Lead Generation
          </button>
          <button class="hs-tab ${this.currentMode === 'JOBS' ? 'active' : ''}" data-mode="JOBS">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Job Offer Sourcing
          </button>
        </div>
        
        <form id="hs-search-form" class="hs-search-form animate-fade-in" novalidate>
          <div class="hs-form-grid">
            ${Input.render({
              id: 'domain',
              label: this.currentMode === 'LEADS' ? 'Industry/Domain' : 'Industry (Optional)',
              placeholder: 'e.g. software',
              icon: iconDomain,
              required: this.currentMode === 'LEADS'
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
            ${this.currentMode === 'JOBS' ? 
              Input.render({
                id: 'keywords',
                label: 'Keywords (Job Title)',
                placeholder: 'e.g. Senior Frontend',
                icon: iconKeyword,
                required: false
              }) : ''}
          </div>
          
          <div class="hs-form-actions">
            ${this.currentMode === 'LEADS' ? `
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
            ` : '<div></div>'}
            
            <div id="hs-form-error" class="hs-form-error"></div>
            ${Button.render({
              text: this.currentMode === 'LEADS' ? 'Search Leads' : 'Scour Job Offers',
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
    if (this.currentMode !== 'LEADS' || this.history.length === 0) return '';
    
    return `
      <span class="hs-history-label">Recent Searches:</span>
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
      const tab = (e.target as HTMLElement).closest('.hs-tab') as HTMLButtonElement | null;
      if (tab) {
        const mode = tab.getAttribute('data-mode') as SearchMode;
        if (mode !== this.currentMode) {
          this.currentMode = mode;
          this.reRender();
        }
        return;
      }

      const chip = (e.target as HTMLElement).closest('.hs-history-chip') as HTMLButtonElement | null;
      if (chip) {
        const index = parseInt(chip.getAttribute('data-index') || '0');
        const params = this.history[index];
        this.fillFormAndSubmit(params);
        return;
      }

      const clearBtn = (e.target as HTMLElement).closest('#hs-clear-history');
      if (clearBtn) {
        this.history = [];
        localStorage.removeItem('leadora_history');
        this.renderHistory();
      }
    });
  }

  private reRender() {
    if (!this.container) return;
    this.container.innerHTML = this.render();
    this.attachEvents(this.container.id);
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
    
    const errorEl = form.querySelector('#hs-form-error');
    if (errorEl) errorEl.textContent = '';

    const formData = new FormData(form);
    
    if (this.currentMode === 'LEADS') {
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
      this.onSubmitCallback('LEADS', params);
    } else {
      const params: JobSearchParams = {
        country: (formData.get('country') as string) || '',
        city: (formData.get('city') as string) || '',
        domain: (formData.get('domain') as string) || '',
        keywords: (formData.get('keywords') as string) || ''
      };

      if (!params.country && errorEl) {
        errorEl.textContent = 'Country is required for job search';
        return;
      }

      this.onSubmitCallback('JOBS', params);
    }
  }

  setLoading(isLoading: boolean) {
    if (!this.container) return;
    const btn = this.container.querySelector('#submit-search-btn') as HTMLButtonElement | null;
    if (btn) {
      if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;border-width:2px;"></span> Searching...`;
      } else {
        btn.disabled = false;
        btn.innerHTML = `<span class="hs-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>${this.currentMode === 'LEADS' ? 'Search Leads' : 'Scour Job Offers'}`;
      }
    }
  }
}
