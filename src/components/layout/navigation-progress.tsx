"use client";

import {
  Suspense,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NavigationContext = createContext(false);

export function useNavigationPending() {
  return useContext(NavigationContext);
}

function isInternalAppNavigation(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const anchor = target.closest("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }
  if (anchor.dataset.noNavigationProgress !== undefined) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) return false;

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    const current = new URL(window.location.href);
    return (
      url.pathname !== current.pathname || url.search !== current.search
    );
  } catch {
    return false;
  }
}

function NavigationProgressBar({ active }: { active: boolean }) {
  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150",
        active ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "h-full w-2/5 bg-foreground/90 shadow-[0_0_8px_rgba(0,0,0,0.15)]",
          active && "navigation-progress-indeterminate"
        )}
      />
    </div>
  );
}

function NavigationRouteSync({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onComplete();
  }, [pathname, searchParams, onComplete]);

  return null;
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(false);
  const completeNavigation = useCallback(() => setPending(false), []);

  useEffect(() => {
    const start = () => setPending(true);

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (isInternalAppNavigation(event.target)) start();
    };

    const onPopState = () => start();

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <NavigationContext.Provider value={pending}>
      <Suspense fallback={null}>
        <NavigationRouteSync onComplete={completeNavigation} />
      </Suspense>
      <NavigationProgressBar active={pending} />
      {children}
    </NavigationContext.Provider>
  );
}

export function NavigationMain({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pending = useNavigationPending();
  return (
    <div
      className={cn(
        "relative transition-opacity duration-200",
        pending && "pointer-events-none opacity-[0.72]",
        className
      )}
      aria-busy={pending}
    >
      {children}
    </div>
  );
}
