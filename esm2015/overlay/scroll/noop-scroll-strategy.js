/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Scroll strategy that doesn't do anything. */
export class NoopScrollStrategy {
    /** Does nothing, as this scroll strategy is a no-op. */
    enable() { }
    /** Does nothing, as this scroll strategy is a no-op. */
    disable() { }
    /** Does nothing, as this scroll strategy is a no-op. */
    attach() { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9vcC1zY3JvbGwtc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvc2Nyb2xsL25vb3Atc2Nyb2xsLXN0cmF0ZWd5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILGdEQUFnRDtBQUNoRCxNQUFNLE9BQU8sa0JBQWtCO0lBQzdCLHdEQUF3RDtJQUN4RCxNQUFNLEtBQUssQ0FBQztJQUNaLHdEQUF3RDtJQUN4RCxPQUFPLEtBQUssQ0FBQztJQUNiLHdEQUF3RDtJQUN4RCxNQUFNLEtBQUssQ0FBQztDQUNiIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1Njcm9sbFN0cmF0ZWd5fSBmcm9tICcuL3Njcm9sbC1zdHJhdGVneSc7XHJcblxyXG4vKiogU2Nyb2xsIHN0cmF0ZWd5IHRoYXQgZG9lc24ndCBkbyBhbnl0aGluZy4gKi9cclxuZXhwb3J0IGNsYXNzIE5vb3BTY3JvbGxTdHJhdGVneSBpbXBsZW1lbnRzIFNjcm9sbFN0cmF0ZWd5IHtcclxuICAvKiogRG9lcyBub3RoaW5nLCBhcyB0aGlzIHNjcm9sbCBzdHJhdGVneSBpcyBhIG5vLW9wLiAqL1xyXG4gIGVuYWJsZSgpIHsgfVxyXG4gIC8qKiBEb2VzIG5vdGhpbmcsIGFzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IGlzIGEgbm8tb3AuICovXHJcbiAgZGlzYWJsZSgpIHsgfVxyXG4gIC8qKiBEb2VzIG5vdGhpbmcsIGFzIHRoaXMgc2Nyb2xsIHN0cmF0ZWd5IGlzIGEgbm8tb3AuICovXHJcbiAgYXR0YWNoKCkgeyB9XHJcbn1cclxuIl19