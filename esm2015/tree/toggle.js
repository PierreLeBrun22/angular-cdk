/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, HostListener, Input } from '@angular/core';
import { CdkTree, CdkTreeNode } from './tree';
/**
 * Node toggle to expand/collapse the node.
 */
export class CdkTreeNodeToggle {
    constructor(_tree, _treeNode) {
        this._tree = _tree;
        this._treeNode = _treeNode;
        this._recursive = false;
    }
    /** Whether expand/collapse the node recursively. */
    get recursive() { return this._recursive; }
    set recursive(value) { this._recursive = coerceBooleanProperty(value); }
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _toggle(event) {
        this.recursive
            ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
            : this._tree.treeControl.toggle(this._treeNode.data);
        event.stopPropagation();
    }
}
CdkTreeNodeToggle.decorators = [
    { type: Directive, args: [{ selector: '[cdkTreeNodeToggle]' },] }
];
CdkTreeNodeToggle.ctorParameters = () => [
    { type: CdkTree },
    { type: CdkTreeNode }
];
CdkTreeNodeToggle.propDecorators = {
    recursive: [{ type: Input, args: ['cdkTreeNodeToggleRecursive',] }],
    _toggle: [{ type: HostListener, args: ['click', ['$event'],] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9nZ2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90cmVlL3RvZ2dsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0QsT0FBTyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUM7O0dBRUc7QUFFSCxNQUFNLE9BQU8saUJBQWlCO0lBTzVCLFlBQXNCLEtBQW9CLEVBQ3BCLFNBQTRCO1FBRDVCLFVBQUssR0FBTCxLQUFLLENBQWU7UUFDcEIsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFIeEMsZUFBVSxHQUFHLEtBQUssQ0FBQztJQUd3QixDQUFDO0lBUHRELG9EQUFvRDtJQUNwRCxJQUNJLFNBQVMsS0FBYyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3BELElBQUksU0FBUyxDQUFDLEtBQWMsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQU1qRixvRkFBb0Y7SUFDcEYsb0ZBQW9GO0lBQ3BGLGtDQUFrQztJQUNsQyxrRkFBa0Y7SUFDbEYseURBQXlEO0lBRXpELE9BQU8sQ0FBQyxLQUFZO1FBQ2xCLElBQUksQ0FBQyxTQUFTO1lBQ1osQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQy9ELENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2RCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDMUIsQ0FBQzs7O1lBdkJGLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBQzs7O1lBTHBDLE9BQU87WUFBRSxXQUFXOzs7d0JBUXpCLEtBQUssU0FBQyw0QkFBNEI7c0JBYWxDLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7RGlyZWN0aXZlLCBIb3N0TGlzdGVuZXIsIElucHV0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7Q2RrVHJlZSwgQ2RrVHJlZU5vZGV9IGZyb20gJy4vdHJlZSc7XHJcblxyXG4vKipcclxuICogTm9kZSB0b2dnbGUgdG8gZXhwYW5kL2NvbGxhcHNlIHRoZSBub2RlLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbY2RrVHJlZU5vZGVUb2dnbGVdJ30pXHJcbmV4cG9ydCBjbGFzcyBDZGtUcmVlTm9kZVRvZ2dsZTxULCBLID0gVD4ge1xyXG4gIC8qKiBXaGV0aGVyIGV4cGFuZC9jb2xsYXBzZSB0aGUgbm9kZSByZWN1cnNpdmVseS4gKi9cclxuICBASW5wdXQoJ2Nka1RyZWVOb2RlVG9nZ2xlUmVjdXJzaXZlJylcclxuICBnZXQgcmVjdXJzaXZlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcmVjdXJzaXZlOyB9XHJcbiAgc2V0IHJlY3Vyc2l2ZSh2YWx1ZTogYm9vbGVhbikgeyB0aGlzLl9yZWN1cnNpdmUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XHJcbiAgcHJvdGVjdGVkIF9yZWN1cnNpdmUgPSBmYWxzZTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxyXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfdHJlZU5vZGU6IENka1RyZWVOb2RlPFQsIEs+KSB7fVxyXG5cclxuICAvLyBXZSBoYXZlIHRvIHVzZSBhIGBIb3N0TGlzdGVuZXJgIGhlcmUgaW4gb3JkZXIgdG8gc3VwcG9ydCBib3RoIEl2eSBhbmQgVmlld0VuZ2luZS5cclxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBiaW5kaW5ncyB3aWxsIGJlIG1lcmdlZCB3aGVuIHRoaXMgY2xhc3MgaXMgZXh0ZW5kZWQsIHdoZXJlYXMgaW5cclxuICAvLyBWaWV3RW5naW5lIHRoZXkncmUgb3ZlcndyaXR0ZW4uXHJcbiAgLy8gVE9ETyhjcmlzYmV0byk6IHdlIG1vdmUgdGhpcyBiYWNrIGludG8gYGhvc3RgIG9uY2UgSXZ5IGlzIHR1cm5lZCBvbiBieSBkZWZhdWx0LlxyXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxyXG4gIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQnXSlcclxuICBfdG9nZ2xlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZWN1cnNpdmVcclxuICAgICAgPyB0aGlzLl90cmVlLnRyZWVDb250cm9sLnRvZ2dsZURlc2NlbmRhbnRzKHRoaXMuX3RyZWVOb2RlLmRhdGEpXHJcbiAgICAgIDogdGhpcy5fdHJlZS50cmVlQ29udHJvbC50b2dnbGUodGhpcy5fdHJlZU5vZGUuZGF0YSk7XHJcblxyXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcmVjdXJzaXZlOiBCb29sZWFuSW5wdXQ7XHJcbn1cclxuIl19