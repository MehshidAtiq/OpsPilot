"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/lib/api/auth";

type Mode = "login" | "signup";

export function ApiLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      if (mode === "signup") {
        await signup({
          email,
          password,
          name: String(formData.get("name") ?? ""),
          company_name: String(formData.get("company") ?? ""),
        });
      } else {
        await login({ email, password });
      }
      router.push(mode === "signup" ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={submit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">Name</label>
            <Input name="name" required placeholder="Anna Sturm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Company</label>
            <Input
              name="company"
              required
              placeholder="Sturm & Drang Consulting GmbH"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium mb-1">Email</label>
          <Input
            name="email"
            type="email"
            required
            placeholder="anna@sturm-drang.de"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Password</label>
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <Button variant="primary" className="w-full" disabled={loading}>
        {mode === "signup" ? (
          <UserPlus className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {loading
          ? "Working..."
          : mode === "signup"
            ? "Create account"
            : "Sign in"}
      </Button>

      <button
        type="button"
        className="w-full text-center text-[11px] text-primary hover:underline"
        onClick={() => setMode((current) => (current === "login" ? "signup" : "login"))}
      >
        {mode === "login"
          ? "Need an account? Create one"
          : "Already have an account? Sign in"}
      </button>
    </form>
  );
}

