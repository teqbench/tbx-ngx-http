# Changelog

## [1.0.0](https://github.com/teqbench/tbx-ngx-http/compare/v0.1.2...v1.0.0) (2026-03-27)


### ⚠ BREAKING CHANGES

* **api:** All public exports have been renamed with the TbxNgx/TBX_NGX_ prefix. Consumers must update all imports:
    - BaseHttpService → TbxNgxBaseHttpService
    - HttpRequestOptions → TbxNgxHttpRequestOptions
    - HttpBodyRequestOptions → TbxNgxHttpBodyRequestOptions
    - HTTP_DEFAULT_TIMEOUT_MS → TBX_NGX_HTTP_DEFAULT_TIMEOUT_MS
    - HTTP_RETRY_COUNT → TBX_NGX_HTTP_RETRY_COUNT
    - HTTP_RETRY_DELAY_MS → TBX_NGX_HTTP_RETRY_DELAY_MS
    - HTTP_RETRYABLE_STATUSES → TBX_NGX_HTTP_RETRYABLE_STATUSES

### Code Refactoring

* **api:** rename all public exports with TbxNgx prefix ([4f848bd](https://github.com/teqbench/tbx-ngx-http/commit/4f848bdd0652f91656d375e33693fb5d6cc2331b))

## [0.1.2](https://github.com/teqbench/tbx-ngx-http/compare/v0.1.1...v0.1.2) (2026-03-25)


### Bug Fixes

* **ci:** use ./dist path prefix in npm publish command ([232bea4](https://github.com/teqbench/tbx-ngx-http/commit/232bea436a68b6380321d77eb5b10407930530b1))
* **ci:** use ./dist path prefix in npm publish command ([a719fcd](https://github.com/teqbench/tbx-ngx-http/commit/a719fcd3ef805c9de694815ea225f851f508494e))

## [0.1.1](https://github.com/teqbench/tbx-ngx-http/compare/v0.1.0...v0.1.1) (2026-03-25)


### Bug Fixes

* **publish:** publish from dist/ per Angular Package Format convention ([0da0046](https://github.com/teqbench/tbx-ngx-http/commit/0da0046f296d321f4b607e8fa4ce60c67cd2d6c6))
* **publish:** publish from dist/ per Angular Package Format convention ([ec5f3db](https://github.com/teqbench/tbx-ngx-http/commit/ec5f3dbe522a7feb20237afeb207281e8b0caa69))

## 0.1.0 (2026-03-25)


### Features

* **setup:** configure package as @teqbench/tbx-ngx-http ([47423d5](https://github.com/teqbench/tbx-ngx-http/commit/47423d5455d0cab435089b820d48c4c4fca1bbcc))
* **setup:** configure package as @teqbench/tbx-ngx-http ([cb18dd4](https://github.com/teqbench/tbx-ngx-http/commit/cb18dd432e3df77e5092f5613f5f39685cb0155d))

## Changelog
