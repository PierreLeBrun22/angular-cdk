/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, NgZone, InjectionToken } from '@angular/core';
import { from, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
/**
 * @docs-private
 */
export class _Schedule {
    constructor() {
        this.tasks = [];
        this.endTasks = [];
    }
}
/** Injection token used to provide a coalesced style scheduler. */
export const _COALESCED_STYLE_SCHEDULER = new InjectionToken('_COALESCED_STYLE_SCHEDULER');
/**
 * Allows grouping up CSSDom mutations after the current execution context.
 * This can significantly improve performance when separate consecutive functions are
 * reading from the CSSDom and then mutating it.
 *
 * @docs-private
 */
export class _CoalescedStyleScheduler {
    constructor(_ngZone) {
        this._ngZone = _ngZone;
        this._currentSchedule = null;
        this._destroyed = new Subject();
    }
    /**
     * Schedules the specified task to run at the end of the current VM turn.
     */
    schedule(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.tasks.push(task);
    }
    /**
     * Schedules the specified task to run after other scheduled tasks at the end of the current
     * VM turn.
     */
    scheduleEnd(task) {
        this._createScheduleIfNeeded();
        this._currentSchedule.endTasks.push(task);
    }
    /** Prevent any further tasks from running. */
    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }
    _createScheduleIfNeeded() {
        if (this._currentSchedule) {
            return;
        }
        this._currentSchedule = new _Schedule();
        this._getScheduleObservable().pipe(takeUntil(this._destroyed)).subscribe(() => {
            while (this._currentSchedule.tasks.length || this._currentSchedule.endTasks.length) {
                const schedule = this._currentSchedule;
                // Capture new tasks scheduled by the current set of tasks.
                this._currentSchedule = new _Schedule();
                for (const task of schedule.tasks) {
                    task();
                }
                for (const task of schedule.endTasks) {
                    task();
                }
            }
            this._currentSchedule = null;
        });
    }
    _getScheduleObservable() {
        // Use onStable when in the context of an ongoing change detection cycle so that we
        // do not accidentally trigger additional cycles.
        return this._ngZone.isStable ?
            from(Promise.resolve(undefined)) :
            this._ngZone.onStable.pipe(take(1));
    }
}
_CoalescedStyleScheduler.decorators = [
    { type: Injectable }
];
_CoalescedStyleScheduler.ctorParameters = () => [
    { type: NgZone }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvdGFibGUvY29hbGVzY2VkLXN0eWxlLXNjaGVkdWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBYSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUUsT0FBTyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDbkMsT0FBTyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvQzs7R0FFRztBQUNILE1BQU0sT0FBTyxTQUFTO0lBQXRCO1FBQ0UsVUFBSyxHQUFzQixFQUFFLENBQUM7UUFDOUIsYUFBUSxHQUFzQixFQUFFLENBQUM7SUFDbkMsQ0FBQztDQUFBO0FBRUQsbUVBQW1FO0FBQ25FLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUNuQyxJQUFJLGNBQWMsQ0FBMkIsNEJBQTRCLENBQUMsQ0FBQztBQUUvRTs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sd0JBQXdCO0lBSW5DLFlBQTZCLE9BQWU7UUFBZixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBSHBDLHFCQUFnQixHQUFtQixJQUFJLENBQUM7UUFDL0IsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7SUFFSCxDQUFDO0lBRWhEOztPQUVHO0lBQ0gsUUFBUSxDQUFDLElBQW1CO1FBQzFCLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxXQUFXLENBQUMsSUFBbUI7UUFDN0IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFFL0IsSUFBSSxDQUFDLGdCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxXQUFXO1FBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFdEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7UUFFeEMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsSUFBSSxDQUM5QixTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUM3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZixPQUFPLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxnQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUNwRixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWlCLENBQUM7Z0JBRXhDLDJEQUEyRDtnQkFDM0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7Z0JBRXhDLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRTtvQkFDakMsSUFBSSxFQUFFLENBQUM7aUJBQ1I7Z0JBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFO29CQUNwQyxJQUFJLEVBQUUsQ0FBQztpQkFDUjthQUNGO1lBRUQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxzQkFBc0I7UUFDNUIsbUZBQW1GO1FBQ25GLGlEQUFpRDtRQUNqRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQyxDQUFDOzs7WUFqRUYsVUFBVTs7O1lBdkJTLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7SW5qZWN0YWJsZSwgTmdab25lLCBPbkRlc3Ryb3ksIEluamVjdGlvblRva2VufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtmcm9tLCBTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHt0YWtlLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbi8qKlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgX1NjaGVkdWxlIHtcclxuICB0YXNrczogKCgpID0+IHVua25vd24pW10gPSBbXTtcclxuICBlbmRUYXNrczogKCgpID0+IHVua25vd24pW10gPSBbXTtcclxufVxyXG5cclxuLyoqIEluamVjdGlvbiB0b2tlbiB1c2VkIHRvIHByb3ZpZGUgYSBjb2FsZXNjZWQgc3R5bGUgc2NoZWR1bGVyLiAqL1xyXG5leHBvcnQgY29uc3QgX0NPQUxFU0NFRF9TVFlMRV9TQ0hFRFVMRVIgPVxyXG4gICAgbmV3IEluamVjdGlvblRva2VuPF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlcj4oJ19DT0FMRVNDRURfU1RZTEVfU0NIRURVTEVSJyk7XHJcblxyXG4vKipcclxuICogQWxsb3dzIGdyb3VwaW5nIHVwIENTU0RvbSBtdXRhdGlvbnMgYWZ0ZXIgdGhlIGN1cnJlbnQgZXhlY3V0aW9uIGNvbnRleHQuXHJcbiAqIFRoaXMgY2FuIHNpZ25pZmljYW50bHkgaW1wcm92ZSBwZXJmb3JtYW5jZSB3aGVuIHNlcGFyYXRlIGNvbnNlY3V0aXZlIGZ1bmN0aW9ucyBhcmVcclxuICogcmVhZGluZyBmcm9tIHRoZSBDU1NEb20gYW5kIHRoZW4gbXV0YXRpbmcgaXQuXHJcbiAqXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIF9Db2FsZXNjZWRTdHlsZVNjaGVkdWxlciBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XHJcbiAgcHJpdmF0ZSBfY3VycmVudFNjaGVkdWxlOiBfU2NoZWR1bGV8bnVsbCA9IG51bGw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBfZGVzdHJveWVkID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbmdab25lOiBOZ1pvbmUpIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNjaGVkdWxlcyB0aGUgc3BlY2lmaWVkIHRhc2sgdG8gcnVuIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgVk0gdHVybi5cclxuICAgKi9cclxuICBzY2hlZHVsZSh0YXNrOiAoKSA9PiB1bmtub3duKTogdm9pZCB7XHJcbiAgICB0aGlzLl9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCk7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudFNjaGVkdWxlIS50YXNrcy5wdXNoKHRhc2spO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2NoZWR1bGVzIHRoZSBzcGVjaWZpZWQgdGFzayB0byBydW4gYWZ0ZXIgb3RoZXIgc2NoZWR1bGVkIHRhc2tzIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnRcclxuICAgKiBWTSB0dXJuLlxyXG4gICAqL1xyXG4gIHNjaGVkdWxlRW5kKHRhc2s6ICgpID0+IHVua25vd24pOiB2b2lkIHtcclxuICAgIHRoaXMuX2NyZWF0ZVNjaGVkdWxlSWZOZWVkZWQoKTtcclxuXHJcbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUhLmVuZFRhc2tzLnB1c2godGFzayk7XHJcbiAgfVxyXG5cclxuICAvKiogUHJldmVudCBhbnkgZnVydGhlciB0YXNrcyBmcm9tIHJ1bm5pbmcuICovXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICB0aGlzLl9kZXN0cm95ZWQubmV4dCgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLmNvbXBsZXRlKCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9jcmVhdGVTY2hlZHVsZUlmTmVlZGVkKCkge1xyXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRTY2hlZHVsZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICB0aGlzLl9jdXJyZW50U2NoZWR1bGUgPSBuZXcgX1NjaGVkdWxlKCk7XHJcblxyXG4gICAgdGhpcy5fZ2V0U2NoZWR1bGVPYnNlcnZhYmxlKCkucGlwZShcclxuICAgICAgICB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSxcclxuICAgICkuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgd2hpbGUgKHRoaXMuX2N1cnJlbnRTY2hlZHVsZSEudGFza3MubGVuZ3RoIHx8IHRoaXMuX2N1cnJlbnRTY2hlZHVsZSEuZW5kVGFza3MubGVuZ3RoKSB7XHJcbiAgICAgICAgY29uc3Qgc2NoZWR1bGUgPSB0aGlzLl9jdXJyZW50U2NoZWR1bGUhO1xyXG5cclxuICAgICAgICAvLyBDYXB0dXJlIG5ldyB0YXNrcyBzY2hlZHVsZWQgYnkgdGhlIGN1cnJlbnQgc2V0IG9mIHRhc2tzLlxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnRTY2hlZHVsZSA9IG5ldyBfU2NoZWR1bGUoKTtcclxuXHJcbiAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIHNjaGVkdWxlLnRhc2tzKSB7XHJcbiAgICAgICAgICB0YXNrKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2Ygc2NoZWR1bGUuZW5kVGFza3MpIHtcclxuICAgICAgICAgIHRhc2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2N1cnJlbnRTY2hlZHVsZSA9IG51bGw7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2dldFNjaGVkdWxlT2JzZXJ2YWJsZSgpIHtcclxuICAgIC8vIFVzZSBvblN0YWJsZSB3aGVuIGluIHRoZSBjb250ZXh0IG9mIGFuIG9uZ29pbmcgY2hhbmdlIGRldGVjdGlvbiBjeWNsZSBzbyB0aGF0IHdlXHJcbiAgICAvLyBkbyBub3QgYWNjaWRlbnRhbGx5IHRyaWdnZXIgYWRkaXRpb25hbCBjeWNsZXMuXHJcbiAgICByZXR1cm4gdGhpcy5fbmdab25lLmlzU3RhYmxlID9cclxuICAgICAgICBmcm9tKFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpKSA6XHJcbiAgICAgICAgdGhpcy5fbmdab25lLm9uU3RhYmxlLnBpcGUodGFrZSgxKSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==