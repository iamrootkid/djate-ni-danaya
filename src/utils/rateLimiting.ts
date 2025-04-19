interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  logout: {
    maxAttempts: 3,
    windowMs: 1 * 60 * 1000, // 1 minute
  },
  api: {
    maxAttempts: 100,
    windowMs: 1 * 60 * 1000, // 1 minute
  },
};

const rateLimitStates = new Map<string, RateLimitState>();

export function shouldRateLimit(action: keyof typeof RATE_LIMIT_CONFIGS, identifier: string = 'default'): boolean {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) {
    console.warn(`No rate limit config found for action: ${action}`);
    return false;
  }

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const state = rateLimitStates.get(key);

  // If no state exists or window has expired, create new state
  if (!state || (now - state.windowStart) > config.windowMs) {
    rateLimitStates.set(key, {
      attempts: 1,
      windowStart: now,
    });
    return false;
  }

  // If within window, check attempts
  if (state.attempts >= config.maxAttempts) {
    // Calculate remaining time in window
    const remainingMs = config.windowMs - (now - state.windowStart);
    console.warn(`Rate limit exceeded for ${action}. Try again in ${Math.ceil(remainingMs / 1000)} seconds.`);
    return true;
  }

  // Increment attempts
  state.attempts += 1;
  rateLimitStates.set(key, state);
  return false;
}

export function getRateLimitInfo(action: keyof typeof RATE_LIMIT_CONFIGS, identifier: string = 'default'): {
  remaining: number;
  resetIn: number;
} | null {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) return null;

  const key = `${action}:${identifier}`;
  const state = rateLimitStates.get(key);
  if (!state) {
    return {
      remaining: config.maxAttempts,
      resetIn: 0,
    };
  }

  const now = Date.now();
  const windowElapsed = now - state.windowStart;

  // If window has expired
  if (windowElapsed > config.windowMs) {
    return {
      remaining: config.maxAttempts,
      resetIn: 0,
    };
  }

  return {
    remaining: Math.max(0, config.maxAttempts - state.attempts),
    resetIn: config.windowMs - windowElapsed,
  };
}

export function clearRateLimit(action: keyof typeof RATE_LIMIT_CONFIGS, identifier: string = 'default'): void {
  const key = `${action}:${identifier}`;
  rateLimitStates.delete(key);
}

// Cleanup old rate limit states periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateLimitStates.entries()) {
    const [action] = key.split(':');
    const config = RATE_LIMIT_CONFIGS[action as keyof typeof RATE_LIMIT_CONFIGS];
    if (config && (now - state.windowStart) > config.windowMs) {
      rateLimitStates.delete(key);
    }
  }
}, 60000); // Clean up every minute 