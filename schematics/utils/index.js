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
__exportStar(require("./ast"), exports);
__exportStar(require("./ast/ng-module-imports"), exports);
__exportStar(require("./build-component"), exports);
__exportStar(require("./get-project"), exports);
__exportStar(require("./html-manipulation"), exports);
__exportStar(require("./parse5-element"), exports);
__exportStar(require("./project-index-file"), exports);
__exportStar(require("./project-main-file"), exports);
__exportStar(require("./project-style-file"), exports);
__exportStar(require("./project-targets"), exports);
__exportStar(require("./schematic-options"), exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXRpbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0FBRUgsd0NBQXNCO0FBQ3RCLDBEQUF3QztBQUN4QyxvREFBa0M7QUFDbEMsZ0RBQThCO0FBQzlCLHNEQUFvQztBQUNwQyxtREFBaUM7QUFDakMsdURBQXFDO0FBQ3JDLHNEQUFvQztBQUNwQyx1REFBcUM7QUFDckMsb0RBQWtDO0FBQ2xDLHNEQUFvQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuZXhwb3J0ICogZnJvbSAnLi9hc3QnO1xyXG5leHBvcnQgKiBmcm9tICcuL2FzdC9uZy1tb2R1bGUtaW1wb3J0cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vYnVpbGQtY29tcG9uZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9nZXQtcHJvamVjdCc7XHJcbmV4cG9ydCAqIGZyb20gJy4vaHRtbC1tYW5pcHVsYXRpb24nO1xyXG5leHBvcnQgKiBmcm9tICcuL3BhcnNlNS1lbGVtZW50JztcclxuZXhwb3J0ICogZnJvbSAnLi9wcm9qZWN0LWluZGV4LWZpbGUnO1xyXG5leHBvcnQgKiBmcm9tICcuL3Byb2plY3QtbWFpbi1maWxlJztcclxuZXhwb3J0ICogZnJvbSAnLi9wcm9qZWN0LXN0eWxlLWZpbGUnO1xyXG5leHBvcnQgKiBmcm9tICcuL3Byb2plY3QtdGFyZ2V0cyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vc2NoZW1hdGljLW9wdGlvbnMnO1xyXG4iXX0=