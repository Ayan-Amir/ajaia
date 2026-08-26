# Troubleshooting

## `useAuth` throws immediately

- Ensure `AuthProvider` wraps the router entry or the subtree calling the hook.

## Zustand causes full-app rerenders

- Avoid returning entire state objects; select primitives or stable references.

## Stale UI after login

- Confirm token persistence writes storage keys expected by Axios interceptors.

## Hydration mismatch with `persist`

- Defer rendering persisted-dependent UI until `useEffect` on client if SSR is introduced later.
