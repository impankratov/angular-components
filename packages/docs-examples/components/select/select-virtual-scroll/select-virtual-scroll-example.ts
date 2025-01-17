import { ListRange } from '@angular/cdk/collections';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, ViewChild } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

export const OPTIONS = [
    'Abakan',
    'Almetyevsk',
    'Anadyr',
    'Anapa',
    'Arkhangelsk',
    'Astrakhan',
    'Barnaul',
    'Belgorod',
    'Beslan',
    'Biysk',
    'Birobidzhan',
    'Blagoveshchensk',
    'Bologoye',
    'Bryansk',
    'Veliky Novgorod',
    'Veliky Ustyug',
    'Vladivostok',
    'Vladikavkaz',
    'Vladimir',
    'Volgograd',
    'Vologda',
    'Vorkuta',
    'Voronezh',
    'Gatchina',
    'Gdov',
    'Gelendzhik',
    'Gorno-Altaysk',
    'Grozny',
    'Gudermes',
    'Gus-Khrustalny',
    'Dzerzhinsk',
    'Dmitrov',
    'Dubna',
    'Yeysk',
    'Yekaterinburg',
    'Yelabuga',
    'Yelets',
    'Yessentuki',
    'Zlatoust',
    'Ivanovo',
    'Izhevsk',
    'Irkutsk',
    'Yoshkar-Ola',
    'Kazan',
    'Kaliningrad',
    'Kaluga',
    'Kemerovo',
    'Kislovodsk',
    'Komsomolsk-on-Amur',
    'Kotlas',
    'Krasnodar',
    'Krasnoyarsk',
    'Kurgan',
    'Kursk',
    'Kyzyl',
    'Leninogorsk',
    'Lensk',
    'Lipetsk',
    'Luga',
    'Lyuban',
    'Lyubertsy',
    'Magadan',
    'Maykop',
    'Makhachkala',
    'Miass',
    'Mineralnye Vody',
    'Mirny',
    'Moscow',
    'Murmansk',
    'Murom',
    'Mytishchi',
    'Naberezhnye Chelny',
    'Nadym',
    'Nalchik',
    'Nazran',
    'Naryan-Mar',
    'Nakhodka',
    'Nizhnevartovsk',
    'Nizhnekamsk',
    'Nizhny Novgorod',
    'Nizhny Tagil',
    'Novokuznetsk',
    'Novosibirsk',
    'Novy Urengoy',
    'Norilsk',
    'Obninsk',
    'Oktyabrsky',
    'Omsk',
    'Orenburg',
    'Orekhovo-Zuyevo',
    'Oryol',
    'Penza',
    'Perm',
    'Petrozavodsk',
    'Petropavlovsk-Kamchatsky',
    'Podolsk',
    'Pskov',
    'Pyatigorsk',
    'Rostov-on-Don',
    'Rybinsk',
    'Ryazan',
    'Salekhard',
    'Samara',
    'Saint Petersburg',
    'Saransk',
    'Saratov',
    'Severodvinsk',
    'Smolensk',
    'Sol-Iletsk',
    'Sochi',
    'Stavropol',
    'Surgut',
    'Syktyvkar',
    'Tambov',
    'Tver',
    'Tobolsk',
    'Tolyatti',
    'Tomsk',
    'Tuapse',
    'Tula',
    'Tynda',
    'Tyumen',
    'Ulan-Ude',
    'Ulyanovsk',
    'Ufa',
    'Khabarovsk',
    'Khanty-Mansiysk',
    'Chebarkul',
    'Cheboksary',
    'Chelyabinsk',
    'Cherepovets',
    'Cherkessk',
    'Chistopol',
    'Chita',
    'Shadrinsk',
    'Shatura',
    'Shuya',
    'Elista',
    'Engels',
    'Yuzhno-Sakhalinsk',
    'Yakutsk',
    'Yaroslavl'
];

/**
 * @title Select virtual scroll
 */
@Component({
    standalone: true,
    selector: 'select-virtual-scroll-example',
    imports: [KbqFormFieldModule, KbqSelectModule, ScrollingModule],
    template: `
        <kbq-form-field>
            <kbq-select (openedChange)="openedChange($event)">
                <kbq-cleaner #kbqSelectCleaner />

                <cdk-virtual-scroll-viewport
                    [itemSize]="32"
                    [maxBufferPx]="400"
                    [minBufferPx]="100"
                >
                    <kbq-option
                        *cdkVirtualFor="let option of options; templateCacheSize: 0"
                        [value]="option"
                    >
                        {{ option }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>
            </kbq-select>
        </kbq-form-field>
    `
})
export class SelectVirtualScrollExample {
    options: string[] = OPTIONS.sort();

    initialRange: ListRange = { start: 0, end: 7 } as unknown as ListRange;

    @ViewChild(CdkVirtualScrollViewport) cdkVirtualScrollViewport: CdkVirtualScrollViewport;

    openedChange(opened: boolean) {
        if (opened) {
            return;
        }

        this.cdkVirtualScrollViewport.setRenderedContentOffset(0);
        this.cdkVirtualScrollViewport.setRenderedRange(this.initialRange);
    }
}
