"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const utils_1 = require("../../utils");
/** Scaffolds a new Angular component that uses the Drag and Drop module. */
function default_1(options) {
    return schematics_1.chain([
        utils_1.buildComponent(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template',
        }),
        options.skipImport ? schematics_1.noop() : addDragDropModulesToModule(options)
    ]);
}
exports.default = default_1;
/** Adds the required modules to the main module of the CLI project. */
function addDragDropModulesToModule(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const modulePath = yield utils_1.findModuleFromOptions(host, options);
        utils_1.addModuleImportToModule(host, modulePath, 'DragDropModule', '@angular/cdk/drag-drop');
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2RrL3NjaGVtYXRpY3MvbmctZ2VuZXJhdGUvZHJhZy1kcm9wL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7O0FBRUgsMkRBQW1FO0FBQ25FLHVDQUEyRjtBQUczRiw0RUFBNEU7QUFDNUUsbUJBQXdCLE9BQWU7SUFDckMsT0FBTyxrQkFBSyxDQUFDO1FBQ1gsc0JBQWMsbUJBQUssT0FBTyxHQUFHO1lBQzNCLFFBQVEsRUFBRSxrRkFBa0Y7WUFDNUYsVUFBVSxFQUNOLHVGQUF1RjtTQUM1RixDQUFDO1FBQ0YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsaUJBQUksRUFBRSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLENBQUM7S0FDbEUsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVRELDRCQVNDO0FBRUQsdUVBQXVFO0FBQ3ZFLFNBQVMsMEJBQTBCLENBQUMsT0FBZTtJQUNqRCxPQUFPLENBQU8sSUFBVSxFQUFFLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsTUFBTSw2QkFBcUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUQsK0JBQXVCLENBQUMsSUFBSSxFQUFFLFVBQVcsRUFBRSxnQkFBZ0IsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3pGLENBQUMsQ0FBQSxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBAbGljZW5zZVxyXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKlxyXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxyXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtjaGFpbiwgbm9vcCwgUnVsZSwgVHJlZX0gZnJvbSAnQGFuZ3VsYXItZGV2a2l0L3NjaGVtYXRpY3MnO1xyXG5pbXBvcnQge2FkZE1vZHVsZUltcG9ydFRvTW9kdWxlLCBidWlsZENvbXBvbmVudCwgZmluZE1vZHVsZUZyb21PcHRpb25zfSBmcm9tICcuLi8uLi91dGlscyc7XHJcbmltcG9ydCB7U2NoZW1hfSBmcm9tICcuL3NjaGVtYSc7XHJcblxyXG4vKiogU2NhZmZvbGRzIGEgbmV3IEFuZ3VsYXIgY29tcG9uZW50IHRoYXQgdXNlcyB0aGUgRHJhZyBhbmQgRHJvcCBtb2R1bGUuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG9wdGlvbnM6IFNjaGVtYSk6IFJ1bGUge1xyXG4gIHJldHVybiBjaGFpbihbXHJcbiAgICBidWlsZENvbXBvbmVudCh7Li4ub3B0aW9uc30sIHtcclxuICAgICAgdGVtcGxhdGU6ICcuL19fcGF0aF9fL19fbmFtZUBkYXNoZXJpemVAaWYtZmxhdF9fL19fbmFtZUBkYXNoZXJpemVfXy5jb21wb25lbnQuaHRtbC50ZW1wbGF0ZScsXHJcbiAgICAgIHN0eWxlc2hlZXQ6XHJcbiAgICAgICAgICAnLi9fX3BhdGhfXy9fX25hbWVAZGFzaGVyaXplQGlmLWZsYXRfXy9fX25hbWVAZGFzaGVyaXplX18uY29tcG9uZW50Ll9fc3R5bGVfXy50ZW1wbGF0ZScsXHJcbiAgICB9KSxcclxuICAgIG9wdGlvbnMuc2tpcEltcG9ydCA/IG5vb3AoKSA6IGFkZERyYWdEcm9wTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnMpXHJcbiAgXSk7XHJcbn1cclxuXHJcbi8qKiBBZGRzIHRoZSByZXF1aXJlZCBtb2R1bGVzIHRvIHRoZSBtYWluIG1vZHVsZSBvZiB0aGUgQ0xJIHByb2plY3QuICovXHJcbmZ1bmN0aW9uIGFkZERyYWdEcm9wTW9kdWxlc1RvTW9kdWxlKG9wdGlvbnM6IFNjaGVtYSkge1xyXG4gIHJldHVybiBhc3luYyAoaG9zdDogVHJlZSkgPT4ge1xyXG4gICAgY29uc3QgbW9kdWxlUGF0aCA9IGF3YWl0IGZpbmRNb2R1bGVGcm9tT3B0aW9ucyhob3N0LCBvcHRpb25zKTtcclxuICAgIGFkZE1vZHVsZUltcG9ydFRvTW9kdWxlKGhvc3QsIG1vZHVsZVBhdGghLCAnRHJhZ0Ryb3BNb2R1bGUnLCAnQGFuZ3VsYXIvY2RrL2RyYWctZHJvcCcpO1xyXG4gIH07XHJcbn1cclxuIl19