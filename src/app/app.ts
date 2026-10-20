import { Component, OnInit, OnDestroy, computed, HostListener, inject } from '@angular/core';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, Scroll } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { VERSION } from '@angular/core';
import { ConfigDataService } from './core/services';
import { fixedHeaderOffset } from './core/fixed-header-offset';
import { AskLauncherComponent } from './features/ask/ask-launcher.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AskLauncherComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Mahmoud Khairy';
  currentYear = new Date().getFullYear();
  showScrollTop = false;
  isNavbarCollapsed = true;
  /** Feature flag for the "Ask About Mahmoud" portfolio guide. */
  readonly askEnabled = environment.features.askAboutMahmoud;

  // Main navigation items - streamlined for better UX
  navItems = [
    { path: '/', label: 'Home', icon: 'fas fa-user' },
    { path: '/experience', label: 'Experience', icon: 'fas fa-briefcase' },
    { path: '/projects', label: 'Projects', icon: 'fas fa-folder-open' },
    { path: '/case-studies', label: 'Case Studies', icon: 'fas fa-book-open' },
    { path: '/ventures', label: 'Ventures', icon: 'fas fa-lightbulb' },
    { path: '/skills', label: 'Skills', icon: 'fas fa-code' },
    { path: '/game', label: 'Game', icon: 'fas fa-gamepad' },
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

  constructor(private configService: ConfigDataService) {
    // Anchor scrolling (e.g. /projects#project-...) must clear the fixed navbar. The same
    // value is applied as scroll-padding so the browser's own scroll-into-view (e.g. when the anchor
    // target receives focus) lands in the same place.
    const document = inject(DOCUMENT);
    const viewportScroller = inject(ViewportScroller);
    viewportScroller.setOffset(() => {
      const offset = fixedHeaderOffset(document);
      document.documentElement.style.scrollPaddingTop = `${offset}px`;
      return [0, offset];
    });

    // Scroll after each navigation: restore the position on back/forward, go to the #fragment,
    // otherwise open the page at the top (without this, a link near the bottom of a long page
    // opens the next page part-way down). Scrolls are instant: with the site's smooth scrolling,
    // the focus that scrollToAnchor moves to the target interrupts the animation mid-way.
    // Pages that render their anchor targets after the data loads (Projects, Case Studies)
    // scroll again once the target exists.
    inject(Router).events.pipe(
      filter((event): event is Scroll => event instanceof Scroll),
      takeUntilDestroyed()
    ).subscribe(event => {
      if (event.position) {
        viewportScroller.scrollToPosition(event.position, { behavior: 'instant' });
      } else if (event.anchor) {
        viewportScroller.scrollToAnchor(event.anchor, { behavior: 'instant' });
      } else {
        viewportScroller.scrollToPosition([0, 0], { behavior: 'instant' });
      }
    });
  }

  ngOnInit(): void {
    this.configService.loadProfile();
  }

  ngOnDestroy(): void {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showScrollTop = window.pageYOffset > 300;
  }

  scrollToTop(): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ 
      top: 0, 
      behavior: reduceMotion ? 'auto' : 'smooth' 
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
