import { HttpHeaders, HttpParams } from '@angular/common/http';

/**
 * Options accepted by non-body HTTP methods (GET, DELETE)
 *
 * @remarks
 * Passed as the optional second argument to
 * {@link TbxNgxHttpService.get | get} and
 * {@link TbxNgxHttpService.delete | delete}. When `headers` is provided,
 * the service's default headers are replaced entirely (not merged).
 *
 * @usage
 * Pass an instance of this interface to customize query parameters or headers
 * on GET and DELETE requests made through {@link TbxNgxHttpService}.
 *
 * @example
 * ```typescript
 * import { HttpParams } from '@angular/common/http';
 * import { TbxNgxHttpRequestOptions } from '@teqbench/tbx-ngx-http';
 *
 * const options: TbxNgxHttpRequestOptions = {
 *     params: new HttpParams().set('page', '1'),
 * };
 * ```
 *
 * @category Interface
 * @displayName HTTP Request Options
 * @order 2
 * @since 1.0.0
 * @related TbxNgxHttpService
 * @related TbxNgxHttpBodyRequestOptions
 *
 * @public
 */
export interface TbxNgxHttpRequestOptions {
    /**
     * Query parameters appended to the request URL
     *
     * @public
     */
    params?: HttpParams;
    /**
     * {@link https://angular.dev/api/common/http/HttpHeaders | HttpHeaders} for the request
     *
     * @remarks
     * By default, when `headers` is provided the service's default headers are
     * replaced entirely. Set `mergeHeaders: true` to merge instead — caller-provided
     * keys win, default keys fill any gaps.
     *
     * @public
     */
    headers?: HttpHeaders;
    /**
     * Merge `headers` with the service's default headers instead of replacing them
     *
     * @remarks
     * When `true`, caller-provided header keys take precedence over defaults; any
     * default keys not set by the caller are preserved. When `false` or omitted,
     * `headers` (when provided) replaces the defaults entirely. Has no effect when
     * `headers` is not provided.
     *
     * @public
     */
    mergeHeaders?: boolean;
    /**
     * Override the service's default retry behavior for this request
     *
     * @remarks
     * GET defaults to `true` (retries on transient failures). DELETE defaults to
     * `false`. Set `retry: true` on a DELETE call when the underlying endpoint is
     * idempotent and safe to repeat; set `retry: false` on a GET to disable retries
     * for a single call.
     *
     * @public
     */
    retry?: boolean;
}
