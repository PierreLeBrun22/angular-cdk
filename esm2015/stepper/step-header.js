/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef } from '@angular/core';
export class CdkStepHeader {
    constructor(_elementRef) {
        this._elementRef = _elementRef;
    }
    /** Focuses the step header. */
    focus() {
        this._elementRef.nativeElement.focus();
    }
}
CdkStepHeader.decorators = [
    { type: Directive, args: [{
                selector: '[cdkStepHeader]',
                host: {
                    'role': 'tab',
                },
            },] }
];
CdkStepHeader.ctorParameters = () => [
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcC1oZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3N0ZXBwZXIvc3RlcC1oZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFVcEQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsWUFBbUIsV0FBb0M7UUFBcEMsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO0lBQUcsQ0FBQztJQUUzRCwrQkFBK0I7SUFDL0IsS0FBSztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3pDLENBQUM7OztZQVpGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLEtBQUs7aUJBQ2Q7YUFDRjs7O1lBVGtCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RGlyZWN0aXZlLCBFbGVtZW50UmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtGb2N1c2FibGVPcHRpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9hMTF5JztcclxuXHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtTdGVwSGVhZGVyXScsXHJcbiAgaG9zdDoge1xyXG4gICAgJ3JvbGUnOiAndGFiJyxcclxuICB9LFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrU3RlcEhlYWRlciBpbXBsZW1lbnRzIEZvY3VzYWJsZU9wdGlvbiB7XHJcbiAgY29uc3RydWN0b3IocHVibGljIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50Pikge31cclxuXHJcbiAgLyoqIEZvY3VzZXMgdGhlIHN0ZXAgaGVhZGVyLiAqL1xyXG4gIGZvY3VzKCkge1xyXG4gICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==