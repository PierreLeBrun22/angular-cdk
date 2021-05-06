import { getMatScrollStrategyAlreadyAttachedError } from './scroll-strategy';
/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy {
    constructor(_scrollDispatcher, _ngZone, _viewportRuler, _config) {
        this._scrollDispatcher = _scrollDispatcher;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._config = _config;
        this._scrollSubscription = null;
        /** Detaches the overlay ref and disables the scroll strategy. */
        this._detach = () => {
            this.disable();
            if (this._overlayRef.hasAttached()) {
                this._ngZone.run(() => this._overlayRef.detach());
            }
        };
    }
    /** Attaches this scroll strategy to an overlay. */
    attach(overlayRef) {
        if (this._overlayRef && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMatScrollStrategyAlreadyAttachedError();
        }
        this._overlayRef = overlayRef;
    }
    /** Enables the closing of the attached overlay on scroll. */
    enable() {
        if (this._scrollSubscription) {
            return;
        }
        const stream = this._scrollDispatcher.scrolled(0);
        if (this._config && this._config.threshold && this._config.threshold > 1) {
            this._initialScrollPosition = this._viewportRuler.getViewportScrollPosition().top;
            this._scrollSubscription = stream.subscribe(() => {
                const scrollPosition = this._viewportRuler.getViewportScrollPosition().top;
                if (Math.abs(scrollPosition - this._initialScrollPosition) > this._config.threshold) {
                    this._detach();
                }
                else {
                    this._overlayRef.updatePosition();
                }
            });
        }
        else {
            this._scrollSubscription = stream.subscribe(this._detach);
        }
    }
    /** Disables the closing the attached overlay on scroll. */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvc2Utc2Nyb2xsLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Njcm9sbC9jbG9zZS1zY3JvbGwtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFpQix3Q0FBd0MsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBYTNGOztHQUVHO0FBQ0gsTUFBTSxPQUFPLG1CQUFtQjtJQUs5QixZQUNVLGlCQUFtQyxFQUNuQyxPQUFlLEVBQ2YsY0FBNkIsRUFDN0IsT0FBbUM7UUFIbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUNuQyxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2YsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7UUFSckMsd0JBQW1CLEdBQXNCLElBQUksQ0FBQztRQXlEdEQsaUVBQWlFO1FBQ3pELFlBQU8sR0FBRyxHQUFHLEVBQUU7WUFDckIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBRWYsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUNsQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7YUFDbkQ7UUFDSCxDQUFDLENBQUE7SUF4RCtDLENBQUM7SUFFakQsbURBQW1EO0lBQ25ELE1BQU0sQ0FBQyxVQUE0QjtRQUNqQyxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDdkUsTUFBTSx3Q0FBd0MsRUFBRSxDQUFDO1NBQ2xEO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7SUFDaEMsQ0FBQztJQUVELDZEQUE2RDtJQUM3RCxNQUFNO1FBQ0osSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDNUIsT0FBTztTQUNSO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsRCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFO1lBQ3hFLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLENBQUMsR0FBRyxDQUFDO1lBRWxGLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDL0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFFM0UsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBUSxDQUFDLFNBQVUsRUFBRTtvQkFDckYsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDTCxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDO2lCQUNuQztZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzRDtJQUNILENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzVCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUssQ0FBQztJQUMzQixDQUFDO0NBVUYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1Njcm9sbFN0cmF0ZWd5LCBnZXRNYXRTY3JvbGxTdHJhdGVneUFscmVhZHlBdHRhY2hlZEVycm9yfSBmcm9tICcuL3Njcm9sbC1zdHJhdGVneSc7XHJcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7U2Nyb2xsRGlzcGF0Y2hlciwgVmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcblxyXG4vKipcclxuICogQ29uZmlnIG9wdGlvbnMgZm9yIHRoZSBDbG9zZVNjcm9sbFN0cmF0ZWd5LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDbG9zZVNjcm9sbFN0cmF0ZWd5Q29uZmlnIHtcclxuICAvKiogQW1vdW50IG9mIHBpeGVscyB0aGUgdXNlciBoYXMgdG8gc2Nyb2xsIGJlZm9yZSB0aGUgb3ZlcmxheSBpcyBjbG9zZWQuICovXHJcbiAgdGhyZXNob2xkPzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogU3RyYXRlZ3kgdGhhdCB3aWxsIGNsb3NlIHRoZSBvdmVybGF5IGFzIHNvb24gYXMgdGhlIHVzZXIgc3RhcnRzIHNjcm9sbGluZy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDbG9zZVNjcm9sbFN0cmF0ZWd5IGltcGxlbWVudHMgU2Nyb2xsU3RyYXRlZ3kge1xyXG4gIHByaXZhdGUgX3Njcm9sbFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9ufG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWZlcmVuY2U7XHJcbiAgcHJpdmF0ZSBfaW5pdGlhbFNjcm9sbFBvc2l0aW9uOiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBfc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcclxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcclxuICAgIHByaXZhdGUgX2NvbmZpZz86IENsb3NlU2Nyb2xsU3RyYXRlZ3lDb25maWcpIHt9XHJcblxyXG4gIC8qKiBBdHRhY2hlcyB0aGlzIHNjcm9sbCBzdHJhdGVneSB0byBhbiBvdmVybGF5LiAqL1xyXG4gIGF0dGFjaChvdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlKSB7XHJcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZiAmJiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSkge1xyXG4gICAgICB0aHJvdyBnZXRNYXRTY3JvbGxTdHJhdGVneUFscmVhZHlBdHRhY2hlZEVycm9yKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fb3ZlcmxheVJlZiA9IG92ZXJsYXlSZWY7XHJcbiAgfVxyXG5cclxuICAvKiogRW5hYmxlcyB0aGUgY2xvc2luZyBvZiB0aGUgYXR0YWNoZWQgb3ZlcmxheSBvbiBzY3JvbGwuICovXHJcbiAgZW5hYmxlKCkge1xyXG4gICAgaWYgKHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3RyZWFtID0gdGhpcy5fc2Nyb2xsRGlzcGF0Y2hlci5zY3JvbGxlZCgwKTtcclxuXHJcbiAgICBpZiAodGhpcy5fY29uZmlnICYmIHRoaXMuX2NvbmZpZy50aHJlc2hvbGQgJiYgdGhpcy5fY29uZmlnLnRocmVzaG9sZCA+IDEpIHtcclxuICAgICAgdGhpcy5faW5pdGlhbFNjcm9sbFBvc2l0aW9uID0gdGhpcy5fdmlld3BvcnRSdWxlci5nZXRWaWV3cG9ydFNjcm9sbFBvc2l0aW9uKCkudG9wO1xyXG5cclxuICAgICAgdGhpcy5fc2Nyb2xsU3Vic2NyaXB0aW9uID0gc3RyZWFtLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc2Nyb2xsUG9zaXRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyLmdldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKS50b3A7XHJcblxyXG4gICAgICAgIGlmIChNYXRoLmFicyhzY3JvbGxQb3NpdGlvbiAtIHRoaXMuX2luaXRpYWxTY3JvbGxQb3NpdGlvbikgPiB0aGlzLl9jb25maWchLnRocmVzaG9sZCEpIHtcclxuICAgICAgICAgIHRoaXMuX2RldGFjaCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbiA9IHN0cmVhbS5zdWJzY3JpYmUodGhpcy5fZGV0YWNoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBEaXNhYmxlcyB0aGUgY2xvc2luZyB0aGUgYXR0YWNoZWQgb3ZlcmxheSBvbiBzY3JvbGwuICovXHJcbiAgZGlzYWJsZSgpIHtcclxuICAgIGlmICh0aGlzLl9zY3JvbGxTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5fc2Nyb2xsU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgIHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkZXRhY2goKSB7XHJcbiAgICB0aGlzLmRpc2FibGUoKTtcclxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsITtcclxuICB9XHJcblxyXG4gIC8qKiBEZXRhY2hlcyB0aGUgb3ZlcmxheSByZWYgYW5kIGRpc2FibGVzIHRoZSBzY3JvbGwgc3RyYXRlZ3kuICovXHJcbiAgcHJpdmF0ZSBfZGV0YWNoID0gKCkgPT4ge1xyXG4gICAgdGhpcy5kaXNhYmxlKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xyXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHRoaXMuX292ZXJsYXlSZWYuZGV0YWNoKCkpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=