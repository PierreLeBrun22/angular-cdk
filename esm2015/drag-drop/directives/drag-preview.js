/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, InjectionToken, Input, TemplateRef } from '@angular/core';
/**
 * Injection token that can be used to reference instances of `CdkDragPreview`. It serves as
 * alternative token to the actual `CdkDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PREVIEW = new InjectionToken('CdkDragPreview');
/**
 * Element that will be used as a template for the preview
 * of a CdkDrag when it is being dragged.
 */
export class CdkDragPreview {
    constructor(templateRef) {
        this.templateRef = templateRef;
        this._matchSize = false;
    }
    /** Whether the preview should preserve the same size as the item that is being dragged. */
    get matchSize() { return this._matchSize; }
    set matchSize(value) { this._matchSize = coerceBooleanProperty(value); }
}
CdkDragPreview.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[cdkDragPreview]',
                providers: [{ provide: CDK_DRAG_PREVIEW, useExisting: CdkDragPreview }],
            },] }
];
CdkDragPreview.ctorParameters = () => [
    { type: TemplateRef }
];
CdkDragPreview.propDecorators = {
    data: [{ type: Input }],
    matchSize: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wcmV2aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcmFnLXByZXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU1RTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxjQUFjLENBQWlCLGdCQUFnQixDQUFDLENBQUM7QUFFckY7OztHQUdHO0FBS0gsTUFBTSxPQUFPLGNBQWM7SUFVekIsWUFBbUIsV0FBMkI7UUFBM0IsZ0JBQVcsR0FBWCxXQUFXLENBQWdCO1FBRnRDLGVBQVUsR0FBRyxLQUFLLENBQUM7SUFFc0IsQ0FBQztJQU5sRCwyRkFBMkY7SUFDM0YsSUFDSSxTQUFTLEtBQWMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztJQUNwRCxJQUFJLFNBQVMsQ0FBQyxLQUFjLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7OztZQVhsRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDZCQUE2QjtnQkFDdkMsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsRUFBQyxDQUFDO2FBQ3RFOzs7WUFoQnlDLFdBQVc7OzttQkFtQmxELEtBQUs7d0JBR0wsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtEaXJlY3RpdmUsIEluamVjdGlvblRva2VuLCBJbnB1dCwgVGVtcGxhdGVSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdQcmV2aWV3YC4gSXQgc2VydmVzIGFzXHJcbiAqIGFsdGVybmF0aXZlIHRva2VuIHRvIHRoZSBhY3R1YWwgYENka0RyYWdQcmV2aWV3YCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxyXG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENES19EUkFHX1BSRVZJRVcgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrRHJhZ1ByZXZpZXc+KCdDZGtEcmFnUHJldmlldycpO1xyXG5cclxuLyoqXHJcbiAqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSBmb3IgdGhlIHByZXZpZXdcclxuICogb2YgYSBDZGtEcmFnIHdoZW4gaXQgaXMgYmVpbmcgZHJhZ2dlZC5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrRHJhZ1ByZXZpZXddJyxcclxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUFJFVklFVywgdXNlRXhpc3Rpbmc6IENka0RyYWdQcmV2aWV3fV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtEcmFnUHJldmlldzxUID0gYW55PiB7XHJcbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBhZGRlZCB0byB0aGUgcHJldmlldyB0ZW1wbGF0ZSBpbnN0YW5jZS4gKi9cclxuICBASW5wdXQoKSBkYXRhOiBUO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgcHJldmlldyBzaG91bGQgcHJlc2VydmUgdGhlIHNhbWUgc2l6ZSBhcyB0aGUgaXRlbSB0aGF0IGlzIGJlaW5nIGRyYWdnZWQuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgbWF0Y2hTaXplKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fbWF0Y2hTaXplOyB9XHJcbiAgc2V0IG1hdGNoU2l6ZSh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9tYXRjaFNpemUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XHJcbiAgcHJpdmF0ZSBfbWF0Y2hTaXplID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8VD4pIHt9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXRjaFNpemU6IEJvb2xlYW5JbnB1dDtcclxufVxyXG4iXX0=