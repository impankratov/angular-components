import { FocusOrigin, ListKeyManagerModifierKey } from '@angular/cdk/a11y';
import { DOWN_ARROW, END, HOME, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { QueryList } from '@angular/core';
import { FocusKeyManager, ListKeyManager } from '@koobiq/cdk/a11y';
import { createKeyboardEvent } from '@koobiq/cdk/testing';
import { take } from 'rxjs/operators';

class FakeFocusable {
    /** Whether the item is disabled or not. */
    disabled = false;
    /** Test property that can be used to test the `skipPredicate` functionality. */
    skipItem = false;

    constructor(private _label = '') {}

    focus(_origin?: FocusOrigin) {}

    getLabel() {
        return this._label;
    }
}

interface KeyEventTestContext {
    nextKeyEvent: KeyboardEvent;
    prevKeyEvent: KeyboardEvent;
}

describe('Key managers', () => {
    let itemList: QueryList<any>;
    let fakeKeyEvents: {
        downArrow: KeyboardEvent;
        upArrow: KeyboardEvent;
        leftArrow: KeyboardEvent;
        rightArrow: KeyboardEvent;
        tab: KeyboardEvent;
        home: KeyboardEvent;
        end: KeyboardEvent;
        unsupported: KeyboardEvent;
    };

    beforeEach(() => {
        itemList = new QueryList<any>();
        fakeKeyEvents = {
            downArrow: createKeyboardEvent('keydown', DOWN_ARROW),
            upArrow: createKeyboardEvent('keydown', UP_ARROW),
            leftArrow: createKeyboardEvent('keydown', LEFT_ARROW),
            rightArrow: createKeyboardEvent('keydown', RIGHT_ARROW),
            tab: createKeyboardEvent('keydown', TAB),
            home: createKeyboardEvent('keydown', HOME),
            end: createKeyboardEvent('keydown', END),
            unsupported: createKeyboardEvent('keydown', 192) // corresponds to the tilde character (~)
        };
    });

    describe('ListKeyManager', () => {
        // We have a spy on the `setActiveItem` method of the list key manager. That method has
        // multiple overloads and TypeScript is unable to infer the right parameters when calls are
        // checked using jasmine's `hasBeenCalledWith` matcher. We work around this by explicitly
        // specifying the overload signature that should be used.
        // TODO: remove if https://github.com/DefinitelyTyped/DefinitelyTyped/issues/42455 is solved.
        let keyManager: Omit<ListKeyManager<FakeFocusable>, 'setActiveItem'> & {
            setActiveItem(index: number): void;
        };
        let setActiveItemSpyFn: jest.SpyInstance;

        beforeEach(() => {
            itemList.reset([new FakeFocusable('one'), new FakeFocusable('two'), new FakeFocusable('three')]);
            keyManager = new ListKeyManager<FakeFocusable>(itemList);

            // first item is already focused
            keyManager.setFirstItemActive();

            setActiveItemSpyFn = jest.spyOn(keyManager, 'setActiveItem');
            // spyOn(keyManager, 'setActiveItem').and.callThrough();
        });

        it('should maintain the active item if the amount of items changes', () => {
            expect(keyManager.activeItemIndex).toBe(0);
            expect(keyManager.activeItem!.getLabel()).toBe('one');
            itemList.reset([new FakeFocusable('zero'), ...itemList.toArray()]);
            itemList.notifyOnChanges();

            expect(keyManager.activeItemIndex).toBe(1);
            expect(keyManager.activeItem!.getLabel()).toBe('one');
        });

        xit('should start off the activeItem as null', () => {
            expect(new ListKeyManager([] as any).activeItem).toBeNull();
        });

        xit('should set the activeItem to null if an invalid index is passed in', () => {
            keyManager.setActiveItem(1337);
            expect(keyManager.activeItem).toBeNull();
        });

        describe('Key events', () => {
            it('should emit tabOut when the tab key is pressed', () => {
                const fn = jest.fn();

                keyManager.tabOut.pipe(take(1)).subscribe(fn);
                keyManager.onKeydown(fakeKeyEvents.tab);

                expect(fn).toHaveBeenCalled();
            });

            it('should emit tabOut when the tab key is pressed with a modifier', () => {
                const fn = jest.fn();

                keyManager.tabOut.pipe(take(1)).subscribe(fn);

                Object.defineProperty(fakeKeyEvents.tab, 'shiftKey', { get: () => true });
                keyManager.onKeydown(fakeKeyEvents.tab);

                expect(fn).toHaveBeenCalled();
            });

            it('should emit an event whenever the active item changes', () => {
                const fn = jest.fn();
                const subscription = keyManager.change.subscribe(fn);

                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(fn).toHaveBeenCalledTimes(1);

                keyManager.onKeydown(fakeKeyEvents.upArrow);
                expect(fn).toHaveBeenCalledTimes(2);

                subscription.unsubscribe();
            });

            xit('should emit if the active item changed, but not the active index', () => {
                const fn = jest.fn();
                const subscription = keyManager.change.subscribe(fn);

                keyManager.setActiveItem(0);
                itemList.reset([new FakeFocusable('zero'), ...itemList.toArray()]);
                keyManager.setActiveItem(0);

                expect(fn).toHaveBeenCalledTimes(1);
                subscription.unsubscribe();
            });

            it('should activate the first item when pressing down on a clean key manager', () => {
                keyManager = new ListKeyManager<FakeFocusable>(itemList);

                expect(keyManager.activeItemIndex).toBe(-1);

                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(0);
            });

            it('should not prevent the default keyboard action when pressing tab', () => {
                expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);

                keyManager.onKeydown(fakeKeyEvents.tab);

                expect(fakeKeyEvents.tab.defaultPrevented).toBe(false);
            });

            it('should not do anything for unsupported key presses', () => {
                keyManager.setActiveItem(1);

                expect(keyManager.activeItemIndex).toBe(1);
                expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);

                keyManager.onKeydown(fakeKeyEvents.unsupported);

                expect(keyManager.activeItemIndex).toBe(1);
                expect(fakeKeyEvents.unsupported.defaultPrevented).toBe(false);
            });

            it('should ignore the horizontal keys when only in vertical mode', () => {
                keyManager.withVerticalOrientation().withHorizontalOrientation(null);

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.onKeydown(fakeKeyEvents.rightArrow);

                expect(keyManager.activeItemIndex).toBe(0);
                expect(fakeKeyEvents.rightArrow.defaultPrevented).toBe(false);
            });

            it('should ignore the vertical keys when only in horizontal mode', () => {
                keyManager.withVerticalOrientation(false).withHorizontalOrientation('ltr');

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(0);
                expect(fakeKeyEvents.downArrow.defaultPrevented).toBe(false);
            });

            describe('withHomeAndEnd', () => {
                beforeEach(() => {
                    keyManager.withHomeAndEnd();
                });

                it('should focus the first item when Home is pressed', () => {
                    keyManager.setActiveItem(1);
                    expect(keyManager.activeItemIndex).toBe(1);

                    keyManager.onKeydown(fakeKeyEvents.home);

                    expect(keyManager.activeItemIndex).toBe(0);
                });

                it('should focus the last item when End is pressed', () => {
                    keyManager.setActiveItem(0);
                    expect(keyManager.activeItemIndex).toBe(0);

                    keyManager.onKeydown(fakeKeyEvents.end);
                    keyManager.setActiveItem(itemList.toArray()[2]);
                    expect(keyManager.activeItemIndex).toBe(itemList.length - 1);
                });
            });

            const runDirectionalKeyTests = (context: KeyEventTestContext) => {
                it('should set subsequent items as active when the next key is pressed', () => {
                    keyManager.onKeydown(context.nextKeyEvent);

                    expect(keyManager.activeItemIndex).toBe(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(2);

                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(2);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(2);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                });

                it('should set first item active when the next key is pressed if no active item', () => {
                    keyManager.setActiveItem(-1);
                    keyManager.onKeydown(context.nextKeyEvent);

                    expect(keyManager.activeItemIndex).toBe(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(2);
                });

                it('should set previous items as active when the previous key is pressed', () => {
                    keyManager.onKeydown(context.nextKeyEvent);

                    expect(keyManager.activeItemIndex).toBe(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(1);

                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(0);
                });

                it('should do nothing when the prev key is pressed if no active item and not wrap', () => {
                    keyManager.setActiveItem(-1);
                    keyManager.onKeydown(context.prevKeyEvent);

                    expect(keyManager.activeItemIndex).toBe(-1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(2);
                });

                it('should skip disabled items', () => {
                    const items = itemList.toArray();

                    items[1].disabled = true;
                    itemList.reset(items);

                    // Next event should skip past disabled item from 0 to 2
                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(2);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(1);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(2);

                    // Previous event should skip past disabled item from 2 to 0
                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(1);
                });

                it('should work normally when disabled property does not exist', () => {
                    const items = itemList.toArray();

                    items[0].disabled = undefined;
                    items[1].disabled = undefined;
                    items[2].disabled = undefined;
                    itemList.reset(items);

                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(2);

                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(2);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                    expect(setActiveItemSpyFn).toHaveBeenCalledWith(2);
                });

                it('should not move active item past either end of the list', () => {
                    keyManager.onKeydown(context.nextKeyEvent);
                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(2);

                    // This next event would move active item past the end of the list
                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(2);

                    keyManager.onKeydown(context.prevKeyEvent);
                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(0);

                    // This prev event would move active item past the beginning of the list
                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(0);
                });

                it('should not move active item to end when the last item is disabled', () => {
                    const items = itemList.toArray();

                    items[2].disabled = true;
                    itemList.reset(items);

                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(1);

                    // This next key event would set active item to the last item, which is disabled
                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(keyManager.activeItemIndex).toBe(1);
                    expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(2);
                });

                it('should prevent the default keyboard action of handled events', () => {
                    expect(context.nextKeyEvent.defaultPrevented).toBe(false);
                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(context.nextKeyEvent.defaultPrevented).toBe(true);

                    expect(context.prevKeyEvent.defaultPrevented).toBe(false);
                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(context.prevKeyEvent.defaultPrevented).toBe(true);
                });

                /** Runs the test that asserts that we handle modifier keys correctly. */
                const runModifierKeyTest = (modifier: ListKeyManagerModifierKey) => {
                    const initialActiveIndex = keyManager.activeItemIndex;
                    const fn = jest.fn();
                    const subscription = keyManager.change.subscribe(fn);

                    expect(context.nextKeyEvent.defaultPrevented).toBe(false);
                    expect(context.prevKeyEvent.defaultPrevented).toBe(false);

                    Object.defineProperty(context.nextKeyEvent, modifier, { get: () => true });
                    Object.defineProperty(context.prevKeyEvent, modifier, { get: () => true });

                    keyManager.onKeydown(context.nextKeyEvent);
                    expect(context.nextKeyEvent.defaultPrevented).toBe(false);
                    expect(keyManager.activeItemIndex).toBe(initialActiveIndex);
                    expect(fn).not.toHaveBeenCalled();

                    keyManager.onKeydown(context.prevKeyEvent);
                    expect(context.prevKeyEvent.defaultPrevented).toBe(false);
                    expect(keyManager.activeItemIndex).toBe(initialActiveIndex);
                    expect(fn).not.toHaveBeenCalled();

                    subscription.unsubscribe();
                };

                xit('should not do anything for arrow keys if the alt key is held down', () => {
                    runModifierKeyTest('altKey');
                });

                xit('should not do anything for arrow keys if the control key is held down', () => {
                    runModifierKeyTest('ctrlKey');
                });

                xit('should not do anything for arrow keys if the meta key is held down', () => {
                    runModifierKeyTest('metaKey');
                });

                xit('should not do anything for arrow keys if the shift key is held down', () => {
                    runModifierKeyTest('shiftKey');
                });
            };

            describe('with `vertical` direction', () => {
                const context: KeyEventTestContext = {} as KeyEventTestContext;

                beforeEach(() => {
                    keyManager.withVerticalOrientation();
                    context.nextKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW);
                    context.prevKeyEvent = createKeyboardEvent('keydown', UP_ARROW);
                });

                runDirectionalKeyTests(context);
            });

            describe('with `ltr` direction', () => {
                const context: KeyEventTestContext = {} as KeyEventTestContext;

                beforeEach(() => {
                    keyManager.withHorizontalOrientation('ltr');
                    context.nextKeyEvent = createKeyboardEvent('keydown', RIGHT_ARROW);
                    context.prevKeyEvent = createKeyboardEvent('keydown', LEFT_ARROW);
                });

                runDirectionalKeyTests(context);
            });

            describe('with `rtl` direction', () => {
                const context: KeyEventTestContext = {} as KeyEventTestContext;

                beforeEach(() => {
                    keyManager.withHorizontalOrientation('rtl');
                    context.nextKeyEvent = createKeyboardEvent('keydown', LEFT_ARROW);
                    context.prevKeyEvent = createKeyboardEvent('keydown', RIGHT_ARROW);
                });

                runDirectionalKeyTests(context);
            });
        });

        describe('programmatic focus', () => {
            it('should setActiveItem()', () => {
                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.setActiveItem(1);
                expect(keyManager.activeItemIndex).toBe(1);
            });

            it('should be able to set the active item by reference', () => {
                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.setActiveItem(itemList.toArray()[2]);
                expect(keyManager.activeItemIndex).toBe(2);
            });

            it('should be able to set the active item without emitting an event', () => {
                const fn = jest.fn();
                const subscription = keyManager.change.subscribe(fn);

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.updateActiveItem(2);

                expect(keyManager.activeItemIndex).toBe(2);
                expect(fn).not.toHaveBeenCalled();

                subscription.unsubscribe();
            });

            it('should expose the active item correctly', () => {
                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(1);
                expect(keyManager.activeItem).toBe(itemList.toArray()[1]);

                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(2);
                expect(keyManager.activeItem).toBe(itemList.toArray()[2]);
            });

            it('should setFirstItemActive()', () => {
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(2);

                keyManager.setFirstItemActive();
                expect(keyManager.activeItemIndex).toBe(0);
            });

            it('should set the active item to the second item if the first one is disabled', () => {
                const items = itemList.toArray();

                items[0].disabled = true;
                itemList.reset(items);

                keyManager.setFirstItemActive();
                expect(keyManager.activeItemIndex).toBe(1);
            });

            it('should setLastItemActive()', () => {
                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.setLastItemActive();
                expect(keyManager.activeItemIndex).toBe(2);
            });

            it('should set the active item to the second to last item if the last is disabled', () => {
                const items = itemList.toArray();

                items[2].disabled = true;
                itemList.reset(items);

                keyManager.setLastItemActive();
                expect(keyManager.activeItemIndex).toBe(1);
            });

            it('should setNextItemActive()', () => {
                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.setNextItemActive();
                expect(keyManager.activeItemIndex).toBe(1);
            });

            it('should set the active item to the next enabled item if next is disabled', () => {
                const items = itemList.toArray();

                items[1].disabled = true;
                itemList.reset(items);

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.setNextItemActive();
                expect(keyManager.activeItemIndex).toBe(2);
            });

            it('should setPreviousItemActive()', () => {
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(1);

                keyManager.setPreviousItemActive();
                expect(keyManager.activeItemIndex).toBe(0);
            });

            it('should skip disabled items when setPreviousItemActive() is called', () => {
                const items = itemList.toArray();

                items[1].disabled = true;
                itemList.reset(items);

                keyManager.onKeydown(fakeKeyEvents.downArrow);
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(2);

                keyManager.setPreviousItemActive();
                expect(keyManager.activeItemIndex).toBe(0);
            });

            it('should not emit an event if the item did not change', () => {
                const fn = jest.fn();
                const subscription = keyManager.change.subscribe(fn);

                keyManager.setActiveItem(2);
                keyManager.setActiveItem(2);

                expect(fn).toHaveBeenCalledTimes(1);

                subscription.unsubscribe();
            });
        });

        describe('wrap mode', () => {
            it('should return itself to allow chaining', () => {
                expect(keyManager.withWrap()).toEqual(keyManager);
            });

            it('should wrap focus when arrow keying past items while in wrap mode', () => {
                keyManager.withWrap();
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(2);

                // this down arrow moves down past the end of the list
                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(0);

                // this up arrow moves up past the beginning of the list
                keyManager.onKeydown(fakeKeyEvents.upArrow);
                expect(keyManager.activeItemIndex).toBe(2);
            });

            it('should set last item active when up arrow is pressed if no active item', () => {
                keyManager.withWrap();
                keyManager.setActiveItem(-1);
                keyManager.onKeydown(fakeKeyEvents.upArrow);

                expect(keyManager.activeItemIndex).toBe(2);
                expect(setActiveItemSpyFn).not.toHaveBeenCalledWith(0);
                expect(setActiveItemSpyFn).toHaveBeenCalledWith(2);

                keyManager.onKeydown(fakeKeyEvents.downArrow);
                expect(keyManager.activeItemIndex).toBe(0);
                expect(setActiveItemSpyFn).toHaveBeenCalledWith(0);
            });

            // This test should pass if all items are disabled and the down arrow key got pressed.
            // If the test setup crashes or this test times out, this test can be considered as failed.
            it('should not get into an infinite loop if all items are disabled', () => {
                keyManager.withWrap();
                keyManager.setActiveItem(0);
                const items = itemList.toArray();

                items.forEach((item) => (item.disabled = true));
                itemList.reset(items);

                keyManager.onKeydown(fakeKeyEvents.downArrow);
            });

            it('should be able to disable wrapping', () => {
                keyManager.withWrap();
                keyManager.setFirstItemActive();
                keyManager.onKeydown(fakeKeyEvents.upArrow);

                expect(keyManager.activeItemIndex).toBe(itemList.length - 1);

                keyManager.withWrap(false);
                keyManager.setFirstItemActive();
                keyManager.onKeydown(fakeKeyEvents.upArrow);

                expect(keyManager.activeItemIndex).toBe(0);
            });
        });

        describe('skip predicate', () => {
            it('should skip disabled items by default', () => {
                const items = itemList.toArray();

                items[1].disabled = true;
                itemList.reset(items);

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(2);
            });

            it('should be able to skip items with a custom predicate', () => {
                keyManager.skipPredicate((item) => item.skipItem);

                const items = itemList.toArray();

                items[1].skipItem = true;
                itemList.reset(items);

                expect(keyManager.activeItemIndex).toBe(0);

                keyManager.onKeydown(fakeKeyEvents.downArrow);

                expect(keyManager.activeItemIndex).toBe(2);
            });
        });
    });

    describe('FocusKeyManager', () => {
        let keyManager: FocusKeyManager<FakeFocusable>;
        const focusSpyFn: Record<number, jest.SpyInstance> = {};

        beforeEach(() => {
            itemList.reset([new FakeFocusable(), new FakeFocusable(), new FakeFocusable()]);
            keyManager = new FocusKeyManager<FakeFocusable>(itemList);

            // first item is already focused
            keyManager.setFirstItemActive();

            itemList.toArray().forEach((item, index) => {
                focusSpyFn[index] = jest.spyOn(item, 'focus');
            });
        });

        it('should focus subsequent items when down arrow is pressed', () => {
            keyManager.onKeydown(fakeKeyEvents.downArrow);

            expect(focusSpyFn[0]).not.toHaveBeenCalled();
            expect(focusSpyFn[1]).toHaveBeenCalledTimes(1);
            expect(focusSpyFn[2]).not.toHaveBeenCalled();

            keyManager.onKeydown(fakeKeyEvents.downArrow);
            expect(focusSpyFn[0]).not.toHaveBeenCalled();
            expect(focusSpyFn[1]).toHaveBeenCalledTimes(1);
            expect(focusSpyFn[2]).toHaveBeenCalledTimes(1);
        });

        it('should focus previous items when up arrow is pressed', () => {
            keyManager.onKeydown(fakeKeyEvents.downArrow);

            expect(focusSpyFn[0]).not.toHaveBeenCalled();
            expect(focusSpyFn[1]).toHaveBeenCalledTimes(1);

            keyManager.onKeydown(fakeKeyEvents.upArrow);

            expect(focusSpyFn[0]).toHaveBeenCalledTimes(1);
            expect(focusSpyFn[1]).toHaveBeenCalledTimes(1);
        });

        it('should allow setting the focused item without calling focus', () => {
            expect(keyManager.activeItemIndex).toBe(0);

            keyManager.updateActiveItem(1);
            expect(keyManager.activeItemIndex).toBe(1);
            expect(focusSpyFn[1]).not.toHaveBeenCalledTimes(1);
        });

        it('should be able to set the focus origin', () => {
            keyManager.setFocusOrigin('mouse');

            keyManager.onKeydown(fakeKeyEvents.downArrow);
            expect(focusSpyFn[1]).toHaveBeenCalledWith('mouse');

            keyManager.onKeydown(fakeKeyEvents.downArrow);
            expect(focusSpyFn[2]).toHaveBeenCalledWith('mouse');

            keyManager.setFocusOrigin('keyboard');

            keyManager.onKeydown(fakeKeyEvents.upArrow);
            expect(focusSpyFn[1]).toHaveBeenCalledWith('keyboard');
        });
    });
});
