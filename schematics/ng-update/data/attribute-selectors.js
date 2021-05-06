"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributeSelectors = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.attributeSelectors = {
    [target_version_1.TargetVersion.V6]: [{
            pr: 'https://github.com/angular/components/pull/10257',
            changes: [
                { replace: 'cdkPortalHost', replaceWith: 'cdkPortalOutlet' },
                { replace: 'portalHost', replaceWith: 'cdkPortalOutlet' }
            ]
        }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXR0cmlidXRlLXNlbGVjdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvZGF0YS9hdHRyaWJ1dGUtc2VsZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHFFQUErRDtBQVVsRCxRQUFBLGtCQUFrQixHQUFpRDtJQUM5RSxDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNuQixFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDO2dCQUMxRCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFDO2FBQ3hEO1NBQ0YsQ0FBQztDQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24nO1xyXG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVTZWxlY3RvclVwZ3JhZGVEYXRhIHtcclxuICAvKiogVGhlIGF0dHJpYnV0ZSBuYW1lIHRvIHJlcGxhY2UuICovXHJcbiAgcmVwbGFjZTogc3RyaW5nO1xyXG4gIC8qKiBUaGUgbmV3IG5hbWUgZm9yIHRoZSBhdHRyaWJ1dGUuICovXHJcbiAgcmVwbGFjZVdpdGg6IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGF0dHJpYnV0ZVNlbGVjdG9yczogVmVyc2lvbkNoYW5nZXM8QXR0cmlidXRlU2VsZWN0b3JVcGdyYWRlRGF0YT4gPSB7XHJcbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbe1xyXG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyNTcnLFxyXG4gICAgY2hhbmdlczogW1xyXG4gICAgICB7cmVwbGFjZTogJ2Nka1BvcnRhbEhvc3QnLCByZXBsYWNlV2l0aDogJ2Nka1BvcnRhbE91dGxldCd9LFxyXG4gICAgICB7cmVwbGFjZTogJ3BvcnRhbEhvc3QnLCByZXBsYWNlV2l0aDogJ2Nka1BvcnRhbE91dGxldCd9XHJcbiAgICBdXHJcbiAgfV1cclxufTtcclxuIl19