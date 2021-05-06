/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef, Input, InjectionToken } from '@angular/core';
/**
 * Injection token that can be used to reference instances of `CdkDragPlaceholder`. It serves as
 * alternative token to the actual `CdkDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_PLACEHOLDER = new InjectionToken('CdkDragPlaceholder');
/**
 * Element that will be used as a template for the placeholder of a CdkDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
export class CdkDragPlaceholder {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
CdkDragPlaceholder.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[cdkDragPlaceholder]',
                providers: [{ provide: CDK_DRAG_PLACEHOLDER, useExisting: CdkDragPlaceholder }],
            },] }
];
CdkDragPlaceholder.ctorParameters = () => [
    { type: TemplateRef }
];
CdkDragPlaceholder.propDecorators = {
    data: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1wbGFjZWhvbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy1wbGFjZWhvbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLGNBQWMsQ0FBcUIsb0JBQW9CLENBQUMsQ0FBQztBQUVqRzs7O0dBR0c7QUFLSCxNQUFNLE9BQU8sa0JBQWtCO0lBRzdCLFlBQW1CLFdBQTJCO1FBQTNCLGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtJQUFHLENBQUM7OztZQVBuRCxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGlDQUFpQztnQkFDM0MsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsV0FBVyxFQUFFLGtCQUFrQixFQUFDLENBQUM7YUFDOUU7OztZQWhCa0IsV0FBVzs7O21CQW1CM0IsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtEaXJlY3RpdmUsIFRlbXBsYXRlUmVmLCBJbnB1dCwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuLyoqXHJcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0RyYWdQbGFjZWhvbGRlcmAuIEl0IHNlcnZlcyBhc1xyXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBDZGtEcmFnUGxhY2Vob2xkZXJgIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XHJcbiAqIHJldGVudGlvbiBvZiB0aGUgY2xhc3MgYW5kIGl0cyBkaXJlY3RpdmUgbWV0YWRhdGEuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQ0RLX0RSQUdfUExBQ0VIT0xERVIgPSBuZXcgSW5qZWN0aW9uVG9rZW48Q2RrRHJhZ1BsYWNlaG9sZGVyPignQ2RrRHJhZ1BsYWNlaG9sZGVyJyk7XHJcblxyXG4vKipcclxuICogRWxlbWVudCB0aGF0IHdpbGwgYmUgdXNlZCBhcyBhIHRlbXBsYXRlIGZvciB0aGUgcGxhY2Vob2xkZXIgb2YgYSBDZGtEcmFnIHdoZW5cclxuICogaXQgaXMgYmVpbmcgZHJhZ2dlZC4gVGhlIHBsYWNlaG9sZGVyIGlzIGRpc3BsYXllZCBpbiBwbGFjZSBvZiB0aGUgZWxlbWVudCBiZWluZyBkcmFnZ2VkLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICduZy10ZW1wbGF0ZVtjZGtEcmFnUGxhY2Vob2xkZXJdJyxcclxuICBwcm92aWRlcnM6IFt7cHJvdmlkZTogQ0RLX0RSQUdfUExBQ0VIT0xERVIsIHVzZUV4aXN0aW5nOiBDZGtEcmFnUGxhY2Vob2xkZXJ9XSxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0RyYWdQbGFjZWhvbGRlcjxUID0gYW55PiB7XHJcbiAgLyoqIENvbnRleHQgZGF0YSB0byBiZSBhZGRlZCB0byB0aGUgcGxhY2Vob2xkZXIgdGVtcGxhdGUgaW5zdGFuY2UuICovXHJcbiAgQElucHV0KCkgZGF0YTogVDtcclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPFQ+KSB7fVxyXG59XHJcbiJdfQ==