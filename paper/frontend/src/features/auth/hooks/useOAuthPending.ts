"use client";

import { useCallback, useEffect, useState } from "react";
import { readOAuthPendingFlag, setOAuthPendingFlag } from "../lib/session-storage";

/**
 * `sessionStorage.paperx_oauth_pending` while the Google round trip is in
 * flight. While it is set, the page keeps its loading overlay up.
 */
export function useOAuthPending() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is client-only
    setPending(readOAuthPendingFlag());
  }, []);

  const set = useCallback((enabled: boolean) => {
    setOAuthPendingFlag(enabled);
    setPending(enabled);
  }, []);

  return { pending, set };
}
