"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStringLiteralLike = exports.findAllSubstringIndices = void 0;
const ts = require("typescript");
/** Finds all start indices of the given search string in the input string. */
function findAllSubstringIndices(input, search) {
    const result = [];
    let i = -1;
    while ((i = input.indexOf(search, i + 1)) !== -1) {
        result.push(i);
    }
    return result;
}
exports.findAllSubstringIndices = findAllSubstringIndices;
/**
 * Checks whether the given node is either a string literal or a no-substitution template
 * literal. Note that we cannot use `ts.isStringLiteralLike()` because if developers update
 * an outdated project, their TypeScript version is not automatically being updated
 * and therefore could throw because the function is not available yet.
 * https://github.com/Microsoft/TypeScript/commit/8518343dc8762475a5e92c9f80b5c5725bd81796
 */
function isStringLiteralLike(node) {
    return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}
exports.isStringLiteralLike = isStringLiteralLike;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl0ZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvdHlwZXNjcmlwdC9saXRlcmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUVqQyw4RUFBOEU7QUFDOUUsU0FBZ0IsdUJBQXVCLENBQUMsS0FBYSxFQUFFLE1BQWM7SUFDbkUsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ1gsT0FBTyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQVBELDBEQU9DO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQUMsSUFBYTtJQUUvQyxPQUFPLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlFLENBQUM7QUFIRCxrREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcblxyXG4vKiogRmluZHMgYWxsIHN0YXJ0IGluZGljZXMgb2YgdGhlIGdpdmVuIHNlYXJjaCBzdHJpbmcgaW4gdGhlIGlucHV0IHN0cmluZy4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGxTdWJzdHJpbmdJbmRpY2VzKGlucHV0OiBzdHJpbmcsIHNlYXJjaDogc3RyaW5nKTogbnVtYmVyW10ge1xyXG4gIGNvbnN0IHJlc3VsdDogbnVtYmVyW10gPSBbXTtcclxuICBsZXQgaSA9IC0xO1xyXG4gIHdoaWxlICgoaSA9IGlucHV0LmluZGV4T2Yoc2VhcmNoLCBpICsgMSkpICE9PSAtMSkge1xyXG4gICAgcmVzdWx0LnB1c2goaSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gbm9kZSBpcyBlaXRoZXIgYSBzdHJpbmcgbGl0ZXJhbCBvciBhIG5vLXN1YnN0aXR1dGlvbiB0ZW1wbGF0ZVxyXG4gKiBsaXRlcmFsLiBOb3RlIHRoYXQgd2UgY2Fubm90IHVzZSBgdHMuaXNTdHJpbmdMaXRlcmFsTGlrZSgpYCBiZWNhdXNlIGlmIGRldmVsb3BlcnMgdXBkYXRlXHJcbiAqIGFuIG91dGRhdGVkIHByb2plY3QsIHRoZWlyIFR5cGVTY3JpcHQgdmVyc2lvbiBpcyBub3QgYXV0b21hdGljYWxseSBiZWluZyB1cGRhdGVkXHJcbiAqIGFuZCB0aGVyZWZvcmUgY291bGQgdGhyb3cgYmVjYXVzZSB0aGUgZnVuY3Rpb24gaXMgbm90IGF2YWlsYWJsZSB5ZXQuXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC9jb21taXQvODUxODM0M2RjODc2MjQ3NWE1ZTkyYzlmODBiNWM1NzI1YmQ4MTc5NlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nTGl0ZXJhbExpa2Uobm9kZTogdHMuTm9kZSk6XHJcbiAgICBub2RlIGlzICh0cy5TdHJpbmdMaXRlcmFsIHwgdHMuTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWwpIHtcclxuICByZXR1cm4gdHMuaXNTdHJpbmdMaXRlcmFsKG5vZGUpIHx8IHRzLmlzTm9TdWJzdGl0dXRpb25UZW1wbGF0ZUxpdGVyYWwobm9kZSk7XHJcbn1cclxuIl19