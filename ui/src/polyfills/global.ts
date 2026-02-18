/**
 * FIX: Polyfill for legacy libraries (Ant Design 3)
 * that expect 'global' to exist in the browser environment.
 * This must run before any other code.
 */
if (typeof window.global === 'undefined') {
    window.global = window
}
