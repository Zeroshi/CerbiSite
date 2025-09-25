# Security Overview

- **Architecture**: Source-governed telemetry (build-time analyzer + runtime validator). Encryption options via `IEncryption` (AES/Base64/NoOp).
- **Data minimization**: PII redaction and policy-driven fields; relax-mode preserves signals with violation tags.
- **Access control** (CerbiShield, beta): Role-based access with audit history and profile versioning.
- **Handling sensitive data**: We recommend excluding PII from logs entirely; when needed, mask at source per policy.
- **Reporting**: security@cerbi.io for vulnerabilities. Please include reproduction steps and impact.
