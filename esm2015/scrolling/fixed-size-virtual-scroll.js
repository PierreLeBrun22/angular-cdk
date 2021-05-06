/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, forwardRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { VIRTUAL_SCROLL_STRATEGY } from './virtual-scroll-strategy';
/** Virtual scrolling strategy for lists with items of known fixed size. */
export class FixedSizeVirtualScrollStrategy {
    /**
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    constructor(itemSize, minBufferPx, maxBufferPx) {
        this._scrolledIndexChange = new Subject();
        /** @docs-private Implemented as part of VirtualScrollStrategy. */
        this.scrolledIndexChange = this._scrolledIndexChange.pipe(distinctUntilChanged());
        /** The attached viewport. */
        this._viewport = null;
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
    }
    /**
     * Attaches this scroll strategy to a viewport.
     * @param viewport The viewport to attach this strategy to.
     */
    attach(viewport) {
        this._viewport = viewport;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** Detaches this scroll strategy from the currently attached viewport. */
    detach() {
        this._scrolledIndexChange.complete();
        this._viewport = null;
    }
    /**
     * Update the item size and buffer size.
     * @param itemSize The size of the items in the virtually scrolling list.
     * @param minBufferPx The minimum amount of buffer (in pixels) before needing to render more
     * @param maxBufferPx The amount of buffer (in pixels) to render when rendering more.
     */
    updateItemAndBufferSize(itemSize, minBufferPx, maxBufferPx) {
        if (maxBufferPx < minBufferPx && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw Error('CDK virtual scroll: maxBufferPx must be greater than or equal to minBufferPx');
        }
        this._itemSize = itemSize;
        this._minBufferPx = minBufferPx;
        this._maxBufferPx = maxBufferPx;
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentScrolled() {
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onDataLengthChanged() {
        this._updateTotalContentSize();
        this._updateRenderedRange();
    }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onContentRendered() { }
    /** @docs-private Implemented as part of VirtualScrollStrategy. */
    onRenderedOffsetChanged() { }
    /**
     * Scroll to the offset for the given index.
     * @param index The index of the element to scroll to.
     * @param behavior The ScrollBehavior to use when scrolling.
     */
    scrollToIndex(index, behavior) {
        if (this._viewport) {
            this._viewport.scrollToOffset(index * this._itemSize, behavior);
        }
    }
    /** Update the viewport's total content size. */
    _updateTotalContentSize() {
        if (!this._viewport) {
            return;
        }
        this._viewport.setTotalContentSize(this._viewport.getDataLength() * this._itemSize);
    }
    /** Update the viewport's rendered range. */
    _updateRenderedRange() {
        if (!this._viewport) {
            return;
        }
        const renderedRange = this._viewport.getRenderedRange();
        const newRange = { start: renderedRange.start, end: renderedRange.end };
        const viewportSize = this._viewport.getViewportSize();
        const dataLength = this._viewport.getDataLength();
        let scrollOffset = this._viewport.measureScrollOffset();
        // Prevent NaN as result when dividing by zero.
        let firstVisibleIndex = (this._itemSize > 0) ? scrollOffset / this._itemSize : 0;
        // If user scrolls to the bottom of the list and data changes to a smaller list
        if (newRange.end > dataLength) {
            // We have to recalculate the first visible index based on new data length and viewport size.
            const maxVisibleItems = Math.ceil(viewportSize / this._itemSize);
            const newVisibleIndex = Math.max(0, Math.min(firstVisibleIndex, dataLength - maxVisibleItems));
            // If first visible index changed we must update scroll offset to handle start/end buffers
            // Current range must also be adjusted to cover the new position (bottom of new list).
            if (firstVisibleIndex != newVisibleIndex) {
                firstVisibleIndex = newVisibleIndex;
                scrollOffset = newVisibleIndex * this._itemSize;
                newRange.start = Math.floor(firstVisibleIndex);
            }
            newRange.end = Math.max(0, Math.min(dataLength, newRange.start + maxVisibleItems));
        }
        const startBuffer = scrollOffset - newRange.start * this._itemSize;
        if (startBuffer < this._minBufferPx && newRange.start != 0) {
            const expandStart = Math.ceil((this._maxBufferPx - startBuffer) / this._itemSize);
            newRange.start = Math.max(0, newRange.start - expandStart);
            newRange.end = Math.min(dataLength, Math.ceil(firstVisibleIndex + (viewportSize + this._minBufferPx) / this._itemSize));
        }
        else {
            const endBuffer = newRange.end * this._itemSize - (scrollOffset + viewportSize);
            if (endBuffer < this._minBufferPx && newRange.end != dataLength) {
                const expandEnd = Math.ceil((this._maxBufferPx - endBuffer) / this._itemSize);
                if (expandEnd > 0) {
                    newRange.end = Math.min(dataLength, newRange.end + expandEnd);
                    newRange.start = Math.max(0, Math.floor(firstVisibleIndex - this._minBufferPx / this._itemSize));
                }
            }
        }
        this._viewport.setRenderedRange(newRange);
        this._viewport.setRenderedContentOffset(this._itemSize * newRange.start);
        this._scrolledIndexChange.next(Math.floor(firstVisibleIndex));
    }
}
/**
 * Provider factory for `FixedSizeVirtualScrollStrategy` that simply extracts the already created
 * `FixedSizeVirtualScrollStrategy` from the given directive.
 * @param fixedSizeDir The instance of `CdkFixedSizeVirtualScroll` to extract the
 *     `FixedSizeVirtualScrollStrategy` from.
 */
export function _fixedSizeVirtualScrollStrategyFactory(fixedSizeDir) {
    return fixedSizeDir._scrollStrategy;
}
/** A virtual scroll strategy that supports fixed-size items. */
export class CdkFixedSizeVirtualScroll {
    constructor() {
        this._itemSize = 20;
        this._minBufferPx = 100;
        this._maxBufferPx = 200;
        /** The scroll strategy used by this directive. */
        this._scrollStrategy = new FixedSizeVirtualScrollStrategy(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
    /** The size of the items in the list (in pixels). */
    get itemSize() { return this._itemSize; }
    set itemSize(value) { this._itemSize = coerceNumberProperty(value); }
    /**
     * The minimum amount of buffer rendered beyond the viewport (in pixels).
     * If the amount of buffer dips below this number, more items will be rendered. Defaults to 100px.
     */
    get minBufferPx() { return this._minBufferPx; }
    set minBufferPx(value) { this._minBufferPx = coerceNumberProperty(value); }
    /**
     * The number of pixels worth of buffer to render for when rendering new items. Defaults to 200px.
     */
    get maxBufferPx() { return this._maxBufferPx; }
    set maxBufferPx(value) { this._maxBufferPx = coerceNumberProperty(value); }
    ngOnChanges() {
        this._scrollStrategy.updateItemAndBufferSize(this.itemSize, this.minBufferPx, this.maxBufferPx);
    }
}
CdkFixedSizeVirtualScroll.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-virtual-scroll-viewport[itemSize]',
                providers: [{
                        provide: VIRTUAL_SCROLL_STRATEGY,
                        useFactory: _fixedSizeVirtualScrollStrategyFactory,
                        deps: [forwardRef(() => CdkFixedSizeVirtualScroll)],
                    }],
            },] }
];
CdkFixedSizeVirtualScroll.propDecorators = {
    itemSize: [{ type: Input }],
    minBufferPx: [{ type: Input }],
    maxBufferPx: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4ZWQtc2l6ZS12aXJ0dWFsLXNjcm9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL2ZpeGVkLXNpemUtdmlydHVhbC1zY3JvbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG9CQUFvQixFQUFjLE1BQU0sdUJBQXVCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBYSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDekMsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLHVCQUF1QixFQUF3QixNQUFNLDJCQUEyQixDQUFDO0FBSXpGLDJFQUEyRTtBQUMzRSxNQUFNLE9BQU8sOEJBQThCO0lBa0J6Qzs7OztPQUlHO0lBQ0gsWUFBWSxRQUFnQixFQUFFLFdBQW1CLEVBQUUsV0FBbUI7UUF0QjlELHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFVLENBQUM7UUFFckQsa0VBQWtFO1FBQ2xFLHdCQUFtQixHQUF1QixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztRQUVqRyw2QkFBNkI7UUFDckIsY0FBUyxHQUFvQyxJQUFJLENBQUM7UUFpQnhELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMsUUFBa0M7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFD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U0FBUyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxFQUFFLHVCQUF1Qjt3QkFDaEMsVUFBVSxFQUFFLHNDQUFzQzt3QkFDbEQsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLHlCQUF5QixDQUFDLENBQUM7cUJBQ3BELENBQUM7YUFDSDs7O3VCQUdFLEtBQUs7MEJBU0wsS0FBSzswQkFRTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge2NvZXJjZU51bWJlclByb3BlcnR5LCBOdW1iZXJJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtEaXJlY3RpdmUsIGZvcndhcmRSZWYsIElucHV0LCBPbkNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge2Rpc3RpbmN0VW50aWxDaGFuZ2VkfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7VklSVFVBTF9TQ1JPTExfU1RSQVRFR1ksIFZpcnR1YWxTY3JvbGxTdHJhdGVneX0gZnJvbSAnLi92aXJ0dWFsLXNjcm9sbC1zdHJhdGVneSc7XHJcbmltcG9ydCB7Q2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0fSBmcm9tICcuL3ZpcnR1YWwtc2Nyb2xsLXZpZXdwb3J0JztcclxuXHJcblxyXG4vKiogVmlydHVhbCBzY3JvbGxpbmcgc3RyYXRlZ3kgZm9yIGxpc3RzIHdpdGggaXRlbXMgb2Yga25vd24gZml4ZWQgc2l6ZS4gKi9cclxuZXhwb3J0IGNsYXNzIEZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneSBpbXBsZW1lbnRzIFZpcnR1YWxTY3JvbGxTdHJhdGVneSB7XHJcbiAgcHJpdmF0ZSBfc2Nyb2xsZWRJbmRleENoYW5nZSA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXHJcbiAgc2Nyb2xsZWRJbmRleENoYW5nZTogT2JzZXJ2YWJsZTxudW1iZXI+ID0gdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5waXBlKGRpc3RpbmN0VW50aWxDaGFuZ2VkKCkpO1xyXG5cclxuICAvKiogVGhlIGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xyXG4gIHByaXZhdGUgX3ZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBpdGVtcyBpbiB0aGUgdmlydHVhbGx5IHNjcm9sbGluZyBsaXN0LiAqL1xyXG4gIHByaXZhdGUgX2l0ZW1TaXplOiBudW1iZXI7XHJcblxyXG4gIC8qKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuICovXHJcbiAgcHJpdmF0ZSBfbWluQnVmZmVyUHg6IG51bWJlcjtcclxuXHJcbiAgLyoqIFRoZSBudW1iZXIgb2YgYnVmZmVyIGl0ZW1zIHRvIHJlbmRlciBiZXlvbmQgdGhlIGVkZ2Ugb2YgdGhlIHZpZXdwb3J0IChpbiBwaXhlbHMpLiAqL1xyXG4gIHByaXZhdGUgX21heEJ1ZmZlclB4OiBudW1iZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBpdGVtU2l6ZSBUaGUgc2l6ZSBvZiB0aGUgaXRlbXMgaW4gdGhlIHZpcnR1YWxseSBzY3JvbGxpbmcgbGlzdC5cclxuICAgKiBAcGFyYW0gbWluQnVmZmVyUHggVGhlIG1pbmltdW0gYW1vdW50IG9mIGJ1ZmZlciAoaW4gcGl4ZWxzKSBiZWZvcmUgbmVlZGluZyB0byByZW5kZXIgbW9yZVxyXG4gICAqIEBwYXJhbSBtYXhCdWZmZXJQeCBUaGUgYW1vdW50IG9mIGJ1ZmZlciAoaW4gcGl4ZWxzKSB0byByZW5kZXIgd2hlbiByZW5kZXJpbmcgbW9yZS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihpdGVtU2l6ZTogbnVtYmVyLCBtaW5CdWZmZXJQeDogbnVtYmVyLCBtYXhCdWZmZXJQeDogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9pdGVtU2l6ZSA9IGl0ZW1TaXplO1xyXG4gICAgdGhpcy5fbWluQnVmZmVyUHggPSBtaW5CdWZmZXJQeDtcclxuICAgIHRoaXMuX21heEJ1ZmZlclB4ID0gbWF4QnVmZmVyUHg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSB0byBhIHZpZXdwb3J0LlxyXG4gICAqIEBwYXJhbSB2aWV3cG9ydCBUaGUgdmlld3BvcnQgdG8gYXR0YWNoIHRoaXMgc3RyYXRlZ3kgdG8uXHJcbiAgICovXHJcbiAgYXR0YWNoKHZpZXdwb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQpIHtcclxuICAgIHRoaXMuX3ZpZXdwb3J0ID0gdmlld3BvcnQ7XHJcbiAgICB0aGlzLl91cGRhdGVUb3RhbENvbnRlbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVSZW5kZXJlZFJhbmdlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogRGV0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgZnJvbSB0aGUgY3VycmVudGx5IGF0dGFjaGVkIHZpZXdwb3J0LiAqL1xyXG4gIGRldGFjaCgpIHtcclxuICAgIHRoaXMuX3Njcm9sbGVkSW5kZXhDaGFuZ2UuY29tcGxldGUoKTtcclxuICAgIHRoaXMuX3ZpZXdwb3J0ID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgaXRlbSBzaXplIGFuZCBidWZmZXIgc2l6ZS5cclxuICAgKiBAcGFyYW0gaXRlbVNpemUgVGhlIHNpemUgb2YgdGhlIGl0ZW1zIGluIHRoZSB2aXJ0dWFsbHkgc2Nyb2xsaW5nIGxpc3QuXHJcbiAgICogQHBhcmFtIG1pbkJ1ZmZlclB4IFRoZSBtaW5pbXVtIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgYmVmb3JlIG5lZWRpbmcgdG8gcmVuZGVyIG1vcmVcclxuICAgKiBAcGFyYW0gbWF4QnVmZmVyUHggVGhlIGFtb3VudCBvZiBidWZmZXIgKGluIHBpeGVscykgdG8gcmVuZGVyIHdoZW4gcmVuZGVyaW5nIG1vcmUuXHJcbiAgICovXHJcbiAgdXBkYXRlSXRlbUFuZEJ1ZmZlclNpemUoaXRlbVNpemU6IG51bWJlciwgbWluQnVmZmVyUHg6IG51bWJlciwgbWF4QnVmZmVyUHg6IG51bWJlcikge1xyXG4gICAgaWYgKG1heEJ1ZmZlclB4IDwgbWluQnVmZmVyUHggJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoJ0NESyB2aXJ0dWFsIHNjcm9sbDogbWF4QnVmZmVyUHggbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gbWluQnVmZmVyUHgnKTtcclxuICAgIH1cclxuICAgIHRoaXMuX2l0ZW1TaXplID0gaXRlbVNpemU7XHJcbiAgICB0aGlzLl9taW5CdWZmZXJQeCA9IG1pbkJ1ZmZlclB4O1xyXG4gICAgdGhpcy5fbWF4QnVmZmVyUHggPSBtYXhCdWZmZXJQeDtcclxuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcclxuICB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xyXG4gIG9uQ29udGVudFNjcm9sbGVkKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlUmVuZGVyZWRSYW5nZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEBkb2NzLXByaXZhdGUgSW1wbGVtZW50ZWQgYXMgcGFydCBvZiBWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3kuICovXHJcbiAgb25EYXRhTGVuZ3RoQ2hhbmdlZCgpIHtcclxuICAgIHRoaXMuX3VwZGF0ZVRvdGFsQ29udGVudFNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKTtcclxuICB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xyXG4gIG9uQ29udGVudFJlbmRlcmVkKCkgeyAvKiBuby1vcCAqLyB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgVmlydHVhbFNjcm9sbFN0cmF0ZWd5LiAqL1xyXG4gIG9uUmVuZGVyZWRPZmZzZXRDaGFuZ2VkKCkgeyAvKiBuby1vcCAqLyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjcm9sbCB0byB0aGUgb2Zmc2V0IGZvciB0aGUgZ2l2ZW4gaW5kZXguXHJcbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCB0byBzY3JvbGwgdG8uXHJcbiAgICogQHBhcmFtIGJlaGF2aW9yIFRoZSBTY3JvbGxCZWhhdmlvciB0byB1c2Ugd2hlbiBzY3JvbGxpbmcuXHJcbiAgICovXHJcbiAgc2Nyb2xsVG9JbmRleChpbmRleDogbnVtYmVyLCBiZWhhdmlvcjogU2Nyb2xsQmVoYXZpb3IpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl92aWV3cG9ydCkge1xyXG4gICAgICB0aGlzLl92aWV3cG9ydC5zY3JvbGxUb09mZnNldChpbmRleCAqIHRoaXMuX2l0ZW1TaXplLCBiZWhhdmlvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHRvdGFsIGNvbnRlbnQgc2l6ZS4gKi9cclxuICBwcml2YXRlIF91cGRhdGVUb3RhbENvbnRlbnRTaXplKCkge1xyXG4gICAgaWYgKCF0aGlzLl92aWV3cG9ydCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdmlld3BvcnQuc2V0VG90YWxDb250ZW50U2l6ZSh0aGlzLl92aWV3cG9ydC5nZXREYXRhTGVuZ3RoKCkgKiB0aGlzLl9pdGVtU2l6ZSk7XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlIHRoZSB2aWV3cG9ydCdzIHJlbmRlcmVkIHJhbmdlLiAqL1xyXG4gIHByaXZhdGUgX3VwZGF0ZVJlbmRlcmVkUmFuZ2UoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3ZpZXdwb3J0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCByZW5kZXJlZFJhbmdlID0gdGhpcy5fdmlld3BvcnQuZ2V0UmVuZGVyZWRSYW5nZSgpO1xyXG4gICAgY29uc3QgbmV3UmFuZ2UgPSB7c3RhcnQ6IHJlbmRlcmVkUmFuZ2Uuc3RhcnQsIGVuZDogcmVuZGVyZWRSYW5nZS5lbmR9O1xyXG4gICAgY29uc3Qgdmlld3BvcnRTaXplID0gdGhpcy5fdmlld3BvcnQuZ2V0Vmlld3BvcnRTaXplKCk7XHJcbiAgICBjb25zdCBkYXRhTGVuZ3RoID0gdGhpcy5fdmlld3BvcnQuZ2V0RGF0YUxlbmd0aCgpO1xyXG4gICAgbGV0IHNjcm9sbE9mZnNldCA9IHRoaXMuX3ZpZXdwb3J0Lm1lYXN1cmVTY3JvbGxPZmZzZXQoKTtcclxuICAgICAvLyBQcmV2ZW50IE5hTiBhcyByZXN1bHQgd2hlbiBkaXZpZGluZyBieSB6ZXJvLlxyXG4gICAgbGV0IGZpcnN0VmlzaWJsZUluZGV4ID0gKHRoaXMuX2l0ZW1TaXplID4gMCkgPyBzY3JvbGxPZmZzZXQgLyB0aGlzLl9pdGVtU2l6ZSA6IDA7XHJcblxyXG4gICAgLy8gSWYgdXNlciBzY3JvbGxzIHRvIHRoZSBib3R0b20gb2YgdGhlIGxpc3QgYW5kIGRhdGEgY2hhbmdlcyB0byBhIHNtYWxsZXIgbGlzdFxyXG4gICAgaWYgKG5ld1JhbmdlLmVuZCA+IGRhdGFMZW5ndGgpIHtcclxuICAgICAgLy8gV2UgaGF2ZSB0byByZWNhbGN1bGF0ZSB0aGUgZmlyc3QgdmlzaWJsZSBpbmRleCBiYXNlZCBvbiBuZXcgZGF0YSBsZW5ndGggYW5kIHZpZXdwb3J0IHNpemUuXHJcbiAgICAgIGNvbnN0IG1heFZpc2libGVJdGVtcyA9IE1hdGguY2VpbCh2aWV3cG9ydFNpemUgLyB0aGlzLl9pdGVtU2l6ZSk7XHJcbiAgICAgIGNvbnN0IG5ld1Zpc2libGVJbmRleCA9IE1hdGgubWF4KDAsXHJcbiAgICAgICAgICBNYXRoLm1pbihmaXJzdFZpc2libGVJbmRleCwgZGF0YUxlbmd0aCAtIG1heFZpc2libGVJdGVtcykpO1xyXG5cclxuICAgICAgLy8gSWYgZmlyc3QgdmlzaWJsZSBpbmRleCBjaGFuZ2VkIHdlIG11c3QgdXBkYXRlIHNjcm9sbCBvZmZzZXQgdG8gaGFuZGxlIHN0YXJ0L2VuZCBidWZmZXJzXHJcbiAgICAgIC8vIEN1cnJlbnQgcmFuZ2UgbXVzdCBhbHNvIGJlIGFkanVzdGVkIHRvIGNvdmVyIHRoZSBuZXcgcG9zaXRpb24gKGJvdHRvbSBvZiBuZXcgbGlzdCkuXHJcbiAgICAgIGlmIChmaXJzdFZpc2libGVJbmRleCAhPSBuZXdWaXNpYmxlSW5kZXgpIHtcclxuICAgICAgICBmaXJzdFZpc2libGVJbmRleCA9IG5ld1Zpc2libGVJbmRleDtcclxuICAgICAgICBzY3JvbGxPZmZzZXQgPSBuZXdWaXNpYmxlSW5kZXggKiB0aGlzLl9pdGVtU2l6ZTtcclxuICAgICAgICBuZXdSYW5nZS5zdGFydCA9IE1hdGguZmxvb3IoZmlyc3RWaXNpYmxlSW5kZXgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBuZXdSYW5nZS5lbmQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihkYXRhTGVuZ3RoLCBuZXdSYW5nZS5zdGFydCArIG1heFZpc2libGVJdGVtcykpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0YXJ0QnVmZmVyID0gc2Nyb2xsT2Zmc2V0IC0gbmV3UmFuZ2Uuc3RhcnQgKiB0aGlzLl9pdGVtU2l6ZTtcclxuICAgIGlmIChzdGFydEJ1ZmZlciA8IHRoaXMuX21pbkJ1ZmZlclB4ICYmIG5ld1JhbmdlLnN0YXJ0ICE9IDApIHtcclxuICAgICAgY29uc3QgZXhwYW5kU3RhcnQgPSBNYXRoLmNlaWwoKHRoaXMuX21heEJ1ZmZlclB4IC0gc3RhcnRCdWZmZXIpIC8gdGhpcy5faXRlbVNpemUpO1xyXG4gICAgICBuZXdSYW5nZS5zdGFydCA9IE1hdGgubWF4KDAsIG5ld1JhbmdlLnN0YXJ0IC0gZXhwYW5kU3RhcnQpO1xyXG4gICAgICBuZXdSYW5nZS5lbmQgPSBNYXRoLm1pbihkYXRhTGVuZ3RoLFxyXG4gICAgICAgICAgTWF0aC5jZWlsKGZpcnN0VmlzaWJsZUluZGV4ICsgKHZpZXdwb3J0U2l6ZSArIHRoaXMuX21pbkJ1ZmZlclB4KSAvIHRoaXMuX2l0ZW1TaXplKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBlbmRCdWZmZXIgPSBuZXdSYW5nZS5lbmQgKiB0aGlzLl9pdGVtU2l6ZSAtIChzY3JvbGxPZmZzZXQgKyB2aWV3cG9ydFNpemUpO1xyXG4gICAgICBpZiAoZW5kQnVmZmVyIDwgdGhpcy5fbWluQnVmZmVyUHggJiYgbmV3UmFuZ2UuZW5kICE9IGRhdGFMZW5ndGgpIHtcclxuICAgICAgICBjb25zdCBleHBhbmRFbmQgPSBNYXRoLmNlaWwoKHRoaXMuX21heEJ1ZmZlclB4IC0gZW5kQnVmZmVyKSAvIHRoaXMuX2l0ZW1TaXplKTtcclxuICAgICAgICBpZiAoZXhwYW5kRW5kID4gMCkge1xyXG4gICAgICAgICAgbmV3UmFuZ2UuZW5kID0gTWF0aC5taW4oZGF0YUxlbmd0aCwgbmV3UmFuZ2UuZW5kICsgZXhwYW5kRW5kKTtcclxuICAgICAgICAgIG5ld1JhbmdlLnN0YXJ0ID0gTWF0aC5tYXgoMCxcclxuICAgICAgICAgICAgICBNYXRoLmZsb29yKGZpcnN0VmlzaWJsZUluZGV4IC0gdGhpcy5fbWluQnVmZmVyUHggLyB0aGlzLl9pdGVtU2l6ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3ZpZXdwb3J0LnNldFJlbmRlcmVkUmFuZ2UobmV3UmFuZ2UpO1xyXG4gICAgdGhpcy5fdmlld3BvcnQuc2V0UmVuZGVyZWRDb250ZW50T2Zmc2V0KHRoaXMuX2l0ZW1TaXplICogbmV3UmFuZ2Uuc3RhcnQpO1xyXG4gICAgdGhpcy5fc2Nyb2xsZWRJbmRleENoYW5nZS5uZXh0KE1hdGguZmxvb3IoZmlyc3RWaXNpYmxlSW5kZXgpKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogUHJvdmlkZXIgZmFjdG9yeSBmb3IgYEZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgdGhhdCBzaW1wbHkgZXh0cmFjdHMgdGhlIGFscmVhZHkgY3JlYXRlZFxyXG4gKiBgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5YCBmcm9tIHRoZSBnaXZlbiBkaXJlY3RpdmUuXHJcbiAqIEBwYXJhbSBmaXhlZFNpemVEaXIgVGhlIGluc3RhbmNlIG9mIGBDZGtGaXhlZFNpemVWaXJ0dWFsU2Nyb2xsYCB0byBleHRyYWN0IHRoZVxyXG4gKiAgICAgYEZpeGVkU2l6ZVZpcnR1YWxTY3JvbGxTdHJhdGVneWAgZnJvbS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfZml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5RmFjdG9yeShmaXhlZFNpemVEaXI6IENka0ZpeGVkU2l6ZVZpcnR1YWxTY3JvbGwpIHtcclxuICByZXR1cm4gZml4ZWRTaXplRGlyLl9zY3JvbGxTdHJhdGVneTtcclxufVxyXG5cclxuXHJcbi8qKiBBIHZpcnR1YWwgc2Nyb2xsIHN0cmF0ZWd5IHRoYXQgc3VwcG9ydHMgZml4ZWQtc2l6ZSBpdGVtcy4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnRbaXRlbVNpemVdJyxcclxuICBwcm92aWRlcnM6IFt7XHJcbiAgICBwcm92aWRlOiBWSVJUVUFMX1NDUk9MTF9TVFJBVEVHWSxcclxuICAgIHVzZUZhY3Rvcnk6IF9maXhlZFNpemVWaXJ0dWFsU2Nyb2xsU3RyYXRlZ3lGYWN0b3J5LFxyXG4gICAgZGVwczogW2ZvcndhcmRSZWYoKCkgPT4gQ2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbCldLFxyXG4gIH1dLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrRml4ZWRTaXplVmlydHVhbFNjcm9sbCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XHJcbiAgLyoqIFRoZSBzaXplIG9mIHRoZSBpdGVtcyBpbiB0aGUgbGlzdCAoaW4gcGl4ZWxzKS4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBpdGVtU2l6ZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5faXRlbVNpemU7IH1cclxuICBzZXQgaXRlbVNpemUodmFsdWU6IG51bWJlcikgeyB0aGlzLl9pdGVtU2l6ZSA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxyXG4gIF9pdGVtU2l6ZSA9IDIwO1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgbWluaW11bSBhbW91bnQgb2YgYnVmZmVyIHJlbmRlcmVkIGJleW9uZCB0aGUgdmlld3BvcnQgKGluIHBpeGVscykuXHJcbiAgICogSWYgdGhlIGFtb3VudCBvZiBidWZmZXIgZGlwcyBiZWxvdyB0aGlzIG51bWJlciwgbW9yZSBpdGVtcyB3aWxsIGJlIHJlbmRlcmVkLiBEZWZhdWx0cyB0byAxMDBweC5cclxuICAgKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBtaW5CdWZmZXJQeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWluQnVmZmVyUHg7IH1cclxuICBzZXQgbWluQnVmZmVyUHgodmFsdWU6IG51bWJlcikgeyB0aGlzLl9taW5CdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxyXG4gIF9taW5CdWZmZXJQeCA9IDEwMDtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIG51bWJlciBvZiBwaXhlbHMgd29ydGggb2YgYnVmZmVyIHRvIHJlbmRlciBmb3Igd2hlbiByZW5kZXJpbmcgbmV3IGl0ZW1zLiBEZWZhdWx0cyB0byAyMDBweC5cclxuICAgKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBtYXhCdWZmZXJQeCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbWF4QnVmZmVyUHg7IH1cclxuICBzZXQgbWF4QnVmZmVyUHgodmFsdWU6IG51bWJlcikgeyB0aGlzLl9tYXhCdWZmZXJQeCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTsgfVxyXG4gIF9tYXhCdWZmZXJQeCA9IDIwMDtcclxuXHJcbiAgLyoqIFRoZSBzY3JvbGwgc3RyYXRlZ3kgdXNlZCBieSB0aGlzIGRpcmVjdGl2ZS4gKi9cclxuICBfc2Nyb2xsU3RyYXRlZ3kgPVxyXG4gICAgICBuZXcgRml4ZWRTaXplVmlydHVhbFNjcm9sbFN0cmF0ZWd5KHRoaXMuaXRlbVNpemUsIHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xyXG5cclxuICBuZ09uQ2hhbmdlcygpIHtcclxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LnVwZGF0ZUl0ZW1BbmRCdWZmZXJTaXplKHRoaXMuaXRlbVNpemUsIHRoaXMubWluQnVmZmVyUHgsIHRoaXMubWF4QnVmZmVyUHgpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2l0ZW1TaXplOiBOdW1iZXJJbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWluQnVmZmVyUHg6IE51bWJlcklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9tYXhCdWZmZXJQeDogTnVtYmVySW5wdXQ7XHJcbn1cclxuIl19