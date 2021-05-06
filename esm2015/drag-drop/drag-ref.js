/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { normalizePassiveListenerOptions, _getShadowRoot } from '@angular/cdk/platform';
import { coerceBooleanProperty, coerceElement } from '@angular/cdk/coercion';
import { Subscription, Subject } from 'rxjs';
import { extendStyles, toggleNativeDragInteractions, toggleVisibility } from './drag-styling';
import { getTransformTransitionDurationInMs } from './transition-duration';
import { getMutableClientRect, adjustClientRect } from './client-rect';
import { ParentPositionTracker } from './parent-position-tracker';
import { deepCloneNode } from './clone-node';
/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({ passive: false });
/**
 * Time in milliseconds for which to ignore mouse events, after
 * receiving a touch event. Used to avoid doing double work for
 * touch devices where the browser fires fake mouse events, in
 * addition to touch events.
 */
const MOUSE_EVENT_IGNORE_TIME = 800;
/**
 * Reference to a draggable item. Used to manipulate or dispose of the item.
 */
export class DragRef {
    constructor(element, _config, _document, _ngZone, _viewportRuler, _dragDropRegistry) {
        this._config = _config;
        this._document = _document;
        this._ngZone = _ngZone;
        this._viewportRuler = _viewportRuler;
        this._dragDropRegistry = _dragDropRegistry;
        /**
         * CSS `transform` applied to the element when it isn't being dragged. We need a
         * passive transform in order for the dragged element to retain its new position
         * after the user has stopped dragging and because we need to know the relative
         * position in case they start dragging again. This corresponds to `element.style.transform`.
         */
        this._passiveTransform = { x: 0, y: 0 };
        /** CSS `transform` that is applied to the element while it's being dragged. */
        this._activeTransform = { x: 0, y: 0 };
        /** Emits when the item is being moved. */
        this._moveEvents = new Subject();
        /** Subscription to pointer movement events. */
        this._pointerMoveSubscription = Subscription.EMPTY;
        /** Subscription to the event that is dispatched when the user lifts their pointer. */
        this._pointerUpSubscription = Subscription.EMPTY;
        /** Subscription to the viewport being scrolled. */
        this._scrollSubscription = Subscription.EMPTY;
        /** Subscription to the viewport being resized. */
        this._resizeSubscription = Subscription.EMPTY;
        /** Cached reference to the boundary element. */
        this._boundaryElement = null;
        /** Whether the native dragging interactions have been enabled on the root element. */
        this._nativeInteractionsEnabled = true;
        /** Elements that can be used to drag the draggable item. */
        this._handles = [];
        /** Registered handles that are currently disabled. */
        this._disabledHandles = new Set();
        /** Layout direction of the item. */
        this._direction = 'ltr';
        /**
         * Amount of milliseconds to wait after the user has put their
         * pointer down before starting to drag the element.
         */
        this.dragStartDelay = 0;
        this._disabled = false;
        /** Emits as the drag sequence is being prepared. */
        this.beforeStarted = new Subject();
        /** Emits when the user starts dragging the item. */
        this.started = new Subject();
        /** Emits when the user has released a drag item, before any animations have started. */
        this.released = new Subject();
        /** Emits when the user stops dragging an item in the container. */
        this.ended = new Subject();
        /** Emits when the user has moved the item into a new container. */
        this.entered = new Subject();
        /** Emits when the user removes the item its container by dragging it into another container. */
        this.exited = new Subject();
        /** Emits when the user drops the item inside a container. */
        this.dropped = new Subject();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = this._moveEvents;
        /** Handler for the `mousedown`/`touchstart` events. */
        this._pointerDown = (event) => {
            this.beforeStarted.next();
            // Delegate the event based on whether it started from a handle or the element itself.
            if (this._handles.length) {
                const targetHandle = this._handles.find(handle => {
                    const target = event.target;
                    return !!target && (target === handle || handle.contains(target));
                });
                if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
                    this._initializeDragSequence(targetHandle, event);
                }
            }
            else if (!this.disabled) {
                this._initializeDragSequence(this._rootElement, event);
            }
        };
        /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
        this._pointerMove = (event) => {
            const pointerPosition = this._getPointerPositionOnPage(event);
            if (!this._hasStartedDragging) {
                const distanceX = Math.abs(pointerPosition.x - this._pickupPositionOnPage.x);
                const distanceY = Math.abs(pointerPosition.y - this._pickupPositionOnPage.y);
                const isOverThreshold = distanceX + distanceY >= this._config.dragStartThreshold;
                // Only start dragging after the user has moved more than the minimum distance in either
                // direction. Note that this is preferrable over doing something like `skip(minimumDistance)`
                // in the `pointerMove` subscription, because we're not guaranteed to have one move event
                // per pixel of movement (e.g. if the user moves their pointer quickly).
                if (isOverThreshold) {
                    const isDelayElapsed = Date.now() >= this._dragStartTime + this._getDragStartDelay(event);
                    const container = this._dropContainer;
                    if (!isDelayElapsed) {
                        this._endDragSequence(event);
                        return;
                    }
                    // Prevent other drag sequences from starting while something in the container is still
                    // being dragged. This can happen while we're waiting for the drop animation to finish
                    // and can cause errors, because some elements might still be moving around.
                    if (!container || (!container.isDragging() && !container.isReceiving())) {
                        // Prevent the default action as soon as the dragging sequence is considered as
                        // "started" since waiting for the next event can allow the device to begin scrolling.
                        event.preventDefault();
                        this._hasStartedDragging = true;
                        this._ngZone.run(() => this._startDragSequence(event));
                    }
                }
                return;
            }
            // We only need the preview dimensions if we have a boundary element.
            if (this._boundaryElement) {
                // Cache the preview element rect if we haven't cached it already or if
                // we cached it too early before the element dimensions were computed.
                if (!this._previewRect || (!this._previewRect.width && !this._previewRect.height)) {
                    this._previewRect = (this._preview || this._rootElement).getBoundingClientRect();
                }
            }
            // We prevent the default action down here so that we know that dragging has started. This is
            // important for touch devices where doing this too early can unnecessarily block scrolling,
            // if there's a dragging delay.
            event.preventDefault();
            const constrainedPointerPosition = this._getConstrainedPointerPosition(pointerPosition);
            this._hasMoved = true;
            this._lastKnownPointerPosition = pointerPosition;
            this._updatePointerDirectionDelta(constrainedPointerPosition);
            let transformRatioX = 1.0;
            let transformRatioY = 1.0;
            if (typeof SVGElement !== 'undefined' && this._rootElement instanceof SVGElement) {
                const svgElement = this._rootElement.ownerSVGElement;
                const svgViewBoxRect = svgElement === null || svgElement === void 0 ? void 0 : svgElement.viewBox.baseVal;
                if ((svgElement === null || svgElement === void 0 ? void 0 : svgElement.clientWidth) !== 0 && (svgElement === null || svgElement === void 0 ? void 0 : svgElement.clientHeight) !== 0) {
                    const preserveAspectRatio = svgElement.preserveAspectRatio;
                    const aspectRatio = svgViewBoxRect.width / svgViewBoxRect.height;
                    let widthRatio = svgViewBoxRect.width / svgElement.clientWidth;
                    let heightRatio = svgViewBoxRect.height / svgElement.clientHeight;
                    if (preserveAspectRatio.baseVal.align !== preserveAspectRatio.baseVal.SVG_PRESERVEASPECTRATIO_NONE) {
                        if (preserveAspectRatio.baseVal.meetOrSlice == preserveAspectRatio.baseVal.SVG_MEETORSLICE_MEET) {
                            // meet (scale-down)
                            if (widthRatio > heightRatio) {
                                transformRatioX = widthRatio;
                                const height = svgElement.clientWidth / aspectRatio;
                                transformRatioY = svgViewBoxRect.height / height;
                            }
                            else if (heightRatio > widthRatio) {
                                transformRatioY = heightRatio;
                                const width = svgElement.clientHeight * aspectRatio;
                                transformRatioX = svgViewBoxRect.width / width;
                            }
                        }
                        else {
                            // slice (scale-up)
                            if (widthRatio > heightRatio) {
                                transformRatioY = heightRatio;
                                const width = svgElement.clientHeight * aspectRatio;
                                transformRatioX = svgViewBoxRect.width / width;
                            }
                            else if (heightRatio > widthRatio) {
                                transformRatioX = widthRatio;
                                const height = svgElement.clientWidth / aspectRatio;
                                transformRatioY = svgViewBoxRect.height / height;
                            }
                        }
                    }
                    else {
                        if ((svgViewBoxRect === null || svgViewBoxRect === void 0 ? void 0 : svgViewBoxRect.width) !== 0) {
                            transformRatioX = widthRatio;
                        }
                        if ((svgViewBoxRect === null || svgViewBoxRect === void 0 ? void 0 : svgViewBoxRect.height) !== 0) {
                            transformRatioY = heightRatio;
                        }
                    }
                }
            }
            const activeTransform = this._activeTransform;
            activeTransform.x =
                (constrainedPointerPosition.x - this._pickupPositionOnPage.x) * transformRatioX + this._passiveTransform.x;
            activeTransform.y =
                (constrainedPointerPosition.y - this._pickupPositionOnPage.y) * transformRatioY + this._passiveTransform.y;
            this._applyRootElementTransform(activeTransform.x, activeTransform.y);
            // Since this event gets fired for every pixel while dragging, we only
            // want to fire it if the consumer opted into it. Also we have to
            // re-enter the zone because we run all of the events on the outside.
            if (this._moveEvents.observers.length) {
                this._ngZone.run(() => {
                    this._moveEvents.next({
                        source: this,
                        pointerPosition: constrainedPointerPosition,
                        event,
                        distance: this._getDragDistance(constrainedPointerPosition),
                        delta: this._pointerDirectionDelta
                    });
                });
            }
        };
        /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
        this._pointerUp = (event) => {
            this._endDragSequence(event);
        };
        this.withRootElement(element).withParent(_config.parentDragRef || null);
        this._parentPositions = new ParentPositionTracker(_document, _viewportRuler);
        _dragDropRegistry.registerDragItem(this);
    }
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || !!(this._dropContainer && this._dropContainer.disabled);
    }
    set disabled(value) {
        const newValue = coerceBooleanProperty(value);
        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this._toggleNativeDragInteractions();
            this._handles.forEach(handle => toggleNativeDragInteractions(handle, newValue));
        }
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    getPlaceholderElement() {
        return this._placeholder;
    }
    /** Returns the root draggable element. */
    getRootElement() {
        return this._rootElement;
    }
    /**
     * Gets the currently-visible element that represents the drag item.
     * While dragging this is the placeholder, otherwise it's the root element.
     */
    getVisibleElement() {
        return this.isDragging() ? this.getPlaceholderElement() : this.getRootElement();
    }
    /** Registers the handles that can be used to drag the element. */
    withHandles(handles) {
        this._handles = handles.map(handle => coerceElement(handle));
        this._handles.forEach(handle => toggleNativeDragInteractions(handle, this.disabled));
        this._toggleNativeDragInteractions();
        // Delete any lingering disabled handles that may have been destroyed. Note that we re-create
        // the set, rather than iterate over it and filter out the destroyed handles, because while
        // the ES spec allows for sets to be modified while they're being iterated over, some polyfills
        // use an array internally which may throw an error.
        const disabledHandles = new Set();
        this._disabledHandles.forEach(handle => {
            if (this._handles.indexOf(handle) > -1) {
                disabledHandles.add(handle);
            }
        });
        this._disabledHandles = disabledHandles;
        return this;
    }
    /**
     * Registers the template that should be used for the drag preview.
     * @param template Template that from which to stamp out the preview.
     */
    withPreviewTemplate(template) {
        this._previewTemplate = template;
        return this;
    }
    /**
     * Registers the template that should be used for the drag placeholder.
     * @param template Template that from which to stamp out the placeholder.
     */
    withPlaceholderTemplate(template) {
        this._placeholderTemplate = template;
        return this;
    }
    /**
     * Sets an alternate drag root element. The root element is the element that will be moved as
     * the user is dragging. Passing an alternate root element is useful when trying to enable
     * dragging on an element that you might not have access to.
     */
    withRootElement(rootElement) {
        const element = coerceElement(rootElement);
        if (element !== this._rootElement) {
            if (this._rootElement) {
                this._removeRootElementListeners(this._rootElement);
            }
            this._ngZone.runOutsideAngular(() => {
                element.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
                element.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
            });
            this._initialTransform = undefined;
            this._rootElement = element;
        }
        return this;
    }
    /**
     * Element to which the draggable's position will be constrained.
     */
    withBoundaryElement(boundaryElement) {
        this._boundaryElement = boundaryElement ? coerceElement(boundaryElement) : null;
        this._resizeSubscription.unsubscribe();
        if (boundaryElement) {
            this._resizeSubscription = this._viewportRuler
                .change(10)
                .subscribe(() => this._containInsideBoundaryOnResize());
        }
        return this;
    }
    /** Sets the parent ref that the ref is nested in.  */
    withParent(parent) {
        this._parentDragRef = parent;
        return this;
    }
    /** Removes the dragging functionality from the DOM element. */
    dispose() {
        this._removeRootElementListeners(this._rootElement);
        // Do this check before removing from the registry since it'll
        // stop being considered as dragged once it is removed.
        if (this.isDragging()) {
            // Since we move out the element to the end of the body while it's being
            // dragged, we have to make sure that it's removed if it gets destroyed.
            removeNode(this._rootElement);
        }
        removeNode(this._anchor);
        this._destroyPreview();
        this._destroyPlaceholder();
        this._dragDropRegistry.removeDragItem(this);
        this._removeSubscriptions();
        this.beforeStarted.complete();
        this.started.complete();
        this.released.complete();
        this.ended.complete();
        this.entered.complete();
        this.exited.complete();
        this.dropped.complete();
        this._moveEvents.complete();
        this._handles = [];
        this._disabledHandles.clear();
        this._dropContainer = undefined;
        this._resizeSubscription.unsubscribe();
        this._parentPositions.clear();
        this._boundaryElement = this._rootElement = this._placeholderTemplate =
            this._previewTemplate = this._anchor = this._parentDragRef = null;
    }
    /** Checks whether the element is currently being dragged. */
    isDragging() {
        return this._hasStartedDragging && this._dragDropRegistry.isDragging(this);
    }
    /** Resets a standalone drag item to its initial position. */
    reset() {
        this._rootElement.style.transform = this._initialTransform || '';
        this._activeTransform = { x: 0, y: 0 };
        this._passiveTransform = { x: 0, y: 0 };
    }
    /**
     * Sets a handle as disabled. While a handle is disabled, it'll capture and interrupt dragging.
     * @param handle Handle element that should be disabled.
     */
    disableHandle(handle) {
        if (!this._disabledHandles.has(handle) && this._handles.indexOf(handle) > -1) {
            this._disabledHandles.add(handle);
            toggleNativeDragInteractions(handle, true);
        }
    }
    /**
     * Enables a handle, if it has been disabled.
     * @param handle Handle element to be enabled.
     */
    enableHandle(handle) {
        if (this._disabledHandles.has(handle)) {
            this._disabledHandles.delete(handle);
            toggleNativeDragInteractions(handle, this.disabled);
        }
    }
    /** Sets the layout direction of the draggable item. */
    withDirection(direction) {
        this._direction = direction;
        return this;
    }
    /** Sets the container that the item is part of. */
    _withDropContainer(container) {
        this._dropContainer = container;
    }
    /**
     * Gets the current position in pixels the draggable outside of a drop container.
     */
    getFreeDragPosition() {
        const position = this.isDragging() ? this._activeTransform : this._passiveTransform;
        return { x: position.x, y: position.y };
    }
    /**
     * Sets the current position in pixels the draggable outside of a drop container.
     * @param value New position to be set.
     */
    setFreeDragPosition(value) {
        this._activeTransform = { x: 0, y: 0 };
        this._passiveTransform.x = value.x;
        this._passiveTransform.y = value.y;
        if (!this._dropContainer) {
            this._applyRootElementTransform(value.x, value.y);
        }
        return this;
    }
    /** Updates the item's sort order based on the last-known pointer position. */
    _sortFromLastPointerPosition() {
        const position = this._lastKnownPointerPosition;
        if (position && this._dropContainer) {
            this._updateActiveDropContainer(this._getConstrainedPointerPosition(position), position);
        }
    }
    /** Unsubscribes from the global subscriptions. */
    _removeSubscriptions() {
        this._pointerMoveSubscription.unsubscribe();
        this._pointerUpSubscription.unsubscribe();
        this._scrollSubscription.unsubscribe();
    }
    /** Destroys the preview element and its ViewRef. */
    _destroyPreview() {
        if (this._preview) {
            removeNode(this._preview);
        }
        if (this._previewRef) {
            this._previewRef.destroy();
        }
        this._preview = this._previewRef = null;
    }
    /** Destroys the placeholder element and its ViewRef. */
    _destroyPlaceholder() {
        if (this._placeholder) {
            removeNode(this._placeholder);
        }
        if (this._placeholderRef) {
            this._placeholderRef.destroy();
        }
        this._placeholder = this._placeholderRef = null;
    }
    /**
     * Clears subscriptions and stops the dragging sequence.
     * @param event Browser event object that ended the sequence.
     */
    _endDragSequence(event) {
        // Note that here we use `isDragging` from the service, rather than from `this`.
        // The difference is that the one from the service reflects whether a dragging sequence
        // has been initiated, whereas the one on `this` includes whether the user has passed
        // the minimum dragging threshold.
        if (!this._dragDropRegistry.isDragging(this)) {
            return;
        }
        this._removeSubscriptions();
        this._dragDropRegistry.stopDragging(this);
        this._toggleNativeDragInteractions();
        if (this._handles) {
            this._rootElement.style.webkitTapHighlightColor = this._rootElementTapHighlight;
        }
        if (!this._hasStartedDragging) {
            return;
        }
        this.released.next({ source: this });
        if (this._dropContainer) {
            // Stop scrolling immediately, instead of waiting for the animation to finish.
            this._dropContainer._stopScrolling();
            this._animatePreviewToPlaceholder().then(() => {
                this._cleanupDragArtifacts(event);
                this._cleanupCachedDimensions();
                this._dragDropRegistry.stopDragging(this);
            });
        }
        else {
            // Convert the active transform into a passive one. This means that next time
            // the user starts dragging the item, its position will be calculated relatively
            // to the new passive transform.
            this._passiveTransform.x = this._activeTransform.x;
            this._passiveTransform.y = this._activeTransform.y;
            this._ngZone.run(() => {
                this.ended.next({
                    source: this,
                    distance: this._getDragDistance(this._getPointerPositionOnPage(event))
                });
            });
            this._cleanupCachedDimensions();
            this._dragDropRegistry.stopDragging(this);
        }
    }
    /** Starts the dragging sequence. */
    _startDragSequence(event) {
        if (isTouchEvent(event)) {
            this._lastTouchEventTime = Date.now();
        }
        this._toggleNativeDragInteractions();
        const dropContainer = this._dropContainer;
        if (dropContainer) {
            const element = this._rootElement;
            const parent = element.parentNode;
            const preview = this._preview = this._createPreviewElement();
            const placeholder = this._placeholder = this._createPlaceholderElement();
            const anchor = this._anchor = this._anchor || this._document.createComment('');
            // Needs to happen before the root element is moved.
            const shadowRoot = this._getShadowRoot();
            // Insert an anchor node so that we can restore the element's position in the DOM.
            parent.insertBefore(anchor, element);
            // We move the element out at the end of the body and we make it hidden, because keeping it in
            // place will throw off the consumer's `:last-child` selectors. We can't remove the element
            // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
            toggleVisibility(element, false);
            this._document.body.appendChild(parent.replaceChild(placeholder, element));
            getPreviewInsertionPoint(this._document, shadowRoot).appendChild(preview);
            this.started.next({ source: this }); // Emit before notifying the container.
            dropContainer.start();
            this._initialContainer = dropContainer;
            this._initialIndex = dropContainer.getItemIndex(this);
        }
        else {
            this.started.next({ source: this });
            this._initialContainer = this._initialIndex = undefined;
        }
        // Important to run after we've called `start` on the parent container
        // so that it has had time to resolve its scrollable parents.
        this._parentPositions.cache(dropContainer ? dropContainer.getScrollableParents() : []);
    }
    /**
     * Sets up the different variables and subscriptions
     * that will be necessary for the dragging sequence.
     * @param referenceElement Element that started the drag sequence.
     * @param event Browser event object that started the sequence.
     */
    _initializeDragSequence(referenceElement, event) {
        // Stop propagation if the item is inside another
        // draggable so we don't start multiple drag sequences.
        if (this._parentDragRef) {
            event.stopPropagation();
        }
        const isDragging = this.isDragging();
        const isTouchSequence = isTouchEvent(event);
        const isAuxiliaryMouseButton = !isTouchSequence && event.button !== 0;
        const rootElement = this._rootElement;
        const isSyntheticEvent = !isTouchSequence && this._lastTouchEventTime &&
            this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();
        // If the event started from an element with the native HTML drag&drop, it'll interfere
        // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
        // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
        // it's flaky and it fails if the user drags it away quickly. Also note that we only want
        // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
        // events from firing on touch devices.
        if (event.target && event.target.draggable && event.type === 'mousedown') {
            event.preventDefault();
        }
        // Abort if the user is already dragging or is using a mouse button other than the primary one.
        if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent) {
            return;
        }
        // If we've got handles, we need to disable the tap highlight on the entire root element,
        // otherwise iOS will still add it, even though all the drag interactions on the handle
        // are disabled.
        if (this._handles.length) {
            this._rootElementTapHighlight = rootElement.style.webkitTapHighlightColor || '';
            rootElement.style.webkitTapHighlightColor = 'transparent';
        }
        this._hasStartedDragging = this._hasMoved = false;
        // Avoid multiple subscriptions and memory leaks when multi touch
        // (isDragging check above isn't enough because of possible temporal and/or dimensional delays)
        this._removeSubscriptions();
        this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
        this._pointerUpSubscription = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
        this._scrollSubscription = this._dragDropRegistry.scroll.subscribe(scrollEvent => {
            this._updateOnScroll(scrollEvent);
        });
        if (this._boundaryElement) {
            this._boundaryRect = getMutableClientRect(this._boundaryElement);
        }
        // If we have a custom preview we can't know ahead of time how large it'll be so we position
        // it next to the cursor. The exception is when the consumer has opted into making the preview
        // the same size as the root element, in which case we do know the size.
        const previewTemplate = this._previewTemplate;
        this._pickupPositionInElement = previewTemplate && previewTemplate.template &&
            !previewTemplate.matchSize ? { x: 0, y: 0 } :
            this._getPointerPositionInElement(referenceElement, event);
        const pointerPosition = this._pickupPositionOnPage = this._lastKnownPointerPosition =
            this._getPointerPositionOnPage(event);
        this._pointerDirectionDelta = { x: 0, y: 0 };
        this._pointerPositionAtLastDirectionChange = { x: pointerPosition.x, y: pointerPosition.y };
        this._dragStartTime = Date.now();
        this._dragDropRegistry.startDragging(this, event);
    }
    /** Cleans up the DOM artifacts that were added to facilitate the element being dragged. */
    _cleanupDragArtifacts(event) {
        // Restore the element's visibility and insert it at its old position in the DOM.
        // It's important that we maintain the position, because moving the element around in the DOM
        // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
        // while moving the existing elements in all other cases.
        toggleVisibility(this._rootElement, true);
        this._anchor.parentNode.replaceChild(this._rootElement, this._anchor);
        this._destroyPreview();
        this._destroyPlaceholder();
        this._boundaryRect = this._previewRect = undefined;
        // Re-enter the NgZone since we bound `document` events on the outside.
        this._ngZone.run(() => {
            const container = this._dropContainer;
            const currentIndex = container.getItemIndex(this);
            const pointerPosition = this._getPointerPositionOnPage(event);
            const distance = this._getDragDistance(this._getPointerPositionOnPage(event));
            const isPointerOverContainer = container._isOverContainer(pointerPosition.x, pointerPosition.y);
            this.ended.next({ source: this, distance });
            this.dropped.next({
                item: this,
                currentIndex,
                previousIndex: this._initialIndex,
                container: container,
                previousContainer: this._initialContainer,
                isPointerOverContainer,
                distance
            });
            container.drop(this, currentIndex, this._initialIndex, this._initialContainer, isPointerOverContainer, distance);
            this._dropContainer = this._initialContainer;
        });
    }
    /**
     * Updates the item's position in its drop container, or moves it
     * into a new one, depending on its current drag position.
     */
    _updateActiveDropContainer({ x, y }, { x: rawX, y: rawY }) {
        // Drop container that draggable has been moved into.
        let newContainer = this._initialContainer._getSiblingContainerFromPosition(this, x, y);
        // If we couldn't find a new container to move the item into, and the item has left its
        // initial container, check whether the it's over the initial container. This handles the
        // case where two containers are connected one way and the user tries to undo dragging an
        // item into a new container.
        if (!newContainer && this._dropContainer !== this._initialContainer &&
            this._initialContainer._isOverContainer(x, y)) {
            newContainer = this._initialContainer;
        }
        if (newContainer && newContainer !== this._dropContainer) {
            this._ngZone.run(() => {
                // Notify the old container that the item has left.
                this.exited.next({ item: this, container: this._dropContainer });
                this._dropContainer.exit(this);
                // Notify the new container that the item has entered.
                this._dropContainer = newContainer;
                this._dropContainer.enter(this, x, y, newContainer === this._initialContainer &&
                    // If we're re-entering the initial container and sorting is disabled,
                    // put item the into its starting index to begin with.
                    newContainer.sortingDisabled ? this._initialIndex : undefined);
                this.entered.next({
                    item: this,
                    container: newContainer,
                    currentIndex: newContainer.getItemIndex(this)
                });
            });
        }
        this._dropContainer._startScrollingIfNecessary(rawX, rawY);
        this._dropContainer._sortItem(this, x, y, this._pointerDirectionDelta);
        this._preview.style.transform =
            getTransform(x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
    }
    /**
     * Creates the element that will be rendered next to the user's pointer
     * and will be used as a preview of the element that is being dragged.
     */
    _createPreviewElement() {
        const previewConfig = this._previewTemplate;
        const previewClass = this.previewClass;
        const previewTemplate = previewConfig ? previewConfig.template : null;
        let preview;
        if (previewTemplate && previewConfig) {
            // Measure the element before we've inserted the preview
            // since the insertion could throw off the measurement.
            const rootRect = previewConfig.matchSize ? this._rootElement.getBoundingClientRect() : null;
            const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate, previewConfig.context);
            viewRef.detectChanges();
            preview = getRootNode(viewRef, this._document);
            this._previewRef = viewRef;
            if (previewConfig.matchSize) {
                matchElementSize(preview, rootRect);
            }
            else {
                preview.style.transform =
                    getTransform(this._pickupPositionOnPage.x, this._pickupPositionOnPage.y);
            }
        }
        else {
            const element = this._rootElement;
            preview = deepCloneNode(element);
            matchElementSize(preview, element.getBoundingClientRect());
        }
        extendStyles(preview.style, {
            // It's important that we disable the pointer events on the preview, because
            // it can throw off the `document.elementFromPoint` calls in the `CdkDropList`.
            pointerEvents: 'none',
            // We have to reset the margin, because it can throw off positioning relative to the viewport.
            margin: '0',
            position: 'fixed',
            top: '0',
            left: '0',
            zIndex: `${this._config.zIndex || 1000}`
        });
        toggleNativeDragInteractions(preview, false);
        preview.classList.add('cdk-drag-preview');
        preview.setAttribute('dir', this._direction);
        if (previewClass) {
            if (Array.isArray(previewClass)) {
                previewClass.forEach(className => preview.classList.add(className));
            }
            else {
                preview.classList.add(previewClass);
            }
        }
        return preview;
    }
    /**
     * Animates the preview element from its current position to the location of the drop placeholder.
     * @returns Promise that resolves when the animation completes.
     */
    _animatePreviewToPlaceholder() {
        // If the user hasn't moved yet, the transitionend event won't fire.
        if (!this._hasMoved) {
            return Promise.resolve();
        }
        const placeholderRect = this._placeholder.getBoundingClientRect();
        // Apply the class that adds a transition to the preview.
        this._preview.classList.add('cdk-drag-animating');
        // Move the preview to the placeholder position.
        this._preview.style.transform = getTransform(placeholderRect.left, placeholderRect.top);
        // If the element doesn't have a `transition`, the `transitionend` event won't fire. Since
        // we need to trigger a style recalculation in order for the `cdk-drag-animating` class to
        // apply its style, we take advantage of the available info to figure out whether we need to
        // bind the event in the first place.
        const duration = getTransformTransitionDurationInMs(this._preview);
        if (duration === 0) {
            return Promise.resolve();
        }
        return this._ngZone.runOutsideAngular(() => {
            return new Promise(resolve => {
                const handler = ((event) => {
                    if (!event || (event.target === this._preview && event.propertyName === 'transform')) {
                        this._preview.removeEventListener('transitionend', handler);
                        resolve();
                        clearTimeout(timeout);
                    }
                });
                // If a transition is short enough, the browser might not fire the `transitionend` event.
                // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
                // fire if the transition hasn't completed when it was supposed to.
                const timeout = setTimeout(handler, duration * 1.5);
                this._preview.addEventListener('transitionend', handler);
            });
        });
    }
    /** Creates an element that will be shown instead of the current element while dragging. */
    _createPlaceholderElement() {
        const placeholderConfig = this._placeholderTemplate;
        const placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
        let placeholder;
        if (placeholderTemplate) {
            this._placeholderRef = placeholderConfig.viewContainer.createEmbeddedView(placeholderTemplate, placeholderConfig.context);
            this._placeholderRef.detectChanges();
            placeholder = getRootNode(this._placeholderRef, this._document);
        }
        else {
            placeholder = deepCloneNode(this._rootElement);
        }
        placeholder.classList.add('cdk-drag-placeholder');
        return placeholder;
    }
    /**
     * Figures out the coordinates at which an element was picked up.
     * @param referenceElement Element that initiated the dragging.
     * @param event Event that initiated the dragging.
     */
    _getPointerPositionInElement(referenceElement, event) {
        const elementRect = this._rootElement.getBoundingClientRect();
        const handleElement = referenceElement === this._rootElement ? null : referenceElement;
        const referenceRect = handleElement ? handleElement.getBoundingClientRect() : elementRect;
        const point = isTouchEvent(event) ? event.targetTouches[0] : event;
        const scrollPosition = this._getViewportScrollPosition();
        const x = point.pageX - referenceRect.left - scrollPosition.left;
        const y = point.pageY - referenceRect.top - scrollPosition.top;
        return {
            x: referenceRect.left - elementRect.left + x,
            y: referenceRect.top - elementRect.top + y
        };
    }
    /** Determines the point of the page that was touched by the user. */
    _getPointerPositionOnPage(event) {
        const scrollPosition = this._getViewportScrollPosition();
        const point = isTouchEvent(event) ?
            // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
            // Also note that on real devices we're guaranteed for either `touches` or `changedTouches`
            // to have a value, but Firefox in device emulation mode has a bug where both can be empty
            // for `touchstart` and `touchend` so we fall back to a dummy object in order to avoid
            // throwing an error. The value returned here will be incorrect, but since this only
            // breaks inside a developer tool and the value is only used for secondary information,
            // we can get away with it. See https://bugzilla.mozilla.org/show_bug.cgi?id=1615824.
            (event.touches[0] || event.changedTouches[0] || { pageX: 0, pageY: 0 }) : event;
        return {
            x: point.pageX - scrollPosition.left,
            y: point.pageY - scrollPosition.top
        };
    }
    /** Gets the pointer position on the page, accounting for any position constraints. */
    _getConstrainedPointerPosition(point) {
        const dropContainerLock = this._dropContainer ? this._dropContainer.lockAxis : null;
        let { x, y } = this.constrainPosition ? this.constrainPosition(point, this) : point;
        if (this.lockAxis === 'x' || dropContainerLock === 'x') {
            y = this._pickupPositionOnPage.y;
        }
        else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
            x = this._pickupPositionOnPage.x;
        }
        if (this._boundaryRect) {
            const { x: pickupX, y: pickupY } = this._pickupPositionInElement;
            const boundaryRect = this._boundaryRect;
            const previewRect = this._previewRect;
            const minY = boundaryRect.top + pickupY;
            const maxY = boundaryRect.bottom - (previewRect.height - pickupY);
            const minX = boundaryRect.left + pickupX;
            const maxX = boundaryRect.right - (previewRect.width - pickupX);
            x = clamp(x, minX, maxX);
            y = clamp(y, minY, maxY);
        }
        return { x, y };
    }
    /** Updates the current drag delta, based on the user's current pointer position on the page. */
    _updatePointerDirectionDelta(pointerPositionOnPage) {
        const { x, y } = pointerPositionOnPage;
        const delta = this._pointerDirectionDelta;
        const positionSinceLastChange = this._pointerPositionAtLastDirectionChange;
        // Amount of pixels the user has dragged since the last time the direction changed.
        const changeX = Math.abs(x - positionSinceLastChange.x);
        const changeY = Math.abs(y - positionSinceLastChange.y);
        // Because we handle pointer events on a per-pixel basis, we don't want the delta
        // to change for every pixel, otherwise anything that depends on it can look erratic.
        // To make the delta more consistent, we track how much the user has moved since the last
        // delta change and we only update it after it has reached a certain threshold.
        if (changeX > this._config.pointerDirectionChangeThreshold) {
            delta.x = x > positionSinceLastChange.x ? 1 : -1;
            positionSinceLastChange.x = x;
        }
        if (changeY > this._config.pointerDirectionChangeThreshold) {
            delta.y = y > positionSinceLastChange.y ? 1 : -1;
            positionSinceLastChange.y = y;
        }
        return delta;
    }
    /** Toggles the native drag interactions, based on how many handles are registered. */
    _toggleNativeDragInteractions() {
        if (!this._rootElement || !this._handles) {
            return;
        }
        const shouldEnable = this._handles.length > 0 || !this.isDragging();
        if (shouldEnable !== this._nativeInteractionsEnabled) {
            this._nativeInteractionsEnabled = shouldEnable;
            toggleNativeDragInteractions(this._rootElement, shouldEnable);
        }
    }
    /** Removes the manually-added event listeners from the root element. */
    _removeRootElementListeners(element) {
        element.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
        element.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
    }
    /**
     * Applies a `transform` to the root element, taking into account any existing transforms on it.
     * @param x New transform value along the X axis.
     * @param y New transform value along the Y axis.
     */
    _applyRootElementTransform(x, y) {
        const transform = getTransform(x, y);
        // Cache the previous transform amount only after the first drag sequence, because
        // we don't want our own transforms to stack on top of each other.
        if (this._initialTransform == null) {
            this._initialTransform = this._rootElement.style.transform || '';
        }
        // Preserve the previous `transform` value, if there was one. Note that we apply our own
        // transform before the user's, because things like rotation can affect which direction
        // the element will be translated towards.
        this._rootElement.style.transform = this._initialTransform ?
            transform + ' ' + this._initialTransform : transform;
    }
    /**
     * Gets the distance that the user has dragged during the current drag sequence.
     * @param currentPosition Current position of the user's pointer.
     */
    _getDragDistance(currentPosition) {
        const pickupPosition = this._pickupPositionOnPage;
        if (pickupPosition) {
            return { x: currentPosition.x - pickupPosition.x, y: currentPosition.y - pickupPosition.y };
        }
        return { x: 0, y: 0 };
    }
    /** Cleans up any cached element dimensions that we don't need after dragging has stopped. */
    _cleanupCachedDimensions() {
        this._boundaryRect = this._previewRect = undefined;
        this._parentPositions.clear();
    }
    /**
     * Checks whether the element is still inside its boundary after the viewport has been resized.
     * If not, the position is adjusted so that the element fits again.
     */
    _containInsideBoundaryOnResize() {
        let { x, y } = this._passiveTransform;
        if ((x === 0 && y === 0) || this.isDragging() || !this._boundaryElement) {
            return;
        }
        const boundaryRect = this._boundaryElement.getBoundingClientRect();
        const elementRect = this._rootElement.getBoundingClientRect();
        // It's possible that the element got hidden away after dragging (e.g. by switching to a
        // different tab). Don't do anything in this case so we don't clear the user's position.
        if ((boundaryRect.width === 0 && boundaryRect.height === 0) ||
            (elementRect.width === 0 && elementRect.height === 0)) {
            return;
        }
        const leftOverflow = boundaryRect.left - elementRect.left;
        const rightOverflow = elementRect.right - boundaryRect.right;
        const topOverflow = boundaryRect.top - elementRect.top;
        const bottomOverflow = elementRect.bottom - boundaryRect.bottom;
        // If the element has become wider than the boundary, we can't
        // do much to make it fit so we just anchor it to the left.
        if (boundaryRect.width > elementRect.width) {
            if (leftOverflow > 0) {
                x += leftOverflow;
            }
            if (rightOverflow > 0) {
                x -= rightOverflow;
            }
        }
        else {
            x = 0;
        }
        // If the element has become taller than the boundary, we can't
        // do much to make it fit so we just anchor it to the top.
        if (boundaryRect.height > elementRect.height) {
            if (topOverflow > 0) {
                y += topOverflow;
            }
            if (bottomOverflow > 0) {
                y -= bottomOverflow;
            }
        }
        else {
            y = 0;
        }
        if (x !== this._passiveTransform.x || y !== this._passiveTransform.y) {
            this.setFreeDragPosition({ y, x });
        }
    }
    /** Gets the drag start delay, based on the event type. */
    _getDragStartDelay(event) {
        const value = this.dragStartDelay;
        if (typeof value === 'number') {
            return value;
        }
        else if (isTouchEvent(event)) {
            return value.touch;
        }
        return value ? value.mouse : 0;
    }
    /** Updates the internal state of the draggable element when scrolling has occurred. */
    _updateOnScroll(event) {
        const scrollDifference = this._parentPositions.handleScroll(event);
        if (scrollDifference) {
            const target = event.target;
            // ClientRect dimensions are based on the scroll position of the page and its parent node so
            // we have to update the cached boundary ClientRect if the user has scrolled. Check for
            // the `document` specifically since IE doesn't support `contains` on it.
            if (this._boundaryRect && (target === this._document ||
                (target !== this._boundaryElement && target.contains(this._boundaryElement)))) {
                adjustClientRect(this._boundaryRect, scrollDifference.top, scrollDifference.left);
            }
            this._pickupPositionOnPage.x += scrollDifference.left;
            this._pickupPositionOnPage.y += scrollDifference.top;
            // If we're in free drag mode, we have to update the active transform, because
            // it isn't relative to the viewport like the preview inside a drop list.
            if (!this._dropContainer) {
                this._activeTransform.x -= scrollDifference.left;
                this._activeTransform.y -= scrollDifference.top;
                this._applyRootElementTransform(this._activeTransform.x, this._activeTransform.y);
            }
        }
    }
    /** Gets the scroll position of the viewport. */
    _getViewportScrollPosition() {
        const cachedPosition = this._parentPositions.positions.get(this._document);
        return cachedPosition ? cachedPosition.scrollPosition :
            this._viewportRuler.getViewportScrollPosition();
    }
    /**
     * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
     * than saving it in property directly on init, because we want to resolve it as late as possible
     * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
     * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
     */
    _getShadowRoot() {
        if (this._cachedShadowRoot === undefined) {
            this._cachedShadowRoot = _getShadowRoot(this._rootElement);
        }
        return this._cachedShadowRoot;
    }
}
/**
 * Gets a 3d `transform` that can be applied to an element.
 * @param x Desired position of the element along the X axis.
 * @param y Desired position of the element along the Y axis.
 */
function getTransform(x, y) {
    // Round the transforms since some browsers will
    // blur the elements for sub-pixel transforms.
    return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}
/** Clamps a value between a minimum and a maximum. */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/**
 * Helper to remove a node from the DOM and to do all the necessary null checks.
 * @param node Node to be removed.
 */
function removeNode(node) {
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
/** Determines whether an event is a touch event. */
function isTouchEvent(event) {
    // This function is called for every pixel that the user has dragged so we need it to be
    // as fast as possible. Since we only bind mouse events and touch events, we can assume
    // that if the event's name starts with `t`, it's a touch event.
    return event.type[0] === 't';
}
/** Gets the element into which the drag preview should be inserted. */
function getPreviewInsertionPoint(documentRef, shadowRoot) {
    // We can't use the body if the user is in fullscreen mode,
    // because the preview will render under the fullscreen element.
    // TODO(crisbeto): dedupe this with the `FullscreenOverlayContainer` eventually.
    return shadowRoot ||
        documentRef.fullscreenElement ||
        documentRef.webkitFullscreenElement ||
        documentRef.mozFullScreenElement ||
        documentRef.msFullscreenElement ||
        documentRef.body;
}
/**
 * Gets the root HTML element of an embedded view.
 * If the root is not an HTML element it gets wrapped in one.
 */
function getRootNode(viewRef, _document) {
    const rootNodes = viewRef.rootNodes;
    if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
        return rootNodes[0];
    }
    const wrapper = _document.createElement('div');
    rootNodes.forEach(node => wrapper.appendChild(node));
    return wrapper;
}
/**
 * Matches the target element's size to the source's size.
 * @param target Element that needs to be resized.
 * @param sourceRect Dimensions of the source element.
 */
function matchElementSize(target, sourceRect) {
    target.style.width = `${sourceRect.width}px`;
    target.style.height = `${sourceRect.height}px`;
    target.style.transform = getTransform(sourceRect.left, sourceRect.top);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9kcmFnLXJlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxPQUFPLEVBQUMsK0JBQStCLEVBQUUsY0FBYyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDdEYsT0FBTyxFQUFDLHFCQUFxQixFQUFFLGFBQWEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzNFLE9BQU8sRUFBQyxZQUFZLEVBQUUsT0FBTyxFQUFhLE1BQU0sTUFBTSxDQUFDO0FBR3ZELE9BQU8sRUFBQyxZQUFZLEVBQUUsNEJBQTRCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1RixPQUFPLEVBQUMsa0NBQWtDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQXVCM0MsaUVBQWlFO0FBQ2pFLE1BQU0sMkJBQTJCLEdBQUcsK0JBQStCLENBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztBQUVyRixpRUFBaUU7QUFDakUsTUFBTSwwQkFBMEIsR0FBRywrQkFBK0IsQ0FBQyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBRXJGOzs7OztHQUtHO0FBQ0gsTUFBTSx1QkFBdUIsR0FBRyxHQUFHLENBQUM7QUE4QnBDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLE9BQU87SUFvT2xCLFlBQ0UsT0FBOEMsRUFDdEMsT0FBc0IsRUFDdEIsU0FBbUIsRUFDbkIsT0FBZSxFQUNmLGNBQTZCLEVBQzdCLGlCQUF5RDtRQUp6RCxZQUFPLEdB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QUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssSUFBSSxDQUFDO0lBQzdDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLE1BQU0sSUFBSSxDQUFDO0lBQy9DLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0VtYmVkZGVkVmlld1JlZiwgRWxlbWVudFJlZiwgTmdab25lLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Vmlld3BvcnRSdWxlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7bm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucywgX2dldFNoYWRvd1Jvb3R9IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VFbGVtZW50fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbiwgU3ViamVjdCwgT2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7RHJvcExpc3RSZWZJbnRlcm5hbCBhcyBEcm9wTGlzdFJlZn0gZnJvbSAnLi9kcm9wLWxpc3QtcmVmJztcclxuaW1wb3J0IHtEcmFnRHJvcFJlZ2lzdHJ5fSBmcm9tICcuL2RyYWctZHJvcC1yZWdpc3RyeSc7XHJcbmltcG9ydCB7ZXh0ZW5kU3R5bGVzLCB0b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zLCB0b2dnbGVWaXNpYmlsaXR5fSBmcm9tICcuL2RyYWctc3R5bGluZyc7XHJcbmltcG9ydCB7Z2V0VHJhbnNmb3JtVHJhbnNpdGlvbkR1cmF0aW9uSW5Nc30gZnJvbSAnLi90cmFuc2l0aW9uLWR1cmF0aW9uJztcclxuaW1wb3J0IHtnZXRNdXRhYmxlQ2xpZW50UmVjdCwgYWRqdXN0Q2xpZW50UmVjdH0gZnJvbSAnLi9jbGllbnQtcmVjdCc7XHJcbmltcG9ydCB7UGFyZW50UG9zaXRpb25UcmFja2VyfSBmcm9tICcuL3BhcmVudC1wb3NpdGlvbi10cmFja2VyJztcclxuaW1wb3J0IHtkZWVwQ2xvbmVOb2RlfSBmcm9tICcuL2Nsb25lLW5vZGUnO1xyXG5cclxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgYmVoYXZpb3Igb2YgRHJhZ1JlZi4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmVmQ29uZmlnIHtcclxuICAvKipcclxuICAgKiBNaW5pbXVtIGFtb3VudCBvZiBwaXhlbHMgdGhhdCB0aGUgdXNlciBzaG91bGRcclxuICAgKiBkcmFnLCBiZWZvcmUgdGhlIENESyBpbml0aWF0ZXMgYSBkcmFnIHNlcXVlbmNlLlxyXG4gICAqL1xyXG4gIGRyYWdTdGFydFRocmVzaG9sZDogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBBbW91bnQgdGhlIHBpeGVscyB0aGUgdXNlciBzaG91bGQgZHJhZyBiZWZvcmUgdGhlIENES1xyXG4gICAqIGNvbnNpZGVycyB0aGVtIHRvIGhhdmUgY2hhbmdlZCB0aGUgZHJhZyBkaXJlY3Rpb24uXHJcbiAgICovXHJcbiAgcG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZDogbnVtYmVyO1xyXG5cclxuICAvKiogYHotaW5kZXhgIGZvciB0aGUgYWJzb2x1dGVseS1wb3NpdGlvbmVkIGVsZW1lbnRzIHRoYXQgYXJlIGNyZWF0ZWQgYnkgdGhlIGRyYWcgaXRlbS4gKi9cclxuICB6SW5kZXg/OiBudW1iZXI7XHJcblxyXG4gIC8qKiBSZWYgdGhhdCB0aGUgY3VycmVudCBkcmFnIGl0ZW0gaXMgbmVzdGVkIGluLiAqL1xyXG4gIHBhcmVudERyYWdSZWY/OiBEcmFnUmVmO1xyXG59XHJcblxyXG4vKiogT3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYSBwYXNzaXZlIGV2ZW50IGxpc3RlbmVyLiAqL1xyXG5jb25zdCBwYXNzaXZlRXZlbnRMaXN0ZW5lck9wdGlvbnMgPSBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zKHtwYXNzaXZlOiB0cnVlfSk7XHJcblxyXG4vKiogT3B0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvIGJpbmQgYW4gYWN0aXZlIGV2ZW50IGxpc3RlbmVyLiAqL1xyXG5jb25zdCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyA9IG5vcm1hbGl6ZVBhc3NpdmVMaXN0ZW5lck9wdGlvbnMoe3Bhc3NpdmU6IGZhbHNlfSk7XHJcblxyXG4vKipcclxuICogVGltZSBpbiBtaWxsaXNlY29uZHMgZm9yIHdoaWNoIHRvIGlnbm9yZSBtb3VzZSBldmVudHMsIGFmdGVyXHJcbiAqIHJlY2VpdmluZyBhIHRvdWNoIGV2ZW50LiBVc2VkIHRvIGF2b2lkIGRvaW5nIGRvdWJsZSB3b3JrIGZvclxyXG4gKiB0b3VjaCBkZXZpY2VzIHdoZXJlIHRoZSBicm93c2VyIGZpcmVzIGZha2UgbW91c2UgZXZlbnRzLCBpblxyXG4gKiBhZGRpdGlvbiB0byB0b3VjaCBldmVudHMuXHJcbiAqL1xyXG5jb25zdCBNT1VTRV9FVkVOVF9JR05PUkVfVElNRSA9IDgwMDtcclxuXHJcbi8vIFRPRE8oY3Jpc2JldG8pOiBhZGQgYW4gQVBJIGZvciBtb3ZpbmcgYSBkcmFnZ2FibGUgdXAvZG93biB0aGVcclxuLy8gbGlzdCBwcm9ncmFtbWF0aWNhbGx5LiBVc2VmdWwgZm9yIGtleWJvYXJkIGNvbnRyb2xzLlxyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIGNvbXBpbGUtdGltZS1vbmx5IHJlcHJlc2VudGF0aW9uIG9mIGEgYERyYWdSZWZgLlxyXG4gKiBVc2VkIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydCBpc3N1ZXMgYmV0d2VlbiB0aGUgYERyYWdSZWZgIGFuZCB0aGUgYERyb3BMaXN0UmVmYC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBEcmFnUmVmSW50ZXJuYWwgZXh0ZW5kcyBEcmFnUmVmIHt9XHJcblxyXG4vKiogVGVtcGxhdGUgdGhhdCBjYW4gYmUgdXNlZCB0byBjcmVhdGUgYSBkcmFnIGhlbHBlciBlbGVtZW50IChlLmcuIGEgcHJldmlldyBvciBhIHBsYWNlaG9sZGVyKS4gKi9cclxuaW50ZXJmYWNlIERyYWdIZWxwZXJUZW1wbGF0ZTxUID0gYW55PiB7XHJcbiAgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPFQ+IHwgbnVsbDtcclxuICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xyXG4gIGNvbnRleHQ6IFQ7XHJcbn1cclxuXHJcbi8qKiBUZW1wbGF0ZSB0aGF0IGNhbiBiZSB1c2VkIHRvIGNyZWF0ZSBhIGRyYWcgcHJldmlldyBlbGVtZW50LiAqL1xyXG5pbnRlcmZhY2UgRHJhZ1ByZXZpZXdUZW1wbGF0ZTxUID0gYW55PiBleHRlbmRzIERyYWdIZWxwZXJUZW1wbGF0ZTxUPiB7XHJcbiAgbWF0Y2hTaXplPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqIFBvaW50IG9uIHRoZSBwYWdlIG9yIHdpdGhpbiBhbiBlbGVtZW50LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFBvaW50IHtcclxuICB4OiBudW1iZXI7XHJcbiAgeTogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogUmVmZXJlbmNlIHRvIGEgZHJhZ2dhYmxlIGl0ZW0uIFVzZWQgdG8gbWFuaXB1bGF0ZSBvciBkaXNwb3NlIG9mIHRoZSBpdGVtLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERyYWdSZWY8VCA9IGFueT4ge1xyXG4gIC8qKiBFbGVtZW50IGRpc3BsYXllZCBuZXh0IHRvIHRoZSB1c2VyJ3MgcG9pbnRlciB3aGlsZSB0aGUgZWxlbWVudCBpcyBkcmFnZ2VkLiAqL1xyXG4gIHByaXZhdGUgX3ByZXZpZXc6IEhUTUxFbGVtZW50O1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSB2aWV3IG9mIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXHJcbiAgcHJpdmF0ZSBfcHJldmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPGFueT4gfCBudWxsO1xyXG5cclxuICAvKiogUmVmZXJlbmNlIHRvIHRoZSB2aWV3IG9mIHRoZSBwbGFjZWhvbGRlciBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyUmVmOiBFbWJlZGRlZFZpZXdSZWY8YW55PiB8IG51bGw7XHJcblxyXG4gIC8qKiBFbGVtZW50IHRoYXQgaXMgcmVuZGVyZWQgaW5zdGVhZCBvZiB0aGUgZHJhZ2dhYmxlIGl0ZW0gd2hpbGUgaXQgaXMgYmVpbmcgc29ydGVkLiAqL1xyXG4gIHByaXZhdGUgX3BsYWNlaG9sZGVyOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgLyoqIENvb3JkaW5hdGVzIHdpdGhpbiB0aGUgZWxlbWVudCBhdCB3aGljaCB0aGUgdXNlciBwaWNrZWQgdXAgdGhlIGVsZW1lbnQuICovXHJcbiAgcHJpdmF0ZSBfcGlja3VwUG9zaXRpb25JbkVsZW1lbnQ6IFBvaW50O1xyXG5cclxuICAvKiogQ29vcmRpbmF0ZXMgb24gdGhlIHBhZ2UgYXQgd2hpY2ggdGhlIHVzZXIgcGlja2VkIHVwIHRoZSBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX3BpY2t1cFBvc2l0aW9uT25QYWdlOiBQb2ludDtcclxuXHJcbiAgLyoqXHJcbiAgICogQW5jaG9yIG5vZGUgdXNlZCB0byBzYXZlIHRoZSBwbGFjZSBpbiB0aGUgRE9NIHdoZXJlIHRoZSBlbGVtZW50IHdhc1xyXG4gICAqIHBpY2tlZCB1cCBzbyB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCBhdCB0aGUgZW5kIG9mIHRoZSBkcmFnIHNlcXVlbmNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2FuY2hvcjogQ29tbWVudDtcclxuXHJcbiAgLyoqXHJcbiAgICogQ1NTIGB0cmFuc2Zvcm1gIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgd2hlbiBpdCBpc24ndCBiZWluZyBkcmFnZ2VkLiBXZSBuZWVkIGFcclxuICAgKiBwYXNzaXZlIHRyYW5zZm9ybSBpbiBvcmRlciBmb3IgdGhlIGRyYWdnZWQgZWxlbWVudCB0byByZXRhaW4gaXRzIG5ldyBwb3NpdGlvblxyXG4gICAqIGFmdGVyIHRoZSB1c2VyIGhhcyBzdG9wcGVkIGRyYWdnaW5nIGFuZCBiZWNhdXNlIHdlIG5lZWQgdG8ga25vdyB0aGUgcmVsYXRpdmVcclxuICAgKiBwb3NpdGlvbiBpbiBjYXNlIHRoZXkgc3RhcnQgZHJhZ2dpbmcgYWdhaW4uIFRoaXMgY29ycmVzcG9uZHMgdG8gYGVsZW1lbnQuc3R5bGUudHJhbnNmb3JtYC5cclxuICAgKi9cclxuICBwcml2YXRlIF9wYXNzaXZlVHJhbnNmb3JtOiBQb2ludCA9IHt4OiAwLCB5OiAwfTtcclxuXHJcbiAgLyoqIENTUyBgdHJhbnNmb3JtYCB0aGF0IGlzIGFwcGxpZWQgdG8gdGhlIGVsZW1lbnQgd2hpbGUgaXQncyBiZWluZyBkcmFnZ2VkLiAqL1xyXG4gIHByaXZhdGUgX2FjdGl2ZVRyYW5zZm9ybTogUG9pbnQgPSB7eDogMCwgeTogMH07XHJcblxyXG4gIC8qKiBJbmxpbmUgYHRyYW5zZm9ybWAgdmFsdWUgdGhhdCB0aGUgZWxlbWVudCBoYWQgYmVmb3JlIHRoZSBmaXJzdCBkcmFnZ2luZyBzZXF1ZW5jZS4gKi9cclxuICBwcml2YXRlIF9pbml0aWFsVHJhbnNmb3JtPzogc3RyaW5nO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZSBoYXMgYmVlbiBzdGFydGVkLiBEb2Vzbid0XHJcbiAgICogbmVjZXNzYXJpbHkgbWVhbiB0aGF0IHRoZSBlbGVtZW50IGhhcyBiZWVuIG1vdmVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2hhc1N0YXJ0ZWREcmFnZ2luZzogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGVsZW1lbnQgaGFzIG1vdmVkIHNpbmNlIHRoZSB1c2VyIHN0YXJ0ZWQgZHJhZ2dpbmcgaXQuICovXHJcbiAgcHJpdmF0ZSBfaGFzTW92ZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8qKiBEcm9wIGNvbnRhaW5lciBpbiB3aGljaCB0aGUgRHJhZ1JlZiByZXNpZGVkIHdoZW4gZHJhZ2dpbmcgYmVnYW4uICovXHJcbiAgcHJpdmF0ZSBfaW5pdGlhbENvbnRhaW5lcjogRHJvcExpc3RSZWY7XHJcblxyXG4gIC8qKiBJbmRleCBhdCB3aGljaCB0aGUgaXRlbSBzdGFydGVkIGluIGl0cyBpbml0aWFsIGNvbnRhaW5lci4gKi9cclxuICBwcml2YXRlIF9pbml0aWFsSW5kZXg6IG51bWJlcjtcclxuXHJcbiAgLyoqIENhY2hlZCBwb3NpdGlvbnMgb2Ygc2Nyb2xsYWJsZSBwYXJlbnQgZWxlbWVudHMuICovXHJcbiAgcHJpdmF0ZSBfcGFyZW50UG9zaXRpb25zOiBQYXJlbnRQb3NpdGlvblRyYWNrZXI7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBpdGVtIGlzIGJlaW5nIG1vdmVkLiAqL1xyXG4gIHByaXZhdGUgX21vdmVFdmVudHMgPSBuZXcgU3ViamVjdDx7XHJcbiAgICBzb3VyY2U6IERyYWdSZWY7XHJcbiAgICBwb2ludGVyUG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn07XHJcbiAgICBldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQ7XHJcbiAgICBkaXN0YW5jZTogUG9pbnQ7XHJcbiAgICBkZWx0YToge3g6IC0xIHwgMCB8IDEsIHk6IC0xIHwgMCB8IDF9O1xyXG4gIH0+KCk7XHJcblxyXG4gIC8qKiBLZWVwcyB0cmFjayBvZiB0aGUgZGlyZWN0aW9uIGluIHdoaWNoIHRoZSB1c2VyIGlzIGRyYWdnaW5nIGFsb25nIGVhY2ggYXhpcy4gKi9cclxuICBwcml2YXRlIF9wb2ludGVyRGlyZWN0aW9uRGVsdGE6IHt4OiAtMSB8IDAgfCAxLCB5OiAtMSB8IDAgfCAxfTtcclxuXHJcbiAgLyoqIFBvaW50ZXIgcG9zaXRpb24gYXQgd2hpY2ggdGhlIGxhc3QgY2hhbmdlIGluIHRoZSBkZWx0YSBvY2N1cnJlZC4gKi9cclxuICBwcml2YXRlIF9wb2ludGVyUG9zaXRpb25BdExhc3REaXJlY3Rpb25DaGFuZ2U6IFBvaW50O1xyXG5cclxuICAvKiogUG9zaXRpb24gb2YgdGhlIHBvaW50ZXIgYXQgdGhlIGxhc3QgcG9pbnRlciBldmVudC4gKi9cclxuICBwcml2YXRlIF9sYXN0S25vd25Qb2ludGVyUG9zaXRpb246IFBvaW50O1xyXG5cclxuICAvKipcclxuICAgKiBSb290IERPTSBub2RlIG9mIHRoZSBkcmFnIGluc3RhbmNlLiBUaGlzIGlzIHRoZSBlbGVtZW50IHRoYXQgd2lsbFxyXG4gICAqIGJlIG1vdmVkIGFyb3VuZCBhcyB0aGUgdXNlciBpcyBkcmFnZ2luZy5cclxuICAgKi9cclxuICBwcml2YXRlIF9yb290RWxlbWVudDogSFRNTEVsZW1lbnQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIElubGluZSBzdHlsZSB2YWx1ZSBvZiBgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yYCBhdCB0aGUgdGltZSB0aGVcclxuICAgKiBkcmFnZ2luZyB3YXMgc3RhcnRlZC4gVXNlZCB0byByZXN0b3JlIHRoZSB2YWx1ZSBvbmNlIHdlJ3JlIGRvbmUgZHJhZ2dpbmcuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfcm9vdEVsZW1lbnRUYXBIaWdobGlnaHQ6IHN0cmluZztcclxuXHJcbiAgLyoqIFN1YnNjcmlwdGlvbiB0byBwb2ludGVyIG1vdmVtZW50IGV2ZW50cy4gKi9cclxuICBwcml2YXRlIF9wb2ludGVyTW92ZVN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuXHJcbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgZXZlbnQgdGhhdCBpcyBkaXNwYXRjaGVkIHdoZW4gdGhlIHVzZXIgbGlmdHMgdGhlaXIgcG9pbnRlci4gKi9cclxuICBwcml2YXRlIF9wb2ludGVyVXBTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcblxyXG4gIC8qKiBTdWJzY3JpcHRpb24gdG8gdGhlIHZpZXdwb3J0IGJlaW5nIHNjcm9sbGVkLiAqL1xyXG4gIHByaXZhdGUgX3Njcm9sbFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuXHJcbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0aGUgdmlld3BvcnQgYmVpbmcgcmVzaXplZC4gKi9cclxuICBwcml2YXRlIF9yZXNpemVTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIGxhc3QgdG91Y2ggZXZlbnQgb2NjdXJyZWQuIFVzZWQgdG8gYXZvaWQgZmlyaW5nIHRoZSBzYW1lXHJcbiAgICogZXZlbnRzIG11bHRpcGxlIHRpbWVzIG9uIHRvdWNoIGRldmljZXMgd2hlcmUgdGhlIGJyb3dzZXIgd2lsbCBmaXJlIGEgZmFrZVxyXG4gICAqIG1vdXNlIGV2ZW50IGZvciBlYWNoIHRvdWNoIGV2ZW50LCBhZnRlciBhIGNlcnRhaW4gdGltZS5cclxuICAgKi9cclxuICBwcml2YXRlIF9sYXN0VG91Y2hFdmVudFRpbWU6IG51bWJlcjtcclxuXHJcbiAgLyoqIFRpbWUgYXQgd2hpY2ggdGhlIGxhc3QgZHJhZ2dpbmcgc2VxdWVuY2Ugd2FzIHN0YXJ0ZWQuICovXHJcbiAgcHJpdmF0ZSBfZHJhZ1N0YXJ0VGltZTogbnVtYmVyO1xyXG5cclxuICAvKiogQ2FjaGVkIHJlZmVyZW5jZSB0byB0aGUgYm91bmRhcnkgZWxlbWVudC4gKi9cclxuICBwcml2YXRlIF9ib3VuZGFyeUVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBuYXRpdmUgZHJhZ2dpbmcgaW50ZXJhY3Rpb25zIGhhdmUgYmVlbiBlbmFibGVkIG9uIHRoZSByb290IGVsZW1lbnQuICovXHJcbiAgcHJpdmF0ZSBfbmF0aXZlSW50ZXJhY3Rpb25zRW5hYmxlZCA9IHRydWU7XHJcblxyXG4gIC8qKiBDYWNoZWQgZGltZW5zaW9ucyBvZiB0aGUgcHJldmlldyBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX3ByZXZpZXdSZWN0PzogQ2xpZW50UmVjdDtcclxuXHJcbiAgLyoqIENhY2hlZCBkaW1lbnNpb25zIG9mIHRoZSBib3VuZGFyeSBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX2JvdW5kYXJ5UmVjdD86IENsaWVudFJlY3Q7XHJcblxyXG4gIC8qKiBFbGVtZW50IHRoYXQgd2lsbCBiZSB1c2VkIGFzIGEgdGVtcGxhdGUgdG8gY3JlYXRlIHRoZSBkcmFnZ2FibGUgaXRlbSdzIHByZXZpZXcuICovXHJcbiAgcHJpdmF0ZSBfcHJldmlld1RlbXBsYXRlPzogRHJhZ1ByZXZpZXdUZW1wbGF0ZSB8IG51bGw7XHJcblxyXG4gIC8qKiBUZW1wbGF0ZSBmb3IgcGxhY2Vob2xkZXIgZWxlbWVudCByZW5kZXJlZCB0byBzaG93IHdoZXJlIGEgZHJhZ2dhYmxlIHdvdWxkIGJlIGRyb3BwZWQuICovXHJcbiAgcHJpdmF0ZSBfcGxhY2Vob2xkZXJUZW1wbGF0ZT86IERyYWdIZWxwZXJUZW1wbGF0ZSB8IG51bGw7XHJcblxyXG4gIC8qKiBFbGVtZW50cyB0aGF0IGNhbiBiZSB1c2VkIHRvIGRyYWcgdGhlIGRyYWdnYWJsZSBpdGVtLiAqL1xyXG4gIHByaXZhdGUgX2hhbmRsZXM6IEhUTUxFbGVtZW50W10gPSBbXTtcclxuXHJcbiAgLyoqIFJlZ2lzdGVyZWQgaGFuZGxlcyB0aGF0IGFyZSBjdXJyZW50bHkgZGlzYWJsZWQuICovXHJcbiAgcHJpdmF0ZSBfZGlzYWJsZWRIYW5kbGVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcclxuXHJcbiAgLyoqIERyb3BwYWJsZSBjb250YWluZXIgdGhhdCB0aGUgZHJhZ2dhYmxlIGlzIGEgcGFydCBvZi4gKi9cclxuICBwcml2YXRlIF9kcm9wQ29udGFpbmVyPzogRHJvcExpc3RSZWY7XHJcblxyXG4gIC8qKiBMYXlvdXQgZGlyZWN0aW9uIG9mIHRoZSBpdGVtLiAqL1xyXG4gIHByaXZhdGUgX2RpcmVjdGlvbjogRGlyZWN0aW9uID0gJ2x0cic7XHJcblxyXG4gIC8qKiBSZWYgdGhhdCB0aGUgY3VycmVudCBkcmFnIGl0ZW0gaXMgbmVzdGVkIGluLiAqL1xyXG4gIHByaXZhdGUgX3BhcmVudERyYWdSZWY6IERyYWdSZWY8dW5rbm93bj4gfCBudWxsO1xyXG5cclxuICAvKipcclxuICAgKiBDYWNoZWQgc2hhZG93IHJvb3QgdGhhdCB0aGUgZWxlbWVudCBpcyBwbGFjZWQgaW4uIGBudWxsYCBtZWFucyB0aGF0IHRoZSBlbGVtZW50IGlzbid0IGluXHJcbiAgICogdGhlIHNoYWRvdyBET00gYW5kIGB1bmRlZmluZWRgIG1lYW5zIHRoYXQgaXQgaGFzbid0IGJlZW4gcmVzb2x2ZWQgeWV0LiBTaG91bGQgYmUgcmVhZCB2aWFcclxuICAgKiBgX2dldFNoYWRvd1Jvb3RgLCBub3QgZGlyZWN0bHkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY2FjaGVkU2hhZG93Um9vdDogU2hhZG93Um9vdCB8IG51bGwgfCB1bmRlZmluZWQ7XHJcblxyXG4gIC8qKiBBeGlzIGFsb25nIHdoaWNoIGRyYWdnaW5nIGlzIGxvY2tlZC4gKi9cclxuICBsb2NrQXhpczogJ3gnIHwgJ3knO1xyXG5cclxuICAvKipcclxuICAgKiBBbW91bnQgb2YgbWlsbGlzZWNvbmRzIHRvIHdhaXQgYWZ0ZXIgdGhlIHVzZXIgaGFzIHB1dCB0aGVpclxyXG4gICAqIHBvaW50ZXIgZG93biBiZWZvcmUgc3RhcnRpbmcgdG8gZHJhZyB0aGUgZWxlbWVudC5cclxuICAgKi9cclxuICBkcmFnU3RhcnREZWxheTogbnVtYmVyIHwge3RvdWNoOiBudW1iZXIsIG1vdXNlOiBudW1iZXJ9ID0gMDtcclxuXHJcbiAgLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQuICovXHJcbiAgcHJldmlld0NsYXNzOiBzdHJpbmd8c3RyaW5nW118dW5kZWZpbmVkO1xyXG5cclxuICAvKiogV2hldGhlciBzdGFydGluZyB0byBkcmFnIHRoaXMgZWxlbWVudCBpcyBkaXNhYmxlZC4gKi9cclxuICBnZXQgZGlzYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWQgfHwgISEodGhpcy5fZHJvcENvbnRhaW5lciAmJiB0aGlzLl9kcm9wQ29udGFpbmVyLmRpc2FibGVkKTtcclxuICB9XHJcbiAgc2V0IGRpc2FibGVkKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICBjb25zdCBuZXdWYWx1ZSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcblxyXG4gICAgaWYgKG5ld1ZhbHVlICE9PSB0aGlzLl9kaXNhYmxlZCkge1xyXG4gICAgICB0aGlzLl9kaXNhYmxlZCA9IG5ld1ZhbHVlO1xyXG4gICAgICB0aGlzLl90b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKCk7XHJcbiAgICAgIHRoaXMuX2hhbmRsZXMuZm9yRWFjaChoYW5kbGUgPT4gdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIG5ld1ZhbHVlKSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgX2Rpc2FibGVkID0gZmFsc2U7XHJcblxyXG4gIC8qKiBFbWl0cyBhcyB0aGUgZHJhZyBzZXF1ZW5jZSBpcyBiZWluZyBwcmVwYXJlZC4gKi9cclxuICBiZWZvcmVTdGFydGVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgc3RhcnRzIGRyYWdnaW5nIHRoZSBpdGVtLiAqL1xyXG4gIHN0YXJ0ZWQgPSBuZXcgU3ViamVjdDx7c291cmNlOiBEcmFnUmVmfT4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaGFzIHJlbGVhc2VkIGEgZHJhZyBpdGVtLCBiZWZvcmUgYW55IGFuaW1hdGlvbnMgaGF2ZSBzdGFydGVkLiAqL1xyXG4gIHJlbGVhc2VkID0gbmV3IFN1YmplY3Q8e3NvdXJjZTogRHJhZ1JlZn0+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHN0b3BzIGRyYWdnaW5nIGFuIGl0ZW0gaW4gdGhlIGNvbnRhaW5lci4gKi9cclxuICBlbmRlZCA9IG5ldyBTdWJqZWN0PHtzb3VyY2U6IERyYWdSZWYsIGRpc3RhbmNlOiBQb2ludH0+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIGhhcyBtb3ZlZCB0aGUgaXRlbSBpbnRvIGEgbmV3IGNvbnRhaW5lci4gKi9cclxuICBlbnRlcmVkID0gbmV3IFN1YmplY3Q8e2NvbnRhaW5lcjogRHJvcExpc3RSZWYsIGl0ZW06IERyYWdSZWYsIGN1cnJlbnRJbmRleDogbnVtYmVyfT4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgcmVtb3ZlcyB0aGUgaXRlbSBpdHMgY29udGFpbmVyIGJ5IGRyYWdnaW5nIGl0IGludG8gYW5vdGhlciBjb250YWluZXIuICovXHJcbiAgZXhpdGVkID0gbmV3IFN1YmplY3Q8e2NvbnRhaW5lcjogRHJvcExpc3RSZWYsIGl0ZW06IERyYWdSZWZ9PigpO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBkcm9wcyB0aGUgaXRlbSBpbnNpZGUgYSBjb250YWluZXIuICovXHJcbiAgZHJvcHBlZCA9IG5ldyBTdWJqZWN0PHtcclxuICAgIHByZXZpb3VzSW5kZXg6IG51bWJlcjtcclxuICAgIGN1cnJlbnRJbmRleDogbnVtYmVyO1xyXG4gICAgaXRlbTogRHJhZ1JlZjtcclxuICAgIGNvbnRhaW5lcjogRHJvcExpc3RSZWY7XHJcbiAgICBwcmV2aW91c0NvbnRhaW5lcjogRHJvcExpc3RSZWY7XHJcbiAgICBkaXN0YW5jZTogUG9pbnQ7XHJcbiAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyOiBib29sZWFuO1xyXG4gIH0+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIGFzIHRoZSB1c2VyIGlzIGRyYWdnaW5nIHRoZSBpdGVtLiBVc2Ugd2l0aCBjYXV0aW9uLFxyXG4gICAqIGJlY2F1c2UgdGhpcyBldmVudCB3aWxsIGZpcmUgZm9yIGV2ZXJ5IHBpeGVsIHRoYXQgdGhlIHVzZXIgaGFzIGRyYWdnZWQuXHJcbiAgICovXHJcbiAgbW92ZWQ6IE9ic2VydmFibGU8e1xyXG4gICAgc291cmNlOiBEcmFnUmVmO1xyXG4gICAgcG9pbnRlclBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9O1xyXG4gICAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50O1xyXG4gICAgZGlzdGFuY2U6IFBvaW50O1xyXG4gICAgZGVsdGE6IHt4OiAtMSB8IDAgfCAxLCB5OiAtMSB8IDAgfCAxfTtcclxuICB9PiA9IHRoaXMuX21vdmVFdmVudHM7XHJcblxyXG4gIC8qKiBBcmJpdHJhcnkgZGF0YSB0aGF0IGNhbiBiZSBhdHRhY2hlZCB0byB0aGUgZHJhZyBpdGVtLiAqL1xyXG4gIGRhdGE6IFQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gY3VzdG9taXplIHRoZSBsb2dpYyBvZiBob3cgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnIGl0ZW1cclxuICAgKiBpcyBsaW1pdGVkIHdoaWxlIGl0J3MgYmVpbmcgZHJhZ2dlZC4gR2V0cyBjYWxsZWQgd2l0aCBhIHBvaW50IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgcG9zaXRpb25cclxuICAgKiBvZiB0aGUgdXNlcidzIHBvaW50ZXIgb24gdGhlIHBhZ2UgYW5kIHNob3VsZCByZXR1cm4gYSBwb2ludCBkZXNjcmliaW5nIHdoZXJlIHRoZSBpdGVtIHNob3VsZFxyXG4gICAqIGJlIHJlbmRlcmVkLlxyXG4gICAqL1xyXG4gIGNvbnN0cmFpblBvc2l0aW9uPzogKHBvaW50OiBQb2ludCwgZHJhZ1JlZjogRHJhZ1JlZikgPT4gUG9pbnQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgZWxlbWVudDogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4gfCBIVE1MRWxlbWVudCxcclxuICAgIHByaXZhdGUgX2NvbmZpZzogRHJhZ1JlZkNvbmZpZyxcclxuICAgIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudCxcclxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcclxuICAgIHByaXZhdGUgX2RyYWdEcm9wUmVnaXN0cnk6IERyYWdEcm9wUmVnaXN0cnk8RHJhZ1JlZiwgRHJvcExpc3RSZWY+KSB7XHJcblxyXG4gICAgdGhpcy53aXRoUm9vdEVsZW1lbnQoZWxlbWVudCkud2l0aFBhcmVudChfY29uZmlnLnBhcmVudERyYWdSZWYgfHwgbnVsbCk7XHJcbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMgPSBuZXcgUGFyZW50UG9zaXRpb25UcmFja2VyKF9kb2N1bWVudCwgX3ZpZXdwb3J0UnVsZXIpO1xyXG4gICAgX2RyYWdEcm9wUmVnaXN0cnkucmVnaXN0ZXJEcmFnSXRlbSh0aGlzKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyB1c2VkIGFzIGEgcGxhY2Vob2xkZXJcclxuICAgKiB3aGlsZSB0aGUgY3VycmVudCBlbGVtZW50IGlzIGJlaW5nIGRyYWdnZWQuXHJcbiAgICovXHJcbiAgZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgIHJldHVybiB0aGlzLl9wbGFjZWhvbGRlcjtcclxuICB9XHJcblxyXG4gIC8qKiBSZXR1cm5zIHRoZSByb290IGRyYWdnYWJsZSBlbGVtZW50LiAqL1xyXG4gIGdldFJvb3RFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgIHJldHVybiB0aGlzLl9yb290RWxlbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGN1cnJlbnRseS12aXNpYmxlIGVsZW1lbnQgdGhhdCByZXByZXNlbnRzIHRoZSBkcmFnIGl0ZW0uXHJcbiAgICogV2hpbGUgZHJhZ2dpbmcgdGhpcyBpcyB0aGUgcGxhY2Vob2xkZXIsIG90aGVyd2lzZSBpdCdzIHRoZSByb290IGVsZW1lbnQuXHJcbiAgICovXHJcbiAgZ2V0VmlzaWJsZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNEcmFnZ2luZygpID8gdGhpcy5nZXRQbGFjZWhvbGRlckVsZW1lbnQoKSA6IHRoaXMuZ2V0Um9vdEVsZW1lbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBSZWdpc3RlcnMgdGhlIGhhbmRsZXMgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmFnIHRoZSBlbGVtZW50LiAqL1xyXG4gIHdpdGhIYW5kbGVzKGhhbmRsZXM6IChIVE1MRWxlbWVudCB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+KVtdKTogdGhpcyB7XHJcbiAgICB0aGlzLl9oYW5kbGVzID0gaGFuZGxlcy5tYXAoaGFuZGxlID0+IGNvZXJjZUVsZW1lbnQoaGFuZGxlKSk7XHJcbiAgICB0aGlzLl9oYW5kbGVzLmZvckVhY2goaGFuZGxlID0+IHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoaGFuZGxlLCB0aGlzLmRpc2FibGVkKSk7XHJcbiAgICB0aGlzLl90b2dnbGVOYXRpdmVEcmFnSW50ZXJhY3Rpb25zKCk7XHJcblxyXG4gICAgLy8gRGVsZXRlIGFueSBsaW5nZXJpbmcgZGlzYWJsZWQgaGFuZGxlcyB0aGF0IG1heSBoYXZlIGJlZW4gZGVzdHJveWVkLiBOb3RlIHRoYXQgd2UgcmUtY3JlYXRlXHJcbiAgICAvLyB0aGUgc2V0LCByYXRoZXIgdGhhbiBpdGVyYXRlIG92ZXIgaXQgYW5kIGZpbHRlciBvdXQgdGhlIGRlc3Ryb3llZCBoYW5kbGVzLCBiZWNhdXNlIHdoaWxlXHJcbiAgICAvLyB0aGUgRVMgc3BlYyBhbGxvd3MgZm9yIHNldHMgdG8gYmUgbW9kaWZpZWQgd2hpbGUgdGhleSdyZSBiZWluZyBpdGVyYXRlZCBvdmVyLCBzb21lIHBvbHlmaWxsc1xyXG4gICAgLy8gdXNlIGFuIGFycmF5IGludGVybmFsbHkgd2hpY2ggbWF5IHRocm93IGFuIGVycm9yLlxyXG4gICAgY29uc3QgZGlzYWJsZWRIYW5kbGVzID0gbmV3IFNldDxIVE1MRWxlbWVudD4oKTtcclxuICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5mb3JFYWNoKGhhbmRsZSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLl9oYW5kbGVzLmluZGV4T2YoaGFuZGxlKSA+IC0xKSB7XHJcbiAgICAgICAgZGlzYWJsZWRIYW5kbGVzLmFkZChoYW5kbGUpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcyA9IGRpc2FibGVkSGFuZGxlcztcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIHRoZSB0ZW1wbGF0ZSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgZHJhZyBwcmV2aWV3LlxyXG4gICAqIEBwYXJhbSB0ZW1wbGF0ZSBUZW1wbGF0ZSB0aGF0IGZyb20gd2hpY2ggdG8gc3RhbXAgb3V0IHRoZSBwcmV2aWV3LlxyXG4gICAqL1xyXG4gIHdpdGhQcmV2aWV3VGVtcGxhdGUodGVtcGxhdGU6IERyYWdQcmV2aWV3VGVtcGxhdGUgfCBudWxsKTogdGhpcyB7XHJcbiAgICB0aGlzLl9wcmV2aWV3VGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVnaXN0ZXJzIHRoZSB0ZW1wbGF0ZSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgZHJhZyBwbGFjZWhvbGRlci5cclxuICAgKiBAcGFyYW0gdGVtcGxhdGUgVGVtcGxhdGUgdGhhdCBmcm9tIHdoaWNoIHRvIHN0YW1wIG91dCB0aGUgcGxhY2Vob2xkZXIuXHJcbiAgICovXHJcbiAgd2l0aFBsYWNlaG9sZGVyVGVtcGxhdGUodGVtcGxhdGU6IERyYWdIZWxwZXJUZW1wbGF0ZSB8IG51bGwpOiB0aGlzIHtcclxuICAgIHRoaXMuX3BsYWNlaG9sZGVyVGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBhbiBhbHRlcm5hdGUgZHJhZyByb290IGVsZW1lbnQuIFRoZSByb290IGVsZW1lbnQgaXMgdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGJlIG1vdmVkIGFzXHJcbiAgICogdGhlIHVzZXIgaXMgZHJhZ2dpbmcuIFBhc3NpbmcgYW4gYWx0ZXJuYXRlIHJvb3QgZWxlbWVudCBpcyB1c2VmdWwgd2hlbiB0cnlpbmcgdG8gZW5hYmxlXHJcbiAgICogZHJhZ2dpbmcgb24gYW4gZWxlbWVudCB0aGF0IHlvdSBtaWdodCBub3QgaGF2ZSBhY2Nlc3MgdG8uXHJcbiAgICovXHJcbiAgd2l0aFJvb3RFbGVtZW50KHJvb3RFbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50KTogdGhpcyB7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChyb290RWxlbWVudCk7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQgIT09IHRoaXMuX3Jvb3RFbGVtZW50KSB7XHJcbiAgICAgIGlmICh0aGlzLl9yb290RWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuX3JlbW92ZVJvb3RFbGVtZW50TGlzdGVuZXJzKHRoaXMuX3Jvb3RFbGVtZW50KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fcG9pbnRlckRvd24sIHBhc3NpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl9pbml0aWFsVHJhbnNmb3JtID0gdW5kZWZpbmVkO1xyXG4gICAgICB0aGlzLl9yb290RWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbGVtZW50IHRvIHdoaWNoIHRoZSBkcmFnZ2FibGUncyBwb3NpdGlvbiB3aWxsIGJlIGNvbnN0cmFpbmVkLlxyXG4gICAqL1xyXG4gIHdpdGhCb3VuZGFyeUVsZW1lbnQoYm91bmRhcnlFbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiB8IEhUTUxFbGVtZW50IHwgbnVsbCk6IHRoaXMge1xyXG4gICAgdGhpcy5fYm91bmRhcnlFbGVtZW50ID0gYm91bmRhcnlFbGVtZW50ID8gY29lcmNlRWxlbWVudChib3VuZGFyeUVsZW1lbnQpIDogbnVsbDtcclxuICAgIHRoaXMuX3Jlc2l6ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgaWYgKGJvdW5kYXJ5RWxlbWVudCkge1xyXG4gICAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24gPSB0aGlzLl92aWV3cG9ydFJ1bGVyXHJcbiAgICAgICAgLmNoYW5nZSgxMClcclxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2NvbnRhaW5JbnNpZGVCb3VuZGFyeU9uUmVzaXplKCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgcGFyZW50IHJlZiB0aGF0IHRoZSByZWYgaXMgbmVzdGVkIGluLiAgKi9cclxuICB3aXRoUGFyZW50KHBhcmVudDogRHJhZ1JlZjx1bmtub3duPiB8IG51bGwpOiB0aGlzIHtcclxuICAgIHRoaXMuX3BhcmVudERyYWdSZWYgPSBwYXJlbnQ7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKiBSZW1vdmVzIHRoZSBkcmFnZ2luZyBmdW5jdGlvbmFsaXR5IGZyb20gdGhlIERPTSBlbGVtZW50LiAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLl9yZW1vdmVSb290RWxlbWVudExpc3RlbmVycyh0aGlzLl9yb290RWxlbWVudCk7XHJcblxyXG4gICAgLy8gRG8gdGhpcyBjaGVjayBiZWZvcmUgcmVtb3ZpbmcgZnJvbSB0aGUgcmVnaXN0cnkgc2luY2UgaXQnbGxcclxuICAgIC8vIHN0b3AgYmVpbmcgY29uc2lkZXJlZCBhcyBkcmFnZ2VkIG9uY2UgaXQgaXMgcmVtb3ZlZC5cclxuICAgIGlmICh0aGlzLmlzRHJhZ2dpbmcoKSkge1xyXG4gICAgICAvLyBTaW5jZSB3ZSBtb3ZlIG91dCB0aGUgZWxlbWVudCB0byB0aGUgZW5kIG9mIHRoZSBib2R5IHdoaWxlIGl0J3MgYmVpbmdcclxuICAgICAgLy8gZHJhZ2dlZCwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCBpdCdzIHJlbW92ZWQgaWYgaXQgZ2V0cyBkZXN0cm95ZWQuXHJcbiAgICAgIHJlbW92ZU5vZGUodGhpcy5fcm9vdEVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZU5vZGUodGhpcy5fYW5jaG9yKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3lQcmV2aWV3KCk7XHJcbiAgICB0aGlzLl9kZXN0cm95UGxhY2Vob2xkZXIoKTtcclxuICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkucmVtb3ZlRHJhZ0l0ZW0odGhpcyk7XHJcbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb25zKCk7XHJcbiAgICB0aGlzLmJlZm9yZVN0YXJ0ZWQuY29tcGxldGUoKTtcclxuICAgIHRoaXMuc3RhcnRlZC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5yZWxlYXNlZC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5lbmRlZC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5lbnRlcmVkLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLmV4aXRlZC5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5kcm9wcGVkLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9tb3ZlRXZlbnRzLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9oYW5kbGVzID0gW107XHJcbiAgICB0aGlzLl9kaXNhYmxlZEhhbmRsZXMuY2xlYXIoKTtcclxuICAgIHRoaXMuX2Ryb3BDb250YWluZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLl9yZXNpemVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5jbGVhcigpO1xyXG4gICAgdGhpcy5fYm91bmRhcnlFbGVtZW50ID0gdGhpcy5fcm9vdEVsZW1lbnQgPSB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlID1cclxuICAgICAgICB0aGlzLl9wcmV2aWV3VGVtcGxhdGUgPSB0aGlzLl9hbmNob3IgPSB0aGlzLl9wYXJlbnREcmFnUmVmID0gbnVsbCE7XHJcbiAgfVxyXG5cclxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuICovXHJcbiAgaXNEcmFnZ2luZygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9oYXNTdGFydGVkRHJhZ2dpbmcgJiYgdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlc2V0cyBhIHN0YW5kYWxvbmUgZHJhZyBpdGVtIHRvIGl0cyBpbml0aWFsIHBvc2l0aW9uLiAqL1xyXG4gIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5fcm9vdEVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5faW5pdGlhbFRyYW5zZm9ybSB8fCAnJztcclxuICAgIHRoaXMuX2FjdGl2ZVRyYW5zZm9ybSA9IHt4OiAwLCB5OiAwfTtcclxuICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0gPSB7eDogMCwgeTogMH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGEgaGFuZGxlIGFzIGRpc2FibGVkLiBXaGlsZSBhIGhhbmRsZSBpcyBkaXNhYmxlZCwgaXQnbGwgY2FwdHVyZSBhbmQgaW50ZXJydXB0IGRyYWdnaW5nLlxyXG4gICAqIEBwYXJhbSBoYW5kbGUgSGFuZGxlIGVsZW1lbnQgdGhhdCBzaG91bGQgYmUgZGlzYWJsZWQuXHJcbiAgICovXHJcbiAgZGlzYWJsZUhhbmRsZShoYW5kbGU6IEhUTUxFbGVtZW50KSB7XHJcbiAgICBpZiAoIXRoaXMuX2Rpc2FibGVkSGFuZGxlcy5oYXMoaGFuZGxlKSAmJiB0aGlzLl9oYW5kbGVzLmluZGV4T2YoaGFuZGxlKSA+IC0xKSB7XHJcbiAgICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5hZGQoaGFuZGxlKTtcclxuICAgICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5hYmxlcyBhIGhhbmRsZSwgaWYgaXQgaGFzIGJlZW4gZGlzYWJsZWQuXHJcbiAgICogQHBhcmFtIGhhbmRsZSBIYW5kbGUgZWxlbWVudCB0byBiZSBlbmFibGVkLlxyXG4gICAqL1xyXG4gIGVuYWJsZUhhbmRsZShoYW5kbGU6IEhUTUxFbGVtZW50KSB7XHJcbiAgICBpZiAodGhpcy5fZGlzYWJsZWRIYW5kbGVzLmhhcyhoYW5kbGUpKSB7XHJcbiAgICAgIHRoaXMuX2Rpc2FibGVkSGFuZGxlcy5kZWxldGUoaGFuZGxlKTtcclxuICAgICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyhoYW5kbGUsIHRoaXMuZGlzYWJsZWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIGxheW91dCBkaXJlY3Rpb24gb2YgdGhlIGRyYWdnYWJsZSBpdGVtLiAqL1xyXG4gIHdpdGhEaXJlY3Rpb24oZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiB0aGlzIHtcclxuICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIGNvbnRhaW5lciB0aGF0IHRoZSBpdGVtIGlzIHBhcnQgb2YuICovXHJcbiAgX3dpdGhEcm9wQ29udGFpbmVyKGNvbnRhaW5lcjogRHJvcExpc3RSZWYpIHtcclxuICAgIHRoaXMuX2Ryb3BDb250YWluZXIgPSBjb250YWluZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHBpeGVscyB0aGUgZHJhZ2dhYmxlIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cclxuICAgKi9cclxuICBnZXRGcmVlRHJhZ1Bvc2l0aW9uKCk6IFJlYWRvbmx5PFBvaW50PiB7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuaXNEcmFnZ2luZygpID8gdGhpcy5fYWN0aXZlVHJhbnNmb3JtIDogdGhpcy5fcGFzc2l2ZVRyYW5zZm9ybTtcclxuICAgIHJldHVybiB7eDogcG9zaXRpb24ueCwgeTogcG9zaXRpb24ueX07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjdXJyZW50IHBvc2l0aW9uIGluIHBpeGVscyB0aGUgZHJhZ2dhYmxlIG91dHNpZGUgb2YgYSBkcm9wIGNvbnRhaW5lci5cclxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHBvc2l0aW9uIHRvIGJlIHNldC5cclxuICAgKi9cclxuICBzZXRGcmVlRHJhZ1Bvc2l0aW9uKHZhbHVlOiBQb2ludCk6IHRoaXMge1xyXG4gICAgdGhpcy5fYWN0aXZlVHJhbnNmb3JtID0ge3g6IDAsIHk6IDB9O1xyXG4gICAgdGhpcy5fcGFzc2l2ZVRyYW5zZm9ybS54ID0gdmFsdWUueDtcclxuICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueSA9IHZhbHVlLnk7XHJcblxyXG4gICAgaWYgKCF0aGlzLl9kcm9wQ29udGFpbmVyKSB7XHJcbiAgICAgIHRoaXMuX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm0odmFsdWUueCwgdmFsdWUueSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlcyB0aGUgaXRlbSdzIHNvcnQgb3JkZXIgYmFzZWQgb24gdGhlIGxhc3Qta25vd24gcG9pbnRlciBwb3NpdGlvbi4gKi9cclxuICBfc29ydEZyb21MYXN0UG9pbnRlclBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLl9sYXN0S25vd25Qb2ludGVyUG9zaXRpb247XHJcblxyXG4gICAgaWYgKHBvc2l0aW9uICYmIHRoaXMuX2Ryb3BDb250YWluZXIpIHtcclxuICAgICAgdGhpcy5fdXBkYXRlQWN0aXZlRHJvcENvbnRhaW5lcih0aGlzLl9nZXRDb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbihwb3NpdGlvbiksIHBvc2l0aW9uKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBVbnN1YnNjcmliZXMgZnJvbSB0aGUgZ2xvYmFsIHN1YnNjcmlwdGlvbnMuICovXHJcbiAgcHJpdmF0ZSBfcmVtb3ZlU3Vic2NyaXB0aW9ucygpIHtcclxuICAgIHRoaXMuX3BvaW50ZXJNb3ZlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB0aGlzLl9wb2ludGVyVXBTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIERlc3Ryb3lzIHRoZSBwcmV2aWV3IGVsZW1lbnQgYW5kIGl0cyBWaWV3UmVmLiAqL1xyXG4gIHByaXZhdGUgX2Rlc3Ryb3lQcmV2aWV3KCkge1xyXG4gICAgaWYgKHRoaXMuX3ByZXZpZXcpIHtcclxuICAgICAgcmVtb3ZlTm9kZSh0aGlzLl9wcmV2aWV3KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fcHJldmlld1JlZikge1xyXG4gICAgICB0aGlzLl9wcmV2aWV3UmVmLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wcmV2aWV3ID0gdGhpcy5fcHJldmlld1JlZiA9IG51bGwhO1xyXG4gIH1cclxuXHJcbiAgLyoqIERlc3Ryb3lzIHRoZSBwbGFjZWhvbGRlciBlbGVtZW50IGFuZCBpdHMgVmlld1JlZi4gKi9cclxuICBwcml2YXRlIF9kZXN0cm95UGxhY2Vob2xkZXIoKSB7XHJcbiAgICBpZiAodGhpcy5fcGxhY2Vob2xkZXIpIHtcclxuICAgICAgcmVtb3ZlTm9kZSh0aGlzLl9wbGFjZWhvbGRlcik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3BsYWNlaG9sZGVyUmVmKSB7XHJcbiAgICAgIHRoaXMuX3BsYWNlaG9sZGVyUmVmLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wbGFjZWhvbGRlciA9IHRoaXMuX3BsYWNlaG9sZGVyUmVmID0gbnVsbCE7XHJcbiAgfVxyXG5cclxuICAvKiogSGFuZGxlciBmb3IgdGhlIGBtb3VzZWRvd25gL2B0b3VjaHN0YXJ0YCBldmVudHMuICovXHJcbiAgcHJpdmF0ZSBfcG9pbnRlckRvd24gPSAoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICB0aGlzLmJlZm9yZVN0YXJ0ZWQubmV4dCgpO1xyXG5cclxuICAgIC8vIERlbGVnYXRlIHRoZSBldmVudCBiYXNlZCBvbiB3aGV0aGVyIGl0IHN0YXJ0ZWQgZnJvbSBhIGhhbmRsZSBvciB0aGUgZWxlbWVudCBpdHNlbGYuXHJcbiAgICBpZiAodGhpcy5faGFuZGxlcy5sZW5ndGgpIHtcclxuICAgICAgY29uc3QgdGFyZ2V0SGFuZGxlID0gdGhpcy5faGFuZGxlcy5maW5kKGhhbmRsZSA9PiB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xyXG4gICAgICAgIHJldHVybiAhIXRhcmdldCAmJiAodGFyZ2V0ID09PSBoYW5kbGUgfHwgaGFuZGxlLmNvbnRhaW5zKHRhcmdldCBhcyBIVE1MRWxlbWVudCkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0YXJnZXRIYW5kbGUgJiYgIXRoaXMuX2Rpc2FibGVkSGFuZGxlcy5oYXModGFyZ2V0SGFuZGxlKSAmJiAhdGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVEcmFnU2VxdWVuY2UodGFyZ2V0SGFuZGxlLCBldmVudCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoIXRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgdGhpcy5faW5pdGlhbGl6ZURyYWdTZXF1ZW5jZSh0aGlzLl9yb290RWxlbWVudCwgZXZlbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXIgdGhhdCBpcyBpbnZva2VkIHdoZW4gdGhlIHVzZXIgbW92ZXMgdGhlaXIgcG9pbnRlciBhZnRlciB0aGV5J3ZlIGluaXRpYXRlZCBhIGRyYWcuICovXHJcbiAgcHJpdmF0ZSBfcG9pbnRlck1vdmUgPSAoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSA9PiB7XHJcbiAgICBjb25zdCBwb2ludGVyUG9zaXRpb24gPSB0aGlzLl9nZXRQb2ludGVyUG9zaXRpb25PblBhZ2UoZXZlbnQpO1xyXG5cclxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nKSB7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlWCA9IE1hdGguYWJzKHBvaW50ZXJQb3NpdGlvbi54IC0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCk7XHJcbiAgICAgIGNvbnN0IGRpc3RhbmNlWSA9IE1hdGguYWJzKHBvaW50ZXJQb3NpdGlvbi55IC0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueSk7XHJcbiAgICAgIGNvbnN0IGlzT3ZlclRocmVzaG9sZCA9IGRpc3RhbmNlWCArIGRpc3RhbmNlWSA+PSB0aGlzLl9jb25maWcuZHJhZ1N0YXJ0VGhyZXNob2xkO1xyXG5cclxuICAgICAgLy8gT25seSBzdGFydCBkcmFnZ2luZyBhZnRlciB0aGUgdXNlciBoYXMgbW92ZWQgbW9yZSB0aGFuIHRoZSBtaW5pbXVtIGRpc3RhbmNlIGluIGVpdGhlclxyXG4gICAgICAvLyBkaXJlY3Rpb24uIE5vdGUgdGhhdCB0aGlzIGlzIHByZWZlcnJhYmxlIG92ZXIgZG9pbmcgc29tZXRoaW5nIGxpa2UgYHNraXAobWluaW11bURpc3RhbmNlKWBcclxuICAgICAgLy8gaW4gdGhlIGBwb2ludGVyTW92ZWAgc3Vic2NyaXB0aW9uLCBiZWNhdXNlIHdlJ3JlIG5vdCBndWFyYW50ZWVkIHRvIGhhdmUgb25lIG1vdmUgZXZlbnRcclxuICAgICAgLy8gcGVyIHBpeGVsIG9mIG1vdmVtZW50IChlLmcuIGlmIHRoZSB1c2VyIG1vdmVzIHRoZWlyIHBvaW50ZXIgcXVpY2tseSkuXHJcbiAgICAgIGlmIChpc092ZXJUaHJlc2hvbGQpIHtcclxuICAgICAgICBjb25zdCBpc0RlbGF5RWxhcHNlZCA9IERhdGUubm93KCkgPj0gdGhpcy5fZHJhZ1N0YXJ0VGltZSArIHRoaXMuX2dldERyYWdTdGFydERlbGF5KGV2ZW50KTtcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLl9kcm9wQ29udGFpbmVyO1xyXG5cclxuICAgICAgICBpZiAoIWlzRGVsYXlFbGFwc2VkKSB7XHJcbiAgICAgICAgICB0aGlzLl9lbmREcmFnU2VxdWVuY2UoZXZlbnQpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHJldmVudCBvdGhlciBkcmFnIHNlcXVlbmNlcyBmcm9tIHN0YXJ0aW5nIHdoaWxlIHNvbWV0aGluZyBpbiB0aGUgY29udGFpbmVyIGlzIHN0aWxsXHJcbiAgICAgICAgLy8gYmVpbmcgZHJhZ2dlZC4gVGhpcyBjYW4gaGFwcGVuIHdoaWxlIHdlJ3JlIHdhaXRpbmcgZm9yIHRoZSBkcm9wIGFuaW1hdGlvbiB0byBmaW5pc2hcclxuICAgICAgICAvLyBhbmQgY2FuIGNhdXNlIGVycm9ycywgYmVjYXVzZSBzb21lIGVsZW1lbnRzIG1pZ2h0IHN0aWxsIGJlIG1vdmluZyBhcm91bmQuXHJcbiAgICAgICAgaWYgKCFjb250YWluZXIgfHwgKCFjb250YWluZXIuaXNEcmFnZ2luZygpICYmICFjb250YWluZXIuaXNSZWNlaXZpbmcoKSkpIHtcclxuICAgICAgICAgIC8vIFByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uIGFzIHNvb24gYXMgdGhlIGRyYWdnaW5nIHNlcXVlbmNlIGlzIGNvbnNpZGVyZWQgYXNcclxuICAgICAgICAgIC8vIFwic3RhcnRlZFwiIHNpbmNlIHdhaXRpbmcgZm9yIHRoZSBuZXh0IGV2ZW50IGNhbiBhbGxvdyB0aGUgZGV2aWNlIHRvIGJlZ2luIHNjcm9sbGluZy5cclxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICB0aGlzLl9oYXNTdGFydGVkRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB0aGlzLl9zdGFydERyYWdTZXF1ZW5jZShldmVudCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdlIG9ubHkgbmVlZCB0aGUgcHJldmlldyBkaW1lbnNpb25zIGlmIHdlIGhhdmUgYSBib3VuZGFyeSBlbGVtZW50LlxyXG4gICAgaWYgKHRoaXMuX2JvdW5kYXJ5RWxlbWVudCkge1xyXG4gICAgICAvLyBDYWNoZSB0aGUgcHJldmlldyBlbGVtZW50IHJlY3QgaWYgd2UgaGF2ZW4ndCBjYWNoZWQgaXQgYWxyZWFkeSBvciBpZlxyXG4gICAgICAvLyB3ZSBjYWNoZWQgaXQgdG9vIGVhcmx5IGJlZm9yZSB0aGUgZWxlbWVudCBkaW1lbnNpb25zIHdlcmUgY29tcHV0ZWQuXHJcbiAgICAgIGlmICghdGhpcy5fcHJldmlld1JlY3QgfHwgKCF0aGlzLl9wcmV2aWV3UmVjdC53aWR0aCAmJiAhdGhpcy5fcHJldmlld1JlY3QuaGVpZ2h0KSkge1xyXG4gICAgICAgIHRoaXMuX3ByZXZpZXdSZWN0ID0gKHRoaXMuX3ByZXZpZXcgfHwgdGhpcy5fcm9vdEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgcHJldmVudCB0aGUgZGVmYXVsdCBhY3Rpb24gZG93biBoZXJlIHNvIHRoYXQgd2Uga25vdyB0aGF0IGRyYWdnaW5nIGhhcyBzdGFydGVkLiBUaGlzIGlzXHJcbiAgICAvLyBpbXBvcnRhbnQgZm9yIHRvdWNoIGRldmljZXMgd2hlcmUgZG9pbmcgdGhpcyB0b28gZWFybHkgY2FuIHVubmVjZXNzYXJpbHkgYmxvY2sgc2Nyb2xsaW5nLFxyXG4gICAgLy8gaWYgdGhlcmUncyBhIGRyYWdnaW5nIGRlbGF5LlxyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICBjb25zdCBjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbiA9IHRoaXMuX2dldENvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uKHBvaW50ZXJQb3NpdGlvbik7XHJcbiAgICB0aGlzLl9oYXNNb3ZlZCA9IHRydWU7XHJcbiAgICB0aGlzLl9sYXN0S25vd25Qb2ludGVyUG9zaXRpb24gPSBwb2ludGVyUG9zaXRpb247XHJcbiAgICB0aGlzLl91cGRhdGVQb2ludGVyRGlyZWN0aW9uRGVsdGEoY29uc3RyYWluZWRQb2ludGVyUG9zaXRpb24pO1xyXG5cclxuICAgIGxldCB0cmFuc2Zvcm1SYXRpb1ggPSAxLjA7XHJcbiAgICAgIGxldCB0cmFuc2Zvcm1SYXRpb1kgPSAxLjA7XHJcblxyXG4gICAgICBpZiAodHlwZW9mIFNWR0VsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmIHRoaXMuX3Jvb3RFbGVtZW50IGluc3RhbmNlb2YgU1ZHRWxlbWVudCkge1xyXG4gICAgICAgIGNvbnN0IHN2Z0VsZW1lbnQgPSB0aGlzLl9yb290RWxlbWVudC5vd25lclNWR0VsZW1lbnQ7XHJcbiAgICAgICAgY29uc3Qgc3ZnVmlld0JveFJlY3QgPSBzdmdFbGVtZW50Py52aWV3Qm94LmJhc2VWYWw7XHJcblxyXG4gICAgICAgIGlmIChzdmdFbGVtZW50Py5jbGllbnRXaWR0aCAhPT0gMCAmJiBzdmdFbGVtZW50Py5jbGllbnRIZWlnaHQgIT09IDApIHtcclxuICAgICAgICAgIGNvbnN0IHByZXNlcnZlQXNwZWN0UmF0aW8gPSBzdmdFbGVtZW50IS5wcmVzZXJ2ZUFzcGVjdFJhdGlvO1xyXG4gICAgICAgICAgY29uc3QgYXNwZWN0UmF0aW8gPSBzdmdWaWV3Qm94UmVjdCEud2lkdGggLyBzdmdWaWV3Qm94UmVjdCEuaGVpZ2h0O1xyXG4gICAgICAgICAgbGV0IHdpZHRoUmF0aW8gPSBzdmdWaWV3Qm94UmVjdCEud2lkdGggLyBzdmdFbGVtZW50IS5jbGllbnRXaWR0aDtcclxuICAgICAgICAgIGxldCBoZWlnaHRSYXRpbyA9IHN2Z1ZpZXdCb3hSZWN0IS5oZWlnaHQgLyBzdmdFbGVtZW50IS5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgICBpZiAocHJlc2VydmVBc3BlY3RSYXRpby5iYXNlVmFsLmFsaWduICE9PSBwcmVzZXJ2ZUFzcGVjdFJhdGlvLmJhc2VWYWwuU1ZHX1BSRVNFUlZFQVNQRUNUUkFUSU9fTk9ORSkge1xyXG4gICAgICAgICAgICBpZiAocHJlc2VydmVBc3BlY3RSYXRpby5iYXNlVmFsLm1lZXRPclNsaWNlID09IHByZXNlcnZlQXNwZWN0UmF0aW8uYmFzZVZhbC5TVkdfTUVFVE9SU0xJQ0VfTUVFVCkge1xyXG4gICAgICAgICAgICAgIC8vIG1lZXQgKHNjYWxlLWRvd24pXHJcbiAgICAgICAgICAgICAgaWYgKHdpZHRoUmF0aW8gPiBoZWlnaHRSYXRpbykge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmF0aW9YID0gd2lkdGhSYXRpbztcclxuICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHN2Z0VsZW1lbnQhLmNsaWVudFdpZHRoIC8gYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SYXRpb1kgPSBzdmdWaWV3Qm94UmVjdCEuaGVpZ2h0IC8gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChoZWlnaHRSYXRpbyA+IHdpZHRoUmF0aW8pIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJhdGlvWSA9IGhlaWdodFJhdGlvO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGggPSBzdmdFbGVtZW50IS5jbGllbnRIZWlnaHQgKiBhc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJhdGlvWCA9IHN2Z1ZpZXdCb3hSZWN0IS53aWR0aCAvIHdpZHRoO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBzbGljZSAoc2NhbGUtdXApXHJcbiAgICAgICAgICAgICAgaWYgKHdpZHRoUmF0aW8gPiBoZWlnaHRSYXRpbykge1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SYXRpb1kgPSBoZWlnaHRSYXRpbztcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gc3ZnRWxlbWVudCEuY2xpZW50SGVpZ2h0ICogYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SYXRpb1ggPSBzdmdWaWV3Qm94UmVjdCEud2lkdGggLyB3aWR0aDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGVpZ2h0UmF0aW8gPiB3aWR0aFJhdGlvKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SYXRpb1ggPSB3aWR0aFJhdGlvO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gc3ZnRWxlbWVudCEuY2xpZW50V2lkdGggLyBhc3BlY3RSYXRpbztcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJhdGlvWSA9IHN2Z1ZpZXdCb3hSZWN0IS5oZWlnaHQgLyBoZWlnaHQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc3ZnVmlld0JveFJlY3Q/LndpZHRoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtUmF0aW9YID0gd2lkdGhSYXRpbztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChzdmdWaWV3Qm94UmVjdD8uaGVpZ2h0ICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgdHJhbnNmb3JtUmF0aW9ZID0gaGVpZ2h0UmF0aW87XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGNvbnN0IGFjdGl2ZVRyYW5zZm9ybSA9IHRoaXMuX2FjdGl2ZVRyYW5zZm9ybTtcclxuICAgICAgYWN0aXZlVHJhbnNmb3JtLnggPVxyXG4gICAgICAgICAgKGNvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uLnggLSB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS54KSAqIHRyYW5zZm9ybVJhdGlvWCArIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueDtcclxuICAgICAgYWN0aXZlVHJhbnNmb3JtLnkgPVxyXG4gICAgICAgICAgKGNvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uLnkgLSB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS55KSAqIHRyYW5zZm9ybVJhdGlvWSArIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueTtcclxuICAgICAgXHJcbiAgICAgIHRoaXMuX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm0oYWN0aXZlVHJhbnNmb3JtLngsIGFjdGl2ZVRyYW5zZm9ybS55KTtcclxuXHJcblxyXG4gICAgLy8gU2luY2UgdGhpcyBldmVudCBnZXRzIGZpcmVkIGZvciBldmVyeSBwaXhlbCB3aGlsZSBkcmFnZ2luZywgd2Ugb25seVxyXG4gICAgLy8gd2FudCB0byBmaXJlIGl0IGlmIHRoZSBjb25zdW1lciBvcHRlZCBpbnRvIGl0LiBBbHNvIHdlIGhhdmUgdG9cclxuICAgIC8vIHJlLWVudGVyIHRoZSB6b25lIGJlY2F1c2Ugd2UgcnVuIGFsbCBvZiB0aGUgZXZlbnRzIG9uIHRoZSBvdXRzaWRlLlxyXG4gICAgaWYgKHRoaXMuX21vdmVFdmVudHMub2JzZXJ2ZXJzLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcclxuICAgICAgICB0aGlzLl9tb3ZlRXZlbnRzLm5leHQoe1xyXG4gICAgICAgICAgc291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgcG9pbnRlclBvc2l0aW9uOiBjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbixcclxuICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgZGlzdGFuY2U6IHRoaXMuX2dldERyYWdEaXN0YW5jZShjb25zdHJhaW5lZFBvaW50ZXJQb3NpdGlvbiksXHJcbiAgICAgICAgICBkZWx0YTogdGhpcy5fcG9pbnRlckRpcmVjdGlvbkRlbHRhXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXIgdGhhdCBpcyBpbnZva2VkIHdoZW4gdGhlIHVzZXIgbGlmdHMgdGhlaXIgcG9pbnRlciB1cCwgYWZ0ZXIgaW5pdGlhdGluZyBhIGRyYWcuICovXHJcbiAgcHJpdmF0ZSBfcG9pbnRlclVwID0gKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCkgPT4ge1xyXG4gICAgdGhpcy5fZW5kRHJhZ1NlcXVlbmNlKGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyBzdWJzY3JpcHRpb25zIGFuZCBzdG9wcyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UuXHJcbiAgICogQHBhcmFtIGV2ZW50IEJyb3dzZXIgZXZlbnQgb2JqZWN0IHRoYXQgZW5kZWQgdGhlIHNlcXVlbmNlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2VuZERyYWdTZXF1ZW5jZShldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgIC8vIE5vdGUgdGhhdCBoZXJlIHdlIHVzZSBgaXNEcmFnZ2luZ2AgZnJvbSB0aGUgc2VydmljZSwgcmF0aGVyIHRoYW4gZnJvbSBgdGhpc2AuXHJcbiAgICAvLyBUaGUgZGlmZmVyZW5jZSBpcyB0aGF0IHRoZSBvbmUgZnJvbSB0aGUgc2VydmljZSByZWZsZWN0cyB3aGV0aGVyIGEgZHJhZ2dpbmcgc2VxdWVuY2VcclxuICAgIC8vIGhhcyBiZWVuIGluaXRpYXRlZCwgd2hlcmVhcyB0aGUgb25lIG9uIGB0aGlzYCBpbmNsdWRlcyB3aGV0aGVyIHRoZSB1c2VyIGhhcyBwYXNzZWRcclxuICAgIC8vIHRoZSBtaW5pbXVtIGRyYWdnaW5nIHRocmVzaG9sZC5cclxuICAgIGlmICghdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5pc0RyYWdnaW5nKHRoaXMpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb25zKCk7XHJcbiAgICB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnN0b3BEcmFnZ2luZyh0aGlzKTtcclxuICAgIHRoaXMuX3RvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoKTtcclxuXHJcbiAgICBpZiAodGhpcy5faGFuZGxlcykge1xyXG4gICAgICB0aGlzLl9yb290RWxlbWVudC5zdHlsZS53ZWJraXRUYXBIaWdobGlnaHRDb2xvciA9IHRoaXMuX3Jvb3RFbGVtZW50VGFwSGlnaGxpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5faGFzU3RhcnRlZERyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlbGVhc2VkLm5leHQoe3NvdXJjZTogdGhpc30pO1xyXG5cclxuICAgIGlmICh0aGlzLl9kcm9wQ29udGFpbmVyKSB7XHJcbiAgICAgIC8vIFN0b3Agc2Nyb2xsaW5nIGltbWVkaWF0ZWx5LCBpbnN0ZWFkIG9mIHdhaXRpbmcgZm9yIHRoZSBhbmltYXRpb24gdG8gZmluaXNoLlxyXG4gICAgICB0aGlzLl9kcm9wQ29udGFpbmVyLl9zdG9wU2Nyb2xsaW5nKCk7XHJcbiAgICAgIHRoaXMuX2FuaW1hdGVQcmV2aWV3VG9QbGFjZWhvbGRlcigpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX2NsZWFudXBEcmFnQXJ0aWZhY3RzKGV2ZW50KTtcclxuICAgICAgICB0aGlzLl9jbGVhbnVwQ2FjaGVkRGltZW5zaW9ucygpO1xyXG4gICAgICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuc3RvcERyYWdnaW5nKHRoaXMpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIENvbnZlcnQgdGhlIGFjdGl2ZSB0cmFuc2Zvcm0gaW50byBhIHBhc3NpdmUgb25lLiBUaGlzIG1lYW5zIHRoYXQgbmV4dCB0aW1lXHJcbiAgICAgIC8vIHRoZSB1c2VyIHN0YXJ0cyBkcmFnZ2luZyB0aGUgaXRlbSwgaXRzIHBvc2l0aW9uIHdpbGwgYmUgY2FsY3VsYXRlZCByZWxhdGl2ZWx5XHJcbiAgICAgIC8vIHRvIHRoZSBuZXcgcGFzc2l2ZSB0cmFuc2Zvcm0uXHJcbiAgICAgIHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueCA9IHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS54O1xyXG4gICAgICB0aGlzLl9wYXNzaXZlVHJhbnNmb3JtLnkgPSB0aGlzLl9hY3RpdmVUcmFuc2Zvcm0ueTtcclxuICAgICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5lbmRlZC5uZXh0KHtcclxuICAgICAgICAgIHNvdXJjZTogdGhpcyxcclxuICAgICAgICAgIGRpc3RhbmNlOiB0aGlzLl9nZXREcmFnRGlzdGFuY2UodGhpcy5fZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50KSlcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX2NsZWFudXBDYWNoZWREaW1lbnNpb25zKCk7XHJcbiAgICAgIHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuc3RvcERyYWdnaW5nKHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFN0YXJ0cyB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UuICovXHJcbiAgcHJpdmF0ZSBfc3RhcnREcmFnU2VxdWVuY2UoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XHJcbiAgICBpZiAoaXNUb3VjaEV2ZW50KGV2ZW50KSkge1xyXG4gICAgICB0aGlzLl9sYXN0VG91Y2hFdmVudFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3RvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoKTtcclxuXHJcbiAgICBjb25zdCBkcm9wQ29udGFpbmVyID0gdGhpcy5fZHJvcENvbnRhaW5lcjtcclxuXHJcbiAgICBpZiAoZHJvcENvbnRhaW5lcikge1xyXG4gICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5fcm9vdEVsZW1lbnQ7XHJcbiAgICAgIGNvbnN0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZSE7XHJcbiAgICAgIGNvbnN0IHByZXZpZXcgPSB0aGlzLl9wcmV2aWV3ID0gdGhpcy5fY3JlYXRlUHJldmlld0VsZW1lbnQoKTtcclxuICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLl9wbGFjZWhvbGRlciA9IHRoaXMuX2NyZWF0ZVBsYWNlaG9sZGVyRWxlbWVudCgpO1xyXG4gICAgICBjb25zdCBhbmNob3IgPSB0aGlzLl9hbmNob3IgPSB0aGlzLl9hbmNob3IgfHwgdGhpcy5fZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnJyk7XHJcblxyXG4gICAgICAvLyBOZWVkcyB0byBoYXBwZW4gYmVmb3JlIHRoZSByb290IGVsZW1lbnQgaXMgbW92ZWQuXHJcbiAgICAgIGNvbnN0IHNoYWRvd1Jvb3QgPSB0aGlzLl9nZXRTaGFkb3dSb290KCk7XHJcblxyXG4gICAgICAvLyBJbnNlcnQgYW4gYW5jaG9yIG5vZGUgc28gdGhhdCB3ZSBjYW4gcmVzdG9yZSB0aGUgZWxlbWVudCdzIHBvc2l0aW9uIGluIHRoZSBET00uXHJcbiAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUoYW5jaG9yLCBlbGVtZW50KTtcclxuXHJcbiAgICAgIC8vIFdlIG1vdmUgdGhlIGVsZW1lbnQgb3V0IGF0IHRoZSBlbmQgb2YgdGhlIGJvZHkgYW5kIHdlIG1ha2UgaXQgaGlkZGVuLCBiZWNhdXNlIGtlZXBpbmcgaXQgaW5cclxuICAgICAgLy8gcGxhY2Ugd2lsbCB0aHJvdyBvZmYgdGhlIGNvbnN1bWVyJ3MgYDpsYXN0LWNoaWxkYCBzZWxlY3RvcnMuIFdlIGNhbid0IHJlbW92ZSB0aGUgZWxlbWVudFxyXG4gICAgICAvLyBmcm9tIHRoZSBET00gY29tcGxldGVseSwgYmVjYXVzZSBpT1Mgd2lsbCBzdG9wIGZpcmluZyBhbGwgc3Vic2VxdWVudCBldmVudHMgaW4gdGhlIGNoYWluLlxyXG4gICAgICB0b2dnbGVWaXNpYmlsaXR5KGVsZW1lbnQsIGZhbHNlKTtcclxuICAgICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChwYXJlbnQucmVwbGFjZUNoaWxkKHBsYWNlaG9sZGVyLCBlbGVtZW50KSk7XHJcbiAgICAgIGdldFByZXZpZXdJbnNlcnRpb25Qb2ludCh0aGlzLl9kb2N1bWVudCwgc2hhZG93Um9vdCkuYXBwZW5kQ2hpbGQocHJldmlldyk7XHJcbiAgICAgIHRoaXMuc3RhcnRlZC5uZXh0KHtzb3VyY2U6IHRoaXN9KTsgLy8gRW1pdCBiZWZvcmUgbm90aWZ5aW5nIHRoZSBjb250YWluZXIuXHJcbiAgICAgIGRyb3BDb250YWluZXIuc3RhcnQoKTtcclxuICAgICAgdGhpcy5faW5pdGlhbENvbnRhaW5lciA9IGRyb3BDb250YWluZXI7XHJcbiAgICAgIHRoaXMuX2luaXRpYWxJbmRleCA9IGRyb3BDb250YWluZXIuZ2V0SXRlbUluZGV4KHRoaXMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zdGFydGVkLm5leHQoe3NvdXJjZTogdGhpc30pO1xyXG4gICAgICB0aGlzLl9pbml0aWFsQ29udGFpbmVyID0gdGhpcy5faW5pdGlhbEluZGV4ID0gdW5kZWZpbmVkITtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbXBvcnRhbnQgdG8gcnVuIGFmdGVyIHdlJ3ZlIGNhbGxlZCBgc3RhcnRgIG9uIHRoZSBwYXJlbnQgY29udGFpbmVyXHJcbiAgICAvLyBzbyB0aGF0IGl0IGhhcyBoYWQgdGltZSB0byByZXNvbHZlIGl0cyBzY3JvbGxhYmxlIHBhcmVudHMuXHJcbiAgICB0aGlzLl9wYXJlbnRQb3NpdGlvbnMuY2FjaGUoZHJvcENvbnRhaW5lciA/IGRyb3BDb250YWluZXIuZ2V0U2Nyb2xsYWJsZVBhcmVudHMoKSA6IFtdKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdXAgdGhlIGRpZmZlcmVudCB2YXJpYWJsZXMgYW5kIHN1YnNjcmlwdGlvbnNcclxuICAgKiB0aGF0IHdpbGwgYmUgbmVjZXNzYXJ5IGZvciB0aGUgZHJhZ2dpbmcgc2VxdWVuY2UuXHJcbiAgICogQHBhcmFtIHJlZmVyZW5jZUVsZW1lbnQgRWxlbWVudCB0aGF0IHN0YXJ0ZWQgdGhlIGRyYWcgc2VxdWVuY2UuXHJcbiAgICogQHBhcmFtIGV2ZW50IEJyb3dzZXIgZXZlbnQgb2JqZWN0IHRoYXQgc3RhcnRlZCB0aGUgc2VxdWVuY2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfaW5pdGlhbGl6ZURyYWdTZXF1ZW5jZShyZWZlcmVuY2VFbGVtZW50OiBIVE1MRWxlbWVudCwgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XHJcbiAgICAvLyBTdG9wIHByb3BhZ2F0aW9uIGlmIHRoZSBpdGVtIGlzIGluc2lkZSBhbm90aGVyXHJcbiAgICAvLyBkcmFnZ2FibGUgc28gd2UgZG9uJ3Qgc3RhcnQgbXVsdGlwbGUgZHJhZyBzZXF1ZW5jZXMuXHJcbiAgICBpZiAodGhpcy5fcGFyZW50RHJhZ1JlZikge1xyXG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpc0RyYWdnaW5nID0gdGhpcy5pc0RyYWdnaW5nKCk7XHJcbiAgICBjb25zdCBpc1RvdWNoU2VxdWVuY2UgPSBpc1RvdWNoRXZlbnQoZXZlbnQpO1xyXG4gICAgY29uc3QgaXNBdXhpbGlhcnlNb3VzZUJ1dHRvbiA9ICFpc1RvdWNoU2VxdWVuY2UgJiYgKGV2ZW50IGFzIE1vdXNlRXZlbnQpLmJ1dHRvbiAhPT0gMDtcclxuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gdGhpcy5fcm9vdEVsZW1lbnQ7XHJcbiAgICBjb25zdCBpc1N5bnRoZXRpY0V2ZW50ID0gIWlzVG91Y2hTZXF1ZW5jZSAmJiB0aGlzLl9sYXN0VG91Y2hFdmVudFRpbWUgJiZcclxuICAgICAgdGhpcy5fbGFzdFRvdWNoRXZlbnRUaW1lICsgTU9VU0VfRVZFTlRfSUdOT1JFX1RJTUUgPiBEYXRlLm5vdygpO1xyXG5cclxuICAgIC8vIElmIHRoZSBldmVudCBzdGFydGVkIGZyb20gYW4gZWxlbWVudCB3aXRoIHRoZSBuYXRpdmUgSFRNTCBkcmFnJmRyb3AsIGl0J2xsIGludGVyZmVyZVxyXG4gICAgLy8gd2l0aCBvdXIgb3duIGRyYWdnaW5nIChlLmcuIGBpbWdgIHRhZ3MgZG8gaXQgYnkgZGVmYXVsdCkuIFByZXZlbnQgdGhlIGRlZmF1bHQgYWN0aW9uXHJcbiAgICAvLyB0byBzdG9wIGl0IGZyb20gaGFwcGVuaW5nLiBOb3RlIHRoYXQgcHJldmVudGluZyBvbiBgZHJhZ3N0YXJ0YCBhbHNvIHNlZW1zIHRvIHdvcmssIGJ1dFxyXG4gICAgLy8gaXQncyBmbGFreSBhbmQgaXQgZmFpbHMgaWYgdGhlIHVzZXIgZHJhZ3MgaXQgYXdheSBxdWlja2x5LiBBbHNvIG5vdGUgdGhhdCB3ZSBvbmx5IHdhbnRcclxuICAgIC8vIHRvIGRvIHRoaXMgZm9yIGBtb3VzZWRvd25gIHNpbmNlIGRvaW5nIHRoZSBzYW1lIGZvciBgdG91Y2hzdGFydGAgd2lsbCBzdG9wIGFueSBgY2xpY2tgXHJcbiAgICAvLyBldmVudHMgZnJvbSBmaXJpbmcgb24gdG91Y2ggZGV2aWNlcy5cclxuICAgIGlmIChldmVudC50YXJnZXQgJiYgKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkuZHJhZ2dhYmxlICYmIGV2ZW50LnR5cGUgPT09ICdtb3VzZWRvd24nKSB7XHJcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWJvcnQgaWYgdGhlIHVzZXIgaXMgYWxyZWFkeSBkcmFnZ2luZyBvciBpcyB1c2luZyBhIG1vdXNlIGJ1dHRvbiBvdGhlciB0aGFuIHRoZSBwcmltYXJ5IG9uZS5cclxuICAgIGlmIChpc0RyYWdnaW5nIHx8IGlzQXV4aWxpYXJ5TW91c2VCdXR0b24gfHwgaXNTeW50aGV0aWNFdmVudCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgd2UndmUgZ290IGhhbmRsZXMsIHdlIG5lZWQgdG8gZGlzYWJsZSB0aGUgdGFwIGhpZ2hsaWdodCBvbiB0aGUgZW50aXJlIHJvb3QgZWxlbWVudCxcclxuICAgIC8vIG90aGVyd2lzZSBpT1Mgd2lsbCBzdGlsbCBhZGQgaXQsIGV2ZW4gdGhvdWdoIGFsbCB0aGUgZHJhZyBpbnRlcmFjdGlvbnMgb24gdGhlIGhhbmRsZVxyXG4gICAgLy8gYXJlIGRpc2FibGVkLlxyXG4gICAgaWYgKHRoaXMuX2hhbmRsZXMubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuX3Jvb3RFbGVtZW50VGFwSGlnaGxpZ2h0ID0gcm9vdEVsZW1lbnQuc3R5bGUud2Via2l0VGFwSGlnaGxpZ2h0Q29sb3IgfHwgJyc7XHJcbiAgICAgIHJvb3RFbGVtZW50LnN0eWxlLndlYmtpdFRhcEhpZ2hsaWdodENvbG9yID0gJ3RyYW5zcGFyZW50JztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9oYXNTdGFydGVkRHJhZ2dpbmcgPSB0aGlzLl9oYXNNb3ZlZCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEF2b2lkIG11bHRpcGxlIHN1YnNjcmlwdGlvbnMgYW5kIG1lbW9yeSBsZWFrcyB3aGVuIG11bHRpIHRvdWNoXHJcbiAgICAvLyAoaXNEcmFnZ2luZyBjaGVjayBhYm92ZSBpc24ndCBlbm91Z2ggYmVjYXVzZSBvZiBwb3NzaWJsZSB0ZW1wb3JhbCBhbmQvb3IgZGltZW5zaW9uYWwgZGVsYXlzKVxyXG4gICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9ucygpO1xyXG4gICAgdGhpcy5fcG9pbnRlck1vdmVTdWJzY3JpcHRpb24gPSB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnBvaW50ZXJNb3ZlLnN1YnNjcmliZSh0aGlzLl9wb2ludGVyTW92ZSk7XHJcbiAgICB0aGlzLl9wb2ludGVyVXBTdWJzY3JpcHRpb24gPSB0aGlzLl9kcmFnRHJvcFJlZ2lzdHJ5LnBvaW50ZXJVcC5zdWJzY3JpYmUodGhpcy5fcG9pbnRlclVwKTtcclxuICAgIHRoaXMuX3Njcm9sbFN1YnNjcmlwdGlvbiA9IHRoaXMuX2RyYWdEcm9wUmVnaXN0cnkuc2Nyb2xsLnN1YnNjcmliZShzY3JvbGxFdmVudCA9PiB7XHJcbiAgICAgIHRoaXMuX3VwZGF0ZU9uU2Nyb2xsKHNjcm9sbEV2ZW50KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICh0aGlzLl9ib3VuZGFyeUVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5fYm91bmRhcnlSZWN0ID0gZ2V0TXV0YWJsZUNsaWVudFJlY3QodGhpcy5fYm91bmRhcnlFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB3ZSBoYXZlIGEgY3VzdG9tIHByZXZpZXcgd2UgY2FuJ3Qga25vdyBhaGVhZCBvZiB0aW1lIGhvdyBsYXJnZSBpdCdsbCBiZSBzbyB3ZSBwb3NpdGlvblxyXG4gICAgLy8gaXQgbmV4dCB0byB0aGUgY3Vyc29yLiBUaGUgZXhjZXB0aW9uIGlzIHdoZW4gdGhlIGNvbnN1bWVyIGhhcyBvcHRlZCBpbnRvIG1ha2luZyB0aGUgcHJldmlld1xyXG4gICAgLy8gdGhlIHNhbWUgc2l6ZSBhcyB0aGUgcm9vdCBlbGVtZW50LCBpbiB3aGljaCBjYXNlIHdlIGRvIGtub3cgdGhlIHNpemUuXHJcbiAgICBjb25zdCBwcmV2aWV3VGVtcGxhdGUgPSB0aGlzLl9wcmV2aWV3VGVtcGxhdGU7XHJcbiAgICB0aGlzLl9waWNrdXBQb3NpdGlvbkluRWxlbWVudCA9IHByZXZpZXdUZW1wbGF0ZSAmJiBwcmV2aWV3VGVtcGxhdGUudGVtcGxhdGUgJiZcclxuICAgICAgIXByZXZpZXdUZW1wbGF0ZS5tYXRjaFNpemUgPyB7eDogMCwgeTogMH0gOlxyXG4gICAgICB0aGlzLl9nZXRQb2ludGVyUG9zaXRpb25JbkVsZW1lbnQocmVmZXJlbmNlRWxlbWVudCwgZXZlbnQpO1xyXG4gICAgY29uc3QgcG9pbnRlclBvc2l0aW9uID0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UgPSB0aGlzLl9sYXN0S25vd25Qb2ludGVyUG9zaXRpb24gPVxyXG4gICAgICAgIHRoaXMuX2dldFBvaW50ZXJQb3NpdGlvbk9uUGFnZShldmVudCk7XHJcbiAgICB0aGlzLl9wb2ludGVyRGlyZWN0aW9uRGVsdGEgPSB7eDogMCwgeTogMH07XHJcbiAgICB0aGlzLl9wb2ludGVyUG9zaXRpb25BdExhc3REaXJlY3Rpb25DaGFuZ2UgPSB7eDogcG9pbnRlclBvc2l0aW9uLngsIHk6IHBvaW50ZXJQb3NpdGlvbi55fTtcclxuICAgIHRoaXMuX2RyYWdTdGFydFRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgdGhpcy5fZHJhZ0Ryb3BSZWdpc3RyeS5zdGFydERyYWdnaW5nKHRoaXMsIGV2ZW50KTtcclxuICB9XHJcblxyXG4gIC8qKiBDbGVhbnMgdXAgdGhlIERPTSBhcnRpZmFjdHMgdGhhdCB3ZXJlIGFkZGVkIHRvIGZhY2lsaXRhdGUgdGhlIGVsZW1lbnQgYmVpbmcgZHJhZ2dlZC4gKi9cclxuICBwcml2YXRlIF9jbGVhbnVwRHJhZ0FydGlmYWN0cyhldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgIC8vIFJlc3RvcmUgdGhlIGVsZW1lbnQncyB2aXNpYmlsaXR5IGFuZCBpbnNlcnQgaXQgYXQgaXRzIG9sZCBwb3NpdGlvbiBpbiB0aGUgRE9NLlxyXG4gICAgLy8gSXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBtYWludGFpbiB0aGUgcG9zaXRpb24sIGJlY2F1c2UgbW92aW5nIHRoZSBlbGVtZW50IGFyb3VuZCBpbiB0aGUgRE9NXHJcbiAgICAvLyBjYW4gdGhyb3cgb2ZmIGBOZ0ZvcmAgd2hpY2ggZG9lcyBzbWFydCBkaWZmaW5nIGFuZCByZS1jcmVhdGVzIGVsZW1lbnRzIG9ubHkgd2hlbiBuZWNlc3NhcnksXHJcbiAgICAvLyB3aGlsZSBtb3ZpbmcgdGhlIGV4aXN0aW5nIGVsZW1lbnRzIGluIGFsbCBvdGhlciBjYXNlcy5cclxuICAgIHRvZ2dsZVZpc2liaWxpdHkodGhpcy5fcm9vdEVsZW1lbnQsIHRydWUpO1xyXG4gICAgdGhpcy5fYW5jaG9yLnBhcmVudE5vZGUhLnJlcGxhY2VDaGlsZCh0aGlzLl9yb290RWxlbWVudCwgdGhpcy5fYW5jaG9yKTtcclxuXHJcbiAgICB0aGlzLl9kZXN0cm95UHJldmlldygpO1xyXG4gICAgdGhpcy5fZGVzdHJveVBsYWNlaG9sZGVyKCk7XHJcbiAgICB0aGlzLl9ib3VuZGFyeVJlY3QgPSB0aGlzLl9wcmV2aWV3UmVjdCA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAvLyBSZS1lbnRlciB0aGUgTmdab25lIHNpbmNlIHdlIGJvdW5kIGBkb2N1bWVudGAgZXZlbnRzIG9uIHRoZSBvdXRzaWRlLlxyXG4gICAgdGhpcy5fbmdab25lLnJ1bigoKSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuX2Ryb3BDb250YWluZXIhO1xyXG4gICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBjb250YWluZXIuZ2V0SXRlbUluZGV4KHRoaXMpO1xyXG4gICAgICBjb25zdCBwb2ludGVyUG9zaXRpb24gPSB0aGlzLl9nZXRQb2ludGVyUG9zaXRpb25PblBhZ2UoZXZlbnQpO1xyXG4gICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuX2dldERyYWdEaXN0YW5jZSh0aGlzLl9nZXRQb2ludGVyUG9zaXRpb25PblBhZ2UoZXZlbnQpKTtcclxuICAgICAgY29uc3QgaXNQb2ludGVyT3ZlckNvbnRhaW5lciA9IGNvbnRhaW5lci5faXNPdmVyQ29udGFpbmVyKFxyXG4gICAgICAgIHBvaW50ZXJQb3NpdGlvbi54LCBwb2ludGVyUG9zaXRpb24ueSk7XHJcblxyXG4gICAgICB0aGlzLmVuZGVkLm5leHQoe3NvdXJjZTogdGhpcywgZGlzdGFuY2V9KTtcclxuICAgICAgdGhpcy5kcm9wcGVkLm5leHQoe1xyXG4gICAgICAgIGl0ZW06IHRoaXMsXHJcbiAgICAgICAgY3VycmVudEluZGV4LFxyXG4gICAgICAgIHByZXZpb3VzSW5kZXg6IHRoaXMuX2luaXRpYWxJbmRleCxcclxuICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcclxuICAgICAgICBwcmV2aW91c0NvbnRhaW5lcjogdGhpcy5faW5pdGlhbENvbnRhaW5lcixcclxuICAgICAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyLFxyXG4gICAgICAgIGRpc3RhbmNlXHJcbiAgICAgIH0pO1xyXG4gICAgICBjb250YWluZXIuZHJvcCh0aGlzLCBjdXJyZW50SW5kZXgsIHRoaXMuX2luaXRpYWxJbmRleCwgdGhpcy5faW5pdGlhbENvbnRhaW5lcixcclxuICAgICAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyLCBkaXN0YW5jZSk7XHJcbiAgICAgIHRoaXMuX2Ryb3BDb250YWluZXIgPSB0aGlzLl9pbml0aWFsQ29udGFpbmVyO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRoZSBpdGVtJ3MgcG9zaXRpb24gaW4gaXRzIGRyb3AgY29udGFpbmVyLCBvciBtb3ZlcyBpdFxyXG4gICAqIGludG8gYSBuZXcgb25lLCBkZXBlbmRpbmcgb24gaXRzIGN1cnJlbnQgZHJhZyBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIF91cGRhdGVBY3RpdmVEcm9wQ29udGFpbmVyKHt4LCB5fTogUG9pbnQsIHt4OiByYXdYLCB5OiByYXdZfTogUG9pbnQpIHtcclxuICAgIC8vIERyb3AgY29udGFpbmVyIHRoYXQgZHJhZ2dhYmxlIGhhcyBiZWVuIG1vdmVkIGludG8uXHJcbiAgICBsZXQgbmV3Q29udGFpbmVyID0gdGhpcy5faW5pdGlhbENvbnRhaW5lci5fZ2V0U2libGluZ0NvbnRhaW5lckZyb21Qb3NpdGlvbih0aGlzLCB4LCB5KTtcclxuXHJcbiAgICAvLyBJZiB3ZSBjb3VsZG4ndCBmaW5kIGEgbmV3IGNvbnRhaW5lciB0byBtb3ZlIHRoZSBpdGVtIGludG8sIGFuZCB0aGUgaXRlbSBoYXMgbGVmdCBpdHNcclxuICAgIC8vIGluaXRpYWwgY29udGFpbmVyLCBjaGVjayB3aGV0aGVyIHRoZSBpdCdzIG92ZXIgdGhlIGluaXRpYWwgY29udGFpbmVyLiBUaGlzIGhhbmRsZXMgdGhlXHJcbiAgICAvLyBjYXNlIHdoZXJlIHR3byBjb250YWluZXJzIGFyZSBjb25uZWN0ZWQgb25lIHdheSBhbmQgdGhlIHVzZXIgdHJpZXMgdG8gdW5kbyBkcmFnZ2luZyBhblxyXG4gICAgLy8gaXRlbSBpbnRvIGEgbmV3IGNvbnRhaW5lci5cclxuICAgIGlmICghbmV3Q29udGFpbmVyICYmIHRoaXMuX2Ryb3BDb250YWluZXIgIT09IHRoaXMuX2luaXRpYWxDb250YWluZXIgJiZcclxuICAgICAgICB0aGlzLl9pbml0aWFsQ29udGFpbmVyLl9pc092ZXJDb250YWluZXIoeCwgeSkpIHtcclxuICAgICAgbmV3Q29udGFpbmVyID0gdGhpcy5faW5pdGlhbENvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobmV3Q29udGFpbmVyICYmIG5ld0NvbnRhaW5lciAhPT0gdGhpcy5fZHJvcENvbnRhaW5lcikge1xyXG4gICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHtcclxuICAgICAgICAvLyBOb3RpZnkgdGhlIG9sZCBjb250YWluZXIgdGhhdCB0aGUgaXRlbSBoYXMgbGVmdC5cclxuICAgICAgICB0aGlzLmV4aXRlZC5uZXh0KHtpdGVtOiB0aGlzLCBjb250YWluZXI6IHRoaXMuX2Ryb3BDb250YWluZXIhfSk7XHJcbiAgICAgICAgdGhpcy5fZHJvcENvbnRhaW5lciEuZXhpdCh0aGlzKTtcclxuICAgICAgICAvLyBOb3RpZnkgdGhlIG5ldyBjb250YWluZXIgdGhhdCB0aGUgaXRlbSBoYXMgZW50ZXJlZC5cclxuICAgICAgICB0aGlzLl9kcm9wQ29udGFpbmVyID0gbmV3Q29udGFpbmVyITtcclxuICAgICAgICB0aGlzLl9kcm9wQ29udGFpbmVyLmVudGVyKHRoaXMsIHgsIHksIG5ld0NvbnRhaW5lciA9PT0gdGhpcy5faW5pdGlhbENvbnRhaW5lciAmJlxyXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSByZS1lbnRlcmluZyB0aGUgaW5pdGlhbCBjb250YWluZXIgYW5kIHNvcnRpbmcgaXMgZGlzYWJsZWQsXHJcbiAgICAgICAgICAgIC8vIHB1dCBpdGVtIHRoZSBpbnRvIGl0cyBzdGFydGluZyBpbmRleCB0byBiZWdpbiB3aXRoLlxyXG4gICAgICAgICAgICBuZXdDb250YWluZXIuc29ydGluZ0Rpc2FibGVkID8gdGhpcy5faW5pdGlhbEluZGV4IDogdW5kZWZpbmVkKTtcclxuICAgICAgICB0aGlzLmVudGVyZWQubmV4dCh7XHJcbiAgICAgICAgICBpdGVtOiB0aGlzLFxyXG4gICAgICAgICAgY29udGFpbmVyOiBuZXdDb250YWluZXIhLFxyXG4gICAgICAgICAgY3VycmVudEluZGV4OiBuZXdDb250YWluZXIhLmdldEl0ZW1JbmRleCh0aGlzKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9kcm9wQ29udGFpbmVyIS5fc3RhcnRTY3JvbGxpbmdJZk5lY2Vzc2FyeShyYXdYLCByYXdZKTtcclxuICAgIHRoaXMuX2Ryb3BDb250YWluZXIhLl9zb3J0SXRlbSh0aGlzLCB4LCB5LCB0aGlzLl9wb2ludGVyRGlyZWN0aW9uRGVsdGEpO1xyXG4gICAgdGhpcy5fcHJldmlldy5zdHlsZS50cmFuc2Zvcm0gPVxyXG4gICAgICAgIGdldFRyYW5zZm9ybSh4IC0gdGhpcy5fcGlja3VwUG9zaXRpb25JbkVsZW1lbnQueCwgeSAtIHRoaXMuX3BpY2t1cFBvc2l0aW9uSW5FbGVtZW50LnkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgZWxlbWVudCB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgbmV4dCB0byB0aGUgdXNlcidzIHBvaW50ZXJcclxuICAgKiBhbmQgd2lsbCBiZSB1c2VkIGFzIGEgcHJldmlldyBvZiB0aGUgZWxlbWVudCB0aGF0IGlzIGJlaW5nIGRyYWdnZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlUHJldmlld0VsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgcHJldmlld0NvbmZpZyA9IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZTtcclxuICAgIGNvbnN0IHByZXZpZXdDbGFzcyA9IHRoaXMucHJldmlld0NsYXNzO1xyXG4gICAgY29uc3QgcHJldmlld1RlbXBsYXRlID0gcHJldmlld0NvbmZpZyA/IHByZXZpZXdDb25maWcudGVtcGxhdGUgOiBudWxsO1xyXG4gICAgbGV0IHByZXZpZXc6IEhUTUxFbGVtZW50O1xyXG5cclxuICAgIGlmIChwcmV2aWV3VGVtcGxhdGUgJiYgcHJldmlld0NvbmZpZykge1xyXG4gICAgICAvLyBNZWFzdXJlIHRoZSBlbGVtZW50IGJlZm9yZSB3ZSd2ZSBpbnNlcnRlZCB0aGUgcHJldmlld1xyXG4gICAgICAvLyBzaW5jZSB0aGUgaW5zZXJ0aW9uIGNvdWxkIHRocm93IG9mZiB0aGUgbWVhc3VyZW1lbnQuXHJcbiAgICAgIGNvbnN0IHJvb3RSZWN0ID0gcHJldmlld0NvbmZpZy5tYXRjaFNpemUgPyB0aGlzLl9yb290RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSA6IG51bGw7XHJcbiAgICAgIGNvbnN0IHZpZXdSZWYgPSBwcmV2aWV3Q29uZmlnLnZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KHByZXZpZXdUZW1wbGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlld0NvbmZpZy5jb250ZXh0KTtcclxuICAgICAgdmlld1JlZi5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgIHByZXZpZXcgPSBnZXRSb290Tm9kZSh2aWV3UmVmLCB0aGlzLl9kb2N1bWVudCk7XHJcbiAgICAgIHRoaXMuX3ByZXZpZXdSZWYgPSB2aWV3UmVmO1xyXG4gICAgICBpZiAocHJldmlld0NvbmZpZy5tYXRjaFNpemUpIHtcclxuICAgICAgICBtYXRjaEVsZW1lbnRTaXplKHByZXZpZXcsIHJvb3RSZWN0ISk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJldmlldy5zdHlsZS50cmFuc2Zvcm0gPVxyXG4gICAgICAgICAgICBnZXRUcmFuc2Zvcm0odGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueCwgdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLl9yb290RWxlbWVudDtcclxuICAgICAgcHJldmlldyA9IGRlZXBDbG9uZU5vZGUoZWxlbWVudCk7XHJcbiAgICAgIG1hdGNoRWxlbWVudFNpemUocHJldmlldywgZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZW5kU3R5bGVzKHByZXZpZXcuc3R5bGUsIHtcclxuICAgICAgLy8gSXQncyBpbXBvcnRhbnQgdGhhdCB3ZSBkaXNhYmxlIHRoZSBwb2ludGVyIGV2ZW50cyBvbiB0aGUgcHJldmlldywgYmVjYXVzZVxyXG4gICAgICAvLyBpdCBjYW4gdGhyb3cgb2ZmIHRoZSBgZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludGAgY2FsbHMgaW4gdGhlIGBDZGtEcm9wTGlzdGAuXHJcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcclxuICAgICAgLy8gV2UgaGF2ZSB0byByZXNldCB0aGUgbWFyZ2luLCBiZWNhdXNlIGl0IGNhbiB0aHJvdyBvZmYgcG9zaXRpb25pbmcgcmVsYXRpdmUgdG8gdGhlIHZpZXdwb3J0LlxyXG4gICAgICBtYXJnaW46ICcwJyxcclxuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgIHRvcDogJzAnLFxyXG4gICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgIHpJbmRleDogYCR7dGhpcy5fY29uZmlnLnpJbmRleCB8fCAxMDAwfWBcclxuICAgIH0pO1xyXG5cclxuICAgIHRvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMocHJldmlldywgZmFsc2UpO1xyXG4gICAgcHJldmlldy5jbGFzc0xpc3QuYWRkKCdjZGstZHJhZy1wcmV2aWV3Jyk7XHJcbiAgICBwcmV2aWV3LnNldEF0dHJpYnV0ZSgnZGlyJywgdGhpcy5fZGlyZWN0aW9uKTtcclxuXHJcbiAgICBpZiAocHJldmlld0NsYXNzKSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHByZXZpZXdDbGFzcykpIHtcclxuICAgICAgICBwcmV2aWV3Q2xhc3MuZm9yRWFjaChjbGFzc05hbWUgPT4gcHJldmlldy5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHByZXZpZXcuY2xhc3NMaXN0LmFkZChwcmV2aWV3Q2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHByZXZpZXc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbmltYXRlcyB0aGUgcHJldmlldyBlbGVtZW50IGZyb20gaXRzIGN1cnJlbnQgcG9zaXRpb24gdG8gdGhlIGxvY2F0aW9uIG9mIHRoZSBkcm9wIHBsYWNlaG9sZGVyLlxyXG4gICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBhbmltYXRpb24gY29tcGxldGVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2FuaW1hdGVQcmV2aWV3VG9QbGFjZWhvbGRlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIC8vIElmIHRoZSB1c2VyIGhhc24ndCBtb3ZlZCB5ZXQsIHRoZSB0cmFuc2l0aW9uZW5kIGV2ZW50IHdvbid0IGZpcmUuXHJcbiAgICBpZiAoIXRoaXMuX2hhc01vdmVkKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwbGFjZWhvbGRlclJlY3QgPSB0aGlzLl9wbGFjZWhvbGRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAvLyBBcHBseSB0aGUgY2xhc3MgdGhhdCBhZGRzIGEgdHJhbnNpdGlvbiB0byB0aGUgcHJldmlldy5cclxuICAgIHRoaXMuX3ByZXZpZXcuY2xhc3NMaXN0LmFkZCgnY2RrLWRyYWctYW5pbWF0aW5nJyk7XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgcHJldmlldyB0byB0aGUgcGxhY2Vob2xkZXIgcG9zaXRpb24uXHJcbiAgICB0aGlzLl9wcmV2aWV3LnN0eWxlLnRyYW5zZm9ybSA9IGdldFRyYW5zZm9ybShwbGFjZWhvbGRlclJlY3QubGVmdCwgcGxhY2Vob2xkZXJSZWN0LnRvcCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGEgYHRyYW5zaXRpb25gLCB0aGUgYHRyYW5zaXRpb25lbmRgIGV2ZW50IHdvbid0IGZpcmUuIFNpbmNlXHJcbiAgICAvLyB3ZSBuZWVkIHRvIHRyaWdnZXIgYSBzdHlsZSByZWNhbGN1bGF0aW9uIGluIG9yZGVyIGZvciB0aGUgYGNkay1kcmFnLWFuaW1hdGluZ2AgY2xhc3MgdG9cclxuICAgIC8vIGFwcGx5IGl0cyBzdHlsZSwgd2UgdGFrZSBhZHZhbnRhZ2Ugb2YgdGhlIGF2YWlsYWJsZSBpbmZvIHRvIGZpZ3VyZSBvdXQgd2hldGhlciB3ZSBuZWVkIHRvXHJcbiAgICAvLyBiaW5kIHRoZSBldmVudCBpbiB0aGUgZmlyc3QgcGxhY2UuXHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IGdldFRyYW5zZm9ybVRyYW5zaXRpb25EdXJhdGlvbkluTXModGhpcy5fcHJldmlldyk7XHJcblxyXG4gICAgaWYgKGR1cmF0aW9uID09PSAwKSB7XHJcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoKGV2ZW50OiBUcmFuc2l0aW9uRXZlbnQpID0+IHtcclxuICAgICAgICAgIGlmICghZXZlbnQgfHwgKGV2ZW50LnRhcmdldCA9PT0gdGhpcy5fcHJldmlldyAmJiBldmVudC5wcm9wZXJ0eU5hbWUgPT09ICd0cmFuc2Zvcm0nKSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wcmV2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBoYW5kbGVyKTtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSkgYXMgRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdDtcclxuXHJcbiAgICAgICAgLy8gSWYgYSB0cmFuc2l0aW9uIGlzIHNob3J0IGVub3VnaCwgdGhlIGJyb3dzZXIgbWlnaHQgbm90IGZpcmUgdGhlIGB0cmFuc2l0aW9uZW5kYCBldmVudC5cclxuICAgICAgICAvLyBTaW5jZSB3ZSBrbm93IGhvdyBsb25nIGl0J3Mgc3VwcG9zZWQgdG8gdGFrZSwgYWRkIGEgdGltZW91dCB3aXRoIGEgNTAlIGJ1ZmZlciB0aGF0J2xsXHJcbiAgICAgICAgLy8gZmlyZSBpZiB0aGUgdHJhbnNpdGlvbiBoYXNuJ3QgY29tcGxldGVkIHdoZW4gaXQgd2FzIHN1cHBvc2VkIHRvLlxyXG4gICAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KGhhbmRsZXIgYXMgRnVuY3Rpb24sIGR1cmF0aW9uICogMS41KTtcclxuICAgICAgICB0aGlzLl9wcmV2aWV3LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBoYW5kbGVyKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBDcmVhdGVzIGFuIGVsZW1lbnQgdGhhdCB3aWxsIGJlIHNob3duIGluc3RlYWQgb2YgdGhlIGN1cnJlbnQgZWxlbWVudCB3aGlsZSBkcmFnZ2luZy4gKi9cclxuICBwcml2YXRlIF9jcmVhdGVQbGFjZWhvbGRlckVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgcGxhY2Vob2xkZXJDb25maWcgPSB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlO1xyXG4gICAgY29uc3QgcGxhY2Vob2xkZXJUZW1wbGF0ZSA9IHBsYWNlaG9sZGVyQ29uZmlnID8gcGxhY2Vob2xkZXJDb25maWcudGVtcGxhdGUgOiBudWxsO1xyXG4gICAgbGV0IHBsYWNlaG9sZGVyOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBpZiAocGxhY2Vob2xkZXJUZW1wbGF0ZSkge1xyXG4gICAgICB0aGlzLl9wbGFjZWhvbGRlclJlZiA9IHBsYWNlaG9sZGVyQ29uZmlnIS52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyhcclxuICAgICAgICBwbGFjZWhvbGRlclRlbXBsYXRlLFxyXG4gICAgICAgIHBsYWNlaG9sZGVyQ29uZmlnIS5jb250ZXh0XHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuX3BsYWNlaG9sZGVyUmVmLmRldGVjdENoYW5nZXMoKTtcclxuICAgICAgcGxhY2Vob2xkZXIgPSBnZXRSb290Tm9kZSh0aGlzLl9wbGFjZWhvbGRlclJlZiwgdGhpcy5fZG9jdW1lbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGxhY2Vob2xkZXIgPSBkZWVwQ2xvbmVOb2RlKHRoaXMuX3Jvb3RFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwbGFjZWhvbGRlci5jbGFzc0xpc3QuYWRkKCdjZGstZHJhZy1wbGFjZWhvbGRlcicpO1xyXG4gICAgcmV0dXJuIHBsYWNlaG9sZGVyO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmlndXJlcyBvdXQgdGhlIGNvb3JkaW5hdGVzIGF0IHdoaWNoIGFuIGVsZW1lbnQgd2FzIHBpY2tlZCB1cC5cclxuICAgKiBAcGFyYW0gcmVmZXJlbmNlRWxlbWVudCBFbGVtZW50IHRoYXQgaW5pdGlhdGVkIHRoZSBkcmFnZ2luZy5cclxuICAgKiBAcGFyYW0gZXZlbnQgRXZlbnQgdGhhdCBpbml0aWF0ZWQgdGhlIGRyYWdnaW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX2dldFBvaW50ZXJQb3NpdGlvbkluRWxlbWVudChyZWZlcmVuY2VFbGVtZW50OiBIVE1MRWxlbWVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogUG9pbnQge1xyXG4gICAgY29uc3QgZWxlbWVudFJlY3QgPSB0aGlzLl9yb290RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgIGNvbnN0IGhhbmRsZUVsZW1lbnQgPSByZWZlcmVuY2VFbGVtZW50ID09PSB0aGlzLl9yb290RWxlbWVudCA/IG51bGwgOiByZWZlcmVuY2VFbGVtZW50O1xyXG4gICAgY29uc3QgcmVmZXJlbmNlUmVjdCA9IGhhbmRsZUVsZW1lbnQgPyBoYW5kbGVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIDogZWxlbWVudFJlY3Q7XHJcbiAgICBjb25zdCBwb2ludCA9IGlzVG91Y2hFdmVudChldmVudCkgPyBldmVudC50YXJnZXRUb3VjaGVzWzBdIDogZXZlbnQ7XHJcbiAgICBjb25zdCBzY3JvbGxQb3NpdGlvbiA9IHRoaXMuX2dldFZpZXdwb3J0U2Nyb2xsUG9zaXRpb24oKTtcclxuICAgIGNvbnN0IHggPSBwb2ludC5wYWdlWCAtIHJlZmVyZW5jZVJlY3QubGVmdCAtIHNjcm9sbFBvc2l0aW9uLmxlZnQ7XHJcbiAgICBjb25zdCB5ID0gcG9pbnQucGFnZVkgLSByZWZlcmVuY2VSZWN0LnRvcCAtIHNjcm9sbFBvc2l0aW9uLnRvcDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiByZWZlcmVuY2VSZWN0LmxlZnQgLSBlbGVtZW50UmVjdC5sZWZ0ICsgeCxcclxuICAgICAgeTogcmVmZXJlbmNlUmVjdC50b3AgLSBlbGVtZW50UmVjdC50b3AgKyB5XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqIERldGVybWluZXMgdGhlIHBvaW50IG9mIHRoZSBwYWdlIHRoYXQgd2FzIHRvdWNoZWQgYnkgdGhlIHVzZXIuICovXHJcbiAgcHJpdmF0ZSBfZ2V0UG9pbnRlclBvc2l0aW9uT25QYWdlKGV2ZW50OiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCk6IFBvaW50IHtcclxuICAgIGNvbnN0IHNjcm9sbFBvc2l0aW9uID0gdGhpcy5fZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xyXG4gICAgY29uc3QgcG9pbnQgPSBpc1RvdWNoRXZlbnQoZXZlbnQpID9cclxuICAgICAgICAvLyBgdG91Y2hlc2Agd2lsbCBiZSBlbXB0eSBmb3Igc3RhcnQvZW5kIGV2ZW50cyBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgY2hhbmdlZFRvdWNoZXNgLlxyXG4gICAgICAgIC8vIEFsc28gbm90ZSB0aGF0IG9uIHJlYWwgZGV2aWNlcyB3ZSdyZSBndWFyYW50ZWVkIGZvciBlaXRoZXIgYHRvdWNoZXNgIG9yIGBjaGFuZ2VkVG91Y2hlc2BcclxuICAgICAgICAvLyB0byBoYXZlIGEgdmFsdWUsIGJ1dCBGaXJlZm94IGluIGRldmljZSBlbXVsYXRpb24gbW9kZSBoYXMgYSBidWcgd2hlcmUgYm90aCBjYW4gYmUgZW1wdHlcclxuICAgICAgICAvLyBmb3IgYHRvdWNoc3RhcnRgIGFuZCBgdG91Y2hlbmRgIHNvIHdlIGZhbGwgYmFjayB0byBhIGR1bW15IG9iamVjdCBpbiBvcmRlciB0byBhdm9pZFxyXG4gICAgICAgIC8vIHRocm93aW5nIGFuIGVycm9yLiBUaGUgdmFsdWUgcmV0dXJuZWQgaGVyZSB3aWxsIGJlIGluY29ycmVjdCwgYnV0IHNpbmNlIHRoaXMgb25seVxyXG4gICAgICAgIC8vIGJyZWFrcyBpbnNpZGUgYSBkZXZlbG9wZXIgdG9vbCBhbmQgdGhlIHZhbHVlIGlzIG9ubHkgdXNlZCBmb3Igc2Vjb25kYXJ5IGluZm9ybWF0aW9uLFxyXG4gICAgICAgIC8vIHdlIGNhbiBnZXQgYXdheSB3aXRoIGl0LiBTZWUgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTYxNTgyNC5cclxuICAgICAgICAoZXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSB8fCB7cGFnZVg6IDAsIHBhZ2VZOiAwfSkgOiBldmVudDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIHg6IHBvaW50LnBhZ2VYIC0gc2Nyb2xsUG9zaXRpb24ubGVmdCxcclxuICAgICAgICAgIHk6IHBvaW50LnBhZ2VZIC0gc2Nyb2xsUG9zaXRpb24udG9wXHJcbiAgICAgICAgfTtcclxuICB9XHJcblxyXG5cclxuICAvKiogR2V0cyB0aGUgcG9pbnRlciBwb3NpdGlvbiBvbiB0aGUgcGFnZSwgYWNjb3VudGluZyBmb3IgYW55IHBvc2l0aW9uIGNvbnN0cmFpbnRzLiAqL1xyXG4gIHByaXZhdGUgX2dldENvbnN0cmFpbmVkUG9pbnRlclBvc2l0aW9uKHBvaW50OiBQb2ludCk6IFBvaW50IHtcclxuICAgIGNvbnN0IGRyb3BDb250YWluZXJMb2NrID0gdGhpcy5fZHJvcENvbnRhaW5lciA/IHRoaXMuX2Ryb3BDb250YWluZXIubG9ja0F4aXMgOiBudWxsO1xyXG4gICAgbGV0IHt4LCB5fSA9IHRoaXMuY29uc3RyYWluUG9zaXRpb24gPyB0aGlzLmNvbnN0cmFpblBvc2l0aW9uKHBvaW50LCB0aGlzKSA6IHBvaW50O1xyXG5cclxuICAgIGlmICh0aGlzLmxvY2tBeGlzID09PSAneCcgfHwgZHJvcENvbnRhaW5lckxvY2sgPT09ICd4Jykge1xyXG4gICAgICB5ID0gdGhpcy5fcGlja3VwUG9zaXRpb25PblBhZ2UueTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5sb2NrQXhpcyA9PT0gJ3knIHx8IGRyb3BDb250YWluZXJMb2NrID09PSAneScpIHtcclxuICAgICAgeCA9IHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLng7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2JvdW5kYXJ5UmVjdCkge1xyXG4gICAgICBjb25zdCB7eDogcGlja3VwWCwgeTogcGlja3VwWX0gPSB0aGlzLl9waWNrdXBQb3NpdGlvbkluRWxlbWVudDtcclxuICAgICAgY29uc3QgYm91bmRhcnlSZWN0ID0gdGhpcy5fYm91bmRhcnlSZWN0O1xyXG4gICAgICBjb25zdCBwcmV2aWV3UmVjdCA9IHRoaXMuX3ByZXZpZXdSZWN0ITtcclxuICAgICAgY29uc3QgbWluWSA9IGJvdW5kYXJ5UmVjdC50b3AgKyBwaWNrdXBZO1xyXG4gICAgICBjb25zdCBtYXhZID0gYm91bmRhcnlSZWN0LmJvdHRvbSAtIChwcmV2aWV3UmVjdC5oZWlnaHQgLSBwaWNrdXBZKTtcclxuICAgICAgY29uc3QgbWluWCA9IGJvdW5kYXJ5UmVjdC5sZWZ0ICsgcGlja3VwWDtcclxuICAgICAgY29uc3QgbWF4WCA9IGJvdW5kYXJ5UmVjdC5yaWdodCAtIChwcmV2aWV3UmVjdC53aWR0aCAtIHBpY2t1cFgpO1xyXG5cclxuICAgICAgeCA9IGNsYW1wKHgsIG1pblgsIG1heFgpO1xyXG4gICAgICB5ID0gY2xhbXAoeSwgbWluWSwgbWF4WSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHt4LCB5fTtcclxuICB9XHJcblxyXG5cclxuICAvKiogVXBkYXRlcyB0aGUgY3VycmVudCBkcmFnIGRlbHRhLCBiYXNlZCBvbiB0aGUgdXNlcidzIGN1cnJlbnQgcG9pbnRlciBwb3NpdGlvbiBvbiB0aGUgcGFnZS4gKi9cclxuICBwcml2YXRlIF91cGRhdGVQb2ludGVyRGlyZWN0aW9uRGVsdGEocG9pbnRlclBvc2l0aW9uT25QYWdlOiBQb2ludCkge1xyXG4gICAgY29uc3Qge3gsIHl9ID0gcG9pbnRlclBvc2l0aW9uT25QYWdlO1xyXG4gICAgY29uc3QgZGVsdGEgPSB0aGlzLl9wb2ludGVyRGlyZWN0aW9uRGVsdGE7XHJcbiAgICBjb25zdCBwb3NpdGlvblNpbmNlTGFzdENoYW5nZSA9IHRoaXMuX3BvaW50ZXJQb3NpdGlvbkF0TGFzdERpcmVjdGlvbkNoYW5nZTtcclxuXHJcbiAgICAvLyBBbW91bnQgb2YgcGl4ZWxzIHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgdGhlIGRpcmVjdGlvbiBjaGFuZ2VkLlxyXG4gICAgY29uc3QgY2hhbmdlWCA9IE1hdGguYWJzKHggLSBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS54KTtcclxuICAgIGNvbnN0IGNoYW5nZVkgPSBNYXRoLmFicyh5IC0gcG9zaXRpb25TaW5jZUxhc3RDaGFuZ2UueSk7XHJcblxyXG4gICAgLy8gQmVjYXVzZSB3ZSBoYW5kbGUgcG9pbnRlciBldmVudHMgb24gYSBwZXItcGl4ZWwgYmFzaXMsIHdlIGRvbid0IHdhbnQgdGhlIGRlbHRhXHJcbiAgICAvLyB0byBjaGFuZ2UgZm9yIGV2ZXJ5IHBpeGVsLCBvdGhlcndpc2UgYW55dGhpbmcgdGhhdCBkZXBlbmRzIG9uIGl0IGNhbiBsb29rIGVycmF0aWMuXHJcbiAgICAvLyBUbyBtYWtlIHRoZSBkZWx0YSBtb3JlIGNvbnNpc3RlbnQsIHdlIHRyYWNrIGhvdyBtdWNoIHRoZSB1c2VyIGhhcyBtb3ZlZCBzaW5jZSB0aGUgbGFzdFxyXG4gICAgLy8gZGVsdGEgY2hhbmdlIGFuZCB3ZSBvbmx5IHVwZGF0ZSBpdCBhZnRlciBpdCBoYXMgcmVhY2hlZCBhIGNlcnRhaW4gdGhyZXNob2xkLlxyXG4gICAgaWYgKGNoYW5nZVggPiB0aGlzLl9jb25maWcucG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZCkge1xyXG4gICAgICBkZWx0YS54ID0geCA+IHBvc2l0aW9uU2luY2VMYXN0Q2hhbmdlLnggPyAxIDogLTE7XHJcbiAgICAgIHBvc2l0aW9uU2luY2VMYXN0Q2hhbmdlLnggPSB4O1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjaGFuZ2VZID4gdGhpcy5fY29uZmlnLnBvaW50ZXJEaXJlY3Rpb25DaGFuZ2VUaHJlc2hvbGQpIHtcclxuICAgICAgZGVsdGEueSA9IHkgPiBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS55ID8gMSA6IC0xO1xyXG4gICAgICBwb3NpdGlvblNpbmNlTGFzdENoYW5nZS55ID0geTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGVsdGE7XHJcbiAgfVxyXG5cclxuICAvKiogVG9nZ2xlcyB0aGUgbmF0aXZlIGRyYWcgaW50ZXJhY3Rpb25zLCBiYXNlZCBvbiBob3cgbWFueSBoYW5kbGVzIGFyZSByZWdpc3RlcmVkLiAqL1xyXG4gIHByaXZhdGUgX3RvZ2dsZU5hdGl2ZURyYWdJbnRlcmFjdGlvbnMoKSB7XHJcbiAgICBpZiAoIXRoaXMuX3Jvb3RFbGVtZW50IHx8ICF0aGlzLl9oYW5kbGVzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzaG91bGRFbmFibGUgPSB0aGlzLl9oYW5kbGVzLmxlbmd0aCA+IDAgfHwgIXRoaXMuaXNEcmFnZ2luZygpO1xyXG5cclxuICAgIGlmIChzaG91bGRFbmFibGUgIT09IHRoaXMuX25hdGl2ZUludGVyYWN0aW9uc0VuYWJsZWQpIHtcclxuICAgICAgdGhpcy5fbmF0aXZlSW50ZXJhY3Rpb25zRW5hYmxlZCA9IHNob3VsZEVuYWJsZTtcclxuICAgICAgdG9nZ2xlTmF0aXZlRHJhZ0ludGVyYWN0aW9ucyh0aGlzLl9yb290RWxlbWVudCwgc2hvdWxkRW5hYmxlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBSZW1vdmVzIHRoZSBtYW51YWxseS1hZGRlZCBldmVudCBsaXN0ZW5lcnMgZnJvbSB0aGUgcm9vdCBlbGVtZW50LiAqL1xyXG4gIHByaXZhdGUgX3JlbW92ZVJvb3RFbGVtZW50TGlzdGVuZXJzKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XHJcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX3BvaW50ZXJEb3duLCBhY3RpdmVFdmVudExpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9wb2ludGVyRG93biwgcGFzc2l2ZUV2ZW50TGlzdGVuZXJPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGxpZXMgYSBgdHJhbnNmb3JtYCB0byB0aGUgcm9vdCBlbGVtZW50LCB0YWtpbmcgaW50byBhY2NvdW50IGFueSBleGlzdGluZyB0cmFuc2Zvcm1zIG9uIGl0LlxyXG4gICAqIEBwYXJhbSB4IE5ldyB0cmFuc2Zvcm0gdmFsdWUgYWxvbmcgdGhlIFggYXhpcy5cclxuICAgKiBAcGFyYW0geSBOZXcgdHJhbnNmb3JtIHZhbHVlIGFsb25nIHRoZSBZIGF4aXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfYXBwbHlSb290RWxlbWVudFRyYW5zZm9ybSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgY29uc3QgdHJhbnNmb3JtID0gZ2V0VHJhbnNmb3JtKHgsIHkpO1xyXG5cclxuICAgIC8vIENhY2hlIHRoZSBwcmV2aW91cyB0cmFuc2Zvcm0gYW1vdW50IG9ubHkgYWZ0ZXIgdGhlIGZpcnN0IGRyYWcgc2VxdWVuY2UsIGJlY2F1c2VcclxuICAgIC8vIHdlIGRvbid0IHdhbnQgb3VyIG93biB0cmFuc2Zvcm1zIHRvIHN0YWNrIG9uIHRvcCBvZiBlYWNoIG90aGVyLlxyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxUcmFuc2Zvcm0gPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLl9pbml0aWFsVHJhbnNmb3JtID0gdGhpcy5fcm9vdEVsZW1lbnQuc3R5bGUudHJhbnNmb3JtIHx8ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByZXNlcnZlIHRoZSBwcmV2aW91cyBgdHJhbnNmb3JtYCB2YWx1ZSwgaWYgdGhlcmUgd2FzIG9uZS4gTm90ZSB0aGF0IHdlIGFwcGx5IG91ciBvd25cclxuICAgIC8vIHRyYW5zZm9ybSBiZWZvcmUgdGhlIHVzZXIncywgYmVjYXVzZSB0aGluZ3MgbGlrZSByb3RhdGlvbiBjYW4gYWZmZWN0IHdoaWNoIGRpcmVjdGlvblxyXG4gICAgLy8gdGhlIGVsZW1lbnQgd2lsbCBiZSB0cmFuc2xhdGVkIHRvd2FyZHMuXHJcbiAgICB0aGlzLl9yb290RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLl9pbml0aWFsVHJhbnNmb3JtID9cclxuICAgICAgdHJhbnNmb3JtICsgJyAnICsgdGhpcy5faW5pdGlhbFRyYW5zZm9ybSAgOiB0cmFuc2Zvcm07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBkaXN0YW5jZSB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkIGR1cmluZyB0aGUgY3VycmVudCBkcmFnIHNlcXVlbmNlLlxyXG4gICAqIEBwYXJhbSBjdXJyZW50UG9zaXRpb24gQ3VycmVudCBwb3NpdGlvbiBvZiB0aGUgdXNlcidzIHBvaW50ZXIuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfZ2V0RHJhZ0Rpc3RhbmNlKGN1cnJlbnRQb3NpdGlvbjogUG9pbnQpOiBQb2ludCB7XHJcbiAgICBjb25zdCBwaWNrdXBQb3NpdGlvbiA9IHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlO1xyXG5cclxuICAgIGlmIChwaWNrdXBQb3NpdGlvbikge1xyXG4gICAgICByZXR1cm4ge3g6IGN1cnJlbnRQb3NpdGlvbi54IC0gcGlja3VwUG9zaXRpb24ueCwgeTogY3VycmVudFBvc2l0aW9uLnkgLSBwaWNrdXBQb3NpdGlvbi55fTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge3g6IDAsIHk6IDB9O1xyXG4gIH1cclxuXHJcbiAgLyoqIENsZWFucyB1cCBhbnkgY2FjaGVkIGVsZW1lbnQgZGltZW5zaW9ucyB0aGF0IHdlIGRvbid0IG5lZWQgYWZ0ZXIgZHJhZ2dpbmcgaGFzIHN0b3BwZWQuICovXHJcbiAgcHJpdmF0ZSBfY2xlYW51cENhY2hlZERpbWVuc2lvbnMoKSB7XHJcbiAgICB0aGlzLl9ib3VuZGFyeVJlY3QgPSB0aGlzLl9wcmV2aWV3UmVjdCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuX3BhcmVudFBvc2l0aW9ucy5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgc3RpbGwgaW5zaWRlIGl0cyBib3VuZGFyeSBhZnRlciB0aGUgdmlld3BvcnQgaGFzIGJlZW4gcmVzaXplZC5cclxuICAgKiBJZiBub3QsIHRoZSBwb3NpdGlvbiBpcyBhZGp1c3RlZCBzbyB0aGF0IHRoZSBlbGVtZW50IGZpdHMgYWdhaW4uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY29udGFpbkluc2lkZUJvdW5kYXJ5T25SZXNpemUoKSB7XHJcbiAgICBsZXQge3gsIHl9ID0gdGhpcy5fcGFzc2l2ZVRyYW5zZm9ybTtcclxuXHJcbiAgICBpZiAoKHggPT09IDAgJiYgeSA9PT0gMCkgfHwgdGhpcy5pc0RyYWdnaW5nKCkgfHwgIXRoaXMuX2JvdW5kYXJ5RWxlbWVudCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYm91bmRhcnlSZWN0ID0gdGhpcy5fYm91bmRhcnlFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgY29uc3QgZWxlbWVudFJlY3QgPSB0aGlzLl9yb290RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhlIGVsZW1lbnQgZ290IGhpZGRlbiBhd2F5IGFmdGVyIGRyYWdnaW5nIChlLmcuIGJ5IHN3aXRjaGluZyB0byBhXHJcbiAgICAvLyBkaWZmZXJlbnQgdGFiKS4gRG9uJ3QgZG8gYW55dGhpbmcgaW4gdGhpcyBjYXNlIHNvIHdlIGRvbid0IGNsZWFyIHRoZSB1c2VyJ3MgcG9zaXRpb24uXHJcbiAgICBpZiAoKGJvdW5kYXJ5UmVjdC53aWR0aCA9PT0gMCAmJiBib3VuZGFyeVJlY3QuaGVpZ2h0ID09PSAwKSB8fFxyXG4gICAgICAgIChlbGVtZW50UmVjdC53aWR0aCA9PT0gMCAmJiBlbGVtZW50UmVjdC5oZWlnaHQgPT09IDApKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsZWZ0T3ZlcmZsb3cgPSBib3VuZGFyeVJlY3QubGVmdCAtIGVsZW1lbnRSZWN0LmxlZnQ7XHJcbiAgICBjb25zdCByaWdodE92ZXJmbG93ID0gZWxlbWVudFJlY3QucmlnaHQgLSBib3VuZGFyeVJlY3QucmlnaHQ7XHJcbiAgICBjb25zdCB0b3BPdmVyZmxvdyA9IGJvdW5kYXJ5UmVjdC50b3AgLSBlbGVtZW50UmVjdC50b3A7XHJcbiAgICBjb25zdCBib3R0b21PdmVyZmxvdyA9IGVsZW1lbnRSZWN0LmJvdHRvbSAtIGJvdW5kYXJ5UmVjdC5ib3R0b207XHJcblxyXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGJlY29tZSB3aWRlciB0aGFuIHRoZSBib3VuZGFyeSwgd2UgY2FuJ3RcclxuICAgIC8vIGRvIG11Y2ggdG8gbWFrZSBpdCBmaXQgc28gd2UganVzdCBhbmNob3IgaXQgdG8gdGhlIGxlZnQuXHJcbiAgICBpZiAoYm91bmRhcnlSZWN0LndpZHRoID4gZWxlbWVudFJlY3Qud2lkdGgpIHtcclxuICAgICAgaWYgKGxlZnRPdmVyZmxvdyA+IDApIHtcclxuICAgICAgICB4ICs9IGxlZnRPdmVyZmxvdztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHJpZ2h0T3ZlcmZsb3cgPiAwKSB7XHJcbiAgICAgICAgeCAtPSByaWdodE92ZXJmbG93O1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgYmVjb21lIHRhbGxlciB0aGFuIHRoZSBib3VuZGFyeSwgd2UgY2FuJ3RcclxuICAgIC8vIGRvIG11Y2ggdG8gbWFrZSBpdCBmaXQgc28gd2UganVzdCBhbmNob3IgaXQgdG8gdGhlIHRvcC5cclxuICAgIGlmIChib3VuZGFyeVJlY3QuaGVpZ2h0ID4gZWxlbWVudFJlY3QuaGVpZ2h0KSB7XHJcbiAgICAgIGlmICh0b3BPdmVyZmxvdyA+IDApIHtcclxuICAgICAgICB5ICs9IHRvcE92ZXJmbG93O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYm90dG9tT3ZlcmZsb3cgPiAwKSB7XHJcbiAgICAgICAgeSAtPSBib3R0b21PdmVyZmxvdztcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeSA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHggIT09IHRoaXMuX3Bhc3NpdmVUcmFuc2Zvcm0ueCB8fCB5ICE9PSB0aGlzLl9wYXNzaXZlVHJhbnNmb3JtLnkpIHtcclxuICAgICAgdGhpcy5zZXRGcmVlRHJhZ1Bvc2l0aW9uKHt5LCB4fSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgZHJhZyBzdGFydCBkZWxheSwgYmFzZWQgb24gdGhlIGV2ZW50IHR5cGUuICovXHJcbiAgcHJpdmF0ZSBfZ2V0RHJhZ1N0YXJ0RGVsYXkoZXZlbnQ6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KTogbnVtYmVyIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5kcmFnU3RhcnREZWxheTtcclxuXHJcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9IGVsc2UgaWYgKGlzVG91Y2hFdmVudChldmVudCkpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlLnRvdWNoO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLm1vdXNlIDogMDtcclxuICB9XHJcblxyXG4gIC8qKiBVcGRhdGVzIHRoZSBpbnRlcm5hbCBzdGF0ZSBvZiB0aGUgZHJhZ2dhYmxlIGVsZW1lbnQgd2hlbiBzY3JvbGxpbmcgaGFzIG9jY3VycmVkLiAqL1xyXG4gIHByaXZhdGUgX3VwZGF0ZU9uU2Nyb2xsKGV2ZW50OiBFdmVudCkge1xyXG4gICAgY29uc3Qgc2Nyb2xsRGlmZmVyZW5jZSA9IHRoaXMuX3BhcmVudFBvc2l0aW9ucy5oYW5kbGVTY3JvbGwoZXZlbnQpO1xyXG5cclxuICAgIGlmIChzY3JvbGxEaWZmZXJlbmNlKSB7XHJcbiAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldCBhcyBOb2RlO1xyXG5cclxuICAgICAgLy8gQ2xpZW50UmVjdCBkaW1lbnNpb25zIGFyZSBiYXNlZCBvbiB0aGUgc2Nyb2xsIHBvc2l0aW9uIG9mIHRoZSBwYWdlIGFuZCBpdHMgcGFyZW50IG5vZGUgc29cclxuICAgICAgLy8gd2UgaGF2ZSB0byB1cGRhdGUgdGhlIGNhY2hlZCBib3VuZGFyeSBDbGllbnRSZWN0IGlmIHRoZSB1c2VyIGhhcyBzY3JvbGxlZC4gQ2hlY2sgZm9yXHJcbiAgICAgIC8vIHRoZSBgZG9jdW1lbnRgIHNwZWNpZmljYWxseSBzaW5jZSBJRSBkb2Vzbid0IHN1cHBvcnQgYGNvbnRhaW5zYCBvbiBpdC5cclxuICAgICAgaWYgKHRoaXMuX2JvdW5kYXJ5UmVjdCAmJiAodGFyZ2V0ID09PSB0aGlzLl9kb2N1bWVudCB8fFxyXG4gICAgICAgICAgKHRhcmdldCAhPT0gdGhpcy5fYm91bmRhcnlFbGVtZW50ICYmIHRhcmdldC5jb250YWlucyh0aGlzLl9ib3VuZGFyeUVsZW1lbnQpKSkpIHtcclxuICAgICAgICBhZGp1c3RDbGllbnRSZWN0KHRoaXMuX2JvdW5kYXJ5UmVjdCwgc2Nyb2xsRGlmZmVyZW5jZS50b3AsIHNjcm9sbERpZmZlcmVuY2UubGVmdCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX3BpY2t1cFBvc2l0aW9uT25QYWdlLnggKz0gc2Nyb2xsRGlmZmVyZW5jZS5sZWZ0O1xyXG4gICAgICB0aGlzLl9waWNrdXBQb3NpdGlvbk9uUGFnZS55ICs9IHNjcm9sbERpZmZlcmVuY2UudG9wO1xyXG5cclxuICAgICAgLy8gSWYgd2UncmUgaW4gZnJlZSBkcmFnIG1vZGUsIHdlIGhhdmUgdG8gdXBkYXRlIHRoZSBhY3RpdmUgdHJhbnNmb3JtLCBiZWNhdXNlXHJcbiAgICAgIC8vIGl0IGlzbid0IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydCBsaWtlIHRoZSBwcmV2aWV3IGluc2lkZSBhIGRyb3AgbGlzdC5cclxuICAgICAgaWYgKCF0aGlzLl9kcm9wQ29udGFpbmVyKSB7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlVHJhbnNmb3JtLnggLT0gc2Nyb2xsRGlmZmVyZW5jZS5sZWZ0O1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS55IC09IHNjcm9sbERpZmZlcmVuY2UudG9wO1xyXG4gICAgICAgIHRoaXMuX2FwcGx5Um9vdEVsZW1lbnRUcmFuc2Zvcm0odGhpcy5fYWN0aXZlVHJhbnNmb3JtLngsIHRoaXMuX2FjdGl2ZVRyYW5zZm9ybS55KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIHNjcm9sbCBwb3NpdGlvbiBvZiB0aGUgdmlld3BvcnQuICovXHJcbiAgcHJpdmF0ZSBfZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpIHtcclxuICAgIGNvbnN0IGNhY2hlZFBvc2l0aW9uID0gdGhpcy5fcGFyZW50UG9zaXRpb25zLnBvc2l0aW9ucy5nZXQodGhpcy5fZG9jdW1lbnQpO1xyXG4gICAgcmV0dXJuIGNhY2hlZFBvc2l0aW9uID8gY2FjaGVkUG9zaXRpb24uc2Nyb2xsUG9zaXRpb24gOlxyXG4gICAgICAgIHRoaXMuX3ZpZXdwb3J0UnVsZXIuZ2V0Vmlld3BvcnRTY3JvbGxQb3NpdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGF6aWx5IHJlc29sdmVzIGFuZCByZXR1cm5zIHRoZSBzaGFkb3cgcm9vdCBvZiB0aGUgZWxlbWVudC4gV2UgZG8gdGhpcyBpbiBhIGZ1bmN0aW9uLCByYXRoZXJcclxuICAgKiB0aGFuIHNhdmluZyBpdCBpbiBwcm9wZXJ0eSBkaXJlY3RseSBvbiBpbml0LCBiZWNhdXNlIHdlIHdhbnQgdG8gcmVzb2x2ZSBpdCBhcyBsYXRlIGFzIHBvc3NpYmxlXHJcbiAgICogaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgdGhlIGVsZW1lbnQgaGFzIGJlZW4gbW92ZWQgaW50byB0aGUgc2hhZG93IERPTS4gRG9pbmcgaXQgaW5zaWRlIHRoZVxyXG4gICAqIGNvbnN0cnVjdG9yIG1pZ2h0IGJlIHRvbyBlYXJseSBpZiB0aGUgZWxlbWVudCBpcyBpbnNpZGUgb2Ygc29tZXRoaW5nIGxpa2UgYG5nRm9yYCBvciBgbmdJZmAuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfZ2V0U2hhZG93Um9vdCgpOiBTaGFkb3dSb290IHwgbnVsbCB7XHJcbiAgICBpZiAodGhpcy5fY2FjaGVkU2hhZG93Um9vdCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuX2NhY2hlZFNoYWRvd1Jvb3QgPSBfZ2V0U2hhZG93Um9vdCh0aGlzLl9yb290RWxlbWVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZFNoYWRvd1Jvb3Q7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIDNkIGB0cmFuc2Zvcm1gIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gYW4gZWxlbWVudC5cclxuICogQHBhcmFtIHggRGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCBhbG9uZyB0aGUgWCBheGlzLlxyXG4gKiBAcGFyYW0geSBEZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50IGFsb25nIHRoZSBZIGF4aXMuXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRUcmFuc2Zvcm0oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xyXG4gIC8vIFJvdW5kIHRoZSB0cmFuc2Zvcm1zIHNpbmNlIHNvbWUgYnJvd3NlcnMgd2lsbFxyXG4gIC8vIGJsdXIgdGhlIGVsZW1lbnRzIGZvciBzdWItcGl4ZWwgdHJhbnNmb3Jtcy5cclxuICByZXR1cm4gYHRyYW5zbGF0ZTNkKCR7TWF0aC5yb3VuZCh4KX1weCwgJHtNYXRoLnJvdW5kKHkpfXB4LCAwKWA7XHJcbn1cclxuXHJcbi8qKiBDbGFtcHMgYSB2YWx1ZSBiZXR3ZWVuIGEgbWluaW11bSBhbmQgYSBtYXhpbXVtLiAqL1xyXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcclxuICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBIZWxwZXIgdG8gcmVtb3ZlIGEgbm9kZSBmcm9tIHRoZSBET00gYW5kIHRvIGRvIGFsbCB0aGUgbmVjZXNzYXJ5IG51bGwgY2hlY2tzLlxyXG4gKiBAcGFyYW0gbm9kZSBOb2RlIHRvIGJlIHJlbW92ZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiByZW1vdmVOb2RlKG5vZGU6IE5vZGUgfCBudWxsKSB7XHJcbiAgaWYgKG5vZGUgJiYgbm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuIGV2ZW50IGlzIGEgdG91Y2ggZXZlbnQuICovXHJcbmZ1bmN0aW9uIGlzVG91Y2hFdmVudChldmVudDogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpOiBldmVudCBpcyBUb3VjaEV2ZW50IHtcclxuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBmb3IgZXZlcnkgcGl4ZWwgdGhhdCB0aGUgdXNlciBoYXMgZHJhZ2dlZCBzbyB3ZSBuZWVkIGl0IHRvIGJlXHJcbiAgLy8gYXMgZmFzdCBhcyBwb3NzaWJsZS4gU2luY2Ugd2Ugb25seSBiaW5kIG1vdXNlIGV2ZW50cyBhbmQgdG91Y2ggZXZlbnRzLCB3ZSBjYW4gYXNzdW1lXHJcbiAgLy8gdGhhdCBpZiB0aGUgZXZlbnQncyBuYW1lIHN0YXJ0cyB3aXRoIGB0YCwgaXQncyBhIHRvdWNoIGV2ZW50LlxyXG4gIHJldHVybiBldmVudC50eXBlWzBdID09PSAndCc7XHJcbn1cclxuXHJcbi8qKiBHZXRzIHRoZSBlbGVtZW50IGludG8gd2hpY2ggdGhlIGRyYWcgcHJldmlldyBzaG91bGQgYmUgaW5zZXJ0ZWQuICovXHJcbmZ1bmN0aW9uIGdldFByZXZpZXdJbnNlcnRpb25Qb2ludChkb2N1bWVudFJlZjogYW55LCBzaGFkb3dSb290OiBTaGFkb3dSb290IHwgbnVsbCk6IEhUTUxFbGVtZW50IHtcclxuICAvLyBXZSBjYW4ndCB1c2UgdGhlIGJvZHkgaWYgdGhlIHVzZXIgaXMgaW4gZnVsbHNjcmVlbiBtb2RlLFxyXG4gIC8vIGJlY2F1c2UgdGhlIHByZXZpZXcgd2lsbCByZW5kZXIgdW5kZXIgdGhlIGZ1bGxzY3JlZW4gZWxlbWVudC5cclxuICAvLyBUT0RPKGNyaXNiZXRvKTogZGVkdXBlIHRoaXMgd2l0aCB0aGUgYEZ1bGxzY3JlZW5PdmVybGF5Q29udGFpbmVyYCBldmVudHVhbGx5LlxyXG4gIHJldHVybiBzaGFkb3dSb290IHx8XHJcbiAgICAgICAgIGRvY3VtZW50UmVmLmZ1bGxzY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgIGRvY3VtZW50UmVmLndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgIGRvY3VtZW50UmVmLm1vekZ1bGxTY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgIGRvY3VtZW50UmVmLm1zRnVsbHNjcmVlbkVsZW1lbnQgfHxcclxuICAgICAgICAgZG9jdW1lbnRSZWYuYm9keTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHJvb3QgSFRNTCBlbGVtZW50IG9mIGFuIGVtYmVkZGVkIHZpZXcuXHJcbiAqIElmIHRoZSByb290IGlzIG5vdCBhbiBIVE1MIGVsZW1lbnQgaXQgZ2V0cyB3cmFwcGVkIGluIG9uZS5cclxuICovXHJcbmZ1bmN0aW9uIGdldFJvb3ROb2RlKHZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxhbnk+LCBfZG9jdW1lbnQ6IERvY3VtZW50KTogSFRNTEVsZW1lbnQge1xyXG4gIGNvbnN0IHJvb3ROb2RlczogTm9kZVtdID0gdmlld1JlZi5yb290Tm9kZXM7XHJcblxyXG4gIGlmIChyb290Tm9kZXMubGVuZ3RoID09PSAxICYmIHJvb3ROb2Rlc1swXS5ub2RlVHlwZSA9PT0gX2RvY3VtZW50LkVMRU1FTlRfTk9ERSkge1xyXG4gICAgcmV0dXJuIHJvb3ROb2Rlc1swXSBhcyBIVE1MRWxlbWVudDtcclxuICB9XHJcblxyXG4gIGNvbnN0IHdyYXBwZXIgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgcm9vdE5vZGVzLmZvckVhY2gobm9kZSA9PiB3cmFwcGVyLmFwcGVuZENoaWxkKG5vZGUpKTtcclxuICByZXR1cm4gd3JhcHBlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hdGNoZXMgdGhlIHRhcmdldCBlbGVtZW50J3Mgc2l6ZSB0byB0aGUgc291cmNlJ3Mgc2l6ZS5cclxuICogQHBhcmFtIHRhcmdldCBFbGVtZW50IHRoYXQgbmVlZHMgdG8gYmUgcmVzaXplZC5cclxuICogQHBhcmFtIHNvdXJjZVJlY3QgRGltZW5zaW9ucyBvZiB0aGUgc291cmNlIGVsZW1lbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBtYXRjaEVsZW1lbnRTaXplKHRhcmdldDogSFRNTEVsZW1lbnQsIHNvdXJjZVJlY3Q6IENsaWVudFJlY3QpOiB2b2lkIHtcclxuICB0YXJnZXQuc3R5bGUud2lkdGggPSBgJHtzb3VyY2VSZWN0LndpZHRofXB4YDtcclxuICB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gYCR7c291cmNlUmVjdC5oZWlnaHR9cHhgO1xyXG4gIHRhcmdldC5zdHlsZS50cmFuc2Zvcm0gPSBnZXRUcmFuc2Zvcm0oc291cmNlUmVjdC5sZWZ0LCBzb3VyY2VSZWN0LnRvcCk7XHJcbn1cclxuIl19