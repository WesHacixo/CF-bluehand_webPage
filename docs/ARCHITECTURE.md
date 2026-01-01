# Architecture & Service Dependencies

**Bluehand Solutions - Service Architecture Documentation**  
**Last Updated**: 2025-01-01

## Overview

This document describes the service architecture, dependencies, and how to use TOPs (Capability Broker) for service management.

---

## Service Architecture

### Platform Services

```
┌─────────────────────────────────────────────────────────┐
│                    Bluehand Solutions                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   Vercel     │         │  Cloudflare  │             │
│  │  (Next.js)   │         │  (Static)    │             │
│  └──────┬───────┘         └──────┬───────┘             │
│         │                        │                      │
│         └──────────┬─────────────┘                      │
│                    │                                     │
│         ┌──────────▼──────────┐                         │
│         │   Shared Assets     │                         │
│         │   (Platform-as-a-   │                         │
│         │    Contract)        │                         │
│         └─────────────────────┘                         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Service Components

#### Vercel Service (Next.js)
- **Type**: React/Next.js Application
- **Framework**: Next.js 16
- **Components**: Modular React components
- **Features**: 
  - Interactive canvas
  - Contact forms
  - Service modals
  - Theme system

#### Cloudflare Service (Static)
- **Type**: Static HTML
- **Framework**: Vanilla JavaScript
- **Features**:
  - Single-page site
  - Embedded canvas
  - Optimized for CDN

#### Shared Assets Service
- **Type**: Platform-as-a-Contract (PaaC)
- **Location**: `assets/` directory on `main` branch
- **Purpose**: Shared brand assets across platforms
- **Contents**: Logos, icons, images

---

## TOPs Service Management

### Service Registration

**Purpose**: Register services with TOPs capability broker for dependency tracking.

**Example Registration**:
```typescript
// Register Vercel service
mcp_tops_register_capability({
  capabilities: [
    {
      name: "vercel-web-app",
      semantic_version: "1.0.0",
      declared_cost: {
        primary: 100,
        secondary: 50,
        tertiary: 25
      },
      dependencies: [
        {
          capability_name: "shared-assets",
          mode: "DEPENDENCY_MODE_PIN",
          pin_version: "1.0.0"
        }
      ],
      platform: {
        os: "linux",
        arch: "amd64"
      },
      safety_class: "SAFETY_CLASS_NETWORK_OK"
    }
  ],
  node_hostname: "vercel-production",
  node_role: "NODE_ROLE_PUBLISHER"
})
```

### Dependency Resolution

**Query Dependencies**:
```typescript
// Resolve dependencies for a capability
mcp_tops_resolve_dependencies({
  capability_id: "vercel-web-app-uuid",
  lane: "RESOLUTION_LANE_CANONICAL",
  max_depth: 3
})
```

**Get Lineage**:
```typescript
// Get dependency lineage graph
mcp_tops_get_lineage({
  capability_id: "vercel-web-app-uuid",
  max_depth: 5,
  client_context: {
    client_class: "CLIENT_CLASS_SERVICE",
    trust_tier: "TRUST_TIER_HIGH"
  }
})
```

### Health Monitoring

**Check Broker Status**:
```typescript
// Check broker connection
mcp_tops_broker_status()

// Check HTTP health endpoints
mcp_tops_broker_http_status({ endpoint: "both" })

// Get mesh information
mcp_tops_mesh_info()
```

**Query Capabilities**:
```typescript
// Query available capabilities
mcp_tops_query_capabilities({
  client_context: {
    client_class: "CLIENT_CLASS_SERVICE",
    trust_tier: "TRUST_TIER_MEDIUM"
  },
  include_deprecated: false
})
```

---

## Service Dependencies

### Dependency Graph

```
vercel-web-app
├── shared-assets (v1.0.0)
│   └── brand-logos
│   └── icons
│   └── images
├── nextjs-framework (v16.0.10)
│   ├── react (v19.2.0)
│   └── react-dom (v19.2.0)
└── radix-ui-components
    └── dialog
    └── dropdown-menu
    └── ...

cloudflare-static
├── shared-assets (v1.0.0)
│   └── brand-logos
│   └── icons
│   └── images
└── vanilla-js
    └── canvas-api
    └── dom-api
```

---

## Best Practices

### Service Registration

1. **Version Semantically**: Use semantic versioning (major.minor.patch)
2. **Document Dependencies**: List all required capabilities
3. **Specify Platform**: Include OS and architecture requirements
4. **Set Safety Class**: Appropriate safety classification
5. **Update Regularly**: Keep capability versions current

### Dependency Management

1. **Pin Critical Dependencies**: Use PIN mode for shared assets
2. **Use Ranges for Flexibility**: RANGE mode for framework deps
3. **Track Versions**: Monitor dependency versions
4. **Test Updates**: Verify compatibility before updating

### Health Monitoring

1. **Regular Checks**: Monitor broker status daily
2. **Alert on Issues**: Set up alerts for service failures
3. **Track Metrics**: Monitor capability availability
4. **Document Incidents**: Record service issues

---

## References

- **TOPs Documentation**: `docs/MCP_RESOURCES_GUIDE.md` (TOPs section)
- **Service Registry**: TOPs mesh registry
- **Health Monitoring**: TOPs broker health endpoints
- **Dependency Resolution**: TOPs dependency resolution API

---

**For more information, see [MCP Resources Guide](./MCP_RESOURCES_GUIDE.md)**

