"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { LAYOUT_COOKIE } from "@/lib/layout-cookie";

export type LayoutMode = "topnav" | "split";

const Ctx = createContext<{
  mode: LayoutMode;
  setMode: (m: LayoutMode) => void;
}>({ mode: "topnav", setMode: () => {} });

export function LayoutModeProvider({
  initial = "topnav",
  children,
}: {
  initial?: LayoutMode;
  children: ReactNode;
}) {
  // Initial value comes from the server (read from the cookie), so the first
  // client render matches SSR — no layout flash and no hydration mismatch.
  const [mode, setModeState] = useState<LayoutMode>(initial);

  const setMode = useCallback((m: LayoutMode) => {
    setModeState(m);
    // Persist in a cookie so the server renders the right layout next load.
    try {
      document.cookie = `${LAYOUT_COOKIE}=${m}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
  }, []);

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export function useLayoutMode() {
  return useContext(Ctx);
}
