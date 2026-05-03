import { Kanban, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiTaskBoard } from "@/components/tasks/api-task-board";
import { USE_API_DATA } from "@/lib/api/config";
import { getServerI18n } from "@/lib/i18n/server";
import { clientById, tasks, userById } from "@/lib/mocks";
import type { Task } from "@/types/models";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n/translations";

const COLUMNS: {
  status: Task["status"];
  label: TranslationKey;
  tone: string;
}[] = [
  { status: "proposed", label: "tasks.column.proposed", tone: "border-amber-300" },
  { status: "approved", label: "tasks.column.approved", tone: "border-blue-300" },
  { status: "in_progress", label: "tasks.column.inProgress", tone: "border-violet-300" },
  { status: "done", label: "tasks.column.done", tone: "border-emerald-300" },
];

export default async function TasksPage() {
  const { t: translate } = await getServerI18n();

  return (
    <div>
      <PageHeader
        title={translate("tasks.title")}
        description={translate("tasks.description")}
        actions={
          <Button variant="primary">
            <Plus className="h-4 w-4" /> {translate("tasks.add")}
          </Button>
        }
      />

      {USE_API_DATA ? (
        <ApiTaskBoard />
      ) : (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.status);
          return (
            <div
              key={col.status}
              className={cn("rounded-lg border-t-2 bg-muted/40 px-2 pt-2 pb-3", col.tone)}
            >
              <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1">
                  <Kanban className="h-3.5 w-3.5 text-muted-foreground" />
                  {translate(col.label)}
                </span>
                <Badge variant="outline">{items.length}</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((t) => {
                  const client = t.clientId ? clientById(t.clientId) : null;
                  const owner = t.ownerId ? userById(t.ownerId) : null;
                  return (
                    <Card key={t.id} className="hover:border-primary/30 cursor-pointer">
                      <CardContent className="space-y-2 py-3 px-3">
                        <div className="text-xs font-medium leading-tight">
                          {t.title}
                        </div>
                        {t.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {t.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <Badge
                            variant={
                              t.priority === "high"
                                ? "destructive"
                                : t.priority === "med"
                                  ? "warning"
                                  : "neutral"
                            }
                          >
                            {t.priority}
                          </Badge>
                          {client && (
                            <Badge variant="outline">{client.name}</Badge>
                          )}
                          {t.dueDate && (
                            <Badge variant="primary">
                              {translate("common.due")} {t.dueDate}
                            </Badge>
                          )}
                          {owner && (
                            <Badge variant="neutral">
                              {owner.name.split(" ")[0]}
                            </Badge>
                          )}
                          {t.sourceType && t.sourceType !== "manual" && (
                            <Badge variant="info">
                              {translate("common.from")} {t.sourceType}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
