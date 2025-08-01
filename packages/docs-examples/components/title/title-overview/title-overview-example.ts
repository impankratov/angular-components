import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Title
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'title-overview-example',
    imports: [
        KbqTitleModule,
        KbqButtonModule
    ],
    template: `
        <div class="example-title-overview-container example-title-overview-container-responsive">
            <div class="kbq-subheading">Responsive text with tooltip</div>
            <br />
            <div class="example-title-overview-child wide kbq-text-big" kbq-title>
                {{ longValue }}
            </div>
        </div>

        <div class="example-title-overview-container">
            <div class="kbq-subheading">Tooltip tracking for parent & child as parameters</div>
            <br />

            <div kbq-title style="max-width: 50%">
                <div #kbqTitleContainer class="example-title-overview-parent">
                    <div #kbqTitleText class="example-title-overview-child kbq-text-normal">
                        {{ field }}
                    </div>
                </div>
            </div>
            <br />
            <button kbq-button (click)="onAddText()">Add text</button>
            <br />
            <button kbq-button (click)="field = defaultValue">Set Default text</button>
        </div>
    `,
    styleUrls: ['./title-overview-example.css']
})
export class TitleOverviewExample {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
    field = this.defaultValue;

    onAddText() {
        this.field = `${this.field} and a long text and a long text and a long text`;
    }
}
