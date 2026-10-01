import { Icon } from "@/components/ui/Icon";

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
  links: { linkedin?: string; github?: string; email?: string };
}

const linkClass =
  "pointer-events-auto inline-flex items-center justify-center size-11 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur ring-1 ring-black/10 dark:ring-white/20 hover:scale-110 hover:bg-white dark:hover:bg-white/20 transition";

/** Team member card; social links fade in over the photo on hover. */
export function TeamCard({ name, role, photo, links }: TeamMember) {
  const items = [
    links.linkedin && { href: links.linkedin, label: "LinkedIn", icon: "work", external: true },
    links.github && { href: links.github, label: "GitHub", icon: "code", external: true },
    links.email && { href: `mailto:${links.email}`, label: "Email", icon: "mail", external: false },
  ].filter(Boolean) as { href: string; label: string; icon: string; external: boolean }[];

  return (
    <article className="group min-w-[85%] snap-start md:min-w-0 rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-brand-900/40 backdrop-blur relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- team photo */}
      <img
        src={photo}
        alt={name}
        className="w-full object-cover object-top md:aspect-[25/24] transition duration-300 group-hover:opacity-35"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="flex items-center gap-4">
          {items.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label}
              className={linkClass}
              {...(l.external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <Icon name={l.icon} className="text-[22px] text-brand-700 dark:text-white" />
            </a>
          ))}
        </div>
      </div>
      <div className="p-5 relative z-10">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{name}</h3>
        <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{role}</p>
      </div>
    </article>
  );
}
