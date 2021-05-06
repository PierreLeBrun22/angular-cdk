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
__exportStar(require("./data/index"), exports);
__exportStar(require("./devkit-migration"), exports);
__exportStar(require("./devkit-migration-rule"), exports);
__exportStar(require("./html-parsing/angular"), exports);
__exportStar(require("./html-parsing/elements"), exports);
__exportStar(require("./typescript/base-types"), exports);
__exportStar(require("./typescript/imports"), exports);
__exportStar(require("./typescript/literal"), exports);
__exportStar(require("./typescript/module-specifiers"), exports);
__exportStar(require("./upgrade-data"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvcHVibGljLWFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBNkI7QUFDN0IscURBQW1DO0FBQ25DLDBEQUF3QztBQUN4Qyx5REFBdUM7QUFDdkMsMERBQXdDO0FBQ3hDLDBEQUF3QztBQUN4Qyx1REFBcUM7QUFDckMsdURBQXFDO0FBQ3JDLGlFQUErQztBQUMvQyxpREFBK0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vZGF0YS9pbmRleCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZGV2a2l0LW1pZ3JhdGlvbic7XHJcbmV4cG9ydCAqIGZyb20gJy4vZGV2a2l0LW1pZ3JhdGlvbi1ydWxlJztcclxuZXhwb3J0ICogZnJvbSAnLi9odG1sLXBhcnNpbmcvYW5ndWxhcic7XHJcbmV4cG9ydCAqIGZyb20gJy4vaHRtbC1wYXJzaW5nL2VsZW1lbnRzJztcclxuZXhwb3J0ICogZnJvbSAnLi90eXBlc2NyaXB0L2Jhc2UtdHlwZXMnO1xyXG5leHBvcnQgKiBmcm9tICcuL3R5cGVzY3JpcHQvaW1wb3J0cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vdHlwZXNjcmlwdC9saXRlcmFsJztcclxuZXhwb3J0ICogZnJvbSAnLi90eXBlc2NyaXB0L21vZHVsZS1zcGVjaWZpZXJzJztcclxuZXhwb3J0ICogZnJvbSAnLi91cGdyYWRlLWRhdGEnO1xyXG4iXX0=