"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputNames = void 0;
const target_version_1 = require("../../update-tool/target-version");
exports.inputNames = {
    [target_version_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/10161',
            changes: [
                {
                    replace: 'origin',
                    replaceWith: 'cdkConnectedOverlayOrigin',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'positions',
                    replaceWith: 'cdkConnectedOverlayPositions',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'offsetX',
                    replaceWith: 'cdkConnectedOverlayOffsetX',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'offsetY',
                    replaceWith: 'cdkConnectedOverlayOffsetY',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'width',
                    replaceWith: 'cdkConnectedOverlayWidth',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'height',
                    replaceWith: 'cdkConnectedOverlayHeight',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'minWidth',
                    replaceWith: 'cdkConnectedOverlayMinWidth',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'minHeight',
                    replaceWith: 'cdkConnectedOverlayMinHeight',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'backdropClass',
                    replaceWith: 'cdkConnectedOverlayBackdropClass',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'scrollStrategy',
                    replaceWith: 'cdkConnectedOverlayScrollStrategy',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'open',
                    replaceWith: 'cdkConnectedOverlayOpen',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                },
                {
                    replace: 'hasBackdrop',
                    replaceWith: 'cdkConnectedOverlayHasBackdrop',
                    limitedTo: { attributes: ['cdk-connected-overlay', 'connected-overlay', 'cdkConnectedOverlay'] }
                }
            ]
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbmFtZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvaW5wdXQtbmFtZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgscUVBQStEO0FBaUJsRCxRQUFBLFVBQVUsR0FBeUM7SUFDOUQsQ0FBQyw4QkFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2xCO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUU7Z0JBQ1A7b0JBQ0UsT0FBTyxFQUFFLFFBQVE7b0JBQ2pCLFdBQVcsRUFBRSwyQkFBMkI7b0JBQ3hDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxXQUFXO29CQUNwQixXQUFXLEVBQUUsOEJBQThCO29CQUMzQyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsU0FBUztvQkFDbEIsV0FBVyxFQUFFLDRCQUE0QjtvQkFDekMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLFNBQVM7b0JBQ2xCLFdBQVcsRUFBRSw0QkFBNEI7b0JBQ3pDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxPQUFPO29CQUNoQixXQUFXLEVBQUUsMEJBQTBCO29CQUN2QyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsUUFBUTtvQkFDakIsV0FBVyxFQUFFLDJCQUEyQjtvQkFDeEMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLFVBQVU7b0JBQ25CLFdBQVcsRUFBRSw2QkFBNkI7b0JBQzFDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2dCQUNEO29CQUNFLE9BQU8sRUFBRSxXQUFXO29CQUNwQixXQUFXLEVBQUUsOEJBQThCO29CQUMzQyxTQUFTLEVBQ0wsRUFBQyxVQUFVLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsQ0FBQyxFQUFDO2lCQUN4RjtnQkFDRDtvQkFDRSxPQUFPLEVBQUUsZUFBZTtvQkFDeEIsV0FBVyxFQUFFLGtDQUFrQztvQkFDL0MsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGdCQUFnQjtvQkFDekIsV0FBVyxFQUFFLG1DQUFtQztvQkFDaEQsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLE1BQU07b0JBQ2YsV0FBVyxFQUFFLHlCQUF5QjtvQkFDdEMsU0FBUyxFQUNMLEVBQUMsVUFBVSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBQztpQkFDeEY7Z0JBQ0Q7b0JBQ0UsT0FBTyxFQUFFLGFBQWE7b0JBQ3RCLFdBQVcsRUFBRSxnQ0FBZ0M7b0JBQzdDLFNBQVMsRUFDTCxFQUFDLFVBQVUsRUFBRSxDQUFDLHVCQUF1QixFQUFFLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDLEVBQUM7aUJBQ3hGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUYXJnZXRWZXJzaW9ufSBmcm9tICcuLi8uLi91cGRhdGUtdG9vbC90YXJnZXQtdmVyc2lvbic7XHJcbmltcG9ydCB7VmVyc2lvbkNoYW5nZXN9IGZyb20gJy4uLy4uL3VwZGF0ZS10b29sL3ZlcnNpb24tY2hhbmdlcyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElucHV0TmFtZVVwZ3JhZGVEYXRhIHtcclxuICAvKiogVGhlIEBJbnB1dCgpIG5hbWUgdG8gcmVwbGFjZS4gKi9cclxuICByZXBsYWNlOiBzdHJpbmc7XHJcbiAgLyoqIFRoZSBuZXcgbmFtZSBmb3IgdGhlIEBJbnB1dCgpLiAqL1xyXG4gIHJlcGxhY2VXaXRoOiBzdHJpbmc7XHJcbiAgLyoqIENvbnRyb2xzIHdoaWNoIGVsZW1lbnRzIGFuZCBhdHRyaWJ1dGVzIGluIHdoaWNoIHRoaXMgcmVwbGFjZW1lbnQgaXMgbWFkZS4gKi9cclxuICBsaW1pdGVkVG86IHtcclxuICAgIC8qKiBMaW1pdCB0byBlbGVtZW50cyB3aXRoIGFueSBvZiB0aGVzZSBlbGVtZW50IHRhZ3MuICovXHJcbiAgICBlbGVtZW50cz86IHN0cmluZ1tdLFxyXG4gICAgLyoqIExpbWl0IHRvIGVsZW1lbnRzIHdpdGggYW55IG9mIHRoZXNlIGF0dHJpYnV0ZXMuICovXHJcbiAgICBhdHRyaWJ1dGVzPzogc3RyaW5nW10sXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGlucHV0TmFtZXM6IFZlcnNpb25DaGFuZ2VzPElucHV0TmFtZVVwZ3JhZGVEYXRhPiA9IHtcclxuICBbVGFyZ2V0VmVyc2lvbi5WNl06IFtcclxuICAgIHtcclxuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAxNjEnLFxyXG4gICAgICBjaGFuZ2VzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ29yaWdpbicsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlPcmlnaW4nLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAncG9zaXRpb25zJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheVBvc2l0aW9ucycsXHJcbiAgICAgICAgICBsaW1pdGVkVG86XHJcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdvZmZzZXRYJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheU9mZnNldFgnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnb2Zmc2V0WScsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlPZmZzZXRZJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzpcclxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ3dpZHRoJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheVdpZHRoJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzpcclxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ2hlaWdodCcsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlIZWlnaHQnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnbWluV2lkdGgnLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5TWluV2lkdGgnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnbWluSGVpZ2h0JyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheU1pbkhlaWdodCcsXHJcbiAgICAgICAgICBsaW1pdGVkVG86XHJcbiAgICAgICAgICAgICAge2F0dHJpYnV0ZXM6IFsnY2RrLWNvbm5lY3RlZC1vdmVybGF5JywgJ2Nvbm5lY3RlZC1vdmVybGF5JywgJ2Nka0Nvbm5lY3RlZE92ZXJsYXknXX1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIHJlcGxhY2U6ICdiYWNrZHJvcENsYXNzJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheUJhY2tkcm9wQ2xhc3MnLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnc2Nyb2xsU3RyYXRlZ3knLFxyXG4gICAgICAgICAgcmVwbGFjZVdpdGg6ICdjZGtDb25uZWN0ZWRPdmVybGF5U2Nyb2xsU3RyYXRlZ3knLFxyXG4gICAgICAgICAgbGltaXRlZFRvOlxyXG4gICAgICAgICAgICAgIHthdHRyaWJ1dGVzOiBbJ2Nkay1jb25uZWN0ZWQtb3ZlcmxheScsICdjb25uZWN0ZWQtb3ZlcmxheScsICdjZGtDb25uZWN0ZWRPdmVybGF5J119XHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICByZXBsYWNlOiAnb3BlbicsXHJcbiAgICAgICAgICByZXBsYWNlV2l0aDogJ2Nka0Nvbm5lY3RlZE92ZXJsYXlPcGVuJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzpcclxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgcmVwbGFjZTogJ2hhc0JhY2tkcm9wJyxcclxuICAgICAgICAgIHJlcGxhY2VXaXRoOiAnY2RrQ29ubmVjdGVkT3ZlcmxheUhhc0JhY2tkcm9wJyxcclxuICAgICAgICAgIGxpbWl0ZWRUbzpcclxuICAgICAgICAgICAgICB7YXR0cmlidXRlczogWydjZGstY29ubmVjdGVkLW92ZXJsYXknLCAnY29ubmVjdGVkLW92ZXJsYXknLCAnY2RrQ29ubmVjdGVkT3ZlcmxheSddfVxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICBdXHJcbn07XHJcbiJdfQ==