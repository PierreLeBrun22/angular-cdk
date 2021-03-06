/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isObservable, of as observableOf } from 'rxjs';
import { DataSource } from './data-source';
/** DataSource wrapper for a native array. */
export class ArrayDataSource extends DataSource {
    constructor(_data) {
        super();
        this._data = _data;
    }
    connect() {
        return isObservable(this._data) ? this._data : observableOf(this._data);
    }
    disconnect() { }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXktZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2NvbGxlY3Rpb25zL2FycmF5LWRhdGEtc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBYSxZQUFZLEVBQUUsRUFBRSxJQUFJLFlBQVksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNsRSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3pDLDZDQUE2QztBQUM3QyxNQUFNLE9BQU8sZUFBbUIsU0FBUSxVQUFhO0lBQ25ELFlBQW9CLEtBQWtFO1FBQ3BGLEtBQUssRUFBRSxDQUFDO1FBRFUsVUFBSyxHQUFMLEtBQUssQ0FBNkQ7SUFFdEYsQ0FBQztJQUVELE9BQU87UUFDTCxPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVELFVBQVUsS0FBSSxDQUFDO0NBQ2hCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge09ic2VydmFibGUsIGlzT2JzZXJ2YWJsZSwgb2YgYXMgb2JzZXJ2YWJsZU9mfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtEYXRhU291cmNlfSBmcm9tICcuL2RhdGEtc291cmNlJztcclxuXHJcblxyXG4vKiogRGF0YVNvdXJjZSB3cmFwcGVyIGZvciBhIG5hdGl2ZSBhcnJheS4gKi9cclxuZXhwb3J0IGNsYXNzIEFycmF5RGF0YVNvdXJjZTxUPiBleHRlbmRzIERhdGFTb3VyY2U8VD4ge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2RhdGE6IFRbXSB8IFJlYWRvbmx5QXJyYXk8VD4gfCBPYnNlcnZhYmxlPFRbXSB8IFJlYWRvbmx5QXJyYXk8VD4+KSB7XHJcbiAgICBzdXBlcigpO1xyXG4gIH1cclxuXHJcbiAgY29ubmVjdCgpOiBPYnNlcnZhYmxlPFRbXSB8IFJlYWRvbmx5QXJyYXk8VD4+IHtcclxuICAgIHJldHVybiBpc09ic2VydmFibGUodGhpcy5fZGF0YSkgPyB0aGlzLl9kYXRhIDogb2JzZXJ2YWJsZU9mKHRoaXMuX2RhdGEpO1xyXG4gIH1cclxuXHJcbiAgZGlzY29ubmVjdCgpIHt9XHJcbn1cclxuIl19