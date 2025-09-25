# Quick Start — Governance Profile

Create `cerbi_governance.json` at the solution root:

```json
{
  "$schema": "https://schemas.cerbi.io/cerbi-governance.schema.json",
  "version": "1.0",
  "rules": {
    "required": ["timestamp", "level", "action", "app", "env", "traceId"],
    "forbidden": ["email", "ssn", "creditCardNumber"],
    "types": {
      "timestamp": "date-time",
      "level": { "enum": ["Trace","Debug","Information","Warning","Error","Critical"] },
      "app": "string",
      "env": { "enum": ["dev","stage","prod"] },
      "traceId": "string"
    }
  },
  "redaction": {
    "email": "hash",
    "ssn": "mask"
  },
  "enforcement": {
    "mode": "relax"  // start with relax; tighten after two sprints
  }
}
```

Enable the analyzer and runtime validator as in the .NET quick start. Violations will be flagged and redacted while you harden the schema.
