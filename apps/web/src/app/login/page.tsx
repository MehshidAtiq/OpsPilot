import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiLoginForm } from "@/components/auth/api-login-form";
import { USE_API_DATA } from "@/lib/api/config";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-6">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold">OpsPilot</span>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="space-y-4 py-6">
          <div>
            <h1 className="text-base font-semibold">Anmelden</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Mit deiner Geschäfts-E-Mail. SSO via Google ist verfügbar.
            </p>
          </div>

          {USE_API_DATA ? (
            <ApiLoginForm />
          ) : (
            <>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium mb-1">E-Mail</label>
                  <Input type="email" placeholder="anna@sturm-drang.de" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Passwort</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>

              <Link href="/dashboard" className="block">
                <Button variant="primary" className="w-full">
                  <Lock className="h-4 w-4" /> Anmelden
                </Button>
              </Link>
            </>
          )}

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">oder</span>
            </div>
          </div>

          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              Mit Google fortfahren
            </Button>
          </Link>

          <p className="text-center text-[11px] text-muted-foreground">
            Neu bei OpsPilot?{" "}
            <Link href="/onboarding" className="text-primary hover:underline">
              Setup starten
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="success">EU/Frankfurt</Badge>
        <Badge variant="outline">DSGVO-konform</Badge>
      </div>
    </div>
  );
}
