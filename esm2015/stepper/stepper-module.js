/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkStepper, CdkStep } from './stepper';
import { CdkStepLabel } from './step-label';
import { CdkStepperNext, CdkStepperPrevious } from './stepper-button';
import { CdkStepHeader } from './step-header';
import { BidiModule } from '@angular/cdk/bidi';
export class CdkStepperModule {
}
CdkStepperModule.decorators = [
    { type: NgModule, args: [{
                imports: [BidiModule],
                exports: [
                    CdkStep,
                    CdkStepper,
                    CdkStepHeader,
                    CdkStepLabel,
                    CdkStepperNext,
                    CdkStepperPrevious,
                ],
                declarations: [
                    CdkStep,
                    CdkStepper,
                    CdkStepHeader,
                    CdkStepLabel,
                    CdkStepperNext,
                    CdkStepperPrevious,
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3N0ZXBwZXIvc3RlcHBlci1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsVUFBVSxFQUFFLE9BQU8sRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUM5QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBQyxjQUFjLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNwRSxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQXFCN0MsTUFBTSxPQUFPLGdCQUFnQjs7O1lBbkI1QixRQUFRLFNBQUM7Z0JBQ1IsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNyQixPQUFPLEVBQUU7b0JBQ1AsT0FBTztvQkFDUCxVQUFVO29CQUNWLGFBQWE7b0JBQ2IsWUFBWTtvQkFDWixjQUFjO29CQUNkLGtCQUFrQjtpQkFDbkI7Z0JBQ0QsWUFBWSxFQUFFO29CQUNaLE9BQU87b0JBQ1AsVUFBVTtvQkFDVixhQUFhO29CQUNiLFlBQVk7b0JBQ1osY0FBYztvQkFDZCxrQkFBa0I7aUJBQ25CO2FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7TmdNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0Nka1N0ZXBwZXIsIENka1N0ZXB9IGZyb20gJy4vc3RlcHBlcic7XHJcbmltcG9ydCB7Q2RrU3RlcExhYmVsfSBmcm9tICcuL3N0ZXAtbGFiZWwnO1xyXG5pbXBvcnQge0Nka1N0ZXBwZXJOZXh0LCBDZGtTdGVwcGVyUHJldmlvdXN9IGZyb20gJy4vc3RlcHBlci1idXR0b24nO1xyXG5pbXBvcnQge0Nka1N0ZXBIZWFkZXJ9IGZyb20gJy4vc3RlcC1oZWFkZXInO1xyXG5pbXBvcnQge0JpZGlNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgaW1wb3J0czogW0JpZGlNb2R1bGVdLFxyXG4gIGV4cG9ydHM6IFtcclxuICAgIENka1N0ZXAsXHJcbiAgICBDZGtTdGVwcGVyLFxyXG4gICAgQ2RrU3RlcEhlYWRlcixcclxuICAgIENka1N0ZXBMYWJlbCxcclxuICAgIENka1N0ZXBwZXJOZXh0LFxyXG4gICAgQ2RrU3RlcHBlclByZXZpb3VzLFxyXG4gIF0sXHJcbiAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICBDZGtTdGVwLFxyXG4gICAgQ2RrU3RlcHBlcixcclxuICAgIENka1N0ZXBIZWFkZXIsXHJcbiAgICBDZGtTdGVwTGFiZWwsXHJcbiAgICBDZGtTdGVwcGVyTmV4dCxcclxuICAgIENka1N0ZXBwZXJQcmV2aW91cyxcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtTdGVwcGVyTW9kdWxlIHt9XHJcbiJdfQ==