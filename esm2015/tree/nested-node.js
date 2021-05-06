/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentChildren, Directive, ElementRef, IterableDiffers, QueryList, } from '@angular/core';
import { isObservable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CDK_TREE_NODE_OUTLET_NODE, CdkTreeNodeOutlet } from './outlet';
import { CdkTree, CdkTreeNode } from './tree';
import { getTreeControlFunctionsMissingError } from './tree-errors';
/**
 * Nested node is a child of `<cdk-tree>`. It works with nested tree.
 * By using `cdk-nested-tree-node` component in tree node template, children of the parent node will
 * be added in the `cdkTreeNodeOutlet` in tree node template.
 * The children of node will be automatically added to `cdkTreeNodeOutlet`.
 */
export class CdkNestedTreeNode extends CdkTreeNode {
    constructor(_elementRef, _tree, _differs) {
        super(_elementRef, _tree);
        this._elementRef = _elementRef;
        this._tree = _tree;
        this._differs = _differs;
        // The classes are directly added here instead of in the host property because classes on
        // the host property are not inherited with View Engine. It is not set as a @HostBinding because
        // it is not set by the time it's children nodes try to read the class from it.
        // TODO: move to host after View Engine deprecation
        this._elementRef.nativeElement.classList.add('cdk-nested-tree-node');
    }
    ngAfterContentInit() {
        this._dataDiffer = this._differs.find([]).create(this._tree.trackBy);
        if (!this._tree.treeControl.getChildren && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTreeControlFunctionsMissingError();
        }
        const childrenNodes = this._tree.treeControl.getChildren(this.data);
        if (Array.isArray(childrenNodes)) {
            this.updateChildrenNodes(childrenNodes);
        }
        else if (isObservable(childrenNodes)) {
            childrenNodes.pipe(takeUntil(this._destroyed))
                .subscribe(result => this.updateChildrenNodes(result));
        }
        this.nodeOutlet.changes.pipe(takeUntil(this._destroyed))
            .subscribe(() => this.updateChildrenNodes());
    }
    // This is a workaround for https://github.com/angular/angular/issues/23091
    // In aot mode, the lifecycle hooks from parent class are not called.
    ngOnInit() {
        super.ngOnInit();
    }
    ngDoCheck() {
        super.ngDoCheck();
    }
    ngOnDestroy() {
        this._clear();
        super.ngOnDestroy();
    }
    /** Add children dataNodes to the NodeOutlet */
    updateChildrenNodes(children) {
        const outlet = this._getNodeOutlet();
        if (children) {
            this._children = children;
        }
        if (outlet && this._children) {
            const viewContainer = outlet.viewContainer;
            this._tree.renderNodeChanges(this._children, this._dataDiffer, viewContainer, this._data);
        }
        else {
            // Reset the data differ if there's no children nodes displayed
            this._dataDiffer.diff([]);
        }
    }
    /** Clear the children dataNodes. */
    _clear() {
        const outlet = this._getNodeOutlet();
        if (outlet) {
            outlet.viewContainer.clear();
            this._dataDiffer.diff([]);
        }
    }
    /** Gets the outlet for the current node. */
    _getNodeOutlet() {
        const outlets = this.nodeOutlet;
        // Note that since we use `descendants: true` on the query, we have to ensure
        // that we don't pick up the outlet of a child node by accident.
        return outlets && outlets.find(outlet => !outlet._node || outlet._node === this);
    }
}
CdkNestedTreeNode.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-nested-tree-node',
                exportAs: 'cdkNestedTreeNode',
                inputs: ['role', 'disabled', 'tabIndex'],
                providers: [
                    { provide: CdkTreeNode, useExisting: CdkNestedTreeNode },
                    { provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: CdkNestedTreeNode }
                ]
            },] }
];
CdkNestedTreeNode.ctorParameters = () => [
    { type: ElementRef },
    { type: CdkTree },
    { type: IterableDiffers }
];
CdkNestedTreeNode.propDecorators = {
    nodeOutlet: [{ type: ContentChildren, args: [CdkTreeNodeOutlet, {
                    // We need to use `descendants: true`, because Ivy will no longer match
                    // indirect descendants if it's left as false.
                    descendants: true
                },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkLW5vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvbmVzdGVkLW5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUVMLGVBQWUsRUFDZixTQUFTLEVBRVQsVUFBVSxFQUVWLGVBQWUsRUFHZixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekMsT0FBTyxFQUFDLHlCQUF5QixFQUFFLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUVsRTs7Ozs7R0FLRztBQVVILE1BQU0sT0FBTyxpQkFBNEIsU0FBUSxXQUFpQjtJQWdCaEUsWUFBc0IsV0FBb0MsRUFDcEMsS0FBb0IsRUFDcEIsUUFBeUI7UUFDN0MsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUhOLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxVQUFLLEdBQUwsS0FBSyxDQUFlO1FBQ3BCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBRTdDLHlGQUF5RjtRQUN6RixnR0FBZ0c7UUFDaEcsK0VBQStFO1FBQy9FLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0s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QUUsbUJBQW1CO2dCQUM3QixNQUFNLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQztnQkFDeEMsU0FBUyxFQUFFO29CQUNULEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUM7b0JBQ3RELEVBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBQztpQkFDckU7YUFDRjs7O1lBNUJDLFVBQVU7WUFXSixPQUFPO1lBVGIsZUFBZTs7O3lCQW9DZCxlQUFlLFNBQUMsaUJBQWlCLEVBQUU7b0JBQ2xDLHVFQUF1RTtvQkFDdkUsOENBQThDO29CQUM5QyxXQUFXLEVBQUUsSUFBSTtpQkFDbEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuaW1wb3J0IHtcclxuICBBZnRlckNvbnRlbnRJbml0LFxyXG4gIENvbnRlbnRDaGlsZHJlbixcclxuICBEaXJlY3RpdmUsXHJcbiAgRG9DaGVjayxcclxuICBFbGVtZW50UmVmLFxyXG4gIEl0ZXJhYmxlRGlmZmVyLFxyXG4gIEl0ZXJhYmxlRGlmZmVycyxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIFF1ZXJ5TGlzdCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtpc09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuaW1wb3J0IHtDREtfVFJFRV9OT0RFX09VVExFVF9OT0RFLCBDZGtUcmVlTm9kZU91dGxldH0gZnJvbSAnLi9vdXRsZXQnO1xyXG5pbXBvcnQge0Nka1RyZWUsIENka1RyZWVOb2RlfSBmcm9tICcuL3RyZWUnO1xyXG5pbXBvcnQge2dldFRyZWVDb250cm9sRnVuY3Rpb25zTWlzc2luZ0Vycm9yfSBmcm9tICcuL3RyZWUtZXJyb3JzJztcclxuXHJcbi8qKlxyXG4gKiBOZXN0ZWQgbm9kZSBpcyBhIGNoaWxkIG9mIGA8Y2RrLXRyZWU+YC4gSXQgd29ya3Mgd2l0aCBuZXN0ZWQgdHJlZS5cclxuICogQnkgdXNpbmcgYGNkay1uZXN0ZWQtdHJlZS1ub2RlYCBjb21wb25lbnQgaW4gdHJlZSBub2RlIHRlbXBsYXRlLCBjaGlsZHJlbiBvZiB0aGUgcGFyZW50IG5vZGUgd2lsbFxyXG4gKiBiZSBhZGRlZCBpbiB0aGUgYGNka1RyZWVOb2RlT3V0bGV0YCBpbiB0cmVlIG5vZGUgdGVtcGxhdGUuXHJcbiAqIFRoZSBjaGlsZHJlbiBvZiBub2RlIHdpbGwgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byBgY2RrVHJlZU5vZGVPdXRsZXRgLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdjZGstbmVzdGVkLXRyZWUtbm9kZScsXHJcbiAgZXhwb3J0QXM6ICdjZGtOZXN0ZWRUcmVlTm9kZScsXHJcbiAgaW5wdXRzOiBbJ3JvbGUnLCAnZGlzYWJsZWQnLCAndGFiSW5kZXgnXSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHtwcm92aWRlOiBDZGtUcmVlTm9kZSwgdXNlRXhpc3Rpbmc6IENka05lc3RlZFRyZWVOb2RlfSxcclxuICAgIHtwcm92aWRlOiBDREtfVFJFRV9OT0RFX09VVExFVF9OT0RFLCB1c2VFeGlzdGluZzogQ2RrTmVzdGVkVHJlZU5vZGV9XHJcbiAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrTmVzdGVkVHJlZU5vZGU8VCwgSyA9IFQ+IGV4dGVuZHMgQ2RrVHJlZU5vZGU8VCwgSz5cclxuICAgIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgRG9DaGVjaywgT25EZXN0cm95LCBPbkluaXQge1xyXG4gIC8qKiBEaWZmZXIgdXNlZCB0byBmaW5kIHRoZSBjaGFuZ2VzIGluIHRoZSBkYXRhIHByb3ZpZGVkIGJ5IHRoZSBkYXRhIHNvdXJjZS4gKi9cclxuICBwcml2YXRlIF9kYXRhRGlmZmVyOiBJdGVyYWJsZURpZmZlcjxUPjtcclxuXHJcbiAgLyoqIFRoZSBjaGlsZHJlbiBkYXRhIGRhdGFOb2RlcyBvZiBjdXJyZW50IG5vZGUuIFRoZXkgd2lsbCBiZSBwbGFjZWQgaW4gYENka1RyZWVOb2RlT3V0bGV0YC4gKi9cclxuICBwcm90ZWN0ZWQgX2NoaWxkcmVuOiBUW107XHJcblxyXG4gIC8qKiBUaGUgY2hpbGRyZW4gbm9kZSBwbGFjZWhvbGRlci4gKi9cclxuICBAQ29udGVudENoaWxkcmVuKENka1RyZWVOb2RlT3V0bGV0LCB7XHJcbiAgICAvLyBXZSBuZWVkIHRvIHVzZSBgZGVzY2VuZGFudHM6IHRydWVgLCBiZWNhdXNlIEl2eSB3aWxsIG5vIGxvbmdlciBtYXRjaFxyXG4gICAgLy8gaW5kaXJlY3QgZGVzY2VuZGFudHMgaWYgaXQncyBsZWZ0IGFzIGZhbHNlLlxyXG4gICAgZGVzY2VuZGFudHM6IHRydWVcclxuICB9KVxyXG4gIG5vZGVPdXRsZXQ6IFF1ZXJ5TGlzdDxDZGtUcmVlTm9kZU91dGxldD47XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXHJcbiAgICAgICAgICAgICAgcHJvdGVjdGVkIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxyXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzKSB7XHJcbiAgICBzdXBlcihfZWxlbWVudFJlZiwgX3RyZWUpO1xyXG4gICAgLy8gVGhlIGNsYXNzZXMgYXJlIGRpcmVjdGx5IGFkZGVkIGhlcmUgaW5zdGVhZCBvZiBpbiB0aGUgaG9zdCBwcm9wZXJ0eSBiZWNhdXNlIGNsYXNzZXMgb25cclxuICAgIC8vIHRoZSBob3N0IHByb3BlcnR5IGFyZSBub3QgaW5oZXJpdGVkIHdpdGggVmlldyBFbmdpbmUuIEl0IGlzIG5vdCBzZXQgYXMgYSBASG9zdEJpbmRpbmcgYmVjYXVzZVxyXG4gICAgLy8gaXQgaXMgbm90IHNldCBieSB0aGUgdGltZSBpdCdzIGNoaWxkcmVuIG5vZGVzIHRyeSB0byByZWFkIHRoZSBjbGFzcyBmcm9tIGl0LlxyXG4gICAgLy8gVE9ETzogbW92ZSB0byBob3N0IGFmdGVyIFZpZXcgRW5naW5lIGRlcHJlY2F0aW9uXHJcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2RrLW5lc3RlZC10cmVlLW5vZGUnKTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgIHRoaXMuX2RhdGFEaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQoW10pLmNyZWF0ZSh0aGlzLl90cmVlLnRyYWNrQnkpO1xyXG4gICAgaWYgKCF0aGlzLl90cmVlLnRyZWVDb250cm9sLmdldENoaWxkcmVuICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XHJcbiAgICAgIHRocm93IGdldFRyZWVDb250cm9sRnVuY3Rpb25zTWlzc2luZ0Vycm9yKCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjaGlsZHJlbk5vZGVzID0gdGhpcy5fdHJlZS50cmVlQ29udHJvbC5nZXRDaGlsZHJlbih0aGlzLmRhdGEpO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW5Ob2RlcykpIHtcclxuICAgICAgdGhpcy51cGRhdGVDaGlsZHJlbk5vZGVzKGNoaWxkcmVuTm9kZXMgYXMgVFtdKTtcclxuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKGNoaWxkcmVuTm9kZXMpKSB7XHJcbiAgICAgIGNoaWxkcmVuTm9kZXMucGlwZSh0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcclxuICAgICAgICAuc3Vic2NyaWJlKHJlc3VsdCA9PiB0aGlzLnVwZGF0ZUNoaWxkcmVuTm9kZXMocmVzdWx0KSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVPdXRsZXQuY2hhbmdlcy5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy51cGRhdGVDaGlsZHJlbk5vZGVzKCkpO1xyXG4gIH1cclxuXHJcbiAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzIzMDkxXHJcbiAgLy8gSW4gYW90IG1vZGUsIHRoZSBsaWZlY3ljbGUgaG9va3MgZnJvbSBwYXJlbnQgY2xhc3MgYXJlIG5vdCBjYWxsZWQuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICBzdXBlci5uZ09uSW5pdCgpO1xyXG4gIH1cclxuXHJcbiAgbmdEb0NoZWNrKCkge1xyXG4gICAgc3VwZXIubmdEb0NoZWNrKCk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2NsZWFyKCk7XHJcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFkZCBjaGlsZHJlbiBkYXRhTm9kZXMgdG8gdGhlIE5vZGVPdXRsZXQgKi9cclxuICBwcm90ZWN0ZWQgdXBkYXRlQ2hpbGRyZW5Ob2RlcyhjaGlsZHJlbj86IFRbXSk6IHZvaWQge1xyXG4gICAgY29uc3Qgb3V0bGV0ID0gdGhpcy5fZ2V0Tm9kZU91dGxldCgpO1xyXG4gICAgaWYgKGNoaWxkcmVuKSB7XHJcbiAgICAgIHRoaXMuX2NoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICB9XHJcbiAgICBpZiAob3V0bGV0ICYmIHRoaXMuX2NoaWxkcmVuKSB7XHJcbiAgICAgIGNvbnN0IHZpZXdDb250YWluZXIgPSBvdXRsZXQudmlld0NvbnRhaW5lcjtcclxuICAgICAgdGhpcy5fdHJlZS5yZW5kZXJOb2RlQ2hhbmdlcyh0aGlzLl9jaGlsZHJlbiwgdGhpcy5fZGF0YURpZmZlciwgdmlld0NvbnRhaW5lciwgdGhpcy5fZGF0YSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBSZXNldCB0aGUgZGF0YSBkaWZmZXIgaWYgdGhlcmUncyBubyBjaGlsZHJlbiBub2RlcyBkaXNwbGF5ZWRcclxuICAgICAgdGhpcy5fZGF0YURpZmZlci5kaWZmKFtdKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDbGVhciB0aGUgY2hpbGRyZW4gZGF0YU5vZGVzLiAqL1xyXG4gIHByb3RlY3RlZCBfY2xlYXIoKTogdm9pZCB7XHJcbiAgICBjb25zdCBvdXRsZXQgPSB0aGlzLl9nZXROb2RlT3V0bGV0KCk7XHJcbiAgICBpZiAob3V0bGV0KSB7XHJcbiAgICAgIG91dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XHJcbiAgICAgIHRoaXMuX2RhdGFEaWZmZXIuZGlmZihbXSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgb3V0bGV0IGZvciB0aGUgY3VycmVudCBub2RlLiAqL1xyXG4gIHByaXZhdGUgX2dldE5vZGVPdXRsZXQoKSB7XHJcbiAgICBjb25zdCBvdXRsZXRzID0gdGhpcy5ub2RlT3V0bGV0O1xyXG5cclxuICAgIC8vIE5vdGUgdGhhdCBzaW5jZSB3ZSB1c2UgYGRlc2NlbmRhbnRzOiB0cnVlYCBvbiB0aGUgcXVlcnksIHdlIGhhdmUgdG8gZW5zdXJlXHJcbiAgICAvLyB0aGF0IHdlIGRvbid0IHBpY2sgdXAgdGhlIG91dGxldCBvZiBhIGNoaWxkIG5vZGUgYnkgYWNjaWRlbnQuXHJcbiAgICByZXR1cm4gb3V0bGV0cyAmJiBvdXRsZXRzLmZpbmQob3V0bGV0ID0+ICFvdXRsZXQuX25vZGUgfHwgb3V0bGV0Ll9ub2RlID09PSB0aGlzKTtcclxuICB9XHJcbn1cclxuIl19