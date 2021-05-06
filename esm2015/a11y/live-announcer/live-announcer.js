/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ContentObserver } from '@angular/cdk/observers';
import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Injectable, Input, NgZone, Optional, } from '@angular/core';
import { LIVE_ANNOUNCER_ELEMENT_TOKEN, LIVE_ANNOUNCER_DEFAULT_OPTIONS, } from './live-announcer-tokens';
import * as i0 from "@angular/core";
import * as i1 from "./live-announcer-tokens";
import * as i2 from "@angular/common";
export class LiveAnnouncer {
    constructor(elementToken, _ngZone, _document, _defaultOptions) {
        this._ngZone = _ngZone;
        this._defaultOptions = _defaultOptions;
        // We inject the live element and document as `any` because the constructor signature cannot
        // reference browser globals (HTMLElement, Document) on non-browser environments, since having
        // a class decorator causes TypeScript to preserve the constructor signature types.
        this._document = _document;
        this._liveElement = elementToken || this._createLiveElement();
    }
    announce(message, ...args) {
        const defaultOptions = this._defaultOptions;
        let politeness;
        let duration;
        if (args.length === 1 && typeof args[0] === 'number') {
            duration = args[0];
        }
        else {
            [politeness, duration] = args;
        }
        this.clear();
        clearTimeout(this._previousTimeout);
        if (!politeness) {
            politeness =
                (defaultOptions && defaultOptions.politeness) ? defaultOptions.politeness : 'polite';
        }
        if (duration == null && defaultOptions) {
            duration = defaultOptions.duration;
        }
        // TODO: ensure changing the politeness works on all environments we support.
        this._liveElement.setAttribute('aria-live', politeness);
        // This 100ms timeout is necessary for some browser + screen-reader combinations:
        // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
        // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
        //   second time without clearing and then using a non-zero delay.
        // (using JAWS 17 at time of this writing).
        return this._ngZone.runOutsideAngular(() => {
            return new Promise(resolve => {
                clearTimeout(this._previousTimeout);
                this._previousTimeout = setTimeout(() => {
                    this._liveElement.textContent = message;
                    resolve();
                    if (typeof duration === 'number') {
                        this._previousTimeout = setTimeout(() => this.clear(), duration);
                    }
                }, 100);
            });
        });
    }
    /**
     * Clears the current text from the announcer element. Can be used to prevent
     * screen readers from reading the text out again while the user is going
     * through the page landmarks.
     */
    clear() {
        if (this._liveElement) {
            this._liveElement.textContent = '';
        }
    }
    ngOnDestroy() {
        clearTimeout(this._previousTimeout);
        if (this._liveElement && this._liveElement.parentNode) {
            this._liveElement.parentNode.removeChild(this._liveElement);
            this._liveElement = null;
        }
    }
    _createLiveElement() {
        const elementClass = 'cdk-live-announcer-element';
        const previousElements = this._document.getElementsByClassName(elementClass);
        const liveEl = this._document.createElement('div');
        // Remove any old containers. This can happen when coming in from a server-side-rendered page.
        for (let i = 0; i < previousElements.length; i++) {
            previousElements[i].parentNode.removeChild(previousElements[i]);
        }
        liveEl.classList.add(elementClass);
        liveEl.classList.add('cdk-visually-hidden');
        liveEl.setAttribute('aria-atomic', 'true');
        liveEl.setAttribute('aria-live', 'polite');
        this._document.body.appendChild(liveEl);
        return liveEl;
    }
}
LiveAnnouncer.ɵprov = i0.ɵɵdefineInjectable({ factory: function LiveAnnouncer_Factory() { return new LiveAnnouncer(i0.ɵɵinject(i1.LIVE_ANNOUNCER_ELEMENT_TOKEN, 8), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.DOCUMENT), i0.ɵɵinject(i1.LIVE_ANNOUNCER_DEFAULT_OPTIONS, 8)); }, token: LiveAnnouncer, providedIn: "root" });
LiveAnnouncer.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
LiveAnnouncer.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [LIVE_ANNOUNCER_ELEMENT_TOKEN,] }] },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [LIVE_ANNOUNCER_DEFAULT_OPTIONS,] }] }
];
/**
 * A directive that works similarly to aria-live, but uses the LiveAnnouncer to ensure compatibility
 * with a wider range of browsers and screen readers.
 */
export class CdkAriaLive {
    constructor(_elementRef, _liveAnnouncer, _contentObserver, _ngZone) {
        this._elementRef = _elementRef;
        this._liveAnnouncer = _liveAnnouncer;
        this._contentObserver = _contentObserver;
        this._ngZone = _ngZone;
        this._politeness = 'polite';
    }
    /** The aria-live politeness level to use when announcing messages. */
    get politeness() { return this._politeness; }
    set politeness(value) {
        this._politeness = value === 'off' || value === 'assertive' ? value : 'polite';
        if (this._politeness === 'off') {
            if (this._subscription) {
                this._subscription.unsubscribe();
                this._subscription = null;
            }
        }
        else if (!this._subscription) {
            this._subscription = this._ngZone.runOutsideAngular(() => {
                return this._contentObserver
                    .observe(this._elementRef)
                    .subscribe(() => {
                    // Note that we use textContent here, rather than innerText, in order to avoid a reflow.
                    const elementText = this._elementRef.nativeElement.textContent;
                    // The `MutationObserver` fires also for attribute
                    // changes which we don't want to announce.
                    if (elementText !== this._previousAnnouncedText) {
                        this._liveAnnouncer.announce(elementText, this._politeness);
                        this._previousAnnouncedText = elementText;
                    }
                });
            });
        }
    }
    ngOnDestroy() {
        if (this._subscription) {
            this._subscription.unsubscribe();
        }
    }
}
CdkAriaLive.decorators = [
    { type: Directive, args: [{
                selector: '[cdkAriaLive]',
                exportAs: 'cdkAriaLive',
            },] }
];
CdkAriaLive.ctorParameters = () => [
    { type: ElementRef },
    { type: LiveAnnouncer },
    { type: ContentObserver },
    { type: NgZone }
];
CdkAriaLive.propDecorators = {
    politeness: [{ type: Input, args: ['cdkAriaLive',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS1hbm5vdW5jZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2ExMXkvbGl2ZS1hbm5vdW5jZXIvbGl2ZS1hbm5vdW5jZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQ0wsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sVUFBVSxFQUNWLEtBQUssRUFDTCxNQUFNLEVBRU4sUUFBUSxHQUNULE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFHTCw0QkFBNEIsRUFDNUIsOEJBQThCLEdBQy9CLE1BQU0seUJBQXlCLENBQUM7Ozs7QUFJakMsTUFBTSxPQUFPLGFBQWE7SUFLeEIsWUFDc0QsWUFBaUIsRUFDM0QsT0FBZSxFQUNMLFNBQWMsRUFFeEIsZUFBNkM7UUFIN0MsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUdmLG9CQUFlLEdBQWYsZUFBZSxDQUE4QjtRQUV2RCw0RkFBNEY7UUFDNUYsOEZBQThGO1FBQzlGLG1GQUFtRjtRQUNuRixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0lBc0NELFFBQVEsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXO1FBQ3RDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDNUMsSUFBSSxVQUEwQyxDQUFDO1FBQy9DLElBQUksUUFBNEIsQ0FBQztRQUVqQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZ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YUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzthQUMzQjtTQUNGO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtnQkFDdkQsT0FBTyxJQUFJLENBQUMsZ0JBQWdCO3FCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztxQkFDekIsU0FBUyxDQUFDLEdBQUcsRUFBRTtvQkFDZCx3RkFBd0Y7b0JBQ3hGLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQztvQkFFL0Qsa0RBQWtEO29CQUNsRCwyQ0FBMkM7b0JBQzNDLElBQUksV0FBVyxLQUFLLElBQUksQ0FBQyxzQkFBc0IsRUFBRTt3QkFDL0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFDNUQsSUFBSSxDQUFDLHNCQUFzQixHQUFHLFdBQVcsQ0FBQztxQkFDM0M7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztJQVNELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNsQztJQUNILENBQUM7OztZQTdDRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLGVBQWU7Z0JBQ3pCLFFBQVEsRUFBRSxhQUFhO2FBQ3hCOzs7WUExS0MsVUFBVTtZQTZNMkQsYUFBYTtZQWpONUUsZUFBZTtZQVFyQixNQUFNOzs7eUJBeUtMLEtBQUssU0FBQyxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRlbnRPYnNlcnZlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL29ic2VydmVycyc7XHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7XHJcbiAgRGlyZWN0aXZlLFxyXG4gIEVsZW1lbnRSZWYsXHJcbiAgSW5qZWN0LFxyXG4gIEluamVjdGFibGUsXHJcbiAgSW5wdXQsXHJcbiAgTmdab25lLFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge1xyXG4gIEFyaWFMaXZlUG9saXRlbmVzcyxcclxuICBMaXZlQW5ub3VuY2VyRGVmYXVsdE9wdGlvbnMsXHJcbiAgTElWRV9BTk5PVU5DRVJfRUxFTUVOVF9UT0tFTixcclxuICBMSVZFX0FOTk9VTkNFUl9ERUZBVUxUX09QVElPTlMsXHJcbn0gZnJvbSAnLi9saXZlLWFubm91bmNlci10b2tlbnMnO1xyXG5cclxuXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgTGl2ZUFubm91bmNlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfbGl2ZUVsZW1lbnQ6IEhUTUxFbGVtZW50O1xyXG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcclxuICBwcml2YXRlIF9wcmV2aW91c1RpbWVvdXQ/OiBudW1iZXI7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KExJVkVfQU5OT1VOQ0VSX0VMRU1FTlRfVE9LRU4pIGVsZW1lbnRUb2tlbjogYW55LFxyXG4gICAgICBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSxcclxuICAgICAgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50OiBhbnksXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTElWRV9BTk5PVU5DRVJfREVGQVVMVF9PUFRJT05TKVxyXG4gICAgICBwcml2YXRlIF9kZWZhdWx0T3B0aW9ucz86IExpdmVBbm5vdW5jZXJEZWZhdWx0T3B0aW9ucykge1xyXG5cclxuICAgIC8vIFdlIGluamVjdCB0aGUgbGl2ZSBlbGVtZW50IGFuZCBkb2N1bWVudCBhcyBgYW55YCBiZWNhdXNlIHRoZSBjb25zdHJ1Y3RvciBzaWduYXR1cmUgY2Fubm90XHJcbiAgICAvLyByZWZlcmVuY2UgYnJvd3NlciBnbG9iYWxzIChIVE1MRWxlbWVudCwgRG9jdW1lbnQpIG9uIG5vbi1icm93c2VyIGVudmlyb25tZW50cywgc2luY2UgaGF2aW5nXHJcbiAgICAvLyBhIGNsYXNzIGRlY29yYXRvciBjYXVzZXMgVHlwZVNjcmlwdCB0byBwcmVzZXJ2ZSB0aGUgY29uc3RydWN0b3Igc2lnbmF0dXJlIHR5cGVzLlxyXG4gICAgdGhpcy5fZG9jdW1lbnQgPSBfZG9jdW1lbnQ7XHJcbiAgICB0aGlzLl9saXZlRWxlbWVudCA9IGVsZW1lbnRUb2tlbiB8fCB0aGlzLl9jcmVhdGVMaXZlRWxlbWVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5ub3VuY2VzIGEgbWVzc2FnZSB0byBzY3JlZW5yZWFkZXJzLlxyXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgYW5ub3VuY2VkIHRvIHRoZSBzY3JlZW5yZWFkZXIuXHJcbiAgICogQHJldHVybnMgUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB0aGUgbWVzc2FnZSBpcyBhZGRlZCB0byB0aGUgRE9NLlxyXG4gICAqL1xyXG4gIGFubm91bmNlKG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XHJcblxyXG4gIC8qKlxyXG4gICAqIEFubm91bmNlcyBhIG1lc3NhZ2UgdG8gc2NyZWVucmVhZGVycy5cclxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIGFubm91bmNlZCB0byB0aGUgc2NyZWVucmVhZGVyLlxyXG4gICAqIEBwYXJhbSBwb2xpdGVuZXNzIFRoZSBwb2xpdGVuZXNzIG9mIHRoZSBhbm5vdW5jZXIgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoZSBtZXNzYWdlIGlzIGFkZGVkIHRvIHRoZSBET00uXHJcbiAgICovXHJcbiAgYW5ub3VuY2UobWVzc2FnZTogc3RyaW5nLCBwb2xpdGVuZXNzPzogQXJpYUxpdmVQb2xpdGVuZXNzKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgLyoqXHJcbiAgICogQW5ub3VuY2VzIGEgbWVzc2FnZSB0byBzY3JlZW5yZWFkZXJzLlxyXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgYW5ub3VuY2VkIHRvIHRoZSBzY3JlZW5yZWFkZXIuXHJcbiAgICogQHBhcmFtIGR1cmF0aW9uIFRpbWUgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRvIGNsZWFyIG91dCB0aGUgYW5ub3VuY2VyIGVsZW1lbnQuIE5vdGVcclxuICAgKiAgIHRoYXQgdGhpcyB0YWtlcyBlZmZlY3QgYWZ0ZXIgdGhlIG1lc3NhZ2UgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIERPTSwgd2hpY2ggY2FuIGJlIHVwIHRvXHJcbiAgICogICAxMDBtcyBhZnRlciBgYW5ub3VuY2VgIGhhcyBiZWVuIGNhbGxlZC5cclxuICAgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoZSBtZXNzYWdlIGlzIGFkZGVkIHRvIHRoZSBET00uXHJcbiAgICovXHJcbiAgYW5ub3VuY2UobWVzc2FnZTogc3RyaW5nLCBkdXJhdGlvbj86IG51bWJlcik6IFByb21pc2U8dm9pZD47XHJcblxyXG4gIC8qKlxyXG4gICAqIEFubm91bmNlcyBhIG1lc3NhZ2UgdG8gc2NyZWVucmVhZGVycy5cclxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIGFubm91bmNlZCB0byB0aGUgc2NyZWVucmVhZGVyLlxyXG4gICAqIEBwYXJhbSBwb2xpdGVuZXNzIFRoZSBwb2xpdGVuZXNzIG9mIHRoZSBhbm5vdW5jZXIgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZHVyYXRpb24gVGltZSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdG8gY2xlYXIgb3V0IHRoZSBhbm5vdW5jZXIgZWxlbWVudC4gTm90ZVxyXG4gICAqICAgdGhhdCB0aGlzIHRha2VzIGVmZmVjdCBhZnRlciB0aGUgbWVzc2FnZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgRE9NLCB3aGljaCBjYW4gYmUgdXAgdG9cclxuICAgKiAgIDEwMG1zIGFmdGVyIGBhbm5vdW5jZWAgaGFzIGJlZW4gY2FsbGVkLlxyXG4gICAqIEByZXR1cm5zIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIG1lc3NhZ2UgaXMgYWRkZWQgdG8gdGhlIERPTS5cclxuICAgKi9cclxuICBhbm5vdW5jZShtZXNzYWdlOiBzdHJpbmcsIHBvbGl0ZW5lc3M/OiBBcmlhTGl2ZVBvbGl0ZW5lc3MsIGR1cmF0aW9uPzogbnVtYmVyKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgYW5ub3VuY2UobWVzc2FnZTogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB0aGlzLl9kZWZhdWx0T3B0aW9ucztcclxuICAgIGxldCBwb2xpdGVuZXNzOiBBcmlhTGl2ZVBvbGl0ZW5lc3MgfCB1bmRlZmluZWQ7XHJcbiAgICBsZXQgZHVyYXRpb246IG51bWJlciB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgIGR1cmF0aW9uID0gYXJnc1swXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIFtwb2xpdGVuZXNzLCBkdXJhdGlvbl0gPSBhcmdzO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2xlYXIoKTtcclxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmV2aW91c1RpbWVvdXQpO1xyXG5cclxuICAgIGlmICghcG9saXRlbmVzcykge1xyXG4gICAgICBwb2xpdGVuZXNzID1cclxuICAgICAgICAgIChkZWZhdWx0T3B0aW9ucyAmJiBkZWZhdWx0T3B0aW9ucy5wb2xpdGVuZXNzKSA/IGRlZmF1bHRPcHRpb25zLnBvbGl0ZW5lc3MgOiAncG9saXRlJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZHVyYXRpb24gPT0gbnVsbCAmJiBkZWZhdWx0T3B0aW9ucykge1xyXG4gICAgICBkdXJhdGlvbiA9IGRlZmF1bHRPcHRpb25zLmR1cmF0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IGVuc3VyZSBjaGFuZ2luZyB0aGUgcG9saXRlbmVzcyB3b3JrcyBvbiBhbGwgZW52aXJvbm1lbnRzIHdlIHN1cHBvcnQuXHJcbiAgICB0aGlzLl9saXZlRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsIHBvbGl0ZW5lc3MpO1xyXG5cclxuICAgIC8vIFRoaXMgMTAwbXMgdGltZW91dCBpcyBuZWNlc3NhcnkgZm9yIHNvbWUgYnJvd3NlciArIHNjcmVlbi1yZWFkZXIgY29tYmluYXRpb25zOlxyXG4gICAgLy8gLSBCb3RoIEpBV1MgYW5kIE5WREEgb3ZlciBJRTExIHdpbGwgbm90IGFubm91bmNlIGFueXRoaW5nIHdpdGhvdXQgYSBub24temVybyB0aW1lb3V0LlxyXG4gICAgLy8gLSBXaXRoIENocm9tZSBhbmQgSUUxMSB3aXRoIE5WREEgb3IgSkFXUywgYSByZXBlYXRlZCAoaWRlbnRpY2FsKSBtZXNzYWdlIHdvbid0IGJlIHJlYWQgYVxyXG4gICAgLy8gICBzZWNvbmQgdGltZSB3aXRob3V0IGNsZWFyaW5nIGFuZCB0aGVuIHVzaW5nIGEgbm9uLXplcm8gZGVsYXkuXHJcbiAgICAvLyAodXNpbmcgSkFXUyAxNyBhdCB0aW1lIG9mIHRoaXMgd3JpdGluZykuXHJcbiAgICByZXR1cm4gdGhpcy5fbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmV2aW91c1RpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMuX3ByZXZpb3VzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5fbGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2YgZHVyYXRpb24gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4gdGhpcy5jbGVhcigpLCBkdXJhdGlvbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTAwKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFycyB0aGUgY3VycmVudCB0ZXh0IGZyb20gdGhlIGFubm91bmNlciBlbGVtZW50LiBDYW4gYmUgdXNlZCB0byBwcmV2ZW50XHJcbiAgICogc2NyZWVuIHJlYWRlcnMgZnJvbSByZWFkaW5nIHRoZSB0ZXh0IG91dCBhZ2FpbiB3aGlsZSB0aGUgdXNlciBpcyBnb2luZ1xyXG4gICAqIHRocm91Z2ggdGhlIHBhZ2UgbGFuZG1hcmtzLlxyXG4gICAqL1xyXG4gIGNsZWFyKCkge1xyXG4gICAgaWYgKHRoaXMuX2xpdmVFbGVtZW50KSB7XHJcbiAgICAgIHRoaXMuX2xpdmVFbGVtZW50LnRleHRDb250ZW50ID0gJyc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmV2aW91c1RpbWVvdXQpO1xyXG5cclxuICAgIGlmICh0aGlzLl9saXZlRWxlbWVudCAmJiB0aGlzLl9saXZlRWxlbWVudC5wYXJlbnROb2RlKSB7XHJcbiAgICAgIHRoaXMuX2xpdmVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fbGl2ZUVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl9saXZlRWxlbWVudCA9IG51bGwhO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfY3JlYXRlTGl2ZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgY29uc3QgZWxlbWVudENsYXNzID0gJ2Nkay1saXZlLWFubm91bmNlci1lbGVtZW50JztcclxuICAgIGNvbnN0IHByZXZpb3VzRWxlbWVudHMgPSB0aGlzLl9kb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGVsZW1lbnRDbGFzcyk7XHJcbiAgICBjb25zdCBsaXZlRWwgPSB0aGlzLl9kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgYW55IG9sZCBjb250YWluZXJzLiBUaGlzIGNhbiBoYXBwZW4gd2hlbiBjb21pbmcgaW4gZnJvbSBhIHNlcnZlci1zaWRlLXJlbmRlcmVkIHBhZ2UuXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZXZpb3VzRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcHJldmlvdXNFbGVtZW50c1tpXS5wYXJlbnROb2RlIS5yZW1vdmVDaGlsZChwcmV2aW91c0VsZW1lbnRzW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBsaXZlRWwuY2xhc3NMaXN0LmFkZChlbGVtZW50Q2xhc3MpO1xyXG4gICAgbGl2ZUVsLmNsYXNzTGlzdC5hZGQoJ2Nkay12aXN1YWxseS1oaWRkZW4nKTtcclxuXHJcbiAgICBsaXZlRWwuc2V0QXR0cmlidXRlKCdhcmlhLWF0b21pYycsICd0cnVlJyk7XHJcbiAgICBsaXZlRWwuc2V0QXR0cmlidXRlKCdhcmlhLWxpdmUnLCAncG9saXRlJyk7XHJcblxyXG4gICAgdGhpcy5fZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaXZlRWwpO1xyXG5cclxuICAgIHJldHVybiBsaXZlRWw7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IHdvcmtzIHNpbWlsYXJseSB0byBhcmlhLWxpdmUsIGJ1dCB1c2VzIHRoZSBMaXZlQW5ub3VuY2VyIHRvIGVuc3VyZSBjb21wYXRpYmlsaXR5XHJcbiAqIHdpdGggYSB3aWRlciByYW5nZSBvZiBicm93c2VycyBhbmQgc2NyZWVuIHJlYWRlcnMuXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ1tjZGtBcmlhTGl2ZV0nLFxyXG4gIGV4cG9ydEFzOiAnY2RrQXJpYUxpdmUnLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrQXJpYUxpdmUgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBUaGUgYXJpYS1saXZlIHBvbGl0ZW5lc3MgbGV2ZWwgdG8gdXNlIHdoZW4gYW5ub3VuY2luZyBtZXNzYWdlcy4gKi9cclxuICBASW5wdXQoJ2Nka0FyaWFMaXZlJylcclxuICBnZXQgcG9saXRlbmVzcygpOiBBcmlhTGl2ZVBvbGl0ZW5lc3MgeyByZXR1cm4gdGhpcy5fcG9saXRlbmVzczsgfVxyXG4gIHNldCBwb2xpdGVuZXNzKHZhbHVlOiBBcmlhTGl2ZVBvbGl0ZW5lc3MpIHtcclxuICAgIHRoaXMuX3BvbGl0ZW5lc3MgPSB2YWx1ZSA9PT0gJ29mZicgfHwgdmFsdWUgPT09ICdhc3NlcnRpdmUnID8gdmFsdWUgOiAncG9saXRlJztcclxuICAgIGlmICh0aGlzLl9wb2xpdGVuZXNzID09PSAnb2ZmJykge1xyXG4gICAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICghdGhpcy5fc3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHRoaXMuX25nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRlbnRPYnNlcnZlclxyXG4gICAgICAgICAgLm9ic2VydmUodGhpcy5fZWxlbWVudFJlZilcclxuICAgICAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBOb3RlIHRoYXQgd2UgdXNlIHRleHRDb250ZW50IGhlcmUsIHJhdGhlciB0aGFuIGlubmVyVGV4dCwgaW4gb3JkZXIgdG8gYXZvaWQgYSByZWZsb3cuXHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRUZXh0ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGBNdXRhdGlvbk9ic2VydmVyYCBmaXJlcyBhbHNvIGZvciBhdHRyaWJ1dGVcclxuICAgICAgICAgICAgLy8gY2hhbmdlcyB3aGljaCB3ZSBkb24ndCB3YW50IHRvIGFubm91bmNlLlxyXG4gICAgICAgICAgICBpZiAoZWxlbWVudFRleHQgIT09IHRoaXMuX3ByZXZpb3VzQW5ub3VuY2VkVGV4dCkge1xyXG4gICAgICAgICAgICAgIHRoaXMuX2xpdmVBbm5vdW5jZXIuYW5ub3VuY2UoZWxlbWVudFRleHQsIHRoaXMuX3BvbGl0ZW5lc3MpO1xyXG4gICAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzQW5ub3VuY2VkVGV4dCA9IGVsZW1lbnRUZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgX3BvbGl0ZW5lc3M6IEFyaWFMaXZlUG9saXRlbmVzcyA9ICdwb2xpdGUnO1xyXG5cclxuICBwcml2YXRlIF9wcmV2aW91c0Fubm91bmNlZFRleHQ/OiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCBudWxsO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9lbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIF9saXZlQW5ub3VuY2VyOiBMaXZlQW5ub3VuY2VyLFxyXG4gICAgICAgICAgICAgIHByaXZhdGUgX2NvbnRlbnRPYnNlcnZlcjogQ29udGVudE9ic2VydmVyLCBwcml2YXRlIF9uZ1pvbmU6IE5nWm9uZSkge31cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=