/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Inject } from '@angular/core';
import { OverlayContainer } from './overlay-container';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "@angular/cdk/platform";
/**
 * Alternative to OverlayContainer that supports correct displaying of overlay elements in
 * Fullscreen mode
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
 *
 * Should be provided in the root component.
 */
export class FullscreenOverlayContainer extends OverlayContainer {
    constructor(_document, platform) {
        super(_document, platform);
    }
    ngOnDestroy() {
        super.ngOnDestroy();
        if (this._fullScreenEventName && this._fullScreenListener) {
            this._document.removeEventListener(this._fullScreenEventName, this._fullScreenListener);
        }
    }
    _createContainer() {
        super._createContainer();
        this._adjustParentForFullscreenChange();
        this._addFullscreenChangeListener(() => this._adjustParentForFullscreenChange());
    }
    _adjustParentForFullscreenChange() {
        if (!this._containerElement) {
            return;
        }
        const fullscreenElement = this.getFullscreenElement();
        const parent = fullscreenElement || this._document.body;
        parent.appendChild(this._containerElement);
    }
    _addFullscreenChangeListener(fn) {
        const eventName = this._getEventName();
        if (eventName) {
            if (this._fullScreenListener) {
                this._document.removeEventListener(eventName, this._fullScreenListener);
            }
            this._document.addEventListener(eventName, fn);
            this._fullScreenListener = fn;
        }
    }
    _getEventName() {
        if (!this._fullScreenEventName) {
            const _document = this._document;
            if (_document.fullscreenEnabled) {
                this._fullScreenEventName = 'fullscreenchange';
            }
            else if (_document.webkitFullscreenEnabled) {
                this._fullScreenEventName = 'webkitfullscreenchange';
            }
            else if (_document.mozFullScreenEnabled) {
                this._fullScreenEventName = 'mozfullscreenchange';
            }
            else if (_document.msFullscreenEnabled) {
                this._fullScreenEventName = 'MSFullscreenChange';
            }
        }
        return this._fullScreenEventName;
    }
    /**
     * When the page is put into fullscreen mode, a specific element is specified.
     * Only that element and its children are visible when in fullscreen mode.
     */
    getFullscreenElement() {
        const _document = this._document;
        return _document.fullscreenElement ||
            _document.webkitFullscreenElement ||
            _document.mozFullScreenElement ||
            _document.msFullscreenElement ||
            null;
    }
}
FullscreenOverlayContainer.ɵprov = i0.ɵɵdefineInjectable({ factory: function FullscreenOverlayContainer_Factory() { return new FullscreenOverlayContainer(i0.ɵɵinject(i1.DOCUMENT), i0.ɵɵinject(i2.Platform)); }, token: FullscreenOverlayContainer, providedIn: "root" });
FullscreenOverlayContainer.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
FullscreenOverlayContainer.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: Platform }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnVsbHNjcmVlbi1vdmVybGF5LWNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvb3ZlcmxheS9mdWxsc2NyZWVuLW92ZXJsYXktY29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBQzVELE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7Ozs7QUFHL0M7Ozs7OztHQU1HO0FBRUgsTUFBTSxPQUFPLDBCQUEyQixTQUFRLGdCQUFnQjtJQUk5RCxZQUE4QixTQUFjLEVBQUUsUUFBa0I7UUFDOUQsS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsV0FBVztRQUNULEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVwQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDekY7SUFDSCxDQUFDO0lBRVMsZ0JBQWdCO1FBQ3hCLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTyxnQ0FBZ0M7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtZQUMzQixPQUFPO1NBQ1I7UUFFRCxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3RELE1BQU0sTUFBTSxHQUFHLGlCQUFpQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ3hELE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLDRCQUE0QixDQUFDLEVBQWM7UUFDakQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRXZDLElBQUksU0FBUyxFQUFFO1lBQ2IsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3pFO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFTyxhQUFhO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7WUFDOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQWdCLENBQUM7WUFFeEMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxrQkFBa0IsQ0FBQzthQUNoRDtpQkFBTSxJQUFJLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRTtnQkFDNUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLHdCQUF3QixDQUFDO2FBQ3REO2lCQUFNLElBQUksU0FBUyxDQUFDLG9CQUFvQixFQUFFO2dCQUN6QyxJQUFJLENBQUMsb0JBQW9CLEdBQUcscUJBQXFCLENBQUM7YUFDbkQ7aUJBQU0sSUFBSSxTQUFTLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxvQkFBb0IsQ0FBQzthQUNsRDtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7T0FHRztJQUNILG9CQUFvQjtRQUNsQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBZ0IsQ0FBQztRQUV4QyxPQUFPLFNBQVMsQ0FBQyxpQkFBaUI7WUFDM0IsU0FBUyxDQUFDLHVCQUF1QjtZQUNqQyxTQUFTLENBQUMsb0JBQW9CO1lBQzlCLFNBQVMsQ0FBQyxtQkFBbUI7WUFDN0IsSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7OztZQTVFRixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7NENBS2pCLE1BQU0sU0FBQyxRQUFRO1lBZnRCLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0LCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge092ZXJsYXlDb250YWluZXJ9IGZyb20gJy4vb3ZlcmxheS1jb250YWluZXInO1xyXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5cclxuXHJcbi8qKlxyXG4gKiBBbHRlcm5hdGl2ZSB0byBPdmVybGF5Q29udGFpbmVyIHRoYXQgc3VwcG9ydHMgY29ycmVjdCBkaXNwbGF5aW5nIG9mIG92ZXJsYXkgZWxlbWVudHMgaW5cclxuICogRnVsbHNjcmVlbiBtb2RlXHJcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L3JlcXVlc3RGdWxsU2NyZWVuXHJcbiAqXHJcbiAqIFNob3VsZCBiZSBwcm92aWRlZCBpbiB0aGUgcm9vdCBjb21wb25lbnQuXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEZ1bGxzY3JlZW5PdmVybGF5Q29udGFpbmVyIGV4dGVuZHMgT3ZlcmxheUNvbnRhaW5lciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfZnVsbFNjcmVlbkV2ZW50TmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gIHByaXZhdGUgX2Z1bGxTY3JlZW5MaXN0ZW5lcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgY29uc3RydWN0b3IoQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksIHBsYXRmb3JtOiBQbGF0Zm9ybSkge1xyXG4gICAgc3VwZXIoX2RvY3VtZW50LCBwbGF0Zm9ybSk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XHJcblxyXG4gICAgaWYgKHRoaXMuX2Z1bGxTY3JlZW5FdmVudE5hbWUgJiYgdGhpcy5fZnVsbFNjcmVlbkxpc3RlbmVyKSB7XHJcbiAgICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodGhpcy5fZnVsbFNjcmVlbkV2ZW50TmFtZSwgdGhpcy5fZnVsbFNjcmVlbkxpc3RlbmVyKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBfY3JlYXRlQ29udGFpbmVyKCk6IHZvaWQge1xyXG4gICAgc3VwZXIuX2NyZWF0ZUNvbnRhaW5lcigpO1xyXG4gICAgdGhpcy5fYWRqdXN0UGFyZW50Rm9yRnVsbHNjcmVlbkNoYW5nZSgpO1xyXG4gICAgdGhpcy5fYWRkRnVsbHNjcmVlbkNoYW5nZUxpc3RlbmVyKCgpID0+IHRoaXMuX2FkanVzdFBhcmVudEZvckZ1bGxzY3JlZW5DaGFuZ2UoKSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGp1c3RQYXJlbnRGb3JGdWxsc2NyZWVuQ2hhbmdlKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLl9jb250YWluZXJFbGVtZW50KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmdWxsc2NyZWVuRWxlbWVudCA9IHRoaXMuZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKTtcclxuICAgIGNvbnN0IHBhcmVudCA9IGZ1bGxzY3JlZW5FbGVtZW50IHx8IHRoaXMuX2RvY3VtZW50LmJvZHk7XHJcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9hZGRGdWxsc2NyZWVuQ2hhbmdlTGlzdGVuZXIoZm46ICgpID0+IHZvaWQpIHtcclxuICAgIGNvbnN0IGV2ZW50TmFtZSA9IHRoaXMuX2dldEV2ZW50TmFtZSgpO1xyXG5cclxuICAgIGlmIChldmVudE5hbWUpIHtcclxuICAgICAgaWYgKHRoaXMuX2Z1bGxTY3JlZW5MaXN0ZW5lcikge1xyXG4gICAgICAgIHRoaXMuX2RvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLl9mdWxsU2NyZWVuTGlzdGVuZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZm4pO1xyXG4gICAgICB0aGlzLl9mdWxsU2NyZWVuTGlzdGVuZXIgPSBmbjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2dldEV2ZW50TmFtZSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgaWYgKCF0aGlzLl9mdWxsU2NyZWVuRXZlbnROYW1lKSB7XHJcbiAgICAgIGNvbnN0IF9kb2N1bWVudCA9IHRoaXMuX2RvY3VtZW50IGFzIGFueTtcclxuXHJcbiAgICAgIGlmIChfZG9jdW1lbnQuZnVsbHNjcmVlbkVuYWJsZWQpIHtcclxuICAgICAgICB0aGlzLl9mdWxsU2NyZWVuRXZlbnROYW1lID0gJ2Z1bGxzY3JlZW5jaGFuZ2UnO1xyXG4gICAgICB9IGVsc2UgaWYgKF9kb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuX2Z1bGxTY3JlZW5FdmVudE5hbWUgPSAnd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSc7XHJcbiAgICAgIH0gZWxzZSBpZiAoX2RvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbmFibGVkKSB7XHJcbiAgICAgICAgdGhpcy5fZnVsbFNjcmVlbkV2ZW50TmFtZSA9ICdtb3pmdWxsc2NyZWVuY2hhbmdlJztcclxuICAgICAgfSBlbHNlIGlmIChfZG9jdW1lbnQubXNGdWxsc2NyZWVuRW5hYmxlZCkge1xyXG4gICAgICAgIHRoaXMuX2Z1bGxTY3JlZW5FdmVudE5hbWUgPSAnTVNGdWxsc2NyZWVuQ2hhbmdlJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLl9mdWxsU2NyZWVuRXZlbnROYW1lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB0aGUgcGFnZSBpcyBwdXQgaW50byBmdWxsc2NyZWVuIG1vZGUsIGEgc3BlY2lmaWMgZWxlbWVudCBpcyBzcGVjaWZpZWQuXHJcbiAgICogT25seSB0aGF0IGVsZW1lbnQgYW5kIGl0cyBjaGlsZHJlbiBhcmUgdmlzaWJsZSB3aGVuIGluIGZ1bGxzY3JlZW4gbW9kZS5cclxuICAgKi9cclxuICBnZXRGdWxsc2NyZWVuRWxlbWVudCgpOiBFbGVtZW50IHtcclxuICAgIGNvbnN0IF9kb2N1bWVudCA9IHRoaXMuX2RvY3VtZW50IGFzIGFueTtcclxuXHJcbiAgICByZXR1cm4gX2RvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgICAgX2RvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgICAgX2RvY3VtZW50Lm1vekZ1bGxTY3JlZW5FbGVtZW50IHx8XHJcbiAgICAgICAgICAgX2RvY3VtZW50Lm1zRnVsbHNjcmVlbkVsZW1lbnQgfHxcclxuICAgICAgICAgICBudWxsO1xyXG4gIH1cclxufVxyXG4iXX0=