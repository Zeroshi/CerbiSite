---
title: "CerbiShield RBAC"
description: "Overview of Cerbi's Role-Based Access Control service, covering roles, policies, permissions, Enterprise App integration, and case-insensitive role matching."
permalink: /docs/rbac/
layout: default
---

# CerbiShield RBAC Overview

CerbiShield includes a unified Role-Based Access Control (RBAC) service that centralizes authorization logic for governance administration, scoring, and dashboard access.

## Key Concepts

- **Roles** — Named groups of permissions such as `Administrator`, `Auditor`, `Developer`, or `Viewer`. Roles can be assigned to users or service principals.
- **Policies** — JSON definitions that grant or deny actions on specific resources. Policies can scope permissions by tenant, environment, or profile.
- **Actions & Tags** — Standardized action names like `ManageProfiles`, `ViewScores`, `GrantRoles`, `DeleteLogs`, etc. Tags allow policies to apply to sets of resources (e.g., all `Orders` profiles in `Prod`).
- **Licensing** — The RBAC service validates licenses through the `Licenses` and `MarketplaceSubscriptions` tables. Both an active license and a matching marketplace subscription must exist for API access.
- **API Endpoints** — REST endpoints allow you to assign roles, create policies, list current permissions, and evaluate whether a principal can perform an action.

## Role Matching

The RBAC service uses **case-insensitive role matching**. Role names like `Administrator`, `administrator`, and `ADMINISTRATOR` are all treated as equivalent. This prevents access failures caused by casing differences between identity providers and the RBAC database.

## Enterprise App Integration

CerbiShield supports Azure Active Directory (Entra ID) Enterprise Application integration for user access control:

1. **Register CerbiShield as an Enterprise App** in your Entra ID tenant
2. **Assign users and groups** to the Enterprise App to control who can access the Dashboard
3. The RBAC service matches Entra ID principals to CerbiShield roles

This is the recommended approach for organizations that manage user access centrally through Entra ID.

## Iterate-All-Roles Pattern

When checking permissions, the RBAC service uses the **iterate-all-roles** pattern — it evaluates all roles assigned to a principal rather than stopping at the first match. This ensures:

- A user with both `Developer` and `Auditor` roles gets the combined permissions of both
- Deny policies on one role correctly override allow policies on another
- Role evaluation is predictable regardless of assignment order

## License Verification

The `/check` endpoint verifies access through two checks:

1. **License check** — the `Licenses` table must contain an active entry for the `appName`
2. **Marketplace subscription check** — the `MarketplaceSubscriptions` table must have an entry where `TenantId` matches the `appName` and `Status` is `Active`

If either check fails, the endpoint returns `403 Forbidden`.

## Default Roles

| Role | Description |
|------|-------------|
| `Administrator` | Full access — manage profiles, roles, deployments, and settings |
| `Auditor` | Read-only access to audit logs, scores, and compliance reports |
| `Developer` | Create and edit governance profiles, view scores and violations |
| `Viewer` | Read-only access to dashboards and governance data |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rbac/check` | GET | Check if a principal has access (requires active license) |
| `/api/rbac/roles` | GET | List all available roles |
| `/api/rbac/roles/assign` | POST | Assign a role to a user or principal |
| `/api/rbac/policies` | GET | List all policies |
| `/api/rbac/policies` | POST | Create a new policy |
| `/api/rbac/evaluate` | POST | Evaluate whether a principal can perform an action |

For full API details and examples, see the CerbiShield.Rbac repository README.
