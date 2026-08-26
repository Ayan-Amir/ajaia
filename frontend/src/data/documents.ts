import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import type {
  DocumentDetail,
  DocumentShare,
  DocumentSummary,
  SharePermission,
} from "@/types/document.types";
import type { User } from "@/types/auth.types";

// "list" and "detail" are separate segments on purpose: a bare ["documents"]
// key would prefix-match the detail key, so saving would refetch and clobber
// the document currently being typed into.
export const queryKeys = {
  documents: ["documents", "list"] as const,
  document: (id: number) => ["documents", "detail", id] as const,
  users: ["users"] as const,
};

export function useDocuments() {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: async () => (await api.get<DocumentSummary[]>("/documents/")).data,
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: queryKeys.document(id),
    queryFn: async () => (await api.get<DocumentDetail>(`/documents/${id}/`)).data,
    enabled: Number.isFinite(id),
    retry: false,
    // The editor owns the content once loaded; background refetches must not
    // overwrite unsaved keystrokes.
    staleTime: Infinity,
    refetchOnMount: false,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => (await api.get<User[]>("/auth/users/")).data,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<DocumentDetail>("/documents/", {})).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

export function useImportDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post<DocumentDetail>("/documents/import/", formData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

interface UpdateDocumentInput {
  title?: string;
  content?: string;
}

export function useUpdateDocument(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateDocumentInput) =>
      (await api.patch<DocumentDetail>(`/documents/${id}/`, input)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.document(id), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.documents });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/documents/${id}/`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.documents }),
  });
}

export function useShareDocument(documentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: number; permission: SharePermission }) => {
      const { data } = await api.post<DocumentShare>(`/documents/${documentId}/shares/`, {
        user_id: input.userId,
        permission: input.permission,
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.document(documentId) }),
  });
}

export function useRevokeShare(documentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shareId: number) => {
      await api.delete(`/documents/${documentId}/shares/${shareId}/`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.document(documentId) }),
  });
}
