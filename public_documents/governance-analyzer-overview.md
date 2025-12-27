---
title: "Governance Analyzer Overview"
description: "High-level overview of CerbiStream.GovernanceAnalyzer: compile-time and runtime guardrails for logging governance."
permalink: "/docs/governance-analyzer-overview"
layout: "public_doc"
---

# CerbiStream Governance Analyzer – Overview

CerbiStream.GovernanceAnalyzer is a .NET Roslyn analyzer plus helper library that enforces Cerbi governance profiles at **build time** and assists runtime governance. It acts as a guardrail to ensure structured logging stays compliant with your policies, without forcing you to change your existing log frameworks or vendors.

## What it is

This package serves as the compile‑time and runtime enforcement layer for the CerbiSuite ecosystem. It keeps your logs compliant, predictable and cheaper by validating log usage against JSON governance profiles.

- **CTO / leadership**: ensures logs conform to a defined schema and reduces ingestion costs.
- **Platform & SRE**: keeps dashboards stable and provides a scoreable governance posture.
- **Security & compliance**: enforces PII/PHI rules at the source and creates an audit trail.
- **Engineering leads**: gives developers actionable diagnostics in their IDE, catching schema drift early.

You continue to use your existing logging frameworks (Serilog, NLog, Microsoft.Extensions.Logging) and log vendors (Splunk, Datadog, ELK, Grafana, etc.); the analyzer makes sure the data sent to them is governed.

## Where it fits

CerbiStream.GovernanceAnalyzer is the build‑time enforcement layer in the CerbiSuite stack:

- **CerbiStream** – structured logger with governance metadata (runtime).
- **Cerbi.Governance.Core / Runtime** – shared models and runtime validator.
- **CerbiStream.GovernanceAnalyzer** – this NuGet package; Roslyn analyzers and config loader for compile‑time enforcement and runtime helpers.
- **CerbiShield** – the control plane and dashboards for governance scoring (separate product).

You use the analyzer when you want your CI/build to block schema drift and risky fields before code is deployed.

## Business value

### Platform & SRE

- Stable dashboards: governance profiles guarantee field names and types so charts don’t break every sprint.
- Lower MTTR: consistent `app`, `env`, `tenant` and correlation fields make log joins trivial.
- Vendor‑agnostic: govern once, keep routing to your existing log platforms.

### Security & compliance

- Policy as JSON: required/forbidden/sensitive fields are versioned like code.
- PII/PHI control: analyzers and runtime validators catch violations early.
- Audit evidence: CerbiShield can show which policy was enforced where and when.

### Engineering & tech leads

- Governance without ceremony: install a NuGet package and add a JSON file; developers receive compiler diagnostics automatically.
- Safer refactors: analyzer rules stop accidental schema drift (renames, type changes, extra PII fields).
- Faster onboarding: new engineers follow governance by default, guided by compiler hints.

## Technical overview

At a high level, CerbiStream.GovernanceAnalyzer:

1. Loads a governance config from `cerbi_governance.json` (or a custom path).
2. Exposes that config through `GovernanceConfigLoader` and `GovernanceHelper`.
3. Provides Roslyn analyzers (e.g., `LogGovernanceAnalyzer`) that scan structured log calls, extract field names and compare them against the active profile; diagnostics are emitted if required fields are missing, forbidden fields are present, enums or types are invalid, or a topic is missing.
4. Offers runtime helpers and fluent builder hooks used by CerbiStream and `Cerbi.MEL.Governance` to integrate governance into `ILoggingBuilder`.

Under the hood it uses models from `Cerbi.Governance` (field severities, enum rules, type rules, encryption settings and relaxation options) as the single source of truth.

## Quick start

### Install the analyzer

```
dotnet add package CerbiStream.GovernanceAnalyzer
```

You can install it directly into each project or via central package management (Directory.Packages.props).

### Add a governance profile

Create a `cerbi_governance.json` file with your policy (see example in quick start for CerbiStream) and check it into source control.

### Configure the analyzer

By default the analyzer looks for `cerbi_governance.json` in the project root or a `config/` folder. You can override the path via an assembly attribute:

```csharp
using Cerbi.Governance;

[assembly: CerbiGovernanceConfig("config/cerbi_governance.json")]
```

### Write governed log calls

With the analyzer enabled, structured logging calls such as:

```csharp
_logger.LogInformation("User {userId} logged in with password {password}", userId, password);
```

are checked at compile time. Diagnostics like `CERBI001` (missing required field) or `CERBI002` (forbidden field present) appear in your IDE and CI builds when violations occur.

## Runtime integration

Although the focus is build‑time enforcement, this package also includes runtime helpers. When used with CerbiStream or the MEL plugin, you can configure governance and score shipping like this:

```csharp
builder.Logging.AddCerbiGovernance(cerbi => cerbi
    .WithConfigFile("cerbi_governance.json")
    .UseProfile("PIILog")
    .WithBalancedScoreShipping(
        endpoint: "https://api.cerbi.io/scores",
        licenseKey: builder.Configuration["Cerbi:LicenseKey"]));
```

This wires up the config loader, wraps your existing logger providers and ships governance scores (not payloads) to CerbiShield. Health metrics (total enqueued, flushed, drop rate, etc.) are available via the score shipper and can be exposed through your telemetry.

## Next steps

For a deeper look at the runtime library and architecture, see the companion document on the governance analyzer library. For product information, governance dashboards and pricing, visit [cerbi.io](https://cerbi.io) or contact [hello@cerbi.io](mailto:hello@cerbi.io).
