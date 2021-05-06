/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directionality } from '@angular/cdk/bidi';
import { getRtlScrollAxisType, supportsScrollBehavior } from '@angular/cdk/platform';
import { Directive, ElementRef, NgZone, Optional } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScrollDispatcher } from './scroll-dispatcher';
/**
 * Sends an event when the directive's element is scrolled. Registers itself with the
 * ScrollDispatcher service to include itself as part of its collection of scrolling events that it
 * can be listened to through the service.
 */
export class CdkScrollable {
    constructor(elementRef, scrollDispatcher, ngZone, dir) {
        this.elementRef = elementRef;
        this.scrollDispatcher = scrollDispatcher;
        this.ngZone = ngZone;
        this.dir = dir;
        this._destroyed = new Subject();
        this._elementScrolled = new Observable((observer) => this.ngZone.runOutsideAngular(() => fromEvent(this.elementRef.nativeElement, 'scroll').pipe(takeUntil(this._destroyed))
            .subscribe(observer)));
    }
    ngOnInit() {
        this.scrollDispatcher.register(this);
    }
    ngOnDestroy() {
        this.scrollDispatcher.deregister(this);
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Returns observable that emits when a scroll event is fired on the host element. */
    elementScrolled() {
        return this._elementScrolled;
    }
    /** Gets the ElementRef for the viewport. */
    getElementRef() {
        return this.elementRef;
    }
    /**
     * Scrolls to the specified offsets. This is a normalized version of the browser's native scrollTo
     * method, since browsers are not consistent about what scrollLeft means in RTL. For this method
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param options specified the offsets to scroll to.
     */
    scrollTo(options) {
        const el = this.elementRef.nativeElement;
        const isRtl = this.dir && this.dir.value == 'rtl';
        // Rewrite start & end offsets as right or left offsets.
        if (options.left == null) {
            options.left = isRtl ? options.end : options.start;
        }
        if (options.right == null) {
            options.right = isRtl ? options.start : options.end;
        }
        // Rewrite the bottom offset as a top offset.
        if (options.bottom != null) {
            options.top =
                el.scrollHeight - el.clientHeight - options.bottom;
        }
        // Rewrite the right offset as a left offset.
        if (isRtl && getRtlScrollAxisType() != 0 /* NORMAL */) {
            if (options.left != null) {
                options.right =
                    el.scrollWidth - el.clientWidth - options.left;
            }
            if (getRtlScrollAxisType() == 2 /* INVERTED */) {
                options.left = options.right;
            }
            else if (getRtlScrollAxisType() == 1 /* NEGATED */) {
                options.left = options.right ? -options.right : options.right;
            }
        }
        else {
            if (options.right != null) {
                options.left =
                    el.scrollWidth - el.clientWidth - options.right;
            }
        }
        this._applyScrollToOptions(options);
    }
    _applyScrollToOptions(options) {
        const el = this.elementRef.nativeElement;
        if (supportsScrollBehavior()) {
            el.scrollTo(options);
        }
        else {
            if (options.top != null) {
                el.scrollTop = options.top;
            }
            if (options.left != null) {
                el.scrollLeft = options.left;
            }
        }
    }
    /**
     * Measures the scroll offset relative to the specified edge of the viewport. This method can be
     * used instead of directly checking scrollLeft or scrollTop, since browsers are not consistent
     * about what scrollLeft means in RTL. The values returned by this method are normalized such that
     * left and right always refer to the left and right side of the scrolling container irrespective
     * of the layout direction. start and end refer to left and right in an LTR context and vice-versa
     * in an RTL context.
     * @param from The edge to measure from.
     */
    measureScrollOffset(from) {
        const LEFT = 'left';
        const RIGHT = 'right';
        const el = this.elementRef.nativeElement;
        if (from == 'top') {
            return el.scrollTop;
        }
        if (from == 'bottom') {
            return el.scrollHeight - el.clientHeight - el.scrollTop;
        }
        // Rewrite start & end as left or right offsets.
        const isRtl = this.dir && this.dir.value == 'rtl';
        if (from == 'start') {
            from = isRtl ? RIGHT : LEFT;
        }
        else if (from == 'end') {
            from = isRtl ? LEFT : RIGHT;
        }
        if (isRtl && getRtlScrollAxisType() == 2 /* INVERTED */) {
            // For INVERTED, scrollLeft is (scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            }
            else {
                return el.scrollLeft;
            }
        }
        else if (isRtl && getRtlScrollAxisType() == 1 /* NEGATED */) {
            // For NEGATED, scrollLeft is -(scrollWidth - clientWidth) when scrolled all the way left and
            // 0 when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft + el.scrollWidth - el.clientWidth;
            }
            else {
                return -el.scrollLeft;
            }
        }
        else {
            // For NORMAL, as well as non-RTL contexts, scrollLeft is 0 when scrolled all the way left and
            // (scrollWidth - clientWidth) when scrolled all the way right.
            if (from == LEFT) {
                return el.scrollLeft;
            }
            else {
                return el.scrollWidth - el.clientWidth - el.scrollLeft;
            }
        }
    }
}
CdkScrollable.decorators = [
    { type: Directive, args: [{
                selector: '[cdk-scrollable], [cdkScrollable]'
            },] }
];
CdkScrollable.ctorParameters = () => [
    { type: ElementRef },
    { type: ScrollDispatcher },
    { type: NgZone },
    { type: Directionality, decorators: [{ type: Optional }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2Nyb2xsaW5nL3Njcm9sbGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQ2pELE9BQU8sRUFDTCxvQkFBb0IsRUFFcEIsc0JBQXNCLEVBQ3ZCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFxQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDekYsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFXLE1BQU0sTUFBTSxDQUFDO0FBQzlELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQXFCckQ7Ozs7R0FJRztBQUlILE1BQU0sT0FBTyxhQUFhO0lBUXhCLFlBQXNCLFVBQW1DLEVBQ25DLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ0YsR0FBb0I7UUFIaEMsZUFBVSxHQUFWLFVBQVUsQ0FBeUI7UUFDbkMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ0YsUUFBRyxHQUFILEdBQUcsQ0FBaUI7UUFWOUMsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFakMscUJBQWdCLEdBQXNCLElBQUksVUFBVSxDQUFDLENBQUMsUUFBeUIsRUFBRSxFQUFFLENBQ3ZGLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQy9CLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUks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QThCLEVBQUU7WUFDakUsNkZBQTZGO1lBQzdGLHFDQUFxQztZQUNyQyxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDeEQ7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO2FBQ3RCO1NBQ0Y7YUFBTSxJQUFJLEtBQUssSUFBSSxvQkFBb0IsRUFBRSxtQkFBNkIsRUFBRTtZQUN2RSw2RkFBNkY7WUFDN0YscUNBQXFDO1lBQ3JDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDaEIsT0FBTyxFQUFFLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUN4RDtpQkFBTTtnQkFDTCxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQzthQUN2QjtTQUNGO2FBQU07WUFDTCw4RkFBOEY7WUFDOUYsK0RBQStEO1lBQy9ELElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtnQkFDaEIsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO2FBQ3RCO2lCQUFNO2dCQUNMLE9BQU8sRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7YUFDeEQ7U0FDRjtJQUNILENBQUM7OztZQXpKRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLG1DQUFtQzthQUM5Qzs7O1lBL0JrQixVQUFVO1lBR3JCLGdCQUFnQjtZQUhPLE1BQU07WUFON0IsY0FBYyx1QkFpRFAsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xyXG5pbXBvcnQge1xyXG4gIGdldFJ0bFNjcm9sbEF4aXNUeXBlLFxyXG4gIFJ0bFNjcm9sbEF4aXNUeXBlLFxyXG4gIHN1cHBvcnRzU2Nyb2xsQmVoYXZpb3JcclxufSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xyXG5pbXBvcnQge0RpcmVjdGl2ZSwgRWxlbWVudFJlZiwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge2Zyb21FdmVudCwgT2JzZXJ2YWJsZSwgU3ViamVjdCwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge3Rha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1Njcm9sbERpc3BhdGNoZXJ9IGZyb20gJy4vc2Nyb2xsLWRpc3BhdGNoZXInO1xyXG5cclxuZXhwb3J0IHR5cGUgX1dpdGhvdXQ8VD4gPSB7W1AgaW4ga2V5b2YgVF0/OiBuZXZlcn07XHJcbmV4cG9ydCB0eXBlIF9YT1I8VCwgVT4gPSAoX1dpdGhvdXQ8VD4gJiBVKSB8IChfV2l0aG91dDxVPiAmIFQpO1xyXG5leHBvcnQgdHlwZSBfVG9wID0ge3RvcD86IG51bWJlcn07XHJcbmV4cG9ydCB0eXBlIF9Cb3R0b20gPSB7Ym90dG9tPzogbnVtYmVyfTtcclxuZXhwb3J0IHR5cGUgX0xlZnQgPSB7bGVmdD86IG51bWJlcn07XHJcbmV4cG9ydCB0eXBlIF9SaWdodCA9IHtyaWdodD86IG51bWJlcn07XHJcbmV4cG9ydCB0eXBlIF9TdGFydCA9IHtzdGFydD86IG51bWJlcn07XHJcbmV4cG9ydCB0eXBlIF9FbmQgPSB7ZW5kPzogbnVtYmVyfTtcclxuZXhwb3J0IHR5cGUgX1hBeGlzID0gX1hPUjxfWE9SPF9MZWZ0LCBfUmlnaHQ+LCBfWE9SPF9TdGFydCwgX0VuZD4+O1xyXG5leHBvcnQgdHlwZSBfWUF4aXMgPSBfWE9SPF9Ub3AsIF9Cb3R0b20+O1xyXG5cclxuLyoqXHJcbiAqIEFuIGV4dGVuZGVkIHZlcnNpb24gb2YgU2Nyb2xsVG9PcHRpb25zIHRoYXQgYWxsb3dzIGV4cHJlc3Npbmcgc2Nyb2xsIG9mZnNldHMgcmVsYXRpdmUgdG8gdGhlXHJcbiAqIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodCwgc3RhcnQsIG9yIGVuZCBvZiB0aGUgdmlld3BvcnQgcmF0aGVyIHRoYW4ganVzdCB0aGUgdG9wIGFuZCBsZWZ0LlxyXG4gKiBQbGVhc2Ugbm90ZTogdGhlIHRvcCBhbmQgYm90dG9tIHByb3BlcnRpZXMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZSwgYXMgYXJlIHRoZSBsZWZ0LCByaWdodCxcclxuICogc3RhcnQsIGFuZCBlbmQgcHJvcGVydGllcy5cclxuICovXHJcbmV4cG9ydCB0eXBlIEV4dGVuZGVkU2Nyb2xsVG9PcHRpb25zID0gX1hBeGlzICYgX1lBeGlzICYgU2Nyb2xsT3B0aW9ucztcclxuXHJcbi8qKlxyXG4gKiBTZW5kcyBhbiBldmVudCB3aGVuIHRoZSBkaXJlY3RpdmUncyBlbGVtZW50IGlzIHNjcm9sbGVkLiBSZWdpc3RlcnMgaXRzZWxmIHdpdGggdGhlXHJcbiAqIFNjcm9sbERpc3BhdGNoZXIgc2VydmljZSB0byBpbmNsdWRlIGl0c2VsZiBhcyBwYXJ0IG9mIGl0cyBjb2xsZWN0aW9uIG9mIHNjcm9sbGluZyBldmVudHMgdGhhdCBpdFxyXG4gKiBjYW4gYmUgbGlzdGVuZWQgdG8gdGhyb3VnaCB0aGUgc2VydmljZS5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nkay1zY3JvbGxhYmxlXSwgW2Nka1Njcm9sbGFibGVdJ1xyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrU2Nyb2xsYWJsZSBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICBwcml2YXRlIF9lbGVtZW50U2Nyb2xsZWQ6IE9ic2VydmFibGU8RXZlbnQ+ID0gbmV3IE9ic2VydmFibGUoKG9ic2VydmVyOiBPYnNlcnZlcjxFdmVudD4pID0+XHJcbiAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XHJcbiAgICAgICAgICBmcm9tRXZlbnQodGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQsICdzY3JvbGwnKS5waXBlKHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxyXG4gICAgICAgICAgICAgIC5zdWJzY3JpYmUob2JzZXJ2ZXIpKSk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbGVtZW50UmVmOiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PixcclxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgc2Nyb2xsRGlzcGF0Y2hlcjogU2Nyb2xsRGlzcGF0Y2hlcixcclxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgbmdab25lOiBOZ1pvbmUsXHJcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgcHJvdGVjdGVkIGRpcj86IERpcmVjdGlvbmFsaXR5KSB7fVxyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIHRoaXMuc2Nyb2xsRGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5zY3JvbGxEaXNwYXRjaGVyLmRlcmVnaXN0ZXIodGhpcyk7XHJcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICAvKiogUmV0dXJucyBvYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbiBhIHNjcm9sbCBldmVudCBpcyBmaXJlZCBvbiB0aGUgaG9zdCBlbGVtZW50LiAqL1xyXG4gIGVsZW1lbnRTY3JvbGxlZCgpOiBPYnNlcnZhYmxlPEV2ZW50PiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZWxlbWVudFNjcm9sbGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIEVsZW1lbnRSZWYgZm9yIHRoZSB2aWV3cG9ydC4gKi9cclxuICBnZXRFbGVtZW50UmVmKCk6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+IHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnRSZWY7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTY3JvbGxzIHRvIHRoZSBzcGVjaWZpZWQgb2Zmc2V0cy4gVGhpcyBpcyBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiB0aGUgYnJvd3NlcidzIG5hdGl2ZSBzY3JvbGxUb1xyXG4gICAqIG1ldGhvZCwgc2luY2UgYnJvd3NlcnMgYXJlIG5vdCBjb25zaXN0ZW50IGFib3V0IHdoYXQgc2Nyb2xsTGVmdCBtZWFucyBpbiBSVEwuIEZvciB0aGlzIG1ldGhvZFxyXG4gICAqIGxlZnQgYW5kIHJpZ2h0IGFsd2F5cyByZWZlciB0byB0aGUgbGVmdCBhbmQgcmlnaHQgc2lkZSBvZiB0aGUgc2Nyb2xsaW5nIGNvbnRhaW5lciBpcnJlc3BlY3RpdmVcclxuICAgKiBvZiB0aGUgbGF5b3V0IGRpcmVjdGlvbi4gc3RhcnQgYW5kIGVuZCByZWZlciB0byBsZWZ0IGFuZCByaWdodCBpbiBhbiBMVFIgY29udGV4dCBhbmQgdmljZS12ZXJzYVxyXG4gICAqIGluIGFuIFJUTCBjb250ZXh0LlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIHNwZWNpZmllZCB0aGUgb2Zmc2V0cyB0byBzY3JvbGwgdG8uXHJcbiAgICovXHJcbiAgc2Nyb2xsVG8ob3B0aW9uczogRXh0ZW5kZWRTY3JvbGxUb09wdGlvbnMpOiB2b2lkIHtcclxuICAgIGNvbnN0IGVsID0gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICBjb25zdCBpc1J0bCA9IHRoaXMuZGlyICYmIHRoaXMuZGlyLnZhbHVlID09ICdydGwnO1xyXG5cclxuICAgIC8vIFJld3JpdGUgc3RhcnQgJiBlbmQgb2Zmc2V0cyBhcyByaWdodCBvciBsZWZ0IG9mZnNldHMuXHJcbiAgICBpZiAob3B0aW9ucy5sZWZ0ID09IG51bGwpIHtcclxuICAgICAgb3B0aW9ucy5sZWZ0ID0gaXNSdGwgPyBvcHRpb25zLmVuZCA6IG9wdGlvbnMuc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnMucmlnaHQgPT0gbnVsbCkge1xyXG4gICAgICBvcHRpb25zLnJpZ2h0ID0gaXNSdGwgPyBvcHRpb25zLnN0YXJ0IDogb3B0aW9ucy5lbmQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmV3cml0ZSB0aGUgYm90dG9tIG9mZnNldCBhcyBhIHRvcCBvZmZzZXQuXHJcbiAgICBpZiAob3B0aW9ucy5ib3R0b20gIT0gbnVsbCkge1xyXG4gICAgICAob3B0aW9ucyBhcyBfV2l0aG91dDxfQm90dG9tPiAmIF9Ub3ApLnRvcCA9XHJcbiAgICAgICAgICBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHQgLSBvcHRpb25zLmJvdHRvbTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXdyaXRlIHRoZSByaWdodCBvZmZzZXQgYXMgYSBsZWZ0IG9mZnNldC5cclxuICAgIGlmIChpc1J0bCAmJiBnZXRSdGxTY3JvbGxBeGlzVHlwZSgpICE9IFJ0bFNjcm9sbEF4aXNUeXBlLk5PUk1BTCkge1xyXG4gICAgICBpZiAob3B0aW9ucy5sZWZ0ICE9IG51bGwpIHtcclxuICAgICAgICAob3B0aW9ucyBhcyBfV2l0aG91dDxfTGVmdD4gJiBfUmlnaHQpLnJpZ2h0ID1cclxuICAgICAgICAgICAgZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aCAtIG9wdGlvbnMubGVmdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGdldFJ0bFNjcm9sbEF4aXNUeXBlKCkgPT0gUnRsU2Nyb2xsQXhpc1R5cGUuSU5WRVJURUQpIHtcclxuICAgICAgICBvcHRpb25zLmxlZnQgPSBvcHRpb25zLnJpZ2h0O1xyXG4gICAgICB9IGVsc2UgaWYgKGdldFJ0bFNjcm9sbEF4aXNUeXBlKCkgPT0gUnRsU2Nyb2xsQXhpc1R5cGUuTkVHQVRFRCkge1xyXG4gICAgICAgIG9wdGlvbnMubGVmdCA9IG9wdGlvbnMucmlnaHQgPyAtb3B0aW9ucy5yaWdodCA6IG9wdGlvbnMucmlnaHQ7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmIChvcHRpb25zLnJpZ2h0ICE9IG51bGwpIHtcclxuICAgICAgICAob3B0aW9ucyBhcyBfV2l0aG91dDxfUmlnaHQ+ICYgX0xlZnQpLmxlZnQgPVxyXG4gICAgICAgICAgICBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoIC0gb3B0aW9ucy5yaWdodDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2FwcGx5U2Nyb2xsVG9PcHRpb25zKG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfYXBwbHlTY3JvbGxUb09wdGlvbnMob3B0aW9uczogU2Nyb2xsVG9PcHRpb25zKTogdm9pZCB7XHJcbiAgICBjb25zdCBlbCA9IHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG5cclxuICAgIGlmIChzdXBwb3J0c1Njcm9sbEJlaGF2aW9yKCkpIHtcclxuICAgICAgZWwuc2Nyb2xsVG8ob3B0aW9ucyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAob3B0aW9ucy50b3AgIT0gbnVsbCkge1xyXG4gICAgICAgIGVsLnNjcm9sbFRvcCA9IG9wdGlvbnMudG9wO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvcHRpb25zLmxlZnQgIT0gbnVsbCkge1xyXG4gICAgICAgIGVsLnNjcm9sbExlZnQgPSBvcHRpb25zLmxlZnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1lYXN1cmVzIHRoZSBzY3JvbGwgb2Zmc2V0IHJlbGF0aXZlIHRvIHRoZSBzcGVjaWZpZWQgZWRnZSBvZiB0aGUgdmlld3BvcnQuIFRoaXMgbWV0aG9kIGNhbiBiZVxyXG4gICAqIHVzZWQgaW5zdGVhZCBvZiBkaXJlY3RseSBjaGVja2luZyBzY3JvbGxMZWZ0IG9yIHNjcm9sbFRvcCwgc2luY2UgYnJvd3NlcnMgYXJlIG5vdCBjb25zaXN0ZW50XHJcbiAgICogYWJvdXQgd2hhdCBzY3JvbGxMZWZ0IG1lYW5zIGluIFJUTC4gVGhlIHZhbHVlcyByZXR1cm5lZCBieSB0aGlzIG1ldGhvZCBhcmUgbm9ybWFsaXplZCBzdWNoIHRoYXRcclxuICAgKiBsZWZ0IGFuZCByaWdodCBhbHdheXMgcmVmZXIgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0IHNpZGUgb2YgdGhlIHNjcm9sbGluZyBjb250YWluZXIgaXJyZXNwZWN0aXZlXHJcbiAgICogb2YgdGhlIGxheW91dCBkaXJlY3Rpb24uIHN0YXJ0IGFuZCBlbmQgcmVmZXIgdG8gbGVmdCBhbmQgcmlnaHQgaW4gYW4gTFRSIGNvbnRleHQgYW5kIHZpY2UtdmVyc2FcclxuICAgKiBpbiBhbiBSVEwgY29udGV4dC5cclxuICAgKiBAcGFyYW0gZnJvbSBUaGUgZWRnZSB0byBtZWFzdXJlIGZyb20uXHJcbiAgICovXHJcbiAgbWVhc3VyZVNjcm9sbE9mZnNldChmcm9tOiAndG9wJyB8ICdsZWZ0JyB8ICdyaWdodCcgfCAnYm90dG9tJyB8ICdzdGFydCcgfCAnZW5kJyk6IG51bWJlciB7XHJcbiAgICBjb25zdCBMRUZUID0gJ2xlZnQnO1xyXG4gICAgY29uc3QgUklHSFQgPSAncmlnaHQnO1xyXG4gICAgY29uc3QgZWwgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICAgIGlmIChmcm9tID09ICd0b3AnKSB7XHJcbiAgICAgIHJldHVybiBlbC5zY3JvbGxUb3A7XHJcbiAgICB9XHJcbiAgICBpZiAoZnJvbSA9PSAnYm90dG9tJykge1xyXG4gICAgICByZXR1cm4gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0IC0gZWwuc2Nyb2xsVG9wO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJld3JpdGUgc3RhcnQgJiBlbmQgYXMgbGVmdCBvciByaWdodCBvZmZzZXRzLlxyXG4gICAgY29uc3QgaXNSdGwgPSB0aGlzLmRpciAmJiB0aGlzLmRpci52YWx1ZSA9PSAncnRsJztcclxuICAgIGlmIChmcm9tID09ICdzdGFydCcpIHtcclxuICAgICAgZnJvbSA9IGlzUnRsID8gUklHSFQgOiBMRUZUO1xyXG4gICAgfSBlbHNlIGlmIChmcm9tID09ICdlbmQnKSB7XHJcbiAgICAgIGZyb20gPSBpc1J0bCA/IExFRlQgOiBSSUdIVDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNSdGwgJiYgZ2V0UnRsU2Nyb2xsQXhpc1R5cGUoKSA9PSBSdGxTY3JvbGxBeGlzVHlwZS5JTlZFUlRFRCkge1xyXG4gICAgICAvLyBGb3IgSU5WRVJURUQsIHNjcm9sbExlZnQgaXMgKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgbGVmdCBhbmRcclxuICAgICAgLy8gMCB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IHJpZ2h0LlxyXG4gICAgICBpZiAoZnJvbSA9PSBMRUZUKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGggLSBlbC5zY3JvbGxMZWZ0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxMZWZ0O1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGlzUnRsICYmIGdldFJ0bFNjcm9sbEF4aXNUeXBlKCkgPT0gUnRsU2Nyb2xsQXhpc1R5cGUuTkVHQVRFRCkge1xyXG4gICAgICAvLyBGb3IgTkVHQVRFRCwgc2Nyb2xsTGVmdCBpcyAtKHNjcm9sbFdpZHRoIC0gY2xpZW50V2lkdGgpIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgbGVmdCBhbmRcclxuICAgICAgLy8gMCB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IHJpZ2h0LlxyXG4gICAgICBpZiAoZnJvbSA9PSBMRUZUKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsLnNjcm9sbExlZnQgKyBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAtZWwuc2Nyb2xsTGVmdDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gRm9yIE5PUk1BTCwgYXMgd2VsbCBhcyBub24tUlRMIGNvbnRleHRzLCBzY3JvbGxMZWZ0IGlzIDAgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSBsZWZ0IGFuZFxyXG4gICAgICAvLyAoc2Nyb2xsV2lkdGggLSBjbGllbnRXaWR0aCkgd2hlbiBzY3JvbGxlZCBhbGwgdGhlIHdheSByaWdodC5cclxuICAgICAgaWYgKGZyb20gPT0gTEVGVCkge1xyXG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxMZWZ0O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoIC0gZWwuc2Nyb2xsTGVmdDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=