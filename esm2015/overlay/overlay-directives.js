/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, Optional, Output, TemplateRef, ViewContainerRef, } from '@angular/core';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { FlexibleConnectedPositionStrategy, } from './position/flexible-connected-position-strategy';
/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const defaultPositionList = [
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom'
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
    }
];
/** Injection token that determines the scroll handling while the connected overlay is open. */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY = new InjectionToken('cdk-connected-overlay-scroll-strategy');
/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
export class CdkOverlayOrigin {
    constructor(
    /** Reference to the element on which the directive is applied. */
    elementRef) {
        this.elementRef = elementRef;
    }
}
CdkOverlayOrigin.decorators = [
    { type: Directive, args: [{
                selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
                exportAs: 'cdkOverlayOrigin',
            },] }
];
CdkOverlayOrigin.ctorParameters = () => [
    { type: ElementRef }
];
/**
 * Directive to facilitate declarative creation of an
 * Overlay using a FlexibleConnectedPositionStrategy.
 */
export class CdkConnectedOverlay {
    // TODO(jelbourn): inputs for size, scroll behavior, animation, etc.
    constructor(_overlay, templateRef, viewContainerRef, scrollStrategyFactory, _dir) {
        this._overlay = _overlay;
        this._dir = _dir;
        this._hasBackdrop = false;
        this._lockPosition = false;
        this._growAfterOpen = false;
        this._flexibleDimensions = false;
        this._push = false;
        this._backdropSubscription = Subscription.EMPTY;
        this._attachSubscription = Subscription.EMPTY;
        this._detachSubscription = Subscription.EMPTY;
        this._positionSubscription = Subscription.EMPTY;
        /** Margin between the overlay and the viewport edges. */
        this.viewportMargin = 0;
        /** Whether the overlay is open. */
        this.open = false;
        /** Whether the overlay can be closed by user interaction. */
        this.disableClose = false;
        /** Event emitted when the backdrop is clicked. */
        this.backdropClick = new EventEmitter();
        /** Event emitted when the position has changed. */
        this.positionChange = new EventEmitter();
        /** Event emitted when the overlay has been attached. */
        this.attach = new EventEmitter();
        /** Event emitted when the overlay has been detached. */
        this.detach = new EventEmitter();
        /** Emits when there are keyboard events that are targeted at the overlay. */
        this.overlayKeydown = new EventEmitter();
        /** Emits when there are mouse outside click events that are targeted at the overlay. */
        this.overlayOutsideClick = new EventEmitter();
        this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
        this._scrollStrategyFactory = scrollStrategyFactory;
        this.scrollStrategy = this._scrollStrategyFactory();
    }
    /** The offset in pixels for the overlay connection point on the x-axis */
    get offsetX() { return this._offsetX; }
    set offsetX(offsetX) {
        this._offsetX = offsetX;
        if (this._position) {
            this._updatePositionStrategy(this._position);
        }
    }
    /** The offset in pixels for the overlay connection point on the y-axis */
    get offsetY() { return this._offsetY; }
    set offsetY(offsetY) {
        this._offsetY = offsetY;
        if (this._position) {
            this._updatePositionStrategy(this._position);
        }
    }
    /** Whether or not the overlay should attach a backdrop. */
    get hasBackdrop() { return this._hasBackdrop; }
    set hasBackdrop(value) { this._hasBackdrop = coerceBooleanProperty(value); }
    /** Whether or not the overlay should be locked when scrolling. */
    get lockPosition() { return this._lockPosition; }
    set lockPosition(value) { this._lockPosition = coerceBooleanProperty(value); }
    /** Whether the overlay's width and height can be constrained to fit within the viewport. */
    get flexibleDimensions() { return this._flexibleDimensions; }
    set flexibleDimensions(value) {
        this._flexibleDimensions = coerceBooleanProperty(value);
    }
    /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
    get growAfterOpen() { return this._growAfterOpen; }
    set growAfterOpen(value) { this._growAfterOpen = coerceBooleanProperty(value); }
    /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
    get push() { return this._push; }
    set push(value) { this._push = coerceBooleanProperty(value); }
    /** The associated overlay reference. */
    get overlayRef() {
        return this._overlayRef;
    }
    /** The element's layout direction. */
    get dir() {
        return this._dir ? this._dir.value : 'ltr';
    }
    ngOnDestroy() {
        this._attachSubscription.unsubscribe();
        this._detachSubscription.unsubscribe();
        this._backdropSubscription.unsubscribe();
        this._positionSubscription.unsubscribe();
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }
    ngOnChanges(changes) {
        if (this._position) {
            this._updatePositionStrategy(this._position);
            this._overlayRef.updateSize({
                width: this.width,
                minWidth: this.minWidth,
                height: this.height,
                minHeight: this.minHeight,
            });
            if (changes['origin'] && this.open) {
                this._position.apply();
            }
        }
        if (changes['open']) {
            this.open ? this._attachOverlay() : this._detachOverlay();
        }
    }
    /** Creates an overlay */
    _createOverlay() {
        if (!this.positions || !this.positions.length) {
            this.positions = defaultPositionList;
        }
        const overlayRef = this._overlayRef = this._overlay.create(this._buildConfig());
        this._attachSubscription = overlayRef.attachments().subscribe(() => this.attach.emit());
        this._detachSubscription = overlayRef.detachments().subscribe(() => this.detach.emit());
        overlayRef.keydownEvents().subscribe((event) => {
            this.overlayKeydown.next(event);
            if (event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event)) {
                event.preventDefault();
                this._detachOverlay();
            }
        });
        this._overlayRef.outsidePointerEvents().subscribe((event) => {
            this.overlayOutsideClick.next(event);
        });
    }
    /** Builds the overlay config based on the directive's inputs */
    _buildConfig() {
        const positionStrategy = this._position =
            this.positionStrategy || this._createPositionStrategy();
        const overlayConfig = new OverlayConfig({
            direction: this._dir,
            positionStrategy,
            scrollStrategy: this.scrollStrategy,
            hasBackdrop: this.hasBackdrop
        });
        if (this.width || this.width === 0) {
            overlayConfig.width = this.width;
        }
        if (this.height || this.height === 0) {
            overlayConfig.height = this.height;
        }
        if (this.minWidth || this.minWidth === 0) {
            overlayConfig.minWidth = this.minWidth;
        }
        if (this.minHeight || this.minHeight === 0) {
            overlayConfig.minHeight = this.minHeight;
        }
        if (this.backdropClass) {
            overlayConfig.backdropClass = this.backdropClass;
        }
        if (this.panelClass) {
            overlayConfig.panelClass = this.panelClass;
        }
        return overlayConfig;
    }
    /** Updates the state of a position strategy, based on the values of the directive inputs. */
    _updatePositionStrategy(positionStrategy) {
        const positions = this.positions.map(currentPosition => ({
            originX: currentPosition.originX,
            originY: currentPosition.originY,
            overlayX: currentPosition.overlayX,
            overlayY: currentPosition.overlayY,
            offsetX: currentPosition.offsetX || this.offsetX,
            offsetY: currentPosition.offsetY || this.offsetY,
            panelClass: currentPosition.panelClass || undefined,
        }));
        return positionStrategy
            .setOrigin(this.origin.elementRef)
            .withPositions(positions)
            .withFlexibleDimensions(this.flexibleDimensions)
            .withPush(this.push)
            .withGrowAfterOpen(this.growAfterOpen)
            .withViewportMargin(this.viewportMargin)
            .withLockedPosition(this.lockPosition)
            .withTransformOriginOn(this.transformOriginSelector);
    }
    /** Returns the position strategy of the overlay to be set on the overlay config */
    _createPositionStrategy() {
        const strategy = this._overlay.position().flexibleConnectedTo(this.origin.elementRef);
        this._updatePositionStrategy(strategy);
        return strategy;
    }
    /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
    _attachOverlay() {
        if (!this._overlayRef) {
            this._createOverlay();
        }
        else {
            // Update the overlay size, in case the directive's inputs have changed
            this._overlayRef.getConfig().hasBackdrop = this.hasBackdrop;
        }
        if (!this._overlayRef.hasAttached()) {
            this._overlayRef.attach(this._templatePortal);
        }
        if (this.hasBackdrop) {
            this._backdropSubscription = this._overlayRef.backdropClick().subscribe(event => {
                this.backdropClick.emit(event);
            });
        }
        else {
            this._backdropSubscription.unsubscribe();
        }
        this._positionSubscription.unsubscribe();
        // Only subscribe to `positionChanges` if requested, because putting
        // together all the information for it can be expensive.
        if (this.positionChange.observers.length > 0) {
            this._positionSubscription = this._position.positionChanges
                .pipe(takeWhile(() => this.positionChange.observers.length > 0))
                .subscribe(position => {
                this.positionChange.emit(position);
                if (this.positionChange.observers.length === 0) {
                    this._positionSubscription.unsubscribe();
                }
            });
        }
    }
    /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
    _detachOverlay() {
        if (this._overlayRef) {
            this._overlayRef.detach();
        }
        this._backdropSubscription.unsubscribe();
        this._positionSubscription.unsubscribe();
    }
}
CdkConnectedOverlay.decorators = [
    { type: Directive, args: [{
                selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
                exportAs: 'cdkConnectedOverlay'
            },] }
];
CdkConnectedOverlay.ctorParameters = () => [
    { type: Overlay },
    { type: TemplateRef },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,] }] },
    { type: Directionality, decorators: [{ type: Optional }] }
];
CdkConnectedOverlay.propDecorators = {
    origin: [{ type: Input, args: ['cdkConnectedOverlayOrigin',] }],
    positions: [{ type: Input, args: ['cdkConnectedOverlayPositions',] }],
    positionStrategy: [{ type: Input, args: ['cdkConnectedOverlayPositionStrategy',] }],
    offsetX: [{ type: Input, args: ['cdkConnectedOverlayOffsetX',] }],
    offsetY: [{ type: Input, args: ['cdkConnectedOverlayOffsetY',] }],
    width: [{ type: Input, args: ['cdkConnectedOverlayWidth',] }],
    height: [{ type: Input, args: ['cdkConnectedOverlayHeight',] }],
    minWidth: [{ type: Input, args: ['cdkConnectedOverlayMinWidth',] }],
    minHeight: [{ type: Input, args: ['cdkConnectedOverlayMinHeight',] }],
    backdropClass: [{ type: Input, args: ['cdkConnectedOverlayBackdropClass',] }],
    panelClass: [{ type: Input, args: ['cdkConnectedOverlayPanelClass',] }],
    viewportMargin: [{ type: Input, args: ['cdkConnectedOverlayViewportMargin',] }],
    scrollStrategy: [{ type: Input, args: ['cdkConnectedOverlayScrollStrategy',] }],
    open: [{ type: Input, args: ['cdkConnectedOverlayOpen',] }],
    disableClose: [{ type: Input, args: ['cdkConnectedOverlayDisableClose',] }],
    transformOriginSelector: [{ type: Input, args: ['cdkConnectedOverlayTransformOriginOn',] }],
    hasBackdrop: [{ type: Input, args: ['cdkConnectedOverlayHasBackdrop',] }],
    lockPosition: [{ type: Input, args: ['cdkConnectedOverlayLockPosition',] }],
    flexibleDimensions: [{ type: Input, args: ['cdkConnectedOverlayFlexibleDimensions',] }],
    growAfterOpen: [{ type: Input, args: ['cdkConnectedOverlayGrowAfterOpen',] }],
    push: [{ type: Input, args: ['cdkConnectedOverlayPush',] }],
    backdropClick: [{ type: Output }],
    positionChange: [{ type: Output }],
    attach: [{ type: Output }],
    detach: [{ type: Output }],
    overlayKeydown: [{ type: Output }],
    overlayOutsideClick: [{ type: Output }]
};
/** @docs-private */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
    provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1kaXJlY3RpdmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L292ZXJsYXktZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQVksY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFlLHFCQUFxQixFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDMUUsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUNMLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLE1BQU0sRUFDTixjQUFjLEVBQ2QsS0FBSyxFQUdMLFFBQVEsRUFDUixNQUFNLEVBRU4sV0FBVyxFQUNYLGdCQUFnQixHQUNqQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUcvQyxPQUFPLEVBRUwsaUNBQWlDLEdBQ2xDLE1BQU0saURBQWlELENBQUM7QUFPekQsb0ZBQW9GO0FBQ3BGLE1BQU0sbUJBQW1CLEdBQXdCO0lBQy9DO1FBQ0UsT0FBTyxFQUFFLE9BQU87UUFDaEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsUUFBUSxFQUFFLE9BQU87UUFDakIsUUFBUSxFQUFFLEtBQUs7S0FDaEI7SUFDRDtRQUNFLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRSxLQUFLO1FBQ2QsUUFBUSxFQUFFLE9BQU87UUFD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bEMsS0FBSyxTQUFDLDRCQUE0QjtvQkFXbEMsS0FBSyxTQUFDLDBCQUEwQjtxQkFHaEMsS0FBSyxTQUFDLDJCQUEyQjt1QkFHakMsS0FBSyxTQUFDLDZCQUE2Qjt3QkFHbkMsS0FBSyxTQUFDLDhCQUE4Qjs0QkFHcEMsS0FBSyxTQUFDLGtDQUFrQzt5QkFHeEMsS0FBSyxTQUFDLCtCQUErQjs2QkFHckMsS0FBSyxTQUFDLG1DQUFtQzs2QkFHekMsS0FBSyxTQUFDLG1DQUFtQzttQkFHekMsS0FBSyxTQUFDLHlCQUF5QjsyQkFHL0IsS0FBSyxTQUFDLGlDQUFpQztzQ0FHdkMsS0FBSyxTQUFDLHNDQUFzQzswQkFHNUMsS0FBSyxTQUFDLGdDQUFnQzsyQkFLdEMsS0FBSyxTQUFDLGlDQUFpQztpQ0FLdkMsS0FBSyxTQUFDLHVDQUF1Qzs0QkFPN0MsS0FBSyxTQUFDLGtDQUFrQzttQkFLeEMsS0FBSyxTQUFDLHlCQUF5Qjs0QkFLL0IsTUFBTTs2QkFHTixNQUFNO3FCQUdOLE1BQU07cUJBR04sTUFBTTs2QkFHTixNQUFNO2tDQUdOLE1BQU07O0FBMk1ULG9CQUFvQjtBQUNwQixNQUFNLFVBQVUsc0RBQXNELENBQUMsT0FBZ0I7SUFFckYsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDckQsQ0FBQztBQUVELG9CQUFvQjtBQUNwQixNQUFNLENBQUMsTUFBTSw4Q0FBOEMsR0FBRztJQUM1RCxPQUFPLEVBQUUscUNBQXFDO0lBQzlDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztJQUNmLFVBQVUsRUFBRSxzREFBc0Q7Q0FDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7RVNDQVBFLCBoYXNNb2RpZmllcktleX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcclxuaW1wb3J0IHtUZW1wbGF0ZVBvcnRhbH0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BvcnRhbCc7XHJcbmltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIEluamVjdCxcclxuICBJbmplY3Rpb25Ub2tlbixcclxuICBJbnB1dCxcclxuICBPbkNoYW5nZXMsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9wdGlvbmFsLFxyXG4gIE91dHB1dCxcclxuICBTaW1wbGVDaGFuZ2VzLFxyXG4gIFRlbXBsYXRlUmVmLFxyXG4gIFZpZXdDb250YWluZXJSZWYsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHt0YWtlV2hpbGV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHtPdmVybGF5fSBmcm9tICcuL292ZXJsYXknO1xyXG5pbXBvcnQge092ZXJsYXlDb25maWd9IGZyb20gJy4vb3ZlcmxheS1jb25maWcnO1xyXG5pbXBvcnQge092ZXJsYXlSZWZ9IGZyb20gJy4vb3ZlcmxheS1yZWYnO1xyXG5pbXBvcnQge0Nvbm5lY3RlZE92ZXJsYXlQb3NpdGlvbkNoYW5nZX0gZnJvbSAnLi9wb3NpdGlvbi9jb25uZWN0ZWQtcG9zaXRpb24nO1xyXG5pbXBvcnQge1xyXG4gIENvbm5lY3RlZFBvc2l0aW9uLFxyXG4gIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSxcclxufSBmcm9tICcuL3Bvc2l0aW9uL2ZsZXhpYmxlLWNvbm5lY3RlZC1wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7XHJcbiAgUmVwb3NpdGlvblNjcm9sbFN0cmF0ZWd5LFxyXG4gIFNjcm9sbFN0cmF0ZWd5LFxyXG59IGZyb20gJy4vc2Nyb2xsL2luZGV4JztcclxuXHJcblxyXG4vKiogRGVmYXVsdCBzZXQgb2YgcG9zaXRpb25zIGZvciB0aGUgb3ZlcmxheS4gRm9sbG93cyB0aGUgYmVoYXZpb3Igb2YgYSBkcm9wZG93bi4gKi9cclxuY29uc3QgZGVmYXVsdFBvc2l0aW9uTGlzdDogQ29ubmVjdGVkUG9zaXRpb25bXSA9IFtcclxuICB7XHJcbiAgICBvcmlnaW5YOiAnc3RhcnQnLFxyXG4gICAgb3JpZ2luWTogJ2JvdHRvbScsXHJcbiAgICBvdmVybGF5WDogJ3N0YXJ0JyxcclxuICAgIG92ZXJsYXlZOiAndG9wJ1xyXG4gIH0sXHJcbiAge1xyXG4gICAgb3JpZ2luWDogJ3N0YXJ0JyxcclxuICAgIG9yaWdpblk6ICd0b3AnLFxyXG4gICAgb3ZlcmxheVg6ICdzdGFydCcsXHJcbiAgICBvdmVybGF5WTogJ2JvdHRvbSdcclxuICB9LFxyXG4gIHtcclxuICAgIG9yaWdpblg6ICdlbmQnLFxyXG4gICAgb3JpZ2luWTogJ3RvcCcsXHJcbiAgICBvdmVybGF5WDogJ2VuZCcsXHJcbiAgICBvdmVybGF5WTogJ2JvdHRvbSdcclxuICB9LFxyXG4gIHtcclxuICAgIG9yaWdpblg6ICdlbmQnLFxyXG4gICAgb3JpZ2luWTogJ2JvdHRvbScsXHJcbiAgICBvdmVybGF5WDogJ2VuZCcsXHJcbiAgICBvdmVybGF5WTogJ3RvcCdcclxuICB9XHJcbl07XHJcblxyXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgZGV0ZXJtaW5lcyB0aGUgc2Nyb2xsIGhhbmRsaW5nIHdoaWxlIHRoZSBjb25uZWN0ZWQgb3ZlcmxheSBpcyBvcGVuLiAqL1xyXG5leHBvcnQgY29uc3QgQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWSA9XHJcbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48KCkgPT4gU2Nyb2xsU3RyYXRlZ3k+KCdjZGstY29ubmVjdGVkLW92ZXJsYXktc2Nyb2xsLXN0cmF0ZWd5Jyk7XHJcblxyXG4vKipcclxuICogRGlyZWN0aXZlIGFwcGxpZWQgdG8gYW4gZWxlbWVudCB0byBtYWtlIGl0IHVzYWJsZSBhcyBhbiBvcmlnaW4gZm9yIGFuIE92ZXJsYXkgdXNpbmcgYVxyXG4gKiBDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5LlxyXG4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrLW92ZXJsYXktb3JpZ2luXSwgW292ZXJsYXktb3JpZ2luXSwgW2Nka092ZXJsYXlPcmlnaW5dJyxcclxuICBleHBvcnRBczogJ2Nka092ZXJsYXlPcmlnaW4nLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrT3ZlcmxheU9yaWdpbiB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAgIC8qKiBSZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnQgb24gd2hpY2ggdGhlIGRpcmVjdGl2ZSBpcyBhcHBsaWVkLiAqL1xyXG4gICAgICBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZikgeyB9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogRGlyZWN0aXZlIHRvIGZhY2lsaXRhdGUgZGVjbGFyYXRpdmUgY3JlYXRpb24gb2YgYW5cclxuICogT3ZlcmxheSB1c2luZyBhIEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneS5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nkay1jb25uZWN0ZWQtb3ZlcmxheV0sIFtjb25uZWN0ZWQtb3ZlcmxheV0sIFtjZGtDb25uZWN0ZWRPdmVybGF5XScsXHJcbiAgZXhwb3J0QXM6ICdjZGtDb25uZWN0ZWRPdmVybGF5J1xyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrQ29ubmVjdGVkT3ZlcmxheSBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcclxuICBwcml2YXRlIF9vdmVybGF5UmVmOiBPdmVybGF5UmVmO1xyXG4gIHByaXZhdGUgX3RlbXBsYXRlUG9ydGFsOiBUZW1wbGF0ZVBvcnRhbDtcclxuICBwcml2YXRlIF9oYXNCYWNrZHJvcCA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2xvY2tQb3NpdGlvbiA9IGZhbHNlO1xyXG4gIHByaXZhdGUgX2dyb3dBZnRlck9wZW4gPSBmYWxzZTtcclxuICBwcml2YXRlIF9mbGV4aWJsZURpbWVuc2lvbnMgPSBmYWxzZTtcclxuICBwcml2YXRlIF9wdXNoID0gZmFsc2U7XHJcbiAgcHJpdmF0ZSBfYmFja2Ryb3BTdWJzY3JpcHRpb24gPSBTdWJzY3JpcHRpb24uRU1QVFk7XHJcbiAgcHJpdmF0ZSBfYXR0YWNoU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xyXG4gIHByaXZhdGUgX2RldGFjaFN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuICBwcml2YXRlIF9wb3NpdGlvblN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcclxuICBwcml2YXRlIF9vZmZzZXRYOiBudW1iZXI7XHJcbiAgcHJpdmF0ZSBfb2Zmc2V0WTogbnVtYmVyO1xyXG4gIHByaXZhdGUgX3Bvc2l0aW9uOiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k7XHJcbiAgcHJpdmF0ZSBfc2Nyb2xsU3RyYXRlZ3lGYWN0b3J5OiAoKSA9PiBTY3JvbGxTdHJhdGVneTtcclxuXHJcbiAgLyoqIE9yaWdpbiBmb3IgdGhlIGNvbm5lY3RlZCBvdmVybGF5LiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheU9yaWdpbicpIG9yaWdpbjogQ2RrT3ZlcmxheU9yaWdpbjtcclxuXHJcbiAgLyoqIFJlZ2lzdGVyZWQgY29ubmVjdGVkIHBvc2l0aW9uIHBhaXJzLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVBvc2l0aW9ucycpIHBvc2l0aW9uczogQ29ubmVjdGVkUG9zaXRpb25bXTtcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpbnB1dCBvdmVycmlkZXMgdGhlIHBvc2l0aW9ucyBpbnB1dCBpZiBzcGVjaWZpZWQuIEl0IGxldHMgdXNlcnMgcGFzc1xyXG4gICAqIGluIGFyYml0cmFyeSBwb3NpdGlvbmluZyBzdHJhdGVnaWVzLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVBvc2l0aW9uU3RyYXRlZ3knKSBwb3NpdGlvblN0cmF0ZWd5OiBGbGV4aWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k7XHJcblxyXG4gIC8qKiBUaGUgb2Zmc2V0IGluIHBpeGVscyBmb3IgdGhlIG92ZXJsYXkgY29ubmVjdGlvbiBwb2ludCBvbiB0aGUgeC1heGlzICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5T2Zmc2V0WCcpXHJcbiAgZ2V0IG9mZnNldFgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX29mZnNldFg7IH1cclxuICBzZXQgb2Zmc2V0WChvZmZzZXRYOiBudW1iZXIpIHtcclxuICAgIHRoaXMuX29mZnNldFggPSBvZmZzZXRYO1xyXG5cclxuICAgIGlmICh0aGlzLl9wb3NpdGlvbikge1xyXG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX3Bvc2l0aW9uKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBUaGUgb2Zmc2V0IGluIHBpeGVscyBmb3IgdGhlIG92ZXJsYXkgY29ubmVjdGlvbiBwb2ludCBvbiB0aGUgeS1heGlzICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5T2Zmc2V0WScpXHJcbiAgZ2V0IG9mZnNldFkoKSB7IHJldHVybiB0aGlzLl9vZmZzZXRZOyB9XHJcbiAgc2V0IG9mZnNldFkob2Zmc2V0WTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9vZmZzZXRZID0gb2Zmc2V0WTtcclxuXHJcbiAgICBpZiAodGhpcy5fcG9zaXRpb24pIHtcclxuICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb25TdHJhdGVneSh0aGlzLl9wb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogVGhlIHdpZHRoIG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVdpZHRoJykgd2lkdGg6IG51bWJlciB8IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBoZWlnaHQgb2YgdGhlIG92ZXJsYXkgcGFuZWwuICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5SGVpZ2h0JykgaGVpZ2h0OiBudW1iZXIgfCBzdHJpbmc7XHJcblxyXG4gIC8qKiBUaGUgbWluIHdpZHRoIG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheU1pbldpZHRoJykgbWluV2lkdGg6IG51bWJlciB8IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBtaW4gaGVpZ2h0IG9mIHRoZSBvdmVybGF5IHBhbmVsLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheU1pbkhlaWdodCcpIG1pbkhlaWdodDogbnVtYmVyIHwgc3RyaW5nO1xyXG5cclxuICAvKiogVGhlIGN1c3RvbSBjbGFzcyB0byBiZSBzZXQgb24gdGhlIGJhY2tkcm9wIGVsZW1lbnQuICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5QmFja2Ryb3BDbGFzcycpIGJhY2tkcm9wQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBjdXN0b20gY2xhc3MgdG8gYWRkIHRvIHRoZSBvdmVybGF5IHBhbmUgZWxlbWVudC4gKi9cclxuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlQYW5lbENsYXNzJykgcGFuZWxDbGFzczogc3RyaW5nIHwgc3RyaW5nW107XHJcblxyXG4gIC8qKiBNYXJnaW4gYmV0d2VlbiB0aGUgb3ZlcmxheSBhbmQgdGhlIHZpZXdwb3J0IGVkZ2VzLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVZpZXdwb3J0TWFyZ2luJykgdmlld3BvcnRNYXJnaW46IG51bWJlciA9IDA7XHJcblxyXG4gIC8qKiBTdHJhdGVneSB0byBiZSB1c2VkIHdoZW4gaGFuZGxpbmcgc2Nyb2xsIGV2ZW50cyB3aGlsZSB0aGUgb3ZlcmxheSBpcyBvcGVuLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheVNjcm9sbFN0cmF0ZWd5Jykgc2Nyb2xsU3RyYXRlZ3k6IFNjcm9sbFN0cmF0ZWd5O1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSBpcyBvcGVuLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheU9wZW4nKSBvcGVuOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBiZSBjbG9zZWQgYnkgdXNlciBpbnRlcmFjdGlvbi4gKi9cclxuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlEaXNhYmxlQ2xvc2UnKSBkaXNhYmxlQ2xvc2U6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgLyoqIENTUyBzZWxlY3RvciB3aGljaCB0byBzZXQgdGhlIHRyYW5zZm9ybSBvcmlnaW4uICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5VHJhbnNmb3JtT3JpZ2luT24nKSB0cmFuc2Zvcm1PcmlnaW5TZWxlY3Rvcjogc3RyaW5nO1xyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgdGhlIG92ZXJsYXkgc2hvdWxkIGF0dGFjaCBhIGJhY2tkcm9wLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheUhhc0JhY2tkcm9wJylcclxuICBnZXQgaGFzQmFja2Ryb3AoKSB7IHJldHVybiB0aGlzLl9oYXNCYWNrZHJvcDsgfVxyXG4gIHNldCBoYXNCYWNrZHJvcCh2YWx1ZTogYW55KSB7IHRoaXMuX2hhc0JhY2tkcm9wID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxyXG5cclxuICAvKiogV2hldGhlciBvciBub3QgdGhlIG92ZXJsYXkgc2hvdWxkIGJlIGxvY2tlZCB3aGVuIHNjcm9sbGluZy4gKi9cclxuICBASW5wdXQoJ2Nka0Nvbm5lY3RlZE92ZXJsYXlMb2NrUG9zaXRpb24nKVxyXG4gIGdldCBsb2NrUG9zaXRpb24oKSB7IHJldHVybiB0aGlzLl9sb2NrUG9zaXRpb247IH1cclxuICBzZXQgbG9ja1Bvc2l0aW9uKHZhbHVlOiBhbnkpIHsgdGhpcy5fbG9ja1Bvc2l0aW9uID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxyXG5cclxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSdzIHdpZHRoIGFuZCBoZWlnaHQgY2FuIGJlIGNvbnN0cmFpbmVkIHRvIGZpdCB3aXRoaW4gdGhlIHZpZXdwb3J0LiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheUZsZXhpYmxlRGltZW5zaW9ucycpXHJcbiAgZ2V0IGZsZXhpYmxlRGltZW5zaW9ucygpIHsgcmV0dXJuIHRoaXMuX2ZsZXhpYmxlRGltZW5zaW9uczsgfVxyXG4gIHNldCBmbGV4aWJsZURpbWVuc2lvbnModmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHRoaXMuX2ZsZXhpYmxlRGltZW5zaW9ucyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgfVxyXG5cclxuICAvKiogV2hldGhlciB0aGUgb3ZlcmxheSBjYW4gZ3JvdyBhZnRlciB0aGUgaW5pdGlhbCBvcGVuIHdoZW4gZmxleGlibGUgcG9zaXRpb25pbmcgaXMgdHVybmVkIG9uLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29ubmVjdGVkT3ZlcmxheUdyb3dBZnRlck9wZW4nKVxyXG4gIGdldCBncm93QWZ0ZXJPcGVuKCkgeyByZXR1cm4gdGhpcy5fZ3Jvd0FmdGVyT3BlbjsgfVxyXG4gIHNldCBncm93QWZ0ZXJPcGVuKHZhbHVlOiBib29sZWFuKSB7IHRoaXMuX2dyb3dBZnRlck9wZW4gPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpOyB9XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBvdmVybGF5IGNhbiBiZSBwdXNoZWQgb24tc2NyZWVuIGlmIG5vbmUgb2YgdGhlIHByb3ZpZGVkIHBvc2l0aW9ucyBmaXQuICovXHJcbiAgQElucHV0KCdjZGtDb25uZWN0ZWRPdmVybGF5UHVzaCcpXHJcbiAgZ2V0IHB1c2goKSB7IHJldHVybiB0aGlzLl9wdXNoOyB9XHJcbiAgc2V0IHB1c2godmFsdWU6IGJvb2xlYW4pIHsgdGhpcy5fcHVzaCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7IH1cclxuXHJcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgYmFja2Ryb3AgaXMgY2xpY2tlZC4gKi9cclxuICBAT3V0cHV0KCkgYmFja2Ryb3BDbGljayA9IG5ldyBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4oKTtcclxuXHJcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgcG9zaXRpb24gaGFzIGNoYW5nZWQuICovXHJcbiAgQE91dHB1dCgpIHBvc2l0aW9uQ2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDb25uZWN0ZWRPdmVybGF5UG9zaXRpb25DaGFuZ2U+KCk7XHJcblxyXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIG92ZXJsYXkgaGFzIGJlZW4gYXR0YWNoZWQuICovXHJcbiAgQE91dHB1dCgpIGF0dGFjaCA9IG5ldyBFdmVudEVtaXR0ZXI8dm9pZD4oKTtcclxuXHJcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgb3ZlcmxheSBoYXMgYmVlbiBkZXRhY2hlZC4gKi9cclxuICBAT3V0cHV0KCkgZGV0YWNoID0gbmV3IEV2ZW50RW1pdHRlcjx2b2lkPigpO1xyXG5cclxuICAvKiogRW1pdHMgd2hlbiB0aGVyZSBhcmUga2V5Ym9hcmQgZXZlbnRzIHRoYXQgYXJlIHRhcmdldGVkIGF0IHRoZSBvdmVybGF5LiAqL1xyXG4gIEBPdXRwdXQoKSBvdmVybGF5S2V5ZG93biA9IG5ldyBFdmVudEVtaXR0ZXI8S2V5Ym9hcmRFdmVudD4oKTtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlcmUgYXJlIG1vdXNlIG91dHNpZGUgY2xpY2sgZXZlbnRzIHRoYXQgYXJlIHRhcmdldGVkIGF0IHRoZSBvdmVybGF5LiAqL1xyXG4gIEBPdXRwdXQoKSBvdmVybGF5T3V0c2lkZUNsaWNrID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG5cclxuICAvLyBUT0RPKGplbGJvdXJuKTogaW5wdXRzIGZvciBzaXplLCBzY3JvbGwgYmVoYXZpb3IsIGFuaW1hdGlvbiwgZXRjLlxyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgcHJpdmF0ZSBfb3ZlcmxheTogT3ZlcmxheSxcclxuICAgICAgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT4sXHJcbiAgICAgIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXHJcbiAgICAgIEBJbmplY3QoQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWSkgc2Nyb2xsU3RyYXRlZ3lGYWN0b3J5OiBhbnksXHJcbiAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uYWxpdHkpIHtcclxuICAgIHRoaXMuX3RlbXBsYXRlUG9ydGFsID0gbmV3IFRlbXBsYXRlUG9ydGFsKHRlbXBsYXRlUmVmLCB2aWV3Q29udGFpbmVyUmVmKTtcclxuICAgIHRoaXMuX3Njcm9sbFN0cmF0ZWd5RmFjdG9yeSA9IHNjcm9sbFN0cmF0ZWd5RmFjdG9yeTtcclxuICAgIHRoaXMuc2Nyb2xsU3RyYXRlZ3kgPSB0aGlzLl9zY3JvbGxTdHJhdGVneUZhY3RvcnkoKTtcclxuICB9XHJcblxyXG4gIC8qKiBUaGUgYXNzb2NpYXRlZCBvdmVybGF5IHJlZmVyZW5jZS4gKi9cclxuICBnZXQgb3ZlcmxheVJlZigpOiBPdmVybGF5UmVmIHtcclxuICAgIHJldHVybiB0aGlzLl9vdmVybGF5UmVmO1xyXG4gIH1cclxuXHJcbiAgLyoqIFRoZSBlbGVtZW50J3MgbGF5b3V0IGRpcmVjdGlvbi4gKi9cclxuICBnZXQgZGlyKCk6IERpcmVjdGlvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGlyID8gdGhpcy5fZGlyLnZhbHVlIDogJ2x0cic7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX2F0dGFjaFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5fZGV0YWNoU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB0aGlzLl9iYWNrZHJvcFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy5fcG9zaXRpb25TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuXHJcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcclxuICAgIGlmICh0aGlzLl9wb3NpdGlvbikge1xyXG4gICAgICB0aGlzLl91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHRoaXMuX3Bvc2l0aW9uKTtcclxuICAgICAgdGhpcy5fb3ZlcmxheVJlZi51cGRhdGVTaXplKHtcclxuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcclxuICAgICAgICBtaW5XaWR0aDogdGhpcy5taW5XaWR0aCxcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0LFxyXG4gICAgICAgIG1pbkhlaWdodDogdGhpcy5taW5IZWlnaHQsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKGNoYW5nZXNbJ29yaWdpbiddICYmIHRoaXMub3Blbikge1xyXG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uLmFwcGx5KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoY2hhbmdlc1snb3BlbiddKSB7XHJcbiAgICAgIHRoaXMub3BlbiA/IHRoaXMuX2F0dGFjaE92ZXJsYXkoKSA6IHRoaXMuX2RldGFjaE92ZXJsYXkoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDcmVhdGVzIGFuIG92ZXJsYXkgKi9cclxuICBwcml2YXRlIF9jcmVhdGVPdmVybGF5KCkge1xyXG4gICAgaWYgKCF0aGlzLnBvc2l0aW9ucyB8fCAhdGhpcy5wb3NpdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMucG9zaXRpb25zID0gZGVmYXVsdFBvc2l0aW9uTGlzdDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvdmVybGF5UmVmID0gdGhpcy5fb3ZlcmxheVJlZiA9IHRoaXMuX292ZXJsYXkuY3JlYXRlKHRoaXMuX2J1aWxkQ29uZmlnKCkpO1xyXG4gICAgdGhpcy5fYXR0YWNoU3Vic2NyaXB0aW9uID0gb3ZlcmxheVJlZi5hdHRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmF0dGFjaC5lbWl0KCkpO1xyXG4gICAgdGhpcy5fZGV0YWNoU3Vic2NyaXB0aW9uID0gb3ZlcmxheVJlZi5kZXRhY2htZW50cygpLnN1YnNjcmliZSgoKSA9PiB0aGlzLmRldGFjaC5lbWl0KCkpO1xyXG4gICAgb3ZlcmxheVJlZi5rZXlkb3duRXZlbnRzKCkuc3Vic2NyaWJlKChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xyXG4gICAgICB0aGlzLm92ZXJsYXlLZXlkb3duLm5leHQoZXZlbnQpO1xyXG5cclxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEVTQ0FQRSAmJiAhdGhpcy5kaXNhYmxlQ2xvc2UgJiYgIWhhc01vZGlmaWVyS2V5KGV2ZW50KSkge1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5fZGV0YWNoT3ZlcmxheSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9vdmVybGF5UmVmLm91dHNpZGVQb2ludGVyRXZlbnRzKCkuc3Vic2NyaWJlKChldmVudDogTW91c2VFdmVudCkgPT4ge1xyXG4gICAgICB0aGlzLm92ZXJsYXlPdXRzaWRlQ2xpY2submV4dChldmVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKiBCdWlsZHMgdGhlIG92ZXJsYXkgY29uZmlnIGJhc2VkIG9uIHRoZSBkaXJlY3RpdmUncyBpbnB1dHMgKi9cclxuICBwcml2YXRlIF9idWlsZENvbmZpZygpOiBPdmVybGF5Q29uZmlnIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uU3RyYXRlZ3kgPSB0aGlzLl9wb3NpdGlvbiA9XHJcbiAgICAgIHRoaXMucG9zaXRpb25TdHJhdGVneSB8fCB0aGlzLl9jcmVhdGVQb3NpdGlvblN0cmF0ZWd5KCk7XHJcbiAgICBjb25zdCBvdmVybGF5Q29uZmlnID0gbmV3IE92ZXJsYXlDb25maWcoe1xyXG4gICAgICBkaXJlY3Rpb246IHRoaXMuX2RpcixcclxuICAgICAgcG9zaXRpb25TdHJhdGVneSxcclxuICAgICAgc2Nyb2xsU3RyYXRlZ3k6IHRoaXMuc2Nyb2xsU3RyYXRlZ3ksXHJcbiAgICAgIGhhc0JhY2tkcm9wOiB0aGlzLmhhc0JhY2tkcm9wXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAodGhpcy53aWR0aCB8fCB0aGlzLndpZHRoID09PSAwKSB7XHJcbiAgICAgIG92ZXJsYXlDb25maWcud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhlaWdodCB8fCB0aGlzLmhlaWdodCA9PT0gMCkge1xyXG4gICAgICBvdmVybGF5Q29uZmlnLmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLm1pbldpZHRoIHx8IHRoaXMubWluV2lkdGggPT09IDApIHtcclxuICAgICAgb3ZlcmxheUNvbmZpZy5taW5XaWR0aCA9IHRoaXMubWluV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMubWluSGVpZ2h0IHx8IHRoaXMubWluSGVpZ2h0ID09PSAwKSB7XHJcbiAgICAgIG92ZXJsYXlDb25maWcubWluSGVpZ2h0ID0gdGhpcy5taW5IZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuYmFja2Ryb3BDbGFzcykge1xyXG4gICAgICBvdmVybGF5Q29uZmlnLmJhY2tkcm9wQ2xhc3MgPSB0aGlzLmJhY2tkcm9wQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucGFuZWxDbGFzcykge1xyXG4gICAgICBvdmVybGF5Q29uZmlnLnBhbmVsQ2xhc3MgPSB0aGlzLnBhbmVsQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG92ZXJsYXlDb25maWc7XHJcbiAgfVxyXG5cclxuICAvKiogVXBkYXRlcyB0aGUgc3RhdGUgb2YgYSBwb3NpdGlvbiBzdHJhdGVneSwgYmFzZWQgb24gdGhlIHZhbHVlcyBvZiB0aGUgZGlyZWN0aXZlIGlucHV0cy4gKi9cclxuICBwcml2YXRlIF91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHBvc2l0aW9uU3RyYXRlZ3k6IEZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSkge1xyXG4gICAgY29uc3QgcG9zaXRpb25zOiBDb25uZWN0ZWRQb3NpdGlvbltdID0gdGhpcy5wb3NpdGlvbnMubWFwKGN1cnJlbnRQb3NpdGlvbiA9PiAoe1xyXG4gICAgICBvcmlnaW5YOiBjdXJyZW50UG9zaXRpb24ub3JpZ2luWCxcclxuICAgICAgb3JpZ2luWTogY3VycmVudFBvc2l0aW9uLm9yaWdpblksXHJcbiAgICAgIG92ZXJsYXlYOiBjdXJyZW50UG9zaXRpb24ub3ZlcmxheVgsXHJcbiAgICAgIG92ZXJsYXlZOiBjdXJyZW50UG9zaXRpb24ub3ZlcmxheVksXHJcbiAgICAgIG9mZnNldFg6IGN1cnJlbnRQb3NpdGlvbi5vZmZzZXRYIHx8IHRoaXMub2Zmc2V0WCxcclxuICAgICAgb2Zmc2V0WTogY3VycmVudFBvc2l0aW9uLm9mZnNldFkgfHwgdGhpcy5vZmZzZXRZLFxyXG4gICAgICBwYW5lbENsYXNzOiBjdXJyZW50UG9zaXRpb24ucGFuZWxDbGFzcyB8fCB1bmRlZmluZWQsXHJcbiAgICB9KSk7XHJcblxyXG4gICAgcmV0dXJuIHBvc2l0aW9uU3RyYXRlZ3lcclxuICAgICAgLnNldE9yaWdpbih0aGlzLm9yaWdpbi5lbGVtZW50UmVmKVxyXG4gICAgICAud2l0aFBvc2l0aW9ucyhwb3NpdGlvbnMpXHJcbiAgICAgIC53aXRoRmxleGlibGVEaW1lbnNpb25zKHRoaXMuZmxleGlibGVEaW1lbnNpb25zKVxyXG4gICAgICAud2l0aFB1c2godGhpcy5wdXNoKVxyXG4gICAgICAud2l0aEdyb3dBZnRlck9wZW4odGhpcy5ncm93QWZ0ZXJPcGVuKVxyXG4gICAgICAud2l0aFZpZXdwb3J0TWFyZ2luKHRoaXMudmlld3BvcnRNYXJnaW4pXHJcbiAgICAgIC53aXRoTG9ja2VkUG9zaXRpb24odGhpcy5sb2NrUG9zaXRpb24pXHJcbiAgICAgIC53aXRoVHJhbnNmb3JtT3JpZ2luT24odGhpcy50cmFuc2Zvcm1PcmlnaW5TZWxlY3Rvcik7XHJcbiAgfVxyXG5cclxuICAvKiogUmV0dXJucyB0aGUgcG9zaXRpb24gc3RyYXRlZ3kgb2YgdGhlIG92ZXJsYXkgdG8gYmUgc2V0IG9uIHRoZSBvdmVybGF5IGNvbmZpZyAqL1xyXG4gIHByaXZhdGUgX2NyZWF0ZVBvc2l0aW9uU3RyYXRlZ3koKTogRmxleGlibGVDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5IHtcclxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5fb3ZlcmxheS5wb3NpdGlvbigpLmZsZXhpYmxlQ29ubmVjdGVkVG8odGhpcy5vcmlnaW4uZWxlbWVudFJlZik7XHJcbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvblN0cmF0ZWd5KHN0cmF0ZWd5KTtcclxuICAgIHJldHVybiBzdHJhdGVneTtcclxuICB9XHJcblxyXG4gIC8qKiBBdHRhY2hlcyB0aGUgb3ZlcmxheSBhbmQgc3Vic2NyaWJlcyB0byBiYWNrZHJvcCBjbGlja3MgaWYgYmFja2Ryb3AgZXhpc3RzICovXHJcbiAgcHJpdmF0ZSBfYXR0YWNoT3ZlcmxheSgpIHtcclxuICAgIGlmICghdGhpcy5fb3ZlcmxheVJlZikge1xyXG4gICAgICB0aGlzLl9jcmVhdGVPdmVybGF5KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBVcGRhdGUgdGhlIG92ZXJsYXkgc2l6ZSwgaW4gY2FzZSB0aGUgZGlyZWN0aXZlJ3MgaW5wdXRzIGhhdmUgY2hhbmdlZFxyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLmhhc0JhY2tkcm9wID0gdGhpcy5oYXNCYWNrZHJvcDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmF0dGFjaCh0aGlzLl90ZW1wbGF0ZVBvcnRhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaGFzQmFja2Ryb3ApIHtcclxuICAgICAgdGhpcy5fYmFja2Ryb3BTdWJzY3JpcHRpb24gPSB0aGlzLl9vdmVybGF5UmVmLmJhY2tkcm9wQ2xpY2soKS5zdWJzY3JpYmUoZXZlbnQgPT4ge1xyXG4gICAgICAgIHRoaXMuYmFja2Ryb3BDbGljay5lbWl0KGV2ZW50KTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9iYWNrZHJvcFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX3Bvc2l0aW9uU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcblxyXG4gICAgLy8gT25seSBzdWJzY3JpYmUgdG8gYHBvc2l0aW9uQ2hhbmdlc2AgaWYgcmVxdWVzdGVkLCBiZWNhdXNlIHB1dHRpbmdcclxuICAgIC8vIHRvZ2V0aGVyIGFsbCB0aGUgaW5mb3JtYXRpb24gZm9yIGl0IGNhbiBiZSBleHBlbnNpdmUuXHJcbiAgICBpZiAodGhpcy5wb3NpdGlvbkNoYW5nZS5vYnNlcnZlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLl9wb3NpdGlvblN1YnNjcmlwdGlvbiA9IHRoaXMuX3Bvc2l0aW9uLnBvc2l0aW9uQ2hhbmdlc1xyXG4gICAgICAgIC5waXBlKHRha2VXaGlsZSgoKSA9PiB0aGlzLnBvc2l0aW9uQ2hhbmdlLm9ic2VydmVycy5sZW5ndGggPiAwKSlcclxuICAgICAgICAuc3Vic2NyaWJlKHBvc2l0aW9uID0+IHtcclxuICAgICAgICAgIHRoaXMucG9zaXRpb25DaGFuZ2UuZW1pdChwb3NpdGlvbik7XHJcblxyXG4gICAgICAgICAgaWYgKHRoaXMucG9zaXRpb25DaGFuZ2Uub2JzZXJ2ZXJzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLl9wb3NpdGlvblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIERldGFjaGVzIHRoZSBvdmVybGF5IGFuZCB1bnN1YnNjcmliZXMgdG8gYmFja2Ryb3AgY2xpY2tzIGlmIGJhY2tkcm9wIGV4aXN0cyAqL1xyXG4gIHByaXZhdGUgX2RldGFjaE92ZXJsYXkoKSB7XHJcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLmRldGFjaCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2JhY2tkcm9wU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB0aGlzLl9wb3NpdGlvblN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2hhc0JhY2tkcm9wOiBCb29sZWFuSW5wdXQ7XHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2xvY2tQb3NpdGlvbjogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9mbGV4aWJsZURpbWVuc2lvbnM6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZ3Jvd0FmdGVyT3BlbjogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wdXNoOiBCb29sZWFuSW5wdXQ7XHJcbn1cclxuXHJcblxyXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUl9GQUNUT1JZKG92ZXJsYXk6IE92ZXJsYXkpOlxyXG4gICAgKCkgPT4gUmVwb3NpdGlvblNjcm9sbFN0cmF0ZWd5IHtcclxuICByZXR1cm4gKCkgPT4gb3ZlcmxheS5zY3JvbGxTdHJhdGVnaWVzLnJlcG9zaXRpb24oKTtcclxufVxyXG5cclxuLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuZXhwb3J0IGNvbnN0IENES19DT05ORUNURURfT1ZFUkxBWV9TQ1JPTExfU1RSQVRFR1lfUFJPVklERVIgPSB7XHJcbiAgcHJvdmlkZTogQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWSxcclxuICBkZXBzOiBbT3ZlcmxheV0sXHJcbiAgdXNlRmFjdG9yeTogQ0RLX0NPTk5FQ1RFRF9PVkVSTEFZX1NDUk9MTF9TVFJBVEVHWV9QUk9WSURFUl9GQUNUT1JZLFxyXG59O1xyXG4iXX0=