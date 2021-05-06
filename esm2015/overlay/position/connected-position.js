/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Horizontal dimension of a connection point on the perimeter of the origin or overlay element. */
import { Optional } from '@angular/core';
/** The points of the origin element and the overlay element to connect. */
export class ConnectionPositionPair {
    constructor(origin, overlay, 
    /** Offset along the X axis. */
    offsetX, 
    /** Offset along the Y axis. */
    offsetY, 
    /** Class(es) to be applied to the panel while this position is active. */
    panelClass) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.panelClass = panelClass;
        this.originX = origin.originX;
        this.originY = origin.originY;
        this.overlayX = overlay.overlayX;
        this.overlayY = overlay.overlayY;
    }
}
/**
 * Set of properties regarding the position of the origin and overlay relative to the viewport
 * with respect to the containing Scrollable elements.
 *
 * The overlay and origin are clipped if any part of their bounding client rectangle exceeds the
 * bounds of any one of the strategy's Scrollable's bounding client rectangle.
 *
 * The overlay and origin are outside view if there is no overlap between their bounding client
 * rectangle and any one of the strategy's Scrollable's bounding client rectangle.
 *
 *       -----------                    -----------
 *       | outside |                    | clipped |
 *       |  view   |              --------------------------
 *       |         |              |     |         |        |
 *       ----------               |     -----------        |
 *  --------------------------    |                        |
 *  |                        |    |      Scrollable        |
 *  |                        |    |                        |
 *  |                        |     --------------------------
 *  |      Scrollable        |
 *  |                        |
 *  --------------------------
 *
 *  @docs-private
 */
export class ScrollingVisibility {
}
/** The change event emitted by the strategy when a fallback position is used. */
export class ConnectedOverlayPositionChange {
    constructor(
    /** The position used as a result of this change. */
    connectionPair, 
    /** @docs-private */
    scrollableViewProperties) {
        this.connectionPair = connectionPair;
        this.scrollableViewProperties = scrollableViewProperties;
    }
}
ConnectedOverlayPositionChange.ctorParameters = () => [
    { type: ConnectionPositionPair },
    { type: ScrollingVisibility, decorators: [{ type: Optional }] }
];
/**
 * Validates whether a vertical position property matches the expected values.
 * @param property Name of the property being validated.
 * @param value Value of the property being validated.
 * @docs-private
 */
export function validateVerticalPosition(property, value) {
    if (value !== 'top' && value !== 'bottom' && value !== 'center') {
        throw Error(`ConnectedPosition: Invalid ${property} "${value}". ` +
            `Expected "top", "bottom" or "center".`);
    }
}
/**
 * Validates whether a horizontal position property matches the expected values.
 * @param property Name of the property being validated.
 * @param value Value of the property being validated.
 * @docs-private
 */
export function validateHorizontalPosition(property, value) {
    if (value !== 'start' && value !== 'end' && value !== 'center') {
        throw Error(`ConnectedPosition: Invalid ${property} "${value}". ` +
            `Expected "start", "end" or "center".`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdGVkLXBvc2l0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL2Nvbm5lY3RlZC1wb3NpdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxvR0FBb0c7QUFDcEcsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQW1CdkMsMkVBQTJFO0FBQzNFLE1BQU0sT0FBTyxzQkFBc0I7SUFVakMsWUFDRSxNQUFnQyxFQUNoQyxPQUFrQztJQUNsQywrQkFBK0I7SUFDeEIsT0FBZ0I7SUFDdkIsK0JBQStCO0lBQ3hCLE9BQWdCO0lBQ3ZCLDBFQUEwRTtJQUNuRSxVQUE4QjtRQUo5QixZQUFPLEdBQVAsT0FBTyxDQUFTO1FBRWhCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFFaEIsZUFBVSxHQUFWLFVBQVUsQ0FBb0I7UUFFckMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLE9BQU8sbUJBQW1CO0NBSy9CO0FBRUQsaUZBQWlGO0FBQ2pGLE1BQU0sT0FBTyw4QkFBOEI7SUFDekM7SUFDSSxvREFBb0Q7SUFDN0MsY0FBc0M7SUFDN0Msb0JBQW9CO0lBQ0Qsd0JBQTZDO1FBRnpELG1CQUFjLEdBQWQsY0FBYyxDQUF3QjtRQUUxQiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQXFCO0lBQUcsQ0FBQzs7O1lBRjdDLHNCQUFzQjtZQUVBLG1CQUFtQix1QkFBL0QsUUFBUTs7QUFHZjs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSx3QkFBd0IsQ0FBQyxRQUFnQixFQUFFLEtBQTRCO0lBQ3JGLElBQUksS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssUUFBUSxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDL0QsTUFBTSxLQUFLLENBQUMsOEJBQThCLFFBQVEsS0FBSyxLQUFLLEtBQUs7WUFDckQsdUNBQXVDLENBQUMsQ0FBQztLQUN0RDtBQUNILENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSwwQkFBMEIsQ0FBQyxRQUFnQixFQUFFLEtBQThCO0lBQ3pGLElBQUksS0FBSyxLQUFLLE9BQU8sSUFBSSxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDOUQsTUFBTSxLQUFLLENBQUMsOEJBQThCLFFBQVEsS0FBSyxLQUFLLEtBQUs7WUFDckQsc0NBQXNDLENBQUMsQ0FBQztLQUNyRDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbi8qKiBIb3Jpem9udGFsIGRpbWVuc2lvbiBvZiBhIGNvbm5lY3Rpb24gcG9pbnQgb24gdGhlIHBlcmltZXRlciBvZiB0aGUgb3JpZ2luIG9yIG92ZXJsYXkgZWxlbWVudC4gKi9cclxuaW1wb3J0IHtPcHRpb25hbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmV4cG9ydCB0eXBlIEhvcml6b250YWxDb25uZWN0aW9uUG9zID0gJ3N0YXJ0JyB8ICdjZW50ZXInIHwgJ2VuZCc7XHJcblxyXG4vKiogVmVydGljYWwgZGltZW5zaW9uIG9mIGEgY29ubmVjdGlvbiBwb2ludCBvbiB0aGUgcGVyaW1ldGVyIG9mIHRoZSBvcmlnaW4gb3Igb3ZlcmxheSBlbGVtZW50LiAqL1xyXG5leHBvcnQgdHlwZSBWZXJ0aWNhbENvbm5lY3Rpb25Qb3MgPSAndG9wJyB8ICdjZW50ZXInIHwgJ2JvdHRvbSc7XHJcblxyXG5cclxuLyoqIEEgY29ubmVjdGlvbiBwb2ludCBvbiB0aGUgb3JpZ2luIGVsZW1lbnQuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3JpZ2luQ29ubmVjdGlvblBvc2l0aW9uIHtcclxuICBvcmlnaW5YOiBIb3Jpem9udGFsQ29ubmVjdGlvblBvcztcclxuICBvcmlnaW5ZOiBWZXJ0aWNhbENvbm5lY3Rpb25Qb3M7XHJcbn1cclxuXHJcbi8qKiBBIGNvbm5lY3Rpb24gcG9pbnQgb24gdGhlIG92ZXJsYXkgZWxlbWVudC4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uIHtcclxuICBvdmVybGF5WDogSG9yaXpvbnRhbENvbm5lY3Rpb25Qb3M7XHJcbiAgb3ZlcmxheVk6IFZlcnRpY2FsQ29ubmVjdGlvblBvcztcclxufVxyXG5cclxuLyoqIFRoZSBwb2ludHMgb2YgdGhlIG9yaWdpbiBlbGVtZW50IGFuZCB0aGUgb3ZlcmxheSBlbGVtZW50IHRvIGNvbm5lY3QuICovXHJcbmV4cG9ydCBjbGFzcyBDb25uZWN0aW9uUG9zaXRpb25QYWlyIHtcclxuICAvKiogWC1heGlzIGF0dGFjaG1lbnQgcG9pbnQgZm9yIGNvbm5lY3RlZCBvdmVybGF5IG9yaWdpbi4gQ2FuIGJlICdzdGFydCcsICdlbmQnLCBvciAnY2VudGVyJy4gKi9cclxuICBvcmlnaW5YOiBIb3Jpem9udGFsQ29ubmVjdGlvblBvcztcclxuICAvKiogWS1heGlzIGF0dGFjaG1lbnQgcG9pbnQgZm9yIGNvbm5lY3RlZCBvdmVybGF5IG9yaWdpbi4gQ2FuIGJlICd0b3AnLCAnYm90dG9tJywgb3IgJ2NlbnRlcicuICovXHJcbiAgb3JpZ2luWTogVmVydGljYWxDb25uZWN0aW9uUG9zO1xyXG4gIC8qKiBYLWF4aXMgYXR0YWNobWVudCBwb2ludCBmb3IgY29ubmVjdGVkIG92ZXJsYXkuIENhbiBiZSAnc3RhcnQnLCAnZW5kJywgb3IgJ2NlbnRlcicuICovXHJcbiAgb3ZlcmxheVg6IEhvcml6b250YWxDb25uZWN0aW9uUG9zO1xyXG4gIC8qKiBZLWF4aXMgYXR0YWNobWVudCBwb2ludCBmb3IgY29ubmVjdGVkIG92ZXJsYXkuIENhbiBiZSAndG9wJywgJ2JvdHRvbScsIG9yICdjZW50ZXInLiAqL1xyXG4gIG92ZXJsYXlZOiBWZXJ0aWNhbENvbm5lY3Rpb25Qb3M7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgb3JpZ2luOiBPcmlnaW5Db25uZWN0aW9uUG9zaXRpb24sXHJcbiAgICBvdmVybGF5OiBPdmVybGF5Q29ubmVjdGlvblBvc2l0aW9uLFxyXG4gICAgLyoqIE9mZnNldCBhbG9uZyB0aGUgWCBheGlzLiAqL1xyXG4gICAgcHVibGljIG9mZnNldFg/OiBudW1iZXIsXHJcbiAgICAvKiogT2Zmc2V0IGFsb25nIHRoZSBZIGF4aXMuICovXHJcbiAgICBwdWJsaWMgb2Zmc2V0WT86IG51bWJlcixcclxuICAgIC8qKiBDbGFzcyhlcykgdG8gYmUgYXBwbGllZCB0byB0aGUgcGFuZWwgd2hpbGUgdGhpcyBwb3NpdGlvbiBpcyBhY3RpdmUuICovXHJcbiAgICBwdWJsaWMgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdKSB7XHJcblxyXG4gICAgdGhpcy5vcmlnaW5YID0gb3JpZ2luLm9yaWdpblg7XHJcbiAgICB0aGlzLm9yaWdpblkgPSBvcmlnaW4ub3JpZ2luWTtcclxuICAgIHRoaXMub3ZlcmxheVggPSBvdmVybGF5Lm92ZXJsYXlYO1xyXG4gICAgdGhpcy5vdmVybGF5WSA9IG92ZXJsYXkub3ZlcmxheVk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogU2V0IG9mIHByb3BlcnRpZXMgcmVnYXJkaW5nIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3JpZ2luIGFuZCBvdmVybGF5IHJlbGF0aXZlIHRvIHRoZSB2aWV3cG9ydFxyXG4gKiB3aXRoIHJlc3BlY3QgdG8gdGhlIGNvbnRhaW5pbmcgU2Nyb2xsYWJsZSBlbGVtZW50cy5cclxuICpcclxuICogVGhlIG92ZXJsYXkgYW5kIG9yaWdpbiBhcmUgY2xpcHBlZCBpZiBhbnkgcGFydCBvZiB0aGVpciBib3VuZGluZyBjbGllbnQgcmVjdGFuZ2xlIGV4Y2VlZHMgdGhlXHJcbiAqIGJvdW5kcyBvZiBhbnkgb25lIG9mIHRoZSBzdHJhdGVneSdzIFNjcm9sbGFibGUncyBib3VuZGluZyBjbGllbnQgcmVjdGFuZ2xlLlxyXG4gKlxyXG4gKiBUaGUgb3ZlcmxheSBhbmQgb3JpZ2luIGFyZSBvdXRzaWRlIHZpZXcgaWYgdGhlcmUgaXMgbm8gb3ZlcmxhcCBiZXR3ZWVuIHRoZWlyIGJvdW5kaW5nIGNsaWVudFxyXG4gKiByZWN0YW5nbGUgYW5kIGFueSBvbmUgb2YgdGhlIHN0cmF0ZWd5J3MgU2Nyb2xsYWJsZSdzIGJvdW5kaW5nIGNsaWVudCByZWN0YW5nbGUuXHJcbiAqXHJcbiAqICAgICAgIC0tLS0tLS0tLS0tICAgICAgICAgICAgICAgICAgICAtLS0tLS0tLS0tLVxyXG4gKiAgICAgICB8IG91dHNpZGUgfCAgICAgICAgICAgICAgICAgICAgfCBjbGlwcGVkIHxcclxuICogICAgICAgfCAgdmlldyAgIHwgICAgICAgICAgICAgIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICAgICAgIHwgICAgICAgICB8ICAgICAgICAgICAgICB8ICAgICB8ICAgICAgICAgfCAgICAgICAgfFxyXG4gKiAgICAgICAtLS0tLS0tLS0tICAgICAgICAgICAgICAgfCAgICAgLS0tLS0tLS0tLS0gICAgICAgIHxcclxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICB8ICAgICAgICAgICAgICAgICAgICAgICAgfCAgICB8ICAgICAgU2Nyb2xsYWJsZSAgICAgICAgfFxyXG4gKiAgfCAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcclxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgfCAgICAgIFNjcm9sbGFibGUgICAgICAgIHxcclxuICogIHwgICAgICAgICAgICAgICAgICAgICAgICB8XHJcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKlxyXG4gKiAgQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNjcm9sbGluZ1Zpc2liaWxpdHkge1xyXG4gIGlzT3JpZ2luQ2xpcHBlZDogYm9vbGVhbjtcclxuICBpc09yaWdpbk91dHNpZGVWaWV3OiBib29sZWFuO1xyXG4gIGlzT3ZlcmxheUNsaXBwZWQ6IGJvb2xlYW47XHJcbiAgaXNPdmVybGF5T3V0c2lkZVZpZXc6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKiBUaGUgY2hhbmdlIGV2ZW50IGVtaXR0ZWQgYnkgdGhlIHN0cmF0ZWd5IHdoZW4gYSBmYWxsYmFjayBwb3NpdGlvbiBpcyB1c2VkLiAqL1xyXG5leHBvcnQgY2xhc3MgQ29ubmVjdGVkT3ZlcmxheVBvc2l0aW9uQ2hhbmdlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgLyoqIFRoZSBwb3NpdGlvbiB1c2VkIGFzIGEgcmVzdWx0IG9mIHRoaXMgY2hhbmdlLiAqL1xyXG4gICAgICBwdWJsaWMgY29ubmVjdGlvblBhaXI6IENvbm5lY3Rpb25Qb3NpdGlvblBhaXIsXHJcbiAgICAgIC8qKiBAZG9jcy1wcml2YXRlICovXHJcbiAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyBzY3JvbGxhYmxlVmlld1Byb3BlcnRpZXM6IFNjcm9sbGluZ1Zpc2liaWxpdHkpIHt9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWYWxpZGF0ZXMgd2hldGhlciBhIHZlcnRpY2FsIHBvc2l0aW9uIHByb3BlcnR5IG1hdGNoZXMgdGhlIGV4cGVjdGVkIHZhbHVlcy5cclxuICogQHBhcmFtIHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIHZhbGlkYXRlZC5cclxuICogQHBhcmFtIHZhbHVlIFZhbHVlIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyB2YWxpZGF0ZWQuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVZlcnRpY2FsUG9zaXRpb24ocHJvcGVydHk6IHN0cmluZywgdmFsdWU6IFZlcnRpY2FsQ29ubmVjdGlvblBvcykge1xyXG4gIGlmICh2YWx1ZSAhPT0gJ3RvcCcgJiYgdmFsdWUgIT09ICdib3R0b20nICYmIHZhbHVlICE9PSAnY2VudGVyJykge1xyXG4gICAgdGhyb3cgRXJyb3IoYENvbm5lY3RlZFBvc2l0aW9uOiBJbnZhbGlkICR7cHJvcGVydHl9IFwiJHt2YWx1ZX1cIi4gYCArXHJcbiAgICAgICAgICAgICAgICBgRXhwZWN0ZWQgXCJ0b3BcIiwgXCJib3R0b21cIiBvciBcImNlbnRlclwiLmApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFZhbGlkYXRlcyB3aGV0aGVyIGEgaG9yaXpvbnRhbCBwb3NpdGlvbiBwcm9wZXJ0eSBtYXRjaGVzIHRoZSBleHBlY3RlZCB2YWx1ZXMuXHJcbiAqIEBwYXJhbSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyB2YWxpZGF0ZWQuXHJcbiAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSBvZiB0aGUgcHJvcGVydHkgYmVpbmcgdmFsaWRhdGVkLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVIb3Jpem9udGFsUG9zaXRpb24ocHJvcGVydHk6IHN0cmluZywgdmFsdWU6IEhvcml6b250YWxDb25uZWN0aW9uUG9zKSB7XHJcbiAgaWYgKHZhbHVlICE9PSAnc3RhcnQnICYmIHZhbHVlICE9PSAnZW5kJyAmJiB2YWx1ZSAhPT0gJ2NlbnRlcicpIHtcclxuICAgIHRocm93IEVycm9yKGBDb25uZWN0ZWRQb3NpdGlvbjogSW52YWxpZCAke3Byb3BlcnR5fSBcIiR7dmFsdWV9XCIuIGAgK1xyXG4gICAgICAgICAgICAgICAgYEV4cGVjdGVkIFwic3RhcnRcIiwgXCJlbmRcIiBvciBcImNlbnRlclwiLmApO1xyXG4gIH1cclxufVxyXG4iXX0=