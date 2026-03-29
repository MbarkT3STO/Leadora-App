export interface ButtonProps {
  id?: string;
  text: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

export class Button {
  static render({
    id,
    text,
    type = 'button',
    variant = 'primary',
    icon,
    fullWidth = false,
    disabled = false
  }: ButtonProps): string {
    const idAttr = id ? `id="${id}"` : '';
    const classNames = [
      'hs-btn',
      `hs-btn--${variant}`,
      fullWidth ? 'hs-btn--full' : ''
    ].filter(Boolean).join(' ');

    return `
      <button ${idAttr} class="${classNames}" type="${type}" ${disabled ? 'disabled' : ''}>
        ${icon ? `<span class="hs-btn-icon">${icon}</span>` : ''}
        ${text}
      </button>
    `;
  }
}
