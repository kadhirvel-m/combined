import { Icon } from "@/components/ui/Icon";

export const DEFAULT_ACCESS_DENIED = "You do not have permission to view this page.";

/** helpers.js `renderAccessDenied()`: the card shown in place of a collage page's content. */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="col-span-full p-10 text-center space-y-4 rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-soft">
      <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400">
        <Icon name="block" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Access denied</h2>
      <p className="text-sm text-neutral-600 dark:text-white/70 max-w-md mx-auto">{message || DEFAULT_ACCESS_DENIED}</p>
    </div>
  );
}
