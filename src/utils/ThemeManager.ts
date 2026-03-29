export class ThemeManager {
  static init() {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('hs-theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    }
  }

  static toggle() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('hs-theme', 'light');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('hs-theme', 'dark');
    }
    return !isDark;
  }
}
