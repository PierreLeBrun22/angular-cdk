"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChanges = exports.getChangesForTarget = void 0;
const target_version_1 = require("./target-version");
/**
 * Gets the changes for a given target version from the specified version changes object.
 *
 * For readability and a good overview of breaking changes, the version change data always
 * includes the related Pull Request link. Since this data is not needed when performing the
 * upgrade, this unused data can be removed and the changes data can be flattened into an
 * easy iterable array.
 */
function getChangesForTarget(target, data) {
    if (!data) {
        const version = target_version_1.TargetVersion[target];
        throw new Error(`No data could be found for target version: ${version}`);
    }
    return (data[target] || []).reduce((result, prData) => result.concat(prData.changes), []);
}
exports.getChangesForTarget = getChangesForTarget;
/**
 * Gets all changes from the specified version changes object. This is helpful in case a migration
 * rule does not distinguish data based on the target version, but for readability the
 * upgrade data is separated for each target version.
 */
function getAllChanges(data) {
    return Object.keys(data)
        .map(targetVersion => getChangesForTarget(targetVersion, data))
        .reduce((result, versionData) => result.concat(versionData), []);
}
exports.getAllChanges = getAllChanges;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1jaGFuZ2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxREFBK0M7QUFhL0M7Ozs7Ozs7R0FPRztBQUNILFNBQWdCLG1CQUFtQixDQUFJLE1BQXFCLEVBQUUsSUFBdUI7SUFDbkYsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNULE1BQU0sT0FBTyxHQUFJLDhCQUF3QyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDMUU7SUFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQVMsQ0FBQyxDQUFDO0FBQ25HLENBQUM7QUFQRCxrREFPQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixhQUFhLENBQUksSUFBdUI7SUFDdEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNuQixHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxhQUE4QixFQUFFLElBQUksQ0FBQyxDQUFDO1NBQy9FLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdkUsQ0FBQztBQUpELHNDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4vdGFyZ2V0LXZlcnNpb24nO1xyXG5cclxuZXhwb3J0IHR5cGUgVmVyc2lvbkNoYW5nZXM8VD4gPSB7XHJcbiAgW3RhcmdldCBpbiBUYXJnZXRWZXJzaW9uXT86IFJlYWRhYmxlQ2hhbmdlPFQ+W107XHJcbn07XHJcblxyXG5leHBvcnQgdHlwZSBSZWFkYWJsZUNoYW5nZTxUPiA9IHtcclxuICBwcjogc3RyaW5nOyBjaGFuZ2VzOiBUW11cclxufTtcclxuXHJcbi8qKiBDb25kaXRpb25hbCB0eXBlIHRoYXQgdW53cmFwcyB0aGUgdmFsdWUgb2YgYSB2ZXJzaW9uIGNoYW5nZXMgdHlwZS4gKi9cclxuZXhwb3J0IHR5cGUgVmFsdWVPZkNoYW5nZXM8VD4gPSBUIGV4dGVuZHMgVmVyc2lvbkNoYW5nZXM8aW5mZXIgWD4/IFggOiBudWxsO1xyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIGNoYW5nZXMgZm9yIGEgZ2l2ZW4gdGFyZ2V0IHZlcnNpb24gZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2hhbmdlcyBvYmplY3QuXHJcbiAqXHJcbiAqIEZvciByZWFkYWJpbGl0eSBhbmQgYSBnb29kIG92ZXJ2aWV3IG9mIGJyZWFraW5nIGNoYW5nZXMsIHRoZSB2ZXJzaW9uIGNoYW5nZSBkYXRhIGFsd2F5c1xyXG4gKiBpbmNsdWRlcyB0aGUgcmVsYXRlZCBQdWxsIFJlcXVlc3QgbGluay4gU2luY2UgdGhpcyBkYXRhIGlzIG5vdCBuZWVkZWQgd2hlbiBwZXJmb3JtaW5nIHRoZVxyXG4gKiB1cGdyYWRlLCB0aGlzIHVudXNlZCBkYXRhIGNhbiBiZSByZW1vdmVkIGFuZCB0aGUgY2hhbmdlcyBkYXRhIGNhbiBiZSBmbGF0dGVuZWQgaW50byBhblxyXG4gKiBlYXN5IGl0ZXJhYmxlIGFycmF5LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENoYW5nZXNGb3JUYXJnZXQ8VD4odGFyZ2V0OiBUYXJnZXRWZXJzaW9uLCBkYXRhOiBWZXJzaW9uQ2hhbmdlczxUPik6IFRbXSB7XHJcbiAgaWYgKCFkYXRhKSB7XHJcbiAgICBjb25zdCB2ZXJzaW9uID0gKFRhcmdldFZlcnNpb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPilbdGFyZ2V0XTtcclxuICAgIHRocm93IG5ldyBFcnJvcihgTm8gZGF0YSBjb3VsZCBiZSBmb3VuZCBmb3IgdGFyZ2V0IHZlcnNpb246ICR7dmVyc2lvbn1gKTtcclxuICB9XHJcblxyXG4gIHJldHVybiAoZGF0YVt0YXJnZXRdIHx8IFtdKS5yZWR1Y2UoKHJlc3VsdCwgcHJEYXRhKSA9PiByZXN1bHQuY29uY2F0KHByRGF0YS5jaGFuZ2VzKSwgW10gYXMgVFtdKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgYWxsIGNoYW5nZXMgZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gY2hhbmdlcyBvYmplY3QuIFRoaXMgaXMgaGVscGZ1bCBpbiBjYXNlIGEgbWlncmF0aW9uXHJcbiAqIHJ1bGUgZG9lcyBub3QgZGlzdGluZ3Vpc2ggZGF0YSBiYXNlZCBvbiB0aGUgdGFyZ2V0IHZlcnNpb24sIGJ1dCBmb3IgcmVhZGFiaWxpdHkgdGhlXHJcbiAqIHVwZ3JhZGUgZGF0YSBpcyBzZXBhcmF0ZWQgZm9yIGVhY2ggdGFyZ2V0IHZlcnNpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsQ2hhbmdlczxUPihkYXRhOiBWZXJzaW9uQ2hhbmdlczxUPik6IFRbXSB7XHJcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGRhdGEpXHJcbiAgICAgIC5tYXAodGFyZ2V0VmVyc2lvbiA9PiBnZXRDaGFuZ2VzRm9yVGFyZ2V0KHRhcmdldFZlcnNpb24gYXMgVGFyZ2V0VmVyc2lvbiwgZGF0YSkpXHJcbiAgICAgIC5yZWR1Y2UoKHJlc3VsdCwgdmVyc2lvbkRhdGEpID0+IHJlc3VsdC5jb25jYXQodmVyc2lvbkRhdGEpLCBbXSk7XHJcbn1cclxuIl19