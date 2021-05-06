/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ChangeDetectionStrategy, Component, Inject, Input, Optional, ViewChild, ViewEncapsulation, } from '@angular/core';
import { CdkCellDef, CdkColumnDef, CdkHeaderCellDef } from './cell';
import { CdkTable } from './table';
import { getTableTextColumnMissingParentTableError, getTableTextColumnMissingNameError, } from './table-errors';
import { TEXT_COLUMN_OPTIONS } from './tokens';
/**
 * Column that simply shows text content for the header and row cells. Assumes that the table
 * is using the native table implementation (`<table>`).
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input. Change the text justification to the start or end using the `justify`
 * input.
 */
export class CdkTextColumn {
    constructor(
    // `CdkTextColumn` is always requiring a table, but we just assert it manually
    // for better error reporting.
    // tslint:disable-next-line: lightweight-tokens
    _table, _options) {
        this._table = _table;
        this._options = _options;
        /** Alignment of the cell values. */
        this.justify = 'start';
        this._options = _options || {};
    }
    /** Column name that should be used to reference this column. */
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
        // With Ivy, inputs can be initialized before static query results are
        // available. In that case, we defer the synchronization until "ngOnInit" fires.
        this._syncColumnDefName();
    }
    ngOnInit() {
        this._syncColumnDefName();
        if (this.headerText === undefined) {
            this.headerText = this._createDefaultHeaderText();
        }
        if (!this.dataAccessor) {
            this.dataAccessor =
                this._options.defaultDataAccessor || ((data, name) => data[name]);
        }
        if (this._table) {
            // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
            // since the columnDef will not pick up its content by the time the table finishes checking
            // its content and initializing the rows.
            this.columnDef.cell = this.cell;
            this.columnDef.headerCell = this.headerCell;
            this._table.addColumnDef(this.columnDef);
        }
        else if (typeof ngDevMode === 'undefined' || ngDevMode) {
            throw getTableTextColumnMissingParentTableError();
        }
    }
    ngOnDestroy() {
        if (this._table) {
            this._table.removeColumnDef(this.columnDef);
        }
    }
    /**
     * Creates a default header text. Use the options' header text transformation function if one
     * has been provided. Otherwise simply capitalize the column name.
     */
    _createDefaultHeaderText() {
        const name = this.name;
        if (!name && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableTextColumnMissingNameError();
        }
        if (this._options && this._options.defaultHeaderTextTransform) {
            return this._options.defaultHeaderTextTransform(name);
        }
        return name[0].toUpperCase() + name.slice(1);
    }
    /** Synchronizes the column definition name with the text column name. */
    _syncColumnDefName() {
        if (this.columnDef) {
            this.columnDef.name = this.name;
        }
    }
}
CdkTextColumn.decorators = [
    { type: Component, args: [{
                selector: 'cdk-text-column',
                template: `
    <ng-container cdkColumnDef>
      <th cdk-header-cell *cdkHeaderCellDef [style.text-align]="justify">
        {{headerText}}
      </th>
      <td cdk-cell *cdkCellDef="let data" [style.text-align]="justify">
        {{dataAccessor(data, name)}}
      </td>
    </ng-container>
  `,
                encapsulation: ViewEncapsulation.None,
                // Change detection is intentionally not set to OnPush. This component's template will be provided
                // to the table to be inserted into its view. This is problematic when change detection runs since
                // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
                // mean's the template in the table's view will not have the updated value (and in fact will cause
                // an ExpressionChangedAfterItHasBeenCheckedError).
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default
            },] }
];
CdkTextColumn.ctorParameters = () => [
    { type: CdkTable, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [TEXT_COLUMN_OPTIONS,] }] }
];
CdkTextColumn.propDecorators = {
    name: [{ type: Input }],
    headerText: [{ type: Input }],
    dataAccessor: [{ type: Input }],
    justify: [{ type: Input }],
    columnDef: [{ type: ViewChild, args: [CdkColumnDef, { static: true },] }],
    cell: [{ type: ViewChild, args: [CdkCellDef, { static: true },] }],
    headerCell: [{ type: ViewChild, args: [CdkHeaderCellDef, { static: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jb2x1bW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RhYmxlL3RleHQtY29sdW1uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBR0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDbEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQztBQUNqQyxPQUFPLEVBQ0wseUNBQXlDLEVBQ3pDLGtDQUFrQyxHQUNuQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3hCLE9BQU8sRUFBQyxtQkFBbUIsRUFBb0IsTUFBTSxVQUFVLENBQUM7QUFHaEU7Ozs7Ozs7O0dBUUc7QUFzQkgsTUFBTSxPQUFPLGFBQWE7SUFxRHhCO0lBQ0ksOEVBQThFO0lBQzlFLDhCQUE4QjtJQUM5QiwrQ0FBK0M7SUFDM0IsTUFBbUIsRUFDVSxRQUE4QjtRQUQzRCxXQUFNLEdBQU4sTUFBTSxDQUFhO1FBQ1UsYUFBUSxHQUFSLFFBQVEsQ0FBc0I7UUE3Qm5GLG9DQUFvQztRQUMzQixZQUFPLEdBQWtCLE9BQU8sQ0FBQztRQTZCeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLElBQUksRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUEzREQsZ0VBQWdFO0lBQ2hFLElBQ0ksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBWTtRQUNuQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVsQixzRUFBc0U7UUFDdEUsZ0ZBQWdGO1FBQ2hGLElBQUksQ0FBQyxrQkFB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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENvbXBvbmVudCxcclxuICBJbmplY3QsXHJcbiAgSW5wdXQsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBPcHRpb25hbCxcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0VuY2Fwc3VsYXRpb24sXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q2RrQ2VsbERlZiwgQ2RrQ29sdW1uRGVmLCBDZGtIZWFkZXJDZWxsRGVmfSBmcm9tICcuL2NlbGwnO1xyXG5pbXBvcnQge0Nka1RhYmxlfSBmcm9tICcuL3RhYmxlJztcclxuaW1wb3J0IHtcclxuICBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nUGFyZW50VGFibGVFcnJvcixcclxuICBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nTmFtZUVycm9yLFxyXG59IGZyb20gJy4vdGFibGUtZXJyb3JzJztcclxuaW1wb3J0IHtURVhUX0NPTFVNTl9PUFRJT05TLCBUZXh0Q29sdW1uT3B0aW9uc30gZnJvbSAnLi90b2tlbnMnO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDb2x1bW4gdGhhdCBzaW1wbHkgc2hvd3MgdGV4dCBjb250ZW50IGZvciB0aGUgaGVhZGVyIGFuZCByb3cgY2VsbHMuIEFzc3VtZXMgdGhhdCB0aGUgdGFibGVcclxuICogaXMgdXNpbmcgdGhlIG5hdGl2ZSB0YWJsZSBpbXBsZW1lbnRhdGlvbiAoYDx0YWJsZT5gKS5cclxuICpcclxuICogQnkgZGVmYXVsdCwgdGhlIG5hbWUgb2YgdGhpcyBjb2x1bW4gd2lsbCBiZSB0aGUgaGVhZGVyIHRleHQgYW5kIGRhdGEgcHJvcGVydHkgYWNjZXNzb3IuXHJcbiAqIFRoZSBoZWFkZXIgdGV4dCBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIHRoZSBgaGVhZGVyVGV4dGAgaW5wdXQuIENlbGwgdmFsdWVzIGNhbiBiZSBvdmVycmlkZGVuIHdpdGhcclxuICogdGhlIGBkYXRhQWNjZXNzb3JgIGlucHV0LiBDaGFuZ2UgdGhlIHRleHQganVzdGlmaWNhdGlvbiB0byB0aGUgc3RhcnQgb3IgZW5kIHVzaW5nIHRoZSBganVzdGlmeWBcclxuICogaW5wdXQuXHJcbiAqL1xyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2Nkay10ZXh0LWNvbHVtbicsXHJcbiAgdGVtcGxhdGU6IGBcclxuICAgIDxuZy1jb250YWluZXIgY2RrQ29sdW1uRGVmPlxyXG4gICAgICA8dGggY2RrLWhlYWRlci1jZWxsICpjZGtIZWFkZXJDZWxsRGVmIFtzdHlsZS50ZXh0LWFsaWduXT1cImp1c3RpZnlcIj5cclxuICAgICAgICB7e2hlYWRlclRleHR9fVxyXG4gICAgICA8L3RoPlxyXG4gICAgICA8dGQgY2RrLWNlbGwgKmNka0NlbGxEZWY9XCJsZXQgZGF0YVwiIFtzdHlsZS50ZXh0LWFsaWduXT1cImp1c3RpZnlcIj5cclxuICAgICAgICB7e2RhdGFBY2Nlc3NvcihkYXRhLCBuYW1lKX19XHJcbiAgICAgIDwvdGQ+XHJcbiAgICA8L25nLWNvbnRhaW5lcj5cclxuICBgLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgLy8gQ2hhbmdlIGRldGVjdGlvbiBpcyBpbnRlbnRpb25hbGx5IG5vdCBzZXQgdG8gT25QdXNoLiBUaGlzIGNvbXBvbmVudCdzIHRlbXBsYXRlIHdpbGwgYmUgcHJvdmlkZWRcclxuICAvLyB0byB0aGUgdGFibGUgdG8gYmUgaW5zZXJ0ZWQgaW50byBpdHMgdmlldy4gVGhpcyBpcyBwcm9ibGVtYXRpYyB3aGVuIGNoYW5nZSBkZXRlY3Rpb24gcnVucyBzaW5jZVxyXG4gIC8vIHRoZSBiaW5kaW5ncyBpbiB0aGlzIHRlbXBsYXRlIHdpbGwgYmUgZXZhbHVhdGVkIF9hZnRlcl8gdGhlIHRhYmxlJ3MgdmlldyBpcyBldmFsdWF0ZWQsIHdoaWNoXHJcbiAgLy8gbWVhbidzIHRoZSB0ZW1wbGF0ZSBpbiB0aGUgdGFibGUncyB2aWV3IHdpbGwgbm90IGhhdmUgdGhlIHVwZGF0ZWQgdmFsdWUgKGFuZCBpbiBmYWN0IHdpbGwgY2F1c2VcclxuICAvLyBhbiBFeHByZXNzaW9uQ2hhbmdlZEFmdGVySXRIYXNCZWVuQ2hlY2tlZEVycm9yKS5cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFsaWRhdGUtZGVjb3JhdG9yc1xyXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka1RleHRDb2x1bW48VD4gaW1wbGVtZW50cyBPbkRlc3Ryb3ksIE9uSW5pdCB7XHJcbiAgLyoqIENvbHVtbiBuYW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gcmVmZXJlbmNlIHRoaXMgY29sdW1uLiAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG5hbWUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLl9uYW1lO1xyXG4gIH1cclxuICBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG5cclxuICAgIC8vIFdpdGggSXZ5LCBpbnB1dHMgY2FuIGJlIGluaXRpYWxpemVkIGJlZm9yZSBzdGF0aWMgcXVlcnkgcmVzdWx0cyBhcmVcclxuICAgIC8vIGF2YWlsYWJsZS4gSW4gdGhhdCBjYXNlLCB3ZSBkZWZlciB0aGUgc3luY2hyb25pemF0aW9uIHVudGlsIFwibmdPbkluaXRcIiBmaXJlcy5cclxuICAgIHRoaXMuX3N5bmNDb2x1bW5EZWZOYW1lKCk7XHJcbiAgfVxyXG4gIF9uYW1lOiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRleHQgbGFiZWwgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIuIElmIHRoaXMgcHJvcGVydHkgaXMgbm90XHJcbiAgICogc2V0LCB0aGUgaGVhZGVyIHRleHQgd2lsbCBkZWZhdWx0IHRvIHRoZSBjb2x1bW4gbmFtZSB3aXRoIGl0cyBmaXJzdCBsZXR0ZXIgY2FwaXRhbGl6ZWQuXHJcbiAgICovXHJcbiAgQElucHV0KCkgaGVhZGVyVGV4dDogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBBY2Nlc3NvciBmdW5jdGlvbiB0byByZXRyaWV2ZSB0aGUgZGF0YSByZW5kZXJlZCBmb3IgZWFjaCBjZWxsLiBJZiB0aGlzXHJcbiAgICogcHJvcGVydHkgaXMgbm90IHNldCwgdGhlIGRhdGEgY2VsbHMgd2lsbCByZW5kZXIgdGhlIHZhbHVlIGZvdW5kIGluIHRoZSBkYXRhJ3MgcHJvcGVydHkgbWF0Y2hpbmdcclxuICAgKiB0aGUgY29sdW1uJ3MgbmFtZS4gRm9yIGV4YW1wbGUsIGlmIHRoZSBjb2x1bW4gaXMgbmFtZWQgYGlkYCwgdGhlbiB0aGUgcmVuZGVyZWQgdmFsdWUgd2lsbCBiZVxyXG4gICAqIHZhbHVlIGRlZmluZWQgYnkgdGhlIGRhdGEncyBgaWRgIHByb3BlcnR5LlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpIGRhdGFBY2Nlc3NvcjogKGRhdGE6IFQsIG5hbWU6IHN0cmluZykgPT4gc3RyaW5nO1xyXG5cclxuICAvKiogQWxpZ25tZW50IG9mIHRoZSBjZWxsIHZhbHVlcy4gKi9cclxuICBASW5wdXQoKSBqdXN0aWZ5OiAnc3RhcnQnfCdlbmQnID0gJ3N0YXJ0JztcclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuICBAVmlld0NoaWxkKENka0NvbHVtbkRlZiwge3N0YXRpYzogdHJ1ZX0pIGNvbHVtbkRlZjogQ2RrQ29sdW1uRGVmO1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgY29sdW1uIGNlbGwgaXMgcHJvdmlkZWQgdG8gdGhlIGNvbHVtbiBkdXJpbmcgYG5nT25Jbml0YCB3aXRoIGEgc3RhdGljIHF1ZXJ5LlxyXG4gICAqIE5vcm1hbGx5LCB0aGlzIHdpbGwgYmUgcmV0cmlldmVkIGJ5IHRoZSBjb2x1bW4gdXNpbmcgYENvbnRlbnRDaGlsZGAsIGJ1dCB0aGF0IGFzc3VtZXMgdGhlXHJcbiAgICogY29sdW1uIGRlZmluaXRpb24gd2FzIHByb3ZpZGVkIGluIHRoZSBzYW1lIHZpZXcgYXMgdGhlIHRhYmxlLCB3aGljaCBpcyBub3QgdGhlIGNhc2Ugd2l0aCB0aGlzXHJcbiAgICogY29tcG9uZW50LlxyXG4gICAqIEBkb2NzLXByaXZhdGVcclxuICAgKi9cclxuICBAVmlld0NoaWxkKENka0NlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBjZWxsOiBDZGtDZWxsRGVmO1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgY29sdW1uIGhlYWRlckNlbGwgaXMgcHJvdmlkZWQgdG8gdGhlIGNvbHVtbiBkdXJpbmcgYG5nT25Jbml0YCB3aXRoIGEgc3RhdGljIHF1ZXJ5LlxyXG4gICAqIE5vcm1hbGx5LCB0aGlzIHdpbGwgYmUgcmV0cmlldmVkIGJ5IHRoZSBjb2x1bW4gdXNpbmcgYENvbnRlbnRDaGlsZGAsIGJ1dCB0aGF0IGFzc3VtZXMgdGhlXHJcbiAgICogY29sdW1uIGRlZmluaXRpb24gd2FzIHByb3ZpZGVkIGluIHRoZSBzYW1lIHZpZXcgYXMgdGhlIHRhYmxlLCB3aGljaCBpcyBub3QgdGhlIGNhc2Ugd2l0aCB0aGlzXHJcbiAgICogY29tcG9uZW50LlxyXG4gICAqIEBkb2NzLXByaXZhdGVcclxuICAgKi9cclxuICBAVmlld0NoaWxkKENka0hlYWRlckNlbGxEZWYsIHtzdGF0aWM6IHRydWV9KSBoZWFkZXJDZWxsOiBDZGtIZWFkZXJDZWxsRGVmO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgLy8gYENka1RleHRDb2x1bW5gIGlzIGFsd2F5cyByZXF1aXJpbmcgYSB0YWJsZSwgYnV0IHdlIGp1c3QgYXNzZXJ0IGl0IG1hbnVhbGx5XHJcbiAgICAgIC8vIGZvciBiZXR0ZXIgZXJyb3IgcmVwb3J0aW5nLlxyXG4gICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IGxpZ2h0d2VpZ2h0LXRva2Vuc1xyXG4gICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF90YWJsZTogQ2RrVGFibGU8VD4sXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoVEVYVF9DT0xVTU5fT1BUSU9OUykgcHJpdmF0ZSBfb3B0aW9uczogVGV4dENvbHVtbk9wdGlvbnM8VD4pIHtcclxuICAgIHRoaXMuX29wdGlvbnMgPSBfb3B0aW9ucyB8fCB7fTtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5fc3luY0NvbHVtbkRlZk5hbWUoKTtcclxuXHJcbiAgICBpZiAodGhpcy5oZWFkZXJUZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5oZWFkZXJUZXh0ID0gdGhpcy5fY3JlYXRlRGVmYXVsdEhlYWRlclRleHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuZGF0YUFjY2Vzc29yKSB7XHJcbiAgICAgIHRoaXMuZGF0YUFjY2Vzc29yID1cclxuICAgICAgICAgIHRoaXMuX29wdGlvbnMuZGVmYXVsdERhdGFBY2Nlc3NvciB8fCAoKGRhdGE6IFQsIG5hbWU6IHN0cmluZykgPT4gKGRhdGEgYXMgYW55KVtuYW1lXSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3RhYmxlKSB7XHJcbiAgICAgIC8vIFByb3ZpZGUgdGhlIGNlbGwgYW5kIGhlYWRlckNlbGwgZGlyZWN0bHkgdG8gdGhlIHRhYmxlIHdpdGggdGhlIHN0YXRpYyBgVmlld0NoaWxkYCBxdWVyeSxcclxuICAgICAgLy8gc2luY2UgdGhlIGNvbHVtbkRlZiB3aWxsIG5vdCBwaWNrIHVwIGl0cyBjb250ZW50IGJ5IHRoZSB0aW1lIHRoZSB0YWJsZSBmaW5pc2hlcyBjaGVja2luZ1xyXG4gICAgICAvLyBpdHMgY29udGVudCBhbmQgaW5pdGlhbGl6aW5nIHRoZSByb3dzLlxyXG4gICAgICB0aGlzLmNvbHVtbkRlZi5jZWxsID0gdGhpcy5jZWxsO1xyXG4gICAgICB0aGlzLmNvbHVtbkRlZi5oZWFkZXJDZWxsID0gdGhpcy5oZWFkZXJDZWxsO1xyXG4gICAgICB0aGlzLl90YWJsZS5hZGRDb2x1bW5EZWYodGhpcy5jb2x1bW5EZWYpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcclxuICAgICAgdGhyb3cgZ2V0VGFibGVUZXh0Q29sdW1uTWlzc2luZ1BhcmVudFRhYmxlRXJyb3IoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuX3RhYmxlKSB7XHJcbiAgICAgIHRoaXMuX3RhYmxlLnJlbW92ZUNvbHVtbkRlZih0aGlzLmNvbHVtbkRlZik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgZGVmYXVsdCBoZWFkZXIgdGV4dC4gVXNlIHRoZSBvcHRpb25zJyBoZWFkZXIgdGV4dCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbiBpZiBvbmVcclxuICAgKiBoYXMgYmVlbiBwcm92aWRlZC4gT3RoZXJ3aXNlIHNpbXBseSBjYXBpdGFsaXplIHRoZSBjb2x1bW4gbmFtZS5cclxuICAgKi9cclxuICBfY3JlYXRlRGVmYXVsdEhlYWRlclRleHQoKSB7XHJcbiAgICBjb25zdCBuYW1lID0gdGhpcy5uYW1lO1xyXG5cclxuICAgIGlmICghbmFtZSAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xyXG4gICAgICB0aHJvdyBnZXRUYWJsZVRleHRDb2x1bW5NaXNzaW5nTmFtZUVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX29wdGlvbnMgJiYgdGhpcy5fb3B0aW9ucy5kZWZhdWx0SGVhZGVyVGV4dFRyYW5zZm9ybSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5kZWZhdWx0SGVhZGVyVGV4dFRyYW5zZm9ybShuYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcclxuICB9XHJcblxyXG4gIC8qKiBTeW5jaHJvbml6ZXMgdGhlIGNvbHVtbiBkZWZpbml0aW9uIG5hbWUgd2l0aCB0aGUgdGV4dCBjb2x1bW4gbmFtZS4gKi9cclxuICBwcml2YXRlIF9zeW5jQ29sdW1uRGVmTmFtZSgpIHtcclxuICAgIGlmICh0aGlzLmNvbHVtbkRlZikge1xyXG4gICAgICB0aGlzLmNvbHVtbkRlZi5uYW1lID0gdGhpcy5uYW1lO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=