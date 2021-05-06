/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, EventEmitter, Input, Output, NgZone, InjectionToken, Inject, Optional, } from '@angular/core';
import { Clipboard } from './clipboard';
/** Injection token that can be used to provide the default options to `CdkCopyToClipboard`. */
export const CDK_COPY_TO_CLIPBOARD_CONFIG = new InjectionToken('CDK_COPY_TO_CLIPBOARD_CONFIG');
/**
 * @deprecated Use `CDK_COPY_TO_CLIPBOARD_CONFIG` instead.
 * @breaking-change 13.0.0
 */
export const CKD_COPY_TO_CLIPBOARD_CONFIG = CDK_COPY_TO_CLIPBOARD_CONFIG;
/**
 * Provides behavior for a button that when clicked copies content into user's
 * clipboard.
 */
export class CdkCopyToClipboard {
    constructor(_clipboard, _ngZone, config) {
        this._clipboard = _clipboard;
        this._ngZone = _ngZone;
        /** Content to be copied. */
        this.text = '';
        /**
         * How many times to attempt to copy the text. This may be necessary for longer text, because
         * the browser needs time to fill an intermediate textarea element and copy the content.
         */
        this.attempts = 1;
        /**
         * Emits when some text is copied to the clipboard. The
         * emitted value indicates whether copying was successful.
         */
        this.copied = new EventEmitter();
        /** Copies that are currently being attempted. */
        this._pending = new Set();
        if (config && config.attempts != null) {
            this.attempts = config.attempts;
        }
    }
    /** Copies the current text to the clipboard. */
    copy(attempts = this.attempts) {
        if (attempts > 1) {
            let remainingAttempts = attempts;
            const pending = this._clipboard.beginCopy(this.text);
            this._pending.add(pending);
            const attempt = () => {
                const successful = pending.copy();
                if (!successful && --remainingAttempts && !this._destroyed) {
                    // We use 1 for the timeout since it's more predictable when flushing in unit tests.
                    this._currentTimeout = this._ngZone.runOutsideAngular(() => setTimeout(attempt, 1));
                }
                else {
                    this._currentTimeout = null;
                    this._pending.delete(pending);
                    pending.destroy();
                    this.copied.emit(successful);
                }
            };
            attempt();
        }
        else {
            this.copied.emit(this._clipboard.copy(this.text));
        }
    }
    ngOnDestroy() {
        if (this._currentTimeout) {
            clearTimeout(this._currentTimeout);
        }
        this._pending.forEach(copy => copy.destroy());
        this._pending.clear();
        this._destroyed = true;
    }
}
CdkCopyToClipboard.decorators = [
    { type: Directive, args: [{
                selector: '[cdkCopyToClipboard]',
                host: {
                    '(click)': 'copy()',
                }
            },] }
];
CdkCopyToClipboard.ctorParameters = () => [
    { type: Clipboard },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CKD_COPY_TO_CLIPBOARD_CONFIG,] }] }
];
CdkCopyToClipboard.propDecorators = {
    text: [{ type: Input, args: ['cdkCopyToClipboard',] }],
    attempts: [{ type: Input, args: ['cdkCopyToClipboardAttempts',] }],
    copied: [{ type: Output, args: ['cdkCopyToClipboardCopied',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weS10by1jbGlwYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2NsaXBib2FyZC9jb3B5LXRvLWNsaXBib2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBQ0wsTUFBTSxFQUNOLE1BQU0sRUFDTixjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsR0FFVCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBU3RDLCtGQUErRjtBQUMvRixNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FDckMsSUFBSSxjQUFjLENBQTJCLDhCQUE4QixDQUFDLENBQUM7QUFFakY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsNEJBQTRCLENBQUM7QUFFekU7OztHQUdHO0FBT0gsTUFBTSxPQUFPLGtCQUFrQjtJQXlCN0IsWUFDVSxVQUFxQixFQUNyQixPQUFlLEVBQzJCLE1BQWlDO1FBRjNFLGVBQVUsR0FBVixVQUFVLENBQVc7UUFDckIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQTFCekIsNEJBQTRCO1FBQ0MsU0FBSSxHQUFXLEVBQUUsQ0FBQztRQUUvQzs7O1dBR0c7UUFDa0MsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUUxRDs7O1dBR0c7UUFDaUMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFXLENBQUM7UUFFekUsaURBQWlEO1FBQ3pDLGFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBZSxDQUFDO1FBYXhDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztTQUNqQztJQUNILENBQUM7SUFFRCxnREFBZ0Q7SUFDaEQsSUFBSSxDQUFDLFdBQW1CLElBQUksQ0FBQyxRQUFRO1FBQ25DLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRTtZQUNoQixJQUFJLGlCQUFpQixHQUFHLFFBQVEsQ0FBQztZQUNqQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0IsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO2dCQUNuQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRSxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7b0JBQzFELG9GQUFvRjtvQkFDcEYsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDckY7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7b0JBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM5QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM5QjtZQUNILENBQUMsQ0FBQztZQUNGLE9BQU8sRUFBRSxDQUFDO1NBQ1g7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25EO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNwQztRQUVELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDOzs7WUExRUYsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLElBQUksRUFBRTtvQkFDSixTQUFTLEVBQUUsUUFBUTtpQkFDcEI7YUFDRjs7O1lBNUJPLFNBQVM7WUFOZixNQUFNOzRDQStESCxRQUFRLFlBQUksTUFBTSxTQUFDLDRCQUE0Qjs7O21CQTFCakQsS0FBSyxTQUFDLG9CQUFvQjt1QkFNMUIsS0FBSyxTQUFDLDRCQUE0QjtxQkFNbEMsTUFBTSxTQUFDLDBCQUEwQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRXZlbnRFbWl0dGVyLFxyXG4gIElucHV0LFxyXG4gIE91dHB1dCxcclxuICBOZ1pvbmUsXHJcbiAgSW5qZWN0aW9uVG9rZW4sXHJcbiAgSW5qZWN0LFxyXG4gIE9wdGlvbmFsLFxyXG4gIE9uRGVzdHJveSxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDbGlwYm9hcmR9IGZyb20gJy4vY2xpcGJvYXJkJztcclxuaW1wb3J0IHtQZW5kaW5nQ29weX0gZnJvbSAnLi9wZW5kaW5nLWNvcHknO1xyXG5cclxuLyoqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCBvcHRpb25zIGZvciBgQ2RrQ29weVRvQ2xpcGJvYXJkYC4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDZGtDb3B5VG9DbGlwYm9hcmRDb25maWcge1xyXG4gIC8qKiBEZWZhdWx0IG51bWJlciBvZiBhdHRlbXB0cyB0byBtYWtlIHdoZW4gY29weWluZyB0ZXh0IHRvIHRoZSBjbGlwYm9hcmQuICovXHJcbiAgYXR0ZW1wdHM/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byBwcm92aWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMgdG8gYENka0NvcHlUb0NsaXBib2FyZGAuICovXHJcbmV4cG9ydCBjb25zdCBDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHID1cclxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtDb3B5VG9DbGlwYm9hcmRDb25maWc+KCdDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHJyk7XHJcblxyXG4vKipcclxuICogQGRlcHJlY2F0ZWQgVXNlIGBDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHYCBpbnN0ZWFkLlxyXG4gKiBAYnJlYWtpbmctY2hhbmdlIDEzLjAuMFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IENLRF9DT1BZX1RPX0NMSVBCT0FSRF9DT05GSUcgPSBDREtfQ09QWV9UT19DTElQQk9BUkRfQ09ORklHO1xyXG5cclxuLyoqXHJcbiAqIFByb3ZpZGVzIGJlaGF2aW9yIGZvciBhIGJ1dHRvbiB0aGF0IHdoZW4gY2xpY2tlZCBjb3BpZXMgY29udGVudCBpbnRvIHVzZXInc1xyXG4gKiBjbGlwYm9hcmQuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtDb3B5VG9DbGlwYm9hcmRdJyxcclxuICBob3N0OiB7XHJcbiAgICAnKGNsaWNrKSc6ICdjb3B5KCknLFxyXG4gIH1cclxufSlcclxuZXhwb3J0IGNsYXNzIENka0NvcHlUb0NsaXBib2FyZCBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgLyoqIENvbnRlbnQgdG8gYmUgY29waWVkLiAqL1xyXG4gIEBJbnB1dCgnY2RrQ29weVRvQ2xpcGJvYXJkJykgdGV4dDogc3RyaW5nID0gJyc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEhvdyBtYW55IHRpbWVzIHRvIGF0dGVtcHQgdG8gY29weSB0aGUgdGV4dC4gVGhpcyBtYXkgYmUgbmVjZXNzYXJ5IGZvciBsb25nZXIgdGV4dCwgYmVjYXVzZVxyXG4gICAqIHRoZSBicm93c2VyIG5lZWRzIHRpbWUgdG8gZmlsbCBhbiBpbnRlcm1lZGlhdGUgdGV4dGFyZWEgZWxlbWVudCBhbmQgY29weSB0aGUgY29udGVudC5cclxuICAgKi9cclxuICBASW5wdXQoJ2Nka0NvcHlUb0NsaXBib2FyZEF0dGVtcHRzJykgYXR0ZW1wdHM6IG51bWJlciA9IDE7XHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIHdoZW4gc29tZSB0ZXh0IGlzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLiBUaGVcclxuICAgKiBlbWl0dGVkIHZhbHVlIGluZGljYXRlcyB3aGV0aGVyIGNvcHlpbmcgd2FzIHN1Y2Nlc3NmdWwuXHJcbiAgICovXHJcbiAgQE91dHB1dCgnY2RrQ29weVRvQ2xpcGJvYXJkQ29waWVkJykgY29waWVkID0gbmV3IEV2ZW50RW1pdHRlcjxib29sZWFuPigpO1xyXG5cclxuICAvKiogQ29waWVzIHRoYXQgYXJlIGN1cnJlbnRseSBiZWluZyBhdHRlbXB0ZWQuICovXHJcbiAgcHJpdmF0ZSBfcGVuZGluZyA9IG5ldyBTZXQ8UGVuZGluZ0NvcHk+KCk7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBkaXJlY3RpdmUgaGFzIGJlZW4gZGVzdHJveWVkLiAqL1xyXG4gIHByaXZhdGUgX2Rlc3Ryb3llZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFRpbWVvdXQgZm9yIHRoZSBjdXJyZW50IGNvcHkgYXR0ZW1wdC4gKi9cclxuICBwcml2YXRlIF9jdXJyZW50VGltZW91dDogYW55O1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX2NsaXBib2FyZDogQ2xpcGJvYXJkLFxyXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXHJcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENLRF9DT1BZX1RPX0NMSVBCT0FSRF9DT05GSUcpIGNvbmZpZz86IENka0NvcHlUb0NsaXBib2FyZENvbmZpZykge1xyXG5cclxuICAgIGlmIChjb25maWcgJiYgY29uZmlnLmF0dGVtcHRzICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5hdHRlbXB0cyA9IGNvbmZpZy5hdHRlbXB0cztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDb3BpZXMgdGhlIGN1cnJlbnQgdGV4dCB0byB0aGUgY2xpcGJvYXJkLiAqL1xyXG4gIGNvcHkoYXR0ZW1wdHM6IG51bWJlciA9IHRoaXMuYXR0ZW1wdHMpOiB2b2lkIHtcclxuICAgIGlmIChhdHRlbXB0cyA+IDEpIHtcclxuICAgICAgbGV0IHJlbWFpbmluZ0F0dGVtcHRzID0gYXR0ZW1wdHM7XHJcbiAgICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLl9jbGlwYm9hcmQuYmVnaW5Db3B5KHRoaXMudGV4dCk7XHJcbiAgICAgIHRoaXMuX3BlbmRpbmcuYWRkKHBlbmRpbmcpO1xyXG5cclxuICAgICAgY29uc3QgYXR0ZW1wdCA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBzdWNjZXNzZnVsID0gcGVuZGluZy5jb3B5KCk7XHJcbiAgICAgICAgaWYgKCFzdWNjZXNzZnVsICYmIC0tcmVtYWluaW5nQXR0ZW1wdHMgJiYgIXRoaXMuX2Rlc3Ryb3llZCkge1xyXG4gICAgICAgICAgLy8gV2UgdXNlIDEgZm9yIHRoZSB0aW1lb3V0IHNpbmNlIGl0J3MgbW9yZSBwcmVkaWN0YWJsZSB3aGVuIGZsdXNoaW5nIGluIHVuaXQgdGVzdHMuXHJcbiAgICAgICAgICB0aGlzLl9jdXJyZW50VGltZW91dCA9IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiBzZXRUaW1lb3V0KGF0dGVtcHQsIDEpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fY3VycmVudFRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgICAgdGhpcy5fcGVuZGluZy5kZWxldGUocGVuZGluZyk7XHJcbiAgICAgICAgICBwZW5kaW5nLmRlc3Ryb3koKTtcclxuICAgICAgICAgIHRoaXMuY29waWVkLmVtaXQoc3VjY2Vzc2Z1bCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBhdHRlbXB0KCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmNvcGllZC5lbWl0KHRoaXMuX2NsaXBib2FyZC5jb3B5KHRoaXMudGV4dCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBpZiAodGhpcy5fY3VycmVudFRpbWVvdXQpIHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2N1cnJlbnRUaW1lb3V0KTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wZW5kaW5nLmZvckVhY2goY29weSA9PiBjb3B5LmRlc3Ryb3koKSk7XHJcbiAgICB0aGlzLl9wZW5kaW5nLmNsZWFyKCk7XHJcbiAgICB0aGlzLl9kZXN0cm95ZWQgPSB0cnVlO1xyXG4gIH1cclxufVxyXG4iXX0=