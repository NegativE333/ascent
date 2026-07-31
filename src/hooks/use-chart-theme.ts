"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

function readVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState({
    grid: "#efefee",
    tick: "#787774",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e3e2e0",
    tooltipText: "#37352f",
    primary: "#5b6ee1",
  });

  useEffect(() => {
    setColors({
      grid: readVar("--track", "#efefee"),
      tick: readVar("--muted-foreground", "#787774"),
      tooltipBg: readVar("--popover", "#ffffff"),
      tooltipBorder: readVar("--border", "#e3e2e0"),
      tooltipText: readVar("--popover-foreground", "#37352f"),
      primary: readVar("--primary", "#5b6ee1"),
    });
  }, [resolvedTheme]);

  return colors;
}
