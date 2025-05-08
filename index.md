# CerbiSuite – Unified Logging, Governance & Observability

🔐 **Structured Logging** · 🧠 **Developer‑First Observability** · 🌐 **Cloud‑Native & Portable**

*Modular · Hybrid‑Ready · ML‑Friendly · Dev‑First*

---

## ✨ Why CerbiStream Exists

As applications grow and teams scale—often spanning internal squads, external contractors, and third‑party libraries—logging can become fragmented and inconsistent. That leads to:

* Confusing, unstructured log messages
* Difficult audits and compliance gaps
* Missed insights for monitoring or ML workloads

**CerbiStream** brings order and governance to this chaos by:

1. **Enforcing Structure at the Source**
   Developers use a simple, fluent API to define log schemas. CerbiStream validates against that schema *before* emitting logs.
2. **Providing Modular Capabilities**
   Pick only what you need: encryption, governance, telemetry, benchmarking—no unnecessary bloat.
3. **Enabling Audit‑Ready Compliance**
   Logs can be encrypted, include required fields, and exclude forbidden fields, ensuring HIPAA, GDPR, SOC‑2, and internal policy adherence.
4. **Feeding ML‑Ready Pipelines**
   Consistent metadata formats make logs immediately consumable by analytics or AI/ML services.

---

## 🚀 The Cerbi Ecosystem

CerbiSuite is a cohesive suite of tools, each addressing a critical aspect of enterprise logging:

| Component                          | Status           | Purpose                                                              |
| ---------------------------------- | ---------------- | -------------------------------------------------------------------- |
| **CerbiStream**                    | GA               | Core .NET logger with structured output, encryption, and governance  |
| **CerbiStream.GovernanceAnalyzer** | GA               | Static/dynamic schema validator enforcing rules at build and runtime |
| **CerbiShield**                    | Beta (SaaS Soon) | Governance dashboard UI & enforcement engine                         |
| **CerbIQ**                         | Phase 2 Planned  | Routing, normalization, and fan-out engine for logs                  |
| **CerbiSense**                     | Phase 2 Planned  | ML-driven anomaly detection and trend forecasting from metadata      |

---

## 🔌 Plugin Model & Logger Flexibility

CerbiShield and GovernanceAnalyzer support a **plugin-style enforcement model** that integrates with:

* **Serilog** *(plugin released 5/8/2025)*
* **NLog** *(coming soon)*
* **Microsoft.Extensions.Logging (MEL)** *(coming soon)*

This makes Cerbi governance **logger-agnostic**. It is not centered around CerbiStream—it’s centered around **CerbiShield**, which provides:

* Enforced governance via compile-time and runtime checks
* Required and forbidden field validation
* Live violation reporting in the governance dashboard
* Plugin extensibility for organization-specific rules

Organizations can:

* Continue using their current logger of choice
* Adopt CerbiShield to define and enforce governance without vendor lock-in
* Receive violation analytics to surface risks like:

  * Missing `userId`, `correlationId`, or `timestamp`
  * Accidentally logging `SSN`, `address`, `email`, or other sensitive fields

> "We discovered our app was logging real user addresses and birthdates to production logs only **after** an internal audit. CerbiShield could have prevented that."

This makes Cerbi ideal for:

* Large engineering orgs with distributed logging patterns
* Contracting and multi-team development models
* Enterprises needing GDPR, HIPAA, or SOC‑2 alignment
* Post-incident observability and compliance investigations

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
```

* CerbiShield ensures your teams **don’t forget** to include required fields or avoid PII.
* Logs flow through your existing infrastructure if desired.
* CerbiStream enables structured routing and full CerbIQ/CerbiSense compatibility.

---

Want to fully participate in analytics and ML in the future? CerbiStream will offer full-speed governance and metadata routing to power CerbIQ and CerbiSense.

Want governance enforcement today? CerbiShield is ready and integrates cleanly with your current logger.

Either way, Cerbi gives you insight, enforcement, and structure—on your terms.
