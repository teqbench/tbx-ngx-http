import { StatusCodes } from 'http-status-codes';

/**
 * Default request timeout in milliseconds
 *
 * @remarks
 * Applied to every HTTP request made through {@link TbxNgxBaseHttpService}.
 * Subclasses override by redeclaring the `DEFAULT_TIMEOUT` class property.
 *
 * @usage
 * Import directly when building a custom retry or timeout strategy outside of
 * TbxNgxBaseHttpService.
 *
 * @example
 * ```typescript
 * import { TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS } from '@teqbench/tbx-ngx-http';
 * ```
 *
 * @category Constants
 * @displayName Default Timeout
 * @order 1
 * @since 1.0.0
 * @related TbxNgxBaseHttpService
 *
 * @public
 */
export const TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Number of retry attempts for idempotent requests (GET only)
 *
 * @remarks
 * Controls how many times a failed GET request is retried before the error
 * propagates to the caller. Subclasses of {@link TbxNgxBaseHttpService} override
 * by redeclaring the `RETRY_COUNT` class property.
 *
 * @usage
 * Import directly when building a custom retry strategy outside of
 * TbxNgxBaseHttpService.
 *
 * @example
 * ```typescript
 * import { TBX_NGX_HTTP_RETRY_COUNT } from '@teqbench/tbx-ngx-http';
 * ```
 *
 * @category Constants
 * @displayName Retry Count
 * @order 2
 * @since 1.0.0
 * @related TbxNgxBaseHttpService
 *
 * @public
 */
export const TBX_NGX_HTTP_RETRY_COUNT = 2;

/**
 * Base delay in milliseconds for exponential backoff between retries
 *
 * @remarks
 * The actual delay follows the formula `RETRY_DELAY * 2^(attempt - 1)`.
 * Subclasses of {@link TbxNgxBaseHttpService} override by redeclaring the
 * `RETRY_DELAY` class property.
 *
 * @usage
 * Import directly when building a custom backoff strategy outside of
 * TbxNgxBaseHttpService.
 *
 * @example
 * ```typescript
 * import { TBX_NGX_HTTP_RETRY_DELAY_MS } from '@teqbench/tbx-ngx-http';
 * ```
 *
 * @category Constants
 * @displayName Retry Delay
 * @order 3
 * @since 1.0.0
 * @related TbxNgxBaseHttpService
 *
 * @public
 */
export const TBX_NGX_HTTP_RETRY_DELAY_MS = 1_000;

/**
 * HTTP status codes eligible for automatic retry
 *
 * @remarks
 * Only transient server errors and network failures are retried.
 * 4xx client errors (except 408 and 429) indicate a malformed request
 * that will not succeed on retry.
 *
 * Included status codes:
 *
 * - `0` — Network error (no response received; browser reports status 0)
 *
 * - `408` — Request Timeout
 *
 * - `429` — Too Many Requests (rate-limited; retry after backoff)
 *
 * - `500` — Internal Server Error
 *
 * - `502` — Bad Gateway
 *
 * - `503` — Service Unavailable
 *
 * - `504` — Gateway Timeout
 *
 * @usage
 * Import directly when implementing a custom retry predicate that needs to
 * reference the same set of retryable statuses used by TbxNgxBaseHttpService.
 *
 * @example
 * ```typescript
 * import { TBX_NGX_HTTP_RETRYABLE_STATUSES } from '@teqbench/tbx-ngx-http';
 *
 * if (TBX_NGX_HTTP_RETRYABLE_STATUSES.has(response.status)) {
 *     // retry logic
 * }
 * ```
 *
 * @category Constants
 * @displayName Retryable Statuses
 * @order 4
 * @since 1.0.0
 * @related TbxNgxBaseHttpService
 *
 * @public
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
