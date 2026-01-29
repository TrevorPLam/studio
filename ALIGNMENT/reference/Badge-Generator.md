# Compliance Badge Generator

Documentation for generating ALIGNMENT compliance badges to display repository alignment status.

## Badge Types

### Health Score Badge
Displays overall repository health score (0-100).

**Format:**
```
[![ALIGNMENT Health](https://img.shields.io/badge/ALIGNMENT-85-green)](https://github.com/your-org/ALIGNMENT)
```

**Colors:**
- Green: 85-100 (Excellent)
- Yellow: 70-84 (Good)
- Orange: 50-69 (Basic)
- Red: 0-49 (Needs Improvement)

### Compliance Level Badge
Displays alignment level achieved.

**Format:**
```
[![ALIGNMENT Level](https://img.shields.io/badge/ALIGNMENT-Level%202-blue)](https://github.com/your-org/ALIGNMENT)
```

**Levels:**
- Level 1: MVA (Minimum Viable Alignment)
- Level 2: Standard Alignment
- Level 3: Full Alignment

### Section Completion Badge
Displays number of sections completed.

**Format:**
```
[![ALIGNMENT Sections](https://img.shields.io/badge/ALIGNMENT-10%2F13-blue)](https://github.com/your-org/ALIGNMENT)
```

## Generating Badges

### Method 1: Manual Generation

Use [Shields.io](https://shields.io/) to generate badges:

**Health Score:**
```
https://img.shields.io/badge/ALIGNMENT-{score}-{color}
```

**Example:**
```markdown
[![ALIGNMENT Health](https://img.shields.io/badge/ALIGNMENT-85-green)](https://github.com/your-org/ALIGNMENT)
```

### Method 2: Automated Generation

Create a script to generate badges from health check results:

```bash
#!/bin/bash
# generate-badge.sh

HEALTH_SCORE=$(./scripts/validate-all.sh 2>&1 | grep "Health Score" | awk '{print $NF}')

if [ "$HEALTH_SCORE" -ge 85 ]; then
    COLOR="green"
elif [ "$HEALTH_SCORE" -ge 70 ]; then
    COLOR="yellow"
elif [ "$HEALTH_SCORE" -ge 50 ]; then
    COLOR="orange"
else
    COLOR="red"
fi

echo "[![ALIGNMENT Health](https://img.shields.io/badge/ALIGNMENT-${HEALTH_SCORE}-${COLOR})](https://github.com/your-org/ALIGNMENT)"
```

### Method 3: CI/CD Integration

Add badge generation to CI/CD:

**GitHub Actions:**
```yaml
- name: Generate Badge
  run: |
    HEALTH_SCORE=$(./scripts/calculate-health.sh)
    echo "::set-output name=score::$HEALTH_SCORE"
  id: health

- name: Update Badge
  uses: actions/github-script@v7
  with:
    script: |
      // Update README with badge
```

## Badge Placement

Add badges to README.md:

```markdown
# Project Name

[![ALIGNMENT Health](https://img.shields.io/badge/ALIGNMENT-85-green)](https://github.com/your-org/ALIGNMENT)
[![ALIGNMENT Level](https://img.shields.io/badge/ALIGNMENT-Level%202-blue)](https://github.com/your-org/ALIGNMENT)

Brief description...
```

## Custom Badges

### Section-Specific Badges
Display completion status for specific sections:

```markdown
[![Section 1](https://img.shields.io/badge/Section%201-Complete-green)]()
[![Section 5](https://img.shields.io/badge/Section%205-In%20Progress-yellow)]()
```

### Priority Badges
Display P0/P1/P2 completion:

```markdown
[![P0](https://img.shields.io/badge/P0-100%25-green)]()
[![P1](https://img.shields.io/badge/P1-75%25-yellow)]()
[![P2](https://img.shields.io/badge/P2-50%25-orange)]()
```

## Badge API (Future)

Future enhancement: API endpoint for dynamic badges:

```
https://alignment-api.example.com/badge/{repo}
```

Returns SVG badge with current health score.

## Examples

### Complete Badge Set
```markdown
# Project Name

[![ALIGNMENT Health](https://img.shields.io/badge/ALIGNMENT-85-green)](https://github.com/your-org/ALIGNMENT)
[![ALIGNMENT Level](https://img.shields.io/badge/ALIGNMENT-Level%202-blue)](https://github.com/your-org/ALIGNMENT)
[![ALIGNMENT Sections](https://img.shields.io/badge/ALIGNMENT-10%2F13-blue)](https://github.com/your-org/ALIGNMENT)
[![P0](https://img.shields.io/badge/P0-100%25-green)]()
[![P1](https://img.shields.io/badge/P1-80%25-yellow)]()

Brief description...
```

## Badge Maintenance

**Update badges:**
- After completing sections
- Monthly health check
- When health score changes

**Automate updates:**
- CI/CD job updates badges
- Scheduled health checks
- PR comments with badge updates

## Badge Standards

**Required:**
- Health score badge (if health scoring implemented)
- Link to ALIGNMENT standard

**Optional:**
- Compliance level badge
- Section completion badge
- Priority badges

---

**Remember:** Badges provide quick visual status. Keep them updated!
