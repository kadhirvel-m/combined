import type { AuthNavLink } from "../types";

/** Desktop links of login.html / signup.html (also the start of their mobile drawers). */
export const STUDENT_NAV: AuthNavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Contact", href: "/contact.html" },
  { label: "Help", href: "/help.html" },
  { label: "Pricing", href: "/index.html#pricing" },
];

/** teacher_login.html. */
export const TEACHER_LOGIN_NAV: AuthNavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Help", href: "/help.html" },
  { label: "Apply", href: "/teachers/teacher_signup.html", className: "font-medium" },
];

/** teacher_signup.html. */
export const TEACHER_SIGNUP_NAV: AuthNavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Contact", href: "/contact.html" },
  { label: "Help", href: "/help.html" },
  { label: "Teacher Login", href: "/teachers/teacher_login.html" },
  { label: "Connect", href: "/teachers/teacher_connect.html" },
];
