import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDlModule } from '@koobiq/components/dl';

/**
 * @title Description list
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'dl-overview-example',
    imports: [
        KbqDlModule
    ],
    template: `
        <kbq-dl>
            <kbq-dt>Тип инцидента</kbq-dt>
            <kbq-dd>Вредоносное ПО</kbq-dd>

            <kbq-dt>Идентификатор</kbq-dt>
            <kbq-dd>INC-2022-125-78253</kbq-dd>

            <kbq-dt>Статус</kbq-dt>
            <kbq-dd>Новый</kbq-dd>

            <kbq-dt>Ответственный</kbq-dt>
            <kbq-dd>Иванов Иван</kbq-dd>

            <kbq-dt>Описание</kbq-dt>
            <kbq-dd>
                Здесь нужно добавить очень длинное описание, но Я не знаю, что еще можно сюда добавить, поэтому Вы
                видите этот текст.
            </kbq-dd>
        </kbq-dl>

        <br />

        <kbq-dl [wide]="true">
            <kbq-dt>File</kbq-dt>
            <kbq-dd>125 КБ</kbq-dd>

            <kbq-dt>File</kbq-dt>
            <kbq-dd>125 КБ</kbq-dd>

            <kbq-dt>File</kbq-dt>
            <kbq-dd>125 КБ</kbq-dd>

            <kbq-dt>File</kbq-dt>
            <kbq-dd>125 КБ</kbq-dd>

            <kbq-dt>File</kbq-dt>
            <kbq-dd>125 КБ</kbq-dd>
        </kbq-dl>
    `
})
export class DlOverviewExample {}
