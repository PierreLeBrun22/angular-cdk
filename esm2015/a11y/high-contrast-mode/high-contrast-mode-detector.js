/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
import * as i2 from "@angular/common";
/** CSS class applied to the document body when in black-on-white high-contrast mode. */
export const BLACK_ON_WHITE_CSS_CLASS = 'cdk-high-contrast-black-on-white';
/** CSS class applied to the document body when in white-on-black high-contrast mode. */
export const WHITE_ON_BLACK_CSS_CLASS = 'cdk-high-contrast-white-on-black';
/** CSS class applied to the document body when in high-contrast mode. */
export const HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = 'cdk-high-contrast-active';
/**
 * Service to determine whether the browser is currently in a high-contrast-mode environment.
 *
 * Microsoft Windows supports an accessibility feature called "High Contrast Mode". This mode
 * changes the appearance of all applications, including web applications, to dramatically increase
 * contrast.
 *
 * IE, Edge, and Firefox currently support this mode. Chrome does not support Windows High Contrast
 * Mode. This service does not detect high-contrast mode as added by the Chrome "High Contrast"
 * browser extension.
 */
export class HighContrastModeDetector {
    constructor(_platform, document) {
        this._platform = _platform;
        this._document = document;
    }
    /** Gets the current high-contrast-mode for the page. */
    getHighContrastMode() {
        if (!this._platform.isBrowser) {
            return 0 /* NONE */;
        }
        // Create a test element with an arbitrary background-color that is neither black nor
        // white; high-contrast mode will coerce the color to either black or white. Also ensure that
        // appending the test element to the DOM does not affect layout by absolutely positioning it
        const testElement = this._document.createElement('div');
        testElement.style.backgroundColor = 'rgb(1,2,3)';
        testElement.style.position = 'absolute';
        this._document.body.appendChild(testElement);
        // Get the computed style for the background color, collapsing spaces to normalize between
        // browsers. Once we get this color, we no longer need the test element. Access the `window`
        // via the document so we can fake it in tests. Note that we have extra null checks, because
        // this logic will likely run during app bootstrap and throwing can break the entire app.
        const documentWindow = this._document.defaultView || window;
        const computedStyle = (documentWindow && documentWindow.getComputedStyle) ?
            documentWindow.getComputedStyle(testElement) : null;
        const computedColor = (computedStyle && computedStyle.backgroundColor || '').replace(/ /g, '');
        this._document.body.removeChild(testElement);
        switch (computedColor) {
            case 'rgb(0,0,0)': return 2 /* WHITE_ON_BLACK */;
            case 'rgb(255,255,255)': return 1 /* BLACK_ON_WHITE */;
        }
        return 0 /* NONE */;
    }
    /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
    _applyBodyHighContrastModeCssClasses() {
        if (this._platform.isBrowser && this._document.body) {
            const bodyClasses = this._document.body.classList;
            // IE11 doesn't support `classList` operations with multiple arguments
            bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
            bodyClasses.remove(BLACK_ON_WHITE_CSS_CLASS);
            bodyClasses.remove(WHITE_ON_BLACK_CSS_CLASS);
            const mode = this.getHighContrastMode();
            if (mode === 1 /* BLACK_ON_WHITE */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
                bodyClasses.add(BLACK_ON_WHITE_CSS_CLASS);
            }
            else if (mode === 2 /* WHITE_ON_BLACK */) {
                bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
                bodyClasses.add(WHITE_ON_BLACK_CSS_CLASS);
            }
        }
    }
}
HighContrastModeDetector.ɵprov = i0.ɵɵdefineInjectable({ factory: function HighContrastModeDetector_Factory() { return new HighContrastModeDetector(i0.ɵɵinject(i1.Platform), i0.ɵɵinject(i2.DOCUMENT)); }, token: HighContrastModeDetector, providedIn: "root" });
HighContrastModeDetector.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
HighContrastModeDetector.ctorParameters = () => [
    { type: Platform },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlnaC1jb250cmFzdC1tb2RlLWRldGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2hpZ2gtY29udHJhc3QtbW9kZS9oaWdoLWNvbnRyYXN0LW1vZGUtZGV0ZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7OztBQVVqRCx3RkFBd0Y7QUFDeEYsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsa0NBQWtDLENBQUM7QUFFM0Usd0ZBQXdGO0FBQ3hGLE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLGtDQUFrQyxDQUFDO0FBRTNFLHlFQUF5RTtBQUN6RSxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRywwQkFBMEIsQ0FBQztBQUU5RTs7Ozs7Ozs7OztHQVVHO0FBRUgsTUFBTSxPQUFPLHdCQUF3QjtJQUduQyxZQUFvQixTQUFtQixFQUFvQixRQUFhO1FBQXBELGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUVELHdEQUF3RDtJQUN4RCxtQkFBbUI7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzdCLG9CQUE2QjtTQUM5QjtRQUVELHFGQUFxRjtRQUNyRiw2RkFBNkY7UUFDN0YsNEZBQTRGO1FBQzVGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hELFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFlBQVksQ0FBQztRQUNqRCxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDeEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLDBGQUEwRjtRQUMxRiw0RkFBNEY7UUFDNUYsNEZBQTRGO1FBQzVGLHlGQUF5RjtRQUN6RixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUM7UUFDNUQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUN2RSxjQUFjLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN4RCxNQUFNLGFBQWEsR0FDZixDQUFDLGFBQWEsSUFBSSxhQUFhLENBQUMsZUFBZSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTdDLFFBQVEsYUFBYSxFQUFFO1lBQ3JCLEtBQUssWUFBWSxDQUFDLENBQUMsOEJBQXVDO1lBQzFELEtBQUssa0JBQWtCLENBQUMsQ0FBQyw4QkFBdUM7U0FDakU7UUFDRCxvQkFBNkI7SUFDL0IsQ0FBQztJQUVELHlGQUF5RjtJQUN6RixvQ0FBb0M7UUFDbEMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtZQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDbEQsc0VBQXNFO1lBQ3RFLFdBQVcsQ0FBQyxNQUFNLENBQUMsbUNBQW1DLENBQUMsQ0FBQztZQUN4RCxXQUFXLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDN0MsV0FBVyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBRTdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBQ3hDLElBQUksSUFBSSwyQkFBb0MsRUFBRTtnQkFDNUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUNyRCxXQUFXLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7YUFDM0M7aUJBQU0sSUFBSSxJQUFJLDJCQUFvQyxFQUFFO2dCQUNuRCxXQUFXLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ3JELFdBQVcsQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUMzQztTQUNGO0lBQ0gsQ0FBQzs7OztZQTFERixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUFoQ3hCLFFBQVE7NENBb0M0QixNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtQbGF0Zm9ybX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuXHJcbi8qKiBTZXQgb2YgcG9zc2libGUgaGlnaC1jb250cmFzdCBtb2RlIGJhY2tncm91bmRzLiAqL1xyXG5leHBvcnQgY29uc3QgZW51bSBIaWdoQ29udHJhc3RNb2RlIHtcclxuICBOT05FLFxyXG4gIEJMQUNLX09OX1dISVRFLFxyXG4gIFdISVRFX09OX0JMQUNLLFxyXG59XHJcblxyXG4vKiogQ1NTIGNsYXNzIGFwcGxpZWQgdG8gdGhlIGRvY3VtZW50IGJvZHkgd2hlbiBpbiBibGFjay1vbi13aGl0ZSBoaWdoLWNvbnRyYXN0IG1vZGUuICovXHJcbmV4cG9ydCBjb25zdCBCTEFDS19PTl9XSElURV9DU1NfQ0xBU1MgPSAnY2RrLWhpZ2gtY29udHJhc3QtYmxhY2stb24td2hpdGUnO1xyXG5cclxuLyoqIENTUyBjbGFzcyBhcHBsaWVkIHRvIHRoZSBkb2N1bWVudCBib2R5IHdoZW4gaW4gd2hpdGUtb24tYmxhY2sgaGlnaC1jb250cmFzdCBtb2RlLiAqL1xyXG5leHBvcnQgY29uc3QgV0hJVEVfT05fQkxBQ0tfQ1NTX0NMQVNTID0gJ2Nkay1oaWdoLWNvbnRyYXN0LXdoaXRlLW9uLWJsYWNrJztcclxuXHJcbi8qKiBDU1MgY2xhc3MgYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYm9keSB3aGVuIGluIGhpZ2gtY29udHJhc3QgbW9kZS4gKi9cclxuZXhwb3J0IGNvbnN0IEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTID0gJ2Nkay1oaWdoLWNvbnRyYXN0LWFjdGl2ZSc7XHJcblxyXG4vKipcclxuICogU2VydmljZSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgYnJvd3NlciBpcyBjdXJyZW50bHkgaW4gYSBoaWdoLWNvbnRyYXN0LW1vZGUgZW52aXJvbm1lbnQuXHJcbiAqXHJcbiAqIE1pY3Jvc29mdCBXaW5kb3dzIHN1cHBvcnRzIGFuIGFjY2Vzc2liaWxpdHkgZmVhdHVyZSBjYWxsZWQgXCJIaWdoIENvbnRyYXN0IE1vZGVcIi4gVGhpcyBtb2RlXHJcbiAqIGNoYW5nZXMgdGhlIGFwcGVhcmFuY2Ugb2YgYWxsIGFwcGxpY2F0aW9ucywgaW5jbHVkaW5nIHdlYiBhcHBsaWNhdGlvbnMsIHRvIGRyYW1hdGljYWxseSBpbmNyZWFzZVxyXG4gKiBjb250cmFzdC5cclxuICpcclxuICogSUUsIEVkZ2UsIGFuZCBGaXJlZm94IGN1cnJlbnRseSBzdXBwb3J0IHRoaXMgbW9kZS4gQ2hyb21lIGRvZXMgbm90IHN1cHBvcnQgV2luZG93cyBIaWdoIENvbnRyYXN0XHJcbiAqIE1vZGUuIFRoaXMgc2VydmljZSBkb2VzIG5vdCBkZXRlY3QgaGlnaC1jb250cmFzdCBtb2RlIGFzIGFkZGVkIGJ5IHRoZSBDaHJvbWUgXCJIaWdoIENvbnRyYXN0XCJcclxuICogYnJvd3NlciBleHRlbnNpb24uXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEhpZ2hDb250cmFzdE1vZGVEZXRlY3RvciB7XHJcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9wbGF0Zm9ybTogUGxhdGZvcm0sIEBJbmplY3QoRE9DVU1FTlQpIGRvY3VtZW50OiBhbnkpIHtcclxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgY3VycmVudCBoaWdoLWNvbnRyYXN0LW1vZGUgZm9yIHRoZSBwYWdlLiAqL1xyXG4gIGdldEhpZ2hDb250cmFzdE1vZGUoKTogSGlnaENvbnRyYXN0TW9kZSB7XHJcbiAgICBpZiAoIXRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5OT05FO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRlc3QgZWxlbWVudCB3aXRoIGFuIGFyYml0cmFyeSBiYWNrZ3JvdW5kLWNvbG9yIHRoYXQgaXMgbmVpdGhlciBibGFjayBub3JcclxuICAgIC8vIHdoaXRlOyBoaWdoLWNvbnRyYXN0IG1vZGUgd2lsbCBjb2VyY2UgdGhlIGNvbG9yIHRvIGVpdGhlciBibGFjayBvciB3aGl0ZS4gQWxzbyBlbnN1cmUgdGhhdFxyXG4gICAgLy8gYXBwZW5kaW5nIHRoZSB0ZXN0IGVsZW1lbnQgdG8gdGhlIERPTSBkb2VzIG5vdCBhZmZlY3QgbGF5b3V0IGJ5IGFic29sdXRlbHkgcG9zaXRpb25pbmcgaXRcclxuICAgIGNvbnN0IHRlc3RFbGVtZW50ID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICB0ZXN0RWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmdiKDEsMiwzKSc7XHJcbiAgICB0ZXN0RWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICB0aGlzLl9kb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRlc3RFbGVtZW50KTtcclxuXHJcbiAgICAvLyBHZXQgdGhlIGNvbXB1dGVkIHN0eWxlIGZvciB0aGUgYmFja2dyb3VuZCBjb2xvciwgY29sbGFwc2luZyBzcGFjZXMgdG8gbm9ybWFsaXplIGJldHdlZW5cclxuICAgIC8vIGJyb3dzZXJzLiBPbmNlIHdlIGdldCB0aGlzIGNvbG9yLCB3ZSBubyBsb25nZXIgbmVlZCB0aGUgdGVzdCBlbGVtZW50LiBBY2Nlc3MgdGhlIGB3aW5kb3dgXHJcbiAgICAvLyB2aWEgdGhlIGRvY3VtZW50IHNvIHdlIGNhbiBmYWtlIGl0IGluIHRlc3RzLiBOb3RlIHRoYXQgd2UgaGF2ZSBleHRyYSBudWxsIGNoZWNrcywgYmVjYXVzZVxyXG4gICAgLy8gdGhpcyBsb2dpYyB3aWxsIGxpa2VseSBydW4gZHVyaW5nIGFwcCBib290c3RyYXAgYW5kIHRocm93aW5nIGNhbiBicmVhayB0aGUgZW50aXJlIGFwcC5cclxuICAgIGNvbnN0IGRvY3VtZW50V2luZG93ID0gdGhpcy5fZG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xyXG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IChkb2N1bWVudFdpbmRvdyAmJiBkb2N1bWVudFdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSA/XHJcbiAgICAgICAgZG9jdW1lbnRXaW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0ZXN0RWxlbWVudCkgOiBudWxsO1xyXG4gICAgY29uc3QgY29tcHV0ZWRDb2xvciA9XHJcbiAgICAgICAgKGNvbXB1dGVkU3R5bGUgJiYgY29tcHV0ZWRTdHlsZS5iYWNrZ3JvdW5kQ29sb3IgfHwgJycpLnJlcGxhY2UoLyAvZywgJycpO1xyXG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0ZXN0RWxlbWVudCk7XHJcblxyXG4gICAgc3dpdGNoIChjb21wdXRlZENvbG9yKSB7XHJcbiAgICAgIGNhc2UgJ3JnYigwLDAsMCknOiByZXR1cm4gSGlnaENvbnRyYXN0TW9kZS5XSElURV9PTl9CTEFDSztcclxuICAgICAgY2FzZSAncmdiKDI1NSwyNTUsMjU1KSc6IHJldHVybiBIaWdoQ29udHJhc3RNb2RlLkJMQUNLX09OX1dISVRFO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEhpZ2hDb250cmFzdE1vZGUuTk9ORTtcclxuICB9XHJcblxyXG4gIC8qKiBBcHBsaWVzIENTUyBjbGFzc2VzIGluZGljYXRpbmcgaGlnaC1jb250cmFzdCBtb2RlIHRvIGRvY3VtZW50IGJvZHkgKGJyb3dzZXItb25seSkuICovXHJcbiAgX2FwcGx5Qm9keUhpZ2hDb250cmFzdE1vZGVDc3NDbGFzc2VzKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3NlciAmJiB0aGlzLl9kb2N1bWVudC5ib2R5KSB7XHJcbiAgICAgIGNvbnN0IGJvZHlDbGFzc2VzID0gdGhpcy5fZG9jdW1lbnQuYm9keS5jbGFzc0xpc3Q7XHJcbiAgICAgIC8vIElFMTEgZG9lc24ndCBzdXBwb3J0IGBjbGFzc0xpc3RgIG9wZXJhdGlvbnMgd2l0aCBtdWx0aXBsZSBhcmd1bWVudHNcclxuICAgICAgYm9keUNsYXNzZXMucmVtb3ZlKEhJR0hfQ09OVFJBU1RfTU9ERV9BQ1RJVkVfQ1NTX0NMQVNTKTtcclxuICAgICAgYm9keUNsYXNzZXMucmVtb3ZlKEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyk7XHJcbiAgICAgIGJvZHlDbGFzc2VzLnJlbW92ZShXSElURV9PTl9CTEFDS19DU1NfQ0xBU1MpO1xyXG5cclxuICAgICAgY29uc3QgbW9kZSA9IHRoaXMuZ2V0SGlnaENvbnRyYXN0TW9kZSgpO1xyXG4gICAgICBpZiAobW9kZSA9PT0gSGlnaENvbnRyYXN0TW9kZS5CTEFDS19PTl9XSElURSkge1xyXG4gICAgICAgIGJvZHlDbGFzc2VzLmFkZChISUdIX0NPTlRSQVNUX01PREVfQUNUSVZFX0NTU19DTEFTUyk7XHJcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKEJMQUNLX09OX1dISVRFX0NTU19DTEFTUyk7XHJcbiAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gSGlnaENvbnRyYXN0TW9kZS5XSElURV9PTl9CTEFDSykge1xyXG4gICAgICAgIGJvZHlDbGFzc2VzLmFkZChISUdIX0NPTlRSQVNUX01PREVfQUNUSVZFX0NTU19DTEFTUyk7XHJcbiAgICAgICAgYm9keUNsYXNzZXMuYWRkKFdISVRFX09OX0JMQUNLX0NTU19DTEFTUyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19