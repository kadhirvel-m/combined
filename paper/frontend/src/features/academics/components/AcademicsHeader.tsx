"use client";

import { SiteHeader } from "@/components/site/SiteHeader";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import type { NavLink } from "@/components/site/nav-data";
import { useSession } from "@/lib/session";
import { DevModeToggle } from "./Shell";
import { Glyph } from "./Glyph";

const LINKS: NavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "Wishlist", href: "/wishlist.html", icon: "favorite" },
  { label: "History", href: "/history.html", icon: "history" },
  { label: "Contact", href: "/contact.html" },
];

const roundBtn =
  "inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition";

export interface AcademicsHeaderProps {
  devMode: boolean;
  devEligible: boolean;
  onDevModeChange: (on: boolean) => void;
  onMobileSearch: () => void;
  onEditEducation: () => void;
}

/**
 * The Academics navbar: the app variant of SiteHeader with no drawer. On mobile
 * the bar holds search, edit education, theme and the dev switch instead.
 */
export function AcademicsHeader({ devMode, devEligible, onDevModeChange, onMobileSearch, onEditEducation }: AcademicsHeaderProps) {
  const session = useSession();
  const signedIn = session.status === "authenticated";
  return (
    <SiteHeader
      variant="app"
      links={LINKS}
      mobileMenu={false}
      containerClassName="min-h-[68px]"
      actions={devEligible ? <DevModeToggle label checked={devMode} onChange={onDevModeChange} /> : null}
      actionsPosition="after-theme"
      mobileBar={
        <>
          <button type="button" aria-label="Search" onClick={onMobileSearch} className={roundBtn}>
            <Glyph name="search" />
          </button>
          {signedIn ? (
            <button type="button" aria-label="Edit education" onClick={onEditEducation} className={roundBtn}>
              <Glyph name="edit" />
            </button>
          ) : null}
          <ThemeToggle compact />
          {devEligible ? <DevModeToggle checked={devMode} onChange={onDevModeChange} /> : null}
        </>
      }
    />
  );
}
