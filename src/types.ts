export type Site = {
  NAME: string;
  EMAIL: string;
  NUM_POSTS_ON_HOMEPAGE: number;
  NUM_WRITEUPS_ON_HOMEPAGE: number;
  NUM_WORKS_ON_HOMEPAGE: number;
  NUM_PROJECTS_ON_HOMEPAGE: number;
};

export type Metadata = {
  TITLE: string;
  DESCRIPTION: string;
};

export type Socials = {
  NAME: string;
  HREF: string;
}[];

export type Skills = {
  LABEL: string;
  ITEMS: string[];
}[];

export type Highlights = {
  LABEL: string;
  TITLE: string;
  DETAIL?: string;
  /** The large tile; meant for exactly one entry, the current one. */
  FEATURED?: boolean;
}[];
