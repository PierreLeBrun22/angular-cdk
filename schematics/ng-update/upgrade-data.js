"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersionUpgradeData = exports.cdkUpgradeData = void 0;
const version_changes_1 = require("../update-tool/version-changes");
const data_1 = require("./data");
/** Upgrade data for the Angular CDK. */
exports.cdkUpgradeData = {
    attributeSelectors: data_1.attributeSelectors,
    classNames: data_1.classNames,
    constructorChecks: data_1.constructorChecks,
    cssSelectors: data_1.cssSelectors,
    elementSelectors: data_1.elementSelectors,
    inputNames: data_1.inputNames,
    methodCallChecks: data_1.methodCallChecks,
    outputNames: data_1.outputNames,
    propertyNames: data_1.propertyNames,
};
/**
 * Gets the reduced upgrade data for the specified data key. The function reads out the
 * target version and upgrade data object from the migration and resolves the specified
 * data portion that is specifically tied to the target version.
 */
function getVersionUpgradeData(migration, dataName) {
    // Note that below we need to cast to `unknown` first TS doesn't infer the type of T correctly.
    return version_changes_1.getChangesForTarget(migration.targetVersion, migration.upgradeData[dataName]);
}
exports.getVersionUpgradeData = getVersionUpgradeData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZS1kYXRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS91cGdyYWRlLWRhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsb0VBQW1HO0FBQ25HLGlDQW1CZ0I7QUFHaEIsd0NBQXdDO0FBQzNCLFFBQUEsY0FBYyxHQUFnQjtJQUN6QyxrQkFBa0IsRUFBbEIseUJBQWtCO0lBQ2xCLFVBQVUsRUFBVixpQkFBVTtJQUNWLGlCQUFpQixFQUFqQix3QkFBaUI7SUFDakIsWUFBWSxFQUFaLG1CQUFZO0lBQ1osZ0JBQWdCLEVBQWhCLHVCQUFnQjtJQUNoQixVQUFVLEVBQVYsaUJBQVU7SUFDVixnQkFBZ0IsRUFBaEIsdUJBQWdCO0lBQ2hCLFdBQVcsRUFBWCxrQkFBVztJQUNYLGFBQWEsRUFBYixvQkFBYTtDQUNkLENBQUM7QUFrQkY7Ozs7R0FJRztBQUNILFNBQ0EscUJBQXFCLENBQ2pCLFNBQWlDLEVBQUUsUUFBVztJQUNoRCwrRkFBK0Y7SUFDL0YsT0FBTyxxQ0FBbUIsQ0FDdEIsU0FBUyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBaUMsQ0FBQyxDQUFDO0FBQ2hHLENBQUM7QUFORCxzREFNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtNaWdyYXRpb259IGZyb20gJy4uL3VwZGF0ZS10b29sL21pZ3JhdGlvbic7XHJcbmltcG9ydCB7Z2V0Q2hhbmdlc0ZvclRhcmdldCwgVmFsdWVPZkNoYW5nZXMsIFZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xyXG5pbXBvcnQge1xyXG4gIGF0dHJpYnV0ZVNlbGVjdG9ycyxcclxuICBBdHRyaWJ1dGVTZWxlY3RvclVwZ3JhZGVEYXRhLFxyXG4gIGNsYXNzTmFtZXMsXHJcbiAgQ2xhc3NOYW1lVXBncmFkZURhdGEsXHJcbiAgY29uc3RydWN0b3JDaGVja3MsXHJcbiAgQ29uc3RydWN0b3JDaGVja3NVcGdyYWRlRGF0YSxcclxuICBjc3NTZWxlY3RvcnMsXHJcbiAgQ3NzU2VsZWN0b3JVcGdyYWRlRGF0YSxcclxuICBlbGVtZW50U2VsZWN0b3JzLFxyXG4gIEVsZW1lbnRTZWxlY3RvclVwZ3JhZGVEYXRhLFxyXG4gIGlucHV0TmFtZXMsXHJcbiAgSW5wdXROYW1lVXBncmFkZURhdGEsXHJcbiAgbWV0aG9kQ2FsbENoZWNrcyxcclxuICBNZXRob2RDYWxsVXBncmFkZURhdGEsXHJcbiAgb3V0cHV0TmFtZXMsXHJcbiAgT3V0cHV0TmFtZVVwZ3JhZGVEYXRhLFxyXG4gIHByb3BlcnR5TmFtZXMsXHJcbiAgUHJvcGVydHlOYW1lVXBncmFkZURhdGEsXHJcbn0gZnJvbSAnLi9kYXRhJztcclxuXHJcblxyXG4vKiogVXBncmFkZSBkYXRhIGZvciB0aGUgQW5ndWxhciBDREsuICovXHJcbmV4cG9ydCBjb25zdCBjZGtVcGdyYWRlRGF0YTogVXBncmFkZURhdGEgPSB7XHJcbiAgYXR0cmlidXRlU2VsZWN0b3JzLFxyXG4gIGNsYXNzTmFtZXMsXHJcbiAgY29uc3RydWN0b3JDaGVja3MsXHJcbiAgY3NzU2VsZWN0b3JzLFxyXG4gIGVsZW1lbnRTZWxlY3RvcnMsXHJcbiAgaW5wdXROYW1lcyxcclxuICBtZXRob2RDYWxsQ2hlY2tzLFxyXG4gIG91dHB1dE5hbWVzLFxyXG4gIHByb3BlcnR5TmFtZXMsXHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIHRoZSB1cGdyYWRlIGRhdGEgdGhhdCBuZWVkcyB0byBiZSBkZWZpbmVkIHdoZW4gdXNpbmcgdGhlIENES1xyXG4gKiB1cGdyYWRlIHJ1bGVzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBVcGdyYWRlRGF0YSB7XHJcbiAgYXR0cmlidXRlU2VsZWN0b3JzOiBWZXJzaW9uQ2hhbmdlczxBdHRyaWJ1dGVTZWxlY3RvclVwZ3JhZGVEYXRhPjtcclxuICBjbGFzc05hbWVzOiBWZXJzaW9uQ2hhbmdlczxDbGFzc05hbWVVcGdyYWRlRGF0YT47XHJcbiAgY29uc3RydWN0b3JDaGVja3M6IFZlcnNpb25DaGFuZ2VzPENvbnN0cnVjdG9yQ2hlY2tzVXBncmFkZURhdGE+O1xyXG4gIGNzc1NlbGVjdG9yczogVmVyc2lvbkNoYW5nZXM8Q3NzU2VsZWN0b3JVcGdyYWRlRGF0YT47XHJcbiAgZWxlbWVudFNlbGVjdG9yczogVmVyc2lvbkNoYW5nZXM8RWxlbWVudFNlbGVjdG9yVXBncmFkZURhdGE+O1xyXG4gIGlucHV0TmFtZXM6IFZlcnNpb25DaGFuZ2VzPElucHV0TmFtZVVwZ3JhZGVEYXRhPjtcclxuICBtZXRob2RDYWxsQ2hlY2tzOiBWZXJzaW9uQ2hhbmdlczxNZXRob2RDYWxsVXBncmFkZURhdGE+O1xyXG4gIG91dHB1dE5hbWVzOiBWZXJzaW9uQ2hhbmdlczxPdXRwdXROYW1lVXBncmFkZURhdGE+O1xyXG4gIHByb3BlcnR5TmFtZXM6IFZlcnNpb25DaGFuZ2VzPFByb3BlcnR5TmFtZVVwZ3JhZGVEYXRhPjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEdldHMgdGhlIHJlZHVjZWQgdXBncmFkZSBkYXRhIGZvciB0aGUgc3BlY2lmaWVkIGRhdGEga2V5LiBUaGUgZnVuY3Rpb24gcmVhZHMgb3V0IHRoZVxyXG4gKiB0YXJnZXQgdmVyc2lvbiBhbmQgdXBncmFkZSBkYXRhIG9iamVjdCBmcm9tIHRoZSBtaWdyYXRpb24gYW5kIHJlc29sdmVzIHRoZSBzcGVjaWZpZWRcclxuICogZGF0YSBwb3J0aW9uIHRoYXQgaXMgc3BlY2lmaWNhbGx5IHRpZWQgdG8gdGhlIHRhcmdldCB2ZXJzaW9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uXHJcbmdldFZlcnNpb25VcGdyYWRlRGF0YTxUIGV4dGVuZHMga2V5b2YgVXBncmFkZURhdGEsIFUgPSBWYWx1ZU9mQ2hhbmdlczxVcGdyYWRlRGF0YVtUXT4+KFxyXG4gICAgbWlncmF0aW9uOiBNaWdyYXRpb248VXBncmFkZURhdGE+LCBkYXRhTmFtZTogVCk6IFVbXSB7XHJcbiAgLy8gTm90ZSB0aGF0IGJlbG93IHdlIG5lZWQgdG8gY2FzdCB0byBgdW5rbm93bmAgZmlyc3QgVFMgZG9lc24ndCBpbmZlciB0aGUgdHlwZSBvZiBUIGNvcnJlY3RseS5cclxuICByZXR1cm4gZ2V0Q2hhbmdlc0ZvclRhcmdldDxVPihcclxuICAgICAgbWlncmF0aW9uLnRhcmdldFZlcnNpb24sIG1pZ3JhdGlvbi51cGdyYWRlRGF0YVtkYXRhTmFtZV0gYXMgdW5rbm93biBhcyBWZXJzaW9uQ2hhbmdlczxVPik7XHJcbn1cclxuIl19