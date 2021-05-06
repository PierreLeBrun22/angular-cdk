/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, TemplateRef } from '@angular/core';
/** Context provided to the tree node component. */
export class CdkTreeNodeOutletContext {
    constructor(data) {
        this.$implicit = data;
    }
}
/**
 * Data node definition for the CdkTree.
 * Captures the node's template and a when predicate that describes when this node should be used.
 */
export class CdkTreeNodeDef {
    /** @docs-private */
    constructor(template) {
        this.template = template;
    }
}
CdkTreeNodeDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkTreeNodeDef]',
                inputs: [
                    'when: cdkTreeNodeDefWhen'
                ],
            },] }
];
CdkTreeNodeDef.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3JELG1EQUFtRDtBQUNuRCxNQUFNLE9BQU8sd0JBQXdCO0lBYW5DLFlBQVksSUFBTztRQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0NBQ0Y7QUFFRDs7O0dBR0c7QUFPSCxNQUFNLE9BQU8sY0FBYztJQVV6QixvQkFBb0I7SUFDcEIsWUFBbUIsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDOzs7WUFqQmxELFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixNQUFNLEVBQUU7b0JBQ04sMEJBQTBCO2lCQUMzQjthQUNGOzs7WUEvQmtCLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RGlyZWN0aXZlLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5cclxuLyoqIENvbnRleHQgcHJvdmlkZWQgdG8gdGhlIHRyZWUgbm9kZSBjb21wb25lbnQuICovXHJcbmV4cG9ydCBjbGFzcyBDZGtUcmVlTm9kZU91dGxldENvbnRleHQ8VD4ge1xyXG4gIC8qKiBEYXRhIGZvciB0aGUgbm9kZS4gKi9cclxuICAkaW1wbGljaXQ6IFQ7XHJcblxyXG4gIC8qKiBEZXB0aCBvZiB0aGUgbm9kZS4gKi9cclxuICBsZXZlbDogbnVtYmVyO1xyXG5cclxuICAvKiogSW5kZXggbG9jYXRpb24gb2YgdGhlIG5vZGUuICovXHJcbiAgaW5kZXg/OiBudW1iZXI7XHJcblxyXG4gIC8qKiBMZW5ndGggb2YgdGhlIG51bWJlciBvZiB0b3RhbCBkYXRhTm9kZXMuICovXHJcbiAgY291bnQ/OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKGRhdGE6IFQpIHtcclxuICAgIHRoaXMuJGltcGxpY2l0ID0gZGF0YTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEYXRhIG5vZGUgZGVmaW5pdGlvbiBmb3IgdGhlIENka1RyZWUuXHJcbiAqIENhcHR1cmVzIHRoZSBub2RlJ3MgdGVtcGxhdGUgYW5kIGEgd2hlbiBwcmVkaWNhdGUgdGhhdCBkZXNjcmliZXMgd2hlbiB0aGlzIG5vZGUgc2hvdWxkIGJlIHVzZWQuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtUcmVlTm9kZURlZl0nLFxyXG4gIGlucHV0czogW1xyXG4gICAgJ3doZW46IGNka1RyZWVOb2RlRGVmV2hlbidcclxuICBdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrVHJlZU5vZGVEZWY8VD4ge1xyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgc2hvdWxkIHJldHVybiB0cnVlIGlmIHRoaXMgbm9kZSB0ZW1wbGF0ZSBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHByb3ZpZGVkIG5vZGVcclxuICAgKiBkYXRhIGFuZCBpbmRleC4gSWYgbGVmdCB1bmRlZmluZWQsIHRoaXMgbm9kZSB3aWxsIGJlIGNvbnNpZGVyZWQgdGhlIGRlZmF1bHQgbm9kZSB0ZW1wbGF0ZSB0b1xyXG4gICAqIHVzZSB3aGVuIG5vIG90aGVyIHdoZW4gZnVuY3Rpb25zIHJldHVybiB0cnVlIGZvciB0aGUgZGF0YS5cclxuICAgKiBGb3IgZXZlcnkgbm9kZSwgdGhlcmUgbXVzdCBiZSBhdCBsZWFzdCBvbmUgd2hlbiBmdW5jdGlvbiB0aGF0IHBhc3NlcyBvciBhbiB1bmRlZmluZWQgdG9cclxuICAgKiBkZWZhdWx0LlxyXG4gICAqL1xyXG4gIHdoZW46IChpbmRleDogbnVtYmVyLCBub2RlRGF0YTogVCkgPT4gYm9vbGVhbjtcclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4pIHt9XHJcbn1cclxuIl19