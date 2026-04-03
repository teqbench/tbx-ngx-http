import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, retry, throwError, timer, timeout } from 'rxjs';

import {
    TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS,
    TBX_NGX_HTTP_RETRY_COUNT,
    TBX_NGX_HTTP_RETRY_DELAY_MS,
    TBX_NGX_HTTP_RETRYABLE_STATUSES,
} from '../constants/http.constants';

import type { TbxNgxHttpRequestOptions } from '../models/http-request-options.model';
import type { TbxNgxHttpBodyRequestOptions } from '../models/http-body-request-options.model';

/**
 * Abstract base class for feature services that interact with the API
 *
 * @remarks
 * Centralizes path resolution, default headers, and resilience patterns
 * (timeout, exponential-backoff retry on transient errors).
 *
 * Feature services extend this class, provide the base URL, and call
 * its typed methods. Only GET requests include the retry operator; mutating
 * methods (POST, PUT, PATCH, DELETE) intentionally skip retries.
 *
 * Subclasses can override resilience values by redeclaring the class property.
 *
 * @usage
 * Extend this class in feature services to inherit automatic timeout, retry,
 * URL resolution, and default header behavior. Provide `baseUrl` and call
 * the protected HTTP methods (get, post, put, patch, delete).
 *
 * @example
 * ```typescript
 * // UserService is a hypothetical consumer-defined subclass
 * @Injectable({ providedIn: 'root' })
 * export class UserService extends TbxNgxHttpService {
 *     protected override readonly baseUrl = environment.apiUrl;
 *
 *     getUser(id: string) {
 *         return this.get<User>(`users/${id}`);
 *     }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // SlowApiService is a hypothetical consumer-defined subclass
 * export class SlowApiService extends TbxNgxHttpService {
 *     protected override readonly baseUrl = environment.apiUrl;
 *     protected override readonly DEFAULT_TIMEOUT = 30_000;
 * }
 * ```
 *
 * @category Services
 * @displayName Base HTTP Service
 * @order 1
 * @since 1.0.0
 * @related TbxNgxHttpRequestOptions
 * @related TbxNgxHttpBodyRequestOptions
 * @related TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS
 * @related TBX_NGX_HTTP_RETRY_COUNT
 * @related TBX_NGX_HTTP_RETRY_DELAY_MS
 * @related TBX_NGX_HTTP_RETRYABLE_STATUSES
 *
 * @public
 */
export abstract class TbxNgxHttpService {
    /**
     * {@link https://angular.dev/api/common/http/HttpClient | HttpClient} instance injected via {@link https://angular.dev/api/core/inject | inject()}
     *
     * @public
     */
    protected readonly http = inject(HttpClient);

    /**
     * Base API URL — must be provided by the consuming application
     *
     * @public
     */
    protected abstract readonly baseUrl: string;

    /**
     * Request timeout in milliseconds
     *
     * @remarks
     * Defaults to {@link TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS}. Subclasses override
     * by redeclaring the property.
     *
     * @public
     */
    protected readonly DEFAULT_TIMEOUT: number = TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS;

    /**
     * Number of retry attempts for GET requests
     *
     * @remarks
     * Defaults to {@link TBX_NGX_HTTP_RETRY_COUNT}. Subclasses override
     * by redeclaring the property.
     *
     * @public
     */
    protected readonly RETRY_COUNT: number = TBX_NGX_HTTP_RETRY_COUNT;

    /**
     * Base delay in milliseconds for exponential backoff
     *
     * @remarks
     * Defaults to {@link TBX_NGX_HTTP_RETRY_DELAY_MS}. Subclasses override
     * by redeclaring the property.
     *
     * @public
     */
    protected readonly RETRY_DELAY: number = TBX_NGX_HTTP_RETRY_DELAY_MS;

    /**
     * Default headers applied to every request unless overridden per-call
     *
     * @remarks
     * {@link https://angular.dev/api/common/http/HttpClient | HttpClient} sets `Content-Type: application/json` automatically
     * when the body is a JavaScript object. `Accept` is not set by default —
     * this header signals that the service speaks JSON.
     *
     * When a caller passes `options.headers`, the defaults are replaced
     * entirely (not merged). This keeps behavior predictable — if a caller
     * provides headers, they own the full set.
     *
     * @public
     */
    protected readonly defaultHeaders = new HttpHeaders({
        Accept: 'application/json',
    });

    /**
     * Execute a GET request
     *
     * @remarks
     * Includes retries with exponential backoff because GET is idempotent
     * and safe to repeat on transient failure (5xx, network errors).
     *
     * @typeParam T - Expected response body type.
     * @param path - Relative path appended to {@link TbxNgxHttpService.baseUrl | baseUrl}.
     * @param options - Optional query parameters and headers.
     * @returns An Observable emitting the typed response body.
     *
     * @public
     */
    protected get<T>(path: string, options?: TbxNgxHttpRequestOptions): Observable<T> {
        return this.http
            .get<T>(this.url(path), {
                params: options?.params,
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT), this.withRetry());
    }

    /**
     * Execute a POST request
     *
     * @remarks
     * Retries are disabled to prevent duplicate record creation (non-idempotent).
     *
     * @typeParam T - Expected response body type.
     * @param path - Relative path appended to {@link TbxNgxHttpService.baseUrl | baseUrl}.
     * @param body - Request payload.
     * @param options - Optional headers.
     * @returns An Observable emitting the typed response body.
     *
     * @public
     */
    protected post<T>(
        path: string,
        body: unknown,
        options?: TbxNgxHttpBodyRequestOptions
    ): Observable<T> {
        return this.http
            .post<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Execute a PUT request (full replacement)
     *
     * @remarks
     * Retries are disabled by default to maintain strict idempotency safety
     * across varying backend implementations.
     *
     * @typeParam T - Expected response body type.
     * @param path - Relative path appended to {@link TbxNgxHttpService.baseUrl | baseUrl}.
     * @param body - Request payload.
     * @param options - Optional headers.
     * @returns An Observable emitting the typed response body.
     *
     * @public
     */
    protected put<T>(
        path: string,
        body: unknown,
        options?: TbxNgxHttpBodyRequestOptions
    ): Observable<T> {
        return this.http
            .put<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Execute a PATCH request (partial update)
     *
     * @remarks
     * Retries are disabled as concurrent partial updates can lead to race conditions.
     *
     * @typeParam T - Expected response body type.
     * @param path - Relative path appended to {@link TbxNgxHttpService.baseUrl | baseUrl}.
     * @param body - Request payload.
     * @param options - Optional headers.
     * @returns An Observable emitting the typed response body.
     *
     * @public
     */
    protected patch<T>(
        path: string,
        body: unknown,
        options?: TbxNgxHttpBodyRequestOptions
    ): Observable<T> {
        return this.http
            .patch<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Execute a DELETE request
     *
     * @remarks
     * Retries are disabled to avoid 404/410 errors on subsequent automated
     * attempts if the first request actually succeeded but the response was lost.
     *
     * @typeParam T - Expected response body type.
     * @param path - Relative path appended to {@link TbxNgxHttpService.baseUrl | baseUrl}.
     * @param options - Optional query parameters and headers.
     * @returns An Observable emitting the typed response body.
     *
     * @public
     */
    protected delete<T>(path: string, options?: TbxNgxHttpRequestOptions): Observable<T> {
        return this.http
            .delete<T>(this.url(path), {
                params: options?.params,
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Resolve a relative path against the base URL.
     *
     * @param path - Relative path segment.
     * @returns Fully qualified URL.
     */
    private url(path: string): string {
        return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    }

    /**
     * Return a custom {@link https://rxjs.dev | RxJS} retry operator with exponential backoff
     *
     * @remarks
     * Only retries transient errors (status codes in
     * {@link TBX_NGX_HTTP_RETRYABLE_STATUSES}). Non-retryable errors (4xx client
     * errors except 408/429) are re-thrown immediately — repeating a malformed
     * request will not produce a different result.
     *
     * Non-HttpErrorResponse errors — including `TimeoutError` from the upstream
     * `timeout()` operator — are always retried. This is intentional: GET requests
     * are idempotent, and a timeout is a transient failure that may succeed on the
     * next attempt. Mutating methods (POST, PUT, PATCH, DELETE) do not use this
     * operator, so timeouts on those methods are never retried.
     *
     * Backoff formula: `RETRY_DELAY * 2^(attempt - 1)`
     *
     * @typeParam T - Observable element type.
     * @returns An {@link https://rxjs.dev | RxJS} operator function that applies the retry strategy.
     *
     * @public
     */
    protected withRetry() {
        const count = this.RETRY_COUNT;
        const retryDelay = this.RETRY_DELAY;

        return <T>(source: Observable<T>): Observable<T> =>
            source.pipe(
                retry({
                    count,
                    delay: (error: unknown, attempt: number) => {
                        if (
                            error instanceof HttpErrorResponse &&
                            !TBX_NGX_HTTP_RETRYABLE_STATUSES.has(error.status)
                        ) {
                            return throwError(() => error);
                        }

                        const backoff = retryDelay * Math.pow(2, attempt - 1);
                        return timer(backoff);
                    },
                })
            );
    }
}
