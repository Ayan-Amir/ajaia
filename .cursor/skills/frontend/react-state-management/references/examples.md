# Examples

## Auth context

```typescript
import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem } from '#/utils/localStorage';

interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [token, setToken] = useState<string | null>(() => getLocalStorageItem('ACCESS_TOKEN') as string | null);

  const login = useCallback((newToken: string) => {
    setToken(newToken);
    setLocalStorageItem('ACCESS_TOKEN', newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    removeLocalStorageItem('ACCESS_TOKEN');
  }, []);

  const value = useMemo(() => ({ token, login, logout }), [token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
```

## Zustand UI store

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: false,
        theme: 'light',
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light',
          })),
      }),
      { name: 'ui-storage' }
    )
  )
);

export const useTheme = (): UIState['theme'] => useUIStore((s) => s.theme);
export const useSidebarOpen = (): UIState['sidebarOpen'] => useUIStore((s) => s.sidebarOpen);
```

## Composition sketch

```typescript
function Dashboard(): React.ReactElement {
  const { token } = useAuth();
  const sidebarOpen = useSidebarOpen();
  void token;
  return <div className={sidebarOpen ? 'with-sidebar' : ''}>{/* fetch via data/ hooks */}</div>;
}
```
