# Rule Templates & Composer

## Overview

CerbiShield Dashboard includes built-in rule templates and a Rule Composer to help you create governance profiles quickly. Instead of writing JSON from scratch, start from a compliance-focused template and customize it for your application.

## Built-In Templates

CerbiShield ships with 13 governance templates covering major compliance frameworks and common operational patterns:

| Template | Category | Description |
|----------|----------|-------------|
| HIPAA Audit Logging | Healthcare | PHI field redaction, audit trail requirements, access logging |
| PCI-DSS Cardholder | Finance | Card number/CVV blocking, encryption requirements, PAN masking |
| GDPR Data Protection | Privacy | Consent fields, data subject rights, retention controls |
| SOX Financial Controls | Finance | Financial transaction audit trails, segregation of duties |
| ISO 27001 Security | Security | Information security management controls |
| API Gateway Logging | Operations | Request/response logging, correlation IDs, rate limiting metadata |
| Microservice Tracing | Operations | Distributed tracing fields, service mesh metadata |
| PII Redaction Standard | Privacy | Cross-framework PII detection and redaction rules |
| Error Handling Policy | Quality | Structured error reporting, stack trace governance |
| Performance Monitoring | Operations | Latency metrics, resource utilization fields |
| Multi-Tenant Isolation | Security | Tenant ID requirements, cross-tenant data leak prevention |
| Event Sourcing | Architecture | Event schema validation, aggregate versioning |
| CI/CD Pipeline Logging | DevOps | Build/deploy event governance, artifact tracking |

## How Templates Work

1. **Select a template** from the template gallery on the Rules page
2. **Customize** — the template populates the Monaco editor with a canonical governance profile
3. **Set your `appName`** — change the target application identifier
4. **Adjust fields** — add or remove required/disallowed fields for your use case
5. **Validate** — the built-in validator checks structure, governance enforcement, and compatibility
6. **Save** — store the profile in the Governance Store

All templates produce [canonical governance profile JSON](governance-profile-schema.md) with flat field structure.

## Rule Composer

The Rule Composer provides 8 preset configurations that combine multiple governance concerns:

| Preset | Combines |
|--------|----------|
| Strict Compliance | Required fields + forbidden fields + field types + no relaxation |
| Audit Trail | Correlation IDs + timestamps + actor fields + event types |
| PII Shield | Disallowed PII fields + encryption requirements + redaction |
| Minimal Governance | Required fields only + relaxation mode enabled |
| Full Observability | Tracing + metrics + structured errors + correlation |
| Data Classification | Field severities + tags + encryption tiers |
| Multi-Environment | Environment-specific rules + promotion workflow |
| Security Hardened | Forbidden fields + encryption + tenant isolation + IP tracking |

### Using the Composer

1. Select a preset from the Composer panel
2. The composer generates a complete governance profile
3. Review and customize in the Monaco editor
4. Validate and save

## Form Builder

For users who prefer visual editing over JSON:

- **Add fields** — click to add required or disallowed fields
- **Set severities** — dropdown for each field's severity level
- **Configure types** — select expected data types per field
- **Set metadata** — name, app, version, owner, description
- **Toggle relaxation** — switch between enforce and monitor modes

The Form Builder synchronizes with the Monaco editor — changes in either view are reflected in the other.

## Validation

When you validate a rule in the Dashboard, the validator checks **rule structure** (not log payloads). Results are organized into collapsible sections:

1. **Structure** — JSON validity, required schema fields (always visible)
2. **Governance Enforcement** — field severities, required/disallowed field conflicts (always expanded)
3. **Profile Identity** — name, appName, version format (collapsed by default)
4. **Compatibility & Advanced** — runtime tips, hot reload considerations (collapsed by default)

Each validation message explains **why it matters** and **what to do**, making the experience educational rather than just an error list.

## Related

- [Governance Profile Schema](governance-profile-schema.md) — canonical JSON schema reference
- [Dashboard Overview](dashboard-overview.md) — full dashboard feature tour
- [Governance Runtime](governance-runtime.md) — how profiles are enforced at runtime
