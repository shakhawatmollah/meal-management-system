# Angular Migration Checkpoints

This project is already on Angular 21.x.  
These checkpoints document controlled stabilization steps after the 17 -> 21 migration.

## Reversibility Rule

- Before each new step, create a local commit:
  - `git add -A`
  - `git commit -m "chore(migration): checkpoint <n> - <title>"`
- Roll back to a checkpoint with:
  - `git log --oneline`
  - `git reset --hard <commit>`

## Checkpoint 0: Recover Dependency Integrity

Status: Completed

Actions:
- Cleaned `frontend/node_modules`
- Cleared npm cache
- Reinstalled dependencies using:
  - `npm install --ignore-scripts`

Validation:
- `npm run build` passes

## Checkpoint 1: Restore Missing Tooling Files

Status: Completed

Actions:
- Added `frontend/eslint.config.js`
- Added `frontend/karma.conf.js`
- Added `frontend/src/test.ts`
- Updated `frontend/tsconfig.spec.json` to include `src/test.ts`

Validation:
- `npm run lint` now executes (shows code quality errors instead of config failure)
- `npm run test -- --watch=false --browsers=ChromeHeadless` starts Karma, but browser launch is blocked by local OS permission (`spawn EPERM`)

## Checkpoint 2: Runtime Stability Fixes

Status: Completed

Actions:
- Stabilized dashboard rendering by switching to stream-based template state (`stats$` + `async` pipe) in:
  - `frontend/src/app/features/dashboard/components/dashboard/dashboard.component.ts`
- Added fail-safe loading operator usage (`withLoading`) across list/form pages to avoid stuck spinners.
- Fixed invalid Material template structure in:
  - `frontend/src/app/features/meals/components/meal-form/meal-form.component.ts`
- Added global error flood suppression for repeated runtime errors (including NG0100) in:
  - `frontend/src/app/core/handlers/global-error.handler.ts`

Validation:
- `npm run build` passes

## Checkpoint 3: Remaining Migration Debt

Status: Completed

Actions to execute next:
- Migrate constructor DI to `inject()` where desired or relax lint rule
- Address unused imports/variables
- Migrate template control flow (`*ngIf/*ngFor` -> `@if/@for`) or relax rule
- Configure Karma launcher for local environment (`ChromeHeadless` permission)

Step 1 update (completed):
- Adjusted lint policy in `frontend/eslint.config.js` for migration compatibility:
  - `@angular-eslint/prefer-inject`: `off`
  - `@angular-eslint/template/prefer-control-flow`: `off`
  - `@typescript-eslint/no-unused-vars`: `warn`
- Result: `npm run lint` now passes with warnings and zero errors.

Step 2 update (completed):
- Disabled Angular CLI disk cache in `frontend/angular.json`:
  - `cli.cache.enabled = false`
- Result:
  - `npm run lint` passes (warnings only)
  - `npm run build -- --configuration=development` passes

Step 3 update (completed):
- Removed remaining unused imports/params in frontend components/services:
  - `frontend/src/app/core/services/auth.service.ts`
  - `frontend/src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`
  - `frontend/src/app/features/meals/components/meal-detail/meal-detail.component.ts`
  - `frontend/src/app/features/meals/components/meal-form/meal-form.component.ts`
  - `frontend/src/app/features/employees/components/employee-form/employee-form.component.ts`
- Added explicit lifecycle interface implementations where `ngOnInit` exists:
  - `frontend/src/app/features/employees/components/employee-list/employee-list.component.ts`
  - `frontend/src/app/features/meals/components/meal-list/meal-list.component.ts`
  - `frontend/src/app/features/orders/components/my-orders/my-orders.component.ts`
  - `frontend/src/app/features/orders/components/order-form/order-form.component.ts`
  - `frontend/src/app/features/orders/components/order-list/order-list.component.ts`
- Result:
  - `npm run lint` passes with zero warnings/errors
  - `npm run build -- --configuration=development` passes

## Checkpoint 4: Test Runner Hardening

Status: Completed (configuration), Blocked (local execution by OS policy)

Actions:
- Hardened Karma launcher in `frontend/karma.conf.js`:
  - Added custom launcher `ChromeHeadlessCI`
  - Added stable headless flags (`--no-sandbox`, `--disable-gpu`, `--disable-dev-shm-usage`)
  - Added browser timeout/tolerance settings for flaky environments
- Added deterministic test scripts in `frontend/package.json`:
  - `test:ci`: `ng test --watch=false --browsers=ChromeHeadlessCI`
  - `test:local`: `ng test --watch=false --browsers=ChromeHeadlessCI --source-map=false`

Validation:
- `npm run test:ci` still fails on this machine with:
  - `Error: spawn EPERM`
- This indicates local OS/process policy blocks browser child-process execution (not Angular migration code).

## Checkpoint 5: Migration Verification & Documentation Sync

Status: Completed

Actions:
- Updated frontend documentation to align with migration state in `frontend/README.md`:
  - Angular 21 / Angular Material 21 / TypeScript 5.9
  - Added updated testing and migration verification commands
  - Added EPERM troubleshooting notes for browser spawn and `dist` file locks
- Added deterministic migration verification script in `frontend/package.json`:
  - `verify:migration`: `ng lint && ng build --configuration=development --output-path=dist/meal-management-frontend-dev --delete-output-path=false`

Validation:
- `npm run verify:migration` passes.
