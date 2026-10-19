import type { AskConcept, AskContactChannel, AskLanguage, AskText, Contact, SkillData } from '../../core/models';

/** Skill categories whose tool names can be asked about directly ("Does he know JMeter?"). */
export const TOOL_CATEGORIES = [
  'Test Automation',
  'API & Performance Testing',
  'CI/CD & Test Management',
  'Languages & Data',
  'AI-Assisted Development',
  'Hands-on Exploration (LLM Evaluation & Agents)'
];

/** Category listed as hands-on exploration (not production use) in the CV. */
export const EXPLORATION_CATEGORY = 'Hands-on Exploration (LLM Evaluation & Agents)';

/** A "tool" concept built from the tool names in skills.json, so new skills are matched without editing the guide. */
export function toolConcept(skills: SkillData): AskConcept {
  return {
    id: 'tool',
    terms: skills.categories
      .filter(category => TOOL_CATEGORIES.includes(category.category))
      .flatMap(category => category.skills.map(skill => skill.name))
  };
}

export interface AnswerPart {
  type: 'paragraph' | 'list';
  lines: string[];
}

/** Splits approved answer text into paragraphs and lists (lines starting with "- "). */
export function answerParts(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  for (const line of text.split('\n').map(value => value.trim()).filter(Boolean)) {
    const isItem = line.startsWith('- ');
    const last = parts[parts.length - 1];
    if (isItem && last?.type === 'list') {
      last.lines.push(line.slice(2));
    } else {
      parts.push({ type: isItem ? 'list' : 'paragraph', lines: [isItem ? line.slice(2) : line] });
    }
  }
  return parts;
}

export interface ContactAction {
  channel: AskContactChannel;
  label: string;
  value: string;
  href: string;
  external: boolean;
}

const CHANNEL_LABELS: Record<AskContactChannel, AskText> = {
  riyadh: { en: 'Saudi Arabia (Riyadh): call', ar: 'السعودية (الرياض): اتصال' },
  egypt: { en: 'Egypt: call', ar: 'مصر: اتصال' },
  whatsapp: { en: 'WhatsApp (Egyptian number)', ar: 'واتساب (الرقم المصري)' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  linkedin: { en: 'LinkedIn', ar: 'LinkedIn' }
};

/** Contact actions from contact.json for the requested channels, in the requested order. */
export function contactActions(contact: Contact, channels: AskContactChannel[], lang: AskLanguage): ContactAction[] {
  const whatsappDigits = (contact.whatsapp ?? '').replace(/\D/g, '');
  const whatsappDisplay = contact.whatsapp === contact.phoneEgypt && contact.phoneEgyptDisplay ? contact.phoneEgyptDisplay : contact.whatsapp;
  const byChannel: Record<AskContactChannel, Omit<ContactAction, 'channel' | 'label'> | null> = {
    riyadh: contact.phone ? { value: contact.phoneDisplay ?? contact.phone, href: `tel:${contact.phone}`, external: false } : null,
    egypt: contact.phoneEgypt ? { value: contact.phoneEgyptDisplay ?? contact.phoneEgypt, href: `tel:${contact.phoneEgypt}`, external: false } : null,
    whatsapp: whatsappDigits ? { value: whatsappDisplay, href: `https://wa.me/${whatsappDigits}`, external: true } : null,
    email: contact.email ? { value: contact.email, href: `mailto:${contact.email}`, external: false } : null,
    linkedin: contact.linkedin
      ? { value: contact.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), href: contact.linkedin, external: true }
      : null
  };
  return channels
    .map(channel => ({ channel, action: byChannel[channel] }))
    .filter((item): item is { channel: AskContactChannel; action: Omit<ContactAction, 'channel' | 'label'> } => !!item.action)
    .map(({ channel, action }) => ({ channel, label: CHANNEL_LABELS[channel][lang], ...action }));
}

/** Interface text of the guide, in both languages. */
export const ASK_UI = {
  title: { en: 'Ask About Mahmoud', ar: 'اسأل عن محمود' },
  badge: { en: 'Portfolio guide · not AI', ar: 'دليل الملف · ليس ذكاءً اصطناعيًا' },
  notice: {
    en: 'Prepared answers from this portfolio, matched to your question on this device. This is not a generative AI chatbot and it may not understand every question. Your questions are not stored.',
    ar: 'إجابات مُعدّة من هذا الملف تُطابَق مع سؤالك على جهازك. هذا ليس روبوت محادثة بالذكاء الاصطناعي التوليدي وقد لا يفهم كل الأسئلة. ولا يتم حفظ أسئلتك.'
  },
  placeholder: { en: 'Ask about experience, skills, products…', ar: 'اسأل عن الخبرات أو المهارات أو المنتجات…' },
  inputLabel: { en: 'Your question', ar: 'سؤالك' },
  send: { en: 'Ask', ar: 'اسأل' },
  close: { en: 'Close the portfolio guide', ar: 'إغلاق دليل الملف' },
  restart: { en: 'Start over', ar: 'البدء من جديد' },
  switchLanguage: { en: 'العربية', ar: 'English' },
  switchLanguageLabel: { en: 'Show the guide in Arabic', ar: 'عرض الدليل بالإنجليزية' },
  suggestions: { en: 'Suggested questions', ar: 'أسئلة مقترحة' },
  related: { en: 'Related questions', ar: 'أسئلة ذات صلة' },
  sources: { en: 'Sources', ar: 'المصادر' },
  you: { en: 'You', ar: 'أنت' },
  guide: { en: 'Guide', ar: 'الدليل' },
  loading: { en: 'Loading the portfolio guide…', ar: 'جارٍ تحميل دليل الملف…' },
  loadError: {
    en: 'The guide could not load its answers. You can still browse the portfolio pages.',
    ar: 'تعذّر تحميل الإجابات. لا يزال بإمكانك تصفّح صفحات الملف.'
  },
  present: { en: 'Present', ar: 'حتى الآن' },
  since: { en: 'Since', ar: 'منذ' },
  mentionedTools: { en: 'Listed in his CV', ar: 'مذكورة في سيرته الذاتية' },
  exploration: { en: 'hands-on exploration', ar: 'تجربة عملية' },
  newTab: { en: 'opens in a new tab', ar: 'يفتح في نافذة جديدة' }
} satisfies Record<string, AskText>;

/** Evidence-type labels for sources (English labels come from case-studies.json). */
export const EVIDENCE_LABELS_AR: Record<string, string> = {
  cv: 'السيرة الذاتية',
  portfolio: 'الملف',
  'public-product': 'الموقع العام',
  methodology: 'منهجية عامة',
  synthetic: 'مثال توضيحي'
};
