/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, InjectionToken, Optional, ViewContainerRef, } from '@angular/core';
/**
 * Injection token used to provide a `CdkTreeNode` to its outlet.
 * Used primarily to avoid circular imports.
 * @docs-private
 */
export const CDK_TREE_NODE_OUTLET_NODE = new InjectionToken('CDK_TREE_NODE_OUTLET_NODE');
/**
 * Outlet for nested CdkNode. Put `[cdkTreeNodeOutlet]` on a tag to place children dataNodes
 * inside the outlet.
 */
export class CdkTreeNodeOutlet {
    constructor(viewContainer, _node) {
        this.viewContainer = viewContainer;
        this._node = _node;
    }
}
CdkTreeNodeOutlet.decorators = [
    { type: Directive, args: [{
                selector: '[cdkTreeNodeOutlet]'
            },] }
];
CdkTreeNodeOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TREE_NODE_OUTLET_NODE,] }, { type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90cmVlL291dGxldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxPQUFPLEVBQ0wsU0FBUyxFQUNULE1BQU0sRUFDTixjQUFjLEVBQ2QsUUFBUSxFQUNSLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUV2Qjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxjQUFjLENBQUssMkJBQTJCLENBQUMsQ0FBQztBQUU3Rjs7O0dBR0c7QUFJSCxNQUFNLE9BQU8saUJBQWlCO0lBQzVCLFlBQ1csYUFBK0IsRUFDZ0IsS0FBVztRQUQxRCxrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFDZ0IsVUFBSyxHQUFMLEtBQUssQ0FBTTtJQUFHLENBQUM7OztZQU4xRSxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLHFCQUFxQjthQUNoQzs7O1lBaEJDLGdCQUFnQjs0Q0FvQlgsTUFBTSxTQUFDLHlCQUF5QixjQUFHLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgSW5qZWN0LFxyXG4gIEluamVjdGlvblRva2VuLFxyXG4gIE9wdGlvbmFsLFxyXG4gIFZpZXdDb250YWluZXJSZWYsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG4vKipcclxuICogSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gcHJvdmlkZSBhIGBDZGtUcmVlTm9kZWAgdG8gaXRzIG91dGxldC5cclxuICogVXNlZCBwcmltYXJpbHkgdG8gYXZvaWQgY2lyY3VsYXIgaW1wb3J0cy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENES19UUkVFX05PREVfT1VUTEVUX05PREUgPSBuZXcgSW5qZWN0aW9uVG9rZW48e30+KCdDREtfVFJFRV9OT0RFX09VVExFVF9OT0RFJyk7XHJcblxyXG4vKipcclxuICogT3V0bGV0IGZvciBuZXN0ZWQgQ2RrTm9kZS4gUHV0IGBbY2RrVHJlZU5vZGVPdXRsZXRdYCBvbiBhIHRhZyB0byBwbGFjZSBjaGlsZHJlbiBkYXRhTm9kZXNcclxuICogaW5zaWRlIHRoZSBvdXRsZXQuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtUcmVlTm9kZU91dGxldF0nXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtUcmVlTm9kZU91dGxldCB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAgIHB1YmxpYyB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgICBASW5qZWN0KENES19UUkVFX05PREVfT1VUTEVUX05PREUpIEBPcHRpb25hbCgpIHB1YmxpYyBfbm9kZT86IGFueSkge31cclxufVxyXG4iXX0=