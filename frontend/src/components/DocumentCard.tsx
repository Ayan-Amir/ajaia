import { Link } from "react-router-dom";
import { toDocumentPath } from "@/routes/routePaths";
import type { DocumentSummary } from "@/types/document.types";

interface DocumentCardProps {
  document: DocumentSummary;
  onDelete?: (document: DocumentSummary) => void;
}

const ROLE_LABELS: Record<DocumentSummary["role"], string> = {
  OWNER: "Owner",
  EDITOR: "Can edit",
  VIEWER: "View only",
};

export function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const handleDelete = () => onDelete?.(doc);

  return (
    <li className="flex items-center justify-between rounded border border-slate-200 bg-white px-4 py-3 transition hover:border-blue-400">
      <div className="min-w-0">
        <Link
          to={toDocumentPath(doc.id)}
          className="block truncate font-medium text-slate-900 hover:underline"
        >
          {doc.title}
        </Link>
        <p className="mt-0.5 text-xs text-slate-500">
          {doc.role === "OWNER" ? "You" : doc.owner.display_name} ·{" "}
          {new Date(doc.modified).toLocaleDateString()}
        </p>
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          {ROLE_LABELS[doc.role]}
        </span>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete ${doc.title}`}
            className="text-xs text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
