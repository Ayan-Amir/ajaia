# Code and output templates

Load this when you need copy-paste patterns or the mandatory review response shape.

## Component split: dashboard

```tsx
// Before: monolith component with mixed concerns
function Dashboard({ users, stats, isLoading }: DashboardProps) {
  return (
    <section>
      <header>
        <h2>Dashboard</h2>
      </header>
      <div className='stats-grid'>
        <StatCard label='Users' value={stats.totalUsers} />
        <StatCard label='Active' value={stats.activeUsers} />
      </div>
      {isLoading ? <Spinner /> : <table>{/* user rows */}</table>}
    </section>
  );
}

// After: split by responsibility
function Dashboard({ users, stats, isLoading }: DashboardProps) {
  return (
    <section>
      <StatsPanel stats={stats} />
      <UserTable users={users} isLoading={isLoading} />
    </section>
  );
}
```

## List virtualization (`react-window`)

```tsx
import { FixedSizeList, ListChildComponentProps } from 'react-window';

type Item = { id: string; label: string };

const Row = ({ index, style, data }: ListChildComponentProps<Item[]>) => {
  const item = data[index];
  return (
    <div style={style} key={item.id}>
      {item.label}
    </div>
  );
};

export function VirtualizedItemList({ items }: { items: Item[] }) {
  return (
    <FixedSizeList
      height={480}
      width='100%'
      itemCount={items.length}
      itemSize={44}
      itemData={items}
    >
      {Row}
    </FixedSizeList>
  );
}
```

## Lazy-loaded component

```tsx
const HeavyPanel = React.lazy(() => import('@/components/heavy/HeavyPanel'));
```

## Debounce hook and search box

```tsx
import { useCallback, useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);

  const handleChange = useCallback((next: string) => {
    setQuery(next);
  }, []);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return <input value={query} onChange={(e) => handleChange(e.target.value)} />;
}
```

## Lazy image

```tsx
<img src='/images/gallery/item-1.webp' alt='Gallery item' loading='lazy' width={640} height={360} />
```

## Mandatory review output format

Always respond using ONLY this structure. Do not deviate from this format under any circumstance.

```markdown
## Findings
- [High/Medium/Low] file-or-component: issue, impact, recommendation

## Optimization Plan
- Step 1
- Step 2

## Verification
- Interaction tested
- Expected improvement observed
```
