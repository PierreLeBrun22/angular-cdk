/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';
/**
 * Injection token used to inject the document into Directionality.
 * This is used so that the value can be faked in tests.
 *
 * We can't use the real document in tests because changing the real `dir` causes geometry-based
 * tests in Safari to fail.
 *
 * We also can't re-provide the DOCUMENT token from platform-brower because the unit tests
 * themselves use things like `querySelector` in test code.
 *
 * This token is defined in a separate file from Directionality as a workaround for
 * https://github.com/angular/angular/issues/22559
 *
 * @docs-private
 */
export const DIR_DOCUMENT = new InjectionToken('cdk-dir-doc', {
    providedIn: 'root',
    factory: DIR_DOCUMENT_FACTORY,
});
/** @docs-private */
export function DIR_DOCUMENT_FACTORY() {
    return inject(DOCUMENT);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyLWRvY3VtZW50LXRva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9iaWRpL2Rpci1kb2N1bWVudC10b2tlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHckQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQVcsYUFBYSxFQUFFO0lBQ3RFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxvQkFBb0I7Q0FDOUIsQ0FBQyxDQUFDO0FBRUgsb0JBQW9CO0FBQ3BCLE1BQU0sVUFBVSxvQkFBb0I7SUFDbEMsT0FBTyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtpbmplY3QsIEluamVjdGlvblRva2VufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcblxyXG4vKipcclxuICogSW5qZWN0aW9uIHRva2VuIHVzZWQgdG8gaW5qZWN0IHRoZSBkb2N1bWVudCBpbnRvIERpcmVjdGlvbmFsaXR5LlxyXG4gKiBUaGlzIGlzIHVzZWQgc28gdGhhdCB0aGUgdmFsdWUgY2FuIGJlIGZha2VkIGluIHRlc3RzLlxyXG4gKlxyXG4gKiBXZSBjYW4ndCB1c2UgdGhlIHJlYWwgZG9jdW1lbnQgaW4gdGVzdHMgYmVjYXVzZSBjaGFuZ2luZyB0aGUgcmVhbCBgZGlyYCBjYXVzZXMgZ2VvbWV0cnktYmFzZWRcclxuICogdGVzdHMgaW4gU2FmYXJpIHRvIGZhaWwuXHJcbiAqXHJcbiAqIFdlIGFsc28gY2FuJ3QgcmUtcHJvdmlkZSB0aGUgRE9DVU1FTlQgdG9rZW4gZnJvbSBwbGF0Zm9ybS1icm93ZXIgYmVjYXVzZSB0aGUgdW5pdCB0ZXN0c1xyXG4gKiB0aGVtc2VsdmVzIHVzZSB0aGluZ3MgbGlrZSBgcXVlcnlTZWxlY3RvcmAgaW4gdGVzdCBjb2RlLlxyXG4gKlxyXG4gKiBUaGlzIHRva2VuIGlzIGRlZmluZWQgaW4gYSBzZXBhcmF0ZSBmaWxlIGZyb20gRGlyZWN0aW9uYWxpdHkgYXMgYSB3b3JrYXJvdW5kIGZvclxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8yMjU1OVxyXG4gKlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgRElSX0RPQ1VNRU5UID0gbmV3IEluamVjdGlvblRva2VuPERvY3VtZW50PignY2RrLWRpci1kb2MnLCB7XHJcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxyXG4gIGZhY3Rvcnk6IERJUl9ET0NVTUVOVF9GQUNUT1JZLFxyXG59KTtcclxuXHJcbi8qKiBAZG9jcy1wcml2YXRlICovXHJcbmV4cG9ydCBmdW5jdGlvbiBESVJfRE9DVU1FTlRfRkFDVE9SWSgpOiBEb2N1bWVudCB7XHJcbiAgcmV0dXJuIGluamVjdChET0NVTUVOVCk7XHJcbn1cclxuIl19