---
name: api-business-logic-placement
description: Design API business logic around an app-local service layer. Use when creating or modifying views, serializers, filtersets, permission classes, and the goal is to keep transport and validation layers thin while centralizing business workflows in services.
---

# API Business Logic Placement

## Overview

Use a service-layer architecture. Views and serializers should stay thin, and business workflows should live in app-local services.

## Default Architecture

- Views handle HTTP orchestration only.
- Serializers handle input and output validation plus representation only.
- FilterSets handle reusable query-param filtering only.
- Permission classes hold reusable access rules only.
- Services own business workflows, coordination, domain rules, and reusable write operations.

Recommended app-local layout:

- `api/.../views/` for one view per file when the app already follows that pattern
- `api/.../serializers/` for request and response serializers
- `services/` for business workflows

## Placement Rules

Put logic in the view when it is about:

- choosing serializers
- choosing querysets
- returning custom responses
- coordinating streaming or transport-specific behavior

Put logic in the serializer when it is about:

- validating payloads
- transforming data
- serializing computed output from data that is already prepared

Put logic in a service when it is about:

- create, update, delete, or state-transition workflows
- multi-step orchestration
- branching workflows by type
- reuse across endpoints, commands, or tasks
- enforcing business rules
- coordinating database writes, external APIs, and side effects
- any logic that would otherwise make a view or serializer non-trivial

## Rules

- Do not introduce helper, manager, or invoker modules as the primary home for new business logic.
- Do not put create/update workflow logic in serializers except for very thin handoff code.
- Do not let views accumulate branching business rules or multi-step write flows.
- Prefer calling a named service function or service object from every non-trivial write endpoint.

## Legacy Compatibility Note

If a touched app already has helper, manager, or invoker modules, you can work within that structure to avoid unnecessary churn. Even then, treat those modules as transitional service-layer equivalents and keep new business logic out of views and serializers.

## Refactoring Guidance

- Always use an app-local `services/` package when extracting or adding business logic.
- Create the service layer early instead of waiting for duplication to appear.
- Organize services around business actions or workflows, not around HTTP endpoints.
- When updating existing endpoints, move business workflows out of views and serializers instead of adding more logic there.
- Favor small, targeted extractions over broad rewrites, but keep the direction consistent: business logic flows into services.
- Name service functions and classes after business actions, for example `create_session`, `sync_panopto_folder`, or `EnrollmentService`.
- Keep transactions, cross-model writes, and external side-effect coordination in the service layer.
