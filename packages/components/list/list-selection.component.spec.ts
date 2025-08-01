import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, DebugElement, QueryList, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule, NgModel, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { C, DOWN_ARROW, END, ENTER, HOME, SPACE, UP_ARROW } from '@koobiq/cdk/keycodes';
import {
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent
} from '@koobiq/cdk/testing';
import { KbqListModule, KbqListOption, KbqListSelection, KbqListSelectionChange } from './index';

describe('KbqListSelection without forms', () => {
    describe('with list option', () => {
        let fixture: ComponentFixture<SelectionListWithListOptions>;
        let listOptions: DebugElement[];
        let selectionList: DebugElement;
        let clipboardContent: string;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                declarations: [SelectionListWithListOptions],
                providers: [
                    {
                        provide: Clipboard,
                        useFactory: () => ({
                            copy: (value) => {
                                const originalClipboard = new Clipboard(document);

                                originalClipboard.copy(value);
                                clipboardContent = value;
                            }
                        })
                    }
                ]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithListOptions);
            fixture.detectChanges();

            listOptions = fixture.debugElement.queryAll(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            clipboardContent = '';
        });

        it('should copy selected option - default handler', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const copyKeyEvent = createKeyboardEvent('keydown', C);

            Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toBe(2);

            selectionList.componentInstance.onKeyDown(copyKeyEvent);
            fixture.detectChanges();

            expect(clipboardContent).toBe(listOptions[2].componentInstance.value);
        }));

        it('should not blur on focused option when copying', fakeAsync(() => {
            const copyKeyEvent = createKeyboardEvent('keydown', C);

            Object.defineProperty(copyKeyEvent, 'ctrlKey', { get: () => true });

            expect(listOptions[2].componentInstance.hasFocus).toBeFalsy();

            dispatchFakeEvent(listOptions[2].nativeElement, 'focusin');
            flush();
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.hasFocus).toBeTruthy();

            selectionList.componentInstance.onKeyDown(copyKeyEvent);
            fixture.detectChanges();

            expect(clipboardContent).toBe(listOptions[2].componentInstance.value);
            expect(listOptions[2].componentInstance.hasFocus).toBeTruthy();
        }));

        it('should be able to set a value on a list option', () => {
            const optionValues = ['inbox', 'starred', 'sent-mail', 'drafts'];

            optionValues.forEach((optionValue, index) => {
                expect(listOptions[index].componentInstance.value).toBe(optionValue);
            });
        });

        it('should not emit a selectionChange event if an option changed programmatically', () => {
            const onValueChangeSpyFn = jest.spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            listOptions[2].componentInstance.toggle();
            fixture.detectChanges();

            expect(onValueChangeSpyFn).toHaveBeenCalledTimes(0);
        });

        it('should emit a selectionChange event if an option got clicked', () => {
            const onValueChangeSpyFn = jest.spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            dispatchFakeEvent(listOptions[2].nativeElement, 'click');
            fixture.detectChanges();

            expect(onValueChangeSpyFn).toHaveBeenCalledTimes(1);
        });

        it('should be able to dispatch one selected item', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
        });

        it('should be able to dispatch multiple selected items', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const testListItem2 = listOptions[1].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            testListItem2.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(2);
        });

        it('should be able to deselect an option', () => {
            const testListItem = listOptions[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should not allow selection of disabled items', () => {
            const testListItem = listOptions[0].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should be able to use keyboard select with SPACE', () => {
            const manager = selectionList.componentInstance.keyManager;
            const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(SPACE_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(SPACE_EVENT.defaultPrevented).toBe(true);
        });

        it('should be able to select an item using ENTER', () => {
            const manager = selectionList.componentInstance.keyManager;
            const testListItem: HTMLElement = listOptions[1].nativeElement;
            const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER, testListItem);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(ENTER_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(ENTER_EVENT.defaultPrevented).toBe(true);
        });

        // todo restore this TC
        xit('should restore focus if active option is destroyed', () => {
            const manager = selectionList.componentInstance.keyManager;

            listOptions[3].componentInstance.focus();

            expect(manager.activeItemIndex).toBe(3);

            fixture.componentInstance.showLastOption = false;
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(2);
        });

        it('should focus previous item when press UP ARROW', () => {
            const testListItem = listOptions[2].nativeElement as HTMLElement;
            const UP_EVENT: KeyboardEvent = createKeyboardEvent('keydown', UP_ARROW, testListItem);
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(UP_EVENT);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(1);
        });

        it('should focus and toggle the next item when pressing SHIFT + UP_ARROW', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW);

            Object.defineProperty(upKeyEvent, 'shiftKey', { get: () => true });

            listOptions[3].componentInstance.selected = true;

            manager.setActiveItem(3);
            expect(manager.activeItemIndex).toBe(3);

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(true);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();
            tick();

            expect(listOptions[1].componentInstance.selected).toBe(true);
            expect(listOptions[2].componentInstance.selected).toBe(true);
        }));

        it('should focus next item when press DOWN ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(3);
        });

        it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', fakeAsync(() => {
            const manager = selectionList.componentInstance.keyManager;
            const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW);

            Object.defineProperty(downKeyEvent, 'shiftKey', { get: () => true });

            listOptions[1].componentInstance.selected = true;

            manager.setActiveItem(1);
            expect(manager.activeItemIndex).toBe(1);

            expect(listOptions[2].componentInstance.selected).toBe(false);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();
            tick();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(true);
        }));

        it('should be able to focus the first item when pressing HOME', () => {
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', HOME);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(1);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should focus the last item when pressing END', () => {
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', END);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        xit('should be able to jump focus down to an item by typing', fakeAsync(() => {
            const listEl = selectionList.nativeElement;
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            dispatchEvent(listEl, createKeyboardEvent('keydown', 83, undefined, 's'));
            fixture.detectChanges();
            tick(201);

            expect(manager.activeItemIndex).toBe(1);

            dispatchEvent(listEl, createKeyboardEvent('keydown', 68, undefined, 'd'));
            fixture.detectChanges();
            tick(200);

            expect(manager.activeItemIndex).toBe(3);
        }));

        it('should be able to select all options', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);

            list.selectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(true);
        });

        it('should be able to deselect all options', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            list.options.forEach((option) => option.toggle());
            expect(list.options.toArray().every((option) => option.selected)).toBe(true);

            list.deselectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);
        });

        it('should update the list value when an item is selected programmatically', () => {
            const list: KbqListSelection = selectionList.componentInstance;

            expect(list.selectionModel.isEmpty()).toBe(true);

            listOptions[0].componentInstance.selected = true;
            listOptions[2].componentInstance.selected = true;
            fixture.detectChanges();

            expect(list.selectionModel.isEmpty()).toBe(false);
            expect(list.selectionModel.isSelected(listOptions[0].componentInstance)).toBe(true);
            expect(list.selectionModel.isSelected(listOptions[2].componentInstance)).toBe(true);
        });

        it('should update the item selected state when it is selected via the model', () => {
            const list: KbqListSelection = selectionList.componentInstance;
            const item: KbqListOption = listOptions[0].componentInstance;

            expect(item.selected).toBe(false);

            list.selectionModel.select(item);
            fixture.detectChanges();

            expect(item.selected).toBe(true);
        });
    });

    describe('with list option selected', () => {
        let fixture: ComponentFixture<SelectionListWithSelectedOption>;
        let listItemEl: DebugElement;
        let selectionList: DebugElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                declarations: [SelectionListWithSelectedOption]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithSelectedOption);
            listItemEl = fixture.debugElement.query(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
            fixture.detectChanges();
        });

        it('should set its initial selected state in the selectionModel', () => {
            const optionEl = listItemEl.injector.get<KbqListOption>(KbqListOption);
            const selectedOptions = selectionList.componentInstance.selectionModel;

            expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
        });
    });

    describe('with tabindex', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                declarations: [
                    SelectionListWithTabindexAttr,
                    SelectionListWithTabindexInDisabledState
                ]
            }).compileComponents();
        });

        it('should properly handle native tabindex attribute', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexAttr);

            fixture.detectChanges();
            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            expect(selectionList.componentInstance.tabIndex).toBe(5);
        });

        it('should set tabindex to "-1" in disabled state', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexInDisabledState);
            const selectionList = fixture.debugElement.query(By.directive(KbqListSelection));

            expect(selectionList.componentInstance.tabIndex).toBe(0);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(selectionList.componentInstance.tabIndex).toBe(-1);
        });
    });

    describe('focus states', () => {
        let fixture: ComponentFixture<SelectionListFocusStates>;
        let list: DebugElement;
        let options: DebugElement[];

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule, FormsModule],
                declarations: [SelectionListFocusStates]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListFocusStates);
            list = fixture.debugElement.query(By.directive(KbqListSelection));
            options = fixture.debugElement.queryAll(By.directive(KbqListOption));

            fixture.detectChanges();
        });

        it('should add and remove focus class on focus/blur', fakeAsync(() => {
            const option = options[0].nativeElement;

            expect(option.classList).not.toContain('kbq-focused');

            dispatchFakeEvent(list.nativeElement, 'focus');
            flush();
            fixture.detectChanges();
            expect(option.className).toContain('kbq-focused');

            dispatchFakeEvent(option, 'blur');
            fixture.detectChanges();
            expect(option.className).not.toContain('kbq-focused');
        }));

        it('should add focus class on first selected element', fakeAsync(() => {
            const selectedOption = options[1];

            selectedOption.componentInstance.toggle();
            fixture.detectChanges();

            options.forEach(({ nativeElement }) => {
                expect(nativeElement.classList).not.toContain('kbq-focused');
            });

            expect(selectedOption.nativeElement.classList).toContain('kbq-selected');

            dispatchFakeEvent(list.nativeElement, 'focus');
            flush();
            fixture.detectChanges();
            expect(selectedOption.nativeElement.className).toContain('kbq-focused');
        }));

        it('should be focused when focus on nativeElements', fakeAsync(() => {
            dispatchFakeEvent(options[0].nativeElement, 'focusin');
            flush();
            fixture.detectChanges();

            expect(options[0].nativeElement.className).toContain('kbq-focused');

            dispatchFakeEvent(options[0].nativeElement, 'blur');
            fixture.detectChanges();

            expect(options[0].nativeElement.className).not.toContain('kbq-focused');
        }));
    });

    describe('with list disabled', () => {
        let fixture: ComponentFixture<SelectionListWithListDisabled>;
        let listOption: DebugElement[];
        let selectionList: DebugElement;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                declarations: [SelectionListWithListDisabled]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithListDisabled);
            listOption = fixture.debugElement.queryAll(By.directive(KbqListOption));
            selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
            fixture.detectChanges();
        });

        it('should not allow selection on disabled selection-list', () => {
            const testListItem = listOption[2].injector.get<KbqListOption>(KbqListOption);
            const selectList = selectionList.injector.get<KbqListSelection>(KbqListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });
    });

    xdescribe('with checkbox position after', () => {
        let fixture: ComponentFixture<SelectionListWithCheckboxPositionAfter>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqListModule],
                declarations: [SelectionListWithCheckboxPositionAfter]
            }).compileComponents();

            fixture = TestBed.createComponent(SelectionListWithCheckboxPositionAfter);
            fixture.detectChanges();
        });

        it('should be able to customize checkbox position', () => {
            const listItemContent = fixture.debugElement.query(By.css('.kbq-list-item-content'));

            expect(listItemContent.nativeElement.classList).toContain('kbq-list-item-content-reverse');
        });
    });
});

xdescribe('KbqListSelection with forms', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqListModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [
                SelectionListWithModel,
                SelectionListWithFormControl,
                SelectionListWithPreselectedOption,
                SelectionListWithPreselectedOptionAndModel,
                SelectionListWithPreselectedFormControlOnPush
            ]
        }).compileComponents();
    });

    describe('and ngModel', () => {
        let fixture: ComponentFixture<SelectionListWithModel>;
        let selectionListDebug: DebugElement;
        let listOptions: KbqListOption[];
        let ngModel: NgModel;

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.detectChanges();

            selectionListDebug = fixture.debugElement.query(By.directive(KbqListSelection));
            ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should update the model if an option got selected programmatically', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            listOptions[0].toggle();
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        }));

        it('should update the model if an option got clicked', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            dispatchFakeEvent(listOptions[0].getHostElement(), 'click');
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        }));

        it('should update the options if a model value is set', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length).toBe(0);

            fixture.componentInstance.selectedOptions = ['opt3'];
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length).toBe(1);
        }));

        it('should set the selection-list to touched on blur', fakeAsync(() => {
            expect(ngModel.touched).toBe(false);

            dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
            fixture.detectChanges();

            tick();

            expect(ngModel.touched).toBe(true);
        }));

        it('should be pristine by default', fakeAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.componentInstance.selectedOptions = ['opt2'];
            fixture.detectChanges();

            ngModel = fixture.debugElement.query(By.directive(KbqListSelection)).injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            // Flush the initial tick to ensure that every action from the ControlValueAccessor
            // happened before the actual test starts.
            tick();

            expect(ngModel.pristine).toBe(true);

            listOptions[1].toggle();
            fixture.detectChanges();

            tick();

            expect(ngModel.pristine).toBe(false);
        }));

        it('should remove a selected option from the value on destroy', fakeAsync(() => {
            listOptions[1].selected = true;
            listOptions[2].selected = true;

            fixture.detectChanges();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2', 'opt3']);

            fixture.componentInstance.renderLastOption = false;
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
        }));

        it('should update the model if an option got selected via the model', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions).toEqual([]);

            selectionListDebug.componentInstance.selectionModel.select(listOptions[0]);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1']);
        }));
    });

    describe('and formControl', () => {
        let fixture: ComponentFixture<SelectionListWithFormControl>;
        let listOptions: KbqListOption[];

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithFormControl);
            fixture.detectChanges();

            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should be able to disable options from the control', () => {
            expect(listOptions.every((option) => !option.disabled)).toBe(true);

            fixture.componentInstance.formControl.disable();
            fixture.detectChanges();

            expect(listOptions.every((option) => option.disabled)).toBe(true);
        });

        it('should be able to set the value through the form control', () => {
            expect(listOptions.every((option) => !option.selected)).toBe(true);

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();

            expect(listOptions[1].selected).toBe(true);

            expect(listOptions[2].selected).toBe(true);

            fixture.componentInstance.formControl.setValue(null);
            fixture.detectChanges();

            expect(listOptions.every((option) => !option.selected)).toBe(true);
        });

        it('should mark options as selected when the value is set before they are initialized', () => {
            fixture.destroy();
            fixture = TestBed.createComponent(SelectionListWithFormControl);

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();

            listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            expect(listOptions[1].selected).toBe(true);

            expect(listOptions[2].selected).toBe(true);
        });
    });

    describe('preselected values', () => {
        it('should add preselected options to the model value', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
            const listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();

            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
        }));

        it('should handle preselected option both through the model and the view', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
            const listOptions = fixture.debugElement
                .queryAll(By.directive(KbqListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();

            expect(listOptions[0].selected).toBe(true);
            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1', 'opt2']);
        }));

        it('should show the item as selected when preselected inside OnPush parent', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedFormControlOnPush);

            fixture.detectChanges();

            const option = fixture.debugElement.queryAll(By.directive(KbqListOption))[1];

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(option.componentInstance.selected).toBe(true);
        }));
    });

    describe('with custom compare function', () => {
        it('should use a custom comparator to determine which options are selected', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithCustomComparator);
            const testComponent = fixture.componentInstance;

            testComponent.selectedOptions = [{ id: 2, label: 'Two' }];
            fixture.detectChanges();
            tick();
            expect(testComponent.compareWith).toHaveBeenCalled();
            expect(testComponent.optionInstances.toArray()[1].selected).toBe(true);
        }));
    });
});

// should be placed in 'KbqListSelection with forms' section when it will not be skipped
describe('should update model after keyboard interaction with multiple mode = checkbox', () => {
    let fixture: ComponentFixture<SelectionListMultipleCheckbox>;
    let selectionList: DebugElement;
    let ngModel: NgModel;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqListModule, FormsModule],
            declarations: [SelectionListMultipleCheckbox]
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionListMultipleCheckbox);
        fixture.detectChanges();

        selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        ngModel = selectionList.injector.get<NgModel>(NgModel);
    });

    it('should update model when items selected with SPACE and ENTER', () => {
        const manager = selectionList.componentInstance.keyManager;

        const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
        const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER);
        const DOWN_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        const UP_EVENT: KeyboardEvent = createKeyboardEvent('keydown', UP_ARROW);

        expect(ngModel.value.length).toBe(0);

        manager.setFirstItemActive();
        fixture.detectChanges();

        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);
        selectionList.componentInstance.onKeyDown(ENTER_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);
        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(3);

        selectionList.componentInstance.onKeyDown(UP_EVENT);
        selectionList.componentInstance.onKeyDown(ENTER_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(2);
    });
});

@Component({
    template: `
        <mat-selection-list [compareWith]="compareWith" [(ngModel)]="selectedOptions">
            @for (option of options; track option) {
                <mat-list-option [value]="option">
                    {{ option.label }}
                </mat-list-option>
            }
        </mat-selection-list>
    `
})
class SelectionListWithCustomComparator {
    @ViewChildren(KbqListOption) optionInstances: QueryList<KbqListOption>;

    selectedOptions: { id: number; label: string }[] = [];

    options = [
        { id: 1, label: 'One' },
        { id: 2, label: 'Two' },
        { id: 3, label: 'Three' }
    ];

    compareWith = jest.fn().mockReturnValue((o1: any, o2: any) => {
        return o1 && o2 && o1.id === o2.id;
    });
}

@Component({
    template: `
        <kbq-list-selection
            id="selection-list-1"
            multiple="keyboard"
            [autoSelect]="false"
            [noUnselectLast]="false"
            (selectionChange)="onValueChange($event)"
        >
            <kbq-list-option checkboxPosition="before" disabled="true" [value]="'inbox'">
                Inbox (disabled selection-option)
            </kbq-list-option>
            <kbq-list-option id="testSelect" checkboxPosition="before" [value]="'starred'">Starred</kbq-list-option>
            <kbq-list-option checkboxPosition="before" [value]="'sent-mail'">Sent Mail</kbq-list-option>
            @if (showLastOption) {
                <kbq-list-option checkboxPosition="before" [value]="'drafts'">Drafts</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithListOptions {
    showLastOption: boolean = true;

    onValueChange(_change: KbqListSelectionChange) {}
}

@Component({
    template: `
        <kbq-list-selection multiple="checkbox" [autoSelect]="false" [noUnselectLast]="false" [(ngModel)]="model">
            <kbq-list-option [value]="'value1'">value1</kbq-list-option>
            <kbq-list-option [value]="'value2'">value2</kbq-list-option>
            <kbq-list-option [value]="'value3'">value3</kbq-list-option>
            <kbq-list-option [value]="'value4'">value4</kbq-list-option>
            <kbq-list-option [value]="'disabled option'" [disabled]="true">disabled option</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleCheckbox {
    model = [];
}

@Component({
    template: `
        <kbq-list-selection id="selection-list-2">
            <kbq-list-option checkboxPosition="after">Inbox (disabled selection-option)</kbq-list-option>
            <kbq-list-option id="testSelect" checkboxPosition="after">Starred</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Sent Mail</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Drafts</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithCheckboxPositionAfter {}

@Component({
    template: `
        <kbq-list-selection id="selection-list-3" [disabled]="true">
            <kbq-list-option checkboxPosition="after">Inbox (disabled selection-option)</kbq-list-option>
            <kbq-list-option id="testSelect" checkboxPosition="after">Starred</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Sent Mail</kbq-list-option>
            <kbq-list-option checkboxPosition="after">Drafts</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithListDisabled {}

@Component({
    template: `
        <kbq-list-selection>
            <kbq-list-option [selected]="true">Item</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithSelectedOption {}

@Component({
    template: `
        <kbq-list-selection [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'option_1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'option_2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'option_3'">Option 3</kbq-list-option>
            <kbq-list-option [value]="'option_4'">Option 4</kbq-list-option>
            <kbq-list-option [value]="'option_5'">Option 5</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListFocusStates {
    selectedOptions: string[] = [];
}

@Component({
    template: `
        <kbq-list-selection [tabIndex]="5" />
    `
})
class SelectionListWithTabindexAttr {}

@Component({
    template: `
        <kbq-list-selection [disabled]="disabled" />
    `
})
class SelectionListWithTabindexInDisabledState {
    tabIndex: number;
    disabled: boolean;
}

@Component({
    template: `
        <kbq-list-selection [autoSelect]="false" [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            @if (renderLastOption) {
                <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithModel {
    selectedOptions: string[] = [];
    renderLastOption = true;
}

@Component({
    template: `
        <kbq-list-selection [formControl]="formControl">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option [value]="'opt2'">Option 2</kbq-list-option>
            <kbq-list-option [value]="'opt3'">Option 3</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithFormControl {
    formControl = new UntypedFormControl();
}

@Component({
    template: `
        <kbq-list-selection [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option selected [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithPreselectedOption {
    selectedOptions: string[];
}

@Component({
    template: `
        <kbq-list-selection [(ngModel)]="selectedOptions">
            <kbq-list-option [value]="'opt1'">Option 1</kbq-list-option>
            <kbq-list-option selected [value]="'opt2'">Option 2</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListWithPreselectedOptionAndModel {
    selectedOptions = ['opt1'];
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-list-selection [formControl]="formControl">
            @for (opt of opts; track opt) {
                <kbq-list-option [value]="opt">
                    {{ opt }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `
})
class SelectionListWithPreselectedFormControlOnPush {
    opts = ['opt1', 'opt2', 'opt3'];
    formControl = new UntypedFormControl(['opt2']);
}
