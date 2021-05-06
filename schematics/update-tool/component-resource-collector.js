"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentResourceCollector = void 0;
const path_1 = require("path");
const ts = require("typescript");
const decorators_1 = require("./utils/decorators");
const functions_1 = require("./utils/functions");
const line_mappings_1 = require("./utils/line-mappings");
const property_name_1 = require("./utils/property-name");
/**
 * Collector that can be used to find Angular templates and stylesheets referenced within
 * given TypeScript source files (inline or external referenced files)
 */
class ComponentResourceCollector {
    constructor(typeChecker, _fileSystem) {
        this.typeChecker = typeChecker;
        this._fileSystem = _fileSystem;
        this.resolvedTemplates = [];
        this.resolvedStylesheets = [];
    }
    visitNode(node) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            this._visitClassDeclaration(node);
        }
    }
    _visitClassDeclaration(node) {
        if (!node.decorators || !node.decorators.length) {
            return;
        }
        const ngDecorators = decorators_1.getAngularDecorators(this.typeChecker, node.decorators);
        const componentDecorator = ngDecorators.find(dec => dec.name === 'Component');
        // In case no "@Component" decorator could be found on the current class, skip.
        if (!componentDecorator) {
            return;
        }
        const decoratorCall = componentDecorator.node.expression;
        // In case the component decorator call is not valid, skip this class declaration.
        if (decoratorCall.arguments.length !== 1) {
            return;
        }
        const componentMetadata = functions_1.unwrapExpression(decoratorCall.arguments[0]);
        // Ensure that the component metadata is an object literal expression.
        if (!ts.isObjectLiteralExpression(componentMetadata)) {
            return;
        }
        const sourceFile = node.getSourceFile();
        const filePath = this._fileSystem.resolve(sourceFile.fileName);
        const sourceFileDirPath = path_1.dirname(sourceFile.fileName);
        // Walk through all component metadata properties and determine the referenced
        // HTML templates (either external or inline)
        componentMetadata.properties.forEach(property => {
            if (!ts.isPropertyAssignment(property)) {
                return;
            }
            const propertyName = property_name_1.getPropertyNameText(property.name);
            if (propertyName === 'styles' && ts.isArrayLiteralExpression(property.initializer)) {
                property.initializer.elements.forEach(el => {
                    if (ts.isStringLiteralLike(el)) {
                        // Need to add an offset of one to the start because the template quotes are
                        // not part of the template content.
                        const templateStartIdx = el.getStart() + 1;
                        this.resolvedStylesheets.push({
                            filePath,
                            container: node,
                            content: el.text,
                            inline: true,
                            start: templateStartIdx,
                            getCharacterAndLineOfPosition: pos => ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx),
                        });
                    }
                });
            }
            // In case there is an inline template specified, ensure that the value is statically
            // analyzable by checking if the initializer is a string literal-like node.
            if (propertyName === 'template' && ts.isStringLiteralLike(property.initializer)) {
                // Need to add an offset of one to the start because the template quotes are
                // not part of the template content.
                const templateStartIdx = property.initializer.getStart() + 1;
                this.resolvedTemplates.push({
                    filePath,
                    container: node,
                    content: property.initializer.text,
                    inline: true,
                    start: templateStartIdx,
                    getCharacterAndLineOfPosition: pos => ts.getLineAndCharacterOfPosition(sourceFile, pos + templateStartIdx)
                });
            }
            if (propertyName === 'styleUrls' && ts.isArrayLiteralExpression(property.initializer)) {
                property.initializer.elements.forEach(el => {
                    if (ts.isStringLiteralLike(el)) {
                        const stylesheetPath = this._fileSystem.resolve(sourceFileDirPath, el.text);
                        const stylesheet = this.resolveExternalStylesheet(stylesheetPath, node);
                        if (stylesheet) {
                            this.resolvedStylesheets.push(stylesheet);
                        }
                    }
                });
            }
            if (propertyName === 'templateUrl' && ts.isStringLiteralLike(property.initializer)) {
                const templateUrl = property.initializer.text;
                const templatePath = this._fileSystem.resolve(sourceFileDirPath, templateUrl);
                // In case the template does not exist in the file system, skip this
                // external template.
                if (!this._fileSystem.exists(templatePath)) {
                    return;
                }
                const fileContent = this._fileSystem.read(templatePath);
                if (fileContent) {
                    const lineStartsMap = line_mappings_1.computeLineStartsMap(fileContent);
                    this.resolvedTemplates.push({
                        filePath: templatePath,
                        container: node,
                        content: fileContent,
                        inline: false,
                        start: 0,
                        getCharacterAndLineOfPosition: p => line_mappings_1.getLineAndCharacterFromPosition(lineStartsMap, p),
                    });
                }
            }
        });
    }
    /** Resolves an external stylesheet by reading its content and computing line mappings. */
    resolveExternalStylesheet(filePath, container) {
        const fileContent = this._fileSystem.read(filePath);
        if (!fileContent) {
            return null;
        }
        const lineStartsMap = line_mappings_1.computeLineStartsMap(fileContent);
        return {
            filePath: filePath,
            container: container,
            content: fileContent,
            inline: false,
            start: 0,
            getCharacterAndLineOfPosition: pos => line_mappings_1.getLineAndCharacterFromPosition(lineStartsMap, pos),
        };
    }
}
exports.ComponentResourceCollector = ComponentResourceCollector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy91cGRhdGUtdG9vbC9jb21wb25lbnQtcmVzb3VyY2UtY29sbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUE2QjtBQUM3QixpQ0FBaUM7QUFFakMsbURBQXdEO0FBQ3hELGlEQUFtRDtBQUNuRCx5REFJK0I7QUFDL0IseURBQTBEO0FBcUIxRDs7O0dBR0c7QUFDSCxNQUFhLDBCQUEwQjtJQUlyQyxZQUFtQixXQUEyQixFQUFVLFdBQXVCO1FBQTVELGdCQUFXLEdBQVgsV0FBVyxDQUFnQjtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFZO1FBSC9FLHNCQUFpQixHQUF1QixFQUFFLENBQUM7UUFDM0Msd0JBQW1CLEdBQXVCLEVBQUUsQ0FBQztJQUVxQyxDQUFDO0lBRW5GLFNBQVMsQ0FBQyxJQUFhO1FBQ3JCLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFO1lBQ2hELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUEyQixDQUFDLENBQUM7U0FDMUQ7SUFDSCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsSUFBeUI7UUFDdEQsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUMvQyxPQUFPO1NBQ1I7UUFFRCxNQUFNLFlBQVksR0FBRyxpQ0FBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3RSxNQUFNLGtCQUFrQixHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO1FB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aUJBQWlCLENBQUMsSUFBSSxDQUFDO3dCQUMxQixRQUFRLEVBQUUsWUFBWTt3QkFDdEIsU0FBUyxFQUFFLElBQUk7d0JBQ2YsT0FBTyxFQUFFLFdBQVc7d0JBQ3BCLE1BQU0sRUFBRSxLQUFLO3dCQUNiLEtBQUssRUFBRSxDQUFDO3dCQUNSLDZCQUE2QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsK0NBQStCLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztxQkFDdEYsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwwRkFBMEY7SUFDMUYseUJBQXlCLENBQUMsUUFBdUIsRUFBRSxTQUFtQztRQUVwRixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2hCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLGFBQWEsR0FBRyxvQ0FBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUV4RCxPQUFPO1lBQ0wsUUFBUSxFQUFFLFFBQVE7WUFDbEIsU0FBUyxFQUFFLFNBQVM7WUFDcEIsT0FBTyxFQUFFLFdBQVc7WUFDcEIsTUFBTSxFQUFFLEtBQUs7WUFDYixLQUFLLEVBQUUsQ0FBQztZQUNSLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsK0NBQStCLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztTQUMxRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBckpELGdFQXFKQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtkaXJuYW1lfSBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7RmlsZVN5c3RlbSwgV29ya3NwYWNlUGF0aH0gZnJvbSAnLi9maWxlLXN5c3RlbSc7XHJcbmltcG9ydCB7Z2V0QW5ndWxhckRlY29yYXRvcnN9IGZyb20gJy4vdXRpbHMvZGVjb3JhdG9ycyc7XHJcbmltcG9ydCB7dW53cmFwRXhwcmVzc2lvbn0gZnJvbSAnLi91dGlscy9mdW5jdGlvbnMnO1xyXG5pbXBvcnQge1xyXG4gIGNvbXB1dGVMaW5lU3RhcnRzTWFwLFxyXG4gIGdldExpbmVBbmRDaGFyYWN0ZXJGcm9tUG9zaXRpb24sXHJcbiAgTGluZUFuZENoYXJhY3RlclxyXG59IGZyb20gJy4vdXRpbHMvbGluZS1tYXBwaW5ncyc7XHJcbmltcG9ydCB7Z2V0UHJvcGVydHlOYW1lVGV4dH0gZnJvbSAnLi91dGlscy9wcm9wZXJ0eS1uYW1lJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVzb2x2ZWRSZXNvdXJjZSB7XHJcbiAgLyoqIENsYXNzIGRlY2xhcmF0aW9uIHRoYXQgY29udGFpbnMgdGhpcyByZXNvdXJjZS4gKi9cclxuICBjb250YWluZXI6IHRzLkNsYXNzRGVjbGFyYXRpb258bnVsbDtcclxuICAvKiogRmlsZSBjb250ZW50IG9mIHRoZSBnaXZlbiB0ZW1wbGF0ZS4gKi9cclxuICBjb250ZW50OiBzdHJpbmc7XHJcbiAgLyoqIFN0YXJ0IG9mZnNldCBvZiB0aGUgcmVzb3VyY2UgY29udGVudCAoZS5nLiBpbiB0aGUgaW5saW5lIHNvdXJjZSBmaWxlKSAqL1xyXG4gIHN0YXJ0OiBudW1iZXI7XHJcbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIHJlc291cmNlIGlzIGlubGluZSBvciBub3QuICovXHJcbiAgaW5saW5lOiBib29sZWFuO1xyXG4gIC8qKiBQYXRoIHRvIHRoZSBmaWxlIHRoYXQgY29udGFpbnMgdGhpcyByZXNvdXJjZS4gKi9cclxuICBmaWxlUGF0aDogV29ya3NwYWNlUGF0aDtcclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBjaGFyYWN0ZXIgYW5kIGxpbmUgb2YgYSBnaXZlbiBwb3NpdGlvbiBpbmRleCBpbiB0aGUgcmVzb3VyY2UuXHJcbiAgICogSWYgdGhlIHJlc291cmNlIGlzIGRlY2xhcmVkIGlubGluZSB3aXRoaW4gYSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlLCB0aGUgbGluZSBhbmRcclxuICAgKiBjaGFyYWN0ZXIgYXJlIGJhc2VkIG9uIHRoZSBmdWxsIHNvdXJjZSBmaWxlIGNvbnRlbnQuXHJcbiAgICovXHJcbiAgZ2V0Q2hhcmFjdGVyQW5kTGluZU9mUG9zaXRpb246IChwb3M6IG51bWJlcikgPT4gTGluZUFuZENoYXJhY3RlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbGxlY3RvciB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgQW5ndWxhciB0ZW1wbGF0ZXMgYW5kIHN0eWxlc2hlZXRzIHJlZmVyZW5jZWQgd2l0aGluXHJcbiAqIGdpdmVuIFR5cGVTY3JpcHQgc291cmNlIGZpbGVzIChpbmxpbmUgb3IgZXh0ZXJuYWwgcmVmZXJlbmNlZCBmaWxlcylcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRSZXNvdXJjZUNvbGxlY3RvciB7XHJcbiAgcmVzb2x2ZWRUZW1wbGF0ZXM6IFJlc29sdmVkUmVzb3VyY2VbXSA9IFtdO1xyXG4gIHJlc29sdmVkU3R5bGVzaGVldHM6IFJlc29sdmVkUmVzb3VyY2VbXSA9IFtdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBwcml2YXRlIF9maWxlU3lzdGVtOiBGaWxlU3lzdGVtKSB7fVxyXG5cclxuICB2aXNpdE5vZGUobm9kZTogdHMuTm9kZSkge1xyXG4gICAgaWYgKG5vZGUua2luZCA9PT0gdHMuU3ludGF4S2luZC5DbGFzc0RlY2xhcmF0aW9uKSB7XHJcbiAgICAgIHRoaXMuX3Zpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlIGFzIHRzLkNsYXNzRGVjbGFyYXRpb24pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IHRzLkNsYXNzRGVjbGFyYXRpb24pIHtcclxuICAgIGlmICghbm9kZS5kZWNvcmF0b3JzIHx8ICFub2RlLmRlY29yYXRvcnMubGVuZ3RoKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZ0RlY29yYXRvcnMgPSBnZXRBbmd1bGFyRGVjb3JhdG9ycyh0aGlzLnR5cGVDaGVja2VyLCBub2RlLmRlY29yYXRvcnMpO1xyXG4gICAgY29uc3QgY29tcG9uZW50RGVjb3JhdG9yID0gbmdEZWNvcmF0b3JzLmZpbmQoZGVjID0+IGRlYy5uYW1lID09PSAnQ29tcG9uZW50Jyk7XHJcblxyXG4gICAgLy8gSW4gY2FzZSBubyBcIkBDb21wb25lbnRcIiBkZWNvcmF0b3IgY291bGQgYmUgZm91bmQgb24gdGhlIGN1cnJlbnQgY2xhc3MsIHNraXAuXHJcbiAgICBpZiAoIWNvbXBvbmVudERlY29yYXRvcikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGVjb3JhdG9yQ2FsbCA9IGNvbXBvbmVudERlY29yYXRvci5ub2RlLmV4cHJlc3Npb247XHJcblxyXG4gICAgLy8gSW4gY2FzZSB0aGUgY29tcG9uZW50IGRlY29yYXRvciBjYWxsIGlzIG5vdCB2YWxpZCwgc2tpcCB0aGlzIGNsYXNzIGRlY2xhcmF0aW9uLlxyXG4gICAgaWYgKGRlY29yYXRvckNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50TWV0YWRhdGEgPSB1bndyYXBFeHByZXNzaW9uKGRlY29yYXRvckNhbGwuYXJndW1lbnRzWzBdKTtcclxuXHJcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgY29tcG9uZW50IG1ldGFkYXRhIGlzIGFuIG9iamVjdCBsaXRlcmFsIGV4cHJlc3Npb24uXHJcbiAgICBpZiAoIXRzLmlzT2JqZWN0TGl0ZXJhbEV4cHJlc3Npb24oY29tcG9uZW50TWV0YWRhdGEpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzb3VyY2VGaWxlID0gbm9kZS5nZXRTb3VyY2VGaWxlKCk7XHJcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuX2ZpbGVTeXN0ZW0ucmVzb2x2ZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcclxuICAgIGNvbnN0IHNvdXJjZUZpbGVEaXJQYXRoID0gZGlybmFtZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcclxuXHJcbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGNvbXBvbmVudCBtZXRhZGF0YSBwcm9wZXJ0aWVzIGFuZCBkZXRlcm1pbmUgdGhlIHJlZmVyZW5jZWRcclxuICAgIC8vIEhUTUwgdGVtcGxhdGVzIChlaXRoZXIgZXh0ZXJuYWwgb3IgaW5saW5lKVxyXG4gICAgY29tcG9uZW50TWV0YWRhdGEucHJvcGVydGllcy5mb3JFYWNoKHByb3BlcnR5ID0+IHtcclxuICAgICAgaWYgKCF0cy5pc1Byb3BlcnR5QXNzaWdubWVudChwcm9wZXJ0eSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSA9IGdldFByb3BlcnR5TmFtZVRleHQocHJvcGVydHkubmFtZSk7XHJcblxyXG4gICAgICBpZiAocHJvcGVydHlOYW1lID09PSAnc3R5bGVzJyAmJiB0cy5pc0FycmF5TGl0ZXJhbEV4cHJlc3Npb24ocHJvcGVydHkuaW5pdGlhbGl6ZXIpKSB7XHJcbiAgICAgICAgcHJvcGVydHkuaW5pdGlhbGl6ZXIuZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XHJcbiAgICAgICAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShlbCkpIHtcclxuICAgICAgICAgICAgLy8gTmVlZCB0byBhZGQgYW4gb2Zmc2V0IG9mIG9uZSB0byB0aGUgc3RhcnQgYmVjYXVzZSB0aGUgdGVtcGxhdGUgcXVvdGVzIGFyZVxyXG4gICAgICAgICAgICAvLyBub3QgcGFydCBvZiB0aGUgdGVtcGxhdGUgY29udGVudC5cclxuICAgICAgICAgICAgY29uc3QgdGVtcGxhdGVTdGFydElkeCA9IGVsLmdldFN0YXJ0KCkgKyAxO1xyXG4gICAgICAgICAgICB0aGlzLnJlc29sdmVkU3R5bGVzaGVldHMucHVzaCh7XHJcbiAgICAgICAgICAgICAgZmlsZVBhdGgsXHJcbiAgICAgICAgICAgICAgY29udGFpbmVyOiBub2RlLFxyXG4gICAgICAgICAgICAgIGNvbnRlbnQ6IGVsLnRleHQsXHJcbiAgICAgICAgICAgICAgaW5saW5lOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHN0YXJ0OiB0ZW1wbGF0ZVN0YXJ0SWR4LFxyXG4gICAgICAgICAgICAgIGdldENoYXJhY3RlckFuZExpbmVPZlBvc2l0aW9uOiBwb3MgPT5cclxuICAgICAgICAgICAgICAgICAgdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlRmlsZSwgcG9zICsgdGVtcGxhdGVTdGFydElkeCksXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJbiBjYXNlIHRoZXJlIGlzIGFuIGlubGluZSB0ZW1wbGF0ZSBzcGVjaWZpZWQsIGVuc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBzdGF0aWNhbGx5XHJcbiAgICAgIC8vIGFuYWx5emFibGUgYnkgY2hlY2tpbmcgaWYgdGhlIGluaXRpYWxpemVyIGlzIGEgc3RyaW5nIGxpdGVyYWwtbGlrZSBub2RlLlxyXG4gICAgICBpZiAocHJvcGVydHlOYW1lID09PSAndGVtcGxhdGUnICYmIHRzLmlzU3RyaW5nTGl0ZXJhbExpa2UocHJvcGVydHkuaW5pdGlhbGl6ZXIpKSB7XHJcbiAgICAgICAgLy8gTmVlZCB0byBhZGQgYW4gb2Zmc2V0IG9mIG9uZSB0byB0aGUgc3RhcnQgYmVjYXVzZSB0aGUgdGVtcGxhdGUgcXVvdGVzIGFyZVxyXG4gICAgICAgIC8vIG5vdCBwYXJ0IG9mIHRoZSB0ZW1wbGF0ZSBjb250ZW50LlxyXG4gICAgICAgIGNvbnN0IHRlbXBsYXRlU3RhcnRJZHggPSBwcm9wZXJ0eS5pbml0aWFsaXplci5nZXRTdGFydCgpICsgMTtcclxuICAgICAgICB0aGlzLnJlc29sdmVkVGVtcGxhdGVzLnB1c2goe1xyXG4gICAgICAgICAgZmlsZVBhdGgsXHJcbiAgICAgICAgICBjb250YWluZXI6IG5vZGUsXHJcbiAgICAgICAgICBjb250ZW50OiBwcm9wZXJ0eS5pbml0aWFsaXplci50ZXh0LFxyXG4gICAgICAgICAgaW5saW5lOiB0cnVlLFxyXG4gICAgICAgICAgc3RhcnQ6IHRlbXBsYXRlU3RhcnRJZHgsXHJcbiAgICAgICAgICBnZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbjogcG9zID0+XHJcbiAgICAgICAgICAgICAgdHMuZ2V0TGluZUFuZENoYXJhY3Rlck9mUG9zaXRpb24oc291cmNlRmlsZSwgcG9zICsgdGVtcGxhdGVTdGFydElkeClcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ3N0eWxlVXJscycgJiYgdHMuaXNBcnJheUxpdGVyYWxFeHByZXNzaW9uKHByb3BlcnR5LmluaXRpYWxpemVyKSkge1xyXG4gICAgICAgIHByb3BlcnR5LmluaXRpYWxpemVyLmVsZW1lbnRzLmZvckVhY2goZWwgPT4ge1xyXG4gICAgICAgICAgaWYgKHRzLmlzU3RyaW5nTGl0ZXJhbExpa2UoZWwpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlc2hlZXRQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGVEaXJQYXRoLCBlbC50ZXh0KTtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVzaGVldCA9IHRoaXMucmVzb2x2ZUV4dGVybmFsU3R5bGVzaGVldChzdHlsZXNoZWV0UGF0aCwgbm9kZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc3R5bGVzaGVldCkge1xyXG4gICAgICAgICAgICAgIHRoaXMucmVzb2x2ZWRTdHlsZXNoZWV0cy5wdXNoKHN0eWxlc2hlZXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChwcm9wZXJ0eU5hbWUgPT09ICd0ZW1wbGF0ZVVybCcgJiYgdHMuaXNTdHJpbmdMaXRlcmFsTGlrZShwcm9wZXJ0eS5pbml0aWFsaXplcikpIHtcclxuICAgICAgICBjb25zdCB0ZW1wbGF0ZVVybCA9IHByb3BlcnR5LmluaXRpYWxpemVyLnRleHQ7XHJcbiAgICAgICAgY29uc3QgdGVtcGxhdGVQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKHNvdXJjZUZpbGVEaXJQYXRoLCB0ZW1wbGF0ZVVybCk7XHJcblxyXG4gICAgICAgIC8vIEluIGNhc2UgdGhlIHRlbXBsYXRlIGRvZXMgbm90IGV4aXN0IGluIHRoZSBmaWxlIHN5c3RlbSwgc2tpcCB0aGlzXHJcbiAgICAgICAgLy8gZXh0ZXJuYWwgdGVtcGxhdGUuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9maWxlU3lzdGVtLmV4aXN0cyh0ZW1wbGF0ZVBhdGgpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBmaWxlQ29udGVudCA9IHRoaXMuX2ZpbGVTeXN0ZW0ucmVhZCh0ZW1wbGF0ZVBhdGgpO1xyXG5cclxuICAgICAgICBpZiAoZmlsZUNvbnRlbnQpIHtcclxuICAgICAgICAgIGNvbnN0IGxpbmVTdGFydHNNYXAgPSBjb21wdXRlTGluZVN0YXJ0c01hcChmaWxlQ29udGVudCk7XHJcblxyXG4gICAgICAgICAgdGhpcy5yZXNvbHZlZFRlbXBsYXRlcy5wdXNoKHtcclxuICAgICAgICAgICAgZmlsZVBhdGg6IHRlbXBsYXRlUGF0aCxcclxuICAgICAgICAgICAgY29udGFpbmVyOiBub2RlLFxyXG4gICAgICAgICAgICBjb250ZW50OiBmaWxlQ29udGVudCxcclxuICAgICAgICAgICAgaW5saW5lOiBmYWxzZSxcclxuICAgICAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgICAgIGdldENoYXJhY3RlckFuZExpbmVPZlBvc2l0aW9uOiBwID0+IGdldExpbmVBbmRDaGFyYWN0ZXJGcm9tUG9zaXRpb24obGluZVN0YXJ0c01hcCwgcCksXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlc29sdmVzIGFuIGV4dGVybmFsIHN0eWxlc2hlZXQgYnkgcmVhZGluZyBpdHMgY29udGVudCBhbmQgY29tcHV0aW5nIGxpbmUgbWFwcGluZ3MuICovXHJcbiAgcmVzb2x2ZUV4dGVybmFsU3R5bGVzaGVldChmaWxlUGF0aDogV29ya3NwYWNlUGF0aCwgY29udGFpbmVyOiB0cy5DbGFzc0RlY2xhcmF0aW9ufG51bGwpOlxyXG4gICAgICBSZXNvbHZlZFJlc291cmNlfG51bGwge1xyXG4gICAgY29uc3QgZmlsZUNvbnRlbnQgPSB0aGlzLl9maWxlU3lzdGVtLnJlYWQoZmlsZVBhdGgpO1xyXG5cclxuICAgIGlmICghZmlsZUNvbnRlbnQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGluZVN0YXJ0c01hcCA9IGNvbXB1dGVMaW5lU3RhcnRzTWFwKGZpbGVDb250ZW50KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXHJcbiAgICAgIGNvbnRhaW5lcjogY29udGFpbmVyLFxyXG4gICAgICBjb250ZW50OiBmaWxlQ29udGVudCxcclxuICAgICAgaW5saW5lOiBmYWxzZSxcclxuICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgIGdldENoYXJhY3RlckFuZExpbmVPZlBvc2l0aW9uOiBwb3MgPT4gZ2V0TGluZUFuZENoYXJhY3RlckZyb21Qb3NpdGlvbihsaW5lU3RhcnRzTWFwLCBwb3MpLFxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuIl19