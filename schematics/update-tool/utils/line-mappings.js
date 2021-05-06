"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeLineStartsMap = exports.getLineAndCharacterFromPosition = void 0;
/*
 * Line mapping utilities which can be used to retrieve line and character based
 * on an absolute character position in a given file. This functionality is similar
 * to TypeScript's "ts.getLineAndCharacterFromPosition" utility, but we cannot leverage
 * their logic for line mappings as it's internal and we need to generate line mappings
 * for non-TypeScript files such as HTML templates or stylesheets.
 *
 * Line and character can be retrieved by splitting a given source text based on
 * line breaks into line start entries. Later when a specific position is requested,
 * the closest line-start position is determined based on the given position.
 */
const LF_CHAR = 10;
const CR_CHAR = 13;
const LINE_SEP_CHAR = 8232;
const PARAGRAPH_CHAR = 8233;
/** Gets the line and character for the given position from the line starts map. */
function getLineAndCharacterFromPosition(lineStartsMap, position) {
    const lineIndex = findClosestLineStartPosition(lineStartsMap, position);
    return { character: position - lineStartsMap[lineIndex], line: lineIndex };
}
exports.getLineAndCharacterFromPosition = getLineAndCharacterFromPosition;
/**
 * Computes the line start map of the given text. This can be used in order to
 * retrieve the line and character of a given text position index.
 */
function computeLineStartsMap(text) {
    const result = [0];
    let pos = 0;
    while (pos < text.length) {
        const char = text.charCodeAt(pos++);
        // Handles the "CRLF" line break. In that case we peek the character
        // after the "CR" and check if it is a line feed.
        if (char === CR_CHAR) {
            if (text.charCodeAt(pos) === LF_CHAR) {
                pos++;
            }
            result.push(pos);
        }
        else if (char === LF_CHAR || char === LINE_SEP_CHAR || char === PARAGRAPH_CHAR) {
            result.push(pos);
        }
    }
    result.push(pos);
    return result;
}
exports.computeLineStartsMap = computeLineStartsMap;
/** Finds the closest line start for the given position. */
function findClosestLineStartPosition(linesMap, position, low = 0, high = linesMap.length - 1) {
    while (low <= high) {
        const pivotIndex = Math.floor((low + high) / 2);
        const pivotEl = linesMap[pivotIndex];
        if (pivotEl === position) {
            return pivotIndex;
        }
        else if (position > pivotEl) {
            low = pivotIndex + 1;
        }
        else {
            high = pivotIndex - 1;
        }
    }
    // In case there was no exact match, return the closest "lower" line index. We also
    // subtract the index by one because want the index of the previous line start.
    return low - 1;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS1tYXBwaW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy91cGRhdGUtdG9vbC91dGlscy9saW5lLW1hcHBpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVIOzs7Ozs7Ozs7O0dBVUc7QUFFSCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7QUFDbkIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQztBQUMzQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFPNUIsbUZBQW1GO0FBQ25GLFNBQWdCLCtCQUErQixDQUFDLGFBQXVCLEVBQUUsUUFBZ0I7SUFDdkYsTUFBTSxTQUFTLEdBQUcsNEJBQTRCLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hFLE9BQU8sRUFBQyxTQUFTLEVBQUUsUUFBUSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFDLENBQUM7QUFDM0UsQ0FBQztBQUhELDBFQUdDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQUMsSUFBWTtJQUMvQyxNQUFNLE1BQU0sR0FBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLG9FQUFvRTtRQUNwRSxpREFBaUQ7UUFDakQsSUFBSSxJQUFJLEtBQUssT0FBTyxFQUFFO1lBQ3BCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxPQUFPLEVBQUU7Z0JBQ3BDLEdBQUcsRUFBRSxDQUFDO2FBQ1A7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO2FBQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxJQUFJLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxLQUFLLGNBQWMsRUFBRTtZQUNoRixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO0tBQ0Y7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCLE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFsQkQsb0RBa0JDO0FBRUQsMkRBQTJEO0FBQzNELFNBQVMsNEJBQTRCLENBQ2pDLFFBQWEsRUFBRSxRQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO0lBQ2pFLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRTtRQUNsQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyQyxJQUFJLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDeEIsT0FBTyxVQUFVLENBQUM7U0FDbkI7YUFBTSxJQUFJLFFBQVEsR0FBRyxPQUFPLEVBQUU7WUFDN0IsR0FBRyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7U0FDdEI7YUFBTTtZQUNMLElBQUksR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1NBQ3ZCO0tBQ0Y7SUFFRCxtRkFBbUY7SUFDbkYsK0VBQStFO0lBQy9FLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNqQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG4vKlxyXG4gKiBMaW5lIG1hcHBpbmcgdXRpbGl0aWVzIHdoaWNoIGNhbiBiZSB1c2VkIHRvIHJldHJpZXZlIGxpbmUgYW5kIGNoYXJhY3RlciBiYXNlZFxyXG4gKiBvbiBhbiBhYnNvbHV0ZSBjaGFyYWN0ZXIgcG9zaXRpb24gaW4gYSBnaXZlbiBmaWxlLiBUaGlzIGZ1bmN0aW9uYWxpdHkgaXMgc2ltaWxhclxyXG4gKiB0byBUeXBlU2NyaXB0J3MgXCJ0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyRnJvbVBvc2l0aW9uXCIgdXRpbGl0eSwgYnV0IHdlIGNhbm5vdCBsZXZlcmFnZVxyXG4gKiB0aGVpciBsb2dpYyBmb3IgbGluZSBtYXBwaW5ncyBhcyBpdCdzIGludGVybmFsIGFuZCB3ZSBuZWVkIHRvIGdlbmVyYXRlIGxpbmUgbWFwcGluZ3NcclxuICogZm9yIG5vbi1UeXBlU2NyaXB0IGZpbGVzIHN1Y2ggYXMgSFRNTCB0ZW1wbGF0ZXMgb3Igc3R5bGVzaGVldHMuXHJcbiAqXHJcbiAqIExpbmUgYW5kIGNoYXJhY3RlciBjYW4gYmUgcmV0cmlldmVkIGJ5IHNwbGl0dGluZyBhIGdpdmVuIHNvdXJjZSB0ZXh0IGJhc2VkIG9uXHJcbiAqIGxpbmUgYnJlYWtzIGludG8gbGluZSBzdGFydCBlbnRyaWVzLiBMYXRlciB3aGVuIGEgc3BlY2lmaWMgcG9zaXRpb24gaXMgcmVxdWVzdGVkLFxyXG4gKiB0aGUgY2xvc2VzdCBsaW5lLXN0YXJ0IHBvc2l0aW9uIGlzIGRldGVybWluZWQgYmFzZWQgb24gdGhlIGdpdmVuIHBvc2l0aW9uLlxyXG4gKi9cclxuXHJcbmNvbnN0IExGX0NIQVIgPSAxMDtcclxuY29uc3QgQ1JfQ0hBUiA9IDEzO1xyXG5jb25zdCBMSU5FX1NFUF9DSEFSID0gODIzMjtcclxuY29uc3QgUEFSQUdSQVBIX0NIQVIgPSA4MjMzO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaW5lQW5kQ2hhcmFjdGVyIHtcclxuICBjaGFyYWN0ZXI6IG51bWJlcjtcclxuICBsaW5lOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKiBHZXRzIHRoZSBsaW5lIGFuZCBjaGFyYWN0ZXIgZm9yIHRoZSBnaXZlbiBwb3NpdGlvbiBmcm9tIHRoZSBsaW5lIHN0YXJ0cyBtYXAuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRMaW5lQW5kQ2hhcmFjdGVyRnJvbVBvc2l0aW9uKGxpbmVTdGFydHNNYXA6IG51bWJlcltdLCBwb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgY29uc3QgbGluZUluZGV4ID0gZmluZENsb3Nlc3RMaW5lU3RhcnRQb3NpdGlvbihsaW5lU3RhcnRzTWFwLCBwb3NpdGlvbik7XHJcbiAgcmV0dXJuIHtjaGFyYWN0ZXI6IHBvc2l0aW9uIC0gbGluZVN0YXJ0c01hcFtsaW5lSW5kZXhdLCBsaW5lOiBsaW5lSW5kZXh9O1xyXG59XHJcblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlIGxpbmUgc3RhcnQgbWFwIG9mIHRoZSBnaXZlbiB0ZXh0LiBUaGlzIGNhbiBiZSB1c2VkIGluIG9yZGVyIHRvXHJcbiAqIHJldHJpZXZlIHRoZSBsaW5lIGFuZCBjaGFyYWN0ZXIgb2YgYSBnaXZlbiB0ZXh0IHBvc2l0aW9uIGluZGV4LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVMaW5lU3RhcnRzTWFwKHRleHQ6IHN0cmluZyk6IG51bWJlcltdIHtcclxuICBjb25zdCByZXN1bHQ6IG51bWJlcltdID0gWzBdO1xyXG4gIGxldCBwb3MgPSAwO1xyXG4gIHdoaWxlIChwb3MgPCB0ZXh0Lmxlbmd0aCkge1xyXG4gICAgY29uc3QgY2hhciA9IHRleHQuY2hhckNvZGVBdChwb3MrKyk7XHJcbiAgICAvLyBIYW5kbGVzIHRoZSBcIkNSTEZcIiBsaW5lIGJyZWFrLiBJbiB0aGF0IGNhc2Ugd2UgcGVlayB0aGUgY2hhcmFjdGVyXHJcbiAgICAvLyBhZnRlciB0aGUgXCJDUlwiIGFuZCBjaGVjayBpZiBpdCBpcyBhIGxpbmUgZmVlZC5cclxuICAgIGlmIChjaGFyID09PSBDUl9DSEFSKSB7XHJcbiAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQocG9zKSA9PT0gTEZfQ0hBUikge1xyXG4gICAgICAgIHBvcysrO1xyXG4gICAgICB9XHJcbiAgICAgIHJlc3VsdC5wdXNoKHBvcyk7XHJcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IExGX0NIQVIgfHwgY2hhciA9PT0gTElORV9TRVBfQ0hBUiB8fCBjaGFyID09PSBQQVJBR1JBUEhfQ0hBUikge1xyXG4gICAgICByZXN1bHQucHVzaChwb3MpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXN1bHQucHVzaChwb3MpO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKiBGaW5kcyB0aGUgY2xvc2VzdCBsaW5lIHN0YXJ0IGZvciB0aGUgZ2l2ZW4gcG9zaXRpb24uICovXHJcbmZ1bmN0aW9uIGZpbmRDbG9zZXN0TGluZVN0YXJ0UG9zaXRpb248VD4oXHJcbiAgICBsaW5lc01hcDogVFtdLCBwb3NpdGlvbjogVCwgbG93ID0gMCwgaGlnaCA9IGxpbmVzTWFwLmxlbmd0aCAtIDEpIHtcclxuICB3aGlsZSAobG93IDw9IGhpZ2gpIHtcclxuICAgIGNvbnN0IHBpdm90SW5kZXggPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xyXG4gICAgY29uc3QgcGl2b3RFbCA9IGxpbmVzTWFwW3Bpdm90SW5kZXhdO1xyXG5cclxuICAgIGlmIChwaXZvdEVsID09PSBwb3NpdGlvbikge1xyXG4gICAgICByZXR1cm4gcGl2b3RJbmRleDtcclxuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiBwaXZvdEVsKSB7XHJcbiAgICAgIGxvdyA9IHBpdm90SW5kZXggKyAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaGlnaCA9IHBpdm90SW5kZXggLSAxO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSW4gY2FzZSB0aGVyZSB3YXMgbm8gZXhhY3QgbWF0Y2gsIHJldHVybiB0aGUgY2xvc2VzdCBcImxvd2VyXCIgbGluZSBpbmRleC4gV2UgYWxzb1xyXG4gIC8vIHN1YnRyYWN0IHRoZSBpbmRleCBieSBvbmUgYmVjYXVzZSB3YW50IHRoZSBpbmRleCBvZiB0aGUgcHJldmlvdXMgbGluZSBzdGFydC5cclxuICByZXR1cm4gbG93IC0gMTtcclxufVxyXG4iXX0=