/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Output, Input, EventEmitter, } from '@angular/core';
import { Directionality } from './directionality';
/**
 * Directive to listen for changes of direction of part of the DOM.
 *
 * Provides itself as Directionality such that descendant directives only need to ever inject
 * Directionality to get the closest direction.
 */
export class Dir {
    constructor() {
        /** Normalized direction that accounts for invalid/unsupported values. */
        this._dir = 'ltr';
        /** Whether the `value` has been set to its initial value. */
        this._isInitialized = false;
        /** Event emitted when the direction changes. */
        this.change = new EventEmitter();
    }
    /** @docs-private */
    get dir() { return this._dir; }
    set dir(value) {
        const old = this._dir;
        const normalizedValue = value ? value.toLowerCase() : value;
        this._rawDir = value;
        this._dir = (normalizedValue === 'ltr' || normalizedValue === 'rtl') ? normalizedValue : 'ltr';
        if (old !== this._dir && this._isInitialized) {
            this.change.emit(this._dir);
        }
    }
    /** Current layout direction of the element. */
    get value() { return this.dir; }
    /** Initialize once default value has been set. */
    ngAfterContentInit() {
        this._isInitialized = true;
    }
    ngOnDestroy() {
        this.change.complete();
    }
}
Dir.decorators = [
    { type: Directive, args: [{
                selector: '[dir]',
                providers: [{ provide: Directionality, useExisting: Dir }],
                host: { '[attr.dir]': '_rawDir' },
                exportAs: 'dir',
            },] }
];
Dir.propDecorators = {
    change: [{ type: Output, args: ['dirChange',] }],
    dir: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9iaWRpL2Rpci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQ0wsU0FBUyxFQUNULE1BQU0sRUFDTixLQUFLLEVBQ0wsWUFBWSxHQUdiLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFBWSxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUUzRDs7Ozs7R0FLRztBQU9ILE1BQU0sT0FBTyxHQUFHO0lBTmhCO1FBT0UseUVBQXlFO1FBQ2pFLFNBQUksR0FBYyxLQUFLLENBQUM7UUFFaEMsNkRBQTZEO1FBQ3JELG1CQUFjLEdBQVksS0FBSyxDQUFDO1FBS3hDLGdEQUFnRDtRQUMzQixXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztJQTRCOUQsQ0FBQztJQTFCQyxvQkFBb0I7SUFDcEIsSUFDSSxHQUFHLEtBQWdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUMsSUFBSSxHQUFHLENBQUMsS0FBZ0I7UUFDdEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixNQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTVELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLEtBQUssS0FBSyxJQUFJLGVBQWUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFL0YsSUFBSSxHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtJQUNILENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MsSUFBSSxLQUFLLEtBQWdCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFM0Msa0RBQWtEO0lBQ2xELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekIsQ0FBQzs7O1lBNUNGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsT0FBTztnQkFDakIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUMsQ0FBQztnQkFDeEQsSUFBSSxFQUFFLEVBQUMsWUFBWSxFQUFFLFNBQVMsRUFBQztnQkFDL0IsUUFBUSxFQUFFLEtBQUs7YUFDaEI7OztxQkFZRSxNQUFNLFNBQUMsV0FBVztrQkFHbEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtcclxuICBEaXJlY3RpdmUsXHJcbiAgT3V0cHV0LFxyXG4gIElucHV0LFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBBZnRlckNvbnRlbnRJbml0LFxyXG4gIE9uRGVzdHJveSxcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnLi9kaXJlY3Rpb25hbGl0eSc7XHJcblxyXG4vKipcclxuICogRGlyZWN0aXZlIHRvIGxpc3RlbiBmb3IgY2hhbmdlcyBvZiBkaXJlY3Rpb24gb2YgcGFydCBvZiB0aGUgRE9NLlxyXG4gKlxyXG4gKiBQcm92aWRlcyBpdHNlbGYgYXMgRGlyZWN0aW9uYWxpdHkgc3VjaCB0aGF0IGRlc2NlbmRhbnQgZGlyZWN0aXZlcyBvbmx5IG5lZWQgdG8gZXZlciBpbmplY3RcclxuICogRGlyZWN0aW9uYWxpdHkgdG8gZ2V0IHRoZSBjbG9zZXN0IGRpcmVjdGlvbi5cclxuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Rpcl0nLFxyXG4gIHByb3ZpZGVyczogW3twcm92aWRlOiBEaXJlY3Rpb25hbGl0eSwgdXNlRXhpc3Rpbmc6IERpcn1dLFxyXG4gIGhvc3Q6IHsnW2F0dHIuZGlyXSc6ICdfcmF3RGlyJ30sXHJcbiAgZXhwb3J0QXM6ICdkaXInLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgRGlyIGltcGxlbWVudHMgRGlyZWN0aW9uYWxpdHksIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XHJcbiAgLyoqIE5vcm1hbGl6ZWQgZGlyZWN0aW9uIHRoYXQgYWNjb3VudHMgZm9yIGludmFsaWQvdW5zdXBwb3J0ZWQgdmFsdWVzLiAqL1xyXG4gIHByaXZhdGUgX2RpcjogRGlyZWN0aW9uID0gJ2x0cic7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBgdmFsdWVgIGhhcyBiZWVuIHNldCB0byBpdHMgaW5pdGlhbCB2YWx1ZS4gKi9cclxuICBwcml2YXRlIF9pc0luaXRpYWxpemVkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gIC8qKiBEaXJlY3Rpb24gYXMgcGFzc2VkIGluIGJ5IHRoZSBjb25zdW1lci4gKi9cclxuICBfcmF3RGlyOiBzdHJpbmc7XHJcblxyXG4gIC8qKiBFdmVudCBlbWl0dGVkIHdoZW4gdGhlIGRpcmVjdGlvbiBjaGFuZ2VzLiAqL1xyXG4gIEBPdXRwdXQoJ2RpckNoYW5nZScpIGNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8RGlyZWN0aW9uPigpO1xyXG5cclxuICAvKiogQGRvY3MtcHJpdmF0ZSAqL1xyXG4gIEBJbnB1dCgpXHJcbiAgZ2V0IGRpcigpOiBEaXJlY3Rpb24geyByZXR1cm4gdGhpcy5fZGlyOyB9XHJcbiAgc2V0IGRpcih2YWx1ZTogRGlyZWN0aW9uKSB7XHJcbiAgICBjb25zdCBvbGQgPSB0aGlzLl9kaXI7XHJcbiAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSB2YWx1ZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcclxuXHJcbiAgICB0aGlzLl9yYXdEaXIgPSB2YWx1ZTtcclxuICAgIHRoaXMuX2RpciA9IChub3JtYWxpemVkVmFsdWUgPT09ICdsdHInIHx8IG5vcm1hbGl6ZWRWYWx1ZSA9PT0gJ3J0bCcpID8gbm9ybWFsaXplZFZhbHVlIDogJ2x0cic7XHJcblxyXG4gICAgaWYgKG9sZCAhPT0gdGhpcy5fZGlyICYmIHRoaXMuX2lzSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgdGhpcy5jaGFuZ2UuZW1pdCh0aGlzLl9kaXIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEN1cnJlbnQgbGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgZWxlbWVudC4gKi9cclxuICBnZXQgdmFsdWUoKTogRGlyZWN0aW9uIHsgcmV0dXJuIHRoaXMuZGlyOyB9XHJcblxyXG4gIC8qKiBJbml0aWFsaXplIG9uY2UgZGVmYXVsdCB2YWx1ZSBoYXMgYmVlbiBzZXQuICovXHJcbiAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xyXG4gICAgdGhpcy5faXNJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuY2hhbmdlLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4iXX0=