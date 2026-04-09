import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'pry-theme';
  public isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    // Check if user has a preference saved, or default to light mode
    if (savedTheme === 'dark') {
      this.isDarkMode.set(true);
      document.documentElement.dataset['theme'] = 'dark';
      document.documentElement.classList.add('dark');
    } else {
      this.isDarkMode.set(false);
      delete document.documentElement.dataset['theme'];
      document.documentElement.classList.remove('dark');
    }
  }

  public toggleTheme(): void {
    const currentMode = this.isDarkMode();
    if (currentMode) {
      // Switch back to Light
      this.isDarkMode.set(false);
      delete document.documentElement.dataset['theme'];
      document.documentElement.classList.remove('dark');
      localStorage.setItem(this.THEME_KEY, 'light');
    } else {
      // Switch to Dark
      this.isDarkMode.set(true);
      document.documentElement.dataset['theme'] = 'dark';
      document.documentElement.classList.add('dark');
      localStorage.setItem(this.THEME_KEY, 'dark');
    }
  }
}

