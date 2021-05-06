/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Gets text of element excluding certain selectors within the element.
 * @param element Element to get text from,
 * @param excludeSelector Selector identifying which elements to exclude,
 */
export function _getTextWithExcludedElements(element, excludeSelector) {
    var _a;
    const clone = element.cloneNode(true);
    const exclusions = clone.querySelectorAll(excludeSelector);
    for (let i = 0; i < exclusions.length; i++) {
        let child = exclusions[i];
        (_a = child.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(child);
    }
    return (clone.textContent || '').trim();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWx0ZXJpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvdGV4dC1maWx0ZXJpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FBQyxPQUFnQixFQUFFLGVBQXVCOztJQUNwRixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBWSxDQUFDO0lBQ2pELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUMxQyxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsTUFBQSxLQUFLLENBQUMsVUFBVSwwQ0FBRSxXQUFXLENBQUMsS0FBSyxFQUFFO0tBQ3RDO0lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGV4dCBvZiBlbGVtZW50IGV4Y2x1ZGluZyBjZXJ0YWluIHNlbGVjdG9ycyB3aXRoaW4gdGhlIGVsZW1lbnQuXHJcbiAqIEBwYXJhbSBlbGVtZW50IEVsZW1lbnQgdG8gZ2V0IHRleHQgZnJvbSxcclxuICogQHBhcmFtIGV4Y2x1ZGVTZWxlY3RvciBTZWxlY3RvciBpZGVudGlmeWluZyB3aGljaCBlbGVtZW50cyB0byBleGNsdWRlLFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRUZXh0V2l0aEV4Y2x1ZGVkRWxlbWVudHMoZWxlbWVudDogRWxlbWVudCwgZXhjbHVkZVNlbGVjdG9yOiBzdHJpbmcpIHtcclxuICBjb25zdCBjbG9uZSA9IGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpIGFzIEVsZW1lbnQ7XHJcbiAgY29uc3QgZXhjbHVzaW9ucyA9IGNsb25lLnF1ZXJ5U2VsZWN0b3JBbGwoZXhjbHVkZVNlbGVjdG9yKTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGV4Y2x1c2lvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgIGxldCBjaGlsZCA9IGV4Y2x1c2lvbnNbaV07XHJcbiAgICBjaGlsZC5wYXJlbnROb2RlPy5yZW1vdmVDaGlsZChjaGlsZCk7XHJcbiAgfVxyXG4gIHJldHVybiAoY2xvbmUudGV4dENvbnRlbnQgfHwgJycpLnRyaW0oKTtcclxufVxyXG4iXX0=