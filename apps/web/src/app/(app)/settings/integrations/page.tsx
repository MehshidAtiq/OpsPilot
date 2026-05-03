import { Plug, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/mocks";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const connected = integrations.filter((i) => i.status === "mocked");
  const available = integrations.filter((i) => i.status === "disconnected");

  return (
    <div>
      <PageHeader
        title="Integrationen"
        description="Verbinde Datenquellen — alle laufen read-only ins Modell. Jede Aktion zurück durchläuft Approval."
        actions={
          <Badge variant="success">
            <ShieldCheck className="h-3 w-3" /> EU/Frankfurt
          </Badge>
        }
      />

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Verbunden
      </h2>
      <div className="grid gap-3 mb-8 md:grid-cols-2">
        {connected.map((i) => (
          <IntegrationCardView key={i.kind} integration={i} />
        ))}
      </div>

      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Verfügbar
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {available.map((i) => (
          <IntegrationCardView key={i.kind} integration={i} />
        ))}
      </div>
    </div>
  );
}

function IntegrationCardView({
  integration,
}: {
  integration: (typeof integrations)[number];
}) {
  const isConnected = integration.status === "mocked";
  return (
    <Card className={cn(!isConnected && "opacity-80")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-4 w-4 text-muted-foreground" />
          {integration.label}
        </CardTitle>
        {isConnected ? (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" /> mocked
          </Badge>
        ) : (
          <Badge variant="neutral">
            <XCircle className="h-3 w-3" /> nicht verbunden
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <p className="text-foreground/80">{integration.description}</p>
        {isConnected ? (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {integration.itemCount} Items · seit{" "}
              {integration.connectedAt && formatDate(integration.connectedAt)}
            </span>
            <Button size="sm" variant="outline">
              Konfigurieren
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button size="sm" variant="primary">
              Verbinden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
