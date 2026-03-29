import type { Job } from '../types';
import { Button } from './Button';

export class JobCard {
  static render(job: Job): string {
    return `
      <article class="hs-card hs-job-card animate-fade-in" data-url="${job.url}" id="job-${job.id}">
        <div class="hs-card-header">
          <div class="hs-lead-info">
            <h3 class="hs-card-title">${job.title}</h3>
            <span class="hs-card-subtitle">${job.companyName}</span>
          </div>
          <span class="hs-card-badge hs-source-badge">${job.source}</span>
        </div>
        
        <div class="hs-card-body">
          <div class="hs-card-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${job.location}</span>
          </div>
          
          ${job.salary ? `
            <div class="hs-card-detail hs-text-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                <line x1="12" y1="18" x2="12" y2="6"></line>
              </svg>
              <span>${job.salary}</span>
            </div>
          ` : ''}

          <p class="hs-job-description">${job.descriptionSnippet}</p>
          
          <div class="hs-job-tags">
            ${job.tags?.map(tag => `<span class="hs-meta-tag">${tag}</span>`).join('') || ''}
            <span class="hs-job-posted">${job.postedAt}</span>
          </div>
        </div>
        
        <div class="hs-card-footer">
          <a href="${job.url}" target="_blank" rel="noopener noreferrer" style="width: 100%;">
            ${Button.render({ 
              text: 'View Job Details', 
              variant: 'primary', 
              fullWidth: true,
              icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>'
            })}
          </a>
        </div>
      </article>
    `;
  }
}
