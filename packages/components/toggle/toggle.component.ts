import { animate, state, style, transition, trigger } from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewChild,
    ViewEncapsulation,
    forwardRef,
    numberAttribute
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { KbqColorDirective } from '@koobiq/components/core';

let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

export class KbqToggleChange {
    source: KbqToggleComponent;
    checked: boolean;
}

@Component({
    selector: 'kbq-toggle',
    exportAs: 'kbqToggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.scss', './toggle-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toggle',
        '[class.kbq-toggle_big]': 'big',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.kbq-disabled]': 'disabled',
        '[class.kbq-active]': 'checked'
    },
    animations: [
        trigger('switch', [
            state('true', style({ left: 'calc(100% - 11px)' })),
            state('false', style({ left: '3px' })),
            transition('true <=> false', animate('150ms'))])

    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KbqToggleComponent),
            multi: true
        }
    ]
})
export class KbqToggleComponent extends KbqColorDirective implements AfterViewInit, ControlValueAccessor, OnDestroy {
    @Input() big: boolean = false;

    @ViewChild('input', { static: false }) inputElement: ElementRef;

    @Input() labelPosition: ToggleLabelPositionType = 'right';

    @Input('aria-label') ariaLabel: string = '';
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    @Input() id: string;

    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    @Input() name: string | null = null;

    @Input() value: string;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value !== this._disabled) {
            this._disabled = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _disabled: boolean = false;

    @Input({ transform: numberAttribute })
    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    get checked() {
        return this._checked;
    }

    @Input()
    set checked(value: boolean) {
        if (value !== this._checked) {
            this._checked = value;
            this.changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    @Output() readonly change: EventEmitter<KbqToggleChange> = new EventEmitter<KbqToggleChange>();

    private uniqueId: string = `kbq-toggle-${++nextUniqueId}`;

    constructor(
        private focusMonitor: FocusMonitor,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        super();

        this.id = this.uniqueId;
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.focusMonitor.focusVia(this.inputElement.nativeElement, 'keyboard');
    }

    getAriaChecked(): boolean {
        return this.checked;
    }

    onChangeEvent(event: Event) {
        event.stopPropagation();

        this.updateModelValue();
        this.emitChangeEvent();
    }

    onLabelTextChange() {
        this.changeDetectorRef.markForCheck();
    }

    onInputClick(event: MouseEvent) {
        event.stopPropagation();
    }

    writeValue(value: any) {
        this.checked = !!value;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    private onTouchedCallback = () => {};

    private onChangeCallback = (_: any) => {};

    private updateModelValue() {
        this._checked = !this.checked;
        this.onTouchedCallback();
    }

    private emitChangeEvent() {
        const event = new KbqToggleChange();
        event.source = this;
        event.checked = this.checked;

        this.onChangeCallback(this.checked);
        this.change.emit(event);
    }
}
