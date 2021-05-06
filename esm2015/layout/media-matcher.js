/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Global registry for all dynamically-created, injected media queries. */
const mediaQueriesForWebkitCompatibility = new Set();
/** Style tag that holds all of the dynamically-created media queries. */
let mediaQueryStyleNode;
/** A utility for calling matchMedia queries. */
export class MediaMatcher {
    constructor(_platform) {
        this._platform = _platform;
        this._matchMedia = this._platform.isBrowser && window.matchMedia ?
            // matchMedia is bound to the window scope intentionally as it is an illegal invocation to
            // call it from a different scope.
            window.matchMedia.bind(window) :
            noopMatchMedia;
    }
    /**
     * Evaluates the given media query and returns the native MediaQueryList from which results
     * can be retrieved.
     * Confirms the layout engine will trigger for the selector query provided and returns the
     * MediaQueryList for the query provided.
     */
    matchMedia(query) {
        if (this._platform.WEBKIT) {
            createEmptyStyleRule(query);
        }
        return this._matchMedia(query);
    }
}
MediaMatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function MediaMatcher_Factory() { return new MediaMatcher(i0.ɵɵinject(i1.Platform)); }, token: MediaMatcher, providedIn: "root" });
MediaMatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
MediaMatcher.ctorParameters = () => [
    { type: Platform }
];
/**
 * For Webkit engines that only trigger the MediaQueryListListener when
 * there is at least one CSS selector for the respective media query.
 */
function createEmptyStyleRule(query) {
    if (mediaQueriesForWebkitCompatibility.has(query)) {
        return;
    }
    try {
        if (!mediaQueryStyleNode) {
            mediaQueryStyleNode = document.createElement('style');
            mediaQueryStyleNode.setAttribute('type', 'text/css');
            document.head.appendChild(mediaQueryStyleNode);
        }
        if (mediaQueryStyleNode.sheet) {
            mediaQueryStyleNode.sheet
                .insertRule(`@media ${query} {.fx-query-test{ }}`, 0);
            mediaQueriesForWebkitCompatibility.add(query);
        }
    }
    catch (e) {
        console.error(e);
    }
}
/** No-op matchMedia replacement for non-browser platforms. */
function noopMatchMedia(query) {
    // Use `as any` here to avoid adding additional necessary properties for
    // the noop matcher.
    return {
        matches: query === 'all' || query === '',
        media: query,
        addListener: () => { },
        removeListener: () => { }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbWF0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvbGF5b3V0L21lZGlhLW1hdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7OztBQUUvQywyRUFBMkU7QUFDM0UsTUFBTSxrQ0FBa0MsR0FBZ0IsSUFBSSxHQUFHLEVBQVUsQ0FBQztBQUUxRSx5RUFBeUU7QUFDekUsSUFBSSxtQkFBaUQsQ0FBQztBQUV0RCxnREFBZ0Q7QUFFaEQsTUFBTSxPQUFPLFlBQVk7SUFJdkIsWUFBb0IsU0FBbUI7UUFBbkIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoRSwwRkFBMEY7WUFDMUYsa0NBQWtDO1lBQ2xDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEMsY0FBYyxDQUFDO0lBQ25CLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILFVBQVUsQ0FBQyxLQUFhO1FBQ3RCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDekIsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQzs7OztZQXhCRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFUeEIsUUFBUTs7QUFvQ2hCOzs7R0FHRztBQUNILFNBQVMsb0JBQW9CLENBQUMsS0FBYTtJQUN6QyxJQUFJLGtDQUFrQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNqRCxPQUFPO0tBQ1I7SUFFRCxJQUFJO1FBQ0YsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQ3hCLG1CQUFtQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEQsbUJBQW1CLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNyRCxRQUFRLENBQUMsSUFBSyxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7WUFDNUIsbUJBQW1CLENBQUMsS0FBdUI7aUJBQ3ZDLFVBQVUsQ0FBQyxVQUFVLEtBQUssc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUQsa0NBQWtDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0tBQ0Y7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEI7QUFDSCxDQUFDO0FBRUQsOERBQThEO0FBQzlELFNBQVMsY0FBYyxDQUFDLEtBQWE7SUFDbkMsd0VBQXdFO0lBQ3hFLG9CQUFvQjtJQUNwQixPQUFPO1FBQ0wsT0FBTyxFQUFFLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEVBQUU7UUFDeEMsS0FBSyxFQUFFLEtBQUs7UUFDWixXQUFXLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQztRQUNyQixjQUFjLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQztLQUNsQixDQUFDO0FBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5cclxuLyoqIEdsb2JhbCByZWdpc3RyeSBmb3IgYWxsIGR5bmFtaWNhbGx5LWNyZWF0ZWQsIGluamVjdGVkIG1lZGlhIHF1ZXJpZXMuICovXHJcbmNvbnN0IG1lZGlhUXVlcmllc0ZvcldlYmtpdENvbXBhdGliaWxpdHk6IFNldDxzdHJpbmc+ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcblxyXG4vKiogU3R5bGUgdGFnIHRoYXQgaG9sZHMgYWxsIG9mIHRoZSBkeW5hbWljYWxseS1jcmVhdGVkIG1lZGlhIHF1ZXJpZXMuICovXHJcbmxldCBtZWRpYVF1ZXJ5U3R5bGVOb2RlOiBIVE1MU3R5bGVFbGVtZW50IHwgdW5kZWZpbmVkO1xyXG5cclxuLyoqIEEgdXRpbGl0eSBmb3IgY2FsbGluZyBtYXRjaE1lZGlhIHF1ZXJpZXMuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgTWVkaWFNYXRjaGVyIHtcclxuICAvKiogVGhlIGludGVybmFsIG1hdGNoTWVkaWEgbWV0aG9kIHRvIHJldHVybiBiYWNrIGEgTWVkaWFRdWVyeUxpc3QgbGlrZSBvYmplY3QuICovXHJcbiAgcHJpdmF0ZSBfbWF0Y2hNZWRpYTogKHF1ZXJ5OiBzdHJpbmcpID0+IE1lZGlhUXVlcnlMaXN0O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0pIHtcclxuICAgIHRoaXMuX21hdGNoTWVkaWEgPSB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgJiYgd2luZG93Lm1hdGNoTWVkaWEgP1xyXG4gICAgICAvLyBtYXRjaE1lZGlhIGlzIGJvdW5kIHRvIHRoZSB3aW5kb3cgc2NvcGUgaW50ZW50aW9uYWxseSBhcyBpdCBpcyBhbiBpbGxlZ2FsIGludm9jYXRpb24gdG9cclxuICAgICAgLy8gY2FsbCBpdCBmcm9tIGEgZGlmZmVyZW50IHNjb3BlLlxyXG4gICAgICB3aW5kb3cubWF0Y2hNZWRpYS5iaW5kKHdpbmRvdykgOlxyXG4gICAgICBub29wTWF0Y2hNZWRpYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2YWx1YXRlcyB0aGUgZ2l2ZW4gbWVkaWEgcXVlcnkgYW5kIHJldHVybnMgdGhlIG5hdGl2ZSBNZWRpYVF1ZXJ5TGlzdCBmcm9tIHdoaWNoIHJlc3VsdHNcclxuICAgKiBjYW4gYmUgcmV0cmlldmVkLlxyXG4gICAqIENvbmZpcm1zIHRoZSBsYXlvdXQgZW5naW5lIHdpbGwgdHJpZ2dlciBmb3IgdGhlIHNlbGVjdG9yIHF1ZXJ5IHByb3ZpZGVkIGFuZCByZXR1cm5zIHRoZVxyXG4gICAqIE1lZGlhUXVlcnlMaXN0IGZvciB0aGUgcXVlcnkgcHJvdmlkZWQuXHJcbiAgICovXHJcbiAgbWF0Y2hNZWRpYShxdWVyeTogc3RyaW5nKTogTWVkaWFRdWVyeUxpc3Qge1xyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLldFQktJVCkge1xyXG4gICAgICBjcmVhdGVFbXB0eVN0eWxlUnVsZShxdWVyeSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5fbWF0Y2hNZWRpYShxdWVyeSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRm9yIFdlYmtpdCBlbmdpbmVzIHRoYXQgb25seSB0cmlnZ2VyIHRoZSBNZWRpYVF1ZXJ5TGlzdExpc3RlbmVyIHdoZW5cclxuICogdGhlcmUgaXMgYXQgbGVhc3Qgb25lIENTUyBzZWxlY3RvciBmb3IgdGhlIHJlc3BlY3RpdmUgbWVkaWEgcXVlcnkuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVFbXB0eVN0eWxlUnVsZShxdWVyeTogc3RyaW5nKSB7XHJcbiAgaWYgKG1lZGlhUXVlcmllc0ZvcldlYmtpdENvbXBhdGliaWxpdHkuaGFzKHF1ZXJ5KSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIGlmICghbWVkaWFRdWVyeVN0eWxlTm9kZSkge1xyXG4gICAgICBtZWRpYVF1ZXJ5U3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgbWVkaWFRdWVyeVN0eWxlTm9kZS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcclxuICAgICAgZG9jdW1lbnQuaGVhZCEuYXBwZW5kQ2hpbGQobWVkaWFRdWVyeVN0eWxlTm9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG1lZGlhUXVlcnlTdHlsZU5vZGUuc2hlZXQpIHtcclxuICAgICAgKG1lZGlhUXVlcnlTdHlsZU5vZGUuc2hlZXQgYXMgQ1NTU3R5bGVTaGVldClcclxuICAgICAgICAgIC5pbnNlcnRSdWxlKGBAbWVkaWEgJHtxdWVyeX0gey5meC1xdWVyeS10ZXN0eyB9fWAsIDApO1xyXG4gICAgICBtZWRpYVF1ZXJpZXNGb3JXZWJraXRDb21wYXRpYmlsaXR5LmFkZChxdWVyeSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5lcnJvcihlKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBOby1vcCBtYXRjaE1lZGlhIHJlcGxhY2VtZW50IGZvciBub24tYnJvd3NlciBwbGF0Zm9ybXMuICovXHJcbmZ1bmN0aW9uIG5vb3BNYXRjaE1lZGlhKHF1ZXJ5OiBzdHJpbmcpOiBNZWRpYVF1ZXJ5TGlzdCB7XHJcbiAgLy8gVXNlIGBhcyBhbnlgIGhlcmUgdG8gYXZvaWQgYWRkaW5nIGFkZGl0aW9uYWwgbmVjZXNzYXJ5IHByb3BlcnRpZXMgZm9yXHJcbiAgLy8gdGhlIG5vb3AgbWF0Y2hlci5cclxuICByZXR1cm4ge1xyXG4gICAgbWF0Y2hlczogcXVlcnkgPT09ICdhbGwnIHx8IHF1ZXJ5ID09PSAnJyxcclxuICAgIG1lZGlhOiBxdWVyeSxcclxuICAgIGFkZExpc3RlbmVyOiAoKSA9PiB7fSxcclxuICAgIHJlbW92ZUxpc3RlbmVyOiAoKSA9PiB7fVxyXG4gIH0gYXMgYW55O1xyXG59XHJcbiJdfQ==