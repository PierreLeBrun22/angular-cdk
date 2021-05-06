"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = void 0;
/**
 * Abstraction of the file system that migrations can use to record and apply
 * changes. This is necessary to support virtual file systems as used in the CLI devkit.
 */
class FileSystem {
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvZmlsZS1zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBa0NIOzs7R0FHRztBQUNILE1BQXNCLFVBQVU7Q0ErQi9CO0FBL0JELGdDQStCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtVcGRhdGVSZWNvcmRlcn0gZnJvbSAnLi91cGRhdGUtcmVjb3JkZXInO1xyXG5cclxuLyoqXHJcbiAqIEEgd29ya3NwYWNlIHBhdGggc2VtYW50aWNhbGx5IGlzIGVxdWl2YWxlbnQgdG8gdGhlIGBQYXRoYCB0eXBlIHByb3ZpZGVkIGJ5IHRoZVxyXG4gKiBBbmd1bGFyIGRldmtpdC4gUGF0aHMgZGVub3RlZCB3aXRoIHN1Y2ggYSB0eXBlIGFyZSBndWFyYW50ZWVkIHRvIGJlIHJlcHJlc2VudGluZ1xyXG4gKiBwYXRocyBvZiBhIGdpdmVuIHZpcnR1YWwgZmlsZSBzeXN0ZW0uIFRoaXMgbWVhbnMgdGhhdCB0aGUgcm9vdCBvZiBhIHBhdGggY2FuIGJlXHJcbiAqIGRpZmZlcmVudCwgYW5kIGRvZXMgbm90IG5lY2Vzc2FyaWx5IG5lZWQgdG8gbWF0Y2ggdGhlIHJvb3QgaW4gdGhlIHJlYWwgZmlsZSBzeXN0ZW0uXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlOiBDb25zaWRlciB3ZSBoYXZlIGEgcHJvamVjdCBpbiBgL2hvbWUvPC4uPi9teS1wcm9qZWN0YC4gVGhlbiBhIHBhdGhcclxuICogbGlrZSBgL3BhY2thZ2UuanNvbmAgY291bGQgYWN0dWFsbHkgcmVmZXIgdG8gdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUgaW4gYG15LXByb2plY3RgLlxyXG4gKiBOb3RlIHRoYXQgaW4gdGhlIHJlYWwgZmlsZSBzeXN0ZW0gdGhpcyB3b3VsZCBub3QgbWF0Y2ggdGhvdWdoLlxyXG4gKlxyXG4gKiBPbmUgd29uZGVyIHdoeSBhbm90aGVyIHR5cGUgaGFzIGJlZW4gZGVjbGFyZWQgZm9yIHN1Y2ggcGF0aHMsIHdoZW4gdGhlcmUgYWxyZWFkeVxyXG4gKiBpcyB0aGUgYFBhdGhgIHR5cGUgcHJvdmlkZWQgYnkgdGhlIGRldmtpdC4gV2UgZG8gdGhpcyBmb3IgYSBjb3VwbGUgb2YgcmVhc29uczpcclxuICpcclxuICogICAxLiBUaGUgdXBkYXRlLXRvb2wgY2Fubm90IGhhdmUgYSBkZXBlbmRlbmN5IG9uIHRoZSBBbmd1bGFyIGRldmtpdCBhcyB0aGF0IG9uZVxyXG4gKiAgICAgIGlzIG5vdCBzeW5jZWQgaW50byBnMy4gV2Ugd2FudCB0byBiZSBhYmxlIHRvIHJ1biBtaWdyYXRpb25zIGluIGczIGlmIG5lZWRlZC5cclxuICovXHJcbmV4cG9ydCB0eXBlIFdvcmtzcGFjZVBhdGggPSBzdHJpbmcme1xyXG4gIC8vIEJyYW5kIHNpZ25hdHVyZSBtYXRjaGVzIHRoZSBkZXZraXQgcGF0aHMgc28gdGhhdCBleGlzdGluZyBwYXRoXHJcbiAgLy8gdXRpbGl0aWVzIGZyb20gdGhlIEFuZ3VsYXIgZGV2a2l0IGNhbiBiZSBjb252ZW5pZW50bHkgdXNlZC5cclxuICBfX1BSSVZBVEVfREVWS0lUX1BBVEg6IHZvaWQ7XHJcbn07XHJcblxyXG4vKiogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIGEgZGlyZWN0b3J5LiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdG9yeUVudHJ5IHtcclxuICAvKiogTGlzdCBvZiBkaXJlY3RvcmllcyBpbnNpZGUgdGhlIGRpcmVjdG9yeS4gKi9cclxuICBkaXJlY3Rvcmllczogc3RyaW5nW107XHJcbiAgLyoqIExpc3Qgb2YgZmlsZXMgaW5zaWRlIHRoZSBkaXJlY3RvcnkuICovXHJcbiAgZmlsZXM6IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vKipcclxuICogQWJzdHJhY3Rpb24gb2YgdGhlIGZpbGUgc3lzdGVtIHRoYXQgbWlncmF0aW9ucyBjYW4gdXNlIHRvIHJlY29yZCBhbmQgYXBwbHlcclxuICogY2hhbmdlcy4gVGhpcyBpcyBuZWNlc3NhcnkgdG8gc3VwcG9ydCB2aXJ0dWFsIGZpbGUgc3lzdGVtcyBhcyB1c2VkIGluIHRoZSBDTEkgZGV2a2l0LlxyXG4gKi9cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEZpbGVTeXN0ZW0ge1xyXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gZmlsZSBvciBkaXJlY3RvcnkgZXhpc3RzLiAqL1xyXG4gIGFic3RyYWN0IGV4aXN0cyhwYXRoOiBXb3Jrc3BhY2VQYXRoKTogYm9vbGVhbjtcclxuICAvKiogR2V0cyB0aGUgY29udGVudHMgb2YgdGhlIGdpdmVuIGZpbGUuICovXHJcbiAgYWJzdHJhY3QgcmVhZChmaWxlUGF0aDogV29ya3NwYWNlUGF0aCk6IHN0cmluZ3xudWxsO1xyXG4gIC8qKiBSZWFkcyB0aGUgZ2l2ZW4gZGlyZWN0b3J5IHRvIHJldHJpZXZlIGNoaWxkcmVuLiAqL1xyXG4gIGFic3RyYWN0IHJlYWREaXJlY3RvcnkoZGlyUGF0aDogV29ya3NwYWNlUGF0aCk6IERpcmVjdG9yeUVudHJ5O1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gdXBkYXRlIHJlY29yZGVyIGZvciB0aGUgZ2l2ZW4gZmlsZS4gRWRpdHMgY2FuIGJlIHJlY29yZGVkIGFuZFxyXG4gICAqIGNvbW1pdHRlZCBpbiBiYXRjaGVzLiBDaGFuZ2VzIGFyZSBub3QgYXBwbGllZCBhdXRvbWF0aWNhbGx5IGJlY2F1c2Ugb3RoZXJ3aXNlXHJcbiAgICogbWlncmF0aW9ucyB3b3VsZCBuZWVkIHRvIHJlLXJlYWQgZmlsZXMsIG9yIGFjY291bnQgZm9yIHNoaWZ0ZWQgZmlsZSBjb250ZW50cy5cclxuICAgKi9cclxuICBhYnN0cmFjdCBlZGl0KGZpbGVQYXRoOiBXb3Jrc3BhY2VQYXRoKTogVXBkYXRlUmVjb3JkZXI7XHJcbiAgLyoqIEFwcGxpZXMgYWxsIGNoYW5nZXMgd2hpY2ggaGF2ZSBiZWVuIHJlY29yZGVkIGluIHVwZGF0ZSByZWNvcmRlcnMuICovXHJcbiAgYWJzdHJhY3QgY29tbWl0RWRpdHMoKTogdm9pZDtcclxuICAvKiogQ3JlYXRlcyBhIG5ldyBmaWxlIHdpdGggdGhlIGdpdmVuIGNvbnRlbnQuICovXHJcbiAgYWJzdHJhY3QgY3JlYXRlKGZpbGVQYXRoOiBXb3Jrc3BhY2VQYXRoLCBjb250ZW50OiBzdHJpbmcpOiB2b2lkO1xyXG4gIC8qKiBPdmVyd3JpdGVzIGFuIGV4aXN0aW5nIGZpbGUgd2l0aCB0aGUgZ2l2ZW4gY29udGVudC4gKi9cclxuICBhYnN0cmFjdCBvdmVyd3JpdGUoZmlsZVBhdGg6IFdvcmtzcGFjZVBhdGgsIGNvbnRlbnQ6IHN0cmluZyk6IHZvaWQ7XHJcbiAgLyoqIERlbGV0ZXMgdGhlIGdpdmVuIGZpbGUuICovXHJcbiAgYWJzdHJhY3QgZGVsZXRlKGZpbGVQYXRoOiBXb3Jrc3BhY2VQYXRoKTogdm9pZDtcclxuICAvKipcclxuICAgKiBSZXNvbHZlcyBnaXZlbiBwYXRocyB0byBhIHJlc29sdmVkIHBhdGggaW4gdGhlIGZpbGUgc3lzdGVtLiBGb3IgZXhhbXBsZSwgdGhlIGRldmtpdFxyXG4gICAqIHRyZWUgY29uc2lkZXJzIHRoZSBhY3R1YWwgd29ya3NwYWNlIGRpcmVjdG9yeSBhcyBmaWxlIHN5c3RlbSByb290LlxyXG4gICAqXHJcbiAgICogRm9sbG93cyB0aGUgc2FtZSBzZW1hbnRpY3MgYXMgdGhlIG5hdGl2ZSBwYXRoIGByZXNvbHZlYCBtZXRob2QuIGkuZS4gc2VnbWVudHNcclxuICAgKiBhcmUgcHJvY2Vzc2VkIGluIHJldmVyc2UuIFRoZSBsYXN0IHNlZ21lbnQgaXMgY29uc2lkZXJlZCB0aGUgdGFyZ2V0IGFuZCB0aGVcclxuICAgKiBmdW5jdGlvbiB3aWxsIGl0ZXJhdGUgZnJvbSB0aGUgdGFyZ2V0IHRocm91Z2ggb3RoZXIgc2VnbWVudHMgdW50aWwgaXQgZmluZHMgYW5cclxuICAgKiBhYnNvbHV0ZSBwYXRoIHNlZ21lbnQuXHJcbiAgICovXHJcbiAgYWJzdHJhY3QgcmVzb2x2ZSguLi5zZWdtZW50czogc3RyaW5nW10pOiBXb3Jrc3BhY2VQYXRoO1xyXG59XHJcbiJdfQ==