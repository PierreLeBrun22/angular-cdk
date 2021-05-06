"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildElementIndentation = void 0;
const schematics_1 = require("@angular-devkit/schematics");
/** Determines the indentation of child elements for the given Parse5 element. */
function getChildElementIndentation(element) {
    const childElement = element.childNodes
        .find(node => node['tagName']);
    if ((childElement && !childElement.sourceCodeLocation) || !element.sourceCodeLocation) {
        throw new schematics_1.SchematicsException('Cannot determine child element indentation because the ' +
            'specified Parse5 element does not have any source code location metadata.');
    }
    const startColumns = childElement ?
        // In case there are child elements inside of the element, we assume that their
        // indentation is also applicable for other child elements.
        childElement.sourceCodeLocation.startCol :
        // In case there is no child element, we just assume that child elements should be indented
        // by two spaces.
        element.sourceCodeLocation.startCol + 2;
    // Since Parse5 does not set the `startCol` properties as zero-based, we need to subtract
    // one column in order to have a proper zero-based offset for the indentation.
    return startColumns - 1;
}
exports.getChildElementIndentation = getChildElementIndentation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2U1LWVsZW1lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXRpbHMvcGFyc2U1LWVsZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsMkRBQStEO0FBRy9ELGlGQUFpRjtBQUNqRixTQUFnQiwwQkFBMEIsQ0FBQyxPQUEyQjtJQUNwRSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsVUFBVTtTQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQThCLENBQUM7SUFFOUQsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFO1FBQ3JGLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyx5REFBeUQ7WUFDckYsMkVBQTJFLENBQUMsQ0FBQztLQUNoRjtJQUVELE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLCtFQUErRTtRQUMvRSwyREFBMkQ7UUFDM0QsWUFBWSxDQUFDLGtCQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLDJGQUEyRjtRQUMzRixpQkFBaUI7UUFDakIsT0FBTyxDQUFDLGtCQUFtQixDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFM0MseUZBQXlGO0lBQ3pGLDhFQUE4RTtJQUM5RSxPQUFPLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDMUIsQ0FBQztBQXBCRCxnRUFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2NoZW1hdGljc0V4Y2VwdGlvbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQge0RlZmF1bHRUcmVlRWxlbWVudH0gZnJvbSAncGFyc2U1JztcclxuXHJcbi8qKiBEZXRlcm1pbmVzIHRoZSBpbmRlbnRhdGlvbiBvZiBjaGlsZCBlbGVtZW50cyBmb3IgdGhlIGdpdmVuIFBhcnNlNSBlbGVtZW50LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hpbGRFbGVtZW50SW5kZW50YXRpb24oZWxlbWVudDogRGVmYXVsdFRyZWVFbGVtZW50KSB7XHJcbiAgY29uc3QgY2hpbGRFbGVtZW50ID0gZWxlbWVudC5jaGlsZE5vZGVzXHJcbiAgICAuZmluZChub2RlID0+IG5vZGVbJ3RhZ05hbWUnXSkgYXMgRGVmYXVsdFRyZWVFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgaWYgKChjaGlsZEVsZW1lbnQgJiYgIWNoaWxkRWxlbWVudC5zb3VyY2VDb2RlTG9jYXRpb24pIHx8ICFlbGVtZW50LnNvdXJjZUNvZGVMb2NhdGlvbikge1xyXG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0Nhbm5vdCBkZXRlcm1pbmUgY2hpbGQgZWxlbWVudCBpbmRlbnRhdGlvbiBiZWNhdXNlIHRoZSAnICtcclxuICAgICAgJ3NwZWNpZmllZCBQYXJzZTUgZWxlbWVudCBkb2VzIG5vdCBoYXZlIGFueSBzb3VyY2UgY29kZSBsb2NhdGlvbiBtZXRhZGF0YS4nKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHN0YXJ0Q29sdW1ucyA9IGNoaWxkRWxlbWVudCA/XHJcbiAgICAvLyBJbiBjYXNlIHRoZXJlIGFyZSBjaGlsZCBlbGVtZW50cyBpbnNpZGUgb2YgdGhlIGVsZW1lbnQsIHdlIGFzc3VtZSB0aGF0IHRoZWlyXHJcbiAgICAvLyBpbmRlbnRhdGlvbiBpcyBhbHNvIGFwcGxpY2FibGUgZm9yIG90aGVyIGNoaWxkIGVsZW1lbnRzLlxyXG4gICAgY2hpbGRFbGVtZW50LnNvdXJjZUNvZGVMb2NhdGlvbiEuc3RhcnRDb2wgOlxyXG4gICAgLy8gSW4gY2FzZSB0aGVyZSBpcyBubyBjaGlsZCBlbGVtZW50LCB3ZSBqdXN0IGFzc3VtZSB0aGF0IGNoaWxkIGVsZW1lbnRzIHNob3VsZCBiZSBpbmRlbnRlZFxyXG4gICAgLy8gYnkgdHdvIHNwYWNlcy5cclxuICAgIGVsZW1lbnQuc291cmNlQ29kZUxvY2F0aW9uIS5zdGFydENvbCArIDI7XHJcblxyXG4gIC8vIFNpbmNlIFBhcnNlNSBkb2VzIG5vdCBzZXQgdGhlIGBzdGFydENvbGAgcHJvcGVydGllcyBhcyB6ZXJvLWJhc2VkLCB3ZSBuZWVkIHRvIHN1YnRyYWN0XHJcbiAgLy8gb25lIGNvbHVtbiBpbiBvcmRlciB0byBoYXZlIGEgcHJvcGVyIHplcm8tYmFzZWQgb2Zmc2V0IGZvciB0aGUgaW5kZW50YXRpb24uXHJcbiAgcmV0dXJuIHN0YXJ0Q29sdW1ucyAtIDE7XHJcbn1cclxuIl19