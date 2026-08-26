import type { User } from "@/types/auth.types";

export type DocumentRole = "OWNER" | "EDITOR" | "VIEWER";
export type SharePermission = "VIEW" | "EDIT";

export interface DocumentShare {
  id: number;
  shared_with: User;
  permission: SharePermission;
  created: string;
}

export interface DocumentSummary {
  id: number;
  title: string;
  owner: User;
  role: DocumentRole;
  created: string;
  modified: string;
}

export interface DocumentDetail extends DocumentSummary {
  content: string;
  shares: DocumentShare[];
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";
