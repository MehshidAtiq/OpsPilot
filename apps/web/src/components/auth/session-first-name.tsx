"use client";

import { useSession } from "@/lib/auth/session-provider";

export function SessionFirstName({ fallback }: { fallback: string }) {
  const { session } = useSession();
  const name = session?.user.name ?? fallback;

  return <>{name.split(" ")[0]}</>;
}
