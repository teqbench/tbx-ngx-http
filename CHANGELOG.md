# Changelog

## [1.2.1](https://github.com/teqbench/tbx-ngx-http/compare/v1.2.0...v1.2.1) (2026-05-09)


### Bug Fixes

* **ci:** pin reusable workflows to [@v2](https://github.com/v2).6.0 ([35b86d6](https://github.com/teqbench/tbx-ngx-http/commit/35b86d67d1229b78e8b99d623ea9afb370a998a3))

## [1.2.0](https://github.com/teqbench/tbx-ngx-http/compare/v1.1.0...v1.2.0) (2026-05-04)


### Features

* add per-call retry override and header merge options ([d6ebbde](https://github.com/teqbench/tbx-ngx-http/commit/d6ebbded165c6eb5ea45ffa41d95b38cb344e7d6))


### Bug Fixes

* **deps:** patch picomatch to resolve high-severity advisories ([c60b8fb](https://github.com/teqbench/tbx-ngx-http/commit/c60b8fbbc27ba7b3b30f0aa20f8c4cb43d19e36a))
* **docs:** describe per-package docs pipeline inputs in CLAUDE.md ([960d9ec](https://github.com/teqbench/tbx-ngx-http/commit/960d9ec8e14f383b734d3600df805b54d53d8941))
* **docs:** hyperlink Conventional Commits in workflow guidance ([1f69d92](https://github.com/teqbench/tbx-ngx-http/commit/1f69d92b66678d9a7e0f2a4484538d21bfb56c72))
* **docs:** keep README Compatibility as a pipe table for CI version extraction ([f6ae7e3](https://github.com/teqbench/tbx-ngx-http/commit/f6ae7e3960c71f41cac625e23bac9b4c6c0c4fa6))
* **docs:** list actual emitted APF entry-point keys ([178e667](https://github.com/teqbench/tbx-ngx-http/commit/178e6676933e46f96f40a6e0c832e412b48e83f8))
* **docs:** normalize external doc URLs to no trailing slash ([f7504d4](https://github.com/teqbench/tbx-ngx-http/commit/f7504d4ae8ee3bf17832dbebd4c0cf390318ed52))
* **docs:** note central Renovate dependency updates in CLAUDE.md ([69f82de](https://github.com/teqbench/tbx-ngx-http/commit/69f82de7c3bd7e8e794e229f1570c3f19e997c0d))
* **docs:** note that [@returns](https://github.com/returns) is omitted for void returns ([2aa9308](https://github.com/teqbench/tbx-ngx-http/commit/2aa93089f7375cbc1d73bec984891540129db16b))
* **docs:** remove md files now provided by teqbench/.github ([50e773d](https://github.com/teqbench/tbx-ngx-http/commit/50e773d08b8f50d1ea41dab30813469673589f31))
* **docs:** use vertical list for TSDoc tag ordering ([c25f169](https://github.com/teqbench/tbx-ngx-http/commit/c25f1691c92d91ad583acd05d9966767af016e1f))
* package updates, CLAUDE.md alignment, docs cleanup ([1313323](https://github.com/teqbench/tbx-ngx-http/commit/13133230f4d48c98a5c5e3a3511ce1fde7722a04))

## [1.1.0](https://github.com/teqbench/tbx-ngx-http/compare/v1.0.2...v1.1.0) (2026-04-13)


### Features

* **docs:** onboard tbx-ngx-http to the per-package docs pipeline ([2e46394](https://github.com/teqbench/tbx-ngx-http/commit/2e4639402e1db556e8cec5f406bde572d2dc8f0c))
* **docs:** onboard tbx-ngx-http to the per-package docs pipeline ([444e84f](https://github.com/teqbench/tbx-ngx-http/commit/444e84f661eedfd586bf60b24080dba8fe8337ff))

## [1.0.2](https://github.com/teqbench/tbx-ngx-http/compare/v1.0.1...v1.0.2) (2026-04-06)


### Bug Fixes

* **deps:** update vite to 7.3.2/8.0.5 to resolve CVEs ([9a4cfbb](https://github.com/teqbench/tbx-ngx-http/commit/9a4cfbb5ca2511c68a1bd8e087dc016aea19495f))
* **deps:** update vite to 7.3.2/8.0.5 to resolve CVEs ([b4977b8](https://github.com/teqbench/tbx-ngx-http/commit/b4977b8b328aa84e9da8b7fc7ae186d226bff39a))

## [1.0.1](https://github.com/teqbench/tbx-ngx-http/compare/v1.0.0...v1.0.1) (2026-04-03)


### Bug Fixes

* **security:** switch reporting channel from advisory URL to email ([9d52682](https://github.com/teqbench/tbx-ngx-http/commit/9d526829f41154a16e2a04ed8db2ddc2c86698d3))
* **security:** switch reporting channel from advisory URL to email ([22d1fa1](https://github.com/teqbench/tbx-ngx-http/commit/22d1fa1dce9a77c1b5f78795c658710e3add978b))

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
