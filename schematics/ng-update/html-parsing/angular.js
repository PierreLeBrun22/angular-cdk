"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOutputsOnElementWithAttr = exports.findOutputsOnElementWithTag = exports.findInputsOnElementWithAttr = exports.findInputsOnElementWithTag = void 0;
const elements_1 = require("./elements");
/** Finds the specified Angular @Input in the given elements with tag name. */
function findInputsOnElementWithTag(html, inputName, tagNames) {
    return [
        // Inputs can be also used without brackets (e.g. `<mat-toolbar color="primary">`)
        ...elements_1.findAttributeOnElementWithTag(html, inputName, tagNames),
        // Add one column to the mapped offset because the first bracket for the @Input
        // is part of the attribute and therefore also part of the offset. We only want to return
        // the offset for the inner name of the bracketed input.
        ...elements_1.findAttributeOnElementWithTag(html, `[${inputName}]`, tagNames).map(offset => offset + 1),
    ];
}
exports.findInputsOnElementWithTag = findInputsOnElementWithTag;
/** Finds the specified Angular @Input in elements that have one of the specified attributes. */
function findInputsOnElementWithAttr(html, inputName, attrs) {
    return [
        // Inputs can be also used without brackets (e.g. `<button mat-button color="primary">`)
        ...elements_1.findAttributeOnElementWithAttrs(html, inputName, attrs),
        // Add one column to the mapped offset because the first bracket for the @Input
        // is part of the attribute and therefore also part of the offset. We only want to return
        // the offset for the inner name of the bracketed input.
        ...elements_1.findAttributeOnElementWithAttrs(html, `[${inputName}]`, attrs).map(offset => offset + 1),
    ];
}
exports.findInputsOnElementWithAttr = findInputsOnElementWithAttr;
/** Finds the specified Angular @Output in the given elements with tag name. */
function findOutputsOnElementWithTag(html, outputName, tagNames) {
    // Add one column to the mapped offset because the first parenthesis for the @Output
    // is part of the attribute and therefore also part of the offset. We only want to return
    // the offset for the inner name of the output.
    return elements_1.findAttributeOnElementWithTag(html, `(${outputName})`, tagNames).map(offset => offset + 1);
}
exports.findOutputsOnElementWithTag = findOutputsOnElementWithTag;
/** Finds the specified Angular @Output in elements that have one of the specified attributes. */
function findOutputsOnElementWithAttr(html, outputName, attrs) {
    // Add one column to the mapped offset because the first bracket for the @Output
    // is part of the attribute and therefore also part of the offset. We only want to return
    // the offset for the inner name of the output.
    return elements_1.findAttributeOnElementWithAttrs(html, `(${outputName})`, attrs).map(offset => offset + 1);
}
exports.findOutputsOnElementWithAttr = findOutputsOnElementWithAttr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvaHRtbC1wYXJzaW5nL2FuZ3VsYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgseUNBQTBGO0FBRTFGLDhFQUE4RTtBQUM5RSxTQUFnQiwwQkFBMEIsQ0FBQyxJQUFZLEVBQUUsU0FBaUIsRUFBRSxRQUFrQjtJQUM1RixPQUFPO1FBQ0wsa0ZBQWtGO1FBQ2xGLEdBQUcsd0NBQTZCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUM7UUFDM0QsK0VBQStFO1FBQy9FLHlGQUF5RjtRQUN6Rix3REFBd0Q7UUFDeEQsR0FBRyx3Q0FBNkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzdGLENBQUM7QUFDSixDQUFDO0FBVEQsZ0VBU0M7QUFFRCxnR0FBZ0c7QUFDaEcsU0FBZ0IsMkJBQTJCLENBQUMsSUFBWSxFQUFFLFNBQWlCLEVBQUUsS0FBZTtJQUMxRixPQUFPO1FBQ0wsd0ZBQXdGO1FBQ3hGLEdBQUcsMENBQStCLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUM7UUFDMUQsK0VBQStFO1FBQy9FLHlGQUF5RjtRQUN6Rix3REFBd0Q7UUFDeEQsR0FBRywwQ0FBK0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxTQUFTLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzVGLENBQUM7QUFDSixDQUFDO0FBVEQsa0VBU0M7QUFFRCwrRUFBK0U7QUFDL0UsU0FBZ0IsMkJBQTJCLENBQUMsSUFBWSxFQUFFLFVBQWtCLEVBQUUsUUFBa0I7SUFDOUYsb0ZBQW9GO0lBQ3BGLHlGQUF5RjtJQUN6RiwrQ0FBK0M7SUFDL0MsT0FBTyx3Q0FBNkIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxVQUFVLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUxELGtFQUtDO0FBRUQsaUdBQWlHO0FBQ2pHLFNBQWdCLDRCQUE0QixDQUFDLElBQVksRUFBRSxVQUFrQixFQUFFLEtBQWU7SUFDNUYsZ0ZBQWdGO0lBQ2hGLHlGQUF5RjtJQUN6RiwrQ0FBK0M7SUFDL0MsT0FBTywwQ0FBK0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxVQUFVLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkcsQ0FBQztBQUxELG9FQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge2ZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoQXR0cnMsIGZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoVGFnfSBmcm9tICcuL2VsZW1lbnRzJztcclxuXHJcbi8qKiBGaW5kcyB0aGUgc3BlY2lmaWVkIEFuZ3VsYXIgQElucHV0IGluIHRoZSBnaXZlbiBlbGVtZW50cyB3aXRoIHRhZyBuYW1lLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZElucHV0c09uRWxlbWVudFdpdGhUYWcoaHRtbDogc3RyaW5nLCBpbnB1dE5hbWU6IHN0cmluZywgdGFnTmFtZXM6IHN0cmluZ1tdKSB7XHJcbiAgcmV0dXJuIFtcclxuICAgIC8vIElucHV0cyBjYW4gYmUgYWxzbyB1c2VkIHdpdGhvdXQgYnJhY2tldHMgKGUuZy4gYDxtYXQtdG9vbGJhciBjb2xvcj1cInByaW1hcnlcIj5gKVxyXG4gICAgLi4uZmluZEF0dHJpYnV0ZU9uRWxlbWVudFdpdGhUYWcoaHRtbCwgaW5wdXROYW1lLCB0YWdOYW1lcyksXHJcbiAgICAvLyBBZGQgb25lIGNvbHVtbiB0byB0aGUgbWFwcGVkIG9mZnNldCBiZWNhdXNlIHRoZSBmaXJzdCBicmFja2V0IGZvciB0aGUgQElucHV0XHJcbiAgICAvLyBpcyBwYXJ0IG9mIHRoZSBhdHRyaWJ1dGUgYW5kIHRoZXJlZm9yZSBhbHNvIHBhcnQgb2YgdGhlIG9mZnNldC4gV2Ugb25seSB3YW50IHRvIHJldHVyblxyXG4gICAgLy8gdGhlIG9mZnNldCBmb3IgdGhlIGlubmVyIG5hbWUgb2YgdGhlIGJyYWNrZXRlZCBpbnB1dC5cclxuICAgIC4uLmZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoVGFnKGh0bWwsIGBbJHtpbnB1dE5hbWV9XWAsIHRhZ05hbWVzKS5tYXAob2Zmc2V0ID0+IG9mZnNldCArIDEpLFxyXG4gIF07XHJcbn1cclxuXHJcbi8qKiBGaW5kcyB0aGUgc3BlY2lmaWVkIEFuZ3VsYXIgQElucHV0IGluIGVsZW1lbnRzIHRoYXQgaGF2ZSBvbmUgb2YgdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZElucHV0c09uRWxlbWVudFdpdGhBdHRyKGh0bWw6IHN0cmluZywgaW5wdXROYW1lOiBzdHJpbmcsIGF0dHJzOiBzdHJpbmdbXSkge1xyXG4gIHJldHVybiBbXHJcbiAgICAvLyBJbnB1dHMgY2FuIGJlIGFsc28gdXNlZCB3aXRob3V0IGJyYWNrZXRzIChlLmcuIGA8YnV0dG9uIG1hdC1idXR0b24gY29sb3I9XCJwcmltYXJ5XCI+YClcclxuICAgIC4uLmZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoQXR0cnMoaHRtbCwgaW5wdXROYW1lLCBhdHRycyksXHJcbiAgICAvLyBBZGQgb25lIGNvbHVtbiB0byB0aGUgbWFwcGVkIG9mZnNldCBiZWNhdXNlIHRoZSBmaXJzdCBicmFja2V0IGZvciB0aGUgQElucHV0XHJcbiAgICAvLyBpcyBwYXJ0IG9mIHRoZSBhdHRyaWJ1dGUgYW5kIHRoZXJlZm9yZSBhbHNvIHBhcnQgb2YgdGhlIG9mZnNldC4gV2Ugb25seSB3YW50IHRvIHJldHVyblxyXG4gICAgLy8gdGhlIG9mZnNldCBmb3IgdGhlIGlubmVyIG5hbWUgb2YgdGhlIGJyYWNrZXRlZCBpbnB1dC5cclxuICAgIC4uLmZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoQXR0cnMoaHRtbCwgYFske2lucHV0TmFtZX1dYCwgYXR0cnMpLm1hcChvZmZzZXQgPT4gb2Zmc2V0ICsgMSksXHJcbiAgXTtcclxufVxyXG5cclxuLyoqIEZpbmRzIHRoZSBzcGVjaWZpZWQgQW5ndWxhciBAT3V0cHV0IGluIHRoZSBnaXZlbiBlbGVtZW50cyB3aXRoIHRhZyBuYW1lLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZE91dHB1dHNPbkVsZW1lbnRXaXRoVGFnKGh0bWw6IHN0cmluZywgb3V0cHV0TmFtZTogc3RyaW5nLCB0YWdOYW1lczogc3RyaW5nW10pIHtcclxuICAvLyBBZGQgb25lIGNvbHVtbiB0byB0aGUgbWFwcGVkIG9mZnNldCBiZWNhdXNlIHRoZSBmaXJzdCBwYXJlbnRoZXNpcyBmb3IgdGhlIEBPdXRwdXRcclxuICAvLyBpcyBwYXJ0IG9mIHRoZSBhdHRyaWJ1dGUgYW5kIHRoZXJlZm9yZSBhbHNvIHBhcnQgb2YgdGhlIG9mZnNldC4gV2Ugb25seSB3YW50IHRvIHJldHVyblxyXG4gIC8vIHRoZSBvZmZzZXQgZm9yIHRoZSBpbm5lciBuYW1lIG9mIHRoZSBvdXRwdXQuXHJcbiAgcmV0dXJuIGZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoVGFnKGh0bWwsIGAoJHtvdXRwdXROYW1lfSlgLCB0YWdOYW1lcykubWFwKG9mZnNldCA9PiBvZmZzZXQgKyAxKTtcclxufVxyXG5cclxuLyoqIEZpbmRzIHRoZSBzcGVjaWZpZWQgQW5ndWxhciBAT3V0cHV0IGluIGVsZW1lbnRzIHRoYXQgaGF2ZSBvbmUgb2YgdGhlIHNwZWNpZmllZCBhdHRyaWJ1dGVzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZmluZE91dHB1dHNPbkVsZW1lbnRXaXRoQXR0cihodG1sOiBzdHJpbmcsIG91dHB1dE5hbWU6IHN0cmluZywgYXR0cnM6IHN0cmluZ1tdKSB7XHJcbiAgLy8gQWRkIG9uZSBjb2x1bW4gdG8gdGhlIG1hcHBlZCBvZmZzZXQgYmVjYXVzZSB0aGUgZmlyc3QgYnJhY2tldCBmb3IgdGhlIEBPdXRwdXRcclxuICAvLyBpcyBwYXJ0IG9mIHRoZSBhdHRyaWJ1dGUgYW5kIHRoZXJlZm9yZSBhbHNvIHBhcnQgb2YgdGhlIG9mZnNldC4gV2Ugb25seSB3YW50IHRvIHJldHVyblxyXG4gIC8vIHRoZSBvZmZzZXQgZm9yIHRoZSBpbm5lciBuYW1lIG9mIHRoZSBvdXRwdXQuXHJcbiAgcmV0dXJuIGZpbmRBdHRyaWJ1dGVPbkVsZW1lbnRXaXRoQXR0cnMoaHRtbCwgYCgke291dHB1dE5hbWV9KWAsIGF0dHJzKS5tYXAob2Zmc2V0ID0+IG9mZnNldCArIDEpO1xyXG59XHJcbiJdfQ==