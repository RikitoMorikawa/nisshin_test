import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientWorkingFieldComponent } from './client-working-field.component';
import { ClientWorkingFieldRoutingModule } from './client-working-field-routing.module';
import { ListComponent } from './list/list.component';
import { BreadcrumbOrgModule } from 'src/app/components/organisms/breadcrumb-org/breadcrumb-org.module';
import { LoadingContainerModule } from 'src/app/components/molecules/loading-container/loading-container.module';
import { TemplateModule } from '../../master/template/template.module';
import { FormPartsModule } from 'src/app/components/organisms/form-parts/form-parts.module';
import { DateTermClearContainerModule } from 'src/app/components/molecules/date-term-clear-container/date-term-clear-container.module';
import { DetailComponent } from './detail/detail.component';
import { AddEditComponent } from './add-edit/add-edit.component';
import { BulkAddComponent } from './bulk-add/bulk-add.component';
import { RealTimeSuggestContainerModule } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    ClientWorkingFieldComponent,
    ListComponent,
    DetailComponent,
    AddEditComponent,
    BulkAddComponent,
  ],
  imports: [
    CommonModule,
    ClientWorkingFieldRoutingModule,
    BreadcrumbOrgModule,
    LoadingContainerModule,
    TemplateModule,
    FormPartsModule,
    DateTermClearContainerModule,
    RealTimeSuggestContainerModule,
  ],
  providers: [CommonService],
})
export class ClientWorkingFieldModule {}
