export interface InputProps {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email';
  icon?: string;
  required?: boolean;
}

export class Input {
  /**
   * Generates HTML string for a reusable input field.
   */
  static render({ id, label, placeholder = '', type = 'text', icon, required = false }: InputProps): string {
    return `
      <div class="hs-input-group">
        <label for="${id}" class="hs-input-label">
          ${label}
          ${required ? '<span class="hs-required">*</span>' : ''}
        </label>
        <div class="hs-input-wrapper">
          ${icon ? `<span class="hs-input-icon">${icon}</span>` : ''}
          <input
            id="${id}"
            type="${type}"
            name="${id}"
            class="hs-input ${icon ? 'has-icon' : ''}"
            placeholder="${placeholder}"
            ${required ? 'required' : ''}
          />     
        </div>
      </div>
    `;
  }
}
