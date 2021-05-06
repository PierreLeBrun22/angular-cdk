/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken } from '@angular/core';
export const LIVE_ANNOUNCER_ELEMENT_TOKEN = new InjectionToken('liveAnnouncerElement', {
    providedIn: 'root',
    factory: LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY,
});
/** @docs-private */
export function LIVE_ANNOUNCER_ELEMENT_TOKEN_FACTORY() {
    return null;
}
/** Injection token that can be used to configure the default options for the LiveAnnouncer. */
export const LIVE_ANNOUNCER_DEFAULT_OPTIONS = new InjectionToken('LIVE_ANNOUNCER_DEFAULT_OPTIONS');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1hbm5vdW5jZXItdG9rZW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hMTF5L2xpdmUtYW5ub3VuY2VyL2xpdmUtYW5ub3VuY2VyLXRva2Vucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBUTdDLE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUNyQyxJQUFJLGNBQWMsQ0FBcUIsc0JBQXNCLEVBQUU7SUFDN0QsVUFBVSxFQUFFLE1BQU07SUFDbEIsT0FBTyxFQUFFLG9DQUFvQztDQUM5QyxDQUFDLENBQUM7QUFFUCxvQkFBb0I7QUFDcEIsTUFBTSxVQUFVLG9DQUFvQztJQUNsRCxPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFXRCwrRkFBK0Y7QUFDL0YsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQ3ZDLElBQUksY0FBYyxDQUE4QixnQ0FBZ0MsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0luamVjdGlvblRva2VufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbi8vIFRoZSB0b2tlbnMgZm9yIHRoZSBsaXZlIGFubm91bmNlciBhcmUgZGVmaW5lZCBpbiBhIHNlcGFyYXRlIGZpbGUgZnJvbSBMaXZlQW5ub3VuY2VyXHJcbi8vIGFzIGEgd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMjI1NTlcclxuXHJcbi8qKiBQb3NzaWJsZSBwb2xpdGVuZXNzIGxldmVscy4gKi9cclxuZXhwb3J0IHR5cGUgQXJpYUxpdmVQb2xpdGVuZXNzID0gJ29mZicgfCAncG9saXRlJyB8ICdhc3NlcnRpdmUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IExJVkVfQU5OT1VOQ0VSX0VMRU1FTlRfVE9LRU4gPVxyXG4gICAgbmV3IEluamVjdGlvblRva2VuPEhUTUxFbGVtZW50IHwgbnVsbD4oJ2xpdmVBbm5vdW5jZXJFbGVtZW50Jywge1xyXG4gICAgICBwcm92aWRlZEluOiAncm9vdCcsXHJcbiAgICAgIGZhY3Rvcnk6IExJVkVfQU5OT1VOQ0VSX0VMRU1FTlRfVE9LRU5fRkFDVE9SWSxcclxuICAgIH0pO1xyXG5cclxuLyoqIEBkb2NzLXByaXZhdGUgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIExJVkVfQU5OT1VOQ0VSX0VMRU1FTlRfVE9LRU5fRkFDVE9SWSgpOiBudWxsIHtcclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5cclxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciB0aGUgTGl2ZUFubm91bmNlci4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMaXZlQW5ub3VuY2VyRGVmYXVsdE9wdGlvbnMge1xyXG4gIC8qKiBEZWZhdWx0IHBvbGl0ZW5lc3MgZm9yIHRoZSBhbm5vdW5jZW1lbnRzLiAqL1xyXG4gIHBvbGl0ZW5lc3M/OiBBcmlhTGl2ZVBvbGl0ZW5lc3M7XHJcblxyXG4gIC8qKiBEZWZhdWx0IGR1cmF0aW9uIGZvciB0aGUgYW5ub3VuY2VtZW50IG1lc3NhZ2VzLiAqL1xyXG4gIGR1cmF0aW9uPzogbnVtYmVyO1xyXG59XHJcblxyXG4vKiogSW5qZWN0aW9uIHRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29uZmlndXJlIHRoZSBkZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBMaXZlQW5ub3VuY2VyLiAqL1xyXG5leHBvcnQgY29uc3QgTElWRV9BTk5PVU5DRVJfREVGQVVMVF9PUFRJT05TID1cclxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxMaXZlQW5ub3VuY2VyRGVmYXVsdE9wdGlvbnM+KCdMSVZFX0FOTk9VTkNFUl9ERUZBVUxUX09QVElPTlMnKTtcclxuIl19