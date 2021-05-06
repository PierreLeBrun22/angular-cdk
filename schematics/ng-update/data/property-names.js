"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyNames = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.propertyNames = {
    [target_version_1.TargetVersion.V9]: [
        {
            pr: 'https://github.com/angular/components/pull/17084',
            changes: [{
                    replace: 'boundaryElementSelector',
                    replaceWith: 'boundaryElement',
                    limitedTo: { classes: ['CdkDrag'] }
                }]
        },
        {
            pr: 'https://github.com/angular/components/pull/17302',
            changes: [{
                    replace: 'onChange',
                    replaceWith: 'changed',
                    limitedTo: { classes: ['SelectionModel'] }
                }]
        }
    ],
    [target_version_1.TargetVersion.V8]: [],
    [target_version_1.TargetVersion.V7]: [
        {
            pr: 'https://github.com/angular/components/pull/8286',
            changes: [{ replace: 'onChange', replaceWith: 'changed', limitedTo: { classes: ['SelectionModel'] } }]
        },
        {
            pr: 'https://github.com/angular/components/pull/12927',
            changes: [{
                    replace: 'flexibleDiemsions',
                    replaceWith: 'flexibleDimensions',
                    limitedTo: { classes: ['CdkConnectedOverlay'] }
                }]
        }
    ],
    [target_version_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10161',
            changes: [
                {
                    replace: '_deprecatedOrigin',
                    replaceWith: 'origin',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedPositions',
                    replaceWith: 'positions',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOffsetX',
                    replaceWith: 'offsetX',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOffsetY',
                    replaceWith: 'offsetY',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedWidth',
                    replaceWith: 'width',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedHeight',
                    replaceWith: 'height',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedMinWidth',
                    replaceWith: 'minWidth',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedMinHeight',
                    replaceWith: 'minHeight',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedBackdropClass',
                    replaceWith: 'backdropClass',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedScrollStrategy',
                    replaceWith: 'scrollStrategy',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedOpen',
                    replaceWith: 'open',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                },
                {
                    replace: '_deprecatedHasBackdrop',
                    replaceWith: 'hasBackdrop',
                    limitedTo: { classes: ['CdkConnectedOverlay', 'ConnectedOverlayDirective'] }
                }
            ]
        },
        {
            pr: 'https://github.com/angular/components/pull/10257',
            changes: [
                {
                    replace: '_deprecatedPortal',
                    replaceWith: 'portal',
                    limitedTo: { classes: ['CdkPortalOutlet'] }
                },
                {
                    replace: '_deprecatedPortalHost',
                    replaceWith: 'portal',
                    limitedTo: { classes: ['CdkPortalOutlet'] }
                }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcGVydHktbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvcHJvcGVydHktbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUVBQStEO0FBZWxELFFBQUEsYUFBYSxHQUE0QztJQUNwRSxDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDO29CQUNSLE9BQU8sRUFBRSx5QkFBeUI7b0JBQ2xDLFdBQVcsRUFBRSxpQkFBaUI7b0JBQzlCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFDO2lCQUNsQyxDQUFDO1NBQ0g7UUFDRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLFdBQVcsRUFBRSxTQUFTO29CQUN0QixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDO2lCQUN6QyxDQUFDO1NBQ0g7S0FDRjtJQUNELENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0lBQ3RCLENBQUMsOEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQjtZQUNFLEVBQUUsRUFBRSxpREFBaUQ7WUFDckQsT0FBTyxFQUNILENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxFQUFDLENBQUM7U0FDOUY7UUFFRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUM7b0JBQ1IsT0FBTyxFQUFFLG1CQUFtQjtvQkFDNUIsV0FBVyxFQUFFLG9CQUFvQjtvQkFDakMsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBQztpQkFDOUMsQ0FBQztTQUNIO0tBQ0Y7SUFFRCxDQUFDLDhCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRTtnQkFDUDtvQkFDRSxPQUFPLEVBQUUsbUJBQW1CO29CQUM1QixXQUFXLEVBQUUsUUFBUTtvQkFDckIsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLEVBQUUsMkJBQTJCLENBQUMsRUFBQztpQkFDM0U7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLHNCQUFzQjtvQkFDL0IsV0FBVyxFQUFFLFdBQVc7b0JBQ3hCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixFQUFFLDJCQUEyQixDQUFDLEVBQUM7aUJBQzNFO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxvQkFBb0I7b0JBQzdCLFdBQVcsRUFBRSxTQUFTO29CQUN0QixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFDO2lCQUMzRTtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsb0JBQW9CO29CQUM3QixXQUFXLEVBQUUsU0FBUztvQkFDdEIsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLEVBQUUsMkJBQTJCLENBQUMsRUFBQztpQkFDM0U7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsV0FBVyxFQUFFLE9BQU87b0JBQ3BCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixFQUFFLDJCQUEyQixDQUFDLEVBQUM7aUJBQzNFO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxtQkFBbUI7b0JBQzVCLFdBQVcsRUFBRSxRQUFRO29CQUNyQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFDO2lCQUMzRTtnQkFDRDtvQkFDRSxPQUFPLEVBQUUscUJBQXFCO29CQUM5QixXQUFXLEVBQUUsVUFBVTtvQkFDdkIsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLEVBQUUsMkJBQTJCLENBQUMsRUFBQztpQkFDM0U7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLHNCQUFzQjtvQkFDL0IsV0FBVyxFQUFFLFdBQVc7b0JBQ3hCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixFQUFFLDJCQUEyQixDQUFDLEVBQUM7aUJBQzNFO2dCQUNEO29CQUNFLE9BQU8sRUFBRSwwQkFBMEI7b0JBQ25DLFdBQVcsRUFBRSxlQUFlO29CQUM1QixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFDO2lCQUMzRTtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsMkJBQTJCO29CQUNwQyxXQUFXLEVBQUUsZ0JBQWdCO29CQUM3QixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSwyQkFBMkIsQ0FBQyxFQUFDO2lCQUMzRTtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixXQUFXLEVBQUUsTUFBTTtvQkFDbkIsU0FBUyxFQUFFLEVBQUMsT0FBTyxFQUFFLENBQUMscUJBQXFCLEVBQUUsMkJBQTJCLENBQUMsRUFBQztpQkFDM0U7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLHdCQUF3QjtvQkFDakMsV0FBVyxFQUFFLGFBQWE7b0JBQzFCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLHFCQUFxQixFQUFFLDJCQUEyQixDQUFDLEVBQUM7aUJBQzNFO2FBQ0Y7U0FDRjtRQUVEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsT0FBTyxFQUFFLG1CQUFtQjtvQkFDNUIsV0FBVyxFQUFFLFFBQVE7b0JBQ3JCLFNBQVMsRUFBRSxFQUFDLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUM7aUJBQzFDO2dCQUNEO29CQUNFLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLFdBQVcsRUFBRSxRQUFRO29CQUNyQixTQUFTLEVBQUUsRUFBQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDO2lCQUMxQzthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7VGFyZ2V0VmVyc2lvbn0gZnJvbSAnLi4vLi4vdXBkYXRlLXRvb2wvdGFyZ2V0LXZlcnNpb24nO1xyXG5pbXBvcnQge1ZlcnNpb25DaGFuZ2VzfSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC92ZXJzaW9uLWNoYW5nZXMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eU5hbWVVcGdyYWRlRGF0YSB7XHJcbiAgLyoqIFRoZSBwcm9wZXJ0eSBuYW1lIHRvIHJlcGxhY2UuICovXHJcbiAgcmVwbGFjZTogc3RyaW5nO1xyXG4gIC8qKiBUaGUgbmV3IG5hbWUgZm9yIHRoZSBwcm9wZXJ0eS4gKi9cclxuICByZXBsYWNlV2l0aDogc3RyaW5nO1xyXG4gIC8qKiBDb250cm9scyB3aGljaCBjbGFzc2VzIGluIHdoaWNoIHRoaXMgcmVwbGFjZW1lbnQgaXMgbWFkZS4gKi9cclxuICBsaW1pdGVkVG86IHtcclxuICAgIC8qKiBSZXBsYWNlIHRoZSBwcm9wZXJ0eSBvbmx5IHdoZW4gaXRzIHR5cGUgaXMgb25lIG9mIHRoZSBnaXZlbiBDbGFzc2VzLiAqL1xyXG4gICAgY2xhc3Nlczogc3RyaW5nW107XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHByb3BlcnR5TmFtZXM6IFZlcnNpb25DaGFuZ2VzPFByb3BlcnR5TmFtZVVwZ3JhZGVEYXRhPiA9IHtcclxuICBbVGFyZ2V0VmVyc2lvbi5WOV06IFtcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTcwODQnLFxyXG4gICAgICBjaGFuZ2VzOiBbe1xyXG4gICAgICAgIHJlcGxhY2U6ICdib3VuZGFyeUVsZW1lbnRTZWxlY3RvcicsXHJcbiAgICAgICAgcmVwbGFjZVdpdGg6ICdib3VuZGFyeUVsZW1lbnQnLFxyXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrRHJhZyddfVxyXG4gICAgICB9XVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTczMDInLFxyXG4gICAgICBjaGFuZ2VzOiBbe1xyXG4gICAgICAgIHJlcGxhY2U6ICdvbkNoYW5nZScsXHJcbiAgICAgICAgcmVwbGFjZVdpdGg6ICdjaGFuZ2VkJyxcclxuICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ1NlbGVjdGlvbk1vZGVsJ119XHJcbiAgICAgIH1dXHJcbiAgICB9XHJcbiAgXSxcclxuICBbVGFyZ2V0VmVyc2lvbi5WOF06IFtdLFxyXG4gIFtUYXJnZXRWZXJzaW9uLlY3XTogW1xyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC84Mjg2JyxcclxuICAgICAgY2hhbmdlczpcclxuICAgICAgICAgIFt7cmVwbGFjZTogJ29uQ2hhbmdlJywgcmVwbGFjZVdpdGg6ICdjaGFuZ2VkJywgbGltaXRlZFRvOiB7Y2xhc3NlczogWydTZWxlY3Rpb25Nb2RlbCddfX1dXHJcbiAgICB9LFxyXG5cclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTI5MjcnLFxyXG4gICAgICBjaGFuZ2VzOiBbe1xyXG4gICAgICAgIHJlcGxhY2U6ICdmbGV4aWJsZURpZW1zaW9ucycsXHJcbiAgICAgICAgcmVwbGFjZVdpdGg6ICdmbGV4aWJsZURpbWVuc2lvbnMnLFxyXG4gICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheSddfVxyXG4gICAgICB9XVxyXG4gICAgfVxyXG4gIF0sXHJcblxyXG4gIFtUYXJnZXRWZXJzaW9uLlY2XTogW1xyXG4gICAge1xyXG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDE2MScsXHJcbiAgICAgIGNoYW5nZXM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRPcmlnaW4nLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvcmlnaW4nLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZFBvc2l0aW9ucycsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ3Bvc2l0aW9ucycsXHJcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkT2Zmc2V0WCcsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ29mZnNldFgnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZE9mZnNldFknLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvZmZzZXRZJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRXaWR0aCcsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ3dpZHRoJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRIZWlnaHQnLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdoZWlnaHQnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZE1pbldpZHRoJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnbWluV2lkdGgnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZE1pbkhlaWdodCcsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ21pbkhlaWdodCcsXHJcbiAgICAgICAgICBsaW1pdGVkVG86IHtjbGFzc2VzOiBbJ0Nka0Nvbm5lY3RlZE92ZXJsYXknLCAnQ29ubmVjdGVkT3ZlcmxheURpcmVjdGl2ZSddfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkQmFja2Ryb3BDbGFzcycsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2JhY2tkcm9wQ2xhc3MnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZFNjcm9sbFN0cmF0ZWd5JyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnc2Nyb2xsU3RyYXRlZ3knLFxyXG4gICAgICAgICAgbGltaXRlZFRvOiB7Y2xhc3NlczogWydDZGtDb25uZWN0ZWRPdmVybGF5JywgJ0Nvbm5lY3RlZE92ZXJsYXlEaXJlY3RpdmUnXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdfZGVwcmVjYXRlZE9wZW4nLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdvcGVuJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRIYXNCYWNrZHJvcCcsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2hhc0JhY2tkcm9wJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrQ29ubmVjdGVkT3ZlcmxheScsICdDb25uZWN0ZWRPdmVybGF5RGlyZWN0aXZlJ119XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG5cclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAyNTcnLFxyXG4gICAgICBjaGFuZ2VzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ19kZXByZWNhdGVkUG9ydGFsJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAncG9ydGFsJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrUG9ydGFsT3V0bGV0J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnX2RlcHJlY2F0ZWRQb3J0YWxIb3N0JyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAncG9ydGFsJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzoge2NsYXNzZXM6IFsnQ2RrUG9ydGFsT3V0bGV0J119XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gIF1cclxufTtcclxuIl19