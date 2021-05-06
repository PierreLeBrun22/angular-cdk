/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { Directive, ElementRef, EventEmitter, Injectable, NgZone, Output, } from '@angular/core';
import { coerceElement } from '@angular/cdk/coercion';
import { EMPTY, Subject } from 'rxjs';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/** Options to pass to the animationstart listener. */
const listenerOptions = normalizePassiveListenerOptions({ passive: true });
/**
 * An injectable service that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
export class AutofillMonitor {
    constructor(_platform, _ngZone) {
        this._platform = _platform;
        this._ngZone = _ngZone;
        this._monitoredElements = new Map();
    }
    monitor(elementOrRef) {
        if (!this._platform.isBrowser) {
            return EMPTY;
        }
        const element = coerceElement(elementOrRef);
        const info = this._monitoredElements.get(element);
        if (info) {
            return info.subject;
        }
        const result = new Subject();
        const cssClass = 'cdk-text-field-autofilled';
        const listener = ((event) => {
            // Animation events fire on initial element render, we check for the presence of the autofill
            // CSS class to make sure this is a real change in state, not just the initial render before
            // we fire off events.
            if (event.animationName === 'cdk-text-field-autofill-start' &&
                !element.classList.contains(cssClass)) {
                element.classList.add(cssClass);
                this._ngZone.run(() => result.next({ target: event.target, isAutofilled: true }));
            }
            else if (event.animationName === 'cdk-text-field-autofill-end' &&
                element.classList.contains(cssClass)) {
                element.classList.remove(cssClass);
                this._ngZone.run(() => result.next({ target: event.target, isAutofilled: false }));
            }
        });
        this._ngZone.runOutsideAngular(() => {
            element.addEventListener('animationstart', listener, listenerOptions);
            element.classList.add('cdk-text-field-autofill-monitored');
        });
        this._monitoredElements.set(element, {
            subject: result,
            unlisten: () => {
                element.removeEventListener('animationstart', listener, listenerOptions);
            }
        });
        return result;
    }
    stopMonitoring(elementOrRef) {
        const element = coerceElement(elementOrRef);
        const info = this._monitoredElements.get(element);
        if (info) {
            info.unlisten();
            info.subject.complete();
            element.classList.remove('cdk-text-field-autofill-monitored');
            element.classList.remove('cdk-text-field-autofilled');
            this._monitoredElements.delete(element);
        }
    }
    ngOnDestroy() {
        this._monitoredElements.forEach((_info, element) => this.stopMonitoring(element));
    }
}
AutofillMonitor.ɵprov = i0.ɵɵdefineInjectable({ factory: function AutofillMonitor_Factory() { return new AutofillMonitor(i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i0.NgZone)); }, token: AutofillMonitor, providedIn: "root" });
AutofillMonitor.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
AutofillMonitor.ctorParameters = () => [
    { type: Platform },
    { type: NgZone }
];
/** A directive that can be used to monitor the autofill state of an input. */
export class CdkAutofill {
    constructor(_elementRef, _autofillMonitor) {
        this._elementRef = _elementRef;
        this._autofillMonitor = _autofillMonitor;
        /** Emits when the autofill state of the element changes. */
        this.cdkAutofill = new EventEmitter();
    }
    ngOnInit() {
        this._autofillMonitor
            .monitor(this._elementRef)
            .subscribe(event => this.cdkAutofill.emit(event));
    }
    ngOnDestroy() {
        this._autofillMonitor.stopMonitoring(this._elementRef);
    }
}
CdkAutofill.decorators = [
    { type: Directive, args: [{
                selector: '[cdkAutofill]',
            },] }
];
CdkAutofill.ctorParameters = () => [
    { type: ElementRef },
    { type: AutofillMonitor }
];
CdkAutofill.propDecorators = {
    cdkAutofill: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2ZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RleHQtZmllbGQvYXV0b2ZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSwrQkFBK0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hGLE9BQU8sRUFDTCxTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixVQUFVLEVBQ1YsTUFBTSxFQUdOLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDcEQsT0FBTyxFQUFDLEtBQUssRUFBYyxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7OztBQW1CaEQsc0RBQXNEO0FBQ3RELE1BQU0sZUFBZSxHQUFHLCtCQUErQixDQUFDLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFHekU7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxlQUFlO0lBRzFCLFlBQW9CLFNBQW1CLEVBQVUsT0FBZTtRQUE1QyxjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUZ4RCx1QkFBa0IsR0FBRyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztJQUVILENBQUM7SUFnQnBFLE9BQU8sQ0FBQyxZQUEyQztRQUNqRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDN0IsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWxELElBQUksSUFBSSxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1NBQ3JC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QUFPLFdBQVc7SUFJdEIsWUFBb0IsV0FBb0MsRUFDcEMsZ0JBQWlDO1FBRGpDLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtRQUNwQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWlCO1FBSnJELDREQUE0RDtRQUNsRCxnQkFBVyxHQUFnQyxJQUFJLFlBQVksRUFBaUIsQ0FBQztJQUcvQixDQUFDO0lBRXpELFFBQVE7UUFDTixJQUFJLENBQUMsZ0JBQWdCO2FBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQ3pCLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6RCxDQUFDOzs7WUFsQkYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxlQUFlO2FBQzFCOzs7WUF2SUMsVUFBVTtZQTZJNEIsZUFBZTs7OzBCQUhwRCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1BsYXRmb3JtLCBub3JtYWxpemVQYXNzaXZlTGlzdGVuZXJPcHRpb25zfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge1xyXG4gIERpcmVjdGl2ZSxcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBJbmplY3RhYmxlLFxyXG4gIE5nWm9uZSxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT25Jbml0LFxyXG4gIE91dHB1dCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtjb2VyY2VFbGVtZW50fSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge0VNUFRZLCBPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuXHJcblxyXG4vKiogQW4gZXZlbnQgdGhhdCBpcyBlbWl0dGVkIHdoZW4gdGhlIGF1dG9maWxsIHN0YXRlIG9mIGFuIGlucHV0IGNoYW5nZXMuICovXHJcbmV4cG9ydCB0eXBlIEF1dG9maWxsRXZlbnQgPSB7XHJcbiAgLyoqIFRoZSBlbGVtZW50IHdob3NlIGF1dG9maWxsIHN0YXRlIGNoYW5nZXMuICovXHJcbiAgdGFyZ2V0OiBFbGVtZW50O1xyXG4gIC8qKiBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGN1cnJlbnRseSBhdXRvZmlsbGVkLiAqL1xyXG4gIGlzQXV0b2ZpbGxlZDogYm9vbGVhbjtcclxufTtcclxuXHJcblxyXG4vKiogVXNlZCB0byB0cmFjayBpbmZvIGFib3V0IGN1cnJlbnRseSBtb25pdG9yZWQgZWxlbWVudHMuICovXHJcbnR5cGUgTW9uaXRvcmVkRWxlbWVudEluZm8gPSB7XHJcbiAgc3ViamVjdDogU3ViamVjdDxBdXRvZmlsbEV2ZW50PjtcclxuICB1bmxpc3RlbjogKCkgPT4gdm9pZDtcclxufTtcclxuXHJcblxyXG4vKiogT3B0aW9ucyB0byBwYXNzIHRvIHRoZSBhbmltYXRpb25zdGFydCBsaXN0ZW5lci4gKi9cclxuY29uc3QgbGlzdGVuZXJPcHRpb25zID0gbm9ybWFsaXplUGFzc2l2ZUxpc3RlbmVyT3B0aW9ucyh7cGFzc2l2ZTogdHJ1ZX0pO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBBbiBpbmplY3RhYmxlIHNlcnZpY2UgdGhhdCBjYW4gYmUgdXNlZCB0byBtb25pdG9yIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiBhbiBpbnB1dC5cclxuICogQmFzZWQgb24gdGhlIGZvbGxvd2luZyBibG9nIHBvc3Q6XHJcbiAqIGh0dHBzOi8vbWVkaXVtLmNvbS9AYnJ1bm4vZGV0ZWN0aW5nLWF1dG9maWxsZWQtZmllbGRzLWluLWphdmFzY3JpcHQtYWVkNTk4ZDI1ZGE3XHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEF1dG9maWxsTW9uaXRvciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfbW9uaXRvcmVkRWxlbWVudHMgPSBuZXcgTWFwPEVsZW1lbnQsIE1vbml0b3JlZEVsZW1lbnRJbmZvPigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sIHByaXZhdGUgX25nWm9uZTogTmdab25lKSB7fVxyXG5cclxuICAvKipcclxuICAgKiBNb25pdG9yIGZvciBjaGFuZ2VzIGluIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiB0aGUgZ2l2ZW4gaW5wdXQgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBtb25pdG9yLlxyXG4gICAqIEByZXR1cm4gQSBzdHJlYW0gb2YgYXV0b2ZpbGwgc3RhdGUgY2hhbmdlcy5cclxuICAgKi9cclxuICBtb25pdG9yKGVsZW1lbnQ6IEVsZW1lbnQpOiBPYnNlcnZhYmxlPEF1dG9maWxsRXZlbnQ+O1xyXG5cclxuICAvKipcclxuICAgKiBNb25pdG9yIGZvciBjaGFuZ2VzIGluIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiB0aGUgZ2l2ZW4gaW5wdXQgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBtb25pdG9yLlxyXG4gICAqIEByZXR1cm4gQSBzdHJlYW0gb2YgYXV0b2ZpbGwgc3RhdGUgY2hhbmdlcy5cclxuICAgKi9cclxuICBtb25pdG9yKGVsZW1lbnQ6IEVsZW1lbnRSZWY8RWxlbWVudD4pOiBPYnNlcnZhYmxlPEF1dG9maWxsRXZlbnQ+O1xyXG5cclxuICBtb25pdG9yKGVsZW1lbnRPclJlZjogRWxlbWVudCB8IEVsZW1lbnRSZWY8RWxlbWVudD4pOiBPYnNlcnZhYmxlPEF1dG9maWxsRXZlbnQ+IHtcclxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XHJcbiAgICAgIHJldHVybiBFTVBUWTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBlbGVtZW50ID0gY29lcmNlRWxlbWVudChlbGVtZW50T3JSZWYpO1xyXG4gICAgY29uc3QgaW5mbyA9IHRoaXMuX21vbml0b3JlZEVsZW1lbnRzLmdldChlbGVtZW50KTtcclxuXHJcbiAgICBpZiAoaW5mbykge1xyXG4gICAgICByZXR1cm4gaW5mby5zdWJqZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBTdWJqZWN0PEF1dG9maWxsRXZlbnQ+KCk7XHJcbiAgICBjb25zdCBjc3NDbGFzcyA9ICdjZGstdGV4dC1maWVsZC1hdXRvZmlsbGVkJztcclxuICAgIGNvbnN0IGxpc3RlbmVyID0gKChldmVudDogQW5pbWF0aW9uRXZlbnQpID0+IHtcclxuICAgICAgLy8gQW5pbWF0aW9uIGV2ZW50cyBmaXJlIG9uIGluaXRpYWwgZWxlbWVudCByZW5kZXIsIHdlIGNoZWNrIGZvciB0aGUgcHJlc2VuY2Ugb2YgdGhlIGF1dG9maWxsXHJcbiAgICAgIC8vIENTUyBjbGFzcyB0byBtYWtlIHN1cmUgdGhpcyBpcyBhIHJlYWwgY2hhbmdlIGluIHN0YXRlLCBub3QganVzdCB0aGUgaW5pdGlhbCByZW5kZXIgYmVmb3JlXHJcbiAgICAgIC8vIHdlIGZpcmUgb2ZmIGV2ZW50cy5cclxuICAgICAgaWYgKGV2ZW50LmFuaW1hdGlvbk5hbWUgPT09ICdjZGstdGV4dC1maWVsZC1hdXRvZmlsbC1zdGFydCcgJiZcclxuICAgICAgICAgICFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjc3NDbGFzcykpIHtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY3NzQ2xhc3MpO1xyXG4gICAgICAgIHRoaXMuX25nWm9uZS5ydW4oKCkgPT4gcmVzdWx0Lm5leHQoe3RhcmdldDogZXZlbnQudGFyZ2V0IGFzIEVsZW1lbnQsIGlzQXV0b2ZpbGxlZDogdHJ1ZX0pKTtcclxuICAgICAgfSBlbHNlIGlmIChldmVudC5hbmltYXRpb25OYW1lID09PSAnY2RrLXRleHQtZmllbGQtYXV0b2ZpbGwtZW5kJyAmJlxyXG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY3NzQ2xhc3MpKSB7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNzc0NsYXNzKTtcclxuICAgICAgICB0aGlzLl9uZ1pvbmUucnVuKCgpID0+IHJlc3VsdC5uZXh0KHt0YXJnZXQ6IGV2ZW50LnRhcmdldCBhcyBFbGVtZW50LCBpc0F1dG9maWxsZWQ6IGZhbHNlfSkpO1xyXG4gICAgICB9XHJcbiAgICB9KSBhcyBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0O1xyXG5cclxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignYW5pbWF0aW9uc3RhcnQnLCBsaXN0ZW5lciwgbGlzdGVuZXJPcHRpb25zKTtcclxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZGstdGV4dC1maWVsZC1hdXRvZmlsbC1tb25pdG9yZWQnKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX21vbml0b3JlZEVsZW1lbnRzLnNldChlbGVtZW50LCB7XHJcbiAgICAgIHN1YmplY3Q6IHJlc3VsdCxcclxuICAgICAgdW5saXN0ZW46ICgpID0+IHtcclxuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbnN0YXJ0JywgbGlzdGVuZXIsIGxpc3RlbmVyT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdG9wIG1vbml0b3JpbmcgdGhlIGF1dG9maWxsIHN0YXRlIG9mIHRoZSBnaXZlbiBpbnB1dCBlbGVtZW50LlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHN0b3AgbW9uaXRvcmluZy5cclxuICAgKi9cclxuICBzdG9wTW9uaXRvcmluZyhlbGVtZW50OiBFbGVtZW50KTogdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcCBtb25pdG9yaW5nIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiB0aGUgZ2l2ZW4gaW5wdXQgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0byBzdG9wIG1vbml0b3JpbmcuXHJcbiAgICovXHJcbiAgc3RvcE1vbml0b3JpbmcoZWxlbWVudDogRWxlbWVudFJlZjxFbGVtZW50Pik6IHZvaWQ7XHJcblxyXG4gIHN0b3BNb25pdG9yaW5nKGVsZW1lbnRPclJlZjogRWxlbWVudCB8IEVsZW1lbnRSZWY8RWxlbWVudD4pOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBjb2VyY2VFbGVtZW50KGVsZW1lbnRPclJlZik7XHJcbiAgICBjb25zdCBpbmZvID0gdGhpcy5fbW9uaXRvcmVkRWxlbWVudHMuZ2V0KGVsZW1lbnQpO1xyXG5cclxuICAgIGlmIChpbmZvKSB7XHJcbiAgICAgIGluZm8udW5saXN0ZW4oKTtcclxuICAgICAgaW5mby5zdWJqZWN0LmNvbXBsZXRlKCk7XHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY2RrLXRleHQtZmllbGQtYXV0b2ZpbGwtbW9uaXRvcmVkJyk7XHJcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnY2RrLXRleHQtZmllbGQtYXV0b2ZpbGxlZCcpO1xyXG4gICAgICB0aGlzLl9tb25pdG9yZWRFbGVtZW50cy5kZWxldGUoZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX21vbml0b3JlZEVsZW1lbnRzLmZvckVhY2goKF9pbmZvLCBlbGVtZW50KSA9PiB0aGlzLnN0b3BNb25pdG9yaW5nKGVsZW1lbnQpKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vKiogQSBkaXJlY3RpdmUgdGhhdCBjYW4gYmUgdXNlZCB0byBtb25pdG9yIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiBhbiBpbnB1dC4gKi9cclxuQERpcmVjdGl2ZSh7XHJcbiAgc2VsZWN0b3I6ICdbY2RrQXV0b2ZpbGxdJyxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0F1dG9maWxsIGltcGxlbWVudHMgT25EZXN0cm95LCBPbkluaXQge1xyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBhdXRvZmlsbCBzdGF0ZSBvZiB0aGUgZWxlbWVudCBjaGFuZ2VzLiAqL1xyXG4gIEBPdXRwdXQoKSBjZGtBdXRvZmlsbDogRXZlbnRFbWl0dGVyPEF1dG9maWxsRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxBdXRvZmlsbEV2ZW50PigpO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgICAgICAgICAgICBwcml2YXRlIF9hdXRvZmlsbE1vbml0b3I6IEF1dG9maWxsTW9uaXRvcikge31cclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICB0aGlzLl9hdXRvZmlsbE1vbml0b3JcclxuICAgICAgLm1vbml0b3IodGhpcy5fZWxlbWVudFJlZilcclxuICAgICAgLnN1YnNjcmliZShldmVudCA9PiB0aGlzLmNka0F1dG9maWxsLmVtaXQoZXZlbnQpKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fYXV0b2ZpbGxNb25pdG9yLnN0b3BNb25pdG9yaW5nKHRoaXMuX2VsZW1lbnRSZWYpO1xyXG4gIH1cclxufVxyXG4iXX0=