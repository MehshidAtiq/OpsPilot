import type { Task } from "@/types/models";
import { apiFetch } from "./http";

type ApiTask = {
  id: string;
  title: string;
  description?: string | null;
  owner_user_id?: string | null;
  due_date?: string | null;
  priority: Task["priority"];
  status: Task["status"];
  client_id?: string | null;
  project_id?: string | null;
  source_type?: Task["sourceType"] | null;
  source_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskCreateInput = {
  title: string;
  description?: string;
  due_date?: string;
  priority: Task["priority"];
  status: Task["status"];
};

export function mapApiTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    ownerId: task.owner_user_id ?? undefined,
    dueDate: task.due_date ?? undefined,
    priority: task.priority,
    status: task.status,
    clientId: task.client_id ?? undefined,
    sourceType: task.source_type ?? undefined,
    sourceId: task.source_id ?? undefined,
    createdAt: task.created_at,
  };
}

export async function listTasks() {
  const tasks = await apiFetch<ApiTask[]>("/tasks");
  return tasks.map(mapApiTask);
}

export async function createTask(payload: TaskCreateInput) {
  const task = await apiFetch<ApiTask>("/tasks", {
    method: "POST",
    body: payload,
  });
  return mapApiTask(task);
}

export async function updateTask(id: string, payload: Partial<TaskCreateInput>) {
  const task = await apiFetch<ApiTask>(`/tasks/${id}`, {
    method: "PATCH",
    body: payload,
  });
  return mapApiTask(task);
}
