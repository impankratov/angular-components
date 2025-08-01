import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_SCROLLBAR_CONFIG,
    KbqScrollbarEvents,
    KbqScrollbarModule,
    KbqScrollbarOptions
} from '@koobiq/components/scrollbar';

@Component({
    standalone: true,
    imports: [KbqScrollbarModule],
    selector: 'dev-scrollbar-with-options',
    template: `
        <h4>ScrollbarWithOptions:</h4>
        <kbq-scrollbar style="width: 200px; height: 200px;" [options]="options">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </kbq-scrollbar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevScrollbarWithOptions {
    readonly options: KbqScrollbarOptions = {
        scrollbars: {
            autoHide: 'never'
        }
    };
    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);
}

@Component({
    standalone: true,
    selector: 'dev-scrollbar-with-custom-config',
    imports: [KbqScrollbarModule],
    providers: [
        {
            provide: KBQ_SCROLLBAR_CONFIG,
            useValue: {
                scrollbars: {
                    autoHide: 'never'
                }
            } satisfies KbqScrollbarOptions
        }
    ],
    template: `
        <h4>ScrollbarWithCustomConfig:</h4>
        <div kbq-scrollbar style="width: 200px; height: 200px;">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevScrollbarWithCustomConfig {
    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);
}

@Component({
    standalone: true,
    selector: 'dev-scrollbar-scroll-to-top',
    imports: [
        KbqScrollbarModule,
        KbqButtonModule
    ],
    template: `
        <h4>ScrollbarScrollToTop:</h4>
        <kbq-scrollbar #scrollbarRef="kbqScrollbar" style="width: 200px; height: 200px;" (onScroll)="onScroll($event)">
            @for (item of items; track item) {
                <div>{{ item }}</div>
                <hr />
            }
        </kbq-scrollbar>
        <button
            kbq-button
            [disabled]="!(scrollbarRef?.contentElement?.nativeElement?.scrollTop || 0 > 0)"
            (click)="scrollbarRef.scrollTo({ top: 0, behavior: 'smooth' })"
        >
            Scroll To Top
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevScrollbarScrollToTop {
    readonly items = Array.from({ length: 1000 }).map((_, i) => `Item #${i}`);

    onScroll(event): void {
        console.log('onScroll', event);
    }
}

@Component({
    standalone: true,
    imports: [
        KbqScrollbarModule,
        KbqButtonModule,

        // components
        DevScrollbarWithOptions,
        DevScrollbarWithCustomConfig,
        DevScrollbarScrollToTop
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    options: KbqScrollbarOptions;
    events: KbqScrollbarEvents = {
        initialized: (...args) => this.onInitialize(args)
    };

    onScroll([instance, args]) {
        console.log('onScroll', instance, args);
    }

    onInitialize($event) {
        console.log($event);
    }

    longText: string = `Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Pellentesque in ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                    Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla porttitor accumsan tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec rutrum congue leo eget malesuada.
                    Proin eget tortor risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor lectus nibh.
                    Donec sollicitudin molestie malesuada. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Donec sollicitudin molestie malesuada.
                    Proin eget tortor risus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.
                    Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Pellentesque in ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                    Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla porttitor accumsan tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec rutrum congue leo eget malesuada.
                    Proin eget tortor risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor lectus nibh.
                    Donec sollicitudin molestie malesuada. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Donec sollicitudin molestie malesuada.
                    Proin eget tortor risus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.
                    Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Pellentesque in ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                    Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla porttitor accumsan tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Donec rutrum congue leo eget malesuada.
                    Proin eget tortor risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porttitor lectus nibh.
                    Donec sollicitudin molestie malesuada. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Donec sollicitudin molestie malesuada.
                    Proin eget tortor risus. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula.
                    `;
}
