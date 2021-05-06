/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { PendingCopy } from './pending-copy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
/**
 * A service for copying text to the clipboard.
 */
export class Clipboard {
    constructor(document) {
        this._document = document;
    }
    /**
     * Copies the provided text into the user's clipboard.
     *
     * @param text The string to copy.
     * @returns Whether the operation was successful.
     */
    copy(text) {
        const pendingCopy = this.beginCopy(text);
        const successful = pendingCopy.copy();
        pendingCopy.destroy();
        return successful;
    }
    /**
     * Prepares a string to be copied later. This is useful for large strings
     * which take too long to successfully render and be copied in the same tick.
     *
     * The caller must call `destroy` on the returned `PendingCopy`.
     *
     * @param text The string to copy.
     * @returns the pending copy operation.
     */
    beginCopy(text) {
        return new PendingCopy(text, this._document);
    }
}
Clipboard.ɵprov = i0.ɵɵdefineInjectable({ factory: function Clipboard_Factory() { return new Clipboard(i0.ɵɵinject(i1.DOCUMENT)); }, token: Clipboard, providedIn: "root" });
Clipboard.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
Clipboard.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpcGJvYXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jbGlwYm9hcmQvY2xpcGJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNqRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7OztBQUczQzs7R0FFRztBQUVILE1BQU0sT0FBTyxTQUFTO0lBR3BCLFlBQThCLFFBQWE7UUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsSUFBSSxDQUFDLElBQVk7UUFDZixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFdEIsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsU0FBUyxDQUFDLElBQVk7UUFDcEIsT0FBTyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Ozs7WUFqQ0YsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQUlqQixNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1BlbmRpbmdDb3B5fSBmcm9tICcuL3BlbmRpbmctY29weSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIEEgc2VydmljZSBmb3IgY29weWluZyB0ZXh0IHRvIHRoZSBjbGlwYm9hcmQuXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIENsaXBib2FyZCB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICBjb25zdHJ1Y3RvcihASW5qZWN0KERPQ1VNRU5UKSBkb2N1bWVudDogYW55KSB7XHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29waWVzIHRoZSBwcm92aWRlZCB0ZXh0IGludG8gdGhlIHVzZXIncyBjbGlwYm9hcmQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdGV4dCBUaGUgc3RyaW5nIHRvIGNvcHkuXHJcbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgb3BlcmF0aW9uIHdhcyBzdWNjZXNzZnVsLlxyXG4gICAqL1xyXG4gIGNvcHkodGV4dDogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBwZW5kaW5nQ29weSA9IHRoaXMuYmVnaW5Db3B5KHRleHQpO1xyXG4gICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IHBlbmRpbmdDb3B5LmNvcHkoKTtcclxuICAgIHBlbmRpbmdDb3B5LmRlc3Ryb3koKTtcclxuXHJcbiAgICByZXR1cm4gc3VjY2Vzc2Z1bDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZXBhcmVzIGEgc3RyaW5nIHRvIGJlIGNvcGllZCBsYXRlci4gVGhpcyBpcyB1c2VmdWwgZm9yIGxhcmdlIHN0cmluZ3NcclxuICAgKiB3aGljaCB0YWtlIHRvbyBsb25nIHRvIHN1Y2Nlc3NmdWxseSByZW5kZXIgYW5kIGJlIGNvcGllZCBpbiB0aGUgc2FtZSB0aWNrLlxyXG4gICAqXHJcbiAgICogVGhlIGNhbGxlciBtdXN0IGNhbGwgYGRlc3Ryb3lgIG9uIHRoZSByZXR1cm5lZCBgUGVuZGluZ0NvcHlgLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHRleHQgVGhlIHN0cmluZyB0byBjb3B5LlxyXG4gICAqIEByZXR1cm5zIHRoZSBwZW5kaW5nIGNvcHkgb3BlcmF0aW9uLlxyXG4gICAqL1xyXG4gIGJlZ2luQ29weSh0ZXh0OiBzdHJpbmcpOiBQZW5kaW5nQ29weSB7XHJcbiAgICByZXR1cm4gbmV3IFBlbmRpbmdDb3B5KHRleHQsIHRoaXMuX2RvY3VtZW50KTtcclxuICB9XHJcbn1cclxuIl19