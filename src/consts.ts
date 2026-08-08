import type { Site, Metadata, Socials, Skills } from "@types";

export const SITE: Site = {
  NAME: "hush's blog",
  EMAIL: "bayuputraibana@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 3,
  NUM_WRITEUPS_ON_HOMEPAGE: 3,
  NUM_WORKS_ON_HOMEPAGE: 2,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Projects, experiments, notes, and CTF writeups on cybersecurity and software engineering.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const WORK: Metadata = {
  TITLE: "Work",
  DESCRIPTION: "Where I have worked and what I have done.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects, with links to repositories and demos.",
};

export const WRITEUPS: Metadata = {
  TITLE: "Writeups",
  DESCRIPTION: "CTF challenge solutions and writeups.",
};

export const CERTIFICATIONS: Metadata = {
  TITLE: "Certifications",
  DESCRIPTION: "Certifications I have earned and achievements along the way.",
};

export const SOCIALS: Socials = [
  {
    NAME: "GitHub",
    HREF: "https://github.com/hush1a"
  },
  {
    NAME: "LinkedIn",
    HREF: "https://www.linkedin.com/in/bayu-putra-ibana-a734a5322",
  }
];

export const SKILLS: Skills = [
  {
    LABEL: "Languages",
    ITEMS: ["Python", "JavaScript/TypeScript", "C++", "Swift", "SQL"],
  },
  {
    LABEL: "Frameworks & Libraries",
    ITEMS: ["React", "Tailwind CSS", "Node.js/Express", "FastAPI", "SwiftUI", "scikit-learn", "pandas"],
  },
  {
    LABEL: "Databases & Infrastructure",
    ITEMS: ["PostgreSQL", "Redis", "Docker", "Terraform", "Microsoft Azure", "Linux"],
  },
  {
    LABEL: "Tools",
    ITEMS: ["Git/GitHub", "Postman", "VS Code", "LaTeX", "Google Workspace", "Excel"],
  },
];
