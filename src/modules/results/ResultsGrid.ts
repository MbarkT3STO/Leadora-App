import type { Lead } from '../../types';
import { Card } from '../../components/Card';

export class ResultsGrid {
  private container: HTMLElement | null = null;

  render(): string {
    return `
      <section class="hs-results-section" id="hs-results-section" style="display: none;">
        <div class="hs-results-header">
          <h2 id="hs-results-count">Results</h2>
          <div class="hs-results-actions" id="hs-results-actions">
            <!-- Filtering or sorting actions could go here -->
          </div>
        </div>
        
        <div class="hs-results-grid" id="hs-results-grid">
          <!-- Cards will be injected here -->
        </div>
      </section>
      
      <div id="hs-loading-overlay" class="hs-loading-state" style="display: none;">
        <div class="spinner"></div>
        <p>Scanning global database...</p>
      </div>

      <div id="hs-error-state" class="hs-error-state" style="display: none;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h3 id="hs-error-title">No leads found</h3>
        <p id="hs-error-msg">Try adjusting your search criteria or broadening the job title.</p>
      </div>
    `;
  }

  attachEvents(containerId: string) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Attach delegated events for the cards (e.g. Copy Email buttons)
    this.container.addEventListener('click', this.handleCardActions.bind(this));
  }

  private async handleCardActions(e: Event) {
    const target = e.target as HTMLElement;
    const btn = target.closest('.hs-btn') as HTMLButtonElement | null;
    
    if (!btn) return;
    const wrapper = btn.closest('.hs-copy-btn-wrapper');
    if (!wrapper) return;

    const email = wrapper.getAttribute('data-email');
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        
        // Visual feedback
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

  showLoading() {
    if (!this.container) return;
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const loading = this.container.querySelector('#hs-loading-overlay') as HTMLElement;
    const errorState = this.container.querySelector('#hs-error-state') as HTMLElement;
    
    if (section) section.style.display = 'none';
    if (errorState) errorState.style.display = 'none';
    if (loading) loading.style.display = 'flex';
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

  updateResults(leads: Lead[]) {
    if (!this.container) return;
    
    const section = this.container.querySelector('#hs-results-section') as HTMLElement;
    const grid = this.container.querySelector('#hs-results-grid') as HTMLElement;
    const countEl = this.container.querySelector('#hs-results-count') as HTMLElement;
    
    if (!section || !grid || !countEl) return;
    
    if (leads.length === 0) {
      this.showError('No leads found', 'We could not find any leads matching your criteria. Try adjusting the industry or job title.');
      return;
    }

    countEl.textContent = `Found ${leads.length} Lead${leads.length !== 1 ? 's' : ''}`;
    
    // Inject rendered cards
    grid.innerHTML = leads.map(l => Card.render(l)).join('');
    
    section.style.display = 'block';
  }
}
