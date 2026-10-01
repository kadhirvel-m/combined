import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { AppLink } from "@/components/site/AppLink";
import { GlowOrbs, GradientHeading, MarketingShell } from "../components";
import { ContactForm } from "./ContactForm";
import styles from "./contact.module.css";

const MEDIA = [
  {
    video: "/assets/video/help1.mp4",
    icon: "support_agent",
    eyebrow: "Helpline",
    title: "Direct customer care",
    caption: (
      <>
        Call or WhatsApp: <span className="font-medium">+91 90000 00000</span>
      </>
    ),
  },
  {
    video: "/assets/video/help2.mp4",
    icon: "public",
    eyebrow: "Global",
    title: "Worldwide assistance",
    caption: "Email + async coverage for international campuses",
  },
];

const CHANNELS = [
  {
    icon: "forum",
    tone: "bg-brand-500/15 text-brand-500",
    title: "Student helpline",
    body: "Instant guidance for syllabus uploads, flashcards, or study doubts. Chat with mentors, share screenshots, or upload PDFs to get personalized help fast.",
    meta: "Avg. response 12 minutes",
    cta: { label: "Open chat", href: "https://wa.me/919000000000" },
  },
  {
    icon: "diversity_3",
    tone: "bg-brand-700/15 text-brand-700",
    title: "handshake",
    body: "Empower your learners and teams with our adaptive AI modules. Get white-label dashboards, onboarding analytics, and campus licensing support.",
    meta: "Response in 24 hours",
    cta: { label: "Become a partner", href: "mailto:partnerships@paperx.ai" },
  },
  {
    icon: "code",
    tone: "bg-brand-500/15 text-brand-500",
    title: "Reach student minds",
    body: "Promote your brand inside real learning spaces. Sponsor flashcards, course pages, or events that students actually use each and every day.",
    meta: "Campaigns go live within 48 hours",
    cta: { label: "Launch", href: "#form" },
  },
];

const FAQS: { q: string; a: ReactNode }[] = [
  {
    q: "How do I invite my teammates to a project?",
    a: (
      <>
        Open the project → <strong>Team</strong> → <strong>Invite</strong> and share the link. Members join with campus
        email verification.
      </>
    ),
  },
  {
    q: "Can I undo a skill test submission?",
    a: "Tests auto-submit at time-out. You can request a reset within 30 minutes from the results page. Mentors can reopen attempts.",
  },
  {
    q: "Where can I see my billing history?",
    a: (
      <>
        Go to <strong>Account</strong> → <strong>Billing</strong>. Download invoices, manage UPI mandates, and switch
        plans anytime.
      </>
    ),
  },
  {
    q: "Does Paper X work offline?",
    a: "Yes. Sync your syllabus once, then use notes and flashcards offline. Progress syncs when you reconnect.",
  },
];

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.606561630274!2d80.2297!3d12.8719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDUyJzE5LjAiTiA4MMKwMTMnNDcuMCJF!5e0!3m2!1sen!2sin!4v1715000000000!5m2!1sen!2sin";

function InfoTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-black/5 dark:ring-white/10">
      <p className="text-xs uppercase tracking-widest text-brand-500">{label}</p>
      <p className="mt-2 text-sm text-neutral-600">{value}</p>
      <p className="mt-3 text-xs text-neutral-500">{note}</p>
    </div>
  );
}

export function ContactPage() {
  return (
    <MarketingShell
      announcement="WhatsApp, live chat, and email support are monitored all night during exam weeks."
      announcementLabel="24×7"
    >
      {/* Help center hero with search */}
      <section className="relative overflow-hidden">
        <GlowOrbs />
        <div className="container max-w-6xl py-12 md:py-16 text-center">
          <GradientHeading as="h1" className="leading-10">
            Help Center
          </GradientHeading>
          <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-white/75 max-w-3xl mx-auto">
            Troubleshoot faster, master new features, and get live support. Paper X keeps you in flow.
          </p>
          <form className="mt-10 max-w-2xl mx-auto" role="search">
            <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500/80" />
              <input
                type="search"
                name="q"
                placeholder="Search guides, FAQs, release notes..."
                autoComplete="off"
                className="w-full rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-12 py-4 text-sm shadow-soft dark:shadow-glow focus:border-brandlt-400 focus:ring-brandlt-200"
              />
            </div>
          </form>
          <p className="mt-3 text-xs text-neutral-500 dark:text-white/60">
            Popular: syllabus upload errors, AI notes export, campus billing
          </p>
        </div>
      </section>

      {/* Helpline & global help clips */}
      <section className="py-6 md:py-8">
        <div className="container max-w-6xl">
          <div className="grid gap-8 md:gap-10 md:grid-cols-2 items-stretch">
            {MEDIA.map((m) => (
              <figure
                key={m.title}
                className="relative group rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 shadow-soft dark:shadow-glow"
              >
                <div className="aspect-[4/3] w-full overflow-hidden">
                  <video
                    className="w-full h-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={m.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-transparent p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80 mb-1 flex items-center gap-1">
                    <Icon name={m.icon} className="text-base text-brand-300" />
                    {m.eyebrow}
                  </p>
                  <h3 className="text-lg font-semibold text-white leading-snug">{m.title}</h3>
                  <p className="text-[11px] text-white/80 mt-1">{m.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Support channels */}
      <section className="py-16 md:py-10">
        <div className="container max-w-6xl space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <GradientHeading className="leading-[1.05] tracking-normal">Pick the channel that fits the moment</GradientHeading>
              <p className="text-sm text-neutral-600 dark:text-white/70">
                Blend async and live support. We’ll meet you where your day is already happening.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-white/60">
              <div className="flex items-center gap-2">
                <Icon name="schedule" className="text-brand-500" />9 AM – 9 PM IST (live)
              </div>
              <div className="flex items-center gap-2">
                <Icon name="bedtime" className="text-brand-500" />
                Overnight callbacks in &lt; 12 hrs
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {CHANNELS.map((c) => (
              <article
                key={c.title}
                className={`${styles.glassCard} rounded-3xl border border-white/60 dark:border-white/10 p-6 shadow-soft dark:shadow-glow`}
              >
                <div className={`inline-flex size-11 items-center justify-center rounded-full mb-5 ${c.tone}`}>
                  <Icon name={c.icon} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-white/70">{c.body}</p>
                <div className="mt-6 flex items-center justify-between text-xs text-neutral-500 dark:text-white/60">
                  <span>{c.meta}</span>
                  <a className="inline-flex items-center gap-1 font-medium text-brand-500 dark:text-brandlt-300" href={c.cta.href}>
                    {c.cta.label}
                    <Icon name="arrow_outward" className="text-base" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-16 md:py-20">
        <div className="container max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">Top FAQs</h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-white/70 text-center">
            Short answers to questions we get every day.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 p-5">
                <summary className="flex items-center justify-between gap-4 text-sm font-semibold">
                  {f.q}
                  <Icon name="add" className="text-brand-500 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <div className="mt-3 text-sm text-neutral-600 dark:text-white/70">{f.a}</div>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://status.paperx.ai"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Icon name="monitoring" className="text-base" /> Check system status
            </a>
            <AppLink
              href="/contact.html"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold hover:shadow-glow"
            >
              <Icon name="support" className="text-base" /> Chat with support
            </AppLink>
          </div>
        </div>
      </section>

      {/* Visit + contact form */}
      <section id="form" className="py-16 md:py-10">
        <div className="container max-w-6xl">
          <div className="text-center space-y-4 mb-12">
            <GradientHeading className="leading-[1.05] tracking-normal">Drop by our Chennai HQ or invite us to campus</GradientHeading>
            <p className="text-sm text-neutral-600">
              We love live demos and open houses. Book a walkthrough for faculty, students, and student developer clubs.
            </p>
          </div>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoTile
                  label="HQ"
                  value="Paper X Labs, 4th Floor Innovation Tower, OMR, Chennai — 600119"
                  note="Walk-in demo slots every Friday, 3 – 6 PM IST (book ahead)."
                />
                <InfoTile label="Support hotline" value="+91 90000 00000" note="Emergency channels escalate straight to duty engineers." />
              </div>
              <a href="mailto:visits@paperx.ai" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:underline">
                Schedule a visit
                <Icon name="east" className="text-base" />
              </a>
              <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-soft dark:shadow-glow">
                <iframe
                  title="Paper X HQ"
                  src={MAP_SRC}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
            <div className="relative rounded-[30px] border border-black/5 dark:border-white/10 bg-white/90 dark:bg-[#1F1A2C]/90 shadow-soft dark:shadow-glow p-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
