/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, HostListener, Input } from '@angular/core';
import { CdkStepper } from './stepper';
/** Button that moves to the next step in a stepper workflow. */
export class CdkStepperNext {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the next button. Defaults to "submit" if not specified. */
        this.type = 'submit';
    }
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _handleClick() {
        this._stepper.next();
    }
}
CdkStepperNext.decorators = [
    { type: Directive, args: [{
                selector: 'button[cdkStepperNext]',
                host: {
                    '[type]': 'type',
                }
            },] }
];
CdkStepperNext.ctorParameters = () => [
    { type: CdkStepper }
];
CdkStepperNext.propDecorators = {
    type: [{ type: Input }],
    _handleClick: [{ type: HostListener, args: ['click',] }]
};
/** Button that moves to the previous step in a stepper workflow. */
export class CdkStepperPrevious {
    constructor(_stepper) {
        this._stepper = _stepper;
        /** Type of the previous button. Defaults to "button" if not specified. */
        this.type = 'button';
    }
    // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
    // In Ivy the `host` bindings will be merged when this class is extended, whereas in
    // ViewEngine they're overwritten.
    // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
    // tslint:disable-next-line:no-host-decorator-in-concrete
    _handleClick() {
        this._stepper.previous();
    }
}
CdkStepperPrevious.decorators = [
    { type: Directive, args: [{
                selector: 'button[cdkStepperPrevious]',
                host: {
                    '[type]': 'type',
                }
            },] }
];
CdkStepperPrevious.ctorParameters = () => [
    { type: CdkStepper }
];
CdkStepperPrevious.propDecorators = {
    type: [{ type: Input }],
    _handleClick: [{ type: HostListener, args: ['click',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1idXR0b24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3N0ZXBwZXIvc3RlcHBlci1idXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTdELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFckMsZ0VBQWdFO0FBT2hFLE1BQU0sT0FBTyxjQUFjO0lBSXpCLFlBQW1CLFFBQW9CO1FBQXBCLGFBQVEsR0FBUixRQUFRLENBQVk7UUFIdkMsc0VBQXNFO1FBQzdELFNBQUksR0FBVyxRQUFRLENBQUM7SUFFUyxDQUFDO0lBRTNDLG9GQUFvRjtJQUNwRixvRkFBb0Y7SUFDcEYsa0NBQWtDO0lBQ2xDLGtGQUFrRjtJQUNsRix5REFBeUQ7SUFFekQsWUFBWTtRQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQzs7O1lBcEJGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsd0JBQXdCO2dCQUNsQyxJQUFJLEVBQUU7b0JBQ0osUUFBUSxFQUFFLE1BQU07aUJBQ2pCO2FBQ0Y7OztZQVJPLFVBQVU7OzttQkFXZixLQUFLOzJCQVNMLFlBQVksU0FBQyxPQUFPOztBQU12QixvRUFBb0U7QUFPcEUsTUFBTSxPQUFPLGtCQUFrQjtJQUk3QixZQUFtQixRQUFvQjtRQUFwQixhQUFRLEdBQVIsUUFBUSxDQUFZO1FBSHZDLDBFQUEwRTtRQUNqRSxTQUFJLEdBQVcsUUFBUSxDQUFDO0lBRVMsQ0FBQztJQUUzQyxvRkFBb0Y7SUFDcEYsb0ZBQW9GO0lBQ3BGLGtDQUFrQztJQUNsQyxrRkFBa0Y7SUFDbEYseURBQXlEO0lBRXpELFlBQVk7UUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzNCLENBQUM7OztZQXBCRixTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtnQkFDdEMsSUFBSSxFQUFFO29CQUNKLFFBQVEsRUFBRSxNQUFNO2lCQUNqQjthQUNGOzs7WUFoQ08sVUFBVTs7O21CQW1DZixLQUFLOzJCQVNMLFlBQVksU0FBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0RpcmVjdGl2ZSwgSG9zdExpc3RlbmVyLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQge0Nka1N0ZXBwZXJ9IGZyb20gJy4vc3RlcHBlcic7XHJcblxyXG4vKiogQnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIG5leHQgc3RlcCBpbiBhIHN0ZXBwZXIgd29ya2Zsb3cuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnYnV0dG9uW2Nka1N0ZXBwZXJOZXh0XScsXHJcbiAgaG9zdDoge1xyXG4gICAgJ1t0eXBlXSc6ICd0eXBlJyxcclxuICB9XHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtTdGVwcGVyTmV4dCB7XHJcbiAgLyoqIFR5cGUgb2YgdGhlIG5leHQgYnV0dG9uLiBEZWZhdWx0cyB0byBcInN1Ym1pdFwiIGlmIG5vdCBzcGVjaWZpZWQuICovXHJcbiAgQElucHV0KCkgdHlwZTogc3RyaW5nID0gJ3N1Ym1pdCc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBfc3RlcHBlcjogQ2RrU3RlcHBlcikge31cclxuXHJcbiAgLy8gV2UgaGF2ZSB0byB1c2UgYSBgSG9zdExpc3RlbmVyYCBoZXJlIGluIG9yZGVyIHRvIHN1cHBvcnQgYm90aCBJdnkgYW5kIFZpZXdFbmdpbmUuXHJcbiAgLy8gSW4gSXZ5IHRoZSBgaG9zdGAgYmluZGluZ3Mgd2lsbCBiZSBtZXJnZWQgd2hlbiB0aGlzIGNsYXNzIGlzIGV4dGVuZGVkLCB3aGVyZWFzIGluXHJcbiAgLy8gVmlld0VuZ2luZSB0aGV5J3JlIG92ZXJ3cml0dGVuLlxyXG4gIC8vIFRPRE8oY3Jpc2JldG8pOiB3ZSBtb3ZlIHRoaXMgYmFjayBpbnRvIGBob3N0YCBvbmNlIEl2eSBpcyB0dXJuZWQgb24gYnkgZGVmYXVsdC5cclxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8taG9zdC1kZWNvcmF0b3ItaW4tY29uY3JldGVcclxuICBASG9zdExpc3RlbmVyKCdjbGljaycpXHJcbiAgX2hhbmRsZUNsaWNrKCkge1xyXG4gICAgdGhpcy5fc3RlcHBlci5uZXh0KCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogQnV0dG9uIHRoYXQgbW92ZXMgdG8gdGhlIHByZXZpb3VzIHN0ZXAgaW4gYSBzdGVwcGVyIHdvcmtmbG93LiAqL1xyXG5ARGlyZWN0aXZlKHtcclxuICBzZWxlY3RvcjogJ2J1dHRvbltjZGtTdGVwcGVyUHJldmlvdXNdJyxcclxuICBob3N0OiB7XHJcbiAgICAnW3R5cGVdJzogJ3R5cGUnLFxyXG4gIH1cclxufSlcclxuZXhwb3J0IGNsYXNzIENka1N0ZXBwZXJQcmV2aW91cyB7XHJcbiAgLyoqIFR5cGUgb2YgdGhlIHByZXZpb3VzIGJ1dHRvbi4gRGVmYXVsdHMgdG8gXCJidXR0b25cIiBpZiBub3Qgc3BlY2lmaWVkLiAqL1xyXG4gIEBJbnB1dCgpIHR5cGU6IHN0cmluZyA9ICdidXR0b24nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgX3N0ZXBwZXI6IENka1N0ZXBwZXIpIHt9XHJcblxyXG4gIC8vIFdlIGhhdmUgdG8gdXNlIGEgYEhvc3RMaXN0ZW5lcmAgaGVyZSBpbiBvcmRlciB0byBzdXBwb3J0IGJvdGggSXZ5IGFuZCBWaWV3RW5naW5lLlxyXG4gIC8vIEluIEl2eSB0aGUgYGhvc3RgIGJpbmRpbmdzIHdpbGwgYmUgbWVyZ2VkIHdoZW4gdGhpcyBjbGFzcyBpcyBleHRlbmRlZCwgd2hlcmVhcyBpblxyXG4gIC8vIFZpZXdFbmdpbmUgdGhleSdyZSBvdmVyd3JpdHRlbi5cclxuICAvLyBUT0RPKGNyaXNiZXRvKTogd2UgbW92ZSB0aGlzIGJhY2sgaW50byBgaG9zdGAgb25jZSBJdnkgaXMgdHVybmVkIG9uIGJ5IGRlZmF1bHQuXHJcbiAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWhvc3QtZGVjb3JhdG9yLWluLWNvbmNyZXRlXHJcbiAgQEhvc3RMaXN0ZW5lcignY2xpY2snKVxyXG4gIF9oYW5kbGVDbGljaygpIHtcclxuICAgIHRoaXMuX3N0ZXBwZXIucHJldmlvdXMoKTtcclxuICB9XHJcbn1cclxuIl19