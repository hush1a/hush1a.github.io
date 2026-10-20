import type { Site, Metadata, Socials, Skills, Highlights } from "@types";

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

// ABOUT and HIGHLIGHTS are shared by the homepage About section and the hero
// terminal's `about` / `whoami` commands, so the two never drift apart.
export const ABOUT = "Third Year Computer Science undergraduate at Universitas Gadjah Mada with experience in software development, business consulting, and cross-functional collaboration. Skilled in translating organizational needs into technical solutions, analyzing business problems, and engaging stakeholders through leadership and project-based initiatives. Currently expanding my international and business perspective through an exchange program at Jeonbuk National University, with a strong interest in leveraging technology to solve business challenges and create meaningful impact.";

export const HIGHLIGHTS: Highlights = [
  { LABEL: "Now", TITLE: "Exchange student", DETAIL: "Jeonbuk National University, South Korea", FEATURED: true },
  { LABEL: "Studying", TITLE: "Computer Science, 3rd year", DETAIL: "Universitas Gadjah Mada" },
  { LABEL: "Communities", TITLE: "OmahTI UGM & KOMATIK", DETAIL: "Cybersecurity" },
];

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
    ITEMS: ["React", "Tailwind CSS", "Node.js/Express", "FastAPI", "scikit-learn", "pandas"],
  },
  {
    LABEL: "Databases & Infrastructure",
    ITEMS: ["PostgreSQL", "Redis", "Docker", "Terraform", "Linux"],
  },
  {
    LABEL: "Tools",
    ITEMS: ["Git/GitHub", "Postman", "VS Code", "LaTeX", "Excel"],
  },
];
