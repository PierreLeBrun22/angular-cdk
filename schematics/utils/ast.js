"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findModuleFromOptions = exports.addModuleImportToModule = exports.addModuleImportToRootModule = exports.parseSourceFile = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const ts = require("typescript");
const project_main_file_1 = require("./project-main-file");
const vendored_ast_utils_1 = require("./vendored-ast-utils");
/** Reads file given path and returns TypeScript source file. */
function parseSourceFile(host, path) {
    const buffer = host.read(path);
    if (!buffer) {
        throw new schematics_1.SchematicsException(`Could not find file for path: ${path}`);
    }
    return ts.createSourceFile(path, buffer.toString(), ts.ScriptTarget.Latest, true);
}
exports.parseSourceFile = parseSourceFile;
/** Import and add module to root app module. */
function addModuleImportToRootModule(host, moduleName, src, project) {
    const modulePath = vendored_ast_utils_1.getAppModulePath(host, project_main_file_1.getProjectMainFile(project));
    addModuleImportToModule(host, modulePath, moduleName, src);
}
exports.addModuleImportToRootModule = addModuleImportToRootModule;
/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
function addModuleImportToModule(host, modulePath, moduleName, src) {
    const moduleSource = parseSourceFile(host, modulePath);
    if (!moduleSource) {
        throw new schematics_1.SchematicsException(`Module not found: ${modulePath}`);
    }
    const changes = vendored_ast_utils_1.addImportToModule(moduleSource, modulePath, moduleName, src);
    const recorder = host.beginUpdate(modulePath);
    changes.forEach(change => {
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });
    host.commitUpdate(recorder);
}
exports.addModuleImportToModule = addModuleImportToModule;
/** Wraps the internal find module from options with undefined path handling  */
function findModuleFromOptions(host, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        if (!options.project) {
            options.project = Array.from(workspace.projects.keys())[0];
        }
        const project = workspace.projects.get(options.project);
        if (options.path === undefined) {
            options.path = `/${project.root}/src/app`;
        }
        return find_module_1.findModuleFromOptions(host, options);
    });
}
exports.findModuleFromOptions = findModuleFromOptions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2FzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7QUFFSCwyREFBcUU7QUFFckUsK0RBQWdFO0FBQ2hFLHFFQUFtRTtBQUNuRSx5RUFBb0c7QUFFcEcsaUNBQWlDO0FBQ2pDLDJEQUF1RDtBQUN2RCw2REFBeUU7QUFFekUsZ0VBQWdFO0FBQ2hFLFNBQWdCLGVBQWUsQ0FBQyxJQUFVLEVBQUUsSUFBWTtJQUN0RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9CLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDWCxNQUFNLElBQUksZ0NBQW1CLENBQUMsaUNBQWlDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDeEU7SUFDRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFORCwwQ0FNQztBQUVELGdEQUFnRDtBQUNoRCxTQUFnQiwyQkFBMkIsQ0FBQyxJQUFVLEVBQUUsVUFBa0IsRUFBRSxHQUFXLEVBQzNDLE9BQTBCO0lBQ3BFLE1BQU0sVUFBVSxHQUFHLHFDQUFnQixDQUFDLElBQUksRUFBRSxzQ0FBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLHVCQUF1QixDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFKRCxrRUFJQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLHVCQUF1QixDQUFDLElBQVUsRUFBRSxVQUFrQixFQUFFLFVBQWtCLEVBQ2xELEdBQVc7SUFFakQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUV2RCxJQUFJLENBQUMsWUFBWSxFQUFFO1FBQ2pCLE1BQU0sSUFBSSxnQ0FBbUIsQ0FBQyxxQkFBcUIsVUFBVSxFQUFFLENBQUMsQ0FBQztLQUNsRTtJQUVELE1BQU0sT0FBTyxHQUFHLHNDQUFpQixDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFOUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUN2QixJQUFJLE1BQU0sWUFBWSxxQkFBWSxFQUFFO1lBQ2xDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUIsQ0FBQztBQW5CRCwwREFtQkM7QUFFRCxnRkFBZ0Y7QUFDaEYsU0FBc0IscUJBQXFCLENBQUMsSUFBVSxFQUFFLE9BQXlCOztRQUUvRSxNQUFNLFNBQVMsR0FBRyxNQUFNLHdCQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDcEIsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUVELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBQztRQUV6RCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxVQUFVLENBQUM7U0FDM0M7UUFFRCxPQUFPLG1DQUFrQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0NBQUE7QUFmRCxzREFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTY2hlbWF0aWNzRXhjZXB0aW9uLCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XHJcbmltcG9ydCB7U2NoZW1hIGFzIENvbXBvbmVudE9wdGlvbnN9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvY29tcG9uZW50L3NjaGVtYSc7XHJcbmltcG9ydCB7SW5zZXJ0Q2hhbmdlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvY2hhbmdlJztcclxuaW1wb3J0IHtnZXRXb3Jrc3BhY2V9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS93b3Jrc3BhY2UnO1xyXG5pbXBvcnQge2ZpbmRNb2R1bGVGcm9tT3B0aW9ucyBhcyBpbnRlcm5hbEZpbmRNb2R1bGV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9maW5kLW1vZHVsZSc7XHJcbmltcG9ydCB7UHJvamVjdERlZmluaXRpb259IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlL3NyYy93b3Jrc3BhY2UnO1xyXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuaW1wb3J0IHtnZXRQcm9qZWN0TWFpbkZpbGV9IGZyb20gJy4vcHJvamVjdC1tYWluLWZpbGUnO1xyXG5pbXBvcnQge2FkZEltcG9ydFRvTW9kdWxlLCBnZXRBcHBNb2R1bGVQYXRofSBmcm9tICcuL3ZlbmRvcmVkLWFzdC11dGlscyc7XHJcblxyXG4vKiogUmVhZHMgZmlsZSBnaXZlbiBwYXRoIGFuZCByZXR1cm5zIFR5cGVTY3JpcHQgc291cmNlIGZpbGUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNvdXJjZUZpbGUoaG9zdDogVHJlZSwgcGF0aDogc3RyaW5nKTogdHMuU291cmNlRmlsZSB7XHJcbiAgY29uc3QgYnVmZmVyID0gaG9zdC5yZWFkKHBhdGgpO1xyXG4gIGlmICghYnVmZmVyKSB7XHJcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgQ291bGQgbm90IGZpbmQgZmlsZSBmb3IgcGF0aDogJHtwYXRofWApO1xyXG4gIH1cclxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShwYXRoLCBidWZmZXIudG9TdHJpbmcoKSwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XHJcbn1cclxuXHJcbi8qKiBJbXBvcnQgYW5kIGFkZCBtb2R1bGUgdG8gcm9vdCBhcHAgbW9kdWxlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYWRkTW9kdWxlSW1wb3J0VG9Sb290TW9kdWxlKGhvc3Q6IFRyZWUsIG1vZHVsZU5hbWU6IHN0cmluZywgc3JjOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvamVjdDogUHJvamVjdERlZmluaXRpb24pIHtcclxuICBjb25zdCBtb2R1bGVQYXRoID0gZ2V0QXBwTW9kdWxlUGF0aChob3N0LCBnZXRQcm9qZWN0TWFpbkZpbGUocHJvamVjdCkpO1xyXG4gIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGgsIG1vZHVsZU5hbWUsIHNyYyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJbXBvcnQgYW5kIGFkZCBtb2R1bGUgdG8gc3BlY2lmaWMgbW9kdWxlIHBhdGguXHJcbiAqIEBwYXJhbSBob3N0IHRoZSB0cmVlIHdlIGFyZSB1cGRhdGluZ1xyXG4gKiBAcGFyYW0gbW9kdWxlUGF0aCBzcmMgbG9jYXRpb24gb2YgdGhlIG1vZHVsZSB0byBpbXBvcnRcclxuICogQHBhcmFtIG1vZHVsZU5hbWUgbmFtZSBvZiBtb2R1bGUgdG8gaW1wb3J0XHJcbiAqIEBwYXJhbSBzcmMgc3JjIGxvY2F0aW9uIHRvIGltcG9ydFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZywgbW9kdWxlTmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiBzdHJpbmcpIHtcclxuXHJcbiAgY29uc3QgbW9kdWxlU291cmNlID0gcGFyc2VTb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xyXG5cclxuICBpZiAoIW1vZHVsZVNvdXJjZSkge1xyXG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYE1vZHVsZSBub3QgZm91bmQ6ICR7bW9kdWxlUGF0aH1gKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNoYW5nZXMgPSBhZGRJbXBvcnRUb01vZHVsZShtb2R1bGVTb3VyY2UsIG1vZHVsZVBhdGgsIG1vZHVsZU5hbWUsIHNyYyk7XHJcbiAgY29uc3QgcmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xyXG5cclxuICBjaGFuZ2VzLmZvckVhY2goY2hhbmdlID0+IHtcclxuICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcclxuICAgICAgcmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBob3N0LmNvbW1pdFVwZGF0ZShyZWNvcmRlcik7XHJcbn1cclxuXHJcbi8qKiBXcmFwcyB0aGUgaW50ZXJuYWwgZmluZCBtb2R1bGUgZnJvbSBvcHRpb25zIHdpdGggdW5kZWZpbmVkIHBhdGggaGFuZGxpbmcgICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdDogVHJlZSwgb3B0aW9uczogQ29tcG9uZW50T3B0aW9ucyk6XHJcbiAgUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcclxuICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XHJcblxyXG4gIGlmICghb3B0aW9ucy5wcm9qZWN0KSB7XHJcbiAgICBvcHRpb25zLnByb2plY3QgPSBBcnJheS5mcm9tKHdvcmtzcGFjZS5wcm9qZWN0cy5rZXlzKCkpWzBdO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcHJvamVjdCA9IHdvcmtzcGFjZS5wcm9qZWN0cy5nZXQob3B0aW9ucy5wcm9qZWN0KSE7XHJcblxyXG4gIGlmIChvcHRpb25zLnBhdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgb3B0aW9ucy5wYXRoID0gYC8ke3Byb2plY3Qucm9vdH0vc3JjL2FwcGA7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gaW50ZXJuYWxGaW5kTW9kdWxlKGhvc3QsIG9wdGlvbnMpO1xyXG59XHJcbiJdfQ==