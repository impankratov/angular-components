import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button overview
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-overview-example',
    styleUrls: ['button-overview-example.css'],
    imports: [
        KbqButtonModule,
        KbqCheckboxModule,
        FormsModule
    ],
    template: `
        <button
            class="example-overview__button"
            kbq-button
            [class.kbq-progress]="hasProgress"
            [color]="colors.Contrast"
            [disabled]="isDisabled"
        >
            Кнопка
        </button>
        <br />
        <kbq-checkbox [(ngModel)]="isDisabled">disabled</kbq-checkbox>
        <kbq-checkbox [(ngModel)]="hasProgress">progress</kbq-checkbox>
    `
})
export class ButtonOverviewExample {
    colors = KbqComponentColors;
    isDisabled = false;
    hasProgress = false;
}
