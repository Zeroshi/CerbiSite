---
title: "Runtime Governance"
description: "Overview of the Cerbi.Governance.Runtime library for validating log payloads at runtime."
permalink: /docs/governance-runtime/
layout: default
---

# Cerbi.Governance.Runtime Overview

**Purpose:** This library performs real‑time governance enforcement for structured logging pipelines. It validates and annotates log payloads at runtime using governance profiles so that only compliant events are emitted.

**Key features:**

- **Field severities** – Define fields as `Required`, `Forbidden`, `Warning`, or `Info` and enforce them on every log.
- **Type & enum validation** – Ensure fields conform to expected types (string, int, bool, Guid, DateTime, float) and enumerated value lists.
- **Topic & profile selection** – Require topics and infer them via `[CerbiTopic]` attributes or a default profile name.
- **Compiled rules & high performance** – Per‑field rules are compiled for low allocation overhead; validation mutates the log in place.
- **Relaxation mode** – Opt‑in per profile to allow `GovernanceRelaxed = true`, bypassing enforcement while still tagging events.
- **Hot reload & configuration** – Supports hot reloading of the JSON governance file with configurable polling interval.
- **Runtime scoring** – Optionally compute a score impact for each violation; weights are configurable per severity and plugin.
- **Score shipping** – Asynchronously ship scoring envelopes to CerbiShield Governance APIs via a channel, with batching and retries.
- **Extensibility** – Implement `IRuntimeGovernanceSource` to load profiles from other backends or `IRuntimeGovernancePlugin` to contribute to scoring.

**Installation:**

```
dotnet add package Cerbi.Governance.Runtime
```

**Basic usage:**

Instantiate a `RuntimeGovernanceValidator` with a lambda to enable/disable enforcement, the profile name and the governance JSON path, then call `ValidateInPlace` on your log dictionary:

```
var validator = new RuntimeGovernanceValidator(
    isEnabled: () => true,
    profileName: "Orders",
    source: new FileGovernanceSource("cerbi_governance.json"));

var log = new Dictionary<string, object>
{
    ["userId"] = "abc123",
    ["email"] = "user@example.com",
    ["Status"] = "Failed"
};

validator.ValidateInPlace(log); // Mutates log with governance metadata and violations
```

For integration with `ILogger`, use the extension methods from the Cerbi runtime packages to automatically enrich logs with governance metadata.

To enable score shipping, configure a `ScoreShippingOptions` and pass it to a `ScoreShipper` instance:

```
var shipOpts = new ScoreShippingOptions
{
    Enabled = true,
    LicenseAllowsScoring = true,
    Endpoint = "https://tenant/api/governance/scores"
};
var shipper = new ScoreShipper(shipOpts);
// register shipper with your logging builder
```

**Governance JSON example:**

A typical governance file defines an enforcement mode (`Strict`, `WarnOnly`, `Permissive`) and one or more logging profiles with field severities, types, enums, allowed topics and relaxation settings. See the runtime repository for full examples.

**Relaxation mode:**

If `AllowRelax` is true in a profile, a producer can set `GovernanceRelaxed = true` on a log payload to bypass enforcement and scoring. Metadata tags are still emitted so downstream systems know relaxation occurred.

This summary covers the publicly shareable aspects of the `Cerbi.Governance.Runtime` library. Refer to the repository README for more detailed API descriptions and change logs.
