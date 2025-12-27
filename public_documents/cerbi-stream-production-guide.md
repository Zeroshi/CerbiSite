---
title: "CerbiStream Production Guide"
description: "Summary of the production-ready guide for deploying CerbiStream with governance."
permalink: /docs/cerbi-stream-production-guide/
layout: default
---

# CerbiStream Production Guide

This page summarizes the official **CerbiStream production guide** from the Cerbi‑CerbiStream repository. The guide covers how to deploy CerbiStream into a .NET environment and operate it at scale.

**Overview**

- **Architecture** – CerbiStream injects governance metadata into structured logs at compile time and runtime. It sits on top of your existing log sink (Serilog, NLog, MEL) and doesn’t replace your log platform.
- **Deployment** – Use the provided NuGet package in your application. Provide a governance JSON file (e.g., `cerbi_governance.json`) and set environment variables for environment (`ENV`), application name, and tenant. Deploy the CerbiStream runtime alongside your service.
- **Configuration & Options** – The production guide details options for runtime scoring, relaxation mode, profile selection, hot reload of configuration and plugin hooks. Most settings are exposed through a simple builder or configuration file.
- **Observability & Metadata** – CerbiStream adds tags such as `GovernanceProfileUsed`, `GovernanceEnforced`, `GovernanceViolations`, `GovernanceMode`, and optional `GovernanceScoreImpact`. These fields allow downstream systems to understand which policies were applied.
- **Operations & Troubleshooting** – Validate that your governance JSON file is correct and that required environment variables are set. Enable logging for the governance pipeline to diagnose missing fields, forbidden keys or type mismatches. Review the sample logs in the production guide for examples.
- **Security** – Store governance profiles and secrets securely. Only grant write access to governance configuration to authorized administrators. Keep the CerbiStream package up to date with the latest security patches.

For full details, refer to the source production guide in the Cerbi‑CerbiStream repository.
