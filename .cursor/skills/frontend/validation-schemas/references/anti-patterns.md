# Anti-patterns

## 1) Duplicating rules in UI handlers

Bad:
```ts
if (!values.email.includes("@")) {
  setLocalError("email", "Invalid email");
}
```

Good:
```ts
const schema = z.object({ email: z.string().email("Invalid email") });
```

## 2) Using `mode: "all"` by default

Bad:
```ts
useForm({ mode: "all" });
```

Good:
```ts
useForm({ mode: "onBlur", reValidateMode: "onChange" });
```

## 3) One schema for incompatible create/update requirements

Bad:
```ts
const userSchema = z.object({ id: z.string(), password: z.string().min(12) });
```

Good:
```ts
const createSchema = z.object({ password: z.string().min(12) });
const updateSchema = z.object({ id: z.string().uuid() }).merge(createSchema.partial());
```

## 4) Re-implementing patterns owned by other skills

Bad:
```ts
// Defines query hooks and cache keys in validation skill files
export function useUsersQuery() { /* ... */ }
```

Good:
```ts
// Keep validation only; import data layer hooks from api-integration-data-layer outputs
```

## 5) Mixing auth context setup with schema ownership

Bad:
```tsx
export const AuthProvider = ({ children }: PropsWithChildren) => {
  // auth state + token refresh + schema logic mixed together
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
```

Good:
```ts
// Keep auth context in react-state-management; keep validation schema in src/validation/auth/
```
