import { Component, OnInit, OnDestroy, computed, HostListener, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { VERSION } from '@angular/core';
import { ConfigDataService } from './core/services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Mahmoud Amer Portfolio';
  currentYear = new Date().getFullYear();
  showScrollTop = false;
  isNavbarCollapsed = true;
  showInProgressBanner = signal(true);
  
  private readonly IN_PROGRESS_BANNER_KEY = 'hideInProgressBanner';
  
  // Main navigation items - streamlined for better UX
  navItems = [
    { path: '/profile', label: 'Home', icon: 'fas fa-user' },
    { path: '/experience', label: 'Experience', icon: 'fas fa-briefcase' },
    { path: '/projects', label: 'Projects', icon: 'fas fa-folder-open' },
    { path: '/skills', label: 'Skills', icon: 'fas fa-code' },
    { path: '/contact', label: 'Contact', icon: 'fas fa-envelope' }
  ];
  
  // Secondary navigation items (for footer or dropdown if needed)
  secondaryNavItems = [
    { path: '/achievements', label: 'Achievements', icon: 'fas fa-trophy' },
    { path: '/courses', label: 'Courses', icon: 'fas fa-graduation-cap' }
  ];

  readonly profile = computed(() => this.configService.profile());
  readonly authorName = computed(() => this.profile()?.name || 'Author');
  readonly linkedinUrl = computed(() => this.profile()?.linkedin || '#');

  constructor(private configService: ConfigDataService) {}

  ngOnInit(): void {
    this.configService.loadProfile();
    this.checkInProgressBannerState();
  }

  ngOnDestroy(): void {}

  /**
   * Check if the user has previously dismissed the in-progress banner
   */
  private checkInProgressBannerState(): void {
    const hideBanner = localStorage.getItem(this.IN_PROGRESS_BANNER_KEY);
    if (hideBanner === 'true') {
      this.showInProgressBanner.set(false);
    }
  }

  /**
   * Dismiss the in-progress banner and save state to localStorage
   */
  dismissInProgressBanner(): void {
    this.showInProgressBanner.set(false);
    localStorage.setItem(this.IN_PROGRESS_BANNER_KEY, 'true');
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
    
    // Collapse mobile menu if open
    if (!this.isNavbarCollapsed) {
      this.collapseNavbar();
    }
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  getAngularVersion(): string {
    return VERSION.full;
  }

  /**
   * Collapses the navbar menu when a navigation link is clicked
   * This is specifically useful in responsive mode to hide the burger menu after navigation
   */
  collapseNavbar(): void {
    this.isNavbarCollapsed = true;
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      // Use Bootstrap's Collapse API to hide the navbar
      const bsCollapse = (window as any).bootstrap?.Collapse?.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      } else {
        // Fallback: manually remove the 'show' class if Bootstrap instance not found
        navbarCollapse.classList.remove('show');
      }
    }
  }
}
