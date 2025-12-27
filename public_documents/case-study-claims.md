---
title: "Case Study: Claims Platform (Regulated)"
description: "How a health insurer cut log spend, stabilized dashboards, and improved auditability with Cerbi governance."
permalink: /docs/case-study-claims/
layout: default
---

# Case Study: Claims Platform (Regulated)

**Context:** A health insurer with 20+ services had inconsistent logs, PII leakage risk, and fragile dashboards.

**Approach**
- Adopted Cerbi governance profile (HIPAA starter + team rules).
- Enabled Roslyn analyzer in CI to block policy violations pre-merge.
- Deployed runtime validator in relax-mode to redact/flag without losing signals.
- Standardized correlation fields (app/env/tenant/trace).

**Outcomes (first 8 weeks)**
- **-28%** indexed fields from rollups and dedupe.
- **Fewer broken charts:** stable field names/types across releases.
- **Audit-ready:** versioned profiles + violation metadata traceability.

**Snippet**
```json
{
  "timestamp": "2025-08-27T14:33:12.120Z",
  "level": "Information",
  "action": "ClaimCreated",
  "user": { "id": "..." },
  "app": "claims-api",
  "env": "prod",
  "traceId": "a1b2c3",
  "tags": ["claims", "create"]
}
```
