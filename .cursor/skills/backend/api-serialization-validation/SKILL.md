---
name: api-serialization-validation
description: Create or update DRF serializers and request validation with thin serializers and service-backed write flows. Use when shaping API responses, validating payloads, handling cross-field validation, adding computed fields, or transforming model data for Django REST Framework endpoints.
---

# API Serialization Validation

## Overview

Use serializers for validation, response shaping, and transformation, not as the main home for business workflows. Keep serializer write paths thin and hand off non-trivial persistence or orchestration to services. When creating or refactoring serializers, use a `serializers/` package and keep each serializer class in its own file.

## Placement

- Inspect the app-local API module first and match its versioned layout, such as `<project_package>/<app_name>/api/<version>/serializers/`.
- Keep each serializer in a separate file, for example `<project_package>/<app_name>/api/<version>/serializers/agent_list.py` or `<project_package>/<app_name>/api/<version>/serializers/create_agent.py`.
- Use `<project_package>/<app_name>/api/<version>/serializers/__init__.py` only for lightweight exports when that helps keep imports tidy.

## Preferred Patterns

- Reuse existing serializers when they already match the request or response shape, or can be extended with a small, local change.
- Use `ModelSerializer` for model-backed read or write endpoints.
- Use plain `Serializer` for custom payloads or lightweight write-only actions.
- Add nested serializers for related objects when the surrounding code already does this.
- Use `SerializerMethodField` for computed response fields.
- Pass request context when serializer behavior depends on the current user or request.

## Validation Rules

- Put field-level checks in `validate_<field>()` when possible.
- Put cross-field checks in `validate()`.
- Raise `serializers.ValidationError` with response shapes that match nearby code.
- Prefer serializer validation over ad hoc validation in the view.

## Create and Update Logic

Keep serializer `create()` or `update()` minimal.

- Use serializer `create()` or `update()` only for very thin persistence handoff.
- Prefer calling a service from the view after `serializer.is_valid()` for non-trivial write flows.
- If the surrounding code requires serializer-based save hooks, have `create()` or `update()` delegate immediately to a service.
- Keep `transaction.atomic()`, cross-model writes, and side-effect coordination in the service layer.

Move logic into a service when:

- the serializer is orchestrating side effects
- the same workflow is reused in multiple endpoints
- the logic is better described as domain orchestration than serialization
- the workflow spans multiple models or external systems

## Response Shaping

- Keep response fields explicit in `Meta.fields`.
- Reuse nested serializers already defined in neighboring apps when the shape matches.
- Avoid hidden query explosions from serializer method fields; coordinate with queryset prefetching in the view.
- Keep serializer-local helpers or constants in the single-serializer file unless they are reused across multiple serializers.
