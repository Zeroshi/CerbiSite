# Case Study: Cutting Log Costs and Achieving Audit-Ready Compliance for a Regulated Claims Platform

**Sector:** Health Insurance (regulated)  
**Scale:** 20+ microservices, multi-environment (dev/stage/prod)  
**Goals:** Reduce log spend, eliminate PII leakage, stabilize dashboards, improve incident response

## Challenge
The engineering org had grown quickly. Teams shipped logs with inconsistent field names/types, and PII occasionally leaked into production logs. Splunk indexes ballooned, dashboards broke each sprint, and audits were painful.

## Solution
The customer adopted **CerbiStream** with governance via **CerbiStream.GovernanceAnalyzer** (build-time) and **Cerbi.MEL.Governance** (runtime). Governance profiles were authored centrally in **CerbiShield (Beta)** and versioned with RBAC.

- **Build-time enforcement:** Roslyn analyzer surfaced precise IDE/CI diagnostics when events violated the profile (e.g., forbidden PII fields, missing correlation IDs).
- **Runtime relax-mode:** Validators redacted sensitive values while preserving events and tagging violations for follow-up—no lost signals.
- **Stable schema:** Contracted field names/types and enums enabled durable dashboards and cleaner joins across services.

## Results (first 60 days)
- **-28% ingestion cost** from reduced high-cardinality fields and removal of duplicate/noisy attributes.  
- **0 PII incidents** in production logs after rollout.  
- **Faster triage:** Consistent app/env/tenant/trace identifiers improved cross-service correlation and MTTR.  
- **Audit-ready:** Versioned profiles and violation metadata satisfied audit requests in hours (not weeks).

## Rollout Plan
1. Start with the **auth domain**. Enable analyzer in CI and ship runtime validators in **relax-mode**.  
2. Fix top violations and align field names/types; ship profile updates via CerbiShield.  
3. Expand to **claims** and **payments** domains; tighten enforcement.  
4. Establish durable organization-wide dashboards using stable, governed fields.

## Architecture Fit
- Keep existing sinks (Splunk/ELK/Datadog). Cerbi improves what they receive.  
- Works alongside Serilog/NLog or as a native MEL structured logger.  
- Profiles are JSON, versioned, and environment-aware.

## Takeaway
**Governed at the source** beats downstream cleanup. Cerbi delivered lower cost, fewer incidents, and audit-ready evidence—without vendor lock-in.
