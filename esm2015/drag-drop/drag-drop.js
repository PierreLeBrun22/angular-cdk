/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Inject, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DragRef } from './drag-ref';
import { DropListRef } from './drop-list-ref';
import { DragDropRegistry } from './drag-drop-registry';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/scrolling";
import * as i3 from "./drag-drop-registry";
/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
    dragStartThreshold: 5,
    pointerDirectionChangeThreshold: 5
};
/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
export class DragDrop {
    constructor(_document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
    }
    /**
     * Turns an element into a draggable item.
     * @param element Element to which to attach the dragging functionality.
     * @param config Object used to configure the dragging behavior.
     */
    createDrag(element, config = DEFAULT_CONFIG) {
        return new DragRef(element, config, this._document, this._ngZone, this._viewportRuler, this._dragDropRegistry);
    }
    /**
     * Turns an element into a drop list.
     * @param element Element to which to attach the drop list functionality.
     */
    createDropList(element) {
        return new DropListRef(element, this._dragDropRegistry, this._document, this._ngZone, this._viewportRuler);
    }
}
DragDrop.ɵprov = i0.ɵɵdefineInjectable({ factory: function DragDrop_Factory() { return new DragDrop(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.ViewportRuler), i0.ɵɵinject(i3.DragDropRegistry)); }, token: DragDrop, providedIn: "root" });
DragDrop.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
DragDrop.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: NgZone },
    { type: ViewportRuler },
    { type: DragDropRegistry }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZHJhZy1kcm9wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUNyRSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxPQUFPLEVBQWdCLE1BQU0sWUFBWSxDQUFDO0FBQ2xELE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM1QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQzs7Ozs7QUFFdEQsa0VBQWtFO0FBQ2xFLE1BQU0sY0FBYyxHQUFHO0lBQ3JCLGtCQUFrQixFQUFFLENBQUM7SUFDckIsK0JBQStCLEVBQUUsQ0FBQztDQUNuQyxDQUFDO0FBRUY7O0dBRUc7QUFFSCxNQUFNLE9BQU8sUUFBUTtJQUNuQixZQUM0QixTQUFjLEVBQ2hDLE9BQWUsRUFDZixjQUE2QixFQUM3QixpQkFBeUQ7UUFIdkMsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUNoQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0Isc0JBQWlCLEdBQWpCLGlCQUFpQixDQUF3QztJQUFHLENBQUM7SUFFdkU7Ozs7T0FJRztJQUNILFVBQVUsQ0FBVSxPQUE4QyxFQUNwRCxTQUF3QixjQUFjO1FBRWxELE9BQU8sSUFBSSxPQUFPLENBQUksT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFDcEYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBVSxPQUE4QztRQUNwRSxPQUFPLElBQUksV0FBVyxDQUFJLE9BQU8sRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUNuRixJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDM0IsQ0FBQzs7OztZQTNCRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7NENBRzNCLE1BQU0sU0FBQyxRQUFRO1lBbkJRLE1BQU07WUFFMUIsYUFBYTtZQUdiLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE5nWm9uZSwgRWxlbWVudFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcbmltcG9ydCB7RHJhZ1JlZiwgRHJhZ1JlZkNvbmZpZ30gZnJvbSAnLi9kcmFnLXJlZic7XHJcbmltcG9ydCB7RHJvcExpc3RSZWZ9IGZyb20gJy4vZHJvcC1saXN0LXJlZic7XHJcbmltcG9ydCB7RHJhZ0Ryb3BSZWdpc3RyeX0gZnJvbSAnLi9kcmFnLWRyb3AtcmVnaXN0cnknO1xyXG5cclxuLyoqIERlZmF1bHQgY29uZmlndXJhdGlvbiB0byBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgYSBgRHJhZ1JlZmAuICovXHJcbmNvbnN0IERFRkFVTFRfQ09ORklHID0ge1xyXG4gIGRyYWdTdGFydFRocmVzaG9sZDogNSxcclxuICBwb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkOiA1XHJcbn07XHJcblxyXG4vKipcclxuICogU2VydmljZSB0aGF0IGFsbG93cyBmb3IgZHJhZy1hbmQtZHJvcCBmdW5jdGlvbmFsaXR5IHRvIGJlIGF0dGFjaGVkIHRvIERPTSBlbGVtZW50cy5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgRHJhZ0Ryb3Age1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJpdmF0ZSBfZG9jdW1lbnQ6IGFueSxcclxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcclxuICAgIHByaXZhdGUgX2RyYWdEcm9wUmVnaXN0cnk6IERyYWdEcm9wUmVnaXN0cnk8RHJhZ1JlZiwgRHJvcExpc3RSZWY+KSB7fVxyXG5cclxuICAvKipcclxuICAgKiBUdXJucyBhbiBlbGVtZW50IGludG8gYSBkcmFnZ2FibGUgaXRlbS5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IHRvIHdoaWNoIHRvIGF0dGFjaCB0aGUgZHJhZ2dpbmcgZnVuY3Rpb25hbGl0eS5cclxuICAgKiBAcGFyYW0gY29uZmlnIE9iamVjdCB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZHJhZ2dpbmcgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgY3JlYXRlRHJhZzxUID0gYW55PihlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgY29uZmlnOiBEcmFnUmVmQ29uZmlnID0gREVGQVVMVF9DT05GSUcpOiBEcmFnUmVmPFQ+IHtcclxuXHJcbiAgICByZXR1cm4gbmV3IERyYWdSZWY8VD4oZWxlbWVudCwgY29uZmlnLCB0aGlzLl9kb2N1bWVudCwgdGhpcy5fbmdab25lLCB0aGlzLl92aWV3cG9ydFJ1bGVyLFxyXG4gICAgICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHVybnMgYW4gZWxlbWVudCBpbnRvIGEgZHJvcCBsaXN0LlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gd2hpY2ggdG8gYXR0YWNoIHRoZSBkcm9wIGxpc3QgZnVuY3Rpb25hbGl0eS5cclxuICAgKi9cclxuICBjcmVhdGVEcm9wTGlzdDxUID0gYW55PihlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50KTogRHJvcExpc3RSZWY8VD4ge1xyXG4gICAgcmV0dXJuIG5ldyBEcm9wTGlzdFJlZjxUPihlbGVtZW50LCB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LCB0aGlzLl9kb2N1bWVudCwgdGhpcy5fbmdab25lLFxyXG4gICAgICAgIHRoaXMuX3ZpZXdwb3J0UnVsZXIpO1xyXG4gIH1cclxufVxyXG4iXX0=