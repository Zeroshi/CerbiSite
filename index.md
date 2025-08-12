# CerbiSuite – Unified Logging, Governance & Observability

🔐 **Structured Logging** · 🧠 **Developer-First Observability** · 🌐 **Cloud-Native & Portable**

*Modular · Hybrid-Ready · ML-Friendly · Dev-First*

---

## ✨ Why CerbiStream Exists

As applications grow and teams scale—often spanning internal squads, external contractors, and third-party libraries—logging can become fragmented and inconsistent. This leads to:

- Confusing, unstructured log messages
- Difficult audits and compliance gaps
- Missed insights for monitoring or ML workloads

**CerbiStream** brings order and governance to this chaos by:

1. **Enforcing Structure at the Source**  
   Developers use a simple, fluent API to define log schemas, and CerbiStream validates against that schema *before* emitting logs.

2. **Providing Modular Capabilities**  
   Pick only what you need: encryption, governance, telemetry, benchmarking—no unnecessary bloat.

3. **Enabling Audit-Ready Compliance**  
   Logs can be encrypted, include required fields, and exclude forbidden fields, ensuring HIPAA, GDPR, SOC-2, and internal policy adherence.

4. **Feeding ML-Ready Pipelines**  
   Consistent metadata formats make logs immediately consumable by analytics or AI/ML services.

---

## 🚀 The Cerbi Ecosystem

CerbiSuite is a cohesive suite of tools, each addressing a critical aspect of enterprise logging:

| Component                          | Status           | Purpose                                                              |
| ----------------------------------- | ---------------- | -------------------------------------------------------------------- |
| **CerbiStream**                    | GA               | Core .NET logger with structured output, encryption, and governance  |
| **CerbiStream.GovernanceAnalyzer** | GA               | Static/dynamic schema validator enforcing rules at build and runtime |
| **CerbiShield**                    | Beta (SaaS Soon) | Governance dashboard UI & enforcement engine                         |
| **CerbIQ**                         | Phase 2 Planned  | Routing, normalization, and fan-out engine for logs                  |
| **CerbiSense**                     | Phase 2 Planned  | ML-driven anomaly detection and trend forecasting from metadata      |

---

## 🔌 Plugin Model & Logger Flexibility

CerbiShield and GovernanceAnalyzer support a **plugin-style enforcement model** that integrates with:

- **Serilog** *(plugin released 5/8/2025)*
- **NLog** *(coming soon)*
- **Microsoft.Extensions.Logging (MEL)** *(coming soon)*

This makes Cerbi governance **logger-agnostic**. It is not centered around CerbiStream—it’s centered around **CerbiShield**, which provides:

- Enforced governance via compile-time and runtime checks
- Required and forbidden field validation
- Live violation reporting in the governance dashboard
- Plugin extensibility for organization-specific rules

---

### ✅ What Works Best for Your Team?

Cerbi was built to meet teams where they are—whether you’re managing legacy services with **Serilog** or modernizing with **CerbiStream**.

You're absolutely right—**Serilog** **does** support telemetry routing and enrichment via widely used sinks and enrichers, including:

- `Serilog.Sinks.ApplicationInsights`
- `Serilog.Sinks.OpenTelemetry`
- `Serilog.Enrichers.*` for machine name, thread ID, and more

It may not be **built-in** to the governance plugin, but it’s fully **supported** in the Serilog ecosystem—just like encryption and file fallback.

Also, great callout: **CerbiStream** has **built-in rollup and grouping support** (e.g., for multi-app environments reporting to a single governance score), which is important for CerbiShield’s analytics pipeline.

Here’s the corrected and fair comparison:

---

### 🔍 Logger Governance Comparison

Cerbi governance works with both modern and established logging frameworks. Whether you use **CerbiStream** or **Serilog**, enforcement is driven by the same governance profiles and CerbiShield dashboard.

| Capability                            | **CerbiStream** *(Modern Default)* | **Serilog + Governance Plugin** *(Available Now)*  |
| ------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| **Build-Time Governance Enforcement** | ✅ Roslyn Analyzer integrated       | ❌ Not supported                                    |
| **Runtime Governance Enforcement**    | ❌ Not applicable                   | ✅ Via `Cerbi.Serilog.GovernanceAnalyzer`           |
| **Encryption Support (AES, Base64)**  | ✅ Built-in                         | ❌ Not included                                     |
| **File Fallback Logging**             | ✅ `WithFileFallback()` available   | ✅ Supported via `Serilog.Sinks.File`               |
| **Telemetry Routing & Enrichment**    | ✅ Built-in (App Insights, OTel)    | ✅ Supported via Serilog sinks & enrichers          |
| **ML / CerbIQ Compatibility**         | ✅ Schema-aligned automatically     | ✅ Requires matching metadata (CerbiShield assists) |
| **Governance Profile Reloading**      | ✅ Supported                        | ✅ Supported                                        |
| **Custom Rule Plugins**               | ✅ Supported                        | ✅ Via `ICustomGovernancePlugin`                    |
| **App Rollup / Grouping Support**     | ✅ Built-in                         | ⚠️ External design needed                          |

---

**Already on Serilog?**  
You can adopt governance today using the Cerbi plugin — no need to rip out your existing logger.

**Modernizing your platform?**  
CerbiStream gives you structure, compliance, and full compatibility with future CerbIQ and CerbiSense tools—all enforced at build time for maximum control and performance.

> 🧩 CerbiShield governance works with both options — ensuring consistent enforcement regardless of your logging library.

Organizations can:

- Continue using their current logger of choice
- Adopt CerbiShield to define and enforce governance without vendor lock-in
- Receive violation analytics to surface risks like:

  - Missing `userId`, `correlationId`, or `timestamp`
  - Accidentally logging `SSN`, `address`, `email`, or other sensitive fields

> "We discovered our app was logging real user addresses and birthdates to production logs only **after** an internal audit. CerbiShield could have prevented that."

This makes Cerbi ideal for:

- Large engineering orgs with distributed logging patterns
- Contracting and multi-team development models
- Enterprises needing GDPR, HIPAA, or SOC-2 alignment
- Post-incident observability and compliance investigations

> **Need help preparing for GDPR or HIPAA audits?** CerbiShield includes compliance starter kits and audit-friendly profiles to jumpstart your governance baseline.

> **Note:** Future components CerbIQ and CerbiSense will require logs to follow the CerbiStream-compatible JSON schema. If you use another logger, you must emit conforming metadata (`originApp`, `accessScope`, etc.).

Whether you're using Serilog, NLog, MEL, or CerbiStream directly, CerbiShield provides the **business-critical layer** of control, compliance, and consistency.

---

## 📐 Architecture & Flow

```text
Application (Serilog / NLog / MEL / CerbiStream)
        │
        ▼
CerbiShield Plugin / Analyzer (Required / Forbidden Field Enforcement)
        │
        ├──▶ Logs go to your standard sinks (console, file, Splunk, etc.)
        │
        └──▶ (optional) CerbiStream → CerbIQ → CerbiSense (Phase 2)
                        │        │
                        ▼        ▼
                   Governance    ML Analytics
                   Routing       Scoring & Trends
