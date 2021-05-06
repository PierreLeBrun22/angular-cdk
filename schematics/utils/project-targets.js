"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetsByBuilderName = exports.getProjectTargetOptions = exports.defaultTargetBuilders = void 0;
const schematics_1 = require("@angular-devkit/schematics");
/** Object that maps a CLI target to its default builder name. */
exports.defaultTargetBuilders = {
    build: '@angular-devkit/build-angular:browser',
    test: '@angular-devkit/build-angular:karma',
};
/** Resolves the architect options for the build target of the given project. */
function getProjectTargetOptions(project, buildTarget) {
    var _a, _b;
    const options = (_b = (_a = project.targets) === null || _a === void 0 ? void 0 : _a.get(buildTarget)) === null || _b === void 0 ? void 0 : _b.options;
    if (!options) {
        throw new schematics_1.SchematicsException(`Cannot determine project target configuration for: ${buildTarget}.`);
    }
    return options;
}
exports.getProjectTargetOptions = getProjectTargetOptions;
/** Gets all targets from the given project that match the specified builder name. */
function getTargetsByBuilderName(project, builderName) {
    return Array.from(project.targets.keys())
        .filter(name => { var _a; return ((_a = project.targets.get(name)) === null || _a === void 0 ? void 0 : _a.builder) === builderName; })
        .map(name => project.targets.get(name));
}
exports.getTargetsByBuilderName = getTargetsByBuilderName;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC10YXJnZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL3Byb2plY3QtdGFyZ2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFJSCwyREFBK0Q7QUFFL0QsaUVBQWlFO0FBQ3BELFFBQUEscUJBQXFCLEdBQUc7SUFDbkMsS0FBSyxFQUFFLHVDQUF1QztJQUM5QyxJQUFJLEVBQUUscUNBQXFDO0NBQzVDLENBQUM7QUFFRixnRkFBZ0Y7QUFDaEYsU0FBZ0IsdUJBQXVCLENBQUMsT0FBMEIsRUFBRSxXQUFtQjs7SUFFckYsTUFBTSxPQUFPLGVBQUcsT0FBTyxDQUFDLE9BQU8sMENBQUUsR0FBRyxDQUFDLFdBQVcsMkNBQUcsT0FBTyxDQUFDO0lBRTNELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDWixNQUFNLElBQUksZ0NBQW1CLENBQzNCLHNEQUFzRCxXQUFXLEdBQUcsQ0FBQyxDQUFDO0tBQ3pFO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQVZELDBEQVVDO0FBRUQscUZBQXFGO0FBQ3JGLFNBQWdCLHVCQUF1QixDQUNuQyxPQUEwQixFQUFFLFdBQW1CO0lBQ2pELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFDLE9BQUEsT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMENBQUUsT0FBTyxNQUFLLFdBQVcsQ0FBQSxFQUFBLENBQUM7U0FDbEUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBTEQsMERBS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UHJvamVjdERlZmluaXRpb24sIFRhcmdldERlZmluaXRpb259IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlL3NyYy93b3Jrc3BhY2UnO1xyXG5pbXBvcnQge0pzb25WYWx1ZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xyXG5pbXBvcnQge1NjaGVtYXRpY3NFeGNlcHRpb259IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcclxuXHJcbi8qKiBPYmplY3QgdGhhdCBtYXBzIGEgQ0xJIHRhcmdldCB0byBpdHMgZGVmYXVsdCBidWlsZGVyIG5hbWUuICovXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0VGFyZ2V0QnVpbGRlcnMgPSB7XHJcbiAgYnVpbGQ6ICdAYW5ndWxhci1kZXZraXQvYnVpbGQtYW5ndWxhcjpicm93c2VyJyxcclxuICB0ZXN0OiAnQGFuZ3VsYXItZGV2a2l0L2J1aWxkLWFuZ3VsYXI6a2FybWEnLFxyXG59O1xyXG5cclxuLyoqIFJlc29sdmVzIHRoZSBhcmNoaXRlY3Qgb3B0aW9ucyBmb3IgdGhlIGJ1aWxkIHRhcmdldCBvZiB0aGUgZ2l2ZW4gcHJvamVjdC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3RUYXJnZXRPcHRpb25zKHByb2plY3Q6IFByb2plY3REZWZpbml0aW9uLCBidWlsZFRhcmdldDogc3RyaW5nKTpcclxuICBSZWNvcmQ8c3RyaW5nLCBKc29uVmFsdWUgfCB1bmRlZmluZWQ+IHtcclxuICBjb25zdCBvcHRpb25zID0gcHJvamVjdC50YXJnZXRzPy5nZXQoYnVpbGRUYXJnZXQpPy5vcHRpb25zO1xyXG5cclxuICBpZiAoIW9wdGlvbnMpIHtcclxuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKFxyXG4gICAgICBgQ2Fubm90IGRldGVybWluZSBwcm9qZWN0IHRhcmdldCBjb25maWd1cmF0aW9uIGZvcjogJHtidWlsZFRhcmdldH0uYCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gb3B0aW9ucztcclxufVxyXG5cclxuLyoqIEdldHMgYWxsIHRhcmdldHMgZnJvbSB0aGUgZ2l2ZW4gcHJvamVjdCB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgYnVpbGRlciBuYW1lLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0c0J5QnVpbGRlck5hbWUoXHJcbiAgICBwcm9qZWN0OiBQcm9qZWN0RGVmaW5pdGlvbiwgYnVpbGRlck5hbWU6IHN0cmluZyk6IFRhcmdldERlZmluaXRpb25bXSB7XHJcbiAgcmV0dXJuIEFycmF5LmZyb20ocHJvamVjdC50YXJnZXRzLmtleXMoKSlcclxuICAgICAgLmZpbHRlcihuYW1lID0+IHByb2plY3QudGFyZ2V0cy5nZXQobmFtZSk/LmJ1aWxkZXIgPT09IGJ1aWxkZXJOYW1lKVxyXG4gICAgICAubWFwKG5hbWUgPT4gcHJvamVjdC50YXJnZXRzLmdldChuYW1lKSEpO1xyXG59XHJcbiJdfQ==