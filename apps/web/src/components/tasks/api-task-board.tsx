"use client";

import { useEffect, useMemo, useState } from "react";
import { Kanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createTask, listTasks, updateTask } from "@/lib/api/tasks";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/models";

const COLUMNS: {
  status: Task["status"];
  labelKey:
    | "tasks.column.proposed"
    | "tasks.column.approved"
    | "tasks.column.inProgress"
    | "tasks.column.done";
  tone: string;
}[] = [
  { status: "proposed", labelKey: "tasks.column.proposed", tone: "border-amber-300" },
  { status: "approved", labelKey: "tasks.column.approved", tone: "border-blue-300" },
  { status: "in_progress", labelKey: "tasks.column.inProgress", tone: "border-violet-300" },
  { status: "done", labelKey: "tasks.column.done", tone: "border-emerald-300" },
];

export function ApiTaskBoard() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const byStatus = useMemo(() => {
    return COLUMNS.map((column) => ({
      ...column,
      items: tasks.filter((task) => task.status === column.status),
    }));
  }, [tasks]);

  async function addTask() {
    if (!title.trim()) return;
    setError(null);
    try {
      const task = await createTask({
        title: title.trim(),
        priority: "med",
        status: "proposed",
      });
      setTasks((current) => [task, ...current]);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    }
  }

  async function moveTask(task: Task, status: Task["status"]) {
    const previous = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status } : item)),
    );
    try {
      const updated = await updateTask(task.id, { status });
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setTasks(previous);
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-3 sm:flex-row">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="New task title"
        />
        <Button variant="primary" onClick={addTask}>
          <Plus className="h-4 w-4" /> {t("tasks.add")}
        </Button>
      </div>
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          Loading tasks...
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {byStatus.map((column) => (
          <div
            key={column.status}
            className={cn("rounded-lg border-t-2 bg-muted/40 px-2 pt-2 pb-3", column.tone)}
          >
            <div className="flex items-center justify-between px-2 py-1.5 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <Kanban className="h-3.5 w-3.5 text-muted-foreground" />
                {t(column.labelKey)}
              </span>
              <Badge variant="outline">{column.items.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {column.items.map((task) => (
                <Card key={task.id} className="hover:border-primary/30">
                  <CardContent className="space-y-2 py-3 px-3">
                    <div className="text-xs font-medium leading-tight">
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "med"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="primary">
                          {t("common.due")} {task.dueDate}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {COLUMNS.filter((next) => next.status !== task.status).map(
                        (next) => (
                          <Button
                            key={next.status}
                            size="sm"
                            variant="outline"
                            onClick={() => moveTask(task, next.status)}
                          >
                            {t(next.labelKey)}
                          </Button>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

