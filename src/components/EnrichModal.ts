import type { Lead, EnrichmentData } from '../types';
import { ApiService } from '../services/api';

export class EnrichModal {
  private static overlay: HTMLElement | null = null;

  static init() {
    // Create overlay once
    const el = document.createElement('div');
    el.id = 'enrich-modal-overlay';
    el.className = 'enrich-overlay';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Company Enrichment');
    el.innerHTML = `<div class="enrich-modal" id="enrich-modal-box"></div>`;
    document.body.appendChild(el);
    this.overlay = el;

    el.addEventListener('click', (e) => {
      if (e.target === el) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  static async open(lead: Lead) {
    if (!this.overlay) this.init();
    const box = document.getElementById('enrich-modal-box')!;
    box.innerHTML = this.renderLoading(lead);
    this.overlay!.classList.add('active');
    document.body.style.overflow = 'hidden';

    const result = await ApiService.enrichLead(lead.company.domain);

    if (result.error || !result.data) {
      box.innerHTML = this.renderError(lead, result.error ?? 'Unknown error');
    } else {
      box.innerHTML = this.renderData(lead, result.data);
    }

    box.querySelector('.enrich-close')?.addEventListener('click', () => this.close());
  }

  static close() {
    this.overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  private static renderLoading(lead: Lead): string {
    return `
      <div class="enrich-header">
        <div>
          <h2 class="enrich-title">${lead.company.name}</h2>
          <span class="enrich-domain">${lead.company.domain}</span>
        </div>
        <button class="enrich-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="enrich-loading">
        <div class="spinner"></div>
        <p>Enriching company data...</p>
      </div>
    `;
  }

  private static renderError(lead: Lead, msg: string): string {
    return `
      <div class="enrich-header">
        <div>
          <h2 class="enrich-title">${lead.company.name}</h2>
          <span class="enrich-domain">${lead.company.domain}</span>
        </div>
        <button class="enrich-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="enrich-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>${msg}</p>
      </div>
    `;
  }

  private static renderData(lead: Lead, data: EnrichmentData): string {
    const domain = data.domain;
    // Fallback chain: Google favicon (reliable, rarely blocked) → initials
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const initials = lead.company.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    const techBadges = data.techStack.length > 0
      ? data.techStack.map(t => `<span class="enrich-tech-badge">${t}</span>`).join('')
      : '<span class="enrich-empty">No tech data found</span>';

    const tagBadges = data.tags.length > 0
      ? data.tags.map(t => `<span class="hs-meta-tag">${t}</span>`).join('')
      : '';

    return `
      <div class="enrich-header">
        <div class="enrich-header-info">
          <div class="enrich-logo-wrap">
            <img src="${faviconUrl}" alt="${lead.company.name} logo" class="enrich-logo"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="enrich-logo-fallback" style="display:none">${initials}</div>
          </div>
          <div>
            <h2 class="enrich-title">${lead.company.name}</h2>
            <a href="https://${data.domain}" target="_blank" rel="noopener noreferrer" class="enrich-domain">${data.domain}</a>
          </div>
        </div>
        <button class="enrich-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      ${data.description ? `<p class="enrich-description">${data.description}</p>` : ''}

      <div class="enrich-stats">
        ${data.companyType ? `
          <div class="enrich-stat">
            <span class="enrich-stat-label">Type</span>
            <span class="enrich-stat-value">${data.companyType}</span>
          </div>` : ''}
        ${data.foundedYear ? `
          <div class="enrich-stat">
            <span class="enrich-stat-label">Founded</span>
            <span class="enrich-stat-value">${data.foundedYear}</span>
          </div>` : ''}
        ${data.revenue ? `
          <div class="enrich-stat">
            <span class="enrich-stat-label">Revenue</span>
            <span class="enrich-stat-value enrich-stat-green">${data.revenue}</span>
          </div>` : ''}
        ${data.alexa_rank ? `
          <div class="enrich-stat">
            <span class="enrich-stat-label">Alexa Rank</span>
            <span class="enrich-stat-value">#${data.alexa_rank.toLocaleString()}</span>
          </div>` : ''}
      </div>

      ${tagBadges ? `<div class="enrich-tags">${tagBadges}</div>` : ''}

      <div class="enrich-section">
        <h3 class="enrich-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          Tech Stack
        </h3>
        <div class="enrich-tech-grid">${techBadges}</div>
      </div>

      <div class="enrich-section">
        <h3 class="enrich-section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          External Links
        </h3>
        <div class="enrich-links">
          ${lead.company.linkedin ? `
            <a href="${lead.company.linkedin}" target="_blank" rel="noopener noreferrer" class="enrich-link enrich-link--linkedin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>
              </svg>
              LinkedIn
            </a>` : ''}
          ${data.crunchbase ? `
            <a href="${data.crunchbase}" target="_blank" rel="noopener noreferrer" class="enrich-link enrich-link--crunchbase">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Crunchbase
            </a>` : ''}
          ${lead.company.twitter ? `
            <a href="${lead.company.twitter}" target="_blank" rel="noopener noreferrer" class="enrich-link enrich-link--twitter">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              Twitter/X
            </a>` : ''}
          <a href="https://www.google.com/search?q=${encodeURIComponent(lead.company.name)}" target="_blank" rel="noopener noreferrer" class="enrich-link enrich-link--google">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Google
          </a>
        </div>
      </div>
    `;
  }
}
