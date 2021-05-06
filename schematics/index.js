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
exports.parse5 = void 0;
__exportStar(require("./utils"), exports);
__exportStar(require("./ng-update/public-api"), exports);
__exportStar(require("./update-tool/public-api"), exports);
// Re-exported so that Angular Material schematic code can consume the
// vendored "@schematics/angular" AST utils.
__exportStar(require("./utils/vendored-ast-utils"), exports);
// Re-export parse5 from the CDK. Material schematics code cannot simply import
// "parse5" because it could result in a different version. As long as we import
// it from within the CDK, it will always be the correct version that is specified
// in the CDK "package.json" as optional dependency.
const parse5 = require("parse5");
exports.parse5 = parse5;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztBQUVILDBDQUF3QjtBQUN4Qix5REFBdUM7QUFDdkMsMkRBQXlDO0FBRXpDLHNFQUFzRTtBQUN0RSw0Q0FBNEM7QUFDNUMsNkRBQTJDO0FBRTNDLCtFQUErRTtBQUMvRSxnRkFBZ0Y7QUFDaEYsa0ZBQWtGO0FBQ2xGLG9EQUFvRDtBQUNwRCxpQ0FBaUM7QUFDekIsd0JBQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMnO1xyXG5leHBvcnQgKiBmcm9tICcuL25nLXVwZGF0ZS9wdWJsaWMtYXBpJztcclxuZXhwb3J0ICogZnJvbSAnLi91cGRhdGUtdG9vbC9wdWJsaWMtYXBpJztcclxuXHJcbi8vIFJlLWV4cG9ydGVkIHNvIHRoYXQgQW5ndWxhciBNYXRlcmlhbCBzY2hlbWF0aWMgY29kZSBjYW4gY29uc3VtZSB0aGVcclxuLy8gdmVuZG9yZWQgXCJAc2NoZW1hdGljcy9hbmd1bGFyXCIgQVNUIHV0aWxzLlxyXG5leHBvcnQgKiBmcm9tICcuL3V0aWxzL3ZlbmRvcmVkLWFzdC11dGlscyc7XHJcblxyXG4vLyBSZS1leHBvcnQgcGFyc2U1IGZyb20gdGhlIENESy4gTWF0ZXJpYWwgc2NoZW1hdGljcyBjb2RlIGNhbm5vdCBzaW1wbHkgaW1wb3J0XHJcbi8vIFwicGFyc2U1XCIgYmVjYXVzZSBpdCBjb3VsZCByZXN1bHQgaW4gYSBkaWZmZXJlbnQgdmVyc2lvbi4gQXMgbG9uZyBhcyB3ZSBpbXBvcnRcclxuLy8gaXQgZnJvbSB3aXRoaW4gdGhlIENESywgaXQgd2lsbCBhbHdheXMgYmUgdGhlIGNvcnJlY3QgdmVyc2lvbiB0aGF0IGlzIHNwZWNpZmllZFxyXG4vLyBpbiB0aGUgQ0RLIFwicGFja2FnZS5qc29uXCIgYXMgb3B0aW9uYWwgZGVwZW5kZW5jeS5cclxuaW1wb3J0ICogYXMgcGFyc2U1IGZyb20gJ3BhcnNlNSc7XHJcbmV4cG9ydCB7cGFyc2U1fTtcclxuIl19