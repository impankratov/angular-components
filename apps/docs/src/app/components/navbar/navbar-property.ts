import { inject } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { Observable, ReplaySubject } from 'rxjs';

export interface DocsNavbarPropertyParameters {
    // name of local storage property
    property: string;
    // data array for dropdown
    data: any[];

    updateSelected?: boolean;
}

export interface DocsNavbarPropertyChange {
    name: string;
    value: any;
}

export class DocsNavbarProperty {
    get data(): any[] {
        return this._data;
    }

    private _data: any[];

    get currentValue(): any {
        return this._currentValue;
    }

    private _currentValue!: any;

    get changes(): Observable<DocsNavbarPropertyChange> {
        return this._changes;
    }

    private _changes = new ReplaySubject<DocsNavbarPropertyChange>(1);

    private readonly window = inject(KBQ_WINDOW);

    constructor(readonly parameters: DocsNavbarPropertyParameters) {
        this._data = parameters.data;

        const index =
            parseInt(this.window.localStorage.getItem(this.parameters.property) || '') ||
            this.data.findIndex((item) => item.selected);

        this.setValue(index >= 0 ? index : 0);
    }

    setValue(index: number): void {
        if (this.currentValue === this.data[index]) {
            return;
        }

        this._currentValue = this.data[index];
        this.window.localStorage.setItem(this.parameters.property, index.toString());

        this._changes.next({ name: 'setValue', value: this.currentValue });

        if (this.parameters.updateSelected) {
            this.updateSelectedValues(index);
        }
    }

    private updateSelectedValues(index: number): void {
        if (this.data[index]) {
            this.data.forEach((item) => (item.selected = false));
            this.data[index].selected = true;

            this._changes.next({ name: 'updateSelectedValues', value: this.currentValue });
        }
    }
}
