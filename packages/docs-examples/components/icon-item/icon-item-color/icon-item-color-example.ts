import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item color
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'icon-item-color-example',
    styleUrls: ['icon-item-color-example.css'],
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-layout layout-row">
            <div class="example-icon-item-container">
                <i [color]="colors.Theme" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Theme</div>
            </div>

            <div class="example-icon-item-container">
                <i [color]="colors.Contrast" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Contrast</div>
            </div>

            <div class="example-icon-item-container">
                <i [color]="colors.Success" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Success</div>
            </div>

            <div class="example-icon-item-container">
                <i [color]="colors.Warning" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Warning</div>
            </div>

            <div class="example-icon-item-container">
                <i [color]="colors.Error" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Error</div>
            </div>
        </div>
    `
})
export class IconItemColorExample {
    colors = KbqComponentColors;
}
