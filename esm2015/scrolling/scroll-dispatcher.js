/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceElement } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone, Optional, Inject } from '@angular/core';
import { fromEvent, of as observableOf, Subject, Observable } from 'rxjs';
import { auditTime, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;
/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
export class ScrollDispatcher {
    constructor(_ngZone, _platform, document) {
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** Subject for notifying that a registered scrollable reference element has been scrolled. */
        this._scrolled = new Subject();
        /** Keeps track of the global `scroll` and `resize` subscriptions. */
        this._globalSubscription = null;
        /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
        this._scrolledCount = 0;
        /**
         * Map of all the scrollable references that are registered with the service and their
         * scroll event subscriptions.
         */
        this.scrollContainers = new Map();
        this._document = document;
    }
    /**
     * Registers a scrollable instance with the service and listens for its scrolled events. When the
     * scrollable is scrolled, the service emits the event to its scrolled observable.
     * @param scrollable Scrollable instance to be registered.
     */
    register(scrollable) {
        if (!this.scrollContainers.has(scrollable)) {
            this.scrollContainers.set(scrollable, scrollable.elementScrolled()
                .subscribe(() => this._scrolled.next(scrollable)));
        }
    }
    /**
     * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
     * @param scrollable Scrollable instance to be deregistered.
     */
    deregister(scrollable) {
        const scrollableReference = this.scrollContainers.get(scrollable);
        if (scrollableReference) {
            scrollableReference.unsubscribe();
            this.scrollContainers.delete(scrollable);
        }
    }
    /**
     * Returns an observable that emits an event whenever any of the registered Scrollable
     * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
     * to override the default "throttle" time.
     *
     * **Note:** in order to avoid hitting change detection for every scroll event,
     * all of the events emitted from this stream will be run outside the Angular zone.
     * If you need to update any data bindings as a result of a scroll event, you have
     * to run the callback using `NgZone.run`.
     */
    scrolled(auditTimeInMs = DEFAULT_SCROLL_TIME) {
        if (!this._platform.isBrowser) {
            return observableOf();
        }
        return new Observable((observer) => {
            if (!this._globalSubscription) {
                this._addGlobalListener();
            }
            // In the case of a 0ms delay, use an observable without auditTime
            // since it does add a perceptible delay in processing overhead.
            const subscription = auditTimeInMs > 0 ?
                this._scrolled.pipe(auditTime(auditTimeInMs)).subscribe(observer) :
                this._scrolled.subscribe(observer);
            this._scrolledCount++;
            return () => {
                subscription.unsubscribe();
                this._scrolledCount--;
                if (!this._scrolledCount) {
                    this._removeGlobalListener();
                }
            };
        });
    }
    ngOnDestroy() {
        this._removeGlobalListener();
        this.scrollContainers.forEach((_, container) => this.deregister(container));
        this._scrolled.complete();
    }
    /**
     * Returns an observable that emits whenever any of the
     * scrollable ancestors of an element are scrolled.
     * @param elementOrElementRef Element whose ancestors to listen for.
     * @param auditTimeInMs Time to throttle the scroll events.
     */
    ancestorScrolled(elementOrElementRef, auditTimeInMs) {
        const ancestors = this.getAncestorScrollContainers(elementOrElementRef);
        return this.scrolled(auditTimeInMs).pipe(filter(target => {
            return !target || ancestors.indexOf(target) > -1;
        }));
    }
    /** Returns all registered Scrollables that contain the provided element. */
    getAncestorScrollContainers(elementOrElementRef) {
        const scrollingContainers = [];
        this.scrollContainers.forEach((_subscription, scrollable) => {
            if (this._scrollableContainsElement(scrollable, elementOrElementRef)) {
                scrollingContainers.push(scrollable);
            }
        });
        return scrollingContainers;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        return this._document.defaultView || window;
    }
    /** Returns true if the element is contained within the provided Scrollable. */
    _scrollableContainsElement(scrollable, elementOrElementRef) {
        let element = coerceElement(elementOrElementRef);
        let scrollableElement = scrollable.getElementRef().nativeElement;
        // Traverse through the element parents until we reach null, checking if any of the elements
        // are the scrollable's element.
        do {
            if (element == scrollableElement) {
                return true;
            }
        } while (element = element.parentElement);
        return false;
    }
    /** Sets up the global scroll listeners. */
    _addGlobalListener() {
        this._globalSubscription = this._ngZone.runOutsideAngular(() => {
            const window = this._getWindow();
            return fromEvent(window.document, 'scroll').subscribe(() => this._scrolled.next());
        });
    }
    /** Cleans up the global scroll listener. */
    _removeGlobalListener() {
        if (this._globalSubscription) {
            this._globalSubscription.unsubscribe();
            this._globalSubscription = null;
        }
    }
}
ScrollDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function ScrollDispatcher_Factory() { return new ScrollDispatcher(i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i2.DOCUMENT, 8)); }, token: ScrollDispatcher, providedIn: "root" });
ScrollDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ScrollDispatcher.ctorParameters = () => [
    { type: NgZone },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Njcm9sbGluZy9zY3JvbGwtZGlzcGF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBYSxVQUFVLEVBQUUsTUFBTSxFQUFhLFFBQVEsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDMUYsT0FBTyxFQUFDLFNBQVMsRUFBRSxFQUFFLElBQUksWUFBWSxFQUFFLE9BQU8sRUFBZ0IsVUFBVSxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQ2hHLE9BQU8sRUFBQyxTQUFTLEVBQUUsTUFBTSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7O0FBRXpDLDhEQUE4RDtBQUM5RCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxFQUFFLENBQUM7QUFFdEM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUkzQixZQUFvQixPQUFlLEVBQ2YsU0FBbUIsRUFDRyxRQUFhO1FBRm5DLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBS3ZDLDhGQUE4RjtRQUN0RixjQUFTLEdBQUcsSUFBSSxPQUFPLEVBQXNCLENBQUM7UUFFdEQscUVBQXFFO1FBQ3JFLHdCQUFtQixHQUF3QixJQUFJLENBQUM7UUFFaEQsaUdBQWlHO1FBQ3pGLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBRTNCOzs7V0FHRztRQUNILHFCQUFnQixHQUFxQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBaEI3RCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBaUJEOzs7O09BSUc7SUFDSCxRQUFRLENBQUMsVUFBeUI7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLGVBQWUsRUFBRTtpQkFDN0QsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN4RDtJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxVQUFVLENBQUMsVUFBeUI7UUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxFLElBQUksbUJBQW1CLEVBQUU7WUFDdkIsbUJBQW1CLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUMxQztJQUNILENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxRQUFRLENBQUMsZ0JBQXdCLG1CQUFtQjtRQUNsRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDN0IsT0FBTyxZQUFZLEVBQVEsQ0FBQztTQUM3QjtRQUVELE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUFzQyxFQUFFLEVBQUU7WUFDL0QsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7YUFDM0I7WUFFRCxrRUFBa0U7WUFDbEUsZ0VBQWdFO1lBQ2hFLE1BQU0sWUFBWSxHQUFHLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV0QixPQUFPLEdBQUcsRUFBRTtnQkFDVixZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFFdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2lCQUM5QjtZQUNILENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsZ0JBQWdCLENBQ1osbUJBQTJDLEVBQzNDLGFBQXNCO1FBQ3hCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBRXhFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZELE9BQU8sQ0FBQyxNQUFNLElBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELDRFQUE0RTtJQUM1RSwyQkFBMkIsQ0FBQyxtQkFBMkM7UUFDckUsTUFBTSxtQkFBbUIsR0FBb0IsRUFBRSxDQUFDO1FBRWhELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUEyQixFQUFFLFVBQXlCLEVBQUUsRUFBRTtZQUN2RixJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtnQkFDcEUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLG1CQUFtQixDQUFDO0lBQzdCLENBQUM7SUFFRCwrRkFBK0Y7SUFDdkYsVUFBVTtRQUNoQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztJQUM5QyxDQUFDO0lBRUQsK0VBQStFO0lBQ3ZFLDBCQUEwQixDQUM5QixVQUF5QixFQUN6QixtQkFBMkM7UUFDN0MsSUFBSSxPQUFPLEdBQXVCLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3JFLElBQUksaUJBQWlCLEdBQUcsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsQ0FBQztRQUVqRSw0RkFBNEY7UUFDNUYsZ0NBQWdDO1FBQ2hDLEdBQUc7WUFDRCxJQUFJLE9BQU8sSUFBSSxpQkFBaUIsRUFBRTtnQkFBRSxPQUFPLElBQUksQ0FBQzthQUFFO1NBQ25ELFFBQVEsT0FBTyxHQUFHLE9BQVEsQ0FBQyxhQUFhLEVBQUU7UUFFM0MsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsMkNBQTJDO0lBQ25DLGtCQUFrQjtRQUN4QixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7WUFDN0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2pDLE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCw0Q0FBNEM7SUFDcEMscUJBQXFCO1FBQzNCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQzs7OztZQWhLRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFiQSxNQUFNO1lBRDlCLFFBQVE7NENBcUJELFFBQVEsWUFBSSxNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtjb2VyY2VFbGVtZW50fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdGFibGUsIE5nWm9uZSwgT25EZXN0cm95LCBPcHRpb25hbCwgSW5qZWN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtmcm9tRXZlbnQsIG9mIGFzIG9ic2VydmFibGVPZiwgU3ViamVjdCwgU3Vic2NyaXB0aW9uLCBPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7YXVkaXRUaW1lLCBmaWx0ZXJ9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHtDZGtTY3JvbGxhYmxlfSBmcm9tICcuL3Njcm9sbGFibGUnO1xyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuLyoqIFRpbWUgaW4gbXMgdG8gdGhyb3R0bGUgdGhlIHNjcm9sbGluZyBldmVudHMgYnkgZGVmYXVsdC4gKi9cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfU0NST0xMX1RJTUUgPSAyMDtcclxuXHJcbi8qKlxyXG4gKiBTZXJ2aWNlIGNvbnRhaW5lZCBhbGwgcmVnaXN0ZXJlZCBTY3JvbGxhYmxlIHJlZmVyZW5jZXMgYW5kIGVtaXRzIGFuIGV2ZW50IHdoZW4gYW55IG9uZSBvZiB0aGVcclxuICogU2Nyb2xsYWJsZSByZWZlcmVuY2VzIGVtaXQgYSBzY3JvbGxlZCBldmVudC5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgU2Nyb2xsRGlzcGF0Y2hlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgLyoqIFVzZWQgdG8gcmVmZXJlbmNlIGNvcnJlY3QgZG9jdW1lbnQvd2luZG93ICovXHJcbiAgcHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSxcclxuICAgICAgICAgICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqIFN1YmplY3QgZm9yIG5vdGlmeWluZyB0aGF0IGEgcmVnaXN0ZXJlZCBzY3JvbGxhYmxlIHJlZmVyZW5jZSBlbGVtZW50IGhhcyBiZWVuIHNjcm9sbGVkLiAqL1xyXG4gIHByaXZhdGUgX3Njcm9sbGVkID0gbmV3IFN1YmplY3Q8Q2RrU2Nyb2xsYWJsZXx2b2lkPigpO1xyXG5cclxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGdsb2JhbCBgc2Nyb2xsYCBhbmQgYHJlc2l6ZWAgc3Vic2NyaXB0aW9ucy4gKi9cclxuICBfZ2xvYmFsU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBhbW91bnQgb2Ygc3Vic2NyaXB0aW9ucyB0byBgc2Nyb2xsZWRgLiBVc2VkIGZvciBjbGVhbmluZyB1cCBhZnRlcndhcmRzLiAqL1xyXG4gIHByaXZhdGUgX3Njcm9sbGVkQ291bnQgPSAwO1xyXG5cclxuICAvKipcclxuICAgKiBNYXAgb2YgYWxsIHRoZSBzY3JvbGxhYmxlIHJlZmVyZW5jZXMgdGhhdCBhcmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBzZXJ2aWNlIGFuZCB0aGVpclxyXG4gICAqIHNjcm9sbCBldmVudCBzdWJzY3JpcHRpb25zLlxyXG4gICAqL1xyXG4gIHNjcm9sbENvbnRhaW5lcnM6IE1hcDxDZGtTY3JvbGxhYmxlLCBTdWJzY3JpcHRpb24+ID0gbmV3IE1hcCgpO1xyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlcnMgYSBzY3JvbGxhYmxlIGluc3RhbmNlIHdpdGggdGhlIHNlcnZpY2UgYW5kIGxpc3RlbnMgZm9yIGl0cyBzY3JvbGxlZCBldmVudHMuIFdoZW4gdGhlXHJcbiAgICogc2Nyb2xsYWJsZSBpcyBzY3JvbGxlZCwgdGhlIHNlcnZpY2UgZW1pdHMgdGhlIGV2ZW50IHRvIGl0cyBzY3JvbGxlZCBvYnNlcnZhYmxlLlxyXG4gICAqIEBwYXJhbSBzY3JvbGxhYmxlIFNjcm9sbGFibGUgaW5zdGFuY2UgdG8gYmUgcmVnaXN0ZXJlZC5cclxuICAgKi9cclxuICByZWdpc3RlcihzY3JvbGxhYmxlOiBDZGtTY3JvbGxhYmxlKTogdm9pZCB7XHJcbiAgICBpZiAoIXRoaXMuc2Nyb2xsQ29udGFpbmVycy5oYXMoc2Nyb2xsYWJsZSkpIHtcclxuICAgICAgdGhpcy5zY3JvbGxDb250YWluZXJzLnNldChzY3JvbGxhYmxlLCBzY3JvbGxhYmxlLmVsZW1lbnRTY3JvbGxlZCgpXHJcbiAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3Njcm9sbGVkLm5leHQoc2Nyb2xsYWJsZSkpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlcmVnaXN0ZXJzIGEgU2Nyb2xsYWJsZSByZWZlcmVuY2UgYW5kIHVuc3Vic2NyaWJlcyBmcm9tIGl0cyBzY3JvbGwgZXZlbnQgb2JzZXJ2YWJsZS5cclxuICAgKiBAcGFyYW0gc2Nyb2xsYWJsZSBTY3JvbGxhYmxlIGluc3RhbmNlIHRvIGJlIGRlcmVnaXN0ZXJlZC5cclxuICAgKi9cclxuICBkZXJlZ2lzdGVyKHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUpOiB2b2lkIHtcclxuICAgIGNvbnN0IHNjcm9sbGFibGVSZWZlcmVuY2UgPSB0aGlzLnNjcm9sbENvbnRhaW5lcnMuZ2V0KHNjcm9sbGFibGUpO1xyXG5cclxuICAgIGlmIChzY3JvbGxhYmxlUmVmZXJlbmNlKSB7XHJcbiAgICAgIHNjcm9sbGFibGVSZWZlcmVuY2UudW5zdWJzY3JpYmUoKTtcclxuICAgICAgdGhpcy5zY3JvbGxDb250YWluZXJzLmRlbGV0ZShzY3JvbGxhYmxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIGFuIGV2ZW50IHdoZW5ldmVyIGFueSBvZiB0aGUgcmVnaXN0ZXJlZCBTY3JvbGxhYmxlXHJcbiAgICogcmVmZXJlbmNlcyAob3Igd2luZG93LCBkb2N1bWVudCwgb3IgYm9keSkgZmlyZSBhIHNjcm9sbGVkIGV2ZW50LiBDYW4gcHJvdmlkZSBhIHRpbWUgaW4gbXNcclxuICAgKiB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBcInRocm90dGxlXCIgdGltZS5cclxuICAgKlxyXG4gICAqICoqTm90ZToqKiBpbiBvcmRlciB0byBhdm9pZCBoaXR0aW5nIGNoYW5nZSBkZXRlY3Rpb24gZm9yIGV2ZXJ5IHNjcm9sbCBldmVudCxcclxuICAgKiBhbGwgb2YgdGhlIGV2ZW50cyBlbWl0dGVkIGZyb20gdGhpcyBzdHJlYW0gd2lsbCBiZSBydW4gb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLlxyXG4gICAqIElmIHlvdSBuZWVkIHRvIHVwZGF0ZSBhbnkgZGF0YSBiaW5kaW5ncyBhcyBhIHJlc3VsdCBvZiBhIHNjcm9sbCBldmVudCwgeW91IGhhdmVcclxuICAgKiB0byBydW4gdGhlIGNhbGxiYWNrIHVzaW5nIGBOZ1pvbmUucnVuYC5cclxuICAgKi9cclxuICBzY3JvbGxlZChhdWRpdFRpbWVJbk1zOiBudW1iZXIgPSBERUZBVUxUX1NDUk9MTF9USU1FKTogT2JzZXJ2YWJsZTxDZGtTY3JvbGxhYmxlfHZvaWQ+IHtcclxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XHJcbiAgICAgIHJldHVybiBvYnNlcnZhYmxlT2Y8dm9pZD4oKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxDZGtTY3JvbGxhYmxlfHZvaWQ+KSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5fYWRkR2xvYmFsTGlzdGVuZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSAwbXMgZGVsYXksIHVzZSBhbiBvYnNlcnZhYmxlIHdpdGhvdXQgYXVkaXRUaW1lXHJcbiAgICAgIC8vIHNpbmNlIGl0IGRvZXMgYWRkIGEgcGVyY2VwdGlibGUgZGVsYXkgaW4gcHJvY2Vzc2luZyBvdmVyaGVhZC5cclxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gYXVkaXRUaW1lSW5NcyA+IDAgP1xyXG4gICAgICAgIHRoaXMuX3Njcm9sbGVkLnBpcGUoYXVkaXRUaW1lKGF1ZGl0VGltZUluTXMpKS5zdWJzY3JpYmUob2JzZXJ2ZXIpIDpcclxuICAgICAgICB0aGlzLl9zY3JvbGxlZC5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xyXG5cclxuICAgICAgdGhpcy5fc2Nyb2xsZWRDb3VudCsrO1xyXG5cclxuICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICB0aGlzLl9zY3JvbGxlZENvdW50LS07XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5fc2Nyb2xsZWRDb3VudCkge1xyXG4gICAgICAgICAgdGhpcy5fcmVtb3ZlR2xvYmFsTGlzdGVuZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fcmVtb3ZlR2xvYmFsTGlzdGVuZXIoKTtcclxuICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5mb3JFYWNoKChfLCBjb250YWluZXIpID0+IHRoaXMuZGVyZWdpc3Rlcihjb250YWluZXIpKTtcclxuICAgIHRoaXMuX3Njcm9sbGVkLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuZXZlciBhbnkgb2YgdGhlXHJcbiAgICogc2Nyb2xsYWJsZSBhbmNlc3RvcnMgb2YgYW4gZWxlbWVudCBhcmUgc2Nyb2xsZWQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnRPckVsZW1lbnRSZWYgRWxlbWVudCB3aG9zZSBhbmNlc3RvcnMgdG8gbGlzdGVuIGZvci5cclxuICAgKiBAcGFyYW0gYXVkaXRUaW1lSW5NcyBUaW1lIHRvIHRocm90dGxlIHRoZSBzY3JvbGwgZXZlbnRzLlxyXG4gICAqL1xyXG4gIGFuY2VzdG9yU2Nyb2xsZWQoXHJcbiAgICAgIGVsZW1lbnRPckVsZW1lbnRSZWY6IEVsZW1lbnRSZWZ8SFRNTEVsZW1lbnQsXHJcbiAgICAgIGF1ZGl0VGltZUluTXM/OiBudW1iZXIpOiBPYnNlcnZhYmxlPENka1Njcm9sbGFibGV8dm9pZD4ge1xyXG4gICAgY29uc3QgYW5jZXN0b3JzID0gdGhpcy5nZXRBbmNlc3RvclNjcm9sbENvbnRhaW5lcnMoZWxlbWVudE9yRWxlbWVudFJlZik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuc2Nyb2xsZWQoYXVkaXRUaW1lSW5NcykucGlwZShmaWx0ZXIodGFyZ2V0ID0+IHtcclxuICAgICAgcmV0dXJuICF0YXJnZXQgfHwgYW5jZXN0b3JzLmluZGV4T2YodGFyZ2V0KSA+IC0xO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJldHVybnMgYWxsIHJlZ2lzdGVyZWQgU2Nyb2xsYWJsZXMgdGhhdCBjb250YWluIHRoZSBwcm92aWRlZCBlbGVtZW50LiAqL1xyXG4gIGdldEFuY2VzdG9yU2Nyb2xsQ29udGFpbmVycyhlbGVtZW50T3JFbGVtZW50UmVmOiBFbGVtZW50UmVmfEhUTUxFbGVtZW50KTogQ2RrU2Nyb2xsYWJsZVtdIHtcclxuICAgIGNvbnN0IHNjcm9sbGluZ0NvbnRhaW5lcnM6IENka1Njcm9sbGFibGVbXSA9IFtdO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsQ29udGFpbmVycy5mb3JFYWNoKChfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24sIHNjcm9sbGFibGU6IENka1Njcm9sbGFibGUpID0+IHtcclxuICAgICAgaWYgKHRoaXMuX3Njcm9sbGFibGVDb250YWluc0VsZW1lbnQoc2Nyb2xsYWJsZSwgZWxlbWVudE9yRWxlbWVudFJlZikpIHtcclxuICAgICAgICBzY3JvbGxpbmdDb250YWluZXJzLnB1c2goc2Nyb2xsYWJsZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiBzY3JvbGxpbmdDb250YWluZXJzO1xyXG4gIH1cclxuXHJcbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cclxuICBwcml2YXRlIF9nZXRXaW5kb3coKTogV2luZG93IHtcclxuICAgIHJldHVybiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XHJcbiAgfVxyXG5cclxuICAvKiogUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gdGhlIHByb3ZpZGVkIFNjcm9sbGFibGUuICovXHJcbiAgcHJpdmF0ZSBfc2Nyb2xsYWJsZUNvbnRhaW5zRWxlbWVudChcclxuICAgICAgc2Nyb2xsYWJsZTogQ2RrU2Nyb2xsYWJsZSxcclxuICAgICAgZWxlbWVudE9yRWxlbWVudFJlZjogRWxlbWVudFJlZnxIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgbGV0IGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudE9yRWxlbWVudFJlZik7XHJcbiAgICBsZXQgc2Nyb2xsYWJsZUVsZW1lbnQgPSBzY3JvbGxhYmxlLmdldEVsZW1lbnRSZWYoKS5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgIC8vIFRyYXZlcnNlIHRocm91Z2ggdGhlIGVsZW1lbnQgcGFyZW50cyB1bnRpbCB3ZSByZWFjaCBudWxsLCBjaGVja2luZyBpZiBhbnkgb2YgdGhlIGVsZW1lbnRzXHJcbiAgICAvLyBhcmUgdGhlIHNjcm9sbGFibGUncyBlbGVtZW50LlxyXG4gICAgZG8ge1xyXG4gICAgICBpZiAoZWxlbWVudCA9PSBzY3JvbGxhYmxlRWxlbWVudCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG4gICAgfSB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQhLnBhcmVudEVsZW1lbnQpO1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKiBTZXRzIHVwIHRoZSBnbG9iYWwgc2Nyb2xsIGxpc3RlbmVycy4gKi9cclxuICBwcml2YXRlIF9hZGRHbG9iYWxMaXN0ZW5lcigpIHtcclxuICAgIHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbiA9IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHdpbmRvdyA9IHRoaXMuX2dldFdpbmRvdygpO1xyXG4gICAgICByZXR1cm4gZnJvbUV2ZW50KHdpbmRvdy5kb2N1bWVudCwgJ3Njcm9sbCcpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9zY3JvbGxlZC5uZXh0KCkpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogQ2xlYW5zIHVwIHRoZSBnbG9iYWwgc2Nyb2xsIGxpc3RlbmVyLiAqL1xyXG4gIHByaXZhdGUgX3JlbW92ZUdsb2JhbExpc3RlbmVyKCkge1xyXG4gICAgaWYgKHRoaXMuX2dsb2JhbFN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLl9nbG9iYWxTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgdGhpcy5fZ2xvYmFsU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19