/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isObservable } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { BaseTreeControl } from './base-tree-control';
/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl extends BaseTreeControl {
    /** Construct with nested tree function getChildren. */
    constructor(getChildren, options) {
        super();
        this.getChildren = getChildren;
        this.options = options;
        if (this.options) {
            this.trackBy = this.options.trackBy;
        }
    }
    /**
     * Expands all dataNodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all root level
     * data nodes of the tree.
     */
    expandAll() {
        this.expansionModel.clear();
        const allNodes = this.dataNodes.reduce((accumulator, dataNode) => [...accumulator, ...this.getDescendants(dataNode), dataNode], []);
        this.expansionModel.select(...allNodes.map(node => this._trackByValue(node)));
    }
    /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
    getDescendants(dataNode) {
        const descendants = [];
        this._getDescendants(descendants, dataNode);
        // Remove the node itself
        return descendants.splice(1);
    }
    /** A helper function to get descendants recursively. */
    _getDescendants(descendants, dataNode) {
        descendants.push(dataNode);
        const childrenNodes = this.getChildren(dataNode);
        if (Array.isArray(childrenNodes)) {
            childrenNodes.forEach((child) => this._getDescendants(descendants, child));
        }
        else if (isObservable(childrenNodes)) {
            // TypeScript as of version 3.5 doesn't seem to treat `Boolean` like a function that
            // returns a `boolean` specifically in the context of `filter`, so we manually clarify that.
            childrenNodes.pipe(take(1), filter(Boolean))
                .subscribe(children => {
                for (const child of children) {
                    this._getDescendants(descendants, child);
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdGVkLXRyZWUtY29udHJvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9jb250cm9sL25lc3RlZC10cmVlLWNvbnRyb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFhLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUM5QyxPQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQU9wRCw4RkFBOEY7QUFDOUYsTUFBTSxPQUFPLGlCQUE0QixTQUFRLGVBQXFCO0lBQ3BFLHVEQUF1RDtJQUN2RCxZQUNXLFdBQXVFLEVBQ3ZFLE9BQXdDO1FBQ2pELEtBQUssRUFBRSxDQUFDO1FBRkMsZ0JBQVcsR0FBWCxXQUFXLENBQTREO1FBQ3ZFLFlBQU8sR0FBUCxPQUFPLENBQWlDO1FBR2pELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUztRQUNQLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFnQixFQUFFLFFBQVEsRUFBRSxFQUFFLENBQ2xFLENBQUMsR0FBRyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsY0FBYyxDQUFDLFFBQVc7UUFDeEIsTUFBTSxXQUFXLEdBQVEsRUFBRSxDQUFDO1FBRTVCLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLHlCQUF5QjtRQUN6QixPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELHdEQUF3RDtJQUM5QyxlQUFlLENBQUMsV0FBZ0IsRUFBRSxRQUFXO1FBQ3JELFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDM0IsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDaEMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQVEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMvRTthQUFNLElBQUksWUFBWSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3RDLG9GQUFvRjtZQUNwRiw0RkFBNEY7WUFDNUYsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQXdCLENBQUMsQ0FBQztpQkFDeEQsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNwQixLQUFLLE1BQU0sS0FBSyxJQUFJLFFBQVEsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQzFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDUjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5pbXBvcnQge09ic2VydmFibGUsIGlzT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7dGFrZSwgZmlsdGVyfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7QmFzZVRyZWVDb250cm9sfSBmcm9tICcuL2Jhc2UtdHJlZS1jb250cm9sJztcclxuXHJcbi8qKiBPcHRpb25hbCBzZXQgb2YgY29uZmlndXJhdGlvbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB0byB0aGUgTmVzdGVkVHJlZUNvbnRyb2wuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTmVzdGVkVHJlZUNvbnRyb2xPcHRpb25zPFQsIEs+IHtcclxuICB0cmFja0J5PzogKGRhdGFOb2RlOiBUKSA9PiBLO1xyXG59XHJcblxyXG4vKiogTmVzdGVkIHRyZWUgY29udHJvbC4gQWJsZSB0byBleHBhbmQvY29sbGFwc2UgYSBzdWJ0cmVlIHJlY3Vyc2l2ZWx5IGZvciBOZXN0ZWROb2RlIHR5cGUuICovXHJcbmV4cG9ydCBjbGFzcyBOZXN0ZWRUcmVlQ29udHJvbDxULCBLID0gVD4gZXh0ZW5kcyBCYXNlVHJlZUNvbnRyb2w8VCwgSz4ge1xyXG4gIC8qKiBDb25zdHJ1Y3Qgd2l0aCBuZXN0ZWQgdHJlZSBmdW5jdGlvbiBnZXRDaGlsZHJlbi4gKi9cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHVibGljIGdldENoaWxkcmVuOiAoZGF0YU5vZGU6IFQpID0+IChPYnNlcnZhYmxlPFRbXT58IFRbXSB8IHVuZGVmaW5lZCB8IG51bGwpLFxyXG4gICAgICBwdWJsaWMgb3B0aW9ucz86IE5lc3RlZFRyZWVDb250cm9sT3B0aW9uczxULCBLPikge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBpZiAodGhpcy5vcHRpb25zKSB7XHJcbiAgICAgIHRoaXMudHJhY2tCeSA9IHRoaXMub3B0aW9ucy50cmFja0J5O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyBhbGwgZGF0YU5vZGVzIGluIHRoZSB0cmVlLlxyXG4gICAqXHJcbiAgICogVG8gbWFrZSB0aGlzIHdvcmtpbmcsIHRoZSBgZGF0YU5vZGVzYCB2YXJpYWJsZSBvZiB0aGUgVHJlZUNvbnRyb2wgbXVzdCBiZSBzZXQgdG8gYWxsIHJvb3QgbGV2ZWxcclxuICAgKiBkYXRhIG5vZGVzIG9mIHRoZSB0cmVlLlxyXG4gICAqL1xyXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZXhwYW5zaW9uTW9kZWwuY2xlYXIoKTtcclxuICAgIGNvbnN0IGFsbE5vZGVzID0gdGhpcy5kYXRhTm9kZXMucmVkdWNlKChhY2N1bXVsYXRvcjogVFtdLCBkYXRhTm9kZSkgPT5cclxuICAgICAgICBbLi4uYWNjdW11bGF0b3IsIC4uLnRoaXMuZ2V0RGVzY2VuZGFudHMoZGF0YU5vZGUpLCBkYXRhTm9kZV0sIFtdKTtcclxuICAgIHRoaXMuZXhwYW5zaW9uTW9kZWwuc2VsZWN0KC4uLmFsbE5vZGVzLm1hcChub2RlID0+IHRoaXMuX3RyYWNrQnlWYWx1ZShub2RlKSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgYSBsaXN0IG9mIGRlc2NlbmRhbnQgZGF0YU5vZGVzIG9mIGEgc3VidHJlZSByb290ZWQgYXQgZ2l2ZW4gZGF0YSBub2RlIHJlY3Vyc2l2ZWx5LiAqL1xyXG4gIGdldERlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogVFtdIHtcclxuICAgIGNvbnN0IGRlc2NlbmRhbnRzOiBUW10gPSBbXTtcclxuXHJcbiAgICB0aGlzLl9nZXREZXNjZW5kYW50cyhkZXNjZW5kYW50cywgZGF0YU5vZGUpO1xyXG4gICAgLy8gUmVtb3ZlIHRoZSBub2RlIGl0c2VsZlxyXG4gICAgcmV0dXJuIGRlc2NlbmRhbnRzLnNwbGljZSgxKTtcclxuICB9XHJcblxyXG4gIC8qKiBBIGhlbHBlciBmdW5jdGlvbiB0byBnZXQgZGVzY2VuZGFudHMgcmVjdXJzaXZlbHkuICovXHJcbiAgcHJvdGVjdGVkIF9nZXREZXNjZW5kYW50cyhkZXNjZW5kYW50czogVFtdLCBkYXRhTm9kZTogVCk6IHZvaWQge1xyXG4gICAgZGVzY2VuZGFudHMucHVzaChkYXRhTm9kZSk7XHJcbiAgICBjb25zdCBjaGlsZHJlbk5vZGVzID0gdGhpcy5nZXRDaGlsZHJlbihkYXRhTm9kZSk7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbk5vZGVzKSkge1xyXG4gICAgICBjaGlsZHJlbk5vZGVzLmZvckVhY2goKGNoaWxkOiBUKSA9PiB0aGlzLl9nZXREZXNjZW5kYW50cyhkZXNjZW5kYW50cywgY2hpbGQpKTtcclxuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKGNoaWxkcmVuTm9kZXMpKSB7XHJcbiAgICAgIC8vIFR5cGVTY3JpcHQgYXMgb2YgdmVyc2lvbiAzLjUgZG9lc24ndCBzZWVtIHRvIHRyZWF0IGBCb29sZWFuYCBsaWtlIGEgZnVuY3Rpb24gdGhhdFxyXG4gICAgICAvLyByZXR1cm5zIGEgYGJvb2xlYW5gIHNwZWNpZmljYWxseSBpbiB0aGUgY29udGV4dCBvZiBgZmlsdGVyYCwgc28gd2UgbWFudWFsbHkgY2xhcmlmeSB0aGF0LlxyXG4gICAgICBjaGlsZHJlbk5vZGVzLnBpcGUodGFrZSgxKSwgZmlsdGVyKEJvb2xlYW4gYXMgKCkgPT4gYm9vbGVhbikpXHJcbiAgICAgICAgICAuc3Vic2NyaWJlKGNoaWxkcmVuID0+IHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2dldERlc2NlbmRhbnRzKGRlc2NlbmRhbnRzLCBjaGlsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=