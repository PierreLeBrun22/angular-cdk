/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Gets a mutable version of an element's bounding `ClientRect`. */
export function getMutableClientRect(element) {
    const clientRect = element.getBoundingClientRect();
    // We need to clone the `clientRect` here, because all the values on it are readonly
    // and we need to be able to update them. Also we can't use a spread here, because
    // the values on a `ClientRect` aren't own properties. See:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect#Notes
    return {
        top: clientRect.top,
        right: clientRect.right,
        bottom: clientRect.bottom,
        left: clientRect.left,
        width: clientRect.width,
        height: clientRect.height
    };
}
/**
 * Checks whether some coordinates are within a `ClientRect`.
 * @param clientRect ClientRect that is being checked.
 * @param x Coordinates along the X axis.
 * @param y Coordinates along the Y axis.
 */
export function isInsideClientRect(clientRect, x, y) {
    const { top, bottom, left, right } = clientRect;
    return y >= top && y <= bottom && x >= left && x <= right;
}
/**
 * Updates the top/left positions of a `ClientRect`, as well as their bottom/right counterparts.
 * @param clientRect `ClientRect` that should be updated.
 * @param top Amount to add to the `top` position.
 * @param left Amount to add to the `left` position.
 */
export function adjustClientRect(clientRect, top, left) {
    clientRect.top += top;
    clientRect.bottom = clientRect.top + clientRect.height;
    clientRect.left += left;
    clientRect.right = clientRect.left + clientRect.width;
}
/**
 * Checks whether the pointer coordinates are close to a ClientRect.
 * @param rect ClientRect to check against.
 * @param threshold Threshold around the ClientRect.
 * @param pointerX Coordinates along the X axis.
 * @param pointerY Coordinates along the Y axis.
 */
export function isPointerNearClientRect(rect, threshold, pointerX, pointerY) {
    const { top, right, bottom, left, width, height } = rect;
    const xThreshold = width * threshold;
    const yThreshold = height * threshold;
    return pointerY > top - yThreshold && pointerY < bottom + yThreshold &&
        pointerX > left - xThreshold && pointerX < right + xThreshold;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LXJlY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2RyYWctZHJvcC9jbGllbnQtcmVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxvRUFBb0U7QUFDcEUsTUFBTSxVQUFVLG9CQUFvQixDQUFDLE9BQWdCO0lBQ25ELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBRW5ELG9GQUFvRjtJQUNwRixrRkFBa0Y7SUFDbEYsMkRBQTJEO0lBQzNELHVGQUF1RjtJQUN2RixPQUFPO1FBQ0wsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHO1FBQ25CLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztRQUN2QixNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07UUFDekIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1FBQ3JCLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztRQUN2QixNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU07S0FDMUIsQ0FBQztBQUNKLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxVQUFzQixFQUFFLENBQVMsRUFBRSxDQUFTO0lBQzdFLE1BQU0sRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsR0FBRyxVQUFVLENBQUM7SUFDOUMsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDO0FBQzVELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxVQUFzQixFQUFFLEdBQVcsRUFBRSxJQUFZO0lBQ2hGLFVBQVUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO0lBQ3RCLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBRXZELFVBQVUsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0lBQ3hCLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDO0FBQ3hELENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsdUJBQXVCLENBQUMsSUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsUUFBZ0IsRUFDaEIsUUFBZ0I7SUFDdEQsTUFBTSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ3ZELE1BQU0sVUFBVSxHQUFHLEtBQUssR0FBRyxTQUFTLENBQUM7SUFDckMsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQztJQUV0QyxPQUFPLFFBQVEsR0FBRyxHQUFHLEdBQUcsVUFBVSxJQUFJLFFBQVEsR0FBRyxNQUFNLEdBQUcsVUFBVTtRQUM3RCxRQUFRLEdBQUcsSUFBSSxHQUFHLFVBQVUsSUFBSSxRQUFRLEdBQUcsS0FBSyxHQUFHLFVBQVUsQ0FBQztBQUN2RSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG4vKiogR2V0cyBhIG11dGFibGUgdmVyc2lvbiBvZiBhbiBlbGVtZW50J3MgYm91bmRpbmcgYENsaWVudFJlY3RgLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TXV0YWJsZUNsaWVudFJlY3QoZWxlbWVudDogRWxlbWVudCk6IENsaWVudFJlY3Qge1xyXG4gIGNvbnN0IGNsaWVudFJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAvLyBXZSBuZWVkIHRvIGNsb25lIHRoZSBgY2xpZW50UmVjdGAgaGVyZSwgYmVjYXVzZSBhbGwgdGhlIHZhbHVlcyBvbiBpdCBhcmUgcmVhZG9ubHlcclxuICAvLyBhbmQgd2UgbmVlZCB0byBiZSBhYmxlIHRvIHVwZGF0ZSB0aGVtLiBBbHNvIHdlIGNhbid0IHVzZSBhIHNwcmVhZCBoZXJlLCBiZWNhdXNlXHJcbiAgLy8gdGhlIHZhbHVlcyBvbiBhIGBDbGllbnRSZWN0YCBhcmVuJ3Qgb3duIHByb3BlcnRpZXMuIFNlZTpcclxuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRWxlbWVudC9nZXRCb3VuZGluZ0NsaWVudFJlY3QjTm90ZXNcclxuICByZXR1cm4ge1xyXG4gICAgdG9wOiBjbGllbnRSZWN0LnRvcCxcclxuICAgIHJpZ2h0OiBjbGllbnRSZWN0LnJpZ2h0LFxyXG4gICAgYm90dG9tOiBjbGllbnRSZWN0LmJvdHRvbSxcclxuICAgIGxlZnQ6IGNsaWVudFJlY3QubGVmdCxcclxuICAgIHdpZHRoOiBjbGllbnRSZWN0LndpZHRoLFxyXG4gICAgaGVpZ2h0OiBjbGllbnRSZWN0LmhlaWdodFxyXG4gIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgd2hldGhlciBzb21lIGNvb3JkaW5hdGVzIGFyZSB3aXRoaW4gYSBgQ2xpZW50UmVjdGAuXHJcbiAqIEBwYXJhbSBjbGllbnRSZWN0IENsaWVudFJlY3QgdGhhdCBpcyBiZWluZyBjaGVja2VkLlxyXG4gKiBAcGFyYW0geCBDb29yZGluYXRlcyBhbG9uZyB0aGUgWCBheGlzLlxyXG4gKiBAcGFyYW0geSBDb29yZGluYXRlcyBhbG9uZyB0aGUgWSBheGlzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5zaWRlQ2xpZW50UmVjdChjbGllbnRSZWN0OiBDbGllbnRSZWN0LCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gIGNvbnN0IHt0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHR9ID0gY2xpZW50UmVjdDtcclxuICByZXR1cm4geSA+PSB0b3AgJiYgeSA8PSBib3R0b20gJiYgeCA+PSBsZWZ0ICYmIHggPD0gcmlnaHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSB0b3AvbGVmdCBwb3NpdGlvbnMgb2YgYSBgQ2xpZW50UmVjdGAsIGFzIHdlbGwgYXMgdGhlaXIgYm90dG9tL3JpZ2h0IGNvdW50ZXJwYXJ0cy5cclxuICogQHBhcmFtIGNsaWVudFJlY3QgYENsaWVudFJlY3RgIHRoYXQgc2hvdWxkIGJlIHVwZGF0ZWQuXHJcbiAqIEBwYXJhbSB0b3AgQW1vdW50IHRvIGFkZCB0byB0aGUgYHRvcGAgcG9zaXRpb24uXHJcbiAqIEBwYXJhbSBsZWZ0IEFtb3VudCB0byBhZGQgdG8gdGhlIGBsZWZ0YCBwb3NpdGlvbi5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGp1c3RDbGllbnRSZWN0KGNsaWVudFJlY3Q6IENsaWVudFJlY3QsIHRvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXIpIHtcclxuICBjbGllbnRSZWN0LnRvcCArPSB0b3A7XHJcbiAgY2xpZW50UmVjdC5ib3R0b20gPSBjbGllbnRSZWN0LnRvcCArIGNsaWVudFJlY3QuaGVpZ2h0O1xyXG5cclxuICBjbGllbnRSZWN0LmxlZnQgKz0gbGVmdDtcclxuICBjbGllbnRSZWN0LnJpZ2h0ID0gY2xpZW50UmVjdC5sZWZ0ICsgY2xpZW50UmVjdC53aWR0aDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwb2ludGVyIGNvb3JkaW5hdGVzIGFyZSBjbG9zZSB0byBhIENsaWVudFJlY3QuXHJcbiAqIEBwYXJhbSByZWN0IENsaWVudFJlY3QgdG8gY2hlY2sgYWdhaW5zdC5cclxuICogQHBhcmFtIHRocmVzaG9sZCBUaHJlc2hvbGQgYXJvdW5kIHRoZSBDbGllbnRSZWN0LlxyXG4gKiBAcGFyYW0gcG9pbnRlclggQ29vcmRpbmF0ZXMgYWxvbmcgdGhlIFggYXhpcy5cclxuICogQHBhcmFtIHBvaW50ZXJZIENvb3JkaW5hdGVzIGFsb25nIHRoZSBZIGF4aXMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNQb2ludGVyTmVhckNsaWVudFJlY3QocmVjdDogQ2xpZW50UmVjdCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocmVzaG9sZDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRlclg6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50ZXJZOiBudW1iZXIpOiBib29sZWFuIHtcclxuICBjb25zdCB7dG9wLCByaWdodCwgYm90dG9tLCBsZWZ0LCB3aWR0aCwgaGVpZ2h0fSA9IHJlY3Q7XHJcbiAgY29uc3QgeFRocmVzaG9sZCA9IHdpZHRoICogdGhyZXNob2xkO1xyXG4gIGNvbnN0IHlUaHJlc2hvbGQgPSBoZWlnaHQgKiB0aHJlc2hvbGQ7XHJcblxyXG4gIHJldHVybiBwb2ludGVyWSA+IHRvcCAtIHlUaHJlc2hvbGQgJiYgcG9pbnRlclkgPCBib3R0b20gKyB5VGhyZXNob2xkICYmXHJcbiAgICAgICAgIHBvaW50ZXJYID4gbGVmdCAtIHhUaHJlc2hvbGQgJiYgcG9pbnRlclggPCByaWdodCArIHhUaHJlc2hvbGQ7XHJcbn1cclxuIl19