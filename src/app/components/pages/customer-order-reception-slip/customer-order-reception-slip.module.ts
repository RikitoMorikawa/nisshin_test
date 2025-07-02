import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerOrderReceiptRoutingModule } from './customer-order-reception-slip-routing.module';

import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { TableModule } from '../../organisms/customer-order-reception-slip-org/table/table.module';
import { SearchModule } from '../../organisms/customer-order-reception-slip-org/search/search.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { DeleteLinkOrgModule } from '../../organisms/delete-link-org/delete-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { DateClearContainerModule } from '../../molecules/date-clear-container/date-clear-container.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { TextModule } from '../../atoms/text/text.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { InputContainerModule } from '../../molecules/input-container/input-container.module';
import { BarcodeModule } from '../../atoms/barcode/barcode.module';

import { CustomerOrderReceptionSlipComponent } from './customer-order-reception-slip.component';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { DetailComponent } from './detail/detail.component';
import { EditComponent } from './edit/edit.component';
import { ExportPdfOrgModule } from '../../organisms/export-pdf-org/export-pdf-org.module';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { SharedModule } from 'src/app/modules/shared.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { DeliveryTableOrgModule } from 'src/app/components/organisms/delivery-table-org/delivery-table-org.module';

@NgModule({
  declarations: [
    CustomerOrderReceptionSlipComponent,
    ListComponent,
    AddComponent,
    DetailComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    CustomerOrderReceiptRoutingModule,
    BreadcrumbOrgModule,
    SearchModule,
    NewRegistrationLinkOrgModule,
    TableModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    ReactiveFormsModule,
    SelectSuggestContainerModule,
    ButtonModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    DeleteLinkOrgModule,
    IconContainerModule,
    TextContainerModule,
    SpinnerModule,
    SelectContainerModule,
    DateTermModule,
    TextareaContainerModule,
    InputContainerModule,
    BarcodeModule,
    TextModule,
    ExportPdfOrgModule,
    RealTimeSuggestContainerModule,
    SharedModule,
    IconModule,
    DeliveryTableOrgModule,
  ],
  providers: [CommonService],
})
export class CustomerOrderReceptionSlipModule {}
