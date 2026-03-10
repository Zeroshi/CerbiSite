# CerbiShield Deployment Guide

## Overview

CerbiShield deploys as a set of containerized services within your Azure tenant. All data stays in your environment — Cerbi does not ship logs or governance data to shared infrastructure.

## Architecture

CerbiShield consists of the following services:

| Service | Purpose |
|---------|---------|
| **Dashboard** | Next.js web application — governance command center |
| **Router** | YARP-based API gateway — routes requests to backend services |
| **RBAC API** | Role-based access control, licensing, and policy management |
| **Reporting API** | Aggregated governance reports and analytics |
| **Scoring Aggregator** | Processes governance scores and violation metrics |
| **Governance Store API** | CRUD for governance profiles |
| **Governance Deploy API** | Profile deployment and assignment management |
| **Validation API** | Real-time log payload validation against governance profiles |
| **License Handler** | Azure Marketplace license verification |

All services run as Azure Container Apps with managed identity and internal networking.

## Azure Marketplace Deployment

### Prerequisites

- An active Azure subscription
- Contributor access to the target resource group
- Azure Container Apps environment (created automatically by the installer)

### Installation

1. Find **CerbiShield** in the Azure Marketplace
2. Launch the install wizard
3. Configure:
   - **Resource Group** — where CerbiShield resources will be created
   - **Region** — Azure region for all services
   - **PostgreSQL** — connection details for the governance database
   - **Container Image Tag** — version to deploy (defaults to latest)
4. The wizard provisions:
   - Azure Container Registry (ACR) with imported container images
   - Container Apps for each service
   - PostgreSQL database with schema migrations
   - Managed identities and networking

### Image Distribution

Container images follow this path:

```
GHCR (source) → Customer ACR (import at deploy) → Container Apps (pull at runtime)
```

- Images are imported from GitHub Container Registry into your local ACR during deployment
- After initial import, Container Apps pull exclusively from your ACR
- No ongoing dependency on external registries

## Cold Start Prevention

Critical services are configured with `minReplicas: 1` to avoid cold start delays:

- Dashboard
- Router
- RBAC API
- Scoring Aggregator

Other services can scale to zero on the consumption plan.

## Health Checks

Each service exposes a `/health` endpoint. The Dashboard health page aggregates status across all services with real-time monitoring.

Health endpoints are exempt from authentication at three levels:

1. Dashboard proxy layer
2. Router middleware
3. Per-service middleware

This ensures health probes work without credentials.

## Environment Variables

Key environment variables configured per service:

| Variable | Service | Purpose |
|----------|---------|---------|
| `ROUTER_BASE_URL` | Dashboard (server) | Backend API gateway URL |
| `NEXT_PUBLIC_API_BASE` | Dashboard (client) | Must be `/api` (uses Next.js proxy) |
| `ConnectionStrings__DefaultConnection` | All backends | PostgreSQL connection string |
| `PORT` | Dashboard | Container listening port (default: 8080) |

> **Important:** `NEXT_PUBLIC_API_BASE` must always be `/api`, never the full Router URL. The Next.js proxy reads `ROUTER_BASE_URL` server-side to forward requests.

## Database

CerbiShield uses PostgreSQL with the following databases:

- `cerbishield_control` — governance profiles, deployments, RBAC, licensing
- `cerbishield_scoring` — governance scores, violation metrics, app metrics

Schema migrations run automatically on first deployment.

## Post-Deployment Verification

1. Open the Dashboard URL in your browser
2. Check the Health page — all services should show "Healthy"
3. Navigate to Settings → License to verify your Marketplace subscription
4. Create your first governance profile on the Rules page

## Updating

To update CerbiShield:

1. A new container image tag is published to GHCR
2. Re-run the deployment with the new `containerImageTag` parameter
3. ACR imports the updated images
4. Container Apps pull the new versions

## Related

- [Dashboard Overview](dashboard-overview.md) — what you'll see after deployment
- [RBAC Service Overview](rbac.md) — roles and permissions
- [Security Overview](security.md) — security architecture
