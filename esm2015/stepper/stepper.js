/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { ENTER, hasModifierKey, SPACE } from '@angular/cdk/keycodes';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Inject, InjectionToken, Input, Optional, Output, QueryList, TemplateRef, ViewChild, ViewEncapsulation, } from '@angular/core';
import { of as observableOf, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { CdkStepHeader } from './step-header';
import { CdkStepLabel } from './step-label';
/** Used to generate unique ID for each stepper component. */
let nextId = 0;
/** Change event emitted on selection changes. */
export class StepperSelectionEvent {
}
/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
    NUMBER: 'number',
    EDIT: 'edit',
    DONE: 'done',
    ERROR: 'error'
};
/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken('STEPPER_GLOBAL_OPTIONS');
/**
 * InjectionToken that can be used to specify the global stepper options.
 * @deprecated Use `STEPPER_GLOBAL_OPTIONS` instead.
 * @breaking-change 8.0.0.
 */
export const MAT_STEPPER_GLOBAL_OPTIONS = STEPPER_GLOBAL_OPTIONS;
export class CdkStep {
    /** @breaking-change 8.0.0 remove the `?` after `stepperOptions` */
    constructor(_stepper, stepperOptions) {
        this._stepper = _stepper;
        /** Whether user has seen the expanded step content or not. */
        this.interacted = false;
        this._editable = true;
        this._optional = false;
        this._completedOverride = null;
        this._customError = null;
        this._stepperOptions = stepperOptions ? stepperOptions : {};
        this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
        this._showError = !!this._stepperOptions.showError;
    }
    /** Whether the user can return to this step once it has been marked as completed. */
    get editable() {
        return this._editable;
    }
    set editable(value) {
        this._editable = coerceBooleanProperty(value);
    }
    /** Whether the completion of step is optional. */
    get optional() {
        return this._optional;
    }
    set optional(value) {
        this._optional = coerceBooleanProperty(value);
    }
    /** Whether step is marked as completed. */
    get completed() {
        return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
    }
    set completed(value) {
        this._completedOverride = coerceBooleanProperty(value);
    }
    _getDefaultCompleted() {
        return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
    }
    /** Whether step has an error. */
    get hasError() {
        return this._customError == null ? this._getDefaultError() : this._customError;
    }
    set hasError(value) {
        this._customError = coerceBooleanProperty(value);
    }
    _getDefaultError() {
        return this.stepControl && this.stepControl.invalid && this.interacted;
    }
    /** Selects this step component. */
    select() {
        this._stepper.selected = this;
    }
    /** Resets the step to its initial state. Note that this includes resetting form data. */
    reset() {
        this.interacted = false;
        if (this._completedOverride != null) {
            this._completedOverride = false;
        }
        if (this._customError != null) {
            this._customError = false;
        }
        if (this.stepControl) {
            this.stepControl.reset();
        }
    }
    ngOnChanges() {
        // Since basically all inputs of the MatStep get proxied through the view down to the
        // underlying MatStepHeader, we have to make sure that change detection runs correctly.
        this._stepper._stateChanged();
    }
}
CdkStep.decorators = [
    { type: Component, args: [{
                selector: 'cdk-step',
                exportAs: 'cdkStep',
                template: '<ng-template><ng-content></ng-content></ng-template>',
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
CdkStep.ctorParameters = () => [
    { type: CdkStepper, decorators: [{ type: Inject, args: [forwardRef(() => CdkStepper),] }] },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: [STEPPER_GLOBAL_OPTIONS,] }] }
];
CdkStep.propDecorators = {
    stepLabel: [{ type: ContentChild, args: [CdkStepLabel,] }],
    content: [{ type: ViewChild, args: [TemplateRef, { static: true },] }],
    stepControl: [{ type: Input }],
    label: [{ type: Input }],
    errorMessage: [{ type: Input }],
    ariaLabel: [{ type: Input, args: ['aria-label',] }],
    ariaLabelledby: [{ type: Input, args: ['aria-labelledby',] }],
    state: [{ type: Input }],
    editable: [{ type: Input }],
    optional: [{ type: Input }],
    completed: [{ type: Input }],
    hasError: [{ type: Input }]
};
export class CdkStepper {
    constructor(_dir, _changeDetectorRef, 
    // @breaking-change 8.0.0 `_elementRef` and `_document` parameters to become required.
    _elementRef, _document) {
        this._dir = _dir;
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        /** Emits when the component is destroyed. */
        this._destroyed = new Subject();
        /** Steps that belong to the current stepper, excluding ones from nested steppers. */
        this.steps = new QueryList();
        this._linear = false;
        this._selectedIndex = 0;
        /** Event emitted when the selected step has changed. */
        this.selectionChange = new EventEmitter();
        this._orientation = 'horizontal';
        this._groupId = nextId++;
        this._document = _document;
    }
    /** Whether the validity of previous steps should be checked or not. */
    get linear() {
        return this._linear;
    }
    set linear(value) {
        this._linear = coerceBooleanProperty(value);
    }
    /** The index of the selected step. */
    get selectedIndex() {
        return this._selectedIndex;
    }
    set selectedIndex(index) {
        const newIndex = coerceNumberProperty(index);
        if (this.steps && this._steps) {
            // Ensure that the index can't be out of bounds.
            if (!this._isValidIndex(index) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
                throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
            }
            const selectedStep = this.selected;
            if (selectedStep) {
                // TODO: this should really be called something like `visited` instead. Just because
                // the user has seen the step doesn't guarantee that they've interacted with it.
                selectedStep.interacted = true;
            }
            if (this._selectedIndex !== newIndex && !this._anyControlsInvalidOrPending(newIndex) &&
                (newIndex >= this._selectedIndex || this.steps.toArray()[newIndex].editable)) {
                this._updateSelectedItemIndex(index);
            }
        }
        else {
            this._selectedIndex = newIndex;
        }
    }
    /** The step that is selected. */
    get selected() {
        // @breaking-change 8.0.0 Change return type to `CdkStep | undefined`.
        return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
    }
    set selected(step) {
        this.selectedIndex = this.steps ? this.steps.toArray().indexOf(step) : -1;
    }
    ngAfterContentInit() {
        this._steps.changes
            .pipe(startWith(this._steps), takeUntil(this._destroyed))
            .subscribe((steps) => {
            this.steps.reset(steps.filter(step => step._stepper === this));
            this.steps.notifyOnChanges();
        });
    }
    ngAfterViewInit() {
        // Note that while the step headers are content children by default, any components that
        // extend this one might have them as view children. We initialize the keyboard handling in
        // AfterViewInit so we're guaranteed for both view and content children to be defined.
        this._keyManager = new FocusKeyManager(this._stepHeader)
            .withWrap()
            .withHomeAndEnd()
            .withVerticalOrientation(this._orientation === 'vertical');
        (this._dir ? this._dir.change : observableOf())
            .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
            .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));
        this._keyManager.updateActiveItem(this._selectedIndex);
        // No need to `takeUntil` here, because we're the ones destroying `steps`.
        this.steps.changes.subscribe(() => {
            if (!this.selected) {
                this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
            }
        });
        // The logic which asserts that the selected index is within bounds doesn't run before the
        // steps are initialized, because we don't how many steps there are yet so we may have an
        // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
        if (!this._isValidIndex(this._selectedIndex)) {
            this._selectedIndex = 0;
        }
    }
    ngOnDestroy() {
        this.steps.destroy();
        this._destroyed.next();
        this._destroyed.complete();
    }
    /** Selects and focuses the next step in list. */
    next() {
        this.selectedIndex = Math.min(this._selectedIndex + 1, this.steps.length - 1);
    }
    /** Selects and focuses the previous step in list. */
    previous() {
        this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
    }
    /** Resets the stepper to its initial state. Note that this includes clearing form data. */
    reset() {
        this._updateSelectedItemIndex(0);
        this.steps.forEach(step => step.reset());
        this._stateChanged();
    }
    /** Returns a unique id for each step label element. */
    _getStepLabelId(i) {
        return `cdk-step-label-${this._groupId}-${i}`;
    }
    /** Returns unique id for each step content element. */
    _getStepContentId(i) {
        return `cdk-step-content-${this._groupId}-${i}`;
    }
    /** Marks the component to be change detected. */
    _stateChanged() {
        this._changeDetectorRef.markForCheck();
    }
    /** Returns position state of the step with the given index. */
    _getAnimationDirection(index) {
        const position = index - this._selectedIndex;
        if (position < 0) {
            return this._layoutDirection() === 'rtl' ? 'next' : 'previous';
        }
        else if (position > 0) {
            return this._layoutDirection() === 'rtl' ? 'previous' : 'next';
        }
        return 'current';
    }
    /** Returns the type of icon to be displayed. */
    _getIndicatorType(index, state = STEP_STATE.NUMBER) {
        const step = this.steps.toArray()[index];
        const isCurrentStep = this._isCurrentStep(index);
        return step._displayDefaultIndicatorType ? this._getDefaultIndicatorLogic(step, isCurrentStep) :
            this._getGuidelineLogic(step, isCurrentStep, state);
    }
    _getDefaultIndicatorLogic(step, isCurrentStep) {
        if (step._showError && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (!step.completed || isCurrentStep) {
            return STEP_STATE.NUMBER;
        }
        else {
            return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
        }
    }
    _getGuidelineLogic(step, isCurrentStep, state = STEP_STATE.NUMBER) {
        if (step._showError && step.hasError && !isCurrentStep) {
            return STEP_STATE.ERROR;
        }
        else if (step.completed && !isCurrentStep) {
            return STEP_STATE.DONE;
        }
        else if (step.completed && isCurrentStep) {
            return state;
        }
        else if (step.editable && isCurrentStep) {
            return STEP_STATE.EDIT;
        }
        else {
            return state;
        }
    }
    _isCurrentStep(index) {
        return this._selectedIndex === index;
    }
    /** Returns the index of the currently-focused step header. */
    _getFocusIndex() {
        return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
    }
    _updateSelectedItemIndex(newIndex) {
        const stepsArray = this.steps.toArray();
        this.selectionChange.emit({
            selectedIndex: newIndex,
            previouslySelectedIndex: this._selectedIndex,
            selectedStep: stepsArray[newIndex],
            previouslySelectedStep: stepsArray[this._selectedIndex],
        });
        // If focus is inside the stepper, move it to the next header, otherwise it may become
        // lost when the active step content is hidden. We can't be more granular with the check
        // (e.g. checking whether focus is inside the active step), because we don't have a
        // reference to the elements that are rendering out the content.
        this._containsFocus() ? this._keyManager.setActiveItem(newIndex) :
            this._keyManager.updateActiveItem(newIndex);
        this._selectedIndex = newIndex;
        this._stateChanged();
    }
    _onKeydown(event) {
        const hasModifier = hasModifierKey(event);
        const keyCode = event.keyCode;
        const manager = this._keyManager;
        if (manager.activeItemIndex != null && !hasModifier &&
            (keyCode === SPACE || keyCode === ENTER)) {
            this.selectedIndex = manager.activeItemIndex;
            event.preventDefault();
        }
        else {
            manager.onKeydown(event);
        }
    }
    _anyControlsInvalidOrPending(index) {
        if (this._linear && index >= 0) {
            return this.steps.toArray().slice(0, index).some(step => {
                const control = step.stepControl;
                const isIncomplete = control ? (control.invalid || control.pending || !step.interacted) : !step.completed;
                return isIncomplete && !step.optional && !step._completedOverride;
            });
        }
        return false;
    }
    _layoutDirection() {
        return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
    }
    /** Checks whether the stepper contains the focused element. */
    _containsFocus() {
        if (!this._document || !this._elementRef) {
            return false;
        }
        const stepperElement = this._elementRef.nativeElement;
        const focusedElement = this._document.activeElement;
        return stepperElement === focusedElement || stepperElement.contains(focusedElement);
    }
    /** Checks whether the passed-in index is a valid step index. */
    _isValidIndex(index) {
        return index > -1 && (!this.steps || index < this.steps.length);
    }
}
CdkStepper.decorators = [
    { type: Directive, args: [{
                selector: '[cdkStepper]',
                exportAs: 'cdkStepper',
            },] }
];
CdkStepper.ctorParameters = () => [
    { type: Directionality, decorators: [{ type: Optional }] },
    { type: ChangeDetectorRef },
    { type: ElementRef },
    { type: undefined, decorators: [{ type: Inject, args: [DOCUMENT,] }] }
];
CdkStepper.propDecorators = {
    _steps: [{ type: ContentChildren, args: [CdkStep, { descendants: true },] }],
    _stepHeader: [{ type: ContentChildren, args: [CdkStepHeader, { descendants: true },] }],
    linear: [{ type: Input }],
    selectedIndex: [{ type: Input }],
    selected: [{ type: Input }],
    selectionChange: [{ type: Output }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RlcHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc3RlcHBlci9zdGVwcGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBa0IsZUFBZSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbkUsT0FBTyxFQUFZLGNBQWMsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBQzVELE9BQU8sRUFFTCxxQkFBcUIsRUFDckIsb0JBQW9CLEVBRXJCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUFDLEtBQUssRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDbkUsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQ3pDLE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFVBQVUsRUFDVixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFHTCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULGlCQUFpQixHQUVsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQWEsRUFBRSxJQUFJLFlBQVksRUFBRSxPQUFPLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDN0QsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFFMUMsNkRBQTZEO0FBQzdELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztBQVdmLGlEQUFpRDtBQUNqRCxNQUFNLE9BQU8scUJBQXFCO0NBWWpDO0FB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QUFLLENBQUM7SUFDaEUsQ0FBQztJQUVELCtEQUErRDtJQUN2RCxjQUFjO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUN4QyxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFDdEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDcEQsT0FBTyxjQUFjLEtBQUssY0FBYyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUVELGdFQUFnRTtJQUN4RCxhQUFhLENBQUMsS0FBYTtRQUNqQyxPQUFPLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRSxDQUFDOzs7WUF2U0YsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxjQUFjO2dCQUN4QixRQUFRLEVBQUUsWUFBWTthQUN2Qjs7O1lBL09rQixjQUFjLHVCQXdVMUIsUUFBUTtZQTVUYixpQkFBaUI7WUFLakIsVUFBVTs0Q0F5VDBDLE1BQU0sU0FBQyxRQUFROzs7cUJBNUVsRSxlQUFlLFNBQUMsT0FBTyxFQUFFLEVBQUMsV0FBVyxFQUFFLElBQUksRUFBQzswQkFVNUMsZUFBZSxTQUFDLGFBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUM7cUJBR2xELEtBQUs7NEJBVUwsS0FBSzt1QkFnQ0wsS0FBSzs4QkFVTCxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge0ZvY3VzYWJsZU9wdGlvbiwgRm9jdXNLZXlNYW5hZ2VyfSBmcm9tICdAYW5ndWxhci9jZGsvYTExeSc7XHJcbmltcG9ydCB7RGlyZWN0aW9uLCBEaXJlY3Rpb25hbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2JpZGknO1xyXG5pbXBvcnQge1xyXG4gIEJvb2xlYW5JbnB1dCxcclxuICBjb2VyY2VCb29sZWFuUHJvcGVydHksXHJcbiAgY29lcmNlTnVtYmVyUHJvcGVydHksXHJcbiAgTnVtYmVySW5wdXRcclxufSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xyXG5pbXBvcnQge0VOVEVSLCBoYXNNb2RpZmllcktleSwgU1BBQ0V9IGZyb20gJ0Bhbmd1bGFyL2Nkay9rZXljb2Rlcyc7XHJcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7XHJcbiAgQWZ0ZXJWaWV3SW5pdCxcclxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcclxuICBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBDb21wb25lbnQsXHJcbiAgQ29udGVudENoaWxkLFxyXG4gIENvbnRlbnRDaGlsZHJlbixcclxuICBEaXJlY3RpdmUsXHJcbiAgRWxlbWVudFJlZixcclxuICBFdmVudEVtaXR0ZXIsXHJcbiAgZm9yd2FyZFJlZixcclxuICBJbmplY3QsXHJcbiAgSW5qZWN0aW9uVG9rZW4sXHJcbiAgSW5wdXQsXHJcbiAgT25DaGFuZ2VzLFxyXG4gIE9uRGVzdHJveSxcclxuICBPcHRpb25hbCxcclxuICBPdXRwdXQsXHJcbiAgUXVlcnlMaXN0LFxyXG4gIFRlbXBsYXRlUmVmLFxyXG4gIFZpZXdDaGlsZCxcclxuICBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBBZnRlckNvbnRlbnRJbml0LFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge09ic2VydmFibGUsIG9mIGFzIG9ic2VydmFibGVPZiwgU3ViamVjdH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7c3RhcnRXaXRoLCB0YWtlVW50aWx9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbmltcG9ydCB7Q2RrU3RlcEhlYWRlcn0gZnJvbSAnLi9zdGVwLWhlYWRlcic7XHJcbmltcG9ydCB7Q2RrU3RlcExhYmVsfSBmcm9tICcuL3N0ZXAtbGFiZWwnO1xyXG5cclxuLyoqIFVzZWQgdG8gZ2VuZXJhdGUgdW5pcXVlIElEIGZvciBlYWNoIHN0ZXBwZXIgY29tcG9uZW50LiAqL1xyXG5sZXQgbmV4dElkID0gMDtcclxuXHJcbi8qKlxyXG4gKiBQb3NpdGlvbiBzdGF0ZSBvZiB0aGUgY29udGVudCBvZiBlYWNoIHN0ZXAgaW4gc3RlcHBlciB0aGF0IGlzIHVzZWQgZm9yIHRyYW5zaXRpb25pbmdcclxuICogdGhlIGNvbnRlbnQgaW50byBjb3JyZWN0IHBvc2l0aW9uIHVwb24gc3RlcCBzZWxlY3Rpb24gY2hhbmdlLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgU3RlcENvbnRlbnRQb3NpdGlvblN0YXRlID0gJ3ByZXZpb3VzJ3wnY3VycmVudCd8J25leHQnO1xyXG5cclxuLyoqIFBvc3NpYmxlIG9yaWVudGF0aW9uIG9mIGEgc3RlcHBlci4gKi9cclxuZXhwb3J0IHR5cGUgU3RlcHBlck9yaWVudGF0aW9uID0gJ2hvcml6b250YWwnfCd2ZXJ0aWNhbCc7XHJcblxyXG4vKiogQ2hhbmdlIGV2ZW50IGVtaXR0ZWQgb24gc2VsZWN0aW9uIGNoYW5nZXMuICovXHJcbmV4cG9ydCBjbGFzcyBTdGVwcGVyU2VsZWN0aW9uRXZlbnQge1xyXG4gIC8qKiBJbmRleCBvZiB0aGUgc3RlcCBub3cgc2VsZWN0ZWQuICovXHJcbiAgc2VsZWN0ZWRJbmRleDogbnVtYmVyO1xyXG5cclxuICAvKiogSW5kZXggb2YgdGhlIHN0ZXAgcHJldmlvdXNseSBzZWxlY3RlZC4gKi9cclxuICBwcmV2aW91c2x5U2VsZWN0ZWRJbmRleDogbnVtYmVyO1xyXG5cclxuICAvKiogVGhlIHN0ZXAgaW5zdGFuY2Ugbm93IHNlbGVjdGVkLiAqL1xyXG4gIHNlbGVjdGVkU3RlcDogQ2RrU3RlcDtcclxuXHJcbiAgLyoqIFRoZSBzdGVwIGluc3RhbmNlIHByZXZpb3VzbHkgc2VsZWN0ZWQuICovXHJcbiAgcHJldmlvdXNseVNlbGVjdGVkU3RlcDogQ2RrU3RlcDtcclxufVxyXG5cclxuLyoqIFRoZSBzdGF0ZSBvZiBlYWNoIHN0ZXAuICovXHJcbmV4cG9ydCB0eXBlIFN0ZXBTdGF0ZSA9ICdudW1iZXInfCdlZGl0J3wnZG9uZSd8J2Vycm9yJ3xzdHJpbmc7XHJcblxyXG4vKiogRW51bSB0byByZXByZXNlbnQgdGhlIGRpZmZlcmVudCBzdGF0ZXMgb2YgdGhlIHN0ZXBzLiAqL1xyXG5leHBvcnQgY29uc3QgU1RFUF9TVEFURSA9IHtcclxuICBOVU1CRVI6ICdudW1iZXInLFxyXG4gIEVESVQ6ICdlZGl0JyxcclxuICBET05FOiAnZG9uZScsXHJcbiAgRVJST1I6ICdlcnJvcidcclxufTtcclxuXHJcbi8qKiBJbmplY3Rpb25Ub2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHNwZWNpZnkgdGhlIGdsb2JhbCBzdGVwcGVyIG9wdGlvbnMuICovXHJcbmV4cG9ydCBjb25zdCBTVEVQUEVSX0dMT0JBTF9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPFN0ZXBwZXJPcHRpb25zPignU1RFUFBFUl9HTE9CQUxfT1BUSU9OUycpO1xyXG5cclxuLyoqXHJcbiAqIEluamVjdGlvblRva2VuIHRoYXQgY2FuIGJlIHVzZWQgdG8gc3BlY2lmeSB0aGUgZ2xvYmFsIHN0ZXBwZXIgb3B0aW9ucy5cclxuICogQGRlcHJlY2F0ZWQgVXNlIGBTVEVQUEVSX0dMT0JBTF9PUFRJT05TYCBpbnN0ZWFkLlxyXG4gKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IE1BVF9TVEVQUEVSX0dMT0JBTF9PUFRJT05TID0gU1RFUFBFUl9HTE9CQUxfT1BUSU9OUztcclxuXHJcbi8qKiBDb25maWd1cmFibGUgb3B0aW9ucyBmb3Igc3RlcHBlci4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTdGVwcGVyT3B0aW9ucyB7XHJcbiAgLyoqXHJcbiAgICogV2hldGhlciB0aGUgc3RlcHBlciBzaG91bGQgZGlzcGxheSBhbiBlcnJvciBzdGF0ZSBvciBub3QuXHJcbiAgICogRGVmYXVsdCBiZWhhdmlvciBpcyBhc3N1bWVkIHRvIGJlIGZhbHNlLlxyXG4gICAqL1xyXG4gIHNob3dFcnJvcj86IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhlIHN0ZXBwZXIgc2hvdWxkIGRpc3BsYXkgdGhlIGRlZmF1bHQgaW5kaWNhdG9yIHR5cGVcclxuICAgKiBvciBub3QuXHJcbiAgICogRGVmYXVsdCBiZWhhdmlvciBpcyBhc3N1bWVkIHRvIGJlIHRydWUuXHJcbiAgICovXHJcbiAgZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlPzogYm9vbGVhbjtcclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdjZGstc3RlcCcsXHJcbiAgZXhwb3J0QXM6ICdjZGtTdGVwJyxcclxuICB0ZW1wbGF0ZTogJzxuZy10ZW1wbGF0ZT48bmctY29udGVudD48L25nLWNvbnRlbnQ+PC9uZy10ZW1wbGF0ZT4nLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDZGtTdGVwIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcclxuICBwcml2YXRlIF9zdGVwcGVyT3B0aW9uczogU3RlcHBlck9wdGlvbnM7XHJcbiAgX3Nob3dFcnJvcjogYm9vbGVhbjtcclxuICBfZGlzcGxheURlZmF1bHRJbmRpY2F0b3JUeXBlOiBib29sZWFuO1xyXG5cclxuICAvKiogVGVtcGxhdGUgZm9yIHN0ZXAgbGFiZWwgaWYgaXQgZXhpc3RzLiAqL1xyXG4gIEBDb250ZW50Q2hpbGQoQ2RrU3RlcExhYmVsKSBzdGVwTGFiZWw6IENka1N0ZXBMYWJlbDtcclxuXHJcbiAgLyoqIFRlbXBsYXRlIGZvciBzdGVwIGNvbnRlbnQuICovXHJcbiAgQFZpZXdDaGlsZChUZW1wbGF0ZVJlZiwge3N0YXRpYzogdHJ1ZX0pIGNvbnRlbnQ6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gIC8qKiBUaGUgdG9wIGxldmVsIGFic3RyYWN0IGNvbnRyb2wgb2YgdGhlIHN0ZXAuICovXHJcbiAgQElucHV0KCkgc3RlcENvbnRyb2w6IEFic3RyYWN0Q29udHJvbExpa2U7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHVzZXIgaGFzIHNlZW4gdGhlIGV4cGFuZGVkIHN0ZXAgY29udGVudCBvciBub3QuICovXHJcbiAgaW50ZXJhY3RlZCA9IGZhbHNlO1xyXG5cclxuICAvKiogUGxhaW4gdGV4dCBsYWJlbCBvZiB0aGUgc3RlcC4gKi9cclxuICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xyXG5cclxuICAvKiogRXJyb3IgbWVzc2FnZSB0byBkaXNwbGF5IHdoZW4gdGhlcmUncyBhbiBlcnJvci4gKi9cclxuICBASW5wdXQoKSBlcnJvck1lc3NhZ2U6IHN0cmluZztcclxuXHJcbiAgLyoqIEFyaWEgbGFiZWwgZm9yIHRoZSB0YWIuICovXHJcbiAgQElucHV0KCdhcmlhLWxhYmVsJykgYXJpYUxhYmVsOiBzdHJpbmc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgZWxlbWVudCB0aGF0IHRoZSB0YWIgaXMgbGFiZWxsZWQgYnkuXHJcbiAgICogV2lsbCBiZSBjbGVhcmVkIGlmIGBhcmlhLWxhYmVsYCBpcyBzZXQgYXQgdGhlIHNhbWUgdGltZS5cclxuICAgKi9cclxuICBASW5wdXQoJ2FyaWEtbGFiZWxsZWRieScpIGFyaWFMYWJlbGxlZGJ5OiBzdHJpbmc7XHJcblxyXG4gIC8qKiBTdGF0ZSBvZiB0aGUgc3RlcC4gKi9cclxuICBASW5wdXQoKSBzdGF0ZTogU3RlcFN0YXRlO1xyXG5cclxuICAvKiogV2hldGhlciB0aGUgdXNlciBjYW4gcmV0dXJuIHRvIHRoaXMgc3RlcCBvbmNlIGl0IGhhcyBiZWVuIG1hcmtlZCBhcyBjb21wbGV0ZWQuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgZWRpdGFibGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZWRpdGFibGU7XHJcbiAgfVxyXG4gIHNldCBlZGl0YWJsZSh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fZWRpdGFibGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBwcml2YXRlIF9lZGl0YWJsZSA9IHRydWU7XHJcblxyXG4gIC8qKiBXaGV0aGVyIHRoZSBjb21wbGV0aW9uIG9mIHN0ZXAgaXMgb3B0aW9uYWwuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgb3B0aW9uYWwoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9uYWw7XHJcbiAgfVxyXG4gIHNldCBvcHRpb25hbCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fb3B0aW9uYWwgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBwcml2YXRlIF9vcHRpb25hbCA9IGZhbHNlO1xyXG5cclxuICAvKiogV2hldGhlciBzdGVwIGlzIG1hcmtlZCBhcyBjb21wbGV0ZWQuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgY29tcGxldGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlID09IG51bGwgPyB0aGlzLl9nZXREZWZhdWx0Q29tcGxldGVkKCkgOiB0aGlzLl9jb21wbGV0ZWRPdmVycmlkZTtcclxuICB9XHJcbiAgc2V0IGNvbXBsZXRlZCh2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fY29tcGxldGVkT3ZlcnJpZGUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBfY29tcGxldGVkT3ZlcnJpZGU6IGJvb2xlYW58bnVsbCA9IG51bGw7XHJcblxyXG4gIHByaXZhdGUgX2dldERlZmF1bHRDb21wbGV0ZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGVwQ29udHJvbCA/IHRoaXMuc3RlcENvbnRyb2wudmFsaWQgJiYgdGhpcy5pbnRlcmFjdGVkIDogdGhpcy5pbnRlcmFjdGVkO1xyXG4gIH1cclxuXHJcbiAgLyoqIFdoZXRoZXIgc3RlcCBoYXMgYW4gZXJyb3IuICovXHJcbiAgQElucHV0KClcclxuICBnZXQgaGFzRXJyb3IoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fY3VzdG9tRXJyb3IgPT0gbnVsbCA/IHRoaXMuX2dldERlZmF1bHRFcnJvcigpIDogdGhpcy5fY3VzdG9tRXJyb3I7XHJcbiAgfVxyXG4gIHNldCBoYXNFcnJvcih2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgdGhpcy5fY3VzdG9tRXJyb3IgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBwcml2YXRlIF9jdXN0b21FcnJvcjogYm9vbGVhbnxudWxsID0gbnVsbDtcclxuXHJcbiAgcHJpdmF0ZSBfZ2V0RGVmYXVsdEVycm9yKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RlcENvbnRyb2wgJiYgdGhpcy5zdGVwQ29udHJvbC5pbnZhbGlkICYmIHRoaXMuaW50ZXJhY3RlZDtcclxuICB9XHJcblxyXG4gIC8qKiBAYnJlYWtpbmctY2hhbmdlIDguMC4wIHJlbW92ZSB0aGUgYD9gIGFmdGVyIGBzdGVwcGVyT3B0aW9uc2AgKi9cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgQEluamVjdChmb3J3YXJkUmVmKCgpID0+IENka1N0ZXBwZXIpKSBwdWJsaWMgX3N0ZXBwZXI6IENka1N0ZXBwZXIsXHJcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoU1RFUFBFUl9HTE9CQUxfT1BUSU9OUykgc3RlcHBlck9wdGlvbnM/OiBTdGVwcGVyT3B0aW9ucykge1xyXG4gICAgdGhpcy5fc3RlcHBlck9wdGlvbnMgPSBzdGVwcGVyT3B0aW9ucyA/IHN0ZXBwZXJPcHRpb25zIDoge307XHJcbiAgICB0aGlzLl9kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgPSB0aGlzLl9zdGVwcGVyT3B0aW9ucy5kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgIT09IGZhbHNlO1xyXG4gICAgdGhpcy5fc2hvd0Vycm9yID0gISF0aGlzLl9zdGVwcGVyT3B0aW9ucy5zaG93RXJyb3I7XHJcbiAgfVxyXG5cclxuICAvKiogU2VsZWN0cyB0aGlzIHN0ZXAgY29tcG9uZW50LiAqL1xyXG4gIHNlbGVjdCgpOiB2b2lkIHtcclxuICAgIHRoaXMuX3N0ZXBwZXIuc2VsZWN0ZWQgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJlc2V0cyB0aGUgc3RlcCB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gTm90ZSB0aGF0IHRoaXMgaW5jbHVkZXMgcmVzZXR0aW5nIGZvcm0gZGF0YS4gKi9cclxuICByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuaW50ZXJhY3RlZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0aGlzLl9jb21wbGV0ZWRPdmVycmlkZSAhPSBudWxsKSB7XHJcbiAgICAgIHRoaXMuX2NvbXBsZXRlZE92ZXJyaWRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2N1c3RvbUVycm9yICE9IG51bGwpIHtcclxuICAgICAgdGhpcy5fY3VzdG9tRXJyb3IgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zdGVwQ29udHJvbCkge1xyXG4gICAgICB0aGlzLnN0ZXBDb250cm9sLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uQ2hhbmdlcygpIHtcclxuICAgIC8vIFNpbmNlIGJhc2ljYWxseSBhbGwgaW5wdXRzIG9mIHRoZSBNYXRTdGVwIGdldCBwcm94aWVkIHRocm91Z2ggdGhlIHZpZXcgZG93biB0byB0aGVcclxuICAgIC8vIHVuZGVybHlpbmcgTWF0U3RlcEhlYWRlciwgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgY29ycmVjdGx5LlxyXG4gICAgdGhpcy5fc3RlcHBlci5fc3RhdGVDaGFuZ2VkKCk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZWRpdGFibGU6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGFzRXJyb3I6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfb3B0aW9uYWw6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfY29tcGxldGVkOiBCb29sZWFuSW5wdXQ7XHJcbn1cclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gIHNlbGVjdG9yOiAnW2Nka1N0ZXBwZXJdJyxcclxuICBleHBvcnRBczogJ2Nka1N0ZXBwZXInLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ2RrU3RlcHBlciBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcbiAgLyoqIEVtaXRzIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQuICovXHJcbiAgcHJvdGVjdGVkIF9kZXN0cm95ZWQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xyXG5cclxuICAvKiogVXNlZCBmb3IgbWFuYWdpbmcga2V5Ym9hcmQgZm9jdXMuICovXHJcbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPEZvY3VzYWJsZU9wdGlvbj47XHJcblxyXG4gIC8qKlxyXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgUmVtb3ZlIGB8IHVuZGVmaW5lZGAgb25jZSB0aGUgYF9kb2N1bWVudGBcclxuICAgKiBjb25zdHJ1Y3RvciBwYXJhbSBpcyByZXF1aXJlZC5cclxuICAgKi9cclxuICBwcml2YXRlIF9kb2N1bWVudDogRG9jdW1lbnR8dW5kZWZpbmVkO1xyXG5cclxuICAvKiogRnVsbCBsaXN0IG9mIHN0ZXBzIGluc2lkZSB0aGUgc3RlcHBlciwgaW5jbHVkaW5nIGluc2lkZSBuZXN0ZWQgc3RlcHBlcnMuICovXHJcbiAgQENvbnRlbnRDaGlsZHJlbihDZGtTdGVwLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfc3RlcHM6IFF1ZXJ5TGlzdDxDZGtTdGVwPjtcclxuXHJcbiAgLyoqIFN0ZXBzIHRoYXQgYmVsb25nIHRvIHRoZSBjdXJyZW50IHN0ZXBwZXIsIGV4Y2x1ZGluZyBvbmVzIGZyb20gbmVzdGVkIHN0ZXBwZXJzLiAqL1xyXG4gIHJlYWRvbmx5IHN0ZXBzOiBRdWVyeUxpc3Q8Q2RrU3RlcD4gPSBuZXcgUXVlcnlMaXN0PENka1N0ZXA+KCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBsaXN0IG9mIHN0ZXAgaGVhZGVycyBvZiB0aGUgc3RlcHMgaW4gdGhlIHN0ZXBwZXIuXHJcbiAgICogQGRlcHJlY2F0ZWQgVHlwZSB0byBiZSBjaGFuZ2VkIHRvIGBRdWVyeUxpc3Q8Q2RrU3RlcEhlYWRlcj5gLlxyXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcclxuICAgKi9cclxuICBAQ29udGVudENoaWxkcmVuKENka1N0ZXBIZWFkZXIsIHtkZXNjZW5kYW50czogdHJ1ZX0pIF9zdGVwSGVhZGVyOiBRdWVyeUxpc3Q8Rm9jdXNhYmxlT3B0aW9uPjtcclxuXHJcbiAgLyoqIFdoZXRoZXIgdGhlIHZhbGlkaXR5IG9mIHByZXZpb3VzIHN0ZXBzIHNob3VsZCBiZSBjaGVja2VkIG9yIG5vdC4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBsaW5lYXIoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fbGluZWFyO1xyXG4gIH1cclxuICBzZXQgbGluZWFyKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICB0aGlzLl9saW5lYXIgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xyXG4gIH1cclxuICBwcml2YXRlIF9saW5lYXIgPSBmYWxzZTtcclxuXHJcbiAgLyoqIFRoZSBpbmRleCBvZiB0aGUgc2VsZWN0ZWQgc3RlcC4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBzZWxlY3RlZEluZGV4KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdGVkSW5kZXg7XHJcbiAgfVxyXG4gIHNldCBzZWxlY3RlZEluZGV4KGluZGV4OiBudW1iZXIpIHtcclxuICAgIGNvbnN0IG5ld0luZGV4ID0gY29lcmNlTnVtYmVyUHJvcGVydHkoaW5kZXgpO1xyXG5cclxuICAgIGlmICh0aGlzLnN0ZXBzICYmIHRoaXMuX3N0ZXBzKSB7XHJcbiAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBpbmRleCBjYW4ndCBiZSBvdXQgb2YgYm91bmRzLlxyXG4gICAgICBpZiAoIXRoaXMuX2lzVmFsaWRJbmRleChpbmRleCkgJiYgKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcignY2RrU3RlcHBlcjogQ2Fubm90IGFzc2lnbiBvdXQtb2YtYm91bmRzIHZhbHVlIHRvIGBzZWxlY3RlZEluZGV4YC4nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgc2VsZWN0ZWRTdGVwID0gdGhpcy5zZWxlY3RlZDtcclxuXHJcbiAgICAgIGlmIChzZWxlY3RlZFN0ZXApIHtcclxuICAgICAgICAvLyBUT0RPOiB0aGlzIHNob3VsZCByZWFsbHkgYmUgY2FsbGVkIHNvbWV0aGluZyBsaWtlIGB2aXNpdGVkYCBpbnN0ZWFkLiBKdXN0IGJlY2F1c2VcclxuICAgICAgICAvLyB0aGUgdXNlciBoYXMgc2VlbiB0aGUgc3RlcCBkb2Vzbid0IGd1YXJhbnRlZSB0aGF0IHRoZXkndmUgaW50ZXJhY3RlZCB3aXRoIGl0LlxyXG4gICAgICAgIHNlbGVjdGVkU3RlcC5pbnRlcmFjdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMuX3NlbGVjdGVkSW5kZXggIT09IG5ld0luZGV4ICYmICF0aGlzLl9hbnlDb250cm9sc0ludmFsaWRPclBlbmRpbmcobmV3SW5kZXgpICYmXHJcbiAgICAgICAgICAobmV3SW5kZXggPj0gdGhpcy5fc2VsZWN0ZWRJbmRleCB8fCB0aGlzLnN0ZXBzLnRvQXJyYXkoKVtuZXdJbmRleF0uZWRpdGFibGUpKSB7XHJcbiAgICAgICAgdGhpcy5fdXBkYXRlU2VsZWN0ZWRJdGVtSW5kZXgoaW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gbmV3SW5kZXg7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHByaXZhdGUgX3NlbGVjdGVkSW5kZXggPSAwO1xyXG5cclxuICAvKiogVGhlIHN0ZXAgdGhhdCBpcyBzZWxlY3RlZC4gKi9cclxuICBASW5wdXQoKVxyXG4gIGdldCBzZWxlY3RlZCgpOiBDZGtTdGVwIHtcclxuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgQ2hhbmdlIHJldHVybiB0eXBlIHRvIGBDZGtTdGVwIHwgdW5kZWZpbmVkYC5cclxuICAgIHJldHVybiB0aGlzLnN0ZXBzID8gdGhpcy5zdGVwcy50b0FycmF5KClbdGhpcy5zZWxlY3RlZEluZGV4XSA6IHVuZGVmaW5lZCE7XHJcbiAgfVxyXG4gIHNldCBzZWxlY3RlZChzdGVwOiBDZGtTdGVwKSB7XHJcbiAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSB0aGlzLnN0ZXBzID8gdGhpcy5zdGVwcy50b0FycmF5KCkuaW5kZXhPZihzdGVwKSA6IC0xO1xyXG4gIH1cclxuXHJcbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgc2VsZWN0ZWQgc3RlcCBoYXMgY2hhbmdlZC4gKi9cclxuICBAT3V0cHV0KClcclxuICBzZWxlY3Rpb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxTdGVwcGVyU2VsZWN0aW9uRXZlbnQ+ID0gbmV3IEV2ZW50RW1pdHRlcjxTdGVwcGVyU2VsZWN0aW9uRXZlbnQ+KCk7XHJcblxyXG4gIC8qKiBVc2VkIHRvIHRyYWNrIHVuaXF1ZSBJRCBmb3IgZWFjaCBzdGVwcGVyIGNvbXBvbmVudC4gKi9cclxuICBfZ3JvdXBJZDogbnVtYmVyO1xyXG5cclxuICBwcm90ZWN0ZWQgX29yaWVudGF0aW9uOiBTdGVwcGVyT3JpZW50YXRpb24gPSAnaG9yaXpvbnRhbCc7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIF9kaXI6IERpcmVjdGlvbmFsaXR5LCBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXHJcbiAgICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgYF9lbGVtZW50UmVmYCBhbmQgYF9kb2N1bWVudGAgcGFyYW1ldGVycyB0byBiZWNvbWUgcmVxdWlyZWQuXHJcbiAgICAgIHByaXZhdGUgX2VsZW1lbnRSZWY/OiBFbGVtZW50UmVmPEhUTUxFbGVtZW50PiwgQEluamVjdChET0NVTUVOVCkgX2RvY3VtZW50PzogYW55KSB7XHJcbiAgICB0aGlzLl9ncm91cElkID0gbmV4dElkKys7XHJcbiAgICB0aGlzLl9kb2N1bWVudCA9IF9kb2N1bWVudDtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgIHRoaXMuX3N0ZXBzLmNoYW5nZXNcclxuICAgICAgLnBpcGUoc3RhcnRXaXRoKHRoaXMuX3N0ZXBzKSwgdGFrZVVudGlsKHRoaXMuX2Rlc3Ryb3llZCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKHN0ZXBzOiBRdWVyeUxpc3Q8Q2RrU3RlcD4pID0+IHtcclxuICAgICAgICB0aGlzLnN0ZXBzLnJlc2V0KHN0ZXBzLmZpbHRlcihzdGVwID0+IHN0ZXAuX3N0ZXBwZXIgPT09IHRoaXMpKTtcclxuICAgICAgICB0aGlzLnN0ZXBzLm5vdGlmeU9uQ2hhbmdlcygpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgIC8vIE5vdGUgdGhhdCB3aGlsZSB0aGUgc3RlcCBoZWFkZXJzIGFyZSBjb250ZW50IGNoaWxkcmVuIGJ5IGRlZmF1bHQsIGFueSBjb21wb25lbnRzIHRoYXRcclxuICAgIC8vIGV4dGVuZCB0aGlzIG9uZSBtaWdodCBoYXZlIHRoZW0gYXMgdmlldyBjaGlsZHJlbi4gV2UgaW5pdGlhbGl6ZSB0aGUga2V5Ym9hcmQgaGFuZGxpbmcgaW5cclxuICAgIC8vIEFmdGVyVmlld0luaXQgc28gd2UncmUgZ3VhcmFudGVlZCBmb3IgYm90aCB2aWV3IGFuZCBjb250ZW50IGNoaWxkcmVuIHRvIGJlIGRlZmluZWQuXHJcbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcjxGb2N1c2FibGVPcHRpb24+KHRoaXMuX3N0ZXBIZWFkZXIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoV3JhcCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoSG9tZUFuZEVuZCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC53aXRoVmVydGljYWxPcmllbnRhdGlvbih0aGlzLl9vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJyk7XHJcblxyXG4gICAgKHRoaXMuX2RpciA/ICh0aGlzLl9kaXIuY2hhbmdlIGFzIE9ic2VydmFibGU8RGlyZWN0aW9uPikgOiBvYnNlcnZhYmxlT2Y8RGlyZWN0aW9uPigpKVxyXG4gICAgICAgIC5waXBlKHN0YXJ0V2l0aCh0aGlzLl9sYXlvdXREaXJlY3Rpb24oKSksIHRha2VVbnRpbCh0aGlzLl9kZXN0cm95ZWQpKVxyXG4gICAgICAgIC5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHRoaXMuX2tleU1hbmFnZXIud2l0aEhvcml6b250YWxPcmllbnRhdGlvbihkaXJlY3Rpb24pKTtcclxuXHJcbiAgICB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0odGhpcy5fc2VsZWN0ZWRJbmRleCk7XHJcblxyXG4gICAgLy8gTm8gbmVlZCB0byBgdGFrZVVudGlsYCBoZXJlLCBiZWNhdXNlIHdlJ3JlIHRoZSBvbmVzIGRlc3Ryb3lpbmcgYHN0ZXBzYC5cclxuICAgIHRoaXMuc3RlcHMuY2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICB0aGlzLl9zZWxlY3RlZEluZGV4ID0gTWF0aC5tYXgodGhpcy5fc2VsZWN0ZWRJbmRleCAtIDEsIDApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBUaGUgbG9naWMgd2hpY2ggYXNzZXJ0cyB0aGF0IHRoZSBzZWxlY3RlZCBpbmRleCBpcyB3aXRoaW4gYm91bmRzIGRvZXNuJ3QgcnVuIGJlZm9yZSB0aGVcclxuICAgIC8vIHN0ZXBzIGFyZSBpbml0aWFsaXplZCwgYmVjYXVzZSB3ZSBkb24ndCBob3cgbWFueSBzdGVwcyB0aGVyZSBhcmUgeWV0IHNvIHdlIG1heSBoYXZlIGFuXHJcbiAgICAvLyBpbnZhbGlkIGluZGV4IG9uIGluaXQuIElmIHRoYXQncyB0aGUgY2FzZSwgYXV0by1jb3JyZWN0IHRvIHRoZSBkZWZhdWx0IHNvIHdlIGRvbid0IHRocm93LlxyXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkSW5kZXgodGhpcy5fc2VsZWN0ZWRJbmRleCkpIHtcclxuICAgICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZ09uRGVzdHJveSgpIHtcclxuICAgIHRoaXMuc3RlcHMuZGVzdHJveSgpO1xyXG4gICAgdGhpcy5fZGVzdHJveWVkLm5leHQoKTtcclxuICAgIHRoaXMuX2Rlc3Ryb3llZC5jb21wbGV0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFNlbGVjdHMgYW5kIGZvY3VzZXMgdGhlIG5leHQgc3RlcCBpbiBsaXN0LiAqL1xyXG4gIG5leHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1pbih0aGlzLl9zZWxlY3RlZEluZGV4ICsgMSwgdGhpcy5zdGVwcy5sZW5ndGggLSAxKTtcclxuICB9XHJcblxyXG4gIC8qKiBTZWxlY3RzIGFuZCBmb2N1c2VzIHRoZSBwcmV2aW91cyBzdGVwIGluIGxpc3QuICovXHJcbiAgcHJldmlvdXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1heCh0aGlzLl9zZWxlY3RlZEluZGV4IC0gMSwgMCk7XHJcbiAgfVxyXG5cclxuICAvKiogUmVzZXRzIHRoZSBzdGVwcGVyIHRvIGl0cyBpbml0aWFsIHN0YXRlLiBOb3RlIHRoYXQgdGhpcyBpbmNsdWRlcyBjbGVhcmluZyBmb3JtIGRhdGEuICovXHJcbiAgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl91cGRhdGVTZWxlY3RlZEl0ZW1JbmRleCgwKTtcclxuICAgIHRoaXMuc3RlcHMuZm9yRWFjaChzdGVwID0+IHN0ZXAucmVzZXQoKSk7XHJcbiAgICB0aGlzLl9zdGF0ZUNoYW5nZWQoKTtcclxuICB9XHJcblxyXG4gIC8qKiBSZXR1cm5zIGEgdW5pcXVlIGlkIGZvciBlYWNoIHN0ZXAgbGFiZWwgZWxlbWVudC4gKi9cclxuICBfZ2V0U3RlcExhYmVsSWQoaTogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgY2RrLXN0ZXAtbGFiZWwtJHt0aGlzLl9ncm91cElkfS0ke2l9YDtcclxuICB9XHJcblxyXG4gIC8qKiBSZXR1cm5zIHVuaXF1ZSBpZCBmb3IgZWFjaCBzdGVwIGNvbnRlbnQgZWxlbWVudC4gKi9cclxuICBfZ2V0U3RlcENvbnRlbnRJZChpOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBjZGstc3RlcC1jb250ZW50LSR7dGhpcy5fZ3JvdXBJZH0tJHtpfWA7XHJcbiAgfVxyXG5cclxuICAvKiogTWFya3MgdGhlIGNvbXBvbmVudCB0byBiZSBjaGFuZ2UgZGV0ZWN0ZWQuICovXHJcbiAgX3N0YXRlQ2hhbmdlZCgpIHtcclxuICAgIHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xyXG4gIH1cclxuXHJcbiAgLyoqIFJldHVybnMgcG9zaXRpb24gc3RhdGUgb2YgdGhlIHN0ZXAgd2l0aCB0aGUgZ2l2ZW4gaW5kZXguICovXHJcbiAgX2dldEFuaW1hdGlvbkRpcmVjdGlvbihpbmRleDogbnVtYmVyKTogU3RlcENvbnRlbnRQb3NpdGlvblN0YXRlIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gaW5kZXggLSB0aGlzLl9zZWxlY3RlZEluZGV4O1xyXG4gICAgaWYgKHBvc2l0aW9uIDwgMCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbGF5b3V0RGlyZWN0aW9uKCkgPT09ICdydGwnID8gJ25leHQnIDogJ3ByZXZpb3VzJztcclxuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiAwKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9sYXlvdXREaXJlY3Rpb24oKSA9PT0gJ3J0bCcgPyAncHJldmlvdXMnIDogJ25leHQnO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuICdjdXJyZW50JztcclxuICB9XHJcblxyXG4gIC8qKiBSZXR1cm5zIHRoZSB0eXBlIG9mIGljb24gdG8gYmUgZGlzcGxheWVkLiAqL1xyXG4gIF9nZXRJbmRpY2F0b3JUeXBlKGluZGV4OiBudW1iZXIsIHN0YXRlOiBTdGVwU3RhdGUgPSBTVEVQX1NUQVRFLk5VTUJFUik6IFN0ZXBTdGF0ZSB7XHJcbiAgICBjb25zdCBzdGVwID0gdGhpcy5zdGVwcy50b0FycmF5KClbaW5kZXhdO1xyXG4gICAgY29uc3QgaXNDdXJyZW50U3RlcCA9IHRoaXMuX2lzQ3VycmVudFN0ZXAoaW5kZXgpO1xyXG5cclxuICAgIHJldHVybiBzdGVwLl9kaXNwbGF5RGVmYXVsdEluZGljYXRvclR5cGUgPyB0aGlzLl9nZXREZWZhdWx0SW5kaWNhdG9yTG9naWMoc3RlcCwgaXNDdXJyZW50U3RlcCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2dldEd1aWRlbGluZUxvZ2ljKHN0ZXAsIGlzQ3VycmVudFN0ZXAsIHN0YXRlKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2dldERlZmF1bHRJbmRpY2F0b3JMb2dpYyhzdGVwOiBDZGtTdGVwLCBpc0N1cnJlbnRTdGVwOiBib29sZWFuKTogU3RlcFN0YXRlIHtcclxuICAgIGlmIChzdGVwLl9zaG93RXJyb3IgJiYgc3RlcC5oYXNFcnJvciAmJiAhaXNDdXJyZW50U3RlcCkge1xyXG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5FUlJPUjtcclxuICAgIH0gZWxzZSBpZiAoIXN0ZXAuY29tcGxldGVkIHx8IGlzQ3VycmVudFN0ZXApIHtcclxuICAgICAgcmV0dXJuIFNURVBfU1RBVEUuTlVNQkVSO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHN0ZXAuZWRpdGFibGUgPyBTVEVQX1NUQVRFLkVESVQgOiBTVEVQX1NUQVRFLkRPTkU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9nZXRHdWlkZWxpbmVMb2dpYyhcclxuICAgICAgc3RlcDogQ2RrU3RlcCwgaXNDdXJyZW50U3RlcDogYm9vbGVhbiwgc3RhdGU6IFN0ZXBTdGF0ZSA9IFNURVBfU1RBVEUuTlVNQkVSKTogU3RlcFN0YXRlIHtcclxuICAgIGlmIChzdGVwLl9zaG93RXJyb3IgJiYgc3RlcC5oYXNFcnJvciAmJiAhaXNDdXJyZW50U3RlcCkge1xyXG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5FUlJPUjtcclxuICAgIH0gZWxzZSBpZiAoc3RlcC5jb21wbGV0ZWQgJiYgIWlzQ3VycmVudFN0ZXApIHtcclxuICAgICAgcmV0dXJuIFNURVBfU1RBVEUuRE9ORTtcclxuICAgIH0gZWxzZSBpZiAoc3RlcC5jb21wbGV0ZWQgJiYgaXNDdXJyZW50U3RlcCkge1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9IGVsc2UgaWYgKHN0ZXAuZWRpdGFibGUgJiYgaXNDdXJyZW50U3RlcCkge1xyXG4gICAgICByZXR1cm4gU1RFUF9TVEFURS5FRElUO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfaXNDdXJyZW50U3RlcChpbmRleDogbnVtYmVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRJbmRleCA9PT0gaW5kZXg7XHJcbiAgfVxyXG5cclxuICAvKiogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGN1cnJlbnRseS1mb2N1c2VkIHN0ZXAgaGVhZGVyLiAqL1xyXG4gIF9nZXRGb2N1c0luZGV4KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2tleU1hbmFnZXIgPyB0aGlzLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCA6IHRoaXMuX3NlbGVjdGVkSW5kZXg7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF91cGRhdGVTZWxlY3RlZEl0ZW1JbmRleChuZXdJbmRleDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBjb25zdCBzdGVwc0FycmF5ID0gdGhpcy5zdGVwcy50b0FycmF5KCk7XHJcbiAgICB0aGlzLnNlbGVjdGlvbkNoYW5nZS5lbWl0KHtcclxuICAgICAgc2VsZWN0ZWRJbmRleDogbmV3SW5kZXgsXHJcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZEluZGV4OiB0aGlzLl9zZWxlY3RlZEluZGV4LFxyXG4gICAgICBzZWxlY3RlZFN0ZXA6IHN0ZXBzQXJyYXlbbmV3SW5kZXhdLFxyXG4gICAgICBwcmV2aW91c2x5U2VsZWN0ZWRTdGVwOiBzdGVwc0FycmF5W3RoaXMuX3NlbGVjdGVkSW5kZXhdLFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gSWYgZm9jdXMgaXMgaW5zaWRlIHRoZSBzdGVwcGVyLCBtb3ZlIGl0IHRvIHRoZSBuZXh0IGhlYWRlciwgb3RoZXJ3aXNlIGl0IG1heSBiZWNvbWVcclxuICAgIC8vIGxvc3Qgd2hlbiB0aGUgYWN0aXZlIHN0ZXAgY29udGVudCBpcyBoaWRkZW4uIFdlIGNhbid0IGJlIG1vcmUgZ3JhbnVsYXIgd2l0aCB0aGUgY2hlY2tcclxuICAgIC8vIChlLmcuIGNoZWNraW5nIHdoZXRoZXIgZm9jdXMgaXMgaW5zaWRlIHRoZSBhY3RpdmUgc3RlcCksIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhXHJcbiAgICAvLyByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnRzIHRoYXQgYXJlIHJlbmRlcmluZyBvdXQgdGhlIGNvbnRlbnQuXHJcbiAgICB0aGlzLl9jb250YWluc0ZvY3VzKCkgPyB0aGlzLl9rZXlNYW5hZ2VyLnNldEFjdGl2ZUl0ZW0obmV3SW5kZXgpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleU1hbmFnZXIudXBkYXRlQWN0aXZlSXRlbShuZXdJbmRleCk7XHJcblxyXG4gICAgdGhpcy5fc2VsZWN0ZWRJbmRleCA9IG5ld0luZGV4O1xyXG4gICAgdGhpcy5fc3RhdGVDaGFuZ2VkKCk7XHJcbiAgfVxyXG5cclxuICBfb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICBjb25zdCBoYXNNb2RpZmllciA9IGhhc01vZGlmaWVyS2V5KGV2ZW50KTtcclxuICAgIGNvbnN0IGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xyXG4gICAgY29uc3QgbWFuYWdlciA9IHRoaXMuX2tleU1hbmFnZXI7XHJcblxyXG4gICAgaWYgKG1hbmFnZXIuYWN0aXZlSXRlbUluZGV4ICE9IG51bGwgJiYgIWhhc01vZGlmaWVyICYmXHJcbiAgICAgICAgKGtleUNvZGUgPT09IFNQQUNFIHx8IGtleUNvZGUgPT09IEVOVEVSKSkge1xyXG4gICAgICB0aGlzLnNlbGVjdGVkSW5kZXggPSBtYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleDtcclxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2FueUNvbnRyb2xzSW52YWxpZE9yUGVuZGluZyhpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5fbGluZWFyICYmIGluZGV4ID49IDApIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RlcHMudG9BcnJheSgpLnNsaWNlKDAsIGluZGV4KS5zb21lKHN0ZXAgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSBzdGVwLnN0ZXBDb250cm9sO1xyXG4gICAgICAgIGNvbnN0IGlzSW5jb21wbGV0ZSA9XHJcbiAgICAgICAgICAgIGNvbnRyb2wgPyAoY29udHJvbC5pbnZhbGlkIHx8IGNvbnRyb2wucGVuZGluZyB8fCAhc3RlcC5pbnRlcmFjdGVkKSA6ICFzdGVwLmNvbXBsZXRlZDtcclxuICAgICAgICByZXR1cm4gaXNJbmNvbXBsZXRlICYmICFzdGVwLm9wdGlvbmFsICYmICFzdGVwLl9jb21wbGV0ZWRPdmVycmlkZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfbGF5b3V0RGlyZWN0aW9uKCk6IERpcmVjdGlvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5fZGlyICYmIHRoaXMuX2Rpci52YWx1ZSA9PT0gJ3J0bCcgPyAncnRsJyA6ICdsdHInO1xyXG4gIH1cclxuXHJcbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzdGVwcGVyIGNvbnRhaW5zIHRoZSBmb2N1c2VkIGVsZW1lbnQuICovXHJcbiAgcHJpdmF0ZSBfY29udGFpbnNGb2N1cygpOiBib29sZWFuIHtcclxuICAgIGlmICghdGhpcy5fZG9jdW1lbnQgfHwgIXRoaXMuX2VsZW1lbnRSZWYpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0ZXBwZXJFbGVtZW50ID0gdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG4gICAgY29uc3QgZm9jdXNlZEVsZW1lbnQgPSB0aGlzLl9kb2N1bWVudC5hY3RpdmVFbGVtZW50O1xyXG4gICAgcmV0dXJuIHN0ZXBwZXJFbGVtZW50ID09PSBmb2N1c2VkRWxlbWVudCB8fCBzdGVwcGVyRWxlbWVudC5jb250YWlucyhmb2N1c2VkRWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHBhc3NlZC1pbiBpbmRleCBpcyBhIHZhbGlkIHN0ZXAgaW5kZXguICovXHJcbiAgcHJpdmF0ZSBfaXNWYWxpZEluZGV4KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBpbmRleCA+IC0xICYmICghdGhpcy5zdGVwcyB8fCBpbmRleCA8IHRoaXMuc3RlcHMubGVuZ3RoKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9lZGl0YWJsZTogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9vcHRpb25hbDogQm9vbGVhbklucHV0O1xyXG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9jb21wbGV0ZWQ6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGFzRXJyb3I6IEJvb2xlYW5JbnB1dDtcclxuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfbGluZWFyOiBCb29sZWFuSW5wdXQ7XHJcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3NlbGVjdGVkSW5kZXg6IE51bWJlcklucHV0O1xyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIFNpbXBsaWZpZWQgcmVwcmVzZW50YXRpb24gb2YgYW4gXCJBYnN0cmFjdENvbnRyb2xcIiBmcm9tIEBhbmd1bGFyL2Zvcm1zLlxyXG4gKiBVc2VkIHRvIGF2b2lkIGhhdmluZyB0byBicmluZyBpbiBAYW5ndWxhci9mb3JtcyBmb3IgYSBzaW5nbGUgb3B0aW9uYWwgaW50ZXJmYWNlLlxyXG4gKiBAZG9jcy1wcml2YXRlXHJcbiAqL1xyXG5pbnRlcmZhY2UgQWJzdHJhY3RDb250cm9sTGlrZSB7XHJcbiAgYXN5bmNWYWxpZGF0b3I6ICgoY29udHJvbDogYW55KSA9PiBhbnkpIHwgbnVsbDtcclxuICBkaXJ0eTogYm9vbGVhbjtcclxuICBkaXNhYmxlZDogYm9vbGVhbjtcclxuICBlbmFibGVkOiBib29sZWFuO1xyXG4gIGVycm9yczoge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsO1xyXG4gIGludmFsaWQ6IGJvb2xlYW47XHJcbiAgcGFyZW50OiBhbnk7XHJcbiAgcGVuZGluZzogYm9vbGVhbjtcclxuICBwcmlzdGluZTogYm9vbGVhbjtcclxuICByb290OiBBYnN0cmFjdENvbnRyb2xMaWtlO1xyXG4gIHN0YXR1czogc3RyaW5nO1xyXG4gIHN0YXR1c0NoYW5nZXM6IE9ic2VydmFibGU8YW55PjtcclxuICB0b3VjaGVkOiBib29sZWFuO1xyXG4gIHVudG91Y2hlZDogYm9vbGVhbjtcclxuICB1cGRhdGVPbjogYW55O1xyXG4gIHZhbGlkOiBib29sZWFuO1xyXG4gIHZhbGlkYXRvcjogKChjb250cm9sOiBhbnkpID0+IGFueSkgfCBudWxsO1xyXG4gIHZhbHVlOiBhbnk7XHJcbiAgdmFsdWVDaGFuZ2VzOiBPYnNlcnZhYmxlPGFueT47XHJcbiAgY2xlYXJBc3luY1ZhbGlkYXRvcnMoKTogdm9pZDtcclxuICBjbGVhclZhbGlkYXRvcnMoKTogdm9pZDtcclxuICBkaXNhYmxlKG9wdHM/OiBhbnkpOiB2b2lkO1xyXG4gIGVuYWJsZShvcHRzPzogYW55KTogdm9pZDtcclxuICBnZXQocGF0aDogKHN0cmluZyB8IG51bWJlcilbXSB8IHN0cmluZyk6IEFic3RyYWN0Q29udHJvbExpa2UgfCBudWxsO1xyXG4gIGdldEVycm9yKGVycm9yQ29kZTogc3RyaW5nLCBwYXRoPzogKHN0cmluZyB8IG51bWJlcilbXSB8IHN0cmluZyk6IGFueTtcclxuICBoYXNFcnJvcihlcnJvckNvZGU6IHN0cmluZywgcGF0aD86IChzdHJpbmcgfCBudW1iZXIpW10gfCBzdHJpbmcpOiBib29sZWFuO1xyXG4gIG1hcmtBbGxBc1RvdWNoZWQoKTogdm9pZDtcclxuICBtYXJrQXNEaXJ0eShvcHRzPzogYW55KTogdm9pZDtcclxuICBtYXJrQXNQZW5kaW5nKG9wdHM/OiBhbnkpOiB2b2lkO1xyXG4gIG1hcmtBc1ByaXN0aW5lKG9wdHM/OiBhbnkpOiB2b2lkO1xyXG4gIG1hcmtBc1RvdWNoZWQob3B0cz86IGFueSk6IHZvaWQ7XHJcbiAgbWFya0FzVW50b3VjaGVkKG9wdHM/OiBhbnkpOiB2b2lkO1xyXG4gIHBhdGNoVmFsdWUodmFsdWU6IGFueSwgb3B0aW9ucz86IE9iamVjdCk6IHZvaWQ7XHJcbiAgcmVzZXQodmFsdWU/OiBhbnksIG9wdGlvbnM/OiBPYmplY3QpOiB2b2lkO1xyXG4gIHNldEFzeW5jVmFsaWRhdG9ycyhuZXdWYWxpZGF0b3I6IChjb250cm9sOiBhbnkpID0+IGFueSB8XHJcbiAgICAoKGNvbnRyb2w6IGFueSkgPT4gYW55KVtdIHwgbnVsbCk6IHZvaWQ7XHJcbiAgc2V0RXJyb3JzKGVycm9yczoge1trZXk6IHN0cmluZ106IGFueX0gfCBudWxsLCBvcHRzPzogYW55KTogdm9pZDtcclxuICBzZXRQYXJlbnQocGFyZW50OiBhbnkpOiB2b2lkO1xyXG4gIHNldFZhbGlkYXRvcnMobmV3VmFsaWRhdG9yOiAoY29udHJvbDogYW55KSA9PiBhbnkgfFxyXG4gICAgKChjb250cm9sOiBhbnkpID0+IGFueSlbXSB8IG51bGwpOiB2b2lkO1xyXG4gIHNldFZhbHVlKHZhbHVlOiBhbnksIG9wdGlvbnM/OiBPYmplY3QpOiB2b2lkO1xyXG4gIHVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkob3B0cz86IGFueSk6IHZvaWQ7XHJcbiAgcGF0Y2hWYWx1ZSh2YWx1ZTogYW55LCBvcHRpb25zPzogYW55KTogdm9pZDtcclxuICByZXNldChmb3JtU3RhdGU/OiBhbnksIG9wdGlvbnM/OiBhbnkpOiB2b2lkO1xyXG4gIHNldFZhbHVlKHZhbHVlOiBhbnksIG9wdGlvbnM/OiBhbnkpOiB2b2lkO1xyXG59XHJcbiJdfQ==