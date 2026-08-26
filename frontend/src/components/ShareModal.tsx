import { useEffect, useRef, useState } from "react";
import { useRevokeShare, useShareDocument, useUsers } from "@/data/documents";
import { toErrorMessage } from "@/services/api";
import { MESSAGES } from "@/constants/messages";
import type { DocumentDetail, SharePermission } from "@/types/document.types";

interface ShareModalProps {
  document: DocumentDetail;
  onClose: () => void;
}

export function ShareModal({ document: doc, onClose }: ShareModalProps) {
  const { data: users = [] } = useUsers();
  const shareDocument = useShareDocument(doc.id);
  const revokeShare = useRevokeShare(doc.id);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permission, setPermission] = useState<SharePermission>("VIEW");
  const [error, setError] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const sharedUserIds = new Set(doc.shares.map((share) => share.shared_with.id));
  const availableUsers = users.filter(
    (user) => user.id !== doc.owner.id && !sharedUserIds.has(user.id),
  );

  const handleShare = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUserId) return;
    setError("");
    try {
      await shareDocument.mutateAsync({ userId: Number(selectedUserId), permission });
      setSelectedUserId("");
    } catch (caught) {
      setError(toErrorMessage(caught, MESSAGES.shareError));
    }
  };

  const handleRevoke = async (shareId: number) => {
    setError("");
    try {
      await revokeShare.mutateAsync(shareId);
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="share-title" className="text-lg font-semibold text-slate-900">
              Share document
            </h2>
            <p className="text-sm text-slate-500">{doc.title}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded px-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleShare} className="mb-4 space-y-3">
          <div>
            <label htmlFor="share-user" className="mb-1 block text-sm font-medium text-slate-700">
              Add a person
            </label>
            <select
              id="share-user"
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select a user…</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.display_name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="share-permission" className="mb-1 block text-sm font-medium text-slate-700">
              Permission
            </label>
            <select
              id="share-permission"
              value={permission}
              onChange={(event) => setPermission(event.target.value as SharePermission)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="VIEW">Can view</option>
              <option value="EDIT">Can edit</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedUserId || shareDocument.isPending}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {shareDocument.isPending ? "Sharing…" : "Share"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-700">People with access</h3>
          <ul className="space-y-2">
            <li className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-800">{doc.owner.display_name}</span>
              <span className="text-slate-500">Owner</span>
            </li>
            {doc.shares.map((share) => (
              <li
                key={share.id}
                className="flex items-center justify-between rounded bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="text-slate-800">{share.shared_with.display_name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">
                    {share.permission === "EDIT" ? "Can edit" : "Can view"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRevoke(share.id)}
                    aria-label={`Remove access for ${share.shared_with.display_name}`}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
