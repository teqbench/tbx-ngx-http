import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, retry, throwError, timer, timeout } from 'rxjs';

import {
    HTTP_DEFAULT_TIMEOUT_MS,
    HTTP_RETRY_COUNT,
    HTTP_RETRY_DELAY_MS,
    HTTP_RETRYABLE_STATUSES,
} from '../constants/http.constants';

/** Options accepted by non-body methods (GET, DELETE). */
export interface HttpRequestOptions {
    params?: HttpParams;
    headers?: HttpHeaders;
}

/** Options accepted by body methods (POST, PUT, PATCH). */
export interface HttpBodyRequestOptions {
    headers?: HttpHeaders;
}

/**
 * Abstract base class for feature services that interact with the API.
 *
 * Centralizes path resolution, default headers, and resilience patterns
 * (timeout, exponential-backoff retry on transient errors).
 *
 * Feature services extend this class, provide the base URL, and call
 * its typed methods:
 *
 * @example
 * ```typescript
 * @Injectable({ providedIn: 'root' })
 * export class UserService extends BaseHttpService {
 *     protected override readonly baseUrl = environment.apiUrl;
 *
 *     getUser(id: string) {
 *         return this.get<User>(`users/${id}`);
 *     }
 * }
 * ```
 *
 * Subclasses can override resilience values by redeclaring the class property:
 *
 * @example
 * ```typescript
 * export class SlowApiService extends BaseHttpService {
 *     protected override readonly baseUrl = environment.apiUrl;
 *     protected override readonly DEFAULT_TIMEOUT = 30_000;
 * }
 * ```
 */
export abstract class BaseHttpService {
    protected readonly http = inject(HttpClient);

    /** Base API URL — must be provided by the consuming application. */
    protected abstract readonly baseUrl: string;

    /**
     * Resilience configuration — sourced from http.constants.ts.
     * Subclasses override by redeclaring the property; they do not need
     * to import the constants file directly.
     */
    protected readonly DEFAULT_TIMEOUT: number = HTTP_DEFAULT_TIMEOUT_MS;
    protected readonly RETRY_COUNT: number = HTTP_RETRY_COUNT;
    protected readonly RETRY_DELAY: number = HTTP_RETRY_DELAY_MS;

    /**
     * Default headers applied to every request unless overridden per-call.
     *
     * Angular's HttpClient sets Content-Type: application/json automatically
     * when the body is a JavaScript object. Accept is not set by default —
     * this header signals that the service speaks JSON.
     *
     * When a caller passes `options.headers`, the defaults are replaced
     * entirely (not merged). This keeps behavior predictable — if a caller
     * provides headers, they own the full set.
     */
    protected readonly defaultHeaders = new HttpHeaders({
        Accept: 'application/json',
    });

    /**
     * Executes a GET request.
     *
     * Includes retries with exponential backoff because GET is idempotent
     * and safe to repeat on transient failure (5xx, network errors).
     */
    protected get<T>(path: string, options?: HttpRequestOptions): Observable<T> {
        return this.http
            .get<T>(this.url(path), {
                params: options?.params,
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT), this.withRetry());
    }

    /**
     * Executes a POST request.
     * Retries are disabled to prevent duplicate record creation (non-idempotent).
     */
    protected post<T>(
        path: string,
        body: unknown,
        options?: HttpBodyRequestOptions
    ): Observable<T> {
        return this.http
            .post<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Executes a PUT request (full replacement).
     * Retries are disabled by default to maintain strict idempotency safety
     * across varying backend implementations.
     */
    protected put<T>(path: string, body: unknown, options?: HttpBodyRequestOptions): Observable<T> {
        return this.http
            .put<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Executes a PATCH request (partial update).
     * Retries are disabled as concurrent partial updates can lead to race conditions.
     */
    protected patch<T>(
        path: string,
        body: unknown,
        options?: HttpBodyRequestOptions
    ): Observable<T> {
        return this.http
            .patch<T>(this.url(path), body, {
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /**
     * Executes a DELETE request.
     * Retries are disabled to avoid 404/410 errors on subsequent automated
     * attempts if the first request actually succeeded but the response was lost.
     */
    protected delete<T>(path: string, options?: HttpRequestOptions): Observable<T> {
        return this.http
            .delete<T>(this.url(path), {
                params: options?.params,
                headers: options?.headers ?? this.defaultHeaders,
            })
            .pipe(timeout(this.DEFAULT_TIMEOUT));
    }

    /** Resolves a relative path against the base URL. */
    private url(path: string): string {
        return `${this.baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
    }

    /**
     * Returns a custom RxJS operator configured with exponential backoff that
     * only retries transient errors (status codes in HTTP_RETRYABLE_STATUSES).
     *
     * Non-retryable errors (4xx client errors except 408/429) are re-thrown
     * immediately — repeating a malformed request will not produce a
     * different result.
     *
     * Note: non-HttpErrorResponse errors — including TimeoutError from the
     * upstream timeout() operator — are always retried. This is intentional:
     * GET requests are idempotent, and a timeout is a transient failure that
     * may succeed on the next attempt. Mutating methods (POST, PUT, PATCH,
     * DELETE) do not use this operator, so timeouts on those methods are
     * never retried.
     *
     * Protected so subclasses can override the retry strategy or expose
     * it for direct testing against controlled Observables.
     *
     * Backoff formula: RETRY_DELAY × 2^(attempt - 1)
     *   Attempt 1: 1 000 ms
     *   Attempt 2: 2 000 ms
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
                            !HTTP_RETRYABLE_STATUSES.has(error.status)
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
