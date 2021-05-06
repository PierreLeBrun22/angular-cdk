"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodCallArgumentsMigration = void 0;
const ts = require("typescript");
const migration_1 = require("../../update-tool/migration");
const upgrade_data_1 = require("../upgrade-data");
/**
 * Migration that visits every TypeScript method call expression and checks if the
 * argument count is invalid and needs to be *manually* updated.
 */
class MethodCallArgumentsMigration extends migration_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = upgrade_data_1.getVersionUpgradeData(this, 'methodCallChecks');
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
            this._checkPropertyAccessMethodCall(node);
        }
    }
    _checkPropertyAccessMethodCall(node) {
        const propertyAccess = node.expression;
        if (!ts.isIdentifier(propertyAccess.name)) {
            return;
        }
        const hostType = this.typeChecker.getTypeAtLocation(propertyAccess.expression);
        const hostTypeName = hostType.symbol && hostType.symbol.name;
        const methodName = propertyAccess.name.text;
        if (!hostTypeName) {
            return;
        }
        // TODO(devversion): Revisit the implementation of this upgrade rule. It seems difficult
        // and ambiguous to maintain the data for this rule. e.g. consider a method which has the
        // same amount of arguments but just had a type change. In that case we could still add
        // new entries to the upgrade data that match the current argument length to just show
        // a failure message, but adding that data becomes painful if the method has optional
        // parameters and it would mean that the error message would always show up, even if the
        // argument is in some cases still assignable to the new parameter type. We could re-use
        // the logic we have in the constructor-signature checks to check for assignability and
        // to make the upgrade data less verbose.
        const failure = this.data.filter(data => data.method === methodName && data.className === hostTypeName)
            .map(data => data.invalidArgCounts.find(f => f.count === node.arguments.length))[0];
        if (!failure) {
            return;
        }
        this.createFailureAtNode(node, `Found call to "${hostTypeName + '.' + methodName}" ` +
            `with ${failure.count} arguments. Message: ${failure.message}`);
    }
}
exports.MethodCallArgumentsMigration = MethodCallArgumentsMigration;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLWNhbGwtYXJndW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9taWdyYXRpb25zL21ldGhvZC1jYWxsLWFyZ3VtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUFDakMsMkRBQXNEO0FBR3RELGtEQUFtRTtBQUVuRTs7O0dBR0c7QUFDSCxNQUFhLDRCQUE2QixTQUFRLHFCQUFzQjtJQUF4RTs7UUFDRSxpRUFBaUU7UUFDakUsU0FBSSxHQUE0QixvQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUVoRiwyREFBMkQ7UUFDM0QsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztJQTZDbkMsQ0FBQztJQTNDQyxTQUFTLENBQUMsSUFBYTtRQUNyQixJQUFJLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQy9FLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMzQztJQUNILENBQUM7SUFFTyw4QkFBOEIsQ0FBQyxJQUF1QjtRQUM1RCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsVUFBeUMsQ0FBQztRQUV0RSxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDekMsT0FBTztTQUNSO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0UsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUM3RCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUU1QyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE9BQU87U0FDUjtRQUVELHdGQUF3RjtRQUN4Rix5RkFBeUY7UUFDekYsdUZBQXVGO1FBQ3ZGLHNGQUFzRjtRQUN0RixxRkFBcUY7UUFDckYsd0ZBQXdGO1FBQ3hGLHdGQUF3RjtRQUN4Rix1RkFBdUY7UUFDdkYseUNBQXlDO1FBQ3pDLE1BQU0sT0FBTyxHQUNULElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxZQUFZLENBQUM7YUFDbEYsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVGLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLElBQUksRUFDSixrQkFBa0IsWUFBWSxHQUFHLEdBQUcsR0FBRyxVQUFVLElBQUk7WUFDakQsUUFBUSxPQUFPLENBQUMsS0FBSyx3QkFBd0IsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDMUUsQ0FBQztDQUNGO0FBbERELG9FQWtEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XHJcbmltcG9ydCB7TWlncmF0aW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC9taWdyYXRpb24nO1xyXG5cclxuaW1wb3J0IHtNZXRob2RDYWxsVXBncmFkZURhdGF9IGZyb20gJy4uL2RhdGEnO1xyXG5pbXBvcnQge2dldFZlcnNpb25VcGdyYWRlRGF0YSwgVXBncmFkZURhdGF9IGZyb20gJy4uL3VwZ3JhZGUtZGF0YSc7XHJcblxyXG4vKipcclxuICogTWlncmF0aW9uIHRoYXQgdmlzaXRzIGV2ZXJ5IFR5cGVTY3JpcHQgbWV0aG9kIGNhbGwgZXhwcmVzc2lvbiBhbmQgY2hlY2tzIGlmIHRoZVxyXG4gKiBhcmd1bWVudCBjb3VudCBpcyBpbnZhbGlkIGFuZCBuZWVkcyB0byBiZSAqbWFudWFsbHkqIHVwZGF0ZWQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTWV0aG9kQ2FsbEFyZ3VtZW50c01pZ3JhdGlvbiBleHRlbmRzIE1pZ3JhdGlvbjxVcGdyYWRlRGF0YT4ge1xyXG4gIC8qKiBDaGFuZ2UgZGF0YSB0aGF0IHVwZ3JhZGVzIHRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IHZlcnNpb24uICovXHJcbiAgZGF0YTogTWV0aG9kQ2FsbFVwZ3JhZGVEYXRhW10gPSBnZXRWZXJzaW9uVXBncmFkZURhdGEodGhpcywgJ21ldGhvZENhbGxDaGVja3MnKTtcclxuXHJcbiAgLy8gT25seSBlbmFibGUgdGhlIG1pZ3JhdGlvbiBydWxlIGlmIHRoZXJlIGlzIHVwZ3JhZGUgZGF0YS5cclxuICBlbmFibGVkID0gdGhpcy5kYXRhLmxlbmd0aCAhPT0gMDtcclxuXHJcbiAgdmlzaXROb2RlKG5vZGU6IHRzLk5vZGUpOiB2b2lkIHtcclxuICAgIGlmICh0cy5pc0NhbGxFeHByZXNzaW9uKG5vZGUpICYmIHRzLmlzUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uKG5vZGUuZXhwcmVzc2lvbikpIHtcclxuICAgICAgdGhpcy5fY2hlY2tQcm9wZXJ0eUFjY2Vzc01ldGhvZENhbGwobm9kZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9jaGVja1Byb3BlcnR5QWNjZXNzTWV0aG9kQ2FsbChub2RlOiB0cy5DYWxsRXhwcmVzc2lvbikge1xyXG4gICAgY29uc3QgcHJvcGVydHlBY2Nlc3MgPSBub2RlLmV4cHJlc3Npb24gYXMgdHMuUHJvcGVydHlBY2Nlc3NFeHByZXNzaW9uO1xyXG5cclxuICAgIGlmICghdHMuaXNJZGVudGlmaWVyKHByb3BlcnR5QWNjZXNzLm5hbWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBob3N0VHlwZSA9IHRoaXMudHlwZUNoZWNrZXIuZ2V0VHlwZUF0TG9jYXRpb24ocHJvcGVydHlBY2Nlc3MuZXhwcmVzc2lvbik7XHJcbiAgICBjb25zdCBob3N0VHlwZU5hbWUgPSBob3N0VHlwZS5zeW1ib2wgJiYgaG9zdFR5cGUuc3ltYm9sLm5hbWU7XHJcbiAgICBjb25zdCBtZXRob2ROYW1lID0gcHJvcGVydHlBY2Nlc3MubmFtZS50ZXh0O1xyXG5cclxuICAgIGlmICghaG9zdFR5cGVOYW1lKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZXZpc2l0IHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGlzIHVwZ3JhZGUgcnVsZS4gSXQgc2VlbXMgZGlmZmljdWx0XHJcbiAgICAvLyBhbmQgYW1iaWd1b3VzIHRvIG1haW50YWluIHRoZSBkYXRhIGZvciB0aGlzIHJ1bGUuIGUuZy4gY29uc2lkZXIgYSBtZXRob2Qgd2hpY2ggaGFzIHRoZVxyXG4gICAgLy8gc2FtZSBhbW91bnQgb2YgYXJndW1lbnRzIGJ1dCBqdXN0IGhhZCBhIHR5cGUgY2hhbmdlLiBJbiB0aGF0IGNhc2Ugd2UgY291bGQgc3RpbGwgYWRkXHJcbiAgICAvLyBuZXcgZW50cmllcyB0byB0aGUgdXBncmFkZSBkYXRhIHRoYXQgbWF0Y2ggdGhlIGN1cnJlbnQgYXJndW1lbnQgbGVuZ3RoIHRvIGp1c3Qgc2hvd1xyXG4gICAgLy8gYSBmYWlsdXJlIG1lc3NhZ2UsIGJ1dCBhZGRpbmcgdGhhdCBkYXRhIGJlY29tZXMgcGFpbmZ1bCBpZiB0aGUgbWV0aG9kIGhhcyBvcHRpb25hbFxyXG4gICAgLy8gcGFyYW1ldGVycyBhbmQgaXQgd291bGQgbWVhbiB0aGF0IHRoZSBlcnJvciBtZXNzYWdlIHdvdWxkIGFsd2F5cyBzaG93IHVwLCBldmVuIGlmIHRoZVxyXG4gICAgLy8gYXJndW1lbnQgaXMgaW4gc29tZSBjYXNlcyBzdGlsbCBhc3NpZ25hYmxlIHRvIHRoZSBuZXcgcGFyYW1ldGVyIHR5cGUuIFdlIGNvdWxkIHJlLXVzZVxyXG4gICAgLy8gdGhlIGxvZ2ljIHdlIGhhdmUgaW4gdGhlIGNvbnN0cnVjdG9yLXNpZ25hdHVyZSBjaGVja3MgdG8gY2hlY2sgZm9yIGFzc2lnbmFiaWxpdHkgYW5kXHJcbiAgICAvLyB0byBtYWtlIHRoZSB1cGdyYWRlIGRhdGEgbGVzcyB2ZXJib3NlLlxyXG4gICAgY29uc3QgZmFpbHVyZSA9XHJcbiAgICAgICAgdGhpcy5kYXRhLmZpbHRlcihkYXRhID0+IGRhdGEubWV0aG9kID09PSBtZXRob2ROYW1lICYmIGRhdGEuY2xhc3NOYW1lID09PSBob3N0VHlwZU5hbWUpXHJcbiAgICAgICAgICAgIC5tYXAoZGF0YSA9PiBkYXRhLmludmFsaWRBcmdDb3VudHMuZmluZChmID0+IGYuY291bnQgPT09IG5vZGUuYXJndW1lbnRzLmxlbmd0aCkpWzBdO1xyXG5cclxuICAgIGlmICghZmFpbHVyZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jcmVhdGVGYWlsdXJlQXROb2RlKFxyXG4gICAgICAgIG5vZGUsXHJcbiAgICAgICAgYEZvdW5kIGNhbGwgdG8gXCIke2hvc3RUeXBlTmFtZSArICcuJyArIG1ldGhvZE5hbWV9XCIgYCArXHJcbiAgICAgICAgICAgIGB3aXRoICR7ZmFpbHVyZS5jb3VudH0gYXJndW1lbnRzLiBNZXNzYWdlOiAke2ZhaWx1cmUubWVzc2FnZX1gKTtcclxuICB9XHJcbn1cclxuIl19