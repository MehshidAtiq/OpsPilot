"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  getSession,
  logout,
  type AuthSession,
} from "@/lib/api/auth";
import { USE_API_DATA } from "@/lib/api/config";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type SessionContextValue = {
  session: AuthSession | null;
  status: SessionStatus;
  refreshSession: () => Promise<void>;
  signOut: (redirectTo?: string) => Promise<void>;
  changeAccount: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>(
    USE_API_DATA ? "loading" : "authenticated",
  );
  const [explicitRedirect, setExplicitRedirect] = useState(false);

  const refreshSession = useCallback(async () => {
    if (!USE_API_DATA) {
      setStatus("authenticated");
      return;
    }

    try {
      const nextSession = await getSession();
      setSession(nextSession);
      setStatus("authenticated");
    } catch {
      setSession(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    if (!USE_API_DATA) {
      return;
    }

    let cancelled = false;
    getSession()
      .then((nextSession) => {
        if (cancelled) return;
        setSession(nextSession);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
        setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (USE_API_DATA && status === "unauthenticated" && !explicitRedirect) {
      router.replace("/login");
    }
  }, [explicitRedirect, router, status]);

  const signOut = useCallback(
    async (redirectTo = "/login") => {
      setExplicitRedirect(true);
      setStatus("loading");
      if (USE_API_DATA) {
        await logout().catch(() => undefined);
      }
      setSession(null);
      setStatus("unauthenticated");
      router.replace(redirectTo);
      router.refresh();
    },
    [router],
  );

  const changeAccount = useCallback(async () => {
    await signOut("/login?mode=login&switch=1");
  }, [signOut]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      status,
      refreshSession,
      signOut,
      changeAccount,
    }),
    [changeAccount, refreshSession, session, signOut, status],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return context;
}
