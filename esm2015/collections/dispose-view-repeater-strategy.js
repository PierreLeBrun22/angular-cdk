/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A repeater that destroys views when they are removed from a
 * {@link ViewContainerRef}. When new items are inserted into the container,
 * the repeater will always construct a new embedded view for each item.
 *
 * @template T The type for the embedded view's $implicit property.
 * @template R The type for the item in each IterableDiffer change record.
 * @template C The type for the context passed to each embedded view.
 */
export class _DisposeViewRepeaterStrategy {
    applyChanges(changes, viewContainerRef, itemContextFactory, itemValueResolver, itemViewChanged) {
        changes.forEachOperation((record, adjustedPreviousIndex, currentIndex) => {
            let view;
            let operation;
            if (record.previousIndex == null) {
                const insertContext = itemContextFactory(record, adjustedPreviousIndex, currentIndex);
                view = viewContainerRef.createEmbeddedView(insertContext.templateRef, insertContext.context, insertContext.index);
                operation = 1 /* INSERTED */;
            }
            else if (currentIndex == null) {
                viewContainerRef.remove(adjustedPreviousIndex);
                operation = 3 /* REMOVED */;
            }
            else {
                view = viewContainerRef.get(adjustedPreviousIndex);
                viewContainerRef.move(view, currentIndex);
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzcG9zZS12aWV3LXJlcGVhdGVyLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9kaXNwb3NlLXZpZXctcmVwZWF0ZXItc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBaUJIOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxPQUFPLDRCQUE0QjtJQUV2QyxZQUFZLENBQUMsT0FBMkIsRUFDM0IsZ0JBQWtDLEVBQ2xDLGtCQUE0RCxFQUM1RCxpQkFBdUQsRUFDdkQsZUFBZ0Q7UUFDM0QsT0FBTyxDQUFDLGdCQUFnQixDQUNwQixDQUFDLE1BQStCLEVBQy9CLHFCQUFvQyxFQUNwQyxZQUEyQixFQUFFLEVBQUU7WUFDOUIsSUFBSSxJQUFvQyxDQUFDO1lBQ3pDLElBQUksU0FBaUMsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO2dCQUNoQyxNQUFNLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQ3RGLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FDdEMsYUFBYSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDM0UsU0FBUyxtQkFBa0MsQ0FBQzthQUM3QztpQkFBTSxJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7Z0JBQy9CLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxxQkFBc0IsQ0FBQyxDQUFDO2dCQUNoRCxTQUFTLGtCQUFpQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNMLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMscUJBQXNCLENBQXVCLENBQUM7Z0JBQzFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLFNBQVMsZ0JBQStCLENBQUM7YUFDMUM7WUFFRCxJQUFJLGVBQWUsRUFBRTtnQkFDbkIsZUFBZSxDQUFDO29CQUNkLE9BQU8sRUFBRSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsT0FBTztvQkFDdEIsU0FBUztvQkFDVCxNQUFNO2lCQUNQLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsTUFBTTtJQUNOLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBFbWJlZGRlZFZpZXdSZWYsXHJcbiAgSXRlcmFibGVDaGFuZ2VSZWNvcmQsXHJcbiAgSXRlcmFibGVDaGFuZ2VzLFxyXG4gIFZpZXdDb250YWluZXJSZWZcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtcclxuICBfVmlld1JlcGVhdGVyLFxyXG4gIF9WaWV3UmVwZWF0ZXJJdGVtQ2hhbmdlZCxcclxuICBfVmlld1JlcGVhdGVySXRlbUNvbnRleHQsXHJcbiAgX1ZpZXdSZXBlYXRlckl0ZW1Db250ZXh0RmFjdG9yeSxcclxuICBfVmlld1JlcGVhdGVySXRlbVZhbHVlUmVzb2x2ZXIsXHJcbiAgX1ZpZXdSZXBlYXRlck9wZXJhdGlvblxyXG59IGZyb20gJy4vdmlldy1yZXBlYXRlcic7XHJcblxyXG4vKipcclxuICogQSByZXBlYXRlciB0aGF0IGRlc3Ryb3lzIHZpZXdzIHdoZW4gdGhleSBhcmUgcmVtb3ZlZCBmcm9tIGFcclxuICoge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9LiBXaGVuIG5ldyBpdGVtcyBhcmUgaW5zZXJ0ZWQgaW50byB0aGUgY29udGFpbmVyLFxyXG4gKiB0aGUgcmVwZWF0ZXIgd2lsbCBhbHdheXMgY29uc3RydWN0IGEgbmV3IGVtYmVkZGVkIHZpZXcgZm9yIGVhY2ggaXRlbS5cclxuICpcclxuICogQHRlbXBsYXRlIFQgVGhlIHR5cGUgZm9yIHRoZSBlbWJlZGRlZCB2aWV3J3MgJGltcGxpY2l0IHByb3BlcnR5LlxyXG4gKiBAdGVtcGxhdGUgUiBUaGUgdHlwZSBmb3IgdGhlIGl0ZW0gaW4gZWFjaCBJdGVyYWJsZURpZmZlciBjaGFuZ2UgcmVjb3JkLlxyXG4gKiBAdGVtcGxhdGUgQyBUaGUgdHlwZSBmb3IgdGhlIGNvbnRleHQgcGFzc2VkIHRvIGVhY2ggZW1iZWRkZWQgdmlldy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBfRGlzcG9zZVZpZXdSZXBlYXRlclN0cmF0ZWd5PFQsIFIsIEMgZXh0ZW5kcyBfVmlld1JlcGVhdGVySXRlbUNvbnRleHQ8VD4+XHJcbiAgICBpbXBsZW1lbnRzIF9WaWV3UmVwZWF0ZXI8VCwgUiwgQz4ge1xyXG4gIGFwcGx5Q2hhbmdlcyhjaGFuZ2VzOiBJdGVyYWJsZUNoYW5nZXM8Uj4sXHJcbiAgICAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXHJcbiAgICAgICAgICAgICAgIGl0ZW1Db250ZXh0RmFjdG9yeTogX1ZpZXdSZXBlYXRlckl0ZW1Db250ZXh0RmFjdG9yeTxULCBSLCBDPixcclxuICAgICAgICAgICAgICAgaXRlbVZhbHVlUmVzb2x2ZXI6IF9WaWV3UmVwZWF0ZXJJdGVtVmFsdWVSZXNvbHZlcjxULCBSPixcclxuICAgICAgICAgICAgICAgaXRlbVZpZXdDaGFuZ2VkPzogX1ZpZXdSZXBlYXRlckl0ZW1DaGFuZ2VkPFIsIEM+KSB7XHJcbiAgICBjaGFuZ2VzLmZvckVhY2hPcGVyYXRpb24oXHJcbiAgICAgICAgKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmQ8Uj4sXHJcbiAgICAgICAgIGFkanVzdGVkUHJldmlvdXNJbmRleDogbnVtYmVyIHwgbnVsbCxcclxuICAgICAgICAgY3VycmVudEluZGV4OiBudW1iZXIgfCBudWxsKSA9PiB7XHJcbiAgICAgICAgICBsZXQgdmlldzogRW1iZWRkZWRWaWV3UmVmPEM+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgbGV0IG9wZXJhdGlvbjogX1ZpZXdSZXBlYXRlck9wZXJhdGlvbjtcclxuICAgICAgICAgIGlmIChyZWNvcmQucHJldmlvdXNJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGluc2VydENvbnRleHQgPSBpdGVtQ29udGV4dEZhY3RvcnkocmVjb3JkLCBhZGp1c3RlZFByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgIHZpZXcgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhcclxuICAgICAgICAgICAgICAgIGluc2VydENvbnRleHQudGVtcGxhdGVSZWYsIGluc2VydENvbnRleHQuY29udGV4dCwgaW5zZXJ0Q29udGV4dC5pbmRleCk7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbiA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uSU5TRVJURUQ7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRJbmRleCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWYucmVtb3ZlKGFkanVzdGVkUHJldmlvdXNJbmRleCEpO1xyXG4gICAgICAgICAgICBvcGVyYXRpb24gPSBfVmlld1JlcGVhdGVyT3BlcmF0aW9uLlJFTU9WRUQ7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2aWV3ID0gdmlld0NvbnRhaW5lclJlZi5nZXQoYWRqdXN0ZWRQcmV2aW91c0luZGV4ISkgYXMgRW1iZWRkZWRWaWV3UmVmPEM+O1xyXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmLm1vdmUodmlldyEsIGN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbiA9IF9WaWV3UmVwZWF0ZXJPcGVyYXRpb24uTU9WRUQ7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGl0ZW1WaWV3Q2hhbmdlZCkge1xyXG4gICAgICAgICAgICBpdGVtVmlld0NoYW5nZWQoe1xyXG4gICAgICAgICAgICAgIGNvbnRleHQ6IHZpZXc/LmNvbnRleHQsXHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uLFxyXG4gICAgICAgICAgICAgIHJlY29yZCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBkZXRhY2goKSB7XHJcbiAgfVxyXG59XHJcbiJdfQ==