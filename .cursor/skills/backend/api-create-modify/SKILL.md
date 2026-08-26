---
name: api-create-modify
description: Create or modify Django REST Framework endpoints with a service-layer-first architecture. Use when adding a new API, changing request or response shapes, adjusting serializers, permissions, filtering, pagination, queryset loading, or placing business logic across views, serializers, and services in a Django backend.
---

# API Create Modify

## Overview

Use a service-layer-first architecture so business workflows stay centralized and views and serializers remain thin. Use the companion skills in this folder when the task narrows to endpoint design, serialization, permissions, query performance, or business-logic placement.

## Quick Start

Inspect the target app before editing. Most backend APIs live in:

- `<project_package>/<app_name>/api/<version>/views/`
- `<project_package>/<app_name>/api/<version>/serializers/`
- `<project_package>/<app_name>/services/`
- `<project_package>/<app_name>/api/<version>/urls.py`
- `<project_package>/<app_name>/filters/`
- `<project_package>/<app_name>/permissions.py` or shared permissions in `<project_package>/core/permissions.py`

Within `views/`, keep one view per file and add `views/__init__.py` only as an import convenience layer when needed.
Within `serializers/`, keep one serializer per file and add `serializers/__init__.py` only as an import convenience layer when needed.
Within `services/`, group code by business workflow or action and keep transport concerns out.
Within `filters/`, keep one filterset per file and add `filters/__init__.py` only as an import convenience layer when needed.

Check the global API setup before changing cross-cutting behavior:

- `<project_config_package>/urls.py`
- `<project_config_package>/settings/base.py`
- `<project_package>/core/paginations.py`

## Repository Conventions

- Keep versioning in the URL path under `api/...`.
- Do not assume `v1`. Inspect the existing project and app routing first, then use the version segment already present there unless the task explicitly requires a new version.
- Use a `views/` package instead of a single `views.py` when creating or refactoring API views.
- Keep every view class in its own file. Name the file after the endpoint purpose so imports stay readable.
- Use a `serializers/` package instead of a single `serializers.py` when creating or refactoring serializers.
- Keep every serializer class in its own file. Name the file after the serializer purpose so imports stay readable.
- Always use an app-local `services/` package for business workflows.
- Use a `filters/` package instead of a single `filters.py` when creating or refactoring filtersets.
- Keep every filterset class in its own file. Name the file after the filter purpose so imports stay readable.
- Prefer DRF generic views for CRUD and list/detail endpoints.
- Use plain `APIView` for custom actions, patch-only actions, streaming responses, or endpoints that do not fit a standard generic cleanly.
- Reuse serializer classes for validation and response shaping.
- Keep queryset optimization in `get_queryset()` when possible.
- Reuse `django-filter`, search backends, and the shared pagination classes instead of rolling custom request parsing.
- Check `<project_config_package>/settings/base.py` before adding per-view filtering config. If `DEFAULT_FILTER_BACKENDS` or other REST Framework filter defaults are already defined there, do not re-add them explicitly on the view; only override them when the endpoint needs different behavior.
- Follow existing naming conventions first, even when they are not perfectly REST-pure. This repository already uses routes like `create/`, `<pk>/update/`, and `toggle-status/`.

## Workflow

1. Find the nearest existing app and endpoint pattern.
2. Decide whether the change belongs in `urls.py`, a single-view file under `views/`, a single-serializer file under `serializers/`, a service module, a single-filterset file under `filters/`, or a permission class.
3. Keep the view focused on HTTP concerns: request parsing, serializer selection, queryset selection, response type, and status codes.
4. Put validation and request-shape rules in serializers unless the logic is clearly authorization or transport-specific.
5. Put non-trivial business workflows in services.
6. Optimize ORM access before shipping list/detail endpoints.
7. Preserve response compatibility unless the task explicitly changes the contract.
8. Run targeted tests or at least the closest test module after editing.

## Layering Guidance

Prefer this order:

- View: HTTP orchestration, serializer invocation, service invocation, response objects.
- Serializer: validation and data transformation.
- Service: create or update workflows, domain rules, transactions, side-effect coordination, reusable business actions.
- FilterSet: query-param filtering rules.
- Permission class: reusable access rules that are broader than a single queryset.

Avoid using helpers, managers, or invokers as the default home for new business workflows. If older apps already use them, treat them as transitional service-layer equivalents rather than extending views or serializers further.

## Companion Skills

- `api-endpoint-design`
- `api-serialization-validation`
- `api-permissions-security`
- `api-query-performance`
- `api-business-logic-placement`
