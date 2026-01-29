# Testing Principles

**Related Standards:** [Section 6: Testing Structure](../standards/06-Testing-Structure.md)  
**Related Research:** [Testing Structure Research](../research/06-Testing-Structure-Research.md)

> **Core Principle:** Tests are specifications, documentation, and safety nets. Write tests that describe behavior, catch regressions, and enable confident refactoring.

This document defines the philosophical principles that guide testing practices. For implementation checklists and step-by-step guidance, see [Section 6: Testing Structure](../standards/06-Testing-Structure.md).

---

## 1) Tests are specifications

### Tests describe behavior

Tests should read like specifications. A well-written test describes *what* the code does, not *how* it does it. Test names should be clear, descriptive, and explain the expected behavior.

**Good test name:**
```javascript
it('should calculate total price including tax for items', () => {
  // ...
});
```

**Bad test name:**
```javascript
it('test1', () => {
  // ...
});
```

### Tests document the system

Tests serve as living documentation. They show how the system is supposed to work, what inputs are expected, and what outputs are produced. When code changes, tests document the new behavior.

### Tests enable confident refactoring

Well-written tests give you confidence to refactor. If tests pass after refactoring, you know behavior is preserved. Tests catch regressions before they reach production.

---

## 2) Test pyramid: many fast, few slow

### The test pyramid

Follow the **test pyramid** model:

```
        /\
       /  \      E2E Tests (few, slow)
      /____\
     /      \    Integration Tests (some, medium)
    /________\
   /            \  Unit Tests (many, fast)
  /______________\
```

**Ratio guidance:**
- **70% Unit Tests** - Fast, isolated, test individual functions/components
- **20% Integration Tests** - Medium speed, test component interactions
- **10% E2E Tests** - Slow, test critical user workflows

### Why the pyramid?

- **Speed:** Unit tests run in seconds, E2E tests run in minutes
- **Reliability:** Unit tests are deterministic, E2E tests are flaky
- **Cost:** Fast feedback is cheap, slow feedback is expensive
- **Maintenance:** Unit tests are easy to maintain, E2E tests are brittle

### Test critical paths, not everything

Focus testing effort on:
- **Critical paths** - Core functionality that must work (authentication, payments, data validation)
- **Business logic** - Complex calculations, decision-making code
- **Error handling** - Edge cases, error paths, boundary conditions
- **User-facing features** - Features users interact with directly

Don't test:
- Trivial getters/setters
- Framework code
- Third-party libraries
- Code that's impossible to break

---

## 3) Quality over quantity

### Coverage philosophy

**Coverage targets:**
- **Critical paths:** 80%+ coverage (must be high)
- **Overall:** 60%+ coverage (good baseline)
- **New code:** 80%+ coverage requirement (prevent regression)

**Quality over quantity:**
- Better to have 50% coverage of meaningful tests than 90% coverage of trivial tests
- Test behavior, not implementation
- One good test is worth ten bad tests

### What makes a good test?

A good test:
- ✅ **Fast** - Runs in milliseconds, not seconds
- ✅ **Isolated** - Doesn't depend on other tests or external state
- ✅ **Repeatable** - Same inputs always produce same outputs
- ✅ **Clear** - Easy to understand what it's testing
- ✅ **Maintainable** - Easy to update when code changes
- ✅ **Focused** - Tests one thing well

A bad test:
- ❌ Slow (waits, sleeps, network calls)
- ❌ Flaky (sometimes passes, sometimes fails)
- ❌ Unclear (hard to understand what it tests)
- ❌ Brittle (breaks when unrelated code changes)
- ❌ Tests implementation, not behavior

---

## 4) Test-Driven Development (TDD)

### Red-Green-Refactor cycle

**TDD Process:**
1. **Red** - Write a failing test for the behavior you want
2. **Green** - Write the minimum code to make the test pass
3. **Refactor** - Improve the code while keeping tests green

### Benefits of TDD

- **Design feedback** - Writing tests first forces you to think about the API
- **Confidence** - Tests give you confidence to refactor
- **Documentation** - Tests document expected behavior
- **Regression prevention** - Tests catch bugs before they're committed

### When to use TDD

**Use TDD for:**
- New features
- Bug fixes (write test first, then fix)
- Refactoring (ensure tests exist first)
- Complex logic

**Don't force TDD for:**
- Exploratory coding
- Learning new frameworks
- One-off scripts
- When tests are too hard to write first

---

## 5) Test organization principles

### Co-located vs centralized

**Co-located pattern** (recommended for most projects):
- Tests next to source: `Button.tsx` → `Button.test.tsx`
- Easier to find and maintain
- Good for: Components, modules, focused units

**Centralized pattern:**
- Tests in `tests/` directory mirroring source structure
- Separates test code from production code
- Good for: Large projects, strict separation needs

**Choose one pattern and be consistent.**

### Test structure

**Arrange-Act-Assert pattern:**
```javascript
describe('calculateTotal', () => {
  it('should sum all items', () => {
    // Arrange - Set up test data
    const items = [10, 20, 30];
    
    // Act - Execute the code being tested
    const total = calculateTotal(items);
    
    // Assert - Verify the result
    expect(total).toBe(60);
  });
});
```

### Test naming

**Good test names:**
- `should calculate total price including tax`
- `should throw error when items array is empty`
- `should return zero for empty cart`

**Bad test names:**
- `test1`
- `calculateTotal`
- `works`

---

## 6) Fast feedback loop

### Run fast tests first

- Unit tests should run in < 1 minute
- Run unit tests on every save (watch mode)
- Run integration tests before commit
- Run E2E tests in CI/CD

### Parallel execution

- Run tests in parallel when possible
- Use test caching and incremental runs
- Fail fast on first error (don't wait for all tests)

### Test performance budgets

Set performance budgets for:
- **Test execution time** - Unit tests < 1 minute, full suite < 10 minutes
- **Test setup time** - Minimize test setup overhead
- **Test data size** - Keep test fixtures small

---

## "Golden rules" checklist

* Tests describe behavior, not implementation
* Tests are fast, isolated, and repeatable
* Critical paths have 80%+ coverage
* Test pyramid: 70% unit, 20% integration, 10% E2E
* One good test is worth ten bad tests
* Tests enable confident refactoring
* Write tests that catch regressions
* Test behavior, not implementation details

---

## Implementation Guidance

For implementation guidance, see:
- **[Section 6: Testing Structure](../standards/06-Testing-Structure.md)** - Step-by-step implementation checklists
- **[Testing Structure Research](../research/06-Testing-Structure-Research.md)** - Evidence base and best practices

For stack-specific guidance:
- **[Language Quick Starts](../reference/Language-Quick-Starts.md)** - Language-specific testing patterns
- **[Platform Quick Starts](../reference/Platform-Quick-Starts.md)** - CI/CD platform testing integration

---

## External Standards & References

- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development) - TDD methodology
- [The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) - Testing classifications
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) - Martin Fowler's test pyramid
- [Testing Best Practices](https://testingjavascript.com/) - Comprehensive testing guide

---

## Common Testing Philosophies

### Testing Trophy (Alternative to Pyramid)

Some prefer the "Testing Trophy" model:
- Static analysis (ESLint, TypeScript)
- Unit tests
- Integration tests
- E2E tests (smallest layer)

Both models emphasize: **More fast tests, fewer slow tests.**

### Behavior-Driven Development (BDD)

BDD extends TDD with:
- Tests written in natural language
- Focus on behavior and user stories
- Tools: Cucumber, Jest with BDD syntax

### Property-Based Testing

Generate test cases automatically:
- Test invariants and properties
- Tools: QuickCheck, Hypothesis, proptest
- Good for: Complex algorithms, data validation

---

## When Not to Test

**Don't test:**
- Third-party code (test your integration with it)
- Framework code (test your usage of it)
- Trivial code (getters, setters, simple pass-throughs)
- Code that's impossible to break
- Code that changes constantly (too brittle)

**Focus testing on:**
- Business logic
- Critical paths
- Error handling
- User-facing features
- Complex algorithms
