/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input, InjectionToken } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
/**
 * Injection token that can be used to reference instances of `CdkDropListGroup`. It serves as
 * alternative token to the actual `CdkDropListGroup` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST_GROUP = new InjectionToken('CdkDropListGroup');
/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
export class CdkDropListGroup {
    constructor() {
        /** Drop lists registered inside the group. */
        this._items = new Set();
        this._disabled = false;
    }
    /** Whether starting a dragging sequence from inside this group is disabled. */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    ngOnDestroy() {
        this._items.clear();
    }
}
CdkDropListGroup.decorators = [
    { type: Directive, args: [{
                selector: '[cdkDropListGroup]',
                exportAs: 'cdkDropListGroup',
                providers: [{ provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup }],
            },] }
];
CdkDropListGroup.propDecorators = {
    disabled: [{ type: Input, args: ['cdkDropListGroupDisabled',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcC1saXN0LWdyb3VwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcm9wLWxpc3QtZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBYSxLQUFLLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzFFLE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTFFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FDNUIsSUFBSSxjQUFjLENBQTRCLGtCQUFrQixDQUFDLENBQUM7QUFFdEU7Ozs7O0dBS0c7QUFNSCxNQUFNLE9BQU8sZ0JBQWdCO0lBTDdCO1FBTUUsOENBQThDO1FBQ3JDLFdBQU0sR0FBRyxJQUFJLEdBQUcsRUFBSyxDQUFDO1FBUXZCLGNBQVMsR0FBRyxLQUFLLENBQUM7SUFPNUIsQ0FBQztJQWJDLCtFQUErRTtJQUMvRSxJQUNJLFFBQVEsS0FBYyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ2xELElBQUksUUFBUSxDQUFDLEtBQWM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBR0QsV0FBVztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDdEIsQ0FBQzs7O1lBbkJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQzthQUMzRTs7O3VCQU1FLEtBQUssU0FBQywwQkFBMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RGlyZWN0aXZlLCBPbkRlc3Ryb3ksIElucHV0LCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcblxyXG4vKipcclxuICogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVmZXJlbmNlIGluc3RhbmNlcyBvZiBgQ2RrRHJvcExpc3RHcm91cGAuIEl0IHNlcnZlcyBhc1xyXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBDZGtEcm9wTGlzdEdyb3VwYCBjbGFzcyB3aGljaCBjb3VsZCBjYXVzZSB1bm5lY2Vzc2FyeVxyXG4gKiByZXRlbnRpb24gb2YgdGhlIGNsYXNzIGFuZCBpdHMgZGlyZWN0aXZlIG1ldGFkYXRhLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENES19EUk9QX0xJU1RfR1JPVVAgPVxyXG4gICAgbmV3IEluamVjdGlvblRva2VuPENka0Ryb3BMaXN0R3JvdXA8dW5rbm93bj4+KCdDZGtEcm9wTGlzdEdyb3VwJyk7XHJcblxyXG4vKipcclxuICogRGVjbGFyYXRpdmVseSBjb25uZWN0cyBzaWJsaW5nIGBjZGtEcm9wTGlzdGAgaW5zdGFuY2VzIHRvZ2V0aGVyLiBBbGwgb2YgdGhlIGBjZGtEcm9wTGlzdGBcclxuICogZWxlbWVudHMgdGhhdCBhcmUgcGxhY2VkIGluc2lkZSBhIGBjZGtEcm9wTGlzdEdyb3VwYCB3aWxsIGJlIGNvbm5lY3RlZCB0byBlYWNoIG90aGVyXHJcbiAqIGF1dG9tYXRpY2FsbHkuIENhbiBiZSB1c2VkIGFzIGFuIGFsdGVybmF0aXZlIHRvIHRoZSBgY2RrRHJvcExpc3RDb25uZWN0ZWRUb2AgaW5wdXRcclxuICogZnJvbSBgY2RrRHJvcExpc3RgLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrRHJvcExpc3RHcm91cF0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrRHJvcExpc3RHcm91cCcsXHJcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19EUk9QX0xJU1RfR1JPVVAsIHVzZUV4aXN0aW5nOiBDZGtEcm9wTGlzdEdyb3VwfV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtEcm9wTGlzdEdyb3VwPFQ+IGltcGxlbWVudHMgT25EZXN0cm95IHtcclxuICAvKiogRHJvcCBsaXN0cyByZWdpc3RlcmVkIGluc2lkZSB0aGUgZ3JvdXAuICovXHJcbiAgcmVhZG9ubHkgX2l0ZW1zID0gbmV3IFNldDxUPigpO1xyXG5cclxuICAvKiogV2hldGhlciBzdGFydGluZyBhIGRyYWdnaW5nIHNlcXVlbmNlIGZyb20gaW5zaWRlIHRoaXMgZ3JvdXAgaXMgZGlzYWJsZWQuICovXHJcbiAgQElucHV0KCdjZGtEcm9wTGlzdEdyb3VwRGlzYWJsZWQnKVxyXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2Rpc2FibGVkOyB9XHJcbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgfVxyXG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5faXRlbXMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xyXG59XHJcbiJdfQ==