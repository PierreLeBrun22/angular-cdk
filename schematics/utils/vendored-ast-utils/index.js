"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppModulePath = exports.findBootstrapModulePath = exports.findBootstrapModuleCall = exports.addEntryComponentToModule = exports.addExportToModule = exports.addImportToModule = exports.addDeclarationToModule = exports.addSymbolToNgModuleMetadata = exports.getMetadataField = exports.getDecoratorMetadata = exports.insertAfterLastOccurrence = exports.findNode = exports.getSourceNodes = exports.findNodes = exports.insertImport = void 0;
// tslint:disable
/*
 * Note: This file contains vendored TypeScript AST utils from "@schematics/angular".
 * Since there is no canonical place for common utils, and we don't want to use the AST
 * utils directly from "@schematics/angular" to avoid TypeScript version mismatches, we
 * copy the needed AST utils until there is a general place for such utility functions.
 *
 * Taken from:
 *   (1) https://github.com/angular/angular-cli/blob/30df1470a0f18989db336d50b55a79021ab64c85/packages/schematics/angular/utility/ng-ast-utils.ts
 *   (2) https://github.com/angular/angular-cli/blob/30df1470a0f18989db336d50b55a79021ab64c85/packages/schematics/angular/utility/ast-utils.ts
 */
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const path_1 = require("path");
const ts = require("typescript");
/**
 * Add Import `import { symbolName } from fileName` if the import doesn't exit
 * already. Assumes fileToEdit can be resolved and accessed.
 * @param fileToEdit (file we want to add import to)
 * @param symbolName (item to import)
 * @param fileName (path to the file)
 * @param isDefault (if true, import follows style for importing default exports)
 * @return Change
 */
function insertImport(source, fileToEdit, symbolName, fileName, isDefault = false) {
    const rootNode = source;
    const allImports = findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    const relevantImports = allImports.filter(node => {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        const importFiles = node.getChildren()
            .filter(child => child.kind === ts.SyntaxKind.StringLiteral)
            .map(n => n.text);
        return importFiles.filter(file => file === fileName).length === 1;
    });
    if (relevantImports.length > 0) {
        let importsAsterisk = false;
        // imports from import file
        const imports = [];
        relevantImports.forEach(n => {
            Array.prototype.push.apply(imports, findNodes(n, ts.SyntaxKind.Identifier));
            if (findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk) {
            return new change_1.NoopChange();
        }
        const importTextNodes = imports.filter(n => n.text === symbolName);
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            const fallbackPos = findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return insertAfterLastOccurrence(imports, `, ${symbolName}`, fileToEdit, fallbackPos);
        }
        return new change_1.NoopChange();
    }
    // no such import declaration exists
    const useStrict = findNodes(rootNode, ts.SyntaxKind.StringLiteral)
        .filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const open = isDefault ? '' : '{ ';
    const close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    const insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    const separator = insertAtBeginning ? '' : ';\n';
    const toInsert = `${separator}import ${open}${symbolName}${close}` +
        ` from '${fileName}'${insertAtBeginning ? ';\n' : ''}`;
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node
 * @param kind
 * @param max The maximum number of items to return.
 * @param recursive Continue looking for nodes of kind recursive until end
 * the last child even when node of kind has been found.
 * @return all nodes of kind, or [] if none is found
 */
function findNodes(node, kind, max = Infinity, recursive = false) {
    if (!node || max == 0) {
        return [];
    }
    const arr = [];
    if (node.kind === kind) {
        arr.push(node);
        max--;
    }
    if (max > 0 && (recursive || node.kind !== kind)) {
        for (const child of node.getChildren()) {
            findNodes(child, kind, max).forEach(node => {
                if (max > 0) {
                    arr.push(node);
                }
                max--;
            });
            if (max <= 0) {
                break;
            }
        }
    }
    return arr;
}
exports.findNodes = findNodes;
/**
 * Get all the nodes from a source.
 * @param sourceFile The source file object.
 * @returns {Observable<ts.Node>} An observable of all the nodes in the source.
 */
function getSourceNodes(sourceFile) {
    const nodes = [sourceFile];
    const result = [];
    while (nodes.length > 0) {
        const node = nodes.shift();
        if (node) {
            result.push(node);
            if (node.getChildCount(sourceFile) >= 0) {
                nodes.unshift(...node.getChildren());
            }
        }
    }
    return result;
}
exports.getSourceNodes = getSourceNodes;
function findNode(node, kind, text) {
    if (node.kind === kind && node.getText() === text) {
        // throw new Error(node.getText());
        return node;
    }
    let foundNode = null;
    ts.forEachChild(node, childNode => {
        foundNode = foundNode || findNode(childNode, kind, text);
    });
    return foundNode;
}
exports.findNode = findNode;
/**
 * Helper for sorting nodes.
 * @return function to sort nodes in increasing order of position in sourceFile
 */
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
/**
 * Insert `toInsert` after the last occurence of `ts.SyntaxKind[nodes[i].kind]`
 * or after the last of occurence of `syntaxKind` if the last occurence is a sub child
 * of ts.SyntaxKind[nodes[i].kind] and save the changes in file.
 *
 * @param nodes insert after the last occurence of nodes
 * @param toInsert string to insert
 * @param file file to insert changes into
 * @param fallbackPos position to insert if toInsert happens to be the first occurence
 * @param syntaxKind the ts.SyntaxKind of the subchildren to insert after
 * @return Change instance
 * @throw Error if toInsert is first occurence but fall back is not set
 */
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    let lastItem;
    for (const node of nodes) {
        if (!lastItem || lastItem.getStart() < node.getStart()) {
            lastItem = node;
        }
    }
    if (syntaxKind && lastItem) {
        lastItem = findNodes(lastItem, syntaxKind).sort(nodesByPosition).pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
    }
    const lastItemPosition = lastItem ? lastItem.getEnd() : fallbackPos;
    return new change_1.InsertChange(file, lastItemPosition, toInsert);
}
exports.insertAfterLastOccurrence = insertAfterLastOccurrence;
function _angularImportsFromNode(node, _sourceFile) {
    const ms = node.moduleSpecifier;
    let modulePath;
    switch (ms.kind) {
        case ts.SyntaxKind.StringLiteral:
            modulePath = ms.text;
            break;
        default:
            return {};
    }
    if (!modulePath.startsWith('@angular/')) {
        return {};
    }
    if (node.importClause) {
        if (node.importClause.name) {
            // This is of the form `import Name from 'path'`. Ignore.
            return {};
        }
        else if (node.importClause.namedBindings) {
            const nb = node.importClause.namedBindings;
            if (nb.kind == ts.SyntaxKind.NamespaceImport) {
                // This is of the form `import * as name from 'path'`. Return `name.`.
                return {
                    [nb.name.text + '.']: modulePath,
                };
            }
            else {
                // This is of the form `import {a,b,c} from 'path'`
                const namedImports = nb;
                return namedImports.elements
                    .map((is) => is.propertyName ? is.propertyName.text : is.name.text)
                    .reduce((acc, curr) => {
                    acc[curr] = modulePath;
                    return acc;
                }, {});
            }
        }
        return {};
    }
    else {
        // This is of the form `import 'path';`. Nothing to do.
        return {};
    }
}
function getDecoratorMetadata(source, identifier, module) {
    const angularImports = findNodes(source, ts.SyntaxKind.ImportDeclaration)
        .map((node) => _angularImportsFromNode(node, source))
        .reduce((acc, current) => {
        for (const key of Object.keys(current)) {
            acc[key] = current[key];
        }
        return acc;
    }, {});
    return getSourceNodes(source)
        .filter(node => {
        return node.kind == ts.SyntaxKind.Decorator
            && node.expression.kind == ts.SyntaxKind.CallExpression;
    })
        .map(node => node.expression)
        .filter(expr => {
        if (expr.expression.kind == ts.SyntaxKind.Identifier) {
            const id = expr.expression;
            return id.text == identifier && angularImports[id.text] === module;
        }
        else if (expr.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            // This covers foo.NgModule when importing * as foo.
            const paExpr = expr.expression;
            // If the left expression is not an identifier, just give up at that point.
            if (paExpr.expression.kind !== ts.SyntaxKind.Identifier) {
                return false;
            }
            const id = paExpr.name.text;
            const moduleId = paExpr.expression.text;
            return id === identifier && (angularImports[moduleId + '.'] === module);
        }
        return false;
    })
        .filter(expr => expr.arguments[0]
        && expr.arguments[0].kind == ts.SyntaxKind.ObjectLiteralExpression)
        .map(expr => expr.arguments[0]);
}
exports.getDecoratorMetadata = getDecoratorMetadata;
function getMetadataField(node, metadataField) {
    return node.properties
        .filter(prop => ts.isPropertyAssignment(prop))
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter(({ name }) => {
        return (ts.isIdentifier(name) || ts.isStringLiteral(name))
            && name.getText() === metadataField;
    });
}
exports.getMetadataField = getMetadataField;
function addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, symbolName, importPath = null) {
    const nodes = getDecoratorMetadata(source, 'NgModule', '@angular/core');
    let node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperties = getMetadataField(node, metadataField);
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        const expr = node;
        let position;
        let toInsert;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${metadataField}: [${symbolName}]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            const matches = text.match(/^\r?\n\s*/);
            if (matches && matches.length > 0) {
                toInsert = `,${matches[0]}${metadataField}: [${symbolName}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${symbolName}]`;
            }
        }
        if (importPath !== null) {
            return [
                new change_1.InsertChange(ngModulePath, position, toInsert),
                insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath),
            ];
        }
        else {
            return [new change_1.InsertChange(ngModulePath, position, toInsert)];
        }
    }
    const assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        // tslint:disable-next-line: no-console
        console.error('No app module found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map(node => node.getText());
        if (symbolsArray.includes(symbolName)) {
            return [];
        }
        node = node[node.length - 1];
    }
    let toInsert;
    let position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        const expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `  ${symbolName}\n`;
        }
        else {
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            if (text.match(/^\r?\r?\n/)) {
                toInsert = `,${text.match(/^\r?\n\s*/)[0]}${symbolName}`;
            }
            else {
                toInsert = `, ${symbolName}`;
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = `${symbolName}`;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = `,${text.match(/^\r?\n(\r?)\s*/)[0]}${symbolName}`;
        }
        else {
            toInsert = `, ${symbolName}`;
        }
    }
    if (importPath !== null) {
        return [
            new change_1.InsertChange(ngModulePath, position, toInsert),
            insertImport(source, ngModulePath, symbolName.replace(/\..*$/, ''), importPath),
        ];
    }
    return [new change_1.InsertChange(ngModulePath, position, toInsert)];
}
exports.addSymbolToNgModuleMetadata = addSymbolToNgModuleMetadata;
/**
 * Custom function to insert a declaration (component, pipe, directive)
 * into NgModule declarations. It also imports the component.
 */
function addDeclarationToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'declarations', classifiedName, importPath);
}
exports.addDeclarationToModule = addDeclarationToModule;
/**
 * Custom function to insert an NgModule into NgModule imports. It also imports the module.
 */
function addImportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'imports', classifiedName, importPath);
}
exports.addImportToModule = addImportToModule;
/**
 * Custom function to insert an export into NgModule. It also imports it.
 */
function addExportToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'exports', classifiedName, importPath);
}
exports.addExportToModule = addExportToModule;
/**
 * Custom function to insert an entryComponent into NgModule. It also imports it.
 * @deprecated - Since version 9.0.0 with Ivy, entryComponents is no longer necessary.
 */
function addEntryComponentToModule(source, modulePath, classifiedName, importPath) {
    return addSymbolToNgModuleMetadata(source, modulePath, 'entryComponents', classifiedName, importPath);
}
exports.addEntryComponentToModule = addEntryComponentToModule;
function findBootstrapModuleCall(host, mainPath) {
    const mainBuffer = host.read(mainPath);
    if (!mainBuffer) {
        throw new schematics_1.SchematicsException(`Main file (${mainPath}) not found`);
    }
    const mainText = mainBuffer.toString('utf-8');
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = getSourceNodes(source);
    let bootstrapCall = null;
    for (const node of allNodes) {
        let bootstrapCallNode = null;
        bootstrapCallNode = findNode(node, ts.SyntaxKind.Identifier, 'bootstrapModule');
        // Walk up the parent until CallExpression is found.
        while (bootstrapCallNode && bootstrapCallNode.parent
            && bootstrapCallNode.parent.kind !== ts.SyntaxKind.CallExpression) {
            bootstrapCallNode = bootstrapCallNode.parent;
        }
        if (bootstrapCallNode !== null &&
            bootstrapCallNode.parent !== undefined &&
            bootstrapCallNode.parent.kind === ts.SyntaxKind.CallExpression) {
            bootstrapCall = bootstrapCallNode.parent;
            break;
        }
    }
    return bootstrapCall;
}
exports.findBootstrapModuleCall = findBootstrapModuleCall;
function findBootstrapModulePath(host, mainPath) {
    const bootstrapCall = findBootstrapModuleCall(host, mainPath);
    if (!bootstrapCall) {
        throw new schematics_1.SchematicsException('Bootstrap call not found');
    }
    const bootstrapModule = bootstrapCall.arguments[0];
    const mainBuffer = host.read(mainPath);
    if (!mainBuffer) {
        throw new schematics_1.SchematicsException(`Client app main file (${mainPath}) not found`);
    }
    const mainText = mainBuffer.toString('utf-8');
    const source = ts.createSourceFile(mainPath, mainText, ts.ScriptTarget.Latest, true);
    const allNodes = getSourceNodes(source);
    const bootstrapModuleRelativePath = allNodes
        .filter(node => node.kind === ts.SyntaxKind.ImportDeclaration)
        .filter(imp => {
        return findNode(imp, ts.SyntaxKind.Identifier, bootstrapModule.getText());
    })
        .map((imp) => {
        const modulePathStringLiteral = imp.moduleSpecifier;
        return modulePathStringLiteral.text;
    })[0];
    return bootstrapModuleRelativePath;
}
exports.findBootstrapModulePath = findBootstrapModulePath;
function getAppModulePath(host, mainPath) {
    const moduleRelativePath = findBootstrapModulePath(host, mainPath);
    const mainDir = path_1.dirname(mainPath);
    const modulePath = core_1.normalize(`/${mainDir}/${moduleRelativePath}.ts`);
    return modulePath;
}
exports.getAppModulePath = getAppModulePath;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXRpbHMvdmVuZG9yZWQtYXN0LXV0aWxzL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlCQUFpQjtBQUVqQjs7Ozs7Ozs7O0dBU0c7QUFFSCwrQ0FBK0M7QUFDL0MsMkRBQXFFO0FBQ3JFLCtEQUFvRjtBQUNwRiwrQkFBNkI7QUFFN0IsaUNBQWlDO0FBRWpDOzs7Ozs7OztHQVFHO0FBQ0gsU0FBZ0IsWUFBWSxDQUFDLE1BQXFCLEVBQUUsVUFBa0IsRUFBRSxVQUFrQixFQUM3RCxRQUFnQixFQUFFLFNBQVMsR0FBRyxLQUFLO0lBQzlELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQztJQUN4QixNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUV4RSxpRUFBaUU7SUFDakUsTUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUMvQyxxRkFBcUY7UUFDckYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTthQUNuQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDO2FBQzNELEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFFLENBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFMUMsT0FBTyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDcEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcs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RUQsU0FBZ0IsZ0JBQWdCLENBQUMsSUFBVSxFQUFFLFFBQWdCO0lBQzNELE1BQU0sa0JBQWtCLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ25FLE1BQU0sT0FBTyxHQUFHLGNBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsQyxNQUFNLFVBQVUsR0FBRyxnQkFBUyxDQUFDLElBQUksT0FBTyxJQUFJLGtCQUFrQixLQUFLLENBQUMsQ0FBQztJQUVyRSxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDO0FBTkQsNENBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbi8vIHRzbGludDpkaXNhYmxlXHJcblxyXG4vKlxyXG4gKiBOb3RlOiBUaGlzIGZpbGUgY29udGFpbnMgdmVuZG9yZWQgVHlwZVNjcmlwdCBBU1QgdXRpbHMgZnJvbSBcIkBzY2hlbWF0aWNzL2FuZ3VsYXJcIi5cclxuICogU2luY2UgdGhlcmUgaXMgbm8gY2Fub25pY2FsIHBsYWNlIGZvciBjb21tb24gdXRpbHMsIGFuZCB3ZSBkb24ndCB3YW50IHRvIHVzZSB0aGUgQVNUXHJcbiAqIHV0aWxzIGRpcmVjdGx5IGZyb20gXCJAc2NoZW1hdGljcy9hbmd1bGFyXCIgdG8gYXZvaWQgVHlwZVNjcmlwdCB2ZXJzaW9uIG1pc21hdGNoZXMsIHdlXHJcbiAqIGNvcHkgdGhlIG5lZWRlZCBBU1QgdXRpbHMgdW50aWwgdGhlcmUgaXMgYSBnZW5lcmFsIHBsYWNlIGZvciBzdWNoIHV0aWxpdHkgZnVuY3Rpb25zLlxyXG4gKlxyXG4gKiBUYWtlbiBmcm9tOlxyXG4gKiAgICgxKSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLWNsaS9ibG9iLzMwZGYxNDcwYTBmMTg5ODlkYjMzNmQ1MGI1NWE3OTAyMWFiNjRjODUvcGFja2FnZXMvc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvbmctYXN0LXV0aWxzLnRzXHJcbiAqICAgKDIpIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXItY2xpL2Jsb2IvMzBkZjE0NzBhMGYxODk4OWRiMzM2ZDUwYjU1YTc5MDIxYWI2NGM4NS9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS9hc3QtdXRpbHMudHNcclxuICovXHJcblxyXG5pbXBvcnQge25vcm1hbGl6ZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUnO1xyXG5pbXBvcnQge1NjaGVtYXRpY3NFeGNlcHRpb24sIFRyZWV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9zY2hlbWF0aWNzJztcclxuaW1wb3J0IHtDaGFuZ2UsIEluc2VydENoYW5nZSwgTm9vcENoYW5nZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2NoYW5nZSc7XHJcbmltcG9ydCB7ZGlybmFtZX0gZnJvbSAncGF0aCc7XHJcblxyXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuXHJcbi8qKlxyXG4gKiBBZGQgSW1wb3J0IGBpbXBvcnQgeyBzeW1ib2xOYW1lIH0gZnJvbSBmaWxlTmFtZWAgaWYgdGhlIGltcG9ydCBkb2Vzbid0IGV4aXRcclxuICogYWxyZWFkeS4gQXNzdW1lcyBmaWxlVG9FZGl0IGNhbiBiZSByZXNvbHZlZCBhbmQgYWNjZXNzZWQuXHJcbiAqIEBwYXJhbSBmaWxlVG9FZGl0IChmaWxlIHdlIHdhbnQgdG8gYWRkIGltcG9ydCB0bylcclxuICogQHBhcmFtIHN5bWJvbE5hbWUgKGl0ZW0gdG8gaW1wb3J0KVxyXG4gKiBAcGFyYW0gZmlsZU5hbWUgKHBhdGggdG8gdGhlIGZpbGUpXHJcbiAqIEBwYXJhbSBpc0RlZmF1bHQgKGlmIHRydWUsIGltcG9ydCBmb2xsb3dzIHN0eWxlIGZvciBpbXBvcnRpbmcgZGVmYXVsdCBleHBvcnRzKVxyXG4gKiBAcmV0dXJuIENoYW5nZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGluc2VydEltcG9ydChzb3VyY2U6IHRzLlNvdXJjZUZpbGUsIGZpbGVUb0VkaXQ6IHN0cmluZywgc3ltYm9sTmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBzdHJpbmcsIGlzRGVmYXVsdCA9IGZhbHNlKTogQ2hhbmdlIHtcclxuICBjb25zdCByb290Tm9kZSA9IHNvdXJjZTtcclxuICBjb25zdCBhbGxJbXBvcnRzID0gZmluZE5vZGVzKHJvb3ROb2RlLCB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKTtcclxuXHJcbiAgLy8gZ2V0IG5vZGVzIHRoYXQgbWFwIHRvIGltcG9ydCBzdGF0ZW1lbnRzIGZyb20gdGhlIGZpbGUgZmlsZU5hbWVcclxuICBjb25zdCByZWxldmFudEltcG9ydHMgPSBhbGxJbXBvcnRzLmZpbHRlcihub2RlID0+IHtcclxuICAgIC8vIFN0cmluZ0xpdGVyYWwgb2YgdGhlIEltcG9ydERlY2xhcmF0aW9uIGlzIHRoZSBpbXBvcnQgZmlsZSAoZmlsZU5hbWUgaW4gdGhpcyBjYXNlKS5cclxuICAgIGNvbnN0IGltcG9ydEZpbGVzID0gbm9kZS5nZXRDaGlsZHJlbigpXHJcbiAgICAgIC5maWx0ZXIoY2hpbGQgPT4gY2hpbGQua2luZCA9PT0gdHMuU3ludGF4S2luZC5TdHJpbmdMaXRlcmFsKVxyXG4gICAgICAubWFwKG4gPT4gKG4gYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dCk7XHJcblxyXG4gICAgcmV0dXJuIGltcG9ydEZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUgPT09IGZpbGVOYW1lKS5sZW5ndGggPT09IDE7XHJcbiAgfSk7XHJcblxyXG4gIGlmIChyZWxldmFudEltcG9ydHMubGVuZ3RoID4gMCkge1xyXG4gICAgbGV0IGltcG9ydHNBc3RlcmlzayA9IGZhbHNlO1xyXG4gICAgLy8gaW1wb3J0cyBmcm9tIGltcG9ydCBmaWxlXHJcbiAgICBjb25zdCBpbXBvcnRzOiB0cy5Ob2RlW10gPSBbXTtcclxuICAgIHJlbGV2YW50SW1wb3J0cy5mb3JFYWNoKG4gPT4ge1xyXG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpbXBvcnRzLCBmaW5kTm9kZXMobiwgdHMuU3ludGF4S2luZC5JZGVudGlmaWVyKSk7XHJcbiAgICAgIGlmIChmaW5kTm9kZXMobiwgdHMuU3ludGF4S2luZC5Bc3Rlcmlza1Rva2VuKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgaW1wb3J0c0FzdGVyaXNrID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gaWYgaW1wb3J0cyAqIGZyb20gZmlsZU5hbWUsIGRvbid0IGFkZCBzeW1ib2xOYW1lXHJcbiAgICBpZiAoaW1wb3J0c0FzdGVyaXNrKSB7XHJcbiAgICAgIHJldHVybiBuZXcgTm9vcENoYW5nZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGltcG9ydFRleHROb2RlcyA9IGltcG9ydHMuZmlsdGVyKG4gPT4gKG4gYXMgdHMuSWRlbnRpZmllcikudGV4dCA9PT0gc3ltYm9sTmFtZSk7XHJcblxyXG4gICAgLy8gaW5zZXJ0IGltcG9ydCBpZiBpdCdzIG5vdCB0aGVyZVxyXG4gICAgaWYgKGltcG9ydFRleHROb2Rlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgY29uc3QgZmFsbGJhY2tQb3MgPVxyXG4gICAgICAgIGZpbmROb2RlcyhyZWxldmFudEltcG9ydHNbMF0sIHRzLlN5bnRheEtpbmQuQ2xvc2VCcmFjZVRva2VuKVswXS5nZXRTdGFydCgpIHx8XHJcbiAgICAgICAgZmluZE5vZGVzKHJlbGV2YW50SW1wb3J0c1swXSwgdHMuU3ludGF4S2luZC5Gcm9tS2V5d29yZClbMF0uZ2V0U3RhcnQoKTtcclxuXHJcbiAgICAgIHJldHVybiBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlKGltcG9ydHMsIGAsICR7c3ltYm9sTmFtZX1gLCBmaWxlVG9FZGl0LCBmYWxsYmFja1Bvcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ldyBOb29wQ2hhbmdlKCk7XHJcbiAgfVxyXG5cclxuICAvLyBubyBzdWNoIGltcG9ydCBkZWNsYXJhdGlvbiBleGlzdHNcclxuICBjb25zdCB1c2VTdHJpY3QgPSBmaW5kTm9kZXMocm9vdE5vZGUsIHRzLlN5bnRheEtpbmQuU3RyaW5nTGl0ZXJhbClcclxuICAgIC5maWx0ZXIoKG46IHRzLlN0cmluZ0xpdGVyYWwpID0+IG4udGV4dCA9PT0gJ3VzZSBzdHJpY3QnKTtcclxuICBsZXQgZmFsbGJhY2tQb3MgPSAwO1xyXG4gIGlmICh1c2VTdHJpY3QubGVuZ3RoID4gMCkge1xyXG4gICAgZmFsbGJhY2tQb3MgPSB1c2VTdHJpY3RbMF0uZW5kO1xyXG4gIH1cclxuICBjb25zdCBvcGVuID0gaXNEZWZhdWx0ID8gJycgOiAneyAnO1xyXG4gIGNvbnN0IGNsb3NlID0gaXNEZWZhdWx0ID8gJycgOiAnIH0nO1xyXG4gIC8vIGlmIHRoZXJlIGFyZSBubyBpbXBvcnRzIG9yICd1c2Ugc3RyaWN0JyBzdGF0ZW1lbnQsIGluc2VydCBpbXBvcnQgYXQgYmVnaW5uaW5nIG9mIGZpbGVcclxuICBjb25zdCBpbnNlcnRBdEJlZ2lubmluZyA9IGFsbEltcG9ydHMubGVuZ3RoID09PSAwICYmIHVzZVN0cmljdC5sZW5ndGggPT09IDA7XHJcbiAgY29uc3Qgc2VwYXJhdG9yID0gaW5zZXJ0QXRCZWdpbm5pbmcgPyAnJyA6ICc7XFxuJztcclxuICBjb25zdCB0b0luc2VydCA9IGAke3NlcGFyYXRvcn1pbXBvcnQgJHtvcGVufSR7c3ltYm9sTmFtZX0ke2Nsb3NlfWAgK1xyXG4gICAgYCBmcm9tICcke2ZpbGVOYW1lfScke2luc2VydEF0QmVnaW5uaW5nID8gJztcXG4nIDogJyd9YDtcclxuXHJcbiAgcmV0dXJuIGluc2VydEFmdGVyTGFzdE9jY3VycmVuY2UoXHJcbiAgICBhbGxJbXBvcnRzLFxyXG4gICAgdG9JbnNlcnQsXHJcbiAgICBmaWxlVG9FZGl0LFxyXG4gICAgZmFsbGJhY2tQb3MsXHJcbiAgICB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWwsXHJcbiAgKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBGaW5kIGFsbCBub2RlcyBmcm9tIHRoZSBBU1QgaW4gdGhlIHN1YnRyZWUgb2Ygbm9kZSBvZiBTeW50YXhLaW5kIGtpbmQuXHJcbiAqIEBwYXJhbSBub2RlXHJcbiAqIEBwYXJhbSBraW5kXHJcbiAqIEBwYXJhbSBtYXggVGhlIG1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHRvIHJldHVybi5cclxuICogQHBhcmFtIHJlY3Vyc2l2ZSBDb250aW51ZSBsb29raW5nIGZvciBub2RlcyBvZiBraW5kIHJlY3Vyc2l2ZSB1bnRpbCBlbmRcclxuICogdGhlIGxhc3QgY2hpbGQgZXZlbiB3aGVuIG5vZGUgb2Yga2luZCBoYXMgYmVlbiBmb3VuZC5cclxuICogQHJldHVybiBhbGwgbm9kZXMgb2Yga2luZCwgb3IgW10gaWYgbm9uZSBpcyBmb3VuZFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmROb2Rlcyhub2RlOiB0cy5Ob2RlLCBraW5kOiB0cy5TeW50YXhLaW5kLCBtYXggPSBJbmZpbml0eSwgcmVjdXJzaXZlID0gZmFsc2UpOiB0cy5Ob2RlW10ge1xyXG4gIGlmICghbm9kZSB8fCBtYXggPT0gMCkge1xyXG4gICAgcmV0dXJuIFtdO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYXJyOiB0cy5Ob2RlW10gPSBbXTtcclxuICBpZiAobm9kZS5raW5kID09PSBraW5kKSB7XHJcbiAgICBhcnIucHVzaChub2RlKTtcclxuICAgIG1heC0tO1xyXG4gIH1cclxuICBpZiAobWF4ID4gMCAmJiAocmVjdXJzaXZlIHx8IG5vZGUua2luZCAhPT0ga2luZCkpIHtcclxuICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZS5nZXRDaGlsZHJlbigpKSB7XHJcbiAgICAgIGZpbmROb2RlcyhjaGlsZCwga2luZCwgbWF4KS5mb3JFYWNoKG5vZGUgPT4ge1xyXG4gICAgICAgIGlmIChtYXggPiAwKSB7XHJcbiAgICAgICAgICBhcnIucHVzaChub2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWF4LS07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKG1heCA8PSAwKSB7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBhcnI7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogR2V0IGFsbCB0aGUgbm9kZXMgZnJvbSBhIHNvdXJjZS5cclxuICogQHBhcmFtIHNvdXJjZUZpbGUgVGhlIHNvdXJjZSBmaWxlIG9iamVjdC5cclxuICogQHJldHVybnMge09ic2VydmFibGU8dHMuTm9kZT59IEFuIG9ic2VydmFibGUgb2YgYWxsIHRoZSBub2RlcyBpbiB0aGUgc291cmNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZU5vZGVzKHNvdXJjZUZpbGU6IHRzLlNvdXJjZUZpbGUpOiB0cy5Ob2RlW10ge1xyXG4gIGNvbnN0IG5vZGVzOiB0cy5Ob2RlW10gPSBbc291cmNlRmlsZV07XHJcbiAgY29uc3QgcmVzdWx0OiB0cy5Ob2RlW10gPSBbXTtcclxuXHJcbiAgd2hpbGUgKG5vZGVzLmxlbmd0aCA+IDApIHtcclxuICAgIGNvbnN0IG5vZGUgPSBub2Rlcy5zaGlmdCgpO1xyXG5cclxuICAgIGlmIChub2RlKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xyXG4gICAgICBpZiAobm9kZS5nZXRDaGlsZENvdW50KHNvdXJjZUZpbGUpID49IDApIHtcclxuICAgICAgICBub2Rlcy51bnNoaWZ0KC4uLm5vZGUuZ2V0Q2hpbGRyZW4oKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTm9kZShub2RlOiB0cy5Ob2RlLCBraW5kOiB0cy5TeW50YXhLaW5kLCB0ZXh0OiBzdHJpbmcpOiB0cy5Ob2RlIHwgbnVsbCB7XHJcbiAgaWYgKG5vZGUua2luZCA9PT0ga2luZCAmJiBub2RlLmdldFRleHQoKSA9PT0gdGV4dCkge1xyXG4gICAgLy8gdGhyb3cgbmV3IEVycm9yKG5vZGUuZ2V0VGV4dCgpKTtcclxuICAgIHJldHVybiBub2RlO1xyXG4gIH1cclxuXHJcbiAgbGV0IGZvdW5kTm9kZTogdHMuTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gIHRzLmZvckVhY2hDaGlsZChub2RlLCBjaGlsZE5vZGUgPT4ge1xyXG4gICAgZm91bmROb2RlID0gZm91bmROb2RlIHx8IGZpbmROb2RlKGNoaWxkTm9kZSwga2luZCwgdGV4dCk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBmb3VuZE5vZGU7XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogSGVscGVyIGZvciBzb3J0aW5nIG5vZGVzLlxyXG4gKiBAcmV0dXJuIGZ1bmN0aW9uIHRvIHNvcnQgbm9kZXMgaW4gaW5jcmVhc2luZyBvcmRlciBvZiBwb3NpdGlvbiBpbiBzb3VyY2VGaWxlXHJcbiAqL1xyXG5mdW5jdGlvbiBub2Rlc0J5UG9zaXRpb24oZmlyc3Q6IHRzLk5vZGUsIHNlY29uZDogdHMuTm9kZSk6IG51bWJlciB7XHJcbiAgcmV0dXJuIGZpcnN0LmdldFN0YXJ0KCkgLSBzZWNvbmQuZ2V0U3RhcnQoKTtcclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBJbnNlcnQgYHRvSW5zZXJ0YCBhZnRlciB0aGUgbGFzdCBvY2N1cmVuY2Ugb2YgYHRzLlN5bnRheEtpbmRbbm9kZXNbaV0ua2luZF1gXHJcbiAqIG9yIGFmdGVyIHRoZSBsYXN0IG9mIG9jY3VyZW5jZSBvZiBgc3ludGF4S2luZGAgaWYgdGhlIGxhc3Qgb2NjdXJlbmNlIGlzIGEgc3ViIGNoaWxkXHJcbiAqIG9mIHRzLlN5bnRheEtpbmRbbm9kZXNbaV0ua2luZF0gYW5kIHNhdmUgdGhlIGNoYW5nZXMgaW4gZmlsZS5cclxuICpcclxuICogQHBhcmFtIG5vZGVzIGluc2VydCBhZnRlciB0aGUgbGFzdCBvY2N1cmVuY2Ugb2Ygbm9kZXNcclxuICogQHBhcmFtIHRvSW5zZXJ0IHN0cmluZyB0byBpbnNlcnRcclxuICogQHBhcmFtIGZpbGUgZmlsZSB0byBpbnNlcnQgY2hhbmdlcyBpbnRvXHJcbiAqIEBwYXJhbSBmYWxsYmFja1BvcyBwb3NpdGlvbiB0byBpbnNlcnQgaWYgdG9JbnNlcnQgaGFwcGVucyB0byBiZSB0aGUgZmlyc3Qgb2NjdXJlbmNlXHJcbiAqIEBwYXJhbSBzeW50YXhLaW5kIHRoZSB0cy5TeW50YXhLaW5kIG9mIHRoZSBzdWJjaGlsZHJlbiB0byBpbnNlcnQgYWZ0ZXJcclxuICogQHJldHVybiBDaGFuZ2UgaW5zdGFuY2VcclxuICogQHRocm93IEVycm9yIGlmIHRvSW5zZXJ0IGlzIGZpcnN0IG9jY3VyZW5jZSBidXQgZmFsbCBiYWNrIGlzIG5vdCBzZXRcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRBZnRlckxhc3RPY2N1cnJlbmNlKG5vZGVzOiB0cy5Ob2RlW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvSW5zZXJ0OiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsbGJhY2tQb3M6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3ludGF4S2luZD86IHRzLlN5bnRheEtpbmQpOiBDaGFuZ2Uge1xyXG4gIGxldCBsYXN0SXRlbTogdHMuTm9kZSB8IHVuZGVmaW5lZDtcclxuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcclxuICAgIGlmICghbGFzdEl0ZW0gfHwgbGFzdEl0ZW0uZ2V0U3RhcnQoKSA8IG5vZGUuZ2V0U3RhcnQoKSkge1xyXG4gICAgICBsYXN0SXRlbSA9IG5vZGU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmIChzeW50YXhLaW5kICYmIGxhc3RJdGVtKSB7XHJcbiAgICBsYXN0SXRlbSA9IGZpbmROb2RlcyhsYXN0SXRlbSwgc3ludGF4S2luZCkuc29ydChub2Rlc0J5UG9zaXRpb24pLnBvcCgpO1xyXG4gIH1cclxuICBpZiAoIWxhc3RJdGVtICYmIGZhbGxiYWNrUG9zID09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGB0cmllZCB0byBpbnNlcnQgJHt0b0luc2VydH0gYXMgZmlyc3Qgb2NjdXJlbmNlIHdpdGggbm8gZmFsbGJhY2sgcG9zaXRpb25gKTtcclxuICB9XHJcbiAgY29uc3QgbGFzdEl0ZW1Qb3NpdGlvbjogbnVtYmVyID0gbGFzdEl0ZW0gPyBsYXN0SXRlbS5nZXRFbmQoKSA6IGZhbGxiYWNrUG9zO1xyXG5cclxuICByZXR1cm4gbmV3IEluc2VydENoYW5nZShmaWxlLCBsYXN0SXRlbVBvc2l0aW9uLCB0b0luc2VydCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIF9hbmd1bGFySW1wb3J0c0Zyb21Ob2RlKG5vZGU6IHRzLkltcG9ydERlY2xhcmF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfc291cmNlRmlsZTogdHMuU291cmNlRmlsZSk6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSB7XHJcbiAgY29uc3QgbXMgPSBub2RlLm1vZHVsZVNwZWNpZmllcjtcclxuICBsZXQgbW9kdWxlUGF0aDogc3RyaW5nO1xyXG4gIHN3aXRjaCAobXMua2luZCkge1xyXG4gICAgY2FzZSB0cy5TeW50YXhLaW5kLlN0cmluZ0xpdGVyYWw6XHJcbiAgICAgIG1vZHVsZVBhdGggPSAobXMgYXMgdHMuU3RyaW5nTGl0ZXJhbCkudGV4dDtcclxuICAgICAgYnJlYWs7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4ge307XHJcbiAgfVxyXG5cclxuICBpZiAoIW1vZHVsZVBhdGguc3RhcnRzV2l0aCgnQGFuZ3VsYXIvJykpIHtcclxuICAgIHJldHVybiB7fTtcclxuICB9XHJcblxyXG4gIGlmIChub2RlLmltcG9ydENsYXVzZSkge1xyXG4gICAgaWYgKG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWUpIHtcclxuICAgICAgLy8gVGhpcyBpcyBvZiB0aGUgZm9ybSBgaW1wb3J0IE5hbWUgZnJvbSAncGF0aCdgLiBJZ25vcmUuXHJcbiAgICAgIHJldHVybiB7fTtcclxuICAgIH0gZWxzZSBpZiAobm9kZS5pbXBvcnRDbGF1c2UubmFtZWRCaW5kaW5ncykge1xyXG4gICAgICBjb25zdCBuYiA9IG5vZGUuaW1wb3J0Q2xhdXNlLm5hbWVkQmluZGluZ3M7XHJcbiAgICAgIGlmIChuYi5raW5kID09IHRzLlN5bnRheEtpbmQuTmFtZXNwYWNlSW1wb3J0KSB7XHJcbiAgICAgICAgLy8gVGhpcyBpcyBvZiB0aGUgZm9ybSBgaW1wb3J0ICogYXMgbmFtZSBmcm9tICdwYXRoJ2AuIFJldHVybiBgbmFtZS5gLlxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBbKG5iIGFzIHRzLk5hbWVzcGFjZUltcG9ydCkubmFtZS50ZXh0ICsgJy4nXTogbW9kdWxlUGF0aCxcclxuICAgICAgICB9O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFRoaXMgaXMgb2YgdGhlIGZvcm0gYGltcG9ydCB7YSxiLGN9IGZyb20gJ3BhdGgnYFxyXG4gICAgICAgIGNvbnN0IG5hbWVkSW1wb3J0cyA9IG5iIGFzIHRzLk5hbWVkSW1wb3J0cztcclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWVkSW1wb3J0cy5lbGVtZW50c1xyXG4gICAgICAgICAgLm1hcCgoaXM6IHRzLkltcG9ydFNwZWNpZmllcikgPT4gaXMucHJvcGVydHlOYW1lID8gaXMucHJvcGVydHlOYW1lLnRleHQgOiBpcy5uYW1lLnRleHQpXHJcbiAgICAgICAgICAucmVkdWNlKChhY2M6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSwgY3Vycjogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgIGFjY1tjdXJyXSA9IG1vZHVsZVBhdGg7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYWNjO1xyXG4gICAgICAgICAgfSwge30pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHt9O1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBUaGlzIGlzIG9mIHRoZSBmb3JtIGBpbXBvcnQgJ3BhdGgnO2AuIE5vdGhpbmcgdG8gZG8uXHJcbiAgICByZXR1cm4ge307XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVjb3JhdG9yTWV0YWRhdGEoc291cmNlOiB0cy5Tb3VyY2VGaWxlLCBpZGVudGlmaWVyOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU6IHN0cmluZyk6IHRzLk5vZGVbXSB7XHJcbiAgY29uc3QgYW5ndWxhckltcG9ydHM6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfVxyXG4gICAgPSBmaW5kTm9kZXMoc291cmNlLCB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKVxyXG4gICAgLm1hcCgobm9kZTogdHMuSW1wb3J0RGVjbGFyYXRpb24pID0+IF9hbmd1bGFySW1wb3J0c0Zyb21Ob2RlKG5vZGUsIHNvdXJjZSkpXHJcbiAgICAucmVkdWNlKChhY2M6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSwgY3VycmVudDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9KSA9PiB7XHJcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKGN1cnJlbnQpKSB7XHJcbiAgICAgICAgYWNjW2tleV0gPSBjdXJyZW50W2tleV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhY2M7XHJcbiAgICB9LCB7fSk7XHJcblxyXG4gIHJldHVybiBnZXRTb3VyY2VOb2Rlcyhzb3VyY2UpXHJcbiAgICAuZmlsdGVyKG5vZGUgPT4ge1xyXG4gICAgICByZXR1cm4gbm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuRGVjb3JhdG9yXHJcbiAgICAgICAgJiYgKG5vZGUgYXMgdHMuRGVjb3JhdG9yKS5leHByZXNzaW9uLmtpbmQgPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbjtcclxuICAgIH0pXHJcbiAgICAubWFwKG5vZGUgPT4gKG5vZGUgYXMgdHMuRGVjb3JhdG9yKS5leHByZXNzaW9uIGFzIHRzLkNhbGxFeHByZXNzaW9uKVxyXG4gICAgLmZpbHRlcihleHByID0+IHtcclxuICAgICAgaWYgKGV4cHIuZXhwcmVzc2lvbi5raW5kID09IHRzLlN5bnRheEtpbmQuSWRlbnRpZmllcikge1xyXG4gICAgICAgIGNvbnN0IGlkID0gZXhwci5leHByZXNzaW9uIGFzIHRzLklkZW50aWZpZXI7XHJcblxyXG4gICAgICAgIHJldHVybiBpZC50ZXh0ID09IGlkZW50aWZpZXIgJiYgYW5ndWxhckltcG9ydHNbaWQudGV4dF0gPT09IG1vZHVsZTtcclxuICAgICAgfSBlbHNlIGlmIChleHByLmV4cHJlc3Npb24ua2luZCA9PSB0cy5TeW50YXhLaW5kLlByb3BlcnR5QWNjZXNzRXhwcmVzc2lvbikge1xyXG4gICAgICAgIC8vIFRoaXMgY292ZXJzIGZvby5OZ01vZHVsZSB3aGVuIGltcG9ydGluZyAqIGFzIGZvby5cclxuICAgICAgICBjb25zdCBwYUV4cHIgPSBleHByLmV4cHJlc3Npb24gYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xyXG4gICAgICAgIC8vIElmIHRoZSBsZWZ0IGV4cHJlc3Npb24gaXMgbm90IGFuIGlkZW50aWZpZXIsIGp1c3QgZ2l2ZSB1cCBhdCB0aGF0IHBvaW50LlxyXG4gICAgICAgIGlmIChwYUV4cHIuZXhwcmVzc2lvbi5raW5kICE9PSB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIpIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGlkID0gcGFFeHByLm5hbWUudGV4dDtcclxuICAgICAgICBjb25zdCBtb2R1bGVJZCA9IChwYUV4cHIuZXhwcmVzc2lvbiBhcyB0cy5JZGVudGlmaWVyKS50ZXh0O1xyXG5cclxuICAgICAgICByZXR1cm4gaWQgPT09IGlkZW50aWZpZXIgJiYgKGFuZ3VsYXJJbXBvcnRzW21vZHVsZUlkICsgJy4nXSA9PT0gbW9kdWxlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSlcclxuICAgIC5maWx0ZXIoZXhwciA9PiBleHByLmFyZ3VtZW50c1swXVxyXG4gICAgICAmJiBleHByLmFyZ3VtZW50c1swXS5raW5kID09IHRzLlN5bnRheEtpbmQuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pXHJcbiAgICAubWFwKGV4cHIgPT4gZXhwci5hcmd1bWVudHNbMF0gYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0YWRhdGFGaWVsZChcclxuICBub2RlOiB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbixcclxuICBtZXRhZGF0YUZpZWxkOiBzdHJpbmcsXHJcbik6IHRzLk9iamVjdExpdGVyYWxFbGVtZW50W10ge1xyXG4gIHJldHVybiBub2RlLnByb3BlcnRpZXNcclxuICAgIC5maWx0ZXIocHJvcCA9PiB0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wKSlcclxuICAgIC8vIEZpbHRlciBvdXQgZXZlcnkgZmllbGRzIHRoYXQncyBub3QgXCJtZXRhZGF0YUZpZWxkXCIuIEFsc28gaGFuZGxlcyBzdHJpbmcgbGl0ZXJhbHNcclxuICAgIC8vIChidXQgbm90IGV4cHJlc3Npb25zKS5cclxuICAgIC5maWx0ZXIoKHsgbmFtZSB9OiB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQpID0+IHtcclxuICAgICAgcmV0dXJuICh0cy5pc0lkZW50aWZpZXIobmFtZSkgfHwgdHMuaXNTdHJpbmdMaXRlcmFsKG5hbWUpKVxyXG4gICAgICAgICYmIG5hbWUuZ2V0VGV4dCgpID09PSBtZXRhZGF0YUZpZWxkO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRTeW1ib2xUb05nTW9kdWxlTWV0YWRhdGEoXHJcbiAgc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxyXG4gIG5nTW9kdWxlUGF0aDogc3RyaW5nLFxyXG4gIG1ldGFkYXRhRmllbGQ6IHN0cmluZyxcclxuICBzeW1ib2xOYW1lOiBzdHJpbmcsXHJcbiAgaW1wb3J0UGF0aDogc3RyaW5nIHwgbnVsbCA9IG51bGwsXHJcbik6IENoYW5nZVtdIHtcclxuICBjb25zdCBub2RlcyA9IGdldERlY29yYXRvck1ldGFkYXRhKHNvdXJjZSwgJ05nTW9kdWxlJywgJ0Bhbmd1bGFyL2NvcmUnKTtcclxuICBsZXQgbm9kZTogYW55ID0gbm9kZXNbMF07ICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLWFueVxyXG5cclxuICAvLyBGaW5kIHRoZSBkZWNvcmF0b3IgZGVjbGFyYXRpb24uXHJcbiAgaWYgKCFub2RlKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICAvLyBHZXQgYWxsIHRoZSBjaGlsZHJlbiBwcm9wZXJ0eSBhc3NpZ25tZW50IG9mIG9iamVjdCBsaXRlcmFscy5cclxuICBjb25zdCBtYXRjaGluZ1Byb3BlcnRpZXMgPSBnZXRNZXRhZGF0YUZpZWxkKFxyXG4gICAgbm9kZSBhcyB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbixcclxuICAgIG1ldGFkYXRhRmllbGQsXHJcbiAgKTtcclxuXHJcbiAgLy8gR2V0IHRoZSBsYXN0IG5vZGUgb2YgdGhlIGFycmF5IGxpdGVyYWwuXHJcbiAgaWYgKCFtYXRjaGluZ1Byb3BlcnRpZXMpIHtcclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcbiAgaWYgKG1hdGNoaW5nUHJvcGVydGllcy5sZW5ndGggPT0gMCkge1xyXG4gICAgLy8gV2UgaGF2ZW4ndCBmb3VuZCB0aGUgZmllbGQgaW4gdGhlIG1ldGFkYXRhIGRlY2xhcmF0aW9uLiBJbnNlcnQgYSBuZXcgZmllbGQuXHJcbiAgICBjb25zdCBleHByID0gbm9kZSBhcyB0cy5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbjtcclxuICAgIGxldCBwb3NpdGlvbjogbnVtYmVyO1xyXG4gICAgbGV0IHRvSW5zZXJ0OiBzdHJpbmc7XHJcbiAgICBpZiAoZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHBvc2l0aW9uID0gZXhwci5nZXRFbmQoKSAtIDE7XHJcbiAgICAgIHRvSW5zZXJ0ID0gYCAgJHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dXFxuYDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5vZGUgPSBleHByLnByb3BlcnRpZXNbZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCAtIDFdO1xyXG4gICAgICBwb3NpdGlvbiA9IG5vZGUuZ2V0RW5kKCk7XHJcbiAgICAgIC8vIEdldCB0aGUgaW5kZW50YXRpb24gb2YgdGhlIGxhc3QgZWxlbWVudCwgaWYgYW55LlxyXG4gICAgICBjb25zdCB0ZXh0ID0gbm9kZS5nZXRGdWxsVGV4dChzb3VyY2UpO1xyXG4gICAgICBjb25zdCBtYXRjaGVzID0gdGV4dC5tYXRjaCgvXlxccj9cXG5cXHMqLyk7XHJcbiAgICAgIGlmIChtYXRjaGVzICYmIG1hdGNoZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRvSW5zZXJ0ID0gYCwke21hdGNoZXNbMF19JHttZXRhZGF0YUZpZWxkfTogWyR7c3ltYm9sTmFtZX1dYDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0b0luc2VydCA9IGAsICR7bWV0YWRhdGFGaWVsZH06IFske3N5bWJvbE5hbWV9XWA7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChpbXBvcnRQYXRoICE9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgbmV3IEluc2VydENoYW5nZShuZ01vZHVsZVBhdGgsIHBvc2l0aW9uLCB0b0luc2VydCksXHJcbiAgICAgICAgaW5zZXJ0SW1wb3J0KHNvdXJjZSwgbmdNb2R1bGVQYXRoLCBzeW1ib2xOYW1lLnJlcGxhY2UoL1xcLi4qJC8sICcnKSwgaW1wb3J0UGF0aCksXHJcbiAgICAgIF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gW25ldyBJbnNlcnRDaGFuZ2UobmdNb2R1bGVQYXRoLCBwb3NpdGlvbiwgdG9JbnNlcnQpXTtcclxuICAgIH1cclxuICB9XHJcbiAgY29uc3QgYXNzaWdubWVudCA9IG1hdGNoaW5nUHJvcGVydGllc1swXSBhcyB0cy5Qcm9wZXJ0eUFzc2lnbm1lbnQ7XHJcblxyXG4gIC8vIElmIGl0J3Mgbm90IGFuIGFycmF5LCBub3RoaW5nIHdlIGNhbiBkbyByZWFsbHkuXHJcbiAgaWYgKGFzc2lnbm1lbnQuaW5pdGlhbGl6ZXIua2luZCAhPT0gdHMuU3ludGF4S2luZC5BcnJheUxpdGVyYWxFeHByZXNzaW9uKSB7XHJcbiAgICByZXR1cm4gW107XHJcbiAgfVxyXG5cclxuICBjb25zdCBhcnJMaXRlcmFsID0gYXNzaWdubWVudC5pbml0aWFsaXplciBhcyB0cy5BcnJheUxpdGVyYWxFeHByZXNzaW9uO1xyXG4gIGlmIChhcnJMaXRlcmFsLmVsZW1lbnRzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAvLyBGb3J3YXJkIHRoZSBwcm9wZXJ0eS5cclxuICAgIG5vZGUgPSBhcnJMaXRlcmFsO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBub2RlID0gYXJyTGl0ZXJhbC5lbGVtZW50cztcclxuICB9XHJcblxyXG4gIGlmICghbm9kZSkge1xyXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBuby1jb25zb2xlXHJcbiAgICBjb25zb2xlLmVycm9yKCdObyBhcHAgbW9kdWxlIGZvdW5kLiBQbGVhc2UgYWRkIHlvdXIgbmV3IGNsYXNzIHRvIHlvdXIgY29tcG9uZW50LicpO1xyXG5cclxuICAgIHJldHVybiBbXTtcclxuICB9XHJcblxyXG4gIGlmIChBcnJheS5pc0FycmF5KG5vZGUpKSB7XHJcbiAgICBjb25zdCBub2RlQXJyYXkgPSBub2RlIGFzIHt9IGFzIEFycmF5PHRzLk5vZGU+O1xyXG4gICAgY29uc3Qgc3ltYm9sc0FycmF5ID0gbm9kZUFycmF5Lm1hcChub2RlID0+IG5vZGUuZ2V0VGV4dCgpKTtcclxuICAgIGlmIChzeW1ib2xzQXJyYXkuaW5jbHVkZXMoc3ltYm9sTmFtZSkpIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG5cclxuICAgIG5vZGUgPSBub2RlW25vZGUubGVuZ3RoIC0gMV07XHJcbiAgfVxyXG5cclxuICBsZXQgdG9JbnNlcnQ6IHN0cmluZztcclxuICBsZXQgcG9zaXRpb24gPSBub2RlLmdldEVuZCgpO1xyXG4gIGlmIChub2RlLmtpbmQgPT0gdHMuU3ludGF4S2luZC5PYmplY3RMaXRlcmFsRXhwcmVzc2lvbikge1xyXG4gICAgLy8gV2UgaGF2ZW4ndCBmb3VuZCB0aGUgZmllbGQgaW4gdGhlIG1ldGFkYXRhIGRlY2xhcmF0aW9uLiBJbnNlcnQgYSBuZXdcclxuICAgIC8vIGZpZWxkLlxyXG4gICAgY29uc3QgZXhwciA9IG5vZGUgYXMgdHMuT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb247XHJcbiAgICBpZiAoZXhwci5wcm9wZXJ0aWVzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIHBvc2l0aW9uID0gZXhwci5nZXRFbmQoKSAtIDE7XHJcbiAgICAgIHRvSW5zZXJ0ID0gYCAgJHtzeW1ib2xOYW1lfVxcbmA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBHZXQgdGhlIGluZGVudGF0aW9uIG9mIHRoZSBsYXN0IGVsZW1lbnQsIGlmIGFueS5cclxuICAgICAgY29uc3QgdGV4dCA9IG5vZGUuZ2V0RnVsbFRleHQoc291cmNlKTtcclxuICAgICAgaWYgKHRleHQubWF0Y2goL15cXHI/XFxyP1xcbi8pKSB7XHJcbiAgICAgICAgdG9JbnNlcnQgPSBgLCR7dGV4dC5tYXRjaCgvXlxccj9cXG5cXHMqLylbMF19JHtzeW1ib2xOYW1lfWA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdG9JbnNlcnQgPSBgLCAke3N5bWJvbE5hbWV9YDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAobm9kZS5raW5kID09IHRzLlN5bnRheEtpbmQuQXJyYXlMaXRlcmFsRXhwcmVzc2lvbikge1xyXG4gICAgLy8gV2UgZm91bmQgdGhlIGZpZWxkIGJ1dCBpdCdzIGVtcHR5LiBJbnNlcnQgaXQganVzdCBiZWZvcmUgdGhlIGBdYC5cclxuICAgIHBvc2l0aW9uLS07XHJcbiAgICB0b0luc2VydCA9IGAke3N5bWJvbE5hbWV9YDtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gR2V0IHRoZSBpbmRlbnRhdGlvbiBvZiB0aGUgbGFzdCBlbGVtZW50LCBpZiBhbnkuXHJcbiAgICBjb25zdCB0ZXh0ID0gbm9kZS5nZXRGdWxsVGV4dChzb3VyY2UpO1xyXG4gICAgaWYgKHRleHQubWF0Y2goL15cXHI/XFxuLykpIHtcclxuICAgICAgdG9JbnNlcnQgPSBgLCR7dGV4dC5tYXRjaCgvXlxccj9cXG4oXFxyPylcXHMqLylbMF19JHtzeW1ib2xOYW1lfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0b0luc2VydCA9IGAsICR7c3ltYm9sTmFtZX1gO1xyXG4gICAgfVxyXG4gIH1cclxuICBpZiAoaW1wb3J0UGF0aCAhPT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIFtcclxuICAgICAgbmV3IEluc2VydENoYW5nZShuZ01vZHVsZVBhdGgsIHBvc2l0aW9uLCB0b0luc2VydCksXHJcbiAgICAgIGluc2VydEltcG9ydChzb3VyY2UsIG5nTW9kdWxlUGF0aCwgc3ltYm9sTmFtZS5yZXBsYWNlKC9cXC4uKiQvLCAnJyksIGltcG9ydFBhdGgpLFxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIHJldHVybiBbbmV3IEluc2VydENoYW5nZShuZ01vZHVsZVBhdGgsIHBvc2l0aW9uLCB0b0luc2VydCldO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VzdG9tIGZ1bmN0aW9uIHRvIGluc2VydCBhIGRlY2xhcmF0aW9uIChjb21wb25lbnQsIHBpcGUsIGRpcmVjdGl2ZSlcclxuICogaW50byBOZ01vZHVsZSBkZWNsYXJhdGlvbnMuIEl0IGFsc28gaW1wb3J0cyB0aGUgY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZERlY2xhcmF0aW9uVG9Nb2R1bGUoc291cmNlOiB0cy5Tb3VyY2VGaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGVQYXRoOiBzdHJpbmcsIGNsYXNzaWZpZWROYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydFBhdGg6IHN0cmluZyk6IENoYW5nZVtdIHtcclxuICByZXR1cm4gYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKFxyXG4gICAgc291cmNlLCBtb2R1bGVQYXRoLCAnZGVjbGFyYXRpb25zJywgY2xhc3NpZmllZE5hbWUsIGltcG9ydFBhdGgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VzdG9tIGZ1bmN0aW9uIHRvIGluc2VydCBhbiBOZ01vZHVsZSBpbnRvIE5nTW9kdWxlIGltcG9ydHMuIEl0IGFsc28gaW1wb3J0cyB0aGUgbW9kdWxlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZEltcG9ydFRvTW9kdWxlKHNvdXJjZTogdHMuU291cmNlRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IHN0cmluZywgY2xhc3NpZmllZE5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydFBhdGg6IHN0cmluZyk6IENoYW5nZVtdIHtcclxuXHJcbiAgcmV0dXJuIGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShzb3VyY2UsIG1vZHVsZVBhdGgsICdpbXBvcnRzJywgY2xhc3NpZmllZE5hbWUsIGltcG9ydFBhdGgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3VzdG9tIGZ1bmN0aW9uIHRvIGluc2VydCBhbiBleHBvcnQgaW50byBOZ01vZHVsZS4gSXQgYWxzbyBpbXBvcnRzIGl0LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV4cG9ydFRvTW9kdWxlKHNvdXJjZTogdHMuU291cmNlRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZHVsZVBhdGg6IHN0cmluZywgY2xhc3NpZmllZE5hbWU6IHN0cmluZyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydFBhdGg6IHN0cmluZyk6IENoYW5nZVtdIHtcclxuICByZXR1cm4gYWRkU3ltYm9sVG9OZ01vZHVsZU1ldGFkYXRhKHNvdXJjZSwgbW9kdWxlUGF0aCwgJ2V4cG9ydHMnLCBjbGFzc2lmaWVkTmFtZSwgaW1wb3J0UGF0aCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDdXN0b20gZnVuY3Rpb24gdG8gaW5zZXJ0IGFuIGVudHJ5Q29tcG9uZW50IGludG8gTmdNb2R1bGUuIEl0IGFsc28gaW1wb3J0cyBpdC5cclxuICogQGRlcHJlY2F0ZWQgLSBTaW5jZSB2ZXJzaW9uIDkuMC4wIHdpdGggSXZ5LCBlbnRyeUNvbXBvbmVudHMgaXMgbm8gbG9uZ2VyIG5lY2Vzc2FyeS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRFbnRyeUNvbXBvbmVudFRvTW9kdWxlKHNvdXJjZTogdHMuU291cmNlRmlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlUGF0aDogc3RyaW5nLCBjbGFzc2lmaWVkTmFtZTogc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBvcnRQYXRoOiBzdHJpbmcpOiBDaGFuZ2VbXSB7XHJcbiAgcmV0dXJuIGFkZFN5bWJvbFRvTmdNb2R1bGVNZXRhZGF0YShcclxuICAgIHNvdXJjZSwgbW9kdWxlUGF0aCxcclxuICAgICdlbnRyeUNvbXBvbmVudHMnLCBjbGFzc2lmaWVkTmFtZSwgaW1wb3J0UGF0aCxcclxuICApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZEJvb3RzdHJhcE1vZHVsZUNhbGwoaG9zdDogVHJlZSwgbWFpblBhdGg6IHN0cmluZyk6IHRzLkNhbGxFeHByZXNzaW9uIHwgbnVsbCB7XHJcbiAgY29uc3QgbWFpbkJ1ZmZlciA9IGhvc3QucmVhZChtYWluUGF0aCk7XHJcbiAgaWYgKCFtYWluQnVmZmVyKSB7XHJcbiAgICB0aHJvdyBuZXcgU2NoZW1hdGljc0V4Y2VwdGlvbihgTWFpbiBmaWxlICgke21haW5QYXRofSkgbm90IGZvdW5kYCk7XHJcbiAgfVxyXG4gIGNvbnN0IG1haW5UZXh0ID0gbWFpbkJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcclxuICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKG1haW5QYXRoLCBtYWluVGV4dCwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XHJcblxyXG4gIGNvbnN0IGFsbE5vZGVzID0gZ2V0U291cmNlTm9kZXMoc291cmNlKTtcclxuXHJcbiAgbGV0IGJvb3RzdHJhcENhbGw6IHRzLkNhbGxFeHByZXNzaW9uIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gIGZvciAoY29uc3Qgbm9kZSBvZiBhbGxOb2Rlcykge1xyXG5cclxuICAgIGxldCBib290c3RyYXBDYWxsTm9kZTogdHMuTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgYm9vdHN0cmFwQ2FsbE5vZGUgPSBmaW5kTm9kZShub2RlLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsICdib290c3RyYXBNb2R1bGUnKTtcclxuXHJcbiAgICAvLyBXYWxrIHVwIHRoZSBwYXJlbnQgdW50aWwgQ2FsbEV4cHJlc3Npb24gaXMgZm91bmQuXHJcbiAgICB3aGlsZSAoYm9vdHN0cmFwQ2FsbE5vZGUgJiYgYm9vdHN0cmFwQ2FsbE5vZGUucGFyZW50XHJcbiAgICAmJiBib290c3RyYXBDYWxsTm9kZS5wYXJlbnQua2luZCAhPT0gdHMuU3ludGF4S2luZC5DYWxsRXhwcmVzc2lvbikge1xyXG5cclxuICAgICAgYm9vdHN0cmFwQ2FsbE5vZGUgPSBib290c3RyYXBDYWxsTm9kZS5wYXJlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJvb3RzdHJhcENhbGxOb2RlICE9PSBudWxsICYmXHJcbiAgICAgIGJvb3RzdHJhcENhbGxOb2RlLnBhcmVudCAhPT0gdW5kZWZpbmVkICYmXHJcbiAgICAgIGJvb3RzdHJhcENhbGxOb2RlLnBhcmVudC5raW5kID09PSB0cy5TeW50YXhLaW5kLkNhbGxFeHByZXNzaW9uKSB7XHJcbiAgICAgIGJvb3RzdHJhcENhbGwgPSBib290c3RyYXBDYWxsTm9kZS5wYXJlbnQgYXMgdHMuQ2FsbEV4cHJlc3Npb247XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJvb3RzdHJhcENhbGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aChob3N0OiBUcmVlLCBtYWluUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBib290c3RyYXBDYWxsID0gZmluZEJvb3RzdHJhcE1vZHVsZUNhbGwoaG9zdCwgbWFpblBhdGgpO1xyXG4gIGlmICghYm9vdHN0cmFwQ2FsbCkge1xyXG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oJ0Jvb3RzdHJhcCBjYWxsIG5vdCBmb3VuZCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYm9vdHN0cmFwTW9kdWxlID0gYm9vdHN0cmFwQ2FsbC5hcmd1bWVudHNbMF07XHJcblxyXG4gIGNvbnN0IG1haW5CdWZmZXIgPSBob3N0LnJlYWQobWFpblBhdGgpO1xyXG4gIGlmICghbWFpbkJ1ZmZlcikge1xyXG4gICAgdGhyb3cgbmV3IFNjaGVtYXRpY3NFeGNlcHRpb24oYENsaWVudCBhcHAgbWFpbiBmaWxlICgke21haW5QYXRofSkgbm90IGZvdW5kYCk7XHJcbiAgfVxyXG4gIGNvbnN0IG1haW5UZXh0ID0gbWFpbkJ1ZmZlci50b1N0cmluZygndXRmLTgnKTtcclxuICBjb25zdCBzb3VyY2UgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKG1haW5QYXRoLCBtYWluVGV4dCwgdHMuU2NyaXB0VGFyZ2V0LkxhdGVzdCwgdHJ1ZSk7XHJcbiAgY29uc3QgYWxsTm9kZXMgPSBnZXRTb3VyY2VOb2Rlcyhzb3VyY2UpO1xyXG4gIGNvbnN0IGJvb3RzdHJhcE1vZHVsZVJlbGF0aXZlUGF0aCA9IGFsbE5vZGVzXHJcbiAgICAuZmlsdGVyKG5vZGUgPT4gbm9kZS5raW5kID09PSB0cy5TeW50YXhLaW5kLkltcG9ydERlY2xhcmF0aW9uKVxyXG4gICAgLmZpbHRlcihpbXAgPT4ge1xyXG4gICAgICByZXR1cm4gZmluZE5vZGUoaW1wLCB0cy5TeW50YXhLaW5kLklkZW50aWZpZXIsIGJvb3RzdHJhcE1vZHVsZS5nZXRUZXh0KCkpO1xyXG4gICAgfSlcclxuICAgIC5tYXAoKGltcDogdHMuSW1wb3J0RGVjbGFyYXRpb24pID0+IHtcclxuICAgICAgY29uc3QgbW9kdWxlUGF0aFN0cmluZ0xpdGVyYWwgPSBpbXAubW9kdWxlU3BlY2lmaWVyIGFzIHRzLlN0cmluZ0xpdGVyYWw7XHJcblxyXG4gICAgICByZXR1cm4gbW9kdWxlUGF0aFN0cmluZ0xpdGVyYWwudGV4dDtcclxuICAgIH0pWzBdO1xyXG5cclxuICByZXR1cm4gYm9vdHN0cmFwTW9kdWxlUmVsYXRpdmVQYXRoO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXBwTW9kdWxlUGF0aChob3N0OiBUcmVlLCBtYWluUGF0aDogc3RyaW5nKTogc3RyaW5nIHtcclxuICBjb25zdCBtb2R1bGVSZWxhdGl2ZVBhdGggPSBmaW5kQm9vdHN0cmFwTW9kdWxlUGF0aChob3N0LCBtYWluUGF0aCk7XHJcbiAgY29uc3QgbWFpbkRpciA9IGRpcm5hbWUobWFpblBhdGgpO1xyXG4gIGNvbnN0IG1vZHVsZVBhdGggPSBub3JtYWxpemUoYC8ke21haW5EaXJ9LyR7bW9kdWxlUmVsYXRpdmVQYXRofS50c2ApO1xyXG5cclxuICByZXR1cm4gbW9kdWxlUGF0aDtcclxufVxyXG4iXX0=