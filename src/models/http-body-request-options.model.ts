import { HttpHeaders } from '@angular/common/http';

/**
 * Options accepted by body HTTP methods (POST, PUT, PATCH)
 *
 * @remarks
 * Passed as the optional third argument to
 * {@link TbxNgxHttpService.post | post},
 * {@link TbxNgxHttpService.put | put}, and
 * {@link TbxNgxHttpService.patch | patch}. When `headers` is provided,
 * the service's default headers are replaced entirely (not merged).
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
     * {@link https://angular.dev/api/common/http/HttpHeaders | HttpHeaders} for the request, replaces default headers when provided
     *
     * @public
     */
    headers?: HttpHeaders;
}
