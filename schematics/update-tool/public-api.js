"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./component-resource-collector"), exports);
__exportStar(require("./file-system"), exports);
__exportStar(require("./index"), exports);
__exportStar(require("./migration"), exports);
__exportStar(require("./target-version"), exports);
__exportStar(require("./utils/decorators"), exports);
__exportStar(require("./utils/imports"), exports);
__exportStar(require("./version-changes"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy91cGRhdGUtdG9vbC9wdWJsaWMtYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztBQUVILGlFQUErQztBQUMvQyxnREFBOEI7QUFDOUIsMENBQXdCO0FBQ3hCLDhDQUE0QjtBQUM1QixtREFBaUM7QUFDakMscURBQW1DO0FBQ25DLGtEQUFnQztBQUNoQyxvREFBa0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvcic7XHJcbmV4cG9ydCAqIGZyb20gJy4vZmlsZS1zeXN0ZW0nO1xyXG5leHBvcnQgKiBmcm9tICcuL2luZGV4JztcclxuZXhwb3J0ICogZnJvbSAnLi9taWdyYXRpb24nO1xyXG5leHBvcnQgKiBmcm9tICcuL3RhcmdldC12ZXJzaW9uJztcclxuZXhwb3J0ICogZnJvbSAnLi91dGlscy9kZWNvcmF0b3JzJztcclxuZXhwb3J0ICogZnJvbSAnLi91dGlscy9pbXBvcnRzJztcclxuZXhwb3J0ICogZnJvbSAnLi92ZXJzaW9uLWNoYW5nZXMnO1xyXG4iXX0=