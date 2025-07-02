import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DetailComponent } from './detail/detail.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { ListComponent } from './list/list.component';
import { TextContainerModule } from 'src/app/components/molecules/text-container/text-container.module';
import { TemplateModule } from '../template/template.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';

@NgModule({
  declarations: [
    DetailComponent,
    AddEditComponent,
    BulkAddComponent,
    ListComponent,
  ],
  imports: [
    CommonModule,
    TemplateModule,
    FormPartsModule,
    CustomTagFormModule,
    IconContainerModule,
    DateTermClearContainerModule,
    TextContainerModule,
  ],
})
export class ClientModule {}
