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
exports.getWorkspaceConfigGracefully = exports.getTargetTsconfigPath = void 0;
const core_1 = require("@angular-devkit/core");
const reader_1 = require("@angular-devkit/core/src/workspace/json/reader");
/** Name of the default Angular CLI workspace configuration files. */
const defaultWorkspaceConfigPaths = ['/angular.json', '/.angular.json'];
/** Gets the tsconfig path from the given target within the specified project. */
function getTargetTsconfigPath(project, targetName) {
    var _a, _b, _c;
    const tsconfig = (_c = (_b = (_a = project.targets) === null || _a === void 0 ? void 0 : _a.get(targetName)) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.tsConfig;
    return tsconfig ? core_1.normalize(tsconfig) : null;
}
exports.getTargetTsconfigPath = getTargetTsconfigPath;
/** Resolve the workspace configuration of the specified tree gracefully. */
function getWorkspaceConfigGracefully(tree) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = defaultWorkspaceConfigPaths.find(filePath => tree.exists(filePath));
        const configBuffer = tree.read(path);
        if (!path || !configBuffer) {
            return null;
        }
        try {
            return yield reader_1.readJsonWorkspace(path, {
                readFile: (filePath) => __awaiter(this, void 0, void 0, function* () { return tree.read(filePath).toString(); })
            });
        }
        catch (e) {
            return null;
        }
    });
}
exports.getWorkspaceConfigGracefully = getWorkspaceConfigGracefully;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdC10c2NvbmZpZy1wYXRocy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy91dGlscy9wcm9qZWN0LXRzY29uZmlnLXBhdGhzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztBQUVILCtDQUErQztBQU0vQywyRUFBaUY7QUFJakYscUVBQXFFO0FBQ3JFLE1BQU0sMkJBQTJCLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUV4RSxpRkFBaUY7QUFDakYsU0FBZ0IscUJBQXFCLENBQUMsT0FBMEIsRUFDMUIsVUFBa0I7O0lBQ3RELE1BQU0sUUFBUSxxQkFBRyxPQUFPLENBQUMsT0FBTywwQ0FBRSxHQUFHLENBQUMsVUFBVSwyQ0FBRyxPQUFPLDBDQUFFLFFBQVEsQ0FBQztJQUNyRSxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxRQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN6RCxDQUFDO0FBSkQsc0RBSUM7QUFFRCw0RUFBNEU7QUFDNUUsU0FBc0IsNEJBQTRCLENBQUMsSUFBVTs7UUFDM0QsTUFBTSxJQUFJLEdBQUcsMkJBQTJCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSyxDQUFDLENBQUM7UUFFdEMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsSUFBSTtZQUNGLE9BQU8sTUFBTSwwQkFBaUIsQ0FBQyxJQUFJLEVBQUU7Z0JBQ25DLFFBQVEsRUFBRSxDQUFNLFFBQVEsRUFBQyxFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQSxHQUFBO2FBQzNDLENBQUMsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7Q0FBQTtBQWZELG9FQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge25vcm1hbGl6ZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xyXG5pbXBvcnQge1xyXG4gIFByb2plY3REZWZpbml0aW9uLFxyXG4gIFdvcmtzcGFjZURlZmluaXRpb24sXHJcbiAgV29ya3NwYWNlSG9zdCxcclxufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcclxuaW1wb3J0IHtyZWFkSnNvbldvcmtzcGFjZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvc3JjL3dvcmtzcGFjZS9qc29uL3JlYWRlcic7XHJcbmltcG9ydCB7VHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQge1dvcmtzcGFjZVBhdGh9IGZyb20gJy4uL3VwZGF0ZS10b29sL2ZpbGUtc3lzdGVtJztcclxuXHJcbi8qKiBOYW1lIG9mIHRoZSBkZWZhdWx0IEFuZ3VsYXIgQ0xJIHdvcmtzcGFjZSBjb25maWd1cmF0aW9uIGZpbGVzLiAqL1xyXG5jb25zdCBkZWZhdWx0V29ya3NwYWNlQ29uZmlnUGF0aHMgPSBbJy9hbmd1bGFyLmpzb24nLCAnLy5hbmd1bGFyLmpzb24nXTtcclxuXHJcbi8qKiBHZXRzIHRoZSB0c2NvbmZpZyBwYXRoIGZyb20gdGhlIGdpdmVuIHRhcmdldCB3aXRoaW4gdGhlIHNwZWNpZmllZCBwcm9qZWN0LiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0VHNjb25maWdQYXRoKHByb2plY3Q6IFByb2plY3REZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldE5hbWU6IHN0cmluZyk6IFdvcmtzcGFjZVBhdGh8bnVsbCB7XHJcbiAgY29uc3QgdHNjb25maWcgPSBwcm9qZWN0LnRhcmdldHM/LmdldCh0YXJnZXROYW1lKT8ub3B0aW9ucz8udHNDb25maWc7XHJcbiAgcmV0dXJuIHRzY29uZmlnID8gbm9ybWFsaXplKHRzY29uZmlnIGFzIHN0cmluZykgOiBudWxsO1xyXG59XHJcblxyXG4vKiogUmVzb2x2ZSB0aGUgd29ya3NwYWNlIGNvbmZpZ3VyYXRpb24gb2YgdGhlIHNwZWNpZmllZCB0cmVlIGdyYWNlZnVsbHkuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRXb3Jrc3BhY2VDb25maWdHcmFjZWZ1bGx5KHRyZWU6IFRyZWUpOiBQcm9taXNlPFdvcmtzcGFjZURlZmluaXRpb258bnVsbD4ge1xyXG4gIGNvbnN0IHBhdGggPSBkZWZhdWx0V29ya3NwYWNlQ29uZmlnUGF0aHMuZmluZChmaWxlUGF0aCA9PiB0cmVlLmV4aXN0cyhmaWxlUGF0aCkpO1xyXG4gIGNvbnN0IGNvbmZpZ0J1ZmZlciA9IHRyZWUucmVhZChwYXRoISk7XHJcblxyXG4gIGlmICghcGF0aCB8fCAhY29uZmlnQnVmZmVyKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gYXdhaXQgcmVhZEpzb25Xb3Jrc3BhY2UocGF0aCwge1xyXG4gICAgICByZWFkRmlsZTogYXN5bmMgZmlsZVBhdGggPT4gdHJlZS5yZWFkKGZpbGVQYXRoKSEudG9TdHJpbmcoKVxyXG4gICAgfSBhcyBXb3Jrc3BhY2VIb3N0KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbn1cclxuIl19