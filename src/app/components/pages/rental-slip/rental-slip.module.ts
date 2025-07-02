import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RentalSlipRoutingModule } from './rental-slip-routing.module';
import { ListComponent } from './list/list.component';
import { RentalSlipComponent } from './rental-slip.component';
import { DetailComponent } from './detail/detail.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbOrgModule } from '../../organisms/breadcrumb-org/breadcrumb-org.module';
import { SearchModule } from '../../organisms/rental-slip-org/search/search.module';
import { TableModule } from '../../organisms/rental-slip-org/table/table.module';
import { NewRegistrationLinkOrgModule } from '../../organisms/new-registration-link-org/new-registration-link-org.module';
import { LoadingContainerModule } from '../../molecules/loading-container/loading-container.module';
import { CancelLinkOrgModule } from '../../organisms/cancel-link-org/cancel-link-org.module';
import { LastUpdaterOrgModule } from '../../organisms/last-updater-org/last-updater-org.module';
import { SelectSuggestContainerModule } from '../../molecules/select-suggest-container/select-suggest-container.module';
import { DateTermModule } from '../../molecules/date-term/date-term.module';
import { TextContainerModule } from '../../molecules/text-container/text-container.module';
import { TextareaContainerModule } from '../../molecules/textarea-container/textarea-container.module';
import { SelectContainerModule } from '../../molecules/select-container/select-container.module';
import { ButtonModule } from '../../atoms/button/button.module';
import { BackToLinkOrgModule } from '../../organisms/back-to-link-org/back-to-link-org.module';
import { EditLinkOrgModule } from '../../organisms/edit-link-org/edit-link-org.module';
import { BarcodeModule } from '../../atoms/barcode/barcode.module';
import { IconContainerModule } from '../../molecules/icon-container/icon-container.module';
import { SpinnerModule } from '../../atoms/spinner/spinner.module';
import { RealTimeSuggestContainerModule } from '../../molecules/real-time-suggest-container/real-time-suggest-container.module';
import { SearchSuggestContainerModule } from '../../molecules/search-suggest-container/search-suggest-container.module';
import { IconModule } from '../../atoms/icon/icon.module';
import { DatepickerModule } from '../../atoms/datepicker/datepicker.module';
import { SelectModule } from '../../atoms/select/select.module';
import { CommonService } from 'src/app/services/shared/common.service';
import { CheckboxModule } from '../../atoms/checkbox/checkbox.module';
import { DeliveryTableOrgModule } from 'src/app/components/organisms/delivery-table-org/delivery-table-org.module';

@NgModule({
  declarations: [
    ListComponent,
    RentalSlipComponent,
    DetailComponent,
    AddComponent,
    EditComponent,
  ],
  imports: [
    CommonModule,
    RentalSlipRoutingModule,
    ReactiveFormsModule,
    BreadcrumbOrgModule,
    SearchModule,
    TableModule,
    NewRegistrationLinkOrgModule,
    LoadingContainerModule,
    CancelLinkOrgModule,
    LastUpdaterOrgModule,
    SelectSuggestContainerModule,
    DateTermModule,
    TextContainerModule,
    TextareaContainerModule,
    SelectContainerModule,
    ButtonModule,
    BackToLinkOrgModule,
    EditLinkOrgModule,
    BarcodeModule,
    IconContainerModule,
    SpinnerModule,
    RealTimeSuggestContainerModule,
    SearchSuggestContainerModule,
    IconModule,
    DatepickerModule,
    SelectModule,
    CheckboxModule,
    DeliveryTableOrgModule,
  ],
  providers: [CommonService],
})
export class RentalSlipModule {}
