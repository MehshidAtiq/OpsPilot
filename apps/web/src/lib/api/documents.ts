import type { Document } from "@/types/models";
import { apiFetch } from "./http";

type ApiDocument = {
  id: string;
  title: string;
  source: Document["source"];
  storage_key: string;
  mime: Document["mime"] | string;
  size_bytes: number;
  status: Document["status"];
  created_at: string;
  updated_at: string;
  uploader_id?: string;
};

export function mapApiDocument(document: ApiDocument): Document {
  return {
    id: document.id,
    title: document.title,
    source: document.source,
    mime: document.mime as Document["mime"],
    sizeBytes: document.size_bytes,
    status: document.status,
    uploadedAt: document.created_at,
    uploaderId: document.uploader_id ?? "",
  };
}

export async function listDocuments() {
  const documents = await apiFetch<ApiDocument[]>("/documents");
  return documents.map(mapApiDocument);
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.set("file", file);
  const document = await apiFetch<ApiDocument>("/documents", {
    method: "POST",
    formData,
  });
  return mapApiDocument(document);
}

