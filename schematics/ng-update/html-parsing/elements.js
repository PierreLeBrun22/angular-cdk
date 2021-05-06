"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStartOffsetOfAttribute = exports.findAttributeOnElementWithAttrs = exports.findAttributeOnElementWithTag = exports.findElementsWithAttribute = void 0;
const parse5_1 = require("parse5");
/**
 * Parses a HTML fragment and traverses all AST nodes in order find elements that
 * include the specified attribute.
 */
function findElementsWithAttribute(html, attributeName) {
    const document = parse5_1.parseFragment(html, { sourceCodeLocationInfo: true });
    const elements = [];
    const visitNodes = nodes => {
        nodes.forEach(node => {
            if (node.childNodes) {
                visitNodes(node.childNodes);
            }
            if (node.attrs && node.attrs.some(attr => attr.name === attributeName.toLowerCase())) {
                elements.push(node);
            }
        });
    };
    visitNodes(document.childNodes);
    return elements;
}
exports.findElementsWithAttribute = findElementsWithAttribute;
/**
 * Finds elements with explicit tag names that also contain the specified attribute. Returns the
 * attribute start offset based on the specified HTML.
 */
function findAttributeOnElementWithTag(html, name, tagNames) {
    return findElementsWithAttribute(html, name)
        .filter(element => tagNames.includes(element.tagName))
        .map(element => getStartOffsetOfAttribute(element, name));
}
exports.findAttributeOnElementWithTag = findAttributeOnElementWithTag;
/**
 * Finds elements that contain the given attribute and contain at least one of the other
 * specified attributes. Returns the primary attribute's start offset based on the specified HTML.
 */
function findAttributeOnElementWithAttrs(html, name, attrs) {
    return findElementsWithAttribute(html, name)
        .filter(element => attrs.some(attr => hasElementAttribute(element, attr)))
        .map(element => getStartOffsetOfAttribute(element, name));
}
exports.findAttributeOnElementWithAttrs = findAttributeOnElementWithAttrs;
/** Shorthand function that checks if the specified element contains the given attribute. */
function hasElementAttribute(element, attributeName) {
    return element.attrs && element.attrs.some(attr => attr.name === attributeName.toLowerCase());
}
/** Gets the start offset of the given attribute from a Parse5 element. */
function getStartOffsetOfAttribute(element, attributeName) {
    return element.sourceCodeLocation.attrs[attributeName.toLowerCase()].startOffset;
}
exports.getStartOffsetOfAttribute = getStartOffsetOfAttribute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2h0bWwtcGFyc2luZy9lbGVtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxtQ0FBOEU7QUFFOUU7OztHQUdHO0FBQ0gsU0FBZ0IseUJBQXlCLENBQUMsSUFBWSxFQUFFLGFBQXFCO0lBQzNFLE1BQU0sUUFBUSxHQUFHLHNCQUFhLENBQUMsSUFBSSxFQUFFLEVBQUMsc0JBQXNCLEVBQUUsSUFBSSxFQUFDLENBQXdCLENBQUM7SUFDNUYsTUFBTSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztJQUUxQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsRUFBRTtRQUN6QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM3QjtZQUVELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7Z0JBQ3BGLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDckI7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztJQUVGLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFaEMsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQztBQW5CRCw4REFtQkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQiw2QkFBNkIsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLFFBQWtCO0lBQzFGLE9BQU8seUJBQXlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztTQUN2QyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNyRCxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBSkQsc0VBSUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQiwrQkFBK0IsQ0FBQyxJQUFZLEVBQUUsSUFBWSxFQUFFLEtBQWU7SUFDekYsT0FBTyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO1NBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN6RSxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBSkQsMEVBSUM7QUFFRCw0RkFBNEY7QUFDNUYsU0FBUyxtQkFBbUIsQ0FBQyxPQUEyQixFQUFFLGFBQXFCO0lBQzdFLE9BQU8sT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDaEcsQ0FBQztBQUdELDBFQUEwRTtBQUMxRSxTQUFnQix5QkFBeUIsQ0FBQyxPQUFZLEVBQUUsYUFBcUI7SUFDM0UsT0FBTyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQztBQUNuRixDQUFDO0FBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RGVmYXVsdFRyZWVEb2N1bWVudCwgRGVmYXVsdFRyZWVFbGVtZW50LCBwYXJzZUZyYWdtZW50fSBmcm9tICdwYXJzZTUnO1xyXG5cclxuLyoqXHJcbiAqIFBhcnNlcyBhIEhUTUwgZnJhZ21lbnQgYW5kIHRyYXZlcnNlcyBhbGwgQVNUIG5vZGVzIGluIG9yZGVyIGZpbmQgZWxlbWVudHMgdGhhdFxyXG4gKiBpbmNsdWRlIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRFbGVtZW50c1dpdGhBdHRyaWJ1dGUoaHRtbDogc3RyaW5nLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpIHtcclxuICBjb25zdCBkb2N1bWVudCA9IHBhcnNlRnJhZ21lbnQoaHRtbCwge3NvdXJjZUNvZGVMb2NhdGlvbkluZm86IHRydWV9KSBhcyBEZWZhdWx0VHJlZURvY3VtZW50O1xyXG4gIGNvbnN0IGVsZW1lbnRzOiBEZWZhdWx0VHJlZUVsZW1lbnRbXSA9IFtdO1xyXG5cclxuICBjb25zdCB2aXNpdE5vZGVzID0gbm9kZXMgPT4ge1xyXG4gICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcclxuICAgICAgaWYgKG5vZGUuY2hpbGROb2Rlcykge1xyXG4gICAgICAgIHZpc2l0Tm9kZXMobm9kZS5jaGlsZE5vZGVzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG5vZGUuYXR0cnMgJiYgbm9kZS5hdHRycy5zb21lKGF0dHIgPT4gYXR0ci5uYW1lID09PSBhdHRyaWJ1dGVOYW1lLnRvTG93ZXJDYXNlKCkpKSB7XHJcbiAgICAgICAgZWxlbWVudHMucHVzaChub2RlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgdmlzaXROb2Rlcyhkb2N1bWVudC5jaGlsZE5vZGVzKTtcclxuXHJcbiAgcmV0dXJuIGVsZW1lbnRzO1xyXG59XHJcblxyXG4vKipcclxuICogRmluZHMgZWxlbWVudHMgd2l0aCBleHBsaWNpdCB0YWcgbmFtZXMgdGhhdCBhbHNvIGNvbnRhaW4gdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGUuIFJldHVybnMgdGhlXHJcbiAqIGF0dHJpYnV0ZSBzdGFydCBvZmZzZXQgYmFzZWQgb24gdGhlIHNwZWNpZmllZCBIVE1MLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoVGFnKGh0bWw6IHN0cmluZywgbmFtZTogc3RyaW5nLCB0YWdOYW1lczogc3RyaW5nW10pIHtcclxuICByZXR1cm4gZmluZEVsZW1lbnRzV2l0aEF0dHJpYnV0ZShodG1sLCBuYW1lKVxyXG4gICAgICAuZmlsdGVyKGVsZW1lbnQgPT4gdGFnTmFtZXMuaW5jbHVkZXMoZWxlbWVudC50YWdOYW1lKSlcclxuICAgICAgLm1hcChlbGVtZW50ID0+IGdldFN0YXJ0T2Zmc2V0T2ZBdHRyaWJ1dGUoZWxlbWVudCwgbmFtZSkpO1xyXG59XHJcblxyXG4vKipcclxuICogRmluZHMgZWxlbWVudHMgdGhhdCBjb250YWluIHRoZSBnaXZlbiBhdHRyaWJ1dGUgYW5kIGNvbnRhaW4gYXQgbGVhc3Qgb25lIG9mIHRoZSBvdGhlclxyXG4gKiBzcGVjaWZpZWQgYXR0cmlidXRlcy4gUmV0dXJucyB0aGUgcHJpbWFyeSBhdHRyaWJ1dGUncyBzdGFydCBvZmZzZXQgYmFzZWQgb24gdGhlIHNwZWNpZmllZCBIVE1MLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoQXR0cnMoaHRtbDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIGF0dHJzOiBzdHJpbmdbXSkge1xyXG4gIHJldHVybiBmaW5kRWxlbWVudHNXaXRoQXR0cmlidXRlKGh0bWwsIG5hbWUpXHJcbiAgICAgIC5maWx0ZXIoZWxlbWVudCA9PiBhdHRycy5zb21lKGF0dHIgPT4gaGFzRWxlbWVudEF0dHJpYnV0ZShlbGVtZW50LCBhdHRyKSkpXHJcbiAgICAgIC5tYXAoZWxlbWVudCA9PiBnZXRTdGFydE9mZnNldE9mQXR0cmlidXRlKGVsZW1lbnQsIG5hbWUpKTtcclxufVxyXG5cclxuLyoqIFNob3J0aGFuZCBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgY29udGFpbnMgdGhlIGdpdmVuIGF0dHJpYnV0ZS4gKi9cclxuZnVuY3Rpb24gaGFzRWxlbWVudEF0dHJpYnV0ZShlbGVtZW50OiBEZWZhdWx0VHJlZUVsZW1lbnQsIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiBlbGVtZW50LmF0dHJzICYmIGVsZW1lbnQuYXR0cnMuc29tZShhdHRyID0+IGF0dHIubmFtZSA9PT0gYXR0cmlidXRlTmFtZS50b0xvd2VyQ2FzZSgpKTtcclxufVxyXG5cclxuXHJcbi8qKiBHZXRzIHRoZSBzdGFydCBvZmZzZXQgb2YgdGhlIGdpdmVuIGF0dHJpYnV0ZSBmcm9tIGEgUGFyc2U1IGVsZW1lbnQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFydE9mZnNldE9mQXR0cmlidXRlKGVsZW1lbnQ6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nKTogbnVtYmVyIHtcclxuICByZXR1cm4gZWxlbWVudC5zb3VyY2VDb2RlTG9jYXRpb24uYXR0cnNbYXR0cmlidXRlTmFtZS50b0xvd2VyQ2FzZSgpXS5zdGFydE9mZnNldDtcclxufVxyXG4iXX0=