# Examples

## `performRequest` helper (shape)

```typescript
import type { AxiosRequestConfig, Method } from 'axios';
import axiosInstance from './axiosInstance';

export const performRequest = async <
  TResponse,
  TPayload extends Record<string, unknown> | undefined = undefined,
  TParams extends Record<string, unknown> = Record<string, unknown>,
>({
  method,
  url,
  payload,
  params,
  config,
}: {
  method: Method;
  url: string;
  payload?: TPayload;
  params?: TParams;
  config?: AxiosRequestConfig;
}): Promise<TResponse> => {
  const res = await axiosInstance.request<TResponse>({ method, url, params, data: payload, ...config });
  return res.data;
};
```

## List query hook

```typescript
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiEndpoints, GET, queryKeys } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { PostsResponse, UseGetPostsProps } from '#/types/posts/api.types';

export const useGetPosts = <TParams extends Record<string, unknown> = Record<string, unknown>>({
  params = {} as TParams,
  options = {},
}: UseGetPostsProps<TParams> = {}): UseQueryResult<PostsResponse, Error> =>
  useQuery<PostsResponse, Error, PostsResponse, [string, TParams]>({
    queryKey: [queryKeys.POSTS, params],
    queryFn: () =>
      performRequest({
        method: GET,
        url: apiEndpoints.POSTS,
        params,
      }),
    ...options,
  });
```

## Detail query with `enabled`

```typescript
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { apiEndpoints, GET, queryKeys } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { Post } from '#/types/posts/post.types';

export const useGetPostById = (
  id: string | undefined,
  options?: { enabled?: boolean }
): UseQueryResult<Post, Error> =>
  useQuery<Post, Error>({
    queryKey: [queryKeys.POST_DETAIL, id],
    queryFn: () =>
      performRequest<Post>({
        method: GET,
        url: apiEndpoints.POST_BY_ID(id!),
      }),
    enabled: Boolean(id) && options?.enabled !== false,
  });
```

## Infinite list (consumer)

```typescript
import { useInfiniteScrollQuery } from '#/services/networkRequestService';
import { apiEndpoints, queryKeys } from '#/constants';
import type { Post } from '#/types/posts/post.types';

export function PostsInfinite(): React.ReactElement {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteScrollQuery<
    Post[],
    { search?: string }
  >({
    key: queryKeys.POSTS,
    url: apiEndpoints.POSTS,
    params: { search: 'react' },
    limit: 10,
  });

  const allPosts = data?.pages.flat() ?? [];

  return (
    <div>
      {allPosts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
      {hasNextPage ? (
        <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </div>
  );
}
```

## Create mutation + invalidate

```typescript
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiEndpoints, POST, queryKeys } from '#/constants';
import { performRequest } from '#/services/apiClient';
import type { CreatePostResponse, CreatePostVariables } from '#/types/posts/api.types';

export const useCreatePost = (
  options?: UseMutationOptions<CreatePostResponse, Error, CreatePostVariables>
): UseMutationResult<CreatePostResponse, Error, CreatePostVariables> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) =>
      performRequest({
        method: POST,
        url: apiEndpoints.POSTS,
        payload: variables.payload,
        params: variables.params,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.POSTS] });
    },
    ...options,
  });
};
```

## Call site callbacks (preferred)

```typescript
const { mutate } = useCreatePost();

const onSubmit = (variables: CreatePostVariables) => {
  mutate(variables, {
    onSuccess: (response) => {
      // toast / navigate
      void response;
    },
    onError: (error) => {
      void error;
    },
  });
};
```

## Offline Queue

**Trigger:** a mutation must be queued while the user is offline and replayed automatically on reconnect.

**Pattern:** use TanStack Query's `isPaused` state to detect a paused mutation, persist the pending payload to localStorage via `src/lib/api/offlineQueue.ts`, and flush the queue when `navigator.onLine` fires.

> Do not implement a custom service worker for this — offline asset caching belongs to a PWA skill.

```typescript
// src/lib/api/offlineQueue.ts

const QUEUE_KEY = 'offline_mutation_queue';

type QueuedMutation = {
  key: string;
  payload: unknown;
};

export const offlineQueue = {
  enqueue(key: string, payload: unknown): void {
    const current = offlineQueue.getAll();
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...current, { key, payload }]));
  },

  getAll(): QueuedMutation[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as QueuedMutation[];
    } catch {
      return [];
    }
  },

  clear(): void {
    localStorage.removeItem(QUEUE_KEY);
  },
};
```

**Usage in a mutation hook** — enqueue when paused, flush on reconnect:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offlineQueue } from '@/lib/api/offlineQueue';
import { performRequest } from '@/services/apiClient';
import { POST } from '@/constants';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreatePostVariables) =>
      performRequest({ method: POST, url: apiEndpoints.POSTS, payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.POSTS] });
    },
  });

  // Enqueue when TanStack Query pauses the mutation (network offline)
  if (mutation.isPaused && mutation.variables !== undefined) {
    offlineQueue.enqueue('createPost', mutation.variables);
  }

  return mutation;
};
```

**Flush the queue on reconnect** — wire once in the app bootstrap (e.g. `src/main.tsx`):

```typescript
import { offlineQueue } from '@/lib/api/offlineQueue';
import { performRequest } from '@/services/apiClient';
import { POST } from '@/constants';

window.addEventListener('online', async () => {
  const pending = offlineQueue.getAll();
  if (pending.length === 0) return;
  offlineQueue.clear();

  for (const item of pending) {
    if (item.key === 'createPost') {
      await performRequest({ method: POST, url: apiEndpoints.POSTS, payload: item.payload });
    }
  }
  // Invalidate affected query keys after flush if needed
});
```
