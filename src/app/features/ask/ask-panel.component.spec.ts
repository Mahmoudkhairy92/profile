import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import knowledgeBaseJson from '../../../../public/assets/data/ask-mahmoud.json';
import achievementsJson from '../../../../public/assets/data/achievements.json';
import caseStudiesJson from '../../../../public/assets/data/case-studies.json';
import contactJson from '../../../../public/assets/data/contact.json';
import coursesJson from '../../../../public/assets/data/courses.json';
import experienceJson from '../../../../public/assets/data/experience.json';
import skillsJson from '../../../../public/assets/data/skills.json';
import venturesJson from '../../../../public/assets/data/ventures.json';
import { AskPanelComponent } from './ask-panel.component';

describe('AskPanelComponent', () => {
  let fixture: ComponentFixture<AskPanelComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskPanelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(AskPanelComponent);
    fixture.componentRef.setInput('open', true);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function loadData(): void {
    const http = TestBed.inject(HttpTestingController);
    const data: Record<string, object> = {
      'assets/data/ask-mahmoud.json': knowledgeBaseJson,
      'assets/data/experience.json': experienceJson,
      'assets/data/contact.json': contactJson,
      'assets/data/ventures.json': venturesJson,
      'assets/data/courses.json': coursesJson,
      'assets/data/achievements.json': achievementsJson,
      'assets/data/skills.json': skillsJson,
      'assets/data/case-studies.json': caseStudiesJson
    };
    Object.entries(data).forEach(([url, body]) => http.expectOne(url).flush(body));
    fixture.detectChanges();
  }

  function ask(question: string): HTMLElement {
    fixture.componentInstance.ask(question);
    fixture.detectChanges();
    const guides = element.querySelectorAll<HTMLElement>('.ask-guide:not(.ask-welcome)');
    return guides[guides.length - 1];
  }

  const texts = (root: ParentNode, selector: string) =>
    Array.from(root.querySelectorAll(selector)).map(node => node.textContent?.replace(/\s+/g, ' ').trim());

  it('should identify itself as a non-AI portfolio guide and be masked from session recordings', () => {
    const panel = element.querySelector('.ask-panel')!;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('data-clarity-mask')).toBe('true');
    expect(element.querySelector('.ask-badge')?.textContent).toContain('not AI');
    expect(element.querySelector('.ask-notice')?.textContent).toContain('not a generative AI chatbot');
    expect(element.querySelector('.ask-status')?.textContent).toContain('Loading');
    expect(element.querySelector<HTMLInputElement>('#ask-question')?.disabled).toBe(true);
  });

  it('should welcome the visitor with suggested questions once the data loads', () => {
    loadData();
    const chips = texts(element, '.ask-welcome .ask-chip');
    expect(chips.length).toBeGreaterThanOrEqual(6);
    expect(chips).toContain('How can I contact him for a Riyadh-based role?');
    expect(element.querySelector<HTMLInputElement>('#ask-question')?.disabled).toBe(false);
  });

  it('should answer a suggested question with contact actions from contact.json', () => {
    loadData();
    const chip = Array.from(element.querySelectorAll<HTMLButtonElement>('.ask-welcome .ask-chip'))
      .find(button => button.textContent?.includes('Riyadh'))!;
    chip.click();
    fixture.detectChanges();
    const answer = element.querySelector('.ask-answer[data-entry="contact-riyadh"]')!;

    expect(answer.querySelector('a[data-channel="riyadh"]')?.getAttribute('href')).toBe('tel:+966544759912');
    expect(answer.querySelector('a[data-channel="email"]')?.getAttribute('href')).toBe('mailto:mmahmoudkhairy92@gmail.com');
    const whatsapp = answer.querySelector('a[data-channel="whatsapp"]')!;
    expect(whatsapp.getAttribute('href')).toBe('https://wa.me/201120064763');
    expect(whatsapp.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should route Egypt and WhatsApp questions to the Egyptian number', () => {
    loadData();
    const answer = ask('Can I reach him via WhatsApp for an Egypt-based opportunity?');

    expect(answer.querySelector('[data-entry="contact-egypt"]')).not.toBeNull();
    expect(answer.querySelector('a[data-channel="egypt"]')?.getAttribute('href')).toBe('tel:+201120064763');
    expect(answer.querySelector('a[data-channel="riyadh"]')).toBeNull();
  });

  it('should answer Arabic questions in Arabic, right to left', () => {
    loadData();
    const answer = ask('هل طوّر محمود QCVerse وحده؟');

    expect(answer.getAttribute('lang')).toBe('ar');
    expect(answer.getAttribute('dir')).toBe('rtl');
    expect(answer.textContent).toContain('فريق QCVerse');
    expect(element.querySelector('.ask-panel')?.getAttribute('dir')).toBe('rtl');
    expect(element.querySelector('.ask-visitor')?.getAttribute('dir')).toBe('rtl');
  });

  it('should credit the QCVerse Team and link to the case study and evidence', () => {
    loadData();
    const answer = ask('Was QCVerse developed by Mahmoud alone?');

    expect(answer.textContent).toContain('built collaboratively by the QCVerse Team');
    expect(answer.querySelector('.ask-link')?.getAttribute('href')).toBe('/case-studies/qcverse-product-development#role');
    expect(texts(answer, '.ask-sources li')).toEqual(expect.arrayContaining([expect.stringContaining('qcverseai.com: About Us')]));
  });

  it('should render derived blocks and highlight tools named in the question', () => {
    loadData();
    const skills = ask('Does he know JMeter?');
    expect(skills.querySelector('.ask-mentioned')?.textContent).toContain('JMeter (API & Performance Testing)');

    const career = ask('What is his career progression?');
    expect(texts(career, '.ask-data li')[0]).toContain('AI Product Manager · THIQAH · Jun 2026 – Present');

    const certifications = ask('What certifications does he hold?');
    expect(texts(certifications, '.ask-data li')).toEqual(expect.arrayContaining([expect.stringContaining('ISTQB Advanced Level - Test Manager · iSQI · Jan 2025')]));
  });

  it('should ask which topic is meant for ambiguous questions', () => {
    loadData();
    const reply = ask('Tell me about his AI work');

    expect(reply.textContent).toContain('could match more than one topic');
    expect(reply.querySelectorAll('.ask-chip').length).toBeGreaterThanOrEqual(2);
    expect(reply.querySelector('.ask-answer')).toBeNull();
  });

  it('should explain unsupported questions without guessing and offer suggestions and pages', () => {
    loadData();
    const reply = ask('Does he know Kubernetes?');

    expect(reply.querySelector('.ask-fallback')?.textContent).toContain("won't guess");
    expect(reply.querySelectorAll('.ask-chip').length).toBeGreaterThan(0);
    expect(texts(reply, '.ask-link')).toEqual(['Experience', 'Case Studies', 'Skills', 'Contact']);
  });

  it('should close on Escape and start over without keeping the conversation', () => {
    loadData();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    ask('What is QCVerse?');
    expect(element.querySelectorAll('.ask-visitor').length).toBe(1);

    element.querySelector('.ask-panel')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toHaveBeenCalledTimes(1);

    fixture.componentInstance.restart();
    fixture.detectChanges();
    expect(element.querySelectorAll('.ask-visitor').length).toBe(0);
  });

  it('should not store questions in browser storage', () => {
    loadData();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    ask('What is his salary expectation?');
    ask('كيف أتواصل معه لوظيفة في الرياض؟');

    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });

  it('should ignore empty questions and cap question length', () => {
    loadData();
    fixture.componentInstance.ask('   ');
    fixture.detectChanges();
    expect(element.querySelectorAll('.ask-visitor').length).toBe(0);

    fixture.componentInstance.ask('x'.repeat(500));
    fixture.detectChanges();
    expect(element.querySelector('.ask-visitor')?.textContent?.trim().length).toBeLessThanOrEqual(305);
  });
});
