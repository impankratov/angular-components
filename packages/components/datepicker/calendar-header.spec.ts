import { Component } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { KbqCalendar } from './calendar.component';
import { KbqDatepickerIntl } from './datepicker-intl';
import { KbqDatepickerModule } from './datepicker-module';

describe('KbqCalendarHeader', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqLuxonDateModule,
                KbqDatepickerModule
            ],
            declarations: [StandardCalendar],
            providers: [
                KbqDatepickerIntl,
                { provide: DateAdapter, useClass: LuxonDateAdapter }]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    describe('standard calendar', () => {
        let fixture: ComponentFixture<StandardCalendar>;
        let calendarElement: HTMLElement;
        let prevButton: HTMLElement;
        let nextButton: HTMLElement;
        let calendarInstance: KbqCalendar<DateTime>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(KbqCalendar));

            calendarElement = calendarDebugElement.nativeElement;
            prevButton = calendarElement.querySelector<HTMLElement>('.kbq-calendar-header__previous-button')!;
            nextButton = calendarElement.querySelector<HTMLElement>('.kbq-calendar-header__next-button')!;

            calendarInstance = calendarDebugElement.componentInstance;
        });

        it('should be in month view with specified month active', () => {
            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170131');
        });

        it('should go to next and previous month', () => {
            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170131');

            nextButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170228');

            prevButton.click();
            fixture.detectChanges();

            expect(adapter.format(calendarInstance.activeDate, 'yyyyMMdd')).toEqual('20170128');
        });
    });
});

@Component({
    template: `
        <kbq-calendar
            [startAt]="startDate"
            [(selected)]="selected"
            (yearSelected)="selectedYear = $event"
            (monthSelected)="selectedMonth = $event"
        />
    `
})
class StandardCalendar {
    selected: DateTime;
    selectedYear: DateTime;
    selectedMonth: DateTime;
    startDate = this.adapter.createDate(2017, 0, 31);

    constructor(public adapter: DateAdapter<DateTime>) {}
}
