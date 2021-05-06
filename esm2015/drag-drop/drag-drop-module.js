/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CdkDropList } from './directives/drop-list';
import { CdkDropListGroup } from './directives/drop-list-group';
import { CdkDrag } from './directives/drag';
import { CdkDragHandle } from './directives/drag-handle';
import { CdkDragPreview } from './directives/drag-preview';
import { CdkDragPlaceholder } from './directives/drag-placeholder';
import { DragDrop } from './drag-drop';
export class DragDropModule {
}
DragDropModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    CdkDropList,
                    CdkDropListGroup,
                    CdkDrag,
                    CdkDragHandle,
                    CdkDragPreview,
                    CdkDragPlaceholder,
                ],
                exports: [
                    CdkScrollableModule,
                    CdkDropList,
                    CdkDropListGroup,
                    CdkDrag,
                    CdkDragHandle,
                    CdkDragPreview,
                    CdkDragPlaceholder,
                ],
                providers: [
                    DragDrop,
                ]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhZy1kcm9wLW1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvZHJhZy1kcm9wL2RyYWctZHJvcC1tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUMzRCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDbkQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQXdCckMsTUFBTSxPQUFPLGNBQWM7OztZQXRCMUIsUUFBUSxTQUFDO2dCQUNSLFlBQVksRUFBRTtvQkFDWixXQUFXO29CQUNYLGdCQUFnQjtvQkFDaEIsT0FBTztvQkFDUCxhQUFhO29CQUNiLGNBQWM7b0JBQ2Qsa0JBQWtCO2lCQUNuQjtnQkFDRCxPQUFPLEVBQUU7b0JBQ1AsbUJBQW1CO29CQUNuQixXQUFXO29CQUNYLGdCQUFnQjtvQkFDaEIsT0FBTztvQkFDUCxhQUFhO29CQUNiLGNBQWM7b0JBQ2Qsa0JBQWtCO2lCQUNuQjtnQkFDRCxTQUFTLEVBQUU7b0JBQ1QsUUFBUTtpQkFDVDthQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDZGtTY3JvbGxhYmxlTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtDZGtEcm9wTGlzdH0gZnJvbSAnLi9kaXJlY3RpdmVzL2Ryb3AtbGlzdCc7XHJcbmltcG9ydCB7Q2RrRHJvcExpc3RHcm91cH0gZnJvbSAnLi9kaXJlY3RpdmVzL2Ryb3AtbGlzdC1ncm91cCc7XHJcbmltcG9ydCB7Q2RrRHJhZ30gZnJvbSAnLi9kaXJlY3RpdmVzL2RyYWcnO1xyXG5pbXBvcnQge0Nka0RyYWdIYW5kbGV9IGZyb20gJy4vZGlyZWN0aXZlcy9kcmFnLWhhbmRsZSc7XHJcbmltcG9ydCB7Q2RrRHJhZ1ByZXZpZXd9IGZyb20gJy4vZGlyZWN0aXZlcy9kcmFnLXByZXZpZXcnO1xyXG5pbXBvcnQge0Nka0RyYWdQbGFjZWhvbGRlcn0gZnJvbSAnLi9kaXJlY3RpdmVzL2RyYWctcGxhY2Vob2xkZXInO1xyXG5pbXBvcnQge0RyYWdEcm9wfSBmcm9tICcuL2RyYWctZHJvcCc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW1xyXG4gICAgQ2RrRHJvcExpc3QsXHJcbiAgICBDZGtEcm9wTGlzdEdyb3VwLFxyXG4gICAgQ2RrRHJhZyxcclxuICAgIENka0RyYWdIYW5kbGUsXHJcbiAgICBDZGtEcmFnUHJldmlldyxcclxuICAgIENka0RyYWdQbGFjZWhvbGRlcixcclxuICBdLFxyXG4gIGV4cG9ydHM6IFtcclxuICAgIENka1Njcm9sbGFibGVNb2R1bGUsXHJcbiAgICBDZGtEcm9wTGlzdCxcclxuICAgIENka0Ryb3BMaXN0R3JvdXAsXHJcbiAgICBDZGtEcmFnLFxyXG4gICAgQ2RrRHJhZ0hhbmRsZSxcclxuICAgIENka0RyYWdQcmV2aWV3LFxyXG4gICAgQ2RrRHJhZ1BsYWNlaG9sZGVyLFxyXG4gIF0sXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICBEcmFnRHJvcCxcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBEcmFnRHJvcE1vZHVsZSB7fVxyXG4iXX0=