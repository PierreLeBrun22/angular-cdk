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
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/platform";
/**
 * Service for dispatching mouse click events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
export class OverlayOutsideClickDispatcher extends BaseOverlayDispatcher {
    constructor(document, _platform) {
        super(document);
        this._platform = _platform;
        this._cursorStyleIsSet = false;
        /** Click event listener that will be attached to the body propagate phase. */
        this._clickListener = (event) => {
            // Get the target through the `composedPath` if possible to account for shadow DOM.
            const target = event.composedPath ? event.composedPath()[0] : event.target;
            // We copy the array because the original may be modified asynchronously if the
            // outsidePointerEvents listener decides to detach overlays resulting in index errors inside
            // the for loop.
            const overlays = this._attachedOverlays.slice();
            // Dispatch the mouse event to the top overlay which has subscribers to its mouse events.
            // We want to target all overlays for which the click could be considered as outside click.
            // As soon as we reach an overlay for which the click is not outside click we break off
            // the loop.
            for (let i = overlays.length - 1; i > -1; i--) {
                const overlayRef = overlays[i];
                if (overlayRef._outsidePointerEvents.observers.length < 1 || !overlayRef.hasAttached()) {
                    continue;
                }
                // If it's a click inside the overlay, just break - we should do nothing
                // If it's an outside click dispatch the mouse event, and proceed with the next overlay
                if (overlayRef.overlayElement.contains(target)) {
                    break;
                }
                overlayRef._outsidePointerEvents.next(event);
            }
        };
    }
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef) {
        super.add(overlayRef);
        // tslint:disable: max-line-length
        // Safari on iOS does not generate click events for non-interactive
        // elements. However, we want to receive a click for any element outside
        // the overlay. We can force a "clickable" state by setting
        // `cursor: pointer` on the document body.
        // See https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event#Safari_Mobile
        // and https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
        // tslint:enable: max-line-length
        if (!this._isAttached) {
            this._document.body.addEventListener('click', this._clickListener, true);
            this._document.body.addEventListener('contextmenu', this._clickListener, true);
            // click event is not fired on iOS. To make element "clickable" we are
            // setting the cursor to pointer
            if (this._platform.IOS && !this._cursorStyleIsSet) {
                this._cursorOriginalValue = this._document.body.style.cursor;
                this._document.body.style.cursor = 'pointer';
                this._cursorStyleIsSet = true;
            }
            this._isAttached = true;
        }
    }
    /** Detaches the global keyboard event listener. */
    detach() {
        if (this._isAttached) {
            this._document.body.removeEventListener('click', this._clickListener, true);
            this._document.body.removeEventListener('contextmenu', this._clickListener, true);
            if (this._platform.IOS && this._cursorStyleIsSet) {
                this._document.body.style.cursor = this._cursorOriginalValue;
                this._cursorStyleIsSet = false;
            }
            this._isAttached = false;
        }
    }
}
OverlayOutsideClickDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function OverlayOutsideClickDispatcher_Factory() { return new OverlayOutsideClickDispatcher(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i2.Platform)); }, token: OverlayOutsideClickDispatcher, providedIn: "root" });
OverlayOutsideClickDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
OverlayOutsideClickDispatcher.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1vdXRzaWRlLWNsaWNrLWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvZGlzcGF0Y2hlcnMvb3ZlcmxheS1vdXRzaWRlLWNsaWNrLWRpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7OztBQUVoRTs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLDZCQUE4QixTQUFRLHFCQUFxQjtJQUl0RSxZQUE4QixRQUFhLEVBQVUsU0FBbUI7UUFDdEUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRG1DLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFGaEUsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBK0NsQyw4RUFBOEU7UUFDdEUsbUJBQWMsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtZQUM3QyxtRkFBbUY7WUFDbkYsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQzNFLCtFQUErRTtZQUMvRSw0RkFBNEY7WUFDNUYsZ0JBQWdCO1lBQ2hCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVoRCx5RkFBeUY7WUFDekYsMkZBQTJGO1lBQzNGLHVGQUF1RjtZQUN2RixZQUFZO1lBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxVQUFVLENBQUMscUJBQXFCLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUU7b0JBQ3RGLFNBQVM7aUJBQ1Y7Z0JBRUQsd0VBQXdFO2dCQUN4RSx1RkFBdUY7Z0JBQ3ZGLElBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsTUFBYyxDQUFDLEVBQUU7b0JBQ3RELE1BQU07aUJBQ1A7Z0JBRUQsVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM5QztRQUNILENBQUMsQ0FBQTtJQXRFRCxDQUFDO0lBRUQsOERBQThEO0lBQzlELEdBQUcsQ0FBQyxVQUE0QjtRQUM5QixLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXRCLGtDQUFrQztRQUNsQyxtRUFBbUU7UUFDbkUsd0VBQXdFO1FBQ3hFLDJEQUEyRDtRQUMzRCwwQ0FBMEM7UUFDMUMseUZBQXlGO1FBQ3pGLGdKQUFnSjtRQUNoSixpQ0FBaUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFL0Usc0VBQXNFO1lBQ3RFLGdDQUFnQztZQUNoQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUNqRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDN0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUM7YUFDL0I7WUFFRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN6QjtJQUNILENBQUM7SUFFRCxtREFBbUQ7SUFDekMsTUFBTTtRQUNkLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNsRixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7Z0JBQzdELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7YUFDaEM7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUMxQjtJQUNILENBQUM7Ozs7WUFoREYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQUtqQixNQUFNLFNBQUMsUUFBUTtZQWJ0QixRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge0Jhc2VPdmVybGF5RGlzcGF0Y2hlcn0gZnJvbSAnLi9iYXNlLW92ZXJsYXktZGlzcGF0Y2hlcic7XHJcblxyXG4vKipcclxuICogU2VydmljZSBmb3IgZGlzcGF0Y2hpbmcgbW91c2UgY2xpY2sgZXZlbnRzIHRoYXQgbGFuZCBvbiB0aGUgYm9keSB0byBhcHByb3ByaWF0ZSBvdmVybGF5IHJlZixcclxuICogaWYgYW55LiBJdCBtYWludGFpbnMgYSBsaXN0IG9mIGF0dGFjaGVkIG92ZXJsYXlzIHRvIGRldGVybWluZSBiZXN0IHN1aXRlZCBvdmVybGF5IGJhc2VkXHJcbiAqIG9uIGV2ZW50IHRhcmdldCBhbmQgb3JkZXIgb2Ygb3ZlcmxheSBvcGVucy5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgT3ZlcmxheU91dHNpZGVDbGlja0Rpc3BhdGNoZXIgZXh0ZW5kcyBCYXNlT3ZlcmxheURpc3BhdGNoZXIge1xyXG4gIHByaXZhdGUgX2N1cnNvck9yaWdpbmFsVmFsdWU6IHN0cmluZztcclxuICBwcml2YXRlIF9jdXJzb3JTdHlsZUlzU2V0ID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnksIHByaXZhdGUgX3BsYXRmb3JtOiBQbGF0Zm9ybSkge1xyXG4gICAgc3VwZXIoZG9jdW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFkZCBhIG5ldyBvdmVybGF5IHRvIHRoZSBsaXN0IG9mIGF0dGFjaGVkIG92ZXJsYXkgcmVmcy4gKi9cclxuICBhZGQob3ZlcmxheVJlZjogT3ZlcmxheVJlZmVyZW5jZSk6IHZvaWQge1xyXG4gICAgc3VwZXIuYWRkKG92ZXJsYXlSZWYpO1xyXG5cclxuICAgIC8vIHRzbGludDpkaXNhYmxlOiBtYXgtbGluZS1sZW5ndGhcclxuICAgIC8vIFNhZmFyaSBvbiBpT1MgZG9lcyBub3QgZ2VuZXJhdGUgY2xpY2sgZXZlbnRzIGZvciBub24taW50ZXJhY3RpdmVcclxuICAgIC8vIGVsZW1lbnRzLiBIb3dldmVyLCB3ZSB3YW50IHRvIHJlY2VpdmUgYSBjbGljayBmb3IgYW55IGVsZW1lbnQgb3V0c2lkZVxyXG4gICAgLy8gdGhlIG92ZXJsYXkuIFdlIGNhbiBmb3JjZSBhIFwiY2xpY2thYmxlXCIgc3RhdGUgYnkgc2V0dGluZ1xyXG4gICAgLy8gYGN1cnNvcjogcG9pbnRlcmAgb24gdGhlIGRvY3VtZW50IGJvZHkuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0VsZW1lbnQvY2xpY2tfZXZlbnQjU2FmYXJpX01vYmlsZVxyXG4gICAgLy8gYW5kIGh0dHBzOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L2FyY2hpdmUvZG9jdW1lbnRhdGlvbi9BcHBsZUFwcGxpY2F0aW9ucy9SZWZlcmVuY2UvU2FmYXJpV2ViQ29udGVudC9IYW5kbGluZ0V2ZW50cy9IYW5kbGluZ0V2ZW50cy5odG1sXHJcbiAgICAvLyB0c2xpbnQ6ZW5hYmxlOiBtYXgtbGluZS1sZW5ndGhcclxuICAgIGlmICghdGhpcy5faXNBdHRhY2hlZCkge1xyXG4gICAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xpY2tMaXN0ZW5lciwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLl9jbGlja0xpc3RlbmVyLCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIGNsaWNrIGV2ZW50IGlzIG5vdCBmaXJlZCBvbiBpT1MuIFRvIG1ha2UgZWxlbWVudCBcImNsaWNrYWJsZVwiIHdlIGFyZVxyXG4gICAgICAvLyBzZXR0aW5nIHRoZSBjdXJzb3IgdG8gcG9pbnRlclxyXG4gICAgICBpZiAodGhpcy5fcGxhdGZvcm0uSU9TICYmICF0aGlzLl9jdXJzb3JTdHlsZUlzU2V0KSB7XHJcbiAgICAgICAgdGhpcy5fY3Vyc29yT3JpZ2luYWxWYWx1ZSA9IHRoaXMuX2RvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yO1xyXG4gICAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xyXG4gICAgICAgIHRoaXMuX2N1cnNvclN0eWxlSXNTZXQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBEZXRhY2hlcyB0aGUgZ2xvYmFsIGtleWJvYXJkIGV2ZW50IGxpc3RlbmVyLiAqL1xyXG4gIHByb3RlY3RlZCBkZXRhY2goKSB7XHJcbiAgICBpZiAodGhpcy5faXNBdHRhY2hlZCkge1xyXG4gICAgICB0aGlzLl9kb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xpY2tMaXN0ZW5lciwgdHJ1ZSk7XHJcbiAgICAgIHRoaXMuX2RvY3VtZW50LmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLl9jbGlja0xpc3RlbmVyLCB0cnVlKTtcclxuICAgICAgaWYgKHRoaXMuX3BsYXRmb3JtLklPUyAmJiB0aGlzLl9jdXJzb3JTdHlsZUlzU2V0KSB7XHJcbiAgICAgICAgdGhpcy5fZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSB0aGlzLl9jdXJzb3JPcmlnaW5hbFZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2N1cnNvclN0eWxlSXNTZXQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLl9pc0F0dGFjaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogQ2xpY2sgZXZlbnQgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGF0dGFjaGVkIHRvIHRoZSBib2R5IHByb3BhZ2F0ZSBwaGFzZS4gKi9cclxuICBwcml2YXRlIF9jbGlja0xpc3RlbmVyID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAvLyBHZXQgdGhlIHRhcmdldCB0aHJvdWdoIHRoZSBgY29tcG9zZWRQYXRoYCBpZiBwb3NzaWJsZSB0byBhY2NvdW50IGZvciBzaGFkb3cgRE9NLlxyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQuY29tcG9zZWRQYXRoID8gZXZlbnQuY29tcG9zZWRQYXRoKClbMF0gOiBldmVudC50YXJnZXQ7XHJcbiAgICAvLyBXZSBjb3B5IHRoZSBhcnJheSBiZWNhdXNlIHRoZSBvcmlnaW5hbCBtYXkgYmUgbW9kaWZpZWQgYXN5bmNocm9ub3VzbHkgaWYgdGhlXHJcbiAgICAvLyBvdXRzaWRlUG9pbnRlckV2ZW50cyBsaXN0ZW5lciBkZWNpZGVzIHRvIGRldGFjaCBvdmVybGF5cyByZXN1bHRpbmcgaW4gaW5kZXggZXJyb3JzIGluc2lkZVxyXG4gICAgLy8gdGhlIGZvciBsb29wLlxyXG4gICAgY29uc3Qgb3ZlcmxheXMgPSB0aGlzLl9hdHRhY2hlZE92ZXJsYXlzLnNsaWNlKCk7XHJcblxyXG4gICAgLy8gRGlzcGF0Y2ggdGhlIG1vdXNlIGV2ZW50IHRvIHRoZSB0b3Agb3ZlcmxheSB3aGljaCBoYXMgc3Vic2NyaWJlcnMgdG8gaXRzIG1vdXNlIGV2ZW50cy5cclxuICAgIC8vIFdlIHdhbnQgdG8gdGFyZ2V0IGFsbCBvdmVybGF5cyBmb3Igd2hpY2ggdGhlIGNsaWNrIGNvdWxkIGJlIGNvbnNpZGVyZWQgYXMgb3V0c2lkZSBjbGljay5cclxuICAgIC8vIEFzIHNvb24gYXMgd2UgcmVhY2ggYW4gb3ZlcmxheSBmb3Igd2hpY2ggdGhlIGNsaWNrIGlzIG5vdCBvdXRzaWRlIGNsaWNrIHdlIGJyZWFrIG9mZlxyXG4gICAgLy8gdGhlIGxvb3AuXHJcbiAgICBmb3IgKGxldCBpID0gb3ZlcmxheXMubGVuZ3RoIC0gMTsgaSA+IC0xOyBpLS0pIHtcclxuICAgICAgY29uc3Qgb3ZlcmxheVJlZiA9IG92ZXJsYXlzW2ldO1xyXG4gICAgICBpZiAob3ZlcmxheVJlZi5fb3V0c2lkZVBvaW50ZXJFdmVudHMub2JzZXJ2ZXJzLmxlbmd0aCA8IDEgfHwgIW92ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBpdCdzIGEgY2xpY2sgaW5zaWRlIHRoZSBvdmVybGF5LCBqdXN0IGJyZWFrIC0gd2Ugc2hvdWxkIGRvIG5vdGhpbmdcclxuICAgICAgLy8gSWYgaXQncyBhbiBvdXRzaWRlIGNsaWNrIGRpc3BhdGNoIHRoZSBtb3VzZSBldmVudCwgYW5kIHByb2NlZWQgd2l0aCB0aGUgbmV4dCBvdmVybGF5XHJcbiAgICAgIGlmIChvdmVybGF5UmVmLm92ZXJsYXlFbGVtZW50LmNvbnRhaW5zKHRhcmdldCBhcyBOb2RlKSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBvdmVybGF5UmVmLl9vdXRzaWRlUG9pbnRlckV2ZW50cy5uZXh0KGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19