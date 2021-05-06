/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BidiModule } from '@angular/cdk/bidi';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { CdkFixedSizeVirtualScroll } from './fixed-size-virtual-scroll';
import { CdkScrollable } from './scrollable';
import { CdkVirtualForOf } from './virtual-for-of';
import { CdkVirtualScrollViewport } from './virtual-scroll-viewport';
export class CdkScrollableModule {
}
CdkScrollableModule.decorators = [
    { type: NgModule, args: [{
                exports: [CdkScrollable],
                declarations: [CdkScrollable]
            },] }
];
/**
 * @docs-primary-export
 */
export class ScrollingModule {
}
ScrollingModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    BidiModule,
                    PlatformModule,
                    CdkScrollableModule
                ],
                exports: [
                    BidiModule,
                    CdkScrollableModule,
                    CdkFixedSizeVirtualScroll,
                    CdkVirtualForOf,
                    CdkVirtualScrollViewport,
                ],
                declarations: [
                    CdkFixedSizeVirtualScroll,
                    CdkVirtualForOf,
                    CdkVirtualScrollViewport,
                ],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3Njcm9sbGluZy1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDM0MsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBTW5FLE1BQU0sT0FBTyxtQkFBbUI7OztZQUovQixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2dCQUN4QixZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7YUFDOUI7O0FBR0Q7O0dBRUc7QUFvQkgsTUFBTSxPQUFPLGVBQWU7OztZQW5CM0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRTtvQkFDUCxVQUFVO29CQUNWLGNBQWM7b0JBQ2QsbUJBQW1CO2lCQUNwQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsVUFBVTtvQkFDVixtQkFBbUI7b0JBQ25CLHlCQUF5QjtvQkFDekIsZUFBZTtvQkFDZix3QkFBd0I7aUJBQ3pCO2dCQUNELFlBQVksRUFBRTtvQkFDWix5QkFBeUI7b0JBQ3pCLGVBQWU7b0JBQ2Ysd0JBQXdCO2lCQUN6QjthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0JpZGlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHtQbGF0Zm9ybU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbH0gZnJvbSAnLi9maXhlZC1zaXplLXZpcnR1YWwtc2Nyb2xsJztcclxuaW1wb3J0IHtDZGtTY3JvbGxhYmxlfSBmcm9tICcuL3Njcm9sbGFibGUnO1xyXG5pbXBvcnQge0Nka1ZpcnR1YWxGb3JPZn0gZnJvbSAnLi92aXJ0dWFsLWZvci1vZic7XHJcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZXhwb3J0czogW0Nka1Njcm9sbGFibGVdLFxyXG4gIGRlY2xhcmF0aW9uczogW0Nka1Njcm9sbGFibGVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtTY3JvbGxhYmxlTW9kdWxlIHt9XHJcblxyXG4vKipcclxuICogQGRvY3MtcHJpbWFyeS1leHBvcnRcclxuICovXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW1xyXG4gICAgQmlkaU1vZHVsZSxcclxuICAgIFBsYXRmb3JtTW9kdWxlLFxyXG4gICAgQ2RrU2Nyb2xsYWJsZU1vZHVsZVxyXG4gIF0sXHJcbiAgZXhwb3J0czogW1xyXG4gICAgQmlkaU1vZHVsZSxcclxuICAgIENka1Njcm9sbGFibGVNb2R1bGUsXHJcbiAgICBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsLFxyXG4gICAgQ2RrVmlydHVhbEZvck9mLFxyXG4gICAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxyXG4gIF0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsLFxyXG4gICAgQ2RrVmlydHVhbEZvck9mLFxyXG4gICAgQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0LFxyXG4gIF0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxpbmdNb2R1bGUge31cclxuIl19