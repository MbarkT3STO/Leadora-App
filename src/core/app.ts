import { SearchForm } from '../modules/search/SearchForm';
import { ResultsGrid } from '../modules/results/ResultsGrid';
import { ApiService } from '../services/api';
import type { SearchParams } from '../types';

export class App {
  private container: HTMLElement;
  private searchForm: SearchForm;
  private resultsGrid: ResultsGrid;

  constructor(rootId: string) {
    const root = document.getElementById(rootId);
    if (!root) throw new Error(`Could not find root element with id ${rootId}`);
    
    this.container = root;
    this.resultsGrid = new ResultsGrid();
    
    // Pass submission via callback
    this.searchForm = new SearchForm(this.handleSearch.bind(this));
  }

  public render() {
    this.container.innerHTML = `
      <header class="hs-header">
        <div class="hs-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          Leadora
        </div>
        <div class="hs-nav-actions">
          <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
            <!-- Icon initialized by Main -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
          
          <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--bg-secondary); border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; color: var(--text-secondary); overflow: hidden;">
            <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
      </header>
      
      <main class="main-content">
        <div class="container">
          <div id="search-container">
            ${this.searchForm.render()}
          </div>
          
          <div id="results-container">
            ${this.resultsGrid.render()}
          </div>
        </div>
      </main>
    `;

    // Attach event listeners after content is injected mapping IDs properly
    this.searchForm.attachEvents('search-container');
    this.resultsGrid.attachEvents('results-container');
  }

  private async handleSearch(params: SearchParams) {
    try {
      this.searchForm.setLoading(true);
      this.resultsGrid.showLoading();
      
      const response = await ApiService.searchLeads(params);
      
      this.searchForm.setLoading(false);
      
      if (response.error || !response.data) {
        this.resultsGrid.showError('Search Failed', response.error || 'An unknown error occurred');
        return;
      }
      
      this.resultsGrid.hideLoading();
      this.resultsGrid.updateResults(response.data);
      
      // Scroll to results seamlessly
      const resultsSection = document.getElementById('hs-results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (e) {
      console.error(e);
      this.searchForm.setLoading(false);
      this.resultsGrid.showError('Application Error', 'Something went wrong while executing the search.');
    }
  }
}
