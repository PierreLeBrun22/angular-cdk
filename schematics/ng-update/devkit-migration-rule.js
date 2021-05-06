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
exports.isDevkitMigration = exports.createMigrationSchematicRule = exports.cdkMigrations = void 0;
const tasks_1 = require("@angular-devkit/schematics/tasks");
const update_tool_1 = require("../update-tool");
const project_tsconfig_paths_1 = require("../utils/project-tsconfig-paths");
const devkit_file_system_1 = require("./devkit-file-system");
const devkit_migration_1 = require("./devkit-migration");
const find_stylesheets_1 = require("./find-stylesheets");
const attribute_selectors_1 = require("./migrations/attribute-selectors");
const class_inheritance_1 = require("./migrations/class-inheritance");
const class_names_1 = require("./migrations/class-names");
const constructor_signature_1 = require("./migrations/constructor-signature");
const css_selectors_1 = require("./migrations/css-selectors");
const element_selectors_1 = require("./migrations/element-selectors");
const input_names_1 = require("./migrations/input-names");
const method_call_arguments_1 = require("./migrations/method-call-arguments");
const misc_template_1 = require("./migrations/misc-template");
const output_names_1 = require("./migrations/output-names");
const property_names_1 = require("./migrations/property-names");
/** List of migrations which run for the CDK update. */
exports.cdkMigrations = [
    attribute_selectors_1.AttributeSelectorsMigration,
    class_inheritance_1.ClassInheritanceMigration,
    class_names_1.ClassNamesMigration,
    constructor_signature_1.ConstructorSignatureMigration,
    css_selectors_1.CssSelectorsMigration,
    element_selectors_1.ElementSelectorsMigration,
    input_names_1.InputNamesMigration,
    method_call_arguments_1.MethodCallArgumentsMigration,
    misc_template_1.MiscTemplateMigration,
    output_names_1.OutputNamesMigration,
    property_names_1.PropertyNamesMigration,
];
/**
 * Creates a Angular schematic rule that runs the upgrade for the
 * specified target version.
 */
function createMigrationSchematicRule(targetVersion, extraMigrations, upgradeData, onMigrationCompleteFn) {
    return (tree, context) => __awaiter(this, void 0, void 0, function* () {
        const logger = context.logger;
        const workspace = yield project_tsconfig_paths_1.getWorkspaceConfigGracefully(tree);
        if (workspace === null) {
            logger.error('Could not find workspace configuration file.');
            return;
        }
        // Keep track of all project source files which have been checked/migrated. This is
        // necessary because multiple TypeScript projects can contain the same source file and
        // we don't want to check these again, as this would result in duplicated failure messages.
        const analyzedFiles = new Set();
        const fileSystem = new devkit_file_system_1.DevkitFileSystem(tree);
        const projectNames = workspace.projects.keys();
        const migrations = [...exports.cdkMigrations, ...extraMigrations];
        let hasFailures = false;
        for (const projectName of projectNames) {
            const project = workspace.projects.get(projectName);
            const buildTsconfigPath = project_tsconfig_paths_1.getTargetTsconfigPath(project, 'build');
            const testTsconfigPath = project_tsconfig_paths_1.getTargetTsconfigPath(project, 'test');
            if (!buildTsconfigPath && !testTsconfigPath) {
                logger.warn(`Could not find TypeScript project for project: ${projectName}`);
                continue;
            }
            // In some applications, developers will have global stylesheets which are not
            // specified in any Angular component. Therefore we glob up all CSS and SCSS files
            // in the project and migrate them if needed.
            // TODO: rework this to collect global stylesheets from the workspace config. COMP-280.
            const additionalStylesheetPaths = find_stylesheets_1.findStylesheetFiles(tree, project.root);
            if (buildTsconfigPath !== null) {
                runMigrations(project, projectName, buildTsconfigPath, additionalStylesheetPaths, false);
            }
            if (testTsconfigPath !== null) {
                runMigrations(project, projectName, testTsconfigPath, additionalStylesheetPaths, true);
            }
        }
        let runPackageManager = false;
        // Run the global post migration static members for all
        // registered devkit migrations.
        migrations.forEach(m => {
            const actionResult = isDevkitMigration(m) && m.globalPostMigration !== undefined ?
                m.globalPostMigration(tree, context) : null;
            if (actionResult) {
                runPackageManager = runPackageManager || actionResult.runPackageManager;
            }
        });
        // If a migration requested the package manager to run, we run it as an
        // asynchronous post migration task. We cannot run it synchronously,
        // as file changes from the current migration task are not applied to
        // the file system yet.
        if (runPackageManager) {
            context.addTask(new tasks_1.NodePackageInstallTask({ quiet: false }));
        }
        if (onMigrationCompleteFn) {
            onMigrationCompleteFn(context, targetVersion, hasFailures);
        }
        /** Runs the migrations for the specified workspace project. */
        function runMigrations(project, projectName, tsconfigPath, additionalStylesheetPaths, isTestTarget) {
            const program = update_tool_1.UpdateProject.createProgramFromTsconfig(tsconfigPath, fileSystem);
            const updateContext = {
                isTestTarget,
                projectName,
                project,
                tree,
            };
            const updateProject = new update_tool_1.UpdateProject(updateContext, program, fileSystem, analyzedFiles, context.logger);
            const result = updateProject.migrate(migrations, targetVersion, upgradeData, additionalStylesheetPaths);
            // Commit all recorded edits in the update recorder. We apply the edits after all
            // migrations ran because otherwise offsets in the TypeScript program would be
            // shifted and individual migrations could no longer update the same source file.
            fileSystem.commitEdits();
            hasFailures = hasFailures || result.hasFailures;
        }
    });
}
exports.createMigrationSchematicRule = createMigrationSchematicRule;
/** Whether the given migration type refers to a devkit migration */
function isDevkitMigration(value) {
    return devkit_migration_1.DevkitMigration.isPrototypeOf(value);
}
exports.isDevkitMigration = isDevkitMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2a2l0LW1pZ3JhdGlvbi1ydWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kZXZraXQtbWlncmF0aW9uLXJ1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0FBR0gsNERBQXdFO0FBR3hFLGdEQUE2QztBQUk3Qyw0RUFBb0c7QUFFcEcsNkRBQXNEO0FBQ3RELHlEQUF1RjtBQUN2Rix5REFBdUQ7QUFDdkQsMEVBQTZFO0FBQzdFLHNFQUF5RTtBQUN6RSwwREFBNkQ7QUFDN0QsOEVBQWlGO0FBQ2pGLDhEQUFpRTtBQUNqRSxzRUFBeUU7QUFDekUsMERBQTZEO0FBQzdELDhFQUFnRjtBQUNoRiw4REFBaUU7QUFDakUsNERBQStEO0FBQy9ELGdFQUFtRTtBQUluRSx1REFBdUQ7QUFDMUMsUUFBQSxhQUFhLEdBQWlDO0lBQ3pELGlEQUEyQjtJQUMzQiw2Q0FBeUI7SUFDekIsaUNBQW1CO0lBQ25CLHFEQUE2QjtJQUM3QixxQ0FBcUI7SUFDckIsNkNBQXlCO0lBQ3pCLGlDQUFtQjtJQUNuQixvREFBNEI7SUFDNUIscUNBQXFCO0lBQ3JCLG1DQUFvQjtJQUNwQix1Q0FBc0I7Q0FDdkIsQ0FBQztBQU9GOzs7R0FHRztBQUNILFNBQWdCLDRCQUE0QixDQUN4QyxhQUE0QixFQUFFLGVBQTBDLEVBQ3hFLFdBQXdCLEVBQUUscUJBQXVDO0lBQ25FLE9BQU8sQ0FBTyxJQUFVLEVBQUUsT0FBeUIsRUFBRSxFQUFFO1FBQ3JELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDOUIsTUFBTSxTQUFTLEdBQUcsTUFBTSxxREFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzRCxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1lBQzdELE9BQU87U0FDUjtRQUVELG1GQUFtRjtRQUNuRixzRkFBc0Y7UUFDdEYsMkZBQTJGO1FBQzNGLE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUFpQixDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFHLElBQUkscUNBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUMsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBOEIsQ0FBQyxHQUFHLHFCQUFhLEVBQUUsR0FBRyxlQUFlLENBQUMsQ0FBQztRQUNyRixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFFeEIsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7WUFDdEMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFFLENBQUM7WUFDckQsTUFBTSxpQkFBaUIsR0FBRyw4Q0FBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDbEUsTUFBTSxnQkFBZ0IsR0FBRyw4Q0FBcUIsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFFaEUsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0RBQWtELFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQzdFLFNBQVM7YUFDVjtZQUVELDhFQUE4RTtZQUM5RSxrRkFBa0Y7WUFDbEYsNkNBQTZDO1lBQzdDLHVGQUF1RjtZQUN2RixNQUFNLHlCQUF5QixHQUFHLHNDQUFtQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUUsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLGFBQWEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLHlCQUF5QixFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQzFGO1lBQ0QsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7Z0JBQzdCLGFBQWEsQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3hGO1NBQ0Y7UUFFRCxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUM5Qix1REFBdUQ7UUFDdkQsZ0NBQWdDO1FBQ2hDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDckIsTUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLG1CQUFtQixLQUFLLFNBQVMsQ0FBQyxDQUFDO2dCQUM5RSxDQUFDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDaEQsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLGlCQUFpQixHQUFHLGlCQUFpQixJQUFJLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQzthQUN6RTtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLG9FQUFvRTtRQUNwRSxxRUFBcUU7UUFDckUsdUJBQXVCO1FBQ3ZCLElBQUksaUJBQWlCLEVBQUU7WUFDckIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLDhCQUFzQixDQUFDLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztTQUM3RDtRQUVELElBQUkscUJBQXFCLEVBQUU7WUFDekIscUJBQXFCLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUM1RDtRQUVELCtEQUErRDtRQUMvRCxTQUFTLGFBQWEsQ0FBQyxPQUEwQixFQUFFLFdBQW1CLEVBQy9DLFlBQTJCLEVBQUUseUJBQW1DLEVBQ2hFLFlBQXFCO1lBQzFDLE1BQU0sT0FBTyxHQUFHLDJCQUFhLENBQUMseUJBQXlCLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2xGLE1BQU0sYUFBYSxHQUFrQjtnQkFDbkMsWUFBWTtnQkFDWixXQUFXO2dCQUNYLE9BQU87Z0JBQ1AsSUFBSTthQUNMLENBQUM7WUFFRixNQUFNLGFBQWEsR0FBRyxJQUFJLDJCQUFhLENBQ3JDLGFBQWEsRUFDYixPQUFPLEVBQ1AsVUFBVSxFQUNWLGFBQWEsRUFDYixPQUFPLENBQUMsTUFBTSxDQUNmLENBQUM7WUFFRixNQUFNLE1BQU0sR0FDVixhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFFM0YsaUZBQWlGO1lBQ2pGLDhFQUE4RTtZQUM5RSxpRkFBaUY7WUFDakYsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBRXpCLFdBQVcsR0FBRyxXQUFXLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNsRCxDQUFDO0lBQ0gsQ0FBQyxDQUFBLENBQUM7QUFDSixDQUFDO0FBbkdELG9FQW1HQztBQUVELG9FQUFvRTtBQUNwRSxTQUFnQixpQkFBaUIsQ0FBQyxLQUE4QjtJQUU5RCxPQUFPLGtDQUFlLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFIRCw4Q0FHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtSdWxlLCBTY2hlbWF0aWNDb250ZXh0LCBUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XHJcbmltcG9ydCB7Tm9kZVBhY2thZ2VJbnN0YWxsVGFza30gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MvdGFza3MnO1xyXG5pbXBvcnQge1Byb2plY3REZWZpbml0aW9ufSBmcm9tICdAYW5ndWxhci1kZXZraXQvY29yZS9zcmMvd29ya3NwYWNlJztcclxuXHJcbmltcG9ydCB7VXBkYXRlUHJvamVjdH0gZnJvbSAnLi4vdXBkYXRlLXRvb2wnO1xyXG5pbXBvcnQge1dvcmtzcGFjZVBhdGh9IGZyb20gJy4uL3VwZGF0ZS10b29sL2ZpbGUtc3lzdGVtJztcclxuaW1wb3J0IHtNaWdyYXRpb25DdG9yfSBmcm9tICcuLi91cGRhdGUtdG9vbC9taWdyYXRpb24nO1xyXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4uL3VwZGF0ZS10b29sL3RhcmdldC12ZXJzaW9uJztcclxuaW1wb3J0IHtnZXRUYXJnZXRUc2NvbmZpZ1BhdGgsIGdldFdvcmtzcGFjZUNvbmZpZ0dyYWNlZnVsbHl9IGZyb20gJy4uL3V0aWxzL3Byb2plY3QtdHNjb25maWctcGF0aHMnO1xyXG5cclxuaW1wb3J0IHtEZXZraXRGaWxlU3lzdGVtfSBmcm9tICcuL2RldmtpdC1maWxlLXN5c3RlbSc7XHJcbmltcG9ydCB7RGV2a2l0Q29udGV4dCwgRGV2a2l0TWlncmF0aW9uLCBEZXZraXRNaWdyYXRpb25DdG9yfSBmcm9tICcuL2RldmtpdC1taWdyYXRpb24nO1xyXG5pbXBvcnQge2ZpbmRTdHlsZXNoZWV0RmlsZXN9IGZyb20gJy4vZmluZC1zdHlsZXNoZWV0cyc7XHJcbmltcG9ydCB7QXR0cmlidXRlU2VsZWN0b3JzTWlncmF0aW9ufSBmcm9tICcuL21pZ3JhdGlvbnMvYXR0cmlidXRlLXNlbGVjdG9ycyc7XHJcbmltcG9ydCB7Q2xhc3NJbmhlcml0YW5jZU1pZ3JhdGlvbn0gZnJvbSAnLi9taWdyYXRpb25zL2NsYXNzLWluaGVyaXRhbmNlJztcclxuaW1wb3J0IHtDbGFzc05hbWVzTWlncmF0aW9ufSBmcm9tICcuL21pZ3JhdGlvbnMvY2xhc3MtbmFtZXMnO1xyXG5pbXBvcnQge0NvbnN0cnVjdG9yU2lnbmF0dXJlTWlncmF0aW9ufSBmcm9tICcuL21pZ3JhdGlvbnMvY29uc3RydWN0b3Itc2lnbmF0dXJlJztcclxuaW1wb3J0IHtDc3NTZWxlY3RvcnNNaWdyYXRpb259IGZyb20gJy4vbWlncmF0aW9ucy9jc3Mtc2VsZWN0b3JzJztcclxuaW1wb3J0IHtFbGVtZW50U2VsZWN0b3JzTWlncmF0aW9ufSBmcm9tICcuL21pZ3JhdGlvbnMvZWxlbWVudC1zZWxlY3RvcnMnO1xyXG5pbXBvcnQge0lucHV0TmFtZXNNaWdyYXRpb259IGZyb20gJy4vbWlncmF0aW9ucy9pbnB1dC1uYW1lcyc7XHJcbmltcG9ydCB7TWV0aG9kQ2FsbEFyZ3VtZW50c01pZ3JhdGlvbn0gZnJvbSAnLi9taWdyYXRpb25zL21ldGhvZC1jYWxsLWFyZ3VtZW50cyc7XHJcbmltcG9ydCB7TWlzY1RlbXBsYXRlTWlncmF0aW9ufSBmcm9tICcuL21pZ3JhdGlvbnMvbWlzYy10ZW1wbGF0ZSc7XHJcbmltcG9ydCB7T3V0cHV0TmFtZXNNaWdyYXRpb259IGZyb20gJy4vbWlncmF0aW9ucy9vdXRwdXQtbmFtZXMnO1xyXG5pbXBvcnQge1Byb3BlcnR5TmFtZXNNaWdyYXRpb259IGZyb20gJy4vbWlncmF0aW9ucy9wcm9wZXJ0eS1uYW1lcyc7XHJcbmltcG9ydCB7VXBncmFkZURhdGF9IGZyb20gJy4vdXBncmFkZS1kYXRhJztcclxuXHJcblxyXG4vKiogTGlzdCBvZiBtaWdyYXRpb25zIHdoaWNoIHJ1biBmb3IgdGhlIENESyB1cGRhdGUuICovXHJcbmV4cG9ydCBjb25zdCBjZGtNaWdyYXRpb25zOiBNaWdyYXRpb25DdG9yPFVwZ3JhZGVEYXRhPltdID0gW1xyXG4gIEF0dHJpYnV0ZVNlbGVjdG9yc01pZ3JhdGlvbixcclxuICBDbGFzc0luaGVyaXRhbmNlTWlncmF0aW9uLFxyXG4gIENsYXNzTmFtZXNNaWdyYXRpb24sXHJcbiAgQ29uc3RydWN0b3JTaWduYXR1cmVNaWdyYXRpb24sXHJcbiAgQ3NzU2VsZWN0b3JzTWlncmF0aW9uLFxyXG4gIEVsZW1lbnRTZWxlY3RvcnNNaWdyYXRpb24sXHJcbiAgSW5wdXROYW1lc01pZ3JhdGlvbixcclxuICBNZXRob2RDYWxsQXJndW1lbnRzTWlncmF0aW9uLFxyXG4gIE1pc2NUZW1wbGF0ZU1pZ3JhdGlvbixcclxuICBPdXRwdXROYW1lc01pZ3JhdGlvbixcclxuICBQcm9wZXJ0eU5hbWVzTWlncmF0aW9uLFxyXG5dO1xyXG5cclxuZXhwb3J0IHR5cGUgTnVsbGFibGVEZXZraXRNaWdyYXRpb24gPSBNaWdyYXRpb25DdG9yPFVwZ3JhZGVEYXRhfG51bGwsIERldmtpdENvbnRleHQ+O1xyXG5cclxudHlwZSBQb3N0TWlncmF0aW9uRm4gPVxyXG4gICAgKGNvbnRleHQ6IFNjaGVtYXRpY0NvbnRleHQsIHRhcmdldFZlcnNpb246IFRhcmdldFZlcnNpb24sIGhhc0ZhaWx1cmU6IGJvb2xlYW4pID0+IHZvaWQ7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIEFuZ3VsYXIgc2NoZW1hdGljIHJ1bGUgdGhhdCBydW5zIHRoZSB1cGdyYWRlIGZvciB0aGVcclxuICogc3BlY2lmaWVkIHRhcmdldCB2ZXJzaW9uLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1pZ3JhdGlvblNjaGVtYXRpY1J1bGUoXHJcbiAgICB0YXJnZXRWZXJzaW9uOiBUYXJnZXRWZXJzaW9uLCBleHRyYU1pZ3JhdGlvbnM6IE51bGxhYmxlRGV2a2l0TWlncmF0aW9uW10sXHJcbiAgICB1cGdyYWRlRGF0YTogVXBncmFkZURhdGEsIG9uTWlncmF0aW9uQ29tcGxldGVGbj86IFBvc3RNaWdyYXRpb25Gbik6IFJ1bGUge1xyXG4gIHJldHVybiBhc3luYyAodHJlZTogVHJlZSwgY29udGV4dDogU2NoZW1hdGljQ29udGV4dCkgPT4ge1xyXG4gICAgY29uc3QgbG9nZ2VyID0gY29udGV4dC5sb2dnZXI7XHJcbiAgICBjb25zdCB3b3Jrc3BhY2UgPSBhd2FpdCBnZXRXb3Jrc3BhY2VDb25maWdHcmFjZWZ1bGx5KHRyZWUpO1xyXG5cclxuICAgIGlmICh3b3Jrc3BhY2UgPT09IG51bGwpIHtcclxuICAgICAgbG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgZmluZCB3b3Jrc3BhY2UgY29uZmlndXJhdGlvbiBmaWxlLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiBhbGwgcHJvamVjdCBzb3VyY2UgZmlsZXMgd2hpY2ggaGF2ZSBiZWVuIGNoZWNrZWQvbWlncmF0ZWQuIFRoaXMgaXNcclxuICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIG11bHRpcGxlIFR5cGVTY3JpcHQgcHJvamVjdHMgY2FuIGNvbnRhaW4gdGhlIHNhbWUgc291cmNlIGZpbGUgYW5kXHJcbiAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGNoZWNrIHRoZXNlIGFnYWluLCBhcyB0aGlzIHdvdWxkIHJlc3VsdCBpbiBkdXBsaWNhdGVkIGZhaWx1cmUgbWVzc2FnZXMuXHJcbiAgICBjb25zdCBhbmFseXplZEZpbGVzID0gbmV3IFNldDxXb3Jrc3BhY2VQYXRoPigpO1xyXG4gICAgY29uc3QgZmlsZVN5c3RlbSA9IG5ldyBEZXZraXRGaWxlU3lzdGVtKHRyZWUpO1xyXG4gICAgY29uc3QgcHJvamVjdE5hbWVzID0gd29ya3NwYWNlLnByb2plY3RzLmtleXMoKTtcclxuICAgIGNvbnN0IG1pZ3JhdGlvbnM6IE51bGxhYmxlRGV2a2l0TWlncmF0aW9uW10gPSBbLi4uY2RrTWlncmF0aW9ucywgLi4uZXh0cmFNaWdyYXRpb25zXTtcclxuICAgIGxldCBoYXNGYWlsdXJlcyA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAoY29uc3QgcHJvamVjdE5hbWUgb2YgcHJvamVjdE5hbWVzKSB7XHJcbiAgICAgIGNvbnN0IHByb2plY3QgPSB3b3Jrc3BhY2UucHJvamVjdHMuZ2V0KHByb2plY3ROYW1lKSE7XHJcbiAgICAgIGNvbnN0IGJ1aWxkVHNjb25maWdQYXRoID0gZ2V0VGFyZ2V0VHNjb25maWdQYXRoKHByb2plY3QsICdidWlsZCcpO1xyXG4gICAgICBjb25zdCB0ZXN0VHNjb25maWdQYXRoID0gZ2V0VGFyZ2V0VHNjb25maWdQYXRoKHByb2plY3QsICd0ZXN0Jyk7XHJcblxyXG4gICAgICBpZiAoIWJ1aWxkVHNjb25maWdQYXRoICYmICF0ZXN0VHNjb25maWdQYXRoKSB7XHJcbiAgICAgICAgbG9nZ2VyLndhcm4oYENvdWxkIG5vdCBmaW5kIFR5cGVTY3JpcHQgcHJvamVjdCBmb3IgcHJvamVjdDogJHtwcm9qZWN0TmFtZX1gKTtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSW4gc29tZSBhcHBsaWNhdGlvbnMsIGRldmVsb3BlcnMgd2lsbCBoYXZlIGdsb2JhbCBzdHlsZXNoZWV0cyB3aGljaCBhcmUgbm90XHJcbiAgICAgIC8vIHNwZWNpZmllZCBpbiBhbnkgQW5ndWxhciBjb21wb25lbnQuIFRoZXJlZm9yZSB3ZSBnbG9iIHVwIGFsbCBDU1MgYW5kIFNDU1MgZmlsZXNcclxuICAgICAgLy8gaW4gdGhlIHByb2plY3QgYW5kIG1pZ3JhdGUgdGhlbSBpZiBuZWVkZWQuXHJcbiAgICAgIC8vIFRPRE86IHJld29yayB0aGlzIHRvIGNvbGxlY3QgZ2xvYmFsIHN0eWxlc2hlZXRzIGZyb20gdGhlIHdvcmtzcGFjZSBjb25maWcuIENPTVAtMjgwLlxyXG4gICAgICBjb25zdCBhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzID0gZmluZFN0eWxlc2hlZXRGaWxlcyh0cmVlLCBwcm9qZWN0LnJvb3QpO1xyXG5cclxuICAgICAgaWYgKGJ1aWxkVHNjb25maWdQYXRoICE9PSBudWxsKSB7XHJcbiAgICAgICAgcnVuTWlncmF0aW9ucyhwcm9qZWN0LCBwcm9qZWN0TmFtZSwgYnVpbGRUc2NvbmZpZ1BhdGgsIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHMsIGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodGVzdFRzY29uZmlnUGF0aCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJ1bk1pZ3JhdGlvbnMocHJvamVjdCwgcHJvamVjdE5hbWUsIHRlc3RUc2NvbmZpZ1BhdGgsIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHMsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJ1blBhY2thZ2VNYW5hZ2VyID0gZmFsc2U7XHJcbiAgICAvLyBSdW4gdGhlIGdsb2JhbCBwb3N0IG1pZ3JhdGlvbiBzdGF0aWMgbWVtYmVycyBmb3IgYWxsXHJcbiAgICAvLyByZWdpc3RlcmVkIGRldmtpdCBtaWdyYXRpb25zLlxyXG4gICAgbWlncmF0aW9ucy5mb3JFYWNoKG0gPT4ge1xyXG4gICAgICBjb25zdCBhY3Rpb25SZXN1bHQgPSBpc0RldmtpdE1pZ3JhdGlvbihtKSAmJiBtLmdsb2JhbFBvc3RNaWdyYXRpb24gIT09IHVuZGVmaW5lZCA/XHJcbiAgICAgICAgICBtLmdsb2JhbFBvc3RNaWdyYXRpb24odHJlZSwgY29udGV4dCkgOiBudWxsO1xyXG4gICAgICBpZiAoYWN0aW9uUmVzdWx0KSB7XHJcbiAgICAgICAgcnVuUGFja2FnZU1hbmFnZXIgPSBydW5QYWNrYWdlTWFuYWdlciB8fCBhY3Rpb25SZXN1bHQucnVuUGFja2FnZU1hbmFnZXI7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIElmIGEgbWlncmF0aW9uIHJlcXVlc3RlZCB0aGUgcGFja2FnZSBtYW5hZ2VyIHRvIHJ1biwgd2UgcnVuIGl0IGFzIGFuXHJcbiAgICAvLyBhc3luY2hyb25vdXMgcG9zdCBtaWdyYXRpb24gdGFzay4gV2UgY2Fubm90IHJ1biBpdCBzeW5jaHJvbm91c2x5LFxyXG4gICAgLy8gYXMgZmlsZSBjaGFuZ2VzIGZyb20gdGhlIGN1cnJlbnQgbWlncmF0aW9uIHRhc2sgYXJlIG5vdCBhcHBsaWVkIHRvXHJcbiAgICAvLyB0aGUgZmlsZSBzeXN0ZW0geWV0LlxyXG4gICAgaWYgKHJ1blBhY2thZ2VNYW5hZ2VyKSB7XHJcbiAgICAgIGNvbnRleHQuYWRkVGFzayhuZXcgTm9kZVBhY2thZ2VJbnN0YWxsVGFzayh7cXVpZXQ6IGZhbHNlfSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvbk1pZ3JhdGlvbkNvbXBsZXRlRm4pIHtcclxuICAgICAgb25NaWdyYXRpb25Db21wbGV0ZUZuKGNvbnRleHQsIHRhcmdldFZlcnNpb24sIGhhc0ZhaWx1cmVzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogUnVucyB0aGUgbWlncmF0aW9ucyBmb3IgdGhlIHNwZWNpZmllZCB3b3Jrc3BhY2UgcHJvamVjdC4gKi9cclxuICAgIGZ1bmN0aW9uIHJ1bk1pZ3JhdGlvbnMocHJvamVjdDogUHJvamVjdERlZmluaXRpb24sIHByb2plY3ROYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRzY29uZmlnUGF0aDogV29ya3NwYWNlUGF0aCwgYWRkaXRpb25hbFN0eWxlc2hlZXRQYXRoczogc3RyaW5nW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVGVzdFRhcmdldDogYm9vbGVhbikge1xyXG4gICAgICBjb25zdCBwcm9ncmFtID0gVXBkYXRlUHJvamVjdC5jcmVhdGVQcm9ncmFtRnJvbVRzY29uZmlnKHRzY29uZmlnUGF0aCwgZmlsZVN5c3RlbSk7XHJcbiAgICAgIGNvbnN0IHVwZGF0ZUNvbnRleHQ6IERldmtpdENvbnRleHQgPSB7XHJcbiAgICAgICAgaXNUZXN0VGFyZ2V0LFxyXG4gICAgICAgIHByb2plY3ROYW1lLFxyXG4gICAgICAgIHByb2plY3QsXHJcbiAgICAgICAgdHJlZSxcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGNvbnN0IHVwZGF0ZVByb2plY3QgPSBuZXcgVXBkYXRlUHJvamVjdChcclxuICAgICAgICB1cGRhdGVDb250ZXh0LFxyXG4gICAgICAgIHByb2dyYW0sXHJcbiAgICAgICAgZmlsZVN5c3RlbSxcclxuICAgICAgICBhbmFseXplZEZpbGVzLFxyXG4gICAgICAgIGNvbnRleHQubG9nZ2VyLFxyXG4gICAgICApO1xyXG5cclxuICAgICAgY29uc3QgcmVzdWx0ID1cclxuICAgICAgICB1cGRhdGVQcm9qZWN0Lm1pZ3JhdGUobWlncmF0aW9ucywgdGFyZ2V0VmVyc2lvbiwgdXBncmFkZURhdGEsIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHMpO1xyXG5cclxuICAgICAgLy8gQ29tbWl0IGFsbCByZWNvcmRlZCBlZGl0cyBpbiB0aGUgdXBkYXRlIHJlY29yZGVyLiBXZSBhcHBseSB0aGUgZWRpdHMgYWZ0ZXIgYWxsXHJcbiAgICAgIC8vIG1pZ3JhdGlvbnMgcmFuIGJlY2F1c2Ugb3RoZXJ3aXNlIG9mZnNldHMgaW4gdGhlIFR5cGVTY3JpcHQgcHJvZ3JhbSB3b3VsZCBiZVxyXG4gICAgICAvLyBzaGlmdGVkIGFuZCBpbmRpdmlkdWFsIG1pZ3JhdGlvbnMgY291bGQgbm8gbG9uZ2VyIHVwZGF0ZSB0aGUgc2FtZSBzb3VyY2UgZmlsZS5cclxuICAgICAgZmlsZVN5c3RlbS5jb21taXRFZGl0cygpO1xyXG5cclxuICAgICAgaGFzRmFpbHVyZXMgPSBoYXNGYWlsdXJlcyB8fCByZXN1bHQuaGFzRmFpbHVyZXM7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuLyoqIFdoZXRoZXIgdGhlIGdpdmVuIG1pZ3JhdGlvbiB0eXBlIHJlZmVycyB0byBhIGRldmtpdCBtaWdyYXRpb24gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2a2l0TWlncmF0aW9uKHZhbHVlOiBNaWdyYXRpb25DdG9yPGFueSwgYW55PilcclxuICAgIDogdmFsdWUgaXMgRGV2a2l0TWlncmF0aW9uQ3Rvcjxhbnk+IHtcclxuICByZXR1cm4gRGV2a2l0TWlncmF0aW9uLmlzUHJvdG90eXBlT2YodmFsdWUpO1xyXG59XHJcbiJdfQ==