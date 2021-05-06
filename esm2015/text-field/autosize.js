/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, Input, NgZone, HostListener, Optional, Inject, } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { auditTime, takeUntil } from 'rxjs/operators';
import { fromEvent, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
/** Directive to automatically resize a textarea to fit its content. */
export class CdkTextareaAutosize {
    constructor(_elementRef, _platform, _ngZone, 
    /** @breaking-change 11.0.0 make document required */
    document) {
        this._elementRef = _elementRef;
        this._platform = _platform;
        this._ngZone = _ngZone;
        this._destroyed = new Subject();
        this._enabled = true;
        /**
         * Value of minRows as of last resize. If the minRows has decreased, the
         * height of the textarea needs to be recomputed to reflect the new minimum. The maxHeight
         * does not have the same problem because it does not affect the textarea's scrollHeight.
         */
        this._previousMinRows = -1;
        this._document = document;
        this._textareaElement = this._elementRef.nativeElement;
        this._measuringClass = _platform.FIREFOX ?
            'cdk-textarea-autosize-measuring-firefox' :
            'cdk-textarea-autosize-measuring';
    }
    /** Minimum amount of rows in the textarea. */
    get minRows() { return this._minRows; }
    set minRows(value) {
        this._minRows = coerceNumberProperty(value);
        this._setMinHeight();
    }
    /** Maximum amount of rows in the textarea. */
    get maxRows() { return this._maxRows; }
    set maxRows(value) {
        this._maxRows = coerceNumberProperty(value);
        this._setMaxHeight();
    }
    /** Whether autosizing is enabled or not */
    get enabled() { return this._enabled; }
    set enabled(value) {
        value = coerceBooleanProperty(value);
        // Only act if the actual value changed. This specifically helps to not run
        // resizeToFitContent too early (i.e. before ngAfterViewInit)
        if (this._enabled !== value) {
            (this._enabled = value) ? this.resizeToFitContent(true) : this.reset();
        }
    }
    /** Sets the minimum height of the textarea as determined by minRows. */
    _setMinHeight() {
        const minHeight = this.minRows && this._cachedLineHeight ?
            `${this.minRows * this._cachedLineHeight}px` : null;
        if (minHeight) {
            this._textareaElement.style.minHeight = minHeight;
        }
    }
    /** Sets the maximum height of the textarea as determined by maxRows. */
    _setMaxHeight() {
        const maxHeight = this.maxRows && this._cachedLineHeight ?
            `${this.maxRows * this._cachedLineHeight}px` : null;
        if (maxHeight) {
            this._textareaElement.style.maxHeight = maxHeight;
        }
    }
    ngAfterViewInit() {
        if (this._platform.isBrowser) {
            // Remember the height which we started with in case autosizing is disabled
            this._initialHeight = this._textareaElement.style.height;
            this.resizeToFitContent();
            this._ngZone.runOutsideAngular(() => {
                const window = this._getWindow();
                fromEvent(window, 'resize')
                    .pipe(auditTime(16), takeUntil(this._destroyed))
                    .subscribe(() => this.resizeToFitContent(true));
            });
        }
    }
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    /**
     * Cache the height of a single-row textarea if it has not already been cached.
     *
     * We need to know how large a single "row" of a textarea is in order to apply minRows and
     * maxRows. For the initial version, we will assume that the height of a single line in the
     * textarea does not ever change.
     */
    _cacheTextareaLineHeight() {
        if (this._cachedLineHeight) {
            return;
        }
        // Use a clone element because we have to override some styles.
        let textareaClone = this._textareaElement.cloneNode(false);
        textareaClone.rows = 1;
        // Use `position: absolute` so that this doesn't cause a browser layout and use
        // `visibility: hidden` so that nothing is rendered. Clear any other styles that
        // would affect the height.
        textareaClone.style.position = 'absolute';
        textareaClone.style.visibility = 'hidden';
        textareaClone.style.border = 'none';
        textareaClone.style.padding = '0';
        textareaClone.style.height = '';
        textareaClone.style.minHeight = '';
        textareaClone.style.maxHeight = '';
        // In Firefox it happens that textarea elements are always bigger than the specified amount
        // of rows. This is because Firefox tries to add extra space for the horizontal scrollbar.
        // As a workaround that removes the extra space for the scrollbar, we can just set overflow
        // to hidden. This ensures that there is no invalid calculation of the line height.
        // See Firefox bug report: https://bugzilla.mozilla.org/show_bug.cgi?id=33654
        textareaClone.style.overflow = 'hidden';
        this._textareaElement.parentNode.appendChild(textareaClone);
        this._cachedLineHeight = textareaClone.clientHeight;
        this._textareaElement.parentNode.removeChild(textareaClone);
        // Min and max heights have to be re-calculated if the cached line height changes
        this._setMinHeight();
        this._setMaxHeight();
    }
    ngDoCheck() {
        if (this._platform.isBrowser) {
            this.resizeToFitContent();
        }
    }
    /**
     * Resize the textarea to fit its content.
     * @param force Whether to force a height recalculation. By default the height will be
     *    recalculated only if the value changed since the last call.
     */
    resizeToFitContent(force = false) {
        // If autosizing is disabled, just skip everything else
        if (!this._enabled) {
            return;
        }
        this._cacheTextareaLineHeight();
        // If we haven't determined the line-height yet, we know we're still hidden and there's no point
        // in checking the height of the textarea.
        if (!this._cachedLineHeight) {
            return;
        }
        const textarea = this._elementRef.nativeElement;
        const value = textarea.value;
        // Only resize if the value or minRows have changed since these calculations can be expensive.
        if (!force && this._minRows === this._previousMinRows && value === this._previousValue) {
            return;
        }
        const placeholderText = textarea.placeholder;
        // Reset the textarea height to auto in order to shrink back to its default size.
        // Also temporarily force overflow:hidden, so scroll bars do not interfere with calculations.
        // Long placeholders that are wider than the textarea width may lead to a bigger scrollHeight
        // value. To ensure that the scrollHeight is not bigger than the content, the placeholders
        // need to be removed temporarily.
        textarea.classList.add(this._measuringClass);
        textarea.placeholder = '';
        // The measuring class includes a 2px padding to workaround an issue with Chrome,
        // so we account for that extra space here by subtracting 4 (2px top + 2px bottom).
        const height = textarea.scrollHeight - 4;
        // Use the scrollHeight to know how large the textarea *would* be if fit its entire value.
        textarea.style.height = `${height}px`;
        textarea.classList.remove(this._measuringClass);
        textarea.placeholder = placeholderText;
        this._ngZone.runOutsideAngular(() => {
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(() => this._scrollToCaretPosition(textarea));
            }
            else {
                setTimeout(() => this._scrollToCaretPosition(textarea));
            }
        });
        this._previousValue = value;
        this._previousMinRows = this._minRows;
    }
    /**
     * Resets the textarea to its original size
     */
    reset() {
        // Do not try to change the textarea, if the initialHeight has not been determined yet
        // This might potentially remove styles when reset() is called before ngAfterViewInit
        if (this._initialHeight !== undefined) {
            this._textareaElement.style.height = this._initialHeight;
        }
    }
    // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
    // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
    // can move this back into `host`.
    // tslint:disable:no-host-decorator-in-concrete
    _noopInputHandler() {
        // no-op handler that ensures we're running change detection on input events.
    }
    /** Access injected document if available or fallback to global document reference */
    _getDocument() {
        return this._document || document;
    }
    /** Use defaultView of injected document if available or fallback to global window reference */
    _getWindow() {
        const doc = this._getDocument();
        return doc.defaultView || window;
    }
    /**
     * Scrolls a textarea to the caret position. On Firefox resizing the textarea will
     * prevent it from scrolling to the caret position. We need to re-set the selection
     * in order for it to scroll to the proper position.
     */
    _scrollToCaretPosition(textarea) {
        const { selectionStart, selectionEnd } = textarea;
        const document = this._getDocument();
        // IE will throw an "Unspecified error" if we try to set the selection range after the
        // element has been removed from the DOM. Assert that the directive hasn't been destroyed
        // between the time we requested the animation frame and when it was executed.
        // Also note that we have to assert that the textarea is focused before we set the
        // selection range. Setting the selection range on a non-focused textarea will cause
        // it to receive focus on IE and Edge.
        if (!this._destroyed.isStopped && document.activeElement === textarea) {
            textarea.setSelectionRange(selectionStart, selectionEnd);
        }
    }
}
CdkTextareaAutosize.decorators = [
    { type: Directive, args: [{
                selector: 'textarea[cdkTextareaAutosize]',
                exportAs: 'cdkTextareaAutosize',
                host: {
                    'class': 'cdk-textarea-autosize',
                    // Textarea elements that have the directive applied should have a single row by default.
                    // Browsers normally show two rows by default and therefore this limits the minRows binding.
                    'rows': '1',
                },
            },] }
];
CdkTextareaAutosize.ctorParameters = () => [
    { type: ElementRef },
    { type: Platform },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DOCUMENT,] }] }
];
CdkTextareaAutosize.propDecorators = {
    minRows: [{ type: Input, args: ['cdkAutosizeMinRows',] }],
    maxRows: [{ type: Input, args: ['cdkAutosizeMaxRows',] }],
    enabled: [{ type: Input, args: ['cdkTextareaAutosize',] }],
    _noopInputHandler: [{ type: HostListener, args: ['input',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NpemUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RleHQtZmllbGQvYXV0b3NpemUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLHFCQUFxQixFQUNyQixvQkFBb0IsRUFFckIsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQixPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixLQUFLLEVBSUwsTUFBTSxFQUNOLFlBQVksRUFDWixRQUFRLEVBQ1IsTUFBTSxHQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ3BELE9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV6Qyx1RUFBdUU7QUFXdkUsTUFBTSxPQUFPLG1CQUFtQjtJQXlEOUIsWUFBb0IsV0FBb0MsRUFDcEMsU0FBbUIsRUFDbkIsT0FBZTtJQUN2QixxREFBcUQ7SUFDdkIsUUFBYztRQUpwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFDcEMsY0FBUyxHQUFULFNBQVMsQ0FBVTtRQUNuQixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBdkRsQixlQUFVLEdBQUcsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUkxQyxhQUFRLEdBQVksSUFBSSxDQUFDO1FBRWpDOzs7O1dBSUc7UUFDSyxxQkFBZ0IsR0FBVyxDQUFDLENBQUMsQ0FBQztRQStDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFFMUIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBb0MsQ0FBQztRQUM5RSxJQUFJLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4Qyx5Q0FBeUMsQ0FBQyxDQUFDO1lBQzNDLGlDQUFpQyxDQUFDO0lBQ3RDLENBQUM7SUFqREQsOENBQThDO0lBQzlDLElBQ0ksT0FBTyxLQUFhLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxPQUFPLENBQUMsS0FBYTtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsOENBQThDO0lBQzlDLElBQ0ksT0FBTyxLQUFhLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDL0MsSUFBSSxPQUFPLENBQUMsS0FBYTtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsMkNBQTJDO0lBQzNDLElBQ0ksT0FBTyxLQUFjLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDaEQsSUFBSSxPQUFPLENBQUMsS0FBYztRQUN4QixLQUFLLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFckMsMkVBQTJFO1FBQzNFLDZEQUE2RDtRQUM3RCxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQzNCLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDeEU7SUFDSCxDQUFDO0lBd0JELHdFQUF3RTtJQUN4RSxhQUFhO1FBQ1gsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUN0RCxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV4RCxJQUFJLFNBQVMsRUFBRztZQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztTQUNuRDtJQUNILENBQUM7SUFFRCx3RUFBd0U7SUFDeEUsYUFBYTtRQUNYLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdEQsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFeEQsSUFBSSxTQUFTLEVBQUU7WUFDYixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDbkQ7SUFDSCxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUU7WUFDNUIsMkVBQTJFO1lBQzNFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFFekQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFFakMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7cUJBQ3hCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDL0MsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ssd0JBQXdCO1FBQzlCLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQzFCLE9BQU87U0FDUjtRQUVELCtEQUErRDtRQUMvRCxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBd0IsQ0FBQztRQUNsRixhQUFhLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUV2QiwrRUFBK0U7UUFDL0UsZ0ZBQWdGO1FBQ2hGLDJCQUEyQjtRQUMzQixhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7UUFDMUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO1FBQzFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNwQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7UUFDbEMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLGFBQWEsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQyxhQUFhLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFFbkMsMkZBQTJGO1FBQzNGLDBGQUEwRjtRQUMxRiwyRkFBMkY7UUFDM0YsbUZBQW1GO1FBQ25GLDZFQUE2RTtRQUM3RSxhQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFN0QsaUZBQWlGO1FBQ2pGLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQzVCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQzNCO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxrQkFBa0IsQ0FBQyxRQUFpQixLQUFLO1FBQ3ZDLHVEQUF1RDtRQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNsQixPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUVoQyxnR0FBZ0c7UUFDaEcsMENBQTBDO1FBQzFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDM0IsT0FBTztTQUNSO1FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFvQyxDQUFDO1FBQ3ZFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFFN0IsOEZBQThGO1FBQzlGLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdEYsT0FBTztTQUNSO1FBRUQsTUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUU3QyxpRkFBaUY7UUFDakYsNkZBQTZGO1FBQzdGLDZGQUE2RjtRQUM3RiwwRkFBMEY7UUFDMUYsa0NBQWtDO1FBQ2xDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3QyxRQUFRLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUUxQixpRkFBaUY7UUFDakYsbUZBQW1GO1FBQ25GLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBRXpDLDBGQUEwRjtRQUMxRixRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDO1FBQ3RDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNoRCxRQUFRLENBQUMsV0FBVyxHQUFHLGVBQWUsQ0FBQztRQUV2QyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUNsQyxJQUFJLE9BQU8scUJBQXFCLEtBQUssV0FBVyxFQUFFO2dCQUNoRCxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzthQUNwRTtpQkFBTTtnQkFDTCxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7YUFDekQ7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUs7UUFDSCxzRkFBc0Y7UUFDdEYscUZBQXFGO1FBQ3JGLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxTQUFTLEVBQUU7WUFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztTQUMxRDtJQUNILENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLGtDQUFrQztJQUNsQywrQ0FBK0M7SUFFL0MsaUJBQWlCO1FBQ2YsNkVBQTZFO0lBQy9FLENBQUM7SUFFRCxxRkFBcUY7SUFDN0UsWUFBWTtRQUNsQixPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDO0lBQ3BDLENBQUM7SUFFRCwrRkFBK0Y7SUFDdkYsVUFBVTtRQUNoQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEMsT0FBTyxHQUFHLENBQUMsV0FBVyxJQUFJLE1BQU0sQ0FBQztJQUNuQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLHNCQUFzQixDQUFDLFFBQTZCO1FBQzFELE1BQU0sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFDLEdBQUcsUUFBUSxDQUFDO1FBQ2hELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUVyQyxzRkFBc0Y7UUFDdEYseUZBQXlGO1FBQ3pGLDhFQUE4RTtRQUM5RSxrRkFBa0Y7UUFDbEYsb0ZBQW9GO1FBQ3BGLHNDQUFzQztRQUN0QyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLGFBQWEsS0FBSyxRQUFRLEVBQUU7WUFDckUsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUMxRDtJQUNILENBQUM7OztZQXRSRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLCtCQUErQjtnQkFDekMsUUFBUSxFQUFFLHFCQUFxQjtnQkFDL0IsSUFBSSxFQUFFO29CQUNKLE9BQU8sRUFBRSx1QkFBdUI7b0JBQ2hDLHlGQUF5RjtvQkFDekYsNEZBQTRGO29CQUM1RixNQUFNLEVBQUUsR0FBRztpQkFDWjthQUNGOzs7WUF6QkMsVUFBVTtZQVVKLFFBQVE7WUFMZCxNQUFNOzRDQWtGTyxRQUFRLFlBQUksTUFBTSxTQUFDLFFBQVE7OztzQkF6Q3ZDLEtBQUssU0FBQyxvQkFBb0I7c0JBUTFCLEtBQUssU0FBQyxvQkFBb0I7c0JBUTFCLEtBQUssU0FBQyxxQkFBcUI7Z0NBc00zQixZQUFZLFNBQUMsT0FBTyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBCb29sZWFuSW5wdXQsXHJcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxyXG4gIGNvZXJjZU51bWJlclByb3BlcnR5LFxyXG4gIE51bWJlcklucHV0XHJcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBJbnB1dCxcclxuICBBZnRlclZpZXdJbml0LFxyXG4gIERvQ2hlY2ssXHJcbiAgT25EZXN0cm95LFxyXG4gIE5nWm9uZSxcclxuICBIb3N0TGlzdGVuZXIsXHJcbiAgT3B0aW9uYWwsXHJcbiAgSW5qZWN0LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge2F1ZGl0VGltZSwgdGFrZVVudGlsfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuXHJcbi8qKiBEaXJlY3RpdmUgdG8gYXV0b21hdGljYWxseSByZXNpemUgYSB0ZXh0YXJlYSB0byBmaXQgaXRzIGNvbnRlbnQuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAndGV4dGFyZWFbY2RrVGV4dGFyZWFBdXRvc2l6ZV0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrVGV4dGFyZWFBdXRvc2l6ZScsXHJcbiAgaG9zdDoge1xyXG4gICAgJ2NsYXNzJzogJ2Nkay10ZXh0YXJlYS1hdXRvc2l6ZScsXHJcbiAgICAvLyBUZXh0YXJlYSBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIGRpcmVjdGl2ZSBhcHBsaWVkIHNob3VsZCBoYXZlIGEgc2luZ2xlIHJvdyBieSBkZWZhdWx0LlxyXG4gICAgLy8gQnJvd3NlcnMgbm9ybWFsbHkgc2hvdyB0d28gcm93cyBieSBkZWZhdWx0IGFuZCB0aGVyZWZvcmUgdGhpcyBsaW1pdHMgdGhlIG1pblJvd3MgYmluZGluZy5cclxuICAgICdyb3dzJzogJzEnLFxyXG4gIH0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtUZXh0YXJlYUF1dG9zaXplIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgRG9DaGVjaywgT25EZXN0cm95IHtcclxuICAvKiogS2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgdGV4dGFyZWEgdmFsdWUgdG8gYXZvaWQgcmVzaXppbmcgd2hlbiB0aGUgdmFsdWUgaGFzbid0IGNoYW5nZWQuICovXHJcbiAgcHJpdmF0ZSBfcHJldmlvdXNWYWx1ZT86IHN0cmluZztcclxuICBwcml2YXRlIF9pbml0aWFsSGVpZ2h0OiBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgcHJpdmF0ZSBfbWluUm93czogbnVtYmVyO1xyXG4gIHByaXZhdGUgX21heFJvd3M6IG51bWJlcjtcclxuICBwcml2YXRlIF9lbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgLyoqXHJcbiAgICogVmFsdWUgb2YgbWluUm93cyBhcyBvZiBsYXN0IHJlc2l6ZS4gSWYgdGhlIG1pblJvd3MgaGFzIGRlY3JlYXNlZCwgdGhlXHJcbiAgICogaGVpZ2h0IG9mIHRoZSB0ZXh0YXJlYSBuZWVkcyB0byBiZSByZWNvbXB1dGVkIHRvIHJlZmxlY3QgdGhlIG5ldyBtaW5pbXVtLiBUaGUgbWF4SGVpZ2h0XHJcbiAgICogZG9lcyBub3QgaGF2ZSB0aGUgc2FtZSBwcm9ibGVtIGJlY2F1c2UgaXQgZG9lcyBub3QgYWZmZWN0IHRoZSB0ZXh0YXJlYSdzIHNjcm9sbEhlaWdodC5cclxuICAgKi9cclxuICBwcml2YXRlIF9wcmV2aW91c01pblJvd3M6IG51bWJlciA9IC0xO1xyXG5cclxuICBwcml2YXRlIF90ZXh0YXJlYUVsZW1lbnQ6IEhUTUxUZXh0QXJlYUVsZW1lbnQ7XHJcblxyXG4gIC8qKiBNaW5pbXVtIGFtb3VudCBvZiByb3dzIGluIHRoZSB0ZXh0YXJlYS4gKi9cclxuICBASW5wdXQoJ2Nka0F1dG9zaXplTWluUm93cycpXHJcbiAgZ2V0IG1pblJvd3MoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX21pblJvd3M7IH1cclxuICBzZXQgbWluUm93cyh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9taW5Sb3dzID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpO1xyXG4gICAgdGhpcy5fc2V0TWluSGVpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICAvKiogTWF4aW11bSBhbW91bnQgb2Ygcm93cyBpbiB0aGUgdGV4dGFyZWEuICovXHJcbiAgQElucHV0KCdjZGtBdXRvc2l6ZU1heFJvd3MnKVxyXG4gIGdldCBtYXhSb3dzKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9tYXhSb3dzOyB9XHJcbiAgc2V0IG1heFJvd3ModmFsdWU6IG51bWJlcikge1xyXG4gICAgdGhpcy5fbWF4Um93cyA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcclxuICAgIHRoaXMuX3NldE1heEhlaWdodCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFdoZXRoZXIgYXV0b3NpemluZyBpcyBlbmFibGVkIG9yIG5vdCAqL1xyXG4gIEBJbnB1dCgnY2RrVGV4dGFyZWFBdXRvc2l6ZScpXHJcbiAgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9lbmFibGVkOyB9XHJcbiAgc2V0IGVuYWJsZWQodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgIHZhbHVlID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcclxuXHJcbiAgICAvLyBPbmx5IGFjdCBpZiB0aGUgYWN0dWFsIHZhbHVlIGNoYW5nZWQuIFRoaXMgc3BlY2lmaWNhbGx5IGhlbHBzIHRvIG5vdCBydW5cclxuICAgIC8vIHJlc2l6ZVRvRml0Q29udGVudCB0b28gZWFybHkgKGkuZS4gYmVmb3JlIG5nQWZ0ZXJWaWV3SW5pdClcclxuICAgIGlmICh0aGlzLl9lbmFibGVkICE9PSB2YWx1ZSkge1xyXG4gICAgICAodGhpcy5fZW5hYmxlZCA9IHZhbHVlKSA/IHRoaXMucmVzaXplVG9GaXRDb250ZW50KHRydWUpIDogdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENhY2hlZCBoZWlnaHQgb2YgYSB0ZXh0YXJlYSB3aXRoIGEgc2luZ2xlIHJvdy4gKi9cclxuICBwcml2YXRlIF9jYWNoZWRMaW5lSGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gIC8qKiBVc2VkIHRvIHJlZmVyZW5jZSBjb3JyZWN0IGRvY3VtZW50L3dpbmRvdyAqL1xyXG4gIHByb3RlY3RlZCBfZG9jdW1lbnQ/OiBEb2N1bWVudDtcclxuXHJcbiAgLyoqIENsYXNzIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgdG8gdGhlIHRleHRhcmVhIHdoaWxlIGl0J3MgYmVpbmcgbWVhc3VyZWQuICovXHJcbiAgcHJpdmF0ZSBfbWVhc3VyaW5nQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfcGxhdGZvcm06IFBsYXRmb3JtLFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgICAgICAgICAgIC8qKiBAYnJlYWtpbmctY2hhbmdlIDExLjAuMCBtYWtlIGRvY3VtZW50IHJlcXVpcmVkICovXHJcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ/OiBhbnkpIHtcclxuICAgIHRoaXMuX2RvY3VtZW50ID0gZG9jdW1lbnQ7XHJcblxyXG4gICAgdGhpcy5fdGV4dGFyZWFFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50IGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XHJcbiAgICB0aGlzLl9tZWFzdXJpbmdDbGFzcyA9IF9wbGF0Zm9ybS5GSVJFRk9YID9cclxuICAgICAgJ2Nkay10ZXh0YXJlYS1hdXRvc2l6ZS1tZWFzdXJpbmctZmlyZWZveCcgOlxyXG4gICAgICAnY2RrLXRleHRhcmVhLWF1dG9zaXplLW1lYXN1cmluZyc7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgbWluaW11bSBoZWlnaHQgb2YgdGhlIHRleHRhcmVhIGFzIGRldGVybWluZWQgYnkgbWluUm93cy4gKi9cclxuICBfc2V0TWluSGVpZ2h0KCk6IHZvaWQge1xyXG4gICAgY29uc3QgbWluSGVpZ2h0ID0gdGhpcy5taW5Sb3dzICYmIHRoaXMuX2NhY2hlZExpbmVIZWlnaHQgP1xyXG4gICAgICAgIGAke3RoaXMubWluUm93cyAqIHRoaXMuX2NhY2hlZExpbmVIZWlnaHR9cHhgIDogbnVsbDtcclxuXHJcbiAgICBpZiAobWluSGVpZ2h0KSAge1xyXG4gICAgICB0aGlzLl90ZXh0YXJlYUVsZW1lbnQuc3R5bGUubWluSGVpZ2h0ID0gbWluSGVpZ2h0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIG1heGltdW0gaGVpZ2h0IG9mIHRoZSB0ZXh0YXJlYSBhcyBkZXRlcm1pbmVkIGJ5IG1heFJvd3MuICovXHJcbiAgX3NldE1heEhlaWdodCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IG1heEhlaWdodCA9IHRoaXMubWF4Um93cyAmJiB0aGlzLl9jYWNoZWRMaW5lSGVpZ2h0ID9cclxuICAgICAgICBgJHt0aGlzLm1heFJvd3MgKiB0aGlzLl9jYWNoZWRMaW5lSGVpZ2h0fXB4YCA6IG51bGw7XHJcblxyXG4gICAgaWYgKG1heEhlaWdodCkge1xyXG4gICAgICB0aGlzLl90ZXh0YXJlYUVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0ID0gbWF4SGVpZ2h0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgaWYgKHRoaXMuX3BsYXRmb3JtLmlzQnJvd3Nlcikge1xyXG4gICAgICAvLyBSZW1lbWJlciB0aGUgaGVpZ2h0IHdoaWNoIHdlIHN0YXJ0ZWQgd2l0aCBpbiBjYXNlIGF1dG9zaXppbmcgaXMgZGlzYWJsZWRcclxuICAgICAgdGhpcy5faW5pdGlhbEhlaWdodCA9IHRoaXMuX3RleHRhcmVhRWxlbWVudC5zdHlsZS5oZWlnaHQ7XHJcblxyXG4gICAgICB0aGlzLnJlc2l6ZVRvRml0Q29udGVudCgpO1xyXG5cclxuICAgICAgdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICBjb25zdCB3aW5kb3cgPSB0aGlzLl9nZXRXaW5kb3coKTtcclxuXHJcbiAgICAgICAgZnJvbUV2ZW50KHdpbmRvdywgJ3Jlc2l6ZScpXHJcbiAgICAgICAgICAucGlwZShhdWRpdFRpbWUoMTYpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcclxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5yZXNpemVUb0ZpdENvbnRlbnQodHJ1ZSkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FjaGUgdGhlIGhlaWdodCBvZiBhIHNpbmdsZS1yb3cgdGV4dGFyZWEgaWYgaXQgaGFzIG5vdCBhbHJlYWR5IGJlZW4gY2FjaGVkLlxyXG4gICAqXHJcbiAgICogV2UgbmVlZCB0byBrbm93IGhvdyBsYXJnZSBhIHNpbmdsZSBcInJvd1wiIG9mIGEgdGV4dGFyZWEgaXMgaW4gb3JkZXIgdG8gYXBwbHkgbWluUm93cyBhbmRcclxuICAgKiBtYXhSb3dzLiBGb3IgdGhlIGluaXRpYWwgdmVyc2lvbiwgd2Ugd2lsbCBhc3N1bWUgdGhhdCB0aGUgaGVpZ2h0IG9mIGEgc2luZ2xlIGxpbmUgaW4gdGhlXHJcbiAgICogdGV4dGFyZWEgZG9lcyBub3QgZXZlciBjaGFuZ2UuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfY2FjaGVUZXh0YXJlYUxpbmVIZWlnaHQoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fY2FjaGVkTGluZUhlaWdodCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlIGEgY2xvbmUgZWxlbWVudCBiZWNhdXNlIHdlIGhhdmUgdG8gb3ZlcnJpZGUgc29tZSBzdHlsZXMuXHJcbiAgICBsZXQgdGV4dGFyZWFDbG9uZSA9IHRoaXMuX3RleHRhcmVhRWxlbWVudC5jbG9uZU5vZGUoZmFsc2UpIGFzIEhUTUxUZXh0QXJlYUVsZW1lbnQ7XHJcbiAgICB0ZXh0YXJlYUNsb25lLnJvd3MgPSAxO1xyXG5cclxuICAgIC8vIFVzZSBgcG9zaXRpb246IGFic29sdXRlYCBzbyB0aGF0IHRoaXMgZG9lc24ndCBjYXVzZSBhIGJyb3dzZXIgbGF5b3V0IGFuZCB1c2VcclxuICAgIC8vIGB2aXNpYmlsaXR5OiBoaWRkZW5gIHNvIHRoYXQgbm90aGluZyBpcyByZW5kZXJlZC4gQ2xlYXIgYW55IG90aGVyIHN0eWxlcyB0aGF0XHJcbiAgICAvLyB3b3VsZCBhZmZlY3QgdGhlIGhlaWdodC5cclxuICAgIHRleHRhcmVhQ2xvbmUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgdGV4dGFyZWFDbG9uZS5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICB0ZXh0YXJlYUNsb25lLnN0eWxlLmJvcmRlciA9ICdub25lJztcclxuICAgIHRleHRhcmVhQ2xvbmUuc3R5bGUucGFkZGluZyA9ICcwJztcclxuICAgIHRleHRhcmVhQ2xvbmUuc3R5bGUuaGVpZ2h0ID0gJyc7XHJcbiAgICB0ZXh0YXJlYUNsb25lLnN0eWxlLm1pbkhlaWdodCA9ICcnO1xyXG4gICAgdGV4dGFyZWFDbG9uZS5zdHlsZS5tYXhIZWlnaHQgPSAnJztcclxuXHJcbiAgICAvLyBJbiBGaXJlZm94IGl0IGhhcHBlbnMgdGhhdCB0ZXh0YXJlYSBlbGVtZW50cyBhcmUgYWx3YXlzIGJpZ2dlciB0aGFuIHRoZSBzcGVjaWZpZWQgYW1vdW50XHJcbiAgICAvLyBvZiByb3dzLiBUaGlzIGlzIGJlY2F1c2UgRmlyZWZveCB0cmllcyB0byBhZGQgZXh0cmEgc3BhY2UgZm9yIHRoZSBob3Jpem9udGFsIHNjcm9sbGJhci5cclxuICAgIC8vIEFzIGEgd29ya2Fyb3VuZCB0aGF0IHJlbW92ZXMgdGhlIGV4dHJhIHNwYWNlIGZvciB0aGUgc2Nyb2xsYmFyLCB3ZSBjYW4ganVzdCBzZXQgb3ZlcmZsb3dcclxuICAgIC8vIHRvIGhpZGRlbi4gVGhpcyBlbnN1cmVzIHRoYXQgdGhlcmUgaXMgbm8gaW52YWxpZCBjYWxjdWxhdGlvbiBvZiB0aGUgbGluZSBoZWlnaHQuXHJcbiAgICAvLyBTZWUgRmlyZWZveCBidWcgcmVwb3J0OiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD0zMzY1NFxyXG4gICAgdGV4dGFyZWFDbG9uZS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG5cclxuICAgIHRoaXMuX3RleHRhcmVhRWxlbWVudC5wYXJlbnROb2RlIS5hcHBlbmRDaGlsZCh0ZXh0YXJlYUNsb25lKTtcclxuICAgIHRoaXMuX2NhY2hlZExpbmVIZWlnaHQgPSB0ZXh0YXJlYUNsb25lLmNsaWVudEhlaWdodDtcclxuICAgIHRoaXMuX3RleHRhcmVhRWxlbWVudC5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZCh0ZXh0YXJlYUNsb25lKTtcclxuXHJcbiAgICAvLyBNaW4gYW5kIG1heCBoZWlnaHRzIGhhdmUgdG8gYmUgcmUtY2FsY3VsYXRlZCBpZiB0aGUgY2FjaGVkIGxpbmUgaGVpZ2h0IGNoYW5nZXNcclxuICAgIHRoaXMuX3NldE1pbkhlaWdodCgpO1xyXG4gICAgdGhpcy5fc2V0TWF4SGVpZ2h0KCk7XHJcbiAgfVxyXG5cclxuICBuZ0RvQ2hlY2soKSB7XHJcbiAgICBpZiAodGhpcy5fcGxhdGZvcm0uaXNCcm93c2VyKSB7XHJcbiAgICAgIHRoaXMucmVzaXplVG9GaXRDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNpemUgdGhlIHRleHRhcmVhIHRvIGZpdCBpdHMgY29udGVudC5cclxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciB0byBmb3JjZSBhIGhlaWdodCByZWNhbGN1bGF0aW9uLiBCeSBkZWZhdWx0IHRoZSBoZWlnaHQgd2lsbCBiZVxyXG4gICAqICAgIHJlY2FsY3VsYXRlZCBvbmx5IGlmIHRoZSB2YWx1ZSBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGNhbGwuXHJcbiAgICovXHJcbiAgcmVzaXplVG9GaXRDb250ZW50KGZvcmNlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgIC8vIElmIGF1dG9zaXppbmcgaXMgZGlzYWJsZWQsIGp1c3Qgc2tpcCBldmVyeXRoaW5nIGVsc2VcclxuICAgIGlmICghdGhpcy5fZW5hYmxlZCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fY2FjaGVUZXh0YXJlYUxpbmVIZWlnaHQoKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBoYXZlbid0IGRldGVybWluZWQgdGhlIGxpbmUtaGVpZ2h0IHlldCwgd2Uga25vdyB3ZSdyZSBzdGlsbCBoaWRkZW4gYW5kIHRoZXJlJ3Mgbm8gcG9pbnRcclxuICAgIC8vIGluIGNoZWNraW5nIHRoZSBoZWlnaHQgb2YgdGhlIHRleHRhcmVhLlxyXG4gICAgaWYgKCF0aGlzLl9jYWNoZWRMaW5lSGVpZ2h0KSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZXh0YXJlYSA9IHRoaXMuX2VsZW1lbnRSZWYubmF0aXZlRWxlbWVudCBhcyBIVE1MVGV4dEFyZWFFbGVtZW50O1xyXG4gICAgY29uc3QgdmFsdWUgPSB0ZXh0YXJlYS52YWx1ZTtcclxuXHJcbiAgICAvLyBPbmx5IHJlc2l6ZSBpZiB0aGUgdmFsdWUgb3IgbWluUm93cyBoYXZlIGNoYW5nZWQgc2luY2UgdGhlc2UgY2FsY3VsYXRpb25zIGNhbiBiZSBleHBlbnNpdmUuXHJcbiAgICBpZiAoIWZvcmNlICYmIHRoaXMuX21pblJvd3MgPT09IHRoaXMuX3ByZXZpb3VzTWluUm93cyAmJiB2YWx1ZSA9PT0gdGhpcy5fcHJldmlvdXNWYWx1ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcGxhY2Vob2xkZXJUZXh0ID0gdGV4dGFyZWEucGxhY2Vob2xkZXI7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIHRleHRhcmVhIGhlaWdodCB0byBhdXRvIGluIG9yZGVyIHRvIHNocmluayBiYWNrIHRvIGl0cyBkZWZhdWx0IHNpemUuXHJcbiAgICAvLyBBbHNvIHRlbXBvcmFyaWx5IGZvcmNlIG92ZXJmbG93OmhpZGRlbiwgc28gc2Nyb2xsIGJhcnMgZG8gbm90IGludGVyZmVyZSB3aXRoIGNhbGN1bGF0aW9ucy5cclxuICAgIC8vIExvbmcgcGxhY2Vob2xkZXJzIHRoYXQgYXJlIHdpZGVyIHRoYW4gdGhlIHRleHRhcmVhIHdpZHRoIG1heSBsZWFkIHRvIGEgYmlnZ2VyIHNjcm9sbEhlaWdodFxyXG4gICAgLy8gdmFsdWUuIFRvIGVuc3VyZSB0aGF0IHRoZSBzY3JvbGxIZWlnaHQgaXMgbm90IGJpZ2dlciB0aGFuIHRoZSBjb250ZW50LCB0aGUgcGxhY2Vob2xkZXJzXHJcbiAgICAvLyBuZWVkIHRvIGJlIHJlbW92ZWQgdGVtcG9yYXJpbHkuXHJcbiAgICB0ZXh0YXJlYS5jbGFzc0xpc3QuYWRkKHRoaXMuX21lYXN1cmluZ0NsYXNzKTtcclxuICAgIHRleHRhcmVhLnBsYWNlaG9sZGVyID0gJyc7XHJcblxyXG4gICAgLy8gVGhlIG1lYXN1cmluZyBjbGFzcyBpbmNsdWRlcyBhIDJweCBwYWRkaW5nIHRvIHdvcmthcm91bmQgYW4gaXNzdWUgd2l0aCBDaHJvbWUsXHJcbiAgICAvLyBzbyB3ZSBhY2NvdW50IGZvciB0aGF0IGV4dHJhIHNwYWNlIGhlcmUgYnkgc3VidHJhY3RpbmcgNCAoMnB4IHRvcCArIDJweCBib3R0b20pLlxyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGV4dGFyZWEuc2Nyb2xsSGVpZ2h0IC0gNDtcclxuXHJcbiAgICAvLyBVc2UgdGhlIHNjcm9sbEhlaWdodCB0byBrbm93IGhvdyBsYXJnZSB0aGUgdGV4dGFyZWEgKndvdWxkKiBiZSBpZiBmaXQgaXRzIGVudGlyZSB2YWx1ZS5cclxuICAgIHRleHRhcmVhLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XHJcbiAgICB0ZXh0YXJlYS5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX21lYXN1cmluZ0NsYXNzKTtcclxuICAgIHRleHRhcmVhLnBsYWNlaG9sZGVyID0gcGxhY2Vob2xkZXJUZXh0O1xyXG5cclxuICAgIHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgIGlmICh0eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9zY3JvbGxUb0NhcmV0UG9zaXRpb24odGV4dGFyZWEpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuX3Njcm9sbFRvQ2FyZXRQb3NpdGlvbih0ZXh0YXJlYSkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9wcmV2aW91c1ZhbHVlID0gdmFsdWU7XHJcbiAgICB0aGlzLl9wcmV2aW91c01pblJvd3MgPSB0aGlzLl9taW5Sb3dzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSB0ZXh0YXJlYSB0byBpdHMgb3JpZ2luYWwgc2l6ZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gRG8gbm90IHRyeSB0byBjaGFuZ2UgdGhlIHRleHRhcmVhLCBpZiB0aGUgaW5pdGlhbEhlaWdodCBoYXMgbm90IGJlZW4gZGV0ZXJtaW5lZCB5ZXRcclxuICAgIC8vIFRoaXMgbWlnaHQgcG90ZW50aWFsbHkgcmVtb3ZlIHN0eWxlcyB3aGVuIHJlc2V0KCkgaXMgY2FsbGVkIGJlZm9yZSBuZ0FmdGVyVmlld0luaXRcclxuICAgIGlmICh0aGlzLl9pbml0aWFsSGVpZ2h0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5fdGV4dGFyZWFFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuX2luaXRpYWxIZWlnaHQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBJbiBJdnkgdGhlIGBob3N0YCBtZXRhZGF0YSB3aWxsIGJlIG1lcmdlZCwgd2hlcmVhcyBpbiBWaWV3RW5naW5lIGl0IGlzIG92ZXJyaWRkZW4uIEluIG9yZGVyXHJcbiAgLy8gdG8gYXZvaWQgZG91YmxlIGV2ZW50IGxpc3RlbmVycywgd2UgbmVlZCB0byB1c2UgYEhvc3RMaXN0ZW5lcmAuIE9uY2UgSXZ5IGlzIHRoZSBkZWZhdWx0LCB3ZVxyXG4gIC8vIGNhbiBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YC5cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZTpuby1ob3N0LWRlY29yYXRvci1pbi1jb25jcmV0ZVxyXG4gIEBIb3N0TGlzdGVuZXIoJ2lucHV0JylcclxuICBfbm9vcElucHV0SGFuZGxlcigpIHtcclxuICAgIC8vIG5vLW9wIGhhbmRsZXIgdGhhdCBlbnN1cmVzIHdlJ3JlIHJ1bm5pbmcgY2hhbmdlIGRldGVjdGlvbiBvbiBpbnB1dCBldmVudHMuXHJcbiAgfVxyXG5cclxuICAvKiogQWNjZXNzIGluamVjdGVkIGRvY3VtZW50IGlmIGF2YWlsYWJsZSBvciBmYWxsYmFjayB0byBnbG9iYWwgZG9jdW1lbnQgcmVmZXJlbmNlICovXHJcbiAgcHJpdmF0ZSBfZ2V0RG9jdW1lbnQoKTogRG9jdW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuX2RvY3VtZW50IHx8IGRvY3VtZW50O1xyXG4gIH1cclxuXHJcbiAgLyoqIFVzZSBkZWZhdWx0VmlldyBvZiBpbmplY3RlZCBkb2N1bWVudCBpZiBhdmFpbGFibGUgb3IgZmFsbGJhY2sgdG8gZ2xvYmFsIHdpbmRvdyByZWZlcmVuY2UgKi9cclxuICBwcml2YXRlIF9nZXRXaW5kb3coKTogV2luZG93IHtcclxuICAgIGNvbnN0IGRvYyA9IHRoaXMuX2dldERvY3VtZW50KCk7XHJcbiAgICByZXR1cm4gZG9jLmRlZmF1bHRWaWV3IHx8IHdpbmRvdztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjcm9sbHMgYSB0ZXh0YXJlYSB0byB0aGUgY2FyZXQgcG9zaXRpb24uIE9uIEZpcmVmb3ggcmVzaXppbmcgdGhlIHRleHRhcmVhIHdpbGxcclxuICAgKiBwcmV2ZW50IGl0IGZyb20gc2Nyb2xsaW5nIHRvIHRoZSBjYXJldCBwb3NpdGlvbi4gV2UgbmVlZCB0byByZS1zZXQgdGhlIHNlbGVjdGlvblxyXG4gICAqIGluIG9yZGVyIGZvciBpdCB0byBzY3JvbGwgdG8gdGhlIHByb3BlciBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwcml2YXRlIF9zY3JvbGxUb0NhcmV0UG9zaXRpb24odGV4dGFyZWE6IEhUTUxUZXh0QXJlYUVsZW1lbnQpIHtcclxuICAgIGNvbnN0IHtzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kfSA9IHRleHRhcmVhO1xyXG4gICAgY29uc3QgZG9jdW1lbnQgPSB0aGlzLl9nZXREb2N1bWVudCgpO1xyXG5cclxuICAgIC8vIElFIHdpbGwgdGhyb3cgYW4gXCJVbnNwZWNpZmllZCBlcnJvclwiIGlmIHdlIHRyeSB0byBzZXQgdGhlIHNlbGVjdGlvbiByYW5nZSBhZnRlciB0aGVcclxuICAgIC8vIGVsZW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBET00uIEFzc2VydCB0aGF0IHRoZSBkaXJlY3RpdmUgaGFzbid0IGJlZW4gZGVzdHJveWVkXHJcbiAgICAvLyBiZXR3ZWVuIHRoZSB0aW1lIHdlIHJlcXVlc3RlZCB0aGUgYW5pbWF0aW9uIGZyYW1lIGFuZCB3aGVuIGl0IHdhcyBleGVjdXRlZC5cclxuICAgIC8vIEFsc28gbm90ZSB0aGF0IHdlIGhhdmUgdG8gYXNzZXJ0IHRoYXQgdGhlIHRleHRhcmVhIGlzIGZvY3VzZWQgYmVmb3JlIHdlIHNldCB0aGVcclxuICAgIC8vIHNlbGVjdGlvbiByYW5nZS4gU2V0dGluZyB0aGUgc2VsZWN0aW9uIHJhbmdlIG9uIGEgbm9uLWZvY3VzZWQgdGV4dGFyZWEgd2lsbCBjYXVzZVxyXG4gICAgLy8gaXQgdG8gcmVjZWl2ZSBmb2N1cyBvbiBJRSBhbmQgRWRnZS5cclxuICAgIGlmICghdGhpcy5fZGVzdHJveWVkLmlzU3RvcHBlZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0ZXh0YXJlYSkge1xyXG4gICAgICB0ZXh0YXJlYS5zZXRTZWxlY3Rpb25SYW5nZShzZWxlY3Rpb25TdGFydCwgc2VsZWN0aW9uRW5kKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9taW5Sb3dzOiBOdW1iZXJJbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbWF4Um93czogTnVtYmVySW5wdXQ7XHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2VuYWJsZWQ6IEJvb2xlYW5JbnB1dDtcclxufVxyXG4iXX0=