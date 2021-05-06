/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { supportsScrollBehavior } from '@angular/cdk/platform';
const scrollBehaviorSupported = supportsScrollBehavior();
/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy {
    constructor(_viewportRuler, document) {
        this._viewportRuler = _viewportRuler;
        this._previousHTMLStyles = { top: '', left: '' };
        this._isEnabled = false;
        this._document = document;
    }
    /** Attaches this scroll strategy to an overlay. */
    attach() { }
    /** Blocks page-level scroll while the attached overlay is open. */
    enable() {
        if (this._canBeEnabled()) {
            const root = this._document.documentElement;
            this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();
            // Cache the previous inline styles in case the user had set them.
            this._previousHTMLStyles.left = root.style.left || '';
            this._previousHTMLStyles.top = root.style.top || '';
            // Note: we're using the `html` node, instead of the `body`, because the `body` may
            // have the user agent margin, whereas the `html` is guaranteed not to have one.
            root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
            root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
            root.classList.add('cdk-global-scrollblock');
            this._isEnabled = true;
        }
    }
    /** Unblocks page-level scroll while the attached overlay is open. */
    disable() {
        if (this._isEnabled) {
            const html = this._document.documentElement;
            const body = this._document.body;
            const htmlStyle = html.style;
            const bodyStyle = body.style;
            const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
            const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';
            this._isEnabled = false;
            htmlStyle.left = this._previousHTMLStyles.left;
            htmlStyle.top = this._previousHTMLStyles.top;
            html.classList.remove('cdk-global-scrollblock');
            // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
            // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
            // Note that we don't mutate the property if the browser doesn't support `scroll-behavior`,
            // because it can throw off feature detections in `supportsScrollBehavior` which
            // checks for `'scrollBehavior' in documentElement.style`.
            if (scrollBehaviorSupported) {
                htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';
            }
            window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);
            if (scrollBehaviorSupported) {
                htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
                bodyStyle.scrollBehavior = previousBodyScrollBehavior;
            }
        }
    }
    _canBeEnabled() {
        // Since the scroll strategies can't be singletons, we have to use a global CSS class
        // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
        // scrolling multiple times.
        const html = this._document.documentElement;
        if (html.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
            return false;
        }
        const body = this._document.body;
        const viewport = this._viewportRuler.getViewportSize();
        return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2stc2Nyb2xsLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Njcm9sbC9ibG9jay1zY3JvbGwtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFN0QsTUFBTSx1QkFBdUIsR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0FBRXpEOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQU05QixZQUFvQixjQUE2QixFQUFFLFFBQWE7UUFBNUMsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFMekMsd0JBQW1CLEdBQUcsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUUxQyxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBSXpCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0lBQzVCLENBQUM7SUFFRCxtREFBbUQ7SUFDbkQsTUFBTSxLQUFJLENBQUM7SUFFWCxtRUFBbUU7SUFDbkUsTUFBTTtRQUNKLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZ0IsQ0FBQztZQUU3QyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO1lBRS9FLGtFQUFrRTtZQUNsRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUVwRCxtRkFBbUY7WUFDbkYsZ0ZBQWdGO1lBQ2hGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLG1CQUFtQixDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQscUVBQXFFO0lBQ3JFLE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFnQixDQUFDO1lBQzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSyxDQUFDO1lBQ2xDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUM3QixNQUFNLDBCQUEwQixHQUFHLFNBQVMsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO1lBQ2xFLE1BQU0sMEJBQTBCLEdBQUcsU0FBUyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7WUFFbEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFFeEIsU0FBUyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDO1lBQy9DLFNBQVMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztZQUM3QyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBRWhELDBGQUEwRjtZQUMxRix1RUFBdUU7WUFDdkUsMkZBQTJGO1lBQzNGLGdGQUFnRjtZQUNoRiwwREFBMEQ7WUFDMUQsSUFBSSx1QkFBdUIsRUFBRTtnQkFDM0IsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQzthQUM5RDtZQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFFbkYsSUFBSSx1QkFBdUIsRUFBRTtnQkFDM0IsU0FBUyxDQUFDLGNBQWMsR0FBRywwQkFBMEIsQ0FBQztnQkFDdEQsU0FBUyxDQUFDLGNBQWMsR0FBRywwQkFBMEIsQ0FBQzthQUN2RDtTQUNGO0lBQ0gsQ0FBQztJQUVPLGFBQWE7UUFDbkIscUZBQXFGO1FBQ3JGLDhFQUE4RTtRQUM5RSw0QkFBNEI7UUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFnQixDQUFDO1FBRTdDLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3hFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztRQUNqQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUNsRixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vc2Nyb2xsLXN0cmF0ZWd5JztcclxuaW1wb3J0IHtWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtjb2VyY2VDc3NQaXhlbFZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge3N1cHBvcnRzU2Nyb2xsQmVoYXZpb3J9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcblxyXG5jb25zdCBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCA9IHN1cHBvcnRzU2Nyb2xsQmVoYXZpb3IoKTtcclxuXHJcbi8qKlxyXG4gKiBTdHJhdGVneSB0aGF0IHdpbGwgcHJldmVudCB0aGUgdXNlciBmcm9tIHNjcm9sbGluZyB3aGlsZSB0aGUgb3ZlcmxheSBpcyB2aXNpYmxlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEJsb2NrU2Nyb2xsU3RyYXRlZ3kgaW1wbGVtZW50cyBTY3JvbGxTdHJhdGVneSB7XHJcbiAgcHJpdmF0ZSBfcHJldmlvdXNIVE1MU3R5bGVzID0ge3RvcDogJycsIGxlZnQ6ICcnfTtcclxuICBwcml2YXRlIF9wcmV2aW91c1Njcm9sbFBvc2l0aW9uOiB7dG9wOiBudW1iZXIsIGxlZnQ6IG51bWJlcn07XHJcbiAgcHJpdmF0ZSBfaXNFbmFibGVkID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLCBkb2N1bWVudDogYW55KSB7XHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqIEF0dGFjaGVzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IHRvIGFuIG92ZXJsYXkuICovXHJcbiAgYXR0YWNoKCkge31cclxuXHJcbiAgLyoqIEJsb2NrcyBwYWdlLWxldmVsIHNjcm9sbCB3aGlsZSB0aGUgYXR0YWNoZWQgb3ZlcmxheSBpcyBvcGVuLiAqL1xyXG4gIGVuYWJsZSgpIHtcclxuICAgIGlmICh0aGlzLl9jYW5CZUVuYWJsZWQoKSkge1xyXG4gICAgICBjb25zdCByb290ID0gdGhpcy5fZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ITtcclxuXHJcbiAgICAgIHRoaXMuX3ByZXZpb3VzU2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcclxuXHJcbiAgICAgIC8vIENhY2hlIHRoZSBwcmV2aW91cyBpbmxpbmUgc3R5bGVzIGluIGNhc2UgdGhlIHVzZXIgaGFkIHNldCB0aGVtLlxyXG4gICAgICB0aGlzLl9wcmV2aW91c0hUTUxTdHlsZXMubGVmdCA9IHJvb3Quc3R5bGUubGVmdCB8fCAnJztcclxuICAgICAgdGhpcy5fcHJldmlvdXNIVE1MU3R5bGVzLnRvcCA9IHJvb3Quc3R5bGUudG9wIHx8ICcnO1xyXG5cclxuICAgICAgLy8gTm90ZTogd2UncmUgdXNpbmcgdGhlIGBodG1sYCBub2RlLCBpbnN0ZWFkIG9mIHRoZSBgYm9keWAsIGJlY2F1c2UgdGhlIGBib2R5YCBtYXlcclxuICAgICAgLy8gaGF2ZSB0aGUgdXNlciBhZ2VudCBtYXJnaW4sIHdoZXJlYXMgdGhlIGBodG1sYCBpcyBndWFyYW50ZWVkIG5vdCB0byBoYXZlIG9uZS5cclxuICAgICAgcm9vdC5zdHlsZS5sZWZ0ID0gY29lcmNlQ3NzUGl4ZWxWYWx1ZSgtdGhpcy5fcHJldmlvdXNTY3JvbGxQb3NpdGlvbi5sZWZ0KTtcclxuICAgICAgcm9vdC5zdHlsZS50b3AgPSBjb2VyY2VDc3NQaXhlbFZhbHVlKC10aGlzLl9wcmV2aW91c1Njcm9sbFBvc2l0aW9uLnRvcCk7XHJcbiAgICAgIHJvb3QuY2xhc3NMaXN0LmFkZCgnY2RrLWdsb2JhbC1zY3JvbGxibG9jaycpO1xyXG4gICAgICB0aGlzLl9pc0VuYWJsZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFVuYmxvY2tzIHBhZ2UtbGV2ZWwgc2Nyb2xsIHdoaWxlIHRoZSBhdHRhY2hlZCBvdmVybGF5IGlzIG9wZW4uICovXHJcbiAgZGlzYWJsZSgpIHtcclxuICAgIGlmICh0aGlzLl9pc0VuYWJsZWQpIHtcclxuICAgICAgY29uc3QgaHRtbCA9IHRoaXMuX2RvY3VtZW50LmRvY3VtZW50RWxlbWVudCE7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLl9kb2N1bWVudC5ib2R5ITtcclxuICAgICAgY29uc3QgaHRtbFN0eWxlID0gaHRtbC5zdHlsZTtcclxuICAgICAgY29uc3QgYm9keVN0eWxlID0gYm9keS5zdHlsZTtcclxuICAgICAgY29uc3QgcHJldmlvdXNIdG1sU2Nyb2xsQmVoYXZpb3IgPSBodG1sU3R5bGUuc2Nyb2xsQmVoYXZpb3IgfHwgJyc7XHJcbiAgICAgIGNvbnN0IHByZXZpb3VzQm9keVNjcm9sbEJlaGF2aW9yID0gYm9keVN0eWxlLnNjcm9sbEJlaGF2aW9yIHx8ICcnO1xyXG5cclxuICAgICAgdGhpcy5faXNFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBodG1sU3R5bGUubGVmdCA9IHRoaXMuX3ByZXZpb3VzSFRNTFN0eWxlcy5sZWZ0O1xyXG4gICAgICBodG1sU3R5bGUudG9wID0gdGhpcy5fcHJldmlvdXNIVE1MU3R5bGVzLnRvcDtcclxuICAgICAgaHRtbC5jbGFzc0xpc3QucmVtb3ZlKCdjZGstZ2xvYmFsLXNjcm9sbGJsb2NrJyk7XHJcblxyXG4gICAgICAvLyBEaXNhYmxlIHVzZXItZGVmaW5lZCBzbW9vdGggc2Nyb2xsaW5nIHRlbXBvcmFyaWx5IHdoaWxlIHdlIHJlc3RvcmUgdGhlIHNjcm9sbCBwb3NpdGlvbi5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0NTUy9zY3JvbGwtYmVoYXZpb3JcclxuICAgICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IG11dGF0ZSB0aGUgcHJvcGVydHkgaWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IGBzY3JvbGwtYmVoYXZpb3JgLFxyXG4gICAgICAvLyBiZWNhdXNlIGl0IGNhbiB0aHJvdyBvZmYgZmVhdHVyZSBkZXRlY3Rpb25zIGluIGBzdXBwb3J0c1Njcm9sbEJlaGF2aW9yYCB3aGljaFxyXG4gICAgICAvLyBjaGVja3MgZm9yIGAnc2Nyb2xsQmVoYXZpb3InIGluIGRvY3VtZW50RWxlbWVudC5zdHlsZWAuXHJcbiAgICAgIGlmIChzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCkge1xyXG4gICAgICAgIGh0bWxTdHlsZS5zY3JvbGxCZWhhdmlvciA9IGJvZHlTdHlsZS5zY3JvbGxCZWhhdmlvciA9ICdhdXRvJztcclxuICAgICAgfVxyXG5cclxuICAgICAgd2luZG93LnNjcm9sbCh0aGlzLl9wcmV2aW91c1Njcm9sbFBvc2l0aW9uLmxlZnQsIHRoaXMuX3ByZXZpb3VzU2Nyb2xsUG9zaXRpb24udG9wKTtcclxuXHJcbiAgICAgIGlmIChzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCkge1xyXG4gICAgICAgIGh0bWxTdHlsZS5zY3JvbGxCZWhhdmlvciA9IHByZXZpb3VzSHRtbFNjcm9sbEJlaGF2aW9yO1xyXG4gICAgICAgIGJvZHlTdHlsZS5zY3JvbGxCZWhhdmlvciA9IHByZXZpb3VzQm9keVNjcm9sbEJlaGF2aW9yO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9jYW5CZUVuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICAvLyBTaW5jZSB0aGUgc2Nyb2xsIHN0cmF0ZWdpZXMgY2FuJ3QgYmUgc2luZ2xldG9ucywgd2UgaGF2ZSB0byB1c2UgYSBnbG9iYWwgQ1NTIGNsYXNzXHJcbiAgICAvLyAoYGNkay1nbG9iYWwtc2Nyb2xsYmxvY2tgKSB0byBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCB0cnkgdG8gZGlzYWJsZSBnbG9iYWxcclxuICAgIC8vIHNjcm9sbGluZyBtdWx0aXBsZSB0aW1lcy5cclxuICAgIGNvbnN0IGh0bWwgPSB0aGlzLl9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhO1xyXG5cclxuICAgIGlmIChodG1sLmNsYXNzTGlzdC5jb250YWlucygnY2RrLWdsb2JhbC1zY3JvbGxibG9jaycpIHx8IHRoaXMuX2lzRW5hYmxlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYm9keSA9IHRoaXMuX2RvY3VtZW50LmJvZHk7XHJcbiAgICBjb25zdCB2aWV3cG9ydCA9IHRoaXMuX3ZpZXdwb3J0UnVsZXIuZ2V0Vmlld3BvcnRTaXplKCk7XHJcbiAgICByZXR1cm4gYm9keS5zY3JvbGxIZWlnaHQgPiB2aWV3cG9ydC5oZWlnaHQgfHwgYm9keS5zY3JvbGxXaWR0aCA+IHZpZXdwb3J0LndpZHRoO1xyXG4gIH1cclxufVxyXG4iXX0=