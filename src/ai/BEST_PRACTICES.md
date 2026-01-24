# AI Module Best Practices (`src/ai/`)

Best practices for AI and Genkit integration modules.

## Directory Purpose

The `ai/` directory contains AI/Genkit integration code. This is where AI framework configuration and initialization happens.

## File Structure

```
ai/
├── genkit.ts      # Genkit AI framework configuration
├── dev.ts         # Development AI configuration
└── BEST_PRACTICES.md  # This file
```

## Best Practices

### 1. **AI Framework Configuration**

**Practice:** Centralize AI framework configuration in `genkit.ts`

**Example:**

```typescript
/**
 * Genkit AI instance configured with Google AI provider.
 *
 * Provides:
 * - ai.generate() - Non-streaming generation
 * - ai.generateStream() - Streaming generation
 */
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: env.GOOGLE_AI_API_KEY,
    }),
  ],
});
```

**Benefits:**

- Single source of truth for AI configuration
- Easy to switch providers
- Centralized API key management

### 2. **Environment Variable Usage**

**Practice:** Always use `@/lib/env` for environment variables

**Example:**

```typescript
import { env } from '@/lib/env';

// Use env.GOOGLE_AI_API_KEY, not process.env directly
```

**Benefits:**

- Type safety
- Validation
- Centralized configuration

### 3. **Model Configuration**

**Practice:** Keep model configuration separate from framework setup

**Structure:**

- `ai/genkit.ts` - Framework initialization
- `lib/ai-models.ts` - Model configuration and selection

**Benefits:**

- Separation of concerns
- Easier to test
- Reusable model configuration

### 4. **Development vs Production**

**Practice:** Use `dev.ts` for development-specific AI configuration

**Example:**

```typescript
// dev.ts - Development-only configuration
// Can include debugging, mock responses, etc.
```

**Benefits:**

- Development tools don't affect production
- Easier debugging
- Can use different models in dev

### 5. **Error Handling**

**Practice:** Handle AI API errors gracefully

**Example:**

```typescript
try {
  const response = await ai.generate({ model, prompt });
} catch (error) {
  if (error instanceof AIAPIError) {
    // Handle AI-specific errors
  }
  throw error;
}
```

### 6. **Streaming Support**

**Practice:** Support both streaming and non-streaming generation

**Example:**

```typescript
// Non-streaming
export async function generate(prompt: string) {
  return ai.generate({ model, prompt });
}

// Streaming
export async function* generateStream(prompt: string) {
  yield* ai.generateStream({ model, prompt });
}
```

### 7. **Type Safety**

**Practice:** Define types for AI responses

**Example:**

```typescript
interface AIResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}
```

## Related Files

- `src/lib/ai-models.ts` - Model configuration
- `src/app/api/agents/chat/route.ts` - Chat endpoint using AI
- `src/app/api/agents/chat-stream/route.ts` - Streaming chat endpoint

## Anti-Patterns

### ❌ Don't

- ❌ Hardcode API keys in code
- ❌ Mix AI framework code with business logic
- ❌ Use `process.env` directly (use `@/lib/env`)
- ❌ Create multiple AI instances
- ❌ Skip error handling for AI calls

### ✅ Do

- ✅ Use environment variables via `@/lib/env`
- ✅ Keep AI configuration separate from business logic
- ✅ Handle AI errors gracefully
- ✅ Support both streaming and non-streaming
- ✅ Document model configuration

## Future Enhancements

- [ ] Support multiple AI providers (OpenAI, Anthropic)
- [ ] Model selection based on request
- [ ] Response caching
- [ ] Rate limiting
- [ ] Cost tracking
