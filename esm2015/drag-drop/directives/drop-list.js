/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceArray, coerceNumberProperty, coerceBooleanProperty, } from '@angular/cdk/coercion';
import { ElementRef, EventEmitter, Input, Output, Optional, Directive, ChangeDetectorRef, SkipSelf, Inject, InjectionToken, } from '@angular/core';
import { Directionality } from '@angular/cdk/bidi';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { CDK_DROP_LIST_GROUP, CdkDropListGroup } from './drop-list-group';
import { DragDrop } from '../drag-drop';
import { CDK_DRAG_CONFIG } from './config';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { assertElementNode } from './assertions';
/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;
/**
 * Injection token that can be used to reference instances of `CdkDropList`. It serves as
 * alternative token to the actual `CdkDropList` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST = new InjectionToken('CdkDropList');
const ɵ0 = undefined;
/** Container that wraps a set of draggable items. */
export class CdkDropList {
    constructor(
    /** Element that the drop list is attached to. */
    element, dragDrop, _changeDetectorRef, _scrollDispatcher, _dir, _group, config) {
        this.element = element;
        this._changeDetectorRef = _changeDetectorRef;
        this._scrollDispatcher = _scrollDispatcher;
        this._dir = _dir;
        this._group = _group;
        /** Emits when the list has been destroyed. */
        this._destroyed = new Subject();
        /**
         * Other draggable containers that this container is connected to and into which the
         * container's items can be transferred. Can either be references to other drop containers,
         * or their unique IDs.
         */
        this.connectedTo = [];
        /**
         * Unique ID for the drop zone. Can be used as a reference
         * in the `connectedTo` of another `CdkDropList`.
         */
        this.id = `cdk-drop-list-${_uniqueIdCounter++}`;
        /**
         * Function that is used to determine whether an item
         * is allowed to be moved into a drop container.
         */
        this.enterPredicate = () => true;
        /** Functions that is used to determine whether an item can be sorted into a particular index. */
        this.sortPredicate = () => true;
        /** Emits when the user drops an item inside the container. */
        this.dropped = new EventEmitter();
        /**
         * Emits when the user has moved a new drag item into this container.
         */
        this.entered = new EventEmitter();
        /**
         * Emits when the user removes an item from the container
         * by dragging it into another container.
         */
        this.exited = new EventEmitter();
        /** Emits as the user is swapping items while actively dragging. */
        this.sorted = new EventEmitter();
        /**
         * Keeps track of the items that are registered with this container. Historically we used to
         * do this with a `ContentChildren` query, however queries don't handle transplanted views very
         * well which means that we can't handle cases like dragging the headers of a `mat-table`
         * correctly. What we do instead is to have the items register themselves with the container
         * and then we sort them based on their position in the DOM.
         */
        this._unsortedItems = new Set();
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            assertElementNode(element.nativeElement, 'cdkDropList');
        }
        this._dropListRef = dragDrop.createDropList(element);
        this._dropListRef.data = this;
        if (config) {
            this._assignDefaults(config);
        }
        this._dropListRef.enterPredicate = (drag, drop) => {
            return this.enterPredicate(drag.data, drop.data);
        };
        this._dropListRef.sortPredicate =
            (index, drag, drop) => {
                return this.sortPredicate(index, drag.data, drop.data);
            };
        this._setupInputSyncSubscription(this._dropListRef);
        this._handleEvents(this._dropListRef);
        CdkDropList._dropLists.push(this);
        if (_group) {
            _group._items.add(this);
        }
    }
    /** Whether starting a dragging sequence from this container is disabled. */
    get disabled() {
        return this._disabled || (!!this._group && this._group.disabled);
    }
    set disabled(value) {
        // Usually we sync the directive and ref state right before dragging starts, in order to have
        // a single point of failure and to avoid having to use setters for everything. `disabled` is
        // a special case, because it can prevent the `beforeStarted` event from firing, which can lock
        // the user in a disabled state, so we also need to sync it as it's being set.
        this._dropListRef.disabled = this._disabled = coerceBooleanProperty(value);
    }
    /** Registers an items with the drop list. */
    addItem(item) {
        this._unsortedItems.add(item);
        if (this._dropListRef.isDragging()) {
            this._syncItemsWithRef();
        }
    }
    /** Removes an item from the drop list. */
    removeItem(item) {
        this._unsortedItems.delete(item);
        if (this._dropListRef.isDragging()) {
            this._syncItemsWithRef();
        }
    }
    /** Gets the registered items in the list, sorted by their position in the DOM. */
    getSortedItems() {
        return Array.from(this._unsortedItems).sort((a, b) => {
            const documentPosition = a._dragRef.getVisibleElement().compareDocumentPosition(b._dragRef.getVisibleElement());
            // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            // tslint:disable-next-line:no-bitwise
            return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });
    }
    ngOnDestroy() {
        const index = CdkDropList._dropLists.indexOf(this);
        if (index > -1) {
            CdkDropList._dropLists.splice(index, 1);
        }
        if (this._group) {
            this._group._items.delete(this);
        }
        this._unsortedItems.clear();
        this._dropListRef.dispose();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Syncs the inputs of the CdkDropList with the options of the underlying DropListRef. */
    _setupInputSyncSubscription(ref) {
        if (this._dir) {
            this._dir.change
                .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
                .subscribe(value => ref.withDirection(value));
        }
        ref.beforeStarted.subscribe(() => {
            const siblings = coerceArray(this.connectedTo).map(drop => {
                if (typeof drop === 'string') {
                    const correspondingDropList = CdkDropList._dropLists.find(list => list.id === drop);
                    if (!correspondingDropList && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                        console.warn(`CdkDropList could not find connected drop list with id "${drop}"`);
                    }
                    return correspondingDropList;
                }
                return drop;
            });
            if (this._group) {
                this._group._items.forEach(drop => {
                    if (siblings.indexOf(drop) === -1) {
                        siblings.push(drop);
                    }
                });
            }
            // Note that we resolve the scrollable parents here so that we delay the resolution
            // as long as possible, ensuring that the element is in its final place in the DOM.
            if (!this._scrollableParentsResolved) {
                const scrollableParents = this._scrollDispatcher
                    .getAncestorScrollContainers(this.element)
                    .map(scrollable => scrollable.getElementRef().nativeElement);
                this._dropListRef.withScrollableParents(scrollableParents);
                // Only do this once since it involves traversing the DOM and the parents
                // shouldn't be able to change without the drop list being destroyed.
                this._scrollableParentsResolved = true;
            }
            ref.disabled = this.disabled;
            ref.lockAxis = this.lockAxis;
            ref.sortingDisabled = coerceBooleanProperty(this.sortingDisabled);
            ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
            ref.autoScrollStep = coerceNumberProperty(this.autoScrollStep, 2);
            ref
                .connectedTo(siblings.filter(drop => drop && drop !== this).map(list => list._dropListRef))
                .withOrientation(this.orientation);
        });
    }
    /** Handles events from the underlying DropListRef. */
    _handleEvents(ref) {
        ref.beforeStarted.subscribe(() => {
            this._syncItemsWithRef();
            this._changeDetectorRef.markForCheck();
        });
        ref.entered.subscribe(event => {
            this.entered.emit({
                container: this,
                item: event.item.data,
                currentIndex: event.currentIndex
            });
        });
        ref.exited.subscribe(event => {
            this.exited.emit({
                container: this,
                item: event.item.data
            });
            this._changeDetectorRef.markForCheck();
        });
        ref.sorted.subscribe(event => {
            this.sorted.emit({
                previousIndex: event.previousIndex,
                currentIndex: event.currentIndex,
                container: this,
                item: event.item.data
            });
        });
        ref.dropped.subscribe(event => {
            this.dropped.emit({
                previousIndex: event.previousIndex,
                currentIndex: event.currentIndex,
                previousContainer: event.previousContainer.data,
                container: event.container.data,
                item: event.item.data,
                isPointerOverContainer: event.isPointerOverContainer,
                distance: event.distance
            });
            // Mark for check since all of these events run outside of change
            // detection and we're not guaranteed for something else to have triggered it.
            this._changeDetectorRef.markForCheck();
        });
    }
    /** Assigns the default input values based on a provided config object. */
    _assignDefaults(config) {
        const { lockAxis, draggingDisabled, sortingDisabled, listAutoScrollDisabled, listOrientation } = config;
        this.disabled = draggingDisabled == null ? false : draggingDisabled;
        this.sortingDisabled = sortingDisabled == null ? false : sortingDisabled;
        this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
        this.orientation = listOrientation || 'vertical';
        if (lockAxis) {
            this.lockAxis = lockAxis;
        }
    }
    /** Syncs up the registered drag items with underlying drop list ref. */
    _syncItemsWithRef() {
        this._dropListRef.withItems(this.getSortedItems().map(item => item._dragRef));
    }
}
/** Keeps track of the drop lists that are currently on the page. */
CdkDropList._dropLists = [];
CdkDropList.decorators = [
    { type: Directive, args: [{
                selector: '[cdkDropList], cdk-drop-list',
                exportAs: 'cdkDropList',
                providers: [
                    // Prevent child drop lists from picking up the same group as their parent.
                    { provide: CDK_DROP_LIST_GROUP, useValue: ɵ0 },
                    { provide: CDK_DROP_LIST, useExisting: CdkDropList },
                ],
                host: {
                    'class': 'cdk-drop-list',
                    '[attr.id]': 'id',
                    '[class.cdk-drop-list-disabled]': 'disabled',
                    '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
                    '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
                }
            },] }
];
CdkDropList.ctorParameters = () => [
    { type: ElementRef },
    { type: DragDrop },
    { type: ChangeDetectorRef },
    { type: ScrollDispatcher },
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: CdkDropListGroup, decorators: [{ type: Optional }, { type: Inject, args: [CDK_DROP_LIST_GROUP,] }, { type: SkipSelf }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [CDK_DRAG_CONFIG,] }] }
];
CdkDropList.propDecorators = {
    connectedTo: [{ type: Input, args: ['cdkDropListConnectedTo',] }],
    data: [{ type: Input, args: ['cdkDropListData',] }],
    orientation: [{ type: Input, args: ['cdkDropListOrientation',] }],
    id: [{ type: Input }],
    lockAxis: [{ type: Input, args: ['cdkDropListLockAxis',] }],
    disabled: [{ type: Input, args: ['cdkDropListDisabled',] }],
    sortingDisabled: [{ type: Input, args: ['cdkDropListSortingDisabled',] }],
    enterPredicate: [{ type: Input, args: ['cdkDropListEnterPredicate',] }],
    sortPredicate: [{ type: Input, args: ['cdkDropListSortPredicate',] }],
    autoScrollDisabled: [{ type: Input, args: ['cdkDropListAutoScrollDisabled',] }],
    autoScrollStep: [{ type: Input, args: ['cdkDropListAutoScrollStep',] }],
    dropped: [{ type: Output, args: ['cdkDropListDropped',] }],
    entered: [{ type: Output, args: ['cdkDropListEntered',] }],
    exited: [{ type: Output, args: ['cdkDropListExited',] }],
    sorted: [{ type: Output, args: ['cdkDropListSorted',] }]
};
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcC1saXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9kcmFnLWRyb3AvZGlyZWN0aXZlcy9kcm9wLWxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUVMLFdBQVcsRUFDWCxvQkFBb0IsRUFDcEIscUJBQXFCLEdBRXRCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUNMLFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLE1BQU0sRUFDTixRQUFRLEVBQ1IsU0FBUyxFQUNULGlCQUFpQixFQUNqQixRQUFRLEVBQ1IsTUFBTSxFQUNOLGNBQWMsR0FDZixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDakQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFHeEQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFHeEUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQWdELGVBQWUsRUFBQyxNQUFNLFVBQVUsQ0FBQztBQUN4RixPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBRS9DLDBEQUEwRDtBQUMxRCxJQUFJLGdCQUFnQixHQUFHLENBQUMsQ0FBQztBQVN6Qjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUFjLGFBQWEsQ0FBQyxDQUFDO1dBUS9CLFNBQVM7QUFOdEQscURBQXFEO0FBaUJyRCxNQUFNLE9BQU8sV0FBVztJQXVHdEI7SUFDSSxpREFBaUQ7SUFDMUMsT0FBZ0MsRUFBRSxRQUFrQixFQUNuRCxrQkFBcUMsRUFDckMsaUJBQW1DLEVBQ3ZCLElBQXFCLEVBRWpDLE1BQXNDLEVBQ1QsTUFBdUI7UUFOckQsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7UUFDL0IsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFtQjtRQUNyQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBQ3ZCLFNBQUksR0FBSixJQUFJLENBQWlCO1FBRWpDLFdBQU0sR0FBTixNQUFNLENBQWdDO1FBN0dsRCw4Q0FBOEM7UUFDdEMsZUFBVSxHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFXekM7Ozs7V0FJRztRQUVILGdCQUFXLEdBQW9ELEVBQUUsQ0FBQztRQVFsRTs7O1dBR0c7UUFDTSxPQUFFLEdBQVcsaUJBQWlCLGdCQUFnQixFQUFFLEVBQUUsQ0FBQztRQXVCNUQ7OztXQUdHO1FBRUgsbUJBQWMsR0FBa0QsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFBO1FBRTFFLGlHQUFpRztRQUVqRyxrQkFBYSxHQUFpRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUE7UUFVeEYsOERBQThEO1FBRTlELFlBQU8sR0FBc0MsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFckY7O1dBRUc7UUFFSCxZQUFPLEdBQWtDLElBQUksWUFBWSxFQUFtQixDQUFDO1FBRTdFOzs7V0FHRztRQUVILFdBQU0sR0FBaUMsSUFBSSxZQUFZLEVBQWtCLENBQUM7UUFFMUUsbUVBQW1FO1FBRW5FLFdBQU0sR0FBc0MsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFcEY7Ozs7OztXQU1HO1FBQ0ssbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBVyxDQUFDO1FBWTFDLElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsRUFBRTtZQUNqRCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUU5QixJQUFJLE1BQU0sRUFBRTtZQUNWLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUI7UUFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsR0FBRyxDQUFDLElBQXNCLEVBQUUsSUFBOEIsRUFBRSxFQUFFO1lBQzVGLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWE7WUFDN0IsQ0FBQyxLQUFhLEVBQUUsSUFBc0IsRUFBRSxJQUE4QixFQUFFLEVBQUU7Z0JBQ3hFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDO1FBRUosSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsQyxJQUFJLE1BQU0sRUFBRTtZQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQXhHRCw0RUFBNEU7SUFDNUUsSUFDSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBQ0QsSUFBSSxRQUFRLENBQUMsS0FBYztRQUN6Qiw2RkFBNkY7UUFDN0YsNkZBQTZGO1FBQzdGLCtGQUErRjtRQUMvRiw4RUFBOEU7UUFDOUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBK0ZELDZDQUE2QztJQUM3QyxPQUFPLENBQUMsSUFBYTtRQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5QixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDbEMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDMUI7SUFDSCxDQUFDO0lBRUQsMENBQTBDO0lBQzFDLFVBQVUsQ0FBQyxJQUFhO1FBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpDLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNsQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMxQjtJQUNILENBQUM7SUFFRCxrRkFBa0Y7SUFDbEYsY0FBYztRQUNaLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBVSxFQUFFLENBQVUsRUFBRSxFQUFFO1lBQ3JFLE1BQU0sZ0JBQWdCLEdBQ2xCLENBQUMsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUUzRixvRkFBb0Y7WUFDcEYsZ0ZBQWdGO1lBQ2hGLHNDQUFzQztZQUN0QyxPQUFPLGdCQUFnQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxXQUFXO1FBQ1QsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDZCxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRCwwRkFBMEY7SUFDbEYsMkJBQTJCLENBQUMsR0FBNkI7UUFDL0QsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNO2lCQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUM1RCxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDakQ7UUFFRCxHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO29CQUM1QixNQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQztvQkFFcEYsSUFBSSxDQUFDLHFCQUFxQixJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxFQUFFO3dCQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLDJEQUEyRCxJQUFJLEdBQUcsQ0FBQyxDQUFDO3FCQUNsRjtvQkFFRCxPQUFPLHFCQUFzQixDQUFDO2lCQUMvQjtnQkFFRCxPQUFPLElBQUksQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtvQkFDaEMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUNqQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNyQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1lBRUQsbUZBQW1GO1lBQ25GLG1GQUFtRjtZQUNuRixJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNwQyxNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUI7cUJBQzdDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7cUJBQ3pDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUUzRCx5RUFBeUU7Z0JBQ3pFLHFFQUFxRTtnQkFDckUsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQzthQUN4QztZQUVELEdBQUcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDN0IsR0FBRyxDQUFDLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbEUsR0FBRyxDQUFDLGtCQUFrQixHQUFHLHFCQUFxQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3hFLEdBQUcsQ0FBQyxjQUFjLEdBQUcsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsRSxHQUFHO2lCQUNBLFdBQVcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQzFGLGVBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsc0RBQXNEO0lBQzlDLGFBQWEsQ0FBQyxHQUE2QjtRQUNqRCxHQUFHLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUk7Z0JBQ3JCLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWTthQUNqQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2dCQUNmLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUk7YUFDdEIsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDM0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO2dCQUNsQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7Z0JBQ2hDLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUk7YUFDdEIsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztnQkFDaEIsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO2dCQUNsQyxZQUFZLEVBQUUsS0FBSyxDQUFDLFlBQVk7Z0JBQ2hDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJO2dCQUMvQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJO2dCQUMvQixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJO2dCQUNyQixzQkFBc0IsRUFBRSxLQUFLLENBQUMsc0JBQXNCO2dCQUNwRCxRQUFRLEVBQUUsS0FBSyxDQUFDLFFBQVE7YUFDekIsQ0FBQyxDQUFDO1lBRUgsaUVBQWlFO1lBQ2pFLDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDekMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsMEVBQTBFO0lBQ2xFLGVBQWUsQ0FBQyxNQUFzQjtRQUM1QyxNQUFNLEVBQ0osUUFBUSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxlQUFlLEVBQ3JGLEdBQUcsTUFBTSxDQUFDO1FBRVgsSUFBSSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7UUFDcEUsSUFBSSxDQUFDLGVBQWUsR0FBRyxlQUFlLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUN6RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsc0JBQXNCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDO1FBQzFGLElBQUksQ0FBQyxXQUFXLEdBQUcsZUFBZSxJQUFJLFVBQVUsQ0FBQztRQUVqRCxJQUFJLFFBQVEsRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztJQUVELHdFQUF3RTtJQUNoRSxpQkFBaUI7UUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7O0FBbFRELG9FQUFvRTtBQUNyRCxzQkFBVSxHQUFrQixFQUFFLENBQUM7O1lBeEIvQyxTQUFTLFNBQUM7Z0JBQ1QsUUFBUSxFQUFFLDhCQUE4QjtnQkFDeEMsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLFNBQVMsRUFBRTtvQkFDVCwyRUFBMkU7b0JBQzNFLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFFBQVEsSUFBVyxFQUFDO29CQUNuRCxFQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQztpQkFDbkQ7Z0JBQ0QsSUFBSSxFQUFFO29CQUNKLE9BQU8sRUFBRSxlQUFlO29CQUN4QixXQUFXLEVBQUUsSUFBSTtvQkFDakIsZ0NBQWdDLEVBQUUsVUFBVTtvQkFDNUMsZ0NBQWdDLEVBQUUsMkJBQTJCO29CQUM3RCxpQ0FBaUMsRUFBRSw0QkFBNEI7aUJBQ2hFO2FBQ0Y7OztZQTFEQyxVQUFVO1lBbUJKLFFBQVE7WUFaZCxpQkFBaUI7WUFNWCxnQkFBZ0I7WUFEaEIsY0FBYyx1QkEySmYsUUFBUTtZQXZKYyxnQkFBZ0IsdUJBd0p0QyxRQUFRLFlBQUksTUFBTSxTQUFDLG1CQUFtQixjQUFHLFFBQVE7NENBRWpELFFBQVEsWUFBSSxNQUFNLFNBQUMsZUFBZTs7OzBCQTdGdEMsS0FBSyxTQUFDLHdCQUF3QjttQkFJOUIsS0FBSyxTQUFDLGlCQUFpQjswQkFHdkIsS0FBSyxTQUFDLHdCQUF3QjtpQkFNOUIsS0FBSzt1QkFHTCxLQUFLLFNBQUMscUJBQXFCO3VCQUczQixLQUFLLFNBQUMscUJBQXFCOzhCQWMzQixLQUFLLFNBQUMsNEJBQTRCOzZCQU9sQyxLQUFLLFNBQUMsMkJBQTJCOzRCQUlqQyxLQUFLLFNBQUMsMEJBQTBCO2lDQUloQyxLQUFLLFNBQUMsK0JBQStCOzZCQUlyQyxLQUFLLFNBQUMsMkJBQTJCO3NCQUlqQyxNQUFNLFNBQUMsb0JBQW9CO3NCQU0zQixNQUFNLFNBQUMsb0JBQW9CO3FCQU8zQixNQUFNLFNBQUMsbUJBQW1CO3FCQUkxQixNQUFNLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIEJvb2xlYW5JbnB1dCxcclxuICBjb2VyY2VBcnJheSxcclxuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcclxuICBjb2VyY2VCb29sZWFuUHJvcGVydHksXHJcbiAgTnVtYmVySW5wdXQsXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcclxuaW1wb3J0IHtcclxuICBFbGVtZW50UmVmLFxyXG4gIEV2ZW50RW1pdHRlcixcclxuICBJbnB1dCxcclxuICBPbkRlc3Ryb3ksXHJcbiAgT3V0cHV0LFxyXG4gIE9wdGlvbmFsLFxyXG4gIERpcmVjdGl2ZSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBTa2lwU2VsZixcclxuICBJbmplY3QsXHJcbiAgSW5qZWN0aW9uVG9rZW4sXHJcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7RGlyZWN0aW9uYWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcclxuaW1wb3J0IHtTY3JvbGxEaXNwYXRjaGVyfSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtDZGtEcmFnfSBmcm9tICcuL2RyYWcnO1xyXG5pbXBvcnQge0Nka0RyYWdEcm9wLCBDZGtEcmFnRW50ZXIsIENka0RyYWdFeGl0LCBDZGtEcmFnU29ydEV2ZW50fSBmcm9tICcuLi9kcmFnLWV2ZW50cyc7XHJcbmltcG9ydCB7Q0RLX0RST1BfTElTVF9HUk9VUCwgQ2RrRHJvcExpc3RHcm91cH0gZnJvbSAnLi9kcm9wLWxpc3QtZ3JvdXAnO1xyXG5pbXBvcnQge0Ryb3BMaXN0UmVmfSBmcm9tICcuLi9kcm9wLWxpc3QtcmVmJztcclxuaW1wb3J0IHtEcmFnUmVmfSBmcm9tICcuLi9kcmFnLXJlZic7XHJcbmltcG9ydCB7RHJhZ0Ryb3B9IGZyb20gJy4uL2RyYWctZHJvcCc7XHJcbmltcG9ydCB7RHJvcExpc3RPcmllbnRhdGlvbiwgRHJhZ0F4aXMsIERyYWdEcm9wQ29uZmlnLCBDREtfRFJBR19DT05GSUd9IGZyb20gJy4vY29uZmlnJztcclxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtzdGFydFdpdGgsIHRha2VVbnRpbH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge2Fzc2VydEVsZW1lbnROb2RlfSBmcm9tICcuL2Fzc2VydGlvbnMnO1xyXG5cclxuLyoqIENvdW50ZXIgdXNlZCB0byBnZW5lcmF0ZSB1bmlxdWUgaWRzIGZvciBkcm9wIHpvbmVzLiAqL1xyXG5sZXQgX3VuaXF1ZUlkQ291bnRlciA9IDA7XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgY29tcGlsZS10aW1lLW9ubHkgcmVwcmVzZW50YXRpb24gb2YgYSBgQ2RrRHJvcExpc3RgLlxyXG4gKiBVc2VkIHRvIGF2b2lkIGNpcmN1bGFyIGltcG9ydCBpc3N1ZXMgYmV0d2VlbiB0aGUgYENka0Ryb3BMaXN0YCBhbmQgdGhlIGBDZGtEcmFnYC5cclxuICogQGRvY3MtcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDZGtEcm9wTGlzdEludGVybmFsIGV4dGVuZHMgQ2RrRHJvcExpc3Qge31cclxuXHJcbi8qKlxyXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCB0byByZWZlcmVuY2UgaW5zdGFuY2VzIG9mIGBDZGtEcm9wTGlzdGAuIEl0IHNlcnZlcyBhc1xyXG4gKiBhbHRlcm5hdGl2ZSB0b2tlbiB0byB0aGUgYWN0dWFsIGBDZGtEcm9wTGlzdGAgY2xhc3Mgd2hpY2ggY291bGQgY2F1c2UgdW5uZWNlc3NhcnlcclxuICogcmV0ZW50aW9uIG9mIHRoZSBjbGFzcyBhbmQgaXRzIGRpcmVjdGl2ZSBtZXRhZGF0YS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBDREtfRFJPUF9MSVNUID0gbmV3IEluamVjdGlvblRva2VuPENka0Ryb3BMaXN0PignQ2RrRHJvcExpc3QnKTtcclxuXHJcbi8qKiBDb250YWluZXIgdGhhdCB3cmFwcyBhIHNldCBvZiBkcmFnZ2FibGUgaXRlbXMuICovXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka0Ryb3BMaXN0XSwgY2RrLWRyb3AtbGlzdCcsXHJcbiAgZXhwb3J0QXM6ICdjZGtEcm9wTGlzdCcsXHJcbiAgcHJvdmlkZXJzOiBbXHJcbiAgICAvLyBQcmV2ZW50IGNoaWxkIGRyb3AgbGlzdHMgZnJvbSBwaWNraW5nIHVwIHRoZSBzYW1lIGdyb3VwIGFzIHRoZWlyIHBhcmVudC5cclxuICAgIHtwcm92aWRlOiBDREtfRFJPUF9MSVNUX0dST1VQLCB1c2VWYWx1ZTogdW5kZWZpbmVkfSxcclxuICAgIHtwcm92aWRlOiBDREtfRFJPUF9MSVNULCB1c2VFeGlzdGluZzogQ2RrRHJvcExpc3R9LFxyXG4gIF0sXHJcbiAgaG9zdDoge1xyXG4gICAgJ2NsYXNzJzogJ2Nkay1kcm9wLWxpc3QnLFxyXG4gICAgJ1thdHRyLmlkXSc6ICdpZCcsXHJcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtZGlzYWJsZWRdJzogJ2Rpc2FibGVkJyxcclxuICAgICdbY2xhc3MuY2RrLWRyb3AtbGlzdC1kcmFnZ2luZ10nOiAnX2Ryb3BMaXN0UmVmLmlzRHJhZ2dpbmcoKScsXHJcbiAgICAnW2NsYXNzLmNkay1kcm9wLWxpc3QtcmVjZWl2aW5nXSc6ICdfZHJvcExpc3RSZWYuaXNSZWNlaXZpbmcoKScsXHJcbiAgfVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrRHJvcExpc3Q8VCA9IGFueT4gaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xyXG4gIC8qKiBFbWl0cyB3aGVuIHRoZSBsaXN0IGhhcyBiZWVuIGRlc3Ryb3llZC4gKi9cclxuICBwcml2YXRlIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgZWxlbWVudCdzIHNjcm9sbGFibGUgcGFyZW50cyBoYXZlIGJlZW4gcmVzb2x2ZWQuICovXHJcbiAgcHJpdmF0ZSBfc2Nyb2xsYWJsZVBhcmVudHNSZXNvbHZlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBkcm9wIGxpc3RzIHRoYXQgYXJlIGN1cnJlbnRseSBvbiB0aGUgcGFnZS4gKi9cclxuICBwcml2YXRlIHN0YXRpYyBfZHJvcExpc3RzOiBDZGtEcm9wTGlzdFtdID0gW107XHJcblxyXG4gIC8qKiBSZWZlcmVuY2UgdG8gdGhlIHVuZGVybHlpbmcgZHJvcCBsaXN0IGluc3RhbmNlLiAqL1xyXG4gIF9kcm9wTGlzdFJlZjogRHJvcExpc3RSZWY8Q2RrRHJvcExpc3Q8VD4+O1xyXG5cclxuICAvKipcclxuICAgKiBPdGhlciBkcmFnZ2FibGUgY29udGFpbmVycyB0aGF0IHRoaXMgY29udGFpbmVyIGlzIGNvbm5lY3RlZCB0byBhbmQgaW50byB3aGljaCB0aGVcclxuICAgKiBjb250YWluZXIncyBpdGVtcyBjYW4gYmUgdHJhbnNmZXJyZWQuIENhbiBlaXRoZXIgYmUgcmVmZXJlbmNlcyB0byBvdGhlciBkcm9wIGNvbnRhaW5lcnMsXHJcbiAgICogb3IgdGhlaXIgdW5pcXVlIElEcy5cclxuICAgKi9cclxuICBASW5wdXQoJ2Nka0Ryb3BMaXN0Q29ubmVjdGVkVG8nKVxyXG4gIGNvbm5lY3RlZFRvOiAoQ2RrRHJvcExpc3QgfCBzdHJpbmcpW10gfCBDZGtEcm9wTGlzdCB8IHN0cmluZyA9IFtdO1xyXG5cclxuICAvKiogQXJiaXRyYXJ5IGRhdGEgdG8gYXR0YWNoIHRvIHRoaXMgY29udGFpbmVyLiAqL1xyXG4gIEBJbnB1dCgnY2RrRHJvcExpc3REYXRhJykgZGF0YTogVDtcclxuXHJcbiAgLyoqIERpcmVjdGlvbiBpbiB3aGljaCB0aGUgbGlzdCBpcyBvcmllbnRlZC4gKi9cclxuICBASW5wdXQoJ2Nka0Ryb3BMaXN0T3JpZW50YXRpb24nKSBvcmllbnRhdGlvbjogRHJvcExpc3RPcmllbnRhdGlvbjtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5pcXVlIElEIGZvciB0aGUgZHJvcCB6b25lLiBDYW4gYmUgdXNlZCBhcyBhIHJlZmVyZW5jZVxyXG4gICAqIGluIHRoZSBgY29ubmVjdGVkVG9gIG9mIGFub3RoZXIgYENka0Ryb3BMaXN0YC5cclxuICAgKi9cclxuICBASW5wdXQoKSBpZDogc3RyaW5nID0gYGNkay1kcm9wLWxpc3QtJHtfdW5pcXVlSWRDb3VudGVyKyt9YDtcclxuXHJcbiAgLyoqIExvY2tzIHRoZSBwb3NpdGlvbiBvZiB0aGUgZHJhZ2dhYmxlIGVsZW1lbnRzIGluc2lkZSB0aGUgY29udGFpbmVyIGFsb25nIHRoZSBzcGVjaWZpZWQgYXhpcy4gKi9cclxuICBASW5wdXQoJ2Nka0Ryb3BMaXN0TG9ja0F4aXMnKSBsb2NrQXhpczogRHJhZ0F4aXM7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHN0YXJ0aW5nIGEgZHJhZ2dpbmcgc2VxdWVuY2UgZnJvbSB0aGlzIGNvbnRhaW5lciBpcyBkaXNhYmxlZC4gKi9cclxuICBASW5wdXQoJ2Nka0Ryb3BMaXN0RGlzYWJsZWQnKVxyXG4gIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZCB8fCAoISF0aGlzLl9ncm91cCAmJiB0aGlzLl9ncm91cC5kaXNhYmxlZCk7XHJcbiAgfVxyXG4gIHNldCBkaXNhYmxlZCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgLy8gVXN1YWxseSB3ZSBzeW5jIHRoZSBkaXJlY3RpdmUgYW5kIHJlZiBzdGF0ZSByaWdodCBiZWZvcmUgZHJhZ2dpbmcgc3RhcnRzLCBpbiBvcmRlciB0byBoYXZlXHJcbiAgICAvLyBhIHNpbmdsZSBwb2ludCBvZiBmYWlsdXJlIGFuZCB0byBhdm9pZCBoYXZpbmcgdG8gdXNlIHNldHRlcnMgZm9yIGV2ZXJ5dGhpbmcuIGBkaXNhYmxlZGAgaXNcclxuICAgIC8vIGEgc3BlY2lhbCBjYXNlLCBiZWNhdXNlIGl0IGNhbiBwcmV2ZW50IHRoZSBgYmVmb3JlU3RhcnRlZGAgZXZlbnQgZnJvbSBmaXJpbmcsIHdoaWNoIGNhbiBsb2NrXHJcbiAgICAvLyB0aGUgdXNlciBpbiBhIGRpc2FibGVkIHN0YXRlLCBzbyB3ZSBhbHNvIG5lZWQgdG8gc3luYyBpdCBhcyBpdCdzIGJlaW5nIHNldC5cclxuICAgIHRoaXMuX2Ryb3BMaXN0UmVmLmRpc2FibGVkID0gdGhpcy5fZGlzYWJsZWQgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBwcml2YXRlIF9kaXNhYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgc29ydGluZyB3aXRoaW4gdGhpcyBkcm9wIGxpc3QgaXMgZGlzYWJsZWQuICovXHJcbiAgQElucHV0KCdjZGtEcm9wTGlzdFNvcnRpbmdEaXNhYmxlZCcpXHJcbiAgc29ydGluZ0Rpc2FibGVkOiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYW4gaXRlbVxyXG4gICAqIGlzIGFsbG93ZWQgdG8gYmUgbW92ZWQgaW50byBhIGRyb3AgY29udGFpbmVyLlxyXG4gICAqL1xyXG4gIEBJbnB1dCgnY2RrRHJvcExpc3RFbnRlclByZWRpY2F0ZScpXHJcbiAgZW50ZXJQcmVkaWNhdGU6IChkcmFnOiBDZGtEcmFnLCBkcm9wOiBDZGtEcm9wTGlzdCkgPT4gYm9vbGVhbiA9ICgpID0+IHRydWVcclxuXHJcbiAgLyoqIEZ1bmN0aW9ucyB0aGF0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYW4gaXRlbSBjYW4gYmUgc29ydGVkIGludG8gYSBwYXJ0aWN1bGFyIGluZGV4LiAqL1xyXG4gIEBJbnB1dCgnY2RrRHJvcExpc3RTb3J0UHJlZGljYXRlJylcclxuICBzb3J0UHJlZGljYXRlOiAoaW5kZXg6IG51bWJlciwgZHJhZzogQ2RrRHJhZywgZHJvcDogQ2RrRHJvcExpc3QpID0+IGJvb2xlYW4gPSAoKSA9PiB0cnVlXHJcblxyXG4gIC8qKiBXaGV0aGVyIHRvIGF1dG8tc2Nyb2xsIHRoZSB2aWV3IHdoZW4gdGhlIHVzZXIgbW92ZXMgdGhlaXIgcG9pbnRlciBjbG9zZSB0byB0aGUgZWRnZXMuICovXHJcbiAgQElucHV0KCdjZGtEcm9wTGlzdEF1dG9TY3JvbGxEaXNhYmxlZCcpXHJcbiAgYXV0b1Njcm9sbERpc2FibGVkOiBib29sZWFuO1xyXG5cclxuICAvKiogTnVtYmVyIG9mIHBpeGVscyB0byBzY3JvbGwgZm9yIGVhY2ggZnJhbWUgd2hlbiBhdXRvLXNjcm9sbGluZyBhbiBlbGVtZW50LiAqL1xyXG4gIEBJbnB1dCgnY2RrRHJvcExpc3RBdXRvU2Nyb2xsU3RlcCcpXHJcbiAgYXV0b1Njcm9sbFN0ZXA6IG51bWJlcjtcclxuXHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIHVzZXIgZHJvcHMgYW4gaXRlbSBpbnNpZGUgdGhlIGNvbnRhaW5lci4gKi9cclxuICBAT3V0cHV0KCdjZGtEcm9wTGlzdERyb3BwZWQnKVxyXG4gIGRyb3BwZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRHJvcDxULCBhbnk+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0Ryb3A8VCwgYW55Pj4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdHMgd2hlbiB0aGUgdXNlciBoYXMgbW92ZWQgYSBuZXcgZHJhZyBpdGVtIGludG8gdGhpcyBjb250YWluZXIuXHJcbiAgICovXHJcbiAgQE91dHB1dCgnY2RrRHJvcExpc3RFbnRlcmVkJylcclxuICBlbnRlcmVkOiBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VudGVyPFQ+PiA9IG5ldyBFdmVudEVtaXR0ZXI8Q2RrRHJhZ0VudGVyPFQ+PigpO1xyXG5cclxuICAvKipcclxuICAgKiBFbWl0cyB3aGVuIHRoZSB1c2VyIHJlbW92ZXMgYW4gaXRlbSBmcm9tIHRoZSBjb250YWluZXJcclxuICAgKiBieSBkcmFnZ2luZyBpdCBpbnRvIGFub3RoZXIgY29udGFpbmVyLlxyXG4gICAqL1xyXG4gIEBPdXRwdXQoJ2Nka0Ryb3BMaXN0RXhpdGVkJylcclxuICBleGl0ZWQ6IEV2ZW50RW1pdHRlcjxDZGtEcmFnRXhpdDxUPj4gPSBuZXcgRXZlbnRFbWl0dGVyPENka0RyYWdFeGl0PFQ+PigpO1xyXG5cclxuICAvKiogRW1pdHMgYXMgdGhlIHVzZXIgaXMgc3dhcHBpbmcgaXRlbXMgd2hpbGUgYWN0aXZlbHkgZHJhZ2dpbmcuICovXHJcbiAgQE91dHB1dCgnY2RrRHJvcExpc3RTb3J0ZWQnKVxyXG4gIHNvcnRlZDogRXZlbnRFbWl0dGVyPENka0RyYWdTb3J0RXZlbnQ8VD4+ID0gbmV3IEV2ZW50RW1pdHRlcjxDZGtEcmFnU29ydEV2ZW50PFQ+PigpO1xyXG5cclxuICAvKipcclxuICAgKiBLZWVwcyB0cmFjayBvZiB0aGUgaXRlbXMgdGhhdCBhcmUgcmVnaXN0ZXJlZCB3aXRoIHRoaXMgY29udGFpbmVyLiBIaXN0b3JpY2FsbHkgd2UgdXNlZCB0b1xyXG4gICAqIGRvIHRoaXMgd2l0aCBhIGBDb250ZW50Q2hpbGRyZW5gIHF1ZXJ5LCBob3dldmVyIHF1ZXJpZXMgZG9uJ3QgaGFuZGxlIHRyYW5zcGxhbnRlZCB2aWV3cyB2ZXJ5XHJcbiAgICogd2VsbCB3aGljaCBtZWFucyB0aGF0IHdlIGNhbid0IGhhbmRsZSBjYXNlcyBsaWtlIGRyYWdnaW5nIHRoZSBoZWFkZXJzIG9mIGEgYG1hdC10YWJsZWBcclxuICAgKiBjb3JyZWN0bHkuIFdoYXQgd2UgZG8gaW5zdGVhZCBpcyB0byBoYXZlIHRoZSBpdGVtcyByZWdpc3RlciB0aGVtc2VsdmVzIHdpdGggdGhlIGNvbnRhaW5lclxyXG4gICAqIGFuZCB0aGVuIHdlIHNvcnQgdGhlbSBiYXNlZCBvbiB0aGVpciBwb3NpdGlvbiBpbiB0aGUgRE9NLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgX3Vuc29ydGVkSXRlbXMgPSBuZXcgU2V0PENka0RyYWc+KCk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICAvKiogRWxlbWVudCB0aGF0IHRoZSBkcm9wIGxpc3QgaXMgYXR0YWNoZWQgdG8uICovXHJcbiAgICAgIHB1YmxpYyBlbGVtZW50OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgZHJhZ0Ryb3A6IERyYWdEcm9wLFxyXG4gICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICAgIHByaXZhdGUgX3Njcm9sbERpc3BhdGNoZXI6IFNjcm9sbERpc3BhdGNoZXIsXHJcbiAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgX2Rpcj86IERpcmVjdGlvbmFsaXR5LFxyXG4gICAgICBAT3B0aW9uYWwoKSBASW5qZWN0KENES19EUk9QX0xJU1RfR1JPVVApIEBTa2lwU2VsZigpXHJcbiAgICAgIHByaXZhdGUgX2dyb3VwPzogQ2RrRHJvcExpc3RHcm91cDxDZGtEcm9wTGlzdD4sXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ0RLX0RSQUdfQ09ORklHKSBjb25maWc/OiBEcmFnRHJvcENvbmZpZykge1xyXG5cclxuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcclxuICAgICAgYXNzZXJ0RWxlbWVudE5vZGUoZWxlbWVudC5uYXRpdmVFbGVtZW50LCAnY2RrRHJvcExpc3QnKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9kcm9wTGlzdFJlZiA9IGRyYWdEcm9wLmNyZWF0ZURyb3BMaXN0KGVsZW1lbnQpO1xyXG4gICAgdGhpcy5fZHJvcExpc3RSZWYuZGF0YSA9IHRoaXM7XHJcblxyXG4gICAgaWYgKGNvbmZpZykge1xyXG4gICAgICB0aGlzLl9hc3NpZ25EZWZhdWx0cyhjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2Ryb3BMaXN0UmVmLmVudGVyUHJlZGljYXRlID0gKGRyYWc6IERyYWdSZWY8Q2RrRHJhZz4sIGRyb3A6IERyb3BMaXN0UmVmPENka0Ryb3BMaXN0PikgPT4ge1xyXG4gICAgICByZXR1cm4gdGhpcy5lbnRlclByZWRpY2F0ZShkcmFnLmRhdGEsIGRyb3AuZGF0YSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2Ryb3BMaXN0UmVmLnNvcnRQcmVkaWNhdGUgPVxyXG4gICAgICAoaW5kZXg6IG51bWJlciwgZHJhZzogRHJhZ1JlZjxDZGtEcmFnPiwgZHJvcDogRHJvcExpc3RSZWY8Q2RrRHJvcExpc3Q+KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc29ydFByZWRpY2F0ZShpbmRleCwgZHJhZy5kYXRhLCBkcm9wLmRhdGEpO1xyXG4gICAgICB9O1xyXG5cclxuICAgIHRoaXMuX3NldHVwSW5wdXRTeW5jU3Vic2NyaXB0aW9uKHRoaXMuX2Ryb3BMaXN0UmVmKTtcclxuICAgIHRoaXMuX2hhbmRsZUV2ZW50cyh0aGlzLl9kcm9wTGlzdFJlZik7XHJcbiAgICBDZGtEcm9wTGlzdC5fZHJvcExpc3RzLnB1c2godGhpcyk7XHJcblxyXG4gICAgaWYgKF9ncm91cCkge1xyXG4gICAgICBfZ3JvdXAuX2l0ZW1zLmFkZCh0aGlzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBSZWdpc3RlcnMgYW4gaXRlbXMgd2l0aCB0aGUgZHJvcCBsaXN0LiAqL1xyXG4gIGFkZEl0ZW0oaXRlbTogQ2RrRHJhZyk6IHZvaWQge1xyXG4gICAgdGhpcy5fdW5zb3J0ZWRJdGVtcy5hZGQoaXRlbSk7XHJcblxyXG4gICAgaWYgKHRoaXMuX2Ryb3BMaXN0UmVmLmlzRHJhZ2dpbmcoKSkge1xyXG4gICAgICB0aGlzLl9zeW5jSXRlbXNXaXRoUmVmKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogUmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhlIGRyb3AgbGlzdC4gKi9cclxuICByZW1vdmVJdGVtKGl0ZW06IENka0RyYWcpOiB2b2lkIHtcclxuICAgIHRoaXMuX3Vuc29ydGVkSXRlbXMuZGVsZXRlKGl0ZW0pO1xyXG5cclxuICAgIGlmICh0aGlzLl9kcm9wTGlzdFJlZi5pc0RyYWdnaW5nKCkpIHtcclxuICAgICAgdGhpcy5fc3luY0l0ZW1zV2l0aFJlZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIEdldHMgdGhlIHJlZ2lzdGVyZWQgaXRlbXMgaW4gdGhlIGxpc3QsIHNvcnRlZCBieSB0aGVpciBwb3NpdGlvbiBpbiB0aGUgRE9NLiAqL1xyXG4gIGdldFNvcnRlZEl0ZW1zKCk6IENka0RyYWdbXSB7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl91bnNvcnRlZEl0ZW1zKS5zb3J0KChhOiBDZGtEcmFnLCBiOiBDZGtEcmFnKSA9PiB7XHJcbiAgICAgIGNvbnN0IGRvY3VtZW50UG9zaXRpb24gPVxyXG4gICAgICAgICAgYS5fZHJhZ1JlZi5nZXRWaXNpYmxlRWxlbWVudCgpLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIuX2RyYWdSZWYuZ2V0VmlzaWJsZUVsZW1lbnQoKSk7XHJcblxyXG4gICAgICAvLyBgY29tcGFyZURvY3VtZW50UG9zaXRpb25gIHJldHVybnMgYSBiaXRtYXNrIHNvIHdlIGhhdmUgdG8gdXNlIGEgYml0d2lzZSBvcGVyYXRvci5cclxuICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL05vZGUvY29tcGFyZURvY3VtZW50UG9zaXRpb25cclxuICAgICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWJpdHdpc2VcclxuICAgICAgcmV0dXJuIGRvY3VtZW50UG9zaXRpb24gJiBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0ZPTExPV0lORyA/IC0xIDogMTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IENka0Ryb3BMaXN0Ll9kcm9wTGlzdHMuaW5kZXhPZih0aGlzKTtcclxuXHJcbiAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICBDZGtEcm9wTGlzdC5fZHJvcExpc3RzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2dyb3VwKSB7XHJcbiAgICAgIHRoaXMuX2dyb3VwLl9pdGVtcy5kZWxldGUodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdW5zb3J0ZWRJdGVtcy5jbGVhcigpO1xyXG4gICAgdGhpcy5fZHJvcExpc3RSZWYuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFN5bmNzIHRoZSBpbnB1dHMgb2YgdGhlIENka0Ryb3BMaXN0IHdpdGggdGhlIG9wdGlvbnMgb2YgdGhlIHVuZGVybHlpbmcgRHJvcExpc3RSZWYuICovXHJcbiAgcHJpdmF0ZSBfc2V0dXBJbnB1dFN5bmNTdWJzY3JpcHRpb24ocmVmOiBEcm9wTGlzdFJlZjxDZGtEcm9wTGlzdD4pIHtcclxuICAgIGlmICh0aGlzLl9kaXIpIHtcclxuICAgICAgdGhpcy5fZGlyLmNoYW5nZVxyXG4gICAgICAgIC5waXBlKHN0YXJ0V2l0aCh0aGlzLl9kaXIudmFsdWUpLCB0YWtlVW50aWwodGhpcy5fZGVzdHJveWVkKSlcclxuICAgICAgICAuc3Vic2NyaWJlKHZhbHVlID0+IHJlZi53aXRoRGlyZWN0aW9uKHZhbHVlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVmLmJlZm9yZVN0YXJ0ZWQuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgY29uc3Qgc2libGluZ3MgPSBjb2VyY2VBcnJheSh0aGlzLmNvbm5lY3RlZFRvKS5tYXAoZHJvcCA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBkcm9wID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgY29uc3QgY29ycmVzcG9uZGluZ0Ryb3BMaXN0ID0gQ2RrRHJvcExpc3QuX2Ryb3BMaXN0cy5maW5kKGxpc3QgPT4gbGlzdC5pZCA9PT0gZHJvcCk7XHJcblxyXG4gICAgICAgICAgaWYgKCFjb3JyZXNwb25kaW5nRHJvcExpc3QgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBDZGtEcm9wTGlzdCBjb3VsZCBub3QgZmluZCBjb25uZWN0ZWQgZHJvcCBsaXN0IHdpdGggaWQgXCIke2Ryb3B9XCJgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gY29ycmVzcG9uZGluZ0Ryb3BMaXN0ITtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkcm9wO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9ncm91cCkge1xyXG4gICAgICAgIHRoaXMuX2dyb3VwLl9pdGVtcy5mb3JFYWNoKGRyb3AgPT4ge1xyXG4gICAgICAgICAgaWYgKHNpYmxpbmdzLmluZGV4T2YoZHJvcCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHNpYmxpbmdzLnB1c2goZHJvcCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vdGUgdGhhdCB3ZSByZXNvbHZlIHRoZSBzY3JvbGxhYmxlIHBhcmVudHMgaGVyZSBzbyB0aGF0IHdlIGRlbGF5IHRoZSByZXNvbHV0aW9uXHJcbiAgICAgIC8vIGFzIGxvbmcgYXMgcG9zc2libGUsIGVuc3VyaW5nIHRoYXQgdGhlIGVsZW1lbnQgaXMgaW4gaXRzIGZpbmFsIHBsYWNlIGluIHRoZSBET00uXHJcbiAgICAgIGlmICghdGhpcy5fc2Nyb2xsYWJsZVBhcmVudHNSZXNvbHZlZCkge1xyXG4gICAgICAgIGNvbnN0IHNjcm9sbGFibGVQYXJlbnRzID0gdGhpcy5fc2Nyb2xsRGlzcGF0Y2hlclxyXG4gICAgICAgICAgLmdldEFuY2VzdG9yU2Nyb2xsQ29udGFpbmVycyh0aGlzLmVsZW1lbnQpXHJcbiAgICAgICAgICAubWFwKHNjcm9sbGFibGUgPT4gc2Nyb2xsYWJsZS5nZXRFbGVtZW50UmVmKCkubmF0aXZlRWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5fZHJvcExpc3RSZWYud2l0aFNjcm9sbGFibGVQYXJlbnRzKHNjcm9sbGFibGVQYXJlbnRzKTtcclxuXHJcbiAgICAgICAgLy8gT25seSBkbyB0aGlzIG9uY2Ugc2luY2UgaXQgaW52b2x2ZXMgdHJhdmVyc2luZyB0aGUgRE9NIGFuZCB0aGUgcGFyZW50c1xyXG4gICAgICAgIC8vIHNob3VsZG4ndCBiZSBhYmxlIHRvIGNoYW5nZSB3aXRob3V0IHRoZSBkcm9wIGxpc3QgYmVpbmcgZGVzdHJveWVkLlxyXG4gICAgICAgIHRoaXMuX3Njcm9sbGFibGVQYXJlbnRzUmVzb2x2ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZWYuZGlzYWJsZWQgPSB0aGlzLmRpc2FibGVkO1xyXG4gICAgICByZWYubG9ja0F4aXMgPSB0aGlzLmxvY2tBeGlzO1xyXG4gICAgICByZWYuc29ydGluZ0Rpc2FibGVkID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHRoaXMuc29ydGluZ0Rpc2FibGVkKTtcclxuICAgICAgcmVmLmF1dG9TY3JvbGxEaXNhYmxlZCA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh0aGlzLmF1dG9TY3JvbGxEaXNhYmxlZCk7XHJcbiAgICAgIHJlZi5hdXRvU2Nyb2xsU3RlcCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHRoaXMuYXV0b1Njcm9sbFN0ZXAsIDIpO1xyXG4gICAgICByZWZcclxuICAgICAgICAuY29ubmVjdGVkVG8oc2libGluZ3MuZmlsdGVyKGRyb3AgPT4gZHJvcCAmJiBkcm9wICE9PSB0aGlzKS5tYXAobGlzdCA9PiBsaXN0Ll9kcm9wTGlzdFJlZikpXHJcbiAgICAgICAgLndpdGhPcmllbnRhdGlvbih0aGlzLm9yaWVudGF0aW9uKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIEhhbmRsZXMgZXZlbnRzIGZyb20gdGhlIHVuZGVybHlpbmcgRHJvcExpc3RSZWYuICovXHJcbiAgcHJpdmF0ZSBfaGFuZGxlRXZlbnRzKHJlZjogRHJvcExpc3RSZWY8Q2RrRHJvcExpc3Q+KSB7XHJcbiAgICByZWYuYmVmb3JlU3RhcnRlZC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLl9zeW5jSXRlbXNXaXRoUmVmKCk7XHJcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVmLmVudGVyZWQuc3Vic2NyaWJlKGV2ZW50ID0+IHtcclxuICAgICAgdGhpcy5lbnRlcmVkLmVtaXQoe1xyXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcyxcclxuICAgICAgICBpdGVtOiBldmVudC5pdGVtLmRhdGEsXHJcbiAgICAgICAgY3VycmVudEluZGV4OiBldmVudC5jdXJyZW50SW5kZXhcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZWYuZXhpdGVkLnN1YnNjcmliZShldmVudCA9PiB7XHJcbiAgICAgIHRoaXMuZXhpdGVkLmVtaXQoe1xyXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcyxcclxuICAgICAgICBpdGVtOiBldmVudC5pdGVtLmRhdGFcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVmLnNvcnRlZC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xyXG4gICAgICB0aGlzLnNvcnRlZC5lbWl0KHtcclxuICAgICAgICBwcmV2aW91c0luZGV4OiBldmVudC5wcmV2aW91c0luZGV4LFxyXG4gICAgICAgIGN1cnJlbnRJbmRleDogZXZlbnQuY3VycmVudEluZGV4LFxyXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcyxcclxuICAgICAgICBpdGVtOiBldmVudC5pdGVtLmRhdGFcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZWYuZHJvcHBlZC5zdWJzY3JpYmUoZXZlbnQgPT4ge1xyXG4gICAgICB0aGlzLmRyb3BwZWQuZW1pdCh7XHJcbiAgICAgICAgcHJldmlvdXNJbmRleDogZXZlbnQucHJldmlvdXNJbmRleCxcclxuICAgICAgICBjdXJyZW50SW5kZXg6IGV2ZW50LmN1cnJlbnRJbmRleCxcclxuICAgICAgICBwcmV2aW91c0NvbnRhaW5lcjogZXZlbnQucHJldmlvdXNDb250YWluZXIuZGF0YSxcclxuICAgICAgICBjb250YWluZXI6IGV2ZW50LmNvbnRhaW5lci5kYXRhLFxyXG4gICAgICAgIGl0ZW06IGV2ZW50Lml0ZW0uZGF0YSxcclxuICAgICAgICBpc1BvaW50ZXJPdmVyQ29udGFpbmVyOiBldmVudC5pc1BvaW50ZXJPdmVyQ29udGFpbmVyLFxyXG4gICAgICAgIGRpc3RhbmNlOiBldmVudC5kaXN0YW5jZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIE1hcmsgZm9yIGNoZWNrIHNpbmNlIGFsbCBvZiB0aGVzZSBldmVudHMgcnVuIG91dHNpZGUgb2YgY2hhbmdlXHJcbiAgICAgIC8vIGRldGVjdGlvbiBhbmQgd2UncmUgbm90IGd1YXJhbnRlZWQgZm9yIHNvbWV0aGluZyBlbHNlIHRvIGhhdmUgdHJpZ2dlcmVkIGl0LlxyXG4gICAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIEFzc2lnbnMgdGhlIGRlZmF1bHQgaW5wdXQgdmFsdWVzIGJhc2VkIG9uIGEgcHJvdmlkZWQgY29uZmlnIG9iamVjdC4gKi9cclxuICBwcml2YXRlIF9hc3NpZ25EZWZhdWx0cyhjb25maWc6IERyYWdEcm9wQ29uZmlnKSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGxvY2tBeGlzLCBkcmFnZ2luZ0Rpc2FibGVkLCBzb3J0aW5nRGlzYWJsZWQsIGxpc3RBdXRvU2Nyb2xsRGlzYWJsZWQsIGxpc3RPcmllbnRhdGlvblxyXG4gICAgfSA9IGNvbmZpZztcclxuXHJcbiAgICB0aGlzLmRpc2FibGVkID0gZHJhZ2dpbmdEaXNhYmxlZCA9PSBudWxsID8gZmFsc2UgOiBkcmFnZ2luZ0Rpc2FibGVkO1xyXG4gICAgdGhpcy5zb3J0aW5nRGlzYWJsZWQgPSBzb3J0aW5nRGlzYWJsZWQgPT0gbnVsbCA/IGZhbHNlIDogc29ydGluZ0Rpc2FibGVkO1xyXG4gICAgdGhpcy5hdXRvU2Nyb2xsRGlzYWJsZWQgPSBsaXN0QXV0b1Njcm9sbERpc2FibGVkID09IG51bGwgPyBmYWxzZSA6IGxpc3RBdXRvU2Nyb2xsRGlzYWJsZWQ7XHJcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gbGlzdE9yaWVudGF0aW9uIHx8ICd2ZXJ0aWNhbCc7XHJcblxyXG4gICAgaWYgKGxvY2tBeGlzKSB7XHJcbiAgICAgIHRoaXMubG9ja0F4aXMgPSBsb2NrQXhpcztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBTeW5jcyB1cCB0aGUgcmVnaXN0ZXJlZCBkcmFnIGl0ZW1zIHdpdGggdW5kZXJseWluZyBkcm9wIGxpc3QgcmVmLiAqL1xyXG4gIHByaXZhdGUgX3N5bmNJdGVtc1dpdGhSZWYoKSB7XHJcbiAgICB0aGlzLl9kcm9wTGlzdFJlZi53aXRoSXRlbXModGhpcy5nZXRTb3J0ZWRJdGVtcygpLm1hcChpdGVtID0+IGl0ZW0uX2RyYWdSZWYpKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9kaXNhYmxlZDogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zb3J0aW5nRGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfYXV0b1Njcm9sbERpc2FibGVkOiBCb29sZWFuSW5wdXQ7XHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX2F1dG9TY3JvbGxTdGVwOiBOdW1iZXJJbnB1dDtcclxufVxyXG4iXX0=