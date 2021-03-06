/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ListKeyManager } from './list-key-manager';
export class ActiveDescendantKeyManager extends ListKeyManager {
    setActiveItem(index) {
        if (this.activeItem) {
            this.activeItem.setInactiveStyles();
        }
        super.setActiveItem(index);
        if (this.activeItem) {
            this.activeItem.setActiveStyles();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlZGVzY2VuZGFudC1rZXktbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvYTExeS9rZXktbWFuYWdlci9hY3RpdmVkZXNjZW5kYW50LWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxjQUFjLEVBQXVCLE1BQU0sb0JBQW9CLENBQUM7QUFleEUsTUFBTSxPQUFPLDBCQUE4QixTQUFRLGNBQWlDO0lBa0JsRixhQUFhLENBQUMsS0FBVTtRQUN0QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQ3JDO1FBQ0QsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUNuQztJQUNILENBQUM7Q0FFRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtMaXN0S2V5TWFuYWdlciwgTGlzdEtleU1hbmFnZXJPcHRpb259IGZyb20gJy4vbGlzdC1rZXktbWFuYWdlcic7XHJcblxyXG4vKipcclxuICogVGhpcyBpcyB0aGUgaW50ZXJmYWNlIGZvciBoaWdobGlnaHRhYmxlIGl0ZW1zICh1c2VkIGJ5IHRoZSBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcikuXHJcbiAqIEVhY2ggaXRlbSBtdXN0IGtub3cgaG93IHRvIHN0eWxlIGl0c2VsZiBhcyBhY3RpdmUgb3IgaW5hY3RpdmUgYW5kIHdoZXRoZXIgb3Igbm90IGl0IGlzXHJcbiAqIGN1cnJlbnRseSBkaXNhYmxlZC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSGlnaGxpZ2h0YWJsZSBleHRlbmRzIExpc3RLZXlNYW5hZ2VyT3B0aW9uIHtcclxuICAvKiogQXBwbGllcyB0aGUgc3R5bGVzIGZvciBhbiBhY3RpdmUgaXRlbSB0byB0aGlzIGl0ZW0uICovXHJcbiAgc2V0QWN0aXZlU3R5bGVzKCk6IHZvaWQ7XHJcblxyXG4gIC8qKiBBcHBsaWVzIHRoZSBzdHlsZXMgZm9yIGFuIGluYWN0aXZlIGl0ZW0gdG8gdGhpcyBpdGVtLiAqL1xyXG4gIHNldEluYWN0aXZlU3R5bGVzKCk6IHZvaWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBBY3RpdmVEZXNjZW5kYW50S2V5TWFuYWdlcjxUPiBleHRlbmRzIExpc3RLZXlNYW5hZ2VyPEhpZ2hsaWdodGFibGUgJiBUPiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGFjdGl2ZSBpdGVtIHRvIHRoZSBpdGVtIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXggYW5kIGFkZHMgdGhlXHJcbiAgICogYWN0aXZlIHN0eWxlcyB0byB0aGUgbmV3bHkgYWN0aXZlIGl0ZW0uIEFsc28gcmVtb3ZlcyBhY3RpdmUgc3R5bGVzXHJcbiAgICogZnJvbSB0aGUgcHJldmlvdXNseSBhY3RpdmUgaXRlbS5cclxuICAgKiBAcGFyYW0gaW5kZXggSW5kZXggb2YgdGhlIGl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cclxuICAgKi9cclxuICBzZXRBY3RpdmVJdGVtKGluZGV4OiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBhY3RpdmUgaXRlbSB0byB0aGUgaXRlbSB0byB0aGUgc3BlY2lmaWVkIG9uZSBhbmQgYWRkcyB0aGVcclxuICAgKiBhY3RpdmUgc3R5bGVzIHRvIHRoZSBpdC4gQWxzbyByZW1vdmVzIGFjdGl2ZSBzdHlsZXMgZnJvbSB0aGVcclxuICAgKiBwcmV2aW91c2x5IGFjdGl2ZSBpdGVtLlxyXG4gICAqIEBwYXJhbSBpdGVtIEl0ZW0gdG8gYmUgc2V0IGFzIGFjdGl2ZS5cclxuICAgKi9cclxuICBzZXRBY3RpdmVJdGVtKGl0ZW06IFQpOiB2b2lkO1xyXG5cclxuICBzZXRBY3RpdmVJdGVtKGluZGV4OiBhbnkpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0pIHtcclxuICAgICAgdGhpcy5hY3RpdmVJdGVtLnNldEluYWN0aXZlU3R5bGVzKCk7XHJcbiAgICB9XHJcbiAgICBzdXBlci5zZXRBY3RpdmVJdGVtKGluZGV4KTtcclxuICAgIGlmICh0aGlzLmFjdGl2ZUl0ZW0pIHtcclxuICAgICAgdGhpcy5hY3RpdmVJdGVtLnNldEFjdGl2ZVN0eWxlcygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuIl19