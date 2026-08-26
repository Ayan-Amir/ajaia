import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUsers } from "@/data/documents";
import { useAuth } from "@/hooks/useAuth";
import { toErrorMessage } from "@/services/api";
import { routePaths } from "@/routes/routePaths";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { data: users, isLoading, isError } = useUsers();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);

  if (isAuthenticated) {
    return <Navigate to={routePaths.dashboard} replace />;
  }

  const handleLogin = async (userId: number) => {
    setError("");
    setPendingId(userId);
    try {
      await login(userId);
      navigate(routePaths.dashboard, { replace: true });
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Ajaia Docs</h1>
        <p className="mt-1 mb-5 text-sm text-slate-500">
          Demo sign-in — pick a seeded account to continue. No password required.
        </p>

        {isLoading && <p className="text-sm text-slate-500">Loading accounts…</p>}
        {isError && (
          <p role="alert" className="text-sm text-red-700">
            Could not reach the server. Is the backend running?
          </p>
        )}

        <ul className="space-y-2">
          {users?.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handleLogin(user.id)}
                disabled={pendingId !== null}
                className="w-full rounded border border-slate-200 px-4 py-3 text-left text-sm hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
              >
                <span className="block font-medium text-slate-900">{user.display_name}</span>
                <span className="block text-xs text-slate-500">@{user.username}</span>
              </button>
            </li>
          ))}
        </ul>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
