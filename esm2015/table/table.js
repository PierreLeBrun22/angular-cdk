/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { _DisposeViewRepeaterStrategy, isDataSource, _VIEW_REPEATER_STRATEGY, } from '@angular/cdk/collections';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, ElementRef, EmbeddedViewRef, Inject, Input, IterableDiffers, Optional, QueryList, SkipSelf, ViewChild, ViewContainerRef, ViewEncapsulation, } from '@angular/core';
import { BehaviorSubject, isObservable, of as observableOf, Subject, } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CdkColumnDef } from './cell';
import { _CoalescedStyleScheduler, _COALESCED_STYLE_SCHEDULER } from './coalesced-style-scheduler';
import { CdkCellOutlet, CdkFooterRowDef, CdkHeaderRowDef, CdkNoDataRow, CdkRowDef } from './row';
import { StickyStyler } from './sticky-styler';
import { getTableDuplicateColumnNameError, getTableMissingMatchingRowDefError, getTableMissingRowDefsError, getTableMultipleDefaultRowDefsError, getTableUnknownColumnError, getTableUnknownDataSourceError } from './table-errors';
import { STICKY_POSITIONING_LISTENER } from './sticky-position-listener';
import { CDK_TABLE } from './tokens';
/**
 * Provides a handle for the table to grab the view container's ng-container to insert data rows.
 * @docs-private
 */
export class DataRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
    }
}
DataRowOutlet.decorators = [
    { type: Directive, args: [{ selector: '[rowOutlet]' },] }
];
DataRowOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: ElementRef }
];
/**
 * Provides a handle for the table to grab the view container's ng-container to insert the header.
 * @docs-private
 */
export class HeaderRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
    }
}
HeaderRowOutlet.decorators = [
    { type: Directive, args: [{ selector: '[headerRowOutlet]' },] }
];
HeaderRowOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: ElementRef }
];
/**
 * Provides a handle for the table to grab the view container's ng-container to insert the footer.
 * @docs-private
 */
export class FooterRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
    }
}
FooterRowOutlet.decorators = [
    { type: Directive, args: [{ selector: '[footerRowOutlet]' },] }
];
FooterRowOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: ElementRef }
];
/**
 * Provides a handle for the table to grab the view
 * container's ng-container to insert the no data row.
 * @docs-private
 */
export class NoDataRowOutlet {
    constructor(viewContainer, elementRef) {
        this.viewContainer = viewContainer;
        this.elementRef = elementRef;
    }
}
NoDataRowOutlet.decorators = [
    { type: Directive, args: [{ selector: '[noDataRowOutlet]' },] }
];
NoDataRowOutlet.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: ElementRef }
];
/**
 * The table template that can be used by the mat-table. Should not be used outside of the
 * material library.
 * @docs-private
 */
export const CDK_TABLE_TEMPLATE = 
// Note that according to MDN, the `caption` element has to be projected as the **first**
// element in the table. See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/caption
`
  <ng-content select="caption"></ng-content>
  <ng-content select="colgroup, col"></ng-content>
  <ng-container headerRowOutlet></ng-container>
  <ng-container rowOutlet></ng-container>
  <ng-container noDataRowOutlet></ng-container>
  <ng-container footerRowOutlet></ng-container>
`;
/**
 * Class used to conveniently type the embedded view ref for rows with a context.
 * @docs-private
 */
class RowViewRef extends EmbeddedViewRef {
}
/**
 * A data table that can render a header row, data rows, and a footer row.
 * Uses the dataSource input to determine the data to be rendered. The data can be provided either
 * as a data array, an Observable stream that emits the data array to render, or a DataSource with a
 * connect function that will return an Observable stream that emits the data array to render.
 */
export class CdkTable {
    constructor(_differs, _changeDetectorRef, _elementRef, role, _dir, _document, _platform, 
    /**
     * @deprecated `_coalescedStyleScheduler`, `_viewRepeater` and `_viewportRuler`
     *    parameters to become required.
     * @breaking-change 11.0.0
     */
    _viewRepeater, _coalescedStyleScheduler, _stickyPositioningListener, 
    // Optional for backwards compatibility. The viewport ruler is provided in root. Therefore,
    // this property will never be null.
    // tslint:disable-next-line: lightweight-tokens
    _viewportRuler) {
        this._differs = _differs;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._dir = _dir;
        this._platform = _platform;
        this._viewRepeater = _viewRepeater;
        this._coalescedStyleScheduler = _coalescedStyleScheduler;
        this._stickyPositioningListener = _stickyPositioningListener;
        this._viewportRuler = _viewportRuler;
        /** Subject that emits when the component has been destroyed. */
        this._onDestroy = new Subject();
        /**
         * Map of all the user's defined columns (header, data, and footer cell template) identified by
         * name. Collection populated by the column definitions gathered by `ContentChildren` as well as
         * any custom column definitions added to `_customColumnDefs`.
         */
        this._columnDefsByName = new Map();
        /**
         * Column definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * column definitions as *its* content child.
         */
        this._customColumnDefs = new Set();
        /**
         * Data row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * built-in data rows as *its* content child.
         */
        this._customRowDefs = new Set();
        /**
         * Header row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has
         * built-in header rows as *its* content child.
         */
        this._customHeaderRowDefs = new Set();
        /**
         * Footer row definitions that were defined outside of the direct content children of the table.
         * These will be defined when, e.g., creating a wrapper around the cdkTable that has a
         * built-in footer row as *its* content child.
         */
        this._customFooterRowDefs = new Set();
        /**
         * Whether the header row definition has been changed. Triggers an update to the header row after
         * content is checked. Initialized as true so that the table renders the initial set of rows.
         */
        this._headerRowDefChanged = true;
        /**
         * Whether the footer row definition has been changed. Triggers an update to the footer row after
         * content is checked. Initialized as true so that the table renders the initial set of rows.
         */
        this._footerRowDefChanged = true;
        /**
         * Whether the sticky column styles need to be updated. Set to `true` when the visible columns
         * change.
         */
        this._stickyColumnStylesNeedReset = true;
        /**
         * Whether the sticky styler should recalculate cell widths when applying sticky styles. If
         * `false`, cached values will be used instead. This is only applicable to tables with
         * {@link fixedLayout} enabled. For other tables, cell widths will always be recalculated.
         */
        this._forceRecalculateCellWidths = true;
        /**
         * Cache of the latest rendered `RenderRow` objects as a map for easy retrieval when constructing
         * a new list of `RenderRow` objects for rendering rows. Since the new list is constructed with
         * the cached `RenderRow` objects when possible, the row identity is preserved when the data
         * and row template matches, which allows the `IterableDiffer` to check rows by reference
         * and understand which rows are added/moved/removed.
         *
         * Implemented as a map of maps where the first key is the `data: T` object and the second is the
         * `CdkRowDef<T>` object. With the two keys, the cache points to a `RenderRow<T>` object that
         * contains an array of created pairs. The array is necessary to handle cases where the data
         * array contains multiple duplicate data objects and each instantiated `RenderRow` must be
         * stored.
         */
        this._cachedRenderRowsMap = new Map();
        /**
         * CSS class added to any row or cell that has sticky positioning applied. May be overriden by
         * table subclasses.
         */
        this.stickyCssClass = 'cdk-table-sticky';
        /**
         * Whether to manually add positon: sticky to all sticky cell elements. Not needed if
         * the position is set in a selector associated with the value of stickyCssClass. May be
         * overridden by table subclasses
         */
        this.needsPositionStickyOnElement = true;
        /** Whether the no data row is currently showing anything. */
        this._isShowingNoDataRow = false;
        this._multiTemplateDataRows = false;
        this._fixedLayout = false;
        // TODO(andrewseguin): Remove max value as the end index
        //   and instead calculate the view on init and scroll.
        /**
         * Stream containing the latest information on what rows are being displayed on screen.
         * Can be used by the data source to as a heuristic of what data should be provided.
         *
         * @docs-private
         */
        this.viewChange = new BehaviorSubject({ start: 0, end: Number.MAX_VALUE });
        if (!role) {
            this._elementRef.nativeElement.setAttribute('role', 'grid');
        }
        this._document = _document;
        this._isNativeHtmlTable = this._elementRef.nativeElement.nodeName === 'TABLE';
    }
    /**
     * Tracking function that will be used to check the differences in data changes. Used similarly
     * to `ngFor` `trackBy` function. Optimize row operations by identifying a row based on its data
     * relative to the function to know if a row should be added/removed/moved.
     * Accepts a function that takes two parameters, `index` and `item`.
     */
    get trackBy() {
        return this._trackByFn;
    }
    set trackBy(fn) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && fn != null && typeof fn !== 'function') {
            console.warn(`trackBy must be a function, but received ${JSON.stringify(fn)}.`);
        }
        this._trackByFn = fn;
    }
    /**
     * The table's source of data, which can be provided in three ways (in order of complexity):
     *   - Simple data array (each object represents one table row)
     *   - Stream that emits a data array each time the array changes
     *   - `DataSource` object that implements the connect/disconnect interface.
     *
     * If a data array is provided, the table must be notified when the array's objects are
     * added, removed, or moved. This can be done by calling the `renderRows()` function which will
     * render the diff since the last table render. If the data array reference is changed, the table
     * will automatically trigger an update to the rows.
     *
     * When providing an Observable stream, the table will trigger an update automatically when the
     * stream emits a new array of data.
     *
     * Finally, when providing a `DataSource` object, the table will use the Observable stream
     * provided by the connect function and trigger updates when that stream emits new data array
     * values. During the table's ngOnDestroy or when the data source is removed from the table, the
     * table will call the DataSource's `disconnect` function (may be useful for cleaning up any
     * subscriptions registered during the connect process).
     */
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(dataSource) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }
    /**
     * Whether to allow multiple rows per data object by evaluating which rows evaluate their 'when'
     * predicate to true. If `multiTemplateDataRows` is false, which is the default value, then each
     * dataobject will render the first row that evaluates its when predicate to true, in the order
     * defined in the table, or otherwise the default row which does not have a when predicate.
     */
    get multiTemplateDataRows() {
        return this._multiTemplateDataRows;
    }
    set multiTemplateDataRows(v) {
        this._multiTemplateDataRows = coerceBooleanProperty(v);
        // In Ivy if this value is set via a static attribute (e.g. <table multiTemplateDataRows>),
        // this setter will be invoked before the row outlet has been defined hence the null check.
        if (this._rowOutlet && this._rowOutlet.viewContainer.length) {
            this._forceRenderDataRows();
            this.updateStickyColumnStyles();
        }
    }
    /**
     * Whether to use a fixed table layout. Enabling this option will enforce consistent column widths
     * and optimize rendering sticky styles for native tables. No-op for flex tables.
     */
    get fixedLayout() {
        return this._fixedLayout;
    }
    set fixedLayout(v) {
        this._fixedLayout = coerceBooleanProperty(v);
        // Toggling `fixedLayout` may change column widths. Sticky column styles should be recalculated.
        this._forceRecalculateCellWidths = true;
        this._stickyColumnStylesNeedReset = true;
    }
    ngOnInit() {
        this._setupStickyStyler();
        if (this._isNativeHtmlTable) {
            this._applyNativeTableSections();
        }
        // Set up the trackBy function so that it uses the `RenderRow` as its identity by default. If
        // the user has provided a custom trackBy, return the result of that function as evaluated
        // with the values of the `RenderRow`'s data and index.
        this._dataDiffer = this._differs.find([]).create((_i, dataRow) => {
            return this.trackBy ? this.trackBy(dataRow.dataIndex, dataRow.data) : dataRow;
        });
        // Table cell dimensions may change after resizing the window. Signal the sticky styler to
        // refresh its cache of cell widths the next time sticky styles are updated.
        // @breaking-change 11.0.0 Remove null check for _viewportRuler once it's a required parameter.
        if (this._viewportRuler) {
            this._viewportRuler.change().pipe(takeUntil(this._onDestroy)).subscribe(() => {
                this._forceRecalculateCellWidths = true;
            });
        }
    }
    ngAfterContentChecked() {
        // Cache the row and column definitions gathered by ContentChildren and programmatic injection.
        this._cacheRowDefs();
        this._cacheColumnDefs();
        // Make sure that the user has at least added header, footer, or data row def.
        if (!this._headerRowDefs.length && !this._footerRowDefs.length && !this._rowDefs.length &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMissingRowDefsError();
        }
        // Render updates if the list of columns have been changed for the header, row, or footer defs.
        const columnsChanged = this._renderUpdatedColumns();
        const rowDefsChanged = columnsChanged || this._headerRowDefChanged || this._footerRowDefChanged;
        // Ensure sticky column styles are reset if set to `true` elsewhere.
        this._stickyColumnStylesNeedReset = this._stickyColumnStylesNeedReset || rowDefsChanged;
        this._forceRecalculateCellWidths = rowDefsChanged;
        // If the header row definition has been changed, trigger a render to the header row.
        if (this._headerRowDefChanged) {
            this._forceRenderHeaderRows();
            this._headerRowDefChanged = false;
        }
        // If the footer row definition has been changed, trigger a render to the footer row.
        if (this._footerRowDefChanged) {
            this._forceRenderFooterRows();
            this._footerRowDefChanged = false;
        }
        // If there is a data source and row definitions, connect to the data source unless a
        // connection has already been made.
        if (this.dataSource && this._rowDefs.length > 0 && !this._renderChangeSubscription) {
            this._observeRenderChanges();
        }
        else if (this._stickyColumnStylesNeedReset) {
            // In the above case, _observeRenderChanges will result in updateStickyColumnStyles being
            // called when it row data arrives. Otherwise, we need to call it proactively.
            this.updateStickyColumnStyles();
        }
        this._checkStickyStates();
    }
    ngOnDestroy() {
        this._rowOutlet.viewContainer.clear();
        this._noDataRowOutlet.viewContainer.clear();
        this._headerRowOutlet.viewContainer.clear();
        this._footerRowOutlet.viewContainer.clear();
        this._cachedRenderRowsMap.clear();
        this._onDestroy.next();
        this._onDestroy.complete();
        if (isDataSource(this.dataSource)) {
            this.dataSource.disconnect(this);
        }
    }
    /**
     * Renders rows based on the table's latest set of data, which was either provided directly as an
     * input or retrieved through an Observable stream (directly or from a DataSource).
     * Checks for differences in the data since the last diff to perform only the necessary
     * changes (add/remove/move rows).
     *
     * If the table's data source is a DataSource or Observable, this will be invoked automatically
     * each time the provided Observable stream emits a new data array. Otherwise if your data is
     * an array, this function will need to be called to render any changes.
     */
    renderRows() {
        this._renderRows = this._getAllRenderRows();
        const changes = this._dataDiffer.diff(this._renderRows);
        if (!changes) {
            this._updateNoDataRow();
            return;
        }
        const viewContainer = this._rowOutlet.viewContainer;
        // @breaking-change 11.0.0 Remove null check for `_viewRepeater` and the
        // `else` clause once `_viewRepeater` is turned into a required parameter.
        if (this._viewRepeater) {
            this._viewRepeater.applyChanges(changes, viewContainer, (record, _adjustedPreviousIndex, currentIndex) => this._getEmbeddedViewArgs(record.item, currentIndex), (record) => record.item.data, (change) => {
                if (change.operation === 1 /* INSERTED */ && change.context) {
                    this._renderCellTemplateForItem(change.record.item.rowDef, change.context);
                }
            });
        }
        else {
            changes.forEachOperation((record, prevIndex, currentIndex) => {
                if (record.previousIndex == null) {
                    const renderRow = record.item;
                    const rowDef = renderRow.rowDef;
                    const context = { $implicit: renderRow.data };
                    this._renderRow(this._rowOutlet, rowDef, currentIndex, context);
                }
                else if (currentIndex == null) {
                    viewContainer.remove(prevIndex);
                }
                else {
                    const view = viewContainer.get(prevIndex);
                    viewContainer.move(view, currentIndex);
                }
            });
        }
        // Update the meta context of a row's context data (index, count, first, last, ...)
        this._updateRowIndexContext();
        // Update rows that did not get added/removed/moved but may have had their identity changed,
        // e.g. if trackBy matched data on some property but the actual data reference changed.
        changes.forEachIdentityChange((record) => {
            const rowView = viewContainer.get(record.currentIndex);
            rowView.context.$implicit = record.item.data;
        });
        this._updateNoDataRow();
        this.updateStickyColumnStyles();
    }
    /** Adds a column definition that was not included as part of the content children. */
    addColumnDef(columnDef) {
        this._customColumnDefs.add(columnDef);
    }
    /** Removes a column definition that was not included as part of the content children. */
    removeColumnDef(columnDef) {
        this._customColumnDefs.delete(columnDef);
    }
    /** Adds a row definition that was not included as part of the content children. */
    addRowDef(rowDef) {
        this._customRowDefs.add(rowDef);
    }
    /** Removes a row definition that was not included as part of the content children. */
    removeRowDef(rowDef) {
        this._customRowDefs.delete(rowDef);
    }
    /** Adds a header row definition that was not included as part of the content children. */
    addHeaderRowDef(headerRowDef) {
        this._customHeaderRowDefs.add(headerRowDef);
        this._headerRowDefChanged = true;
    }
    /** Removes a header row definition that was not included as part of the content children. */
    removeHeaderRowDef(headerRowDef) {
        this._customHeaderRowDefs.delete(headerRowDef);
        this._headerRowDefChanged = true;
    }
    /** Adds a footer row definition that was not included as part of the content children. */
    addFooterRowDef(footerRowDef) {
        this._customFooterRowDefs.add(footerRowDef);
        this._footerRowDefChanged = true;
    }
    /** Removes a footer row definition that was not included as part of the content children. */
    removeFooterRowDef(footerRowDef) {
        this._customFooterRowDefs.delete(footerRowDef);
        this._footerRowDefChanged = true;
    }
    /** Sets a no data row definition that was not included as a part of the content children. */
    setNoDataRow(noDataRow) {
        this._customNoDataRow = noDataRow;
    }
    /**
     * Updates the header sticky styles. First resets all applied styles with respect to the cells
     * sticking to the top. Then, evaluating which cells need to be stuck to the top. This is
     * automatically called when the header row changes its displayed set of columns, or if its
     * sticky input changes. May be called manually for cases where the cell content changes outside
     * of these events.
     */
    updateStickyHeaderRowStyles() {
        const headerRows = this._getRenderedRows(this._headerRowOutlet);
        const tableElement = this._elementRef.nativeElement;
        // Hide the thead element if there are no header rows. This is necessary to satisfy
        // overzealous a11y checkers that fail because the `rowgroup` element does not contain
        // required child `row`.
        const thead = tableElement.querySelector('thead');
        if (thead) {
            thead.style.display = headerRows.length ? '' : 'none';
        }
        const stickyStates = this._headerRowDefs.map(def => def.sticky);
        this._stickyStyler.clearStickyPositioning(headerRows, ['top']);
        this._stickyStyler.stickRows(headerRows, stickyStates, 'top');
        // Reset the dirty state of the sticky input change since it has been used.
        this._headerRowDefs.forEach(def => def.resetStickyChanged());
    }
    /**
     * Updates the footer sticky styles. First resets all applied styles with respect to the cells
     * sticking to the bottom. Then, evaluating which cells need to be stuck to the bottom. This is
     * automatically called when the footer row changes its displayed set of columns, or if its
     * sticky input changes. May be called manually for cases where the cell content changes outside
     * of these events.
     */
    updateStickyFooterRowStyles() {
        const footerRows = this._getRenderedRows(this._footerRowOutlet);
        const tableElement = this._elementRef.nativeElement;
        // Hide the tfoot element if there are no footer rows. This is necessary to satisfy
        // overzealous a11y checkers that fail because the `rowgroup` element does not contain
        // required child `row`.
        const tfoot = tableElement.querySelector('tfoot');
        if (tfoot) {
            tfoot.style.display = footerRows.length ? '' : 'none';
        }
        const stickyStates = this._footerRowDefs.map(def => def.sticky);
        this._stickyStyler.clearStickyPositioning(footerRows, ['bottom']);
        this._stickyStyler.stickRows(footerRows, stickyStates, 'bottom');
        this._stickyStyler.updateStickyFooterContainer(this._elementRef.nativeElement, stickyStates);
        // Reset the dirty state of the sticky input change since it has been used.
        this._footerRowDefs.forEach(def => def.resetStickyChanged());
    }
    /**
     * Updates the column sticky styles. First resets all applied styles with respect to the cells
     * sticking to the left and right. Then sticky styles are added for the left and right according
     * to the column definitions for each cell in each row. This is automatically called when
     * the data source provides a new set of data or when a column definition changes its sticky
     * input. May be called manually for cases where the cell content changes outside of these events.
     */
    updateStickyColumnStyles() {
        const headerRows = this._getRenderedRows(this._headerRowOutlet);
        const dataRows = this._getRenderedRows(this._rowOutlet);
        const footerRows = this._getRenderedRows(this._footerRowOutlet);
        // For tables not using a fixed layout, the column widths may change when new rows are rendered.
        // In a table using a fixed layout, row content won't affect column width, so sticky styles
        // don't need to be cleared unless either the sticky column config changes or one of the row
        // defs change.
        if ((this._isNativeHtmlTable && !this._fixedLayout)
            || this._stickyColumnStylesNeedReset) {
            // Clear the left and right positioning from all columns in the table across all rows since
            // sticky columns span across all table sections (header, data, footer)
            this._stickyStyler.clearStickyPositioning([...headerRows, ...dataRows, ...footerRows], ['left', 'right']);
            this._stickyColumnStylesNeedReset = false;
        }
        // Update the sticky styles for each header row depending on the def's sticky state
        headerRows.forEach((headerRow, i) => {
            this._addStickyColumnStyles([headerRow], this._headerRowDefs[i]);
        });
        // Update the sticky styles for each data row depending on its def's sticky state
        this._rowDefs.forEach(rowDef => {
            // Collect all the rows rendered with this row definition.
            const rows = [];
            for (let i = 0; i < dataRows.length; i++) {
                if (this._renderRows[i].rowDef === rowDef) {
                    rows.push(dataRows[i]);
                }
            }
            this._addStickyColumnStyles(rows, rowDef);
        });
        // Update the sticky styles for each footer row depending on the def's sticky state
        footerRows.forEach((footerRow, i) => {
            this._addStickyColumnStyles([footerRow], this._footerRowDefs[i]);
        });
        // Reset the dirty state of the sticky input change since it has been used.
        Array.from(this._columnDefsByName.values()).forEach(def => def.resetStickyChanged());
    }
    /**
     * Get the list of RenderRow objects to render according to the current list of data and defined
     * row definitions. If the previous list already contained a particular pair, it should be reused
     * so that the differ equates their references.
     */
    _getAllRenderRows() {
        const renderRows = [];
        // Store the cache and create a new one. Any re-used RenderRow objects will be moved into the
        // new cache while unused ones can be picked up by garbage collection.
        const prevCachedRenderRows = this._cachedRenderRowsMap;
        this._cachedRenderRowsMap = new Map();
        // For each data object, get the list of rows that should be rendered, represented by the
        // respective `RenderRow` object which is the pair of `data` and `CdkRowDef`.
        for (let i = 0; i < this._data.length; i++) {
            let data = this._data[i];
            const renderRowsForData = this._getRenderRowsForData(data, i, prevCachedRenderRows.get(data));
            if (!this._cachedRenderRowsMap.has(data)) {
                this._cachedRenderRowsMap.set(data, new WeakMap());
            }
            for (let j = 0; j < renderRowsForData.length; j++) {
                let renderRow = renderRowsForData[j];
                const cache = this._cachedRenderRowsMap.get(renderRow.data);
                if (cache.has(renderRow.rowDef)) {
                    cache.get(renderRow.rowDef).push(renderRow);
                }
                else {
                    cache.set(renderRow.rowDef, [renderRow]);
                }
                renderRows.push(renderRow);
            }
        }
        return renderRows;
    }
    /**
     * Gets a list of `RenderRow<T>` for the provided data object and any `CdkRowDef` objects that
     * should be rendered for this data. Reuses the cached RenderRow objects if they match the same
     * `(T, CdkRowDef)` pair.
     */
    _getRenderRowsForData(data, dataIndex, cache) {
        const rowDefs = this._getRowDefs(data, dataIndex);
        return rowDefs.map(rowDef => {
            const cachedRenderRows = (cache && cache.has(rowDef)) ? cache.get(rowDef) : [];
            if (cachedRenderRows.length) {
                const dataRow = cachedRenderRows.shift();
                dataRow.dataIndex = dataIndex;
                return dataRow;
            }
            else {
                return { data, rowDef, dataIndex };
            }
        });
    }
    /** Update the map containing the content's column definitions. */
    _cacheColumnDefs() {
        this._columnDefsByName.clear();
        const columnDefs = mergeArrayAndSet(this._getOwnDefs(this._contentColumnDefs), this._customColumnDefs);
        columnDefs.forEach(columnDef => {
            if (this._columnDefsByName.has(columnDef.name) &&
                (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableDuplicateColumnNameError(columnDef.name);
            }
            this._columnDefsByName.set(columnDef.name, columnDef);
        });
    }
    /** Update the list of all available row definitions that can be used. */
    _cacheRowDefs() {
        this._headerRowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentHeaderRowDefs), this._customHeaderRowDefs);
        this._footerRowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentFooterRowDefs), this._customFooterRowDefs);
        this._rowDefs = mergeArrayAndSet(this._getOwnDefs(this._contentRowDefs), this._customRowDefs);
        // After all row definitions are determined, find the row definition to be considered default.
        const defaultRowDefs = this._rowDefs.filter(def => !def.when);
        if (!this.multiTemplateDataRows && defaultRowDefs.length > 1 &&
            (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMultipleDefaultRowDefsError();
        }
        this._defaultRowDef = defaultRowDefs[0];
    }
    /**
     * Check if the header, data, or footer rows have changed what columns they want to display or
     * whether the sticky states have changed for the header or footer. If there is a diff, then
     * re-render that section.
     */
    _renderUpdatedColumns() {
        const columnsDiffReducer = (acc, def) => acc || !!def.getColumnsDiff();
        // Force re-render data rows if the list of column definitions have changed.
        const dataColumnsChanged = this._rowDefs.reduce(columnsDiffReducer, false);
        if (dataColumnsChanged) {
            this._forceRenderDataRows();
        }
        // Force re-render header/footer rows if the list of column definitions have changed.
        const headerColumnsChanged = this._headerRowDefs.reduce(columnsDiffReducer, false);
        if (headerColumnsChanged) {
            this._forceRenderHeaderRows();
        }
        const footerColumnsChanged = this._footerRowDefs.reduce(columnsDiffReducer, false);
        if (footerColumnsChanged) {
            this._forceRenderFooterRows();
        }
        return dataColumnsChanged || headerColumnsChanged || footerColumnsChanged;
    }
    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the row outlet. Otherwise start listening for new data.
     */
    _switchDataSource(dataSource) {
        this._data = [];
        if (isDataSource(this.dataSource)) {
            this.dataSource.disconnect(this);
        }
        // Stop listening for data from the previous data source.
        if (this._renderChangeSubscription) {
            this._renderChangeSubscription.unsubscribe();
            this._renderChangeSubscription = null;
        }
        if (!dataSource) {
            if (this._dataDiffer) {
                this._dataDiffer.diff([]);
            }
            this._rowOutlet.viewContainer.clear();
        }
        this._dataSource = dataSource;
    }
    /** Set up a subscription for the data provided by the data source. */
    _observeRenderChanges() {
        // If no data source has been set, there is nothing to observe for changes.
        if (!this.dataSource) {
            return;
        }
        let dataStream;
        if (isDataSource(this.dataSource)) {
            dataStream = this.dataSource.connect(this);
        }
        else if (isObservable(this.dataSource)) {
            dataStream = this.dataSource;
        }
        else if (Array.isArray(this.dataSource)) {
            dataStream = observableOf(this.dataSource);
        }
        if (dataStream === undefined && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableUnknownDataSourceError();
        }
        this._renderChangeSubscription = dataStream.pipe(takeUntil(this._onDestroy))
            .subscribe(data => {
            this._data = data || [];
            this.renderRows();
        });
    }
    /**
     * Clears any existing content in the header row outlet and creates a new embedded view
     * in the outlet using the header row definition.
     */
    _forceRenderHeaderRows() {
        // Clear the header row outlet if any content exists.
        if (this._headerRowOutlet.viewContainer.length > 0) {
            this._headerRowOutlet.viewContainer.clear();
        }
        this._headerRowDefs.forEach((def, i) => this._renderRow(this._headerRowOutlet, def, i));
        this.updateStickyHeaderRowStyles();
    }
    /**
     * Clears any existing content in the footer row outlet and creates a new embedded view
     * in the outlet using the footer row definition.
     */
    _forceRenderFooterRows() {
        // Clear the footer row outlet if any content exists.
        if (this._footerRowOutlet.viewContainer.length > 0) {
            this._footerRowOutlet.viewContainer.clear();
        }
        this._footerRowDefs.forEach((def, i) => this._renderRow(this._footerRowOutlet, def, i));
        this.updateStickyFooterRowStyles();
    }
    /** Adds the sticky column styles for the rows according to the columns' stick states. */
    _addStickyColumnStyles(rows, rowDef) {
        const columnDefs = Array.from(rowDef.columns || []).map(columnName => {
            const columnDef = this._columnDefsByName.get(columnName);
            if (!columnDef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableUnknownColumnError(columnName);
            }
            return columnDef;
        });
        const stickyStartStates = columnDefs.map(columnDef => columnDef.sticky);
        const stickyEndStates = columnDefs.map(columnDef => columnDef.stickyEnd);
        this._stickyStyler.updateStickyColumns(rows, stickyStartStates, stickyEndStates, !this._fixedLayout || this._forceRecalculateCellWidths);
    }
    /** Gets the list of rows that have been rendered in the row outlet. */
    _getRenderedRows(rowOutlet) {
        const renderedRows = [];
        for (let i = 0; i < rowOutlet.viewContainer.length; i++) {
            const viewRef = rowOutlet.viewContainer.get(i);
            renderedRows.push(viewRef.rootNodes[0]);
        }
        return renderedRows;
    }
    /**
     * Get the matching row definitions that should be used for this row data. If there is only
     * one row definition, it is returned. Otherwise, find the row definitions that has a when
     * predicate that returns true with the data. If none return true, return the default row
     * definition.
     */
    _getRowDefs(data, dataIndex) {
        if (this._rowDefs.length == 1) {
            return [this._rowDefs[0]];
        }
        let rowDefs = [];
        if (this.multiTemplateDataRows) {
            rowDefs = this._rowDefs.filter(def => !def.when || def.when(dataIndex, data));
        }
        else {
            let rowDef = this._rowDefs.find(def => def.when && def.when(dataIndex, data)) || this._defaultRowDef;
            if (rowDef) {
                rowDefs.push(rowDef);
            }
        }
        if (!rowDefs.length && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getTableMissingMatchingRowDefError(data);
        }
        return rowDefs;
    }
    _getEmbeddedViewArgs(renderRow, index) {
        const rowDef = renderRow.rowDef;
        const context = { $implicit: renderRow.data };
        return {
            templateRef: rowDef.template,
            context,
            index,
        };
    }
    /**
     * Creates a new row template in the outlet and fills it with the set of cell templates.
     * Optionally takes a context to provide to the row and cells, as well as an optional index
     * of where to place the new row template in the outlet.
     */
    _renderRow(outlet, rowDef, index, context = {}) {
        // TODO(andrewseguin): enforce that one outlet was instantiated from createEmbeddedView
        const view = outlet.viewContainer.createEmbeddedView(rowDef.template, context, index);
        this._renderCellTemplateForItem(rowDef, context);
        return view;
    }
    _renderCellTemplateForItem(rowDef, context) {
        for (let cellTemplate of this._getCellTemplates(rowDef)) {
            if (CdkCellOutlet.mostRecentCellOutlet) {
                CdkCellOutlet.mostRecentCellOutlet._viewContainer.createEmbeddedView(cellTemplate, context);
            }
        }
        this._changeDetectorRef.markForCheck();
    }
    /**
     * Updates the index-related context for each row to reflect any changes in the index of the rows,
     * e.g. first/last/even/odd.
     */
    _updateRowIndexContext() {
        const viewContainer = this._rowOutlet.viewContainer;
        for (let renderIndex = 0, count = viewContainer.length; renderIndex < count; renderIndex++) {
            const viewRef = viewContainer.get(renderIndex);
            const context = viewRef.context;
            context.count = count;
            context.first = renderIndex === 0;
            context.last = renderIndex === count - 1;
            context.even = renderIndex % 2 === 0;
            context.odd = !context.even;
            if (this.multiTemplateDataRows) {
                context.dataIndex = this._renderRows[renderIndex].dataIndex;
                context.renderIndex = renderIndex;
            }
            else {
                context.index = this._renderRows[renderIndex].dataIndex;
            }
        }
    }
    /** Gets the column definitions for the provided row def. */
    _getCellTemplates(rowDef) {
        if (!rowDef || !rowDef.columns) {
            return [];
        }
        return Array.from(rowDef.columns, columnId => {
            const column = this._columnDefsByName.get(columnId);
            if (!column && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw getTableUnknownColumnError(columnId);
            }
            return rowDef.extractCellTemplate(column);
        });
    }
    /** Adds native table sections (e.g. tbody) and moves the row outlets into them. */
    _applyNativeTableSections() {
        const documentFragment = this._document.createDocumentFragment();
        const sections = [
            { tag: 'thead', outlets: [this._headerRowOutlet] },
            { tag: 'tbody', outlets: [this._rowOutlet, this._noDataRowOutlet] },
            { tag: 'tfoot', outlets: [this._footerRowOutlet] },
        ];
        for (const section of sections) {
            const element = this._document.createElement(section.tag);
            element.setAttribute('role', 'rowgroup');
            for (const outlet of section.outlets) {
                element.appendChild(outlet.elementRef.nativeElement);
            }
            documentFragment.appendChild(element);
        }
        // Use a DocumentFragment so we don't hit the DOM on each iteration.
        this._elementRef.nativeElement.appendChild(documentFragment);
    }
    /**
     * Forces a re-render of the data rows. Should be called in cases where there has been an input
     * change that affects the evaluation of which rows should be rendered, e.g. toggling
     * `multiTemplateDataRows` or adding/removing row definitions.
     */
    _forceRenderDataRows() {
        this._dataDiffer.diff([]);
        this._rowOutlet.viewContainer.clear();
        this.renderRows();
    }
    /**
     * Checks if there has been a change in sticky states since last check and applies the correct
     * sticky styles. Since checking resets the "dirty" state, this should only be performed once
     * during a change detection and after the inputs are settled (after content check).
     */
    _checkStickyStates() {
        const stickyCheckReducer = (acc, d) => {
            return acc || d.hasStickyChanged();
        };
        // Note that the check needs to occur for every definition since it notifies the definition
        // that it can reset its dirty state. Using another operator like `some` may short-circuit
        // remaining definitions and leave them in an unchecked state.
        if (this._headerRowDefs.reduce(stickyCheckReducer, false)) {
            this.updateStickyHeaderRowStyles();
        }
        if (this._footerRowDefs.reduce(stickyCheckReducer, false)) {
            this.updateStickyFooterRowStyles();
        }
        if (Array.from(this._columnDefsByName.values()).reduce(stickyCheckReducer, false)) {
            this._stickyColumnStylesNeedReset = true;
            this.updateStickyColumnStyles();
        }
    }
    /**
     * Creates the sticky styler that will be used for sticky rows and columns. Listens
     * for directionality changes and provides the latest direction to the styler. Re-applies column
     * stickiness when directionality changes.
     */
    _setupStickyStyler() {
        const direction = this._dir ? this._dir.value : 'ltr';
        this._stickyStyler = new StickyStyler(this._isNativeHtmlTable, this.stickyCssClass, direction, this._coalescedStyleScheduler, this._platform.isBrowser, this.needsPositionStickyOnElement, this._stickyPositioningListener);
        (this._dir ? this._dir.change : observableOf())
            .pipe(takeUntil(this._onDestroy))
            .subscribe(value => {
            this._stickyStyler.direction = value;
            this.updateStickyColumnStyles();
        });
    }
    /** Filters definitions that belong to this table from a QueryList. */
    _getOwnDefs(items) {
        return items.filter(item => !item._table || item._table === this);
    }
    /** Creates or removes the no data row, depending on whether any data is being shown. */
    _updateNoDataRow() {
        const noDataRow = this._customNoDataRow || this._noDataRow;
        if (noDataRow) {
            const shouldShow = this._rowOutlet.viewContainer.length === 0;
            if (shouldShow !== this._isShowingNoDataRow) {
                const container = this._noDataRowOutlet.viewContainer;
                shouldShow ? container.createEmbeddedView(noDataRow.templateRef) : container.clear();
                this._isShowingNoDataRow = shouldShow;
            }
        }
    }
}
CdkTable.decorators = [
    { type: Component, args: [{
                selector: 'cdk-table, table[cdk-table]',
                exportAs: 'cdkTable',
                template: CDK_TABLE_TEMPLATE,
                host: {
                    'class': 'cdk-table',
                    '[class.cdk-table-fixed-layout]': 'fixedLayout',
                },
                encapsulation: ViewEncapsulation.None,
                // The "OnPush" status for the `MatTable` component is effectively a noop, so we are removing it.
                // The view for `MatTable` consists entirely of templates declared in other views. As they are
                // declared elsewhere, they are checked when their declaration points are checked.
                // tslint:disable-next-line:validate-decorators
                changeDetection: ChangeDetectionStrategy.Default,
                providers: [
                    { provide: CDK_TABLE, useExisting: CdkTable },
                    { provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
                    { provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
                    // Prevent nested tables from seeing this table's StickyPositioningListener.
                    { provide: STICKY_POSITIONING_LISTENER, useValue: null },
                ],
                styles: [".cdk-table-fixed-layout{table-layout:fixed}\n"]
            },] }
];
CdkTable.ctorParameters = () => [
    { type: IterableDiffers },
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: String, decorators: [{ type: Attribute, args: ['role',] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [_VIEW_REPEATER_STRATEGY,] }] },
    { type: _CoalescedStyleScheduler, decorators: [{ type: Optional }, { type: Inject, args: [_COALESCED_STYLE_SCHEDULER,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: SkipSelf }, { type: Inject, args: [STICKY_POSITIONING_LISTENER,] }] },
    { type: ViewportRuler, decorators: [{ type: Optional }] }
];
CdkTable.propDecorators = {
    trackBy: [{ type: Input }],
    dataSource: [{ type: Input }],
    multiTemplateDataRows: [{ type: Input }],
    fixedLayout: [{ type: Input }],
    _rowOutlet: [{ type: ViewChild, args: [DataRowOutlet, { static: true },] }],
    _headerRowOutlet: [{ type: ViewChild, args: [HeaderRowOutlet, { static: true },] }],
    _footerRowOutlet: [{ type: ViewChild, args: [FooterRowOutlet, { static: true },] }],
    _noDataRowOutlet: [{ type: ViewChild, args: [NoDataRowOutlet, { static: true },] }],
    _contentColumnDefs: [{ type: ContentChildren, args: [CdkColumnDef, { descendants: true },] }],
    _contentRowDefs: [{ type: ContentChildren, args: [CdkRowDef, { descendants: true },] }],
    _contentHeaderRowDefs: [{ type: ContentChildren, args: [CdkHeaderRowDef, {
                    descendants: true
                },] }],
    _contentFooterRowDefs: [{ type: ContentChildren, args: [CdkFooterRowDef, {
                    descendants: true
                },] }],
    _noDataRow: [{ type: ContentChild, args: [CdkNoDataRow,] }]
};
/** Utility function that gets a merged list of the entries in an array and values of a Set. */
function mergeArrayAndSet(array, set) {
    return array.concat(Array.from(set));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RhYmxlL3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBWSxjQUFjLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQWUscUJBQXFCLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMxRSxPQUFPLEVBR0wsNEJBQTRCLEVBQzVCLFlBQVksRUFDWix1QkFBdUIsR0FLeEIsTUFBTSwwQkFBMEIsQ0FBQztBQUNsQyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDL0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBRUwsU0FBUyxFQUNULHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixlQUFlLEVBQ2YsU0FBUyxFQUNULFVBQVUsRUFDVixlQUFlLEVBQ2YsTUFBTSxFQUNOLEtBQUssRUFHTCxlQUFlLEVBR2YsUUFBUSxFQUNSLFNBQVMsRUFDVCxRQUFRLEVBR1IsU0FBUyxFQUNULGdCQUFnQixFQUNoQixpQkFBaUIsR0FDbEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLGVBQWUsRUFDZixZQUFZLEVBRVosRUFBRSxJQUFJLFlBQVksRUFDbEIsT0FBTyxHQUVSLE1BQU0sTUFBTSxDQUFDO0FBQ2QsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3pDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDcEMsT0FBTyxFQUFDLHdCQUF3QixFQUFFLDBCQUEwQixFQUFDLE1BQU0sNkJBQTZCLENBQUM7QUFDakcsT0FBTyxFQUVMLGFBQWEsRUFHYixlQUFl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XHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0RpcmVjdGlvbiwgRGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHtCb29sZWFuSW5wdXQsIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBDb2xsZWN0aW9uVmlld2VyLFxyXG4gIERhdGFTb3VyY2UsXHJcbiAgX0Rpc3Bvc2VWaWV3UmVwZWF0ZXJTdHJhdGVneSxcclxuICBpc0RhdGFTb3VyY2UsXHJcbiAgX1ZJRVdfUkVQRUFURVJfU1RSQVRFR1ksXHJcbiAgX1ZpZXdSZXBlYXRlcixcclxuICBfVmlld1JlcGVhdGVySXRlbUNoYW5nZSxcclxuICBfVmlld1JlcGVhdGVySXRlbUluc2VydEFyZ3MsXHJcbiAgX1ZpZXdSZXBlYXRlck9wZXJhdGlvbixcclxufSBmcm9tICdAYW5ndWxhci9jZGsvY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge1ZpZXdwb3J0UnVsZXJ9IGZyb20gJ0Bhbmd1bGFyL2Nkay9zY3JvbGxpbmcnO1xyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge1xyXG4gIEFmdGVyQ29udGVudENoZWNrZWQsXHJcbiAgQXR0cmlidXRlLFxyXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxyXG4gIENoYW5nZURldGVjdG9yUmVmLFxyXG4gIENvbXBvbmVudCxcclxuICBDb250ZW50Q2hpbGQsXHJcbiAgQ29udGVudENoaWxkcmVuLFxyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEVtYmVkZGVkVmlld1JlZixcclxuICBJbmplY3QsXHJcbiAgSW5wdXQsXHJcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgSXRlcmFibGVEaWZmZXIsXHJcbiAgSXRlcmFibGVEaWZmZXJzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPbkluaXQsXHJcbiAgT3B0aW9uYWwsXHJcbiAgUXVlcnlMaXN0LFxyXG4gIFNraXBTZWxmLFxyXG4gIFRlbXBsYXRlUmVmLFxyXG4gIFRyYWNrQnlGdW5jdGlvbixcclxuICBWaWV3Q2hpbGQsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBWaWV3RW5jYXBzdWxhdGlvbixcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtcclxuICBCZWhhdmlvclN1YmplY3QsXHJcbiAgaXNPYnNlcnZhYmxlLFxyXG4gIE9ic2VydmFibGUsXHJcbiAgb2YgYXMgb2JzZXJ2YWJsZU9mLFxyXG4gIFN1YmplY3QsXHJcbiAgU3Vic2NyaXB0aW9uLFxyXG59IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge0Nka0NvbHVtbkRlZn0gZnJvbSAnLi9jZWxsJztcclxuaW1wb3J0IHtfQ29hbGVzY2VkU3R5bGVTY2hlZHVsZXIsIF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSfSBmcm9tICcuL2NvYWxlc2NlZC1zdHlsZS1zY2hlZHVsZXInO1xyXG5pbXBvcnQge1xyXG4gIEJhc2VSb3dEZWYsXHJcbiAgQ2RrQ2VsbE91dGxldCxcclxuICBDZGtDZWxsT3V0bGV0TXVsdGlSb3dDb250ZXh0LFxyXG4gIENka0NlbGxPdXRsZXRSb3dDb250ZXh0LFxyXG4gIENka0Zvb3RlclJvd0RlZixcclxuICBDZGtIZWFkZXJSb3dEZWYsXHJcbiAgQ2RrTm9EYXRhUm93LFxyXG4gIENka1Jvd0RlZlxyXG59IGZyb20gJy4vcm93JztcclxuaW1wb3J0IHtTdGlja3lTdHlsZXJ9IGZyb20gJy4vc3RpY2t5LXN0eWxlcic7XHJcbmltcG9ydCB7XHJcbiAgZ2V0VGFibGVEdXBsaWNhdGVDb2x1bW5OYW1lRXJyb3IsXHJcbiAgZ2V0VGFibGVNaXNzaW5nTWF0Y2hpbmdSb3dEZWZFcnJvcixcclxuICBnZXRUYWJsZU1pc3NpbmdSb3dEZWZzRXJyb3IsXHJcbiAgZ2V0VGFibGVNdWx0aXBsZURlZmF1bHRSb3dEZWZzRXJyb3IsXHJcbiAgZ2V0VGFibGVVbmtub3duQ29sdW1uRXJyb3IsXHJcbiAgZ2V0VGFibGVVbmtub3duRGF0YVNvdXJjZUVycm9yXHJcbn0gZnJvbSAnLi90YWJsZS1lcnJvcnMnO1xyXG5pbXBvcnQge1NUSUNLWV9QT1NJVElPTklOR19MSVNURU5FUiwgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcn0gZnJvbSAnLi9zdGlja3ktcG9zaXRpb24tbGlzdGVuZXInO1xyXG5pbXBvcnQge0NES19UQUJMRX0gZnJvbSAnLi90b2tlbnMnO1xyXG5cclxuLyoqIEludGVyZmFjZSB1c2VkIHRvIHByb3ZpZGUgYW4gb3V0bGV0IGZvciByb3dzIHRvIGJlIGluc2VydGVkIGludG8uICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgUm93T3V0bGV0IHtcclxuICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xyXG59XHJcblxyXG4vKipcclxuICogVW5pb24gb2YgdGhlIHR5cGVzIHRoYXQgY2FuIGJlIHNldCBhcyB0aGUgZGF0YSBzb3VyY2UgZm9yIGEgYENka1RhYmxlYC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxudHlwZSBDZGtUYWJsZURhdGFTb3VyY2VJbnB1dDxUPiA9XHJcbiAgICBEYXRhU291cmNlPFQ+fE9ic2VydmFibGU8UmVhZG9ubHlBcnJheTxUPnxUW10+fFJlYWRvbmx5QXJyYXk8VD58VFtdO1xyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIGEgaGFuZGxlIGZvciB0aGUgdGFibGUgdG8gZ3JhYiB0aGUgdmlldyBjb250YWluZXIncyBuZy1jb250YWluZXIgdG8gaW5zZXJ0IGRhdGEgcm93cy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbcm93T3V0bGV0XSd9KVxyXG5leHBvcnQgY2xhc3MgRGF0YVJvd091dGxldCBpbXBsZW1lbnRzIFJvd091dGxldCB7XHJcbiAgY29uc3RydWN0b3IocHVibGljIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7fVxyXG59XHJcblxyXG4vKipcclxuICogUHJvdmlkZXMgYSBoYW5kbGUgZm9yIHRoZSB0YWJsZSB0byBncmFiIHRoZSB2aWV3IGNvbnRhaW5lcidzIG5nLWNvbnRhaW5lciB0byBpbnNlcnQgdGhlIGhlYWRlci5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbaGVhZGVyUm93T3V0bGV0XSd9KVxyXG5leHBvcnQgY2xhc3MgSGVhZGVyUm93T3V0bGV0IGltcGxlbWVudHMgUm93T3V0bGV0IHtcclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQcm92aWRlcyBhIGhhbmRsZSBmb3IgdGhlIHRhYmxlIHRvIGdyYWIgdGhlIHZpZXcgY29udGFpbmVyJ3MgbmctY29udGFpbmVyIHRvIGluc2VydCB0aGUgZm9vdGVyLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tmb290ZXJSb3dPdXRsZXRdJ30pXHJcbmV4cG9ydCBjbGFzcyBGb290ZXJSb3dPdXRsZXQgaW1wbGVtZW50cyBSb3dPdXRsZXQge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikge31cclxufVxyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIGEgaGFuZGxlIGZvciB0aGUgdGFibGUgdG8gZ3JhYiB0aGUgdmlld1xyXG4gKiBjb250YWluZXIncyBuZy1jb250YWluZXIgdG8gaW5zZXJ0IHRoZSBubyBkYXRhIHJvdy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbm9EYXRhUm93T3V0bGV0XSd9KVxyXG5leHBvcnQgY2xhc3MgTm9EYXRhUm93T3V0bGV0IGltcGxlbWVudHMgUm93T3V0bGV0IHtcclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHt9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgdGFibGUgdGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGUgbWF0LXRhYmxlLiBTaG91bGQgbm90IGJlIHVzZWQgb3V0c2lkZSBvZiB0aGVcclxuICogbWF0ZXJpYWwgbGlicmFyeS5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENES19UQUJMRV9URU1QTEFURSA9XHJcbiAgICAvLyBOb3RlIHRoYXQgYWNjb3JkaW5nIHRvIE1ETiwgdGhlIGBjYXB0aW9uYCBlbGVtZW50IGhhcyB0byBiZSBwcm9qZWN0ZWQgYXMgdGhlICoqZmlyc3QqKlxyXG4gICAgLy8gZWxlbWVudCBpbiB0aGUgdGFibGUuIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVE1ML0VsZW1lbnQvY2FwdGlvblxyXG4gICAgYFxyXG4gIDxuZy1jb250ZW50IHNlbGVjdD1cImNhcHRpb25cIj48L25nLWNvbnRlbnQ+XHJcbiAgPG5nLWNvbnRlbnQgc2VsZWN0PVwiY29sZ3JvdXAsIGNvbFwiPjwvbmctY29udGVudD5cclxuICA8bmctY29udGFpbmVyIGhlYWRlclJvd091dGxldD48L25nLWNvbnRhaW5lcj5cclxuICA8bmctY29udGFpbmVyIHJvd091dGxldD48L25nLWNvbnRhaW5lcj5cclxuICA8bmctY29udGFpbmVyIG5vRGF0YVJvd091dGxldD48L25nLWNvbnRhaW5lcj5cclxuICA8bmctY29udGFpbmVyIGZvb3RlclJvd091dGxldD48L25nLWNvbnRhaW5lcj5cclxuYDtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcmZhY2UgdXNlZCB0byBjb252ZW5pZW50bHkgdHlwZSB0aGUgcG9zc2libGUgY29udGV4dCBpbnRlcmZhY2VzIGZvciB0aGUgcmVuZGVyIHJvdy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBSb3dDb250ZXh0PFQ+IGV4dGVuZHMgQ2RrQ2VsbE91dGxldE11bHRpUm93Q29udGV4dDxUPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2RrQ2VsbE91dGxldFJvd0NvbnRleHQ8VD4ge31cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB1c2VkIHRvIGNvbnZlbmllbnRseSB0eXBlIHRoZSBlbWJlZGRlZCB2aWV3IHJlZiBmb3Igcm93cyB3aXRoIGEgY29udGV4dC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuYWJzdHJhY3QgY2xhc3MgUm93Vmlld1JlZjxUPiBleHRlbmRzIEVtYmVkZGVkVmlld1JlZjxSb3dDb250ZXh0PFQ+PiB7fVxyXG5cclxuLyoqXHJcbiAqIFNldCBvZiBwcm9wZXJ0aWVzIHRoYXQgcmVwcmVzZW50cyB0aGUgaWRlbnRpdHkgb2YgYSBzaW5nbGUgcmVuZGVyZWQgcm93LlxyXG4gKlxyXG4gKiBXaGVuIHRoZSB0YWJsZSBuZWVkcyB0byBkZXRlcm1pbmUgdGhlIGxpc3Qgb2Ygcm93cyB0byByZW5kZXIsIGl0IHdpbGwgZG8gc28gYnkgaXRlcmF0aW5nIHRocm91Z2hcclxuICogZWFjaCBkYXRhIG9iamVjdCBhbmQgZXZhbHVhdGluZyBpdHMgbGlzdCBvZiByb3cgdGVtcGxhdGVzIHRvIGRpc3BsYXkgKHdoZW4gbXVsdGlUZW1wbGF0ZURhdGFSb3dzXHJcbiAqIGlzIGZhbHNlLCB0aGVyZSBpcyBvbmx5IG9uZSB0ZW1wbGF0ZSBwZXIgZGF0YSBvYmplY3QpLiBGb3IgZWFjaCBwYWlyIG9mIGRhdGEgb2JqZWN0IGFuZCByb3dcclxuICogdGVtcGxhdGUsIGEgYFJlbmRlclJvd2AgaXMgYWRkZWQgdG8gdGhlIGxpc3Qgb2Ygcm93cyB0byByZW5kZXIuIElmIHRoZSBkYXRhIG9iamVjdCBhbmQgcm93XHJcbiAqIHRlbXBsYXRlIHBhaXIgaGFzIGFscmVhZHkgYmVlbiByZW5kZXJlZCwgdGhlIHByZXZpb3VzbHkgdXNlZCBgUmVuZGVyUm93YCBpcyBhZGRlZDsgZWxzZSBhIG5ld1xyXG4gKiBgUmVuZGVyUm93YCBpcyAqIGNyZWF0ZWQuIE9uY2UgdGhlIGxpc3QgaXMgY29tcGxldGUgYW5kIGFsbCBkYXRhIG9iamVjdHMgaGF2ZSBiZWVuIGl0ZXJlYXRlZFxyXG4gKiB0aHJvdWdoLCBhIGRpZmYgaXMgcGVyZm9ybWVkIHRvIGRldGVybWluZSB0aGUgY2hhbmdlcyB0aGF0IG5lZWQgdG8gYmUgbWFkZSB0byB0aGUgcmVuZGVyZWQgcm93cy5cclxuICpcclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBSZW5kZXJSb3c8VD4ge1xyXG4gIGRhdGE6IFQ7XHJcbiAgZGF0YUluZGV4OiBudW1iZXI7XHJcbiAgcm93RGVmOiBDZGtSb3dEZWY8VD47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGRhdGEgdGFibGUgdGhhdCBjYW4gcmVuZGVyIGEgaGVhZGVyIHJvdywgZGF0YSByb3dzLCBhbmQgYSBmb290ZXIgcm93LlxyXG4gKiBVc2VzIHRoZSBkYXRhU291cmNlIGlucHV0IHRvIGRldGVybWluZSB0aGUgZGF0YSB0byBiZSByZW5kZXJlZC4gVGhlIGRhdGEgY2FuIGJlIHByb3ZpZGVkIGVpdGhlclxyXG4gKiBhcyBhIGRhdGEgYXJyYXksIGFuIE9ic2VydmFibGUgc3RyZWFtIHRoYXQgZW1pdHMgdGhlIGRhdGEgYXJyYXkgdG8gcmVuZGVyLCBvciBhIERhdGFTb3VyY2Ugd2l0aCBhXHJcbiAqIGNvbm5lY3QgZnVuY3Rpb24gdGhhdCB3aWxsIHJldHVybiBhbiBPYnNlcnZhYmxlIHN0cmVhbSB0aGF0IGVtaXRzIHRoZSBkYXRhIGFycmF5IHRvIHJlbmRlci5cclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnY2RrLXRhYmxlLCB0YWJsZVtjZGstdGFibGVdJyxcclxuICBleHBvcnRBczogJ2Nka1RhYmxlJyxcclxuICB0ZW1wbGF0ZTogQ0RLX1RBQkxFX1RFTVBMQVRFLFxyXG4gIHN0eWxlVXJsczogWyd0YWJsZS5jc3MnXSxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiAnY2RrLXRhYmxlJyxcclxuICAgICdbY2xhc3MuY2RrLXRhYmxlLWZpeGVkLWxheW91dF0nOiAnZml4ZWRMYXlvdXQnLFxyXG4gIH0sXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAvLyBUaGUgXCJPblB1c2hcIiBzdGF0dXMgZm9yIHRoZSBgTWF0VGFibGVgIGNvbXBvbmVudCBpcyBlZmZlY3RpdmVseSBhIG5vb3AsIHNvIHdlIGFyZSByZW1vdmluZyBpdC5cclxuICAvLyBUaGUgdmlldyBmb3IgYE1hdFRhYmxlYCBjb25zaXN0cyBlbnRpcmVseSBvZiB0ZW1wbGF0ZXMgZGVjbGFyZWQgaW4gb3RoZXIgdmlld3MuIEFzIHRoZXkgYXJlXHJcbiAgLy8gZGVjbGFyZWQgZWxzZXdoZXJlLCB0aGV5IGFyZSBjaGVja2VkIHdoZW4gdGhlaXIgZGVjbGFyYXRpb24gcG9pbnRzIGFyZSBjaGVja2VkLlxyXG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YWxpZGF0ZS1kZWNvcmF0b3JzXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxyXG4gIHByb3ZpZGVyczogW1xyXG4gICAge3Byb3ZpZGU6IENES19UQUJMRSwgdXNlRXhpc3Rpbmc6IENka1RhYmxlfSxcclxuICAgIHtwcm92aWRlOiBfVklFV19SRVBFQVRFUl9TVFJBVEVHWSwgdXNlQ2xhc3M6IF9EaXNwb3NlVmlld1JlcGVhdGVyU3RyYXRlZ3l9LFxyXG4gICAge3Byb3ZpZGU6IF9DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSLCB1c2VDbGFzczogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyfSxcclxuICAgIC8vIFByZXZlbnQgbmVzdGVkIHRhYmxlcyBmcm9tIHNlZWluZyB0aGlzIHRhYmxlJ3MgU3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lci5cclxuICAgIHtwcm92aWRlOiBTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIsIHVzZVZhbHVlOiBudWxsfSxcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtUYWJsZTxUPiBpbXBsZW1lbnRzIEFmdGVyQ29udGVudENoZWNrZWQsIENvbGxlY3Rpb25WaWV3ZXIsIE9uRGVzdHJveSwgT25Jbml0IHtcclxuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gIC8qKiBMYXRlc3QgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXHJcbiAgcHJvdGVjdGVkIF9kYXRhOiBUW118UmVhZG9ubHlBcnJheTxUPjtcclxuXHJcbiAgLyoqIFN1YmplY3QgdGhhdCBlbWl0cyB3aGVuIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX29uRGVzdHJveSA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIC8qKiBMaXN0IG9mIHRoZSByZW5kZXJlZCByb3dzIGFzIGlkZW50aWZpZWQgYnkgdGhlaXIgYFJlbmRlclJvd2Agb2JqZWN0LiAqL1xyXG4gIHByaXZhdGUgX3JlbmRlclJvd3M6IFJlbmRlclJvdzxUPltdO1xyXG5cclxuICAvKiogU3Vic2NyaXB0aW9uIHRoYXQgbGlzdGVucyBmb3IgdGhlIGRhdGEgcHJvdmlkZWQgYnkgdGhlIGRhdGEgc291cmNlLiAqL1xyXG4gIHByaXZhdGUgX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9ufG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcCBvZiBhbGwgdGhlIHVzZXIncyBkZWZpbmVkIGNvbHVtbnMgKGhlYWRlciwgZGF0YSwgYW5kIGZvb3RlciBjZWxsIHRlbXBsYXRlKSBpZGVudGlmaWVkIGJ5XHJcbiAgICogbmFtZS4gQ29sbGVjdGlvbiBwb3B1bGF0ZWQgYnkgdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBnYXRoZXJlZCBieSBgQ29udGVudENoaWxkcmVuYCBhcyB3ZWxsIGFzXHJcbiAgICogYW55IGN1c3RvbSBjb2x1bW4gZGVmaW5pdGlvbnMgYWRkZWQgdG8gYF9jdXN0b21Db2x1bW5EZWZzYC5cclxuICAgKi9cclxuICBwcml2YXRlIF9jb2x1bW5EZWZzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIENka0NvbHVtbkRlZj4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IG9mIGFsbCByb3cgZGVmaW5pdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBieSB0aGlzIHRhYmxlLiBQb3B1bGF0ZWQgYnkgdGhlIHJvd3MgZ2F0aGVyZWQgYnlcclxuICAgKiB1c2luZyBgQ29udGVudENoaWxkcmVuYCBhcyB3ZWxsIGFzIGFueSBjdXN0b20gcm93IGRlZmluaXRpb25zIGFkZGVkIHRvIGBfY3VzdG9tUm93RGVmc2AuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfcm93RGVmczogQ2RrUm93RGVmPFQ+W107XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCBvZiBhbGwgaGVhZGVyIHJvdyBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoaXMgdGFibGUuIFBvcHVsYXRlZCBieSB0aGUgcm93c1xyXG4gICAqIGdhdGhlcmVkIGJ5IHVzaW5nIGBDb250ZW50Q2hpbGRyZW5gIGFzIHdlbGwgYXMgYW55IGN1c3RvbSByb3cgZGVmaW5pdGlvbnMgYWRkZWQgdG9cclxuICAgKiBgX2N1c3RvbUhlYWRlclJvd0RlZnNgLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2hlYWRlclJvd0RlZnM6IENka0hlYWRlclJvd0RlZltdO1xyXG5cclxuICAvKipcclxuICAgKiBTZXQgb2YgYWxsIHJvdyBkZWZpbml0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIGJ5IHRoaXMgdGFibGUuIFBvcHVsYXRlZCBieSB0aGUgcm93cyBnYXRoZXJlZCBieVxyXG4gICAqIHVzaW5nIGBDb250ZW50Q2hpbGRyZW5gIGFzIHdlbGwgYXMgYW55IGN1c3RvbSByb3cgZGVmaW5pdGlvbnMgYWRkZWQgdG9cclxuICAgKiBgX2N1c3RvbUZvb3RlclJvd0RlZnNgLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2Zvb3RlclJvd0RlZnM6IENka0Zvb3RlclJvd0RlZltdO1xyXG5cclxuICAvKiogRGlmZmVyIHVzZWQgdG8gZmluZCB0aGUgY2hhbmdlcyBpbiB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXHJcbiAgcHJpdmF0ZSBfZGF0YURpZmZlcjogSXRlcmFibGVEaWZmZXI8UmVuZGVyUm93PFQ+PjtcclxuXHJcbiAgLyoqIFN0b3JlcyB0aGUgcm93IGRlZmluaXRpb24gdGhhdCBkb2VzIG5vdCBoYXZlIGEgd2hlbiBwcmVkaWNhdGUuICovXHJcbiAgcHJpdmF0ZSBfZGVmYXVsdFJvd0RlZjogQ2RrUm93RGVmPFQ+fG51bGw7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbHVtbiBkZWZpbml0aW9ucyB0aGF0IHdlcmUgZGVmaW5lZCBvdXRzaWRlIG9mIHRoZSBkaXJlY3QgY29udGVudCBjaGlsZHJlbiBvZiB0aGUgdGFibGUuXHJcbiAgICogVGhlc2Ugd2lsbCBiZSBkZWZpbmVkIHdoZW4sIGUuZy4sIGNyZWF0aW5nIGEgd3JhcHBlciBhcm91bmQgdGhlIGNka1RhYmxlIHRoYXQgaGFzXHJcbiAgICogY29sdW1uIGRlZmluaXRpb25zIGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3VzdG9tQ29sdW1uRGVmcyA9IG5ldyBTZXQ8Q2RrQ29sdW1uRGVmPigpO1xyXG5cclxuICAvKipcclxuICAgKiBEYXRhIHJvdyBkZWZpbml0aW9ucyB0aGF0IHdlcmUgZGVmaW5lZCBvdXRzaWRlIG9mIHRoZSBkaXJlY3QgY29udGVudCBjaGlsZHJlbiBvZiB0aGUgdGFibGUuXHJcbiAgICogVGhlc2Ugd2lsbCBiZSBkZWZpbmVkIHdoZW4sIGUuZy4sIGNyZWF0aW5nIGEgd3JhcHBlciBhcm91bmQgdGhlIGNka1RhYmxlIHRoYXQgaGFzXHJcbiAgICogYnVpbHQtaW4gZGF0YSByb3dzIGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3VzdG9tUm93RGVmcyA9IG5ldyBTZXQ8Q2RrUm93RGVmPFQ+PigpO1xyXG5cclxuICAvKipcclxuICAgKiBIZWFkZXIgcm93IGRlZmluaXRpb25zIHRoYXQgd2VyZSBkZWZpbmVkIG91dHNpZGUgb2YgdGhlIGRpcmVjdCBjb250ZW50IGNoaWxkcmVuIG9mIHRoZSB0YWJsZS5cclxuICAgKiBUaGVzZSB3aWxsIGJlIGRlZmluZWQgd2hlbiwgZS5nLiwgY3JlYXRpbmcgYSB3cmFwcGVyIGFyb3VuZCB0aGUgY2RrVGFibGUgdGhhdCBoYXNcclxuICAgKiBidWlsdC1pbiBoZWFkZXIgcm93cyBhcyAqaXRzKiBjb250ZW50IGNoaWxkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2N1c3RvbUhlYWRlclJvd0RlZnMgPSBuZXcgU2V0PENka0hlYWRlclJvd0RlZj4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRm9vdGVyIHJvdyBkZWZpbml0aW9ucyB0aGF0IHdlcmUgZGVmaW5lZCBvdXRzaWRlIG9mIHRoZSBkaXJlY3QgY29udGVudCBjaGlsZHJlbiBvZiB0aGUgdGFibGUuXHJcbiAgICogVGhlc2Ugd2lsbCBiZSBkZWZpbmVkIHdoZW4sIGUuZy4sIGNyZWF0aW5nIGEgd3JhcHBlciBhcm91bmQgdGhlIGNka1RhYmxlIHRoYXQgaGFzIGFcclxuICAgKiBidWlsdC1pbiBmb290ZXIgcm93IGFzICppdHMqIGNvbnRlbnQgY2hpbGQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3VzdG9tRm9vdGVyUm93RGVmcyA9IG5ldyBTZXQ8Q2RrRm9vdGVyUm93RGVmPigpO1xyXG5cclxuICAvKiogTm8gZGF0YSByb3cgdGhhdCB3YXMgZGVmaW5lZCBvdXRzaWRlIG9mIHRoZSBkaXJlY3QgY29udGVudCBjaGlsZHJlbiBvZiB0aGUgdGFibGUuICovXHJcbiAgcHJpdmF0ZSBfY3VzdG9tTm9EYXRhUm93OiBDZGtOb0RhdGFSb3cgfCBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBoZWFkZXIgcm93IGRlZmluaXRpb24gaGFzIGJlZW4gY2hhbmdlZC4gVHJpZ2dlcnMgYW4gdXBkYXRlIHRvIHRoZSBoZWFkZXIgcm93IGFmdGVyXHJcbiAgICogY29udGVudCBpcyBjaGVja2VkLiBJbml0aWFsaXplZCBhcyB0cnVlIHNvIHRoYXQgdGhlIHRhYmxlIHJlbmRlcnMgdGhlIGluaXRpYWwgc2V0IG9mIHJvd3MuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfaGVhZGVyUm93RGVmQ2hhbmdlZCA9IHRydWU7XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhlIGZvb3RlciByb3cgZGVmaW5pdGlvbiBoYXMgYmVlbiBjaGFuZ2VkLiBUcmlnZ2VycyBhbiB1cGRhdGUgdG8gdGhlIGZvb3RlciByb3cgYWZ0ZXJcclxuICAgKiBjb250ZW50IGlzIGNoZWNrZWQuIEluaXRpYWxpemVkIGFzIHRydWUgc28gdGhhdCB0aGUgdGFibGUgcmVuZGVycyB0aGUgaW5pdGlhbCBzZXQgb2Ygcm93cy5cclxuICAgKi9cclxuICBwcml2YXRlIF9mb290ZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgc3RpY2t5IGNvbHVtbiBzdHlsZXMgbmVlZCB0byBiZSB1cGRhdGVkLiBTZXQgdG8gYHRydWVgIHdoZW4gdGhlIHZpc2libGUgY29sdW1uc1xyXG4gICAqIGNoYW5nZS5cclxuICAgKi9cclxuICBwcml2YXRlIF9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0cnVlO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBzdGlja3kgc3R5bGVyIHNob3VsZCByZWNhbGN1bGF0ZSBjZWxsIHdpZHRocyB3aGVuIGFwcGx5aW5nIHN0aWNreSBzdHlsZXMuIElmXHJcbiAgICogYGZhbHNlYCwgY2FjaGVkIHZhbHVlcyB3aWxsIGJlIHVzZWQgaW5zdGVhZC4gVGhpcyBpcyBvbmx5IGFwcGxpY2FibGUgdG8gdGFibGVzIHdpdGhcclxuICAgKiB7QGxpbmsgZml4ZWRMYXlvdXR9IGVuYWJsZWQuIEZvciBvdGhlciB0YWJsZXMsIGNlbGwgd2lkdGhzIHdpbGwgYWx3YXlzIGJlIHJlY2FsY3VsYXRlZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9mb3JjZVJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWU7XHJcblxyXG4gIC8qKlxyXG4gICAqIENhY2hlIG9mIHRoZSBsYXRlc3QgcmVuZGVyZWQgYFJlbmRlclJvd2Agb2JqZWN0cyBhcyBhIG1hcCBmb3IgZWFzeSByZXRyaWV2YWwgd2hlbiBjb25zdHJ1Y3RpbmdcclxuICAgKiBhIG5ldyBsaXN0IG9mIGBSZW5kZXJSb3dgIG9iamVjdHMgZm9yIHJlbmRlcmluZyByb3dzLiBTaW5jZSB0aGUgbmV3IGxpc3QgaXMgY29uc3RydWN0ZWQgd2l0aFxyXG4gICAqIHRoZSBjYWNoZWQgYFJlbmRlclJvd2Agb2JqZWN0cyB3aGVuIHBvc3NpYmxlLCB0aGUgcm93IGlkZW50aXR5IGlzIHByZXNlcnZlZCB3aGVuIHRoZSBkYXRhXHJcbiAgICogYW5kIHJvdyB0ZW1wbGF0ZSBtYXRjaGVzLCB3aGljaCBhbGxvd3MgdGhlIGBJdGVyYWJsZURpZmZlcmAgdG8gY2hlY2sgcm93cyBieSByZWZlcmVuY2VcclxuICAgKiBhbmQgdW5kZXJzdGFuZCB3aGljaCByb3dzIGFyZSBhZGRlZC9tb3ZlZC9yZW1vdmVkLlxyXG4gICAqXHJcbiAgICogSW1wbGVtZW50ZWQgYXMgYSBtYXAgb2YgbWFwcyB3aGVyZSB0aGUgZmlyc3Qga2V5IGlzIHRoZSBgZGF0YTogVGAgb2JqZWN0IGFuZCB0aGUgc2Vjb25kIGlzIHRoZVxyXG4gICAqIGBDZGtSb3dEZWY8VD5gIG9iamVjdC4gV2l0aCB0aGUgdHdvIGtleXMsIHRoZSBjYWNoZSBwb2ludHMgdG8gYSBgUmVuZGVyUm93PFQ+YCBvYmplY3QgdGhhdFxyXG4gICAqIGNvbnRhaW5zIGFuIGFycmF5IG9mIGNyZWF0ZWQgcGFpcnMuIFRoZSBhcnJheSBpcyBuZWNlc3NhcnkgdG8gaGFuZGxlIGNhc2VzIHdoZXJlIHRoZSBkYXRhXHJcbiAgICogYXJyYXkgY29udGFpbnMgbXVsdGlwbGUgZHVwbGljYXRlIGRhdGEgb2JqZWN0cyBhbmQgZWFjaCBpbnN0YW50aWF0ZWQgYFJlbmRlclJvd2AgbXVzdCBiZVxyXG4gICAqIHN0b3JlZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9jYWNoZWRSZW5kZXJSb3dzTWFwID0gbmV3IE1hcDxULCBXZWFrTWFwPENka1Jvd0RlZjxUPiwgUmVuZGVyUm93PFQ+W10+PigpO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgdGFibGUgaXMgYXBwbGllZCB0byBhIG5hdGl2ZSBgPHRhYmxlPmAuICovXHJcbiAgcHJvdGVjdGVkIF9pc05hdGl2ZUh0bWxUYWJsZTogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogVXRpbGl0eSBjbGFzcyB0aGF0IGlzIHJlc3BvbnNpYmxlIGZvciBhcHBseWluZyB0aGUgYXBwcm9wcmlhdGUgc3RpY2t5IHBvc2l0aW9uaW5nIHN0eWxlcyB0b1xyXG4gICAqIHRoZSB0YWJsZSdzIHJvd3MgYW5kIGNlbGxzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3N0aWNreVN0eWxlcjogU3RpY2t5U3R5bGVyO1xyXG5cclxuICAvKipcclxuICAgKiBDU1MgY2xhc3MgYWRkZWQgdG8gYW55IHJvdyBvciBjZWxsIHRoYXQgaGFzIHN0aWNreSBwb3NpdGlvbmluZyBhcHBsaWVkLiBNYXkgYmUgb3ZlcnJpZGVuIGJ5XHJcbiAgICogdGFibGUgc3ViY2xhc3Nlcy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgc3RpY2t5Q3NzQ2xhc3M6IHN0cmluZyA9ICdjZGstdGFibGUtc3RpY2t5JztcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0byBtYW51YWxseSBhZGQgcG9zaXRvbjogc3RpY2t5IHRvIGFsbCBzdGlja3kgY2VsbCBlbGVtZW50cy4gTm90IG5lZWRlZCBpZlxyXG4gICAqIHRoZSBwb3NpdGlvbiBpcyBzZXQgaW4gYSBzZWxlY3RvciBhc3NvY2lhdGVkIHdpdGggdGhlIHZhbHVlIG9mIHN0aWNreUNzc0NsYXNzLiBNYXkgYmVcclxuICAgKiBvdmVycmlkZGVuIGJ5IHRhYmxlIHN1YmNsYXNzZXNcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCA9IHRydWU7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBubyBkYXRhIHJvdyBpcyBjdXJyZW50bHkgc2hvd2luZyBhbnl0aGluZy4gKi9cclxuICBwcml2YXRlIF9pc1Nob3dpbmdOb0RhdGFSb3cgPSBmYWxzZTtcclxuXHJcbiAgLyoqXHJcbiAgICogVHJhY2tpbmcgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIHVzZWQgdG8gY2hlY2sgdGhlIGRpZmZlcmVuY2VzIGluIGRhdGEgY2hhbmdlcy4gVXNlZCBzaW1pbGFybHlcclxuICAgKiB0byBgbmdGb3JgIGB0cmFja0J5YCBmdW5jdGlvbi4gT3B0aW1pemUgcm93IG9wZXJhdGlvbnMgYnkgaWRlbnRpZnlpbmcgYSByb3cgYmFzZWQgb24gaXRzIGRhdGFcclxuICAgKiByZWxhdGl2ZSB0byB0aGUgZnVuY3Rpb24gdG8ga25vdyBpZiBhIHJvdyBzaG91bGQgYmUgYWRkZWQvcmVtb3ZlZC9tb3ZlZC5cclxuICAgKiBBY2NlcHRzIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0d28gcGFyYW1ldGVycywgYGluZGV4YCBhbmQgYGl0ZW1gLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IHRyYWNrQnkoKTogVHJhY2tCeUZ1bmN0aW9uPFQ+IHtcclxuICAgIHJldHVybiB0aGlzLl90cmFja0J5Rm47XHJcbiAgfVxyXG4gIHNldCB0cmFja0J5KGZuOiBUcmFja0J5RnVuY3Rpb248VD4pIHtcclxuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiBmbiAhPSBudWxsICYmIHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBjb25zb2xlLndhcm4oYHRyYWNrQnkgbXVzdCBiZSBhIGZ1bmN0aW9uLCBidXQgcmVjZWl2ZWQgJHtKU09OLnN0cmluZ2lmeShmbil9LmApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fdHJhY2tCeUZuID0gZm47XHJcbiAgfVxyXG4gIHByaXZhdGUgX3RyYWNrQnlGbjogVHJhY2tCeUZ1bmN0aW9uPFQ+O1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgdGFibGUncyBzb3VyY2Ugb2YgZGF0YSwgd2hpY2ggY2FuIGJlIHByb3ZpZGVkIGluIHRocmVlIHdheXMgKGluIG9yZGVyIG9mIGNvbXBsZXhpdHkpOlxyXG4gICAqICAgLSBTaW1wbGUgZGF0YSBhcnJheSAoZWFjaCBvYmplY3QgcmVwcmVzZW50cyBvbmUgdGFibGUgcm93KVxyXG4gICAqICAgLSBTdHJlYW0gdGhhdCBlbWl0cyBhIGRhdGEgYXJyYXkgZWFjaCB0aW1lIHRoZSBhcnJheSBjaGFuZ2VzXHJcbiAgICogICAtIGBEYXRhU291cmNlYCBvYmplY3QgdGhhdCBpbXBsZW1lbnRzIHRoZSBjb25uZWN0L2Rpc2Nvbm5lY3QgaW50ZXJmYWNlLlxyXG4gICAqXHJcbiAgICogSWYgYSBkYXRhIGFycmF5IGlzIHByb3ZpZGVkLCB0aGUgdGFibGUgbXVzdCBiZSBub3RpZmllZCB3aGVuIHRoZSBhcnJheSdzIG9iamVjdHMgYXJlXHJcbiAgICogYWRkZWQsIHJlbW92ZWQsIG9yIG1vdmVkLiBUaGlzIGNhbiBiZSBkb25lIGJ5IGNhbGxpbmcgdGhlIGByZW5kZXJSb3dzKClgIGZ1bmN0aW9uIHdoaWNoIHdpbGxcclxuICAgKiByZW5kZXIgdGhlIGRpZmYgc2luY2UgdGhlIGxhc3QgdGFibGUgcmVuZGVyLiBJZiB0aGUgZGF0YSBhcnJheSByZWZlcmVuY2UgaXMgY2hhbmdlZCwgdGhlIHRhYmxlXHJcbiAgICogd2lsbCBhdXRvbWF0aWNhbGx5IHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSByb3dzLlxyXG4gICAqXHJcbiAgICogV2hlbiBwcm92aWRpbmcgYW4gT2JzZXJ2YWJsZSBzdHJlYW0sIHRoZSB0YWJsZSB3aWxsIHRyaWdnZXIgYW4gdXBkYXRlIGF1dG9tYXRpY2FsbHkgd2hlbiB0aGVcclxuICAgKiBzdHJlYW0gZW1pdHMgYSBuZXcgYXJyYXkgb2YgZGF0YS5cclxuICAgKlxyXG4gICAqIEZpbmFsbHksIHdoZW4gcHJvdmlkaW5nIGEgYERhdGFTb3VyY2VgIG9iamVjdCwgdGhlIHRhYmxlIHdpbGwgdXNlIHRoZSBPYnNlcnZhYmxlIHN0cmVhbVxyXG4gICAqIHByb3ZpZGVkIGJ5IHRoZSBjb25uZWN0IGZ1bmN0aW9uIGFuZCB0cmlnZ2VyIHVwZGF0ZXMgd2hlbiB0aGF0IHN0cmVhbSBlbWl0cyBuZXcgZGF0YSBhcnJheVxyXG4gICAqIHZhbHVlcy4gRHVyaW5nIHRoZSB0YWJsZSdzIG5nT25EZXN0cm95IG9yIHdoZW4gdGhlIGRhdGEgc291cmNlIGlzIHJlbW92ZWQgZnJvbSB0aGUgdGFibGUsIHRoZVxyXG4gICAqIHRhYmxlIHdpbGwgY2FsbCB0aGUgRGF0YVNvdXJjZSdzIGBkaXNjb25uZWN0YCBmdW5jdGlvbiAobWF5IGJlIHVzZWZ1bCBmb3IgY2xlYW5pbmcgdXAgYW55XHJcbiAgICogc3Vic2NyaXB0aW9ucyByZWdpc3RlcmVkIGR1cmluZyB0aGUgY29ubmVjdCBwcm9jZXNzKS5cclxuICAgKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBkYXRhU291cmNlKCk6IENka1RhYmxlRGF0YVNvdXJjZUlucHV0PFQ+IHtcclxuICAgIHJldHVybiB0aGlzLl9kYXRhU291cmNlO1xyXG4gIH1cclxuICBzZXQgZGF0YVNvdXJjZShkYXRhU291cmNlOiBDZGtUYWJsZURhdGFTb3VyY2VJbnB1dDxUPikge1xyXG4gICAgaWYgKHRoaXMuX2RhdGFTb3VyY2UgIT09IGRhdGFTb3VyY2UpIHtcclxuICAgICAgdGhpcy5fc3dpdGNoRGF0YVNvdXJjZShkYXRhU291cmNlKTtcclxuICAgIH1cclxuICB9XHJcbiAgcHJpdmF0ZSBfZGF0YVNvdXJjZTogQ2RrVGFibGVEYXRhU291cmNlSW5wdXQ8VD47XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdG8gYWxsb3cgbXVsdGlwbGUgcm93cyBwZXIgZGF0YSBvYmplY3QgYnkgZXZhbHVhdGluZyB3aGljaCByb3dzIGV2YWx1YXRlIHRoZWlyICd3aGVuJ1xyXG4gICAqIHByZWRpY2F0ZSB0byB0cnVlLiBJZiBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCBpcyBmYWxzZSwgd2hpY2ggaXMgdGhlIGRlZmF1bHQgdmFsdWUsIHRoZW4gZWFjaFxyXG4gICAqIGRhdGFvYmplY3Qgd2lsbCByZW5kZXIgdGhlIGZpcnN0IHJvdyB0aGF0IGV2YWx1YXRlcyBpdHMgd2hlbiBwcmVkaWNhdGUgdG8gdHJ1ZSwgaW4gdGhlIG9yZGVyXHJcbiAgICogZGVmaW5lZCBpbiB0aGUgdGFibGUsIG9yIG90aGVyd2lzZSB0aGUgZGVmYXVsdCByb3cgd2hpY2ggZG9lcyBub3QgaGF2ZSBhIHdoZW4gcHJlZGljYXRlLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IG11bHRpVGVtcGxhdGVEYXRhUm93cygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9tdWx0aVRlbXBsYXRlRGF0YVJvd3M7XHJcbiAgfVxyXG4gIHNldCBtdWx0aVRlbXBsYXRlRGF0YVJvd3ModjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fbXVsdGlUZW1wbGF0ZURhdGFSb3dzID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHYpO1xyXG5cclxuICAgIC8vIEluIEl2eSBpZiB0aGlzIHZhbHVlIGlzIHNldCB2aWEgYSBzdGF0aWMgYXR0cmlidXRlIChlLmcuIDx0YWJsZSBtdWx0aVRlbXBsYXRlRGF0YVJvd3M+KSxcclxuICAgIC8vIHRoaXMgc2V0dGVyIHdpbGwgYmUgaW52b2tlZCBiZWZvcmUgdGhlIHJvdyBvdXRsZXQgaGFzIGJlZW4gZGVmaW5lZCBoZW5jZSB0aGUgbnVsbCBjaGVjay5cclxuICAgIGlmICh0aGlzLl9yb3dPdXRsZXQgJiYgdGhpcy5fcm93T3V0bGV0LnZpZXdDb250YWluZXIubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKTtcclxuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcclxuICAgIH1cclxuICB9XHJcbiAgX211bHRpVGVtcGxhdGVEYXRhUm93czogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRvIHVzZSBhIGZpeGVkIHRhYmxlIGxheW91dC4gRW5hYmxpbmcgdGhpcyBvcHRpb24gd2lsbCBlbmZvcmNlIGNvbnNpc3RlbnQgY29sdW1uIHdpZHRoc1xyXG4gICAqIGFuZCBvcHRpbWl6ZSByZW5kZXJpbmcgc3RpY2t5IHN0eWxlcyBmb3IgbmF0aXZlIHRhYmxlcy4gTm8tb3AgZm9yIGZsZXggdGFibGVzLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGZpeGVkTGF5b3V0KCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2ZpeGVkTGF5b3V0O1xyXG4gIH1cclxuICBzZXQgZml4ZWRMYXlvdXQodjogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZml4ZWRMYXlvdXQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodik7XHJcblxyXG4gICAgLy8gVG9nZ2xpbmcgYGZpeGVkTGF5b3V0YCBtYXkgY2hhbmdlIGNvbHVtbiB3aWR0aHMuIFN0aWNreSBjb2x1bW4gc3R5bGVzIHNob3VsZCBiZSByZWNhbGN1bGF0ZWQuXHJcbiAgICB0aGlzLl9mb3JjZVJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWU7XHJcbiAgICB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0cnVlO1xyXG4gIH1cclxuICBwcml2YXRlIF9maXhlZExheW91dDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAvLyBUT0RPKGFuZHJld3NlZ3Vpbik6IFJlbW92ZSBtYXggdmFsdWUgYXMgdGhlIGVuZCBpbmRleFxyXG4gIC8vICAgYW5kIGluc3RlYWQgY2FsY3VsYXRlIHRoZSB2aWV3IG9uIGluaXQgYW5kIHNjcm9sbC5cclxuICAvKipcclxuICAgKiBTdHJlYW0gY29udGFpbmluZyB0aGUgbGF0ZXN0IGluZm9ybWF0aW9uIG9uIHdoYXQgcm93cyBhcmUgYmVpbmcgZGlzcGxheWVkIG9uIHNjcmVlbi5cclxuICAgKiBDYW4gYmUgdXNlZCBieSB0aGUgZGF0YSBzb3VyY2UgdG8gYXMgYSBoZXVyaXN0aWMgb2Ygd2hhdCBkYXRhIHNob3VsZCBiZSBwcm92aWRlZC5cclxuICAgKlxyXG4gICAqIEBkb2NzLXByaXZhdGVcclxuICAgKi9cclxuICB2aWV3Q2hhbmdlOiBCZWhhdmlvclN1YmplY3Q8e3N0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyfT4gPVxyXG4gICAgICBuZXcgQmVoYXZpb3JTdWJqZWN0PHtzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlcn0+KHtzdGFydDogMCwgZW5kOiBOdW1iZXIuTUFYX1ZBTFVFfSk7XHJcblxyXG4gIC8vIE91dGxldHMgaW4gdGhlIHRhYmxlJ3MgdGVtcGxhdGUgd2hlcmUgdGhlIGhlYWRlciwgZGF0YSByb3dzLCBhbmQgZm9vdGVyIHdpbGwgYmUgaW5zZXJ0ZWQuXHJcbiAgQFZpZXdDaGlsZChEYXRhUm93T3V0bGV0LCB7c3RhdGljOiB0cnVlfSkgX3Jvd091dGxldDogRGF0YVJvd091dGxldDtcclxuICBAVmlld0NoaWxkKEhlYWRlclJvd091dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9oZWFkZXJSb3dPdXRsZXQ6IEhlYWRlclJvd091dGxldDtcclxuICBAVmlld0NoaWxkKEZvb3RlclJvd091dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9mb290ZXJSb3dPdXRsZXQ6IEZvb3RlclJvd091dGxldDtcclxuICBAVmlld0NoaWxkKE5vRGF0YVJvd091dGxldCwge3N0YXRpYzogdHJ1ZX0pIF9ub0RhdGFSb3dPdXRsZXQ6IE5vRGF0YVJvd091dGxldDtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIGNvbHVtbiBkZWZpbml0aW9ucyBwcm92aWRlZCBieSB0aGUgdXNlciB0aGF0IGNvbnRhaW4gd2hhdCB0aGUgaGVhZGVyLCBkYXRhLCBhbmQgZm9vdGVyXHJcbiAgICogY2VsbHMgc2hvdWxkIHJlbmRlciBmb3IgZWFjaCBjb2x1bW4uXHJcbiAgICovXHJcbiAgQENvbnRlbnRDaGlsZHJlbihDZGtDb2x1bW5EZWYsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9jb250ZW50Q29sdW1uRGVmczogUXVlcnlMaXN0PENka0NvbHVtbkRlZj47XHJcblxyXG4gIC8qKiBTZXQgb2YgZGF0YSByb3cgZGVmaW5pdGlvbnMgdGhhdCB3ZXJlIHByb3ZpZGVkIHRvIHRoZSB0YWJsZSBhcyBjb250ZW50IGNoaWxkcmVuLiAqL1xyXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrUm93RGVmLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfY29udGVudFJvd0RlZnM6IFF1ZXJ5TGlzdDxDZGtSb3dEZWY8VD4+O1xyXG5cclxuICAvKiogU2V0IG9mIGhlYWRlciByb3cgZGVmaW5pdGlvbnMgdGhhdCB3ZXJlIHByb3ZpZGVkIHRvIHRoZSB0YWJsZSBhcyBjb250ZW50IGNoaWxkcmVuLiAqL1xyXG4gIEBDb250ZW50Q2hpbGRyZW4oQ2RrSGVhZGVyUm93RGVmLCB7XHJcbiAgICBkZXNjZW5kYW50czogdHJ1ZVxyXG4gIH0pIF9jb250ZW50SGVhZGVyUm93RGVmczogUXVlcnlMaXN0PENka0hlYWRlclJvd0RlZj47XHJcblxyXG4gIC8qKiBTZXQgb2YgZm9vdGVyIHJvdyBkZWZpbml0aW9ucyB0aGF0IHdlcmUgcHJvdmlkZWQgdG8gdGhlIHRhYmxlIGFzIGNvbnRlbnQgY2hpbGRyZW4uICovXHJcbiAgQENvbnRlbnRDaGlsZHJlbihDZGtGb290ZXJSb3dEZWYsIHtcclxuICAgIGRlc2NlbmRhbnRzOiB0cnVlXHJcbiAgfSkgX2NvbnRlbnRGb290ZXJSb3dEZWZzOiBRdWVyeUxpc3Q8Q2RrRm9vdGVyUm93RGVmPjtcclxuXHJcbiAgLyoqIFJvdyBkZWZpbml0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIHJlbmRlcmVkIGlmIHRoZXJlJ3Mgbm8gZGF0YSBpbiB0aGUgdGFibGUuICovXHJcbiAgQENvbnRlbnRDaGlsZChDZGtOb0RhdGFSb3cpIF9ub0RhdGFSb3c6IENka05vRGF0YVJvdztcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBfZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLFxyXG4gICAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX2NoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBAQXR0cmlidXRlKCdyb2xlJykgcm9sZTogc3RyaW5nLFxyXG4gICAgICBAT3B0aW9uYWwoKSBwcm90ZWN0ZWQgcmVhZG9ubHkgX2RpcjogRGlyZWN0aW9uYWxpdHksIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxyXG4gICAgICBwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sXHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogQGRlcHJlY2F0ZWQgYF9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcmAsIGBfdmlld1JlcGVhdGVyYCBhbmQgYF92aWV3cG9ydFJ1bGVyYFxyXG4gICAgICAgKiAgICBwYXJhbWV0ZXJzIHRvIGJlY29tZSByZXF1aXJlZC5cclxuICAgICAgICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcclxuICAgICAgICovXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoX1ZJRVdfUkVQRUFURVJfU1RSQVRFR1kpXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IF92aWV3UmVwZWF0ZXI/OiBfVmlld1JlcGVhdGVyPFQsIFJlbmRlclJvdzxUPiwgUm93Q29udGV4dDxUPj4sXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIpXHJcbiAgICAgICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcj86IF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcclxuICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgQEluamVjdChTVElDS1lfUE9TSVRJT05JTkdfTElTVEVORVIpXHJcbiAgICAgIHByb3RlY3RlZCByZWFkb25seSBfc3RpY2t5UG9zaXRpb25pbmdMaXN0ZW5lcj86IFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIsXHJcbiAgICAgIC8vIE9wdGlvbmFsIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS4gVGhlIHZpZXdwb3J0IHJ1bGVyIGlzIHByb3ZpZGVkIGluIHJvb3QuIFRoZXJlZm9yZSxcclxuICAgICAgLy8gdGhpcyBwcm9wZXJ0eSB3aWxsIG5ldmVyIGJlIG51bGwuXHJcbiAgICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTogbGlnaHR3ZWlnaHQtdG9rZW5zXHJcbiAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcmVhZG9ubHkgX3ZpZXdwb3J0UnVsZXI/OiBWaWV3cG9ydFJ1bGVyKSB7XHJcbiAgICBpZiAoIXJvbGUpIHtcclxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSgncm9sZScsICdncmlkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XHJcbiAgICB0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudC5ub2RlTmFtZSA9PT0gJ1RBQkxFJztcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5fc2V0dXBTdGlja3lTdHlsZXIoKTtcclxuXHJcbiAgICBpZiAodGhpcy5faXNOYXRpdmVIdG1sVGFibGUpIHtcclxuICAgICAgdGhpcy5fYXBwbHlOYXRpdmVUYWJsZVNlY3Rpb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IHVwIHRoZSB0cmFja0J5IGZ1bmN0aW9uIHNvIHRoYXQgaXQgdXNlcyB0aGUgYFJlbmRlclJvd2AgYXMgaXRzIGlkZW50aXR5IGJ5IGRlZmF1bHQuIElmXHJcbiAgICAvLyB0aGUgdXNlciBoYXMgcHJvdmlkZWQgYSBjdXN0b20gdHJhY2tCeSwgcmV0dXJuIHRoZSByZXN1bHQgb2YgdGhhdCBmdW5jdGlvbiBhcyBldmFsdWF0ZWRcclxuICAgIC8vIHdpdGggdGhlIHZhbHVlcyBvZiB0aGUgYFJlbmRlclJvd2AncyBkYXRhIGFuZCBpbmRleC5cclxuICAgIHRoaXMuX2RhdGFEaWZmZXIgPSB0aGlzLl9kaWZmZXJzLmZpbmQoW10pLmNyZWF0ZSgoX2k6IG51bWJlciwgZGF0YVJvdzogUmVuZGVyUm93PFQ+KSA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRyYWNrQnkgPyB0aGlzLnRyYWNrQnkoZGF0YVJvdy5kYXRhSW5kZXgsIGRhdGFSb3cuZGF0YSkgOiBkYXRhUm93O1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gVGFibGUgY2VsbCBkaW1lbnNpb25zIG1heSBjaGFuZ2UgYWZ0ZXIgcmVzaXppbmcgdGhlIHdpbmRvdy4gU2lnbmFsIHRoZSBzdGlja3kgc3R5bGVyIHRvXHJcbiAgICAvLyByZWZyZXNoIGl0cyBjYWNoZSBvZiBjZWxsIHdpZHRocyB0aGUgbmV4dCB0aW1lIHN0aWNreSBzdHlsZXMgYXJlIHVwZGF0ZWQuXHJcbiAgICAvLyBAYnJlYWtpbmctY2hhbmdlIDExLjAuMCBSZW1vdmUgbnVsbCBjaGVjayBmb3IgX3ZpZXdwb3J0UnVsZXIgb25jZSBpdCdzIGEgcmVxdWlyZWQgcGFyYW1ldGVyLlxyXG4gICAgaWYgKHRoaXMuX3ZpZXdwb3J0UnVsZXIpIHtcclxuICAgICAgdGhpcy5fdmlld3BvcnRSdWxlci5jaGFuZ2UoKS5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2ZvcmNlUmVjYWxjdWxhdGVDZWxsV2lkdGhzID0gdHJ1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKSB7XHJcbiAgICAvLyBDYWNoZSB0aGUgcm93IGFuZCBjb2x1bW4gZGVmaW5pdGlvbnMgZ2F0aGVyZWQgYnkgQ29udGVudENoaWxkcmVuIGFuZCBwcm9ncmFtbWF0aWMgaW5qZWN0aW9uLlxyXG4gICAgdGhpcy5fY2FjaGVSb3dEZWZzKCk7XHJcbiAgICB0aGlzLl9jYWNoZUNvbHVtbkRlZnMoKTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgdXNlciBoYXMgYXQgbGVhc3QgYWRkZWQgaGVhZGVyLCBmb290ZXIsIG9yIGRhdGEgcm93IGRlZi5cclxuICAgIGlmICghdGhpcy5faGVhZGVyUm93RGVmcy5sZW5ndGggJiYgIXRoaXMuX2Zvb3RlclJvd0RlZnMubGVuZ3RoICYmICF0aGlzLl9yb3dEZWZzLmxlbmd0aCAmJlxyXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XHJcbiAgICAgIHRocm93IGdldFRhYmxlTWlzc2luZ1Jvd0RlZnNFcnJvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbmRlciB1cGRhdGVzIGlmIHRoZSBsaXN0IG9mIGNvbHVtbnMgaGF2ZSBiZWVuIGNoYW5nZWQgZm9yIHRoZSBoZWFkZXIsIHJvdywgb3IgZm9vdGVyIGRlZnMuXHJcbiAgICBjb25zdCBjb2x1bW5zQ2hhbmdlZCA9IHRoaXMuX3JlbmRlclVwZGF0ZWRDb2x1bW5zKCk7XHJcbiAgICBjb25zdCByb3dEZWZzQ2hhbmdlZCA9IGNvbHVtbnNDaGFuZ2VkIHx8IHRoaXMuX2hlYWRlclJvd0RlZkNoYW5nZWQgfHwgdGhpcy5fZm9vdGVyUm93RGVmQ2hhbmdlZDtcclxuICAgIC8vIEVuc3VyZSBzdGlja3kgY29sdW1uIHN0eWxlcyBhcmUgcmVzZXQgaWYgc2V0IHRvIGB0cnVlYCBlbHNld2hlcmUuXHJcbiAgICB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgPSB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQgfHwgcm93RGVmc0NoYW5nZWQ7XHJcbiAgICB0aGlzLl9mb3JjZVJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHJvd0RlZnNDaGFuZ2VkO1xyXG5cclxuICAgIC8vIElmIHRoZSBoZWFkZXIgcm93IGRlZmluaXRpb24gaGFzIGJlZW4gY2hhbmdlZCwgdHJpZ2dlciBhIHJlbmRlciB0byB0aGUgaGVhZGVyIHJvdy5cclxuICAgIGlmICh0aGlzLl9oZWFkZXJSb3dEZWZDaGFuZ2VkKSB7XHJcbiAgICAgIHRoaXMuX2ZvcmNlUmVuZGVySGVhZGVyUm93cygpO1xyXG4gICAgICB0aGlzLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgdGhlIGZvb3RlciByb3cgZGVmaW5pdGlvbiBoYXMgYmVlbiBjaGFuZ2VkLCB0cmlnZ2VyIGEgcmVuZGVyIHRvIHRoZSBmb290ZXIgcm93LlxyXG4gICAgaWYgKHRoaXMuX2Zvb3RlclJvd0RlZkNoYW5nZWQpIHtcclxuICAgICAgdGhpcy5fZm9yY2VSZW5kZXJGb290ZXJSb3dzKCk7XHJcbiAgICAgIHRoaXMuX2Zvb3RlclJvd0RlZkNoYW5nZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhIGRhdGEgc291cmNlIGFuZCByb3cgZGVmaW5pdGlvbnMsIGNvbm5lY3QgdG8gdGhlIGRhdGEgc291cmNlIHVubGVzcyBhXHJcbiAgICAvLyBjb25uZWN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gbWFkZS5cclxuICAgIGlmICh0aGlzLmRhdGFTb3VyY2UgJiYgdGhpcy5fcm93RGVmcy5sZW5ndGggPiAwICYmICF0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5fb2JzZXJ2ZVJlbmRlckNoYW5nZXMoKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5fc3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0KSB7XHJcbiAgICAgIC8vIEluIHRoZSBhYm92ZSBjYXNlLCBfb2JzZXJ2ZVJlbmRlckNoYW5nZXMgd2lsbCByZXN1bHQgaW4gdXBkYXRlU3RpY2t5Q29sdW1uU3R5bGVzIGJlaW5nXHJcbiAgICAgIC8vIGNhbGxlZCB3aGVuIGl0IHJvdyBkYXRhIGFycml2ZXMuIE90aGVyd2lzZSwgd2UgbmVlZCB0byBjYWxsIGl0IHByb2FjdGl2ZWx5LlxyXG4gICAgICB0aGlzLnVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NoZWNrU3RpY2t5U3RhdGVzKCk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9ub0RhdGFSb3dPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xyXG4gICAgdGhpcy5faGVhZGVyUm93T3V0bGV0LnZpZXdDb250YWluZXIuY2xlYXIoKTtcclxuICAgIHRoaXMuX2Zvb3RlclJvd091dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XHJcblxyXG4gICAgdGhpcy5fY2FjaGVkUmVuZGVyUm93c01hcC5jbGVhcigpO1xyXG5cclxuICAgIHRoaXMuX29uRGVzdHJveS5uZXh0KCk7XHJcbiAgICB0aGlzLl9vbkRlc3Ryb3kuY29tcGxldGUoKTtcclxuXHJcbiAgICBpZiAoaXNEYXRhU291cmNlKHRoaXMuZGF0YVNvdXJjZSkpIHtcclxuICAgICAgdGhpcy5kYXRhU291cmNlLmRpc2Nvbm5lY3QodGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXJzIHJvd3MgYmFzZWQgb24gdGhlIHRhYmxlJ3MgbGF0ZXN0IHNldCBvZiBkYXRhLCB3aGljaCB3YXMgZWl0aGVyIHByb3ZpZGVkIGRpcmVjdGx5IGFzIGFuXHJcbiAgICogaW5wdXQgb3IgcmV0cmlldmVkIHRocm91Z2ggYW4gT2JzZXJ2YWJsZSBzdHJlYW0gKGRpcmVjdGx5IG9yIGZyb20gYSBEYXRhU291cmNlKS5cclxuICAgKiBDaGVja3MgZm9yIGRpZmZlcmVuY2VzIGluIHRoZSBkYXRhIHNpbmNlIHRoZSBsYXN0IGRpZmYgdG8gcGVyZm9ybSBvbmx5IHRoZSBuZWNlc3NhcnlcclxuICAgKiBjaGFuZ2VzIChhZGQvcmVtb3ZlL21vdmUgcm93cykuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgdGFibGUncyBkYXRhIHNvdXJjZSBpcyBhIERhdGFTb3VyY2Ugb3IgT2JzZXJ2YWJsZSwgdGhpcyB3aWxsIGJlIGludm9rZWQgYXV0b21hdGljYWxseVxyXG4gICAqIGVhY2ggdGltZSB0aGUgcHJvdmlkZWQgT2JzZXJ2YWJsZSBzdHJlYW0gZW1pdHMgYSBuZXcgZGF0YSBhcnJheS4gT3RoZXJ3aXNlIGlmIHlvdXIgZGF0YSBpc1xyXG4gICAqIGFuIGFycmF5LCB0aGlzIGZ1bmN0aW9uIHdpbGwgbmVlZCB0byBiZSBjYWxsZWQgdG8gcmVuZGVyIGFueSBjaGFuZ2VzLlxyXG4gICAqL1xyXG4gIHJlbmRlclJvd3MoKSB7XHJcbiAgICB0aGlzLl9yZW5kZXJSb3dzID0gdGhpcy5fZ2V0QWxsUmVuZGVyUm93cygpO1xyXG4gICAgY29uc3QgY2hhbmdlcyA9IHRoaXMuX2RhdGFEaWZmZXIuZGlmZih0aGlzLl9yZW5kZXJSb3dzKTtcclxuICAgIGlmICghY2hhbmdlcykge1xyXG4gICAgICB0aGlzLl91cGRhdGVOb0RhdGFSb3coKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgdmlld0NvbnRhaW5lciA9IHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyO1xyXG5cclxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgMTEuMC4wIFJlbW92ZSBudWxsIGNoZWNrIGZvciBgX3ZpZXdSZXBlYXRlcmAgYW5kIHRoZVxyXG4gICAgLy8gYGVsc2VgIGNsYXVzZSBvbmNlIGBfdmlld1JlcGVhdGVyYCBpcyB0dXJuZWQgaW50byBhIHJlcXVpcmVkIHBhcmFtZXRlci5cclxuICAgIGlmICh0aGlzLl92aWV3UmVwZWF0ZXIpIHtcclxuICAgICAgdGhpcy5fdmlld1JlcGVhdGVyLmFwcGx5Q2hhbmdlcyhcclxuICAgICAgICAgIGNoYW5nZXMsXHJcbiAgICAgICAgICB2aWV3Q29udGFpbmVyLFxyXG4gICAgICAgICAgKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8UmVuZGVyUm93PFQ+PixcclxuICAgICAgICAgICBfYWRqdXN0ZWRQcmV2aW91c0luZGV4OiBudW1iZXJ8bnVsbCxcclxuICAgICAgICAgICBjdXJyZW50SW5kZXg6IG51bWJlcnxudWxsKSA9PiB0aGlzLl9nZXRFbWJlZGRlZFZpZXdBcmdzKHJlY29yZC5pdGVtLCBjdXJyZW50SW5kZXghKSxcclxuICAgICAgICAgIChyZWNvcmQpID0+IHJlY29yZC5pdGVtLmRhdGEsXHJcbiAgICAgICAgICAoY2hhbmdlOiBfVmlld1JlcGVhdGVySXRlbUNoYW5nZTxSZW5kZXJSb3c8VD4sIFJvd0NvbnRleHQ8VD4+KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjaGFuZ2Uub3BlcmF0aW9uID09PSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLklOU0VSVEVEICYmIGNoYW5nZS5jb250ZXh0KSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcmVuZGVyQ2VsbFRlbXBsYXRlRm9ySXRlbShjaGFuZ2UucmVjb3JkLml0ZW0ucm93RGVmLCBjaGFuZ2UuY29udGV4dCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKFxyXG4gICAgICAgIChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFJlbmRlclJvdzxUPj4sIHByZXZJbmRleDogbnVtYmVyfG51bGwsXHJcbiAgICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyfG51bGwpID0+IHtcclxuICAgICAgICAgIGlmIChyZWNvcmQucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlbmRlclJvdyA9IHJlY29yZC5pdGVtO1xyXG4gICAgICAgICAgICBjb25zdCByb3dEZWYgPSByZW5kZXJSb3cucm93RGVmO1xyXG4gICAgICAgICAgICBjb25zdCBjb250ZXh0OiBSb3dDb250ZXh0PFQ+ID0geyRpbXBsaWNpdDogcmVuZGVyUm93LmRhdGF9O1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJSb3codGhpcy5fcm93T3V0bGV0LCByb3dEZWYsIGN1cnJlbnRJbmRleCEsIGNvbnRleHQpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50SW5kZXggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyLnJlbW92ZShwcmV2SW5kZXghKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZpZXcgPSA8Um93Vmlld1JlZjxUPj52aWV3Q29udGFpbmVyLmdldChwcmV2SW5kZXghKTtcclxuICAgICAgICAgICAgdmlld0NvbnRhaW5lci5tb3ZlKHZpZXchLCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgbWV0YSBjb250ZXh0IG9mIGEgcm93J3MgY29udGV4dCBkYXRhIChpbmRleCwgY291bnQsIGZpcnN0LCBsYXN0LCAuLi4pXHJcbiAgICB0aGlzLl91cGRhdGVSb3dJbmRleENvbnRleHQoKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgcm93cyB0aGF0IGRpZCBub3QgZ2V0IGFkZGVkL3JlbW92ZWQvbW92ZWQgYnV0IG1heSBoYXZlIGhhZCB0aGVpciBpZGVudGl0eSBjaGFuZ2VkLFxyXG4gICAgLy8gZS5nLiBpZiB0cmFja0J5IG1hdGNoZWQgZGF0YSBvbiBzb21lIHByb3BlcnR5IGJ1dCB0aGUgYWN0dWFsIGRhdGEgcmVmZXJlbmNlIGNoYW5nZWQuXHJcbiAgICBjaGFuZ2VzLmZvckVhY2hJZGVudGl0eUNoYW5nZSgocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxSZW5kZXJSb3c8VD4+KSA9PiB7XHJcbiAgICAgIGNvbnN0IHJvd1ZpZXcgPSA8Um93Vmlld1JlZjxUPj52aWV3Q29udGFpbmVyLmdldChyZWNvcmQuY3VycmVudEluZGV4ISk7XHJcbiAgICAgIHJvd1ZpZXcuY29udGV4dC4kaW1wbGljaXQgPSByZWNvcmQuaXRlbS5kYXRhO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlTm9EYXRhUm93KCk7XHJcbiAgICB0aGlzLnVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFkZHMgYSBjb2x1bW4gZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cclxuICBhZGRDb2x1bW5EZWYoY29sdW1uRGVmOiBDZGtDb2x1bW5EZWYpIHtcclxuICAgIHRoaXMuX2N1c3RvbUNvbHVtbkRlZnMuYWRkKGNvbHVtbkRlZik7XHJcbiAgfVxyXG5cclxuICAvKiogUmVtb3ZlcyBhIGNvbHVtbiBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xyXG4gIHJlbW92ZUNvbHVtbkRlZihjb2x1bW5EZWY6IENka0NvbHVtbkRlZikge1xyXG4gICAgdGhpcy5fY3VzdG9tQ29sdW1uRGVmcy5kZWxldGUoY29sdW1uRGVmKTtcclxuICB9XHJcblxyXG4gIC8qKiBBZGRzIGEgcm93IGRlZmluaXRpb24gdGhhdCB3YXMgbm90IGluY2x1ZGVkIGFzIHBhcnQgb2YgdGhlIGNvbnRlbnQgY2hpbGRyZW4uICovXHJcbiAgYWRkUm93RGVmKHJvd0RlZjogQ2RrUm93RGVmPFQ+KSB7XHJcbiAgICB0aGlzLl9jdXN0b21Sb3dEZWZzLmFkZChyb3dEZWYpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlbW92ZXMgYSByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cclxuICByZW1vdmVSb3dEZWYocm93RGVmOiBDZGtSb3dEZWY8VD4pIHtcclxuICAgIHRoaXMuX2N1c3RvbVJvd0RlZnMuZGVsZXRlKHJvd0RlZik7XHJcbiAgfVxyXG5cclxuICAvKiogQWRkcyBhIGhlYWRlciByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cclxuICBhZGRIZWFkZXJSb3dEZWYoaGVhZGVyUm93RGVmOiBDZGtIZWFkZXJSb3dEZWYpIHtcclxuICAgIHRoaXMuX2N1c3RvbUhlYWRlclJvd0RlZnMuYWRkKGhlYWRlclJvd0RlZik7XHJcbiAgICB0aGlzLl9oZWFkZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKiBSZW1vdmVzIGEgaGVhZGVyIHJvdyBkZWZpbml0aW9uIHRoYXQgd2FzIG5vdCBpbmNsdWRlZCBhcyBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xyXG4gIHJlbW92ZUhlYWRlclJvd0RlZihoZWFkZXJSb3dEZWY6IENka0hlYWRlclJvd0RlZikge1xyXG4gICAgdGhpcy5fY3VzdG9tSGVhZGVyUm93RGVmcy5kZWxldGUoaGVhZGVyUm93RGVmKTtcclxuICAgIHRoaXMuX2hlYWRlclJvd0RlZkNoYW5nZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFkZHMgYSBmb290ZXIgcm93IGRlZmluaXRpb24gdGhhdCB3YXMgbm90IGluY2x1ZGVkIGFzIHBhcnQgb2YgdGhlIGNvbnRlbnQgY2hpbGRyZW4uICovXHJcbiAgYWRkRm9vdGVyUm93RGVmKGZvb3RlclJvd0RlZjogQ2RrRm9vdGVyUm93RGVmKSB7XHJcbiAgICB0aGlzLl9jdXN0b21Gb290ZXJSb3dEZWZzLmFkZChmb290ZXJSb3dEZWYpO1xyXG4gICAgdGhpcy5fZm9vdGVyUm93RGVmQ2hhbmdlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKiogUmVtb3ZlcyBhIGZvb3RlciByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgcGFydCBvZiB0aGUgY29udGVudCBjaGlsZHJlbi4gKi9cclxuICByZW1vdmVGb290ZXJSb3dEZWYoZm9vdGVyUm93RGVmOiBDZGtGb290ZXJSb3dEZWYpIHtcclxuICAgIHRoaXMuX2N1c3RvbUZvb3RlclJvd0RlZnMuZGVsZXRlKGZvb3RlclJvd0RlZik7XHJcbiAgICB0aGlzLl9mb290ZXJSb3dEZWZDaGFuZ2VkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKiBTZXRzIGEgbm8gZGF0YSByb3cgZGVmaW5pdGlvbiB0aGF0IHdhcyBub3QgaW5jbHVkZWQgYXMgYSBwYXJ0IG9mIHRoZSBjb250ZW50IGNoaWxkcmVuLiAqL1xyXG4gIHNldE5vRGF0YVJvdyhub0RhdGFSb3c6IENka05vRGF0YVJvdyB8IG51bGwpIHtcclxuICAgIHRoaXMuX2N1c3RvbU5vRGF0YVJvdyA9IG5vRGF0YVJvdztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGhlYWRlciBzdGlja3kgc3R5bGVzLiBGaXJzdCByZXNldHMgYWxsIGFwcGxpZWQgc3R5bGVzIHdpdGggcmVzcGVjdCB0byB0aGUgY2VsbHNcclxuICAgKiBzdGlja2luZyB0byB0aGUgdG9wLiBUaGVuLCBldmFsdWF0aW5nIHdoaWNoIGNlbGxzIG5lZWQgdG8gYmUgc3R1Y2sgdG8gdGhlIHRvcC4gVGhpcyBpc1xyXG4gICAqIGF1dG9tYXRpY2FsbHkgY2FsbGVkIHdoZW4gdGhlIGhlYWRlciByb3cgY2hhbmdlcyBpdHMgZGlzcGxheWVkIHNldCBvZiBjb2x1bW5zLCBvciBpZiBpdHNcclxuICAgKiBzdGlja3kgaW5wdXQgY2hhbmdlcy4gTWF5IGJlIGNhbGxlZCBtYW51YWxseSBmb3IgY2FzZXMgd2hlcmUgdGhlIGNlbGwgY29udGVudCBjaGFuZ2VzIG91dHNpZGVcclxuICAgKiBvZiB0aGVzZSBldmVudHMuXHJcbiAgICovXHJcbiAgdXBkYXRlU3RpY2t5SGVhZGVyUm93U3R5bGVzKCk6IHZvaWQge1xyXG4gICAgY29uc3QgaGVhZGVyUm93cyA9IHRoaXMuX2dldFJlbmRlcmVkUm93cyh0aGlzLl9oZWFkZXJSb3dPdXRsZXQpO1xyXG4gICAgY29uc3QgdGFibGVFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xyXG5cclxuICAgIC8vIEhpZGUgdGhlIHRoZWFkIGVsZW1lbnQgaWYgdGhlcmUgYXJlIG5vIGhlYWRlciByb3dzLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBzYXRpc2Z5XHJcbiAgICAvLyBvdmVyemVhbG91cyBhMTF5IGNoZWNrZXJzIHRoYXQgZmFpbCBiZWNhdXNlIHRoZSBgcm93Z3JvdXBgIGVsZW1lbnQgZG9lcyBub3QgY29udGFpblxyXG4gICAgLy8gcmVxdWlyZWQgY2hpbGQgYHJvd2AuXHJcbiAgICBjb25zdCB0aGVhZCA9IHRhYmxlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCd0aGVhZCcpO1xyXG4gICAgaWYgKHRoZWFkKSB7XHJcbiAgICAgIHRoZWFkLnN0eWxlLmRpc3BsYXkgPSBoZWFkZXJSb3dzLmxlbmd0aCA/ICcnIDogJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0aWNreVN0YXRlcyA9IHRoaXMuX2hlYWRlclJvd0RlZnMubWFwKGRlZiA9PiBkZWYuc3RpY2t5KTtcclxuICAgIHRoaXMuX3N0aWNreVN0eWxlci5jbGVhclN0aWNreVBvc2l0aW9uaW5nKGhlYWRlclJvd3MsIFsndG9wJ10pO1xyXG4gICAgdGhpcy5fc3RpY2t5U3R5bGVyLnN0aWNrUm93cyhoZWFkZXJSb3dzLCBzdGlja3lTdGF0ZXMsICd0b3AnKTtcclxuXHJcbiAgICAvLyBSZXNldCB0aGUgZGlydHkgc3RhdGUgb2YgdGhlIHN0aWNreSBpbnB1dCBjaGFuZ2Ugc2luY2UgaXQgaGFzIGJlZW4gdXNlZC5cclxuICAgIHRoaXMuX2hlYWRlclJvd0RlZnMuZm9yRWFjaChkZWYgPT4gZGVmLnJlc2V0U3RpY2t5Q2hhbmdlZCgpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIGZvb3RlciBzdGlja3kgc3R5bGVzLiBGaXJzdCByZXNldHMgYWxsIGFwcGxpZWQgc3R5bGVzIHdpdGggcmVzcGVjdCB0byB0aGUgY2VsbHNcclxuICAgKiBzdGlja2luZyB0byB0aGUgYm90dG9tLiBUaGVuLCBldmFsdWF0aW5nIHdoaWNoIGNlbGxzIG5lZWQgdG8gYmUgc3R1Y2sgdG8gdGhlIGJvdHRvbS4gVGhpcyBpc1xyXG4gICAqIGF1dG9tYXRpY2FsbHkgY2FsbGVkIHdoZW4gdGhlIGZvb3RlciByb3cgY2hhbmdlcyBpdHMgZGlzcGxheWVkIHNldCBvZiBjb2x1bW5zLCBvciBpZiBpdHNcclxuICAgKiBzdGlja3kgaW5wdXQgY2hhbmdlcy4gTWF5IGJlIGNhbGxlZCBtYW51YWxseSBmb3IgY2FzZXMgd2hlcmUgdGhlIGNlbGwgY29udGVudCBjaGFuZ2VzIG91dHNpZGVcclxuICAgKiBvZiB0aGVzZSBldmVudHMuXHJcbiAgICovXHJcbiAgdXBkYXRlU3RpY2t5Rm9vdGVyUm93U3R5bGVzKCk6IHZvaWQge1xyXG4gICAgY29uc3QgZm9vdGVyUm93cyA9IHRoaXMuX2dldFJlbmRlcmVkUm93cyh0aGlzLl9mb290ZXJSb3dPdXRsZXQpO1xyXG4gICAgY29uc3QgdGFibGVFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xyXG5cclxuICAgIC8vIEhpZGUgdGhlIHRmb290IGVsZW1lbnQgaWYgdGhlcmUgYXJlIG5vIGZvb3RlciByb3dzLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byBzYXRpc2Z5XHJcbiAgICAvLyBvdmVyemVhbG91cyBhMTF5IGNoZWNrZXJzIHRoYXQgZmFpbCBiZWNhdXNlIHRoZSBgcm93Z3JvdXBgIGVsZW1lbnQgZG9lcyBub3QgY29udGFpblxyXG4gICAgLy8gcmVxdWlyZWQgY2hpbGQgYHJvd2AuXHJcbiAgICBjb25zdCB0Zm9vdCA9IHRhYmxlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCd0Zm9vdCcpO1xyXG4gICAgaWYgKHRmb290KSB7XHJcbiAgICAgIHRmb290LnN0eWxlLmRpc3BsYXkgPSBmb290ZXJSb3dzLmxlbmd0aCA/ICcnIDogJ25vbmUnO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0aWNreVN0YXRlcyA9IHRoaXMuX2Zvb3RlclJvd0RlZnMubWFwKGRlZiA9PiBkZWYuc3RpY2t5KTtcclxuICAgIHRoaXMuX3N0aWNreVN0eWxlci5jbGVhclN0aWNreVBvc2l0aW9uaW5nKGZvb3RlclJvd3MsIFsnYm90dG9tJ10pO1xyXG4gICAgdGhpcy5fc3RpY2t5U3R5bGVyLnN0aWNrUm93cyhmb290ZXJSb3dzLCBzdGlja3lTdGF0ZXMsICdib3R0b20nKTtcclxuICAgIHRoaXMuX3N0aWNreVN0eWxlci51cGRhdGVTdGlja3lGb290ZXJDb250YWluZXIodGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LCBzdGlja3lTdGF0ZXMpO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSBvZiB0aGUgc3RpY2t5IGlucHV0IGNoYW5nZSBzaW5jZSBpdCBoYXMgYmVlbiB1c2VkLlxyXG4gICAgdGhpcy5fZm9vdGVyUm93RGVmcy5mb3JFYWNoKGRlZiA9PiBkZWYucmVzZXRTdGlja3lDaGFuZ2VkKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgY29sdW1uIHN0aWNreSBzdHlsZXMuIEZpcnN0IHJlc2V0cyBhbGwgYXBwbGllZCBzdHlsZXMgd2l0aCByZXNwZWN0IHRvIHRoZSBjZWxsc1xyXG4gICAqIHN0aWNraW5nIHRvIHRoZSBsZWZ0IGFuZCByaWdodC4gVGhlbiBzdGlja3kgc3R5bGVzIGFyZSBhZGRlZCBmb3IgdGhlIGxlZnQgYW5kIHJpZ2h0IGFjY29yZGluZ1xyXG4gICAqIHRvIHRoZSBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIGVhY2ggY2VsbCBpbiBlYWNoIHJvdy4gVGhpcyBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCB3aGVuXHJcbiAgICogdGhlIGRhdGEgc291cmNlIHByb3ZpZGVzIGEgbmV3IHNldCBvZiBkYXRhIG9yIHdoZW4gYSBjb2x1bW4gZGVmaW5pdGlvbiBjaGFuZ2VzIGl0cyBzdGlja3lcclxuICAgKiBpbnB1dC4gTWF5IGJlIGNhbGxlZCBtYW51YWxseSBmb3IgY2FzZXMgd2hlcmUgdGhlIGNlbGwgY29udGVudCBjaGFuZ2VzIG91dHNpZGUgb2YgdGhlc2UgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHVwZGF0ZVN0aWNreUNvbHVtblN0eWxlcygpIHtcclxuICAgIGNvbnN0IGhlYWRlclJvd3MgPSB0aGlzLl9nZXRSZW5kZXJlZFJvd3ModGhpcy5faGVhZGVyUm93T3V0bGV0KTtcclxuICAgIGNvbnN0IGRhdGFSb3dzID0gdGhpcy5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMuX3Jvd091dGxldCk7XHJcbiAgICBjb25zdCBmb290ZXJSb3dzID0gdGhpcy5fZ2V0UmVuZGVyZWRSb3dzKHRoaXMuX2Zvb3RlclJvd091dGxldCk7XHJcblxyXG4gICAgLy8gRm9yIHRhYmxlcyBub3QgdXNpbmcgYSBmaXhlZCBsYXlvdXQsIHRoZSBjb2x1bW4gd2lkdGhzIG1heSBjaGFuZ2Ugd2hlbiBuZXcgcm93cyBhcmUgcmVuZGVyZWQuXHJcbiAgICAvLyBJbiBhIHRhYmxlIHVzaW5nIGEgZml4ZWQgbGF5b3V0LCByb3cgY29udGVudCB3b24ndCBhZmZlY3QgY29sdW1uIHdpZHRoLCBzbyBzdGlja3kgc3R5bGVzXHJcbiAgICAvLyBkb24ndCBuZWVkIHRvIGJlIGNsZWFyZWQgdW5sZXNzIGVpdGhlciB0aGUgc3RpY2t5IGNvbHVtbiBjb25maWcgY2hhbmdlcyBvciBvbmUgb2YgdGhlIHJvd1xyXG4gICAgLy8gZGVmcyBjaGFuZ2UuXHJcbiAgICBpZiAoKHRoaXMuX2lzTmF0aXZlSHRtbFRhYmxlICYmICF0aGlzLl9maXhlZExheW91dClcclxuICAgICAgICB8fCB0aGlzLl9zdGlja3lDb2x1bW5TdHlsZXNOZWVkUmVzZXQpIHtcclxuICAgICAgLy8gQ2xlYXIgdGhlIGxlZnQgYW5kIHJpZ2h0IHBvc2l0aW9uaW5nIGZyb20gYWxsIGNvbHVtbnMgaW4gdGhlIHRhYmxlIGFjcm9zcyBhbGwgcm93cyBzaW5jZVxyXG4gICAgICAvLyBzdGlja3kgY29sdW1ucyBzcGFuIGFjcm9zcyBhbGwgdGFibGUgc2VjdGlvbnMgKGhlYWRlciwgZGF0YSwgZm9vdGVyKVxyXG4gICAgICB0aGlzLl9zdGlja3lTdHlsZXIuY2xlYXJTdGlja3lQb3NpdGlvbmluZyhcclxuICAgICAgICAgIFsuLi5oZWFkZXJSb3dzLCAuLi5kYXRhUm93cywgLi4uZm9vdGVyUm93c10sIFsnbGVmdCcsICdyaWdodCddKTtcclxuICAgICAgdGhpcy5fc3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0ID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBzdGlja3kgc3R5bGVzIGZvciBlYWNoIGhlYWRlciByb3cgZGVwZW5kaW5nIG9uIHRoZSBkZWYncyBzdGlja3kgc3RhdGVcclxuICAgIGhlYWRlclJvd3MuZm9yRWFjaCgoaGVhZGVyUm93LCBpKSA9PiB7XHJcbiAgICAgIHRoaXMuX2FkZFN0aWNreUNvbHVtblN0eWxlcyhbaGVhZGVyUm93XSwgdGhpcy5faGVhZGVyUm93RGVmc1tpXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHN0aWNreSBzdHlsZXMgZm9yIGVhY2ggZGF0YSByb3cgZGVwZW5kaW5nIG9uIGl0cyBkZWYncyBzdGlja3kgc3RhdGVcclxuICAgIHRoaXMuX3Jvd0RlZnMuZm9yRWFjaChyb3dEZWYgPT4ge1xyXG4gICAgICAvLyBDb2xsZWN0IGFsbCB0aGUgcm93cyByZW5kZXJlZCB3aXRoIHRoaXMgcm93IGRlZmluaXRpb24uXHJcbiAgICAgIGNvbnN0IHJvd3M6IEhUTUxFbGVtZW50W10gPSBbXTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhUm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLl9yZW5kZXJSb3dzW2ldLnJvd0RlZiA9PT0gcm93RGVmKSB7XHJcbiAgICAgICAgICByb3dzLnB1c2goZGF0YVJvd3NbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fYWRkU3RpY2t5Q29sdW1uU3R5bGVzKHJvd3MsIHJvd0RlZik7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHN0aWNreSBzdHlsZXMgZm9yIGVhY2ggZm9vdGVyIHJvdyBkZXBlbmRpbmcgb24gdGhlIGRlZidzIHN0aWNreSBzdGF0ZVxyXG4gICAgZm9vdGVyUm93cy5mb3JFYWNoKChmb290ZXJSb3csIGkpID0+IHtcclxuICAgICAgdGhpcy5fYWRkU3RpY2t5Q29sdW1uU3R5bGVzKFtmb290ZXJSb3ddLCB0aGlzLl9mb290ZXJSb3dEZWZzW2ldKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBkaXJ0eSBzdGF0ZSBvZiB0aGUgc3RpY2t5IGlucHV0IGNoYW5nZSBzaW5jZSBpdCBoYXMgYmVlbiB1c2VkLlxyXG4gICAgQXJyYXkuZnJvbSh0aGlzLl9jb2x1bW5EZWZzQnlOYW1lLnZhbHVlcygpKS5mb3JFYWNoKGRlZiA9PiBkZWYucmVzZXRTdGlja3lDaGFuZ2VkKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBsaXN0IG9mIFJlbmRlclJvdyBvYmplY3RzIHRvIHJlbmRlciBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgbGlzdCBvZiBkYXRhIGFuZCBkZWZpbmVkXHJcbiAgICogcm93IGRlZmluaXRpb25zLiBJZiB0aGUgcHJldmlvdXMgbGlzdCBhbHJlYWR5IGNvbnRhaW5lZCBhIHBhcnRpY3VsYXIgcGFpciwgaXQgc2hvdWxkIGJlIHJldXNlZFxyXG4gICAqIHNvIHRoYXQgdGhlIGRpZmZlciBlcXVhdGVzIHRoZWlyIHJlZmVyZW5jZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfZ2V0QWxsUmVuZGVyUm93cygpOiBSZW5kZXJSb3c8VD5bXSB7XHJcbiAgICBjb25zdCByZW5kZXJSb3dzOiBSZW5kZXJSb3c8VD5bXSA9IFtdO1xyXG5cclxuICAgIC8vIFN0b3JlIHRoZSBjYWNoZSBhbmQgY3JlYXRlIGEgbmV3IG9uZS4gQW55IHJlLXVzZWQgUmVuZGVyUm93IG9iamVjdHMgd2lsbCBiZSBtb3ZlZCBpbnRvIHRoZVxyXG4gICAgLy8gbmV3IGNhY2hlIHdoaWxlIHVudXNlZCBvbmVzIGNhbiBiZSBwaWNrZWQgdXAgYnkgZ2FyYmFnZSBjb2xsZWN0aW9uLlxyXG4gICAgY29uc3QgcHJldkNhY2hlZFJlbmRlclJvd3MgPSB0aGlzLl9jYWNoZWRSZW5kZXJSb3dzTWFwO1xyXG4gICAgdGhpcy5fY2FjaGVkUmVuZGVyUm93c01hcCA9IG5ldyBNYXAoKTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCBkYXRhIG9iamVjdCwgZ2V0IHRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQsIHJlcHJlc2VudGVkIGJ5IHRoZVxyXG4gICAgLy8gcmVzcGVjdGl2ZSBgUmVuZGVyUm93YCBvYmplY3Qgd2hpY2ggaXMgdGhlIHBhaXIgb2YgYGRhdGFgIGFuZCBgQ2RrUm93RGVmYC5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgZGF0YSA9IHRoaXMuX2RhdGFbaV07XHJcbiAgICAgIGNvbnN0IHJlbmRlclJvd3NGb3JEYXRhID0gdGhpcy5fZ2V0UmVuZGVyUm93c0ZvckRhdGEoZGF0YSwgaSwgcHJldkNhY2hlZFJlbmRlclJvd3MuZ2V0KGRhdGEpKTtcclxuXHJcbiAgICAgIGlmICghdGhpcy5fY2FjaGVkUmVuZGVyUm93c01hcC5oYXMoZGF0YSkpIHtcclxuICAgICAgICB0aGlzLl9jYWNoZWRSZW5kZXJSb3dzTWFwLnNldChkYXRhLCBuZXcgV2Vha01hcCgpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZW5kZXJSb3dzRm9yRGF0YS5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGxldCByZW5kZXJSb3cgPSByZW5kZXJSb3dzRm9yRGF0YVtqXTtcclxuXHJcbiAgICAgICAgY29uc3QgY2FjaGUgPSB0aGlzLl9jYWNoZWRSZW5kZXJSb3dzTWFwLmdldChyZW5kZXJSb3cuZGF0YSkhO1xyXG4gICAgICAgIGlmIChjYWNoZS5oYXMocmVuZGVyUm93LnJvd0RlZikpIHtcclxuICAgICAgICAgIGNhY2hlLmdldChyZW5kZXJSb3cucm93RGVmKSEucHVzaChyZW5kZXJSb3cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjYWNoZS5zZXQocmVuZGVyUm93LnJvd0RlZiwgW3JlbmRlclJvd10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZW5kZXJSb3dzLnB1c2gocmVuZGVyUm93KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZW5kZXJSb3dzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIGxpc3Qgb2YgYFJlbmRlclJvdzxUPmAgZm9yIHRoZSBwcm92aWRlZCBkYXRhIG9iamVjdCBhbmQgYW55IGBDZGtSb3dEZWZgIG9iamVjdHMgdGhhdFxyXG4gICAqIHNob3VsZCBiZSByZW5kZXJlZCBmb3IgdGhpcyBkYXRhLiBSZXVzZXMgdGhlIGNhY2hlZCBSZW5kZXJSb3cgb2JqZWN0cyBpZiB0aGV5IG1hdGNoIHRoZSBzYW1lXHJcbiAgICogYChULCBDZGtSb3dEZWYpYCBwYWlyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2dldFJlbmRlclJvd3NGb3JEYXRhKFxyXG4gICAgICBkYXRhOiBULCBkYXRhSW5kZXg6IG51bWJlciwgY2FjaGU/OiBXZWFrTWFwPENka1Jvd0RlZjxUPiwgUmVuZGVyUm93PFQ+W10+KTogUmVuZGVyUm93PFQ+W10ge1xyXG4gICAgY29uc3Qgcm93RGVmcyA9IHRoaXMuX2dldFJvd0RlZnMoZGF0YSwgZGF0YUluZGV4KTtcclxuXHJcbiAgICByZXR1cm4gcm93RGVmcy5tYXAocm93RGVmID0+IHtcclxuICAgICAgY29uc3QgY2FjaGVkUmVuZGVyUm93cyA9IChjYWNoZSAmJiBjYWNoZS5oYXMocm93RGVmKSkgPyBjYWNoZS5nZXQocm93RGVmKSEgOiBbXTtcclxuICAgICAgaWYgKGNhY2hlZFJlbmRlclJvd3MubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YVJvdyA9IGNhY2hlZFJlbmRlclJvd3Muc2hpZnQoKSE7XHJcbiAgICAgICAgZGF0YVJvdy5kYXRhSW5kZXggPSBkYXRhSW5kZXg7XHJcbiAgICAgICAgcmV0dXJuIGRhdGFSb3c7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHtkYXRhLCByb3dEZWYsIGRhdGFJbmRleH07XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIFVwZGF0ZSB0aGUgbWFwIGNvbnRhaW5pbmcgdGhlIGNvbnRlbnQncyBjb2x1bW4gZGVmaW5pdGlvbnMuICovXHJcbiAgcHJpdmF0ZSBfY2FjaGVDb2x1bW5EZWZzKCkge1xyXG4gICAgdGhpcy5fY29sdW1uRGVmc0J5TmFtZS5jbGVhcigpO1xyXG5cclxuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSBtZXJnZUFycmF5QW5kU2V0KFxyXG4gICAgICAgIHRoaXMuX2dldE93bkRlZnModGhpcy5fY29udGVudENvbHVtbkRlZnMpLCB0aGlzLl9jdXN0b21Db2x1bW5EZWZzKTtcclxuICAgIGNvbHVtbkRlZnMuZm9yRWFjaChjb2x1bW5EZWYgPT4ge1xyXG4gICAgICBpZiAodGhpcy5fY29sdW1uRGVmc0J5TmFtZS5oYXMoY29sdW1uRGVmLm5hbWUpICYmXHJcbiAgICAgICAgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgICB0aHJvdyBnZXRUYWJsZUR1cGxpY2F0ZUNvbHVtbk5hbWVFcnJvcihjb2x1bW5EZWYubmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fY29sdW1uRGVmc0J5TmFtZS5zZXQoY29sdW1uRGVmLm5hbWUsIGNvbHVtbkRlZik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBVcGRhdGUgdGhlIGxpc3Qgb2YgYWxsIGF2YWlsYWJsZSByb3cgZGVmaW5pdGlvbnMgdGhhdCBjYW4gYmUgdXNlZC4gKi9cclxuICBwcml2YXRlIF9jYWNoZVJvd0RlZnMoKSB7XHJcbiAgICB0aGlzLl9oZWFkZXJSb3dEZWZzID0gbWVyZ2VBcnJheUFuZFNldChcclxuICAgICAgICB0aGlzLl9nZXRPd25EZWZzKHRoaXMuX2NvbnRlbnRIZWFkZXJSb3dEZWZzKSwgdGhpcy5fY3VzdG9tSGVhZGVyUm93RGVmcyk7XHJcbiAgICB0aGlzLl9mb290ZXJSb3dEZWZzID0gbWVyZ2VBcnJheUFuZFNldChcclxuICAgICAgICB0aGlzLl9nZXRPd25EZWZzKHRoaXMuX2NvbnRlbnRGb290ZXJSb3dEZWZzKSwgdGhpcy5fY3VzdG9tRm9vdGVyUm93RGVmcyk7XHJcbiAgICB0aGlzLl9yb3dEZWZzID0gbWVyZ2VBcnJheUFuZFNldChcclxuICAgICAgICB0aGlzLl9nZXRPd25EZWZzKHRoaXMuX2NvbnRlbnRSb3dEZWZzKSwgdGhpcy5fY3VzdG9tUm93RGVmcyk7XHJcblxyXG4gICAgLy8gQWZ0ZXIgYWxsIHJvdyBkZWZpbml0aW9ucyBhcmUgZGV0ZXJtaW5lZCwgZmluZCB0aGUgcm93IGRlZmluaXRpb24gdG8gYmUgY29uc2lkZXJlZCBkZWZhdWx0LlxyXG4gICAgY29uc3QgZGVmYXVsdFJvd0RlZnMgPSB0aGlzLl9yb3dEZWZzLmZpbHRlcihkZWYgPT4gIWRlZi53aGVuKTtcclxuICAgIGlmICghdGhpcy5tdWx0aVRlbXBsYXRlRGF0YVJvd3MgJiYgZGVmYXVsdFJvd0RlZnMubGVuZ3RoID4gMSAmJlxyXG4gICAgICAgICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XHJcbiAgICAgIHRocm93IGdldFRhYmxlTXVsdGlwbGVEZWZhdWx0Um93RGVmc0Vycm9yKCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9kZWZhdWx0Um93RGVmID0gZGVmYXVsdFJvd0RlZnNbMF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaGVjayBpZiB0aGUgaGVhZGVyLCBkYXRhLCBvciBmb290ZXIgcm93cyBoYXZlIGNoYW5nZWQgd2hhdCBjb2x1bW5zIHRoZXkgd2FudCB0byBkaXNwbGF5IG9yXHJcbiAgICogd2hldGhlciB0aGUgc3RpY2t5IHN0YXRlcyBoYXZlIGNoYW5nZWQgZm9yIHRoZSBoZWFkZXIgb3IgZm9vdGVyLiBJZiB0aGVyZSBpcyBhIGRpZmYsIHRoZW5cclxuICAgKiByZS1yZW5kZXIgdGhhdCBzZWN0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3JlbmRlclVwZGF0ZWRDb2x1bW5zKCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgY29sdW1uc0RpZmZSZWR1Y2VyID0gKGFjYzogYm9vbGVhbiwgZGVmOiBCYXNlUm93RGVmKSA9PiBhY2MgfHwgISFkZWYuZ2V0Q29sdW1uc0RpZmYoKTtcclxuXHJcbiAgICAvLyBGb3JjZSByZS1yZW5kZXIgZGF0YSByb3dzIGlmIHRoZSBsaXN0IG9mIGNvbHVtbiBkZWZpbml0aW9ucyBoYXZlIGNoYW5nZWQuXHJcbiAgICBjb25zdCBkYXRhQ29sdW1uc0NoYW5nZWQgPSB0aGlzLl9yb3dEZWZzLnJlZHVjZShjb2x1bW5zRGlmZlJlZHVjZXIsIGZhbHNlKTtcclxuICAgIGlmIChkYXRhQ29sdW1uc0NoYW5nZWQpIHtcclxuICAgICAgdGhpcy5fZm9yY2VSZW5kZXJEYXRhUm93cygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZvcmNlIHJlLXJlbmRlciBoZWFkZXIvZm9vdGVyIHJvd3MgaWYgdGhlIGxpc3Qgb2YgY29sdW1uIGRlZmluaXRpb25zIGhhdmUgY2hhbmdlZC5cclxuICAgIGNvbnN0IGhlYWRlckNvbHVtbnNDaGFuZ2VkID0gdGhpcy5faGVhZGVyUm93RGVmcy5yZWR1Y2UoY29sdW1uc0RpZmZSZWR1Y2VyLCBmYWxzZSk7XHJcbiAgICBpZiAoaGVhZGVyQ29sdW1uc0NoYW5nZWQpIHtcclxuICAgICAgdGhpcy5fZm9yY2VSZW5kZXJIZWFkZXJSb3dzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZm9vdGVyQ29sdW1uc0NoYW5nZWQgPSB0aGlzLl9mb290ZXJSb3dEZWZzLnJlZHVjZShjb2x1bW5zRGlmZlJlZHVjZXIsIGZhbHNlKTtcclxuICAgIGlmIChmb290ZXJDb2x1bW5zQ2hhbmdlZCkge1xyXG4gICAgICB0aGlzLl9mb3JjZVJlbmRlckZvb3RlclJvd3MoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YUNvbHVtbnNDaGFuZ2VkIHx8IGhlYWRlckNvbHVtbnNDaGFuZ2VkIHx8IGZvb3RlckNvbHVtbnNDaGFuZ2VkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3dpdGNoIHRvIHRoZSBwcm92aWRlZCBkYXRhIHNvdXJjZSBieSByZXNldHRpbmcgdGhlIGRhdGEgYW5kIHVuc3Vic2NyaWJpbmcgZnJvbSB0aGUgY3VycmVudFxyXG4gICAqIHJlbmRlciBjaGFuZ2Ugc3Vic2NyaXB0aW9uIGlmIG9uZSBleGlzdHMuIElmIHRoZSBkYXRhIHNvdXJjZSBpcyBudWxsLCBpbnRlcnByZXQgdGhpcyBieVxyXG4gICAqIGNsZWFyaW5nIHRoZSByb3cgb3V0bGV0LiBPdGhlcndpc2Ugc3RhcnQgbGlzdGVuaW5nIGZvciBuZXcgZGF0YS5cclxuICAgKi9cclxuICBwcml2YXRlIF9zd2l0Y2hEYXRhU291cmNlKGRhdGFTb3VyY2U6IENka1RhYmxlRGF0YVNvdXJjZUlucHV0PFQ+KSB7XHJcbiAgICB0aGlzLl9kYXRhID0gW107XHJcblxyXG4gICAgaWYgKGlzRGF0YVNvdXJjZSh0aGlzLmRhdGFTb3VyY2UpKSB7XHJcbiAgICAgIHRoaXMuZGF0YVNvdXJjZS5kaXNjb25uZWN0KHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFN0b3AgbGlzdGVuaW5nIGZvciBkYXRhIGZyb20gdGhlIHByZXZpb3VzIGRhdGEgc291cmNlLlxyXG4gICAgaWYgKHRoaXMuX3JlbmRlckNoYW5nZVN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgdGhpcy5fcmVuZGVyQ2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRhdGFTb3VyY2UpIHtcclxuICAgICAgaWYgKHRoaXMuX2RhdGFEaWZmZXIpIHtcclxuICAgICAgICB0aGlzLl9kYXRhRGlmZmVyLmRpZmYoW10pO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0IHVwIGEgc3Vic2NyaXB0aW9uIGZvciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGUgZGF0YSBzb3VyY2UuICovXHJcbiAgcHJpdmF0ZSBfb2JzZXJ2ZVJlbmRlckNoYW5nZXMoKSB7XHJcbiAgICAvLyBJZiBubyBkYXRhIHNvdXJjZSBoYXMgYmVlbiBzZXQsIHRoZXJlIGlzIG5vdGhpbmcgdG8gb2JzZXJ2ZSBmb3IgY2hhbmdlcy5cclxuICAgIGlmICghdGhpcy5kYXRhU291cmNlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF0YVN0cmVhbTogT2JzZXJ2YWJsZTxUW118UmVhZG9ubHlBcnJheTxUPj58dW5kZWZpbmVkO1xyXG5cclxuICAgIGlmIChpc0RhdGFTb3VyY2UodGhpcy5kYXRhU291cmNlKSkge1xyXG4gICAgICBkYXRhU3RyZWFtID0gdGhpcy5kYXRhU291cmNlLmNvbm5lY3QodGhpcyk7XHJcbiAgICB9IGVsc2UgaWYgKGlzT2JzZXJ2YWJsZSh0aGlzLmRhdGFTb3VyY2UpKSB7XHJcbiAgICAgIGRhdGFTdHJlYW0gPSB0aGlzLmRhdGFTb3VyY2U7XHJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5kYXRhU291cmNlKSkge1xyXG4gICAgICBkYXRhU3RyZWFtID0gb2JzZXJ2YWJsZU9mKHRoaXMuZGF0YVNvdXJjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRhdGFTdHJlYW0gPT09IHVuZGVmaW5lZCAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xyXG4gICAgICB0aHJvdyBnZXRUYWJsZVVua25vd25EYXRhU291cmNlRXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZW5kZXJDaGFuZ2VTdWJzY3JpcHRpb24gPSBkYXRhU3RyZWFtIS5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xyXG4gICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhIHx8IFtdO1xyXG4gICAgICAgIHRoaXMucmVuZGVyUm93cygpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBhbnkgZXhpc3RpbmcgY29udGVudCBpbiB0aGUgaGVhZGVyIHJvdyBvdXRsZXQgYW5kIGNyZWF0ZXMgYSBuZXcgZW1iZWRkZWQgdmlld1xyXG4gICAqIGluIHRoZSBvdXRsZXQgdXNpbmcgdGhlIGhlYWRlciByb3cgZGVmaW5pdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIF9mb3JjZVJlbmRlckhlYWRlclJvd3MoKSB7XHJcbiAgICAvLyBDbGVhciB0aGUgaGVhZGVyIHJvdyBvdXRsZXQgaWYgYW55IGNvbnRlbnQgZXhpc3RzLlxyXG4gICAgaWYgKHRoaXMuX2hlYWRlclJvd091dGxldC52aWV3Q29udGFpbmVyLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5faGVhZGVyUm93T3V0bGV0LnZpZXdDb250YWluZXIuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9oZWFkZXJSb3dEZWZzLmZvckVhY2goKGRlZiwgaSkgPT4gdGhpcy5fcmVuZGVyUm93KHRoaXMuX2hlYWRlclJvd091dGxldCwgZGVmLCBpKSk7XHJcbiAgICB0aGlzLnVwZGF0ZVN0aWNreUhlYWRlclJvd1N0eWxlcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIGFueSBleGlzdGluZyBjb250ZW50IGluIHRoZSBmb290ZXIgcm93IG91dGxldCBhbmQgY3JlYXRlcyBhIG5ldyBlbWJlZGRlZCB2aWV3XHJcbiAgICogaW4gdGhlIG91dGxldCB1c2luZyB0aGUgZm9vdGVyIHJvdyBkZWZpbml0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2ZvcmNlUmVuZGVyRm9vdGVyUm93cygpIHtcclxuICAgIC8vIENsZWFyIHRoZSBmb290ZXIgcm93IG91dGxldCBpZiBhbnkgY29udGVudCBleGlzdHMuXHJcbiAgICBpZiAodGhpcy5fZm9vdGVyUm93T3V0bGV0LnZpZXdDb250YWluZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLl9mb290ZXJSb3dPdXRsZXQudmlld0NvbnRhaW5lci5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2Zvb3RlclJvd0RlZnMuZm9yRWFjaCgoZGVmLCBpKSA9PiB0aGlzLl9yZW5kZXJSb3codGhpcy5fZm9vdGVyUm93T3V0bGV0LCBkZWYsIGkpKTtcclxuICAgIHRoaXMudXBkYXRlU3RpY2t5Rm9vdGVyUm93U3R5bGVzKCk7XHJcbiAgfVxyXG5cclxuICAvKiogQWRkcyB0aGUgc3RpY2t5IGNvbHVtbiBzdHlsZXMgZm9yIHRoZSByb3dzIGFjY29yZGluZyB0byB0aGUgY29sdW1ucycgc3RpY2sgc3RhdGVzLiAqL1xyXG4gIHByaXZhdGUgX2FkZFN0aWNreUNvbHVtblN0eWxlcyhyb3dzOiBIVE1MRWxlbWVudFtdLCByb3dEZWY6IEJhc2VSb3dEZWYpIHtcclxuICAgIGNvbnN0IGNvbHVtbkRlZnMgPSBBcnJheS5mcm9tKHJvd0RlZi5jb2x1bW5zIHx8IFtdKS5tYXAoY29sdW1uTmFtZSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbHVtbkRlZiA9IHRoaXMuX2NvbHVtbkRlZnNCeU5hbWUuZ2V0KGNvbHVtbk5hbWUpO1xyXG4gICAgICBpZiAoIWNvbHVtbkRlZiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xyXG4gICAgICAgIHRocm93IGdldFRhYmxlVW5rbm93bkNvbHVtbkVycm9yKGNvbHVtbk5hbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb2x1bW5EZWYhO1xyXG4gICAgfSk7XHJcbiAgICBjb25zdCBzdGlja3lTdGFydFN0YXRlcyA9IGNvbHVtbkRlZnMubWFwKGNvbHVtbkRlZiA9PiBjb2x1bW5EZWYuc3RpY2t5KTtcclxuICAgIGNvbnN0IHN0aWNreUVuZFN0YXRlcyA9IGNvbHVtbkRlZnMubWFwKGNvbHVtbkRlZiA9PiBjb2x1bW5EZWYuc3RpY2t5RW5kKTtcclxuICAgIHRoaXMuX3N0aWNreVN0eWxlci51cGRhdGVTdGlja3lDb2x1bW5zKFxyXG4gICAgICAgIHJvd3MsIHN0aWNreVN0YXJ0U3RhdGVzLCBzdGlja3lFbmRTdGF0ZXMsXHJcbiAgICAgICAgIXRoaXMuX2ZpeGVkTGF5b3V0IHx8IHRoaXMuX2ZvcmNlUmVjYWxjdWxhdGVDZWxsV2lkdGhzKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBsaXN0IG9mIHJvd3MgdGhhdCBoYXZlIGJlZW4gcmVuZGVyZWQgaW4gdGhlIHJvdyBvdXRsZXQuICovXHJcbiAgX2dldFJlbmRlcmVkUm93cyhyb3dPdXRsZXQ6IFJvd091dGxldCk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgY29uc3QgcmVuZGVyZWRSb3dzOiBIVE1MRWxlbWVudFtdID0gW107XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByb3dPdXRsZXQudmlld0NvbnRhaW5lci5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCB2aWV3UmVmID0gKHJvd091dGxldC52aWV3Q29udGFpbmVyLmdldChpKSEgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pO1xyXG4gICAgICByZW5kZXJlZFJvd3MucHVzaCh2aWV3UmVmLnJvb3ROb2Rlc1swXSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlbmRlcmVkUm93cztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbWF0Y2hpbmcgcm93IGRlZmluaXRpb25zIHRoYXQgc2hvdWxkIGJlIHVzZWQgZm9yIHRoaXMgcm93IGRhdGEuIElmIHRoZXJlIGlzIG9ubHlcclxuICAgKiBvbmUgcm93IGRlZmluaXRpb24sIGl0IGlzIHJldHVybmVkLiBPdGhlcndpc2UsIGZpbmQgdGhlIHJvdyBkZWZpbml0aW9ucyB0aGF0IGhhcyBhIHdoZW5cclxuICAgKiBwcmVkaWNhdGUgdGhhdCByZXR1cm5zIHRydWUgd2l0aCB0aGUgZGF0YS4gSWYgbm9uZSByZXR1cm4gdHJ1ZSwgcmV0dXJuIHRoZSBkZWZhdWx0IHJvd1xyXG4gICAqIGRlZmluaXRpb24uXHJcbiAgICovXHJcbiAgX2dldFJvd0RlZnMoZGF0YTogVCwgZGF0YUluZGV4OiBudW1iZXIpOiBDZGtSb3dEZWY8VD5bXSB7XHJcbiAgICBpZiAodGhpcy5fcm93RGVmcy5sZW5ndGggPT0gMSkge1xyXG4gICAgICByZXR1cm4gW3RoaXMuX3Jvd0RlZnNbMF1dO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCByb3dEZWZzOiBDZGtSb3dEZWY8VD5bXSA9IFtdO1xyXG4gICAgaWYgKHRoaXMubXVsdGlUZW1wbGF0ZURhdGFSb3dzKSB7XHJcbiAgICAgIHJvd0RlZnMgPSB0aGlzLl9yb3dEZWZzLmZpbHRlcihkZWYgPT4gIWRlZi53aGVuIHx8IGRlZi53aGVuKGRhdGFJbmRleCwgZGF0YSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHJvd0RlZiA9XHJcbiAgICAgICAgICB0aGlzLl9yb3dEZWZzLmZpbmQoZGVmID0+IGRlZi53aGVuICYmIGRlZi53aGVuKGRhdGFJbmRleCwgZGF0YSkpIHx8IHRoaXMuX2RlZmF1bHRSb3dEZWY7XHJcbiAgICAgIGlmIChyb3dEZWYpIHtcclxuICAgICAgICByb3dEZWZzLnB1c2gocm93RGVmKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcm93RGVmcy5sZW5ndGggJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgdGhyb3cgZ2V0VGFibGVNaXNzaW5nTWF0Y2hpbmdSb3dEZWZFcnJvcihkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcm93RGVmcztcclxuICB9XHJcblxyXG5cclxuICBwcml2YXRlIF9nZXRFbWJlZGRlZFZpZXdBcmdzKHJlbmRlclJvdzogUmVuZGVyUm93PFQ+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IG51bWJlcik6IF9WaWV3UmVwZWF0ZXJJdGVtSW5zZXJ0QXJnczxSb3dDb250ZXh0PFQ+PiB7XHJcbiAgICBjb25zdCByb3dEZWYgPSByZW5kZXJSb3cucm93RGVmO1xyXG4gICAgY29uc3QgY29udGV4dDogUm93Q29udGV4dDxUPiA9IHskaW1wbGljaXQ6IHJlbmRlclJvdy5kYXRhfTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHRlbXBsYXRlUmVmOiByb3dEZWYudGVtcGxhdGUsXHJcbiAgICAgIGNvbnRleHQsXHJcbiAgICAgIGluZGV4LFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgcm93IHRlbXBsYXRlIGluIHRoZSBvdXRsZXQgYW5kIGZpbGxzIGl0IHdpdGggdGhlIHNldCBvZiBjZWxsIHRlbXBsYXRlcy5cclxuICAgKiBPcHRpb25hbGx5IHRha2VzIGEgY29udGV4dCB0byBwcm92aWRlIHRvIHRoZSByb3cgYW5kIGNlbGxzLCBhcyB3ZWxsIGFzIGFuIG9wdGlvbmFsIGluZGV4XHJcbiAgICogb2Ygd2hlcmUgdG8gcGxhY2UgdGhlIG5ldyByb3cgdGVtcGxhdGUgaW4gdGhlIG91dGxldC5cclxuICAgKi9cclxuICBwcml2YXRlIF9yZW5kZXJSb3coXHJcbiAgICAgIG91dGxldDogUm93T3V0bGV0LCByb3dEZWY6IEJhc2VSb3dEZWYsIGluZGV4OiBudW1iZXIsXHJcbiAgICAgIGNvbnRleHQ6IFJvd0NvbnRleHQ8VD4gPSB7fSk6IEVtYmVkZGVkVmlld1JlZjxSb3dDb250ZXh0PFQ+PiB7XHJcbiAgICAvLyBUT0RPKGFuZHJld3NlZ3Vpbik6IGVuZm9yY2UgdGhhdCBvbmUgb3V0bGV0IHdhcyBpbnN0YW50aWF0ZWQgZnJvbSBjcmVhdGVFbWJlZGRlZFZpZXdcclxuICAgIGNvbnN0IHZpZXcgPSBvdXRsZXQudmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcocm93RGVmLnRlbXBsYXRlLCBjb250ZXh0LCBpbmRleCk7XHJcbiAgICB0aGlzLl9yZW5kZXJDZWxsVGVtcGxhdGVGb3JJdGVtKHJvd0RlZiwgY29udGV4dCk7XHJcbiAgICByZXR1cm4gdmlldztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3JlbmRlckNlbGxUZW1wbGF0ZUZvckl0ZW0ocm93RGVmOiBCYXNlUm93RGVmLCBjb250ZXh0OiBSb3dDb250ZXh0PFQ+KSB7XHJcbiAgICBmb3IgKGxldCBjZWxsVGVtcGxhdGUgb2YgdGhpcy5fZ2V0Q2VsbFRlbXBsYXRlcyhyb3dEZWYpKSB7XHJcbiAgICAgIGlmIChDZGtDZWxsT3V0bGV0Lm1vc3RSZWNlbnRDZWxsT3V0bGV0KSB7XHJcbiAgICAgICAgQ2RrQ2VsbE91dGxldC5tb3N0UmVjZW50Q2VsbE91dGxldC5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcoY2VsbFRlbXBsYXRlLCBjb250ZXh0KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgaW5kZXgtcmVsYXRlZCBjb250ZXh0IGZvciBlYWNoIHJvdyB0byByZWZsZWN0IGFueSBjaGFuZ2VzIGluIHRoZSBpbmRleCBvZiB0aGUgcm93cyxcclxuICAgKiBlLmcuIGZpcnN0L2xhc3QvZXZlbi9vZGQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfdXBkYXRlUm93SW5kZXhDb250ZXh0KCkge1xyXG4gICAgY29uc3Qgdmlld0NvbnRhaW5lciA9IHRoaXMuX3Jvd091dGxldC52aWV3Q29udGFpbmVyO1xyXG4gICAgZm9yIChsZXQgcmVuZGVySW5kZXggPSAwLCBjb3VudCA9IHZpZXdDb250YWluZXIubGVuZ3RoOyByZW5kZXJJbmRleCA8IGNvdW50OyByZW5kZXJJbmRleCsrKSB7XHJcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSB2aWV3Q29udGFpbmVyLmdldChyZW5kZXJJbmRleCkgYXMgUm93Vmlld1JlZjxUPjtcclxuICAgICAgY29uc3QgY29udGV4dCA9IHZpZXdSZWYuY29udGV4dCBhcyBSb3dDb250ZXh0PFQ+O1xyXG4gICAgICBjb250ZXh0LmNvdW50ID0gY291bnQ7XHJcbiAgICAgIGNvbnRleHQuZmlyc3QgPSByZW5kZXJJbmRleCA9PT0gMDtcclxuICAgICAgY29udGV4dC5sYXN0ID0gcmVuZGVySW5kZXggPT09IGNvdW50IC0gMTtcclxuICAgICAgY29udGV4dC5ldmVuID0gcmVuZGVySW5kZXggJSAyID09PSAwO1xyXG4gICAgICBjb250ZXh0Lm9kZCA9ICFjb250ZXh0LmV2ZW47XHJcblxyXG4gICAgICBpZiAodGhpcy5tdWx0aVRlbXBsYXRlRGF0YVJvd3MpIHtcclxuICAgICAgICBjb250ZXh0LmRhdGFJbmRleCA9IHRoaXMuX3JlbmRlclJvd3NbcmVuZGVySW5kZXhdLmRhdGFJbmRleDtcclxuICAgICAgICBjb250ZXh0LnJlbmRlckluZGV4ID0gcmVuZGVySW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29udGV4dC5pbmRleCA9IHRoaXMuX3JlbmRlclJvd3NbcmVuZGVySW5kZXhdLmRhdGFJbmRleDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIGNvbHVtbiBkZWZpbml0aW9ucyBmb3IgdGhlIHByb3ZpZGVkIHJvdyBkZWYuICovXHJcbiAgcHJpdmF0ZSBfZ2V0Q2VsbFRlbXBsYXRlcyhyb3dEZWY6IEJhc2VSb3dEZWYpOiBUZW1wbGF0ZVJlZjxhbnk+W10ge1xyXG4gICAgaWYgKCFyb3dEZWYgfHwgIXJvd0RlZi5jb2x1bW5zKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKHJvd0RlZi5jb2x1bW5zLCBjb2x1bW5JZCA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMuX2NvbHVtbkRlZnNCeU5hbWUuZ2V0KGNvbHVtbklkKTtcclxuXHJcbiAgICAgIGlmICghY29sdW1uICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XHJcbiAgICAgICAgdGhyb3cgZ2V0VGFibGVVbmtub3duQ29sdW1uRXJyb3IoY29sdW1uSWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcm93RGVmLmV4dHJhY3RDZWxsVGVtcGxhdGUoY29sdW1uISk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBBZGRzIG5hdGl2ZSB0YWJsZSBzZWN0aW9ucyAoZS5nLiB0Ym9keSkgYW5kIG1vdmVzIHRoZSByb3cgb3V0bGV0cyBpbnRvIHRoZW0uICovXHJcbiAgcHJpdmF0ZSBfYXBwbHlOYXRpdmVUYWJsZVNlY3Rpb25zKCkge1xyXG4gICAgY29uc3QgZG9jdW1lbnRGcmFnbWVudCA9IHRoaXMuX2RvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcclxuICAgIGNvbnN0IHNlY3Rpb25zID0gW1xyXG4gICAgICB7dGFnOiAndGhlYWQnLCBvdXRsZXRzOiBbdGhpcy5faGVhZGVyUm93T3V0bGV0XX0sXHJcbiAgICAgIHt0YWc6ICd0Ym9keScsIG91dGxldHM6IFt0aGlzLl9yb3dPdXRsZXQsIHRoaXMuX25vRGF0YVJvd091dGxldF19LFxyXG4gICAgICB7dGFnOiAndGZvb3QnLCBvdXRsZXRzOiBbdGhpcy5fZm9vdGVyUm93T3V0bGV0XX0sXHJcbiAgICBdO1xyXG5cclxuICAgIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xyXG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudChzZWN0aW9uLnRhZyk7XHJcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3Jvd2dyb3VwJyk7XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IG91dGxldCBvZiBzZWN0aW9uLm91dGxldHMpIHtcclxuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKG91dGxldC5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkb2N1bWVudEZyYWdtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBhIERvY3VtZW50RnJhZ21lbnQgc28gd2UgZG9uJ3QgaGl0IHRoZSBET00gb24gZWFjaCBpdGVyYXRpb24uXHJcbiAgICB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnRGcmFnbWVudCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3JjZXMgYSByZS1yZW5kZXIgb2YgdGhlIGRhdGEgcm93cy4gU2hvdWxkIGJlIGNhbGxlZCBpbiBjYXNlcyB3aGVyZSB0aGVyZSBoYXMgYmVlbiBhbiBpbnB1dFxyXG4gICAqIGNoYW5nZSB0aGF0IGFmZmVjdHMgdGhlIGV2YWx1YXRpb24gb2Ygd2hpY2ggcm93cyBzaG91bGQgYmUgcmVuZGVyZWQsIGUuZy4gdG9nZ2xpbmdcclxuICAgKiBgbXVsdGlUZW1wbGF0ZURhdGFSb3dzYCBvciBhZGRpbmcvcmVtb3Zpbmcgcm93IGRlZmluaXRpb25zLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2ZvcmNlUmVuZGVyRGF0YVJvd3MoKSB7XHJcbiAgICB0aGlzLl9kYXRhRGlmZmVyLmRpZmYoW10pO1xyXG4gICAgdGhpcy5fcm93T3V0bGV0LnZpZXdDb250YWluZXIuY2xlYXIoKTtcclxuICAgIHRoaXMucmVuZGVyUm93cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIHRoZXJlIGhhcyBiZWVuIGEgY2hhbmdlIGluIHN0aWNreSBzdGF0ZXMgc2luY2UgbGFzdCBjaGVjayBhbmQgYXBwbGllcyB0aGUgY29ycmVjdFxyXG4gICAqIHN0aWNreSBzdHlsZXMuIFNpbmNlIGNoZWNraW5nIHJlc2V0cyB0aGUgXCJkaXJ0eVwiIHN0YXRlLCB0aGlzIHNob3VsZCBvbmx5IGJlIHBlcmZvcm1lZCBvbmNlXHJcbiAgICogZHVyaW5nIGEgY2hhbmdlIGRldGVjdGlvbiBhbmQgYWZ0ZXIgdGhlIGlucHV0cyBhcmUgc2V0dGxlZCAoYWZ0ZXIgY29udGVudCBjaGVjaykuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY2hlY2tTdGlja3lTdGF0ZXMoKSB7XHJcbiAgICBjb25zdCBzdGlja3lDaGVja1JlZHVjZXIgPSAoYWNjOiBib29sZWFuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQ6IENka0hlYWRlclJvd0RlZnxDZGtGb290ZXJSb3dEZWZ8Q2RrQ29sdW1uRGVmKSA9PiB7XHJcbiAgICAgIHJldHVybiBhY2MgfHwgZC5oYXNTdGlja3lDaGFuZ2VkKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIE5vdGUgdGhhdCB0aGUgY2hlY2sgbmVlZHMgdG8gb2NjdXIgZm9yIGV2ZXJ5IGRlZmluaXRpb24gc2luY2UgaXQgbm90aWZpZXMgdGhlIGRlZmluaXRpb25cclxuICAgIC8vIHRoYXQgaXQgY2FuIHJlc2V0IGl0cyBkaXJ0eSBzdGF0ZS4gVXNpbmcgYW5vdGhlciBvcGVyYXRvciBsaWtlIGBzb21lYCBtYXkgc2hvcnQtY2lyY3VpdFxyXG4gICAgLy8gcmVtYWluaW5nIGRlZmluaXRpb25zIGFuZCBsZWF2ZSB0aGVtIGluIGFuIHVuY2hlY2tlZCBzdGF0ZS5cclxuXHJcbiAgICBpZiAodGhpcy5faGVhZGVyUm93RGVmcy5yZWR1Y2Uoc3RpY2t5Q2hlY2tSZWR1Y2VyLCBmYWxzZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVTdGlja3lIZWFkZXJSb3dTdHlsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fZm9vdGVyUm93RGVmcy5yZWR1Y2Uoc3RpY2t5Q2hlY2tSZWR1Y2VyLCBmYWxzZSkpIHtcclxuICAgICAgdGhpcy51cGRhdGVTdGlja3lGb290ZXJSb3dTdHlsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoQXJyYXkuZnJvbSh0aGlzLl9jb2x1bW5EZWZzQnlOYW1lLnZhbHVlcygpKS5yZWR1Y2Uoc3RpY2t5Q2hlY2tSZWR1Y2VyLCBmYWxzZSkpIHtcclxuICAgICAgdGhpcy5fc3RpY2t5Q29sdW1uU3R5bGVzTmVlZFJlc2V0ID0gdHJ1ZTtcclxuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIHN0aWNreSBzdHlsZXIgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHN0aWNreSByb3dzIGFuZCBjb2x1bW5zLiBMaXN0ZW5zXHJcbiAgICogZm9yIGRpcmVjdGlvbmFsaXR5IGNoYW5nZXMgYW5kIHByb3ZpZGVzIHRoZSBsYXRlc3QgZGlyZWN0aW9uIHRvIHRoZSBzdHlsZXIuIFJlLWFwcGxpZXMgY29sdW1uXHJcbiAgICogc3RpY2tpbmVzcyB3aGVuIGRpcmVjdGlvbmFsaXR5IGNoYW5nZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfc2V0dXBTdGlja3lTdHlsZXIoKSB7XHJcbiAgICBjb25zdCBkaXJlY3Rpb246IERpcmVjdGlvbiA9IHRoaXMuX2RpciA/IHRoaXMuX2Rpci52YWx1ZSA6ICdsdHInO1xyXG4gICAgdGhpcy5fc3RpY2t5U3R5bGVyID0gbmV3IFN0aWNreVN0eWxlcihcclxuICAgICAgICB0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSwgdGhpcy5zdGlja3lDc3NDbGFzcywgZGlyZWN0aW9uLCB0aGlzLl9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcixcclxuICAgICAgICB0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIsIHRoaXMubmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCxcclxuICAgICAgICB0aGlzLl9zdGlja3lQb3NpdGlvbmluZ0xpc3RlbmVyKTtcclxuICAgICh0aGlzLl9kaXIgPyB0aGlzLl9kaXIuY2hhbmdlIDogb2JzZXJ2YWJsZU9mPERpcmVjdGlvbj4oKSlcclxuICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLl9vbkRlc3Ryb3kpKVxyXG4gICAgLnN1YnNjcmliZSh2YWx1ZSA9PiB7XHJcbiAgICAgIHRoaXMuX3N0aWNreVN0eWxlci5kaXJlY3Rpb24gPSB2YWx1ZTtcclxuICAgICAgdGhpcy51cGRhdGVTdGlja3lDb2x1bW5TdHlsZXMoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIEZpbHRlcnMgZGVmaW5pdGlvbnMgdGhhdCBiZWxvbmcgdG8gdGhpcyB0YWJsZSBmcm9tIGEgUXVlcnlMaXN0LiAqL1xyXG4gIHByaXZhdGUgX2dldE93bkRlZnM8SSBleHRlbmRzIHtfdGFibGU/OiBhbnl9PihpdGVtczogUXVlcnlMaXN0PEk+KTogSVtdIHtcclxuICAgIHJldHVybiBpdGVtcy5maWx0ZXIoaXRlbSA9PiAhaXRlbS5fdGFibGUgfHwgaXRlbS5fdGFibGUgPT09IHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqIENyZWF0ZXMgb3IgcmVtb3ZlcyB0aGUgbm8gZGF0YSByb3csIGRlcGVuZGluZyBvbiB3aGV0aGVyIGFueSBkYXRhIGlzIGJlaW5nIHNob3duLiAqL1xyXG4gIHByaXZhdGUgX3VwZGF0ZU5vRGF0YVJvdygpIHtcclxuICAgIGNvbnN0IG5vRGF0YVJvdyA9IHRoaXMuX2N1c3RvbU5vRGF0YVJvdyB8fCB0aGlzLl9ub0RhdGFSb3c7XHJcblxyXG4gICAgaWYgKG5vRGF0YVJvdykge1xyXG4gICAgICBjb25zdCBzaG91bGRTaG93ID0gdGhpcy5fcm93T3V0bGV0LnZpZXdDb250YWluZXIubGVuZ3RoID09PSAwO1xyXG5cclxuICAgICAgaWYgKHNob3VsZFNob3cgIT09IHRoaXMuX2lzU2hvd2luZ05vRGF0YVJvdykge1xyXG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX25vRGF0YVJvd091dGxldC52aWV3Q29udGFpbmVyO1xyXG4gICAgICAgIHNob3VsZFNob3cgPyBjb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KG5vRGF0YVJvdy50ZW1wbGF0ZVJlZikgOiBjb250YWluZXIuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLl9pc1Nob3dpbmdOb0RhdGFSb3cgPSBzaG91bGRTaG93O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbXVsdGlUZW1wbGF0ZURhdGFSb3dzOiBCb29sZWFuSW5wdXQ7XHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2ZpeGVkTGF5b3V0OiBCb29sZWFuSW5wdXQ7XHJcbn1cclxuXHJcbi8qKiBVdGlsaXR5IGZ1bmN0aW9uIHRoYXQgZ2V0cyBhIG1lcmdlZCBsaXN0IG9mIHRoZSBlbnRyaWVzIGluIGFuIGFycmF5IGFuZCB2YWx1ZXMgb2YgYSBTZXQuICovXHJcbmZ1bmN0aW9uIG1lcmdlQXJyYXlBbmRTZXQ8VD4oYXJyYXk6IFRbXSwgc2V0OiBTZXQ8VD4pOiBUW10ge1xyXG4gIHJldHVybiBhcnJheS5jb25jYXQoQXJyYXkuZnJvbShzZXQpKTtcclxufVxyXG4iXX0=