/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/platform";
/**
 * Whether we're in a testing environment.
 * TODO(crisbeto): remove this once we have an overlay testing module.
 */
const isTestEnvironment = typeof window !== 'undefined' && !!window &&
    !!(window.__karma__ || window.jasmine);
/** Container inside which all overlays will render. */
export class OverlayContainer {
    constructor(document, _platform) {
        this._platform = _platform;
        this._document = document;
    }
    ngOnDestroy() {
        const container = this._containerElement;
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
    /**
     * This method returns the overlay container element. It will lazily
     * create the element the first time  it is called to facilitate using
     * the container in non-browser environments.
     * @returns the container element
     */
    getContainerElement() {
        if (!this._containerElement) {
            this._createContainer();
        }
        return this._containerElement;
    }
    /**
     * Create the overlay container element, which is simply a div
     * with the 'cdk-overlay-container' class on the document body.
     */
    _createContainer() {
        const containerClass = 'cdk-overlay-container';
        if (this._platform.isBrowser || isTestEnvironment) {
            const oppositePlatformContainers = this._document.querySelectorAll(`.${containerClass}[platform="server"], ` +
                `.${containerClass}[platform="test"]`);
            // Remove any old containers from the opposite platform.
            // This can happen when transitioning from the server to the client.
            for (let i = 0; i < oppositePlatformContainers.length; i++) {
                oppositePlatformContainers[i].parentNode.removeChild(oppositePlatformContainers[i]);
            }
        }
        const container = this._document.createElement('div');
        container.classList.add(containerClass);
        // A long time ago we kept adding new overlay containers whenever a new app was instantiated,
        // but at some point we added logic which clears the duplicate ones in order to avoid leaks.
        // The new logic was a little too aggressive since it was breaking some legitimate use cases.
        // To mitigate the problem we made it so that only containers from a different platform are
        // cleared, but the side-effect was that people started depending on the overly-aggressive
        // logic to clean up their tests for them. Until we can introduce an overlay-specific testing
        // module which does the cleanup, we try to detect that we're in a test environment and we
        // always clear the container. See #17006.
        // TODO(crisbeto): remove the test environment check once we have an overlay testing module.
        if (isTestEnvironment) {
            container.setAttribute('platform', 'test');
        }
        else if (!this._platform.isBrowser) {
            container.setAttribute('platform', 'server');
        }
        this._document.body.appendChild(container);
        this._containerElement = container;
    }
}
OverlayContainer.ɵprov = i0.ɵɵdefineInjectable({ factory: function OverlayContainer_Factory() { return new OverlayContainer(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i2.Platform)); }, token: OverlayContainer, providedIn: "root" });
OverlayContainer.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
OverlayContainer.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1jb250YWluZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1jb250YWluZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7OztBQUUvQzs7O0dBR0c7QUFDSCxNQUFNLGlCQUFpQixHQUFZLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxDQUFDLENBQUMsTUFBTTtJQUMxRSxDQUFDLENBQUMsQ0FBRSxNQUFjLENBQUMsU0FBUyxJQUFLLE1BQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUUzRCx1REFBdUQ7QUFFdkQsTUFBTSxPQUFPLGdCQUFnQjtJQUkzQixZQUE4QixRQUFhLEVBQVksU0FBbUI7UUFBbkIsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUN4RSxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM1QixDQUFDO0lBRUQsV0FBVztRQUNULE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUV6QyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO1lBQ3JDLFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzdDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsbUJBQW1CO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDM0IsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDekI7UUFFRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ08sZ0JBQWdCO1FBQ3hCLE1BQU0sY0FBYyxHQUFHLHVCQUF1QixDQUFDO1FBRS9DLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksaUJBQWlCLEVBQUU7WUFDakQsTUFBTSwwQkFBMEIsR0FDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLGNBQWMsdUJBQXVCO2dCQUN6QyxJQUFJLGNBQWMsbUJBQW1CLENBQUMsQ0FBQztZQUUzRSx3REFBd0Q7WUFDeEQsb0VBQW9FO1lBQ3BFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzFELDBCQUEwQixDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0RjtTQUNGO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEQsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFeEMsNkZBQTZGO1FBQzdGLDRGQUE0RjtRQUM1Riw2RkFBNkY7UUFDN0YsMkZBQTJGO1FBQzNGLDBGQUEwRjtRQUMxRiw2RkFBNkY7UUFDN0YsMEZBQTBGO1FBQzFGLDBDQUEwQztRQUMxQyw0RkFBNEY7UUFDNUYsSUFBSSxpQkFBaUIsRUFBRTtZQUNyQixTQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUM1QzthQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtZQUNwQyxTQUFTLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUM5QztRQUVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO0lBQ3JDLENBQUM7Ozs7WUF0RUYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQUtqQixNQUFNLFNBQUMsUUFBUTtZQWZ0QixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuXHJcbi8qKlxyXG4gKiBXaGV0aGVyIHdlJ3JlIGluIGEgdGVzdGluZyBlbnZpcm9ubWVudC5cclxuICogVE9ETyhjcmlzYmV0byk6IHJlbW92ZSB0aGlzIG9uY2Ugd2UgaGF2ZSBhbiBvdmVybGF5IHRlc3RpbmcgbW9kdWxlLlxyXG4gKi9cclxuY29uc3QgaXNUZXN0RW52aXJvbm1lbnQ6IGJvb2xlYW4gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAhIXdpbmRvdyAmJlxyXG4gICEhKCh3aW5kb3cgYXMgYW55KS5fX2thcm1hX18gfHwgKHdpbmRvdyBhcyBhbnkpLmphc21pbmUpO1xyXG5cclxuLyoqIENvbnRhaW5lciBpbnNpZGUgd2hpY2ggYWxsIG92ZXJsYXlzIHdpbGwgcmVuZGVyLiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIE92ZXJsYXlDb250YWluZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIHByb3RlY3RlZCBfY29udGFpbmVyRWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcbiAgcHJvdGVjdGVkIF9kb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnksIHByb3RlY3RlZCBfcGxhdGZvcm06IFBsYXRmb3JtKSB7XHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9jb250YWluZXJFbGVtZW50O1xyXG5cclxuICAgIGlmIChjb250YWluZXIgJiYgY29udGFpbmVyLnBhcmVudE5vZGUpIHtcclxuICAgICAgY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoY29udGFpbmVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIG92ZXJsYXkgY29udGFpbmVyIGVsZW1lbnQuIEl0IHdpbGwgbGF6aWx5XHJcbiAgICogY3JlYXRlIHRoZSBlbGVtZW50IHRoZSBmaXJzdCB0aW1lICBpdCBpcyBjYWxsZWQgdG8gZmFjaWxpdGF0ZSB1c2luZ1xyXG4gICAqIHRoZSBjb250YWluZXIgaW4gbm9uLWJyb3dzZXIgZW52aXJvbm1lbnRzLlxyXG4gICAqIEByZXR1cm5zIHRoZSBjb250YWluZXIgZWxlbWVudFxyXG4gICAqL1xyXG4gIGdldENvbnRhaW5lckVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgaWYgKCF0aGlzLl9jb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuX2NyZWF0ZUNvbnRhaW5lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9jb250YWluZXJFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIHRoZSBvdmVybGF5IGNvbnRhaW5lciBlbGVtZW50LCB3aGljaCBpcyBzaW1wbHkgYSBkaXZcclxuICAgKiB3aXRoIHRoZSAnY2RrLW92ZXJsYXktY29udGFpbmVyJyBjbGFzcyBvbiB0aGUgZG9jdW1lbnQgYm9keS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgX2NyZWF0ZUNvbnRhaW5lcigpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gJ2Nkay1vdmVybGF5LWNvbnRhaW5lcic7XHJcblxyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3NlciB8fCBpc1Rlc3RFbnZpcm9ubWVudCkge1xyXG4gICAgICBjb25zdCBvcHBvc2l0ZVBsYXRmb3JtQ29udGFpbmVycyA9XHJcbiAgICAgICAgICB0aGlzLl9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuJHtjb250YWluZXJDbGFzc31bcGxhdGZvcm09XCJzZXJ2ZXJcIl0sIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLiR7Y29udGFpbmVyQ2xhc3N9W3BsYXRmb3JtPVwidGVzdFwiXWApO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGFueSBvbGQgY29udGFpbmVycyBmcm9tIHRoZSBvcHBvc2l0ZSBwbGF0Zm9ybS5cclxuICAgICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdoZW4gdHJhbnNpdGlvbmluZyBmcm9tIHRoZSBzZXJ2ZXIgdG8gdGhlIGNsaWVudC5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHBvc2l0ZVBsYXRmb3JtQ29udGFpbmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG9wcG9zaXRlUGxhdGZvcm1Db250YWluZXJzW2ldLnBhcmVudE5vZGUhLnJlbW92ZUNoaWxkKG9wcG9zaXRlUGxhdGZvcm1Db250YWluZXJzW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoY29udGFpbmVyQ2xhc3MpO1xyXG5cclxuICAgIC8vIEEgbG9uZyB0aW1lIGFnbyB3ZSBrZXB0IGFkZGluZyBuZXcgb3ZlcmxheSBjb250YWluZXJzIHdoZW5ldmVyIGEgbmV3IGFwcCB3YXMgaW5zdGFudGlhdGVkLFxyXG4gICAgLy8gYnV0IGF0IHNvbWUgcG9pbnQgd2UgYWRkZWQgbG9naWMgd2hpY2ggY2xlYXJzIHRoZSBkdXBsaWNhdGUgb25lcyBpbiBvcmRlciB0byBhdm9pZCBsZWFrcy5cclxuICAgIC8vIFRoZSBuZXcgbG9naWMgd2FzIGEgbGl0dGxlIHRvbyBhZ2dyZXNzaXZlIHNpbmNlIGl0IHdhcyBicmVha2luZyBzb21lIGxlZ2l0aW1hdGUgdXNlIGNhc2VzLlxyXG4gICAgLy8gVG8gbWl0aWdhdGUgdGhlIHByb2JsZW0gd2UgbWFkZSBpdCBzbyB0aGF0IG9ubHkgY29udGFpbmVycyBmcm9tIGEgZGlmZmVyZW50IHBsYXRmb3JtIGFyZVxyXG4gICAgLy8gY2xlYXJlZCwgYnV0IHRoZSBzaWRlLWVmZmVjdCB3YXMgdGhhdCBwZW9wbGUgc3RhcnRlZCBkZXBlbmRpbmcgb24gdGhlIG92ZXJseS1hZ2dyZXNzaXZlXHJcbiAgICAvLyBsb2dpYyB0byBjbGVhbiB1cCB0aGVpciB0ZXN0cyBmb3IgdGhlbS4gVW50aWwgd2UgY2FuIGludHJvZHVjZSBhbiBvdmVybGF5LXNwZWNpZmljIHRlc3RpbmdcclxuICAgIC8vIG1vZHVsZSB3aGljaCBkb2VzIHRoZSBjbGVhbnVwLCB3ZSB0cnkgdG8gZGV0ZWN0IHRoYXQgd2UncmUgaW4gYSB0ZXN0IGVudmlyb25tZW50IGFuZCB3ZVxyXG4gICAgLy8gYWx3YXlzIGNsZWFyIHRoZSBjb250YWluZXIuIFNlZSAjMTcwMDYuXHJcbiAgICAvLyBUT0RPKGNyaXNiZXRvKTogcmVtb3ZlIHRoZSB0ZXN0IGVudmlyb25tZW50IGNoZWNrIG9uY2Ugd2UgaGF2ZSBhbiBvdmVybGF5IHRlc3RpbmcgbW9kdWxlLlxyXG4gICAgaWYgKGlzVGVzdEVudmlyb25tZW50KSB7XHJcbiAgICAgIGNvbnRhaW5lci5zZXRBdHRyaWJ1dGUoJ3BsYXRmb3JtJywgJ3Rlc3QnKTtcclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICBjb250YWluZXIuc2V0QXR0cmlidXRlKCdwbGF0Zm9ybScsICdzZXJ2ZXInKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XHJcbiAgICB0aGlzLl9jb250YWluZXJFbGVtZW50ID0gY29udGFpbmVyO1xyXG4gIH1cclxufVxyXG4iXX0=