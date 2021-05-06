/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { parallel } from './change-detection';
/**
 * Base class for component harnesses that all component harness authors should extend. This base
 * component harness provides the basic ability to locate element and sub-component harness. It
 * should be inherited when defining user's own harness.
 */
export class ComponentHarness {
    constructor(locatorFactory) {
        this.locatorFactory = locatorFactory;
    }
    /** Gets a `Promise` for the `TestElement` representing the host element of the component. */
    host() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.rootElement;
        });
    }
    /**
     * Gets a `LocatorFactory` for the document root element. This factory can be used to create
     * locators for elements that a component creates outside of its own root element. (e.g. by
     * appending to document.body).
     */
    documentRootLocatorFactory() {
        return this.locatorFactory.documentRootLocatorFactory();
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` rejects. The type that the `Promise` resolves to is a union of all result types for
     *   each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorFor(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorFor('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorFor('span')()` throws because the `Promise` rejects.
     */
    locatorFor(...queries) {
        return this.locatorFactory.locatorFor(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find a `ComponentHarness` instance
     * or element under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for the
     *   first element or harness matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If no matches are found, the
     *   `Promise` is resolved with `null`. The type that the `Promise` resolves to is a union of all
     *   result types for each query or null.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'`:
     * - `await ch.locatorForOptional(DivHarness, 'div')()` gets a `DivHarness` instance for `#d1`
     * - `await ch.locatorForOptional('div', DivHarness)()` gets a `TestElement` instance for `#d1`
     * - `await ch.locatorForOptional('span')()` gets `null`.
     */
    locatorForOptional(...queries) {
        return this.locatorFactory.locatorForOptional(...queries);
    }
    /**
     * Creates an asynchronous locator function that can be used to find `ComponentHarness` instances
     * or elements under the host element of this `ComponentHarness`.
     * @param queries A list of queries specifying which harnesses and elements to search for:
     *   - A `string` searches for elements matching the CSS selector specified by the string.
     *   - A `ComponentHarness` constructor searches for `ComponentHarness` instances matching the
     *     given class.
     *   - A `HarnessPredicate` searches for `ComponentHarness` instances matching the given
     *     predicate.
     * @return An asynchronous locator function that searches for and returns a `Promise` for all
     *   elements and harnesses matching the given search criteria. Matches are ordered first by
     *   order in the DOM, and second by order in the queries list. If an element matches more than
     *   one `ComponentHarness` class, the locator gets an instance of each for the same element. If
     *   an element matches multiple `string` selectors, only one `TestElement` instance is returned
     *   for that element. The type that the `Promise` resolves to is an array where each element is
     *   the union of all result types for each query.
     *
     * e.g. Given the following DOM: `<div id="d1" /><div id="d2" />`, and assuming
     * `DivHarness.hostSelector === 'div'` and `IdIsD1Harness.hostSelector === '#d1'`:
     * - `await ch.locatorForAll(DivHarness, 'div')()` gets `[
     *     DivHarness, // for #d1
     *     TestElement, // for #d1
     *     DivHarness, // for #d2
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll('div', '#d1')()` gets `[
     *     TestElement, // for #d1
     *     TestElement // for #d2
     *   ]`
     * - `await ch.locatorForAll(DivHarness, IdIsD1Harness)()` gets `[
     *     DivHarness, // for #d1
     *     IdIsD1Harness, // for #d1
     *     DivHarness // for #d2
     *   ]`
     * - `await ch.locatorForAll('span')()` gets `[]`.
     */
    locatorForAll(...queries) {
        return this.locatorFactory.locatorForAll(...queries);
    }
    /**
     * Flushes change detection and async tasks in the Angular zone.
     * In most cases it should not be necessary to call this manually. However, there may be some edge
     * cases where it is needed to fully flush animation events.
     */
    forceStabilize() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.forceStabilize();
        });
    }
    /**
     * Waits for all scheduled or running async tasks to complete. This allows harness
     * authors to wait for async tasks outside of the Angular zone.
     */
    waitForTasksOutsideAngular() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.waitForTasksOutsideAngular();
        });
    }
}
/**
 * Base class for component harnesses that authors should extend if they anticipate that consumers
 * of the harness may want to access other harnesses within the `<ng-content>` of the component.
 */
export class ContentContainerComponentHarness extends ComponentHarness {
    getChildLoader(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getChildLoader(selector);
        });
    }
    getAllChildLoaders(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getAllChildLoaders(selector);
        });
    }
    getHarness(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getHarness(query);
        });
    }
    getAllHarnesses(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.getRootHarnessLoader()).getAllHarnesses(query);
        });
    }
    /**
     * Gets the root harness loader from which to start
     * searching for content contained by this harness.
     */
    getRootHarnessLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.locatorFactory.rootHarnessLoader();
        });
    }
}
/**
 * A class used to associate a ComponentHarness class with predicates functions that can be used to
 * filter instances of the class.
 */
export class HarnessPredicate {
    constructor(harnessType, options) {
        this.harnessType = harnessType;
        this._predicates = [];
        this._descriptions = [];
        this._addBaseOptions(options);
    }
    /**
     * Checks if the specified nullable string value matches the given pattern.
     * @param value The nullable string value to check, or a Promise resolving to the
     *   nullable string value.
     * @param pattern The pattern the value is expected to match. If `pattern` is a string,
     *   `value` is expected to match exactly. If `pattern` is a regex, a partial match is
     *   allowed. If `pattern` is `null`, the value is expected to be `null`.
     * @return Whether the value matches the pattern.
     */
    static stringMatches(value, pattern) {
        return __awaiter(this, void 0, void 0, function* () {
            value = yield value;
            if (pattern === null) {
                return value === null;
            }
            else if (value === null) {
                return false;
            }
            return typeof pattern === 'string' ? value === pattern : pattern.test(value);
        });
    }
    /**
     * Adds a predicate function to be run against candidate harnesses.
     * @param description A description of this predicate that may be used in error messages.
     * @param predicate An async predicate function.
     * @return this (for method chaining).
     */
    add(description, predicate) {
        this._descriptions.push(description);
        this._predicates.push(predicate);
        return this;
    }
    /**
     * Adds a predicate function that depends on an option value to be run against candidate
     * harnesses. If the option value is undefined, the predicate will be ignored.
     * @param name The name of the option (may be used in error messages).
     * @param option The option value.
     * @param predicate The predicate function to run if the option value is not undefined.
     * @return this (for method chaining).
     */
    addOption(name, option, predicate) {
        if (option !== undefined) {
            this.add(`${name} = ${_valueAsString(option)}`, item => predicate(item, option));
        }
        return this;
    }
    /**
     * Filters a list of harnesses on this predicate.
     * @param harnesses The list of harnesses to filter.
     * @return A list of harnesses that satisfy this predicate.
     */
    filter(harnesses) {
        return __awaiter(this, void 0, void 0, function* () {
            if (harnesses.length === 0) {
                return [];
            }
            const results = yield parallel(() => harnesses.map(h => this.evaluate(h)));
            return harnesses.filter((_, i) => results[i]);
        });
    }
    /**
     * Evaluates whether the given harness satisfies this predicate.
     * @param harness The harness to check
     * @return A promise that resolves to true if the harness satisfies this predicate,
     *   and resolves to false otherwise.
     */
    evaluate(harness) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield parallel(() => this._predicates.map(p => p(harness)));
            return results.reduce((combined, current) => combined && current, true);
        });
    }
    /** Gets a description of this predicate for use in error messages. */
    getDescription() {
        return this._descriptions.join(', ');
    }
    /** Gets the selector used to find candidate elements. */
    getSelector() {
        return this._ancestor.split(',')
            .map(part => `${part.trim()} ${this.harnessType.hostSelector}`.trim())
            .join(',');
    }
    /** Adds base options common to all harness types. */
    _addBaseOptions(options) {
        this._ancestor = options.ancestor || '';
        if (this._ancestor) {
            this._descriptions.push(`has ancestor matching selector "${this._ancestor}"`);
        }
        const selector = options.selector;
        if (selector !== undefined) {
            this.add(`host matches selector "${selector}"`, (item) => __awaiter(this, void 0, void 0, function* () {
                return (yield item.host()).matchesSelector(selector);
            }));
        }
    }
}
/** Represent a value as a string for the purpose of logging. */
function _valueAsString(value) {
    if (value === undefined) {
        return 'undefined';
    }
    // `JSON.stringify` doesn't handle RegExp properly, so we need a custom replacer.
    try {
        return JSON.stringify(value, (_, v) => {
            if (v instanceof RegExp) {
                return `/${v.toString()}/`;
            }
            return typeof v === 'string' ? v.replace('/\//g', '\\/') : v;
        }).replace(/"\/\//g, '\\/').replace(/\/\/"/g, '\\/').replace(/\\\//g, '/');
    }
    catch (_a) {
        // `JSON.stringify` will throw if the object is cyclical,
        // in this case the best we can do is report the value as `{...}`.
        return '{...}';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWhhcm5lc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3Rlc3RpbmcvY29tcG9uZW50LWhhcm5lc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQTZPNUM7Ozs7R0FJRztBQUNILE1BQU0sT0FBZ0IsZ0JBQWdCO0lBQ3BDLFlBQStCLGNBQThCO1FBQTlCLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtJQUFHLENBQUM7SUFFakUsNkZBQTZGO0lBQ3ZGLElBQUk7O1lBQ1IsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztRQUN6QyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ08sMEJBQTBCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQzFELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDTyxVQUFVLENBQTJDLEdBQUcsT0FBVTtRQUUxRSxPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW9CRztJQUNPLGtCQUFrQixDQUEyQyxHQUFHLE9BQVU7UUFFbEYsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQW1DRztJQUNPLGFBQWEsQ0FBMkMsR0FBRyxPQUFVO1FBRTdFLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNhLGNBQWM7O1lBQzVC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QU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztLQUM1RTtJQUFDLFdBQU07UUFDTix5REFBeUQ7UUFDekQsa0VBQWtFO1FBQ2xFLE9BQU8sT0FBTyxDQUFDO0tBQ2hCO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtwYXJhbGxlbH0gZnJvbSAnLi9jaGFuZ2UtZGV0ZWN0aW9uJztcclxuaW1wb3J0IHtUZXN0RWxlbWVudH0gZnJvbSAnLi90ZXN0LWVsZW1lbnQnO1xyXG5cclxuLyoqIEFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHByb21pc2Ugd2hlbiBjYWxsZWQuICovXHJcbmV4cG9ydCB0eXBlIEFzeW5jRmFjdG9yeUZuPFQ+ID0gKCkgPT4gUHJvbWlzZTxUPjtcclxuXHJcbi8qKiBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHRha2VzIGFuIGl0ZW0gYW5kIHJldHVybnMgYSBib29sZWFuIHByb21pc2UgKi9cclxuZXhwb3J0IHR5cGUgQXN5bmNQcmVkaWNhdGU8VD4gPSAoaXRlbTogVCkgPT4gUHJvbWlzZTxib29sZWFuPjtcclxuXHJcbi8qKiBBbiBhc3luYyBmdW5jdGlvbiB0aGF0IHRha2VzIGFuIGl0ZW0gYW5kIGFuIG9wdGlvbiB2YWx1ZSBhbmQgcmV0dXJucyBhIGJvb2xlYW4gcHJvbWlzZS4gKi9cclxuZXhwb3J0IHR5cGUgQXN5bmNPcHRpb25QcmVkaWNhdGU8VCwgTz4gPSAoaXRlbTogVCwgb3B0aW9uOiBPKSA9PiBQcm9taXNlPGJvb2xlYW4+O1xyXG5cclxuLyoqXHJcbiAqIEEgcXVlcnkgZm9yIGEgYENvbXBvbmVudEhhcm5lc3NgLCB3aGljaCBpcyBleHByZXNzZWQgYXMgZWl0aGVyIGEgYENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcmAgb3JcclxuICogYSBgSGFybmVzc1ByZWRpY2F0ZWAuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBIYXJuZXNzUXVlcnk8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+ID1cclxuICAgIENvbXBvbmVudEhhcm5lc3NDb25zdHJ1Y3RvcjxUPiB8IEhhcm5lc3NQcmVkaWNhdGU8VD47XHJcblxyXG4vKipcclxuICogVGhlIHJlc3VsdCB0eXBlIG9idGFpbmVkIHdoZW4gc2VhcmNoaW5nIHVzaW5nIGEgcGFydGljdWxhciBsaXN0IG9mIHF1ZXJpZXMuIFRoaXMgdHlwZSBkZXBlbmRzIG9uXHJcbiAqIHRoZSBwYXJ0aWN1bGFyIGl0ZW1zIGJlaW5nIHF1ZXJpZWQuXHJcbiAqIC0gSWYgb25lIG9mIHRoZSBxdWVyaWVzIGlzIGZvciBhIGBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8QzE+YCwgaXQgbWVhbnMgdGhhdCB0aGUgcmVzdWx0XHJcbiAqICAgbWlnaHQgYmUgYSBoYXJuZXNzIG9mIHR5cGUgYEMxYFxyXG4gKiAtIElmIG9uZSBvZiB0aGUgcXVlcmllcyBpcyBmb3IgYSBgSGFybmVzc1ByZWRpY2F0ZTxDMj5gLCBpdCBtZWFucyB0aGF0IHRoZSByZXN1bHQgbWlnaHQgYmUgYVxyXG4gKiAgIGhhcm5lc3Mgb2YgdHlwZSBgQzJgXHJcbiAqIC0gSWYgb25lIG9mIHRoZSBxdWVyaWVzIGlzIGZvciBhIGBzdHJpbmdgLCBpdCBtZWFucyB0aGF0IHRoZSByZXN1bHQgbWlnaHQgYmUgYSBgVGVzdEVsZW1lbnRgLlxyXG4gKlxyXG4gKiBTaW5jZSB3ZSBkb24ndCBrbm93IGZvciBzdXJlIHdoaWNoIHF1ZXJ5IHdpbGwgbWF0Y2gsIHRoZSByZXN1bHQgdHlwZSBpZiB0aGUgdW5pb24gb2YgdGhlIHR5cGVzXHJcbiAqIGZvciBhbGwgcG9zc2libGUgcmVzdWx0cy5cclxuICpcclxuICogZS5nLlxyXG4gKiBUaGUgdHlwZTpcclxuICogYExvY2F0b3JGblJlc3VsdCZsdDtbXHJcbiAqICAgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yJmx0O015SGFybmVzcyZndDssXHJcbiAqICAgSGFybmVzc1ByZWRpY2F0ZSZsdDtNeU90aGVySGFybmVzcyZndDssXHJcbiAqICAgc3RyaW5nXHJcbiAqIF0mZ3Q7YFxyXG4gKiBpcyBlcXVpdmFsZW50IHRvOlxyXG4gKiBgTXlIYXJuZXNzIHwgTXlPdGhlckhhcm5lc3MgfCBUZXN0RWxlbWVudGAuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBMb2NhdG9yRm5SZXN1bHQ8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4gPSB7XHJcbiAgW0kgaW4ga2V5b2YgVF06XHJcbiAgICAgIC8vIE1hcCBgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPEM+YCB0byBgQ2AuXHJcbiAgICAgIFRbSV0gZXh0ZW5kcyBuZXcgKC4uLmFyZ3M6IGFueVtdKSA9PiBpbmZlciBDID8gQyA6XHJcbiAgICAgIC8vIE1hcCBgSGFybmVzc1ByZWRpY2F0ZTxDPmAgdG8gYENgLlxyXG4gICAgICBUW0ldIGV4dGVuZHMgeyBoYXJuZXNzVHlwZTogbmV3ICguLi5hcmdzOiBhbnlbXSkgPT4gaW5mZXIgQyB9ID8gQyA6XHJcbiAgICAgIC8vIE1hcCBgc3RyaW5nYCB0byBgVGVzdEVsZW1lbnRgLlxyXG4gICAgICBUW0ldIGV4dGVuZHMgc3RyaW5nID8gVGVzdEVsZW1lbnQgOlxyXG4gICAgICAvLyBNYXAgZXZlcnl0aGluZyBlbHNlIHRvIGBuZXZlcmAgKHNob3VsZCBub3QgaGFwcGVuIGR1ZSB0byB0aGUgdHlwZSBjb25zdHJhaW50IG9uIGBUYCkuXHJcbiAgICAgIG5ldmVyO1xyXG59W251bWJlcl07XHJcblxyXG5cclxuLyoqXHJcbiAqIEludGVyZmFjZSB1c2VkIHRvIGxvYWQgQ29tcG9uZW50SGFybmVzcyBvYmplY3RzLiBUaGlzIGludGVyZmFjZSBpcyB1c2VkIGJ5IHRlc3QgYXV0aG9ycyB0b1xyXG4gKiBpbnN0YW50aWF0ZSBgQ29tcG9uZW50SGFybmVzc2Blcy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgSGFybmVzc0xvYWRlciB7XHJcbiAgLyoqXHJcbiAgICogU2VhcmNoZXMgZm9yIGFuIGVsZW1lbnQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhlIGN1cnJlbnQgaW5zdGFuY2VzJ3Mgcm9vdCBlbGVtZW50LFxyXG4gICAqIGFuZCByZXR1cm5zIGEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgbWF0Y2hpbmcgZWxlbWVudC4gSWYgbXVsdGlwbGUgZWxlbWVudHMgbWF0Y2ggdGhlXHJcbiAgICogc2VsZWN0b3IsIHRoZSBmaXJzdCBpcyB1c2VkLiBJZiBubyBlbGVtZW50cyBtYXRjaCwgYW4gZXJyb3IgaXMgdGhyb3duLlxyXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIG5ldyBgSGFybmVzc0xvYWRlcmBcclxuICAgKiBAcmV0dXJuIEEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IuXHJcbiAgICogQHRocm93cyBJZiBhIG1hdGNoaW5nIGVsZW1lbnQgY2FuJ3QgYmUgZm91bmQuXHJcbiAgICovXHJcbiAgZ2V0Q2hpbGRMb2FkZXIoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlYXJjaGVzIGZvciBhbGwgZWxlbWVudHMgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IgdW5kZXIgdGhlIGN1cnJlbnQgaW5zdGFuY2VzJ3Mgcm9vdCBlbGVtZW50LFxyXG4gICAqIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIGBIYXJuZXNzTG9hZGVyYHMsIG9uZSBmb3IgZWFjaCBtYXRjaGluZyBlbGVtZW50LCByb290ZWQgYXQgdGhhdFxyXG4gICAqIGVsZW1lbnQuXHJcbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciBmb3IgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGUgbmV3IGBIYXJuZXNzTG9hZGVyYFxyXG4gICAqIEByZXR1cm4gQSBsaXN0IG9mIGBIYXJuZXNzTG9hZGVyYHMsIG9uZSBmb3IgZWFjaCBtYXRjaGluZyBlbGVtZW50LCByb290ZWQgYXQgdGhhdCBlbGVtZW50LlxyXG4gICAqL1xyXG4gIGdldEFsbENoaWxkTG9hZGVycyhzZWxlY3Rvcjogc3RyaW5nKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyW10+O1xyXG5cclxuICAvKipcclxuICAgKiBTZWFyY2hlcyBmb3IgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgdW5kZXIgdGhlXHJcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGBDb21wb25lbnRIYXJuZXNzYCBmb3IgdGhhdCBpbnN0YW5jZS4gSWYgbXVsdGlwbGVcclxuICAgKiBtYXRjaGluZyBjb21wb25lbnRzIGFyZSBmb3VuZCwgYSBoYXJuZXNzIGZvciB0aGUgZmlyc3Qgb25lIGlzIHJldHVybmVkLiBJZiBubyBtYXRjaGluZ1xyXG4gICAqIGNvbXBvbmVudCBpcyBmb3VuZCwgYW4gZXJyb3IgaXMgdGhyb3duLlxyXG4gICAqIEBwYXJhbSBxdWVyeSBBIHF1ZXJ5IGZvciBhIGhhcm5lc3MgdG8gY3JlYXRlXHJcbiAgICogQHJldHVybiBBbiBpbnN0YW5jZSBvZiB0aGUgZ2l2ZW4gaGFybmVzcyB0eXBlXHJcbiAgICogQHRocm93cyBJZiBhIG1hdGNoaW5nIGNvbXBvbmVudCBpbnN0YW5jZSBjYW4ndCBiZSBmb3VuZC5cclxuICAgKi9cclxuICBnZXRIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUPjtcclxuXHJcbiAgLyoqXHJcbiAgICogU2VhcmNoZXMgZm9yIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGNvbXBvbmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUgdW5kZXIgdGhlXHJcbiAgICogYEhhcm5lc3NMb2FkZXJgJ3Mgcm9vdCBlbGVtZW50LCBhbmQgcmV0dXJucyBhIGxpc3QgYENvbXBvbmVudEhhcm5lc3NgIGZvciBlYWNoIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSBxdWVyeSBBIHF1ZXJ5IGZvciBhIGhhcm5lc3MgdG8gY3JlYXRlXHJcbiAgICogQHJldHVybiBBIGxpc3QgaW5zdGFuY2VzIG9mIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUuXHJcbiAgICovXHJcbiAgZ2V0QWxsSGFybmVzc2VzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUW10+O1xyXG59XHJcblxyXG4vKipcclxuICogSW50ZXJmYWNlIHVzZWQgdG8gY3JlYXRlIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9ucyB1c2VkIGZpbmQgZWxlbWVudHMgYW5kIGNvbXBvbmVudFxyXG4gKiBoYXJuZXNzZXMuIFRoaXMgaW50ZXJmYWNlIGlzIHVzZWQgYnkgYENvbXBvbmVudEhhcm5lc3NgIGF1dGhvcnMgdG8gY3JlYXRlIGxvY2F0b3IgZnVuY3Rpb25zIGZvclxyXG4gKiB0aGVpciBgQ29tcG9uZW50SGFybmVzc2Agc3ViY2xhc3MuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvY2F0b3JGYWN0b3J5IHtcclxuICAvKiogR2V0cyBhIGxvY2F0b3IgZmFjdG9yeSByb290ZWQgYXQgdGhlIGRvY3VtZW50IHJvb3QuICovXHJcbiAgZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTogTG9jYXRvckZhY3Rvcnk7XHJcblxyXG4gIC8qKiBUaGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YCBhcyBhIGBUZXN0RWxlbWVudGAuICovXHJcbiAgcm9vdEVsZW1lbnQ6IFRlc3RFbGVtZW50O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBhIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZVxyXG4gICAqIG9yIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXHJcbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XHJcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXHJcbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxyXG4gICAqICAgICBnaXZlbiBjbGFzcy5cclxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXHJcbiAgICogICAgIHByZWRpY2F0ZS5cclxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcclxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XHJcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcclxuICAgKiAgIGBQcm9taXNlYCByZWplY3RzLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGwgcmVzdWx0IHR5cGVzIGZvclxyXG4gICAqICAgZWFjaCBxdWVyeS5cclxuICAgKlxyXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXHJcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XHJcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvcihEaXZIYXJuZXNzLCAnZGl2JykoKWAgZ2V0cyBhIGBEaXZIYXJuZXNzYCBpbnN0YW5jZSBmb3IgYCNkMWBcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yKCdzcGFuJykoKWAgdGhyb3dzIGJlY2F1c2UgdGhlIGBQcm9taXNlYCByZWplY3RzLlxyXG4gICAqL1xyXG4gIGxvY2F0b3JGb3I8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oLi4ucXVlcmllczogVCk6XHJcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPj47XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXHJcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgYExvY2F0b3JGYWN0b3J5YC5cclxuICAgKiBAcGFyYW0gcXVlcmllcyBBIGxpc3Qgb2YgcXVlcmllcyBzcGVjaWZ5aW5nIHdoaWNoIGhhcm5lc3NlcyBhbmQgZWxlbWVudHMgdG8gc2VhcmNoIGZvcjpcclxuICAgKiAgIC0gQSBgc3RyaW5nYCBzZWFyY2hlcyBmb3IgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIENTUyBzZWxlY3RvciBzcGVjaWZpZWQgYnkgdGhlIHN0cmluZy5cclxuICAgKiAgIC0gQSBgQ29tcG9uZW50SGFybmVzc2AgY29uc3RydWN0b3Igc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlXHJcbiAgICogICAgIGdpdmVuIGNsYXNzLlxyXG4gICAqICAgLSBBIGBIYXJuZXNzUHJlZGljYXRlYCBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGUgZ2l2ZW5cclxuICAgKiAgICAgcHJlZGljYXRlLlxyXG4gICAqIEByZXR1cm4gQW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBzZWFyY2hlcyBmb3IgYW5kIHJldHVybnMgYSBgUHJvbWlzZWAgZm9yIHRoZVxyXG4gICAqICAgZmlyc3QgZWxlbWVudCBvciBoYXJuZXNzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWFyY2ggY3JpdGVyaWEuIE1hdGNoZXMgYXJlIG9yZGVyZWQgZmlyc3QgYnlcclxuICAgKiAgIG9yZGVyIGluIHRoZSBET00sIGFuZCBzZWNvbmQgYnkgb3JkZXIgaW4gdGhlIHF1ZXJpZXMgbGlzdC4gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHRoZVxyXG4gICAqICAgYFByb21pc2VgIGlzIHJlc29sdmVkIHdpdGggYG51bGxgLiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYSB1bmlvbiBvZiBhbGxcclxuICAgKiAgIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeSBvciBudWxsLlxyXG4gICAqXHJcbiAgICogZS5nLiBHaXZlbiB0aGUgZm9sbG93aW5nIERPTTogYDxkaXYgaWQ9XCJkMVwiIC8+PGRpdiBpZD1cImQyXCIgLz5gLCBhbmQgYXNzdW1pbmdcclxuICAgKiBgRGl2SGFybmVzcy5ob3N0U2VsZWN0b3IgPT09ICdkaXYnYDpcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yT3B0aW9uYWwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXHJcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvck9wdGlvbmFsKCdkaXYnLCBEaXZIYXJuZXNzKSgpYCBnZXRzIGEgYFRlc3RFbGVtZW50YCBpbnN0YW5jZSBmb3IgYCNkMWBcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yT3B0aW9uYWwoJ3NwYW4nKSgpYCBnZXRzIGBudWxsYC5cclxuICAgKi9cclxuICBsb2NhdG9yRm9yT3B0aW9uYWw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oLi4ucXVlcmllczogVCk6XHJcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPiB8IG51bGw+O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmluZCBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzXHJcbiAgICogb3IgZWxlbWVudHMgdW5kZXIgdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGBMb2NhdG9yRmFjdG9yeWAuXHJcbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XHJcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXHJcbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxyXG4gICAqICAgICBnaXZlbiBjbGFzcy5cclxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXHJcbiAgICogICAgIHByZWRpY2F0ZS5cclxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciBhbGxcclxuICAgKiAgIGVsZW1lbnRzIGFuZCBoYXJuZXNzZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxyXG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBhbiBlbGVtZW50IG1hdGNoZXMgbW9yZSB0aGFuXHJcbiAgICogICBvbmUgYENvbXBvbmVudEhhcm5lc3NgIGNsYXNzLCB0aGUgbG9jYXRvciBnZXRzIGFuIGluc3RhbmNlIG9mIGVhY2ggZm9yIHRoZSBzYW1lIGVsZW1lbnQuIElmXHJcbiAgICogICBhbiBlbGVtZW50IG1hdGNoZXMgbXVsdGlwbGUgYHN0cmluZ2Agc2VsZWN0b3JzLCBvbmx5IG9uZSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGlzIHJldHVybmVkXHJcbiAgICogICBmb3IgdGhhdCBlbGVtZW50LiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBlbGVtZW50IGlzXHJcbiAgICogICB0aGUgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeS5cclxuICAgKlxyXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXHJcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2AgYW5kIGBJZElzRDFIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJyNkMSdgOlxyXG4gICAqIC0gYGF3YWl0IGxmLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYFtcclxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxyXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxyXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QyXHJcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcclxuICAgKiAgIF1gXHJcbiAgICogLSBgYXdhaXQgbGYubG9jYXRvckZvckFsbCgnZGl2JywgJyNkMScpKClgIGdldHMgYFtcclxuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcclxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxyXG4gICAqICAgXWBcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsIElkSXNEMUhhcm5lc3MpKClgIGdldHMgYFtcclxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxyXG4gICAqICAgICBJZElzRDFIYXJuZXNzLCAvLyBmb3IgI2QxXHJcbiAgICogICAgIERpdkhhcm5lc3MgLy8gZm9yICNkMlxyXG4gICAqICAgXWBcclxuICAgKiAtIGBhd2FpdCBsZi5sb2NhdG9yRm9yQWxsKCdzcGFuJykoKWAgZ2V0cyBgW11gLlxyXG4gICAqL1xyXG4gIGxvY2F0b3JGb3JBbGw8VCBleHRlbmRzIChIYXJuZXNzUXVlcnk8YW55PiB8IHN0cmluZylbXT4oLi4ucXVlcmllczogVCk6XHJcbiAgICAgIEFzeW5jRmFjdG9yeUZuPExvY2F0b3JGblJlc3VsdDxUPltdPjtcclxuXHJcbiAgLyoqIEByZXR1cm4gQSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLiAqL1xyXG4gIHJvb3RIYXJuZXNzTG9hZGVyKCk6IFByb21pc2U8SGFybmVzc0xvYWRlcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2UgZm9yIGFuIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3Qgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgLlxyXG4gICAqIEBwYXJhbSBzZWxlY3RvciBUaGUgc2VsZWN0b3IgZm9yIHRoZSByb290IGVsZW1lbnQuXHJcbiAgICogQHJldHVybiBBIGBIYXJuZXNzTG9hZGVyYCByb290ZWQgYXQgdGhlIGZpcnN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxyXG4gICAqIEB0aHJvd3MgSWYgbm8gbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZCBmb3IgdGhlIGdpdmVuIHNlbGVjdG9yLlxyXG4gICAqL1xyXG4gIGhhcm5lc3NMb2FkZXJGb3Ioc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2UgZm9yIGFuIGVsZW1lbnQgdW5kZXIgdGhlIHJvb3Qgb2YgdGhpcyBgTG9jYXRvckZhY3RvcnlgXHJcbiAgICogQHBhcmFtIHNlbGVjdG9yIFRoZSBzZWxlY3RvciBmb3IgdGhlIHJvb3QgZWxlbWVudC5cclxuICAgKiBAcmV0dXJuIEEgYEhhcm5lc3NMb2FkZXJgIHJvb3RlZCBhdCB0aGUgZmlyc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VsZWN0b3IsIG9yIG51bGwgaWZcclxuICAgKiAgICAgbm8gbWF0Y2hpbmcgZWxlbWVudCBpcyBmb3VuZC5cclxuICAgKi9cclxuICBoYXJuZXNzTG9hZGVyRm9yT3B0aW9uYWwoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlciB8IG51bGw+O1xyXG5cclxuICAvKipcclxuICAgKiBHZXRzIGEgbGlzdCBvZiBgSGFybmVzc0xvYWRlcmAgaW5zdGFuY2VzLCBvbmUgZm9yIGVhY2ggbWF0Y2hpbmcgZWxlbWVudC5cclxuICAgKiBAcGFyYW0gc2VsZWN0b3IgVGhlIHNlbGVjdG9yIGZvciB0aGUgcm9vdCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm4gQSBsaXN0IG9mIGBIYXJuZXNzTG9hZGVyYCwgb25lIHJvb3RlZCBhdCBlYWNoIGVsZW1lbnQgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlbGVjdG9yLlxyXG4gICAqL1xyXG4gIGhhcm5lc3NMb2FkZXJGb3JBbGwoc2VsZWN0b3I6IHN0cmluZyk6IFByb21pc2U8SGFybmVzc0xvYWRlcltdPjtcclxuXHJcbiAgLyoqXHJcbiAgICogRmx1c2hlcyBjaGFuZ2UgZGV0ZWN0aW9uIGFuZCBhc3luYyB0YXNrcyBjYXB0dXJlZCBpbiB0aGUgQW5ndWxhciB6b25lLlxyXG4gICAqIEluIG1vc3QgY2FzZXMgaXQgc2hvdWxkIG5vdCBiZSBuZWNlc3NhcnkgdG8gY2FsbCB0aGlzIG1hbnVhbGx5LiBIb3dldmVyLCB0aGVyZSBtYXkgYmUgc29tZSBlZGdlXHJcbiAgICogY2FzZXMgd2hlcmUgaXQgaXMgbmVlZGVkIHRvIGZ1bGx5IGZsdXNoIGFuaW1hdGlvbiBldmVudHMuXHJcbiAgICovXHJcbiAgZm9yY2VTdGFiaWxpemUoKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgLyoqXHJcbiAgICogV2FpdHMgZm9yIGFsbCBzY2hlZHVsZWQgb3IgcnVubmluZyBhc3luYyB0YXNrcyB0byBjb21wbGV0ZS4gVGhpcyBhbGxvd3MgaGFybmVzc1xyXG4gICAqIGF1dGhvcnMgdG8gd2FpdCBmb3IgYXN5bmMgdGFza3Mgb3V0c2lkZSBvZiB0aGUgQW5ndWxhciB6b25lLlxyXG4gICAqL1xyXG4gIHdhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCk6IFByb21pc2U8dm9pZD47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciBjb21wb25lbnQgaGFybmVzc2VzIHRoYXQgYWxsIGNvbXBvbmVudCBoYXJuZXNzIGF1dGhvcnMgc2hvdWxkIGV4dGVuZC4gVGhpcyBiYXNlXHJcbiAqIGNvbXBvbmVudCBoYXJuZXNzIHByb3ZpZGVzIHRoZSBiYXNpYyBhYmlsaXR5IHRvIGxvY2F0ZSBlbGVtZW50IGFuZCBzdWItY29tcG9uZW50IGhhcm5lc3MuIEl0XHJcbiAqIHNob3VsZCBiZSBpbmhlcml0ZWQgd2hlbiBkZWZpbmluZyB1c2VyJ3Mgb3duIGhhcm5lc3MuXHJcbiAqL1xyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29tcG9uZW50SGFybmVzcyB7XHJcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIHJlYWRvbmx5IGxvY2F0b3JGYWN0b3J5OiBMb2NhdG9yRmFjdG9yeSkge31cclxuXHJcbiAgLyoqIEdldHMgYSBgUHJvbWlzZWAgZm9yIHRoZSBgVGVzdEVsZW1lbnRgIHJlcHJlc2VudGluZyB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBjb21wb25lbnQuICovXHJcbiAgYXN5bmMgaG9zdCgpOiBQcm9taXNlPFRlc3RFbGVtZW50PiB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5yb290RWxlbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgYSBgTG9jYXRvckZhY3RvcnlgIGZvciB0aGUgZG9jdW1lbnQgcm9vdCBlbGVtZW50LiBUaGlzIGZhY3RvcnkgY2FuIGJlIHVzZWQgdG8gY3JlYXRlXHJcbiAgICogbG9jYXRvcnMgZm9yIGVsZW1lbnRzIHRoYXQgYSBjb21wb25lbnQgY3JlYXRlcyBvdXRzaWRlIG9mIGl0cyBvd24gcm9vdCBlbGVtZW50LiAoZS5nLiBieVxyXG4gICAqIGFwcGVuZGluZyB0byBkb2N1bWVudC5ib2R5KS5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTogTG9jYXRvckZhY3Rvcnkge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkuZG9jdW1lbnRSb290TG9jYXRvckZhY3RvcnkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gYXN5bmNocm9ub3VzIGxvY2F0b3IgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBmaW5kIGEgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlXHJcbiAgICogb3IgZWxlbWVudCB1bmRlciB0aGUgaG9zdCBlbGVtZW50IG9mIHRoaXMgYENvbXBvbmVudEhhcm5lc3NgLlxyXG4gICAqIEBwYXJhbSBxdWVyaWVzIEEgbGlzdCBvZiBxdWVyaWVzIHNwZWNpZnlpbmcgd2hpY2ggaGFybmVzc2VzIGFuZCBlbGVtZW50cyB0byBzZWFyY2ggZm9yOlxyXG4gICAqICAgLSBBIGBzdHJpbmdgIHNlYXJjaGVzIGZvciBlbGVtZW50cyBtYXRjaGluZyB0aGUgQ1NTIHNlbGVjdG9yIHNwZWNpZmllZCBieSB0aGUgc3RyaW5nLlxyXG4gICAqICAgLSBBIGBDb21wb25lbnRIYXJuZXNzYCBjb25zdHJ1Y3RvciBzZWFyY2hlcyBmb3IgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlcyBtYXRjaGluZyB0aGVcclxuICAgKiAgICAgZ2l2ZW4gY2xhc3MuXHJcbiAgICogICAtIEEgYEhhcm5lc3NQcmVkaWNhdGVgIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZSBnaXZlblxyXG4gICAqICAgICBwcmVkaWNhdGUuXHJcbiAgICogQHJldHVybiBBbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IHNlYXJjaGVzIGZvciBhbmQgcmV0dXJucyBhIGBQcm9taXNlYCBmb3IgdGhlXHJcbiAgICogICBmaXJzdCBlbGVtZW50IG9yIGhhcm5lc3MgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxyXG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBubyBtYXRjaGVzIGFyZSBmb3VuZCwgdGhlXHJcbiAgICogICBgUHJvbWlzZWAgcmVqZWN0cy4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3JcclxuICAgKiAgIGVhY2ggcXVlcnkuXHJcbiAgICpcclxuICAgKiBlLmcuIEdpdmVuIHRoZSBmb2xsb3dpbmcgRE9NOiBgPGRpdiBpZD1cImQxXCIgLz48ZGl2IGlkPVwiZDJcIiAvPmAsIGFuZCBhc3N1bWluZ1xyXG4gICAqIGBEaXZIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJ2RpdidgOlxyXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3IoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYSBgRGl2SGFybmVzc2AgaW5zdGFuY2UgZm9yIGAjZDFgXHJcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvcignZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXHJcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvcignc3BhbicpKClgIHRocm93cyBiZWNhdXNlIHRoZSBgUHJvbWlzZWAgcmVqZWN0cy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgbG9jYXRvckZvcjxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcclxuICAgICAgQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+PiB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5sb2NhdG9yRm9yKC4uLnF1ZXJpZXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYSBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VcclxuICAgKiBvciBlbGVtZW50IHVuZGVyIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhpcyBgQ29tcG9uZW50SGFybmVzc2AuXHJcbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XHJcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXHJcbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxyXG4gICAqICAgICBnaXZlbiBjbGFzcy5cclxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXHJcbiAgICogICAgIHByZWRpY2F0ZS5cclxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciB0aGVcclxuICAgKiAgIGZpcnN0IGVsZW1lbnQgb3IgaGFybmVzcyBtYXRjaGluZyB0aGUgZ2l2ZW4gc2VhcmNoIGNyaXRlcmlhLiBNYXRjaGVzIGFyZSBvcmRlcmVkIGZpcnN0IGJ5XHJcbiAgICogICBvcmRlciBpbiB0aGUgRE9NLCBhbmQgc2Vjb25kIGJ5IG9yZGVyIGluIHRoZSBxdWVyaWVzIGxpc3QuIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCB0aGVcclxuICAgKiAgIGBQcm9taXNlYCBpcyByZXNvbHZlZCB3aXRoIGBudWxsYC4gVGhlIHR5cGUgdGhhdCB0aGUgYFByb21pc2VgIHJlc29sdmVzIHRvIGlzIGEgdW5pb24gb2YgYWxsXHJcbiAgICogICByZXN1bHQgdHlwZXMgZm9yIGVhY2ggcXVlcnkgb3IgbnVsbC5cclxuICAgKlxyXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXHJcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2A6XHJcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvck9wdGlvbmFsKERpdkhhcm5lc3MsICdkaXYnKSgpYCBnZXRzIGEgYERpdkhhcm5lc3NgIGluc3RhbmNlIGZvciBgI2QxYFxyXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JPcHRpb25hbCgnZGl2JywgRGl2SGFybmVzcykoKWAgZ2V0cyBhIGBUZXN0RWxlbWVudGAgaW5zdGFuY2UgZm9yIGAjZDFgXHJcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvck9wdGlvbmFsKCdzcGFuJykoKWAgZ2V0cyBgbnVsbGAuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGxvY2F0b3JGb3JPcHRpb25hbDxUIGV4dGVuZHMgKEhhcm5lc3NRdWVyeTxhbnk+IHwgc3RyaW5nKVtdPiguLi5xdWVyaWVzOiBUKTpcclxuICAgICAgQXN5bmNGYWN0b3J5Rm48TG9jYXRvckZuUmVzdWx0PFQ+IHwgbnVsbD4ge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkubG9jYXRvckZvck9wdGlvbmFsKC4uLnF1ZXJpZXMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBhc3luY2hyb25vdXMgbG9jYXRvciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGZpbmQgYENvbXBvbmVudEhhcm5lc3NgIGluc3RhbmNlc1xyXG4gICAqIG9yIGVsZW1lbnRzIHVuZGVyIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhpcyBgQ29tcG9uZW50SGFybmVzc2AuXHJcbiAgICogQHBhcmFtIHF1ZXJpZXMgQSBsaXN0IG9mIHF1ZXJpZXMgc3BlY2lmeWluZyB3aGljaCBoYXJuZXNzZXMgYW5kIGVsZW1lbnRzIHRvIHNlYXJjaCBmb3I6XHJcbiAgICogICAtIEEgYHN0cmluZ2Agc2VhcmNoZXMgZm9yIGVsZW1lbnRzIG1hdGNoaW5nIHRoZSBDU1Mgc2VsZWN0b3Igc3BlY2lmaWVkIGJ5IHRoZSBzdHJpbmcuXHJcbiAgICogICAtIEEgYENvbXBvbmVudEhhcm5lc3NgIGNvbnN0cnVjdG9yIHNlYXJjaGVzIGZvciBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzIG1hdGNoaW5nIHRoZVxyXG4gICAqICAgICBnaXZlbiBjbGFzcy5cclxuICAgKiAgIC0gQSBgSGFybmVzc1ByZWRpY2F0ZWAgc2VhcmNoZXMgZm9yIGBDb21wb25lbnRIYXJuZXNzYCBpbnN0YW5jZXMgbWF0Y2hpbmcgdGhlIGdpdmVuXHJcbiAgICogICAgIHByZWRpY2F0ZS5cclxuICAgKiBAcmV0dXJuIEFuIGFzeW5jaHJvbm91cyBsb2NhdG9yIGZ1bmN0aW9uIHRoYXQgc2VhcmNoZXMgZm9yIGFuZCByZXR1cm5zIGEgYFByb21pc2VgIGZvciBhbGxcclxuICAgKiAgIGVsZW1lbnRzIGFuZCBoYXJuZXNzZXMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNlYXJjaCBjcml0ZXJpYS4gTWF0Y2hlcyBhcmUgb3JkZXJlZCBmaXJzdCBieVxyXG4gICAqICAgb3JkZXIgaW4gdGhlIERPTSwgYW5kIHNlY29uZCBieSBvcmRlciBpbiB0aGUgcXVlcmllcyBsaXN0LiBJZiBhbiBlbGVtZW50IG1hdGNoZXMgbW9yZSB0aGFuXHJcbiAgICogICBvbmUgYENvbXBvbmVudEhhcm5lc3NgIGNsYXNzLCB0aGUgbG9jYXRvciBnZXRzIGFuIGluc3RhbmNlIG9mIGVhY2ggZm9yIHRoZSBzYW1lIGVsZW1lbnQuIElmXHJcbiAgICogICBhbiBlbGVtZW50IG1hdGNoZXMgbXVsdGlwbGUgYHN0cmluZ2Agc2VsZWN0b3JzLCBvbmx5IG9uZSBgVGVzdEVsZW1lbnRgIGluc3RhbmNlIGlzIHJldHVybmVkXHJcbiAgICogICBmb3IgdGhhdCBlbGVtZW50LiBUaGUgdHlwZSB0aGF0IHRoZSBgUHJvbWlzZWAgcmVzb2x2ZXMgdG8gaXMgYW4gYXJyYXkgd2hlcmUgZWFjaCBlbGVtZW50IGlzXHJcbiAgICogICB0aGUgdW5pb24gb2YgYWxsIHJlc3VsdCB0eXBlcyBmb3IgZWFjaCBxdWVyeS5cclxuICAgKlxyXG4gICAqIGUuZy4gR2l2ZW4gdGhlIGZvbGxvd2luZyBET006IGA8ZGl2IGlkPVwiZDFcIiAvPjxkaXYgaWQ9XCJkMlwiIC8+YCwgYW5kIGFzc3VtaW5nXHJcbiAgICogYERpdkhhcm5lc3MuaG9zdFNlbGVjdG9yID09PSAnZGl2J2AgYW5kIGBJZElzRDFIYXJuZXNzLmhvc3RTZWxlY3RvciA9PT0gJyNkMSdgOlxyXG4gICAqIC0gYGF3YWl0IGNoLmxvY2F0b3JGb3JBbGwoRGl2SGFybmVzcywgJ2RpdicpKClgIGdldHMgYFtcclxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxyXG4gICAqICAgICBUZXN0RWxlbWVudCwgLy8gZm9yICNkMVxyXG4gICAqICAgICBEaXZIYXJuZXNzLCAvLyBmb3IgI2QyXHJcbiAgICogICAgIFRlc3RFbGVtZW50IC8vIGZvciAjZDJcclxuICAgKiAgIF1gXHJcbiAgICogLSBgYXdhaXQgY2gubG9jYXRvckZvckFsbCgnZGl2JywgJyNkMScpKClgIGdldHMgYFtcclxuICAgKiAgICAgVGVzdEVsZW1lbnQsIC8vIGZvciAjZDFcclxuICAgKiAgICAgVGVzdEVsZW1lbnQgLy8gZm9yICNkMlxyXG4gICAqICAgXWBcclxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKERpdkhhcm5lc3MsIElkSXNEMUhhcm5lc3MpKClgIGdldHMgYFtcclxuICAgKiAgICAgRGl2SGFybmVzcywgLy8gZm9yICNkMVxyXG4gICAqICAgICBJZElzRDFIYXJuZXNzLCAvLyBmb3IgI2QxXHJcbiAgICogICAgIERpdkhhcm5lc3MgLy8gZm9yICNkMlxyXG4gICAqICAgXWBcclxuICAgKiAtIGBhd2FpdCBjaC5sb2NhdG9yRm9yQWxsKCdzcGFuJykoKWAgZ2V0cyBgW11gLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBsb2NhdG9yRm9yQWxsPFQgZXh0ZW5kcyAoSGFybmVzc1F1ZXJ5PGFueT4gfCBzdHJpbmcpW10+KC4uLnF1ZXJpZXM6IFQpOlxyXG4gICAgICBBc3luY0ZhY3RvcnlGbjxMb2NhdG9yRm5SZXN1bHQ8VD5bXT4ge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3RvcnkubG9jYXRvckZvckFsbCguLi5xdWVyaWVzKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZsdXNoZXMgY2hhbmdlIGRldGVjdGlvbiBhbmQgYXN5bmMgdGFza3MgaW4gdGhlIEFuZ3VsYXIgem9uZS5cclxuICAgKiBJbiBtb3N0IGNhc2VzIGl0IHNob3VsZCBub3QgYmUgbmVjZXNzYXJ5IHRvIGNhbGwgdGhpcyBtYW51YWxseS4gSG93ZXZlciwgdGhlcmUgbWF5IGJlIHNvbWUgZWRnZVxyXG4gICAqIGNhc2VzIHdoZXJlIGl0IGlzIG5lZWRlZCB0byBmdWxseSBmbHVzaCBhbmltYXRpb24gZXZlbnRzLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhc3luYyBmb3JjZVN0YWJpbGl6ZSgpIHtcclxuICAgIHJldHVybiB0aGlzLmxvY2F0b3JGYWN0b3J5LmZvcmNlU3RhYmlsaXplKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXYWl0cyBmb3IgYWxsIHNjaGVkdWxlZCBvciBydW5uaW5nIGFzeW5jIHRhc2tzIHRvIGNvbXBsZXRlLiBUaGlzIGFsbG93cyBoYXJuZXNzXHJcbiAgICogYXV0aG9ycyB0byB3YWl0IGZvciBhc3luYyB0YXNrcyBvdXRzaWRlIG9mIHRoZSBBbmd1bGFyIHpvbmUuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubG9jYXRvckZhY3Rvcnkud2FpdEZvclRhc2tzT3V0c2lkZUFuZ3VsYXIoKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyBmb3IgY29tcG9uZW50IGhhcm5lc3NlcyB0aGF0IGF1dGhvcnMgc2hvdWxkIGV4dGVuZCBpZiB0aGV5IGFudGljaXBhdGUgdGhhdCBjb25zdW1lcnNcclxuICogb2YgdGhlIGhhcm5lc3MgbWF5IHdhbnQgdG8gYWNjZXNzIG90aGVyIGhhcm5lc3NlcyB3aXRoaW4gdGhlIGA8bmctY29udGVudD5gIG9mIHRoZSBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ29udGVudENvbnRhaW5lckNvbXBvbmVudEhhcm5lc3M8UyBleHRlbmRzIHN0cmluZyA9IHN0cmluZz5cclxuICBleHRlbmRzIENvbXBvbmVudEhhcm5lc3MgaW1wbGVtZW50cyBIYXJuZXNzTG9hZGVyIHtcclxuXHJcbiAgYXN5bmMgZ2V0Q2hpbGRMb2FkZXIoc2VsZWN0b3I6IFMpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXI+IHtcclxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXRSb290SGFybmVzc0xvYWRlcigpKS5nZXRDaGlsZExvYWRlcihzZWxlY3Rvcik7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRBbGxDaGlsZExvYWRlcnMoc2VsZWN0b3I6IFMpOiBQcm9taXNlPEhhcm5lc3NMb2FkZXJbXT4ge1xyXG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldEFsbENoaWxkTG9hZGVycyhzZWxlY3Rvcik7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRIYXJuZXNzPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPihxdWVyeTogSGFybmVzc1F1ZXJ5PFQ+KTogUHJvbWlzZTxUPiB7XHJcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKSkuZ2V0SGFybmVzcyhxdWVyeSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRBbGxIYXJuZXNzZXM8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+KHF1ZXJ5OiBIYXJuZXNzUXVlcnk8VD4pOiBQcm9taXNlPFRbXT4ge1xyXG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdldFJvb3RIYXJuZXNzTG9hZGVyKCkpLmdldEFsbEhhcm5lc3NlcyhxdWVyeSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSByb290IGhhcm5lc3MgbG9hZGVyIGZyb20gd2hpY2ggdG8gc3RhcnRcclxuICAgKiBzZWFyY2hpbmcgZm9yIGNvbnRlbnQgY29udGFpbmVkIGJ5IHRoaXMgaGFybmVzcy5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Um9vdEhhcm5lc3NMb2FkZXIoKTogUHJvbWlzZTxIYXJuZXNzTG9hZGVyPiB7XHJcbiAgICByZXR1cm4gdGhpcy5sb2NhdG9yRmFjdG9yeS5yb290SGFybmVzc0xvYWRlcigpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqIENvbnN0cnVjdG9yIGZvciBhIENvbXBvbmVudEhhcm5lc3Mgc3ViY2xhc3MuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQgZXh0ZW5kcyBDb21wb25lbnRIYXJuZXNzPiB7XHJcbiAgbmV3KGxvY2F0b3JGYWN0b3J5OiBMb2NhdG9yRmFjdG9yeSk6IFQ7XHJcblxyXG4gIC8qKlxyXG4gICAqIGBDb21wb25lbnRIYXJuZXNzYCBzdWJjbGFzc2VzIG11c3Qgc3BlY2lmeSBhIHN0YXRpYyBgaG9zdFNlbGVjdG9yYCBwcm9wZXJ0eSB0aGF0IGlzIHVzZWQgdG9cclxuICAgKiBmaW5kIHRoZSBob3N0IGVsZW1lbnQgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGNvbXBvbmVudC4gVGhpcyBwcm9wZXJ0eSBzaG91bGQgbWF0Y2ggdGhlIHNlbGVjdG9yXHJcbiAgICogZm9yIHRoZSBBbmd1bGFyIGNvbXBvbmVudC5cclxuICAgKi9cclxuICBob3N0U2VsZWN0b3I6IHN0cmluZztcclxufVxyXG5cclxuLyoqIEEgc2V0IG9mIGNyaXRlcmlhIHRoYXQgY2FuIGJlIHVzZWQgdG8gZmlsdGVyIGEgbGlzdCBvZiBgQ29tcG9uZW50SGFybmVzc2AgaW5zdGFuY2VzLiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VIYXJuZXNzRmlsdGVycyB7XHJcbiAgLyoqIE9ubHkgZmluZCBpbnN0YW5jZXMgd2hvc2UgaG9zdCBlbGVtZW50IG1hdGNoZXMgdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xyXG4gIHNlbGVjdG9yPzogc3RyaW5nO1xyXG4gIC8qKiBPbmx5IGZpbmQgaW5zdGFuY2VzIHRoYXQgYXJlIG5lc3RlZCB1bmRlciBhbiBlbGVtZW50IHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yLiAqL1xyXG4gIGFuY2VzdG9yPzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjbGFzcyB1c2VkIHRvIGFzc29jaWF0ZSBhIENvbXBvbmVudEhhcm5lc3MgY2xhc3Mgd2l0aCBwcmVkaWNhdGVzIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSB1c2VkIHRvXHJcbiAqIGZpbHRlciBpbnN0YW5jZXMgb2YgdGhlIGNsYXNzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEhhcm5lc3NQcmVkaWNhdGU8VCBleHRlbmRzIENvbXBvbmVudEhhcm5lc3M+IHtcclxuICBwcml2YXRlIF9wcmVkaWNhdGVzOiBBc3luY1ByZWRpY2F0ZTxUPltdID0gW107XHJcbiAgcHJpdmF0ZSBfZGVzY3JpcHRpb25zOiBzdHJpbmdbXSA9IFtdO1xyXG4gIHByaXZhdGUgX2FuY2VzdG9yOiBzdHJpbmc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBoYXJuZXNzVHlwZTogQ29tcG9uZW50SGFybmVzc0NvbnN0cnVjdG9yPFQ+LCBvcHRpb25zOiBCYXNlSGFybmVzc0ZpbHRlcnMpIHtcclxuICAgIHRoaXMuX2FkZEJhc2VPcHRpb25zKG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgbnVsbGFibGUgc3RyaW5nIHZhbHVlIG1hdGNoZXMgdGhlIGdpdmVuIHBhdHRlcm4uXHJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSBudWxsYWJsZSBzdHJpbmcgdmFsdWUgdG8gY2hlY2ssIG9yIGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gdGhlXHJcbiAgICogICBudWxsYWJsZSBzdHJpbmcgdmFsdWUuXHJcbiAgICogQHBhcmFtIHBhdHRlcm4gVGhlIHBhdHRlcm4gdGhlIHZhbHVlIGlzIGV4cGVjdGVkIHRvIG1hdGNoLiBJZiBgcGF0dGVybmAgaXMgYSBzdHJpbmcsXHJcbiAgICogICBgdmFsdWVgIGlzIGV4cGVjdGVkIHRvIG1hdGNoIGV4YWN0bHkuIElmIGBwYXR0ZXJuYCBpcyBhIHJlZ2V4LCBhIHBhcnRpYWwgbWF0Y2ggaXNcclxuICAgKiAgIGFsbG93ZWQuIElmIGBwYXR0ZXJuYCBpcyBgbnVsbGAsIHRoZSB2YWx1ZSBpcyBleHBlY3RlZCB0byBiZSBgbnVsbGAuXHJcbiAgICogQHJldHVybiBXaGV0aGVyIHRoZSB2YWx1ZSBtYXRjaGVzIHRoZSBwYXR0ZXJuLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBhc3luYyBzdHJpbmdNYXRjaGVzKHZhbHVlOiBzdHJpbmcgfCBudWxsIHwgUHJvbWlzZTxzdHJpbmcgfCBudWxsPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXR0ZXJuOiBzdHJpbmcgfCBSZWdFeHAgfCBudWxsKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICB2YWx1ZSA9IGF3YWl0IHZhbHVlO1xyXG4gICAgaWYgKHBhdHRlcm4gPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlID09PSBudWxsO1xyXG4gICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnID8gdmFsdWUgPT09IHBhdHRlcm4gOiBwYXR0ZXJuLnRlc3QodmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBiZSBydW4gYWdhaW5zdCBjYW5kaWRhdGUgaGFybmVzc2VzLlxyXG4gICAqIEBwYXJhbSBkZXNjcmlwdGlvbiBBIGRlc2NyaXB0aW9uIG9mIHRoaXMgcHJlZGljYXRlIHRoYXQgbWF5IGJlIHVzZWQgaW4gZXJyb3IgbWVzc2FnZXMuXHJcbiAgICogQHBhcmFtIHByZWRpY2F0ZSBBbiBhc3luYyBwcmVkaWNhdGUgZnVuY3Rpb24uXHJcbiAgICogQHJldHVybiB0aGlzIChmb3IgbWV0aG9kIGNoYWluaW5nKS5cclxuICAgKi9cclxuICBhZGQoZGVzY3JpcHRpb246IHN0cmluZywgcHJlZGljYXRlOiBBc3luY1ByZWRpY2F0ZTxUPikge1xyXG4gICAgdGhpcy5fZGVzY3JpcHRpb25zLnB1c2goZGVzY3JpcHRpb24pO1xyXG4gICAgdGhpcy5fcHJlZGljYXRlcy5wdXNoKHByZWRpY2F0ZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBwcmVkaWNhdGUgZnVuY3Rpb24gdGhhdCBkZXBlbmRzIG9uIGFuIG9wdGlvbiB2YWx1ZSB0byBiZSBydW4gYWdhaW5zdCBjYW5kaWRhdGVcclxuICAgKiBoYXJuZXNzZXMuIElmIHRoZSBvcHRpb24gdmFsdWUgaXMgdW5kZWZpbmVkLCB0aGUgcHJlZGljYXRlIHdpbGwgYmUgaWdub3JlZC5cclxuICAgKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgb3B0aW9uIChtYXkgYmUgdXNlZCBpbiBlcnJvciBtZXNzYWdlcykuXHJcbiAgICogQHBhcmFtIG9wdGlvbiBUaGUgb3B0aW9uIHZhbHVlLlxyXG4gICAqIEBwYXJhbSBwcmVkaWNhdGUgVGhlIHByZWRpY2F0ZSBmdW5jdGlvbiB0byBydW4gaWYgdGhlIG9wdGlvbiB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLlxyXG4gICAqIEByZXR1cm4gdGhpcyAoZm9yIG1ldGhvZCBjaGFpbmluZykuXHJcbiAgICovXHJcbiAgYWRkT3B0aW9uPE8+KG5hbWU6IHN0cmluZywgb3B0aW9uOiBPIHwgdW5kZWZpbmVkLCBwcmVkaWNhdGU6IEFzeW5jT3B0aW9uUHJlZGljYXRlPFQsIE8+KSB7XHJcbiAgICBpZiAob3B0aW9uICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgdGhpcy5hZGQoYCR7bmFtZX0gPSAke192YWx1ZUFzU3RyaW5nKG9wdGlvbil9YCwgaXRlbSA9PiBwcmVkaWNhdGUoaXRlbSwgb3B0aW9uKSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbHRlcnMgYSBsaXN0IG9mIGhhcm5lc3NlcyBvbiB0aGlzIHByZWRpY2F0ZS5cclxuICAgKiBAcGFyYW0gaGFybmVzc2VzIFRoZSBsaXN0IG9mIGhhcm5lc3NlcyB0byBmaWx0ZXIuXHJcbiAgICogQHJldHVybiBBIGxpc3Qgb2YgaGFybmVzc2VzIHRoYXQgc2F0aXNmeSB0aGlzIHByZWRpY2F0ZS5cclxuICAgKi9cclxuICBhc3luYyBmaWx0ZXIoaGFybmVzc2VzOiBUW10pOiBQcm9taXNlPFRbXT4ge1xyXG4gICAgaWYgKGhhcm5lc3Nlcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHBhcmFsbGVsKCgpID0+IGhhcm5lc3Nlcy5tYXAoaCA9PiB0aGlzLmV2YWx1YXRlKGgpKSk7XHJcbiAgICByZXR1cm4gaGFybmVzc2VzLmZpbHRlcigoXywgaSkgPT4gcmVzdWx0c1tpXSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFdmFsdWF0ZXMgd2hldGhlciB0aGUgZ2l2ZW4gaGFybmVzcyBzYXRpc2ZpZXMgdGhpcyBwcmVkaWNhdGUuXHJcbiAgICogQHBhcmFtIGhhcm5lc3MgVGhlIGhhcm5lc3MgdG8gY2hlY2tcclxuICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRydWUgaWYgdGhlIGhhcm5lc3Mgc2F0aXNmaWVzIHRoaXMgcHJlZGljYXRlLFxyXG4gICAqICAgYW5kIHJlc29sdmVzIHRvIGZhbHNlIG90aGVyd2lzZS5cclxuICAgKi9cclxuICBhc3luYyBldmFsdWF0ZShoYXJuZXNzOiBUKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcGFyYWxsZWwoKCkgPT4gdGhpcy5fcHJlZGljYXRlcy5tYXAocCA9PiBwKGhhcm5lc3MpKSk7XHJcbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGNvbWJpbmVkLCBjdXJyZW50KSA9PiBjb21iaW5lZCAmJiBjdXJyZW50LCB0cnVlKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIGEgZGVzY3JpcHRpb24gb2YgdGhpcyBwcmVkaWNhdGUgZm9yIHVzZSBpbiBlcnJvciBtZXNzYWdlcy4gKi9cclxuICBnZXREZXNjcmlwdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9kZXNjcmlwdGlvbnMuam9pbignLCAnKTtcclxuICB9XHJcblxyXG4gIC8qKiBHZXRzIHRoZSBzZWxlY3RvciB1c2VkIHRvIGZpbmQgY2FuZGlkYXRlIGVsZW1lbnRzLiAqL1xyXG4gIGdldFNlbGVjdG9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FuY2VzdG9yLnNwbGl0KCcsJylcclxuICAgICAgICAubWFwKHBhcnQgPT4gYCR7cGFydC50cmltKCl9ICR7dGhpcy5oYXJuZXNzVHlwZS5ob3N0U2VsZWN0b3J9YC50cmltKCkpXHJcbiAgICAgICAgLmpvaW4oJywnKTtcclxuICB9XHJcblxyXG4gIC8qKiBBZGRzIGJhc2Ugb3B0aW9ucyBjb21tb24gdG8gYWxsIGhhcm5lc3MgdHlwZXMuICovXHJcbiAgcHJpdmF0ZSBfYWRkQmFzZU9wdGlvbnMob3B0aW9uczogQmFzZUhhcm5lc3NGaWx0ZXJzKSB7XHJcbiAgICB0aGlzLl9hbmNlc3RvciA9IG9wdGlvbnMuYW5jZXN0b3IgfHwgJyc7XHJcbiAgICBpZiAodGhpcy5fYW5jZXN0b3IpIHtcclxuICAgICAgdGhpcy5fZGVzY3JpcHRpb25zLnB1c2goYGhhcyBhbmNlc3RvciBtYXRjaGluZyBzZWxlY3RvciBcIiR7dGhpcy5fYW5jZXN0b3J9XCJgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNlbGVjdG9yID0gb3B0aW9ucy5zZWxlY3RvcjtcclxuICAgIGlmIChzZWxlY3RvciAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRoaXMuYWRkKGBob3N0IG1hdGNoZXMgc2VsZWN0b3IgXCIke3NlbGVjdG9yfVwiYCwgYXN5bmMgaXRlbSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBpdGVtLmhvc3QoKSkubWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKiogUmVwcmVzZW50IGEgdmFsdWUgYXMgYSBzdHJpbmcgZm9yIHRoZSBwdXJwb3NlIG9mIGxvZ2dpbmcuICovXHJcbmZ1bmN0aW9uIF92YWx1ZUFzU3RyaW5nKHZhbHVlOiB1bmtub3duKSB7XHJcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgIHJldHVybiAndW5kZWZpbmVkJztcclxuICB9XHJcbiAgLy8gYEpTT04uc3RyaW5naWZ5YCBkb2Vzbid0IGhhbmRsZSBSZWdFeHAgcHJvcGVybHksIHNvIHdlIG5lZWQgYSBjdXN0b20gcmVwbGFjZXIuXHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgKF8sIHYpID0+IHtcclxuICAgICAgaWYgKHYgaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuICAgICAgICByZXR1cm4gYC8ke3YudG9TdHJpbmcoKX0vYDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJyA/IHYucmVwbGFjZSgnL1xcLy9nJywgJ1xcXFwvJykgOiB2O1xyXG4gICAgfSkucmVwbGFjZSgvXCJcXC9cXC8vZywgJ1xcXFwvJykucmVwbGFjZSgvXFwvXFwvXCIvZywgJ1xcXFwvJykucmVwbGFjZSgvXFxcXFxcLy9nLCAnLycpO1xyXG4gIH0gY2F0Y2gge1xyXG4gICAgLy8gYEpTT04uc3RyaW5naWZ5YCB3aWxsIHRocm93IGlmIHRoZSBvYmplY3QgaXMgY3ljbGljYWwsXHJcbiAgICAvLyBpbiB0aGlzIGNhc2UgdGhlIGJlc3Qgd2UgY2FuIGRvIGlzIHJlcG9ydCB0aGUgdmFsdWUgYXMgYHsuLi59YC5cclxuICAgIHJldHVybiAney4uLn0nO1xyXG4gIH1cclxufVxyXG4iXX0=