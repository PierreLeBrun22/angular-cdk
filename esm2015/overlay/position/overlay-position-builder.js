/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { OverlayContainer } from '../overlay-container';
import { ConnectedPositionStrategy } from './connected-position-strategy';
import { FlexibleConnectedPositionStrategy, } from './flexible-connected-position-strategy';
import { GlobalPositionStrategy } from './global-position-strategy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/common";
import * as i3 from "@angular/cdk/platform";
import * as i4 from "../overlay-container";
/** Builder for overlay position strategy. */
export class OverlayPositionBuilder {
    constructor(_viewportRuler, _document, _platform, _overlayContainer) {
        this._viewportRuler = _viewportRuler;
        this._document = _document;
        this._platform = _platform;
        this._overlayContainer = _overlayContainer;
    }
    /**
     * Creates a global position strategy.
     */
    global() {
        return new GlobalPositionStrategy();
    }
    /**
     * Creates a relative position strategy.
     * @param elementRef
     * @param originPos
     * @param overlayPos
     * @deprecated Use `flexibleConnectedTo` instead.
     * @breaking-change 8.0.0
     */
    connectedTo(elementRef, originPos, overlayPos) {
        return new ConnectedPositionStrategy(originPos, overlayPos, elementRef, this._viewportRuler, this._document, this._platform, this._overlayContainer);
    }
    /**
     * Creates a flexible position strategy.
     * @param origin Origin relative to which to position the overlay.
     */
    flexibleConnectedTo(origin) {
        return new FlexibleConnectedPositionStrategy(origin, this._viewportRuler, this._document, this._platform, this._overlayContainer);
    }
}
OverlayPositionBuilder.ɵprov = i0.ɵɵdefineInjectable({ factory: function OverlayPositionBuilder_Factory() { return new OverlayPositionBuilder(i0.ɵɵinject(i1.ViewportRuler), i0.ɵɵinject(i2.DOCUMENT), i0.ɵɵinject(i3.Platform), i0.ɵɵinject(i4.OverlayContainer)); }, token: OverlayPositionBuilder, providedIn: "root" });
OverlayPositionBuilder.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
OverlayPositionBuilder.ctorParameters = () => [
    { type: ViewportRuler },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform },
    { type: OverlayContainer }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1wb3NpdGlvbi1idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL292ZXJsYXktcG9zaXRpb24tYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQWEsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUd0RCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQ0wsaUNBQWlDLEdBRWxDLE1BQU0sd0NBQXdDLENBQUM7QUFDaEQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7Ozs7OztBQUdsRSw2Q0FBNkM7QUFFN0MsTUFBTSxPQUFPLHNCQUFzQjtJQUNqQyxZQUNZLGNBQTZCLEVBQTRCLFNBQWMsRUFDdkUsU0FBbUIsRUFBVSxpQkFBbUM7UUFEaEUsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFBNEIsY0FBUyxHQUFULFNBQVMsQ0FBSztRQUN2RSxjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQVUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtJQUFHLENBQUM7SUFFaEY7O09BRUc7SUFDSCxNQUFNO1FBQ0osT0FBTyxJQUFJLHNCQUFzQixFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxXQUFXLENBQ1AsVUFBc0IsRUFDdEIsU0FBbUMsRUFDbkMsVUFBcUM7UUFDdkMsT0FBTyxJQUFJLHlCQUF5QixDQUNoQyxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFDdEYsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1CQUFtQixDQUFDLE1BQStDO1FBRWpFLE9BQU8sSUFBSSxpQ0FBaUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUNwRixJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQzlDLENBQUM7Ozs7WUF0Q0YsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7O1lBaEJ4QixhQUFhOzRDQW1CeUIsTUFBTSxTQUFDLFFBQVE7WUFwQnJELFFBQVE7WUFLUixnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0LCBJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7T3ZlcmxheUNvbnRhaW5lcn0gZnJvbSAnLi4vb3ZlcmxheS1jb250YWluZXInO1xyXG5cclxuaW1wb3J0IHtPcmlnaW5Db25uZWN0aW9uUG9zaXRpb24sIE92ZXJsYXlDb25uZWN0aW9uUG9zaXRpb259IGZyb20gJy4vY29ubmVjdGVkLXBvc2l0aW9uJztcclxuaW1wb3J0IHtDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICcuL2Nvbm5lY3RlZC1wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7XHJcbiAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LFxyXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneU9yaWdpbixcclxufSBmcm9tICcuL2ZsZXhpYmxlLWNvbm5lY3RlZC1wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7R2xvYmFsUG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9nbG9iYWwtcG9zaXRpb24tc3RyYXRlZ3knO1xyXG5cclxuXHJcbi8qKiBCdWlsZGVyIGZvciBvdmVybGF5IHBvc2l0aW9uIHN0cmF0ZWd5LiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIE92ZXJsYXlQb3NpdGlvbkJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLCBASW5qZWN0KERPQ1VNRU5UKSBwcml2YXRlIF9kb2N1bWVudDogYW55LFxyXG4gICAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sIHByaXZhdGUgX292ZXJsYXlDb250YWluZXI6IE92ZXJsYXlDb250YWluZXIpIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBnbG9iYWwgcG9zaXRpb24gc3RyYXRlZ3kuXHJcbiAgICovXHJcbiAgZ2xvYmFsKCk6IEdsb2JhbFBvc2l0aW9uU3RyYXRlZ3kge1xyXG4gICAgcmV0dXJuIG5ldyBHbG9iYWxQb3NpdGlvblN0cmF0ZWd5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcmVsYXRpdmUgcG9zaXRpb24gc3RyYXRlZ3kuXHJcbiAgICogQHBhcmFtIGVsZW1lbnRSZWZcclxuICAgKiBAcGFyYW0gb3JpZ2luUG9zXHJcbiAgICogQHBhcmFtIG92ZXJsYXlQb3NcclxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYGZsZXhpYmxlQ29ubmVjdGVkVG9gIGluc3RlYWQuXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxyXG4gICAqL1xyXG4gIGNvbm5lY3RlZFRvKFxyXG4gICAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxyXG4gICAgICBvcmlnaW5Qb3M6IE9yaWdpbkNvbm5lY3Rpb25Qb3NpdGlvbixcclxuICAgICAgb3ZlcmxheVBvczogT3ZlcmxheUNvbm5lY3Rpb25Qb3NpdGlvbik6IENvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3kge1xyXG4gICAgcmV0dXJuIG5ldyBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KFxyXG4gICAgICAgIG9yaWdpblBvcywgb3ZlcmxheVBvcywgZWxlbWVudFJlZiwgdGhpcy5fdmlld3BvcnRSdWxlciwgdGhpcy5fZG9jdW1lbnQsIHRoaXMuX3BsYXRmb3JtLFxyXG4gICAgICAgIHRoaXMuX292ZXJsYXlDb250YWluZXIpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGZsZXhpYmxlIHBvc2l0aW9uIHN0cmF0ZWd5LlxyXG4gICAqIEBwYXJhbSBvcmlnaW4gT3JpZ2luIHJlbGF0aXZlIHRvIHdoaWNoIHRvIHBvc2l0aW9uIHRoZSBvdmVybGF5LlxyXG4gICAqL1xyXG4gIGZsZXhpYmxlQ29ubmVjdGVkVG8ob3JpZ2luOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3lPcmlnaW4pOlxyXG4gICAgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcclxuICAgIHJldHVybiBuZXcgRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5KG9yaWdpbiwgdGhpcy5fdmlld3BvcnRSdWxlciwgdGhpcy5fZG9jdW1lbnQsXHJcbiAgICAgICAgdGhpcy5fcGxhdGZvcm0sIHRoaXMuX292ZXJsYXlDb250YWluZXIpO1xyXG4gIH1cclxuXHJcbn1cclxuIl19