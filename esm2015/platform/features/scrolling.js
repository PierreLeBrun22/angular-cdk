/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Cached result of the way the browser handles the horizontal scroll axis in RTL mode. */
let rtlScrollAxisType;
/** Cached result of the check that indicates whether the browser supports scroll behaviors. */
let scrollBehaviorSupported;
/** Check whether the browser supports scroll behaviors. */
export function supportsScrollBehavior() {
    if (scrollBehaviorSupported == null) {
        // If we're not in the browser, it can't be supported. Also check for `Element`, because
        // some projects stub out the global `document` during SSR which can throw us off.
        if (typeof document !== 'object' || !document || typeof Element !== 'function' || !Element) {
            scrollBehaviorSupported = false;
            return scrollBehaviorSupported;
        }
        // If the element can have a `scrollBehavior` style, we can be sure that it's supported.
        if ('scrollBehavior' in document.documentElement.style) {
            scrollBehaviorSupported = true;
        }
        else {
            // At this point we have 3 possibilities: `scrollTo` isn't supported at all, it's
            // supported but it doesn't handle scroll behavior, or it has been polyfilled.
            const scrollToFunction = Element.prototype.scrollTo;
            if (scrollToFunction) {
                // We can detect if the function has been polyfilled by calling `toString` on it. Native
                // functions are obfuscated using `[native code]`, whereas if it was overwritten we'd get
                // the actual function source. Via https://davidwalsh.name/detect-native-function. Consider
                // polyfilled functions as supporting scroll behavior.
                scrollBehaviorSupported = !/\{\s*\[native code\]\s*\}/.test(scrollToFunction.toString());
            }
            else {
                scrollBehaviorSupported = false;
            }
        }
    }
    return scrollBehaviorSupported;
}
/**
 * Checks the type of RTL scroll axis used by this browser. As of time of writing, Chrome is NORMAL,
 * Firefox & Safari are NEGATED, and IE & Edge are INVERTED.
 */
export function getRtlScrollAxisType() {
    // We can't check unless we're on the browser. Just assume 'normal' if we're not.
    if (typeof document !== 'object' || !document) {
        return 0 /* NORMAL */;
    }
    if (rtlScrollAxisType == null) {
        // Create a 1px wide scrolling container and a 2px wide content element.
        const scrollContainer = document.createElement('div');
        const containerStyle = scrollContainer.style;
        scrollContainer.dir = 'rtl';
        containerStyle.width = '1px';
        containerStyle.overflow = 'auto';
        containerStyle.visibility = 'hidden';
        containerStyle.pointerEvents = 'none';
        containerStyle.position = 'absolute';
        const content = document.createElement('div');
        const contentStyle = content.style;
        contentStyle.width = '2px';
        contentStyle.height = '1px';
        scrollContainer.appendChild(content);
        document.body.appendChild(scrollContainer);
        rtlScrollAxisType = 0 /* NORMAL */;
        // The viewport starts scrolled all the way to the right in RTL mode. If we are in a NORMAL
        // browser this would mean that the scrollLeft should be 1. If it's zero instead we know we're
        // dealing with one of the other two types of browsers.
        if (scrollContainer.scrollLeft === 0) {
            // In a NEGATED browser the scrollLeft is always somewhere in [-maxScrollAmount, 0]. For an
            // INVERTED browser it is always somewhere in [0, maxScrollAmount]. We can determine which by
            // setting to the scrollLeft to 1. This is past the max for a NEGATED browser, so it will
            // return 0 when we read it again.
            scrollContainer.scrollLeft = 1;
            rtlScrollAxisType =
                scrollContainer.scrollLeft === 0 ? 1 /* NEGATED */ : 2 /* INVERTED */;
        }
        scrollContainer.parentNode.removeChild(scrollContainer);
    }
    return rtlScrollAxisType;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9wbGF0Zm9ybS9mZWF0dXJlcy9zY3JvbGxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBcUJILDJGQUEyRjtBQUMzRixJQUFJLGlCQUE4QyxDQUFDO0FBRW5ELCtGQUErRjtBQUMvRixJQUFJLHVCQUEwQyxDQUFDO0FBRS9DLDJEQUEyRDtBQUMzRCxNQUFNLFVBQVUsc0JBQXNCO0lBQ3BDLElBQUksdUJBQXVCLElBQUksSUFBSSxFQUFFO1FBQ25DLHdGQUF3RjtRQUN4RixrRkFBa0Y7UUFDbEYsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxRQUFRLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzFGLHVCQUF1QixHQUFHLEtBQUssQ0FBQztZQUNoQyxPQUFPLHVCQUF1QixDQUFDO1NBQ2hDO1FBRUQsd0ZBQXdGO1FBQ3hGLElBQUksZ0JBQWdCLElBQUksUUFBUSxDQUFDLGVBQWdCLENBQUMsS0FBSyxFQUFFO1lBQ3ZELHVCQUF1QixHQUFHLElBQUksQ0FBQztTQUNoQzthQUFNO1lBQ0wsaUZBQWlGO1lBQ2pGLDhFQUE4RTtZQUM5RSxNQUFNLGdCQUFnQixHQUF1QixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUV4RSxJQUFJLGdCQUFnQixFQUFFO2dCQUNwQix3RkFBd0Y7Z0JBQ3hGLHlGQUF5RjtnQkFDekYsMkZBQTJGO2dCQUMzRixzREFBc0Q7Z0JBQ3RELHVCQUF1QixHQUFHLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7YUFDMUY7aUJBQU07Z0JBQ0wsdUJBQXVCLEdBQUcsS0FBSyxDQUFDO2FBQ2pDO1NBQ0Y7S0FDRjtJQUVELE9BQU8sdUJBQXVCLENBQUM7QUFDakMsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxvQkFBb0I7SUFDbEMsaUZBQWlGO0lBQ2pGLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQzdDLHNCQUFnQztLQUNqQztJQUVELElBQUksaUJBQWlCLElBQUksSUFBSSxFQUFFO1FBQzdCLHdFQUF3RTtRQUN4RSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RELE1BQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUM7UUFDN0MsZUFBZSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDNUIsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDN0IsY0FBYyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7UUFDakMsY0FBYyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDckMsY0FBYyxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7UUFDdEMsY0FBYyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFFckMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ25DLFlBQVksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzNCLFlBQVksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBRTVCLGVBQWUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFM0MsaUJBQWlCLGlCQUEyQixDQUFDO1FBRTdDLDJGQUEyRjtRQUMzRiw4RkFBOEY7UUFDOUYsdURBQXVEO1FBQ3ZELElBQUksZUFBZSxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7WUFDcEMsMkZBQTJGO1lBQzNGLDZGQUE2RjtZQUM3Rix5RkFBeUY7WUFDekYsa0NBQWtDO1lBQ2xDLGVBQWUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQy9CLGlCQUFpQjtnQkFDYixlQUFlLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLGlCQUEyQixDQUFDLGlCQUEyQixDQUFDO1NBQy9GO1FBRUQsZUFBZSxDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7S0FDMUQ7SUFDRCxPQUFPLGlCQUFpQixDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbi8qKiBUaGUgcG9zc2libGUgd2F5cyB0aGUgYnJvd3NlciBtYXkgaGFuZGxlIHRoZSBob3Jpem9udGFsIHNjcm9sbCBheGlzIGluIFJUTCBsYW5ndWFnZXMuICovXHJcbmV4cG9ydCBjb25zdCBlbnVtIFJ0bFNjcm9sbEF4aXNUeXBlIHtcclxuICAvKipcclxuICAgKiBzY3JvbGxMZWZ0IGlzIDAgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSBsZWZ0IGFuZCAoc2Nyb2xsV2lkdGggLSBjbGllbnRXaWR0aCkgd2hlbiBzY3JvbGxlZFxyXG4gICAqIGFsbCB0aGUgd2F5IHJpZ2h0LlxyXG4gICAqL1xyXG4gIE5PUk1BTCxcclxuICAvKipcclxuICAgKiBzY3JvbGxMZWZ0IGlzIC0oc2Nyb2xsV2lkdGggLSBjbGllbnRXaWR0aCkgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSBsZWZ0IGFuZCAwIHdoZW4gc2Nyb2xsZWRcclxuICAgKiBhbGwgdGhlIHdheSByaWdodC5cclxuICAgKi9cclxuICBORUdBVEVELFxyXG4gIC8qKlxyXG4gICAqIHNjcm9sbExlZnQgaXMgKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMCB3aGVuIHNjcm9sbGVkXHJcbiAgICogYWxsIHRoZSB3YXkgcmlnaHQuXHJcbiAgICovXHJcbiAgSU5WRVJURURcclxufVxyXG5cclxuLyoqIENhY2hlZCByZXN1bHQgb2YgdGhlIHdheSB0aGUgYnJvd3NlciBoYW5kbGVzIHRoZSBob3Jpem9udGFsIHNjcm9sbCBheGlzIGluIFJUTCBtb2RlLiAqL1xyXG5sZXQgcnRsU2Nyb2xsQXhpc1R5cGU6IFJ0bFNjcm9sbEF4aXNUeXBlfHVuZGVmaW5lZDtcclxuXHJcbi8qKiBDYWNoZWQgcmVzdWx0IG9mIHRoZSBjaGVjayB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHNjcm9sbCBiZWhhdmlvcnMuICovXHJcbmxldCBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZDogYm9vbGVhbnx1bmRlZmluZWQ7XHJcblxyXG4vKiogQ2hlY2sgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyBzY3JvbGwgYmVoYXZpb3JzLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc3VwcG9ydHNTY3JvbGxCZWhhdmlvcigpOiBib29sZWFuIHtcclxuICBpZiAoc2Nyb2xsQmVoYXZpb3JTdXBwb3J0ZWQgPT0gbnVsbCkge1xyXG4gICAgLy8gSWYgd2UncmUgbm90IGluIHRoZSBicm93c2VyLCBpdCBjYW4ndCBiZSBzdXBwb3J0ZWQuIEFsc28gY2hlY2sgZm9yIGBFbGVtZW50YCwgYmVjYXVzZVxyXG4gICAgLy8gc29tZSBwcm9qZWN0cyBzdHViIG91dCB0aGUgZ2xvYmFsIGBkb2N1bWVudGAgZHVyaW5nIFNTUiB3aGljaCBjYW4gdGhyb3cgdXMgb2ZmLlxyXG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ29iamVjdCcgfHwgIWRvY3VtZW50IHx8IHR5cGVvZiBFbGVtZW50ICE9PSAnZnVuY3Rpb24nIHx8ICFFbGVtZW50KSB7XHJcbiAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gZmFsc2U7XHJcbiAgICAgIHJldHVybiBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGUgZWxlbWVudCBjYW4gaGF2ZSBhIGBzY3JvbGxCZWhhdmlvcmAgc3R5bGUsIHdlIGNhbiBiZSBzdXJlIHRoYXQgaXQncyBzdXBwb3J0ZWQuXHJcbiAgICBpZiAoJ3Njcm9sbEJlaGF2aW9yJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQhLnN0eWxlKSB7XHJcbiAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSAzIHBvc3NpYmlsaXRpZXM6IGBzY3JvbGxUb2AgaXNuJ3Qgc3VwcG9ydGVkIGF0IGFsbCwgaXQnc1xyXG4gICAgICAvLyBzdXBwb3J0ZWQgYnV0IGl0IGRvZXNuJ3QgaGFuZGxlIHNjcm9sbCBiZWhhdmlvciwgb3IgaXQgaGFzIGJlZW4gcG9seWZpbGxlZC5cclxuICAgICAgY29uc3Qgc2Nyb2xsVG9GdW5jdGlvbjogRnVuY3Rpb258dW5kZWZpbmVkID0gRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG87XHJcblxyXG4gICAgICBpZiAoc2Nyb2xsVG9GdW5jdGlvbikge1xyXG4gICAgICAgIC8vIFdlIGNhbiBkZXRlY3QgaWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIHBvbHlmaWxsZWQgYnkgY2FsbGluZyBgdG9TdHJpbmdgIG9uIGl0LiBOYXRpdmVcclxuICAgICAgICAvLyBmdW5jdGlvbnMgYXJlIG9iZnVzY2F0ZWQgdXNpbmcgYFtuYXRpdmUgY29kZV1gLCB3aGVyZWFzIGlmIGl0IHdhcyBvdmVyd3JpdHRlbiB3ZSdkIGdldFxyXG4gICAgICAgIC8vIHRoZSBhY3R1YWwgZnVuY3Rpb24gc291cmNlLiBWaWEgaHR0cHM6Ly9kYXZpZHdhbHNoLm5hbWUvZGV0ZWN0LW5hdGl2ZS1mdW5jdGlvbi4gQ29uc2lkZXJcclxuICAgICAgICAvLyBwb2x5ZmlsbGVkIGZ1bmN0aW9ucyBhcyBzdXBwb3J0aW5nIHNjcm9sbCBiZWhhdmlvci5cclxuICAgICAgICBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZCA9ICEvXFx7XFxzKlxcW25hdGl2ZSBjb2RlXFxdXFxzKlxcfS8udGVzdChzY3JvbGxUb0Z1bmN0aW9uLnRvU3RyaW5nKCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNjcm9sbEJlaGF2aW9yU3VwcG9ydGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBzY3JvbGxCZWhhdmlvclN1cHBvcnRlZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB0aGUgdHlwZSBvZiBSVEwgc2Nyb2xsIGF4aXMgdXNlZCBieSB0aGlzIGJyb3dzZXIuIEFzIG9mIHRpbWUgb2Ygd3JpdGluZywgQ2hyb21lIGlzIE5PUk1BTCxcclxuICogRmlyZWZveCAmIFNhZmFyaSBhcmUgTkVHQVRFRCwgYW5kIElFICYgRWRnZSBhcmUgSU5WRVJURUQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0UnRsU2Nyb2xsQXhpc1R5cGUoKTogUnRsU2Nyb2xsQXhpc1R5cGUge1xyXG4gIC8vIFdlIGNhbid0IGNoZWNrIHVubGVzcyB3ZSdyZSBvbiB0aGUgYnJvd3Nlci4gSnVzdCBhc3N1bWUgJ25vcm1hbCcgaWYgd2UncmUgbm90LlxyXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICdvYmplY3QnIHx8ICFkb2N1bWVudCkge1xyXG4gICAgcmV0dXJuIFJ0bFNjcm9sbEF4aXNUeXBlLk5PUk1BTDtcclxuICB9XHJcblxyXG4gIGlmIChydGxTY3JvbGxBeGlzVHlwZSA9PSBudWxsKSB7XHJcbiAgICAvLyBDcmVhdGUgYSAxcHggd2lkZSBzY3JvbGxpbmcgY29udGFpbmVyIGFuZCBhIDJweCB3aWRlIGNvbnRlbnQgZWxlbWVudC5cclxuICAgIGNvbnN0IHNjcm9sbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgY29uc3QgY29udGFpbmVyU3R5bGUgPSBzY3JvbGxDb250YWluZXIuc3R5bGU7XHJcbiAgICBzY3JvbGxDb250YWluZXIuZGlyID0gJ3J0bCc7XHJcbiAgICBjb250YWluZXJTdHlsZS53aWR0aCA9ICcxcHgnO1xyXG4gICAgY29udGFpbmVyU3R5bGUub3ZlcmZsb3cgPSAnYXV0byc7XHJcbiAgICBjb250YWluZXJTdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICBjb250YWluZXJTdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgY29udGFpbmVyU3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGNvbnRlbnQuc3R5bGU7XHJcbiAgICBjb250ZW50U3R5bGUud2lkdGggPSAnMnB4JztcclxuICAgIGNvbnRlbnRTdHlsZS5oZWlnaHQgPSAnMXB4JztcclxuXHJcbiAgICBzY3JvbGxDb250YWluZXIuYXBwZW5kQ2hpbGQoY29udGVudCk7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcm9sbENvbnRhaW5lcik7XHJcblxyXG4gICAgcnRsU2Nyb2xsQXhpc1R5cGUgPSBSdGxTY3JvbGxBeGlzVHlwZS5OT1JNQUw7XHJcblxyXG4gICAgLy8gVGhlIHZpZXdwb3J0IHN0YXJ0cyBzY3JvbGxlZCBhbGwgdGhlIHdheSB0byB0aGUgcmlnaHQgaW4gUlRMIG1vZGUuIElmIHdlIGFyZSBpbiBhIE5PUk1BTFxyXG4gICAgLy8gYnJvd3NlciB0aGlzIHdvdWxkIG1lYW4gdGhhdCB0aGUgc2Nyb2xsTGVmdCBzaG91bGQgYmUgMS4gSWYgaXQncyB6ZXJvIGluc3RlYWQgd2Uga25vdyB3ZSdyZVxyXG4gICAgLy8gZGVhbGluZyB3aXRoIG9uZSBvZiB0aGUgb3RoZXIgdHdvIHR5cGVzIG9mIGJyb3dzZXJzLlxyXG4gICAgaWYgKHNjcm9sbENvbnRhaW5lci5zY3JvbGxMZWZ0ID09PSAwKSB7XHJcbiAgICAgIC8vIEluIGEgTkVHQVRFRCBicm93c2VyIHRoZSBzY3JvbGxMZWZ0IGlzIGFsd2F5cyBzb21ld2hlcmUgaW4gWy1tYXhTY3JvbGxBbW91bnQsIDBdLiBGb3IgYW5cclxuICAgICAgLy8gSU5WRVJURUQgYnJvd3NlciBpdCBpcyBhbHdheXMgc29tZXdoZXJlIGluIFswLCBtYXhTY3JvbGxBbW91bnRdLiBXZSBjYW4gZGV0ZXJtaW5lIHdoaWNoIGJ5XHJcbiAgICAgIC8vIHNldHRpbmcgdG8gdGhlIHNjcm9sbExlZnQgdG8gMS4gVGhpcyBpcyBwYXN0IHRoZSBtYXggZm9yIGEgTkVHQVRFRCBicm93c2VyLCBzbyBpdCB3aWxsXHJcbiAgICAgIC8vIHJldHVybiAwIHdoZW4gd2UgcmVhZCBpdCBhZ2Fpbi5cclxuICAgICAgc2Nyb2xsQ29udGFpbmVyLnNjcm9sbExlZnQgPSAxO1xyXG4gICAgICBydGxTY3JvbGxBeGlzVHlwZSA9XHJcbiAgICAgICAgICBzY3JvbGxDb250YWluZXIuc2Nyb2xsTGVmdCA9PT0gMCA/IFJ0bFNjcm9sbEF4aXNUeXBlLk5FR0FURUQgOiBSdGxTY3JvbGxBeGlzVHlwZS5JTlZFUlRFRDtcclxuICAgIH1cclxuXHJcbiAgICBzY3JvbGxDb250YWluZXIucGFyZW50Tm9kZSEucmVtb3ZlQ2hpbGQoc2Nyb2xsQ29udGFpbmVyKTtcclxuICB9XHJcbiAgcmV0dXJuIHJ0bFNjcm9sbEF4aXNUeXBlO1xyXG59XHJcbiJdfQ==