/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ContentChild, Directive, ElementRef, Input, TemplateRef, Inject, Optional, } from '@angular/core';
import { mixinHasStickyInput } from './can-stick';
import { CDK_TABLE } from './tokens';
/**
 * Cell definition for a CDK table.
 * Captures the template of a column's data row cell as well as cell-specific properties.
 */
export class CdkCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkCellDef]' },] }
];
CdkCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * Header cell definition for a CDK table.
 * Captures the template of a column's header cell and as well as cell-specific properties.
 */
export class CdkHeaderCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkHeaderCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkHeaderCellDef]' },] }
];
CdkHeaderCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
/**
 * Footer cell definition for a CDK table.
 * Captures the template of a column's footer cell and as well as cell-specific properties.
 */
export class CdkFooterCellDef {
    constructor(/** @docs-private */ template) {
        this.template = template;
    }
}
CdkFooterCellDef.decorators = [
    { type: Directive, args: [{ selector: '[cdkFooterCellDef]' },] }
];
CdkFooterCellDef.ctorParameters = () => [
    { type: TemplateRef }
];
// Boilerplate for applying mixins to CdkColumnDef.
/** @docs-private */
class CdkColumnDefBase {
}
const _CdkColumnDefBase = mixinHasStickyInput(CdkColumnDefBase);
/**
 * Column definition for the CDK table.
 * Defines a set of cells available for a table column.
 */
export class CdkColumnDef extends _CdkColumnDefBase {
    constructor(_table) {
        super();
        this._table = _table;
        this._stickyEnd = false;
    }
    /** Unique name for this column. */
    get name() { return this._name; }
    set name(name) { this._setNameInput(name); }
    /**
     * Whether this column should be sticky positioned on the end of the row. Should make sure
     * that it mimics the `CanStick` mixin such that `_hasStickyChanged` is set to true if the value
     * has been changed.
     */
    get stickyEnd() {
        return this._stickyEnd;
    }
    set stickyEnd(v) {
        const prevValue = this._stickyEnd;
        this._stickyEnd = coerceBooleanProperty(v);
        this._hasStickyChanged = prevValue !== this._stickyEnd;
    }
    /**
     * Overridable method that sets the css classes that will be added to every cell in this
     * column.
     * In the future, columnCssClassName will change from type string[] to string and this
     * will set a single string value.
     * @docs-private
     */
    _updateColumnCssClassName() {
        this._columnCssClassName = [`cdk-column-${this.cssClassFriendlyName}`];
    }
    /**
     * This has been extracted to a util because of TS 4 and VE.
     * View Engine doesn't support property rename inheritance.
     * TS 4.0 doesn't allow properties to override accessors or vice-versa.
     * @docs-private
     */
    _setNameInput(value) {
        // If the directive is set without a name (updated programmatically), then this setter will
        // trigger with an empty string and should not overwrite the programmatically set value.
        if (value) {
            this._name = value;
            this.cssClassFriendlyName = value.replace(/[^a-z0-9_-]/ig, '-');
            this._updateColumnCssClassName();
        }
    }
}
CdkColumnDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkColumnDef]',
                inputs: ['sticky'],
                providers: [{ provide: 'MAT_SORT_HEADER_COLUMN_DEF', useExisting: CdkColumnDef }],
            },] }
];
CdkColumnDef.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TABLE,] }, { type: Optional }] }
];
CdkColumnDef.propDecorators = {
    name: [{ type: Input, args: ['cdkColumnDef',] }],
    stickyEnd: [{ type: Input, args: ['stickyEnd',] }],
    cell: [{ type: ContentChild, args: [CdkCellDef,] }],
    headerCell: [{ type: ContentChild, args: [CdkHeaderCellDef,] }],
    footerCell: [{ type: ContentChild, args: [CdkFooterCellDef,] }]
};
/** Base class for the cells. Adds a CSS classname that identifies the column it renders in. */
export class BaseCdkCell {
    constructor(columnDef, elementRef) {
        // If IE 11 is dropped before we switch to setting a single class name, change to multi param
        // with destructuring.
        const classList = elementRef.nativeElement.classList;
        for (const className of columnDef._columnCssClassName) {
            classList.add(className);
        }
    }
}
/** Header cell template container that adds the right classes and role. */
export class CdkHeaderCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkHeaderCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-header-cell, th[cdk-header-cell]',
                host: {
                    'class': 'cdk-header-cell',
                    'role': 'columnheader',
                },
            },] }
];
CdkHeaderCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
/** Footer cell template container that adds the right classes and role. */
export class CdkFooterCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkFooterCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-footer-cell, td[cdk-footer-cell]',
                host: {
                    'class': 'cdk-footer-cell',
                    'role': 'gridcell',
                },
            },] }
];
CdkFooterCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
/** Cell template container that adds the right classes and role. */
export class CdkCell extends BaseCdkCell {
    constructor(columnDef, elementRef) {
        super(columnDef, elementRef);
    }
}
CdkCell.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-cell, td[cdk-cell]',
                host: {
                    'class': 'cdk-cell',
                    'role': 'gridcell',
                },
            },] }
];
CdkCell.ctorParameters = () => [
    { type: CdkColumnDef },
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY2VsbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBQ0wsWUFBWSxFQUNaLFNBQVMsRUFDVCxVQUFVLEVBQ1YsS0FBSyxFQUNMLFdBQVcsRUFDWCxNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBeUIsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQVFuQzs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQUNyQixZQUFZLG9CQUFvQixDQUFRLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQzs7O1lBRnZFLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUM7OztZQWpCbkMsV0FBVzs7QUFzQmI7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQixZQUFZLG9CQUFvQixDQUFRLFFBQTBCO1FBQTFCLGFBQVEsR0FBUixRQUFRLENBQWtCO0lBQUcsQ0FBQzs7O1lBRnZFLFNBQVMsU0FBQyxFQUFDLFFBQVEsRUFBRSxvQkFBb0IsRUFBQzs7O1lBMUJ6QyxXQUFXOztBQStCYjs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQVksb0JBQW9CLENBQVEsUUFBMEI7UUFBMUIsYUFBUSxHQUFSLFFBQVEsQ0FBa0I7SUFBRyxDQUFDOzs7WUFGdkUsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDOzs7WUFuQ3pDLFdBQVc7O0FBd0NiLG1EQUFtRDtBQUNuRCxvQkFBb0I7QUFDcEIsTUFBTSxnQkFBZ0I7Q0FBRztBQUN6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U0FBUSxXQUFXO0lBQzVDLFlBQVksU0FBdUIsRUFBRSxVQUFzQjtRQUN6RCxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7OztZQVZGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsc0NBQXNDO2dCQUNoRCxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsTUFBTSxFQUFFLFVBQVU7aUJBQ25CO2FBQ0Y7OztZQUV3QixZQUFZO1lBNUtuQyxVQUFVOztBQWlMWixvRUFBb0U7QUFRcEUsTUFBTSxPQUFPLE9BQVEsU0FBUSxXQUFXO0lBQ3RDLFlBQVksU0FBdUIsRUFBRSxVQUFzQjtRQUN6RCxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7OztZQVZGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLFVBQVU7b0JBQ25CLE1BQU0sRUFBRSxVQUFVO2lCQUNuQjthQUNGOzs7WUFFd0IsWUFBWTtZQTFMbkMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBDb250ZW50Q2hpbGQsXHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgSW5wdXQsXHJcbiAgVGVtcGxhdGVSZWYsXHJcbiAgSW5qZWN0LFxyXG4gIE9wdGlvbmFsLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NhblN0aWNrLCBDYW5TdGlja0N0b3IsIG1peGluSGFzU3RpY2t5SW5wdXR9IGZyb20gJy4vY2FuLXN0aWNrJztcclxuaW1wb3J0IHtDREtfVEFCTEV9IGZyb20gJy4vdG9rZW5zJztcclxuXHJcblxyXG4vKiogQmFzZSBpbnRlcmZhY2UgZm9yIGEgY2VsbCBkZWZpbml0aW9uLiBDYXB0dXJlcyBhIGNvbHVtbidzIGNlbGwgdGVtcGxhdGUgZGVmaW5pdGlvbi4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDZWxsRGVmIHtcclxuICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENlbGwgZGVmaW5pdGlvbiBmb3IgYSBDREsgdGFibGUuXHJcbiAqIENhcHR1cmVzIHRoZSB0ZW1wbGF0ZSBvZiBhIGNvbHVtbidzIGRhdGEgcm93IGNlbGwgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tjZGtDZWxsRGVmXSd9KVxyXG5leHBvcnQgY2xhc3MgQ2RrQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xyXG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cclxufVxyXG5cclxuLyoqXHJcbiAqIEhlYWRlciBjZWxsIGRlZmluaXRpb24gZm9yIGEgQ0RLIHRhYmxlLlxyXG4gKiBDYXB0dXJlcyB0aGUgdGVtcGxhdGUgb2YgYSBjb2x1bW4ncyBoZWFkZXIgY2VsbCBhbmQgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tjZGtIZWFkZXJDZWxsRGVmXSd9KVxyXG5leHBvcnQgY2xhc3MgQ2RrSGVhZGVyQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xyXG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cclxufVxyXG5cclxuLyoqXHJcbiAqIEZvb3RlciBjZWxsIGRlZmluaXRpb24gZm9yIGEgQ0RLIHRhYmxlLlxyXG4gKiBDYXB0dXJlcyB0aGUgdGVtcGxhdGUgb2YgYSBjb2x1bW4ncyBmb290ZXIgY2VsbCBhbmQgYXMgd2VsbCBhcyBjZWxsLXNwZWNpZmljIHByb3BlcnRpZXMuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tjZGtGb290ZXJDZWxsRGVmXSd9KVxyXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyQ2VsbERlZiBpbXBsZW1lbnRzIENlbGxEZWYge1xyXG4gIGNvbnN0cnVjdG9yKC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55Pikge31cclxufVxyXG5cclxuLy8gQm9pbGVycGxhdGUgZm9yIGFwcGx5aW5nIG1peGlucyB0byBDZGtDb2x1bW5EZWYuXHJcbi8qKiBAZG9jcy1wcml2YXRlICovXHJcbmNsYXNzIENka0NvbHVtbkRlZkJhc2Uge31cclxuY29uc3QgX0Nka0NvbHVtbkRlZkJhc2U6IENhblN0aWNrQ3RvciZ0eXBlb2YgQ2RrQ29sdW1uRGVmQmFzZSA9XHJcbiAgICBtaXhpbkhhc1N0aWNreUlucHV0KENka0NvbHVtbkRlZkJhc2UpO1xyXG5cclxuLyoqXHJcbiAqIENvbHVtbiBkZWZpbml0aW9uIGZvciB0aGUgQ0RLIHRhYmxlLlxyXG4gKiBEZWZpbmVzIGEgc2V0IG9mIGNlbGxzIGF2YWlsYWJsZSBmb3IgYSB0YWJsZSBjb2x1bW4uXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtDb2x1bW5EZWZdJyxcclxuICBpbnB1dHM6IFsnc3RpY2t5J10sXHJcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6ICdNQVRfU09SVF9IRUFERVJfQ09MVU1OX0RFRicsIHVzZUV4aXN0aW5nOiBDZGtDb2x1bW5EZWZ9XSxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0NvbHVtbkRlZiBleHRlbmRzIF9DZGtDb2x1bW5EZWZCYXNlIGltcGxlbWVudHMgQ2FuU3RpY2sge1xyXG4gIC8qKiBVbmlxdWUgbmFtZSBmb3IgdGhpcyBjb2x1bW4uICovXHJcbiAgQElucHV0KCdjZGtDb2x1bW5EZWYnKVxyXG4gIGdldCBuYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9uYW1lOyB9XHJcbiAgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7IHRoaXMuX3NldE5hbWVJbnB1dChuYW1lKTsgfVxyXG4gIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoaXMgY29sdW1uIHNob3VsZCBiZSBzdGlja3kgcG9zaXRpb25lZCBvbiB0aGUgZW5kIG9mIHRoZSByb3cuIFNob3VsZCBtYWtlIHN1cmVcclxuICAgKiB0aGF0IGl0IG1pbWljcyB0aGUgYENhblN0aWNrYCBtaXhpbiBzdWNoIHRoYXQgYF9oYXNTdGlja3lDaGFuZ2VkYCBpcyBzZXQgdG8gdHJ1ZSBpZiB0aGUgdmFsdWVcclxuICAgKiBoYXMgYmVlbiBjaGFuZ2VkLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgnc3RpY2t5RW5kJylcclxuICBnZXQgc3RpY2t5RW5kKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX3N0aWNreUVuZDtcclxuICB9XHJcbiAgc2V0IHN0aWNreUVuZCh2OiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBwcmV2VmFsdWUgPSB0aGlzLl9zdGlja3lFbmQ7XHJcbiAgICB0aGlzLl9zdGlja3lFbmQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodik7XHJcbiAgICB0aGlzLl9oYXNTdGlja3lDaGFuZ2VkID0gcHJldlZhbHVlICE9PSB0aGlzLl9zdGlja3lFbmQ7XHJcbiAgfVxyXG4gIF9zdGlja3lFbmQ6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuICBAQ29udGVudENoaWxkKENka0NlbGxEZWYpIGNlbGw6IENka0NlbGxEZWY7XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlICovXHJcbiAgQENvbnRlbnRDaGlsZChDZGtIZWFkZXJDZWxsRGVmKSBoZWFkZXJDZWxsOiBDZGtIZWFkZXJDZWxsRGVmO1xyXG5cclxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG4gIEBDb250ZW50Q2hpbGQoQ2RrRm9vdGVyQ2VsbERlZikgZm9vdGVyQ2VsbDogQ2RrRm9vdGVyQ2VsbERlZjtcclxuXHJcbiAgLyoqXHJcbiAgICogVHJhbnNmb3JtZWQgdmVyc2lvbiBvZiB0aGUgY29sdW1uIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBhcyBwYXJ0IG9mIGEgQ1NTIGNsYXNzbmFtZS4gRXhjbHVkZXNcclxuICAgKiBhbGwgbm9uLWFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIGFuZCB0aGUgc3BlY2lhbCBjaGFyYWN0ZXJzICctJyBhbmQgJ18nLiBBbnkgY2hhcmFjdGVycyB0aGF0XHJcbiAgICogZG8gbm90IG1hdGNoIGFyZSByZXBsYWNlZCBieSB0aGUgJy0nIGNoYXJhY3Rlci5cclxuICAgKi9cclxuICBjc3NDbGFzc0ZyaWVuZGx5TmFtZTogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBDbGFzcyBuYW1lIGZvciBjZWxscyBpbiB0aGlzIGNvbHVtbi5cclxuICAgKiBAZG9jcy1wcml2YXRlXHJcbiAgICovXHJcbiAgX2NvbHVtbkNzc0NsYXNzTmFtZTogc3RyaW5nW107XHJcblxyXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoQ0RLX1RBQkxFKSBAT3B0aW9uYWwoKSBwdWJsaWMgX3RhYmxlPzogYW55KSB7XHJcbiAgICBzdXBlcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3ZlcnJpZGFibGUgbWV0aG9kIHRoYXQgc2V0cyB0aGUgY3NzIGNsYXNzZXMgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIGV2ZXJ5IGNlbGwgaW4gdGhpc1xyXG4gICAqIGNvbHVtbi5cclxuICAgKiBJbiB0aGUgZnV0dXJlLCBjb2x1bW5Dc3NDbGFzc05hbWUgd2lsbCBjaGFuZ2UgZnJvbSB0eXBlIHN0cmluZ1tdIHRvIHN0cmluZyBhbmQgdGhpc1xyXG4gICAqIHdpbGwgc2V0IGEgc2luZ2xlIHN0cmluZyB2YWx1ZS5cclxuICAgKiBAZG9jcy1wcml2YXRlXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIF91cGRhdGVDb2x1bW5Dc3NDbGFzc05hbWUoKSB7XHJcbiAgICB0aGlzLl9jb2x1bW5Dc3NDbGFzc05hbWUgPSBbYGNkay1jb2x1bW4tJHt0aGlzLmNzc0NsYXNzRnJpZW5kbHlOYW1lfWBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBoYXMgYmVlbiBleHRyYWN0ZWQgdG8gYSB1dGlsIGJlY2F1c2Ugb2YgVFMgNCBhbmQgVkUuXHJcbiAgICogVmlldyBFbmdpbmUgZG9lc24ndCBzdXBwb3J0IHByb3BlcnR5IHJlbmFtZSBpbmhlcml0YW5jZS5cclxuICAgKiBUUyA0LjAgZG9lc24ndCBhbGxvdyBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGFjY2Vzc29ycyBvciB2aWNlLXZlcnNhLlxyXG4gICAqIEBkb2NzLXByaXZhdGVcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgX3NldE5hbWVJbnB1dCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAvLyBJZiB0aGUgZGlyZWN0aXZlIGlzIHNldCB3aXRob3V0IGEgbmFtZSAodXBkYXRlZCBwcm9ncmFtbWF0aWNhbGx5KSwgdGhlbiB0aGlzIHNldHRlciB3aWxsXHJcbiAgICAvLyB0cmlnZ2VyIHdpdGggYW4gZW1wdHkgc3RyaW5nIGFuZCBzaG91bGQgbm90IG92ZXJ3cml0ZSB0aGUgcHJvZ3JhbW1hdGljYWxseSBzZXQgdmFsdWUuXHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgdGhpcy5fbmFtZSA9IHZhbHVlO1xyXG4gICAgICB0aGlzLmNzc0NsYXNzRnJpZW5kbHlOYW1lID0gdmFsdWUucmVwbGFjZSgvW15hLXowLTlfLV0vaWcsICctJyk7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZUNvbHVtbkNzc0NsYXNzTmFtZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0aWNreTogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdGlja3lFbmQ6IEJvb2xlYW5JbnB1dDtcclxufVxyXG5cclxuLyoqIEJhc2UgY2xhc3MgZm9yIHRoZSBjZWxscy4gQWRkcyBhIENTUyBjbGFzc25hbWUgdGhhdCBpZGVudGlmaWVzIHRoZSBjb2x1bW4gaXQgcmVuZGVycyBpbi4gKi9cclxuZXhwb3J0IGNsYXNzIEJhc2VDZGtDZWxsIHtcclxuICBjb25zdHJ1Y3Rvcihjb2x1bW5EZWY6IENka0NvbHVtbkRlZiwgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xyXG4gICAgLy8gSWYgSUUgMTEgaXMgZHJvcHBlZCBiZWZvcmUgd2Ugc3dpdGNoIHRvIHNldHRpbmcgYSBzaW5nbGUgY2xhc3MgbmFtZSwgY2hhbmdlIHRvIG11bHRpIHBhcmFtXHJcbiAgICAvLyB3aXRoIGRlc3RydWN0dXJpbmcuXHJcbiAgICBjb25zdCBjbGFzc0xpc3QgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuY2xhc3NMaXN0O1xyXG4gICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgY29sdW1uRGVmLl9jb2x1bW5Dc3NDbGFzc05hbWUpIHtcclxuICAgICAgY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEhlYWRlciBjZWxsIHRlbXBsYXRlIGNvbnRhaW5lciB0aGF0IGFkZHMgdGhlIHJpZ2h0IGNsYXNzZXMgYW5kIHJvbGUuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnY2RrLWhlYWRlci1jZWxsLCB0aFtjZGstaGVhZGVyLWNlbGxdJyxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiAnY2RrLWhlYWRlci1jZWxsJyxcclxuICAgICdyb2xlJzogJ2NvbHVtbmhlYWRlcicsXHJcbiAgfSxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0hlYWRlckNlbGwgZXh0ZW5kcyBCYXNlQ2RrQ2VsbCB7XHJcbiAgY29uc3RydWN0b3IoY29sdW1uRGVmOiBDZGtDb2x1bW5EZWYsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcclxuICAgIHN1cGVyKGNvbHVtbkRlZiwgZWxlbWVudFJlZik7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRm9vdGVyIGNlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdjZGstZm9vdGVyLWNlbGwsIHRkW2Nkay1mb290ZXItY2VsbF0nLFxyXG4gIGhvc3Q6IHtcclxuICAgICdjbGFzcyc6ICdjZGstZm9vdGVyLWNlbGwnLFxyXG4gICAgJ3JvbGUnOiAnZ3JpZGNlbGwnLFxyXG4gIH0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtGb290ZXJDZWxsIGV4dGVuZHMgQmFzZUNka0NlbGwge1xyXG4gIGNvbnN0cnVjdG9yKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XHJcbiAgICBzdXBlcihjb2x1bW5EZWYsIGVsZW1lbnRSZWYpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENlbGwgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgYWRkcyB0aGUgcmlnaHQgY2xhc3NlcyBhbmQgcm9sZS4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdjZGstY2VsbCwgdGRbY2RrLWNlbGxdJyxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiAnY2RrLWNlbGwnLFxyXG4gICAgJ3JvbGUnOiAnZ3JpZGNlbGwnLFxyXG4gIH0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtDZWxsIGV4dGVuZHMgQmFzZUNka0NlbGwge1xyXG4gIGNvbnN0cnVjdG9yKGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XHJcbiAgICBzdXBlcihjb2x1bW5EZWYsIGVsZW1lbnRSZWYpO1xyXG4gIH1cclxufVxyXG4iXX0=