/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input, Optional } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CdkTree, CdkTreeNode } from './tree';
/** Regex used to split a string on its CSS units. */
const cssUnitPattern = /([A-Za-z%]+)$/;
/**
 * Indent for the children tree dataNodes.
 * This directive will add left-padding to the node to show hierarchy.
 */
export class CdkTreeNodePadding {
    constructor(_treeNode, _tree, _element, _dir) {
        this._treeNode = _treeNode;
        this._tree = _tree;
        this._element = _element;
        this._dir = _dir;
        /** Subject that emits when the component has been destroyed. */
        this._destroyed = new Subject();
        /** CSS units used for the indentation value. */
        this.indentUnits = 'px';
        this._indent = 40;
        this._setPadding();
        if (_dir) {
            _dir.change.pipe(takeUntil(this._destroyed)).subscribe(() => this._setPadding(true));
        }
        // In Ivy the indentation binding might be set before the tree node's data has been added,
        // which means that we'll miss the first render. We have to subscribe to changes in the
        // data to ensure that everything is up to date.
        _treeNode._dataChanges.subscribe(() => this._setPadding());
    }
    /** The level of depth of the tree node. The padding will be `level * indent` pixels. */
    get level() { return this._level; }
    set level(value) { this._setLevelInput(value); }
    /**
     * The indent for each level. Can be a number or a CSS string.
     * Default number 40px from material design menu sub-menu spec.
     */
    get indent() { return this._indent; }
    set indent(indent) { this._setIndentInput(indent); }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** The padding indent value for the tree node. Returns a string with px numbers if not null. */
    _paddingIndent() {
        const nodeLevel = (this._treeNode.data && this._tree.treeControl.getLevel)
            ? this._tree.treeControl.getLevel(this._treeNode.data)
            : null;
        const level = this._level == null ? nodeLevel : this._level;
        return typeof level === 'number' ? `${level * this._indent}${this.indentUnits}` : null;
    }
    _setPadding(forceChange = false) {
        const padding = this._paddingIndent();
        if (padding !== this._currentPadding || forceChange) {
            const element = this._element.nativeElement;
            const paddingProp = this._dir && this._dir.value === 'rtl' ? 'paddingRight' : 'paddingLeft';
            const resetProp = paddingProp === 'paddingLeft' ? 'paddingRight' : 'paddingLeft';
            element.style[paddingProp] = padding || '';
            element.style[resetProp] = '';
            this._currentPadding = padding;
        }
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setLevelInput(value) {
        // Set to null as the fallback value so that _setPadding can fall back to the node level if the
        // consumer set the directive as `cdkTreeNodePadding=""`. We still want to take this value if
        // they set 0 explicitly.
        this._level = coerceNumberProperty(value, null);
        this._setPadding();
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setIndentInput(indent) {
        let value = indent;
        let units = 'px';
        if (typeof indent === 'string') {
            const parts = indent.split(cssUnitPattern);
            value = parts[0];
            units = parts[1] || units;
        }
        this.indentUnits = units;
        this._indent = coerceNumberProperty(value);
        this._setPadding();
    }
}
CdkTreeNodePadding.decorators = [
    { type: Directive, args: [{
                selector: '[cdkTreeNodePadding]',
            },] }
];
CdkTreeNodePadding.ctorParameters = () => [
    { type: CdkTreeNode },
    { type: CdkTree },
    { type: ElementRef },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkTreeNodePadding.propDecorators = {
    level: [{ type: Input, args: ['cdkTreeNodePadding',] }],
    indent: [{ type: Input, args: ['cdkTreeNodePaddingIndent',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFkZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdHJlZS9wYWRkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsb0JBQW9CLEVBQWMsTUFBTSx1QkFBdUIsQ0FBQztBQUN4RSxPQUFPLEVBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQWEsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2hGLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTVDLHFEQUFxRDtBQUNyRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUM7QUFFdkM7OztHQUdHO0FBSUgsTUFBTSxPQUFPLGtCQUFrQjtJQXlCN0IsWUFBb0IsU0FBNEIsRUFDNUIsS0FBb0IsRUFDcEIsUUFBaUMsRUFDckIsSUFBb0I7UUFIaEMsY0FBUyxHQUFULFNBQVMsQ0FBbUI7UUFDNUIsVUFBSyxHQUFMLEtBQUssQ0FBZTtRQUNwQixhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUNyQixTQUFJLEdBQUosSUFBSSxDQUFnQjtRQXhCcEQsZ0VBQWdFO1FBQ3hELGVBQVUsR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBRXpDLGdEQUFnRDtRQUNoRCxnQkFBVyxHQUFHLElBQUksQ0FBQztRQWVuQixZQUFPLEdBQVcsRUFBRSxDQUFDO1FBTW5CLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMs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Q0FBQztJQUVEOzs7OztPQUtHO0lBQ08sZUFBZSxDQUFDLE1BQXVCO1FBQy9DLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQztRQUNuQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDOUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzQyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQzs7O1lBdkdGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0JBQXNCO2FBQ2pDOzs7WUFYZ0IsV0FBVztZQUFwQixPQUFPO1lBSEksVUFBVTtZQUZyQixjQUFjLHVCQTZDUCxRQUFROzs7b0JBakJwQixLQUFLLFNBQUMsb0JBQW9CO3FCQVMxQixLQUFLLFNBQUMsMEJBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0RpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7Y29lcmNlTnVtYmVyUHJvcGVydHksIE51bWJlcklucHV0fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5wdXQsIE9uRGVzdHJveSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge0Nka1RyZWUsIENka1RyZWVOb2RlfSBmcm9tICcuL3RyZWUnO1xyXG5cclxuLyoqIFJlZ2V4IHVzZWQgdG8gc3BsaXQgYSBzdHJpbmcgb24gaXRzIENTUyB1bml0cy4gKi9cclxuY29uc3QgY3NzVW5pdFBhdHRlcm4gPSAvKFtBLVphLXolXSspJC87XHJcblxyXG4vKipcclxuICogSW5kZW50IGZvciB0aGUgY2hpbGRyZW4gdHJlZSBkYXRhTm9kZXMuXHJcbiAqIFRoaXMgZGlyZWN0aXZlIHdpbGwgYWRkIGxlZnQtcGFkZGluZyB0byB0aGUgbm9kZSB0byBzaG93IGhpZXJhcmNoeS5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka1RyZWVOb2RlUGFkZGluZ10nLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrVHJlZU5vZGVQYWRkaW5nPFQsIEsgPSBUPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgLyoqIEN1cnJlbnQgcGFkZGluZyB2YWx1ZSBhcHBsaWVkIHRvIHRoZSBlbGVtZW50LiBVc2VkIHRvIGF2b2lkIHVubmVjZXNzYXJpbHkgaGl0dGluZyB0aGUgRE9NLiAqL1xyXG4gIHByaXZhdGUgX2N1cnJlbnRQYWRkaW5nOiBzdHJpbmd8bnVsbDtcclxuXHJcbiAgLyoqIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX2Rlc3Ryb3llZCA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIC8qKiBDU1MgdW5pdHMgdXNlZCBmb3IgdGhlIGluZGVudGF0aW9uIHZhbHVlLiAqL1xyXG4gIGluZGVudFVuaXRzID0gJ3B4JztcclxuXHJcbiAgLyoqIFRoZSBsZXZlbCBvZiBkZXB0aCBvZiB0aGUgdHJlZSBub2RlLiBUaGUgcGFkZGluZyB3aWxsIGJlIGBsZXZlbCAqIGluZGVudGAgcGl4ZWxzLiAqL1xyXG4gIEBJbnB1dCgnY2RrVHJlZU5vZGVQYWRkaW5nJylcclxuICBnZXQgbGV2ZWwoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2xldmVsOyB9XHJcbiAgc2V0IGxldmVsKHZhbHVlOiBudW1iZXIpIHsgdGhpcy5fc2V0TGV2ZWxJbnB1dCh2YWx1ZSk7IH1cclxuICBfbGV2ZWw6IG51bWJlcjtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGluZGVudCBmb3IgZWFjaCBsZXZlbC4gQ2FuIGJlIGEgbnVtYmVyIG9yIGEgQ1NTIHN0cmluZy5cclxuICAgKiBEZWZhdWx0IG51bWJlciA0MHB4IGZyb20gbWF0ZXJpYWwgZGVzaWduIG1lbnUgc3ViLW1lbnUgc3BlYy5cclxuICAgKi9cclxuICBASW5wdXQoJ2Nka1RyZWVOb2RlUGFkZGluZ0luZGVudCcpXHJcbiAgZ2V0IGluZGVudCgpOiBudW1iZXIgfCBzdHJpbmcgeyByZXR1cm4gdGhpcy5faW5kZW50OyB9XHJcbiAgc2V0IGluZGVudChpbmRlbnQ6IG51bWJlciB8IHN0cmluZykgeyB0aGlzLl9zZXRJbmRlbnRJbnB1dChpbmRlbnQpOyB9XHJcbiAgX2luZGVudDogbnVtYmVyID0gNDA7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3RyZWVOb2RlOiBDZGtUcmVlTm9kZTxULCBLPixcclxuICAgICAgICAgICAgICBwcml2YXRlIF90cmVlOiBDZGtUcmVlPFQsIEs+LFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2VsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxyXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHkpIHtcclxuICAgIHRoaXMuX3NldFBhZGRpbmcoKTtcclxuICAgIGlmIChfZGlyKSB7XHJcbiAgICAgIF9kaXIuY2hhbmdlLnBpcGUodGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9zZXRQYWRkaW5nKHRydWUpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbiBJdnkgdGhlIGluZGVudGF0aW9uIGJpbmRpbmcgbWlnaHQgYmUgc2V0IGJlZm9yZSB0aGUgdHJlZSBub2RlJ3MgZGF0YSBoYXMgYmVlbiBhZGRlZCxcclxuICAgIC8vIHdoaWNoIG1lYW5zIHRoYXQgd2UnbGwgbWlzcyB0aGUgZmlyc3QgcmVuZGVyLiBXZSBoYXZlIHRvIHN1YnNjcmliZSB0byBjaGFuZ2VzIGluIHRoZVxyXG4gICAgLy8gZGF0YSB0byBlbnN1cmUgdGhhdCBldmVyeXRoaW5nIGlzIHVwIHRvIGRhdGUuXHJcbiAgICBfdHJlZU5vZGUuX2RhdGFDaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9zZXRQYWRkaW5nKCkpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogVGhlIHBhZGRpbmcgaW5kZW50IHZhbHVlIGZvciB0aGUgdHJlZSBub2RlLiBSZXR1cm5zIGEgc3RyaW5nIHdpdGggcHggbnVtYmVycyBpZiBub3QgbnVsbC4gKi9cclxuICBfcGFkZGluZ0luZGVudCgpOiBzdHJpbmd8bnVsbCB7XHJcbiAgICBjb25zdCBub2RlTGV2ZWwgPSAodGhpcy5fdHJlZU5vZGUuZGF0YSAmJiB0aGlzLl90cmVlLnRyZWVDb250cm9sLmdldExldmVsKVxyXG4gICAgICA/IHRoaXMuX3RyZWUudHJlZUNvbnRyb2wuZ2V0TGV2ZWwodGhpcy5fdHJlZU5vZGUuZGF0YSlcclxuICAgICAgOiBudWxsO1xyXG4gICAgY29uc3QgbGV2ZWwgPSB0aGlzLl9sZXZlbCA9PSBudWxsID8gbm9kZUxldmVsIDogdGhpcy5fbGV2ZWw7XHJcbiAgICByZXR1cm4gdHlwZW9mIGxldmVsID09PSAnbnVtYmVyJyA/IGAke2xldmVsICogdGhpcy5faW5kZW50fSR7dGhpcy5pbmRlbnRVbml0c31gIDogbnVsbDtcclxuICB9XHJcblxyXG4gIF9zZXRQYWRkaW5nKGZvcmNlQ2hhbmdlID0gZmFsc2UpIHtcclxuICAgIGNvbnN0IHBhZGRpbmcgPSB0aGlzLl9wYWRkaW5nSW5kZW50KCk7XHJcblxyXG4gICAgaWYgKHBhZGRpbmcgIT09IHRoaXMuX2N1cnJlbnRQYWRkaW5nIHx8IGZvcmNlQ2hhbmdlKSB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50Lm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgIGNvbnN0IHBhZGRpbmdQcm9wID0gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncGFkZGluZ1JpZ2h0JyA6ICdwYWRkaW5nTGVmdCc7XHJcbiAgICAgIGNvbnN0IHJlc2V0UHJvcCA9IHBhZGRpbmdQcm9wID09PSAncGFkZGluZ0xlZnQnID8gJ3BhZGRpbmdSaWdodCcgOiAncGFkZGluZ0xlZnQnO1xyXG4gICAgICBlbGVtZW50LnN0eWxlW3BhZGRpbmdQcm9wXSA9IHBhZGRpbmcgfHwgJyc7XHJcbiAgICAgIGVsZW1lbnQuc3R5bGVbcmVzZXRQcm9wXSA9ICcnO1xyXG4gICAgICB0aGlzLl9jdXJyZW50UGFkZGluZyA9IHBhZGRpbmc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGhhcyBiZWVuIGV4dHJhY3RlZCB0byBhIHV0aWwgYmVjYXVzZSBvZiBUUyA0IGFuZCBWRS5cclxuICAgKiBWaWV3IEVuZ2luZSBkb2Vzbid0IHN1cHBvcnQgcHJvcGVydHkgcmVuYW1lIGluaGVyaXRhbmNlLlxyXG4gICAqIFRTIDQuMCBkb2Vzbid0IGFsbG93IHByb3BlcnRpZXMgdG8gb3ZlcnJpZGUgYWNjZXNzb3JzIG9yIHZpY2UtdmVyc2EuXHJcbiAgICogQGRvY3MtcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBfc2V0TGV2ZWxJbnB1dCh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICAvLyBTZXQgdG8gbnVsbCBhcyB0aGUgZmFsbGJhY2sgdmFsdWUgc28gdGhhdCBfc2V0UGFkZGluZyBjYW4gZmFsbCBiYWNrIHRvIHRoZSBub2RlIGxldmVsIGlmIHRoZVxyXG4gICAgLy8gY29uc3VtZXIgc2V0IHRoZSBkaXJlY3RpdmUgYXMgYGNka1RyZWVOb2RlUGFkZGluZz1cIlwiYC4gV2Ugc3RpbGwgd2FudCB0byB0YWtlIHRoaXMgdmFsdWUgaWZcclxuICAgIC8vIHRoZXkgc2V0IDAgZXhwbGljaXRseS5cclxuICAgIHRoaXMuX2xldmVsID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUsIG51bGwpITtcclxuICAgIHRoaXMuX3NldFBhZGRpbmcoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaGFzIGJlZW4gZXh0cmFjdGVkIHRvIGEgdXRpbCBiZWNhdXNlIG9mIFRTIDQgYW5kIFZFLlxyXG4gICAqIFZpZXcgRW5naW5lIGRvZXNuJ3Qgc3VwcG9ydCBwcm9wZXJ0eSByZW5hbWUgaW5oZXJpdGFuY2UuXHJcbiAgICogVFMgNC4wIGRvZXNuJ3QgYWxsb3cgcHJvcGVydGllcyB0byBvdmVycmlkZSBhY2Nlc3NvcnMgb3IgdmljZS12ZXJzYS5cclxuICAgKiBAZG9jcy1wcml2YXRlXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIF9zZXRJbmRlbnRJbnB1dChpbmRlbnQ6IG51bWJlciB8IHN0cmluZykge1xyXG4gICAgbGV0IHZhbHVlID0gaW5kZW50O1xyXG4gICAgbGV0IHVuaXRzID0gJ3B4JztcclxuXHJcbiAgICBpZiAodHlwZW9mIGluZGVudCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgY29uc3QgcGFydHMgPSBpbmRlbnQuc3BsaXQoY3NzVW5pdFBhdHRlcm4pO1xyXG4gICAgICB2YWx1ZSA9IHBhcnRzWzBdO1xyXG4gICAgICB1bml0cyA9IHBhcnRzWzFdIHx8IHVuaXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5kZW50VW5pdHMgPSB1bml0cztcclxuICAgIHRoaXMuX2luZGVudCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcclxuICAgIHRoaXMuX3NldFBhZGRpbmcoKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sZXZlbDogTnVtYmVySW5wdXQ7XHJcbn1cclxuIl19