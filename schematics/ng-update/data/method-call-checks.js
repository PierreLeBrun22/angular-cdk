"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodCallChecks = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.methodCallChecks = {
    [target_version_1.TargetVersion.V11]: [{
            pr: 'https://github.com/angular/components/pull/20500',
            changes: [{
                    className: 'DropListRef',
                    method: 'drop',
                    invalidArgCounts: [{
                            count: 5,
                            message: 'The "previousIndex" parameter is required and the parameter order has changed.'
                        }]
                }]
        }],
    [target_version_1.TargetVersion.V9]: [{
            pr: 'https://github.com/angular/components/pull/17084',
            changes: [{
                    className: 'DropListRef',
                    method: 'drop',
                    invalidArgCounts: [{ count: 4, message: 'The "distance" parameter is required' }]
                }]
        }],
    [target_version_1.TargetVersion.V8]: [],
    [target_version_1.TargetVersion.V7]: [],
    [target_version_1.TargetVersion.V6]: [{
            pr: 'https://github.com/angular/components/pull/10325',
            changes: [{
                    className: 'FocusMonitor',
                    method: 'monitor',
                    invalidArgCounts: [{ count: 3, message: 'The "renderer" argument has been removed' }]
                }]
        }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLWNhbGwtY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL21ldGhvZC1jYWxsLWNoZWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFTbEQsUUFBQSxnQkFBZ0IsR0FBMEM7SUFDckUsQ0FBQyw4QkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDcEIsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQztvQkFDUixTQUFTLEVBQUUsYUFBYTtvQkFDeEIsTUFBTSxFQUFFLE1BQU07b0JBQ2QsZ0JBQWdCLEVBQUUsQ0FBQzs0QkFDakIsS0FBSyxFQUFFLENBQUM7NEJBQ1IsT0FBTyxFQUFFLGdGQUFnRjt5QkFDMUYsQ0FBQztpQkFDSCxDQUFDO1NBQ0gsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsU0FBUyxFQUFFLGFBQWE7b0JBQ3hCLE1BQU0sRUFBRSxNQUFNO29CQUNkLGdCQUFnQixFQUFFLENBQUMsRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxzQ0FBc0MsRUFBQyxDQUFDO2lCQUNoRixDQUFDO1NBQ0gsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsU0FBUyxFQUFFLGNBQWM7b0JBQ3pCLE1BQU0sRUFBRSxTQUFTO29CQUNqQixnQkFBZ0IsRUFBRSxDQUFDLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsMENBQTBDLEVBQUMsQ0FBQztpQkFDcEYsQ0FBQztTQUNILENBQUM7Q0FDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1RhcmdldFZlcnNpb259IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3RhcmdldC12ZXJzaW9uJztcclxuaW1wb3J0IHtWZXJzaW9uQ2hhbmdlc30gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdmVyc2lvbi1jaGFuZ2VzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTWV0aG9kQ2FsbFVwZ3JhZGVEYXRhIHtcclxuICBjbGFzc05hbWU6IHN0cmluZztcclxuICBtZXRob2Q6IHN0cmluZztcclxuICBpbnZhbGlkQXJnQ291bnRzOiB7Y291bnQ6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nfVtdO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgbWV0aG9kQ2FsbENoZWNrczogVmVyc2lvbkNoYW5nZXM8TWV0aG9kQ2FsbFVwZ3JhZGVEYXRhPiA9IHtcclxuICBbVGFyZ2V0VmVyc2lvbi5WMTFdOiBbe1xyXG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjA1MDAnLFxyXG4gICAgY2hhbmdlczogW3tcclxuICAgICAgY2xhc3NOYW1lOiAnRHJvcExpc3RSZWYnLFxyXG4gICAgICBtZXRob2Q6ICdkcm9wJyxcclxuICAgICAgaW52YWxpZEFyZ0NvdW50czogW3tcclxuICAgICAgICBjb3VudDogNSxcclxuICAgICAgICBtZXNzYWdlOiAnVGhlIFwicHJldmlvdXNJbmRleFwiIHBhcmFtZXRlciBpcyByZXF1aXJlZCBhbmQgdGhlIHBhcmFtZXRlciBvcmRlciBoYXMgY2hhbmdlZC4nXHJcbiAgICAgIH1dXHJcbiAgICB9XVxyXG4gIH1dLFxyXG4gIFtUYXJnZXRWZXJzaW9uLlY5XTogW3tcclxuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MDg0JyxcclxuICAgIGNoYW5nZXM6IFt7XHJcbiAgICAgIGNsYXNzTmFtZTogJ0Ryb3BMaXN0UmVmJyxcclxuICAgICAgbWV0aG9kOiAnZHJvcCcsXHJcbiAgICAgIGludmFsaWRBcmdDb3VudHM6IFt7Y291bnQ6IDQsIG1lc3NhZ2U6ICdUaGUgXCJkaXN0YW5jZVwiIHBhcmFtZXRlciBpcyByZXF1aXJlZCd9XVxyXG4gICAgfV1cclxuICB9XSxcclxuICBbVGFyZ2V0VmVyc2lvbi5WOF06IFtdLFxyXG4gIFtUYXJnZXRWZXJzaW9uLlY3XTogW10sXHJcbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbe1xyXG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzMjUnLFxyXG4gICAgY2hhbmdlczogW3tcclxuICAgICAgY2xhc3NOYW1lOiAnRm9jdXNNb25pdG9yJyxcclxuICAgICAgbWV0aG9kOiAnbW9uaXRvcicsXHJcbiAgICAgIGludmFsaWRBcmdDb3VudHM6IFt7Y291bnQ6IDMsIG1lc3NhZ2U6ICdUaGUgXCJyZW5kZXJlclwiIGFyZ3VtZW50IGhhcyBiZWVuIHJlbW92ZWQnfV1cclxuICAgIH1dXHJcbiAgfV1cclxufTtcclxuIl19