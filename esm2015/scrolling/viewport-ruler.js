/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;
/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
export class ViewportRuler {
    constructor(_platform, ngZone, document) {
        this._platform = _platform;
        /** Stream of viewport change events. */
        this._change = new Subject();
        /** Event listener that will be used to handle the viewport change events. */
        this._changeListener = (event) => {
            this._change.next(event);
        };
        this._document = document;
        ngZone.runOutsideAngular(() => {
            if (_platform.isBrowser) {
                const window = this._getWindow();
                // Note that bind the events ourselves, rather than going through something like RxJS's
                // `fromEvent` so that we can ensure that they're bound outside of the NgZone.
                window.addEventListener('resize', this._changeListener);
                window.addEventListener('orientationchange', this._changeListener);
            }
            // We don't need to keep track of the subscription,
            // because we complete the `change` stream on destroy.
            this.change().subscribe(() => this._updateViewportSize());
        });
    }
    ngOnDestroy() {
        if (this._platform.isBrowser) {
            const window = this._getWindow();
            window.removeEventListener('resize', this._changeListener);
            window.removeEventListener('orientationchange', this._changeListener);
        }
        this._change.complete();
    }
    /** Returns the viewport's width and height. */
    getViewportSize() {
        if (!this._viewportSize) {
            this._updateViewportSize();
        }
        const output = { width: this._viewportSize.width, height: this._viewportSize.height };
        // If we're not on a browser, don't cache the size since it'll be mocked out anyway.
        if (!this._platform.isBrowser) {
            this._viewportSize = null;
        }
        return output;
    }
    /** Gets a ClientRect for the viewport's bounds. */
    getViewportRect() {
        // Use the document element's bounding rect rather than the window scroll properties
        // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
        // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
        // conceptual viewports. Under most circumstances these viewports are equivalent, but they
        // can disagree when the page is pinch-zoomed (on devices that support touch).
        // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
        // We use the documentElement instead of the body because, by default (without a css reset)
        // browsers typically give the document body an 8px margin, which is not included in
        // getBoundingClientRect().
        const scrollPosition = this.getViewportScrollPosition();
        const { width, height } = this.getViewportSize();
        return {
            top: scrollPosition.top,
            left: scrollPosition.left,
            bottom: scrollPosition.top + height,
            right: scrollPosition.left + width,
            height,
            width,
        };
    }
    /** Gets the (top, left) scroll position of the viewport. */
    getViewportScrollPosition() {
        // While we can get a reference to the fake document
        // during SSR, it doesn't have getBoundingClientRect.
        if (!this._platform.isBrowser) {
            return { top: 0, left: 0 };
        }
        // The top-left-corner of the viewport is determined by the scroll position of the document
        // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
        // whether `document.body` or `document.documentElement` is the scrolled element, so reading
        // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
        // `document.documentElement` works consistently, where the `top` and `left` values will
        // equal negative the scroll position.
        const document = this._document;
        const window = this._getWindow();
        const documentElement = document.documentElement;
        const documentRect = documentElement.getBoundingClientRect();
        const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
            documentElement.scrollTop || 0;
        const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
            documentElement.scrollLeft || 0;
        return { top, left };
    }
    /**
     * Returns a stream that emits whenever the size of the viewport changes.
     * @param throttleTime Time in milliseconds to throttle the stream.
     */
    change(throttleTime = DEFAULT_RESIZE_TIME) {
        return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Updates the cached viewport size. */
    _updateViewportSize() {
        const window = this._getWindow();
        this._viewportSize = this._platform.isBrowser ?
            { width: window.innerWidth, height: window.innerHeight } :
            { width: 0, height: 0 };
    }
}
ViewportRuler.ɵprov = i0.ɵɵdefineInjectable({ factory: function ViewportRuler_Factory() { return new ViewportRuler(i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.DOCUMENT, 8)); }, token: ViewportRuler, providedIn: "root" });
ViewportRuler.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ViewportRuler.ctorParameters = () => [
    { type: Platform },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnQtcnVsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy92aWV3cG9ydC1ydWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQWEsUUFBUSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RSxPQUFPLEVBQWEsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7Ozs7QUFFekMsMkRBQTJEO0FBQzNELE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQVF0Qzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQWV4QixZQUFvQixTQUFtQixFQUMzQixNQUFjLEVBQ2dCLFFBQWE7UUFGbkMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQVh2Qyx3Q0FBd0M7UUFDaEMsWUFBTyxHQUFHLElBQUksT0FBTyxFQUFTLENBQUM7UUFFdkMsNkVBQTZFO1FBQ3JFLG9CQUFlLEdBQUcsQ0FBQyxLQUFZLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUE7UUFRQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUUxQixNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFO1lBQzVCLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUVqQyx1RkFBdUY7Z0JBQ3ZGLDhFQUE4RTtnQkFDOUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDcEU7WUFFRCxtREFBbUQ7WUFDbkQsc0RBQXNEO1lBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtZQUM1QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDakMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUN2RTtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELCtDQUErQztJQUMvQyxlQUFlO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdkIsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDNUI7UUFFRCxNQUFNLE1BQU0sR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUMsQ0FBQztRQUVwRixvRkFBb0Y7UUFDcEYsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSyxDQUFDO1NBQzVCO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELG1EQUFtRDtJQUNuRCxlQUFlO1FBQ2Isb0ZBQW9GO1FBQ3BGLG1GQUFtRjtRQUNuRiwyRkFBMkY7UUFDM0YsMEZBQTBGO1FBQzFGLDhFQUE4RTtRQUM5RSxzRUFBc0U7UUFDdEUsMkZBQTJGO1FBQzNGLG9GQUFvRjtRQUNwRiwyQkFBMkI7UUFDM0IsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDeEQsTUFBTSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFFL0MsT0FBTztZQUNMLEdBQUcsRUFBRSxjQUFjLENBQUMsR0FBRztZQUN2QixJQUFJLEVBQUUsY0FBYyxDQUFDLElBQUk7WUFDekIsTUFBTSxFQUFFLGNBQWMsQ0FBQyxHQUFHLEdBQUcsTUFBTTtZQUNuQyxLQUFLLEVBQUUsY0FBYyxDQUFDLElBQUksR0FBRyxLQUFLO1lBQ2xDLE1BQU07WUFDTixLQUFLO1NBQ04sQ0FBQztJQUNKLENBQUM7SUFFRCw0REFBNEQ7SUFDNUQseUJBQXlCO1FBQ3ZCLG9EQUFvRDtRQUNwRCxxREFBcUQ7UUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzdCLE9BQU8sRUFBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQztTQUMxQjtRQUVELDJGQUEyRjtRQUMzRiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLG9GQUFvRjtRQUNwRix3RkFBd0Y7UUFDeEYsc0NBQXNDO1FBQ3RDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxlQUFnQixDQUFDO1FBQ2xELE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdELE1BQU0sR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsT0FBTztZQUM3RCxlQUFlLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztRQUU1QyxNQUFNLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLE9BQU87WUFDL0QsZUFBZSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFFOUMsT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztJQUNyQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLGVBQXVCLG1CQUFtQjtRQUMvQyxPQUFPLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RGLENBQUM7SUFFRCwrRkFBK0Y7SUFDdkYsVUFBVTtRQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztJQUM5QyxDQUFDO0lBRUQsd0NBQXdDO0lBQ2hDLG1CQUFtQjtRQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLEVBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUMsQ0FBQyxDQUFDO1lBQ3hELEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUM7SUFDNUIsQ0FBQzs7OztZQXRJRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFuQnhCLFFBQVE7WUFDSSxNQUFNOzRDQW9DWCxRQUFRLFlBQUksTUFBTSxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lLCBPbkRlc3Ryb3ksIE9wdGlvbmFsLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge2F1ZGl0VGltZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuLyoqIFRpbWUgaW4gbXMgdG8gdGhyb3R0bGUgdGhlIHJlc2l6ZSBldmVudHMgYnkgZGVmYXVsdC4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfUkVTSVpFX1RJTUUgPSAyMDtcclxuXHJcbi8qKiBPYmplY3QgdGhhdCBob2xkcyB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSB2aWV3cG9ydCBpbiBlYWNoIGRpcmVjdGlvbi4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBWaWV3cG9ydFNjcm9sbFBvc2l0aW9uIHtcclxuICB0b3A6IG51bWJlcjtcclxuICBsZWZ0OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaW1wbGUgdXRpbGl0eSBmb3IgZ2V0dGluZyB0aGUgYm91bmRzIG9mIHRoZSBicm93c2VyIHZpZXdwb3J0LlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIFZpZXdwb3J0UnVsZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBDYWNoZWQgdmlld3BvcnQgZGltZW5zaW9ucy4gKi9cclxuICBwcml2YXRlIF92aWV3cG9ydFNpemU6IHt3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlcn07XHJcblxyXG4gIC8qKiBTdHJlYW0gb2Ygdmlld3BvcnQgY2hhbmdlIGV2ZW50cy4gKi9cclxuICBwcml2YXRlIF9jaGFuZ2UgPSBuZXcgU3ViamVjdDxFdmVudD4oKTtcclxuXHJcbiAgLyoqIEV2ZW50IGxpc3RlbmVyIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGhhbmRsZSB0aGUgdmlld3BvcnQgY2hhbmdlIGV2ZW50cy4gKi9cclxuICBwcml2YXRlIF9jaGFuZ2VMaXN0ZW5lciA9IChldmVudDogRXZlbnQpID0+IHtcclxuICAgIHRoaXMuX2NoYW5nZS5uZXh0KGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKiBVc2VkIHRvIHJlZmVyZW5jZSBjb3JyZWN0IGRvY3VtZW50L3dpbmRvdyAqL1xyXG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXHJcbiAgICAgICAgICAgICAgbmdab25lOiBOZ1pvbmUsXHJcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xyXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBkb2N1bWVudDtcclxuXHJcbiAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICBpZiAoX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xyXG5cclxuICAgICAgICAvLyBOb3RlIHRoYXQgYmluZCB0aGUgZXZlbnRzIG91cnNlbHZlcywgcmF0aGVyIHRoYW4gZ29pbmcgdGhyb3VnaCBzb21ldGhpbmcgbGlrZSBSeEpTJ3NcclxuICAgICAgICAvLyBgZnJvbUV2ZW50YCBzbyB0aGF0IHdlIGNhbiBlbnN1cmUgdGhhdCB0aGV5J3JlIGJvdW5kIG91dHNpZGUgb2YgdGhlIE5nWm9uZS5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fY2hhbmdlTGlzdGVuZXIpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIHRoaXMuX2NoYW5nZUxpc3RlbmVyKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBzdWJzY3JpcHRpb24sXHJcbiAgICAgIC8vIGJlY2F1c2Ugd2UgY29tcGxldGUgdGhlIGBjaGFuZ2VgIHN0cmVhbSBvbiBkZXN0cm95LlxyXG4gICAgICB0aGlzLmNoYW5nZSgpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl91cGRhdGVWaWV3cG9ydFNpemUoKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX2NoYW5nZUxpc3RlbmVyKTtcclxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgdGhpcy5fY2hhbmdlTGlzdGVuZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NoYW5nZS5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJldHVybnMgdGhlIHZpZXdwb3J0J3Mgd2lkdGggYW5kIGhlaWdodC4gKi9cclxuICBnZXRWaWV3cG9ydFNpemUoKTogUmVhZG9ubHk8e3dpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyfT4ge1xyXG4gICAgaWYgKCF0aGlzLl92aWV3cG9ydFNpemUpIHtcclxuICAgICAgdGhpcy5fdXBkYXRlVmlld3BvcnRTaXplKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0ID0ge3dpZHRoOiB0aGlzLl92aWV3cG9ydFNpemUud2lkdGgsIGhlaWdodDogdGhpcy5fdmlld3BvcnRTaXplLmhlaWdodH07XHJcblxyXG4gICAgLy8gSWYgd2UncmUgbm90IG9uIGEgYnJvd3NlciwgZG9uJ3QgY2FjaGUgdGhlIHNpemUgc2luY2UgaXQnbGwgYmUgbW9ja2VkIG91dCBhbnl3YXkuXHJcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICB0aGlzLl92aWV3cG9ydFNpemUgPSBudWxsITtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0O1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgYSBDbGllbnRSZWN0IGZvciB0aGUgdmlld3BvcnQncyBib3VuZHMuICovXHJcbiAgZ2V0Vmlld3BvcnRSZWN0KCk6IENsaWVudFJlY3Qge1xyXG4gICAgLy8gVXNlIHRoZSBkb2N1bWVudCBlbGVtZW50J3MgYm91bmRpbmcgcmVjdCByYXRoZXIgdGhhbiB0aGUgd2luZG93IHNjcm9sbCBwcm9wZXJ0aWVzXHJcbiAgICAvLyAoZS5nLiBwYWdlWU9mZnNldCwgc2Nyb2xsWSkgZHVlIHRvIGluIGlzc3VlIGluIENocm9tZSBhbmQgSUUgd2hlcmUgd2luZG93IHNjcm9sbFxyXG4gICAgLy8gcHJvcGVydGllcyBhbmQgY2xpZW50IGNvb3JkaW5hdGVzIChib3VuZGluZ0NsaWVudFJlY3QsIGNsaWVudFgvWSwgZXRjLikgYXJlIGluIGRpZmZlcmVudFxyXG4gICAgLy8gY29uY2VwdHVhbCB2aWV3cG9ydHMuIFVuZGVyIG1vc3QgY2lyY3Vtc3RhbmNlcyB0aGVzZSB2aWV3cG9ydHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCB0aGV5XHJcbiAgICAvLyBjYW4gZGlzYWdyZWUgd2hlbiB0aGUgcGFnZSBpcyBwaW5jaC16b29tZWQgKG9uIGRldmljZXMgdGhhdCBzdXBwb3J0IHRvdWNoKS5cclxuICAgIC8vIFNlZSBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD00ODkyMDYjYzRcclxuICAgIC8vIFdlIHVzZSB0aGUgZG9jdW1lbnRFbGVtZW50IGluc3RlYWQgb2YgdGhlIGJvZHkgYmVjYXVzZSwgYnkgZGVmYXVsdCAod2l0aG91dCBhIGNzcyByZXNldClcclxuICAgIC8vIGJyb3dzZXJzIHR5cGljYWxseSBnaXZlIHRoZSBkb2N1bWVudCBib2R5IGFuIDhweCBtYXJnaW4sIHdoaWNoIGlzIG5vdCBpbmNsdWRlZCBpblxyXG4gICAgLy8gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuXHJcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xyXG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHR9ID0gdGhpcy5nZXRWaWV3cG9ydFNpemUoKTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0b3A6IHNjcm9sbFBvc2l0aW9uLnRvcCxcclxuICAgICAgbGVmdDogc2Nyb2xsUG9zaXRpb24ubGVmdCxcclxuICAgICAgYm90dG9tOiBzY3JvbGxQb3NpdGlvbi50b3AgKyBoZWlnaHQsXHJcbiAgICAgIHJpZ2h0OiBzY3JvbGxQb3NpdGlvbi5sZWZ0ICsgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgd2lkdGgsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlICh0b3AsIGxlZnQpIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQuICovXHJcbiAgZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpOiBWaWV3cG9ydFNjcm9sbFBvc2l0aW9uIHtcclxuICAgIC8vIFdoaWxlIHdlIGNhbiBnZXQgYSByZWZlcmVuY2UgdG8gdGhlIGZha2UgZG9jdW1lbnRcclxuICAgIC8vIGR1cmluZyBTU1IsIGl0IGRvZXNuJ3QgaGF2ZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QuXHJcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICByZXR1cm4ge3RvcDogMCwgbGVmdDogMH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIHRvcC1sZWZ0LWNvcm5lciBvZiB0aGUgdmlld3BvcnQgaXMgZGV0ZXJtaW5lZCBieSB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSBkb2N1bWVudFxyXG4gICAgLy8gYm9keSwgbm9ybWFsbHkganVzdCAoc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wKS4gSG93ZXZlciwgQ2hyb21lIGFuZCBGaXJlZm94IGRpc2FncmVlIGFib3V0XHJcbiAgICAvLyB3aGV0aGVyIGBkb2N1bWVudC5ib2R5YCBvciBgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50YCBpcyB0aGUgc2Nyb2xsZWQgZWxlbWVudCwgc28gcmVhZGluZ1xyXG4gICAgLy8gYHNjcm9sbFRvcGAgYW5kIGBzY3JvbGxMZWZ0YCBpcyBpbmNvbnNpc3RlbnQuIEhvd2V2ZXIsIHVzaW5nIHRoZSBib3VuZGluZyByZWN0IG9mXHJcbiAgICAvLyBgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50YCB3b3JrcyBjb25zaXN0ZW50bHksIHdoZXJlIHRoZSBgdG9wYCBhbmQgYGxlZnRgIHZhbHVlcyB3aWxsXHJcbiAgICAvLyBlcXVhbCBuZWdhdGl2ZSB0aGUgc2Nyb2xsIHBvc2l0aW9uLlxyXG4gICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9kb2N1bWVudDtcclxuICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xyXG4gICAgY29uc3QgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ITtcclxuICAgIGNvbnN0IGRvY3VtZW50UmVjdCA9IGRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICBjb25zdCB0b3AgPSAtZG9jdW1lbnRSZWN0LnRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCB3aW5kb3cuc2Nyb2xsWSB8fFxyXG4gICAgICAgICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgMDtcclxuXHJcbiAgICBjb25zdCBsZWZ0ID0gLWRvY3VtZW50UmVjdC5sZWZ0IHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCB8fCB3aW5kb3cuc2Nyb2xsWCB8fFxyXG4gICAgICAgICAgICAgICAgICBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCAwO1xyXG5cclxuICAgIHJldHVybiB7dG9wLCBsZWZ0fTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBzdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgc2l6ZSBvZiB0aGUgdmlld3BvcnQgY2hhbmdlcy5cclxuICAgKiBAcGFyYW0gdGhyb3R0bGVUaW1lIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIHRoZSBzdHJlYW0uXHJcbiAgICovXHJcbiAgY2hhbmdlKHRocm90dGxlVGltZTogbnVtYmVyID0gREVGQVVMVF9SRVNJWkVfVElNRSk6IE9ic2VydmFibGU8RXZlbnQ+IHtcclxuICAgIHJldHVybiB0aHJvdHRsZVRpbWUgPiAwID8gdGhpcy5fY2hhbmdlLnBpcGUoYXVkaXRUaW1lKHRocm90dGxlVGltZSkpIDogdGhpcy5fY2hhbmdlO1xyXG4gIH1cclxuXHJcbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cclxuICBwcml2YXRlIF9nZXRXaW5kb3coKTogV2luZG93IHtcclxuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlcyB0aGUgY2FjaGVkIHZpZXdwb3J0IHNpemUuICovXHJcbiAgcHJpdmF0ZSBfdXBkYXRlVmlld3BvcnRTaXplKCkge1xyXG4gICAgY29uc3Qgd2luZG93ID0gdGhpcy5fZ2V0V2luZG93KCk7XHJcbiAgICB0aGlzLl92aWV3cG9ydFNpemUgPSB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgP1xyXG4gICAgICAgIHt3aWR0aDogd2luZG93LmlubmVyV2lkdGgsIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0fSA6XHJcbiAgICAgICAge3dpZHRoOiAwLCBoZWlnaHQ6IDB9O1xyXG4gIH1cclxufVxyXG4iXX0=