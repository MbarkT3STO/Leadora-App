import type { Lead } from '../types';
import { Button } from './Button';

export class Card {
  static render(lead: Lead): string {
    const hasEmail = !!lead.email;
    const emailAction = hasEmail 
      ? Button.render({ 
          text: 'Copy Email', 
          variant: 'outline', 
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
          fullWidth: true 
        })
      : Button.render({ 
          text: 'No Email Found', 
          variant: 'secondary', 
          disabled: true, 
          fullWidth: true 
        });

    return `
      <article class="hs-card animate-fade-in" data-id="${lead.id}">
        <div class="hs-card-header">
          <div class="hs-lead-info">
            <h3 class="hs-card-title">${lead.company.name}</h3>
          </div>
          <span class="hs-card-badge">${lead.company.domain}</span>
        </div>
        
        <div class="hs-card-body">
          <div class="hs-card-detail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${lead.location.city ? lead.location.city + ', ' : ''}${lead.location.country}</span>
          </div>
          
          <div class="hs-card-detail ${hasEmail ? 'hs-highlighted-email' : 'hs-text-muted'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>${hasEmail ? lead.email : 'No direct business email'}</span>
          </div>

          ${lead.company.website ? `
            <div class="hs-card-detail hs-text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <a href="${lead.company.website}" target="_blank" rel="noopener noreferrer">${lead.company.website.replace(/^https?:\/\//, '')}</a>
            </div>
          ` : ''}
        </div>
        
        <div class="hs-card-footer">
          <div class="hs-copy-btn-wrapper" data-email="${lead.email || ''}">
            ${emailAction}
          </div>
        </div>
      </article>
    `;
  }
}
