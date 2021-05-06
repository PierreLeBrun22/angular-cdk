"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssSelectorsMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const literal_1 = require("../typescript/literal");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that walks through every string literal, template and stylesheet in
 * order to migrate outdated CSS selectors to the new selector.
 */
class CssSelectorsMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = upgrade_data_1.getVersionUpgradeData(this, 'cssSelectors');
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isStringLiteralLike(node)) {
            this._visitStringLiteralLike(node);
        }
    }
    visitTemplate(template) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.html) {
                return;
            }
            literal_1.findAllSubstringIndices(template.content, data.replace)
                .map(offset => template.start + offset)
                .forEach(start => this._replaceSelector(template.filePath, start, data));
        });
    }
    visitStylesheet(stylesheet) {
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.stylesheet) {
                return;
            }
            literal_1.findAllSubstringIndices(stylesheet.content, data.replace)
                .map(offset => stylesheet.start + offset)
                .forEach(start => this._replaceSelector(stylesheet.filePath, start, data));
        });
    }
    _visitStringLiteralLike(node) {
        if (node.parent && node.parent.kind !== ts.SyntaxKind.CallExpression) {
            return;
        }
        const textContent = node.getText();
        const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
        this.data.forEach(data => {
            if (data.replaceIn && !data.replaceIn.tsStringLiterals) {
                return;
            }
            literal_1.findAllSubstringIndices(textContent, data.replace)
                .map(offset => node.getStart() + offset)
                .forEach(start => this._replaceSelector(filePath, start, data));
        });
    }
    _replaceSelector(filePath, start, data) {
        this.fileSystem.edit(filePath)
            .remove(start, data.replace.length)
            .insertRight(start, data.replaceWith);
    }
}
exports.CssSelectorsMigration = CssSelectorsMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLXNlbGVjdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvbWlncmF0aW9ucy9jc3Mtc2VsZWN0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlDQUFpQztBQUdqQywyREFBc0Q7QUFFdEQsbURBQThEO0FBQzlELGtEQUFtRTtBQUVuRTs7O0dBR0c7QUFDSCxNQUFhLHFCQUFzQixTQUFRLHFCQUFzQjtJQUFqRTs7UUFDRSxpRUFBaUU7UUFDakUsU0FBSSxHQUE2QixvQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFN0UsMkRBQTJEO1FBQzNELFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUF3RG5DLENBQUM7SUF0REMsU0FBUyxDQUFDLElBQWE7UUFDckIsSUFBSSxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO0lBQ0gsQ0FBQztJQUVELGFBQWEsQ0FBQyxRQUEwQjtRQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRTtnQkFDMUMsT0FBTzthQUNSO1lBRUQsaUNBQXVCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUNsRCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztpQkFDdEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0UsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsZUFBZSxDQUFDLFVBQTRCO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO2dCQUNoRCxPQUFPO2FBQ1I7WUFFRCxpQ0FBdUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUM7aUJBQ3BELEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO2lCQUN4QyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyx1QkFBdUIsQ0FBQyxJQUEwQjtRQUN4RCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7WUFDcEUsT0FBTztTQUNSO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV4RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFO2dCQUN0RCxPQUFPO2FBQ1I7WUFFRCxpQ0FBdUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztpQkFDN0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztpQkFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxnQkFBZ0IsQ0FBQyxRQUF1QixFQUFFLEtBQWEsRUFBRSxJQUE0QjtRQUMzRixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDM0IsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUNsQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0Y7QUE3REQsc0RBNkRDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcclxuaW1wb3J0IHtXb3Jrc3BhY2VQYXRofSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9maWxlLXN5c3RlbSc7XHJcbmltcG9ydCB7UmVzb2x2ZWRSZXNvdXJjZX0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvY29tcG9uZW50LXJlc291cmNlLWNvbGxlY3Rvcic7XHJcbmltcG9ydCB7TWlncmF0aW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9taWdyYXRpb24nO1xyXG5pbXBvcnQge0Nzc1NlbGVjdG9yVXBncmFkZURhdGF9IGZyb20gJy4uL2RhdGEvY3NzLXNlbGVjdG9ycyc7XHJcbmltcG9ydCB7ZmluZEFsbFN1YnN0cmluZ0luZGljZXN9IGZyb20gJy4uL3R5cGVzY3JpcHQvbGl0ZXJhbCc7XHJcbmltcG9ydCB7Z2V0VmVyc2lvblVwZ3JhZGVEYXRhLCBVcGdyYWRlRGF0YX0gZnJvbSAnLi4vdXBncmFkZS1kYXRhJztcclxuXHJcbi8qKlxyXG4gKiBNaWdyYXRpb24gdGhhdCB3YWxrcyB0aHJvdWdoIGV2ZXJ5IHN0cmluZyBsaXRlcmFsLCB0ZW1wbGF0ZSBhbmQgc3R5bGVzaGVldCBpblxyXG4gKiBvcmRlciB0byBtaWdyYXRlIG91dGRhdGVkIENTUyBzZWxlY3RvcnMgdG8gdGhlIG5ldyBzZWxlY3Rvci5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDc3NTZWxlY3RvcnNNaWdyYXRpb24gZXh0ZW5kcyBNaWdyYXRpb248VXBncmFkZURhdGE+IHtcclxuICAvKiogQ2hhbmdlIGRhdGEgdGhhdCB1cGdyYWRlcyB0byB0aGUgc3BlY2lmaWVkIHRhcmdldCB2ZXJzaW9uLiAqL1xyXG4gIGRhdGE6IENzc1NlbGVjdG9yVXBncmFkZURhdGFbXSA9IGdldFZlcnNpb25VcGdyYWRlRGF0YSh0aGlzLCAnY3NzU2VsZWN0b3JzJyk7XHJcblxyXG4gIC8vIE9ubHkgZW5hYmxlIHRoZSBtaWdyYXRpb24gcnVsZSBpZiB0aGVyZSBpcyB1cGdyYWRlIGRhdGEuXHJcbiAgZW5hYmxlZCA9IHRoaXMuZGF0YS5sZW5ndGggIT09IDA7XHJcblxyXG4gIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlKTogdm9pZCB7XHJcbiAgICBpZiAodHMuaXNTdHJpbmdMaXRlcmFsTGlrZShub2RlKSkge1xyXG4gICAgICB0aGlzLl92aXNpdFN0cmluZ0xpdGVyYWxMaWtlKG5vZGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmlzaXRUZW1wbGF0ZSh0ZW1wbGF0ZTogUmVzb2x2ZWRSZXNvdXJjZSk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhLmZvckVhY2goZGF0YSA9PiB7XHJcbiAgICAgIGlmIChkYXRhLnJlcGxhY2VJbiAmJiAhZGF0YS5yZXBsYWNlSW4uaHRtbCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZmluZEFsbFN1YnN0cmluZ0luZGljZXModGVtcGxhdGUuY29udGVudCwgZGF0YS5yZXBsYWNlKVxyXG4gICAgICAgICAgLm1hcChvZmZzZXQgPT4gdGVtcGxhdGUuc3RhcnQgKyBvZmZzZXQpXHJcbiAgICAgICAgICAuZm9yRWFjaChzdGFydCA9PiB0aGlzLl9yZXBsYWNlU2VsZWN0b3IodGVtcGxhdGUuZmlsZVBhdGgsIHN0YXJ0LCBkYXRhKSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHZpc2l0U3R5bGVzaGVldChzdHlsZXNoZWV0OiBSZXNvbHZlZFJlc291cmNlKTogdm9pZCB7XHJcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChkYXRhID0+IHtcclxuICAgICAgaWYgKGRhdGEucmVwbGFjZUluICYmICFkYXRhLnJlcGxhY2VJbi5zdHlsZXNoZWV0KSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmaW5kQWxsU3Vic3RyaW5nSW5kaWNlcyhzdHlsZXNoZWV0LmNvbnRlbnQsIGRhdGEucmVwbGFjZSlcclxuICAgICAgICAgIC5tYXAob2Zmc2V0ID0+IHN0eWxlc2hlZXQuc3RhcnQgKyBvZmZzZXQpXHJcbiAgICAgICAgICAuZm9yRWFjaChzdGFydCA9PiB0aGlzLl9yZXBsYWNlU2VsZWN0b3Ioc3R5bGVzaGVldC5maWxlUGF0aCwgc3RhcnQsIGRhdGEpKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfdmlzaXRTdHJpbmdMaXRlcmFsTGlrZShub2RlOiB0cy5TdHJpbmdMaXRlcmFsTGlrZSkge1xyXG4gICAgaWYgKG5vZGUucGFyZW50ICYmIG5vZGUucGFyZW50LmtpbmQgIT09IHRzLlN5bnRheEtpbmQuQ2FsbEV4cHJlc3Npb24pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRleHRDb250ZW50ID0gbm9kZS5nZXRUZXh0KCk7XHJcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRoaXMuZmlsZVN5c3RlbS5yZXNvbHZlKG5vZGUuZ2V0U291cmNlRmlsZSgpLmZpbGVOYW1lKTtcclxuXHJcbiAgICB0aGlzLmRhdGEuZm9yRWFjaChkYXRhID0+IHtcclxuICAgICAgaWYgKGRhdGEucmVwbGFjZUluICYmICFkYXRhLnJlcGxhY2VJbi50c1N0cmluZ0xpdGVyYWxzKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmaW5kQWxsU3Vic3RyaW5nSW5kaWNlcyh0ZXh0Q29udGVudCwgZGF0YS5yZXBsYWNlKVxyXG4gICAgICAgICAgLm1hcChvZmZzZXQgPT4gbm9kZS5nZXRTdGFydCgpICsgb2Zmc2V0KVxyXG4gICAgICAgICAgLmZvckVhY2goc3RhcnQgPT4gdGhpcy5fcmVwbGFjZVNlbGVjdG9yKGZpbGVQYXRoLCBzdGFydCwgZGF0YSkpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9yZXBsYWNlU2VsZWN0b3IoZmlsZVBhdGg6IFdvcmtzcGFjZVBhdGgsIHN0YXJ0OiBudW1iZXIsIGRhdGE6IENzc1NlbGVjdG9yVXBncmFkZURhdGEpIHtcclxuICAgIHRoaXMuZmlsZVN5c3RlbS5lZGl0KGZpbGVQYXRoKVxyXG4gICAgICAucmVtb3ZlKHN0YXJ0LCBkYXRhLnJlcGxhY2UubGVuZ3RoKVxyXG4gICAgICAuaW5zZXJ0UmlnaHQoc3RhcnQsIGRhdGEucmVwbGFjZVdpdGgpO1xyXG4gIH1cclxufVxyXG4iXX0=