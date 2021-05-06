/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Platform } from '@angular/cdk/platform';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/platform";
/**
 * Configuration for the isFocusable method.
 */
export class IsFocusableConfig {
    constructor() {
        /**
         * Whether to count an element as focusable even if it is not currently visible.
         */
        this.ignoreVisibility = false;
    }
}
// The InteractivityChecker leans heavily on the ally.js accessibility utilities.
// Methods like `isTabbable` are only covering specific edge-cases for the browsers which are
// supported.
/**
 * Utility for checking the interactivity of an element, such as whether is is focusable or
 * tabbable.
 */
export class InteractivityChecker {
    constructor(_platform) {
        this._platform = _platform;
    }
    /**
     * Gets whether an element is disabled.
     *
     * @param element Element to be checked.
     * @returns Whether the element is disabled.
     */
    isDisabled(element) {
        // This does not capture some cases, such as a non-form control with a disabled attribute or
        // a form control inside of a disabled form, but should capture the most common cases.
        return element.hasAttribute('disabled');
    }
    /**
     * Gets whether an element is visible for the purposes of interactivity.
     *
     * This will capture states like `display: none` and `visibility: hidden`, but not things like
     * being clipped by an `overflow: hidden` parent or being outside the viewport.
     *
     * @returns Whether the element is visible.
     */
    isVisible(element) {
        return hasGeometry(element) && getComputedStyle(element).visibility === 'visible';
    }
    /**
     * Gets whether an element can be reached via Tab key.
     * Assumes that the element has already been checked with isFocusable.
     *
     * @param element Element to be checked.
     * @returns Whether the element is tabbable.
     */
    isTabbable(element) {
        // Nothing is tabbable on the server 😎
        if (!this._platform.isBrowser) {
            return false;
        }
        const frameElement = getFrameElement(getWindow(element));
        if (frameElement) {
            // Frame elements inherit their tabindex onto all child elements.
            if (getTabIndexValue(frameElement) === -1) {
                return false;
            }
            // Browsers disable tabbing to an element inside of an invisible frame.
            if (!this.isVisible(frameElement)) {
                return false;
            }
        }
        let nodeName = element.nodeName.toLowerCase();
        let tabIndexValue = getTabIndexValue(element);
        if (element.hasAttribute('contenteditable')) {
            return tabIndexValue !== -1;
        }
        if (nodeName === 'iframe' || nodeName === 'object') {
            // The frame or object's content may be tabbable depending on the content, but it's
            // not possibly to reliably detect the content of the frames. We always consider such
            // elements as non-tabbable.
            return false;
        }
        // In iOS, the browser only considers some specific elements as tabbable.
        if (this._platform.WEBKIT && this._platform.IOS && !isPotentiallyTabbableIOS(element)) {
            return false;
        }
        if (nodeName === 'audio') {
            // Audio elements without controls enabled are never tabbable, regardless
            // of the tabindex attribute explicitly being set.
            if (!element.hasAttribute('controls')) {
                return false;
            }
            // Audio elements with controls are by default tabbable unless the
            // tabindex attribute is set to `-1` explicitly.
            return tabIndexValue !== -1;
        }
        if (nodeName === 'video') {
            // For all video elements, if the tabindex attribute is set to `-1`, the video
            // is not tabbable. Note: We cannot rely on the default `HTMLElement.tabIndex`
            // property as that one is set to `-1` in Chrome, Edge and Safari v13.1. The
            // tabindex attribute is the source of truth here.
            if (tabIndexValue === -1) {
                return false;
            }
            // If the tabindex is explicitly set, and not `-1` (as per check before), the
            // video element is always tabbable (regardless of whether it has controls or not).
            if (tabIndexValue !== null) {
                return true;
            }
            // Otherwise (when no explicit tabindex is set), a video is only tabbable if it
            // has controls enabled. Firefox is special as videos are always tabbable regardless
            // of whether there are controls or not.
            return this._platform.FIREFOX || element.hasAttribute('controls');
        }
        return element.tabIndex >= 0;
    }
    /**
     * Gets whether an element can be focused by the user.
     *
     * @param element Element to be checked.
     * @param config The config object with options to customize this method's behavior
     * @returns Whether the element is focusable.
     */
    isFocusable(element, config) {
        // Perform checks in order of left to most expensive.
        // Again, naive approach that does not capture many edge cases and browser quirks.
        return isPotentiallyFocusable(element) && !this.isDisabled(element) &&
            ((config === null || config === void 0 ? void 0 : config.ignoreVisibility) || this.isVisible(element));
    }
}
InteractivityChecker.ɵprov = i0.ɵɵdefineInjectable({ factory: function InteractivityChecker_Factory() { return new InteractivityChecker(i0.ɵɵinject(i1.Platform)); }, token: InteractivityChecker, providedIn: "root" });
InteractivityChecker.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
InteractivityChecker.ctorParameters = () => [
    { type: Platform }
];
/**
 * Returns the frame element from a window object. Since browsers like MS Edge throw errors if
 * the frameElement property is being accessed from a different host address, this property
 * should be accessed carefully.
 */
function getFrameElement(window) {
    try {
        return window.frameElement;
    }
    catch (_a) {
        return null;
    }
}
/** Checks whether the specified element has any geometry / rectangles. */
function hasGeometry(element) {
    // Use logic from jQuery to check for an invisible element.
    // See https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js#L12
    return !!(element.offsetWidth || element.offsetHeight ||
        (typeof element.getClientRects === 'function' && element.getClientRects().length));
}
/** Gets whether an element's  */
function isNativeFormElement(element) {
    let nodeName = element.nodeName.toLowerCase();
    return nodeName === 'input' ||
        nodeName === 'select' ||
        nodeName === 'button' ||
        nodeName === 'textarea';
}
/** Gets whether an element is an `<input type="hidden">`. */
function isHiddenInput(element) {
    return isInputElement(element) && element.type == 'hidden';
}
/** Gets whether an element is an anchor that has an href attribute. */
function isAnchorWithHref(element) {
    return isAnchorElement(element) && element.hasAttribute('href');
}
/** Gets whether an element is an input element. */
function isInputElement(element) {
    return element.nodeName.toLowerCase() == 'input';
}
/** Gets whether an element is an anchor element. */
function isAnchorElement(element) {
    return element.nodeName.toLowerCase() == 'a';
}
/** Gets whether an element has a valid tabindex. */
function hasValidTabIndex(element) {
    if (!element.hasAttribute('tabindex') || element.tabIndex === undefined) {
        return false;
    }
    let tabIndex = element.getAttribute('tabindex');
    // IE11 parses tabindex="" as the value "-32768"
    if (tabIndex == '-32768') {
        return false;
    }
    return !!(tabIndex && !isNaN(parseInt(tabIndex, 10)));
}
/**
 * Returns the parsed tabindex from the element attributes instead of returning the
 * evaluated tabindex from the browsers defaults.
 */
function getTabIndexValue(element) {
    if (!hasValidTabIndex(element)) {
        return null;
    }
    // See browser issue in Gecko https://bugzilla.mozilla.org/show_bug.cgi?id=1128054
    const tabIndex = parseInt(element.getAttribute('tabindex') || '', 10);
    return isNaN(tabIndex) ? -1 : tabIndex;
}
/** Checks whether the specified element is potentially tabbable on iOS */
function isPotentiallyTabbableIOS(element) {
    let nodeName = element.nodeName.toLowerCase();
    let inputType = nodeName === 'input' && element.type;
    return inputType === 'text'
        || inputType === 'password'
        || nodeName === 'select'
        || nodeName === 'textarea';
}
/**
 * Gets whether an element is potentially focusable without taking current visible/disabled state
 * into account.
 */
function isPotentiallyFocusable(element) {
    // Inputs are potentially focusable *unless* they're type="hidden".
    if (isHiddenInput(element)) {
        return false;
    }
    return isNativeFormElement(element) ||
        isAnchorWithHref(element) ||
        element.hasAttribute('contenteditable') ||
        hasValidTabIndex(element);
}
/** Gets the parent window of a DOM node with regards of being inside of an iframe. */
function getWindow(node) {
    // ownerDocument is null if `node` itself *is* a document.
    return node.ownerDocument && node.ownerDocument.defaultView || window;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJhY3Rpdml0eS1jaGVja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2ludGVyYWN0aXZpdHktY2hlY2tlci9pbnRlcmFjdGl2aXR5LWNoZWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQy9DLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlLENBQUM7OztBQUV6Qzs7R0FFRztBQUNILE1BQU0sT0FBTyxpQkFBaUI7SUFBOUI7UUFDRTs7V0FFRztRQUNILHFCQUFnQixHQUFZLEtBQUssQ0FBQztJQUNwQyxDQUFDO0NBQUE7QUFFRCxpRkFBaUY7QUFDakYsNkZBQTZGO0FBQzdGLGFBQWE7QUFFYjs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sb0JBQW9CO0lBRS9CLFlBQW9CLFNBQW1CO1FBQW5CLGNBQVMsR0FBVCxTQUFTLENBQVU7SUFBRyxDQUFDO0lBRTNDOzs7OztPQUtHO0lBQ0gsVUFBVSxDQUFDLE9BQW9CO1FBQzdCLDRGQUE0RjtRQUM1RixzRkFBc0Y7UUFDdEYsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsU0FBUyxDQUFDLE9BQW9CO1FBQzVCLE9BQU8sV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7SUFDcEYsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFVBQVUsQ0FBQyxPQUFvQjtRQUM3Qix1Q0FBdUM7UUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzdCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMs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b0I7SUFDbEQsbUVBQW1FO0lBQ25FLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQzFCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxPQUFPLG1CQUFtQixDQUFDLE9BQU8sQ0FBQztRQUMvQixnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDekIsT0FBTyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztRQUN2QyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsc0ZBQXNGO0FBQ3RGLFNBQVMsU0FBUyxDQUFDLElBQWlCO0lBQ2xDLDBEQUEwRDtJQUMxRCxPQUFPLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDO0FBQ3hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UGxhdGZvcm19IGZyb20gJ0Bhbmd1bGFyL2Nkay9wbGF0Zm9ybSc7XHJcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBmb3IgdGhlIGlzRm9jdXNhYmxlIG1ldGhvZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBJc0ZvY3VzYWJsZUNvbmZpZyB7XHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0byBjb3VudCBhbiBlbGVtZW50IGFzIGZvY3VzYWJsZSBldmVuIGlmIGl0IGlzIG5vdCBjdXJyZW50bHkgdmlzaWJsZS5cclxuICAgKi9cclxuICBpZ25vcmVWaXNpYmlsaXR5OiBib29sZWFuID0gZmFsc2U7XHJcbn1cclxuXHJcbi8vIFRoZSBJbnRlcmFjdGl2aXR5Q2hlY2tlciBsZWFucyBoZWF2aWx5IG9uIHRoZSBhbGx5LmpzIGFjY2Vzc2liaWxpdHkgdXRpbGl0aWVzLlxyXG4vLyBNZXRob2RzIGxpa2UgYGlzVGFiYmFibGVgIGFyZSBvbmx5IGNvdmVyaW5nIHNwZWNpZmljIGVkZ2UtY2FzZXMgZm9yIHRoZSBicm93c2VycyB3aGljaCBhcmVcclxuLy8gc3VwcG9ydGVkLlxyXG5cclxuLyoqXHJcbiAqIFV0aWxpdHkgZm9yIGNoZWNraW5nIHRoZSBpbnRlcmFjdGl2aXR5IG9mIGFuIGVsZW1lbnQsIHN1Y2ggYXMgd2hldGhlciBpcyBpcyBmb2N1c2FibGUgb3JcclxuICogdGFiYmFibGUuXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEludGVyYWN0aXZpdHlDaGVja2VyIHtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtKSB7fVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyBkaXNhYmxlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gYmUgY2hlY2tlZC5cclxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGRpc2FibGVkLlxyXG4gICAqL1xyXG4gIGlzRGlzYWJsZWQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAgIC8vIFRoaXMgZG9lcyBub3QgY2FwdHVyZSBzb21lIGNhc2VzLCBzdWNoIGFzIGEgbm9uLWZvcm0gY29udHJvbCB3aXRoIGEgZGlzYWJsZWQgYXR0cmlidXRlIG9yXHJcbiAgICAvLyBhIGZvcm0gY29udHJvbCBpbnNpZGUgb2YgYSBkaXNhYmxlZCBmb3JtLCBidXQgc2hvdWxkIGNhcHR1cmUgdGhlIG1vc3QgY29tbW9uIGNhc2VzLlxyXG4gICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgdmlzaWJsZSBmb3IgdGhlIHB1cnBvc2VzIG9mIGludGVyYWN0aXZpdHkuXHJcbiAgICpcclxuICAgKiBUaGlzIHdpbGwgY2FwdHVyZSBzdGF0ZXMgbGlrZSBgZGlzcGxheTogbm9uZWAgYW5kIGB2aXNpYmlsaXR5OiBoaWRkZW5gLCBidXQgbm90IHRoaW5ncyBsaWtlXHJcbiAgICogYmVpbmcgY2xpcHBlZCBieSBhbiBgb3ZlcmZsb3c6IGhpZGRlbmAgcGFyZW50IG9yIGJlaW5nIG91dHNpZGUgdGhlIHZpZXdwb3J0LlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgZWxlbWVudCBpcyB2aXNpYmxlLlxyXG4gICAqL1xyXG4gIGlzVmlzaWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIGhhc0dlb21ldHJ5KGVsZW1lbnQpICYmIGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkudmlzaWJpbGl0eSA9PT0gJ3Zpc2libGUnO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgY2FuIGJlIHJlYWNoZWQgdmlhIFRhYiBrZXkuXHJcbiAgICogQXNzdW1lcyB0aGF0IHRoZSBlbGVtZW50IGhhcyBhbHJlYWR5IGJlZW4gY2hlY2tlZCB3aXRoIGlzRm9jdXNhYmxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgRWxlbWVudCB0byBiZSBjaGVja2VkLlxyXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgdGFiYmFibGUuXHJcbiAgICovXHJcbiAgaXNUYWJiYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gTm90aGluZyBpcyB0YWJiYWJsZSBvbiB0aGUgc2VydmVyIPCfmI5cclxuICAgIGlmICghdGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmcmFtZUVsZW1lbnQgPSBnZXRGcmFtZUVsZW1lbnQoZ2V0V2luZG93KGVsZW1lbnQpKTtcclxuXHJcbiAgICBpZiAoZnJhbWVFbGVtZW50KSB7XHJcbiAgICAgIC8vIEZyYW1lIGVsZW1lbnRzIGluaGVyaXQgdGhlaXIgdGFiaW5kZXggb250byBhbGwgY2hpbGQgZWxlbWVudHMuXHJcbiAgICAgIGlmIChnZXRUYWJJbmRleFZhbHVlKGZyYW1lRWxlbWVudCkgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBCcm93c2VycyBkaXNhYmxlIHRhYmJpbmcgdG8gYW4gZWxlbWVudCBpbnNpZGUgb2YgYW4gaW52aXNpYmxlIGZyYW1lLlxyXG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKGZyYW1lRWxlbWVudCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgbm9kZU5hbWUgPSBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBsZXQgdGFiSW5kZXhWYWx1ZSA9IGdldFRhYkluZGV4VmFsdWUoZWxlbWVudCk7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250ZW50ZWRpdGFibGUnKSkge1xyXG4gICAgICByZXR1cm4gdGFiSW5kZXhWYWx1ZSAhPT0gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG5vZGVOYW1lID09PSAnaWZyYW1lJyB8fCBub2RlTmFtZSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgLy8gVGhlIGZyYW1lIG9yIG9iamVjdCdzIGNvbnRlbnQgbWF5IGJlIHRhYmJhYmxlIGRlcGVuZGluZyBvbiB0aGUgY29udGVudCwgYnV0IGl0J3NcclxuICAgICAgLy8gbm90IHBvc3NpYmx5IHRvIHJlbGlhYmx5IGRldGVjdCB0aGUgY29udGVudCBvZiB0aGUgZnJhbWVzLiBXZSBhbHdheXMgY29uc2lkZXIgc3VjaFxyXG4gICAgICAvLyBlbGVtZW50cyBhcyBub24tdGFiYmFibGUuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJbiBpT1MsIHRoZSBicm93c2VyIG9ubHkgY29uc2lkZXJzIHNvbWUgc3BlY2lmaWMgZWxlbWVudHMgYXMgdGFiYmFibGUuXHJcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uV0VCS0lUICYmIHRoaXMuX3BsYXRmb3JtLklPUyAmJiAhaXNQb3RlbnRpYWxseVRhYmJhYmxlSU9TKGVsZW1lbnQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAobm9kZU5hbWUgPT09ICdhdWRpbycpIHtcclxuICAgICAgLy8gQXVkaW8gZWxlbWVudHMgd2l0aG91dCBjb250cm9scyBlbmFibGVkIGFyZSBuZXZlciB0YWJiYWJsZSwgcmVnYXJkbGVzc1xyXG4gICAgICAvLyBvZiB0aGUgdGFiaW5kZXggYXR0cmlidXRlIGV4cGxpY2l0bHkgYmVpbmcgc2V0LlxyXG4gICAgICBpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKCdjb250cm9scycpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIEF1ZGlvIGVsZW1lbnRzIHdpdGggY29udHJvbHMgYXJlIGJ5IGRlZmF1bHQgdGFiYmFibGUgdW5sZXNzIHRoZVxyXG4gICAgICAvLyB0YWJpbmRleCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGAtMWAgZXhwbGljaXRseS5cclxuICAgICAgcmV0dXJuIHRhYkluZGV4VmFsdWUgIT09IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChub2RlTmFtZSA9PT0gJ3ZpZGVvJykge1xyXG4gICAgICAvLyBGb3IgYWxsIHZpZGVvIGVsZW1lbnRzLCBpZiB0aGUgdGFiaW5kZXggYXR0cmlidXRlIGlzIHNldCB0byBgLTFgLCB0aGUgdmlkZW9cclxuICAgICAgLy8gaXMgbm90IHRhYmJhYmxlLiBOb3RlOiBXZSBjYW5ub3QgcmVseSBvbiB0aGUgZGVmYXVsdCBgSFRNTEVsZW1lbnQudGFiSW5kZXhgXHJcbiAgICAgIC8vIHByb3BlcnR5IGFzIHRoYXQgb25lIGlzIHNldCB0byBgLTFgIGluIENocm9tZSwgRWRnZSBhbmQgU2FmYXJpIHYxMy4xLiBUaGVcclxuICAgICAgLy8gdGFiaW5kZXggYXR0cmlidXRlIGlzIHRoZSBzb3VyY2Ugb2YgdHJ1dGggaGVyZS5cclxuICAgICAgaWYgKHRhYkluZGV4VmFsdWUgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIElmIHRoZSB0YWJpbmRleCBpcyBleHBsaWNpdGx5IHNldCwgYW5kIG5vdCBgLTFgIChhcyBwZXIgY2hlY2sgYmVmb3JlKSwgdGhlXHJcbiAgICAgIC8vIHZpZGVvIGVsZW1lbnQgaXMgYWx3YXlzIHRhYmJhYmxlIChyZWdhcmRsZXNzIG9mIHdoZXRoZXIgaXQgaGFzIGNvbnRyb2xzIG9yIG5vdCkuXHJcbiAgICAgIGlmICh0YWJJbmRleFZhbHVlICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gT3RoZXJ3aXNlICh3aGVuIG5vIGV4cGxpY2l0IHRhYmluZGV4IGlzIHNldCksIGEgdmlkZW8gaXMgb25seSB0YWJiYWJsZSBpZiBpdFxyXG4gICAgICAvLyBoYXMgY29udHJvbHMgZW5hYmxlZC4gRmlyZWZveCBpcyBzcGVjaWFsIGFzIHZpZGVvcyBhcmUgYWx3YXlzIHRhYmJhYmxlIHJlZ2FyZGxlc3NcclxuICAgICAgLy8gb2Ygd2hldGhlciB0aGVyZSBhcmUgY29udHJvbHMgb3Igbm90LlxyXG4gICAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm0uRklSRUZPWCB8fCBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udHJvbHMnKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZWxlbWVudC50YWJJbmRleCA+PSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgY2FuIGJlIGZvY3VzZWQgYnkgdGhlIHVzZXIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IHRvIGJlIGNoZWNrZWQuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBUaGUgY29uZmlnIG9iamVjdCB3aXRoIG9wdGlvbnMgdG8gY3VzdG9taXplIHRoaXMgbWV0aG9kJ3MgYmVoYXZpb3JcclxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBlbGVtZW50IGlzIGZvY3VzYWJsZS5cclxuICAgKi9cclxuICBpc0ZvY3VzYWJsZShlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogSXNGb2N1c2FibGVDb25maWcpOiBib29sZWFuIHtcclxuICAgIC8vIFBlcmZvcm0gY2hlY2tzIGluIG9yZGVyIG9mIGxlZnQgdG8gbW9zdCBleHBlbnNpdmUuXHJcbiAgICAvLyBBZ2FpbiwgbmFpdmUgYXBwcm9hY2ggdGhhdCBkb2VzIG5vdCBjYXB0dXJlIG1hbnkgZWRnZSBjYXNlcyBhbmQgYnJvd3NlciBxdWlya3MuXHJcbiAgICByZXR1cm4gaXNQb3RlbnRpYWxseUZvY3VzYWJsZShlbGVtZW50KSAmJiAhdGhpcy5pc0Rpc2FibGVkKGVsZW1lbnQpICYmXHJcbiAgICAgIChjb25maWc/Lmlnbm9yZVZpc2liaWxpdHkgfHwgdGhpcy5pc1Zpc2libGUoZWxlbWVudCkpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBmcmFtZSBlbGVtZW50IGZyb20gYSB3aW5kb3cgb2JqZWN0LiBTaW5jZSBicm93c2VycyBsaWtlIE1TIEVkZ2UgdGhyb3cgZXJyb3JzIGlmXHJcbiAqIHRoZSBmcmFtZUVsZW1lbnQgcHJvcGVydHkgaXMgYmVpbmcgYWNjZXNzZWQgZnJvbSBhIGRpZmZlcmVudCBob3N0IGFkZHJlc3MsIHRoaXMgcHJvcGVydHlcclxuICogc2hvdWxkIGJlIGFjY2Vzc2VkIGNhcmVmdWxseS5cclxuICovXHJcbmZ1bmN0aW9uIGdldEZyYW1lRWxlbWVudCh3aW5kb3c6IFdpbmRvdykge1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gd2luZG93LmZyYW1lRWxlbWVudCBhcyBIVE1MRWxlbWVudDtcclxuICB9IGNhdGNoIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBoYXMgYW55IGdlb21ldHJ5IC8gcmVjdGFuZ2xlcy4gKi9cclxuZnVuY3Rpb24gaGFzR2VvbWV0cnkoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAvLyBVc2UgbG9naWMgZnJvbSBqUXVlcnkgdG8gY2hlY2sgZm9yIGFuIGludmlzaWJsZSBlbGVtZW50LlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL21hc3Rlci9zcmMvY3NzL2hpZGRlblZpc2libGVTZWxlY3RvcnMuanMjTDEyXHJcbiAgcmV0dXJuICEhKGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgZWxlbWVudC5vZmZzZXRIZWlnaHQgfHxcclxuICAgICAgKHR5cGVvZiBlbGVtZW50LmdldENsaWVudFJlY3RzID09PSAnZnVuY3Rpb24nICYmIGVsZW1lbnQuZ2V0Q2xpZW50UmVjdHMoKS5sZW5ndGgpKTtcclxufVxyXG5cclxuLyoqIEdldHMgd2hldGhlciBhbiBlbGVtZW50J3MgICovXHJcbmZ1bmN0aW9uIGlzTmF0aXZlRm9ybUVsZW1lbnQoZWxlbWVudDogTm9kZSkge1xyXG4gIGxldCBub2RlTmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcclxuICByZXR1cm4gbm9kZU5hbWUgPT09ICdpbnB1dCcgfHxcclxuICAgICAgbm9kZU5hbWUgPT09ICdzZWxlY3QnIHx8XHJcbiAgICAgIG5vZGVOYW1lID09PSAnYnV0dG9uJyB8fFxyXG4gICAgICBub2RlTmFtZSA9PT0gJ3RleHRhcmVhJztcclxufVxyXG5cclxuLyoqIEdldHMgd2hldGhlciBhbiBlbGVtZW50IGlzIGFuIGA8aW5wdXQgdHlwZT1cImhpZGRlblwiPmAuICovXHJcbmZ1bmN0aW9uIGlzSGlkZGVuSW5wdXQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICByZXR1cm4gaXNJbnB1dEVsZW1lbnQoZWxlbWVudCkgJiYgZWxlbWVudC50eXBlID09ICdoaWRkZW4nO1xyXG59XHJcblxyXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgYW4gYW5jaG9yIHRoYXQgaGFzIGFuIGhyZWYgYXR0cmlidXRlLiAqL1xyXG5mdW5jdGlvbiBpc0FuY2hvcldpdGhIcmVmKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgcmV0dXJuIGlzQW5jaG9yRWxlbWVudChlbGVtZW50KSAmJiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnaHJlZicpO1xyXG59XHJcblxyXG4vKiogR2V0cyB3aGV0aGVyIGFuIGVsZW1lbnQgaXMgYW4gaW5wdXQgZWxlbWVudC4gKi9cclxuZnVuY3Rpb24gaXNJbnB1dEVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxJbnB1dEVsZW1lbnQge1xyXG4gIHJldHVybiBlbGVtZW50Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT0gJ2lucHV0JztcclxufVxyXG5cclxuLyoqIEdldHMgd2hldGhlciBhbiBlbGVtZW50IGlzIGFuIGFuY2hvciBlbGVtZW50LiAqL1xyXG5mdW5jdGlvbiBpc0FuY2hvckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxBbmNob3JFbGVtZW50IHtcclxuICByZXR1cm4gZWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09ICdhJztcclxufVxyXG5cclxuLyoqIEdldHMgd2hldGhlciBhbiBlbGVtZW50IGhhcyBhIHZhbGlkIHRhYmluZGV4LiAqL1xyXG5mdW5jdGlvbiBoYXNWYWxpZFRhYkluZGV4KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgaWYgKCFlbGVtZW50Lmhhc0F0dHJpYnV0ZSgndGFiaW5kZXgnKSB8fCBlbGVtZW50LnRhYkluZGV4ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGxldCB0YWJJbmRleCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd0YWJpbmRleCcpO1xyXG5cclxuICAvLyBJRTExIHBhcnNlcyB0YWJpbmRleD1cIlwiIGFzIHRoZSB2YWx1ZSBcIi0zMjc2OFwiXHJcbiAgaWYgKHRhYkluZGV4ID09ICctMzI3NjgnKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gISEodGFiSW5kZXggJiYgIWlzTmFOKHBhcnNlSW50KHRhYkluZGV4LCAxMCkpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHBhcnNlZCB0YWJpbmRleCBmcm9tIHRoZSBlbGVtZW50IGF0dHJpYnV0ZXMgaW5zdGVhZCBvZiByZXR1cm5pbmcgdGhlXHJcbiAqIGV2YWx1YXRlZCB0YWJpbmRleCBmcm9tIHRoZSBicm93c2VycyBkZWZhdWx0cy5cclxuICovXHJcbmZ1bmN0aW9uIGdldFRhYkluZGV4VmFsdWUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBudW1iZXIgfCBudWxsIHtcclxuICBpZiAoIWhhc1ZhbGlkVGFiSW5kZXgoZWxlbWVudCkpIHtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLy8gU2VlIGJyb3dzZXIgaXNzdWUgaW4gR2Vja28gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTEyODA1NFxyXG4gIGNvbnN0IHRhYkluZGV4ID0gcGFyc2VJbnQoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JykgfHwgJycsIDEwKTtcclxuXHJcbiAgcmV0dXJuIGlzTmFOKHRhYkluZGV4KSA/IC0xIDogdGFiSW5kZXg7XHJcbn1cclxuXHJcbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaXMgcG90ZW50aWFsbHkgdGFiYmFibGUgb24gaU9TICovXHJcbmZ1bmN0aW9uIGlzUG90ZW50aWFsbHlUYWJiYWJsZUlPUyhlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xyXG4gIGxldCBub2RlTmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcclxuICBsZXQgaW5wdXRUeXBlID0gbm9kZU5hbWUgPT09ICdpbnB1dCcgJiYgKGVsZW1lbnQgYXMgSFRNTElucHV0RWxlbWVudCkudHlwZTtcclxuXHJcbiAgcmV0dXJuIGlucHV0VHlwZSA9PT0gJ3RleHQnXHJcbiAgICAgIHx8IGlucHV0VHlwZSA9PT0gJ3Bhc3N3b3JkJ1xyXG4gICAgICB8fCBub2RlTmFtZSA9PT0gJ3NlbGVjdCdcclxuICAgICAgfHwgbm9kZU5hbWUgPT09ICd0ZXh0YXJlYSc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHdoZXRoZXIgYW4gZWxlbWVudCBpcyBwb3RlbnRpYWxseSBmb2N1c2FibGUgd2l0aG91dCB0YWtpbmcgY3VycmVudCB2aXNpYmxlL2Rpc2FibGVkIHN0YXRlXHJcbiAqIGludG8gYWNjb3VudC5cclxuICovXHJcbmZ1bmN0aW9uIGlzUG90ZW50aWFsbHlGb2N1c2FibGUoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICAvLyBJbnB1dHMgYXJlIHBvdGVudGlhbGx5IGZvY3VzYWJsZSAqdW5sZXNzKiB0aGV5J3JlIHR5cGU9XCJoaWRkZW5cIi5cclxuICBpZiAoaXNIaWRkZW5JbnB1dChlbGVtZW50KSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGlzTmF0aXZlRm9ybUVsZW1lbnQoZWxlbWVudCkgfHxcclxuICAgICAgaXNBbmNob3JXaXRoSHJlZihlbGVtZW50KSB8fFxyXG4gICAgICBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnY29udGVudGVkaXRhYmxlJykgfHxcclxuICAgICAgaGFzVmFsaWRUYWJJbmRleChlbGVtZW50KTtcclxufVxyXG5cclxuLyoqIEdldHMgdGhlIHBhcmVudCB3aW5kb3cgb2YgYSBET00gbm9kZSB3aXRoIHJlZ2FyZHMgb2YgYmVpbmcgaW5zaWRlIG9mIGFuIGlmcmFtZS4gKi9cclxuZnVuY3Rpb24gZ2V0V2luZG93KG5vZGU6IEhUTUxFbGVtZW50KTogV2luZG93IHtcclxuICAvLyBvd25lckRvY3VtZW50IGlzIG51bGwgaWYgYG5vZGVgIGl0c2VsZiAqaXMqIGEgZG9jdW1lbnQuXHJcbiAgcmV0dXJuIG5vZGUub3duZXJEb2N1bWVudCAmJiBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcgfHwgd2luZG93O1xyXG59XHJcbiJdfQ==