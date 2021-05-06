"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstructorSignatureMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const version_changes_1 = require("../../update-tool/version-changes");
/**
 * List of diagnostic codes that refer to pre-emit diagnostics which indicate invalid
 * new expression or super call signatures. See the list of diagnostics here:
 *
 * https://github.com/Microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json
 */
const signatureErrorDiagnostics = [
    // Type not assignable error diagnostic.
    2345,
    // Constructor argument length invalid diagnostics
    2554,
    2555,
    2556,
    2557,
];
/**
 * Migration that visits every TypeScript new expression or super call and checks if
 * the parameter type signature is invalid and needs to be updated manually.
 */
class ConstructorSignatureMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        // Note that the data for this rule is not distinguished based on the target version because
        // we don't keep track of the new signature and don't want to update incrementally.
        // See: https://github.com/angular/components/pull/12970#issuecomment-418337566
        this.data = version_changes_1.getAllChanges(this.upgradeData.constructorChecks);
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isSourceFile(node)) {
            this._visitSourceFile(node);
        }
    }
    /**
     * Method that will be called for each source file of the upgrade project. In order to
     * properly determine invalid constructor signatures, we take advantage of the pre-emit
     * diagnostics from TypeScript.
     *
     * By using the diagnostics, the migration can handle type assignability. Not using
     * diagnostics would mean that we need to use simple type equality checking which is
     * too strict. See related issue: https://github.com/Microsoft/TypeScript/issues/9879
     */
    _visitSourceFile(sourceFile) {
        // List of classes of which the constructor signature has changed.
        const diagnostics = ts.getPreEmitDiagnostics(this.program, sourceFile)
            .filter(diagnostic => signatureErrorDiagnostics.includes(diagnostic.code))
            .filter(diagnostic => diagnostic.start !== undefined);
        for (const diagnostic of diagnostics) {
            const node = findConstructorNode(diagnostic, sourceFile);
            if (!node) {
                continue;
            }
            const classType = this.typeChecker.getTypeAtLocation(node.expression);
            const className = classType.symbol && classType.symbol.name;
            const isNewExpression = ts.isNewExpression(node);
            // Determine the class names of the actual construct signatures because we cannot assume that
            // the diagnostic refers to a constructor of the actual expression. In case the constructor
            // is inherited, we need to detect that the owner-class of the constructor is added to the
            // constructor checks upgrade data. e.g. `class CustomCalendar extends MatCalendar {}`.
            const signatureClassNames = classType.getConstructSignatures()
                .map(signature => getClassDeclarationOfSignature(signature))
                .map(declaration => declaration && declaration.name ? declaration.name.text : null)
                .filter(Boolean);
            // Besides checking the signature class names, we need to check the actual class name because
            // there can be classes without an explicit constructor.
            if (!this.data.includes(className) &&
                !signatureClassNames.some(name => this.data.includes(name))) {
                continue;
            }
            const classSignatures = classType.getConstructSignatures().map(signature => getParameterTypesFromSignature(signature, this.typeChecker));
            const expressionName = isNewExpression ? `new ${className}` : 'super';
            const signatures = classSignatures.map(signature => signature.map(t => this.typeChecker.typeToString(t)))
                .map(signature => `${expressionName}(${signature.join(', ')})`)
                .join(' or ');
            this.createFailureAtNode(node, `Found "${className}" constructed with ` +
                `an invalid signature. Please manually update the ${expressionName} expression to ` +
                `match the new signature${classSignatures.length > 1 ? 's' : ''}: ${signatures}`);
        }
    }
}
exports.ConstructorSignatureMigration = ConstructorSignatureMigration;
/** Resolves the type for each parameter in the specified signature. */
function getParameterTypesFromSignature(signature, typeChecker) {
    return signature.getParameters().map(param => typeChecker.getTypeAtLocation(param.declarations[0]));
}
/**
 * Walks through each node of a source file in order to find a new-expression node or super-call
 * expression node that is captured by the specified diagnostic.
 */
function findConstructorNode(diagnostic, sourceFile) {
    let resolvedNode = null;
    const _visitNode = (node) => {
        // Check whether the current node contains the diagnostic. If the node contains the diagnostic,
        // walk deeper in order to find all constructor expression nodes.
        if (node.getStart() <= diagnostic.start && node.getEnd() >= diagnostic.start) {
            if (ts.isNewExpression(node) ||
                (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword)) {
                resolvedNode = node;
            }
            ts.forEachChild(node, _visitNode);
        }
    };
    ts.forEachChild(sourceFile, _visitNode);
    return resolvedNode;
}
/** Determines the class declaration of the specified construct signature. */
function getClassDeclarationOfSignature(signature) {
    let node = signature.getDeclaration();
    // Handle signatures which don't have an actual declaration. This happens if a class
    // does not have an explicitly written constructor.
    if (!node) {
        return null;
    }
    while (!ts.isSourceFile(node = node.parent)) {
        if (ts.isClassDeclaration(node)) {
            return node;
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0b3Itc2lnbmF0dXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL2NvbnN0cnVjdG9yLXNpZ25hdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUFDakMsMkRBQXNEO0FBQ3RELHVFQUFnRTtBQUdoRTs7Ozs7R0FLRztBQUNILE1BQU0seUJBQXlCLEdBQUc7SUFDaEMsd0NBQXdDO0lBQ3hDLElBQUk7SUFDSixrREFBa0Q7SUFDbEQsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSTtDQUNMLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFhLDZCQUE4QixTQUFRLHFCQUFzQjtJQUF6RTs7UUFDRSw0RkFBNEY7UUFDNUYsbUZBQW1GO1FBQ25GLCtFQUErRTtRQUMvRSxTQUFJLEdBQUcsK0JBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFekQsMkRBQTJEO1FBQzNELFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFvRW5DLENBQUM7SUFsRUMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNLLGdCQUFnQixDQUFDLFVBQXlCO1FBQ2hELGtFQUFrRTtRQUNsRSxNQUFNLFdBQVcsR0FDYixFQUFFLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7YUFDN0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMs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O1FBQzNDLElBQUksRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQy9CLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7TWlncmF0aW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9taWdyYXRpb24nO1xyXG5pbXBvcnQge2dldEFsbENoYW5nZXN9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcyc7XHJcbmltcG9ydCB7VXBncmFkZURhdGF9IGZyb20gJy4uL3VwZ3JhZGUtZGF0YSc7XHJcblxyXG4vKipcclxuICogTGlzdCBvZiBkaWFnbm9zdGljIGNvZGVzIHRoYXQgcmVmZXIgdG8gcHJlLWVtaXQgZGlhZ25vc3RpY3Mgd2hpY2ggaW5kaWNhdGUgaW52YWxpZFxyXG4gKiBuZXcgZXhwcmVzc2lvbiBvciBzdXBlciBjYWxsIHNpZ25hdHVyZXMuIFNlZSB0aGUgbGlzdCBvZiBkaWFnbm9zdGljcyBoZXJlOlxyXG4gKlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvYmxvYi9tYXN0ZXIvc3JjL2NvbXBpbGVyL2RpYWdub3N0aWNNZXNzYWdlcy5qc29uXHJcbiAqL1xyXG5jb25zdCBzaWduYXR1cmVFcnJvckRpYWdub3N0aWNzID0gW1xyXG4gIC8vIFR5cGUgbm90IGFzc2lnbmFibGUgZXJyb3IgZGlhZ25vc3RpYy5cclxuICAyMzQ1LFxyXG4gIC8vIENvbnN0cnVjdG9yIGFyZ3VtZW50IGxlbmd0aCBpbnZhbGlkIGRpYWdub3N0aWNzXHJcbiAgMjU1NCxcclxuICAyNTU1LFxyXG4gIDI1NTYsXHJcbiAgMjU1NyxcclxuXTtcclxuXHJcbi8qKlxyXG4gKiBNaWdyYXRpb24gdGhhdCB2aXNpdHMgZXZlcnkgVHlwZVNjcmlwdCBuZXcgZXhwcmVzc2lvbiBvciBzdXBlciBjYWxsIGFuZCBjaGVja3MgaWZcclxuICogdGhlIHBhcmFtZXRlciB0eXBlIHNpZ25hdHVyZSBpcyBpbnZhbGlkIGFuZCBuZWVkcyB0byBiZSB1cGRhdGVkIG1hbnVhbGx5LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbnN0cnVjdG9yU2lnbmF0dXJlTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPFVwZ3JhZGVEYXRhPiB7XHJcbiAgLy8gTm90ZSB0aGF0IHRoZSBkYXRhIGZvciB0aGlzIHJ1bGUgaXMgbm90IGRpc3Rpbmd1aXNoZWQgYmFzZWQgb24gdGhlIHRhcmdldCB2ZXJzaW9uIGJlY2F1c2VcclxuICAvLyB3ZSBkb24ndCBrZWVwIHRyYWNrIG9mIHRoZSBuZXcgc2lnbmF0dXJlIGFuZCBkb24ndCB3YW50IHRvIHVwZGF0ZSBpbmNyZW1lbnRhbGx5LlxyXG4gIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEyOTcwI2lzc3VlY29tbWVudC00MTgzMzc1NjZcclxuICBkYXRhID0gZ2V0QWxsQ2hhbmdlcyh0aGlzLnVwZ3JhZGVEYXRhLmNvbnN0cnVjdG9yQ2hlY2tzKTtcclxuXHJcbiAgLy8gT25seSBlbmFibGUgdGhlIG1pZ3JhdGlvbiBydWxlIGlmIHRoZXJlIGlzIHVwZ3JhZGUgZGF0YS5cclxuICBlbmFibGVkID0gdGhpcy5kYXRhLmxlbmd0aCAhPT0gMDtcclxuXHJcbiAgdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcclxuICAgIGlmICh0cy5pc1NvdXJjZUZpbGUobm9kZSkpIHtcclxuICAgICAgdGhpcy5fdmlzaXRTb3VyY2VGaWxlKG5vZGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWV0aG9kIHRoYXQgd2lsbCBiZSBjYWxsZWQgZm9yIGVhY2ggc291cmNlIGZpbGUgb2YgdGhlIHVwZ3JhZGUgcHJvamVjdC4gSW4gb3JkZXIgdG9cclxuICAgKiBwcm9wZXJseSBkZXRlcm1pbmUgaW52YWxpZCBjb25zdHJ1Y3RvciBzaWduYXR1cmVzLCB3ZSB0YWtlIGFkdmFudGFnZSBvZiB0aGUgcHJlLWVtaXRcclxuICAgKiBkaWFnbm9zdGljcyBmcm9tIFR5cGVTY3JpcHQuXHJcbiAgICpcclxuICAgKiBCeSB1c2luZyB0aGUgZGlhZ25vc3RpY3MsIHRoZSBtaWdyYXRpb24gY2FuIGhhbmRsZSB0eXBlIGFzc2lnbmFiaWxpdHkuIE5vdCB1c2luZ1xyXG4gICAqIGRpYWdub3N0aWNzIHdvdWxkIG1lYW4gdGhhdCB3ZSBuZWVkIHRvIHVzZSBzaW1wbGUgdHlwZSBlcXVhbGl0eSBjaGVja2luZyB3aGljaCBpc1xyXG4gICAqIHRvbyBzdHJpY3QuIFNlZSByZWxhdGVkIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzk4NzlcclxuICAgKi9cclxuICBwcml2YXRlIF92aXNpdFNvdXJjZUZpbGUoc291cmNlRmlsZTogdHMuU291cmNlRmlsZSkge1xyXG4gICAgLy8gTGlzdCBvZiBjbGFzc2VzIG9mIHdoaWNoIHRoZSBjb25zdHJ1Y3RvciBzaWduYXR1cmUgaGFzIGNoYW5nZWQuXHJcbiAgICBjb25zdCBkaWFnbm9zdGljcyA9XHJcbiAgICAgICAgdHMuZ2V0UHJlRW1pdERpYWdub3N0aWNzKHRoaXMucHJvZ3JhbSwgc291cmNlRmlsZSlcclxuICAgICAgICAgICAgLmZpbHRlcihkaWFnbm9zdGljID0+IHNpZ25hdHVyZUVycm9yRGlhZ25vc3RpY3MuaW5jbHVkZXMoZGlhZ25vc3RpYy5jb2RlKSlcclxuICAgICAgICAgICAgLmZpbHRlcihkaWFnbm9zdGljID0+IGRpYWdub3N0aWMuc3RhcnQgIT09IHVuZGVmaW5lZCk7XHJcblxyXG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGRpYWdub3N0aWNzKSB7XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBmaW5kQ29uc3RydWN0b3JOb2RlKGRpYWdub3N0aWMsIHNvdXJjZUZpbGUpO1xyXG5cclxuICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGNsYXNzVHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24obm9kZS5leHByZXNzaW9uKTtcclxuICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NUeXBlLnN5bWJvbCAmJiBjbGFzc1R5cGUuc3ltYm9sLm5hbWU7XHJcbiAgICAgIGNvbnN0IGlzTmV3RXhwcmVzc2lvbiA9IHRzLmlzTmV3RXhwcmVzc2lvbihub2RlKTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB0aGUgY2xhc3MgbmFtZXMgb2YgdGhlIGFjdHVhbCBjb25zdHJ1Y3Qgc2lnbmF0dXJlcyBiZWNhdXNlIHdlIGNhbm5vdCBhc3N1bWUgdGhhdFxyXG4gICAgICAvLyB0aGUgZGlhZ25vc3RpYyByZWZlcnMgdG8gYSBjb25zdHJ1Y3RvciBvZiB0aGUgYWN0dWFsIGV4cHJlc3Npb24uIEluIGNhc2UgdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgIC8vIGlzIGluaGVyaXRlZCwgd2UgbmVlZCB0byBkZXRlY3QgdGhhdCB0aGUgb3duZXItY2xhc3Mgb2YgdGhlIGNvbnN0cnVjdG9yIGlzIGFkZGVkIHRvIHRoZVxyXG4gICAgICAvLyBjb25zdHJ1Y3RvciBjaGVja3MgdXBncmFkZSBkYXRhLiBlLmcuIGBjbGFzcyBDdXN0b21DYWxlbmRhciBleHRlbmRzIE1hdENhbGVuZGFyIHt9YC5cclxuICAgICAgY29uc3Qgc2lnbmF0dXJlQ2xhc3NOYW1lcyA9XHJcbiAgICAgICAgICBjbGFzc1R5cGUuZ2V0Q29uc3RydWN0U2lnbmF0dXJlcygpXHJcbiAgICAgICAgICAgICAgLm1hcChzaWduYXR1cmUgPT4gZ2V0Q2xhc3NEZWNsYXJhdGlvbk9mU2lnbmF0dXJlKHNpZ25hdHVyZSkpXHJcbiAgICAgICAgICAgICAgLm1hcChkZWNsYXJhdGlvbiA9PiBkZWNsYXJhdGlvbiAmJiBkZWNsYXJhdGlvbi5uYW1lID8gZGVjbGFyYXRpb24ubmFtZS50ZXh0IDogbnVsbClcclxuICAgICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xyXG5cclxuICAgICAgLy8gQmVzaWRlcyBjaGVja2luZyB0aGUgc2lnbmF0dXJlIGNsYXNzIG5hbWVzLCB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBhY3R1YWwgY2xhc3MgbmFtZSBiZWNhdXNlXHJcbiAgICAgIC8vIHRoZXJlIGNhbiBiZSBjbGFzc2VzIHdpdGhvdXQgYW4gZXhwbGljaXQgY29uc3RydWN0b3IuXHJcbiAgICAgIGlmICghdGhpcy5kYXRhLmluY2x1ZGVzKGNsYXNzTmFtZSkgJiZcclxuICAgICAgICAgICFzaWduYXR1cmVDbGFzc05hbWVzLnNvbWUobmFtZSA9PiB0aGlzLmRhdGEuaW5jbHVkZXMobmFtZSEpKSkge1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBjbGFzc1NpZ25hdHVyZXMgPSBjbGFzc1R5cGUuZ2V0Q29uc3RydWN0U2lnbmF0dXJlcygpLm1hcChcclxuICAgICAgICAgIHNpZ25hdHVyZSA9PiBnZXRQYXJhbWV0ZXJUeXBlc0Zyb21TaWduYXR1cmUoc2lnbmF0dXJlLCB0aGlzLnR5cGVDaGVja2VyKSk7XHJcblxyXG4gICAgICBjb25zdCBleHByZXNzaW9uTmFtZSA9IGlzTmV3RXhwcmVzc2lvbiA/IGBuZXcgJHtjbGFzc05hbWV9YCA6ICdzdXBlcic7XHJcbiAgICAgIGNvbnN0IHNpZ25hdHVyZXMgPVxyXG4gICAgICAgICAgY2xhc3NTaWduYXR1cmVzLm1hcChzaWduYXR1cmUgPT4gc2lnbmF0dXJlLm1hcCh0ID0+IHRoaXMudHlwZUNoZWNrZXIudHlwZVRvU3RyaW5nKHQpKSlcclxuICAgICAgICAgICAgICAubWFwKHNpZ25hdHVyZSA9PiBgJHtleHByZXNzaW9uTmFtZX0oJHtzaWduYXR1cmUuam9pbignLCAnKX0pYClcclxuICAgICAgICAgICAgICAuam9pbignIG9yICcpO1xyXG5cclxuICAgICAgdGhpcy5jcmVhdGVGYWlsdXJlQXROb2RlKFxyXG4gICAgICAgICAgbm9kZSxcclxuICAgICAgICAgIGBGb3VuZCBcIiR7Y2xhc3NOYW1lfVwiIGNvbnN0cnVjdGVkIHdpdGggYCArXHJcbiAgICAgICAgICAgICAgYGFuIGludmFsaWQgc2lnbmF0dXJlLiBQbGVhc2UgbWFudWFsbHkgdXBkYXRlIHRoZSAke2V4cHJlc3Npb25OYW1lfSBleHByZXNzaW9uIHRvIGAgK1xyXG4gICAgICAgICAgICAgIGBtYXRjaCB0aGUgbmV3IHNpZ25hdHVyZSR7Y2xhc3NTaWduYXR1cmVzLmxlbmd0aCA+IDEgPyAncycgOiAnJ306ICR7c2lnbmF0dXJlc31gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG4vKiogUmVzb2x2ZXMgdGhlIHR5cGUgZm9yIGVhY2ggcGFyYW1ldGVyIGluIHRoZSBzcGVjaWZpZWQgc2lnbmF0dXJlLiAqL1xyXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJUeXBlc0Zyb21TaWduYXR1cmUoXHJcbiAgICBzaWduYXR1cmU6IHRzLlNpZ25hdHVyZSwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyKTogdHMuVHlwZVtdIHtcclxuICByZXR1cm4gc2lnbmF0dXJlLmdldFBhcmFtZXRlcnMoKS5tYXAoXHJcbiAgICAgIHBhcmFtID0+IHR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKHBhcmFtLmRlY2xhcmF0aW9uc1swXSkpO1xyXG59XHJcblxyXG4vKipcclxuICogV2Fsa3MgdGhyb3VnaCBlYWNoIG5vZGUgb2YgYSBzb3VyY2UgZmlsZSBpbiBvcmRlciB0byBmaW5kIGEgbmV3LWV4cHJlc3Npb24gbm9kZSBvciBzdXBlci1jYWxsXHJcbiAqIGV4cHJlc3Npb24gbm9kZSB0aGF0IGlzIGNhcHR1cmVkIGJ5IHRoZSBzcGVjaWZpZWQgZGlhZ25vc3RpYy5cclxuICovXHJcbmZ1bmN0aW9uIGZpbmRDb25zdHJ1Y3Rvck5vZGUoXHJcbiAgICBkaWFnbm9zdGljOiB0cy5EaWFnbm9zdGljLCBzb3VyY2VGaWxlOiB0cy5Tb3VyY2VGaWxlKTogdHMuQ2FsbEV4cHJlc3Npb258dHMuTmV3RXhwcmVzc2lvbnxudWxsIHtcclxuICBsZXQgcmVzb2x2ZWROb2RlOiB0cy5Ob2RlfG51bGwgPSBudWxsO1xyXG5cclxuICBjb25zdCBfdmlzaXROb2RlID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcclxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGN1cnJlbnQgbm9kZSBjb250YWlucyB0aGUgZGlhZ25vc3RpYy4gSWYgdGhlIG5vZGUgY29udGFpbnMgdGhlIGRpYWdub3N0aWMsXHJcbiAgICAvLyB3YWxrIGRlZXBlciBpbiBvcmRlciB0byBmaW5kIGFsbCBjb25zdHJ1Y3RvciBleHByZXNzaW9uIG5vZGVzLlxyXG4gICAgaWYgKG5vZGUuZ2V0U3RhcnQoKSA8PSBkaWFnbm9zdGljLnN0YXJ0ISAmJiBub2RlLmdldEVuZCgpID49IGRpYWdub3N0aWMuc3RhcnQhKSB7XHJcbiAgICAgIGlmICh0cy5pc05ld0V4cHJlc3Npb24obm9kZSkgfHxcclxuICAgICAgICAgICh0cy5pc0NhbGxFeHByZXNzaW9uKG5vZGUpICYmIG5vZGUuZXhwcmVzc2lvbi5raW5kID09PSB0cy5TeW50YXhLaW5kLlN1cGVyS2V5d29yZCkpIHtcclxuICAgICAgICByZXNvbHZlZE5vZGUgPSBub2RlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgX3Zpc2l0Tm9kZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdHMuZm9yRWFjaENoaWxkKHNvdXJjZUZpbGUsIF92aXNpdE5vZGUpO1xyXG5cclxuICByZXR1cm4gcmVzb2x2ZWROb2RlO1xyXG59XHJcblxyXG4vKiogRGV0ZXJtaW5lcyB0aGUgY2xhc3MgZGVjbGFyYXRpb24gb2YgdGhlIHNwZWNpZmllZCBjb25zdHJ1Y3Qgc2lnbmF0dXJlLiAqL1xyXG5mdW5jdGlvbiBnZXRDbGFzc0RlY2xhcmF0aW9uT2ZTaWduYXR1cmUoc2lnbmF0dXJlOiB0cy5TaWduYXR1cmUpOiB0cy5DbGFzc0RlY2xhcmF0aW9ufG51bGwge1xyXG4gIGxldCBub2RlOiB0cy5Ob2RlID0gc2lnbmF0dXJlLmdldERlY2xhcmF0aW9uKCk7XHJcbiAgLy8gSGFuZGxlIHNpZ25hdHVyZXMgd2hpY2ggZG9uJ3QgaGF2ZSBhbiBhY3R1YWwgZGVjbGFyYXRpb24uIFRoaXMgaGFwcGVucyBpZiBhIGNsYXNzXHJcbiAgLy8gZG9lcyBub3QgaGF2ZSBhbiBleHBsaWNpdGx5IHdyaXR0ZW4gY29uc3RydWN0b3IuXHJcbiAgaWYgKCFub2RlKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgd2hpbGUgKCF0cy5pc1NvdXJjZUZpbGUobm9kZSA9IG5vZGUucGFyZW50KSkge1xyXG4gICAgaWYgKHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihub2RlKSkge1xyXG4gICAgICByZXR1cm4gbm9kZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuIl19