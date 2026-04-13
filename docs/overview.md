---
tagline: Resilient base HTTP service for [Angular ↗](https://angular.dev) with automatic retry on transient failures, configurable timeouts, and typed request options — one abstract class that feature services extend to gain consistent resilience without per-call boilerplate.
---

## Overview

`@teqbench/tbx-ngx-http` provides an abstract base HTTP service for [Angular ↗](https://angular.dev) feature services. Rather than re-implementing retry, timeout, URL resolution, and default-header logic in every service that talks to the backend, feature services extend `TbxNgxHttpService` and inherit a consistent resilience envelope over [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient).

The service exposes typed `get`, `post`, `put`, `patch`, and `delete` methods backed by two dedicated option interfaces — `TbxNgxHttpRequestOptions` for non-body methods (params + headers) and `TbxNgxHttpBodyRequestOptions` for body methods (headers only). Only GET requests go through the retry operator; mutating methods intentionally skip retry because POST/PUT/PATCH/DELETE are not safely repeatable on transient failure. Timeouts apply to every method uniformly.

The retry strategy uses exponential backoff (`RETRY_DELAY * 2^(attempt - 1)`) and consults a fixed set of retryable statuses — `0` (network error), `408`, `429`, `500`, `502`, `503`, `504`. Non-retryable HTTP errors (4xx client errors other than 408/429) are re-thrown immediately. Non-`HttpErrorResponse` failures, including [`TimeoutError` ↗](https://rxjs.dev/api/index/class/TimeoutError) from the upstream operator, are always retried on GET. All four resilience parameters (timeout, retry count, retry delay, retryable statuses) are also exported as standalone constants for consumers building custom retry pipelines outside of `TbxNgxHttpService`.

The package supports [Angular ↗](https://angular.dev) 19, 20, and 21, carries no `@teqbench` runtime dependencies, and depends only on [`http-status-codes` ↗](https://github.com/prettymuchbryce/http-status-codes) at runtime for the canonical status-code enum.

## When to use

Reach for this package when your [Angular ↗](https://angular.dev) application needs:

- Consistent HTTP resilience (retry + timeout) across multiple feature services without duplicating the [RxJS ↗](https://rxjs.dev) operators in every call.
- A typed, ergonomic surface over [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient) for GET/POST/PUT/PATCH/DELETE with request-option interfaces that match each method's body semantics.
- A single place to tune retry count, backoff delay, and the set of retryable status codes.

Skip it when you're making one-off HTTP calls and don't need resilience beyond [`HttpClient` ↗](https://angular.dev/api/common/http/HttpClient) defaults — direct use is simpler.
