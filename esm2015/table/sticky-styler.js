/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * List of all possible directions that can be used for sticky positioning.
 * @docs-private
 */
export const STICKY_DIRECTIONS = ['top', 'bottom', 'left', 'right'];
/**
 * Applies and removes sticky positioning styles to the `CdkTable` rows and columns cells.
 * @docs-private
 */
export class StickyStyler {
    /**
     * @param _isNativeHtmlTable Whether the sticky logic should be based on a table
     *     that uses the native `<table>` element.
     * @param _stickCellCss The CSS class that will be applied to every row/cell that has
     *     sticky positioning applied.
     * @param direction The directionality context of the table (ltr/rtl); affects column positioning
     *     by reversing left/right positions.
     * @param _isBrowser Whether the table is currently being rendered on the server or the client.
     * @param _needsPositionStickyOnElement Whether we need to specify position: sticky on cells
     *     using inline styles. If false, it is assumed that position: sticky is included in
     *     the component stylesheet for _stickCellCss.
     * @param _positionListener A listener that is notified of changes to sticky rows/columns
     *     and their dimensions.
     */
    constructor(_isNativeHtmlTable, _stickCellCss, direction, 
    /**
     * @deprecated `_coalescedStyleScheduler` parameter to become required.
     * @breaking-change 11.0.0
     */
    _coalescedStyleScheduler, _isBrowser = true, _needsPositionStickyOnElement = true, _positionListener) {
        this._isNativeHtmlTable = _isNativeHtmlTable;
        this._stickCellCss = _stickCellCss;
        this.direction = direction;
        this._coalescedStyleScheduler = _coalescedStyleScheduler;
        this._isBrowser = _isBrowser;
        this._needsPositionStickyOnElement = _needsPositionStickyOnElement;
        this._positionListener = _positionListener;
        this._cachedCellWidths = [];
        this._borderCellCss = {
            'top': `${_stickCellCss}-border-elem-top`,
            'bottom': `${_stickCellCss}-border-elem-bottom`,
            'left': `${_stickCellCss}-border-elem-left`,
            'right': `${_stickCellCss}-border-elem-right`,
        };
    }
    /**
     * Clears the sticky positioning styles from the row and its cells by resetting the `position`
     * style, setting the zIndex to 0, and unsetting each provided sticky direction.
     * @param rows The list of rows that should be cleared from sticking in the provided directions
     * @param stickyDirections The directions that should no longer be set as sticky on the rows.
     */
    clearStickyPositioning(rows, stickyDirections) {
        const elementsToClear = [];
        for (const row of rows) {
            // If the row isn't an element (e.g. if it's an `ng-container`),
            // it won't have inline styles or `children` so we skip it.
            if (row.nodeType !== row.ELEMENT_NODE) {
                continue;
            }
            elementsToClear.push(row);
            for (let i = 0; i < row.children.length; i++) {
                elementsToClear.push(row.children[i]);
            }
        }
        // Coalesce with sticky row/column updates (and potentially other changes like column resize).
        this._scheduleStyleChanges(() => {
            for (const element of elementsToClear) {
                this._removeStickyStyle(element, stickyDirections);
            }
        });
    }
    /**
     * Applies sticky left and right positions to the cells of each row according to the sticky
     * states of the rendered column definitions.
     * @param rows The rows that should have its set of cells stuck according to the sticky states.
     * @param stickyStartStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the start of the row.
     * @param stickyEndStates A list of boolean states where each state represents whether the cell
     *     in this index position should be stuck to the end of the row.
     * @param recalculateCellWidths Whether the sticky styler should recalculate the width of each
     *     column cell. If `false` cached widths will be used instead.
     */
    updateStickyColumns(rows, stickyStartStates, stickyEndStates, recalculateCellWidths = true) {
        if (!rows.length || !this._isBrowser || !(stickyStartStates.some(state => state) ||
            stickyEndStates.some(state => state))) {
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({ sizes: [] });
                this._positionListener.stickyEndColumnsUpdated({ sizes: [] });
            }
            return;
        }
        const firstRow = rows[0];
        const numCells = firstRow.children.length;
        const cellWidths = this._getCellWidths(firstRow, recalculateCellWidths);
        const startPositions = this._getStickyStartColumnPositions(cellWidths, stickyStartStates);
        const endPositions = this._getStickyEndColumnPositions(cellWidths, stickyEndStates);
        const lastStickyStart = stickyStartStates.lastIndexOf(true);
        const firstStickyEnd = stickyEndStates.indexOf(true);
        // Coalesce with sticky row updates (and potentially other changes like column resize).
        this._scheduleStyleChanges(() => {
            const isRtl = this.direction === 'rtl';
            const start = isRtl ? 'right' : 'left';
            const end = isRtl ? 'left' : 'right';
            for (const row of rows) {
                for (let i = 0; i < numCells; i++) {
                    const cell = row.children[i];
                    if (stickyStartStates[i]) {
                        this._addStickyStyle(cell, start, startPositions[i], i === lastStickyStart);
                    }
                    if (stickyEndStates[i]) {
                        this._addStickyStyle(cell, end, endPositions[i], i === firstStickyEnd);
                    }
                }
            }
            if (this._positionListener) {
                this._positionListener.stickyColumnsUpdated({
                    sizes: lastStickyStart === -1 ?
                        [] :
                        cellWidths
                            .slice(0, lastStickyStart + 1)
                            .map((width, index) => stickyStartStates[index] ? width : null)
                });
                this._positionListener.stickyEndColumnsUpdated({
                    sizes: firstStickyEnd === -1 ?
                        [] :
                        cellWidths
                            .slice(firstStickyEnd)
                            .map((width, index) => stickyEndStates[index + firstStickyEnd] ? width : null)
                            .reverse()
                });
            }
        });
    }
    /**
     * Applies sticky positioning to the row's cells if using the native table layout, and to the
     * row itself otherwise.
     * @param rowsToStick The list of rows that should be stuck according to their corresponding
     *     sticky state and to the provided top or bottom position.
     * @param stickyStates A list of boolean states where each state represents whether the row
     *     should be stuck in the particular top or bottom position.
     * @param position The position direction in which the row should be stuck if that row should be
     *     sticky.
     *
     */
    stickRows(rowsToStick, stickyStates, position) {
        // Since we can't measure the rows on the server, we can't stick the rows properly.
        if (!this._isBrowser) {
            return;
        }
        // If positioning the rows to the bottom, reverse their order when evaluating the sticky
        // position such that the last row stuck will be "bottom: 0px" and so on. Note that the
        // sticky states need to be reversed as well.
        const rows = position === 'bottom' ? rowsToStick.slice().reverse() : rowsToStick;
        const states = position === 'bottom' ? stickyStates.slice().reverse() : stickyStates;
        // Measure row heights all at once before adding sticky styles to reduce layout thrashing.
        const stickyOffsets = [];
        const stickyCellHeights = [];
        const elementsToStick = [];
        for (let rowIndex = 0, stickyOffset = 0; rowIndex < rows.length; rowIndex++) {
            stickyOffsets[rowIndex] = stickyOffset;
            if (!states[rowIndex]) {
                continue;
            }
            const row = rows[rowIndex];
            elementsToStick[rowIndex] = this._isNativeHtmlTable ?
                Array.from(row.children) : [row];
            const height = row.getBoundingClientRect().height;
            stickyOffset += height;
            stickyCellHeights[rowIndex] = height;
        }
        const borderedRowIndex = states.lastIndexOf(true);
        // Coalesce with other sticky row updates (top/bottom), sticky columns updates
        // (and potentially other changes like column resize).
        this._scheduleStyleChanges(() => {
            var _a, _b;
            for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
                if (!states[rowIndex]) {
                    continue;
                }
                const offset = stickyOffsets[rowIndex];
                const isBorderedRowIndex = rowIndex === borderedRowIndex;
                for (const element of elementsToStick[rowIndex]) {
                    this._addStickyStyle(element, position, offset, isBorderedRowIndex);
                }
            }
            if (position === 'top') {
                (_a = this._positionListener) === null || _a === void 0 ? void 0 : _a.stickyHeaderRowsUpdated({ sizes: stickyCellHeights, elements: elementsToStick });
            }
            else {
                (_b = this._positionListener) === null || _b === void 0 ? void 0 : _b.stickyFooterRowsUpdated({ sizes: stickyCellHeights, elements: elementsToStick });
            }
        });
    }
    /**
     * When using the native table in Safari, sticky footer cells do not stick. The only way to stick
     * footer rows is to apply sticky styling to the tfoot container. This should only be done if
     * all footer rows are sticky. If not all footer rows are sticky, remove sticky positioning from
     * the tfoot element.
     */
    updateStickyFooterContainer(tableElement, stickyStates) {
        if (!this._isNativeHtmlTable) {
            return;
        }
        const tfoot = tableElement.querySelector('tfoot');
        // Coalesce with other sticky updates (and potentially other changes like column resize).
        this._scheduleStyleChanges(() => {
            if (stickyStates.some(state => !state)) {
                this._removeStickyStyle(tfoot, ['bottom']);
            }
            else {
                this._addStickyStyle(tfoot, 'bottom', 0, false);
            }
        });
    }
    /**
     * Removes the sticky style on the element by removing the sticky cell CSS class, re-evaluating
     * the zIndex, removing each of the provided sticky directions, and removing the
     * sticky position if there are no more directions.
     */
    _removeStickyStyle(element, stickyDirections) {
        for (const dir of stickyDirections) {
            element.style[dir] = '';
            element.classList.remove(this._borderCellCss[dir]);
        }
        // If the element no longer has any more sticky directions, remove sticky positioning and
        // the sticky CSS class.
        // Short-circuit checking element.style[dir] for stickyDirections as they
        // were already removed above.
        const hasDirection = STICKY_DIRECTIONS.some(dir => stickyDirections.indexOf(dir) === -1 && element.style[dir]);
        if (hasDirection) {
            element.style.zIndex = this._getCalculatedZIndex(element);
        }
        else {
            // When not hasDirection, _getCalculatedZIndex will always return ''.
            element.style.zIndex = '';
            if (this._needsPositionStickyOnElement) {
                element.style.position = '';
            }
            element.classList.remove(this._stickCellCss);
        }
    }
    /**
     * Adds the sticky styling to the element by adding the sticky style class, changing position
     * to be sticky (and -webkit-sticky), setting the appropriate zIndex, and adding a sticky
     * direction and value.
     */
    _addStickyStyle(element, dir, dirValue, isBorderElement) {
        element.classList.add(this._stickCellCss);
        if (isBorderElement) {
            element.classList.add(this._borderCellCss[dir]);
        }
        element.style[dir] = `${dirValue}px`;
        element.style.zIndex = this._getCalculatedZIndex(element);
        if (this._needsPositionStickyOnElement) {
            element.style.cssText += 'position: -webkit-sticky; position: sticky; ';
        }
    }
    /**
     * Calculate what the z-index should be for the element, depending on what directions (top,
     * bottom, left, right) have been set. It should be true that elements with a top direction
     * should have the highest index since these are elements like a table header. If any of those
     * elements are also sticky in another direction, then they should appear above other elements
     * that are only sticky top (e.g. a sticky column on a sticky header). Bottom-sticky elements
     * (e.g. footer rows) should then be next in the ordering such that they are below the header
     * but above any non-sticky elements. Finally, left/right sticky elements (e.g. sticky columns)
     * should minimally increment so that they are above non-sticky elements but below top and bottom
     * elements.
     */
    _getCalculatedZIndex(element) {
        const zIndexIncrements = {
            top: 100,
            bottom: 10,
            left: 1,
            right: 1,
        };
        let zIndex = 0;
        // Use `Iterable` instead of `Array` because TypeScript, as of 3.6.3,
        // loses the array generic type in the `for of`. But we *also* have to use `Array` because
        // typescript won't iterate over an `Iterable` unless you compile with `--downlevelIteration`
        for (const dir of STICKY_DIRECTIONS) {
            if (element.style[dir]) {
                zIndex += zIndexIncrements[dir];
            }
        }
        return zIndex ? `${zIndex}` : '';
    }
    /** Gets the widths for each cell in the provided row. */
    _getCellWidths(row, recalculateCellWidths = true) {
        if (!recalculateCellWidths && this._cachedCellWidths.length) {
            return this._cachedCellWidths;
        }
        const cellWidths = [];
        const firstRowCells = row.children;
        for (let i = 0; i < firstRowCells.length; i++) {
            let cell = firstRowCells[i];
            cellWidths.push(cell.getBoundingClientRect().width);
        }
        this._cachedCellWidths = cellWidths;
        return cellWidths;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyStartColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = 0; i < widths.length; i++) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
    /**
     * Determines the left and right positions of each sticky column cell, which will be the
     * accumulation of all sticky column cell widths to the left and right, respectively.
     * Non-sticky cells do not need to have a value set since their positions will not be applied.
     */
    _getStickyEndColumnPositions(widths, stickyStates) {
        const positions = [];
        let nextPosition = 0;
        for (let i = widths.length; i > 0; i--) {
            if (stickyStates[i]) {
                positions[i] = nextPosition;
                nextPosition += widths[i];
            }
        }
        return positions;
    }
    /**
     * Schedules styles to be applied when the style scheduler deems appropriate.
     * @breaking-change 11.0.0 This method can be removed in favor of calling
     * `CoalescedStyleScheduler.schedule` directly once the scheduler is a required parameter.
     */
    _scheduleStyleChanges(changes) {
        if (this._coalescedStyleScheduler) {
            this._coalescedStyleScheduler.schedule(changes);
        }
        else {
            changes();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5LXN0eWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvc3RpY2t5LXN0eWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFZSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBc0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUd2Rjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sWUFBWTtJQUl2Qjs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gsWUFBb0Isa0JBQTJCLEVBQzNCLGFBQXFCLEVBQ3RCLFNBQW9CO0lBQzNCOzs7T0FHRztJQUNLLHdCQUFtRCxFQUNuRCxhQUFhLElBQUksRUFDUixnQ0FBZ0MsSUFBSSxFQUNwQyxpQkFBNkM7UUFWdEQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFLbkIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtRQUNuRCxlQUFVLEdBQVYsVUFBVSxDQUFPO1FBQ1Isa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFPO1FBQ3BDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBNEI7UUEzQmxFLHNCQUFpQixHQUFhLEVBQUUsQ0FBQztRQTRCdkMsSUFBSSxDQUFDLGNBQWMsR0FBRztZQUNwQixLQUFLLEVBQUUsR0FBRyxhQUFhLGtCQUFrQjtZQUN6QyxRQUFRLEVBQUUsR0FBRyxhQUFhLHFCQUFxQjtZQUMvQyxNQUFNLEVBQUUsR0FBRyxhQUFhLG1CQUFtQjtZQUMzQyxPQUFPLEVBQUUsR0FBRyxhQUFhLG9CQUFvQjtTQUM5QyxDQUFDO0lBQ0osQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsc0JBQXNCLENBQUMsSUFBbUIsRUFBRSxnQkFBbUM7UUFDN0UsTUFBTSxlQUFlLEdB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c0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG4vKipcclxuICogRGlyZWN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHdoZW4gc2V0dGluZyBzdGlja3kgcG9zaXRpb25pbmcuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7X0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyfSBmcm9tICcuL2NvYWxlc2NlZC1zdHlsZS1zY2hlZHVsZXInO1xyXG5pbXBvcnQge1N0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXJ9IGZyb20gJy4vc3RpY2t5LXBvc2l0aW9uLWxpc3RlbmVyJztcclxuXHJcbmV4cG9ydCB0eXBlIFN0aWNreURpcmVjdGlvbiA9ICd0b3AnIHwgJ2JvdHRvbScgfCAnbGVmdCcgfCAncmlnaHQnO1xyXG5cclxuLyoqXHJcbiAqIExpc3Qgb2YgYWxsIHBvc3NpYmxlIGRpcmVjdGlvbnMgdGhhdCBjYW4gYmUgdXNlZCBmb3Igc3RpY2t5IHBvc2l0aW9uaW5nLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgU1RJQ0tZX0RJUkVDVElPTlM6IFN0aWNreURpcmVjdGlvbltdID0gWyd0b3AnLCAnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnXTtcclxuXHJcblxyXG4vKipcclxuICogQXBwbGllcyBhbmQgcmVtb3ZlcyBzdGlja3kgcG9zaXRpb25pbmcgc3R5bGVzIHRvIHRoZSBgQ2RrVGFibGVgIHJvd3MgYW5kIGNvbHVtbnMgY2VsbHMuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdGlja3lTdHlsZXIge1xyXG4gIHByaXZhdGUgX2NhY2hlZENlbGxXaWR0aHM6IG51bWJlcltdID0gW107XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfYm9yZGVyQ2VsbENzczogUmVhZG9ubHk8e1tkIGluIFN0aWNreURpcmVjdGlvbl06IHN0cmluZ30+O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gX2lzTmF0aXZlSHRtbFRhYmxlIFdoZXRoZXIgdGhlIHN0aWNreSBsb2dpYyBzaG91bGQgYmUgYmFzZWQgb24gYSB0YWJsZVxyXG4gICAqICAgICB0aGF0IHVzZXMgdGhlIG5hdGl2ZSBgPHRhYmxlPmAgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gX3N0aWNrQ2VsbENzcyBUaGUgQ1NTIGNsYXNzIHRoYXQgd2lsbCBiZSBhcHBsaWVkIHRvIGV2ZXJ5IHJvdy9jZWxsIHRoYXQgaGFzXHJcbiAgICogICAgIHN0aWNreSBwb3NpdGlvbmluZyBhcHBsaWVkLlxyXG4gICAqIEBwYXJhbSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbmFsaXR5IGNvbnRleHQgb2YgdGhlIHRhYmxlIChsdHIvcnRsKTsgYWZmZWN0cyBjb2x1bW4gcG9zaXRpb25pbmdcclxuICAgKiAgICAgYnkgcmV2ZXJzaW5nIGxlZnQvcmlnaHQgcG9zaXRpb25zLlxyXG4gICAqIEBwYXJhbSBfaXNCcm93c2VyIFdoZXRoZXIgdGhlIHRhYmxlIGlzIGN1cnJlbnRseSBiZWluZyByZW5kZXJlZCBvbiB0aGUgc2VydmVyIG9yIHRoZSBjbGllbnQuXHJcbiAgICogQHBhcmFtIF9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50IFdoZXRoZXIgd2UgbmVlZCB0byBzcGVjaWZ5IHBvc2l0aW9uOiBzdGlja3kgb24gY2VsbHNcclxuICAgKiAgICAgdXNpbmcgaW5saW5lIHN0eWxlcy4gSWYgZmFsc2UsIGl0IGlzIGFzc3VtZWQgdGhhdCBwb3NpdGlvbjogc3RpY2t5IGlzIGluY2x1ZGVkIGluXHJcbiAgICogICAgIHRoZSBjb21wb25lbnQgc3R5bGVzaGVldCBmb3IgX3N0aWNrQ2VsbENzcy5cclxuICAgKiBAcGFyYW0gX3Bvc2l0aW9uTGlzdGVuZXIgQSBsaXN0ZW5lciB0aGF0IGlzIG5vdGlmaWVkIG9mIGNoYW5nZXMgdG8gc3RpY2t5IHJvd3MvY29sdW1uc1xyXG4gICAqICAgICBhbmQgdGhlaXIgZGltZW5zaW9ucy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9pc05hdGl2ZUh0bWxUYWJsZTogYm9vbGVhbixcclxuICAgICAgICAgICAgICBwcml2YXRlIF9zdGlja0NlbGxDc3M6IHN0cmluZyxcclxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aW9uOiBEaXJlY3Rpb24sXHJcbiAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICogQGRlcHJlY2F0ZWQgYF9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcmAgcGFyYW1ldGVyIHRvIGJlY29tZSByZXF1aXJlZC5cclxuICAgICAgICAgICAgICAgKiBAYnJlYWtpbmctY2hhbmdlIDExLjAuMFxyXG4gICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyPzogX0NvYWxlc2NlZFN0eWxlU2NoZWR1bGVyLFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2lzQnJvd3NlciA9IHRydWUsXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBfbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCA9IHRydWUsXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZSByZWFkb25seSBfcG9zaXRpb25MaXN0ZW5lcj86IFN0aWNreVBvc2l0aW9uaW5nTGlzdGVuZXIpIHtcclxuICAgIHRoaXMuX2JvcmRlckNlbGxDc3MgPSB7XHJcbiAgICAgICd0b3AnOiBgJHtfc3RpY2tDZWxsQ3NzfS1ib3JkZXItZWxlbS10b3BgLFxyXG4gICAgICAnYm90dG9tJzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tYm90dG9tYCxcclxuICAgICAgJ2xlZnQnOiBgJHtfc3RpY2tDZWxsQ3NzfS1ib3JkZXItZWxlbS1sZWZ0YCxcclxuICAgICAgJ3JpZ2h0JzogYCR7X3N0aWNrQ2VsbENzc30tYm9yZGVyLWVsZW0tcmlnaHRgLFxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyB0aGUgc3RpY2t5IHBvc2l0aW9uaW5nIHN0eWxlcyBmcm9tIHRoZSByb3cgYW5kIGl0cyBjZWxscyBieSByZXNldHRpbmcgdGhlIGBwb3NpdGlvbmBcclxuICAgKiBzdHlsZSwgc2V0dGluZyB0aGUgekluZGV4IHRvIDAsIGFuZCB1bnNldHRpbmcgZWFjaCBwcm92aWRlZCBzdGlja3kgZGlyZWN0aW9uLlxyXG4gICAqIEBwYXJhbSByb3dzIFRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgY2xlYXJlZCBmcm9tIHN0aWNraW5nIGluIHRoZSBwcm92aWRlZCBkaXJlY3Rpb25zXHJcbiAgICogQHBhcmFtIHN0aWNreURpcmVjdGlvbnMgVGhlIGRpcmVjdGlvbnMgdGhhdCBzaG91bGQgbm8gbG9uZ2VyIGJlIHNldCBhcyBzdGlja3kgb24gdGhlIHJvd3MuXHJcbiAgICovXHJcbiAgY2xlYXJTdGlja3lQb3NpdGlvbmluZyhyb3dzOiBIVE1MRWxlbWVudFtdLCBzdGlja3lEaXJlY3Rpb25zOiBTdGlja3lEaXJlY3Rpb25bXSkge1xyXG4gICAgY29uc3QgZWxlbWVudHNUb0NsZWFyOiBIVE1MRWxlbWVudFtdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XHJcbiAgICAgIC8vIElmIHRoZSByb3cgaXNuJ3QgYW4gZWxlbWVudCAoZS5nLiBpZiBpdCdzIGFuIGBuZy1jb250YWluZXJgKSxcclxuICAgICAgLy8gaXQgd29uJ3QgaGF2ZSBpbmxpbmUgc3R5bGVzIG9yIGBjaGlsZHJlbmAgc28gd2Ugc2tpcCBpdC5cclxuICAgICAgaWYgKHJvdy5ub2RlVHlwZSAhPT0gcm93LkVMRU1FTlRfTk9ERSkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlbGVtZW50c1RvQ2xlYXIucHVzaChyb3cpO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdy5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGVsZW1lbnRzVG9DbGVhci5wdXNoKHJvdy5jaGlsZHJlbltpXSBhcyBIVE1MRWxlbWVudCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBDb2FsZXNjZSB3aXRoIHN0aWNreSByb3cvY29sdW1uIHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXHJcbiAgICB0aGlzLl9zY2hlZHVsZVN0eWxlQ2hhbmdlcygoKSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50c1RvQ2xlYXIpIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVTdGlja3lTdHlsZShlbGVtZW50LCBzdGlja3lEaXJlY3Rpb25zKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBsaWVzIHN0aWNreSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgdG8gdGhlIGNlbGxzIG9mIGVhY2ggcm93IGFjY29yZGluZyB0byB0aGUgc3RpY2t5XHJcbiAgICogc3RhdGVzIG9mIHRoZSByZW5kZXJlZCBjb2x1bW4gZGVmaW5pdGlvbnMuXHJcbiAgICogQHBhcmFtIHJvd3MgVGhlIHJvd3MgdGhhdCBzaG91bGQgaGF2ZSBpdHMgc2V0IG9mIGNlbGxzIHN0dWNrIGFjY29yZGluZyB0byB0aGUgc3RpY2t5IHN0YXRlcy5cclxuICAgKiBAcGFyYW0gc3RpY2t5U3RhcnRTdGF0ZXMgQSBsaXN0IG9mIGJvb2xlYW4gc3RhdGVzIHdoZXJlIGVhY2ggc3RhdGUgcmVwcmVzZW50cyB3aGV0aGVyIHRoZSBjZWxsXHJcbiAgICogICAgIGluIHRoaXMgaW5kZXggcG9zaXRpb24gc2hvdWxkIGJlIHN0dWNrIHRvIHRoZSBzdGFydCBvZiB0aGUgcm93LlxyXG4gICAqIEBwYXJhbSBzdGlja3lFbmRTdGF0ZXMgQSBsaXN0IG9mIGJvb2xlYW4gc3RhdGVzIHdoZXJlIGVhY2ggc3RhdGUgcmVwcmVzZW50cyB3aGV0aGVyIHRoZSBjZWxsXHJcbiAgICogICAgIGluIHRoaXMgaW5kZXggcG9zaXRpb24gc2hvdWxkIGJlIHN0dWNrIHRvIHRoZSBlbmQgb2YgdGhlIHJvdy5cclxuICAgKiBAcGFyYW0gcmVjYWxjdWxhdGVDZWxsV2lkdGhzIFdoZXRoZXIgdGhlIHN0aWNreSBzdHlsZXIgc2hvdWxkIHJlY2FsY3VsYXRlIHRoZSB3aWR0aCBvZiBlYWNoXHJcbiAgICogICAgIGNvbHVtbiBjZWxsLiBJZiBgZmFsc2VgIGNhY2hlZCB3aWR0aHMgd2lsbCBiZSB1c2VkIGluc3RlYWQuXHJcbiAgICovXHJcbiAgdXBkYXRlU3RpY2t5Q29sdW1ucyhcclxuICAgICAgcm93czogSFRNTEVsZW1lbnRbXSwgc3RpY2t5U3RhcnRTdGF0ZXM6IGJvb2xlYW5bXSwgc3RpY2t5RW5kU3RhdGVzOiBib29sZWFuW10sXHJcbiAgICAgIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWUpIHtcclxuICAgIGlmICghcm93cy5sZW5ndGggfHwgIXRoaXMuX2lzQnJvd3NlciB8fCAhKHN0aWNreVN0YXJ0U3RhdGVzLnNvbWUoc3RhdGUgPT4gc3RhdGUpIHx8XHJcbiAgICAgICAgc3RpY2t5RW5kU3RhdGVzLnNvbWUoc3RhdGUgPT4gc3RhdGUpKSkge1xyXG4gICAgICBpZiAodGhpcy5fcG9zaXRpb25MaXN0ZW5lcikge1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIuc3RpY2t5Q29sdW1uc1VwZGF0ZWQoe3NpemVzOiBbXX0pO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIuc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe3NpemVzOiBbXX0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlyc3RSb3cgPSByb3dzWzBdO1xyXG4gICAgY29uc3QgbnVtQ2VsbHMgPSBmaXJzdFJvdy5jaGlsZHJlbi5sZW5ndGg7XHJcbiAgICBjb25zdCBjZWxsV2lkdGhzOiBudW1iZXJbXSA9IHRoaXMuX2dldENlbGxXaWR0aHMoZmlyc3RSb3csIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyk7XHJcblxyXG4gICAgY29uc3Qgc3RhcnRQb3NpdGlvbnMgPSB0aGlzLl9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyhjZWxsV2lkdGhzLCBzdGlja3lTdGFydFN0YXRlcyk7XHJcbiAgICBjb25zdCBlbmRQb3NpdGlvbnMgPSB0aGlzLl9nZXRTdGlja3lFbmRDb2x1bW5Qb3NpdGlvbnMoY2VsbFdpZHRocywgc3RpY2t5RW5kU3RhdGVzKTtcclxuXHJcbiAgICBjb25zdCBsYXN0U3RpY2t5U3RhcnQgPSBzdGlja3lTdGFydFN0YXRlcy5sYXN0SW5kZXhPZih0cnVlKTtcclxuICAgIGNvbnN0IGZpcnN0U3RpY2t5RW5kID0gc3RpY2t5RW5kU3RhdGVzLmluZGV4T2YodHJ1ZSk7XHJcblxyXG4gICAgLy8gQ29hbGVzY2Ugd2l0aCBzdGlja3kgcm93IHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXHJcbiAgICB0aGlzLl9zY2hlZHVsZVN0eWxlQ2hhbmdlcygoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGlzUnRsID0gdGhpcy5kaXJlY3Rpb24gPT09ICdydGwnO1xyXG4gICAgICBjb25zdCBzdGFydCA9IGlzUnRsID8gJ3JpZ2h0JyA6ICdsZWZ0JztcclxuICAgICAgY29uc3QgZW5kID0gaXNSdGwgPyAnbGVmdCcgOiAncmlnaHQnO1xyXG5cclxuICAgICAgZm9yIChjb25zdCByb3cgb2Ygcm93cykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ2VsbHM7IGkrKykge1xyXG4gICAgICAgICAgY29uc3QgY2VsbCA9IHJvdy5jaGlsZHJlbltpXSBhcyBIVE1MRWxlbWVudDtcclxuICAgICAgICAgIGlmIChzdGlja3lTdGFydFN0YXRlc1tpXSkge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShjZWxsLCBzdGFydCwgc3RhcnRQb3NpdGlvbnNbaV0sIGkgPT09IGxhc3RTdGlja3lTdGFydCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKHN0aWNreUVuZFN0YXRlc1tpXSkge1xyXG4gICAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShjZWxsLCBlbmQsIGVuZFBvc2l0aW9uc1tpXSwgaSA9PT0gZmlyc3RTdGlja3lFbmQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIpIHtcclxuICAgICAgICB0aGlzLl9wb3NpdGlvbkxpc3RlbmVyLnN0aWNreUNvbHVtbnNVcGRhdGVkKHtcclxuICAgICAgICAgIHNpemVzOiBsYXN0U3RpY2t5U3RhcnQgPT09IC0xID9cclxuICAgICAgICAgICAgW10gOlxyXG4gICAgICAgICAgICBjZWxsV2lkdGhzXHJcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwgbGFzdFN0aWNreVN0YXJ0ICsgMSlcclxuICAgICAgICAgICAgICAgIC5tYXAoKHdpZHRoLCBpbmRleCkgPT4gc3RpY2t5U3RhcnRTdGF0ZXNbaW5kZXhdID8gd2lkdGggOiBudWxsKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXIuc3RpY2t5RW5kQ29sdW1uc1VwZGF0ZWQoe1xyXG4gICAgICAgICAgc2l6ZXM6IGZpcnN0U3RpY2t5RW5kID09PSAtMSA/XHJcbiAgICAgICAgICAgIFtdIDpcclxuICAgICAgICAgICAgY2VsbFdpZHRoc1xyXG4gICAgICAgICAgICAgICAgLnNsaWNlKGZpcnN0U3RpY2t5RW5kKVxyXG4gICAgICAgICAgICAgICAgLm1hcCgod2lkdGgsIGluZGV4KSA9PiBzdGlja3lFbmRTdGF0ZXNbaW5kZXggKyBmaXJzdFN0aWNreUVuZF0gPyB3aWR0aCA6IG51bGwpXHJcbiAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbGllcyBzdGlja3kgcG9zaXRpb25pbmcgdG8gdGhlIHJvdydzIGNlbGxzIGlmIHVzaW5nIHRoZSBuYXRpdmUgdGFibGUgbGF5b3V0LCBhbmQgdG8gdGhlXHJcbiAgICogcm93IGl0c2VsZiBvdGhlcndpc2UuXHJcbiAgICogQHBhcmFtIHJvd3NUb1N0aWNrIFRoZSBsaXN0IG9mIHJvd3MgdGhhdCBzaG91bGQgYmUgc3R1Y2sgYWNjb3JkaW5nIHRvIHRoZWlyIGNvcnJlc3BvbmRpbmdcclxuICAgKiAgICAgc3RpY2t5IHN0YXRlIGFuZCB0byB0aGUgcHJvdmlkZWQgdG9wIG9yIGJvdHRvbSBwb3NpdGlvbi5cclxuICAgKiBAcGFyYW0gc3RpY2t5U3RhdGVzIEEgbGlzdCBvZiBib29sZWFuIHN0YXRlcyB3aGVyZSBlYWNoIHN0YXRlIHJlcHJlc2VudHMgd2hldGhlciB0aGUgcm93XHJcbiAgICogICAgIHNob3VsZCBiZSBzdHVjayBpbiB0aGUgcGFydGljdWxhciB0b3Agb3IgYm90dG9tIHBvc2l0aW9uLlxyXG4gICAqIEBwYXJhbSBwb3NpdGlvbiBUaGUgcG9zaXRpb24gZGlyZWN0aW9uIGluIHdoaWNoIHRoZSByb3cgc2hvdWxkIGJlIHN0dWNrIGlmIHRoYXQgcm93IHNob3VsZCBiZVxyXG4gICAqICAgICBzdGlja3kuXHJcbiAgICpcclxuICAgKi9cclxuICBzdGlja1Jvd3Mocm93c1RvU3RpY2s6IEhUTUxFbGVtZW50W10sIHN0aWNreVN0YXRlczogYm9vbGVhbltdLCBwb3NpdGlvbjogJ3RvcCcgfCAnYm90dG9tJykge1xyXG4gICAgLy8gU2luY2Ugd2UgY2FuJ3QgbWVhc3VyZSB0aGUgcm93cyBvbiB0aGUgc2VydmVyLCB3ZSBjYW4ndCBzdGljayB0aGUgcm93cyBwcm9wZXJseS5cclxuICAgIGlmICghdGhpcy5faXNCcm93c2VyKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBwb3NpdGlvbmluZyB0aGUgcm93cyB0byB0aGUgYm90dG9tLCByZXZlcnNlIHRoZWlyIG9yZGVyIHdoZW4gZXZhbHVhdGluZyB0aGUgc3RpY2t5XHJcbiAgICAvLyBwb3NpdGlvbiBzdWNoIHRoYXQgdGhlIGxhc3Qgcm93IHN0dWNrIHdpbGwgYmUgXCJib3R0b206IDBweFwiIGFuZCBzbyBvbi4gTm90ZSB0aGF0IHRoZVxyXG4gICAgLy8gc3RpY2t5IHN0YXRlcyBuZWVkIHRvIGJlIHJldmVyc2VkIGFzIHdlbGwuXHJcbiAgICBjb25zdCByb3dzID0gcG9zaXRpb24gPT09ICdib3R0b20nID8gcm93c1RvU3RpY2suc2xpY2UoKS5yZXZlcnNlKCkgOiByb3dzVG9TdGljaztcclxuICAgIGNvbnN0IHN0YXRlcyA9IHBvc2l0aW9uID09PSAnYm90dG9tJyA/IHN0aWNreVN0YXRlcy5zbGljZSgpLnJldmVyc2UoKSA6IHN0aWNreVN0YXRlcztcclxuXHJcbiAgICAvLyBNZWFzdXJlIHJvdyBoZWlnaHRzIGFsbCBhdCBvbmNlIGJlZm9yZSBhZGRpbmcgc3RpY2t5IHN0eWxlcyB0byByZWR1Y2UgbGF5b3V0IHRocmFzaGluZy5cclxuICAgIGNvbnN0IHN0aWNreU9mZnNldHM6IG51bWJlcltdID0gW107XHJcbiAgICBjb25zdCBzdGlja3lDZWxsSGVpZ2h0czogKG51bWJlcnx1bmRlZmluZWQpW10gPSBbXTtcclxuICAgIGNvbnN0IGVsZW1lbnRzVG9TdGljazogSFRNTEVsZW1lbnRbXVtdID0gW107XHJcbiAgICBmb3IgKGxldCByb3dJbmRleCA9IDAsIHN0aWNreU9mZnNldCA9IDA7IHJvd0luZGV4IDwgcm93cy5sZW5ndGg7IHJvd0luZGV4KyspIHtcclxuICAgICAgc3RpY2t5T2Zmc2V0c1tyb3dJbmRleF0gPSBzdGlja3lPZmZzZXQ7XHJcblxyXG4gICAgICBpZiAoIXN0YXRlc1tyb3dJbmRleF0pIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcm93ID0gcm93c1tyb3dJbmRleF07XHJcbiAgICAgIGVsZW1lbnRzVG9TdGlja1tyb3dJbmRleF0gPSB0aGlzLl9pc05hdGl2ZUh0bWxUYWJsZSA/XHJcbiAgICAgICAgICBBcnJheS5mcm9tKHJvdy5jaGlsZHJlbikgYXMgSFRNTEVsZW1lbnRbXSA6IFtyb3ddO1xyXG5cclxuICAgICAgY29uc3QgaGVpZ2h0ID0gcm93LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgc3RpY2t5T2Zmc2V0ICs9IGhlaWdodDtcclxuICAgICAgc3RpY2t5Q2VsbEhlaWdodHNbcm93SW5kZXhdID0gaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJvcmRlcmVkUm93SW5kZXggPSBzdGF0ZXMubGFzdEluZGV4T2YodHJ1ZSk7XHJcblxyXG4gICAgLy8gQ29hbGVzY2Ugd2l0aCBvdGhlciBzdGlja3kgcm93IHVwZGF0ZXMgKHRvcC9ib3R0b20pLCBzdGlja3kgY29sdW1ucyB1cGRhdGVzXHJcbiAgICAvLyAoYW5kIHBvdGVudGlhbGx5IG90aGVyIGNoYW5nZXMgbGlrZSBjb2x1bW4gcmVzaXplKS5cclxuICAgIHRoaXMuX3NjaGVkdWxlU3R5bGVDaGFuZ2VzKCgpID0+IHtcclxuICAgICAgZm9yIChsZXQgcm93SW5kZXggPSAwOyByb3dJbmRleCA8IHJvd3MubGVuZ3RoOyByb3dJbmRleCsrKSB7XHJcbiAgICAgICAgaWYgKCFzdGF0ZXNbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHN0aWNreU9mZnNldHNbcm93SW5kZXhdO1xyXG4gICAgICAgIGNvbnN0IGlzQm9yZGVyZWRSb3dJbmRleCA9IHJvd0luZGV4ID09PSBib3JkZXJlZFJvd0luZGV4O1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBlbGVtZW50c1RvU3RpY2tbcm93SW5kZXhdKSB7XHJcbiAgICAgICAgICB0aGlzLl9hZGRTdGlja3lTdHlsZShlbGVtZW50LCBwb3NpdGlvbiwgb2Zmc2V0LCBpc0JvcmRlcmVkUm93SW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHBvc2l0aW9uID09PSAndG9wJykge1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uTGlzdGVuZXI/LnN0aWNreUhlYWRlclJvd3NVcGRhdGVkKFxyXG4gICAgICAgICAgICB7c2l6ZXM6IHN0aWNreUNlbGxIZWlnaHRzLCBlbGVtZW50czogZWxlbWVudHNUb1N0aWNrfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb25MaXN0ZW5lcj8uc3RpY2t5Rm9vdGVyUm93c1VwZGF0ZWQoXHJcbiAgICAgICAgICAgIHtzaXplczogc3RpY2t5Q2VsbEhlaWdodHMsIGVsZW1lbnRzOiBlbGVtZW50c1RvU3RpY2t9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIHVzaW5nIHRoZSBuYXRpdmUgdGFibGUgaW4gU2FmYXJpLCBzdGlja3kgZm9vdGVyIGNlbGxzIGRvIG5vdCBzdGljay4gVGhlIG9ubHkgd2F5IHRvIHN0aWNrXHJcbiAgICogZm9vdGVyIHJvd3MgaXMgdG8gYXBwbHkgc3RpY2t5IHN0eWxpbmcgdG8gdGhlIHRmb290IGNvbnRhaW5lci4gVGhpcyBzaG91bGQgb25seSBiZSBkb25lIGlmXHJcbiAgICogYWxsIGZvb3RlciByb3dzIGFyZSBzdGlja3kuIElmIG5vdCBhbGwgZm9vdGVyIHJvd3MgYXJlIHN0aWNreSwgcmVtb3ZlIHN0aWNreSBwb3NpdGlvbmluZyBmcm9tXHJcbiAgICogdGhlIHRmb290IGVsZW1lbnQuXHJcbiAgICovXHJcbiAgdXBkYXRlU3RpY2t5Rm9vdGVyQ29udGFpbmVyKHRhYmxlRWxlbWVudDogRWxlbWVudCwgc3RpY2t5U3RhdGVzOiBib29sZWFuW10pIHtcclxuICAgIGlmICghdGhpcy5faXNOYXRpdmVIdG1sVGFibGUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRmb290ID0gdGFibGVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3Rmb290JykhO1xyXG5cclxuICAgIC8vIENvYWxlc2NlIHdpdGggb3RoZXIgc3RpY2t5IHVwZGF0ZXMgKGFuZCBwb3RlbnRpYWxseSBvdGhlciBjaGFuZ2VzIGxpa2UgY29sdW1uIHJlc2l6ZSkuXHJcbiAgICB0aGlzLl9zY2hlZHVsZVN0eWxlQ2hhbmdlcygoKSA9PiB7XHJcbiAgICAgIGlmIChzdGlja3lTdGF0ZXMuc29tZShzdGF0ZSA9PiAhc3RhdGUpKSB7XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3RpY2t5U3R5bGUodGZvb3QsIFsnYm90dG9tJ10pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX2FkZFN0aWNreVN0eWxlKHRmb290LCAnYm90dG9tJywgMCwgZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgdGhlIHN0aWNreSBzdHlsZSBvbiB0aGUgZWxlbWVudCBieSByZW1vdmluZyB0aGUgc3RpY2t5IGNlbGwgQ1NTIGNsYXNzLCByZS1ldmFsdWF0aW5nXHJcbiAgICogdGhlIHpJbmRleCwgcmVtb3ZpbmcgZWFjaCBvZiB0aGUgcHJvdmlkZWQgc3RpY2t5IGRpcmVjdGlvbnMsIGFuZCByZW1vdmluZyB0aGVcclxuICAgKiBzdGlja3kgcG9zaXRpb24gaWYgdGhlcmUgYXJlIG5vIG1vcmUgZGlyZWN0aW9ucy5cclxuICAgKi9cclxuICBfcmVtb3ZlU3RpY2t5U3R5bGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIHN0aWNreURpcmVjdGlvbnM6IFN0aWNreURpcmVjdGlvbltdKSB7XHJcbiAgICBmb3IgKGNvbnN0IGRpciBvZiBzdGlja3lEaXJlY3Rpb25zKSB7XHJcbiAgICAgIGVsZW1lbnQuc3R5bGVbZGlyXSA9ICcnO1xyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fYm9yZGVyQ2VsbENzc1tkaXJdKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBubyBsb25nZXIgaGFzIGFueSBtb3JlIHN0aWNreSBkaXJlY3Rpb25zLCByZW1vdmUgc3RpY2t5IHBvc2l0aW9uaW5nIGFuZFxyXG4gICAgLy8gdGhlIHN0aWNreSBDU1MgY2xhc3MuXHJcbiAgICAvLyBTaG9ydC1jaXJjdWl0IGNoZWNraW5nIGVsZW1lbnQuc3R5bGVbZGlyXSBmb3Igc3RpY2t5RGlyZWN0aW9ucyBhcyB0aGV5XHJcbiAgICAvLyB3ZXJlIGFscmVhZHkgcmVtb3ZlZCBhYm92ZS5cclxuICAgIGNvbnN0IGhhc0RpcmVjdGlvbiA9IFNUSUNLWV9ESVJFQ1RJT05TLnNvbWUoZGlyID0+XHJcbiAgICAgICAgc3RpY2t5RGlyZWN0aW9ucy5pbmRleE9mKGRpcikgPT09IC0xICYmIGVsZW1lbnQuc3R5bGVbZGlyXSk7XHJcbiAgICBpZiAoaGFzRGlyZWN0aW9uKSB7XHJcbiAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5fZ2V0Q2FsY3VsYXRlZFpJbmRleChlbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIFdoZW4gbm90IGhhc0RpcmVjdGlvbiwgX2dldENhbGN1bGF0ZWRaSW5kZXggd2lsbCBhbHdheXMgcmV0dXJuICcnLlxyXG4gICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9ICcnO1xyXG4gICAgICBpZiAodGhpcy5fbmVlZHNQb3NpdGlvblN0aWNreU9uRWxlbWVudCkge1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcclxuICAgICAgfVxyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5fc3RpY2tDZWxsQ3NzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgdGhlIHN0aWNreSBzdHlsaW5nIHRvIHRoZSBlbGVtZW50IGJ5IGFkZGluZyB0aGUgc3RpY2t5IHN0eWxlIGNsYXNzLCBjaGFuZ2luZyBwb3NpdGlvblxyXG4gICAqIHRvIGJlIHN0aWNreSAoYW5kIC13ZWJraXQtc3RpY2t5KSwgc2V0dGluZyB0aGUgYXBwcm9wcmlhdGUgekluZGV4LCBhbmQgYWRkaW5nIGEgc3RpY2t5XHJcbiAgICogZGlyZWN0aW9uIGFuZCB2YWx1ZS5cclxuICAgKi9cclxuICBfYWRkU3RpY2t5U3R5bGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGRpcjogU3RpY2t5RGlyZWN0aW9uLCBkaXJWYWx1ZTogbnVtYmVyLFxyXG4gICAgICBpc0JvcmRlckVsZW1lbnQ6IGJvb2xlYW4pIHtcclxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0aGlzLl9zdGlja0NlbGxDc3MpO1xyXG4gICAgaWYgKGlzQm9yZGVyRWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQodGhpcy5fYm9yZGVyQ2VsbENzc1tkaXJdKTtcclxuICAgIH1cclxuICAgIGVsZW1lbnQuc3R5bGVbZGlyXSA9IGAke2RpclZhbHVlfXB4YDtcclxuICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gdGhpcy5fZ2V0Q2FsY3VsYXRlZFpJbmRleChlbGVtZW50KTtcclxuICAgIGlmICh0aGlzLl9uZWVkc1Bvc2l0aW9uU3RpY2t5T25FbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQuc3R5bGUuY3NzVGV4dCArPSAncG9zaXRpb246IC13ZWJraXQtc3RpY2t5OyBwb3NpdGlvbjogc3RpY2t5OyAnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsY3VsYXRlIHdoYXQgdGhlIHotaW5kZXggc2hvdWxkIGJlIGZvciB0aGUgZWxlbWVudCwgZGVwZW5kaW5nIG9uIHdoYXQgZGlyZWN0aW9ucyAodG9wLFxyXG4gICAqIGJvdHRvbSwgbGVmdCwgcmlnaHQpIGhhdmUgYmVlbiBzZXQuIEl0IHNob3VsZCBiZSB0cnVlIHRoYXQgZWxlbWVudHMgd2l0aCBhIHRvcCBkaXJlY3Rpb25cclxuICAgKiBzaG91bGQgaGF2ZSB0aGUgaGlnaGVzdCBpbmRleCBzaW5jZSB0aGVzZSBhcmUgZWxlbWVudHMgbGlrZSBhIHRhYmxlIGhlYWRlci4gSWYgYW55IG9mIHRob3NlXHJcbiAgICogZWxlbWVudHMgYXJlIGFsc28gc3RpY2t5IGluIGFub3RoZXIgZGlyZWN0aW9uLCB0aGVuIHRoZXkgc2hvdWxkIGFwcGVhciBhYm92ZSBvdGhlciBlbGVtZW50c1xyXG4gICAqIHRoYXQgYXJlIG9ubHkgc3RpY2t5IHRvcCAoZS5nLiBhIHN0aWNreSBjb2x1bW4gb24gYSBzdGlja3kgaGVhZGVyKS4gQm90dG9tLXN0aWNreSBlbGVtZW50c1xyXG4gICAqIChlLmcuIGZvb3RlciByb3dzKSBzaG91bGQgdGhlbiBiZSBuZXh0IGluIHRoZSBvcmRlcmluZyBzdWNoIHRoYXQgdGhleSBhcmUgYmVsb3cgdGhlIGhlYWRlclxyXG4gICAqIGJ1dCBhYm92ZSBhbnkgbm9uLXN0aWNreSBlbGVtZW50cy4gRmluYWxseSwgbGVmdC9yaWdodCBzdGlja3kgZWxlbWVudHMgKGUuZy4gc3RpY2t5IGNvbHVtbnMpXHJcbiAgICogc2hvdWxkIG1pbmltYWxseSBpbmNyZW1lbnQgc28gdGhhdCB0aGV5IGFyZSBhYm92ZSBub24tc3RpY2t5IGVsZW1lbnRzIGJ1dCBiZWxvdyB0b3AgYW5kIGJvdHRvbVxyXG4gICAqIGVsZW1lbnRzLlxyXG4gICAqL1xyXG4gIF9nZXRDYWxjdWxhdGVkWkluZGV4KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHpJbmRleEluY3JlbWVudHMgPSB7XHJcbiAgICAgIHRvcDogMTAwLFxyXG4gICAgICBib3R0b206IDEwLFxyXG4gICAgICBsZWZ0OiAxLFxyXG4gICAgICByaWdodDogMSxcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHpJbmRleCA9IDA7XHJcbiAgICAvLyBVc2UgYEl0ZXJhYmxlYCBpbnN0ZWFkIG9mIGBBcnJheWAgYmVjYXVzZSBUeXBlU2NyaXB0LCBhcyBvZiAzLjYuMyxcclxuICAgIC8vIGxvc2VzIHRoZSBhcnJheSBnZW5lcmljIHR5cGUgaW4gdGhlIGBmb3Igb2ZgLiBCdXQgd2UgKmFsc28qIGhhdmUgdG8gdXNlIGBBcnJheWAgYmVjYXVzZVxyXG4gICAgLy8gdHlwZXNjcmlwdCB3b24ndCBpdGVyYXRlIG92ZXIgYW4gYEl0ZXJhYmxlYCB1bmxlc3MgeW91IGNvbXBpbGUgd2l0aCBgLS1kb3dubGV2ZWxJdGVyYXRpb25gXHJcbiAgICBmb3IgKGNvbnN0IGRpciBvZiBTVElDS1lfRElSRUNUSU9OUyBhcyBJdGVyYWJsZTxTdGlja3lEaXJlY3Rpb24+ICYgU3RpY2t5RGlyZWN0aW9uW10pIHtcclxuICAgICAgaWYgKGVsZW1lbnQuc3R5bGVbZGlyXSkge1xyXG4gICAgICAgIHpJbmRleCArPSB6SW5kZXhJbmNyZW1lbnRzW2Rpcl07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gekluZGV4ID8gYCR7ekluZGV4fWAgOiAnJztcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSB3aWR0aHMgZm9yIGVhY2ggY2VsbCBpbiB0aGUgcHJvdmlkZWQgcm93LiAqL1xyXG4gIF9nZXRDZWxsV2lkdGhzKHJvdzogSFRNTEVsZW1lbnQsIHJlY2FsY3VsYXRlQ2VsbFdpZHRocyA9IHRydWUpOiBudW1iZXJbXSB7XHJcbiAgICBpZiAoIXJlY2FsY3VsYXRlQ2VsbFdpZHRocyAmJiB0aGlzLl9jYWNoZWRDZWxsV2lkdGhzLmxlbmd0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkQ2VsbFdpZHRocztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjZWxsV2lkdGhzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgY29uc3QgZmlyc3RSb3dDZWxscyA9IHJvdy5jaGlsZHJlbjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlyc3RSb3dDZWxscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgY2VsbDogSFRNTEVsZW1lbnQgPSBmaXJzdFJvd0NlbGxzW2ldIGFzIEhUTUxFbGVtZW50O1xyXG4gICAgICBjZWxsV2lkdGhzLnB1c2goY2VsbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2FjaGVkQ2VsbFdpZHRocyA9IGNlbGxXaWR0aHM7XHJcbiAgICByZXR1cm4gY2VsbFdpZHRocztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgdGhlIGxlZnQgYW5kIHJpZ2h0IHBvc2l0aW9ucyBvZiBlYWNoIHN0aWNreSBjb2x1bW4gY2VsbCwgd2hpY2ggd2lsbCBiZSB0aGVcclxuICAgKiBhY2N1bXVsYXRpb24gb2YgYWxsIHN0aWNreSBjb2x1bW4gY2VsbCB3aWR0aHMgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0LCByZXNwZWN0aXZlbHkuXHJcbiAgICogTm9uLXN0aWNreSBjZWxscyBkbyBub3QgbmVlZCB0byBoYXZlIGEgdmFsdWUgc2V0IHNpbmNlIHRoZWlyIHBvc2l0aW9ucyB3aWxsIG5vdCBiZSBhcHBsaWVkLlxyXG4gICAqL1xyXG4gIF9nZXRTdGlja3lTdGFydENvbHVtblBvc2l0aW9ucyh3aWR0aHM6IG51bWJlcltdLCBzdGlja3lTdGF0ZXM6IGJvb2xlYW5bXSk6IG51bWJlcltdIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcclxuICAgIGxldCBuZXh0UG9zaXRpb24gPSAwO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGhzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzdGlja3lTdGF0ZXNbaV0pIHtcclxuICAgICAgICBwb3NpdGlvbnNbaV0gPSBuZXh0UG9zaXRpb247XHJcbiAgICAgICAgbmV4dFBvc2l0aW9uICs9IHdpZHRoc1tpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb3NpdGlvbnM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBsZWZ0IGFuZCByaWdodCBwb3NpdGlvbnMgb2YgZWFjaCBzdGlja3kgY29sdW1uIGNlbGwsIHdoaWNoIHdpbGwgYmUgdGhlXHJcbiAgICogYWNjdW11bGF0aW9uIG9mIGFsbCBzdGlja3kgY29sdW1uIGNlbGwgd2lkdGhzIHRvIHRoZSBsZWZ0IGFuZCByaWdodCwgcmVzcGVjdGl2ZWx5LlxyXG4gICAqIE5vbi1zdGlja3kgY2VsbHMgZG8gbm90IG5lZWQgdG8gaGF2ZSBhIHZhbHVlIHNldCBzaW5jZSB0aGVpciBwb3NpdGlvbnMgd2lsbCBub3QgYmUgYXBwbGllZC5cclxuICAgKi9cclxuICBfZ2V0U3RpY2t5RW5kQ29sdW1uUG9zaXRpb25zKHdpZHRoczogbnVtYmVyW10sIHN0aWNreVN0YXRlczogYm9vbGVhbltdKTogbnVtYmVyW10ge1xyXG4gICAgY29uc3QgcG9zaXRpb25zOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgbGV0IG5leHRQb3NpdGlvbiA9IDA7XHJcblxyXG4gICAgZm9yIChsZXQgaSA9IHdpZHRocy5sZW5ndGg7IGkgPiAwOyBpLS0pIHtcclxuICAgICAgaWYgKHN0aWNreVN0YXRlc1tpXSkge1xyXG4gICAgICAgIHBvc2l0aW9uc1tpXSA9IG5leHRQb3NpdGlvbjtcclxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gd2lkdGhzW2ldO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvc2l0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjaGVkdWxlcyBzdHlsZXMgdG8gYmUgYXBwbGllZCB3aGVuIHRoZSBzdHlsZSBzY2hlZHVsZXIgZGVlbXMgYXBwcm9wcmlhdGUuXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgVGhpcyBtZXRob2QgY2FuIGJlIHJlbW92ZWQgaW4gZmF2b3Igb2YgY2FsbGluZ1xyXG4gICAqIGBDb2FsZXNjZWRTdHlsZVNjaGVkdWxlci5zY2hlZHVsZWAgZGlyZWN0bHkgb25jZSB0aGUgc2NoZWR1bGVyIGlzIGEgcmVxdWlyZWQgcGFyYW1ldGVyLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3NjaGVkdWxlU3R5bGVDaGFuZ2VzKGNoYW5nZXM6ICgpID0+IHZvaWQpIHtcclxuICAgIGlmICh0aGlzLl9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlcikge1xyXG4gICAgICB0aGlzLl9jb2FsZXNjZWRTdHlsZVNjaGVkdWxlci5zY2hlZHVsZShjaGFuZ2VzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoYW5nZXMoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19