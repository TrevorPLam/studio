# Patterns Mappable to studio

**Analysis of which patterns from new apps can be directly applied to studio**

---

## Current studio State

### ✅ What studio Has
- **Next.js 15.3.8** with App Router
- **TypeScript** (strict mode)
- **Security middleware** (rate limiting, correlation context)
- **Jest** for testing (not Vitest)
- **ESLint + Prettier** for linting/formatting
- **Google Genkit** for AI (hardcoded Google AI provider)
- **Firebase** (but file-based JSON storage for sessions)
- **GitHub integration** (Octokit)
- **NextAuth** for authentication
- **Session state machine** (enforced lifecycle)
- **Kill-switch** (read-only mode)
- **Path policy** (security restrictions)
- **Governance framework** (`.repo/` structure)
- **Extensive automation scripts** (intelligent, ultra, vibranium)

### ❌ What studio Lacks
- **No repository pattern** (uses direct file I/O)
- **No factory pattern** for AI providers (hardcoded Google Genkit)
- **No factory pattern** for storage (file-based only)
- **No persistent configuration** (only environment variables)
- **No database** (file-based JSON storage)
- **No multi-provider abstraction** (can't easily switch AI providers)

---

## 🎯 High-Priority Mappings

### 1. **Biome Configuration** (from cal.com)

**Why it fits:**
- Currently uses **ESLint + Prettier** separately
- Biome is a **unified tool** that replaces both
- Better performance and simpler configuration
- Already TypeScript-focused

**What to extract:**
```json
// biome.json
{
  "formatter": {
    "lineWidth": 100,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "nursery": {
        "noUnresolvedImports": "warn"
      }
    }
  },
  "overrides": [
    {
      "includes": ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
      "linter": {
        "rules": {
          "style": {
            "noDefaultExport": "off"
          }
        }
      }
    }
  ]
}
```

**Implementation Steps:**
1. Install Biome: `npm install --save-dev @biomejs/biome`
2. Replace ESLint config with `biome.json`
3. Replace Prettier with Biome formatter
4. Update `package.json` scripts
5. Remove ESLint and Prettier dependencies

**Files to modify:**
- `package.json` (scripts, dependencies)
- `.eslintrc.json` → `biome.json` (replace)
- `.prettierrc.json` (remove)
- `.lintstagedrc.json` (update to use Biome)

**Benefits:**
- ✅ Single tool instead of two
- ✅ Faster linting/formatting
- ✅ Better TypeScript support
- ✅ Simpler configuration

---

### 2. **Repository Pattern for File Storage** (from cal.com, adapted)

**Why it fits:**
- Currently uses **direct file I/O** in `src/lib/db/agent-sessions.ts`
- Repository pattern provides **type safety** and **testability**
- Makes it easier to **switch to a real database** (Firebase, PostgreSQL, etc.)
- **Abstraction layer** for storage operations

**Current State:**
```typescript
// src/lib/db/agent-sessions.ts (current)
async function loadSessions(): Promise<AgentSession[]> {
  const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
  const parsed = JSON.parse(data) as SessionsFile;
  return parsed.sessions;
}
```

**What to extract:**
```typescript
// src/lib/repositories/base-repository.ts
export interface IRepository<T, TWhere, TSelect, TCreate, TUpdate> {
  findById(id: string): Promise<T | null>
  findMany(where: TWhere): Promise<T[]>
  create(data: TCreate): Promise<T>
  update(where: TWhere, data: TUpdate): Promise<T>
  delete(where: TWhere): Promise<void>
}

export abstract class BaseRepository<T, TWhere, TSelect, TCreate, TUpdate>
  implements IRepository<T, TWhere, TSelect, TCreate, TUpdate>
{
  abstract findById(id: string): Promise<T | null>
  abstract findMany(where: TWhere): Promise<T[]>
  abstract create(data: TCreate): Promise<T>
  abstract update(where: TWhere, data: TUpdate): Promise<T>
  abstract delete(where: TWhere): Promise<void>
}
```

**Example implementation:**
```typescript
// src/lib/repositories/session-repository.ts
import { BaseRepository } from './base-repository'
import type { AgentSession, AgentSessionState } from '@/lib/agent/session-types'
import { promises as fs } from 'fs'
import path from 'path'

const SESSIONS_FILE = path.join(process.cwd(), '.data', 'agent-sessions.json')

interface SessionsFile {
  sessions: AgentSession[]
}

const sessionMinimalSelect = {
  id: true,
  userId: true,
  name: true,
  state: true,
  createdAt: true,
  updatedAt: true,
} as const

export class SessionRepository extends BaseRepository<
  AgentSession,
  { userId?: string; state?: AgentSessionState },
  typeof sessionMinimalSelect,
  Omit<AgentSession, 'id' | 'createdAt' | 'updatedAt'>,
  Partial<Omit<AgentSession, 'id' | 'createdAt'>>
> {
  private async loadSessions(): Promise<AgentSession[]> {
    try {
      const data = await fs.readFile(SESSIONS_FILE, 'utf-8')
      const parsed = JSON.parse(data) as SessionsFile
      return parsed.sessions
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return []
      }
      throw error
    }
  }

  private async saveSessions(sessions: AgentSession[]): Promise<void> {
    await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true })
    await fs.writeFile(
      SESSIONS_FILE,
      JSON.stringify({ sessions }, null, 2),
      'utf-8'
    )
  }

  async findById(id: string): Promise<AgentSession | null> {
    const sessions = await this.loadSessions()
    return sessions.find((s) => s.id === id) || null
  }

  async findMany(where: { userId?: string; state?: AgentSessionState }): Promise<AgentSession[]> {
    const sessions = await this.loadSessions()
    return sessions.filter((session) => {
      if (where.userId && session.userId !== where.userId) return false
      if (where.state && session.state !== where.state) return false
      return true
    })
  }

  async create(data: Omit<AgentSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<AgentSession> {
    const sessions = await this.loadSessions()
    const newSession: AgentSession = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    sessions.push(newSession)
    await this.saveSessions(sessions)
    return newSession
  }

  async update(
    where: { id: string },
    data: Partial<Omit<AgentSession, 'id' | 'createdAt'>>
  ): Promise<void> {
    const sessions = await this.loadSessions()
    const index = sessions.findIndex((s) => s.id === where.id)
    if (index === -1) {
      throw new Error(`Session not found: ${where.id}`)
    }
    sessions[index] = {
      ...sessions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    await this.saveSessions(sessions)
  }

  async delete(where: { id: string }): Promise<void> {
    const sessions = await this.loadSessions()
    const filtered = sessions.filter((s) => s.id !== where.id)
    await this.saveSessions(filtered)
  }
}
```

**Implementation Steps:**
1. Create `src/lib/repositories/` directory
2. Add base repository interface and class
3. Refactor `src/lib/db/agent-sessions.ts` to use `SessionRepository`
4. Update API routes to use repository
5. Add tests for repository
6. Document pattern

**Files to create:**
- `src/lib/repositories/base-repository.ts`
- `src/lib/repositories/session-repository.ts`
- `tests/unit/lib/repositories/session-repository.test.ts`
- `docs/patterns/repository-pattern.md`

**Files to modify:**
- `src/lib/db/agent-sessions.ts` (refactor to use repository)
- `src/app/api/sessions/route.ts` (use repository)
- `src/app/api/sessions/[id]/route.ts` (use repository)

**Benefits:**
- ✅ Type-safe data access
- ✅ Easier testing (mock repository)
- ✅ Easier to migrate to real database (Firebase, PostgreSQL)
- ✅ Consistent patterns across codebase
- ✅ Better separation of concerns

---

### 3. **Factory Pattern for AI Providers** (from esperanto)

**Why it fits:**
- Currently has **hardcoded Google Genkit** integration
- Supports multiple AI providers (Google, OpenAI, Anthropic) but hardcoded
- Factory pattern enables **easy provider switching**
- Reduces vendor lock-in
- **Model registry** already exists but not abstracted

**Current State:**
```typescript
// src/ai/genkit.ts (current)
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: env.ai.googleApiKey || process.env.GOOGLE_AI_API_KEY || '',
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
```

**What to extract:**
```typescript
// src/lib/providers/ai/base.ts
export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>
  generateStream(prompt: string, options?: GenerateOptions): AsyncIterable<string>
  getAvailableModels(): string[]
}

// src/lib/providers/ai/factory.ts
import { GoogleGenkitProvider } from './google-genkit'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'

export type AIProviderType = 'google' | 'openai' | 'anthropic'

export class AIProviderFactory {
  static create(
    provider: AIProviderType,
    config: Record<string, string>
  ): AIProvider {
    switch (provider) {
      case 'google':
        return new GoogleGenkitProvider(config)
      case 'openai':
        return new OpenAIProvider(config)
      case 'anthropic':
        return new AnthropicProvider(config)
      default:
        throw new Error(`Unknown AI provider: ${provider}`)
    }
  }

  static createFromEnv(): AIProvider {
    const provider = (process.env.AI_PROVIDER || 'google') as AIProviderType
    const config = {
      googleApiKey: process.env.GOOGLE_AI_API_KEY || '',
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    }
    return this.create(provider, config)
  }
}

// src/lib/providers/ai/google-genkit.ts
import { genkit } from 'genkit'
import { googleAI } from '@genkit-ai/google-genai'

export class GoogleGenkitProvider implements AIProvider {
  private ai: ReturnType<typeof genkit>

  constructor(config: { googleApiKey: string }) {
    this.ai = genkit({
      plugins: [googleAI({ apiKey: config.googleApiKey })],
      model: 'googleai/gemini-2.5-flash',
    })
  }

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    const result = await this.ai.generate({
      prompt,
      model: options?.model || 'googleai/gemini-2.5-flash',
    })
    return result.text
  }

  async *generateStream(prompt: string, options?: GenerateOptions): AsyncIterable<string> {
    const stream = await this.ai.generateStream({
      prompt,
      model: options?.model || 'googleai/gemini-2.5-flash',
    })
    for await (const chunk of stream) {
      yield chunk.text
    }
  }

  getAvailableModels(): string[] {
    return [
      'googleai/gemini-2.5-flash',
      'googleai/gemini-2.5-pro',
    ]
  }
}
```

**Implementation Steps:**
1. Create `src/lib/providers/ai/` directory
2. Define `AIProvider` interface
3. Create factory class
4. Refactor Google Genkit logic into `GoogleGenkitProvider`
5. Update `src/app/api/agents/chat/route.ts` to use factory
6. Update `src/app/api/agents/chat-stream/route.ts` to use factory
7. Add environment variable for provider selection
8. Document pattern

**Files to create:**
- `src/lib/providers/ai/base.ts`
- `src/lib/providers/ai/factory.ts`
- `src/lib/providers/ai/google-genkit.ts`
- `src/lib/providers/ai/openai.ts` (example, optional)
- `src/lib/providers/ai/anthropic.ts` (example, optional)
- `docs/patterns/ai-provider-factory.md`

**Files to modify:**
- `src/ai/genkit.ts` (refactor to provider)
- `src/app/api/agents/chat/route.ts` (use factory)
- `src/app/api/agents/chat-stream/route.ts` (use factory)
- `src/lib/ai-models.ts` (integrate with factory)
- `env.example` (add AI_PROVIDER)

**Benefits:**
- ✅ Easy to switch AI providers
- ✅ Reduces vendor lock-in
- ✅ Consistent interface across providers
- ✅ Easier to test (mock provider)
- ✅ Can support multiple providers simultaneously

---

### 4. **Factory Pattern for Storage Providers** (from omni-storage)

**Why it fits:**
- Currently uses **file-based JSON storage**
- Might want to switch to **Firebase**, **PostgreSQL**, or **Supabase**
- Factory pattern enables **easy storage switching**
- Reduces vendor lock-in

**What to extract:**
```typescript
// src/lib/providers/storage/base.ts
export interface StorageProvider {
  read<T>(key: string): Promise<T | null>
  write<T>(key: string, data: T): Promise<void>
  delete(key: string): Promise<void>
  list(prefix?: string): Promise<string[]>
}

// src/lib/providers/storage/factory.ts
import { FileStorageProvider } from './file'
import { FirebaseStorageProvider } from './firebase'
import { PostgresStorageProvider } from './postgres'

export type StorageProviderType = 'file' | 'firebase' | 'postgres' | 'supabase'

export class StorageProviderFactory {
  static create(
    provider: StorageProviderType,
    config: Record<string, string>
  ): StorageProvider {
    switch (provider) {
      case 'file':
        return new FileStorageProvider(config)
      case 'firebase':
        return new FirebaseStorageProvider(config)
      case 'postgres':
        return new PostgresStorageProvider(config)
      case 'supabase':
        return new SupabaseStorageProvider(config)
      default:
        throw new Error(`Unknown storage provider: ${provider}`)
    }
  }

  static createFromEnv(): StorageProvider {
    const provider = (process.env.STORAGE_PROVIDER || 'file') as StorageProviderType
    const config = {
      dataDir: process.env.DATA_DIR || '.data',
      firebaseConfig: process.env.FIREBASE_CONFIG || '',
      postgresUrl: process.env.DATABASE_URL || '',
      supabaseUrl: process.env.SUPABASE_URL || '',
    }
    return this.create(provider, config)
  }
}

// src/lib/providers/storage/file.ts
export class FileStorageProvider implements StorageProvider {
  constructor(private config: { dataDir: string }) {}

  async read<T>(key: string): Promise<T | null> {
    const filePath = path.join(this.config.dataDir, key)
    try {
      const data = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(data) as T
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null
      }
      throw error
    }
  }

  async write<T>(key: string, data: T): Promise<void> {
    const filePath = path.join(this.config.dataDir, key)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  // ... other methods
}
```

**Implementation Steps:**
1. Create `src/lib/providers/storage/` directory
2. Define `StorageProvider` interface
3. Create factory class
4. Refactor file storage logic into `FileStorageProvider`
5. Update `SessionRepository` to use storage provider
6. Add environment variable for storage selection
7. Document pattern

**Files to create:**
- `src/lib/providers/storage/base.ts`
- `src/lib/providers/storage/factory.ts`
- `src/lib/providers/storage/file.ts`
- `src/lib/providers/storage/firebase.ts` (example, optional)
- `docs/patterns/storage-provider-factory.md`

**Files to modify:**
- `src/lib/repositories/session-repository.ts` (use storage provider)
- `env.example` (add STORAGE_PROVIDER)

**Benefits:**
- ✅ Easy to switch storage backends
- ✅ Reduces vendor lock-in
- ✅ Consistent interface across providers
- ✅ Easier to test (mock storage)
- ✅ Can migrate to real database without changing repository code

---

### 5. **Persistent Configuration** (from open-webui)

**Why it fits:**
- Currently uses **environment variables only**
- Some config should be **user-editable** (default AI model, session settings)
- Database-backed config allows **runtime changes** without redeployment
- Falls back to environment variables (backward compatible)

**What to extract:**
```typescript
// src/lib/config/persistent-config.ts
import { getConfig, saveConfig } from './config-db'

export class PersistentConfig<T> {
  private envValue: T
  private configPath: string
  private envName: string

  constructor(envName: string, configPath: string, envValue: T) {
    this.envName = envName
    this.configPath = configPath
    this.envValue = envValue
    
    // Try to load from storage, fallback to env
    const storedValue = getConfigValue(configPath)
    this.value = storedValue ?? envValue
  }

  get value(): T {
    return this._value
  }

  set value(newValue: T) {
    this._value = newValue
    saveConfig(this.configPath, newValue)
  }
}

// Usage
export const DEFAULT_AI_MODEL = new PersistentConfig<string>(
  'DEFAULT_AI_MODEL',
  'ai.defaultModel',
  process.env.DEFAULT_AI_MODEL || 'googleai/gemini-2.5-flash'
)

export const MAX_SESSIONS_PER_USER = new PersistentConfig<number>(
  'MAX_SESSIONS_PER_USER',
  'sessions.maxPerUser',
  parseInt(process.env.MAX_SESSIONS_PER_USER || '100')
)
```

**Implementation Steps:**
1. Add storage table/file for config
2. Create `src/lib/config/persistent-config.ts`
3. Create `src/lib/config/config-db.ts` for storage operations
4. Migrate existing env vars to PersistentConfig where appropriate
5. Add config management API (optional)

**Files to create:**
- `src/lib/config/persistent-config.ts`
- `src/lib/config/config-db.ts`
- `src/app/api/config/route.ts` (API for config management)
- `docs/patterns/persistent-config.md`

**Benefits:**
- ✅ Runtime configuration changes
- ✅ User-editable settings
- ✅ Environment variable fallback
- ✅ Type-safe configuration

---

### 6. **Testing Patterns** (from cal.com)

**Why it fits:**
- Currently uses **Jest** (not Vitest)
- Repository pattern makes testing easier
- Better test organization patterns

**What to extract:**
```typescript
// tests/unit/lib/repositories/session-repository.test.ts
import { describe, it, expect, vi, beforeEach } from '@jest/globals'
import { SessionRepository } from '@/lib/repositories/session-repository'
import { promises as fs } from 'fs'

vi.mock('fs/promises')

describe('SessionRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create session with minimal select', async () => {
    const mockReadFile = vi.spyOn(fs, 'readFile').mockResolvedValue(
      JSON.stringify({ sessions: [] })
    )
    const mockWriteFile = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined)

    const repo = new SessionRepository()
    const session = await repo.create({
      userId: 'test@example.com',
      name: 'Test Session',
      model: 'googleai/gemini-2.5-flash',
      goal: 'Test goal',
      state: 'created',
      messages: [],
    })

    expect(mockReadFile).toHaveBeenCalled()
    expect(mockWriteFile).toHaveBeenCalled()
    expect(session.id).toBeDefined()
    expect(session.userId).toBe('test@example.com')
  })
})
```

**Implementation Steps:**
1. Create test utilities for mocking storage
2. Add example repository tests
3. Document testing patterns
4. Add to testing guidelines

**Files to create:**
- `tests/unit/lib/repositories/session-repository.test.ts` (example)
- `tests/utils/mock-storage.ts` (test utilities)
- `docs/testing/repository-pattern.md`

**Benefits:**
- ✅ Easier to test data access
- ✅ Better test performance
- ✅ Consistent testing patterns

---

## 🟡 Medium-Priority Mappings

### 7. **GraphQL Setup** (from hoppscotch)

**Why it fits:**
- studio might add **content management** features
- Better for **complex queries** (sessions, repositories, filtering)
- Can expose **public API** for integrations

**When to implement:**
- When adding content management
- When needing complex queries
- When exposing public API

---

## 🔴 Low-Priority Mappings

### 8. **Plugin System** (from eliza)

**Why it's low priority:**
- studio is an **application**, not a framework
- Plugin system adds **complexity**
- Most users won't need extensibility

**When to implement:**
- If studio becomes a framework
- If users request plugin support

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
1. ✅ **Biome Configuration**
   - Replace ESLint + Prettier
   - Update scripts
   - Test linting/formatting

### Phase 2: Foundation (3-5 days)
2. ✅ **Repository Pattern for File Storage**
   - Create base repository
   - Refactor `src/lib/db/agent-sessions.ts`
   - Add tests
   - Document pattern

3. ✅ **Testing Patterns**
   - Add test utilities
   - Document testing guidelines
   - Add example tests

### Phase 3: Provider Abstraction (1 week)
4. ✅ **Factory Pattern for AI Providers**
   - Create AI provider interface
   - Refactor Google Genkit to provider
   - Add factory
   - Document pattern

5. ✅ **Factory Pattern for Storage Providers**
   - Create storage provider interface
   - Refactor file storage to provider
   - Add factory
   - Document pattern

### Phase 4: Enhancement (1 week)
6. ✅ **Persistent Configuration**
   - Add storage for config
   - Create PersistentConfig class
   - Add API routes
   - Document usage

### Phase 5: Future (as needed)
7. ⏳ **GraphQL** (when needed)
8. ⏳ **Plugin System** (if becomes framework)

---

## Summary

### Immediate Actions
1. **Replace ESLint + Prettier with Biome** (high impact, low effort)
2. **Add repository pattern for file storage** (foundation for data access)
3. **Add factory pattern for AI providers** (enables multi-provider support)
4. **Add factory pattern for storage providers** (enables database migration)

### Future Considerations
- Persistent configuration when adding user-editable settings
- GraphQL when adding content management
- Plugin system if application becomes framework

---

## Files to Create/Modify

### New Files
```
src/lib/
├── repositories/
│   ├── base-repository.ts
│   └── session-repository.ts
├── providers/
│   ├── ai/
│   │   ├── base.ts
│   │   ├── factory.ts
│   │   └── google-genkit.ts
│   └── storage/
│       ├── base.ts
│       ├── factory.ts
│       └── file.ts
└── config/
    ├── persistent-config.ts
    └── config-db.ts

tests/
├── unit/
│   └── lib/
│       └── repositories/
│           └── session-repository.test.ts
└── utils/
    └── mock-storage.ts

docs/
├── patterns/
│   ├── repository-pattern.md
│   ├── factory-pattern.md
│   └── persistent-config.md
└── testing/
    └── repository-pattern.md
```

### Modified Files
```
package.json (scripts, dependencies)
.eslintrc.json → biome.json (replace)
.prettierrc.json (remove)
.lintstagedrc.json (update)
src/lib/db/agent-sessions.ts (refactor to use repository)
src/ai/genkit.ts (refactor to provider)
src/app/api/agents/chat/route.ts (use factory)
src/app/api/agents/chat-stream/route.ts (use factory)
env.example (add AI_PROVIDER, STORAGE_PROVIDER)
```

---

## Key Differences from Other Templates

1. **File-based Storage**
   - Repository pattern adapted for file I/O
   - Can migrate to real database later

2. **AI Integration**
   - Factory pattern for AI providers (Google, OpenAI, Anthropic)
   - More relevant for AI-powered applications

3. **Storage Providers**
   - Factory pattern for storage backends (file, Firebase, PostgreSQL)
   - Enables database migration without code changes

4. **Session State Machine**
   - Already has sophisticated state management
   - No changes needed here

5. **Kill-switch**
   - Already has fail-closed security model
   - No changes needed here

---

**Last Updated:** 2024-12-19  
**Target:** studio  
**Source Repositories:** cal.com, esperanto, omni-storage, open-webui, hoppscotch
