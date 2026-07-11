# AI Provider Layer — SmartQuiz AI

This document provides the complete technical reference for the AI Gateway that powers SmartQuiz AI.

---

## Overview

The AI Provider Layer is a **modular, SOLID-compliant, provider-agnostic AI gateway** built inside `server/services/ai/`. It provides:

- Multi-provider fallback (OpenRouter → Gemini → Local)
- Automatic model rotation with health-based selection
- Circuit breaking, exponential backoff retries
- Response normalization across all providers
- Configurable caching with SHA-256 keys
- Real-time in-memory telemetry + 5-minute DB persistence
- Prompt injection mitigation

---

## Directory Structure

```
server/services/ai/
├── AIProvider.js              # Abstract base class interface
├── ProviderFactory.js         # Orchestrator — fallback logic
├── OpenRouterProvider.js      # Primary AI provider
├── GeminiProvider.js          # Secondary fallback provider
├── LocalIntelligenceProvider.js # Offline tertiary fallback
├── ModelSelector.js           # Round-robin + health model selection
├── CircuitBreaker.js          # Per-model failure isolation
├── RetryManager.js            # Exponential backoff (1s → 2s → 4s)
├── PromptTemplates.js         # Centralized prompt strings
├── ResponseFormatter.js       # Normalized response schema
├── CacheProvider.js           # Abstract cache interface
├── CacheFactory.js            # Cache provider selection (memory/redis)
├── MemoryCacheProvider.js     # In-memory Map-based cache
├── UsageTracker.js            # Real-time in-memory metrics
└── MetricsPersister.js        # Periodic MongoDB flush (every 5 min)
```

---

## Provider Priority

```
Request
  │
  ▼
ProviderFactory.generateWithFallback()
  │
  ├─ 1. OpenRouterProvider.generateText()
  │       └─ ModelSelector → next healthy model
  │           └─ CircuitBreaker.isHealthy(model)?
  │               ├─ Yes → RetryManager.execute(API call)
  │               │         ├─ Success → return response
  │               │         └─ Fail → CircuitBreaker.recordFailure(model)
  │               └─ No  → try next model
  │           └─ All models unhealthy → throw
  │
  ├─ 2. GeminiProvider.generateText()
  │       └─ RetryManager.execute(Gemini API)
  │           ├─ Success → return response
  │           └─ Fail → throw
  │
  ├─ 3. LocalIntelligenceProvider.generateText()
  │       └─ Intent classification (keyword matching)
  │           ├─ quiz     → MongoDB question bank query
  │           ├─ explain  → Template-based explanation
  │           ├─ recommend→ Rule-based topic suggestion
  │           └─ default  → Offline chatbot message
  │
  └─ All fail → throw "AI services unavailable"
```

---

## Streaming Fallback Chain

For `/api/ai/chat` streaming responses:

```
1. OpenRouter Stream  (native SSE)
       ↓ fail
2. OpenRouter Block   (simulate stream from blocking response)
       ↓ fail
3. Gemini Stream      (native SSE)
       ↓ fail
4. Gemini Block       (simulate stream from blocking response)
       ↓ fail
5. Local Engine       (synthetic micro-chunk streaming)
       ↓ fail
6. Graceful Error     (SSE error event, never crashes client)
```

---

## Resilience Components

### CircuitBreaker

- **Threshold:** 3 consecutive failures → trip
- **Cooldown:** 5 minutes
- **Recovery:** Automatic. After cooldown, model is tested again.
- **Scope:** Per model name (not per provider). Other models remain available.

```js
// Usage inside OpenRouterProvider
if (!circuitBreaker.isHealthy(model)) skip to next model;
try {
  const res = await apiCall();
  circuitBreaker.recordSuccess(model);
} catch (err) {
  circuitBreaker.recordFailure(model); // trips at 3
}
```

### RetryManager

- **Max Retries:** 3
- **Delays:** 1000ms → 2000ms → 4000ms
- **Retryable errors:** HTTP 429, HTTP 5xx, `ECONNABORTED`, timeout messages

### ModelSelector

- **Strategy:** Round-robin across the 5 configured free OpenRouter models
- **Health Check:** Skips any model the CircuitBreaker has tripped
- **Fallback:** If all 5 models are in cooldown, throws to allow Gemini fallback

**Configured Models (in priority order):**
1. `meta-llama/llama-3.3-70b-instruct:free`
2. `deepseek/deepseek-r1:free`
3. `mistralai/mistral-small-3.2-24b-instruct:free`
4. `google/gemma-3-27b-it:free`
5. `qwen/qwen3-coder:free`

---

## Caching

| Setting | Value |
|---|---|
| Default Provider | `MemoryCacheProvider` (in-memory `Map`) |
| Key Strategy | `SHA-256(prefix + prompt)` |
| Default TTL | 1800 seconds (30 minutes) |
| Configurable via | `CACHE_PROVIDER=memory` or `CACHE_PROVIDER=redis` |

### What is Cached

| Operation | Cached |
|---|---|
| Quiz generation | ✅ Yes |
| Answer explanations | ✅ Yes |
| Study recommendations | ✅ Yes |
| Chatbot conversation | ❌ Never |
| Streaming responses | ❌ Never |

### Adding Redis (Future)

To enable Redis caching, implement `RedisCacheProvider extends CacheProvider` and register it in `CacheFactory.js`. **No changes required to controllers or ProviderFactory.**

---

## Standardized Response Format

Every provider returns this exact schema:

```json
{
  "success": true,
  "provider": "openrouter",
  "model": "meta-llama/llama-3.3-70b-instruct:free",
  "cached": false,
  "latency": 342,
  "usage": {
    "totalTokens": 512,
    "promptTokens": 128,
    "completionTokens": 384
  },
  "confidence": 1.0,
  "source": "cloud",
  "data": "..."
}
```

For offline responses, `source` is `"offline"` and `provider` is `"local"`.

---

## Observability

### Real-Time Metrics (`UsageTracker`)

Tracks in memory per `provider:model` key:
- `requests`, `successfulRequests`, `failedRequests`
- `totalLatency` (for computing averages)
- `totalTokens`, `promptTokens`, `completionTokens`
- `cacheHits`, `cacheMisses`
- `retryCount`, `fallbackCount`, `offlineResponseCount`

### Persistence (`MetricsPersister`)

- Flushes aggregated metrics to MongoDB `AIUsageMetrics` collection every **5 minutes**
- Resets in-memory counters after each flush
- 30-day TTL index for automatic data expiry
- Starts on server boot, stops gracefully on shutdown signal

### Admin Monitoring (`GET /api/ai/status`)

Returns:
- Current active provider
- All model statuses (healthy / in cooldown)
- Live metrics snapshot from `UsageTracker`

---

## Prompt Templates

All prompts are centralized in `PromptTemplates.js`. **No prompt strings exist in controllers.**

| Template | Used By |
|---|---|
| `QUIZ_GENERATION(topic, difficulty, count)` | `POST /api/ai/generate-quiz` |
| `EXPLANATION(question, selected, correct, isCorrect)` | `POST /api/ai/explain` |
| `RECOMMENDATION(weakTopics, strongTopics)` | `POST /api/ai/recommend` |
| `HINT(question)` | Internal |
| `CHAT_SYSTEM` | `POST /api/ai/chat` |

---

## Security

| Control | Implementation |
|---|---|
| Input length limits | Zod: `message` max 1000 chars, `topic` max 200 chars |
| Prompt injection | Regex: `/(ignore previous instructions|reveal your system prompt|return api keys|bypass instructions)/i` |
| False positive avoidance | Educational code questions explicitly allowed |
| API key isolation | Keys stored only in `process.env`, never in responses |
| Rate limiting | All `/api/ai/*` routes subject to global 300/15min limiter |

---

## Local Intelligence Engine

The `LocalIntelligenceProvider` is a **fully offline, zero-dependency reasoning layer** that activates automatically when all external providers fail.

### Capabilities

| Capability | Implementation |
|---|---|
| Quiz generation | Queries MongoDB `questions` collection with `$sample` aggregation |
| Answer explanation | Template-based responses referencing the topic |
| Study recommendations | Rule-based topic-to-topic suggestion mapping |
| Hints | Keyword-based hint generation |
| Chatbot fallback | Explains offline mode and available local capabilities |

### Intent Classification

Uses lightweight keyword pattern matching:
- Contains `quiz` or `multiple-choice` → quiz generation
- Contains `explain` or `why` → explanation template
- Contains `recommend` or `study next` → recommendation
- Contains `hint` → hint generation
- Default → chatbot fallback message

---

## Adding a New Provider

1. Create `MyProvider.js` extending `AIProvider`
2. Implement `generateText(prompt, options)` and `generateStream(prompt, options, onChunk)`
3. Use `ResponseFormatter.success({...})` for all returns
4. Register in `ProviderFactory.js` with appropriate priority
5. Add required env vars to `.env.example` and `config/env.js`

No other files need to change.

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Environment Variables](./ENVIRONMENT.md)
- [API Reference](./API.md)
