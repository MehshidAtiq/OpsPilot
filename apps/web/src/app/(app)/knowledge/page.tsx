"use client";

import { useState } from "react";
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documents, userById } from "@/lib/mocks";
import { formatDate, cn } from "@/lib/utils";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.summary?.toLowerCase().includes(query.toLowerCase()),
  );
  const indexed = documents.filter((d) => d.status === "indexed").length;

  return (
    <div>
      <PageHeader
        title="Knowledge base"
        description="Unternehmensdokumente — Service-Beschreibungen, Vorlagen, Notizen. Werden gechunkt und für RAG indexiert."
        actions={
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            {indexed} von {documents.length} indexiert
          </span>
        }
      />

      {/* Upload zone */}
      <div className="mb-4 rounded-lg border-2 border-dashed border-border bg-card p-6 text-center hover:border-primary/40 transition-colors">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-medium">Dokumente hochladen</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          PDF, DOCX, Markdown oder Plain-Text. Werden automatisch gechunkt
          (~800 Token), eingebettet (text-embedding-3-small) und in pgvector
          gespeichert.
        </p>
        <Button variant="primary" size="sm" className="mt-3">
          <Upload className="h-4 w-4" /> Datei auswählen
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Semantische Suche … z. B. „Phasenmodell Cloud-Migration“"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
        {query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {filtered.length} Treffer
          </span>
        )}
      </div>

      {/* Document list */}
      <Card>
        <CardContent className="-mx-2 -my-1 divide-y divide-border">
          {filtered.map((d) => {
            const uploader = userById(d.uploaderId);
            return (
              <div
                key={d.id}
                className="flex items-start gap-3 px-3 py-3 hover:bg-muted/40 rounded-md cursor-pointer"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
                    d.status === "indexed"
                      ? "bg-accent border-blue-200 text-primary"
                      : "bg-muted border-border text-muted-foreground",
                  )}
                >
                  <FileText className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {d.title}
                    </span>
                    {d.status === "indexed" ? (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3" />
                        indexiert · {d.chunkCount} chunks
                      </Badge>
                    ) : d.status === "pending" ? (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3" />
                        wird verarbeitet
                      </Badge>
                    ) : (
                      <Badge variant="destructive">fehlgeschlagen</Badge>
                    )}
                  </div>
                  {d.summary && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      <Sparkles className="inline h-3 w-3 mr-0.5 -mt-0.5 text-primary/70" />
                      {d.summary}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{formatBytes(d.sizeBytes)}</span>
                    <span>·</span>
                    <span>hochgeladen {formatDate(d.uploadedAt)}</span>
                    <span>·</span>
                    <span>von {uploader?.name ?? "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              Keine Dokumente passen zur Suche.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
