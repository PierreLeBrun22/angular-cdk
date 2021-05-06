/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Cached result Set of input types support by the current browser. */
let supportedInputTypes;
/** Types of `<input>` that *might* be supported. */
const candidateInputTypes = [
    // `color` must come first. Chrome 56 shows a warning if we change the type to `color` after
    // first changing it to something else:
    // The specified value "" does not conform to the required format.
    // The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.
    'color',
    'button',
    'checkbox',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
];
/** @returns The input types supported by this browser. */
export function getSupportedInputTypes() {
    // Result is cached.
    if (supportedInputTypes) {
        return supportedInputTypes;
    }
    // We can't check if an input type is not supported until we're on the browser, so say that
    // everything is supported when not on the browser. We don't use `Platform` here since it's
    // just a helper function and can't inject it.
    if (typeof document !== 'object' || !document) {
        supportedInputTypes = new Set(candidateInputTypes);
        return supportedInputTypes;
    }
    let featureTestInput = document.createElement('input');
    supportedInputTypes = new Set(candidateInputTypes.filter(value => {
        featureTestInput.setAttribute('type', value);
        return featureTestInput.type === value;
    }));
    return supportedInputTypes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtdHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3BsYXRmb3JtL2ZlYXR1cmVzL2lucHV0LXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILHVFQUF1RTtBQUN2RSxJQUFJLG1CQUFnQyxDQUFDO0FBRXJDLG9EQUFvRDtBQUNwRCxNQUFNLG1CQUFtQixHQUFHO0lBQzFCLDRGQUE0RjtJQUM1Rix1Q0FBdUM7SUFDdkMsa0VBQWtFO0lBQ2xFLDhFQUE4RTtJQUM5RSxPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixNQUFNO0lBQ04sZ0JBQWdCO0lBQ2hCLE9BQU87SUFDUCxNQUFNO0lBQ04sUUFBUTtJQUNSLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsUUFBUTtJQUNSLEtBQUs7SUFDTCxNQUFNO0lBQ04sTUFBTTtJQUNOLEtBQUs7SUFDTCxNQUFNO0NBQ1AsQ0FBQztBQUVGLDBEQUEwRDtBQUMxRCxNQUFNLFVBQVUsc0JBQXNCO0lBQ3BDLG9CQUFvQjtJQUNwQixJQUFJLG1CQUFtQixFQUFFO1FBQ3ZCLE9BQU8sbUJBQW1CLENBQUM7S0FDNUI7SUFFRCwyRkFBMkY7SUFDM0YsMkZBQTJGO0lBQzNGLDhDQUE4QztJQUM5QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUM3QyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sbUJBQW1CLENBQUM7S0FDNUI7SUFFRCxJQUFJLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQy9ELGdCQUFnQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDN0MsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDO0lBQ3pDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFSixPQUFPLG1CQUFtQixDQUFDO0FBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbi8qKiBDYWNoZWQgcmVzdWx0IFNldCBvZiBpbnB1dCB0eXBlcyBzdXBwb3J0IGJ5IHRoZSBjdXJyZW50IGJyb3dzZXIuICovXHJcbmxldCBzdXBwb3J0ZWRJbnB1dFR5cGVzOiBTZXQ8c3RyaW5nPjtcclxuXHJcbi8qKiBUeXBlcyBvZiBgPGlucHV0PmAgdGhhdCAqbWlnaHQqIGJlIHN1cHBvcnRlZC4gKi9cclxuY29uc3QgY2FuZGlkYXRlSW5wdXRUeXBlcyA9IFtcclxuICAvLyBgY29sb3JgIG11c3QgY29tZSBmaXJzdC4gQ2hyb21lIDU2IHNob3dzIGEgd2FybmluZyBpZiB3ZSBjaGFuZ2UgdGhlIHR5cGUgdG8gYGNvbG9yYCBhZnRlclxyXG4gIC8vIGZpcnN0IGNoYW5naW5nIGl0IHRvIHNvbWV0aGluZyBlbHNlOlxyXG4gIC8vIFRoZSBzcGVjaWZpZWQgdmFsdWUgXCJcIiBkb2VzIG5vdCBjb25mb3JtIHRvIHRoZSByZXF1aXJlZCBmb3JtYXQuXHJcbiAgLy8gVGhlIGZvcm1hdCBpcyBcIiNycmdnYmJcIiB3aGVyZSByciwgZ2csIGJiIGFyZSB0d28tZGlnaXQgaGV4YWRlY2ltYWwgbnVtYmVycy5cclxuICAnY29sb3InLFxyXG4gICdidXR0b24nLFxyXG4gICdjaGVja2JveCcsXHJcbiAgJ2RhdGUnLFxyXG4gICdkYXRldGltZS1sb2NhbCcsXHJcbiAgJ2VtYWlsJyxcclxuICAnZmlsZScsXHJcbiAgJ2hpZGRlbicsXHJcbiAgJ2ltYWdlJyxcclxuICAnbW9udGgnLFxyXG4gICdudW1iZXInLFxyXG4gICdwYXNzd29yZCcsXHJcbiAgJ3JhZGlvJyxcclxuICAncmFuZ2UnLFxyXG4gICdyZXNldCcsXHJcbiAgJ3NlYXJjaCcsXHJcbiAgJ3N1Ym1pdCcsXHJcbiAgJ3RlbCcsXHJcbiAgJ3RleHQnLFxyXG4gICd0aW1lJyxcclxuICAndXJsJyxcclxuICAnd2VlaycsXHJcbl07XHJcblxyXG4vKiogQHJldHVybnMgVGhlIGlucHV0IHR5cGVzIHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXIuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTdXBwb3J0ZWRJbnB1dFR5cGVzKCk6IFNldDxzdHJpbmc+IHtcclxuICAvLyBSZXN1bHQgaXMgY2FjaGVkLlxyXG4gIGlmIChzdXBwb3J0ZWRJbnB1dFR5cGVzKSB7XHJcbiAgICByZXR1cm4gc3VwcG9ydGVkSW5wdXRUeXBlcztcclxuICB9XHJcblxyXG4gIC8vIFdlIGNhbid0IGNoZWNrIGlmIGFuIGlucHV0IHR5cGUgaXMgbm90IHN1cHBvcnRlZCB1bnRpbCB3ZSdyZSBvbiB0aGUgYnJvd3Nlciwgc28gc2F5IHRoYXRcclxuICAvLyBldmVyeXRoaW5nIGlzIHN1cHBvcnRlZCB3aGVuIG5vdCBvbiB0aGUgYnJvd3Nlci4gV2UgZG9uJ3QgdXNlIGBQbGF0Zm9ybWAgaGVyZSBzaW5jZSBpdCdzXHJcbiAgLy8ganVzdCBhIGhlbHBlciBmdW5jdGlvbiBhbmQgY2FuJ3QgaW5qZWN0IGl0LlxyXG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICdvYmplY3QnIHx8ICFkb2N1bWVudCkge1xyXG4gICAgc3VwcG9ydGVkSW5wdXRUeXBlcyA9IG5ldyBTZXQoY2FuZGlkYXRlSW5wdXRUeXBlcyk7XHJcbiAgICByZXR1cm4gc3VwcG9ydGVkSW5wdXRUeXBlcztcclxuICB9XHJcblxyXG4gIGxldCBmZWF0dXJlVGVzdElucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICBzdXBwb3J0ZWRJbnB1dFR5cGVzID0gbmV3IFNldChjYW5kaWRhdGVJbnB1dFR5cGVzLmZpbHRlcih2YWx1ZSA9PiB7XHJcbiAgICBmZWF0dXJlVGVzdElucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsIHZhbHVlKTtcclxuICAgIHJldHVybiBmZWF0dXJlVGVzdElucHV0LnR5cGUgPT09IHZhbHVlO1xyXG4gIH0pKTtcclxuXHJcbiAgcmV0dXJuIHN1cHBvcnRlZElucHV0VHlwZXM7XHJcbn1cclxuIl19