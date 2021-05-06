"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassNamesMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const imports_1 = require("../typescript/imports");
const module_specifiers_1 = require("../typescript/module-specifiers");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that walks through every identifier that is part of Angular Material or thr CDK
 * and replaces the outdated name with the new one if specified in the upgrade data.
 */
// TODO: rework this rule to identify symbols using the import identifier resolver. This
// makes it more robust, less AST convoluted and is more TypeScript AST idiomatic. COMP-300.
class ClassNamesMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = upgrade_data_1.getVersionUpgradeData(this, 'classNames');
        /**
         * List of identifier names that have been imported from `@angular/material` or `@angular/cdk`
         * in the current source file and therefore can be considered trusted.
         */
        this.trustedIdentifiers = new Set();
        /** List of namespaces that have been imported from `@angular/material` or `@angular/cdk`. */
        this.trustedNamespaces = new Set();
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isIdentifier(node)) {
            this._visitIdentifier(node);
        }
    }
    /** Method that is called for every identifier inside of the specified project. */
    _visitIdentifier(identifier) {
        // For identifiers that aren't listed in the className data, the whole check can be
        // skipped safely.
        if (!this.data.some(data => data.replace === identifier.text)) {
            return;
        }
        // For namespace imports that are referring to Angular Material or the CDK, we store the
        // namespace name in order to be able to safely find identifiers that don't belong to the
        // developer's application.
        if (imports_1.isNamespaceImportNode(identifier) && module_specifiers_1.isMaterialImportDeclaration(identifier)) {
            this.trustedNamespaces.add(identifier.text);
            return this._createFailureWithReplacement(identifier);
        }
        // For export declarations that are referring to Angular Material or the CDK, the identifier
        // can be immediately updated to the new name.
        if (imports_1.isExportSpecifierNode(identifier) && module_specifiers_1.isMaterialExportDeclaration(identifier)) {
            return this._createFailureWithReplacement(identifier);
        }
        // For import declarations that are referring to Angular Material or the CDK, the name of
        // the import identifiers. This allows us to identify identifiers that belong to Material and
        // the CDK, and we won't accidentally touch a developer's identifier.
        if (imports_1.isImportSpecifierNode(identifier) && module_specifiers_1.isMaterialImportDeclaration(identifier)) {
            this.trustedIdentifiers.add(identifier.text);
            return this._createFailureWithReplacement(identifier);
        }
        // In case the identifier is part of a property access expression, we need to verify that the
        // property access originates from a namespace that has been imported from Material or the CDK.
        if (ts.isPropertyAccessExpression(identifier.parent)) {
            const expression = identifier.parent.expression;
            if (ts.isIdentifier(expression) && this.trustedNamespaces.has(expression.text)) {
                return this._createFailureWithReplacement(identifier);
            }
        }
        else if (this.trustedIdentifiers.has(identifier.text)) {
            return this._createFailureWithReplacement(identifier);
        }
    }
    /** Creates a failure and replacement for the specified identifier. */
    _createFailureWithReplacement(identifier) {
        const classData = this.data.find(data => data.replace === identifier.text);
        const filePath = this.fileSystem.resolve(identifier.getSourceFile().fileName);
        this.fileSystem.edit(filePath)
            .remove(identifier.getStart(), identifier.getWidth())
            .insertRight(identifier.getStart(), classData.replaceWith);
    }
}
exports.ClassNamesMigration = ClassNamesMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvY2xhc3MtbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBQ2pDLDJEQUFzRDtBQUd0RCxtREFJK0I7QUFDL0IsdUVBR3lDO0FBQ3pDLGtEQUFtRTtBQUVuRTs7O0dBR0c7QUFDSCx3RkFBd0Y7QUFDeEYsNEZBQTRGO0FBQzVGLE1BQWEsbUJBQW9CLFNBQVEscUJBQXNCO0lBQS9EOztRQUNFLGlFQUFpRTtRQUNqRSxTQUFJLEdBQTJCLG9DQUFxQixDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztRQUV6RTs7O1dBR0c7UUFDSCx1QkFBa0IsR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUU1Qyw2RkFBNkY7UUFDN0Ysc0JBQWlCLEdBQWdCLElBQUksR0FBRyxFQUFFLENBQUM7UUFFM0MsMkRBQTJEO1FBQzNELFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUE4RG5DLENBQUM7SUE1REMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRCxrRkFBa0Y7SUFDMUUsZ0JBQWdCLENBQUMsVUFBeUI7UUFDaEQsbUZBQW1GO1FBQ25GLGtCQUFrQjtRQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM3RCxPQUFPO1NBQ1I7UUFFRCx3RkFBd0Y7UUFDeEYseUZBQXlGO1FBQ3pGLDJCQUEyQjtRQUMzQixJQUFJLCtCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLCtDQUEyQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2hGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTVDLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQsNEZBQTRGO1FBQzVGLDhDQUE4QztRQUM5QyxJQUFJLCtCQUFxQixDQUFDLFVBQVUsQ0FBQyxJQUFJLCtDQUEyQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2hGLE9BQU8sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ3ZEO1FBRUQseUZBQXlGO1FBQ3pGLDZGQUE2RjtRQUM3RixxRUFBcUU7UUFDckUsSUFBSSwrQkFBcUIsQ0FBQyxVQUFVLENBQUMsSUFBSSwrQ0FBMkIsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNoRixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUU3QyxPQUFPLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN2RDtRQUVELDZGQUE2RjtRQUM3RiwrRkFBK0Y7UUFDL0YsSUFBSSxFQUFFLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3BELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1lBRWhELElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUUsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdkQ7U0FDRjthQUFNLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkQsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkQ7SUFDSCxDQUFDO0lBRUQsc0VBQXNFO0lBQzlELDZCQUE2QixDQUFDLFVBQXlCO1FBQzdELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFFLENBQUM7UUFDNUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTlFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUMzQixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNwRCxXQUFXLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0Y7QUE1RUQsa0RBNEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuaW1wb3J0IHtNaWdyYXRpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL21pZ3JhdGlvbic7XHJcblxyXG5pbXBvcnQge0NsYXNzTmFtZVVwZ3JhZGVEYXRhfSBmcm9tICcuLi9kYXRhJztcclxuaW1wb3J0IHtcclxuICBpc0V4cG9ydFNwZWNpZmllck5vZGUsXHJcbiAgaXNJbXBvcnRTcGVjaWZpZXJOb2RlLFxyXG4gIGlzTmFtZXNwYWNlSW1wb3J0Tm9kZSxcclxufSBmcm9tICcuLi90eXBlc2NyaXB0L2ltcG9ydHMnO1xyXG5pbXBvcnQge1xyXG4gIGlzTWF0ZXJpYWxFeHBvcnREZWNsYXJhdGlvbixcclxuICBpc01hdGVyaWFsSW1wb3J0RGVjbGFyYXRpb24sXHJcbn0gZnJvbSAnLi4vdHlwZXNjcmlwdC9tb2R1bGUtc3BlY2lmaWVycyc7XHJcbmltcG9ydCB7Z2V0VmVyc2lvblVwZ3JhZGVEYXRhLCBVcGdyYWRlRGF0YX0gZnJvbSAnLi4vdXBncmFkZS1kYXRhJztcclxuXHJcbi8qKlxyXG4gKiBNaWdyYXRpb24gdGhhdCB3YWxrcyB0aHJvdWdoIGV2ZXJ5IGlkZW50aWZpZXIgdGhhdCBpcyBwYXJ0IG9mIEFuZ3VsYXIgTWF0ZXJpYWwgb3IgdGhyIENES1xyXG4gKiBhbmQgcmVwbGFjZXMgdGhlIG91dGRhdGVkIG5hbWUgd2l0aCB0aGUgbmV3IG9uZSBpZiBzcGVjaWZpZWQgaW4gdGhlIHVwZ3JhZGUgZGF0YS5cclxuICovXHJcbi8vIFRPRE86IHJld29yayB0aGlzIHJ1bGUgdG8gaWRlbnRpZnkgc3ltYm9scyB1c2luZyB0aGUgaW1wb3J0IGlkZW50aWZpZXIgcmVzb2x2ZXIuIFRoaXNcclxuLy8gbWFrZXMgaXQgbW9yZSByb2J1c3QsIGxlc3MgQVNUIGNvbnZvbHV0ZWQgYW5kIGlzIG1vcmUgVHlwZVNjcmlwdCBBU1QgaWRpb21hdGljLiBDT01QLTMwMC5cclxuZXhwb3J0IGNsYXNzIENsYXNzTmFtZXNNaWdyYXRpb24gZXh0ZW5kcyBNaWdyYXRpb248VXBncmFkZURhdGE+IHtcclxuICAvKiogQ2hhbmdlIGRhdGEgdGhhdCB1cGdyYWRlcyB0byB0aGUgc3BlY2lmaWVkIHRhcmdldCB2ZXJzaW9uLiAqL1xyXG4gIGRhdGE6IENsYXNzTmFtZVVwZ3JhZGVEYXRhW10gPSBnZXRWZXJzaW9uVXBncmFkZURhdGEodGhpcywgJ2NsYXNzTmFtZXMnKTtcclxuXHJcbiAgLyoqXHJcbiAgICogTGlzdCBvZiBpZGVudGlmaWVyIG5hbWVzIHRoYXQgaGF2ZSBiZWVuIGltcG9ydGVkIGZyb20gYEBhbmd1bGFyL21hdGVyaWFsYCBvciBgQGFuZ3VsYXIvY2RrYFxyXG4gICAqIGluIHRoZSBjdXJyZW50IHNvdXJjZSBmaWxlIGFuZCB0aGVyZWZvcmUgY2FuIGJlIGNvbnNpZGVyZWQgdHJ1c3RlZC5cclxuICAgKi9cclxuICB0cnVzdGVkSWRlbnRpZmllcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xyXG5cclxuICAvKiogTGlzdCBvZiBuYW1lc3BhY2VzIHRoYXQgaGF2ZSBiZWVuIGltcG9ydGVkIGZyb20gYEBhbmd1bGFyL21hdGVyaWFsYCBvciBgQGFuZ3VsYXIvY2RrYC4gKi9cclxuICB0cnVzdGVkTmFtZXNwYWNlczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XHJcblxyXG4gIC8vIE9ubHkgZW5hYmxlIHRoZSBtaWdyYXRpb24gcnVsZSBpZiB0aGVyZSBpcyB1cGdyYWRlIGRhdGEuXHJcbiAgZW5hYmxlZCA9IHRoaXMuZGF0YS5sZW5ndGggIT09IDA7XHJcblxyXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XHJcbiAgICBpZiAodHMuaXNJZGVudGlmaWVyKG5vZGUpKSB7XHJcbiAgICAgIHRoaXMuX3Zpc2l0SWRlbnRpZmllcihub2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBNZXRob2QgdGhhdCBpcyBjYWxsZWQgZm9yIGV2ZXJ5IGlkZW50aWZpZXIgaW5zaWRlIG9mIHRoZSBzcGVjaWZpZWQgcHJvamVjdC4gKi9cclxuICBwcml2YXRlIF92aXNpdElkZW50aWZpZXIoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcikge1xyXG4gICAgLy8gRm9yIGlkZW50aWZpZXJzIHRoYXQgYXJlbid0IGxpc3RlZCBpbiB0aGUgY2xhc3NOYW1lIGRhdGEsIHRoZSB3aG9sZSBjaGVjayBjYW4gYmVcclxuICAgIC8vIHNraXBwZWQgc2FmZWx5LlxyXG4gICAgaWYgKCF0aGlzLmRhdGEuc29tZShkYXRhID0+IGRhdGEucmVwbGFjZSA9PT0gaWRlbnRpZmllci50ZXh0KSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRm9yIG5hbWVzcGFjZSBpbXBvcnRzIHRoYXQgYXJlIHJlZmVycmluZyB0byBBbmd1bGFyIE1hdGVyaWFsIG9yIHRoZSBDREssIHdlIHN0b3JlIHRoZVxyXG4gICAgLy8gbmFtZXNwYWNlIG5hbWUgaW4gb3JkZXIgdG8gYmUgYWJsZSB0byBzYWZlbHkgZmluZCBpZGVudGlmaWVycyB0aGF0IGRvbid0IGJlbG9uZyB0byB0aGVcclxuICAgIC8vIGRldmVsb3BlcidzIGFwcGxpY2F0aW9uLlxyXG4gICAgaWYgKGlzTmFtZXNwYWNlSW1wb3J0Tm9kZShpZGVudGlmaWVyKSAmJiBpc01hdGVyaWFsSW1wb3J0RGVjbGFyYXRpb24oaWRlbnRpZmllcikpIHtcclxuICAgICAgdGhpcy50cnVzdGVkTmFtZXNwYWNlcy5hZGQoaWRlbnRpZmllci50ZXh0KTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVGYWlsdXJlV2l0aFJlcGxhY2VtZW50KGlkZW50aWZpZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZvciBleHBvcnQgZGVjbGFyYXRpb25zIHRoYXQgYXJlIHJlZmVycmluZyB0byBBbmd1bGFyIE1hdGVyaWFsIG9yIHRoZSBDREssIHRoZSBpZGVudGlmaWVyXHJcbiAgICAvLyBjYW4gYmUgaW1tZWRpYXRlbHkgdXBkYXRlZCB0byB0aGUgbmV3IG5hbWUuXHJcbiAgICBpZiAoaXNFeHBvcnRTcGVjaWZpZXJOb2RlKGlkZW50aWZpZXIpICYmIGlzTWF0ZXJpYWxFeHBvcnREZWNsYXJhdGlvbihpZGVudGlmaWVyKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fY3JlYXRlRmFpbHVyZVdpdGhSZXBsYWNlbWVudChpZGVudGlmaWVyKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGb3IgaW1wb3J0IGRlY2xhcmF0aW9ucyB0aGF0IGFyZSByZWZlcnJpbmcgdG8gQW5ndWxhciBNYXRlcmlhbCBvciB0aGUgQ0RLLCB0aGUgbmFtZSBvZlxyXG4gICAgLy8gdGhlIGltcG9ydCBpZGVudGlmaWVycy4gVGhpcyBhbGxvd3MgdXMgdG8gaWRlbnRpZnkgaWRlbnRpZmllcnMgdGhhdCBiZWxvbmcgdG8gTWF0ZXJpYWwgYW5kXHJcbiAgICAvLyB0aGUgQ0RLLCBhbmQgd2Ugd29uJ3QgYWNjaWRlbnRhbGx5IHRvdWNoIGEgZGV2ZWxvcGVyJ3MgaWRlbnRpZmllci5cclxuICAgIGlmIChpc0ltcG9ydFNwZWNpZmllck5vZGUoaWRlbnRpZmllcikgJiYgaXNNYXRlcmlhbEltcG9ydERlY2xhcmF0aW9uKGlkZW50aWZpZXIpKSB7XHJcbiAgICAgIHRoaXMudHJ1c3RlZElkZW50aWZpZXJzLmFkZChpZGVudGlmaWVyLnRleHQpO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuX2NyZWF0ZUZhaWx1cmVXaXRoUmVwbGFjZW1lbnQoaWRlbnRpZmllcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW4gY2FzZSB0aGUgaWRlbnRpZmllciBpcyBwYXJ0IG9mIGEgcHJvcGVydHkgYWNjZXNzIGV4cHJlc3Npb24sIHdlIG5lZWQgdG8gdmVyaWZ5IHRoYXQgdGhlXHJcbiAgICAvLyBwcm9wZXJ0eSBhY2Nlc3Mgb3JpZ2luYXRlcyBmcm9tIGEgbmFtZXNwYWNlIHRoYXQgaGFzIGJlZW4gaW1wb3J0ZWQgZnJvbSBNYXRlcmlhbCBvciB0aGUgQ0RLLlxyXG4gICAgaWYgKHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKGlkZW50aWZpZXIucGFyZW50KSkge1xyXG4gICAgICBjb25zdCBleHByZXNzaW9uID0gaWRlbnRpZmllci5wYXJlbnQuZXhwcmVzc2lvbjtcclxuXHJcbiAgICAgIGlmICh0cy5pc0lkZW50aWZpZXIoZXhwcmVzc2lvbikgJiYgdGhpcy50cnVzdGVkTmFtZXNwYWNlcy5oYXMoZXhwcmVzc2lvbi50ZXh0KSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVGYWlsdXJlV2l0aFJlcGxhY2VtZW50KGlkZW50aWZpZXIpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMudHJ1c3RlZElkZW50aWZpZXJzLmhhcyhpZGVudGlmaWVyLnRleHQpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVGYWlsdXJlV2l0aFJlcGxhY2VtZW50KGlkZW50aWZpZXIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENyZWF0ZXMgYSBmYWlsdXJlIGFuZCByZXBsYWNlbWVudCBmb3IgdGhlIHNwZWNpZmllZCBpZGVudGlmaWVyLiAqL1xyXG4gIHByaXZhdGUgX2NyZWF0ZUZhaWx1cmVXaXRoUmVwbGFjZW1lbnQoaWRlbnRpZmllcjogdHMuSWRlbnRpZmllcikge1xyXG4gICAgY29uc3QgY2xhc3NEYXRhID0gdGhpcy5kYXRhLmZpbmQoZGF0YSA9PiBkYXRhLnJlcGxhY2UgPT09IGlkZW50aWZpZXIudGV4dCkhO1xyXG4gICAgY29uc3QgZmlsZVBhdGggPSB0aGlzLmZpbGVTeXN0ZW0ucmVzb2x2ZShpZGVudGlmaWVyLmdldFNvdXJjZUZpbGUoKS5maWxlTmFtZSk7XHJcblxyXG4gICAgdGhpcy5maWxlU3lzdGVtLmVkaXQoZmlsZVBhdGgpXHJcbiAgICAgIC5yZW1vdmUoaWRlbnRpZmllci5nZXRTdGFydCgpLCBpZGVudGlmaWVyLmdldFdpZHRoKCkpXHJcbiAgICAgIC5pbnNlcnRSaWdodChpZGVudGlmaWVyLmdldFN0YXJ0KCksIGNsYXNzRGF0YS5yZXBsYWNlV2l0aCk7XHJcbiAgfVxyXG59XHJcbiJdfQ==