/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, Directive, EventEmitter, NgModule, Output, TemplateRef, ViewContainerRef, Inject, } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BasePortalOutlet, TemplatePortal } from './portal';
/**
 * Directive version of a `TemplatePortal`. Because the directive *is* a TemplatePortal,
 * the directive instance itself can be attached to a host, enabling declarative use of portals.
 */
export class CdkPortal extends TemplatePortal {
    constructor(templateRef, viewContainerRef) {
        super(templateRef, viewContainerRef);
    }
}
CdkPortal.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortal]',
                exportAs: 'cdkPortal',
            },] }
];
CdkPortal.ctorParameters = () => [
    { type: TemplateRef },
    { type: ViewContainerRef }
];
/**
 * @deprecated Use `CdkPortal` instead.
 * @breaking-change 9.0.0
 */
export class TemplatePortalDirective extends CdkPortal {
}
TemplatePortalDirective.decorators = [
    { type: Directive, args: [{
                selector: '[cdk-portal], [portal]',
                exportAs: 'cdkPortal',
                providers: [{
                        provide: CdkPortal,
                        useExisting: TemplatePortalDirective
                    }]
            },] }
];
/**
 * Directive version of a PortalOutlet. Because the directive *is* a PortalOutlet, portals can be
 * directly attached to it, enabling declarative use.
 *
 * Usage:
 * `<ng-template [cdkPortalOutlet]="greeting"></ng-template>`
 */
export class CdkPortalOutlet extends BasePortalOutlet {
    constructor(_componentFactoryResolver, _viewContainerRef, 
    /**
     * @deprecated `_document` parameter to be made required.
     * @breaking-change 9.0.0
     */
    _document) {
        super();
        this._componentFactoryResolver = _componentFactoryResolver;
        this._viewContainerRef = _viewContainerRef;
        /** Whether the portal component is initialized. */
        this._isInitialized = false;
        /** Emits when a portal is attached to the outlet. */
        this.attached = new EventEmitter();
        /**
         * Attaches the given DomPortal to this PortalHost by moving all of the portal content into it.
         * @param portal Portal to be attached.
         * @deprecated To be turned into a method.
         * @breaking-change 10.0.0
         */
        this.attachDomPortal = (portal) => {
            // @breaking-change 9.0.0 Remove check and error once the
            // `_document` constructor parameter is required.
            if (!this._document && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('Cannot attach DOM portal without _document constructor parameter');
            }
            const element = portal.element;
            if (!element.parentNode && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('DOM portal content must be attached to a parent node.');
            }
            // Anchor used to save the element's previous position so
            // that we can restore it when the portal is detached.
            const anchorNode = this._document.createComment('dom-portal');
            portal.setAttachedHost(this);
            element.parentNode.insertBefore(anchorNode, element);
            this._getRootNode().appendChild(element);
            this._attachedPortal = portal;
            super.setDisposeFn(() => {
                if (anchorNode.parentNode) {
                    anchorNode.parentNode.replaceChild(element, anchorNode);
                }
            });
        };
        this._document = _document;
    }
    /** Portal associated with the Portal outlet. */
    get portal() {
        return this._attachedPortal;
    }
    set portal(portal) {
        // Ignore the cases where the `portal` is set to a falsy value before the lifecycle hooks have
        // run. This handles the cases where the user might do something like `<div cdkPortalOutlet>`
        // and attach a portal programmatically in the parent component. When Angular does the first CD
        // round, it will fire the setter with empty string, causing the user's content to be cleared.
        if (this.hasAttached() && !portal && !this._isInitialized) {
            return;
        }
        if (this.hasAttached()) {
            super.detach();
        }
        if (portal) {
            super.attach(portal);
        }
        this._attachedPortal = portal;
    }
    /** Component or view reference that is attached to the portal. */
    get attachedRef() {
        return this._attachedRef;
    }
    ngOnInit() {
        this._isInitialized = true;
    }
    ngOnDestroy() {
        super.dispose();
        this._attachedPortal = null;
        this._attachedRef = null;
    }
    /**
     * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
     *
     * @param portal Portal to be attached to the portal outlet.
     * @returns Reference to the created component.
     */
    attachComponentPortal(portal) {
        portal.setAttachedHost(this);
        // If the portal specifies an origin, use that as the logical location of the component
        // in the application tree. Otherwise use the location of this PortalOutlet.
        const viewContainerRef = portal.viewContainerRef != null ?
            portal.viewContainerRef :
            this._viewContainerRef;
        const resolver = portal.componentFactoryResolver || this._componentFactoryResolver;
        const componentFactory = resolver.resolveComponentFactory(portal.component);
        const ref = viewContainerRef.createComponent(componentFactory, viewContainerRef.length, portal.injector || viewContainerRef.injector);
        // If we're using a view container that's different from the injected one (e.g. when the portal
        // specifies its own) we need to move the component into the outlet, otherwise it'll be rendered
        // inside of the alternate view container.
        if (viewContainerRef !== this._viewContainerRef) {
            this._getRootNode().appendChild(ref.hostView.rootNodes[0]);
        }
        super.setDisposeFn(() => ref.destroy());
        this._attachedPortal = portal;
        this._attachedRef = ref;
        this.attached.emit(ref);
        return ref;
    }
    /**
     * Attach the given TemplatePortal to this PortalHost as an embedded View.
     * @param portal Portal to be attached.
     * @returns Reference to the created embedded view.
     */
    attachTemplatePortal(portal) {
        portal.setAttachedHost(this);
        const viewRef = this._viewContainerRef.createEmbeddedView(portal.templateRef, portal.context);
        super.setDisposeFn(() => this._viewContainerRef.clear());
        this._attachedPortal = portal;
        this._attachedRef = viewRef;
        this.attached.emit(viewRef);
        return viewRef;
    }
    /** Gets the root node of the portal outlet. */
    _getRootNode() {
        const nativeElement = this._viewContainerRef.element.nativeElement;
        // The directive could be set on a template which will result in a comment
        // node being the root. Use the comment's parent node if that is the case.
        return (nativeElement.nodeType === nativeElement.ELEMENT_NODE ?
            nativeElement : nativeElement.parentNode);
    }
}
CdkPortalOutlet.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortalOutlet]',
                exportAs: 'cdkPortalOutlet',
                inputs: ['portal: cdkPortalOutlet']
            },] }
];
CdkPortalOutlet.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: ViewContainerRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
CdkPortalOutlet.propDecorators = {
    attached: [{ type: Output }]
};
/**
 * @deprecated Use `CdkPortalOutlet` instead.
 * @breaking-change 9.0.0
 */
export class PortalHostDirective extends CdkPortalOutlet {
}
PortalHostDirective.decorators = [
    { type: Directive, args: [{
                selector: '[cdkPortalHost], [portalHost]',
                exportAs: 'cdkPortalHost',
                inputs: ['portal: cdkPortalHost'],
                providers: [{
                        provide: CdkPortalOutlet,
                        useExisting: PortalHostDirective
                    }]
            },] }
];
export class PortalModule {
}
PortalModule.decorators = [
    { type: NgModule, args: [{
                exports: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
                declarations: [CdkPortal, CdkPortalOutlet, TemplatePortalDirective, PortalHostDirective],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydGFsLWRpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BvcnRhbC9wb3J0YWwtZGlyZWN0aXZlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsd0JBQXdCLEVBRXhCLFNBQVMsRUFFVCxZQUFZLEVBQ1osUUFBUSxFQUdSLE1BQU0sRUFDTixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLGdCQUFnQixFQUEyQixjQUFjLEVBQVksTUFBTSxVQUFVLENBQUM7QUFHOUY7OztHQUdHO0FBS0gsTUFBTSxPQUFPLFNBQVUsU0FBUSxjQUFjO0lBQzNDLFlBQVksV0FBNkIsRUFBRSxnQkFBa0M7UUFDM0UsS0FBSyxDQUFDLFdBQVcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7OztZQVBGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsUUFBUSxFQUFFLFdBQVc7YUFDdEI7OztZQWZDLFdBQVc7WUFDWCxnQkFBZ0I7O0FBcUJsQjs7O0dBR0c7QUFTSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsU0FBUzs7O1lBUnJELFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxRQUFRLEVBQUUsV0FBVztnQkFDckIsU0FBUyxFQUFFLENBQUM7d0JBQ1YsT0FBTyxFQUFFLFNBQVM7d0JBQ2xCLFdBQVcsRUFBRSx1QkFBdUI7cUJBQ3JDLENBQUM7YUFDSDs7QUFTRDs7Ozs7O0dBTUc7QUFNSCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxnQkFBZ0I7SUFTbkQsWUFDWSx5QkFBbUQsRUFDbkQsaUJBQW1DO0lBRTNDOzs7T0FHRztJQUNlLFNBQWU7UUFDbkMsS0FB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TyxFQUFFLGVBQWU7d0JBQ3hCLFdBQVcsRUFBRSxtQkFBbUI7cUJBQ2pDLENBQUM7YUFDSDs7QUFRRCxNQUFNLE9BQU8sWUFBWTs7O1lBSnhCLFFBQVEsU0FBQztnQkFDUixPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDO2dCQUNuRixZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLG1CQUFtQixDQUFDO2FBQ3pGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICBDb21wb25lbnRSZWYsXHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVtYmVkZGVkVmlld1JlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgTmdNb2R1bGUsXHJcbiAgT25EZXN0cm95LFxyXG4gIE9uSW5pdCxcclxuICBPdXRwdXQsXHJcbiAgVGVtcGxhdGVSZWYsXHJcbiAgVmlld0NvbnRhaW5lclJlZixcclxuICBJbmplY3QsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7QmFzZVBvcnRhbE91dGxldCwgQ29tcG9uZW50UG9ydGFsLCBQb3J0YWwsIFRlbXBsYXRlUG9ydGFsLCBEb21Qb3J0YWx9IGZyb20gJy4vcG9ydGFsJztcclxuXHJcblxyXG4vKipcclxuICogRGlyZWN0aXZlIHZlcnNpb24gb2YgYSBgVGVtcGxhdGVQb3J0YWxgLiBCZWNhdXNlIHRoZSBkaXJlY3RpdmUgKmlzKiBhIFRlbXBsYXRlUG9ydGFsLFxyXG4gKiB0aGUgZGlyZWN0aXZlIGluc3RhbmNlIGl0c2VsZiBjYW4gYmUgYXR0YWNoZWQgdG8gYSBob3N0LCBlbmFibGluZyBkZWNsYXJhdGl2ZSB1c2Ugb2YgcG9ydGFscy5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka1BvcnRhbF0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka1BvcnRhbCBleHRlbmRzIFRlbXBsYXRlUG9ydGFsIHtcclxuICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55Piwgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgc3VwZXIodGVtcGxhdGVSZWYsIHZpZXdDb250YWluZXJSZWYpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBkZXByZWNhdGVkIFVzZSBgQ2RrUG9ydGFsYCBpbnN0ZWFkLlxyXG4gKiBAYnJlYWtpbmctY2hhbmdlIDkuMC4wXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGstcG9ydGFsXSwgW3BvcnRhbF0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsJyxcclxuICBwcm92aWRlcnM6IFt7XHJcbiAgICBwcm92aWRlOiBDZGtQb3J0YWwsXHJcbiAgICB1c2VFeGlzdGluZzogVGVtcGxhdGVQb3J0YWxEaXJlY3RpdmVcclxuICB9XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQb3J0YWxEaXJlY3RpdmUgZXh0ZW5kcyBDZGtQb3J0YWwge31cclxuXHJcbi8qKlxyXG4gKiBQb3NzaWJsZSBhdHRhY2hlZCByZWZlcmVuY2VzIHRvIHRoZSBDZGtQb3J0YWxPdXRsZXQuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZiA9IENvbXBvbmVudFJlZjxhbnk+IHwgRW1iZWRkZWRWaWV3UmVmPGFueT4gfCBudWxsO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBEaXJlY3RpdmUgdmVyc2lvbiBvZiBhIFBvcnRhbE91dGxldC4gQmVjYXVzZSB0aGUgZGlyZWN0aXZlICppcyogYSBQb3J0YWxPdXRsZXQsIHBvcnRhbHMgY2FuIGJlXHJcbiAqIGRpcmVjdGx5IGF0dGFjaGVkIHRvIGl0LCBlbmFibGluZyBkZWNsYXJhdGl2ZSB1c2UuXHJcbiAqXHJcbiAqIFVzYWdlOlxyXG4gKiBgPG5nLXRlbXBsYXRlIFtjZGtQb3J0YWxPdXRsZXRdPVwiZ3JlZXRpbmdcIj48L25nLXRlbXBsYXRlPmBcclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka1BvcnRhbE91dGxldF0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsT3V0bGV0JyxcclxuICBpbnB1dHM6IFsncG9ydGFsOiBjZGtQb3J0YWxPdXRsZXQnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrUG9ydGFsT3V0bGV0IGV4dGVuZHMgQmFzZVBvcnRhbE91dGxldCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBwb3J0YWwgY29tcG9uZW50IGlzIGluaXRpYWxpemVkLiAqL1xyXG4gIHByaXZhdGUgX2lzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudGx5LWF0dGFjaGVkIGNvbXBvbmVudC92aWV3IHJlZi4gKi9cclxuICBwcml2YXRlIF9hdHRhY2hlZFJlZjogQ2RrUG9ydGFsT3V0bGV0QXR0YWNoZWRSZWY7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIF9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcclxuICAgICAgcHJpdmF0ZSBfdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBAZGVwcmVjYXRlZCBgX2RvY3VtZW50YCBwYXJhbWV0ZXIgdG8gYmUgbWFkZSByZXF1aXJlZC5cclxuICAgICAgICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxyXG4gICAgICAgKi9cclxuICAgICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50PzogYW55KSB7XHJcbiAgICBzdXBlcigpO1xyXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvKiogUG9ydGFsIGFzc29jaWF0ZWQgd2l0aCB0aGUgUG9ydGFsIG91dGxldC4gKi9cclxuICBnZXQgcG9ydGFsKCk6IFBvcnRhbDxhbnk+IHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYXR0YWNoZWRQb3J0YWw7XHJcbiAgfVxyXG5cclxuICBzZXQgcG9ydGFsKHBvcnRhbDogUG9ydGFsPGFueT4gfCBudWxsKSB7XHJcbiAgICAvLyBJZ25vcmUgdGhlIGNhc2VzIHdoZXJlIHRoZSBgcG9ydGFsYCBpcyBzZXQgdG8gYSBmYWxzeSB2YWx1ZSBiZWZvcmUgdGhlIGxpZmVjeWNsZSBob29rcyBoYXZlXHJcbiAgICAvLyBydW4uIFRoaXMgaGFuZGxlcyB0aGUgY2FzZXMgd2hlcmUgdGhlIHVzZXIgbWlnaHQgZG8gc29tZXRoaW5nIGxpa2UgYDxkaXYgY2RrUG9ydGFsT3V0bGV0PmBcclxuICAgIC8vIGFuZCBhdHRhY2ggYSBwb3J0YWwgcHJvZ3JhbW1hdGljYWxseSBpbiB0aGUgcGFyZW50IGNvbXBvbmVudC4gV2hlbiBBbmd1bGFyIGRvZXMgdGhlIGZpcnN0IENEXHJcbiAgICAvLyByb3VuZCwgaXQgd2lsbCBmaXJlIHRoZSBzZXR0ZXIgd2l0aCBlbXB0eSBzdHJpbmcsIGNhdXNpbmcgdGhlIHVzZXIncyBjb250ZW50IHRvIGJlIGNsZWFyZWQuXHJcbiAgICBpZiAodGhpcy5oYXNBdHRhY2hlZCgpICYmICFwb3J0YWwgJiYgIXRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmhhc0F0dGFjaGVkKCkpIHtcclxuICAgICAgc3VwZXIuZGV0YWNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBvcnRhbCkge1xyXG4gICAgICBzdXBlci5hdHRhY2gocG9ydGFsKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9hdHRhY2hlZFBvcnRhbCA9IHBvcnRhbDtcclxuICB9XHJcblxyXG4gIC8qKiBFbWl0cyB3aGVuIGEgcG9ydGFsIGlzIGF0dGFjaGVkIHRvIHRoZSBvdXRsZXQuICovXHJcbiAgQE91dHB1dCgpIGF0dGFjaGVkOiBFdmVudEVtaXR0ZXI8Q2RrUG9ydGFsT3V0bGV0QXR0YWNoZWRSZWY+ID1cclxuICAgICAgbmV3IEV2ZW50RW1pdHRlcjxDZGtQb3J0YWxPdXRsZXRBdHRhY2hlZFJlZj4oKTtcclxuXHJcbiAgLyoqIENvbXBvbmVudCBvciB2aWV3IHJlZmVyZW5jZSB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBwb3J0YWwuICovXHJcbiAgZ2V0IGF0dGFjaGVkUmVmKCk6IENka1BvcnRhbE91dGxldEF0dGFjaGVkUmVmIHtcclxuICAgIHJldHVybiB0aGlzLl9hdHRhY2hlZFJlZjtcclxuICB9XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gbnVsbDtcclxuICAgIHRoaXMuX2F0dGFjaGVkUmVmID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGFjaCB0aGUgZ2l2ZW4gQ29tcG9uZW50UG9ydGFsIHRvIHRoaXMgUG9ydGFsT3V0bGV0IHVzaW5nIHRoZSBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZCB0byB0aGUgcG9ydGFsIG91dGxldC5cclxuICAgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhlIGNyZWF0ZWQgY29tcG9uZW50LlxyXG4gICAqL1xyXG4gIGF0dGFjaENvbXBvbmVudFBvcnRhbDxUPihwb3J0YWw6IENvbXBvbmVudFBvcnRhbDxUPik6IENvbXBvbmVudFJlZjxUPiB7XHJcbiAgICBwb3J0YWwuc2V0QXR0YWNoZWRIb3N0KHRoaXMpO1xyXG5cclxuICAgIC8vIElmIHRoZSBwb3J0YWwgc3BlY2lmaWVzIGFuIG9yaWdpbiwgdXNlIHRoYXQgYXMgdGhlIGxvZ2ljYWwgbG9jYXRpb24gb2YgdGhlIGNvbXBvbmVudFxyXG4gICAgLy8gaW4gdGhlIGFwcGxpY2F0aW9uIHRyZWUuIE90aGVyd2lzZSB1c2UgdGhlIGxvY2F0aW9uIG9mIHRoaXMgUG9ydGFsT3V0bGV0LlxyXG4gICAgY29uc3Qgdmlld0NvbnRhaW5lclJlZiA9IHBvcnRhbC52aWV3Q29udGFpbmVyUmVmICE9IG51bGwgP1xyXG4gICAgICAgIHBvcnRhbC52aWV3Q29udGFpbmVyUmVmIDpcclxuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmO1xyXG5cclxuICAgIGNvbnN0IHJlc29sdmVyID0gcG9ydGFsLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlciB8fCB0aGlzLl9jb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI7XHJcbiAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gcmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkocG9ydGFsLmNvbXBvbmVudCk7XHJcbiAgICBjb25zdCByZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudChcclxuICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB2aWV3Q29udGFpbmVyUmVmLmxlbmd0aCxcclxuICAgICAgICBwb3J0YWwuaW5qZWN0b3IgfHwgdmlld0NvbnRhaW5lclJlZi5pbmplY3Rvcik7XHJcblxyXG4gICAgLy8gSWYgd2UncmUgdXNpbmcgYSB2aWV3IGNvbnRhaW5lciB0aGF0J3MgZGlmZmVyZW50IGZyb20gdGhlIGluamVjdGVkIG9uZSAoZS5nLiB3aGVuIHRoZSBwb3J0YWxcclxuICAgIC8vIHNwZWNpZmllcyBpdHMgb3duKSB3ZSBuZWVkIHRvIG1vdmUgdGhlIGNvbXBvbmVudCBpbnRvIHRoZSBvdXRsZXQsIG90aGVyd2lzZSBpdCdsbCBiZSByZW5kZXJlZFxyXG4gICAgLy8gaW5zaWRlIG9mIHRoZSBhbHRlcm5hdGUgdmlldyBjb250YWluZXIuXHJcbiAgICBpZiAodmlld0NvbnRhaW5lclJlZiAhPT0gdGhpcy5fdmlld0NvbnRhaW5lclJlZikge1xyXG4gICAgICB0aGlzLl9nZXRSb290Tm9kZSgpLmFwcGVuZENoaWxkKChyZWYuaG9zdFZpZXcgYXMgRW1iZWRkZWRWaWV3UmVmPGFueT4pLnJvb3ROb2Rlc1swXSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIuc2V0RGlzcG9zZUZuKCgpID0+IHJlZi5kZXN0cm95KCkpO1xyXG4gICAgdGhpcy5fYXR0YWNoZWRQb3J0YWwgPSBwb3J0YWw7XHJcbiAgICB0aGlzLl9hdHRhY2hlZFJlZiA9IHJlZjtcclxuICAgIHRoaXMuYXR0YWNoZWQuZW1pdChyZWYpO1xyXG5cclxuICAgIHJldHVybiByZWY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRhY2ggdGhlIGdpdmVuIFRlbXBsYXRlUG9ydGFsIHRvIHRoaXMgUG9ydGFsSG9zdCBhcyBhbiBlbWJlZGRlZCBWaWV3LlxyXG4gICAqIEBwYXJhbSBwb3J0YWwgUG9ydGFsIHRvIGJlIGF0dGFjaGVkLlxyXG4gICAqIEByZXR1cm5zIFJlZmVyZW5jZSB0byB0aGUgY3JlYXRlZCBlbWJlZGRlZCB2aWV3LlxyXG4gICAqL1xyXG4gIGF0dGFjaFRlbXBsYXRlUG9ydGFsPEM+KHBvcnRhbDogVGVtcGxhdGVQb3J0YWw8Qz4pOiBFbWJlZGRlZFZpZXdSZWY8Qz4ge1xyXG4gICAgcG9ydGFsLnNldEF0dGFjaGVkSG9zdCh0aGlzKTtcclxuICAgIGNvbnN0IHZpZXdSZWYgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyhwb3J0YWwudGVtcGxhdGVSZWYsIHBvcnRhbC5jb250ZXh0KTtcclxuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCkpO1xyXG5cclxuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsO1xyXG4gICAgdGhpcy5fYXR0YWNoZWRSZWYgPSB2aWV3UmVmO1xyXG4gICAgdGhpcy5hdHRhY2hlZC5lbWl0KHZpZXdSZWYpO1xyXG5cclxuICAgIHJldHVybiB2aWV3UmVmO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXR0YWNoZXMgdGhlIGdpdmVuIERvbVBvcnRhbCB0byB0aGlzIFBvcnRhbEhvc3QgYnkgbW92aW5nIGFsbCBvZiB0aGUgcG9ydGFsIGNvbnRlbnQgaW50byBpdC5cclxuICAgKiBAcGFyYW0gcG9ydGFsIFBvcnRhbCB0byBiZSBhdHRhY2hlZC5cclxuICAgKiBAZGVwcmVjYXRlZCBUbyBiZSB0dXJuZWQgaW50byBhIG1ldGhvZC5cclxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDEwLjAuMFxyXG4gICAqL1xyXG4gIGF0dGFjaERvbVBvcnRhbCA9IChwb3J0YWw6IERvbVBvcnRhbCkgPT4ge1xyXG4gICAgLy8gQGJyZWFraW5nLWNoYW5nZSA5LjAuMCBSZW1vdmUgY2hlY2sgYW5kIGVycm9yIG9uY2UgdGhlXHJcbiAgICAvLyBgX2RvY3VtZW50YCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQuXHJcbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50ICYmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpKSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdDYW5ub3QgYXR0YWNoIERPTSBwb3J0YWwgd2l0aG91dCBfZG9jdW1lbnQgY29uc3RydWN0b3IgcGFyYW1ldGVyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZWxlbWVudCA9IHBvcnRhbC5lbGVtZW50O1xyXG4gICAgaWYgKCFlbGVtZW50LnBhcmVudE5vZGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoJ0RPTSBwb3J0YWwgY29udGVudCBtdXN0IGJlIGF0dGFjaGVkIHRvIGEgcGFyZW50IG5vZGUuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQW5jaG9yIHVzZWQgdG8gc2F2ZSB0aGUgZWxlbWVudCdzIHByZXZpb3VzIHBvc2l0aW9uIHNvXHJcbiAgICAvLyB0aGF0IHdlIGNhbiByZXN0b3JlIGl0IHdoZW4gdGhlIHBvcnRhbCBpcyBkZXRhY2hlZC5cclxuICAgIGNvbnN0IGFuY2hvck5vZGUgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVDb21tZW50KCdkb20tcG9ydGFsJyk7XHJcblxyXG4gICAgcG9ydGFsLnNldEF0dGFjaGVkSG9zdCh0aGlzKTtcclxuICAgIGVsZW1lbnQucGFyZW50Tm9kZSEuaW5zZXJ0QmVmb3JlKGFuY2hvck5vZGUsIGVsZW1lbnQpO1xyXG4gICAgdGhpcy5fZ2V0Um9vdE5vZGUoKS5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIHRoaXMuX2F0dGFjaGVkUG9ydGFsID0gcG9ydGFsO1xyXG5cclxuICAgIHN1cGVyLnNldERpc3Bvc2VGbigoKSA9PiB7XHJcbiAgICAgIGlmIChhbmNob3JOb2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgICBhbmNob3JOb2RlLnBhcmVudE5vZGUhLnJlcGxhY2VDaGlsZChlbGVtZW50LCBhbmNob3JOb2RlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgcm9vdCBub2RlIG9mIHRoZSBwb3J0YWwgb3V0bGV0LiAqL1xyXG4gIHByaXZhdGUgX2dldFJvb3ROb2RlKCk6IEhUTUxFbGVtZW50IHtcclxuICAgIGNvbnN0IG5hdGl2ZUVsZW1lbnQ6IE5vZGUgPSB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmVsZW1lbnQubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICAvLyBUaGUgZGlyZWN0aXZlIGNvdWxkIGJlIHNldCBvbiBhIHRlbXBsYXRlIHdoaWNoIHdpbGwgcmVzdWx0IGluIGEgY29tbWVudFxyXG4gICAgLy8gbm9kZSBiZWluZyB0aGUgcm9vdC4gVXNlIHRoZSBjb21tZW50J3MgcGFyZW50IG5vZGUgaWYgdGhhdCBpcyB0aGUgY2FzZS5cclxuICAgIHJldHVybiAobmF0aXZlRWxlbWVudC5ub2RlVHlwZSA9PT0gbmF0aXZlRWxlbWVudC5FTEVNRU5UX05PREUgP1xyXG4gICAgICAgICAgIG5hdGl2ZUVsZW1lbnQgOiBuYXRpdmVFbGVtZW50LnBhcmVudE5vZGUhKSBhcyBIVE1MRWxlbWVudDtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9wb3J0YWw6IFBvcnRhbDxhbnk+IHwgbnVsbCB8IHVuZGVmaW5lZCB8ICcnO1xyXG59XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgVXNlIGBDZGtQb3J0YWxPdXRsZXRgIGluc3RlYWQuXHJcbiAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka1BvcnRhbEhvc3RdLCBbcG9ydGFsSG9zdF0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrUG9ydGFsSG9zdCcsXHJcbiAgaW5wdXRzOiBbJ3BvcnRhbDogY2RrUG9ydGFsSG9zdCddLFxyXG4gIHByb3ZpZGVyczogW3tcclxuICAgIHByb3ZpZGU6IENka1BvcnRhbE91dGxldCxcclxuICAgIHVzZUV4aXN0aW5nOiBQb3J0YWxIb3N0RGlyZWN0aXZlXHJcbiAgfV1cclxufSlcclxuZXhwb3J0IGNsYXNzIFBvcnRhbEhvc3REaXJlY3RpdmUgZXh0ZW5kcyBDZGtQb3J0YWxPdXRsZXQge31cclxuXHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGV4cG9ydHM6IFtDZGtQb3J0YWwsIENka1BvcnRhbE91dGxldCwgVGVtcGxhdGVQb3J0YWxEaXJlY3RpdmUsIFBvcnRhbEhvc3REaXJlY3RpdmVdLFxyXG4gIGRlY2xhcmF0aW9uczogW0Nka1BvcnRhbCwgQ2RrUG9ydGFsT3V0bGV0LCBUZW1wbGF0ZVBvcnRhbERpcmVjdGl2ZSwgUG9ydGFsSG9zdERpcmVjdGl2ZV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQb3J0YWxNb2R1bGUge31cclxuIl19