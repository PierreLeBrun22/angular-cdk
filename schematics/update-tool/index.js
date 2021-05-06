"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProject = void 0;
const ts = require("typescript");
const component_resource_collector_1 = require("./component-resource-collector");
const logger_1 = require("./logger");
const parse_tsconfig_1 = require("./utils/parse-tsconfig");
const virtual_host_1 = require("./utils/virtual-host");
/**
 * An update project that can be run against individual migrations. An update project
 * accepts a TypeScript program and a context that is provided to all migrations. The
 * context is usually not used by migrations, but in some cases migrations rely on
 * specifics from the tool that performs the update (e.g. the Angular CLI). In those cases,
 * the context can provide the necessary specifics to the migrations in a type-safe way.
 */
class UpdateProject {
    constructor(/** Context provided to all migrations. */ _context, 
    /** TypeScript program using workspace paths. */
    _program, 
    /** File system used for reading, writing and editing files. */
    _fileSystem, 
    /**
     * Set of analyzed files. Used for avoiding multiple migration runs if
     * files overlap between targets.
     */
    _analyzedFiles = new Set(), 
    /** Logger used for printing messages. */
    _logger = logger_1.defaultLogger) {
        this._context = _context;
        this._program = _program;
        this._fileSystem = _fileSystem;
        this._analyzedFiles = _analyzedFiles;
        this._logger = _logger;
        this._typeChecker = this._program.getTypeChecker();
    }
    /**
     * Migrates the project to the specified target version.
     * @param migrationTypes Migrations that should be run.
     * @param target Version the project should be updated to.
     * @param data Upgrade data that is passed to all migration rules.
     * @param additionalStylesheetPaths Additional stylesheets that should be migrated, if not
     *   referenced in an Angular component. This is helpful for global stylesheets in a project.
     */
    migrate(migrationTypes, target, data, additionalStylesheetPaths) {
        // Create instances of the specified migrations.
        const migrations = this._createMigrations(migrationTypes, target, data);
        // Creates the component resource collector. The collector can visit arbitrary
        // TypeScript nodes and will find Angular component resources. Resources include
        // templates and stylesheets. It also captures inline stylesheets and templates.
        const resourceCollector = new component_resource_collector_1.ComponentResourceCollector(this._typeChecker, this._fileSystem);
        // Collect all of the TypeScript source files we want to migrate. We don't
        // migrate type definition files, or source files from external libraries.
        const sourceFiles = this._program.getSourceFiles().filter(f => !f.isDeclarationFile && !this._program.isSourceFileFromExternalLibrary(f));
        // Helper function that visits a given TypeScript node and collects all referenced
        // component resources (i.e. stylesheets or templates). Additionally, the helper
        // visits the node in each instantiated migration.
        const visitNodeAndCollectResources = (node) => {
            migrations.forEach(r => r.visitNode(node));
            ts.forEachChild(node, visitNodeAndCollectResources);
            resourceCollector.visitNode(node);
        };
        // Walk through all source file, if it has not been visited before, and
        // visit found nodes while collecting potential resources.
        sourceFiles.forEach(sourceFile => {
            const resolvedPath = this._fileSystem.resolve(sourceFile.fileName);
            // Do not visit source files which have been checked as part of a
            // previously migrated TypeScript project.
            if (!this._analyzedFiles.has(resolvedPath)) {
                visitNodeAndCollectResources(sourceFile);
                this._analyzedFiles.add(resolvedPath);
            }
        });
        // Walk through all resolved templates and visit them in each instantiated
        // migration. Note that this can only happen after source files have been
        // visited because we find templates through the TypeScript source files.
        resourceCollector.resolvedTemplates.forEach(template => {
            // Do not visit the template if it has been checked before. Inline
            // templates cannot be referenced multiple times.
            if (template.inline || !this._analyzedFiles.has(template.filePath)) {
                migrations.forEach(m => m.visitTemplate(template));
                this._analyzedFiles.add(template.filePath);
            }
        });
        // Walk through all resolved stylesheets and visit them in each instantiated
        // migration. Note that this can only happen after source files have been
        // visited because we find stylesheets through the TypeScript source files.
        resourceCollector.resolvedStylesheets.forEach(stylesheet => {
            // Do not visit the stylesheet if it has been checked before. Inline
            // stylesheets cannot be referenced multiple times.
            if (stylesheet.inline || !this._analyzedFiles.has(stylesheet.filePath)) {
                migrations.forEach(r => r.visitStylesheet(stylesheet));
                this._analyzedFiles.add(stylesheet.filePath);
            }
        });
        // In some applications, developers will have global stylesheets which are not
        // specified in any Angular component. Therefore we allow for additional stylesheets
        // being specified. We visit them in each migration unless they have been already
        // discovered before as actual component resource.
        if (additionalStylesheetPaths) {
            additionalStylesheetPaths.forEach(filePath => {
                const resolvedPath = this._fileSystem.resolve(filePath);
                const stylesheet = resourceCollector.resolveExternalStylesheet(resolvedPath, null);
                // Do not visit stylesheets which have been referenced from a component.
                if (!this._analyzedFiles.has(resolvedPath) && stylesheet) {
                    migrations.forEach(r => r.visitStylesheet(stylesheet));
                    this._analyzedFiles.add(resolvedPath);
                }
            });
        }
        // Call the "postAnalysis" method for each migration.
        migrations.forEach(r => r.postAnalysis());
        // Collect all failures reported by individual migrations.
        const failures = migrations.reduce((res, m) => res.concat(m.failures), []);
        // In case there are failures, print these to the CLI logger as warnings.
        if (failures.length) {
            failures.forEach(({ filePath, message, position }) => {
                const lineAndCharacter = position ? `@${position.line + 1}:${position.character + 1}` : '';
                this._logger.warn(`${filePath}${lineAndCharacter} - ${message}`);
            });
        }
        return {
            hasFailures: !!failures.length,
        };
    }
    /**
     * Creates instances of the given migrations with the specified target
     * version and data.
     */
    _createMigrations(types, target, data) {
        const result = [];
        for (const ctor of types) {
            const instance = new ctor(this._program, this._typeChecker, target, this._context, data, this._fileSystem, this._logger);
            instance.init();
            if (instance.enabled) {
                result.push(instance);
            }
        }
        return result;
    }
    /**
     * Creates a program form the specified tsconfig and patches the host
     * to read files and directories through the given file system.
     */
    static createProgramFromTsconfig(tsconfigPath, fs) {
        const parsed = parse_tsconfig_1.parseTsconfigFile(fs.resolve(tsconfigPath), fs);
        const host = virtual_host_1.createFileSystemCompilerHost(parsed.options, fs);
        return ts.createProgram(parsed.fileNames, parsed.options, host);
    }
}
exports.UpdateProject = UpdateProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvdXBkYXRlLXRvb2wvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLGlGQUEwRTtBQUUxRSxxQ0FBcUQ7QUFHckQsMkRBQXlEO0FBQ3pELHVEQUFrRTtBQUVsRTs7Ozs7O0dBTUc7QUFDSCxNQUFhLGFBQWE7SUFHeEIsWUFBWSwwQ0FBMEMsQ0FDbEMsUUFBaUI7SUFDekIsZ0RBQWdEO0lBQ3hDLFFBQW9CO0lBQzVCLCtEQUErRDtJQUN2RCxXQUF1QjtJQUMvQjs7O09BR0c7SUFDSyxpQkFBcUMsSUFBSSxHQUFHLEVBQUU7SUFDdEQseUNBQXlDO0lBQ2pDLFVBQXdCLHNCQUFhO1FBWHJDLGFBQVEsR0FBUixRQUFRLENBQVM7UUFFakIsYUFBUSxHQUFSLFFBQVEsQ0FBWTtRQUVwQixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUt2QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0M7UUFFOUMsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7UUFkeEMsaUJBQVksR0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQWNuQixDQUFDO0lBRTdEOzs7Ozs7O09BT0c7SUFDSCxPQUFPLENBQU8sY0FBOEMsRUFBRSxNQUFxQixFQUFFLElBQVUsRUFDM0YseUJBQW9DO1FBQ3RDLGdEQUFnRDtRQUNoRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4RSw4RUFBOEU7UUFDOUUsZ0ZBQWdGO1FBQ2hGLGdGQUFnRjtRQUNoRixNQUFNLGlCQUFpQixHQUFHLElBQUkseURBQTBCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUYs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RCxPQUFPO1lBQ0wsV0FBVyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTTtTQUMvQixDQUFDO0lBQ0osQ0FBQztJQUVEOzs7T0FHRztJQUNLLGlCQUFpQixDQUFPLEtBQXFDLEVBQUUsTUFBcUIsRUFDNUQsSUFBVTtRQUN4QyxNQUFNLE1BQU0sR0FBK0IsRUFBRSxDQUFDO1FBQzlDLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO1lBQ3hCLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFDL0UsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdkI7U0FDRjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxNQUFNLENBQUMseUJBQXlCLENBQUMsWUFBMkIsRUFBRSxFQUFjO1FBQzFFLE1BQU0sTUFBTSxHQUFHLGtDQUFpQixDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0QsTUFBTSxJQUFJLEdBQUcsMkNBQTRCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM5RCxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xFLENBQUM7Q0FDRjtBQWxKRCxzQ0FrSkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnRSZXNvdXJjZUNvbGxlY3Rvcn0gZnJvbSAnLi9jb21wb25lbnQtcmVzb3VyY2UtY29sbGVjdG9yJztcclxuaW1wb3J0IHtGaWxlU3lzdGVtLCBXb3Jrc3BhY2VQYXRofSBmcm9tICcuL2ZpbGUtc3lzdGVtJztcclxuaW1wb3J0IHtkZWZhdWx0TG9nZ2VyLCBVcGRhdGVMb2dnZXJ9IGZyb20gJy4vbG9nZ2VyJztcclxuaW1wb3J0IHtNaWdyYXRpb24sIE1pZ3JhdGlvbkN0b3IsIE1pZ3JhdGlvbkZhaWx1cmV9IGZyb20gJy4vbWlncmF0aW9uJztcclxuaW1wb3J0IHtUYXJnZXRWZXJzaW9ufSBmcm9tICcuL3RhcmdldC12ZXJzaW9uJztcclxuaW1wb3J0IHtwYXJzZVRzY29uZmlnRmlsZX0gZnJvbSAnLi91dGlscy9wYXJzZS10c2NvbmZpZyc7XHJcbmltcG9ydCB7Y3JlYXRlRmlsZVN5c3RlbUNvbXBpbGVySG9zdH0gZnJvbSAnLi91dGlscy92aXJ0dWFsLWhvc3QnO1xyXG5cclxuLyoqXHJcbiAqIEFuIHVwZGF0ZSBwcm9qZWN0IHRoYXQgY2FuIGJlIHJ1biBhZ2FpbnN0IGluZGl2aWR1YWwgbWlncmF0aW9ucy4gQW4gdXBkYXRlIHByb2plY3RcclxuICogYWNjZXB0cyBhIFR5cGVTY3JpcHQgcHJvZ3JhbSBhbmQgYSBjb250ZXh0IHRoYXQgaXMgcHJvdmlkZWQgdG8gYWxsIG1pZ3JhdGlvbnMuIFRoZVxyXG4gKiBjb250ZXh0IGlzIHVzdWFsbHkgbm90IHVzZWQgYnkgbWlncmF0aW9ucywgYnV0IGluIHNvbWUgY2FzZXMgbWlncmF0aW9ucyByZWx5IG9uXHJcbiAqIHNwZWNpZmljcyBmcm9tIHRoZSB0b29sIHRoYXQgcGVyZm9ybXMgdGhlIHVwZGF0ZSAoZS5nLiB0aGUgQW5ndWxhciBDTEkpLiBJbiB0aG9zZSBjYXNlcyxcclxuICogdGhlIGNvbnRleHQgY2FuIHByb3ZpZGUgdGhlIG5lY2Vzc2FyeSBzcGVjaWZpY3MgdG8gdGhlIG1pZ3JhdGlvbnMgaW4gYSB0eXBlLXNhZmUgd2F5LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFVwZGF0ZVByb2plY3Q8Q29udGV4dD4ge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX3R5cGVDaGVja2VyOiB0cy5UeXBlQ2hlY2tlciA9IHRoaXMuX3Byb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcclxuXHJcbiAgY29uc3RydWN0b3IoLyoqIENvbnRleHQgcHJvdmlkZWQgdG8gYWxsIG1pZ3JhdGlvbnMuICovXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfY29udGV4dDogQ29udGV4dCxcclxuICAgICAgICAgICAgICAvKiogVHlwZVNjcmlwdCBwcm9ncmFtIHVzaW5nIHdvcmtzcGFjZSBwYXRocy4gKi9cclxuICAgICAgICAgICAgICBwcml2YXRlIF9wcm9ncmFtOiB0cy5Qcm9ncmFtLFxyXG4gICAgICAgICAgICAgIC8qKiBGaWxlIHN5c3RlbSB1c2VkIGZvciByZWFkaW5nLCB3cml0aW5nIGFuZCBlZGl0aW5nIGZpbGVzLiAqL1xyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2ZpbGVTeXN0ZW06IEZpbGVTeXN0ZW0sXHJcbiAgICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAgICogU2V0IG9mIGFuYWx5emVkIGZpbGVzLiBVc2VkIGZvciBhdm9pZGluZyBtdWx0aXBsZSBtaWdyYXRpb24gcnVucyBpZlxyXG4gICAgICAgICAgICAgICAqIGZpbGVzIG92ZXJsYXAgYmV0d2VlbiB0YXJnZXRzLlxyXG4gICAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2FuYWx5emVkRmlsZXM6IFNldDxXb3Jrc3BhY2VQYXRoPiA9IG5ldyBTZXQoKSxcclxuICAgICAgICAgICAgICAvKiogTG9nZ2VyIHVzZWQgZm9yIHByaW50aW5nIG1lc3NhZ2VzLiAqL1xyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2xvZ2dlcjogVXBkYXRlTG9nZ2VyID0gZGVmYXVsdExvZ2dlcikge31cclxuXHJcbiAgLyoqXHJcbiAgICogTWlncmF0ZXMgdGhlIHByb2plY3QgdG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgdmVyc2lvbi5cclxuICAgKiBAcGFyYW0gbWlncmF0aW9uVHlwZXMgTWlncmF0aW9ucyB0aGF0IHNob3VsZCBiZSBydW4uXHJcbiAgICogQHBhcmFtIHRhcmdldCBWZXJzaW9uIHRoZSBwcm9qZWN0IHNob3VsZCBiZSB1cGRhdGVkIHRvLlxyXG4gICAqIEBwYXJhbSBkYXRhIFVwZ3JhZGUgZGF0YSB0aGF0IGlzIHBhc3NlZCB0byBhbGwgbWlncmF0aW9uIHJ1bGVzLlxyXG4gICAqIEBwYXJhbSBhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzIEFkZGl0aW9uYWwgc3R5bGVzaGVldHMgdGhhdCBzaG91bGQgYmUgbWlncmF0ZWQsIGlmIG5vdFxyXG4gICAqICAgcmVmZXJlbmNlZCBpbiBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBpcyBoZWxwZnVsIGZvciBnbG9iYWwgc3R5bGVzaGVldHMgaW4gYSBwcm9qZWN0LlxyXG4gICAqL1xyXG4gIG1pZ3JhdGU8RGF0YT4obWlncmF0aW9uVHlwZXM6IE1pZ3JhdGlvbkN0b3I8RGF0YSwgQ29udGV4dD5bXSwgdGFyZ2V0OiBUYXJnZXRWZXJzaW9uLCBkYXRhOiBEYXRhLFxyXG4gICAgICBhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzPzogc3RyaW5nW10pOiB7aGFzRmFpbHVyZXM6IGJvb2xlYW59IHtcclxuICAgIC8vIENyZWF0ZSBpbnN0YW5jZXMgb2YgdGhlIHNwZWNpZmllZCBtaWdyYXRpb25zLlxyXG4gICAgY29uc3QgbWlncmF0aW9ucyA9IHRoaXMuX2NyZWF0ZU1pZ3JhdGlvbnMobWlncmF0aW9uVHlwZXMsIHRhcmdldCwgZGF0YSk7XHJcbiAgICAvLyBDcmVhdGVzIHRoZSBjb21wb25lbnQgcmVzb3VyY2UgY29sbGVjdG9yLiBUaGUgY29sbGVjdG9yIGNhbiB2aXNpdCBhcmJpdHJhcnlcclxuICAgIC8vIFR5cGVTY3JpcHQgbm9kZXMgYW5kIHdpbGwgZmluZCBBbmd1bGFyIGNvbXBvbmVudCByZXNvdXJjZXMuIFJlc291cmNlcyBpbmNsdWRlXHJcbiAgICAvLyB0ZW1wbGF0ZXMgYW5kIHN0eWxlc2hlZXRzLiBJdCBhbHNvIGNhcHR1cmVzIGlubGluZSBzdHlsZXNoZWV0cyBhbmQgdGVtcGxhdGVzLlxyXG4gICAgY29uc3QgcmVzb3VyY2VDb2xsZWN0b3IgPSBuZXcgQ29tcG9uZW50UmVzb3VyY2VDb2xsZWN0b3IodGhpcy5fdHlwZUNoZWNrZXIsIHRoaXMuX2ZpbGVTeXN0ZW0pO1xyXG4gICAgLy8gQ29sbGVjdCBhbGwgb2YgdGhlIFR5cGVTY3JpcHQgc291cmNlIGZpbGVzIHdlIHdhbnQgdG8gbWlncmF0ZS4gV2UgZG9uJ3RcclxuICAgIC8vIG1pZ3JhdGUgdHlwZSBkZWZpbml0aW9uIGZpbGVzLCBvciBzb3VyY2UgZmlsZXMgZnJvbSBleHRlcm5hbCBsaWJyYXJpZXMuXHJcbiAgICBjb25zdCBzb3VyY2VGaWxlcyA9IHRoaXMuX3Byb2dyYW0uZ2V0U291cmNlRmlsZXMoKS5maWx0ZXIoXHJcbiAgICAgIGYgPT4gIWYuaXNEZWNsYXJhdGlvbkZpbGUgJiYgIXRoaXMuX3Byb2dyYW0uaXNTb3VyY2VGaWxlRnJvbUV4dGVybmFsTGlicmFyeShmKSk7XHJcblxyXG4gICAgLy8gSGVscGVyIGZ1bmN0aW9uIHRoYXQgdmlzaXRzIGEgZ2l2ZW4gVHlwZVNjcmlwdCBub2RlIGFuZCBjb2xsZWN0cyBhbGwgcmVmZXJlbmNlZFxyXG4gICAgLy8gY29tcG9uZW50IHJlc291cmNlcyAoaS5lLiBzdHlsZXNoZWV0cyBvciB0ZW1wbGF0ZXMpLiBBZGRpdGlvbmFsbHksIHRoZSBoZWxwZXJcclxuICAgIC8vIHZpc2l0cyB0aGUgbm9kZSBpbiBlYWNoIGluc3RhbnRpYXRlZCBtaWdyYXRpb24uXHJcbiAgICBjb25zdCB2aXNpdE5vZGVBbmRDb2xsZWN0UmVzb3VyY2VzID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcclxuICAgICAgbWlncmF0aW9ucy5mb3JFYWNoKHIgPT4gci52aXNpdE5vZGUobm9kZSkpO1xyXG4gICAgICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlQW5kQ29sbGVjdFJlc291cmNlcyk7XHJcbiAgICAgIHJlc291cmNlQ29sbGVjdG9yLnZpc2l0Tm9kZShub2RlKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBzb3VyY2UgZmlsZSwgaWYgaXQgaGFzIG5vdCBiZWVuIHZpc2l0ZWQgYmVmb3JlLCBhbmRcclxuICAgIC8vIHZpc2l0IGZvdW5kIG5vZGVzIHdoaWxlIGNvbGxlY3RpbmcgcG90ZW50aWFsIHJlc291cmNlcy5cclxuICAgIHNvdXJjZUZpbGVzLmZvckVhY2goc291cmNlRmlsZSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMuX2ZpbGVTeXN0ZW0ucmVzb2x2ZShzb3VyY2VGaWxlLmZpbGVOYW1lKTtcclxuICAgICAgLy8gRG8gbm90IHZpc2l0IHNvdXJjZSBmaWxlcyB3aGljaCBoYXZlIGJlZW4gY2hlY2tlZCBhcyBwYXJ0IG9mIGFcclxuICAgICAgLy8gcHJldmlvdXNseSBtaWdyYXRlZCBUeXBlU2NyaXB0IHByb2plY3QuXHJcbiAgICAgIGlmICghdGhpcy5fYW5hbHl6ZWRGaWxlcy5oYXMocmVzb2x2ZWRQYXRoKSkge1xyXG4gICAgICAgIHZpc2l0Tm9kZUFuZENvbGxlY3RSZXNvdXJjZXMoc291cmNlRmlsZSk7XHJcbiAgICAgICAgdGhpcy5fYW5hbHl6ZWRGaWxlcy5hZGQocmVzb2x2ZWRQYXRoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCByZXNvbHZlZCB0ZW1wbGF0ZXMgYW5kIHZpc2l0IHRoZW0gaW4gZWFjaCBpbnN0YW50aWF0ZWRcclxuICAgIC8vIG1pZ3JhdGlvbi4gTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgaGFwcGVuIGFmdGVyIHNvdXJjZSBmaWxlcyBoYXZlIGJlZW5cclxuICAgIC8vIHZpc2l0ZWQgYmVjYXVzZSB3ZSBmaW5kIHRlbXBsYXRlcyB0aHJvdWdoIHRoZSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlcy5cclxuICAgIHJlc291cmNlQ29sbGVjdG9yLnJlc29sdmVkVGVtcGxhdGVzLmZvckVhY2godGVtcGxhdGUgPT4ge1xyXG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIHRlbXBsYXRlIGlmIGl0IGhhcyBiZWVuIGNoZWNrZWQgYmVmb3JlLiBJbmxpbmVcclxuICAgICAgLy8gdGVtcGxhdGVzIGNhbm5vdCBiZSByZWZlcmVuY2VkIG11bHRpcGxlIHRpbWVzLlxyXG4gICAgICBpZiAodGVtcGxhdGUuaW5saW5lIHx8ICF0aGlzLl9hbmFseXplZEZpbGVzLmhhcyh0ZW1wbGF0ZS5maWxlUGF0aCkpIHtcclxuICAgICAgICBtaWdyYXRpb25zLmZvckVhY2gobSA9PiBtLnZpc2l0VGVtcGxhdGUodGVtcGxhdGUpKTtcclxuICAgICAgICB0aGlzLl9hbmFseXplZEZpbGVzLmFkZCh0ZW1wbGF0ZS5maWxlUGF0aCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgcmVzb2x2ZWQgc3R5bGVzaGVldHMgYW5kIHZpc2l0IHRoZW0gaW4gZWFjaCBpbnN0YW50aWF0ZWRcclxuICAgIC8vIG1pZ3JhdGlvbi4gTm90ZSB0aGF0IHRoaXMgY2FuIG9ubHkgaGFwcGVuIGFmdGVyIHNvdXJjZSBmaWxlcyBoYXZlIGJlZW5cclxuICAgIC8vIHZpc2l0ZWQgYmVjYXVzZSB3ZSBmaW5kIHN0eWxlc2hlZXRzIHRocm91Z2ggdGhlIFR5cGVTY3JpcHQgc291cmNlIGZpbGVzLlxyXG4gICAgcmVzb3VyY2VDb2xsZWN0b3IucmVzb2x2ZWRTdHlsZXNoZWV0cy5mb3JFYWNoKHN0eWxlc2hlZXQgPT4ge1xyXG4gICAgICAvLyBEbyBub3QgdmlzaXQgdGhlIHN0eWxlc2hlZXQgaWYgaXQgaGFzIGJlZW4gY2hlY2tlZCBiZWZvcmUuIElubGluZVxyXG4gICAgICAvLyBzdHlsZXNoZWV0cyBjYW5ub3QgYmUgcmVmZXJlbmNlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgICAgaWYgKHN0eWxlc2hlZXQuaW5saW5lIHx8ICF0aGlzLl9hbmFseXplZEZpbGVzLmhhcyhzdHlsZXNoZWV0LmZpbGVQYXRoKSkge1xyXG4gICAgICAgIG1pZ3JhdGlvbnMuZm9yRWFjaChyID0+IHIudmlzaXRTdHlsZXNoZWV0KHN0eWxlc2hlZXQpKTtcclxuICAgICAgICB0aGlzLl9hbmFseXplZEZpbGVzLmFkZChzdHlsZXNoZWV0LmZpbGVQYXRoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSW4gc29tZSBhcHBsaWNhdGlvbnMsIGRldmVsb3BlcnMgd2lsbCBoYXZlIGdsb2JhbCBzdHlsZXNoZWV0cyB3aGljaCBhcmUgbm90XHJcbiAgICAvLyBzcGVjaWZpZWQgaW4gYW55IEFuZ3VsYXIgY29tcG9uZW50LiBUaGVyZWZvcmUgd2UgYWxsb3cgZm9yIGFkZGl0aW9uYWwgc3R5bGVzaGVldHNcclxuICAgIC8vIGJlaW5nIHNwZWNpZmllZC4gV2UgdmlzaXQgdGhlbSBpbiBlYWNoIG1pZ3JhdGlvbiB1bmxlc3MgdGhleSBoYXZlIGJlZW4gYWxyZWFkeVxyXG4gICAgLy8gZGlzY292ZXJlZCBiZWZvcmUgYXMgYWN0dWFsIGNvbXBvbmVudCByZXNvdXJjZS5cclxuICAgIGlmIChhZGRpdGlvbmFsU3R5bGVzaGVldFBhdGhzKSB7XHJcbiAgICAgIGFkZGl0aW9uYWxTdHlsZXNoZWV0UGF0aHMuZm9yRWFjaChmaWxlUGF0aCA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fZmlsZVN5c3RlbS5yZXNvbHZlKGZpbGVQYXRoKTtcclxuICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID0gcmVzb3VyY2VDb2xsZWN0b3IucmVzb2x2ZUV4dGVybmFsU3R5bGVzaGVldChyZXNvbHZlZFBhdGgsIG51bGwpO1xyXG4gICAgICAgIC8vIERvIG5vdCB2aXNpdCBzdHlsZXNoZWV0cyB3aGljaCBoYXZlIGJlZW4gcmVmZXJlbmNlZCBmcm9tIGEgY29tcG9uZW50LlxyXG4gICAgICAgIGlmICghdGhpcy5fYW5hbHl6ZWRGaWxlcy5oYXMocmVzb2x2ZWRQYXRoKSAmJiBzdHlsZXNoZWV0KSB7XHJcbiAgICAgICAgICBtaWdyYXRpb25zLmZvckVhY2gociA9PiByLnZpc2l0U3R5bGVzaGVldChzdHlsZXNoZWV0KSk7XHJcbiAgICAgICAgICB0aGlzLl9hbmFseXplZEZpbGVzLmFkZChyZXNvbHZlZFBhdGgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsbCB0aGUgXCJwb3N0QW5hbHlzaXNcIiBtZXRob2QgZm9yIGVhY2ggbWlncmF0aW9uLlxyXG4gICAgbWlncmF0aW9ucy5mb3JFYWNoKHIgPT4gci5wb3N0QW5hbHlzaXMoKSk7XHJcblxyXG4gICAgLy8gQ29sbGVjdCBhbGwgZmFpbHVyZXMgcmVwb3J0ZWQgYnkgaW5kaXZpZHVhbCBtaWdyYXRpb25zLlxyXG4gICAgY29uc3QgZmFpbHVyZXMgPSBtaWdyYXRpb25zLnJlZHVjZSgocmVzLCBtKSA9PlxyXG4gICAgICAgIHJlcy5jb25jYXQobS5mYWlsdXJlcyksIFtdIGFzIE1pZ3JhdGlvbkZhaWx1cmVbXSk7XHJcblxyXG4gICAgLy8gSW4gY2FzZSB0aGVyZSBhcmUgZmFpbHVyZXMsIHByaW50IHRoZXNlIHRvIHRoZSBDTEkgbG9nZ2VyIGFzIHdhcm5pbmdzLlxyXG4gICAgaWYgKGZhaWx1cmVzLmxlbmd0aCkge1xyXG4gICAgICBmYWlsdXJlcy5mb3JFYWNoKCh7ZmlsZVBhdGgsIG1lc3NhZ2UsIHBvc2l0aW9ufSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGxpbmVBbmRDaGFyYWN0ZXIgPSBwb3NpdGlvbiA/IGBAJHtwb3NpdGlvbi5saW5lICsgMX06JHtwb3NpdGlvbi5jaGFyYWN0ZXIgKyAxfWAgOiAnJztcclxuICAgICAgICB0aGlzLl9sb2dnZXIud2FybihgJHtmaWxlUGF0aH0ke2xpbmVBbmRDaGFyYWN0ZXJ9IC0gJHttZXNzYWdlfWApO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBoYXNGYWlsdXJlczogISFmYWlsdXJlcy5sZW5ndGgsXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBpbnN0YW5jZXMgb2YgdGhlIGdpdmVuIG1pZ3JhdGlvbnMgd2l0aCB0aGUgc3BlY2lmaWVkIHRhcmdldFxyXG4gICAqIHZlcnNpb24gYW5kIGRhdGEuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY3JlYXRlTWlncmF0aW9uczxEYXRhPih0eXBlczogTWlncmF0aW9uQ3RvcjxEYXRhLCBDb250ZXh0PltdLCB0YXJnZXQ6IFRhcmdldFZlcnNpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBEYXRhKTogTWlncmF0aW9uPERhdGEsIENvbnRleHQ+W10ge1xyXG4gICAgY29uc3QgcmVzdWx0OiBNaWdyYXRpb248RGF0YSwgQ29udGV4dD5bXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjdG9yIG9mIHR5cGVzKSB7XHJcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGN0b3IodGhpcy5fcHJvZ3JhbSwgdGhpcy5fdHlwZUNoZWNrZXIsIHRhcmdldCwgdGhpcy5fY29udGV4dCxcclxuICAgICAgICBkYXRhLCB0aGlzLl9maWxlU3lzdGVtLCB0aGlzLl9sb2dnZXIpO1xyXG4gICAgICBpbnN0YW5jZS5pbml0KCk7XHJcbiAgICAgIGlmIChpbnN0YW5jZS5lbmFibGVkKSB7XHJcbiAgICAgICAgcmVzdWx0LnB1c2goaW5zdGFuY2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHByb2dyYW0gZm9ybSB0aGUgc3BlY2lmaWVkIHRzY29uZmlnIGFuZCBwYXRjaGVzIHRoZSBob3N0XHJcbiAgICogdG8gcmVhZCBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgdGhyb3VnaCB0aGUgZ2l2ZW4gZmlsZSBzeXN0ZW0uXHJcbiAgICovXHJcbiAgc3RhdGljIGNyZWF0ZVByb2dyYW1Gcm9tVHNjb25maWcodHNjb25maWdQYXRoOiBXb3Jrc3BhY2VQYXRoLCBmczogRmlsZVN5c3RlbSk6IHRzLlByb2dyYW0ge1xyXG4gICAgY29uc3QgcGFyc2VkID0gcGFyc2VUc2NvbmZpZ0ZpbGUoZnMucmVzb2x2ZSh0c2NvbmZpZ1BhdGgpLCBmcyk7XHJcbiAgICBjb25zdCBob3N0ID0gY3JlYXRlRmlsZVN5c3RlbUNvbXBpbGVySG9zdChwYXJzZWQub3B0aW9ucywgZnMpO1xyXG4gICAgcmV0dXJuIHRzLmNyZWF0ZVByb2dyYW0ocGFyc2VkLmZpbGVOYW1lcywgcGFyc2VkLm9wdGlvbnMsIGhvc3QpO1xyXG4gIH1cclxufVxyXG4iXX0=