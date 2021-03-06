/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { dispatchFakeEvent, dispatchKeyboardEvent } from './dispatch-events';
import { triggerFocus } from './element-focus';
/**
 * Checks whether the given Element is a text input element.
 * @docs-private
 */
export function isTextInput(element) {
    const nodeName = element.nodeName.toLowerCase();
    return nodeName === 'input' || nodeName === 'textarea';
}
export function typeInElement(element, ...modifiersAndKeys) {
    const first = modifiersAndKeys[0];
    let modifiers;
    let rest;
    if (typeof first !== 'string' && first.keyCode === undefined && first.key === undefined) {
        modifiers = first;
        rest = modifiersAndKeys.slice(1);
    }
    else {
        modifiers = {};
        rest = modifiersAndKeys;
    }
    const keys = rest
        .map(k => typeof k === 'string' ?
        k.split('').map(c => ({ keyCode: c.toUpperCase().charCodeAt(0), key: c })) : [k])
        .reduce((arr, k) => arr.concat(k), []);
    triggerFocus(element);
    for (const key of keys) {
        dispatchKeyboardEvent(element, 'keydown', key.keyCode, key.key, modifiers);
        dispatchKeyboardEvent(element, 'keypress', key.keyCode, key.key, modifiers);
        if (isTextInput(element) && key.key && key.key.length === 1) {
            element.value += key.key;
            dispatchFakeEvent(element, 'input');
        }
        dispatchKeyboardEvent(element, 'keyup', key.keyCode, key.key, modifiers);
    }
}
/**
 * Clears the text in an input or textarea element.
 * @docs-private
 */
export function clearElement(element) {
    triggerFocus(element);
    element.value = '';
    dispatchFakeEvent(element, 'input');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZS1pbi1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvZmFrZS1ldmVudHMvdHlwZS1pbi1lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU3Qzs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLE9BQWdCO0lBQzFDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDaEQsT0FBTyxRQUFRLEtBQUssT0FBTyxJQUFJLFFBQVEsS0FBSyxVQUFVLENBQUU7QUFDMUQsQ0FBQztBQXVCRCxNQUFNLFVBQVUsYUFBYSxDQUFDLE9BQW9CLEVBQUUsR0FBRyxnQkFBcUI7SUFDMUUsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEMsSUFBSSxTQUF1QixDQUFDO0lBQzVCLElBQUksSUFBbUQsQ0FBQztJQUN4RCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLFNBQVMsSUFBSSxLQUFLLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBRTtRQUN2RixTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbEM7U0FBTTtRQUNMLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLEdBQUcsZ0JBQWdCLENBQUM7S0FDekI7SUFDRCxNQUFNLElBQUksR0FBdUMsSUFBSTtTQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xGLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0MsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO1FBQ3RCLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNFLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzVFLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNELE9BQU8sQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUN6QixpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDckM7UUFDRCxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUMxRTtBQUNILENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLE9BQStDO0lBQzFFLFlBQVksQ0FBQyxPQUFzQixDQUFDLENBQUM7SUFDckMsT0FBTyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDbkIsaUJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3RDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7TW9kaWZpZXJLZXlzfSBmcm9tICdAYW5ndWxhci9jZGsvdGVzdGluZyc7XHJcbmltcG9ydCB7ZGlzcGF0Y2hGYWtlRXZlbnQsIGRpc3BhdGNoS2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9kaXNwYXRjaC1ldmVudHMnO1xyXG5pbXBvcnQge3RyaWdnZXJGb2N1c30gZnJvbSAnLi9lbGVtZW50LWZvY3VzJztcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gRWxlbWVudCBpcyBhIHRleHQgaW5wdXQgZWxlbWVudC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVGV4dElucHV0KGVsZW1lbnQ6IEVsZW1lbnQpOiBlbGVtZW50IGlzIEhUTUxJbnB1dEVsZW1lbnQgfCBIVE1MVGV4dEFyZWFFbGVtZW50IHtcclxuICBjb25zdCBub2RlTmFtZSA9IGVsZW1lbnQubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcclxuICByZXR1cm4gbm9kZU5hbWUgPT09ICdpbnB1dCcgfHwgbm9kZU5hbWUgPT09ICd0ZXh0YXJlYScgO1xyXG59XHJcblxyXG4vKipcclxuICogRm9jdXNlcyBhbiBpbnB1dCwgc2V0cyBpdHMgdmFsdWUgYW5kIGRpc3BhdGNoZXNcclxuICogdGhlIGBpbnB1dGAgZXZlbnQsIHNpbXVsYXRpbmcgdGhlIHVzZXIgdHlwaW5nLlxyXG4gKiBAcGFyYW0gZWxlbWVudCBFbGVtZW50IG9udG8gd2hpY2ggdG8gc2V0IHRoZSB2YWx1ZS5cclxuICogQHBhcmFtIGtleXMgVGhlIGtleXMgdG8gc2VuZCB0byB0aGUgZWxlbWVudC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHR5cGVJbkVsZW1lbnQoXHJcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCwgLi4ua2V5czogKHN0cmluZyB8IHtrZXlDb2RlPzogbnVtYmVyLCBrZXk/OiBzdHJpbmd9KVtdKTogdm9pZDtcclxuXHJcbi8qKlxyXG4gKiBGb2N1c2VzIGFuIGlucHV0LCBzZXRzIGl0cyB2YWx1ZSBhbmQgZGlzcGF0Y2hlc1xyXG4gKiB0aGUgYGlucHV0YCBldmVudCwgc2ltdWxhdGluZyB0aGUgdXNlciB0eXBpbmcuXHJcbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgb250byB3aGljaCB0byBzZXQgdGhlIHZhbHVlLlxyXG4gKiBAcGFyYW0gbW9kaWZpZXJzIE1vZGlmaWVyIGtleXMgdGhhdCBhcmUgaGVsZCB3aGlsZSB0eXBpbmcuXHJcbiAqIEBwYXJhbSBrZXlzIFRoZSBrZXlzIHRvIHNlbmQgdG8gdGhlIGVsZW1lbnQuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB0eXBlSW5FbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ua2V5czogKHN0cmluZyB8IHtrZXlDb2RlPzogbnVtYmVyLCBrZXk/OiBzdHJpbmd9KVtdKTogdm9pZDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB0eXBlSW5FbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCAuLi5tb2RpZmllcnNBbmRLZXlzOiBhbnkpIHtcclxuICBjb25zdCBmaXJzdCA9IG1vZGlmaWVyc0FuZEtleXNbMF07XHJcbiAgbGV0IG1vZGlmaWVyczogTW9kaWZpZXJLZXlzO1xyXG4gIGxldCByZXN0OiAoc3RyaW5nIHwge2tleUNvZGU/OiBudW1iZXIsIGtleT86IHN0cmluZ30pW107XHJcbiAgaWYgKHR5cGVvZiBmaXJzdCAhPT0gJ3N0cmluZycgJiYgZmlyc3Qua2V5Q29kZSA9PT0gdW5kZWZpbmVkICYmIGZpcnN0LmtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICBtb2RpZmllcnMgPSBmaXJzdDtcclxuICAgIHJlc3QgPSBtb2RpZmllcnNBbmRLZXlzLnNsaWNlKDEpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBtb2RpZmllcnMgPSB7fTtcclxuICAgIHJlc3QgPSBtb2RpZmllcnNBbmRLZXlzO1xyXG4gIH1cclxuICBjb25zdCBrZXlzOiB7a2V5Q29kZT86IG51bWJlciwga2V5Pzogc3RyaW5nfVtdID0gcmVzdFxyXG4gICAgICAubWFwKGsgPT4gdHlwZW9mIGsgPT09ICdzdHJpbmcnID9cclxuICAgICAgICAgIGsuc3BsaXQoJycpLm1hcChjID0+ICh7a2V5Q29kZTogYy50b1VwcGVyQ2FzZSgpLmNoYXJDb2RlQXQoMCksIGtleTogY30pKSA6IFtrXSlcclxuICAgICAgLnJlZHVjZSgoYXJyLCBrKSA9PiBhcnIuY29uY2F0KGspLCBbXSk7XHJcblxyXG4gIHRyaWdnZXJGb2N1cyhlbGVtZW50KTtcclxuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XHJcbiAgICBkaXNwYXRjaEtleWJvYXJkRXZlbnQoZWxlbWVudCwgJ2tleWRvd24nLCBrZXkua2V5Q29kZSwga2V5LmtleSwgbW9kaWZpZXJzKTtcclxuICAgIGRpc3BhdGNoS2V5Ym9hcmRFdmVudChlbGVtZW50LCAna2V5cHJlc3MnLCBrZXkua2V5Q29kZSwga2V5LmtleSwgbW9kaWZpZXJzKTtcclxuICAgIGlmIChpc1RleHRJbnB1dChlbGVtZW50KSAmJiBrZXkua2V5ICYmIGtleS5rZXkubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIGVsZW1lbnQudmFsdWUgKz0ga2V5LmtleTtcclxuICAgICAgZGlzcGF0Y2hGYWtlRXZlbnQoZWxlbWVudCwgJ2lucHV0Jyk7XHJcbiAgICB9XHJcbiAgICBkaXNwYXRjaEtleWJvYXJkRXZlbnQoZWxlbWVudCwgJ2tleXVwJywga2V5LmtleUNvZGUsIGtleS5rZXksIG1vZGlmaWVycyk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ2xlYXJzIHRoZSB0ZXh0IGluIGFuIGlucHV0IG9yIHRleHRhcmVhIGVsZW1lbnQuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhckVsZW1lbnQoZWxlbWVudDogSFRNTElucHV0RWxlbWVudCB8IEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcclxuICB0cmlnZ2VyRm9jdXMoZWxlbWVudCBhcyBIVE1MRWxlbWVudCk7XHJcbiAgZWxlbWVudC52YWx1ZSA9ICcnO1xyXG4gIGRpc3BhdGNoRmFrZUV2ZW50KGVsZW1lbnQsICdpbnB1dCcpO1xyXG59XHJcbiJdfQ==