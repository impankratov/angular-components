import { Direction, Directionality } from '@angular/cdk/bidi';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule, ViewportRuler } from '@angular/cdk/scrolling';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { END, ENTER, HOME, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@koobiq/cdk/keycodes';
import { dispatchFakeEvent, dispatchKeyboardEvent } from '@koobiq/cdk/testing';
import { Subject } from 'rxjs';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';

describe('KbqTabHeader', () => {
    let dir: Direction = 'ltr';
    let change: Subject<Direction>;
    let fixture: ComponentFixture<SimpleTabHeaderApp>;
    let appComponent: SimpleTabHeaderApp;

    beforeEach(() => {
        change = new Subject();
        dir = 'ltr';
        TestBed.configureTestingModule({
            imports: [
                PortalModule,
                ScrollingModule
            ],
            declarations: [
                KbqTabHeader,
                KbqTabLabelWrapper,
                SimpleTabHeaderApp
            ],
            providers: [
                ViewportRuler,
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: change.asObservable()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('focusing', () => {
        let tabListContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);
            fixture.detectChanges();

            appComponent = fixture.componentInstance;
            tabListContainer = appComponent.tabHeader.tabListContainer.nativeElement;
        });

        it('should initialize to the selected index', () => {
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(appComponent.selectedIndex);
        });

        it('should send focus change event', () => {
            appComponent.tabHeader.focusIndex = 2;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(2);
        });

        it('should not set focus a disabled tab', () => {
            appComponent.tabHeader.focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            // Set focus on the disabled tab, but focus should remain 0
            appComponent.tabHeader.focusIndex = appComponent.disabledTabIndex;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);
        });

        it('should move focus right and skip disabled tabs', () => {
            appComponent.tabHeader.focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            // Move focus right, verify that the disabled tab is 1 and should be skipped
            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(2);

            // Move focus right to index 3
            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(3);
        });

        it('should move focus left and skip disabled tabs', () => {
            appComponent.tabHeader.focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(3);

            // Move focus left to index 3
            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(2);

            // Move focus left, verify that the disabled tab is 1 and should be skipped
            expect(appComponent.disabledTabIndex).toBe(1);
            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);
        });

        it('should support key down events to move and select focus', () => {
            appComponent.tabHeader.focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            // Move focus right to 2
            dispatchKeyboardEvent(tabListContainer, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(2);

            // Select the focused index 2
            expect(appComponent.selectedIndex).toBe(0);
            const enterEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', ENTER);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(2);
            expect(enterEvent.defaultPrevented).toBe(true);

            // Move focus right to 0
            dispatchKeyboardEvent(tabListContainer, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            // Select the focused 0 using space.
            expect(appComponent.selectedIndex).toBe(2);
            const spaceEvent = dispatchKeyboardEvent(tabListContainer, 'keydown', SPACE);

            fixture.detectChanges();
            expect(appComponent.selectedIndex).toBe(0);
            expect(spaceEvent.defaultPrevented).toBe(true);
        });

        it('should move focus to the first tab when pressing HOME', () => {
            appComponent.tabHeader.focusIndex = 3;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(3);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);

            fixture.detectChanges();

            expect(appComponent.tabHeader.focusIndex).toBe(0);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using HOME', () => {
            appComponent.tabHeader.focusIndex = 3;
            appComponent.tabs[0].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(3);

            dispatchKeyboardEvent(tabListContainer, 'keydown', HOME);
            fixture.detectChanges();

            // Note that the second tab is disabled by default already.
            expect(appComponent.tabHeader.focusIndex).toBe(2);
        });

        it('should move focus to the last tab when pressing END', () => {
            appComponent.tabHeader.focusIndex = 0;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            const event = dispatchKeyboardEvent(tabListContainer, 'keydown', END);

            fixture.detectChanges();

            expect(appComponent.tabHeader.focusIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should skip disabled items when moving focus using END', () => {
            appComponent.tabHeader.focusIndex = 0;
            appComponent.tabs[3].disabled = true;
            fixture.detectChanges();
            expect(appComponent.tabHeader.focusIndex).toBe(0);

            dispatchKeyboardEvent(tabListContainer, 'keydown', END);
            fixture.detectChanges();

            expect(appComponent.tabHeader.focusIndex).toBe(2);
        });
    });

    describe('pagination', () => {
        describe('ltr', () => {
            beforeEach(() => {
                dir = 'ltr';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                fixture.detectChanges();

                appComponent = fixture.componentInstance;
            });

            it('should scroll to show the focused tab label', () => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(0);

                // Focus on the last tab, expect this to be the maximum scroll distance.
                appComponent.tabHeader.focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(appComponent.tabHeader.getMaxScrollDistance());

                // Focus on the first tab, expect this to be the maximum scroll distance.
                appComponent.tabHeader.focusIndex = 0;
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(0);
            });

            it('should align scroll header when tabs removed from end of the list', fakeAsync(() => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(0);

                appComponent.tabHeader.focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                const previousMaxScrollDistance = appComponent.tabHeader.getMaxScrollDistance();

                expect(appComponent.tabHeader.scrollDistance).toBe(previousMaxScrollDistance);

                // Focus on the first tab, expect this to be the maximum scroll distance.
                appComponent.tabs.pop();
                fixture.detectChanges();
                tick(1000);

                const updatedMaxScrollDistance = appComponent.tabHeader.getMaxScrollDistance();

                expect(appComponent.tabHeader.scrollDistance).toBe(updatedMaxScrollDistance);
                expect(previousMaxScrollDistance > updatedMaxScrollDistance);

                flush();
            }));
        });

        describe('rtl', () => {
            beforeEach(() => {
                dir = 'rtl';
                fixture = TestBed.createComponent(SimpleTabHeaderApp);
                appComponent = fixture.componentInstance;
                appComponent.dir = 'rtl';

                fixture.detectChanges();
            });

            it('should scroll to show the focused tab label', () => {
                appComponent.addTabsForScrolling();
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(0);

                // Focus on the last tab, expect this to be the maximum scroll distance.
                appComponent.tabHeader.focusIndex = appComponent.tabs.length - 1;
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(appComponent.tabHeader.getMaxScrollDistance());

                // Focus on the first tab, expect this to be the maximum scroll distance.
                appComponent.tabHeader.focusIndex = 0;
                fixture.detectChanges();
                expect(appComponent.tabHeader.scrollDistance).toBe(0);
            });
        });

        it('should update arrows when the window is resized', fakeAsync(() => {
            fixture = TestBed.createComponent(SimpleTabHeaderApp);

            const header = fixture.componentInstance.tabHeader;

            const checkPaginationEnabledSpyFn = jest.spyOn(header, 'checkPaginationEnabled');

            dispatchFakeEvent(window, 'resize');
            tick(10);
            fixture.detectChanges();

            expect(checkPaginationEnabledSpyFn).toHaveBeenCalled();
            discardPeriodicTasks();
        }));
    });
});

interface ITab {
    label: string;
    disabled?: boolean;
}

@Component({
    template: `
        <div [dir]="dir">
            <kbq-tab-header
                [selectedIndex]="selectedIndex"
                (indexFocused)="focusedIndex = $event"
                (selectFocusedIndex)="selectedIndex = $event"
            >
                @for (tab of tabs; track tab; let i = $index) {
                    <div
                        class="label-content"
                        kbqTabLabelWrapper
                        style="min-width: 30px; width: 30px"
                        [disabled]="!!tab.disabled"
                        (click)="selectedIndex = i"
                    >
                        {{ tab.label }}
                    </div>
                }
            </kbq-tab-header>
        </div>
    `,
    styles: [
        `
            :host {
                width: 130px;
            }
        `

    ]
})
class SimpleTabHeaderApp {
    selectedIndex: number = 0;
    focusedIndex: number;
    disabledTabIndex = 1;
    tabs: ITab[] = [
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' },
        { label: 'tab one' }];
    dir: Direction = 'ltr';

    @ViewChild(KbqTabHeader, { static: true })
    tabHeader: KbqTabHeader;

    constructor() {
        this.tabs[this.disabledTabIndex].disabled = true;
    }

    addTabsForScrolling() {
        this.tabs.push({ label: 'new' }, { label: 'new' }, { label: 'new' }, { label: 'new' });
    }
}
