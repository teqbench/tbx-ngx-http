# @teqbench/tbx-ngx-http

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-build-number.json)

> Resilient base HTTP service for [Angular ↗](https://angular.dev) with automatic retry on transient failures, configurable timeouts, and typed request options — one abstract class that feature services extend to gain consistent resilience without per-call boilerplate.

<details>
<summary><strong>Table of contents</strong></summary>

- [Overview](#overview)
- [At a glance](#at-a-glance)
- [When to use](#when-to-use)
- [Installation](#installation)
- [Usage](#usage)
- [Concepts](#concepts)
- [API Reference](#api-reference)
- [Accessibility](#accessibility)
- [Compatibility](#compatibility)
- [Versioning & releases](#versioning--releases)
- [Contributing](#contributing)
- [Security](#security)
- [Feedback](#feedback)
- [License](#license)

</details>

## Overview

`@teqbench/tbx-ngx-http` provides an abstract base HTTP service for [Angular ↗](https://angular.dev) feature services. Rather than re-implementing retry, timeout, URL resolution, and default-header logic in every service that talks to the backend, feature services extend `TbxNgxHttpService` and inherit a consistent resilience envelope over [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient).

The service exposes typed `get`, `post`, `put`, `patch`, and `delete` methods backed by two dedicated option interfaces — `TbxNgxHttpRequestOptions` for non-body methods (params + headers) and `TbxNgxHttpBodyRequestOptions` for body methods (headers only). GET goes through the retry operator by default; mutating methods (POST, PUT, PATCH, DELETE) skip retry by default because they are not safely repeatable. Either default can be overridden per call with `options.retry`. Timeouts apply to every method uniformly.

The retry strategy uses exponential backoff (`RETRY_DELAY * 2^(attempt - 1)`) and consults a fixed set of retryable statuses — `0` (network error), `408`, `429`, `500`, `502`, `503`, `504`. Non-retryable HTTP errors (4xx client errors other than 408/429) are re-thrown immediately. Non-`HttpErrorResponse` failures, including [`TimeoutError` ↗](https://rxjs.dev/api/index/class/TimeoutError) from the upstream operator, are always retried whenever the retry pipeline runs (GET by default, mutating methods on opt-in). All four resilience parameters (timeout, retry count, retry delay, retryable statuses) are also exported as standalone constants for consumers building custom retry pipelines outside of `TbxNgxHttpService`.

The package supports [Angular ↗](https://angular.dev) 19, 20, and 21, carries no `@teqbench` runtime dependencies, and depends only on [`http-status-codes` ↗](https://github.com/prettymuchbryce/http-status-codes) at runtime for the canonical status-code enum.

## At a glance

- **Resilient base service** — abstract `TbxNgxHttpService` that feature services extend to inherit retry, timeout, URL resolution, and default headers.
- **GET retry with exponential backoff** — transient failures (network errors, 408, 429, 5xx) are retried with delay `RETRY_DELAY * 2^(attempt - 1)`.
- **Configurable timeout** — every request is bounded by `DEFAULT_TIMEOUT` (10s default); subclasses override the class property to tune per service.
- **Idempotency-aware retry** — GET retries by default; POST, PUT, PATCH, and DELETE skip retry by default. Either default can be overridden per-call with `options.retry`.
- **Typed request options** — `TbxNgxHttpRequestOptions` for params + headers (non-body methods); `TbxNgxHttpBodyRequestOptions` for body methods.
- **Header merge or replace** — caller `options.headers` replaces defaults by default; pass `options.mergeHeaders: true` to merge (caller wins, defaults fill gaps).
- **Per-subclass override** — `DEFAULT_TIMEOUT`, `RETRY_COUNT`, and `RETRY_DELAY` are protected class properties — redeclare in a subclass to override.
- **Exposed resilience constants** — `TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS`, `RETRY_COUNT`, `RETRY_DELAY_MS`, and `RETRYABLE_STATUSES` are exported for custom pipelines.
- **Default headers** — `Accept: application/json` is set by default; callers providing `options.headers` replace the set entirely, or pass `options.mergeHeaders: true` to merge instead.
- **URL resolution** — relative paths are joined to the subclass-provided `baseUrl` with consistent slash handling.
- **Broad [Angular ↗](https://angular.dev) peer range** — supports [Angular ↗](https://angular.dev) 19, 20, and 21; no `@teqbench` runtime dependencies.

## When to use

Reach for this package when your [Angular ↗](https://angular.dev) application needs:

- Consistent HTTP resilience (retry + timeout) across multiple feature services without duplicating the [RxJS ↗](https://rxjs.dev) operators in every call.
- A typed, ergonomic surface over [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient) for GET/POST/PUT/PATCH/DELETE with request-option interfaces that match each method's body semantics.
- A single place to tune retry count, backoff delay, and the set of retryable status codes.

Skip it when you're making one-off HTTP calls and don't need resilience beyond [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient) defaults — direct use is simpler.

## Installation

Configure [npm ↗](https://www.npmjs.com) to use [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) for the `@teqbench` scope:

```bash
echo "@teqbench:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the package:

```bash
npm install @teqbench/tbx-ngx-http
```

### Prerequisites

The consuming application must provide [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient) through its [Angular ↗](https://angular.dev) DI — typically via [`provideHttpClient()` ↗](https://angular.dev/api/common/http/provideHttpClient) in `app.config.ts`. `TbxNgxHttpService` injects `HttpClient` directly.

## Usage

### Extend the base service

Create a feature service by extending `TbxNgxHttpService`, providing a `baseUrl`, and exposing typed methods.

```typescript
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TbxNgxHttpService } from '@teqbench/tbx-ngx-http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService extends TbxNgxHttpService {
    protected override readonly baseUrl = environment.apiUrl;

    getUser(id: string) {
        return this.get<User>(`users/${id}`);
    }

    listUsers() {
        return this.get<User[]>('users', { params: new HttpParams().set('page', '1') });
    }

    createUser(data: CreateUserDto) {
        return this.post<User>('users', data);
    }

    updateUser(id: string, data: UpdateUserDto) {
        return this.put<User>(`users/${id}`, data);
    }

    deleteUser(id: string) {
        return this.delete<void>(`users/${id}`);
    }
}
```

### Tune resilience per feature service

Redeclare the protected class properties in a subclass to override the defaults for one service.

```typescript
@Injectable({ providedIn: 'root' })
export class SlowApiService extends TbxNgxHttpService {
    protected override readonly baseUrl = environment.slowApiUrl;
    protected override readonly DEFAULT_TIMEOUT = 30_000;
    protected override readonly RETRY_COUNT = 5;
    protected override readonly RETRY_DELAY = 2_000;
}
```

### Use the resilience constants in a custom pipeline

Import the constants directly when building retry logic outside of `TbxNgxHttpService`.

```typescript
import { TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS, TBX_NGX_HTTP_RETRYABLE_STATUSES } from '@teqbench/tbx-ngx-http';
import { HttpErrorResponse } from '@angular/common/http';
import { retry, timeout, throwError, timer } from 'rxjs';

this.http.get<User[]>('/api/users').pipe(
    timeout(TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS),
    retry({
        count: 3,
        delay: (error) => {
            if (error instanceof HttpErrorResponse && !TBX_NGX_HTTP_RETRYABLE_STATUSES.has(error.status)) {
                return throwError(() => error);
            }
            return timer(1_000);
        },
    })
);
```

### Headers: replace, don't merge (default)

Passing `options.headers` replaces the default `Accept: application/json` entirely — the caller owns the full header set.

```typescript
this.get<Blob>('reports/monthly.pdf', {
    headers: new HttpHeaders({ Accept: 'application/pdf' }),
});
```

### Headers: merge with defaults

Pass `options.mergeHeaders: true` to keep defaults the caller did not set. Caller-provided keys still win on conflict.

```typescript
this.get<User>('me', {
    headers: new HttpHeaders({ Authorization: 'Bearer token' }),
    mergeHeaders: true,
});
// Sends: Authorization: Bearer token, Accept: application/json
```

### Override retry per call

Opt out of retry on a single GET, or opt into retry on a body method when the caller knows the endpoint is idempotent.

```typescript
// Single fast GET — no retry on transient failure
this.get<Status>('health', { retry: false });

// PUT that fully replaces a resource by id — safe to repeat
this.put<User>(`users/${id}`, payload, { retry: true });
```

## Concepts

- **Base HTTP service** — the abstract `TbxNgxHttpService` that consumers extend to gain timeout, retry, URL resolution, and default-header behavior over [Angular ↗](https://angular.dev) [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient).
- **Feature service** — a consumer-defined subclass of `TbxNgxHttpService` that provides a `baseUrl` and exposes typed methods for a specific backend surface.
- **Resilience constants** — exported default values for timeout, retry count, retry delay, and the set of retryable statuses; can be imported directly when building custom pipelines.
- **Retryable status** — one of `0` (network error), `408`, `429`, `500`, `502`, `503`, `504` — transient failures worth retrying with backoff.
- **Idempotency-aware retry** — the rule that GET retries automatically while POST, PUT, PATCH, and DELETE skip retry by default. Either default can be overridden per call with `options.retry` for endpoints the caller knows to be idempotent.
- **Exponential backoff** — a retry delay strategy where the wait doubles on each attempt — `delay = RETRY_DELAY * 2^(attempt - 1)`.
- **Per-subclass override** — the pattern of redeclaring a protected class property (`DEFAULT_TIMEOUT`, `RETRY_COUNT`, `RETRY_DELAY`) in a subclass to change resilience behavior for one feature service.

## API Reference

### TbxNgxHttpService (abstract class)

Abstract base class for feature services. Provides typed HTTP methods with built-in resilience.

<dl>
    <dt><code>get</code> — retries by default; pass <code>options.retry: false</code> to disable</dt>
    <dd><code>get&lt;T&gt;(path: string, options?: TbxNgxHttpRequestOptions): Observable&lt;T&gt;</code></dd>
    <dt><code>post</code> — no retry by default; pass <code>options.retry: true</code> to opt in</dt>
    <dd><code>post&lt;T&gt;(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable&lt;T&gt;</code></dd>
    <dt><code>put</code> — no retry by default; pass <code>options.retry: true</code> to opt in</dt>
    <dd><code>put&lt;T&gt;(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable&lt;T&gt;</code></dd>
    <dt><code>patch</code> — no retry by default; pass <code>options.retry: true</code> to opt in</dt>
    <dd><code>patch&lt;T&gt;(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable&lt;T&gt;</code></dd>
    <dt><code>delete</code> — no retry by default; pass <code>options.retry: true</code> to opt in</dt>
    <dd><code>delete&lt;T&gt;(path: string, options?: TbxNgxHttpRequestOptions): Observable&lt;T&gt;</code></dd>
</dl>

Overridable protected properties (redeclare in a subclass to change behavior):

<dl>
    <dt><code>baseUrl</code> (<code>string</code>)</dt>
    <dd>API root URL. Abstract — must be provided by the subclass.</dd>
    <dt><code>DEFAULT_TIMEOUT</code> (<code>number</code>)</dt>
    <dd>Request timeout in milliseconds. Default: <code>TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS</code>.</dd>
    <dt><code>RETRY_COUNT</code> (<code>number</code>)</dt>
    <dd>Retry attempts for the retry pipeline (GET by default; mutating methods on <code>options.retry: true</code>). Default: <code>TBX_NGX_HTTP_RETRY_COUNT</code>.</dd>
    <dt><code>RETRY_DELAY</code> (<code>number</code>)</dt>
    <dd>Base delay in ms for exponential backoff. Default: <code>TBX_NGX_HTTP_RETRY_DELAY_MS</code>.</dd>
    <dt><code>defaultHeaders</code> (<code>HttpHeaders</code>)</dt>
    <dd>Applied when the caller does not pass <code>options.headers</code>. Default: <code>Accept: application/json</code>.</dd>
</dl>

### TbxNgxHttpRequestOptions

Options for non-body methods (`get`, `delete`).

<dl>
    <dt><code>params?</code> (<code>HttpParams</code>)</dt>
    <dd>Query string parameters.</dd>
    <dt><code>headers?</code> (<code>HttpHeaders</code>)</dt>
    <dd>Replaces <code>defaultHeaders</code> when present (or merges, when <code>mergeHeaders</code> is true).</dd>
    <dt><code>mergeHeaders?</code> (<code>boolean</code>)</dt>
    <dd>Merge <code>headers</code> with <code>defaultHeaders</code> instead of replacing. Caller-provided keys win on conflict; default keys not set by the caller are preserved. Default: <code>false</code>.</dd>
    <dt><code>retry?</code> (<code>boolean</code>)</dt>
    <dd>Override the method's default retry behavior. GET defaults to <code>true</code>; DELETE defaults to <code>false</code>.</dd>
</dl>

### TbxNgxHttpBodyRequestOptions

Options for body methods (`post`, `put`, `patch`).

<dl>
    <dt><code>headers?</code> (<code>HttpHeaders</code>)</dt>
    <dd>Replaces <code>defaultHeaders</code> when present (or merges, when <code>mergeHeaders</code> is true).</dd>
    <dt><code>mergeHeaders?</code> (<code>boolean</code>)</dt>
    <dd>Merge <code>headers</code> with <code>defaultHeaders</code> instead of replacing. Caller-provided keys win on conflict; default keys not set by the caller are preserved. Default: <code>false</code>.</dd>
    <dt><code>retry?</code> (<code>boolean</code>)</dt>
    <dd>Opt this body method into the retry pipeline. Default: <code>false</code>. Set <code>true</code> for endpoints the caller knows to be idempotent.</dd>
</dl>

### Constants

<dl>
    <dt><code>TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS</code></dt>
    <dd>Request timeout in milliseconds. Default: <code>10_000</code>.</dd>
    <dt><code>TBX_NGX_HTTP_RETRY_COUNT</code></dt>
    <dd>Number of retry attempts for the retry pipeline. Used by GET (default) and by mutating methods opted in via <code>options.retry: true</code>. Default: <code>2</code>.</dd>
    <dt><code>TBX_NGX_HTTP_RETRY_DELAY_MS</code></dt>
    <dd>Base delay in milliseconds for exponential backoff. Default: <code>1_000</code>.</dd>
    <dt><code>TBX_NGX_HTTP_RETRYABLE_STATUSES</code> (<code>Set</code>)</dt>
    <dd>Status codes eligible for retry: <code>0, 408, 429, 500, 502, 503, 504</code>.</dd>
</dl>

## Accessibility

- This package provides services, constants, and type interfaces only. It has no direct UI surface, no rendered DOM, and no keyboard, focus, color, or motion considerations. Accessibility for any UI that surfaces HTTP errors, loading states, or retry progress is owned by the consuming application.

## Compatibility

<!-- Kept as a pipe table until teqbench/.github#22 lands; the centralized CI README version-check regex extracts versions from this exact shape. -->

| Dependency                                                                  | Version                       |
| --------------------------------------------------------------------------- | ----------------------------- |
| [Angular ↗](https://angular.dev)                                            | ^19.0.0 \| ^20.0.0 \| ^21.0.0 |
| [RxJS ↗](https://rxjs.dev)                                                  | ^7.0.0                        |
| [http-status-codes ↗](https://github.com/prettymuchbryce/http-status-codes) | ^2.3.0                        |
| [TypeScript ↗](https://www.typescriptlang.org)                              | ~5.9.0                        |
| [Node.js ↗](https://nodejs.org)                                             | >=24.0.0                      |

## Versioning & releases

This package follows [Semantic Versioning ↗](https://semver.org). Versions and changelog entries are produced automatically by [Release Please ↗](https://github.com/googleapis/release-please) from [Conventional Commits ↗](https://www.conventionalcommits.org) on `main`. See [CHANGELOG.md](CHANGELOG.md) for the full release history.

## Contributing

Contributions are welcome. See [CONTRIBUTING ↗](https://github.com/teqbench/.github/blob/main/CONTRIBUTING.md) for local setup, [GitHub Packages ↗](https://github.com/orgs/teqbench/packages) authentication, branch conventions, commit format, and the PR workflow.

## Security

See [SECURITY ↗](https://github.com/teqbench/.github/blob/main/SECURITY.md) for the supported-version policy and how to report a vulnerability privately.

## Feedback

- [Report a bug ↗](https://github.com/teqbench/tbx-ngx-http/issues/new?template=bug_report.md)
- [Request a feature ↗](https://github.com/teqbench/tbx-ngx-http/issues/new?template=feature_request.md)

## License

[AGPL-3.0](LICENSE) — Copyright 2026 TeqBench
