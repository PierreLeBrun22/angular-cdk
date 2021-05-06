/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
export { ScrollStrategyOptions } from './scroll-strategy-options';
export { RepositionScrollStrategy } from './reposition-scroll-strategy';
export { CloseScrollStrategy } from './close-scroll-strategy';
export { NoopScrollStrategy } from './noop-scroll-strategy';
export { BlockScrollStrategy } from './block-scroll-strategy';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL292ZXJsYXkvc2Nyb2xsL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUl2RSxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQ0wsd0JBQXdCLEVBRXpCLE1BQU0sOEJBQThCLENBQUM7QUFDdEMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDNUQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmV4cG9ydCB7Q2RrU2Nyb2xsYWJsZSwgU2Nyb2xsRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcblxyXG4vLyBFeHBvcnQgcHJlLWRlZmluZWQgc2Nyb2xsIHN0cmF0ZWdpZXMgYW5kIGludGVyZmFjZSB0byBidWlsZCBjdXN0b20gb25lcy5cclxuZXhwb3J0IHtTY3JvbGxTdHJhdGVneX0gZnJvbSAnLi9zY3JvbGwtc3RyYXRlZ3knO1xyXG5leHBvcnQge1Njcm9sbFN0cmF0ZWd5T3B0aW9uc30gZnJvbSAnLi9zY3JvbGwtc3RyYXRlZ3ktb3B0aW9ucyc7XHJcbmV4cG9ydCB7XHJcbiAgUmVwb3NpdGlvblNjcm9sbFN0cmF0ZWd5LFxyXG4gIFJlcG9zaXRpb25TY3JvbGxTdHJhdGVneUNvbmZpZ1xyXG59IGZyb20gJy4vcmVwb3NpdGlvbi1zY3JvbGwtc3RyYXRlZ3knO1xyXG5leHBvcnQge0Nsb3NlU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vY2xvc2Utc2Nyb2xsLXN0cmF0ZWd5JztcclxuZXhwb3J0IHtOb29wU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vbm9vcC1zY3JvbGwtc3RyYXRlZ3knO1xyXG5leHBvcnQge0Jsb2NrU2Nyb2xsU3RyYXRlZ3l9IGZyb20gJy4vYmxvY2stc2Nyb2xsLXN0cmF0ZWd5JztcclxuIl19