---
title: "Governance Analyzer Library"
description: "Technical overview of the CerbiStream.GovernanceAnalyzer library architecture and runtime helper components."
permalink: "/docs/governance-analyzer-library"
layout: "public_doc"
---

# Governance Analyzer Library

This document summarises the internal architecture of the CerbiStream.GovernanceAnalyzer library. The package combines a build‑time Roslyn analyzer with runtime validation helpers and configuration loading. These components work together to enforce Cerbi governance profiles both during compilation and at runtime.

## Components

- **Analyzer**: A Roslyn analyzer (in the `ClassLibrary1` project) reports diagnostics such as `CERBI001`–`CERBI00x` when log calls don’t meet the active profile (missing required fields, forbidden fields, invalid types or enums, missing topics, etc.).
- **Runtime validation**: The helper `GovernanceHelper.TryValidate(...)` performs dynamic checks at runtime, taking a profile and a dictionary of log data and returning a list of failures and impact values.
- **Configuration loader**: `GovernanceConfigLoader` loads and parses the JSON governance file (`cerbi_governance.json`) and optionally watches the file system for changes to support live reload.
- **Models**: The library uses strongly typed models for governance profiles, severities, field types, enum values, encryption settings, topics and relaxation flags; these live in `Cerbi.Governance` and ensure a single source of truth.
- **Plugins**: You can extend the validation rules by implementing `ICustomGovernancePlugin`. Plugins can apply domain‑specific checks against the log payload.

## Data flow

1. During compilation, the analyzer scans structured logging calls (e.g., `_logger.LogInformation("User {userId}", userId)`) and extracts the field names from message templates.
2. The analyzer loads the governance config (default `cerbi_governance.json` or the path specified via an attribute) and resolves the active profile.
3. For each log call, the analyzer checks required and forbidden fields, type and enum rules, and topic requirements; if a rule is violated, it emits a diagnostic.
4. At runtime, your application can call `GovernanceHelper.TryValidate(profile, data, out errors)` to validate dynamic payloads before sending logs to vendors.

## Profiles

Governance profiles define the rules that are enforced:

- **Field severities**: `Required`, `Forbidden`, `Warning` and `Info` determine how strictly each field is treated.
- **Field types**: restrict fields to data types such as `string`, `int`, `bool`, `Guid`, `DateTime` and `float`.
- **Field enums**: define allowed values for a field; the match is case‑insensitive.
- **Encryption settings**: specify the encryption mode and severity for encrypted fields.
- **Topics**: profiles can require a `Topic` string or restrict which topics are allowed.
- **AllowRelax**: enables relaxation mode, allowing optional enforcement of certain rules.

## Threading and reload

The configuration loader debounces file changes before re-parsing the JSON file to avoid thrashing. Unit tests can enable `GovernanceConfigLoader.EnableTestIsolation` and call `ResetAndReload()` to ensure clean state between test cases.

## Modes

The governance runtime can operate in different modes (Permissive, WarnOnly, Strict) to adjust how violations are handled. The analyzer generally emits diagnostics regardless of mode; the runtime validator uses the mode to decide whether to block, warn or allow log events.

## Extensibility

The package is designed to be extensible:

- **Plugins**: implement `ICustomGovernancePlugin` to add custom rules.
- **Fluent builder hooks**: used by CerbiStream and `Cerbi.MEL.Governance` to plug governance into `ILoggingBuilder`.
- **Score shipping**: the runtime provides a `GovernanceScoreShipper` that can batch and send anonymous scoring metadata to CerbiShield or other endpoints, enabling governance posture dashboards without exposing log contents.

For a higher‑level overview and business context, see the governance analyzer overview document. For more examples and integration details, refer to the quick start guides for CerbiStream and MEL governance.
