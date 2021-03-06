"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectFromWorkspace = void 0;
const schematics_1 = require("@angular-devkit/schematics");
/**
 * Finds the specified project configuration in the workspace. Throws an error if the project
 * couldn't be found.
 */
function getProjectFromWorkspace(workspace, projectName = workspace.extensions.defaultProject) {
    const project = workspace.projects.get(projectName);
    if (!project) {
        throw new schematics_1.SchematicsException(`Could not find project in workspace: ${projectName}`);
    }
    return project;
}
exports.getProjectFromWorkspace = getProjectFromWorkspace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LXByb2plY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXRpbHMvZ2V0LXByb2plY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsMkRBQStEO0FBRS9EOzs7R0FHRztBQUNILFNBQWdCLHVCQUF1QixDQUNuQyxTQUE4QixFQUM5QixjQUFjLFNBQVMsQ0FBQyxVQUFVLENBQUMsY0FBd0I7SUFDN0QsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFcEQsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNaLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyx3Q0FBd0MsV0FBVyxFQUFFLENBQUMsQ0FBQztLQUN0RjtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFWRCwwREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtQcm9qZWN0RGVmaW5pdGlvbiwgV29ya3NwYWNlRGVmaW5pdGlvbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvc3JjL3dvcmtzcGFjZSc7XHJcbmltcG9ydCB7U2NoZW1hdGljc0V4Y2VwdGlvbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5cclxuLyoqXHJcbiAqIEZpbmRzIHRoZSBzcGVjaWZpZWQgcHJvamVjdCBjb25maWd1cmF0aW9uIGluIHRoZSB3b3Jrc3BhY2UuIFRocm93cyBhbiBlcnJvciBpZiB0aGUgcHJvamVjdFxyXG4gKiBjb3VsZG4ndCBiZSBmb3VuZC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9qZWN0RnJvbVdvcmtzcGFjZShcclxuICAgIHdvcmtzcGFjZTogV29ya3NwYWNlRGVmaW5pdGlvbixcclxuICAgIHByb2plY3ROYW1lID0gd29ya3NwYWNlLmV4dGVuc2lvbnMuZGVmYXVsdFByb2plY3QgYXMgc3RyaW5nKTogUHJvamVjdERlZmluaXRpb24ge1xyXG4gIGNvbnN0IHByb2plY3QgPSB3b3Jrc3BhY2UucHJvamVjdHMuZ2V0KHByb2plY3ROYW1lKTtcclxuXHJcbiAgaWYgKCFwcm9qZWN0KSB7XHJcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ291bGQgbm90IGZpbmQgcHJvamVjdCBpbiB3b3Jrc3BhY2U6ICR7cHJvamVjdE5hbWV9YCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcHJvamVjdDtcclxufVxyXG4iXX0=