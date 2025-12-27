---
title: "Quick Start — MEL Runtime Governance Only"
description: "Use Cerbi runtime governance with Microsoft.Extensions.Logging."
permalink: /docs/quickstart-mel/
layout: default
---

# Quick Start - MEL Runtime Governance Only

```bash
dotnet add package Cerbi.MEL.Governance
{
  "Cerbi": {
    "GovernanceProfile": "cerbi_governance.json",
    "Mode": "Relax"
  }
}
// .NET Generic Host (Program.cs)
builder.Logging.AddCerbiGovernance("cerbi_governance.json");
```
