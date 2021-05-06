/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Directive, IterableDiffers, TemplateRef, ViewContainerRef, ViewEncapsulation, Inject, Optional } from '@angular/core';
import { mixinHasStickyInput } from './can-stick';
import { CDK_TABLE } from './tokens';
/**
 * The row template that can be used by the mat-table. Should not be used outside of the
 * material library.
 */
export const CDK_ROW_TEMPLATE = `<ng-container cdkCellOutlet></ng-container>`;
/**
 * Base class for the CdkHeaderRowDef and CdkRowDef that handles checking their columns inputs
 * for changes and notifying the table.
 */
export class BaseRowDef {
    constructor(
    /** @docs-private */ template, _differs) {
        this.template = template;
        this._differs = _differs;
    }
    ngOnChanges(changes) {
        // Create a new columns differ if one does not yet exist. Initialize it based on initial value
        // of the columns property or an empty array if none is provided.
        if (!this._columnsDiffer) {
            const columns = (changes['columns'] && changes['columns'].currentValue) || [];
            this._columnsDiffer = this._differs.find(columns).create();
            this._columnsDiffer.diff(columns);
        }
    }
    /**
     * Returns the difference between the current columns and the columns from the last diff, or null
     * if there is no difference.
     */
    getColumnsDiff() {
        return this._columnsDiffer.diff(this.columns);
    }
    /** Gets this row def's relevant cell template from the provided column def. */
    extractCellTemplate(column) {
        if (this instanceof CdkHeaderRowDef) {
            return column.headerCell.template;
        }
        if (this instanceof CdkFooterRowDef) {
            return column.footerCell.template;
        }
        else {
            return column.cell.template;
        }
    }
}
BaseRowDef.decorators = [
    { type: Directive }
];
BaseRowDef.ctorParameters = () => [
    { type: TemplateRef },
    { type: IterableDiffers }
];
// Boilerplate for applying mixins to CdkHeaderRowDef.
/** @docs-private */
class CdkHeaderRowDefBase extends BaseRowDef {
}
const _CdkHeaderRowDefBase = mixinHasStickyInput(CdkHeaderRowDefBase);
/**
 * Header row definition for the CDK table.
 * Captures the header row's template and other header properties such as the columns to display.
 */
export class CdkHeaderRowDef extends _CdkHeaderRowDefBase {
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
    }
    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes) {
        super.ngOnChanges(changes);
    }
}
CdkHeaderRowDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkHeaderRowDef]',
                inputs: ['columns: cdkHeaderRowDef', 'sticky: cdkHeaderRowDefSticky'],
            },] }
];
CdkHeaderRowDef.ctorParameters = () => [
    { type: TemplateRef },
    { type: IterableDiffers },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TABLE,] }, { type: Optional }] }
];
// Boilerplate for applying mixins to CdkFooterRowDef.
/** @docs-private */
class CdkFooterRowDefBase extends BaseRowDef {
}
const _CdkFooterRowDefBase = mixinHasStickyInput(CdkFooterRowDefBase);
/**
 * Footer row definition for the CDK table.
 * Captures the footer row's template and other footer properties such as the columns to display.
 */
export class CdkFooterRowDef extends _CdkFooterRowDefBase {
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
    }
    // Prerender fails to recognize that ngOnChanges in a part of this class through inheritance.
    // Explicitly define it so that the method is called as part of the Angular lifecycle.
    ngOnChanges(changes) {
        super.ngOnChanges(changes);
    }
}
CdkFooterRowDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkFooterRowDef]',
                inputs: ['columns: cdkFooterRowDef', 'sticky: cdkFooterRowDefSticky'],
            },] }
];
CdkFooterRowDef.ctorParameters = () => [
    { type: TemplateRef },
    { type: IterableDiffers },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TABLE,] }, { type: Optional }] }
];
/**
 * Data row definition for the CDK table.
 * Captures the header row's template and other row properties such as the columns to display and
 * a when predicate that describes when this row should be used.
 */
export class CdkRowDef extends BaseRowDef {
    // TODO(andrewseguin): Add an input for providing a switch function to determine
    //   if this template should be used.
    constructor(template, _differs, _table) {
        super(template, _differs);
        this._table = _table;
    }
}
CdkRowDef.decorators = [
    { type: Directive, args: [{
                selector: '[cdkRowDef]',
                inputs: ['columns: cdkRowDefColumns', 'when: cdkRowDefWhen'],
            },] }
];
CdkRowDef.ctorParameters = () => [
    { type: TemplateRef },
    { type: IterableDiffers },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_TABLE,] }, { type: Optional }] }
];
/**
 * Outlet for rendering cells inside of a row or header row.
 * @docs-private
 */
export class CdkCellOutlet {
    constructor(_viewContainer) {
        this._viewContainer = _viewContainer;
        CdkCellOutlet.mostRecentCellOutlet = this;
    }
    ngOnDestroy() {
        // If this was the last outlet being rendered in the view, remove the reference
        // from the static property after it has been destroyed to avoid leaking memory.
        if (CdkCellOutlet.mostRecentCellOutlet === this) {
            CdkCellOutlet.mostRecentCellOutlet = null;
        }
    }
}
/**
 * Static property containing the latest constructed instance of this class.
 * Used by the CDK table when each CdkHeaderRow and CdkRow component is created using
 * createEmbeddedView. After one of these components are created, this property will provide
 * a handle to provide that component's cells and context. After init, the CdkCellOutlet will
 * construct the cells with the provided context.
 */
CdkCellOutlet.mostRecentCellOutlet = null;
CdkCellOutlet.decorators = [
    { type: Directive, args: [{ selector: '[cdkCellOutlet]' },] }
];
CdkCellOutlet.ctorParameters = () => [
    { type: ViewContainerRef }
];
/** Header template container that contains the cell outlet. Adds the right class and role. */
export class CdkHeaderRow {
}
CdkHeaderRow.decorators = [
    { type: Component, args: [{
                selector: 'cdk-header-row, tr[cdk-header-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'cdk-header-row',
                    'role': 'row',
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None
            },] }
];
/** Footer template container that contains the cell outlet. Adds the right class and role. */
export class CdkFooterRow {
}
CdkFooterRow.decorators = [
    { type: Component, args: [{
                selector: 'cdk-footer-row, tr[cdk-footer-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'cdk-footer-row',
                    'role': 'row',
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None
            },] }
];
/** Data row template container that contains the cell outlet. Adds the right class and role. */
export class CdkRow {
}
CdkRow.decorators = [
    { type: Component, args: [{
                selector: 'cdk-row, tr[cdk-row]',
                template: CDK_ROW_TEMPLATE,
                host: {
                    'class': 'cdk-row',
                    'role': 'row',
                },
                // See note on CdkTable for explanation on why this uses the default change detection strategy.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None
            },] }
];
/** Row that can be used to display a message when no data is shown in the table. */
export class CdkNoDataRow {
    constructor(templateRef) {
        this.templateRef = templateRef;
    }
}
CdkNoDataRow.decorators = [
    { type: Directive, args: [{
                selector: 'ng-template[cdkNoDataRow]'
            },] }
];
CdkNoDataRow.ctorParameters = () => [
    { type: TemplateRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90YWJsZS9yb3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsU0FBUyxFQUdULGVBQWUsRUFJZixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixNQUFNLEVBQ04sUUFBUSxFQUNULE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBeUIsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFeEUsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUVuQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyw2Q0FBNkMsQ0FBQztBQUU5RTs7O0dBR0c7QUFFSCxNQUFNLE9BQWdCLFVBQVU7SUFPOUI7SUFDSSxvQkFBb0IsQ0FBUSxRQUEwQixFQUFZLFFBQXlCO1FBQS9ELGFBQVEsR0FBUixRQUFRLENBQWtCO1FBQVksYUFBUSxHQUFSLFFBQVEsQ0FBaUI7SUFDL0YsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyw4RkFBOEY7UUFDOUYsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3hCLE1BQU0sT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUMzRCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNuQztJQUNILENBQUM7SUFFRDs7O09BR0c7SUFDSCxj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QUFDO2dCQUNULFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLElBQUksRUFBRTtvQkFDSixPQUFPLEVBQUUsU0FBUztvQkFDbEIsTUFBTSxFQUFFLEtBQUs7aUJBQ2Q7Z0JBQ0QsK0ZBQStGO2dCQUMvRiwrQ0FBK0M7Z0JBQy9DLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxPQUFPO2dCQUNoRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN0Qzs7QUFJRCxvRkFBb0Y7QUFJcEYsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFBbUIsV0FBNkI7UUFBN0IsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO0lBQUcsQ0FBQzs7O1lBSnJELFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsMkJBQTJCO2FBQ3RDOzs7WUF0U0MsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCb29sZWFuSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7XHJcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXHJcbiAgQ29tcG9uZW50LFxyXG4gIERpcmVjdGl2ZSxcclxuICBJdGVyYWJsZUNoYW5nZXMsXHJcbiAgSXRlcmFibGVEaWZmZXIsXHJcbiAgSXRlcmFibGVEaWZmZXJzLFxyXG4gIE9uQ2hhbmdlcyxcclxuICBPbkRlc3Ryb3ksXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBUZW1wbGF0ZVJlZixcclxuICBWaWV3Q29udGFpbmVyUmVmLFxyXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxyXG4gIEluamVjdCxcclxuICBPcHRpb25hbFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NhblN0aWNrLCBDYW5TdGlja0N0b3IsIG1peGluSGFzU3RpY2t5SW5wdXR9IGZyb20gJy4vY2FuLXN0aWNrJztcclxuaW1wb3J0IHtDZGtDZWxsRGVmLCBDZGtDb2x1bW5EZWZ9IGZyb20gJy4vY2VsbCc7XHJcbmltcG9ydCB7Q0RLX1RBQkxFfSBmcm9tICcuL3Rva2Vucyc7XHJcblxyXG4vKipcclxuICogVGhlIHJvdyB0ZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoZSBtYXQtdGFibGUuIFNob3VsZCBub3QgYmUgdXNlZCBvdXRzaWRlIG9mIHRoZVxyXG4gKiBtYXRlcmlhbCBsaWJyYXJ5LlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENES19ST1dfVEVNUExBVEUgPSBgPG5nLWNvbnRhaW5lciBjZGtDZWxsT3V0bGV0PjwvbmctY29udGFpbmVyPmA7XHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyBmb3IgdGhlIENka0hlYWRlclJvd0RlZiBhbmQgQ2RrUm93RGVmIHRoYXQgaGFuZGxlcyBjaGVja2luZyB0aGVpciBjb2x1bW5zIGlucHV0c1xyXG4gKiBmb3IgY2hhbmdlcyBhbmQgbm90aWZ5aW5nIHRoZSB0YWJsZS5cclxuICovXHJcbkBEaXJlY3RpdmUoKVxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZVJvd0RlZiBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XHJcbiAgLyoqIFRoZSBjb2x1bW5zIHRvIGJlIGRpc3BsYXllZCBvbiB0aGlzIHJvdy4gKi9cclxuICBjb2x1bW5zOiBJdGVyYWJsZTxzdHJpbmc+O1xyXG5cclxuICAvKiogRGlmZmVyIHVzZWQgdG8gY2hlY2sgaWYgYW55IGNoYW5nZXMgd2VyZSBtYWRlIHRvIHRoZSBjb2x1bW5zLiAqL1xyXG4gIHByb3RlY3RlZCBfY29sdW1uc0RpZmZlcjogSXRlcmFibGVEaWZmZXI8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAgIC8qKiBAZG9jcy1wcml2YXRlICovIHB1YmxpYyB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PiwgcHJvdGVjdGVkIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMpIHtcclxuICB9XHJcblxyXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgIC8vIENyZWF0ZSBhIG5ldyBjb2x1bW5zIGRpZmZlciBpZiBvbmUgZG9lcyBub3QgeWV0IGV4aXN0LiBJbml0aWFsaXplIGl0IGJhc2VkIG9uIGluaXRpYWwgdmFsdWVcclxuICAgIC8vIG9mIHRoZSBjb2x1bW5zIHByb3BlcnR5IG9yIGFuIGVtcHR5IGFycmF5IGlmIG5vbmUgaXMgcHJvdmlkZWQuXHJcbiAgICBpZiAoIXRoaXMuX2NvbHVtbnNEaWZmZXIpIHtcclxuICAgICAgY29uc3QgY29sdW1ucyA9IChjaGFuZ2VzWydjb2x1bW5zJ10gJiYgY2hhbmdlc1snY29sdW1ucyddLmN1cnJlbnRWYWx1ZSkgfHwgW107XHJcbiAgICAgIHRoaXMuX2NvbHVtbnNEaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQoY29sdW1ucykuY3JlYXRlKCk7XHJcbiAgICAgIHRoaXMuX2NvbHVtbnNEaWZmZXIuZGlmZihjb2x1bW5zKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgY3VycmVudCBjb2x1bW5zIGFuZCB0aGUgY29sdW1ucyBmcm9tIHRoZSBsYXN0IGRpZmYsIG9yIG51bGxcclxuICAgKiBpZiB0aGVyZSBpcyBubyBkaWZmZXJlbmNlLlxyXG4gICAqL1xyXG4gIGdldENvbHVtbnNEaWZmKCk6IEl0ZXJhYmxlQ2hhbmdlczxhbnk+fG51bGwge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbHVtbnNEaWZmZXIuZGlmZih0aGlzLmNvbHVtbnMpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhpcyByb3cgZGVmJ3MgcmVsZXZhbnQgY2VsbCB0ZW1wbGF0ZSBmcm9tIHRoZSBwcm92aWRlZCBjb2x1bW4gZGVmLiAqL1xyXG4gIGV4dHJhY3RDZWxsVGVtcGxhdGUoY29sdW1uOiBDZGtDb2x1bW5EZWYpOiBUZW1wbGF0ZVJlZjxhbnk+IHtcclxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgQ2RrSGVhZGVyUm93RGVmKSB7XHJcbiAgICAgIHJldHVybiBjb2x1bW4uaGVhZGVyQ2VsbC50ZW1wbGF0ZTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgQ2RrRm9vdGVyUm93RGVmKSB7XHJcbiAgICAgIHJldHVybiBjb2x1bW4uZm9vdGVyQ2VsbC50ZW1wbGF0ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBjb2x1bW4uY2VsbC50ZW1wbGF0ZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbi8vIEJvaWxlcnBsYXRlIGZvciBhcHBseWluZyBtaXhpbnMgdG8gQ2RrSGVhZGVyUm93RGVmLlxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5jbGFzcyBDZGtIZWFkZXJSb3dEZWZCYXNlIGV4dGVuZHMgQmFzZVJvd0RlZiB7fVxyXG5jb25zdCBfQ2RrSGVhZGVyUm93RGVmQmFzZTogQ2FuU3RpY2tDdG9yJnR5cGVvZiBDZGtIZWFkZXJSb3dEZWZCYXNlID1cclxuICAgIG1peGluSGFzU3RpY2t5SW5wdXQoQ2RrSGVhZGVyUm93RGVmQmFzZSk7XHJcblxyXG4vKipcclxuICogSGVhZGVyIHJvdyBkZWZpbml0aW9uIGZvciB0aGUgQ0RLIHRhYmxlLlxyXG4gKiBDYXB0dXJlcyB0aGUgaGVhZGVyIHJvdydzIHRlbXBsYXRlIGFuZCBvdGhlciBoZWFkZXIgcHJvcGVydGllcyBzdWNoIGFzIHRoZSBjb2x1bW5zIHRvIGRpc3BsYXkuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtIZWFkZXJSb3dEZWZdJyxcclxuICBpbnB1dHM6IFsnY29sdW1uczogY2RrSGVhZGVyUm93RGVmJywgJ3N0aWNreTogY2RrSGVhZGVyUm93RGVmU3RpY2t5J10sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtIZWFkZXJSb3dEZWYgZXh0ZW5kcyBfQ2RrSGVhZGVyUm93RGVmQmFzZSBpbXBsZW1lbnRzIENhblN0aWNrLCBPbkNoYW5nZXMge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT4sXHJcbiAgICBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgQEluamVjdChDREtfVEFCTEUpIEBPcHRpb25hbCgpIHB1YmxpYyBfdGFibGU/OiBhbnkpIHtcclxuICAgIHN1cGVyKHRlbXBsYXRlLCBfZGlmZmVycyk7XHJcbiAgfVxyXG5cclxuICAvLyBQcmVyZW5kZXIgZmFpbHMgdG8gcmVjb2duaXplIHRoYXQgbmdPbkNoYW5nZXMgaW4gYSBwYXJ0IG9mIHRoaXMgY2xhc3MgdGhyb3VnaCBpbmhlcml0YW5jZS5cclxuICAvLyBFeHBsaWNpdGx5IGRlZmluZSBpdCBzbyB0aGF0IHRoZSBtZXRob2QgaXMgY2FsbGVkIGFzIHBhcnQgb2YgdGhlIEFuZ3VsYXIgbGlmZWN5Y2xlLlxyXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpOiB2b2lkIHtcclxuICAgIHN1cGVyLm5nT25DaGFuZ2VzKGNoYW5nZXMpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3N0aWNreTogQm9vbGVhbklucHV0O1xyXG59XHJcblxyXG4vLyBCb2lsZXJwbGF0ZSBmb3IgYXBwbHlpbmcgbWl4aW5zIHRvIENka0Zvb3RlclJvd0RlZi5cclxuLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuY2xhc3MgQ2RrRm9vdGVyUm93RGVmQmFzZSBleHRlbmRzIEJhc2VSb3dEZWYge31cclxuY29uc3QgX0Nka0Zvb3RlclJvd0RlZkJhc2U6IENhblN0aWNrQ3RvciZ0eXBlb2YgQ2RrRm9vdGVyUm93RGVmQmFzZSA9XHJcbiAgICBtaXhpbkhhc1N0aWNreUlucHV0KENka0Zvb3RlclJvd0RlZkJhc2UpO1xyXG5cclxuLyoqXHJcbiAqIEZvb3RlciByb3cgZGVmaW5pdGlvbiBmb3IgdGhlIENESyB0YWJsZS5cclxuICogQ2FwdHVyZXMgdGhlIGZvb3RlciByb3cncyB0ZW1wbGF0ZSBhbmQgb3RoZXIgZm9vdGVyIHByb3BlcnRpZXMgc3VjaCBhcyB0aGUgY29sdW1ucyB0byBkaXNwbGF5LlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrRm9vdGVyUm93RGVmXScsXHJcbiAgaW5wdXRzOiBbJ2NvbHVtbnM6IGNka0Zvb3RlclJvd0RlZicsICdzdGlja3k6IGNka0Zvb3RlclJvd0RlZlN0aWNreSddLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrRm9vdGVyUm93RGVmIGV4dGVuZHMgX0Nka0Zvb3RlclJvd0RlZkJhc2UgaW1wbGVtZW50cyBDYW5TdGljaywgT25DaGFuZ2VzIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+LFxyXG4gICAgX2RpZmZlcnM6IEl0ZXJhYmxlRGlmZmVycyxcclxuICAgIEBJbmplY3QoQ0RLX1RBQkxFKSBAT3B0aW9uYWwoKSBwdWJsaWMgX3RhYmxlPzogYW55KSB7XHJcbiAgICBzdXBlcih0ZW1wbGF0ZSwgX2RpZmZlcnMpO1xyXG4gIH1cclxuXHJcbiAgLy8gUHJlcmVuZGVyIGZhaWxzIHRvIHJlY29nbml6ZSB0aGF0IG5nT25DaGFuZ2VzIGluIGEgcGFydCBvZiB0aGlzIGNsYXNzIHRocm91Z2ggaW5oZXJpdGFuY2UuXHJcbiAgLy8gRXhwbGljaXRseSBkZWZpbmUgaXQgc28gdGhhdCB0aGUgbWV0aG9kIGlzIGNhbGxlZCBhcyBwYXJ0IG9mIHRoZSBBbmd1bGFyIGxpZmVjeWNsZS5cclxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XHJcbiAgICBzdXBlci5uZ09uQ2hhbmdlcyhjaGFuZ2VzKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zdGlja3k6IEJvb2xlYW5JbnB1dDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERhdGEgcm93IGRlZmluaXRpb24gZm9yIHRoZSBDREsgdGFibGUuXHJcbiAqIENhcHR1cmVzIHRoZSBoZWFkZXIgcm93J3MgdGVtcGxhdGUgYW5kIG90aGVyIHJvdyBwcm9wZXJ0aWVzIHN1Y2ggYXMgdGhlIGNvbHVtbnMgdG8gZGlzcGxheSBhbmRcclxuICogYSB3aGVuIHByZWRpY2F0ZSB0aGF0IGRlc2NyaWJlcyB3aGVuIHRoaXMgcm93IHNob3VsZCBiZSB1c2VkLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrUm93RGVmXScsXHJcbiAgaW5wdXRzOiBbJ2NvbHVtbnM6IGNka1Jvd0RlZkNvbHVtbnMnLCAnd2hlbjogY2RrUm93RGVmV2hlbiddLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrUm93RGVmPFQ+IGV4dGVuZHMgQmFzZVJvd0RlZiB7XHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCBzaG91bGQgcmV0dXJuIHRydWUgaWYgdGhpcyByb3cgdGVtcGxhdGUgc2hvdWxkIGJlIHVzZWQgZm9yIHRoZSBwcm92aWRlZCBpbmRleFxyXG4gICAqIGFuZCByb3cgZGF0YS4gSWYgbGVmdCB1bmRlZmluZWQsIHRoaXMgcm93IHdpbGwgYmUgY29uc2lkZXJlZCB0aGUgZGVmYXVsdCByb3cgdGVtcGxhdGUgdG8gdXNlXHJcbiAgICogd2hlbiBubyBvdGhlciB3aGVuIGZ1bmN0aW9ucyByZXR1cm4gdHJ1ZSBmb3IgdGhlIGRhdGEuXHJcbiAgICogRm9yIGV2ZXJ5IHJvdywgdGhlcmUgbXVzdCBiZSBhdCBsZWFzdCBvbmUgd2hlbiBmdW5jdGlvbiB0aGF0IHBhc3NlcyBvciBhbiB1bmRlZmluZWQgdG8gZGVmYXVsdC5cclxuICAgKi9cclxuICB3aGVuOiAoaW5kZXg6IG51bWJlciwgcm93RGF0YTogVCkgPT4gYm9vbGVhbjtcclxuXHJcbiAgLy8gVE9ETyhhbmRyZXdzZWd1aW4pOiBBZGQgYW4gaW5wdXQgZm9yIHByb3ZpZGluZyBhIHN3aXRjaCBmdW5jdGlvbiB0byBkZXRlcm1pbmVcclxuICAvLyAgIGlmIHRoaXMgdGVtcGxhdGUgc2hvdWxkIGJlIHVzZWQuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PixcclxuICAgIF9kaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsXHJcbiAgICBASW5qZWN0KENES19UQUJMRSkgQE9wdGlvbmFsKCkgcHVibGljIF90YWJsZT86IGFueSkge1xyXG4gICAgc3VwZXIodGVtcGxhdGUsIF9kaWZmZXJzKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBDb250ZXh0IHByb3ZpZGVkIHRvIHRoZSByb3cgY2VsbHMgd2hlbiBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCBpcyBmYWxzZSAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENka0NlbGxPdXRsZXRSb3dDb250ZXh0PFQ+IHtcclxuICAvKiogRGF0YSBmb3IgdGhlIHJvdyB0aGF0IHRoaXMgY2VsbCBpcyBsb2NhdGVkIHdpdGhpbi4gKi9cclxuICAkaW1wbGljaXQ/OiBUO1xyXG5cclxuICAvKiogSW5kZXggb2YgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSBwcm92aWRlZCBkYXRhIGFycmF5LiAqL1xyXG4gIGluZGV4PzogbnVtYmVyO1xyXG5cclxuICAvKiogTGVuZ3RoIG9mIHRoZSBudW1iZXIgb2YgdG90YWwgcm93cy4gKi9cclxuICBjb3VudD86IG51bWJlcjtcclxuXHJcbiAgLyoqIFRydWUgaWYgdGhpcyBjZWxsIGlzIGNvbnRhaW5lZCBpbiB0aGUgZmlyc3Qgcm93LiAqL1xyXG4gIGZpcnN0PzogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFRydWUgaWYgdGhpcyBjZWxsIGlzIGNvbnRhaW5lZCBpbiB0aGUgbGFzdCByb3cuICovXHJcbiAgbGFzdD86IGJvb2xlYW47XHJcblxyXG4gIC8qKiBUcnVlIGlmIHRoaXMgY2VsbCBpcyBjb250YWluZWQgaW4gYSByb3cgd2l0aCBhbiBldmVuLW51bWJlcmVkIGluZGV4LiAqL1xyXG4gIGV2ZW4/OiBib29sZWFuO1xyXG5cclxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIGEgcm93IHdpdGggYW4gb2RkLW51bWJlcmVkIGluZGV4LiAqL1xyXG4gIG9kZD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb250ZXh0IHByb3ZpZGVkIHRvIHRoZSByb3cgY2VsbHMgd2hlbiBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCBpcyB0cnVlLiBUaGlzIGNvbnRleHQgaXMgdGhlIHNhbWVcclxuICogYXMgQ2RrQ2VsbE91dGxldFJvd0NvbnRleHQgZXhjZXB0IHRoYXQgdGhlIHNpbmdsZSBgaW5kZXhgIHZhbHVlIGlzIHJlcGxhY2VkIGJ5IGBkYXRhSW5kZXhgIGFuZFxyXG4gKiBgcmVuZGVySW5kZXhgLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDZGtDZWxsT3V0bGV0TXVsdGlSb3dDb250ZXh0PFQ+IHtcclxuICAvKiogRGF0YSBmb3IgdGhlIHJvdyB0aGF0IHRoaXMgY2VsbCBpcyBsb2NhdGVkIHdpdGhpbi4gKi9cclxuICAkaW1wbGljaXQ/OiBUO1xyXG5cclxuICAvKiogSW5kZXggb2YgdGhlIGRhdGEgb2JqZWN0IGluIHRoZSBwcm92aWRlZCBkYXRhIGFycmF5LiAqL1xyXG4gIGRhdGFJbmRleD86IG51bWJlcjtcclxuXHJcbiAgLyoqIEluZGV4IGxvY2F0aW9uIG9mIHRoZSByZW5kZXJlZCByb3cgdGhhdCB0aGlzIGNlbGwgaXMgbG9jYXRlZCB3aXRoaW4uICovXHJcbiAgcmVuZGVySW5kZXg/OiBudW1iZXI7XHJcblxyXG4gIC8qKiBMZW5ndGggb2YgdGhlIG51bWJlciBvZiB0b3RhbCByb3dzLiAqL1xyXG4gIGNvdW50PzogbnVtYmVyO1xyXG5cclxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBmaXJzdCByb3cuICovXHJcbiAgZmlyc3Q/OiBib29sZWFuO1xyXG5cclxuICAvKiogVHJ1ZSBpZiB0aGlzIGNlbGwgaXMgY29udGFpbmVkIGluIHRoZSBsYXN0IHJvdy4gKi9cclxuICBsYXN0PzogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFRydWUgaWYgdGhpcyBjZWxsIGlzIGNvbnRhaW5lZCBpbiBhIHJvdyB3aXRoIGFuIGV2ZW4tbnVtYmVyZWQgaW5kZXguICovXHJcbiAgZXZlbj86IGJvb2xlYW47XHJcblxyXG4gIC8qKiBUcnVlIGlmIHRoaXMgY2VsbCBpcyBjb250YWluZWQgaW4gYSByb3cgd2l0aCBhbiBvZGQtbnVtYmVyZWQgaW5kZXguICovXHJcbiAgb2RkPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIE91dGxldCBmb3IgcmVuZGVyaW5nIGNlbGxzIGluc2lkZSBvZiBhIHJvdyBvciBoZWFkZXIgcm93LlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tjZGtDZWxsT3V0bGV0XSd9KVxyXG5leHBvcnQgY2xhc3MgQ2RrQ2VsbE91dGxldCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgLyoqIFRoZSBvcmRlcmVkIGxpc3Qgb2YgY2VsbHMgdG8gcmVuZGVyIHdpdGhpbiB0aGlzIG91dGxldCdzIHZpZXcgY29udGFpbmVyICovXHJcbiAgY2VsbHM6IENka0NlbGxEZWZbXTtcclxuXHJcbiAgLyoqIFRoZSBkYXRhIGNvbnRleHQgdG8gYmUgcHJvdmlkZWQgdG8gZWFjaCBjZWxsICovXHJcbiAgY29udGV4dDogYW55O1xyXG5cclxuICAvKipcclxuICAgKiBTdGF0aWMgcHJvcGVydHkgY29udGFpbmluZyB0aGUgbGF0ZXN0IGNvbnN0cnVjdGVkIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXHJcbiAgICogVXNlZCBieSB0aGUgQ0RLIHRhYmxlIHdoZW4gZWFjaCBDZGtIZWFkZXJSb3cgYW5kIENka1JvdyBjb21wb25lbnQgaXMgY3JlYXRlZCB1c2luZ1xyXG4gICAqIGNyZWF0ZUVtYmVkZGVkVmlldy4gQWZ0ZXIgb25lIG9mIHRoZXNlIGNvbXBvbmVudHMgYXJlIGNyZWF0ZWQsIHRoaXMgcHJvcGVydHkgd2lsbCBwcm92aWRlXHJcbiAgICogYSBoYW5kbGUgdG8gcHJvdmlkZSB0aGF0IGNvbXBvbmVudCdzIGNlbGxzIGFuZCBjb250ZXh0LiBBZnRlciBpbml0LCB0aGUgQ2RrQ2VsbE91dGxldCB3aWxsXHJcbiAgICogY29uc3RydWN0IHRoZSBjZWxscyB3aXRoIHRoZSBwcm92aWRlZCBjb250ZXh0LlxyXG4gICAqL1xyXG4gIHN0YXRpYyBtb3N0UmVjZW50Q2VsbE91dGxldDogQ2RrQ2VsbE91dGxldHxudWxsID0gbnVsbDtcclxuXHJcbiAgY29uc3RydWN0b3IocHVibGljIF92aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICBDZGtDZWxsT3V0bGV0Lm1vc3RSZWNlbnRDZWxsT3V0bGV0ID0gdGhpcztcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgLy8gSWYgdGhpcyB3YXMgdGhlIGxhc3Qgb3V0bGV0IGJlaW5nIHJlbmRlcmVkIGluIHRoZSB2aWV3LCByZW1vdmUgdGhlIHJlZmVyZW5jZVxyXG4gICAgLy8gZnJvbSB0aGUgc3RhdGljIHByb3BlcnR5IGFmdGVyIGl0IGhhcyBiZWVuIGRlc3Ryb3llZCB0byBhdm9pZCBsZWFraW5nIG1lbW9yeS5cclxuICAgIGlmIChDZGtDZWxsT3V0bGV0Lm1vc3RSZWNlbnRDZWxsT3V0bGV0ID09PSB0aGlzKSB7XHJcbiAgICAgIENka0NlbGxPdXRsZXQubW9zdFJlY2VudENlbGxPdXRsZXQgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqIEhlYWRlciB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgY2VsbCBvdXRsZXQuIEFkZHMgdGhlIHJpZ2h0IGNsYXNzIGFuZCByb2xlLiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2Nkay1oZWFkZXItcm93LCB0cltjZGstaGVhZGVyLXJvd10nLFxyXG4gIHRlbXBsYXRlOiBDREtfUk9XX1RFTVBMQVRFLFxyXG4gIGhvc3Q6IHtcclxuICAgICdjbGFzcyc6ICdjZGstaGVhZGVyLXJvdycsXHJcbiAgICAncm9sZSc6ICdyb3cnLFxyXG4gIH0sXHJcbiAgLy8gU2VlIG5vdGUgb24gQ2RrVGFibGUgZm9yIGV4cGxhbmF0aW9uIG9uIHdoeSB0aGlzIHVzZXMgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneS5cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrSGVhZGVyUm93IHtcclxufVxyXG5cclxuXHJcbi8qKiBGb290ZXIgdGVtcGxhdGUgY29udGFpbmVyIHRoYXQgY29udGFpbnMgdGhlIGNlbGwgb3V0bGV0LiBBZGRzIHRoZSByaWdodCBjbGFzcyBhbmQgcm9sZS4gKi9cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdjZGstZm9vdGVyLXJvdywgdHJbY2RrLWZvb3Rlci1yb3ddJyxcclxuICB0ZW1wbGF0ZTogQ0RLX1JPV19URU1QTEFURSxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiAnY2RrLWZvb3Rlci1yb3cnLFxyXG4gICAgJ3JvbGUnOiAncm93JyxcclxuICB9LFxyXG4gIC8vIFNlZSBub3RlIG9uIENka1RhYmxlIGZvciBleHBsYW5hdGlvbiBvbiB3aHkgdGhpcyB1c2VzIHRoZSBkZWZhdWx0IGNoYW5nZSBkZXRlY3Rpb24gc3RyYXRlZ3kuXHJcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhbGlkYXRlLWRlY29yYXRvcnNcclxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0Zvb3RlclJvdyB7XHJcbn1cclxuXHJcbi8qKiBEYXRhIHJvdyB0ZW1wbGF0ZSBjb250YWluZXIgdGhhdCBjb250YWlucyB0aGUgY2VsbCBvdXRsZXQuIEFkZHMgdGhlIHJpZ2h0IGNsYXNzIGFuZCByb2xlLiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2Nkay1yb3csIHRyW2Nkay1yb3ddJyxcclxuICB0ZW1wbGF0ZTogQ0RLX1JPV19URU1QTEFURSxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiAnY2RrLXJvdycsXHJcbiAgICAncm9sZSc6ICdyb3cnLFxyXG4gIH0sXHJcbiAgLy8gU2VlIG5vdGUgb24gQ2RrVGFibGUgZm9yIGV4cGxhbmF0aW9uIG9uIHdoeSB0aGlzIHVzZXMgdGhlIGRlZmF1bHQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneS5cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrUm93IHtcclxufVxyXG5cclxuLyoqIFJvdyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRpc3BsYXkgYSBtZXNzYWdlIHdoZW4gbm8gZGF0YSBpcyBzaG93biBpbiB0aGUgdGFibGUuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnbmctdGVtcGxhdGVbY2RrTm9EYXRhUm93XSdcclxufSlcclxuZXhwb3J0IGNsYXNzIENka05vRGF0YVJvdyB7XHJcbiAgY29uc3RydWN0b3IocHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+KSB7fVxyXG59XHJcbiJdfQ==