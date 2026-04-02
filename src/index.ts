/**
 * Public API surface for `@teqbench/tbx-ngx-http`
 *
 * @remarks
 * This barrel file provides a centralized entry point for base HTTP communication
 * services and resilience constants. Feature services extend
 * {@link TbxNgxBaseHttpService} to get automatic retries with exponential backoff
 * on GET requests, timeout handling, consistent URL resolution, and default headers.
 *
 * Resilience constants ({@link TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS},
 * {@link TBX_NGX_HTTP_RETRY_COUNT}, {@link TBX_NGX_HTTP_RETRY_DELAY_MS},
 * {@link TBX_NGX_HTTP_RETRYABLE_STATUSES}) are exported for direct use by
 * consuming applications that need to reference the library defaults.
 *
 * @packageDocumentation
 */
export * from './constants/http.constants';
export {
    TbxNgxBaseHttpService,
    type TbxNgxHttpRequestOptions,
    type TbxNgxHttpBodyRequestOptions,
} from './services/base-http.service';
