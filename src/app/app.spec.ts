import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app';
import { environment } from '../environments/environment';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand and the main navigation', () => {
    expect(element.querySelector('.navbar-brand')?.textContent).toContain('Mahmoud Khairy');
    const items = Array.from(element.querySelectorAll('.navbar-nav .nav-link')).map(link => link.textContent?.trim());
    expect(items).toEqual(['Home', 'Experience', 'Projects', 'Case Studies', 'Ventures', 'Skills', 'Game', 'Contact']);
    expect(element.querySelector('.navbar-nav a[href="/case-studies"]')).not.toBeNull();
  });

  it('should label the scroll-to-top button and show the portfolio guide when its flag is on', () => {
    expect(element.querySelector('.scroll-to-top')?.getAttribute('aria-label')).toBe('Scroll to top');
    expect(!!element.querySelector('app-ask-launcher')).toBe(environment.features.askAboutMahmoud);
  });

  it('should list the secondary pages in the footer', () => {
    const footerLinks = Array.from(element.querySelectorAll('.footer-links a')).map(link => link.textContent?.trim());
    expect(footerLinks).toEqual(expect.arrayContaining(['Achievements', 'Courses', 'Case Studies', 'Contact']));
  });
});
