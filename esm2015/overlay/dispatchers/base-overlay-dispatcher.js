/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/**
 * Service for dispatching events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
export class BaseOverlayDispatcher {
    constructor(document) {
        /** Currently attached overlays in the order they were attached. */
        this._attachedOverlays = [];
        this._document = document;
    }
    ngOnDestroy() {
        this.detach();
    }
    /** Add a new overlay to the list of attached overlay refs. */
    add(overlayRef) {
        // Ensure that we don't get the same overlay multiple times.
        this.remove(overlayRef);
        this._attachedOverlays.push(overlayRef);
    }
    /** Remove an overlay from the list of attached overlay refs. */
    remove(overlayRef) {
        const index = this._attachedOverlays.indexOf(overlayRef);
        if (index > -1) {
            this._attachedOverlays.splice(index, 1);
        }
        // Remove the global listener once there are no more overlays.
        if (this._attachedOverlays.length === 0) {
            this.detach();
        }
    }
}
BaseOverlayDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function BaseOverlayDispatcher_Factory() { return new BaseOverlayDispatcher(i0.ɵɵinject(i1.DOCUMENT)); }, token: BaseOverlayDispatcher, providedIn: "root" });
BaseOverlayDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
BaseOverlayDispatcher.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1vdmVybGF5LWRpc3BhdGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvZGlzcGF0Y2hlcnMvYmFzZS1vdmVybGF5LWRpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFZLE1BQU0sZUFBZSxDQUFDOzs7QUFJNUQ7Ozs7R0FJRztBQUVILE1BQU0sT0FBZ0IscUJBQXFCO0lBUXpDLFlBQThCLFFBQWE7UUFOM0MsbUVBQW1FO1FBQ25FLHNCQUFpQixHQUF1QixFQUFFLENBQUM7UUFNekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxHQUFHLENBQUMsVUFBNEI7UUFDOUIsNERBQTREO1FBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLE1BQU0sQ0FBQyxVQUE0QjtRQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDekM7UUFFRCw4REFBOEQ7UUFDOUQsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDZjtJQUNILENBQUM7Ozs7WUFwQ0YsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQVNqQixNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9uRGVzdHJveX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBTZXJ2aWNlIGZvciBkaXNwYXRjaGluZyBldmVudHMgdGhhdCBsYW5kIG9uIHRoZSBib2R5IHRvIGFwcHJvcHJpYXRlIG92ZXJsYXkgcmVmLFxyXG4gKiBpZiBhbnkuIEl0IG1haW50YWlucyBhIGxpc3Qgb2YgYXR0YWNoZWQgb3ZlcmxheXMgdG8gZGV0ZXJtaW5lIGJlc3Qgc3VpdGVkIG92ZXJsYXkgYmFzZWRcclxuICogb24gZXZlbnQgdGFyZ2V0IGFuZCBvcmRlciBvZiBvdmVybGF5IG9wZW5zLlxyXG4gKi9cclxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlT3ZlcmxheURpc3BhdGNoZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG5cclxuICAvKiogQ3VycmVudGx5IGF0dGFjaGVkIG92ZXJsYXlzIGluIHRoZSBvcmRlciB0aGV5IHdlcmUgYXR0YWNoZWQuICovXHJcbiAgX2F0dGFjaGVkT3ZlcmxheXM6IE92ZXJsYXlSZWZlcmVuY2VbXSA9IFtdO1xyXG5cclxuICBwcm90ZWN0ZWQgX2RvY3VtZW50OiBEb2N1bWVudDtcclxuICBwcm90ZWN0ZWQgX2lzQXR0YWNoZWQ6IGJvb2xlYW47XHJcblxyXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnkpIHtcclxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGV0YWNoKCk7XHJcbiAgfVxyXG5cclxuICAvKiogQWRkIGEgbmV3IG92ZXJsYXkgdG8gdGhlIGxpc3Qgb2YgYXR0YWNoZWQgb3ZlcmxheSByZWZzLiAqL1xyXG4gIGFkZChvdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlKTogdm9pZCB7XHJcbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBkb24ndCBnZXQgdGhlIHNhbWUgb3ZlcmxheSBtdWx0aXBsZSB0aW1lcy5cclxuICAgIHRoaXMucmVtb3ZlKG92ZXJsYXlSZWYpO1xyXG4gICAgdGhpcy5fYXR0YWNoZWRPdmVybGF5cy5wdXNoKG92ZXJsYXlSZWYpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlbW92ZSBhbiBvdmVybGF5IGZyb20gdGhlIGxpc3Qgb2YgYXR0YWNoZWQgb3ZlcmxheSByZWZzLiAqL1xyXG4gIHJlbW92ZShvdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX2F0dGFjaGVkT3ZlcmxheXMuaW5kZXhPZihvdmVybGF5UmVmKTtcclxuXHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICB0aGlzLl9hdHRhY2hlZE92ZXJsYXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRoZSBnbG9iYWwgbGlzdGVuZXIgb25jZSB0aGVyZSBhcmUgbm8gbW9yZSBvdmVybGF5cy5cclxuICAgIGlmICh0aGlzLl9hdHRhY2hlZE92ZXJsYXlzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICB0aGlzLmRldGFjaCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIERldGFjaGVzIHRoZSBnbG9iYWwgZXZlbnQgbGlzdGVuZXIuICovXHJcbiAgcHJvdGVjdGVkIGFic3RyYWN0IGRldGFjaCgpOiB2b2lkO1xyXG59XHJcbiJdfQ==