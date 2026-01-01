# MCP Resources Guide

**Purpose**: Guide for using MCP (Model Context Protocol) resources in Cursor  
**Last Updated**: 2025-01-01

## Overview

This project uses MCP resources for enhanced development capabilities, including security scanning, code quality checks, and service management.

---

## Available MCP Resources

### Semgrep (Security & Code Quality)

**Purpose**: Automated security scanning and code quality checks

**Available Functions**:
- `semgrep_scan` - Scan code files for security vulnerabilities
- `semgrep_scan_local` - Scan local files
- `semgrep_scan_with_custom_rule` - Scan with custom rules
- `security_check` - Fast security check
- `semgrep_findings` - Query existing findings from Semgrep AppSec Platform
- `get_abstract_syntax_tree` - Get AST for code analysis

**Usage Examples**:

```typescript
// Scan files for security issues
mcp_Semgrep_semgrep_scan({
  code_files: [
    { filename: "vercel/components/canvas-background.tsx", content: "..." }
  ],
  config: "p/security-audit"
})

// Use custom rules
mcp_Semgrep_semgrep_scan_with_custom_rule({
  code_files: [...],
  rule: `
    rules:
      - id: no-white-text
        pattern: rgba(255,255,255
        message: "White text detected"
        severity: ERROR
  `
})

// Fast security check
mcp_Semgrep_security_check({
  code_files: [...]
})
```

**Custom Rules**: See `.semgrep-rules.yml` for project-specific rules

---

### TOPs (Capability Broker)

**Purpose**: Service registry, dependency tracking, and health monitoring

**Available Functions**:
- `tops_register_capability` - Register services with broker
- `tops_query_capabilities` - Query available capabilities
- `tops_resolve_dependencies` - Resolve service dependencies
- `tops_get_lineage` - Get dependency lineage graph
- `tops_broker_status` - Check broker connection status
- `tops_broker_http_status` - Check HTTP health endpoints
- `tops_broker_reconnect` - Force broker reconnection
- `tops_mesh_info` - Get mesh orchestration state
- `tops_invoke` - Invoke TOPs resources via tops:// URIs

**Usage Examples**:

```typescript
// Register a service
mcp_tops_register_capability({
  capabilities: [{
    name: "vercel-web-app",
    semantic_version: "1.0.0",
    declared_cost: { primary: 100, secondary: 50, tertiary: 25 },
    dependencies: [...],
    platform: { os: "linux", arch: "amd64" }
  }],
  node_hostname: "vercel-production",
  node_role: "NODE_ROLE_PUBLISHER"
})

// Query capabilities
mcp_tops_query_capabilities({
  client_context: {
    client_class: "CLIENT_CLASS_SERVICE",
    trust_tier: "TRUST_TIER_HIGH"
  }
})

// Check broker health
mcp_tops_broker_status()
mcp_tops_broker_http_status({ endpoint: "both" })
```

**Documentation**: See `docs/ARCHITECTURE.md` for detailed TOPs usage

---

## When to Use Each Resource

### Use Semgrep When:
- ✅ Checking for security vulnerabilities
- ✅ Validating code quality rules
- ✅ Scanning before commits
- ✅ Finding hardcoded secrets
- ✅ Checking for white text violations
- ✅ Verifying accessibility patterns

### Use TOPs When:
- ✅ Registering services
- ✅ Tracking dependencies
- ✅ Monitoring service health
- ✅ Resolving capability dependencies
- ✅ Getting service lineage
- ✅ Checking broker connectivity

---

## Integration with Git Hooks

Semgrep is integrated into git hooks:

- **Pre-commit**: Runs `pre-commit-semgrep` hook
- **GitHub Actions**: Runs `.github/workflows/security-scan.yml`

See `.semgrep-rules.yml` for custom rules.

---

## Best Practices

1. **Run Semgrep before committing**: Use pre-commit hook
2. **Check security regularly**: Use GitHub Actions workflow
3. **Register services with TOPs**: Track dependencies
4. **Monitor broker health**: Check status regularly
5. **Use custom rules**: Project-specific patterns in `.semgrep-rules.yml`

---

## References

- **Semgrep Docs**: https://semgrep.dev/docs
- **TOPs Documentation**: See `docs/ARCHITECTURE.md`
- **Custom Rules**: `.semgrep-rules.yml`
- **Git Hooks**: `.git/hooks/pre-commit-semgrep`

---

**For service architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

