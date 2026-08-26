---
name: api-permissions-security
description: Apply authentication, authorization, and access-control patterns to Django REST Framework endpoints in this repository. Use when adding or changing `permission_classes`, enforcing role-based or active-user checks, restricting object access, validating workspace membership, or reviewing whether an endpoint exposes data too broadly.
---

# API Permissions Security

## Overview

Respect the repository's default authenticated API posture, then narrow access explicitly. Reuse shared permission classes first and enforce object-level access in querysets or object resolution when the rule depends on relationships.

## Baseline

- The project default permission is authenticated users in DRF settings.
- Many endpoints add `IsActiveUser`.
- Admin-only flows usually combine `IsUserRoleAdmin` and `IsActiveUser`.

## Reuse Before Creating

Check these before adding a new permission class:

- `<project_package>/core/permissions.py`
- `<project_package>/<app_name>/permissions.py`
- nearby single-view files in `<project_package>/<app_name>/api/<version>/views/` that already implement the same access rule in `get_queryset()` or `get_object()`

## Object Access Strategy

Prefer queryset or object filtering when access depends on:

- workspace membership
- ownership
- selected workspace
- agent availability through a join table
- active versus inactive records

Use a custom permission class when:

- the rule is reused across multiple endpoints
- the check is not naturally expressible in the queryset
- the error semantics should be standardized

## Security Checklist

- Do not trust raw IDs from the request without filtering by user access.
- Do not expose broad querysets on detail or update views if object membership matters.
- Keep unauthenticated access rare and explicit.
- Match permission handling to nearby endpoints so access rules stay predictable.
