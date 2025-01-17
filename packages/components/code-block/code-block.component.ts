import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { KbqTabChangeEvent, KbqTabGroup } from '@koobiq/components/tabs';
import { Subject, Subscription, fromEvent, merge, pairwise } from 'rxjs';
import { debounceTime, filter, map, startWith, switchMap } from 'rxjs/operators';
import {
    KBQ_CODE_BLOCK_CONFIGURATION,
    KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION,
    KbqCodeBlockConfiguration,
    KbqCodeFile
} from './code-block.types';

export const COPIED_MESSAGE_TOOLTIP_TIMEOUT = 100;
export const DEFAULT_EXTENSION = 'txt';
export const LANGUAGES_EXTENSIONS = {
    html: 'html',
    css: 'css',
    php: 'php',
    java: 'java',
    bash: 'sh',
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    ruby: 'rb',
    c: 'c',
    'c++': 'cpp',
    'c#': 'cs',
    csharp: 'cs',
    lua: 'lua',
    xml: 'xml',
    json: 'json'
};

const actionBarBlockLeftMargin = 24;

const hasScroll = (element: HTMLElement) => {
    const { scrollHeight, scrollWidth, clientHeight, clientWidth } = element;
    return scrollHeight > clientHeight || scrollWidth > clientWidth;
};

@Component({
    selector: 'kbq-code-block',
    exportAs: 'kbqCodeBlock',
    templateUrl: './code-block.component.html',
    styleUrls: ['./code-block.scss', './code-block-tokens.scss'],
    host: {
        class: 'kbq-code-block',
        '[class.kbq-code-block_filled]': 'filled',
        '[class.kbq-code-block_outline]': '!filled',
        '[class.kbq-code-block_hide-line-numbers]': '!lineNumbers',
        '[class.kbq-code-block_single-file]': 'singleFile',
        '[class.kbq-code-block_no-header]': 'noHeader',
        '[class.kbq-code-block_header-with-shadow]': 'isTopOverflow',
        '(window:resize)': 'resizeStream.next($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqCodeBlockComponent implements AfterViewInit, OnDestroy {
    @ViewChild(KbqTabGroup) tabGroup: KbqTabGroup;

    @Input() lineNumbers = true;
    @Input() filled: boolean;
    @Input() maxHeight: number;
    @Input() softWrap: boolean = false;
    @Input() canLoad: boolean = true;
    @Input() get codeFiles(): KbqCodeFile[] {
        return this._codeFiles;
    }

    set codeFiles(files: KbqCodeFile[]) {
        this._codeFiles = files;
        this.hideActionBarIfNoHeader();
        this.subscribeToHover();
    }

    private _codeFiles: KbqCodeFile[];

    // TODO: replace with property
    get noHeader(): any {
        return this.codeFiles.length === 1 && !this.codeFiles[0].filename;
    }

    get singleFile(): boolean {
        return this.codeFiles.length === 1;
    }

    selectedTabIndex = 0;
    copied: boolean = false;
    viewAll: boolean = false;
    multiLine: boolean = false;
    isTopOverflow: boolean = false;
    hasKeyboardFocus: boolean = false;
    /**
     * @docs-private
     */
    actionbarHidden?: boolean;

    /**
     * @docs-private
     */
    config: KbqCodeBlockConfiguration;

    readonly resizeStream = new Subject<Event>();
    readonly currentCodeBlock = new Subject<HTMLElement>();

    private readonly resizeDebounceInterval: number = 100;
    private resizeSubscription = Subscription.EMPTY;
    private codeBlockSubscription = Subscription.EMPTY;
    private hoverSubscription: Subscription | null = null;

    constructor(
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private clipboard: Clipboard,
        private renderer: Renderer2,
        private focusMonitor: FocusMonitor,
        @Optional() @Inject(KBQ_CODE_BLOCK_CONFIGURATION) protected configuration?: KbqCodeBlockConfiguration,
        @Optional() @Inject(KBQ_LOCALE_SERVICE) protected localeService?: KbqLocaleService
    ) {
        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParams);

        if (!this.localeService) {
            this.initDefaultParams();
        }

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateHeader);
    }

    ngAfterViewInit() {
        // render focus border if origin is keyboard
        this.codeBlockSubscription = this.currentCodeBlock
            .pipe(
                startWith(null),
                pairwise(),
                switchMap(([prev, current]) => {
                    if (prev) {
                        this.focusMonitor.stopMonitoring(prev);
                    }

                    return this.focusMonitor.monitor(current!);
                }),
                filter((origin: FocusOrigin) => origin === 'keyboard')
            )
            .subscribe(() => {
                this.hasKeyboardFocus = true;
                this.changeDetectorRef.markForCheck();
            });

        this.hideActionBarIfNoHeader();
        this.subscribeToHover();
        this.currentCodeBlock.next(this.elementRef.nativeElement.querySelector('code'));
    }

    ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
        this.codeBlockSubscription.unsubscribe();
    }

    updateHeader = () => {
        const clientWidth: number = this.elementRef.nativeElement.querySelector('kbq-actionbar-block').clientWidth;

        this.renderer.setStyle(
            this.tabGroup.tabHeader.elementRef.nativeElement,
            'padding-right',
            `${actionBarBlockLeftMargin + clientWidth}px`
        );

        this.changeDetectorRef.markForCheck();
    };

    toggleSoftWrap() {
        this.softWrap = !this.softWrap;
    }

    toggleViewAll() {
        this.viewAll = !this.viewAll;
    }

    downloadCode() {
        const codeFile = this.codeFiles[this.selectedTabIndex];
        const blob = new Blob([codeFile.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', `${this.getFullFileName(codeFile)}`);
        link.click();
    }

    copyCode() {
        this.clipboard.copy(this.codeFiles[this.selectedTabIndex].content);
        this.copied = true;
    }

    openExternalSystem() {
        const externalLink = this.codeFiles[this.selectedTabIndex].link;
        window.open(externalLink, '_blank');
    }

    onHighlighted() {
        setTimeout(this.updateMultiline, 1);
    }

    getMaxHeight(): string {
        return this.maxHeight > 0 && !this.viewAll ? `${this.maxHeight}px` : '';
    }

    onSelectTab($event: KbqTabChangeEvent) {
        this.selectedTabIndex = $event.index;
        this.updateMultiline();
        this.isTopOverflow = false;

        setTimeout(this.updateHeader);
        setTimeout(() => this.currentCodeBlock.next(this.elementRef.nativeElement.querySelector('code')));
    }

    checkOverflow(currentCodeContentElement: HTMLElement) {
        if (this.noHeader) {
            return;
        }
        this.isTopOverflow = currentCodeContentElement.scrollTop > 0;
    }

    onShowMoreClick(currentCodeContentElement: HTMLPreElement) {
        this.toggleViewAll();

        if (this.viewAll) {
            this.showActionBarIfNecessary();
        } else {
            // Should explicitly scroll to top so content will be cropped from the bottom
            currentCodeContentElement?.scroll({ top: 0, behavior: 'instant' });
        }
    }

    // TODO: replace with property to reduce calculations
    canShowFocus(currentCodeContent: HTMLPreElement): boolean {
        const currentCodeBlock = currentCodeContent.querySelector('code')!;

        return (
            (hasScroll(currentCodeContent) || hasScroll(currentCodeBlock)) &&
            ((!!this.maxHeight && this.viewAll) || !this.maxHeight)
        );
    }

    onEnter(currentCodeBlock: HTMLPreElement) {
        // defer execution after toggle view mode
        setTimeout(() => {
            if (this.canShowFocus(currentCodeBlock)) {
                this.focusMonitor.focusVia(currentCodeBlock.querySelector('code')!, 'keyboard');
            }
        }, 0);
    }

    /** @docs-private */
    showActionBarIfNecessary(): void {
        if (!this.actionbarHidden) return;
        this.actionbarHidden = false;
    }

    /** @docs-private */
    hideActionBarIfNoHeader(event?: FocusEvent | null): void {
        if (!this.noHeader) return;
        if (event) {
            this.actionbarHidden = !this.elementRef.nativeElement.contains(event.relatedTarget);
            return;
        }

        this.actionbarHidden = this.noHeader;
    }

    private updateLocaleParams = () => {
        this.config = this.configuration || this.localeService?.getParams('codeBlock');

        this.changeDetectorRef.markForCheck();
    };

    private initDefaultParams() {
        this.config = KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION;
    }

    private updateMultiline = () => {
        this.multiLine = this.elementRef.nativeElement.querySelectorAll('.hljs-ln-numbers').length > 1;

        this.updateHeader();

        this.changeDetectorRef.markForCheck();
    };

    private getFullFileName(codeFile: KbqCodeFile): string {
        const fileName = codeFile.filename || 'code';
        const extension = LANGUAGES_EXTENSIONS[codeFile.language] || DEFAULT_EXTENSION;

        return `${fileName}.${extension}`;
    }

    private subscribeToHover() {
        if (!this.noHeader) {
            this.hoverSubscription?.unsubscribe();
            this.hoverSubscription = null;
            return;
        }
        if (this.hoverSubscription) return;

        this.hoverSubscription = merge(
            fromEvent<FocusEvent>(this.elementRef.nativeElement, 'focusin'),
            fromEvent<FocusEvent>(this.elementRef.nativeElement, 'mouseenter')
        ).subscribe(() => {
            this.showActionBarIfNecessary();
            this.changeDetectorRef.markForCheck();
        });

        const blur = merge(
            fromEvent<FocusEvent>(this.elementRef.nativeElement, 'focusout'),
            fromEvent<FocusEvent>(this.elementRef.nativeElement, 'mouseleave').pipe(map(() => null))
        ).subscribe((event: FocusEvent | null) => {
            if (!this.hasKeyboardFocus) {
                this.hideActionBarIfNoHeader(event);
            }
            this.changeDetectorRef.markForCheck();
        });
        this.hoverSubscription.add(blur);
    }
}
