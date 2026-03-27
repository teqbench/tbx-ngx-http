import { StatusCodes } from 'http-status-codes';

/**
 * HTTP resilience defaults for TbxNgxBaseHttpService.
 *
 * These are the library-shipped defaults. Subclasses override behavior
 * by redeclaring the corresponding class property on TbxNgxBaseHttpService —
 * they do not need to import this file directly.
 *
 * Consuming apps that need to reference the defaults (e.g., in a custom
 * retry strategy) can import from '@teqbench/tbx-ngx-http':
 *
 * @example
 * ```typescript
 * import { TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS, TBX_NGX_HTTP_RETRYABLE_STATUSES } from '@teqbench/tbx-ngx-http';
 * ```
 */

/** Default request timeout in milliseconds. */
export const TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS = 10_000;

/** Number of retry attempts for idempotent requests (GET only). */
export const TBX_NGX_HTTP_RETRY_COUNT = 2;

/** Base delay in milliseconds for exponential backoff between retries. */
export const TBX_NGX_HTTP_RETRY_DELAY_MS = 1_000;

/**
 * HTTP status codes eligible for automatic retry.
 *
 * Only transient server errors and network failures are retried.
 * 4xx client errors (except 408 and 429) indicate a malformed request
 * that will not succeed on retry.
 *
 * - `0`   — Network error (no response received; browser reports status 0)
 * - `408` — Request Timeout (server did not receive a complete request in time)
 * - `429` — Too Many Requests (rate-limited; retry after backoff)
 * - `500` — Internal Server Error (generic server failure)
 * - `502` — Bad Gateway (upstream server returned an invalid response)
 * - `503` — Service Unavailable (server temporarily overloaded or in maintenance)
 * - `504` — Gateway Timeout (upstream server did not respond in time)
 */
export const TBX_NGX_HTTP_RETRYABLE_STATUSES = new Set([
    0, // Network error — no HTTP standard; browser-specific status when no response is received
    StatusCodes.REQUEST_TIMEOUT,
    StatusCodes.TOO_MANY_REQUESTS,
    StatusCodes.INTERNAL_SERVER_ERROR,
    StatusCodes.BAD_GATEWAY,
    StatusCodes.SERVICE_UNAVAILABLE,
    StatusCodes.GATEWAY_TIMEOUT,
]);
