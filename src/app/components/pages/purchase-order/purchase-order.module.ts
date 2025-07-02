import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseOrderComponent } from './purchase-order.component';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';

import { ReactiveFormsModule } from '@angular/forms';
import { PurchaseOrderRoutingModule } from './purchase-order-routing.module';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { TableModule } from '../../organisms/purchase-order-org/table/table.module';
import { SearchModule } from '../../organisms/purchase-order-org/search/search.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { DateClearContainerModule } from '../../molecules/date-clear-container/date-clear-container.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { InspectionComponent } from './inspection/inspection.component';
import { TextModule } from '../../atoms/text/text.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { OrderDataCreationComponent } from './order-data-creation/order-data-creation.component';
import { CheckboxModule } from '../../atoms/checkbox/checkbox.module';

@NgModule({
  declarations: [
    PurchaseOrderComponent,
    ListComponent,
    AddComponent,
    DetailComponent,
    EditComponent,
    InspectionComponent,
    OrderDataCreationComponent,
  ],
  imports: [
    CommonModule,
    PurchaseOrderRoutingModule,
    BreadcrumbOrgModule,
    NewRegistrationLinkOrgModule,
    TableModule,
    SearchModule,
    BackToLinkOrgModule,
    DeleteLinkOrgModule,
    LastUpdaterOrgModule,
    LoadingContainerModule,
    SelectContainerModule,
    ButtonModule,
    CancelLinkOrgModule,
    ReactiveFormsModule,
    DateClearContainerModule,
    EditLinkOrgModule,
    DateTermModule,
    TextContainerModule,
    SpinnerModule,
    IconContainerModule,
    TextModule,
    TextareaContainerModule,
    RealTimeSuggestContainerModule,
    SelectSuggestContainerModule,
    CheckboxModule,
  ],
  providers: [CommonService],
})
export class PurchaseOrderModule {}
