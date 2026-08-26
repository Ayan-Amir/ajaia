# Testing — First-Time Setup

Run this once per project. Skip if Vitest is already configured.

## 1. Install Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D msw vitest-axe
```

## 2. vite.config.ts — Add `test` Block

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    globals: true,           // no need to import describe/it/expect
    environment: "jsdom",    // simulates browser DOM in Node
    setupFiles: ["./src/tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["node_modules/", "src/tests/", "**/*.d.ts", "src/main.tsx"],
    },
  },
});
```

## 3. tsconfig.json — Add Types

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

## 4. src/tests/setup.ts — Global Setup

```typescript
import "@testing-library/jest-dom";
import "vitest-axe/extend-expect";
import { afterEach, beforeAll, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());
```

## 5. src/tests/mocks/server.ts

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);
```

## 6. src/tests/mocks/handlers.ts — Default Handlers

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => HttpResponse.json([
    { id: "1", name: "Alice", email: "alice@example.com", role: "admin" },
    { id: "2", name: "Bob",   email: "bob@example.com",   role: "user"  },
  ])),

  http.get("/api/users/:id", ({ params }) => {
    const users: Record<string, object> = {
      "1": { id: "1", name: "Alice", email: "alice@example.com" },
      "2": { id: "2", name: "Bob",   email: "bob@example.com"   },
    };
    const user = users[params.id as string];
    if (!user) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(user);
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === "test@example.com" && body.password === "Password1!") {
      return HttpResponse.json({ token: "mock-jwt-token", user: { id: "1", name: "Test User" } });
    }
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }),
];
```

## 7. src/tests/utils/test-utils.tsx — Custom Render

```typescript
import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

// Use with renderHook() for hooks that need React Query
export function createWrapper() {
  const queryClient = makeTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialRoute?: string; // sets starting URL for useLocation/useParams
}

function AllProviders({ children, initialRoute = "/" }: { children: React.ReactNode; initialRoute?: string }) {
  const queryClient = makeTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
        <ToastContainer />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function customRender(ui: React.ReactElement, options?: CustomRenderOptions) {
  const { initialRoute, ...rest } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => <AllProviders initialRoute={initialRoute}>{children}</AllProviders>,
    ...rest,
  });
}

export * from "@testing-library/react";
export { customRender as render };
```

## 8. package.json Scripts

```json
{
  "scripts": {
    "test":          "vitest",
    "test:run":      "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui":       "vitest --ui"
  }
}
```

| Script | When to use |
|---|---|
| `npm test` | Development — watch mode |
| `npm run test:run` | CI — single pass, exits with code |
| `npm run test:coverage` | Before PR — coverage report |
| `npm run test:ui` | Debugging — browser UI |
