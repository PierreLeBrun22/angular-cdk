/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BehaviorSubject } from 'rxjs';
/** Unique symbol that is used to patch a property to a proxy zone. */
const stateObservableSymbol = Symbol('ProxyZone_PATCHED#stateObservable');
/**
 * Interceptor that can be set up in a `ProxyZone` instance. The interceptor
 * will keep track of the task state and emit whenever the state changes.
 *
 * This serves as a workaround for https://github.com/angular/angular/issues/32896.
 */
export class TaskStateZoneInterceptor {
    constructor(_lastState) {
        this._lastState = _lastState;
        /** Subject that can be used to emit a new state change. */
        this._stateSubject = new BehaviorSubject(this._lastState ? this._getTaskStateFromInternalZoneState(this._lastState) : { stable: true });
        /** Public observable that emits whenever the task state changes. */
        this.state = this._stateSubject;
    }
    /** This will be called whenever the task state changes in the intercepted zone. */
    onHasTask(delegate, current, target, hasTaskState) {
        if (current === target) {
            this._stateSubject.next(this._getTaskStateFromInternalZoneState(hasTaskState));
        }
    }
    /** Gets the task state from the internal ZoneJS task state. */
    _getTaskStateFromInternalZoneState(state) {
        return { stable: !state.macroTask && !state.microTask };
    }
    /**
     * Sets up the custom task state Zone interceptor in the  `ProxyZone`. Throws if
     * no `ProxyZone` could be found.
     * @returns an observable that emits whenever the task state changes.
     */
    static setup() {
        if (Zone === undefined) {
            throw Error('Could not find ZoneJS. For test harnesses running in TestBed, ' +
                'ZoneJS needs to be installed.');
        }
        // tslint:disable-next-line:variable-name
        const ProxyZoneSpec = Zone['ProxyZoneSpec'];
        // If there is no "ProxyZoneSpec" installed, we throw an error and recommend
        // setting up the proxy zone by pulling in the testing bundle.
        if (!ProxyZoneSpec) {
            throw Error('ProxyZoneSpec is needed for the test harnesses but could not be found. ' +
                'Please make sure that your environment includes zone.js/dist/zone-testing.js');
        }
        // Ensure that there is a proxy zone instance set up, and get
        // a reference to the instance if present.
        const zoneSpec = ProxyZoneSpec.assertPresent();
        // If there already is a delegate registered in the proxy zone, and it
        // is type of the custom task state interceptor, we just use that state
        // observable. This allows us to only intercept Zone once per test
        // (similar to how `fakeAsync` or `async` work).
        if (zoneSpec[stateObservableSymbol]) {
            return zoneSpec[stateObservableSymbol];
        }
        // Since we intercept on environment creation and the fixture has been
        // created before, we might have missed tasks scheduled before. Fortunately
        // the proxy zone keeps track of the previous task state, so we can just pass
        // this as initial state to the task zone interceptor.
        const interceptor = new TaskStateZoneInterceptor(zoneSpec.lastTaskState);
        const zoneSpecOnHasTask = zoneSpec.onHasTask.bind(zoneSpec);
        // We setup the task state interceptor in the `ProxyZone`. Note that we cannot register
        // the interceptor as a new proxy zone delegate because it would mean that other zone
        // delegates (e.g. `FakeAsyncTestZone` or `AsyncTestZone`) can accidentally overwrite/disable
        // our interceptor. Since we just intend to monitor the task state of the proxy zone, it is
        // sufficient to just patch the proxy zone. This also avoids that we interfere with the task
        // queue scheduling logic.
        zoneSpec.onHasTask = function (...args) {
            zoneSpecOnHasTask(...args);
            interceptor.onHasTask(...args);
        };
        return zoneSpec[stateObservableSymbol] = interceptor.state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvdGFzay1zdGF0ZS16b25lLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxlQUFlLEVBQWEsTUFBTSxNQUFNLENBQUM7QUFTakQsc0VBQXNFO0FBQ3RFLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFPMUU7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sd0JBQXdCO0lBUW5DLFlBQW9CLFVBQTZCO1FBQTdCLGVBQVUsR0FBVixVQUFVLENBQW1CO1FBUGpELDJEQUEyRDtRQUNuRCxrQkFBYSxHQUErQixJQUFJLGVBQWUsQ0FDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUVqRyxvRUFBb0U7UUFDM0QsVUFBSyxHQUEwQixJQUFJLENBQUMsYUFBYSxDQUFDO0lBRVAsQ0FBQztJQUVyRCxtRkFBbUY7SUFDbkYsU0FBUyxDQUFDLFFBQXNCLEVBQUUsT0FBYSxFQUFFLE1BQVksRUFBRSxZQUEwQjtRQUN2RixJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FDaEY7SUFDSCxDQUFDO0lBRUQsK0RBQStEO0lBQ3ZELGtDQUFrQyxDQUFDLEtBQW1CO1FBQzVELE9BQU8sRUFBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBQyxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsTUFBTSxDQUFDLEtBQUs7UUFDVixJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdEIsTUFBTSxLQUFLLENBQUMsZ0VBQWdFO2dCQUMxRSwrQkFBK0IsQ0FBQyxDQUFDO1NBQ3BDO1FBRUQseUNBQXlDO1FBQ3pDLE1BQU0sYUFBYSxHQUFJLElBQVksQ0FBQyxlQUFlLENBQThCLENBQUM7UUFFbEYsNEVBQTRFO1FBQzVFLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2xCLE1BQU0sS0FBSyxDQUNULHlFQUF5RTtnQkFDekUsOEVBQThFLENBQUMsQ0FBQztTQUNuRjtRQUVELDZEQUE2RDtRQUM3RCwwQ0FBMEM7UUFDMUMsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLGFBQWEsRUFBc0IsQ0FBQztRQUVuRSxzRUFBc0U7UUFDdEUsdUVBQXVFO1FBQ3ZFLGtFQUFrRTtRQUNsRSxnREFBZ0Q7UUFDaEQsSUFBSSxRQUFRLENBQUMscUJBQXFCLENBQUMsRUFBRTtZQUNuQyxPQUFPLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBRSxDQUFDO1NBQ3pDO1FBRUQsc0VBQXNFO1FBQ3RFLDJFQUEyRTtRQUMzRSw2RUFBNkU7UUFDN0Usc0RBQXNEO1FBQ3RELE1BQU0sV0FBVyxHQUFHLElBQUksd0JBQXdCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUQsdUZBQXVGO1FBQ3ZGLHFGQUFxRjtRQUNyRiw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLDRGQUE0RjtRQUM1RiwwQkFBMEI7UUFDMUIsUUFBUSxDQUFDLFNBQVMsR0FBRyxVQUFTLEdBQUcsSUFBOEM7WUFDN0UsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUMzQixXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDO1FBRUYsT0FBTyxRQUFRLENBQUMscUJBQXFCLENBQUMsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDO0lBQzdELENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGV9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge1Byb3h5Wm9uZSwgUHJveHlab25lU3RhdGljfSBmcm9tICcuL3Byb3h5LXpvbmUtdHlwZXMnO1xyXG5cclxuLyoqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIGludGVyY2VwdGVkIHpvbmUuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGFza1N0YXRlIHtcclxuICAvKiogV2hldGhlciB0aGUgem9uZSBpcyBzdGFibGUgKGkuZS4gbm8gbWljcm90YXNrcyBhbmQgbWFjcm90YXNrcykuICovXHJcbiAgc3RhYmxlOiBib29sZWFuO1xyXG59XHJcblxyXG4vKiogVW5pcXVlIHN5bWJvbCB0aGF0IGlzIHVzZWQgdG8gcGF0Y2ggYSBwcm9wZXJ0eSB0byBhIHByb3h5IHpvbmUuICovXHJcbmNvbnN0IHN0YXRlT2JzZXJ2YWJsZVN5bWJvbCA9IFN5bWJvbCgnUHJveHlab25lX1BBVENIRUQjc3RhdGVPYnNlcnZhYmxlJyk7XHJcblxyXG4vKiogVHlwZSB0aGF0IGRlc2NyaWJlcyBhIHBvdGVudGlhbGx5IHBhdGNoZWQgcHJveHkgem9uZSBpbnN0YW5jZS4gKi9cclxudHlwZSBQYXRjaGVkUHJveHlab25lID0gUHJveHlab25lICYge1xyXG4gIFtzdGF0ZU9ic2VydmFibGVTeW1ib2xdOiB1bmRlZmluZWR8T2JzZXJ2YWJsZTxUYXNrU3RhdGU+O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVyY2VwdG9yIHRoYXQgY2FuIGJlIHNldCB1cCBpbiBhIGBQcm94eVpvbmVgIGluc3RhbmNlLiBUaGUgaW50ZXJjZXB0b3JcclxuICogd2lsbCBrZWVwIHRyYWNrIG9mIHRoZSB0YXNrIHN0YXRlIGFuZCBlbWl0IHdoZW5ldmVyIHRoZSBzdGF0ZSBjaGFuZ2VzLlxyXG4gKlxyXG4gKiBUaGlzIHNlcnZlcyBhcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzMyODk2LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRhc2tTdGF0ZVpvbmVJbnRlcmNlcHRvciB7XHJcbiAgLyoqIFN1YmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBlbWl0IGEgbmV3IHN0YXRlIGNoYW5nZS4gKi9cclxuICBwcml2YXRlIF9zdGF0ZVN1YmplY3Q6IEJlaGF2aW9yU3ViamVjdDxUYXNrU3RhdGU+ID0gbmV3IEJlaGF2aW9yU3ViamVjdDxUYXNrU3RhdGU+KFxyXG4gICAgICB0aGlzLl9sYXN0U3RhdGUgPyB0aGlzLl9nZXRUYXNrU3RhdGVGcm9tSW50ZXJuYWxab25lU3RhdGUodGhpcy5fbGFzdFN0YXRlKSA6IHtzdGFibGU6IHRydWV9KTtcclxuXHJcbiAgLyoqIFB1YmxpYyBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHRhc2sgc3RhdGUgY2hhbmdlcy4gKi9cclxuICByZWFkb25seSBzdGF0ZTogT2JzZXJ2YWJsZTxUYXNrU3RhdGU+ID0gdGhpcy5fc3RhdGVTdWJqZWN0O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sYXN0U3RhdGU6IEhhc1Rhc2tTdGF0ZXxudWxsKSB7fVxyXG5cclxuICAvKiogVGhpcyB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgdGFzayBzdGF0ZSBjaGFuZ2VzIGluIHRoZSBpbnRlcmNlcHRlZCB6b25lLiAqL1xyXG4gIG9uSGFzVGFzayhkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIGhhc1Rhc2tTdGF0ZTogSGFzVGFza1N0YXRlKSB7XHJcbiAgICBpZiAoY3VycmVudCA9PT0gdGFyZ2V0KSB7XHJcbiAgICAgIHRoaXMuX3N0YXRlU3ViamVjdC5uZXh0KHRoaXMuX2dldFRhc2tTdGF0ZUZyb21JbnRlcm5hbFpvbmVTdGF0ZShoYXNUYXNrU3RhdGUpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSB0YXNrIHN0YXRlIGZyb20gdGhlIGludGVybmFsIFpvbmVKUyB0YXNrIHN0YXRlLiAqL1xyXG4gIHByaXZhdGUgX2dldFRhc2tTdGF0ZUZyb21JbnRlcm5hbFpvbmVTdGF0ZShzdGF0ZTogSGFzVGFza1N0YXRlKTogVGFza1N0YXRlIHtcclxuICAgIHJldHVybiB7c3RhYmxlOiAhc3RhdGUubWFjcm9UYXNrICYmICFzdGF0ZS5taWNyb1Rhc2t9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB1cCB0aGUgY3VzdG9tIHRhc2sgc3RhdGUgWm9uZSBpbnRlcmNlcHRvciBpbiB0aGUgIGBQcm94eVpvbmVgLiBUaHJvd3MgaWZcclxuICAgKiBubyBgUHJveHlab25lYCBjb3VsZCBiZSBmb3VuZC5cclxuICAgKiBAcmV0dXJucyBhbiBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHRhc2sgc3RhdGUgY2hhbmdlcy5cclxuICAgKi9cclxuICBzdGF0aWMgc2V0dXAoKTogT2JzZXJ2YWJsZTxUYXNrU3RhdGU+IHtcclxuICAgIGlmIChab25lID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIFpvbmVKUy4gRm9yIHRlc3QgaGFybmVzc2VzIHJ1bm5pbmcgaW4gVGVzdEJlZCwgJyArXHJcbiAgICAgICAgJ1pvbmVKUyBuZWVkcyB0byBiZSBpbnN0YWxsZWQuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWVcclxuICAgIGNvbnN0IFByb3h5Wm9uZVNwZWMgPSAoWm9uZSBhcyBhbnkpWydQcm94eVpvbmVTcGVjJ10gYXMgUHJveHlab25lU3RhdGljfHVuZGVmaW5lZDtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBubyBcIlByb3h5Wm9uZVNwZWNcIiBpbnN0YWxsZWQsIHdlIHRocm93IGFuIGVycm9yIGFuZCByZWNvbW1lbmRcclxuICAgIC8vIHNldHRpbmcgdXAgdGhlIHByb3h5IHpvbmUgYnkgcHVsbGluZyBpbiB0aGUgdGVzdGluZyBidW5kbGUuXHJcbiAgICBpZiAoIVByb3h5Wm9uZVNwZWMpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoXHJcbiAgICAgICAgJ1Byb3h5Wm9uZVNwZWMgaXMgbmVlZGVkIGZvciB0aGUgdGVzdCBoYXJuZXNzZXMgYnV0IGNvdWxkIG5vdCBiZSBmb3VuZC4gJyArXHJcbiAgICAgICAgJ1BsZWFzZSBtYWtlIHN1cmUgdGhhdCB5b3VyIGVudmlyb25tZW50IGluY2x1ZGVzIHpvbmUuanMvZGlzdC96b25lLXRlc3RpbmcuanMnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGVyZSBpcyBhIHByb3h5IHpvbmUgaW5zdGFuY2Ugc2V0IHVwLCBhbmQgZ2V0XHJcbiAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFuY2UgaWYgcHJlc2VudC5cclxuICAgIGNvbnN0IHpvbmVTcGVjID0gUHJveHlab25lU3BlYy5hc3NlcnRQcmVzZW50KCkgYXMgUGF0Y2hlZFByb3h5Wm9uZTtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBhbHJlYWR5IGlzIGEgZGVsZWdhdGUgcmVnaXN0ZXJlZCBpbiB0aGUgcHJveHkgem9uZSwgYW5kIGl0XHJcbiAgICAvLyBpcyB0eXBlIG9mIHRoZSBjdXN0b20gdGFzayBzdGF0ZSBpbnRlcmNlcHRvciwgd2UganVzdCB1c2UgdGhhdCBzdGF0ZVxyXG4gICAgLy8gb2JzZXJ2YWJsZS4gVGhpcyBhbGxvd3MgdXMgdG8gb25seSBpbnRlcmNlcHQgWm9uZSBvbmNlIHBlciB0ZXN0XHJcbiAgICAvLyAoc2ltaWxhciB0byBob3cgYGZha2VBc3luY2Agb3IgYGFzeW5jYCB3b3JrKS5cclxuICAgIGlmICh6b25lU3BlY1tzdGF0ZU9ic2VydmFibGVTeW1ib2xdKSB7XHJcbiAgICAgIHJldHVybiB6b25lU3BlY1tzdGF0ZU9ic2VydmFibGVTeW1ib2xdITtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTaW5jZSB3ZSBpbnRlcmNlcHQgb24gZW52aXJvbm1lbnQgY3JlYXRpb24gYW5kIHRoZSBmaXh0dXJlIGhhcyBiZWVuXHJcbiAgICAvLyBjcmVhdGVkIGJlZm9yZSwgd2UgbWlnaHQgaGF2ZSBtaXNzZWQgdGFza3Mgc2NoZWR1bGVkIGJlZm9yZS4gRm9ydHVuYXRlbHlcclxuICAgIC8vIHRoZSBwcm94eSB6b25lIGtlZXBzIHRyYWNrIG9mIHRoZSBwcmV2aW91cyB0YXNrIHN0YXRlLCBzbyB3ZSBjYW4ganVzdCBwYXNzXHJcbiAgICAvLyB0aGlzIGFzIGluaXRpYWwgc3RhdGUgdG8gdGhlIHRhc2sgem9uZSBpbnRlcmNlcHRvci5cclxuICAgIGNvbnN0IGludGVyY2VwdG9yID0gbmV3IFRhc2tTdGF0ZVpvbmVJbnRlcmNlcHRvcih6b25lU3BlYy5sYXN0VGFza1N0YXRlKTtcclxuICAgIGNvbnN0IHpvbmVTcGVjT25IYXNUYXNrID0gem9uZVNwZWMub25IYXNUYXNrLmJpbmQoem9uZVNwZWMpO1xyXG5cclxuICAgIC8vIFdlIHNldHVwIHRoZSB0YXNrIHN0YXRlIGludGVyY2VwdG9yIGluIHRoZSBgUHJveHlab25lYC4gTm90ZSB0aGF0IHdlIGNhbm5vdCByZWdpc3RlclxyXG4gICAgLy8gdGhlIGludGVyY2VwdG9yIGFzIGEgbmV3IHByb3h5IHpvbmUgZGVsZWdhdGUgYmVjYXVzZSBpdCB3b3VsZCBtZWFuIHRoYXQgb3RoZXIgem9uZVxyXG4gICAgLy8gZGVsZWdhdGVzIChlLmcuIGBGYWtlQXN5bmNUZXN0Wm9uZWAgb3IgYEFzeW5jVGVzdFpvbmVgKSBjYW4gYWNjaWRlbnRhbGx5IG92ZXJ3cml0ZS9kaXNhYmxlXHJcbiAgICAvLyBvdXIgaW50ZXJjZXB0b3IuIFNpbmNlIHdlIGp1c3QgaW50ZW5kIHRvIG1vbml0b3IgdGhlIHRhc2sgc3RhdGUgb2YgdGhlIHByb3h5IHpvbmUsIGl0IGlzXHJcbiAgICAvLyBzdWZmaWNpZW50IHRvIGp1c3QgcGF0Y2ggdGhlIHByb3h5IHpvbmUuIFRoaXMgYWxzbyBhdm9pZHMgdGhhdCB3ZSBpbnRlcmZlcmUgd2l0aCB0aGUgdGFza1xyXG4gICAgLy8gcXVldWUgc2NoZWR1bGluZyBsb2dpYy5cclxuICAgIHpvbmVTcGVjLm9uSGFzVGFzayA9IGZ1bmN0aW9uKC4uLmFyZ3M6IFtab25lRGVsZWdhdGUsIFpvbmUsIFpvbmUsIEhhc1Rhc2tTdGF0ZV0pIHtcclxuICAgICAgem9uZVNwZWNPbkhhc1Rhc2soLi4uYXJncyk7XHJcbiAgICAgIGludGVyY2VwdG9yLm9uSGFzVGFzayguLi5hcmdzKTtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHpvbmVTcGVjW3N0YXRlT2JzZXJ2YWJsZVN5bWJvbF0gPSBpbnRlcmNlcHRvci5zdGF0ZTtcclxuICB9XHJcbn1cclxuIl19