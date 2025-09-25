# Quick Start — MEL Runtime Governance Only

```
dotnet add package Cerbi.MEL.Governance

```

**appsettings.json (example)**

```
{
  "Cerbi": { "GovernanceProfile": "cerbi_governance.json", "Mode": "Relax" }
}

```

**Startup**

```
builder.Logging.AddCerbiGovernance("cerbi_governance.json");

```

Violations are redacted and tagged; events continue to flow for visibility.
