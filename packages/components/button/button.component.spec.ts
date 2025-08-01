import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { leftIconClassName, rightIconClassName, ThemePalette } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { buttonLeftIconClassName, buttonRightIconClassName, KbqButtonCssStyler, KbqButtonModule } from './index';

describe('KbqButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqDropdownModule, NoopAnimationsModule],
            declarations: [TestApp, ButtonDropdownTrigger]
        }).compileComponents();
    });

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));
        const aDebugElement = fixture.debugElement.query(By.css('a'));

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);

        testComponent.buttonColor = null;
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList).not.toContain('kbq-accent');
        expect(aDebugElement.nativeElement.classList).not.toContain('kbq-accent');
    });

    it('should should not clear previous defined classes', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.classList.add('custom-class');

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(false);
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    describe('button[kbq-button]', () => {
        it('should handle a click on the button', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            buttonDebugElement.nativeElement.click();
            expect(testComponent.clickCount).toBe(1);
        });

        it('should not increment if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();

            expect(testComponent.clickCount).toBe(0);
        });

        it('should disable the native button element', () => {
            const fixture = TestBed.createComponent(TestApp);
            const buttonNativeElement = fixture.nativeElement.querySelector('button');

            expect(buttonNativeElement.disabled).toBeFalsy();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            expect(buttonNativeElement.disabled).toBeTruthy();
        });
    });

    describe('a[kbq-button]', () => {
        it('should not redirect if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('.kbq-button-overlay'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();
        });

        it('should remove tabindex if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('a'));

            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe(null);

            testComponent.isDisabled = true;
            fixture.detectChanges();
            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe('-1');
        });
    });

    it('should set .kbq-active class when button with associated dropdown clicked', () => {
        const fixture: ComponentFixture<ButtonDropdownTrigger> = TestBed.createComponent(ButtonDropdownTrigger);

        fixture.detectChanges();
        const buttonDebugElement = fixture.componentInstance;

        dispatchFakeEvent(buttonDebugElement.trigger.nativeElement, 'click');
        fixture.detectChanges();
        expect(buttonDebugElement.trigger.nativeElement.classList.contains('kbq-active')).toBeTruthy();
    });

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });
});

describe('Button with icon', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqIconModule],
            declarations: [
                KbqButtonCommentCaseTestApp,
                KbqButtonHtmlIconLeftCaseTestApp,
                KbqButtonHtmlIconRightCaseTestApp,
                KbqButtonTextIconCaseTestApp,
                KbqButtonTextIconLeftNgIfCaseTestApp,
                KbqButtonTextIconRightNgIfCaseTestApp,
                KbqButtonTextIconLeftRightNgIfCaseTestApp,
                KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp,
                KbqButtonTwoIconsCaseTestApp,
                KbqButtonIconNgIfCaseTestApp
            ]
        }).compileComponents();
    });

    it('should not add left and right css classes when next/previous siblings are html comments or text nodes', () => {
        let fixture: ComponentFixture<KbqButtonCommentCaseTestApp | KbqButtonTextIconCaseTestApp>;

        [KbqButtonCommentCaseTestApp, KbqButtonTextIconCaseTestApp].forEach((comp) => {
            fixture = TestBed.createComponent(comp);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css(`.${leftIconClassName}`))).toBeNull();
            expect(fixture.debugElement.query(By.css(`.${rightIconClassName}`))).toBeNull();

            expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeNull();
            expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeNull();
        });
    });

    it('should add left and right css classes for left and right icons correspondingly for 2 icons in the button', () => {
        const fixture = TestBed.createComponent(KbqButtonTwoIconsCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`#icon1.${leftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon1.${rightIconClassName}`))).toBeNull();

        expect(fixture.debugElement.query(By.css(`#icon2.${rightIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon2.${leftIconClassName}`))).toBeNull();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).not.toBeNull();
    });

    it('should add right css class when the previous sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconRightCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();
    });

    it('should add left css class when the next sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconLeftCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should add left css class when the right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should NOT add left,right css class when the left,right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });
    it('should NOT add left,right css class when the more than 1 siblings on the left,right and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should toggle host button class type on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonIconNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeFalsy();

        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeFalsy();
            expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
            done();
        });
    });

    it('should toggle additional classes on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains(buttonLeftIconClassName)).toBeTruthy();
        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains(buttonLeftIconClassName)).toBeFalsy();
            done();
        });
    });

    it('should toggle additional classes on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonTextIconRightNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains(buttonRightIconClassName)).toBeTruthy();
        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains(buttonRightIconClassName)).toBeFalsy();
            done();
        });
    });
});

@Component({
    selector: 'test-app',
    template: `
        <button kbq-button type="button" [color]="buttonColor" [disabled]="isDisabled" (click)="increment()"></button>
        <a href="#" kbq-button [color]="buttonColor" [disabled]="isDisabled" (click)="increment()"></a>
    `
})
class TestApp {
    clickCount: number = 0;
    isDisabled: boolean = false;
    buttonColor: ThemePalette;

    increment() {
        this.clickCount++;
    }
}

@Component({
    selector: 'kbq-button-comment-case-test-app',
    template: `
        <button kbq-button type="button">
            <!-- comment-before -->
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            <!-- comment-after -->
        </button>
    `
})
class KbqButtonCommentCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    template: `
        <button kbq-button type="button">
            <span>Some text</span>
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonHtmlIconRightCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    template: `
        <button kbq-button type="button">
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            <span>Some text</span>
        </button>
    `
})
class KbqButtonHtmlIconLeftCaseTestApp {
    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            Some text
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            Some text
        </button>
    `
})
class KbqButtonTextIconCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            Some text
        </button>
    `
})
class KbqButtonTextIconLeftNgIfCaseTestApp {
    visible = true;

    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            Some text
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
        </button>
    `
})
class KbqButtonTextIconRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            Some text
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            Some text
        </button>
    `
})
class KbqButtonTextIconLeftRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            <span>Some text</span>
            <span>Some text</span>
            <span>Some text</span>
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            <span>Some text</span>
            <span>Some text</span>
            <span>Some text</span>
        </button>
    `
})
class KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-comment-case-test-app',
    template: `
        <button kbq-button type="button">
            <i id="icon1" kbq-icon="kbq-chevron-down-s_16"></i>
            <i id="icon2" kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonTwoIconsCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button kbq-button type="button">
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
        </button>
    `
})
class KbqButtonIconNgIfCaseTestApp {
    visible = true;
}

@Component({
    template: `
        <button #triggerEl kbq-button [kbqDropdownTriggerFor]="dropdown">Toggle dropdown</button>
        <kbq-dropdown
            #dropdown="kbqDropdown"
            class="custom-one custom-two"
            [backdropClass]="backdropClass"
            [hasBackdrop]="true"
        >
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class ButtonDropdownTrigger {
    @ViewChild('triggerEl', { static: false, read: ElementRef }) trigger: ElementRef;
    backdropClass: string;
}
