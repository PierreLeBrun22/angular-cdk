"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassInheritanceMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const base_types_1 = require("../typescript/base-types");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that identifies class declarations that extend CDK or Material classes
 * which had a public property change.
 */
class ClassInheritanceMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /**
         * Map of classes that have been updated. Each class name maps to the according property
         * change data.
         */
        this.propertyNames = new Map();
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.propertyNames.size !== 0;
    }
    init() {
        upgrade_data_1.getVersionUpgradeData(this, 'propertyNames')
            .filter(data => data.limitedTo && data.limitedTo.classes)
            .forEach(data => data.limitedTo.classes.forEach(name => this.propertyNames.set(name, data)));
    }
    visitNode(node) {
        if (ts.isClassDeclaration(node)) {
            this._visitClassDeclaration(node);
        }
    }
    _visitClassDeclaration(node) {
        const baseTypes = base_types_1.determineBaseTypes(node);
        const className = node.name ? node.name.text : '{unknown-name}';
        if (!baseTypes) {
            return;
        }
        baseTypes.forEach(typeName => {
            const data = this.propertyNames.get(typeName);
            if (data) {
                this.createFailureAtNode(node, `Found class "${className}" which extends class ` +
                    `"${typeName}". Please note that the base class property ` +
                    `"${data.replace}" has changed to "${data.replaceWith}". ` +
                    `You may need to update your class as well.`);
            }
        });
    }
}
exports.ClassInheritanceMigration = ClassInheritanceMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MtaW5oZXJpdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL21pZ3JhdGlvbnMvY2xhc3MtaW5oZXJpdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBQ2pDLDJEQUFzRDtBQUV0RCx5REFBNEQ7QUFDNUQsa0RBQW1FO0FBRW5FOzs7R0FHRztBQUNILE1BQWEseUJBQTBCLFNBQVEscUJBQXNCO0lBQXJFOztRQUNFOzs7V0FHRztRQUNILGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQW1DLENBQUM7UUFFM0QsMkRBQTJEO1FBQzNELFlBQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUM7SUFvQzFDLENBQUM7SUFsQ0MsSUFBSTtRQUNGLG9DQUFxQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUM7YUFDdkMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQzthQUN4RCxPQUFPLENBQ0osSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBYTtRQUNyQixJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkM7SUFDSCxDQUFDO0lBRU8sc0JBQXNCLENBQUMsSUFBeUI7UUFDdEQsTUFBTSxTQUFTLEdBQUcsK0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBRWhFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDZCxPQUFPO1NBQ1I7UUFFRCxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRTlDLElBQUksSUFBSSxFQUFFO2dCQUNSLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsSUFBSSxFQUNKLGdCQUFnQixTQUFTLHdCQUF3QjtvQkFDN0MsSUFBSSxRQUFRLDhDQUE4QztvQkFDMUQsSUFBSSxJQUFJLENBQUMsT0FBTyxxQkFBcUIsSUFBSSxDQUFDLFdBQVcsS0FBSztvQkFDMUQsNENBQTRDLENBQUMsQ0FBQzthQUN2RDtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBNUNELDhEQTRDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7TWlncmF0aW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9taWdyYXRpb24nO1xyXG5pbXBvcnQge1Byb3BlcnR5TmFtZVVwZ3JhZGVEYXRhfSBmcm9tICcuLi9kYXRhL3Byb3BlcnR5LW5hbWVzJztcclxuaW1wb3J0IHtkZXRlcm1pbmVCYXNlVHlwZXN9IGZyb20gJy4uL3R5cGVzY3JpcHQvYmFzZS10eXBlcyc7XHJcbmltcG9ydCB7Z2V0VmVyc2lvblVwZ3JhZGVEYXRhLCBVcGdyYWRlRGF0YX0gZnJvbSAnLi4vdXBncmFkZS1kYXRhJztcclxuXHJcbi8qKlxyXG4gKiBNaWdyYXRpb24gdGhhdCBpZGVudGlmaWVzIGNsYXNzIGRlY2xhcmF0aW9ucyB0aGF0IGV4dGVuZCBDREsgb3IgTWF0ZXJpYWwgY2xhc3Nlc1xyXG4gKiB3aGljaCBoYWQgYSBwdWJsaWMgcHJvcGVydHkgY2hhbmdlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENsYXNzSW5oZXJpdGFuY2VNaWdyYXRpb24gZXh0ZW5kcyBNaWdyYXRpb248VXBncmFkZURhdGE+IHtcclxuICAvKipcclxuICAgKiBNYXAgb2YgY2xhc3NlcyB0aGF0IGhhdmUgYmVlbiB1cGRhdGVkLiBFYWNoIGNsYXNzIG5hbWUgbWFwcyB0byB0aGUgYWNjb3JkaW5nIHByb3BlcnR5XHJcbiAgICogY2hhbmdlIGRhdGEuXHJcbiAgICovXHJcbiAgcHJvcGVydHlOYW1lcyA9IG5ldyBNYXA8c3RyaW5nLCBQcm9wZXJ0eU5hbWVVcGdyYWRlRGF0YT4oKTtcclxuXHJcbiAgLy8gT25seSBlbmFibGUgdGhlIG1pZ3JhdGlvbiBydWxlIGlmIHRoZXJlIGlzIHVwZ3JhZGUgZGF0YS5cclxuICBlbmFibGVkID0gdGhpcy5wcm9wZXJ0eU5hbWVzLnNpemUgIT09IDA7XHJcblxyXG4gIGluaXQoKTogdm9pZCB7XHJcbiAgICBnZXRWZXJzaW9uVXBncmFkZURhdGEodGhpcywgJ3Byb3BlcnR5TmFtZXMnKVxyXG4gICAgICAgIC5maWx0ZXIoZGF0YSA9PiBkYXRhLmxpbWl0ZWRUbyAmJiBkYXRhLmxpbWl0ZWRUby5jbGFzc2VzKVxyXG4gICAgICAgIC5mb3JFYWNoKFxyXG4gICAgICAgICAgICBkYXRhID0+IGRhdGEubGltaXRlZFRvLmNsYXNzZXMuZm9yRWFjaChuYW1lID0+IHRoaXMucHJvcGVydHlOYW1lcy5zZXQobmFtZSwgZGF0YSkpKTtcclxuICB9XHJcblxyXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XHJcbiAgICBpZiAodHMuaXNDbGFzc0RlY2xhcmF0aW9uKG5vZGUpKSB7XHJcbiAgICAgIHRoaXMuX3Zpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uKSB7XHJcbiAgICBjb25zdCBiYXNlVHlwZXMgPSBkZXRlcm1pbmVCYXNlVHlwZXMobm9kZSk7XHJcbiAgICBjb25zdCBjbGFzc05hbWUgPSBub2RlLm5hbWUgPyBub2RlLm5hbWUudGV4dCA6ICd7dW5rbm93bi1uYW1lfSc7XHJcblxyXG4gICAgaWYgKCFiYXNlVHlwZXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGJhc2VUeXBlcy5mb3JFYWNoKHR5cGVOYW1lID0+IHtcclxuICAgICAgY29uc3QgZGF0YSA9IHRoaXMucHJvcGVydHlOYW1lcy5nZXQodHlwZU5hbWUpO1xyXG5cclxuICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICB0aGlzLmNyZWF0ZUZhaWx1cmVBdE5vZGUoXHJcbiAgICAgICAgICAgIG5vZGUsXHJcbiAgICAgICAgICAgIGBGb3VuZCBjbGFzcyBcIiR7Y2xhc3NOYW1lfVwiIHdoaWNoIGV4dGVuZHMgY2xhc3MgYCArXHJcbiAgICAgICAgICAgICAgICBgXCIke3R5cGVOYW1lfVwiLiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBiYXNlIGNsYXNzIHByb3BlcnR5IGAgK1xyXG4gICAgICAgICAgICAgICAgYFwiJHtkYXRhLnJlcGxhY2V9XCIgaGFzIGNoYW5nZWQgdG8gXCIke2RhdGEucmVwbGFjZVdpdGh9XCIuIGAgK1xyXG4gICAgICAgICAgICAgICAgYFlvdSBtYXkgbmVlZCB0byB1cGRhdGUgeW91ciBjbGFzcyBhcyB3ZWxsLmApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl19