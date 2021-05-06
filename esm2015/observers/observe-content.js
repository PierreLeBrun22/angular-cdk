/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty, coerceNumberProperty, coerceElement } from '@angular/cdk/coercion';
import { Directive, ElementRef, EventEmitter, Injectable, Input, NgModule, NgZone, Output, } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as i0 from "@angular/core";
/**
 * Factory that creates a new MutationObserver and allows us to stub it out in unit tests.
 * @docs-private
 */
export class MutationObserverFactory {
    create(callback) {
        return typeof MutationObserver === 'undefined' ? null : new MutationObserver(callback);
    }
}
MutationObserverFactory.ɵprov = i0.ɵɵdefineInjectable({ factory: function MutationObserverFactory_Factory() { return new MutationObserverFactory(); }, token: MutationObserverFactory, providedIn: "root" });
MutationObserverFactory.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** An injectable service that allows watching elements for changes to their content. */
export class ContentObserver {
    constructor(_mutationObserverFactory) {
        this._mutationObserverFactory = _mutationObserverFactory;
        /** Keeps track of the existing MutationObservers so they can be reused. */
        this._observedElements = new Map();
    }
    ngOnDestroy() {
        this._observedElements.forEach((_, element) => this._cleanupObserver(element));
    }
    observe(elementOrRef) {
        const element = coerceElement(elementOrRef);
        return new Observable((observer) => {
            const stream = this._observeElement(element);
            const subscription = stream.subscribe(observer);
            return () => {
                subscription.unsubscribe();
                this._unobserveElement(element);
            };
        });
    }
    /**
     * Observes the given element by using the existing MutationObserver if available, or creating a
     * new one if not.
     */
    _observeElement(element) {
        if (!this._observedElements.has(element)) {
            const stream = new Subject();
            const observer = this._mutationObserverFactory.create(mutations => stream.next(mutations));
            if (observer) {
                observer.observe(element, {
                    characterData: true,
                    childList: true,
                    subtree: true
                });
            }
            this._observedElements.set(element, { observer, stream, count: 1 });
        }
        else {
            this._observedElements.get(element).count++;
        }
        return this._observedElements.get(element).stream;
    }
    /**
     * Un-observes the given element and cleans up the underlying MutationObserver if nobody else is
     * observing this element.
     */
    _unobserveElement(element) {
        if (this._observedElements.has(element)) {
            this._observedElements.get(element).count--;
            if (!this._observedElements.get(element).count) {
                this._cleanupObserver(element);
            }
        }
    }
    /** Clean up the underlying MutationObserver for the specified element. */
    _cleanupObserver(element) {
        if (this._observedElements.has(element)) {
            const { observer, stream } = this._observedElements.get(element);
            if (observer) {
                observer.disconnect();
            }
            stream.complete();
            this._observedElements.delete(element);
        }
    }
}
ContentObserver.ɵprov = i0.ɵɵdefineInjectable({ factory: function ContentObserver_Factory() { return new ContentObserver(i0.ɵɵinject(MutationObserverFactory)); }, token: ContentObserver, providedIn: "root" });
ContentObserver.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ContentObserver.ctorParameters = () => [
    { type: MutationObserverFactory }
];
/**
 * Directive that triggers a callback whenever the content of
 * its associated element has changed.
 */
export class CdkObserveContent {
    constructor(_contentObserver, _elementRef, _ngZone) {
        this._contentObserver = _contentObserver;
        this._elementRef = _elementRef;
        this._ngZone = _ngZone;
        /** Event emitted for each change in the element's content. */
        this.event = new EventEmitter();
        this._disabled = false;
        this._currentSubscription = null;
    }
    /**
     * Whether observing content is disabled. This option can be used
     * to disconnect the underlying MutationObserver until it is needed.
     */
    get disabled() { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this._disabled ? this._unsubscribe() : this._subscribe();
    }
    /** Debounce interval for emitting the changes. */
    get debounce() { return this._debounce; }
    set debounce(value) {
        this._debounce = coerceNumberProperty(value);
        this._subscribe();
    }
    ngAfterContentInit() {
        if (!this._currentSubscription && !this.disabled) {
            this._subscribe();
        }
    }
    ngOnDestroy() {
        this._unsubscribe();
    }
    _subscribe() {
        this._unsubscribe();
        const stream = this._contentObserver.observe(this._elementRef);
        // TODO(mmalerba): We shouldn't be emitting on this @Output() outside the zone.
        // Consider brining it back inside the zone next time we're making breaking changes.
        // Bringing it back inside can cause things like infinite change detection loops and changed
        // after checked errors if people's code isn't handling it properly.
        this._ngZone.runOutsideAngular(() => {
            this._currentSubscription =
                (this.debounce ? stream.pipe(debounceTime(this.debounce)) : stream).subscribe(this.event);
        });
    }
    _unsubscribe() {
        var _a;
        (_a = this._currentSubscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
    }
}
CdkObserveContent.decorators = [
    { type: Directive, args: [{
                selector: '[cdkObserveContent]',
                exportAs: 'cdkObserveContent',
            },] }
];
CdkObserveContent.ctorParameters = () => [
    { type: ContentObserver },
    { type: ElementRef },
    { type: NgZone }
];
CdkObserveContent.propDecorators = {
    event: [{ type: Output, args: ['cdkObserveContent',] }],
    disabled: [{ type: Input, args: ['cdkObserveContentDisabled',] }],
    debounce: [{ type: Input }]
};
export class ObserversModule {
}
ObserversModule.decorators = [
    { type: NgModule, args: [{
                exports: [CdkObserveContent],
                declarations: [CdkObserveContent],
                providers: [MutationObserverFactory]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2ZS1jb250ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vYnNlcnZlcnMvb2JzZXJ2ZS1jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxxQkFBcUIsRUFDckIsb0JBQW9CLEVBQ3BCLGFBQWEsRUFHZCxNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFFTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsS0FBSyxFQUNMLFFBQVEsRUFDUixNQUFNLEVBRU4sTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUF5QixNQUFNLE1BQU0sQ0FBQztBQUNqRSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBRTVDOzs7R0FHRztBQUVILE1BQU0sT0FBTyx1QkFBdUI7SUFDbEMsTUFBTSxDQUFDLFFBQTBCO1FBQy9CLE9BQU8sT0FBTyxnQkFBZ0IsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6RixDQUFDOzs7O1lBSkYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUFRaEMsd0ZBQXdGO0FBRXhGLE1BQU0sT0FBTyxlQUFlO0lBUTFCLFlBQW9CLHdCQUFpRDtRQUFqRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQXlCO1FBUHJFLDJFQUEyRTtRQUNuRSxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFJL0IsQ0FBQztJQUVtRSxDQUFDO0lBRXpFLFdBQVc7UUFDVCxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixD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Q3BCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRS9ELCtFQUErRTtRQUMvRSxvRkFBb0Y7UUFDcEYsNEZBQTRGO1FBQzVGLG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNsQyxJQUFJLENBQUMsb0JBQW9CO2dCQUNyQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLFlBQVk7O1FBQ2xCLE1BQUEsSUFBSSxDQUFDLG9CQUFvQiwwQ0FBRSxXQUFXLEdBQUc7SUFDM0MsQ0FBQzs7O1lBN0RGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixRQUFRLEVBQUUsbUJBQW1CO2FBQzlCOzs7WUE0QnVDLGVBQWU7WUF0SnJELFVBQVU7WUFLVixNQUFNOzs7b0JBd0hMLE1BQU0sU0FBQyxtQkFBbUI7dUJBTTFCLEtBQUssU0FBQywyQkFBMkI7dUJBU2pDLEtBQUs7O0FBb0RSLE1BQU0sT0FBTyxlQUFlOzs7WUFMM0IsUUFBUSxTQUFDO2dCQUNSLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO2dCQUM1QixZQUFZLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztnQkFDakMsU0FBUyxFQUFFLENBQUMsdUJBQXVCLENBQUM7YUFDckMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxyXG4gIGNvZXJjZU51bWJlclByb3BlcnR5LFxyXG4gIGNvZXJjZUVsZW1lbnQsXHJcbiAgQm9vbGVhbklucHV0LFxyXG4gIE51bWJlcklucHV0XHJcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBBZnRlckNvbnRlbnRJbml0LFxyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBJbmplY3RhYmxlLFxyXG4gIElucHV0LFxyXG4gIE5nTW9kdWxlLFxyXG4gIE5nWm9uZSxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT3V0cHV0LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge2RlYm91bmNlVGltZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuLyoqXHJcbiAqIEZhY3RvcnkgdGhhdCBjcmVhdGVzIGEgbmV3IE11dGF0aW9uT2JzZXJ2ZXIgYW5kIGFsbG93cyB1cyB0byBzdHViIGl0IG91dCBpbiB1bml0IHRlc3RzLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIE11dGF0aW9uT2JzZXJ2ZXJGYWN0b3J5IHtcclxuICBjcmVhdGUoY2FsbGJhY2s6IE11dGF0aW9uQ2FsbGJhY2spOiBNdXRhdGlvbk9ic2VydmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdHlwZW9mIE11dGF0aW9uT2JzZXJ2ZXIgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IG5ldyBNdXRhdGlvbk9ic2VydmVyKGNhbGxiYWNrKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vKiogQW4gaW5qZWN0YWJsZSBzZXJ2aWNlIHRoYXQgYWxsb3dzIHdhdGNoaW5nIGVsZW1lbnRzIGZvciBjaGFuZ2VzIHRvIHRoZWlyIGNvbnRlbnQuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgQ29udGVudE9ic2VydmVyIGltcGxlbWVudHMgT25EZXN0cm95IHtcclxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIGV4aXN0aW5nIE11dGF0aW9uT2JzZXJ2ZXJzIHNvIHRoZXkgY2FuIGJlIHJldXNlZC4gKi9cclxuICBwcml2YXRlIF9vYnNlcnZlZEVsZW1lbnRzID0gbmV3IE1hcDxFbGVtZW50LCB7XHJcbiAgICBvYnNlcnZlcjogTXV0YXRpb25PYnNlcnZlciB8IG51bGwsXHJcbiAgICBzdHJlYW06IFN1YmplY3Q8TXV0YXRpb25SZWNvcmRbXT4sXHJcbiAgICBjb3VudDogbnVtYmVyXHJcbiAgfT4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbXV0YXRpb25PYnNlcnZlckZhY3Rvcnk6IE11dGF0aW9uT2JzZXJ2ZXJGYWN0b3J5KSB7fVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX29ic2VydmVkRWxlbWVudHMuZm9yRWFjaCgoXywgZWxlbWVudCkgPT4gdGhpcy5fY2xlYW51cE9ic2VydmVyKGVsZW1lbnQpKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ic2VydmUgY29udGVudCBjaGFuZ2VzIG9uIGFuIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gb2JzZXJ2ZSBmb3IgY29udGVudCBjaGFuZ2VzLlxyXG4gICAqL1xyXG4gIG9ic2VydmUoZWxlbWVudDogRWxlbWVudCk6IE9ic2VydmFibGU8TXV0YXRpb25SZWNvcmRbXT47XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ic2VydmUgY29udGVudCBjaGFuZ2VzIG9uIGFuIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gb2JzZXJ2ZSBmb3IgY29udGVudCBjaGFuZ2VzLlxyXG4gICAqL1xyXG4gIG9ic2VydmUoZWxlbWVudDogRWxlbWVudFJlZjxFbGVtZW50Pik6IE9ic2VydmFibGU8TXV0YXRpb25SZWNvcmRbXT47XHJcblxyXG4gIG9ic2VydmUoZWxlbWVudE9yUmVmOiBFbGVtZW50IHwgRWxlbWVudFJlZjxFbGVtZW50Pik6IE9ic2VydmFibGU8TXV0YXRpb25SZWNvcmRbXT4ge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGNvZXJjZUVsZW1lbnQoZWxlbWVudE9yUmVmKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxNdXRhdGlvblJlY29yZFtdPikgPT4ge1xyXG4gICAgICBjb25zdCBzdHJlYW0gPSB0aGlzLl9vYnNlcnZlRWxlbWVudChlbGVtZW50KTtcclxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc3RyZWFtLnN1YnNjcmliZShvYnNlcnZlcik7XHJcblxyXG4gICAgICByZXR1cm4gKCkgPT4ge1xyXG4gICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIHRoaXMuX3Vub2JzZXJ2ZUVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICAgIH07XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ic2VydmVzIHRoZSBnaXZlbiBlbGVtZW50IGJ5IHVzaW5nIHRoZSBleGlzdGluZyBNdXRhdGlvbk9ic2VydmVyIGlmIGF2YWlsYWJsZSwgb3IgY3JlYXRpbmcgYVxyXG4gICAqIG5ldyBvbmUgaWYgbm90LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX29ic2VydmVFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBTdWJqZWN0PE11dGF0aW9uUmVjb3JkW10+IHtcclxuICAgIGlmICghdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5oYXMoZWxlbWVudCkpIHtcclxuICAgICAgY29uc3Qgc3RyZWFtID0gbmV3IFN1YmplY3Q8TXV0YXRpb25SZWNvcmRbXT4oKTtcclxuICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSB0aGlzLl9tdXRhdGlvbk9ic2VydmVyRmFjdG9yeS5jcmVhdGUobXV0YXRpb25zID0+IHN0cmVhbS5uZXh0KG11dGF0aW9ucykpO1xyXG4gICAgICBpZiAob2JzZXJ2ZXIpIHtcclxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQsIHtcclxuICAgICAgICAgIGNoYXJhY3RlckRhdGE6IHRydWUsXHJcbiAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXHJcbiAgICAgICAgICBzdWJ0cmVlOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5zZXQoZWxlbWVudCwge29ic2VydmVyLCBzdHJlYW0sIGNvdW50OiAxfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuY291bnQrKztcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuc3RyZWFtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW4tb2JzZXJ2ZXMgdGhlIGdpdmVuIGVsZW1lbnQgYW5kIGNsZWFucyB1cCB0aGUgdW5kZXJseWluZyBNdXRhdGlvbk9ic2VydmVyIGlmIG5vYm9keSBlbHNlIGlzXHJcbiAgICogb2JzZXJ2aW5nIHRoaXMgZWxlbWVudC5cclxuICAgKi9cclxuICBwcml2YXRlIF91bm9ic2VydmVFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpIHtcclxuICAgIGlmICh0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xyXG4gICAgICB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuY291bnQtLTtcclxuICAgICAgaWYgKCF0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSEuY291bnQpIHtcclxuICAgICAgICB0aGlzLl9jbGVhbnVwT2JzZXJ2ZXIoZWxlbWVudCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDbGVhbiB1cCB0aGUgdW5kZXJseWluZyBNdXRhdGlvbk9ic2VydmVyIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuICovXHJcbiAgcHJpdmF0ZSBfY2xlYW51cE9ic2VydmVyKGVsZW1lbnQ6IEVsZW1lbnQpIHtcclxuICAgIGlmICh0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmhhcyhlbGVtZW50KSkge1xyXG4gICAgICBjb25zdCB7b2JzZXJ2ZXIsIHN0cmVhbX0gPSB0aGlzLl9vYnNlcnZlZEVsZW1lbnRzLmdldChlbGVtZW50KSE7XHJcbiAgICAgIGlmIChvYnNlcnZlcikge1xyXG4gICAgICAgIG9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgfVxyXG4gICAgICBzdHJlYW0uY29tcGxldGUoKTtcclxuICAgICAgdGhpcy5fb2JzZXJ2ZWRFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIERpcmVjdGl2ZSB0aGF0IHRyaWdnZXJzIGEgY2FsbGJhY2sgd2hlbmV2ZXIgdGhlIGNvbnRlbnQgb2ZcclxuICogaXRzIGFzc29jaWF0ZWQgZWxlbWVudCBoYXMgY2hhbmdlZC5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka09ic2VydmVDb250ZW50XScsXHJcbiAgZXhwb3J0QXM6ICdjZGtPYnNlcnZlQ29udGVudCcsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtPYnNlcnZlQ29udGVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XHJcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgZm9yIGVhY2ggY2hhbmdlIGluIHRoZSBlbGVtZW50J3MgY29udGVudC4gKi9cclxuICBAT3V0cHV0KCdjZGtPYnNlcnZlQ29udGVudCcpIGV2ZW50ID0gbmV3IEV2ZW50RW1pdHRlcjxNdXRhdGlvblJlY29yZFtdPigpO1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIG9ic2VydmluZyBjb250ZW50IGlzIGRpc2FibGVkLiBUaGlzIG9wdGlvbiBjYW4gYmUgdXNlZFxyXG4gICAqIHRvIGRpc2Nvbm5lY3QgdGhlIHVuZGVybHlpbmcgTXV0YXRpb25PYnNlcnZlciB1bnRpbCBpdCBpcyBuZWVkZWQuXHJcbiAgICovXHJcbiAgQElucHV0KCdjZGtPYnNlcnZlQ29udGVudERpc2FibGVkJylcclxuICBnZXQgZGlzYWJsZWQoKSB7IHJldHVybiB0aGlzLl9kaXNhYmxlZDsgfVxyXG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYW55KSB7XHJcbiAgICB0aGlzLl9kaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgICB0aGlzLl9kaXNhYmxlZCA/IHRoaXMuX3Vuc3Vic2NyaWJlKCkgOiB0aGlzLl9zdWJzY3JpYmUoKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfZGlzYWJsZWQgPSBmYWxzZTtcclxuXHJcbiAgLyoqIERlYm91bmNlIGludGVydmFsIGZvciBlbWl0dGluZyB0aGUgY2hhbmdlcy4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBkZWJvdW5jZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZGVib3VuY2U7IH1cclxuICBzZXQgZGVib3VuY2UodmFsdWU6IG51bWJlcikge1xyXG4gICAgdGhpcy5fZGVib3VuY2UgPSBjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSk7XHJcbiAgICB0aGlzLl9zdWJzY3JpYmUoKTtcclxuICB9XHJcbiAgcHJpdmF0ZSBfZGVib3VuY2U6IG51bWJlcjtcclxuXHJcbiAgcHJpdmF0ZSBfY3VycmVudFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2NvbnRlbnRPYnNlcnZlcjogQ29udGVudE9ic2VydmVyLFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2VsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7fVxyXG5cclxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XHJcbiAgICBpZiAoIXRoaXMuX2N1cnJlbnRTdWJzY3JpcHRpb24gJiYgIXRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgdGhpcy5fc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX3Vuc3Vic2NyaWJlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9zdWJzY3JpYmUoKSB7XHJcbiAgICB0aGlzLl91bnN1YnNjcmliZSgpO1xyXG4gICAgY29uc3Qgc3RyZWFtID0gdGhpcy5fY29udGVudE9ic2VydmVyLm9ic2VydmUodGhpcy5fZWxlbWVudFJlZik7XHJcblxyXG4gICAgLy8gVE9ETyhtbWFsZXJiYSk6IFdlIHNob3VsZG4ndCBiZSBlbWl0dGluZyBvbiB0aGlzIEBPdXRwdXQoKSBvdXRzaWRlIHRoZSB6b25lLlxyXG4gICAgLy8gQ29uc2lkZXIgYnJpbmluZyBpdCBiYWNrIGluc2lkZSB0aGUgem9uZSBuZXh0IHRpbWUgd2UncmUgbWFraW5nIGJyZWFraW5nIGNoYW5nZXMuXHJcbiAgICAvLyBCcmluZ2luZyBpdCBiYWNrIGluc2lkZSBjYW4gY2F1c2UgdGhpbmdzIGxpa2UgaW5maW5pdGUgY2hhbmdlIGRldGVjdGlvbiBsb29wcyBhbmQgY2hhbmdlZFxyXG4gICAgLy8gYWZ0ZXIgY2hlY2tlZCBlcnJvcnMgaWYgcGVvcGxlJ3MgY29kZSBpc24ndCBoYW5kbGluZyBpdCBwcm9wZXJseS5cclxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIHRoaXMuX2N1cnJlbnRTdWJzY3JpcHRpb24gPVxyXG4gICAgICAgICAgKHRoaXMuZGVib3VuY2UgPyBzdHJlYW0ucGlwZShkZWJvdW5jZVRpbWUodGhpcy5kZWJvdW5jZSkpIDogc3RyZWFtKS5zdWJzY3JpYmUodGhpcy5ldmVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3Vuc3Vic2NyaWJlKCkge1xyXG4gICAgdGhpcy5fY3VycmVudFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kZWJvdW5jZTogTnVtYmVySW5wdXQ7XHJcbn1cclxuXHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGV4cG9ydHM6IFtDZGtPYnNlcnZlQ29udGVudF0sXHJcbiAgZGVjbGFyYXRpb25zOiBbQ2RrT2JzZXJ2ZUNvbnRlbnRdLFxyXG4gIHByb3ZpZGVyczogW011dGF0aW9uT2JzZXJ2ZXJGYWN0b3J5XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgT2JzZXJ2ZXJzTW9kdWxlIHt9XHJcbiJdfQ==