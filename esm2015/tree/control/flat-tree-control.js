/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BaseTreeControl } from './base-tree-control';
/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl extends BaseTreeControl {
    /** Construct with flat tree data node functions getLevel and isExpandable. */
    constructor(getLevel, isExpandable, options) {
        super();
        this.getLevel = getLevel;
        this.isExpandable = isExpandable;
        this.options = options;
        if (this.options) {
            this.trackBy = this.options.trackBy;
        }
    }
    /**
     * Gets a list of the data node's subtree of descendent data nodes.
     *
     * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
     * with correct levels.
     */
    getDescendants(dataNode) {
        const startIndex = this.dataNodes.indexOf(dataNode);
        const results = [];
        // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
        // The level of descendants of a tree node must be greater than the level of the given
        // tree node.
        // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
        // If we reach a node whose level is greater than the level of the tree node, we hit a
        // sibling of an ancestor.
        for (let i = startIndex + 1; i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]); i++) {
            results.push(this.dataNodes[i]);
        }
        return results;
    }
    /**
     * Expands all data nodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
     * data nodes of the tree.
     */
    expandAll() {
        this.expansionModel.select(...this.dataNodes.map(node => this._trackByValue(node)));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhdC10cmVlLWNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RyZWUvY29udHJvbC9mbGF0LXRyZWUtY29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFPcEQsMkZBQTJGO0FBQzNGLE1BQU0sT0FBTyxlQUEwQixTQUFRLGVBQXFCO0lBRWxFLDhFQUE4RTtJQUM5RSxZQUNXLFFBQWlDLEVBQVMsWUFBc0MsRUFDaEYsT0FBc0M7UUFDL0MsS0FBSyxFQUFFLENBQUM7UUFGQyxhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUEwQjtRQUNoRixZQUFPLEdBQVAsT0FBTyxDQUErQjtRQUcvQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUNyQztJQUNILENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGNBQWMsQ0FBQyxRQUFXO1FBQ3hCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUV4Qix1RkFBdUY7UUFDdkYsc0ZBQXNGO1FBQ3RGLGFBQWE7UUFDYiwyRkFBMkY7UUFDM0Ysc0ZBQXNGO1FBQ3RGLDBCQUEwQjtRQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLEVBQ3ZCLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUN2RixDQUFDLEVBQUUsRUFBRTtZQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUztRQUNQLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7QmFzZVRyZWVDb250cm9sfSBmcm9tICcuL2Jhc2UtdHJlZS1jb250cm9sJztcclxuXHJcbi8qKiBPcHRpb25hbCBzZXQgb2YgY29uZmlndXJhdGlvbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB0byB0aGUgRmxhdFRyZWVDb250cm9sLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEZsYXRUcmVlQ29udHJvbE9wdGlvbnM8VCwgSz4ge1xyXG4gIHRyYWNrQnk/OiAoZGF0YU5vZGU6IFQpID0+IEs7XHJcbn1cclxuXHJcbi8qKiBGbGF0IHRyZWUgY29udHJvbC4gQWJsZSB0byBleHBhbmQvY29sbGFwc2UgYSBzdWJ0cmVlIHJlY3Vyc2l2ZWx5IGZvciBmbGF0dGVuZWQgdHJlZS4gKi9cclxuZXhwb3J0IGNsYXNzIEZsYXRUcmVlQ29udHJvbDxULCBLID0gVD4gZXh0ZW5kcyBCYXNlVHJlZUNvbnRyb2w8VCwgSz4ge1xyXG5cclxuICAvKiogQ29uc3RydWN0IHdpdGggZmxhdCB0cmVlIGRhdGEgbm9kZSBmdW5jdGlvbnMgZ2V0TGV2ZWwgYW5kIGlzRXhwYW5kYWJsZS4gKi9cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHVibGljIGdldExldmVsOiAoZGF0YU5vZGU6IFQpID0+IG51bWJlciwgcHVibGljIGlzRXhwYW5kYWJsZTogKGRhdGFOb2RlOiBUKSA9PiBib29sZWFuLFxyXG4gICAgICBwdWJsaWMgb3B0aW9ucz86IEZsYXRUcmVlQ29udHJvbE9wdGlvbnM8VCwgSz4pIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgaWYgKHRoaXMub3B0aW9ucykge1xyXG4gICAgICB0aGlzLnRyYWNrQnkgPSB0aGlzLm9wdGlvbnMudHJhY2tCeTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSBsaXN0IG9mIHRoZSBkYXRhIG5vZGUncyBzdWJ0cmVlIG9mIGRlc2NlbmRlbnQgZGF0YSBub2Rlcy5cclxuICAgKlxyXG4gICAqIFRvIG1ha2UgdGhpcyB3b3JraW5nLCB0aGUgYGRhdGFOb2Rlc2Agb2YgdGhlIFRyZWVDb250cm9sIG11c3QgYmUgZmxhdHRlbmVkIHRyZWUgbm9kZXNcclxuICAgKiB3aXRoIGNvcnJlY3QgbGV2ZWxzLlxyXG4gICAqL1xyXG4gIGdldERlc2NlbmRhbnRzKGRhdGFOb2RlOiBUKTogVFtdIHtcclxuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSB0aGlzLmRhdGFOb2Rlcy5pbmRleE9mKGRhdGFOb2RlKTtcclxuICAgIGNvbnN0IHJlc3VsdHM6IFRbXSA9IFtdO1xyXG5cclxuICAgIC8vIEdvZXMgdGhyb3VnaCBmbGF0dGVuZWQgdHJlZSBub2RlcyBpbiB0aGUgYGRhdGFOb2Rlc2AgYXJyYXksIGFuZCBnZXQgYWxsIGRlc2NlbmRhbnRzLlxyXG4gICAgLy8gVGhlIGxldmVsIG9mIGRlc2NlbmRhbnRzIG9mIGEgdHJlZSBub2RlIG11c3QgYmUgZ3JlYXRlciB0aGFuIHRoZSBsZXZlbCBvZiB0aGUgZ2l2ZW5cclxuICAgIC8vIHRyZWUgbm9kZS5cclxuICAgIC8vIElmIHdlIHJlYWNoIGEgbm9kZSB3aG9zZSBsZXZlbCBpcyBlcXVhbCB0byB0aGUgbGV2ZWwgb2YgdGhlIHRyZWUgbm9kZSwgd2UgaGl0IGEgc2libGluZy5cclxuICAgIC8vIElmIHdlIHJlYWNoIGEgbm9kZSB3aG9zZSBsZXZlbCBpcyBncmVhdGVyIHRoYW4gdGhlIGxldmVsIG9mIHRoZSB0cmVlIG5vZGUsIHdlIGhpdCBhXHJcbiAgICAvLyBzaWJsaW5nIG9mIGFuIGFuY2VzdG9yLlxyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXggKyAxO1xyXG4gICAgICAgIGkgPCB0aGlzLmRhdGFOb2Rlcy5sZW5ndGggJiYgdGhpcy5nZXRMZXZlbChkYXRhTm9kZSkgPCB0aGlzLmdldExldmVsKHRoaXMuZGF0YU5vZGVzW2ldKTtcclxuICAgICAgICBpKyspIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKHRoaXMuZGF0YU5vZGVzW2ldKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwYW5kcyBhbGwgZGF0YSBub2RlcyBpbiB0aGUgdHJlZS5cclxuICAgKlxyXG4gICAqIFRvIG1ha2UgdGhpcyB3b3JraW5nLCB0aGUgYGRhdGFOb2Rlc2AgdmFyaWFibGUgb2YgdGhlIFRyZWVDb250cm9sIG11c3QgYmUgc2V0IHRvIGFsbCBmbGF0dGVuZWRcclxuICAgKiBkYXRhIG5vZGVzIG9mIHRoZSB0cmVlLlxyXG4gICAqL1xyXG4gIGV4cGFuZEFsbCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZXhwYW5zaW9uTW9kZWwuc2VsZWN0KC4uLnRoaXMuZGF0YU5vZGVzLm1hcChub2RlID0+IHRoaXMuX3RyYWNrQnlWYWx1ZShub2RlKSkpO1xyXG4gIH1cclxufVxyXG4iXX0=