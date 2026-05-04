import { HttpHeaders } from '@angular/common/http';

/**
 * Options accepted by body HTTP methods (POST, PUT, PATCH)
 *
 * @remarks
 * Passed as the optional third argument to
 * {@link TbxNgxHttpService.post | post},
 * {@link TbxNgxHttpService.put | put}, and
 * {@link TbxNgxHttpService.patch | patch}. When `headers` is provided,
 * the service's default headers are replaced entirely by default; pass
 * `mergeHeaders: true` to merge instead.
 *
 * @usage
 * Pass an instance of this interface to customize headers on POST, PUT, and
 * PATCH requests made through {@link TbxNgxHttpService}.
 *
 * @example
 * ```typescript
 * import { HttpHeaders } from '@angular/common/http';
 * import { TbxNgxHttpBodyRequestOptions } from '@teqbench/tbx-ngx-http';
 *
 * const options: TbxNgxHttpBodyRequestOptions = {
 *     headers: new HttpHeaders({ Authorization: 'Bearer token' }),
 * };
 * ```
 *
 * @category Interface
 * @displayName HTTP Body Request Options
 * @order 3
 * @since 1.0.0
 * @related TbxNgxHttpService
 * @related TbxNgxHttpRequestOptions
 *
 * @public
 */
export interface TbxNgxHttpBodyRequestOptions {
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
     * Opt this body method into the retry pipeline
     *
     * @remarks
     * POST, PUT, and PATCH skip retry by default to avoid duplicate writes on
     * transient failure. Set `retry: true` for endpoints the caller knows to be
     * idempotent and safe to repeat (e.g. a PUT that fully replaces a resource
     * by id, or a PATCH whose JSON-merge-patch payload is genuinely commutative).
     *
     * @public
     */
    retry?: boolean;
}
