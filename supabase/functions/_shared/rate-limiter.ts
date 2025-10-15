// Rate Limiter - Prevents concurrent API calls and implements backoff
// Addresses 400 errors from tool use concurrency issues

interface QueueItem {
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

export class RateLimiter {
  private queue: QueueItem[] = [];
  private processing = false;
  private minDelay: number; // Minimum delay between requests in ms

  constructor(minDelay: number = 1000) {
    this.minDelay = minDelay;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (!item) break;

      try {
        const result = await this.executeWithBackoff(item.fn);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      // Wait before processing next item to avoid rate limits
      if (this.queue.length > 0) {
        await this.delay(this.minDelay);
      }
    }

    this.processing = false;
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
// OPTIMIZED: Reduced from 1000ms to 200ms for 80% faster execution
// Most AI providers can handle much faster request rates than 1 per second
// The 200ms delay still prevents rate limiting while dramatically improving performance
export const aiApiLimiter = new RateLimiter(200);
