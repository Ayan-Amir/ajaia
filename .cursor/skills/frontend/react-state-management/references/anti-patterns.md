# Anti-patterns

- Caching full API entities inside Zustand “for speed” while also using React Query.
- Putting volatile server metrics into Context providers without memoization.
- Creating new function identities inside context `value` each render without `useCallback`.
- Using Context for chatty updates where every consumer rerenders — prefer Zustand selectors.
- Globalizing state that a single leaf component could keep locally.
