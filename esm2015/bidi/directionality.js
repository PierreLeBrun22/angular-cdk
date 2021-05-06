/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Inject, Injectable, Optional } from '@angular/core';
import { DIR_DOCUMENT } from './dir-document-token';
import * as i0 from "@angular/core";
import * as i1 from "./dir-document-token";
/**
 * The directionality (LTR / RTL) context for the application (or a subtree of it).
 * Exposes the current direction and a stream of direction changes.
 */
export class Directionality {
    constructor(_document) {
        /** The current 'ltr' or 'rtl' value. */
        this.value = 'ltr';
        /** Stream that emits whenever the 'ltr' / 'rtl' state changes. */
        this.change = new EventEmitter();
        if (_document) {
            // TODO: handle 'auto' value -
            // We still need to account for dir="auto".
            // It looks like HTMLElemenet.dir is also "auto" when that's set to the attribute,
            // but getComputedStyle return either "ltr" or "rtl". avoiding getComputedStyle for now
            const bodyDir = _document.body ? _document.body.dir : null;
            const htmlDir = _document.documentElement ? _document.documentElement.dir : null;
            const value = bodyDir || htmlDir;
            this.value = (value === 'ltr' || value === 'rtl') ? value : 'ltr';
        }
    }
    ngOnDestroy() {
        this.change.complete();
    }
}
Directionality.ɵprov = i0.ɵɵdefineInjectable({ factory: function Directionality_Factory() { return new Directionality(i0.ɵɵinject(i1.DIR_DOCUMENT, 8)); }, token: Directionality, providedIn: "root" });
Directionality.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
Directionality.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [DIR_DOCUMENT,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aW9uYWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2JpZGkvZGlyZWN0aW9uYWxpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBWSxNQUFNLGVBQWUsQ0FBQztBQUNwRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7OztBQU1sRDs7O0dBR0c7QUFFSCxNQUFNLE9BQU8sY0FBYztJQU96QixZQUE4QyxTQUFlO1FBTjdELHdDQUF3QztRQUMvQixVQUFLLEdBQWMsS0FBSyxDQUFDO1FBRWxDLGtFQUFrRTtRQUN6RCxXQUFNLEdBQUcsSUFBSSxZQUFZLEVBQWEsQ0FBQztRQUc5QyxJQUFJLFNBQVMsRUFBRTtZQUNiLDhCQUE4QjtZQUM5QiwyQ0FBMkM7WUFDM0Msa0ZBQWtGO1lBQ2xGLHVGQUF1RjtZQUN2RixNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzNELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDakYsTUFBTSxLQUFLLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQztZQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQ25FO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7Ozs7WUF2QkYsVUFBVSxTQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7OzRDQVFqQixRQUFRLFlBQUksTUFBTSxTQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBJbmplY3QsIEluamVjdGFibGUsIE9wdGlvbmFsLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0RJUl9ET0NVTUVOVH0gZnJvbSAnLi9kaXItZG9jdW1lbnQtdG9rZW4nO1xyXG5cclxuXHJcbmV4cG9ydCB0eXBlIERpcmVjdGlvbiA9ICdsdHInIHwgJ3J0bCc7XHJcblxyXG5cclxuLyoqXHJcbiAqIFRoZSBkaXJlY3Rpb25hbGl0eSAoTFRSIC8gUlRMKSBjb250ZXh0IGZvciB0aGUgYXBwbGljYXRpb24gKG9yIGEgc3VidHJlZSBvZiBpdCkuXHJcbiAqIEV4cG9zZXMgdGhlIGN1cnJlbnQgZGlyZWN0aW9uIGFuZCBhIHN0cmVhbSBvZiBkaXJlY3Rpb24gY2hhbmdlcy5cclxuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgRGlyZWN0aW9uYWxpdHkgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBUaGUgY3VycmVudCAnbHRyJyBvciAncnRsJyB2YWx1ZS4gKi9cclxuICByZWFkb25seSB2YWx1ZTogRGlyZWN0aW9uID0gJ2x0cic7XHJcblxyXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgJ2x0cicgLyAncnRsJyBzdGF0ZSBjaGFuZ2VzLiAqL1xyXG4gIHJlYWRvbmx5IGNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8RGlyZWN0aW9uPigpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBASW5qZWN0KERJUl9ET0NVTUVOVCkgX2RvY3VtZW50PzogYW55KSB7XHJcbiAgICBpZiAoX2RvY3VtZW50KSB7XHJcbiAgICAgIC8vIFRPRE86IGhhbmRsZSAnYXV0bycgdmFsdWUgLVxyXG4gICAgICAvLyBXZSBzdGlsbCBuZWVkIHRvIGFjY291bnQgZm9yIGRpcj1cImF1dG9cIi5cclxuICAgICAgLy8gSXQgbG9va3MgbGlrZSBIVE1MRWxlbWVuZXQuZGlyIGlzIGFsc28gXCJhdXRvXCIgd2hlbiB0aGF0J3Mgc2V0IHRvIHRoZSBhdHRyaWJ1dGUsXHJcbiAgICAgIC8vIGJ1dCBnZXRDb21wdXRlZFN0eWxlIHJldHVybiBlaXRoZXIgXCJsdHJcIiBvciBcInJ0bFwiLiBhdm9pZGluZyBnZXRDb21wdXRlZFN0eWxlIGZvciBub3dcclxuICAgICAgY29uc3QgYm9keURpciA9IF9kb2N1bWVudC5ib2R5ID8gX2RvY3VtZW50LmJvZHkuZGlyIDogbnVsbDtcclxuICAgICAgY29uc3QgaHRtbERpciA9IF9kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgPyBfZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmRpciA6IG51bGw7XHJcbiAgICAgIGNvbnN0IHZhbHVlID0gYm9keURpciB8fCBodG1sRGlyO1xyXG4gICAgICB0aGlzLnZhbHVlID0gKHZhbHVlID09PSAnbHRyJyB8fCB2YWx1ZSA9PT0gJ3J0bCcpID8gdmFsdWUgOiAnbHRyJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgdGhpcy5jaGFuZ2UuY29tcGxldGUoKTtcclxuICB9XHJcbn1cclxuIl19