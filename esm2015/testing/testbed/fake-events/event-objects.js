/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Creates a browser MouseEvent with the specified options.
 * @docs-private
 */
export function createMouseEvent(type, clientX = 0, clientY = 0, button = 0, modifiers = {}) {
    const event = document.createEvent('MouseEvent');
    const originalPreventDefault = event.preventDefault.bind(event);
    // Note: We cannot determine the position of the mouse event based on the screen
    // because the dimensions and position of the browser window are not available
    // To provide reasonable `screenX` and `screenY` coordinates, we simply use the
    // client coordinates as if the browser is opened in fullscreen.
    const screenX = clientX;
    const screenY = clientY;
    event.initMouseEvent(type, 
    /* canBubble */ true, 
    /* cancelable */ true, 
    /* view */ window, 
    /* detail */ 0, 
    /* screenX */ screenX, 
    /* screenY */ screenY, 
    /* clientX */ clientX, 
    /* clientY */ clientY, 
    /* ctrlKey */ !!modifiers.control, 
    /* altKey */ !!modifiers.alt, 
    /* shiftKey */ !!modifiers.shift, 
    /* metaKey */ !!modifiers.meta, 
    /* button */ button, 
    /* relatedTarget */ null);
    // `initMouseEvent` doesn't allow us to pass the `buttons` and
    // defaults it to 0 which looks like a fake event.
    defineReadonlyEventProperty(event, 'buttons', 1);
    // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
    event.preventDefault = function () {
        defineReadonlyEventProperty(event, 'defaultPrevented', true);
        return originalPreventDefault();
    };
    return event;
}
/**
 * Creates a browser `PointerEvent` with the specified options. Pointer events
 * by default will appear as if they are the primary pointer of their type.
 * https://www.w3.org/TR/pointerevents2/#dom-pointerevent-isprimary.
 *
 * For example, if pointer events for a multi-touch interaction are created, the non-primary
 * pointer touches would need to be represented by non-primary pointer events.
 *
 * @docs-private
 */
export function createPointerEvent(type, clientX = 0, clientY = 0, options = { isPrimary: true }) {
    return new PointerEvent(type, Object.assign({ bubbles: true, cancelable: true, view: window, clientX,
        clientY }, options));
}
/**
 * Creates a browser TouchEvent with the specified pointer coordinates.
 * @docs-private
 */
export function createTouchEvent(type, pageX = 0, pageY = 0) {
    // In favor of creating events that work for most of the browsers, the event is created
    // as a basic UI Event. The necessary details for the event will be set manually.
    const event = document.createEvent('UIEvent');
    const touchDetails = { pageX, pageY };
    // TS3.6 removes the initUIEvent method and suggests porting to "new UIEvent()".
    event.initUIEvent(type, true, true, window, 0);
    // Most of the browsers don't have a "initTouchEvent" method that can be used to define
    // the touch details.
    defineReadonlyEventProperty(event, 'touches', [touchDetails]);
    defineReadonlyEventProperty(event, 'targetTouches', [touchDetails]);
    defineReadonlyEventProperty(event, 'changedTouches', [touchDetails]);
    return event;
}
/**
 * Creates a keyboard event with the specified key and modifiers.
 * @docs-private
 */
export function createKeyboardEvent(type, keyCode = 0, key = '', modifiers = {}) {
    const event = document.createEvent('KeyboardEvent');
    const originalPreventDefault = event.preventDefault.bind(event);
    // Firefox does not support `initKeyboardEvent`, but supports `initKeyEvent`.
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyEvent.
    if (event.initKeyEvent !== undefined) {
        event.initKeyEvent(type, true, true, window, modifiers.control, modifiers.alt, modifiers.shift, modifiers.meta, keyCode);
    }
    else {
        // `initKeyboardEvent` expects to receive modifiers as a whitespace-delimited string
        // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent
        let modifiersList = '';
        if (modifiers.control) {
            modifiersList += 'Control ';
        }
        if (modifiers.alt) {
            modifiersList += 'Alt ';
        }
        if (modifiers.shift) {
            modifiersList += 'Shift ';
        }
        if (modifiers.meta) {
            modifiersList += 'Meta ';
        }
        // TS3.6 removed the `initKeyboardEvent` method and suggested porting to
        // `new KeyboardEvent()` constructor. We cannot use that as we support IE11.
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/initKeyboardEvent.
        event.initKeyboardEvent(type, true, /* canBubble */ true, /* cancelable */ window, /* view */ 0, /* char */ key, /* key */ 0, /* location */ modifiersList.trim(), /* modifiersList */ false /* repeat */);
    }
    // Webkit Browsers don't set the keyCode when calling the init function.
    // See related bug https://bugs.webkit.org/show_bug.cgi?id=16735
    defineReadonlyEventProperty(event, 'keyCode', keyCode);
    defineReadonlyEventProperty(event, 'key', key);
    defineReadonlyEventProperty(event, 'ctrlKey', !!modifiers.control);
    defineReadonlyEventProperty(event, 'altKey', !!modifiers.alt);
    defineReadonlyEventProperty(event, 'shiftKey', !!modifiers.shift);
    defineReadonlyEventProperty(event, 'metaKey', !!modifiers.meta);
    // IE won't set `defaultPrevented` on synthetic events so we need to do it manually.
    event.preventDefault = function () {
        defineReadonlyEventProperty(event, 'defaultPrevented', true);
        return originalPreventDefault();
    };
    return event;
}
/**
 * Creates a fake event object with any desired event type.
 * @docs-private
 */
export function createFakeEvent(type, canBubble = false, cancelable = true) {
    const event = document.createEvent('Event');
    event.initEvent(type, canBubble, cancelable);
    return event;
}
/**
 * Defines a readonly property on the given event object. Readonly properties on an event object
 * are always set as configurable as that matches default readonly properties for DOM event objects.
 */
function defineReadonlyEventProperty(event, propertyName, value) {
    Object.defineProperty(event, propertyName, { get: () => value, configurable: true });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtb2JqZWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGVzdGluZy90ZXN0YmVkL2Zha2UtZXZlbnRzL2V2ZW50LW9iamVjdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUg7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGdCQUFnQixDQUM5QixJQUFZLEVBQUUsT0FBTyxHQUFHLENBQUMsRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsWUFBMEIsRUFBRTtJQUNoRixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFaEUsZ0ZBQWdGO0lBQ2hGLDhFQUE4RTtJQUM5RSwrRUFBK0U7SUFDL0UsZ0VBQWdFO0lBQ2hFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN4QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFFeEIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJO0lBQ3ZCLGVBQWUsQ0FBQyxJQUFJO0lBQ3BCLGdCQUFnQixDQUFDLElBQUk7SUFDckIsVUFBVSxDQUFDLE1BQU07SUFDakIsWUFBWSxDQUFDLENBQUM7SUFDZCxhQUFhLENBQUMsT0FBTztJQUNyQixhQUFhLENBQUMsT0FBTztJQUNyQixhQUFhLENBQUMsT0FBTztJQUNyQixhQUFhLENBQUMsT0FBTztJQUNyQixhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPO0lBQ2pDLFlBQVksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUc7SUFDNUIsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSztJQUNoQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FB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QkFBc0IsRUFBRSxDQUFDO0lBQ2xDLENBQUMsQ0FBQztJQUVGLE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxlQUFlLENBQUMsSUFBWSxFQUFFLFNBQVMsR0FBRyxLQUFLLEVBQUUsVUFBVSxHQUFHLElBQUk7SUFDaEYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDN0MsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxLQUFZLEVBQUUsWUFBb0IsRUFBRSxLQUFVO0lBQ2pGLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtNb2RpZmllcktleXN9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgYnJvd3NlciBNb3VzZUV2ZW50IHdpdGggdGhlIHNwZWNpZmllZCBvcHRpb25zLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW91c2VFdmVudChcclxuICB0eXBlOiBzdHJpbmcsIGNsaWVudFggPSAwLCBjbGllbnRZID0gMCwgYnV0dG9uID0gMCwgbW9kaWZpZXJzOiBNb2RpZmllcktleXMgPSB7fSkge1xyXG4gIGNvbnN0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcclxuICBjb25zdCBvcmlnaW5hbFByZXZlbnREZWZhdWx0ID0gZXZlbnQucHJldmVudERlZmF1bHQuYmluZChldmVudCk7XHJcblxyXG4gIC8vIE5vdGU6IFdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIHBvc2l0aW9uIG9mIHRoZSBtb3VzZSBldmVudCBiYXNlZCBvbiB0aGUgc2NyZWVuXHJcbiAgLy8gYmVjYXVzZSB0aGUgZGltZW5zaW9ucyBhbmQgcG9zaXRpb24gb2YgdGhlIGJyb3dzZXIgd2luZG93IGFyZSBub3QgYXZhaWxhYmxlXHJcbiAgLy8gVG8gcHJvdmlkZSByZWFzb25hYmxlIGBzY3JlZW5YYCBhbmQgYHNjcmVlbllgIGNvb3JkaW5hdGVzLCB3ZSBzaW1wbHkgdXNlIHRoZVxyXG4gIC8vIGNsaWVudCBjb29yZGluYXRlcyBhcyBpZiB0aGUgYnJvd3NlciBpcyBvcGVuZWQgaW4gZnVsbHNjcmVlbi5cclxuICBjb25zdCBzY3JlZW5YID0gY2xpZW50WDtcclxuICBjb25zdCBzY3JlZW5ZID0gY2xpZW50WTtcclxuXHJcbiAgZXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSxcclxuICAgIC8qIGNhbkJ1YmJsZSAqLyB0cnVlLFxyXG4gICAgLyogY2FuY2VsYWJsZSAqLyB0cnVlLFxyXG4gICAgLyogdmlldyAqLyB3aW5kb3csXHJcbiAgICAvKiBkZXRhaWwgKi8gMCxcclxuICAgIC8qIHNjcmVlblggKi8gc2NyZWVuWCxcclxuICAgIC8qIHNjcmVlblkgKi8gc2NyZWVuWSxcclxuICAgIC8qIGNsaWVudFggKi8gY2xpZW50WCxcclxuICAgIC8qIGNsaWVudFkgKi8gY2xpZW50WSxcclxuICAgIC8qIGN0cmxLZXkgKi8gISFtb2RpZmllcnMuY29udHJvbCxcclxuICAgIC8qIGFsdEtleSAqLyAhIW1vZGlmaWVycy5hbHQsXHJcbiAgICAvKiBzaGlmdEtleSAqLyAhIW1vZGlmaWVycy5zaGlmdCxcclxuICAgIC8qIG1ldGFLZXkgKi8gISFtb2RpZmllcnMubWV0YSxcclxuICAgIC8qIGJ1dHRvbiAqLyBidXR0b24sXHJcbiAgICAvKiByZWxhdGVkVGFyZ2V0ICovIG51bGwpO1xyXG5cclxuICAvLyBgaW5pdE1vdXNlRXZlbnRgIGRvZXNuJ3QgYWxsb3cgdXMgdG8gcGFzcyB0aGUgYGJ1dHRvbnNgIGFuZFxyXG4gIC8vIGRlZmF1bHRzIGl0IHRvIDAgd2hpY2ggbG9va3MgbGlrZSBhIGZha2UgZXZlbnQuXHJcbiAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAnYnV0dG9ucycsIDEpO1xyXG5cclxuICAvLyBJRSB3b24ndCBzZXQgYGRlZmF1bHRQcmV2ZW50ZWRgIG9uIHN5bnRoZXRpYyBldmVudHMgc28gd2UgbmVlZCB0byBkbyBpdCBtYW51YWxseS5cclxuICBldmVudC5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAnZGVmYXVsdFByZXZlbnRlZCcsIHRydWUpO1xyXG4gICAgcmV0dXJuIG9yaWdpbmFsUHJldmVudERlZmF1bHQoKTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gZXZlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgYnJvd3NlciBgUG9pbnRlckV2ZW50YCB3aXRoIHRoZSBzcGVjaWZpZWQgb3B0aW9ucy4gUG9pbnRlciBldmVudHNcclxuICogYnkgZGVmYXVsdCB3aWxsIGFwcGVhciBhcyBpZiB0aGV5IGFyZSB0aGUgcHJpbWFyeSBwb2ludGVyIG9mIHRoZWlyIHR5cGUuXHJcbiAqIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9wb2ludGVyZXZlbnRzMi8jZG9tLXBvaW50ZXJldmVudC1pc3ByaW1hcnkuXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlLCBpZiBwb2ludGVyIGV2ZW50cyBmb3IgYSBtdWx0aS10b3VjaCBpbnRlcmFjdGlvbiBhcmUgY3JlYXRlZCwgdGhlIG5vbi1wcmltYXJ5XHJcbiAqIHBvaW50ZXIgdG91Y2hlcyB3b3VsZCBuZWVkIHRvIGJlIHJlcHJlc2VudGVkIGJ5IG5vbi1wcmltYXJ5IHBvaW50ZXIgZXZlbnRzLlxyXG4gKlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUG9pbnRlckV2ZW50KHR5cGU6IHN0cmluZywgY2xpZW50WCA9IDAsIGNsaWVudFkgPSAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IFBvaW50ZXJFdmVudEluaXQgPSB7aXNQcmltYXJ5OiB0cnVlfSkge1xyXG4gIHJldHVybiBuZXcgUG9pbnRlckV2ZW50KHR5cGUsIHtcclxuICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICBjYW5jZWxhYmxlOiB0cnVlLFxyXG4gICAgdmlldzogd2luZG93LFxyXG4gICAgY2xpZW50WCxcclxuICAgIGNsaWVudFksXHJcbiAgICAuLi5vcHRpb25zLFxyXG4gIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIGJyb3dzZXIgVG91Y2hFdmVudCB3aXRoIHRoZSBzcGVjaWZpZWQgcG9pbnRlciBjb29yZGluYXRlcy5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRvdWNoRXZlbnQodHlwZTogc3RyaW5nLCBwYWdlWCA9IDAsIHBhZ2VZID0gMCkge1xyXG4gIC8vIEluIGZhdm9yIG9mIGNyZWF0aW5nIGV2ZW50cyB0aGF0IHdvcmsgZm9yIG1vc3Qgb2YgdGhlIGJyb3dzZXJzLCB0aGUgZXZlbnQgaXMgY3JlYXRlZFxyXG4gIC8vIGFzIGEgYmFzaWMgVUkgRXZlbnQuIFRoZSBuZWNlc3NhcnkgZGV0YWlscyBmb3IgdGhlIGV2ZW50IHdpbGwgYmUgc2V0IG1hbnVhbGx5LlxyXG4gIGNvbnN0IGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1VJRXZlbnQnKTtcclxuICBjb25zdCB0b3VjaERldGFpbHMgPSB7cGFnZVgsIHBhZ2VZfTtcclxuXHJcbiAgLy8gVFMzLjYgcmVtb3ZlcyB0aGUgaW5pdFVJRXZlbnQgbWV0aG9kIGFuZCBzdWdnZXN0cyBwb3J0aW5nIHRvIFwibmV3IFVJRXZlbnQoKVwiLlxyXG4gIChldmVudCBhcyBhbnkpLmluaXRVSUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMCk7XHJcblxyXG4gIC8vIE1vc3Qgb2YgdGhlIGJyb3dzZXJzIGRvbid0IGhhdmUgYSBcImluaXRUb3VjaEV2ZW50XCIgbWV0aG9kIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGVmaW5lXHJcbiAgLy8gdGhlIHRvdWNoIGRldGFpbHMuXHJcbiAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAndG91Y2hlcycsIFt0b3VjaERldGFpbHNdKTtcclxuICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICd0YXJnZXRUb3VjaGVzJywgW3RvdWNoRGV0YWlsc10pO1xyXG4gIGRlZmluZVJlYWRvbmx5RXZlbnRQcm9wZXJ0eShldmVudCwgJ2NoYW5nZWRUb3VjaGVzJywgW3RvdWNoRGV0YWlsc10pO1xyXG5cclxuICByZXR1cm4gZXZlbnQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEga2V5Ym9hcmQgZXZlbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleSBhbmQgbW9kaWZpZXJzLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5Ym9hcmRFdmVudCh0eXBlOiBzdHJpbmcsIGtleUNvZGU6IG51bWJlciA9IDAsIGtleTogc3RyaW5nID0gJycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyczogTW9kaWZpZXJLZXlzID0ge30pIHtcclxuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdLZXlib2FyZEV2ZW50Jyk7XHJcbiAgY29uc3Qgb3JpZ2luYWxQcmV2ZW50RGVmYXVsdCA9IGV2ZW50LnByZXZlbnREZWZhdWx0LmJpbmQoZXZlbnQpO1xyXG5cclxuICAvLyBGaXJlZm94IGRvZXMgbm90IHN1cHBvcnQgYGluaXRLZXlib2FyZEV2ZW50YCwgYnV0IHN1cHBvcnRzIGBpbml0S2V5RXZlbnRgLlxyXG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50L2luaXRLZXlFdmVudC5cclxuICBpZiAoKGV2ZW50IGFzIGFueSkuaW5pdEtleUV2ZW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgIChldmVudCBhcyBhbnkpLmluaXRLZXlFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIG1vZGlmaWVycy5jb250cm9sLCBtb2RpZmllcnMuYWx0LFxyXG4gICAgICAgIG1vZGlmaWVycy5zaGlmdCwgbW9kaWZpZXJzLm1ldGEsIGtleUNvZGUpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBgaW5pdEtleWJvYXJkRXZlbnRgIGV4cGVjdHMgdG8gcmVjZWl2ZSBtb2RpZmllcnMgYXMgYSB3aGl0ZXNwYWNlLWRlbGltaXRlZCBzdHJpbmdcclxuICAgIC8vIFNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC9pbml0S2V5Ym9hcmRFdmVudFxyXG4gICAgbGV0IG1vZGlmaWVyc0xpc3QgPSAnJztcclxuXHJcbiAgICBpZiAobW9kaWZpZXJzLmNvbnRyb2wpIHtcclxuICAgICAgbW9kaWZpZXJzTGlzdCArPSAnQ29udHJvbCAnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2RpZmllcnMuYWx0KSB7XHJcbiAgICAgIG1vZGlmaWVyc0xpc3QgKz0gJ0FsdCAnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChtb2RpZmllcnMuc2hpZnQpIHtcclxuICAgICAgbW9kaWZpZXJzTGlzdCArPSAnU2hpZnQgJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAobW9kaWZpZXJzLm1ldGEpIHtcclxuICAgICAgbW9kaWZpZXJzTGlzdCArPSAnTWV0YSAnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRTMy42IHJlbW92ZWQgdGhlIGBpbml0S2V5Ym9hcmRFdmVudGAgbWV0aG9kIGFuZCBzdWdnZXN0ZWQgcG9ydGluZyB0b1xyXG4gICAgLy8gYG5ldyBLZXlib2FyZEV2ZW50KClgIGNvbnN0cnVjdG9yLiBXZSBjYW5ub3QgdXNlIHRoYXQgYXMgd2Ugc3VwcG9ydCBJRTExLlxyXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQvaW5pdEtleWJvYXJkRXZlbnQuXHJcbiAgICAoZXZlbnQgYXMgYW55KS5pbml0S2V5Ym9hcmRFdmVudCh0eXBlLFxyXG4gICAgICAgIHRydWUsIC8qIGNhbkJ1YmJsZSAqL1xyXG4gICAgICAgIHRydWUsIC8qIGNhbmNlbGFibGUgKi9cclxuICAgICAgICB3aW5kb3csIC8qIHZpZXcgKi9cclxuICAgICAgICAwLCAvKiBjaGFyICovXHJcbiAgICAgICAga2V5LCAvKiBrZXkgKi9cclxuICAgICAgICAwLCAvKiBsb2NhdGlvbiAqL1xyXG4gICAgICAgIG1vZGlmaWVyc0xpc3QudHJpbSgpLCAvKiBtb2RpZmllcnNMaXN0ICovXHJcbiAgICAgICAgZmFsc2UgLyogcmVwZWF0ICovKTtcclxuICB9XHJcblxyXG4gIC8vIFdlYmtpdCBCcm93c2VycyBkb24ndCBzZXQgdGhlIGtleUNvZGUgd2hlbiBjYWxsaW5nIHRoZSBpbml0IGZ1bmN0aW9uLlxyXG4gIC8vIFNlZSByZWxhdGVkIGJ1ZyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTY3MzVcclxuICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICdrZXlDb2RlJywga2V5Q29kZSk7XHJcbiAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAna2V5Jywga2V5KTtcclxuICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICdjdHJsS2V5JywgISFtb2RpZmllcnMuY29udHJvbCk7XHJcbiAgZGVmaW5lUmVhZG9ubHlFdmVudFByb3BlcnR5KGV2ZW50LCAnYWx0S2V5JywgISFtb2RpZmllcnMuYWx0KTtcclxuICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICdzaGlmdEtleScsICEhbW9kaWZpZXJzLnNoaWZ0KTtcclxuICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICdtZXRhS2V5JywgISFtb2RpZmllcnMubWV0YSk7XHJcblxyXG4gIC8vIElFIHdvbid0IHNldCBgZGVmYXVsdFByZXZlbnRlZGAgb24gc3ludGhldGljIGV2ZW50cyBzbyB3ZSBuZWVkIHRvIGRvIGl0IG1hbnVhbGx5LlxyXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQsICdkZWZhdWx0UHJldmVudGVkJywgdHJ1ZSk7XHJcbiAgICByZXR1cm4gb3JpZ2luYWxQcmV2ZW50RGVmYXVsdCgpO1xyXG4gIH07XHJcblxyXG4gIHJldHVybiBldmVudDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBmYWtlIGV2ZW50IG9iamVjdCB3aXRoIGFueSBkZXNpcmVkIGV2ZW50IHR5cGUuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGYWtlRXZlbnQodHlwZTogc3RyaW5nLCBjYW5CdWJibGUgPSBmYWxzZSwgY2FuY2VsYWJsZSA9IHRydWUpIHtcclxuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gIGV2ZW50LmluaXRFdmVudCh0eXBlLCBjYW5CdWJibGUsIGNhbmNlbGFibGUpO1xyXG4gIHJldHVybiBldmVudDtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgYSByZWFkb25seSBwcm9wZXJ0eSBvbiB0aGUgZ2l2ZW4gZXZlbnQgb2JqZWN0LiBSZWFkb25seSBwcm9wZXJ0aWVzIG9uIGFuIGV2ZW50IG9iamVjdFxyXG4gKiBhcmUgYWx3YXlzIHNldCBhcyBjb25maWd1cmFibGUgYXMgdGhhdCBtYXRjaGVzIGRlZmF1bHQgcmVhZG9ubHkgcHJvcGVydGllcyBmb3IgRE9NIGV2ZW50IG9iamVjdHMuXHJcbiAqL1xyXG5mdW5jdGlvbiBkZWZpbmVSZWFkb25seUV2ZW50UHJvcGVydHkoZXZlbnQ6IEV2ZW50LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xyXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShldmVudCwgcHJvcGVydHlOYW1lLCB7Z2V0OiAoKSA9PiB2YWx1ZSwgY29uZmlndXJhYmxlOiB0cnVlfSk7XHJcbn1cclxuIl19