# @teqbench/tbx-ngx-http

![Build Status](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-build-status.json) ![Tests](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-tests.json) ![Coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-coverage.json) ![Version](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-version.json) ![Build Number](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/teqbench-shields-bot/a69600f4ed4ebed89ffb35d808e05eb4/raw/tbx-ngx-http-main-build-number.json)

> Base HTTP communication services and resilience constants for Angular. Provides automatic retries with exponential backoff, timeout handling, and consistent URL resolution for feature services.

## Installation

Configure npm to use GitHub Packages for the `@teqbench` scope:

```bash
echo "@teqbench:registry=https://npm.pkg.github.com" >> .npmrc
```

Install the package:

```bash
npm install @teqbench/tbx-ngx-http
```

## Usage

```typescript
import { Injectable } from '@angular/core';
import { TbxNgxHttpService } from '@teqbench/tbx-ngx-http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService extends TbxNgxHttpService {
    protected override readonly baseUrl = environment.apiUrl;

    getUser(id: string) {
        return this.get<User>(`users/${id}`);
    }

    createUser(data: CreateUserDto) {
        return this.post<User>('users', data);
    }
}
```

## API Reference

### `TbxNgxHttpService` (abstract class)

Abstract base class for feature services. Provides typed HTTP methods with built-in resilience.

| Method   | Signature                                                                                      | Retries |
| -------- | ---------------------------------------------------------------------------------------------- | ------- |
| `get`    | `get<T>(path: string, options?: TbxNgxHttpRequestOptions): Observable<T>`                      | Yes     |
| `post`   | `post<T>(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable<T>`  | No      |
| `put`    | `put<T>(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable<T>`   | No      |
| `patch`  | `patch<T>(path: string, body: unknown, options?: TbxNgxHttpBodyRequestOptions): Observable<T>` | No      |
| `delete` | `delete<T>(path: string, options?: TbxNgxHttpRequestOptions): Observable<T>`                   | No      |

### Constants

| Constant                          | Default  | Description                                        |
| --------------------------------- | -------- | -------------------------------------------------- |
| `TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS` | `10_000` | Request timeout in milliseconds                    |
| `TBX_NGX_HTTP_RETRY_COUNT`        | `2`      | Number of retry attempts for GET requests          |
| `TBX_NGX_HTTP_RETRY_DELAY_MS`     | `1_000`  | Base delay for exponential backoff                 |
| `TBX_NGX_HTTP_RETRYABLE_STATUSES` | `Set`    | Status codes eligible for retry (0, 408, 429, 5xx) |

## Compatibility

| Dependency | Version                       |
| ---------- | ----------------------------- |
| Angular    | ^19.0.0 \| ^20.0.0 \| ^21.0.0 |
| RxJS       | ^7.0.0                        |
| TypeScript | ~5.9.0                        |
| Node.js    | >=24.0.0                      |

## License

[Apache-2.0](LICENSE) — Copyright 2025 TeqBench
