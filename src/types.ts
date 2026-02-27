export interface Bio {
  name: string;
  location: string;
  summary: string[];
  stats: { key: string; val: string }[];
}


export interface Project {
  name: string;
  href?: string;
  desc: string;
  stack: string;
}

export interface TechItem {
  k: string;
  v: string;
}

export interface Account {
  name: string;
  handle: string;
  href: string;
}

export interface Site {
  name: string;
  href: string;
  desc: string;
}

export interface Agent {
  title: string;
  href: string;
  summary: string;
}

export interface CardData {
  v?: number;
  bio: Bio;
  career: string[];
  projects: Project[];
  tech: TechItem[];
  accounts: Account[];
  sites: Site[];
  agents: Agent[];
  portrait?: string;
  motd?: string | null;
}
