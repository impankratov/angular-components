import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLinkModule } from '@koobiq/components/link';

/**
 * @title Link visited
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'link-visited-example',
    imports: [KbqLinkModule],
    template: `
        <div style="padding: 16px">
            <a
                class="kbq-link_external"
                [useVisited]="visited"
                (click)="visited = true"
                href="https://koobiq.io/en/components/link"
                target="_blank"
                kbq-link
            >
                Отчет от 19.05.2020
            </a>
        </div>
    `
})
export class LinkVisitedExample {
    visited = false;
}
