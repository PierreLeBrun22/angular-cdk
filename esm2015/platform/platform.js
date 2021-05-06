/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as i0 from "@angular/core";
// Whether the current platform supports the V8 Break Iterator. The V8 check
// is necessary to detect all Blink based browsers.
let hasV8BreakIterator;
// We need a try/catch around the reference to `Intl`, because accessing it in some cases can
// cause IE to throw. These cases are tied to particular versions of Windows and can happen if
// the consumer is providing a polyfilled `Map`. See:
// https://github.com/Microsoft/ChakraCore/issues/3189
// https://github.com/angular/components/issues/15687
try {
    hasV8BreakIterator = (typeof Intl !== 'undefined' && Intl.v8BreakIterator);
}
catch (_a) {
    hasV8BreakIterator = false;
}
/**
 * Service to detect the current platform by comparing the userAgent strings and
 * checking browser-specific global properties.
 */
export class Platform {
    constructor(_platformId) {
        this._platformId = _platformId;
        // We want to use the Angular platform check because if the Document is shimmed
        // without the navigator, the following checks will fail. This is preferred because
        // sometimes the Document may be shimmed without the user's knowledge or intention
        /** Whether the Angular application is being rendered in the browser. */
        this.isBrowser = this._platformId ?
            isPlatformBrowser(this._platformId) : typeof document === 'object' && !!document;
        /** Whether the current browser is Microsoft Edge. */
        this.EDGE = this.isBrowser && /(edge)/i.test(navigator.userAgent);
        /** Whether the current rendering engine is Microsoft Trident. */
        this.TRIDENT = this.isBrowser && /(msie|trident)/i.test(navigator.userAgent);
        // EdgeHTML and Trident mock Blink specific things and need to be excluded from this check.
        /** Whether the current rendering engine is Blink. */
        this.BLINK = this.isBrowser && (!!(window.chrome || hasV8BreakIterator) &&
            typeof CSS !== 'undefined' && !this.EDGE && !this.TRIDENT);
        // Webkit is part of the userAgent in EdgeHTML, Blink and Trident. Therefore we need to
        // ensure that Webkit runs standalone and is not used as another engine's base.
        /** Whether the current rendering engine is WebKit. */
        this.WEBKIT = this.isBrowser &&
            /AppleWebKit/i.test(navigator.userAgent) && !this.BLINK && !this.EDGE && !this.TRIDENT;
        /** Whether the current platform is Apple iOS. */
        this.IOS = this.isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !('MSStream' in window);
        // It's difficult to detect the plain Gecko engine, because most of the browsers identify
        // them self as Gecko-like browsers and modify the userAgent's according to that.
        // Since we only cover one explicit Firefox case, we can simply check for Firefox
        // instead of having an unstable check for Gecko.
        /** Whether the current browser is Firefox. */
        this.FIREFOX = this.isBrowser && /(firefox|minefield)/i.test(navigator.userAgent);
        /** Whether the current platform is Android. */
        // Trident on mobile adds the android platform to the userAgent to trick detections.
        this.ANDROID = this.isBrowser && /android/i.test(navigator.userAgent) && !this.TRIDENT;
        // Safari browsers will include the Safari keyword in their userAgent. Some browsers may fake
        // this and just place the Safari keyword in the userAgent. To be more safe about Safari every
        // Safari browser should also use Webkit as its layout engine.
        /** Whether the current browser is Safari. */
        this.SAFARI = this.isBrowser && /safari/i.test(navigator.userAgent) && this.WEBKIT;
    }
}
Platform.ɵprov = i0.ɵɵdefineInjectable({ factory: function Platform_Factory() { return new Platform(i0.ɵɵinject(i0.PLATFORM_ID)); }, token: Platform, providedIn: "root" });
Platform.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
Platform.ctorParameters = () => [
    { type: Object, decorators: [{ type: Inject, args: [PLATFORM_ID,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BsYXRmb3JtL3BsYXRmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQzs7QUFFbEQsNEVBQTRFO0FBQzVFLG1EQUFtRDtBQUNuRCxJQUFJLGtCQUEyQixDQUFDO0FBRWhDLDZGQUE2RjtBQUM3Riw4RkFBOEY7QUFDOUYscURBQXFEO0FBQ3JELHNEQUFzRDtBQUN0RCxxREFBcUQ7QUFDckQsSUFBSTtJQUNGLGtCQUFrQixHQUFHLENBQUMsT0FBTyxJQUFJLEtBQUssV0FBVyxJQUFLLElBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztDQUNyRjtBQUFDLFdBQU07SUFDTixrQkFBa0IsR0FBRyxLQUFLLENBQUM7Q0FDNUI7QUFFRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sUUFBUTtJQThDbkIsWUFBeUMsV0FBbUI7UUFBbkIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUE3QzVELCtFQUErRTtRQUMvRSxtRkFBbUY7UUFDbkYsa0ZBQWtGO1FBQ2xGLHdFQUF3RTtRQUN4RSxjQUFTLEdBQVksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25DLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFFckYscURBQXFEO1FBQ3JELFNBQUksR0FBWSxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXRFLGlFQUFpRTtRQUNqRSxZQUFPLEdBQVksSUFBSSxDQUFDLFNBQVMsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWpGLDJGQUEyRjtRQUMzRixxREFBcUQ7UUFDckQsVUFBSyxHQUFZLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxNQUFjLENBQUMsTUFBTSxJQUFJLGtCQUFrQixDQUFDO1lBQ2hGLE9BQU8sR0FBRyxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFL0QsdUZBQXVGO1FBQ3ZGLCtFQUErRTtRQUMvRSxzREFBc0Q7UUFDdEQsV0FBTSxHQUFZLElBQUksQ0FBQyxTQUFTO1lBQzVCLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRTNGLGlEQUFpRDtRQUNqRCxRQUFHLEdBQVksSUFBSSxDQUFDLFNBQVMsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUN6RSxDQUFDLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBRTVCLHlGQUF5RjtRQUN6RixpRkFBaUY7UUFDakYsaUZBQWlGO1FBQ2pGLGlEQUFpRDtRQUNqRCw4Q0FBOEM7UUFDOUMsWUFBTyxHQUFZLElBQUksQ0FBQyxTQUFTLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV0RiwrQ0FBK0M7UUFDL0Msb0ZBQW9GO1FBQ3BGLFlBQU8sR0FBWSxJQUFJLENBQUMsU0FBUyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUUzRiw2RkFBNkY7UUFDN0YsOEZBQThGO1FBQzlGLDhEQUE4RDtRQUM5RCw2Q0FBNkM7UUFDN0MsV0FBTSxHQUFZLElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUV4QixDQUFDOzs7O1lBL0NqRSxVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7WUErQ3dCLE1BQU0sdUJBQS9DLE1BQU0sU0FBQyxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgUExBVEZPUk1fSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge2lzUGxhdGZvcm1Ccm93c2VyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuLy8gV2hldGhlciB0aGUgY3VycmVudCBwbGF0Zm9ybSBzdXBwb3J0cyB0aGUgVjggQnJlYWsgSXRlcmF0b3IuIFRoZSBWOCBjaGVja1xyXG4vLyBpcyBuZWNlc3NhcnkgdG8gZGV0ZWN0IGFsbCBCbGluayBiYXNlZCBicm93c2Vycy5cclxubGV0IGhhc1Y4QnJlYWtJdGVyYXRvcjogYm9vbGVhbjtcclxuXHJcbi8vIFdlIG5lZWQgYSB0cnkvY2F0Y2ggYXJvdW5kIHRoZSByZWZlcmVuY2UgdG8gYEludGxgLCBiZWNhdXNlIGFjY2Vzc2luZyBpdCBpbiBzb21lIGNhc2VzIGNhblxyXG4vLyBjYXVzZSBJRSB0byB0aHJvdy4gVGhlc2UgY2FzZXMgYXJlIHRpZWQgdG8gcGFydGljdWxhciB2ZXJzaW9ucyBvZiBXaW5kb3dzIGFuZCBjYW4gaGFwcGVuIGlmXHJcbi8vIHRoZSBjb25zdW1lciBpcyBwcm92aWRpbmcgYSBwb2x5ZmlsbGVkIGBNYXBgLiBTZWU6XHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvQ2hha3JhQ29yZS9pc3N1ZXMvMzE4OVxyXG4vLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL2lzc3Vlcy8xNTY4N1xyXG50cnkge1xyXG4gIGhhc1Y4QnJlYWtJdGVyYXRvciA9ICh0eXBlb2YgSW50bCAhPT0gJ3VuZGVmaW5lZCcgJiYgKEludGwgYXMgYW55KS52OEJyZWFrSXRlcmF0b3IpO1xyXG59IGNhdGNoIHtcclxuICBoYXNWOEJyZWFrSXRlcmF0b3IgPSBmYWxzZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNlcnZpY2UgdG8gZGV0ZWN0IHRoZSBjdXJyZW50IHBsYXRmb3JtIGJ5IGNvbXBhcmluZyB0aGUgdXNlckFnZW50IHN0cmluZ3MgYW5kXHJcbiAqIGNoZWNraW5nIGJyb3dzZXItc3BlY2lmaWMgZ2xvYmFsIHByb3BlcnRpZXMuXHJcbiAqL1xyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIFBsYXRmb3JtIHtcclxuICAvLyBXZSB3YW50IHRvIHVzZSB0aGUgQW5ndWxhciBwbGF0Zm9ybSBjaGVjayBiZWNhdXNlIGlmIHRoZSBEb2N1bWVudCBpcyBzaGltbWVkXHJcbiAgLy8gd2l0aG91dCB0aGUgbmF2aWdhdG9yLCB0aGUgZm9sbG93aW5nIGNoZWNrcyB3aWxsIGZhaWwuIFRoaXMgaXMgcHJlZmVycmVkIGJlY2F1c2VcclxuICAvLyBzb21ldGltZXMgdGhlIERvY3VtZW50IG1heSBiZSBzaGltbWVkIHdpdGhvdXQgdGhlIHVzZXIncyBrbm93bGVkZ2Ugb3IgaW50ZW50aW9uXHJcbiAgLyoqIFdoZXRoZXIgdGhlIEFuZ3VsYXIgYXBwbGljYXRpb24gaXMgYmVpbmcgcmVuZGVyZWQgaW4gdGhlIGJyb3dzZXIuICovXHJcbiAgaXNCcm93c2VyOiBib29sZWFuID0gdGhpcy5fcGxhdGZvcm1JZCA/XHJcbiAgICAgIGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMuX3BsYXRmb3JtSWQpIDogdHlwZW9mIGRvY3VtZW50ID09PSAnb2JqZWN0JyAmJiAhIWRvY3VtZW50O1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgY3VycmVudCBicm93c2VyIGlzIE1pY3Jvc29mdCBFZGdlLiAqL1xyXG4gIEVER0U6IGJvb2xlYW4gPSB0aGlzLmlzQnJvd3NlciAmJiAvKGVkZ2UpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGN1cnJlbnQgcmVuZGVyaW5nIGVuZ2luZSBpcyBNaWNyb3NvZnQgVHJpZGVudC4gKi9cclxuICBUUklERU5UOiBib29sZWFuID0gdGhpcy5pc0Jyb3dzZXIgJiYgLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcclxuXHJcbiAgLy8gRWRnZUhUTUwgYW5kIFRyaWRlbnQgbW9jayBCbGluayBzcGVjaWZpYyB0aGluZ3MgYW5kIG5lZWQgdG8gYmUgZXhjbHVkZWQgZnJvbSB0aGlzIGNoZWNrLlxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjdXJyZW50IHJlbmRlcmluZyBlbmdpbmUgaXMgQmxpbmsuICovXHJcbiAgQkxJTks6IGJvb2xlYW4gPSB0aGlzLmlzQnJvd3NlciAmJiAoISEoKHdpbmRvdyBhcyBhbnkpLmNocm9tZSB8fCBoYXNWOEJyZWFrSXRlcmF0b3IpICYmXHJcbiAgICAgIHR5cGVvZiBDU1MgIT09ICd1bmRlZmluZWQnICYmICF0aGlzLkVER0UgJiYgIXRoaXMuVFJJREVOVCk7XHJcblxyXG4gIC8vIFdlYmtpdCBpcyBwYXJ0IG9mIHRoZSB1c2VyQWdlbnQgaW4gRWRnZUhUTUwsIEJsaW5rIGFuZCBUcmlkZW50LiBUaGVyZWZvcmUgd2UgbmVlZCB0b1xyXG4gIC8vIGVuc3VyZSB0aGF0IFdlYmtpdCBydW5zIHN0YW5kYWxvbmUgYW5kIGlzIG5vdCB1c2VkIGFzIGFub3RoZXIgZW5naW5lJ3MgYmFzZS5cclxuICAvKiogV2hldGhlciB0aGUgY3VycmVudCByZW5kZXJpbmcgZW5naW5lIGlzIFdlYktpdC4gKi9cclxuICBXRUJLSVQ6IGJvb2xlYW4gPSB0aGlzLmlzQnJvd3NlciAmJlxyXG4gICAgICAvQXBwbGVXZWJLaXQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICF0aGlzLkJMSU5LICYmICF0aGlzLkVER0UgJiYgIXRoaXMuVFJJREVOVDtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGN1cnJlbnQgcGxhdGZvcm0gaXMgQXBwbGUgaU9TLiAqL1xyXG4gIElPUzogYm9vbGVhbiA9IHRoaXMuaXNCcm93c2VyICYmIC9pUGFkfGlQaG9uZXxpUG9kLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmXHJcbiAgICAgICEoJ01TU3RyZWFtJyBpbiB3aW5kb3cpO1xyXG5cclxuICAvLyBJdCdzIGRpZmZpY3VsdCB0byBkZXRlY3QgdGhlIHBsYWluIEdlY2tvIGVuZ2luZSwgYmVjYXVzZSBtb3N0IG9mIHRoZSBicm93c2VycyBpZGVudGlmeVxyXG4gIC8vIHRoZW0gc2VsZiBhcyBHZWNrby1saWtlIGJyb3dzZXJzIGFuZCBtb2RpZnkgdGhlIHVzZXJBZ2VudCdzIGFjY29yZGluZyB0byB0aGF0LlxyXG4gIC8vIFNpbmNlIHdlIG9ubHkgY292ZXIgb25lIGV4cGxpY2l0IEZpcmVmb3ggY2FzZSwgd2UgY2FuIHNpbXBseSBjaGVjayBmb3IgRmlyZWZveFxyXG4gIC8vIGluc3RlYWQgb2YgaGF2aW5nIGFuIHVuc3RhYmxlIGNoZWNrIGZvciBHZWNrby5cclxuICAvKiogV2hldGhlciB0aGUgY3VycmVudCBicm93c2VyIGlzIEZpcmVmb3guICovXHJcbiAgRklSRUZPWDogYm9vbGVhbiA9IHRoaXMuaXNCcm93c2VyICYmIC8oZmlyZWZveHxtaW5lZmllbGQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIGN1cnJlbnQgcGxhdGZvcm0gaXMgQW5kcm9pZC4gKi9cclxuICAvLyBUcmlkZW50IG9uIG1vYmlsZSBhZGRzIHRoZSBhbmRyb2lkIHBsYXRmb3JtIHRvIHRoZSB1c2VyQWdlbnQgdG8gdHJpY2sgZGV0ZWN0aW9ucy5cclxuICBBTkRST0lEOiBib29sZWFuID0gdGhpcy5pc0Jyb3dzZXIgJiYgL2FuZHJvaWQvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICF0aGlzLlRSSURFTlQ7XHJcblxyXG4gIC8vIFNhZmFyaSBicm93c2VycyB3aWxsIGluY2x1ZGUgdGhlIFNhZmFyaSBrZXl3b3JkIGluIHRoZWlyIHVzZXJBZ2VudC4gU29tZSBicm93c2VycyBtYXkgZmFrZVxyXG4gIC8vIHRoaXMgYW5kIGp1c3QgcGxhY2UgdGhlIFNhZmFyaSBrZXl3b3JkIGluIHRoZSB1c2VyQWdlbnQuIFRvIGJlIG1vcmUgc2FmZSBhYm91dCBTYWZhcmkgZXZlcnlcclxuICAvLyBTYWZhcmkgYnJvd3NlciBzaG91bGQgYWxzbyB1c2UgV2Via2l0IGFzIGl0cyBsYXlvdXQgZW5naW5lLlxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjdXJyZW50IGJyb3dzZXIgaXMgU2FmYXJpLiAqL1xyXG4gIFNBRkFSSTogYm9vbGVhbiA9IHRoaXMuaXNCcm93c2VyICYmIC9zYWZhcmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmIHRoaXMuV0VCS0lUO1xyXG5cclxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIF9wbGF0Zm9ybUlkOiBPYmplY3QpIHt9XHJcbn1cclxuXHJcbiJdfQ==