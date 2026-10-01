import { Icon } from "@/components/ui/Icon";
import { AppLink } from "@/components/site/AppLink";
import {
  FeatureRow,
  GlowOrbs,
  GradientHeading,
  IconCard,
  ImageCard,
  MarketingShell,
  SectionIntro,
  VideoFrame,
} from "../components";
import { CtaBand } from "../CtaBand";
import { JourneyCards } from "./JourneyCards";
import { ProcessTimeline } from "./ProcessTimeline";
import { TeamCard } from "./TeamCard";

const TEAM_AVATARS = [11, 15, 32, 5].map((n) => `https://i.pravatar.cc/60?img=${n}`);

const BENTO = [
  { src: "/assets/img/about1.png", alt: "Team working together", span: "col-span-4 sm:col-span-4 sm:row-span-3" },
  { src: "/assets/img/about2.png", alt: "Team standup", span: "col-span-2 sm:col-span-2 sm:row-span-3" },
  { src: "/assets/img/about3.png", alt: "Pairing", span: "col-span-2 sm:col-span-3 sm:row-span-2" },
  { src: "/assets/img/about4.png", alt: "Demo day", span: "col-span-2 sm:col-span-2 sm:row-span-2" },
  { src: "/assets/img/about6.png", alt: "Brainstorming", span: "col-span-2 sm:col-span-1 sm:row-span-2" },
  { src: "/assets/img/about5.png", alt: "Product showcase", span: "col-span-2 sm:col-span-3 sm:row-span-1" },
];

const PILLARS = [
  {
    title: "AI-Powered Notes Generator",
    body: "Turn syllabi into structured, citation-aware notes with KaTeX math and export to Markdown/PDF — all in real time.",
    video: "/assets/video/abt1.mp4",
  },
  {
    title: "Project Collaboration Hub",
    body: "Rich project boards, milestone tracking, smart team matching, messaging, and assets — collaborate like a pro.",
    video: "/assets/video/abt2.mp4",
  },
  {
    title: "Skill Verification & Adaptive Testing",
    body: "Adaptive MCQs, coding challenges, and instant scoring — earn verified badges that live on your profile.",
    video: "/assets/video/abt3.mp4",
  },
];

const PRINCIPLES = [
  { icon: "flag", title: "Mission", body: "Make exam-ready learning simple, structured, and accessible for every Indian student." },
  { icon: "visibility", title: "Vision", body: "From syllabus to mastery — one platform that adapts to you." },
  { icon: "verified", title: "Values", body: "Trust, clarity, inclusion, and relentless improvement." },
];

const VALUES = [
  { img: "1.png", alt: "Unity team photo", title: "Unity", body: "We ship as one team — learners, designers, engineers, mentors." },
  { img: "5.png", alt: "Journey Together", title: "Journey Together", body: "Clear path, shared milestones, steady support." },
  {
    img: "4.png",
    alt: "Diversity & Inclusion",
    title: "Diversity & Inclusion",
    body: "Everyone belongs. We design for different languages, levels, and needs.",
  },
  { img: "3.png", alt: "Innovation Spirit", title: "Innovation Spirit", body: "We experiment, validate, and iterate — fast." },
  { img: "2.png", alt: "Growth & Learning", title: "Growth & Learning", body: "We climb together — with mentorship, feedback, and steady steps." },
  {
    img: "6.png",
    alt: "Collaboration & Trust",
    title: "Collaboration & Trust",
    body: "Every idea matters, every voice counts, every success is shared.",
  },
];

export function AboutPage() {
  return (
    <MarketingShell announcement="We’re growing our team — see open roles on the Careers page." header={{ position: "fixed" }}>
      {/* Hero: unity → team photo */}
      <section className="relative overflow-hidden">
        <GlowOrbs />
        <div className="container max-w-6xl py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div>
              <GradientHeading as="h1" className="md:text-6xl">
                We grow together.
              </GradientHeading>
              <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-white/75 max-w-2xl">
                PaperX is built by students, mentors, and engineers who care about exam success and real learning.Unity is
                our superpower.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {TEAM_AVATARS.map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element -- remote placeholder avatars
                    <img key={src} className="size-10 rounded-full ring-2 ring-white dark:ring-brand-900 object-cover" src={src} alt="" />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-white/70">A tiny team with big energy ✨</p>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-brand-900/40 backdrop-blur">
              <div className="grid grid-cols-4 sm:grid-cols-6 auto-rows-[100px] sm:auto-rows-[120px] gap-1.5 p-1.5">
                {BENTO.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element -- bento collage
                  <img key={img.src} className={`${img.span} w-full h-full object-cover rounded-2xl`} src={img.src} alt={img.alt} />
                ))}
              </div>
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#4C2A59]/20 to-[#9E4B8A]/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Three pillars with product clips */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <SectionIntro
            className="mb-14"
            subtitleClassName="mt-4"
            title="Learn faster, build together, get verified — the Paper X way"
            subtitle="Three pillars that power your academic journey with AI precision and a collaborative heartbeat."
          />
          {PILLARS.map((p, i) => (
            <FeatureRow
              key={p.title}
              className={i < PILLARS.length - 1 ? "mb-16" : undefined}
              title={p.title}
              body={p.body}
              reverse={i % 2 === 1}
              media={<VideoFrame src={p.video} align={i % 2 === 1 ? "left" : "right"} />}
            />
          ))}
        </div>
      </section>

      {/* Mission • Vision • Values */}
      <section id="journey" className="py-16 md:py-20 border-y border-black/5 dark:border-white/10">
        <div className="container max-w-6xl">
          <SectionIntro title="Journey Together" subtitle="Our mission, vision, and values align around student success." />
          <div className="grid md:grid-cols-3 gap-6">
            {PRINCIPLES.map((p) => (
              <IconCard key={p.title} icon={p.icon} title={p.title}>
                {p.body}
              </IconCard>
            ))}
          </div>
        </div>
      </section>

      {/* Team spotlight */}
      <section id="team" className="py-16 md:py-6">
        <div className="container max-w-7xl">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-start">
            <div>
              <GradientHeading>Brains behind our Pa[p]er X</GradientHeading>
            </div>
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mb-2 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:snap-none">
                <TeamCard
                  name="Kadhirvel M"
                  role="Chief Director"
                  photo="/assets/img/about pic/kad-pic.png"
                  links={{
                    linkedin: "https://www.linkedin.com/in/kadhirvel-m/",
                    github: "https://github.com/kadhirvel-m",
                    email: "kadhirvel.ai@gmail.com",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section id="values" className="py-20">
        <div className="container max-w-7xl">
          <SectionIntro title="What we stand for" subtitle="Five principles guide how we build and how we learn." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v) => (
              <ImageCard key={v.title} src={`/assets/img/about pic/${v.img}`} alt={v.alt} title={v.title}>
                {v.body}
              </ImageCard>
            ))}
          </div>
        </div>
      </section>

      <ProcessTimeline />
      <JourneyCards />

      <CtaBand
        glow
        title="Believe what we believe?"
        body="Join us as a campus ambassador, mentor, or contributor."
        actions={
          <>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-4px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_28px_-6px_rgba(158,75,138,0.8)] transition"
            >
              <Icon name="diversity_3" className="text-base" />
              {" ' Become an Ambassador"}
            </a>
            <AppLink
              href="/contact.html"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5"
            >
              <Icon name="mail" className="text-base" /> Contact us
            </AppLink>
          </>
        }
      />
    </MarketingShell>
  );
}
