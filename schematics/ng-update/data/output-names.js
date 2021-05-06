"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputNames = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.outputNames = {
    [target_version_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19362',
            changes: [{
                    replace: 'copied',
                    replaceWith: 'cdkCopyToClipboardCopied',
                    limitedTo: {
                        attributes: ['cdkCopyToClipboard']
                    }
                }]
        }
    ],
    [target_version_1.TargetVersion.V6]: [],
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LW5hbWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL291dHB1dC1uYW1lcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFpQmxELFFBQUEsV0FBVyxHQUEwQztJQUNoRSxDQUFDLDhCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSxRQUFRO29CQUNqQixXQUFXLEVBQUUsMEJBQTBCO29CQUN2QyxTQUFTLEVBQUU7d0JBQ1QsVUFBVSxFQUFFLENBQUMsb0JBQW9CLENBQUM7cUJBQ25DO2lCQUNGLENBQUM7U0FDSDtLQUNGO0lBQ0QsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Q0FDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUYXJnZXRWZXJzaW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC90YXJnZXQtdmVyc2lvbic7XHJcbmltcG9ydCB7VmVyc2lvbkNoYW5nZXN9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE91dHB1dE5hbWVVcGdyYWRlRGF0YSB7XHJcbiAgLyoqIFRoZSBAT3V0cHV0KCkgbmFtZSB0byByZXBsYWNlLiAqL1xyXG4gIHJlcGxhY2U6IHN0cmluZztcclxuICAvKiogVGhlIG5ldyBuYW1lIGZvciB0aGUgQE91dHB1dCgpLiAqL1xyXG4gIHJlcGxhY2VXaXRoOiBzdHJpbmc7XHJcbiAgLyoqIENvbnRyb2xzIHdoaWNoIGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzIGluIHdoaWNoIHRoaXMgcmVwbGFjZW1lbnQgaXMgbWFkZS4gKi9cclxuICBsaW1pdGVkVG86IHtcclxuICAgIC8qKiBMaW1pdCB0byBlbGVtZW50cyB3aXRoIGFueSBvZiB0aGVzZSBlbGVtZW50IHRhZ3MuICovXHJcbiAgICBlbGVtZW50cz86IHN0cmluZ1tdLFxyXG4gICAgLyoqIExpbWl0IHRvIGVsZW1lbnRzIHdpdGggYW55IG9mIHRoZXNlIGF0dHJpYnV0ZXMuICovXHJcbiAgICBhdHRyaWJ1dGVzPzogc3RyaW5nW10sXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IG91dHB1dE5hbWVzOiBWZXJzaW9uQ2hhbmdlczxPdXRwdXROYW1lVXBncmFkZURhdGE+ID0ge1xyXG4gIFtUYXJnZXRWZXJzaW9uLlYxMF06IFtcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTkzNjInLFxyXG4gICAgICBjaGFuZ2VzOiBbe1xyXG4gICAgICAgIHJlcGxhY2U6ICdjb3BpZWQnLFxyXG4gICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29weVRvQ2xpcGJvYXJkQ29waWVkJyxcclxuICAgICAgICBsaW1pdGVkVG86IHtcclxuICAgICAgICAgIGF0dHJpYnV0ZXM6IFsnY2RrQ29weVRvQ2xpcGJvYXJkJ11cclxuICAgICAgICB9XHJcbiAgICAgIH1dXHJcbiAgICB9XHJcbiAgXSxcclxuICBbVGFyZ2V0VmVyc2lvbi5WNl06IFtdLFxyXG59O1xyXG4iXX0=