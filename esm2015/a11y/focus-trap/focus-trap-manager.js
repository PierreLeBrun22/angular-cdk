/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/** Injectable that ensures only the most recently enabled FocusTrap is active. */
export class FocusTrapManager {
    constructor() {
        // A stack of the FocusTraps on the page. Only the FocusTrap at the
        // top of the stack is active.
        this._focusTrapStack = [];
    }
    /**
     * Disables the FocusTrap at the top of the stack, and then pushes
     * the new FocusTrap onto the stack.
     */
    register(focusTrap) {
        // Dedupe focusTraps that register multiple times.
        this._focusTrapStack = this._focusTrapStack.filter((ft) => ft !== focusTrap);
        let stack = this._focusTrapStack;
        if (stack.length) {
            stack[stack.length - 1]._disable();
        }
        stack.push(focusTrap);
        focusTrap._enable();
    }
    /**
     * Removes the FocusTrap from the stack, and activates the
     * FocusTrap that is the new top of the stack.
     */
    deregister(focusTrap) {
        focusTrap._disable();
        const stack = this._focusTrapStack;
        const i = stack.indexOf(focusTrap);
        if (i !== -1) {
            stack.splice(i, 1);
            if (stack.length) {
                stack[stack.length - 1]._enable();
            }
        }
    }
}
FocusTrapManager.ɵprov = i0.ɵɵdefineInjectable({ factory: function FocusTrapManager_Factory() { return new FocusTrapManager(); }, token: FocusTrapManager, providedIn: "root" });
FocusTrapManager.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtdHJhcC1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2ZvY3VzLXRyYXAvZm9jdXMtdHJhcC1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBWXpDLGtGQUFrRjtBQUVsRixNQUFNLE9BQU8sZ0JBQWdCO0lBRDdCO1FBRUUsbUVBQW1FO1FBQ25FLDhCQUE4QjtRQUN0QixvQkFBZSxHQUF1QixFQUFFLENBQUM7S0FxQ2xEO0lBbkNDOzs7T0FHRztJQUNILFFBQVEsQ0FBQyxTQUEyQjtRQUNsQyxrREFBa0Q7UUFDbEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxDQUFDO1FBRTdFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFFakMsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ2hCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILFVBQVUsQ0FBQyxTQUEyQjtRQUNwQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUVuQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ1osS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUNoQixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQztTQUNGO0lBQ0gsQ0FBQzs7OztZQXhDRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEEgRm9jdXNUcmFwIG1hbmFnZWQgYnkgRm9jdXNUcmFwTWFuYWdlci5cclxuICogSW1wbGVtZW50ZWQgYnkgQ29uZmlndXJhYmxlRm9jdXNUcmFwIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY3kuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE1hbmFnZWRGb2N1c1RyYXAge1xyXG4gIF9lbmFibGUoKTogdm9pZDtcclxuICBfZGlzYWJsZSgpOiB2b2lkO1xyXG4gIGZvY3VzSW5pdGlhbEVsZW1lbnRXaGVuUmVhZHkoKTogUHJvbWlzZTxib29sZWFuPjtcclxufVxyXG5cclxuLyoqIEluamVjdGFibGUgdGhhdCBlbnN1cmVzIG9ubHkgdGhlIG1vc3QgcmVjZW50bHkgZW5hYmxlZCBGb2N1c1RyYXAgaXMgYWN0aXZlLiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEZvY3VzVHJhcE1hbmFnZXIge1xyXG4gIC8vIEEgc3RhY2sgb2YgdGhlIEZvY3VzVHJhcHMgb24gdGhlIHBhZ2UuIE9ubHkgdGhlIEZvY3VzVHJhcCBhdCB0aGVcclxuICAvLyB0b3Agb2YgdGhlIHN0YWNrIGlzIGFjdGl2ZS5cclxuICBwcml2YXRlIF9mb2N1c1RyYXBTdGFjazogTWFuYWdlZEZvY3VzVHJhcFtdID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc2FibGVzIHRoZSBGb2N1c1RyYXAgYXQgdGhlIHRvcCBvZiB0aGUgc3RhY2ssIGFuZCB0aGVuIHB1c2hlc1xyXG4gICAqIHRoZSBuZXcgRm9jdXNUcmFwIG9udG8gdGhlIHN0YWNrLlxyXG4gICAqL1xyXG4gIHJlZ2lzdGVyKGZvY3VzVHJhcDogTWFuYWdlZEZvY3VzVHJhcCk6IHZvaWQge1xyXG4gICAgLy8gRGVkdXBlIGZvY3VzVHJhcHMgdGhhdCByZWdpc3RlciBtdWx0aXBsZSB0aW1lcy5cclxuICAgIHRoaXMuX2ZvY3VzVHJhcFN0YWNrID0gdGhpcy5fZm9jdXNUcmFwU3RhY2suZmlsdGVyKChmdCkgPT4gZnQgIT09IGZvY3VzVHJhcCk7XHJcblxyXG4gICAgbGV0IHN0YWNrID0gdGhpcy5fZm9jdXNUcmFwU3RhY2s7XHJcblxyXG4gICAgaWYgKHN0YWNrLmxlbmd0aCkge1xyXG4gICAgICBzdGFja1tzdGFjay5sZW5ndGggLSAxXS5fZGlzYWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YWNrLnB1c2goZm9jdXNUcmFwKTtcclxuICAgIGZvY3VzVHJhcC5fZW5hYmxlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIHRoZSBGb2N1c1RyYXAgZnJvbSB0aGUgc3RhY2ssIGFuZCBhY3RpdmF0ZXMgdGhlXHJcbiAgICogRm9jdXNUcmFwIHRoYXQgaXMgdGhlIG5ldyB0b3Agb2YgdGhlIHN0YWNrLlxyXG4gICAqL1xyXG4gIGRlcmVnaXN0ZXIoZm9jdXNUcmFwOiBNYW5hZ2VkRm9jdXNUcmFwKTogdm9pZCB7XHJcbiAgICBmb2N1c1RyYXAuX2Rpc2FibGUoKTtcclxuXHJcbiAgICBjb25zdCBzdGFjayA9IHRoaXMuX2ZvY3VzVHJhcFN0YWNrO1xyXG5cclxuICAgIGNvbnN0IGkgPSBzdGFjay5pbmRleE9mKGZvY3VzVHJhcCk7XHJcbiAgICBpZiAoaSAhPT0gLTEpIHtcclxuICAgICAgc3RhY2suc3BsaWNlKGksIDEpO1xyXG4gICAgICBpZiAoc3RhY2subGVuZ3RoKSB7XHJcbiAgICAgICAgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0uX2VuYWJsZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==