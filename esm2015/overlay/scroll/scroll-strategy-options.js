/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone } from '@angular/core';
import { BlockScrollStrategy } from './block-scroll-strategy';
import { CloseScrollStrategy } from './close-scroll-strategy';
import { NoopScrollStrategy } from './noop-scroll-strategy';
import { RepositionScrollStrategy, } from './reposition-scroll-strategy';
import * as i0 from "@angular/core";
import * as i1 from "@angular/cdk/scrolling";
import * as i2 from "@angular/common";
/**
 * Options for how an overlay will handle scrolling.
 *
 * Users can provide a custom value for `ScrollStrategyOptions` to replace the default
 * behaviors. This class primarily acts as a factory for ScrollStrategy instances.
 */
export class ScrollStrategyOptions {
    constructor(_scrollDispatcher, _viewportRuler, _ngZone, document) {
        this._scrollDispatcher = _scrollDispatcher;
        this._viewportRuler = _viewportRuler;
        this._ngZone = _ngZone;
        /** Do nothing on scroll. */
        this.noop = () => new NoopScrollStrategy();
        /**
         * Close the overlay as soon as the user scrolls.
         * @param config Configuration to be used inside the scroll strategy.
         */
        this.close = (config) => new CloseScrollStrategy(this._scrollDispatcher, this._ngZone, this._viewportRuler, config);
        /** Block scrolling. */
        this.block = () => new BlockScrollStrategy(this._viewportRuler, this._document);
        /**
         * Update the overlay's position on scroll.
         * @param config Configuration to be used inside the scroll strategy.
         * Allows debouncing the reposition calls.
         */
        this.reposition = (config) => new RepositionScrollStrategy(this._scrollDispatcher, this._viewportRuler, this._ngZone, config);
        this._document = document;
    }
}
ScrollStrategyOptions.ɵprov = i0.ɵɵdefineInjectable({ factory: function ScrollStrategyOptions_Factory() { return new ScrollStrategyOptions(i0.ɵɵinject(i1.ScrollDispatcher), i0.ɵɵinject(i1.ViewportRuler), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i2.DOCUMENT)); }, token: ScrollStrategyOptions, providedIn: "root" });
ScrollStrategyOptions.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ScrollStrategyOptions.ctorParameters = () => [
    { type: ScrollDispatcher },
    { type: ViewportRuler },
    { type: NgZone },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLXN0cmF0ZWd5LW9wdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvc2Nyb2xsL3Njcm9sbC1zdHJhdGVneS1vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxhQUFhLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBQzVELE9BQU8sRUFBQyxtQkFBbUIsRUFBNEIsTUFBTSx5QkFBeUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQ0wsd0JBQXdCLEdBRXpCLE1BQU0sOEJBQThCLENBQUM7Ozs7QUFHdEM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8scUJBQXFCO0lBR2hDLFlBQ1UsaUJBQW1DLEVBQ25DLGNBQTZCLEVBQzdCLE9BQWUsRUFDTCxRQUFhO1FBSHZCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFDbkMsbUJBQWMsR0FBZCxjQUFjLENBQWU7UUFDN0IsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUt6Qiw0QkFBNEI7UUFDNUIsU0FBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUV0Qzs7O1dBR0c7UUFDSCxVQUFLLEdBQUcsQ0FBQyxNQUFrQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFDMUYsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRTlDLHVCQUF1QjtRQUN2QixVQUFLLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUzRTs7OztXQUlHO1FBQ0gsZUFBVSxHQUFHLENBQUMsTUFBdUMsRUFBRSxFQUFFLENBQUMsSUFBSSx3QkFBd0IsQ0FDbEYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQXRCbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDNUIsQ0FBQzs7OztZQVZKLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQWxCeEIsZ0JBQWdCO1lBQUUsYUFBYTtZQUVYLE1BQU07NENBd0I3QixNQUFNLFNBQUMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyLCBWaWV3cG9ydFJ1bGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7QmxvY2tTY3JvbGxTdHJhdGVneX0gZnJvbSAnLi9ibG9jay1zY3JvbGwtc3RyYXRlZ3knO1xyXG5pbXBvcnQge0Nsb3NlU2Nyb2xsU3RyYXRlZ3ksIENsb3NlU2Nyb2xsU3RyYXRlZ3lDb25maWd9IGZyb20gJy4vY2xvc2Utc2Nyb2xsLXN0cmF0ZWd5JztcclxuaW1wb3J0IHtOb29wU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vbm9vcC1zY3JvbGwtc3RyYXRlZ3knO1xyXG5pbXBvcnQge1xyXG4gIFJlcG9zaXRpb25TY3JvbGxTdHJhdGVneSxcclxuICBSZXBvc2l0aW9uU2Nyb2xsU3RyYXRlZ3lDb25maWcsXHJcbn0gZnJvbSAnLi9yZXBvc2l0aW9uLXNjcm9sbC1zdHJhdGVneSc7XHJcblxyXG5cclxuLyoqXHJcbiAqIE9wdGlvbnMgZm9yIGhvdyBhbiBvdmVybGF5IHdpbGwgaGFuZGxlIHNjcm9sbGluZy5cclxuICpcclxuICogVXNlcnMgY2FuIHByb3ZpZGUgYSBjdXN0b20gdmFsdWUgZm9yIGBTY3JvbGxTdHJhdGVneU9wdGlvbnNgIHRvIHJlcGxhY2UgdGhlIGRlZmF1bHRcclxuICogYmVoYXZpb3JzLiBUaGlzIGNsYXNzIHByaW1hcmlseSBhY3RzIGFzIGEgZmFjdG9yeSBmb3IgU2Nyb2xsU3RyYXRlZ3kgaW5zdGFuY2VzLlxyXG4gKi9cclxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxTdHJhdGVneU9wdGlvbnMge1xyXG4gIHByaXZhdGUgX2RvY3VtZW50OiBEb2N1bWVudDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIF9zY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxyXG4gICAgcHJpdmF0ZSBfdmlld3BvcnRSdWxlcjogVmlld3BvcnRSdWxlcixcclxuICAgIHByaXZhdGUgX25nWm9uZTogTmdab25lLFxyXG4gICAgQEluamVjdChET0NVTUVOVCkgZG9jdW1lbnQ6IGFueSkge1xyXG4gICAgICB0aGlzLl9kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gICAgfVxyXG5cclxuICAvKiogRG8gbm90aGluZyBvbiBzY3JvbGwuICovXHJcbiAgbm9vcCA9ICgpID0+IG5ldyBOb29wU2Nyb2xsU3RyYXRlZ3koKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2xvc2UgdGhlIG92ZXJsYXkgYXMgc29vbiBhcyB0aGUgdXNlciBzY3JvbGxzLlxyXG4gICAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgc2Nyb2xsIHN0cmF0ZWd5LlxyXG4gICAqL1xyXG4gIGNsb3NlID0gKGNvbmZpZz86IENsb3NlU2Nyb2xsU3RyYXRlZ3lDb25maWcpID0+IG5ldyBDbG9zZVNjcm9sbFN0cmF0ZWd5KHRoaXMuX3Njcm9sbERpc3BhdGNoZXIsXHJcbiAgICAgIHRoaXMuX25nWm9uZSwgdGhpcy5fdmlld3BvcnRSdWxlciwgY29uZmlnKVxyXG5cclxuICAvKiogQmxvY2sgc2Nyb2xsaW5nLiAqL1xyXG4gIGJsb2NrID0gKCkgPT4gbmV3IEJsb2NrU2Nyb2xsU3RyYXRlZ3kodGhpcy5fdmlld3BvcnRSdWxlciwgdGhpcy5fZG9jdW1lbnQpO1xyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIG92ZXJsYXkncyBwb3NpdGlvbiBvbiBzY3JvbGwuXHJcbiAgICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBzY3JvbGwgc3RyYXRlZ3kuXHJcbiAgICogQWxsb3dzIGRlYm91bmNpbmcgdGhlIHJlcG9zaXRpb24gY2FsbHMuXHJcbiAgICovXHJcbiAgcmVwb3NpdGlvbiA9IChjb25maWc/OiBSZXBvc2l0aW9uU2Nyb2xsU3RyYXRlZ3lDb25maWcpID0+IG5ldyBSZXBvc2l0aW9uU2Nyb2xsU3RyYXRlZ3koXHJcbiAgICAgIHRoaXMuX3Njcm9sbERpc3BhdGNoZXIsIHRoaXMuX3ZpZXdwb3J0UnVsZXIsIHRoaXMuX25nWm9uZSwgY29uZmlnKVxyXG59XHJcbiJdfQ==