/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { QueryList } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, TAB, A, Z, ZERO, NINE, hasModifierKey, HOME, END, } from '@angular/cdk/keycodes';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager {
    constructor(_items) {
        this._items = _items;
        this._activeItemIndex = -1;
        this._activeItem = null;
        this._wrap = false;
        this._letterKeyStream = new Subject();
        this._typeaheadSubscription = Subscription.EMPTY;
        this._vertical = true;
        this._allowedModifierKeys = [];
        this._homeAndEnd = false;
        /**
         * Predicate function that can be used to check whether an item should be skipped
         * by the key manager. By default, disabled items are skipped.
         */
        this._skipPredicateFn = (item) => item.disabled;
        // Buffer for the letters that the user has pressed when the typeahead option is turned on.
        this._pressedLetters = [];
        /**
         * Stream that emits any time the TAB key is pressed, so components can react
         * when focus is shifted off of the list.
         */
        this.tabOut = new Subject();
        /** Stream that emits whenever the active item of the list manager changes. */
        this.change = new Subject();
        // We allow for the items to be an array because, in some cases, the consumer may
        // not have access to a QueryList of the items they want to manage (e.g. when the
        // items aren't being collected via `ViewChildren` or `ContentChildren`).
        if (_items instanceof QueryList) {
            _items.changes.subscribe((newItems) => {
                if (this._activeItem) {
                    const itemArray = newItems.toArray();
                    const newIndex = itemArray.indexOf(this._activeItem);
                    if (newIndex > -1 && newIndex !== this._activeItemIndex) {
                        this._activeItemIndex = newIndex;
                    }
                }
            });
        }
    }
    /**
     * Sets the predicate function that determines which items should be skipped by the
     * list key manager.
     * @param predicate Function that determines whether the given item should be skipped.
     */
    skipPredicate(predicate) {
        this._skipPredicateFn = predicate;
        return this;
    }
    /**
     * Configures wrapping mode, which determines whether the active item will wrap to
     * the other end of list when there are no more items in the given direction.
     * @param shouldWrap Whether the list should wrap when reaching the end.
     */
    withWrap(shouldWrap = true) {
        this._wrap = shouldWrap;
        return this;
    }
    /**
     * Configures whether the key manager should be able to move the selection vertically.
     * @param enabled Whether vertical selection should be enabled.
     */
    withVerticalOrientation(enabled = true) {
        this._vertical = enabled;
        return this;
    }
    /**
     * Configures the key manager to move the selection horizontally.
     * Passing in `null` will disable horizontal movement.
     * @param direction Direction in which the selection can be moved.
     */
    withHorizontalOrientation(direction) {
        this._horizontal = direction;
        return this;
    }
    /**
     * Modifier keys which are allowed to be held down and whose default actions will be prevented
     * as the user is pressing the arrow keys. Defaults to not allowing any modifier keys.
     */
    withAllowedModifierKeys(keys) {
        this._allowedModifierKeys = keys;
        return this;
    }
    /**
     * Turns on typeahead mode which allows users to set the active item by typing.
     * @param debounceInterval Time to wait after the last keystroke before setting the active item.
     */
    withTypeAhead(debounceInterval = 200) {
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && (this._items.length &&
            this._items.some(item => typeof item.getLabel !== 'function'))) {
            throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
        }
        this._typeaheadSubscription.unsubscribe();
        // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
        // and convert those letters back into a string. Afterwards find the first item that starts
        // with that string and select it.
        this._typeaheadSubscription = this._letterKeyStream.pipe(tap(letter => this._pressedLetters.push(letter)), debounceTime(debounceInterval), filter(() => this._pressedLetters.length > 0), map(() => this._pressedLetters.join(''))).subscribe(inputString => {
            const items = this._getItemsArray();
            // Start at 1 because we want to start searching at the item immediately
            // following the current active item.
            for (let i = 1; i < items.length + 1; i++) {
                const index = (this._activeItemIndex + i) % items.length;
                const item = items[index];
                if (!this._skipPredicateFn(item) &&
                    item.getLabel().toUpperCase().trim().indexOf(inputString) === 0) {
                    this.setActiveItem(index);
                    break;
                }
            }
            this._pressedLetters = [];
        });
        return this;
    }
    /**
     * Configures the key manager to activate the first and last items
     * respectively when the Home or End key is pressed.
     * @param enabled Whether pressing the Home or End key activates the first/last item.
     */
    withHomeAndEnd(enabled = true) {
        this._homeAndEnd = enabled;
        return this;
    }
    setActiveItem(item) {
        const previousActiveItem = this._activeItem;
        this.updateActiveItem(item);
        if (this._activeItem !== previousActiveItem) {
            this.change.next(this._activeItemIndex);
        }
    }
    /**
     * Sets the active item depending on the key event passed in.
     * @param event Keyboard event to be used for determining which element should be active.
     */
    onKeydown(event) {
        const keyCode = event.keyCode;
        const modifiers = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];
        const isModifierAllowed = modifiers.every(modifier => {
            return !event[modifier] || this._allowedModifierKeys.indexOf(modifier) > -1;
        });
        switch (keyCode) {
            case TAB:
                this.tabOut.next();
                return;
            case DOWN_ARROW:
                if (this._vertical && isModifierAllowed) {
                    this.setNextItemActive();
                    break;
                }
                else {
                    return;
                }
            case UP_ARROW:
                if (this._vertical && isModifierAllowed) {
                    this.setPreviousItemActive();
                    break;
                }
                else {
                    return;
                }
            case RIGHT_ARROW:
                if (this._horizontal && isModifierAllowed) {
                    this._horizontal === 'rtl' ? this.setPreviousItemActive() : this.setNextItemActive();
                    break;
                }
                else {
                    return;
                }
            case LEFT_ARROW:
                if (this._horizontal && isModifierAllowed) {
                    this._horizontal === 'rtl' ? this.setNextItemActive() : this.setPreviousItemActive();
                    break;
                }
                else {
                    return;
                }
            case HOME:
                if (this._homeAndEnd && isModifierAllowed) {
                    this.setFirstItemActive();
                    break;
                }
                else {
                    return;
                }
            case END:
                if (this._homeAndEnd && isModifierAllowed) {
                    this.setLastItemActive();
                    break;
                }
                else {
                    return;
                }
            default:
                if (isModifierAllowed || hasModifierKey(event, 'shiftKey')) {
                    // Attempt to use the `event.key` which also maps it to the user's keyboard language,
                    // otherwise fall back to resolving alphanumeric characters via the keyCode.
                    if (event.key && event.key.length === 1) {
                        this._letterKeyStream.next(event.key.toLocaleUpperCase());
                    }
                    else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
                        this._letterKeyStream.next(String.fromCharCode(keyCode));
                    }
                }
                // Note that we return here, in order to avoid preventing
                // the default action of non-navigational keys.
                return;
        }
        this._pressedLetters = [];
        event.preventDefault();
    }
    /** Index of the currently active item. */
    get activeItemIndex() {
        return this._activeItemIndex;
    }
    /** The active item. */
    get activeItem() {
        return this._activeItem;
    }
    /** Gets whether the user is currently typing into the manager using the typeahead feature. */
    isTyping() {
        return this._pressedLetters.length > 0;
    }
    /** Sets the active item to the first enabled item in the list. */
    setFirstItemActive() {
        this._setActiveItemByIndex(0, 1);
    }
    /** Sets the active item to the last enabled item in the list. */
    setLastItemActive() {
        this._setActiveItemByIndex(this._items.length - 1, -1);
    }
    /** Sets the active item to the next enabled item in the list. */
    setNextItemActive() {
        this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
    }
    /** Sets the active item to a previous enabled item in the list. */
    setPreviousItemActive() {
        this._activeItemIndex < 0 && this._wrap ? this.setLastItemActive()
            : this._setActiveItemByDelta(-1);
    }
    updateActiveItem(item) {
        const itemArray = this._getItemsArray();
        const index = typeof item === 'number' ? item : itemArray.indexOf(item);
        const activeItem = itemArray[index];
        // Explicitly check for `null` and `undefined` because other falsy values are valid.
        this._activeItem = activeItem == null ? null : activeItem;
        this._activeItemIndex = index;
    }
    /**
     * This method sets the active item, given a list of items and the delta between the
     * currently active item and the new active item. It will calculate differently
     * depending on whether wrap mode is turned on.
     */
    _setActiveItemByDelta(delta) {
        this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
    }
    /**
     * Sets the active item properly given "wrap" mode. In other words, it will continue to move
     * down the list until it finds an item that is not disabled, and it will wrap if it
     * encounters either end of the list.
     */
    _setActiveInWrapMode(delta) {
        const items = this._getItemsArray();
        for (let i = 1; i <= items.length; i++) {
            const index = (this._activeItemIndex + (delta * i) + items.length) % items.length;
            const item = items[index];
            if (!this._skipPredicateFn(item)) {
                this.setActiveItem(index);
                return;
            }
        }
    }
    /**
     * Sets the active item properly given the default mode. In other words, it will
     * continue to move down the list until it finds an item that is not disabled. If
     * it encounters either end of the list, it will stop and not wrap.
     */
    _setActiveInDefaultMode(delta) {
        this._setActiveItemByIndex(this._activeItemIndex + delta, delta);
    }
    /**
     * Sets the active item to the first enabled item starting at the index specified. If the
     * item is disabled, it will move in the fallbackDelta direction until it either
     * finds an enabled item or encounters the end of the list.
     */
    _setActiveItemByIndex(index, fallbackDelta) {
        const items = this._getItemsArray();
        if (!items[index]) {
            return;
        }
        while (this._skipPredicateFn(items[index])) {
            index += fallbackDelta;
            if (!items[index]) {
                return;
            }
        }
        this.setActiveItem(index);
    }
    /** Returns the items as an array. */
    _getItemsArray() {
        return this._items instanceof QueryList ? this._items.toArray() : this._items;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1rZXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9rZXktbWFuYWdlci9saXN0LWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEMsT0FBTyxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDM0MsT0FBTyxFQUNMLFFBQVEsRUFDUixVQUFVLEVBQ1YsVUFBVSxFQUNWLFdBQVcsRUFDWCxHQUFHLEVBQ0gsQ0FBQyxFQUNELENBQUMsRUFDRCxJQUFJLEVBQ0osSUFBSSxFQUNKLGNBQWMsRUFDZCxJQUFJLEVBQ0osR0FBRyxHQUNKLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBYzlEOzs7R0FHRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBb0J6QixZQUFvQixNQUEwQjtRQUExQixXQUFNLEdBQU4sTUFBTSxDQUFvQjtRQW5CdEMscUJBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEIsZ0JBQVcsR0FBYSxJQUFJLENBQUM7UUFDN0IsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLHFCQUFnQixHQUFHLElBQUksT0FBTyxFQUFVLENBQUM7UUFDekMsMkJBQXNCLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUM1QyxjQUFTLEdBQUcsSUFBSSxDQUFDO1FBRWpCLHlCQUFvQixHQUFnQyxFQUFFLENBQUM7UUFDdkQsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFFNUI7OztXQUdHO1FBQ0sscUJBQWdCLEdBQUcsQ0FBQyxJQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFdEQsMkZB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O1lBRTFCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLE9BQU87YUFDUjtTQUNGO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyx1QkFBdUIsQ0FBQyxLQUFhO1FBQzNDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRDs7OztPQUlHO0lBQ0sscUJBQXFCLENBQUMsS0FBYSxFQUFFLGFBQXFCO1FBQ2hFLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVwQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLE9BQU87U0FDUjtRQUVELE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQzFDLEtBQUssSUFBSSxhQUFhLENBQUM7WUFFdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakIsT0FBTzthQUNSO1NBQ0Y7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxxQ0FBcUM7SUFDN0IsY0FBYztRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLFlBQVksU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ2hGLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtRdWVyeUxpc3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1N1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7XHJcbiAgVVBfQVJST1csXHJcbiAgRE9XTl9BUlJPVyxcclxuICBMRUZUX0FSUk9XLFxyXG4gIFJJR0hUX0FSUk9XLFxyXG4gIFRBQixcclxuICBBLFxyXG4gIFosXHJcbiAgWkVSTyxcclxuICBOSU5FLFxyXG4gIGhhc01vZGlmaWVyS2V5LFxyXG4gIEhPTUUsXHJcbiAgRU5ELFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XHJcbmltcG9ydCB7ZGVib3VuY2VUaW1lLCBmaWx0ZXIsIG1hcCwgdGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG4vKiogVGhpcyBpbnRlcmZhY2UgaXMgZm9yIGl0ZW1zIHRoYXQgY2FuIGJlIHBhc3NlZCB0byBhIExpc3RLZXlNYW5hZ2VyLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExpc3RLZXlNYW5hZ2VyT3B0aW9uIHtcclxuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIGRpc2FibGVkLiAqL1xyXG4gIGRpc2FibGVkPzogYm9vbGVhbjtcclxuXHJcbiAgLyoqIEdldHMgdGhlIGxhYmVsIGZvciB0aGlzIG9wdGlvbi4gKi9cclxuICBnZXRMYWJlbD8oKTogc3RyaW5nO1xyXG59XHJcblxyXG4vKiogTW9kaWZpZXIga2V5cyBoYW5kbGVkIGJ5IHRoZSBMaXN0S2V5TWFuYWdlci4gKi9cclxuZXhwb3J0IHR5cGUgTGlzdEtleU1hbmFnZXJNb2RpZmllcktleSA9ICdhbHRLZXknIHwgJ2N0cmxLZXknIHwgJ21ldGFLZXknIHwgJ3NoaWZ0S2V5JztcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIG1hbmFnZXMga2V5Ym9hcmQgZXZlbnRzIGZvciBzZWxlY3RhYmxlIGxpc3RzLiBJZiB5b3UgcGFzcyBpdCBhIHF1ZXJ5IGxpc3RcclxuICogb2YgaXRlbXMsIGl0IHdpbGwgc2V0IHRoZSBhY3RpdmUgaXRlbSBjb3JyZWN0bHkgd2hlbiBhcnJvdyBldmVudHMgb2NjdXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTGlzdEtleU1hbmFnZXI8VCBleHRlbmRzIExpc3RLZXlNYW5hZ2VyT3B0aW9uPiB7XHJcbiAgcHJpdmF0ZSBfYWN0aXZlSXRlbUluZGV4ID0gLTE7XHJcbiAgcHJpdmF0ZSBfYWN0aXZlSXRlbTogVCB8IG51bGwgPSBudWxsO1xyXG4gIHByaXZhdGUgX3dyYXAgPSBmYWxzZTtcclxuICBwcml2YXRlIF9sZXR0ZXJLZXlTdHJlYW0gPSBuZXcgU3ViamVjdDxzdHJpbmc+KCk7XHJcbiAgcHJpdmF0ZSBfdHlwZWFoZWFkU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xyXG4gIHByaXZhdGUgX3ZlcnRpY2FsID0gdHJ1ZTtcclxuICBwcml2YXRlIF9ob3Jpem9udGFsOiAnbHRyJyB8ICdydGwnIHwgbnVsbDtcclxuICBwcml2YXRlIF9hbGxvd2VkTW9kaWZpZXJLZXlzOiBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5W10gPSBbXTtcclxuICBwcml2YXRlIF9ob21lQW5kRW5kID0gZmFsc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIFByZWRpY2F0ZSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGNoZWNrIHdoZXRoZXIgYW4gaXRlbSBzaG91bGQgYmUgc2tpcHBlZFxyXG4gICAqIGJ5IHRoZSBrZXkgbWFuYWdlci4gQnkgZGVmYXVsdCwgZGlzYWJsZWQgaXRlbXMgYXJlIHNraXBwZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfc2tpcFByZWRpY2F0ZUZuID0gKGl0ZW06IFQpID0+IGl0ZW0uZGlzYWJsZWQ7XHJcblxyXG4gIC8vIEJ1ZmZlciBmb3IgdGhlIGxldHRlcnMgdGhhdCB0aGUgdXNlciBoYXMgcHJlc3NlZCB3aGVuIHRoZSB0eXBlYWhlYWQgb3B0aW9uIGlzIHR1cm5lZCBvbi5cclxuICBwcml2YXRlIF9wcmVzc2VkTGV0dGVyczogc3RyaW5nW10gPSBbXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaXRlbXM6IFF1ZXJ5TGlzdDxUPiB8IFRbXSkge1xyXG4gICAgLy8gV2UgYWxsb3cgZm9yIHRoZSBpdGVtcyB0byBiZSBhbiBhcnJheSBiZWNhdXNlLCBpbiBzb21lIGNhc2VzLCB0aGUgY29uc3VtZXIgbWF5XHJcbiAgICAvLyBub3QgaGF2ZSBhY2Nlc3MgdG8gYSBRdWVyeUxpc3Qgb2YgdGhlIGl0ZW1zIHRoZXkgd2FudCB0byBtYW5hZ2UgKGUuZy4gd2hlbiB0aGVcclxuICAgIC8vIGl0ZW1zIGFyZW4ndCBiZWluZyBjb2xsZWN0ZWQgdmlhIGBWaWV3Q2hpbGRyZW5gIG9yIGBDb250ZW50Q2hpbGRyZW5gKS5cclxuICAgIGlmIChfaXRlbXMgaW5zdGFuY2VvZiBRdWVyeUxpc3QpIHtcclxuICAgICAgX2l0ZW1zLmNoYW5nZXMuc3Vic2NyaWJlKChuZXdJdGVtczogUXVlcnlMaXN0PFQ+KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2FjdGl2ZUl0ZW0pIHtcclxuICAgICAgICAgIGNvbnN0IGl0ZW1BcnJheSA9IG5ld0l0ZW1zLnRvQXJyYXkoKTtcclxuICAgICAgICAgIGNvbnN0IG5ld0luZGV4ID0gaXRlbUFycmF5LmluZGV4T2YodGhpcy5fYWN0aXZlSXRlbSk7XHJcblxyXG4gICAgICAgICAgaWYgKG5ld0luZGV4ID4gLTEgJiYgbmV3SW5kZXggIT09IHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLl9hY3RpdmVJdGVtSW5kZXggPSBuZXdJbmRleDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RyZWFtIHRoYXQgZW1pdHMgYW55IHRpbWUgdGhlIFRBQiBrZXkgaXMgcHJlc3NlZCwgc28gY29tcG9uZW50cyBjYW4gcmVhY3RcclxuICAgKiB3aGVuIGZvY3VzIGlzIHNoaWZ0ZWQgb2ZmIG9mIHRoZSBsaXN0LlxyXG4gICAqL1xyXG4gIHRhYk91dDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XHJcblxyXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgYWN0aXZlIGl0ZW0gb2YgdGhlIGxpc3QgbWFuYWdlciBjaGFuZ2VzLiAqL1xyXG4gIGNoYW5nZSA9IG5ldyBTdWJqZWN0PG51bWJlcj4oKTtcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgcHJlZGljYXRlIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGljaCBpdGVtcyBzaG91bGQgYmUgc2tpcHBlZCBieSB0aGVcclxuICAgKiBsaXN0IGtleSBtYW5hZ2VyLlxyXG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgRnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGdpdmVuIGl0ZW0gc2hvdWxkIGJlIHNraXBwZWQuXHJcbiAgICovXHJcbiAgc2tpcFByZWRpY2F0ZShwcmVkaWNhdGU6IChpdGVtOiBUKSA9PiBib29sZWFuKTogdGhpcyB7XHJcbiAgICB0aGlzLl9za2lwUHJlZGljYXRlRm4gPSBwcmVkaWNhdGU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgd3JhcHBpbmcgbW9kZSwgd2hpY2ggZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBhY3RpdmUgaXRlbSB3aWxsIHdyYXAgdG9cclxuICAgKiB0aGUgb3RoZXIgZW5kIG9mIGxpc3Qgd2hlbiB0aGVyZSBhcmUgbm8gbW9yZSBpdGVtcyBpbiB0aGUgZ2l2ZW4gZGlyZWN0aW9uLlxyXG4gICAqIEBwYXJhbSBzaG91bGRXcmFwIFdoZXRoZXIgdGhlIGxpc3Qgc2hvdWxkIHdyYXAgd2hlbiByZWFjaGluZyB0aGUgZW5kLlxyXG4gICAqL1xyXG4gIHdpdGhXcmFwKHNob3VsZFdyYXAgPSB0cnVlKTogdGhpcyB7XHJcbiAgICB0aGlzLl93cmFwID0gc2hvdWxkV3JhcDtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyB3aGV0aGVyIHRoZSBrZXkgbWFuYWdlciBzaG91bGQgYmUgYWJsZSB0byBtb3ZlIHRoZSBzZWxlY3Rpb24gdmVydGljYWxseS5cclxuICAgKiBAcGFyYW0gZW5hYmxlZCBXaGV0aGVyIHZlcnRpY2FsIHNlbGVjdGlvbiBzaG91bGQgYmUgZW5hYmxlZC5cclxuICAgKi9cclxuICB3aXRoVmVydGljYWxPcmllbnRhdGlvbihlbmFibGVkOiBib29sZWFuID0gdHJ1ZSk6IHRoaXMge1xyXG4gICAgdGhpcy5fdmVydGljYWwgPSBlbmFibGVkO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmVzIHRoZSBrZXkgbWFuYWdlciB0byBtb3ZlIHRoZSBzZWxlY3Rpb24gaG9yaXpvbnRhbGx5LlxyXG4gICAqIFBhc3NpbmcgaW4gYG51bGxgIHdpbGwgZGlzYWJsZSBob3Jpem9udGFsIG1vdmVtZW50LlxyXG4gICAqIEBwYXJhbSBkaXJlY3Rpb24gRGlyZWN0aW9uIGluIHdoaWNoIHRoZSBzZWxlY3Rpb24gY2FuIGJlIG1vdmVkLlxyXG4gICAqL1xyXG4gIHdpdGhIb3Jpem9udGFsT3JpZW50YXRpb24oZGlyZWN0aW9uOiAnbHRyJyB8ICdydGwnIHwgbnVsbCk6IHRoaXMge1xyXG4gICAgdGhpcy5faG9yaXpvbnRhbCA9IGRpcmVjdGlvbjtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW9kaWZpZXIga2V5cyB3aGljaCBhcmUgYWxsb3dlZCB0byBiZSBoZWxkIGRvd24gYW5kIHdob3NlIGRlZmF1bHQgYWN0aW9ucyB3aWxsIGJlIHByZXZlbnRlZFxyXG4gICAqIGFzIHRoZSB1c2VyIGlzIHByZXNzaW5nIHRoZSBhcnJvdyBrZXlzLiBEZWZhdWx0cyB0byBub3QgYWxsb3dpbmcgYW55IG1vZGlmaWVyIGtleXMuXHJcbiAgICovXHJcbiAgd2l0aEFsbG93ZWRNb2RpZmllcktleXMoa2V5czogTGlzdEtleU1hbmFnZXJNb2RpZmllcktleVtdKTogdGhpcyB7XHJcbiAgICB0aGlzLl9hbGxvd2VkTW9kaWZpZXJLZXlzID0ga2V5cztcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHVybnMgb24gdHlwZWFoZWFkIG1vZGUgd2hpY2ggYWxsb3dzIHVzZXJzIHRvIHNldCB0aGUgYWN0aXZlIGl0ZW0gYnkgdHlwaW5nLlxyXG4gICAqIEBwYXJhbSBkZWJvdW5jZUludGVydmFsIFRpbWUgdG8gd2FpdCBhZnRlciB0aGUgbGFzdCBrZXlzdHJva2UgYmVmb3JlIHNldHRpbmcgdGhlIGFjdGl2ZSBpdGVtLlxyXG4gICAqL1xyXG4gIHdpdGhUeXBlQWhlYWQoZGVib3VuY2VJbnRlcnZhbDogbnVtYmVyID0gMjAwKTogdGhpcyB7XHJcbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgKHRoaXMuX2l0ZW1zLmxlbmd0aCAmJlxyXG4gICAgICAgIHRoaXMuX2l0ZW1zLnNvbWUoaXRlbSA9PiB0eXBlb2YgaXRlbS5nZXRMYWJlbCAhPT0gJ2Z1bmN0aW9uJykpKSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdMaXN0S2V5TWFuYWdlciBpdGVtcyBpbiB0eXBlYWhlYWQgbW9kZSBtdXN0IGltcGxlbWVudCB0aGUgYGdldExhYmVsYCBtZXRob2QuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5fdHlwZWFoZWFkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcblxyXG4gICAgLy8gRGVib3VuY2UgdGhlIHByZXNzZXMgb2Ygbm9uLW5hdmlnYXRpb25hbCBrZXlzLCBjb2xsZWN0IHRoZSBvbmVzIHRoYXQgY29ycmVzcG9uZCB0byBsZXR0ZXJzXHJcbiAgICAvLyBhbmQgY29udmVydCB0aG9zZSBsZXR0ZXJzIGJhY2sgaW50byBhIHN0cmluZy4gQWZ0ZXJ3YXJkcyBmaW5kIHRoZSBmaXJzdCBpdGVtIHRoYXQgc3RhcnRzXHJcbiAgICAvLyB3aXRoIHRoYXQgc3RyaW5nIGFuZCBzZWxlY3QgaXQuXHJcbiAgICB0aGlzLl90eXBlYWhlYWRTdWJzY3JpcHRpb24gPSB0aGlzLl9sZXR0ZXJLZXlTdHJlYW0ucGlwZShcclxuICAgICAgdGFwKGxldHRlciA9PiB0aGlzLl9wcmVzc2VkTGV0dGVycy5wdXNoKGxldHRlcikpLFxyXG4gICAgICBkZWJvdW5jZVRpbWUoZGVib3VuY2VJbnRlcnZhbCksXHJcbiAgICAgIGZpbHRlcigoKSA9PiB0aGlzLl9wcmVzc2VkTGV0dGVycy5sZW5ndGggPiAwKSxcclxuICAgICAgbWFwKCgpID0+IHRoaXMuX3ByZXNzZWRMZXR0ZXJzLmpvaW4oJycpKVxyXG4gICAgKS5zdWJzY3JpYmUoaW5wdXRTdHJpbmcgPT4ge1xyXG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2dldEl0ZW1zQXJyYXkoKTtcclxuXHJcbiAgICAgIC8vIFN0YXJ0IGF0IDEgYmVjYXVzZSB3ZSB3YW50IHRvIHN0YXJ0IHNlYXJjaGluZyBhdCB0aGUgaXRlbSBpbW1lZGlhdGVseVxyXG4gICAgICAvLyBmb2xsb3dpbmcgdGhlIGN1cnJlbnQgYWN0aXZlIGl0ZW0uXHJcbiAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaXRlbXMubGVuZ3RoICsgMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSAodGhpcy5fYWN0aXZlSXRlbUluZGV4ICsgaSkgJSBpdGVtcy5sZW5ndGg7XHJcbiAgICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zW2luZGV4XTtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLl9za2lwUHJlZGljYXRlRm4oaXRlbSkgJiZcclxuICAgICAgICAgICAgaXRlbS5nZXRMYWJlbCEoKS50b1VwcGVyQ2FzZSgpLnRyaW0oKS5pbmRleE9mKGlucHV0U3RyaW5nKSA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShpbmRleCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX3ByZXNzZWRMZXR0ZXJzID0gW107XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgdGhlIGtleSBtYW5hZ2VyIHRvIGFjdGl2YXRlIHRoZSBmaXJzdCBhbmQgbGFzdCBpdGVtc1xyXG4gICAqIHJlc3BlY3RpdmVseSB3aGVuIHRoZSBIb21lIG9yIEVuZCBrZXkgaXMgcHJlc3NlZC5cclxuICAgKiBAcGFyYW0gZW5hYmxlZCBXaGV0aGVyIHByZXNzaW5nIHRoZSBIb21lIG9yIEVuZCBrZXkgYWN0aXZhdGVzIHRoZSBmaXJzdC9sYXN0IGl0ZW0uXHJcbiAgICovXHJcbiAgd2l0aEhvbWVBbmRFbmQoZW5hYmxlZDogYm9vbGVhbiA9IHRydWUpOiB0aGlzIHtcclxuICAgIHRoaXMuX2hvbWVBbmRFbmQgPSBlbmFibGVkO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgaXRlbSBhdCB0aGUgaW5kZXggc3BlY2lmaWVkLlxyXG4gICAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cclxuICAgKi9cclxuICBzZXRBY3RpdmVJdGVtKGluZGV4OiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgc3BlY2lmaWVkIGl0ZW0uXHJcbiAgICogQHBhcmFtIGl0ZW0gVGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cclxuICAgKi9cclxuICBzZXRBY3RpdmVJdGVtKGl0ZW06IFQpOiB2b2lkO1xyXG5cclxuICBzZXRBY3RpdmVJdGVtKGl0ZW06IGFueSk6IHZvaWQge1xyXG4gICAgY29uc3QgcHJldmlvdXNBY3RpdmVJdGVtID0gdGhpcy5fYWN0aXZlSXRlbTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUFjdGl2ZUl0ZW0oaXRlbSk7XHJcblxyXG4gICAgaWYgKHRoaXMuX2FjdGl2ZUl0ZW0gIT09IHByZXZpb3VzQWN0aXZlSXRlbSkge1xyXG4gICAgICB0aGlzLmNoYW5nZS5uZXh0KHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSBkZXBlbmRpbmcgb24gdGhlIGtleSBldmVudCBwYXNzZWQgaW4uXHJcbiAgICogQHBhcmFtIGV2ZW50IEtleWJvYXJkIGV2ZW50IHRvIGJlIHVzZWQgZm9yIGRldGVybWluaW5nIHdoaWNoIGVsZW1lbnQgc2hvdWxkIGJlIGFjdGl2ZS5cclxuICAgKi9cclxuICBvbktleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG4gICAgY29uc3QgbW9kaWZpZXJzOiBMaXN0S2V5TWFuYWdlck1vZGlmaWVyS2V5W10gPSBbJ2FsdEtleScsICdjdHJsS2V5JywgJ21ldGFLZXknLCAnc2hpZnRLZXknXTtcclxuICAgIGNvbnN0IGlzTW9kaWZpZXJBbGxvd2VkID0gbW9kaWZpZXJzLmV2ZXJ5KG1vZGlmaWVyID0+IHtcclxuICAgICAgcmV0dXJuICFldmVudFttb2RpZmllcl0gfHwgdGhpcy5fYWxsb3dlZE1vZGlmaWVyS2V5cy5pbmRleE9mKG1vZGlmaWVyKSA+IC0xO1xyXG4gICAgfSk7XHJcblxyXG4gICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgIGNhc2UgVEFCOlxyXG4gICAgICAgIHRoaXMudGFiT3V0Lm5leHQoKTtcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBjYXNlIERPV05fQVJST1c6XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XHJcbiAgICAgICAgICB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGNhc2UgVVBfQVJST1c6XHJcbiAgICAgICAgaWYgKHRoaXMuX3ZlcnRpY2FsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XHJcbiAgICAgICAgICB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxyXG4gICAgICAgIGlmICh0aGlzLl9ob3Jpem9udGFsICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XHJcbiAgICAgICAgICB0aGlzLl9ob3Jpem9udGFsID09PSAncnRsJyA/IHRoaXMuc2V0UHJldmlvdXNJdGVtQWN0aXZlKCkgOiB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGNhc2UgTEVGVF9BUlJPVzpcclxuICAgICAgICBpZiAodGhpcy5faG9yaXpvbnRhbCAmJiBpc01vZGlmaWVyQWxsb3dlZCkge1xyXG4gICAgICAgICAgdGhpcy5faG9yaXpvbnRhbCA9PT0gJ3J0bCcgPyB0aGlzLnNldE5leHRJdGVtQWN0aXZlKCkgOiB0aGlzLnNldFByZXZpb3VzSXRlbUFjdGl2ZSgpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICBjYXNlIEhPTUU6XHJcbiAgICAgICAgaWYgKHRoaXMuX2hvbWVBbmRFbmQgJiYgaXNNb2RpZmllckFsbG93ZWQpIHtcclxuICAgICAgICAgIHRoaXMuc2V0Rmlyc3RJdGVtQWN0aXZlKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGNhc2UgRU5EOlxyXG4gICAgICAgIGlmICh0aGlzLl9ob21lQW5kRW5kICYmIGlzTW9kaWZpZXJBbGxvd2VkKSB7XHJcbiAgICAgICAgICB0aGlzLnNldExhc3RJdGVtQWN0aXZlKCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgIGlmIChpc01vZGlmaWVyQWxsb3dlZCB8fCBoYXNNb2RpZmllcktleShldmVudCwgJ3NoaWZ0S2V5JykpIHtcclxuICAgICAgICAgIC8vIEF0dGVtcHQgdG8gdXNlIHRoZSBgZXZlbnQua2V5YCB3aGljaCBhbHNvIG1hcHMgaXQgdG8gdGhlIHVzZXIncyBrZXlib2FyZCBsYW5ndWFnZSxcclxuICAgICAgICAgIC8vIG90aGVyd2lzZSBmYWxsIGJhY2sgdG8gcmVzb2x2aW5nIGFscGhhbnVtZXJpYyBjaGFyYWN0ZXJzIHZpYSB0aGUga2V5Q29kZS5cclxuICAgICAgICAgIGlmIChldmVudC5rZXkgJiYgZXZlbnQua2V5Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLl9sZXR0ZXJLZXlTdHJlYW0ubmV4dChldmVudC5rZXkudG9Mb2NhbGVVcHBlckNhc2UoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKChrZXlDb2RlID49IEEgJiYga2V5Q29kZSA8PSBaKSB8fCAoa2V5Q29kZSA+PSBaRVJPICYmIGtleUNvZGUgPD0gTklORSkpIHtcclxuICAgICAgICAgICAgdGhpcy5fbGV0dGVyS2V5U3RyZWFtLm5leHQoU3RyaW5nLmZyb21DaGFyQ29kZShrZXlDb2RlKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOb3RlIHRoYXQgd2UgcmV0dXJuIGhlcmUsIGluIG9yZGVyIHRvIGF2b2lkIHByZXZlbnRpbmdcclxuICAgICAgICAvLyB0aGUgZGVmYXVsdCBhY3Rpb24gb2Ygbm9uLW5hdmlnYXRpb25hbCBrZXlzLlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9wcmVzc2VkTGV0dGVycyA9IFtdO1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBJbmRleCBvZiB0aGUgY3VycmVudGx5IGFjdGl2ZSBpdGVtLiAqL1xyXG4gIGdldCBhY3RpdmVJdGVtSW5kZXgoKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlSXRlbUluZGV4O1xyXG4gIH1cclxuXHJcbiAgLyoqIFRoZSBhY3RpdmUgaXRlbS4gKi9cclxuICBnZXQgYWN0aXZlSXRlbSgpOiBUIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlSXRlbTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIHVzZXIgaXMgY3VycmVudGx5IHR5cGluZyBpbnRvIHRoZSBtYW5hZ2VyIHVzaW5nIHRoZSB0eXBlYWhlYWQgZmVhdHVyZS4gKi9cclxuICBpc1R5cGluZygpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9wcmVzc2VkTGV0dGVycy5sZW5ndGggPiAwO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBmaXJzdCBlbmFibGVkIGl0ZW0gaW4gdGhlIGxpc3QuICovXHJcbiAgc2V0Rmlyc3RJdGVtQWN0aXZlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2V0QWN0aXZlSXRlbUJ5SW5kZXgoMCwgMSk7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gdG8gdGhlIGxhc3QgZW5hYmxlZCBpdGVtIGluIHRoZSBsaXN0LiAqL1xyXG4gIHNldExhc3RJdGVtQWN0aXZlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fc2V0QWN0aXZlSXRlbUJ5SW5kZXgodGhpcy5faXRlbXMubGVuZ3RoIC0gMSwgLTEpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBuZXh0IGVuYWJsZWQgaXRlbSBpbiB0aGUgbGlzdC4gKi9cclxuICBzZXROZXh0SXRlbUFjdGl2ZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCA8IDAgPyB0aGlzLnNldEZpcnN0SXRlbUFjdGl2ZSgpIDogdGhpcy5fc2V0QWN0aXZlSXRlbUJ5RGVsdGEoMSk7XHJcbiAgfVxyXG5cclxuICAvKiogU2V0cyB0aGUgYWN0aXZlIGl0ZW0gdG8gYSBwcmV2aW91cyBlbmFibGVkIGl0ZW0gaW4gdGhlIGxpc3QuICovXHJcbiAgc2V0UHJldmlvdXNJdGVtQWN0aXZlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fYWN0aXZlSXRlbUluZGV4IDwgMCAmJiB0aGlzLl93cmFwID8gdGhpcy5zZXRMYXN0SXRlbUFjdGl2ZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0aGlzLl9zZXRBY3RpdmVJdGVtQnlEZWx0YSgtMSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBbGxvd3Mgc2V0dGluZyB0aGUgYWN0aXZlIHdpdGhvdXQgYW55IG90aGVyIGVmZmVjdHMuXHJcbiAgICogQHBhcmFtIGluZGV4IEluZGV4IG9mIHRoZSBpdGVtIHRvIGJlIHNldCBhcyBhY3RpdmUuXHJcbiAgICovXHJcbiAgdXBkYXRlQWN0aXZlSXRlbShpbmRleDogbnVtYmVyKTogdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQWxsb3dzIHNldHRpbmcgdGhlIGFjdGl2ZSBpdGVtIHdpdGhvdXQgYW55IG90aGVyIGVmZmVjdHMuXHJcbiAgICogQHBhcmFtIGl0ZW0gSXRlbSB0byBiZSBzZXQgYXMgYWN0aXZlLlxyXG4gICAqL1xyXG4gIHVwZGF0ZUFjdGl2ZUl0ZW0oaXRlbTogVCk6IHZvaWQ7XHJcblxyXG4gIHVwZGF0ZUFjdGl2ZUl0ZW0oaXRlbTogYW55KTogdm9pZCB7XHJcbiAgICBjb25zdCBpdGVtQXJyYXkgPSB0aGlzLl9nZXRJdGVtc0FycmF5KCk7XHJcbiAgICBjb25zdCBpbmRleCA9IHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyA/IGl0ZW0gOiBpdGVtQXJyYXkuaW5kZXhPZihpdGVtKTtcclxuICAgIGNvbnN0IGFjdGl2ZUl0ZW0gPSBpdGVtQXJyYXlbaW5kZXhdO1xyXG5cclxuICAgIC8vIEV4cGxpY2l0bHkgY2hlY2sgZm9yIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgYmVjYXVzZSBvdGhlciBmYWxzeSB2YWx1ZXMgYXJlIHZhbGlkLlxyXG4gICAgdGhpcy5fYWN0aXZlSXRlbSA9IGFjdGl2ZUl0ZW0gPT0gbnVsbCA/IG51bGwgOiBhY3RpdmVJdGVtO1xyXG4gICAgdGhpcy5fYWN0aXZlSXRlbUluZGV4ID0gaW5kZXg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIG1ldGhvZCBzZXRzIHRoZSBhY3RpdmUgaXRlbSwgZ2l2ZW4gYSBsaXN0IG9mIGl0ZW1zIGFuZCB0aGUgZGVsdGEgYmV0d2VlbiB0aGVcclxuICAgKiBjdXJyZW50bHkgYWN0aXZlIGl0ZW0gYW5kIHRoZSBuZXcgYWN0aXZlIGl0ZW0uIEl0IHdpbGwgY2FsY3VsYXRlIGRpZmZlcmVudGx5XHJcbiAgICogZGVwZW5kaW5nIG9uIHdoZXRoZXIgd3JhcCBtb2RlIGlzIHR1cm5lZCBvbi5cclxuICAgKi9cclxuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtQnlEZWx0YShkZWx0YTogLTEgfCAxKTogdm9pZCB7XHJcbiAgICB0aGlzLl93cmFwID8gdGhpcy5fc2V0QWN0aXZlSW5XcmFwTW9kZShkZWx0YSkgOiB0aGlzLl9zZXRBY3RpdmVJbkRlZmF1bHRNb2RlKGRlbHRhKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHByb3Blcmx5IGdpdmVuIFwid3JhcFwiIG1vZGUuIEluIG90aGVyIHdvcmRzLCBpdCB3aWxsIGNvbnRpbnVlIHRvIG1vdmVcclxuICAgKiBkb3duIHRoZSBsaXN0IHVudGlsIGl0IGZpbmRzIGFuIGl0ZW0gdGhhdCBpcyBub3QgZGlzYWJsZWQsIGFuZCBpdCB3aWxsIHdyYXAgaWYgaXRcclxuICAgKiBlbmNvdW50ZXJzIGVpdGhlciBlbmQgb2YgdGhlIGxpc3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBfc2V0QWN0aXZlSW5XcmFwTW9kZShkZWx0YTogLTEgfCAxKTogdm9pZCB7XHJcbiAgICBjb25zdCBpdGVtcyA9IHRoaXMuX2dldEl0ZW1zQXJyYXkoKTtcclxuXHJcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBpdGVtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBpbmRleCA9ICh0aGlzLl9hY3RpdmVJdGVtSW5kZXggKyAoZGVsdGEgKiBpKSArIGl0ZW1zLmxlbmd0aCkgJSBpdGVtcy5sZW5ndGg7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSBpdGVtc1tpbmRleF07XHJcblxyXG4gICAgICBpZiAoIXRoaXMuX3NraXBQcmVkaWNhdGVGbihpdGVtKSkge1xyXG4gICAgICAgIHRoaXMuc2V0QWN0aXZlSXRlbShpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSBwcm9wZXJseSBnaXZlbiB0aGUgZGVmYXVsdCBtb2RlLiBJbiBvdGhlciB3b3JkcywgaXQgd2lsbFxyXG4gICAqIGNvbnRpbnVlIHRvIG1vdmUgZG93biB0aGUgbGlzdCB1bnRpbCBpdCBmaW5kcyBhbiBpdGVtIHRoYXQgaXMgbm90IGRpc2FibGVkLiBJZlxyXG4gICAqIGl0IGVuY291bnRlcnMgZWl0aGVyIGVuZCBvZiB0aGUgbGlzdCwgaXQgd2lsbCBzdG9wIGFuZCBub3Qgd3JhcC5cclxuICAgKi9cclxuICBwcml2YXRlIF9zZXRBY3RpdmVJbkRlZmF1bHRNb2RlKGRlbHRhOiAtMSB8IDEpOiB2b2lkIHtcclxuICAgIHRoaXMuX3NldEFjdGl2ZUl0ZW1CeUluZGV4KHRoaXMuX2FjdGl2ZUl0ZW1JbmRleCArIGRlbHRhLCBkZWx0YSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgZmlyc3QgZW5hYmxlZCBpdGVtIHN0YXJ0aW5nIGF0IHRoZSBpbmRleCBzcGVjaWZpZWQuIElmIHRoZVxyXG4gICAqIGl0ZW0gaXMgZGlzYWJsZWQsIGl0IHdpbGwgbW92ZSBpbiB0aGUgZmFsbGJhY2tEZWx0YSBkaXJlY3Rpb24gdW50aWwgaXQgZWl0aGVyXHJcbiAgICogZmluZHMgYW4gZW5hYmxlZCBpdGVtIG9yIGVuY291bnRlcnMgdGhlIGVuZCBvZiB0aGUgbGlzdC5cclxuICAgKi9cclxuICBwcml2YXRlIF9zZXRBY3RpdmVJdGVtQnlJbmRleChpbmRleDogbnVtYmVyLCBmYWxsYmFja0RlbHRhOiAtMSB8IDEpOiB2b2lkIHtcclxuICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNBcnJheSgpO1xyXG5cclxuICAgIGlmICghaXRlbXNbaW5kZXhdKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB3aGlsZSAodGhpcy5fc2tpcFByZWRpY2F0ZUZuKGl0ZW1zW2luZGV4XSkpIHtcclxuICAgICAgaW5kZXggKz0gZmFsbGJhY2tEZWx0YTtcclxuXHJcbiAgICAgIGlmICghaXRlbXNbaW5kZXhdKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zZXRBY3RpdmVJdGVtKGluZGV4KTtcclxuICB9XHJcblxyXG4gIC8qKiBSZXR1cm5zIHRoZSBpdGVtcyBhcyBhbiBhcnJheS4gKi9cclxuICBwcml2YXRlIF9nZXRJdGVtc0FycmF5KCk6IFRbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5faXRlbXMgaW5zdGFuY2VvZiBRdWVyeUxpc3QgPyB0aGlzLl9pdGVtcy50b0FycmF5KCkgOiB0aGlzLl9pdGVtcztcclxuICB9XHJcbn1cclxuIl19