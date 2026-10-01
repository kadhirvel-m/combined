import { Icon } from "@/components/ui/Icon";
import { AppLink } from "@/components/site/AppLink";
import { GradientHeading } from "./GradientHeading";

/** "Join the Revolution" call-to-action card with the looping product video. */
export function JoinRevolution() {
  return (
    <section className="py-20 bg-neutral-50 dark:bg-gradient-to-b dark:from-[#1E1E2F] dark:via-[#221B38] dark:to-[#141321]">
      <div className="container max-w-6xl">
        <div className="grid md:grid-cols-2 items-center gap-10 rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-[#1E1E2F]/70 backdrop-blur-sm shadow-soft-lg dark:shadow-glow-magenta relative">
          {/* Dark mode subtle radial highlight */}
          <div aria-hidden="true" className="hidden dark:block absolute inset-0">
            <div className="absolute -inset-px opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(158,75,138,0.35),transparent_65%)]" />
          </div>

          <div className="p-10 md:p-14">
            <GradientHeading as="h3">Join the Revolution</GradientHeading>
            <p className="mt-4 text-neutral-600 dark:text-white/70">
              Experience AI-powered notes, smart project collaboration, and verified skill testing — all in one platform.
            </p>
            <p className="mt-4 text-neutral-600 dark:text-white/70">
              Be part of the future of learning and innovation. Start today and shape your academic journey with PaperX.
            </p>
            <AppLink
              href="/signup.html"
              className="inline-flex items-center gap-2 mt-6 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white font-semibold px-6 py-3 shadow-[0_4px_18px_-4px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_28px_-6px_rgba(158,75,138,0.8)] hover:scale-105 transition-all duration-200"
            >
              Get Started with PaperX
              <Icon name="arrow_forward" className="text-lg" />
            </AppLink>
          </div>

          <div className="flex items-center justify-center py-6 pr-6 relative">
            <div className="w-[85%] aspect-[16/9] rounded-2xl overflow-hidden shadow-lg">
              <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
                <source src="/assets/video/home.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
