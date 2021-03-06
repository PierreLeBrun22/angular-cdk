/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional, NgZone, } from '@angular/core';
import { InteractivityChecker } from '../interactivity-checker/interactivity-checker';
import { ConfigurableFocusTrap } from './configurable-focus-trap';
import { ConfigurableFocusTrapConfig } from './configurable-focus-trap-config';
import { FOCUS_TRAP_INERT_STRATEGY } from './focus-trap-inert-strategy';
import { EventListenerFocusTrapInertStrategy } from './event-listener-inert-strategy';
import { FocusTrapManager } from './focus-trap-manager';
import * as i0 from "@angular/core";
import * as i1 from "../interactivity-checker/interactivity-checker";
import * as i2 from "./focus-trap-manager";
import * as i3 from "@angular/common";
import * as i4 from "./focus-trap-inert-strategy";
/** Factory that allows easy instantiation of configurable focus traps. */
export class ConfigurableFocusTrapFactory {
    constructor(_checker, _ngZone, _focusTrapManager, _document, _inertStrategy) {
        this._checker = _checker;
        this._ngZone = _ngZone;
        this._focusTrapManager = _focusTrapManager;
        this._document = _document;
        // TODO split up the strategies into different modules, similar to DateAdapter.
        this._inertStrategy = _inertStrategy || new EventListenerFocusTrapInertStrategy();
    }
    create(element, config = new ConfigurableFocusTrapConfig()) {
        let configObject;
        if (typeof config === 'boolean') {
            configObject = new ConfigurableFocusTrapConfig();
            configObject.defer = config;
        }
        else {
            configObject = config;
        }
        return new ConfigurableFocusTrap(element, this._checker, this._ngZone, this._document, this._focusTrapManager, this._inertStrategy, configObject);
    }
}
ConfigurableFocusTrapFactory.??prov = i0.????defineInjectable({ factory: function ConfigurableFocusTrapFactory_Factory() { return new ConfigurableFocusTrapFactory(i0.????inject(i1.InteractivityChecker), i0.????inject(i0.NgZone), i0.????inject(i2.FocusTrapManager), i0.????inject(i3.DOCUMENT), i0.????inject(i4.FOCUS_TRAP_INERT_STRATEGY, 8)); }, token: ConfigurableFocusTrapFactory, providedIn: "root" });
ConfigurableFocusTrapFactory.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ConfigurableFocusTrapFactory.ctorParameters = () => [
    { type: InteractivityChecker },
    { type: NgZone },
    { type: FocusTrapManager },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [FOCUS_TRAP_INERT_STRATEGY,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhYmxlLWZvY3VzLXRyYXAtZmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9mb2N1cy10cmFwL2NvbmZpZ3VyYWJsZS1mb2N1cy10cmFwLWZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFFBQVEsRUFDUixNQUFNLEdBQ1AsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sZ0RBQWdELENBQUM7QUFDcEYsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDaEUsT0FBTyxFQUFDLDJCQUEyQixFQUFDLE1BQU0sa0NBQWtDLENBQUM7QUFDN0UsT0FBTyxFQUFDLHlCQUF5QixFQUF5QixNQUFNLDZCQUE2QixDQUFDO0FBQzlGLE9BQU8sRUFBQyxtQ0FBbUMsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDOzs7Ozs7QUFFdEQsMEVBQTBFO0FBRTFFLE1BQU0sT0FBTyw0QkFBNEI7SUFJdkMsWUFDWSxRQUE4QixFQUM5QixPQUFlLEVBQ2YsaUJBQW1DLEVBQ3pCLFNBQWMsRUFDZSxjQUF1QztRQUo5RSxhQUFRLEdBQVIsUUFBUSxDQUFzQjtRQUM5QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQ2Ysc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUk3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQiwrRUFBK0U7UUFDL0UsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLElBQUksSUFBSSxtQ0FBbUMsRUFBRSxDQUFDO0lBQ3BGLENBQUM7SUFnQkQsTUFBTSxDQUFDLE9BQW9CLEVBQUUsU0FDM0IsSUFBSSwyQkFBMkIsRUFBRTtRQUNqQyxJQUFJLFlBQXlDLENBQUM7UUFDOUMsSUFBSSxPQUFPLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDL0IsWUFBWSxHQUFHLElBQUksMkJBQTJCLEVBQUUsQ0FBQztZQUNqRCxZQUFZLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztTQUM3QjthQUFNO1lBQ0wsWUFBWSxHQUFHLE1BQU0sQ0FBQztTQUN2QjtRQUNELE9BQU8sSUFBSSxxQkFBcUIsQ0FDNUIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFDNUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN6QyxDQUFDOzs7O1lBM0NGLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7OztZQVJ4QixvQkFBb0I7WUFGMUIsTUFBTTtZQU9BLGdCQUFnQjs0Q0FZakIsTUFBTSxTQUFDLFFBQVE7NENBQ2YsUUFBUSxZQUFJLE1BQU0sU0FBQyx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7XHJcbiAgSW5qZWN0LFxyXG4gIEluamVjdGFibGUsXHJcbiAgT3B0aW9uYWwsXHJcbiAgTmdab25lLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0ludGVyYWN0aXZpdHlDaGVja2VyfSBmcm9tICcuLi9pbnRlcmFjdGl2aXR5LWNoZWNrZXIvaW50ZXJhY3Rpdml0eS1jaGVja2VyJztcclxuaW1wb3J0IHtDb25maWd1cmFibGVGb2N1c1RyYXB9IGZyb20gJy4vY29uZmlndXJhYmxlLWZvY3VzLXRyYXAnO1xyXG5pbXBvcnQge0NvbmZpZ3VyYWJsZUZvY3VzVHJhcENvbmZpZ30gZnJvbSAnLi9jb25maWd1cmFibGUtZm9jdXMtdHJhcC1jb25maWcnO1xyXG5pbXBvcnQge0ZPQ1VTX1RSQVBfSU5FUlRfU1RSQVRFR1ksIEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3l9IGZyb20gJy4vZm9jdXMtdHJhcC1pbmVydC1zdHJhdGVneSc7XHJcbmltcG9ydCB7RXZlbnRMaXN0ZW5lckZvY3VzVHJhcEluZXJ0U3RyYXRlZ3l9IGZyb20gJy4vZXZlbnQtbGlzdGVuZXItaW5lcnQtc3RyYXRlZ3knO1xyXG5pbXBvcnQge0ZvY3VzVHJhcE1hbmFnZXJ9IGZyb20gJy4vZm9jdXMtdHJhcC1tYW5hZ2VyJztcclxuXHJcbi8qKiBGYWN0b3J5IHRoYXQgYWxsb3dzIGVhc3kgaW5zdGFudGlhdGlvbiBvZiBjb25maWd1cmFibGUgZm9jdXMgdHJhcHMuICovXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgQ29uZmlndXJhYmxlRm9jdXNUcmFwRmFjdG9yeSB7XHJcbiAgcHJpdmF0ZSBfZG9jdW1lbnQ6IERvY3VtZW50O1xyXG4gIHByaXZhdGUgX2luZXJ0U3RyYXRlZ3k6IEZvY3VzVHJhcEluZXJ0U3RyYXRlZ3k7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBwcml2YXRlIF9jaGVja2VyOiBJbnRlcmFjdGl2aXR5Q2hlY2tlcixcclxuICAgICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXHJcbiAgICAgIHByaXZhdGUgX2ZvY3VzVHJhcE1hbmFnZXI6IEZvY3VzVHJhcE1hbmFnZXIsXHJcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIF9kb2N1bWVudDogYW55LFxyXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEZPQ1VTX1RSQVBfSU5FUlRfU1RSQVRFR1kpIF9pbmVydFN0cmF0ZWd5PzogRm9jdXNUcmFwSW5lcnRTdHJhdGVneSkge1xyXG5cclxuICAgIHRoaXMuX2RvY3VtZW50ID0gX2RvY3VtZW50O1xyXG4gICAgLy8gVE9ETyBzcGxpdCB1cCB0aGUgc3RyYXRlZ2llcyBpbnRvIGRpZmZlcmVudCBtb2R1bGVzLCBzaW1pbGFyIHRvIERhdGVBZGFwdGVyLlxyXG4gICAgdGhpcy5faW5lcnRTdHJhdGVneSA9IF9pbmVydFN0cmF0ZWd5IHx8IG5ldyBFdmVudExpc3RlbmVyRm9jdXNUcmFwSW5lcnRTdHJhdGVneSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGZvY3VzLXRyYXBwZWQgcmVnaW9uIGFyb3VuZCB0aGUgZ2l2ZW4gZWxlbWVudC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCBhcm91bmQgd2hpY2ggZm9jdXMgd2lsbCBiZSB0cmFwcGVkLlxyXG4gICAqIEBwYXJhbSBjb25maWcgVGhlIGZvY3VzIHRyYXAgY29uZmlndXJhdGlvbi5cclxuICAgKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBmb2N1cyB0cmFwIGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIGNyZWF0ZShlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnKTogQ29uZmlndXJhYmxlRm9jdXNUcmFwO1xyXG5cclxuICAvKipcclxuICAgKiBAZGVwcmVjYXRlZCBQYXNzIGEgY29uZmlnIG9iamVjdCBpbnN0ZWFkIG9mIHRoZSBgZGVmZXJDYXB0dXJlRWxlbWVudHNgIGZsYWcuXHJcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxMS4wLjBcclxuICAgKi9cclxuICBjcmVhdGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGRlZmVyQ2FwdHVyZUVsZW1lbnRzOiBib29sZWFuKTogQ29uZmlndXJhYmxlRm9jdXNUcmFwO1xyXG5cclxuICBjcmVhdGUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNvbmZpZzogQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnIHwgYm9vbGVhbiA9XHJcbiAgICBuZXcgQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnKCkpOiBDb25maWd1cmFibGVGb2N1c1RyYXAge1xyXG4gICAgbGV0IGNvbmZpZ09iamVjdDogQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnO1xyXG4gICAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdib29sZWFuJykge1xyXG4gICAgICBjb25maWdPYmplY3QgPSBuZXcgQ29uZmlndXJhYmxlRm9jdXNUcmFwQ29uZmlnKCk7XHJcbiAgICAgIGNvbmZpZ09iamVjdC5kZWZlciA9IGNvbmZpZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbmZpZ09iamVjdCA9IGNvbmZpZztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgQ29uZmlndXJhYmxlRm9jdXNUcmFwKFxyXG4gICAgICAgIGVsZW1lbnQsIHRoaXMuX2NoZWNrZXIsIHRoaXMuX25nWm9uZSwgdGhpcy5fZG9jdW1lbnQsIHRoaXMuX2ZvY3VzVHJhcE1hbmFnZXIsXHJcbiAgICAgICAgdGhpcy5faW5lcnRTdHJhdGVneSwgY29uZmlnT2JqZWN0KTtcclxuICB9XHJcbn1cclxuIl19