import {
  ChangeDetectionStrategy, Component, ElementRef, Injector, OnInit, afterNextRender, computed, effect,
  inject, input, output, signal, viewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ConfigDataService, FileDownloadService } from '../../core/services';
import {
  AskBlock, AskContactChannel, AskEntry, AskKnowledgeBase, AskLanguage, AskLink, CaseStudySource
} from '../../core/models';
import { MatchOutcome, createMatcher, detectLanguage, normalize } from './ask-matcher';
import {
  ASK_UI, AnswerPart, EVIDENCE_LABELS_AR, EXPLORATION_CATEGORY, TOOL_CATEGORIES, answerParts, contactActions, toolConcept
} from './ask-content';

const KNOWLEDGE_BASE_URL = 'assets/data/ask-mahmoud.json';
const MAX_QUESTION_LENGTH = 300;
const SMALL_SCREEN = '(max-width: 576px)';

interface AskMessage {
  id: number;
  from: 'visitor' | 'guide';
  lang: AskLanguage;
  text?: string;
  /** The visitor question this guide message answers (used to highlight mentioned tools). */
  question?: string;
  outcome?: MatchOutcome;
  parts?: AnswerPart[];
}

/**
 * "Ask About Mahmoud" conversation panel. Questions are matched on the device against curated
 * answers (ask-mahmoud.json); answers reuse the portfolio's own data for career, contact,
 * certifications, awards, ventures, skills and case studies. Nothing is generated, stored or
 * sent to analytics, and the panel is masked from session recordings.
 */
@Component({
  selector: 'app-ask-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ask-panel.component.html',
  styleUrls: ['./ask-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskPanelComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigDataService);
  private readonly fileDownloadService = inject(FileDownloadService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly open = input(false);
  readonly closed = output<void>();

  private readonly questionInput = viewChild<ElementRef<HTMLInputElement>>('questionInput');
  private readonly messageLog = viewChild<ElementRef<HTMLElement>>('messageLog');
  private nextId = 1;

  readonly ui = ASK_UI;
  readonly maxLength = MAX_QUESTION_LENGTH;
  readonly lang = signal<AskLanguage>('en');
  readonly draft = signal('');
  readonly messages = signal<AskMessage[]>([]);
  readonly knowledgeBase = signal<AskKnowledgeBase | null>(null);
  readonly loadFailed = signal(false);

  readonly experience = this.configService.experience;
  readonly contact = this.configService.contact;
  readonly ventures = this.configService.ventures;
  readonly courses = this.configService.courses;
  readonly achievements = this.configService.achievements;
  readonly skills = this.configService.skills;
  readonly caseStudies = this.configService.caseStudies;

  readonly matcher = computed(() => {
    const knowledgeBase = this.knowledgeBase();
    const skills = this.skills();
    return knowledgeBase && skills ? createMatcher(knowledgeBase, [toolConcept(skills)]) : null;
  });

  readonly suggested = computed(() => this.knowledgeBase()?.entries.filter(entry => entry.suggested) ?? []);

  private readonly sources = computed(() => new Map<string, CaseStudySource>(
    [...(this.caseStudies()?.sources ?? []), ...(this.knowledgeBase()?.sources ?? [])].map(source => [source.id, source])
  ));

  constructor() {
    // Move focus into the panel when it opens: to the conversation while the answers load (the
    // question field is disabled until then), then to the question field once it is ready,
    // unless the visitor has already moved to another control in the panel.
    effect(() => {
      const ready = !!this.matcher();
      if (!this.open()) {
        return;
      }
      afterNextRender(() => {
        const log = this.messageLog()?.nativeElement;
        const active = this.document.activeElement;
        const onOtherControl = !!active && active !== log && !!this.host.nativeElement.contains(active);
        if (!ready) {
          log?.focus();
        } else if (!onOtherControl) {
          this.questionInput()?.nativeElement.focus();
        }
      }, { injector: this.injector });
    });
  }

  ngOnInit(): void {
    this.http.get<AskKnowledgeBase>(KNOWLEDGE_BASE_URL).subscribe({
      next: knowledgeBase => this.knowledgeBase.set(knowledgeBase),
      error: () => this.loadFailed.set(true)
    });
    const loaders: [() => unknown, () => void][] = [
      [this.experience, () => this.configService.loadExperience()],
      [this.contact, () => this.configService.loadContact()],
      [this.ventures, () => this.configService.loadVentures()],
      [this.courses, () => this.configService.loadCourses()],
      [this.achievements, () => this.configService.loadAchievements()],
      [this.skills, () => this.configService.loadSkills()],
      [this.caseStudies, () => this.configService.loadCaseStudies()]
    ];
    loaders.filter(([data]) => !data()).forEach(([, load]) => load());
  }

  ask(question: string): void {
    const text = question.trim().slice(0, MAX_QUESTION_LENGTH);
    const matcher = this.matcher();
    if (!text || !matcher) {
      return;
    }
    const lang = detectLanguage(text);
    this.lang.set(lang);
    this.addExchange({ from: 'visitor', lang, text }, { from: 'guide', lang, question: text, outcome: matcher.match(text) });
    this.draft.set('');
  }

  /** A suggested, related or clarifying question was chosen: answer that entry directly. */
  choose(entry: AskEntry): void {
    const lang = this.lang();
    const related = this.matcher()?.rank(entry.question[lang])
      .filter(scored => scored.entry !== entry && scored.entry.kind === 'answer')
      .slice(0, 2)
      .map(scored => scored.entry) ?? [];
    this.addExchange({ from: 'visitor', lang, text: entry.question[lang] }, { from: 'guide', lang, outcome: { type: 'answer', entry, related } });
  }

  restart(): void {
    this.messages.set([]);
    this.draft.set('');
    this.questionInput()?.nativeElement.focus();
  }

  toggleLanguage(): void {
    this.lang.update(lang => (lang === 'en' ? 'ar' : 'en'));
  }

  close(): void {
    this.closed.emit();
  }

  /** On small screens the panel covers the page, so close it when a link opens another page. */
  followedLink(): void {
    if (typeof window !== 'undefined' && window.matchMedia?.(SMALL_SCREEN).matches) {
      this.close();
    }
  }

  downloadCV(): void {
    this.fileDownloadService.downloadCV();
  }

  onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  text(value: { en: string; ar: string }, lang: AskLanguage = this.lang()): string {
    return value[lang];
  }

  dir(lang: AskLanguage): 'rtl' | 'ltr' {
    return lang === 'ar' ? 'rtl' : 'ltr';
  }

  isInternal(link: AskLink): boolean {
    return !!link.route;
  }

  entrySources(entry: AskEntry, lang: AskLanguage): { label: string; title: string; route?: string; fragment?: string; url?: string }[] {
    const evidenceLabels = this.caseStudies()?.evidenceTypes;
    return entry.sourceIds
      .map(id => this.sources().get(id))
      .filter((source): source is CaseStudySource => !!source)
      .map(source => ({
        label: lang === 'ar' ? EVIDENCE_LABELS_AR[source.type] : evidenceLabels?.[source.type]?.label ?? source.type,
        title: source.title,
        route: source.route,
        fragment: source.fragment,
        url: source.url
      }));
  }

  // Derived answer blocks, rendered from the portfolio data -------------------------------

  careerRoles(lang: AskLanguage): string[] {
    return (this.experience()?.experiences ?? []).map(
      role => `${role.position} · ${role.company} · ${role.startDate} – ${role.endDate ?? ASK_UI.present[lang]}`
    );
  }

  contactList(channels: AskContactChannel[], lang: AskLanguage) {
    const contact = this.contact();
    return contact ? contactActions(contact, channels, lang) : [];
  }

  ventureList(ids: string[], lang: AskLanguage): { name: string; details: string; affiliation: string; team?: string }[] {
    const ventures = this.ventures()?.ventures ?? [];
    return ids
      .map(id => ventures.find(venture => venture.id === id))
      .filter(venture => !!venture)
      .map(venture => ({
        name: venture.name,
        details: [venture.role, `${ASK_UI.since[lang]} ${venture.startDate}`, venture.status].filter(Boolean).join(' · '),
        affiliation: venture.affiliation,
        team: venture.team
      }));
  }

  certificationList(): string[] {
    return (this.courses()?.courses ?? [])
      .filter(course => course.level === 'Certification')
      .map(course => `${course.title} · ${course.provider.replace(/^Certification · /, '')} · ${course.completionDate}`);
  }

  achievementList(ids: string[]): string[] {
    const achievements = this.achievements()?.achievements ?? [];
    return ids
      .map(id => achievements.find(achievement => achievement.id === id))
      .filter(achievement => !!achievement)
      .map(achievement => [achievement.title, achievement.organization, achievement.date].filter(Boolean).join(' · '));
  }

  skillGroups(): { category: string; names: string }[] {
    return (this.skills()?.categories ?? [])
      .filter(category => TOOL_CATEGORIES.includes(category.category))
      .map(category => ({ category: category.category, names: category.skills.map(skill => skill.name).join(', ') }));
  }

  /** Tools from skills.json named in the visitor's question, e.g. "JMeter (API & Performance Testing)". */
  mentionedTools(question: string | undefined, lang: AskLanguage): string[] {
    if (!question) {
      return [];
    }
    const words = ` ${normalize(question)} `;
    return (this.skills()?.categories ?? [])
      .filter(category => TOOL_CATEGORIES.includes(category.category))
      .flatMap(category => category.skills
        .filter(skill => words.includes(` ${normalize(skill.name)} `))
        .map(skill => `${skill.name} (${category.category}${category.category === EXPLORATION_CATEGORY ? `, ${ASK_UI.exploration[lang]}` : ''})`));
  }

  caseStudyList(): { title: string; slug: string; context: string }[] {
    return (this.caseStudies()?.caseStudies ?? []).map(study => ({
      title: study.title,
      slug: study.slug,
      context: `${study.organization} · ${study.period}`
    }));
  }

  blockTypes(entry: AskEntry): AskBlock[] {
    return entry.blocks ?? [];
  }

  blockChannels(block: AskBlock): AskContactChannel[] {
    return block.type === 'contact' ? block.channels : [];
  }

  blockIds(block: AskBlock): string[] {
    return block.type === 'ventures' || block.type === 'achievements' ? block.ids : [];
  }

  private addExchange(visitor: Omit<AskMessage, 'id'>, guide: Omit<AskMessage, 'id'>): void {
    const answer = guide.outcome?.type === 'answer' ? guide.outcome.entry.answer[guide.lang] : undefined;
    this.messages.update(messages => [
      ...messages,
      { ...visitor, id: this.nextId++ },
      { ...guide, id: this.nextId++, parts: answer ? answerParts(answer) : undefined }
    ]);
    afterNextRender(() => {
      const log = this.messageLog()?.nativeElement;
      const latest = log?.querySelector<HTMLElement>('.ask-message:last-child');
      if (log && latest) {
        log.scrollTop = latest.offsetTop - log.offsetTop - 8;
      }
    }, { injector: this.injector });
  }
}
