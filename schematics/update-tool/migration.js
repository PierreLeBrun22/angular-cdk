"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration = void 0;
const ts = require("typescript");
class Migration {
    constructor(
    /** TypeScript program for the migration. */
    program, 
    /** TypeChecker instance for the analysis program. */
    typeChecker, 
    /** Version for which the migration rule should run. */
    targetVersion, 
    /** Context data for the migration. */
    context, 
    /** Upgrade data passed to the migration. */
    upgradeData, 
    /** File system that can be used for modifying files. */
    fileSystem, 
    /** Logger that can be used to print messages as part of the migration. */
    logger) {
        this.program = program;
        this.typeChecker = typeChecker;
        this.targetVersion = targetVersion;
        this.context = context;
        this.upgradeData = upgradeData;
        this.fileSystem = fileSystem;
        this.logger = logger;
        /** List of migration failures that need to be reported. */
        this.failures = [];
    }
    /** Method can be used to perform global analysis of the program. */
    init() { }
    /**
     * Method that will be called once all nodes, templates and stylesheets
     * have been visited.
     */
    postAnalysis() { }
    /**
     * Method that will be called for each node in a given source file. Unlike tslint, this
     * function will only retrieve TypeScript nodes that need to be casted manually. This
     * allows us to only walk the program source files once per program and not per
     * migration rule (significant performance boost).
     */
    visitNode(node) { }
    /** Method that will be called for each Angular template in the program. */
    visitTemplate(template) { }
    /** Method that will be called for each stylesheet in the program. */
    visitStylesheet(stylesheet) { }
    /** Creates a failure with a specified message at the given node location. */
    createFailureAtNode(node, message) {
        const sourceFile = node.getSourceFile();
        this.failures.push({
            filePath: this.fileSystem.resolve(sourceFile.fileName),
            position: ts.getLineAndCharacterOfPosition(sourceFile, node.getStart()),
            message: message,
        });
    }
}
exports.Migration = Migration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlncmF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3VwZGF0ZS10b29sL21pZ3JhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUF1QmpDLE1BQXNCLFNBQVM7SUFPN0I7SUFDSSw0Q0FBNEM7SUFDckMsT0FBbUI7SUFDMUIscURBQXFEO0lBQzlDLFdBQTJCO0lBQ2xDLHVEQUF1RDtJQUNoRCxhQUE0QjtJQUNuQyxzQ0FBc0M7SUFDL0IsT0FBZ0I7SUFDdkIsNENBQTRDO0lBQ3JDLFdBQWlCO0lBQ3hCLHdEQUF3RDtJQUNqRCxVQUFzQjtJQUM3QiwwRUFBMEU7SUFDbkUsTUFBb0I7UUFacEIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUVuQixnQkFBVyxHQUFYLFdBQVcsQ0FBZ0I7UUFFM0Isa0JBQWEsR0FBYixhQUFhLENBQWU7UUFFNUIsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUVoQixnQkFBVyxHQUFYLFdBQVcsQ0FBTTtRQUVqQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBRXRCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFwQi9CLDJEQUEyRDtRQUMzRCxhQUFRLEdBQXVCLEVBQUUsQ0FBQztJQW1CQSxDQUFDO0lBRW5DLG9FQUFvRTtJQUNwRSxJQUFJLEtBQVUsQ0FBQztJQUVmOzs7T0FHRztJQUNILFlBQVksS0FBVSxDQUFDO0lBRXZCOzs7OztPQUtHO0lBQ0gsU0FBUyxDQUFDLElBQWEsSUFBUyxDQUFDO0lBRWpDLDJFQUEyRTtJQUMzRSxhQUFhLENBQUMsUUFBMEIsSUFBUyxDQUFDO0lBRWxELHFFQUFxRTtJQUNyRSxlQUFlLENBQUMsVUFBNEIsSUFBUyxDQUFDO0lBRXRELDZFQUE2RTtJQUNuRSxtQkFBbUIsQ0FBQyxJQUFhLEVBQUUsT0FBZTtRQUMxRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7WUFDdEQsUUFBUSxFQUFFLEVBQUUsQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3ZFLE9BQU8sRUFBRSxPQUFPO1NBQ2pCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXZERCw4QkF1REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5pbXBvcnQge1Jlc29sdmVkUmVzb3VyY2V9IGZyb20gJy4vY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvcic7XHJcbmltcG9ydCB7RmlsZVN5c3RlbSwgV29ya3NwYWNlUGF0aH0gZnJvbSAnLi9maWxlLXN5c3RlbSc7XHJcbmltcG9ydCB7VXBkYXRlTG9nZ2VyfSBmcm9tICcuL2xvZ2dlcic7XHJcbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi90YXJnZXQtdmVyc2lvbic7XHJcbmltcG9ydCB7TGluZUFuZENoYXJhY3Rlcn0gZnJvbSAnLi91dGlscy9saW5lLW1hcHBpbmdzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTWlncmF0aW9uRmFpbHVyZSB7XHJcbiAgZmlsZVBhdGg6IFdvcmtzcGFjZVBhdGg7XHJcbiAgbWVzc2FnZTogc3RyaW5nO1xyXG4gIHBvc2l0aW9uPzogTGluZUFuZENoYXJhY3RlcjtcclxufVxyXG5cclxuZXhwb3J0IHR5cGUgUG9zdE1pZ3JhdGlvbkFjdGlvbiA9IHZvaWQgfCB7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIHBhY2thZ2UgbWFuYWdlciBzaG91bGQgcnVuIHVwb24gbWlncmF0aW9uIGNvbXBsZXRpb24uICovXHJcbiAgcnVuUGFja2FnZU1hbmFnZXI6IGJvb2xlYW47XHJcbn07XHJcblxyXG4vKiogQ3JlYXRlcyBhIGNvbnN0cnVjdG9yIHR5cGUgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZS4gKi9cclxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSAobmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gVCk7XHJcbi8qKiBHZXRzIGEgY29uc3RydWN0b3IgdHlwZSBmb3IgdGhlIHBhc3NlZCBtaWdyYXRpb24gZGF0YS4gKi9cclxuZXhwb3J0IHR5cGUgTWlncmF0aW9uQ3RvcjxEYXRhLCBDb250ZXh0ID0gbmV2ZXI+ID0gQ29uc3RydWN0b3I8TWlncmF0aW9uPERhdGEsIENvbnRleHQ+PjtcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNaWdyYXRpb248RGF0YSwgQ29udGV4dCA9IG5ldmVyPiB7XHJcbiAgLyoqIExpc3Qgb2YgbWlncmF0aW9uIGZhaWx1cmVzIHRoYXQgbmVlZCB0byBiZSByZXBvcnRlZC4gKi9cclxuICBmYWlsdXJlczogTWlncmF0aW9uRmFpbHVyZVtdID0gW107XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBtaWdyYXRpb24gaXMgZW5hYmxlZCBvciBub3QuICovXHJcbiAgYWJzdHJhY3QgZW5hYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICAgIC8qKiBUeXBlU2NyaXB0IHByb2dyYW0gZm9yIHRoZSBtaWdyYXRpb24uICovXHJcbiAgICAgIHB1YmxpYyBwcm9ncmFtOiB0cy5Qcm9ncmFtLFxyXG4gICAgICAvKiogVHlwZUNoZWNrZXIgaW5zdGFuY2UgZm9yIHRoZSBhbmFseXNpcyBwcm9ncmFtLiAqL1xyXG4gICAgICBwdWJsaWMgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLFxyXG4gICAgICAvKiogVmVyc2lvbiBmb3Igd2hpY2ggdGhlIG1pZ3JhdGlvbiBydWxlIHNob3VsZCBydW4uICovXHJcbiAgICAgIHB1YmxpYyB0YXJnZXRWZXJzaW9uOiBUYXJnZXRWZXJzaW9uLFxyXG4gICAgICAvKiogQ29udGV4dCBkYXRhIGZvciB0aGUgbWlncmF0aW9uLiAqL1xyXG4gICAgICBwdWJsaWMgY29udGV4dDogQ29udGV4dCxcclxuICAgICAgLyoqIFVwZ3JhZGUgZGF0YSBwYXNzZWQgdG8gdGhlIG1pZ3JhdGlvbi4gKi9cclxuICAgICAgcHVibGljIHVwZ3JhZGVEYXRhOiBEYXRhLFxyXG4gICAgICAvKiogRmlsZSBzeXN0ZW0gdGhhdCBjYW4gYmUgdXNlZCBmb3IgbW9kaWZ5aW5nIGZpbGVzLiAqL1xyXG4gICAgICBwdWJsaWMgZmlsZVN5c3RlbTogRmlsZVN5c3RlbSxcclxuICAgICAgLyoqIExvZ2dlciB0aGF0IGNhbiBiZSB1c2VkIHRvIHByaW50IG1lc3NhZ2VzIGFzIHBhcnQgb2YgdGhlIG1pZ3JhdGlvbi4gKi9cclxuICAgICAgcHVibGljIGxvZ2dlcjogVXBkYXRlTG9nZ2VyKSB7fVxyXG5cclxuICAvKiogTWV0aG9kIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gZ2xvYmFsIGFuYWx5c2lzIG9mIHRoZSBwcm9ncmFtLiAqL1xyXG4gIGluaXQoKTogdm9pZCB7fVxyXG5cclxuICAvKipcclxuICAgKiBNZXRob2QgdGhhdCB3aWxsIGJlIGNhbGxlZCBvbmNlIGFsbCBub2RlcywgdGVtcGxhdGVzIGFuZCBzdHlsZXNoZWV0c1xyXG4gICAqIGhhdmUgYmVlbiB2aXNpdGVkLlxyXG4gICAqL1xyXG4gIHBvc3RBbmFseXNpcygpOiB2b2lkIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIG5vZGUgaW4gYSBnaXZlbiBzb3VyY2UgZmlsZS4gVW5saWtlIHRzbGludCwgdGhpc1xyXG4gICAqIGZ1bmN0aW9uIHdpbGwgb25seSByZXRyaWV2ZSBUeXBlU2NyaXB0IG5vZGVzIHRoYXQgbmVlZCB0byBiZSBjYXN0ZWQgbWFudWFsbHkuIFRoaXNcclxuICAgKiBhbGxvd3MgdXMgdG8gb25seSB3YWxrIHRoZSBwcm9ncmFtIHNvdXJjZSBmaWxlcyBvbmNlIHBlciBwcm9ncmFtIGFuZCBub3QgcGVyXHJcbiAgICogbWlncmF0aW9uIHJ1bGUgKHNpZ25pZmljYW50IHBlcmZvcm1hbmNlIGJvb3N0KS5cclxuICAgKi9cclxuICB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSk6IHZvaWQge31cclxuXHJcbiAgLyoqIE1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIEFuZ3VsYXIgdGVtcGxhdGUgaW4gdGhlIHByb2dyYW0uICovXHJcbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogUmVzb2x2ZWRSZXNvdXJjZSk6IHZvaWQge31cclxuXHJcbiAgLyoqIE1ldGhvZCB0aGF0IHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIHN0eWxlc2hlZXQgaW4gdGhlIHByb2dyYW0uICovXHJcbiAgdmlzaXRTdHlsZXNoZWV0KHN0eWxlc2hlZXQ6IFJlc29sdmVkUmVzb3VyY2UpOiB2b2lkIHt9XHJcblxyXG4gIC8qKiBDcmVhdGVzIGEgZmFpbHVyZSB3aXRoIGEgc3BlY2lmaWVkIG1lc3NhZ2UgYXQgdGhlIGdpdmVuIG5vZGUgbG9jYXRpb24uICovXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZUZhaWx1cmVBdE5vZGUobm9kZTogdHMuTm9kZSwgbWVzc2FnZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XHJcbiAgICB0aGlzLmZhaWx1cmVzLnB1c2goe1xyXG4gICAgICBmaWxlUGF0aDogdGhpcy5maWxlU3lzdGVtLnJlc29sdmUoc291cmNlRmlsZS5maWxlTmFtZSksXHJcbiAgICAgIHBvc2l0aW9uOiB0cy5nZXRMaW5lQW5kQ2hhcmFjdGVyT2ZQb3NpdGlvbihzb3VyY2VGaWxlLCBub2RlLmdldFN0YXJ0KCkpLFxyXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==