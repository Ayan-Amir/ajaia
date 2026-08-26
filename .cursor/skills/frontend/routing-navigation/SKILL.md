---
name: routing-navigation
description: Use when creating, updating, reviewing, or refactoring React Router 7 routing, route constants, nested layouts, route guards, redirects, navigation helpers, lazy route loading, and route-level access control in React + TypeScript apps. Do NOT use for auth context implementation, domain role modeling, React Query data fetching, form validation, UI component design, or file-based framework routing. NOT for auth state implementation, token storage, or session persistence — use authentication-session-management. NOT for page metadata, canonical tags, or Open Graph tags tied to routes — use seo-and-metadata.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

# Routing Navigation

## Stack Context

- Framework: React + TypeScript
- Router: React Router 7
- Routing mode: data router mode
- Router setup: `createBrowserRouter` + `RouterProvider`
- Route config location: `src/app/router/routeConfig.tsx`
- Route constants location: `src/app/router/routePaths.ts`
- Route helpers location: `src/app/router/routeHelpers.ts`
- Guards location: `src/app/router/guards/`
- Layouts location: `src/app/router/layouts/`
- Loader helpers location: `src/app/router/loaders/`
- Page routes location: `src/pages/`

## When To Use

- Creating or refactoring React Router route trees
- Adding route constants or dynamic route helpers
- Creating nested layouts with `Outlet`
- Adding protected, guest-only, or role-protected routes
- Adding loader-based redirects or route-level access checks
- Reviewing redirects, 404 routes, forbidden routes, or unauthorized flows
- Creating shared navigation helpers around `Link`, `NavLink`, or `useNavigate`

## Do Not Use

- Auth context, session provider, or auth state implementation
- Domain-level role modeling or permission policy design
- React Query, TanStack Query, or API data-fetching patterns
- Form validation, form actions, or React Hook Form conventions
- UI loading component design or design-system component architecture
- Next.js, Remix, TanStack Router, or file-based routing systems
- Page metadata, canonical tags, or Open Graph tags tied to routes — use `seo-and-metadata`

## Folder Structure

```txt
src/
  app/
    router/
      index.tsx
      routeConfig.tsx
      routePaths.ts
      routeHelpers.ts
      guards/
        AuthGuard.tsx
        GuestGuard.tsx
        RoleGuard.tsx
        # Guard components read auth state via useAuth() from authentication-session-management — they do not implement auth logic directly.
      layouts/
        RootLayout.tsx
        AppLayout.tsx
        AuthLayout.tsx
      loaders/
        requireAuth.ts
        requireRole.ts
  pages/
    login/
      LoginPage.tsx
    dashboard/
      DashboardPage.tsx
    forbidden/
      ForbiddenPage.tsx
    unauthorized/
      UnauthorizedPage.tsx
    notFound/
      NotFoundPage.tsx
```

## How To Apply

1. Identify whether the task affects route structure, guards, loaders, redirects, or navigation helpers.
2. Read only the relevant reference file listed below.
3. Keep route paths centralized in `routePaths.ts`.
4. Keep dynamic paths centralized in `routeHelpers.ts`.
5. Keep route configuration declarative and grouped by layout or access type.
6. Keep access control at the route level, not only in hidden UI.
7. Run the project’s existing lint, typecheck, and test commands after changes.

## References

- For route constants, dynamic helpers, router setup, layouts, lazy loading, basename, and not-found routes → read `references/route-patterns.md`
- For auth guards, guest guards, role guards, forbidden handling, and unauthorized handling → read `references/guards-and-access.md`
- For loader auth checks, loader role checks, redirects, and post-login redirects → read `references/loaders-and-redirects.md`
- For `Link`, `NavLink`, `useNavigate`, active links, and navigation helper hooks → read `references/navigation-helpers.md`
- For complete route configuration examples → read `references/examples.md`
- For PR review checks, human verification checks, and anti-patterns → read `references/review-checklist.md`

## Scripts

- No bundled scripts for this skill.
- Run the project’s existing lint, typecheck, and test commands after routing changes.
- Execute project scripts directly; do not copy command details into this skill unless the project standardizes them.

## Pipeline

- Depends on: auth/session source of truth, type definitions for user roles, shared loading UI, app layout components
- Coordinates with: auth state management, type-definitions, hooks best practices, UI states, error boundaries
- Feeds into: protected page flows, app navigation, route-level error handling, analytics, breadcrumbs, and feature-gated routes

## Human Check

- Verify protected routes do not flash restricted content.
- Verify unauthenticated users are redirected correctly.
- Verify authenticated-but-forbidden users land on the forbidden flow.
- Verify post-login redirects preserve intended destinations when required.
- Verify browser back-button behavior after redirects.
- Verify unknown routes render the Not Found page.
- Verify layout nesting renders the expected shared chrome.
- Verify basename behavior if the app is deployed under a subpath.
- Verify loading and error states are accessible and product-appropriate.