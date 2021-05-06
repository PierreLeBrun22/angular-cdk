/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { CdkAutofill } from './autofill';
import { CdkTextareaAutosize } from './autosize';
export class TextFieldModule {
}
TextFieldModule.decorators = [
    { type: NgModule, args: [{
                declarations: [CdkAutofill, CdkTextareaAutosize],
                imports: [PlatformModule],
                exports: [CdkAutofill, CdkTextareaAutosize],
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1maWVsZC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3RleHQtZmllbGQvdGV4dC1maWVsZC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUN2QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFRL0MsTUFBTSxPQUFPLGVBQWU7OztZQUwzQixRQUFRLFNBQUM7Z0JBQ1IsWUFBWSxFQUFFLENBQUMsV0FBVyxFQUFFLG1CQUFtQixDQUFDO2dCQUNoRCxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUM7Z0JBQ3pCLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQzthQUM1QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtQbGF0Zm9ybU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3BsYXRmb3JtJztcclxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q2RrQXV0b2ZpbGx9IGZyb20gJy4vYXV0b2ZpbGwnO1xyXG5pbXBvcnQge0Nka1RleHRhcmVhQXV0b3NpemV9IGZyb20gJy4vYXV0b3NpemUnO1xyXG5cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgZGVjbGFyYXRpb25zOiBbQ2RrQXV0b2ZpbGwsIENka1RleHRhcmVhQXV0b3NpemVdLFxyXG4gIGltcG9ydHM6IFtQbGF0Zm9ybU1vZHVsZV0sXHJcbiAgZXhwb3J0czogW0Nka0F1dG9maWxsLCBDZGtUZXh0YXJlYUF1dG9zaXplXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIFRleHRGaWVsZE1vZHVsZSB7fVxyXG4iXX0=