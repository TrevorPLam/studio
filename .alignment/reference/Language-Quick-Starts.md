# Language-Specific Quick Start Guides

Quick start guides for common languages. These provide language-specific shortcuts to ALIGNMENT compliance.

## JavaScript/TypeScript Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── package.json
├── package-lock.json
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── index.ts
└── tests/
    └── index.test.ts
```

### Essential Files

**package.json:**
```json
{
  "name": "project-name",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

**.gitignore:**
```
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: npm test
      - run: npm audit
```

### Key Tools
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest, Vitest
- **Type checking:** TypeScript compiler

### Time Estimate: 2-4 hours

## Python Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── pyproject.toml
├── poetry.lock
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── app/
│       └── __init__.py
└── tests/
    └── test_app.py
```

### Essential Files

**pyproject.toml:**
```toml
[tool.poetry]
name = "project-name"
version = "1.0.0"

[tool.poetry.dependencies]
python = "^3.10"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

**.gitignore:**
```
__pycache__/
*.py[cod]
*.so
.Python
env/
venv/
.env
.env.local
.pytest_cache/
.coverage
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install poetry
      - run: poetry install
      - run: poetry run pytest
      - run: poetry run black --check .
      - run: poetry run flake8 .
```

### Key Tools
- **Linting:** Flake8, Ruff
- **Formatting:** Black
- **Testing:** pytest
- **Dependencies:** Poetry (recommended) or pip

### Time Estimate: 2-4 hours

## Go Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── go.mod
├── go.sum
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── cmd/
│   └── app/
│       └── main.go
├── pkg/
│   └── lib/
│       └── lib.go
└── internal/
    └── private/
        └── private.go
```

### Essential Files

**go.mod:**
```go
module github.com/org/project-name

go 1.20
```

**.gitignore:**
```
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v4
        with:
          go-version: '1.20'
      - run: go mod download
      - run: go build ./...
      - run: go test ./...
      - run: go vet ./...
      - run: golangci-lint run
```

### Key Tools
- **Linting:** golangci-lint
- **Formatting:** gofmt (built-in)
- **Testing:** go test (built-in)
- **Dependencies:** go mod (built-in)

### Time Estimate: 1-3 hours

## Rust Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── Cargo.toml
├── Cargo.lock
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── main.rs
└── tests/
    └── integration_test.rs
```

### Essential Files

**Cargo.toml:**
```toml
[package]
name = "project-name"
version = "1.0.0"
edition = "2021"

[dependencies]
```

**.gitignore:**
```
target/
Cargo.lock  # Note: Usually committed, but some projects ignore
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cargo build
      - run: cargo test
      - run: cargo clippy -- -D warnings
      - run: cargo fmt -- --check
      - run: cargo audit
```

### Key Tools
- **Linting:** Clippy (built-in)
- **Formatting:** rustfmt (built-in)
- **Testing:** cargo test (built-in)
- **Dependencies:** Cargo (built-in)

### Time Estimate: 1-3 hours

## Ruby Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── Gemfile
├── Gemfile.lock
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── lib/
│   └── project_name.rb
└── spec/
    └── project_name_spec.rb
```

### Essential Files

**Gemfile:**
```ruby
source 'https://rubygems.org'

ruby '3.2.0'

gem 'rspec', group: :test
gem 'rubocop', group: :development
```

**.gitignore:**
```
.bundle/
vendor/bundle
*.gem
*.rbc
.env
.env.local
coverage/
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true
      - run: bundle install
      - run: bundle exec rspec
      - run: bundle exec rubocop
```

### Key Tools
- **Linting:** RuboCop
- **Formatting:** RuboCop (auto-fix)
- **Testing:** RSpec, Minitest
- **Dependencies:** Bundler

### Time Estimate: 2-4 hours

## PHP Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── composer.json
├── composer.lock
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── App.php
└── tests/
    └── AppTest.php
```

### Essential Files

**composer.json:**
```json
{
  "name": "vendor/project-name",
  "type": "library",
  "require": {
    "php": "^8.1"
  },
  "require-dev": {
    "phpunit/phpunit": "^10.0",
    "phpstan/phpstan": "^1.10"
  },
  "autoload": {
    "psr-4": {
      "Vendor\\ProjectName\\": "src/"
    }
  }
}
```

**.gitignore:**
```
vendor/
composer.lock  # Usually committed, but some ignore
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: php-actions/composer@v6
      - run: composer install
      - run: composer test
      - run: composer phpstan
      - run: composer cs-check
```

### Key Tools
- **Linting:** PHP_CodeSniffer, PHPStan
- **Formatting:** PHP CS Fixer
- **Testing:** PHPUnit
- **Dependencies:** Composer

### Time Estimate: 2-4 hours

## Java/Kotlin Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── build.gradle.kts
├── settings.gradle.kts
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── main/
│   │   └── kotlin/
│   │       └── App.kt
│   └── test/
│       └── kotlin/
│           └── AppTest.kt
└── gradle/
    └── wrapper/
```

### Essential Files

**build.gradle.kts:**
```kotlin
plugins {
    kotlin("jvm") version "1.9.0"
    id("org.jetbrains.kotlin.plugin.allopen") version "1.9.0"
}

repositories {
    mavenCentral()
}

dependencies {
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}
```

**.gitignore:**
```
build/
.gradle/
.idea/
*.iml
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - run: ./gradlew build
      - run: ./gradlew test
      - run: ./gradlew check
```

### Key Tools
- **Linting:** ktlint, Detekt
- **Formatting:** ktlint (auto-fix)
- **Testing:** JUnit, Kotlin Test
- **Dependencies:** Gradle, Maven

### Time Estimate: 2-4 hours

## C# / .NET Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── ProjectName.csproj
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   └── Program.cs
└── tests/
    └── ProjectName.Tests.csproj
```

### Essential Files

**ProjectName.csproj:**
```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
  </PropertyGroup>
</Project>
```

**.gitignore:**
```
bin/
obj/
*.user
*.suo
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - run: dotnet restore
      - run: dotnet build
      - run: dotnet test
      - run: dotnet format --verify-no-changes
```

### Key Tools
- **Linting:** Roslyn Analyzers
- **Formatting:** dotnet format
- **Testing:** xUnit, NUnit, MSTest
- **Dependencies:** NuGet

### Time Estimate: 2-4 hours

## Swift Quick Start

### Structure
```
project/
├── README.md
├── LICENSE
├── Package.swift
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── Sources/
│   └── ProjectName/
│       └── ProjectName.swift
└── Tests/
    └── ProjectNameTests/
        └── ProjectNameTests.swift
```

### Essential Files

**Package.swift:**
```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ProjectName",
    products: [
        .library(name: "ProjectName", targets: ["ProjectName"]),
    ],
    targets: [
        .target(name: "ProjectName"),
        .testTarget(name: "ProjectNameTests", dependencies: ["ProjectName"]),
    ]
)
```

**.gitignore:**
```
.build/
.swiftpm/
.env
.env.local
```

**CI/CD (.github/workflows/ci.yml):**
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - run: swift build
      - run: swift test
      - run: swift format --lint .
```

### Key Tools
- **Linting:** SwiftLint
- **Formatting:** swift-format
- **Testing:** XCTest (built-in)
- **Dependencies:** Swift Package Manager

### Time Estimate: 2-4 hours

## Common Patterns Across Languages

### All Languages Need:
1. **README.md** - What, install, run, contribute
2. **LICENSE** - If public repository
3. **.gitignore** - Language-specific patterns
4. **CI/CD** - Build, test, lint, security
5. **Source organization** - Dedicated directory
6. **Lockfile** - Committed to git

### Language-Specific Resources

**JavaScript/TypeScript:**
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Python:**
- [Python Packaging Guide](https://packaging.python.org/)
- [Hitchhiker's Guide to Python](https://docs.python-guide.org/)

**Go:**
- [Standard Go Project Layout](https://github.com/golang-standards/project-layout)
- [Effective Go](https://go.dev/doc/effective_go)

**Rust:**
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [The Rust Book](https://doc.rust-lang.org/book/)

**Ruby:**
- [Ruby Style Guide](https://rubystyle.guide/)
- [Ruby Best Practices](https://github.com/rubocop/ruby-style-guide)

**PHP:**
- [PHP The Right Way](https://phptherightway.com/)
- [PSR Standards](https://www.php-fig.org/psr/)

**Java/Kotlin:**
- [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- [Effective Java](https://www.oracle.com/java/technologies/javase/effective-java.html)

**C# / .NET:**
- [.NET Coding Conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- [C# Coding Guidelines](https://github.com/dotnet/runtime/blob/main/docs/coding-guidelines/coding-style.md)

**Swift:**
- [Swift API Design Guidelines](https://www.swift.org/documentation/api-design-guidelines/)
- [Swift Style Guide](https://github.com/raywenderlich/swift-style-guide)

## Next Steps

After quick start:
1. Complete [Section 0](00-Prerequisites.md) decision points
2. Follow full ALIGNMENT sections in order
3. Use [Success Metrics](Success-Metrics.md) to measure progress

---

**Remember:** Quick starts provide structure. Full alignment adds governance, security, and advanced features.
