/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export class DataSource {
}
/** Checks whether an object is a data source. */
export function isDataSource(value) {
    // Check if the value is a DataSource by observing if it has a connect function. Cannot
    // be checked as an `instanceof DataSource` since people could create their own sources
    // that match the interface, but don't extend DataSource.
    return value && typeof value.connect === 'function';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL2NvbGxlY3Rpb25zL2RhdGEtc291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUtILE1BQU0sT0FBZ0IsVUFBVTtDQW1CL0I7QUFFRCxpREFBaUQ7QUFDakQsTUFBTSxVQUFVLFlBQVksQ0FBQyxLQUFVO0lBQ3JDLHVGQUF1RjtJQUN2Rix1RkFBdUY7SUFDdkYseURBQXlEO0lBQ3pELE9BQU8sS0FBSyxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUM7QUFDdEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtDb2xsZWN0aW9uVmlld2VyfSBmcm9tICcuL2NvbGxlY3Rpb24tdmlld2VyJztcclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBEYXRhU291cmNlPFQ+IHtcclxuICAvKipcclxuICAgKiBDb25uZWN0cyBhIGNvbGxlY3Rpb24gdmlld2VyIChzdWNoIGFzIGEgZGF0YS10YWJsZSkgdG8gdGhpcyBkYXRhIHNvdXJjZS4gTm90ZSB0aGF0XHJcbiAgICogdGhlIHN0cmVhbSBwcm92aWRlZCB3aWxsIGJlIGFjY2Vzc2VkIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBzaG91bGQgbm90IGRpcmVjdGx5IGNoYW5nZVxyXG4gICAqIHZhbHVlcyB0aGF0IGFyZSBib3VuZCBpbiB0ZW1wbGF0ZSB2aWV3cy5cclxuICAgKiBAcGFyYW0gY29sbGVjdGlvblZpZXdlciBUaGUgY29tcG9uZW50IHRoYXQgZXhwb3NlcyBhIHZpZXcgb3ZlciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGlzXHJcbiAgICogICAgIGRhdGEgc291cmNlLlxyXG4gICAqIEByZXR1cm5zIE9ic2VydmFibGUgdGhhdCBlbWl0cyBhIG5ldyB2YWx1ZSB3aGVuIHRoZSBkYXRhIGNoYW5nZXMuXHJcbiAgICovXHJcbiAgYWJzdHJhY3QgY29ubmVjdChjb2xsZWN0aW9uVmlld2VyOiBDb2xsZWN0aW9uVmlld2VyKTogT2JzZXJ2YWJsZTxUW10gfCBSZWFkb25seUFycmF5PFQ+PjtcclxuXHJcbiAgLyoqXHJcbiAgICogRGlzY29ubmVjdHMgYSBjb2xsZWN0aW9uIHZpZXdlciAoc3VjaCBhcyBhIGRhdGEtdGFibGUpIGZyb20gdGhpcyBkYXRhIHNvdXJjZS4gQ2FuIGJlIHVzZWRcclxuICAgKiB0byBwZXJmb3JtIGFueSBjbGVhbi11cCBvciB0ZWFyLWRvd24gb3BlcmF0aW9ucyB3aGVuIGEgdmlldyBpcyBiZWluZyBkZXN0cm95ZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY29sbGVjdGlvblZpZXdlciBUaGUgY29tcG9uZW50IHRoYXQgZXhwb3NlcyBhIHZpZXcgb3ZlciB0aGUgZGF0YSBwcm92aWRlZCBieSB0aGlzXHJcbiAgICogICAgIGRhdGEgc291cmNlLlxyXG4gICAqL1xyXG4gIGFic3RyYWN0IGRpc2Nvbm5lY3QoY29sbGVjdGlvblZpZXdlcjogQ29sbGVjdGlvblZpZXdlcik6IHZvaWQ7XHJcbn1cclxuXHJcbi8qKiBDaGVja3Mgd2hldGhlciBhbiBvYmplY3QgaXMgYSBkYXRhIHNvdXJjZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YVNvdXJjZSh2YWx1ZTogYW55KTogdmFsdWUgaXMgRGF0YVNvdXJjZTxhbnk+IHtcclxuICAvLyBDaGVjayBpZiB0aGUgdmFsdWUgaXMgYSBEYXRhU291cmNlIGJ5IG9ic2VydmluZyBpZiBpdCBoYXMgYSBjb25uZWN0IGZ1bmN0aW9uLiBDYW5ub3RcclxuICAvLyBiZSBjaGVja2VkIGFzIGFuIGBpbnN0YW5jZW9mIERhdGFTb3VyY2VgIHNpbmNlIHBlb3BsZSBjb3VsZCBjcmVhdGUgdGhlaXIgb3duIHNvdXJjZXNcclxuICAvLyB0aGF0IG1hdGNoIHRoZSBpbnRlcmZhY2UsIGJ1dCBkb24ndCBleHRlbmQgRGF0YVNvdXJjZS5cclxuICByZXR1cm4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmNvbm5lY3QgPT09ICdmdW5jdGlvbic7XHJcbn1cclxuIl19