import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let component: PageHeaderComponent;
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title')?.textContent).toContain('Test Title');
  });

  it('should render subtitle when provided', () => {
    component.title = 'Test Title';
    component.subtitle = 'Test Subtitle';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-subtitle')?.textContent).toContain('Test Subtitle');
  });

  it('should not render subtitle when not provided', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-subtitle')).toBeNull();
  });

  it('should render icon when provided', () => {
    component.title = 'Test Title';
    component.icon = 'fas fa-briefcase';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Class order is not meaningful (Angular may apply bound classes in any order)
    const icon = compiled.querySelector('.page-title i');
    expect(Array.from(icon?.classList ?? [])).toEqual(expect.arrayContaining(['fas', 'fa-briefcase', 'me-3']));
  });

  it('should not render icon when not provided', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title i')).toBeNull();
  });
});
