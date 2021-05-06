/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { closest } from './polyfill';
/**
 * Lightweight FocusTrapInertStrategy that adds a document focus event
 * listener to redirect focus back inside the FocusTrap.
 */
export class EventListenerFocusTrapInertStrategy {
    constructor() {
        /** Focus event handler. */
        this._listener = null;
    }
    /** Adds a document event listener that keeps focus inside the FocusTrap. */
    preventFocus(focusTrap) {
        // Ensure there's only one listener per document
        if (this._listener) {
            focusTrap._document.removeEventListener('focus', this._listener, true);
        }
        this._listener = (e) => this._trapFocus(focusTrap, e);
        focusTrap._ngZone.runOutsideAngular(() => {
            focusTrap._document.addEventListener('focus', this._listener, true);
        });
    }
    /** Removes the event listener added in preventFocus. */
    allowFocus(focusTrap) {
        if (!this._listener) {
            return;
        }
        focusTrap._document.removeEventListener('focus', this._listener, true);
        this._listener = null;
    }
    /**
     * Refocuses the first element in the FocusTrap if the focus event target was outside
     * the FocusTrap.
     *
     * This is an event listener callback. The event listener is added in runOutsideAngular,
     * so all this code runs outside Angular as well.
     */
    _trapFocus(focusTrap, event) {
        const target = event.target;
        const focusTrapRoot = focusTrap._element;
        // Don't refocus if target was in an overlay, because the overlay might be associated
        // with an element inside the FocusTrap, ex. mat-select.
        if (!focusTrapRoot.contains(target) && closest(target, 'div.cdk-overlay-pane') === null) {
            // Some legacy FocusTrap usages have logic that focuses some element on the page
            // just before FocusTrap is destroyed. For backwards compatibility, wait
            // to be sure FocusTrap is still enabled before refocusing.
            setTimeout(() => {
                // Check whether focus wasn't put back into the focus trap while the timeout was pending.
                if (focusTrap.enabled && !focusTrapRoot.contains(focusTrap._document.activeElement)) {
                    focusTrap.focusFirstTabbableElement();
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtbGlzdGVuZXItaW5lcnQtc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvZm9jdXMtdHJhcC9ldmVudC1saXN0ZW5lci1pbmVydC1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRW5DOzs7R0FHRztBQUNILE1BQU0sT0FBTyxtQ0FBbUM7SUFBaEQ7UUFDRSwyQkFBMkI7UUFDbkIsY0FBUyxHQUFxQyxJQUFJLENBQUM7SUFpRDdELENBQUM7SUEvQ0MsNEVBQTRFO0lBQzVFLFlBQVksQ0FBQyxTQUFnQztRQUMzQyxnREFBZ0Q7UUFDaEQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2xCLFNBQVMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDekU7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRSxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUN2QyxTQUFTLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHdEQUF3RDtJQUN4RCxVQUFVLENBQUMsU0FBZ0M7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsT0FBTztTQUNSO1FBQ0QsU0FBUyxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssVUFBVSxDQUFDLFNBQWdDLEVBQUUsS0FBaUI7UUFDcEUsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQXFCLENBQUM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUV6QyxxRkFBcUY7UUFDckYsd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUUsc0JBQXNCLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDckYsZ0ZBQWdGO1lBQ2hGLHdFQUF3RTtZQUN4RSwyREFBMkQ7WUFDM0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDZCx5RkFBeUY7Z0JBQ3pGLElBQUksU0FBUyxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRTtvQkFDbkYsU0FBUyxDQUFDLHlCQUF5QixFQUFFLENBQUM7aUJBQ3ZDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtGb2N1c1RyYXBJbmVydFN0cmF0ZWd5fSBmcm9tICcuL2ZvY3VzLXRyYXAtaW5lcnQtc3RyYXRlZ3knO1xyXG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcH0gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcCc7XHJcbmltcG9ydCB7Y2xvc2VzdH0gZnJvbSAnLi9wb2x5ZmlsbCc7XHJcblxyXG4vKipcclxuICogTGlnaHR3ZWlnaHQgRm9jdXNUcmFwSW5lcnRTdHJhdGVneSB0aGF0IGFkZHMgYSBkb2N1bWVudCBmb2N1cyBldmVudFxyXG4gKiBsaXN0ZW5lciB0byByZWRpcmVjdCBmb2N1cyBiYWNrIGluc2lkZSB0aGUgRm9jdXNUcmFwLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50TGlzdGVuZXJGb2N1c1RyYXBJbmVydFN0cmF0ZWd5IGltcGxlbWVudHMgRm9jdXNUcmFwSW5lcnRTdHJhdGVneSB7XHJcbiAgLyoqIEZvY3VzIGV2ZW50IGhhbmRsZXIuICovXHJcbiAgcHJpdmF0ZSBfbGlzdGVuZXI6ICgoZTogRm9jdXNFdmVudCkgPT4gdm9pZCkgfCBudWxsID0gbnVsbDtcclxuXHJcbiAgLyoqIEFkZHMgYSBkb2N1bWVudCBldmVudCBsaXN0ZW5lciB0aGF0IGtlZXBzIGZvY3VzIGluc2lkZSB0aGUgRm9jdXNUcmFwLiAqL1xyXG4gIHByZXZlbnRGb2N1cyhmb2N1c1RyYXA6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcCk6IHZvaWQge1xyXG4gICAgLy8gRW5zdXJlIHRoZXJlJ3Mgb25seSBvbmUgbGlzdGVuZXIgcGVyIGRvY3VtZW50XHJcbiAgICBpZiAodGhpcy5fbGlzdGVuZXIpIHtcclxuICAgICAgZm9jdXNUcmFwLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2xpc3RlbmVyISwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fbGlzdGVuZXIgPSAoZTogRm9jdXNFdmVudCkgPT4gdGhpcy5fdHJhcEZvY3VzKGZvY3VzVHJhcCwgZSk7XHJcbiAgICBmb2N1c1RyYXAuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIGZvY3VzVHJhcC5fZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9saXN0ZW5lciEsIHRydWUpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVtb3ZlcyB0aGUgZXZlbnQgbGlzdGVuZXIgYWRkZWQgaW4gcHJldmVudEZvY3VzLiAqL1xyXG4gIGFsbG93Rm9jdXMoZm9jdXNUcmFwOiBDb25maWd1cmFibGVGb2N1c1RyYXApOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5fbGlzdGVuZXIpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZm9jdXNUcmFwLl9kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX2xpc3RlbmVyISwgdHJ1ZSk7XHJcbiAgICB0aGlzLl9saXN0ZW5lciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWZvY3VzZXMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIEZvY3VzVHJhcCBpZiB0aGUgZm9jdXMgZXZlbnQgdGFyZ2V0IHdhcyBvdXRzaWRlXHJcbiAgICogdGhlIEZvY3VzVHJhcC5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgYW4gZXZlbnQgbGlzdGVuZXIgY2FsbGJhY2suIFRoZSBldmVudCBsaXN0ZW5lciBpcyBhZGRlZCBpbiBydW5PdXRzaWRlQW5ndWxhcixcclxuICAgKiBzbyBhbGwgdGhpcyBjb2RlIHJ1bnMgb3V0c2lkZSBBbmd1bGFyIGFzIHdlbGwuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfdHJhcEZvY3VzKGZvY3VzVHJhcDogQ29uZmlndXJhYmxlRm9jdXNUcmFwLCBldmVudDogRm9jdXNFdmVudCkge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xyXG4gICAgY29uc3QgZm9jdXNUcmFwUm9vdCA9IGZvY3VzVHJhcC5fZWxlbWVudDtcclxuXHJcbiAgICAvLyBEb24ndCByZWZvY3VzIGlmIHRhcmdldCB3YXMgaW4gYW4gb3ZlcmxheSwgYmVjYXVzZSB0aGUgb3ZlcmxheSBtaWdodCBiZSBhc3NvY2lhdGVkXHJcbiAgICAvLyB3aXRoIGFuIGVsZW1lbnQgaW5zaWRlIHRoZSBGb2N1c1RyYXAsIGV4LiBtYXQtc2VsZWN0LlxyXG4gICAgaWYgKCFmb2N1c1RyYXBSb290LmNvbnRhaW5zKHRhcmdldCkgJiYgY2xvc2VzdCh0YXJnZXQsICdkaXYuY2RrLW92ZXJsYXktcGFuZScpID09PSBudWxsKSB7XHJcbiAgICAgICAgLy8gU29tZSBsZWdhY3kgRm9jdXNUcmFwIHVzYWdlcyBoYXZlIGxvZ2ljIHRoYXQgZm9jdXNlcyBzb21lIGVsZW1lbnQgb24gdGhlIHBhZ2VcclxuICAgICAgICAvLyBqdXN0IGJlZm9yZSBGb2N1c1RyYXAgaXMgZGVzdHJveWVkLiBGb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHksIHdhaXRcclxuICAgICAgICAvLyB0byBiZSBzdXJlIEZvY3VzVHJhcCBpcyBzdGlsbCBlbmFibGVkIGJlZm9yZSByZWZvY3VzaW5nLlxyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciBmb2N1cyB3YXNuJ3QgcHV0IGJhY2sgaW50byB0aGUgZm9jdXMgdHJhcCB3aGlsZSB0aGUgdGltZW91dCB3YXMgcGVuZGluZy5cclxuICAgICAgICAgIGlmIChmb2N1c1RyYXAuZW5hYmxlZCAmJiAhZm9jdXNUcmFwUm9vdC5jb250YWlucyhmb2N1c1RyYXAuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgIGZvY3VzVHJhcC5mb2N1c0ZpcnN0VGFiYmFibGVFbGVtZW50KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICB9XHJcbn1cclxuIl19