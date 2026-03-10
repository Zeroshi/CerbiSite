# Scoring & Analytics

## Overview

CerbiShield continuously scores your governed applications based on logging compliance. Scores flow from runtime validation through the Scoring Aggregator into the Dashboard, giving teams a quantitative view of governance health.

## How Scoring Works

### Score Calculation

Each governed log event is validated against its governance profile. The validation result contributes to the application's governance score:

- **Pass** — event fully complies with the profile → positive score contribution
- **Warn** — event has advisory violations → neutral/slight negative
- **Error** — event has enforcement violations → negative score contribution
- **Forbidden** — event contains blocked fields → significant negative impact

Scores are weighted by the profile's `scoring.weight` and `scoring.category` settings.

### Score Aggregation

The Scoring Aggregator processes events and computes:

- **Per-application scores** — governance health for each app
- **Per-environment scores** — compare production vs staging vs dev
- **Trend data** — score changes over time (daily, weekly, monthly)
- **Category breakdown** — scores by compliance, security, and quality

### Score Range

| Range | Label | Meaning |
|-------|-------|---------|
| 90–100 | Excellent | Full compliance, minimal violations |
| 75–89 | Good | Mostly compliant, some advisory warnings |
| 50–74 | Needs Improvement | Significant violations requiring attention |
| 0–49 | Critical | Major governance gaps, immediate action needed |

## Dashboard Analytics

### Score Trend Chart

Line chart showing governance score over selectable time ranges:

- **7 days** — recent changes and deployments
- **30 days** — monthly trend with deployment markers
- **90 days** — quarterly compliance posture

### Score Distribution

Bar chart showing how many applications fall into each score range. Useful for identifying outliers and prioritizing remediation.

### Enforcement Insights

Pie/donut chart breaking down enforcement actions:

- Pass rate vs violation rate
- Violation severity distribution
- Top violation categories

### Governance Coverage

Stacked area chart showing:

- Applications with active governance profiles
- Applications without governance
- Coverage percentage over time

### Impact Analysis

The Insights page provides deeper analytics:

- **Anomaly detection** — sudden score drops or violation spikes
- **Deployment correlation** — score changes correlated with deployments
- **Top violating fields** — most commonly violated field requirements
- **Remediation tracking** — violations resolved over time

## Violations

Violations are the individual events where a log entry fails governance validation:

| Field | Description |
|-------|-------------|
| `code` | Violation type (e.g., `MISSING_REQUIRED_FIELD`) |
| `field` | The field that caused the violation |
| `severity` | Info, Warn, Error, or Forbidden |
| `message` | Human-readable description |

### Violation Lifecycle

1. **Detected** — runtime validator identifies non-compliance
2. **Recorded** — violation stored in the scoring database
3. **Aggregated** — contributes to app/environment scores
4. **Visible** — appears on Dashboard violations page
5. **Resolved** — fixed in application code, scores improve

## Reporting

The Reporting page allows export of governance data:

- **PDF Reports** — formatted governance summary with charts
- **CSV Export** — raw data for custom analysis
- **Date Range** — select any time period
- **Metric Selection** — choose which metrics to include

Reports can be generated for compliance audits, management reviews, or internal governance tracking.

## Audit Trail

All governance actions are recorded in the audit log:

- Profile creation, updates, and deletions
- Deployment triggers and outcomes
- API key management
- User authentication events
- RBAC permission changes

The audit page includes:

- **Severity KPIs** — Info, Warning, Error, Critical event counts
- **Activity Timeline** — visual timeline of events over 7 days
- **Top Actors** — most active users
- **Search & Filter** — find specific events by actor, resource, or action

## Data Pipeline

```
Application → CerbiStream/Runtime → Validation API → Scoring Aggregator → PostgreSQL → Dashboard
```

1. Application logs events through CerbiStream or runtime governance
2. Events are validated against the active governance profile
3. Validation results flow to the Scoring Aggregator
4. Aggregator computes and stores scores in PostgreSQL
5. Dashboard queries scores and renders analytics

## Related

- [Dashboard Overview](dashboard-overview.md) — where scores are visualized
- [Governance Profile Schema](governance-profile-schema.md) — profiles that drive scoring
- [Governance Runtime](governance-runtime.md) — runtime validation that generates scores
