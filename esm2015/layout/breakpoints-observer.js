/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceArray } from '@angular/cdk/coercion';
import { Injectable, NgZone } from '@angular/core';
import { combineLatest, concat, Observable, Subject } from 'rxjs';
import { debounceTime, map, skip, startWith, take, takeUntil } from 'rxjs/operators';
import { MediaMatcher } from './media-matcher';
import * as i0 from "@angular/core";
import * as i1 from "./media-matcher";
/** Utility for checking the matching state of @media queries. */
export class BreakpointObserver {
    constructor(_mediaMatcher, _zone) {
        this._mediaMatcher = _mediaMatcher;
        this._zone = _zone;
        /**  A map of all media queries currently being listened for. */
        this._queries = new Map();
        /** A subject for all other observables to takeUntil based on. */
        this._destroySubject = new Subject();
    }
    /** Completes the active subject, signalling to all other observables to complete. */
    ngOnDestroy() {
        this._destroySubject.next();
        this._destroySubject.complete();
    }
    /**
     * Whether one or more media queries match the current viewport size.
     * @param value One or more media queries to check.
     * @returns Whether any of the media queries match.
     */
    isMatched(value) {
        const queries = splitQueries(coerceArray(value));
        return queries.some(mediaQuery => this._registerQuery(mediaQuery).mql.matches);
    }
    /**
     * Gets an observable of results for the given queries that will emit new results for any changes
     * in matching of the given queries.
     * @param value One or more media queries to check.
     * @returns A stream of matches for the given queries.
     */
    observe(value) {
        const queries = splitQueries(coerceArray(value));
        const observables = queries.map(query => this._registerQuery(query).observable);
        let stateObservable = combineLatest(observables);
        // Emit the first state immediately, and then debounce the subsequent emissions.
        stateObservable = concat(stateObservable.pipe(take(1)), stateObservable.pipe(skip(1), debounceTime(0)));
        return stateObservable.pipe(map(breakpointStates => {
            const response = {
                matches: false,
                breakpoints: {},
            };
            breakpointStates.forEach(({ matches, query }) => {
                response.matches = response.matches || matches;
                response.breakpoints[query] = matches;
            });
            return response;
        }));
    }
    /** Registers a specific query to be listened for. */
    _registerQuery(query) {
        // Only set up a new MediaQueryList if it is not already being listened for.
        if (this._queries.has(query)) {
            return this._queries.get(query);
        }
        const mql = this._mediaMatcher.matchMedia(query);
        // Create callback for match changes and add it is as a listener.
        const queryObservable = new Observable((observer) => {
            // Listener callback methods are wrapped to be placed back in ngZone. Callbacks must be placed
            // back into the zone because matchMedia is only included in Zone.js by loading the
            // webapis-media-query.js file alongside the zone.js file.  Additionally, some browsers do not
            // have MediaQueryList inherit from EventTarget, which causes inconsistencies in how Zone.js
            // patches it.
            const handler = (e) => this._zone.run(() => observer.next(e));
            mql.addListener(handler);
            return () => {
                mql.removeListener(handler);
            };
        }).pipe(startWith(mql), map(({ matches }) => ({ query, matches })), takeUntil(this._destroySubject));
        // Add the MediaQueryList to the set of queries.
        const output = { observable: queryObservable, mql };
        this._queries.set(query, output);
        return output;
    }
}
BreakpointObserver.ɵprov = i0.ɵɵdefineInjectable({ factory: function BreakpointObserver_Factory() { return new BreakpointObserver(i0.ɵɵinject(i1.MediaMatcher), i0.ɵɵinject(i0.NgZone)); }, token: BreakpointObserver, providedIn: "root" });
BreakpointObserver.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
BreakpointObserver.ctorParameters = () => [
    { type: MediaMatcher },
    { type: NgZone }
];
/**
 * Split each query string into separate query strings if two queries are provided as comma
 * separated.
 */
function splitQueries(queries) {
    return queries.map(query => query.split(','))
        .reduce((a1, a2) => a1.concat(a2))
        .map(query => query.trim());
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHMtb2JzZXJ2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2xheW91dC9icmVha3BvaW50cy1vYnNlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQVksTUFBTSxlQUFlLENBQUM7QUFDNUQsT0FBTyxFQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFZLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMxRSxPQUFPLEVBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7OztBQTZCN0MsaUVBQWlFO0FBRWpFLE1BQU0sT0FBTyxrQkFBa0I7SUFNN0IsWUFBb0IsYUFBMkIsRUFBVSxLQUFhO1FBQWxELGtCQUFhLEdBQWIsYUFBYSxDQUFjO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUx0RSxnRUFBZ0U7UUFDeEQsYUFBUSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQzVDLGlFQUFpRTtRQUN6RCxvQkFBZSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFMkIsQ0FBQztJQUUxRSxxRkFBcUY7SUFDckYsV0FBVztRQUNULElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsQ0FBQyxLQUFpQztRQUN6QyxNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FB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LEdBQUcsRUFBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNqQyxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDOzs7O1lBckZGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQTlCeEIsWUFBWTtZQUhBLE1BQU07O0FBeUgxQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBQyxPQUEwQjtJQUM5QyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzlCLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDNUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtjb2VyY2VBcnJheX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtJbmplY3RhYmxlLCBOZ1pvbmUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Y29tYmluZUxhdGVzdCwgY29uY2F0LCBPYnNlcnZhYmxlLCBPYnNlcnZlciwgU3ViamVjdH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7ZGVib3VuY2VUaW1lLCBtYXAsIHNraXAsIHN0YXJ0V2l0aCwgdGFrZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7TWVkaWFNYXRjaGVyfSBmcm9tICcuL21lZGlhLW1hdGNoZXInO1xyXG5cclxuXHJcbi8qKiBUaGUgY3VycmVudCBzdGF0ZSBvZiBhIGxheW91dCBicmVha3BvaW50LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEJyZWFrcG9pbnRTdGF0ZSB7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIGJyZWFrcG9pbnQgaXMgY3VycmVudGx5IG1hdGNoaW5nLiAqL1xyXG4gIG1hdGNoZXM6IGJvb2xlYW47XHJcbiAgLyoqXHJcbiAgICogQSBrZXkgYm9vbGVhbiBwYWlyIGZvciBlYWNoIHF1ZXJ5IHByb3ZpZGVkIHRvIHRoZSBvYnNlcnZlIG1ldGhvZCxcclxuICAgKiB3aXRoIGl0cyBjdXJyZW50IG1hdGNoZWQgc3RhdGUuXHJcbiAgICovXHJcbiAgYnJlYWtwb2ludHM6IHtcclxuICAgIFtrZXk6IHN0cmluZ106IGJvb2xlYW47XHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFRoZSBjdXJyZW50IHN0YXRlIG9mIGEgbGF5b3V0IGJyZWFrcG9pbnQuICovXHJcbmludGVyZmFjZSBJbnRlcm5hbEJyZWFrcG9pbnRTdGF0ZSB7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIGJyZWFrcG9pbnQgaXMgY3VycmVudGx5IG1hdGNoaW5nLiAqL1xyXG4gIG1hdGNoZXM6IGJvb2xlYW47XHJcbiAgLyoqIFRoZSBtZWRpYSBxdWVyeSBiZWluZyB0byBiZSBtYXRjaGVkICovXHJcbiAgcXVlcnk6IHN0cmluZztcclxufVxyXG5cclxuaW50ZXJmYWNlIFF1ZXJ5IHtcclxuICBvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPEludGVybmFsQnJlYWtwb2ludFN0YXRlPjtcclxuICBtcWw6IE1lZGlhUXVlcnlMaXN0O1xyXG59XHJcblxyXG4vKiogVXRpbGl0eSBmb3IgY2hlY2tpbmcgdGhlIG1hdGNoaW5nIHN0YXRlIG9mIEBtZWRpYSBxdWVyaWVzLiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEJyZWFrcG9pbnRPYnNlcnZlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgLyoqICBBIG1hcCBvZiBhbGwgbWVkaWEgcXVlcmllcyBjdXJyZW50bHkgYmVpbmcgbGlzdGVuZWQgZm9yLiAqL1xyXG4gIHByaXZhdGUgX3F1ZXJpZXMgPSBuZXcgTWFwPHN0cmluZywgUXVlcnk+KCk7XHJcbiAgLyoqIEEgc3ViamVjdCBmb3IgYWxsIG90aGVyIG9ic2VydmFibGVzIHRvIHRha2VVbnRpbCBiYXNlZCBvbi4gKi9cclxuICBwcml2YXRlIF9kZXN0cm95U3ViamVjdCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21lZGlhTWF0Y2hlcjogTWVkaWFNYXRjaGVyLCBwcml2YXRlIF96b25lOiBOZ1pvbmUpIHt9XHJcblxyXG4gIC8qKiBDb21wbGV0ZXMgdGhlIGFjdGl2ZSBzdWJqZWN0LCBzaWduYWxsaW5nIHRvIGFsbCBvdGhlciBvYnNlcnZhYmxlcyB0byBjb21wbGV0ZS4gKi9cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2Rlc3Ryb3lTdWJqZWN0Lm5leHQoKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3lTdWJqZWN0LmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIG9uZSBvciBtb3JlIG1lZGlhIHF1ZXJpZXMgbWF0Y2ggdGhlIGN1cnJlbnQgdmlld3BvcnQgc2l6ZS5cclxuICAgKiBAcGFyYW0gdmFsdWUgT25lIG9yIG1vcmUgbWVkaWEgcXVlcmllcyB0byBjaGVjay5cclxuICAgKiBAcmV0dXJucyBXaGV0aGVyIGFueSBvZiB0aGUgbWVkaWEgcXVlcmllcyBtYXRjaC5cclxuICAgKi9cclxuICBpc01hdGNoZWQodmFsdWU6IHN0cmluZyB8IHJlYWRvbmx5IHN0cmluZ1tdKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBxdWVyaWVzID0gc3BsaXRRdWVyaWVzKGNvZXJjZUFycmF5KHZhbHVlKSk7XHJcbiAgICByZXR1cm4gcXVlcmllcy5zb21lKG1lZGlhUXVlcnkgPT4gdGhpcy5fcmVnaXN0ZXJRdWVyeShtZWRpYVF1ZXJ5KS5tcWwubWF0Y2hlcyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGFuIG9ic2VydmFibGUgb2YgcmVzdWx0cyBmb3IgdGhlIGdpdmVuIHF1ZXJpZXMgdGhhdCB3aWxsIGVtaXQgbmV3IHJlc3VsdHMgZm9yIGFueSBjaGFuZ2VzXHJcbiAgICogaW4gbWF0Y2hpbmcgb2YgdGhlIGdpdmVuIHF1ZXJpZXMuXHJcbiAgICogQHBhcmFtIHZhbHVlIE9uZSBvciBtb3JlIG1lZGlhIHF1ZXJpZXMgdG8gY2hlY2suXHJcbiAgICogQHJldHVybnMgQSBzdHJlYW0gb2YgbWF0Y2hlcyBmb3IgdGhlIGdpdmVuIHF1ZXJpZXMuXHJcbiAgICovXHJcbiAgb2JzZXJ2ZSh2YWx1ZTogc3RyaW5nIHwgcmVhZG9ubHkgc3RyaW5nW10pOiBPYnNlcnZhYmxlPEJyZWFrcG9pbnRTdGF0ZT4ge1xyXG4gICAgY29uc3QgcXVlcmllcyA9IHNwbGl0UXVlcmllcyhjb2VyY2VBcnJheSh2YWx1ZSkpO1xyXG4gICAgY29uc3Qgb2JzZXJ2YWJsZXMgPSBxdWVyaWVzLm1hcChxdWVyeSA9PiB0aGlzLl9yZWdpc3RlclF1ZXJ5KHF1ZXJ5KS5vYnNlcnZhYmxlKTtcclxuXHJcbiAgICBsZXQgc3RhdGVPYnNlcnZhYmxlID0gY29tYmluZUxhdGVzdChvYnNlcnZhYmxlcyk7XHJcbiAgICAvLyBFbWl0IHRoZSBmaXJzdCBzdGF0ZSBpbW1lZGlhdGVseSwgYW5kIHRoZW4gZGVib3VuY2UgdGhlIHN1YnNlcXVlbnQgZW1pc3Npb25zLlxyXG4gICAgc3RhdGVPYnNlcnZhYmxlID0gY29uY2F0KFxyXG4gICAgICBzdGF0ZU9ic2VydmFibGUucGlwZSh0YWtlKDEpKSxcclxuICAgICAgc3RhdGVPYnNlcnZhYmxlLnBpcGUoc2tpcCgxKSwgZGVib3VuY2VUaW1lKDApKSk7XHJcbiAgICByZXR1cm4gc3RhdGVPYnNlcnZhYmxlLnBpcGUobWFwKGJyZWFrcG9pbnRTdGF0ZXMgPT4ge1xyXG4gICAgICBjb25zdCByZXNwb25zZTogQnJlYWtwb2ludFN0YXRlID0ge1xyXG4gICAgICAgIG1hdGNoZXM6IGZhbHNlLFxyXG4gICAgICAgIGJyZWFrcG9pbnRzOiB7fSxcclxuICAgICAgfTtcclxuICAgICAgYnJlYWtwb2ludFN0YXRlcy5mb3JFYWNoKCh7bWF0Y2hlcywgcXVlcnl9KSA9PiB7XHJcbiAgICAgICAgcmVzcG9uc2UubWF0Y2hlcyA9IHJlc3BvbnNlLm1hdGNoZXMgfHwgbWF0Y2hlcztcclxuICAgICAgICByZXNwb25zZS5icmVha3BvaW50c1txdWVyeV0gPSBtYXRjaGVzO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlZ2lzdGVycyBhIHNwZWNpZmljIHF1ZXJ5IHRvIGJlIGxpc3RlbmVkIGZvci4gKi9cclxuICBwcml2YXRlIF9yZWdpc3RlclF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBRdWVyeSB7XHJcbiAgICAvLyBPbmx5IHNldCB1cCBhIG5ldyBNZWRpYVF1ZXJ5TGlzdCBpZiBpdCBpcyBub3QgYWxyZWFkeSBiZWluZyBsaXN0ZW5lZCBmb3IuXHJcbiAgICBpZiAodGhpcy5fcXVlcmllcy5oYXMocXVlcnkpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9xdWVyaWVzLmdldChxdWVyeSkhO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1xbCA9IHRoaXMuX21lZGlhTWF0Y2hlci5tYXRjaE1lZGlhKHF1ZXJ5KTtcclxuXHJcbiAgICAvLyBDcmVhdGUgY2FsbGJhY2sgZm9yIG1hdGNoIGNoYW5nZXMgYW5kIGFkZCBpdCBpcyBhcyBhIGxpc3RlbmVyLlxyXG4gICAgY29uc3QgcXVlcnlPYnNlcnZhYmxlID0gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxNZWRpYVF1ZXJ5TGlzdD4pID0+IHtcclxuICAgICAgLy8gTGlzdGVuZXIgY2FsbGJhY2sgbWV0aG9kcyBhcmUgd3JhcHBlZCB0byBiZSBwbGFjZWQgYmFjayBpbiBuZ1pvbmUuIENhbGxiYWNrcyBtdXN0IGJlIHBsYWNlZFxyXG4gICAgICAvLyBiYWNrIGludG8gdGhlIHpvbmUgYmVjYXVzZSBtYXRjaE1lZGlhIGlzIG9ubHkgaW5jbHVkZWQgaW4gWm9uZS5qcyBieSBsb2FkaW5nIHRoZVxyXG4gICAgICAvLyB3ZWJhcGlzLW1lZGlhLXF1ZXJ5LmpzIGZpbGUgYWxvbmdzaWRlIHRoZSB6b25lLmpzIGZpbGUuICBBZGRpdGlvbmFsbHksIHNvbWUgYnJvd3NlcnMgZG8gbm90XHJcbiAgICAgIC8vIGhhdmUgTWVkaWFRdWVyeUxpc3QgaW5oZXJpdCBmcm9tIEV2ZW50VGFyZ2V0LCB3aGljaCBjYXVzZXMgaW5jb25zaXN0ZW5jaWVzIGluIGhvdyBab25lLmpzXHJcbiAgICAgIC8vIHBhdGNoZXMgaXQuXHJcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSAoZTogYW55KSA9PiB0aGlzLl96b25lLnJ1bigoKSA9PiBvYnNlcnZlci5uZXh0KGUpKTtcclxuICAgICAgbXFsLmFkZExpc3RlbmVyKGhhbmRsZXIpO1xyXG5cclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICBtcWwucmVtb3ZlTGlzdGVuZXIoaGFuZGxlcik7XHJcbiAgICAgIH07XHJcbiAgICB9KS5waXBlKFxyXG4gICAgICBzdGFydFdpdGgobXFsKSxcclxuICAgICAgbWFwKCh7bWF0Y2hlc30pID0+ICh7cXVlcnksIG1hdGNoZXN9KSksXHJcbiAgICAgIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95U3ViamVjdClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBNZWRpYVF1ZXJ5TGlzdCB0byB0aGUgc2V0IG9mIHF1ZXJpZXMuXHJcbiAgICBjb25zdCBvdXRwdXQgPSB7b2JzZXJ2YWJsZTogcXVlcnlPYnNlcnZhYmxlLCBtcWx9O1xyXG4gICAgdGhpcy5fcXVlcmllcy5zZXQocXVlcnksIG91dHB1dCk7XHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFNwbGl0IGVhY2ggcXVlcnkgc3RyaW5nIGludG8gc2VwYXJhdGUgcXVlcnkgc3RyaW5ncyBpZiB0d28gcXVlcmllcyBhcmUgcHJvdmlkZWQgYXMgY29tbWFcclxuICogc2VwYXJhdGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gc3BsaXRRdWVyaWVzKHF1ZXJpZXM6IHJlYWRvbmx5IHN0cmluZ1tdKTogcmVhZG9ubHkgc3RyaW5nW10ge1xyXG4gIHJldHVybiBxdWVyaWVzLm1hcChxdWVyeSA9PiBxdWVyeS5zcGxpdCgnLCcpKVxyXG4gICAgICAgICAgICAgICAgLnJlZHVjZSgoYTEsIGEyKSA9PiBhMS5jb25jYXQoYTIpKVxyXG4gICAgICAgICAgICAgICAgLm1hcChxdWVyeSA9PiBxdWVyeS50cmltKCkpO1xyXG59XHJcbiJdfQ==