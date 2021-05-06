"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("@angular-devkit/schematics/tasks");
const package_config_1 = require("./package-config");
/**
 * Schematic factory entry-point for the `ng-add` schematic. The ng-add schematic will be
 * automatically executed if developers run `ng add @angular/cdk`.
 *
 * By default, the CLI already installs the package that has been specified with `ng add`.
 * We just store the version in the `package.json` in case the package manager didn't. Also
 * this ensures that there will be no error that says that the CDK does not support `ng add`.
 */
function default_1() {
    return (host, context) => {
        // The CLI inserts `@angular/cdk` into the `package.json` before this schematic runs. This
        // means that we do not need to insert the CDK into `package.json` files again. In some cases
        // though, it could happen that this schematic runs outside of the CLI `ng add` command, or
        // the CDK is only listed as a dev dependency. If that is the case, we insert a version based
        // on the current build version (substituted version placeholder).
        if (package_config_1.getPackageVersionFromPackageJson(host, '@angular/cdk') === null) {
            // In order to align the CDK version with other Angular dependencies that are setup by
            // `@schematics/angular`, we use tilde instead of caret. This is default for Angular
            // dependencies in new CLI projects.
            package_config_1.addPackageToPackageJson(host, '@angular/cdk', `~11.2.8-sha-84bde9819`);
            // Add a task to run the package manager. This is necessary because we updated the
            // workspace "package.json" file and we want lock files to reflect the new version range.
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctYWRkL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7O0FBR0gsNERBQXdFO0FBQ3hFLHFEQUEyRjtBQUUzRjs7Ozs7OztHQU9HO0FBQ0g7SUFDRSxPQUFPLENBQUMsSUFBVSxFQUFFLE9BQXlCLEVBQUUsRUFBRTtRQUMvQywwRkFBMEY7UUFDMUYsNkZBQTZGO1FBQzdGLDJGQUEyRjtRQUMzRiw2RkFBNkY7UUFDN0Ysa0VBQWtFO1FBQ2xFLElBQUksaURBQWdDLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNuRSxzRkFBc0Y7WUFDdEYsb0ZBQW9GO1lBQ3BGLG9DQUFvQztZQUNwQyx3Q0FBdUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFFcEUsa0ZBQWtGO1lBQ2xGLHlGQUF5RjtZQUN6RixPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksOEJBQXNCLEVBQUUsQ0FBQyxDQUFDO1NBQy9DO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWxCRCw0QkFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UnVsZSwgU2NoZW1hdGljQ29udGV4dCwgVHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQge05vZGVQYWNrYWdlSW5zdGFsbFRhc2t9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzL3Rhc2tzJztcclxuaW1wb3J0IHthZGRQYWNrYWdlVG9QYWNrYWdlSnNvbiwgZ2V0UGFja2FnZVZlcnNpb25Gcm9tUGFja2FnZUpzb259IGZyb20gJy4vcGFja2FnZS1jb25maWcnO1xyXG5cclxuLyoqXHJcbiAqIFNjaGVtYXRpYyBmYWN0b3J5IGVudHJ5LXBvaW50IGZvciB0aGUgYG5nLWFkZGAgc2NoZW1hdGljLiBUaGUgbmctYWRkIHNjaGVtYXRpYyB3aWxsIGJlXHJcbiAqIGF1dG9tYXRpY2FsbHkgZXhlY3V0ZWQgaWYgZGV2ZWxvcGVycyBydW4gYG5nIGFkZCBAYW5ndWxhci9jZGtgLlxyXG4gKlxyXG4gKiBCeSBkZWZhdWx0LCB0aGUgQ0xJIGFscmVhZHkgaW5zdGFsbHMgdGhlIHBhY2thZ2UgdGhhdCBoYXMgYmVlbiBzcGVjaWZpZWQgd2l0aCBgbmcgYWRkYC5cclxuICogV2UganVzdCBzdG9yZSB0aGUgdmVyc2lvbiBpbiB0aGUgYHBhY2thZ2UuanNvbmAgaW4gY2FzZSB0aGUgcGFja2FnZSBtYW5hZ2VyIGRpZG4ndC4gQWxzb1xyXG4gKiB0aGlzIGVuc3VyZXMgdGhhdCB0aGVyZSB3aWxsIGJlIG5vIGVycm9yIHRoYXQgc2F5cyB0aGF0IHRoZSBDREsgZG9lcyBub3Qgc3VwcG9ydCBgbmcgYWRkYC5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCk6IFJ1bGUge1xyXG4gIHJldHVybiAoaG9zdDogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xyXG4gICAgLy8gVGhlIENMSSBpbnNlcnRzIGBAYW5ndWxhci9jZGtgIGludG8gdGhlIGBwYWNrYWdlLmpzb25gIGJlZm9yZSB0aGlzIHNjaGVtYXRpYyBydW5zLiBUaGlzXHJcbiAgICAvLyBtZWFucyB0aGF0IHdlIGRvIG5vdCBuZWVkIHRvIGluc2VydCB0aGUgQ0RLIGludG8gYHBhY2thZ2UuanNvbmAgZmlsZXMgYWdhaW4uIEluIHNvbWUgY2FzZXNcclxuICAgIC8vIHRob3VnaCwgaXQgY291bGQgaGFwcGVuIHRoYXQgdGhpcyBzY2hlbWF0aWMgcnVucyBvdXRzaWRlIG9mIHRoZSBDTEkgYG5nIGFkZGAgY29tbWFuZCwgb3JcclxuICAgIC8vIHRoZSBDREsgaXMgb25seSBsaXN0ZWQgYXMgYSBkZXYgZGVwZW5kZW5jeS4gSWYgdGhhdCBpcyB0aGUgY2FzZSwgd2UgaW5zZXJ0IGEgdmVyc2lvbiBiYXNlZFxyXG4gICAgLy8gb24gdGhlIGN1cnJlbnQgYnVpbGQgdmVyc2lvbiAoc3Vic3RpdHV0ZWQgdmVyc2lvbiBwbGFjZWhvbGRlcikuXHJcbiAgICBpZiAoZ2V0UGFja2FnZVZlcnNpb25Gcm9tUGFja2FnZUpzb24oaG9zdCwgJ0Bhbmd1bGFyL2NkaycpID09PSBudWxsKSB7XHJcbiAgICAgIC8vIEluIG9yZGVyIHRvIGFsaWduIHRoZSBDREsgdmVyc2lvbiB3aXRoIG90aGVyIEFuZ3VsYXIgZGVwZW5kZW5jaWVzIHRoYXQgYXJlIHNldHVwIGJ5XHJcbiAgICAgIC8vIGBAc2NoZW1hdGljcy9hbmd1bGFyYCwgd2UgdXNlIHRpbGRlIGluc3RlYWQgb2YgY2FyZXQuIFRoaXMgaXMgZGVmYXVsdCBmb3IgQW5ndWxhclxyXG4gICAgICAvLyBkZXBlbmRlbmNpZXMgaW4gbmV3IENMSSBwcm9qZWN0cy5cclxuICAgICAgYWRkUGFja2FnZVRvUGFja2FnZUpzb24oaG9zdCwgJ0Bhbmd1bGFyL2NkaycsIGB+MC4wLjAtUExBQ0VIT0xERVJgKTtcclxuXHJcbiAgICAgIC8vIEFkZCBhIHRhc2sgdG8gcnVuIHRoZSBwYWNrYWdlIG1hbmFnZXIuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugd2UgdXBkYXRlZCB0aGVcclxuICAgICAgLy8gd29ya3NwYWNlIFwicGFja2FnZS5qc29uXCIgZmlsZSBhbmQgd2Ugd2FudCBsb2NrIGZpbGVzIHRvIHJlZmxlY3QgdGhlIG5ldyB2ZXJzaW9uIHJhbmdlLlxyXG4gICAgICBjb250ZXh0LmFkZFRhc2sobmV3IE5vZGVQYWNrYWdlSW5zdGFsbFRhc2soKSk7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG4iXX0=