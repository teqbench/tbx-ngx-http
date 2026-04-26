import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, HttpHeaders, provideHttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, catchError, firstValueFrom } from 'rxjs';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

import { TbxNgxHttpService } from './http.service';
import type { TbxNgxHttpRequestOptions } from '../models/http-request-options.model';
import type { TbxNgxHttpBodyRequestOptions } from '../models/http-body-request-options.model';

import {
    TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS,
    TBX_NGX_HTTP_RETRY_COUNT,
    TBX_NGX_HTTP_RETRY_DELAY_MS,
} from '../constants/http.constants';

const TEST_BASE_URL = 'https://api.test.com';

/**
 * Concrete test harness that exposes TbxNgxHttpService's protected methods.
 * Each public method delegates directly to the corresponding base method
 * with the same signature, adding no logic of its own.
 */
@Injectable()
class TestDataService extends TbxNgxHttpService {
    protected override readonly baseUrl = TEST_BASE_URL;

    public testGet(options?: TbxNgxHttpRequestOptions) {
        return this.get<{ success: boolean }>('test', options);
    }
    public testPost(body: unknown, options?: TbxNgxHttpBodyRequestOptions) {
        return this.post<{ success: boolean }>('test', body, options);
    }
    public testPut(body: unknown, options?: TbxNgxHttpBodyRequestOptions) {
        return this.put<{ success: boolean }>('test', body, options);
    }
    public testPatch(body: unknown, options?: TbxNgxHttpBodyRequestOptions) {
        return this.patch<{ success: boolean }>('test', body, options);
    }
    public testDelete(options?: TbxNgxHttpRequestOptions) {
        return this.delete<{ success: boolean }>('test', options);
    }
}

/**
 * Zero-delay variant that exposes the retry operator for direct testing.
 *
 * Overrides RETRY_DELAY to 0 so timer(0) resolves immediately.
 * Exposes withRetry() via a public method so tests can pipe it
 * against a controlled Observable — no HttpTestingController needed
 * for multi-cycle retry verification.
 *
 * This also validates the subclass override pattern documented in
 * TbxNgxHttpService's JSDoc.
 */
@Injectable()
class RetryTestService extends TbxNgxHttpService {
    protected override readonly baseUrl = TEST_BASE_URL;
    protected override readonly RETRY_DELAY = 0;

    /** Applies the retry operator to an arbitrary source Observable. */
    public applyRetry<T>(source$: Observable<T>): Observable<T> {
        return source$.pipe(this.withRetry());
    }
}

/**
 * Variant with a trailing-slash baseUrl to verify URL normalization.
 */
@Injectable()
class TrailingSlashService extends TbxNgxHttpService {
    protected override readonly baseUrl = `${TEST_BASE_URL}/`;

    public testGet(path: string) {
        return this.get<{ success: boolean }>(path);
    }
}

const TEST_URL = `${TEST_BASE_URL}/test`;

describe('TbxNgxHttpService', () => {
    let service: TestDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                TestDataService,
                RetryTestService,
                TrailingSlashService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(TestDataService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // ── Constants alignment ────────────────────────────────────────────────

    describe('Constants alignment', () => {
        it('should source DEFAULT_TIMEOUT from TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS', () => {
            expect(service['DEFAULT_TIMEOUT']).toBe(TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS);
        });

        it('should source RETRY_COUNT from TBX_NGX_HTTP_RETRY_COUNT', () => {
            expect(service['RETRY_COUNT']).toBe(TBX_NGX_HTTP_RETRY_COUNT);
        });

        it('should source RETRY_DELAY from TBX_NGX_HTTP_RETRY_DELAY_MS', () => {
            expect(service['RETRY_DELAY']).toBe(TBX_NGX_HTTP_RETRY_DELAY_MS);
        });
    });

    // ── URL resolution ─────────────────────────────────────────────────────

    describe('URL resolution', () => {
        it('should prepend the baseUrl to the path', () => {
            service.testGet().subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.url).toBe(TEST_URL);
            req.flush({ success: true });
        });

        it('should normalize trailing slash on baseUrl', () => {
            const trailingSlashService = TestBed.inject(TrailingSlashService);
            trailingSlashService.testGet('items').subscribe();

            const req = httpMock.expectOne(`${TEST_BASE_URL}/items`);
            expect(req.request.url).toBe(`${TEST_BASE_URL}/items`);
            req.flush({ success: true });
        });

        it('should normalize leading slash on path', () => {
            const trailingSlashService = TestBed.inject(TrailingSlashService);
            trailingSlashService.testGet('/items').subscribe();

            const req = httpMock.expectOne(`${TEST_BASE_URL}/items`);
            expect(req.request.url).toBe(`${TEST_BASE_URL}/items`);
            req.flush({ success: true });
        });
    });

    // ── HTTP methods ───────────────────────────────────────────────────────

    describe('HTTP methods', () => {
        it('should execute a GET request', () => {
            service.testGet().subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.method).toBe('GET');
            req.flush({ success: true });
        });

        it('should execute a POST request with the provided body', () => {
            const body = { val: 123 };
            service.testPost(body).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(body);
            req.flush({ success: true });
        });

        it('should execute a PUT request', () => {
            service.testPut({ id: 1 }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.method).toBe('PUT');
            req.flush({ success: true });
        });

        it('should execute a PATCH request', () => {
            service.testPatch({ status: 'ok' }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.method).toBe('PATCH');
            req.flush({ success: true });
        });

        it('should execute a DELETE request', () => {
            service.testDelete().subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.method).toBe('DELETE');
            req.flush({ success: true });
        });
    });

    // ── Default headers ────────────────────────────────────────────────────

    describe('Default headers', () => {
        it('should send Accept: application/json on GET requests', () => {
            service.testGet().subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should send Accept: application/json on POST requests', () => {
            service.testPost({}).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should send Accept: application/json on PUT requests', () => {
            service.testPut({}).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should send Accept: application/json on PATCH requests', () => {
            service.testPatch({}).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should send Accept: application/json on DELETE requests', () => {
            service.testDelete().subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });
    });

    // ── Per-call header override ───────────────────────────────────────────

    describe('Per-call header override', () => {
        const csvHeaders = new HttpHeaders({ Accept: 'text/csv' });

        it('should replace default headers on GET when options.headers is provided', () => {
            service.testGet({ headers: csvHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('col1,col2');
        });

        it('should replace default headers on POST when options.headers is provided', () => {
            service.testPost({}, { headers: csvHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('col1,col2');
        });

        it('should replace default headers on PUT when options.headers is provided', () => {
            service.testPut({}, { headers: csvHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('col1,col2');
        });

        it('should replace default headers on PATCH when options.headers is provided', () => {
            service.testPatch({}, { headers: csvHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('col1,col2');
        });

        it('should replace default headers on DELETE when options.headers is provided', () => {
            service.testDelete({ headers: csvHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('col1,col2');
        });
    });

    // ── Retry operator (direct) ──────────────────────────────────────────────
    //
    // These tests verify the retry operator logic directly against controlled
    // Observables — no HttpTestingController in the loop. This cleanly
    // separates retry behavior (our code) from Angular's HTTP scheduling
    // (framework code).
    //
    // RetryTestService overrides RETRY_DELAY to 0 and exposes withRetry()
    // via applyRetry(), validating both the operator and the subclass
    // override pattern.

    describe('Retry operator (direct)', () => {
        let retryService: RetryTestService;

        beforeEach(() => {
            retryService = TestBed.inject(RetryTestService);
        });

        it('should retry retryable errors up to RETRY_COUNT times', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.error(
                    new HttpErrorResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR })
                );
            });

            await firstValueFrom(
                retryService.applyRetry(source$).pipe(catchError(() => of('done')))
            );

            // 1 initial + 2 retries = 3 total attempts
            expect(attempts).toBe(TBX_NGX_HTTP_RETRY_COUNT + 1);
        });

        it('should NOT retry non-retryable errors (4xx)', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.error(new HttpErrorResponse({ status: StatusCodes.NOT_FOUND }));
            });

            await firstValueFrom(
                retryService.applyRetry(source$).pipe(catchError(() => of('done')))
            );

            // Fails immediately — no retries
            expect(attempts).toBe(1);
        });

        it('should retry 502 Bad Gateway', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                if (attempts <= 1) {
                    subscriber.error(new HttpErrorResponse({ status: StatusCodes.BAD_GATEWAY }));
                } else {
                    subscriber.next('success');
                    subscriber.complete();
                }
            });

            const result = await firstValueFrom(retryService.applyRetry(source$));

            expect(attempts).toBe(2);
            expect(result).toBe('success');
        });

        it('should retry 503 Service Unavailable', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                if (attempts <= 1) {
                    subscriber.error(
                        new HttpErrorResponse({ status: StatusCodes.SERVICE_UNAVAILABLE })
                    );
                } else {
                    subscriber.next('success');
                    subscriber.complete();
                }
            });

            const result = await firstValueFrom(retryService.applyRetry(source$));

            expect(attempts).toBe(2);
            expect(result).toBe('success');
        });

        it('should retry network errors (status 0)', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                if (attempts <= 1) {
                    subscriber.error(new HttpErrorResponse({ status: 0 }));
                } else {
                    subscriber.next('success');
                    subscriber.complete();
                }
            });

            const result = await firstValueFrom(retryService.applyRetry(source$));

            expect(attempts).toBe(2);
            expect(result).toBe('success');
        });

        it('should NOT retry 400 Bad Request', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.error(new HttpErrorResponse({ status: StatusCodes.BAD_REQUEST }));
            });

            await firstValueFrom(
                retryService.applyRetry(source$).pipe(catchError(() => of('done')))
            );

            expect(attempts).toBe(1);
        });

        it('should NOT retry 401 Unauthorized', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.error(new HttpErrorResponse({ status: StatusCodes.UNAUTHORIZED }));
            });

            await firstValueFrom(
                retryService.applyRetry(source$).pipe(catchError(() => of('done')))
            );

            expect(attempts).toBe(1);
        });

        it('should NOT retry 403 Forbidden', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.error(new HttpErrorResponse({ status: StatusCodes.FORBIDDEN }));
            });

            await firstValueFrom(
                retryService.applyRetry(source$).pipe(catchError(() => of('done')))
            );

            expect(attempts).toBe(1);
        });

        it('should succeed without retry when the source completes normally', async () => {
            let attempts = 0;
            const source$ = new Observable<string>((subscriber) => {
                attempts++;
                subscriber.next('ok');
                subscriber.complete();
            });

            const result = await firstValueFrom(retryService.applyRetry(source$));

            expect(attempts).toBe(1);
            expect(result).toBe('ok');
        });

        it('should propagate the error after retries are exhausted', async () => {
            const source$ = new Observable<string>((subscriber) => {
                subscriber.error(
                    new HttpErrorResponse({ status: StatusCodes.INTERNAL_SERVER_ERROR })
                );
            });

            let caughtError: unknown;
            await firstValueFrom(
                retryService.applyRetry(source$).pipe(
                    catchError((err) => {
                        caughtError = err;
                        return of('handled');
                    })
                )
            );

            expect(caughtError).toBeInstanceOf(HttpErrorResponse);
            expect((caughtError as HttpErrorResponse).status).toBe(
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        });
    });

    // ── Retry behavior (single-cycle) ─────────────────────────────────────
    //
    // Single-cycle tests verify that each retryable status code triggers
    // one retry. These use fake timers with a single advanceTimersByTime
    // call, which works reliably for one timer→request cycle.

    describe('Retry behavior (single-cycle)', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        describe('Retryable errors (transient server errors)', () => {
            it('should retry GET on 502 Bad Gateway', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.BAD_GATEWAY,
                    statusText: ReasonPhrases.BAD_GATEWAY,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                const retry = httpMock.expectOne(TEST_URL);
                retry.flush({ success: true });
            });

            it('should retry GET on 503 Service Unavailable', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.SERVICE_UNAVAILABLE,
                    statusText: ReasonPhrases.SERVICE_UNAVAILABLE,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                httpMock.expectOne(TEST_URL).flush({ success: true });
            });

            it('should retry GET on 504 Gateway Timeout', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.GATEWAY_TIMEOUT,
                    statusText: ReasonPhrases.GATEWAY_TIMEOUT,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                httpMock.expectOne(TEST_URL).flush({ success: true });
            });

            it('should retry GET on 408 Request Timeout', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.REQUEST_TIMEOUT,
                    statusText: ReasonPhrases.REQUEST_TIMEOUT,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                httpMock.expectOne(TEST_URL).flush({ success: true });
            });

            it('should retry GET on 429 Too Many Requests', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.TOO_MANY_REQUESTS,
                    statusText: ReasonPhrases.TOO_MANY_REQUESTS,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                httpMock.expectOne(TEST_URL).flush({ success: true });
            });

            it('should retry GET on network error (status 0)', () => {
                service.testGet().subscribe({ error: () => {} });

                httpMock.expectOne(TEST_URL).error(new ProgressEvent('error'));

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
                httpMock.expectOne(TEST_URL).flush({ success: true });
            });
        });

        describe('Non-retryable errors (client errors)', () => {
            it('should NOT retry GET on 400 Bad Request', () => {
                let error: unknown;
                service.testGet().subscribe({ error: (e) => (error = e) });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.BAD_REQUEST,
                    statusText: ReasonPhrases.BAD_REQUEST,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
                httpMock.expectNone(TEST_URL);
                expect(error).toBeDefined();
            });

            it('should NOT retry GET on 401 Unauthorized', () => {
                let error: unknown;
                service.testGet().subscribe({ error: (e) => (error = e) });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.UNAUTHORIZED,
                    statusText: ReasonPhrases.UNAUTHORIZED,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
                httpMock.expectNone(TEST_URL);
                expect(error).toBeDefined();
            });

            it('should NOT retry GET on 403 Forbidden', () => {
                let error: unknown;
                service.testGet().subscribe({ error: (e) => (error = e) });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.FORBIDDEN,
                    statusText: ReasonPhrases.FORBIDDEN,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
                httpMock.expectNone(TEST_URL);
                expect(error).toBeDefined();
            });

            it('should NOT retry GET on 404 Not Found', () => {
                let error: unknown;
                service.testGet().subscribe({ error: (e) => (error = e) });

                httpMock.expectOne(TEST_URL).flush(null, {
                    status: StatusCodes.NOT_FOUND,
                    statusText: ReasonPhrases.NOT_FOUND,
                });

                vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
                httpMock.expectNone(TEST_URL);
                expect(error).toBeDefined();
            });
        });
    });

    // ── Timeout ─────────────────────────────────────────────────────────────

    describe('Timeout', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should emit a timeout error when the server does not respond within DEFAULT_TIMEOUT', () => {
            let error: unknown;
            service.testPost({}).subscribe({ error: (e) => (error = e) });

            // Request is pending — do not flush it
            httpMock.expectOne(TEST_URL);

            // Advance past the timeout threshold
            vi.advanceTimersByTime(TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS + 1);

            expect(error).toBeDefined();
            expect((error as Error).name).toBe('TimeoutError');
        });
    });

    // ── Exponential backoff formula ────────────────────────────────────────

    describe('Exponential backoff formula', () => {
        it('should calculate correct delays from RETRY_DELAY constant', () => {
            const delay = service['RETRY_DELAY'];

            // Backoff formula: RETRY_DELAY × 2^(attempt - 1)
            expect(delay * Math.pow(2, 1 - 1)).toBe(1_000); // Attempt 1: 1 000 ms
            expect(delay * Math.pow(2, 2 - 1)).toBe(2_000); // Attempt 2: 2 000 ms
            expect(delay * Math.pow(2, 3 - 1)).toBe(4_000); // Attempt 3: 4 000 ms
        });
    });

    // ── Mutating methods do not retry ──────────────────────────────────────

    describe('Mutating methods do not retry', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should NOT retry POST on 500', () => {
            let error: unknown;
            service.testPost({}).subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });

        it('should NOT retry PUT on 500', () => {
            let error: unknown;
            service.testPut({}).subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });

        it('should NOT retry PATCH on 500', () => {
            let error: unknown;
            service.testPatch({}).subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });

        it('should NOT retry DELETE on 500', () => {
            let error: unknown;
            service.testDelete().subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                statusText: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });
    });

    // ── Per-call retry override ───────────────────────────────────────────

    describe('Per-call retry override', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should NOT retry GET when options.retry is false', () => {
            let error: unknown;
            service.testGet({ retry: false }).subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.SERVICE_UNAVAILABLE,
                statusText: ReasonPhrases.SERVICE_UNAVAILABLE,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });

        it('should retry POST on 503 when options.retry is true', () => {
            service.testPost({}, { retry: true }).subscribe({ error: () => {} });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.SERVICE_UNAVAILABLE,
                statusText: ReasonPhrases.SERVICE_UNAVAILABLE,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
            httpMock.expectOne(TEST_URL).flush({ success: true });
        });

        it('should retry PUT on 502 when options.retry is true', () => {
            service.testPut({ id: 1 }, { retry: true }).subscribe({ error: () => {} });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.BAD_GATEWAY,
                statusText: ReasonPhrases.BAD_GATEWAY,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
            httpMock.expectOne(TEST_URL).flush({ success: true });
        });

        it('should retry PATCH on 504 when options.retry is true', () => {
            service.testPatch({ id: 1 }, { retry: true }).subscribe({ error: () => {} });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.GATEWAY_TIMEOUT,
                statusText: ReasonPhrases.GATEWAY_TIMEOUT,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
            httpMock.expectOne(TEST_URL).flush({ success: true });
        });

        it('should retry DELETE on 503 when options.retry is true', () => {
            service.testDelete({ retry: true }).subscribe({ error: () => {} });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.SERVICE_UNAVAILABLE,
                statusText: ReasonPhrases.SERVICE_UNAVAILABLE,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS);
            httpMock.expectOne(TEST_URL).flush({ success: true });
        });

        it('should NOT retry POST when options.retry is false (explicit default)', () => {
            let error: unknown;
            service.testPost({}, { retry: false }).subscribe({ error: (e) => (error = e) });

            httpMock.expectOne(TEST_URL).flush(null, {
                status: StatusCodes.SERVICE_UNAVAILABLE,
                statusText: ReasonPhrases.SERVICE_UNAVAILABLE,
            });

            vi.advanceTimersByTime(TBX_NGX_HTTP_RETRY_DELAY_MS * 10);
            httpMock.expectNone(TEST_URL);
            expect(error).toBeDefined();
        });
    });

    // ── Header merging ────────────────────────────────────────────────────

    describe('Header merging', () => {
        it('should merge defaults with caller headers when mergeHeaders is true', () => {
            const callerHeaders = new HttpHeaders({ Authorization: 'Bearer token' });
            service.testGet({ headers: callerHeaders, mergeHeaders: true }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            // Caller header preserved
            expect(req.request.headers.get('Authorization')).toBe('Bearer token');
            // Default header filled in for keys the caller did not set
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should let caller header win over default when key collides during merge', () => {
            const callerHeaders = new HttpHeaders({ Accept: 'text/csv' });
            service.testGet({ headers: callerHeaders, mergeHeaders: true }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('text/csv');
            req.flush('a,b');
        });

        it('should still replace defaults when mergeHeaders is omitted (existing behavior)', () => {
            const callerHeaders = new HttpHeaders({ Authorization: 'Bearer token' });
            service.testGet({ headers: callerHeaders }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Authorization')).toBe('Bearer token');
            // Default Accept is dropped because caller did not opt into merge
            expect(req.request.headers.get('Accept')).toBeNull();
            req.flush({ success: true });
        });

        it('should apply mergeHeaders to body methods', () => {
            const callerHeaders = new HttpHeaders({ Authorization: 'Bearer token' });
            service.testPost({}, { headers: callerHeaders, mergeHeaders: true }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Authorization')).toBe('Bearer token');
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });

        it('should ignore mergeHeaders when caller did not provide headers', () => {
            service.testGet({ mergeHeaders: true }).subscribe();

            const req = httpMock.expectOne(TEST_URL);
            expect(req.request.headers.get('Accept')).toBe('application/json');
            req.flush({ success: true });
        });
    });
});
