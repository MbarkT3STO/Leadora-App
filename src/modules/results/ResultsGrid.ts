import type { Lead, Job } from '../../types';
import { Card } from '../../components/Card';
import { JobCard } from '../../components/JobCard';

export class ResultsGrid {
  private container: HTMLElement | null = null;
  private currentLeads: Lead[] = [];
  private currentJobs: Job[] = [];
  private currentMode: 'LEADS' | 'JOBS' = 'LEADS';

  render(): string {
    return `
      <section class="hs-results-section" id="hs-results-section" style="display: none;">
        <div class="hs-results-header">
          <h2 id="hs-results-count">Results</h2>
          <div class="hs-results-actions" id="hs-results-actions">
            <button id="hs-export-btn" class="hs-btn hs-btn--outline hs-btn--sm">
              <span class="hs-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </span>
              Export CSV
            </button>
          </div>
        </div>
        
        <div class="hs-results-grid" id="hs-results-grid">
          <!-- Cards will be injected here -->
        </div>
      </section>
      
      <div id="hs-loading-overlay" class="hs-loading-state" style="display: none;">
        <div class="spinner"></div>
        <p id="hs-loading-text">Scanning global database...</p>
      </div>

      <div id="hs-error-state" class="hs-error-state" style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 id="hs-error-title">No leads found</h3>
        <p id="hs-error-msg">Try adjusting your search criteria or broadening the search.</p>
      </div>
    `;
  }

  attachEvents(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.container.addEventListener('click', this.handleGlobalActions.bind(this));
  }

  private async handleGlobalActions(e: Event) {
    const target = e.target as HTMLElement;
    
    // Handle Export Button
    const exportBtn = target.closest('#hs-export-btn');
    if (exportBtn) {
      if (this.currentMode === 'LEADS') this.exportToCSV();
      else this.exportJobsToCSV();
      return;
    }

    // Handle Copy Email buttons
    const btn = target.closest('.hs-btn') as HTMLButtonElement | null;
    if (!btn) return;
    const wrapper = btn.closest('.hs-copy-btn-wrapper');
    if (!wrapper) return;

    const email = wrapper.getAttribute('data-email');
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="hs-btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg></span>Copied!`;
        btn.classList.add('hs-btn--success');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('hs-btn--success');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  }

  private exportToCSV() {
    if (this.currentLeads.length === 0) return;
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Domain', 'Website', 'Country', 'City', 'LinkedIn'];
    const rows = this.currentLeads.map(lead => [
      lead.name,
      lead.email || '',
      lead.phone || '',
      lead.company.name,
      lead.company.domain,
      lead.company.website || '',
      lead.location.country,
      lead.location.city,
      lead.company.linkedin || ''
    ]);
    this.downloadCSV(headers, rows, 'leads');
  }

  private exportJobsToCSV() {
    if (this.currentJobs.length === 0) return;
    const headers = ['Title', 'Company', 'Location', 'Salary', 'Source', 'URL', 'Posted'];
    const rows = this.currentJobs.map(job => [
      job.title,
      job.companyName,
      job.location,
      job.salary || '',
      job.source,
      job.url,
      job.postedAt
    ]);
    this.downloadCSV(headers, rows, 'jobs');
  }

  private downloadCSV(headers: string[], rows: any[][], type: string) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leadora_${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showLoading(mode: 'LEADS' | 'JOBS' = 'LEADS') {
    if (!this.container) return;
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const loading = this.container.querySelector('#hs-loading-overlay') as HTMLElement;
    const errorState = this.container.querySelector('#hs-error-state') as HTMLElement;
    const grid = this.container.querySelector('#hs-results-grid') as HTMLElement;
    const countEl = this.container.querySelector('#hs-results-count') as HTMLElement;
    const loadingText = this.container.querySelector('#hs-loading-text') as HTMLElement;
    
    if (errorState) errorState.style.display = 'none';
    if (loading) loading.style.display = 'flex';
    if (loadingText) loadingText.textContent = mode === 'LEADS' ? 'Scanning global lead database...' : 'Sourcing job offers from free websites...';
    
    if (section && grid) {
      if (countEl) countEl.textContent = mode === 'LEADS' ? 'Searching Leads...' : 'Scouring Jobs...';
      grid.innerHTML = Array.from({ length: 12 }).map(() => Card.renderSkeleton()).join('');
      section.style.display = 'block';
      const exportBtn = this.container.querySelector('#hs-export-btn') as HTMLButtonElement;
      if (exportBtn) exportBtn.style.display = 'none';
    }
  }

  hideLoading() {
    if (!this.container) return;
    const loading = this.container.querySelector('#hs-loading-overlay') as HTMLElement;
    if (loading) loading.style.display = 'none';
  }

  showError(title: string, message: string) {
    if (!this.container) return;
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const errorState = this.container.querySelector('#hs-error-state') as HTMLElement;
    const errorTitle = this.container.querySelector('#hs-error-title') as HTMLElement;
    const errorMsg = this.container.querySelector('#hs-error-msg') as HTMLElement;
    
    if (section) section.style.display = 'none';
    if (errorTitle) errorTitle.textContent = title;
    if (errorMsg) errorMsg.textContent = message;
    if (errorState) errorState.style.display = 'flex';
  }

  updateLeadResults(leads: Lead[]) {
    if (!this.container) return;
    this.currentLeads = leads;
    this.currentMode = 'LEADS';
    
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const grid = this.container.querySelector('#hs-results-grid') as HTMLElement;
    const countEl = this.container.querySelector('#hs-results-count') as HTMLElement;
    const exportBtn = this.container.querySelector('#hs-export-btn') as HTMLButtonElement;
    
    if (!section || !grid || !countEl) return;
    
    if (leads.length === 0) {
      this.showError('No leads found', 'Try adjusting your filters.');
      return;
    }

    countEl.textContent = `Found ${leads.length} Lead${leads.length !== 1 ? 's' : ''}`;
    grid.innerHTML = leads.map(l => Card.render(l)).join('');
    section.style.display = 'block';
    if (exportBtn) {
      exportBtn.style.display = 'inline-flex';
      exportBtn.disabled = false;
    }
  }

  updateJobResults(jobs: Job[]) {
    if (!this.container) return;
    this.currentJobs = jobs;
    this.currentMode = 'JOBS';
    
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const grid = this.container.querySelector('#hs-results-grid') as HTMLElement;
    const countEl = this.container.querySelector('#hs-results-count') as HTMLElement;
    const exportBtn = this.container.querySelector('#hs-export-btn') as HTMLButtonElement;
    
    if (!section || !grid || !countEl) return;
    
    if (jobs.length === 0) {
      this.showError('No jobs found', 'We could not find any job offers matching your criteria.');
      return;
    }

    countEl.textContent = `Scoured ${jobs.length} Job Offer${jobs.length !== 1 ? 's' : ''}`;
    grid.innerHTML = jobs.map(j => JobCard.render(j)).join('');
    section.style.display = 'block';
    if (exportBtn) {
      exportBtn.style.display = 'inline-flex';
      exportBtn.disabled = false;
    }
  }
}
