---
title: "Runtime Governance for MEL"
description: "Overview of the Cerbi.MEL.Governance library for Microsoft.Extensions.Logging."
permalink: /docs/mel-governance/
layout: default
---

# Cerbi.MEL.Governance Overview

**Purpose:** Provide runtime governance enforcement for applications using `Microsoft.Extensions.Logging` (MEL). This library wraps existing logging providers to validate structured log fields against governance rules before events are emitted.

**Key features:**

- Requires or forbids fields in structured log payloads based on JSON governance profiles.
- Supports type and enum validation for log fields.
- Uses `[CerbiTopic]` attribute (or a default profile) to select a profile.
- Adds governance metadata such as `GovernanceProfileUsed`, `GovernanceViolations`, `GovernanceMode`, etc.
- Optional relaxation mode and runtime scoring.
- Hot reload of governance JSON and plugin extensibility.

**Installation:**

```
dotnet add package Cerbi.MEL.Governance
```

**Usage:**

Wrap your logging configuration in `AddCerbiGovernance`, specifying the path to your governance JSON and default profile. For example:

```
builder.Logging.AddCerbiGovernance(opts =>
{
    opts.Profile = "Orders";
    opts.ConfigPath = "cerbi_governance.json";
    opts.Enabled = true;
});
```

Decorate services or classes with `[CerbiTopic("ProfileName")]` to route logs to specific profiles.

**Notes:**

- Cerbi.MEL.Governance is compatible with all MEL-based loggers and can be combined with Serilog, NLog and OpenTelemetry sinks.
- It emits a second JSON line only when violations occur; normal console output is preserved.
- See the associated quick start for a hands-on example.
