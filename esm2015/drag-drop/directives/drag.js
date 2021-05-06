/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, Inject, Input, NgZone, Optional, Output, QueryList, SkipSelf, ViewContainerRef, ChangeDetectorRef, Self, } from '@angular/core';
import { coerceBooleanProperty, coerceNumberProperty, coerceElement } from '@angular/cdk/coercion';
import { Observable, Subject, merge } from 'rxjs';
import { startWith, take, map, takeUntil, switchMap, tap } from 'rxjs/operators';
import { CDK_DRAG_HANDLE, CdkDragHandle } from './drag-handle';
import { CDK_DRAG_PLACEHOLDER, CdkDragPlaceholder } from './drag-placeholder';
import { CDK_DRAG_PREVIEW, CdkDragPreview } from './drag-preview';
import { CDK_DRAG_PARENT } from '../drag-parent';
import { CDK_DROP_LIST } from './drop-list';
import { DragDrop } from '../drag-drop';
import { CDK_DRAG_CONFIG } from './config';
import { assertElementNode } from './assertions';
const DRAG_HOST_CLASS = 'cdk-drag';
/** Element that can be moved inside a CdkDropList container. */
export class CdkDrag {
    constructor(
    /** Element that the draggable is attached to. */
    element, 
    /** Droppable container that the draggable is a part of. */
    dropContainer, 
    /**
     * @deprecated `_document` parameter no longer being used and will be removed.
     * @breaking-change 12.0.0
     */
    _document, _ngZone, _viewContainerRef, config, _dir, dragDrop, _changeDetectorRef, _selfHandle, _parentDrag) {
        this.element = element;
        this.dropContainer = dropContainer;
        this._ngZone = _ngZone;
        this._viewContainerRef = _viewContainerRef;
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._selfHandle = _selfHandle;
        this._parentDrag = _parentDrag;
        this._destroyed = new Subject();
        /** Emits when the user starts dragging the item. */
        this.started = new EventEmitter();
        /** Emits when the user has released a drag item, before any animations have started. */
        this.released = new EventEmitter();
        /** Emits when the user stops dragging an item in the container. */
        this.ended = new EventEmitter();
        /** Emits when the user has moved the item into a new container. */
        this.entered = new EventEmitter();
        /** Emits when the user removes the item its container by dragging it into another container. */
        this.exited = new EventEmitter();
        /** Emits when the user drops the item inside a container. */
        this.dropped = new EventEmitter();
        /**
         * Emits as the user is dragging the item. Use with caution,
         * because this event will fire for every pixel that the user has dragged.
         */
        this.moved = new Observable((observer) => {
            const subscription = this._dragRef.moved.pipe(map(movedEvent => ({
                source: this,
                pointerPosition: movedEvent.pointerPosition,
                event: movedEvent.event,
                delta: movedEvent.delta,
                distance: movedEvent.distance
            }))).subscribe(observer);
            return () => {
                subscription.unsubscribe();
            };
        });
        this._dragRef = dragDrop.createDrag(element, {
            dragStartThreshold: config && config.dragStartThreshold != null ?
                config.dragStartThreshold : 5,
            pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ?
                config.pointerDirectionChangeThreshold : 5,
            zIndex: config === null || config === void 0 ? void 0 : config.zIndex,
        });
        this._dragRef.data = this;
        // We have to keep track of the drag instances in order to be able to match an element to
        // a drag instance. We can't go through the global registry of `DragRef`, because the root
        // element could be different.
        CdkDrag._dragInstances.push(this);
        if (config) {
            this._assignDefaults(config);
        }
        // Note that usually the container is assigned when the drop list is picks up the item, but in
        // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
        // where there are no items on the first change detection pass, but the items get picked up as
        // soon as the user triggers another pass by dragging. This is a problem, because the item would
        // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
        // is too late since the two modes save different kinds of information. We work around it by
        // assigning the drop container both from here and the list.
        if (dropContainer) {
            this._dragRef._withDropContainer(dropContainer._dropListRef);
            dropContainer.addItem(this);
        }
        this._syncInputs(this._dragRef);
        this._handleEvents(this._dragRef);
    }
    /** Whether starting to drag this element is disabled. */
    get disabled() {
        return this._disabled || (this.dropContainer && this.dropContainer.disabled);
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this._dragRef.disabled = this._disabled;
    }
    /**
     * Returns the element that is being used as a placeholder
     * while the current element is being dragged.
     */
    getPlaceholderElement() {
        return this._dragRef.getPlaceholderElement();
    }
    /** Returns the root draggable element. */
    getRootElement() {
        return this._dragRef.getRootElement();
    }
    /** Resets a standalone drag item to its initial position. */
    reset() {
        this._dragRef.reset();
    }
    /**
     * Gets the pixel coordinates of the draggable outside of a drop container.
     */
    getFreeDragPosition() {
        return this._dragRef.getFreeDragPosition();
    }
    ngAfterViewInit() {
        // We need to wait for the zone to stabilize, in order for the reference
        // element to be in the proper place in the DOM. This is mostly relevant
        // for draggable elements inside portals since they get stamped out in
        // their original DOM position and then they get transferred to the portal.
        this._ngZone.onStable
            .pipe(take(1), takeUntil(this._destroyed))
            .subscribe(() => {
            this._updateRootElement();
            // Listen for any newly-added handles.
            this._handles.changes.pipe(startWith(this._handles), 
            // Sync the new handles with the DragRef.
            tap((handles) => {
                const childHandleElements = handles
                    .filter(handle => handle._parentDrag === this)
                    .map(handle => handle.element);
                // Usually handles are only allowed to be a descendant of the drag element, but if
                // the consumer defined a different drag root, we should allow the drag element
                // itself to be a handle too.
                if (this._selfHandle && this.rootElementSelector) {
                    childHandleElements.push(this.element);
                }
                this._dragRef.withHandles(childHandleElements);
            }), 
            // Listen if the state of any of the handles changes.
            switchMap((handles) => {
                return merge(...handles.map(item => {
                    return item._stateChanges.pipe(startWith(item));
                }));
            }), takeUntil(this._destroyed)).subscribe(handleInstance => {
                // Enabled/disable the handle that changed in the DragRef.
                const dragRef = this._dragRef;
                const handle = handleInstance.element.nativeElement;
                handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
            });
            if (this.freeDragPosition) {
                this._dragRef.setFreeDragPosition(this.freeDragPosition);
            }
        });
    }
    ngOnChanges(changes) {
        const rootSelectorChange = changes['rootElementSelector'];
        const positionChange = changes['freeDragPosition'];
        // We don't have to react to the first change since it's being
        // handled in `ngAfterViewInit` where it needs to be deferred.
        if (rootSelectorChange && !rootSelectorChange.firstChange) {
            this._updateRootElement();
        }
        // Skip the first change since it's being handled in `ngAfterViewInit`.
        if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
            this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
    }
    ngOnDestroy() {
        if (this.dropContainer) {
            this.dropContainer.removeItem(this);
        }
        const index = CdkDrag._dragInstances.indexOf(this);
        if (index > -1) {
            CdkDrag._dragInstances.splice(index, 1);
        }
        this._destroyed.next();
        this._destroyed.complete();
        this._dragRef.dispose();
    }
    /** Syncs the root element with the `DragRef`. */
    _updateRootElement() {
        const element = this.element.nativeElement;
        const rootElement = this.rootElementSelector ?
            getClosestMatchingAncestor(element, this.rootElementSelector) : element;
        if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            assertElementNode(rootElement, 'cdkDrag');
        }
        this._dragRef.withRootElement(rootElement || element);
    }
    /** Gets the boundary element, based on the `boundaryElement` value. */
    _getBoundaryElement() {
        const boundary = this.boundaryElement;
        if (!boundary) {
            return null;
        }
        if (typeof boundary === 'string') {
            return getClosestMatchingAncestor(this.element.nativeElement, boundary);
        }
        const element = coerceElement(boundary);
        if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
            !element.contains(this.element.nativeElement)) {
            throw Error('Draggable element is not inside of the node passed into cdkDragBoundary.');
        }
        return element;
    }
    /** Syncs the inputs of the CdkDrag with the options of the underlying DragRef. */
    _syncInputs(ref) {
        ref.beforeStarted.subscribe(() => {
            if (!ref.isDragging()) {
                const dir = this._dir;
                const dragStartDelay = this.dragStartDelay;
                const placeholder = this._placeholderTemplate ? {
                    template: this._placeholderTemplate.templateRef,
                    context: this._placeholderTemplate.data,
                    viewContainer: this._viewContainerRef
                } : null;
                const preview = this._previewTemplate ? {
                    template: this._previewTemplate.templateRef,
                    context: this._previewTemplate.data,
                    matchSize: this._previewTemplate.matchSize,
                    viewContainer: this._viewContainerRef
                } : null;
                ref.disabled = this.disabled;
                ref.lockAxis = this.lockAxis;
                ref.dragStartDelay = (typeof dragStartDelay === 'object' && dragStartDelay) ?
                    dragStartDelay : coerceNumberProperty(dragStartDelay);
                ref.constrainPosition = this.constrainPosition;
                ref.previewClass = this.previewClass;
                ref
                    .withBoundaryElement(this._getBoundaryElement())
                    .withPlaceholderTemplate(placeholder)
                    .withPreviewTemplate(preview);
                if (dir) {
                    ref.withDirection(dir.value);
                }
            }
        });
        // This only needs to be resolved once.
        ref.beforeStarted.pipe(take(1)).subscribe(() => {
            var _a, _b;
            // If we managed to resolve a parent through DI, use it.
            if (this._parentDrag) {
                ref.withParent(this._parentDrag._dragRef);
                return;
            }
            // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
            // the item was projected into another item by something like `ngTemplateOutlet`.
            let parent = this.element.nativeElement.parentElement;
            while (parent) {
                // `classList` needs to be null checked, because IE doesn't have it on some elements.
                if ((_a = parent.classList) === null || _a === void 0 ? void 0 : _a.contains(DRAG_HOST_CLASS)) {
                    ref.withParent(((_b = CdkDrag._dragInstances.find(drag => {
                        return drag.element.nativeElement === parent;
                    })) === null || _b === void 0 ? void 0 : _b._dragRef) || null);
                    break;
                }
                parent = parent.parentElement;
            }
        });
    }
    /** Handles the events from the underlying `DragRef`. */
    _handleEvents(ref) {
        ref.started.subscribe(() => {
            this.started.emit({ source: this });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.released.subscribe(() => {
            this.released.emit({ source: this });
        });
        ref.ended.subscribe(event => {
            this.ended.emit({ source: this, distance: event.distance });
            // Since all of these events run outside of change detection,
            // we need to ensure that everything is marked correctly.
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(event => {
            this.entered.emit({
                container: event.container.data,
                item: this,
                currentIndex: event.currentIndex
            });
        });
        ref.exited.subscribe(event => {
            this.exited.emit({
                container: event.container.data,
                item: this
            });
        });
        ref.dropped.subscribe(event => {
            this.dropped.emit({
                previousIndex: event.previousIndex,
                currentIndex: event.currentIndex,
                previousContainer: event.previousContainer.data,
                container: event.container.data,
                isPointerOverContainer: event.isPointerOverContainer,
                item: this,
                distance: event.distance
            });
        });
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, dragStartDelay, constrainPosition, previewClass, boundaryElement, draggingDisabled, rootElementSelector } = config;
        this.disabled = draggingDisabled == null ? false : draggingDisabled;
        this.dragStartDelay = dragStartDelay || 0;
        if (lockAxis) {
            this.lockAxis = lockAxis;
        }
        if (constrainPosition) {
            this.constrainPosition = constrainPosition;
        }
        if (previewClass) {
            this.previewClass = previewClass;
        }
        if (boundaryElement) {
            this.boundaryElement = boundaryElement;
        }
        if (rootElementSelector) {
            this.rootElementSelector = rootElementSelector;
        }
    }
}
CdkDrag._dragInstances = [];
CdkDrag.decorators = [
    { type: Directive, args: [{
                selector: '[cdkDrag]',
                exportAs: 'cdkDrag',
                host: {
                    'class': DRAG_HOST_CLASS,
                    '[class.cdk-drag-disabled]': 'disabled',
                    '[class.cdk-drag-dragging]': '_dragRef.isDragging()',
                },
                providers: [{ provide: CDK_DRAG_PARENT, useExisting: CdkDrag }]
            },] }
];
CdkDrag.ctorParameters = () => [
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_DROP_LIST,] }, { type: Optional }, { type: SkipSelf }] },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: NgZone },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CDK_DRAG_CONFIG,] }] },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: DragDrop },
    { type: ChangeDetectorRef },
    { type: CdkDragHandle, decorators: [{ type: Optional }, { type: Self }, { type: Inject, args: [CDK_DRAG_HANDLE,] }] },
    { type: CdkDrag, decorators: [{ type: Optional }, { type: SkipSelf }, { type: Inject, args: [CDK_DRAG_PARENT,] }] }
];
CdkDrag.propDecorators = {
    _handles: [{ type: ContentChildren, args: [CDK_DRAG_HANDLE, { descendants: true },] }],
    _previewTemplate: [{ type: ContentChild, args: [CDK_DRAG_PREVIEW,] }],
    _placeholderTemplate: [{ type: ContentChild, args: [CDK_DRAG_PLACEHOLDER,] }],
    data: [{ type: Input, args: ['cdkDragData',] }],
    lockAxis: [{ type: Input, args: ['cdkDragLockAxis',] }],
    rootElementSelector: [{ type: Input, args: ['cdkDragRootElement',] }],
    boundaryElement: [{ type: Input, args: ['cdkDragBoundary',] }],
    dragStartDelay: [{ type: Input, args: ['cdkDragStartDelay',] }],
    freeDragPosition: [{ type: Input, args: ['cdkDragFreeDragPosition',] }],
    disabled: [{ type: Input, args: ['cdkDragDisabled',] }],
    constrainPosition: [{ type: Input, args: ['cdkDragConstrainPosition',] }],
    previewClass: [{ type: Input, args: ['cdkDragPreviewClass',] }],
    started: [{ type: Output, args: ['cdkDragStarted',] }],
    released: [{ type: Output, args: ['cdkDragReleased',] }],
    ended: [{ type: Output, args: ['cdkDragEnded',] }],
    entered: [{ type: Output, args: ['cdkDragEntered',] }],
    exited: [{ type: Output, args: ['cdkDragExited',] }],
    dropped: [{ type: Output, args: ['cdkDragDropped',] }],
    moved: [{ type: Output, args: ['cdkDragMoved',] }]
};
/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element, selector) {
    let currentElement = element.parentElement;
    while (currentElement) {
        // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
        if (currentElement.matches ? currentElement.matches(selector) :
            currentElement.msMatchesSelector(selector)) {
            return currentElement;
        }
        currentElement = currentElement.parentElement;
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RpcmVjdGl2ZXMvZHJhZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCxZQUFZLEVBQ1osZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixLQUFLLEVBQ0wsTUFBTSxFQUVOLFFBQVEsRUFDUixNQUFNLEVBQ04sU0FBUyxFQUNULFFBQVEsRUFDUixnQkFBZ0IsRUFHaEIsaUJBQWlCLEVBQ2pCLElBQUksR0FDTCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixhQUFhLEVBRWQsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQUMsVUFBVSxFQUFZLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUQsT0FBTyxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFVL0UsT0FBTyxFQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDNUUsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ2hFLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQyxPQUFPLEVBQUMsYUFBYSxFQUFxQyxNQUFNLGFBQWEsQ0FBQztB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QkFPdkIsTUFBTSxTQUFDLGNBQWM7O0FBMFZ4Qix1RUFBdUU7QUFDdkUsU0FBUywwQkFBMEIsQ0FBQyxPQUFvQixFQUFFLFFBQWdCO0lBQ3hFLElBQUksY0FBYyxHQUFHLE9BQU8sQ0FBQyxhQUFtQyxDQUFDO0lBRWpFLE9BQU8sY0FBYyxFQUFFO1FBQ3JCLCtFQUErRTtRQUMvRSxJQUFJLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRCxjQUFzQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZELE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBRUQsY0FBYyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUM7S0FDL0M7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIENvbnRlbnRDaGlsZCxcclxuICBDb250ZW50Q2hpbGRyZW4sXHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEluamVjdCxcclxuICBJbnB1dCxcclxuICBOZ1pvbmUsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9wdGlvbmFsLFxyXG4gIE91dHB1dCxcclxuICBRdWVyeUxpc3QsXHJcbiAgU2tpcFNlbGYsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBPbkNoYW5nZXMsXHJcbiAgU2ltcGxlQ2hhbmdlcyxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBTZWxmLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1xyXG4gIGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSxcclxuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcclxuICBjb2VyY2VFbGVtZW50LFxyXG4gIEJvb2xlYW5JbnB1dFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXIsIFN1YmplY3QsIG1lcmdlfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtzdGFydFdpdGgsIHRha2UsIG1hcCwgdGFrZVVudGlsLCBzd2l0Y2hNYXAsIHRhcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1xyXG4gIENka0RyYWdEcm9wLFxyXG4gIENka0RyYWdFbmQsXHJcbiAgQ2RrRHJhZ0VudGVyLFxyXG4gIENka0RyYWdFeGl0LFxyXG4gIENka0RyYWdNb3ZlLFxyXG4gIENka0RyYWdTdGFydCxcclxuICBDZGtEcmFnUmVsZWFzZSxcclxufSBmcm9tICcuLi9kcmFnLWV2ZW50cyc7XHJcbmltcG9ydCB7Q0RLX0RSQUdfSEFORExFLCBDZGtEcmFnSGFuZGxlfSBmcm9tICcuL2RyYWctaGFuZGxlJztcclxuaW1wb3J0IHtDREtfRFJBR19QTEFDRUhPTERFUiwgQ2RrRHJhZ1BsYWNlaG9sZGVyfSBmcm9tICcuL2RyYWctcGxhY2Vob2xkZXInO1xyXG5pbXBvcnQge0NES19EUkFHX1BSRVZJRVcsIENka0RyYWdQcmV2aWV3fSBmcm9tICcuL2RyYWctcHJldmlldyc7XHJcbmltcG9ydCB7Q0RLX0RSQUdfUEFSRU5UfSBmcm9tICcuLi9kcmFnLXBhcmVudCc7XHJcbmltcG9ydCB7RHJhZ1JlZiwgUG9pbnR9IGZyb20gJy4uL2RyYWctcmVmJztcclxuaW1wb3J0IHtDREtfRFJPUF9MSVNULCBDZGtEcm9wTGlzdEludGVybmFsIGFzIENka0Ryb3BMaXN0fSBmcm9tICcuL2Ryb3AtbGlzdCc7XHJcbmltcG9ydCB7RHJhZ0Ryb3B9IGZyb20gJy4uL2RyYWctZHJvcCc7XHJcbmltcG9ydCB7Q0RLX0RSQUdfQ09ORklHLCBEcmFnRHJvcENvbmZpZywgRHJhZ1N0YXJ0RGVsYXksIERyYWdBeGlzfSBmcm9tICcuL2NvbmZpZyc7XHJcbmltcG9ydCB7YXNzZXJ0RWxlbWVudE5vZGV9IGZyb20gJy4vYXNzZXJ0aW9ucyc7XHJcblxyXG5jb25zdCBEUkFHX0hPU1RfQ0xBU1MgPSAnY2RrLWRyYWcnO1xyXG5cclxuLyoqIEVsZW1lbnQgdGhhdCBjYW4gYmUgbW92ZWQgaW5zaWRlIGEgQ2RrRHJvcExpc3QgY29udGFpbmVyLiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtEcmFnXScsXHJcbiAgZXhwb3J0QXM6ICdjZGtEcmFnJyxcclxuICBob3N0OiB7XHJcbiAgICAnY2xhc3MnOiBEUkFHX0hPU1RfQ0xBU1MsXHJcbiAgICAnW2NsYXNzLmNkay1kcmFnLWRpc2FibGVkXSc6ICdkaXNhYmxlZCcsXHJcbiAgICAnW2NsYXNzLmNkay1kcmFnLWRyYWdnaW5nXSc6ICdfZHJhZ1JlZi5pc0RyYWdnaW5nKCknLFxyXG4gIH0sXHJcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19EUkFHX1BBUkVOVCwgdXNlRXhpc3Rpbmc6IENka0RyYWd9XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrRHJhZzxUID0gYW55PiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcclxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG4gIHByaXZhdGUgc3RhdGljIF9kcmFnSW5zdGFuY2VzOiBDZGtEcmFnW10gPSBbXTtcclxuXHJcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgdW5kZXJseWluZyBkcmFnIGluc3RhbmNlLiAqL1xyXG4gIF9kcmFnUmVmOiBEcmFnUmVmPENka0RyYWc8VD4+O1xyXG5cclxuICAvKiogRWxlbWVudHMgdGhhdCBjYW4gYmUgdXNlZCB0byBkcmFnIHRoZSBkcmFnZ2FibGUgaXRlbS4gKi9cclxuICBAQ29udGVudENoaWxkcmVuKENES19EUkFHX0hBTkRMRSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgX2hhbmRsZXM6IFF1ZXJ5TGlzdDxDZGtEcmFnSGFuZGxlPjtcclxuXHJcbiAgLyoqIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHVzZWQgYXMgYSB0ZW1wbGF0ZSB0byBjcmVhdGUgdGhlIGRyYWdnYWJsZSBpdGVtJ3MgcHJldmlldy4gKi9cclxuICBAQ29udGVudENoaWxkKENES19EUkFHX1BSRVZJRVcpIF9wcmV2aWV3VGVtcGxhdGU6IENka0RyYWdQcmV2aWV3O1xyXG5cclxuICAvKiogVGVtcGxhdGUgZm9yIHBsYWNlaG9sZGVyIGVsZW1lbnQgcmVuZGVyZWQgdG8gc2hvdyB3aGVyZSBhIGRyYWdnYWJsZSB3b3VsZCBiZSBkcm9wcGVkLiAqL1xyXG4gIEBDb250ZW50Q2hpbGQoQ0RLX0RSQUdfUExBQ0VIT0xERVIpIF9wbGFjZWhvbGRlclRlbXBsYXRlOiBDZGtEcmFnUGxhY2Vob2xkZXI7XHJcblxyXG4gIC8qKiBBcmJpdHJhcnkgZGF0YSB0byBhdHRhY2ggdG8gdGhpcyBkcmFnIGluc3RhbmNlLiAqL1xyXG4gIEBJbnB1dCgnY2RrRHJhZ0RhdGEnKSBkYXRhOiBUO1xyXG5cclxuICAvKiogTG9ja3MgdGhlIHBvc2l0aW9uIG9mIHRoZSBkcmFnZ2VkIGVsZW1lbnQgYWxvbmcgdGhlIHNwZWNpZmllZCBheGlzLiAqL1xyXG4gIEBJbnB1dCgnY2RrRHJhZ0xvY2tBeGlzJykgbG9ja0F4aXM6IERyYWdBeGlzO1xyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3RvciB0aGF0IHdpbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIHJvb3QgZHJhZ2dhYmxlIGVsZW1lbnQsIHN0YXJ0aW5nIGZyb21cclxuICAgKiB0aGUgYGNka0RyYWdgIGVsZW1lbnQgYW5kIGdvaW5nIHVwIHRoZSBET00uIFBhc3NpbmcgYW4gYWx0ZXJuYXRlIHJvb3QgZWxlbWVudCBpcyB1c2VmdWxcclxuICAgKiB3aGVuIHRyeWluZyB0byBlbmFibGUgZHJhZ2dpbmcgb24gYW4gZWxlbWVudCB0aGF0IHlvdSBtaWdodCBub3QgaGF2ZSBhY2Nlc3MgdG8uXHJcbiAgICovXHJcbiAgQElucHV0KCdjZGtEcmFnUm9vdEVsZW1lbnQnKSByb290RWxlbWVudFNlbGVjdG9yOiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIE5vZGUgb3Igc2VsZWN0b3IgdGhhdCB3aWxsIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBlbGVtZW50IHRvIHdoaWNoIHRoZSBkcmFnZ2FibGUnc1xyXG4gICAqIHBvc2l0aW9uIHdpbGwgYmUgY29uc3RyYWluZWQuIElmIGEgc3RyaW5nIGlzIHBhc3NlZCBpbiwgaXQnbGwgYmUgdXNlZCBhcyBhIHNlbGVjdG9yIHRoYXRcclxuICAgKiB3aWxsIGJlIG1hdGNoZWQgc3RhcnRpbmcgZnJvbSB0aGUgZWxlbWVudCdzIHBhcmVudCBhbmQgZ29pbmcgdXAgdGhlIERPTSB1bnRpbCBhIG1hdGNoXHJcbiAgICogaGFzIGJlZW4gZm91bmQuXHJcbiAgICovXHJcbiAgQElucHV0KCdjZGtEcmFnQm91bmRhcnknKSBib3VuZGFyeUVsZW1lbnQ6IHN0cmluZyB8IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHwgSFRNTEVsZW1lbnQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFtb3VudCBvZiBtaWxsaXNlY29uZHMgdG8gd2FpdCBhZnRlciB0aGUgdXNlciBoYXMgcHV0IHRoZWlyXHJcbiAgICogcG9pbnRlciBkb3duIGJlZm9yZSBzdGFydGluZyB0byBkcmFnIHRoZSBlbGVtZW50LlxyXG4gICAqL1xyXG4gIEBJbnB1dCgnY2RrRHJhZ1N0YXJ0RGVsYXknKSBkcmFnU3RhcnREZWxheTogRHJhZ1N0YXJ0RGVsYXk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIGEgYENka0RyYWdgIHRoYXQgaXMgb3V0c2lkZSBvZiBhIGRyb3AgY29udGFpbmVyLlxyXG4gICAqIENhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIGVsZW1lbnQncyBwb3NpdGlvbiBmb3IgYSByZXR1cm5pbmcgdXNlci5cclxuICAgKi9cclxuICBASW5wdXQoJ2Nka0RyYWdGcmVlRHJhZ1Bvc2l0aW9uJykgZnJlZURyYWdQb3NpdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgc3RhcnRpbmcgdG8gZHJhZyB0aGlzIGVsZW1lbnQgaXMgZGlzYWJsZWQuICovXHJcbiAgQElucHV0KCdjZGtEcmFnRGlzYWJsZWQnKVxyXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAodGhpcy5kcm9wQ29udGFpbmVyICYmIHRoaXMuZHJvcENvbnRhaW5lci5kaXNhYmxlZCk7XHJcbiAgfVxyXG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gICAgdGhpcy5fZHJhZ1JlZi5kaXNhYmxlZCA9IHRoaXMuX2Rpc2FibGVkO1xyXG4gIH1cclxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjdXN0b21pemUgdGhlIGxvZ2ljIG9mIGhvdyB0aGUgcG9zaXRpb24gb2YgdGhlIGRyYWcgaXRlbVxyXG4gICAqIGlzIGxpbWl0ZWQgd2hpbGUgaXQncyBiZWluZyBkcmFnZ2VkLiBHZXRzIGNhbGxlZCB3aXRoIGEgcG9pbnQgY29udGFpbmluZyB0aGUgY3VycmVudCBwb3NpdGlvblxyXG4gICAqIG9mIHRoZSB1c2VyJ3MgcG9pbnRlciBvbiB0aGUgcGFnZSBhbmQgc2hvdWxkIHJldHVybiBhIHBvaW50IGRlc2NyaWJpbmcgd2hlcmUgdGhlIGl0ZW0gc2hvdWxkXHJcbiAgICogYmUgcmVuZGVyZWQuXHJcbiAgICovXHJcbiAgQElucHV0KCdjZGtEcmFnQ29uc3RyYWluUG9zaXRpb24nKSBjb25zdHJhaW5Qb3NpdGlvbj86IChwb2ludDogUG9pbnQsIGRyYWdSZWY6IERyYWdSZWYpID0+IFBvaW50O1xyXG5cclxuICAvKiogQ2xhc3MgdG8gYmUgYWRkZWQgdG8gdGhlIHByZXZpZXcgZWxlbWVudC4gKi9cclxuICBASW5wdXQoJ2Nka0RyYWdQcmV2aWV3Q2xhc3MnKSBwcmV2aWV3Q2xhc3M6IHN0cmluZyB8IHN0cmluZ1tdO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBzdGFydHMgZHJhZ2dpbmcgdGhlIGl0ZW0uICovXHJcbiAgQE91dHB1dCgnY2RrRHJhZ1N0YXJ0ZWQnKSBzdGFydGVkOiBFdmVudEVtaXR0ZXI8Q2RrRHJhZ1N0YXJ0PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ1N0YXJ0PigpO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBoYXMgcmVsZWFzZWQgYSBkcmFnIGl0ZW0sIGJlZm9yZSBhbnkgYW5pbWF0aW9ucyBoYXZlIHN0YXJ0ZWQuICovXHJcbiAgQE91dHB1dCgnY2RrRHJhZ1JlbGVhc2VkJykgcmVsZWFzZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnUmVsZWFzZT4gPVxyXG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPENka0RyYWdSZWxlYXNlPigpO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGUgdXNlciBzdG9wcyBkcmFnZ2luZyBhbiBpdGVtIGluIHRoZSBjb250YWluZXIuICovXHJcbiAgQE91dHB1dCgnY2RrRHJhZ0VuZGVkJykgZW5kZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRW5kPiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VuZD4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgaGFzIG1vdmVkIHRoZSBpdGVtIGludG8gYSBuZXcgY29udGFpbmVyLiAqL1xyXG4gIEBPdXRwdXQoJ2Nka0RyYWdFbnRlcmVkJykgZW50ZXJlZDogRXZlbnRFbWl0dGVyPENka0RyYWdFbnRlcjxhbnk+PiA9XHJcbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VudGVyPGFueT4+KCk7XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHJlbW92ZXMgdGhlIGl0ZW0gaXRzIGNvbnRhaW5lciBieSBkcmFnZ2luZyBpdCBpbnRvIGFub3RoZXIgY29udGFpbmVyLiAqL1xyXG4gIEBPdXRwdXQoJ2Nka0RyYWdFeGl0ZWQnKSBleGl0ZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRXhpdDxhbnk+PiA9XHJcbiAgICAgIG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0V4aXQ8YW55Pj4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgZHJvcHMgdGhlIGl0ZW0gaW5zaWRlIGEgY29udGFpbmVyLiAqL1xyXG4gIEBPdXRwdXQoJ2Nka0RyYWdEcm9wcGVkJykgZHJvcHBlZDogRXZlbnRFbWl0dGVyPENka0RyYWdEcm9wPGFueT4+ID1cclxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxDZGtEcmFnRHJvcDxhbnk+PigpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyBhcyB0aGUgdXNlciBpcyBkcmFnZ2luZyB0aGUgaXRlbS4gVXNlIHdpdGggY2F1dGlvbixcclxuICAgKiBiZWNhdXNlIHRoaXMgZXZlbnQgd2lsbCBmaXJlIGZvciBldmVyeSBwaXhlbCB0aGF0IHRoZSB1c2VyIGhhcyBkcmFnZ2VkLlxyXG4gICAqL1xyXG4gIEBPdXRwdXQoJ2Nka0RyYWdNb3ZlZCcpIG1vdmVkOiBPYnNlcnZhYmxlPENka0RyYWdNb3ZlPFQ+PiA9XHJcbiAgICAgIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8Q2RrRHJhZ01vdmU8VD4+KSA9PiB7XHJcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZHJhZ1JlZi5tb3ZlZC5waXBlKG1hcChtb3ZlZEV2ZW50ID0+ICh7XHJcbiAgICAgICAgICBzb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgICBwb2ludGVyUG9zaXRpb246IG1vdmVkRXZlbnQucG9pbnRlclBvc2l0aW9uLFxyXG4gICAgICAgICAgZXZlbnQ6IG1vdmVkRXZlbnQuZXZlbnQsXHJcbiAgICAgICAgICBkZWx0YTogbW92ZWRFdmVudC5kZWx0YSxcclxuICAgICAgICAgIGRpc3RhbmNlOiBtb3ZlZEV2ZW50LmRpc3RhbmNlXHJcbiAgICAgICAgfSkpKS5zdWJzY3JpYmUob2JzZXJ2ZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgfSk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICAvKiogRWxlbWVudCB0aGF0IHRoZSBkcmFnZ2FibGUgaXMgYXR0YWNoZWQgdG8uICovXHJcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgICAgLyoqIERyb3BwYWJsZSBjb250YWluZXIgdGhhdCB0aGUgZHJhZ2dhYmxlIGlzIGEgcGFydCBvZi4gKi9cclxuICAgICAgQEluamVjdChDREtfRFJPUF9MSVNUKSBAT3B0aW9uYWwoKSBAU2tpcFNlbGYoKSBwdWJsaWMgZHJvcENvbnRhaW5lcjogQ2RrRHJvcExpc3QsXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBAZGVwcmVjYXRlZCBgX2RvY3VtZW50YCBwYXJhbWV0ZXIgbm8gbG9uZ2VyIGJlaW5nIHVzZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZC5cclxuICAgICAgICogQGJyZWFraW5nLWNoYW5nZSAxMi4wLjBcclxuICAgICAgICovXHJcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcclxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChDREtfRFJBR19DT05GSUcpIGNvbmZpZzogRHJhZ0Ryb3BDb25maWcsXHJcbiAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHksIGRyYWdEcm9wOiBEcmFnRHJvcCxcclxuICAgICAgcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmLFxyXG4gICAgICBAT3B0aW9uYWwoKSBAU2VsZigpIEBJbmplY3QoQ0RLX0RSQUdfSEFORExFKSBwcml2YXRlIF9zZWxmSGFuZGxlPzogQ2RrRHJhZ0hhbmRsZSxcclxuICAgICAgQE9wdGlvbmFsKCkgQFNraXBTZWxmKCkgQEluamVjdChDREtfRFJBR19QQVJFTlQpIHByaXZhdGUgX3BhcmVudERyYWc/OiBDZGtEcmFnKSB7XHJcbiAgICB0aGlzLl9kcmFnUmVmID0gZHJhZ0Ryb3AuY3JlYXRlRHJhZyhlbGVtZW50LCB7XHJcbiAgICAgIGRyYWdTdGFydFRocmVzaG9sZDogY29uZmlnICYmIGNvbmZpZy5kcmFnU3RhcnRUaHJlc2hvbGQgIT0gbnVsbCA/XHJcbiAgICAgICAgICBjb25maWcuZHJhZ1N0YXJ0VGhyZXNob2xkIDogNSxcclxuICAgICAgcG9pbnRlckRpcmVjdGlvbkNoYW5nZVRocmVzaG9sZDogY29uZmlnICYmIGNvbmZpZy5wb2ludGVyRGlyZWN0aW9uQ2hhbmdlVGhyZXNob2xkICE9IG51bGwgP1xyXG4gICAgICAgICAgY29uZmlnLnBvaW50ZXJEaXJlY3Rpb25DaGFuZ2VUaHJlc2hvbGQgOiA1LFxyXG4gICAgICB6SW5kZXg6IGNvbmZpZz8uekluZGV4LFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLl9kcmFnUmVmLmRhdGEgPSB0aGlzO1xyXG5cclxuICAgIC8vIFdlIGhhdmUgdG8ga2VlcCB0cmFjayBvZiB0aGUgZHJhZyBpbnN0YW5jZXMgaW4gb3JkZXIgdG8gYmUgYWJsZSB0byBtYXRjaCBhbiBlbGVtZW50IHRvXHJcbiAgICAvLyBhIGRyYWcgaW5zdGFuY2UuIFdlIGNhbid0IGdvIHRocm91Z2ggdGhlIGdsb2JhbCByZWdpc3RyeSBvZiBgRHJhZ1JlZmAsIGJlY2F1c2UgdGhlIHJvb3RcclxuICAgIC8vIGVsZW1lbnQgY291bGQgYmUgZGlmZmVyZW50LlxyXG4gICAgQ2RrRHJhZy5fZHJhZ0luc3RhbmNlcy5wdXNoKHRoaXMpO1xyXG5cclxuICAgIGlmIChjb25maWcpIHtcclxuICAgICAgdGhpcy5fYXNzaWduRGVmYXVsdHMoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOb3RlIHRoYXQgdXN1YWxseSB0aGUgY29udGFpbmVyIGlzIGFzc2lnbmVkIHdoZW4gdGhlIGRyb3AgbGlzdCBpcyBwaWNrcyB1cCB0aGUgaXRlbSwgYnV0IGluXHJcbiAgICAvLyBzb21lIGNhc2VzIChtYWlubHkgdHJhbnNwbGFudGVkIHZpZXdzIHdpdGggT25QdXNoLCBzZWUgIzE4MzQxKSB3ZSBtYXkgZW5kIHVwIGluIGEgc2l0dWF0aW9uXHJcbiAgICAvLyB3aGVyZSB0aGVyZSBhcmUgbm8gaXRlbXMgb24gdGhlIGZpcnN0IGNoYW5nZSBkZXRlY3Rpb24gcGFzcywgYnV0IHRoZSBpdGVtcyBnZXQgcGlja2VkIHVwIGFzXHJcbiAgICAvLyBzb29uIGFzIHRoZSB1c2VyIHRyaWdnZXJzIGFub3RoZXIgcGFzcyBieSBkcmFnZ2luZy4gVGhpcyBpcyBhIHByb2JsZW0sIGJlY2F1c2UgdGhlIGl0ZW0gd291bGRcclxuICAgIC8vIGhhdmUgdG8gc3dpdGNoIGZyb20gc3RhbmRhbG9uZSBtb2RlIHRvIGRyYWcgbW9kZSBpbiB0aGUgbWlkZGxlIG9mIHRoZSBkcmFnZ2luZyBzZXF1ZW5jZSB3aGljaFxyXG4gICAgLy8gaXMgdG9vIGxhdGUgc2luY2UgdGhlIHR3byBtb2RlcyBzYXZlIGRpZmZlcmVudCBraW5kcyBvZiBpbmZvcm1hdGlvbi4gV2Ugd29yayBhcm91bmQgaXQgYnlcclxuICAgIC8vIGFzc2lnbmluZyB0aGUgZHJvcCBjb250YWluZXIgYm90aCBmcm9tIGhlcmUgYW5kIHRoZSBsaXN0LlxyXG4gICAgaWYgKGRyb3BDb250YWluZXIpIHtcclxuICAgICAgdGhpcy5fZHJhZ1JlZi5fd2l0aERyb3BDb250YWluZXIoZHJvcENvbnRhaW5lci5fZHJvcExpc3RSZWYpO1xyXG4gICAgICBkcm9wQ29udGFpbmVyLmFkZEl0ZW0odGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fc3luY0lucHV0cyh0aGlzLl9kcmFnUmVmKTtcclxuICAgIHRoaXMuX2hhbmRsZUV2ZW50cyh0aGlzLl9kcmFnUmVmKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGVsZW1lbnQgdGhhdCBpcyBiZWluZyB1c2VkIGFzIGEgcGxhY2Vob2xkZXJcclxuICAgKiB3aGlsZSB0aGUgY3VycmVudCBlbGVtZW50IGlzIGJlaW5nIGRyYWdnZWQuXHJcbiAgICovXHJcbiAgZ2V0UGxhY2Vob2xkZXJFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgIHJldHVybiB0aGlzLl9kcmFnUmVmLmdldFBsYWNlaG9sZGVyRWxlbWVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJldHVybnMgdGhlIHJvb3QgZHJhZ2dhYmxlIGVsZW1lbnQuICovXHJcbiAgZ2V0Um9vdEVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RyYWdSZWYuZ2V0Um9vdEVsZW1lbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBSZXNldHMgYSBzdGFuZGFsb25lIGRyYWcgaXRlbSB0byBpdHMgaW5pdGlhbCBwb3NpdGlvbi4gKi9cclxuICByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2RyYWdSZWYucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBpeGVsIGNvb3JkaW5hdGVzIG9mIHRoZSBkcmFnZ2FibGUgb3V0c2lkZSBvZiBhIGRyb3AgY29udGFpbmVyLlxyXG4gICAqL1xyXG4gIGdldEZyZWVEcmFnUG9zaXRpb24oKToge3JlYWRvbmx5IHg6IG51bWJlciwgcmVhZG9ubHkgeTogbnVtYmVyfSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZHJhZ1JlZi5nZXRGcmVlRHJhZ1Bvc2l0aW9uKCk7XHJcbiAgfVxyXG5cclxuICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoZSB6b25lIHRvIHN0YWJpbGl6ZSwgaW4gb3JkZXIgZm9yIHRoZSByZWZlcmVuY2VcclxuICAgIC8vIGVsZW1lbnQgdG8gYmUgaW4gdGhlIHByb3BlciBwbGFjZSBpbiB0aGUgRE9NLiBUaGlzIGlzIG1vc3RseSByZWxldmFudFxyXG4gICAgLy8gZm9yIGRyYWdnYWJsZSBlbGVtZW50cyBpbnNpZGUgcG9ydGFscyBzaW5jZSB0aGV5IGdldCBzdGFtcGVkIG91dCBpblxyXG4gICAgLy8gdGhlaXIgb3JpZ2luYWwgRE9NIHBvc2l0aW9uIGFuZCB0aGVuIHRoZXkgZ2V0IHRyYW5zZmVycmVkIHRvIHRoZSBwb3J0YWwuXHJcbiAgICB0aGlzLl9uZ1pvbmUub25TdGFibGVcclxuICAgICAgLnBpcGUodGFrZSgxKSwgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuX3VwZGF0ZVJvb3RFbGVtZW50KCk7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbiBmb3IgYW55IG5ld2x5LWFkZGVkIGhhbmRsZXMuXHJcbiAgICAgICAgdGhpcy5faGFuZGxlcy5jaGFuZ2VzLnBpcGUoXHJcbiAgICAgICAgICBzdGFydFdpdGgodGhpcy5faGFuZGxlcyksXHJcbiAgICAgICAgICAvLyBTeW5jIHRoZSBuZXcgaGFuZGxlcyB3aXRoIHRoZSBEcmFnUmVmLlxyXG4gICAgICAgICAgdGFwKChoYW5kbGVzOiBRdWVyeUxpc3Q8Q2RrRHJhZ0hhbmRsZT4pID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY2hpbGRIYW5kbGVFbGVtZW50cyA9IGhhbmRsZXNcclxuICAgICAgICAgICAgICAuZmlsdGVyKGhhbmRsZSA9PiBoYW5kbGUuX3BhcmVudERyYWcgPT09IHRoaXMpXHJcbiAgICAgICAgICAgICAgLm1hcChoYW5kbGUgPT4gaGFuZGxlLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgLy8gVXN1YWxseSBoYW5kbGVzIGFyZSBvbmx5IGFsbG93ZWQgdG8gYmUgYSBkZXNjZW5kYW50IG9mIHRoZSBkcmFnIGVsZW1lbnQsIGJ1dCBpZlxyXG4gICAgICAgICAgICAvLyB0aGUgY29uc3VtZXIgZGVmaW5lZCBhIGRpZmZlcmVudCBkcmFnIHJvb3QsIHdlIHNob3VsZCBhbGxvdyB0aGUgZHJhZyBlbGVtZW50XHJcbiAgICAgICAgICAgIC8vIGl0c2VsZiB0byBiZSBhIGhhbmRsZSB0b28uXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9zZWxmSGFuZGxlICYmIHRoaXMucm9vdEVsZW1lbnRTZWxlY3Rvcikge1xyXG4gICAgICAgICAgICAgIGNoaWxkSGFuZGxlRWxlbWVudHMucHVzaCh0aGlzLmVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9kcmFnUmVmLndpdGhIYW5kbGVzKGNoaWxkSGFuZGxlRWxlbWVudHMpO1xyXG4gICAgICAgICAgfSksXHJcbiAgICAgICAgICAvLyBMaXN0ZW4gaWYgdGhlIHN0YXRlIG9mIGFueSBvZiB0aGUgaGFuZGxlcyBjaGFuZ2VzLlxyXG4gICAgICAgICAgc3dpdGNoTWFwKChoYW5kbGVzOiBRdWVyeUxpc3Q8Q2RrRHJhZ0hhbmRsZT4pID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlKC4uLmhhbmRsZXMubWFwKGl0ZW0gPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBpdGVtLl9zdGF0ZUNoYW5nZXMucGlwZShzdGFydFdpdGgoaXRlbSkpO1xyXG4gICAgICAgICAgICB9KSkgYXMgT2JzZXJ2YWJsZTxDZGtEcmFnSGFuZGxlPjtcclxuICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZClcclxuICAgICAgICApLnN1YnNjcmliZShoYW5kbGVJbnN0YW5jZSA9PiB7XHJcbiAgICAgICAgICAvLyBFbmFibGVkL2Rpc2FibGUgdGhlIGhhbmRsZSB0aGF0IGNoYW5nZWQgaW4gdGhlIERyYWdSZWYuXHJcbiAgICAgICAgICBjb25zdCBkcmFnUmVmID0gdGhpcy5fZHJhZ1JlZjtcclxuICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGhhbmRsZUluc3RhbmNlLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcclxuICAgICAgICAgIGhhbmRsZUluc3RhbmNlLmRpc2FibGVkID8gZHJhZ1JlZi5kaXNhYmxlSGFuZGxlKGhhbmRsZSkgOiBkcmFnUmVmLmVuYWJsZUhhbmRsZShoYW5kbGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKSB7XHJcbiAgICAgICAgICB0aGlzLl9kcmFnUmVmLnNldEZyZWVEcmFnUG9zaXRpb24odGhpcy5mcmVlRHJhZ1Bvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgY29uc3Qgcm9vdFNlbGVjdG9yQ2hhbmdlID0gY2hhbmdlc1sncm9vdEVsZW1lbnRTZWxlY3RvciddO1xyXG4gICAgY29uc3QgcG9zaXRpb25DaGFuZ2UgPSBjaGFuZ2VzWydmcmVlRHJhZ1Bvc2l0aW9uJ107XHJcblxyXG4gICAgLy8gV2UgZG9uJ3QgaGF2ZSB0byByZWFjdCB0byB0aGUgZmlyc3QgY2hhbmdlIHNpbmNlIGl0J3MgYmVpbmdcclxuICAgIC8vIGhhbmRsZWQgaW4gYG5nQWZ0ZXJWaWV3SW5pdGAgd2hlcmUgaXQgbmVlZHMgdG8gYmUgZGVmZXJyZWQuXHJcbiAgICBpZiAocm9vdFNlbGVjdG9yQ2hhbmdlICYmICFyb290U2VsZWN0b3JDaGFuZ2UuZmlyc3RDaGFuZ2UpIHtcclxuICAgICAgdGhpcy5fdXBkYXRlUm9vdEVsZW1lbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTa2lwIHRoZSBmaXJzdCBjaGFuZ2Ugc2luY2UgaXQncyBiZWluZyBoYW5kbGVkIGluIGBuZ0FmdGVyVmlld0luaXRgLlxyXG4gICAgaWYgKHBvc2l0aW9uQ2hhbmdlICYmICFwb3NpdGlvbkNoYW5nZS5maXJzdENoYW5nZSAmJiB0aGlzLmZyZWVEcmFnUG9zaXRpb24pIHtcclxuICAgICAgdGhpcy5fZHJhZ1JlZi5zZXRGcmVlRHJhZ1Bvc2l0aW9uKHRoaXMuZnJlZURyYWdQb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIGlmICh0aGlzLmRyb3BDb250YWluZXIpIHtcclxuICAgICAgdGhpcy5kcm9wQ29udGFpbmVyLnJlbW92ZUl0ZW0odGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5kZXggPSBDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLmluZGV4T2YodGhpcyk7XHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICBDZGtEcmFnLl9kcmFnSW5zdGFuY2VzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XHJcbiAgICB0aGlzLl9kcmFnUmVmLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKiBTeW5jcyB0aGUgcm9vdCBlbGVtZW50IHdpdGggdGhlIGBEcmFnUmVmYC4gKi9cclxuICBwcml2YXRlIF91cGRhdGVSb290RWxlbWVudCgpIHtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcclxuICAgIGNvbnN0IHJvb3RFbGVtZW50ID0gdGhpcy5yb290RWxlbWVudFNlbGVjdG9yID9cclxuICAgICAgICBnZXRDbG9zZXN0TWF0Y2hpbmdBbmNlc3RvcihlbGVtZW50LCB0aGlzLnJvb3RFbGVtZW50U2VsZWN0b3IpIDogZWxlbWVudDtcclxuXHJcbiAgICBpZiAocm9vdEVsZW1lbnQgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgYXNzZXJ0RWxlbWVudE5vZGUocm9vdEVsZW1lbnQsICdjZGtEcmFnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fZHJhZ1JlZi53aXRoUm9vdEVsZW1lbnQocm9vdEVsZW1lbnQgfHwgZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgYm91bmRhcnkgZWxlbWVudCwgYmFzZWQgb24gdGhlIGBib3VuZGFyeUVsZW1lbnRgIHZhbHVlLiAqL1xyXG4gIHByaXZhdGUgX2dldEJvdW5kYXJ5RWxlbWVudCgpIHtcclxuICAgIGNvbnN0IGJvdW5kYXJ5ID0gdGhpcy5ib3VuZGFyeUVsZW1lbnQ7XHJcblxyXG4gICAgaWYgKCFib3VuZGFyeSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGJvdW5kYXJ5ID09PSAnc3RyaW5nJykge1xyXG4gICAgICByZXR1cm4gZ2V0Q2xvc2VzdE1hdGNoaW5nQW5jZXN0b3IodGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQsIGJvdW5kYXJ5KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChib3VuZGFyeSk7XHJcblxyXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmXHJcbiAgICAgICFlbGVtZW50LmNvbnRhaW5zKHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50KSkge1xyXG4gICAgICB0aHJvdyBFcnJvcignRHJhZ2dhYmxlIGVsZW1lbnQgaXMgbm90IGluc2lkZSBvZiB0aGUgbm9kZSBwYXNzZWQgaW50byBjZGtEcmFnQm91bmRhcnkuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvKiogU3luY3MgdGhlIGlucHV0cyBvZiB0aGUgQ2RrRHJhZyB3aXRoIHRoZSBvcHRpb25zIG9mIHRoZSB1bmRlcmx5aW5nIERyYWdSZWYuICovXHJcbiAgcHJpdmF0ZSBfc3luY0lucHV0cyhyZWY6IERyYWdSZWY8Q2RrRHJhZzxUPj4pIHtcclxuICAgIHJlZi5iZWZvcmVTdGFydGVkLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgIGlmICghcmVmLmlzRHJhZ2dpbmcoKSkge1xyXG4gICAgICAgIGNvbnN0IGRpciA9IHRoaXMuX2RpcjtcclxuICAgICAgICBjb25zdCBkcmFnU3RhcnREZWxheSA9IHRoaXMuZHJhZ1N0YXJ0RGVsYXk7XHJcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlID8ge1xyXG4gICAgICAgICAgdGVtcGxhdGU6IHRoaXMuX3BsYWNlaG9sZGVyVGVtcGxhdGUudGVtcGxhdGVSZWYsXHJcbiAgICAgICAgICBjb250ZXh0OiB0aGlzLl9wbGFjZWhvbGRlclRlbXBsYXRlLmRhdGEsXHJcbiAgICAgICAgICB2aWV3Q29udGFpbmVyOiB0aGlzLl92aWV3Q29udGFpbmVyUmVmXHJcbiAgICAgICAgfSA6IG51bGw7XHJcbiAgICAgICAgY29uc3QgcHJldmlldyA9IHRoaXMuX3ByZXZpZXdUZW1wbGF0ZSA/IHtcclxuICAgICAgICAgIHRlbXBsYXRlOiB0aGlzLl9wcmV2aWV3VGVtcGxhdGUudGVtcGxhdGVSZWYsXHJcbiAgICAgICAgICBjb250ZXh0OiB0aGlzLl9wcmV2aWV3VGVtcGxhdGUuZGF0YSxcclxuICAgICAgICAgIG1hdGNoU2l6ZTogdGhpcy5fcHJldmlld1RlbXBsYXRlLm1hdGNoU2l6ZSxcclxuICAgICAgICAgIHZpZXdDb250YWluZXI6IHRoaXMuX3ZpZXdDb250YWluZXJSZWZcclxuICAgICAgICB9IDogbnVsbDtcclxuXHJcbiAgICAgICAgcmVmLmRpc2FibGVkID0gdGhpcy5kaXNhYmxlZDtcclxuICAgICAgICByZWYubG9ja0F4aXMgPSB0aGlzLmxvY2tBeGlzO1xyXG4gICAgICAgIHJlZi5kcmFnU3RhcnREZWxheSA9ICh0eXBlb2YgZHJhZ1N0YXJ0RGVsYXkgPT09ICdvYmplY3QnICYmIGRyYWdTdGFydERlbGF5KSA/XHJcbiAgICAgICAgICAgIGRyYWdTdGFydERlbGF5IDogY29lcmNlTnVtYmVyUHJvcGVydHkoZHJhZ1N0YXJ0RGVsYXkpO1xyXG4gICAgICAgIHJlZi5jb25zdHJhaW5Qb3NpdGlvbiA9IHRoaXMuY29uc3RyYWluUG9zaXRpb247XHJcbiAgICAgICAgcmVmLnByZXZpZXdDbGFzcyA9IHRoaXMucHJldmlld0NsYXNzO1xyXG4gICAgICAgIHJlZlxyXG4gICAgICAgICAgLndpdGhCb3VuZGFyeUVsZW1lbnQodGhpcy5fZ2V0Qm91bmRhcnlFbGVtZW50KCkpXHJcbiAgICAgICAgICAud2l0aFBsYWNlaG9sZGVyVGVtcGxhdGUocGxhY2Vob2xkZXIpXHJcbiAgICAgICAgICAud2l0aFByZXZpZXdUZW1wbGF0ZShwcmV2aWV3KTtcclxuXHJcbiAgICAgICAgaWYgKGRpcikge1xyXG4gICAgICAgICAgcmVmLndpdGhEaXJlY3Rpb24oZGlyLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFRoaXMgb25seSBuZWVkcyB0byBiZSByZXNvbHZlZCBvbmNlLlxyXG4gICAgcmVmLmJlZm9yZVN0YXJ0ZWQucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAvLyBJZiB3ZSBtYW5hZ2VkIHRvIHJlc29sdmUgYSBwYXJlbnQgdGhyb3VnaCBESSwgdXNlIGl0LlxyXG4gICAgICBpZiAodGhpcy5fcGFyZW50RHJhZykge1xyXG4gICAgICAgIHJlZi53aXRoUGFyZW50KHRoaXMuX3BhcmVudERyYWcuX2RyYWdSZWYpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT3RoZXJ3aXNlIGZhbGwgYmFjayB0byByZXNvbHZpbmcgdGhlIHBhcmVudCBieSBsb29raW5nIHVwIHRoZSBET00uIFRoaXMgY2FuIGhhcHBlbiBpZlxyXG4gICAgICAvLyB0aGUgaXRlbSB3YXMgcHJvamVjdGVkIGludG8gYW5vdGhlciBpdGVtIGJ5IHNvbWV0aGluZyBsaWtlIGBuZ1RlbXBsYXRlT3V0bGV0YC5cclxuICAgICAgbGV0IHBhcmVudCA9IHRoaXMuZWxlbWVudC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIHdoaWxlIChwYXJlbnQpIHtcclxuICAgICAgICAvLyBgY2xhc3NMaXN0YCBuZWVkcyB0byBiZSBudWxsIGNoZWNrZWQsIGJlY2F1c2UgSUUgZG9lc24ndCBoYXZlIGl0IG9uIHNvbWUgZWxlbWVudHMuXHJcbiAgICAgICAgaWYgKHBhcmVudC5jbGFzc0xpc3Q/LmNvbnRhaW5zKERSQUdfSE9TVF9DTEFTUykpIHtcclxuICAgICAgICAgIHJlZi53aXRoUGFyZW50KENka0RyYWcuX2RyYWdJbnN0YW5jZXMuZmluZChkcmFnID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGRyYWcuZWxlbWVudC5uYXRpdmVFbGVtZW50ID09PSBwYXJlbnQ7XHJcbiAgICAgICAgICB9KT8uX2RyYWdSZWYgfHwgbnVsbCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMgdGhlIGV2ZW50cyBmcm9tIHRoZSB1bmRlcmx5aW5nIGBEcmFnUmVmYC4gKi9cclxuICBwcml2YXRlIF9oYW5kbGVFdmVudHMocmVmOiBEcmFnUmVmPENka0RyYWc8VD4+KSB7XHJcbiAgICByZWYuc3RhcnRlZC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLnN0YXJ0ZWQuZW1pdCh7c291cmNlOiB0aGlzfSk7XHJcblxyXG4gICAgICAvLyBTaW5jZSBhbGwgb2YgdGhlc2UgZXZlbnRzIHJ1biBvdXRzaWRlIG9mIGNoYW5nZSBkZXRlY3Rpb24sXHJcbiAgICAgIC8vIHdlIG5lZWQgdG8gZW5zdXJlIHRoYXQgZXZlcnl0aGluZyBpcyBtYXJrZWQgY29ycmVjdGx5LlxyXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJlZi5yZWxlYXNlZC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLnJlbGVhc2VkLmVtaXQoe3NvdXJjZTogdGhpc30pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVmLmVuZGVkLnN1YnNjcmliZShldmVudCA9PiB7XHJcbiAgICAgIHRoaXMuZW5kZWQuZW1pdCh7c291cmNlOiB0aGlzLCBkaXN0YW5jZTogZXZlbnQuZGlzdGFuY2V9KTtcclxuXHJcbiAgICAgIC8vIFNpbmNlIGFsbCBvZiB0aGVzZSBldmVudHMgcnVuIG91dHNpZGUgb2YgY2hhbmdlIGRldGVjdGlvbixcclxuICAgICAgLy8gd2UgbmVlZCB0byBlbnN1cmUgdGhhdCBldmVyeXRoaW5nIGlzIG1hcmtlZCBjb3JyZWN0bHkuXHJcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVmLmVudGVyZWQuc3Vic2NyaWJlKGV2ZW50ID0+IHtcclxuICAgICAgdGhpcy5lbnRlcmVkLmVtaXQoe1xyXG4gICAgICAgIGNvbnRhaW5lcjogZXZlbnQuY29udGFpbmVyLmRhdGEsXHJcbiAgICAgICAgaXRlbTogdGhpcyxcclxuICAgICAgICBjdXJyZW50SW5kZXg6IGV2ZW50LmN1cnJlbnRJbmRleFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIHJlZi5leGl0ZWQuc3Vic2NyaWJlKGV2ZW50ID0+IHtcclxuICAgICAgdGhpcy5leGl0ZWQuZW1pdCh7XHJcbiAgICAgICAgY29udGFpbmVyOiBldmVudC5jb250YWluZXIuZGF0YSxcclxuICAgICAgICBpdGVtOiB0aGlzXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVmLmRyb3BwZWQuc3Vic2NyaWJlKGV2ZW50ID0+IHtcclxuICAgICAgdGhpcy5kcm9wcGVkLmVtaXQoe1xyXG4gICAgICAgIHByZXZpb3VzSW5kZXg6IGV2ZW50LnByZXZpb3VzSW5kZXgsXHJcbiAgICAgICAgY3VycmVudEluZGV4OiBldmVudC5jdXJyZW50SW5kZXgsXHJcbiAgICAgICAgcHJldmlvdXNDb250YWluZXI6IGV2ZW50LnByZXZpb3VzQ29udGFpbmVyLmRhdGEsXHJcbiAgICAgICAgY29udGFpbmVyOiBldmVudC5jb250YWluZXIuZGF0YSxcclxuICAgICAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyOiBldmVudC5pc1BvaW50ZXJPdmVyQ29udGFpbmVyLFxyXG4gICAgICAgIGl0ZW06IHRoaXMsXHJcbiAgICAgICAgZGlzdGFuY2U6IGV2ZW50LmRpc3RhbmNlXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogQXNzaWducyB0aGUgZGVmYXVsdCBpbnB1dCB2YWx1ZXMgYmFzZWQgb24gYSBwcm92aWRlZCBjb25maWcgb2JqZWN0LiAqL1xyXG4gIHByaXZhdGUgX2Fzc2lnbkRlZmF1bHRzKGNvbmZpZzogRHJhZ0Ryb3BDb25maWcpIHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgbG9ja0F4aXMsIGRyYWdTdGFydERlbGF5LCBjb25zdHJhaW5Qb3NpdGlvbiwgcHJldmlld0NsYXNzLFxyXG4gICAgICBib3VuZGFyeUVsZW1lbnQsIGRyYWdnaW5nRGlzYWJsZWQsIHJvb3RFbGVtZW50U2VsZWN0b3JcclxuICAgIH0gPSBjb25maWc7XHJcblxyXG4gICAgdGhpcy5kaXNhYmxlZCA9IGRyYWdnaW5nRGlzYWJsZWQgPT0gbnVsbCA/IGZhbHNlIDogZHJhZ2dpbmdEaXNhYmxlZDtcclxuICAgIHRoaXMuZHJhZ1N0YXJ0RGVsYXkgPSBkcmFnU3RhcnREZWxheSB8fCAwO1xyXG5cclxuICAgIGlmIChsb2NrQXhpcykge1xyXG4gICAgICB0aGlzLmxvY2tBeGlzID0gbG9ja0F4aXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbnN0cmFpblBvc2l0aW9uKSB7XHJcbiAgICAgIHRoaXMuY29uc3RyYWluUG9zaXRpb24gPSBjb25zdHJhaW5Qb3NpdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocHJldmlld0NsYXNzKSB7XHJcbiAgICAgIHRoaXMucHJldmlld0NsYXNzID0gcHJldmlld0NsYXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChib3VuZGFyeUVsZW1lbnQpIHtcclxuICAgICAgdGhpcy5ib3VuZGFyeUVsZW1lbnQgPSBib3VuZGFyeUVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJvb3RFbGVtZW50U2VsZWN0b3IpIHtcclxuICAgICAgdGhpcy5yb290RWxlbWVudFNlbGVjdG9yID0gcm9vdEVsZW1lbnRTZWxlY3RvcjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xyXG59XHJcblxyXG4vKiogR2V0cyB0aGUgY2xvc2VzdCBhbmNlc3RvciBvZiBhbiBlbGVtZW50IHRoYXQgbWF0Y2hlcyBhIHNlbGVjdG9yLiAqL1xyXG5mdW5jdGlvbiBnZXRDbG9zZXN0TWF0Y2hpbmdBbmNlc3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IHN0cmluZykge1xyXG4gIGxldCBjdXJyZW50RWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XHJcblxyXG4gIHdoaWxlIChjdXJyZW50RWxlbWVudCkge1xyXG4gICAgLy8gSUUgZG9lc24ndCBzdXBwb3J0IGBtYXRjaGVzYCBzbyB3ZSBoYXZlIHRvIGZhbGwgYmFjayB0byBgbXNNYXRjaGVzU2VsZWN0b3JgLlxyXG4gICAgaWYgKGN1cnJlbnRFbGVtZW50Lm1hdGNoZXMgPyBjdXJyZW50RWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSA6XHJcbiAgICAgICAgKGN1cnJlbnRFbGVtZW50IGFzIGFueSkubXNNYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpKSB7XHJcbiAgICAgIHJldHVybiBjdXJyZW50RWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBjdXJyZW50RWxlbWVudCA9IGN1cnJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuIl19