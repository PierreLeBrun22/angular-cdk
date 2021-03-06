/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusTrap } from './focus-trap';
/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class uses a strategy pattern that determines how it traps focus.
 * See FocusTrapInertStrategy.
 */
export class ConfigurableFocusTrap extends FocusTrap {
    constructor(_element, _checker, _ngZone, _document, _focusTrapManager, _inertStrategy, config) {
        super(_element, _checker, _ngZone, _document, config.defer);
        this._focusTrapManager = _focusTrapManager;
        this._inertStrategy = _inertStrategy;
        this._focusTrapManager.register(this);
    }
    /** Whether the FocusTrap is enabled. */
    get enabled() { return this._enabled; }
    set enabled(value) {
        this._enabled = value;
        if (this._enabled) {
            this._focusTrapManager.register(this);
        }
        else {
            this._focusTrapManager.deregister(this);
        }
    }
    /** Notifies the FocusTrapManager that this FocusTrap will be destroyed. */
    destroy() {
        this._focusTrapManager.deregister(this);
        super.destroy();
    }
    /** @docs-private Implemented as part of ManagedFocusTrap. */
    _enable() {
        this._inertStrategy.preventFocus(this);
        this.toggleAnchors(true);
    }
    /** @docs-private Implemented as part of ManagedFocusTrap. */
    _disable() {
        this._inertStrategy.allowFocus(this);
        this.toggleAnchors(false);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhYmxlLWZvY3VzLXRyYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvZm9jdXMtdHJhcC9jb25maWd1cmFibGUtZm9jdXMtdHJhcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBS3ZDOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLHFCQUFzQixTQUFRLFNBQVM7SUFZbEQsWUFDRSxRQUFxQixFQUNyQixRQUE4QixFQUM5QixPQUFlLEVBQ2YsU0FBbUIsRUFDWCxpQkFBbUMsRUFDbkMsY0FBc0MsRUFDOUMsTUFBbUM7UUFDbkMsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFIcEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUNuQyxtQkFBYyxHQUFkLGNBQWMsQ0FBd0I7UUFHOUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBckJELHdDQUF3QztJQUN4QyxJQUFJLE9BQU8sS0FBYyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hELElBQUksT0FBTyxDQUFDLEtBQWM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNMLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDekM7SUFDSCxDQUFDO0lBY0QsMkVBQTJFO0lBQzNFLE9BQU87UUFDTCxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNsQixDQUFDO0lBRUQsNkRBQTZEO0lBQzdELE9BQU87UUFDTCxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCw2REFBNkQ7SUFDN0QsUUFBUTtRQUNOLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge05nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7SW50ZXJhY3Rpdml0eUNoZWNrZXJ9IGZyb20gJy4uL2ludGVyYWN0aXZpdHktY2hlY2tlci9pbnRlcmFjdGl2aXR5LWNoZWNrZXInO1xyXG5pbXBvcnQge0ZvY3VzVHJhcH0gZnJvbSAnLi9mb2N1cy10cmFwJztcclxuaW1wb3J0IHtGb2N1c1RyYXBNYW5hZ2VyLCBNYW5hZ2VkRm9jdXNUcmFwfSBmcm9tICcuL2ZvY3VzLXRyYXAtbWFuYWdlcic7XHJcbmltcG9ydCB7Rm9jdXNUcmFwSW5lcnRTdHJhdGVneX0gZnJvbSAnLi9mb2N1cy10cmFwLWluZXJ0LXN0cmF0ZWd5JztcclxuaW1wb3J0IHtDb25maWd1cmFibGVGb2N1c1RyYXBDb25maWd9IGZyb20gJy4vY29uZmlndXJhYmxlLWZvY3VzLXRyYXAtY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IGFsbG93cyBmb3IgdHJhcHBpbmcgZm9jdXMgd2l0aGluIGEgRE9NIGVsZW1lbnQuXHJcbiAqXHJcbiAqIFRoaXMgY2xhc3MgdXNlcyBhIHN0cmF0ZWd5IHBhdHRlcm4gdGhhdCBkZXRlcm1pbmVzIGhvdyBpdCB0cmFwcyBmb2N1cy5cclxuICogU2VlIEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3kuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhYmxlRm9jdXNUcmFwIGV4dGVuZHMgRm9jdXNUcmFwIGltcGxlbWVudHMgTWFuYWdlZEZvY3VzVHJhcCB7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIEZvY3VzVHJhcCBpcyBlbmFibGVkLiAqL1xyXG4gIGdldCBlbmFibGVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZW5hYmxlZDsgfVxyXG4gIHNldCBlbmFibGVkKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9lbmFibGVkID0gdmFsdWU7XHJcbiAgICBpZiAodGhpcy5fZW5hYmxlZCkge1xyXG4gICAgICB0aGlzLl9mb2N1c1RyYXBNYW5hZ2VyLnJlZ2lzdGVyKHRoaXMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fZm9jdXNUcmFwTWFuYWdlci5kZXJlZ2lzdGVyKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBfZWxlbWVudDogSFRNTEVsZW1lbnQsXHJcbiAgICBfY2hlY2tlcjogSW50ZXJhY3Rpdml0eUNoZWNrZXIsXHJcbiAgICBfbmdab25lOiBOZ1pvbmUsXHJcbiAgICBfZG9jdW1lbnQ6IERvY3VtZW50LFxyXG4gICAgcHJpdmF0ZSBfZm9jdXNUcmFwTWFuYWdlcjogRm9jdXNUcmFwTWFuYWdlcixcclxuICAgIHByaXZhdGUgX2luZXJ0U3RyYXRlZ3k6IEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3ksXHJcbiAgICBjb25maWc6IENvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZykge1xyXG4gICAgc3VwZXIoX2VsZW1lbnQsIF9jaGVja2VyLCBfbmdab25lLCBfZG9jdW1lbnQsIGNvbmZpZy5kZWZlcik7XHJcbiAgICB0aGlzLl9mb2N1c1RyYXBNYW5hZ2VyLnJlZ2lzdGVyKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqIE5vdGlmaWVzIHRoZSBGb2N1c1RyYXBNYW5hZ2VyIHRoYXQgdGhpcyBGb2N1c1RyYXAgd2lsbCBiZSBkZXN0cm95ZWQuICovXHJcbiAgZGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2ZvY3VzVHJhcE1hbmFnZXIuZGVyZWdpc3Rlcih0aGlzKTtcclxuICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICB9XHJcblxyXG4gIC8qKiBAZG9jcy1wcml2YXRlIEltcGxlbWVudGVkIGFzIHBhcnQgb2YgTWFuYWdlZEZvY3VzVHJhcC4gKi9cclxuICBfZW5hYmxlKCkge1xyXG4gICAgdGhpcy5faW5lcnRTdHJhdGVneS5wcmV2ZW50Rm9jdXModGhpcyk7XHJcbiAgICB0aGlzLnRvZ2dsZUFuY2hvcnModHJ1ZSk7XHJcbiAgfVxyXG5cclxuICAvKiogQGRvY3MtcHJpdmF0ZSBJbXBsZW1lbnRlZCBhcyBwYXJ0IG9mIE1hbmFnZWRGb2N1c1RyYXAuICovXHJcbiAgX2Rpc2FibGUoKSB7XHJcbiAgICB0aGlzLl9pbmVydFN0cmF0ZWd5LmFsbG93Rm9jdXModGhpcyk7XHJcbiAgICB0aGlzLnRvZ2dsZUFuY2hvcnMoZmFsc2UpO1xyXG4gIH1cclxufVxyXG4iXX0=