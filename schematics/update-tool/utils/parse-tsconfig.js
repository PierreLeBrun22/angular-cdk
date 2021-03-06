"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTsconfigFile = void 0;
const ts = require("typescript");
const virtual_host_1 = require("./virtual-host");
const path_1 = require("path");
function parseTsconfigFile(tsconfigPath, fileSystem) {
    const { config } = ts.readConfigFile(tsconfigPath, p => fileSystem.read(fileSystem.resolve(p)));
    return ts.parseJsonConfigFileContent(config, new virtual_host_1.FileSystemHost(fileSystem), path_1.dirname(tsconfigPath), {});
}
exports.parseTsconfigFile = parseTsconfigFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UtdHNjb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvdXRpbHMvcGFyc2UtdHNjb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLGlEQUE4QztBQUM5QywrQkFBNkI7QUFFN0IsU0FBZ0IsaUJBQWlCLENBQUMsWUFBMkIsRUFDM0IsVUFBc0I7SUFDdEQsTUFBTSxFQUFDLE1BQU0sRUFBQyxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUMzQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUM7SUFDbEQsT0FBTyxFQUFFLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLElBQUksNkJBQWMsQ0FBQyxVQUFVLENBQUMsRUFDdkUsY0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFORCw4Q0FNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7RmlsZVN5c3RlbSwgV29ya3NwYWNlUGF0aH0gZnJvbSAnLi4vZmlsZS1zeXN0ZW0nO1xyXG5pbXBvcnQge0ZpbGVTeXN0ZW1Ib3N0fSBmcm9tICcuL3ZpcnR1YWwtaG9zdCc7XHJcbmltcG9ydCB7ZGlybmFtZX0gZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUc2NvbmZpZ0ZpbGUodHNjb25maWdQYXRoOiBXb3Jrc3BhY2VQYXRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZVN5c3RlbTogRmlsZVN5c3RlbSk6IHRzLlBhcnNlZENvbW1hbmRMaW5lIHtcclxuICBjb25zdCB7Y29uZmlnfSA9IHRzLnJlYWRDb25maWdGaWxlKHRzY29uZmlnUGF0aCxcclxuICAgICAgcCA9PiBmaWxlU3lzdGVtLnJlYWQoZmlsZVN5c3RlbS5yZXNvbHZlKHApKSEpO1xyXG4gIHJldHVybiB0cy5wYXJzZUpzb25Db25maWdGaWxlQ29udGVudChjb25maWcsIG5ldyBGaWxlU3lzdGVtSG9zdChmaWxlU3lzdGVtKSxcclxuICAgICAgZGlybmFtZSh0c2NvbmZpZ1BhdGgpLCB7fSk7XHJcbn1cclxuIl19