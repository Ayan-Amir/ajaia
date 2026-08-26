---
name: api-endpoint-design
description: Design or modify Django REST Framework routes and views with thin HTTP layers and service-backed business workflows. Use when adding endpoints, changing URL patterns, choosing between generic views and APIView, introducing custom actions, wiring app-level API routing, or aligning request and response behavior with repository conventions.
---

# API Endpoint Design

## Overview

Build endpoints with thin views: inspect the existing app-local API module and versioned path first, then match that structure while keeping business workflows in services. Prefer DRF generics for standard cases and `GenericAPIView` for custom actions or streaming flows. When creating or refactoring views, use a `views/` package and keep each view class in its own file.

## Placement

- First inspect the existing app routing and match its current versioned module layout, such as `<project_package>/<app_name>/api/<version>/urls.py` and a `views/` package under `<project_package>/<app_name>/api/<version>/views/`.
- Keep each view in a separate file, for example `<project_package>/<app_name>/api/<version>/views/list_agents.py` or `<project_package>/<app_name>/api/<version>/views/create_agent.py`.
- Use `<project_package>/<app_name>/api/<version>/views/__init__.py` only for lightweight exports when that helps keep imports tidy.
- Ensure the app is mounted from `<project_config_package>/urls.py` under the existing versioned API prefix already used by the project.

## URL Rules

- Keep versioning in the path, not in DRF versioning settings.
- Do not assume `v1`. Detect the version segment already used by the project or app and extend that same version unless the task explicitly asks for a new one.
- Prefer existing naming patterns over idealized REST theory.
- Use resource paths for list and detail endpoints where already established.
- Use action paths like `create/`, `<pk>/update/`, or `<pk>/toggle-status/` when matching surrounding code.
- Keep route names descriptive and consistent with nearby endpoints.

## View Selection

Prefer DRF generic views for:

- `ListAPIView`
- `RetrieveAPIView`
- `CreateAPIView`
- `UpdateAPIView`
- `RetrieveUpdateDestroyAPIView`
- `ListCreateAPIView`

Use `GenericAPIView` when:

- the endpoint is patch-only or post-only and does not map cleanly to a generic
- the response is custom or non-JSON
- the endpoint streams data
- object lookup or authorization is highly custom
- the endpoint chooses between service-backed workflows or multiple serializers

## Endpoint Checklist

- Declare `permission_classes` explicitly when the endpoint differs from the project default or when clarity matters.
- Set `serializer_class` or `get_serializer_class()`.
- Keep `get_queryset()` narrow and access-aware.
- Use `get_object()` for special object resolution only when queryset filtering is not enough.
- Call a named service for non-trivial write actions instead of embedding workflow logic in the view.
- Return explicit status codes for custom APIView methods.
- Preserve existing response shapes unless the task requests a contract change.
- Keep helper functions or constants local to the single-view file unless they are reused across multiple views.
