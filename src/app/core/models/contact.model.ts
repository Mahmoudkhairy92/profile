export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Contact {
  email: string;
  /** Saudi number in E.164 form, used for tel: links. */
  phone: string;
  /** Saudi number formatted for display. */
  phoneDisplay?: string;
  /** Egyptian number in E.164 form, used for tel: links. */
  phoneEgypt?: string;
  /** Egyptian number formatted for display. */
  phoneEgyptDisplay?: string;
  whatsapp: string;
  linkedin: string;
  location?: string;
  muchskills?: string;
  socialLinks: SocialLink[];
}

