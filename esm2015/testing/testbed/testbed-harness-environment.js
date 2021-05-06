/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { handleAutoChangeDetectionStatus, HarnessEnvironment, stopHandlingAutoChangeDetectionStatus } from '@angular/cdk/testing';
import { flush } from '@angular/core/testing';
import { takeWhile } from 'rxjs/operators';
import { TaskStateZoneInterceptor } from './task-state-zone-interceptor';
import { UnitTestElement } from './unit-test-element';
/** The default environment options. */
const defaultEnvironmentOptions = {
    queryFn: (selector, root) => root.querySelectorAll(selector)
};
/** Whether auto change detection is currently disabled. */
let disableAutoChangeDetection = false;
/**
 * The set of non-destroyed fixtures currently being used by `TestbedHarnessEnvironment` instances.
 */
const activeFixtures = new Set();
/**
 * Installs a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to handle change detection batching for.
 */
function installAutoChangeDetectionStatusHandler(fixture) {
    if (!activeFixtures.size) {
        handleAutoChangeDetectionStatus(({ isDisabled, onDetectChangesNow }) => {
            disableAutoChangeDetection = isDisabled;
            if (onDetectChangesNow) {
                Promise.all(Array.from(activeFixtures).map(detectChanges)).then(onDetectChangesNow);
            }
        });
    }
    activeFixtures.add(fixture);
}
/**
 * Uninstalls a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to stop handling change detection batching for.
 */
function uninstallAutoChangeDetectionStatusHandler(fixture) {
    activeFixtures.delete(fixture);
    if (!activeFixtures.size) {
        stopHandlingAutoChangeDetectionStatus();
    }
}
/** Whether we are currently in the fake async zone. */
function isInFakeAsyncZone() {
    return Zone.current.get('FakeAsyncTestZoneSpec') != null;
}
/**
 * Triggers change detection for a specific fixture.
 * @param fixture The fixture to trigger change detection for.
 */
function detectChanges(fixture) {
    return __awaiter(this, void 0, void 0, function* () {
        fixture.detectChanges();
        if (isInFakeAsyncZone()) {
            flush();
        }
        else {
            yield fixture.whenStable();
        }
    });
}
/** A `HarnessEnvironment` implementation for Angular's Testbed. */
export class TestbedHarnessEnvironment extends HarnessEnvironment {
    constructor(rawRootElement, _fixture, options) {
        super(rawRootElement);
        this._fixture = _fixture;
        /** Whether the environment has been destroyed. */
        this._destroyed = false;
        this._options = Object.assign(Object.assign({}, defaultEnvironmentOptions), options);
        this._taskState = TaskStateZoneInterceptor.setup();
        installAutoChangeDetectionStatusHandler(_fixture);
        _fixture.componentRef.onDestroy(() => {
            uninstallAutoChangeDetectionStatusHandler(_fixture);
            this._destroyed = true;
        });
    }
    /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
    static loader(fixture, options) {
        return new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
    }
    /**
     * Creates a `HarnessLoader` at the document root. This can be used if harnesses are
     * located outside of a fixture (e.g. overlays appended to the document body).
     */
    static documentRootLoader(fixture, options) {
        return new TestbedHarnessEnvironment(document.body, fixture, options);
    }
    /** Gets the native DOM element corresponding to the given TestElement. */
    static getNativeElement(el) {
        if (el instanceof UnitTestElement) {
            return el.element;
        }
        throw Error('This TestElement was not created by the TestbedHarnessEnvironment');
    }
    /**
     * Creates an instance of the given harness type, using the fixture's root element as the
     * harness's host element. This method should be used when creating a harness for the root element
     * of a fixture, as components do not have the correct selector when they are created as the root
     * of the fixture.
     */
    static harnessForFixture(fixture, harnessType, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const environment = new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
            yield environment.forceStabilize();
            return environment.createComponentHarness(harnessType, fixture.nativeElement);
        });
    }
    forceStabilize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!disableAutoChangeDetection) {
                if (this._destroyed) {
                    throw Error('Harness is attempting to use a fixture that has already been destroyed.');
                }
                yield detectChanges(this._fixture);
            }
        });
    }
    waitForTasksOutsideAngular() {
        return __awaiter(this, void 0, void 0, function* () {
            // If we run in the fake async zone, we run "flush" to run any scheduled tasks. This
            // ensures that the harnesses behave inside of the FakeAsyncTestZone similar to the
            // "AsyncTestZone" and the root zone (i.e. neither fakeAsync or async). Note that we
            // cannot just rely on the task state observable to become stable because the state will
            // never change. This is because the task queue will be only drained if the fake async
            // zone is being flushed.
            if (isInFakeAsyncZone()) {
                flush();
            }
            // Wait until the task queue has been drained and the zone is stable. Note that
            // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
            // outside of the Angular zone. For test harnesses, we want to ensure that the
            // app is fully stabilized and therefore need to use our own zone interceptor.
            yield this._taskState.pipe(takeWhile(state => !state.stable)).toPromise();
        });
    }
    getDocumentRoot() {
        return document.body;
    }
    createTestElement(element) {
        return new UnitTestElement(element, () => this.forceStabilize());
    }
    createEnvironment(element) {
        return new TestbedHarnessEnvironment(element, this._fixture, this._options);
    }
    getAllRawElements(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.forceStabilize();
            return Array.from(this._options.queryFn(selector, this.rawRootElement));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGJlZC1oYXJuZXNzLWVudmlyb25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2Nkay90ZXN0aW5nL3Rlc3RiZWQvdGVzdGJlZC1oYXJuZXNzLWVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBR0wsK0JBQStCLEVBQy9CLGtCQUFrQixFQUVsQixxQ0FBcUMsRUFFdEMsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQW1CLEtBQUssRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRTlELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN6QyxPQUFPLEVBQVksd0JBQXdCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFRcEQsdUNBQXVDO0FBQ3ZDLE1BQU0seUJBQXlCLEdBQXFDO0lBQ2xFLE9BQU8sRUFBRSxDQUFDLFFBQWdCLEVBQUUsSUFBYSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO0NBQzlFLENBQUM7QUFFRiwyREFBMkQ7QUFDM0QsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUM7QUFFdkM7O0dBRUc7QUFDSCxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBNkIsQ0FBQztBQUU1RDs7O0dBR0c7QUFDSCxTQUFTLHVDQUF1QyxDQUFDLE9BQWtDO0lBQ2pGLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO1FBQ3hCLCtCQUErQixDQUFDLENBQUMsRUFBQyxVQUFVLEVBQUUsa0JBQWtCLEVBQUMsRUFBRSxFQUFFO1lBQ25FLDBCQUEwQixHQUFHLFVBQVUsQ0FBQztZQUN4QyxJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJ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QUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGxpY2Vuc2VcclxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICpcclxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcclxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxyXG4gKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgQ29tcG9uZW50SGFybmVzcyxcclxuICBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3IsXHJcbiAgaGFuZGxlQXV0b0NoYW5nZURldGVjdGlvblN0YXR1cyxcclxuICBIYXJuZXNzRW52aXJvbm1lbnQsXHJcbiAgSGFybmVzc0xvYWRlcixcclxuICBzdG9wSGFuZGxpbmdBdXRvQ2hhbmdlRGV0ZWN0aW9uU3RhdHVzLFxyXG4gIFRlc3RFbGVtZW50XHJcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Rlc3RpbmcnO1xyXG5pbXBvcnQge0NvbXBvbmVudEZpeHR1cmUsIGZsdXNofSBmcm9tICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnO1xyXG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge3Rha2VXaGlsZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQge1Rhc2tTdGF0ZSwgVGFza1N0YXRlWm9uZUludGVyY2VwdG9yfSBmcm9tICcuL3Rhc2stc3RhdGUtem9uZS1pbnRlcmNlcHRvcic7XHJcbmltcG9ydCB7VW5pdFRlc3RFbGVtZW50fSBmcm9tICcuL3VuaXQtdGVzdC1lbGVtZW50JztcclxuXHJcbi8qKiBPcHRpb25zIHRvIGNvbmZpZ3VyZSB0aGUgZW52aXJvbm1lbnQuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnMge1xyXG4gIC8qKiBUaGUgcXVlcnkgZnVuY3Rpb24gdXNlZCB0byBmaW5kIERPTSBlbGVtZW50cy4gKi9cclxuICBxdWVyeUZuOiAoc2VsZWN0b3I6IHN0cmluZywgcm9vdDogRWxlbWVudCkgPT4gSXRlcmFibGU8RWxlbWVudD4gfCBBcnJheUxpa2U8RWxlbWVudD47XHJcbn1cclxuXHJcbi8qKiBUaGUgZGVmYXVsdCBlbnZpcm9ubWVudCBvcHRpb25zLiAqL1xyXG5jb25zdCBkZWZhdWx0RW52aXJvbm1lbnRPcHRpb25zOiBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyA9IHtcclxuICBxdWVyeUZuOiAoc2VsZWN0b3I6IHN0cmluZywgcm9vdDogRWxlbWVudCkgPT4gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVxyXG59O1xyXG5cclxuLyoqIFdoZXRoZXIgYXV0byBjaGFuZ2UgZGV0ZWN0aW9uIGlzIGN1cnJlbnRseSBkaXNhYmxlZC4gKi9cclxubGV0IGRpc2FibGVBdXRvQ2hhbmdlRGV0ZWN0aW9uID0gZmFsc2U7XHJcblxyXG4vKipcclxuICogVGhlIHNldCBvZiBub24tZGVzdHJveWVkIGZpeHR1cmVzIGN1cnJlbnRseSBiZWluZyB1c2VkIGJ5IGBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50YCBpbnN0YW5jZXMuXHJcbiAqL1xyXG5jb25zdCBhY3RpdmVGaXh0dXJlcyA9IG5ldyBTZXQ8Q29tcG9uZW50Rml4dHVyZTx1bmtub3duPj4oKTtcclxuXHJcbi8qKlxyXG4gKiBJbnN0YWxscyBhIGhhbmRsZXIgZm9yIGNoYW5nZSBkZXRlY3Rpb24gYmF0Y2hpbmcgc3RhdHVzIGNoYW5nZXMgZm9yIGEgc3BlY2lmaWMgZml4dHVyZS5cclxuICogQHBhcmFtIGZpeHR1cmUgVGhlIGZpeHR1cmUgdG8gaGFuZGxlIGNoYW5nZSBkZXRlY3Rpb24gYmF0Y2hpbmcgZm9yLlxyXG4gKi9cclxuZnVuY3Rpb24gaW5zdGFsbEF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXNIYW5kbGVyKGZpeHR1cmU6IENvbXBvbmVudEZpeHR1cmU8dW5rbm93bj4pIHtcclxuICBpZiAoIWFjdGl2ZUZpeHR1cmVzLnNpemUpIHtcclxuICAgIGhhbmRsZUF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXMoKHtpc0Rpc2FibGVkLCBvbkRldGVjdENoYW5nZXNOb3d9KSA9PiB7XHJcbiAgICAgIGRpc2FibGVBdXRvQ2hhbmdlRGV0ZWN0aW9uID0gaXNEaXNhYmxlZDtcclxuICAgICAgaWYgKG9uRGV0ZWN0Q2hhbmdlc05vdykge1xyXG4gICAgICAgIFByb21pc2UuYWxsKEFycmF5LmZyb20oYWN0aXZlRml4dHVyZXMpLm1hcChkZXRlY3RDaGFuZ2VzKSkudGhlbihvbkRldGVjdENoYW5nZXNOb3cpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgYWN0aXZlRml4dHVyZXMuYWRkKGZpeHR1cmUpO1xyXG59XHJcblxyXG4vKipcclxuICogVW5pbnN0YWxscyBhIGhhbmRsZXIgZm9yIGNoYW5nZSBkZXRlY3Rpb24gYmF0Y2hpbmcgc3RhdHVzIGNoYW5nZXMgZm9yIGEgc3BlY2lmaWMgZml4dHVyZS5cclxuICogQHBhcmFtIGZpeHR1cmUgVGhlIGZpeHR1cmUgdG8gc3RvcCBoYW5kbGluZyBjaGFuZ2UgZGV0ZWN0aW9uIGJhdGNoaW5nIGZvci5cclxuICovXHJcbmZ1bmN0aW9uIHVuaW5zdGFsbEF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXNIYW5kbGVyKGZpeHR1cmU6IENvbXBvbmVudEZpeHR1cmU8dW5rbm93bj4pIHtcclxuICBhY3RpdmVGaXh0dXJlcy5kZWxldGUoZml4dHVyZSk7XHJcbiAgaWYgKCFhY3RpdmVGaXh0dXJlcy5zaXplKSB7XHJcbiAgICBzdG9wSGFuZGxpbmdBdXRvQ2hhbmdlRGV0ZWN0aW9uU3RhdHVzKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKiogV2hldGhlciB3ZSBhcmUgY3VycmVudGx5IGluIHRoZSBmYWtlIGFzeW5jIHpvbmUuICovXHJcbmZ1bmN0aW9uIGlzSW5GYWtlQXN5bmNab25lKCkge1xyXG4gIHJldHVybiBab25lIS5jdXJyZW50LmdldCgnRmFrZUFzeW5jVGVzdFpvbmVTcGVjJykgIT0gbnVsbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRyaWdnZXJzIGNoYW5nZSBkZXRlY3Rpb24gZm9yIGEgc3BlY2lmaWMgZml4dHVyZS5cclxuICogQHBhcmFtIGZpeHR1cmUgVGhlIGZpeHR1cmUgdG8gdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIGZvci5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGRldGVjdENoYW5nZXMoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPikge1xyXG4gIGZpeHR1cmUuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gIGlmIChpc0luRmFrZUFzeW5jWm9uZSgpKSB7XHJcbiAgICBmbHVzaCgpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBhd2FpdCBmaXh0dXJlLndoZW5TdGFibGUoKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKiBBIGBIYXJuZXNzRW52aXJvbm1lbnRgIGltcGxlbWVudGF0aW9uIGZvciBBbmd1bGFyJ3MgVGVzdGJlZC4gKi9cclxuZXhwb3J0IGNsYXNzIFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnQgZXh0ZW5kcyBIYXJuZXNzRW52aXJvbm1lbnQ8RWxlbWVudD4ge1xyXG4gIC8qKiBXaGV0aGVyIHRoZSBlbnZpcm9ubWVudCBoYXMgYmVlbiBkZXN0cm95ZWQuICovXHJcbiAgcHJpdmF0ZSBfZGVzdHJveWVkID0gZmFsc2U7XHJcblxyXG4gIC8qKiBPYnNlcnZhYmxlIHRoYXQgZW1pdHMgd2hlbmV2ZXIgdGhlIHRlc3QgdGFzayBzdGF0ZSBjaGFuZ2VzLiAqL1xyXG4gIHByaXZhdGUgX3Rhc2tTdGF0ZTogT2JzZXJ2YWJsZTxUYXNrU3RhdGU+O1xyXG5cclxuICAvKiogVGhlIG9wdGlvbnMgZm9yIHRoaXMgZW52aXJvbm1lbnQuICovXHJcbiAgcHJpdmF0ZSBfb3B0aW9uczogVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudE9wdGlvbnM7XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihyYXdSb290RWxlbWVudDogRWxlbWVudCwgcHJpdmF0ZSBfZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPixcclxuICAgICAgb3B0aW9ucz86IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zKSB7XHJcbiAgICBzdXBlcihyYXdSb290RWxlbWVudCk7XHJcbiAgICB0aGlzLl9vcHRpb25zID0gey4uLmRlZmF1bHRFbnZpcm9ubWVudE9wdGlvbnMsIC4uLm9wdGlvbnN9O1xyXG4gICAgdGhpcy5fdGFza1N0YXRlID0gVGFza1N0YXRlWm9uZUludGVyY2VwdG9yLnNldHVwKCk7XHJcbiAgICBpbnN0YWxsQXV0b0NoYW5nZURldGVjdGlvblN0YXR1c0hhbmRsZXIoX2ZpeHR1cmUpO1xyXG4gICAgX2ZpeHR1cmUuY29tcG9uZW50UmVmLm9uRGVzdHJveSgoKSA9PiB7XHJcbiAgICAgIHVuaW5zdGFsbEF1dG9DaGFuZ2VEZXRlY3Rpb25TdGF0dXNIYW5kbGVyKF9maXh0dXJlKTtcclxuICAgICAgdGhpcy5fZGVzdHJveWVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyoqIENyZWF0ZXMgYSBgSGFybmVzc0xvYWRlcmAgcm9vdGVkIGF0IHRoZSBnaXZlbiBmaXh0dXJlJ3Mgcm9vdCBlbGVtZW50LiAqL1xyXG4gIHN0YXRpYyBsb2FkZXIoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPiwgb3B0aW9ucz86IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zKTpcclxuICAgICAgSGFybmVzc0xvYWRlciB7XHJcbiAgICByZXR1cm4gbmV3IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnQoZml4dHVyZS5uYXRpdmVFbGVtZW50LCBmaXh0dXJlLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBgSGFybmVzc0xvYWRlcmAgYXQgdGhlIGRvY3VtZW50IHJvb3QuIFRoaXMgY2FuIGJlIHVzZWQgaWYgaGFybmVzc2VzIGFyZVxyXG4gICAqIGxvY2F0ZWQgb3V0c2lkZSBvZiBhIGZpeHR1cmUgKGUuZy4gb3ZlcmxheXMgYXBwZW5kZWQgdG8gdGhlIGRvY3VtZW50IGJvZHkpLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBkb2N1bWVudFJvb3RMb2FkZXIoZml4dHVyZTogQ29tcG9uZW50Rml4dHVyZTx1bmtub3duPixcclxuICAgICAgb3B0aW9ucz86IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnRPcHRpb25zKTogSGFybmVzc0xvYWRlciB7XHJcbiAgICByZXR1cm4gbmV3IFRlc3RiZWRIYXJuZXNzRW52aXJvbm1lbnQoZG9jdW1lbnQuYm9keSwgZml4dHVyZSwgb3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICAvKiogR2V0cyB0aGUgbmF0aXZlIERPTSBlbGVtZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuIFRlc3RFbGVtZW50LiAqL1xyXG4gIHN0YXRpYyBnZXROYXRpdmVFbGVtZW50KGVsOiBUZXN0RWxlbWVudCk6IEVsZW1lbnQge1xyXG4gICAgaWYgKGVsIGluc3RhbmNlb2YgVW5pdFRlc3RFbGVtZW50KSB7XHJcbiAgICAgIHJldHVybiBlbC5lbGVtZW50O1xyXG4gICAgfVxyXG4gICAgdGhyb3cgRXJyb3IoJ1RoaXMgVGVzdEVsZW1lbnQgd2FzIG5vdCBjcmVhdGVkIGJ5IHRoZSBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50Jyk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIHRoZSBnaXZlbiBoYXJuZXNzIHR5cGUsIHVzaW5nIHRoZSBmaXh0dXJlJ3Mgcm9vdCBlbGVtZW50IGFzIHRoZVxyXG4gICAqIGhhcm5lc3MncyBob3N0IGVsZW1lbnQuIFRoaXMgbWV0aG9kIHNob3VsZCBiZSB1c2VkIHdoZW4gY3JlYXRpbmcgYSBoYXJuZXNzIGZvciB0aGUgcm9vdCBlbGVtZW50XHJcbiAgICogb2YgYSBmaXh0dXJlLCBhcyBjb21wb25lbnRzIGRvIG5vdCBoYXZlIHRoZSBjb3JyZWN0IHNlbGVjdG9yIHdoZW4gdGhleSBhcmUgY3JlYXRlZCBhcyB0aGUgcm9vdFxyXG4gICAqIG9mIHRoZSBmaXh0dXJlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBhc3luYyBoYXJuZXNzRm9yRml4dHVyZTxUIGV4dGVuZHMgQ29tcG9uZW50SGFybmVzcz4oXHJcbiAgICAgIGZpeHR1cmU6IENvbXBvbmVudEZpeHR1cmU8dW5rbm93bj4sIGhhcm5lc3NUeXBlOiBDb21wb25lbnRIYXJuZXNzQ29uc3RydWN0b3I8VD4sXHJcbiAgICAgIG9wdGlvbnM/OiBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50T3B0aW9ucyk6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgZW52aXJvbm1lbnQgPSBuZXcgVGVzdGJlZEhhcm5lc3NFbnZpcm9ubWVudChmaXh0dXJlLm5hdGl2ZUVsZW1lbnQsIGZpeHR1cmUsIG9wdGlvbnMpO1xyXG4gICAgYXdhaXQgZW52aXJvbm1lbnQuZm9yY2VTdGFiaWxpemUoKTtcclxuICAgIHJldHVybiBlbnZpcm9ubWVudC5jcmVhdGVDb21wb25lbnRIYXJuZXNzKGhhcm5lc3NUeXBlLCBmaXh0dXJlLm5hdGl2ZUVsZW1lbnQpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZm9yY2VTdGFiaWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIWRpc2FibGVBdXRvQ2hhbmdlRGV0ZWN0aW9uKSB7XHJcbiAgICAgIGlmICh0aGlzLl9kZXN0cm95ZWQpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcignSGFybmVzcyBpcyBhdHRlbXB0aW5nIHRvIHVzZSBhIGZpeHR1cmUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGRlc3Ryb3llZC4nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgZGV0ZWN0Q2hhbmdlcyh0aGlzLl9maXh0dXJlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIHdhaXRGb3JUYXNrc091dHNpZGVBbmd1bGFyKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgLy8gSWYgd2UgcnVuIGluIHRoZSBmYWtlIGFzeW5jIHpvbmUsIHdlIHJ1biBcImZsdXNoXCIgdG8gcnVuIGFueSBzY2hlZHVsZWQgdGFza3MuIFRoaXNcclxuICAgIC8vIGVuc3VyZXMgdGhhdCB0aGUgaGFybmVzc2VzIGJlaGF2ZSBpbnNpZGUgb2YgdGhlIEZha2VBc3luY1Rlc3Rab25lIHNpbWlsYXIgdG8gdGhlXHJcbiAgICAvLyBcIkFzeW5jVGVzdFpvbmVcIiBhbmQgdGhlIHJvb3Qgem9uZSAoaS5lLiBuZWl0aGVyIGZha2VBc3luYyBvciBhc3luYykuIE5vdGUgdGhhdCB3ZVxyXG4gICAgLy8gY2Fubm90IGp1c3QgcmVseSBvbiB0aGUgdGFzayBzdGF0ZSBvYnNlcnZhYmxlIHRvIGJlY29tZSBzdGFibGUgYmVjYXVzZSB0aGUgc3RhdGUgd2lsbFxyXG4gICAgLy8gbmV2ZXIgY2hhbmdlLiBUaGlzIGlzIGJlY2F1c2UgdGhlIHRhc2sgcXVldWUgd2lsbCBiZSBvbmx5IGRyYWluZWQgaWYgdGhlIGZha2UgYXN5bmNcclxuICAgIC8vIHpvbmUgaXMgYmVpbmcgZmx1c2hlZC5cclxuICAgIGlmIChpc0luRmFrZUFzeW5jWm9uZSgpKSB7XHJcbiAgICAgIGZsdXNoKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2FpdCB1bnRpbCB0aGUgdGFzayBxdWV1ZSBoYXMgYmVlbiBkcmFpbmVkIGFuZCB0aGUgem9uZSBpcyBzdGFibGUuIE5vdGUgdGhhdFxyXG4gICAgLy8gd2UgY2Fubm90IHJlbHkgb24gXCJmaXh0dXJlLndoZW5TdGFibGVcIiBzaW5jZSBpdCBkb2VzIG5vdCBjYXRjaCB0YXNrcyBzY2hlZHVsZWRcclxuICAgIC8vIG91dHNpZGUgb2YgdGhlIEFuZ3VsYXIgem9uZS4gRm9yIHRlc3QgaGFybmVzc2VzLCB3ZSB3YW50IHRvIGVuc3VyZSB0aGF0IHRoZVxyXG4gICAgLy8gYXBwIGlzIGZ1bGx5IHN0YWJpbGl6ZWQgYW5kIHRoZXJlZm9yZSBuZWVkIHRvIHVzZSBvdXIgb3duIHpvbmUgaW50ZXJjZXB0b3IuXHJcbiAgICBhd2FpdCB0aGlzLl90YXNrU3RhdGUucGlwZSh0YWtlV2hpbGUoc3RhdGUgPT4gIXN0YXRlLnN0YWJsZSkpLnRvUHJvbWlzZSgpO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGdldERvY3VtZW50Um9vdCgpOiBFbGVtZW50IHtcclxuICAgIHJldHVybiBkb2N1bWVudC5ib2R5O1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZVRlc3RFbGVtZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBUZXN0RWxlbWVudCB7XHJcbiAgICByZXR1cm4gbmV3IFVuaXRUZXN0RWxlbWVudChlbGVtZW50LCAoKSA9PiB0aGlzLmZvcmNlU3RhYmlsaXplKCkpO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZUVudmlyb25tZW50KGVsZW1lbnQ6IEVsZW1lbnQpOiBIYXJuZXNzRW52aXJvbm1lbnQ8RWxlbWVudD4ge1xyXG4gICAgcmV0dXJuIG5ldyBUZXN0YmVkSGFybmVzc0Vudmlyb25tZW50KGVsZW1lbnQsIHRoaXMuX2ZpeHR1cmUsIHRoaXMuX29wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGFzeW5jIGdldEFsbFJhd0VsZW1lbnRzKHNlbGVjdG9yOiBzdHJpbmcpOiBQcm9taXNlPEVsZW1lbnRbXT4ge1xyXG4gICAgYXdhaXQgdGhpcy5mb3JjZVN0YWJpbGl6ZSgpO1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fb3B0aW9ucy5xdWVyeUZuKHNlbGVjdG9yLCB0aGlzLnJhd1Jvb3RFbGVtZW50KSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==