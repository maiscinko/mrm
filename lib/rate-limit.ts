type RateLimitStore = Map<string, { count: number; resetAt: number }>

const store: RateLimitStore = new Map()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 },
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) {
      store.delete(k)
    }
  }

  const record = store.get(key)

  if (!record || record.resetAt < now) {
    // New window
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: config.maxRequests - 1, resetAt }
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment count
  record.count++
  store.set(key, record)
  return { success: true, remaining: config.maxRequests - record.count, resetAt: record.resetAt }
}
