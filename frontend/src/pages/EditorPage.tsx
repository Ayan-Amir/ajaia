import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "@/components/EditorToolbar";
import { ShareModal } from "@/components/ShareModal";
import { useDocument, useUpdateDocument } from "@/data/documents";
import { toErrorMessage } from "@/services/api";
import { AUTOSAVE_DELAY_MS, MESSAGES } from "@/constants/messages";
import { routePaths } from "@/routes/routePaths";
import type { SaveStatus } from "@/types/document.types";

interface DocumentPatch {
  title?: string;
  content?: string;
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "All changes saved",
  error: MESSAGES.saveError,
};

export function EditorPage() {
  const { id } = useParams();
  const documentId = Number(id);
  const navigate = useNavigate();

  const { data: doc, isLoading, isError, error: loadError } = useDocument(documentId);
  const updateDocument = useUpdateDocument(documentId);

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<DocumentPatch>({});
  const hasLoadedRef = useRef(false);

  const canEdit = doc?.role === "OWNER" || doc?.role === "EDITOR";
  const isOwner = doc?.role === "OWNER";

  // Tiptap captures onUpdate once, so the save path is reached through refs
  // to avoid holding the first render's mutation and role forever.
  const mutateRef = useRef(updateDocument.mutateAsync);
  mutateRef.current = updateDocument.mutateAsync;
  const canEditRef = useRef(false);
  canEditRef.current = Boolean(canEdit);

  const flushSave = useCallback(async () => {
    const payload = pendingRef.current;
    pendingRef.current = {};
    if (Object.keys(payload).length === 0) return;

    setSaveStatus("saving");
    try {
      await mutateRef.current(payload);
      setSaveStatus("saved");
    } catch {
      // Keep the failed edits queued so the next change retries them.
      pendingRef.current = { ...payload, ...pendingRef.current };
      setSaveStatus("error");
    }
  }, []);

  // Edits merge rather than replace: a title change followed by a content
  // change must not drop the title.
  const scheduleSave = useCallback(
    (patch: DocumentPatch) => {
      // Viewers must never attempt a write the server would only reject.
      if (!canEditRef.current) return;
      pendingRef.current = { ...pendingRef.current, ...patch };
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY_MS);
    },
    [flushSave],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[60vh] px-6 py-5 focus:outline-none",
        "aria-label": "Document content",
      },
    },
    onUpdate: ({ editor: instance }) => scheduleSave({ content: instance.getHTML() }),
  });

  // Seed the editor once the document arrives; emitUpdate:false keeps the
  // initial load from tripping the autosave.
  useEffect(() => {
    if (!doc || !editor || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    setTitle(doc.title);
    editor.commands.setContent(doc.content || "", { emitUpdate: false });
  }, [doc, editor]);

  useEffect(() => {
    editor?.setEditable(Boolean(canEdit));
  }, [editor, canEdit]);

  // Leaving the page must not discard an in-flight debounce.
  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      void flushSave();
    },
    [flushSave],
  );

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    if (/\S/.test(nextTitle)) {
      scheduleSave({ title: nextTitle });
    }
  };

  const handleOpenShare = () => setIsShareOpen(true);
  const handleCloseShare = () => setIsShareOpen(false);

  if (isLoading) {
    return <p className="p-8 text-sm text-slate-500">Loading document…</p>;
  }

  if (isError || !doc) {
    // A 404 here means "not yours", not "missing" — the queryset hides
    // documents the user has no access to.
    const status = axios.isAxiosError(loadError) ? loadError.response?.status : undefined;
    const message =
      status === 404 || status === 403
        ? MESSAGES.noAccess
        : toErrorMessage(loadError, MESSAGES.loadDocumentError);
    return (
      <main className="p-8">
        <p role="alert" className="mb-4 text-sm text-red-700">
          {message}
        </p>
        <Link to={routePaths.dashboard} className="text-sm text-blue-600 hover:underline">
          ← Back to documents
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(routePaths.dashboard)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Documents
          </button>

          <label className="sr-only" htmlFor="document-title">
            Document title
          </label>
          <input
            id="document-title"
            value={title}
            onChange={handleTitleChange}
            disabled={!canEdit}
            className="min-w-0 flex-1 rounded border border-transparent px-2 py-1 font-medium text-slate-900 hover:border-slate-300 focus:border-blue-500 focus:outline-none disabled:hover:border-transparent"
          />

          <span aria-live="polite" className="text-xs text-slate-500">
            {SAVE_LABELS[saveStatus]}
          </span>

          {!canEdit && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">
              View only
            </span>
          )}

          {isOwner && (
            <button
              type="button"
              onClick={handleOpenShare}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Share
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {editor && <EditorToolbar editor={editor} disabled={!canEdit} />}
          <EditorContent editor={editor} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Owned by {doc.owner.display_name}
          {doc.shares.length > 0 && ` · shared with ${doc.shares.length}`}
        </p>
      </main>

      {isShareOpen && <ShareModal document={doc} onClose={handleCloseShare} />}
    </div>
  );
}
