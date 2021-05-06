"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStylesheetFiles = void 0;
const core_1 = require("@angular-devkit/core");
/** Regular expression that matches stylesheet paths */
const STYLESHEET_REGEX = /.*\.(css|scss)/;
/** Finds stylesheets in the given directory from within the specified tree. */
function findStylesheetFiles(tree, baseDir) {
    const result = [];
    const visitDir = dirPath => {
        const { subfiles, subdirs } = tree.getDir(dirPath);
        result.push(...subfiles.filter(f => STYLESHEET_REGEX.test(f)));
        subdirs.forEach(fragment => {
            // Do not visit directories or files inside node modules or `dist/` folders.
            if (fragment !== 'node_modules' && fragment !== 'dist') {
                visitDir(core_1.join(dirPath, fragment));
            }
        });
    };
    visitDir(baseDir);
    return result;
}
exports.findStylesheetFiles = findStylesheetFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZC1zdHlsZXNoZWV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jZGsvc2NoZW1hdGljcy9uZy11cGRhdGUvZmluZC1zdHlsZXNoZWV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBMEM7QUFHMUMsdURBQXVEO0FBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFFMUMsK0VBQStFO0FBQy9FLFNBQWdCLG1CQUFtQixDQUFDLElBQVUsRUFBRSxPQUFlO0lBQzdELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRTtRQUN6QixNQUFNLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDekIsNEVBQTRFO1lBQzVFLElBQUksUUFBUSxLQUFLLGNBQWMsSUFBSSxRQUFRLEtBQUssTUFBTSxFQUFFO2dCQUN0RCxRQUFRLENBQUMsV0FBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ25DO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7SUFDRixRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbEIsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWRELGtEQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEBsaWNlbnNlXHJcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqXHJcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXHJcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcclxuICovXHJcblxyXG5pbXBvcnQge2pvaW59IGZyb20gJ0Bhbmd1bGFyLWRldmtpdC9jb3JlJztcclxuaW1wb3J0IHtUcmVlfSBmcm9tICdAYW5ndWxhci1kZXZraXQvc2NoZW1hdGljcyc7XHJcblxyXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBzdHlsZXNoZWV0IHBhdGhzICovXHJcbmNvbnN0IFNUWUxFU0hFRVRfUkVHRVggPSAvLipcXC4oY3NzfHNjc3MpLztcclxuXHJcbi8qKiBGaW5kcyBzdHlsZXNoZWV0cyBpbiB0aGUgZ2l2ZW4gZGlyZWN0b3J5IGZyb20gd2l0aGluIHRoZSBzcGVjaWZpZWQgdHJlZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTdHlsZXNoZWV0RmlsZXModHJlZTogVHJlZSwgYmFzZURpcjogc3RyaW5nKTogc3RyaW5nW10ge1xyXG4gIGNvbnN0IHJlc3VsdDogc3RyaW5nW10gPSBbXTtcclxuICBjb25zdCB2aXNpdERpciA9IGRpclBhdGggPT4ge1xyXG4gICAgY29uc3Qge3N1YmZpbGVzLCBzdWJkaXJzfSA9IHRyZWUuZ2V0RGlyKGRpclBhdGgpO1xyXG4gICAgcmVzdWx0LnB1c2goLi4uc3ViZmlsZXMuZmlsdGVyKGYgPT4gU1RZTEVTSEVFVF9SRUdFWC50ZXN0KGYpKSk7XHJcbiAgICBzdWJkaXJzLmZvckVhY2goZnJhZ21lbnQgPT4ge1xyXG4gICAgICAvLyBEbyBub3QgdmlzaXQgZGlyZWN0b3JpZXMgb3IgZmlsZXMgaW5zaWRlIG5vZGUgbW9kdWxlcyBvciBgZGlzdC9gIGZvbGRlcnMuXHJcbiAgICAgIGlmIChmcmFnbWVudCAhPT0gJ25vZGVfbW9kdWxlcycgJiYgZnJhZ21lbnQgIT09ICdkaXN0Jykge1xyXG4gICAgICAgIHZpc2l0RGlyKGpvaW4oZGlyUGF0aCwgZnJhZ21lbnQpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfTtcclxuICB2aXNpdERpcihiYXNlRGlyKTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbiJdfQ==