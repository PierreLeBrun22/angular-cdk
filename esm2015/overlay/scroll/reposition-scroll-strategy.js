/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { getMatScrollStrategyAlreadyAttachedError } from './scroll-strategy';
import { isElementScrolledOutsideView } from '../position/scroll-clip';
/**
 * Strategy that will update the element position as the user is scrolling.
 */
export class RepositionScrollStrategy {
    constructor(_scrollDispatcher, _viewportRuler, _ngZone, _config) {
        this._scrollDispatcher = _scrollDispatcher;
        this._viewportRuler = _viewportRuler;
        this._ngZone = _ngZone;
        this._config = _config;
        this._scrollSubscription = null;
    }
    /** Attaches this scroll strategy to an overlay. */
    attach(overlayRef) {
        if (this._overlayRef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMatScrollStrategyAlreadyAttachedError();
        }
        this._overlayRef = overlayRef;
    }
    /** Enables repositioning of the attached overlay on scroll. */
    enable() {
        if (!this._scrollSubscription) {
            const throttle = this._config ? this._config.scrollThrottle : 0;
            this._scrollSubscription = this._scrollDispatcher.scrolled(throttle).subscribe(() => {
                this._overlayRef.updatePosition();
                // TODO(crisbeto): make `close` on by default once all components can handle it.
                if (this._config && this._config.autoClose) {
                    const overlayRect = this._overlayRef.overlayElement.getBoundingClientRect();
                    const { width, height } = this._viewportRuler.getViewportSize();
                    // TODO(crisbeto): include all ancestor scroll containers here once
                    // we have a way of exposing the trigger element to the scroll strategy.
                    const parentRects = [{ width, height, bottom: height, right: width, top: 0, left: 0 }];
                    if (isElementScrolledOutsideView(overlayRect, parentRects)) {
                        this.disable();
                        this._ngZone.run(() => this._overlayRef.detach());
                    }
                }
            });
        }
    }
    /** Disables repositioning of the attached overlay on scroll. */
    disable() {
        if (this._scrollSubscription) {
            this._scrollSubscription.unsubscribe();
            this._scrollSubscription = null;
        }
    }
    detach() {
        this.disable();
        this._overlayRef = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3NpdGlvbi1zY3JvbGwtc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvc2Nyb2xsL3JlcG9zaXRpb24tc2Nyb2xsLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBaUIsd0NBQXdDLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUczRixPQUFPLEVBQUMsNEJBQTRCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQWFyRTs7R0FFRztBQUNILE1BQU0sT0FBTyx3QkFBd0I7SUFJbkMsWUFDVSxpQkFBbUMsRUFDbkMsY0FBNkIsRUFDN0IsT0FBZSxFQUNmLE9BQXdDO1FBSHhDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDbkMsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLFlBQU8sR0FBUCxPQUFPLENBQWlDO1FBUDFDLHdCQUFtQixHQUFzQixJQUFJLENBQUM7SUFPQSxDQUFDO0lBRXZELG1EQUFtRDtJQUNuRCxNQUFNLENBQUMsVUFBNEI7UUFDakMsSUFBSSxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3ZFLE1BQU0sd0NBQXdDLEVBQUUsQ0FBQztTQUNsRDtRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2hDLENBQUM7SUFFRCwrREFBK0Q7SUFDL0QsTUFBTTtRQUNKLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDN0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVoRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNsRixJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUVsQyxnRkFBZ0Y7Z0JBQ2hGLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtvQkFDMUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMscUJBQXFCLEVBQUUsQ0FBQztvQkFDNUUsTUFBTSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUU5RCxtRUFBbUU7b0JBQ25FLHdFQUF3RTtvQkFDeEUsTUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUM7b0JBRXJGLElBQUksNEJBQTRCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFO3dCQUMxRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO3FCQUNuRDtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QixJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFLLENBQUM7SUFDM0IsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge05nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtTY3JvbGxTdHJhdGVneSwgZ2V0TWF0U2Nyb2xsU3RyYXRlZ3lBbHJlYWR5QXR0YWNoZWRFcnJvcn0gZnJvbSAnLi9zY3JvbGwtc3RyYXRlZ3knO1xyXG5pbXBvcnQge092ZXJsYXlSZWZlcmVuY2V9IGZyb20gJy4uL292ZXJsYXktcmVmZXJlbmNlJztcclxuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtpc0VsZW1lbnRTY3JvbGxlZE91dHNpZGVWaWV3fSBmcm9tICcuLi9wb3NpdGlvbi9zY3JvbGwtY2xpcCc7XHJcblxyXG4vKipcclxuICogQ29uZmlnIG9wdGlvbnMgZm9yIHRoZSBSZXBvc2l0aW9uU2Nyb2xsU3RyYXRlZ3kuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFJlcG9zaXRpb25TY3JvbGxTdHJhdGVneUNvbmZpZyB7XHJcbiAgLyoqIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIHRocm90dGxlIHRoZSBzY3JvbGwgZXZlbnRzLiAqL1xyXG4gIHNjcm9sbFRocm90dGxlPzogbnVtYmVyO1xyXG5cclxuICAvKiogV2hldGhlciB0byBjbG9zZSB0aGUgb3ZlcmxheSBvbmNlIHRoZSB1c2VyIGhhcyBzY3JvbGxlZCBhd2F5IGNvbXBsZXRlbHkuICovXHJcbiAgYXV0b0Nsb3NlPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFN0cmF0ZWd5IHRoYXQgd2lsbCB1cGRhdGUgdGhlIGVsZW1lbnQgcG9zaXRpb24gYXMgdGhlIHVzZXIgaXMgc2Nyb2xsaW5nLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJlcG9zaXRpb25TY3JvbGxTdHJhdGVneSBpbXBsZW1lbnRzIFNjcm9sbFN0cmF0ZWd5IHtcclxuICBwcml2YXRlIF9zY3JvbGxTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbnxudWxsID0gbnVsbDtcclxuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX3Njcm9sbERpc3BhdGNoZXI6IFNjcm9sbERpc3BhdGNoZXIsXHJcbiAgICBwcml2YXRlIF92aWV3cG9ydFJ1bGVyOiBWaWV3cG9ydFJ1bGVyLFxyXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXHJcbiAgICBwcml2YXRlIF9jb25maWc/OiBSZXBvc2l0aW9uU2Nyb2xsU3RyYXRlZ3lDb25maWcpIHsgfVxyXG5cclxuICAvKiogQXR0YWNoZXMgdGhpcyBzY3JvbGwgc3RyYXRlZ3kgdG8gYW4gb3ZlcmxheS4gKi9cclxuICBhdHRhY2gob3ZlcmxheVJlZjogT3ZlcmxheVJlZmVyZW5jZSkge1xyXG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgdGhyb3cgZ2V0TWF0U2Nyb2xsU3RyYXRlZ3lBbHJlYWR5QXR0YWNoZWRFcnJvcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBvdmVybGF5UmVmO1xyXG4gIH1cclxuXHJcbiAgLyoqIEVuYWJsZXMgcmVwb3NpdGlvbmluZyBvZiB0aGUgYXR0YWNoZWQgb3ZlcmxheSBvbiBzY3JvbGwuICovXHJcbiAgZW5hYmxlKCkge1xyXG4gICAgaWYgKCF0aGlzLl9zY3JvbGxTdWJzY3JpcHRpb24pIHtcclxuICAgICAgY29uc3QgdGhyb3R0bGUgPSB0aGlzLl9jb25maWcgPyB0aGlzLl9jb25maWcuc2Nyb2xsVGhyb3R0bGUgOiAwO1xyXG5cclxuICAgICAgdGhpcy5fc2Nyb2xsU3Vic2NyaXB0aW9uID0gdGhpcy5fc2Nyb2xsRGlzcGF0Y2hlci5zY3JvbGxlZCh0aHJvdHRsZSkuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIC8vIFRPRE8oY3Jpc2JldG8pOiBtYWtlIGBjbG9zZWAgb24gYnkgZGVmYXVsdCBvbmNlIGFsbCBjb21wb25lbnRzIGNhbiBoYW5kbGUgaXQuXHJcbiAgICAgICAgaWYgKHRoaXMuX2NvbmZpZyAmJiB0aGlzLl9jb25maWcuYXV0b0Nsb3NlKSB7XHJcbiAgICAgICAgICBjb25zdCBvdmVybGF5UmVjdCA9IHRoaXMuX292ZXJsYXlSZWYub3ZlcmxheUVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2l6ZSgpO1xyXG5cclxuICAgICAgICAgIC8vIFRPRE8oY3Jpc2JldG8pOiBpbmNsdWRlIGFsbCBhbmNlc3RvciBzY3JvbGwgY29udGFpbmVycyBoZXJlIG9uY2VcclxuICAgICAgICAgIC8vIHdlIGhhdmUgYSB3YXkgb2YgZXhwb3NpbmcgdGhlIHRyaWdnZXIgZWxlbWVudCB0byB0aGUgc2Nyb2xsIHN0cmF0ZWd5LlxyXG4gICAgICAgICAgY29uc3QgcGFyZW50UmVjdHMgPSBbe3dpZHRoLCBoZWlnaHQsIGJvdHRvbTogaGVpZ2h0LCByaWdodDogd2lkdGgsIHRvcDogMCwgbGVmdDogMH1dO1xyXG5cclxuICAgICAgICAgIGlmIChpc0VsZW1lbnRTY3JvbGxlZE91dHNpZGVWaWV3KG92ZXJsYXlSZWN0LCBwYXJlbnRSZWN0cykpIHtcclxuICAgICAgICAgICAgdGhpcy5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gdGhpcy5fb3ZlcmxheVJlZi5kZXRhY2goKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBEaXNhYmxlcyByZXBvc2l0aW9uaW5nIG9mIHRoZSBhdHRhY2hlZCBvdmVybGF5IG9uIHNjcm9sbC4gKi9cclxuICBkaXNhYmxlKCkge1xyXG4gICAgaWYgKHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLl9zY3JvbGxTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgdGhpcy5fc2Nyb2xsU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRldGFjaCgpIHtcclxuICAgIHRoaXMuZGlzYWJsZSgpO1xyXG4gICAgdGhpcy5fb3ZlcmxheVJlZiA9IG51bGwhO1xyXG4gIH1cclxufVxyXG4iXX0=