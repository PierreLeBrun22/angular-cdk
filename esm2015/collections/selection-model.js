/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Subject } from 'rxjs';
/**
 * Class to be used to power selecting one or more options from a list.
 */
export class SelectionModel {
    constructor(_multiple = false, initiallySelectedValues, _emitChanges = true) {
        this._multiple = _multiple;
        this._emitChanges = _emitChanges;
        /** Currently-selected values. */
        this._selection = new Set();
        /** Keeps track of the deselected options that haven't been emitted by the change event. */
        this._deselectedToEmit = [];
        /** Keeps track of the selected options that haven't been emitted by the change event. */
        this._selectedToEmit = [];
        /** Event emitted when the value has changed. */
        this.changed = new Subject();
        if (initiallySelectedValues && initiallySelectedValues.length) {
            if (_multiple) {
                initiallySelectedValues.forEach(value => this._markSelected(value));
            }
            else {
                this._markSelected(initiallySelectedValues[0]);
            }
            // Clear the array in order to avoid firing the change event for preselected values.
            this._selectedToEmit.length = 0;
        }
    }
    /** Selected values. */
    get selected() {
        if (!this._selected) {
            this._selected = Array.from(this._selection.values());
        }
        return this._selected;
    }
    /**
     * Selects a value or an array of values.
     */
    select(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._markSelected(value));
        this._emitChangeEvent();
    }
    /**
     * Deselects a value or an array of values.
     */
    deselect(...values) {
        this._verifyValueAssignment(values);
        values.forEach(value => this._unmarkSelected(value));
        this._emitChangeEvent();
    }
    /**
     * Toggles a value between selected and deselected.
     */
    toggle(value) {
        this.isSelected(value) ? this.deselect(value) : this.select(value);
    }
    /**
     * Clears all of the selected values.
     */
    clear() {
        this._unmarkAll();
        this._emitChangeEvent();
    }
    /**
     * Determines whether a value is selected.
     */
    isSelected(value) {
        return this._selection.has(value);
    }
    /**
     * Determines whether the model does not have a value.
     */
    isEmpty() {
        return this._selection.size === 0;
    }
    /**
     * Determines whether the model has a value.
     */
    hasValue() {
        return !this.isEmpty();
    }
    /**
     * Sorts the selected values based on a predicate function.
     */
    sort(predicate) {
        if (this._multiple && this.selected) {
            this._selected.sort(predicate);
        }
    }
    /**
     * Gets whether multiple values can be selected.
     */
    isMultipleSelection() {
        return this._multiple;
    }
    /** Emits a change event and clears the records of selected and deselected values. */
    _emitChangeEvent() {
        // Clear the selected values so they can be re-cached.
        this._selected = null;
        if (this._selectedToEmit.length || this._deselectedToEmit.length) {
            this.changed.next({
                source: this,
                added: this._selectedToEmit,
                removed: this._deselectedToEmit
            });
            this._deselectedToEmit = [];
            this._selectedToEmit = [];
        }
    }
    /** Selects a value. */
    _markSelected(value) {
        if (!this.isSelected(value)) {
            if (!this._multiple) {
                this._unmarkAll();
            }
            this._selection.add(value);
            if (this._emitChanges) {
                this._selectedToEmit.push(value);
            }
        }
    }
    /** Deselects a value. */
    _unmarkSelected(value) {
        if (this.isSelected(value)) {
            this._selection.delete(value);
            if (this._emitChanges) {
                this._deselectedToEmit.push(value);
            }
        }
    }
    /** Clears out the selected values. */
    _unmarkAll() {
        if (!this.isEmpty()) {
            this._selection.forEach(value => this._unmarkSelected(value));
        }
    }
    /**
     * Verifies the value assignment and throws an error if the specified value array is
     * including multiple values while the selection model is not supporting multiple values.
     */
    _verifyValueAssignment(values) {
        if (values.length > 1 && !this._multiple && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            throw getMultipleValuesInSingleSelectionError();
        }
    }
}
/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 * @docs-private
 */
export function getMultipleValuesInSingleSelectionError() {
    return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2xsZWN0aW9ucy9zZWxlY3Rpb24tbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUU3Qjs7R0FFRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBeUJ6QixZQUNVLFlBQVksS0FBSyxFQUN6Qix1QkFBNkIsRUFDckIsZUFBZSxJQUFJO1FBRm5CLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFFakIsaUJBQVksR0FBWixZQUFZLENBQU87UUEzQjdCLGlDQUFpQztRQUN6QixlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQUssQ0FBQztRQUVsQywyRkFBMkY7UUFDbkYsc0JBQWlCLEdBQVEsRUFBRSxDQUFDO1FBRXBDLHlGQUF5RjtRQUNqRixvQkFBZSxHQUFRLEVBQUUsQ0FBQztRQWNsQyxnREFBZ0Q7UUFDaEQsWUFBTyxHQUFnQyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBT25ELElBQUksdUJBQXVCLElBQUksdUJBQXVCLENBQUMsTUFBTSxFQUFFO1lBQzdELElBQUksU0FBUyxFQUFFO2dCQUNiLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUNyRTtpQkFBTTtnQkFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEQ7WUFFRCxvRkFBb0Y7WUFDcEYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQztJQTNCRCx1QkFBdUI7SUFDdkIsSUFBSSxRQUFRO1FBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsSUFB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cHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4anMnO1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIHRvIGJlIHVzZWQgdG8gcG93ZXIgc2VsZWN0aW5nIG9uZSBvciBtb3JlIG9wdGlvbnMgZnJvbSBhIGxpc3QuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2VsZWN0aW9uTW9kZWw8VD4ge1xyXG4gIC8qKiBDdXJyZW50bHktc2VsZWN0ZWQgdmFsdWVzLiAqL1xyXG4gIHByaXZhdGUgX3NlbGVjdGlvbiA9IG5ldyBTZXQ8VD4oKTtcclxuXHJcbiAgLyoqIEtlZXBzIHRyYWNrIG9mIHRoZSBkZXNlbGVjdGVkIG9wdGlvbnMgdGhhdCBoYXZlbid0IGJlZW4gZW1pdHRlZCBieSB0aGUgY2hhbmdlIGV2ZW50LiAqL1xyXG4gIHByaXZhdGUgX2Rlc2VsZWN0ZWRUb0VtaXQ6IFRbXSA9IFtdO1xyXG5cclxuICAvKiogS2VlcHMgdHJhY2sgb2YgdGhlIHNlbGVjdGVkIG9wdGlvbnMgdGhhdCBoYXZlbid0IGJlZW4gZW1pdHRlZCBieSB0aGUgY2hhbmdlIGV2ZW50LiAqL1xyXG4gIHByaXZhdGUgX3NlbGVjdGVkVG9FbWl0OiBUW10gPSBbXTtcclxuXHJcbiAgLyoqIENhY2hlIGZvciB0aGUgYXJyYXkgdmFsdWUgb2YgdGhlIHNlbGVjdGVkIGl0ZW1zLiAqL1xyXG4gIHByaXZhdGUgX3NlbGVjdGVkOiBUW10gfCBudWxsO1xyXG5cclxuICAvKiogU2VsZWN0ZWQgdmFsdWVzLiAqL1xyXG4gIGdldCBzZWxlY3RlZCgpOiBUW10ge1xyXG4gICAgaWYgKCF0aGlzLl9zZWxlY3RlZCkge1xyXG4gICAgICB0aGlzLl9zZWxlY3RlZCA9IEFycmF5LmZyb20odGhpcy5fc2VsZWN0aW9uLnZhbHVlcygpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XHJcbiAgfVxyXG5cclxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZC4gKi9cclxuICBjaGFuZ2VkOiBTdWJqZWN0PFNlbGVjdGlvbkNoYW5nZTxUPj4gPSBuZXcgU3ViamVjdCgpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgX211bHRpcGxlID0gZmFsc2UsXHJcbiAgICBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcz86IFRbXSxcclxuICAgIHByaXZhdGUgX2VtaXRDaGFuZ2VzID0gdHJ1ZSkge1xyXG5cclxuICAgIGlmIChpbml0aWFsbHlTZWxlY3RlZFZhbHVlcyAmJiBpbml0aWFsbHlTZWxlY3RlZFZhbHVlcy5sZW5ndGgpIHtcclxuICAgICAgaWYgKF9tdWx0aXBsZSkge1xyXG4gICAgICAgIGluaXRpYWxseVNlbGVjdGVkVmFsdWVzLmZvckVhY2godmFsdWUgPT4gdGhpcy5fbWFya1NlbGVjdGVkKHZhbHVlKSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fbWFya1NlbGVjdGVkKGluaXRpYWxseVNlbGVjdGVkVmFsdWVzWzBdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2xlYXIgdGhlIGFycmF5IGluIG9yZGVyIHRvIGF2b2lkIGZpcmluZyB0aGUgY2hhbmdlIGV2ZW50IGZvciBwcmVzZWxlY3RlZCB2YWx1ZXMuXHJcbiAgICAgIHRoaXMuX3NlbGVjdGVkVG9FbWl0Lmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3RzIGEgdmFsdWUgb3IgYW4gYXJyYXkgb2YgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHNlbGVjdCguLi52YWx1ZXM6IFRbXSk6IHZvaWQge1xyXG4gICAgdGhpcy5fdmVyaWZ5VmFsdWVBc3NpZ25tZW50KHZhbHVlcyk7XHJcbiAgICB2YWx1ZXMuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl9tYXJrU2VsZWN0ZWQodmFsdWUpKTtcclxuICAgIHRoaXMuX2VtaXRDaGFuZ2VFdmVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVzZWxlY3RzIGEgdmFsdWUgb3IgYW4gYXJyYXkgb2YgdmFsdWVzLlxyXG4gICAqL1xyXG4gIGRlc2VsZWN0KC4uLnZhbHVlczogVFtdKTogdm9pZCB7XHJcbiAgICB0aGlzLl92ZXJpZnlWYWx1ZUFzc2lnbm1lbnQodmFsdWVzKTtcclxuICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRoaXMuX3VubWFya1NlbGVjdGVkKHZhbHVlKSk7XHJcbiAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvZ2dsZXMgYSB2YWx1ZSBiZXR3ZWVuIHNlbGVjdGVkIGFuZCBkZXNlbGVjdGVkLlxyXG4gICAqL1xyXG4gIHRvZ2dsZSh2YWx1ZTogVCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc1NlbGVjdGVkKHZhbHVlKSA/IHRoaXMuZGVzZWxlY3QodmFsdWUpIDogdGhpcy5zZWxlY3QodmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2xlYXJzIGFsbCBvZiB0aGUgc2VsZWN0ZWQgdmFsdWVzLlxyXG4gICAqL1xyXG4gIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fdW5tYXJrQWxsKCk7XHJcbiAgICB0aGlzLl9lbWl0Q2hhbmdlRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciBhIHZhbHVlIGlzIHNlbGVjdGVkLlxyXG4gICAqL1xyXG4gIGlzU2VsZWN0ZWQodmFsdWU6IFQpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb24uaGFzKHZhbHVlKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgd2hldGhlciB0aGUgbW9kZWwgZG9lcyBub3QgaGF2ZSBhIHZhbHVlLlxyXG4gICAqL1xyXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0aW9uLnNpemUgPT09IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIG1vZGVsIGhhcyBhIHZhbHVlLlxyXG4gICAqL1xyXG4gIGhhc1ZhbHVlKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICF0aGlzLmlzRW1wdHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNvcnRzIHRoZSBzZWxlY3RlZCB2YWx1ZXMgYmFzZWQgb24gYSBwcmVkaWNhdGUgZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgc29ydChwcmVkaWNhdGU/OiAoYTogVCwgYjogVCkgPT4gbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5fbXVsdGlwbGUgJiYgdGhpcy5zZWxlY3RlZCkge1xyXG4gICAgICB0aGlzLl9zZWxlY3RlZCEuc29ydChwcmVkaWNhdGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB3aGV0aGVyIG11bHRpcGxlIHZhbHVlcyBjYW4gYmUgc2VsZWN0ZWQuXHJcbiAgICovXHJcbiAgaXNNdWx0aXBsZVNlbGVjdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9tdWx0aXBsZTtcclxuICB9XHJcblxyXG4gIC8qKiBFbWl0cyBhIGNoYW5nZSBldmVudCBhbmQgY2xlYXJzIHRoZSByZWNvcmRzIG9mIHNlbGVjdGVkIGFuZCBkZXNlbGVjdGVkIHZhbHVlcy4gKi9cclxuICBwcml2YXRlIF9lbWl0Q2hhbmdlRXZlbnQoKSB7XHJcbiAgICAvLyBDbGVhciB0aGUgc2VsZWN0ZWQgdmFsdWVzIHNvIHRoZXkgY2FuIGJlIHJlLWNhY2hlZC5cclxuICAgIHRoaXMuX3NlbGVjdGVkID0gbnVsbDtcclxuXHJcbiAgICBpZiAodGhpcy5fc2VsZWN0ZWRUb0VtaXQubGVuZ3RoIHx8IHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMuY2hhbmdlZC5uZXh0KHtcclxuICAgICAgICBzb3VyY2U6IHRoaXMsXHJcbiAgICAgICAgYWRkZWQ6IHRoaXMuX3NlbGVjdGVkVG9FbWl0LFxyXG4gICAgICAgIHJlbW92ZWQ6IHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXRcclxuICAgICAgfSk7XHJcblxyXG4gICAgICB0aGlzLl9kZXNlbGVjdGVkVG9FbWl0ID0gW107XHJcbiAgICAgIHRoaXMuX3NlbGVjdGVkVG9FbWl0ID0gW107XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiogU2VsZWN0cyBhIHZhbHVlLiAqL1xyXG4gIHByaXZhdGUgX21hcmtTZWxlY3RlZCh2YWx1ZTogVCkge1xyXG4gICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQodmFsdWUpKSB7XHJcbiAgICAgIGlmICghdGhpcy5fbXVsdGlwbGUpIHtcclxuICAgICAgICB0aGlzLl91bm1hcmtBbGwoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5fc2VsZWN0aW9uLmFkZCh2YWx1ZSk7XHJcblxyXG4gICAgICBpZiAodGhpcy5fZW1pdENoYW5nZXMpIHtcclxuICAgICAgICB0aGlzLl9zZWxlY3RlZFRvRW1pdC5wdXNoKHZhbHVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqIERlc2VsZWN0cyBhIHZhbHVlLiAqL1xyXG4gIHByaXZhdGUgX3VubWFya1NlbGVjdGVkKHZhbHVlOiBUKSB7XHJcbiAgICBpZiAodGhpcy5pc1NlbGVjdGVkKHZhbHVlKSkge1xyXG4gICAgICB0aGlzLl9zZWxlY3Rpb24uZGVsZXRlKHZhbHVlKTtcclxuXHJcbiAgICAgIGlmICh0aGlzLl9lbWl0Q2hhbmdlcykge1xyXG4gICAgICAgIHRoaXMuX2Rlc2VsZWN0ZWRUb0VtaXQucHVzaCh2YWx1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKiBDbGVhcnMgb3V0IHRoZSBzZWxlY3RlZCB2YWx1ZXMuICovXHJcbiAgcHJpdmF0ZSBfdW5tYXJrQWxsKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzRW1wdHkoKSkge1xyXG4gICAgICB0aGlzLl9zZWxlY3Rpb24uZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLl91bm1hcmtTZWxlY3RlZCh2YWx1ZSkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVmVyaWZpZXMgdGhlIHZhbHVlIGFzc2lnbm1lbnQgYW5kIHRocm93cyBhbiBlcnJvciBpZiB0aGUgc3BlY2lmaWVkIHZhbHVlIGFycmF5IGlzXHJcbiAgICogaW5jbHVkaW5nIG11bHRpcGxlIHZhbHVlcyB3aGlsZSB0aGUgc2VsZWN0aW9uIG1vZGVsIGlzIG5vdCBzdXBwb3J0aW5nIG11bHRpcGxlIHZhbHVlcy5cclxuICAgKi9cclxuICBwcml2YXRlIF92ZXJpZnlWYWx1ZUFzc2lnbm1lbnQodmFsdWVzOiBUW10pIHtcclxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMSAmJiAhdGhpcy5fbXVsdGlwbGUgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgdGhyb3cgZ2V0TXVsdGlwbGVWYWx1ZXNJblNpbmdsZVNlbGVjdGlvbkVycm9yKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSB2YWx1ZSBvZiBhIE1hdFNlbGVjdGlvbk1vZGVsIGhhcyBjaGFuZ2VkLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdGlvbkNoYW5nZTxUPiB7XHJcbiAgLyoqIE1vZGVsIHRoYXQgZGlzcGF0Y2hlZCB0aGUgZXZlbnQuICovXHJcbiAgc291cmNlOiBTZWxlY3Rpb25Nb2RlbDxUPjtcclxuICAvKiogT3B0aW9ucyB0aGF0IHdlcmUgYWRkZWQgdG8gdGhlIG1vZGVsLiAqL1xyXG4gIGFkZGVkOiBUW107XHJcbiAgLyoqIE9wdGlvbnMgdGhhdCB3ZXJlIHJlbW92ZWQgZnJvbSB0aGUgbW9kZWwuICovXHJcbiAgcmVtb3ZlZDogVFtdO1xyXG59XHJcblxyXG4vKipcclxuICogUmV0dXJucyBhbiBlcnJvciB0aGF0IHJlcG9ydHMgdGhhdCBtdWx0aXBsZSB2YWx1ZXMgYXJlIHBhc3NlZCBpbnRvIGEgc2VsZWN0aW9uIG1vZGVsXHJcbiAqIHdpdGggYSBzaW5nbGUgdmFsdWUuXHJcbiAqIEBkb2NzLXByaXZhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNdWx0aXBsZVZhbHVlc0luU2luZ2xlU2VsZWN0aW9uRXJyb3IoKSB7XHJcbiAgcmV0dXJuIEVycm9yKCdDYW5ub3QgcGFzcyBtdWx0aXBsZSB2YWx1ZXMgaW50byBTZWxlY3Rpb25Nb2RlbCB3aXRoIHNpbmdsZS12YWx1ZSBtb2RlLicpO1xyXG59XHJcbiJdfQ==