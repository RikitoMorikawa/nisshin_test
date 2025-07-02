import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorMessagesComponent } from './error-messages/error-messages.component';
import { FileWithPreviewComponent } from './file-with-preview/file-with-preview.component';
import { IconModule } from '../../atoms/icon/icon.module';
import { LabelComponent } from './label/label.component';
import { InputComponent } from './input/input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectComponent } from './select/select.component';
import { TextareaComponent } from './textarea/textarea.component';
import { SelectSuggestComponent } from './select-suggest/select-suggest.component';
import { DateTermComponent } from './date-term/date-term.component';
import { DatepickerModule } from '../../atoms/datepicker/datepicker.module';

@NgModule({
  declarations: [
    ErrorMessagesComponent,
    FileWithPreviewComponent,
    LabelComponent,
    InputComponent,
    SelectComponent,
    TextareaComponent,
    SelectSuggestComponent,
    DateTermComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, IconModule, DatepickerModule],
  exports: [
    InputComponent,
    SelectComponent,
    FileWithPreviewComponent,
    TextareaComponent,
    SelectSuggestComponent,
    DateTermComponent,
  ],
})
export class FormPartsModule {}
