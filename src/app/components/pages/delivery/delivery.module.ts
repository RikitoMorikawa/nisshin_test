import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryComponent } from './delivery.component';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DeliveryDetailComponent } from './delivery-detail/delivery-detail.component';
import { DeliveryEditComponent } from './delivery-edit/delivery-edit.component';
import { DeliveryAddComponent } from './delivery-add/delivery-add.component';

import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchModule } from './delivery-list/search/search.module';
import { TableModule } from './delivery-list/table/table.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { ExportLinkOrgModule } from '../../organisms/export-link-org/export-link-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { CommonService } from 'src/app/services/shared/common.service';

@NgModule({
  declarations: [
    DeliveryComponent,
    DeliveryListComponent,
    DeliveryDetailComponent,
    DeliveryEditComponent,
    DeliveryAddComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DeliveryRoutingModule,
    BreadcrumbOrgModule,
    SearchModule,
    TableModule,
    NewRegistrationLinkOrgModule,
    ExportLinkOrgModule,
    LoadingContainerModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    CancelLinkOrgModule,
    ButtonModule,
    TextContainerModule,
    SelectContainerModule,
    TextareaContainerModule,
    DateTermModule,
    SpinnerModule,
  ],
  providers: [CommonService],
})
export class DeliveryModule {}
