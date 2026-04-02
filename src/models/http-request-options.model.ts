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
 * @category Interfaces
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
     * HTTP headers for the request, replaces default headers when provided
     *
     * @public
     */
    headers?: HttpHeaders;
}
