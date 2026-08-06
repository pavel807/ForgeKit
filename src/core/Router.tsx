/* Лёгкий роутер на основе контекста и History API */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface RouterState {
  current: string;
  navigate: (id: string) => void;
}

const RouterContext = createContext<RouterState>({ current: "dashboard", navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const tool = params.get("tool");
    return tool || "dashboard";
  });

  const navigate = useCallback((id: string) => {
    setCurrent(id);
    window.history.pushState({ tool: id }, "", `?tool=${id}`);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrent(params.get("tool") || "dashboard");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const value = useMemo(() => ({ current, navigate }), [current, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterState {
  return useContext(RouterContext);
}
