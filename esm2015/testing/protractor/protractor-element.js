/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { _getTextWithExcludedElements, TestKey, } from '@angular/cdk/testing';
import { browser, Button, by, Key } from 'protractor';
/** Maps the `TestKey` constants to Protractor's `Key` constants. */
const keyMap = {
    [TestKey.BACKSPACE]: Key.BACK_SPACE,
    [TestKey.TAB]: Key.TAB,
    [TestKey.ENTER]: Key.ENTER,
    [TestKey.SHIFT]: Key.SHIFT,
    [TestKey.CONTROL]: Key.CONTROL,
    [TestKey.ALT]: Key.ALT,
    [TestKey.ESCAPE]: Key.ESCAPE,
    [TestKey.PAGE_UP]: Key.PAGE_UP,
    [TestKey.PAGE_DOWN]: Key.PAGE_DOWN,
    [TestKey.END]: Key.END,
    [TestKey.HOME]: Key.HOME,
    [TestKey.LEFT_ARROW]: Key.ARROW_LEFT,
    [TestKey.UP_ARROW]: Key.ARROW_UP,
    [TestKey.RIGHT_ARROW]: Key.ARROW_RIGHT,
    [TestKey.DOWN_ARROW]: Key.ARROW_DOWN,
    [TestKey.INSERT]: Key.INSERT,
    [TestKey.DELETE]: Key.DELETE,
    [TestKey.F1]: Key.F1,
    [TestKey.F2]: Key.F2,
    [TestKey.F3]: Key.F3,
    [TestKey.F4]: Key.F4,
    [TestKey.F5]: Key.F5,
    [TestKey.F6]: Key.F6,
    [TestKey.F7]: Key.F7,
    [TestKey.F8]: Key.F8,
    [TestKey.F9]: Key.F9,
    [TestKey.F10]: Key.F10,
    [TestKey.F11]: Key.F11,
    [TestKey.F12]: Key.F12,
    [TestKey.META]: Key.META
};
/** Converts a `ModifierKeys` object to a list of Protractor `Key`s. */
function toProtractorModifierKeys(modifiers) {
    const result = [];
    if (modifiers.control) {
        result.push(Key.CONTROL);
    }
    if (modifiers.alt) {
        result.push(Key.ALT);
    }
    if (modifiers.shift) {
        result.push(Key.SHIFT);
    }
    if (modifiers.meta) {
        result.push(Key.META);
    }
    return result;
}
/** A `TestElement` implementation for Protractor. */
export class ProtractorElement {
    constructor(element) {
        this.element = element;
    }
    blur() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript('arguments[0].blur()', this.element);
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.clear();
        });
    }
    click(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchClickEventSequence(args, Button.LEFT);
        });
    }
    rightClick(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._dispatchClickEventSequence(args, Button.RIGHT);
        });
    }
    focus() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript('arguments[0].focus()', this.element);
        });
    }
    getCssValue(property) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.getCssValue(property);
        });
    }
    hover() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.actions()
                .mouseMove(yield this.element.getWebElement())
                .perform();
        });
    }
    mouseAway() {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.actions()
                .mouseMove(yield this.element.getWebElement(), { x: -1, y: -1 })
                .perform();
        });
    }
    sendKeys(...modifiersAndKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            const first = modifiersAndKeys[0];
            let modifiers;
            let rest;
            if (typeof first !== 'string' && typeof first !== 'number') {
                modifiers = first;
                rest = modifiersAndKeys.slice(1);
            }
            else {
                modifiers = {};
                rest = modifiersAndKeys;
            }
            const modifierKeys = toProtractorModifierKeys(modifiers);
            const keys = rest.map(k => typeof k === 'string' ? k.split('') : [keyMap[k]])
                .reduce((arr, k) => arr.concat(k), [])
                // Key.chord doesn't work well with geckodriver (mozilla/geckodriver#1502),
                // so avoid it if no modifier keys are required.
                .map(k => modifierKeys.length > 0 ? Key.chord(...modifierKeys, k) : k);
            return this.element.sendKeys(...keys);
        });
    }
    text(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options === null || options === void 0 ? void 0 : options.exclude) {
                return browser.executeScript(_getTextWithExcludedElements, this.element, options.exclude);
            }
            return this.element.getText();
        });
    }
    getAttribute(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`return arguments[0].getAttribute(arguments[1])`, this.element, name);
        });
    }
    hasClass(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const classes = (yield this.getAttribute('class')) || '';
            return new Set(classes.split(/\s+/).filter(c => c)).has(name);
        });
    }
    getDimensions() {
        return __awaiter(this, void 0, void 0, function* () {
            const { width, height } = yield this.element.getSize();
            const { x: left, y: top } = yield this.element.getLocation();
            return { width, height, left, top };
        });
    }
    getProperty(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`return arguments[0][arguments[1]]`, this.element, name);
        });
    }
    setInputValue(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`arguments[0].value = arguments[1]`, this.element, value);
        });
    }
    selectOptions(...optionIndexes) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield this.element.all(by.css('option'));
            const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.
            if (options.length && indexes.size) {
                // Reset the value so all the selected states are cleared. We can
                // reuse the input-specific method since the logic is the same.
                yield this.setInputValue('');
                for (let i = 0; i < options.length; i++) {
                    if (indexes.has(i)) {
                        // We have to hold the control key while clicking on options so that multiple can be
                        // selected in multi-selection mode. The key doesn't do anything for single selection.
                        yield browser.actions().keyDown(Key.CONTROL).perform();
                        yield options[i].click();
                        yield browser.actions().keyUp(Key.CONTROL).perform();
                    }
                }
            }
        });
    }
    matchesSelector(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(`
          return (Element.prototype.matches ||
                  Element.prototype.msMatchesSelector).call(arguments[0], arguments[1])
          `, this.element, selector);
        });
    }
    isFocused() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.element.equals(browser.driver.switchTo().activeElement());
        });
    }
    dispatchEvent(name, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return browser.executeScript(_dispatchEvent, name, this.element, data);
        });
    }
    /** Dispatches all the events that are part of a click event sequence. */
    _dispatchClickEventSequence(args, button) {
        return __awaiter(this, void 0, void 0, function* () {
            let modifiers = {};
            if (args.length && typeof args[args.length - 1] === 'object') {
                modifiers = args.pop();
            }
            const modifierKeys = toProtractorModifierKeys(modifiers);
            // Omitting the offset argument to mouseMove results in clicking the center.
            // This is the default behavior we want, so we use an empty array of offsetArgs if
            // no args remain after popping the modifiers from the args passed to this function.
            const offsetArgs = (args.length === 2 ?
                [{ x: args[0], y: args[1] }] : []);
            let actions = browser.actions()
                .mouseMove(yield this.element.getWebElement(), ...offsetArgs);
            for (const modifierKey of modifierKeys) {
                actions = actions.keyDown(modifierKey);
            }
            actions = actions.click(button);
            for (const modifierKey of modifierKeys) {
                actions = actions.keyUp(modifierKey);
            }
            yield actions.perform();
        });
    }
}
/**
 * Dispatches an event with a particular name and data to an element.
 * Note that this needs to be a pure function, because it gets stringified by
 * Protractor and is executed inside the browser.
 */
function _dispatchEvent(name, element, data) {
    const event = document.createEvent('Event');
    event.initEvent(name);
    if (data) {
        // tslint:disable-next-line:ban Have to use `Object.assign` to preserve the original object.
        Object.assign(event, data);
    }
    // This type has a string index signature, so we cannot access it using a dotted property access.
    element['dispatchEvent'](event);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdHJhY3Rvci1lbGVtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Byb3RyYWN0b3IvcHJvdHJhY3Rvci1lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsNEJBQTRCLEVBSTVCLE9BQU8sR0FHUixNQUFNLHNCQUFzQixDQUFDO0FBQzlCLE9BQU8sRUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBaUIsR0FBRyxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBRW5FLG9FQUFvRTtBQUNwRSxNQUFNLE1BQU0sR0FBRztJQUNiLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ25DLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0lBQzFCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLO0lBQzFCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPO0lBQzlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPO0lBQzlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTO0lBQ2xDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJO0lBQ3hCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ3BDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRO0lBQ2hDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxXQUFXO0lBQ3RDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxVQUFVO0lBQ3BDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNO0lBQzVCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFO0lBQ3BCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHO0lBQ3RCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FB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aEMsS0FBSyxNQUFNLFdBQVcsSUFBSSxZQUFZLEVBQUU7Z0JBQ3RDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ3RDO1lBRUQsTUFBTSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUFBO0NBQ0Y7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxjQUFjLENBQUMsSUFBWSxFQUFFLE9BQXNCLEVBQUUsSUFBZ0M7SUFDNUYsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRCLElBQUksSUFBSSxFQUFFO1FBQ1IsNEZBQTRGO1FBQzVGLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzVCO0lBRUQsaUdBQWlHO0lBQ2pHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNsQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge1xyXG4gIF9nZXRUZXh0V2l0aEV4Y2x1ZGVkRWxlbWVudHMsXHJcbiAgRWxlbWVudERpbWVuc2lvbnMsXHJcbiAgTW9kaWZpZXJLZXlzLFxyXG4gIFRlc3RFbGVtZW50LFxyXG4gIFRlc3RLZXksXHJcbiAgVGV4dE9wdGlvbnMsXHJcbiAgRXZlbnREYXRhLFxyXG59IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXN0aW5nJztcclxuaW1wb3J0IHticm93c2VyLCBCdXR0b24sIGJ5LCBFbGVtZW50RmluZGVyLCBLZXl9IGZyb20gJ3Byb3RyYWN0b3InO1xyXG5cclxuLyoqIE1hcHMgdGhlIGBUZXN0S2V5YCBjb25zdGFudHMgdG8gUHJvdHJhY3RvcidzIGBLZXlgIGNvbnN0YW50cy4gKi9cclxuY29uc3Qga2V5TWFwID0ge1xyXG4gIFtUZXN0S2V5LkJBQ0tTUEFDRV06IEtleS5CQUNLX1NQQUNFLFxyXG4gIFtUZXN0S2V5LlRBQl06IEtleS5UQUIsXHJcbiAgW1Rlc3RLZXkuRU5URVJdOiBLZXkuRU5URVIsXHJcbiAgW1Rlc3RLZXkuU0hJRlRdOiBLZXkuU0hJRlQsXHJcbiAgW1Rlc3RLZXkuQ09OVFJPTF06IEtleS5DT05UUk9MLFxyXG4gIFtUZXN0S2V5LkFMVF06IEtleS5BTFQsXHJcbiAgW1Rlc3RLZXkuRVNDQVBFXTogS2V5LkVTQ0FQRSxcclxuICBbVGVzdEtleS5QQUdFX1VQXTogS2V5LlBBR0VfVVAsXHJcbiAgW1Rlc3RLZXkuUEFHRV9ET1dOXTogS2V5LlBBR0VfRE9XTixcclxuICBbVGVzdEtleS5FTkRdOiBLZXkuRU5ELFxyXG4gIFtUZXN0S2V5LkhPTUVdOiBLZXkuSE9NRSxcclxuICBbVGVzdEtleS5MRUZUX0FSUk9XXTogS2V5LkFSUk9XX0xFRlQsXHJcbiAgW1Rlc3RLZXkuVVBfQVJST1ddOiBLZXkuQVJST1dfVVAsXHJcbiAgW1Rlc3RLZXkuUklHSFRfQVJST1ddOiBLZXkuQVJST1dfUklHSFQsXHJcbiAgW1Rlc3RLZXkuRE9XTl9BUlJPV106IEtleS5BUlJPV19ET1dOLFxyXG4gIFtUZXN0S2V5LklOU0VSVF06IEtleS5JTlNFUlQsXHJcbiAgW1Rlc3RLZXkuREVMRVRFXTogS2V5LkRFTEVURSxcclxuICBbVGVzdEtleS5GMV06IEtleS5GMSxcclxuICBbVGVzdEtleS5GMl06IEtleS5GMixcclxuICBbVGVzdEtleS5GM106IEtleS5GMyxcclxuICBbVGVzdEtleS5GNF06IEtleS5GNCxcclxuICBbVGVzdEtleS5GNV06IEtleS5GNSxcclxuICBbVGVzdEtleS5GNl06IEtleS5GNixcclxuICBbVGVzdEtleS5GN106IEtleS5GNyxcclxuICBbVGVzdEtleS5GOF06IEtleS5GOCxcclxuICBbVGVzdEtleS5GOV06IEtleS5GOSxcclxuICBbVGVzdEtleS5GMTBdOiBLZXkuRjEwLFxyXG4gIFtUZXN0S2V5LkYxMV06IEtleS5GMTEsXHJcbiAgW1Rlc3RLZXkuRjEyXTogS2V5LkYxMixcclxuICBbVGVzdEtleS5NRVRBXTogS2V5Lk1FVEFcclxufTtcclxuXHJcbi8qKiBDb252ZXJ0cyBhIGBNb2RpZmllcktleXNgIG9iamVjdCB0byBhIGxpc3Qgb2YgUHJvdHJhY3RvciBgS2V5YHMuICovXHJcbmZ1bmN0aW9uIHRvUHJvdHJhY3Rvck1vZGlmaWVyS2V5cyhtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyk6IHN0cmluZ1tdIHtcclxuICBjb25zdCByZXN1bHQ6IHN0cmluZ1tdID0gW107XHJcbiAgaWYgKG1vZGlmaWVycy5jb250cm9sKSB7XHJcbiAgICByZXN1bHQucHVzaChLZXkuQ09OVFJPTCk7XHJcbiAgfVxyXG4gIGlmIChtb2RpZmllcnMuYWx0KSB7XHJcbiAgICByZXN1bHQucHVzaChLZXkuQUxUKTtcclxuICB9XHJcbiAgaWYgKG1vZGlmaWVycy5zaGlmdCkge1xyXG4gICAgcmVzdWx0LnB1c2goS2V5LlNISUZUKTtcclxuICB9XHJcbiAgaWYgKG1vZGlmaWVycy5tZXRhKSB7XHJcbiAgICByZXN1bHQucHVzaChLZXkuTUVUQSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKiBBIGBUZXN0RWxlbWVudGAgaW1wbGVtZW50YXRpb24gZm9yIFByb3RyYWN0b3IuICovXHJcbmV4cG9ydCBjbGFzcyBQcm90cmFjdG9yRWxlbWVudCBpbXBsZW1lbnRzIFRlc3RFbGVtZW50IHtcclxuICBjb25zdHJ1Y3RvcihyZWFkb25seSBlbGVtZW50OiBFbGVtZW50RmluZGVyKSB7fVxyXG5cclxuICBhc3luYyBibHVyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdCgnYXJndW1lbnRzWzBdLmJsdXIoKScsIHRoaXMuZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjbGVhcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGNsaWNrKC4uLmFyZ3M6IFtNb2RpZmllcktleXM/XSB8IFsnY2VudGVyJywgTW9kaWZpZXJLZXlzP10gfFxyXG4gICAgW251bWJlciwgbnVtYmVyLCBNb2RpZmllcktleXM/XSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgdGhpcy5fZGlzcGF0Y2hDbGlja0V2ZW50U2VxdWVuY2UoYXJncywgQnV0dG9uLkxFRlQpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgcmlnaHRDbGljayguLi5hcmdzOiBbTW9kaWZpZXJLZXlzP10gfCBbJ2NlbnRlcicsIE1vZGlmaWVyS2V5cz9dIHxcclxuICAgIFtudW1iZXIsIG51bWJlciwgTW9kaWZpZXJLZXlzP10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGF3YWl0IHRoaXMuX2Rpc3BhdGNoQ2xpY2tFdmVudFNlcXVlbmNlKGFyZ3MsIEJ1dHRvbi5SSUdIVCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmb2N1cygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoJ2FyZ3VtZW50c1swXS5mb2N1cygpJywgdGhpcy5lbGVtZW50KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGdldENzc1ZhbHVlKHByb3BlcnR5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRDc3NWYWx1ZShwcm9wZXJ0eSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBob3ZlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBicm93c2VyLmFjdGlvbnMoKVxyXG4gICAgICAgIC5tb3VzZU1vdmUoYXdhaXQgdGhpcy5lbGVtZW50LmdldFdlYkVsZW1lbnQoKSlcclxuICAgICAgICAucGVyZm9ybSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgbW91c2VBd2F5KCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGJyb3dzZXIuYWN0aW9ucygpXHJcbiAgICAgICAgLm1vdXNlTW92ZShhd2FpdCB0aGlzLmVsZW1lbnQuZ2V0V2ViRWxlbWVudCgpLCB7eDogLTEsIHk6IC0xfSlcclxuICAgICAgICAucGVyZm9ybSgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2VuZEtleXMoLi4ua2V5czogKHN0cmluZyB8IFRlc3RLZXkpW10pOiBQcm9taXNlPHZvaWQ+O1xyXG4gIGFzeW5jIHNlbmRLZXlzKG1vZGlmaWVyczogTW9kaWZpZXJLZXlzLCAuLi5rZXlzOiAoc3RyaW5nIHwgVGVzdEtleSlbXSk6IFByb21pc2U8dm9pZD47XHJcbiAgYXN5bmMgc2VuZEtleXMoLi4ubW9kaWZpZXJzQW5kS2V5czogYW55W10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGZpcnN0ID0gbW9kaWZpZXJzQW5kS2V5c1swXTtcclxuICAgIGxldCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cztcclxuICAgIGxldCByZXN0OiAoc3RyaW5nIHwgVGVzdEtleSlbXTtcclxuICAgIGlmICh0eXBlb2YgZmlyc3QgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBmaXJzdCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgbW9kaWZpZXJzID0gZmlyc3Q7XHJcbiAgICAgIHJlc3QgPSBtb2RpZmllcnNBbmRLZXlzLnNsaWNlKDEpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW9kaWZpZXJzID0ge307XHJcbiAgICAgIHJlc3QgPSBtb2RpZmllcnNBbmRLZXlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG1vZGlmaWVyS2V5cyA9IHRvUHJvdHJhY3Rvck1vZGlmaWVyS2V5cyhtb2RpZmllcnMpO1xyXG4gICAgY29uc3Qga2V5cyA9IHJlc3QubWFwKGsgPT4gdHlwZW9mIGsgPT09ICdzdHJpbmcnID8gay5zcGxpdCgnJykgOiBba2V5TWFwW2tdXSlcclxuICAgICAgICAucmVkdWNlKChhcnIsIGspID0+IGFyci5jb25jYXQoayksIFtdKVxyXG4gICAgICAgIC8vIEtleS5jaG9yZCBkb2Vzbid0IHdvcmsgd2VsbCB3aXRoIGdlY2tvZHJpdmVyIChtb3ppbGxhL2dlY2tvZHJpdmVyIzE1MDIpLFxyXG4gICAgICAgIC8vIHNvIGF2b2lkIGl0IGlmIG5vIG1vZGlmaWVyIGtleXMgYXJlIHJlcXVpcmVkLlxyXG4gICAgICAgIC5tYXAoayA9PiBtb2RpZmllcktleXMubGVuZ3RoID4gMCA/IEtleS5jaG9yZCguLi5tb2RpZmllcktleXMsIGspIDogayk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zZW5kS2V5cyguLi5rZXlzKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHRleHQob3B0aW9ucz86IFRleHRPcHRpb25zKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGlmIChvcHRpb25zPy5leGNsdWRlKSB7XHJcbiAgICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoX2dldFRleHRXaXRoRXhjbHVkZWRFbGVtZW50cywgdGhpcy5lbGVtZW50LCBvcHRpb25zLmV4Y2x1ZGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5nZXRUZXh0KCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXRBdHRyaWJ1dGUobmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xyXG4gICAgcmV0dXJuIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdChcclxuICAgICAgICBgcmV0dXJuIGFyZ3VtZW50c1swXS5nZXRBdHRyaWJ1dGUoYXJndW1lbnRzWzFdKWAsIHRoaXMuZWxlbWVudCwgbmFtZSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBoYXNDbGFzcyhuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIGNvbnN0IGNsYXNzZXMgPSAoYXdhaXQgdGhpcy5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykpIHx8ICcnO1xyXG4gICAgcmV0dXJuIG5ldyBTZXQoY2xhc3Nlcy5zcGxpdCgvXFxzKy8pLmZpbHRlcihjID0+IGMpKS5oYXMobmFtZSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBnZXREaW1lbnNpb25zKCk6IFByb21pc2U8RWxlbWVudERpbWVuc2lvbnM+IHtcclxuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IGF3YWl0IHRoaXMuZWxlbWVudC5nZXRTaXplKCk7XHJcbiAgICBjb25zdCB7eDogbGVmdCwgeTogdG9wfSA9IGF3YWl0IHRoaXMuZWxlbWVudC5nZXRMb2NhdGlvbigpO1xyXG4gICAgcmV0dXJuIHt3aWR0aCwgaGVpZ2h0LCBsZWZ0LCB0b3B9O1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0UHJvcGVydHkobmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoYHJldHVybiBhcmd1bWVudHNbMF1bYXJndW1lbnRzWzFdXWAsIHRoaXMuZWxlbWVudCwgbmFtZSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzZXRJbnB1dFZhbHVlKHZhbHVlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiBicm93c2VyLmV4ZWN1dGVTY3JpcHQoYGFyZ3VtZW50c1swXS52YWx1ZSA9IGFyZ3VtZW50c1sxXWAsIHRoaXMuZWxlbWVudCwgdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgc2VsZWN0T3B0aW9ucyguLi5vcHRpb25JbmRleGVzOiBudW1iZXJbXSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IHRoaXMuZWxlbWVudC5hbGwoYnkuY3NzKCdvcHRpb24nKSk7XHJcbiAgICBjb25zdCBpbmRleGVzID0gbmV3IFNldChvcHRpb25JbmRleGVzKTsgLy8gQ29udmVydCB0byBhIHNldCB0byByZW1vdmUgZHVwbGljYXRlcy5cclxuXHJcbiAgICBpZiAob3B0aW9ucy5sZW5ndGggJiYgaW5kZXhlcy5zaXplKSB7XHJcbiAgICAgIC8vIFJlc2V0IHRoZSB2YWx1ZSBzbyBhbGwgdGhlIHNlbGVjdGVkIHN0YXRlcyBhcmUgY2xlYXJlZC4gV2UgY2FuXHJcbiAgICAgIC8vIHJldXNlIHRoZSBpbnB1dC1zcGVjaWZpYyBtZXRob2Qgc2luY2UgdGhlIGxvZ2ljIGlzIHRoZSBzYW1lLlxyXG4gICAgICBhd2FpdCB0aGlzLnNldElucHV0VmFsdWUoJycpO1xyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGluZGV4ZXMuaGFzKGkpKSB7XHJcbiAgICAgICAgICAvLyBXZSBoYXZlIHRvIGhvbGQgdGhlIGNvbnRyb2wga2V5IHdoaWxlIGNsaWNraW5nIG9uIG9wdGlvbnMgc28gdGhhdCBtdWx0aXBsZSBjYW4gYmVcclxuICAgICAgICAgIC8vIHNlbGVjdGVkIGluIG11bHRpLXNlbGVjdGlvbiBtb2RlLiBUaGUga2V5IGRvZXNuJ3QgZG8gYW55dGhpbmcgZm9yIHNpbmdsZSBzZWxlY3Rpb24uXHJcbiAgICAgICAgICBhd2FpdCBicm93c2VyLmFjdGlvbnMoKS5rZXlEb3duKEtleS5DT05UUk9MKS5wZXJmb3JtKCk7XHJcbiAgICAgICAgICBhd2FpdCBvcHRpb25zW2ldLmNsaWNrKCk7XHJcbiAgICAgICAgICBhd2FpdCBicm93c2VyLmFjdGlvbnMoKS5rZXlVcChLZXkuQ09OVFJPTCkucGVyZm9ybSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgbWF0Y2hlc1NlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgcmV0dXJuIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdChgXHJcbiAgICAgICAgICByZXR1cm4gKEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHxcclxuICAgICAgICAgICAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IpLmNhbGwoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pXHJcbiAgICAgICAgICBgLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGlzRm9jdXNlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuZXF1YWxzKGJyb3dzZXIuZHJpdmVyLnN3aXRjaFRvKCkuYWN0aXZlRWxlbWVudCgpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGRpc3BhdGNoRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhPzogUmVjb3JkPHN0cmluZywgRXZlbnREYXRhPik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIGJyb3dzZXIuZXhlY3V0ZVNjcmlwdChfZGlzcGF0Y2hFdmVudCwgbmFtZSwgdGhpcy5lbGVtZW50LCBkYXRhKTtcclxuICB9XHJcblxyXG4gIC8qKiBEaXNwYXRjaGVzIGFsbCB0aGUgZXZlbnRzIHRoYXQgYXJlIHBhcnQgb2YgYSBjbGljayBldmVudCBzZXF1ZW5jZS4gKi9cclxuICBwcml2YXRlIGFzeW5jIF9kaXNwYXRjaENsaWNrRXZlbnRTZXF1ZW5jZShcclxuICAgIGFyZ3M6IFtNb2RpZmllcktleXM/XSB8IFsnY2VudGVyJywgTW9kaWZpZXJLZXlzP10gfFxyXG4gICAgICBbbnVtYmVyLCBudW1iZXIsIE1vZGlmaWVyS2V5cz9dLFxyXG4gICAgYnV0dG9uOiBzdHJpbmcpIHtcclxuICAgIGxldCBtb2RpZmllcnM6IE1vZGlmaWVyS2V5cyA9IHt9O1xyXG4gICAgaWYgKGFyZ3MubGVuZ3RoICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIG1vZGlmaWVycyA9IGFyZ3MucG9wKCkgYXMgTW9kaWZpZXJLZXlzO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbW9kaWZpZXJLZXlzID0gdG9Qcm90cmFjdG9yTW9kaWZpZXJLZXlzKG1vZGlmaWVycyk7XHJcblxyXG4gICAgLy8gT21pdHRpbmcgdGhlIG9mZnNldCBhcmd1bWVudCB0byBtb3VzZU1vdmUgcmVzdWx0cyBpbiBjbGlja2luZyB0aGUgY2VudGVyLlxyXG4gICAgLy8gVGhpcyBpcyB0aGUgZGVmYXVsdCBiZWhhdmlvciB3ZSB3YW50LCBzbyB3ZSB1c2UgYW4gZW1wdHkgYXJyYXkgb2Ygb2Zmc2V0QXJncyBpZlxyXG4gICAgLy8gbm8gYXJncyByZW1haW4gYWZ0ZXIgcG9wcGluZyB0aGUgbW9kaWZpZXJzIGZyb20gdGhlIGFyZ3MgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24uXHJcbiAgICBjb25zdCBvZmZzZXRBcmdzID0gKGFyZ3MubGVuZ3RoID09PSAyID9cclxuICAgICAgW3t4OiBhcmdzWzBdLCB5OiBhcmdzWzFdfV0gOiBbXSkgYXMgW3t4OiBudW1iZXIsIHk6IG51bWJlcn1dO1xyXG5cclxuICAgIGxldCBhY3Rpb25zID0gYnJvd3Nlci5hY3Rpb25zKClcclxuICAgICAgLm1vdXNlTW92ZShhd2FpdCB0aGlzLmVsZW1lbnQuZ2V0V2ViRWxlbWVudCgpLCAuLi5vZmZzZXRBcmdzKTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IG1vZGlmaWVyS2V5IG9mIG1vZGlmaWVyS2V5cykge1xyXG4gICAgICBhY3Rpb25zID0gYWN0aW9ucy5rZXlEb3duKG1vZGlmaWVyS2V5KTtcclxuICAgIH1cclxuICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNsaWNrKGJ1dHRvbik7XHJcbiAgICBmb3IgKGNvbnN0IG1vZGlmaWVyS2V5IG9mIG1vZGlmaWVyS2V5cykge1xyXG4gICAgICBhY3Rpb25zID0gYWN0aW9ucy5rZXlVcChtb2RpZmllcktleSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgYWN0aW9ucy5wZXJmb3JtKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogRGlzcGF0Y2hlcyBhbiBldmVudCB3aXRoIGEgcGFydGljdWxhciBuYW1lIGFuZCBkYXRhIHRvIGFuIGVsZW1lbnQuXHJcbiAqIE5vdGUgdGhhdCB0aGlzIG5lZWRzIHRvIGJlIGEgcHVyZSBmdW5jdGlvbiwgYmVjYXVzZSBpdCBnZXRzIHN0cmluZ2lmaWVkIGJ5XHJcbiAqIFByb3RyYWN0b3IgYW5kIGlzIGV4ZWN1dGVkIGluc2lkZSB0aGUgYnJvd3Nlci5cclxuICovXHJcbmZ1bmN0aW9uIF9kaXNwYXRjaEV2ZW50KG5hbWU6IHN0cmluZywgZWxlbWVudDogRWxlbWVudEZpbmRlciwgZGF0YT86IFJlY29yZDxzdHJpbmcsIEV2ZW50RGF0YT4pIHtcclxuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xyXG4gIGV2ZW50LmluaXRFdmVudChuYW1lKTtcclxuXHJcbiAgaWYgKGRhdGEpIHtcclxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpiYW4gSGF2ZSB0byB1c2UgYE9iamVjdC5hc3NpZ25gIHRvIHByZXNlcnZlIHRoZSBvcmlnaW5hbCBvYmplY3QuXHJcbiAgICBPYmplY3QuYXNzaWduKGV2ZW50LCBkYXRhKTtcclxuICB9XHJcblxyXG4gIC8vIFRoaXMgdHlwZSBoYXMgYSBzdHJpbmcgaW5kZXggc2lnbmF0dXJlLCBzbyB3ZSBjYW5ub3QgYWNjZXNzIGl0IHVzaW5nIGEgZG90dGVkIHByb3BlcnR5IGFjY2Vzcy5cclxuICBlbGVtZW50WydkaXNwYXRjaEV2ZW50J10oZXZlbnQpO1xyXG59XHJcbiJdfQ==