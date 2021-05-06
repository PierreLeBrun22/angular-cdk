"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevkitFileSystem = void 0;
const core_1 = require("@angular-devkit/core");
const file_system_1 = require("../update-tool/file-system");
const path = require("path");
/**
 * File system that leverages the virtual tree from the CLI devkit. This file
 * system is commonly used by `ng update` migrations that run as part of the
 * Angular CLI.
 */
class DevkitFileSystem extends file_system_1.FileSystem {
    constructor(_tree) {
        super();
        this._tree = _tree;
        this._updateRecorderCache = new Map();
    }
    resolve(...segments) {
        // Note: We use `posix.resolve` as the devkit paths are using posix separators.
        return core_1.normalize(path.posix.resolve('/', ...segments.map(core_1.normalize)));
    }
    edit(filePath) {
        if (this._updateRecorderCache.has(filePath)) {
            return this._updateRecorderCache.get(filePath);
        }
        const recorder = this._tree.beginUpdate(filePath);
        this._updateRecorderCache.set(filePath, recorder);
        return recorder;
    }
    commitEdits() {
        this._updateRecorderCache.forEach(r => this._tree.commitUpdate(r));
        this._updateRecorderCache.clear();
    }
    exists(fileOrDirPath) {
        // We need to check for both file or directory existence, in order
        // to comply with the expectation from the TypeScript compiler.
        return this._tree.exists(fileOrDirPath) || this._isExistingDirectory(fileOrDirPath);
    }
    overwrite(filePath, content) {
        this._tree.overwrite(filePath, content);
    }
    create(filePath, content) {
        this._tree.create(filePath, content);
    }
    delete(filePath) {
        this._tree.delete(filePath);
    }
    read(filePath) {
        const buffer = this._tree.read(filePath);
        return buffer !== null ? buffer.toString() : null;
    }
    readDirectory(dirPath) {
        const { subdirs: directories, subfiles: files } = this._tree.getDir(dirPath);
        return { directories, files };
    }
    _isExistingDirectory(dirPath) {
        if (dirPath === core_1.NormalizedRoot) {
            return true;
        }
        const parent = core_1.dirname(dirPath);
        const dirName = core_1.basename(dirPath);
        // TypeScript also checks potential entry points, so e.g. importing
        // package.json will result in a lookup of /package.json/package.json
        // and /package.json/index.ts. In order to avoid failure, we check if
        // the parent is an existing file and return false, if that is the case.
        if (this._tree.exists(parent)) {
            return false;
        }
        const dir = this._tree.getDir(parent);
        return dir.subdirs.indexOf(dirName) !== -1;
    }
}
exports.DevkitFileSystem = DevkitFileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2a2l0LWZpbGUtc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kZXZraXQtZmlsZS1zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQXdGO0FBRXhGLDREQUFzRTtBQUN0RSw2QkFBNkI7QUFFN0I7Ozs7R0FJRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEsd0JBQVU7SUFHOUMsWUFBb0IsS0FBVztRQUM3QixLQUFLLEVBQUUsQ0FBQztRQURVLFVBQUssR0FBTCxLQUFLLENBQU07UUFGdkIseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7SUFJakUsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLFFBQWtCO1FBQzNCLCtFQUErRTtRQUMvRSxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFRCxJQUFJLENBQUMsUUFBYztRQUNqQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDM0MsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBRSxDQUFDO1NBQ2pEO1FBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFtQjtRQUN4QixrRUFBa0U7UUFDbEUsK0RBQStEO1FBQy9ELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBYyxFQUFFLE9BQWU7UUFDdkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYyxFQUFFLE9BQWU7UUFDcEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBYztRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQWM7UUFDakIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekMsT0FBTyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNwRCxDQUFDO0lBRUQsYUFBYSxDQUFDLE9BQWE7UUFDekIsTUFBTSxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNFLE9BQU8sRUFBQyxXQUFXLEVBQUUsS0FBSyxFQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLG9CQUFvQixDQUFDLE9BQWE7UUFDeEMsSUFBSSxPQUFPLEtBQUsscUJBQWMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsTUFBTSxNQUFNLEdBQUcsY0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLGVBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxtRUFBbUU7UUFDbkUscUVBQXFFO1FBQ3JFLHFFQUFxRTtRQUNyRSx3RUFBd0U7UUFDeEUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM3QixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEMsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0Y7QUF4RUQsNENBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge2Jhc2VuYW1lLCBkaXJuYW1lLCBub3JtYWxpemUsIE5vcm1hbGl6ZWRSb290LCBQYXRofSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZSc7XHJcbmltcG9ydCB7VHJlZSwgVXBkYXRlUmVjb3JkZXJ9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcclxuaW1wb3J0IHtEaXJlY3RvcnlFbnRyeSwgRmlsZVN5c3RlbX0gZnJvbSAnLi4vdXBkYXRlLXRvb2wvZmlsZS1zeXN0ZW0nO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuLyoqXHJcbiAqIEZpbGUgc3lzdGVtIHRoYXQgbGV2ZXJhZ2VzIHRoZSB2aXJ0dWFsIHRyZWUgZnJvbSB0aGUgQ0xJIGRldmtpdC4gVGhpcyBmaWxlXHJcbiAqIHN5c3RlbSBpcyBjb21tb25seSB1c2VkIGJ5IGBuZyB1cGRhdGVgIG1pZ3JhdGlvbnMgdGhhdCBydW4gYXMgcGFydCBvZiB0aGVcclxuICogQW5ndWxhciBDTEkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGV2a2l0RmlsZVN5c3RlbSBleHRlbmRzIEZpbGVTeXN0ZW0ge1xyXG4gIHByaXZhdGUgX3VwZGF0ZVJlY29yZGVyQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgVXBkYXRlUmVjb3JkZXI+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3RyZWU6IFRyZWUpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgfVxyXG5cclxuICByZXNvbHZlKC4uLnNlZ21lbnRzOiBzdHJpbmdbXSk6IFBhdGgge1xyXG4gICAgLy8gTm90ZTogV2UgdXNlIGBwb3NpeC5yZXNvbHZlYCBhcyB0aGUgZGV2a2l0IHBhdGhzIGFyZSB1c2luZyBwb3NpeCBzZXBhcmF0b3JzLlxyXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShwYXRoLnBvc2l4LnJlc29sdmUoJy8nLCAuLi5zZWdtZW50cy5tYXAobm9ybWFsaXplKSkpO1xyXG4gIH1cclxuXHJcbiAgZWRpdChmaWxlUGF0aDogUGF0aCkge1xyXG4gICAgaWYgKHRoaXMuX3VwZGF0ZVJlY29yZGVyQ2FjaGUuaGFzKGZpbGVQYXRoKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fdXBkYXRlUmVjb3JkZXJDYWNoZS5nZXQoZmlsZVBhdGgpITtcclxuICAgIH1cclxuICAgIGNvbnN0IHJlY29yZGVyID0gdGhpcy5fdHJlZS5iZWdpblVwZGF0ZShmaWxlUGF0aCk7XHJcbiAgICB0aGlzLl91cGRhdGVSZWNvcmRlckNhY2hlLnNldChmaWxlUGF0aCwgcmVjb3JkZXIpO1xyXG4gICAgcmV0dXJuIHJlY29yZGVyO1xyXG4gIH1cclxuXHJcbiAgY29tbWl0RWRpdHMoKSB7XHJcbiAgICB0aGlzLl91cGRhdGVSZWNvcmRlckNhY2hlLmZvckVhY2gociA9PiB0aGlzLl90cmVlLmNvbW1pdFVwZGF0ZShyKSk7XHJcbiAgICB0aGlzLl91cGRhdGVSZWNvcmRlckNhY2hlLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICBleGlzdHMoZmlsZU9yRGlyUGF0aDogUGF0aCkge1xyXG4gICAgLy8gV2UgbmVlZCB0byBjaGVjayBmb3IgYm90aCBmaWxlIG9yIGRpcmVjdG9yeSBleGlzdGVuY2UsIGluIG9yZGVyXHJcbiAgICAvLyB0byBjb21wbHkgd2l0aCB0aGUgZXhwZWN0YXRpb24gZnJvbSB0aGUgVHlwZVNjcmlwdCBjb21waWxlci5cclxuICAgIHJldHVybiB0aGlzLl90cmVlLmV4aXN0cyhmaWxlT3JEaXJQYXRoKSB8fCB0aGlzLl9pc0V4aXN0aW5nRGlyZWN0b3J5KGZpbGVPckRpclBhdGgpO1xyXG4gIH1cclxuXHJcbiAgb3ZlcndyaXRlKGZpbGVQYXRoOiBQYXRoLCBjb250ZW50OiBzdHJpbmcpIHtcclxuICAgIHRoaXMuX3RyZWUub3ZlcndyaXRlKGZpbGVQYXRoLCBjb250ZW50KTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZShmaWxlUGF0aDogUGF0aCwgY29udGVudDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLl90cmVlLmNyZWF0ZShmaWxlUGF0aCwgY29udGVudCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGUoZmlsZVBhdGg6IFBhdGgpIHtcclxuICAgIHRoaXMuX3RyZWUuZGVsZXRlKGZpbGVQYXRoKTtcclxuICB9XHJcblxyXG4gIHJlYWQoZmlsZVBhdGg6IFBhdGgpIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuX3RyZWUucmVhZChmaWxlUGF0aCk7XHJcbiAgICByZXR1cm4gYnVmZmVyICE9PSBudWxsID8gYnVmZmVyLnRvU3RyaW5nKCkgOiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcmVhZERpcmVjdG9yeShkaXJQYXRoOiBQYXRoKTogRGlyZWN0b3J5RW50cnkge1xyXG4gICAgY29uc3Qge3N1YmRpcnM6IGRpcmVjdG9yaWVzLCBzdWJmaWxlczogZmlsZXN9ID0gdGhpcy5fdHJlZS5nZXREaXIoZGlyUGF0aCk7XHJcbiAgICByZXR1cm4ge2RpcmVjdG9yaWVzLCBmaWxlc307XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pc0V4aXN0aW5nRGlyZWN0b3J5KGRpclBhdGg6IFBhdGgpIHtcclxuICAgIGlmIChkaXJQYXRoID09PSBOb3JtYWxpemVkUm9vdCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwYXJlbnQgPSBkaXJuYW1lKGRpclBhdGgpO1xyXG4gICAgY29uc3QgZGlyTmFtZSA9IGJhc2VuYW1lKGRpclBhdGgpO1xyXG4gICAgLy8gVHlwZVNjcmlwdCBhbHNvIGNoZWNrcyBwb3RlbnRpYWwgZW50cnkgcG9pbnRzLCBzbyBlLmcuIGltcG9ydGluZ1xyXG4gICAgLy8gcGFja2FnZS5qc29uIHdpbGwgcmVzdWx0IGluIGEgbG9va3VwIG9mIC9wYWNrYWdlLmpzb24vcGFja2FnZS5qc29uXHJcbiAgICAvLyBhbmQgL3BhY2thZ2UuanNvbi9pbmRleC50cy4gSW4gb3JkZXIgdG8gYXZvaWQgZmFpbHVyZSwgd2UgY2hlY2sgaWZcclxuICAgIC8vIHRoZSBwYXJlbnQgaXMgYW4gZXhpc3RpbmcgZmlsZSBhbmQgcmV0dXJuIGZhbHNlLCBpZiB0aGF0IGlzIHRoZSBjYXNlLlxyXG4gICAgaWYgKHRoaXMuX3RyZWUuZXhpc3RzKHBhcmVudCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRpciA9IHRoaXMuX3RyZWUuZ2V0RGlyKHBhcmVudCk7XHJcbiAgICByZXR1cm4gZGlyLnN1YmRpcnMuaW5kZXhPZihkaXJOYW1lKSAhPT0gLTE7XHJcbiAgfVxyXG59XHJcbiJdfQ==