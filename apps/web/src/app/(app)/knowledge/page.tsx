"use client";

import { useEffect, useRef, useState } from "react";
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
import { USE_API_DATA } from "@/lib/api/config";
import { listDocuments, uploadDocument } from "@/lib/api/documents";
import { useI18n } from "@/lib/i18n/provider";
import { documents, userById } from "@/lib/mocks";
import { formatDate, cn } from "@/lib/utils";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function KnowledgePage() {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(documents);
  const [loading, setLoading] = useState(USE_API_DATA);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filtered = items.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.summary?.toLowerCase().includes(query.toLowerCase()),
  );
  const indexed = items.filter((d) => d.status === "indexed").length;

  useEffect(() => {
    if (!USE_API_DATA) return;
    let active = true;
    listDocuments()
      .then((docs) => {
        if (active) setItems(docs);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load documents");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const uploaded = await uploadDocument(file);
      setItems((current) => [uploaded, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div>
      <PageHeader
        title={t("knowledge.title")}
        description={t("knowledge.description")}
        actions={
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            {indexed} / {items.length} {t("knowledge.indexedCount")}
          </span>
        }
      />

      {/* Upload zone */}
      <div className="mb-4 rounded-lg border-2 border-dashed border-border bg-card p-6 text-center hover:border-primary/40 transition-colors">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-medium">{t("knowledge.uploadTitle")}</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          {t("knowledge.uploadDescription")}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => handleUpload(event.target.files?.[0])}
        />
        <Button
          variant="primary"
          size="sm"
          className="mt-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" /> {t("knowledge.chooseFile")}
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-3 rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          Loading documents...
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("knowledge.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
        {query && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {filtered.length} {t("knowledge.hits")}
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
                        {t("knowledge.indexedCount")} · {d.chunkCount}{" "}
                        {t("knowledge.chunks")}
                      </Badge>
                    ) : d.status === "pending" ? (
                      <Badge variant="warning">
                        <Clock className="h-3 w-3" />
                        {t("knowledge.processing")}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">{t("knowledge.failed")}</Badge>
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
                    <span>
                      {t("common.uploaded")} {formatDate(d.uploadedAt, locale)}
                    </span>
                    <span>·</span>
                    <span>
                      {t("common.by")} {uploader?.name ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
              {t("knowledge.noDocs")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
