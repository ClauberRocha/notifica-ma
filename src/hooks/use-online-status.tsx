import { useEffect, useState } from "react";

/**
 * Tracks browser online status. Listens to native online/offline events
 * and falls back to a periodic HEAD ping in case the events miss a real drop.
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Defensive ping every 30s: navigator.onLine pode mentir em redes ruins.
    const interval = window.setInterval(async () => {
      try {
        const ctrl = new AbortController();
        const t = window.setTimeout(() => ctrl.abort(), 4000);
        await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-store",
          signal: ctrl.signal,
        });
        window.clearTimeout(t);
        if (!navigator.onLine) return;
        setOnline(true);
      } catch {
        setOnline(false);
      }
    }, 30_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.clearInterval(interval);
    };
  }, []);

  return online;
}
