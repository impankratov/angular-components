## API Report File for "koobiq"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { AbstractControlDirective } from '@angular/forms';
import { AfterContentInit } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import * as i0 from '@angular/core';
import { InjectionToken } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqInputPassword } from '@koobiq/components/input';
import { KbqNumberInput } from '@koobiq/components/input';

// @public
export const getKbqFormFieldMissingControlError: () => Error;

// @public
export const KBQ_FORM_FIELD_DEFAULT_OPTIONS: InjectionToken<Partial<{
    noBorders: boolean;
}>>;

// @public
export class KbqCleaner {
    protected clean(event: MouseEvent): void;
    get visible(): boolean;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqCleaner, "kbq-cleaner", ["kbqCleaner"], {}, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqCleaner, never>;
}

// @public
export class KbqError extends KbqHint {
    set color(_color: null);
    get color(): KbqComponentColors.Error;
    set fillTextOff(_fillTextOff: null);
    get fillTextOff(): boolean;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqError, "kbq-error", ["kbqError"], { "color": { "alias": "color"; "required": false; }; "fillTextOff": { "alias": "fillTextOff"; "required": false; }; }, {}, never, ["[kbq-icon]", "*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqError, never>;
}

// @public
export class KbqFormField implements AfterContentInit, AfterViewInit {
    // (undocumented)
    canCleanerClearByEsc: boolean;
    get control(): KbqFormFieldControl<unknown>;
    get disabled(): boolean;
    focus(options?: FocusOptions): void;
    get focused(): boolean;
    getConnectedOverlayOrigin(): ElementRef;
    get hasCleaner(): boolean;
    get hasError(): boolean;
    get hasHint(): boolean;
    get hasLabel(): boolean;
    get hasPasswordHint(): boolean;
    get hasPasswordToggle(): boolean;
    get hasPrefix(): boolean;
    get hasStepper(): boolean;
    get hasSuffix(): boolean;
    get hovered(): boolean;
    get invalid(): boolean;
    protected mouseenter(_event: MouseEvent): void;
    protected mouseleave(_event: MouseEvent): void;
    // (undocumented)
    static ngAcceptInputType_noBorders: unknown;
    // (undocumented)
    ngAfterContentInit(): void;
    // (undocumented)
    ngAfterViewInit(): void;
    noBorders: boolean | undefined;
    protected onContainerClick(event: MouseEvent): void;
    protected onKeyDown(event: KeyboardEvent): void;
    protected shouldBeForwarded(property: keyof AbstractControlDirective): boolean;
    get shouldDisableBorders(): boolean;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqFormField, "kbq-form-field", ["kbqFormField"], { "noBorders": { "alias": "noBorders"; "required": false; }; }, {}, ["_control", "stepper", "cleaner", "label", "passwordToggle", "hint", "passwordHint", "suffix", "prefix", "error"], ["kbq-label", "[kbqPrefix]", "*", "kbq-cleaner", "kbq-password-toggle", "kbq-stepper", "[kbqSuffix]", "kbq-error", "kbq-hint, kbq-password-hint"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqFormField, never>;
}

// @public
export type KbqFormFieldDefaultOptions = Partial<{
    noBorders: boolean;
}>;

// @public (undocumented)
export class KbqFormFieldModule {
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqFormFieldModule, never>;
    // (undocumented)
    static ɵinj: i0.ɵɵInjectorDeclaration<KbqFormFieldModule>;
    // Warning: (ae-forgotten-export) The symbol "i1" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i2" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i3" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i4" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i5" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i6" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i7" needs to be exported by the entry point index.d.ts
    // Warning: (ae-forgotten-export) The symbol "i8" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    static ɵmod: i0.ɵɵNgModuleDeclaration<KbqFormFieldModule, never, [typeof i1.KbqFormField, typeof i2.KbqHint, typeof i2.KbqError, typeof i3.KbqPrefix, typeof i4.KbqSuffix, typeof i5.KbqCleaner, typeof i6.KbqStepper, typeof i7.KbqPasswordToggle, typeof i8.KbqLabel, typeof i2.KbqPasswordHint], [typeof i1.KbqFormField, typeof i2.KbqHint, typeof i2.KbqError, typeof i3.KbqPrefix, typeof i4.KbqSuffix, typeof i5.KbqCleaner, typeof i6.KbqStepper, typeof i7.KbqPasswordToggle, typeof i8.KbqLabel, typeof i2.KbqPasswordHint]>;
}

// @public
export class KbqHint {
    set color(color: KbqComponentColors);
    // (undocumented)
    get color(): KbqComponentColors | undefined;
    protected colors: typeof KbqComponentColors;
    compact: boolean;
    set fillTextOff(fillTextOff: boolean);
    // (undocumented)
    get fillTextOff(): boolean;
    id: string;
    // (undocumented)
    static ngAcceptInputType_compact: unknown;
    // (undocumented)
    static ngAcceptInputType_fillTextOff: unknown;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqHint, "kbq-hint", ["kbqHint"], { "id": { "alias": "id"; "required": false; }; "color": { "alias": "color"; "required": false; }; "fillTextOff": { "alias": "fillTextOff"; "required": false; }; "compact": { "alias": "compact"; "required": false; }; }, {}, never, ["[kbq-icon]", "*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqHint, never>;
}

// @public
export class KbqLabel {
    id: string;
    // (undocumented)
    static ɵdir: i0.ɵɵDirectiveDeclaration<KbqLabel, "kbq-label", never, { "id": { "alias": "id"; "required": false; }; }, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqLabel, never>;
}

// @public
export class KbqPasswordHint extends KbqHint {
    set color(_color: null);
    get color(): KbqComponentColors;
    set fillTextOff(_fillTextOff: null);
    get fillTextOff(): boolean;
    hasError: boolean;
    protected get icon(): string;
    // (undocumented)
    static ngAcceptInputType_hasError: unknown;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqPasswordHint, "kbq-password-hint", never, { "hasError": { "alias": "hasError"; "required": false; }; "fillTextOff": { "alias": "fillTextOff"; "required": false; }; "color": { "alias": "color"; "required": false; }; }, {}, never, ["*"], true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqPasswordHint, never>;
}

// @public
export class KbqPasswordToggle {
    protected get control(): KbqInputPassword;
    protected get icon(): string;
    protected toggleType(event: KeyboardEvent | MouseEvent): void;
    get visible(): boolean;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqPasswordToggle, "kbq-password-toggle", ["kbqPasswordToggle"], {}, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqPasswordToggle, never>;
}

// @public
export class KbqPrefix {
    // (undocumented)
    static ɵdir: i0.ɵɵDirectiveDeclaration<KbqPrefix, "[kbqPrefix]", never, {}, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqPrefix, never>;
}

// @public
export class KbqStepper {
    protected get control(): KbqNumberInput;
    // (undocumented)
    protected stepDown(event: MouseEvent): void;
    // (undocumented)
    protected stepUp(event: MouseEvent): void;
    get visible(): boolean;
    // (undocumented)
    static ɵcmp: i0.ɵɵComponentDeclaration<KbqStepper, "kbq-stepper", ["kbqStepper"], {}, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqStepper, never>;
}

// @public
export class KbqSuffix {
    // (undocumented)
    static ɵdir: i0.ɵɵDirectiveDeclaration<KbqSuffix, "[kbqSuffix]", never, {}, {}, never, never, true, never>;
    // (undocumented)
    static ɵfac: i0.ɵɵFactoryDeclaration<KbqSuffix, never>;
}

// (No @packageDocumentation comment for this package)

```