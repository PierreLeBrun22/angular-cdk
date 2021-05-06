/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A pending copy-to-clipboard operation.
 *
 * The implementation of copying text to the clipboard modifies the DOM and
 * forces a relayout. This relayout can take too long if the string is large,
 * causing the execCommand('copy') to happen too long after the user clicked.
 * This results in the browser refusing to copy. This object lets the
 * relayout happen in a separate tick from copying by providing a copy function
 * that can be called later.
 *
 * Destroy must be called when no longer in use, regardless of whether `copy` is
 * called.
 */
export class PendingCopy {
    constructor(text, _document) {
        this._document = _document;
        const textarea = this._textarea = this._document.createElement('textarea');
        const styles = textarea.style;
        // Hide the element for display and accessibility. Set a fixed position so the page layout
        // isn't affected. We use `fixed` with `top: 0`, because focus is moved into the textarea
        // for a split second and if it's off-screen, some browsers will attempt to scroll it into view.
        styles.position = 'fixed';
        styles.top = styles.opacity = '0';
        styles.left = '-999em';
        textarea.setAttribute('aria-hidden', 'true');
        textarea.value = text;
        this._document.body.appendChild(textarea);
    }
    /** Finishes copying the text. */
    copy() {
        const textarea = this._textarea;
        let successful = false;
        try { // Older browsers could throw if copy is not supported.
            if (textarea) {
                const currentFocus = this._document.activeElement;
                textarea.select();
                textarea.setSelectionRange(0, textarea.value.length);
                successful = this._document.execCommand('copy');
                if (currentFocus) {
                    currentFocus.focus();
                }
            }
        }
        catch (_a) {
            // Discard error.
            // Initial setting of {@code successful} will represent failure here.
        }
        return successful;
    }
    /** Cleans up DOM changes used to perform the copy operation. */
    destroy() {
        const textarea = this._textarea;
        if (textarea) {
            if (textarea.parentNode) {
                textarea.parentNode.removeChild(textarea);
            }
            this._textarea = undefined;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVuZGluZy1jb3B5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jbGlwYm9hcmQvcGVuZGluZy1jb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxXQUFXO0lBR3RCLFlBQVksSUFBWSxFQUFtQixTQUFtQjtRQUFuQixjQUFTLEdBQVQsU0FBUyxDQUFVO1FBQzVELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDM0UsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUU5QiwwRkFBMEY7UUFDMUYseUZBQXlGO1FBQ3pGLGdHQUFnRztRQUNoRyxNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUMxQixNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLFFBQVEsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLElBQUk7UUFDRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztRQUV2QixJQUFJLEVBQUcsdURBQXVEO1lBQzVELElBQUksUUFBUSxFQUFFO2dCQUNaLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBd0MsQ0FBQztnQkFFN0UsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQixRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3JELFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxZQUFZLEVBQUU7b0JBQ2hCLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDdEI7YUFDRjtTQUNGO1FBQUMsV0FBTTtZQUNOLGlCQUFpQjtZQUNqQixxRUFBcUU7U0FDdEU7UUFFRCxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLE9BQU87UUFDTCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWhDLElBQUksUUFBUSxFQUFFO1lBQ1osSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUN2QixRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMzQztZQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG4vKipcclxuICogQSBwZW5kaW5nIGNvcHktdG8tY2xpcGJvYXJkIG9wZXJhdGlvbi5cclxuICpcclxuICogVGhlIGltcGxlbWVudGF0aW9uIG9mIGNvcHlpbmcgdGV4dCB0byB0aGUgY2xpcGJvYXJkIG1vZGlmaWVzIHRoZSBET00gYW5kXHJcbiAqIGZvcmNlcyBhIHJlbGF5b3V0LiBUaGlzIHJlbGF5b3V0IGNhbiB0YWtlIHRvbyBsb25nIGlmIHRoZSBzdHJpbmcgaXMgbGFyZ2UsXHJcbiAqIGNhdXNpbmcgdGhlIGV4ZWNDb21tYW5kKCdjb3B5JykgdG8gaGFwcGVuIHRvbyBsb25nIGFmdGVyIHRoZSB1c2VyIGNsaWNrZWQuXHJcbiAqIFRoaXMgcmVzdWx0cyBpbiB0aGUgYnJvd3NlciByZWZ1c2luZyB0byBjb3B5LiBUaGlzIG9iamVjdCBsZXRzIHRoZVxyXG4gKiByZWxheW91dCBoYXBwZW4gaW4gYSBzZXBhcmF0ZSB0aWNrIGZyb20gY29weWluZyBieSBwcm92aWRpbmcgYSBjb3B5IGZ1bmN0aW9uXHJcbiAqIHRoYXQgY2FuIGJlIGNhbGxlZCBsYXRlci5cclxuICpcclxuICogRGVzdHJveSBtdXN0IGJlIGNhbGxlZCB3aGVuIG5vIGxvbmdlciBpbiB1c2UsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBgY29weWAgaXNcclxuICogY2FsbGVkLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFBlbmRpbmdDb3B5IHtcclxuICBwcml2YXRlIF90ZXh0YXJlYTogSFRNTFRleHRBcmVhRWxlbWVudHx1bmRlZmluZWQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHRleHQ6IHN0cmluZywgcHJpdmF0ZSByZWFkb25seSBfZG9jdW1lbnQ6IERvY3VtZW50KSB7XHJcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhID0gdGhpcy5fZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcclxuICAgIGNvbnN0IHN0eWxlcyA9IHRleHRhcmVhLnN0eWxlO1xyXG5cclxuICAgIC8vIEhpZGUgdGhlIGVsZW1lbnQgZm9yIGRpc3BsYXkgYW5kIGFjY2Vzc2liaWxpdHkuIFNldCBhIGZpeGVkIHBvc2l0aW9uIHNvIHRoZSBwYWdlIGxheW91dFxyXG4gICAgLy8gaXNuJ3QgYWZmZWN0ZWQuIFdlIHVzZSBgZml4ZWRgIHdpdGggYHRvcDogMGAsIGJlY2F1c2UgZm9jdXMgaXMgbW92ZWQgaW50byB0aGUgdGV4dGFyZWFcclxuICAgIC8vIGZvciBhIHNwbGl0IHNlY29uZCBhbmQgaWYgaXQncyBvZmYtc2NyZWVuLCBzb21lIGJyb3dzZXJzIHdpbGwgYXR0ZW1wdCB0byBzY3JvbGwgaXQgaW50byB2aWV3LlxyXG4gICAgc3R5bGVzLnBvc2l0aW9uID0gJ2ZpeGVkJztcclxuICAgIHN0eWxlcy50b3AgPSBzdHlsZXMub3BhY2l0eSA9ICcwJztcclxuICAgIHN0eWxlcy5sZWZ0ID0gJy05OTllbSc7XHJcbiAgICB0ZXh0YXJlYS5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcclxuICAgIHRleHRhcmVhLnZhbHVlID0gdGV4dDtcclxuICAgIHRoaXMuX2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGV4dGFyZWEpO1xyXG4gIH1cclxuXHJcbiAgLyoqIEZpbmlzaGVzIGNvcHlpbmcgdGhlIHRleHQuICovXHJcbiAgY29weSgpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHRleHRhcmVhID0gdGhpcy5fdGV4dGFyZWE7XHJcbiAgICBsZXQgc3VjY2Vzc2Z1bCA9IGZhbHNlO1xyXG5cclxuICAgIHRyeSB7ICAvLyBPbGRlciBicm93c2VycyBjb3VsZCB0aHJvdyBpZiBjb3B5IGlzIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICAgIGlmICh0ZXh0YXJlYSkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRGb2N1cyA9IHRoaXMuX2RvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTE9yU1ZHRWxlbWVudCB8IG51bGw7XHJcblxyXG4gICAgICAgIHRleHRhcmVhLnNlbGVjdCgpO1xyXG4gICAgICAgIHRleHRhcmVhLnNldFNlbGVjdGlvblJhbmdlKDAsIHRleHRhcmVhLnZhbHVlLmxlbmd0aCk7XHJcbiAgICAgICAgc3VjY2Vzc2Z1bCA9IHRoaXMuX2RvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5Jyk7XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50Rm9jdXMpIHtcclxuICAgICAgICAgIGN1cnJlbnRGb2N1cy5mb2N1cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgIC8vIERpc2NhcmQgZXJyb3IuXHJcbiAgICAgIC8vIEluaXRpYWwgc2V0dGluZyBvZiB7QGNvZGUgc3VjY2Vzc2Z1bH0gd2lsbCByZXByZXNlbnQgZmFpbHVyZSBoZXJlLlxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdWNjZXNzZnVsO1xyXG4gIH1cclxuXHJcbiAgLyoqIENsZWFucyB1cCBET00gY2hhbmdlcyB1c2VkIHRvIHBlcmZvcm0gdGhlIGNvcHkgb3BlcmF0aW9uLiAqL1xyXG4gIGRlc3Ryb3koKSB7XHJcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHRoaXMuX3RleHRhcmVhO1xyXG5cclxuICAgIGlmICh0ZXh0YXJlYSkge1xyXG4gICAgICBpZiAodGV4dGFyZWEucGFyZW50Tm9kZSkge1xyXG4gICAgICAgIHRleHRhcmVhLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGV4dGFyZWEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLl90ZXh0YXJlYSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19