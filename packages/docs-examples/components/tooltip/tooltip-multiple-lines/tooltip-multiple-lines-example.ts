import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip multiple lines
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'tooltip-multiple-lines-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button kbqTooltip="Подсказка может занимать две и более строк" [kbqPlacement]="placement">
            Кнопка с тултипом
        </button>
    `
})
export class TooltipMultipleLinesExample {
    placement: PopUpPlacements = PopUpPlacements.Top;
}
