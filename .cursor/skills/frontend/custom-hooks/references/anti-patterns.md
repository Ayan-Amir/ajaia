# Anti-patterns

## Missing dependencies

```typescript
// Bad: `userId` omitted from deps
useEffect(() => {
  void fetchUser(userId);
}, []);

// Good
useEffect(() => {
  void fetchUser(userId);
}, [userId]);
```

## Unstable object deps

```typescript
// Bad: new object every render → effect runs every time
useEffect(() => {
  doSomething(options);
}, [options]);

// Good: depend on primitives
const { page, limit } = options;
useEffect(() => {
  doSomething({ page, limit });
}, [page, limit]);
```

## Premature memoization

```typescript
// Bad: trivial work
const name = useMemo(() => `${first} ${last}`, [first, last]);

// Good
const name = `${first} ${last}`;
```

## Conditional hook call

```typescript
// Bad
if (shouldFetch) {
  const [x] = useState(0);
}

// Good: always call hooks; branch in JSX/return
const [x] = useState(0);
if (!shouldFetch) return null;
```
