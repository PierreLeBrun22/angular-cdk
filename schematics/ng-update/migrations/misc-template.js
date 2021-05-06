"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiscTemplateMigration = void 0;
const target_version_1 = require("../../update-tool/target-version");
const migration_1 = require("../../update-tool/migration");
const literal_1 = require("../typescript/literal");
/**
 * Migration that walks through every template and reports if there are
 * instances of outdated Angular CDK API that can't be migrated automatically.
 */
class MiscTemplateMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        // Only enable this rule if the migration targets version 6. The rule
        // currently only includes migrations for V6 deprecations.
        this.enabled = this.targetVersion === target_version_1.TargetVersion.V6;
    }
    visitTemplate(template) {
        // Migration for https://github.com/angular/components/pull/10325 (v6)
        literal_1.findAllSubstringIndices(template.content, 'cdk-focus-trap').forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(template.start + offset),
                message: `Found deprecated element selector "cdk-focus-trap" which has been ` +
                    `changed to an attribute selector "[cdkTrapFocus]".`
            });
        });
    }
}
exports.MiscTemplateMigration = MiscTemplateMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWlzYy10ZW1wbGF0ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9taXNjLXRlbXBsYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHFFQUErRDtBQUUvRCwyREFBc0Q7QUFDdEQsbURBQThEO0FBRzlEOzs7R0FHRztBQUNILE1BQWEscUJBQXNCLFNBQVEscUJBQXNCO0lBQWpFOztRQUVFLHFFQUFxRTtRQUNyRSwwREFBMEQ7UUFDMUQsWUFBTyxHQUFHLElBQUksQ0FBQyxhQUFhLEtBQUssOEJBQWEsQ0FBQyxFQUFFLENBQUM7SUFhcEQsQ0FBQztJQVhDLGFBQWEsQ0FBQyxRQUEwQjtRQUN0QyxzRUFBc0U7UUFDdEUsaUNBQXVCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMzRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztnQkFDakIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO2dCQUMzQixRQUFRLEVBQUUsUUFBUSxDQUFDLDZCQUE2QixDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO2dCQUN6RSxPQUFPLEVBQUUsb0VBQW9FO29CQUN6RSxvREFBb0Q7YUFDekQsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqQkQsc0RBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3RhcmdldC12ZXJzaW9uJztcclxuaW1wb3J0IHtSZXNvbHZlZFJlc291cmNlfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9jb21wb25lbnQtcmVzb3VyY2UtY29sbGVjdG9yJztcclxuaW1wb3J0IHtNaWdyYXRpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL21pZ3JhdGlvbic7XHJcbmltcG9ydCB7ZmluZEFsbFN1YnN0cmluZ0luZGljZXN9IGZyb20gJy4uL3R5cGVzY3JpcHQvbGl0ZXJhbCc7XHJcbmltcG9ydCB7VXBncmFkZURhdGF9IGZyb20gJy4uL3VwZ3JhZGUtZGF0YSc7XHJcblxyXG4vKipcclxuICogTWlncmF0aW9uIHRoYXQgd2Fsa3MgdGhyb3VnaCBldmVyeSB0ZW1wbGF0ZSBhbmQgcmVwb3J0cyBpZiB0aGVyZSBhcmVcclxuICogaW5zdGFuY2VzIG9mIG91dGRhdGVkIEFuZ3VsYXIgQ0RLIEFQSSB0aGF0IGNhbid0IGJlIG1pZ3JhdGVkIGF1dG9tYXRpY2FsbHkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWlzY1RlbXBsYXRlTWlncmF0aW9uIGV4dGVuZHMgTWlncmF0aW9uPFVwZ3JhZGVEYXRhPiB7XHJcblxyXG4gIC8vIE9ubHkgZW5hYmxlIHRoaXMgcnVsZSBpZiB0aGUgbWlncmF0aW9uIHRhcmdldHMgdmVyc2lvbiA2LiBUaGUgcnVsZVxyXG4gIC8vIGN1cnJlbnRseSBvbmx5IGluY2x1ZGVzIG1pZ3JhdGlvbnMgZm9yIFY2IGRlcHJlY2F0aW9ucy5cclxuICBlbmFibGVkID0gdGhpcy50YXJnZXRWZXJzaW9uID09PSBUYXJnZXRWZXJzaW9uLlY2O1xyXG5cclxuICB2aXNpdFRlbXBsYXRlKHRlbXBsYXRlOiBSZXNvbHZlZFJlc291cmNlKTogdm9pZCB7XHJcbiAgICAvLyBNaWdyYXRpb24gZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDMyNSAodjYpXHJcbiAgICBmaW5kQWxsU3Vic3RyaW5nSW5kaWNlcyh0ZW1wbGF0ZS5jb250ZW50LCAnY2RrLWZvY3VzLXRyYXAnKS5mb3JFYWNoKG9mZnNldCA9PiB7XHJcbiAgICAgIHRoaXMuZmFpbHVyZXMucHVzaCh7XHJcbiAgICAgICAgZmlsZVBhdGg6IHRlbXBsYXRlLmZpbGVQYXRoLFxyXG4gICAgICAgIHBvc2l0aW9uOiB0ZW1wbGF0ZS5nZXRDaGFyYWN0ZXJBbmRMaW5lT2ZQb3NpdGlvbih0ZW1wbGF0ZS5zdGFydCArIG9mZnNldCksXHJcbiAgICAgICAgbWVzc2FnZTogYEZvdW5kIGRlcHJlY2F0ZWQgZWxlbWVudCBzZWxlY3RvciBcImNkay1mb2N1cy10cmFwXCIgd2hpY2ggaGFzIGJlZW4gYCArXHJcbiAgICAgICAgICAgIGBjaGFuZ2VkIHRvIGFuIGF0dHJpYnV0ZSBzZWxlY3RvciBcIltjZGtUcmFwRm9jdXNdXCIuYFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXX0=