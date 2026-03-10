# Governance Profile Schema

## Overview

Governance profiles are the core configuration unit in CerbiSuite. A profile defines what fields are required, forbidden, or sensitive in your structured logs, along with type constraints, severity levels, and scoring rules. Profiles are authored as JSON and can be managed through the CerbiShield Dashboard, stored in your Git repos, or loaded at runtime via hot reload.

## Canonical Schema

All CerbiSuite tools — the Dashboard rule editor, templates, Form Builder, and Rule Composer — produce profiles conforming to this canonical schema.

```json
{
  "name": "string — profile display name",
  "appName": "string — target application identifier",
  "version": "string — semver without 'v' prefix (e.g., 1.0.0)",
  "status": "Draft | Published",
  "metadata": {
    "description": "string — human-readable purpose",
    "owner": "string — team or individual owner",
    "createdAt": "ISO 8601 timestamp"
  },
  "requiredFields": ["array of field names that must be present"],
  "disallowedFields": ["array of field names that must not appear"],
  "fieldSeverities": {
    "fieldName": "Info | Warn | Error | Forbidden"
  },
  "fieldTypes": {
    "fieldName": "String | Int | Decimal | Guid | DateTime | Bool | Object | Array"
  },
  "enums": {
    "fieldName": ["allowed", "enum", "values"]
  },
  "allowRelax": false,
  "tags": ["optional", "classification", "tags"],
  "encryption": {
    "fields": ["fields requiring encryption"],
    "algorithm": "AES-256-GCM"
  },
  "scoring": {
    "weight": 1.0,
    "category": "compliance | security | quality"
  }
}
```

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name for the profile |
| `appName` | string | Yes | Application identifier this profile governs |
| `version` | string | Yes | Semantic version (no "v" prefix) |
| `status` | enum | Yes | `Draft` or `Published` |
| `metadata` | object | No | Description, owner, creation timestamp |
| `requiredFields` | string[] | No | Fields that must exist in every log event |
| `disallowedFields` | string[] | No | Fields that must never appear |
| `fieldSeverities` | object | No | Per-field severity: Info, Warn, Error, Forbidden |
| `fieldTypes` | object | No | Expected data type per field |
| `enums` | object | No | Allowed values per field |
| `allowRelax` | boolean | No | Enable relaxation mode (log violations but don't block) |
| `tags` | string[] | No | Classification tags for filtering and reporting |
| `encryption` | object | No | Fields requiring encryption and algorithm |
| `scoring` | object | No | Weight and category for governance scoring |

## Severity Levels

| Level | Behavior |
|-------|----------|
| `Info` | Logged for visibility; no enforcement action |
| `Warn` | Generates a warning violation; event is still accepted |
| `Error` | Generates an error violation; event may be rejected depending on mode |
| `Forbidden` | Hard block — event is rejected and violation recorded |

## Relaxation Mode

When `allowRelax` is `true`, violations are recorded but events are not blocked. This is useful for rolling out governance gradually:

1. Deploy profile with `allowRelax: true`
2. Monitor violations in the Dashboard
3. Fix logging code to comply
4. Set `allowRelax: false` to enforce

## Version Management

Profiles use semantic versioning without a "v" prefix:

- `1.0.0` — initial published version
- `1.1.0` — added new required fields
- `2.0.0` — breaking change (removed fields, changed types)

The Dashboard tracks version history and supports Draft → Published promotion.

## Additional Properties

The canonical schema sets `additionalProperties: false`. Unknown fields in a profile will cause validation errors. This ensures profiles are predictable and reviewable.

## Example

```json
{
  "name": "Payment Service Compliance",
  "appName": "payment-service",
  "version": "2.1.0",
  "status": "Published",
  "metadata": {
    "description": "PCI-DSS compliant logging for payment processing",
    "owner": "platform-team",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "requiredFields": ["correlationId", "timestamp", "serviceName", "environment"],
  "disallowedFields": ["cardNumber", "cvv", "pin", "ssn"],
  "fieldSeverities": {
    "cardNumber": "Forbidden",
    "cvv": "Forbidden",
    "email": "Warn",
    "userId": "Info"
  },
  "fieldTypes": {
    "correlationId": "Guid",
    "timestamp": "DateTime",
    "amount": "Decimal",
    "retryCount": "Int"
  },
  "enums": {
    "environment": ["dev", "staging", "production"],
    "severity": ["info", "warning", "error", "critical"]
  },
  "allowRelax": false,
  "tags": ["pci-dss", "payments", "compliance"],
  "encryption": {
    "fields": ["accountNumber"],
    "algorithm": "AES-256-GCM"
  },
  "scoring": {
    "weight": 1.5,
    "category": "compliance"
  }
}
```

## Related

- [Dashboard Overview](dashboard-overview.md) — manage profiles in the rule editor
- [Rule Templates](rule-templates.md) — start from a compliance template
- [Governance Runtime](governance-runtime.md) — how profiles are enforced at runtime
