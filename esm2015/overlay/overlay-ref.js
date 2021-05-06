/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject, merge, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { coerceCssPixelValue, coerceArray } from '@angular/cdk/coercion';
/**
 * Reference to an overlay that has been created with the Overlay service.
 * Used to manipulate or dispose of said overlay.
 */
export class OverlayRef {
    constructor(_portalOutlet, _host, _pane, _config, _ngZone, _keyboardDispatcher, _document, _location, _outsideClickDispatcher) {
        this._portalOutlet = _portalOutlet;
        this._host = _host;
        this._pane = _pane;
        this._config = _config;
        this._ngZone = _ngZone;
        this._keyboardDispatcher = _keyboardDispatcher;
        this._document = _document;
        this._location = _location;
        this._outsideClickDispatcher = _outsideClickDispatcher;
        this._backdropElement = null;
        this._backdropClick = new Subject();
        this._attachments = new Subject();
        this._detachments = new Subject();
        this._locationChanges = Subscription.EMPTY;
        this._backdropClickHandler = (event) => this._backdropClick.next(event);
        /** Stream of keydown events dispatched to this overlay. */
        this._keydownEvents = new Subject();
        /** Stream of mouse outside events dispatched to this overlay. */
        this._outsidePointerEvents = new Subject();
        if (_config.scrollStrategy) {
            this._scrollStrategy = _config.scrollStrategy;
            this._scrollStrategy.attach(this);
        }
        this._positionStrategy = _config.positionStrategy;
    }
    /** The overlay's HTML element */
    get overlayElement() {
        return this._pane;
    }
    /** The overlay's backdrop HTML element. */
    get backdropElement() {
        return this._backdropElement;
    }
    /**
     * Wrapper around the panel element. Can be used for advanced
     * positioning where a wrapper with specific styling is
     * required around the overlay pane.
     */
    get hostElement() {
        return this._host;
    }
    /**
     * Attaches content, given via a Portal, to the overlay.
     * If the overlay is configured to have a backdrop, it will be created.
     *
     * @param portal Portal instance to which to attach the overlay.
     * @returns The portal attachment result.
     */
    attach(portal) {
        let attachResult = this._portalOutlet.attach(portal);
        // Update the pane element with the given configuration.
        if (!this._host.parentElement && this._previousHostParent) {
            this._previousHostParent.appendChild(this._host);
        }
        if (this._positionStrategy) {
            this._positionStrategy.attach(this);
        }
        this._updateStackingOrder();
        this._updateElementSize();
        this._updateElementDirection();
        if (this._scrollStrategy) {
            this._scrollStrategy.enable();
        }
        // Update the position once the zone is stable so that the overlay will be fully rendered
        // before attempting to position it, as the position may depend on the size of the rendered
        // content.
        this._ngZone.onStable
            .pipe(take(1))
            .subscribe(() => {
            // The overlay could've been detached before the zone has stabilized.
            if (this.hasAttached()) {
                this.updatePosition();
            }
        });
        // Enable pointer events for the overlay pane element.
        this._togglePointerEvents(true);
        if (this._config.hasBackdrop) {
            this._attachBackdrop();
        }
        if (this._config.panelClass) {
            this._toggleClasses(this._pane, this._config.panelClass, true);
        }
        // Only emit the `attachments` event once all other setup is done.
        this._attachments.next();
        // Track this overlay by the keyboard dispatcher
        this._keyboardDispatcher.add(this);
        if (this._config.disposeOnNavigation) {
            this._locationChanges = this._location.subscribe(() => this.dispose());
        }
        this._outsideClickDispatcher.add(this);
        return attachResult;
    }
    /**
     * Detaches an overlay from a portal.
     * @returns The portal detachment result.
     */
    detach() {
        if (!this.hasAttached()) {
            return;
        }
        this.detachBackdrop();
        // When the overlay is detached, the pane element should disable pointer events.
        // This is necessary because otherwise the pane element will cover the page and disable
        // pointer events therefore. Depends on the position strategy and the applied pane boundaries.
        this._togglePointerEvents(false);
        if (this._positionStrategy && this._positionStrategy.detach) {
            this._positionStrategy.detach();
        }
        if (this._scrollStrategy) {
            this._scrollStrategy.disable();
        }
        const detachmentResult = this._portalOutlet.detach();
        // Only emit after everything is detached.
        this._detachments.next();
        // Remove this overlay from keyboard dispatcher tracking.
        this._keyboardDispatcher.remove(this);
        // Keeping the host element in the DOM can cause scroll jank, because it still gets
        // rendered, even though it's transparent and unclickable which is why we remove it.
        this._detachContentWhenStable();
        this._locationChanges.unsubscribe();
        this._outsideClickDispatcher.remove(this);
        return detachmentResult;
    }
    /** Cleans up the overlay from the DOM. */
    dispose() {
        const isAttached = this.hasAttached();
        if (this._positionStrategy) {
            this._positionStrategy.dispose();
        }
        this._disposeScrollStrategy();
        this.detachBackdrop();
        this._locationChanges.unsubscribe();
        this._keyboardDispatcher.remove(this);
        this._portalOutlet.dispose();
        this._attachments.complete();
        this._backdropClick.complete();
        this._keydownEvents.complete();
        this._outsidePointerEvents.complete();
        this._outsideClickDispatcher.remove(this);
        if (this._host && this._host.parentNode) {
            this._host.parentNode.removeChild(this._host);
            this._host = null;
        }
        this._previousHostParent = this._pane = null;
        if (isAttached) {
            this._detachments.next();
        }
        this._detachments.complete();
    }
    /** Whether the overlay has attached content. */
    hasAttached() {
        return this._portalOutlet.hasAttached();
    }
    /** Gets an observable that emits when the backdrop has been clicked. */
    backdropClick() {
        return this._backdropClick;
    }
    /** Gets an observable that emits when the overlay has been attached. */
    attachments() {
        return this._attachments;
    }
    /** Gets an observable that emits when the overlay has been detached. */
    detachments() {
        return this._detachments;
    }
    /** Gets an observable of keydown events targeted to this overlay. */
    keydownEvents() {
        return this._keydownEvents;
    }
    /** Gets an observable of pointer events targeted outside this overlay. */
    outsidePointerEvents() {
        return this._outsidePointerEvents;
    }
    /** Gets the current overlay configuration, which is immutable. */
    getConfig() {
        return this._config;
    }
    /** Updates the position of the overlay based on the position strategy. */
    updatePosition() {
        if (this._positionStrategy) {
            this._positionStrategy.apply();
        }
    }
    /** Switches to a new position strategy and updates the overlay position. */
    updatePositionStrategy(strategy) {
        if (strategy === this._positionStrategy) {
            return;
        }
        if (this._positionStrategy) {
            this._positionStrategy.dispose();
        }
        this._positionStrategy = strategy;
        if (this.hasAttached()) {
            strategy.attach(this);
            this.updatePosition();
        }
    }
    /** Update the size properties of the overlay. */
    updateSize(sizeConfig) {
        this._config = Object.assign(Object.assign({}, this._config), sizeConfig);
        this._updateElementSize();
    }
    /** Sets the LTR/RTL direction for the overlay. */
    setDirection(dir) {
        this._config = Object.assign(Object.assign({}, this._config), { direction: dir });
        this._updateElementDirection();
    }
    /** Add a CSS class or an array of classes to the overlay pane. */
    addPanelClass(classes) {
        if (this._pane) {
            this._toggleClasses(this._pane, classes, true);
        }
    }
    /** Remove a CSS class or an array of classes from the overlay pane. */
    removePanelClass(classes) {
        if (this._pane) {
            this._toggleClasses(this._pane, classes, false);
        }
    }
    /**
     * Returns the layout direction of the overlay panel.
     */
    getDirection() {
        const direction = this._config.direction;
        if (!direction) {
            return 'ltr';
        }
        return typeof direction === 'string' ? direction : direction.value;
    }
    /** Switches to a new scroll strategy. */
    updateScrollStrategy(strategy) {
        if (strategy === this._scrollStrategy) {
            return;
        }
        this._disposeScrollStrategy();
        this._scrollStrategy = strategy;
        if (this.hasAttached()) {
            strategy.attach(this);
            strategy.enable();
        }
    }
    /** Updates the text direction of the overlay panel. */
    _updateElementDirection() {
        this._host.setAttribute('dir', this.getDirection());
    }
    /** Updates the size of the overlay element based on the overlay config. */
    _updateElementSize() {
        if (!this._pane) {
            return;
        }
        const style = this._pane.style;
        style.width = coerceCssPixelValue(this._config.width);
        style.height = coerceCssPixelValue(this._config.height);
        style.minWidth = coerceCssPixelValue(this._config.minWidth);
        style.minHeight = coerceCssPixelValue(this._config.minHeight);
        style.maxWidth = coerceCssPixelValue(this._config.maxWidth);
        style.maxHeight = coerceCssPixelValue(this._config.maxHeight);
    }
    /** Toggles the pointer events for the overlay pane element. */
    _togglePointerEvents(enablePointer) {
        this._pane.style.pointerEvents = enablePointer ? '' : 'none';
    }
    /** Attaches a backdrop for this overlay. */
    _attachBackdrop() {
        const showingClass = 'cdk-overlay-backdrop-showing';
        this._backdropElement = this._document.createElement('div');
        this._backdropElement.classList.add('cdk-overlay-backdrop');
        if (this._config.backdropClass) {
            this._toggleClasses(this._backdropElement, this._config.backdropClass, true);
        }
        // Insert the backdrop before the pane in the DOM order,
        // in order to handle stacked overlays properly.
        this._host.parentElement.insertBefore(this._backdropElement, this._host);
        // Forward backdrop clicks such that the consumer of the overlay can perform whatever
        // action desired when such a click occurs (usually closing the overlay).
        this._backdropElement.addEventListener('click', this._backdropClickHandler);
        // Add class to fade-in the backdrop after one frame.
        if (typeof requestAnimationFrame !== 'undefined') {
            this._ngZone.runOutsideAngular(() => {
                requestAnimationFrame(() => {
                    if (this._backdropElement) {
                        this._backdropElement.classList.add(showingClass);
                    }
                });
            });
        }
        else {
            this._backdropElement.classList.add(showingClass);
        }
    }
    /**
     * Updates the stacking order of the element, moving it to the top if necessary.
     * This is required in cases where one overlay was detached, while another one,
     * that should be behind it, was destroyed. The next time both of them are opened,
     * the stacking will be wrong, because the detached element's pane will still be
     * in its original DOM position.
     */
    _updateStackingOrder() {
        if (this._host.nextSibling) {
            this._host.parentNode.appendChild(this._host);
        }
    }
    /** Detaches the backdrop (if any) associated with the overlay. */
    detachBackdrop() {
        let backdropToDetach = this._backdropElement;
        if (!backdropToDetach) {
            return;
        }
        let timeoutId;
        let finishDetach = () => {
            // It may not be attached to anything in certain cases (e.g. unit tests).
            if (backdropToDetach) {
                backdropToDetach.removeEventListener('click', this._backdropClickHandler);
                backdropToDetach.removeEventListener('transitionend', finishDetach);
                if (backdropToDetach.parentNode) {
                    backdropToDetach.parentNode.removeChild(backdropToDetach);
                }
            }
            // It is possible that a new portal has been attached to this overlay since we started
            // removing the backdrop. If that is the case, only clear the backdrop reference if it
            // is still the same instance that we started to remove.
            if (this._backdropElement == backdropToDetach) {
                this._backdropElement = null;
            }
            if (this._config.backdropClass) {
                this._toggleClasses(backdropToDetach, this._config.backdropClass, false);
            }
            clearTimeout(timeoutId);
        };
        backdropToDetach.classList.remove('cdk-overlay-backdrop-showing');
        this._ngZone.runOutsideAngular(() => {
            backdropToDetach.addEventListener('transitionend', finishDetach);
        });
        // If the backdrop doesn't have a transition, the `transitionend` event won't fire.
        // In this case we make it unclickable and we try to remove it after a delay.
        backdropToDetach.style.pointerEvents = 'none';
        // Run this outside the Angular zone because there's nothing that Angular cares about.
        // If it were to run inside the Angular zone, every test that used Overlay would have to be
        // either async or fakeAsync.
        timeoutId = this._ngZone.runOutsideAngular(() => setTimeout(finishDetach, 500));
    }
    /** Toggles a single CSS class or an array of classes on an element. */
    _toggleClasses(element, cssClasses, isAdd) {
        const classList = element.classList;
        coerceArray(cssClasses).forEach(cssClass => {
            // We can't do a spread here, because IE doesn't support setting multiple classes.
            // Also trying to add an empty string to a DOMTokenList will throw.
            if (cssClass) {
                isAdd ? classList.add(cssClass) : classList.remove(cssClass);
            }
        });
    }
    /** Detaches the overlay content next time the zone stabilizes. */
    _detachContentWhenStable() {
        // Normally we wouldn't have to explicitly run this outside the `NgZone`, however
        // if the consumer is using `zone-patch-rxjs`, the `Subscription.unsubscribe` call will
        // be patched to run inside the zone, which will throw us into an infinite loop.
        this._ngZone.runOutsideAngular(() => {
            // We can't remove the host here immediately, because the overlay pane's content
            // might still be animating. This stream helps us avoid interrupting the animation
            // by waiting for the pane to become empty.
            const subscription = this._ngZone.onStable
                .pipe(takeUntil(merge(this._attachments, this._detachments)))
                .subscribe(() => {
                // Needs a couple of checks for the pane and host, because
                // they may have been removed by the time the zone stabilizes.
                if (!this._pane || !this._host || this._pane.children.length === 0) {
                    if (this._pane && this._config.panelClass) {
                        this._toggleClasses(this._pane, this._config.panelClass, false);
                    }
                    if (this._host && this._host.parentElement) {
                        this._previousHostParent = this._host.parentElement;
                        this._previousHostParent.removeChild(this._host);
                    }
                    subscription.unsubscribe();
                }
            });
        });
    }
    /** Disposes of a scroll strategy. */
    _disposeScrollStrategy() {
        const scrollStrategy = this._scrollStrategy;
        if (scrollStrategy) {
            scrollStrategy.disable();
            if (scrollStrategy.detach) {
                scrollStrategy.detach();
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBTUgsT0FBTyxFQUFhLE9BQU8sRUFBRSxLQUFLLEVBQW9CLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNoRixPQUFPLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBSS9DLE9BQU8sRUFBQyxtQkFBbUIsRUFBRSxXQUFXLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQVd2RTs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sVUFBVTtJQXNCckIsWUFDWSxhQUEyQixFQUMzQixLQUFrQixFQUNsQixLQUFrQixFQUNsQixPQUF1QyxFQUN2QyxPQUFlLEVBQ2YsbUJBQThDLEVBQzlDLFNBQW1CLEVBQ25CLFNBQW1CLEVBQ25CLHVCQUFzRDtRQVJ0RCxrQkFBYSxHQUFiLGFBQWEsQ0FBYztRQUMzQixVQUFLLEdBQUwsS0FBSyxDQUFhO1FBQ2xCLFVBQUssR0FBTCxLQUFLLENBQWE7UUFDbEIsWUFBTyxHQUFQLE9BQU8sQ0FBZ0M7UUFDdkMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMkI7UUFDOUMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQ25CLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBK0I7UUE5QjFELHFCQUFnQixHQUF1QixJQUFJLENBQUM7UUFDNUMsbUJBQWMsR0FBd0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNwRCxpQkFBWSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFDbkMsaUJBQVksR0FBRyxJQUFJLE9BQU8sRUFBUSxDQUFDO1FBR25DLHFCQUFnQixHQUFxQixZQUFZLENBQUMsS0FBSyxDQUFDO1FB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QUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHFDQUFxQztJQUM3QixzQkFBc0I7UUFDNUIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUU1QyxJQUFJLGNBQWMsRUFBRTtZQUNsQixjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFekIsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO2dCQUN6QixjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDekI7U0FDRjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7Q29tcG9uZW50UG9ydGFsLCBQb3J0YWwsIFBvcnRhbE91dGxldCwgVGVtcGxhdGVQb3J0YWx9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wb3J0YWwnO1xyXG5pbXBvcnQge0NvbXBvbmVudFJlZiwgRW1iZWRkZWRWaWV3UmVmLCBOZ1pvbmV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3QsIG1lcmdlLCBTdWJzY3JpcHRpb25MaWtlLCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge3Rha2UsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge092ZXJsYXlLZXlib2FyZERpc3BhdGNoZXJ9IGZyb20gJy4vZGlzcGF0Y2hlcnMvb3ZlcmxheS1rZXlib2FyZC1kaXNwYXRjaGVyJztcclxuaW1wb3J0IHtPdmVybGF5T3V0c2lkZUNsaWNrRGlzcGF0Y2hlcn0gZnJvbSAnLi9kaXNwYXRjaGVycy9vdmVybGF5LW91dHNpZGUtY2xpY2stZGlzcGF0Y2hlcic7XHJcbmltcG9ydCB7T3ZlcmxheUNvbmZpZ30gZnJvbSAnLi9vdmVybGF5LWNvbmZpZyc7XHJcbmltcG9ydCB7Y29lcmNlQ3NzUGl4ZWxWYWx1ZSwgY29lcmNlQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi9vdmVybGF5LXJlZmVyZW5jZSc7XHJcbmltcG9ydCB7UG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9wb3NpdGlvbi9wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7U2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vc2Nyb2xsJztcclxuXHJcblxyXG4vKiogQW4gb2JqZWN0IHdoZXJlIGFsbCBvZiBpdHMgcHJvcGVydGllcyBjYW5ub3QgYmUgd3JpdHRlbi4gKi9cclxuZXhwb3J0IHR5cGUgSW1tdXRhYmxlT2JqZWN0PFQ+ID0ge1xyXG4gIHJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlZmVyZW5jZSB0byBhbiBvdmVybGF5IHRoYXQgaGFzIGJlZW4gY3JlYXRlZCB3aXRoIHRoZSBPdmVybGF5IHNlcnZpY2UuXHJcbiAqIFVzZWQgdG8gbWFuaXB1bGF0ZSBvciBkaXNwb3NlIG9mIHNhaWQgb3ZlcmxheS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBPdmVybGF5UmVmIGltcGxlbWVudHMgUG9ydGFsT3V0bGV0LCBPdmVybGF5UmVmZXJlbmNlIHtcclxuICBwcml2YXRlIF9iYWNrZHJvcEVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSBfYmFja2Ryb3BDbGljazogU3ViamVjdDxNb3VzZUV2ZW50PiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHJpdmF0ZSBfYXR0YWNobWVudHMgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG4gIHByaXZhdGUgX2RldGFjaG1lbnRzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuICBwcml2YXRlIF9wb3NpdGlvblN0cmF0ZWd5OiBQb3NpdGlvblN0cmF0ZWd5IHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgX3Njcm9sbFN0cmF0ZWd5OiBTY3JvbGxTdHJhdGVneSB8IHVuZGVmaW5lZDtcclxuICBwcml2YXRlIF9sb2NhdGlvbkNoYW5nZXM6IFN1YnNjcmlwdGlvbkxpa2UgPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcbiAgcHJpdmF0ZSBfYmFja2Ryb3BDbGlja0hhbmRsZXIgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHRoaXMuX2JhY2tkcm9wQ2xpY2submV4dChldmVudCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgcGFyZW50IG9mIHRoZSBgX2hvc3RgIGF0IHRoZSB0aW1lIGl0IHdhcyBkZXRhY2hlZC4gVXNlZCB0byByZXN0b3JlXHJcbiAgICogdGhlIGBfaG9zdGAgdG8gaXRzIG9yaWdpbmFsIHBvc2l0aW9uIGluIHRoZSBET00gd2hlbiBpdCBnZXRzIHJlLWF0dGFjaGVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3ByZXZpb3VzSG9zdFBhcmVudDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gIC8qKiBTdHJlYW0gb2Yga2V5ZG93biBldmVudHMgZGlzcGF0Y2hlZCB0byB0aGlzIG92ZXJsYXkuICovXHJcbiAgX2tleWRvd25FdmVudHMgPSBuZXcgU3ViamVjdDxLZXlib2FyZEV2ZW50PigpO1xyXG5cclxuICAvKiogU3RyZWFtIG9mIG1vdXNlIG91dHNpZGUgZXZlbnRzIGRpc3BhdGNoZWQgdG8gdGhpcyBvdmVybGF5LiAqL1xyXG4gIF9vdXRzaWRlUG9pbnRlckV2ZW50cyA9IG5ldyBTdWJqZWN0PE1vdXNlRXZlbnQ+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIF9wb3J0YWxPdXRsZXQ6IFBvcnRhbE91dGxldCxcclxuICAgICAgcHJpdmF0ZSBfaG9zdDogSFRNTEVsZW1lbnQsXHJcbiAgICAgIHByaXZhdGUgX3BhbmU6IEhUTUxFbGVtZW50LFxyXG4gICAgICBwcml2YXRlIF9jb25maWc6IEltbXV0YWJsZU9iamVjdDxPdmVybGF5Q29uZmlnPixcclxuICAgICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXHJcbiAgICAgIHByaXZhdGUgX2tleWJvYXJkRGlzcGF0Y2hlcjogT3ZlcmxheUtleWJvYXJkRGlzcGF0Y2hlcixcclxuICAgICAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50LFxyXG4gICAgICBwcml2YXRlIF9sb2NhdGlvbjogTG9jYXRpb24sXHJcbiAgICAgIHByaXZhdGUgX291dHNpZGVDbGlja0Rpc3BhdGNoZXI6IE92ZXJsYXlPdXRzaWRlQ2xpY2tEaXNwYXRjaGVyKSB7XHJcblxyXG4gICAgaWYgKF9jb25maWcuc2Nyb2xsU3RyYXRlZ3kpIHtcclxuICAgICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kgPSBfY29uZmlnLnNjcm9sbFN0cmF0ZWd5O1xyXG4gICAgICB0aGlzLl9zY3JvbGxTdHJhdGVneS5hdHRhY2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fcG9zaXRpb25TdHJhdGVneSA9IF9jb25maWcucG9zaXRpb25TdHJhdGVneTtcclxuICB9XHJcblxyXG4gIC8qKiBUaGUgb3ZlcmxheSdzIEhUTUwgZWxlbWVudCAqL1xyXG4gIGdldCBvdmVybGF5RWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGFuZTtcclxuICB9XHJcblxyXG4gIC8qKiBUaGUgb3ZlcmxheSdzIGJhY2tkcm9wIEhUTUwgZWxlbWVudC4gKi9cclxuICBnZXQgYmFja2Ryb3BFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYmFja2Ryb3BFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV3JhcHBlciBhcm91bmQgdGhlIHBhbmVsIGVsZW1lbnQuIENhbiBiZSB1c2VkIGZvciBhZHZhbmNlZFxyXG4gICAqIHBvc2l0aW9uaW5nIHdoZXJlIGEgd3JhcHBlciB3aXRoIHNwZWNpZmljIHN0eWxpbmcgaXNcclxuICAgKiByZXF1aXJlZCBhcm91bmQgdGhlIG92ZXJsYXkgcGFuZS5cclxuICAgKi9cclxuICBnZXQgaG9zdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuX2hvc3Q7XHJcbiAgfVxyXG5cclxuICBhdHRhY2g8VD4ocG9ydGFsOiBDb21wb25lbnRQb3J0YWw8VD4pOiBDb21wb25lbnRSZWY8VD47XHJcbiAgYXR0YWNoPFQ+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8VD4pOiBFbWJlZGRlZFZpZXdSZWY8VD47XHJcbiAgYXR0YWNoKHBvcnRhbDogYW55KTogYW55O1xyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2hlcyBjb250ZW50LCBnaXZlbiB2aWEgYSBQb3J0YWwsIHRvIHRoZSBvdmVybGF5LlxyXG4gICAqIElmIHRoZSBvdmVybGF5IGlzIGNvbmZpZ3VyZWQgdG8gaGF2ZSBhIGJhY2tkcm9wLCBpdCB3aWxsIGJlIGNyZWF0ZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCBpbnN0YW5jZSB0byB3aGljaCB0byBhdHRhY2ggdGhlIG92ZXJsYXkuXHJcbiAgICogQHJldHVybnMgVGhlIHBvcnRhbCBhdHRhY2htZW50IHJlc3VsdC5cclxuICAgKi9cclxuICBhdHRhY2gocG9ydGFsOiBQb3J0YWw8YW55Pik6IGFueSB7XHJcbiAgICBsZXQgYXR0YWNoUmVzdWx0ID0gdGhpcy5fcG9ydGFsT3V0bGV0LmF0dGFjaChwb3J0YWwpO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgcGFuZSBlbGVtZW50IHdpdGggdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXHJcbiAgICBpZiAoIXRoaXMuX2hvc3QucGFyZW50RWxlbWVudCAmJiB0aGlzLl9wcmV2aW91c0hvc3RQYXJlbnQpIHtcclxuICAgICAgdGhpcy5fcHJldmlvdXNIb3N0UGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX2hvc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KSB7XHJcbiAgICAgIHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kuYXR0YWNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVN0YWNraW5nT3JkZXIoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUVsZW1lbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVFbGVtZW50RGlyZWN0aW9uKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX3Njcm9sbFN0cmF0ZWd5KSB7XHJcbiAgICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5LmVuYWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgcG9zaXRpb24gb25jZSB0aGUgem9uZSBpcyBzdGFibGUgc28gdGhhdCB0aGUgb3ZlcmxheSB3aWxsIGJlIGZ1bGx5IHJlbmRlcmVkXHJcbiAgICAvLyBiZWZvcmUgYXR0ZW1wdGluZyB0byBwb3NpdGlvbiBpdCwgYXMgdGhlIHBvc2l0aW9uIG1heSBkZXBlbmQgb24gdGhlIHNpemUgb2YgdGhlIHJlbmRlcmVkXHJcbiAgICAvLyBjb250ZW50LlxyXG4gICAgdGhpcy5fbmdab25lLm9uU3RhYmxlXHJcbiAgICAgIC5waXBlKHRha2UoMSkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIC8vIFRoZSBvdmVybGF5IGNvdWxkJ3ZlIGJlZW4gZGV0YWNoZWQgYmVmb3JlIHRoZSB6b25lIGhhcyBzdGFiaWxpemVkLlxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKCkpIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIC8vIEVuYWJsZSBwb2ludGVyIGV2ZW50cyBmb3IgdGhlIG92ZXJsYXkgcGFuZSBlbGVtZW50LlxyXG4gICAgdGhpcy5fdG9nZ2xlUG9pbnRlckV2ZW50cyh0cnVlKTtcclxuXHJcbiAgICBpZiAodGhpcy5fY29uZmlnLmhhc0JhY2tkcm9wKSB7XHJcbiAgICAgIHRoaXMuX2F0dGFjaEJhY2tkcm9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wYW5lbENsYXNzKSB7XHJcbiAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzZXModGhpcy5fcGFuZSwgdGhpcy5fY29uZmlnLnBhbmVsQ2xhc3MsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9ubHkgZW1pdCB0aGUgYGF0dGFjaG1lbnRzYCBldmVudCBvbmNlIGFsbCBvdGhlciBzZXR1cCBpcyBkb25lLlxyXG4gICAgdGhpcy5fYXR0YWNobWVudHMubmV4dCgpO1xyXG5cclxuICAgIC8vIFRyYWNrIHRoaXMgb3ZlcmxheSBieSB0aGUga2V5Ym9hcmQgZGlzcGF0Y2hlclxyXG4gICAgdGhpcy5fa2V5Ym9hcmREaXNwYXRjaGVyLmFkZCh0aGlzKTtcclxuXHJcbiAgICBpZiAodGhpcy5fY29uZmlnLmRpc3Bvc2VPbk5hdmlnYXRpb24pIHtcclxuICAgICAgdGhpcy5fbG9jYXRpb25DaGFuZ2VzID0gdGhpcy5fbG9jYXRpb24uc3Vic2NyaWJlKCgpID0+IHRoaXMuZGlzcG9zZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9vdXRzaWRlQ2xpY2tEaXNwYXRjaGVyLmFkZCh0aGlzKTtcclxuICAgIHJldHVybiBhdHRhY2hSZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRhY2hlcyBhbiBvdmVybGF5IGZyb20gYSBwb3J0YWwuXHJcbiAgICogQHJldHVybnMgVGhlIHBvcnRhbCBkZXRhY2htZW50IHJlc3VsdC5cclxuICAgKi9cclxuICBkZXRhY2goKTogYW55IHtcclxuICAgIGlmICghdGhpcy5oYXNBdHRhY2hlZCgpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRldGFjaEJhY2tkcm9wKCk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgb3ZlcmxheSBpcyBkZXRhY2hlZCwgdGhlIHBhbmUgZWxlbWVudCBzaG91bGQgZGlzYWJsZSBwb2ludGVyIGV2ZW50cy5cclxuICAgIC8vIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugb3RoZXJ3aXNlIHRoZSBwYW5lIGVsZW1lbnQgd2lsbCBjb3ZlciB0aGUgcGFnZSBhbmQgZGlzYWJsZVxyXG4gICAgLy8gcG9pbnRlciBldmVudHMgdGhlcmVmb3JlLiBEZXBlbmRzIG9uIHRoZSBwb3NpdGlvbiBzdHJhdGVneSBhbmQgdGhlIGFwcGxpZWQgcGFuZSBib3VuZGFyaWVzLlxyXG4gICAgdGhpcy5fdG9nZ2xlUG9pbnRlckV2ZW50cyhmYWxzZSk7XHJcblxyXG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uU3RyYXRlZ3kgJiYgdGhpcy5fcG9zaXRpb25TdHJhdGVneS5kZXRhY2gpIHtcclxuICAgICAgdGhpcy5fcG9zaXRpb25TdHJhdGVneS5kZXRhY2goKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fc2Nyb2xsU3RyYXRlZ3kpIHtcclxuICAgICAgdGhpcy5fc2Nyb2xsU3RyYXRlZ3kuZGlzYWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRldGFjaG1lbnRSZXN1bHQgPSB0aGlzLl9wb3J0YWxPdXRsZXQuZGV0YWNoKCk7XHJcblxyXG4gICAgLy8gT25seSBlbWl0IGFmdGVyIGV2ZXJ5dGhpbmcgaXMgZGV0YWNoZWQuXHJcbiAgICB0aGlzLl9kZXRhY2htZW50cy5uZXh0KCk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRoaXMgb3ZlcmxheSBmcm9tIGtleWJvYXJkIGRpc3BhdGNoZXIgdHJhY2tpbmcuXHJcbiAgICB0aGlzLl9rZXlib2FyZERpc3BhdGNoZXIucmVtb3ZlKHRoaXMpO1xyXG5cclxuICAgIC8vIEtlZXBpbmcgdGhlIGhvc3QgZWxlbWVudCBpbiB0aGUgRE9NIGNhbiBjYXVzZSBzY3JvbGwgamFuaywgYmVjYXVzZSBpdCBzdGlsbCBnZXRzXHJcbiAgICAvLyByZW5kZXJlZCwgZXZlbiB0aG91Z2ggaXQncyB0cmFuc3BhcmVudCBhbmQgdW5jbGlja2FibGUgd2hpY2ggaXMgd2h5IHdlIHJlbW92ZSBpdC5cclxuICAgIHRoaXMuX2RldGFjaENvbnRlbnRXaGVuU3RhYmxlKCk7XHJcbiAgICB0aGlzLl9sb2NhdGlvbkNoYW5nZXMudW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX291dHNpZGVDbGlja0Rpc3BhdGNoZXIucmVtb3ZlKHRoaXMpO1xyXG4gICAgcmV0dXJuIGRldGFjaG1lbnRSZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKiogQ2xlYW5zIHVwIHRoZSBvdmVybGF5IGZyb20gdGhlIERPTS4gKi9cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgY29uc3QgaXNBdHRhY2hlZCA9IHRoaXMuaGFzQXR0YWNoZWQoKTtcclxuXHJcbiAgICBpZiAodGhpcy5fcG9zaXRpb25TdHJhdGVneSkge1xyXG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9kaXNwb3NlU2Nyb2xsU3RyYXRlZ3koKTtcclxuICAgIHRoaXMuZGV0YWNoQmFja2Ryb3AoKTtcclxuICAgIHRoaXMuX2xvY2F0aW9uQ2hhbmdlcy51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5fa2V5Ym9hcmREaXNwYXRjaGVyLnJlbW92ZSh0aGlzKTtcclxuICAgIHRoaXMuX3BvcnRhbE91dGxldC5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLl9hdHRhY2htZW50cy5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5fYmFja2Ryb3BDbGljay5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5fa2V5ZG93bkV2ZW50cy5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5fb3V0c2lkZVBvaW50ZXJFdmVudHMuY29tcGxldGUoKTtcclxuICAgIHRoaXMuX291dHNpZGVDbGlja0Rpc3BhdGNoZXIucmVtb3ZlKHRoaXMpO1xyXG5cclxuICAgIGlmICh0aGlzLl9ob3N0ICYmIHRoaXMuX2hvc3QucGFyZW50Tm9kZSkge1xyXG4gICAgICB0aGlzLl9ob3N0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5faG9zdCk7XHJcbiAgICAgIHRoaXMuX2hvc3QgPSBudWxsITtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wcmV2aW91c0hvc3RQYXJlbnQgPSB0aGlzLl9wYW5lID0gbnVsbCE7XHJcblxyXG4gICAgaWYgKGlzQXR0YWNoZWQpIHtcclxuICAgICAgdGhpcy5fZGV0YWNobWVudHMubmV4dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2RldGFjaG1lbnRzLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSBoYXMgYXR0YWNoZWQgY29udGVudC4gKi9cclxuICBoYXNBdHRhY2hlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9wb3J0YWxPdXRsZXQuaGFzQXR0YWNoZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBiYWNrZHJvcCBoYXMgYmVlbiBjbGlja2VkLiAqL1xyXG4gIGJhY2tkcm9wQ2xpY2soKTogT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fYmFja2Ryb3BDbGljaztcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBvdmVybGF5IGhhcyBiZWVuIGF0dGFjaGVkLiAqL1xyXG4gIGF0dGFjaG1lbnRzKCk6IE9ic2VydmFibGU8dm9pZD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2F0dGFjaG1lbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgYW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gdGhlIG92ZXJsYXkgaGFzIGJlZW4gZGV0YWNoZWQuICovXHJcbiAgZGV0YWNobWVudHMoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGV0YWNobWVudHM7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIG9mIGtleWRvd24gZXZlbnRzIHRhcmdldGVkIHRvIHRoaXMgb3ZlcmxheS4gKi9cclxuICBrZXlkb3duRXZlbnRzKCk6IE9ic2VydmFibGU8S2V5Ym9hcmRFdmVudD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2tleWRvd25FdmVudHM7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyBhbiBvYnNlcnZhYmxlIG9mIHBvaW50ZXIgZXZlbnRzIHRhcmdldGVkIG91dHNpZGUgdGhpcyBvdmVybGF5LiAqL1xyXG4gIG91dHNpZGVQb2ludGVyRXZlbnRzKCk6IE9ic2VydmFibGU8TW91c2VFdmVudD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX291dHNpZGVQb2ludGVyRXZlbnRzO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIGN1cnJlbnQgb3ZlcmxheSBjb25maWd1cmF0aW9uLCB3aGljaCBpcyBpbW11dGFibGUuICovXHJcbiAgZ2V0Q29uZmlnKCk6IE92ZXJsYXlDb25maWcge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZztcclxuICB9XHJcblxyXG4gIC8qKiBVcGRhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3ZlcmxheSBiYXNlZCBvbiB0aGUgcG9zaXRpb24gc3RyYXRlZ3kuICovXHJcbiAgdXBkYXRlUG9zaXRpb24oKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fcG9zaXRpb25TdHJhdGVneSkge1xyXG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmFwcGx5KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoZXMgdG8gYSBuZXcgcG9zaXRpb24gc3RyYXRlZ3kgYW5kIHVwZGF0ZXMgdGhlIG92ZXJsYXkgcG9zaXRpb24uICovXHJcbiAgdXBkYXRlUG9zaXRpb25TdHJhdGVneShzdHJhdGVneTogUG9zaXRpb25TdHJhdGVneSk6IHZvaWQge1xyXG4gICAgaWYgKHN0cmF0ZWd5ID09PSB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fcG9zaXRpb25TdHJhdGVneSkge1xyXG4gICAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5LmRpc3Bvc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wb3NpdGlvblN0cmF0ZWd5ID0gc3RyYXRlZ3k7XHJcblxyXG4gICAgaWYgKHRoaXMuaGFzQXR0YWNoZWQoKSkge1xyXG4gICAgICBzdHJhdGVneS5hdHRhY2godGhpcyk7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9zaXRpb24oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBVcGRhdGUgdGhlIHNpemUgcHJvcGVydGllcyBvZiB0aGUgb3ZlcmxheS4gKi9cclxuICB1cGRhdGVTaXplKHNpemVDb25maWc6IE92ZXJsYXlTaXplQ29uZmlnKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jb25maWcgPSB7Li4udGhpcy5fY29uZmlnLCAuLi5zaXplQ29uZmlnfTtcclxuICAgIHRoaXMuX3VwZGF0ZUVsZW1lbnRTaXplKCk7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgTFRSL1JUTCBkaXJlY3Rpb24gZm9yIHRoZSBvdmVybGF5LiAqL1xyXG4gIHNldERpcmVjdGlvbihkaXI6IERpcmVjdGlvbiB8IERpcmVjdGlvbmFsaXR5KTogdm9pZCB7XHJcbiAgICB0aGlzLl9jb25maWcgPSB7Li4udGhpcy5fY29uZmlnLCBkaXJlY3Rpb246IGRpcn07XHJcbiAgICB0aGlzLl91cGRhdGVFbGVtZW50RGlyZWN0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvKiogQWRkIGEgQ1NTIGNsYXNzIG9yIGFuIGFycmF5IG9mIGNsYXNzZXMgdG8gdGhlIG92ZXJsYXkgcGFuZS4gKi9cclxuICBhZGRQYW5lbENsYXNzKGNsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fcGFuZSkge1xyXG4gICAgICB0aGlzLl90b2dnbGVDbGFzc2VzKHRoaXMuX3BhbmUsIGNsYXNzZXMsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFJlbW92ZSBhIENTUyBjbGFzcyBvciBhbiBhcnJheSBvZiBjbGFzc2VzIGZyb20gdGhlIG92ZXJsYXkgcGFuZS4gKi9cclxuICByZW1vdmVQYW5lbENsYXNzKGNsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fcGFuZSkge1xyXG4gICAgICB0aGlzLl90b2dnbGVDbGFzc2VzKHRoaXMuX3BhbmUsIGNsYXNzZXMsIGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGxheW91dCBkaXJlY3Rpb24gb2YgdGhlIG92ZXJsYXkgcGFuZWwuXHJcbiAgICovXHJcbiAgZ2V0RGlyZWN0aW9uKCk6IERpcmVjdGlvbiB7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSB0aGlzLl9jb25maWcuZGlyZWN0aW9uO1xyXG5cclxuICAgIGlmICghZGlyZWN0aW9uKSB7XHJcbiAgICAgIHJldHVybiAnbHRyJztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHlwZW9mIGRpcmVjdGlvbiA9PT0gJ3N0cmluZycgPyBkaXJlY3Rpb24gOiBkaXJlY3Rpb24udmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKiogU3dpdGNoZXMgdG8gYSBuZXcgc2Nyb2xsIHN0cmF0ZWd5LiAqL1xyXG4gIHVwZGF0ZVNjcm9sbFN0cmF0ZWd5KHN0cmF0ZWd5OiBTY3JvbGxTdHJhdGVneSk6IHZvaWQge1xyXG4gICAgaWYgKHN0cmF0ZWd5ID09PSB0aGlzLl9zY3JvbGxTdHJhdGVneSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZGlzcG9zZVNjcm9sbFN0cmF0ZWd5KCk7XHJcbiAgICB0aGlzLl9zY3JvbGxTdHJhdGVneSA9IHN0cmF0ZWd5O1xyXG5cclxuICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKCkpIHtcclxuICAgICAgc3RyYXRlZ3kuYXR0YWNoKHRoaXMpO1xyXG4gICAgICBzdHJhdGVneS5lbmFibGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBVcGRhdGVzIHRoZSB0ZXh0IGRpcmVjdGlvbiBvZiB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cclxuICBwcml2YXRlIF91cGRhdGVFbGVtZW50RGlyZWN0aW9uKCkge1xyXG4gICAgdGhpcy5faG9zdC5zZXRBdHRyaWJ1dGUoJ2RpcicsIHRoaXMuZ2V0RGlyZWN0aW9uKCkpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFVwZGF0ZXMgdGhlIHNpemUgb2YgdGhlIG92ZXJsYXkgZWxlbWVudCBiYXNlZCBvbiB0aGUgb3ZlcmxheSBjb25maWcuICovXHJcbiAgcHJpdmF0ZSBfdXBkYXRlRWxlbWVudFNpemUoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BhbmUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0eWxlID0gdGhpcy5fcGFuZS5zdHlsZTtcclxuXHJcbiAgICBzdHlsZS53aWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLndpZHRoKTtcclxuICAgIHN0eWxlLmhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLmhlaWdodCk7XHJcbiAgICBzdHlsZS5taW5XaWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLm1pbldpZHRoKTtcclxuICAgIHN0eWxlLm1pbkhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLm1pbkhlaWdodCk7XHJcbiAgICBzdHlsZS5tYXhXaWR0aCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLm1heFdpZHRoKTtcclxuICAgIHN0eWxlLm1heEhlaWdodCA9IGNvZXJjZUNzc1BpeGVsVmFsdWUodGhpcy5fY29uZmlnLm1heEhlaWdodCk7XHJcbiAgfVxyXG5cclxuICAvKiogVG9nZ2xlcyB0aGUgcG9pbnRlciBldmVudHMgZm9yIHRoZSBvdmVybGF5IHBhbmUgZWxlbWVudC4gKi9cclxuICBwcml2YXRlIF90b2dnbGVQb2ludGVyRXZlbnRzKGVuYWJsZVBvaW50ZXI6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX3BhbmUuc3R5bGUucG9pbnRlckV2ZW50cyA9IGVuYWJsZVBvaW50ZXIgPyAnJyA6ICdub25lJztcclxuICB9XHJcblxyXG4gIC8qKiBBdHRhY2hlcyBhIGJhY2tkcm9wIGZvciB0aGlzIG92ZXJsYXkuICovXHJcbiAgcHJpdmF0ZSBfYXR0YWNoQmFja2Ryb3AoKSB7XHJcbiAgICBjb25zdCBzaG93aW5nQ2xhc3MgPSAnY2RrLW92ZXJsYXktYmFja2Ryb3Atc2hvd2luZyc7XHJcblxyXG4gICAgdGhpcy5fYmFja2Ryb3BFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0aGlzLl9iYWNrZHJvcEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2RrLW92ZXJsYXktYmFja2Ryb3AnKTtcclxuXHJcbiAgICBpZiAodGhpcy5fY29uZmlnLmJhY2tkcm9wQ2xhc3MpIHtcclxuICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Nlcyh0aGlzLl9iYWNrZHJvcEVsZW1lbnQsIHRoaXMuX2NvbmZpZy5iYWNrZHJvcENsYXNzLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbnNlcnQgdGhlIGJhY2tkcm9wIGJlZm9yZSB0aGUgcGFuZSBpbiB0aGUgRE9NIG9yZGVyLFxyXG4gICAgLy8gaW4gb3JkZXIgdG8gaGFuZGxlIHN0YWNrZWQgb3ZlcmxheXMgcHJvcGVybHkuXHJcbiAgICB0aGlzLl9ob3N0LnBhcmVudEVsZW1lbnQhLmluc2VydEJlZm9yZSh0aGlzLl9iYWNrZHJvcEVsZW1lbnQsIHRoaXMuX2hvc3QpO1xyXG5cclxuICAgIC8vIEZvcndhcmQgYmFja2Ryb3AgY2xpY2tzIHN1Y2ggdGhhdCB0aGUgY29uc3VtZXIgb2YgdGhlIG92ZXJsYXkgY2FuIHBlcmZvcm0gd2hhdGV2ZXJcclxuICAgIC8vIGFjdGlvbiBkZXNpcmVkIHdoZW4gc3VjaCBhIGNsaWNrIG9jY3VycyAodXN1YWxseSBjbG9zaW5nIHRoZSBvdmVybGF5KS5cclxuICAgIHRoaXMuX2JhY2tkcm9wRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2JhY2tkcm9wQ2xpY2tIYW5kbGVyKTtcclxuXHJcbiAgICAvLyBBZGQgY2xhc3MgdG8gZmFkZS1pbiB0aGUgYmFja2Ryb3AgYWZ0ZXIgb25lIGZyYW1lLlxyXG4gICAgaWYgKHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgIGlmICh0aGlzLl9iYWNrZHJvcEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fYmFja2Ryb3BFbGVtZW50LmNsYXNzTGlzdC5hZGQoc2hvd2luZ0NsYXNzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9iYWNrZHJvcEVsZW1lbnQuY2xhc3NMaXN0LmFkZChzaG93aW5nQ2xhc3MpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgc3RhY2tpbmcgb3JkZXIgb2YgdGhlIGVsZW1lbnQsIG1vdmluZyBpdCB0byB0aGUgdG9wIGlmIG5lY2Vzc2FyeS5cclxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGluIGNhc2VzIHdoZXJlIG9uZSBvdmVybGF5IHdhcyBkZXRhY2hlZCwgd2hpbGUgYW5vdGhlciBvbmUsXHJcbiAgICogdGhhdCBzaG91bGQgYmUgYmVoaW5kIGl0LCB3YXMgZGVzdHJveWVkLiBUaGUgbmV4dCB0aW1lIGJvdGggb2YgdGhlbSBhcmUgb3BlbmVkLFxyXG4gICAqIHRoZSBzdGFja2luZyB3aWxsIGJlIHdyb25nLCBiZWNhdXNlIHRoZSBkZXRhY2hlZCBlbGVtZW50J3MgcGFuZSB3aWxsIHN0aWxsIGJlXHJcbiAgICogaW4gaXRzIG9yaWdpbmFsIERPTSBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIF91cGRhdGVTdGFja2luZ09yZGVyKCkge1xyXG4gICAgaWYgKHRoaXMuX2hvc3QubmV4dFNpYmxpbmcpIHtcclxuICAgICAgdGhpcy5faG9zdC5wYXJlbnROb2RlIS5hcHBlbmRDaGlsZCh0aGlzLl9ob3N0KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBEZXRhY2hlcyB0aGUgYmFja2Ryb3AgKGlmIGFueSkgYXNzb2NpYXRlZCB3aXRoIHRoZSBvdmVybGF5LiAqL1xyXG4gIGRldGFjaEJhY2tkcm9wKCk6IHZvaWQge1xyXG4gICAgbGV0IGJhY2tkcm9wVG9EZXRhY2ggPSB0aGlzLl9iYWNrZHJvcEVsZW1lbnQ7XHJcblxyXG4gICAgaWYgKCFiYWNrZHJvcFRvRGV0YWNoKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgdGltZW91dElkOiBudW1iZXI7XHJcbiAgICBsZXQgZmluaXNoRGV0YWNoID0gKCkgPT4ge1xyXG4gICAgICAvLyBJdCBtYXkgbm90IGJlIGF0dGFjaGVkIHRvIGFueXRoaW5nIGluIGNlcnRhaW4gY2FzZXMgKGUuZy4gdW5pdCB0ZXN0cykuXHJcbiAgICAgIGlmIChiYWNrZHJvcFRvRGV0YWNoKSB7XHJcbiAgICAgICAgYmFja2Ryb3BUb0RldGFjaC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2JhY2tkcm9wQ2xpY2tIYW5kbGVyKTtcclxuICAgICAgICBiYWNrZHJvcFRvRGV0YWNoLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmaW5pc2hEZXRhY2gpO1xyXG5cclxuICAgICAgICBpZiAoYmFja2Ryb3BUb0RldGFjaC5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgICBiYWNrZHJvcFRvRGV0YWNoLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYmFja2Ryb3BUb0RldGFjaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJdCBpcyBwb3NzaWJsZSB0aGF0IGEgbmV3IHBvcnRhbCBoYXMgYmVlbiBhdHRhY2hlZCB0byB0aGlzIG92ZXJsYXkgc2luY2Ugd2Ugc3RhcnRlZFxyXG4gICAgICAvLyByZW1vdmluZyB0aGUgYmFja2Ryb3AuIElmIHRoYXQgaXMgdGhlIGNhc2UsIG9ubHkgY2xlYXIgdGhlIGJhY2tkcm9wIHJlZmVyZW5jZSBpZiBpdFxyXG4gICAgICAvLyBpcyBzdGlsbCB0aGUgc2FtZSBpbnN0YW5jZSB0aGF0IHdlIHN0YXJ0ZWQgdG8gcmVtb3ZlLlxyXG4gICAgICBpZiAodGhpcy5fYmFja2Ryb3BFbGVtZW50ID09IGJhY2tkcm9wVG9EZXRhY2gpIHtcclxuICAgICAgICB0aGlzLl9iYWNrZHJvcEVsZW1lbnQgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodGhpcy5fY29uZmlnLmJhY2tkcm9wQ2xhc3MpIHtcclxuICAgICAgICB0aGlzLl90b2dnbGVDbGFzc2VzKGJhY2tkcm9wVG9EZXRhY2ghLCB0aGlzLl9jb25maWcuYmFja2Ryb3BDbGFzcywgZmFsc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcclxuICAgIH07XHJcblxyXG4gICAgYmFja2Ryb3BUb0RldGFjaC5jbGFzc0xpc3QucmVtb3ZlKCdjZGstb3ZlcmxheS1iYWNrZHJvcC1zaG93aW5nJyk7XHJcblxyXG4gICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgYmFja2Ryb3BUb0RldGFjaCEuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZpbmlzaERldGFjaCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBJZiB0aGUgYmFja2Ryb3AgZG9lc24ndCBoYXZlIGEgdHJhbnNpdGlvbiwgdGhlIGB0cmFuc2l0aW9uZW5kYCBldmVudCB3b24ndCBmaXJlLlxyXG4gICAgLy8gSW4gdGhpcyBjYXNlIHdlIG1ha2UgaXQgdW5jbGlja2FibGUgYW5kIHdlIHRyeSB0byByZW1vdmUgaXQgYWZ0ZXIgYSBkZWxheS5cclxuICAgIGJhY2tkcm9wVG9EZXRhY2guc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuXHJcbiAgICAvLyBSdW4gdGhpcyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUgYmVjYXVzZSB0aGVyZSdzIG5vdGhpbmcgdGhhdCBBbmd1bGFyIGNhcmVzIGFib3V0LlxyXG4gICAgLy8gSWYgaXQgd2VyZSB0byBydW4gaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIGV2ZXJ5IHRlc3QgdGhhdCB1c2VkIE92ZXJsYXkgd291bGQgaGF2ZSB0byBiZVxyXG4gICAgLy8gZWl0aGVyIGFzeW5jIG9yIGZha2VBc3luYy5cclxuICAgIHRpbWVvdXRJZCA9IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBzZXRUaW1lb3V0KGZpbmlzaERldGFjaCwgNTAwKSk7XHJcbiAgfVxyXG5cclxuICAvKiogVG9nZ2xlcyBhIHNpbmdsZSBDU1MgY2xhc3Mgb3IgYW4gYXJyYXkgb2YgY2xhc3NlcyBvbiBhbiBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzZXMoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNzc0NsYXNzZXM6IHN0cmluZyB8IHN0cmluZ1tdLCBpc0FkZDogYm9vbGVhbikge1xyXG4gICAgY29uc3QgY2xhc3NMaXN0ID0gZWxlbWVudC5jbGFzc0xpc3Q7XHJcblxyXG4gICAgY29lcmNlQXJyYXkoY3NzQ2xhc3NlcykuZm9yRWFjaChjc3NDbGFzcyA9PiB7XHJcbiAgICAgIC8vIFdlIGNhbid0IGRvIGEgc3ByZWFkIGhlcmUsIGJlY2F1c2UgSUUgZG9lc24ndCBzdXBwb3J0IHNldHRpbmcgbXVsdGlwbGUgY2xhc3Nlcy5cclxuICAgICAgLy8gQWxzbyB0cnlpbmcgdG8gYWRkIGFuIGVtcHR5IHN0cmluZyB0byBhIERPTVRva2VuTGlzdCB3aWxsIHRocm93LlxyXG4gICAgICBpZiAoY3NzQ2xhc3MpIHtcclxuICAgICAgICBpc0FkZCA/IGNsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpIDogY2xhc3NMaXN0LnJlbW92ZShjc3NDbGFzcyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIERldGFjaGVzIHRoZSBvdmVybGF5IGNvbnRlbnQgbmV4dCB0aW1lIHRoZSB6b25lIHN0YWJpbGl6ZXMuICovXHJcbiAgcHJpdmF0ZSBfZGV0YWNoQ29udGVudFdoZW5TdGFibGUoKSB7XHJcbiAgICAvLyBOb3JtYWxseSB3ZSB3b3VsZG4ndCBoYXZlIHRvIGV4cGxpY2l0bHkgcnVuIHRoaXMgb3V0c2lkZSB0aGUgYE5nWm9uZWAsIGhvd2V2ZXJcclxuICAgIC8vIGlmIHRoZSBjb25zdW1lciBpcyB1c2luZyBgem9uZS1wYXRjaC1yeGpzYCwgdGhlIGBTdWJzY3JpcHRpb24udW5zdWJzY3JpYmVgIGNhbGwgd2lsbFxyXG4gICAgLy8gYmUgcGF0Y2hlZCB0byBydW4gaW5zaWRlIHRoZSB6b25lLCB3aGljaCB3aWxsIHRocm93IHVzIGludG8gYW4gaW5maW5pdGUgbG9vcC5cclxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIC8vIFdlIGNhbid0IHJlbW92ZSB0aGUgaG9zdCBoZXJlIGltbWVkaWF0ZWx5LCBiZWNhdXNlIHRoZSBvdmVybGF5IHBhbmUncyBjb250ZW50XHJcbiAgICAgIC8vIG1pZ2h0IHN0aWxsIGJlIGFuaW1hdGluZy4gVGhpcyBzdHJlYW0gaGVscHMgdXMgYXZvaWQgaW50ZXJydXB0aW5nIHRoZSBhbmltYXRpb25cclxuICAgICAgLy8gYnkgd2FpdGluZyBmb3IgdGhlIHBhbmUgdG8gYmVjb21lIGVtcHR5LlxyXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLl9uZ1pvbmUub25TdGFibGVcclxuICAgICAgICAucGlwZSh0YWtlVW50aWwobWVyZ2UodGhpcy5fYXR0YWNobWVudHMsIHRoaXMuX2RldGFjaG1lbnRzKSkpXHJcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAvLyBOZWVkcyBhIGNvdXBsZSBvZiBjaGVja3MgZm9yIHRoZSBwYW5lIGFuZCBob3N0LCBiZWNhdXNlXHJcbiAgICAgICAgICAvLyB0aGV5IG1heSBoYXZlIGJlZW4gcmVtb3ZlZCBieSB0aGUgdGltZSB0aGUgem9uZSBzdGFiaWxpemVzLlxyXG4gICAgICAgICAgaWYgKCF0aGlzLl9wYW5lIHx8ICF0aGlzLl9ob3N0IHx8IHRoaXMuX3BhbmUuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wYW5lICYmIHRoaXMuX2NvbmZpZy5wYW5lbENsYXNzKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5fdG9nZ2xlQ2xhc3Nlcyh0aGlzLl9wYW5lLCB0aGlzLl9jb25maWcucGFuZWxDbGFzcywgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faG9zdCAmJiB0aGlzLl9ob3N0LnBhcmVudEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICB0aGlzLl9wcmV2aW91c0hvc3RQYXJlbnQgPSB0aGlzLl9ob3N0LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNIb3N0UGFyZW50LnJlbW92ZUNoaWxkKHRoaXMuX2hvc3QpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIERpc3Bvc2VzIG9mIGEgc2Nyb2xsIHN0cmF0ZWd5LiAqL1xyXG4gIHByaXZhdGUgX2Rpc3Bvc2VTY3JvbGxTdHJhdGVneSgpIHtcclxuICAgIGNvbnN0IHNjcm9sbFN0cmF0ZWd5ID0gdGhpcy5fc2Nyb2xsU3RyYXRlZ3k7XHJcblxyXG4gICAgaWYgKHNjcm9sbFN0cmF0ZWd5KSB7XHJcbiAgICAgIHNjcm9sbFN0cmF0ZWd5LmRpc2FibGUoKTtcclxuXHJcbiAgICAgIGlmIChzY3JvbGxTdHJhdGVneS5kZXRhY2gpIHtcclxuICAgICAgICBzY3JvbGxTdHJhdGVneS5kZXRhY2goKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8qKiBTaXplIHByb3BlcnRpZXMgZm9yIGFuIG92ZXJsYXkuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3ZlcmxheVNpemVDb25maWcge1xyXG4gIHdpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xyXG4gIGhlaWdodD86IG51bWJlciB8IHN0cmluZztcclxuICBtaW5XaWR0aD86IG51bWJlciB8IHN0cmluZztcclxuICBtaW5IZWlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgbWF4V2lkdGg/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgbWF4SGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xyXG59XHJcbiJdfQ==