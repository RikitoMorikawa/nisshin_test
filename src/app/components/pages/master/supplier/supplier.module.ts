import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TemplateModule } from '../template/template.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { DetailComponent } from './detail/detail.component';
import { IconContainerModule } from 'src/app/components/molecules/icon-container/icon-container.module';
import { AddEditComponent } from './add-edit/add-edit.component';
import { CustomTagFormModule } from 'src/app/components/organisms/custom-tag-form/custom-tag-form.module';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { MasterRoutingModule } from '../master-routing.module';

@NgModule({
  declarations: [
    ListComponent,
    DetailComponent,
    AddEditComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TemplateModule,
    FormPartsModule,
    IconContainerModule,
    CustomTagFormModule,
    MasterRoutingModule,
  ],
})
export class SupplierModule {}
