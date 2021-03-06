/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export * from './aria-describer/aria-describer';
export * from './key-manager/activedescendant-key-manager';
export * from './key-manager/focus-key-manager';
export * from './key-manager/list-key-manager';
export * from './focus-trap/configurable-focus-trap';
export * from './focus-trap/event-listener-inert-strategy';
export * from './focus-trap/focus-trap';
export * from './focus-trap/configurable-focus-trap-factory';
export * from './focus-trap/focus-trap-inert-strategy';
export * from './interactivity-checker/interactivity-checker';
export * from './live-announcer/live-announcer';
export * from './live-announcer/live-announcer-tokens';
export * from './focus-monitor/focus-monitor';
export * from './fake-event-detection';
export * from './a11y-module';
export { HighContrastModeDetector, } from './high-contrast-mode/high-contrast-mode-detector';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9wdWJsaWMtYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILGNBQWMsaUNBQWlDLENBQUM7QUFDaEQsY0FBYyw0Q0FBNEMsQ0FBQztBQUMzRCxjQUFjLGlDQUFpQyxDQUFDO0FBQ2hELGNBQWMsZ0NBQWdDLENBQUM7QUFDL0MsY0FBYyxzQ0FBc0MsQ0FBQztBQUNyRCxjQUFjLDRDQUE0QyxDQUFDO0FBQzNELGNBQWMseUJBQXlCLENBQUM7QUFDeEMsY0FBYyw4Q0FBOEMsQ0FBQztBQUM3RCxjQUFjLHdDQUF3QyxDQUFDO0FBQ3ZELGNBQWMsK0NBQStDLENBQUM7QUFDOUQsY0FBYyxpQ0FBaUMsQ0FBQztBQUNoRCxjQUFjLHdDQUF3QyxDQUFDO0FBQ3ZELGNBQWMsK0JBQStCLENBQUM7QUFDOUMsY0FBYyx3QkFBd0IsQ0FBQztBQUN2QyxjQUFjLGVBQWUsQ0FBQztBQUM5QixPQUFPLEVBQ0wsd0JBQXdCLEdBRXpCLE1BQU0sa0RBQWtELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuZXhwb3J0ICogZnJvbSAnLi9hcmlhLWRlc2NyaWJlci9hcmlhLWRlc2NyaWJlcic7XHJcbmV4cG9ydCAqIGZyb20gJy4va2V5LW1hbmFnZXIvYWN0aXZlZGVzY2VuZGFudC1rZXktbWFuYWdlcic7XHJcbmV4cG9ydCAqIGZyb20gJy4va2V5LW1hbmFnZXIvZm9jdXMta2V5LW1hbmFnZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL2tleS1tYW5hZ2VyL2xpc3Qta2V5LW1hbmFnZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL2ZvY3VzLXRyYXAvY29uZmlndXJhYmxlLWZvY3VzLXRyYXAnO1xyXG5leHBvcnQgKiBmcm9tICcuL2ZvY3VzLXRyYXAvZXZlbnQtbGlzdGVuZXItaW5lcnQtc3RyYXRlZ3knO1xyXG5leHBvcnQgKiBmcm9tICcuL2ZvY3VzLXRyYXAvZm9jdXMtdHJhcCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZm9jdXMtdHJhcC9jb25maWd1cmFibGUtZm9jdXMtdHJhcC1mYWN0b3J5JztcclxuZXhwb3J0ICogZnJvbSAnLi9mb2N1cy10cmFwL2ZvY3VzLXRyYXAtaW5lcnQtc3RyYXRlZ3knO1xyXG5leHBvcnQgKiBmcm9tICcuL2ludGVyYWN0aXZpdHktY2hlY2tlci9pbnRlcmFjdGl2aXR5LWNoZWNrZXInO1xyXG5leHBvcnQgKiBmcm9tICcuL2xpdmUtYW5ub3VuY2VyL2xpdmUtYW5ub3VuY2VyJztcclxuZXhwb3J0ICogZnJvbSAnLi9saXZlLWFubm91bmNlci9saXZlLWFubm91bmNlci10b2tlbnMnO1xyXG5leHBvcnQgKiBmcm9tICcuL2ZvY3VzLW1vbml0b3IvZm9jdXMtbW9uaXRvcic7XHJcbmV4cG9ydCAqIGZyb20gJy4vZmFrZS1ldmVudC1kZXRlY3Rpb24nO1xyXG5leHBvcnQgKiBmcm9tICcuL2ExMXktbW9kdWxlJztcclxuZXhwb3J0IHtcclxuICBIaWdoQ29udHJhc3RNb2RlRGV0ZWN0b3IsXHJcbiAgSGlnaENvbnRyYXN0TW9kZSxcclxufSBmcm9tICcuL2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3InO1xyXG4iXX0=