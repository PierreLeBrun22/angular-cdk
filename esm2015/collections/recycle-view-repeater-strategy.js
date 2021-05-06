/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A repeater that caches views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will reuse one of the cached views instead of creating a new
 * embedded view. Recycling cached views reduces the quantity of expensive DOM
 * inserts.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _RecycleViewRepeaterStrategy {
    constructor() {
        /**
         * The size of the cache used to store unused views.
         * Setting the cache size to `0` will disable caching. Defaults to 20 views.
         */
        this.viewCacheSize = 20;
        /**
         * View cache that stores embedded view instances that have been previously stamped out,
         * but don't are not currently rendered. The view repeater will reuse these views rather than
         * creating brand new ones.
         *
         * TODO(michaeljamesparsons) Investigate whether using a linked list would improve performance.
         */
        this._viewCache = [];
    }
    /** Apply changes to the DOM. */
    applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
        // Rearrange the views to put them in the right location.
        changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
            let view;
            let operation;
            if (record.previousIndex == null) { // Item added.
                const viewArgsFactory = () => itemContextFactory(record, adjustedPreviousIndex, currentIndex);
                view = this._insertView(viewArgsFactory, currentIndex, viewContainerRef, itemValueResolver(record));
                operation = view ? 1 /* INSERTED */ : 0 /* REPLACED */;
            }
            else if (currentIndex == null) { // Item removed.
                this._detachAndCacheView(adjustedPreviousIndex, viewContainerRef);
                operation = 3 /* REMOVED */;
            }
            else { // Item moved.
                view = this._moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, itemValueResolver(record));
                operation = 2 /* MOVED */;
            }
            if (itemViewChanged) {
                itemViewChanged({
                    context: view === null || view === void 0 ? void 0 : view.context,
                    operation,
                    record,
                });
            }
        });
    }
    detach() {
        for (const view of this._viewCache) {
            view.destroy();
        }
        this._viewCache = [];
    }
    /**
     * Inserts a view for a new item, either from the cache or by creating a new
     * one. Returns `undefined` if the item was inserted into a cached view.
     */
    _insertView(viewArgsFactory, currentIndex, viewContainerRef, value) {
        const cachedView = this._insertViewFromCache(currentIndex, viewContainerRef);
        if (cachedView) {
            cachedView.context.$implicit = value;
            return undefined;
        }
        const viewArgs = viewArgsFactory();
        return viewContainerRef.createEmbeddedView(viewArgs.templateRef, viewArgs.context, viewArgs.index);
    }
    /** Detaches the view at the given index and inserts into the view cache. */
    _detachAndCacheView(index, viewContainerRef) {
        const detachedView = viewContainerRef.detach(index);
        this._maybeCacheView(detachedView, viewContainerRef);
    }
    /** Moves view at the previous index to the current index. */
    _moveView(adjustedPreviousIndex, currentIndex, viewContainerRef, value) {
        const view = viewContainerRef.get(adjustedPreviousIndex);
        viewContainerRef.move(view, currentIndex);
        view.context.$implicit = value;
        return view;
    }
    /**
     * Cache the given detached view. If the cache is full, the view will be
     * destroyed.
     */
    _maybeCacheView(view, viewContainerRef) {
        if (this._viewCache.length < this.viewCacheSize) {
            this._viewCache.push(view);
        }
        else {
            const index = viewContainerRef.indexOf(view);
            // The host component could remove views from the container outside of
            // the view repeater. It's unlikely this will occur, but just in case,
            // destroy the view on its own, otherwise destroy it through the
            // container to ensure that all the references are removed.
            if (index === -1) {
                view.destroy();
            }
            else {
                viewContainerRef.remove(index);
            }
        }
    }
    /** Inserts a recycled view from the cache at the given index. */
    _insertViewFromCache(index, viewContainerRef) {
        const cachedView = this._viewCache.pop();
        if (cachedView) {
            viewContainerRef.insert(cachedView, index);
        }
        return cachedView || null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjeWNsZS12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9yZWN5Y2xlLXZpZXctcmVwZWF0ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBbUJIOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLE9BQU8sNEJBQTRCO0lBQXpDO1FBRUU7OztXQUdHO1FBQ0gsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFFM0I7Ozs7OztXQU1HO1FBQ0ssZUFBVSxHQUF5QixFQUFFLENBQUM7SUE4R2hELENBQUM7SUE1R0MsZ0NBQWdDO0lBQ2hDLFlBQVksQ0FBQyxPQUEyQixFQUMzQixnQkFBa0MsRUFDbEMsa0JBQTRELEVBQzVELGlCQUF1RCxFQUN2RCxlQUFnRDtRQUMzRCx5REFBeUQ7UUFDekQsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsTUFBK0IsRUFDL0IscUJBQW9DLEVBQ3BDLFlBQTJCLEVBQUUsRUFBRTtZQUN2RCxJQUFJLElBQW9DLENBQUM7WUFDekMsSUFBSSxTQUFpQyxDQUFDO1lBQ3RDLElBQUksTUFBTSxDQUFDLGFBQWEsSUFBSSxJQUFJLEVBQUUsRUFBRyxjQUFjO2dCQUNqRCxNQUFNLGVBQWUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FDNUMsTUFBTSxFQUFFLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxDQUFDO2dCQUNqRCxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsWUFBYSxFQUFFLGdCQUFnQixFQUNwRSxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsa0JBQWlDLENBQUMsaUJBQWdDLENBQUM7YUFDdEY7aUJBQU0sSUFBSSxZQUFZLElBQUksSUFBSSxFQUFFLEVBQUcsZ0JBQWdCO2dC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LEVBQ2IsZ0JBQWtDO1FBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDekMsSUFBSSxVQUFVLEVBQUU7WUFDZCxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsT0FBTyxVQUFVLElBQUksSUFBSSxDQUFDO0lBQzVCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgSXRlcmFibGVDaGFuZ2VzLFxyXG4gIFZpZXdDb250YWluZXJSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtcclxuICBfVmlld1JlcGVhdGVyLFxyXG4gIF9WaWV3UmVwZWF0ZXJJdGVtQ2hhbmdlZCxcclxuICBfVmlld1JlcGVhdGVySXRlbUNvbnRleHQsXHJcbiAgX1ZpZXdSZXBlYXRlckl0ZW1Db250ZXh0RmFjdG9yeSxcclxuICBfVmlld1JlcGVhdGVySXRlbUluc2VydEFyZ3MsXHJcbiAgX1ZpZXdSZXBlYXRlckl0ZW1WYWx1ZVJlc29sdmVyLFxyXG4gIF9WaWV3UmVwZWF0ZXJPcGVyYXRpb25cclxufSBmcm9tICcuL3ZpZXctcmVwZWF0ZXInO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBBIHJlcGVhdGVyIHRoYXQgY2FjaGVzIHZpZXdzIHdoZW4gdGhleSBhcmUgcmVtb3ZlZCBmcm9tIGFcclxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9LiBXaGVuIG5ldyBpdGVtcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyLFxyXG4gKiB0aGUgcmVwZWF0ZXIgd2lsbCByZXVzZSBvbmUgb2YgdGhlIGNhY2hlZCB2aWV3cyBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3XHJcbiAqIGVtYmVkZGVkIHZpZXcuIFJlY3ljbGluZyBjYWNoZWQgdmlld3MgcmVkdWNlcyB0aGUgcXVhbnRpdHkgb2YgZXhwZW5zaXZlIERPTVxyXG4gKiBpbnNlcnRzLlxyXG4gKlxyXG4gKiBAdGVtcGxhdGUgVCBUaGUgdHlwZSBmb3IgdGhlIGVtYmVkZGVkIHZpZXcncyAkaW1wbGljaXQgcHJvcGVydHkuXHJcbiAqIEB0ZW1wbGF0ZSBSIFRoZSB0eXBlIGZvciB0aGUgaXRlbSBpbiBlYWNoIEl0ZXJhYmxlRGlmZmVyIGNoYW5nZSByZWNvcmQuXHJcbiAqIEB0ZW1wbGF0ZSBDIFRoZSB0eXBlIGZvciB0aGUgY29udGV4dCBwYXNzZWQgdG8gZWFjaCBlbWJlZGRlZCB2aWV3LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIF9SZWN5Y2xlVmlld1JlcGVhdGVyU3RyYXRlZ3k8VCwgUiwgQyBleHRlbmRzIF9WaWV3UmVwZWF0ZXJJdGVtQ29udGV4dDxUPj5cclxuICAgIGltcGxlbWVudHMgX1ZpZXdSZXBlYXRlcjxULCBSLCBDPiB7XHJcbiAgLyoqXHJcbiAgICogVGhlIHNpemUgb2YgdGhlIGNhY2hlIHVzZWQgdG8gc3RvcmUgdW51c2VkIHZpZXdzLlxyXG4gICAqIFNldHRpbmcgdGhlIGNhY2hlIHNpemUgdG8gYDBgIHdpbGwgZGlzYWJsZSBjYWNoaW5nLiBEZWZhdWx0cyB0byAyMCB2aWV3cy5cclxuICAgKi9cclxuICB2aWV3Q2FjaGVTaXplOiBudW1iZXIgPSAyMDtcclxuXHJcbiAgLyoqXHJcbiAgICogVmlldyBjYWNoZSB0aGF0IHN0b3JlcyBlbWJlZGRlZCB2aWV3IGluc3RhbmNlcyB0aGF0IGhhdmUgYmVlbiBwcmV2aW91c2x5IHN0YW1wZWQgb3V0LFxyXG4gICAqIGJ1dCBkb24ndCBhcmUgbm90IGN1cnJlbnRseSByZW5kZXJlZC4gVGhlIHZpZXcgcmVwZWF0ZXIgd2lsbCByZXVzZSB0aGVzZSB2aWV3cyByYXRoZXIgdGhhblxyXG4gICAqIGNyZWF0aW5nIGJyYW5kIG5ldyBvbmVzLlxyXG4gICAqXHJcbiAgICogVE9ETyhtaWNoYWVsamFtZXNwYXJzb25zKSBJbnZlc3RpZ2F0ZSB3aGV0aGVyIHVzaW5nIGEgbGlua2VkIGxpc3Qgd291bGQgaW1wcm92ZSBwZXJmb3JtYW5jZS5cclxuICAgKi9cclxuICBwcml2YXRlIF92aWV3Q2FjaGU6IEVtYmVkZGVkVmlld1JlZjxDPltdID0gW107XHJcblxyXG4gIC8qKiBBcHBseSBjaGFuZ2VzIHRvIHRoZSBET00uICovXHJcbiAgYXBwbHlDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxSPixcclxuICAgICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuICAgICAgICAgICAgICAgaXRlbUNvbnRleHRGYWN0b3J5OiBfVmlld1JlcGVhdGVySXRlbUNvbnRleHRGYWN0b3J5PFQsIFIsIEM+LFxyXG4gICAgICAgICAgICAgICBpdGVtVmFsdWVSZXNvbHZlcjogX1ZpZXdSZXBlYXRlckl0ZW1WYWx1ZVJlc29sdmVyPFQsIFI+LFxyXG4gICAgICAgICAgICAgICBpdGVtVmlld0NoYW5nZWQ/OiBfVmlld1JlcGVhdGVySXRlbUNoYW5nZWQ8UiwgQz4pIHtcclxuICAgIC8vIFJlYXJyYW5nZSB0aGUgdmlld3MgdG8gcHV0IHRoZW0gaW4gdGhlIHJpZ2h0IGxvY2F0aW9uLlxyXG4gICAgY2hhbmdlcy5mb3JFYWNoT3BlcmF0aW9uKChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciB8IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleDogbnVtYmVyIHwgbnVsbCkgPT4ge1xyXG4gICAgICBsZXQgdmlldzogRW1iZWRkZWRWaWV3UmVmPEM+IHwgdW5kZWZpbmVkO1xyXG4gICAgICBsZXQgb3BlcmF0aW9uOiBfVmlld1JlcGVhdGVyT3BlcmF0aW9uO1xyXG4gICAgICBpZiAocmVjb3JkLnByZXZpb3VzSW5kZXggPT0gbnVsbCkgeyAgLy8gSXRlbSBhZGRlZC5cclxuICAgICAgICBjb25zdCB2aWV3QXJnc0ZhY3RvcnkgPSAoKSA9PiBpdGVtQ29udGV4dEZhY3RvcnkoXHJcbiAgICAgICAgICAgIHJlY29yZCwgYWRqdXN0ZWRQcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgICAgIHZpZXcgPSB0aGlzLl9pbnNlcnRWaWV3KHZpZXdBcmdzRmFjdG9yeSwgY3VycmVudEluZGV4ISwgdmlld0NvbnRhaW5lclJlZixcclxuICAgICAgICAgICAgaXRlbVZhbHVlUmVzb2x2ZXIocmVjb3JkKSk7XHJcbiAgICAgICAgb3BlcmF0aW9uID0gdmlldyA/IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uSU5TRVJURUQgOiBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLlJFUExBQ0VEO1xyXG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7ICAvLyBJdGVtIHJlbW92ZWQuXHJcbiAgICAgICAgdGhpcy5fZGV0YWNoQW5kQ2FjaGVWaWV3KGFkanVzdGVkUHJldmlvdXNJbmRleCEsIHZpZXdDb250YWluZXJSZWYpO1xyXG4gICAgICAgIG9wZXJhdGlvbiA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uUkVNT1ZFRDtcclxuICAgICAgfSBlbHNlIHsgIC8vIEl0ZW0gbW92ZWQuXHJcbiAgICAgICAgdmlldyA9IHRoaXMuX21vdmVWaWV3KGFkanVzdGVkUHJldmlvdXNJbmRleCEsIGN1cnJlbnRJbmRleCEsIHZpZXdDb250YWluZXJSZWYsXHJcbiAgICAgICAgICAgIGl0ZW1WYWx1ZVJlc29sdmVyKHJlY29yZCkpO1xyXG4gICAgICAgIG9wZXJhdGlvbiA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uTU9WRUQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpdGVtVmlld0NoYW5nZWQpIHtcclxuICAgICAgICBpdGVtVmlld0NoYW5nZWQoe1xyXG4gICAgICAgICAgY29udGV4dDogdmlldz8uY29udGV4dCxcclxuICAgICAgICAgIG9wZXJhdGlvbixcclxuICAgICAgICAgIHJlY29yZCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBkZXRhY2goKSB7XHJcbiAgICBmb3IgKGNvbnN0IHZpZXcgb2YgdGhpcy5fdmlld0NhY2hlKSB7XHJcbiAgICAgIHZpZXcuZGVzdHJveSgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fdmlld0NhY2hlID0gW107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnNlcnRzIGEgdmlldyBmb3IgYSBuZXcgaXRlbSwgZWl0aGVyIGZyb20gdGhlIGNhY2hlIG9yIGJ5IGNyZWF0aW5nIGEgbmV3XHJcbiAgICogb25lLiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIHRoZSBpdGVtIHdhcyBpbnNlcnRlZCBpbnRvIGEgY2FjaGVkIHZpZXcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfaW5zZXJ0Vmlldyh2aWV3QXJnc0ZhY3Rvcnk6ICgpID0+IF9WaWV3UmVwZWF0ZXJJdGVtSW5zZXJ0QXJnczxDPiwgY3VycmVudEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFQpOiBFbWJlZGRlZFZpZXdSZWY8Qz4gfCB1bmRlZmluZWQge1xyXG4gICAgY29uc3QgY2FjaGVkVmlldyA9IHRoaXMuX2luc2VydFZpZXdGcm9tQ2FjaGUoY3VycmVudEluZGV4ISwgdmlld0NvbnRhaW5lclJlZik7XHJcbiAgICBpZiAoY2FjaGVkVmlldykge1xyXG4gICAgICBjYWNoZWRWaWV3LmNvbnRleHQuJGltcGxpY2l0ID0gdmFsdWU7XHJcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgdmlld0FyZ3MgPSB2aWV3QXJnc0ZhY3RvcnkoKTtcclxuICAgIHJldHVybiB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhcclxuICAgICAgICB2aWV3QXJncy50ZW1wbGF0ZVJlZiwgdmlld0FyZ3MuY29udGV4dCwgdmlld0FyZ3MuaW5kZXgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIERldGFjaGVzIHRoZSB2aWV3IGF0IHRoZSBnaXZlbiBpbmRleCBhbmQgaW5zZXJ0cyBpbnRvIHRoZSB2aWV3IGNhY2hlLiAqL1xyXG4gIHByaXZhdGUgX2RldGFjaEFuZENhY2hlVmlldyhpbmRleDogbnVtYmVyLCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICBjb25zdCBkZXRhY2hlZFZpZXcgPSB2aWV3Q29udGFpbmVyUmVmLmRldGFjaChpbmRleCkgYXMgRW1iZWRkZWRWaWV3UmVmPEM+O1xyXG4gICAgdGhpcy5fbWF5YmVDYWNoZVZpZXcoZGV0YWNoZWRWaWV3LCB2aWV3Q29udGFpbmVyUmVmKTtcclxuICB9XHJcblxyXG4gIC8qKiBNb3ZlcyB2aWV3IGF0IHRoZSBwcmV2aW91cyBpbmRleCB0byB0aGUgY3VycmVudCBpbmRleC4gKi9cclxuICBwcml2YXRlIF9tb3ZlVmlldyhhZGp1c3RlZFByZXZpb3VzSW5kZXg6IG51bWJlciwgY3VycmVudEluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZiwgdmFsdWU6IFQpOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xyXG4gICAgY29uc3QgdmlldyA9IHZpZXdDb250YWluZXJSZWYuZ2V0KGFkanVzdGVkUHJldmlvdXNJbmRleCEpIGFzIEVtYmVkZGVkVmlld1JlZjxDPjtcclxuICAgIHZpZXdDb250YWluZXJSZWYubW92ZSh2aWV3LCBjdXJyZW50SW5kZXgpO1xyXG4gICAgdmlldy5jb250ZXh0LiRpbXBsaWNpdCA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIHZpZXc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWNoZSB0aGUgZ2l2ZW4gZGV0YWNoZWQgdmlldy4gSWYgdGhlIGNhY2hlIGlzIGZ1bGwsIHRoZSB2aWV3IHdpbGwgYmVcclxuICAgKiBkZXN0cm95ZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfbWF5YmVDYWNoZVZpZXcodmlldzogRW1iZWRkZWRWaWV3UmVmPEM+LCB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7XHJcbiAgICBpZiAodGhpcy5fdmlld0NhY2hlLmxlbmd0aCA8IHRoaXMudmlld0NhY2hlU2l6ZSkge1xyXG4gICAgICB0aGlzLl92aWV3Q2FjaGUucHVzaCh2aWV3KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdmlld0NvbnRhaW5lclJlZi5pbmRleE9mKHZpZXcpO1xyXG5cclxuICAgICAgLy8gVGhlIGhvc3QgY29tcG9uZW50IGNvdWxkIHJlbW92ZSB2aWV3cyBmcm9tIHRoZSBjb250YWluZXIgb3V0c2lkZSBvZlxyXG4gICAgICAvLyB0aGUgdmlldyByZXBlYXRlci4gSXQncyB1bmxpa2VseSB0aGlzIHdpbGwgb2NjdXIsIGJ1dCBqdXN0IGluIGNhc2UsXHJcbiAgICAgIC8vIGRlc3Ryb3kgdGhlIHZpZXcgb24gaXRzIG93biwgb3RoZXJ3aXNlIGRlc3Ryb3kgaXQgdGhyb3VnaCB0aGVcclxuICAgICAgLy8gY29udGFpbmVyIHRvIGVuc3VyZSB0aGF0IGFsbCB0aGUgcmVmZXJlbmNlcyBhcmUgcmVtb3ZlZC5cclxuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgICAgIHZpZXcuZGVzdHJveSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZpZXdDb250YWluZXJSZWYucmVtb3ZlKGluZGV4KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEluc2VydHMgYSByZWN5Y2xlZCB2aWV3IGZyb20gdGhlIGNhY2hlIGF0IHRoZSBnaXZlbiBpbmRleC4gKi9cclxuICBwcml2YXRlIF9pbnNlcnRWaWV3RnJvbUNhY2hlKGluZGV4OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKTogRW1iZWRkZWRWaWV3UmVmPEM+IHwgbnVsbCB7XHJcbiAgICBjb25zdCBjYWNoZWRWaWV3ID0gdGhpcy5fdmlld0NhY2hlLnBvcCgpO1xyXG4gICAgaWYgKGNhY2hlZFZpZXcpIHtcclxuICAgICAgdmlld0NvbnRhaW5lclJlZi5pbnNlcnQoY2FjaGVkVmlldywgaW5kZXgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNhY2hlZFZpZXcgfHwgbnVsbDtcclxuICB9XHJcbn1cclxuIl19