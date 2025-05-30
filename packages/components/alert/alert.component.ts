import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KbqButton } from '@koobiq/components/button';
import { KbqIcon, KbqIconItem } from '@koobiq/components/icon';

export enum KbqAlertStyles {
    Default = 'default',
    Colored = 'colored'
}

export enum KbqAlertColors {
    Error = 'error',
    Warning = 'warning',
    Success = 'success',
    /** Used the same value as `Theme` to not introduce breaking changes */
    Info = 'theme',
    /** @deprecated This color key doesn't correlate with design, use `Info` instead.
     * Will be removed in next major release (#DS-3602) */
    Theme = 'theme',
    /** @deprecated This color key doesn't correlate with design.
     * Will be removed and replaced with `Info` in next major release (#DS-3602) */
    Contrast = 'contrast'
}

@Directive({
    selector: '[kbq-alert-title]',
    host: {
        class: 'kbq-alert__title'
    }
})
export class KbqAlertTitle {}

@Directive({
    selector: '[kbq-alert-close-button]',
    host: {
        class: 'kbq-alert-close-button'
    }
})
export class KbqAlertCloseButton {}

@Directive({
    selector: '[kbq-alert-control]',
    host: {
        class: 'kbq-alert-control'
    }
})
export class KbqAlertControl {}

@Component({
    selector: 'kbq-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['alert.component.scss', 'alert-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-alert',
        '[class]': 'alertColor',
        '[class.kbq-alert_normal]': '!compact',
        '[class.kbq-alert_compact]': 'compact',
        '[class.kbq-alert_default]': '!isColored',
        '[class.kbq-alert_colored]': 'isColored',
        '[class.kbq-alert_dismissible]': 'closeButton'
    }
})
export class KbqAlert implements AfterContentInit {
    @ContentChild(KbqIconItem) iconItem: KbqIconItem;
    @ContentChild(KbqIcon) icon: KbqIcon;
    @ContentChild(KbqButton) button: KbqButton;
    @ContentChild(KbqAlertTitle) title: KbqAlertTitle;
    @ContentChild(KbqAlertControl) control: KbqAlertControl;
    @ContentChild(KbqAlertCloseButton) closeButton: KbqAlertCloseButton;

    @Input() compact: boolean = false;
    @Input() alertStyle: KbqAlertStyles | string = KbqAlertStyles.Default;

    @Input()
    get alertColor(): string {
        return `kbq-alert_${this._alertColor}`;
    }

    set alertColor(value: string | KbqAlertColors) {
        this._alertColor = value || KbqAlertColors.Contrast;
    }

    private _alertColor: string | KbqAlertColors = KbqAlertColors.Contrast;

    get isColored(): boolean {
        return this.alertStyle === KbqAlertStyles.Colored;
    }

    ngAfterContentInit(): void {
        const icon = this.icon || this.iconItem;

        if (icon) {
            icon.color = this._alertColor === KbqAlertColors.Info ? KbqAlertColors.Contrast : this._alertColor;
        }
    }
}
