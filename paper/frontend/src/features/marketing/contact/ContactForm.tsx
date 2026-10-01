"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

const field =
  "rounded-2xl border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:border-brandlt-400 focus:ring-brandlt-200";
const label = "grid gap-2 text-sm font-medium text-neutral-700 dark:text-white/80";

const INTENTS = [
  { value: "support", label: "Support", icon: "support_agent" },
  { value: "demo", label: "Demo", icon: "movie_edit" },
  { value: "partnership", label: "Partnership", icon: "diversity_3" },
  { value: "other", label: "Other", icon: "psychology" },
];

/**
 * Contact form. The original form had no submit handler and no backend
 * endpoint (it posted to "#"); it still isn't connected, so submitting only
 * tells the visitor how to actually reach the team.
 */
export function ContactForm() {
  const { toast } = useToast();
  const [intent, setIntent] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast("This form isn't connected yet. Please use the helpline or email on this page.", { tone: "warning", duration: 5000 });
  };

  return (
    <form className="relative grid gap-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <label className={label}>
          Full name
          <input type="text" name="name" required placeholder="Aarav Shah" className={field} />
        </label>
        <label className={label}>
          Email address
          <input type="email" name="email" required placeholder="you@college.edu" className={field} />
        </label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <label className={label}>
          Phone / WhatsApp
          <input type="tel" name="phone" placeholder="+91 90000 00000" className={field} />
        </label>
        <div className={label}>
          What do you need?
          <div className="grid grid-cols-2 gap-2">
            {INTENTS.map((i) => (
              <label
                key={i.value}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-white/70 hover:border-brandlt-300"
              >
                <input
                  type="radio"
                  name="intent"
                  value={i.value}
                  className="hidden"
                  checked={intent === i.value}
                  onChange={() => setIntent(i.value)}
                />
                <Icon name={i.icon} className="text-sm" />
                {i.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <label className="grid gap-2 text-sm font-medium text-neutral-700">
        Institute / organisation
        <input type="text" name="org" placeholder="Anna University, CSE Dept" className={field} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-neutral-700">
        Message
        <textarea
          name="message"
          rows={5}
          required
          className={field}
          placeholder="Share timelines, syllabus link, or topics you want to explore"
        />
      </label>
      <label className="inline-flex items-center gap-3 text-xs text-neutral-600">
        <input type="checkbox" name="newsletter" className="rounded border border-black/10 dark:border-white/15" />
        Keep me updated about exam drops, beta releases, and campus tours.
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold hover:shadow-glow transition"
      >
        <Icon name="send" className="text-base" />
        Send message
      </button>
    </form>
  );
}
