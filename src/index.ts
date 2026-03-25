/**
 * Public API Surface for the HTTP Core Domain.
 *
 * This barrel file provides a centralized entry point for base communication
 * services and resilience constants. It allows feature services to extend
 * standard API behaviors—such as automatic retries, timeout handling, and
 * consistent URL resolution—without coupling them to specific implementation
 * details.
 */
export * from './constants/http.constants';
export {
    BaseHttpService,
    type HttpRequestOptions,
    type HttpBodyRequestOptions,
} from './services/base-http.service';
