export const routePaths = {
  login: "/login",
  dashboard: "/",
  document: "/documents/:id",
} as const;

export const toDocumentPath = (id: number) => `/documents/${id}`;
