import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentCard } from "@/components/DocumentCard";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocuments,
  useImportDocument,
} from "@/data/documents";
import { useAuth } from "@/hooks/useAuth";
import { toErrorMessage } from "@/services/api";
import {
  IMPORT_ACCEPT_ATTRIBUTE,
  MESSAGES,
  SUPPORTED_IMPORT_EXTENSIONS,
  type SupportedExtension,
} from "@/constants/messages";
import { toDocumentPath } from "@/routes/routePaths";
import type { DocumentSummary } from "@/types/document.types";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: documents, isLoading, isError } = useDocuments();
  const createDocument = useCreateDocument();
  const importDocument = useImportDocument();
  const deleteDocument = useDeleteDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const owned = documents?.filter((doc) => doc.role === "OWNER") ?? [];
  const shared = documents?.filter((doc) => doc.role !== "OWNER") ?? [];

  const handleCreate = async () => {
    setError("");
    try {
      const created = await createDocument.mutateAsync();
      navigate(toDocumentPath(created.id));
    } catch (caught) {
      setError(toErrorMessage(caught, MESSAGES.createError));
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!SUPPORTED_IMPORT_EXTENSIONS.includes(extension as SupportedExtension)) {
      setError(MESSAGES.importUnsupported);
      return;
    }

    try {
      const created = await importDocument.mutateAsync(file);
      navigate(toDocumentPath(created.id));
    } catch (caught) {
      setError(toErrorMessage(caught, MESSAGES.importError));
    }
  };

  const handleDelete = async (doc: DocumentSummary) => {
    if (!window.confirm(MESSAGES.deleteConfirm)) return;
    setError("");
    try {
      await deleteDocument.mutateAsync(doc.id);
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="font-semibold text-slate-900">Ajaia Docs</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user?.display_name}</span>
            <button type="button" onClick={logout} className="text-blue-600 hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={createDocument.isPending}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createDocument.isPending ? "Creating…" : "New document"}
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            disabled={importDocument.isPending}
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {importDocument.isPending ? "Importing…" : "Import file"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMPORT_ACCEPT_ATTRIBUTE}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
          <p className="w-full text-xs text-slate-500">
            Import supports .txt, .md and .docx files only (max 1MB).
          </p>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {isLoading && <p className="text-sm text-slate-500">Loading documents…</p>}
        {isError && (
          <p role="alert" className="text-sm text-red-700">
            {MESSAGES.loadDocumentsError}
          </p>
        )}

        {documents && (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                My documents
              </h2>
              {owned.length === 0 ? (
                <p className="text-sm text-slate-500">{MESSAGES.emptyOwned}</p>
              ) : (
                <ul className="space-y-2">
                  {owned.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
                Shared with me
              </h2>
              {shared.length === 0 ? (
                <p className="text-sm text-slate-500">{MESSAGES.emptyShared}</p>
              ) : (
                <ul className="space-y-2">
                  {shared.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
