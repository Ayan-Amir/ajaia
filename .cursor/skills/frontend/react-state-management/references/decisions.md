# Decisions

| Scenario | Prefer |
| --- | --- |
| Auth/session shared widely, infrequent updates | Context + dedicated `useAuth` |
| High-frequency UI toggles (panels, themes) | Zustand selectors |
| Remote list/detail entities | TanStack Query (`api-integration`) |
| Form field values | React Hook Form (`forms-validation`) |
| URL/search driven filters | Router (`routing-navigation`) |

### Local-first checklist

- Only one component needs it → `useState`
- Two to three parents/children → lift locally
- Far-apart trees → Context or Zustand
- Backend JSON → React Query cache, not duplicated in stores
