# Code Quality Review: canvas-playground.tsx

**Date:** 2025-12-30
**Component:** `vercel/components/canvas-playground.tsx`
**Lines:** 1043
**Review Type:** Comprehensive Code Quality Audit

---

## Executive Summary

**Overall Grade: B+**

The component is well-structured and implements sophisticated physics and rendering logic. However, there are several performance optimizations, memory management improvements, and code quality enhancements that should be addressed.

**Critical Issues:** 2
**High Priority:** 5
**Medium Priority:** 8
**Low Priority:** 4

---

## Critical Issues 🔴

### 1. **Resize Function Uses Container Instead of Canvas** (Line 140-160)

**Issue:**
```typescript
const resize = () => {
  const rect = container.getBoundingClientRect() // ❌ Uses container, not canvas
  // ...
}
```

**Problem:**
- Container includes header, buttons, and padding
- Canvas element has fixed height (`h-[280px] sm:h-[360px]`)
- Resize uses wrong dimensions, causing layout issues
- **This is the root cause of the canvas growth bug**

**Fix:**
```typescript
const resize = () => {
  const rect = canvas.getBoundingClientRect() // ✅ Use canvas element
  // Add bounds checking
  const W = Math.max(100, Math.min(Math.floor(rect.width), 4096))
  const H = Math.max(100, Math.min(Math.floor(rect.height), 4096))
  // ...
}
```

**Impact:** High - Causes crashes and layout issues

---

### 2. **Missing Dimension Validation in Animation Loop** (Line 296)

**Issue:**
```typescript
const { W, H } = dimensionsRef.current
ctx.clearRect(0, 0, W, H) // ❌ No validation
```

**Problem:**
- If dimensions are 0 or invalid, canvas operations fail silently
- Can cause rendering glitches or crashes

**Fix:**
```typescript
const { W, H } = dimensionsRef.current
if (W <= 0 || H <= 0) return // ✅ Early exit
ctx.clearRect(0, 0, W, H)
```

**Impact:** High - Can cause crashes

---

## High Priority Issues 🟠

### 3. **O(n²) Cluster Detection Algorithm** (Lines 365-412)

**Issue:**
```typescript
for (let i = 0; i < nodes.length; i++) {
  // ...
  for (let j = i + 1; j < nodes.length && nearby.length < 4; j++) {
    // O(n²) complexity
  }
}
```

**Problem:**
- With 5000 nodes, this is 25 million iterations per frame
- Runs every frame (60fps)
- Major performance bottleneck

**Fix:**
- Use spatial partitioning (quadtree or grid)
- Only check nearby nodes within threshold
- Cache cluster assignments

**Impact:** High - Performance degradation with many nodes

---

### 4. **O(n²) Connection Detection** (Lines 854-880)

**Issue:**
```typescript
for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {
    // O(n²) connection check
  }
}
```

**Problem:**
- Same O(n²) issue as cluster detection
- Runs every frame
- With 5000 nodes = 12.5 million distance calculations per frame

**Fix:**
- Spatial partitioning
- Only check nodes within `maxDist`
- Use distance-squared comparison (avoid `sqrt` until needed)

**Impact:** High - Major performance bottleneck

---

### 5. **Gradient Creation Every Frame** (Lines 832-837, 942-944, 964-966)

**Issue:**
```typescript
// Created every frame for every dyad/node
const gradient = ctx.createLinearGradient(...)
const gradient = ctx.createRadialGradient(...)
```

**Problem:**
- Gradients are expensive to create
- Created repeatedly for same values
- No caching

**Fix:**
- Cache gradients by key (e.g., `gradient-${r}-${g}-${b}-${alpha}`)
- Only recreate when values change
- Use object pool pattern

**Impact:** Medium-High - Unnecessary allocations

---

### 6. **Missing Resize Debouncing** (Line 163)

**Issue:**
```typescript
window.addEventListener("resize", resize) // ❌ No debouncing
```

**Problem:**
- Resize fires many times during window resize
- Each call recalculates dimensions and seeds nodes
- Can cause performance issues and layout thrashing

**Fix:**
```typescript
let resizeTimeout: number | null = null
const debouncedResize = () => {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = window.setTimeout(resize, 100)
}
window.addEventListener("resize", debouncedResize)
```

**Impact:** Medium-High - Performance during window resize

---

### 7. **Potential Memory Leak: Cluster Maps Not Cleaned** (Lines 59, 63)

**Issue:**
```typescript
const clusterRotationsRef = useRef<Map<number, number>>(new Map())
const dyadsRef = useRef<Map<number, {...}>>(new Map())
```

**Problem:**
- Maps grow indefinitely if clusters/dyads aren't properly cleaned
- Old cluster IDs accumulate
- No periodic cleanup

**Fix:**
- Add periodic cleanup of orphaned cluster rotations
- Verify cluster cleanup logic is working correctly
- Add size limits with LRU eviction

**Impact:** Medium-High - Memory leak over time

---

## Medium Priority Issues 🟡

### 8. **Inefficient Array Operations** (Lines 114-127, 699)

**Issue:**
```typescript
// Creates new array, sorts entire array, then slices
const sorted = [...nodesRef.current].sort(...)
nodesRef.current = sorted.slice(0, MAX_NODES)

// Array.splice in loop
nodes.splice(i, 1)
```

**Problem:**
- `[...nodes]` creates full copy (expensive with 5000 nodes)
- `splice` in loop is O(n²) worst case
- Should use reverse iteration with manual removal

**Fix:**
```typescript
// Use in-place partial sort or heap
// Or use reverse iteration for removal
for (let i = nodes.length - 1; i >= 0; i--) {
  if (shouldRemove(nodes[i])) {
    nodes[i] = nodes[nodes.length - 1]
    nodes.pop()
  }
}
```

**Impact:** Medium - Performance with large arrays

---

### 9. **Repeated Distance Calculations** (Throughout)

**Issue:**
```typescript
const dist = Math.sqrt(dx * dx + dy * dy) // Called many times
```

**Problem:**
- `Math.sqrt` is expensive
- Often only need distance-squared for comparisons
- Should compare squared distances first

**Fix:**
```typescript
const distSq = dx * dx + dy * dy
if (distSq < maxDistSq) { // Compare squared first
  const dist = Math.sqrt(distSq) // Only sqrt when needed
}
```

**Impact:** Medium - Many sqrt calls per frame

---

### 10. **Missing Error Boundaries** (No Error Handling)

**Issue:**
- No try-catch blocks in animation loop
- Canvas operations can fail (e.g., invalid dimensions)
- Errors crash entire component

**Fix:**
```typescript
const step = (t: number) => {
  try {
    // ... animation logic
  } catch (error) {
    console.error('Canvas animation error:', error)
    // Graceful degradation or recovery
  }
}
```

**Impact:** Medium - Crashes on edge cases

---

### 11. **Unused Property** (Line 24)

**Issue:**
```typescript
rotationAngle?: number // Current rotation angle for this cluster
```

**Problem:**
- Property defined but never used
- Rotation stored in `clusterRotationsRef` instead

**Fix:**
- Remove unused property
- Or document why it exists

**Impact:** Low-Medium - Code clarity

---

### 12. **Magic Numbers Throughout** (Many locations)

**Issue:**
```typescript
if (currentPulse > 0.2) // What does 0.2 mean?
if (speed > 15) // Why 15?
const margin = 20 // Why 20?
```

**Problem:**
- Hard to understand and modify
- No documentation
- Inconsistent thresholds

**Fix:**
```typescript
const PULSE_THRESHOLD = 0.2
const FAST_DRAG_THRESHOLD = 15
const BOUNDARY_MARGIN = 20
```

**Impact:** Medium - Maintainability

---

### 13. **Inconsistent Indentation** (Line 426-484)

**Issue:**
```typescript
for (const [idA, clusterA] of clusters.entries()) {
  if (clusterA.length !== 4) continue

// Calculate cluster A center  // ❌ Wrong indentation
let cxA = 0, cyA = 0
```

**Problem:**
- Inconsistent indentation in dyad detection
- Makes code harder to read

**Fix:**
- Fix indentation to match nesting level

**Impact:** Low-Medium - Code readability

---

### 14. **Missing Type Safety** (Line 651)

**Issue:**
```typescript
const positionAlongEdge = (n.baseX! * dirX + n.baseY! * dirY) / 100
```

**Problem:**
- Uses non-null assertion (`!`) without checking
- Could be undefined if node not in cluster

**Fix:**
```typescript
if (n.baseX === undefined || n.baseY === undefined) continue
const positionAlongEdge = (n.baseX * dirX + n.baseY * dirY) / 100
```

**Impact:** Medium - Type safety

---

### 15. **Color String Template Inefficiency** (Line 872)

**Issue:**
```typescript
ctx.strokeStyle = `rgba(${r + a.hue}, ${g}, ${b.hue > 0 ? b : b}, ${alpha})`
```

**Problem:**
- Ternary `b.hue > 0 ? b : b` is always `b` (redundant)
- String template created every frame
- Could cache color strings

**Fix:**
```typescript
ctx.strokeStyle = `rgba(${r + a.hue}, ${g}, ${b}, ${alpha})`
// Or cache: const colorKey = `${r}-${g}-${b}-${alpha}`
```

**Impact:** Low-Medium - Minor inefficiency

---

## Low Priority Issues 🟢

### 16. **Large useEffect Dependency Array** (Line 989)

**Issue:**
```typescript
}, [makeNode, spawnCluster, themeColor, mode, sealPulse, burst, setTheme])
```

**Problem:**
- Effect re-runs when any dependency changes
- Could cause unnecessary re-initialization
- `themeColor` is derived, not needed in deps

**Fix:**
- Review if all deps are necessary
- Consider splitting into multiple effects
- `themeColor` can be removed (derived from `theme`)

**Impact:** Low - Minor performance

---

### 17. **No JSDoc Comments** (Throughout)

**Issue:**
- Complex functions lack documentation
- Magic numbers unexplained
- Algorithm logic not documented

**Fix:**
```typescript
/**
 * Detects quartets (2x2 clusters) of nearby nodes and applies rotation transforms.
 * Uses O(n²) algorithm - consider spatial partitioning for optimization.
 * @param nodes - Array of all nodes to check
 * @param threshold - Maximum distance for nodes to form a quartet
 * @returns Map of clusterId to array of 4 nodes
 */
```

**Impact:** Low - Documentation

---

### 18. **Hardcoded Constants** (Lines 40, 361, 417, etc.)

**Issue:**
```typescript
const MAX_NODES = 5000
const clusterThreshold = 40
const dyadThreshold = 200
```

**Problem:**
- Should be configurable or at least documented
- No way to adjust for different devices

**Fix:**
- Extract to constants object
- Consider device-based scaling
- Document rationale

**Impact:** Low - Flexibility

---

### 19. **Trail Array Growth** (Line 203-206)

**Issue:**
```typescript
pointerRef.current.trail.push({ x: coords.x, y: coords.y, age: 0 })
if (pointerRef.current.trail.length > 50) {
  pointerRef.current.trail.shift() // O(n) operation
}
```

**Problem:**
- `shift()` is O(n) - moves all elements
- Better to use circular buffer

**Fix:**
```typescript
// Use index-based circular buffer
const MAX_TRAIL = 50
let trailIndex = 0
trail[trailIndex % MAX_TRAIL] = { x, y, age: 0 }
trailIndex++
```

**Impact:** Low - Minor optimization

---

## Code Organization

### Strengths ✅

1. **Good separation of concerns** - Physics, rendering, and interaction are separated
2. **Proper use of refs** - Avoids unnecessary re-renders
3. **Memoization** - `useCallback` and `memo` used appropriately
4. **Type safety** - TypeScript interfaces well-defined
5. **Cleanup** - Event listeners properly removed

### Areas for Improvement 📈

1. **Extract constants** - Magic numbers should be named constants
2. **Split large functions** - `step` function is 680+ lines, should be broken down
3. **Extract algorithms** - Cluster detection, connection detection should be separate functions
4. **Add utility functions** - Distance calculations, vector math could be extracted

---

## Performance Analysis

### Current Complexity

- **Cluster Detection:** O(n²) - 25M ops/frame with 5000 nodes
- **Connection Detection:** O(n²) - 12.5M ops/frame with 5000 nodes
- **Node Updates:** O(n) - 5000 ops/frame
- **Rendering:** O(n) - 5000 ops/frame
- **Total:** ~37.5M operations per frame

### Optimization Opportunities

1. **Spatial Partitioning:** Reduce O(n²) to O(n log n)
2. **Distance Squared:** Avoid sqrt until needed
3. **Gradient Caching:** Reuse gradients
4. **Batch Operations:** Group similar operations
5. **Level of Detail:** Reduce detail for distant nodes

---

## Memory Management

### Current Issues

1. **Map Growth:** Cluster/dyad maps can grow unbounded
2. **Array Copies:** Full array copies during pruning
3. **Gradient Creation:** New gradients every frame
4. **No Object Pooling:** Nodes created/destroyed frequently

### Recommendations

1. **Periodic Cleanup:** Clean orphaned cluster rotations
2. **Object Pooling:** Reuse node objects
3. **Gradient Cache:** Cache gradients by key
4. **Size Limits:** Add max sizes to maps with LRU eviction

---

## Type Safety

### Issues Found

1. **Non-null assertions** without checks (line 651)
2. **Optional chaining** could be improved
3. **Type guards** missing in some places

### Recommendations

1. Add proper type guards
2. Remove unnecessary non-null assertions
3. Use discriminated unions where appropriate

---

## Testing Considerations

### Missing Tests

1. **Unit tests** for physics calculations
2. **Integration tests** for cluster detection
3. **Performance tests** for large node counts
4. **Edge case tests** (empty arrays, invalid dimensions)

### Test Coverage Needed

- Cluster formation/dissolution
- Node merging logic
- Boundary collision
- Resize handling
- Pulse/burst effects

---

## Recommendations Priority

### Immediate (This Sprint)

1. ✅ Fix resize to use canvas dimensions
2. ✅ Add dimension validation in animation loop
3. ✅ Add resize debouncing
4. ✅ Fix indentation issues

### Short Term (Next Sprint)

1. Extract magic numbers to constants
2. Add error boundaries
3. Optimize distance calculations (use squared)
4. Add gradient caching

### Medium Term (Next Month)

1. Implement spatial partitioning
2. Optimize array operations
3. Add object pooling
4. Split large functions

### Long Term (Future)

1. Add comprehensive tests
2. Performance profiling
3. Documentation
4. Consider WebGL migration for 10k+ nodes

---

## Code Metrics

- **Lines of Code:** 1043
- **Cyclomatic Complexity:** High (step function ~50)
- **Function Length:** Very High (step function 680+ lines)
- **Dependencies:** 7 (reasonable)
- **Type Coverage:** ~95% (good)
- **Comment Coverage:** ~5% (needs improvement)

---

## Conclusion

The canvas component is **functionally solid** with sophisticated physics and rendering. However, it has **significant performance bottlenecks** (O(n²) algorithms) and **code quality issues** (magic numbers, large functions, missing error handling).

**Priority fixes:**
1. Resize function bug (critical)
2. Dimension validation (critical)
3. Performance optimizations (high)
4. Code organization (medium)

With these fixes, the component will be production-ready and performant.

---

**Reviewed by:** AI Code Quality Auditor
**Review Date:** 2025-12-30
