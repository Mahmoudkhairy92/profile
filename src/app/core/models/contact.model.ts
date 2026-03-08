export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface Contact {
  email: string;
  phone: string;
  phoneEgypt?: string;
  whatsapp: string;
  linkedin: string;
  location?: string;
  birthday?: string;
  muchskills?: string;
  socialLinks: SocialLink[];
}

