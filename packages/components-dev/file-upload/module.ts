import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import {
    FileValidators,
    KbqDataSizePipe,
    KbqLocaleServiceModule,
    ShowOnFormSubmitErrorStateMatcher
} from '@koobiq/components/core';
import {
    KBQ_FILE_UPLOAD_CONFIGURATION,
    KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
    KbqFileItem,
    KbqFileUploadModule,
    KbqFileValidatorFn
} from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { interval, takeWhile, timer } from 'rxjs';
import { FileUploadExamplesModule } from '../../docs-examples/components/file-upload';
import { DevLocaleSelector } from '../locale-selector';
import { maxFileExceededFiveMbs, maxFileSize } from './validation';

const MAX_FILE_SIZE = 5 * 2 ** 20;

const hintMessage = 'file upload hint';

@Directive({
    standalone: true,
    selector: '[custom-text]',
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useValue: {
                captionText: 'Перетащите сюда или ',
                captionTextWhenSelected: 'Перетащите еще или ',
                captionTextForCompactSize: 'Перетащите файлы или ',
                browseLink: 'выберите',
                title: 'Загрузите фотографии',
                gridHeaders: {
                    file: 'Файл',
                    size: 'Размер'
                }
            }
        }
    ]
})
export class CustomTextDirective {}

@Component({
    standalone: true,
    imports: [FileUploadExamplesModule],
    selector: 'file-upload-examples',
    template: `
        <file-upload-single-with-signal-example />
    `,
    host: {
        class: 'layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
class FileUploadExamplesComponent {}

@Component({
    standalone: true,
    imports: [KbqFileUploadModule, KbqIconModule, KbqFormFieldModule],
    selector: 'file-upload-compact',
    template: `
        <kbq-multiple-file-upload
            [disabled]="disabled"
            [inputId]="'test-compact'"
            [files]="files"
            (fileQueueChanged)="addedFiles($event)"
            size="compact"
        >
            <ng-template #kbqFileIcon>
                <i color="contrast-fade" kbq-icon="kbq-file-o_16"></i>
            </ng-template>
            <kbq-hint>{{ hintMessage }}</kbq-hint>
        </kbq-multiple-file-upload>
    `,
    providers: [
        {
            provide: KBQ_FILE_UPLOAD_CONFIGURATION,
            useValue: {
                ...KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION,
                captionText: KBQ_MULTIPLE_FILE_UPLOAD_DEFAULT_CONFIGURATION.captionTextForCompactSize
            }
        }
    ]
})
export class MultipleFileUploadCompactComponent {
    @Input() disabled: boolean;
    @Input() files: KbqFileItem[] = [];
    @Output() addedFile: EventEmitter<any> = new EventEmitter<any>();

    hintMessage = hintMessage;

    addedFiles(event: KbqFileItem[]) {
        this.addedFile.emit(event);
    }
}

@Component({
    standalone: true,
    imports: [
        FileUploadExamplesComponent,
        FileUploadExamplesModule,
        DevLocaleSelector,
        FileUploadExamplesComponent,
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFileUploadModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqDataSizePipe,
        MultipleFileUploadCompactComponent,
        CustomTextDirective
    ],
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadDev {
    disabled = false;
    validation: KbqFileValidatorFn[] = [maxFileExceededFiveMbs];
    hintMessage = hintMessage;

    file: KbqFileItem | null;
    files: KbqFileItem[] = [];
    filesForDefaultValidation: KbqFileItem[] = [];

    errorMessagesForSingle: string[] = [];
    errorMessages: string[] = [];
    accept = ['.pdf', '.png'];

    control = new FormControl<KbqFileItem | null>(null, FileValidators.maxFileSize(MAX_FILE_SIZE));
    singleFileControl = new FormControl<KbqFileItem | null>(null, FileValidators.maxFileSize(MAX_FILE_SIZE));

    form = new FormGroup(
        {
            'file-upload': new FormControl<KbqFileItem | null>(null, [
                Validators.required,
                FileValidators.maxFileSize(MAX_FILE_SIZE)])
        },
        { updateOn: 'submit' }
    );

    formMultiple = new FormGroup(
        {
            'file-upload': new FormControl<FileList | KbqFileItem[]>([]),
            'file-list': new FormArray<FormControl<KbqFileItem | null>>([])
        },
        { updateOn: 'submit' }
    );
    fileList = new FormArray<FormControl<KbqFileItem | null>>([]);
    fileListOnAddLoad = new FormArray<FormControl<KbqFileItem | null>>([]);

    secondControl = new FormControl<File | KbqFileItem | null>(null);
    multipleFileUploadControl = new FormControl<FileList | KbqFileItem[]>([], maxFileSize);

    get fileListValidationOnSubmit(): FormArray {
        return this.formMultiple.get('file-list') as FormArray;
    }

    private readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: KbqFileItem | null) => {
            // can be used mapped file item
            // this.secondControl.setValue(value);
            // or even JS file object
            this.secondControl.setValue(value?.file || null);
        });

        this.singleFileControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value: KbqFileItem | null) => {
            if (!value || this.singleFileControl.invalid) return;

            this.initLoading();
        });

        this.fileList.statusChanges.subscribe(() => {
            this.fileList.controls.forEach((control: FormControl<KbqFileItem | null>) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });

        this.fileListValidationOnSubmit.statusChanges.subscribe(() => {
            this.fileListValidationOnSubmit.controls.forEach((control) => {
                if (control.invalid) {
                    control.value.hasError = true;
                }
            });
        });

        this.fileListOnAddLoad.statusChanges.subscribe(() => {
            this.fileListOnAddLoad.controls.forEach((control) => {
                if (control?.value && 'hasError' in control.value) {
                    control.value.hasError = control.invalid;
                }
            });
        });
    }

    addFileMultiple(files: KbqFileItem[]) {
        this.files = files;
    }

    checkValidation() {
        this.errorMessagesForSingle = [];

        if (this.file) {
            this.errorMessagesForSingle = this.validation.map((fn) => fn(this.file!.file) || '').filter(Boolean);

            if (this.errorMessagesForSingle.length) {
                this.file = { ...this.file, hasError: true };
            }
        }

        this.cdr.markForCheck();
    }

    onSubmit() {
        this.fileListValidationOnSubmit.controls.forEach((control) => {
            control.setValidators(FileValidators.maxFileSize(MAX_FILE_SIZE));
            control.updateValueAndValidity();
        });
    }

    toggleDisabled() {
        this.disabled = !this.disabled;
        [this.control, this.secondControl, this.form, this.formMultiple, this.multipleFileUploadControl].forEach(
            (control) => (control.enabled ? control.disable() : control.enable())
        );
    }

    startLoading(): void {
        const maxPercent = 100;
        const loadingOffset = 100;

        this.file?.loading?.next(true);

        interval(loadingOffset)
            .pipe(takeWhile((value) => value <= maxPercent))
            .subscribe((value) => this.file?.progress?.next(value));

        this.files.forEach((file, index) => {
            file.loading?.next(true);

            timer(loadingOffset * index, loadingOffset * index)
                .pipe(takeWhile((value) => value <= maxPercent))
                .subscribe((value) => file.progress?.next(value));
        });
    }

    startIndeterminateLoading() {
        this.files.forEach((file) => timer(300).subscribe(() => file.loading?.next(true)));

        timer(5000).subscribe(() => this.files.forEach((file) => file.loading?.next(false)));
    }

    initLoading() {
        const file = this.singleFileControl.value;

        file?.loading?.next(true);

        timer(5000).subscribe(() => file?.loading?.next(false));
    }

    initLoadingForMultiple() {
        const files: KbqFileItem[] = [];

        for (const file of files) {
            file?.loading?.next(true);
        }

        timer(5000).subscribe(() => {
            for (const file of files) {
                file?.loading?.next(false);
            }
        });
    }

    onFileRemoved([
        _,
        index
    ]: [
        KbqFileItem,
        number
    ]) {
        this.fileListValidationOnSubmit.removeAt(index);
        this.fileList.removeAt(index);
        this.fileListOnAddLoad.removeAt(index);
    }

    onFilesAddedForListWithLoadOnAdd($event: KbqFileItem[]) {
        for (const fileItem of $event.slice()) {
            this.fileListOnAddLoad.push(new FormControl(fileItem, FileValidators.maxFileSize(MAX_FILE_SIZE)));
        }

        this.initLoadingForMultiple();
    }

    onFilesAdded($event: KbqFileItem[]) {
        for (const fileItem of $event.slice()) {
            this.fileListValidationOnSubmit.push(new FormControl(fileItem));
        }
    }

    onFileQueueChange($event: KbqFileItem[]) {
        this.filesForDefaultValidation = $event.slice();

        this.errorMessages = [];

        for (const fileItem of this.filesForDefaultValidation) {
            const validationResult = maxFileExceededFiveMbs(fileItem.file);

            if (validationResult) {
                fileItem.hasError = true;
                this.errorMessages.push(`${fileItem.file.name} - maxFileSize`);
            }
        }
    }

    protected readonly showOnFormSubmitErrorStateMatcher = new ShowOnFormSubmitErrorStateMatcher();
}
