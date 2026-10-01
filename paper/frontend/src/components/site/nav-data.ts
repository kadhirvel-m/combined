/** Navigation shared by the header, mobile drawer and footer. */

export interface NavLink {
  label: string;
  href: string;
  /** Optional Material Symbols icon shown before the label. */
  icon?: string;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  // "Projects" mega menu sits here (see PROJECT_CATEGORIES).
  { label: "Teacher", href: "/teachers/teacher_login.html" },
  { label: "Contact", href: "/contact.html" },
];

export const MOBILE_NAV: NavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Academics", href: "/academicas.html" },
  { label: "Teacher", href: "/teachers/teacher_login.html" },
  { label: "Projects", href: "/projects/postings.html" },
  { label: "Contact", href: "/contact.html" },
];

export interface MegaMenuItem {
  name: string;
  tag: string;
  img?: string;
  href: string;
}

export interface MegaMenuCategory {
  id: string;
  title: string;
  subtitle: string;
  cta: NavLink;
  items: MegaMenuItem[];
}

/** The "Projects" mega menu (was Alpine `megaNav()` on the landing page). */
export const PROJECT_CATEGORIES: MegaMenuCategory[] = [
  {
    id: "proj",
    title: "Project Hub",
    subtitle: "Core Platform Navigation",
    cta: { label: "Go to Projects Hub", href: "#" },
    items: [
      { name: "Create a Project", tag: "Action", img: "/assets/img/nav/project/project2.png", href: "/inovateX/idea_setup.html" },
      { name: "My Projects", tag: "Dashboard", img: "/assets/img/nav/project/project4.png", href: "/inovateX/claimed_ideas.html" },
    ],
  },
  {
    id: "clg",
    title: "Institution",
    subtitle: "Embracing the Future",
    cta: { label: "See all Digital tools", href: "#" },
    items: [{ name: "Institutions", tag: "System", img: "/assets/img/nav/clg/clg.png", href: "/collage/clg_info.html" }],
  },
];

export const SOCIAL_LINKS = [
  { label: "Follow Paper X on Facebook", href: "https://www.facebook.com/share/1AzjbkaBhy/?mibextid=wwXIfr", icon: "facebook" },
  { label: "Follow Paper X on Instagram", href: "https://www.instagram.com/paperx.tech/", icon: "instagram" },
  { label: "Connect on LinkedIn", href: "https://www.linkedin.com/company/paper-x/", icon: "linkedin" },
  { label: "Watch our launches on YouTube", href: "https://www.youtube.com/@TeamPaperX/shorts", icon: "youtube" },
] as const;
