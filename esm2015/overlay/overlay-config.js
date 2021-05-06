/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NoopScrollStrategy } from './scroll/index';
/** Initial configuration used when creating an overlay. */
export class OverlayConfig {
    constructor(config) {
        /** Strategy to be used when handling scroll events while the overlay is open. */
        this.scrollStrategy = new NoopScrollStrategy();
        /** Custom class to add to the overlay pane. */
        this.panelClass = '';
        /** Whether the overlay has a backdrop. */
        this.hasBackdrop = false;
        /** Custom class to add to the backdrop */
        this.backdropClass = 'cdk-overlay-dark-backdrop';
        /**
         * Whether the overlay should be disposed of when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.disposeOnNavigation = false;
        if (config) {
            // Use `Iterable` instead of `Array` because TypeScript, as of 3.6.3,
            // loses the array generic type in the `for of`. But we *also* have to use `Array` because
            // typescript won't iterate over an `Iterable` unless you compile with `--downlevelIteration`
            const configKeys = Object.keys(config);
            for (const key of configKeys) {
                if (config[key] !== undefined) {
                    // TypeScript, as of version 3.5, sees the left-hand-side of this expression
                    // as "I don't know *which* key this is, so the only valid value is the intersection
                    // of all the posible values." In this case, that happens to be `undefined`. TypeScript
                    // is not smart enough to see that the right-hand-side is actually an access of the same
                    // exact type with the same exact key, meaning that the value type must be identical.
                    // So we use `any` to work around this.
                    this[key] = config[key];
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcmxheS1jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvb3ZlcmxheS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxFQUFpQixrQkFBa0IsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR2xFLDJEQUEyRDtBQUMzRCxNQUFNLE9BQU8sYUFBYTtJQStDeEIsWUFBWSxNQUFzQjtRQTNDbEMsaUZBQWlGO1FBQ2pGLG1CQUFjLEdBQW9CLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUUzRCwrQ0FBK0M7UUFDL0MsZUFBVSxHQUF1QixFQUFFLENBQUM7UUFFcEMsMENBQTBDO1FBQzFDLGdCQUFXLEdBQWEsS0FBSyxDQUFDO1FBRTlCLDBDQUEwQztRQUMxQyxrQkFBYSxHQUF1QiwyQkFBMkIsQ0FBQztRQTBCaEU7Ozs7V0FJRztRQUNILHdCQUFtQixHQUFhLEtBQUssQ0FBQztRQUdwQyxJQUFJLE1BQU0sRUFBRTtZQUNWLHFFQUFxRTtZQUNyRSwwRkFBMEY7WUFDMUYsNkZBQTZGO1lBQzdGLE1BQU0sVUFBVSxHQUNaLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUE0RCxDQUFDO1lBQ25GLEtBQUssTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFO2dCQUM1QixJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxTQUFTLEVBQUU7b0JBQzdCLDRFQUE0RTtvQkFDNUUsb0ZBQW9GO29CQUNwRix1RkFBdUY7b0JBQ3ZGLHdGQUF3RjtvQkFDeEYscUZBQXFGO29CQUNyRix1Q0FBdUM7b0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFRLENBQUM7aUJBQ2hDO2FBQ0Y7U0FDRjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtQb3NpdGlvblN0cmF0ZWd5fSBmcm9tICcuL3Bvc2l0aW9uL3Bvc2l0aW9uLXN0cmF0ZWd5JztcclxuaW1wb3J0IHtEaXJlY3Rpb24sIERpcmVjdGlvbmFsaXR5fSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XHJcbmltcG9ydCB7U2Nyb2xsU3RyYXRlZ3ksIE5vb3BTY3JvbGxTdHJhdGVneX0gZnJvbSAnLi9zY3JvbGwvaW5kZXgnO1xyXG5cclxuXHJcbi8qKiBJbml0aWFsIGNvbmZpZ3VyYXRpb24gdXNlZCB3aGVuIGNyZWF0aW5nIGFuIG92ZXJsYXkuICovXHJcbmV4cG9ydCBjbGFzcyBPdmVybGF5Q29uZmlnIHtcclxuICAvKiogU3RyYXRlZ3kgd2l0aCB3aGljaCB0byBwb3NpdGlvbiB0aGUgb3ZlcmxheS4gKi9cclxuICBwb3NpdGlvblN0cmF0ZWd5PzogUG9zaXRpb25TdHJhdGVneTtcclxuXHJcbiAgLyoqIFN0cmF0ZWd5IHRvIGJlIHVzZWQgd2hlbiBoYW5kbGluZyBzY3JvbGwgZXZlbnRzIHdoaWxlIHRoZSBvdmVybGF5IGlzIG9wZW4uICovXHJcbiAgc2Nyb2xsU3RyYXRlZ3k/OiBTY3JvbGxTdHJhdGVneSA9IG5ldyBOb29wU2Nyb2xsU3RyYXRlZ3koKTtcclxuXHJcbiAgLyoqIEN1c3RvbSBjbGFzcyB0byBhZGQgdG8gdGhlIG92ZXJsYXkgcGFuZS4gKi9cclxuICBwYW5lbENsYXNzPzogc3RyaW5nIHwgc3RyaW5nW10gPSAnJztcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIG92ZXJsYXkgaGFzIGEgYmFja2Ryb3AuICovXHJcbiAgaGFzQmFja2Ryb3A/OiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8qKiBDdXN0b20gY2xhc3MgdG8gYWRkIHRvIHRoZSBiYWNrZHJvcCAqL1xyXG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXSA9ICdjZGstb3ZlcmxheS1kYXJrLWJhY2tkcm9wJztcclxuXHJcbiAgLyoqIFRoZSB3aWR0aCBvZiB0aGUgb3ZlcmxheSBwYW5lbC4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLiAqL1xyXG4gIHdpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xyXG5cclxuICAvKiogVGhlIGhlaWdodCBvZiB0aGUgb3ZlcmxheSBwYW5lbC4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLiAqL1xyXG4gIGhlaWdodD86IG51bWJlciB8IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBtaW4td2lkdGggb2YgdGhlIG92ZXJsYXkgcGFuZWwuIElmIGEgbnVtYmVyIGlzIHByb3ZpZGVkLCBwaXhlbCB1bml0cyBhcmUgYXNzdW1lZC4gKi9cclxuICBtaW5XaWR0aD86IG51bWJlciB8IHN0cmluZztcclxuXHJcbiAgLyoqIFRoZSBtaW4taGVpZ2h0IG9mIHRoZSBvdmVybGF5IHBhbmVsLiBJZiBhIG51bWJlciBpcyBwcm92aWRlZCwgcGl4ZWwgdW5pdHMgYXJlIGFzc3VtZWQuICovXHJcbiAgbWluSGVpZ2h0PzogbnVtYmVyIHwgc3RyaW5nO1xyXG5cclxuICAvKiogVGhlIG1heC13aWR0aCBvZiB0aGUgb3ZlcmxheSBwYW5lbC4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLiAqL1xyXG4gIG1heFdpZHRoPzogbnVtYmVyIHwgc3RyaW5nO1xyXG5cclxuICAvKiogVGhlIG1heC1oZWlnaHQgb2YgdGhlIG92ZXJsYXkgcGFuZWwuIElmIGEgbnVtYmVyIGlzIHByb3ZpZGVkLCBwaXhlbCB1bml0cyBhcmUgYXNzdW1lZC4gKi9cclxuICBtYXhIZWlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIERpcmVjdGlvbiBvZiB0aGUgdGV4dCBpbiB0aGUgb3ZlcmxheSBwYW5lbC4gSWYgYSBgRGlyZWN0aW9uYWxpdHlgIGluc3RhbmNlXHJcbiAgICogaXMgcGFzc2VkIGluLCB0aGUgb3ZlcmxheSB3aWxsIGhhbmRsZSBjaGFuZ2VzIHRvIGl0cyB2YWx1ZSBhdXRvbWF0aWNhbGx5LlxyXG4gICAqL1xyXG4gIGRpcmVjdGlvbj86IERpcmVjdGlvbiB8IERpcmVjdGlvbmFsaXR5O1xyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBvdmVybGF5IHNob3VsZCBiZSBkaXNwb3NlZCBvZiB3aGVuIHRoZSB1c2VyIGdvZXMgYmFja3dhcmRzL2ZvcndhcmRzIGluIGhpc3RvcnkuXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgdXN1YWxseSBkb2Vzbid0IGluY2x1ZGUgY2xpY2tpbmcgb24gbGlua3MgKHVubGVzcyB0aGUgdXNlciBpcyB1c2luZ1xyXG4gICAqIHRoZSBgSGFzaExvY2F0aW9uU3RyYXRlZ3lgKS5cclxuICAgKi9cclxuICBkaXNwb3NlT25OYXZpZ2F0aW9uPzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihjb25maWc/OiBPdmVybGF5Q29uZmlnKSB7XHJcbiAgICBpZiAoY29uZmlnKSB7XHJcbiAgICAgIC8vIFVzZSBgSXRlcmFibGVgIGluc3RlYWQgb2YgYEFycmF5YCBiZWNhdXNlIFR5cGVTY3JpcHQsIGFzIG9mIDMuNi4zLFxyXG4gICAgICAvLyBsb3NlcyB0aGUgYXJyYXkgZ2VuZXJpYyB0eXBlIGluIHRoZSBgZm9yIG9mYC4gQnV0IHdlICphbHNvKiBoYXZlIHRvIHVzZSBgQXJyYXlgIGJlY2F1c2VcclxuICAgICAgLy8gdHlwZXNjcmlwdCB3b24ndCBpdGVyYXRlIG92ZXIgYW4gYEl0ZXJhYmxlYCB1bmxlc3MgeW91IGNvbXBpbGUgd2l0aCBgLS1kb3dubGV2ZWxJdGVyYXRpb25gXHJcbiAgICAgIGNvbnN0IGNvbmZpZ0tleXMgPVxyXG4gICAgICAgICAgT2JqZWN0LmtleXMoY29uZmlnKSBhcyBJdGVyYWJsZTxrZXlvZiBPdmVybGF5Q29uZmlnPiAmIChrZXlvZiBPdmVybGF5Q29uZmlnKVtdO1xyXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBjb25maWdLZXlzKSB7XHJcbiAgICAgICAgaWYgKGNvbmZpZ1trZXldICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIC8vIFR5cGVTY3JpcHQsIGFzIG9mIHZlcnNpb24gMy41LCBzZWVzIHRoZSBsZWZ0LWhhbmQtc2lkZSBvZiB0aGlzIGV4cHJlc3Npb25cclxuICAgICAgICAgIC8vIGFzIFwiSSBkb24ndCBrbm93ICp3aGljaCoga2V5IHRoaXMgaXMsIHNvIHRoZSBvbmx5IHZhbGlkIHZhbHVlIGlzIHRoZSBpbnRlcnNlY3Rpb25cclxuICAgICAgICAgIC8vIG9mIGFsbCB0aGUgcG9zaWJsZSB2YWx1ZXMuXCIgSW4gdGhpcyBjYXNlLCB0aGF0IGhhcHBlbnMgdG8gYmUgYHVuZGVmaW5lZGAuIFR5cGVTY3JpcHRcclxuICAgICAgICAgIC8vIGlzIG5vdCBzbWFydCBlbm91Z2ggdG8gc2VlIHRoYXQgdGhlIHJpZ2h0LWhhbmQtc2lkZSBpcyBhY3R1YWxseSBhbiBhY2Nlc3Mgb2YgdGhlIHNhbWVcclxuICAgICAgICAgIC8vIGV4YWN0IHR5cGUgd2l0aCB0aGUgc2FtZSBleGFjdCBrZXksIG1lYW5pbmcgdGhhdCB0aGUgdmFsdWUgdHlwZSBtdXN0IGJlIGlkZW50aWNhbC5cclxuICAgICAgICAgIC8vIFNvIHdlIHVzZSBgYW55YCB0byB3b3JrIGFyb3VuZCB0aGlzLlxyXG4gICAgICAgICAgdGhpc1trZXldID0gY29uZmlnW2tleV0gYXMgYW55O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=