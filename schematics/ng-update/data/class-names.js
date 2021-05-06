"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.classNames = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.classNames = {
    [target_version_1.TargetVersion.V9]: [{
            pr: 'https://github.com/angular/components/pull/17084',
            changes: [
                { replace: 'CDK_DROP_LIST_CONTAINER', replaceWith: 'CDK_DROP_LIST' },
                { replace: 'CdkDragConfig', replaceWith: 'DragRefConfig' }
            ]
        }],
    [target_version_1.TargetVersion.V8]: [],
    [target_version_1.TargetVersion.V7]: [],
    [target_version_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10161',
            changes: [
                { replace: 'ConnectedOverlayDirective', replaceWith: 'CdkConnectedOverlay' },
                { replace: 'OverlayOrigin', replaceWith: 'CdkOverlayOrigin' }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10267',
            changes: [{ replace: 'ObserveContent', replaceWith: 'CdkObserveContent' }]
        },
        {
            pr: 'https://github.com/angular/components/pull/10325',
            changes: [{ replace: 'FocusTrapDirective', replaceWith: 'CdkTrapFocus' }]
        }
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvY2xhc3MtbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUVBQStEO0FBVWxELFFBQUEsVUFBVSxHQUF5QztJQUM5RCxDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUNuQixFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFDO2dCQUNsRSxFQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLGVBQWUsRUFBQzthQUN6RDtTQUNGLENBQUM7SUFDRixDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUN0QixDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUN0QixDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUCxFQUFDLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxXQUFXLEVBQUUscUJBQXFCLEVBQUM7Z0JBQzFFLEVBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUM7YUFDNUQ7U0FDRjtRQUVEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztTQUN6RTtRQUVEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFDLENBQUM7U0FDeEU7S0FDRjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24nO1xyXG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDbGFzc05hbWVVcGdyYWRlRGF0YSB7XHJcbiAgLyoqIFRoZSBDbGFzcyBuYW1lIHRvIHJlcGxhY2UuICovXHJcbiAgcmVwbGFjZTogc3RyaW5nO1xyXG4gIC8qKiBUaGUgbmV3IG5hbWUgZm9yIHRoZSBDbGFzcy4gKi9cclxuICByZXBsYWNlV2l0aDogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY2xhc3NOYW1lczogVmVyc2lvbkNoYW5nZXM8Q2xhc3NOYW1lVXBncmFkZURhdGE+ID0ge1xyXG4gIFtUYXJnZXRWZXJzaW9uLlY5XTogW3tcclxuICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MDg0JyxcclxuICAgIGNoYW5nZXM6IFtcclxuICAgICAge3JlcGxhY2U6ICdDREtfRFJPUF9MSVNUX0NPTlRBSU5FUicsIHJlcGxhY2VXaXRoOiAnQ0RLX0RST1BfTElTVCd9LFxyXG4gICAgICB7cmVwbGFjZTogJ0Nka0RyYWdDb25maWcnLCByZXBsYWNlV2l0aDogJ0RyYWdSZWZDb25maWcnfVxyXG4gICAgXVxyXG4gIH1dLFxyXG4gIFtUYXJnZXRWZXJzaW9uLlY4XTogW10sXHJcbiAgW1RhcmdldFZlcnNpb24uVjddOiBbXSxcclxuICBbVGFyZ2V0VmVyc2lvbi5WNl06IFtcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAxNjEnLFxyXG4gICAgICBjaGFuZ2VzOiBbXHJcbiAgICAgICAge3JlcGxhY2U6ICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJywgcmVwbGFjZVdpdGg6ICdDZGtDb25uZWN0ZWRPdmVybGF5J30sXHJcbiAgICAgICAge3JlcGxhY2U6ICdPdmVybGF5T3JpZ2luJywgcmVwbGFjZVdpdGg6ICdDZGtPdmVybGF5T3JpZ2luJ31cclxuICAgICAgXVxyXG4gICAgfSxcclxuXHJcbiAgICB7XHJcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzEwMjY3JyxcclxuICAgICAgY2hhbmdlczogW3tyZXBsYWNlOiAnT2JzZXJ2ZUNvbnRlbnQnLCByZXBsYWNlV2l0aDogJ0Nka09ic2VydmVDb250ZW50J31dXHJcbiAgICB9LFxyXG5cclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzMjUnLFxyXG4gICAgICBjaGFuZ2VzOiBbe3JlcGxhY2U6ICdGb2N1c1RyYXBEaXJlY3RpdmUnLCByZXBsYWNlV2l0aDogJ0Nka1RyYXBGb2N1cyd9XVxyXG4gICAgfVxyXG4gIF1cclxufTtcclxuIl19