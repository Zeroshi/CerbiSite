---
title: "Security Overview"
description: "How Cerbi approaches security, privacy, and safe telemetry."
permalink: /docs/security/
layout: default
---

# Security Overview

**Architecture**
- Source-governed telemetry: build-time analyzer + runtime validator
- Encryption via `IEncryption` implementations: AES, Base64, or NoOp
- File fallback with rotation for resilient logging

**Data minimization**
- PII redaction controlled by policy
- Relax mode preserves signals while tagging violations
- Stable schemas reduce accidental leakage

**Access control (CerbiShield, beta)**
- Role-based access control (RBAC)
- Profile versioning with audit history and rollbacks

**Handling sensitive data**
- Recommended: exclude PII from logs entirely
- If business-necessary, mask at source per policy and document justification

**Reporting**
- Please report vulnerabilities to **security@cerbi.io**
- Include reproduction steps, expected vs. actual behavior, and impact
- We will acknowledge receipt and follow up with status updates
