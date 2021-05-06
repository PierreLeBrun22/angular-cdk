/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Coerces a value to an array of trimmed non-empty strings.
 * Any input that is not an array, `null` or `undefined` will be turned into a string
 * via `toString()` and subsequently split with the given separator.
 * `null` and `undefined` will result in an empty array.
 * This results in the following outcomes:
 * - `null` -&gt; `[]`
 * - `[null]` -&gt; `["null"]`
 * - `["a", "b ", " "]` -&gt; `["a", "b"]`
 * - `[1, [2, 3]]` -&gt; `["1", "2,3"]`
 * - `[{ a: 0 }]` -&gt; `["[object Object]"]`
 * - `{ a: 0 }` -&gt; `["[object", "Object]"]`
 *
 * Useful for defining CSS classes or table columns.
 * @param value the value to coerce into an array of strings
 * @param separator split-separator if value isn't an array
 */
export function coerceStringArray(value, separator = /\s+/) {
    const result = [];
    if (value != null) {
        const sourceValues = Array.isArray(value) ? value : `${value}`.split(separator);
        for (const sourceValue of sourceValues) {
            const trimmedString = `${sourceValue}`.trim();
            if (trimmedString) {
                result.push(trimmedString);
            }
        }
    }
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLWFycmF5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay9jb2VyY2lvbi9zdHJpbmctYXJyYXkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQUMsS0FBVSxFQUFFLFlBQTZCLEtBQUs7SUFDOUUsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBRWxCLElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtRQUNqQixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hGLEtBQUssTUFBTSxXQUFXLElBQUksWUFBWSxFQUFFO1lBQ3RDLE1BQU0sYUFBYSxHQUFHLEdBQUcsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUMsSUFBSSxhQUFhLEVBQUU7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7YUFDNUI7U0FDRjtLQUNGO0lBRUQsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIENvZXJjZXMgYSB2YWx1ZSB0byBhbiBhcnJheSBvZiB0cmltbWVkIG5vbi1lbXB0eSBzdHJpbmdzLlxyXG4gKiBBbnkgaW5wdXQgdGhhdCBpcyBub3QgYW4gYXJyYXksIGBudWxsYCBvciBgdW5kZWZpbmVkYCB3aWxsIGJlIHR1cm5lZCBpbnRvIGEgc3RyaW5nXHJcbiAqIHZpYSBgdG9TdHJpbmcoKWAgYW5kIHN1YnNlcXVlbnRseSBzcGxpdCB3aXRoIHRoZSBnaXZlbiBzZXBhcmF0b3IuXHJcbiAqIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgd2lsbCByZXN1bHQgaW4gYW4gZW1wdHkgYXJyYXkuXHJcbiAqIFRoaXMgcmVzdWx0cyBpbiB0aGUgZm9sbG93aW5nIG91dGNvbWVzOlxyXG4gKiAtIGBudWxsYCAtJmd0OyBgW11gXHJcbiAqIC0gYFtudWxsXWAgLSZndDsgYFtcIm51bGxcIl1gXHJcbiAqIC0gYFtcImFcIiwgXCJiIFwiLCBcIiBcIl1gIC0mZ3Q7IGBbXCJhXCIsIFwiYlwiXWBcclxuICogLSBgWzEsIFsyLCAzXV1gIC0mZ3Q7IGBbXCIxXCIsIFwiMiwzXCJdYFxyXG4gKiAtIGBbeyBhOiAwIH1dYCAtJmd0OyBgW1wiW29iamVjdCBPYmplY3RdXCJdYFxyXG4gKiAtIGB7IGE6IDAgfWAgLSZndDsgYFtcIltvYmplY3RcIiwgXCJPYmplY3RdXCJdYFxyXG4gKlxyXG4gKiBVc2VmdWwgZm9yIGRlZmluaW5nIENTUyBjbGFzc2VzIG9yIHRhYmxlIGNvbHVtbnMuXHJcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gY29lcmNlIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5nc1xyXG4gKiBAcGFyYW0gc2VwYXJhdG9yIHNwbGl0LXNlcGFyYXRvciBpZiB2YWx1ZSBpc24ndCBhbiBhcnJheVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvZXJjZVN0cmluZ0FycmF5KHZhbHVlOiBhbnksIHNlcGFyYXRvcjogc3RyaW5nIHwgUmVnRXhwID0gL1xccysvKTogc3RyaW5nW10ge1xyXG4gIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG5cclxuICBpZiAodmFsdWUgIT0gbnVsbCkge1xyXG4gICAgY29uc3Qgc291cmNlVmFsdWVzID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IGAke3ZhbHVlfWAuc3BsaXQoc2VwYXJhdG9yKTtcclxuICAgIGZvciAoY29uc3Qgc291cmNlVmFsdWUgb2Ygc291cmNlVmFsdWVzKSB7XHJcbiAgICAgIGNvbnN0IHRyaW1tZWRTdHJpbmcgPSBgJHtzb3VyY2VWYWx1ZX1gLnRyaW0oKTtcclxuICAgICAgaWYgKHRyaW1tZWRTdHJpbmcpIHtcclxuICAgICAgICByZXN1bHQucHVzaCh0cmltbWVkU3RyaW5nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4iXX0=