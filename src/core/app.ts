import { SearchForm } from '../modules/search/SearchForm';
import { ResultsGrid } from '../modules/results/ResultsGrid';
import { ApiService } from '../services/api';
import type { SearchParams, JobSearchParams, SearchMode } from '../types';

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
          
          <div class="hs-user-avatar">
            <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="Avatar">
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

    this.searchForm.attachEvents('search-container');
    this.resultsGrid.attachEvents('results-container');
  }

  private async handleSearch(mode: SearchMode, params: any) {
    try {
      this.searchForm.setLoading(true);
      this.resultsGrid.showLoading(mode);
      
      if (mode === 'LEADS') {
        const response = await ApiService.searchLeads(params as SearchParams);
        this.searchForm.setLoading(false);
        this.resultsGrid.hideLoading();
        
        if (response.error || !response.data) {
          this.resultsGrid.showError('Search Failed', response.error || 'Check your Apollo API configuration.');
          return;
        }
        this.resultsGrid.updateLeadResults(response.data);
      } else {
        const response = await ApiService.searchJobs(params as JobSearchParams);
        this.searchForm.setLoading(false);
        this.resultsGrid.hideLoading();
        
        if (response.error || !response.data) {
          this.resultsGrid.showError('Search Failed', response.error || 'Failed to scour job sites.');
          return;
        }
        this.resultsGrid.updateJobResults(response.data);
      }
      
      const resultsSection = document.getElementById('hs-results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } catch (e) {
      console.error(e);
      this.searchForm.setLoading(false);
      this.resultsGrid.showError('Error', 'Something went wrong while executing the search.');
    }
  }
}
