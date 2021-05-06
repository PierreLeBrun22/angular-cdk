/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform, normalizePassiveListenerOptions, _getShadowRoot } from '@angular/cdk/platform';
import { Directive, ElementRef, EventEmitter, Inject, Injectable, InjectionToken, NgZone, Optional, Output, } from '@angular/core';
import { of as observableOf, Subject } from 'rxjs';
import { coerceElement } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import { isFakeMousedownFromScreenReader, isFakeTouchstartFromScreenReader, } from '../fake-event-detection';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
// This is the value used by AngularJS Material. Through trial and error (on iPhone 6S) they found
// that a value of around 650ms seems appropriate.
export const TOUCH_BUFFER_MS = 650;
/** InjectionToken for FocusMonitorOptions. */
export const FOCUS_MONITOR_DEFAULT_OPTIONS = new InjectionToken('cdk-focus-monitor-default-options');
/**
 * Event listener options that enable capturing and also
 * mark the listener as passive if the browser supports it.
 */
const captureEventListenerOptions = normalizePassiveListenerOptions({
    passive: true,
    capture: true
});
/** Monitors mouse and keyboard events to determine the cause of focus events. */
export class FocusMonitor {
    constructor(_ngZone, _platform, 
    /** @breaking-change 11.0.0 make document required */
    document, options) {
        this._ngZone = _ngZone;
        this._platform = _platform;
        /** The focus origin that the next focus event is a result of. */
        this._origin = null;
        /** Whether the window has just been focused. */
        this._windowFocused = false;
        /** Map of elements being monitored to their info. */
        this._elementInfo = new Map();
        /** The number of elements currently being monitored. */
        this._monitoredElementCount = 0;
        /**
         * Keeps track of the root nodes to which we've currently bound a focus/blur handler,
         * as well as the number of monitored elements that they contain. We have to treat focus/blur
         * handlers differently from the rest of the events, because the browser won't emit events
         * to the document when focus moves inside of a shadow root.
         */
        this._rootNodeFocusListenerCount = new Map();
        /**
         * Event listener for `keydown` events on the document.
         * Needs to be an arrow function in order to preserve the context when it gets bound.
         */
        this._documentKeydownListener = () => {
            // On keydown record the origin and clear any touch event that may be in progress.
            this._lastTouchTarget = null;
            this._setOriginForCurrentEventQueue('keyboard');
        };
        /**
         * Event listener for `mousedown` events on the document.
         * Needs to be an arrow function in order to preserve the context when it gets bound.
         */
        this._documentMousedownListener = (event) => {
            // On mousedown record the origin only if there is not touch
            // target, since a mousedown can happen as a result of a touch event.
            if (!this._lastTouchTarget) {
                // In some cases screen readers fire fake `mousedown` events instead of `keydown`.
                // Resolve the focus source to `keyboard` if we detect one of them.
                const source = isFakeMousedownFromScreenReader(event) ? 'keyboard' : 'mouse';
                this._setOriginForCurrentEventQueue(source);
            }
        };
        /**
         * Event listener for `touchstart` events on the document.
         * Needs to be an arrow function in order to preserve the context when it gets bound.
         */
        this._documentTouchstartListener = (event) => {
            // Some screen readers will fire a fake `touchstart` event if an element is activated using
            // the keyboard while on a device with a touchsreen. Consider such events as keyboard focus.
            if (!isFakeTouchstartFromScreenReader(event)) {
                // When the touchstart event fires the focus event is not yet in the event queue. This means
                // we can't rely on the trick used above (setting timeout of 1ms). Instead we wait 650ms to
                // see if a focus happens.
                if (this._touchTimeoutId != null) {
                    clearTimeout(this._touchTimeoutId);
                }
                this._lastTouchTarget = getTarget(event);
                this._touchTimeoutId = setTimeout(() => this._lastTouchTarget = null, TOUCH_BUFFER_MS);
            }
            else if (!this._lastTouchTarget) {
                this._setOriginForCurrentEventQueue('keyboard');
            }
        };
        /**
         * Event listener for `focus` events on the window.
         * Needs to be an arrow function in order to preserve the context when it gets bound.
         */
        this._windowFocusListener = () => {
            // Make a note of when the window regains focus, so we can
            // restore the origin info for the focused element.
            this._windowFocused = true;
            this._windowFocusTimeoutId = setTimeout(() => this._windowFocused = false);
        };
        /**
         * Event listener for `focus` and 'blur' events on the document.
         * Needs to be an arrow function in order to preserve the context when it gets bound.
         */
        this._rootNodeFocusAndBlurListener = (event) => {
            const target = getTarget(event);
            const handler = event.type === 'focus' ? this._onFocus : this._onBlur;
            // We need to walk up the ancestor chain in order to support `checkChildren`.
            for (let element = target; element; element = element.parentElement) {
                handler.call(this, event, element);
            }
        };
        this._document = document;
        this._detectionMode = (options === null || options === void 0 ? void 0 : options.detectionMode) || 0 /* IMMEDIATE */;
    }
    monitor(element, checkChildren = false) {
        const nativeElement = coerceElement(element);
        // Do nothing if we're not on the browser platform or the passed in node isn't an element.
        if (!this._platform.isBrowser || nativeElement.nodeType !== 1) {
            return observableOf(null);
        }
        // If the element is inside the shadow DOM, we need to bind our focus/blur listeners to
        // the shadow root, rather than the `document`, because the browser won't emit focus events
        // to the `document`, if focus is moving within the same shadow root.
        const rootNode = _getShadowRoot(nativeElement) || this._getDocument();
        const cachedInfo = this._elementInfo.get(nativeElement);
        // Check if we're already monitoring this element.
        if (cachedInfo) {
            if (checkChildren) {
                // TODO(COMP-318): this can be problematic, because it'll turn all non-checkChildren
                // observers into ones that behave as if `checkChildren` was turned on. We need a more
                // robust solution.
                cachedInfo.checkChildren = true;
            }
            return cachedInfo.subject;
        }
        // Create monitored element info.
        const info = {
            checkChildren: checkChildren,
            subject: new Subject(),
            rootNode
        };
        this._elementInfo.set(nativeElement, info);
        this._registerGlobalListeners(info);
        return info.subject;
    }
    stopMonitoring(element) {
        const nativeElement = coerceElement(element);
        const elementInfo = this._elementInfo.get(nativeElement);
        if (elementInfo) {
            elementInfo.subject.complete();
            this._setClasses(nativeElement);
            this._elementInfo.delete(nativeElement);
            this._removeGlobalListeners(elementInfo);
        }
    }
    focusVia(element, origin, options) {
        const nativeElement = coerceElement(element);
        const focusedElement = this._getDocument().activeElement;
        // If the element is focused already, calling `focus` again won't trigger the event listener
        // which means that the focus classes won't be updated. If that's the case, update the classes
        // directly without waiting for an event.
        if (nativeElement === focusedElement) {
            this._getClosestElementsInfo(nativeElement)
                .forEach(([currentElement, info]) => this._originChanged(currentElement, origin, info));
        }
        else {
            this._setOriginForCurrentEventQueue(origin);
            // `focus` isn't available on the server
            if (typeof nativeElement.focus === 'function') {
                nativeElement.focus(options);
            }
        }
    }
    ngOnDestroy() {
        this._elementInfo.forEach((_info, element) => this.stopMonitoring(element));
    }
    /** Access injected document if available or fallback to global document reference */
    _getDocument() {
        return this._document || document;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        const doc = this._getDocument();
        return doc.defaultView || window;
    }
    _toggleClass(element, className, shouldSet) {
        if (shouldSet) {
            element.classList.add(className);
        }
        else {
            element.classList.remove(className);
        }
    }
    _getFocusOrigin(event) {
        // If we couldn't detect a cause for the focus event, it's due to one of three reasons:
        // 1) The window has just regained focus, in which case we want to restore the focused state of
        //    the element from before the window blurred.
        // 2) It was caused by a touch event, in which case we mark the origin as 'touch'.
        // 3) The element was programmatically focused, in which case we should mark the origin as
        //    'program'.
        if (this._origin) {
            return this._origin;
        }
        if (this._windowFocused && this._lastFocusOrigin) {
            return this._lastFocusOrigin;
        }
        else if (this._wasCausedByTouch(event)) {
            return 'touch';
        }
        else {
            return 'program';
        }
    }
    /**
     * Sets the focus classes on the element based on the given focus origin.
     * @param element The element to update the classes on.
     * @param origin The focus origin.
     */
    _setClasses(element, origin) {
        this._toggleClass(element, 'cdk-focused', !!origin);
        this._toggleClass(element, 'cdk-touch-focused', origin === 'touch');
        this._toggleClass(element, 'cdk-keyboard-focused', origin === 'keyboard');
        this._toggleClass(element, 'cdk-mouse-focused', origin === 'mouse');
        this._toggleClass(element, 'cdk-program-focused', origin === 'program');
    }
    /**
     * Sets the origin and schedules an async function to clear it at the end of the event queue.
     * If the detection mode is 'eventual', the origin is never cleared.
     * @param origin The origin to set.
     */
    _setOriginForCurrentEventQueue(origin) {
        this._ngZone.runOutsideAngular(() => {
            this._origin = origin;
            if (this._detectionMode === 0 /* IMMEDIATE */) {
                // Sometimes the focus origin won't be valid in Firefox because Firefox seems to focus *one*
                // tick after the interaction event fired. To ensure the focus origin is always correct,
                // the focus origin will be determined at the beginning of the next tick.
                this._originTimeoutId = setTimeout(() => this._origin = null, 1);
            }
        });
    }
    /**
     * Checks whether the given focus event was caused by a touchstart event.
     * @param event The focus event to check.
     * @returns Whether the event was caused by a touch.
     */
    _wasCausedByTouch(event) {
        // Note(mmalerba): This implementation is not quite perfect, there is a small edge case.
        // Consider the following dom structure:
        //
        // <div #parent tabindex="0" cdkFocusClasses>
        //   <div #child (click)="#parent.focus()"></div>
        // </div>
        //
        // If the user touches the #child element and the #parent is programmatically focused as a
        // result, this code will still consider it to have been caused by the touch event and will
        // apply the cdk-touch-focused class rather than the cdk-program-focused class. This is a
        // relatively small edge-case that can be worked around by using
        // focusVia(parentEl, 'program') to focus the parent element.
        //
        // If we decide that we absolutely must handle this case correctly, we can do so by listening
        // for the first focus event after the touchstart, and then the first blur event after that
        // focus event. When that blur event fires we know that whatever follows is not a result of the
        // touchstart.
        const focusTarget = getTarget(event);
        return this._lastTouchTarget instanceof Node && focusTarget instanceof Node &&
            (focusTarget === this._lastTouchTarget || focusTarget.contains(this._lastTouchTarget));
    }
    /**
     * Handles focus events on a registered element.
     * @param event The focus event.
     * @param element The monitored element.
     */
    _onFocus(event, element) {
        // NOTE(mmalerba): We currently set the classes based on the focus origin of the most recent
        // focus event affecting the monitored element. If we want to use the origin of the first event
        // instead we should check for the cdk-focused class here and return if the element already has
        // it. (This only matters for elements that have includesChildren = true).
        // If we are not counting child-element-focus as focused, make sure that the event target is the
        // monitored element itself.
        const elementInfo = this._elementInfo.get(element);
        if (!elementInfo || (!elementInfo.checkChildren && element !== getTarget(event))) {
            return;
        }
        this._originChanged(element, this._getFocusOrigin(event), elementInfo);
    }
    /**
     * Handles blur events on a registered element.
     * @param event The blur event.
     * @param element The monitored element.
     */
    _onBlur(event, element) {
        // If we are counting child-element-focus as focused, make sure that we aren't just blurring in
        // order to focus another child of the monitored element.
        const elementInfo = this._elementInfo.get(element);
        if (!elementInfo || (elementInfo.checkChildren && event.relatedTarget instanceof Node &&
            element.contains(event.relatedTarget))) {
            return;
        }
        this._setClasses(element);
        this._emitOrigin(elementInfo.subject, null);
    }
    _emitOrigin(subject, origin) {
        this._ngZone.run(() => subject.next(origin));
    }
    _registerGlobalListeners(elementInfo) {
        if (!this._platform.isBrowser) {
            return;
        }
        const rootNode = elementInfo.rootNode;
        const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode) || 0;
        if (!rootNodeFocusListeners) {
            this._ngZone.runOutsideAngular(() => {
                rootNode.addEventListener('focus', this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
                rootNode.addEventListener('blur', this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
            });
        }
        this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners + 1);
        // Register global listeners when first element is monitored.
        if (++this._monitoredElementCount === 1) {
            // Note: we listen to events in the capture phase so we
            // can detect them even if the user stops propagation.
            this._ngZone.runOutsideAngular(() => {
                const document = this._getDocument();
                const window = this._getWindow();
                document.addEventListener('keydown', this._documentKeydownListener, captureEventListenerOptions);
                document.addEventListener('mousedown', this._documentMousedownListener, captureEventListenerOptions);
                document.addEventListener('touchstart', this._documentTouchstartListener, captureEventListenerOptions);
                window.addEventListener('focus', this._windowFocusListener);
            });
        }
    }
    _removeGlobalListeners(elementInfo) {
        const rootNode = elementInfo.rootNode;
        if (this._rootNodeFocusListenerCount.has(rootNode)) {
            const rootNodeFocusListeners = this._rootNodeFocusListenerCount.get(rootNode);
            if (rootNodeFocusListeners > 1) {
                this._rootNodeFocusListenerCount.set(rootNode, rootNodeFocusListeners - 1);
            }
            else {
                rootNode.removeEventListener('focus', this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
                rootNode.removeEventListener('blur', this._rootNodeFocusAndBlurListener, captureEventListenerOptions);
                this._rootNodeFocusListenerCount.delete(rootNode);
            }
        }
        // Unregister global listeners when last element is unmonitored.
        if (!--this._monitoredElementCount) {
            const document = this._getDocument();
            const window = this._getWindow();
            document.removeEventListener('keydown', this._documentKeydownListener, captureEventListenerOptions);
            document.removeEventListener('mousedown', this._documentMousedownListener, captureEventListenerOptions);
            document.removeEventListener('touchstart', this._documentTouchstartListener, captureEventListenerOptions);
            window.removeEventListener('focus', this._windowFocusListener);
            // Clear timeouts for all potentially pending timeouts to prevent the leaks.
            clearTimeout(this._windowFocusTimeoutId);
            clearTimeout(this._touchTimeoutId);
            clearTimeout(this._originTimeoutId);
        }
    }
    /** Updates all the state on an element once its focus origin has changed. */
    _originChanged(element, origin, elementInfo) {
        this._setClasses(element, origin);
        this._emitOrigin(elementInfo.subject, origin);
        this._lastFocusOrigin = origin;
    }
    /**
     * Collects the `MonitoredElementInfo` of a particular element and
     * all of its ancestors that have enabled `checkChildren`.
     * @param element Element from which to start the search.
     */
    _getClosestElementsInfo(element) {
        const results = [];
        this._elementInfo.forEach((info, currentElement) => {
            if (currentElement === element || (info.checkChildren && currentElement.contains(element))) {
                results.push([currentElement, info]);
            }
        });
        return results;
    }
}
FocusMonitor.ɵprov = i0.ɵɵdefineInjectable({ factory: function FocusMonitor_Factory() { return new FocusMonitor(i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i2.DOCUMENT, 8), i0.ɵɵinject(FOCUS_MONITOR_DEFAULT_OPTIONS, 8)); }, token: FocusMonitor, providedIn: "root" });
FocusMonitor.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
FocusMonitor.ctorParameters = () => [
    { type: NgZone },
    { type: Platform },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [FOCUS_MONITOR_DEFAULT_OPTIONS,] }] }
];
/** Gets the target of an event, accounting for Shadow DOM. */
function getTarget(event) {
    // If an event is bound outside the Shadow DOM, the `event.target` will
    // point to the shadow root so we have to use `composedPath` instead.
    return (event.composedPath ? event.composedPath()[0] : event.target);
}
/**
 * Directive that determines how a particular element was focused (via keyboard, mouse, touch, or
 * programmatically) and adds corresponding classes to the element.
 *
 * There are two variants of this directive:
 * 1) cdkMonitorElementFocus: does not consider an element to be focused if one of its children is
 *    focused.
 * 2) cdkMonitorSubtreeFocus: considers an element focused if it or any of its children are focused.
 */
export class CdkMonitorFocus {
    constructor(_elementRef, _focusMonitor) {
        this._elementRef = _elementRef;
        this._focusMonitor = _focusMonitor;
        this.cdkFocusChange = new EventEmitter();
    }
    ngAfterViewInit() {
        const element = this._elementRef.nativeElement;
        this._monitorSubscription = this._focusMonitor.monitor(element, element.nodeType === 1 && element.hasAttribute('cdkMonitorSubtreeFocus'))
            .subscribe(origin => this.cdkFocusChange.emit(origin));
    }
    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef);
        if (this._monitorSubscription) {
            this._monitorSubscription.unsubscribe();
        }
    }
}
CdkMonitorFocus.decorators = [
    { type: Directive, args: [{
                selector: '[cdkMonitorElementFocus], [cdkMonitorSubtreeFocus]',
            },] }
];
CdkMonitorFocus.ctorParameters = () => [
    { type: ElementRef },
    { type: FocusMonitor }
];
CdkMonitorFocus.propDecorators = {
    cdkFocusChange: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9jdXMtbW9uaXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9mb2N1cy1tb25pdG9yL2ZvY3VzLW1vbml0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSwrQkFBK0IsRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNoRyxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osTUFBTSxFQUNOLFVBQVUsRUFDVixjQUFjLEVBQ2QsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEdBRVAsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFhLEVBQUUsSUFBSSxZQUFZLEVBQUUsT0FBTyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQzNFLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUNwRCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUNMLCtCQUErQixFQUMvQixnQ0FBZ0MsR0FDakMsTUFBTSx5QkFBeUIsQ0FBQzs7OztBQUdqQyxrR0FBa0c7QUFDbEcsa0RBQWtEO0FBQ2xELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUM7QUFrQ25DLDhDQUE4QztBQUM5QyxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FDdEMsSUFBSSxjQUFjLENBQXNCLG1DQUFtQyxDQUFDLENBQUM7QUFRakY7OztHQUdHO0FBQ0gsTUFBTSwyQkFBMkIsR0FBRywrQkFBK0IsQ0FBQztJQUNsRSxPQUFPLEVBQUUsSUFBSTtJQUNiLE9BQU8sRUFBRSxJQUFJO0NBQ2QsQ0FBQyxDQUFDO0FBR0gsaUZBQWlGO0FBRWpGLE1BQU0sT0FBTyxZQUFZO0lBdUd2QixZQUNZLE9BQWUsRUFDZixTQUFtQjtJQUMzQixxREFBcUQ7SUFDdkIsUUFB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LEVBQVUsYUFBMkI7UUFBekUsZ0JBQVcsR0FBWCxXQUFXLENBQXlCO1FBQVUsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFGbkYsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBZSxDQUFDO0lBRXFDLENBQUM7SUFFakcsZUFBZTtRQUNiLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDO1FBQy9DLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FDcEQsT0FBTyxFQUNQLE9BQU8sQ0FBQyxRQUFRLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMxRSxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRXBELElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO1lBQzdCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN6QztJQUNILENBQUM7OztZQXZCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG9EQUFvRDthQUMvRDs7O1lBaGxCQyxVQUFVO1lBcWxCdUUsWUFBWTs7OzZCQUY1RixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1BsYXRmb3JtLCBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zLCBfZ2V0U2hhZG93Um9vdH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgSW5qZWN0LFxyXG4gIEluamVjdGFibGUsXHJcbiAgSW5qZWN0aW9uVG9rZW4sXHJcbiAgTmdab25lLFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxuICBPdXRwdXQsXHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtPYnNlcnZhYmxlLCBvZiBhcyBvYnNlcnZhYmxlT2YsIFN1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7Y29lcmNlRWxlbWVudH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtcclxuICBpc0Zha2VNb3VzZWRvd25Gcm9tU2NyZWVuUmVhZGVyLFxyXG4gIGlzRmFrZVRvdWNoc3RhcnRGcm9tU2NyZWVuUmVhZGVyLFxyXG59IGZyb20gJy4uL2Zha2UtZXZlbnQtZGV0ZWN0aW9uJztcclxuXHJcblxyXG4vLyBUaGlzIGlzIHRoZSB2YWx1ZSB1c2VkIGJ5IEFuZ3VsYXJKUyBNYXRlcmlhbC4gVGhyb3VnaCB0cmlhbCBhbmQgZXJyb3IgKG9uIGlQaG9uZSA2UykgdGhleSBmb3VuZFxyXG4vLyB0aGF0IGEgdmFsdWUgb2YgYXJvdW5kIDY1MG1zIHNlZW1zIGFwcHJvcHJpYXRlLlxyXG5leHBvcnQgY29uc3QgVE9VQ0hfQlVGRkVSX01TID0gNjUwO1xyXG5cclxuXHJcbmV4cG9ydCB0eXBlIEZvY3VzT3JpZ2luID0gJ3RvdWNoJyB8ICdtb3VzZScgfCAna2V5Ym9hcmQnIHwgJ3Byb2dyYW0nIHwgbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBDb3JyZXNwb25kcyB0byB0aGUgb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgdG8gdGhlIG5hdGl2ZSBgZm9jdXNgIGV2ZW50LlxyXG4gKiB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxFbGVtZW50L2ZvY3VzXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzT3B0aW9ucyB7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIGJyb3dzZXIgc2hvdWxkIHNjcm9sbCB0byB0aGUgZWxlbWVudCB3aGVuIGl0IGlzIGZvY3VzZWQuICovXHJcbiAgcHJldmVudFNjcm9sbD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKiBEZXRlY3Rpb24gbW9kZSB1c2VkIGZvciBhdHRyaWJ1dGluZyB0aGUgb3JpZ2luIG9mIGEgZm9jdXMgZXZlbnQuICovXHJcbmV4cG9ydCBjb25zdCBlbnVtIEZvY3VzTW9uaXRvckRldGVjdGlvbk1vZGUge1xyXG4gIC8qKlxyXG4gICAqIEFueSBtb3VzZWRvd24sIGtleWRvd24sIG9yIHRvdWNoc3RhcnQgZXZlbnQgdGhhdCBoYXBwZW5lZCBpbiB0aGUgcHJldmlvdXNcclxuICAgKiB0aWNrIG9yIHRoZSBjdXJyZW50IHRpY2sgd2lsbCBiZSB1c2VkIHRvIGFzc2lnbiBhIGZvY3VzIGV2ZW50J3Mgb3JpZ2luICh0b1xyXG4gICAqIGVpdGhlciBtb3VzZSwga2V5Ym9hcmQsIG9yIHRvdWNoKS4gVGhpcyBpcyB0aGUgZGVmYXVsdCBvcHRpb24uXHJcbiAgICovXHJcbiAgSU1NRURJQVRFLFxyXG4gIC8qKlxyXG4gICAqIEEgZm9jdXMgZXZlbnQncyBvcmlnaW4gaXMgYWx3YXlzIGF0dHJpYnV0ZWQgdG8gdGhlIGxhc3QgY29ycmVzcG9uZGluZ1xyXG4gICAqIG1vdXNlZG93biwga2V5ZG93biwgb3IgdG91Y2hzdGFydCBldmVudCwgbm8gbWF0dGVyIGhvdyBsb25nIGFnbyBpdCBvY2N1cmVkLlxyXG4gICAqL1xyXG4gIEVWRU5UVUFMXHJcbn1cclxuXHJcbi8qKiBJbmplY3RhYmxlIHNlcnZpY2UtbGV2ZWwgb3B0aW9ucyBmb3IgRm9jdXNNb25pdG9yLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEZvY3VzTW9uaXRvck9wdGlvbnMge1xyXG4gIGRldGVjdGlvbk1vZGU/OiBGb2N1c01vbml0b3JEZXRlY3Rpb25Nb2RlO1xyXG59XHJcblxyXG4vKiogSW5qZWN0aW9uVG9rZW4gZm9yIEZvY3VzTW9uaXRvck9wdGlvbnMuICovXHJcbmV4cG9ydCBjb25zdCBGT0NVU19NT05JVE9SX0RFRkFVTFRfT1BUSU9OUyA9XHJcbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48Rm9jdXNNb25pdG9yT3B0aW9ucz4oJ2Nkay1mb2N1cy1tb25pdG9yLWRlZmF1bHQtb3B0aW9ucycpO1xyXG5cclxudHlwZSBNb25pdG9yZWRFbGVtZW50SW5mbyA9IHtcclxuICBjaGVja0NoaWxkcmVuOiBib29sZWFuLFxyXG4gIHN1YmplY3Q6IFN1YmplY3Q8Rm9jdXNPcmlnaW4+LFxyXG4gIHJvb3ROb2RlOiBIVE1MRWxlbWVudHxTaGFkb3dSb290fERvY3VtZW50XHJcbn07XHJcblxyXG4vKipcclxuICogRXZlbnQgbGlzdGVuZXIgb3B0aW9ucyB0aGF0IGVuYWJsZSBjYXB0dXJpbmcgYW5kIGFsc29cclxuICogbWFyayB0aGUgbGlzdGVuZXIgYXMgcGFzc2l2ZSBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyBpdC5cclxuICovXHJcbmNvbnN0IGNhcHR1cmVFdmVudExpc3RlbmVyT3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe1xyXG4gIHBhc3NpdmU6IHRydWUsXHJcbiAgY2FwdHVyZTogdHJ1ZVxyXG59KTtcclxuXHJcblxyXG4vKiogTW9uaXRvcnMgbW91c2UgYW5kIGtleWJvYXJkIGV2ZW50cyB0byBkZXRlcm1pbmUgdGhlIGNhdXNlIG9mIGZvY3VzIGV2ZW50cy4gKi9cclxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXHJcbmV4cG9ydCBjbGFzcyBGb2N1c01vbml0b3IgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBUaGUgZm9jdXMgb3JpZ2luIHRoYXQgdGhlIG5leHQgZm9jdXMgZXZlbnQgaXMgYSByZXN1bHQgb2YuICovXHJcbiAgcHJpdmF0ZSBfb3JpZ2luOiBGb2N1c09yaWdpbiA9IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgRm9jdXNPcmlnaW4gb2YgdGhlIGxhc3QgZm9jdXMgZXZlbnQgdHJhY2tlZCBieSB0aGUgRm9jdXNNb25pdG9yLiAqL1xyXG4gIHByaXZhdGUgX2xhc3RGb2N1c09yaWdpbjogRm9jdXNPcmlnaW47XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSB3aW5kb3cgaGFzIGp1c3QgYmVlbiBmb2N1c2VkLiAqL1xyXG4gIHByaXZhdGUgX3dpbmRvd0ZvY3VzZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFRoZSB0YXJnZXQgb2YgdGhlIGxhc3QgdG91Y2ggZXZlbnQuICovXHJcbiAgcHJpdmF0ZSBfbGFzdFRvdWNoVGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGw7XHJcblxyXG4gIC8qKiBUaGUgdGltZW91dCBpZCBvZiB0aGUgdG91Y2ggdGltZW91dCwgdXNlZCB0byBjYW5jZWwgdGltZW91dCBsYXRlci4gKi9cclxuICBwcml2YXRlIF90b3VjaFRpbWVvdXRJZDogbnVtYmVyO1xyXG5cclxuICAvKiogVGhlIHRpbWVvdXQgaWQgb2YgdGhlIHdpbmRvdyBmb2N1cyB0aW1lb3V0LiAqL1xyXG4gIHByaXZhdGUgX3dpbmRvd0ZvY3VzVGltZW91dElkOiBudW1iZXI7XHJcblxyXG4gIC8qKiBUaGUgdGltZW91dCBpZCBvZiB0aGUgb3JpZ2luIGNsZWFyaW5nIHRpbWVvdXQuICovXHJcbiAgcHJpdmF0ZSBfb3JpZ2luVGltZW91dElkOiBudW1iZXI7XHJcblxyXG4gIC8qKiBNYXAgb2YgZWxlbWVudHMgYmVpbmcgbW9uaXRvcmVkIHRvIHRoZWlyIGluZm8uICovXHJcbiAgcHJpdmF0ZSBfZWxlbWVudEluZm8gPSBuZXcgTWFwPEhUTUxFbGVtZW50LCBNb25pdG9yZWRFbGVtZW50SW5mbz4oKTtcclxuXHJcbiAgLyoqIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgY3VycmVudGx5IGJlaW5nIG1vbml0b3JlZC4gKi9cclxuICBwcml2YXRlIF9tb25pdG9yZWRFbGVtZW50Q291bnQgPSAwO1xyXG5cclxuICAvKipcclxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgcm9vdCBub2RlcyB0byB3aGljaCB3ZSd2ZSBjdXJyZW50bHkgYm91bmQgYSBmb2N1cy9ibHVyIGhhbmRsZXIsXHJcbiAgICogYXMgd2VsbCBhcyB0aGUgbnVtYmVyIG9mIG1vbml0b3JlZCBlbGVtZW50cyB0aGF0IHRoZXkgY29udGFpbi4gV2UgaGF2ZSB0byB0cmVhdCBmb2N1cy9ibHVyXHJcbiAgICogaGFuZGxlcnMgZGlmZmVyZW50bHkgZnJvbSB0aGUgcmVzdCBvZiB0aGUgZXZlbnRzLCBiZWNhdXNlIHRoZSBicm93c2VyIHdvbid0IGVtaXQgZXZlbnRzXHJcbiAgICogdG8gdGhlIGRvY3VtZW50IHdoZW4gZm9jdXMgbW92ZXMgaW5zaWRlIG9mIGEgc2hhZG93IHJvb3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfcm9vdE5vZGVGb2N1c0xpc3RlbmVyQ291bnQgPSBuZXcgTWFwPEhUTUxFbGVtZW50fERvY3VtZW50fFNoYWRvd1Jvb3QsIG51bWJlcj4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHNwZWNpZmllZCBkZXRlY3Rpb24gbW9kZSwgdXNlZCBmb3IgYXR0cmlidXRpbmcgdGhlIG9yaWdpbiBvZiBhIGZvY3VzXHJcbiAgICogZXZlbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZGV0ZWN0aW9uTW9kZTogRm9jdXNNb25pdG9yRGV0ZWN0aW9uTW9kZTtcclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgbGlzdGVuZXIgZm9yIGBrZXlkb3duYCBldmVudHMgb24gdGhlIGRvY3VtZW50LlxyXG4gICAqIE5lZWRzIHRvIGJlIGFuIGFycm93IGZ1bmN0aW9uIGluIG9yZGVyIHRvIHByZXNlcnZlIHRoZSBjb250ZXh0IHdoZW4gaXQgZ2V0cyBib3VuZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9kb2N1bWVudEtleWRvd25MaXN0ZW5lciA9ICgpID0+IHtcclxuICAgIC8vIE9uIGtleWRvd24gcmVjb3JkIHRoZSBvcmlnaW4gYW5kIGNsZWFyIGFueSB0b3VjaCBldmVudCB0aGF0IG1heSBiZSBpbiBwcm9ncmVzcy5cclxuICAgIHRoaXMuX2xhc3RUb3VjaFRhcmdldCA9IG51bGw7XHJcbiAgICB0aGlzLl9zZXRPcmlnaW5Gb3JDdXJyZW50RXZlbnRRdWV1ZSgna2V5Ym9hcmQnKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV2ZW50IGxpc3RlbmVyIGZvciBgbW91c2Vkb3duYCBldmVudHMgb24gdGhlIGRvY3VtZW50LlxyXG4gICAqIE5lZWRzIHRvIGJlIGFuIGFycm93IGZ1bmN0aW9uIGluIG9yZGVyIHRvIHByZXNlcnZlIHRoZSBjb250ZXh0IHdoZW4gaXQgZ2V0cyBib3VuZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9kb2N1bWVudE1vdXNlZG93bkxpc3RlbmVyID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAvLyBPbiBtb3VzZWRvd24gcmVjb3JkIHRoZSBvcmlnaW4gb25seSBpZiB0aGVyZSBpcyBub3QgdG91Y2hcclxuICAgIC8vIHRhcmdldCwgc2luY2UgYSBtb3VzZWRvd24gY2FuIGhhcHBlbiBhcyBhIHJlc3VsdCBvZiBhIHRvdWNoIGV2ZW50LlxyXG4gICAgaWYgKCF0aGlzLl9sYXN0VG91Y2hUYXJnZXQpIHtcclxuICAgICAgLy8gSW4gc29tZSBjYXNlcyBzY3JlZW4gcmVhZGVycyBmaXJlIGZha2UgYG1vdXNlZG93bmAgZXZlbnRzIGluc3RlYWQgb2YgYGtleWRvd25gLlxyXG4gICAgICAvLyBSZXNvbHZlIHRoZSBmb2N1cyBzb3VyY2UgdG8gYGtleWJvYXJkYCBpZiB3ZSBkZXRlY3Qgb25lIG9mIHRoZW0uXHJcbiAgICAgIGNvbnN0IHNvdXJjZSA9IGlzRmFrZU1vdXNlZG93bkZyb21TY3JlZW5SZWFkZXIoZXZlbnQpID8gJ2tleWJvYXJkJyA6ICdtb3VzZSc7XHJcbiAgICAgIHRoaXMuX3NldE9yaWdpbkZvckN1cnJlbnRFdmVudFF1ZXVlKHNvdXJjZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFdmVudCBsaXN0ZW5lciBmb3IgYHRvdWNoc3RhcnRgIGV2ZW50cyBvbiB0aGUgZG9jdW1lbnQuXHJcbiAgICogTmVlZHMgdG8gYmUgYW4gYXJyb3cgZnVuY3Rpb24gaW4gb3JkZXIgdG8gcHJlc2VydmUgdGhlIGNvbnRleHQgd2hlbiBpdCBnZXRzIGJvdW5kLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2RvY3VtZW50VG91Y2hzdGFydExpc3RlbmVyID0gKGV2ZW50OiBUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICAvLyBTb21lIHNjcmVlbiByZWFkZXJzIHdpbGwgZmlyZSBhIGZha2UgYHRvdWNoc3RhcnRgIGV2ZW50IGlmIGFuIGVsZW1lbnQgaXMgYWN0aXZhdGVkIHVzaW5nXHJcbiAgICAvLyB0aGUga2V5Ym9hcmQgd2hpbGUgb24gYSBkZXZpY2Ugd2l0aCBhIHRvdWNoc3JlZW4uIENvbnNpZGVyIHN1Y2ggZXZlbnRzIGFzIGtleWJvYXJkIGZvY3VzLlxyXG4gICAgaWYgKCFpc0Zha2VUb3VjaHN0YXJ0RnJvbVNjcmVlblJlYWRlcihldmVudCkpIHtcclxuICAgICAgLy8gV2hlbiB0aGUgdG91Y2hzdGFydCBldmVudCBmaXJlcyB0aGUgZm9jdXMgZXZlbnQgaXMgbm90IHlldCBpbiB0aGUgZXZlbnQgcXVldWUuIFRoaXMgbWVhbnNcclxuICAgICAgLy8gd2UgY2FuJ3QgcmVseSBvbiB0aGUgdHJpY2sgdXNlZCBhYm92ZSAoc2V0dGluZyB0aW1lb3V0IG9mIDFtcykuIEluc3RlYWQgd2Ugd2FpdCA2NTBtcyB0b1xyXG4gICAgICAvLyBzZWUgaWYgYSBmb2N1cyBoYXBwZW5zLlxyXG4gICAgICBpZiAodGhpcy5fdG91Y2hUaW1lb3V0SWQgIT0gbnVsbCkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90b3VjaFRpbWVvdXRJZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2xhc3RUb3VjaFRhcmdldCA9IGdldFRhcmdldChldmVudCk7XHJcbiAgICAgIHRoaXMuX3RvdWNoVGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB0aGlzLl9sYXN0VG91Y2hUYXJnZXQgPSBudWxsLCBUT1VDSF9CVUZGRVJfTVMpO1xyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fbGFzdFRvdWNoVGFyZ2V0KSB7XHJcbiAgICAgIHRoaXMuX3NldE9yaWdpbkZvckN1cnJlbnRFdmVudFF1ZXVlKCdrZXlib2FyZCcpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXZlbnQgbGlzdGVuZXIgZm9yIGBmb2N1c2AgZXZlbnRzIG9uIHRoZSB3aW5kb3cuXHJcbiAgICogTmVlZHMgdG8gYmUgYW4gYXJyb3cgZnVuY3Rpb24gaW4gb3JkZXIgdG8gcHJlc2VydmUgdGhlIGNvbnRleHQgd2hlbiBpdCBnZXRzIGJvdW5kLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3dpbmRvd0ZvY3VzTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAvLyBNYWtlIGEgbm90ZSBvZiB3aGVuIHRoZSB3aW5kb3cgcmVnYWlucyBmb2N1cywgc28gd2UgY2FuXHJcbiAgICAvLyByZXN0b3JlIHRoZSBvcmlnaW4gaW5mbyBmb3IgdGhlIGZvY3VzZWQgZWxlbWVudC5cclxuICAgIHRoaXMuX3dpbmRvd0ZvY3VzZWQgPSB0cnVlO1xyXG4gICAgdGhpcy5fd2luZG93Rm9jdXNUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3dpbmRvd0ZvY3VzZWQgPSBmYWxzZSk7XHJcbiAgfVxyXG5cclxuICAvKiogVXNlZCB0byByZWZlcmVuY2UgY29ycmVjdCBkb2N1bWVudC93aW5kb3cgKi9cclxuICBwcm90ZWN0ZWQgX2RvY3VtZW50PzogRG9jdW1lbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcclxuICAgICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxyXG4gICAgICAvKiogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjAgbWFrZSBkb2N1bWVudCByZXF1aXJlZCAqL1xyXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55fG51bGwsXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoRk9DVVNfTU9OSVRPUl9ERUZBVUxUX09QVElPTlMpIG9wdGlvbnM6XHJcbiAgICAgICAgICBGb2N1c01vbml0b3JPcHRpb25zfG51bGwpIHtcclxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgICB0aGlzLl9kZXRlY3Rpb25Nb2RlID0gb3B0aW9ucz8uZGV0ZWN0aW9uTW9kZSB8fCBGb2N1c01vbml0b3JEZXRlY3Rpb25Nb2RlLklNTUVESUFURTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogRXZlbnQgbGlzdGVuZXIgZm9yIGBmb2N1c2AgYW5kICdibHVyJyBldmVudHMgb24gdGhlIGRvY3VtZW50LlxyXG4gICAqIE5lZWRzIHRvIGJlIGFuIGFycm93IGZ1bmN0aW9uIGluIG9yZGVyIHRvIHByZXNlcnZlIHRoZSBjb250ZXh0IHdoZW4gaXQgZ2V0cyBib3VuZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9yb290Tm9kZUZvY3VzQW5kQmx1ckxpc3RlbmVyID0gKGV2ZW50OiBFdmVudCkgPT4ge1xyXG4gICAgY29uc3QgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGV2ZW50KTtcclxuICAgIGNvbnN0IGhhbmRsZXIgPSBldmVudC50eXBlID09PSAnZm9jdXMnID8gdGhpcy5fb25Gb2N1cyA6IHRoaXMuX29uQmx1cjtcclxuXHJcbiAgICAvLyBXZSBuZWVkIHRvIHdhbGsgdXAgdGhlIGFuY2VzdG9yIGNoYWluIGluIG9yZGVyIHRvIHN1cHBvcnQgYGNoZWNrQ2hpbGRyZW5gLlxyXG4gICAgZm9yIChsZXQgZWxlbWVudCA9IHRhcmdldDsgZWxlbWVudDsgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudCkge1xyXG4gICAgICBoYW5kbGVyLmNhbGwodGhpcywgZXZlbnQgYXMgRm9jdXNFdmVudCwgZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb25pdG9ycyBmb2N1cyBvbiBhbiBlbGVtZW50IGFuZCBhcHBsaWVzIGFwcHJvcHJpYXRlIENTUyBjbGFzc2VzLlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIG1vbml0b3JcclxuICAgKiBAcGFyYW0gY2hlY2tDaGlsZHJlbiBXaGV0aGVyIHRvIGNvdW50IHRoZSBlbGVtZW50IGFzIGZvY3VzZWQgd2hlbiBpdHMgY2hpbGRyZW4gYXJlIGZvY3VzZWQuXHJcbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSB0aGF0IGVtaXRzIHdoZW4gdGhlIGZvY3VzIHN0YXRlIG9mIHRoZSBlbGVtZW50IGNoYW5nZXMuXHJcbiAgICogICAgIFdoZW4gdGhlIGVsZW1lbnQgaXMgYmx1cnJlZCwgbnVsbCB3aWxsIGJlIGVtaXR0ZWQuXHJcbiAgICovXHJcbiAgbW9uaXRvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgY2hlY2tDaGlsZHJlbj86IGJvb2xlYW4pOiBPYnNlcnZhYmxlPEZvY3VzT3JpZ2luPjtcclxuXHJcbiAgLyoqXHJcbiAgICogTW9uaXRvcnMgZm9jdXMgb24gYW4gZWxlbWVudCBhbmQgYXBwbGllcyBhcHByb3ByaWF0ZSBDU1MgY2xhc3Nlcy5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBtb25pdG9yXHJcbiAgICogQHBhcmFtIGNoZWNrQ2hpbGRyZW4gV2hldGhlciB0byBjb3VudCB0aGUgZWxlbWVudCBhcyBmb2N1c2VkIHdoZW4gaXRzIGNoaWxkcmVuIGFyZSBmb2N1c2VkLlxyXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgdGhhdCBlbWl0cyB3aGVuIHRoZSBmb2N1cyBzdGF0ZSBvZiB0aGUgZWxlbWVudCBjaGFuZ2VzLlxyXG4gICAqICAgICBXaGVuIHRoZSBlbGVtZW50IGlzIGJsdXJyZWQsIG51bGwgd2lsbCBiZSBlbWl0dGVkLlxyXG4gICAqL1xyXG4gIG1vbml0b3IoZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIGNoZWNrQ2hpbGRyZW4/OiBib29sZWFuKTogT2JzZXJ2YWJsZTxGb2N1c09yaWdpbj47XHJcblxyXG4gIG1vbml0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgICAgICAgIGNoZWNrQ2hpbGRyZW46IGJvb2xlYW4gPSBmYWxzZSk6IE9ic2VydmFibGU8Rm9jdXNPcmlnaW4+IHtcclxuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQgPSBjb2VyY2VFbGVtZW50KGVsZW1lbnQpO1xyXG5cclxuICAgIC8vIERvIG5vdGhpbmcgaWYgd2UncmUgbm90IG9uIHRoZSBicm93c2VyIHBsYXRmb3JtIG9yIHRoZSBwYXNzZWQgaW4gbm9kZSBpc24ndCBhbiBlbGVtZW50LlxyXG4gICAgaWYgKCF0aGlzLl9wbGF0Zm9ybS5pc0Jyb3dzZXIgfHwgbmF0aXZlRWxlbWVudC5ub2RlVHlwZSAhPT0gMSkge1xyXG4gICAgICByZXR1cm4gb2JzZXJ2YWJsZU9mKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGluc2lkZSB0aGUgc2hhZG93IERPTSwgd2UgbmVlZCB0byBiaW5kIG91ciBmb2N1cy9ibHVyIGxpc3RlbmVycyB0b1xyXG4gICAgLy8gdGhlIHNoYWRvdyByb290LCByYXRoZXIgdGhhbiB0aGUgYGRvY3VtZW50YCwgYmVjYXVzZSB0aGUgYnJvd3NlciB3b24ndCBlbWl0IGZvY3VzIGV2ZW50c1xyXG4gICAgLy8gdG8gdGhlIGBkb2N1bWVudGAsIGlmIGZvY3VzIGlzIG1vdmluZyB3aXRoaW4gdGhlIHNhbWUgc2hhZG93IHJvb3QuXHJcbiAgICBjb25zdCByb290Tm9kZSA9IF9nZXRTaGFkb3dSb290KG5hdGl2ZUVsZW1lbnQpIHx8IHRoaXMuX2dldERvY3VtZW50KCk7XHJcbiAgICBjb25zdCBjYWNoZWRJbmZvID0gdGhpcy5fZWxlbWVudEluZm8uZ2V0KG5hdGl2ZUVsZW1lbnQpO1xyXG5cclxuICAgIC8vIENoZWNrIGlmIHdlJ3JlIGFscmVhZHkgbW9uaXRvcmluZyB0aGlzIGVsZW1lbnQuXHJcbiAgICBpZiAoY2FjaGVkSW5mbykge1xyXG4gICAgICBpZiAoY2hlY2tDaGlsZHJlbikge1xyXG4gICAgICAgIC8vIFRPRE8oQ09NUC0zMTgpOiB0aGlzIGNhbiBiZSBwcm9ibGVtYXRpYywgYmVjYXVzZSBpdCdsbCB0dXJuIGFsbCBub24tY2hlY2tDaGlsZHJlblxyXG4gICAgICAgIC8vIG9ic2VydmVycyBpbnRvIG9uZXMgdGhhdCBiZWhhdmUgYXMgaWYgYGNoZWNrQ2hpbGRyZW5gIHdhcyB0dXJuZWQgb24uIFdlIG5lZWQgYSBtb3JlXHJcbiAgICAgICAgLy8gcm9idXN0IHNvbHV0aW9uLlxyXG4gICAgICAgIGNhY2hlZEluZm8uY2hlY2tDaGlsZHJlbiA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjYWNoZWRJbmZvLnN1YmplY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIG1vbml0b3JlZCBlbGVtZW50IGluZm8uXHJcbiAgICBjb25zdCBpbmZvOiBNb25pdG9yZWRFbGVtZW50SW5mbyA9IHtcclxuICAgICAgY2hlY2tDaGlsZHJlbjogY2hlY2tDaGlsZHJlbixcclxuICAgICAgc3ViamVjdDogbmV3IFN1YmplY3Q8Rm9jdXNPcmlnaW4+KCksXHJcbiAgICAgIHJvb3ROb2RlXHJcbiAgICB9O1xyXG4gICAgdGhpcy5fZWxlbWVudEluZm8uc2V0KG5hdGl2ZUVsZW1lbnQsIGluZm8pO1xyXG4gICAgdGhpcy5fcmVnaXN0ZXJHbG9iYWxMaXN0ZW5lcnMoaW5mbyk7XHJcblxyXG4gICAgcmV0dXJuIGluZm8uc3ViamVjdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3BzIG1vbml0b3JpbmcgYW4gZWxlbWVudCBhbmQgcmVtb3ZlcyBhbGwgZm9jdXMgY2xhc3Nlcy5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBzdG9wIG1vbml0b3JpbmcuXHJcbiAgICovXHJcbiAgc3RvcE1vbml0b3JpbmcoZWxlbWVudDogSFRNTEVsZW1lbnQpOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBTdG9wcyBtb25pdG9yaW5nIGFuIGVsZW1lbnQgYW5kIHJlbW92ZXMgYWxsIGZvY3VzIGNsYXNzZXMuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gc3RvcCBtb25pdG9yaW5nLlxyXG4gICAqL1xyXG4gIHN0b3BNb25pdG9yaW5nKGVsZW1lbnQ6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KTogdm9pZDtcclxuXHJcbiAgc3RvcE1vbml0b3JpbmcoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBFbGVtZW50UmVmPEhUTUxFbGVtZW50Pik6IHZvaWQge1xyXG4gICAgY29uc3QgbmF0aXZlRWxlbWVudCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICBjb25zdCBlbGVtZW50SW5mbyA9IHRoaXMuX2VsZW1lbnRJbmZvLmdldChuYXRpdmVFbGVtZW50KTtcclxuXHJcbiAgICBpZiAoZWxlbWVudEluZm8pIHtcclxuICAgICAgZWxlbWVudEluZm8uc3ViamVjdC5jb21wbGV0ZSgpO1xyXG5cclxuICAgICAgdGhpcy5fc2V0Q2xhc3NlcyhuYXRpdmVFbGVtZW50KTtcclxuICAgICAgdGhpcy5fZWxlbWVudEluZm8uZGVsZXRlKG5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl9yZW1vdmVHbG9iYWxMaXN0ZW5lcnMoZWxlbWVudEluZm8pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRm9jdXNlcyB0aGUgZWxlbWVudCB2aWEgdGhlIHNwZWNpZmllZCBmb2N1cyBvcmlnaW4uXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBmb2N1cy5cclxuICAgKiBAcGFyYW0gb3JpZ2luIEZvY3VzIG9yaWdpbi5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29uZmlndXJlIHRoZSBmb2N1cyBiZWhhdmlvci5cclxuICAgKi9cclxuICBmb2N1c1ZpYShlbGVtZW50OiBIVE1MRWxlbWVudCwgb3JpZ2luOiBGb2N1c09yaWdpbiwgb3B0aW9ucz86IEZvY3VzT3B0aW9ucyk6IHZvaWQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvY3VzZXMgdGhlIGVsZW1lbnQgdmlhIHRoZSBzcGVjaWZpZWQgZm9jdXMgb3JpZ2luLlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gZm9jdXMuXHJcbiAgICogQHBhcmFtIG9yaWdpbiBGb2N1cyBvcmlnaW4uXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZm9jdXMgYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgZm9jdXNWaWEoZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sIG9yaWdpbjogRm9jdXNPcmlnaW4sIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiB2b2lkO1xyXG5cclxuICBmb2N1c1ZpYShlbGVtZW50OiBIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxyXG4gICAgICAgICAgb3JpZ2luOiBGb2N1c09yaWdpbixcclxuICAgICAgICAgIG9wdGlvbnM/OiBGb2N1c09wdGlvbnMpOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50KTtcclxuICAgIGNvbnN0IGZvY3VzZWRFbGVtZW50ID0gdGhpcy5fZ2V0RG9jdW1lbnQoKS5hY3RpdmVFbGVtZW50O1xyXG5cclxuICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIGZvY3VzZWQgYWxyZWFkeSwgY2FsbGluZyBgZm9jdXNgIGFnYWluIHdvbid0IHRyaWdnZXIgdGhlIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAvLyB3aGljaCBtZWFucyB0aGF0IHRoZSBmb2N1cyBjbGFzc2VzIHdvbid0IGJlIHVwZGF0ZWQuIElmIHRoYXQncyB0aGUgY2FzZSwgdXBkYXRlIHRoZSBjbGFzc2VzXHJcbiAgICAvLyBkaXJlY3RseSB3aXRob3V0IHdhaXRpbmcgZm9yIGFuIGV2ZW50LlxyXG4gICAgaWYgKG5hdGl2ZUVsZW1lbnQgPT09IGZvY3VzZWRFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuX2dldENsb3Nlc3RFbGVtZW50c0luZm8obmF0aXZlRWxlbWVudClcclxuICAgICAgICAuZm9yRWFjaCgoW2N1cnJlbnRFbGVtZW50LCBpbmZvXSkgPT4gdGhpcy5fb3JpZ2luQ2hhbmdlZChjdXJyZW50RWxlbWVudCwgb3JpZ2luLCBpbmZvKSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zZXRPcmlnaW5Gb3JDdXJyZW50RXZlbnRRdWV1ZShvcmlnaW4pO1xyXG5cclxuICAgICAgLy8gYGZvY3VzYCBpc24ndCBhdmFpbGFibGUgb24gdGhlIHNlcnZlclxyXG4gICAgICBpZiAodHlwZW9mIG5hdGl2ZUVsZW1lbnQuZm9jdXMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBuYXRpdmVFbGVtZW50LmZvY3VzKG9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2VsZW1lbnRJbmZvLmZvckVhY2goKF9pbmZvLCBlbGVtZW50KSA9PiB0aGlzLnN0b3BNb25pdG9yaW5nKGVsZW1lbnQpKTtcclxuICB9XHJcblxyXG4gIC8qKiBBY2Nlc3MgaW5qZWN0ZWQgZG9jdW1lbnQgaWYgYXZhaWxhYmxlIG9yIGZhbGxiYWNrIHRvIGdsb2JhbCBkb2N1bWVudCByZWZlcmVuY2UgKi9cclxuICBwcml2YXRlIF9nZXREb2N1bWVudCgpOiBEb2N1bWVudCB7XHJcbiAgICByZXR1cm4gdGhpcy5fZG9jdW1lbnQgfHwgZG9jdW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvKiogVXNlIGRlZmF1bHRWaWV3IG9mIGluamVjdGVkIGRvY3VtZW50IGlmIGF2YWlsYWJsZSBvciBmYWxsYmFjayB0byBnbG9iYWwgd2luZG93IHJlZmVyZW5jZSAqL1xyXG4gIHByaXZhdGUgX2dldFdpbmRvdygpOiBXaW5kb3cge1xyXG4gICAgY29uc3QgZG9jID0gdGhpcy5fZ2V0RG9jdW1lbnQoKTtcclxuICAgIHJldHVybiBkb2MuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfdG9nZ2xlQ2xhc3MoZWxlbWVudDogRWxlbWVudCwgY2xhc3NOYW1lOiBzdHJpbmcsIHNob3VsZFNldDogYm9vbGVhbikge1xyXG4gICAgaWYgKHNob3VsZFNldCkge1xyXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfZ2V0Rm9jdXNPcmlnaW4oZXZlbnQ6IEZvY3VzRXZlbnQpOiBGb2N1c09yaWdpbiB7XHJcbiAgICAvLyBJZiB3ZSBjb3VsZG4ndCBkZXRlY3QgYSBjYXVzZSBmb3IgdGhlIGZvY3VzIGV2ZW50LCBpdCdzIGR1ZSB0byBvbmUgb2YgdGhyZWUgcmVhc29uczpcclxuICAgIC8vIDEpIFRoZSB3aW5kb3cgaGFzIGp1c3QgcmVnYWluZWQgZm9jdXMsIGluIHdoaWNoIGNhc2Ugd2Ugd2FudCB0byByZXN0b3JlIHRoZSBmb2N1c2VkIHN0YXRlIG9mXHJcbiAgICAvLyAgICB0aGUgZWxlbWVudCBmcm9tIGJlZm9yZSB0aGUgd2luZG93IGJsdXJyZWQuXHJcbiAgICAvLyAyKSBJdCB3YXMgY2F1c2VkIGJ5IGEgdG91Y2ggZXZlbnQsIGluIHdoaWNoIGNhc2Ugd2UgbWFyayB0aGUgb3JpZ2luIGFzICd0b3VjaCcuXHJcbiAgICAvLyAzKSBUaGUgZWxlbWVudCB3YXMgcHJvZ3JhbW1hdGljYWxseSBmb2N1c2VkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZCBtYXJrIHRoZSBvcmlnaW4gYXNcclxuICAgIC8vICAgICdwcm9ncmFtJy5cclxuICAgIGlmICh0aGlzLl9vcmlnaW4pIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX29yaWdpbjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fd2luZG93Rm9jdXNlZCAmJiB0aGlzLl9sYXN0Rm9jdXNPcmlnaW4pIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2xhc3RGb2N1c09yaWdpbjtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5fd2FzQ2F1c2VkQnlUb3VjaChldmVudCkpIHtcclxuICAgICAgcmV0dXJuICd0b3VjaCc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gJ3Byb2dyYW0nO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgZm9jdXMgY2xhc3NlcyBvbiB0aGUgZWxlbWVudCBiYXNlZCBvbiB0aGUgZ2l2ZW4gZm9jdXMgb3JpZ2luLlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHVwZGF0ZSB0aGUgY2xhc3NlcyBvbi5cclxuICAgKiBAcGFyYW0gb3JpZ2luIFRoZSBmb2N1cyBvcmlnaW4uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfc2V0Q2xhc3NlcyhlbGVtZW50OiBIVE1MRWxlbWVudCwgb3JpZ2luPzogRm9jdXNPcmlnaW4pOiB2b2lkIHtcclxuICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGVsZW1lbnQsICdjZGstZm9jdXNlZCcsICEhb3JpZ2luKTtcclxuICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGVsZW1lbnQsICdjZGstdG91Y2gtZm9jdXNlZCcsIG9yaWdpbiA9PT0gJ3RvdWNoJyk7XHJcbiAgICB0aGlzLl90b2dnbGVDbGFzcyhlbGVtZW50LCAnY2RrLWtleWJvYXJkLWZvY3VzZWQnLCBvcmlnaW4gPT09ICdrZXlib2FyZCcpO1xyXG4gICAgdGhpcy5fdG9nZ2xlQ2xhc3MoZWxlbWVudCwgJ2Nkay1tb3VzZS1mb2N1c2VkJywgb3JpZ2luID09PSAnbW91c2UnKTtcclxuICAgIHRoaXMuX3RvZ2dsZUNsYXNzKGVsZW1lbnQsICdjZGstcHJvZ3JhbS1mb2N1c2VkJywgb3JpZ2luID09PSAncHJvZ3JhbScpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgb3JpZ2luIGFuZCBzY2hlZHVsZXMgYW4gYXN5bmMgZnVuY3Rpb24gdG8gY2xlYXIgaXQgYXQgdGhlIGVuZCBvZiB0aGUgZXZlbnQgcXVldWUuXHJcbiAgICogSWYgdGhlIGRldGVjdGlvbiBtb2RlIGlzICdldmVudHVhbCcsIHRoZSBvcmlnaW4gaXMgbmV2ZXIgY2xlYXJlZC5cclxuICAgKiBAcGFyYW0gb3JpZ2luIFRoZSBvcmlnaW4gdG8gc2V0LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3NldE9yaWdpbkZvckN1cnJlbnRFdmVudFF1ZXVlKG9yaWdpbjogRm9jdXNPcmlnaW4pOiB2b2lkIHtcclxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIHRoaXMuX29yaWdpbiA9IG9yaWdpbjtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9kZXRlY3Rpb25Nb2RlID09PSBGb2N1c01vbml0b3JEZXRlY3Rpb25Nb2RlLklNTUVESUFURSkge1xyXG4gICAgICAgIC8vIFNvbWV0aW1lcyB0aGUgZm9jdXMgb3JpZ2luIHdvbid0IGJlIHZhbGlkIGluIEZpcmVmb3ggYmVjYXVzZSBGaXJlZm94IHNlZW1zIHRvIGZvY3VzICpvbmUqXHJcbiAgICAgICAgLy8gdGljayBhZnRlciB0aGUgaW50ZXJhY3Rpb24gZXZlbnQgZmlyZWQuIFRvIGVuc3VyZSB0aGUgZm9jdXMgb3JpZ2luIGlzIGFsd2F5cyBjb3JyZWN0LFxyXG4gICAgICAgIC8vIHRoZSBmb2N1cyBvcmlnaW4gd2lsbCBiZSBkZXRlcm1pbmVkIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgdGljay5cclxuICAgICAgICB0aGlzLl9vcmlnaW5UaW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX29yaWdpbiA9IG51bGwsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBmb2N1cyBldmVudCB3YXMgY2F1c2VkIGJ5IGEgdG91Y2hzdGFydCBldmVudC5cclxuICAgKiBAcGFyYW0gZXZlbnQgVGhlIGZvY3VzIGV2ZW50IHRvIGNoZWNrLlxyXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGV2ZW50IHdhcyBjYXVzZWQgYnkgYSB0b3VjaC5cclxuICAgKi9cclxuICBwcml2YXRlIF93YXNDYXVzZWRCeVRvdWNoKGV2ZW50OiBGb2N1c0V2ZW50KTogYm9vbGVhbiB7XHJcbiAgICAvLyBOb3RlKG1tYWxlcmJhKTogVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBub3QgcXVpdGUgcGVyZmVjdCwgdGhlcmUgaXMgYSBzbWFsbCBlZGdlIGNhc2UuXHJcbiAgICAvLyBDb25zaWRlciB0aGUgZm9sbG93aW5nIGRvbSBzdHJ1Y3R1cmU6XHJcbiAgICAvL1xyXG4gICAgLy8gPGRpdiAjcGFyZW50IHRhYmluZGV4PVwiMFwiIGNka0ZvY3VzQ2xhc3Nlcz5cclxuICAgIC8vICAgPGRpdiAjY2hpbGQgKGNsaWNrKT1cIiNwYXJlbnQuZm9jdXMoKVwiPjwvZGl2PlxyXG4gICAgLy8gPC9kaXY+XHJcbiAgICAvL1xyXG4gICAgLy8gSWYgdGhlIHVzZXIgdG91Y2hlcyB0aGUgI2NoaWxkIGVsZW1lbnQgYW5kIHRoZSAjcGFyZW50IGlzIHByb2dyYW1tYXRpY2FsbHkgZm9jdXNlZCBhcyBhXHJcbiAgICAvLyByZXN1bHQsIHRoaXMgY29kZSB3aWxsIHN0aWxsIGNvbnNpZGVyIGl0IHRvIGhhdmUgYmVlbiBjYXVzZWQgYnkgdGhlIHRvdWNoIGV2ZW50IGFuZCB3aWxsXHJcbiAgICAvLyBhcHBseSB0aGUgY2RrLXRvdWNoLWZvY3VzZWQgY2xhc3MgcmF0aGVyIHRoYW4gdGhlIGNkay1wcm9ncmFtLWZvY3VzZWQgY2xhc3MuIFRoaXMgaXMgYVxyXG4gICAgLy8gcmVsYXRpdmVseSBzbWFsbCBlZGdlLWNhc2UgdGhhdCBjYW4gYmUgd29ya2VkIGFyb3VuZCBieSB1c2luZ1xyXG4gICAgLy8gZm9jdXNWaWEocGFyZW50RWwsICdwcm9ncmFtJykgdG8gZm9jdXMgdGhlIHBhcmVudCBlbGVtZW50LlxyXG4gICAgLy9cclxuICAgIC8vIElmIHdlIGRlY2lkZSB0aGF0IHdlIGFic29sdXRlbHkgbXVzdCBoYW5kbGUgdGhpcyBjYXNlIGNvcnJlY3RseSwgd2UgY2FuIGRvIHNvIGJ5IGxpc3RlbmluZ1xyXG4gICAgLy8gZm9yIHRoZSBmaXJzdCBmb2N1cyBldmVudCBhZnRlciB0aGUgdG91Y2hzdGFydCwgYW5kIHRoZW4gdGhlIGZpcnN0IGJsdXIgZXZlbnQgYWZ0ZXIgdGhhdFxyXG4gICAgLy8gZm9jdXMgZXZlbnQuIFdoZW4gdGhhdCBibHVyIGV2ZW50IGZpcmVzIHdlIGtub3cgdGhhdCB3aGF0ZXZlciBmb2xsb3dzIGlzIG5vdCBhIHJlc3VsdCBvZiB0aGVcclxuICAgIC8vIHRvdWNoc3RhcnQuXHJcbiAgICBjb25zdCBmb2N1c1RhcmdldCA9IGdldFRhcmdldChldmVudCk7XHJcbiAgICByZXR1cm4gdGhpcy5fbGFzdFRvdWNoVGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJiBmb2N1c1RhcmdldCBpbnN0YW5jZW9mIE5vZGUgJiZcclxuICAgICAgICAoZm9jdXNUYXJnZXQgPT09IHRoaXMuX2xhc3RUb3VjaFRhcmdldCB8fCBmb2N1c1RhcmdldC5jb250YWlucyh0aGlzLl9sYXN0VG91Y2hUYXJnZXQpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgZm9jdXMgZXZlbnRzIG9uIGEgcmVnaXN0ZXJlZCBlbGVtZW50LlxyXG4gICAqIEBwYXJhbSBldmVudCBUaGUgZm9jdXMgZXZlbnQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIG1vbml0b3JlZCBlbGVtZW50LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX29uRm9jdXMoZXZlbnQ6IEZvY3VzRXZlbnQsIGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICAvLyBOT1RFKG1tYWxlcmJhKTogV2UgY3VycmVudGx5IHNldCB0aGUgY2xhc3NlcyBiYXNlZCBvbiB0aGUgZm9jdXMgb3JpZ2luIG9mIHRoZSBtb3N0IHJlY2VudFxyXG4gICAgLy8gZm9jdXMgZXZlbnQgYWZmZWN0aW5nIHRoZSBtb25pdG9yZWQgZWxlbWVudC4gSWYgd2Ugd2FudCB0byB1c2UgdGhlIG9yaWdpbiBvZiB0aGUgZmlyc3QgZXZlbnRcclxuICAgIC8vIGluc3RlYWQgd2Ugc2hvdWxkIGNoZWNrIGZvciB0aGUgY2RrLWZvY3VzZWQgY2xhc3MgaGVyZSBhbmQgcmV0dXJuIGlmIHRoZSBlbGVtZW50IGFscmVhZHkgaGFzXHJcbiAgICAvLyBpdC4gKFRoaXMgb25seSBtYXR0ZXJzIGZvciBlbGVtZW50cyB0aGF0IGhhdmUgaW5jbHVkZXNDaGlsZHJlbiA9IHRydWUpLlxyXG5cclxuICAgIC8vIElmIHdlIGFyZSBub3QgY291bnRpbmcgY2hpbGQtZWxlbWVudC1mb2N1cyBhcyBmb2N1c2VkLCBtYWtlIHN1cmUgdGhhdCB0aGUgZXZlbnQgdGFyZ2V0IGlzIHRoZVxyXG4gICAgLy8gbW9uaXRvcmVkIGVsZW1lbnQgaXRzZWxmLlxyXG4gICAgY29uc3QgZWxlbWVudEluZm8gPSB0aGlzLl9lbGVtZW50SW5mby5nZXQoZWxlbWVudCk7XHJcbiAgICBpZiAoIWVsZW1lbnRJbmZvIHx8ICghZWxlbWVudEluZm8uY2hlY2tDaGlsZHJlbiAmJiBlbGVtZW50ICE9PSBnZXRUYXJnZXQoZXZlbnQpKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fb3JpZ2luQ2hhbmdlZChlbGVtZW50LCB0aGlzLl9nZXRGb2N1c09yaWdpbihldmVudCksIGVsZW1lbnRJbmZvKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYmx1ciBldmVudHMgb24gYSByZWdpc3RlcmVkIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIGV2ZW50IFRoZSBibHVyIGV2ZW50LlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBtb25pdG9yZWQgZWxlbWVudC5cclxuICAgKi9cclxuICBfb25CbHVyKGV2ZW50OiBGb2N1c0V2ZW50LCBlbGVtZW50OiBIVE1MRWxlbWVudCkge1xyXG4gICAgLy8gSWYgd2UgYXJlIGNvdW50aW5nIGNoaWxkLWVsZW1lbnQtZm9jdXMgYXMgZm9jdXNlZCwgbWFrZSBzdXJlIHRoYXQgd2UgYXJlbid0IGp1c3QgYmx1cnJpbmcgaW5cclxuICAgIC8vIG9yZGVyIHRvIGZvY3VzIGFub3RoZXIgY2hpbGQgb2YgdGhlIG1vbml0b3JlZCBlbGVtZW50LlxyXG4gICAgY29uc3QgZWxlbWVudEluZm8gPSB0aGlzLl9lbGVtZW50SW5mby5nZXQoZWxlbWVudCk7XHJcblxyXG4gICAgaWYgKCFlbGVtZW50SW5mbyB8fCAoZWxlbWVudEluZm8uY2hlY2tDaGlsZHJlbiAmJiBldmVudC5yZWxhdGVkVGFyZ2V0IGluc3RhbmNlb2YgTm9kZSAmJlxyXG4gICAgICAgIGVsZW1lbnQuY29udGFpbnMoZXZlbnQucmVsYXRlZFRhcmdldCkpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9zZXRDbGFzc2VzKGVsZW1lbnQpO1xyXG4gICAgdGhpcy5fZW1pdE9yaWdpbihlbGVtZW50SW5mby5zdWJqZWN0LCBudWxsKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2VtaXRPcmlnaW4oc3ViamVjdDogU3ViamVjdDxGb2N1c09yaWdpbj4sIG9yaWdpbjogRm9jdXNPcmlnaW4pIHtcclxuICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gc3ViamVjdC5uZXh0KG9yaWdpbikpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfcmVnaXN0ZXJHbG9iYWxMaXN0ZW5lcnMoZWxlbWVudEluZm86IE1vbml0b3JlZEVsZW1lbnRJbmZvKSB7XHJcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgcm9vdE5vZGUgPSBlbGVtZW50SW5mby5yb290Tm9kZTtcclxuICAgIGNvbnN0IHJvb3ROb2RlRm9jdXNMaXN0ZW5lcnMgPSB0aGlzLl9yb290Tm9kZUZvY3VzTGlzdGVuZXJDb3VudC5nZXQocm9vdE5vZGUpIHx8IDA7XHJcblxyXG4gICAgaWYgKCFyb290Tm9kZUZvY3VzTGlzdGVuZXJzKSB7XHJcbiAgICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgcm9vdE5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9yb290Tm9kZUZvY3VzQW5kQmx1ckxpc3RlbmVyLFxyXG4gICAgICAgICAgY2FwdHVyZUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICByb290Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fcm9vdE5vZGVGb2N1c0FuZEJsdXJMaXN0ZW5lcixcclxuICAgICAgICAgIGNhcHR1cmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Jvb3ROb2RlRm9jdXNMaXN0ZW5lckNvdW50LnNldChyb290Tm9kZSwgcm9vdE5vZGVGb2N1c0xpc3RlbmVycyArIDEpO1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIGdsb2JhbCBsaXN0ZW5lcnMgd2hlbiBmaXJzdCBlbGVtZW50IGlzIG1vbml0b3JlZC5cclxuICAgIGlmICgrK3RoaXMuX21vbml0b3JlZEVsZW1lbnRDb3VudCA9PT0gMSkge1xyXG4gICAgICAvLyBOb3RlOiB3ZSBsaXN0ZW4gdG8gZXZlbnRzIGluIHRoZSBjYXB0dXJlIHBoYXNlIHNvIHdlXHJcbiAgICAgIC8vIGNhbiBkZXRlY3QgdGhlbSBldmVuIGlmIHRoZSB1c2VyIHN0b3BzIHByb3BhZ2F0aW9uLlxyXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRvY3VtZW50ID0gdGhpcy5fZ2V0RG9jdW1lbnQoKTtcclxuICAgICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2RvY3VtZW50S2V5ZG93bkxpc3RlbmVyLFxyXG4gICAgICAgICAgY2FwdHVyZUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9kb2N1bWVudE1vdXNlZG93bkxpc3RlbmVyLFxyXG4gICAgICAgICAgY2FwdHVyZUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fZG9jdW1lbnRUb3VjaHN0YXJ0TGlzdGVuZXIsXHJcbiAgICAgICAgICBjYXB0dXJlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX3dpbmRvd0ZvY3VzTGlzdGVuZXIpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3JlbW92ZUdsb2JhbExpc3RlbmVycyhlbGVtZW50SW5mbzogTW9uaXRvcmVkRWxlbWVudEluZm8pIHtcclxuICAgIGNvbnN0IHJvb3ROb2RlID0gZWxlbWVudEluZm8ucm9vdE5vZGU7XHJcblxyXG4gICAgaWYgKHRoaXMuX3Jvb3ROb2RlRm9jdXNMaXN0ZW5lckNvdW50Lmhhcyhyb290Tm9kZSkpIHtcclxuICAgICAgY29uc3Qgcm9vdE5vZGVGb2N1c0xpc3RlbmVycyA9IHRoaXMuX3Jvb3ROb2RlRm9jdXNMaXN0ZW5lckNvdW50LmdldChyb290Tm9kZSkhO1xyXG5cclxuICAgICAgaWYgKHJvb3ROb2RlRm9jdXNMaXN0ZW5lcnMgPiAxKSB7XHJcbiAgICAgICAgdGhpcy5fcm9vdE5vZGVGb2N1c0xpc3RlbmVyQ291bnQuc2V0KHJvb3ROb2RlLCByb290Tm9kZUZvY3VzTGlzdGVuZXJzIC0gMSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcm9vdE5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9yb290Tm9kZUZvY3VzQW5kQmx1ckxpc3RlbmVyLFxyXG4gICAgICAgICAgY2FwdHVyZUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgICByb290Tm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdibHVyJywgdGhpcy5fcm9vdE5vZGVGb2N1c0FuZEJsdXJMaXN0ZW5lcixcclxuICAgICAgICAgIGNhcHR1cmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5fcm9vdE5vZGVGb2N1c0xpc3RlbmVyQ291bnQuZGVsZXRlKHJvb3ROb2RlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFVucmVnaXN0ZXIgZ2xvYmFsIGxpc3RlbmVycyB3aGVuIGxhc3QgZWxlbWVudCBpcyB1bm1vbml0b3JlZC5cclxuICAgIGlmICghLS10aGlzLl9tb25pdG9yZWRFbGVtZW50Q291bnQpIHtcclxuICAgICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9nZXREb2N1bWVudCgpO1xyXG4gICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcclxuXHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9kb2N1bWVudEtleWRvd25MaXN0ZW5lcixcclxuICAgICAgICBjYXB0dXJlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9kb2N1bWVudE1vdXNlZG93bkxpc3RlbmVyLFxyXG4gICAgICAgIGNhcHR1cmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9kb2N1bWVudFRvdWNoc3RhcnRMaXN0ZW5lcixcclxuICAgICAgICBjYXB0dXJlRXZlbnRMaXN0ZW5lck9wdGlvbnMpO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl93aW5kb3dGb2N1c0xpc3RlbmVyKTtcclxuXHJcbiAgICAgIC8vIENsZWFyIHRpbWVvdXRzIGZvciBhbGwgcG90ZW50aWFsbHkgcGVuZGluZyB0aW1lb3V0cyB0byBwcmV2ZW50IHRoZSBsZWFrcy5cclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3dpbmRvd0ZvY3VzVGltZW91dElkKTtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RvdWNoVGltZW91dElkKTtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX29yaWdpblRpbWVvdXRJZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlcyBhbGwgdGhlIHN0YXRlIG9uIGFuIGVsZW1lbnQgb25jZSBpdHMgZm9jdXMgb3JpZ2luIGhhcyBjaGFuZ2VkLiAqL1xyXG4gIHByaXZhdGUgX29yaWdpbkNoYW5nZWQoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9yaWdpbjogRm9jdXNPcmlnaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50SW5mbzogTW9uaXRvcmVkRWxlbWVudEluZm8pIHtcclxuICAgIHRoaXMuX3NldENsYXNzZXMoZWxlbWVudCwgb3JpZ2luKTtcclxuICAgIHRoaXMuX2VtaXRPcmlnaW4oZWxlbWVudEluZm8uc3ViamVjdCwgb3JpZ2luKTtcclxuICAgIHRoaXMuX2xhc3RGb2N1c09yaWdpbiA9IG9yaWdpbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbGxlY3RzIHRoZSBgTW9uaXRvcmVkRWxlbWVudEluZm9gIG9mIGEgcGFydGljdWxhciBlbGVtZW50IGFuZFxyXG4gICAqIGFsbCBvZiBpdHMgYW5jZXN0b3JzIHRoYXQgaGF2ZSBlbmFibGVkIGBjaGVja0NoaWxkcmVuYC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IGZyb20gd2hpY2ggdG8gc3RhcnQgdGhlIHNlYXJjaC5cclxuICAgKi9cclxuICBwcml2YXRlIF9nZXRDbG9zZXN0RWxlbWVudHNJbmZvKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogW0hUTUxFbGVtZW50LCBNb25pdG9yZWRFbGVtZW50SW5mb11bXSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBbSFRNTEVsZW1lbnQsIE1vbml0b3JlZEVsZW1lbnRJbmZvXVtdID0gW107XHJcblxyXG4gICAgdGhpcy5fZWxlbWVudEluZm8uZm9yRWFjaCgoaW5mbywgY3VycmVudEVsZW1lbnQpID0+IHtcclxuICAgICAgaWYgKGN1cnJlbnRFbGVtZW50ID09PSBlbGVtZW50IHx8IChpbmZvLmNoZWNrQ2hpbGRyZW4gJiYgY3VycmVudEVsZW1lbnQuY29udGFpbnMoZWxlbWVudCkpKSB7XHJcbiAgICAgICAgcmVzdWx0cy5wdXNoKFtjdXJyZW50RWxlbWVudCwgaW5mb10pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9XHJcbn1cclxuXHJcbi8qKiBHZXRzIHRoZSB0YXJnZXQgb2YgYW4gZXZlbnQsIGFjY291bnRpbmcgZm9yIFNoYWRvdyBET00uICovXHJcbmZ1bmN0aW9uIGdldFRhcmdldChldmVudDogRXZlbnQpOiBIVE1MRWxlbWVudHxudWxsIHtcclxuICAvLyBJZiBhbiBldmVudCBpcyBib3VuZCBvdXRzaWRlIHRoZSBTaGFkb3cgRE9NLCB0aGUgYGV2ZW50LnRhcmdldGAgd2lsbFxyXG4gIC8vIHBvaW50IHRvIHRoZSBzaGFkb3cgcm9vdCBzbyB3ZSBoYXZlIHRvIHVzZSBgY29tcG9zZWRQYXRoYCBpbnN0ZWFkLlxyXG4gIHJldHVybiAoZXZlbnQuY29tcG9zZWRQYXRoID8gZXZlbnQuY29tcG9zZWRQYXRoKClbMF0gOiBldmVudC50YXJnZXQpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBEaXJlY3RpdmUgdGhhdCBkZXRlcm1pbmVzIGhvdyBhIHBhcnRpY3VsYXIgZWxlbWVudCB3YXMgZm9jdXNlZCAodmlhIGtleWJvYXJkLCBtb3VzZSwgdG91Y2gsIG9yXHJcbiAqIHByb2dyYW1tYXRpY2FsbHkpIGFuZCBhZGRzIGNvcnJlc3BvbmRpbmcgY2xhc3NlcyB0byB0aGUgZWxlbWVudC5cclxuICpcclxuICogVGhlcmUgYXJlIHR3byB2YXJpYW50cyBvZiB0aGlzIGRpcmVjdGl2ZTpcclxuICogMSkgY2RrTW9uaXRvckVsZW1lbnRGb2N1czogZG9lcyBub3QgY29uc2lkZXIgYW4gZWxlbWVudCB0byBiZSBmb2N1c2VkIGlmIG9uZSBvZiBpdHMgY2hpbGRyZW4gaXNcclxuICogICAgZm9jdXNlZC5cclxuICogMikgY2RrTW9uaXRvclN1YnRyZWVGb2N1czogY29uc2lkZXJzIGFuIGVsZW1lbnQgZm9jdXNlZCBpZiBpdCBvciBhbnkgb2YgaXRzIGNoaWxkcmVuIGFyZSBmb2N1c2VkLlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrTW9uaXRvckVsZW1lbnRGb2N1c10sIFtjZGtNb25pdG9yU3VidHJlZUZvY3VzXScsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtNb25pdG9yRm9jdXMgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG4gIHByaXZhdGUgX21vbml0b3JTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICBAT3V0cHV0KCkgY2RrRm9jdXNDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPEZvY3VzT3JpZ2luPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgcHJpdmF0ZSBfZm9jdXNNb25pdG9yOiBGb2N1c01vbml0b3IpIHt9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB0aGlzLl9tb25pdG9yU3Vic2NyaXB0aW9uID0gdGhpcy5fZm9jdXNNb25pdG9yLm1vbml0b3IoXHJcbiAgICAgIGVsZW1lbnQsXHJcbiAgICAgIGVsZW1lbnQubm9kZVR5cGUgPT09IDEgJiYgZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2Nka01vbml0b3JTdWJ0cmVlRm9jdXMnKSlcclxuICAgIC5zdWJzY3JpYmUob3JpZ2luID0+IHRoaXMuY2RrRm9jdXNDaGFuZ2UuZW1pdChvcmlnaW4pKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fZm9jdXNNb25pdG9yLnN0b3BNb25pdG9yaW5nKHRoaXMuX2VsZW1lbnRSZWYpO1xyXG5cclxuICAgIGlmICh0aGlzLl9tb25pdG9yU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuX21vbml0b3JTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19