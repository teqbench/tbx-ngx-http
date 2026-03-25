import { greet } from './greet';

describe('greet', () => {
    it('should return a greeting with the given name', () => {
        expect(greet('World')).toBe('Hello, World!');
    });

    it('should handle an empty string', () => {
        expect(greet('')).toBe('Hello, !');
    });
});
