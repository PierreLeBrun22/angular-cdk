/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getMutableClientRect, adjustClientRect } from './client-rect';
/** Keeps track of the scroll position and dimensions of the parents of an element. */
export class ParentPositionTracker {
    constructor(_document, _viewportRuler) {
        this._document = _document;
        this._viewportRuler = _viewportRuler;
        /** Cached positions of the scrollable parent elements. */
        this.positions = new Map();
    }
    /** Clears the cached positions. */
    clear() {
        this.positions.clear();
    }
    /** Caches the positions. Should be called at the beginning of a drag sequence. */
    cache(elements) {
        this.clear();
        this.positions.set(this._document, {
            scrollPosition: this._viewportRuler.getViewportScrollPosition(),
        });
        elements.forEach(element => {
            this.positions.set(element, {
                scrollPosition: { top: element.scrollTop, left: element.scrollLeft },
                clientRect: getMutableClientRect(element)
            });
        });
    }
    /** Handles scrolling while a drag is taking place. */
    handleScroll(event) {
        const target = event.target;
        const cachedPosition = this.positions.get(target);
        if (!cachedPosition) {
            return null;
        }
        // Used when figuring out whether an element is inside the scroll parent. If the scrolled
        // parent is the `document`, we use the `documentElement`, because IE doesn't support
        // `contains` on the `document`.
        const scrolledParentNode = target === this._document ? target.documentElement : target;
        const scrollPosition = cachedPosition.scrollPosition;
        let newTop;
        let newLeft;
        if (target === this._document) {
            const viewportScrollPosition = this._viewportRuler.getViewportScrollPosition();
            newTop = viewportScrollPosition.top;
            newLeft = viewportScrollPosition.left;
        }
        else {
            newTop = target.scrollTop;
            newLeft = target.scrollLeft;
        }
        const topDifference = scrollPosition.top - newTop;
        const leftDifference = scrollPosition.left - newLeft;
        // Go through and update the cached positions of the scroll
        // parents that are inside the element that was scrolled.
        this.positions.forEach((position, node) => {
            if (position.clientRect && target !== node && scrolledParentNode.contains(node)) {
                adjustClientRect(position.clientRect, topDifference, leftDifference);
            }
        });
        scrollPosition.top = newTop;
        scrollPosition.left = newLeft;
        return { top: topDifference, left: leftDifference };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyZW50LXBvc2l0aW9uLXRyYWNrZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9wYXJlbnQtcG9zaXRpb24tdHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFHSCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFRckUsc0ZBQXNGO0FBQ3RGLE1BQU0sT0FBTyxxQkFBcUI7SUFPaEMsWUFBb0IsU0FBbUIsRUFBVSxjQUE2QjtRQUExRCxjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQVUsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFOOUUsMERBQTBEO1FBQ2pELGNBQVMsR0FBRyxJQUFJLEdBQUcsRUFHeEIsQ0FBQztJQUU0RSxDQUFDO0lBRWxGLG1DQUFtQztJQUNuQyxLQUFLO1FBQ0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLEtBQUssQ0FBQyxRQUFvRDtRQUN4RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2pDLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFO1NBQ2hFLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2dCQUMxQixjQUFjLEVBQUUsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBQztnQkFDbEUsVUFBVSxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQzthQUMxQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzREFBc0Q7SUFDdEQsWUFBWSxDQUFDLEtBQVk7UUFDdkIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQWdDLENBQUM7UUFDdEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFbEQsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQseUZBQXlGO1FBQ3pGLHFGQUFxRjtRQUNyRixnQ0FBZ0M7UUFDaEMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3ZGLE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUM7UUFDckQsSUFBSSxNQUFjLENBQUM7UUFDbkIsSUFBSSxPQUFlLENBQUM7UUFFcEIsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUM3QixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxjQUFlLENBQUMseUJBQXlCLEVBQUUsQ0FBQztZQUNoRixNQUFNLEdBQUcsc0JBQXNCLENBQUMsR0FBRyxDQUFDO1lBQ3BDLE9BQU8sR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUM7U0FDdkM7YUFBTTtZQUNMLE1BQU0sR0FBSSxNQUFzQixDQUFDLFNBQVMsQ0FBQztZQUMzQyxPQUFPLEdBQUksTUFBc0IsQ0FBQyxVQUFVLENBQUM7U0FDOUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNsRCxNQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUVyRCwyREFBMkQ7UUFDM0QseURBQXlEO1FBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ3hDLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0UsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7YUFDdEU7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQzVCLGNBQWMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBRTlCLE9BQU8sRUFBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcbmltcG9ydCB7Z2V0TXV0YWJsZUNsaWVudFJlY3QsIGFkanVzdENsaWVudFJlY3R9IGZyb20gJy4vY2xpZW50LXJlY3QnO1xyXG5cclxuLyoqIE9iamVjdCBob2xkaW5nIHRoZSBzY3JvbGwgcG9zaXRpb24gb2Ygc29tZXRoaW5nLiAqL1xyXG5pbnRlcmZhY2UgU2Nyb2xsUG9zaXRpb24ge1xyXG4gIHRvcDogbnVtYmVyO1xyXG4gIGxlZnQ6IG51bWJlcjtcclxufVxyXG5cclxuLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBzY3JvbGwgcG9zaXRpb24gYW5kIGRpbWVuc2lvbnMgb2YgdGhlIHBhcmVudHMgb2YgYW4gZWxlbWVudC4gKi9cclxuZXhwb3J0IGNsYXNzIFBhcmVudFBvc2l0aW9uVHJhY2tlciB7XHJcbiAgLyoqIENhY2hlZCBwb3NpdGlvbnMgb2YgdGhlIHNjcm9sbGFibGUgcGFyZW50IGVsZW1lbnRzLiAqL1xyXG4gIHJlYWRvbmx5IHBvc2l0aW9ucyA9IG5ldyBNYXA8RG9jdW1lbnR8SFRNTEVsZW1lbnQsIHtcclxuICAgIHNjcm9sbFBvc2l0aW9uOiBTY3JvbGxQb3NpdGlvbixcclxuICAgIGNsaWVudFJlY3Q/OiBDbGllbnRSZWN0XHJcbiAgfT4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50LCBwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyKSB7fVxyXG5cclxuICAvKiogQ2xlYXJzIHRoZSBjYWNoZWQgcG9zaXRpb25zLiAqL1xyXG4gIGNsZWFyKCkge1xyXG4gICAgdGhpcy5wb3NpdGlvbnMuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8qKiBDYWNoZXMgdGhlIHBvc2l0aW9ucy4gU2hvdWxkIGJlIGNhbGxlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgZHJhZyBzZXF1ZW5jZS4gKi9cclxuICBjYWNoZShlbGVtZW50czogSFRNTEVsZW1lbnRbXSB8IFJlYWRvbmx5QXJyYXk8SFRNTEVsZW1lbnQ+KSB7XHJcbiAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICB0aGlzLnBvc2l0aW9ucy5zZXQodGhpcy5fZG9jdW1lbnQsIHtcclxuICAgICAgc2Nyb2xsUG9zaXRpb246IHRoaXMuX3ZpZXdwb3J0UnVsZXIuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpLFxyXG4gICAgfSk7XHJcblxyXG4gICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcclxuICAgICAgdGhpcy5wb3NpdGlvbnMuc2V0KGVsZW1lbnQsIHtcclxuICAgICAgICBzY3JvbGxQb3NpdGlvbjoge3RvcDogZWxlbWVudC5zY3JvbGxUb3AsIGxlZnQ6IGVsZW1lbnQuc2Nyb2xsTGVmdH0sXHJcbiAgICAgICAgY2xpZW50UmVjdDogZ2V0TXV0YWJsZUNsaWVudFJlY3QoZWxlbWVudClcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBIYW5kbGVzIHNjcm9sbGluZyB3aGlsZSBhIGRyYWcgaXMgdGFraW5nIHBsYWNlLiAqL1xyXG4gIGhhbmRsZVNjcm9sbChldmVudDogRXZlbnQpOiBTY3JvbGxQb3NpdGlvbiB8IG51bGwge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50IHwgRG9jdW1lbnQ7XHJcbiAgICBjb25zdCBjYWNoZWRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25zLmdldCh0YXJnZXQpO1xyXG5cclxuICAgIGlmICghY2FjaGVkUG9zaXRpb24pIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlZCB3aGVuIGZpZ3VyaW5nIG91dCB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgaW5zaWRlIHRoZSBzY3JvbGwgcGFyZW50LiBJZiB0aGUgc2Nyb2xsZWRcclxuICAgIC8vIHBhcmVudCBpcyB0aGUgYGRvY3VtZW50YCwgd2UgdXNlIHRoZSBgZG9jdW1lbnRFbGVtZW50YCwgYmVjYXVzZSBJRSBkb2Vzbid0IHN1cHBvcnRcclxuICAgIC8vIGBjb250YWluc2Agb24gdGhlIGBkb2N1bWVudGAuXHJcbiAgICBjb25zdCBzY3JvbGxlZFBhcmVudE5vZGUgPSB0YXJnZXQgPT09IHRoaXMuX2RvY3VtZW50ID8gdGFyZ2V0LmRvY3VtZW50RWxlbWVudCA6IHRhcmdldDtcclxuICAgIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gY2FjaGVkUG9zaXRpb24uc2Nyb2xsUG9zaXRpb247XHJcbiAgICBsZXQgbmV3VG9wOiBudW1iZXI7XHJcbiAgICBsZXQgbmV3TGVmdDogbnVtYmVyO1xyXG5cclxuICAgIGlmICh0YXJnZXQgPT09IHRoaXMuX2RvY3VtZW50KSB7XHJcbiAgICAgIGNvbnN0IHZpZXdwb3J0U2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyIS5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCk7XHJcbiAgICAgIG5ld1RvcCA9IHZpZXdwb3J0U2Nyb2xsUG9zaXRpb24udG9wO1xyXG4gICAgICBuZXdMZWZ0ID0gdmlld3BvcnRTY3JvbGxQb3NpdGlvbi5sZWZ0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbmV3VG9wID0gKHRhcmdldCBhcyBIVE1MRWxlbWVudCkuc2Nyb2xsVG9wO1xyXG4gICAgICBuZXdMZWZ0ID0gKHRhcmdldCBhcyBIVE1MRWxlbWVudCkuc2Nyb2xsTGVmdDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0b3BEaWZmZXJlbmNlID0gc2Nyb2xsUG9zaXRpb24udG9wIC0gbmV3VG9wO1xyXG4gICAgY29uc3QgbGVmdERpZmZlcmVuY2UgPSBzY3JvbGxQb3NpdGlvbi5sZWZ0IC0gbmV3TGVmdDtcclxuXHJcbiAgICAvLyBHbyB0aHJvdWdoIGFuZCB1cGRhdGUgdGhlIGNhY2hlZCBwb3NpdGlvbnMgb2YgdGhlIHNjcm9sbFxyXG4gICAgLy8gcGFyZW50cyB0aGF0IGFyZSBpbnNpZGUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgc2Nyb2xsZWQuXHJcbiAgICB0aGlzLnBvc2l0aW9ucy5mb3JFYWNoKChwb3NpdGlvbiwgbm9kZSkgPT4ge1xyXG4gICAgICBpZiAocG9zaXRpb24uY2xpZW50UmVjdCAmJiB0YXJnZXQgIT09IG5vZGUgJiYgc2Nyb2xsZWRQYXJlbnROb2RlLmNvbnRhaW5zKG5vZGUpKSB7XHJcbiAgICAgICAgYWRqdXN0Q2xpZW50UmVjdChwb3NpdGlvbi5jbGllbnRSZWN0LCB0b3BEaWZmZXJlbmNlLCBsZWZ0RGlmZmVyZW5jZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHNjcm9sbFBvc2l0aW9uLnRvcCA9IG5ld1RvcDtcclxuICAgIHNjcm9sbFBvc2l0aW9uLmxlZnQgPSBuZXdMZWZ0O1xyXG5cclxuICAgIHJldHVybiB7dG9wOiB0b3BEaWZmZXJlbmNlLCBsZWZ0OiBsZWZ0RGlmZmVyZW5jZX07XHJcbiAgfVxyXG59XHJcbiJdfQ==