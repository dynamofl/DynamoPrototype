// Rate Limiter - Implements backoff on errors while allowing parallel execution
// OPTIMIZED: Allows concurrent API calls with retry logic, but no artificial delays

export class RateLimiter {
  private minDelay: number; // Minimum delay between requests in ms (0 = no delay, full parallelization)
  private maxConcurrent: number; // Maximum concurrent requests
  private activeRequests: number = 0;
  private lastRequestTime: number = 0;

  constructor(minDelay: number = 0, maxConcurrent: number = 50) {
    this.minDelay = minDelay;
    this.maxConcurrent = maxConcurrent;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if we've hit the concurrency limit
    while (this.activeRequests >= this.maxConcurrent) {
      await this.delay(10); // Small delay to check again
    }

    // Enforce minimum delay between requests (if configured)
    if (this.minDelay > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelay) {
        await this.delay(this.minDelay - timeSinceLastRequest);
      }
    }

    this.lastRequestTime = Date.now();
    this.activeRequests++;

    try {
      const result = await this.executeWithBackoff(fn);
      return result;
    } finally {
      this.activeRequests--;
    }
  }

  private async executeWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 2000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if it's a rate limit or concurrency error
        const is400Error = error instanceof Error &&
          (error.message.includes('400') ||
           error.message.includes('rate') ||
           error.message.includes('concurrency') ||
           error.message.includes('tool use'));

        if (is400Error && attempt < maxRetries) {
          // Exponential backoff: 2s, 4s, 8s
          const delayMs = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})`);
          await this.delay(delayMs);
          continue;
        }

        // If it's not a rate limit error, or we've exhausted retries, throw
        if (attempt === maxRetries) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('Unknown error in executeWithBackoff');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global rate limiter instance for AI API calls
// OPTIMIZED: No artificial delays (minDelay = 0) for full parallelization
// Allows up to 50 concurrent requests with automatic retry on rate limit errors
// This enables true parallel processing while still handling rate limits gracefully
export const aiApiLimiter = new RateLimiter(0, 50);
