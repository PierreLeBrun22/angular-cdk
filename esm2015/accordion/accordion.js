/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, InjectionToken, Input } from '@angular/core';
import { Subject } from 'rxjs';
/** Used to generate unique ID for each accordion. */
let nextId = 0;
/**
 * Injection token that can be used to reference instances of `CdkAccordion`. It serves
 * as alternative token to the actual `CdkAccordion` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_ACCORDION = new InjectionToken('CdkAccordion');
/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
export class CdkAccordion {
    constructor() {
        /** Emits when the state of the accordion changes */
        this._stateChanges = new Subject();
        /** Stream that emits true/false when openAll/closeAll is triggered. */
        this._openCloseAllActions = new Subject();
        /** A readonly id value to use for unique selection coordination. */
        this.id = `cdk-accordion-${nextId++}`;
        this._multi = false;
    }
    /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
    get multi() { return this._multi; }
    set multi(multi) { this._multi = coerceBooleanProperty(multi); }
    /** Opens all enabled accordion items in an accordion where multi is enabled. */
    openAll() {
        if (this._multi) {
            this._openCloseAllActions.next(true);
        }
    }
    /** Closes all enabled accordion items in an accordion where multi is enabled. */
    closeAll() {
        this._openCloseAllActions.next(false);
    }
    ngOnChanges(changes) {
        this._stateChanges.next(changes);
    }
    ngOnDestroy() {
        this._stateChanges.complete();
        this._openCloseAllActions.complete();
    }
}
CdkAccordion.decorators = [
    { type: Directive, args: [{
                selector: 'cdk-accordion, [cdkAccordion]',
                exportAs: 'cdkAccordion',
                providers: [{ provide: CDK_ACCORDION, useExisting: CdkAccordion }],
            },] }
];
CdkAccordion.propDecorators = {
    multi: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3JkaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9hY2NvcmRpb24vYWNjb3JkaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFBQyxTQUFTLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBc0MsTUFBTSxlQUFlLENBQUM7QUFDcEcsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3QixxREFBcUQ7QUFDckQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBRWY7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLGNBQWMsQ0FBZSxjQUFjLENBQUMsQ0FBQztBQUU5RTs7R0FFRztBQU1ILE1BQU0sT0FBTyxZQUFZO0lBTHpCO1FBTUUsb0RBQW9EO1FBQzNDLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQWlCLENBQUM7UUFFdEQsdUVBQXVFO1FBQzlELHlCQUFvQixHQUFxQixJQUFJLE9BQU8sRUFBVyxDQUFDO1FBRXpFLG9FQUFvRTtRQUMzRCxPQUFFLEdBQUcsaUJBQWlCLE1BQU0sRUFBRSxFQUFFLENBQUM7UUFNbEMsV0FBTSxHQUFZLEtBQUssQ0FBQztJQXdCbEMsQ0FBQztJQTVCQywyRkFBMkY7SUFDM0YsSUFDSSxLQUFLLEtBQWMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM1QyxJQUFJLEtBQUssQ0FBQyxLQUFjLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFHekUsZ0ZBQWdGO0lBQ2hGLE9BQU87UUFDTCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUVELGlGQUFpRjtJQUNqRixRQUFRO1FBQ04sSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdkMsQ0FBQzs7O1lBeENGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsK0JBQStCO2dCQUN6QyxRQUFRLEVBQUUsY0FBYztnQkFDeEIsU0FBUyxFQUFFLENBQUMsRUFBQyxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUMsQ0FBQzthQUNqRTs7O29CQVlFLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XHJcbmltcG9ydCB7RGlyZWN0aXZlLCBJbmplY3Rpb25Ub2tlbiwgSW5wdXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuXHJcbi8qKiBVc2VkIHRvIGdlbmVyYXRlIHVuaXF1ZSBJRCBmb3IgZWFjaCBhY2NvcmRpb24uICovXHJcbmxldCBuZXh0SWQgPSAwO1xyXG5cclxuLyoqXHJcbiAqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZmVyZW5jZSBpbnN0YW5jZXMgb2YgYENka0FjY29yZGlvbmAuIEl0IHNlcnZlc1xyXG4gKiBhcyBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBDZGtBY2NvcmRpb25gIGNsYXNzIHdoaWNoIGNvdWxkIGNhdXNlIHVubmVjZXNzYXJ5XHJcbiAqIHJldGVudGlvbiBvZiB0aGUgY2xhc3MgYW5kIGl0cyBkaXJlY3RpdmUgbWV0YWRhdGEuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgQ0RLX0FDQ09SRElPTiA9IG5ldyBJbmplY3Rpb25Ub2tlbjxDZGtBY2NvcmRpb24+KCdDZGtBY2NvcmRpb24nKTtcclxuXHJcbi8qKlxyXG4gKiBEaXJlY3RpdmUgd2hvc2UgcHVycG9zZSBpcyB0byBtYW5hZ2UgdGhlIGV4cGFuZGVkIHN0YXRlIG9mIENka0FjY29yZGlvbkl0ZW0gY2hpbGRyZW4uXHJcbiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ2Nkay1hY2NvcmRpb24sIFtjZGtBY2NvcmRpb25dJyxcclxuICBleHBvcnRBczogJ2Nka0FjY29yZGlvbicsXHJcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IENES19BQ0NPUkRJT04sIHVzZUV4aXN0aW5nOiBDZGtBY2NvcmRpb259XSxcclxufSlcclxuZXhwb3J0IGNsYXNzIENka0FjY29yZGlvbiBpbXBsZW1lbnRzIE9uRGVzdHJveSwgT25DaGFuZ2VzIHtcclxuICAvKiogRW1pdHMgd2hlbiB0aGUgc3RhdGUgb2YgdGhlIGFjY29yZGlvbiBjaGFuZ2VzICovXHJcbiAgcmVhZG9ubHkgX3N0YXRlQ2hhbmdlcyA9IG5ldyBTdWJqZWN0PFNpbXBsZUNoYW5nZXM+KCk7XHJcblxyXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB0cnVlL2ZhbHNlIHdoZW4gb3BlbkFsbC9jbG9zZUFsbCBpcyB0cmlnZ2VyZWQuICovXHJcbiAgcmVhZG9ubHkgX29wZW5DbG9zZUFsbEFjdGlvbnM6IFN1YmplY3Q8Ym9vbGVhbj4gPSBuZXcgU3ViamVjdDxib29sZWFuPigpO1xyXG5cclxuICAvKiogQSByZWFkb25seSBpZCB2YWx1ZSB0byB1c2UgZm9yIHVuaXF1ZSBzZWxlY3Rpb24gY29vcmRpbmF0aW9uLiAqL1xyXG4gIHJlYWRvbmx5IGlkID0gYGNkay1hY2NvcmRpb24tJHtuZXh0SWQrK31gO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgYWNjb3JkaW9uIHNob3VsZCBhbGxvdyBtdWx0aXBsZSBleHBhbmRlZCBhY2NvcmRpb24gaXRlbXMgc2ltdWx0YW5lb3VzbHkuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgbXVsdGkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9tdWx0aTsgfVxyXG4gIHNldCBtdWx0aShtdWx0aTogYm9vbGVhbikgeyB0aGlzLl9tdWx0aSA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eShtdWx0aSk7IH1cclxuICBwcml2YXRlIF9tdWx0aTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAvKiogT3BlbnMgYWxsIGVuYWJsZWQgYWNjb3JkaW9uIGl0ZW1zIGluIGFuIGFjY29yZGlvbiB3aGVyZSBtdWx0aSBpcyBlbmFibGVkLiAqL1xyXG4gIG9wZW5BbGwoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fbXVsdGkpIHtcclxuICAgICAgdGhpcy5fb3BlbkNsb3NlQWxsQWN0aW9ucy5uZXh0KHRydWUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIENsb3NlcyBhbGwgZW5hYmxlZCBhY2NvcmRpb24gaXRlbXMgaW4gYW4gYWNjb3JkaW9uIHdoZXJlIG11bHRpIGlzIGVuYWJsZWQuICovXHJcbiAgY2xvc2VBbGwoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9vcGVuQ2xvc2VBbGxBY3Rpb25zLm5leHQoZmFsc2UpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VzLm5leHQoY2hhbmdlcyk7XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuX3N0YXRlQ2hhbmdlcy5jb21wbGV0ZSgpO1xyXG4gICAgdGhpcy5fb3BlbkNsb3NlQWxsQWN0aW9ucy5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX211bHRpOiBCb29sZWFuSW5wdXQ7XHJcbn1cclxuIl19