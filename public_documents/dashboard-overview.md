# CerbiShield Dashboard

## What It Is

CerbiShield Dashboard is the central command center for logging governance. It provides real-time visibility into governance scores, violations, deployments, and audit activity across all your applications and environments.

## Key Features

### Governance Overview

The main page shows a live summary of your governance posture:

- **Governance Score** — weighted score (0–100) across all governed applications
- **Active Rules** — count of deployed governance profiles
- **Total Violations** — violations detected in the current period
- **Applications Monitored** — number of apps sending governed events

Each metric includes trend indicators comparing to the previous period.

### Interactive Charts

- **Score Trend** — line chart showing governance score over time (7d / 30d / 90d)
- **Score Distribution** — bar chart of score ranges across applications
- **Enforcement Insights** — pie/donut chart of enforcement actions (Pass, Warn, Block)
- **Deployments** — timeline of governance profile deployments per app
- **Governance Coverage** — stacked area chart of covered vs uncovered apps

### Per-Chart Preview Mode

When backend data is not yet available (new install, cold start), each chart independently generates realistic preview data with a "Preview" badge. Live data automatically replaces preview data as APIs return results — no page refresh needed.

### Environment Selector

Filter all dashboard views by environment (Production, Staging, Development) using the global environment selector in the top bar.

## Pages

| Page | Purpose |
|------|---------|
| **Overview** | KPI strip, score trends, coverage, enforcement |
| **Rules** | Create, edit, validate governance profiles (Monaco JSON editor with pretty-print) |
| **Violations** | Filterable list of governance violations with severity and app breakdown |
| **Audit** | Full audit log with search, action filters, severity KPIs, activity timeline |
| **Deployments** | Deployment history with status tracking per app/environment |
| **Reporting** | Export governance reports (PDF, CSV) with date range and metric selection |
| **Insights** | Analytics deep-dive with anomaly detection and impact analysis |
| **Health** | Real-time service health status for all CerbiShield backend services |
| **Settings** | RBAC management, API keys, license status, environment configuration |

## Rule Editing

The Rules page includes:

- **13 built-in templates** covering HIPAA, PCI-DSS, GDPR, SOX, ISO 27001, and more
- **Rule Composer** with 8 preset configurations for common governance patterns
- **Form Builder** for visual rule creation without writing JSON
- **Monaco Editor** with full JSON editing, pretty-print formatting, and syntax highlighting
- **Categorized Validation** — rule structure validation organized into collapsible sections:
  1. Structure (hard errors)
  2. Governance Enforcement (core focus)
  3. Profile Identity (auto-generated boilerplate)
  4. Compatibility & Advanced (runtime tips)

## Technology

- **Next.js 15** with App Router and React Server Components
- **Tailwind CSS** with custom design system
- **Recharts** for interactive data visualization
- **Monaco Editor** for JSON rule editing
- Deployed as a container image via GHCR → ACR → Azure Container Apps

## Getting Started

CerbiShield Dashboard is included in all paid CerbiSuite plans. Deploy through the Azure Marketplace or use the managed app installer.

For development setup, see the [Deployment Guide](deployment-guide.md).
