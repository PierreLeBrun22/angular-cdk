"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBodyClass = exports.getHtmlHeadTagElement = exports.appendHtmlElementToHead = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const parse5_element_1 = require("./parse5-element");
const parse5_1 = require("parse5");
/** Appends the given element HTML fragment to the `<head>` element of the specified HTML file. */
function appendHtmlElementToHead(host, htmlFilePath, elementHtml) {
    const htmlFileBuffer = host.read(htmlFilePath);
    if (!htmlFileBuffer) {
        throw new schematics_1.SchematicsException(`Could not read file for path: ${htmlFilePath}`);
    }
    const htmlContent = htmlFileBuffer.toString();
    if (htmlContent.includes(elementHtml)) {
        return;
    }
    const headTag = getHtmlHeadTagElement(htmlContent);
    if (!headTag) {
        throw Error(`Could not find '<head>' element in HTML file: ${htmlFileBuffer}`);
    }
    // We always have access to the source code location here because the `getHeadTagElement`
    // function explicitly has the `sourceCodeLocationInfo` option enabled.
    const endTagOffset = headTag.sourceCodeLocation.endTag.startOffset;
    const indentationOffset = parse5_element_1.getChildElementIndentation(headTag);
    const insertion = `${' '.repeat(indentationOffset)}${elementHtml}`;
    const recordedChange = host
        .beginUpdate(htmlFilePath)
        .insertRight(endTagOffset, `${insertion}\n`);
    host.commitUpdate(recordedChange);
}
exports.appendHtmlElementToHead = appendHtmlElementToHead;
/** Parses the given HTML file and returns the head element if available. */
function getHtmlHeadTagElement(htmlContent) {
    return getElementByTagName('head', htmlContent);
}
exports.getHtmlHeadTagElement = getHtmlHeadTagElement;
/** Adds a class to the body of the document. */
function addBodyClass(host, htmlFilePath, className) {
    const htmlFileBuffer = host.read(htmlFilePath);
    if (!htmlFileBuffer) {
        throw new schematics_1.SchematicsException(`Could not read file for path: ${htmlFilePath}`);
    }
    const htmlContent = htmlFileBuffer.toString();
    const body = getElementByTagName('body', htmlContent);
    if (!body) {
        throw Error(`Could not find <body> element in HTML file: ${htmlFileBuffer}`);
    }
    const classAttribute = body.attrs.find(attribute => attribute.name === 'class');
    if (classAttribute) {
        const hasClass = classAttribute.value.split(' ').map(part => part.trim()).includes(className);
        if (!hasClass) {
            const classAttributeLocation = body.sourceCodeLocation.attrs.class;
            const recordedChange = host
                .beginUpdate(htmlFilePath)
                .insertRight(classAttributeLocation.endOffset - 1, ` ${className}`);
            host.commitUpdate(recordedChange);
        }
    }
    else {
        const recordedChange = host
            .beginUpdate(htmlFilePath)
            .insertRight(body.sourceCodeLocation.startTag.endOffset - 1, ` class="${className}"`);
        host.commitUpdate(recordedChange);
    }
}
exports.addBodyClass = addBodyClass;
/** Finds an element by its tag name. */
function getElementByTagName(tagName, htmlContent) {
    const document = parse5_1.parse(htmlContent, { sourceCodeLocationInfo: true });
    const nodeQueue = [...document.childNodes];
    while (nodeQueue.length) {
        const node = nodeQueue.shift();
        if (node.nodeName.toLowerCase() === tagName) {
            return node;
        }
        else if (node.childNodes) {
            nodeQueue.push(...node.childNodes);
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC1tYW5pcHVsYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXRpbHMvaHRtbC1tYW5pcHVsYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsMkRBQXFFO0FBQ3JFLHFEQUE0RDtBQUM1RCxtQ0FBbUY7QUFFbkYsa0dBQWtHO0FBQ2xHLFNBQWdCLHVCQUF1QixDQUFDLElBQVUsRUFBRSxZQUFvQixFQUFFLFdBQW1CO0lBQzNGLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFL0MsSUFBSSxDQUFDLGNBQWMsRUFBRTtRQUNuQixNQUFNLElBQUksZ0NBQW1CLENBQUMsaUNBQWlDLFlBQVksRUFBRSxDQUFDLENBQUM7S0FDaEY7SUFFRCxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFOUMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1FBQ3JDLE9BQU87S0FDUjtJQUVELE1BQU0sT0FBTyxHQUFHLHFCQUFxQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBRW5ELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixNQUFNLEtBQUssQ0FBQyxpREFBaUQsY0FBYyxFQUFFLENBQUMsQ0FBQztLQUNoRjtJQUVELHlGQUF5RjtJQUN6Rix1RUFBdUU7SUFDdkUsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLGtCQUFtQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDcEUsTUFBTSxpQkFBaUIsR0FBRywyQ0FBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM5RCxNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxXQUFXLEVBQUUsQ0FBQztJQUVuRSxNQUFNLGNBQWMsR0FBRyxJQUFJ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QUksQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNwQztLQUNGO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1NjaGVtYXRpY3NFeGNlcHRpb24sIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcclxuaW1wb3J0IHtnZXRDaGlsZEVsZW1lbnRJbmRlbnRhdGlvbn0gZnJvbSAnLi9wYXJzZTUtZWxlbWVudCc7XHJcbmltcG9ydCB7RGVmYXVsdFRyZWVEb2N1bWVudCwgRGVmYXVsdFRyZWVFbGVtZW50LCBwYXJzZSBhcyBwYXJzZUh0bWx9IGZyb20gJ3BhcnNlNSc7XHJcblxyXG4vKiogQXBwZW5kcyB0aGUgZ2l2ZW4gZWxlbWVudCBIVE1MIGZyYWdtZW50IHRvIHRoZSBgPGhlYWQ+YCBlbGVtZW50IG9mIHRoZSBzcGVjaWZpZWQgSFRNTCBmaWxlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYXBwZW5kSHRtbEVsZW1lbnRUb0hlYWQoaG9zdDogVHJlZSwgaHRtbEZpbGVQYXRoOiBzdHJpbmcsIGVsZW1lbnRIdG1sOiBzdHJpbmcpIHtcclxuICBjb25zdCBodG1sRmlsZUJ1ZmZlciA9IGhvc3QucmVhZChodG1sRmlsZVBhdGgpO1xyXG5cclxuICBpZiAoIWh0bWxGaWxlQnVmZmVyKSB7XHJcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ291bGQgbm90IHJlYWQgZmlsZSBmb3IgcGF0aDogJHtodG1sRmlsZVBhdGh9YCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBodG1sQ29udGVudCA9IGh0bWxGaWxlQnVmZmVyLnRvU3RyaW5nKCk7XHJcblxyXG4gIGlmIChodG1sQ29udGVudC5pbmNsdWRlcyhlbGVtZW50SHRtbCkpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIGNvbnN0IGhlYWRUYWcgPSBnZXRIdG1sSGVhZFRhZ0VsZW1lbnQoaHRtbENvbnRlbnQpO1xyXG5cclxuICBpZiAoIWhlYWRUYWcpIHtcclxuICAgIHRocm93IEVycm9yKGBDb3VsZCBub3QgZmluZCAnPGhlYWQ+JyBlbGVtZW50IGluIEhUTUwgZmlsZTogJHtodG1sRmlsZUJ1ZmZlcn1gKTtcclxuICB9XHJcblxyXG4gIC8vIFdlIGFsd2F5cyBoYXZlIGFjY2VzcyB0byB0aGUgc291cmNlIGNvZGUgbG9jYXRpb24gaGVyZSBiZWNhdXNlIHRoZSBgZ2V0SGVhZFRhZ0VsZW1lbnRgXHJcbiAgLy8gZnVuY3Rpb24gZXhwbGljaXRseSBoYXMgdGhlIGBzb3VyY2VDb2RlTG9jYXRpb25JbmZvYCBvcHRpb24gZW5hYmxlZC5cclxuICBjb25zdCBlbmRUYWdPZmZzZXQgPSBoZWFkVGFnLnNvdXJjZUNvZGVMb2NhdGlvbiEuZW5kVGFnLnN0YXJ0T2Zmc2V0O1xyXG4gIGNvbnN0IGluZGVudGF0aW9uT2Zmc2V0ID0gZ2V0Q2hpbGRFbGVtZW50SW5kZW50YXRpb24oaGVhZFRhZyk7XHJcbiAgY29uc3QgaW5zZXJ0aW9uID0gYCR7JyAnLnJlcGVhdChpbmRlbnRhdGlvbk9mZnNldCl9JHtlbGVtZW50SHRtbH1gO1xyXG5cclxuICBjb25zdCByZWNvcmRlZENoYW5nZSA9IGhvc3RcclxuICAgIC5iZWdpblVwZGF0ZShodG1sRmlsZVBhdGgpXHJcbiAgICAuaW5zZXJ0UmlnaHQoZW5kVGFnT2Zmc2V0LCBgJHtpbnNlcnRpb259XFxuYCk7XHJcblxyXG4gIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVkQ2hhbmdlKTtcclxufVxyXG5cclxuLyoqIFBhcnNlcyB0aGUgZ2l2ZW4gSFRNTCBmaWxlIGFuZCByZXR1cm5zIHRoZSBoZWFkIGVsZW1lbnQgaWYgYXZhaWxhYmxlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHRtbEhlYWRUYWdFbGVtZW50KGh0bWxDb250ZW50OiBzdHJpbmcpOiBEZWZhdWx0VHJlZUVsZW1lbnQgfCBudWxsIHtcclxuICByZXR1cm4gZ2V0RWxlbWVudEJ5VGFnTmFtZSgnaGVhZCcsIGh0bWxDb250ZW50KTtcclxufVxyXG5cclxuLyoqIEFkZHMgYSBjbGFzcyB0byB0aGUgYm9keSBvZiB0aGUgZG9jdW1lbnQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRCb2R5Q2xhc3MoaG9zdDogVHJlZSwgaHRtbEZpbGVQYXRoOiBzdHJpbmcsIGNsYXNzTmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgY29uc3QgaHRtbEZpbGVCdWZmZXIgPSBob3N0LnJlYWQoaHRtbEZpbGVQYXRoKTtcclxuXHJcbiAgaWYgKCFodG1sRmlsZUJ1ZmZlcikge1xyXG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENvdWxkIG5vdCByZWFkIGZpbGUgZm9yIHBhdGg6ICR7aHRtbEZpbGVQYXRofWApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgaHRtbENvbnRlbnQgPSBodG1sRmlsZUJ1ZmZlci50b1N0cmluZygpO1xyXG4gIGNvbnN0IGJvZHkgPSBnZXRFbGVtZW50QnlUYWdOYW1lKCdib2R5JywgaHRtbENvbnRlbnQpO1xyXG5cclxuICBpZiAoIWJvZHkpIHtcclxuICAgIHRocm93IEVycm9yKGBDb3VsZCBub3QgZmluZCA8Ym9keT4gZWxlbWVudCBpbiBIVE1MIGZpbGU6ICR7aHRtbEZpbGVCdWZmZXJ9YCk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBjbGFzc0F0dHJpYnV0ZSA9IGJvZHkuYXR0cnMuZmluZChhdHRyaWJ1dGUgPT4gYXR0cmlidXRlLm5hbWUgPT09ICdjbGFzcycpO1xyXG5cclxuICBpZiAoY2xhc3NBdHRyaWJ1dGUpIHtcclxuICAgIGNvbnN0IGhhc0NsYXNzID0gY2xhc3NBdHRyaWJ1dGUudmFsdWUuc3BsaXQoJyAnKS5tYXAocGFydCA9PiBwYXJ0LnRyaW0oKSkuaW5jbHVkZXMoY2xhc3NOYW1lKTtcclxuXHJcbiAgICBpZiAoIWhhc0NsYXNzKSB7XHJcbiAgICAgIGNvbnN0IGNsYXNzQXR0cmlidXRlTG9jYXRpb24gPSBib2R5LnNvdXJjZUNvZGVMb2NhdGlvbiEuYXR0cnMuY2xhc3M7XHJcbiAgICAgIGNvbnN0IHJlY29yZGVkQ2hhbmdlID0gaG9zdFxyXG4gICAgICAgIC5iZWdpblVwZGF0ZShodG1sRmlsZVBhdGgpXHJcbiAgICAgICAgLmluc2VydFJpZ2h0KGNsYXNzQXR0cmlidXRlTG9jYXRpb24uZW5kT2Zmc2V0IC0gMSwgYCAke2NsYXNzTmFtZX1gKTtcclxuICAgICAgaG9zdC5jb21taXRVcGRhdGUocmVjb3JkZWRDaGFuZ2UpO1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBjb25zdCByZWNvcmRlZENoYW5nZSA9IGhvc3RcclxuICAgICAgLmJlZ2luVXBkYXRlKGh0bWxGaWxlUGF0aClcclxuICAgICAgLmluc2VydFJpZ2h0KGJvZHkuc291cmNlQ29kZUxvY2F0aW9uIS5zdGFydFRhZy5lbmRPZmZzZXQgLSAxLCBgIGNsYXNzPVwiJHtjbGFzc05hbWV9XCJgKTtcclxuICAgIGhvc3QuY29tbWl0VXBkYXRlKHJlY29yZGVkQ2hhbmdlKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBGaW5kcyBhbiBlbGVtZW50IGJ5IGl0cyB0YWcgbmFtZS4gKi9cclxuZnVuY3Rpb24gZ2V0RWxlbWVudEJ5VGFnTmFtZSh0YWdOYW1lOiBzdHJpbmcsIGh0bWxDb250ZW50OiBzdHJpbmcpOlxyXG4gIERlZmF1bHRUcmVlRWxlbWVudCB8IG51bGwge1xyXG4gIGNvbnN0IGRvY3VtZW50ID0gcGFyc2VIdG1sKGh0bWxDb250ZW50LCB7c291cmNlQ29kZUxvY2F0aW9uSW5mbzogdHJ1ZX0pIGFzIERlZmF1bHRUcmVlRG9jdW1lbnQ7XHJcbiAgY29uc3Qgbm9kZVF1ZXVlID0gWy4uLmRvY3VtZW50LmNoaWxkTm9kZXNdO1xyXG5cclxuICB3aGlsZSAobm9kZVF1ZXVlLmxlbmd0aCkge1xyXG4gICAgY29uc3Qgbm9kZSA9IG5vZGVRdWV1ZS5zaGlmdCgpIGFzIERlZmF1bHRUcmVlRWxlbWVudDtcclxuXHJcbiAgICBpZiAobm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSB0YWdOYW1lKSB7XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfSBlbHNlIGlmIChub2RlLmNoaWxkTm9kZXMpIHtcclxuICAgICAgbm9kZVF1ZXVlLnB1c2goLi4ubm9kZS5jaGlsZE5vZGVzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcbiJdfQ==