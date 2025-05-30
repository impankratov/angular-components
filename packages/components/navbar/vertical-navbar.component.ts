import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    contentChildren,
    ContentChildren,
    effect,
    ElementRef,
    forwardRef,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { DOWN_ARROW, isHorizontalMovement, isVerticalMovement, TAB, UP_ARROW } from '@koobiq/cdk/keycodes';
import { Subject } from 'rxjs';
import { KbqNavbarBento, KbqNavbarItem, KbqNavbarRectangleElement } from './navbar-item.component';
import { KbqFocusableComponent } from './navbar.component';

@Component({
    selector: 'kbq-vertical-navbar',
    exportAs: 'KbqVerticalNavbar',
    template: `
        <div class="kbq-vertical-navbar__container" [class.kbq-collapsed]="!expanded" [class.kbq-expanded]="expanded">
            <ng-content select="[kbq-navbar-container], kbq-navbar-container" />
            <ng-content select="[kbq-navbar-toggle], kbq-navbar-toggle" />
        </div>
    `,
    styleUrls: [
        './vertical-navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss',
        './navbar-tokens.scss'
    ],
    host: {
        class: 'kbq-vertical-navbar',
        '[class.kbq-vertical-navbar_open-over]': 'openOver',
        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqVerticalNavbar extends KbqFocusableComponent implements AfterContentInit {
    rectangleElements = contentChildren(
        forwardRef(() => KbqNavbarRectangleElement),
        { descendants: true }
    );

    @ContentChildren(forwardRef(() => KbqNavbarItem), { descendants: true }) items: QueryList<KbqNavbarItem>;

    @ContentChild(forwardRef(() => KbqNavbarBento)) bento: KbqNavbarBento;

    readonly animationDone: Subject<void> = new Subject();

    @Input() openOver: boolean = false;

    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    constructor(
        protected elementRef: ElementRef,
        changeDetectorRef: ChangeDetectorRef,
        focusMonitor: FocusMonitor
    ) {
        super(changeDetectorRef, elementRef, focusMonitor);

        this.animationDone.subscribe(this.updateTooltipForItems);

        effect(() => this.setItemsVerticalStateAndUpdateExpandedState(this.rectangleElements()));
    }

    ngAfterContentInit(): void {
        this.updateTooltipForItems();

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    toggle(): void {
        this.expanded = !this.expanded;

        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

        if (
            !(event.target as HTMLElement).attributes.getNamedItem('kbqinput') &&
            (isVerticalMovement(event) || isHorizontalMovement(event))
        ) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        } else {
            this.keyManager.onKeydown(event);
        }
    }

    private updateExpandedStateForItems = () => this.rectangleElements().forEach(this.updateItemExpandedState);

    private updateTooltipForItems = () => this.items.forEach((item) => item.updateTooltip());

    private setItemsVerticalStateAndUpdateExpandedState = (rectangleElements: Readonly<KbqNavbarRectangleElement[]>) =>
        rectangleElements.forEach(this.setItemVerticalStateAndUpdateExpandedState);

    private setItemVerticalStateAndUpdateExpandedState = (item: KbqNavbarRectangleElement): void => {
        queueMicrotask(() => this.setItemVerticalState(item));
        this.updateItemExpandedState(item);
    };

    private setItemVerticalState = (item: KbqNavbarRectangleElement): void => {
        item.vertical = true;
    };

    private updateItemExpandedState = (item: KbqNavbarRectangleElement): void => {
        item.collapsed = !this.expanded;
        setTimeout(() => item.button?.updateClassModifierForIcons());
    };
}
