"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Dropdown } from "@/components/ui/Dropdown";
import { AppLink } from "./AppLink";
import { PROJECT_CATEGORIES, type MegaMenuCategory } from "./nav-data";

const VISIBLE = 4;

/** "Projects" hover mega menu: category rail + paged featured cards. */
export function ProjectsMegaMenu({ categories = PROJECT_CATEGORIES }: { categories?: MegaMenuCategory[] }) {
  const [current, setCurrent] = useState(0);
  const [pageStart, setPageStart] = useState(0);
  const category = categories[current];
  const total = category.items.length;
  const canPrev = pageStart > 0;
  const canNext = pageStart + VISIBLE < total;
  const totalPages = Math.ceil(total / VISIBLE);

  const select = (i: number) => {
    setCurrent(i);
    setPageStart(0);
  };

  return (
    <Dropdown
      hover
      align="center"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="group inline-flex items-center gap-1 rounded-full px-3 py-2 font-medium text-ink/90 dark:text-white/90 hover:bg-stoneTint dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
        >
          Projects
          <Icon name="expand_more" className={cn("text-base transition-transform", open && "rotate-180")} />
        </button>
      )}
      panelClassName="w-[1050px] max-w-[95vw]"
    >
      <div className="rounded-3xl border border-edge dark:border-transparent bg-white dark:bg-brand-900/95 shadow-2xl dark:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur supports-[backdrop-filter]:bg-white/95 overflow-hidden">
        <div className="grid grid-cols-[300px,1fr]">
          <aside className="border-r border-edge/80 dark:border-white/10 p-4 bg-white/80 dark:bg-white/10">
            <ul className="space-y-2">
              {categories.map((c, i) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    onMouseEnter={() => select(i)}
                    onFocus={() => select(i)}
                    aria-current={i === current ? "true" : "false"}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:bg-stoneTint dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta",
                      i === current && "bg-stoneTint dark:bg-magenta/10 shadow-sm border-edge dark:border-magenta/40",
                    )}
                  >
                    <span>
                      <span className="block text-[13px] font-bold tracking-wide text-deepPurple dark:text-white uppercase">{c.title}</span>
                      <span className="mt-0.5 block text-[12px] text-ink/70 dark:text-white/50">{c.subtitle}</span>
                    </span>
                    <Icon name="chevron_right" className="text-magenta group-hover:translate-x-0.5 transition dark:text-magenta/80" />
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[13px] font-bold tracking-[0.12em] text-ink/80 dark:text-white/70 uppercase">Featured Pages</h3>
              <div className="hidden sm:flex items-center gap-2">
                {[
                  { icon: "chevron_left", enabled: canPrev, go: () => setPageStart((p) => p - VISIBLE), label: "Previous" },
                  { icon: "chevron_right", enabled: canNext, go: () => setPageStart((p) => p + VISIBLE), label: "Next" },
                ].map((b) => (
                  <button
                    key={b.icon}
                    type="button"
                    aria-label={b.label}
                    disabled={!b.enabled}
                    onClick={b.go}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-edge dark:border-white/15 bg-white dark:bg-white/10 text-ink dark:text-white hover:bg-stoneTint dark:hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon name={b.icon} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 relative w-full max-w-[760px]">
              <div className="flex gap-3" role="list">
                {category.items.slice(pageStart, pageStart + VISIBLE).map((item) => (
                  <AppLink
                    key={item.name}
                    href={item.href}
                    role="listitem"
                    className="group relative flex h-64 w-40 flex-col overflow-hidden rounded-xl border border-edge dark:border-white/15 bg-white dark:bg-white/5 shadow-ring hover:border-magenta/50 dark:hover:border-magenta/50 transition"
                  >
                    {item.img ? (
                      // eslint-disable-next-line @next/next/no-img-element -- static menu artwork
                      <img src={item.img} alt={`${item.name} image`} className="h-48 w-full object-cover opacity-95 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="h-48 w-full bg-stoneTint dark:bg-white/10 flex items-center justify-center text-xs text-ink/60 dark:text-white/50">
                        No Image
                      </div>
                    )}
                    <div className="flex flex-1 flex-col px-2 py-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-magenta dark:text-magenta/80">{item.tag}</div>
                      <div className="mt-0.5 text-sm font-bold leading-snug text-ink dark:text-white">{item.name}</div>
                    </div>
                  </AppLink>
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-2 text-[11px] text-ink/60 dark:text-white/50">
                  {Math.floor(pageStart / VISIBLE) + 1}/{totalPages}
                </div>
              ) : null}
            </div>
            <div className="mt-4 flex items-center">
              <span className="mr-2 h-6 w-1 rounded-full bg-magenta" />
              <AppLink
                href={category.cta.href}
                className="inline-flex items-center gap-1 text-[13px] font-bold uppercase tracking-wide text-magenta hover:text-deepPurple dark:hover:text-white dark:text-magenta/90"
              >
                {category.cta.label}
                <Icon name="chevron_right" className="text-base" />
              </AppLink>
            </div>
          </section>
        </div>
      </div>
    </Dropdown>
  );
}
