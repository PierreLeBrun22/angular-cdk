"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructorChecks = void 0;
const target_version_1 = require("../../update-tool/target-version");
/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
exports.constructorChecks = {
    [target_version_1.TargetVersion.V11]: [
        {
            pr: 'https://github.com/angular/components/pull/20454',
            changes: ['ScrollDispatcher', 'ViewportRuler', 'CdkVirtualScrollViewport']
        },
        {
            pr: 'https://github.com/angular/components/pull/20500',
            changes: ['CdkDropList']
        },
        {
            pr: 'https://github.com/angular/components/pull/20572',
            changes: ['CdkTreeNodePadding']
        },
        {
            pr: 'https://github.com/angular/components/pull/20511',
            changes: ['OverlayContainer', 'FullscreenOverlayContainer', 'OverlayRef', 'Overlay']
        }
    ],
    [target_version_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19347',
            changes: ['Platform']
        }
    ],
    [target_version_1.TargetVersion.V9]: [{
            pr: 'https://github.com/angular/components/pull/17084',
            changes: ['DropListRef']
        }],
    [target_version_1.TargetVersion.V8]: [{
            pr: 'https://github.com/angular/components/pull/15647',
            changes: [
                'CdkDrag', 'CdkDropList', 'ConnectedPositionStrategy', 'FlexibleConnectedPositionStrategy',
                'OverlayPositionBuilder', 'CdkTable'
            ]
        }],
    [target_version_1.TargetVersion.V7]: [],
    [target_version_1.TargetVersion.V6]: []
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0b3ItY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9zY2hlbWF0aWNzL25nLXVwZGF0ZS9kYXRhL2NvbnN0cnVjdG9yLWNoZWNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxxRUFBK0Q7QUFLL0Q7Ozs7R0FJRztBQUNVLFFBQUEsaUJBQWlCLEdBQWlEO0lBQzdFLENBQUMsOEJBQWEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNuQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLDBCQUEwQixDQUFDO1NBQzNFO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztTQUN6QjtRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztTQUNoQztRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSw0QkFBNEIsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDO1NBQ3JGO0tBQ0Y7SUFDRCxDQUFDLDhCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbkI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztTQUN0QjtLQUNGO0lBQ0QsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDbkIsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUM7U0FDekIsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ25CLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRSxhQUFhLEVBQUUsMkJBQTJCLEVBQUUsbUNBQW1DO2dCQUMxRix3QkFBd0IsRUFBRSxVQUFVO2FBQ3JDO1NBQ0YsQ0FBQztJQUNGLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0NBQ3ZCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24nO1xyXG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xyXG5cclxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3JDaGVja3NVcGdyYWRlRGF0YSA9IHN0cmluZztcclxuXHJcbi8qKlxyXG4gKiBMaXN0IG9mIGNsYXNzIG5hbWVzIGZvciB3aGljaCB0aGUgY29uc3RydWN0b3Igc2lnbmF0dXJlIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBuZXcgY29uc3RydWN0b3JcclxuICogc2lnbmF0dXJlIHR5cGVzIGRvbid0IG5lZWQgdG8gYmUgc3RvcmVkIGhlcmUgYmVjYXVzZSB0aGUgc2lnbmF0dXJlIHdpbGwgYmUgZGV0ZXJtaW5lZFxyXG4gKiBhdXRvbWF0aWNhbGx5IHRocm91Z2ggdHlwZSBjaGVja2luZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBjb25zdHJ1Y3RvckNoZWNrczogVmVyc2lvbkNoYW5nZXM8Q29uc3RydWN0b3JDaGVja3NVcGdyYWRlRGF0YT4gPSB7XHJcbiAgW1RhcmdldFZlcnNpb24uVjExXTogW1xyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDQ1NCcsXHJcbiAgICAgIGNoYW5nZXM6IFsnU2Nyb2xsRGlzcGF0Y2hlcicsICdWaWV3cG9ydFJ1bGVyJywgJ0Nka1ZpcnR1YWxTY3JvbGxWaWV3cG9ydCddXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDUwMCcsXHJcbiAgICAgIGNoYW5nZXM6IFsnQ2RrRHJvcExpc3QnXVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMjA1NzInLFxyXG4gICAgICBjaGFuZ2VzOiBbJ0Nka1RyZWVOb2RlUGFkZGluZyddXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8yMDUxMScsXHJcbiAgICAgIGNoYW5nZXM6IFsnT3ZlcmxheUNvbnRhaW5lcicsICdGdWxsc2NyZWVuT3ZlcmxheUNvbnRhaW5lcicsICdPdmVybGF5UmVmJywgJ092ZXJsYXknXVxyXG4gICAgfVxyXG4gIF0sXHJcbiAgW1RhcmdldFZlcnNpb24uVjEwXTogW1xyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xOTM0NycsXHJcbiAgICAgIGNoYW5nZXM6IFsnUGxhdGZvcm0nXVxyXG4gICAgfVxyXG4gIF0sXHJcbiAgW1RhcmdldFZlcnNpb24uVjldOiBbe1xyXG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTcwODQnLFxyXG4gICAgY2hhbmdlczogWydEcm9wTGlzdFJlZiddXHJcbiAgfV0sXHJcbiAgW1RhcmdldFZlcnNpb24uVjhdOiBbe1xyXG4gICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTU2NDcnLFxyXG4gICAgY2hhbmdlczogW1xyXG4gICAgICAnQ2RrRHJhZycsICdDZGtEcm9wTGlzdCcsICdDb25uZWN0ZWRQb3NpdGlvblN0cmF0ZWd5JywgJ0ZsZXhpYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneScsXHJcbiAgICAgICdPdmVybGF5UG9zaXRpb25CdWlsZGVyJywgJ0Nka1RhYmxlJ1xyXG4gICAgXVxyXG4gIH1dLFxyXG4gIFtUYXJnZXRWZXJzaW9uLlY3XTogW10sXHJcbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbXVxyXG59O1xyXG4iXX0=