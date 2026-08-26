# Examples

## Basic `useToggle`

```typescript
import { useCallback, useState } from 'react';

interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export function useToggle(initialValue = false): UseToggleReturn {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

## Effect deps and listener cleanup

```typescript
useEffect(() => {
  fetchUser(userId);
}, [userId]);

const handleClick = useCallback(() => {
  onClick(id);
}, [id, onClick]);

useEffect(() => {
  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
}, [handleClick]);
```

## Latest callback with `useRef`

```typescript
import { useEffect, useRef } from 'react';

function Component({ onSave, data }: { onSave: (data: unknown) => void; data: unknown }): React.ReactElement {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    const handler = () => onSaveRef.current(data);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [data]);

  return <div />;
}
```

## Subscription and abort patterns

```typescript
useEffect(() => {
  const subscription = eventEmitter.subscribe(handleEvent);
  return () => subscription.unsubscribe();
}, []);

useEffect(() => {
  const controller = new AbortController();
  void (async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setError(err);
    }
  })();
  return () => controller.abort();
}, [url]);
```

## Memoization

```typescript
const sortedItems = useMemo(
  () => items.slice().sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
  onSelect?.(id);
}, [onSelect]);
```

## Hooks rules: conditional render, not conditional hooks

```typescript
function Component({ shouldFetch }: { shouldFetch: boolean }): React.ReactElement {
  const [count] = useState(0);
  if (!shouldFetch) return <span>idle</span>;
  return <span>{count}</span>;
}
```
