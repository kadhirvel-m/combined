import type { NavLink } from "@/components/site/nav-data";

/** Loader shown in the hero while the session is being resolved. */
export const DASHBOARD_LOTTIE = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";

export interface Slide {
  src: string;
  alt: string;
}

export const STORYBOOK_SLIDES: Slide[] = Array.from({ length: 8 }, (_, i) => ({
  src: `/assets/img/storybook/slides/slide${i + 1}.png`,
  alt: `Storybook Slide ${i + 1}`,
}));

export interface ResourceLogo {
  name: string;
  src: string;
  /** Extra classes for the image (one logo has rounded corners). */
  imgClassName?: string;
}

export const RESOURCE_LOGOS: ResourceLogo[] = [
  { name: "GeeksforGeeks", src: "https://media.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" },
  {
    name: "Tutorialspoint",
    src: "https://play-lh.googleusercontent.com/F10OOHNkeNbOf5x9DYpoihAIkLRlSMxCsPHyCErXgm0oM2gZtJwVymJIZoN59v4JJWBZ",
  },
  { name: "Wikipedia", src: "https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg" },
  { name: "Byjus", src: "https://i.pinimg.com/736x/ee/4f/82/ee4f8235abca76a1da9b6045ba4226e4.jpg", imgClassName: "rounded" },
];

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "menu_book",
    title: "Syllabus → Smart Notes",
    description: "Auto-structured notes per Unit → Topic → Sub-topic with examples & diagrams.",
  },
  {
    icon: "style",
    title: "Flashcards & SRS",
    description: "Spaced-repetition decks with images, formulas, and quick tests.",
  },
  {
    icon: "quiz",
    title: "Question Banks & Past Papers",
    description: "Chapter-wise previous questions with solutions & weightage analytics.",
  },
  {
    icon: "auto_awesome",
    title: "AI Diagrams & Summaries",
    description: "Topic diagrams, tables, and one-page summaries auto-generated.",
  },
  {
    icon: "task_alt",
    title: "Exam-oriented Study Plans",
    description: "Week-by-week goals, PYQ focus, and high-yield checkpoints.",
  },
  {
    icon: "translate",
    title: "Multilingual & Offline",
    description: "English + Indian languages. Sync once, study anywhere.",
  },
];

export interface Step {
  title: string;
  description: string;
  /** Background of the numbered badge. */
  badgeClassName: string;
}

export const STEPS: Step[] = [
  { title: "Upload Syllabus", description: "PDF / image supported. We parse units & topics.", badgeClassName: "bg-brand-500" },
  { title: "Generate Content", description: "Notes, diagrams, flashcards, and question maps.", badgeClassName: "bg-brand-700" },
  { title: "Practice", description: "PYQs, chapter tests, and spaced review.", badgeClassName: "bg-brand-500" },
  { title: "Track & Improve", description: "Weak-area detection and smart remediation.", badgeClassName: "bg-plum" },
];

/** Footer "Product" column: in-page anchors on the landing page. */
export const FOOTER_PRODUCT_LINKS: NavLink[] = [
  { label: "Feature overview", href: "#features" },
  { label: "Workflow", href: "#how-it-works" },
  { label: "Pricing & plans", href: "#pricing" },
  { label: "Developer API", href: "#" },
  { label: "Status", href: "#" },
];
