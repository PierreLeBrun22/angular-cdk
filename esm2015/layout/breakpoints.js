/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// PascalCase is being used as Breakpoints is used like an enum.
// tslint:disable-next-line:variable-name
export const Breakpoints = {
    XSmall: '(max-width: 599.98px)',
    Small: '(min-width: 600px) and (max-width: 959.98px)',
    Medium: '(min-width: 960px) and (max-width: 1279.98px)',
    Large: '(min-width: 1280px) and (max-width: 1919.98px)',
    XLarge: '(min-width: 1920px)',
    Handset: '(max-width: 599.98px) and (orientation: portrait), ' +
        '(max-width: 959.98px) and (orientation: landscape)',
    Tablet: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait), ' +
        '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
    Web: '(min-width: 840px) and (orientation: portrait), ' +
        '(min-width: 1280px) and (orientation: landscape)',
    HandsetPortrait: '(max-width: 599.98px) and (orientation: portrait)',
    TabletPortrait: '(min-width: 600px) and (max-width: 839.98px) and (orientation: portrait)',
    WebPortrait: '(min-width: 840px) and (orientation: portrait)',
    HandsetLandscape: '(max-width: 959.98px) and (orientation: landscape)',
    TabletLandscape: '(min-width: 960px) and (max-width: 1279.98px) and (orientation: landscape)',
    WebLandscape: '(min-width: 1280px) and (orientation: landscape)',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWtwb2ludHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2xheW91dC9icmVha3BvaW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxnRUFBZ0U7QUFDaEUseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRztJQUN6QixNQUFNLEVBQUUsdUJBQXVCO0lBQy9CLEtBQUssRUFBRSw4Q0FBOEM7SUFDckQsTUFBTSxFQUFFLCtDQUErQztJQUN2RCxLQUFLLEVBQUUsZ0RBQWdEO0lBQ3ZELE1BQU0sRUFBRSxxQkFBcUI7SUFFN0IsT0FBTyxFQUFFLHFEQUFxRDtRQUNyRCxvREFBb0Q7SUFDN0QsTUFBTSxFQUFFLDRFQUE0RTtRQUM1RSw0RUFBNEU7SUFDcEYsR0FBRyxFQUFFLGtEQUFrRDtRQUNsRCxrREFBa0Q7SUFFdkQsZUFBZSxFQUFFLG1EQUFtRDtJQUNwRSxjQUFjLEVBQUUsMEVBQTBFO0lBQzFGLFdBQVcsRUFBRSxnREFBZ0Q7SUFFN0QsZ0JBQWdCLEVBQUUsb0RBQW9EO0lBQ3RFLGVBQWUsRUFBRSw0RUFBNEU7SUFDN0YsWUFBWSxFQUFFLGtEQUFrRDtDQUNqRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcbi8vIFBhc2NhbENhc2UgaXMgYmVpbmcgdXNlZCBhcyBCcmVha3BvaW50cyBpcyB1c2VkIGxpa2UgYW4gZW51bS5cclxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOnZhcmlhYmxlLW5hbWVcclxuZXhwb3J0IGNvbnN0IEJyZWFrcG9pbnRzID0ge1xyXG4gIFhTbWFsbDogJyhtYXgtd2lkdGg6IDU5OS45OHB4KScsXHJcbiAgU21hbGw6ICcobWluLXdpZHRoOiA2MDBweCkgYW5kIChtYXgtd2lkdGg6IDk1OS45OHB4KScsXHJcbiAgTWVkaXVtOiAnKG1pbi13aWR0aDogOTYwcHgpIGFuZCAobWF4LXdpZHRoOiAxMjc5Ljk4cHgpJyxcclxuICBMYXJnZTogJyhtaW4td2lkdGg6IDEyODBweCkgYW5kIChtYXgtd2lkdGg6IDE5MTkuOThweCknLFxyXG4gIFhMYXJnZTogJyhtaW4td2lkdGg6IDE5MjBweCknLFxyXG5cclxuICBIYW5kc2V0OiAnKG1heC13aWR0aDogNTk5Ljk4cHgpIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KSwgJyArXHJcbiAgICAgICAgICAgJyhtYXgtd2lkdGg6IDk1OS45OHB4KSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxuICBUYWJsZXQ6ICcobWluLXdpZHRoOiA2MDBweCkgYW5kIChtYXgtd2lkdGg6IDgzOS45OHB4KSBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCksICcgK1xyXG4gICAgICAgICAgJyhtaW4td2lkdGg6IDk2MHB4KSBhbmQgKG1heC13aWR0aDogMTI3OS45OHB4KSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxuICBXZWI6ICcobWluLXdpZHRoOiA4NDBweCkgYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpLCAnICtcclxuICAgICAgICcobWluLXdpZHRoOiAxMjgwcHgpIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxyXG5cclxuICBIYW5kc2V0UG9ydHJhaXQ6ICcobWF4LXdpZHRoOiA1OTkuOThweCkgYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcclxuICBUYWJsZXRQb3J0cmFpdDogJyhtaW4td2lkdGg6IDYwMHB4KSBhbmQgKG1heC13aWR0aDogODM5Ljk4cHgpIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXHJcbiAgV2ViUG9ydHJhaXQ6ICcobWluLXdpZHRoOiA4NDBweCkgYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcclxuXHJcbiAgSGFuZHNldExhbmRzY2FwZTogJyhtYXgtd2lkdGg6IDk1OS45OHB4KSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxuICBUYWJsZXRMYW5kc2NhcGU6ICcobWluLXdpZHRoOiA5NjBweCkgYW5kIChtYXgtd2lkdGg6IDEyNzkuOThweCkgYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXHJcbiAgV2ViTGFuZHNjYXBlOiAnKG1pbi13aWR0aDogMTI4MHB4KSBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcclxufTtcclxuIl19