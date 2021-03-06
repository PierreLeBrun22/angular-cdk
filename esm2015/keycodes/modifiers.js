/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Checks whether a modifier key is pressed.
 * @param event Event to be checked.
 */
export function hasModifierKey(event, ...modifiers) {
    if (modifiers.length) {
        return modifiers.some(modifier => event[modifier]);
    }
    return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kaWZpZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9rZXljb2Rlcy9tb2RpZmllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUg7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGNBQWMsQ0FBQyxLQUFvQixFQUFFLEdBQUcsU0FBd0I7SUFDOUUsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQ3BCLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ3BEO0lBRUQsT0FBTyxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQzFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbnR5cGUgTW9kaWZpZXJLZXkgPSAnYWx0S2V5JyB8ICdzaGlmdEtleScgfCAnY3RybEtleScgfCAnbWV0YUtleSc7XHJcblxyXG4vKipcclxuICogQ2hlY2tzIHdoZXRoZXIgYSBtb2RpZmllciBrZXkgaXMgcHJlc3NlZC5cclxuICogQHBhcmFtIGV2ZW50IEV2ZW50IHRvIGJlIGNoZWNrZWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaGFzTW9kaWZpZXJLZXkoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIC4uLm1vZGlmaWVyczogTW9kaWZpZXJLZXlbXSk6IGJvb2xlYW4ge1xyXG4gIGlmIChtb2RpZmllcnMubGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gbW9kaWZpZXJzLnNvbWUobW9kaWZpZXIgPT4gZXZlbnRbbW9kaWZpZXJdKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBldmVudC5hbHRLZXkgfHwgZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5O1xyXG59XHJcbiJdfQ==