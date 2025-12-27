---
title: "MEL Governance Demo"
description: "Walkthrough of the Cerbi.MEL.Governance demo application."
permalink: /docs/mel-governance-demo/
layout: default
---

# Cerbi.MEL.Governance Demo

This demo is a small .NET 8 console application that shows how to integrate Cerbi runtime governance into a `Microsoft.Extensions.Logging` pipeline.

**What it demonstrates:**

- Register and configure the Cerbi governance logger via `AddCerbiGovernance`.
- Define governance rules in a JSON file (`cerbi_governance.json`).
- Route log events to different profiles using `[CerbiTopic]` attributes (e.g., `Orders`, `Payments`).
- Emit the original console log line and an additional JSON payload only when violations occur.
- Detect missing required fields and forbidden fields and report them via governance metadata.

**Prerequisites:**

- .NET 8 SDK and an IDE or terminal that can build and run .NET console apps.

**Getting started:**

1. Clone the `Cerbi.MEL.Governance` repository and navigate to the `Demo` folder.
2. Restore NuGet packages with `dotnet restore`.
3. Create `cerbi_governance.json` in the `Demo` folder with profiles and rules (see the repository for an example).
4. Build and run the demo with `dotnet run --project Cerbi.MEL.Governance.Demo.csproj`.

**How it works:**

- `Program.cs` sets up a host and configures logging. It adds the built‑in console sink and wraps it with Cerbi governance.
- Services like `OrderService` and `PaymentService` are decorated with `[CerbiTopic("Orders")]` and `[CerbiTopic("Payments")]` to direct logs to the appropriate profile.
- Structured logs are validated at runtime using the rules from your JSON file. When logs violate the profile (e.g., missing `userId` or containing a forbidden `password`), a second JSON payload is emitted containing governance metadata such as `GovernanceProfileUsed` and `GovernanceViolations`.
- Valid logs still emit governance metadata (profile used, enforcement mode) so downstream systems can audit compliance.

Use this demo as a template for wiring Cerbi governance into an ASP.NET Core or worker service. Modify the profiles in the JSON file and observe how different violations are detected.
