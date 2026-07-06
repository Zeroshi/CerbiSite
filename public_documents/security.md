---
title: "Security Overview"
description: "How Cerbi approaches security, privacy, source-side logging governance, and evidence generation."
permalink: /docs/security/
layout: default
last_updated: 2026-07-06
---

# Security Overview

**Last updated:** 2026-07-06

Cerbi products are designed to help teams reduce logging data risk by applying governance before log events reach downstream observability, SIEM, analytics, or storage systems.

This page summarizes Cerbi's security posture and product security model. It is not a compliance certification or legal opinion.

## Source-side logging governance

Cerbi's core security model is source-side governance:

- Evaluate log events before they leave the application boundary.
- Detect sensitive, forbidden, missing, or malformed fields.
- Redact or block risky values according to policy.
- Preserve evidence of which policy evaluated an event.
- Keep existing log routing, SIEM, APM, and observability tools in place.

Cerbi does not replace Splunk, Datadog, Azure Monitor, OpenTelemetry, SIEM platforms, or application logging frameworks. It adds governance before data reaches those systems.

## Data minimization by design

Cerbi encourages teams to avoid putting personal data, credentials, secrets, payment data, protected health information, or other sensitive data into logs.

Where logging sensitive operational signals is business-necessary, Cerbi can help teams classify, redact, block, review, and document fields and exceptions.

## Policy versioning and evidence

CerbiShield can support governance profile IDs, versions, hashes, decisions, enforcement actions, exception details, deployment history, and audit history. These records are intended to support engineering review, security review, audit preparation, and CISO reporting.

## Evidence Center and manifest hash

CerbiShield Evidence Center packages governance, scoring, audit, deployment, violation, and rule records into review-friendly exports. Exports may include CSV and JSON manifest records with a manifest hash.

## Access control and customer environments

CerbiShield may include role-based access controls, tenant-aware APIs, policy management, and customer-controlled deployment patterns. Depending on deployment model, components may run in a customer cloud tenant or customer-controlled environment.

Customers remain responsible for configuring identity, access controls, network controls, logging destinations, retention, and downstream data systems.

## Vulnerability reporting

Please report suspected vulnerabilities to **security@cerbi.io**.

Include the affected product or package, version or commit if known, reproduction steps, expected and actual behavior, potential impact, and whether the issue may expose customer data.

## Compliance-safe positioning

CerbiShield provides source-side logging governance and evidence that can support audit preparation and control review.

Cerbi does not provide legal advice and does not certify DORA, GDPR, CCPA/CPRA, HIPAA, SOC 2, or other regulatory compliance. Customers remain responsible for their own compliance programs, system configuration, policies, notices, retention, and legal obligations.
