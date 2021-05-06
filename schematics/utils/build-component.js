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
exports.buildComponent = void 0;
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const change_1 = require("@schematics/angular/utility/change");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const validation_1 = require("@schematics/angular/utility/validation");
const workspace_models_1 = require("@schematics/angular/utility/workspace-models");
const fs_1 = require("fs");
const path_1 = require("path");
const ts = require("typescript");
const vendored_ast_utils_1 = require("../utils/vendored-ast-utils");
const get_project_1 = require("./get-project");
const schematic_options_1 = require("./schematic-options");
/**
 * Build a default project path for generating.
 * @param project The project to build the path for.
 */
function buildDefaultPath(project) {
    const root = project.sourceRoot
        ? `/${project.sourceRoot}/`
        : `/${project.root}/src/`;
    const projectDirName = project.extensions.projectType === workspace_models_1.ProjectType.Application ? 'app' : 'lib';
    return `${root}${projectDirName}`;
}
/**
 * List of style extensions which are CSS compatible. All supported CLI style extensions can be
 * found here: angular/angular-cli/master/packages/schematics/angular/ng-new/schema.json#L118-L122
 */
const supportedCssExtensions = ['css', 'scss', 'less'];
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    return ts.createSourceFile(modulePath, text.toString('utf-8'), ts.ScriptTarget.Latest, true);
}
function addDeclarationToNgModule(options) {
    return (host) => {
        if (options.skipImport || !options.module) {
            return host;
        }
        const modulePath = options.module;
        let source = readIntoSourceFile(host, modulePath);
        const componentPath = `/${options.path}/`
            + (options.flat ? '' : core_1.strings.dasherize(options.name) + '/')
            + core_1.strings.dasherize(options.name)
            + '.component';
        const relativePath = find_module_1.buildRelativePath(modulePath, componentPath);
        const classifiedName = core_1.strings.classify(`${options.name}Component`);
        const declarationChanges = vendored_ast_utils_1.addDeclarationToModule(source, modulePath, classifiedName, relativePath);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            source = readIntoSourceFile(host, modulePath);
            const exportRecorder = host.beginUpdate(modulePath);
            const exportChanges = vendored_ast_utils_1.addExportToModule(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        if (options.entryComponent) {
            // Need to refresh the AST because we overwrote the file in the host.
            source = readIntoSourceFile(host, modulePath);
            const entryComponentRecorder = host.beginUpdate(modulePath);
            const entryComponentChanges = vendored_ast_utils_1.addEntryComponentToModule(source, modulePath, core_1.strings.classify(`${options.name}Component`), relativePath);
            for (const change of entryComponentChanges) {
                if (change instanceof change_1.InsertChange) {
                    entryComponentRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(entryComponentRecorder);
        }
        return host;
    };
}
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
    }
    return selector;
}
/**
 * Indents the text content with the amount of specified spaces. The spaces will be added after
 * every line-break. This utility function can be used inside of EJS templates to properly
 * include the additional files.
 */
function indentTextContent(text, numSpaces) {
    // In the Material project there should be only LF line-endings, but the schematic files
    // are not being linted and therefore there can be also CRLF or just CR line-endings.
    return text.replace(/(\r\n|\r|\n)/g, `$1${' '.repeat(numSpaces)}`);
}
/**
 * Rule that copies and interpolates the files that belong to this schematic context. Additionally
 * a list of file paths can be passed to this rule in order to expose them inside the EJS
 * template context.
 *
 * This allows inlining the external template or stylesheet files in EJS without having
 * to manually duplicate the file content.
 */
function buildComponent(options, additionalFiles = {}) {
    return (host, context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = get_project_1.getProjectFromWorkspace(workspace, options.project);
        const defaultComponentOptions = schematic_options_1.getDefaultComponentOptions(project);
        // TODO(devversion): Remove if we drop support for older CLI versions.
        // This handles an unreported breaking change from the @angular-devkit/schematics. Previously
        // the description path resolved to the factory file, but starting from 6.2.0, it resolves
        // to the factory directory.
        const schematicPath = fs_1.statSync(context.schematic.description.path).isDirectory() ?
            context.schematic.description.path :
            path_1.dirname(context.schematic.description.path);
        const schematicFilesUrl = './files';
        const schematicFilesPath = path_1.resolve(schematicPath, schematicFilesUrl);
        // Add the default component option values to the options if an option is not explicitly
        // specified but a default component option is available.
        Object.keys(options)
            .filter(optionName => options[optionName] == null && defaultComponentOptions[optionName])
            .forEach(optionName => options[optionName] = defaultComponentOptions[optionName]);
        if (options.path === undefined) {
            // TODO(jelbourn): figure out if the need for this `as any` is a bug due to two different
            // incompatible `ProjectDefinition` classes in @angular-devkit
            options.path = buildDefaultPath(project);
        }
        options.module = find_module_1.findModuleFromOptions(host, options);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.selector = options.selector || buildSelector(options, project.prefix);
        validation_1.validateName(options.name);
        validation_1.validateHtmlSelector(options.selector);
        // In case the specified style extension is not part of the supported CSS supersets,
        // we generate the stylesheets with the "css" extension. This ensures that we don't
        // accidentally generate invalid stylesheets (e.g. drag-drop-comp.styl) which will
        // break the Angular CLI project. See: https://github.com/angular/components/issues/15164
        if (!supportedCssExtensions.includes(options.style)) {
            // TODO: Cast is necessary as we can't use the Style enum which has been introduced
            // within CLI v7.3.0-rc.0. This would break the schematic for older CLI versions.
            options.style = 'css';
        }
        // Object that will be used as context for the EJS templates.
        const baseTemplateContext = Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => options.flat ? '' : s }), options);
        // Key-value object that includes the specified additional files with their loaded content.
        // The resolved contents can be used inside EJS templates.
        const resolvedFiles = {};
        for (let key in additionalFiles) {
            if (additionalFiles[key]) {
                const fileContent = fs_1.readFileSync(path_1.join(schematicFilesPath, additionalFiles[key]), 'utf-8');
                // Interpolate the additional files with the base EJS template context.
                resolvedFiles[key] = core_1.template(fileContent)(baseTemplateContext);
            }
        }
        const templateSource = schematics_1.apply(schematics_1.url(schematicFilesUrl), [
            options.skipTests ? schematics_1.filter(path => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            options.inlineStyle ? schematics_1.filter(path => !path.endsWith('.__style__.template')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter(path => !path.endsWith('.html.template')) : schematics_1.noop(),
            // Treat the template options as any, because the type definition for the template options
            // is made unnecessarily explicit. Every type of object can be used in the EJS template.
            schematics_1.applyTemplates(Object.assign({ indentTextContent, resolvedFiles }, baseTemplateContext)),
            // TODO(devversion): figure out why we cannot just remove the first parameter
            // See for example: angular-cli#schematics/angular/component/index.ts#L160
            schematics_1.move(null, parsedPath.path),
        ]);
        return () => schematics_1.chain([
            schematics_1.branchAndMerge(schematics_1.chain([
                addDeclarationToNgModule(options),
                schematics_1.mergeWith(templateSource),
            ])),
        ])(host, context);
    });
}
exports.buildComponent = buildComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL3V0aWxzL2J1aWxkLWNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7QUFFSCwrQ0FBOEU7QUFDOUUsMkRBYW9DO0FBR3BDLCtEQUFnRTtBQUNoRSxxRUFBbUU7QUFDbkUseUVBQWlHO0FBQ2pHLHVFQUFpRTtBQUNqRSx1RUFBMEY7QUFDMUYsbUZBQXlFO0FBQ3pFLDJCQUEwQztBQUMxQywrQkFBNEM7QUFDNUMsaUNBQWlDO0FBQ2pDLG9FQUlxQztBQUNyQywrQ0FBc0Q7QUFDdEQsMkRBQStEO0FBRy9EOzs7R0FHRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsT0FBMEI7SUFDbEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVU7UUFDN0IsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLFVBQVUsR0FBRztRQUMzQixDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUM7SUFFNUIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEtBQUssOEJBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBRWxHLE9BQU8sR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7QUFDcEMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRXZELFNBQVMsa0JBQWtCLENBQUMsSUFBVSxFQUFFLFVBQWtCO0lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbkMsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1FBQ2pC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QiwyQkFBYyxDQUFDLGtCQUFLLENBQUM7Z0JBQ25CLHdCQUF3QixDQUFDLE9BQU8sQ0FBQztnQkFDakMsc0JBQVMsQ0FBQyxjQUFjLENBQUM7YUFDMUIsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQixDQUFDLENBQUEsQ0FBQztBQUNKLENBQUM7QUEzRkQsd0NBMkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge3N0cmluZ3MsIHRlbXBsYXRlIGFzIGludGVycG9sYXRlVGVtcGxhdGV9IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcclxuaW1wb3J0IHtcclxuICBhcHBseSxcclxuICBhcHBseVRlbXBsYXRlcyxcclxuICBicmFuY2hBbmRNZXJnZSxcclxuICBjaGFpbixcclxuICBmaWx0ZXIsXHJcbiAgbWVyZ2VXaXRoLFxyXG4gIG1vdmUsXHJcbiAgbm9vcCxcclxuICBSdWxlLFxyXG4gIFNjaGVtYXRpY3NFeGNlcHRpb24sXHJcbiAgVHJlZSxcclxuICB1cmwsXHJcbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQge0ZpbGVTeXN0ZW1TY2hlbWF0aWNDb250ZXh0fSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcy90b29scyc7XHJcbmltcG9ydCB7U2NoZW1hIGFzIENvbXBvbmVudE9wdGlvbnMsIFN0eWxlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL2NvbXBvbmVudC9zY2hlbWEnO1xyXG5pbXBvcnQge0luc2VydENoYW5nZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L2NoYW5nZSc7XHJcbmltcG9ydCB7Z2V0V29ya3NwYWNlfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvd29ya3NwYWNlJztcclxuaW1wb3J0IHtidWlsZFJlbGF0aXZlUGF0aCwgZmluZE1vZHVsZUZyb21PcHRpb25zfSBmcm9tICdAc2NoZW1hdGljcy9hbmd1bGFyL3V0aWxpdHkvZmluZC1tb2R1bGUnO1xyXG5pbXBvcnQge3BhcnNlTmFtZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3BhcnNlLW5hbWUnO1xyXG5pbXBvcnQge3ZhbGlkYXRlSHRtbFNlbGVjdG9yLCB2YWxpZGF0ZU5hbWV9IGZyb20gJ0BzY2hlbWF0aWNzL2FuZ3VsYXIvdXRpbGl0eS92YWxpZGF0aW9uJztcclxuaW1wb3J0IHtQcm9qZWN0VHlwZX0gZnJvbSAnQHNjaGVtYXRpY3MvYW5ndWxhci91dGlsaXR5L3dvcmtzcGFjZS1tb2RlbHMnO1xyXG5pbXBvcnQge3JlYWRGaWxlU3luYywgc3RhdFN5bmN9IGZyb20gJ2ZzJztcclxuaW1wb3J0IHtkaXJuYW1lLCBqb2luLCByZXNvbHZlfSBmcm9tICdwYXRoJztcclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7XHJcbiAgYWRkRGVjbGFyYXRpb25Ub01vZHVsZSxcclxuICBhZGRFbnRyeUNvbXBvbmVudFRvTW9kdWxlLFxyXG4gIGFkZEV4cG9ydFRvTW9kdWxlLFxyXG59IGZyb20gJy4uL3V0aWxzL3ZlbmRvcmVkLWFzdC11dGlscyc7XHJcbmltcG9ydCB7Z2V0UHJvamVjdEZyb21Xb3Jrc3BhY2V9IGZyb20gJy4vZ2V0LXByb2plY3QnO1xyXG5pbXBvcnQge2dldERlZmF1bHRDb21wb25lbnRPcHRpb25zfSBmcm9tICcuL3NjaGVtYXRpYy1vcHRpb25zJztcclxuaW1wb3J0IHtQcm9qZWN0RGVmaW5pdGlvbn0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L2NvcmUvc3JjL3dvcmtzcGFjZSc7XHJcblxyXG4vKipcclxuICogQnVpbGQgYSBkZWZhdWx0IHByb2plY3QgcGF0aCBmb3IgZ2VuZXJhdGluZy5cclxuICogQHBhcmFtIHByb2plY3QgVGhlIHByb2plY3QgdG8gYnVpbGQgdGhlIHBhdGggZm9yLlxyXG4gKi9cclxuZnVuY3Rpb24gYnVpbGREZWZhdWx0UGF0aChwcm9qZWN0OiBQcm9qZWN0RGVmaW5pdGlvbik6IHN0cmluZyB7XHJcbiAgY29uc3Qgcm9vdCA9IHByb2plY3Quc291cmNlUm9vdFxyXG4gICAgPyBgLyR7cHJvamVjdC5zb3VyY2VSb290fS9gXHJcbiAgICA6IGAvJHtwcm9qZWN0LnJvb3R9L3NyYy9gO1xyXG5cclxuICBjb25zdCBwcm9qZWN0RGlyTmFtZSA9IHByb2plY3QuZXh0ZW5zaW9ucy5wcm9qZWN0VHlwZSA9PT0gUHJvamVjdFR5cGUuQXBwbGljYXRpb24gPyAnYXBwJyA6ICdsaWInO1xyXG5cclxuICByZXR1cm4gYCR7cm9vdH0ke3Byb2plY3REaXJOYW1lfWA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMaXN0IG9mIHN0eWxlIGV4dGVuc2lvbnMgd2hpY2ggYXJlIENTUyBjb21wYXRpYmxlLiBBbGwgc3VwcG9ydGVkIENMSSBzdHlsZSBleHRlbnNpb25zIGNhbiBiZVxyXG4gKiBmb3VuZCBoZXJlOiBhbmd1bGFyL2FuZ3VsYXItY2xpL21hc3Rlci9wYWNrYWdlcy9zY2hlbWF0aWNzL2FuZ3VsYXIvbmctbmV3L3NjaGVtYS5qc29uI0wxMTgtTDEyMlxyXG4gKi9cclxuY29uc3Qgc3VwcG9ydGVkQ3NzRXh0ZW5zaW9ucyA9IFsnY3NzJywgJ3Njc3MnLCAnbGVzcyddO1xyXG5cclxuZnVuY3Rpb24gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3Q6IFRyZWUsIG1vZHVsZVBhdGg6IHN0cmluZykge1xyXG4gIGNvbnN0IHRleHQgPSBob3N0LnJlYWQobW9kdWxlUGF0aCk7XHJcbiAgaWYgKHRleHQgPT09IG51bGwpIHtcclxuICAgIHRocm93IG5ldyBTY2hlbWF0aWNzRXhjZXB0aW9uKGBGaWxlICR7bW9kdWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdHMuY3JlYXRlU291cmNlRmlsZShtb2R1bGVQYXRoLCB0ZXh0LnRvU3RyaW5nKCd1dGYtOCcpLCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCB0cnVlKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkRGVjbGFyYXRpb25Ub05nTW9kdWxlKG9wdGlvbnM6IENvbXBvbmVudE9wdGlvbnMpOiBSdWxlIHtcclxuICByZXR1cm4gKGhvc3Q6IFRyZWUpID0+IHtcclxuICAgIGlmIChvcHRpb25zLnNraXBJbXBvcnQgfHwgIW9wdGlvbnMubW9kdWxlKSB7XHJcbiAgICAgIHJldHVybiBob3N0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBvcHRpb25zLm1vZHVsZTtcclxuICAgIGxldCBzb3VyY2UgPSByZWFkSW50b1NvdXJjZUZpbGUoaG9zdCwgbW9kdWxlUGF0aCk7XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50UGF0aCA9IGAvJHtvcHRpb25zLnBhdGh9L2BcclxuICAgICAgKyAob3B0aW9ucy5mbGF0ID8gJycgOiBzdHJpbmdzLmRhc2hlcml6ZShvcHRpb25zLm5hbWUpICsgJy8nKVxyXG4gICAgICArIHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSlcclxuICAgICAgKyAnLmNvbXBvbmVudCc7XHJcbiAgICBjb25zdCByZWxhdGl2ZVBhdGggPSBidWlsZFJlbGF0aXZlUGF0aChtb2R1bGVQYXRoLCBjb21wb25lbnRQYXRoKTtcclxuICAgIGNvbnN0IGNsYXNzaWZpZWROYW1lID0gc3RyaW5ncy5jbGFzc2lmeShgJHtvcHRpb25zLm5hbWV9Q29tcG9uZW50YCk7XHJcblxyXG4gICAgY29uc3QgZGVjbGFyYXRpb25DaGFuZ2VzID0gYWRkRGVjbGFyYXRpb25Ub01vZHVsZShcclxuICAgICAgc291cmNlLFxyXG4gICAgICBtb2R1bGVQYXRoLFxyXG4gICAgICBjbGFzc2lmaWVkTmFtZSxcclxuICAgICAgcmVsYXRpdmVQYXRoKTtcclxuXHJcbiAgICBjb25zdCBkZWNsYXJhdGlvblJlY29yZGVyID0gaG9zdC5iZWdpblVwZGF0ZShtb2R1bGVQYXRoKTtcclxuICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGRlY2xhcmF0aW9uQ2hhbmdlcykge1xyXG4gICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XHJcbiAgICAgICAgZGVjbGFyYXRpb25SZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGhvc3QuY29tbWl0VXBkYXRlKGRlY2xhcmF0aW9uUmVjb3JkZXIpO1xyXG5cclxuICAgIGlmIChvcHRpb25zLmV4cG9ydCkge1xyXG4gICAgICAvLyBOZWVkIHRvIHJlZnJlc2ggdGhlIEFTVCBiZWNhdXNlIHdlIG92ZXJ3cm90ZSB0aGUgZmlsZSBpbiB0aGUgaG9zdC5cclxuICAgICAgc291cmNlID0gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xyXG5cclxuICAgICAgY29uc3QgZXhwb3J0UmVjb3JkZXIgPSBob3N0LmJlZ2luVXBkYXRlKG1vZHVsZVBhdGgpO1xyXG4gICAgICBjb25zdCBleHBvcnRDaGFuZ2VzID0gYWRkRXhwb3J0VG9Nb2R1bGUoXHJcbiAgICAgICAgc291cmNlLFxyXG4gICAgICAgIG1vZHVsZVBhdGgsXHJcbiAgICAgICAgc3RyaW5ncy5jbGFzc2lmeShgJHtvcHRpb25zLm5hbWV9Q29tcG9uZW50YCksXHJcbiAgICAgICAgcmVsYXRpdmVQYXRoKTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGV4cG9ydENoYW5nZXMpIHtcclxuICAgICAgICBpZiAoY2hhbmdlIGluc3RhbmNlb2YgSW5zZXJ0Q2hhbmdlKSB7XHJcbiAgICAgICAgICBleHBvcnRSZWNvcmRlci5pbnNlcnRMZWZ0KGNoYW5nZS5wb3MsIGNoYW5nZS50b0FkZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGhvc3QuY29tbWl0VXBkYXRlKGV4cG9ydFJlY29yZGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5lbnRyeUNvbXBvbmVudCkge1xyXG4gICAgICAvLyBOZWVkIHRvIHJlZnJlc2ggdGhlIEFTVCBiZWNhdXNlIHdlIG92ZXJ3cm90ZSB0aGUgZmlsZSBpbiB0aGUgaG9zdC5cclxuICAgICAgc291cmNlID0gcmVhZEludG9Tb3VyY2VGaWxlKGhvc3QsIG1vZHVsZVBhdGgpO1xyXG5cclxuICAgICAgY29uc3QgZW50cnlDb21wb25lbnRSZWNvcmRlciA9IGhvc3QuYmVnaW5VcGRhdGUobW9kdWxlUGF0aCk7XHJcbiAgICAgIGNvbnN0IGVudHJ5Q29tcG9uZW50Q2hhbmdlcyA9IGFkZEVudHJ5Q29tcG9uZW50VG9Nb2R1bGUoXHJcbiAgICAgICAgc291cmNlLFxyXG4gICAgICAgIG1vZHVsZVBhdGgsXHJcbiAgICAgICAgc3RyaW5ncy5jbGFzc2lmeShgJHtvcHRpb25zLm5hbWV9Q29tcG9uZW50YCksXHJcbiAgICAgICAgcmVsYXRpdmVQYXRoKTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgY2hhbmdlIG9mIGVudHJ5Q29tcG9uZW50Q2hhbmdlcykge1xyXG4gICAgICAgIGlmIChjaGFuZ2UgaW5zdGFuY2VvZiBJbnNlcnRDaGFuZ2UpIHtcclxuICAgICAgICAgIGVudHJ5Q29tcG9uZW50UmVjb3JkZXIuaW5zZXJ0TGVmdChjaGFuZ2UucG9zLCBjaGFuZ2UudG9BZGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBob3N0LmNvbW1pdFVwZGF0ZShlbnRyeUNvbXBvbmVudFJlY29yZGVyKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIGhvc3Q7XHJcbiAgfTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGJ1aWxkU2VsZWN0b3Iob3B0aW9uczogQ29tcG9uZW50T3B0aW9ucywgcHJvamVjdFByZWZpeD86IHN0cmluZykge1xyXG4gIGxldCBzZWxlY3RvciA9IHN0cmluZ3MuZGFzaGVyaXplKG9wdGlvbnMubmFtZSk7XHJcbiAgaWYgKG9wdGlvbnMucHJlZml4KSB7XHJcbiAgICBzZWxlY3RvciA9IGAke29wdGlvbnMucHJlZml4fS0ke3NlbGVjdG9yfWA7XHJcbiAgfSBlbHNlIGlmIChvcHRpb25zLnByZWZpeCA9PT0gdW5kZWZpbmVkICYmIHByb2plY3RQcmVmaXgpIHtcclxuICAgIHNlbGVjdG9yID0gYCR7cHJvamVjdFByZWZpeH0tJHtzZWxlY3Rvcn1gO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHNlbGVjdG9yO1xyXG59XHJcblxyXG4vKipcclxuICogSW5kZW50cyB0aGUgdGV4dCBjb250ZW50IHdpdGggdGhlIGFtb3VudCBvZiBzcGVjaWZpZWQgc3BhY2VzLiBUaGUgc3BhY2VzIHdpbGwgYmUgYWRkZWQgYWZ0ZXJcclxuICogZXZlcnkgbGluZS1icmVhay4gVGhpcyB1dGlsaXR5IGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGluc2lkZSBvZiBFSlMgdGVtcGxhdGVzIHRvIHByb3Blcmx5XHJcbiAqIGluY2x1ZGUgdGhlIGFkZGl0aW9uYWwgZmlsZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbmRlbnRUZXh0Q29udGVudCh0ZXh0OiBzdHJpbmcsIG51bVNwYWNlczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAvLyBJbiB0aGUgTWF0ZXJpYWwgcHJvamVjdCB0aGVyZSBzaG91bGQgYmUgb25seSBMRiBsaW5lLWVuZGluZ3MsIGJ1dCB0aGUgc2NoZW1hdGljIGZpbGVzXHJcbiAgLy8gYXJlIG5vdCBiZWluZyBsaW50ZWQgYW5kIHRoZXJlZm9yZSB0aGVyZSBjYW4gYmUgYWxzbyBDUkxGIG9yIGp1c3QgQ1IgbGluZS1lbmRpbmdzLlxyXG4gIHJldHVybiB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxyfFxcbikvZywgYCQxJHsnICcucmVwZWF0KG51bVNwYWNlcyl9YCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSdWxlIHRoYXQgY29waWVzIGFuZCBpbnRlcnBvbGF0ZXMgdGhlIGZpbGVzIHRoYXQgYmVsb25nIHRvIHRoaXMgc2NoZW1hdGljIGNvbnRleHQuIEFkZGl0aW9uYWxseVxyXG4gKiBhIGxpc3Qgb2YgZmlsZSBwYXRocyBjYW4gYmUgcGFzc2VkIHRvIHRoaXMgcnVsZSBpbiBvcmRlciB0byBleHBvc2UgdGhlbSBpbnNpZGUgdGhlIEVKU1xyXG4gKiB0ZW1wbGF0ZSBjb250ZXh0LlxyXG4gKlxyXG4gKiBUaGlzIGFsbG93cyBpbmxpbmluZyB0aGUgZXh0ZXJuYWwgdGVtcGxhdGUgb3Igc3R5bGVzaGVldCBmaWxlcyBpbiBFSlMgd2l0aG91dCBoYXZpbmdcclxuICogdG8gbWFudWFsbHkgZHVwbGljYXRlIHRoZSBmaWxlIGNvbnRlbnQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRDb21wb25lbnQob3B0aW9uczogQ29tcG9uZW50T3B0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxGaWxlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fSk6IFJ1bGUge1xyXG5cclxuICByZXR1cm4gYXN5bmMgKGhvc3Q6IFRyZWUsIGNvbnRleHQ6IEZpbGVTeXN0ZW1TY2hlbWF0aWNDb250ZXh0KSA9PiB7XHJcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2UoaG9zdCk7XHJcbiAgICBjb25zdCBwcm9qZWN0ID0gZ2V0UHJvamVjdEZyb21Xb3Jrc3BhY2Uod29ya3NwYWNlLCBvcHRpb25zLnByb2plY3QpO1xyXG4gICAgY29uc3QgZGVmYXVsdENvbXBvbmVudE9wdGlvbnMgPSBnZXREZWZhdWx0Q29tcG9uZW50T3B0aW9ucyhwcm9qZWN0KTtcclxuXHJcbiAgICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZW1vdmUgaWYgd2UgZHJvcCBzdXBwb3J0IGZvciBvbGRlciBDTEkgdmVyc2lvbnMuXHJcbiAgICAvLyBUaGlzIGhhbmRsZXMgYW4gdW5yZXBvcnRlZCBicmVha2luZyBjaGFuZ2UgZnJvbSB0aGUgQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MuIFByZXZpb3VzbHlcclxuICAgIC8vIHRoZSBkZXNjcmlwdGlvbiBwYXRoIHJlc29sdmVkIHRvIHRoZSBmYWN0b3J5IGZpbGUsIGJ1dCBzdGFydGluZyBmcm9tIDYuMi4wLCBpdCByZXNvbHZlc1xyXG4gICAgLy8gdG8gdGhlIGZhY3RvcnkgZGlyZWN0b3J5LlxyXG4gICAgY29uc3Qgc2NoZW1hdGljUGF0aCA9IHN0YXRTeW5jKGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGgpLmlzRGlyZWN0b3J5KCkgP1xyXG4gICAgICAgIGNvbnRleHQuc2NoZW1hdGljLmRlc2NyaXB0aW9uLnBhdGggOlxyXG4gICAgICAgIGRpcm5hbWUoY29udGV4dC5zY2hlbWF0aWMuZGVzY3JpcHRpb24ucGF0aCk7XHJcblxyXG4gICAgY29uc3Qgc2NoZW1hdGljRmlsZXNVcmwgPSAnLi9maWxlcyc7XHJcbiAgICBjb25zdCBzY2hlbWF0aWNGaWxlc1BhdGggPSByZXNvbHZlKHNjaGVtYXRpY1BhdGgsIHNjaGVtYXRpY0ZpbGVzVXJsKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGRlZmF1bHQgY29tcG9uZW50IG9wdGlvbiB2YWx1ZXMgdG8gdGhlIG9wdGlvbnMgaWYgYW4gb3B0aW9uIGlzIG5vdCBleHBsaWNpdGx5XHJcbiAgICAvLyBzcGVjaWZpZWQgYnV0IGEgZGVmYXVsdCBjb21wb25lbnQgb3B0aW9uIGlzIGF2YWlsYWJsZS5cclxuICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpXHJcbiAgICAgIC5maWx0ZXIob3B0aW9uTmFtZSA9PiBvcHRpb25zW29wdGlvbk5hbWVdID09IG51bGwgJiYgZGVmYXVsdENvbXBvbmVudE9wdGlvbnNbb3B0aW9uTmFtZV0pXHJcbiAgICAgIC5mb3JFYWNoKG9wdGlvbk5hbWUgPT4gb3B0aW9uc1tvcHRpb25OYW1lXSA9IGRlZmF1bHRDb21wb25lbnRPcHRpb25zW29wdGlvbk5hbWVdKTtcclxuXHJcbiAgICBpZiAob3B0aW9ucy5wYXRoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgLy8gVE9ETyhqZWxib3Vybik6IGZpZ3VyZSBvdXQgaWYgdGhlIG5lZWQgZm9yIHRoaXMgYGFzIGFueWAgaXMgYSBidWcgZHVlIHRvIHR3byBkaWZmZXJlbnRcclxuICAgICAgLy8gaW5jb21wYXRpYmxlIGBQcm9qZWN0RGVmaW5pdGlvbmAgY2xhc3NlcyBpbiBAYW5ndWxhci1kZXZraXRcclxuICAgICAgb3B0aW9ucy5wYXRoID0gYnVpbGREZWZhdWx0UGF0aChwcm9qZWN0IGFzIGFueSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9ucy5tb2R1bGUgPSBmaW5kTW9kdWxlRnJvbU9wdGlvbnMoaG9zdCwgb3B0aW9ucyk7XHJcblxyXG4gICAgY29uc3QgcGFyc2VkUGF0aCA9IHBhcnNlTmFtZShvcHRpb25zLnBhdGghLCBvcHRpb25zLm5hbWUpO1xyXG5cclxuICAgIG9wdGlvbnMubmFtZSA9IHBhcnNlZFBhdGgubmFtZTtcclxuICAgIG9wdGlvbnMucGF0aCA9IHBhcnNlZFBhdGgucGF0aDtcclxuICAgIG9wdGlvbnMuc2VsZWN0b3IgPSBvcHRpb25zLnNlbGVjdG9yIHx8IGJ1aWxkU2VsZWN0b3Iob3B0aW9ucywgcHJvamVjdC5wcmVmaXgpO1xyXG5cclxuICAgIHZhbGlkYXRlTmFtZShvcHRpb25zLm5hbWUpO1xyXG4gICAgdmFsaWRhdGVIdG1sU2VsZWN0b3Iob3B0aW9ucy5zZWxlY3RvciEpO1xyXG5cclxuICAgIC8vIEluIGNhc2UgdGhlIHNwZWNpZmllZCBzdHlsZSBleHRlbnNpb24gaXMgbm90IHBhcnQgb2YgdGhlIHN1cHBvcnRlZCBDU1Mgc3VwZXJzZXRzLFxyXG4gICAgLy8gd2UgZ2VuZXJhdGUgdGhlIHN0eWxlc2hlZXRzIHdpdGggdGhlIFwiY3NzXCIgZXh0ZW5zaW9uLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBkb24ndFxyXG4gICAgLy8gYWNjaWRlbnRhbGx5IGdlbmVyYXRlIGludmFsaWQgc3R5bGVzaGVldHMgKGUuZy4gZHJhZy1kcm9wLWNvbXAuc3R5bCkgd2hpY2ggd2lsbFxyXG4gICAgLy8gYnJlYWsgdGhlIEFuZ3VsYXIgQ0xJIHByb2plY3QuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTUxNjRcclxuICAgIGlmICghc3VwcG9ydGVkQ3NzRXh0ZW5zaW9ucy5pbmNsdWRlcyhvcHRpb25zLnN0eWxlISkpIHtcclxuICAgICAgLy8gVE9ETzogQ2FzdCBpcyBuZWNlc3NhcnkgYXMgd2UgY2FuJ3QgdXNlIHRoZSBTdHlsZSBlbnVtIHdoaWNoIGhhcyBiZWVuIGludHJvZHVjZWRcclxuICAgICAgLy8gd2l0aGluIENMSSB2Ny4zLjAtcmMuMC4gVGhpcyB3b3VsZCBicmVhayB0aGUgc2NoZW1hdGljIGZvciBvbGRlciBDTEkgdmVyc2lvbnMuXHJcbiAgICAgIG9wdGlvbnMuc3R5bGUgPSAnY3NzJyBhcyBTdHlsZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgYXMgY29udGV4dCBmb3IgdGhlIEVKUyB0ZW1wbGF0ZXMuXHJcbiAgICBjb25zdCBiYXNlVGVtcGxhdGVDb250ZXh0ID0ge1xyXG4gICAgICAuLi5zdHJpbmdzLFxyXG4gICAgICAnaWYtZmxhdCc6IChzOiBzdHJpbmcpID0+IG9wdGlvbnMuZmxhdCA/ICcnIDogcyxcclxuICAgICAgLi4ub3B0aW9ucyxcclxuICAgIH07XHJcblxyXG4gICAgLy8gS2V5LXZhbHVlIG9iamVjdCB0aGF0IGluY2x1ZGVzIHRoZSBzcGVjaWZpZWQgYWRkaXRpb25hbCBmaWxlcyB3aXRoIHRoZWlyIGxvYWRlZCBjb250ZW50LlxyXG4gICAgLy8gVGhlIHJlc29sdmVkIGNvbnRlbnRzIGNhbiBiZSB1c2VkIGluc2lkZSBFSlMgdGVtcGxhdGVzLlxyXG4gICAgY29uc3QgcmVzb2x2ZWRGaWxlcyA9IHt9O1xyXG5cclxuICAgIGZvciAobGV0IGtleSBpbiBhZGRpdGlvbmFsRmlsZXMpIHtcclxuICAgICAgaWYgKGFkZGl0aW9uYWxGaWxlc1trZXldKSB7XHJcbiAgICAgICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMoam9pbihzY2hlbWF0aWNGaWxlc1BhdGgsIGFkZGl0aW9uYWxGaWxlc1trZXldKSwgJ3V0Zi04Jyk7XHJcblxyXG4gICAgICAgIC8vIEludGVycG9sYXRlIHRoZSBhZGRpdGlvbmFsIGZpbGVzIHdpdGggdGhlIGJhc2UgRUpTIHRlbXBsYXRlIGNvbnRleHQuXHJcbiAgICAgICAgcmVzb2x2ZWRGaWxlc1trZXldID0gaW50ZXJwb2xhdGVUZW1wbGF0ZShmaWxlQ29udGVudCkoYmFzZVRlbXBsYXRlQ29udGV4dCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZW1wbGF0ZVNvdXJjZSA9IGFwcGx5KHVybChzY2hlbWF0aWNGaWxlc1VybCksIFtcclxuICAgICAgb3B0aW9ucy5za2lwVGVzdHMgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLnNwZWMudHMudGVtcGxhdGUnKSkgOiBub29wKCksXHJcbiAgICAgIG9wdGlvbnMuaW5saW5lU3R5bGUgPyBmaWx0ZXIocGF0aCA9PiAhcGF0aC5lbmRzV2l0aCgnLl9fc3R5bGVfXy50ZW1wbGF0ZScpKSA6IG5vb3AoKSxcclxuICAgICAgb3B0aW9ucy5pbmxpbmVUZW1wbGF0ZSA/IGZpbHRlcihwYXRoID0+ICFwYXRoLmVuZHNXaXRoKCcuaHRtbC50ZW1wbGF0ZScpKSA6IG5vb3AoKSxcclxuICAgICAgLy8gVHJlYXQgdGhlIHRlbXBsYXRlIG9wdGlvbnMgYXMgYW55LCBiZWNhdXNlIHRoZSB0eXBlIGRlZmluaXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBvcHRpb25zXHJcbiAgICAgIC8vIGlzIG1hZGUgdW5uZWNlc3NhcmlseSBleHBsaWNpdC4gRXZlcnkgdHlwZSBvZiBvYmplY3QgY2FuIGJlIHVzZWQgaW4gdGhlIEVKUyB0ZW1wbGF0ZS5cclxuICAgICAgYXBwbHlUZW1wbGF0ZXMoe2luZGVudFRleHRDb250ZW50LCByZXNvbHZlZEZpbGVzLCAuLi5iYXNlVGVtcGxhdGVDb250ZXh0fSBhcyBhbnkpLFxyXG4gICAgICAvLyBUT0RPKGRldnZlcnNpb24pOiBmaWd1cmUgb3V0IHdoeSB3ZSBjYW5ub3QganVzdCByZW1vdmUgdGhlIGZpcnN0IHBhcmFtZXRlclxyXG4gICAgICAvLyBTZWUgZm9yIGV4YW1wbGU6IGFuZ3VsYXItY2xpI3NjaGVtYXRpY3MvYW5ndWxhci9jb21wb25lbnQvaW5kZXgudHMjTDE2MFxyXG4gICAgICBtb3ZlKG51bGwgYXMgYW55LCBwYXJzZWRQYXRoLnBhdGgpLFxyXG4gICAgXSk7XHJcblxyXG4gICAgcmV0dXJuICgpID0+IGNoYWluKFtcclxuICAgICAgYnJhbmNoQW5kTWVyZ2UoY2hhaW4oW1xyXG4gICAgICAgIGFkZERlY2xhcmF0aW9uVG9OZ01vZHVsZShvcHRpb25zKSxcclxuICAgICAgICBtZXJnZVdpdGgodGVtcGxhdGVTb3VyY2UpLFxyXG4gICAgICBdKSksXHJcbiAgICBdKShob3N0LCBjb250ZXh0KTtcclxuICB9O1xyXG59XHJcbiJdfQ==