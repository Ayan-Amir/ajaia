---
name: api-query-performance
description: Optimize Django REST Framework querysets, filtering, and pagination in this repository. Use when adding list or detail endpoints, preventing N+1 queries, choosing `select_related` or `prefetch_related`, defining filtersets, using search or ordering backends, or deciding when to keep or disable pagination for Django REST Framework APIs.
---

# API Query Performance

## Overview

Most performance-sensitive API work in this repository is solved in the queryset layer. Optimize before the serializer causes avoidable database chatter. When creating or refactoring filtersets, use a `filters/` package and keep each filterset class in its own file.

## Default Moves

- Put queryset tuning in `get_queryset()` unless a shared mixin already owns it.
- Use `select_related()` for single-valued joins.
- Use `prefetch_related()` and `Prefetch()` for reverse and many-to-many relationships.
- Use `annotate()` for derived list data when that avoids serializer-side loops.
- Use `distinct()` when joins would duplicate rows.

## Filtering and Search

- Reuse global DRF filter backends instead of custom parsing when possible.
- Add app-local `FilterSet` classes for non-trivial query parameters.
- Prefer `SearchFilter` for simple name searches where the app already uses it.
- Keep filter logic in a `filters/` package when it is reused or more than a one-liner.
- Keep each filterset in a separate file, for example `<project_package>/<app_name>/filters/agent_list.py`.
- Use `<project_package>/<app_name>/filters/__init__.py` only for lightweight exports when that helps keep imports tidy.

## Pagination

- The project default is page-number pagination.
- Use `NoPagination` only when the UI needs a full list and the dataset is known to stay manageable.
- Do not disable pagination casually on admin or membership endpoints without checking usage patterns.

## Serializer Coordination

- If the serializer accesses related fields or method fields, preload the data first.
- When using `to_attr` with `Prefetch`, make sure the serializer reads that attribute instead of refetching.
- Re-check `SerializerMethodField` implementations for hidden queries.

## Review Checklist

- Check list endpoints for N+1 queries.
- Check detail endpoints for unnecessary broad prefetching.
- Check `queryset.count()` usage on very large datasets.
- Keep ordering explicit when API consumers rely on it.
