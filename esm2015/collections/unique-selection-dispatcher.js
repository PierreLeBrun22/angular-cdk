/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Class to coordinate unique selection based on name.
 * Intended to be consumed as an Angular service.
 * This service is needed because native radio change events are only fired on the item currently
 * being selected, and we still need to uncheck the previous selection.
 *
 * This service does not *store* any IDs and names because they may change at any time, so it is
 * less error-prone if they are simply passed through when the events occur.
 */
export class UniqueSelectionDispatcher {
    constructor() {
        this._listeners = [];
    }
    /**
     * Notify other items that selection for the given name has been set.
     * @param id ID of the item.
     * @param name Name of the item.
     */
    notify(id, name) {
        for (let listener of this._listeners) {
            listener(id, name);
        }
    }
    /**
     * Listen for future changes to item selection.
     * @return Function used to deregister listener
     */
    listen(listener) {
        this._listeners.push(listener);
        return () => {
            this._listeners = this._listeners.filter((registered) => {
                return listener !== registered;
            });
        };
    }
    ngOnDestroy() {
        this._listeners = [];
    }
}
UniqueSelectionDispatcher.ɵprov = i0.ɵɵdefineInjectable({ factory: function UniqueSelectionDispatcher_Factory() { return new UniqueSelectionDispatcher(); }, token: UniqueSelectionDispatcher, providedIn: "root" });
UniqueSelectionDispatcher.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pcXVlLXNlbGVjdGlvbi1kaXNwYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy91bmlxdWUtc2VsZWN0aW9uLWRpc3BhdGNoZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBWSxNQUFNLGVBQWUsQ0FBQzs7QUFNcEQ7Ozs7Ozs7O0dBUUc7QUFFSCxNQUFNLE9BQU8seUJBQXlCO0lBRHRDO1FBRVUsZUFBVSxHQUF3QyxFQUFFLENBQUM7S0E2QjlEO0lBM0JDOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsRUFBVSxFQUFFLElBQVk7UUFDN0IsS0FBSyxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLFFBQTJDO1FBQ2hELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQTZDLEVBQUUsRUFBRTtnQkFDekYsT0FBTyxRQUFRLEtBQUssVUFBVSxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN2QixDQUFDOzs7O1lBOUJGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7SW5qZWN0YWJsZSwgT25EZXN0cm95fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcblxyXG4vLyBVc2VycyBvZiB0aGUgRGlzcGF0Y2hlciBuZXZlciBuZWVkIHRvIHNlZSB0aGlzIHR5cGUsIGJ1dCBUeXBlU2NyaXB0IHJlcXVpcmVzIGl0IHRvIGJlIGV4cG9ydGVkLlxyXG5leHBvcnQgdHlwZSBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyTGlzdGVuZXIgPSAoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSA9PiB2b2lkO1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHRvIGNvb3JkaW5hdGUgdW5pcXVlIHNlbGVjdGlvbiBiYXNlZCBvbiBuYW1lLlxyXG4gKiBJbnRlbmRlZCB0byBiZSBjb25zdW1lZCBhcyBhbiBBbmd1bGFyIHNlcnZpY2UuXHJcbiAqIFRoaXMgc2VydmljZSBpcyBuZWVkZWQgYmVjYXVzZSBuYXRpdmUgcmFkaW8gY2hhbmdlIGV2ZW50cyBhcmUgb25seSBmaXJlZCBvbiB0aGUgaXRlbSBjdXJyZW50bHlcclxuICogYmVpbmcgc2VsZWN0ZWQsIGFuZCB3ZSBzdGlsbCBuZWVkIHRvIHVuY2hlY2sgdGhlIHByZXZpb3VzIHNlbGVjdGlvbi5cclxuICpcclxuICogVGhpcyBzZXJ2aWNlIGRvZXMgbm90ICpzdG9yZSogYW55IElEcyBhbmQgbmFtZXMgYmVjYXVzZSB0aGV5IG1heSBjaGFuZ2UgYXQgYW55IHRpbWUsIHNvIGl0IGlzXHJcbiAqIGxlc3MgZXJyb3ItcHJvbmUgaWYgdGhleSBhcmUgc2ltcGx5IHBhc3NlZCB0aHJvdWdoIHdoZW4gdGhlIGV2ZW50cyBvY2N1ci5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfbGlzdGVuZXJzOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyTGlzdGVuZXJbXSA9IFtdO1xyXG5cclxuICAvKipcclxuICAgKiBOb3RpZnkgb3RoZXIgaXRlbXMgdGhhdCBzZWxlY3Rpb24gZm9yIHRoZSBnaXZlbiBuYW1lIGhhcyBiZWVuIHNldC5cclxuICAgKiBAcGFyYW0gaWQgSUQgb2YgdGhlIGl0ZW0uXHJcbiAgICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgaXRlbS5cclxuICAgKi9cclxuICBub3RpZnkoaWQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XHJcbiAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLl9saXN0ZW5lcnMpIHtcclxuICAgICAgbGlzdGVuZXIoaWQsIG5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdGVuIGZvciBmdXR1cmUgY2hhbmdlcyB0byBpdGVtIHNlbGVjdGlvbi5cclxuICAgKiBAcmV0dXJuIEZ1bmN0aW9uIHVzZWQgdG8gZGVyZWdpc3RlciBsaXN0ZW5lclxyXG4gICAqL1xyXG4gIGxpc3RlbihsaXN0ZW5lcjogVW5pcXVlU2VsZWN0aW9uRGlzcGF0Y2hlckxpc3RlbmVyKTogKCkgPT4gdm9pZCB7XHJcbiAgICB0aGlzLl9saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XHJcbiAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICB0aGlzLl9saXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMuZmlsdGVyKChyZWdpc3RlcmVkOiBVbmlxdWVTZWxlY3Rpb25EaXNwYXRjaGVyTGlzdGVuZXIpID0+IHtcclxuICAgICAgICByZXR1cm4gbGlzdGVuZXIgIT09IHJlZ2lzdGVyZWQ7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XHJcbiAgfVxyXG59XHJcbiJdfQ==