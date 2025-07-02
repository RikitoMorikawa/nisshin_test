import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { TemplateModule } from '../template/template.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { DetailComponent } from './detail/detail.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { SelectSuggestContainerModule } from 'src/app/components/molecules/select-suggest-container/select-suggest-container.module';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { ButtonModule } from 'src/app/components/atoms/button/button.module';

@NgModule({
  declarations: [
    ListComponent,
    DetailComponent,
    BulkAddComponent,
    AddEditComponent,
  ],
  imports: [
    CommonModule,
    TemplateModule,
    FormPartsModule,
    CustomTagFormModule,
    SelectSuggestContainerModule,
    RealTimeSuggestContainerModule,
    ButtonModule,
  ],
})
export class ProductModule {}
