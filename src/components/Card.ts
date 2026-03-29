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

          <div class="hs-card-socials">
            ${lead.company.linkedin ? `
              <a href="${lead.company.linkedin}" target="_blank" rel="noopener noreferrer" class="hs-social-link" title="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            ` : ''}
            ${lead.company.twitter ? `
              <a href="${lead.company.twitter}" target="_blank" rel="noopener noreferrer" class="hs-social-link" title="Twitter/X">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            ` : ''}
            ${lead.company.facebook ? `
              <a href="${lead.company.facebook}" target="_blank" rel="noopener noreferrer" class="hs-social-link" title="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            ` : ''}
          </div>
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
