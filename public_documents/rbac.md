---
title: "CerbiShield RBAC"
description: "Overview of Cerbi's Role-Based Access Control service, covering roles, policies and permissions."
permalink: /docs/rbac/
layout: default
---

# CerbiShield RBAC Overview

CerbiShield includes a unified Role-Based Access Control (RBAC) service that centralizes authorization logic for governance administration, scoring and dashboard access.

**Key concepts:**

- **Roles** – Named groups of permissions such as `Administrator`, `Auditor`, `Developer` or `Viewer`. Roles can be assigned to users or service principals.
- **Policies** – JSON definitions that grant or deny actions on specific resources. Policies can scope permissions by tenant, environment or profile.
- **Actions & Tags** – Standardized action names like `ManageProfiles`, `ViewScores`, `GrantRoles`, `DeleteLogs` etc. Tags allow policies to apply to sets of resources (e.g., all `Orders` profiles in `Prod`).
- **Licensing** – The RBAC service is open-sourced under the MIT license; some advanced features require a CerbiShield subscription.
- **API Endpoints** – REST endpoints allow you to assign roles, create policies, list current permissions and evaluate whether a principal can perform an action.

For full API details and examples, see the CerbiShield.Rbac repository README. This summary omits internal endpoints and environment variables that are only relevant to deployed tenants.
