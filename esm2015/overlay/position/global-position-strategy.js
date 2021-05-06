/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Class to be added to the overlay pane wrapper. */
const wrapperClass = 'cdk-global-overlay-wrapper';
/**
 * A strategy for positioning overlays. Using this strategy, an overlay is given an
 * explicit position relative to the browser's viewport. We use flexbox, instead of
 * transforms, in order to avoid issues with subpixel rendering which can cause the
 * element to become blurry.
 */
export class GlobalPositionStrategy {
    constructor() {
        this._cssPosition = 'static';
        this._topOffset = '';
        this._bottomOffset = '';
        this._leftOffset = '';
        this._rightOffset = '';
        this._alignItems = '';
        this._justifyContent = '';
        this._width = '';
        this._height = '';
    }
    attach(overlayRef) {
        const config = overlayRef.getConfig();
        this._overlayRef = overlayRef;
        if (this._width && !config.width) {
            overlayRef.updateSize({ width: this._width });
        }
        if (this._height && !config.height) {
            overlayRef.updateSize({ height: this._height });
        }
        overlayRef.hostElement.classList.add(wrapperClass);
        this._isDisposed = false;
    }
    /**
     * Sets the top position of the overlay. Clears any previously set vertical position.
     * @param value New top offset.
     */
    top(value = '') {
        this._bottomOffset = '';
        this._topOffset = value;
        this._alignItems = 'flex-start';
        return this;
    }
    /**
     * Sets the left position of the overlay. Clears any previously set horizontal position.
     * @param value New left offset.
     */
    left(value = '') {
        this._rightOffset = '';
        this._leftOffset = value;
        this._justifyContent = 'flex-start';
        return this;
    }
    /**
     * Sets the bottom position of the overlay. Clears any previously set vertical position.
     * @param value New bottom offset.
     */
    bottom(value = '') {
        this._topOffset = '';
        this._bottomOffset = value;
        this._alignItems = 'flex-end';
        return this;
    }
    /**
     * Sets the right position of the overlay. Clears any previously set horizontal position.
     * @param value New right offset.
     */
    right(value = '') {
        this._leftOffset = '';
        this._rightOffset = value;
        this._justifyContent = 'flex-end';
        return this;
    }
    /**
     * Sets the overlay width and clears any previously set width.
     * @param value New width for the overlay
     * @deprecated Pass the `width` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    width(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ width: value });
        }
        else {
            this._width = value;
        }
        return this;
    }
    /**
     * Sets the overlay height and clears any previously set height.
     * @param value New height for the overlay
     * @deprecated Pass the `height` through the `OverlayConfig`.
     * @breaking-change 8.0.0
     */
    height(value = '') {
        if (this._overlayRef) {
            this._overlayRef.updateSize({ height: value });
        }
        else {
            this._height = value;
        }
        return this;
    }
    /**
     * Centers the overlay horizontally with an optional offset.
     * Clears any previously set horizontal position.
     *
     * @param offset Overlay offset from the horizontal center.
     */
    centerHorizontally(offset = '') {
        this.left(offset);
        this._justifyContent = 'center';
        return this;
    }
    /**
     * Centers the overlay vertically with an optional offset.
     * Clears any previously set vertical position.
     *
     * @param offset Overlay offset from the vertical center.
     */
    centerVertically(offset = '') {
        this.top(offset);
        this._alignItems = 'center';
        return this;
    }
    /**
     * Apply the position to the element.
     * @docs-private
     */
    apply() {
        // Since the overlay ref applies the strategy asynchronously, it could
        // have been disposed before it ends up being applied. If that is the
        // case, we shouldn't do anything.
        if (!this._overlayRef || !this._overlayRef.hasAttached()) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parentStyles = this._overlayRef.hostElement.style;
        const config = this._overlayRef.getConfig();
        const { width, height, maxWidth, maxHeight } = config;
        const shouldBeFlushHorizontally = (width === '100%' || width === '100vw') &&
            (!maxWidth || maxWidth === '100%' || maxWidth === '100vw');
        const shouldBeFlushVertically = (height === '100%' || height === '100vh') &&
            (!maxHeight || maxHeight === '100%' || maxHeight === '100vh');
        styles.position = this._cssPosition;
        styles.marginLeft = shouldBeFlushHorizontally ? '0' : this._leftOffset;
        styles.marginTop = shouldBeFlushVertically ? '0' : this._topOffset;
        styles.marginBottom = this._bottomOffset;
        styles.marginRight = this._rightOffset;
        if (shouldBeFlushHorizontally) {
            parentStyles.justifyContent = 'flex-start';
        }
        else if (this._justifyContent === 'center') {
            parentStyles.justifyContent = 'center';
        }
        else if (this._overlayRef.getConfig().direction === 'rtl') {
            // In RTL the browser will invert `flex-start` and `flex-end` automatically, but we
            // don't want that because our positioning is explicitly `left` and `right`, hence
            // why we do another inversion to ensure that the overlay stays in the same position.
            // TODO: reconsider this if we add `start` and `end` methods.
            if (this._justifyContent === 'flex-start') {
                parentStyles.justifyContent = 'flex-end';
            }
            else if (this._justifyContent === 'flex-end') {
                parentStyles.justifyContent = 'flex-start';
            }
        }
        else {
            parentStyles.justifyContent = this._justifyContent;
        }
        parentStyles.alignItems = shouldBeFlushVertically ? 'flex-start' : this._alignItems;
    }
    /**
     * Cleans up the DOM changes from the position strategy.
     * @docs-private
     */
    dispose() {
        if (this._isDisposed || !this._overlayRef) {
            return;
        }
        const styles = this._overlayRef.overlayElement.style;
        const parent = this._overlayRef.hostElement;
        const parentStyles = parent.style;
        parent.classList.remove(wrapperClass);
        parentStyles.justifyContent = parentStyles.alignItems = styles.marginTop =
            styles.marginBottom = styles.marginLeft = styles.marginRight = styles.position = '';
        this._overlayRef = null;
        this._isDisposed = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2xvYmFsLXBvc2l0aW9uLXN0cmF0ZWd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9vdmVybGF5L3Bvc2l0aW9uL2dsb2JhbC1wb3NpdGlvbi1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFLSCxxREFBcUQ7QUFDckQsTUFBTSxZQUFZLEdBQUcsNEJBQTRCLENBQUM7QUFFbEQ7Ozs7O0dBS0c7QUFDSCxNQUFNLE9BQU8sc0JBQXNCO0lBQW5DO1FBR1UsaUJBQVksR0FBVyxRQUFRLENBQUM7UUFDaEMsZUFBVSxHQUFXLEVBQUUsQ0FBQztRQUN4QixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQUMzQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6QixpQkFBWSxHQUFXLEVBQUUsQ0FBQztRQUMxQixnQkFBVyxHQUFXLEVBQUUsQ0FBQztRQUN6QixvQkFBZSxHQUFXLEVBQUUsQ0FBQztRQUM3QixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFlBQU8sR0FBVyxFQUFFLENBQUM7SUE0TC9CLENBQUM7SUF6TEMsTUFBTSxDQUFDLFVBQTRCO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUV0QyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUU5QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ2hDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7U0FDN0M7UUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1lBQ2xDLFVBQVUsQ0FBQyxVQUFVLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDLENBQUM7U0FDL0M7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QUV0RixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7UG9zaXRpb25TdHJhdGVneX0gZnJvbSAnLi9wb3NpdGlvbi1zdHJhdGVneSc7XHJcbmltcG9ydCB7T3ZlcmxheVJlZmVyZW5jZX0gZnJvbSAnLi4vb3ZlcmxheS1yZWZlcmVuY2UnO1xyXG5cclxuLyoqIENsYXNzIHRvIGJlIGFkZGVkIHRvIHRoZSBvdmVybGF5IHBhbmUgd3JhcHBlci4gKi9cclxuY29uc3Qgd3JhcHBlckNsYXNzID0gJ2Nkay1nbG9iYWwtb3ZlcmxheS13cmFwcGVyJztcclxuXHJcbi8qKlxyXG4gKiBBIHN0cmF0ZWd5IGZvciBwb3NpdGlvbmluZyBvdmVybGF5cy4gVXNpbmcgdGhpcyBzdHJhdGVneSwgYW4gb3ZlcmxheSBpcyBnaXZlbiBhblxyXG4gKiBleHBsaWNpdCBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgYnJvd3NlcidzIHZpZXdwb3J0LiBXZSB1c2UgZmxleGJveCwgaW5zdGVhZCBvZlxyXG4gKiB0cmFuc2Zvcm1zLCBpbiBvcmRlciB0byBhdm9pZCBpc3N1ZXMgd2l0aCBzdWJwaXhlbCByZW5kZXJpbmcgd2hpY2ggY2FuIGNhdXNlIHRoZVxyXG4gKiBlbGVtZW50IHRvIGJlY29tZSBibHVycnkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgR2xvYmFsUG9zaXRpb25TdHJhdGVneSBpbXBsZW1lbnRzIFBvc2l0aW9uU3RyYXRlZ3kge1xyXG4gIC8qKiBUaGUgb3ZlcmxheSB0byB3aGljaCB0aGlzIHN0cmF0ZWd5IGlzIGF0dGFjaGVkLiAqL1xyXG4gIHByaXZhdGUgX292ZXJsYXlSZWY6IE92ZXJsYXlSZWZlcmVuY2U7XHJcbiAgcHJpdmF0ZSBfY3NzUG9zaXRpb246IHN0cmluZyA9ICdzdGF0aWMnO1xyXG4gIHByaXZhdGUgX3RvcE9mZnNldDogc3RyaW5nID0gJyc7XHJcbiAgcHJpdmF0ZSBfYm90dG9tT2Zmc2V0OiBzdHJpbmcgPSAnJztcclxuICBwcml2YXRlIF9sZWZ0T2Zmc2V0OiBzdHJpbmcgPSAnJztcclxuICBwcml2YXRlIF9yaWdodE9mZnNldDogc3RyaW5nID0gJyc7XHJcbiAgcHJpdmF0ZSBfYWxpZ25JdGVtczogc3RyaW5nID0gJyc7XHJcbiAgcHJpdmF0ZSBfanVzdGlmeUNvbnRlbnQ6IHN0cmluZyA9ICcnO1xyXG4gIHByaXZhdGUgX3dpZHRoOiBzdHJpbmcgPSAnJztcclxuICBwcml2YXRlIF9oZWlnaHQ6IHN0cmluZyA9ICcnO1xyXG4gIHByaXZhdGUgX2lzRGlzcG9zZWQ6IGJvb2xlYW47XHJcblxyXG4gIGF0dGFjaChvdmVybGF5UmVmOiBPdmVybGF5UmVmZXJlbmNlKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb25maWcgPSBvdmVybGF5UmVmLmdldENvbmZpZygpO1xyXG5cclxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBvdmVybGF5UmVmO1xyXG5cclxuICAgIGlmICh0aGlzLl93aWR0aCAmJiAhY29uZmlnLndpZHRoKSB7XHJcbiAgICAgIG92ZXJsYXlSZWYudXBkYXRlU2l6ZSh7d2lkdGg6IHRoaXMuX3dpZHRofSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2hlaWdodCAmJiAhY29uZmlnLmhlaWdodCkge1xyXG4gICAgICBvdmVybGF5UmVmLnVwZGF0ZVNpemUoe2hlaWdodDogdGhpcy5faGVpZ2h0fSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3ZlcmxheVJlZi5ob3N0RWxlbWVudC5jbGFzc0xpc3QuYWRkKHdyYXBwZXJDbGFzcyk7XHJcbiAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0b3AgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgdmVydGljYWwgcG9zaXRpb24uXHJcbiAgICogQHBhcmFtIHZhbHVlIE5ldyB0b3Agb2Zmc2V0LlxyXG4gICAqL1xyXG4gIHRvcCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcclxuICAgIHRoaXMuX2JvdHRvbU9mZnNldCA9ICcnO1xyXG4gICAgdGhpcy5fdG9wT2Zmc2V0ID0gdmFsdWU7XHJcbiAgICB0aGlzLl9hbGlnbkl0ZW1zID0gJ2ZsZXgtc3RhcnQnO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBsZWZ0IHBvc2l0aW9uIG9mIHRoZSBvdmVybGF5LiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhvcml6b250YWwgcG9zaXRpb24uXHJcbiAgICogQHBhcmFtIHZhbHVlIE5ldyBsZWZ0IG9mZnNldC5cclxuICAgKi9cclxuICBsZWZ0KHZhbHVlOiBzdHJpbmcgPSAnJyk6IHRoaXMge1xyXG4gICAgdGhpcy5fcmlnaHRPZmZzZXQgPSAnJztcclxuICAgIHRoaXMuX2xlZnRPZmZzZXQgPSB2YWx1ZTtcclxuICAgIHRoaXMuX2p1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBib3R0b20gcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgdmVydGljYWwgcG9zaXRpb24uXHJcbiAgICogQHBhcmFtIHZhbHVlIE5ldyBib3R0b20gb2Zmc2V0LlxyXG4gICAqL1xyXG4gIGJvdHRvbSh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcclxuICAgIHRoaXMuX3RvcE9mZnNldCA9ICcnO1xyXG4gICAgdGhpcy5fYm90dG9tT2Zmc2V0ID0gdmFsdWU7XHJcbiAgICB0aGlzLl9hbGlnbkl0ZW1zID0gJ2ZsZXgtZW5kJztcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcmlnaHQgcG9zaXRpb24gb2YgdGhlIG92ZXJsYXkuIENsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgaG9yaXpvbnRhbCBwb3NpdGlvbi5cclxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IHJpZ2h0IG9mZnNldC5cclxuICAgKi9cclxuICByaWdodCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcclxuICAgIHRoaXMuX2xlZnRPZmZzZXQgPSAnJztcclxuICAgIHRoaXMuX3JpZ2h0T2Zmc2V0ID0gdmFsdWU7XHJcbiAgICB0aGlzLl9qdXN0aWZ5Q29udGVudCA9ICdmbGV4LWVuZCc7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG92ZXJsYXkgd2lkdGggYW5kIGNsZWFycyBhbnkgcHJldmlvdXNseSBzZXQgd2lkdGguXHJcbiAgICogQHBhcmFtIHZhbHVlIE5ldyB3aWR0aCBmb3IgdGhlIG92ZXJsYXlcclxuICAgKiBAZGVwcmVjYXRlZCBQYXNzIHRoZSBgd2lkdGhgIHRocm91Z2ggdGhlIGBPdmVybGF5Q29uZmlnYC5cclxuICAgKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wXHJcbiAgICovXHJcbiAgd2lkdGgodmFsdWU6IHN0cmluZyA9ICcnKTogdGhpcyB7XHJcbiAgICBpZiAodGhpcy5fb3ZlcmxheVJlZikge1xyXG4gICAgICB0aGlzLl9vdmVybGF5UmVmLnVwZGF0ZVNpemUoe3dpZHRoOiB2YWx1ZX0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fd2lkdGggPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG92ZXJsYXkgaGVpZ2h0IGFuZCBjbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhlaWdodC5cclxuICAgKiBAcGFyYW0gdmFsdWUgTmV3IGhlaWdodCBmb3IgdGhlIG92ZXJsYXlcclxuICAgKiBAZGVwcmVjYXRlZCBQYXNzIHRoZSBgaGVpZ2h0YCB0aHJvdWdoIHRoZSBgT3ZlcmxheUNvbmZpZ2AuXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMFxyXG4gICAqL1xyXG4gIGhlaWdodCh2YWx1ZTogc3RyaW5nID0gJycpOiB0aGlzIHtcclxuICAgIGlmICh0aGlzLl9vdmVybGF5UmVmKSB7XHJcbiAgICAgIHRoaXMuX292ZXJsYXlSZWYudXBkYXRlU2l6ZSh7aGVpZ2h0OiB2YWx1ZX0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5faGVpZ2h0ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDZW50ZXJzIHRoZSBvdmVybGF5IGhvcml6b250YWxseSB3aXRoIGFuIG9wdGlvbmFsIG9mZnNldC5cclxuICAgKiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IGhvcml6b250YWwgcG9zaXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb2Zmc2V0IE92ZXJsYXkgb2Zmc2V0IGZyb20gdGhlIGhvcml6b250YWwgY2VudGVyLlxyXG4gICAqL1xyXG4gIGNlbnRlckhvcml6b250YWxseShvZmZzZXQ6IHN0cmluZyA9ICcnKTogdGhpcyB7XHJcbiAgICB0aGlzLmxlZnQob2Zmc2V0KTtcclxuICAgIHRoaXMuX2p1c3RpZnlDb250ZW50ID0gJ2NlbnRlcic7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENlbnRlcnMgdGhlIG92ZXJsYXkgdmVydGljYWxseSB3aXRoIGFuIG9wdGlvbmFsIG9mZnNldC5cclxuICAgKiBDbGVhcnMgYW55IHByZXZpb3VzbHkgc2V0IHZlcnRpY2FsIHBvc2l0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG9mZnNldCBPdmVybGF5IG9mZnNldCBmcm9tIHRoZSB2ZXJ0aWNhbCBjZW50ZXIuXHJcbiAgICovXHJcbiAgY2VudGVyVmVydGljYWxseShvZmZzZXQ6IHN0cmluZyA9ICcnKTogdGhpcyB7XHJcbiAgICB0aGlzLnRvcChvZmZzZXQpO1xyXG4gICAgdGhpcy5fYWxpZ25JdGVtcyA9ICdjZW50ZXInO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBseSB0aGUgcG9zaXRpb24gdG8gdGhlIGVsZW1lbnQuXHJcbiAgICogQGRvY3MtcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGFwcGx5KCk6IHZvaWQge1xyXG4gICAgLy8gU2luY2UgdGhlIG92ZXJsYXkgcmVmIGFwcGxpZXMgdGhlIHN0cmF0ZWd5IGFzeW5jaHJvbm91c2x5LCBpdCBjb3VsZFxyXG4gICAgLy8gaGF2ZSBiZWVuIGRpc3Bvc2VkIGJlZm9yZSBpdCBlbmRzIHVwIGJlaW5nIGFwcGxpZWQuIElmIHRoYXQgaXMgdGhlXHJcbiAgICAvLyBjYXNlLCB3ZSBzaG91bGRuJ3QgZG8gYW55dGhpbmcuXHJcbiAgICBpZiAoIXRoaXMuX292ZXJsYXlSZWYgfHwgIXRoaXMuX292ZXJsYXlSZWYuaGFzQXR0YWNoZWQoKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fb3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zdHlsZTtcclxuICAgIGNvbnN0IHBhcmVudFN0eWxlcyA9IHRoaXMuX292ZXJsYXlSZWYuaG9zdEVsZW1lbnQuc3R5bGU7XHJcbiAgICBjb25zdCBjb25maWcgPSB0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpO1xyXG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIG1heFdpZHRoLCBtYXhIZWlnaHR9ID0gY29uZmlnO1xyXG4gICAgY29uc3Qgc2hvdWxkQmVGbHVzaEhvcml6b250YWxseSA9ICh3aWR0aCA9PT0gJzEwMCUnIHx8IHdpZHRoID09PSAnMTAwdncnKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICghbWF4V2lkdGggfHwgbWF4V2lkdGggPT09ICcxMDAlJyB8fCBtYXhXaWR0aCA9PT0gJzEwMHZ3Jyk7XHJcbiAgICBjb25zdCBzaG91bGRCZUZsdXNoVmVydGljYWxseSA9IChoZWlnaHQgPT09ICcxMDAlJyB8fCBoZWlnaHQgPT09ICcxMDB2aCcpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICghbWF4SGVpZ2h0IHx8IG1heEhlaWdodCA9PT0gJzEwMCUnIHx8IG1heEhlaWdodCA9PT0gJzEwMHZoJyk7XHJcblxyXG4gICAgc3R5bGVzLnBvc2l0aW9uID0gdGhpcy5fY3NzUG9zaXRpb247XHJcbiAgICBzdHlsZXMubWFyZ2luTGVmdCA9IHNob3VsZEJlRmx1c2hIb3Jpem9udGFsbHkgPyAnMCcgOiB0aGlzLl9sZWZ0T2Zmc2V0O1xyXG4gICAgc3R5bGVzLm1hcmdpblRvcCA9IHNob3VsZEJlRmx1c2hWZXJ0aWNhbGx5ID8gJzAnIDogdGhpcy5fdG9wT2Zmc2V0O1xyXG4gICAgc3R5bGVzLm1hcmdpbkJvdHRvbSA9IHRoaXMuX2JvdHRvbU9mZnNldDtcclxuICAgIHN0eWxlcy5tYXJnaW5SaWdodCA9IHRoaXMuX3JpZ2h0T2Zmc2V0O1xyXG5cclxuICAgIGlmIChzaG91bGRCZUZsdXNoSG9yaXpvbnRhbGx5KSB7XHJcbiAgICAgIHBhcmVudFN0eWxlcy5qdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JztcclxuICAgIH0gZWxzZSBpZiAodGhpcy5fanVzdGlmeUNvbnRlbnQgPT09ICdjZW50ZXInKSB7XHJcbiAgICAgIHBhcmVudFN0eWxlcy5qdXN0aWZ5Q29udGVudCA9ICdjZW50ZXInO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9vdmVybGF5UmVmLmdldENvbmZpZygpLmRpcmVjdGlvbiA9PT0gJ3J0bCcpIHtcclxuICAgICAgLy8gSW4gUlRMIHRoZSBicm93c2VyIHdpbGwgaW52ZXJ0IGBmbGV4LXN0YXJ0YCBhbmQgYGZsZXgtZW5kYCBhdXRvbWF0aWNhbGx5LCBidXQgd2VcclxuICAgICAgLy8gZG9uJ3Qgd2FudCB0aGF0IGJlY2F1c2Ugb3VyIHBvc2l0aW9uaW5nIGlzIGV4cGxpY2l0bHkgYGxlZnRgIGFuZCBgcmlnaHRgLCBoZW5jZVxyXG4gICAgICAvLyB3aHkgd2UgZG8gYW5vdGhlciBpbnZlcnNpb24gdG8gZW5zdXJlIHRoYXQgdGhlIG92ZXJsYXkgc3RheXMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAgICAgIC8vIFRPRE86IHJlY29uc2lkZXIgdGhpcyBpZiB3ZSBhZGQgYHN0YXJ0YCBhbmQgYGVuZGAgbWV0aG9kcy5cclxuICAgICAgaWYgKHRoaXMuX2p1c3RpZnlDb250ZW50ID09PSAnZmxleC1zdGFydCcpIHtcclxuICAgICAgICBwYXJlbnRTdHlsZXMuanVzdGlmeUNvbnRlbnQgPSAnZmxleC1lbmQnO1xyXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2p1c3RpZnlDb250ZW50ID09PSAnZmxleC1lbmQnKSB7XHJcbiAgICAgICAgcGFyZW50U3R5bGVzLmp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwYXJlbnRTdHlsZXMuanVzdGlmeUNvbnRlbnQgPSB0aGlzLl9qdXN0aWZ5Q29udGVudDtcclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRTdHlsZXMuYWxpZ25JdGVtcyA9IHNob3VsZEJlRmx1c2hWZXJ0aWNhbGx5ID8gJ2ZsZXgtc3RhcnQnIDogdGhpcy5fYWxpZ25JdGVtcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFucyB1cCB0aGUgRE9NIGNoYW5nZXMgZnJvbSB0aGUgcG9zaXRpb24gc3RyYXRlZ3kuXHJcbiAgICogQGRvY3MtcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5faXNEaXNwb3NlZCB8fCAhdGhpcy5fb3ZlcmxheVJlZikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5fb3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudC5zdHlsZTtcclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX292ZXJsYXlSZWYuaG9zdEVsZW1lbnQ7XHJcbiAgICBjb25zdCBwYXJlbnRTdHlsZXMgPSBwYXJlbnQuc3R5bGU7XHJcblxyXG4gICAgcGFyZW50LmNsYXNzTGlzdC5yZW1vdmUod3JhcHBlckNsYXNzKTtcclxuICAgIHBhcmVudFN0eWxlcy5qdXN0aWZ5Q29udGVudCA9IHBhcmVudFN0eWxlcy5hbGlnbkl0ZW1zID0gc3R5bGVzLm1hcmdpblRvcCA9XHJcbiAgICAgIHN0eWxlcy5tYXJnaW5Cb3R0b20gPSBzdHlsZXMubWFyZ2luTGVmdCA9IHN0eWxlcy5tYXJnaW5SaWdodCA9IHN0eWxlcy5wb3NpdGlvbiA9ICcnO1xyXG5cclxuICAgIHRoaXMuX292ZXJsYXlSZWYgPSBudWxsITtcclxuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSB0cnVlO1xyXG4gIH1cclxufVxyXG4iXX0=