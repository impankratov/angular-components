import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button hug content
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-hug-content-example',
    styleUrls: ['button-hug-content-example.css'],
    imports: [
        KbqButtonModule
    ],
    template: `
        <button class="example-hug-content__button" [color]="colors.Contrast" kbq-button>Текст кнопки</button>
        &nbsp;
        <br />
        <button class="example-hug-content__button" [color]="colors.Contrast" kbq-button>
            Очень длинный текст кнопки
        </button>
        &nbsp;
    `
})
export class ButtonHugContentExample {
    colors = KbqComponentColors;
}
